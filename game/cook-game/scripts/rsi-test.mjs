import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => localStorage.clear());
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};
const forceServe = () =>
  page.evaluate(() => {
    const app = window.__SIZZLE__.app;
    const s = app.session;
    const id = [...s.recommended][0];
    s.orders.tickets = [{ id: 999, recipeId: id, maxTime: 60, time: 60, done: false, spawnedAt: 0 }];
    window.__SIZZLE__.giveDish(id);
    app.mode.teleportToStation('pass');
    const r = s.interact('pass', app.mode.hands);
    return { id, r, score: s.score, bonus: s.stats.rsiBonus, dishes: s.stats.dishCounts, served: s.stats.served };
  });

await page.goto(url);
await page.waitForTimeout(700);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForFunction(() => document.querySelectorAll('.rsi-rec').length === 3, null, { timeout: 15000 });
const initial = await page.evaluate(() => ({
  recs: [...document.querySelectorAll('.rsi-rec-top b')].map((b) => b.textContent),
  version: document.getElementById('rsi-version').textContent,
  city: document.getElementById('rsi-city').value,
  weather: document.getElementById('rsi-weather').value,
}));
check('RSI cards rendered', initial.recs.length === 3, initial);

await page.selectOption('#rsi-city', 'chengdu');
await page.selectOption('#rsi-weather', 'rain');
await page.locator('#rsi-prefs [data-pref="hearty"]').click();
await page.locator('[data-action="rsi-shuffle"]').click();
await page.waitForTimeout(250);
const context = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:rsi:v1')).context);
check('RSI context persists', context.city === 'chengdu' && context.weather === 'rain' && context.prefs.includes('hearty'), context);
const cards = await page.evaluate(() => [...document.querySelectorAll('.rsi-rec')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()));
check('RSI cards follow context', cards.some((c) => c.includes('成都') || c.includes('下雨') || c.includes('肉食')), cards);

await page.locator('#shift-list [data-level="2"]').click();
await page.waitForTimeout(250);
await page.locator('#screen-modes [data-action="start"]').click();
await page.waitForFunction(() => window.__SIZZLE__.app.active === true, null, { timeout: 15000 });
const started = await page.evaluate(() => ({
  recommended: [...window.__SIZZLE__.session.recommended],
  recipes: window.__SIZZLE__.app.activeLevel.recipes,
  level: window.__SIZZLE__.app.levelId,
}));
check('session gets RSI specials', started.recommended.length === 3 && started.recipes.length >= 3, started);

// Put a recommended dish directly on the pass; this isolates scoring/telemetry from cooking.
const served = await forceServe();
check('recommended dish scores bonus', served.r?.ok === true && served.served === 1 && served.bonus > 0, served);

await page.evaluate(() => window.__SIZZLE__.session.finish());
await page.waitForFunction(() => document.getElementById('screen-results').classList.contains('active'), null, { timeout: 10000 });
await page.waitForTimeout(800);
const history = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:rsi:v1')).history);
check('shift recorded into RSI history', history.length === 1 && history[0].dishCounts[served.id] === 1, history[history.length - 1]);
await page.screenshot({ path: 'docs/screenshots/rsi-results.png' });

// A second shift gives the replay loop enough history to improve the policy.
await page.locator('#screen-results [data-action="next"]').click();
await page.waitForFunction(() => window.__SIZZLE__.app.active === true, null, { timeout: 15000 });
const served2 = await forceServe();
check('second recommendation scores bonus', served2.r?.ok === true && served2.bonus > 0, served2);
await page.evaluate(() => window.__SIZZLE__.session.finish());
await page.waitForFunction(() => document.getElementById('screen-results').classList.contains('active'), null, { timeout: 10000 });
await page.waitForTimeout(900);
const evolved = await page.evaluate(() => ({
  history: JSON.parse(localStorage.getItem('sizzle-rush:rsi:v1')).history.length,
  policy: JSON.parse(localStorage.getItem('sizzle-rush:rsi:v1')).policy.version,
  record: document.getElementById('results-record').textContent,
}));
check('RSI history grows to two shifts', evolved.history === 2, evolved);
check('RSI replay upgrades policy', evolved.policy >= 2, evolved);
await page.screenshot({ path: 'docs/screenshots/rsi-results-evolved.png' });

await page.evaluate(() => window.__SIZZLE__.app.toMenu());
await page.waitForTimeout(400);
await page.locator('#screen-menu [data-action="album"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-album')).opacity === '1', null, { timeout: 10000 });
await page.waitForTimeout(500);
const album = await page.evaluate(() => ({
  title: document.getElementById('album-title').textContent,
  stats: document.getElementById('album-stats').textContent.replace(/\s+/g, ' ').trim(),
  memoir: document.getElementById('album-memoir').textContent.replace(/\s+/g, ' ').trim(),
  dishes: document.getElementById('album-dishes').textContent.replace(/\s+/g, ' ').trim(),
  policy: document.getElementById('album-policy').textContent.replace(/\s+/g, ' ').trim(),
}));
check('yearbook aggregates shift', album.stats.includes('2班次') && album.dishes.includes('次'), album);
check('yearbook has dish + memoir', album.dishes.length > 0 && album.memoir.includes('2026'), album);
await page.screenshot({ path: 'docs/screenshots/album.png' });

const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
await page.locator('[data-action="export-album"]').click();
const download = await downloadPromise;
check('yearbook HTML downloads', /sizzle-album-2026\.html/.test(download.suggestedFilename()), download.suggestedFilename());
await download.saveAs('shots/rsi-album.html');
const html = await readFile('shots/rsi-album.html', 'utf8');
check('yearbook HTML contains memoir', html.includes('2026 年度相册') && html.includes('回忆录'), html.slice(0, 80));
await page.locator('#screen-album [data-action="back"]').first().click();
await page.waitForFunction(() => document.getElementById('screen-menu').classList.contains('active'), null, { timeout: 10000 });
check('yearbook back returns menu', true);
check('no console errors', errors.length === 0, errors);

await browser.close();
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
