// The Golden Wok — game loop, screens, movement and demo staging.
// Wires config + kitchen + orders + audio + input + render together.
import { W, H, HUD_H, CHEF_R, CHEF_SPEED, STATIONS, STATION_BY_ID, DAYS } from './config.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { createInput } from './input.js';
import { dayConfig, spawnOrder, updateOrders, addToast, addFloater } from './orders.js';
import { nearestStation, interact, clickAt, updateCooking } from './kitchen.js';
import { render } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

function freshState() {
  return {
    screen: 'title', // title | play | dayclear | win
    showHelp: false,
    paused: false,
    muted: false,
    elapsed: 0,
    day: 1,
    dayTimeLeft: DAYS[0].length,
    spawnTimer: 4,
    rush: false,
    score: 0,
    combo: 0,
    bestCombo: 0,
    dishesServed: 0,
    tipsEarned: 0,
    expiredOrders: 0,
    perfectCooks: 0,
    pendingPerfect: 0,
    dayDishes: 0,
    dayTips: 0,
    dayExpired: 0,
    chef: { x: 480, y: 380, dir: 'down', moving: false, hands: [null, null] },
    board: { item: null, taps: 0 },
    wok: { kind: 'wok', item: null, progress: 0, burntFlag: false },
    pot: { kind: 'pot', item: null, progress: 0, burntFlag: false },
    plate: { items: [], dish: null },
    orders: [],
    toasts: [],
    floaters: [],
    hoverStation: null,
  };
}

let state = freshState();

function startDay(day) {
  const cfg = dayConfig(day);
  state.day = day;
  state.dayTimeLeft = cfg.length;
  state.spawnTimer = 3;
  state.orders = [];
  state.board = { item: null, taps: 0 };
  state.wok = { kind: 'wok', item: null, progress: 0, burntFlag: false };
  state.pot = { kind: 'pot', item: null, progress: 0, burntFlag: false };
  state.plate = { items: [], dish: null };
  state.chef.hands = [null, null];
  state.chef.x = 480;
  state.chef.y = 380;
  state.dayDishes = 0;
  state.dayTips = 0;
  state.dayExpired = 0;
  state.screen = 'play';
  state.paused = false;
  state.toasts = [];
  addToast(state, cfg.label, '#f2c14e');
  spawnOrder(state);
}

function endDay() {
  state.dayTips = state.tipsEarned - (state.prevTips || 0);
  state.prevTips = state.tipsEarned;
  state.dayExpired = state.expiredOrders - (state.prevExpired || 0);
  state.prevExpired = state.expiredOrders;
  if (state.day >= 3) {
    state.screen = 'win';
    sfx.win();
  } else {
    state.screen = 'dayclear';
    sfx.dayClear();
  }
  input.flush();
}

function restart() {
  const muted = state.muted;
  state = freshState();
  state.muted = muted;
  setMuted(muted);
  input.flush();
}

// ---- movement with station collision ---------------------------------------
function collides(x, y) {
  if (x < 20 + CHEF_R || x > W - 20 - CHEF_R) return true;
  if (y < HUD_H + 8 + CHEF_R || y > H - 16 - CHEF_R) return true;
  for (const s of STATIONS) {
    const pad = CHEF_R - 6;
    if (x > s.x - pad && x < s.x + s.w + pad && y > s.y - pad && y < s.y + s.h + pad) {
      return true;
    }
  }
  return false;
}

function moveChef(dt) {
  const v = input.moveVector();
  const c = state.chef;
  if (v.x === 0 && v.y === 0) {
    c.moving = false;
    return;
  }
  c.moving = true;
  if (Math.abs(v.x) > Math.abs(v.y)) c.dir = v.x > 0 ? 'right' : 'left';
  else c.dir = v.y > 0 ? 'down' : 'up';
  const step = CHEF_SPEED * dt;
  const nx = c.x + v.x * step;
  if (!collides(nx, c.y)) c.x = nx;
  const ny = c.y + v.y * step;
  if (!collides(c.x, ny)) c.y = ny;
}

// ---- demo staging for screenshots (real game code, staged state) -----------
function applyDemo(mode) {
  state.screen = 'play';
  state.day = mode === 'cover' ? 2 : 1;
  const cfg = dayConfig(state.day);
  state.dayTimeLeft = mode === 'cover' ? 107 : 132;
  state.score = mode === 'cover' ? 86 : mode === 'serve' ? 124 : 34;
  state.combo = mode === 'serve' ? 4 : mode === 'cover' ? 3 : 0;
  state.bestCombo = state.combo;
  state.dishesServed = mode === 'serve' ? 7 : mode === 'cover' ? 5 : 2;
  state.tipsEarned = Math.floor(state.score * 0.3);
  state.orders = [
    { id: 1, recipeId: 'fried-rice', patience: 52, maxPatience: 75 },
    { id: 2, recipeId: 'noodle-soup', patience: 34, maxPatience: 60 },
    { id: 3, recipeId: 'stir-fry', patience: 18, maxPatience: 60 },
  ];
  if (mode === 'title') {
    state.screen = 'title';
    state.orders = [];
    return;
  }
  if (mode === 'cover') {
    // Mid-rush: chef at the wok with rice cooking in the green zone,
    // chopped veg on the board, a finished fried rice on the plating counter.
    state.chef.x = 235;
    state.chef.y = 465;
    state.chef.dir = 'left';
    state.hoverStation = STATION_BY_ID.wok;
    state.wok = { kind: 'wok', item: { kind: 'rice' }, progress: 3.6, burntFlag: false };
    state.board = { item: { kind: 'veg' }, taps: 4 };
    state.plate = { items: [], dish: { kind: 'dish-fried-rice', perfectCooks: 1 } };
    state.chef.hands = [{ kind: 'chopped-chicken' }, null];
    addFloater(state, 200, 430, 'PERFECT!', '#7cc46a');
  } else if (mode === 'chop') {
    state.chef.x = 168;
    state.chef.y = 292;
    state.chef.dir = 'left';
    state.hoverStation = STATION_BY_ID.board;
    state.board = { item: { kind: 'chicken' }, taps: 2 };
    state.chef.hands = [{ kind: 'veg' }, null];
    state.orders = [{ id: 1, recipeId: 'stir-fry', patience: 44, maxPatience: 60 }];
  } else if (mode === 'serve') {
    state.chef.x = 700;
    state.chef.y = 113;
    state.chef.dir = 'right';
    state.hoverStation = STATION_BY_ID.pass;
    state.chef.hands = [{ kind: 'dish-noodle-soup', perfectCooks: 1 }, null];
    state.orders = [
      { id: 2, recipeId: 'noodle-soup', patience: 41, maxPatience: 60 },
      { id: 3, recipeId: 'fried-rice', patience: 22, maxPatience: 75 },
    ];
    addFloater(state, 792, 150, 'Noodle Soup served! +$18 · tip $4', '#f2c14e');
    state.pot = { kind: 'pot', item: { kind: 'noodles' }, progress: 4.2, burntFlag: false };
  }
}

// ---- per-frame update ---------------------------------------------------------
function update(dt) {
  state.elapsed += dt;
  // Toasts / floaters always tick.
  for (const t of state.toasts) t.ttl -= dt;
  state.toasts = state.toasts.filter((t) => t.ttl > 0);
  for (const f of state.floaters) f.ttl -= dt;
  state.floaters = state.floaters.filter((f) => f.ttl > 0);

  if (input.wasPressed('mute')) {
    state.muted = !state.muted;
    setMuted(state.muted);
    addToast(state, state.muted ? 'Sound off' : 'Sound on');
  }

  if (state.screen === 'title') {
    if (input.wasPressed('confirm') || input.takeClick()) {
      sfx.click();
      startDay(1);
    }
    if (input.wasPressed('help')) state.showHelp = !state.showHelp;
    return;
  }
  if (state.screen === 'dayclear') {
    if (input.wasPressed('confirm') || input.takeClick()) {
      sfx.click();
      startDay(state.day + 1);
    }
    return;
  }
  if (state.screen === 'win') {
    if (input.wasPressed('restart')) restart();
    return;
  }
  if (input.wasPressed('restart')) {
    restart();
    return;
  }
  if (input.wasPressed('pause')) {
    state.paused = !state.paused;
    input.flush();
    return;
  }
  if (input.wasPressed('help')) {
    state.showHelp = !state.showHelp;
    input.flush();
    return;
  }
  if (state.showHelp) return;
  if (state.paused) return;

  // Play.
  moveChef(dt);
  state.hoverStation = nearestStation(state.chef);
  if (input.wasPressed('interact')) interact(state);
  const click = input.takeClick();
  if (click) clickAt(state, click.x, click.y);
  updateCooking(state, dt);
  updateOrders(state, dt);

  state.dayTimeLeft -= dt;
  if (state.dayTimeLeft <= 0) {
    state.dayTimeLeft = 0;
    endDay();
  }
}

// Expose a small debug surface for play-testing (not part of the game UI).
window.__goldenWok = {
  state: () => state,
  startDay,
  applyDemo,
  restart,
};

const params = new URLSearchParams(location.search);
const demo = params.get('demo');
if (demo) {
  applyDemo(demo);
  // Freeze game time in demo mode so screenshots are deterministic:
  // visuals stay alive (flames flicker, clock blinks) but the shift timer
  // and order patience do not drain.
  state.demoMode = true;
}

let last = performance.now();
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  if (state.demoMode) {
    state.elapsed += dt;
    for (const f of state.floaters) f.ttl -= dt * 0.2;
    state.floaters = state.floaters.filter((f) => f.ttl > 0);
    render(ctx, state);
  } else {
    update(dt);
    render(ctx, state);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
