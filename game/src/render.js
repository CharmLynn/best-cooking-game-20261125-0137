// The Golden Wok — all drawing: kitchen, chef, HUD, tickets and screens.
import {
  W, H, HUD_H, PAL, STATIONS, STATION_BY_ID, PANTRY_BINS, BIN_W, BIN_H,
  ITEMS, RECIPES, RECIPE_BY_ID, DAYS, WOK_COOK_TIME, POT_COOK_TIME,
  CHOP_TAPS, PERFECT_LOW, PERFECT_HIGH,
} from './config.js';
import { drawFood } from './food.js';
import { cookerLabel } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}
function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const ss = Math.floor(Math.max(0, s) % 60);
  return `${m}:${String(ss).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- floor
function drawFloor(ctx) {
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = PAL.wallDark;
  ctx.fillRect(0, HUD_H - 6, W, 6);
  // Wooden floorboards.
  ctx.fillStyle = PAL.floor;
  ctx.fillRect(0, HUD_H, W, H - HUD_H);
  ctx.strokeStyle = PAL.floorLine;
  ctx.lineWidth = 2;
  for (let y = HUD_H + 44; y < H; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = PAL.floorAlt;
  for (let y = HUD_H; y < H; y += 88) {
    for (let x = ((y / 44) % 2) * 120; x < W; x += 240) {
      ctx.fillRect(x, y, 120, 44);
    }
  }
  // A warm rug in the middle of the kitchen.
  ctx.fillStyle = '#a34d3d';
  rr(ctx, 330, 380, 300, 130, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.brass;
  ctx.lineWidth = 3;
  rr(ctx, 342, 392, 276, 106, 10);
  ctx.stroke();
}

// ---------------------------------------------------------------- stations
function stationLabel(ctx, s, highlight) {
  // Labels sit just outside the counter so they never cover its contents.
  // The bin is too close to the floor edge, so its label goes above it.
  const y = s.id === 'bin' ? s.y - 12 : s.y + s.h + 13;
  text(ctx, s.name.toUpperCase(), s.x + s.w / 2, y, 11, highlight ? PAL.gold : '#e8dcc0', 'center');
}

function drawCounter(ctx, s, highlight) {
  ctx.fillStyle = PAL.counterEdge;
  rr(ctx, s.x - 3, s.y - 3, s.w + 6, s.h + 6, 10);
  ctx.fill();
  ctx.fillStyle = PAL.counter;
  rr(ctx, s.x, s.y, s.w, s.h, 8);
  ctx.fill();
  ctx.fillStyle = PAL.counterTop;
  rr(ctx, s.x + 4, s.y + 4, s.w - 8, s.h - 14, 6);
  ctx.fill();
  if (highlight) {
    ctx.strokeStyle = PAL.brass;
    ctx.lineWidth = 3;
    rr(ctx, s.x - 3, s.y - 3, s.w + 6, s.h + 6, 10);
    ctx.stroke();
  }
}

function drawTimingBar(ctx, cx, y, w, progress, cookTime) {
  const frac = Math.min(1, progress / cookTime);
  const x = cx - w / 2;
  ctx.fillStyle = '#2b1d12';
  rr(ctx, x - 2, y - 2, w + 4, 12, 6);
  ctx.fill();
  // Green zone.
  ctx.fillStyle = '#58a34a';
  ctx.fillRect(x + w * PERFECT_LOW, y, w * (PERFECT_HIGH - PERFECT_LOW), 8);
  // Progress fill.
  ctx.fillStyle = frac >= 1 ? '#d64541' : frac >= PERFECT_LOW ? '#7cc46a' : '#f2c14e';
  ctx.fillRect(x, y, Math.max(2, w * frac), 8);
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 1;
  rr(ctx, x, y, w, 8, 4);
  ctx.stroke();
}

function drawStations(ctx, state) {
  const hover = state.hoverStation;
  for (const s of STATIONS) {
    const hl = hover && hover.id === s.id;
    if (s.kind === 'pantry') {
      drawCounter(ctx, s, hl);
      for (const b of PANTRY_BINS) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        rr(ctx, b.x, b.y, BIN_W, BIN_H, 6);
        ctx.fill();
        drawFood(ctx, b.kind, b.x + BIN_W / 2, b.y + 17, 24);
        text(ctx, ITEMS[b.kind].name, b.x + BIN_W / 2, b.y + BIN_H - 7, 9, '#fff3d6', 'center');
      }
      stationLabel(ctx, s, hl);
      continue;
    }
    if (s.kind === 'board') {
      drawCounter(ctx, s, hl);
      // The board itself.
      ctx.fillStyle = '#e8dcc0';
      rr(ctx, s.x + 18, s.y + 10, s.w - 36, s.h - 34, 6);
      ctx.fill();
      ctx.strokeStyle = '#b98a2e';
      ctx.lineWidth = 2;
      rr(ctx, s.x + 18, s.y + 10, s.w - 36, s.h - 34, 6);
      ctx.stroke();
      const b = state.board;
      if (b.item) {
        drawFood(ctx, b.item.kind, s.x + s.w / 2, s.y + 30, 30);
        if (b.taps < CHOP_TAPS) {
          // Chop progress as knife ticks.
          for (let i = 0; i < CHOP_TAPS; i++) {
            ctx.fillStyle = i < b.taps ? '#58a34a' : 'rgba(0,0,0,0.3)';
            ctx.fillRect(s.x + 34 + i * 16, s.y + s.h - 30, 12, 6);
          }
        }
      } else {
        text(ctx, 'veg / chicken', s.x + s.w / 2, s.y + 30, 10, '#8a6a45', 'center');
      }
      stationLabel(ctx, s, hl);
      continue;
    }
    if (s.kind === 'wok' || s.kind === 'pot') {
      const cooker = s.kind === 'wok' ? state.wok : state.pot;
      const cookTime = s.kind === 'wok' ? WOK_COOK_TIME : POT_COOK_TIME;
      drawCounter(ctx, s, hl);
      const cx = s.x + s.w / 2;
      const cy = s.y + 42;
      // The vessel.
      ctx.fillStyle = s.kind === 'wok' ? '#3a3a3a' : '#5a6b7a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 44, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.kind === 'wok' ? '#222' : '#42505e';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 36, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      // Flame licking out from under the vessel while cooking.
      if (cooker.item) {
        const flick = Math.sin(state.elapsed * 14) * 2;
        ctx.fillStyle = '#e88a3d';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy + 18);
        ctx.quadraticCurveTo(cx - 10, cy + 30 + flick, cx, cy + 20);
        ctx.quadraticCurveTo(cx + 10, cy + 30 + flick, cx + 26, cy + 18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f2c14e';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy + 20);
        ctx.quadraticCurveTo(cx - 5, cy + 28, cx, cy + 21);
        ctx.quadraticCurveTo(cx + 5, cy + 28, cx + 14, cy + 20);
        ctx.closePath();
        ctx.fill();
      }
      if (cooker.item) {
        drawFood(ctx, cooker.item.kind, cx, cy - 2, 30);
        const label = cookerLabel(cooker, cookTime);
        if (label) text(ctx, label, cx, s.y - 12, 11, cooker.progress / cookTime >= 1 ? '#ff8a80' : '#fff3d6', 'center');
        drawTimingBar(ctx, cx, s.y + s.h - 24, 120, cooker.progress, cookTime);
      } else {
        text(ctx, s.kind === 'wok' ? 'wok station' : 'soup pot', cx, cy, 10, '#8a6a45', 'center');
      }
      stationLabel(ctx, s, hl);
      continue;
    }
    if (s.kind === 'plate') {
      drawCounter(ctx, s, hl);
      const cx = s.x + s.w / 2;
      if (state.plate.dish) {
        drawFood(ctx, state.plate.dish.kind, cx, s.y + 30, 40);
        text(ctx, 'Ready to serve!', cx, s.y + s.h - 26, 10, PAL.gold, 'center');
      } else if (state.plate.items.length > 0) {
        state.plate.items.forEach((it, i) => {
          drawFood(ctx, it.kind, s.x + 28 + i * 36, s.y + 30, 26);
        });
        const remaining = 3 - state.plate.items.length;
        text(ctx, `${remaining} more…`, cx, s.y + s.h - 26, 10, PAL.cream, 'center');
      } else {
        text(ctx, 'assemble dishes', cx, s.y + 30, 10, '#8a6a45', 'center');
      }
      stationLabel(ctx, s, hl);
      continue;
    }
    if (s.kind === 'pass') {
      drawCounter(ctx, s, hl);
      // A service window with a brass bell.
      ctx.fillStyle = '#2b1d12';
      rr(ctx, s.x + 14, s.y + 8, s.w - 28, 22, 6);
      ctx.fill();
      ctx.fillStyle = PAL.brass;
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + 19, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(s.x + s.w / 2 - 8, s.y + 19, 16, 3);
      stationLabel(ctx, s, hl);
      continue;
    }
    if (s.kind === 'bin') {
      // A bin is a can, not a counter.
      ctx.fillStyle = '#4a4a4a';
      rr(ctx, s.x, s.y, s.w, s.h, 8);
      ctx.fill();
      ctx.fillStyle = '#333';
      rr(ctx, s.x + 6, s.y + 6, s.w - 12, s.h - 16, 6);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.moveTo(s.x + s.w / 2 - 12, s.y + 14);
      ctx.lineTo(s.x + s.w / 2 + 12, s.y + 14);
      ctx.lineTo(s.x + s.w / 2 + 6, s.y + 34);
      ctx.lineTo(s.x + s.w / 2 - 6, s.y + 34);
      ctx.closePath();
      ctx.fill();
      stationLabel(ctx, s, hl);
      continue;
    }
  }
}

// ---------------------------------------------------------------- chef
function drawChef(ctx, state) {
  const c = state.chef;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + 14, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: white chef's coat.
  ctx.fillStyle = '#fff8e7';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c8a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
  ctx.stroke();
  // Apron front.
  ctx.fillStyle = '#e8b64c';
  ctx.beginPath();
  ctx.arc(c.x, c.y + 4, 12, 0, Math.PI);
  ctx.fill();
  // Head + toque.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(c.x, c.y - 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 14, 11, 7, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(c.x - 11, c.y - 15, 22, 5);
  // Face: eyes toward the walking direction.
  const dx = c.dir === 'left' ? -3 : c.dir === 'right' ? 3 : 0;
  const dy = c.dir === 'up' ? -3 : c.dir === 'down' ? 3 : 0;
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(c.x - 3.5 + dx, c.y - 4 + dy, 1.6, 0, Math.PI * 2);
  ctx.arc(c.x + 3.5 + dx, c.y - 4 + dy, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // Carried items float beside the chef.
  c.hands.forEach((h, i) => {
    if (!h) return;
    const ix = c.x + (i === 0 ? -26 : 26);
    const iy = c.y - 22;
    ctx.fillStyle = 'rgba(255,248,231,0.92)';
    ctx.beginPath();
    ctx.arc(ix, iy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.brass;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ix, iy, 15, 0, Math.PI * 2);
    ctx.stroke();
    drawFood(ctx, h.kind, ix, iy, 22);
  });
  // Interaction prompt above the chef's head: press E here.
  if (state.hoverStation && state.screen === 'play' && !state.paused) {
    const px = c.x;
    const py = c.y - 42;
    ctx.fillStyle = PAL.brass;
    rr(ctx, px - 14, py - 12, 28, 24, 6);
    ctx.fill();
    text(ctx, 'E', px, py + 1, 15, '#2b1d12', 'center');
  }
}

// ---------------------------------------------------------------- HUD
function drawTickets(ctx, state) {
  let x = 16;
  for (const o of state.orders) {
    const r = RECIPE_BY_ID[o.recipeId];
    const frac = Math.max(0, o.patience / o.maxPatience);
    const urgent = o.patience <= 10;
    const flash = urgent && Math.floor(state.elapsed * 4) % 2 === 0;
    ctx.fillStyle = flash ? '#ffd9d9' : PAL.ticket;
    rr(ctx, x, 8, 158, 56, 8);
    ctx.fill();
    ctx.strokeStyle = urgent ? PAL.red : PAL.brassDark;
    ctx.lineWidth = 2;
    rr(ctx, x, 8, 158, 56, 8);
    ctx.stroke();
    drawFood(ctx, r.dish, x + 24, 30, 30);
    text(ctx, r.short, x + 44, 22, 12, PAL.ink);
    text(ctx, `$${r.price} + tip`, x + 44, 38, 10, '#8a6a45');
    // Patience bar.
    ctx.fillStyle = '#d8c8a8';
    rr(ctx, x + 10, 50, 138, 9, 4);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#4a9a3d' : frac > 0.25 ? '#dd8a00' : '#d64541';
    if (frac > 0.02) {
      rr(ctx, x + 10, 50, 138 * frac, 9, 4);
      ctx.fill();
    }
    x += 168;
  }
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — tickets will appear here', 16, 36, 13, '#bfe3e0');
  }
}

function drawHUD(ctx, state) {
  drawTickets(ctx, state);
  const right = W - 16;
  // Day + shift timer.
  const cfg = DAYS[Math.min(state.day, DAYS.length) - 1];
  text(ctx, cfg.label, right, 18, 13, '#bfe3e0', 'right');
  const lowTime = state.dayTimeLeft <= 30;
  text(ctx, fmtTime(state.dayTimeLeft), right, 44, 22, lowTime ? '#ff8a80' : '#fff3d6', 'right');
  text(ctx, `Score $${state.score}`, right - 150, 44, 18, PAL.gold, 'right');
  if (state.combo >= 2) {
    const cx = right - 330;
    ctx.fillStyle = '#d64541';
    rr(ctx, cx - 46, 30, 92, 26, 13);
    ctx.fill();
    text(ctx, `COMBO x${state.combo}`, cx, 43, 13, '#fff3d6', 'center');
  }
  // Hands indicator (bottom-left, clear of every station).
  const hands = state.chef.hands.map((h) => (h ? ITEMS[h.kind].name : '—')).join(' · ');
  text(ctx, `Hands: ${hands}`, 16, H - 14, 11, 'rgba(255,243,214,0.85)');
  if (state.rush) {
    const pulse = 0.75 + Math.sin(state.elapsed * 6) * 0.25;
    ctx.globalAlpha = pulse;
    text(ctx, 'RUSH HOUR — orders coming fast!', W / 2, HUD_H + 16, 14, '#ffb74d', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawToastsAndFloaters(ctx, state) {
  state.toasts.forEach((t, i) => {
    ctx.globalAlpha = Math.min(1, t.ttl);
    text(ctx, t.text, W / 2, H - 24 - (state.toasts.length - 1 - i) * 22, 14, t.color, 'center');
    ctx.globalAlpha = 1;
  });
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.ttl);
    text(ctx, f.text, f.x, f.y - (1.6 - f.ttl) * 30, 15, f.color, 'center');
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- screens
function overlay(ctx, alpha = 0.78) {
  ctx.fillStyle = `rgba(10, 46, 47, ${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

function drawTitle(ctx, state) {
  overlay(ctx, 0.82);
  // Golden wok emblem.
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.ellipse(W / 2, 150, 90, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(W / 2, 148, 74, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  drawFood(ctx, 'dish-fried-rice', W / 2 - 40, 148, 44);
  drawFood(ctx, 'dish-noodle-soup', W / 2 + 30, 142, 44);
  drawFood(ctx, 'dish-stir-fry', W / 2 + 62, 152, 40);
  text(ctx, 'THE GOLDEN WOK', W / 2, 240, 52, PAL.gold, 'center');
  text(ctx, 'A tiny wok-stall cooking rush', W / 2, 282, 18, PAL.cream, 'center');
  text(ctx, 'Tickets fly in. Chop, fry, boil, plate — and serve before patience runs out.', W / 2, 312, 14, '#bfe3e0', 'center');
  text(ctx, 'Three days. One wok. No take-backs on burnt food.', W / 2, 336, 14, '#bfe3e0', 'center');
  // Recipes.
  let y = 380;
  for (const r of RECIPES) {
    drawFood(ctx, r.dish, 250, y, 30);
    text(ctx, `${r.name} — $${r.price}`, 280, y, 14, '#fff3d6');
    text(ctx, r.blurb, 280, y + 18, 11, '#bfe3e0');
    y += 44;
  }
  text(ctx, 'Move: WASD / Arrows    Interact: E / Space / Click    Pause: P    Mute: M    Help: H', W / 2, 530, 13, PAL.cream, 'center');
  const blink = Math.floor(state.elapsed * 2) % 2 === 0;
  if (blink) text(ctx, 'Press ENTER to open the stall', W / 2, 576, 20, PAL.gold, 'center');
}

function drawHelp(ctx) {
  overlay(ctx, 0.85);
  text(ctx, 'HOW TO COOK', W / 2, 90, 32, PAL.gold, 'center');
  const lines = [
    ['Move', 'WASD or arrow keys. Click a station within reach to use it too.'],
    ['Grab', 'E at the Pantry takes an ingredient. You carry at most 2 things.'],
    ['Chop', 'Put veg or chicken on the Chopping Board, then tap E 4 times.'],
    ['Cook', 'Wok: rice, egg, chopped veg, chopped chicken. Pot: noodles, sauce.'],
    ['Timing', 'Take food off in the GREEN zone for a perfect cook (+$2). Too long = burnt!'],
    ['Plate', 'Drop 3 matching pieces on the Plating Counter to finish a dish.'],
    ['Serve', 'Carry the dish to the Serving Pass before the ticket runs out.'],
    ['Tips', 'Fast serves earn tips. Serves in a row build a combo bonus.'],
    ['Burnt?', 'Bin it. An expired ticket breaks your combo.'],
  ];
  let y = 140;
  for (const [k, v] of lines) {
    text(ctx, k, 170, y, 15, PAL.gold);
    text(ctx, v, 280, y, 14, '#fff3d6');
    y += 34;
  }
  text(ctx, 'Press H or Esc to close', W / 2, 560, 15, PAL.cream, 'center');
}

function drawDayClear(ctx, state) {
  overlay(ctx, 0.8);
  text(ctx, `Day ${state.day} done!`, W / 2, 180, 40, PAL.gold, 'center');
  text(ctx, `Dishes served today: ${state.dayDishes}`, W / 2, 250, 18, '#fff3d6', 'center');
  text(ctx, `Tips earned today: $${state.dayTips}`, W / 2, 284, 18, '#fff3d6', 'center');
  text(ctx, `Orders lost: ${state.dayExpired}`, W / 2, 318, 18, '#fff3d6', 'center');
  text(ctx, `Total score: $${state.score}   •   Best combo: x${state.bestCombo}`, W / 2, 362, 18, PAL.cream, 'center');
  const next = DAYS[Math.min(state.day, DAYS.length - 1)];
  text(ctx, `Next: ${next.label} — faster tickets, shorter patience`, W / 2, 420, 15, '#bfe3e0', 'center');
  const blink = Math.floor(state.elapsed * 2) % 2 === 0;
  if (blink) text(ctx, 'Press ENTER for the next day', W / 2, 480, 20, PAL.gold, 'center');
}

function drawWin(ctx, state) {
  overlay(ctx, 0.82);
  text(ctx, 'STALL CLOSED — WHAT A SHIFT!', W / 2, 150, 36, PAL.gold, 'center');
  text(ctx, 'Three days, one wok, and a street full of happy eaters.', W / 2, 196, 16, '#fff3d6', 'center');
  const rows = [
    ['Final score', `$${state.score}`],
    ['Dishes served', `${state.dishesServed}`],
    ['Tips earned', `$${state.tipsEarned}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Orders lost', `${state.expiredOrders}`],
    ['Perfect cooks', `${state.perfectCooks}`],
  ];
  let y = 260;
  for (const [k, v] of rows) {
    text(ctx, k, W / 2 - 140, y, 18, '#bfe3e0');
    text(ctx, v, W / 2 + 140, y, 18, PAL.gold, 'right');
    y += 38;
  }
  const blink = Math.floor(state.elapsed * 2) % 2 === 0;
  if (blink) text(ctx, 'Press R to cook again', W / 2, 540, 20, PAL.gold, 'center');
}

function drawPause(ctx) {
  overlay(ctx, 0.6);
  text(ctx, 'PAUSED', W / 2, H / 2 - 10, 44, PAL.cream, 'center');
  text(ctx, 'P / Esc to resume  •  R to restart  •  M to mute', W / 2, H / 2 + 40, 15, '#bfe3e0', 'center');
}

// ---------------------------------------------------------------- main entry
export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);
  drawFloor(ctx);
  drawStations(ctx, state);
  drawChef(ctx, state);
  drawHUD(ctx, state);
  drawToastsAndFloaters(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  else if (state.screen === 'dayclear') drawDayClear(ctx, state);
  else if (state.screen === 'win') drawWin(ctx, state);
  else if (state.paused) drawPause(ctx);
  if (state.showHelp) drawHelp(ctx);
}
