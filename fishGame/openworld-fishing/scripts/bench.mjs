/**
 * bench.mjs — repeatable perf/size baseline for the game.
 *
 * Measures the things the objective cares about:
 *   - fps / frame time: median + p95 frame interval from an in-page rAF sampler
 *   - cpu: renderer TaskDuration / ScriptDuration over the same wall window
 *            (via CDP Performance.getMetrics deltas)
 *   - bundle size is measured separately by `node scripts/size.mjs`
 *
 * Usage: node scripts/bench.mjs <url> --seconds=20 --json=out.json
 */
const url = process.argv[2] || 'http://127.0.0.1:5177/?autostart=1&diag=1&quality=high&noadapt=1&perf=1';
const argSeconds = Number((process.argv.find((a) => a.startsWith('--seconds')) || '').split('=')[1] || 20);
const SECONDS = Math.max(5, argSeconds);
const port = Number(process.env.CDP_PORT || 9333);

async function wsUrl() {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const list = await res.json();
  const page = list.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');
  return page.webSocketDebuggerUrl;
}

const ws = new WebSocket(await wsUrl());
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.has(mid)) {
        pending.delete(mid);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, 20000);
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return { ok: false, error: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
  return { ok: true, value: r.result?.value };
}

await send('Runtime.enable');
await send('Page.enable');
await send('Performance.enable');

await send('Page.navigate', { url });
await sleep(Number(process.env.BOOT_MS || 20000));

// sanity: the game must be running
const boot = await evaluate(`JSON.stringify({ready: !!(window.__GAME && window.__DIAG && __DIAG.ready), mode: __GAME && __GAME.mode, quality: __GAME && __GAME.profile && __GAME.profile.settings.quality})`);
if (!boot.ok) {
  console.error('boot failed', JSON.stringify(boot));
  process.exit(2);
}

// start an in-page frame sampler (independent of the game's own fps counter)
await evaluate(`
  window.__bench = { frames: [], sampling: true };
  (function tick() {
    if (!window.__bench || !window.__bench.sampling) return;
    window.__bench.frames.push(performance.now());
    requestAnimationFrame(tick);
  })();
  'started'
`);

const m0 = await send('Performance.getMetrics');
const t0 = Date.now();
await sleep(SECONDS * 1000);
const m1 = await send('Performance.getMetrics');
const wall = (Date.now() - t0) / 1000;

const sample = await evaluate(`(() => {
  const f = window.__bench.frames;
  if (f.length < 10) return JSON.stringify({ tooFew: f.length });
  const deltas = [];
  for (let i = 1; i < f.length; i++) deltas.push(f[i] - f[i - 1]);
  deltas.sort((a, b) => a - b);
  const pick = (p) => deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * p))];
  const sum = deltas.reduce((a, b) => a + b, 0);
  return JSON.stringify({
    frames: f.length,
    medianMs: +pick(0.5).toFixed(2),
    p95Ms: +pick(0.95).toFixed(2),
    minMs: +deltas[0].toFixed(2),
    meanMs: +(sum / deltas.length).toFixed(2),
    fps: +(1000 / (sum / deltas.length)).toFixed(1),
  });
})()`);

const metrics = (list) => Object.fromEntries(list.metrics.map((m) => [m.name, m.value]));
const a = metrics(m0);
const b = metrics(m1);
const delta = (k) => +(((b[k] || 0) - (a[k] || 0)) * 1000).toFixed(0); // ms

const diag = await evaluate(`JSON.stringify({ calls: __DIAG.calls, tris: __DIAG.triangles, fps: __DIAG.fps })`);

const out = {
  url,
  seconds: +wall.toFixed(1),
  frame: JSON.parse(sample.value || '{}'),
  cpu: {
    taskMs: delta('TaskDuration'),
    scriptMs: delta('ScriptDuration'),
    layoutMs: delta('LayoutDuration'),
    styleMs: delta('RecalcStyleDuration'),
    taskPctOfWall: +(((delta('TaskDuration') / 1000) / wall) * 100).toFixed(1),
    scriptPctOfWall: +(((delta('ScriptDuration') / 1000) / wall) * 100).toFixed(1),
  },
  diag: JSON.parse(diag.value || '{}'),
};
console.log(JSON.stringify(out, null, 2));
const outFile = (process.argv.find((a2) => a2.startsWith('--json')) || '').split('=')[1];
if (outFile) {
  const fs = await import('node:fs');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
}
ws.close();
process.exit(0);
