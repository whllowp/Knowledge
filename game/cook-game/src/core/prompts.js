// Contextual interaction prompts, shared by the 3D reticle and the 2D hint bar.

import { INGREDIENTS, recipeForToppings } from './data.js';
import { itemName } from './kitchen.js';

const pct = (v) => `${Math.round(v * 100)}%`;

export function stationPrompt(station, hands, kitchen) {
  if (!station) return null;
  const carry = hands?.carry ?? null;
  const st = station;

  switch (st.kind) {
    case 'crate': {
      if (carry) return { title: '双手已满', hint: '先放下或处理手上的东西', blocked: true };
      return { title: `拿${INGREDIENTS[st.ingredient].name}`, hint: '按 E', action: '拿取' };
    }

    case 'board': {
      if (st.item) {
        const def = INGREDIENTS[st.item.ingredient];
        if (carry) return { title: '砧板被占用了', hint: '先拿走砧板上的食材', blocked: true };
        if (def?.choppable && st.item.state !== 'chopped') {
          const p = Math.min(1, (st.item.chopProgress || 0) / def.chopTime);
          return {
            title: `切${def.name}`,
            hint: p > 0 ? `按住 E / 左键 · ${pct(p)}` : '按住 E / 左键',
            action: '切菜',
            progress: p,
          };
        }
        return { title: `拿走${itemName(st.item)}`, hint: '按 E', action: '拿取' };
      }
      if (carry?.type === 'ingredient') {
        const def = INGREDIENTS[carry.ingredient];
        return {
          title: `放上${def.name}`,
          hint: def.choppable ? '放下后按住 E 切碎' : '按 E',
          action: '放置',
        };
      }
      if (carry?.type === 'plate') return { title: '盘子不能放砧板', hint: '找个出餐台', blocked: true };
      return { title: '砧板空着', hint: '拿食材过来切' };
    }

    case 'stove': {
      if (st.item) {
        const def = INGREDIENTS[st.item.ingredient];
        if (carry) return { title: '煎炉被占用了', hint: '先拿走煎炉上的食材', blocked: true };
        if (st.item.state === 'burnt') {
          return { title: `拿走${itemName(st.item)}`, hint: '扔进垃圾桶，别上菜', action: '拿取', danger: true };
        }
        if (st.item.state === 'cooked') {
          return { title: `拿走${itemName(st.item)}`, hint: '按 E', action: '拿取', good: true };
        }
        const p = def?.cookable ? Math.min(1, st.item.cookTimer / def.cookTime) : 0;
        return { title: `煎制中 ${pct(p)}`, hint: '熟了再拿 · 再等就要焦了', progress: p };
      }
      if (carry?.type === 'ingredient' && INGREDIENTS[carry.ingredient]?.cookable) {
        return { title: `放下${itemName(carry)}`, hint: '按 E 开煎', action: '开煎' };
      }
      if (carry) return { title: '煎炉只煎肉饼', hint: '先把别的东西放下', blocked: true };
      return { title: '空煎炉', hint: '拿生肉饼过来' };
    }

    case 'plateStack': {
      if (carry) return { title: '双手已满', hint: '先放下手上的东西', blocked: true };
      return { title: '拿一个盘子', hint: '按 E', action: '拿取' };
    }

    case 'counter': {
      if (st.item?.type === 'plate') {
        if (carry?.type === 'ingredient') {
          return {
            title: `把${itemName(carry)}放上盘子`,
            hint: '按 E · 依次摆好配料',
            action: '摆盘',
          };
        }
        if (carry?.type === 'plate') return { title: '这里已经有盘子了', hint: '端着盘子上菜去吧', blocked: true };
        if (carry) return { title: '手上还拿着东西', hint: '先处理一下', blocked: true };
        const recipe = recipeForToppings(st.item.contents);
        if (recipe) {
          return { title: `端起${recipe.name}`, hint: '按 E · 然后去上菜窗口', action: '拿取', good: true };
        }
        const n = st.item.contents.length;
        return {
          title: n ? `盘子 · ${n} 种配料` : '空盘子',
          hint: n ? '继续摆配料，或端走' : '从食材箱拿配料放上来',
        };
      }
      if (carry?.type === 'plate') return { title: '放下盘子', hint: '按 E 开始摆盘', action: '放置' };
      if (carry) return { title: '先放个盘子在台上', hint: '盘子台在左边', blocked: true };
      return { title: '空出餐台', hint: '从盘子台拿一个盘子' };
    }

    case 'pass': {
      if (carry?.type === 'plate' && carry.contents.length) {
        const recipe = recipeForToppings(carry.contents);
        if (recipe) {
          return { title: `上菜：${recipe.name}`, hint: '按 E 交给窗口', action: '上菜', good: true };
        }
        return { title: '上菜（配方不对）', hint: '客人不会收这盘', danger: true };
      }
      if (carry?.type === 'plate') return { title: '空盘不能上菜', hint: '先摆好配料', blocked: true };
      if (carry) return { title: '上菜窗口只收装好的菜', hint: '把食材做成菜再来', blocked: true };
      return { title: '上菜窗口', hint: '端一盘做好的菜过来' };
    }

    case 'trash': {
      if (carry) return { title: `扔掉${itemName(carry)}`, hint: '按 E · 眼不见心不烦', action: '丢弃' };
      return { title: '垃圾桶', hint: '端着不要的东西过来' };
    }

    default:
      return null;
  }
}

/** Station subtitle shown on the world-space sign. */
export function stationSubtitle(station, kitchen) {
  if (!station) return '';
  if (station.kind === 'stove' && station.item?.type === 'ingredient') {
    const def = INGREDIENTS[station.item.ingredient];
    if (station.item.state === 'cooked') return '已熟';
    if (station.item.state === 'burnt') return '烧焦';
    if (def?.cookable) return `${Math.round(kitchen.cookProgress(station) * 100)}%`;
  }
  return '';
}
