from __future__ import annotations

import unittest

from hes.compiler import CompilerPolicy, MinimalTeamCompiler
from hes.models import TaskProfile
from hes.scenarios import build_scenarios


class CompilerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.scenarios = {scenario.task.id: scenario for scenario in build_scenarios()}
        self.compiler = MinimalTeamCompiler()

    def test_single_has_one_role(self) -> None:
        compiled = self.compiler.compile_single(self.scenarios["simple-bugfix"].task)
        self.assertEqual(compiled.role_names, ("solo",))
        self.assertEqual(compiled.manifest.edges, ())

    def test_minimal_pipeline_is_lead_worker_verifier(self) -> None:
        compiled = self.compiler.compile_team(self.scenarios["multi-file-feature"].task)
        self.assertEqual(compiled.role_names, ("lead", "worker", "verifier"))
        self.assertIn(("worker", "verifier"), compiled.manifest.edges)
        self.assertFalse(compiled.hierarchy_needed)

    def test_security_adds_a_specialist(self) -> None:
        compiled = self.compiler.compile_team(self.scenarios["security-audit"].task)
        self.assertEqual(
            set(compiled.role_names),
            {"lead", "worker", "verifier", "security_reviewer"},
        )
        self.assertTrue(any("security" in reason for reason in compiled.rationale))

    def test_research_uses_five_roles(self) -> None:
        compiled = self.compiler.compile_team(self.scenarios["research-synthesis"].task)
        self.assertEqual(
            set(compiled.role_names),
            {"lead", "worker", "researcher", "synthesizer", "verifier"},
        )
        self.assertEqual(len(compiled.role_names), 5)

    def test_cap_and_hierarchy_warning(self) -> None:
        task = TaskProfile(
            id="many-capabilities",
            name="Many capabilities",
            task_class="complex",
            work_units=3,
            decomposability=0.9,
            parallelizable=True,
            needs_verification=True,
            required_capabilities=("implementation", "verification", "security", "research", "synthesis", "design"),
            latency_sensitivity=0.2,
            authority_sensitivity=0.1,
        )
        compiler = MinimalTeamCompiler(CompilerPolicy(team_size_cap=3))
        compiled = compiler.compile_team(task)
        self.assertTrue(compiled.hierarchy_needed)
        self.assertLessEqual(len(compiled.role_names), 3)
        self.assertTrue(compiled.warnings)


if __name__ == "__main__":
    unittest.main()
