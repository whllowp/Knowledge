import json
import sys
import traceback
from pathlib import Path

workspace = Path(sys.argv[1])
sys.path.insert(0, str(workspace))

checks = [
    ("basic", lambda s: s.slugify("Hello, World!"), "hello-world"),
    ("spaces", lambda s: s.slugify("  A  B  "), "a-b"),
    ("non_ascii", lambda s: s.slugify("Café"), "caf"),
    ("symbols_only", lambda s: s.slugify("---"), ""),
    ("underscores", lambda s: s.slugify("A__B"), "a-b"),
    ("runs", lambda s: s.slugify("Hello---World"), "hello-world"),
    ("empty", lambda s: s.slugify(""), ""),
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
