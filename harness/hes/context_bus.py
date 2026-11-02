"""P2 Context Bus.

Shared artifacts + per-role fetch accounting. The bus does not decide what an
agent should read; it records what it did read, what was new, and how much was
re-read. That is enough to compute the Context Duplication Ratio.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Artifact:
    id: str
    content: str
    owner: str
    tags: tuple[str, ...] = ()

    def tokens(self) -> int:
        return max(1, len(self.content) // 4)


@dataclass(frozen=True)
class ContextFetch:
    role: str
    artifact_ids: tuple[str, ...]
    tokens: int
    unique_tokens: int
    cache_hits: int
    truncated: bool = False


class ContextBus:
    def __init__(self) -> None:
        self._artifacts: dict[str, Artifact] = {}
        self._seen: set[str] = set()
        self.fetches: list[ContextFetch] = []

    def put(self, artifact: Artifact) -> None:
        self._artifacts[artifact.id] = artifact

    def get(self, artifact_id: str) -> Artifact:
        return self._artifacts[artifact_id]

    def fetch(self, role: str, artifact_ids: tuple[str, ...], max_tokens: int = 20_000) -> ContextFetch:
        selected: list[Artifact] = []
        used = 0
        truncated = False
        for artifact_id in artifact_ids:
            artifact = self._artifacts[artifact_id]
            cost = artifact.tokens()
            if used + cost > max_tokens:
                truncated = True
                break
            selected.append(artifact)
            used += cost

        unique_ids: list[str] = []
        for artifact in selected:
            if artifact.id not in self._seen and artifact.id not in unique_ids:
                unique_ids.append(artifact.id)
        unique_tokens = sum(self._artifacts[artifact_id].tokens() for artifact_id in unique_ids)
        cache_hits = len(selected) - len(unique_ids)
        self._seen.update(unique_ids)
        fetch = ContextFetch(
            role=role,
            artifact_ids=tuple(artifact.id for artifact in selected),
            tokens=used,
            unique_tokens=unique_tokens,
            cache_hits=cache_hits,
            truncated=truncated,
        )
        self.fetches.append(fetch)
        return fetch

    @property
    def total_tokens(self) -> int:
        return sum(fetch.tokens for fetch in self.fetches)

    @property
    def total_unique_tokens(self) -> int:
        return sum(fetch.unique_tokens for fetch in self.fetches)

    @property
    def cache_hits(self) -> int:
        return sum(fetch.cache_hits for fetch in self.fetches)

    @property
    def duplication_ratio(self) -> float:
        if self.total_tokens <= 0:
            return 0.0
        return min(1.0, max(0.0, 1.0 - self.total_unique_tokens / self.total_tokens))
