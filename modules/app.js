// Main initialization module
import { state } from './state.js';
import { drawing } from './drawing.js';
import { toolbar } from './toolbar.js';
import { fileExport } from './fileExport.js';
import { mouseEvents } from './mouseEvents.js';
import { keyboard } from './keyboard.js';
import { ui } from './ui.js';

export const app = {
  init() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Helper functions
    const redraw = () => drawing.redraw(ctx, state.shapes);
    const updateInfo = () => ui.updateInfo(state.shapes, state.undone);

    // Setup toolbar events
    toolbar.setupToolbarEvents(state, redraw, updateInfo);

    // Setup mouse events
    mouseEvents.setupMouseEvents(canvas, state, ctx, redraw, updateInfo);

    // Setup keyboard shortcuts
    keyboard.setupKeyboardShortcuts();

    // Setup canvas resizing
    ui.setupCanvasResize(canvas);

    // Setup save button
    document.getElementById("save").onclick = () => {
      fileExport.saveDrawing(state.shapes, drawing.drawShape, ctx);
    };

    // Initial setup
    updateInfo();
  }
};

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
