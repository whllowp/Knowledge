"""P1 Team Necessity Gate.

The gate answers one question: is a team economically and structurally
justified for this task? It does not compile the team; that is the compiler's
job. It returns an explainable decision so a reviewer can audit the choice.
"""

from __future__ import annotations

from dataclasses import dataclass
from statistics import mean

from .models import CostModel, RunMetrics, TaskProfile


@dataclass(frozen=True)
class NecessityPolicy:
    lambda_threshold: float = 0.2
    min_decomposability: float = 0.5
    max_latency_sensitivity: float = 0.6
    max_authority_sensitivity: float = 0.3


@dataclass(frozen=True)
class BaselineEstimate:
    single_quality: float
    single_cost: float
    team_quality: float
    team_cost: float


@dataclass(frozen=True)
class GateDecision:
    use_team: bool
    reason: str
    quality_gain: float
    team_premium: float
    pilot_required: bool = False


@dataclass(frozen=True)
class HistoryRecord:
    task_class: str
    single_quality: float
    single_cost: float
    team_quality: float
    team_cost: float


class History:
    """Historical single-vs-team baselines, grouped by task class."""

    def __init__(self, records: tuple[HistoryRecord, ...] = ()) -> None:
        self._records = records

    def baseline_for(self, task_class: str) -> BaselineEstimate | None:
        matching = [record for record in self._records if record.task_class == task_class]
        if not matching:
            return None
        return BaselineEstimate(
            single_quality=mean(record.single_quality for record in matching),
            single_cost=mean(record.single_cost for record in matching),
            team_quality=mean(record.team_quality for record in matching),
            team_cost=mean(record.team_cost for record in matching),
        )


class TeamNecessityGate:
    def __init__(self, policy: NecessityPolicy | None = None) -> None:
        self.policy = policy or NecessityPolicy()

    def decide(
        self,
        task: TaskProfile,
        history: History | None = None,
        baseline: BaselineEstimate | None = None,
    ) -> GateDecision:
        if baseline is None and history is not None:
            baseline = history.baseline_for(task.task_class)
        if baseline is None:
            return GateDecision(
                use_team=False,
                reason="no baseline: run a single-agent vs minimal-team pilot before deciding",
                quality_gain=0.0,
                team_premium=0.0,
                pilot_required=True,
            )

        quality_gain = self._relative_delta(baseline.team_quality, baseline.single_quality)
        team_premium = self._relative_delta(baseline.team_cost, baseline.single_cost)

        structural: list[str] = []
        if task.decomposability < self.policy.min_decomposability:
            structural.append(f"decomposability {task.decomposability:.2f} < {self.policy.min_decomposability:.2f}")
        if not (task.parallelizable or task.needs_verification or len(task.required_capabilities) > 1):
            structural.append("no parallel work, independent verification, or multi-capability demand")
        if task.latency_sensitivity > self.policy.max_latency_sensitivity:
            structural.append(f"latency sensitivity {task.latency_sensitivity:.2f} too high for coordination")
        if task.authority_sensitivity > self.policy.max_authority_sensitivity:
            structural.append("authority-sensitive: a team cannot self-authorize; use a human gate")
        if structural:
            return GateDecision(
                use_team=False,
                reason="; ".join(structural),
                quality_gain=round(quality_gain, 4),
                team_premium=round(team_premium, 4),
            )

        if quality_gain < 0:
            return GateDecision(
                use_team=False,
                reason=f"team quality regresses ({quality_gain:+.1%})",
                quality_gain=round(quality_gain, 4),
                team_premium=round(team_premium, 4),
            )

        if team_premium > 0:
            ratio = quality_gain / team_premium
            if ratio < self.policy.lambda_threshold:
                return GateDecision(
                    use_team=False,
                    reason=(
                        f"quality gain {quality_gain:+.1%} does not cover "
                        f"team premium {team_premium:+.1%} (ratio {ratio:.2f} < {self.policy.lambda_threshold:.2f})"
                    ),
                    quality_gain=round(quality_gain, 4),
                    team_premium=round(team_premium, 4),
                )
            reason = (
                f"team justified: quality {quality_gain:+.1%}, premium {team_premium:+.1%}, "
                f"ratio {ratio:.2f} >= {self.policy.lambda_threshold:.2f}"
            )
        else:
            reason = (
                f"team justified: quality {quality_gain:+.1%}, premium {team_premium:+.1%} "
                "(team is not more expensive)"
            )

        return GateDecision(
            use_team=True,
            reason=reason,
            quality_gain=round(quality_gain, 4),
            team_premium=round(team_premium, 4),
        )

    @staticmethod
    def _relative_delta(value: float, base: float) -> float:
        if base <= 0:
            return 0.0 if value <= 0 else float("inf")
        return (value - base) / base


def baseline_from_runs(single: RunMetrics, team: RunMetrics, cost_model: CostModel | None = None) -> BaselineEstimate:
    model = cost_model or CostModel()
    return BaselineEstimate(
        single_quality=single.quality,
        single_cost=model.cost(single),
        team_quality=team.quality,
        team_cost=model.cost(team),
    )
