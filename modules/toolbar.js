// Toolbar events module
export const toolbar = {
  setupToolbarEvents(state, redrawFn, updateInfoFn) {
    // Tool selection
    document.getElementById("tool").onchange = (e) => {
      state.currentTool = e.target.value;
      const canvas = document.getElementById("canvas");
      canvas.style.cursor = state.currentTool === "eraser" ? "not-allowed" : "crosshair";
    };
    
    // Color selection
    document.getElementById("color").onchange = (e) => state.color = e.target.value;
    
    // Size adjustment
    document.getElementById("size").oninput = (e) => {
      state.size = e.target.value;
      document.getElementById("sizeDisplay").textContent = state.size;
    };
    
    // Undo button
    document.getElementById("undo").onclick = () => {
      if (state.shapes.length) {
        state.undone.push(state.shapes.pop());
        redrawFn();
        updateInfoFn();
      }
    };
    
    // Redo button
    document.getElementById("redo").onclick = () => {
      if (state.undone.length) {
        state.shapes.push(state.undone.pop());
        redrawFn();
        updateInfoFn();
      }
    };
    
    // Clear button
    document.getElementById("clear").onclick = () => {
      const userConfirmed = window.confirm("Are you sure you want to clear the entire canvas? This cannot be undone.");
      if (userConfirmed) {
        state.shapes = [];
        state.undone = [];
        state.selectedShapes = [];
        const ctx = document.getElementById("canvas").getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        updateInfoFn();
      }
    };
  }
};
