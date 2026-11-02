"""P0 efficiency ledger.

The ledger is append-only JSONL. Each fact is intentionally small and carries
the row identity (run/role/node) plus the measured counters. The summary file
is derived from the facts, not a second source of truth.
"""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .models import CostModel, EfficiencyVector, RunMetrics, TaskProfile


class EfficiencyLedger:
    def __init__(self, path: Path | str | None = None, *, reset: bool = True) -> None:
        self.path = Path(path) if path else None
        self.facts: list[dict[str, Any]] = []
        self.vectors: list[dict[str, Any]] = []
        self._seq = 0
        if self.path:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            if reset and self.path.exists():
                self.path.unlink()
            self.path.touch()

    def record(self, kind: str, **payload: Any) -> dict[str, Any]:
        self._seq += 1
        fact = {
            "seq": self._seq,
            "at": datetime.now(timezone.utc).isoformat(),
            "type": kind,
            **payload,
        }
        self.facts.append(fact)
        if self.path:
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(fact, ensure_ascii=False) + "\n")
        return fact

    def record_run(
        self,
        run_id: str,
        task: TaskProfile,
        run: RunMetrics,
        cost_model: CostModel | None = None,
    ) -> EfficiencyVector:
        self.record(
            "team.run.started",
            run=run_id,
            task=asdict(task),
            mode="team" if len(run.roles) > 1 else "single",
        )
        for role in run.roles:
            self.record("role.assigned", run=run_id, role=role.role, metrics=asdict(role))
        if run.handoff_count:
            self.record(
                "handoff.sent",
                run=run_id,
                count=run.handoff_count,
                tokens=run.handoff_tokens,
                latency_ms=run.handoff_latency_ms,
            )
        self.record(
            "context.fetched",
            run=run_id,
            tokens=run.context_tokens,
            unique_tokens=run.unique_context_tokens,
        )
        if run.total_wait_ms:
            self.record("node.wait.started", run=run_id, wait_ms=run.total_wait_ms)
            self.record("node.wait.ended", run=run_id, wait_ms=run.total_wait_ms)
        for role in run.roles:
            for _ in range(role.rework_count):
                self.record("artifact.reworked", run=run_id, role=role.role)
        return self.record_aggregate(run_id, run, cost_model)

    def record_aggregate(
        self,
        run_id: str,
        run: RunMetrics,
        cost_model: CostModel | None = None,
    ) -> EfficiencyVector:
        model = cost_model or CostModel()
        vector = EfficiencyVector.from_run(run, model)
        self.record("team.run.completed", run=run_id, quality=run.quality)
        self.record("efficiency.measured", run=run_id, vector=vector.to_dict())
        self.vectors.append({"run": run_id, **vector.to_dict()})
        return vector

    def flush_summary(self, path: Path | str | None = None) -> Path | None:
        target = Path(path) if path else (self.path.with_name("efficiency_summary.jsonl") if self.path else None)
        if target is None:
            return None
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("w", encoding="utf-8") as handle:
            for vector in self.vectors:
                handle.write(json.dumps(vector, ensure_ascii=False) + "\n")
        return target

    def to_json(self) -> str:
        return json.dumps({"facts": self.facts, "vectors": self.vectors}, ensure_ascii=False, indent=2)
