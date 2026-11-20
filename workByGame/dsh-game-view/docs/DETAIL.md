# Agent game view

A live "hive" scene rendered in the full-width dock above the message composer. It maps the agent's behavior onto game visuals and NPC actions, in the spirit of [workByGame](https://github.com/whllowp/Knowledge) (CrommaCode).

## What it shows

- **Beat belt** — one chip per recent tool call, tagged with a category glyph (🔍 read, ✏️ write, ⚡ execute, 🌐 search, 🐝 agent, 📖 skill). A running call pulses; a finished call turns green; a failed call turns red.
- **Bee cloud** — one 🐝 per subagent launch (`subagent`, `subagent_fork`, `workflow`). A launched bee buzzes in flight and lands when its tool result arrives.
- **Status header** — a pulsing dot when the agent is running, a call counter, and the current turn.

## How it works

The host registers a session projection `gameView` that folds committed session events (`tool/call`, `tool/result`, `turn/start`, `turn/end`, `step/start`) into a compact scene — a bounded beat log plus per-tool and per-category counts. The projection's `wire.view` ships that scene to the Client already computed; the Client does not fold session events itself. The Client renders the scene in the `conversation.input.dock` slot.

## Notes

- Subagents are detected from `subagent`/`subagent_fork`/`workflow` tool calls in the parent session log, since subagent sessions are separate Sessions with their own logs.
- The scene is bounded (last 40 beats, last 16 bees) so a long session stays light.
- Artwork (category glyphs and accent colors) uses its own palette; the container and status colors follow the Harness theme tokens.
