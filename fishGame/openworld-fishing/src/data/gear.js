/**
 * gear.js — rods, lines, lures and baits plus the derived stat block used by
 * the fishing system. Everything is a discrete tier you buy once, which keeps
 * the shop readable and the numbers easy to reason about.
 */
import { hashString, clamp01 } from '../core/util.js';

export const RODS = [
  { id: 'bamboo', name: '竹制手竿', en: 'Bamboo Rod', icon: '🎣', price: 0, minLevel: 1, cast: 1.0, reel: 1.0, luck: 0.0, weight: 1.0, desc: '爷爷留下的竹竿，弹性尚可，只适合近岸小鱼。' },
  { id: 'fiberglass', name: '玻璃钢竿', en: 'Fiberglass Rod', icon: '🎣', price: 320, minLevel: 2, cast: 1.16, reel: 1.12, luck: 0.03, weight: 2.4, desc: '廉价的入门选择，比竹竿更耐拉。' },
  { id: 'carbon', name: '碳素矶竿', en: 'Carbon Rod', icon: '🎣', price: 1400, minLevel: 6, cast: 1.34, reel: 1.28, luck: 0.07, weight: 3.6, desc: '轻而韧，抛投距离明显提升。' },
  { id: 'graphite', name: '石墨竞技竿', en: 'Graphite Pro Rod', icon: '🎣', price: 5200, minLevel: 12, cast: 1.52, reel: 1.45, luck: 0.12, weight: 5.2, desc: '竞技级手感，中鱼信号清晰。' },
  { id: 'deepsea', name: '深海铁马', en: 'Deepsea Boat Rod', icon: '🎣', price: 16000, minLevel: 20, cast: 1.62, reel: 1.72, luck: 0.18, weight: 8.6, desc: '为船钓巨物而生的重型竿，硬拉不虚。' },
  { id: 'storm', name: '暴风之骨', en: 'Stormbone Rod', icon: '🎣', price: 48000, minLevel: 30, cast: 1.78, reel: 2.0, luck: 0.26, weight: 11.5, desc: '台风天也能稳稳控鱼的怪力竿。' },
  { id: 'tidefang', name: '传说·潮汐之牙', en: 'Tidefang, the Legend', icon: '🎣', price: 140000, minLevel: 42, cast: 1.95, reel: 2.4, luck: 0.38, weight: 14.0, desc: '据说是用深海兽骨打磨而成，能让巨物主动靠近。' },
];

export const LINES = [
  { id: 'nylon_2', name: '2号尼龙线', en: 'Nylon 2lb', icon: '🧵', price: 0, minLevel: 1, strength: 2.6, stretch: 0.35, desc: '最普通的尼龙线，3 公斤以内还很安全。' },
  { id: 'nylon_4', name: '4号尼龙线', en: 'Nylon 6lb', icon: '🧵', price: 180, minLevel: 3, strength: 6.0, stretch: 0.32, desc: '泛用线号，兼顾强度与手感。' },
  { id: 'fluoro_6', name: '6号碳氟线', en: 'Fluorocarbon 12lb', icon: '🧵', price: 720, minLevel: 7, strength: 12.5, stretch: 0.22, desc: '折射率接近水，鱼看不见，耐磨。' },
  { id: 'braid_10', name: '10号编织线', en: 'Braid 24lb', icon: '🧵', price: 2600, minLevel: 13, strength: 24.0, stretch: 0.06, desc: '几乎零延展，中鱼信号直接传到手上。' },
  { id: 'braid_20', name: '20号编织线', en: 'Braid 48lb', icon: '🧵', price: 8800, minLevel: 22, strength: 48.0, stretch: 0.05, desc: '重障碍区也能把鱼从礁缝里拉出来。' },
  { id: 'steel_40', name: '40号钢芯线', en: 'Steel Core 90lb', icon: '🧵', price: 26000, minLevel: 30, strength: 90.0, stretch: 0.02, desc: '为鲨鱼与金枪鱼准备，防咬断。' },
  { id: 'aramid_80', name: '80号芳纶线', en: 'Aramid 180lb', icon: '🧵', price: 82000, minLevel: 40, strength: 180.0, stretch: 0.01, desc: '深海巨物级别的最后一道保险。' },
];

export const LURES = [
  { id: 'none', name: '不用假饵', en: 'No Lure', icon: '➖', price: 0, minLevel: 1, rarity: 0.0, biomes: [], bite: 1.0, desc: '靠鱼饵与耐心，什么都有可能上钩。' },
  { id: 'spoon', name: '亮片', en: 'Spoon', icon: '🥄', price: 140, minLevel: 2, rarity: 0.04, biomes: ['lake', 'river', 'coast'], bite: 1.1, targets: ['鲈鱼', '鳜鱼'], desc: '反光旋转，掠食性鱼类很难拒绝。' },
  { id: 'spinner', name: '旋转亮片', en: 'Spinner', icon: '🌀', price: 300, minLevel: 4, rarity: 0.06, biomes: ['river', 'lake', 'pond'], bite: 1.16, targets: ['虹鳟', '马口鱼'], desc: '溪流利器，专攻冷水掠食鱼。' },
  { id: 'softplastic', name: '软虫', en: 'Soft Plastic', icon: '🪱', price: 420, minLevel: 5, rarity: 0.05, biomes: ['swamp', 'lake', 'pond'], bite: 1.22, targets: ['黑鱼', '鲶鱼'], desc: '在障碍区慢慢跳动，黑鱼会一口吞下。' },
  { id: 'minnow', name: '米诺', en: 'Minnow', icon: '🐟', price: 760, minLevel: 8, rarity: 0.09, biomes: ['coast', 'estuary', 'lake'], bite: 1.2, targets: ['海鲈', '翘嘴'], desc: '模拟受伤小鱼，中上层通杀。' },
  { id: 'crank', name: '深潜摇摆', en: 'Deep Crank', icon: '🎯', price: 1500, minLevel: 11, rarity: 0.12, biomes: ['lake', 'ocean_shallow', 'reef'], bite: 1.18, targets: ['鲷鱼', '石斑鱼'], desc: '能下潜到 8 米，直击底层。' },
  { id: 'fly', name: '毛钩', en: 'Fly', icon: '🪶', price: 1900, minLevel: 14, rarity: 0.16, biomes: ['river'], bite: 1.3, targets: ['虹鳟', '哲罗鲑'], desc: '模仿水生昆虫，只有溪流才用得上。' },
  { id: 'jig', name: '铁板', en: 'Metal Jig', icon: '⚙️', price: 4200, minLevel: 20, rarity: 0.2, biomes: ['ocean_deep', 'ocean_shallow', 'reef'], bite: 1.24, targets: ['蓝鳍金枪鱼', '竹荚鱼'], desc: '重克数快速下沉，深场抽铁板。' },
  { id: 'popper', name: '波爬', en: 'Popper', icon: '💥', price: 6800, minLevel: 26, rarity: 0.24, biomes: ['ocean_deep', 'reef'], bite: 1.26, targets: ['旗鱼', '鲹鱼'], desc: '在水面炸出水花，刺激表层巨物。' },
  { id: 'squidjig', name: '鱿鱼钩', en: 'Squid Jig', icon: '🦑', price: 9000, minLevel: 24, rarity: 0.22, biomes: ['reef', 'ocean_deep'], bite: 1.35, targets: ['鱿鱼', '章鱼'], desc: '夜光涂层，头足类专用。' },
];

export const BAITS = [
  { id: 'bread', name: '面包屑', en: 'Bread Crumb', icon: '🍞', price: 30, pack: 10, minLevel: 1, bite: 1.12, rarity: -0.02, junk: 0.8, desc: '最便宜的饵，小鱼和杂物都会来。' },
  { id: 'worm', name: '蚯蚓', en: 'Earthworm', icon: '🪱', price: 60, pack: 10, minLevel: 1, bite: 1.25, rarity: 0.01, junk: 0.35, desc: '万能饵，淡水鱼几乎都吃。' },
  { id: 'corn', name: '玉米粒', en: 'Sweet Corn', icon: '🌽', price: 120, pack: 12, minLevel: 3, bite: 1.3, rarity: 0.04, junk: 0.2, desc: '鲤科鱼类的最爱，能避开大部分小鱼。' },
  { id: 'shrimp', name: '虾肉', en: 'Shrimp', icon: '🦐', price: 320, pack: 10, minLevel: 6, bite: 1.4, rarity: 0.07, junk: 0.12, desc: '海钓必备，底栖鱼种通吃。' },
  { id: 'minnow_bait', name: '活小鱼', en: 'Live Minnow', icon: '🐠', price: 700, pack: 8, minLevel: 10, bite: 1.5, rarity: 0.11, junk: 0.03, desc: '大鱼的快餐，容易招来掠食者。' },
  { id: 'crab', name: '蟹肉', en: 'Crab Meat', icon: '🦀', price: 1400, pack: 8, minLevel: 16, bite: 1.45, rarity: 0.14, junk: 0.05, desc: '石斑、鲷类无法抗拒的味道。' },
  { id: 'squid_bait', name: '鱿鱼条', en: 'Squid Strip', icon: '🦑', price: 2600, pack: 8, minLevel: 22, bite: 1.42, rarity: 0.18, junk: 0.02, desc: '深海鱼的通用硬通货。' },
  { id: 'secret', name: '秘制发酵饵', en: 'Secret Dough', icon: '🫙', price: 6000, pack: 6, minLevel: 28, bite: 1.75, rarity: 0.26, junk: 0.0, desc: '气味极冲，据说连传说鱼都会上当。' },
];

const byId = (arr) => (id) => arr.find((x) => x.id === id) || arr[0];
export const rodById = byId(RODS);
export const lineById = byId(LINES);
export const lureById = byId(LURES);
export const baitById = byId(BAITS);

/**
 * Effective stats for a loadout.
 * @param {{rod:string,line:string,lure:string,bait:string}} loadout
 */
export function gearStats(loadout) {
  const rod = rodById(loadout?.rod);
  const line = lineById(loadout?.line);
  const lure = lureById(loadout?.lure);
  // Rod stiffness (v2.3.0): derived from the rod's power so every rod in the
  // table gets a sensible feel without hand-authoring another column.
  // 0 = soft/whippy (bends deep, absorbs runs), 1 = stiff (transmits force).
  const stiffness = clamp01((rod.reel - 0.95) / 0.75);
  return {
    rod,
    line,
    lure,
    castPower: rod.cast,
    castDistance: 15 + rod.cast * 22,
    reelSpeed: rod.reel,
    lineStrength: line.strength,
    lineStretch: line.stretch,
    rodStiffness: stiffness,
    luck: rod.luck + lure.rarity,
    biteBonus: lure.bite,
  };
}

/** Deterministic length/weight coefficient for a species (W[g] = a * L[cm]^3). */
export function lengthCoefficient(id) {
  return 0.008 + (hashString(id) % 1000) / 1000 * 0.02;
}

/** Fish length in cm from weight in kg. */
export function weightToLength(id, kg) {
  const a = lengthCoefficient(id);
  return Math.cbrt((kg * 1000) / a);
}

export function totalGearValue(profile) {
  const rod = rodById(profile?.rod);
  const line = lineById(profile?.line);
  let v = rod.price + line.price;
  for (const l of profile?.lures || []) v += lureById(l).price;
  return v;
}
