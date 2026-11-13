/**
 * fightStyles.js — how a species fights (v5.0.0).
 *
 * Before this, every fish used the same generic run/tension curve, so a tuna
 * and a carp felt alike. Each species now gets an archetype that changes the
 * rhythm of the fight, which events it throws, and — crucially — what the
 * angler is supposed to do about each one.
 *
 * An event goes: telegraph (the HUD warns you) → active (the fish does it) →
 * recover. Performing the right input during the window "counters" it: the
 * penalty is cancelled and the fish burns extra stamina. Missing it costs line
 * wear and distance, which is where fights are actually lost.
 */

/** Event definitions: what the angler must do, and what happens if they don't. */
export const EVENTS = {
  shake: {
    id: 'shake',
    label: '疯狂甩头',
    icon: '🌪️',
    hint: '按住右键抬竿',
    action: 'pump',
    telegraph: 0.65,
    active: 0.85,
    tension: 0.55,
    wear: 0.22,
    stamina: 0.1,
  },
  jump: {
    id: 'jump',
    label: '跃出水面',
    icon: '🦘',
    hint: '松开收线，压低竿尖',
    action: 'release',
    telegraph: 0.75,
    active: 0.7,
    tension: 0.7,
    wear: 0.26,
    stamina: 0.12,
  },
  dive: {
    id: 'dive',
    label: '向深处钻',
    icon: '⬇️',
    hint: '按住右键抬竿',
    action: 'pump',
    telegraph: 0.7,
    active: 1.0,
    tension: 0.4,
    wear: 0.2,
    stamina: 0.11,
    distance: 0.16,
  },
  run: {
    id: 'run',
    label: '发力狂奔',
    icon: '💨',
    hint: '松卸力 / 松开收线',
    action: 'release',
    telegraph: 0.6,
    active: 1.1,
    tension: 0.62,
    wear: 0.18,
    stamina: 0.09,
    distance: 0.2,
  },
};

/**
 * Archetypes. Weights are relative: the fight picks the next event from its
 * own table, so a thrasher mostly shakes and a jumper mostly leaps.
 */
export const STYLES = {
  runner: {
    id: 'runner',
    name: '冲刺型',
    icon: '💨',
    blurb: '爆发力强、体力一般，靠一次次狂奔拖垮你。',
    runPower: 1.15,
    runFreq: 1.15,
    zoneSpeed: 1.2,
    events: { run: 5, jump: 1 },
  },
  thrasher: {
    id: 'thrasher',
    name: '甩头型',
    icon: '🌪️',
    blurb: '不停地甩头，稍不留神就把钩子甩掉。',
    runPower: 0.9,
    runFreq: 0.95,
    zoneSpeed: 1.5,
    events: { shake: 6, jump: 1 },
  },
  diver: {
    id: 'diver',
    name: '下潜型',
    icon: '⬇️',
    blurb: '一有压力就往底部钻，越钻越沉。',
    runPower: 0.85,
    runFreq: 0.8,
    zoneSpeed: 0.8,
    events: { dive: 6, shake: 2 },
  },
  jumper: {
    id: 'jumper',
    name: '跳跃型',
    icon: '🦘',
    blurb: '动不动就炸水，出水时线最容易断。',
    runPower: 1.0,
    runFreq: 0.9,
    zoneSpeed: 1.1,
    events: { jump: 6, run: 2 },
  },
  bulldog: {
    id: 'bulldog',
    name: '蛮力型',
    icon: '🐂',
    blurb: '不跑不跳，就是把竿压成弯弓，慢慢磨。',
    runPower: 1.15,
    runFreq: 0.65,
    zoneSpeed: 0.7,
    events: { dive: 3, shake: 3, run: 2 },
  },
  trickster: {
    id: 'trickster',
    name: '狡猾型',
    icon: '🎭',
    blurb: '忽快忽慢、忽左忽右，节奏最难摸。',
    runPower: 1.05,
    runFreq: 1.0,
    zoneSpeed: 1.35,
    events: { shake: 3, jump: 2, dive: 2, run: 2 },
  },
};

/** Explicit assignments for the species whose identity should read clearly. */
const BY_ID = {
  bluefin_tuna: 'runner',
  yellowfin_tuna: 'runner',
  bigeye_tuna: 'runner',
  albacore: 'runner',
  skipjack_tuna: 'runner',
  sailfish: 'runner',
  swordfish: 'runner',
  blue_marlin: 'runner',
  mahi_mahi: 'runner',
  giant_trevally: 'runner',
  blue_shark: 'runner',
  great_white_shark: 'bulldog',
  tiger_shark: 'bulldog',
  hammerhead_shark: 'bulldog',
  megamouth_shark: 'bulldog',
  whale_shark: 'bulldog',
  mako_shark: 'jumper',
  eagle_ray: 'jumper',
  thresher_shark: 'trickster',
  electric_ray: 'trickster',
  whitetip_reef_shark: 'thrasher',
  grouper: 'diver',
  black_rockfish: 'diver',
  catfish: 'diver',
  silver_chimaera: 'diver',
  largemouth_bass: 'thrasher',
  barramundi: 'thrasher',
  snakehead: 'thrasher',
  giant_snakehead: 'thrasher',
  rainbow_trout: 'jumper',
  taimen: 'jumper',
  manta_ray: 'jumper',
  chinese_hooksnout: 'jumper',
  european_eel: 'trickster',
  moray_eel: 'trickster',
  giant_squid: 'trickster',
  ocean_sunfish: 'bulldog',
};

/**
 * Pick an archetype for a species. Explicit map first, then a heuristic from
 * its stats so any new fish still gets something sensible.
 */
export function styleFor(fish) {
  if (!fish) return STYLES.thrasher;
  if (BY_ID[fish.id]) return STYLES[BY_ID[fish.id]];
  if (fish.speed >= 0.8) return STYLES.runner;
  if (fish.fight >= 0.9) return STYLES.bulldog;
  if ((fish.maxWeight ?? 0) >= 40) return STYLES.diver;
  if (fish.speed <= 0.45) return STYLES.diver;
  return STYLES.thrasher;
}

/** Weighted pick from a style's event table. */
export function pickEvent(style, rand = Math.random) {
  const table = style.events || { shake: 1 };
  let total = 0;
  for (const k in table) total += table[k];
  let r = rand() * total;
  for (const k in table) {
    r -= table[k];
    if (r <= 0) return EVENTS[k] || EVENTS.shake;
  }
  return EVENTS.shake;
}

/**
 * Fight grade. Rewards a clean fight: few big tension deviations and many
 * countered events. `S` also pays a value bonus.
 */
export function gradeFight({ maxDeviation, countered, total, time }) {
  let score = 100;
  score -= clamp01(maxDeviation / 0.4) * 45;
  const rate = total > 0 ? countered / total : 1;
  score += (rate - 0.5) * 30;
  if (time > 45) score -= Math.min(15, (time - 45) * 0.4);
  const s = Math.round(clamp(score, 0, 100));
  if (s >= 88) return { id: 'S', label: '完美', bonus: 0.25, color: '#ffd166', score: s };
  if (s >= 72) return { id: 'A', label: '漂亮', bonus: 0.12, color: '#4ade80', score: s };
  if (s >= 55) return { id: 'B', label: '合格', bonus: 0.04, color: '#8ad4ff', score: s };
  return { id: 'C', label: '勉强', bonus: 0, color: '#8fa6b8', score: s };
}

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
function clamp01(v) {
  return clamp(v, 0, 1);
}
