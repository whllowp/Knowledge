# Composition: where each source lives in the factory

Four sources were merged. Nothing here is "inspired by"; each row is a concrete part of the harness.

| Source | What was taken | Where it lives |
|---|---|---|
| andrej-karpathy-skills (`skills/karpathy-guidelines`) | Think before coding; minimum code; surgical changes; goal-driven execution | `assets/ticket.md` forces one seam + explicit Files; `packet` template carries the four rules into every worker; acceptance criteria are written as commands, not adjectives |
| gbrain-whllow | evidence-or-it-did-not-happen; fail-closed gates; resolve-before-asking; measure-before-fix; typed failure -> fix -> verify; typed memory | `factory.py verify` (evidence file + exit code), zero-test false-pass rejection, `escalation.md` hypothesis format, `report.json` metrics, lessons in `learn.md` |
| stitch-skills (`design-md`, `stitch-loop`) | semantic DESIGN.md as the source of truth for visual work; baton loop with one page per iteration and a next-prompt handoff | `DESIGN.md` template + design stage; one packet per slice, attempt feedback appended to the next packet (the baton) |
| skills-main (Matt Pocock chain) | to-spec seven sections; tracer-bullet tickets with dependency edges; fresh-context subagents; pointer-not-payload; three-axis review that is never merged; retro/pr | `spec.md` sections; ticket DAG + frontier in `factory.py plan/next`; dispatch rule; `factory.py review` writes three separate prompts; report is the retro |

## What this buys

- **karpathy** keeps workers from over-building: the Files list and proof command make a diff auditable line by line.
- **gbrain** makes the loop honest: a run that did not execute the proof cannot claim done, and a failure carries the output that produced it.
- **stitch** makes design a first-class stage instead of an afterthought, and gives the loop a baton so attempt K+1 inherits attempt K's failure.
- **skills-main** supplies the decomposition and review discipline: tracer bullets, DAG frontier, fresh contexts, unmerged review axes.

## What was deliberately dropped

- Stitch MCP calls (needs a Google project); the factory uses DESIGN.md as the contract and leaves rendering checks to the optional screenshot gate.
- gbrain's vector index and CLI (needs a running brain); lessons stay in the repo as `knowledge.md` lines with a source.
- Multi-agent swarms: the factory dispatches one worker per ready slice, capped by `--workers`, because shared-file contention is the dominant failure mode.
