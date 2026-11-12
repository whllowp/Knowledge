import { chromium } from 'playwright';
import { writeFile, unlink } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';
import { clearSessions, recordSession, toCSV } from '../src/core/playtest.js';

// Build a deterministic 9-row human CSV: 3 novice / 3 average / 3 expert.
clearSessions();
for (const skill of ['novice', 'average', 'expert']) {
  const scores = skill === 'novice' ? [300, 310, 320] : skill === 'average' ? [500, 510, 520] : [700, 800, 900];
  for (const score of scores) {
    recordSession({
      mode: 'fp',
      level: 1,
      players: 1,
      source: 'human',
      device: 'keyboard',
      participant: 'P0X',
      skill,
      firstTime: true,
      score,
      served: 4,
      expired: 1,
      stars: 1,
      duration: 180,
    });
  }
}
const csvPath = 'shots/rebalance-sample.csv';
await writeFile(csvPath, toCSV(), 'utf8');

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(() => localStorage.clear());
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};

await page.goto(url);
await page.waitForTimeout(600);
await page.locator('#screen-menu [data-action="settings"]').click();
await page.waitForTimeout(500);
await page.locator('#screen-settings [data-action="playtest-data"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-data')).opacity === '1', null, { timeout: 15000 });

await page.setInputFiles('#pt-import', csvPath);
await page.waitForFunction(() => JSON.parse(localStorage.getItem('sizzle-rush:playtests:v1') || '[]').length === 9, null, { timeout: 15000 });
const imported = await page.evaluate(() => ({
  status: document.getElementById('data-status').textContent,
  human: document.getElementById('data-human').textContent,
  rows: JSON.parse(localStorage.getItem('sizzle-rush:playtests:v1') || '[]').length,
}));
check('CSV imported', imported.rows === 9 && imported.human.includes('真人样本 9'), imported);

await page.locator('[data-action="recommend-targets"]').click();
await page.waitForFunction(() => document.querySelectorAll('#data-reco-body tbody tr').length >= 6, null, { timeout: 10000 });
const reco = await page.evaluate(() => ({
  text: document.getElementById('data-reco-body').textContent.replace(/\s+/g, ' ').trim(),
  apply: document.querySelectorAll('[data-action="apply-target"]').length,
}));
check('recommendation shown', reco.text.includes('300 / 500 / 850') && reco.apply >= 1, reco);

await page.locator('[data-action="apply-target"][data-mode="fp"][data-level="1"]').click();
await page.waitForFunction(() => document.getElementById('data-status').textContent.includes('已应用'), null, { timeout: 10000 });
const applied = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:v1')).meta.targets);
check('target applied locally', JSON.stringify(applied?.fp?.[1]) === JSON.stringify([300, 500, 850]), applied);

const effective = await page.evaluate(() => {
  window.__SIZZLE__.app.startShift('fp', 1, 1);
  return window.__SIZZLE__.session.level.target;
});
check('next shift uses override', JSON.stringify(effective) === JSON.stringify([300, 500, 850]), effective);

await page.evaluate(() => window.__SIZZLE__.app.toMenu());
await page.waitForTimeout(300);
await page.locator('#screen-menu [data-action="settings"]').click();
await page.waitForTimeout(300);
await page.locator('#screen-settings [data-action="playtest-data"]').click();
await page.waitForTimeout(400);
await page.locator('[data-action="reset-targets"]').click();
const reset = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:v1')).meta.targets);
check('targets reset', Object.keys(reset || {}).length === 0, reset);

check('no console errors', errs.length === 0, errs);
await browser.close();
await unlink(csvPath).catch(() => {});
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
