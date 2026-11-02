from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from hes.ledger import EfficiencyLedger
from hes.models import TaskProfile
from hes.runtime import NodeExecution, NodeSpec
from hes.team_bench.runner import TeamBenchRunner, build_bench_graph
from hes.team_bench.suite import build_suite, evaluate_hidden, materialize

CORRECT_SLUGIFY = """import re

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")
"""

CORRECT_DEDUPE = """def dedupe_events(events: list[dict]) -> list[dict]:
    last = {}
    for index, event in enumerate(events):
        last[event["id"]] = (index, event)
    return [event for _, event in sorted(last.values(), key=lambda item: item[0])]
"""


class FakeExecutor:
    def __init__(self, workspace: Path) -> None:
        self.workspace = workspace

    def execute(self, node: NodeSpec, task: TaskProfile) -> NodeExecution:
        if node.role == "lead":
            content = "Plan: implement slugify and test edge cases."
            (self.workspace / "plan.md").write_text(content, encoding="utf-8")
            return NodeExecution(tokens=100, wall_clock_ms=10, tool_calls=1, artifact_content=content)
        if node.role == "worker":
            (self.workspace / "solution.py").write_text(CORRECT_SLUGIFY, encoding="utf-8")
            return NodeExecution(tokens=500, wall_clock_ms=20, tool_calls=1, artifact_content=CORRECT_SLUGIFY)
        content = "Reviewed slugify against the task."
        (self.workspace / "review.md").write_text(content, encoding="utf-8")
        return NodeExecution(tokens=50, wall_clock_ms=5, tool_calls=1, artifact_content=content)


class TeamBenchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.suite = {task.id: task for task in build_suite()}

    def test_hidden_test_accepts_correct_solution(self) -> None:
        task = self.suite["slugify"]
        workspace = materialize(task, self.root / "correct")
        (workspace / "solution.py").write_text(CORRECT_SLUGIFY, encoding="utf-8")
        hidden = evaluate_hidden(task, workspace)
        self.assertEqual(hidden.score, 1.0)
        self.assertEqual(hidden.passed, hidden.total)

    def test_hidden_test_rejects_starter(self) -> None:
        task = self.suite["slugify"]
        workspace = materialize(task, self.root / "starter")
        hidden = evaluate_hidden(task, workspace)
        self.assertEqual(hidden.score, 0.0)

    def test_hidden_dedupe_accepts_correct_solution(self) -> None:
        task = self.suite["dedupe-events"]
        workspace = materialize(task, self.root / "dedupe")
        (workspace / "solution.py").write_text(CORRECT_DEDUPE, encoding="utf-8")
        hidden = evaluate_hidden(task, workspace)
        self.assertEqual(hidden.score, 1.0)

    def test_graph_has_three_stages(self) -> None:
        task = self.suite["slugify"]
        from hes.compiler import MinimalTeamCompiler

        compiled = MinimalTeamCompiler().compile_team(task.task_profile)
        graph = build_bench_graph(task.id, compiled.manifest)
        by_id = {node.id: node for node in graph.nodes}
        self.assertEqual(by_id["lead"].depends_on, ())
        self.assertEqual(by_id["worker"].depends_on, ("lead",))
        self.assertEqual(set(by_id["verifier"].depends_on), {"lead", "worker"})

    def test_runner_with_fake_executor_scores_hidden_test(self) -> None:
        task = self.suite["slugify"]
        ledger_path = self.root / "ledger.jsonl"
        ledger = EfficiencyLedger(ledger_path)
        runner = TeamBenchRunner(
            ledger,
            executor_factory=lambda workspace, prompt: FakeExecutor(workspace),
        )
        result = runner.run_task(task, self.root / "run")
        self.assertEqual(result.hidden.score, 1.0)
        self.assertEqual(result.vector.quality, 1.0)
        self.assertEqual(set(result.runtime.executed), {"lead", "worker", "verifier"})
        facts = [json.loads(line) for line in ledger_path.read_text(encoding="utf-8").splitlines()]
        types = {fact["type"] for fact in facts}
        self.assertIn("graph.started", types)
        self.assertIn("node.completed", types)
        self.assertIn("team.run.completed", types)
        self.assertIn("efficiency.measured", types)


if __name__ == "__main__":
    unittest.main()
