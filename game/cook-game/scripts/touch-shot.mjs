import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const errs=[]; page.on('pageerror', e=>errs.push(e.message)); page.on('console', m=>{if(m.type()==='error') errs.push(m.text());});
await page.goto(url + '?touch=1'); await page.waitForTimeout(500);
await page.evaluate(() => window.__SIZZLE__.start('arcade', 1, 1));
await page.waitForTimeout(1400);
await page.evaluate(() => {
  document.getElementById('level-intro').classList.add('hidden');
  window.__SIZZLE__.app.mode.teleportToStation('crate_patty', 0);
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'docs/screenshots/arcade-touch.png' });
console.log(await page.evaluate(() => ({ touch: window.__SIZZLE__.mode.touch.enabled, hidden: document.getElementById('touch-controls').classList.contains('hidden'), prompt: document.getElementById('prompt').getBoundingClientRect().toJSON(), stick: document.getElementById('touch-stick').getBoundingClientRect().toJSON(), action: document.getElementById('touch-action').getBoundingClientRect().toJSON(), hint: document.getElementById('hud-hint').offsetHeight })));
console.log('errors', errs);
await browser.close();
