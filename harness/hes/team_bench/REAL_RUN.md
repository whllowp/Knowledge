# TeamBench Real Run — slugify

> 2026-11-03 (Asia/Shanghai) · one run, not a benchmark result

## Setup

- Agent: Codex CLI `0.137.0`, model `gpt-6.1-sol`, reasoning effort `low`
- Task: `slugify` (7 hidden checks)
- Runtime: P3 `TeamBenchRunner` → P2 `TeamRun`/`GraphRun` → real `CodexNodeExecutor`
- Hidden test: outside the agent workspace, run only after the team run
- Ledger: `runs/team-bench/ledger.jsonl` (gitignored)

## Result

| Item | Value |
| --- | --- |
| Hidden test | **7/7, score 1.00** |
| Executed nodes | `lead`, `worker` |
| Skipped nodes | `verifier` |
| Lead tokens / wall | 38,636 / 97.7 s |
| Worker tokens / wall | 16,357 / 168.8 s |
| Handoffs | 3 |
| Handoff latency | 7,500 ms |
| Normalized cost | 55.088 (cost units, not USD) |
| Context duplication | 49.05% |
| Coordination overhead | 0.98% |

Artifacts: `runs/team-bench/slugify/plan.md`, `runs/team-bench/slugify/solution.py`.

## Why the verifier was skipped

The verifier call failed with the provider error:

```text
unexpected status 402 Payment Required: 账户余额不足 ...
```

The failure was recorded as `node.failed`; the runtime skipped the remaining
node instead of burning retries. The worker's `solution.py` still passed all
hidden tests, so the team run scored 1.0 without the verifier stage.

This is an **external quota failure**, not a verifier judgement. It is useful
evidence that the graph/failure/budget path works, but it means this run is not
a clean three-role team result.

## Caveats

- One task, one run: no statistical claim.
- Hidden tests are outside the workspace, but Codex sandbox reads are not a
  hardened isolation boundary; a determined agent could still search parent
  paths. This is a prototype, not a production evaluator.
- Cost is normalized; it is not the provider's invoice.
- The verifier did not run; the 7/7 score is the worker's solution.
