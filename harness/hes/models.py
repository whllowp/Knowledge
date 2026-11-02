"""Core data models for the HES P0/P1 reference prototype.

The prototype is deliberately dependency-free and deterministic. It models the
efficiency ledger and the team-necessity / minimal-team decisions; it does not
call an LLM or execute real agents.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class Budget:
    """A normalized budget. Costs are estimates, not billing records."""

    tokens: int = 0
    usd: float = 0.0
    wall_clock_ms: int = 0
    human_minutes: float = 0.0


@dataclass(frozen=True)
class TaskProfile:
    """The task features the necessity gate and compiler are allowed to use."""

    id: str
    name: str
    task_class: str
    work_units: int
    decomposability: float
    parallelizable: bool
    needs_verification: bool
    required_capabilities: tuple[str, ...]
    latency_sensitivity: float
    authority_sensitivity: float
    size: str = "medium"


@dataclass(frozen=True)
class RoleSpec:
    name: str
    capabilities: tuple[str, ...]
    responsibility: str
    max_instances: int = 1


@dataclass(frozen=True)
class TeamManifest:
    id: str
    roles: tuple[RoleSpec, ...]
    lead: str
    edges: tuple[tuple[str, str], ...]
    coordination_max_ratio: float = 0.2
    team_size_cap: int = 5


@dataclass(frozen=True)
class RoleMetrics:
    role: str
    tokens: int
    wall_clock_ms: int
    tool_calls: int
    human_minutes: float
    idle_ms: int = 0
    wait_ms: int = 0
    rework_count: int = 0


@dataclass(frozen=True)
class RunMetrics:
    quality: float
    roles: tuple[RoleMetrics, ...]
    handoff_count: int = 0
    handoff_tokens: int = 0
    handoff_latency_ms: int = 0
    context_tokens: int = 0
    unique_context_tokens: int = 0
    coordination_tokens: int = 0
    artifacts_total: int = 0

    @property
    def total_tokens(self) -> int:
        return sum(role.tokens for role in self.roles)

    @property
    def total_tool_calls(self) -> int:
        return sum(role.tool_calls for role in self.roles)

    @property
    def total_human_minutes(self) -> float:
        return sum(role.human_minutes for role in self.roles)

    @property
    def total_rework_count(self) -> int:
        return sum(role.rework_count for role in self.roles)

    @property
    def total_idle_ms(self) -> int:
        return sum(role.idle_ms for role in self.roles)

    @property
    def total_wait_ms(self) -> int:
        return sum(role.wait_ms for role in self.roles)

    @property
    def total_role_wall_clock_ms(self) -> int:
        return sum(role.wall_clock_ms for role in self.roles)

    @property
    def max_wall_clock_ms(self) -> int:
        return max((role.wall_clock_ms for role in self.roles), default=0)


@dataclass(frozen=True)
class CostModel:
    """Normalized cost weights used by the prototype.

    The absolute numbers are illustrative. The point is to make the cost
    *structure* explicit and comparable within a task class.
    """

    token_price: float = 0.001
    ms_price: float = 0.00001
    tool_price: float = 0.01
    human_minute_price: float = 1.0
    rework_price: float = 0.5

    def breakdown(self, run: RunMetrics) -> dict[str, float]:
        model_cost = max(0, run.total_tokens - run.coordination_tokens) * self.token_price
        tool_cost = run.total_tool_calls * self.tool_price
        coordination_cost = run.coordination_tokens * self.token_price
        wait_cost = (run.total_wait_ms + run.handoff_latency_ms) * self.ms_price
        rework_cost = run.total_rework_count * self.rework_price
        human_cost = run.total_human_minutes * self.human_minute_price
        return {
            "model": model_cost,
            "tool": tool_cost,
            "coordination": coordination_cost,
            "wait": wait_cost,
            "rework": rework_cost,
            "human": human_cost,
            "total": model_cost + tool_cost + coordination_cost + wait_cost + rework_cost + human_cost,
        }

    def cost(self, run: RunMetrics) -> float:
        return self.breakdown(run)["total"]


@dataclass(frozen=True)
class EfficiencyVector:
    quality: float
    total_cost: float
    model_cost: float
    tool_cost: float
    coordination_cost: float
    wait_cost: float
    rework_cost: float
    human_cost: float
    coordination_overhead_ratio: float
    useful_work_ratio: float
    context_duplication_ratio: float
    rework_ratio: float
    handoff_latency_ms: int

    @classmethod
    def from_run(cls, run: RunMetrics, cost_model: CostModel | None = None) -> "EfficiencyVector":
        model = cost_model or CostModel()
        costs = model.breakdown(run)
        tokens = max(1, run.total_tokens)
        role_time = max(1, run.total_role_wall_clock_ms)
        useful = 1.0 - (run.total_idle_ms + run.total_wait_ms) / role_time
        useful = min(1.0, max(0.0, useful))
        if run.context_tokens > 0:
            duplication = 1.0 - run.unique_context_tokens / run.context_tokens
        else:
            duplication = 0.0
        duplication = min(1.0, max(0.0, duplication))
        if run.artifacts_total > 0:
            rework = run.total_rework_count / run.artifacts_total
        else:
            rework = run.total_rework_count / max(1, len(run.roles))
        rework = min(1.0, max(0.0, rework))
        return cls(
            quality=round(run.quality, 4),
            total_cost=round(costs["total"], 4),
            model_cost=round(costs["model"], 4),
            tool_cost=round(costs["tool"], 4),
            coordination_cost=round(costs["coordination"], 4),
            wait_cost=round(costs["wait"], 4),
            rework_cost=round(costs["rework"], 4),
            human_cost=round(costs["human"], 4),
            coordination_overhead_ratio=round(run.coordination_tokens / tokens, 4),
            useful_work_ratio=round(useful, 4),
            context_duplication_ratio=round(duplication, 4),
            rework_ratio=round(rework, 4),
            handoff_latency_ms=run.handoff_latency_ms,
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
