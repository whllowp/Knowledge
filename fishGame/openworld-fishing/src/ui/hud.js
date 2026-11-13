/**
 * hud.js — the in-game overlay: top bar, compass, minimap, bars, prompts,
 * the fishing widgets, notifications, catch card and the performance readout.
 *
 * Everything is DOM based: cheap to update, easy to style, and it keeps the
 * WebGL frame free of extra draw calls.
 */
import { clamp, clamp01, formatClock, formatCoins, formatWeight, lerp } from '../core/util.js';
import { RARITY } from '../data/fish.js';
import { levelProgress, MAX_LEVEL, totalXpForLevel } from '../systems/progression.js';
import { BIOME_LABELS } from '../world/terrain.js';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor(game) {
    this.game = game;
    this.root = $('hud');
    this.el = {
      coins: $('hudCoins'),
      level: $('hudLevel'),
      xp: $('hudXp'),
      weather: $('hudWeatherIco'),
      clock: $('hudClock'),
      temp: $('hudTemp'),
      compass: $('compassStrip'),
      crosshair: $('crosshair'),
      mmCoords: $('mmCoords'),
      mmBiome: $('mmBiome'),
      stamina: $('barStamina'),
      oxygen: $('barOxygen'),
      hunger: $('barHunger'),
      sanity: $('barSanity'),
      health: $('barHealth'),
      survivalLine: $('survivalLine'),
      sanityFx: $('sanityFx'),
      deathcard: $('deathcard'),
      prompt: $('prompt'),
      promptKey: $('promptKey'),
      promptText: $('promptText'),
      fishing: $('fishing'),
      fishState: $('fishState'),
      chargeWrap: $('chargeWrap'),
      chargeFill: $('chargeFill'),
      tensionWrap: $('tensionWrap'),
      fishName: $('fishName'),
      fishWeight: $('fishWeight'),
      fishStyle: $('fishStyle'),
      fishStamFill: $('fishStamFill'),
      fishStamPct: $('fishStamPct'),
      fightEvent: $('fightEvent'),
      feIcon: $('feIcon'),
      feLabel: $('feLabel'),
      feHint: $('feHint'),
      feBar: $('feBar'),
      tensionZone: $('tensionZone'),
      tensionMark: $('tensionMark'),
      distFill: $('distFill'),
      distPct: $('distPct'),
      lineWear: $('lineWear'),
      waitHint: $('waitHint'),
      waitText: $('waitText'),
      notifications: $('notifications'),
      catchcard: $('catchcard'),
      toastCenter: $('toast-center'),
      perf: $('perf'),
      hintbar: $('hintText'),
      fadeout: $('fadeout'),
      objective: $('objective'),
      objTitle: $('objTitle'),
      objHint: $('objHint'),
      buffbar: $('buffbar'),
      forecast: $('forecastLine'),
      contest: $('contest'),
      sizebanner: $('sizebanner'),
      grade: $('grade'),
      seaWay: $('seaWay'),
    };
    this.notes = [];
    this.perfVisible = false;
    this._compassMarks = [];
    this._lastPromptKey = null;
    this._lastBiome = '';
    this._cardTimer = 0;
    this._hintTimer = 0;
    this._buildCompass();
    this._fpsRing = [];
    this._lastFpsSample = 0;
    this.fps = 0;
    this.frameMs = 0;
  }

  _buildCompass() {
    const strip = this.el.compass;
    strip.innerHTML = '';
    this._compassMarks = [];
    const labels = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    this._pxPerDeg = 320 / 180;
    // Two full turns of marks so the visible window never runs off an end.
    for (let turn = 0; turn < 2; turn++) {
      for (let deg = 0; deg < 360; deg += 15) {
        const b = document.createElement('b');
        const isCard = labels[deg] !== undefined;
        b.textContent = labels[deg] || `${deg}`;
        b.className = isCard ? 'card' : '';
        b.style.left = `${(deg + turn * 360) * this._pxPerDeg}px`;
        strip.appendChild(b);
      }
    }
    strip.style.transform = 'translateX(0px)';
  }

  setPrompt(key, text) {
    // Cache on key AND text: the key alone is reused by many different prompts
    // ("cast here" for every spot), which used to leave stale wording on screen.
    const sig = key ? `${key}|${text}` : null;
    if (this._lastPromptKey === sig) return;
    this._lastPromptKey = sig;
    if (!key) {
      this.el.prompt.classList.add('hidden');
      return;
    }
    this.el.promptKey.textContent = key;
    this.el.promptText.textContent = text;
    this.el.prompt.classList.remove('hidden');
  }

  clearPrompt() {
    this.setPrompt(null);
  }

  setHint(text, duration = 0) {
    this.el.hintbar.textContent = text || '';
    this._hintTimer = duration;
  }

  notify(text, kind = '') {
    const div = document.createElement('div');
    div.className = `note ${kind}`;
    div.textContent = text;
    this.el.notifications.appendChild(div);
    const entry = { el: div, life: 4.2 };
    this.notes.push(entry);
    while (this.notes.length > 6) {
      const old = this.notes.shift();
      old.el.remove();
    }
  }

  showToast(title, sub = '', duration = 2.6) {
    const box = this.el.toastCenter;
    box.innerHTML = '';
    const t = document.createElement('div');
    t.className = 'bigtoast';
    t.textContent = title;
    box.appendChild(t);
    if (sub) {
      const s = document.createElement('div');
      s.style.fontSize = '13px';
      s.style.color = '#8fb2c2';
      s.style.marginTop = '4px';
      s.textContent = sub;
      box.appendChild(s);
    }
    box.classList.remove('hidden');
    this._toastTimer = duration;
  }

  showCatch(info) {
    const card = this.el.catchcard;
    const r = RARITY[info.fish.rarity] || RARITY[1];
    card.className = `rarity-${info.fish.rarity}`;
    card.classList.remove('hidden');
    const badges = [];
    if (info.sizeClass) {
      badges.push(`<span class="cc-badge size" style="border-color:${info.sizeClass.color};color:${info.sizeClass.color}">${info.sizeClass.icon} ${info.sizeClass.name}</span>`);
    }
    if (info.seaBonus > 0) {
      badges.push(`<span class="cc-badge sea">🌊 海况 ×${info.seaFactor} · +${formatCoins(info.seaBonus)}</span>`);
    }
    if (info.offshore) badges.push('<span class="cc-badge sea">外海</span>');
    // ---- v5.0.0 fight grade
    if (info.grade) {
      badges.push(
        `<span class="cc-badge grade" style="border-color:${info.grade.color};color:${info.grade.color}">搏斗 ${info.grade.id} · ${info.grade.label}${info.grade.bonus ? ` +${Math.round(info.grade.bonus * 100)}%` : ''}</span>`
      );
      if (info.fightStyle) {
        badges.push(`<span class="cc-badge">${info.fightStyle.icon} ${info.fightStyle.name} · 拆招 ${info.eventsCountered}/${info.eventsTotal}</span>`);
      }
    }
    if (info.newSpecies) badges.push('<span class="cc-badge new">新记录 · 图鉴 +1</span>');
    if (info.newRecord && !info.newSpecies) badges.push('<span class="cc-badge new">个人最佳</span>');
    if (info.perfect) badges.push('<span class="cc-badge">完美收线 ×1.5</span>');
    if (info.junk) badges.push('<span class="cc-badge">垃圾</span>');
    if (info.spotName) badges.push(`<span class="cc-badge">${info.spotName}</span>`);
    card.innerHTML = `
      <div class="cc-rarity" style="color:${r.color}">${r.icon} ${r.name} · ${r.en.toUpperCase()}</div>
      <div class="cc-icon">${info.fish.icon}</div>
      <div class="cc-name">${info.fish.name}</div>
      <div class="cc-latin">${info.fish.latin}</div>
      <div class="cc-stats">
        <div class="cc-stat"><b>${formatWeight(info.weight)}</b><span>重量</span></div>
        <div class="cc-stat"><b>${info.length >= 100 ? (info.length / 100).toFixed(2) + ' m' : Math.round(info.length) + ' cm'}</b><span>体长</span></div>
        <div class="cc-stat"><b>${formatCoins(info.value)}</b><span>金币</span></div>
        <div class="cc-stat"><b>+${info.xp}</b><span>经验</span></div>
      </div>
      <div class="cc-badges">${badges.join('')}</div>
      <div class="cc-close">左键 / F 收下 &nbsp;·&nbsp; <b style="color:#4ade80">R 放生（经验 ×1.7）</b></div>`;
    this._cardTimer = 7;
  }

  hideCatch() {
    this.el.catchcard.classList.add('hidden');
    this._cardTimer = 0;
  }

  togglePerf(on) {
    this.perfVisible = on === undefined ? !this.perfVisible : !!on;
    this.el.perf.classList.toggle('hidden', !this.perfVisible);
  }

  /** Weather station line: forecast, wind, waves, pressure, moon. */
  setForecast(info) {
    if (!info || !info.forecast) {
      this.el.forecast.innerHTML = '';
      return;
    }
    const w = info;
    const sig = `${w.kind}|${w.windSpeed}|${w.waveHeight}|${w.pressure}|${w.forecast.map((f) => f.kind).join('')}|${w.moonPhase?.index}|${w.phase?.id}|${Math.round(w.seaState ?? 0)}`;
    if (sig === this._fcSig) return;
    this._fcSig = sig;
    const next = w.forecast
      .slice(0, 2)
      .map((f) => `<span class="fc">${f.icon} ${f.label} <b>${Math.round(f.inMinutes)}分</b></span>`)
      .join('<span style="opacity:.35">→</span>');
    this.el.forecast.innerHTML = `
      <span>${w.phase ? `${w.phase.icon} <b>${w.phase.label}</b>` : ''}</span>
      <span>🌡️ <b>${Math.round(w.temperature)}°C</b></span>
      <span>💨 <b>${w.windSpeed}</b> m/s</span>
      <span>🌊 <b>${w.waveHeight}</b> m</span>
      <span>🧭 <b>${w.pressure}</b> hPa</span>
      <span>${w.moonPhase ? w.moonPhase.label : ''}</span>
      <span class="seachip tier-${w.seaLabel ? w.seaLabel.tier : 0}">${w.seaLabel ? w.seaLabel.icon : '🌊'} ${w.seaLabel ? w.seaLabel.label : ''} <b>鱼价 ×${w.priceMultiplier ?? 1}</b></span>
      <span style="opacity:.4">|</span>
      ${next}`;
  }

  /** Contest standings panel. Pass null to hide. */
  setContest(line) {
    if (!line) {
      this.el.contest.classList.add('hidden');
      this._contestSig = null;
      return;
    }
    const sig = `${line.timeLeft}|${line.rank}|${line.table.map((t) => t.score).join(',')}`;
    if (sig === this._contestSig) return;
    this._contestSig = sig;
    const m = Math.floor(line.timeLeft / 60);
    const s = line.timeLeft % 60;
    this.el.contest.classList.remove('hidden');
    this.el.contest.innerHTML = `
      <h4>🎣 钓鱼比赛</h4>
      <div class="clock">${m}:${String(s).padStart(2, '0')}</div>
      ${line.table
        .map(
          (t) =>
            `<div class="row ${t.you ? 'you' : ''}"><span>${t.rank}. ${t.name}</span><b>${t.score}</b></div>`
        )
        .join('')}
      <div class="row"><span>排名</span><b>${line.rank} / ${line.total}</b></div>`;
  }

  /** Big-fish size-class banner (v2.1.0). */
  showSizeBanner(cls, info) {
    if (!cls) return;
    const el = this.el.sizebanner;
    if (!el) return;
    el.className = `show cls-${cls.id}`;
    el.style.setProperty('--cls-color', cls.color);
    el.innerHTML = `
      <div class="sb-icon">${cls.icon}</div>
      <div class="sb-name">${cls.name}</div>
      <div class="sb-sub">${info ? `${info.fish.icon} ${info.fish.name} · ${formatWeight(info.weight)}` : ''}</div>`;
    this._sizeBannerTimer = 3.4;
  }

  /** Small persistent size-class tag on the catch card. */
  setSizeClass(cls) {
    this._sizeClass = cls;
  }

  /** Sailing waypoint to the nearest offshore mark (v3.3.0). */
  setSeaWay(info) {
    const el = this.el.seaWay;
    if (!el) return;
    if (!info) {
      if (!el.classList.contains('hidden')) el.classList.add('hidden');
      this._seaWaySig = null;
      return;
    }
    const dist = Math.round(info.dist);
    const sig = `${info.name}|${Math.round(dist / 5)}|${Math.round(info.rel * 20)}|${info.locked}`;
    if (sig === this._seaWaySig) return;
    this._seaWaySig = sig;
    el.classList.remove('hidden');
    el.innerHTML = `
      <span class="arrow" style="transform:rotate(${(-info.rel).toFixed(2)}rad)">▲</span>
      <span>${info.offshore ? '🌊 外海 · ' : ''}${info.name}</span>
      <span class="dist">${dist} m</span>
      ${info.locked ? `<span class="warn">需 ${info.minLevel} 级</span>` : ''}`;
  }

  /** Full-screen death card (v4.3.0). */
  showDeath(info) {
    const el = this.el.deathcard;
    if (!el) return;
    const cause = [];
    if ((info.hunger ?? 1) <= 0.001) cause.push('饿死');
    if ((info.warmth ?? 40) < 30) cause.push('失温');
    if ((info.sanity ?? 1) <= 0.001) cause.push('被黑暗吞没');
    el.className = '';
    el.innerHTML = `
      <div class="dc-title">你倒下了</div>
      <div class="dc-sub">${cause.join(' · ') || '力竭'}</div>
      <div class="dc-days">存活 ${info.days || 0} 天</div>
      <div class="dc-hint">在篝火边醒来 · 损失一部分金币与渔获</div>`;
    this._deathTimer = 4.5;
  }

  setCrosshairHot(hot) {
    this.el.crosshair.classList.toggle('hot', !!hot);
  }

  /** Tutorial / objective banner. Pass null to hide. */
  setObjective(title, hint) {
    if (!title) {
      this.el.objective.classList.add('hidden');
      this._objectiveSig = null;
      return;
    }
    const sig = `${title}|${hint}`;
    if (sig === this._objectiveSig) return;
    this._objectiveSig = sig;
    this.el.objTitle.textContent = title;
    this.el.objHint.textContent = hint || '';
    this.el.objective.classList.remove('hidden');
  }

  /** Active meal buffs with their remaining time. */
  setBuffs(list) {
    const sig = list.map((b) => `${b.id}:${Math.ceil(b.remaining / 5)}`).join(',');
    if (sig === this._buffSig) return;
    this._buffSig = sig;
    if (!list.length) {
      this.el.buffbar.innerHTML = '';
      return;
    }
    this.el.buffbar.innerHTML = list
      .map((b) => {
        const m = Math.floor(b.remaining / 60);
        const sec = b.remaining % 60;
        const t = m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
        return `<div class="buff-chip">${b.name}<i>${t}</i></div>`;
      })
      .join('');
  }

  setMinimapVisible(v) {
    const w = $('minimapWrap');
    if (w) w.classList.toggle('hidden', !v);
  }

  fadeOut(on) {
    this.el.fadeout.classList.toggle('on', !!on);
  }

  update(dt, ctx) {
    const { player, world, fishing, profile, survival } = ctx;
    const el = this.el;

    // ---- top bar (only touch the DOM when a value actually changes)
    const coinsTxt = formatCoins(profile.coins);
    if (coinsTxt !== this._cCoins) {
      this._cCoins = coinsTxt;
      el.coins.textContent = coinsTxt;
    }
    const lvlTxt = profile.level >= MAX_LEVEL ? 'Lv.MAX' : `Lv.${profile.level}`;
    if (lvlTxt !== this._cLevel) {
      this._cLevel = lvlTxt;
      el.level.textContent = lvlTxt;
    }
    const prog = levelProgress(profile);
    const progPct = Math.round(prog * 200) / 2;
    if (progPct !== this._cXp) {
      this._cXp = progPct;
      el.xp.style.width = `${progPct}%`;
    }
    const w = world.weatherInfo;
    if (w.icon !== this._cWeather) {
      this._cWeather = w.icon;
      el.weather.textContent = w.icon;
    }
    const clockTxt = formatClock(world.timeOfDay);
    if (clockTxt !== this._cClock) {
      this._cClock = clockTxt;
      el.clock.textContent = clockTxt;
    }
    const tempTxt = `${Math.round(w.temperature)}°C`;
    if (tempTxt !== this._cTemp) {
      this._cTemp = tempTxt;
      el.temp.textContent = tempTxt;
    }

    // ---- compass: one transform instead of 24 positioned elements
    const yawDeg = (((-player.yaw * 180) / Math.PI) % 360 + 360) % 360;
    const tx = Math.round((160 - (yawDeg + 360) * this._pxPerDeg) * 10) / 10;
    if (tx !== this._cCompass) {
      this._cCompass = tx;
      this.el.compass.style.transform = `translateX(${tx}px)`;
    }

    // ---- bars
    const stam = Math.round(player.stamina * 100);
    if (stam !== this._cStam) {
      this._cStam = stam;
      el.stamina.style.width = `${stam}%`;
    }
    const oxy = Math.round(player.oxygen * 100);
    if (oxy !== this._cOxy) {
      this._cOxy = oxy;
      el.oxygen.style.width = `${oxy}%`;
      el.oxygen.parentElement.parentElement.style.opacity = player.oxygen < 0.995 || player.submerged ? '1' : '0.35';
    }

    // ---- survival meters (v4.0.0)
    const sv = survival || this.game?.survival?.snapshot?.();
    if (sv) {
      const hg = Math.round(sv.hunger * 100);
      if (hg !== this._cHunger) {
        this._cHunger = hg;
        el.hunger.style.width = `${hg}%`;
        el.hunger.parentElement.parentElement.classList.toggle('low', hg < 22);
      }
      const sa = Math.round(sv.sanity * 100);
      if (sa !== this._cSanity) {
        this._cSanity = sa;
        el.sanity.style.width = `${sa}%`;
      }
      const hp = Math.round(sv.health * 100);
      if (hp !== this._cHealth) {
        this._cHealth = hp;
        el.health.style.width = `${hp}%`;
      }
      const sig = `${sv.days}|${sv.temperature}|${sv.status.map((s) => s.id).join(',')}|${sv.season?.id}`;
      if (sig !== this._cSurv) {
        this._cSurv = sig;
        const badges = sv.status
          .map((s) => `<span class="${s.level >= 2 ? 'danger' : 'warn'}">${s.icon} ${s.label}</span>`)
          .join('');
        el.survivalLine.innerHTML = `<span class="day">☀ 第 <b>${sv.days}</b> 天</span>
          <span>${sv.season ? `${sv.season.icon} ${sv.season.label}` : ''}</span>
          <span>🌡️ <b>${sv.temperature.toFixed(1)}</b>°C</span>${badges}`;
      }
      // sanity pressure: darkness closes in, a shape at the edge of vision
      const fx = el.sanityFx;
      if (fx) {
        const insanity = clamp01((0.42 - sv.sanity) / 0.42);
        if (insanity > 0.02) {
          fx.classList.add('on');
          fx.style.setProperty('--dark', (insanity * 0.72).toFixed(2));
          fx.style.setProperty('--shade', (insanity * 0.9).toFixed(2));
        } else if (fx.classList.contains('on')) {
          fx.classList.remove('on');
        }
      }
    }

    // ---- minimap labels
    const biome = world.biomeAt(player.position.x, player.position.z);
    if (biome !== this._lastBiome) {
      this._lastBiome = biome;
      el.mmBiome.textContent = BIOME_LABELS[biome] || biome;
    }
    const coords = `${Math.round(player.position.x)}, ${Math.round(player.position.z)}`;
    if (coords !== this._cCoords) {
      this._cCoords = coords;
      el.mmCoords.textContent = coords;
    }

    // ---- prompts
    this._updatePrompts(ctx);

    // ---- fishing widgets
    this._updateFishing(fishing);

    // ---- weather station line (v1.7.0)
    this.setForecast(w);

    // ---- tutorial objective
    const tut = this.game.tutorial;
    if (tut && tut.active && tut.step) {
      this.setObjective(`教学 ${tut.index + 1}/${tut.total}：${tut.step.title}`, tut.step.hint);
    } else {
      this.setObjective(null);
    }

    // ---- notifications
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.life -= dt;
      if (n.life <= 0) {
        n.el.remove();
        this.notes.splice(i, 1);
      } else if (n.life < 0.8) {
        n.el.style.opacity = String(clamp01(n.life / 0.8));
      }
    }

    // ---- toasts
    if (this._toastTimer > 0) {
      this._toastTimer -= dt;
      if (this._toastTimer <= 0) this.el.toastCenter.classList.add('hidden');
    }
    if (this._sizeBannerTimer > 0) {
      this._sizeBannerTimer -= dt;
      const el = this.el.sizebanner;
      if (this._sizeBannerTimer <= 0.7) el.classList.add('fading');
      if (this._sizeBannerTimer <= 0) {
        el.classList.add('hidden');
        el.classList.remove('fading');
      }
    }
    if (this._deathTimer > 0) {
      this._deathTimer -= dt;
      const el = this.el.deathcard;
      if (this._deathTimer <= 1.2) el.classList.add('fading');
      if (this._deathTimer <= 0) {
        el.classList.add('hidden');
        el.classList.remove('fading');
      }
    }
    if (this._cardTimer > 0) {
      this._cardTimer -= dt;
      if (this._cardTimer <= 0) this.hideCatch();
    }

    // ---- hint
    if (this._hintTimer > 0) {
      this._hintTimer -= dt;
      if (this._hintTimer <= 0) this.el.hintbar.textContent = '';
    }

    // ---- perf
    if (this.perfVisible) this._updatePerf(ctx);
  }

  _updatePrompts({ player, world, fishing, profile }) {
    if (fishing.state === 'result' || fishing.state === 'fight') {
      this.clearPrompt();
      return;
    }
    // boats take priority: you cannot cast while standing on one you are not in
    if (player.mounted) {
      this.setPrompt('B', '下船（划到浅水区）');
      if (fishing.state === 'idle') return;
    } else if (world.boats) {
      const boat = world.boats.nearest(player.position, 3.4);
      if (boat && fishing.state === 'idle' && !player.swimming) {
        this.setPrompt('B', '上船');
        return;
      }
    }
    // campfire cooking is the other idle interaction
    if (fishing.state === 'idle' && this.game.nearCampfire && this.game.nearCampfire()) {
      this.setPrompt('C', '在篝火旁烹饪');
      return;
    }
    if (fishing.state === 'charging') {
      this.setPrompt('松开', '抛竿');
      return;
    }
    if (fishing.state === 'waiting' || fishing.state === 'flying') {
      this.setPrompt('右键', '收竿');
      return;
    }
    if (fishing.state === 'bite') {
      this.setPrompt('左键', '提竿！');
      return;
    }
    // idle
    const spot = world.activeSpot(player.position.x, player.position.z, profile.level);
    const near = world.nearestSpot(player.position.x, player.position.z, 42);
    const swimming = player.swimming;
    if (spot) {
      this.setPrompt('F', `在「${spot.name}」抛竿${swimming ? '（水中）' : ''}`);
      return;
    }
    if (near && near.minLevel > profile.level) {
      this.setPrompt('🔒', `需要 Lv.${near.minLevel} 才能在此垂钓`);
      return;
    }
    if (swimming) {
      this.setPrompt('Space', '上浮 · Ctrl 下潜');
      return;
    }
    if (near) {
      this.setPrompt('F', `抛竿（附近钓点：${near.name}）`);
      return;
    }
    // anywhere near water?
    const ahead = 12;
    const fx = player.position.x - Math.sin(player.yaw) * ahead;
    const fz = player.position.z - Math.cos(player.yaw) * ahead;
    if (world.isWater(fx, fz)) {
      this.setPrompt('F', '朝水面抛竿');
    } else {
      this.setPrompt('V', `切换${player.viewMode === 'first' ? '第三人称' : '第一人称'}`);
    }
  }

  _updateFishing(fishing) {
    const s = fishing.getHudState();
    const st = s.state;
    const showUi = st !== 'idle' && st !== 'result';
    this.el.fishing.classList.toggle('hidden', !showUi);
    if (!showUi) return;

    const chargeOn = st === 'charging';
    this.el.chargeWrap.classList.toggle('hidden', !chargeOn);
    if (chargeOn) {
      this.el.chargeFill.style.width = `${(s.charge * 100).toFixed(0)}%`;
    }

    const fightOn = st === 'fight';
    this.el.tensionWrap.classList.toggle('hidden', !fightOn);
    if (fightOn) {
      this.el.fishName.textContent = `${s.fishIcon} ${s.fishName}`;
      // v2.0.0: weight · drag setting · line out in metres
      const dragPct = Math.round((s.drag ?? 0.5) * 100);
      const lineOut = Math.round(s.lineOut ?? 0);
      const showDrag = this.game.profile.settings.dragIndicator !== false;
      this.el.fishWeight.textContent = showDrag
        ? `${formatWeight(s.fishWeight)} · 卸力 ${dragPct}% · 出线 ${lineOut} m`
        : formatWeight(s.fishWeight);
      this.el.fishWeight.style.color = s.slipping ? '#ffd166' : s.danger ? '#ff6b6b' : '';
      const low = clamp01(s.zoneLow);
      const high = clamp01(s.zoneHigh);
      this.el.tensionZone.style.left = `${low * 100}%`;
      this.el.tensionZone.style.width = `${Math.max(2, (high - low) * 100)}%`;
      this.el.tensionMark.style.left = `${clamp01(s.tension) * 100}%`;
      this.el.tensionMark.style.background = s.slipping ? '#ffd166' : s.tension > high ? '#ff6b6b' : s.tension < low ? '#8fb2c2' : '#ffffff';
      this.el.tensionMark.style.boxShadow = s.slipping ? '0 0 12px #ffd166' : '0 0 8px #fff';
      this.el.distFill.style.width = `${(s.distance * 100).toFixed(0)}%`;
      this.el.distPct.textContent = `${Math.round(s.distance * 100)}%`;
      this.el.lineWear.style.width = `${(s.wear * 100).toFixed(0)}%`;
      this.el.fishing.classList.toggle('slipping', !!s.slipping);

      // ---- v5.0.0: fish stamina, fight style and the current event
      const stamPct = Math.round((s.stamina ?? 1) * 100);
      if (stamPct !== this._cFishStam) {
        this._cFishStam = stamPct;
        this.el.fishStamFill.style.width = `${stamPct}%`;
        this.el.fishStamPct.textContent = `${stamPct}%`;
      }
      const styleTxt = s.style ? `${s.style.icon} ${s.style.name}` : '';
      if (styleTxt !== this._cStyle) {
        this._cStyle = styleTxt;
        this.el.fishStyle.textContent = styleTxt;
        this.el.fishStyle.title = s.style?.blurb || '';
      }
      const ev = s.event;
      const evSig = ev ? `${ev.type}|${ev.phase}|${ev.countered}|${Math.round((ev.progress || 0) * 24)}` : 'none';
      if (evSig !== this._cEvent) {
        this._cEvent = evSig;
        const box = this.el.fightEvent;
        if (!ev) {
          box.classList.add('hidden');
        } else {
          box.classList.remove('hidden');
          box.classList.toggle('active', ev.phase === 'active' && !ev.countered);
          box.classList.toggle('countered', !!ev.countered);
          this.el.feIcon.textContent = ev.icon;
          this.el.feLabel.textContent = ev.countered
            ? `${ev.label} · 已化解`
            : ev.phase === 'telegraph'
            ? `⚠ ${ev.label}`
            : ev.label;
          this.el.feHint.textContent = ev.countered ? '漂亮！' : ev.hint;
          this.el.feBar.style.width = `${Math.round((ev.progress || 0) * 100)}%`;
        }
      }
    } else {
      this.el.fishing.classList.remove('slipping');
      this.el.fightEvent.classList.add('hidden');
      this._cEvent = null;
    }

    const waitOn = st === 'waiting' || st === 'bite' || st === 'flying';
    this.el.waitHint.classList.toggle('hidden', !waitOn);
    if (waitOn) {
      this.el.waitText.textContent =
        st === 'flying'
          ? '浮漂飞行中…'
          : st === 'bite'
          ? '咬钩了！立刻提竿！'
          : s.retrieving
          ? '慢慢收线…'
          : `${s.spotName || '开阔水域'} · 水深 ${(s.depth || 0).toFixed(1)} m · 等待咬钩…`;
    }

    const labels = {
      charging: '蓄力抛投',
      casting: '抛投！',
      flying: '浮漂入水',
      waiting: '守候',
      bite: '咬钩！',
      fight: '搏鱼中',
    };
    let stateText = labels[st] || '';
    if (st === 'fight') {
      const s2 = fishing.getHudState();
      if (s2.slipping) stateText = '卸力出线中！按 Z 放松卸力 / 右键抬竿泄力';
      else if (s2.wear > 0.4) stateText = '鱼线吃紧 · 小心崩断';
      else if ((s2.dragMax ?? 1) < 0.4) stateText = '线组偏细 · 鱼会不断出线';
      else if ((s2.dragUser ?? 1) < 0.5) stateText = '卸力偏松 · 按 X 收紧';
    }
    this.el.fishState.textContent = stateText;
  }

  _updatePerf({ fps, frameMs, renderer, world, player, fishing }) {
    const el = this.el.perf;
    const mem = performance.memory;
    const jsHeap = mem ? mem.usedJSHeapSize / 1048576 : 0;
    const limit = mem ? mem.jsHeapSizeLimit / 1048576 : 0;
    el.textContent =
      `FPS ${fps.toFixed(0)}  (${frameMs.toFixed(1)} ms)\n` +
      `draw calls ${renderer.calls}\n` +
      `triangles ${(renderer.triangles / 1000).toFixed(0)}k\n` +
      `geometries ${renderer.geometries}  textures ${renderer.textures}\n` +
      `JS heap ${jsHeap.toFixed(1)} MB${limit ? ` / ${limit.toFixed(0)} MB` : ''}\n` +
      `pos ${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}\n` +
      `biome ${world.biomeAt(player.position.x, player.position.z)}  depth ${world.depthAt(player.position.x, player.position.z).toFixed(1)}\n` +
      `weather ${world.weather.kind}  time ${world.timeOfDay.toFixed(2)}h\n` +
      `state ${fishing.state}  spots ${world.discoveredCount}/${world.spots.length}`;
  }
}
