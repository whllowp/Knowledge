import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errs=[]; page.on('pageerror', e=>errs.push(e.message)); page.on('console', m=>{if(m.type()==='error') errs.push(m.text());});
await page.goto(url); await page.waitForTimeout(700);
await page.locator('#screen-menu [data-action="settings"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-settings')).opacity === '1', null, { timeout: 15000 });
// Headless compositor can keep a stale blend frame; hide the vignette for a
// clean documentation capture (the in-game vignette is unchanged).
await page.evaluate(() => {
  document.getElementById('vignette').style.display = 'none';
});
await page.waitForTimeout(200);
const info = await page.evaluate(() => ({ h: document.getElementById('screen-settings').scrollHeight, ch: document.getElementById('screen-settings').clientHeight, foot: document.querySelector('#screen-settings .settings-foot').getBoundingClientRect().toJSON(), bind: document.querySelector('.bindings-card').getBoundingClientRect().toJSON() }));
console.log(info);
await page.screenshot({ path: 'shots/settings-warmup.png' });
await page.waitForTimeout(200);
await page.screenshot({ path: 'docs/screenshots/settings.png', animations: 'disabled' });
await page.evaluate(() => document.querySelector('.bindings-card').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(300);
await page.screenshot({ path: 'docs/screenshots/settings-bindings.png', animations: 'disabled' });
console.log('errors', errs);
await browser.close();
