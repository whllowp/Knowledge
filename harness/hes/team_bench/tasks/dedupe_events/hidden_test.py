import json
import sys
import traceback
from pathlib import Path

workspace = Path(sys.argv[1])
sys.path.insert(0, str(workspace))


def no_mutation(s):
    data = [{"id": "a", "ts": 1}, {"id": "b", "ts": 2}, {"id": "a", "ts": 3}]
    before = [dict(event) for event in data]
    s.dedupe_events(data)
    return data == before


checks = [
    ("empty", lambda s: s.dedupe_events([]), []),
    (
        "last_wins",
        lambda s: s.dedupe_events(
            [{"id": "a", "ts": 1}, {"id": "b", "ts": 2}, {"id": "a", "ts": 3}]
        ),
        [{"id": "b", "ts": 2}, {"id": "a", "ts": 3}],
    ),
    (
        "single_duplicate",
        lambda s: s.dedupe_events([{"id": "a", "ts": 1}, {"id": "a", "ts": 2}]),
        [{"id": "a", "ts": 2}],
    ),
    (
        "no_duplicates",
        lambda s: s.dedupe_events([{"id": "a", "ts": 1}, {"id": "b", "ts": 2}]),
        [{"id": "a", "ts": 1}, {"id": "b", "ts": 2}],
    ),
    ("no_mutation", no_mutation, True),
]


def main() -> None:
    passed = 0
    failures = []
    try:
        import solution
        for name, fn, expected in checks:
            try:
                actual = fn(solution)
                if actual == expected:
                    passed += 1
                else:
                    failures.append(f"{name}: expected {expected!r}, got {actual!r}")
            except Exception:
                failures.append(f"{name}: {traceback.format_exc(limit=1)}")
    except Exception:
        failures.append(f"import solution: {traceback.format_exc(limit=1)}")
    print(
        json.dumps(
            {
                "score": passed / len(checks),
                "passed": passed,
                "total": len(checks),
                "detail": "\n".join(failures),
            }
        )
    )


if __name__ == "__main__":
    main()
