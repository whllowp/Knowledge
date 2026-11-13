/**
 * size.js — fish size classes shared by the reveal, the catch card and the
 * journal. (v2.7.0, extracted from fightVisuals.)
 */

export const SIZE_CLASSES = [
  { id: 'tiny', name: '小鱼', icon: '·', min: 0, color: '#8fb2c2' },
  { id: 'small', name: '小型', icon: '✦', min: 0.8, color: '#8ad4ff' },
  { id: 'medium', name: '中型', icon: '✦✦', min: 4, color: '#4fd1c5' },
  { id: 'large', name: '大型', icon: '★', min: 12, color: '#ffd166' },
  { id: 'huge', name: '巨型', icon: '★★', min: 40, color: '#ff9f45' },
  { id: 'monster', name: '巨物', icon: '★★★', min: 120, color: '#ff5c5c' },
];

/** Which class a catch belongs to; legendary rarity bumps it one step. */
export function sizeClass(weight, rarity = 1) {
  let cls = SIZE_CLASSES[0];
  for (const c of SIZE_CLASSES) if (weight >= c.min) cls = c;
  if (rarity >= 5) {
    const i = SIZE_CLASSES.indexOf(cls);
    cls = SIZE_CLASSES[Math.min(SIZE_CLASSES.length - 1, i + 1)];
  }
  return cls;
}

/** Does this catch deserve the full reveal cinematic? */
export function deservesReveal(weight, rarity = 1) {
  return weight >= 4 || rarity >= 4;
}
