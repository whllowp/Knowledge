/**
 * kitchen.js — campfire cooking, a pantry of kept fish, and timed buffs.
 *
 * v1.4.0. Instead of every catch being instantly sold, the last few fish stay
 * in the pantry (a keep-net) and can be cooked at the campfire into a meal
 * that grants a timed buff: better bite rate, better luck, or a stronger line.
 * Buffs are simple `{id, until, mods}` records ticked by the game loop.
 */
import { clamp01, formatDuration } from '../core/util.js';
import { fishById } from '../data/fish.js';

export const PANTRY_SIZE = 12;

export const RECIPES = [
  {
    id: 'grilled',
    name: '炭烤鱼',
    icon: '🍢',
    desc: '热腾腾的烤鱼，让鱼群更愿意开口。',
    needRarity: 1,
    minWeight: 0.2,
    duration: 300,
    mods: { bite: 0.18 },
    buffName: '香气四溢',
  },
  {
    id: 'soup',
    name: '鲜鱼汤',
    icon: '🍲',
    desc: '慢炖的鱼汤，暖身又走运。',
    needRarity: 2,
    minWeight: 0.8,
    duration: 360,
    mods: { luck: 0.12 },
    buffName: '暖意',
  },
  {
    id: 'smoked',
    name: '烟熏鱼',
    icon: '🐟',
    desc: '烟熏过的鱼肉更耐拉扯，鱼线强度提升。',
    needRarity: 2,
    minWeight: 1.2,
    duration: 420,
    mods: { line: 0.22 },
    buffName: '老练手法',
  },
  {
    id: 'feast',
    name: '全鱼宴',
    icon: '🍽️',
    desc: '用一条大鱼做成的盛宴，全方位提升。',
    needRarity: 3,
    minWeight: 3,
    duration: 480,
    mods: { bite: 0.25, luck: 0.18, line: 0.15 },
    buffName: '饱餐',
  },
  {
    id: 'legend_meal',
    name: '传说料理',
    icon: '🌟',
    desc: '以传说级鱼获为主料的料理，效果惊人。',
    needRarity: 5,
    minWeight: 5,
    duration: 600,
    mods: { bite: 0.4, luck: 0.5, line: 0.3 },
    buffName: '传说之力',
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

/** Does this pantry entry satisfy a recipe's ingredient requirement? */
export function canCook(recipe, entry) {
  const fish = fishById(entry.id);
  if (!fish) return false;
  if (fish.junk) return false;
  if (fish.rarity < recipe.needRarity) return false;
  if (entry.weight < recipe.minWeight) return false;
  return true;
}

export function availableRecipes(profile) {
  const pantry = profile.pantry || [];
  const out = [];
  for (const r of RECIPES) {
    const matches = pantry.filter((e) => canCook(r, e));
    out.push({ recipe: r, count: matches.length, best: matches.sort((a, b) => b.weight - a.weight)[0] || null });
  }
  return out;
}

/** Add a catch to the keep-net (oldest is dropped). */
export function keepFish(profile, info) {
  if (!profile.pantry) profile.pantry = [];
  if (info.junk) return false;
  profile.pantry.push({ id: info.fish.id, name: info.fish.name, weight: info.weight, at: Date.now() });
  while (profile.pantry.length > PANTRY_SIZE) profile.pantry.shift();
  return true;
}

/** Cook the best matching fish into a buff. */
export function cook(profile, recipeId, now = Date.now()) {
  const recipe = recipeById(recipeId);
  if (!recipe) return { ok: false, error: '没有这个菜谱' };
  if (!profile.pantry || !profile.pantry.length) return { ok: false, error: '保鲜网里没有鱼' };
  const matches = profile.pantry.filter((e) => canCook(recipe, e));
  if (!matches.length) return { ok: false, error: `需要一条稀有度 ≥ ${recipe.needRarity} 且 ≥ ${recipe.minWeight} kg 的鱼` };
  matches.sort((a, b) => a.weight - b.weight);
  const used = matches[0];
  profile.pantry.splice(profile.pantry.indexOf(used), 1);
  const buff = addBuff(profile, {
    id: recipe.id,
    name: `${recipe.icon} ${recipe.buffName}`,
    duration: recipe.duration,
    mods: recipe.mods,
    now,
  });
  return { ok: true, used, buff, recipe };
}

// --------------------------------------------------------------------- buffs

export function addBuff(profile, { id, name, duration, mods, now = Date.now() }) {
  if (!profile.buffs) profile.buffs = [];
  const existing = profile.buffs.find((b) => b.id === id);
  const until = now + duration * 1000;
  if (existing) {
    existing.until = Math.max(existing.until, until);
    existing.mods = { ...existing.mods, ...mods };
    return existing;
  }
  const buff = { id, name, until, mods, started: now };
  profile.buffs.push(buff);
  return buff;
}

/** Drop expired buffs; returns the ones that just expired. */
export function tickBuffs(profile, now = Date.now()) {
  if (!profile.buffs || !profile.buffs.length) return [];
  const expired = [];
  profile.buffs = profile.buffs.filter((b) => {
    if (b.until <= now) {
      expired.push(b);
      return false;
    }
    return true;
  });
  return expired;
}

/** Aggregate active buff modifiers: { bite, luck, line, reel }. */
export function buffMods(profile, now = Date.now()) {
  const out = { bite: 0, luck: 0, line: 0, reel: 0 };
  for (const b of profile.buffs || []) {
    if (b.until <= now) continue;
    out.bite += b.mods.bite || 0;
    out.luck += b.mods.luck || 0;
    out.line += b.mods.line || 0;
    out.reel += b.mods.reel || 0;
  }
  return out;
}

/** Buff list with remaining seconds, for the HUD. */
export function activeBuffs(profile, now = Date.now()) {
  return (profile.buffs || [])
    .filter((b) => b.until > now)
    .map((b) => ({ ...b, remaining: Math.max(0, Math.round((b.until - now) / 1000)) }))
    .sort((a, b) => a.remaining - b.remaining);
}

export function buffSummary(buffs) {
  if (!buffs.length) return '';
  return buffs.map((b) => `${b.name} ${formatDuration(b.remaining)}`).join(' · ');
}
