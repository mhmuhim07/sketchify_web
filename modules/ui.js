// UI utilities module
export const ui = {
  updateInfo(shapes, undone) {
    document.getElementById("shapeCount").textContent = shapes.length;
    document.getElementById("undoCount").textContent = shapes.length;
    document.getElementById("redoCount").textContent = undone.length;
  },

  resizeCanvas(canvas) {
    const container = document.querySelector(".container");
    const maxWidth = Math.min(container.clientWidth - 50, 900);
    const ratio = 600 / 900;
    canvas.style.width = maxWidth + "px";
    canvas.style.height = (maxWidth * ratio) + "px";
  },

  setupCanvasResize(canvas) {
    window.addEventListener("resize", () => {
      ui.resizeCanvas(canvas);
    });
    ui.resizeCanvas(canvas);
  }
};
