/**
 * profile.mjs — CDP sampling profiler, aggregated by function self time.
 * Usage: node scripts/profile.mjs <url> --seconds=8
 */
const url = process.argv[2] || 'http://127.0.0.1:5177/?autostart=1&diag=1&quality=high&noadapt=1&perf=1';
const SECONDS = Number((process.argv.find((a) => a.startsWith('--seconds')) || '').split('=')[1] || 8);
const port = Number(process.env.CDP_PORT || 9333);

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => {
  ws.addEventListener('open', r, { once: true });
  ws.addEventListener('error', j, { once: true });
});
let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return r.result?.value;
};

await send('Runtime.enable');
await send('Page.enable');
await send('Profiler.enable');
await send('Page.navigate', { url });
await sleep(Number(process.env.BOOT_MS || 20000));

await send('Profiler.setSamplingInterval', { interval: 200 });
await send('Profiler.start');
const t0 = Date.now();
await sleep(SECONDS * 1000);
const { profile } = await send('Profiler.stop');
const wall = (Date.now() - t0) / 1000;

// aggregate self time per node
const byId = new Map();
for (const n of profile.nodes) byId.set(n.id, n);
const self = new Map();
const dt = profile.timeDeltas || [];
const samples = profile.samples || [];
for (let i = 0; i < samples.length; i++) {
  const n = byId.get(samples[i]);
  if (!n) continue;
  const cf = n.callFrame;
  const key = `${cf.functionName || '(anonymous)'} @ ${(cf.url || '').split('/').pop()}:${cf.lineNumber + 1}`;
  self.set(key, (self.get(key) || 0) + (dt[i] || 0));
}
const total = [...self.values()].reduce((a, b) => a + b, 0);
const rows = [...self.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .map(([fn, us]) => ({ fn, ms: +(us / 1000).toFixed(0), pct: +((us / total) * 100).toFixed(1) }));

const diag = await evaluate('JSON.stringify({fps: __DIAG.fps, calls: __DIAG.calls, tris: __DIAG.triangles})');
console.log(JSON.stringify({ seconds: +wall.toFixed(1), sampledMs: +(total / 1000).toFixed(0), top: rows, diag: JSON.parse(diag || '{}') }, null, 2));
ws.close();
process.exit(0);
