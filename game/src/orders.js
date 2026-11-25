// The Golden Wok — orders: spawning, patience, serving, tips and combos.
import { DAYS, RUSH_AT, RUSH_SPAWN, RECIPES, RECIPE_BY_DISH, TIP_MAX, PERFECT_BONUS } from './config.js';
import { sfx } from './audio.js';

let nextOrderId = 1;

export function dayConfig(day) {
  return DAYS[Math.min(day, DAYS.length) - 1];
}

export function spawnOrder(state) {
  const cfg = dayConfig(state.day);
  if (state.orders.length >= cfg.maxOrders) return;
  // Avoid repeating the same recipe twice in a row when there is a choice.
  let recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  if (state.orders.length > 0) {
    const last = state.orders[state.orders.length - 1].recipeId;
    if (recipe.id === last && RECIPES.length > 1) {
      recipe = RECIPES[(RECIPES.indexOf(recipe) + 1) % RECIPES.length];
    }
  }
  state.orders.push({
    id: nextOrderId++,
    recipeId: recipe.id,
    patience: cfg.patience,
    maxPatience: cfg.patience,
    bornAt: state.elapsed,
  });
  sfx.newOrder();
}

export function updateOrders(state, dt) {
  const cfg = dayConfig(state.day);
  // Spawn timer; rush hour on the last stretch of day 3 doubles the rate.
  const rush = state.day === 3 && state.dayTimeLeft <= RUSH_AT;
  state.rush = rush;
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnOrder(state);
    state.spawnTimer = rush ? RUSH_SPAWN : cfg.spawnEvery;
  }
  // Patience drains; an expired ticket is lost and breaks the combo.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const o = state.orders[i];
    o.patience -= dt;
    if (o.patience <= 10 && !o.alarmed) {
      o.alarmed = true;
      sfx.alarm();
    }
    if (o.patience <= 0) {
      state.orders.splice(i, 1);
      state.expiredOrders += 1;
      if (state.combo > 0) {
        addToast(state, 'Order walked out — combo lost', '#d64541');
      }
      state.combo = 0;
      sfx.expire();
    }
  }
}

// Serve a plated dish. Returns { ok, amount, message }.
export function serveDish(state, dish) {
  const dishKind = typeof dish === 'string' ? dish : dish.kind;
  const recipe = RECIPE_BY_DISH[dishKind];
  if (!recipe) return { ok: false, amount: 0, message: 'That is not a dish' };
  const idx = state.orders.findIndex((o) => o.recipeId === recipe.id);
  if (idx === -1) {
    return { ok: false, amount: 0, message: `No order for ${recipe.short} right now` };
  }
  const order = state.orders[idx];
  state.orders.splice(idx, 1);
  const patienceFrac = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(TIP_MAX * patienceFrac);
  const comboBonus = state.combo >= 2 ? Math.min(5, state.combo) : 0;
  const perfectBonus = ((typeof dish === 'object' && dish.perfectCooks) || 0) * PERFECT_BONUS;
  const amount = recipe.price + tip + comboBonus + perfectBonus;
  state.score += amount;
  state.tipsEarned += tip + comboBonus + perfectBonus;
  state.dishesServed += 1;
  state.dayDishes += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const bits = [`+$${amount}`];
  if (tip > 0) bits.push(`tip $${tip}`);
  if (comboBonus > 0) bits.push(`combo +$${comboBonus}`);
  if (perfectBonus > 0) bits.push(`perfect +$${perfectBonus}`);
  sfx.serve();
  if (perfectBonus > 0) sfx.perfect();
  return { ok: true, amount, message: `${recipe.short} served! ${bits.join(' · ')}` };
}

export function addToast(state, text, color = '#fff3d6') {
  state.toasts.push({ text, color, ttl: 2.6 });
  if (state.toasts.length > 3) state.toasts.shift();
}

export function addFloater(state, x, y, text, color = '#f2c14e') {
  state.floaters.push({ x, y, text, color, ttl: 1.6 });
  if (state.floaters.length > 8) state.floaters.shift();
}
