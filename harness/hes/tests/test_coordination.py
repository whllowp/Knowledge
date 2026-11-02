from __future__ import annotations

import unittest

from hes.coordination import CoordinationBudget, CoordinationPolicy


class CoordinationTests(unittest.TestCase):
    def test_warn_then_exceed(self) -> None:
        budget = CoordinationBudget(1_000, CoordinationPolicy(max_ratio=0.1, warn_ratio=0.8))
        self.assertEqual(budget.record(50), "ok")
        self.assertEqual(budget.record(35), "warn")
        self.assertEqual(budget.record(20), "exceeded")
        self.assertTrue(budget.degraded)
        self.assertEqual(budget.action, "degrade")

    def test_stop_action(self) -> None:
        budget = CoordinationBudget(1_000, CoordinationPolicy(max_ratio=0.1, on_exceed="stop"))
        budget.record(101)
        self.assertTrue(budget.degraded)
        self.assertEqual(budget.action, "stop")


if __name__ == "__main__":
    unittest.main()
