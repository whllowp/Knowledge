import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  Bindings,
  getBindings,
  keyLabel,
  applyDeadzone,
  readPad,
  GamepadInput,
  actionsForCode,
  ACTION_SETS,
} from '../src/core/input.js';

test('key labels are readable', () => {
  assert.equal(keyLabel('KeyW'), 'W');
  assert.equal(keyLabel('Digit3'), '3');
  assert.equal(keyLabel('Space'), '空格');
  assert.equal(keyLabel('ArrowUp'), '↑');
  assert.equal(keyLabel('ShiftLeft'), '左Shift');
  assert.equal(keyLabel('NumpadEnter'), '小键盘Enter');
});

test('default bindings cover every action and are conflict-free', () => {
  const b = new Bindings('fp');
  for (const action of Object.keys(ACTION_SETS.fp)) {
    assert.ok(b.codesFor(action).length > 0, `${action} has a default`);
  }
  const all = Object.values(b.map).flat();
  assert.equal(new Set(all).size, all.length, 'defaults have no duplicate keys');
  assert.equal(b.label('interact'), 'E');
});

test('rebinding replaces keys, rejects conflicts and Escape, and resets', () => {
  const b = new Bindings('fp');
  b.reset();
  assert.equal(b.set('interact', 'KeyR').ok, true);
  assert.deepEqual(b.codesFor('interact'), ['KeyR']);
  assert.equal(b.label('interact'), 'R');

  const conflict = b.set('sprint', 'KeyR');
  assert.equal(conflict.ok, false);
  assert.equal(conflict.reason, 'conflict');
  assert.equal(conflict.conflict, 'interact');

  assert.equal(b.set('interact', 'Escape').ok, false);
  assert.equal(b.set('interact', 'Escape').reason, 'reserved');

  b.reset('interact');
  assert.equal(b.label('interact'), 'E');
  b.set('interact', 'KeyR');
  b.reset();
  assert.equal(b.label('interact'), 'E');
  assert.equal(b.label('sprint'), '左Shift / 右Shift');
});

test('bindings singleton is shared and persisted', () => {
  const a = getBindings('arcade');
  a.reset();
  a.set('p1Interact', 'KeyQ');
  const b = getBindings('arcade');
  assert.equal(b, a);
  assert.equal(b.label('p1Interact'), 'Q');
  assert.deepEqual(actionsForCode(b, 'KeyQ'), ['p1Interact']);
  a.reset();
});

test('deadzone is radial and rescales', () => {
  assert.deepEqual(applyDeadzone(0.1, 0.1, 0.2), { x: 0, y: 0, mag: 0 });
  const s = applyDeadzone(1, 0, 0.2);
  assert.ok(Math.abs(s.x - 1) < 1e-6);
  const d = applyDeadzone(0.6, 0, 0.2);
  assert.ok(d.x > 0.4 && d.x < 0.6);
});

function fakePad({ axes = [0, 0, 0, 0], buttons = [] } = {}) {
  return {
    connected: true,
    id: 'fake pad',
    axes,
    buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: !!buttons[i], value: buttons[i] ? 1 : 0 })),
  };
}

test('standard gamepad maps sticks and buttons', () => {
  const pad = readPad(fakePad({ axes: [0.8, -0.5, -0.4, 0.6], buttons: { 0: 1, 2: 1, 7: 1, 9: 1 } }));
  assert.ok(pad.moveX > 0.5);
  assert.ok(pad.moveY < -0.3);
  assert.ok(pad.lookX < -0.2);
  assert.ok(pad.lookY > 0.3);
  assert.equal(pad.interact, true);
  assert.equal(pad.chop, true);
  assert.equal(pad.sprint, true);
  assert.equal(pad.pause, true);
});

test('gamepad edge detection and activity callback', () => {
  let device = null;
  const gp = new GamepadInput({ index: 0, onDevice: (d) => (device = d) });
  gp.poll(fakePad());
  assert.equal(gp.connected, true);
  assert.equal(gp.pressedInteract, false);

  gp.poll(fakePad({ buttons: { 0: 1 } }));
  assert.equal(gp.pressedInteract, true);
  gp.poll(fakePad({ buttons: { 0: 1 } }));
  assert.equal(gp.pressedInteract, false, 'held button is not pressed again');
  assert.equal(device, 'gamepad');

  const move = gp.move;
  assert.equal(typeof move.x, 'number');
  gp.poll(null);
  assert.equal(gp.connected, false);
});
