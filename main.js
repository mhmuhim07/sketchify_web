const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let currentTool = "brush";
let color = "#000";
let size = 3;

let drawing = false;
let startX, startY;
let brushPoints = [];

let shapes = [];
let undone = [];
let selectedShapes = [];
let selectionRect = null;
let moving = false;
let moveStart = null;

// Toolbar
document.getElementById("tool").onchange = (e) =>
  (currentTool = e.target.value);
document.getElementById("color").onchange = (e) => (color = e.target.value);
document.getElementById("size").oninput = (e) => (size = e.target.value);
document.getElementById("undo").onclick = () => {
  if (shapes.length) undone.push(shapes.pop());
  redraw();
};
document.getElementById("clear").onclick = () => {
  shapes = [];
  undone = [];
  selectedShapes = [];
  redraw();
};
document.getElementById("save").onclick = () => {
  const imgCanvas = document.createElement("canvas");
  imgCanvas.width = canvas.width;
  imgCanvas.height = canvas.height;
  const imgCtx = imgCanvas.getContext("2d");
  imgCtx.fillStyle = "white";
  imgCtx.fillRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((s) => drawShape(imgCtx, s));
  const link = document.createElement("a");
  link.download = "canvas.png";
  link.href = imgCanvas.toDataURL();
  link.click();
};

// Mouse events
canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  startX = x;
  startY = y;

  if (currentTool === "select") {
    if (selectedShapes.length && isInsideSelection(x, y)) {
      moving = true;
      moveStart = { x, y };
      return;
    }
    selectionRect = { x: startX, y: startY, w: 0, h: 0 };
    return;
  }

  drawing = true;
  brushPoints = [];
  undone = [];
  if (currentTool === "brush") brushPoints.push({ x, y });
};

canvas.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentTool === "select") {
    if (moving) {
      const dx = x - moveStart.x;
      const dy = y - moveStart.y;
      selectedShapes.forEach((s) => moveShape(s, dx, dy));
      moveStart = { x, y };
      redraw();
      drawBoundingBox();
      return;
    }
    if (selectionRect) {
      selectionRect.w = x - selectionRect.x;
      selectionRect.h = y - selectionRect.y;
      redraw();
      drawSelectionRect();
    }
    return;
  }

  if (!drawing) return;
  if (currentTool === "brush") {
    brushPoints.push({ x, y });
    redraw();
    drawBrushPreview();
  } else {
    redraw();
    drawShapePreview(currentTool, startX, startY, x, y);
  }
};

canvas.onmouseup = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentTool === "select") {
    if (moving) {
      moving = false;
      return;
    }
    selectedShapes = shapes.filter((s) => intersects(s, selectionRect));
    selectionRect = null;
    redraw();
    drawBoundingBox();
    return;
  }

  if (!drawing) return;
  drawing = false;

  if (currentTool === "brush") {
    shapes.push({ type: "brush", points: [...brushPoints], color, size });
  } else {
    shapes.push(createShape(currentTool, startX, startY, x, y));
  }
  brushPoints = [];
  redraw();
};

// Helpers
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((s) => drawShape(ctx, s));
}

function drawShape(ctx, s) {
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.beginPath();
  if (s.type === "brush") {
    for (let i = 0; i < s.points.length - 1; i++) {
      const p1 = s.points[i],
        p2 = s.points[i + 1];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
  } else if (s.type === "line") {
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
  } else if (s.type === "rect") {
    ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
  } else if (s.type === "circle") {
    const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
    ctx.arc(s.x1, s.y1, r, 0, Math.PI * 2);
  } else if (s.type === "triangle") {
    ctx.moveTo(s.x1, s.y2);
    ctx.lineTo((s.x1 + s.x2) / 2, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.closePath();
  } else if (s.type === "dashed") {
    ctx.setLineDash([5, 5]);
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }
  ctx.stroke();
}

function drawShapePreview(type, x1, y1, x2, y2) {
  ctx.setLineDash(type === "dashed" ? [5, 5] : []);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  if (type === "line" || type === "dashed") {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  } else if (type === "rect") {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (type === "circle") {
    const r = Math.hypot(x2 - x1, y2 - y1);
    ctx.arc(x1, y1, r, 0, Math.PI * 2);
  } else if (type === "triangle") {
    ctx.moveTo(x1, y2);
    ctx.lineTo((x1 + x2) / 2, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBrushPreview() {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  for (let i = 0; i < brushPoints.length - 1; i++) {
    const p1 = brushPoints[i],
      p2 = brushPoints[i + 1];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();
}

function createShape(type, x1, y1, x2, y2) {
  return { type, x1, y1, x2, y2, color, size };
}

function intersects(s, rect) {
  const rx1 = Math.min(rect.x, rect.x + rect.w);
  const ry1 = Math.min(rect.y, rect.y + rect.h);
  const rx2 = Math.max(rect.x, rect.x + rect.w);
  const ry2 = Math.max(rect.y, rect.y + rect.h);
  const box = getBoundingBox(s);
  return !(box.x2 < rx1 || box.x1 > rx2 || box.y2 < ry1 || box.y1 > ry2);
}

function getBoundingBox(s) {
  if (s.type === "brush") {
    const xs = s.points.map((p) => p.x);
    const ys = s.points.map((p) => p.y);
    return {
      x1: Math.min(...xs),
      y1: Math.min(...ys),
      x2: Math.max(...xs),
      y2: Math.max(...ys),
    };
  } else if (s.type === "circle") {
    const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
    return { x1: s.x1 - r, y1: s.y1 - r, x2: s.x1 + r, y2: s.y1 + r };
  } else {
    return {
      x1: Math.min(s.x1, s.x2),
      y1: Math.min(s.y1, s.y2),
      x2: Math.max(s.x1, s.x2),
      y2: Math.max(s.y1, s.y2),
    };
  }
}

function moveShape(s, dx, dy) {
  if (s.type === "brush")
    s.points.forEach((p) => {
      p.x += dx;
      p.y += dy;
    });
  else {
    s.x1 += dx;
    s.y1 += dy;
    s.x2 += dx;
    s.y2 += dy;
  }
}

function drawSelectionRect() {
  if (!selectionRect) return;
  ctx.setLineDash([5, 3]);
  ctx.strokeStyle = "rgba(0,0,255,0.5)";
  ctx.strokeRect(
    selectionRect.x,
    selectionRect.y,
    selectionRect.w,
    selectionRect.h
  );
  ctx.setLineDash([]);
}

function drawBoundingBox() {
  if (!selectedShapes.length) return;
  const boxes = selectedShapes.map(getBoundingBox);
  const x1 = Math.min(...boxes.map((b) => b.x1));
  const y1 = Math.min(...boxes.map((b) => b.y1));
  const x2 = Math.max(...boxes.map((b) => b.x2));
  const y2 = Math.max(...boxes.map((b) => b.y2));
  ctx.setLineDash([5, 3]);
  ctx.strokeStyle = "blue";
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.setLineDash([]);
}

function isInsideSelection(x, y) {
  if (!selectedShapes.length) return false;
  const boxes = selectedShapes.map(getBoundingBox);
  const x1 = Math.min(...boxes.map((b) => b.x1));
  const y1 = Math.min(...boxes.map((b) => b.y1));
  const x2 = Math.max(...boxes.map((b) => b.x2));
  const y2 = Math.max(...boxes.map((b) => b.y2));
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}
// Resize canvas dynamically to fit screen while keeping drawing
function resizeCanvas() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const containerWidth = Math.min(window.innerWidth * 0.95, 950);
  const ratio = canvas.height / canvas.width;
  canvas.width = containerWidth;
  canvas.height = containerWidth * ratio;
  ctx.putImageData(imgData, 0, 0);
}

// Call on load and on window resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

canvas.oncontextmenu = (e) => e.preventDefault();
