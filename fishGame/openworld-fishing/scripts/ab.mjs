/** Compare two bench configs with a median of N runs each. */
import { execFileSync } from 'node:child_process';

const runs = Number(process.env.RUNS || 5);
const secs = Number(process.env.SECS || 12);
const urlA = process.argv[2];
const urlB = process.argv[3];

function bench(url) {
  const out = execFileSync(process.execPath, ['scripts/bench.mjs', url, `--seconds=${secs}`], {
    env: { ...process.env, BOOT_MS: '20000', CDP_PORT: '9333' },
    encoding: 'utf8',
    maxBuffer: 1 << 24,
  });
  const j = JSON.parse(out.slice(out.indexOf('{')));
  return {
    fps: j.frame.fps,
    medianMs: j.frame.medianMs,
    p95Ms: j.frame.p95Ms,
    scriptPerFrame: +(j.cpu.scriptMs / j.frame.frames).toFixed(2),
    calls: j.diag.calls,
    tris: j.diag.tris,
  };
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function sample(label, url) {
  const rows = [];
  for (let i = 0; i < runs; i++) {
    const r = bench(url);
    rows.push(r);
    console.log(`${label} run ${i + 1}: fps=${r.fps} median=${r.medianMs}ms script/frame=${r.scriptPerFrame}ms calls=${r.calls}`);
  }
  return {
    label,
    fps: median(rows.map((r) => r.fps)),
    medianMs: median(rows.map((r) => r.medianMs)),
    p95Ms: median(rows.map((r) => r.p95Ms)),
    scriptPerFrame: median(rows.map((r) => r.scriptPerFrame)),
    calls: rows[0].calls,
    tris: rows[0].tris,
  };
}

const a = await sample('A', urlA);
const b = urlB ? await sample('B', urlB) : null;
console.log(JSON.stringify({ a, b, delta: b ? { fpsPct: +(((b.fps - a.fps) / a.fps) * 100).toFixed(1), cpuPct: +(((b.scriptPerFrame - a.scriptPerFrame) / a.scriptPerFrame) * 100).toFixed(1) } : null }, null, 2));
