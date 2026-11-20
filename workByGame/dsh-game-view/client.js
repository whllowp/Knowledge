/**
 * Game view — client half.
 *
 * Renders the `gameView` projection as a live "hive" scene in the composer's
 * input dock: a beat belt (one chip per recent tool call) and a bee cloud (one
 * bee per subagent). Every tool call is an NPC action; a subagent launch is a
 * bee leaving the hive, landing when the tool returns.
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

    const EN = {
      title: 'Agent hive',
      running: 'Running',
      idle: 'Idle',
      calls: 'calls',
      waiting: 'No activity yet',
    };
    const ZH = {
      title: 'Agent 蜂巢',
      running: '运行中',
      idle: '空闲',
      calls: '次调用',
      waiting: '暂无活动',
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
.gv-beat-glyph { font-size: 12px; line-height: 1; }
.gv-beat-name { max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gv-beat-dot { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.gv-beat-dot[data-status="running"] { background: var(--dsw-alias-state-warn-primary, #f59e0b); animation: gv-pulse 1s ease-in-out infinite; }
.gv-beat-dot[data-status="done"] { background: var(--dsw-alias-state-success-primary, #22c55e); }
.gv-beat-dot[data-status="error"] { background: var(--dsw-alias-state-error-primary, #ef4444); }
.gv-bees {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 16px;
}
.gv-bee {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, inherit);
  max-width: 180px;
}
.gv-bee-glyph { font-size: 13px; line-height: 1; }
.gv-bee[data-status="launched"] .gv-bee-glyph { animation: gv-buzz 1.2s ease-in-out infinite; }
.gv-bee-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gv-empty {
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 11px;
}
@keyframes gv-pop {
  from { transform: scale(.5) translateY(4px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
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

          return h(
            'div',
            { className: 'gv-hive' },
            h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
            h(
              'div',
              { className: 'gv-header' },
              h('span', { className: 'gv-dot', 'data-state': scene.running ? 'running' : 'idle', 'aria-hidden': true }),
              h('span', { className: 'gv-title' }, t.title),
              h('span', { className: 'gv-muted' }, scene.running ? t.running : t.idle),
              h('span', { className: 'gv-spacer' }),
              h('span', { className: 'gv-badge' }, scene.totalCalls + ' ' + t.calls),
            ),
            beats.length
              ? h('div', { className: 'gv-beats' }, beats.map((b) => h(BeatChip, { key: b.id, beat: b })))
              : empty,
            bees.length
              ? h('div', { className: 'gv-bees' }, bees.map((b) => h(Bee, { key: b.id, bee: b })))
              : null,
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
