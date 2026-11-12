import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

// Inject two standard-mapping virtual pads before the app boots.
await page.addInitScript(() => {
  const makePad = (id, index) => ({
    id,
    connected: true,
    index,
    mapping: 'standard',
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
  });
  window.__pads = [makePad('virtual pad 1', 0), makePad('virtual pad 2', 1)];
  navigator.getGamepads = () => window.__pads;
});

const setPad = (index, { axes = [], buttons = {} } = {}) => page.evaluate(({ index, axes, buttons }) => {
  const pad = window.__pads[index];
  if (!pad) return;
  axes.forEach(([i, v]) => { pad.axes[i] = v; });
  for (const [i, pressed] of Object.entries(buttons)) {
    pad.buttons[Number(i)].pressed = !!pressed;
    pad.buttons[Number(i)].value = pressed ? 1 : 0;
  }
}, { index, axes, buttons });

const waitFor = (fn, timeout = 10000) => page.waitForFunction(fn, null, { timeout });
const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};

await page.goto(url);
await page.waitForTimeout(600);
await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
await page.waitForFunction(() => window.__SIZZLE__.mode?.player, null, { timeout: 10000 });
await page.evaluate(() => window.__SIZZLE__.teleport('crate_patty'));
await waitFor(() => window.__SIZZLE__.mode.activeStation?.id === 'crate_patty');

// A (index 0) picks up the patty.
await setPad(0, { buttons: { 0: true } });
await waitFor(() => window.__SIZZLE__.mode.hands.carry?.ingredient === 'patty');
await setPad(0, { buttons: { 0: false } });
check('gamepad pickup', true, await page.evaluate(() => window.__SIZZLE__.mode.hands.carry?.ingredient));

// left stick forward moves the player; right stick turns.
const before = await page.evaluate(() => ({ z: window.__SIZZLE__.mode.player.pos.z, yaw: window.__SIZZLE__.mode.player.yaw }));
await setPad(0, { axes: [[1, -1]] });
await page.waitForFunction((z0) => window.__SIZZLE__.mode.player.pos.z < z0 - 0.1, before.z, { timeout: 10000 }).catch(() => {});
await setPad(0, { axes: [[1, 0]] });
const after = await page.evaluate(() => ({ z: window.__SIZZLE__.mode.player.pos.z, yaw: window.__SIZZLE__.mode.player.yaw }));
check('gamepad move', after.z < before.z - 0.05, { before: before.z, after: after.z });

await setPad(0, { axes: [[2, 0.9]] });
await page.waitForFunction((y0) => Math.abs(window.__SIZZLE__.mode.player.yaw - y0) > 0.05, after.yaw, { timeout: 10000 }).catch(() => {});
await setPad(0, { axes: [[2, 0]] });
const turned = await page.evaluate(() => window.__SIZZLE__.mode.player.yaw);
check('gamepad look', Math.abs(turned - after.yaw) > 0.04, { yaw: turned });

// Start pauses.
await setPad(0, { buttons: { 9: true } });
await waitFor(() => window.__SIZZLE__.app.paused === true).catch(() => {});
await setPad(0, { buttons: { 9: false } });
const paused = await page.evaluate(() => ({
  paused: window.__SIZZLE__.app.paused,
  screen: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
}));
check('gamepad pause', paused.paused === true && paused.screen.includes('screen-pause'), paused);

// Resume before starting another shift.
if (paused.paused) {
  await page.locator('#screen-pause [data-action="resume"]').click();
  await page.waitForTimeout(300);
}

// Arcade: P1 pad moves right, P2 pad moves left.
await page.evaluate(() => window.__SIZZLE__.start('arcade', 1, 2));
await page.waitForFunction(() => window.__SIZZLE__.mode?.players?.length === 2, null, { timeout: 10000 });
const arcBefore = await page.evaluate(() => window.__SIZZLE__.mode.players.map((p) => ({ x: p.x, z: p.z })));
await setPad(0, { axes: [[0, 1]] });
await setPad(1, { axes: [[0, -1]] });
await page.waitForFunction((before0) => {
  const ps = window.__SIZZLE__.mode.players;
  return ps[0].x > before0[0].x + 0.05 && ps[1].x < before0[1].x - 0.05;
}, arcBefore, { timeout: 10000 }).catch(() => {});
await setPad(0, { axes: [[0, 0]] });
await setPad(1, { axes: [[0, 0]] });
const arcAfter = await page.evaluate(() => window.__SIZZLE__.mode.players.map((p) => ({ x: p.x, z: p.z })));
check('arcade P1/P2 move', arcAfter[0].x > arcBefore[0].x && arcAfter[1].x < arcBefore[1].x, { arcBefore, arcAfter });

// P1 pad A picks up from a crate.
await page.evaluate(() => window.__SIZZLE__.app.mode.teleportToStation('crate_cheese', 0));
await waitFor(() => window.__SIZZLE__.mode.nearest.get(0)?.id === 'crate_cheese');
await setPad(0, { buttons: { 0: true } });
await waitFor(() => window.__SIZZLE__.mode.players[0].hands.carry?.ingredient === 'cheese').catch(() => {});
await setPad(0, { buttons: { 0: false } });
const cheese = await page.evaluate(() => window.__SIZZLE__.mode.players[0].hands.carry?.ingredient || null);
check('arcade P1 pickup', cheese === 'cheese', cheese);

check('no console errors', errors.length === 0, errors);
await browser.close();
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
