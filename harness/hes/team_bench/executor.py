"""Real Codex agent executor for TeamRun nodes.

The executor shells out to the installed Codex CLI. It uses the existing Codex
configuration/auth on this machine; no API key is read or printed by this code.
"""

from __future__ import annotations

import os
import re
import subprocess
import time
from pathlib import Path

from ..models import TaskProfile
from ..runtime import NodeExecution, NodeSpec

DEFAULT_MODEL = os.environ.get("HES_CODEX_MODEL", "gpt-6.1-sol")


class CodexNodeExecutor:
    def __init__(
        self,
        workspace: Path,
        task_prompt: str,
        *,
        model: str = DEFAULT_MODEL,
        timeout_s: int = 600,
    ) -> None:
        self.workspace = Path(workspace).resolve()
        self.task_prompt = task_prompt
        self.model = model
        self.timeout_s = timeout_s

    def execute(self, node: NodeSpec, task: TaskProfile) -> NodeExecution:
        prompt = self._prompt(node)
        command = [
            "cmd",
            "/c",
            "codex",
            "exec",
            "-m",
            self.model,
            "-c",
            'model_reasoning_effort="low"',
            "--ephemeral",
            "--skip-git-repo-check",
            "-s",
            "workspace-write",
            "-C",
            str(self.workspace),
            "-",
        ]
        started = time.perf_counter()
        try:
            process = subprocess.run(
                command,
                input=prompt,
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                timeout=self.timeout_s,
                cwd=str(self.workspace),
            )
            elapsed_ms = int((time.perf_counter() - started) * 1000)
            tokens = self._tokens(process.stderr)
            artifact = self.workspace / node.output_artifact
            content = artifact.read_text(encoding="utf-8", errors="replace") if artifact.exists() else ""
            note = f"rc={process.returncode} " + ((process.stdout or "") + (process.stderr or ""))[-500:]
            return NodeExecution(
                tokens=tokens,
                wall_clock_ms=elapsed_ms,
                tool_calls=1,
                success=process.returncode == 0,
                artifact_content=content,
                note=note,
            )
        except subprocess.TimeoutExpired as error:
            elapsed_ms = int((time.perf_counter() - started) * 1000)
            return NodeExecution(
                tokens=0,
                wall_clock_ms=elapsed_ms,
                tool_calls=1,
                success=False,
                note=f"timeout after {self.timeout_s}s: {error}",
            )

    def _prompt(self, node: NodeSpec) -> str:
        role = node.role
        if role == "lead":
            instruction = (
                "You are the lead. Read task.md. Do NOT edit solution.py. "
                "Write plan.md with a short plan, the key edge cases, and acceptance checks. "
                "Keep it under 300 words."
            )
        elif role == "worker":
            instruction = (
                "You are the worker. Read task.md and plan.md if present. "
                "Implement solution.py so the task is correct. You may run your own checks. "
                "Do not create hidden tests or edit task.md."
            )
        elif role == "verifier":
            instruction = (
                "You are the verifier. Read task.md, plan.md, and solution.py. "
                "Check the implementation against the task, run any checks you can, and fix defects "
                "in solution.py if needed. Write review.md with what you checked."
            )
        else:
            instruction = f"You are the {role}. Complete the assigned work in the workspace."

        return (
            f"{instruction}\n\n"
            "Workspace files are in the current directory. Do not inspect parent directories.\n\n"
            f"TASK:\n{self.task_prompt}\n"
        )

    @staticmethod
    def _tokens(stderr: str) -> int:
        match = re.search(r"tokens used\s+([\d,]+)", stderr or "", re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))
        return max(1, len(stderr or "") // 4)
