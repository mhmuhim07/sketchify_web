// State management module
export const state = {
  currentTool: "brush",
  color: "#000",
  size: 3,
  drawing: false,
  startX: null,
  startY: null,
  brushPoints: [],
  shapes: [],
  undone: [],
  selectedShapes: [],
  selectionRect: null,
  moving: false,
  moveStart: null,
  polygonSides: 5,

  // Reset drawing state
  resetDrawingState() {
    this.brushPoints = [];
    this.drawing = false;
  },

  // Reset selection state
  resetSelection() {
    this.selectedShapes = [];
    this.selectionRect = null;
  },
};
