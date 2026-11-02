"""CLI: run the deterministic P0/P1 reference scenarios."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .compiler import MinimalTeamCompiler
from .gate import History, TeamNecessityGate
from .ledger import EfficiencyLedger
from .runtime import TeamRuntime
from .scenarios import build_history, build_scenarios


def run(
    ledger_path: Path | str | None = None,
    as_json: bool = False,
    p2: bool = False,
    coordination_ratio: float = 0.2,
) -> list[dict[str, Any]]:
    scenarios = build_scenarios()
    history = History(build_history(scenarios))
    gate = TeamNecessityGate()
    compiler = MinimalTeamCompiler()
    ledger = EfficiencyLedger(ledger_path)

    results: list[dict[str, Any]] = []
    for scenario in scenarios:
        decision = gate.decide(scenario.task, history)
        if decision.pilot_required:
            results.append(
                {
                    "task": scenario.task.id,
                    "mode": "pilot",
                    "decision": decision.reason,
                }
            )
            continue

        compiled = compiler.compile_team(scenario.task) if decision.use_team else compiler.compile_single(scenario.task)
        run = scenario.team if decision.use_team else scenario.single
        warnings = list(compiled.warnings)
        if decision.use_team and set(compiled.role_names) != set(scenario.expected_team_roles):
            warnings.append(
                f"compiled roles {compiled.role_names} != expected {scenario.expected_team_roles}"
            )
        vector = ledger.record_run(scenario.task.id, scenario.task, run)
        results.append(
            {
                "task": scenario.task.id,
                "task_class": scenario.task.task_class,
                "mode": "team" if decision.use_team else "single",
                "decision": decision.reason,
                "quality_gain": decision.quality_gain,
                "team_premium": decision.team_premium,
                "roles": list(compiled.role_names),
                "edges": [list(edge) for edge in compiled.manifest.edges],
                "warnings": warnings,
                "vector": vector.to_dict(),
            }
        )

    p2_results: list[dict[str, Any]] = []
    if p2:
        runtime = TeamRuntime(ledger)
        for scenario in scenarios:
            decision = gate.decide(scenario.task, history)
            if not decision.use_team:
                continue
            compiled = compiler.compile_team(scenario.task)
            result = runtime.run(
                f"p2-{scenario.task.id}",
                scenario.task,
                compiled.manifest,
                scenario.team.roles,
                quality_base=scenario.team.quality,
                coordination_ratio=coordination_ratio,
            )
            p2_results.append(
                {
                    "run": f"p2-{scenario.task.id}",
                    "task": scenario.task.id,
                    "graph": result.graph_id,
                    "executed": list(result.executed),
                    "skipped": list(result.skipped),
                    "degraded": result.degraded,
                    "coordination_ratio": result.coordination_ratio,
                    "context_duplication_ratio": result.context_duplication_ratio,
                    "handoffs": result.handoff_count,
                    "vector": result.vector.to_dict(),
                }
            )

        # A deliberately tight budget shows the gate degrading instead of burning.
        tight = next(scenario for scenario in scenarios if scenario.task.id == "multi-file-feature")
        tight_compiled = compiler.compile_team(tight.task)
        tight_result = runtime.run(
            "p2-multi-file-feature-tight",
            tight.task,
            tight_compiled.manifest,
            tight.team.roles,
            quality_base=tight.team.quality,
            coordination_ratio=0.005,
        )
        p2_results.append(
            {
                "run": "p2-multi-file-feature-tight",
                "task": tight.task.id,
                "graph": tight_result.graph_id,
                "executed": list(tight_result.executed),
                "skipped": list(tight_result.skipped),
                "degraded": tight_result.degraded,
                "coordination_ratio": tight_result.coordination_ratio,
                "context_duplication_ratio": tight_result.context_duplication_ratio,
                "handoffs": tight_result.handoff_count,
                "vector": tight_result.vector.to_dict(),
            }
        )

    summary = ledger.flush_summary()
    if as_json:
        print(
            json.dumps(
                {
                    "results": results,
                    "p2": p2_results,
                    "summary": str(summary) if summary else None,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return results

    print("HES P0/P1 reference run (synthetic, no LLM calls)\n")
    for result in results:
        print(f"=== {result['task']} ({result.get('task_class', '-')}) ===")
        print(f"mode: {result['mode']}")
        print(f"decision: {result['decision']}")
        if "roles" in result:
            print(f"roles: {', '.join(result['roles'])}")
        vector = result.get("vector", {})
        if vector:
            print(
                "efficiency: "
                f"quality={vector['quality']:.2f} "
                f"cost={vector['total_cost']:.2f} "
                f"cor={vector['coordination_overhead_ratio']:.2%} "
                f"uwr={vector['useful_work_ratio']:.2%} "
                f"cdr={vector['context_duplication_ratio']:.2%} "
                f"rework={vector['rework_ratio']:.2%}"
            )
        for warning in result.get("warnings", []):
            print(f"warning: {warning}")
        print()

    if p2_results:
        print("P2 TeamRun / GraphRun (real scheduler, synthetic node work)\n")
        for result in p2_results:
            print(f"=== {result['run']} ===")
            print(f"executed: {', '.join(result['executed']) or '-'}")
            print(f"skipped: {', '.join(result['skipped']) or '-'}")
            print(
                "coordination: "
                f"ratio={result['coordination_ratio']:.2%} "
                f"degraded={result['degraded']} "
                f"handoffs={result['handoffs']}"
            )
            vector = result["vector"]
            print(
                "efficiency: "
                f"quality={vector['quality']:.2f} "
                f"cost={vector['total_cost']:.2f} "
                f"cor={vector['coordination_overhead_ratio']:.2%} "
                f"uwr={vector['useful_work_ratio']:.2%} "
                f"cdr={result['context_duplication_ratio']:.2%}"
            )
            print()

    if summary:
        print(f"ledger: {ledger.path}")
        print(f"summary: {summary}")
    return results


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="HES P0/P1 reference prototype")
    parser.add_argument("--ledger", default=None, help="write append-only efficiency facts to this JSONL path")
    parser.add_argument("--json", action="store_true", help="print machine-readable JSON")
    parser.add_argument("--p2", action="store_true", help="run the P2 TeamRun/GraphRun runtime")
    parser.add_argument(
        "--coordination-ratio",
        type=float,
        default=0.2,
        help="max coordination tokens / planned team tokens (default 0.2)",
    )
    args = parser.parse_args(argv)
    run(args.ledger, args.json, args.p2, args.coordination_ratio)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
