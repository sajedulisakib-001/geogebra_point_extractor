const loopMode = document.getElementById("loopMode");
const customBox = document.getElementById("customBox");
const loopLimit = document.getElementById("loopLimit");
const skippedPoints = document.getElementById("skippedPoints");
const output = document.getElementById("output");
const getData = document.getElementById("getData");
const status = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");

loopMode.addEventListener("change", () => {
  customBox.classList.toggle("hidden", loopMode.value !== "custom");
});

async function loadSettings() {
  const data = await chrome.storage.local.get([
    "loopMode",
    "loopLimit",
    "skippedPoints"
  ]);

  if (data.loopMode) loopMode.value = data.loopMode;
  if (data.loopLimit) loopLimit.value = data.loopLimit;
  if (data.skippedPoints) skippedPoints.value = data.skippedPoints;

  customBox.classList.toggle("hidden", loopMode.value !== "custom");
}

async function saveSettings() {
  await chrome.storage.local.set({
    loopMode: loopMode.value,
    loopLimit: Number(loopLimit.value),
    skippedPoints: skippedPoints.value
  });
}

getData.addEventListener("click", async () => {
  output.value = "";
  status.textContent = "Reading GeoGebra...";

  try {
    await saveSettings();

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab || !tab.id) {
      throw new Error("No active tab found.");
    }

    const config = {
      mode: loopMode.value,
      loopLimit: Number(loopLimit.value),
      skippedPoints: skippedPoints.value
        .split(",")
        .map(x => x.trim().toUpperCase())
        .filter(Boolean)
    };

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: extractGeoGebraPoints,
      args: [config]
    });

    const data = result[0]?.result;

    if (!data) {
      throw new Error("No data returned.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    output.value = data.lines.join("\n");
    status.textContent =
      `${data.count} point(s) found. Loop limit used: ${data.loopLimitUsed}.`;
  } catch (error) {
    status.textContent = error.message;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!output.value) {
    status.textContent = "Nothing to copy yet.";
    return;
  }

  const originalLabel = copyBtn.textContent;

  const showCopied = () => {
    copyBtn.textContent = "Copied!";
    status.textContent = "Copied to clipboard.";
    setTimeout(() => {
      copyBtn.textContent = originalLabel;
    }, 1200);
  };

  try {
    await navigator.clipboard.writeText(output.value);
    showCopied();
  } catch (e) {
    // Fallback for contexts where the Clipboard API is blocked
    output.select();
    document.execCommand("copy");
    showCopied();
  }
});

function extractGeoGebraPoints(config) {
    if (typeof ggbApplet === "undefined") {
        return {
            error: "GeoGebra applet was not found on this page."
        };
    }

    const skipped = config.skippedPoints || [];

    // Normalize a name for comparison: uppercase, strip underscores.
    // GeoGebra auto-labels subscripted points as "A_1" (displayed A₁),
    // not "A1" -- so we normalize both the skip list and object names
    // the same way to match either style.
    function normalize(name) {
        return name.toUpperCase().replace(/_/g, "");
    }

    // Matches "A", "A1", "A_1", "AB12", "AB_12", etc.
    // Captures the leading letters and the trailing number (if any).
    const nameRegex = /^([A-Z]+)_?(\d*)$/;

    function isActive(name) {
        try {
            if (!ggbApplet.exists(name)) return false;

            // Skip deselected / hidden / inactive points.
            if (!ggbApplet.getVisible(name)) return false;

            // getValue() throws or is unreliable for some non-numeric
            // objects; wrap defined-check separately so a bad object
            // doesn't kill the whole scan.
            if (typeof ggbApplet.isDefined === "function" &&
                !ggbApplet.isDefined(name)) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    // Gather every point object GeoGebra currently knows about.
    let allNames = [];
    try {
        allNames = ggbApplet.getAllObjectNames("point");
    } catch (e) {
        // Older GeoGebra builds: no type filter argument supported.
        try {
            allNames = ggbApplet.getAllObjectNames().filter(n => {
                try {
                    return ggbApplet.getObjectType(n) === "point";
                } catch (e2) {
                    return false;
                }
            });
        } catch (e3) {
            return { error: "Could not read objects from GeoGebra." };
        }
    }

    const candidates = [];

    for (const rawName of allNames) {
        const match = nameRegex.exec(rawName);
        if (!match) continue; // ignore points not named like A, B1, C_2...

        const letters = match[1];
        const suffixNum = match[2] === "" ? 0 : parseInt(match[2], 10);
        const normName = normalize(rawName);

        if (skipped.indexOf(normName) !== -1) continue;
        if (!isActive(rawName)) continue;

        candidates.push({ rawName, letters, suffixNum });
    }

    // Apply loop limit: 1 = only A-Z (suffixNum 0), 2 = through *1, etc.
    let loopLimitUsed;
    let filtered = candidates;

    if (config.mode === "custom") {
        const limit = Math.max(1, Math.min(100, Number(config.loopLimit) || 1));
        filtered = candidates.filter(c => c.suffixNum <= limit - 1);
        loopLimitUsed = limit;
    } else {
        // AUTO MODE: include every group present, but stop counting
        // once we hit the first "gap" (a suffix number with nothing
        // in it at all), same intent as before, just based on real data.
        const maxSuffix = candidates.reduce(
            (m, c) => Math.max(m, c.suffixNum), 0
        );
        const presentSuffixes = new Set(candidates.map(c => c.suffixNum));

        let lastContiguous = 0;
        for (let i = 0; i <= maxSuffix; i++) {
            if (presentSuffixes.has(i)) {
                lastContiguous = i;
            } else {
                break;
            }
        }

        filtered = candidates.filter(c => c.suffixNum <= lastContiguous);
        loopLimitUsed = lastContiguous + 1;
    }

    // Sort: suffix group first (A-Z, then 1-group, then 2-group...),
    // then alphabetically by letters within each group.
    filtered.sort((a, b) => {
        if (a.suffixNum !== b.suffixNum) return a.suffixNum - b.suffixNum;
        if (a.letters < b.letters) return -1;
        if (a.letters > b.letters) return 1;
        return 0;
    });

    const pointCoordinates = filtered.map(c => ({
        name: c.rawName,
        x: ggbApplet.getXcoord(c.rawName),
        y: ggbApplet.getYcoord(c.rawName)
    }));

    const lines = pointCoordinates.map(point =>
        `glVertex2f(${point.x.toFixed(2)}, ${point.y.toFixed(2)});//${point.name}`
    );

    return {
        lines: lines,
        count: lines.length,
        loopLimitUsed: loopLimitUsed
    };
}

loadSettings();