"""P2 TeamRun / GraphRun runtime.

This is a real, deterministic scheduler over a small DAG: it resolves
dependencies, performs structured handoffs, fetches shared-context artifacts,
enforces a coordination budget, and emits graph/node/handoff/context facts to
the efficiency ledger.

It does not call an LLM. Node work is represented by explicit token/time/tool
budgets, so the runtime exercises scheduling and accounting rather than model
quality.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import asdict, dataclass

from .context_bus import Artifact, ContextBus
from .coordination import CoordinationBudget, CoordinationPolicy
from .handoff import Handoff, HandoffBus
from .ledger import EfficiencyLedger
from .models import (
    CostModel,
    EfficiencyVector,
    RoleMetrics,
    RunMetrics,
    TaskProfile,
    TeamManifest,
)


@dataclass(frozen=True)
class NodeSpec:
    id: str
    role: str
    depends_on: tuple[str, ...]
    output_artifact: str
    tokens: int
    wall_clock_ms: int
    tool_calls: int
    human_minutes: float
    idle_ms: int = 0
    wait_ms: int = 0
    rework_count: int = 0


@dataclass(frozen=True)
class GraphSpec:
    id: str
    nodes: tuple[NodeSpec, ...]


@dataclass(frozen=True)
class RuntimeResult:
    graph_id: str
    metrics: RunMetrics
    vector: EfficiencyVector
    executed: tuple[str, ...]
    skipped: tuple[str, ...]
    degraded: bool
    coordination_ratio: float
    context_duplication_ratio: float
    handoff_count: int


def build_graph(manifest: TeamManifest, role_metrics: tuple[RoleMetrics, ...]) -> GraphSpec:
    by_role = {metrics.role: metrics for metrics in role_metrics}
    role_names = {role.name for role in manifest.roles}
    nodes: list[NodeSpec] = []
    for role in manifest.roles:
        metrics = by_role.get(role.name) or RoleMetrics(
            role=role.name,
            tokens=1_000,
            wall_clock_ms=60_000,
            tool_calls=1,
            human_minutes=0.5,
        )
        dependencies = tuple(
            edge[0]
            for edge in manifest.edges
            if edge[1] == role.name and edge[0] in role_names and edge[0] != role.name
        )
        nodes.append(
            NodeSpec(
                id=role.name,
                role=role.name,
                depends_on=dependencies,
                output_artifact=f"artifact-{role.name}",
                tokens=metrics.tokens,
                wall_clock_ms=metrics.wall_clock_ms,
                tool_calls=metrics.tool_calls,
                human_minutes=metrics.human_minutes,
                idle_ms=metrics.idle_ms,
                wait_ms=metrics.wait_ms,
                rework_count=metrics.rework_count,
            )
        )
    return GraphSpec(id=manifest.id, nodes=tuple(nodes))


class TeamRuntime:
    def __init__(self, ledger: EfficiencyLedger | None = None) -> None:
        self.ledger = ledger

    def run(
        self,
        run_id: str,
        task: TaskProfile,
        manifest: TeamManifest,
        role_metrics: tuple[RoleMetrics, ...],
        *,
        quality_base: float,
        coordination_ratio: float = 0.2,
        on_exceed: str = "degrade",
    ) -> RuntimeResult:
        graph = build_graph(manifest, role_metrics)
        context = ContextBus()
        context.put(Artifact("task", f"{task.name} | {' '.join(task.required_capabilities)}", "system"))
        handoffs = HandoffBus()
        planned_tokens = max(1, sum(node.tokens for node in graph.nodes))
        budget = CoordinationBudget(
            planned_tokens,
            CoordinationPolicy(max_ratio=coordination_ratio, on_exceed=on_exceed),
        )

        self._record(
            "team.run.started",
            run=run_id,
            task=asdict(task),
            graph=graph.id,
            nodes=len(graph.nodes),
            coordination_ratio=coordination_ratio,
        )
        self._record("graph.started", run=run_id, graph=graph.id, nodes=[node.id for node in graph.nodes])

        remaining = list(graph.nodes)
        done: set[str] = set()
        executed: list[str] = []
        skipped: list[str] = []
        role_totals: dict[str, dict[str, float]] = defaultdict(
            lambda: {
                "tokens": 0,
                "wall_clock_ms": 0,
                "tool_calls": 0,
                "human_minutes": 0.0,
                "idle_ms": 0,
                "wait_ms": 0,
                "rework_count": 0,
            }
        )

        while remaining:
            ready = [node for node in remaining if all(dependency in done for dependency in node.depends_on)]
            if not ready:
                raise ValueError(f"graph {graph.id} has a cycle or a missing dependency")
            node = sorted(ready, key=lambda item: item.id)[0]

            blocked = False
            for dependency in node.depends_on:
                handoff = Handoff(
                    id=f"{dependency}->{node.id}",
                    from_role=dependency,
                    to_role=node.role,
                    intent=f"handoff {node.output_artifact} for {node.id}",
                    artifacts=(f"artifact-{dependency}",),
                )
                record = handoffs.send(handoff)
                status = budget.record(record.tokens)
                self._record(
                    "handoff.sent",
                    run=run_id,
                    handoff=handoff.id,
                    from_role=dependency,
                    to_role=node.role,
                    tokens=record.tokens,
                    latency_ms=record.latency_ms,
                )
                self._record(
                    "coordination.checked",
                    run=run_id,
                    status=status,
                    coordination_tokens=budget.coordination_tokens,
                    ratio=round(budget.ratio, 4),
                )
                if budget.degraded:
                    blocked = True
                    self._record(
                        "coordination.degraded",
                        run=run_id,
                        action=budget.action,
                        coordination_tokens=budget.coordination_tokens,
                        ratio=round(budget.ratio, 4),
                    )
                    break

            if blocked:
                skipped = [item.id for item in remaining]
                break

            self._record("node.started", run=run_id, node=node.id, role=node.role)
            input_ids = ("task",) + tuple(f"artifact-{dependency}" for dependency in node.depends_on)
            fetch = context.fetch(node.role, input_ids)
            self._record("context.fetched", run=run_id, role=node.role, fetch=asdict(fetch))

            content = f"{node.output_artifact} produced by {node.role}; " + (
                "evidence " * max(1, node.tokens // 200)
            )
            context.put(Artifact(node.output_artifact, content, node.role))
            self._record(
                "node.completed",
                run=run_id,
                node=node.id,
                role=node.role,
                tokens=node.tokens,
                wall_clock_ms=node.wall_clock_ms,
            )
            if node.wait_ms:
                self._record("node.wait.started", run=run_id, node=node.id, wait_ms=node.wait_ms)
                self._record("node.wait.ended", run=run_id, node=node.id, wait_ms=node.wait_ms)
            for _ in range(node.rework_count):
                self._record("artifact.reworked", run=run_id, role=node.role, node=node.id)

            totals = role_totals[node.role]
            totals["tokens"] += node.tokens
            totals["wall_clock_ms"] += node.wall_clock_ms
            totals["tool_calls"] += node.tool_calls
            totals["human_minutes"] += node.human_minutes
            totals["idle_ms"] += node.idle_ms
            totals["wait_ms"] += node.wait_ms
            totals["rework_count"] += node.rework_count

            executed.append(node.id)
            done.add(node.id)
            remaining.remove(node)

        quality = max(0.0, min(1.0, quality_base - 0.05 * len(skipped)))
        roles = tuple(
            RoleMetrics(
                role=role,
                tokens=int(values["tokens"]),
                wall_clock_ms=int(values["wall_clock_ms"]),
                tool_calls=int(values["tool_calls"]),
                human_minutes=float(values["human_minutes"]),
                idle_ms=int(values["idle_ms"]),
                wait_ms=int(values["wait_ms"]),
                rework_count=int(values["rework_count"]),
            )
            for role, values in role_totals.items()
        )
        metrics = RunMetrics(
            quality=quality,
            roles=roles,
            handoff_count=handoffs.count,
            handoff_tokens=handoffs.total_tokens,
            handoff_latency_ms=handoffs.total_latency_ms,
            context_tokens=context.total_tokens,
            unique_context_tokens=context.total_unique_tokens,
            coordination_tokens=handoffs.total_tokens,
            artifacts_total=len(graph.nodes),
        )

        for role in roles:
            self._record("role.assigned", run=run_id, role=role.role, metrics=asdict(role))
        self._record("graph.completed", run=run_id, graph=graph.id, executed=executed, skipped=skipped)
        if self.ledger is not None:
            vector = self.ledger.record_aggregate(run_id, metrics)
        else:
            vector = EfficiencyVector.from_run(metrics, CostModel())

        return RuntimeResult(
            graph_id=graph.id,
            metrics=metrics,
            vector=vector,
            executed=tuple(executed),
            skipped=tuple(skipped),
            degraded=bool(skipped),
            coordination_ratio=round(budget.ratio, 4),
            context_duplication_ratio=round(context.duplication_ratio, 4),
            handoff_count=handoffs.count,
        )

    def _record(self, kind: str, **payload: object) -> None:
        if self.ledger is not None:
            self.ledger.record(kind, **payload)
