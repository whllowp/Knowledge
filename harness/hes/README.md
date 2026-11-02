# HES P0/P1/P2/P3 Reference Prototype

Review of the design's 0–4 and 8–9 sections: [`REVIEW.md`](REVIEW.md).

This is the smallest executable slice of [HES](../harness-engineering-system.md):

- **P0**: efficiency ledger + `EfficiencyVector` (model / tool / coordination / wait / rework / human cost).
- **P1**: Team Necessity Gate + Minimal Team Compiler.
- **P2**: deterministic TeamRun/GraphRun scheduler + Context Bus + structured Handoff + Coordination Budget.
- **P3**: TeamBench subset with hidden tests + real Codex Agent execution inside the TeamRun nodes.

P0–P2 are deterministic and dependency-free. P3 shells out to the installed
Codex CLI and therefore needs a working Codex auth/model with quota. The
synthetic scenario numbers in `scenarios.py` are not benchmark results.

## Run

From `harness/`:

```bash
python -m hes
python -m hes --json
python -m hes --ledger runs/hes-demo.jsonl
python -m hes --p2 --ledger runs/hes-p2-demo.jsonl
python -m hes --p2 --coordination-ratio 0.005 --ledger runs/hes-tight.jsonl

# P3: real Codex agent calls, hidden tests, ledger
python -m hes.team_bench --task slugify --work-root runs/team-bench --ledger runs/team-bench/ledger.jsonl
```

For P3, the default model is `gpt-6.1-sol`; override with `HES_CODEX_MODEL`.
The run requires Codex CLI auth and available quota. See
[`team_bench/REAL_RUN.md`](team_bench/REAL_RUN.md) for the captured run
(7/7 hidden checks; verifier skipped on a 402 quota error).

When `--ledger` is set, the prototype writes append-only facts to the JSONL path and a derived `efficiency_summary.jsonl` next to it.

## Test

```bash
python -m unittest discover -s hes/tests -t . -v
```

## What is implemented

| Piece | File | Behavior |
| --- | --- | --- |
| Task profile | `models.py` | decomposability, parallelism, verification, capabilities, latency/authority sensitivity |
| Role / team manifest | `models.py` | roles, lead, handoff edges, coordination cap |
| Cost model | `models.py` | normalized cost breakdown |
| Efficiency vector | `models.py` | quality, total cost, COR, UWR, CDR, rework |
| Necessity gate | `gate.py` | single vs team, based on history + structural fit + quality/cost ratio |
| Minimal compiler | `compiler.py` | lead + worker + verifier + specialists only for uncovered capabilities |
| Ledger | `ledger.py` | append-only JSONL facts + derived summary |
| Scenarios | `scenarios.py` | simple bugfix, multi-file feature, security audit, research synthesis, authority-sensitive deploy |
| Graph runtime | `runtime.py` | topological node scheduler, node/role metrics, graph facts |
| Context bus | `context_bus.py` | shared artifacts, per-role fetch accounting, duplication ratio |
| Handoff | `handoff.py` | structured handoff validation and token/latency accounting |
| Coordination budget | `coordination.py` | cap + warn/exceeded + degrade/stop decision |
| TeamBench suite | `team_bench/suite.py` | 2 tasks, workspace seeds, hidden tests outside the workspace |
| Real agent executor | `team_bench/executor.py` | Codex CLI per node; token/wall parsing; failure/timeout handling |
| TeamBench runner | `team_bench/runner.py` | real TeamRun → hidden test → quality → ledger aggregate |
| CLI | `cli.py` / `team_bench/__main__.py` | human-readable and JSON output |

## What is deliberately not implemented

- Production GraphEngine, Mandate/effect-gate wiring, tool sandbox.
- A statistically meaningful TeamBench; the current suite has 2 tiny tasks.
- Meta-Harness search loop / Pareto promotion (P4).
- Canary/rollback and policy/Mandate integration.
- Precise attribution of team quality to individual roles.
- Full sync/merge/status overhead accounting; P2/P3 count handoff tokens and context duplication.
- Hard isolation between the agent workspace and hidden tests; the current
  prototype relies on path separation, not a security boundary.

Those are P4+ or production integration work. The purpose here is to make the
decisions, runtime events, real-agent execution, and measurements concrete and
testable before adding search and production complexity.
