// DOM UI: screen stack, HUD, prompts, toasts, results.

import { INGREDIENTS, RECIPES, LEVELS, recipeParts, recipeForToppings } from '../core/data.js';
import { itemName, itemStateTag } from '../core/kitchen.js';
import { getBindings } from '../core/input.js';
import { isTouchDevice } from '../core/touch.js';
import { summarize, getSessions, importSessions, updateSession } from '../core/playtest.js';
import { parseCSV, analyzePlaytests } from '../core/playtest-analysis.js';
import * as rsi from '../core/rsi.js';
import * as save from '../core/save.js';

const SCREENS = ['menu', 'modes', 'settings', 'help', 'data', 'album', 'pause', 'results'];

const fmtTime = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function itemIcon(item) {
  if (!item) return '✋';
  if (item.type === 'plate') {
    const recipe = recipeForToppings(item.contents);
    if (recipe) return recipe.emoji;
    return item.contents.length ? '🍽️' : '🍽️';
  }
  if (item.state === 'burnt') return '♨️';
  const def = INGREDIENTS[item.ingredient];
  return def?.emoji ?? '❓';
}

export class UI {
  constructor(app) {
    this.app = app;
    this.settings = save.getSettings();
    this.screen = 'menu';
    this.hudVisible = false;
    this.ticketNodes = new Map();
    this.lastScore = -1;
    this.lastTimer = '';
    this.lastCombo = -1;
    this.lastCarryUid = null;
    this.lastPrompt = null;
    this.lastHudState = null;
    this.tutorialSteps = [];
    this.tutorialDone = new Set();
    this.modeSelection = 'fp';
    this.levelSelection = 1;
    this.playerCount = 1;
    if (isTouchDevice()) {
      this.modeSelection = 'arcade';
    }
    this.hudMode = 'fp';
    this.inputDevice = 'keyboard';
    this.capture = null;
    this.rsiVariant = 0;
    this.rsiRecommendation = null;
    this.album = null;

    this.refs = {
      hud: document.getElementById('hud'),
      hudMode: document.getElementById('hud-mode'),
      hudLevel: document.getElementById('hud-level'),
      hudTimer: document.getElementById('hud-timer'),
      hudScore: document.getElementById('hud-score'),
      hudCombo: document.getElementById('hud-combo'),
      tickets: document.getElementById('tickets'),
      carry: document.getElementById('hud-carry'),
      carryIcon: document.getElementById('carry-icon'),
      carryName: document.getElementById('carry-name'),
      prompt: document.getElementById('prompt'),
      promptKey: document.getElementById('prompt-key'),
      promptTitle: document.getElementById('prompt-title'),
      promptHint: document.getElementById('prompt-hint'),
      promptProgress: document.getElementById('prompt-progress'),
      promptProgressBar: document.querySelector('#prompt-progress i'),
      crosshair: document.getElementById('crosshair'),
      toasts: document.getElementById('toasts'),
      popups: document.getElementById('popups'),
      tutorial: document.getElementById('tutorial'),
      tutorialSteps: document.getElementById('tutorial-steps'),
      hudHint: document.getElementById('hud-hint'),
      modeDesc: document.getElementById('mode-desc'),
      shiftList: document.getElementById('shift-list'),
      playersToggle: document.getElementById('players-toggle'),
      totalStars: document.getElementById('total-stars'),
      helpRecipes: document.getElementById('help-recipes'),
      boot: document.getElementById('boot-overlay'),
      levelIntro: document.getElementById('level-intro'),
      liKicker: document.getElementById('li-kicker'),
      liTitle: document.getElementById('li-title'),
      liSub: document.getElementById('li-sub'),
      liTip: document.getElementById('li-tip'),
      dataSummary: document.getElementById('data-summary'),
      dataCount: document.getElementById('data-count'),
      dataTableBody: document.getElementById('data-table-body'),
      dataHuman: document.getElementById('data-human'),
      ptParticipant: document.getElementById('pt-participant'),
      ptSkill: document.getElementById('pt-skill'),
      ptFirst: document.getElementById('pt-first'),
      ptImport: document.getElementById('pt-import'),
      dataRecoBody: document.getElementById('data-reco-body'),
      dataStatus: document.getElementById('data-status'),
      resultsSurvey: document.getElementById('results-survey'),
      surveyDifficulty: document.getElementById('survey-difficulty'),
      surveyReplay: document.getElementById('survey-replay'),
      surveyStatus: document.getElementById('survey-status'),
      rsiCity: document.getElementById('rsi-city'),
      rsiWeather: document.getElementById('rsi-weather'),
      rsiPrefs: document.getElementById('rsi-prefs'),
      rsiRecs: document.getElementById('rsi-recs'),
      rsiVersion: document.getElementById('rsi-version'),
      rsiNote: document.getElementById('rsi-note'),
      albumTitle: document.getElementById('album-title'),
      albumSubtitle: document.getElementById('album-subtitle'),
      albumYear: document.getElementById('album-year'),
      albumStats: document.getElementById('album-stats'),
      albumMemoir: document.getElementById('album-memoir'),
      albumDishes: document.getElementById('album-dishes'),
      albumMonths: document.getElementById('album-months'),
      albumSeasons: document.getElementById('album-seasons'),
      albumPolicy: document.getElementById('album-policy'),
      bindingsFp: document.getElementById('bindings-fp'),
      bindingsArcade: document.getElementById('bindings-arcade'),
      bindStatus: document.getElementById('bind-status'),
      touchNote: document.getElementById('touch-note'),
    };

    this._bindActions();
    this._bindModeCards();
    this._bindSettings();
    this._bindPlaytestProfile();
    this._bindRSI();
    this._renderShiftList('fp');
    this._renderHelp();
    this._renderStarsTotal();
    this.renderBindings();
    this.updateBindingLabels();
    this.updateHudHints('fp');
    window.addEventListener('keydown', (e) => this._onCaptureKey(e), true);
  }

  /* ------------------------------------------------------------- bindings */

  renderBindings() {
    for (const mode of ['fp', 'arcade']) {
      const el = mode === 'fp' ? this.refs.bindingsFp : this.refs.bindingsArcade;
      if (!el) continue;
      const bindings = getBindings(mode);
      el.textContent = '';
      let lastGroup = null;
      for (const row of bindings.rows()) {
        if (row.group !== lastGroup) {
          lastGroup = row.group;
          const head = document.createElement('div');
          head.className = 'bind-group-label';
          head.textContent = row.group;
          el.appendChild(head);
        }
        const div = document.createElement('div');
        div.className = 'bind-row';
        const label = document.createElement('span');
        label.textContent = row.label;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bind-key';
        button.textContent = row.keyLabel;
        button.addEventListener('click', () => this._startCapture(mode, row.action, button));
        div.append(label, button);
        el.appendChild(div);
      }
    }
  }

  _startCapture(mode, action, button) {
    if (this.capture) {
      this.capture.button?.classList.remove('capturing', 'conflict');
      this.capture = null;
    }
    this.capture = { mode, action, button };
    button.classList.add('capturing');
    button.textContent = '按下按键…';
    if (this.refs.bindStatus) {
      this.refs.bindStatus.classList.remove('error');
      this.refs.bindStatus.textContent = '按 Esc 取消';
    }
  }

  _cancelCapture() {
    if (!this.capture) return;
    this.capture = null;
    this.renderBindings();
    if (this.refs.bindStatus) {
      this.refs.bindStatus.classList.remove('error');
      this.refs.bindStatus.textContent = '';
    }
  }

  _onCaptureKey(e) {
    if (!this.capture) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.code === 'Escape') {
      this._cancelCapture();
      return;
    }
    const { mode, action, button } = this.capture;
    const result = getBindings(mode).set(action, e.code);
    if (!result.ok) {
      if (this.refs.bindStatus) {
        this.refs.bindStatus.classList.add('error');
        this.refs.bindStatus.textContent =
          result.reason === 'reserved'
            ? 'Esc 保留给暂停，换一个键'
            : `这个键已经绑定给「${result.conflictLabel}」`;
      }
      button.classList.add('conflict');
      return;
    }
    this.capture = null;
    if (this.refs.bindStatus) {
      this.refs.bindStatus.classList.remove('error');
      this.refs.bindStatus.textContent = '已保存';
    }
    this.renderBindings();
    this.updateBindingLabels();
  }

  _resetBindings(mode) {
    this._cancelCapture();
    if (mode) getBindings(mode).reset();
    this.renderBindings();
    this.updateBindingLabels();
    if (this.refs.bindStatus) {
      this.refs.bindStatus.classList.remove('error');
      this.refs.bindStatus.textContent = '已恢复默认';
    }
  }

  updateBindingLabels() {
    for (const el of document.querySelectorAll('[data-bind]')) {
      const [mode, action] = el.dataset.bind.split(':');
      if (!mode || !action) continue;
      el.textContent = getBindings(mode).primaryLabel(action);
    }
    this.updateHudHints(this.hudMode);
  }

  updateHudHints(mode = this.hudMode) {
    if (!this.refs.hudHint) return;
    this.hudMode = mode;
    if (this.inputDevice === 'gamepad') {
      this.refs.hudHint.innerHTML =
        mode === 'fp'
          ? '<span><b>左摇杆</b> 移动</span><span><b>右摇杆</b> 视角</span><span><b>A</b> 互动</span><span><b>X</b> 切菜</span><span><b>RT</b> 冲刺</span><span><b>Start</b> 暂停</span>'
          : '<span><b>左摇杆</b> P1 移动</span><span><b>A</b> P1 互动 / 切菜</span><span><b>键盘</b> 仍然可用</span><span><b>Start</b> 暂停</span>';
      return;
    }
    if (mode === 'fp') {
      const b = getBindings('fp');
      this.refs.hudHint.innerHTML = `<span><b>${b.primaryLabel('forward')}${b.primaryLabel('left')}${b.primaryLabel('back')}${b.primaryLabel('right')}</b> 移动</span><span><b>鼠标</b> 视角</span><span><b>${b.primaryLabel('interact')}</b> 互动 / 按住切菜</span><span><b>${b.primaryLabel('sprint')}</b> 冲刺</span><span><b>Esc</b> 暂停</span>`;
    } else {
      const b = getBindings('arcade');
      this.refs.hudHint.innerHTML = `<span><b>P1 ${b.primaryLabel('p1Up')}${b.primaryLabel('p1Left')}${b.primaryLabel('p1Down')}${b.primaryLabel('p1Right')}</b> 移动</span><span><b>${b.primaryLabel('p1Interact')}</b> 互动 / 切菜</span><span><b>P2 ${b.primaryLabel('p2Up')}${b.primaryLabel('p2Left')}${b.primaryLabel('p2Down')}${b.primaryLabel('p2Right')}</b></span><span><b>${b.primaryLabel('p2Interact')}</b></span><span><b>Esc</b> 暂停</span>`;
    }
  }

  setInputDevice(device) {
    this.inputDevice = device;
    this.updateHudHints(this.hudMode);
  }

  /* --------------------------------------------------------------- RSI */

  _bindRSI() {
    if (!this.refs.rsiCity) return;
    this.refs.rsiCity.innerHTML = rsi.CITIES.map((c) => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
    this.refs.rsiWeather.innerHTML = rsi.WEATHERS.map((w) => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
    this.refs.rsiCity.addEventListener('change', () => {
      rsi.setContext({ city: this.refs.rsiCity.value });
      this.rsiVariant = 0;
      this.renderRSI();
    });
    this.refs.rsiWeather.addEventListener('change', () => {
      rsi.setContext({ weather: this.refs.rsiWeather.value });
      this.rsiVariant = 0;
      this.renderRSI();
    });
    this.refs.rsiPrefs?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pref]');
      if (!btn) return;
      const current = new Set(rsi.getContext().prefs);
      if (current.has(btn.dataset.pref)) current.delete(btn.dataset.pref);
      else if (current.size < 4) current.add(btn.dataset.pref);
      rsi.setContext({ prefs: [...current] });
      this.rsiVariant = 0;
      this.renderRSI();
    });
  }

  renderRSI() {
    if (!this.refs.rsiRecs) return;
    const context = rsi.getContext();
    const state = rsi.getState();
    if (this.refs.rsiCity) this.refs.rsiCity.value = context.city;
    if (this.refs.rsiWeather) this.refs.rsiWeather.value = context.weather;
    if (this.refs.rsiPrefs) {
      this.refs.rsiPrefs.innerHTML = rsi.PREFERENCES.map(
        (p) =>
          `<button class="${context.prefs.includes(p.id) ? 'active' : ''}" data-pref="${p.id}" type="button">${p.emoji} ${p.name}</button>`,
      ).join('');
    }
    const level = LEVELS.find((l) => l.id === this.levelSelection) || LEVELS[0];
    const rec = rsi.recommendForLevel(level, { variant: this.rsiVariant });
    this.rsiRecommendation = rec;
    this.app.rsiRecommendation = rec;
    if (this.refs.rsiVersion) this.refs.rsiVersion.textContent = `v${rec.policyVersion}`;
    this.refs.rsiRecs.innerHTML = rec.items
      .map(
        (item) => `<article class="rsi-rec">
          <div class="rsi-rec-top"><span class="rsi-emoji">${item.emoji}</span><div><b>${item.name}</b><small>${item.tags.map((t) => rsi.TAG_NAMES[t] || t).join(' · ')}</small></div></div>
          <div class="rsi-reasons">${item.reasons.join(' · ') || '今日随机'}</div>
          <div class="rsi-rec-foot"><span>基础 ${item.score}</span><b>推荐 +25%</b></div>
        </article>`,
      )
      .join('');
    const prefNames = context.prefsInfo.map((p) => p.name).join('/') || '不设限';
    if (this.refs.rsiNote) {
      const policy = state.policy;
      this.refs.rsiNote.textContent = `${context.cityInfo.name} · ${context.weatherInfo.name} · 偏好 ${prefNames} · 已回放 ${state.history.length} 班 · replay ${policy.replayScore ?? 0}`;
    }
  }

  getRsiRecommendation(level) {
    if (this.rsiRecommendation && this.rsiRecommendation.tier === (level.tier || 3)) return this.rsiRecommendation;
    return rsi.recommendForLevel(level, { variant: this.rsiVariant });
  }

  /* --------------------------------------------------------------- album */

  showAlbum(year = new Date().getFullYear()) {
    const album = rsi.getAlbum(year);
    this.album = album;
    if (this.refs.albumYear) this.refs.albumYear.textContent = String(album.year);
    if (this.refs.albumTitle) this.refs.albumTitle.textContent = `${album.year} 年度相册`;
    if (this.refs.albumSubtitle) {
      this.refs.albumSubtitle.textContent = album.totalShifts
        ? `${album.totalShifts} 个班次 · ${album.totalDishes} 道菜 · ${album.cities.length} 座城市 · ${album.weathers.length} 种天气`
        : '还没有开火记录。先去厨房做第一道菜，RSI 会把它们收进相册。';
    }
    if (this.refs.albumStats) {
      this.refs.albumStats.innerHTML = `
        <div class="stat"><b>${album.totalShifts}</b><span>班次</span></div>
        <div class="stat"><b>${album.totalDishes}</b><span>端出的菜</span></div>
        <div class="stat"><b>${album.totalStars}</b><span>星星</span></div>
        <div class="stat"><b>${album.totalScore}</b><span>总分</span></div>
      `;
    }
    if (this.refs.albumMemoir) {
      this.refs.albumMemoir.innerHTML = album.memoir.map((p) => `<p>${p}</p>`).join('');
    }
    if (this.refs.albumDishes) {
      this.refs.albumDishes.innerHTML = album.dishes.length
        ? album.dishes
            .map(
              (d, i) => `<div class="album-dish ${i === 0 ? 'top' : ''}"><span>${d.emoji}</span><div><b>${d.name}</b><small>${d.count} 次 · ${d.desc}</small></div></div>`,
            )
            .join('')
        : '<p class="album-empty">还没有菜。</p>';
    }
    if (this.refs.albumMonths) {
      this.refs.albumMonths.innerHTML = album.months.length
        ? album.months
            .map(
              (m) => `<div class="album-month"><b>${m.label}</b><span>${m.shifts} 班 · ${m.totalDishes} 道${m.top ? ` · 最常做 ${m.top.name}` : ''}</span></div>`,
            )
            .join('')
        : '<p class="album-empty">还没有月份记录。</p>';
    }
    if (this.refs.albumPolicy) {
      const policy = rsi.getState().policy;
      const evolved = policy.updatedAt
        ? `推荐权重已在本机进化（${new Date(policy.updatedAt).toLocaleDateString('zh-CN')}）`
        : '还在等更多班次回放，推荐权重暂未更新';
      this.refs.albumPolicy.innerHTML = `RSI 厨房大脑 <b>v${policy.version}</b> · 回放 ${album.shifts.length} 班 · ${evolved}`;
    }
    if (this.refs.albumSeasons) {
      const seasons = album.seasons.filter((s) => s.shifts > 0);
      this.refs.albumSeasons.innerHTML = seasons.length
        ? seasons.map((s) => `<span class="album-season"><b>${s.name}</b>${s.shifts} 班 · ${s.dishes} 道</span>`).join('')
        : '';
    }
    this.show('album');
  }

  exportAlbum() {
    const album = this.album || rsi.getAlbum();
    this.app._download(`sizzle-album-${album.year}.html`, rsi.buildAlbumHTML(album), 'text/html;charset=utf-8');
  }

  /* ---------------------------------------------------------------- screens */

  show(screen) {
    if (!SCREENS.includes(screen)) return;
    for (const id of SCREENS) {
      document.getElementById(`screen-${id}`)?.classList.toggle('active', id === screen);
    }
    this.screen = screen;
    if (screen === 'modes') {
      this._renderShiftList(this.modeSelection);
      this._renderStarsTotal();
    }
    if (screen === 'settings') {
      this._syncSettingsInputs();
      this.renderBindings();
    } else {
      this._cancelCaptureIfAny();
    }
  }

  _cancelCaptureIfAny() {
    if (!this.capture) return;
    this.capture = null;
    if (this.refs.bindStatus) this.refs.bindStatus.textContent = '';
  }

  showMenu() {
    this.hideHUD();
    this.refs.levelIntro?.classList.add('hidden');
    this.show('menu');
    this.refs.boot.classList.add('done');
  }

  showModes(mode = this.modeSelection) {
    this.hideHUD();
    this.refs.touchNote?.classList.toggle('hidden', !isTouchDevice());
    this.selectMode(mode);
    this.show('modes');
  }

  hideScreens() {
    for (const id of SCREENS) document.getElementById(`screen-${id}`)?.classList.remove('active');
    this.screen = null;
  }

  showHUD(mode, level) {
    this.hudVisible = true;
    this.refs.hud.classList.remove('hidden');
    this.refs.hudMode.textContent = mode === 'fp' ? '沉浸厨房' : '街机厨房';
    this.refs.hudLevel.textContent = level.name;
    this.hudMode = mode;
    this.inputDevice = 'keyboard';
    this.updateHudHints(mode);
    this.refs.crosshair.classList.toggle('hidden', mode !== 'fp');
    this.refs.tutorial.classList.toggle('hidden', true);
    this.refs.tutorial.classList.toggle('arcade', mode === 'arcade');
    this.ticketNodes.clear();
    this.refs.tickets.textContent = '';
    this.lastScore = -1;
    this.lastTimer = '';
    this.lastCombo = -1;
    this.lastCarryUid = null;
    this.lastPrompt = null;
    this.refs.hudScore.textContent = '0';
    this.refs.hudTimer.textContent = fmtTime(level.duration);
    this.refs.hudCombo.classList.add('hidden');
    this.refs.carryIcon.textContent = '✋';
    this.refs.carryName.textContent = '空手';
    this.refs.prompt.classList.add('hidden');
    this.refs.promptProgress.classList.add('hidden');
    this.refs.toasts.textContent = '';
    this.refs.popups.textContent = '';
    this.refs.levelIntro.classList.add('hidden');
    this._warned15 = false;
    this._interactable = null;
    this._danger = null;
    this._chopOn = null;
    this.refs.crosshair.classList.remove('interactable', 'danger', 'chop');
    this._setFpsInputState(mode);
  }

  hideHUD() {
    this.hudVisible = false;
    this.refs.hud.classList.add('hidden');
  }

  _setFpsInputState(mode) {
    this.refs.hudHint.dataset.mode = mode;
  }

  /* ------------------------------------------------------------ mode select */

  _bindModeCards() {
    for (const card of document.querySelectorAll('.mode-card')) {
      card.addEventListener('click', () => this.selectMode(card.dataset.mode));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectMode(card.dataset.mode);
        }
      });
    }
    this.refs.playersToggle?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-players]');
      if (!btn) return;
      this.playerCount = Number(btn.dataset.players);
      for (const b of this.refs.playersToggle.querySelectorAll('button')) {
        b.classList.toggle('active', b === btn);
      }
      this.app.onPlayerCountChange?.(this.playerCount);
    });
  }

  selectMode(mode) {
    if (!['fp', 'arcade'].includes(mode)) return;
    this.modeSelection = mode;
    for (const card of document.querySelectorAll('.mode-card')) {
      card.classList.toggle('selected', card.dataset.mode === mode);
    }
    this.refs.modeDesc.textContent =
      mode === 'fp' ? '第一人称 · 走进厨房亲手做菜' : '街机 · 俯视视角，可本地双人';
    this.refs.playersToggle?.classList.toggle('hidden', mode !== 'arcade');
    this._renderShiftList(mode);
    this.renderRSI();
  }

  _renderShiftList(mode) {
    if (!this.refs.shiftList) return;
    const bests = save.allBests();
    this.refs.shiftList.textContent = '';
    for (const level of LEVELS) {
      const best = bests[`${mode}:${level.id}`] || { stars: 0, score: 0 };
      const btn = document.createElement('button');
      btn.className = 'shift-btn';
      btn.dataset.level = String(level.id);
      btn.classList.toggle('active', level.id === this.levelSelection);
      const stars = [1, 2, 3].map((i) => (i <= best.stars ? '<b>★</b>' : '☆')).join('');
      btn.innerHTML = `
        <span class="shift-num">SHIFT ${String(level.id).padStart(2, '0')}</span>
        <span class="shift-name">${level.name}</span>
        <span class="shift-stars">${stars}${best.score ? ` · ${best.score}` : ''}</span>
      `;
      btn.addEventListener('click', () => {
        this.levelSelection = level.id;
        for (const b of this.refs.shiftList.querySelectorAll('.shift-btn')) {
          b.classList.toggle('active', b === btn);
        }
        this.renderRSI();
        this.app.onLevelChange?.(level.id);
      });
      this.refs.shiftList.appendChild(btn);
    }
  }

  _renderStarsTotal() {
    if (!this.refs.totalStars) return;
    const bests = save.allBests();
    let total = 0;
    for (const level of LEVELS) {
      for (const mode of ['fp', 'arcade']) {
        total += bests[`${mode}:${level.id}`]?.stars || 0;
      }
    }
    this.refs.totalStars.textContent = `★ ${total} / ${LEVELS.length * 3 * 2}`;
  }

  _renderHelp() {
    if (!this.refs.helpRecipes) return;
    this.refs.helpRecipes.textContent = '';
    for (const recipe of Object.values(RECIPES)) {
      const el = document.createElement('div');
      el.className = 'recipe';
      const parts = recipeParts(recipe)
        .map((p) => `<span class="recipe-part">${p.label}${p.n > 1 ? ` ×${p.n}` : ''}</span>`)
        .join('');
      el.innerHTML = `
        <div class="recipe-top"><span>${recipe.emoji}</span>${recipe.name}</div>
        <div class="recipe-parts">${parts}</div>
        <div class="recipe-score">基础分 ${recipe.score}</div>
      `;
      this.refs.helpRecipes.appendChild(el);
    }
  }

  /* -------------------------------------------------------------- settings */

  _bindSettings() {
    const bindings = {
      'set-master': ['master', (v) => `${Math.round(v * 100)}%`],
      'set-music': ['music', (v) => `${Math.round(v * 100)}%`],
      'set-sfx': ['sfx', (v) => `${Math.round(v * 100)}%`],
      'set-sensitivity': ['sensitivity', (v) => `${Number(v).toFixed(2)}×`],
      'set-fov': ['fov', (v) => `${Math.round(v)}°`],
      'set-quality': ['quality', (v) => `${Math.round(v * 100)}%`],
      'set-shake': ['shake', (v) => `${Math.round(v * 100)}%`],
    };
    for (const [id, [key, label]] of Object.entries(bindings)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener('input', () => {
        const value = Number(el.value);
        const display = document.querySelector(`[data-val="${key}"]`);
        if (display) display.textContent = label(value);
        this.settings = save.saveSettings({ [key]: value });
        this.app.onSettingsChange?.(this.settings);
      });
    }
    const invert = document.getElementById('set-invert');
    invert?.addEventListener('change', () => {
      this.settings = save.saveSettings({ invertY: invert.checked });
      this.app.onSettingsChange?.(this.settings);
    });
    const hints = document.getElementById('set-hints');
    hints?.addEventListener('change', () => {
      this.settings = save.saveSettings({ showHints: hints.checked });
      this.app.onSettingsChange?.(this.settings);
    });
    const record = document.getElementById('set-record');
    record?.addEventListener('change', () => {
      this.settings = save.saveSettings({ recordPlaytest: record.checked });
      this.app.onSettingsChange?.(this.settings);
    });
    const touch = document.getElementById('set-touch');
    touch?.addEventListener('change', () => {
      this.settings = save.saveSettings({ touchControls: touch.value });
      this.app.onSettingsChange?.(this.settings);
    });
  }

  _bindPlaytestProfile() {
    const saveProfile = () => {
      const profile = {
        participant: this.refs.ptParticipant?.value.trim().slice(0, 24) || '',
        skill: this.refs.ptSkill?.value || 'unknown',
        firstTime: this.refs.ptFirst ? this.refs.ptFirst.checked : true,
      };
      this.settings = save.saveSettings({ playtestProfile: profile });
      this.app.onSettingsChange?.(this.settings);
    };
    this.refs.ptParticipant?.addEventListener('input', saveProfile);
    this.refs.ptSkill?.addEventListener('change', saveProfile);
    this.refs.ptFirst?.addEventListener('change', saveProfile);

    this.refs.ptImport?.addEventListener('change', async () => {
      const file = this.refs.ptImport.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const rows = parseCSV(text);
        if (!rows.length) {
          this._setDataStatus('CSV 没有可导入的数据行', true);
          return;
        }
        const result = importSessions(rows);
        this.showPlaytestData();
        this.computeRecommendations();
        this._setDataStatus(`导入完成：新增 ${result.added} 条，跳过 ${result.skipped} 条（重复 id 或空行）`);
      } catch {
        this._setDataStatus('CSV 读取失败；请确认是导出的 playtest CSV', true);
      } finally {
        this.refs.ptImport.value = '';
      }
    });
  }

  _setDataStatus(text, error = false) {
    if (!this.refs.dataStatus) return;
    this.refs.dataStatus.textContent = text || '';
    this.refs.dataStatus.classList.toggle('error', !!error);
  }

  computeRecommendations() {
    const result = analyzePlaytests(getSessions(), { minSamples: 3, players: 1 });
    this._lastReco = result;
    this.renderRecommendations(result);
    this._setDataStatus(
      result.humanRows ? '已按真人样本计算；应用只覆盖本机' : '没有真人样本，无法计算阈值',
      !result.humanRows,
    );
  }

  renderRecommendations(result) {
    const body = this.refs.dataRecoBody;
    if (!body) return;
    if (!result.humanRows) {
      body.innerHTML = '<span class="reco-missing">没有真人样本。先让试玩者填参与者/经验，或导入别的机器导出的 CSV。</span>';
      return;
    }
    const modeName = (m) => (m === 'fp' ? '沉浸厨房' : '街机厨房');
    const ready = result.recommendations.filter((r) => r.ready);
    const rows = result.recommendations
      .map((rec) => {
        const current = save.getTargetOverride(rec.mode, rec.level) || rec.currentTarget;
        const override = save.getTargetOverride(rec.mode, rec.level) ? '<span class="target-badge">本机</span>' : '';
        const samples = `${rec.samples.novice}/${rec.samples.average}/${rec.samples.expert}`;
        const status = rec.ready
          ? '<span class="reco-ready">可重标</span>'
          : `<span class="reco-missing">缺 ${rec.missing.join('、')}</span>`;
        const action = rec.ready
          ? `<button class="btn primary tiny" data-action="apply-target" data-mode="${rec.mode}" data-level="${rec.level}" data-target="${rec.target.join(',')}">应用</button>`
          : '';
        return `<tr>
          <td>${modeName(rec.mode)}</td>
          <td>SHIFT ${rec.level}</td>
          <td class="num">${samples}</td>
          <td class="num">${current.join(' / ')}${override}</td>
          <td class="num">${rec.target ? rec.target.join(' / ') : '—'}</td>
          <td>${status}</td>
          <td>${action}</td>
        </tr>`;
      })
      .join('');
    const warning = result.warnings.length
      ? `<div class="data-status">${result.warnings.slice(0, 2).join(' ')}</div>`
      : '';
    body.innerHTML = `
      <table class="reco-table">
        <thead><tr><th>模式</th><th>班次</th><th>样本（新/普/熟）</th><th>当前</th><th>建议</th><th>状态</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${ready.length ? `<div style="margin-top:10px"><button class="btn ghost tiny" data-action="apply-ready-targets">应用全部可重标（${ready.length}）</button></div>` : ''}
      ${warning}`;
  }

  _applyTarget(mode, level, raw) {
    const target = String(raw || '').split(',').map(Number);
    const applied = save.setTargetOverride(mode, level, target);
    if (!applied) {
      this._setDataStatus('阈值格式不对，未应用', true);
      return;
    }
    this._setDataStatus(`已应用 ${mode === 'fp' ? '沉浸厨房' : '街机厨房'} SHIFT ${level}：${applied.join(' / ')}（下一班生效）`);
    if (this._lastReco) this.renderRecommendations(this._lastReco);
  }

  _applyReadyTargets() {
    if (!this._lastReco) return;
    let count = 0;
    for (const rec of this._lastReco.recommendations) {
      if (!rec.ready || !rec.target) continue;
      if (save.setTargetOverride(rec.mode, rec.level, rec.target)) count++;
    }
    this._setDataStatus(`已应用 ${count} 组建议阈值（本机，下一班生效）`);
    this.renderRecommendations(this._lastReco);
  }

  _syncPlaytestProfile() {
    const profile = this.settings.playtestProfile || save.getSettings().playtestProfile || {};
    if (this.refs.ptParticipant) this.refs.ptParticipant.value = profile.participant || '';
    if (this.refs.ptSkill) this.refs.ptSkill.value = profile.skill || 'unknown';
    if (this.refs.ptFirst) this.refs.ptFirst.checked = profile.firstTime !== false;
  }

  _syncSettingsInputs() {
    const s = save.getSettings();
    this.settings = s;
    const values = {
      'set-master': [s.master, `${Math.round(s.master * 100)}%`],
      'set-music': [s.music, `${Math.round(s.music * 100)}%`],
      'set-sfx': [s.sfx, `${Math.round(s.sfx * 100)}%`],
      'set-sensitivity': [s.sensitivity, `${s.sensitivity.toFixed(2)}×`],
      'set-fov': [s.fov, `${Math.round(s.fov)}°`],
      'set-quality': [s.quality, `${Math.round(s.quality * 100)}%`],
      'set-shake': [s.shake, `${Math.round(s.shake * 100)}%`],
    };
    const keyById = {
      'set-master': 'master',
      'set-music': 'music',
      'set-sfx': 'sfx',
      'set-sensitivity': 'sensitivity',
      'set-fov': 'fov',
      'set-quality': 'quality',
      'set-shake': 'shake',
    };
    for (const [id, [value, label]] of Object.entries(values)) {
      const el = document.getElementById(id);
      if (el) el.value = String(value);
      const display = document.querySelector(`[data-val="${keyById[id]}"]`);
      if (display) display.textContent = label;
    }
    const invert = document.getElementById('set-invert');
    if (invert) invert.checked = !!s.invertY;
    const hints = document.getElementById('set-hints');
    if (hints) hints.checked = s.showHints !== false;
    const record = document.getElementById('set-record');
    if (record) record.checked = s.recordPlaytest !== false;
    const touch = document.getElementById('set-touch');
    if (touch) touch.value = s.touchControls || 'auto';
  }

  /* ------------------------------------------------------------ playtest data */

  showPlaytestData() {
    this._syncPlaytestProfile();
    const data = summarize();
    const human = summarize({ source: 'human' });
    if (!data.total) {
      this._lastReco = null;
      if (this.refs.dataRecoBody) this.refs.dataRecoBody.textContent = '先采集或导入真人样本，再点“计算建议”。';
      this._setDataStatus('');
    }
    const modeName = (m) => (m === 'fp' ? '沉浸厨房' : '街机厨房');
    if (this.refs.dataCount) this.refs.dataCount.textContent = `${data.total} 场`;
    if (this.refs.dataHuman) {
      if (human.total) {
        this.refs.dataHuman.classList.remove('empty');
        this.refs.dataHuman.innerHTML = `真人样本 <b>${human.total}</b> 场 · 平均出餐 <b>${human.avgServed}</b> 单 · 超时率 <b>${human.timeoutRate}%</b> · 平均分 <b>${human.avgScore}</b>${human.avgFirstServe != null ? ` · 首单 <b>${human.avgFirstServe}s</b>` : ''}（按上方参与者/经验标记记录）`;
      } else {
        this.refs.dataHuman.classList.add('empty');
        this.refs.dataHuman.textContent = '真人样本 0 场：下面表格只是自动化参考。先填参与者编号和经验，再开始班次。';
      }
    }
    if (this.refs.dataSummary) {
      this.refs.dataSummary.innerHTML = `
        <div class="data-kpi"><b>${data.total}</b><span>总场次</span></div>
        <div class="data-kpi"><b>${data.human}</b><span>真人样本</span></div>
        <div class="data-kpi"><b>${data.avgServed}</b><span>平均出餐</span></div>
        <div class="data-kpi"><b>${data.timeoutRate}%</b><span>平均超时率</span></div>
      `;
    }
    if (this.refs.dataTableBody) {
      if (!data.rows.length) {
        this.refs.dataTableBody.innerHTML = '<tr><td colspan="7" class="data-empty">还没有记录。打完一个班次后会自动出现在这里。</td></tr>';
      } else {
        this.refs.dataTableBody.innerHTML = data.rows
          .map(
            (r) => `
          <tr>
            <td>${modeName(r.mode)}</td>
            <td>SHIFT ${String(r.level).padStart(2, '0')}</td>
            <td class="num">${r.count}（${r.humanCount} / ${r.count - r.humanCount}）</td>
            <td class="num">${r.avgServed}</td>
            <td class="num">${r.timeoutRate}%</td>
            <td class="num">${r.avgScore}</td>
            <td class="num">${r.avgStars.toFixed(1)}</td>
          </tr>`,
          )
          .join('');
      }
    }
    if (this._lastReco) this.renderRecommendations(this._lastReco);
    this.show('data');
  }

  /* --------------------------------------------------------------- actions */

  _bindActions() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'play') {
        this.app.playClick?.();
        this.showModes(this.modeSelection);
        return;
      }
      if (action === 'start') {
        this.app.startShift?.(this.modeSelection, this.levelSelection, this.playerCount);
        return;
      }
      if (action === 'back') {
        this.app.playClick?.();
        if (this.screen === 'settings' && this.app.settingsReturn) {
          this.app.settingsReturn();
        } else if (this.screen === 'data' && this.app.dataReturn) {
          this.app.dataReturn();
        } else if (this.screen === 'album' && this.app.albumReturn) {
          this.app.albumReturn();
        } else {
          this.show('menu');
        }
        return;
      }
      if (action === 'reset-bindings') {
        this._resetBindings(el.dataset.mode);
        return;
      }
      if (action === 'recommend-targets') {
        this.computeRecommendations();
        return;
      }
      if (action === 'apply-target') {
        this._applyTarget(el.dataset.mode, Number(el.dataset.level), el.dataset.target);
        return;
      }
      if (action === 'apply-ready-targets') {
        this._applyReadyTargets();
        return;
      }
      if (action === 'reset-targets') {
        save.clearTargetOverrides();
        this._setDataStatus('已恢复官方阈值（本机覆盖已清除）');
        if (this._lastReco) this.renderRecommendations(this._lastReco);
        return;
      }
      if (action === 'survey-difficulty' || action === 'survey-replay') {
        this._recordSurvey(action, el.dataset.value);
        return;
      }
      if (action === 'rsi-auto') {
        rsi.autoContext();
        this.rsiVariant = 0;
        this.renderRSI();
        this.app.ui?.toast?.('已按本机时区与当前季节更新城市/天气');
        return;
      }
      if (action === 'rsi-shuffle') {
        this.rsiVariant = (this.rsiVariant + 1) % 11;
        this.renderRSI();
        return;
      }
      this.app.onAction?.(action);
    });
  }

  onAction(name, fn) {
    this.actions = this.actions || new Map();
    this.actions.set(name, fn);
  }

  /* ------------------------------------------------------------------- HUD */

  updateGame(session, mode) {
    if (!this.hudVisible || !session) return;
    if (session.state === 'over') return;

    if (session.score !== this.lastScore) {
      this.lastScore = session.score;
      this.refs.hudScore.textContent = String(session.score);
    }

    const t = fmtTime(session.timeLeft);
    if (t !== this.lastTimer) {
      this.lastTimer = t;
      this.refs.hudTimer.textContent = t;
      this.refs.hudTimer.classList.toggle('warn', session.timeLeft <= 45 && session.timeLeft > 15);
      this.refs.hudTimer.classList.toggle('danger', session.timeLeft <= 15);
    }

    if (!this._warned15 && session.timeLeft <= 15 && session.timeLeft > 0) {
      this._warned15 = true;
      this.toast('最后 15 秒！把手上的单子出掉', 'bad');
      this.app.audio?.play('countdown');
    }

    const comboOn = session.combo >= 1;
    this.refs.hudCombo.classList.toggle('hidden', !comboOn);
    if (comboOn && session.combo !== this.lastCombo) {
      this.lastCombo = session.combo;
      this.refs.hudCombo.textContent = `×${session.comboMultiplier.toFixed(2).replace(/0$/, '')}`;
      this.refs.hudCombo.style.animation = 'none';
      void this.refs.hudCombo.offsetWidth;
      this.refs.hudCombo.style.animation = '';
    }
    if (!comboOn) this.lastCombo = -1;

    this._updateTickets(session);

    const carry = mode?.hands?.carry ?? null;
    const uid = carry?.uid ?? null;
    if (uid !== this.lastCarryUid) {
      this.lastCarryUid = uid;
      this.refs.carryIcon.textContent = itemIcon(carry);
      this.refs.carryName.textContent = carry ? `${itemName(carry)}${itemStateTag(carry) ? ` · ${itemStateTag(carry)}` : ''}` : '空手';
      this.refs.carry.classList.remove('flash');
      void this.refs.carry.offsetWidth;
      this.refs.carry.classList.add('flash');
    }

    const prompt = mode?.getPrompt?.() ?? null;
    this.setPrompt(prompt);
    const crosshairState = mode?.getCrosshairState?.() ?? { visible: false };
    this.setCrosshair(crosshairState);
  }

  _updateTickets(session) {
    const tickets = session.orders.sorted;
    const ids = tickets.map((t) => t.id).join(',');
    if (this._ticketIds !== ids) {
      this._ticketIds = ids;
      this.refs.tickets.textContent = '';
      this.ticketNodes.clear();
      tickets.forEach((ticket, i) => {
        const recipe = RECIPES[ticket.recipeId];
        const recommended = session.recommended?.has(ticket.recipeId);
        const el = document.createElement('div');
        el.className = `ticket${recommended ? ' rsi-ticket' : ''}`;
        el.style.setProperty('--rot', `${(i - 1) * 1.4}deg`);
        const parts = recipeParts(recipe).map((p) => `${p.label}${p.n > 1 ? `×${p.n}` : ''}`);
        el.innerHTML = `
          <div class="ticket-top"><span class="ticket-emoji">${recipe.emoji}</span><span class="ticket-name">${recipe.name}</span></div>
          <div class="ticket-parts">${parts.join(' · ')}</div>
          ${recommended ? '<div class="ticket-rsi">RSI 推荐 · 出餐 +25%</div>' : ''}
          <div class="ticket-time">${Math.ceil(ticket.time)}s</div>
          <div class="ticket-bar"><i></i></div>
        `;
        const bar = el.querySelector('.ticket-bar i');
        const timeEl = el.querySelector('.ticket-time');
        this.refs.tickets.appendChild(el);
        this.ticketNodes.set(ticket.id, { el, bar, timeEl, recipe });
      });
    }

    for (const ticket of tickets) {
      const node = this.ticketNodes.get(ticket.id);
      if (!node) continue;
      const ratio = Math.max(0, Math.min(1, ticket.time / ticket.maxTime));
      node.bar.style.width = `${ratio * 100}%`;
      node.bar.className = ratio < 0.25 ? 'danger' : ratio < 0.5 ? 'warn' : '';
      const secs = Math.max(0, Math.ceil(ticket.time));
      const label = `${secs}s`;
      if (node.timeEl.textContent !== label) node.timeEl.textContent = label;
    }
  }

  setPrompt(prompt) {
    const key = prompt ? JSON.stringify({ t: prompt.title, h: prompt.hint, b: prompt.blocked, d: prompt.danger, g: prompt.good, k: prompt.key }) : '';
    if (this.lastPrompt === key) {
      if (prompt?.progress != null) {
        this.refs.promptProgress.classList.remove('hidden');
        this.refs.promptProgressBar.style.width = `${Math.max(0, Math.min(1, prompt.progress)) * 100}%`;
      } else if (prompt) {
        this.refs.promptProgress.classList.add('hidden');
      }
      return;
    }
    this.lastPrompt = key;
    if (!prompt) {
      this.refs.prompt.classList.add('hidden');
      return;
    }
    this.refs.prompt.classList.remove('hidden');
    this.refs.prompt.classList.toggle('blocked', !!prompt.blocked);
    this.refs.prompt.classList.toggle('danger', !!prompt.danger);
    this.refs.prompt.classList.toggle('good', !!prompt.good);
    this.refs.promptTitle.textContent = prompt.title || '';
    const touchMode = document.body.classList.contains('touch-mode');
    const keyLabel = touchMode
      ? '互动'
      : this.inputDevice === 'gamepad'
        ? 'A'
        : prompt.key || (this.app.modeName === 'arcade' ? '空格' : 'E');
    let hint = prompt.hint || '';
    if (touchMode) hint = hint.split(prompt.key || 'E').join('互动键');
    else if (this.inputDevice === 'gamepad') hint = hint.split(prompt.key || 'E').join('A');
    this.refs.promptHint.textContent = hint;
    this.refs.promptKey.textContent = keyLabel;
    if (prompt.progress != null) {
      this.refs.promptProgress.classList.remove('hidden');
      this.refs.promptProgressBar.style.width = `${Math.max(0, Math.min(1, prompt.progress)) * 100}%`;
    } else {
      this.refs.promptProgress.classList.add('hidden');
    }
  }

  setCrosshair(state) {
    if (!this.hudVisible) return;
    const ch = this.refs.crosshair;
    if (!state || !state.visible) {
      ch.classList.add('hidden');
      return;
    }
    ch.classList.remove('hidden');
    if (this._chopOn !== state.chop) {
      this._chopOn = state.chop;
      ch.classList.toggle('chop', !!state.chop);
    }
    if (this._interactable !== state.interactable) {
      this._interactable = state.interactable;
      ch.classList.toggle('interactable', !!state.interactable);
    }
    if (this._danger !== state.danger) {
      this._danger = state.danger;
      ch.classList.toggle('danger', !!state.danger);
    }
  }

  toast(text, tone = '') {
    if (!this.hudVisible) return;
    const el = document.createElement('div');
    el.className = `toast ${tone}`;
    el.textContent = text;
    this.refs.toasts.appendChild(el);
    while (this.refs.toasts.children.length > 4) this.refs.toasts.firstElementChild.remove();
    setTimeout(() => el.remove(), 2400);
  }

  scorePop(points, extra = '') {
    if (!this.hudVisible) return;
    const el = document.createElement('div');
    el.className = `score-pop${extra ? ' soft' : ''}`;
    el.textContent = extra || `+${Math.round(points)}`;
    el.style.left = `${50 + (Math.random() * 16 - 8)}%`;
    el.style.top = `${46 + (Math.random() * 10 - 5)}%`;
    this.refs.popups.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  /* --------------------------------------------------------------- tutorial */

  showLevelIntro(level, mode) {
    const el = this.refs.levelIntro;
    if (!el) return;
    this.refs.liKicker.textContent = `SHIFT ${String(level.id).padStart(2, '0')} · ${mode === 'fp' ? 'FIRST PERSON' : 'ARCADE'}`;
    this.refs.liTitle.textContent = level.name;
    this.refs.liSub.textContent = level.subtitle;
    this.refs.liTip.textContent = level.tip;
    el.classList.remove('hidden', 'out');
    void el.offsetWidth;
    clearTimeout(this._introTimer);
    clearTimeout(this._introTimer2);
    this._introTimer = setTimeout(() => {
      el.classList.add('out');
      this._introTimer2 = setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('out');
      }, 480);
    }, 4200);
  }

  setupTutorial(mode, show) {
    this.tutorialDone.clear();
    clearTimeout(this._tutorialTimer);
    const touchArcade =
      mode === 'arcade' && isTouchDevice() && (this.settings.touchControls || 'auto') !== 'off';
    const interact = touchArcade
      ? '右下角互动键'
      : mode === 'fp'
        ? getBindings('fp').primaryLabel('interact')
        : getBindings('arcade').primaryLabel('p1Interact');
    const steps =
      mode === 'fp'
        ? [
            ['pickup', `走到食材箱，按 ${interact} 拿食材`],
            ['chop', '食材放砧板，按住左键切碎'],
            ['cook', '生肉饼上煎炉，熟了再拿'],
            ['topping', '盘子放上出餐台，摆配料'],
            ['serve', `端起盘子到上菜窗口按 ${interact}`],
          ]
        : [
            ['pickup', `走到食材箱，按 ${interact} 拿食材`],
            ['chop', `食材放砧板，按住 ${interact} 切碎`],
            ['cook', '生肉饼上煎炉，熟了再拿'],
            ['topping', '盘子放上出餐台，摆配料'],
            ['serve', `端起盘子到上菜窗口按 ${interact}`],
          ];
    this.tutorialSteps = steps;
    this.refs.tutorialSteps.textContent = '';
    for (const [key, label] of steps) {
      const li = document.createElement('li');
      li.dataset.step = key;
      li.textContent = label;
      this.refs.tutorialSteps.appendChild(li);
    }
    this.refs.tutorial.classList.toggle('hidden', !show);
    this._updateTutorialHead();
  }

  tutorialEvent(type) {
    if (!this.refs.tutorial || this.refs.tutorial.classList.contains('hidden')) return;
    const map = {
      pickup: 'pickup',
      'chop:done': 'chop',
      'cook:done': 'cook',
      topping: 'topping',
      serve: 'serve',
    };
    if (type === 'serve') {
      // Serving a dish proves the loop is understood; clear the whole list.
      for (const [key] of this.tutorialSteps) {
        this.tutorialDone.add(key);
        this.refs.tutorialSteps.querySelector(`li[data-step="${key}"]`)?.classList.add('done');
      }
      this._updateTutorialHead();
      clearTimeout(this._tutorialTimer);
      this._tutorialTimer = setTimeout(() => this.refs.tutorial.classList.add('hidden'), 900);
      return;
    }
    const key = map[type];
    if (!key || this.tutorialDone.has(key)) return;
    this.tutorialDone.add(key);
    const li = this.refs.tutorialSteps.querySelector(`li[data-step="${key}"]`);
    li?.classList.add('done');
    this._updateTutorialHead();
    if (this.tutorialDone.size === this.tutorialSteps.length) {
      clearTimeout(this._tutorialTimer);
      this._tutorialTimer = setTimeout(() => this.refs.tutorial.classList.add('hidden'), 1200);
    }
  }

  _updateTutorialHead() {
    const pct = this.tutorialSteps.length
      ? Math.round((this.tutorialDone.size / this.tutorialSteps.length) * 100)
      : 0;
    const span = this.refs.tutorial.querySelector('.tutorial-head span');
    if (span) span.textContent = `${pct}%`;
  }

  /* ----------------------------------------------------------------- pause */

  showPause(session) {
    const stats = session
      ? `<div class="stat"><b>${session.score}</b><span>当前分数</span></div>
         <div class="stat"><b>${session.stats.served}</b><span>完成订单</span></div>
         <div class="stat"><b>${session.maxCombo}</b><span>最高连击</span></div>`
      : '';
    const el = document.getElementById('pause-stats');
    if (el) el.innerHTML = stats;
    this.refs.levelIntro?.classList.add('hidden');
    this.show('pause');
    this.setCrosshair({ visible: false });
    this.refs.prompt?.classList.add('hidden');
  }

  /* --------------------------------------------------------------- results */

  showResults({ session, mode, level, best, isBest, recorded, rsiResult }) {
    const starsEl = document.getElementById('results-stars');
    const kicker = document.getElementById('results-kicker');
    const title = document.getElementById('results-title');
    const won = session.stars > 0;
    kicker.textContent = isBest ? 'NEW BEST · 新纪录' : won ? 'SHIFT COMPLETE' : 'SHIFT OVER';
    title.textContent = won ? (session.stars === 3 ? '完美出餐！' : '顺利收工！') : '客人等急了…';
    starsEl.innerHTML = '<i>★</i><i>★</i><i>★</i>';
    [...starsEl.children].forEach((star, i) => {
      if (i < session.stars) {
        star.classList.add('on');
        setTimeout(() => star.classList.add('pop'), 260 + i * 160);
      }
    });
    document.getElementById('results-score').textContent = String(session.score);
    const bestEl = document.getElementById('results-best');
    bestEl.innerHTML = isBest
      ? `<b>新纪录！</b>之前最佳 ${best.score} 分`
      : `最佳纪录 <b>${best.score}</b> 分 · 目标 ${level.target[0]} / ${level.target[1]} / ${level.target[2]}`;
    const recordEl = document.getElementById('results-record');
    if (recordEl) {
      recordEl.textContent = recorded
        ? `已记录试玩数据 · ${recorded.mode === 'fp' ? '沉浸厨房' : '街机厨房'} · ${recorded.score} 分（设置 → 试玩数据可导出）`
        : '本局未记录试玩数据';
      if (rsiResult) {
        const policy = rsiResult.policy?.version || 1;
        const bonus = session.stats.rsiBonus || 0;
        recordEl.textContent += bonus > 0 ? ` · RSI +${bonus} 分 · 大脑 v${policy}` : ` · RSI 大脑 v${policy}`;
        if (rsiResult.improvement?.changed) {
          recordEl.textContent += ` · 回放升级 v${rsiResult.improvement.fromVersion}→v${rsiResult.improvement.toVersion}`;
        }
      }
    }
    this._surveyRecord = recorded?.source === 'human' ? recorded : null;
    if (this.refs.resultsSurvey) {
      this.refs.resultsSurvey.classList.toggle('hidden', !this._surveyRecord);
      for (const btn of this.refs.surveyDifficulty?.querySelectorAll('button') || []) {
        btn.classList.toggle('active', Number(btn.dataset.value) === Number(recorded?.difficulty || 0));
      }
      for (const btn of this.refs.surveyReplay?.querySelectorAll('button') || []) {
        btn.classList.toggle('active', btn.dataset.value === (recorded?.wantReplay || ''));
      }
      if (this.refs.surveyStatus) {
        this.refs.surveyStatus.textContent = this._surveyRecord
          ? recorded?.difficulty
            ? '已记录，谢谢'
            : '可选：帮助校准难度'
          : '';
      }
    }
    document.getElementById('results-grid').innerHTML = `
      <div class="stat"><b>${session.stats.served}</b><span>完成订单</span></div>
      <div class="stat"><b>×${session.maxCombo}</b><span>最高连击</span></div>
      <div class="stat"><b>${session.stats.expired}</b><span>超时订单</span></div>
      <div class="stat"><b>${session.stats.burnt}</b><span>烧焦肉饼</span></div>
    `;
    document.querySelector('#screen-results [data-action="next"]').textContent =
      level.id < LEVELS.length ? '下一班次' : '返回主菜单';
    document.querySelector('#screen-results [data-action="next"]').dataset.last = level.id < LEVELS.length ? 'no' : 'yes';
    this.show('results');
    this.setCrosshair({ visible: false });
    this.refs.prompt?.classList.add('hidden');
    this.refs.tutorial?.classList.add('hidden');
    this.refs.levelIntro?.classList.add('hidden');
  }

  _recordSurvey(action, value) {
    if (!this._surveyRecord) return;
    const patch =
      action === 'survey-difficulty' ? { difficulty: Number(value) } : { wantReplay: value };
    const updated = updateSession(this._surveyRecord.id, patch);
    if (!updated) return;
    this._surveyRecord = updated;
    const group = action === 'survey-difficulty' ? this.refs.surveyDifficulty : this.refs.surveyReplay;
    for (const btn of group?.querySelectorAll('button') || []) {
      btn.classList.toggle('active', btn.dataset.value === String(value));
    }
    if (this.refs.surveyStatus) this.refs.surveyStatus.textContent = '已记录，谢谢';
  }

  /* ------------------------------------------------------------ boot / misc */

  bootDone() {
    this.refs.boot.classList.add('done');
  }

  setMuteIcon(muted) {
    const btn = document.getElementById('mute-btn');
    if (btn) btn.textContent = muted ? '✕' : '♪';
  }

  getSelection() {
    return { mode: this.modeSelection, level: this.levelSelection, players: this.playerCount };
  }
}
