"""Deterministic synthetic scenarios for the P0/P1 prototype.

These are not benchmark results. They exist to exercise the decision and
accounting logic with inspectable numbers.
"""

from __future__ import annotations

from dataclasses import dataclass

from .gate import HistoryRecord
from .models import CostModel, RoleMetrics, RunMetrics, TaskProfile


def role(
    name: str,
    tokens: int,
    wall_clock_ms: int,
    tool_calls: int,
    human_minutes: float,
    *,
    idle_ms: int = 0,
    wait_ms: int = 0,
    rework_count: int = 0,
) -> RoleMetrics:
    return RoleMetrics(
        role=name,
        tokens=tokens,
        wall_clock_ms=wall_clock_ms,
        tool_calls=tool_calls,
        human_minutes=human_minutes,
        idle_ms=idle_ms,
        wait_ms=wait_ms,
        rework_count=rework_count,
    )


@dataclass(frozen=True)
class Scenario:
    task: TaskProfile
    single: RunMetrics
    team: RunMetrics
    expected_team_roles: tuple[str, ...]
    expect_team: bool


def build_scenarios() -> tuple[Scenario, ...]:
    return (
        Scenario(
            task=TaskProfile(
                id="simple-bugfix",
                name="Fix a typo in one file",
                task_class="bugfix",
                work_units=1,
                decomposability=0.2,
                parallelizable=False,
                needs_verification=False,
                required_capabilities=("implementation",),
                latency_sensitivity=0.8,
                authority_sensitivity=0.1,
                size="small",
            ),
            single=RunMetrics(
                quality=0.92,
                roles=(role("solo", 40_000, 600_000, 20, 5),),
                context_tokens=40_000,
                unique_context_tokens=40_000,
                artifacts_total=1,
            ),
            team=RunMetrics(
                quality=0.93,
                roles=(
                    role("lead", 8_000, 300_000, 3, 2, idle_ms=60_000, wait_ms=20_000),
                    role("worker", 30_000, 600_000, 18, 1, idle_ms=30_000, wait_ms=20_000),
                    role("verifier", 8_000, 240_000, 8, 2, idle_ms=20_000),
                ),
                handoff_count=3,
                handoff_tokens=2_000,
                handoff_latency_ms=15_000,
                context_tokens=60_000,
                unique_context_tokens=52_000,
                coordination_tokens=5_000,
                artifacts_total=3,
            ),
            expected_team_roles=("lead", "worker", "verifier"),
            expect_team=False,
        ),
        Scenario(
            task=TaskProfile(
                id="multi-file-feature",
                name="Implement a feature across three modules",
                task_class="feature",
                work_units=3,
                decomposability=0.8,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("implementation", "verification"),
                latency_sensitivity=0.3,
                authority_sensitivity=0.2,
                size="medium",
            ),
            single=RunMetrics(
                quality=0.70,
                roles=(role("solo", 45_000, 700_000, 25, 6, rework_count=2),),
                context_tokens=45_000,
                unique_context_tokens=45_000,
                artifacts_total=3,
            ),
            team=RunMetrics(
                quality=0.86,
                roles=(
                    role("lead", 12_000, 300_000, 3, 2, idle_ms=60_000, wait_ms=20_000),
                    role("worker", 35_000, 600_000, 18, 1, idle_ms=30_000, wait_ms=20_000, rework_count=1),
                    role("verifier", 10_000, 240_000, 8, 2, idle_ms=20_000),
                ),
                handoff_count=4,
                handoff_tokens=4_000,
                handoff_latency_ms=20_000,
                context_tokens=60_000,
                unique_context_tokens=48_000,
                coordination_tokens=8_000,
                artifacts_total=4,
            ),
            expected_team_roles=("lead", "worker", "verifier"),
            expect_team=True,
        ),
        Scenario(
            task=TaskProfile(
                id="security-audit",
                name="Audit and harden an authentication flow",
                task_class="security",
                work_units=2,
                decomposability=0.7,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("implementation", "verification", "security"),
                latency_sensitivity=0.4,
                authority_sensitivity=0.2,
                size="medium",
            ),
            single=RunMetrics(
                quality=0.68,
                roles=(role("solo", 50_000, 800_000, 30, 7, rework_count=2),),
                context_tokens=50_000,
                unique_context_tokens=50_000,
                artifacts_total=2,
            ),
            team=RunMetrics(
                quality=0.90,
                roles=(
                    role("lead", 12_000, 300_000, 3, 2, idle_ms=40_000, wait_ms=20_000),
                    role("worker", 30_000, 600_000, 16, 1, rework_count=1),
                    role("verifier", 10_000, 240_000, 8, 2, idle_ms=20_000),
                    role("security_reviewer", 15_000, 300_000, 6, 2, idle_ms=10_000),
                ),
                handoff_count=5,
                handoff_tokens=5_000,
                handoff_latency_ms=25_000,
                context_tokens=70_000,
                unique_context_tokens=55_000,
                coordination_tokens=10_000,
                artifacts_total=5,
            ),
            expected_team_roles=("lead", "worker", "verifier", "security_reviewer"),
            expect_team=True,
        ),
        Scenario(
            task=TaskProfile(
                id="research-synthesis",
                name="Synthesize a competitive landscape from multiple sources",
                task_class="research",
                work_units=4,
                decomposability=0.9,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("research", "synthesis", "verification"),
                latency_sensitivity=0.2,
                authority_sensitivity=0.1,
                size="large",
            ),
            single=RunMetrics(
                quality=0.65,
                roles=(role("solo", 55_000, 900_000, 30, 8, rework_count=2),),
                context_tokens=55_000,
                unique_context_tokens=55_000,
                artifacts_total=4,
            ),
            team=RunMetrics(
                quality=0.88,
                roles=(
                    role("lead", 10_000, 300_000, 3, 2, idle_ms=50_000, wait_ms=20_000),
                    role("worker", 25_000, 600_000, 15, 1, rework_count=1),
                    role("researcher", 30_000, 600_000, 12, 2, idle_ms=20_000),
                    role("synthesizer", 20_000, 400_000, 8, 1, idle_ms=10_000),
                    role("verifier", 8_000, 240_000, 6, 2, idle_ms=10_000),
                ),
                handoff_count=6,
                handoff_tokens=6_000,
                handoff_latency_ms=30_000,
                context_tokens=80_000,
                unique_context_tokens=60_000,
                coordination_tokens=12_000,
                artifacts_total=6,
            ),
            expected_team_roles=("lead", "worker", "researcher", "synthesizer", "verifier"),
            expect_team=True,
        ),
        Scenario(
            task=TaskProfile(
                id="production-deploy",
                name="Deploy a production migration during business hours",
                task_class="deploy",
                work_units=2,
                decomposability=0.9,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("implementation", "verification"),
                latency_sensitivity=0.7,
                authority_sensitivity=1.0,
                size="large",
            ),
            single=RunMetrics(
                quality=0.90,
                roles=(role("solo", 40_000, 600_000, 20, 5),),
                context_tokens=40_000,
                unique_context_tokens=40_000,
                artifacts_total=2,
            ),
            team=RunMetrics(
                quality=0.92,
                roles=(
                    role("lead", 10_000, 300_000, 3, 2),
                    role("worker", 25_000, 600_000, 15, 1),
                    role("verifier", 8_000, 240_000, 6, 1),
                ),
                handoff_count=3,
                handoff_tokens=3_000,
                handoff_latency_ms=20_000,
                context_tokens=50_000,
                unique_context_tokens=48_000,
                coordination_tokens=6_000,
                artifacts_total=3,
            ),
            expected_team_roles=("lead", "worker", "verifier"),
            expect_team=False,
        ),
    )


def build_history(scenarios: tuple[Scenario, ...] | None = None, cost_model: CostModel | None = None) -> tuple[HistoryRecord, ...]:
    model = cost_model or CostModel()
    scenarios = scenarios or build_scenarios()
    return tuple(
        HistoryRecord(
            task_class=scenario.task.task_class,
            single_quality=scenario.single.quality,
            single_cost=model.cost(scenario.single),
            team_quality=scenario.team.quality,
            team_cost=model.cost(scenario.team),
        )
        for scenario in scenarios
    )


def scenario_map() -> dict[str, Scenario]:
    return {scenario.task.id: scenario for scenario in build_scenarios()}
