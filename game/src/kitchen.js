// The Golden Wok — kitchen stations: what E (or a click) does at each one,
// and how chopping and cooking advance over time.
import {
  STATIONS,
  STATION_BY_ID,
  PANTRY_BINS,
  BIN_W,
  BIN_H,
  CHOP_MAP,
  WOK_MAP,
  POT_MAP,
  CHOP_TAPS,
  WOK_COOK_TIME,
  POT_COOK_TIME,
  PERFECT_LOW,
  PERFECT_HIGH,
  RECIPES,
  isDish,
  isComponent,
} from './config.js';
import { sfx } from './audio.js';
import { serveDish, addToast, addFloater } from './orders.js';

const REACH = 78; // how close the chef must stand to use a station

function distToRect(px, py, r) {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy);
}

export function nearestStation(chef) {
  let best = null;
  let bestD = Infinity;
  for (const s of STATIONS) {
    const d = distToRect(chef.x, chef.y, s);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return bestD <= REACH ? best : null;
}

export function pantryBinAt(px, py) {
  for (const b of PANTRY_BINS) {
    if (px >= b.x && px <= b.x + BIN_W && py >= b.y && py <= b.y + BIN_H) return b;
  }
  return null;
}

// ---- hands -----------------------------------------------------------------
function freeHand(state) {
  return state.chef.hands.findIndex((h) => h == null);
}
function takeItem(state, kind) {
  const i = freeHand(state);
  if (i === -1) return false;
  state.chef.hands[i] = { kind };
  return true;
}
// First hand holding an item that matches `pred(kind)`; null when none.
function heldMatching(state, pred) {
  const i = state.chef.hands.findIndex((h) => h && pred(h.kind));
  return i === -1 ? null : { index: i, item: state.chef.hands[i] };
}
function removeHeldAt(state, i) {
  state.chef.hands[i] = null;
}

// ---- cooking ----------------------------------------------------------------
function cookerState(cooker, cookTime) {
  if (!cooker.item) return 'empty';
  const p = cooker.progress / cookTime;
  if (p >= 1) return 'burnt';
  if (p >= PERFECT_HIGH) return 'cooked';
  if (p >= PERFECT_LOW) return 'perfect';
  return 'cooking';
}

function takeFromCooker(state, cooker, cookTime, map, label) {
  if (!cooker.item) {
    addToast(state, `${label} is empty`);
    return;
  }
  const p = cooker.progress / cookTime;
  if (p < PERFECT_LOW) {
    addToast(state, 'Still cooking — wait for the green zone!');
    return;
  }
  if (freeHand(state) === -1) {
    addToast(state, 'Hands full!');
    return;
  }
  const input = cooker.item.kind;
  if (p >= 1) {
    cooker.item = null;
    cooker.progress = 0;
    takeItem(state, 'burnt');
    addToast(state, 'Burnt! Bin it.', '#d64541');
    sfx.burnt();
    return;
  }
  const out = map[input];
  cooker.item = null;
  cooker.progress = 0;
  takeItem(state, out);
  if (p >= PERFECT_LOW && p < PERFECT_HIGH) {
    state.pendingPerfect = (state.pendingPerfect || 0) + 1;
    state.perfectCooks = (state.perfectCooks || 0) + 1;
    addFloater(state, state.chef.x, state.chef.y - 34, 'PERFECT!', '#7cc46a');
    sfx.perfect();
  } else {
    sfx.pickup();
  }
}

export function updateCooking(state, dt) {
  for (const cooker of [state.wok, state.pot]) {
    if (!cooker.item) continue;
    cooker.progress += dt;
    const cookTime = cooker.kind === 'wok' ? WOK_COOK_TIME : POT_COOK_TIME;
    if (cooker.progress >= cookTime && !cooker.burntFlag) {
      cooker.burntFlag = true;
      addToast(state, 'Something is burning!', '#d64541');
      sfx.burnt();
    }
  }
}

// ---- plating -----------------------------------------------------------------
function tryFuseDish(state) {
  const kinds = state.plate.items.map((i) => i.kind).sort();
  for (const r of RECIPES) {
    const needs = [...r.needs].sort();
    if (kinds.length === needs.length && kinds.every((k, i) => k === needs[i])) {
      state.plate.items = [];
      state.plate.dish = { kind: r.dish, perfectCooks: state.pendingPerfect || 0 };
      state.pendingPerfect = 0;
      sfx.dishReady();
      addFloater(state, 872, 220, `${r.short} ready!`, '#f2c14e');
      return true;
    }
  }
  return false;
}

// ---- the one big interact -----------------------------------------------------
export function interact(state) {
  const chef = state.chef;
  const station = nearestStation(chef);
  if (!station) {
    addToast(state, 'Move closer to a station');
    return;
  }
  const anyHeld = heldMatching(state, () => true);

  if (station.kind === 'pantry') {
    // Pick up from the bin nearest the chef.
    let bin = null;
    let bestD = Infinity;
    for (const b of PANTRY_BINS) {
      const d = Math.hypot(chef.x - (b.x + BIN_W / 2), chef.y - (b.y + BIN_H / 2));
      if (d < bestD) {
        bestD = d;
        bin = b;
      }
    }
    if (freeHand(state) === -1) {
      addToast(state, 'Hands full!');
      return;
    }
    takeItem(state, bin.kind);
    sfx.pickup();
    return;
  }

  if (station.kind === 'board') {
    const board = state.board;
    if (!board.item) {
      const choppable = heldMatching(state, (k) => !!CHOP_MAP[k]);
      if (!choppable) {
        addToast(state, anyHeld ? 'That does not need chopping' : 'Bring veg or chicken to chop');
        return;
      }
      removeHeldAt(state, choppable.index);
      board.item = { kind: choppable.item.kind };
      board.taps = 0;
      sfx.place();
      return;
    }
    if (board.taps < CHOP_TAPS) {
      board.taps += 1;
      sfx.chop();
      if (board.taps >= CHOP_TAPS) {
        addToast(state, 'Chopped! Pick it up', '#7cc46a');
      }
      return;
    }
    if (freeHand(state) === -1) {
      addToast(state, 'Hands full!');
      return;
    }
    takeItem(state, CHOP_MAP[board.item.kind]);
    board.item = null;
    board.taps = 0;
    sfx.pickup();
    return;
  }

  if (station.kind === 'wok' || station.kind === 'pot') {
    const cooker = station.kind === 'wok' ? state.wok : state.pot;
    const cookTime = station.kind === 'wok' ? WOK_COOK_TIME : POT_COOK_TIME;
    const map = station.kind === 'wok' ? WOK_MAP : POT_MAP;
    if (!cooker.item) {
      const cookable = heldMatching(state, (k) => !!map[k]);
      if (!cookable) {
        addToast(
          state,
          anyHeld ? `The ${station.kind} cannot cook that` : `Bring something for the ${station.kind}`,
        );
        return;
      }
      removeHeldAt(state, cookable.index);
      cooker.item = { kind: cookable.item.kind };
      cooker.progress = 0;
      cooker.burntFlag = false;
      if (station.kind === 'wok') sfx.sizzle();
      else sfx.plop();
      return;
    }
    takeFromCooker(state, cooker, cookTime, map, station.kind === 'wok' ? 'Wok' : 'Pot');
    return;
  }

  if (station.kind === 'plate') {
    if (state.plate.dish) {
      if (freeHand(state) === -1) {
        addToast(state, 'Hands full!');
        return;
      }
      takeItem(state, state.plate.dish.kind);
      state.plate.dish = null;
      sfx.pickup();
      return;
    }
    const held = heldMatching(state, isComponent);
    if (held) {
      if (state.plate.items.length >= 3) {
        addToast(state, 'Plate is full — serve it or bin a piece');
        return;
      }
      removeHeldAt(state, held.index);
      state.plate.items.push({ kind: held.item.kind });
      sfx.place();
      tryFuseDish(state);
      return;
    }
    if (!held && state.plate.items.length > 0) {
      const last = state.plate.items.pop();
      takeItem(state, last.kind);
      sfx.pickup();
      return;
    }
    addToast(state, anyHeld ? 'That cannot go on a plate' : 'Bring plate components here');
    return;
  }

  if (station.kind === 'pass') {
    const dish = heldMatching(state, isDish);
    if (!dish) {
      addToast(state, anyHeld ? 'Only a finished dish goes to the pass' : 'Bring a finished dish here');
      return;
    }
    const result = serveDish(state, dish.item);
    if (result.ok) {
      removeHeldAt(state, dish.index);
      // Perfectly timed cooks on this order earn their bonus through the ticket.
      addFloater(state, 792, 150, result.message, '#f2c14e');
    } else {
      addToast(state, result.message, '#d64541');
    }
    return;
  }

  if (station.kind === 'bin') {
    if (!anyHeld) {
      addToast(state, 'Nothing to throw away');
      return;
    }
    removeHeldAt(state, anyHeld.index);
    sfx.toss();
    addToast(state, `Binned the ${anyHeld.item.kind.replace(/-/g, ' ')}`);
    return;
  }
}

// Clicking a station within reach does the same as pressing E. Clicking a
// pantry bin picks that ingredient up directly.
export function clickAt(state, px, py) {
  const bin = pantryBinAt(px, py);
  const station = STATIONS.find((s) => px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h);
  if (station && station.kind === 'pantry' && bin) {
    if (distToRect(state.chef.x, state.chef.y, station) > REACH) {
      addToast(state, 'Move closer to the pantry');
      return;
    }
    if (freeHand(state) === -1) {
      addToast(state, 'Hands full!');
      return;
    }
    takeItem(state, bin.kind);
    sfx.pickup();
    return;
  }
  if (station) {
    if (distToRect(state.chef.x, state.chef.y, station) > REACH) {
      addToast(state, `Move closer to the ${station.name}`);
      return;
    }
    interact(state);
  }
}

export function cookerLabel(cooker, cookTime) {
  const st = cookerState(cooker, cookTime);
  if (st === 'empty') return '';
  if (st === 'burnt') return 'BURNT!';
  if (st === 'perfect') return 'PERFECT — take it!';
  if (st === 'cooked') return 'Ready — take it!';
  return 'Cooking…';
}
