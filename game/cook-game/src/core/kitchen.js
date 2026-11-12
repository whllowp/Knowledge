// Kitchen state machine shared by both game modes.
//
// The kitchen owns stations and the items sitting on them. Players only own a
// `hands` object ({ carry: Item|null }); movement and proximity live in the
// mode layer, while every rule about food lives here so the 3D mode and the 2D
// mode can never disagree.

import { INGREDIENTS, STATIONS, STATION_BY_ID } from './data.js';

let UID = 1;

export function createItem(ingredient, state = 'raw') {
  return {
    uid: `i${UID++}`,
    type: 'ingredient',
    ingredient,
    state,
    chopProgress: 0,
    cookTimer: 0,
  };
}

export function createPlate() {
  return { uid: `p${UID++}`, type: 'plate', contents: [] };
}

export function createHands() {
  return { carry: null };
}

const ok = (action, message, extra = {}) => ({ ok: true, action, message, ...extra });
const blocked = (message) => ({ ok: false, action: 'blocked', message });

export function itemName(item) {
  if (!item) return '空手';
  if (item.type === 'plate') {
    if (item.contents.length === 0) return '空盘子';
    return '装好的盘子';
  }
  const def = INGREDIENTS[item.ingredient];
  if (!def) return '神秘食材';
  if (item.state === 'burnt') return `烧焦的${def.name}`;
  if (item.state === 'cooked') return `熟${def.name}`;
  if (item.state === 'chopped') return `${def.name}碎`;
  return def.name;
}

export function itemStateTag(item) {
  if (!item) return '';
  if (item.type === 'plate') return item.contents.length ? `${item.contents.length} 种配料` : '空盘';
  if (item.state === 'burnt') return '烧焦';
  if (item.state === 'cooked') return '已熟';
  if (item.state === 'chopped') return '切好';
  return '';
}

export class Kitchen {
  constructor(layout = STATIONS) {
    this.stations = new Map();
    for (const def of layout) {
      this.stations.set(def.id, {
        ...def,
        item: null,
        sizzle: 0,
        lastState: null,
      });
    }
    this.stationSeq = 0;
  }

  getStation(id) {
    return this.stations.get(id) || null;
  }

  get list() {
    return [...this.stations.values()];
  }

  /** Put an item somewhere directly (debug/tests). */
  setItem(stationId, item) {
    const st = this.stations.get(stationId);
    if (!st) throw new Error(`unknown station ${stationId}`);
    st.item = item;
  }

  /**
   * One discrete interaction (E / Space). Mutates hands + station and returns
   * a result the presentation layer turns into a prompt/sound/animation.
   */
  interact(stationId, hands) {
    const st = this.stations.get(stationId);
    if (!st) return blocked('这里没有设备');

    switch (st.kind) {
      case 'crate': {
        if (hands.carry) return blocked('双手已经拿满了');
        const item = createItem(st.ingredient);
        hands.carry = item;
        return ok('pickup', `拿起${INGREDIENTS[st.ingredient].name}`, { item, station: st });
      }

      case 'board': {
        if (st.item) {
          if (hands.carry) return blocked('砧板上有东西，先拿走');
          const item = st.item;
          st.item = null;
          hands.carry = item;
          if (item.type === 'ingredient' && INGREDIENTS[item.ingredient]?.choppable && item.state !== 'chopped') {
            return ok('pickup', `拿起${itemName(item)}（还没切完）`, { item, station: st });
          }
          return ok('pickup', `拿起${itemName(item)}`, { item, station: st });
        }
        if (!hands.carry) return blocked('把需要切的食材放上砧板');
        if (hands.carry.type !== 'ingredient') return blocked('盘子不能放砧板上');
        const item = hands.carry;
        hands.carry = null;
        st.item = item;
        const def = INGREDIENTS[item.ingredient];
        if (def?.choppable && item.state !== 'chopped') {
          return ok('place', `放上${def.name} · 按住互动键切碎`, { item, station: st });
        }
        return ok('place', `放上${itemName(item)}`, { item, station: st });
      }

      case 'stove': {
        if (st.item) {
          if (hands.carry) return blocked('先拿走煎炉上的食材');
          const item = st.item;
          st.item = null;
          hands.carry = item;
          return ok('pickup', `拿起${itemName(item)}`, { item, station: st });
        }
        if (!hands.carry) return blocked('把肉饼放上煎炉');
        if (hands.carry.type !== 'ingredient') return blocked('煎炉上不能放盘子');
        const def = INGREDIENTS[hands.carry.ingredient];
        if (!def?.cookable) return blocked(`${def?.name || '这个'}不用煎`);
        const item = hands.carry;
        hands.carry = null;
        item.cookTimer = 0;
        st.item = item;
        return ok('place', `${def.name}开始滋滋作响`, { item, station: st });
      }

      case 'plateStack': {
        if (hands.carry) return blocked('双手已经拿满了');
        const plate = createPlate();
        hands.carry = plate;
        return ok('pickup', '拿起一个空盘子', { item: plate, station: st });
      }

      case 'counter': {
        if (st.item?.type === 'plate') {
          if (hands.carry?.type === 'ingredient') {
            const item = hands.carry;
            hands.carry = null;
            st.item.contents.push({ ingredient: item.ingredient, state: item.state });
            const def = INGREDIENTS[item.ingredient];
            return ok('topping', `把${itemName(item)}放上盘子`, { item, plate: st.item, station: st, ingredient: def });
          }
          if (hands.carry?.type === 'plate') return blocked('这张台子上已经有盘子了');
          if (hands.carry) return blocked('手上还拿着东西');
          const plate = st.item;
          st.item = null;
          hands.carry = plate;
          return ok('pickup', `端起盘子（${plate.contents.length} 种配料）`, { item: plate, station: st });
        }
        if (hands.carry?.type === 'plate') {
          const plate = hands.carry;
          hands.carry = null;
          st.item = plate;
          return ok('place', '放下盘子，开始摆盘', { item: plate, station: st });
        }
        if (hands.carry) return blocked('先放一个空盘子在台面上');
        return blocked('出餐台上是空的');
      }

      case 'pass': {
        if (!hands.carry) return blocked('端一盘做好的菜过来');
        if (hands.carry.type !== 'plate') return blocked('上菜窗口只收装好的菜');
        if (hands.carry.contents.length === 0) return blocked('空盘子可不能上菜');
        const plate = hands.carry;
        hands.carry = null;
        return ok('serve', '出餐！', { plate, station: st });
      }

      case 'trash': {
        if (!hands.carry) return blocked('垃圾桶是空的');
        const item = hands.carry;
        hands.carry = null;
        return ok('trash', `扔掉了${itemName(item)}`, { item, station: st });
      }

      default:
        return blocked('这里没什么可做的');
    }
  }

  /** What happens when the player holds the chop action near a board. */
  chopTick(stationId, hands, dt) {
    const st = this.stations.get(stationId);
    if (!st || st.kind !== 'board' || !st.item) return null;
    const item = st.item;
    const def = INGREDIENTS[item.ingredient];
    if (!def?.choppable) return null;
    if (item.state === 'chopped') return null;
    if (hands.carry) return { active: false, reason: 'hands-full' };

    item.chopProgress = Math.min(def.chopTime, (item.chopProgress || 0) + dt);
    const done = item.chopProgress >= def.chopTime - 1e-6;
    if (done) item.state = 'chopped';
    return {
      active: true,
      done,
      progress: item.chopProgress / def.chopTime,
      item,
      station: st,
    };
  }

  /** Cooking timers for every stove. Returns events for audio/FX. */
  tick(dt) {
    const events = [];
    for (const st of this.stations.values()) {
      if (st.kind !== 'stove' || !st.item || st.item.type !== 'ingredient') {
        st.sizzle = Math.max(0, st.sizzle - dt);
        continue;
      }
      const def = INGREDIENTS[st.item.ingredient];
      if (!def?.cookable) continue;
      const item = st.item;
      st.sizzle = 1;

      if (item.state === 'burnt') continue;
      item.cookTimer += dt;

      if (item.state === 'raw' && item.cookTimer >= def.cookTime) {
        item.state = 'cooked';
        events.push({ type: 'cook:done', stationId: st.id, item, station: st });
      } else if (item.state === 'cooked' && item.cookTimer >= def.burnTime) {
        item.state = 'burnt';
        events.push({ type: 'cook:burn', stationId: st.id, item, station: st });
      }
    }
    return events;
  }

  /** 0..1 progress towards the next state, used by the HUD/gauge visuals. */
  cookProgress(st) {
    if (!st?.item || st.item.type !== 'ingredient') return 0;
    const def = INGREDIENTS[st.item.ingredient];
    if (!def?.cookable) return 0;
    if (st.item.state === 'burnt') return 1;
    if (st.item.state === 'cooked') return Math.min(1, st.item.cookTimer / def.burnTime);
    return Math.min(1, st.item.cookTimer / def.cookTime);
  }

  /** Reset between rounds. */
  clearItems() {
    for (const st of this.stations.values()) {
      st.item = null;
      st.sizzle = 0;
    }
  }
}

export function stationDef(id) {
  return STATION_BY_ID[id];
}
