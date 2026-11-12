import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

const out = 'docs/screenshots';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const waitPage = (fn, timeout = 15000) => page.waitForFunction(fn, null, { timeout, polling: 120 });
const hideIntroAndTutorial = () => page.evaluate(() => {
  document.getElementById('level-intro').classList.add('hidden');
});
const tp = async (id) => {
  await page.evaluate((sid) => window.__SIZZLE__.teleport(sid), id);
  await waitPage(`window.__SIZZLE__.app.mode.nearestId === ${JSON.stringify(id)}`);
  await page.waitForTimeout(180);
};

await page.goto(url);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/menu.png` });

await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/modes.png` });

await page.locator('.mode-card[data-mode="fp"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(900);
await hideIntroAndTutorial();
await page.waitForTimeout(1100);
await page.screenshot({ path: `${out}/fp-kitchen.png` });

// a finished burger in hand
await page.evaluate(() => window.__SIZZLE__.giveDish('cheeseburger'));
await tp('counter');
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/fp-carry.png` });

// serve it: the confetti + score pop
await tp('pass');
await page.keyboard.press('e');
await page.waitForTimeout(350);
await page.screenshot({ path: `${out}/fp-serve.png` });

// results with a representative score
await page.evaluate(() => {
  window.__SIZZLE__.session.score = 1234;
  window.__SIZZLE__.session.timeLeft = 0.01;
});
await waitPage("document.getElementById('screen-results').classList.contains('active')");
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/results.png` });

// back to menu -> arcade 2P
await page.locator('#screen-results [data-action="menu"]').click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(300);
await page.locator('.mode-card[data-mode="arcade"]').click();
await page.locator('#players-toggle [data-players="2"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(1600);
await hideIntroAndTutorial();
await page.waitForTimeout(400);
// P1 holds a plate at the counter, P2 grabs cheese
await page.evaluate(() => window.__SIZZLE__.giveDish('salad'));
await page.evaluate(() => window.__SIZZLE__.teleport('counter'));
await page.evaluate(() => window.__SIZZLE__.app.mode.teleportToStation('crate_cheese', 1));
await page.waitForTimeout(500);
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/arcade-2p.png` });

// help screen
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.locator('#screen-pause [data-action="menu"]').click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: /玩法说明/ }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/help.png` });

console.log('errors', errors);
await browser.close();
