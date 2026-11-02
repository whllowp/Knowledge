from __future__ import annotations

import unittest

from hes.context_bus import Artifact, ContextBus


class ContextBusTests(unittest.TestCase):
    def test_fetch_reports_unique_tokens_and_duplication(self) -> None:
        bus = ContextBus()
        bus.put(Artifact("a", "x" * 100, "lead"))
        bus.put(Artifact("b", "y" * 200, "lead"))
        first = bus.fetch("worker", ("a", "b"))
        self.assertEqual(first.tokens, 75)
        self.assertEqual(first.unique_tokens, 75)
        self.assertEqual(first.cache_hits, 0)
        second = bus.fetch("worker", ("a", "b"))
        self.assertEqual(second.tokens, 75)
        self.assertEqual(second.unique_tokens, 0)
        self.assertEqual(second.cache_hits, 2)
        self.assertAlmostEqual(bus.duplication_ratio, 0.5, places=3)

    def test_fetch_deduplicates_within_one_request(self) -> None:
        bus = ContextBus()
        bus.put(Artifact("a", "x" * 100, "lead"))
        fetch = bus.fetch("worker", ("a", "a"))
        self.assertEqual(fetch.tokens, 50)
        self.assertEqual(fetch.unique_tokens, 25)
        self.assertEqual(fetch.cache_hits, 1)

    def test_fetch_truncates_at_budget(self) -> None:
        bus = ContextBus()
        bus.put(Artifact("big", "x" * 400, "lead"))
        bus.put(Artifact("small", "y" * 40, "lead"))
        fetch = bus.fetch("worker", ("big", "small"), max_tokens=100)
        self.assertTrue(fetch.truncated)
        self.assertEqual(fetch.artifact_ids, ("big",))


if __name__ == "__main__":
    unittest.main()
