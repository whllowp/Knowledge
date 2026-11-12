import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GameSession } from '../src/core/session.js';
import { createHands, createItem } from '../src/core/kitchen.js';
import { LEVELS, RECIPES, INGREDIENTS, recipeForToppings } from '../src/core/data.js';
import { stationPrompt } from '../src/core/prompts.js';

function ticket(recipeId, time = 70) {
  return { id: 99, recipeId, maxTime: time, time, done: false };
}

function setup(level = LEVELS[0]) {
  const session = new GameSession(level, { seed: 3 });
  const hands = createHands();
  session.orders.tickets = [];
  session.orders.spawnTimer = 999;
  return { session, hands };
}

function prepOnBoard(session, hands, crateId, stationId = 'board', dt = 2) {
  const crate = session.kitchen.getStation(crateId);
  let r = session.interact(crateId, hands);
  assert.equal(r.ok, true, `pickup ${crateId}`);
  r = session.interact(stationId, hands);
  assert.equal(r.ok, true, `place on ${stationId}`);
  if (stationId === 'board') {
    const chop = session.chopTick(stationId, hands, dt);
    assert.ok(chop?.done, 'chop should finish');
    r = session.interact(stationId, hands);
    assert.equal(r.ok, true, 'pickup chopped');
  }
  return hands.carry;
}

function addToPlate(session, hands, crateId, stationId = 'counter', board = true) {
  if (board) prepOnBoard(session, hands, crateId, 'board', 2);
  else {
    assert.equal(session.interact(crateId, hands).ok, true);
  }
  const r = session.interact(stationId, hands);
  assert.equal(r.ok, true, `topping ${crateId}`);
  return r;
}

test('recipe signatures are unique and refer to real ingredients', () => {
  const sigs = new Set();
  for (const recipe of Object.values(RECIPES)) {
    for (const t of recipe.ingredients) {
      assert.ok(INGREDIENTS[t.ingredient], `${recipe.id} uses ${t.ingredient}`);
      assert.ok(['raw', 'chopped', 'cooked'].includes(t.state), `bad state ${t.state}`);
    }
    const sig = recipe.ingredients.map((t) => `${t.ingredient}:${t.state}`).sort().join('|');
    assert.ok(!sigs.has(sig), 'duplicate recipe signature');
    sigs.add(sig);
  }
  assert.ok(Object.keys(RECIPES).length >= 3);
});

test('ingredient flow: crate -> board -> chop -> plate', () => {
  const { session, hands } = setup();
  assert.equal(session.interact('crate_lettuce', hands).ok, true);
  assert.equal(hands.carry.ingredient, 'lettuce');
  assert.equal(session.interact('board', hands).ok, true);
  assert.equal(hands.carry, null);
  const chop = session.chopTick('board', hands, 0.5);
  assert.equal(chop.done, false);
  assert.ok(chop.progress > 0.4 && chop.progress < 0.6);
  const done = session.chopTick('board', hands, 0.6);
  assert.equal(done.done, true);
  assert.equal(session.kitchen.getStation('board').item.state, 'chopped');
  const picked = session.interact('board', hands);
  assert.equal(picked.ok, true);
  assert.equal(hands.carry.state, 'chopped');
});

test('chopping is blocked when hands are full', () => {
  const { session, hands } = setup();
  session.interact('crate_lettuce', hands);
  session.interact('board', hands);
  session.interact('crate_tomato', hands);
  const r = session.chopTick('board', hands, 1.5);
  assert.equal(r.active, false);
});

test('stove cooks then burns a patty', () => {
  const { session, hands } = setup();
  session.interact('crate_patty', hands);
  session.interact('stove1', hands);
  const stove = session.kitchen.getStation('stove1');
  assert.equal(stove.item.state, 'raw');
  let events = session.kitchen.tick(5.6);
  assert.equal(stove.item.state, 'cooked');
  assert.ok(events.some((e) => e.type === 'cook:done'));
  events = session.kitchen.tick(5.2);
  assert.equal(stove.item.state, 'burnt');
  assert.ok(events.some((e) => e.type === 'cook:burn'));
  const picked = session.interact('stove1', hands);
  assert.equal(picked.item.state, 'burnt');
});

test('plate assembly matches recipe regardless of topping order', () => {
  const { session, hands } = setup();
  session.orders.tickets = [ticket('cheeseburger')];

  assert.equal(session.interact('plates', hands).ok, true);
  assert.equal(session.interact('counter', hands).ok, true);
  assert.equal(session.kitchen.getStation('counter').item.type, 'plate');

  addToPlate(session, hands, 'crate_bun', 'counter', false);
  addToPlate(session, hands, 'crate_cheese', 'counter', false);
  prepOnBoard(session, hands, 'crate_lettuce');
  session.interact('counter', hands);
  prepOnBoard(session, hands, 'crate_tomato');
  session.interact('counter', hands);

  session.interact('crate_patty', hands);
  session.interact('stove1', hands);
  session.kitchen.tick(5.6);
  session.interact('stove1', hands);
  session.interact('counter', hands);

  const plate = session.kitchen.getStation('counter').item;
  const recipe = recipeForToppings(plate.contents);
  assert.equal(recipe.id, 'cheeseburger');

  assert.equal(session.interact('counter', hands).ok, true);
  assert.equal(hands.carry.type, 'plate');
  const res = session.interact('pass', hands);
  assert.equal(res.ok, true);
  assert.equal(res.recipe.id, 'cheeseburger');
  assert.ok(res.points >= 130, `points ${res.points}`);
  assert.equal(session.score, res.points);
  assert.equal(session.stats.served, 1);
  assert.equal(session.orders.tickets.length, 0);
  assert.equal(session.combo, 1);
});

test('serving an unordered dish awards nothing and does not consume a ticket', () => {
  const { session, hands } = setup();
  session.orders.tickets = [ticket('salad', 60)];
  const plate = session.kitchen.getStation('counter');
  session.interact('plates', hands);
  session.interact('counter', hands);
  addToPlate(session, hands, 'crate_lettuce', 'counter');
  addToPlate(session, hands, 'crate_tomato', 'counter');
  addToPlate(session, hands, 'crate_onion', 'counter');
  const dish = session.kitchen.getStation('counter').item;
  assert.equal(recipeForToppings(dish.contents).id, 'salad');
  session.orders.tickets[0].recipeId = 'cheeseburger';
  assert.equal(session.interact('counter', hands).ok, true);
  const res = session.interact('pass', hands);
  assert.equal(res.ok, true);
  assert.equal(res.recipe.id, 'salad');
  assert.equal(res.unwanted, true);
  assert.equal(res.points, 0);
  assert.equal(session.score, 0);
  assert.equal(session.orders.tickets.length, 1);
});

test('a random pile of toppings is not a recipe', () => {
  assert.equal(recipeForToppings([{ ingredient: 'bun', state: 'raw' }]), null);
  assert.equal(recipeForToppings([]), null);
  assert.equal(
    recipeForToppings([
      { ingredient: 'lettuce', state: 'raw' },
      { ingredient: 'tomato', state: 'chopped' },
      { ingredient: 'onion', state: 'chopped' },
    ]),
    null,
  );
});

test('orders expire, reset combo, and get replaced', () => {
  const { session } = setup();
  session.combo = 3;
  session.comboTimer = 20;
  session.orders.tickets = [ticket('salad', 0.05)];
  session.orders.spawnTimer = 0.01;
  let expired = 0;
  session.events.on('order:expired', () => expired++);
  session.tick(0.1);
  assert.equal(expired, 1);
  assert.equal(session.stats.expired, 1);
  assert.equal(session.combo, 0);
  assert.ok(session.orders.tickets.length >= 1, 'replacement ticket spawns');
});

test('timer ends the shift and computes stars against targets', () => {
  const { session } = setup();
  session.score = LEVELS[0].target[1] + 5;
  session.timeLeft = 0.01;
  let ended = null;
  session.events.on('level:end', (e) => (ended = e));
  session.tick(0.02);
  assert.equal(session.state, 'over');
  assert.ok(ended);
  assert.equal(session.stars, 2);
});

test('serving at the pass without a dish is blocked', () => {
  const { session, hands } = setup();
  assert.equal(session.interact('pass', hands).ok, false);
  session.interact('plates', hands);
  assert.equal(session.interact('pass', hands).ok, false);
});

test('trash destroys carried items', () => {
  const { session, hands } = setup();
  session.interact('crate_bun', hands);
  const r = session.interact('trash', hands);
  assert.equal(r.action, 'trash');
  assert.equal(hands.carry, null);
});

test('prompts follow the state of hands and stations', () => {
  const { session, hands } = setup();
  const crate = session.kitchen.getStation('crate_patty');
  assert.match(stationPrompt(crate, hands, session.kitchen).title, /肉饼/);
  session.interact('crate_lettuce', hands);
  const board = session.kitchen.getStation('board');
  assert.match(stationPrompt(board, hands, session.kitchen).title, /生菜/);
});

test('combo multiplier grows and is capped', () => {
  const { session } = setup();
  session.combo = 0;
  assert.equal(session.comboMultiplier, 1);
  session.combo = 1;
  assert.equal(session.comboMultiplier, 1.25);
  session.combo = 4;
  assert.equal(session.comboMultiplier, 2);
  session.combo = 8;
  assert.equal(session.comboMultiplier, 2);
});

test('double burger needs two cooked patties', () => {
  const recipe = RECIPES.double;
  const patties = recipe.ingredients.filter((t) => t.ingredient === 'patty' && t.state === 'cooked');
  assert.equal(patties.length, 2);
  const onePattyOnDouble = recipe.ingredients.filter((_, i) => i !== 2);
  const match = recipeForToppings(onePattyOnDouble);
  assert.equal(match.id, 'cheeseburger', 'one patty makes a single, never a double');
  assert.equal(RECIPES.double.ingredients.filter((t) => t.ingredient === 'patty').length, 2);
});

test('items can be grabbed directly from a station in tests', () => {
  const { session } = setup();
  session.kitchen.setItem('stove2', createItem('patty'));
  assert.equal(session.kitchen.getStation('stove2').item.ingredient, 'patty');
});
