# Agent game view

A live "hive" scene rendered in the full-width dock above the message composer. It maps the agent's behavior onto game visuals and NPC actions — with score, combo, judgment, and level-up effects — in the spirit of [workByGame](https://github.com/whllowp/Knowledge) (CrommaCode).

## What it shows

- **Beat belt** — one chip per recent tool call, tagged with a category glyph (🔍 read, ✏️ write, ⚡ execute, 🌐 search, 🐝 agent, 📖 skill). A running call pulses; a finished call flashes green and pops; a failed call shakes red.
- **Bee cloud** — one 🐝 per subagent launch (`subagent`, `subagent_fork`, `workflow`). A launched bee buzzes in flight, lands with a bounce when its tool result arrives, and shakes on failure.
- **HUD (score game)** — a score counter, a combo multiplier (🔥 ×N) that grows on consecutive successes, and a level + XP progress bar that fills toward the next level. Leveling up flashes a "LEVEL UP" banner.
- **Judgment popup** — every tool result pops a rhythm-style judgment — **PERFECT** / **GREAT** / **GOOD** / **MISS** — with the score gained, plus a small particle burst.
- **Status header** — a pulsing dot when the agent is running, a call counter, and the current turn.

## Scoring

- Each completed tool result scores points weighted by tool category (agent > execute > write > skill/search > read), scaled by a combo multiplier that rises with a consecutive-success streak — GOOD ×1, GREAT ×2, PERFECT ×3 (combo ≥ 2 / ≥ 4).
- A failed result is a **MISS**: it scores 0 and resets the combo.
- Score drives a level (every 150 points) and the XP bar toward the next level.

## How it works

The host registers a session projection `gameView` that folds committed session events (`tool/call`, `tool/result`, `turn/start`, `turn/end`, `step/start`) into a compact scene — a bounded beat log, per-tool and per-category counts, and the score/combo/level/judgment game state. The projection's `wire.view` ships that scene to the Client already computed; the Client does not fold session events itself. The Client renders the scene in the `conversation.input.dock` slot.

## Notes

- Subagents are detected from `subagent`/`subagent_fork`/`workflow` tool calls in the parent session log, since subagent sessions are separate Sessions with their own logs.
- The scene is bounded (last 40 beats, last 16 bees) so a long session stays light.
- The judgment popup is re-mounted on a fresh React key each result, so its one-shot animation replays per result.
- Artwork (category glyphs and accent colors) uses its own palette; the container and status colors follow the Harness theme tokens.
