"""P2 Coordination Budget.

Tracks coordination tokens against the planned team token budget. When the
ratio crosses the cap, the runtime degrades (skips remaining non-critical
nodes) or stops. The decision is explicit and recorded, not hidden in a retry.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CoordinationPolicy:
    max_ratio: float = 0.2
    warn_ratio: float = 0.8
    on_exceed: str = "degrade"  # degrade | stop


class CoordinationBudget:
    def __init__(self, planned_total_tokens: int, policy: CoordinationPolicy | None = None) -> None:
        self.policy = policy or CoordinationPolicy()
        self.planned_total_tokens = max(1, planned_total_tokens)
        self.max_coordination_tokens = max(1, int(self.planned_total_tokens * self.policy.max_ratio))
        self.coordination_tokens = 0
        self.status = "ok"  # ok | warn | exceeded

    def record(self, tokens: int) -> str:
        self.coordination_tokens += max(0, tokens)
        ratio = self.coordination_tokens / self.planned_total_tokens
        if ratio >= self.policy.max_ratio:
            self.status = "exceeded"
        elif ratio >= self.policy.max_ratio * self.policy.warn_ratio:
            self.status = "warn"
        return self.status

    @property
    def ratio(self) -> float:
        return self.coordination_tokens / self.planned_total_tokens

    @property
    def degraded(self) -> bool:
        return self.status == "exceeded"

    @property
    def action(self) -> str:
        return self.policy.on_exceed if self.degraded else "continue"
