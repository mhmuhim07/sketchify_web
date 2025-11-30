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

    // Toolbar events
    document.getElementById("tool").onchange = (e) => {
      currentTool = e.target.value;
      canvas.style.cursor = currentTool === "eraser" ? "not-allowed" : "crosshair";
    };
    
    document.getElementById("color").onchange = (e) => color = e.target.value;
    
    document.getElementById("size").oninput = (e) => {
      size = e.target.value;
      document.getElementById("sizeDisplay").textContent = size;
    };
    
    document.getElementById("undo").onclick = () => {
      if (shapes.length) {
        undone.push(shapes.pop());
        redraw();
        updateInfo();
      }
    };
    
    document.getElementById("redo").onclick = () => {
      if (undone.length) {
        shapes.push(undone.pop());
        redraw();
        updateInfo();
      }
    };
    
    document.getElementById("clear").onclick = () => {
      const userConfirmed = window.confirm("Are you sure you want to clear the entire canvas? This cannot be undone.");
      if (userConfirmed) {
        shapes = [];
        undone = [];
        selectedShapes = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateInfo();
      }
    };
    
    document.getElementById("save").onclick = () => {
      try {
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        
        // Fill white background
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw all shapes
        shapes.forEach(s => drawShape(tempCtx, s));
        
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

      if (currentTool === "eraser") {
        eraseAt(x, y);
        drawing = true;
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
          selectedShapes.forEach(s => moveShape(s, dx, dy));
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

      if (currentTool === "eraser") {
        eraseAt(x, y);
        return;
      }

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
        selectedShapes = shapes.filter(s => intersects(s, selectionRect));
        selectionRect = null;
        redraw();
        drawBoundingBox();
        return;
      }

      if (!drawing) return;
      drawing = false;

      if (currentTool === "eraser") {
        updateInfo();
        return;
      }

      if (currentTool === "brush" && brushPoints.length > 1) {
        shapes.push({ type: "brush", points: [...brushPoints], color, size });
      } else if (currentTool !== "brush") {
        shapes.push(createShape(currentTool, startX, startY, x, y));
      }
      
      brushPoints = [];
      redraw();
      updateInfo();
    };

    // Eraser function - removes shapes that intersect with eraser
    function eraseAt(x, y) {
      const eraserSize = parseInt(size) * 2;
      const erased = [];
      
      shapes = shapes.filter(s => {
        const box = getBoundingBox(s);
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
      
      if (erased.length > 0) {
        redraw();
        // Draw eraser indicator
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Drawing functions
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach(s => drawShape(ctx, s));
    }

    function drawShape(ctx, s) {
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
      } else if (s.type === "circle") {
        const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
        ctx.arc(s.x1, s.y1, r, 0, Math.PI * 2);
      } else if (s.type === "triangle") {
        ctx.moveTo(s.x1, s.y2);
        ctx.lineTo((s.x1 + s.x2) / 2, s.y1);
        ctx.lineTo(s.x2, s.y2);
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
    }

    function drawShapePreview(type, x1, y1, x2, y2) {
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
      ctx.globalAlpha = 1.0;
    }

    function drawBrushPreview() {
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
    }

    function createShape(type, x1, y1, x2, y2) {
      return { type, x1, y1, x2, y2, color, size };
    }

    // Selection helpers
    function intersects(s, rect) {
      if (!rect) return false;
      const rx1 = Math.min(rect.x, rect.x + rect.w);
      const ry1 = Math.min(rect.y, rect.y + rect.h);
      const rx2 = Math.max(rect.x, rect.x + rect.w);
      const ry2 = Math.max(rect.y, rect.y + rect.h);
      const box = getBoundingBox(s);
      return !(box.x2 < rx1 || box.x1 > rx2 || box.y2 < ry1 || box.y1 > ry2);
    }

    function getBoundingBox(s) {
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
    }

    function moveShape(s, dx, dy) {
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
    }

    function drawSelectionRect() {
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
    }

    function drawBoundingBox() {
      if (!selectedShapes.length) return;
      const boxes = selectedShapes.map(getBoundingBox);
      const x1 = Math.min(...boxes.map(b => b.x1));
      const y1 = Math.min(...boxes.map(b => b.y1));
      const x2 = Math.max(...boxes.map(b => b.x2));
      const y2 = Math.max(...boxes.map(b => b.y2));
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = "#667eea";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.setLineDash([]);
    }

    function isInsideSelection(x, y) {
      if (!selectedShapes.length) return false;
      const boxes = selectedShapes.map(getBoundingBox);
      const x1 = Math.min(...boxes.map(b => b.x1));
      const y1 = Math.min(...boxes.map(b => b.y1));
      const x2 = Math.max(...boxes.map(b => b.x2));
      const y2 = Math.max(...boxes.map(b => b.y2));
      return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    function updateInfo() {
      document.getElementById("shapeCount").textContent = shapes.length;
      document.getElementById("undoCount").textContent = shapes.length;
      document.getElementById("redoCount").textContent = undone.length;
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          document.getElementById("undo").click();
        } else if (e.key === "z" && e.shiftKey || e.key === "y") {
          e.preventDefault();
          document.getElementById("redo").click();
        }
      }
    });

    // Responsive canvas
    function resizeCanvas() {
      const container = document.querySelector(".container");
      const maxWidth = Math.min(container.clientWidth - 50, 900);
      const ratio = 600 / 900;
      canvas.style.width = maxWidth + "px";
      canvas.style.height = (maxWidth * ratio) + "px";
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    updateInfo();

    canvas.oncontextmenu = (e) => e.preventDefault();