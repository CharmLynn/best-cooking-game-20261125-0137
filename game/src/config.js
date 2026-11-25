// The Golden Wok — configuration: recipes, stations, palette, day pacing.
// Every number here is a design choice for this game only.

export const W = 960;
export const H = 640;
export const HUD_H = 72;
export const CHEF_R = 18;
export const CHEF_SPEED = 215;
export const HANDS = 2;

// ---- palette: warm wok-stall kitchen --------------------------------------
export const PAL = {
  wall: '#0f3d3e',
  wallDark: '#0a2e2f',
  floor: '#8a5a33',
  floorAlt: '#7d4f2c',
  floorLine: '#6e4526',
  counter: '#b07a45',
  counterTop: '#c98f52',
  counterEdge: '#7c4f27',
  brass: '#e8b64c',
  brassDark: '#b98a2e',
  cream: '#fff3d6',
  ink: '#2b1d12',
  red: '#d64541',
  green: '#58a34a',
  gold: '#f2c14e',
  ticket: '#fff8e7',
};

// ---- ingredients -----------------------------------------------------------
export const ITEMS = {
  rice: { name: 'Rice', color: '#f5f0e1', raw: true },
  noodles: { name: 'Noodles', color: '#f2c14e', raw: true },
  veg: { name: 'Veg', color: '#58a34a', raw: true },
  egg: { name: 'Egg', color: '#fff3d6', raw: true },
  chicken: { name: 'Chicken', color: '#f2a0a0', raw: true },
  sauce: { name: 'Sauce', color: '#7a4a21', raw: true },
  'chopped-veg': { name: 'Chopped Veg', color: '#7cc46a' },
  'chopped-chicken': { name: 'Chopped Chicken', color: '#f2b8b8' },
  'cooked-rice': { name: 'Steamed Rice', color: '#fffaf0' },
  'fried-egg': { name: 'Fried Egg', color: '#ffd94d' },
  'wok-veg': { name: 'Wok Veg', color: '#4d8f3f' },
  'wok-chicken': { name: 'Wok Chicken', color: '#e08a5a' },
  'cooked-noodles': { name: 'Cooked Noodles', color: '#f7cd6a' },
  broth: { name: 'Broth', color: '#d98a3d' },
  'dish-fried-rice': { name: 'Golden Fried Rice', color: '#f2c14e' },
  'dish-noodle-soup': { name: 'Chicken Noodle Soup', color: '#f7cd6a' },
  'dish-stir-fry': { name: 'Garlic Stir-Fry', color: '#8a5a33' },
  burnt: { name: 'Burnt!', color: '#2b2b2b' },
};

// What each station turns an item into.
export const CHOP_MAP = { veg: 'chopped-veg', chicken: 'chopped-chicken' };
export const WOK_MAP = {
  rice: 'cooked-rice',
  egg: 'fried-egg',
  'chopped-veg': 'wok-veg',
  'chopped-chicken': 'wok-chicken',
};
export const POT_MAP = { noodles: 'cooked-noodles', sauce: 'broth' };

export const WOK_COOK_TIME = 5; // seconds to fully cook in the wok
export const POT_COOK_TIME = 6; // seconds to fully cook in the pot
export const CHOP_TAPS = 4; // taps to finish chopping
export const PERFECT_LOW = 0.55; // green zone of the timing bar
export const PERFECT_HIGH = 0.85;

// ---- recipes ---------------------------------------------------------------
export const RECIPES = [
  {
    id: 'fried-rice',
    name: 'Golden Fried Rice',
    short: 'Fried Rice',
    dish: 'dish-fried-rice',
    price: 12,
    needs: ['cooked-rice', 'fried-egg', 'chopped-veg'],
    blurb: 'Rice + egg in the wok, chopped veg on top',
  },
  {
    id: 'noodle-soup',
    name: 'Chicken Noodle Soup',
    short: 'Noodle Soup',
    dish: 'dish-noodle-soup',
    price: 14,
    needs: ['cooked-noodles', 'broth', 'chopped-chicken'],
    blurb: 'Noodles + broth from the pot, chopped chicken',
  },
  {
    id: 'stir-fry',
    name: 'Garlic Stir-Fry',
    short: 'Stir-Fry',
    dish: 'dish-stir-fry',
    price: 13,
    needs: ['wok-veg', 'wok-chicken', 'sauce'],
    blurb: 'Veg + chicken through the wok, sauce to finish',
  },
];
export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const RECIPE_BY_DISH = Object.fromEntries(RECIPES.map((r) => [r.dish, r]));

// ---- stations (top-down kitchen) ------------------------------------------
export const STATIONS = [
  { id: 'pantry', name: 'Pantry', x: 24, y: 84, w: 288, h: 58, kind: 'pantry' },
  { id: 'board', name: 'Chopping Board', x: 24, y: 250, w: 128, h: 84, kind: 'board' },
  { id: 'wok', name: 'Wok', x: 56, y: 508, w: 168, h: 92, kind: 'wok' },
  { id: 'pot', name: 'Soup Pot', x: 736, y: 508, w: 168, h: 92, kind: 'pot' },
  { id: 'plate', name: 'Plating Counter', x: 808, y: 250, w: 128, h: 84, kind: 'plate' },
  { id: 'pass', name: 'Serving Pass', x: 648, y: 84, w: 288, h: 58, kind: 'pass' },
  { id: 'bin', name: 'Bin', x: 428, y: 566, w: 104, h: 58, kind: 'bin' },
];
export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

// Pantry bins sit on the pantry counter, left to right.
export const PANTRY_BINS = [
  { kind: 'rice', x: 30, y: 90 },
  { kind: 'noodles', x: 76, y: 90 },
  { kind: 'veg', x: 122, y: 90 },
  { kind: 'egg', x: 168, y: 90 },
  { kind: 'chicken', x: 214, y: 90 },
  { kind: 'sauce', x: 260, y: 90 },
];
export const BIN_W = 40;
export const BIN_H = 46;

// ---- day pacing -------------------------------------------------------------
export const DAYS = [
  { day: 1, length: 150, spawnEvery: 22, patience: 75, maxOrders: 2, label: 'Day 1 — Opening Lunch' },
  { day: 2, length: 150, spawnEvery: 16, patience: 60, maxOrders: 3, label: 'Day 2 — Word Gets Out' },
  { day: 3, length: 150, spawnEvery: 11, patience: 48, maxOrders: 3, label: 'Day 3 — Rush Hour' },
];
export const RUSH_AT = 45; // last 45s of day 3: double order rate
export const RUSH_SPAWN = 7;

export const TIP_MAX = 6; // max tip for a lightning-fast serve
export const PERFECT_BONUS = 2; // extra per perfectly-timed cook

export function isDish(kind) {
  return kind != null && kind.startsWith('dish-');
}
export function isComponent(kind) {
  return kind != null && !isDish(kind) && kind !== 'burnt';
}
