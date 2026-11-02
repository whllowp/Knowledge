"""P2 structured Handoff protocol and bus."""

from __future__ import annotations

from dataclasses import dataclass


class HandoffValidationError(ValueError):
    pass


@dataclass(frozen=True)
class Handoff:
    id: str
    from_role: str
    to_role: str
    intent: str
    artifacts: tuple[str, ...]
    constraints: tuple[str, ...] = ()
    acceptance: tuple[str, ...] = ()
    open_questions: tuple[str, ...] = ()
    deadline_ms: int | None = None


@dataclass(frozen=True)
class HandoffRecord:
    handoff: Handoff
    tokens: int
    latency_ms: int


class HandoffProtocol:
    def __init__(self, *, require_artifacts: bool = True, max_open_questions: int = 5) -> None:
        self.require_artifacts = require_artifacts
        self.max_open_questions = max_open_questions

    def validate(self, handoff: Handoff) -> None:
        if not handoff.intent.strip():
            raise HandoffValidationError("handoff intent is empty")
        if self.require_artifacts and not handoff.artifacts:
            raise HandoffValidationError(f"handoff {handoff.id} has no artifact")
        if len(handoff.open_questions) > self.max_open_questions:
            raise HandoffValidationError(
                f"handoff {handoff.id} has {len(handoff.open_questions)} open questions "
                f"(max {self.max_open_questions})"
            )
        blocking = [question for question in handoff.open_questions if question.strip()]
        if len(blocking) > 1:
            raise HandoffValidationError(
                f"handoff {handoff.id} has {len(blocking)} blocking questions; keep at most one"
            )


class HandoffBus:
    def __init__(self, protocol: HandoffProtocol | None = None) -> None:
        self.protocol = protocol or HandoffProtocol()
        self.records: list[HandoffRecord] = []

    def send(self, handoff: Handoff) -> HandoffRecord:
        self.protocol.validate(handoff)
        tokens = 120 + 60 * len(handoff.artifacts) + 30 * len(handoff.constraints)
        tokens += 20 * len(handoff.open_questions)
        latency_ms = 2_000 + 500 * len(handoff.artifacts) + 1_000 * len(handoff.open_questions)
        record = HandoffRecord(handoff=handoff, tokens=tokens, latency_ms=latency_ms)
        self.records.append(record)
        return record

    @property
    def total_tokens(self) -> int:
        return sum(record.tokens for record in self.records)

    @property
    def total_latency_ms(self) -> int:
        return sum(record.latency_ms for record in self.records)

    @property
    def count(self) -> int:
        return len(self.records)
