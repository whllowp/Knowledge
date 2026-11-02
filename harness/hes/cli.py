"""CLI: run the deterministic P0/P1 reference scenarios."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .compiler import MinimalTeamCompiler
from .gate import History, TeamNecessityGate
from .ledger import EfficiencyLedger
from .scenarios import build_history, build_scenarios


def run(ledger_path: Path | str | None = None, as_json: bool = False) -> list[dict[str, Any]]:
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

    summary = ledger.flush_summary()
    if as_json:
        print(json.dumps({"results": results, "summary": str(summary) if summary else None}, ensure_ascii=False, indent=2))
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
    if summary:
        print(f"ledger: {ledger.path}")
        print(f"summary: {summary}")
    return results


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="HES P0/P1 reference prototype")
    parser.add_argument("--ledger", default=None, help="write append-only efficiency facts to this JSONL path")
    parser.add_argument("--json", action="store_true", help="print machine-readable JSON")
    args = parser.parse_args(argv)
    run(args.ledger, args.json)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
