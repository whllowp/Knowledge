import { chromium } from 'playwright';
import { gameUrl as url } from './game-url.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, acceptDownloads: true });
await page.addInitScript(() => localStorage.clear());
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

// Simulate a real browser: automation guard must see webdriver=false.
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
});

const failures = [];
const check = (name, ok, detail) => {
  console.log(name, ok ? 'ok' : 'FAIL', detail ?? '');
  if (!ok) failures.push(name);
};

await page.goto(url);
await page.waitForTimeout(600);
await page.locator('#screen-menu [data-action="settings"]').click();
await page.waitForTimeout(400);
await page.locator('#screen-settings [data-action="playtest-data"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-data')).opacity === '1', null, { timeout: 15000 });

await page.fill('#pt-participant', 'P01');
await page.selectOption('#pt-skill', 'novice');
await page.uncheck('#pt-first');
await page.waitForTimeout(300);
const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:v1')).settings.playtestProfile);
check('profile saved', profile.participant === 'P01' && profile.skill === 'novice' && profile.firstTime === false, profile);

await page.locator('#screen-data [data-action="back"]').first().click();
await page.waitForTimeout(300);
await page.locator('#screen-settings [data-action="back"]').first().click();
await page.waitForTimeout(300);

await page.evaluate(() => window.__SIZZLE__.start('fp', 1, 1));
await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = window.__SIZZLE__.session;
  s.score = 500;
  s.stats.served = 4;
  s.stats.expired = 1;
  s.timeLeft = 0.01;
});
await page.waitForFunction(() => document.getElementById('screen-results').classList.contains('active'), null, { timeout: 10000 });
await page.screenshot({ path: 'shots/results-survey.png' });
const record = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:playtests:v1')).slice(-1)[0]);
check('human record', record.source === 'human' && record.participant === 'P01' && record.skill === 'novice' && record.firstTime === false, record);
check('human metrics', record.served === 4 && record.expired === 1 && record.timeoutRate === 0.2, record);

await page.locator('[data-action="survey-difficulty"][data-value="4"]').click();
await page.locator('[data-action="survey-replay"][data-value="yes"]').click();
await page.waitForTimeout(200);
const survey = await page.evaluate(() => JSON.parse(localStorage.getItem('sizzle-rush:playtests:v1')).slice(-1)[0]);
check('survey saved', survey.difficulty === 4 && survey.wantReplay === 'yes', survey);

await page.locator('#screen-results [data-action="playtest-data"]').click();
await page.waitForFunction(() => getComputedStyle(document.getElementById('screen-data')).opacity === '1', null, { timeout: 15000 });
const human = await page.evaluate(() => ({
  text: document.getElementById('data-human').textContent,
  table: document.getElementById('data-table-body').textContent.replace(/\s+/g, ' ').trim(),
}));
check('human summary', human.text.includes('真人样本 1') && human.text.includes('20%'), human);
check('human table', human.table.includes('1（1 / 0）') && human.table.includes('500'), human);

const dl = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
await page.locator('#screen-data [data-action="export-csv"]').click();
const download = await dl;
const path = download ? await download.path() : null;
check('human CSV download', !!path, download?.suggestedFilename());
if (path) {
  const fs = await import('node:fs/promises');
  const csv = await fs.readFile(path, 'utf8');
  check('CSV profile columns', csv.includes('participant') && csv.includes('P01,novice,false'), csv.split('\n')[1]);
}

await page.screenshot({ path: 'shots/playtest-data-human.png' });
check('no console errors', errs.length === 0, errs);
await browser.close();

if (failures.length) {
  console.error('FAILED:', failures.join(', '));
  process.exit(1);
}
