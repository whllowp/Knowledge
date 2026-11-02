from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from hes.compiler import MinimalTeamCompiler
from hes.ledger import EfficiencyLedger
from hes.runtime import TeamRuntime, build_graph
from hes.scenarios import build_scenarios


class RuntimeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.scenarios = {scenario.task.id: scenario for scenario in build_scenarios()}
        self.compiler = MinimalTeamCompiler()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "runtime.jsonl"
        self.scenario = self.scenarios["multi-file-feature"]
        self.compiled = self.compiler.compile_team(self.scenario.task)

    def _run(self, ratio: float):
        ledger = EfficiencyLedger(self.path)
        runtime = TeamRuntime(ledger)
        return runtime.run(
            "p2-test",
            self.scenario.task,
            self.compiled.manifest,
            self.scenario.team.roles,
            quality_base=self.scenario.team.quality,
            coordination_ratio=ratio,
        )

    def test_graph_executes_dependencies(self) -> None:
        graph = build_graph(self.compiled.manifest, self.scenario.team.roles)
        by_id = {node.id: node for node in graph.nodes}
        self.assertEqual(by_id["lead"].depends_on, ())
        self.assertEqual(by_id["worker"].depends_on, ("lead",))
        self.assertEqual(set(by_id["verifier"].depends_on), {"lead", "worker"})

    def test_runtime_emits_graph_and_ledger_facts(self) -> None:
        result = self._run(0.2)
        self.assertEqual(result.skipped, ())
        self.assertEqual(set(result.executed), {"lead", "worker", "verifier"})
        self.assertEqual(result.handoff_count, 3)
        self.assertEqual(len(result.metrics.roles), 3)
        self.assertGreater(result.vector.total_cost, 0)
        facts = [json.loads(line) for line in self.path.read_text(encoding="utf-8").splitlines()]
        types = {fact["type"] for fact in facts}
        for expected in {
            "team.run.started",
            "graph.started",
            "node.started",
            "context.fetched",
            "handoff.sent",
            "role.assigned",
            "graph.completed",
            "team.run.completed",
            "efficiency.measured",
        }:
            self.assertIn(expected, types)

    def test_tight_budget_degrades_instead_of_burning(self) -> None:
        result = self._run(0.001)
        self.assertTrue(result.degraded)
        self.assertTrue(result.skipped)
        self.assertLess(result.metrics.quality, self.scenario.team.quality)
        self.assertEqual(result.executed, ("lead",))
        self.assertGreater(result.coordination_ratio, 0.001)
        facts = [json.loads(line) for line in self.path.read_text(encoding="utf-8").splitlines()]
        types = {fact["type"] for fact in facts}
        self.assertIn("coordination.degraded", types)


if __name__ == "__main__":
    unittest.main()
