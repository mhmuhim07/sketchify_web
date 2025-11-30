// Eraser module
import { shapes } from './shapes.js';

export const eraser = {
  eraseAt(ctx, x, y, size, shapesList, redrawFn) {
    const eraserSize = parseInt(size) * 2;
    const erased = [];
    
    const filteredShapes = shapesList.filter(s => {
      const box = shapes.getBoundingBox(s);
      // Check if eraser circle intersects with shape bounding box
      const closestX = Math.max(box.x1, Math.min(x, box.x2));
      const closestY = Math.max(box.y1, Math.min(y, box.y2));
      const distance = Math.hypot(x - closestX, y - closestY);
      
      if (distance <= eraserSize) {
        erased.push(s);
        return false; // Remove this shape
      }
      return true; // Keep this shape
    });
    
    // Update the original array
    shapesList.length = 0;
    shapesList.push(...filteredShapes);
    
    if (erased.length > 0) {
      redrawFn();
      // Draw eraser indicator
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};
