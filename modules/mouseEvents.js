// Mouse events module
import { shapes } from "./shapes.js";
import { eraser } from "./eraser.js";
import { drawing } from "./drawing.js";

export const mouseEvents = {
  setupMouseEvents(canvas, state, ctx, redrawFn, updateInfoFn) {
    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      state.startX = x;
      state.startY = y;

      if (state.currentTool === "select") {
        if (
          state.selectedShapes.length &&
          mouseEvents.isInsideSelection(x, y, state)
        ) {
          state.moving = true;
          state.moveStart = { x, y };
          return;
        }
        state.selectionRect = { x: state.startX, y: state.startY, w: 0, h: 0 };
        return;
      }

      if (state.currentTool === "eraser") {
        eraser.eraseAt(ctx, x, y, state.size, state.shapes, redrawFn);
        state.drawing = true;
        return;
      }

      state.drawing = true;
      state.brushPoints = [];
      state.undone = [];
      if (state.currentTool === "brush") state.brushPoints.push({ x, y });
    };

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (state.currentTool === "select") {
        if (state.moving) {
          const dx = x - state.moveStart.x;
          const dy = y - state.moveStart.y;
          state.selectedShapes.forEach((s) => shapes.moveShape(s, dx, dy));
          state.moveStart = { x, y };
          redrawFn();
          mouseEvents.drawBoundingBoxWrapper(ctx, state);
          return;
        }
        if (state.selectionRect) {
          state.selectionRect.w = x - state.selectionRect.x;
          state.selectionRect.h = y - state.selectionRect.y;
          redrawFn();
          drawing.drawSelectionRect(ctx, state.selectionRect);
        }
        return;
      }

      if (!state.drawing) return;

      if (state.currentTool === "eraser") {
        eraser.eraseAt(ctx, x, y, state.size, state.shapes, redrawFn);
        return;
      }

      if (state.currentTool === "brush") {
        state.brushPoints.push({ x, y });
        redrawFn();
        drawing.drawBrushPreview(
          ctx,
          state.brushPoints,
          state.color,
          state.size
        );
      } else {
        redrawFn();
        if (state.currentTool === "polygon") {
          drawing.drawShapePreview(
            ctx,
            state.currentTool,
            state.startX,
            state.startY,
            x,
            y,
            state.color,
            state.size,
            state.polygonSides
          );
        } else {
          drawing.drawShapePreview(
            ctx,
            state.currentTool,
            state.startX,
            state.startY,
            x,
            y,
            state.color,
            state.size
          );
        }
      }
    };

    canvas.onmouseup = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (state.currentTool === "select") {
        if (state.moving) {
          state.moving = false;
          return;
        }
        state.selectedShapes = state.shapes.filter((s) =>
          shapes.intersects(s, state.selectionRect)
        );
        state.selectionRect = null;
        redrawFn();
        mouseEvents.drawBoundingBoxWrapper(ctx, state);
        return;
      }

      if (!state.drawing) return;
      state.drawing = false;

      if (state.currentTool === "eraser") {
        updateInfoFn();
        return;
      }

      if (state.currentTool === "brush" && state.brushPoints.length > 1) {
        state.shapes.push({
          type: "brush",
          points: [...state.brushPoints],
          color: state.color,
          size: state.size,
        });
      } else if (state.currentTool !== "brush") {
        if (state.currentTool === "polygon") {
          // store sides in the shape so drawing can use it
          state.shapes.push({
            type: "polygon",
            x1: state.startX,
            y1: state.startY,
            x2: x,
            y2: y,
            color: state.color,
            size: state.size,
            sides: state.polygonSides || 3,
          });
        } else {
          state.shapes.push(
            shapes.createShape(
              state.currentTool,
              state.startX,
              state.startY,
              x,
              y,
              state.color,
              state.size
            )
          );
        }
      }

      state.brushPoints = [];
      redrawFn();
      updateInfoFn();
    };

    canvas.oncontextmenu = (e) => e.preventDefault();
  },

  isInsideSelection(x, y, state) {
    if (!state.selectedShapes.length) return false;
    const boxes = state.selectedShapes.map((s) => shapes.getBoundingBox(s));
    const x1 = Math.min(...boxes.map((b) => b.x1));
    const y1 = Math.min(...boxes.map((b) => b.y1));
    const x2 = Math.max(...boxes.map((b) => b.x2));
    const y2 = Math.max(...boxes.map((b) => b.y2));
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  },

  drawBoundingBoxWrapper(ctx, state) {
    drawing.drawBoundingBox(ctx, state.selectedShapes, (s) =>
      shapes.getBoundingBox(s)
    );
  },
};
