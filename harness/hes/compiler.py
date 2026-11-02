"""P1 Minimal Team Compiler.

Compiles the smallest team that covers the task's required capabilities. The
compiler is deliberately conservative: lead + worker + verifier are the default
team, and specialists are added only for an uncovered capability.
"""

from __future__ import annotations

from dataclasses import dataclass

from .models import RoleSpec, TaskProfile, TeamManifest


BASE_ROLES: dict[str, RoleSpec] = {
    "lead": RoleSpec("lead", ("coordination", "planning"), "own the ticket, route work, report"),
    "worker": RoleSpec("worker", ("implementation",), "do the main work in one owned work unit"),
    "verifier": RoleSpec("verifier", ("verification", "review"), "independently verify the result"),
}

SPECIALIST_ROLES: dict[str, RoleSpec] = {
    "security": RoleSpec("security_reviewer", ("security", "review"), "review security-sensitive changes"),
    "research": RoleSpec("researcher", ("research",), "gather and structure external evidence"),
    "synthesis": RoleSpec("synthesizer", ("synthesis", "writing"), "merge findings into a coherent deliverable"),
    "design": RoleSpec("designer", ("design",), "own interaction and visual design decisions"),
    "data": RoleSpec("data_specialist", ("data",), "own data extraction, validation, and analysis"),
    "domain": RoleSpec("domain_expert", ("domain",), "supply domain rules and constraints"),
}

CAPABILITY_TO_ROLE: dict[str, str] = {
    "security": "security",
    "research": "research",
    "synthesis": "synthesis",
    "design": "design",
    "data": "data",
    "domain": "domain",
    "implementation": "worker",
    "verification": "verifier",
    "review": "verifier",
    "coordination": "lead",
    "planning": "lead",
}


@dataclass(frozen=True)
class CompilerPolicy:
    team_size_cap: int = 5
    edge_budget: int = 8


@dataclass(frozen=True)
class CompiledTeam:
    manifest: TeamManifest
    rationale: tuple[str, ...]
    warnings: tuple[str, ...] = ()
    hierarchy_needed: bool = False

    @property
    def role_names(self) -> tuple[str, ...]:
        return tuple(role.name for role in self.manifest.roles)


class MinimalTeamCompiler:
    def __init__(self, policy: CompilerPolicy | None = None) -> None:
        self.policy = policy or CompilerPolicy()

    def compile_single(self, task: TaskProfile) -> CompiledTeam:
        capabilities = tuple(sorted(set(task.required_capabilities) | {"implementation"}))
        role = RoleSpec("solo", capabilities, "do the whole task in one context")
        manifest = TeamManifest(
            id=f"single-{task.id}",
            roles=(role,),
            lead="solo",
            edges=(),
            coordination_max_ratio=0.0,
            team_size_cap=1,
        )
        return CompiledTeam(manifest, ("single-agent baseline",))

    def compile_team(self, task: TaskProfile) -> CompiledTeam:
        roles: list[RoleSpec] = []
        rationale: list[str] = []
        warnings: list[str] = []

        roles.append(BASE_ROLES["lead"])
        rationale.append("lead: single accountable owner and router")

        needs_worker = task.work_units > 1 or "implementation" in task.required_capabilities
        if needs_worker:
            roles.append(BASE_ROLES["worker"])
            rationale.append(f"worker: {task.work_units} work units / implementation demand")

        needs_verifier = task.needs_verification or "verification" in task.required_capabilities
        if needs_verifier:
            roles.append(BASE_ROLES["verifier"])
            rationale.append("verifier: independent verification required")

        covered = {cap for role in roles for cap in role.capabilities}
        for capability in task.required_capabilities:
            if capability in covered:
                continue
            key = CAPABILITY_TO_ROLE.get(capability)
            role = SPECIALIST_ROLES.get(key or "")
            if role is None:
                role = RoleSpec(f"specialist_{capability}", (capability,), f"cover {capability}")
            if any(existing.name == role.name for existing in roles):
                covered.update(role.capabilities)
                continue
            roles.append(role)
            covered.update(role.capabilities)
            rationale.append(f"{role.name}: uncovered capability '{capability}'")

        hierarchy_needed = False
        if len(roles) > self.policy.team_size_cap:
            keep = self.policy.team_size_cap
            dropped = [role.name for role in roles[keep:]]
            roles = roles[:keep]
            hierarchy_needed = True
            warnings.append(
                f"team size {len(roles) + len(dropped)} exceeds cap {keep}; dropped {', '.join(dropped)}; "
                "split into a hierarchical sub-team before scaling"
            )

        edges = self._edges(roles)
        if len(edges) > self.policy.edge_budget:
            warnings.append(
                f"{len(edges)} handoff edges exceed budget {self.policy.edge_budget}; "
                "co-locate coupled work or remove a role"
            )

        manifest = TeamManifest(
            id=f"team-{task.id}",
            roles=tuple(roles),
            lead="lead",
            edges=tuple(edges),
            coordination_max_ratio=0.2,
            team_size_cap=self.policy.team_size_cap,
        )
        return CompiledTeam(manifest, tuple(rationale), tuple(warnings), hierarchy_needed)

    @staticmethod
    def _edges(roles: list[RoleSpec]) -> list[tuple[str, str]]:
        names = [role.name for role in roles]
        edges: list[tuple[str, str]] = []
        lead = "lead"
        for name in names:
            if name != lead:
                edges.append((lead, name))
        if "worker" in names and "verifier" in names:
            edges.append(("worker", "verifier"))
        for name in names:
            if name not in {lead, "worker", "verifier"}:
                target = "worker" if "worker" in names else lead
                edges.append((name, target))
        # Deduplicate while preserving order.
        seen: set[tuple[str, str]] = set()
        unique: list[tuple[str, str]] = []
        for edge in edges:
            if edge[0] == edge[1] or edge in seen:
                continue
            seen.add(edge)
            unique.append(edge)
        return unique
