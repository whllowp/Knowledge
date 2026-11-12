import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(url);
await page.waitForTimeout(500);

// change a setting, play, end the shift with a known score
await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
await page.waitForTimeout(700);
await page.evaluate(() => {
  const app = window.__SIZZLE__.app;
  app.session.score = 777;
  app.session.timeLeft = 0.01;
});
await page.waitForTimeout(1800);
const stars = await page.evaluate(() => window.__SIZZLE__.app.session.stars);
const stored = await page.evaluate(() => localStorage.getItem('sizzle-rush:v1'));
if (!stored || !stored.includes('"score":777')) throw new Error(`best score was not persisted: ${stored}`);
console.log('stored:', stored, 'stars:', stars);

await page.reload();
await page.waitForTimeout(700);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(500);
const after = await page.evaluate(() => ({
  total: document.getElementById('total-stars').textContent,
  shift1: document.querySelector('#shift-list .shift-btn')?.textContent.replace(/\s+/g, ' ').trim(),
  stored: localStorage.getItem('sizzle-rush:v1'),
}));
if (!after.shift1?.includes('777')) throw new Error(`best score missing after reload: ${after.shift1}`);
if (!after.total.includes(`${stars} / 18`)) throw new Error(`star total wrong: ${after.total} (expected ${stars})`);
console.log('after reload:', after);
console.log('errors', errors);
await browser.close();
