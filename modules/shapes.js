// Shape utilities module
export const shapes = {
  createShape(type, x1, y1, x2, y2, color, size) {
    return { type, x1, y1, x2, y2, color, size };
  },

  getBoundingBox(s) {
    if (s.type === "brush") {
      if (s.points.length === 0) return { x1: 0, y1: 0, x2: 0, y2: 0 };
      const xs = s.points.map(p => p.x);
      const ys = s.points.map(p => p.y);
      return {
        x1: Math.min(...xs),
        y1: Math.min(...ys),
        x2: Math.max(...xs),
        y2: Math.max(...ys)
      };
    } else if (s.type === "circle") {
      const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
      return { x1: s.x1 - r, y1: s.y1 - r, x2: s.x1 + r, y2: s.y1 + r };
    } else {
      return {
        x1: Math.min(s.x1, s.x2),
        y1: Math.min(s.y1, s.y2),
        x2: Math.max(s.x1, s.x2),
        y2: Math.max(s.y1, s.y2)
      };
    }
  },

  moveShape(s, dx, dy) {
    if (s.type === "brush") {
      s.points.forEach(p => {
        p.x += dx;
        p.y += dy;
      });
    } else {
      s.x1 += dx;
      s.y1 += dy;
      s.x2 += dx;
      s.y2 += dy;
    }
  },

  intersects(s, rect) {
    if (!rect) return false;
    const rx1 = Math.min(rect.x, rect.x + rect.w);
    const ry1 = Math.min(rect.y, rect.y + rect.h);
    const rx2 = Math.max(rect.x, rect.x + rect.w);
    const ry2 = Math.max(rect.y, rect.y + rect.h);
    const box = shapes.getBoundingBox(s);
    return !(box.x2 < rx1 || box.x1 > rx2 || box.y2 < ry1 || box.y1 > ry2);
  }
};
