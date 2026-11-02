from __future__ import annotations

import unittest

from hes.handoff import Handoff, HandoffBus, HandoffProtocol, HandoffValidationError


class HandoffTests(unittest.TestCase):
    def test_valid_handoff_records_cost(self) -> None:
        bus = HandoffBus()
        record = bus.send(
            Handoff(
                id="lead->worker",
                from_role="lead",
                to_role="worker",
                intent="implement the change",
                artifacts=("artifact-lead",),
            )
        )
        self.assertGreater(record.tokens, 0)
        self.assertGreater(record.latency_ms, 0)
        self.assertEqual(bus.count, 1)

    def test_handoff_requires_artifact(self) -> None:
        bus = HandoffBus()
        with self.assertRaises(HandoffValidationError):
            bus.send(
                Handoff(
                    id="lead->worker",
                    from_role="lead",
                    to_role="worker",
                    intent="implement the change",
                    artifacts=(),
                )
            )

    def test_handoff_allows_one_blocking_question(self) -> None:
        bus = HandoffBus()
        bus.send(
            Handoff(
                id="worker->verifier",
                from_role="worker",
                to_role="verifier",
                intent="verify the change",
                artifacts=("artifact-worker",),
                open_questions=("should this be breaking?",),
            )
        )
        with self.assertRaises(HandoffValidationError):
            HandoffProtocol().validate(
                Handoff(
                    id="bad",
                    from_role="worker",
                    to_role="verifier",
                    intent="verify",
                    artifacts=("artifact-worker",),
                    open_questions=("q1", "q2"),
                )
            )


if __name__ == "__main__":
    unittest.main()
