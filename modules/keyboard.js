// Keyboard shortcuts module
export const keyboard = {
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          document.getElementById("undo").click();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          document.getElementById("redo").click();
        }
      }
    });
  }
};
