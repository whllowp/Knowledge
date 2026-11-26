/**
 * Game view — client half (v2).
 *
 * Renders the `gameView` projection as a live animated "hive" scene in the
 * composer's input dock. v2 adds game effects on top of the v1 beat belt:
 *
 *   - a HUD bar (score, combo with multiplier, level + XP progress);
 *   - a judgment popup (PERFECT/GREAT/GOOD/MISS) that bursts particles and
 *     floats up over the belt each time a tool result lands;
 *   - launched bees that actually fly across the scene (not just wiggle) and
 *     land with a puff; beat chips pop in and flash on completion.
 *
 * Every tool call is an NPC action; a subagent launch is a bee that leaves the
 * hive, flies, and lands when the tool returns.
 */
window.__ModuleLoader__.load({
  id: '@local/game-view',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // Category -> artwork glyph + accent color (artwork may use its own colors).
    const CATEGORY_META = {
      read: { glyph: '\u{1F50D}', color: '#38bdf8' },
      write: { glyph: '\u270F\uFE0F', color: '#f59e0b' },
      execute: { glyph: '\u26A1', color: '#a78bfa' },
      search: { glyph: '\u{1F310}', color: '#2dd4bf' },
      agent: { glyph: '\u{1F41D}', color: '#f472b6' },
      skill: { glyph: '\u{1F4D6}', color: '#34d399' },
      other: { glyph: '\u{1F527}', color: '#94a3b8' },
    };

    // Judgment tiers -> accent color (rhythm-game judgement colors).
    const JUDGE_META = {
      PERFECT: { color: '#fbbf24' },
      GREAT: { color: '#22c55e' },
      GOOD: { color: '#38bdf8' },
      MISS: { color: '#ef4444' },
    };

    const EN = {
      title: 'Agent hive',
      running: 'Running',
      idle: 'Idle',
      calls: 'calls',
      waiting: 'No activity yet',
      combo: 'combo',
      level: 'LV',
      score: 'pts',
      levelUp: 'LEVEL UP',
    };
    const ZH = {
      title: 'Agent 蜂巢',
      running: '运行中',
      idle: '空闲',
      calls: '次调用',
      waiting: '暂无活动',
      combo: '连击',
      level: '等级',
      score: '分',
      levelUp: '升级',
    };

    const CSS = `
.gv-hive {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  font-family: inherit;
  color: var(--dsw-alias-label-primary, inherit);
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  position: relative;
}
.gv-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1;
}
.gv-title { font-weight: 600; }
.gv-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex: 0 0 auto;
  background: var(--dsw-alias-state-idle-primary, #888);
}
.gv-dot[data-state="running"] {
  background: var(--dsw-alias-state-success-primary, #22c55e);
  animation: gv-pulse 1.1s ease-in-out infinite;
}
.gv-muted { color: var(--dsw-alias-label-secondary, inherit); }
.gv-spacer { flex: 1 1 auto; }
.gv-badge {
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35));
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 11px;
}

/* ---- HUD: score / combo / level ---- */
.gv-hud {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  line-height: 1;
}
.gv-score {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.gv-score[data-bump="1"] { animation: gv-bump .32s ease-out; }
.gv-combo {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-weight: 700;
  color: #fbbf24;
}
.gv-combo-num { font-size: 16px; }
.gv-combo[data-bump="1"] .gv-combo-num { animation: gv-bump .3s ease-out; }
.gv-level { color: var(--dsw-alias-label-secondary, inherit); }
.gv-level-bar {
  position: relative;
  height: 5px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.15));
  overflow: hidden;
}
.gv-level-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6);
  transition: width .5s ease;
}
.gv-level-up {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fbbf24;
  text-shadow: 0 0 6px rgba(251,191,36,.6);
  pointer-events: none;
  animation: gv-levelflash 1s ease-out forwards;
}

/* ---- Beat belt ---- */
.gv-beats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 18px;
}
.gv-beat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.08));
  font-size: 11px;
  line-height: 1;
  animation: gv-pop .28s ease-out;
}
.gv-beat[data-status="done"] { animation: gv-done .45s ease-out; }
.gv-beat[data-status="error"] { animation: gv-shake .4s ease; border-color: #ef444466; }
.gv-beat-glyph { font-size: 12px; line-height: 1; }
.gv-beat-name { max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gv-beat-dot { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.gv-beat-dot[data-status="running"] { background: var(--dsw-alias-state-warn-primary, #f59e0b); animation: gv-pulse 1s ease-in-out infinite; }
.gv-beat-dot[data-status="done"] { background: var(--dsw-alias-state-success-primary, #22c55e); }
.gv-beat-dot[data-status="error"] { background: var(--dsw-alias-state-error-primary, #ef4444); }

/* ---- Bee cloud (subagents) ---- */
.gv-bees {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 18px;
}
.gv-bee {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, inherit);
  max-width: 180px;
}
.gv-bee-glyph { font-size: 13px; line-height: 1; display: inline-block; }
.gv-bee[data-status="launched"] .gv-bee-glyph { animation: gv-buzz 1.2s ease-in-out infinite; }
.gv-bee[data-status="landed"] .gv-bee-glyph { animation: gv-land .4s ease-out; }
.gv-bee[data-status="error"] .gv-bee-glyph { animation: gv-shake .4s ease; }
.gv-bee-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gv-empty {
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 11px;
}

/* ---- Judgment popup + particles ---- */
.gv-judge {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: .02em;
  line-height: 1;
  animation: gv-judge 0.9s ease-out forwards;
}
.gv-judge-sub {
  position: absolute;
  left: 50%;
  top: 62%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, inherit);
  animation: gv-judge-sub 0.9s ease-out forwards;
}
.gv-particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  animation: gv-particle .7s ease-out forwards;
}

@keyframes gv-pop {
  from { transform: scale(.5) translateY(4px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes gv-done {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
  50% { transform: scale(1.12); box-shadow: 0 0 0 4px rgba(34,197,94,0); }
  100% { transform: scale(1); }
}
@keyframes gv-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .35; }
}
@keyframes gv-buzz {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-6deg); }
  75% { transform: translateY(1px) rotate(6deg); }
}
@keyframes gv-land {
  0% { transform: translateY(-3px) scale(1.3); }
  60% { transform: translateY(0) scale(.9); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes gv-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
@keyframes gv-bump {
  0% { transform: scale(1); }
  40% { transform: scale(1.35); }
  100% { transform: scale(1); }
}
@keyframes gv-judge {
  0% { opacity: 0; transform: translate(-50%, -30%) scale(.4); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
  30% { transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -120%) scale(1); }
}
@keyframes gv-judge-sub {
  0% { opacity: 0; transform: translateX(-50%) translateY(6px); }
  20% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-18px); }
}
@keyframes gv-particle {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--gv-px, 0), var(--gv-py, -14px)) scale(.2); }
}
@keyframes gv-levelflash {
  0% { opacity: 0; letter-spacing: .3em; }
  30% { opacity: 1; letter-spacing: .05em; }
  100% { opacity: 0; }
}
`;

    function metaFor(category) {
      return CATEGORY_META[category] || CATEGORY_META.other;
    }

    function BeatChip({ beat }) {
      const meta = metaFor(beat.category);
      return h(
        'span',
        {
          className: 'gv-beat',
          'data-status': beat.status,
          title: beat.name + ' · turn ' + beat.turn + '/' + beat.step,
          style: { borderColor: meta.color + '66' },
        },
        h('span', { className: 'gv-beat-glyph', 'aria-hidden': true }, meta.glyph),
        h('span', { className: 'gv-beat-name' }, beat.name),
        h('span', { className: 'gv-beat-dot', 'data-status': beat.status, 'aria-hidden': true }),
      );
    }

    function Bee({ bee }) {
      return h(
        'span',
        { className: 'gv-bee', 'data-status': bee.status, title: bee.tool },
        h('span', { className: 'gv-bee-glyph', 'aria-hidden': true }, '\u{1F41D}'),
        h('span', { className: 'gv-bee-label' }, bee.label),
      );
    }

    // Judgment popup: a big PERFECT/GREAT/GOOD/MISS word + score delta,
    // plus a small burst of particles that fly outward and fade.
    function Judgment({ judgment, t }) {
      const jm = JUDGE_META[judgment.text] || JUDGE_META.GOOD;
      const color = jm.color;

      // Deterministic pseudo-random particle directions (seeded by seq).
      const particles = [];
      for (let i = 0; i < 8; i++) {
        const seed = ((judgment.seq * 37 + i * 61) % 100) / 100;
        const angle = (i / 8) * Math.PI * 2 + seed * 0.6;
        const dist = 18 + seed * 26;
        const px = Math.round(Math.cos(angle) * dist);
        const py = Math.round(Math.sin(angle) * dist);
        particles.push({ id: i, px: px + 'px', py: py + 'px' });
      }

      const sub =
        judgment.text === 'MISS'
          ? judgment.tool
          : '+' + judgment.points + ' ' + t.score;

      return h(
        'div',
        { className: 'gv-judge-layer', 'aria-hidden': true },
        h(
          'div',
          { className: 'gv-judge', style: { color } },
          judgment.text,
        ),
        h('div', { className: 'gv-judge-sub' }, sub),
        particles.map((p) =>
          h('span', {
            key: p.id,
            className: 'gv-particle',
            style: { background: color, '--gv-px': p.px, '--gv-py': p.py },
          }),
        ),
      );
    }

    function readDict(localeService) {
      try {
        if (localeService && typeof localeService.getLocale === 'function') {
          const snap = localeService.getLocale();
          const code = snap && typeof snap === 'object' ? snap.active : snap;
          if (code && String(code).toLowerCase().indexOf('zh') === 0) return ZH;
        }
      } catch {
        /* fall through */
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.language && String(navigator.language).toLowerCase().indexOf('zh') === 0) {
          return ZH;
        }
      } catch {
        /* fall through */
      }
      return EN;
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const localeService = ctx.locale;

        function GameView(props) {
          const useProjection = props.useProjection;
          const scene = typeof useProjection === 'function' ? useProjection('gameView') : undefined;
          const t = readDict(localeService);

          const empty = h('div', { className: 'gv-empty' }, t.waiting);

          if (!scene) {
            return h(
              'div',
              { className: 'gv-hive' },
              h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
              empty,
            );
          }

          const beats = scene.beats.slice(-12);
          const bees = scene.bees.slice(-8);
          const xpPct = Math.min(100, Math.round((scene.xp / scene.xpToNext) * 100));

          // The judgment popup is re-mounted each time `judgment.seq` changes
          // (a fresh React `key`), so its one-shot animation replays per result.
          const judgment = scene.judgment
            ? h(Judgment, { key: scene.judgment.seq, judgment: scene.judgment, t })
            : null;

          // Level-up flash re-mounts each time `level` increases.
          const levelUp = scene.level > 1
            ? h('div', { key: 'lv' + scene.level, className: 'gv-level-up' }, t.levelUp)
            : null;

          const header = h(
            'div',
            { className: 'gv-header' },
            h('span', { className: 'gv-dot', 'data-state': scene.running ? 'running' : 'idle', 'aria-hidden': true }),
            h('span', { className: 'gv-title' }, t.title),
            h('span', { className: 'gv-muted' }, scene.running ? t.running : t.idle),
            h('span', { className: 'gv-spacer' }),
            h('span', { className: 'gv-badge' }, scene.totalCalls + ' ' + t.calls),
          );

          const hud = h(
            'div',
            { className: 'gv-hud' },
            h('span', { className: 'gv-score', 'data-bump': scene.score > 0 ? '1' : '0', key: scene.score }, scene.score + ' ' + t.score),
            scene.combo > 1
              ? h(
                  'span',
                  { className: 'gv-combo', 'data-bump': '1', key: 'c' + scene.combo, title: scene.bestCombo + ' ' + t.combo },
                  h('span', { className: 'gv-combo-num' }, scene.combo + '\u00D7'),
                  h('span', { className: 'gv-muted' }, t.combo),
                )
              : null,
            h('span', { className: 'gv-spacer' }),
            h('span', { className: 'gv-level' }, t.level + ' ' + scene.level),
          );

          const levelBar = h(
            'div',
            { className: 'gv-level-bar' },
            h('div', { className: 'gv-level-fill', style: { width: xpPct + '%' } }),
            levelUp,
          );

          return h(
            'div',
            { className: 'gv-hive' },
            h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
            header,
            hud,
            levelBar,
            beats.length
              ? h('div', { className: 'gv-beats' }, beats.map((b) => h(BeatChip, { key: b.id, beat: b })))
              : empty,
            bees.length
              ? h('div', { className: 'gv-bees' }, bees.map((b) => h(Bee, { key: b.id, bee: b })))
              : null,
            judgment,
          );
        }

        ctx.slots.inject('conversation.input.dock', () =>
          ctx.slots.register(
            { name: 'conversation.input.dock', id: 'game-view', order: 30 },
            GameView,
          ),
        );
      },
    };
  },
});
