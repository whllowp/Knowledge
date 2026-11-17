---
name: dark-factory
description: "Lights-out software factory: turn a brief into shipped, tested code with zero human questions. Stages frame → design → slice → dispatch → verify → review, driven by scripts/factory.py and one worker subagent per ready packet. Use for autonomous end-to-end delivery, unattended build loops, or when the user says 黑灯工厂 / 全自动开发 / 无人值守开发."
whenToUse: "The user hands over a goal and expects finished, verified software without a question queue; or asks to run the factory on a brief, to keep a loop going unattended, or to audit what a factory run actually proved."
metadata:
  version: "1.0.0"
  process: dark-factory
---

# Dark Factory

A lights-out build loop. The human writes a brief once. The factory designs, slices, dispatches workers, verifies, reworks and reports. **It never asks a question**; every unknown becomes a recorded assumption, and anything unresolvable becomes an escalation hypothesis, not a stop.

## The contract

1. Zero questions. If information is missing, take the smallest reversible default and record it in `spec.md` under Seams/Non-goals or in the ticket Notes.
2. Evidence or it did not happen. A ticket is done only when its proof command was run and passed in this run.
3. Fail closed. Gate failures never get waived silently; the attempt budget decides between rework and escalation.
4. One packet, one worker, one attempt. Packets are immutable once handed out.
5. The report is the deliverable: it states what shipped, what is blocked, and why.

## Workspace

Inside the target repo, one directory per run:

```
.factory/<slug>/
  brief.md        the human's ask (verbatim where possible)
  spec.md         problem, solution, seams, non-goals, feature acceptance
  DESIGN.md       visual system; only for UI slices
  tickets/NN-*.md one slice each; header carries Proof, Depends on, Branch
  workers/        packet files handed to workers
  evidence/       raw gate output, committed so the proof travels with the code
  review.md       three-axis review + VERDICT
  escalation.md   blocked tickets, each with a retry hypothesis
  report/         report.md + report.json
  state.json      attempts, timings, interventions
```

Resume rule: read `.factory/<slug>/state.json` and `report.md` before acting. Never re-run a done ticket.

## Stages

| Stage | You do | Artifact | Exit |
|---|---|---|---|
| Frame | Copy the request verbatim, list observable done-criteria and constraints | `brief.md` | unknowns each carry an assumption |
| Design | Write the smallest solution shape, seams, non-goals; `DESIGN.md` if UI | `spec.md` | no placeholder seams |
| Slice | 1 ticket per tracer bullet, each with a runnable Proof command and deps | `tickets/` | `factory.py plan` prints PASS |
| Dispatch | `factory.py packet`, spawn one fresh subagent per ready packet | `workers/NN-attempt-K.md` | packets exist for the frontier |
| Verify | `factory.py verify` runs the proof command, logs evidence, rejects false passes | `evidence/` | exit 0 = done |
| Review | Three separate reviews: standards, spec, proof; never merged | `review.md` | verdict ship / rework |
| Learn | `factory.py report`; escalations get a hypothesis | `report/` | report written |

## The loop

```bash
py scripts/factory.py init   --slug <slug> --name "<name>" --tickets "A;B" --mode lite [--ui]
py scripts/factory.py plan   --slug <slug>          # must print PASS before any worker runs
py scripts/factory.py next   --slug <slug>          # ready ticket ids
py scripts/factory.py packet --slug <slug> --ticket 01   # refuses a template spec
# spawn ONE subagent per ready packet, prompt = "read the packet file and execute it"
py scripts/factory.py verify --slug <slug> --ticket 01   # ticks the boxes it proved
py scripts/factory.py block  --slug <slug> --ticket 01 --reason "..." --hypothesis "..."
py scripts/factory.py review --slug <slug> [--verdict ship|rework --notes "..."]
py scripts/factory.py report --slug <slug>
```

`--ui` is what scaffolds `DESIGN.md`; without it no design contract exists, so nothing blank gets committed.

Dispatch rule: a worker prompt is a pointer, never the payload. Send `Read <packet path> and execute it exactly. Reply with its report format.` A worker that gets the whole spec inlined will rewrite it; a worker that reads the packet acts on the packet.

When `verify` fails, do not spawn the same packet again: `packet --attempt K+1` embeds the previous gate tail, so the retry starts from the observed failure. After `max_attempts` (default 3) run `block`, keep the other tickets moving, and let the report carry the escalation.

Parallelism: up to `--workers N` packets can run at once, but only tickets with no unfinished dependency. Two workers must never write the same file; if the slices overlap, merge them into one ticket first.

## Gates (what verify enforces)

- proof command exits 0;
- a test command that exits 0 while running zero tests is a FAIL, not a pass;
- the working tree changed (a warning when it did not, because the slice may already exist);
- every attempt writes `evidence/NN-attempt-K.txt` with the command, exit code, duration and raw output.

See `references/gates.md` for the full failure taxonomy and the waiver rule.

## Review

Three prompts, three separate reviewers, never one blended verdict:

- **standards**: code quality, maintainability, no scope creep; cite file:line.
- **spec**: every acceptance criterion demonstrably met, with evidence located.
- **proof**: would the tests fail if the behavior regressed; any claim asserted without a run.

Verdict is `ship` or `rework`. `rework` sends only the failing tickets back through dispatch with a new attempt; it does not re-plan the spec.

## Hard rules

- Never call `ask_user_question`; the human sees the report, not a question.
- Never widen a ticket's Files list mid-attempt; write a new ticket instead.
- Never mark done from a worker's self-report alone; run `verify`.
- Never edit files a worker owns while it is running; wait for its report.
- Report numbers come from `report.json`, not from memory.

## Read next

| Need | Read |
|---|---|
| what each source contributed | `references/composition.md` |
| writing spec + DESIGN.md fast | `references/design.md` |
| dispatch, worktrees, parallel safety | `references/dispatch.md` |
| gate semantics + failure taxonomy | `references/gates.md` |
| escalation and knowledge capture | `references/learn.md` |
