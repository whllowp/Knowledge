import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 720 }, hasTouch: true });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};

await page.goto(url + '?touch=1');
await page.waitForTimeout(500);
await page.evaluate(() => window.__SIZZLE__.start('arcade', 1, 1));
await page.waitForFunction(() => window.__SIZZLE__.mode?.touch?.enabled === true, null, { timeout: 10000 });
const state = await page.evaluate(() => ({
  enabled: window.__SIZZLE__.mode.touch.enabled,
  hidden: document.getElementById('touch-controls').classList.contains('hidden'),
  body: document.body.classList.contains('touch-mode'),
  hint: getComputedStyle(document.getElementById('hud-hint')).display,
}));
check('touch controls visible', state.enabled && !state.hidden && state.body && state.hint === 'none', state);

const before = await page.evaluate(() => ({ x: window.__SIZZLE__.mode.players[0].x, z: window.__SIZZLE__.mode.players[0].z }));
await page.evaluate(() => {
  const el = document.getElementById('touch-stick');
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 11, clientX: cx, clientY: cy }));
  el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 11, clientX: cx + 44, clientY: cy }));
});
await page.waitForFunction((x0) => window.__SIZZLE__.mode.players[0].x > x0 + 0.1, before.x, { timeout: 10000 }).catch(() => {});
const mid = await page.evaluate(() => ({ x: window.__SIZZLE__.mode.players[0].x, z: window.__SIZZLE__.mode.players[0].z, mag: window.__SIZZLE__.mode.touch.mag }));
await page.evaluate(() => {
  document.getElementById('touch-stick').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 11 }));
});
check('joystick moves P1', mid.x > before.x + 0.05 && mid.mag > 0.5, { before, mid });

await page.evaluate(() => window.__SIZZLE__.app.mode.teleportToStation('crate_patty', 0));
await page.waitForFunction(() => window.__SIZZLE__.mode.nearest.get(0)?.id === 'crate_patty', null, { timeout: 10000 });
await page.evaluate(() => {
  document.getElementById('touch-action').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 12, clientX: 10, clientY: 10 }));
});
await page.waitForFunction(() => window.__SIZZLE__.mode.players[0].hands.carry?.ingredient === 'patty', null, { timeout: 10000 }).catch(() => {});
await page.evaluate(() => {
  document.getElementById('touch-action').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 12 }));
});
const carry = await page.evaluate(() => window.__SIZZLE__.mode.players[0].hands.carry?.ingredient || null);
check('touch button picks up', carry === 'patty', carry);

await page.evaluate(() => document.getElementById('touch-pause').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 13 })));
await page.waitForFunction(() => window.__SIZZLE__.app.paused === true, null, { timeout: 10000 });
const paused = await page.evaluate(() => ({ paused: window.__SIZZLE__.app.paused, touch: window.__SIZZLE__.mode.touch.enabled }));
check('touch pause', paused.paused && !paused.touch, paused);

await page.locator('#screen-pause [data-action="resume"]').click();
await page.waitForFunction(() => window.__SIZZLE__.app.paused === false && window.__SIZZLE__.mode.touch.enabled === true, null, { timeout: 10000 });
const resumed = await page.evaluate(() => ({
  paused: window.__SIZZLE__.app.paused,
  touch: window.__SIZZLE__.mode.touch.enabled,
  hidden: document.getElementById('touch-controls').classList.contains('hidden'),
}));
check('touch resume', !resumed.paused && resumed.touch && !resumed.hidden, resumed);
check('no console errors', errs.length === 0, errs);

await browser.close();
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
