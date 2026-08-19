async function colorPicker() {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab?.id) {
            console.error("No active tab found.");
            return;
        }

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                // Shared notification helper so success/error/unsupported
                // states all give the user visible feedback instead of
                // silently doing nothing.
                function showNotification(text, isError) {
                    const notification = document.createElement("div");
                    notification.textContent = text;

                    Object.assign(notification.style, {
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: "2147483647",
                        padding: "10px 16px",
                        background: isError ? "#b91c1c" : "#222",
                        color: "#fff",
                        borderRadius: "8px",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                        boxShadow: "0 4px 15px rgba(0,0,0,.3)"
                    });

                    document.documentElement.appendChild(notification);
                    setTimeout(() => notification.remove(), isError ? 2500 : 1500);
                }

                if (!window.EyeDropper) {
                    showNotification(
                        "Color picker isn't supported in this browser.",
                        true
                    );
                    return;
                }

                try {
                    const eyeDropper = new EyeDropper();
                    const result = await eyeDropper.open();
                    const color = result.sRGBHex;

                    try {
                        await navigator.clipboard.writeText(color);
                        showNotification(`${color} copied!`, false);
                    } catch (clipboardError) {
                        showNotification(
                            `Picked ${color}, but couldn't copy it automatically.`,
                            true
                        );
                    }
                } catch (error) {
                    // AbortError = user pressed Escape / clicked away to
                    // cancel -- that's expected, stay silent.
                    if (error && error.name === "AbortError") {
                        return;
                    }

                    // Anything else (e.g. the shortcut didn't carry a
                    // strong enough user gesture) is a real failure --
                    // surface it instead of swallowing it, and point the
                    // user at the reliable fallback.
                    showNotification(
                        "Color picker shortcut failed to start. Open the extension popup and use \"Pick Color from Screen\" instead.",
                        true
                    );
                }
            }
        });
    } catch (error) {
        console.error("Color picker failed:", error);
    }
}

chrome.commands.onCommand.addListener((command) => {
    if (command === "pick_color") {
        colorPicker();
    }
});
