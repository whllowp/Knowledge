/**
 * flags.js — URL flags for A/B measuring. In production the optimizations are
 * always on, so the query-string parsing is compiled away entirely.
 */
const DEV = (() => {
  try {
    return !!import.meta.env?.DEV;
  } catch {
    return true;
  }
})();

export function flag(name, fallback = '1') {
  if (!DEV) return fallback;
  try {
    const v = new URLSearchParams(location.search).get(name);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

/** Master switch for the v6.1.0 performance work: ?opt=0 disables all of it. */
export function optOn() {
  return flag('opt', '1') !== '0';
}
