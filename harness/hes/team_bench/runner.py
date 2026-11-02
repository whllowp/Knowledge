"""Run a TeamBench task through a real Agent-backed TeamRun."""

from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path
from typing import Callable

from ..compiler import MinimalTeamCompiler
from ..ledger import EfficiencyLedger
from ..models import EfficiencyVector, RunMetrics, TeamManifest
from ..runtime import (
    GraphSpec,
    NodeExecutor,
    NodeSpec,
    RuntimeResult,
    TeamRuntime,
)
from .executor import CodexNodeExecutor
from .suite import HiddenResult, TeamBenchTask, evaluate_hidden, materialize


@dataclass(frozen=True)
class TeamBenchResult:
    task_id: str
    workspace: Path
    hidden: HiddenResult
    runtime: RuntimeResult
    metrics: RunMetrics
    vector: EfficiencyVector


def build_bench_graph(task_id: str, manifest: TeamManifest) -> GraphSpec:
    roles = {role.name for role in manifest.roles}
    nodes: list[NodeSpec] = []

    if "lead" in roles:
        nodes.append(
            NodeSpec(
                id="lead",
                role="lead",
                depends_on=(),
                output_artifact="plan.md",
                tokens=1_000,
                wall_clock_ms=60_000,
                tool_calls=1,
                human_minutes=0.0,
                input_artifacts=("task.md",),
            )
        )
    if "worker" in roles:
        nodes.append(
            NodeSpec(
                id="worker",
                role="worker",
                depends_on=("lead",) if "lead" in roles else (),
                output_artifact="solution.py",
                tokens=5_000,
                wall_clock_ms=180_000,
                tool_calls=1,
                human_minutes=0.0,
                input_artifacts=("task.md", "plan.md") if "lead" in roles else ("task.md",),
            )
        )
    if "verifier" in roles:
        nodes.append(
            NodeSpec(
                id="verifier",
                role="verifier",
                depends_on=tuple(role for role in ("lead", "worker") if role in roles),
                output_artifact="review.md",
                tokens=3_000,
                wall_clock_ms=120_000,
                tool_calls=1,
                human_minutes=0.0,
                input_artifacts=tuple(
                    artifact
                    for artifact in ("task.md", "plan.md", "solution.py")
                    if artifact != "plan.md" or "lead" in roles
                ),
            )
        )

    return GraphSpec(id=f"bench-{task_id}", nodes=tuple(nodes))


class TeamBenchRunner:
    def __init__(
        self,
        ledger: EfficiencyLedger | None = None,
        compiler: MinimalTeamCompiler | None = None,
        *,
        coordination_ratio: float = 0.2,
        executor_factory: Callable[[Path, str], NodeExecutor] | None = None,
    ) -> None:
        self.ledger = ledger
        self.compiler = compiler or MinimalTeamCompiler()
        self.coordination_ratio = coordination_ratio
        self.executor_factory = executor_factory or (
            lambda workspace, prompt: CodexNodeExecutor(workspace, prompt)
        )

    def run_task(self, task: TeamBenchTask, work_root: Path | str) -> TeamBenchResult:
        work_root = Path(work_root)
        workspace = materialize(task, work_root / task.id).resolve()
        (workspace / "task.md").write_text(task.prompt, encoding="utf-8")

        compiled = self.compiler.compile_team(task.task_profile)
        graph = build_bench_graph(task.id, compiled.manifest)
        executor = self.executor_factory(workspace, task.prompt)
        runtime = TeamRuntime(self.ledger)
        run_id = f"team-bench-{task.id}"

        result = runtime.run(
            run_id,
            task.task_profile,
            compiled.manifest,
            (),
            quality_base=0.0,
            coordination_ratio=self.coordination_ratio,
            executor=executor,
            graph=graph,
            initial_artifacts={"task.md": task.prompt},
            record_aggregate=False,
        )
        hidden = evaluate_hidden(task, workspace)
        final_metrics = replace(result.metrics, quality=hidden.score)
        if self.ledger is not None:
            vector = self.ledger.record_aggregate(run_id, final_metrics)
        else:
            from ..models import CostModel

            vector = EfficiencyVector.from_run(final_metrics, CostModel())
        final_runtime = replace(result, metrics=final_metrics, vector=vector)
        return TeamBenchResult(
            task_id=task.id,
            workspace=workspace,
            hidden=hidden,
            runtime=final_runtime,
            metrics=final_metrics,
            vector=vector,
        )
