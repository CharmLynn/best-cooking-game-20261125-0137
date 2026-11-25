// The Golden Wok — drawing ingredients and finished dishes, all in code.
// Every food item is drawn from canvas shapes; nothing is loaded from a file.

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// Draw one ingredient / component / dish centred at (x, y), about `size` wide.
export function drawFood(ctx, kind, x, y, size = 30) {
  const s = size / 30; // scale factor
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  switch (kind) {
    case 'rice': {
      // A little sack of rice: a mound of white grains.
      rrect(ctx, -11, -4, 22, 12, 5, '#e8dcc0');
      circle(ctx, -6, -3, 2.4, '#fffaf0');
      circle(ctx, 0, -5, 2.4, '#fffaf0');
      circle(ctx, 6, -3, 2.4, '#fffaf0');
      circle(ctx, -3, 1, 2.4, '#f5f0e1');
      circle(ctx, 4, 1, 2.4, '#fffaf0');
      break;
    }
    case 'noodles': {
      // A nest of yellow noodles.
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-2 + i * 1.5, 0, 9 - i, Math.PI * 0.15, Math.PI * 1.1);
        ctx.stroke();
      }
      break;
    }
    case 'veg': {
      // A tomato, a pepper and a spring onion.
      circle(ctx, -6, 1, 7, '#d64541');
      circle(ctx, -6, -4, 2.5, '#58a34a');
      rrect(ctx, 1, -6, 11, 13, 4, '#58a34a');
      rrect(ctx, 4, -6, 3, 13, 1.5, '#7cc46a');
      break;
    }
    case 'egg': {
      ellipse(ctx, 0, 1, 9, 11, '#fff3d6');
      ellipse(ctx, 0, 3, 6, 7, '#fdf6d8');
      break;
    }
    case 'chicken': {
      // A drumstick.
      ellipse(ctx, -2, 0, 10, 8, '#f2a0a0');
      circle(ctx, 9, -4, 3, '#fff3d6');
      circle(ctx, 11, 2, 3, '#fff3d6');
      ctx.strokeStyle = '#e08a8a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, -1);
      ctx.lineTo(10, 0);
      ctx.stroke();
      break;
    }
    case 'sauce': {
      // A little sauce bottle.
      rrect(ctx, -6, -6, 12, 16, 3, '#7a4a21');
      rrect(ctx, -3, -12, 6, 7, 2, '#b98a2e');
      rrect(ctx, -6, -2, 12, 5, 2, '#d98a3d');
      break;
    }
    case 'chopped-veg': {
      // Diced veg: green and red cubes.
      rrect(ctx, -11, -7, 8, 8, 2, '#58a34a');
      rrect(ctx, -1, -8, 8, 8, 2, '#d64541');
      rrect(ctx, -8, 2, 8, 8, 2, '#7cc46a');
      rrect(ctx, 2, 1, 8, 8, 2, '#e88a3d');
      break;
    }
    case 'chopped-chicken': {
      rrect(ctx, -11, -6, 9, 9, 2, '#f2b8b8');
      rrect(ctx, 0, -7, 9, 9, 2, '#e89a9a');
      rrect(ctx, -6, 4, 9, 9, 2, '#f2c4c4');
      rrect(ctx, 4, 3, 9, 9, 2, '#e08a8a');
      break;
    }
    case 'cooked-rice': {
      // A steaming mound of white rice.
      ellipse(ctx, 0, 4, 12, 7, '#fffaf0');
      circle(ctx, -6, -1, 3, '#fffaf0');
      circle(ctx, 0, -3, 3, '#fffaf0');
      circle(ctx, 6, -1, 3, '#fffaf0');
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.quadraticCurveTo(-6, -12, -4, -15);
      ctx.moveTo(4, -8);
      ctx.quadraticCurveTo(6, -12, 4, -15);
      ctx.stroke();
      break;
    }
    case 'fried-egg': {
      // Sunny side up.
      ellipse(ctx, 0, 1, 12, 9, '#fffaf0');
      circle(ctx, 0, 0, 5.5, '#ffd94d');
      circle(ctx, -1.5, -1.5, 2, '#ffbe3d');
      break;
    }
    case 'wok-veg': {
      ellipse(ctx, 0, 3, 12, 7, '#4d8f3f');
      rrect(ctx, -9, -5, 7, 7, 2, '#7cc46a');
      rrect(ctx, 0, -7, 7, 7, 2, '#d64541');
      rrect(ctx, 5, -2, 6, 6, 2, '#e88a3d');
      break;
    }
    case 'wok-chicken': {
      ellipse(ctx, 0, 3, 12, 7, '#e08a5a');
      rrect(ctx, -9, -5, 8, 7, 2, '#f2b8b8');
      rrect(ctx, 1, -6, 8, 7, 2, '#f2c4c4');
      break;
    }
    case 'cooked-noodles': {
      ctx.strokeStyle = '#f7cd6a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-3 + i * 1.6, 1, 10 - i * 0.8, Math.PI * 0.1, Math.PI * 1.05);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -9);
      ctx.quadraticCurveTo(-6, -13, -4, -16);
      ctx.stroke();
      break;
    }
    case 'broth': {
      // A small pot of golden broth.
      ellipse(ctx, 0, 2, 12, 8, '#d98a3d');
      ellipse(ctx, 0, 0, 10, 6, '#f2b25c');
      circle(ctx, -4, -1, 1.8, '#7cc46a');
      circle(ctx, 3, 1, 1.8, '#d64541');
      break;
    }
    case 'burnt': {
      ellipse(ctx, 0, 3, 12, 7, '#1c1c1c');
      ellipse(ctx, 0, 1, 9, 5, '#333');
      ctx.strokeStyle = 'rgba(120,120,120,0.8)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.quadraticCurveTo(-7, -11, -4, -15);
      ctx.moveTo(4, -6);
      ctx.quadraticCurveTo(7, -11, 4, -15);
      ctx.stroke();
      break;
    }
    case 'dish-fried-rice':
      drawPlate(ctx);
      ellipse(ctx, 0, 0, 11, 7, '#f2c14e');
      circle(ctx, -5, -2, 2.5, '#fffaf0');
      circle(ctx, 4, -1, 2.5, '#ffd94d');
      circle(ctx, 0, 2, 2.5, '#58a34a');
      break;
    case 'dish-noodle-soup':
      drawBowl(ctx);
      ctx.strokeStyle = '#f7cd6a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-3, 0, 7, Math.PI * 0.15, Math.PI * 0.95);
      ctx.arc(3, -1, 6, Math.PI * 0.2, Math.PI * 0.9);
      ctx.stroke();
      circle(ctx, 5, 2, 2.5, '#f2b8b8');
      circle(ctx, -6, 2, 2, '#7cc46a');
      break;
    case 'dish-stir-fry':
      drawPlate(ctx);
      ellipse(ctx, 0, 0, 11, 7, '#8a5a33');
      rrect(ctx, -9, -5, 7, 7, 2, '#4d8f3f');
      rrect(ctx, -1, -6, 7, 7, 2, '#e08a5a');
      rrect(ctx, 5, -1, 6, 6, 2, '#d64541');
      circle(ctx, -4, 2, 2, '#f2c14e');
      break;
    default:
      circle(ctx, 0, 0, 10, '#888');
  }
  ctx.restore();
}

function drawPlate(ctx) {
  ellipse(ctx, 0, 1, 14, 10, '#fff8e7');
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 1, 14, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBowl(ctx) {
  ctx.fillStyle = '#2e6f8e';
  ctx.beginPath();
  ctx.ellipse(0, 1, 13, 9, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(-13, 0, 26, 3);
  ellipse(ctx, 0, 0, 11, 5, '#f2b25c');
}

// A tiny dish icon for order tickets (a plate/bowl with a coloured dot).
export function drawDishIcon(ctx, dishKind, x, y, size = 26) {
  drawFood(ctx, dishKind, x, y, size);
}
