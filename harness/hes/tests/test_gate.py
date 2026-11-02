from __future__ import annotations

import unittest

from hes.gate import History, TeamNecessityGate
from hes.scenarios import build_history, build_scenarios


class GateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.scenarios = {scenario.task.id: scenario for scenario in build_scenarios()}
        self.history = History(build_history())
        self.gate = TeamNecessityGate()

    def test_simple_bugfix_is_rejected_on_structure(self) -> None:
        decision = self.gate.decide(self.scenarios["simple-bugfix"].task, self.history)
        self.assertFalse(decision.use_team)
        self.assertIn("decomposability", decision.reason)

    def test_multi_file_feature_is_accepted(self) -> None:
        decision = self.gate.decide(self.scenarios["multi-file-feature"].task, self.history)
        self.assertTrue(decision.use_team)
        self.assertGreater(decision.quality_gain, 0)
        self.assertIn("team justified", decision.reason)

    def test_security_audit_is_accepted(self) -> None:
        decision = self.gate.decide(self.scenarios["security-audit"].task, self.history)
        self.assertTrue(decision.use_team)
        self.assertGreater(decision.quality_gain, 0)

    def test_research_synthesis_is_accepted(self) -> None:
        decision = self.gate.decide(self.scenarios["research-synthesis"].task, self.history)
        self.assertTrue(decision.use_team)

    def test_authority_sensitive_deploy_is_rejected(self) -> None:
        decision = self.gate.decide(self.scenarios["production-deploy"].task, self.history)
        self.assertFalse(decision.use_team)
        self.assertIn("authority-sensitive", decision.reason)

    def test_no_history_requires_pilot(self) -> None:
        decision = self.gate.decide(self.scenarios["multi-file-feature"].task)
        self.assertFalse(decision.use_team)
        self.assertTrue(decision.pilot_required)


if __name__ == "__main__":
    unittest.main()
