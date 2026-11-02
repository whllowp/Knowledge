from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from hes.ledger import EfficiencyLedger
from hes.models import CostModel
from hes.scenarios import build_scenarios


class LedgerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.scenarios = {scenario.task.id: scenario for scenario in build_scenarios()}
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "ledger.jsonl"

    def test_vector_ranges_and_ratios(self) -> None:
        scenario = self.scenarios["multi-file-feature"]
        ledger = EfficiencyLedger(self.path)
        vector = ledger.record_run(scenario.task.id, scenario.task, scenario.team, CostModel())
        self.assertGreater(vector.total_cost, 0)
        self.assertGreaterEqual(vector.quality, 0)
        self.assertLessEqual(vector.quality, 1)
        self.assertGreaterEqual(vector.coordination_overhead_ratio, 0)
        self.assertLessEqual(vector.coordination_overhead_ratio, 1)
        self.assertGreaterEqual(vector.useful_work_ratio, 0)
        self.assertLessEqual(vector.useful_work_ratio, 1)
        self.assertGreaterEqual(vector.context_duplication_ratio, 0)
        self.assertLessEqual(vector.context_duplication_ratio, 1)
        self.assertAlmostEqual(vector.coordination_overhead_ratio, 8_000 / 57_000, places=3)
        self.assertAlmostEqual(vector.context_duplication_ratio, 0.2, places=3)

    def test_ledger_writes_facts_and_summary(self) -> None:
        scenario = self.scenarios["multi-file-feature"]
        ledger = EfficiencyLedger(self.path)
        ledger.record_run(scenario.task.id, scenario.task, scenario.team, CostModel())
        summary = ledger.flush_summary()
        self.assertIsNotNone(summary)
        self.assertTrue(summary.exists())
        facts = [json.loads(line) for line in self.path.read_text(encoding="utf-8").splitlines()]
        types = {fact["type"] for fact in facts}
        self.assertIn("team.run.started", types)
        self.assertIn("role.assigned", types)
        self.assertIn("team.run.completed", types)
        self.assertIn("efficiency.measured", types)
        self.assertEqual(len(summary.read_text(encoding="utf-8").splitlines()), 1)

    def test_team_costs_more_than_single_for_feature(self) -> None:
        scenario = self.scenarios["multi-file-feature"]
        model = CostModel()
        ledger = EfficiencyLedger(self.path)
        single = ledger.record_run("single", scenario.task, scenario.single, model)
        team = ledger.record_run("team", scenario.task, scenario.team, model)
        self.assertGreater(team.total_cost, single.total_cost)


if __name__ == "__main__":
    unittest.main()
