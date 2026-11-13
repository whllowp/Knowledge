/**
 * probe.mjs — quick CDP probe for iterating on a single behaviour.
 *
 * Usage:
 *   node scripts/probe.mjs "<url>" '[{"label":"x","expr":"..."}, ...]'
 *
 * Evaluates each expression in the page and prints JSON. Exits non-zero if any
 * evaluation throws. Much faster than the full verify sweep.
 */
import { readFileSync } from 'node:fs';

const url = process.argv[2] || 'http://127.0.0.1:5177/?autostart=1&diag=1&quality=medium&noadapt=1';
const spec = process.argv[3] || '[]';
const exprs = JSON.parse(spec.trim().startsWith('[') ? spec : readFileSync(spec, 'utf8'));
const port = process.env.CDP_PORT || '9333';

async function httpJson(path) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await httpJson('/json/list');
let page = targets.find((t) => t.type === 'page');
if (!page) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
  page = created;
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
  }
});

function send(method, params = {}) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) {
    return { ok: false, error: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
  }
  return { ok: true, value: r.result?.value };
}

const errors = [];
await send('Runtime.enable');
await send('Page.enable');

const nav = await send('Page.navigate', { url });
await sleep(Number(process.env.BOOT_MS || 18000));

const out = [];
for (const e of exprs) {
  if (e.click) {
    const { x = 640, y = 400 } = e.click;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    out.push({ label: `click:${x},${y}`, ok: true, value: 'clicked' });
  }
  if (e.mouse) {
    const { x = 640, y = 400, button = 'none', type = 'mouseMoved' } = e.mouse;
    await send('Input.dispatchMouseEvent', { type, x, y, button, buttons: button === 'right' ? 2 : 0 });
    out.push({ label: `mouse:${type}`, ok: true, value: `${x},${y}` });
  }
  if (e.key) {
    const { code, type = 'keyDown' } = e.key;
    await send('Input.dispatchKeyEvent', {
      type: type === 'keyUp' ? 'keyUp' : 'rawKeyDown',
      code,
      key: code.replace(/^Key/, ''),
      windowsVirtualKeyCode: 0,
    });
    out.push({ label: `key:${type}:${code}`, ok: true, value: code });
  }
  if (e.expr) {
    const r = await evaluate(e.expr);
    out.push({ label: e.label, ...r });
    if (!r.ok) errors.push(`${e.label}: ${r.error}`);
  }
  if (e.wait) await sleep(e.wait);
  if (e.shot) {
    const shotPath = process.env.SHOT_DIR || '.';
    const buf = await send('Page.captureScreenshot', { format: 'png' });
    const { writeFileSync } = await import('node:fs');
    const file = `${shotPath}/${e.shot}.png`;
    writeFileSync(file, Buffer.from(buf.data, 'base64'));
    out.push({ label: `shot:${e.shot}`, ok: true, value: file });
  }
}

const consoleErrors = events
  .filter((m) => m.method === 'Runtime.exceptionThrown')
  .map((m) => m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
const consoleLogs = events
  .filter((m) => m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
  .map((m) => m.params.args.map((a) => a.value ?? a.description).join(' '));

console.log(JSON.stringify({ results: out, exceptions: consoleErrors, consoleErrors: consoleLogs }, null, 2));
ws.close();
process.exit(errors.length || consoleErrors.length ? 1 : 0);
