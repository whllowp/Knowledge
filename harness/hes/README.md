# HES P0/P1 Reference Prototype

Review of the design's 0–4 and 8–9 sections: [`REVIEW.md`](REVIEW.md).

This is the smallest executable slice of [HES](../harness-engineering-system.md):

- **P0**: efficiency ledger + `EfficiencyVector` (model / tool / coordination / wait / rework / human cost).
- **P1**: Team Necessity Gate + Minimal Team Compiler.

It is intentionally **deterministic and dependency-free**. It does not call an LLM, run real agents, or claim benchmark results. The numbers in `scenarios.py` are synthetic examples used to exercise the decision and accounting logic.

## Run

From `harness/`:

```bash
python -m hes
python -m hes --json
python -m hes --ledger runs/hes-demo.jsonl
```

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
| CLI | `cli.py` | human-readable and JSON output |

## What is deliberately not implemented

- Real agent execution, LLM calls, tool sandbox, GraphEngine runtime.
- TeamBench, hidden test runner, Meta-Harness search loop.
- Canary/rollback and policy/Mandate integration.
- Precise attribution of team quality to individual roles.

Those are P2–P4 in the roadmap. The purpose here is to make the P0/P1 decisions and measurements concrete and testable before adding runtime complexity.
