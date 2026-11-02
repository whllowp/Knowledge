from __future__ import annotations

import argparse
from pathlib import Path

from ..ledger import EfficiencyLedger
from .runner import TeamBenchRunner
from .suite import build_suite


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run a real-agent TeamBench subset")
    parser.add_argument("--task", default="slugify", help="task id, or 'all'")
    parser.add_argument("--work-root", default="runs/team-bench")
    parser.add_argument("--ledger", default="runs/team-bench/ledger.jsonl")
    parser.add_argument("--coordination-ratio", type=float, default=0.2)
    args = parser.parse_args(argv)

    suite = build_suite()
    selected = suite if args.task == "all" else tuple(task for task in suite if task.id == args.task)
    if not selected:
        parser.error(f"unknown task {args.task!r}; choose from {[task.id for task in suite]} or 'all'")

    ledger = EfficiencyLedger(args.ledger)
    runner = TeamBenchRunner(ledger, coordination_ratio=args.coordination_ratio)
    results = []
    for task in selected:
        print(f"=== running {task.id} with real Codex agent ===", flush=True)
        result = runner.run_task(task, args.work_root)
        results.append(result)
        print(f"executed: {', '.join(result.runtime.executed) or '-'}")
        print(f"skipped: {', '.join(result.runtime.skipped) or '-'}")
        print(
            f"hidden: {result.hidden.passed}/{result.hidden.total} "
            f"score={result.hidden.score:.2f}"
        )
        print(
            "efficiency: "
            f"quality={result.vector.quality:.2f} "
            f"cost={result.vector.total_cost:.2f} "
            f"cdr={result.vector.context_duplication_ratio:.2%}"
        )
        print(f"workspace: {result.workspace}")
        print()

    summary = ledger.flush_summary()
    print(f"ledger: {ledger.path}")
    print(f"summary: {summary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
