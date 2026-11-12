import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};

await page.goto(url);
await page.waitForTimeout(600);
await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
await page.waitForTimeout(800);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#screen-pause [data-action="settings"]').click();
await page.waitForTimeout(300);

const interactBtn = page.locator('#bindings-fp .bind-row').filter({ hasText: '互动 / 切菜' }).locator('.bind-key');
const initial = await interactBtn.textContent();
check('default key', initial === 'E', initial);

await interactBtn.click();
await page.keyboard.press('w');
await page.waitForTimeout(200);
const conflict = await page.locator('#bind-status').textContent();
check('conflict rejected', conflict.includes('向前') && (await interactBtn.textContent()) === '按下按键…', conflict);

await page.keyboard.press('r');
await page.waitForTimeout(300);
const rebound = await page.locator('#bindings-fp .bind-row').filter({ hasText: '互动 / 切菜' }).locator('.bind-key').textContent();
const status = await page.locator('#bind-status').textContent();
check('rebound to R', rebound === 'R' && status.includes('已保存'), `${rebound} / ${status}`);

const help = await page.locator('[data-bind="fp:interact"]').first().textContent();
check('help label follows', help === 'R', help);
const stored = await page.evaluate(() => localStorage.getItem('sizzle-rush:bindings:v1'));
check('persisted', stored?.includes('KeyR'), stored);

await page.locator('#screen-settings [data-action="back"]').first().click();
await page.waitForTimeout(300);
await page.locator('#screen-pause [data-action="resume"]').click();
await page.waitForTimeout(500);
await page.evaluate(() => window.__SIZZLE__.teleport('crate_patty'));
await page.waitForFunction(() => (document.getElementById('prompt-hint').textContent || '').includes('R'), null, { timeout: 10000 });
const hint = await page.evaluate(() => document.getElementById('prompt-hint').textContent);
check('prompt hint follows', hint.includes('R'), hint);

await page.keyboard.press('e');
await page.waitForTimeout(100);
const afterE = await page.evaluate(() => window.__SIZZLE__.mode.hands.carry);
check('old key inactive', afterE === null, afterE);

await page.keyboard.press('r');
await page.waitForFunction(() => window.__SIZZLE__.mode.hands.carry?.ingredient === 'patty', null, { timeout: 10000 }).catch(() => {});
const afterR = await page.evaluate(() => window.__SIZZLE__.mode.hands.carry?.ingredient);
check('new key active', afterR === 'patty', afterR);

await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#screen-pause [data-action="settings"]').click();
await page.waitForTimeout(300);
await page.locator('#screen-settings [data-action="reset-bindings"][data-mode="fp"]').click();
await page.waitForTimeout(300);
const reset = await page.locator('[data-bind="fp:interact"]').first().textContent();
check('reset to E', reset === 'E', reset);
check('no console errors', errs.length === 0, errs);

await browser.close();
if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
