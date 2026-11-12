import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

await mkdir('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const waitPage = (fn, timeout = 30000) => page.waitForFunction(fn, null, { timeout, polling: 100 });
const tp = async (id) => {
  await page.evaluate((sid) => window.__SIZZLE__.teleport(sid), id);
  await waitPage(`window.__SIZZLE__.app.mode.nearestId === ${JSON.stringify(id)}`);
  await page.waitForTimeout(200);
};

await page.goto(url);
await page.waitForTimeout(600);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.waitForTimeout(200);
await page.locator('.mode-card[data-mode="fp"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(1200);

// pointer lock check
await page.locator('#fp-canvas').click({ position: { x: 500, y: 300 } });
await page.waitForTimeout(400);
const lockState = await page.evaluate(() => ({
  locked: !!document.pointerLockElement,
  audio: window.__SIZZLE__.app.audio.ctx?.state,
  started: window.__SIZZLE__.app.audio.started,
}));
const yaw0 = await page.evaluate(() => window.__SIZZLE__.app.mode.player.yaw);
await page.mouse.move(650, 300);
await page.mouse.move(750, 320);
await page.waitForTimeout(300);
const yaw1 = await page.evaluate(() => window.__SIZZLE__.app.mode.player.yaw);
console.log('lock/audio', lockState, 'yaw moved', { yaw0: +yaw0.toFixed(3), yaw1: +yaw1.toFixed(3) });

// cook a patty
await tp('crate_patty');
await page.keyboard.press('e');
await waitPage('window.__SIZZLE__.app.mode.hands.carry?.ingredient === "patty"');
await tp('stove1');
await page.keyboard.press('e');
await waitPage('window.__SIZZLE__.app.session.kitchen.getStation("stove1").item');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/16-stove-cooking.png' });
console.log('cooking', await page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  const st = s.kitchen.getStation('stove1');
  return { state: st.item?.state, cook: +st.item?.cookTimer.toFixed(2), prompt: window.__SIZZLE__.app.mode.getPrompt(), sizzle: +window.__SIZZLE__.app.mode.sizzleLevel.toFixed(2) };
}));

await waitPage('window.__SIZZLE__.session.kitchen.getStation("stove1").item?.state === "cooked"');
await page.waitForTimeout(300);
await page.screenshot({ path: 'shots/17-stove-cooked.png' });

await waitPage('window.__SIZZLE__.session.kitchen.getStation("stove1").item?.state === "burnt"', 60000);
await page.waitForTimeout(400);
await page.screenshot({ path: 'shots/18-stove-burnt.png' });
console.log('burnt', await page.evaluate(() => {
  const st = window.__SIZZLE__.session.kitchen.getStation('stove1');
  return { state: st.item?.state, prompt: window.__SIZZLE__.app.mode.getPrompt()?.title };
}));

// discard the burnt patty
await tp('stove1');
await page.keyboard.press('e');
await waitPage('window.__SIZZLE__.app.mode.hands.carry?.state === "burnt"');
await tp('trash');
await page.keyboard.press('e');
await waitPage('window.__SIZZLE__.app.mode.hands.carry === null');
console.log('trashed', await page.evaluate(() => ({
  stove: window.__SIZZLE__.session.kitchen.getStation('stove1').item,
  toasts: document.querySelectorAll('#toasts .toast').length,
})));

// a debug burger to check the plate visual
await page.evaluate(() => {
  window.__SIZZLE__.giveDish('cheeseburger');
  window.__SIZZLE__.teleport('counter');
});
await page.waitForTimeout(600);
await page.screenshot({ path: 'shots/19-burger-hand.png' });

console.log('errors', errors);
await browser.close();
