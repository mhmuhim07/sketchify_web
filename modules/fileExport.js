// File export module
export const fileExport = {
  saveDrawing(shapes, drawShapeFn, ctx) {
    try {
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = ctx.canvas.width;
      tempCanvas.height = ctx.canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      
      // Fill white background
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw all shapes
      shapes.forEach(s => drawShapeFn(tempCtx, s));
      
      // Convert to blob and download
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `sketchify-${timestamp}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("Drawing saved successfully!");
      }, "image/png");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving image. Please try again.");
    }
  }
};
