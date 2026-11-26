/**
 * Game view — host half (v2).
 *
 * Registers a session projection `gameView` that folds committed session events
 * (tool calls/results, turn/step boundaries) into a compact "scene": a bounded
 * beat log (one beat per tool call) plus a "bee" log (one bee per subagent
 * launch) — and now a lightweight *score game* on top:
 *
 *   - every completed tool result scores points (weighted by tool category),
 *     scaled by a combo multiplier (GOOD ×1 / GREAT ×2 / PERFECT ×3) like a
 *     rhythm game's judgment line;
 *   - a failed result is a MISS and resets the combo to 0;
 *   - score drives a level (LV) and an XP bar toward the next level.
 *
 * The Client renders that scene as a live animated game view beside the
 * composer: every tool call is an NPC action, every subagent launch is a bee
 * that leaves the hive, flies, and lands; every result pops a judgment
 * (PERFECT/GREAT/GOOD/MISS) with particles.
 *
 * Reference: workByGame (CrommaCode) — "one tool call = one beat/NPC action;
 * subagent = a bee that leaves, works, lands" + the Rhythm/Factory game feel.
 */

const MAX_BEATS = 40;
const MAX_BEES = 16;

// Score game tuning.
const POINTS = { read: 5, search: 5, skill: 8, write: 10, execute: 15, agent: 25, other: 3 };
const LEVEL_STEP = 150; // score points per level

// Tool name -> category. Category drives glyph + accent color in the Client.
// Matched in order; first match wins; fallback 'other'.
const CATEGORY_RULES = [
  [/^(subagent|subagent_fork|workflow|send_message|list_agents|list_subagent_models|team_task_)/i, 'agent'],
  [/^(read|glob|grep|list_|get_|describe_|explain_|analyze_|working_directory|job_list|job_output|memory_list|memory_read|memory_search|cordis_inspect_|list_mcp_|read_mcp_resource|acp_status|acp_cache|search_context|schedule_list|schedule_view)/i, 'read'],
  [/^(write|edit|todo_write|present|memory_write|memory_core|memory_delete|plugin_manager|schedule_create|schedule_edit)/i, 'write'],
  [/^(pwsh|bash|execute|run)/i, 'execute'],
  [/^(web_search|web_fetch|decompress|compress)/i, 'search'],
  [/^skill$/i, 'skill'],
];

// Tools that launch a worker subagent (a "bee" NPC that leaves and lands).
const BEE_LAUNCHERS = new Set(['subagent', 'subagent_fork', 'workflow']);

function categorize(name) {
  for (const [re, category] of CATEGORY_RULES) {
    if (re.test(name)) return category;
  }
  return 'other';
}

// Rhythm-style judgment: tier depends on the current combo streak.
function tierOf(combo) {
  if (combo >= 4) return { text: 'PERFECT', mult: 3 };
  if (combo >= 2) return { text: 'GREAT', mult: 2 };
  return { text: 'GOOD', mult: 1 };
}

// Pull a short human label from a tool's raw arguments JSON where the tool
// carries one (subagent description/prompt, task subject, …). Fallback: name.
function shortLabel(name, argsStr) {
  if (typeof argsStr === 'string' && argsStr.length > 0) {
    try {
      const a = JSON.parse(argsStr);
      if (a && typeof a === 'object') {
        const s = a.description || a.prompt || a.name || a.task || a.subject;
        if (typeof s === 'string' && s.trim()) {
          const t = s.trim().replace(/\s+/g, ' ');
          return t.length > 48 ? t.slice(0, 48) + '…' : t;
        }
      }
    } catch {
      /* unparseable arguments — use the name */
    }
  }
  return name;
}

function initialState() {
  return {
    running: false,
    turn: 0,
    step: 0,
    totalCalls: 0,
    lastActivity: 0,
    beats: [],
    bees: [],
    toolCounts: {},
    categoryCounts: {},
    // Score game.
    score: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    xp: 0,
    xpToNext: LEVEL_STEP,
    judgmentSeq: 0,
    judgment: null,
  };
}

function init() {
  return initialState();
}

function fold(state, event) {
  const d = event.data;

  switch (event.type) {
    case 'turn/start': {
      return { ...state, running: true, turn: d.turn, lastActivity: event.time };
    }
    case 'turn/end': {
      return { ...state, running: false, lastActivity: event.time };
    }
    case 'step/start': {
      return { ...state, step: d.step, lastActivity: event.time };
    }
    case 'tool/call': {
      const category = categorize(d.name);
      const beat = {
        id: d.callId,
        name: d.name,
        category,
        turn: d.turn,
        step: d.step,
        time: event.time,
        status: 'running',
        label: shortLabel(d.name, d.arguments),
      };
      const beats =
        state.beats.length >= MAX_BEATS
          ? [...state.beats.slice(state.beats.length - MAX_BEATS + 1), beat]
          : [...state.beats, beat];

      const toolCounts = { ...state.toolCounts };
      toolCounts[d.name] = (toolCounts[d.name] || 0) + 1;
      const categoryCounts = { ...state.categoryCounts };
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      let bees = state.bees;
      if (BEE_LAUNCHERS.has(d.name)) {
        const bee = {
          id: d.callId,
          label: shortLabel(d.name, d.arguments),
          tool: d.name,
          status: 'launched',
          launchedAt: event.time,
        };
        bees =
          bees.length >= MAX_BEES
            ? [...bees.slice(bees.length - MAX_BEES + 1), bee]
            : [...bees, bee];
      }

      return {
        ...state,
        totalCalls: state.totalCalls + 1,
        lastActivity: event.time,
        beats,
        bees,
        toolCounts,
        categoryCounts,
      };
    }
    case 'tool/result': {
      const msg = d.message || {};
      const callId = msg.toolCallId;
      if (!callId) return state;
      const isError = !!msg.isError || !!d.error;

      // Update the matched beat/bee status (best effort: they may have been
      // trimmed out of the bounded window).
      let beats = state.beats;
      let bees = state.bees;
      const bi = beats.findIndex((b) => b.id === callId);
      if (bi >= 0 && beats[bi].status !== (isError ? 'error' : 'done')) {
        beats = beats.slice();
        beats[bi] = { ...beats[bi], status: isError ? 'error' : 'done' };
      }
      const ei = bees.findIndex((b) => b.id === callId);
      if (ei >= 0) {
        bees = bees.slice();
        bees[ei] = { ...bees[ei], status: isError ? 'error' : 'landed', landedAt: event.time };
      }

      const beat = bi >= 0 ? beats[bi] : null;
      const category = beat ? beat.category : 'other';
      const tool = beat ? beat.name : 'tool';

      // Score the result (rhythm judgment).
      let combo = state.combo;
      let score = state.score;
      let text;
      let points;
      if (isError) {
        combo = 0;
        text = 'MISS';
        points = 0;
      } else {
        combo = state.combo + 1;
        const tier = tierOf(combo);
        points = (POINTS[category] || POINTS.other) * tier.mult;
        score = state.score + points;
        text = tier.text;
      }
      const bestCombo = Math.max(state.bestCombo, combo);
      const level = 1 + Math.floor(score / LEVEL_STEP);
      const xp = score % LEVEL_STEP;
      const judgmentSeq = state.judgmentSeq + 1;

      return {
        ...state,
        beats,
        bees,
        combo,
        score,
        bestCombo,
        level,
        xp,
        judgmentSeq,
        judgment: { seq: judgmentSeq, text, points, category, tool, time: event.time },
        lastActivity: event.time,
      };
    }
    default:
      return state;
  }
}

function view(state) {
  // The Client renders the scene directly; publish the state as the whole view.
  return state;
}

const passthrough = { parse: (x) => x };

export const name = 'game-view';
export const inject = ['sessionProjections'];

export async function apply(ctx) {
  await ctx.sessionProjections.register({
    key: 'gameView',
    stateSchema: passthrough,
    stateVersion: 2,
    init,
    apply: fold,
    wire: {
      viewSchema: passthrough,
      view,
      summary: false,
    },
  });
}
