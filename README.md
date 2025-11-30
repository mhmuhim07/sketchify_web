# Sketchify

> Browser-based sketching app with tools for freehand drawing, shapes, selection, erasing and exporting.

Sketchify is a lightweight drawing application.

Key features

- Brush (freehand) drawing with adjustable size and color
- Shape tools: Line, Rectangle, Circle, Triangle, Dashed line, and user-defined Polygon (set number of sides)
- Eraser, Select / Move shapes, Undo / Redo, Clear, and Save (export)

Quick start

1. Open `index.html` directly in a modern browser, or serve the folder and open `http://localhost:8000`.

To run a simple local server (PowerShell):

```powershell
# from the project root (d:\sketchify_web)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Developer notes

- Source files are in `modules/`:
  - `app.js` — application bootstrap
  - `state.js` — central state
  - `toolbar.js` — toolbar UI bindings
  - `mouseEvents.js` — canvas mouse interactions
  - `drawing.js` — rendering and previews
  - `shapes.js` — shape utilities
  - `fileExport.js`, `eraser.js`, `keyboard.js`, `ui.js` — helpers
- Polygon tool: select `Polygon`, set sides (3–12), click to set center and drag to set radius; release to create the polygon.

If you want additional README details (contributing, tests, license, screenshots), tell me what to include and I will add them.

---

Created/updated by project maintainer tooling.
