import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

await mkdir('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const waitPage = (fn, timeout = 12000) => page.waitForFunction(fn, null, { timeout, polling: 100 });
const info = () => page.evaluate(() => {
  const app = window.__SIZZLE__.app;
  const m = app.mode;
  return {
    mode: app.modeName,
    players: m.players?.map((p) => ({ name: p.name, x: +p.x.toFixed(2), z: +p.z.toFixed(2), carry: p.hands.carry?.type ?? null })),
    nearest: m.nearest ? [...m.nearest.entries()] : null,
    score: app.session.score,
    served: app.session.stats.served,
    counter: app.session.kitchen.getStation('counter').item?.contents?.map((c) => `${c.ingredient}:${c.state}`) ?? null,
    tickets: app.session.orders.tickets.map((t) => t.recipeId),
  };
});

await page.goto(url);
await page.waitForTimeout(600);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(200);
await page.locator('.mode-card[data-mode="arcade"]').click();
await page.locator('#players-toggle [data-players="2"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(1400);
await page.screenshot({ path: 'shots/13-arcade-start.png' });
console.log('start', await info());

// P2 movement + collision against the island
const before = await page.evaluate(() => ({ ...window.__SIZZLE__.app.mode.players[1] }));
await page.keyboard.down('ArrowUp');
await page.waitForTimeout(2500);
await page.keyboard.up('ArrowUp');
await page.waitForTimeout(300);
const after = await page.evaluate(() => ({ z: window.__SIZZLE__.app.mode.players[1].z, x: window.__SIZZLE__.app.mode.players[1].x }));
console.log('p2 moved', { beforeZ: +before.z.toFixed(2), afterZ: +after.z.toFixed(2) });

// P1 plate -> counter
const tp1 = async (id) => {
  await page.evaluate((sid) => window.__SIZZLE__.teleport(sid), id);
  await waitPage(`window.__SIZZLE__.app.mode.nearest.get(0)?.id === ${JSON.stringify(id)}`);
  await page.waitForTimeout(150);
};
const interact1 = async () => { await page.keyboard.press('Space'); await page.waitForTimeout(300); };

await tp1('plates');
await interact1();
await waitPage('window.__SIZZLE__.app.mode.players[0].hands.carry?.type === "plate"');
await tp1('counter');
await interact1();
await waitPage('window.__SIZZLE__.app.session.kitchen.getStation("counter").item?.type === "plate"');

// P1 chop lettuce
await tp1('crate_lettuce');
await interact1();
await waitPage('window.__SIZZLE__.app.mode.players[0].hands.carry?.ingredient === "lettuce"');
await tp1('board');
await interact1();
await waitPage('window.__SIZZLE__.app.session.kitchen.getStation("board").item');
await page.keyboard.down('Space');
await waitPage('window.__SIZZLE__.app.session.kitchen.getStation("board").item?.state === "chopped"', 20000);
await page.keyboard.up('Space');
await page.waitForTimeout(300);
await page.keyboard.press('Space');
await waitPage('window.__SIZZLE__.app.mode.players[0].hands.carry?.state === "chopped"');
await tp1('counter');
await interact1();
await page.waitForTimeout(300);

// P2 interacts with a crate
await page.evaluate(() => window.__SIZZLE__.app.mode.teleportToStation('crate_cheese', 1));
await waitPage('window.__SIZZLE__.app.mode.nearest.get(1)?.id === "crate_cheese"');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
console.log('after p2 E', await info());
await page.screenshot({ path: 'shots/14-arcade-play.png' });

// debug dish + serve
await page.evaluate(() => window.__SIZZLE__.giveDish('cheeseburger'));
await tp1('pass');
await page.waitForTimeout(300);
await page.keyboard.press('Space');
await page.waitForTimeout(800);
console.log('served', await info());
await page.screenshot({ path: 'shots/15-arcade-served.png' });

console.log('errors', errors);
await browser.close();
