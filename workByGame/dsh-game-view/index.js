/**
 * Game view — host half.
 *
 * Registers a session projection `gameView` that folds committed session events
 * (tool calls/results, turn/step boundaries) into a compact "scene": a bounded
 * beat log (one beat per tool call) plus a "bee" log (one bee per subagent
 * launch). The Client renders that scene as a game view beside the composer:
 * every tool call is an NPC action, every subagent launch is a bee that leaves
 * the hive and lands when it finishes.
 *
 * Reference: workByGame (CrommaCode) — "one tool call = one beat/NPC action;
 * subagent = a bee that leaves, works, lands".
 */

const MAX_BEATS = 40;
const MAX_BEES = 16;

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

      let beats = state.beats;
      let bees = state.bees;
      let changed = false;

      const bi = beats.findIndex((b) => b.id === callId);
      const nextStatus = isError ? 'error' : 'done';
      if (bi >= 0 && beats[bi].status !== nextStatus) {
        beats = beats.slice();
        beats[bi] = { ...beats[bi], status: nextStatus };
        changed = true;
      }

      const ei = bees.findIndex((b) => b.id === callId);
      if (ei >= 0) {
        bees = bees.slice();
        bees[ei] = { ...bees[ei], status: isError ? 'error' : 'landed', landedAt: event.time };
        changed = true;
      }

      if (!changed) return state;
      return { ...state, beats, bees, lastActivity: event.time };
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
    stateVersion: 1,
    init,
    apply: fold,
    wire: {
      viewSchema: passthrough,
      view,
      summary: false,
    },
  });
}
