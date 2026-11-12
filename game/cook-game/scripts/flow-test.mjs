import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { gameUrl as url } from './game-url.mjs';

await mkdir('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console ${m.text()}`); });
const waitPage = (fn, timeout = 15000) => page.waitForFunction(fn, null, { timeout, polling: 100 });

await page.goto(url);
await page.waitForTimeout(600);
await page.getByRole('button', { name: /开始游戏/ }).click();
await page.locator('.mode-card[data-mode="fp"]').click();
await page.locator('[data-action="start"]').click();
await page.waitForTimeout(700);
const introVisible = await page.evaluate(() => {
  const el = document.getElementById('level-intro');
  return el && !el.classList.contains('hidden') ? el.textContent.replace(/\s+/g, ' ').trim() : null;
});
await page.screenshot({ path: 'shots/26-fp-intro.png' });
console.log('intro', introVisible);
await waitPage("document.getElementById('level-intro').classList.contains('hidden')", 12000);

// 15 second warning
await page.evaluate(() => { window.__SIZZLE__.session.timeLeft = 15.6; });
await waitPage("[...document.querySelectorAll('#toasts .toast')].some(t => t.textContent.includes('最后 15 秒'))");
console.log('warning ok');

// serve a dish via the debug helper to test combo and results
await page.evaluate(() => {
  const app = window.__SIZZLE__.app;
  app.session.score = 400;
  app.session.combo = 2;
  app.session.comboTimer = 20;
});
await page.evaluate(() => window.__SIZZLE__.giveDish('cheeseburger'));
await page.evaluate(() => window.__SIZZLE__.teleport('pass'));
await waitPage("window.__SIZZLE__.app.mode.nearestId === 'pass'");
await page.keyboard.press('e');
await waitPage('window.__SIZZLE__.session.stats.served >= 1');
console.log('combo serve', await page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  return { score: s.score, combo: s.combo, mult: s.comboMultiplier, popups: document.querySelectorAll('.score-pop').length };
}));
await page.screenshot({ path: 'shots/27-fp-combo.png' });

// end shift and check the results screen
await page.evaluate(() => { window.__SIZZLE__.session.timeLeft = 0.01; });
await waitPage("document.getElementById('screen-results').classList.contains('active')");
console.log('results', await page.evaluate(() => ({
  score: document.getElementById('results-score').textContent,
  best: document.getElementById('results-best').textContent,
  stars: [...document.querySelectorAll('#results-stars i')].map((s) => s.classList.contains('on')),
  next: document.querySelector('#screen-results [data-action="next"]').textContent,
})));
await page.screenshot({ path: 'shots/28-results.png' });

// next shift should rebuild the renderer cleanly
await page.locator('#screen-results [data-action="next"]').click();
await page.waitForTimeout(1600);
console.log('next shift', await page.evaluate(() => ({
  level: window.__SIZZLE__.app.levelId,
  mode: window.__SIZZLE__.app.modeName,
  state: window.__SIZZLE__.session?.state,
  renderer: !!window.__SIZZLE__.app.mode?.renderer,
  levelName: document.getElementById('hud-level').textContent,
  calls: window.__SIZZLE__.app.mode?.renderer?.info?.render?.calls,
})));
await page.screenshot({ path: 'shots/29-level2.png' });

// pause via button, then resume via button (pointer lock)
await page.locator('[data-action="pause"]').click();
await page.waitForTimeout(400);
console.log('paused', await page.evaluate(() => ({
  screen: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
  paused: window.__SIZZLE__.app.paused,
})));
await page.locator('#screen-pause [data-action="resume"]').click();
await page.waitForTimeout(700);
console.log('resumed', await page.evaluate(() => ({
  screens: [...document.querySelectorAll('.screen.active')].map((s) => s.id),
  paused: window.__SIZZLE__.app.paused,
  locked: !!document.pointerLockElement,
})));

// restart from pause should not leak (Esc releases pointer lock and pauses)
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
await page.locator('#screen-pause [data-action="restart"]').click();
await page.waitForTimeout(1400);
console.log('restart', await page.evaluate(() => ({
  level: window.__SIZZLE__.app.levelId,
  score: window.__SIZZLE__.session.score,
  time: Math.round(window.__SIZZLE__.session.timeLeft),
  calls: window.__SIZZLE__.app.mode?.renderer?.info?.render?.calls,
})));

console.log('errors', errors);
await browser.close();
