import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';
const out = 'shots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const watchers = [];
const waitPage = (fn, timeout = 12000) => page.waitForFunction(fn, null, { timeout, polling: 100 });

const waitNearest = (id) =>
  waitPage(`window.__SIZZLE__.mode?.nearestId === ${JSON.stringify(id)}`);

const tp = async (id) => {
  await page.evaluate((sid) => window.__SIZZLE__.teleport(sid), id);
  await waitNearest(id);
};

const pressE = async () => {
  await page.keyboard.press('e');
  // Headless frames can be slower than the key press; wait until the input
  // edge has been consumed before teleporting to the next station.
  await page.waitForFunction(() => {
    const k = window.__SIZZLE__.mode?.player?.keyboard;
    return !!k && k.just.size === 0 && k.framePressed.size === 0;
  }, null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(60);
};

const state = () => page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  const h = window.__SIZZLE__.mode?.hands;
  return {
    score: s?.score,
    served: s?.stats.served,
    state: s?.state,
    carry: h?.carry ? { type: h.carry.type, ingredient: h.carry.ingredient, state: h.carry.state, contents: h.carry.contents?.length } : null,
    board: (() => {
      const b = s?.kitchen.getStation('board')?.item;
      return b ? { ingredient: b.ingredient, state: b.state, chop: +(b.chopProgress || 0).toFixed(2) } : null;
    })(),
    counter: (() => {
      const c = s?.kitchen.getStation('counter')?.item;
      return c ? { type: c.type, contents: c.contents?.map((x) => `${x.ingredient}:${x.state}`) } : null;
    })(),
    tickets: s?.orders.tickets.map((t) => t.recipeId),
  };
});

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(200);
await page.locator('.mode-card[data-mode="fp"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(1200);

await page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  s.orders.tickets = [{ id: 500, recipeId: 'salad', maxTime: 200, time: 200, done: false, spawnedAt: 0 }];
  s.orders.spawnTimer = 999;
});

await tp('plates');
await pressE();
await waitPage('window.__SIZZLE__.mode.hands.carry?.type === "plate"');
await tp('counter');
await pressE();
await waitPage('window.__SIZZLE__.session.kitchen.getStation("counter").item?.type === "plate"');
console.log('plate ready', await state());

for (const crate of ['crate_lettuce', 'crate_tomato', 'crate_onion']) {
  await tp(crate);
  await pressE();
  await waitPage(`window.__SIZZLE__.mode.hands.carry?.ingredient === ${JSON.stringify(crate.replace('crate_', ''))}`);
  await tp('board');
  await pressE();
  await waitPage('window.__SIZZLE__.session.kitchen.getStation("board").item');
  await page.keyboard.down('e');
  await waitPage('window.__SIZZLE__.session.kitchen.getStation("board").item?.state === "chopped"', 15000);
  await page.keyboard.up('e');
  await page.waitForTimeout(300);
  await pressE();
  await waitPage('window.__SIZZLE__.mode.hands.carry?.state === "chopped"');
  await tp('counter');
  await pressE();
  await page.waitForTimeout(400);
  console.log('added', crate, await state());
}

await page.screenshot({ path: `${out}/10-fp-plated.png` });

await tp('counter');
await pressE();
await waitPage('window.__SIZZLE__.mode.hands.carry?.type === "plate"');
await tp('pass');
await pressE();
await waitPage('window.__SIZZLE__.session.stats.served >= 1');
console.log('served', await state());
await page.screenshot({ path: `${out}/11-fp-served.png` });

await page.evaluate(() => {
  window.__SIZZLE__.session.score = 1234;
  window.__SIZZLE__.session.timeLeft = 0.01;
});
await page.waitForTimeout(1800);
await page.screenshot({ path: `${out}/12-results.png` });
console.log('final', await page.evaluate(() => ({
  screens: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
  score: window.__SIZZLE__.session?.score,
  stars: window.__SIZZLE__.session?.stars,
})));

console.log('errors:', errors);
await browser.close();
