// The Golden Wok — keyboard + mouse input, with edge-triggered presses.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // keys pressed since last consume
  const mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Space: 'interact',
    KeyP: 'pause', Escape: 'pause',
    KeyR: 'restart', KeyM: 'mute', KeyH: 'help',
    Enter: 'confirm',
  };

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  window.addEventListener('keydown', (e) => {
    const name = KEYMAP[e.code];
    if (!name) return;
    if (['up', 'down', 'left', 'right', 'interact'].includes(name)) e.preventDefault();
    if (!e.repeat) {
      keys.add(name);
      pressed.add(name);
    }
  });
  window.addEventListener('keyup', (e) => {
    const name = KEYMAP[e.code];
    if (name) keys.delete(name);
  });
  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPos(e);
    mouse.x = p.x;
    mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.clicked = true;
    mouse.clickX = p.x;
    mouse.clickY = p.y;
  });

  return {
    held(name) {
      return keys.has(name);
    },
    // True once per physical press; call once per frame per key.
    wasPressed(name) {
      if (pressed.has(name)) {
        pressed.delete(name);
        return true;
      }
      return false;
    },
    // Movement vector from held keys, normalised.
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      if (x !== 0 && y !== 0) {
        x *= Math.SQRT1_2;
        y *= Math.SQRT1_2;
      }
      return { x, y };
    },
    // True once per click; call once per frame.
    takeClick() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return { x: mouse.clickX, y: mouse.clickY };
    },
    mousePos() {
      return { x: mouse.x, y: mouse.y };
    },
    // Clear stale presses (e.g. after a screen change).
    flush() {
      pressed.clear();
      mouse.clicked = false;
    },
  };
}
