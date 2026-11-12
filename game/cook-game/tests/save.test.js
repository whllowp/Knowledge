import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  setTargetOverride,
  getTargetOverride,
  clearTargetOverrides,
  resolveLevel,
  targetOverrides,
} from '../src/core/save.js';

test('target overrides apply to a level and clear', () => {
  clearTargetOverrides();
  const level = { id: 1, target: [300, 475, 625] };
  assert.equal(getTargetOverride('fp', 1), null);
  assert.deepEqual(resolveLevel(level, 'fp'), level);

  assert.deepEqual(setTargetOverride('fp', 1, [325, 500, 700]), [325, 500, 700]);
  assert.deepEqual(getTargetOverride('fp', 1), [325, 500, 700]);
  const resolved = resolveLevel(level, 'fp');
  assert.deepEqual(resolved.target, [325, 500, 700]);
  assert.equal(level.target[0], 300, 'base level is not mutated');

  setTargetOverride('arcade', 2, [400, 600, 800]);
  assert.deepEqual(targetOverrides().arcade[2], [400, 600, 800]);
  clearTargetOverrides();
  assert.deepEqual(targetOverrides(), {});
  assert.equal(getTargetOverride('fp', 1), null);
});

test('invalid target overrides are rejected', () => {
  clearTargetOverrides();
  assert.equal(setTargetOverride('fp', 1, [300, 200, 100]), null);
  assert.equal(setTargetOverride('fp', 1, [300, 400]), null);
  assert.equal(setTargetOverride('fp', 1, [300, 400, 'x']), null);
  assert.equal(getTargetOverride('fp', 1), null);
});
