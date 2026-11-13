import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

const label = process.argv[2] || 'base';
const runs = Number(process.argv[3] || 3);
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const rows = [];
for (let run = 0; run < runs; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
  await page.waitForFunction(() => window.__SIZZLE__.app.active === true, null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const before = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frames = [];
        let last = performance.now();
        const start = last;
        function tick(ts) {
          frames.push(ts - last);
          last = ts;
          if (ts - start < 5000) requestAnimationFrame(tick);
          else {
            const sorted = frames.slice(1).sort((a, b) => a - b);
            const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
            resolve({
              frames: sorted.length,
              avg: avg,
              p50: sorted[Math.floor(sorted.length * 0.5)],
              p95: sorted[Math.floor(sorted.length * 0.95)],
              fps: 1000 / avg,
              info: window.__SIZZLE__.mode?.renderer?.info?.render,
              memory: window.__SIZZLE__.mode?.renderer?.info?.memory,
            });
          }
        }
        requestAnimationFrame(tick);
      }),
  );
  const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const wall = 5; // sampling window is 5s; metrics deltas include a little eval overhead
  rows.push({
    label,
    run,
    ...result,
    task: after.TaskDuration - before.TaskDuration,
    script: after.ScriptDuration - before.ScriptDuration,
    style: after.RecalcStyleDuration - before.RecalcStyleDuration,
    cpuPct: ((after.TaskDuration - before.TaskDuration) / wall) * 100,
    errors,
  });
  await page.close();
}
await browser.close();
await writeFile(`shots/perf-${label}.json`, JSON.stringify(rows, null, 2));
for (const r of rows) {
  console.log(
    `${r.label} #${r.run} fps=${r.fps.toFixed(1)} avg=${r.avg.toFixed(2)}ms p95=${r.p95.toFixed(2)}ms task=${(r.task * 1000).toFixed(0)}ms script=${(r.script * 1000).toFixed(0)}ms cpu=${r.cpuPct.toFixed(1)}% calls=${r.info?.calls} tris=${r.info?.triangles} geos=${r.memory?.geometries} tex=${r.memory?.textures}`,
  );
}
const avg = (key) => rows.reduce((n, r) => n + r[key], 0) / rows.length;
console.log('AVG', { fps: avg('fps').toFixed(1), avg: avg('avg').toFixed(2), p95: avg('p95').toFixed(2), cpu: avg('cpuPct').toFixed(1), calls: Math.round(avg('calls')) });
