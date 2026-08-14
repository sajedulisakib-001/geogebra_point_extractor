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
3. Choose Auto or Custom loop mode.
4. Set skipped points if needed.
5. Click "Get Data".
6. The coordinates appear in the textbox, one point per line.

Auto mode:
- Scans A-Z first.
- Then scans A1-Z1, A2-Z2, A3-Z3, etc.
- It stops after two consecutive numbered groups contain no existing points.
- Existing points are detected with ggbApplet.exists().

Custom mode:
- Loop limit 1 = A-Z
- Loop limit 2 = A-Z + A1-Z1
- Loop limit 3 = A-Z + A1-Z1 + A2-Z2
- And so on.

Note:
The extension requires a page where the GeoGebra JavaScript applet exposes
the global ggbApplet object. It will not work on chrome:// pages.
