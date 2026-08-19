GeoGebra Point Extractor

Installation:
1. Extract this ZIP file.
2. Open Chrome and go to:
   chrome://extensions/
3. Enable Developer mode.
4. Click "Load unpacked".
5. Select the "geogebra_point_extractor" folder.

How to Use:
- Click the "How to Use" button at the top of the popup. It opens a
  full instructions page in a new browser tab, with a sidebar you can
  click through to jump to any topic (getting started, skipped points,
  Get Data, copying, the color picker, reading the output, and
  troubleshooting).

Usage:
1. Open the GeoGebra page containing the applet.
2. Click the extension icon.
3. Set skipped points if needed (comma-separated, e.g. X,Y,X1,Y1).
4. Click "Get Data".
5. The coordinates appear in the textbox, one point per line.

Color picker:
- Click "Pick Color from Screen" in the popup, then click anywhere on
  your screen (any tab, any app) to sample that pixel's color.
- Or press Ctrl+Shift+U (Cmd+Shift+U on Mac) from anywhere in the
  browser to trigger the same picker without opening the popup.
- Either way, the hex value is copied to your clipboard automatically,
  and a brief on-screen notification confirms it.
- If the keyboard shortcut ever stops firing (shortcut conflicts do
  happen), the popup button always works -- check
  chrome://extensions/shortcuts to confirm the shortcut is still bound
  to this extension if needed.

Extraction:
- Points named like A, B, A1, B_2, AB12, etc. are included, grouped by
  the text label that precedes them in the algebra view and sorted by
  suffix number then by letter.
- Points that are hidden/deselected, undefined, or listed in
  "Skipped points" are left out.
- KNOWN LIMIT: reliably picks up subscripts A through Z9 (single digit
  only). Points named with a two-digit-or-higher subscript (A10 and
  beyond) are not currently guaranteed to be picked up.

Note:
The extension requires a page where the GeoGebra JavaScript applet exposes
the global ggbApplet object. It will not work on chrome:// pages.
