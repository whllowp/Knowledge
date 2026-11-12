// Deterministic RNG (mulberry32) so order queues are reproducible in tests.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed = 1) {
  const next = mulberry32(seed);
  return {
    next,
    range(min, max) {
      return min + (max - min) * next();
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length) % arr.length];
    },
    int(min, max) {
      return Math.floor(min + next() * (max - min + 1));
    },
  };
}
