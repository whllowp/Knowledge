/**
 * panels.js — the full-screen menu system: journal, inventory/loadout, shop,
 * quests & achievements, world map and settings.
 *
 * The panel is rebuilt on demand (open / after a purchase) rather than every
 * frame, so it stays cheap while the world keeps rendering behind it.
 */
import { clamp, clamp01, formatCoins, formatWeight, formatDuration, formatClock } from '../core/util.js';
import { FISH, RARITY, fishById } from '../data/fish.js';
import { RODS, LINES, LURES, BAITS, rodById, lineById, lureById, baitById, gearStats, weightToLength } from '../data/gear.js';
import { ACHIEVEMENTS, QUESTS, levelProgress, totalXpForLevel, MAX_LEVEL } from '../systems/progression.js';
import { activeBuffs, availableRecipes } from '../systems/kitchen.js';
import { CONSUMABLES, consumableById, stockLeft, buyConsumable, useConsumable, sellPantryFish, sellAllPantry, dailySpecial, refreshStock } from '../systems/shop.js';
import { BIOME_LABELS } from '../world/terrain.js';

const TABS = [
  { id: 'journal', label: '鱼类图鉴' },
  { id: 'gear', label: '装备与背包' },
  { id: 'survival', label: '生存' },
  { id: 'kitchen', label: '篝火烹饪' },
  { id: 'shop', label: '商店' },
  { id: 'quests', label: '任务成就' },
  { id: 'map', label: '岛屿地图' },
  { id: 'gallery', label: '相册' },
  { id: 'rsi', label: '老渔夫 · RSI' },
  { id: 'settings', label: '设置' },
];

export class Panels {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById('panel');
    this.tab = 'journal';
    this.open_ = false;
    this._mapImage = null;
    this._shopTab = 'rod';
    this._build();
  }

  get isOpen() {
    return this.open_;
  }

  _build() {
    const root = this.root;
    root.innerHTML = '';
    const win = document.createElement('div');
    win.className = 'panel-win';
    const tabs = document.createElement('div');
    tabs.className = 'panel-tabs';
    this._tabButtons = {};
    for (const t of TABS) {
      const b = document.createElement('button');
      b.className = 'panel-tab';
      b.textContent = t.label;
      b.addEventListener('click', () => {
        this.tab = t.id;
        this.game.audio?.play('ui_tab');
        this.refresh();
      });
      tabs.appendChild(b);
      this._tabButtons[t.id] = b;
    }
    const close = document.createElement('button');
    close.className = 'panel-close';
    close.textContent = '✕';
    close.title = '关闭 (Tab)';
    close.addEventListener('click', () => this.close());
    tabs.appendChild(close);
    win.appendChild(tabs);

    this.body = document.createElement('div');
    this.body.className = 'panel-body';
    win.appendChild(this.body);
    root.appendChild(win);
  }

  open(tab) {
    if (tab) this.tab = tab;
    this.open_ = true;
    this.root.classList.remove('hidden');
    this.refresh();
    this.game.audio?.play('ui_open');
    this.game.onPanelOpen?.();
  }

  close() {
    if (!this.open_) return;
    this.open_ = false;
    this.root.classList.add('hidden');
    this.game.audio?.play('ui_close');
    this.game.onPanelClose?.();
  }

  toggle(tab) {
    if (this.open_ && (!tab || tab === this.tab)) this.close();
    else this.open(tab);
  }

  // ------------------------------------------------------------------ render

  refresh() {
    for (const t of TABS) {
      this._tabButtons[t.id].classList.toggle('active', t.id === this.tab);
    }
    const body = this.body;
    body.scrollTop = 0;
    body.innerHTML = '';
    switch (this.tab) {
      case 'journal':
        this._renderJournal(body);
        break;
      case 'gear':
        this._renderGear(body);
        break;
      case 'survival':
        this._renderSurvival(body);
        break;
      case 'kitchen':
        this._renderKitchen(body);
        break;
      case 'shop':
        this._renderShop(body);
        break;
      case 'quests':
        this._renderQuests(body);
        break;
      case 'map':
        this._renderMap(body);
        break;
      case 'gallery':
        this._renderGallery(body);
        break;
      case 'rsi':
        this._renderRSI(body);
        break;
      case 'settings':
        this._renderSettings(body);
        break;
      default:
        break;
    }
  }

  _h(parent, text) {
    const h = document.createElement('h3');
    h.textContent = text;
    parent.appendChild(h);
    return h;
  }

  _statRow(parent, label, value) {
    const d = document.createElement('div');
    d.className = 'stat-row';
    d.innerHTML = `<span>${label}</span><b>${value}</b>`;
    parent.appendChild(d);
    return d;
  }

  _progressLine(parent, label, value, max, suffix = '') {
    const d = document.createElement('div');
    d.className = 'progress-line';
    const pct = max > 0 ? clamp01(value / max) * 100 : 0;
    d.innerHTML = `<span style="width:150px;color:#8fb2c2">${label}</span>
      <div class="pl-track"><i style="width:${pct.toFixed(1)}%"></i></div>
      <b>${value}${suffix}${max ? ` / ${max}` : ''}</b>`;
    parent.appendChild(d);
    return d;
  }

  // ------------------------------------------------------------------ journal

  _renderJournal(body) {
    const p = this.game.profile;
    const known = Object.keys(p.journal).length;
    this._h(body, `图鉴进度 ${known} / ${FISH.length}`);
    this._progressLine(body, '已记录鱼种', known, FISH.length);

    const byRarity = {};
    for (const f of FISH) byRarity[f.rarity] = (byRarity[f.rarity] || 0) + 1;
    const knownByRarity = {};
    for (const id of Object.keys(p.journal)) {
      const f = fishById(id);
      if (f) knownByRarity[f.rarity] = (knownByRarity[f.rarity] || 0) + 1;
    }
    const summary = document.createElement('div');
    summary.className = 'grid cards';
    summary.style.marginTop = '14px';
    for (let r = 5; r >= 1; r--) {
      const info = RARITY[r];
      const total = byRarity[r] || 0;
      const got = knownByRarity[r] || 0;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div class="c-top"><span class="c-ico" style="color:${info.color}">${info.icon}</span>
        <div><div class="c-name" style="color:${info.color}">${info.name} ${info.en}</div>
        <div class="c-latin">${got} / ${total} 已记录</div></div></div>`;
      summary.appendChild(card);
    }
    body.appendChild(summary);

    this._h(body, '全部鱼种');
    const grid = document.createElement('div');
    grid.className = 'grid cards';
    const sorted = [...FISH].sort((a, b) => b.rarity - a.rarity || a.minLevel - b.minLevel || a.id.localeCompare(b.id));
    for (const f of sorted) {
      const entry = p.journal[f.id];
      const info = RARITY[f.rarity];
      const card = document.createElement('div');
      card.className = `card ${entry ? '' : 'locked'}`;
      if (entry) {
        const best = entry.best;
        card.innerHTML = `
          <div class="c-top"><span class="c-ico">${f.icon}</span>
            <div><div class="c-name">${f.name}</div><div class="c-latin">${f.en}</div></div></div>
          <div class="c-meta">
            <span class="rtag" style="color:${info.color}">${info.name}</span>
            捕获 ${entry.count} 次<br>
            最大 ${formatWeight(best)} · ${Math.round(weightToLength(f.id, best))} cm<br>
            水深 ${f.depthM[0]}–${f.depthM[1]} m · Lv.${f.minLevel}+
          </div>
          <div class="c-desc">${f.desc}</div>`;
      } else {
        card.innerHTML = `
          <div class="c-top"><span class="c-ico">❔</span>
            <div><div class="c-name">？？？</div><div class="c-latin">未记录</div></div></div>
          <div class="c-meta"><span class="rtag" style="color:${info.color}">${info.name}</span>
            需要 Lv.${f.minLevel}<br>${f.biomes.map((b) => BIOME_LABELS[b] || b).join(' / ')}</div>
          <div class="c-desc">还没有人见过它。</div>`;
      }
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }

  // ------------------------------------------------------------------ gear

  _renderGear(body) {
    const p = this.game.profile;
    const stats = gearStats(p);
    this._h(body, '当前装备');
    this._statRow(body, '鱼竿', `${stats.rod.icon} ${stats.rod.name}（抛投 ×${stats.rod.cast.toFixed(2)} · 收线 ×${stats.rod.reel.toFixed(2)}）`);
    this._statRow(body, '鱼线', `${stats.line.icon} ${stats.line.name}（强度 ${stats.line.strength} kg）`);
    this._statRow(body, '拟饵', `${stats.lure.icon} ${stats.lure.name}${stats.lure.id === 'none' ? '' : `（稀有度 +${Math.round(stats.lure.rarity * 100)}%）`}`);
    const baitWrap = document.createElement('div');
    baitWrap.className = 'itembar';
    baitWrap.style.marginTop = '10px';
    const noneChip = document.createElement('button');
    noneChip.className = `chip ${!p.baitId ? 'on' : ''}`;
    noneChip.innerHTML = `<span>🚫</span>不用鱼饵`;
    noneChip.addEventListener('click', () => {
      p.baitId = null;
      this.game.audio?.play('ui_click');
      this.refresh();
    });
    baitWrap.appendChild(noneChip);
    for (const b of BAITS) {
      const count = p.bait?.[b.id] || 0;
      if (!count) continue;
      const chip = document.createElement('button');
      chip.className = `chip ${p.baitId === b.id ? 'on' : ''}`;
      chip.innerHTML = `<span>${b.icon}</span>${b.name} <span class="q">×${count}</span>`;
      chip.addEventListener('click', () => {
        p.baitId = b.id;
        this.game.audio?.play('ui_click');
        this.refresh();
      });
      baitWrap.appendChild(chip);
    }
    body.appendChild(baitWrap);

    this._h(body, '已拥有');
    const own = document.createElement('div');
    own.className = 'grid cards';
    const ownedRods = new Set(['bamboo', ...(p.ownedRods || [])]);
    const ownedLines = new Set(['nylon_2', ...(p.ownedLines || [])]);
    const ownedLures = new Set(['none', ...(p.lures || [])]);
    for (const r of RODS) if (ownedRods.has(r.id)) own.appendChild(this._gearCard(r, 'rod', p.rod === r.id));
    for (const l of LINES) if (ownedLines.has(l.id)) own.appendChild(this._gearCard(l, 'line', p.line === l.id));
    for (const l of LURES) if (ownedLures.has(l.id)) own.appendChild(this._gearCard(l, 'lure', p.lure === l.id));
    body.appendChild(own);

    this._h(body, '统计');
    const s = p.stats;
    this._statRow(body, '累计抛竿', `${s.casts || 0} 次`);
    this._statRow(body, '成功上岸', `${s.catches || 0} 条`);
    this._statRow(body, '跑鱼 / 断线', `${s.escapes || 0} / ${s.snapped || 0}`);
    this._statRow(body, '垃圾清理', `${s.junk || 0} 件`);
    this._statRow(body, '最大个体', s.biggestId ? `${fishById(s.biggestId)?.name || '?'} · ${formatWeight(s.biggest || 0)}` : '—');
    this._statRow(body, '总重量', formatWeight(s.totalWeight || 0));
    this._statRow(body, '累计收入', `${formatCoins(s.totalCoins || 0)} 金币`);
    this._statRow(body, '行走距离', `${((s.distance || 0) / 1000).toFixed(2)} km`);
    this._statRow(body, '游泳时间', formatDuration(s.swimTime || 0));
    this._statRow(body, '最深下潜', `${(s.deepest || 0).toFixed(1)} m`);
    this._statRow(body, '游戏时长', formatDuration(s.playtime || 0));
    this._statRow(body, '完美收线', `${s.perfect || 0} 次`);
    this._statRow(body, '连续成功', `${s.streak || 0} 次`);
    this._statRow(body, '游戏内天数', `第 ${Math.floor(this.game.world.sky.dayCount)} 天`);

    this._h(body, '个人纪录');
    const recs = Object.entries(p.records || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!recs.length) {
      const d = document.createElement('div');
      d.className = 'c-desc';
      d.textContent = '还没有纪录，去水边试试吧。';
      body.appendChild(d);
    } else {
      const g = document.createElement('div');
      g.className = 'grid cards';
      for (const [id, w] of recs) {
        const f = fishById(id);
        if (!f) continue;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="c-top"><span class="c-ico">${f.icon}</span>
          <div><div class="c-name">${f.name}</div><div class="c-latin">${formatWeight(w)}</div></div></div>`;
        g.appendChild(card);
      }
      body.appendChild(g);
    }
  }

  _gearCard(item, kind, equipped) {
    const p = this.game.profile;
    const card = document.createElement('div');
    card.className = `card ${equipped ? 'owned' : ''}`;
    const details =
      kind === 'rod'
        ? `抛投 ×${item.cast.toFixed(2)} · 收线 ×${item.reel.toFixed(2)} · 幸运 +${Math.round(item.luck * 100)}%`
        : kind === 'line'
        ? `强度 ${item.strength} kg · 延展 ${Math.round(item.stretch * 100)}%`
        : item.id === 'none'
        ? '不使用拟饵'
        : `稀有度 +${Math.round(item.rarity * 100)}% · 咬钩 ×${item.bite.toFixed(2)}`;
    card.innerHTML = `
      <div class="c-top"><span class="c-ico">${item.icon}</span>
        <div><div class="c-name">${item.name}</div><div class="c-latin">${item.en}</div></div></div>
      <div class="c-meta">${details}</div>
      <div class="c-desc">${item.desc}</div>`;
    const btn = document.createElement('button');
    btn.className = `btn ${equipped ? '' : 'primary'}`;
    btn.style.marginTop = '10px';
    btn.style.width = '100%';
    btn.textContent = equipped ? '已装备' : '装备';
    btn.disabled = equipped;
    btn.addEventListener('click', () => {
      if (kind === 'rod') p.rod = item.id;
      else if (kind === 'line') p.line = item.id;
      else p.lure = item.id;
      // equipping a lure clears the bait and vice versa
      if (kind === 'lure') p.baitId = null;
      this.game.audio?.play('ui_click');
      this.game.fishing.equip({ rod: p.rod, line: p.line, lure: p.lure });
      this.refresh();
    });
    card.appendChild(btn);
    return card;
  }

  // ------------------------------------------------------------------ survival

  _renderSurvival(body) {
    const g = this.game;
    const p = g.profile;
    const sv = g.survival?.snapshot?.() || { hunger: 1, sanity: 1, health: 1, temperature: 36.6, days: 0, status: [] };
    const season = g.world?.sky?.season || null;
    this._h(body, `生存 · 第 ${sv.days} 天${season ? ` · ${season.icon} ${season.label}` : ''}`);

    const meters = [
      { id: 'hunger', label: '饱食', v: sv.hunger, color: '#ff9f45', hint: '随时间与运动消耗；清零后持续掉血（H 吃鱼）' },
      { id: 'sanity', label: '理智', v: sv.sanity, color: '#b98cff', hint: '夜晚、浓雾与风暴中流失；火堆与提灯恢复' },
      { id: 'health', label: '生命', v: sv.health, color: '#ff5c5c', hint: '饥饿、失温与黑暗都会扣血；吃饱穿暖会慢慢回血' },
    ];
    for (const m of meters) {
      const row = document.createElement('div');
      row.style.margin = '8px 0';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
          <span>${m.label}</span><span style="color:${m.color}">${Math.round(m.v * 100)}%</span>
        </div>
        <div class="bar" style="height:9px"><i style="width:${Math.round(m.v * 100)}%;background:${m.color}"></i></div>
        <div class="c-desc" style="font-size:11px;margin-top:3px">${m.hint}</div>`;
      body.appendChild(row);
    }

    this._h(body, '体温');
    const temp = document.createElement('div');
    temp.className = 'c-desc';
    temp.innerHTML = `当前体温 <b style="color:${sv.temperature < 30 ? '#ff6b6b' : sv.temperature < 33 ? '#ff9f45' : '#8ad4ff'}">${sv.temperature.toFixed(1)}°C</b>
      · 靠近篝火升温（半径 9 m）· 夜里与雨雪中会持续下降`;
    body.appendChild(temp);

    const status = document.createElement('div');
    status.className = 'c-desc';
    status.style.marginTop = '8px';
    status.textContent = sv.status.length ? `当前状态：${sv.status.map((s) => `${s.icon} ${s.label}`).join('、')}` : '当前状态：正常';
    body.appendChild(status);

    this._h(body, '生存法则（参考《饥荒》）');
    const rules = [
      ['🍖 饱食', '时间与体力消耗会降低饱食。按 H 吃保鲜网里最小的鱼，篝火烹饪的食物回得更多。'],
      ['❤️ 生命', '饱食清零、体温过低、理智崩溃都会持续扣血；健康时缓慢回复。生命归零即死亡。'],
      ['🌀 理智', '黑暗（夜晚/浓雾/风暴）持续侵蚀理智。火堆与提灯能顶住黑暗；理智过低时视野变暗、幻觉出现，鱼也不咬钩。'],
      ['🌡️ 体温', '环境温度来自季节与时段，雨雪风会加速失温。篝火是最可靠的取暖手段。'],
      ['🔥 篝火', '站在篝火 9 米内：升温、回理智、可以烹饪与睡觉（J）。'],
      ['💀 死亡', '倒下后在篝火边醒来，损失 10% 金币，保鲜网只留 4 条鱼。存活天数会记录在统计里。'],
      ['🍂 季节', '12 天一年、每季 3 天：春回暖、夏炎热、秋转冷、冬落雪。冬天必须依赖火。'],
    ];
    const list = document.createElement('ul');
    list.className = 'tips';
    for (const [k, v] of rules) {
      const li = document.createElement('li');
      li.innerHTML = `<b>${k}</b> — ${v}`;
      list.appendChild(li);
    }
    body.appendChild(list);

    const stats = document.createElement('div');
    stats.className = 'c-desc';
    stats.style.marginTop = '10px';
    stats.textContent = `累计死亡 ${p.stats.deaths || 0} 次 · 最长存活 ${p.stats.bestDays || 0} 天 · 已进食 ${p.survival?.eaten || 0} 次`;
    body.appendChild(stats);
  }

  // ------------------------------------------------------------------ kitchen

  _renderKitchen(body) {
    const g = this.game;
    const p = g.profile;
    const near = g.nearCampfire();
    const active = activeBuffs(p);
    this._h(body, '篝火烹饪');
    const note = document.createElement('div');
    note.className = 'c-desc';
    note.style.marginBottom = '12px';
    note.innerHTML = near
      ? '🔥 你正站在篝火旁，可以做菜了。'
      : '走到湖畔小屋旁的篝火边（地图上小屋东南方向）才能烹饪。<br>也可以随时查看菜谱准备食材。';
    body.appendChild(note);

    if (active.length) {
      this._h(body, '当前状态');
      const wrap = document.createElement('div');
      wrap.className = 'itembar';
      for (const b of active) {
        const chip = document.createElement('div');
        chip.className = 'buff-chip';
        const m = Math.floor(b.remaining / 60);
        const sec = b.remaining % 60;
        chip.innerHTML = `${b.name} <i>${m}:${String(sec).padStart(2, '0')}</i>`;
        wrap.appendChild(chip);
      }
      body.appendChild(wrap);
    }

    this._h(body, '菜谱');
    const grid = document.createElement('div');
    grid.className = 'grid shop';
    for (const entry of availableRecipes(p)) {
      const r = entry.recipe;
      const card = document.createElement('div');
      card.className = `card ${entry.count ? '' : 'locked'}`;
      const mods = Object.entries(r.mods)
        .map(([k, v]) => `${({ bite: '咬钩', luck: '幸运', line: '鱼线强度', reel: '收线' })[k] || k} +${Math.round(v * 100)}%`)
        .join(' · ');
      card.innerHTML = `
        <div class="c-top"><span class="c-ico">${r.icon}</span>
          <div><div class="c-name">${r.name}</div><div class="c-latin">${r.buffName} · ${Math.round(r.duration / 60)} 分钟</div></div></div>
        <div class="c-meta">效果：${mods}<br>需要：稀有度 ≥ ${r.needRarity} 且 ≥ ${r.minWeight} kg（保鲜网内可用 ${entry.count} 条）</div>
        <div class="c-desc">${r.desc}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.style.width = '100%';
      btn.style.marginTop = '8px';
      if (!entry.count) {
        btn.textContent = '缺少食材';
        btn.disabled = true;
      } else if (!near) {
        btn.textContent = '需要靠近篝火';
        btn.disabled = true;
      } else {
        btn.textContent = `烹饪（用 ${entry.best.name} ${entry.best.weight.toFixed(2)} kg）`;
        btn.addEventListener('click', () => g.cookAtFire(r.id));
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }
    body.appendChild(grid);

    this._h(body, `保鲜网（${(p.pantry || []).length} / 12）`);
    if (!p.pantry || !p.pantry.length) {
      const d = document.createElement('div');
      d.className = 'c-desc';
      d.textContent = '还没有渔获。钓上来的鱼会自动放进保鲜网，最多保留 12 条。';
      body.appendChild(d);
    } else {
      const list = document.createElement('div');
      list.className = 'grid cards';
      const sorted = [...p.pantry].sort((a, b) => a.weight - b.weight);
      for (const e of sorted) {
        const card = document.createElement('div');
        card.className = 'card';
        const f = fishById(e.id);
        card.innerHTML = `<div class="c-top"><span class="c-ico">${f ? f.icon : '🐟'}</span>
          <div><div class="c-name">${e.name}</div><div class="c-latin">${formatWeight(e.weight)}</div></div></div>`;
        list.appendChild(card);
      }
      body.appendChild(list);
    }
  }

  // ------------------------------------------------------------------ shop

  _renderShop(body) {
    const p = this.game.profile;
    const bar = document.createElement('div');
    bar.className = 'itembar';
    const cats = [
      { id: 'rod', label: '鱼竿' },
      { id: 'line', label: '鱼线' },
      { id: 'lure', label: '拟饵' },
      { id: 'bait', label: '鱼饵' },
      { id: 'supply', label: '补给' },
      { id: 'market', label: '鱼市' },
    ];
    for (const c of cats) {
      const chip = document.createElement('button');
      chip.className = `chip ${this._shopTab === c.id ? 'on' : ''}`;
      chip.textContent = c.label;
      chip.addEventListener('click', () => {
        this._shopTab = c.id;
        this.game.audio?.play('ui_tab');
        this.refresh();
      });
      bar.appendChild(chip);
    }
    const coins = document.createElement('div');
    coins.style.marginLeft = 'auto';
    coins.style.color = '#ffd166';
    coins.style.fontSize = '14px';
    coins.textContent = `🪙 ${formatCoins(p.coins)}`;
    bar.appendChild(coins);
    body.appendChild(bar);

    // v3.5.0: supplies and the fish market have their own layouts
    if (this._shopTab === 'supply') {
      this._renderSupplies(body);
      return;
    }
    if (this._shopTab === 'market') {
      this._renderMarket(body);
      return;
    }

    const table =
      this._shopTab === 'rod' ? RODS : this._shopTab === 'line' ? LINES : this._shopTab === 'lure' ? LURES : BAITS;
    const grid = document.createElement('div');
    grid.className = 'grid shop';
    for (const item of table) {
      const isBait = this._shopTab === 'bait';
      const owned =
        this._shopTab === 'rod'
          ? item.id === 'bamboo' || (p.ownedRods || []).includes(item.id)
          : this._shopTab === 'line'
          ? item.id === 'nylon_2' || (p.ownedLines || []).includes(item.id)
          : this._shopTab === 'lure'
          ? item.id === 'none' || (p.lures || []).includes(item.id)
          : false;
      const price = isBait ? item.price : item.price;
      const affordable = p.coins >= price && p.level >= item.minLevel;
      const card = document.createElement('div');
      card.className = `card ${owned ? 'owned' : ''} ${!affordable && !owned ? 'locked' : ''}`;
      const details =
        this._shopTab === 'rod'
          ? `抛投 ×${item.cast.toFixed(2)} · 收线 ×${item.reel.toFixed(2)} · 幸运 +${Math.round(item.luck * 100)}%`
          : this._shopTab === 'line'
          ? `强度 ${item.strength} kg · 延展 ${Math.round(item.stretch * 100)}%`
          : this._shopTab === 'lure'
          ? `稀有度 +${Math.round(item.rarity * 100)}% · 咬钩 ×${item.bite.toFixed(2)}`
          : `咬钩 ×${item.bite.toFixed(2)} · 垃圾率 ${Math.round((item.junk || 0) * 100)}% · ${item.pack} 个/包`;
      const stock = isBait ? `（拥有 ${p.bait?.[item.id] || 0}）` : owned ? '已拥有' : '';
      card.innerHTML = `
        <div class="c-top"><span class="c-ico">${item.icon}</span>
          <div><div class="c-name">${item.name}</div><div class="c-latin">${item.en} · Lv.${item.minLevel}</div></div></div>
        <div class="c-meta">${details}</div>
        <div class="c-desc">${item.desc}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
          <span class="c-price">🪙 ${formatCoins(price)} ${stock}</span>
        </div>`;
      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.style.width = '100%';
      btn.style.marginTop = '8px';
      if (owned) {
        btn.textContent = '已拥有';
        btn.disabled = true;
      } else if (p.level < item.minLevel) {
        btn.textContent = `需要 Lv.${item.minLevel}`;
        btn.disabled = true;
      } else if (p.coins < price) {
        btn.textContent = '金币不足';
        btn.disabled = true;
      } else {
        btn.textContent = isBait ? `购买 ${item.pack} 个` : '购买';
        btn.addEventListener('click', () => this._buy(item, this._shopTab));
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }

  _renderSupplies(body) {
    const p = this.game.profile;
    const w = this.game.world;
    refreshStock(p, w);
    const note = document.createElement('div');
    note.className = 'c-desc';
    note.style.margin = '4px 0 12px';
    note.innerHTML = `补给每日补货一次。买下后放在背包里，随时点「使用」生效。`;
    body.appendChild(note);

    const grid = document.createElement('div');
    grid.className = 'grid shop';
    for (const item of CONSUMABLES) {
      const left = stockLeft(p, w, item.id);
      const owned = p.items?.[item.id] || 0;
      const locked = p.level < item.minLevel;
      const card = document.createElement('div');
      card.className = `card ${left <= 0 ? 'locked' : ''} ${locked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="card-icon">${item.icon}</div>
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-stats">💰 ${formatCoins(item.price)} · 今日剩 ${left}</div>
        <div class="card-meta">${owned > 0 ? `背包 ${owned} 个` : '未持有'}${locked ? ` · 需 Lv.${item.minLevel}` : ''}</div>`;
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '6px';
      const buy = document.createElement('button');
      buy.className = 'btn';
      buy.style.flex = '1';
      if (locked) {
        buy.textContent = `需 Lv.${item.minLevel}`;
        buy.disabled = true;
      } else if (left <= 0) {
        buy.textContent = '今日售罄';
        buy.disabled = true;
      } else if (p.coins < item.price) {
        buy.textContent = '金币不足';
        buy.disabled = true;
      } else {
        buy.textContent = '购买';
        buy.addEventListener('click', () => {
          const r = buyConsumable(this.game, item.id, 1);
          this.game.audio?.play(r.ok ? 'ui_click' : 'ui_error');
          if (r.ok) this.game.hud.notify(`买下 ${item.name}（剩 ${r.left}）`, 'gold');
          this.refresh();
        });
      }
      const use = document.createElement('button');
      use.className = 'btn';
      use.style.flex = '1';
      use.textContent = '使用';
      use.disabled = owned <= 0;
      use.addEventListener('click', () => {
        const r = useConsumable(this.game, item.id);
        this.game.audio?.play(r.ok ? 'ui_click' : 'ui_error');
        this.refresh();
      });
      row.appendChild(buy);
      row.appendChild(use);
      card.appendChild(row);
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }

  _renderMarket(body) {
    const p = this.game.profile;
    const w = this.game.world;
    const sea = w?.priceMultiplier ?? 1;
    const special = dailySpecial(this.game);

    const head = document.createElement('div');
    head.className = 'c-desc';
    head.style.margin = '4px 0 10px';
    head.innerHTML = `今日海况 <b>${w?.seaLabel?.label || '—'}</b> · 收购价 <b style="color:#ffd166">×${sea}</b>
      ${special ? ` · 今日热销 <b>${special.icon} ${special.name}</b>（+${Math.round((special.bonus || 0) * 100)}%）` : ''}
      <br>保鲜网里的鱼可以在这里一次性卖掉；留在网里等风浪大一点再卖更值钱。`;
    body.appendChild(head);

    if (!p.pantry || !p.pantry.length) {
      const empty = document.createElement('div');
      empty.className = 'c-desc';
      empty.textContent = '保鲜网是空的。钓到鱼后会自动进网（最多 12 条）。';
      body.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'grid shop';
    p.pantry.forEach((entry, i) => {
      const fish = this.game.fishById(entry.id);
      if (!fish) return;
      const bid = Math.max(1, Math.round(this.game.fishValue(fish, entry.weight) * 0.55 * sea));
      const bonus = special && special.id === entry.id ? Math.round(bid * (special.bonus || 0)) : 0;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-icon">${fish.icon}</div>
        <div class="card-name">${entry.name}</div>
        <div class="card-desc">${formatWeight(entry.weight)} · ${RARITY[fish.rarity]?.name || ''}</div>
        <div class="card-stats">💰 ${formatCoins(bid + bonus)}${bonus ? ` <span style="color:#ffd166">(热销 +${bonus})</span>` : ''}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = '卖出';
      btn.addEventListener('click', () => {
        const idx = p.pantry.indexOf(entry);
        if (idx < 0) return;
        const r = sellPantryFish(this.game, idx);
        if (r.ok) {
          // daily-special bonus on top
          if (bonus) {
            p.coins += bonus;
            p.stats.marketCoins = (p.stats.marketCoins || 0) + bonus;
          }
          this.game.audio?.play('coin');
          this.game.hud.notify(`卖出 ${r.name} · +${formatCoins(r.price + bonus)} 金币`, 'gold');
        }
        this.refresh();
      });
      card.appendChild(btn);
      list.appendChild(card);
    });
    body.appendChild(list);

    const row = document.createElement('div');
    row.className = 'pause-btns';
    const all = document.createElement('button');
    all.className = 'btn';
    all.textContent = '全部卖出';
    all.addEventListener('click', () => {
      const snapshot = (p.pantry || []).map((e) => ({ id: e.id, weight: e.weight }));
      const r = sellAllPantry(this.game);
      if (!r.ok) return;
      let bonus = 0;
      if (special) {
        for (const e of snapshot) {
          if (e.id === special.id) {
            const fish = this.game.fishById(e.id);
            if (fish) bonus += Math.round(this.game.fishValue(fish, e.weight) * 0.55 * sea * (special.bonus || 0));
          }
        }
      }
      if (bonus) p.coins += bonus;
      this.game.audio?.play('coin');
      this.game.hud.notify(`卖出 ${r.count} 条鱼 · +${formatCoins(r.coins + bonus)} 金币`, 'gold');
      this.refresh();
    });
    row.appendChild(all);
    body.appendChild(row);
  }

  _buy(item, kind) {
    const p = this.game.profile;
    if (p.coins < item.price) return;
    p.coins -= item.price;
    if (kind === 'rod') {
      p.ownedRods = p.ownedRods || [];
      if (!p.ownedRods.includes(item.id)) p.ownedRods.push(item.id);
      p.rod = item.id;
    } else if (kind === 'line') {
      p.ownedLines = p.ownedLines || [];
      if (!p.ownedLines.includes(item.id)) p.ownedLines.push(item.id);
      p.line = item.id;
    } else if (kind === 'lure') {
      p.lures = p.lures || [];
      if (!p.lures.includes(item.id)) p.lures.push(item.id);
      p.lure = item.id;
      p.baitId = null;
    } else {
      p.bait = p.bait || {};
      p.bait[item.id] = (p.bait[item.id] || 0) + item.pack;
      if (!p.baitId) p.baitId = item.id;
    }
    this.game.audio?.play('coin');
    this.game.hud.notify(`购买了 ${item.name}`, 'gold');
    this.game.fishing.equip({ rod: p.rod, line: p.line, lure: p.lure });
    this.game.checkAchievements?.();
    this.refresh();
  }

  // ------------------------------------------------------------------ quests

  _renderQuests(body) {
    const p = this.game.profile;
    this._h(body, '任务');
    const active = p.quests?.active || [];
    const done = p.quests?.done || [];
    for (const q of QUESTS) {
      const rec = active.find((a) => a.id === q.id);
      const isDone = done.some((d) => d.id === q.id);
      const card = document.createElement('div');
      card.className = `card ${isDone ? 'owned' : ''}`;
      const prog = isDone ? q.target : rec?.progress || 0;
      card.innerHTML = `
        <div class="c-top"><span class="c-ico">${isDone ? '✅' : '📌'}</span>
          <div><div class="c-name">${q.name}</div><div class="c-latin">${q.desc}</div></div></div>
        <div class="progress-line"><span style="width:70px;color:#8fb2c2">进度</span>
          <div class="pl-track"><i style="width:${(clamp01(prog / q.target) * 100).toFixed(0)}%"></i></div>
          <b>${prog} / ${q.target}</b></div>
        <div class="c-meta">奖励：🪙 ${q.reward.coins} · XP ${q.reward.xp}${isDone ? ' · 已完成' : ''}</div>`;
      body.appendChild(card);
    }

    this._h(body, `成就（${Object.keys(p.achievements || {}).length} / ${ACHIEVEMENTS.length}）`);
    const grid = document.createElement('div');
    grid.className = 'grid cards';
    for (const a of ACHIEVEMENTS) {
      const got = !!p.achievements?.[a.id];
      const card = document.createElement('div');
      card.className = `card ${got ? 'owned' : 'locked'}`;
      card.innerHTML = `<div class="c-top"><span class="c-ico">${got ? a.icon : '🔒'}</span>
        <div><div class="c-name">${a.name}</div><div class="c-latin">${a.desc}</div></div></div>
        ${a.reward ? `<div class="c-meta">奖励 🪙 ${a.reward}</div>` : ''}`;
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }

  // ------------------------------------------------------------------ map

  _renderMap(body) {
    const world = this.game.world;
    const p = this.game.profile;
    if (!this._mapImage) {
      const img = world.terrain.bakeMapImage(512);
      const cv = document.createElement('canvas');
      cv.width = img.width;
      cv.height = img.height;
      const cx = cv.getContext('2d');
      const id = new ImageData(img.data, img.width, img.height);
      cx.putImageData(id, 0, 0);
      this._mapImage = cv;
    }
    const wrap = document.createElement('div');
    wrap.className = 'mapwrap';
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 1024;
    wrap.appendChild(cv);
    body.appendChild(wrap);

    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this._mapImage, 0, 0, 1024, 1024);

    const size = world.terrain.size;
    const half = size / 2;
    const toPx = (x) => ((x + half) / size) * 1024;
    const toPy = (z) => ((z + half) / size) * 1024;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const k = (i / 6) * 1024;
      ctx.beginPath();
      ctx.moveTo(k, 0);
      ctx.lineTo(k, 1024);
      ctx.moveTo(0, k);
      ctx.lineTo(1024, k);
      ctx.stroke();
    }

    // spots
    for (const s of world.spots) {
      const px = toPx(s.anchorX);
      const py = toPy(s.anchorZ);
      const discovered = !!p.spots?.[s.id] || s.discovered;
      const locked = s.minLevel > p.level;
      ctx.beginPath();
      ctx.arc(px, py, s.radius * (1024 / size), 0, Math.PI * 2);
      ctx.strokeStyle = discovered ? 'rgba(127,216,255,0.35)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fillStyle = discovered ? (locked ? '#ff6b6b' : '#4fd1c5') : 'rgba(200,220,235,0.35)';
      ctx.fill();
      ctx.strokeStyle = '#02181a';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (discovered) {
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.lineWidth = 4;
        ctx.strokeText(s.name, px + 14, py + 7);
        ctx.fillText(s.name, px + 14, py + 7);
      }
    }

    // player
    const px = toPx(this.game.player.position.x);
    const py = toPy(this.game.player.position.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-this.game.player.yaw);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(11, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-11, 12);
    ctx.closePath();
    ctx.fillStyle = '#ffd166';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // waypoint
    if (this.game.waypoint) {
      const wx = toPx(this.game.waypoint.x);
      const wy = toPy(this.game.waypoint.z);
      ctx.beginPath();
      ctx.arc(wx, wy, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff7a45';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // click to set a waypoint
    cv.style.cursor = 'crosshair';
    cv.addEventListener('click', (e) => {
      const r = cv.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * size - half;
      const my = ((e.clientY - r.top) / r.height) * size - half;
      this.game.waypoint = { x: mx, z: my };
      this.game.hud.notify('已设置路径点（地图上的橙色圆环）', '');
      this.refresh();
    });

    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `<span><i style="background:#4fd1c5"></i>已发现钓点</span>
      <span><i style="background:#ff6b6b"></i>等级不足</span>
      <span><i style="background:rgba(200,220,235,0.35)"></i>未探索</span>
      <span><i style="background:#ffd166"></i>你的位置</span>
      <span>点击地图设置路径点</span>`;
    body.appendChild(legend);

    this._h(body, '钓点详情');
    const list = document.createElement('div');
    list.className = 'spot-list';
    for (const s of world.spots) {
      const discovered = !!p.spots?.[s.id] || s.discovered;
      const locked = s.minLevel > p.level;
      const item = document.createElement('div');
      item.className = `spot-item ${discovered ? '' : 'locked'}`;
      const best = discovered && p.spots?.[s.id]?.bestWeight ? ` · 最大 ${formatWeight(p.spots[s.id].bestWeight)}` : '';
      item.innerHTML = `<b>${discovered ? s.name : '未探索水域'} ${locked ? `🔒 Lv.${s.minLevel}` : ''}</b>
        <span>${discovered ? `${s.short} · 水深 ${s.depth} m · ${BIOME_LABELS[s.biome] || s.biome}${s.waterOnly ? ' · 需游泳前往' : ''}${s.boat && !s.waterOnly ? ' · 建议船钓' : ''}${best}` : `需要 Lv.${s.minLevel} 探索`}</span>`;
      if (discovered) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          this.game.waypoint = { x: s.x, z: s.z };
          this.game.hud.notify(`路径点：${s.name}`, '');
          this.refresh();
        });
      }
      list.appendChild(item);
    }
    body.appendChild(list);
  }

  // ------------------------------------------------------------------ gallery

  /**
   * RSI panel (v6.0.0): the rival's self-evolution, modelled on Dream-RSI's
   * replay-dream loop and Harmony Harness's Pareto front + gated mutations.
   */
  _renderRSI(body) {
    const rsi = this.game.rsi;
    const s = rsi ? rsi.snapshot() : null;
    this._h(body, '老渔夫 · 递归自我改进');
    const intro = document.createElement('div');
    intro.className = 'c-desc';
    intro.style.marginBottom = '12px';
    intro.innerHTML =
      '老渔夫每天收竿后会在<b>记忆中的渔获</b>（回放池）里「做梦」：离线评估一批新的策略变体，' +
      '用多目标分解（MOEA/D + Tchebycheff）在<b>收益</b>与<b>鱼种多样性</b>之间维持一条帕累托前沿，' +
      '并通过<b>留出验证</b>否决投机取巧的变体。被采纳的策略第二天就会用来和你抢鱼。';
    body.appendChild(intro);
    if (!s || !s.ready) {
      const w = document.createElement('div');
      w.className = 'c-desc';
      w.textContent = '演化尚未开始：先出海钓一次鱼。';
      body.appendChild(w);
      return;
    }
    const stats = [
      ['代数', s.gen],
      ['回放样本', s.replay],
      ['帕累托前沿', `${s.front.length} 个点`],
      ['参赛节奏', s.pace],
    ];
    const grid = document.createElement('div');
    grid.className = 'rsi-stats';
    for (const [k, v] of stats) {
      const cell = document.createElement('div');
      cell.className = 'rsi-cell';
      cell.innerHTML = `<b>${v}</b><span>${k}</span>`;
      grid.appendChild(cell);
    }
    body.appendChild(grid);

    // ---- Pareto front scatter (value vs variety)
    const front = s.front || [];
    if (front.length) {
      this._h(body, '帕累托前沿 · 收益 × 鱼种多样性');
      const box = document.createElement('div');
      box.className = 'rsi-front';
      const maxV = Math.max(...front.map((p) => p.value), 1);
      const maxVar = Math.max(...front.map((p) => p.variety), 1);
      for (const p of front) {
        const dot = document.createElement('i');
        dot.style.left = `${(p.variety / maxVar) * 92 + 4}%`;
        dot.style.bottom = `${(p.value / maxV) * 88 + 6}%`;
        dot.title = `收益 ${p.value} · 多样性 ${p.variety}`;
        box.appendChild(dot);
      }
      const ax = document.createElement('div');
      ax.className = 'rsi-axis';
      ax.innerHTML = `<span>收益 ↑</span><span>多样性 →</span>`;
      box.appendChild(ax);
      body.appendChild(box);
    }

    // ---- current policy
    if (s.deployed) {
      const d = s.deployed;
      this._h(body, '当前部署的策略');
      const line = document.createElement('div');
      line.className = 'c-desc';
      line.innerHTML =
        `技巧 <b>${d.skill}</b> · 耐心 <b>${d.patience}</b> · 装备档位 <b>${d.gearTier}</b> · 深水偏好 <b>${d.depthBias}</b><br>` +
        `出没时段：清晨 ${d.hours.dawn} / 白天 ${d.hours.day} / 黄昏 ${d.hours.dusk} / 夜里 ${d.hours.night}<br>` +
        `偏爱钓点：${d.topSpots.join(' · ')}`;
      body.appendChild(line);
    }

    // ---- recent generations
    if (s.history?.length) {
      this._h(body, '最近世代');
      const list = document.createElement('div');
      list.className = 'rsi-log';
      for (const h of s.history) {
        const row = document.createElement('div');
        row.className = 'rsi-row';
        row.innerHTML =
          `<b>第 ${h.gen} 代</b> 采纳 ${h.accepted} / 否决 ${h.rejected}` +
          ` · 收益 ${h.before.value} → <b>${h.after.value}</b>` +
          `<em>${(h.log || []).map((l) => l.reason).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</em>`;
        list.appendChild(row);
      }
      body.appendChild(list);
    }

    // ---- the rival's own results
    if (s.days?.length) {
      this._h(body, '老渔夫最近的渔获');
      const list = document.createElement('div');
      list.className = 'rsi-log';
      for (const d of s.days) {
        const row = document.createElement('div');
        row.className = 'rsi-row';
        row.innerHTML = `日收益 <b>${d.value}</b> 金币 · 均稀有度 ${d.rarity} · ${d.count} 条`;
        list.appendChild(row);
      }
      body.appendChild(list);
    }
  }

  _renderGallery(body) {
    const p = this.game.profile;
    const photos = p.photos || [];
    const g = this.game;
    this._h(body, `相册（${photos.length} / 10）`);
    const note = document.createElement('div');
    note.className = 'c-desc';
    note.style.marginBottom = '12px';
    note.innerHTML = `按 <kbd>P</kbd> 进入拍照模式：<kbd>WASD</kbd> 移动 · <kbd>Space</kbd>/<kbd>Ctrl</kbd> 升降 · <kbd>1</kbd>–<kbd>5</kbd> 切换滤镜 · <kbd>F</kbd> 拍照 · <kbd>H</kbd> 隐藏界面 · <kbd>P</kbd> 退出。`;
    body.appendChild(note);

    if (!photos.length) {
      const d = document.createElement('div');
      d.className = 'c-desc';
      d.textContent = '还没有照片。';
      body.appendChild(d);
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid cards';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
    for (const shot of photos) {
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      img.src = shot.url;
      img.style.width = '100%';
      img.style.borderRadius = '8px';
      img.style.display = 'block';
      img.alt = shot.spot || 'photo';
      card.appendChild(img);
      const meta = document.createElement('div');
      meta.className = 'c-meta';
      meta.textContent = `${shot.filter} · ${shot.spot || ''} · ${shot.time || ''} · ${shot.weather || ''}`;
      card.appendChild(meta);
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '6px';
      row.style.marginTop = '8px';
      const dl = document.createElement('a');
      dl.className = 'btn';
      dl.textContent = '下载';
      dl.href = shot.url;
      dl.download = `still-waters-${shot.at}.jpg`;
      dl.style.flex = '1';
      dl.style.textAlign = 'center';
      dl.style.textDecoration = 'none';
      const del = document.createElement('button');
      del.className = 'btn danger';
      del.textContent = '删除';
      del.addEventListener('click', () => {
        const i = p.photos.indexOf(shot);
        if (i >= 0) p.photos.splice(i, 1);
        this.refresh();
      });
      row.appendChild(dl);
      row.appendChild(del);
      card.appendChild(row);
      grid.appendChild(card);
    }
    body.appendChild(grid);

    const row = document.createElement('div');
    row.className = 'pause-btns';
    const clear = document.createElement('button');
    clear.className = 'btn danger';
    clear.textContent = '清空相册';
    clear.addEventListener('click', () => {
      p.photos = [];
      this.refresh();
    });
    row.appendChild(clear);
    body.appendChild(row);
  }

  // ------------------------------------------------------------------ settings

  _renderSettings(body) {
    const g = this.game;
    const p = g.profile;
    const s = p.settings;

    this._h(body, '画面');
    this._select(body, '画质预设', s.quality, [
      { value: 'low', label: '流畅（省电）' },
      { value: 'medium', label: '均衡' },
      { value: 'high', label: '精细' },
    ], (v) => {
      s.quality = v;
      g.setQuality(v);
    });
    this._range(body, '渲染分辨率', s.renderScale, 0.6, 1.4, 0.05, (v) => {
      s.renderScale = v;
      g.engine.setRenderScale(v);
    }, (v) => `×${v.toFixed(2)}`);
    this._range(body, '视野 FOV', s.fov, 60, 100, 1, (v) => {
      s.fov = v;
      g.engine.setFov(v);
    }, (v) => `${v}°`);
    this._range(body, '植被密度', s.treeDensity, 0.3, 1.6, 0.1, (v) => {
      s.treeDensity = v;
      g.world.setTreeDensity(v);
    }, (v) => `×${v.toFixed(1)}`);
    this._toggle(body, '阴影', s.shadows, (v) => {
      s.shadows = v;
      g.setQuality(s.quality);
    });
    this._toggle(body, '性能信息 (F1)', s.showPerf, (v) => {
      s.showPerf = v;
      g.hud.togglePerf(v);
    });
    this._toggle(body, '显示小地图', s.showMinimap, (v) => {
      s.showMinimap = v;
      g.hud.setMinimapVisible(v);
    });
    this._toggle(body, '鱼群与飞鸟', s.wildlife, (v) => {
      s.wildlife = v;
      g.world.setWildlife(v);
    });

    // ---- feel / feedback (v2.0.0)
    this._h(body, '手感反馈');
    this._toggle(body, '手柄震动', s.haptics !== false, (v) => {
      s.haptics = v;
      g.haptics?.setEnabled(v);
    });
    this._range(body, '镜头震动强度', s.shake ?? 1, 0, 1.5, 0.05, (v) => {
      s.shake = v;
      g.haptics?.setIntensity(v);
      if (g.player) {
        g.player.shakeScale = Math.max(0, v);
        g.player.shakeEnabled = v > 0.01;
      }
    }, (v) => `${Math.round(v * 100)}%`);
    this._toggle(body, '卸力数值提示', s.dragIndicator !== false, (v) => {
      s.dragIndicator = v;
    });

    this._h(body, '操作');
    this._range(body, '鼠标灵敏度', s.sensitivity, 0.2, 3, 0.05, (v) => {
      s.sensitivity = v;
      g.input.sensitivity = v;
      g.player.sensitivity = v;
    }, (v) => v.toFixed(2));
    this._toggle(body, '反转 Y 轴', s.invertY, (v) => {
      s.invertY = v;
      g.input.invertY = v;
      g.player.invertY = v;
    });
    this._select(body, '默认视角', s.viewMode, [
      { value: 'first', label: '第一人称' },
      { value: 'third', label: '第三人称' },
    ], (v) => {
      s.viewMode = v;
      g.player.setViewMode(v);
    });

    this._h(body, '声音');
    this._range(body, '主音量', s.volumeMaster, 0, 1, 0.02, (v) => {
      s.volumeMaster = v;
      g.audio?.setVolume('master', v);
    }, (v) => `${Math.round(v * 100)}%`);
    this._range(body, '音效', s.volumeSfx, 0, 1, 0.02, (v) => {
      s.volumeSfx = v;
      g.audio?.setVolume('sfx', v);
    }, (v) => `${Math.round(v * 100)}%`);
    this._range(body, '环境音', s.volumeAmbience, 0, 1, 0.02, (v) => {
      s.volumeAmbience = v;
      g.audio?.setVolume('ambience', v);
    }, (v) => `${Math.round(v * 100)}%`);

    this._h(body, '世界');
    this._range(body, '一天时长（分钟）', s.dayLengthMin, 6, 60, 1, (v) => {
      s.dayLengthMin = v;
      g.world.sky.dayLengthMinutes = v;
    }, (v) => `${v} 分钟`);
    this._toggle(body, '自动存档', s.autoSave, (v) => {
      s.autoSave = v;
    });
    const row = document.createElement('div');
    row.className = 'pause-btns';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn';
    saveBtn.textContent = '立即存档';
    saveBtn.addEventListener('click', () => {
      g.saveGame(true);
      g.hud.notify('已保存', 'good');
    });
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn';
    menuBtn.textContent = '返回主菜单';
    menuBtn.addEventListener('click', () => g.quitToMenu());
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn danger';
    resetBtn.textContent = '清空存档并重新开始';
    resetBtn.addEventListener('click', () => {
      if (confirm('确定要删除存档并重新开始吗？此操作不可撤销。')) g.resetSave();
    });
    row.appendChild(saveBtn);
    row.appendChild(menuBtn);
    row.appendChild(resetBtn);
    body.appendChild(row);

    this._h(body, '关于');
    const about = document.createElement('div');
    about.className = 'c-desc';
    about.style.lineHeight = '1.9';
    about.innerHTML = `静水之滨 · Still Waters — 3D 开放世界钓鱼<br>
      版本 ${g.version} · 种子 ${g.world.terrain.seed}<br>
      地形 ${g.world.terrain.stats.buildMs} ms · 植被 ${g.world.vegetation.stats.instances} 株 / ${g.world.vegetation.stats.parts} 批次<br>
      钓点 ${g.world.spots.length} 处 · 鱼种 ${FISH.length} 种<br>
      键盘：WASD 移动 · Shift 奔跑 · Space 跳跃/上浮 · Ctrl 下潜 · V 视角 · F 抛竿 · 左键 收线 · 右键 收竿 · Tab 面板 · M 地图 · P 拍照 · Esc 暂停`;
    body.appendChild(about);
  }

  _select(parent, label, value, options, onChange) {
    const row = document.createElement('div');
    row.className = 'switch';
    const l = document.createElement('label');
    l.textContent = label;
    const sel = document.createElement('select');
    for (const o of options) {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === value) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      onChange(sel.value);
      this.game.audio?.play('ui_click');
    });
    row.appendChild(l);
    row.appendChild(sel);
    parent.appendChild(row);
  }

  _range(parent, label, value, min, max, step, onChange, fmt) {
    const row = document.createElement('div');
    row.className = 'switch';
    const l = document.createElement('label');
    l.textContent = label;
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '10px';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    const out = document.createElement('b');
    out.style.width = '70px';
    out.style.textAlign = 'right';
    out.style.fontSize = '12px';
    out.textContent = fmt ? fmt(value) : String(value);
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      out.textContent = fmt ? fmt(v) : String(v);
      onChange(v);
    });
    wrap.appendChild(input);
    wrap.appendChild(out);
    row.appendChild(l);
    row.appendChild(wrap);
    parent.appendChild(row);
  }

  _toggle(parent, label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'switch';
    const l = document.createElement('label');
    l.textContent = label;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.addEventListener('change', () => {
      onChange(input.checked);
      this.game.audio?.play('ui_click');
    });
    row.appendChild(l);
    row.appendChild(input);
    parent.appendChild(row);
  }
}
