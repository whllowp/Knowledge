/**
 * shop.js — the shop as a system, not a list (v3.5.0).
 *
 * Three things live here:
 *   - CONSUMABLES: one-shot supplies that apply a temporary buff (line wax,
 *     lucky charm, chum bucket). Bought and used from the shop.
 *   - Daily stock: each supply has a stock that refreshés when the in-game day
 *     rolls over, so you cannot buy 40 chum buckets in one morning.
 *   - Market pricing: selling a fish from the pantry pays a fraction of its
 *     base value, scaled by today's sea-state price multiplier — so rough
 *     weather is worth waiting for when you offload.
 */
import { clamp, clamp01 } from '../core/util.js';

/** Supplies sold by the shop. `apply` is done through the buff system. */
export const CONSUMABLES = [
  {
    id: 'line_wax',
    name: '护线蜡',
    icon: '🕯️',
    price: 260,
    minLevel: 5,
    stock: 3,
    desc: '给鱼线打一层蜡，10 分钟内鱼线强度 +20%。',
    buff: { name: '护线蜡', duration: 600, mods: { line: 0.2 } },
  },
  {
    id: 'lucky_charm',
    name: '幸运符',
    icon: '🍀',
    price: 420,
    minLevel: 8,
    stock: 2,
    desc: '渔人传说里的护身符，10 分钟内稀有度 +15%。',
    buff: { name: '幸运符', duration: 600, mods: { luck: 0.15 } },
  },
  {
    id: 'chum_bucket',
    name: '诱鱼桶',
    icon: '🪣',
    price: 380,
    minLevel: 12,
    stock: 2,
    desc: '把碎鱼虾倒进水里，10 分钟内咬钩速度 +35%。',
    buff: { name: '诱鱼桶', duration: 600, mods: { bite: 0.35 } },
  },
  {
    id: 'sea_charm',
    name: '海狼符',
    icon: '🧭',
    price: 900,
    minLevel: 25,
    stock: 1,
    desc: '老船长留下的符，15 分钟内收线速度 +18%、鱼线 +10%。',
    buff: { name: '海狼符', duration: 900, mods: { reel: 0.18, line: 0.1 } },
  },
];

export const consumableById = (id) => CONSUMABLES.find((c) => c.id === id) || null;

/** The in-game day index, used for stock refresh. */
export function dayIndex(world) {
  const sky = world?.sky;
  const day = sky ? Math.floor(sky.dayCount) : 0;
  return day;
}

/** Ensure the profile has a stock record for today, refreshing when the day rolls. */
export function refreshStock(profile, world) {
  const day = dayIndex(world);
  if (!profile.shop) profile.shop = { day: -1, stock: {}, sold: {} };
  if (profile.shop.day !== day) {
    profile.shop.day = day;
    profile.shop.stock = {};
    for (const c of CONSUMABLES) profile.shop.stock[c.id] = c.stock;
    profile.shop.sold = {};
  }
  for (const c of CONSUMABLES) {
    if (profile.shop.stock[c.id] === undefined) profile.shop.stock[c.id] = c.stock;
  }
  return profile.shop;
}

/** How many of a supply are left today. */
export function stockLeft(profile, world, id) {
  const shop = refreshStock(profile, world);
  return shop.stock[id] ?? 0;
}

/** Buy a supply: deducts coins and stock, adds the item to the bag. */
export function buyConsumable(game, id, qty = 1) {
  const p = game.profile;
  const item = consumableById(id);
  if (!item) return { ok: false, error: '没有这件商品' };
  const shop = refreshStock(p, game.world);
  const left = shop.stock[id] ?? 0;
  if (left < qty) return { ok: false, error: '今日库存不足', left };
  if (p.level < item.minLevel) return { ok: false, error: `需要 ${item.minLevel} 级` };
  const cost = item.price * qty;
  if (p.coins < cost) return { ok: false, error: '金币不够', cost };
  p.coins -= cost;
  shop.stock[id] = left - qty;
  if (!p.items) p.items = {};
  p.items[id] = (p.items[id] || 0) + qty;
  return { ok: true, cost, left: shop.stock[id], owned: p.items[id] };
}

/** Use a supply from the bag, applying its buff. */
export function useConsumable(game, id) {
  const p = game.profile;
  const item = consumableById(id);
  if (!item) return { ok: false, error: '没有这件商品' };
  const have = p.items?.[id] || 0;
  if (have <= 0) return { ok: false, error: '背包里没有' };
  p.items[id] = have - 1;
  game.addBuff?.({
    id: `item_${id}`,
    name: item.buff.name,
    duration: item.buff.duration,
    mods: item.buff.mods,
  });
  return { ok: true, buff: item.buff, left: p.items[id] };
}

/**
 * Sell one pantry fish. Pays `base * rate * seaMultiplier`, where rate is lower
 * than the automatic catch sale (that one is instant; this is bulk offloading).
 */
export function sellPantryFish(game, index, rate = 0.55) {
  const p = game.profile;
  const entry = p.pantry?.[index];
  if (!entry) return { ok: false, error: '没有这条鱼' };
  const fish = game.fishById?.(entry.id);
  if (!fish) return { ok: false, error: '未知鱼种' };
  const sea = game.world?.priceMultiplier ?? 1;
  const base = game.fishValue(fish, entry.weight);
  const price = Math.max(1, Math.round(base * rate * sea));
  p.pantry.splice(index, 1);
  p.coins += price;
  p.stats.marketSales = (p.stats.marketSales || 0) + 1;
  p.stats.marketCoins = (p.stats.marketCoins || 0) + price;
  return { ok: true, price, name: entry.name, weight: entry.weight, sea };
}

/** Sell everything in the pantry. Returns a summary. */
export function sellAllPantry(game, rate = 0.55) {
  const p = game.profile;
  if (!p.pantry || !p.pantry.length) return { ok: false, error: '保鲜网是空的', count: 0, coins: 0 };
  let coins = 0;
  let count = 0;
  let guard = 0;
  while (p.pantry.length && guard++ < 200) {
    const r = sellPantryFish(game, 0, rate);
    if (!r.ok) break;
    coins += r.price;
    count++;
  }
  return { ok: count > 0, count, coins };
}

/** Today's best-paying species, for the market hint. */
export function dailySpecial(game) {
  const day = dayIndex(game.world);
  const list = game.fishList || [];
  if (!list.length) return null;
  const idx = Math.abs(Math.floor(Math.sin(day * 12.9898) * 43758.5453)) % list.length;
  const fish = list[idx];
  return fish ? { name: fish.name, icon: fish.icon, id: fish.id, bonus: 0.5 } : null;
}
