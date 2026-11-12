import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, acceptDownloads: true });
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
await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  s.score = 812;
  s.stats.served = 4;
  s.stats.expired = 2;
  s.stats.wasted = 1;
  s.stats.burnt = 1;
  s.maxCombo = 3;
  s.timeLeft = 0.01;
});
await page.waitForFunction(() => document.getElementById('screen-results').classList.contains('active'), null, { timeout: 10000 });
await page.waitForTimeout(300);
const results = await page.evaluate(() => ({
  screen: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
  record: document.getElementById('results-record').textContent,
  stored: localStorage.getItem('sizzle-rush:playtests:v1'),
}));
console.log('results', results);
check('shift recorded', results.record.includes('812') && results.screen.includes('screen-results'), results.record);
const storedRows = JSON.parse(results.stored || '[]');
check('automation flagged', storedRows.length === 1 && storedRows[0].source === 'automation' && storedRows[0].served === 4, storedRows);

await page.locator('#screen-results [data-action="menu"]').click();
await page.waitForTimeout(500);
await page.locator('#screen-menu [data-action="settings"]').click();
await page.waitForTimeout(300);
await page.locator('#screen-settings [data-action="playtest-data"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-data')).opacity === '1', null, { timeout: 15000 });
await page.waitForTimeout(250);
const data = await page.evaluate(() => ({
  screen: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
  count: document.getElementById('data-count').textContent,
  table: document.getElementById('data-table-body').textContent.replace(/\s+/g, ' ').trim(),
  summary: document.getElementById('data-summary').textContent.replace(/\s+/g, ' ').trim(),
}));
console.log('data screen', data);
check('data panel', data.screen.includes('screen-data') && data.count.includes('1') && data.table.includes('812'), data);
await page.screenshot({ path: 'docs/screenshots/playtest-data.png' });

const dl = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
await page.locator('#screen-data [data-action="export-csv"]').click();
const download = await dl;
console.log('download', download ? download.suggestedFilename() : 'none');
check('CSV download', !!download && download.suggestedFilename().endsWith('.csv'), download?.suggestedFilename());

await page.locator('#screen-data [data-action="back"]').first().click();
await page.waitForTimeout(300);
const back = await page.evaluate(() => [...document.querySelectorAll('.screen.active')].map((s) => s.id));
check('back to settings', back.includes('screen-settings'), back);
check('no console errors', errs.length === 0, errs);

await browser.close();
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
