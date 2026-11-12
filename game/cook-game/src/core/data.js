// ---------------------------------------------------------------------------
// Shared game data. This module is engine-agnostic: no DOM, no three.js.
// Both game modes (first-person 3D and 2D arcade) read the same recipes,
// stations, room layout and shift definitions from here.
// ---------------------------------------------------------------------------

/** Station footprints and room dimensions, in metres. */
export const ROOM = {
  minX: -5,
  maxX: 5,
  minZ: -3.5,
  maxZ: 3.5,
  wallHeight: 3.0,
};

export const INGREDIENTS = {
  bun: {
    id: 'bun',
    name: '面包',
    emoji: '🍞',
    choppable: false,
    cookable: false,
    color: 0xe0a75c,
  },
  patty: {
    id: 'patty',
    name: '肉饼',
    emoji: '🥩',
    choppable: false,
    cookable: true,
    cookTime: 5.5,
    burnTime: 10.5,
    color: 0xa9513f,
    cookedColor: 0x7a3a28,
    burntColor: 0x2a1b16,
  },
  cheese: {
    id: 'cheese',
    name: '芝士',
    emoji: '🧀',
    choppable: false,
    cookable: false,
    color: 0xf3c845,
  },
  lettuce: {
    id: 'lettuce',
    name: '生菜',
    emoji: '🥬',
    choppable: true,
    chopTime: 1.0,
    cookable: false,
    color: 0x6fbf4a,
  },
  tomato: {
    id: 'tomato',
    name: '番茄',
    emoji: '🍅',
    choppable: true,
    chopTime: 1.1,
    cookable: false,
    color: 0xd94a3a,
  },
  onion: {
    id: 'onion',
    name: '洋葱',
    emoji: '🧅',
    choppable: true,
    chopTime: 1.2,
    cookable: false,
    color: 0xc9a0d8,
  },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'];

const raw = (ingredient) => ({ ingredient, state: 'raw' });
const chopped = (ingredient) => ({ ingredient, state: 'chopped' });
const cooked = (ingredient) => ({ ingredient, state: 'cooked' });

/**
 * A recipe lists the exact topping multiset a finished dish must have.
 * State matters: a raw patty never matches a cheeseburger.
 */
export const RECIPES = {
  salad: {
    id: 'salad',
    name: '田园沙拉',
    emoji: '🥗',
    score: 90,
    orderTime: 62,
    tier: 1,
    tags: ['fresh', 'light', 'veg', 'classic'],
    ingredients: [chopped('lettuce'), chopped('tomato'), chopped('onion')],
    desc: '生菜 + 番茄 + 洋葱（全部切好）',
    tint: '#7fd05a',
  },
  cheeseburger: {
    id: 'cheeseburger',
    name: '芝士汉堡',
    emoji: '🍔',
    score: 130,
    orderTime: 72,
    tier: 2,
    tags: ['hearty', 'cheese', 'beef', 'classic'],
    ingredients: [raw('bun'), cooked('patty'), raw('cheese'), chopped('lettuce'), chopped('tomato')],
    desc: '面包 + 熟肉饼 + 芝士 + 生菜碎 + 番茄碎',
    tint: '#ffb348',
  },
  double: {
    id: 'double',
    name: '双层芝士堡',
    emoji: '🍔',
    score: 185,
    orderTime: 82,
    tier: 3,
    tags: ['hearty', 'cheese', 'beef', 'double'],
    ingredients: [
      raw('bun'),
      cooked('patty'),
      cooked('patty'),
      raw('cheese'),
      chopped('lettuce'),
      chopped('tomato'),
    ],
    desc: '面包 + 双熟肉饼 + 芝士 + 生菜碎 + 番茄碎',
    tint: '#ff7a45',
  },
  garden_salad: {
    id: 'garden_salad',
    name: '番茄生菜杯',
    emoji: '🥬',
    score: 65,
    orderTime: 55,
    tier: 1,
    tags: ['fresh', 'light', 'veg', 'tomato'],
    ingredients: [chopped('lettuce'), chopped('tomato')],
    desc: '生菜碎 + 番茄碎（清爽小份）',
    tint: '#9bdc6a',
  },
  tomato_toast: {
    id: 'tomato_toast',
    name: '番茄芝士烤面包',
    emoji: '🍞',
    score: 80,
    orderTime: 58,
    tier: 1,
    tags: ['fresh', 'cheese', 'tomato', 'light'],
    ingredients: [raw('bun'), raw('cheese'), chopped('tomato')],
    desc: '面包 + 芝士 + 番茄碎',
    tint: '#ffcf70',
  },
  veggie_burger: {
    id: 'veggie_burger',
    name: '田园素堡',
    emoji: '🥙',
    score: 110,
    orderTime: 68,
    tier: 2,
    tags: ['fresh', 'veg', 'cheese', 'light'],
    ingredients: [raw('bun'), raw('cheese'), chopped('lettuce'), chopped('tomato'), chopped('onion')],
    desc: '面包 + 芝士 + 生菜碎 + 番茄碎 + 洋葱碎',
    tint: '#b7df6a',
  },
  onion_burger: {
    id: 'onion_burger',
    name: '洋葱牛肉堡',
    emoji: '🍔',
    score: 125,
    orderTime: 70,
    tier: 2,
    tags: ['hearty', 'beef', 'onion', 'classic'],
    ingredients: [raw('bun'), cooked('patty'), raw('cheese'), chopped('onion')],
    desc: '面包 + 熟肉饼 + 芝士 + 洋葱碎',
    tint: '#e8a24b',
  },
  cheese_salad: {
    id: 'cheese_salad',
    name: '芝士脆蔬',
    emoji: '🥗',
    score: 115,
    orderTime: 70,
    tier: 2,
    tags: ['fresh', 'cheese', 'veg', 'onion'],
    ingredients: [chopped('lettuce'), chopped('tomato'), chopped('onion'), raw('cheese')],
    desc: '生菜碎 + 番茄碎 + 洋葱碎 + 芝士',
    tint: '#d7c65a',
  },
  deluxe: {
    id: 'deluxe',
    name: '全料豪华堡',
    emoji: '🍔',
    score: 180,
    orderTime: 80,
    tier: 3,
    tags: ['hearty', 'cheese', 'beef', 'onion', 'double'],
    ingredients: [
      raw('bun'),
      cooked('patty'),
      raw('cheese'),
      chopped('lettuce'),
      chopped('tomato'),
      chopped('onion'),
    ],
    desc: '面包 + 熟肉饼 + 芝士 + 生菜碎 + 番茄碎 + 洋葱碎',
    tint: '#ff9a4d',
  },
  double_onion: {
    id: 'double_onion',
    name: '洋葱双层堡',
    emoji: '🍔',
    score: 170,
    orderTime: 78,
    tier: 3,
    tags: ['hearty', 'beef', 'onion', 'double'],
    ingredients: [raw('bun'), cooked('patty'), cooked('patty'), chopped('onion')],
    desc: '面包 + 双熟肉饼 + 洋葱碎',
    tint: '#e07a45',
  },
};

/**
 * Station layout shared by both modes. `x`/`z` are the station centre in
 * metres; the 2D mode maps x→screen-x and z→screen-y. `w`/`d` are footprint.
 */
export const STATIONS = [
  { id: 'crate_bun', kind: 'crate', ingredient: 'bun', label: '面包', x: -4.15, z: -3.0, w: 1.0, d: 1.0 },
  { id: 'crate_patty', kind: 'crate', ingredient: 'patty', label: '肉饼', x: -3.0, z: -3.0, w: 1.0, d: 1.0 },
  { id: 'crate_cheese', kind: 'crate', ingredient: 'cheese', label: '芝士', x: -1.85, z: -3.0, w: 1.0, d: 1.0 },
  { id: 'crate_lettuce', kind: 'crate', ingredient: 'lettuce', label: '生菜', x: -0.7, z: -3.0, w: 1.0, d: 1.0 },
  { id: 'crate_tomato', kind: 'crate', ingredient: 'tomato', label: '番茄', x: 0.45, z: -3.0, w: 1.0, d: 1.0 },
  { id: 'crate_onion', kind: 'crate', ingredient: 'onion', label: '洋葱', x: 1.6, z: -3.0, w: 1.0, d: 1.0 },

  { id: 'board', kind: 'board', label: '砧板', x: -3.2, z: 0.3, w: 1.5, d: 1.15 },
  { id: 'stove1', kind: 'stove', label: '煎炉 A', x: -1.6, z: 0.3, w: 1.25, d: 1.15 },
  { id: 'stove2', kind: 'stove', label: '煎炉 B', x: -0.15, z: 0.3, w: 1.25, d: 1.15 },
  { id: 'counter', kind: 'counter', label: '出餐台', x: 1.45, z: 0.3, w: 1.5, d: 1.15 },
  { id: 'plates', kind: 'plateStack', label: '盘子', x: 3.0, z: 0.3, w: 1.15, d: 1.15 },

  { id: 'pass', kind: 'pass', label: '上菜窗口', x: 3.7, z: -3.0, w: 1.9, d: 1.0 },
  { id: 'trash', kind: 'trash', label: '垃圾桶', x: 4.35, z: 2.55, w: 0.8, d: 0.8 },
];

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Solid kitchen furniture, as AABBs in metres. Shared by both modes. */
export const COLLIDERS = [
  { id: 'back-run', minX: -4.93, maxX: 4.8, minZ: -3.5, maxZ: -2.5 },
  { id: 'island', minX: -3.95, maxX: 3.65, minZ: -0.25, maxZ: 0.85 },
  { id: 'trash', minX: 3.95, maxX: 4.75, minZ: 2.15, maxZ: 2.95 },
];

/** Player spawn position (metres) and facing direction (radians around Y). */
export const SPAWN = { x: -1.1, z: 2.95, yaw: -0.16 };

export const LEVELS = [
  {
    id: 1,
    name: '早班 · 熟悉灶台',
    subtitle: '订单不多，先把流程跑顺。',
    duration: 180,
    slots: 2,
    spawnInterval: 7,
    orderTimeScale: 1.15,
    tier: 2,
    recipes: ['salad', 'garden_salad', 'tomato_toast', 'cheeseburger'],
    target: [300, 475, 625],
    tip: '生菜、番茄、洋葱都要先切；肉饼放进煎炉，熟了再拿。',
  },
  {
    id: 2,
    name: '午市 · 客流高峰',
    subtitle: '两个窗口一起催单，别让订单过期。',
    duration: 210,
    slots: 2,
    spawnInterval: 7.0,
    orderTimeScale: 1.2,
    tier: 2,
    recipes: ['salad', 'cheeseburger', 'veggie_burger', 'onion_burger', 'double'],
    target: [300, 425, 800],
    tip: '提前煎几块肉饼，汉堡会快很多。',
  },
  {
    id: 3,
    name: '夜宵 · 极限出餐',
    subtitle: '订单飞快，手慢就只能看客人走了。',
    duration: 180,
    slots: 2,
    spawnInterval: 6.0,
    orderTimeScale: 1.1,
    tier: 3,
    recipes: ['salad', 'cheeseburger', 'double', 'cheese_salad', 'deluxe', 'double_onion'],
    target: [225, 375, 625],
    tip: '连击越高分数越多，扔掉烧焦的肉饼别犹豫。',
  },
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

/** Multiset signature used for recipe matching. */
export function toppingsSignature(toppings) {
  return toppings
    .map((t) => `${t.ingredient}:${t.state}`)
    .sort()
    .join('|');
}

export const RECIPE_SIGNATURES = Object.fromEntries(
  Object.values(RECIPES).map((r) => [r.id, toppingsSignature(r.ingredients)]),
);

export function recipeForToppings(toppings) {
  if (!toppings || toppings.length === 0) return null;
  const sig = toppingsSignature(toppings);
  for (const recipe of Object.values(RECIPES)) {
    if (RECIPE_SIGNATURES[recipe.id] === sig) return recipe;
  }
  return null;
}

/** Human-readable requirements for a recipe, e.g. "熟肉饼 ×2". */
export function recipeParts(recipe) {
  const counts = new Map();
  for (const t of recipe.ingredients) {
    const ing = INGREDIENTS[t.ingredient];
    const label = t.state === 'cooked' ? `熟${ing.name}` : t.state === 'chopped' ? `${ing.name}碎` : ing.name;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].map(([label, n]) => ({ label, n }));
}
