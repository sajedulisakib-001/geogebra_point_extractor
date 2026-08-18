GeoGebra Point Extractor

Installation:
1. Extract this ZIP file.
2. Open Chrome and go to:
   chrome://extensions/
3. Enable Developer mode.
4. Click "Load unpacked".
5. Select the "geogebra_point_extractor" folder.

Usage:
1. Open the GeoGebra page containing the applet.
2. Click the extension icon.
3. Set skipped points if needed (comma-separated, e.g. X,Y,X1,Y1).
4. Click "Get Data".
5. The coordinates appear in the textbox, one point per line.

Color picker:
- Click "Pick Color from Screen" in the popup, then click anywhere on
  your screen (any tab, any app) to sample that pixel's color.
- The hex value is shown in the field below the button and copied to
  your clipboard automatically.
- This runs directly from the popup button so it reliably gets a
  browser "user gesture" -- there is no keyboard shortcut for it
  anymore, since routing that through a background script + keyboard
  command is not reliable for this API in Chrome.

Extraction:
- Every point named like A, B, A1, B_2, AB12, etc. is included --
  there's no cap and no gap-stopping, so labels like Z9, Z10, Z11...
  are all picked up, not just the first two suffix groups.
- Points that are hidden/deselected, undefined, or listed in
  "Skipped points" are left out, exactly as before.
- Points are grouped by the text label that precedes them in the
  algebra view, and sorted by suffix number then by letter.

Note:
The extension requires a page where the GeoGebra JavaScript applet exposes
the global ggbApplet object. It will not work on chrome:// pages.
