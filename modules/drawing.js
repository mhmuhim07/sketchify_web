// Drawing utilities module
export const drawing = {
  redraw(ctx, shapes) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    shapes.forEach((s) => drawing.drawShape(ctx, s));
  },

  drawShape(ctx, s) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (s.type === "brush") {
      if (s.points.length < 2) return;
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
    } else if (s.type === "line") {
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
    } else if (s.type === "rect") {
      ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      return;
    } else if (s.type === "circle") {
      const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
      ctx.arc(s.x1, s.y1, r, 0, Math.PI * 2);
    } else if (s.type === "triangle") {
      ctx.moveTo(s.x1, s.y2);
      ctx.lineTo((s.x1 + s.x2) / 2, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.closePath();
    } else if (s.type === "polygon") {
      const sides = s.sides || 3;
      const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
      const cx = s.x1;
      const cy = s.y1;
      let startAngle = -Math.PI / 2; // start at top
      if (sides <= 0) return;
      ctx.moveTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
      for (let i = 1; i < sides; i++) {
        const a = startAngle + (i * 2 * Math.PI) / sides;
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
    } else if (s.type === "dashed") {
      ctx.setLineDash([10, 5]);
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    ctx.stroke();
  },

  drawShapePreview(ctx, type, x1, y1, x2, y2, color, size, sidesParam) {
    ctx.globalAlpha = 0.7;
    ctx.setLineDash(type === "dashed" ? [10, 5] : []);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (type === "line" || type === "dashed") {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (type === "rect") {
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (type === "circle") {
      const r = Math.hypot(x2 - x1, y2 - y1);
      ctx.arc(x1, y1, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "triangle") {
      ctx.moveTo(x1, y2);
      ctx.lineTo((x1 + x2) / 2, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.stroke();
    } else if (type === "polygon") {
      const sides = parseInt(sidesParam, 10) || 3; // fallback if passed
      const r = Math.hypot(x2 - x1, y2 - y1);
      const cx = x1;
      const cy = y1;
      let startAngle = -Math.PI / 2;
      ctx.moveTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
      for (let i = 1; i < sides; i++) {
        const a = startAngle + (i * 2 * Math.PI) / sides;
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
  },

  drawBrushPreview(ctx, brushPoints, color, size) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (brushPoints.length > 0) {
      ctx.moveTo(brushPoints[0].x, brushPoints[0].y);
      for (let i = 1; i < brushPoints.length; i++) {
        ctx.lineTo(brushPoints[i].x, brushPoints[i].y);
      }
    }
    ctx.stroke();
  },

  drawSelectionRect(ctx, selectionRect) {
    if (!selectionRect) return;
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = "rgba(102, 126, 234, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      selectionRect.x,
      selectionRect.y,
      selectionRect.w,
      selectionRect.h
    );
    ctx.setLineDash([]);
  },

  drawBoundingBox(ctx, selectedShapes, getBoundingBoxFn) {
    if (!selectedShapes.length) return;
    const boxes = selectedShapes.map(getBoundingBoxFn);
    const x1 = Math.min(...boxes.map((b) => b.x1));
    const y1 = Math.min(...boxes.map((b) => b.y1));
    const x2 = Math.max(...boxes.map((b) => b.x2));
    const y2 = Math.max(...boxes.map((b) => b.y2));
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = "#667eea";
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.setLineDash([]);
  },
};
