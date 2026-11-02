"""A tiny TeamBench subset with hidden tests.

The hidden test lives outside the agent workspace. It is executed only after the
team run, so the agents cannot read its assertions from their working directory.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from ..models import TaskProfile

PACKAGE = Path(__file__).parent
TASKS_DIR = PACKAGE / "tasks"


@dataclass(frozen=True)
class HiddenResult:
    score: float
    passed: int
    total: int
    detail: str
    stdout: str = ""
    stderr: str = ""


@dataclass(frozen=True)
class TeamBenchTask:
    id: str
    prompt: str
    workspace_dir: Path
    hidden_test: Path
    task_profile: TaskProfile
    quality_threshold: float = 1.0


def build_suite() -> tuple[TeamBenchTask, ...]:
    return (
        TeamBenchTask(
            id="slugify",
            prompt=(TASKS_DIR / "slugify" / "task.md").read_text(encoding="utf-8"),
            workspace_dir=TASKS_DIR / "slugify" / "workspace",
            hidden_test=TASKS_DIR / "slugify" / "hidden_test.py",
            task_profile=TaskProfile(
                id="team-bench-slugify",
                name="Implement slugify",
                task_class="coding",
                work_units=2,
                decomposability=0.8,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("implementation", "verification"),
                latency_sensitivity=0.3,
                authority_sensitivity=0.1,
                size="small",
            ),
        ),
        TeamBenchTask(
            id="dedupe-events",
            prompt=(TASKS_DIR / "dedupe_events" / "task.md").read_text(encoding="utf-8"),
            workspace_dir=TASKS_DIR / "dedupe_events" / "workspace",
            hidden_test=TASKS_DIR / "dedupe_events" / "hidden_test.py",
            task_profile=TaskProfile(
                id="team-bench-dedupe",
                name="Implement dedupe_events",
                task_class="coding",
                work_units=2,
                decomposability=0.8,
                parallelizable=True,
                needs_verification=True,
                required_capabilities=("implementation", "verification"),
                latency_sensitivity=0.3,
                authority_sensitivity=0.1,
                size="small",
            ),
        ),
    )


def materialize(task: TeamBenchTask, target: Path) -> Path:
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(task.workspace_dir, target)
    return target


def evaluate_hidden(task: TeamBenchTask, workspace: Path, timeout_s: int = 60) -> HiddenResult:
    workspace = workspace.resolve()
    process = subprocess.run(
        [sys.executable, str(task.hidden_test), str(workspace)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout_s,
    )
    stdout = process.stdout.strip()
    payload: dict = {}
    for line in reversed(stdout.splitlines()):
        try:
            payload = json.loads(line)
            break
        except json.JSONDecodeError:
            continue
    if not payload:
        return HiddenResult(
            score=0.0,
            passed=0,
            total=0,
            detail="hidden test did not emit JSON",
            stdout=stdout,
            stderr=process.stderr.strip(),
        )
    return HiddenResult(
        score=float(payload.get("score", 0.0)),
        passed=int(payload.get("passed", 0)),
        total=int(payload.get("total", 0)),
        detail=str(payload.get("detail", "")),
        stdout=stdout,
        stderr=process.stderr.strip(),
    )
