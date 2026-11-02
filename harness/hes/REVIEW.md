# HES 0–4 / 8–9 Review

> 2026-11-03 · reviewed against [`harness-engineering-system.md`](../harness-engineering-system.md)

## Verdict

Direction is sound. The problem definition, cost model, three gates, and efficiency-aware search are coherent enough to start P0/P1. The first executable slice is in this directory.

This review does **not** claim that AgentTeam efficiency has been empirically improved. P0/P1 are decision and accounting foundations; P2–P4 remain.

## Scope

Reviewed:

- 0 结论
- 1 Meta-Harness 解剖
- 2 五套体系对比
- 3 AgentTeam 效率问题
- 4 HES 总体设计
- 8 度量与实验
- 9 路线图

Also checked 5–7 and 10 for consistency with the above.

## Strengths

1. **The problem is framed as coordination economics**, not “more agents”. The `C_coord / C_wait / C_rework` split is the right unit of analysis.
2. **Single-agent-first** is a real architectural constraint, not a slogan; it prevents the most common failure mode (over-teaming).
3. **Team premium vs quality gain** gives the gate an auditable decision rule.
4. **Meta-Harness’s discipline is preserved**: hidden test, trusted evaluator, Pareto, budget, anti-overfitting, mechanism-level mutation.
5. **The runtime and governance layers are separated**: TeamHarness is a Registry artifact; it compiles to TeamManifest/TeamRun and cannot declare authority.
6. **The roadmap order is correct**: measure → decide → runtime → search → compounding.

## Findings and resolutions

| # | Finding | Severity | Resolution |
| --- | --- | --- | --- |
| F1 | `E = Q / C` can be misread as a cross-task-class absolute score | Medium | Doc now states E is only comparable within a task class and evaluation protocol |
| F2 | `QG / TP` is ambiguous when team premium is negative | Medium | Doc now uses `QG ≥ 0 and (TP ≤ 0 or QG / TP ≥ λ)` |
| F3 | Metrics were defined but not computable from a concrete record | High | `models.py` defines `RunMetrics` + `EfficiencyVector`; `ledger.py` emits facts |
| F4 | Gate behavior without history was unspecified | High | Gate returns `pilot_required=True`; no silent team default |
| F5 | Compiler had no size/edge budget enforcement | Medium | `CompilerPolicy` caps roles and warns on edge overflow |
| F6 | Rework ratio had no denominator in the data model | Low | `RunMetrics.artifacts_total` added; ratio uses it |
| F7 | “30+ tasks” is too large for the first executable slice | Medium | Prototype uses 5 synthetic scenarios; a real suite remains a P0 exit criterion |
| F8 | TeamHarness could look like a new domain concept | Low | Doc states it is a Registry artifact that compiles to TeamManifest/TeamRun |

## What the P0/P1 prototype covers

- **P0**: `RunMetrics` → `EfficiencyVector`; append-only JSONL facts; derived `efficiency_summary.jsonl`.
- **P1**: Team Necessity Gate with structural checks + history baseline + team premium; Minimal Team Compiler with capability coverage, lead/worker/verifier defaults, specialist insertion, size cap, edge budget.
- **Scenarios**: simple bugfix (single), multi-file feature (team), security audit (team + specialist), research synthesis (5 roles), authority-sensitive deploy (single + human gate).

## Validation

- `python -m unittest discover -s hes/tests -t . -v` → 14 tests, exit 0.
- `python -m hes --ledger runs/hes-demo.jsonl` → 5 decisions; 46 ledger facts; 5 summary vectors.
- `python -m hes --json` → 5 results, JSON parseable.

## What remains open

- Real TeamBench and hidden test runner.
- Attribution of team quality to individual roles.
- Runtime integration with GraphEngine / Mandate / effect gates.
- Canary/rollback and policy integration.
- Search loop (P3) and team performance library (P4).
- Precise pricing of human attention and coordination.
