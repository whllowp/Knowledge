---
name: sdd
description: "Spec-Driven Delivery: an evidence-gated workflow turning a request into shipped, verified software through six gates (frame, specify, decompose, build, verify, ship-learn). Use for any non-trivial feature, bug, refactor or migration; when the user asks for a spec, plan, tickets or proof; or says 走 SDD / 用 SDD 流程 / 写规格 / 拆票 / 规格驱动. Ships a helper script for scaffolding, evidence runs, gate checks and reviewer prompts."
whenToUse: "User asks to plan or build something spanning more than one file or one session, asks for a spec / design doc / ticket breakdown / acceptance evidence, or wants work that survives a context reset. Not for one-line edits, pure questions, or chores already covered by a narrower skill."
metadata:
  version: "2.0.0"
  process: "SDD v2"
  sources: "composable engineering skills + operating knowledge system"
---

# SDD: Spec-Driven Delivery

SDD is a delivery method, not a document generator. Six gates; each yields one artifact and one piece of proof, and the next gate waits for both. "Done" means a command ran and its output was recorded; a fresh agent resumes from disk, not from memory. Delivery spine (spec, tracer-bullet tickets, DAG frontier, TDD at agreed seams, three-axis review, fresh subagents) fused with the honesty spine (ledgers, resolve-before-asking, measure-before-fix, destructive gates, decisions with provenance). Precedence on conflict: `references/charter.md`.

## Modes

| Mode | Use when | Artifacts |
|---|---|---|
| `lite` | one vertical slice, one session | one ticket carrying a short spec + the ledger |
| `standard` | default; multi-file, reviewed before merge | full `.sdd/<slug>/` tree |
| `wayfinder` | destination unclear or larger than a session | decision map, collapse to `standard` |

When in doubt: `standard`.

## Workspace

`.sdd/<slug>/`: `brief.md` (G0), `spec.md` (G1), `tickets/NN-*.md` (G2), `decisions/NNNN-*.md`, `evidence.md` + `evidence/` (G3, git-ignored), `review.md` (G4), `pr.md`, `retro.md` (G5), `waivers.md`, `.mode`.

Resume at the highest gate whose acceptance line exists. Never redo one; never infer acceptance from a file existing.

## Six gates

| Gate | Do | Artifact | Exit (fail closed) | Human |
|---|---|---|---|---|
| G0 Frame | resolve by inspection; problem, actor, success, non-goals, owners | `brief.md` | no TBD; every question resolved or owned | user-owned choices |
| G1 Specify | problem, solution, stories, decisions, seams, out of scope | `spec.md` | sections filled; seams agreed; decisions reasoned | yes: seams + scope |
| G2 Decompose | tracer-bullet tickets with blocking edges; frontier | `tickets/` | acyclic DAG; checkable criteria; one context each | no |
| G3 Build | frontier ticket; red-green-refactor; prove | commits + ledger rows | failing-first or waiver; command + observation per criterion | no |
| G4 Verify | Standards, Spec, Proof on a fixed point | `review.md` | verdict + full coverage; regressions discriminate | deferrals only |
| G5 Ship & Learn | PR body, retro, decisions, memory | `pr.md`, `retro.md` | before/after evidence; merge danger stated | merge/ship |

An unsatisfiable gate stops the work and records why. It is waived in `waivers.md`, never silently skipped.

## Helper script

`scripts/sdd.py` (Python 3, no dependencies) performs the writes you would otherwise do by hand: one gate costs one command. Optional; the manual equivalent is in `references/operations.md`.

```bash
python scripts/sdd.py init   --slug <slug> --name "<title>" --mode lite
python scripts/sdd.py run    --slug <slug> --ticket 01 --criterion "<c>" --label red -- <cmd>
python scripts/sdd.py check  --slug <slug> [--gate G3]
python scripts/sdd.py finish --slug <slug> --ticket 01 --message "<commit msg>" --verdict ship --retro "<one line>" -- <final proof cmd>
python scripts/sdd.py next   --slug <slug>
python scripts/sdd.py review --slug <slug> --fixed-point <ref>
python scripts/sdd.py ask    --slug <slug>
```

`run` writes the log, appends the ledger row, prints the observation, returns the exit code. `check` exits 1 on the first unsatisfied assertion. `finish` re-runs the final proof first (a failing proof leaves the ticket open), then marks the ticket done, records the verdict and retro, commits, and re-checks every gate. `review` refuses a missing ref or empty diff and writes the three reviewer prompts. `bench` and `doctor` report cost and install drift.

## Invariants

1. **Evidence or it did not happen.** No command, no claim; green CI is not proof.
2. **Resolve before asking.** Repo, docs, history, memory first; then ask with a hypothesis and 2-4 options.
3. **Pointers over payloads.** Paths and commit hashes, not pasted context; one fact, one artifact.
4. **Fresh context per unit.** A subagent inheriting the parent's context was copied, not delegated.
5. **Fail closed.** Missing artifact, ambiguity, unreproducible proof: stop and record.
6. **Measure before you fix.** Capture the failing measurement first.
7. **Destructive means gated.** Deletes, migrations, force pushes, spend: scoped consent.
8. **Verify after acting.** Read back every mutation; say when you cannot.
9. **Small artifacts, one owner.** Intent in spec, scope in tickets, proof in ledger, rationale in decisions.
10. **The process is editable.** Friction goes to `retro.md`, then into this skill; delete rules that never fire.

## Hard rules

- One vertical slice per ticket; a horizontal-layer ticket is a decomposition defect.
- Acceptance criteria are commands, not adjectives.
- No paths or code in the spec except a snippet trimmed to the decision it encodes.
- Never merge the three review axes; each finding gets its own verdict.
- Redact secrets and personal data before commit.
- Stop and ask when scope would change, an action is irreversible, requirements contradict, credentials are missing, or the decision is the user's.

## Read next

| Need | File |
|---|---|
| Why, precedence, decisions, glossary | `references/charter.md`, `references/knowledge.md` |
| G0 framing, lookup chain, sizing | `references/frame.md` |
| G1 spec sections, seams, assumptions | `references/specify.md` |
| G2 tracer bullets, blocking edges, frontier | `references/decompose.md` |
| G3 TDD loop, evidence capture, worktrees | `references/build.md` |
| G4 three axes, fixed point, verdicts | `references/verify.md` |
| G5 PR, retro, memory writeback | `references/ship-learn.md` |
| Ledger schema, discrimination, redaction | `references/evidence.md` |
| Resume, waivers, stop rules, failures | `references/operations.md` |
| Single-slice playbook | `references/lite.md` |

## Closing report

Report the gate reached, the artifact that opened it, its evidence, what remains, and the one decision you need. If done: which ticket closed, which command proved it, where the review landed.
