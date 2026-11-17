#!/usr/bin/env python3
"""Dark Factory: lights-out build loop driver.

Deterministic half of the harness. Keeps the workspace, packets, gate runs,
attempt state and the final report. The agent half (SKILL.md) spawns one
worker subagent per ready packet and feeds results back here.

Workspace (inside the target repo):
    .factory/<slug>/
        brief.md          what the human asked for
        spec.md           what will be built (design + seams + non-goals)
        DESIGN.md         visual system (UI work only)
        tickets/NN-*.md   one tracer-bullet ticket per slice
        workers/          packet files handed to worker subagents
        evidence/         raw gate output, gitignored
        review.md         3-axis review + verdict
        escalation.md     blocked tickets and the hypothesis to retry
        report/           report.md + report.json
        state.json        runtime state (attempts, timings, interventions)

Exit codes: 0 ok, 1 gate/contract failure, 2 usage or config error.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

EXIT_OK = 0
EXIT_FAIL = 1
EXIT_USAGE = 2

ASSETS = Path(__file__).resolve().parent.parent / "assets"
HEADING = re.compile(r"^##\s+(.+?)\s*$", re.M)
KV_LINE = re.compile(r"^([A-Z][A-Za-z ]{1,24}):\s*(.*)$")
CHECKBOX = re.compile(r"^\s*-\s*\[( |x|X)\]\s*(.+?)\s*$")
# A real template hole looks like `<...>`; comparison operators such as `<=` do not.
PLACEHOLDER = re.compile(r"<(?:\.\.\.|[A-Za-z][^<>\n]{0,78})>")


def is_placeholder(text: str) -> bool:
    return bool(PLACEHOLDER.search(text))


# ---------------------------------------------------------------- utilities

def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha12(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig") if path.is_file() else ""


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def die(msg: str, code: int = EXIT_USAGE) -> "NoReturn":  # type: ignore[name-defined]
    print(f"error: {msg}", file=sys.stderr)
    raise SystemExit(code)


def git(root: Path, *args: str) -> str:
    proc = subprocess.run(
        ["git", *args], cwd=root, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    return proc.stdout.rstrip()


def load_state(fdir: Path) -> dict:
    path = fdir / "state.json"
    if not path.is_file():
        die(f"no state.json in {fdir}; run `factory.py init` first")
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(fdir: Path, state: dict) -> None:
    state["updated"] = now()
    write(fdir / "state.json", json.dumps(state, indent=2, ensure_ascii=False) + "\n")


def ticket_files(fdir: Path) -> list[Path]:
    d = fdir / "tickets"
    return sorted(d.glob("[0-9]*-*.md")) if d.is_dir() else []


def ticket_id(path: Path) -> str:
    return path.name.split("-", 1)[0]


def parse_ticket(path: Path) -> dict:
    """Parse the flat `Key: value` header, acceptance boxes and files list."""
    text = read(path)
    head, _, body = text.partition("## ")
    meta: dict[str, str] = {}
    for line in head.splitlines():
        m = KV_LINE.match(line.strip())
        if m and m.group(1) not in meta:
            meta[m.group(1)] = m.group(2).strip()
    title = ""
    first = text.splitlines()[0] if text.strip() else ""
    if first.startswith("# "):
        title = re.sub(r"^#\s*[0-9]+\s*:\s*", "", first).strip()
    sections: dict[str, str] = {}
    matches = list(HEADING.finditer(text))
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[m.group(1).strip().lower()] = text[start:end].strip()
    acceptance = [m.group(2) for m in (CHECKBOX.match(l) for l in text.splitlines()) if m]
    boxes = [m.group(1).lower() == "x" for m in (CHECKBOX.match(l) for l in text.splitlines()) if m]
    deps_raw = meta.get("Depends on", "none").strip()
    deps = [] if deps_raw.lower().startswith("none") else [
        d.strip() for d in re.split(r"[,\s]+", deps_raw) if d.strip()
    ]
    return {
        "id": ticket_id(path),
        "path": path,
        "title": title or path.stem,
        "status": meta.get("Status", "pending").strip().lower(),
        "proof": meta.get("Proof", "").strip().strip("`"),
        "branch": meta.get("Branch", "").strip(),
        "deps": [d for d in deps if d != ticket_id(path)],
        "acceptance": acceptance,
        "boxes": boxes,
        "sections": sections,
        "text": text,
    }


def set_status(path: Path, status: str) -> None:
    text = read(path)
    if re.search(r"^Status:.*$", text, re.M):
        text = re.sub(r"^Status:.*$", f"Status: {status}", text, count=1, flags=re.M)
    else:
        text = f"Status: {status}\n" + text
    write(path, text)


def tick_boxes(path: Path) -> int:
    """Mark every open acceptance checkbox as checked; returns how many were ticked."""
    text = read(path)
    new, n = re.subn(r"^(\s*-\s*)\[ \]", r"\1[x]", text, flags=re.M)
    if n:
        write(path, new)
    return n


def frontier(tickets: list[dict]) -> tuple[list[dict], list[dict]]:
    """Return (ready, blocked_by_unfinished) tickets."""
    by_id = {t["id"]: t for t in tickets}
    ready, waiting = [], []
    for t in tickets:
        if t["status"] in ("done", "blocked"):
            continue
        missing = [d for d in t["deps"] if by_id.get(d, {}).get("status") != "done"]
        (waiting if missing else ready).append(t)
    return ready, waiting


def sections_of(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    matches = list(HEADING.finditer(text))
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out[m.group(1).strip().lower()] = text[start:end].strip()
    return out


def spec_problems(fdir: Path, name: str) -> list[str]:
    """Reasons a packet must not be handed out yet. Empty list means the spec is usable."""
    path = fdir / "spec.md"
    if not path.is_file():
        return ["spec.md is missing"]
    text = read(path)
    if text.strip() == read(ASSETS / "spec.md").replace("<name>", name).strip():
        return ["spec.md is still the unfilled template"]
    secs = sections_of(text)
    problems = []
    seams = [l.strip() for l in secs.get("seams", "").splitlines() if l.strip()]
    if not seams or all(is_placeholder(l) for l in seams):
        problems.append("spec.md ## Seams has no concrete seam")
    acc = secs.get("acceptance (feature level)", secs.get("acceptance", ""))
    acc_lines = [l.strip() for l in acc.splitlines() if l.strip().startswith(("-", "*"))]
    if not acc_lines or all(is_placeholder(l) for l in acc_lines):
        problems.append("spec.md ## Acceptance has no feature-level check")
    return problems



def ticket_allowlist(t: dict) -> set[str]:
    """Paths a ticket declares in its Files section, normalized to posix."""
    raw = t["sections"].get("files", "") or ""
    out: set[str] = set()
    for line in raw.splitlines():
        s = line.strip().lstrip("-*").strip().strip("`").strip()
        if not s or s.startswith("<") or s.endswith(":") or " " in s and "(" in s:
            continue
        out.add(s.replace("\\", "/"))
    return out


FACTORY_OWNED = (".factory/",)


def changed_paths(root: Path) -> list[str]:
    out = []
    for line in git(root, "status", "--porcelain", "-uall").splitlines():
        p = line[3:].strip().strip('"')
        if " -> " in p:
            p = p.split(" -> ")[-1]
        p = p.replace("\\", "/")
        if p and p != ".gitignore":
            out.append(p)
    return out


def fmt_seconds(s: float) -> str:
    if s < 60:
        return f"{s:.0f}s"
    if s < 3600:
        return f"{s / 60:.1f}m"
    return f"{s / 3600:.1f}h"


# ---------------------------------------------------------------- commands

def cmd_init(args: argparse.Namespace) -> int:
    root = Path(args.repo).resolve()
    if not root.is_dir():
        die(f"repo not found: {root}")
    fdir = root / ".factory" / args.slug
    if fdir.exists() and not args.force:
        die(f"{fdir} already exists; pass --force to recreate")
    if args.force and fdir.exists():
        import shutil

        shutil.rmtree(fdir)
    titles = [t.strip() for t in args.tickets.split(";") if t.strip()] if args.tickets else []

    fdir.mkdir(parents=True)
    (fdir / "evidence").mkdir()
    (fdir / "workers").mkdir()
    (fdir / "tickets").mkdir()
    (fdir / "report").mkdir()

    write(fdir / "brief.md", read(ASSETS / "brief.md").replace("<name>", args.name))
    write(fdir / "spec.md", read(ASSETS / "spec.md").replace("<name>", args.name))
    if args.ui:
        write(fdir / "DESIGN.md", read(ASSETS / "design.md"))
    if not titles:
        titles = [args.name]
    ids = [f"{i:02d}" for i in range(1, len(titles) + 1)]
    for i, t in enumerate(titles, start=1):
        tpl = read(ASSETS / "ticket.md")
        tpl = tpl.replace("<NN>", f"{i:02d}").replace("<title>", t).replace("<nn>", f"{i:02d}")
        write(fdir / "tickets" / f"{i:02d}-{slugify(t)}.md", tpl)

    state = {
        "slug": args.slug,
        "name": args.name,
        "repo": str(root),
        "mode": args.mode,
        "created": now(),
        "updated": now(),
        "created_ts": time.time(),
        "interventions": 0,
        "workers": args.workers,
        "max_attempts": args.max_attempts,
        "tickets": {},
    }
    for tid in ids:
        state["tickets"][tid] = {
            "attempts": 0,
            "status": "pending",
            "first_pass": None,
            "history": [],
        }
    save_state(fdir, state)

    gitignore = root / ".gitignore"
    entries = ["__pycache__/", "*.pyc"]
    existing = read(gitignore)
    missing = [e for e in entries if e not in existing]
    if missing:
        sep = "" if not existing or existing.endswith("\n") else "\n"
        write(gitignore, existing + sep + "\n".join(missing) + "\n")

    print(f"factory {args.slug} ready in {fdir}")
    print(f"  tickets: {', '.join(ids)}  mode: {args.mode}  workers: {args.workers}")
    print("next: fill spec.md + tickets, then: factory.py plan --slug " + args.slug)
    return EXIT_OK


def cmd_plan(args: argparse.Namespace) -> int:
    root = Path(args.repo).resolve()
    fdir = root / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    if not tickets:
        die("no tickets found")
    errors = []
    errors.extend(spec_problems(fdir, state.get("name", "")))
    ids = {t["id"] for t in tickets}
    for t in tickets:
        for d in t["deps"]:
            if d not in ids:
                errors.append(f"{t['id']} depends on unknown ticket {d}")
        if not t["proof"] or is_placeholder(t["proof"]):
            errors.append(f"{t['id']} has no runnable Proof command")
        if not t["acceptance"] or any(is_placeholder(a) for a in t["acceptance"]):
            errors.append(f"{t['id']} acceptance criteria are still placeholders")
    # cycle detection
    graph = {t["id"]: t["deps"] for t in tickets}
    color: dict[str, int] = {}

    def visit(n: str, trail: list[str]) -> None:
        if color.get(n) == 1:
            errors.append("dependency cycle: " + " -> ".join(trail + [n]))
            return
        if color.get(n) == 2:
            return
        color[n] = 1
        for d in graph.get(n, []):
            visit(d, trail + [n])
        color[n] = 2

    for t in tickets:
        visit(t["id"], [])

    ready, waiting = frontier(tickets)

    # Two tickets that share a file cannot be dispatched in parallel.
    for i, a in enumerate(ready):
        for b in ready[i + 1:]:
            shared = ticket_allowlist(a) & ticket_allowlist(b)
            if shared:
                errors.append(f"{a['id']} and {b['id']} both write {', '.join(sorted(shared))}; merge them")

    for t in tickets:
        state["tickets"].setdefault(t["id"], {"attempts": 0, "status": "pending", "first_pass": None, "history": []})
    save_state(fdir, state)

    warnings = []
    current_sha = sha12(read(fdir / "spec.md"))
    for t in tickets:
        if t["branch"] and not git(root, "branch", "--list", t["branch"]).strip():
            warnings.append(f"{t['id']} declares Branch {t['branch']} but no such branch exists; "
                            "the factory runs one tree - drop the line")
    for tid, rec in state["tickets"].items():
        if rec.get("spec_sha") and rec["spec_sha"] != current_sha and rec.get("status") != "done":
            warnings.append(f"the packet for {tid} was cut from an older spec.md; re-cut it before verify")

    print(f"plan {args.slug}: {len(tickets)} tickets, {len(ready)} ready, {len(waiting)} waiting")
    for t in tickets:
        print(f"  {t['id']}  {t['status']:<8} {t['title']}")
    for w in warnings:
        print(f"WARN  {w}")
    if errors:
        for e in errors:
            print(f"FAIL  {e}")
        return EXIT_FAIL
    print("PASS  plan is executable")
    for t in ready:
        print(f"ready: {t['id']}  {t['title']}")
    return EXIT_OK


def cmd_next(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    ready, waiting = frontier(tickets)
    if not ready and not waiting:
        print("all tickets closed")
        return EXIT_OK
    for t in ready:
        print(f"{t['id']}  {t['title']}")
    for t in waiting:
        print(f"    {t['id']} waiting on {', '.join(t['deps'])}")
    return EXIT_OK


def cmd_packet(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    match = [t for t in tickets if t["id"] == args.ticket]
    if not match:
        die(f"no ticket {args.ticket}")
    t = match[0]
    rec = state["tickets"].setdefault(t["id"], {"attempts": 0, "status": "pending", "history": []})
    attempt = args.attempt or rec["attempts"] + 1
    feedback = ""
    if attempt > 1 and rec["history"]:
        last = rec["history"][-1]
        feedback = (
            "\n## Previous attempt failed\n\n"
            f"- attempt: {last.get('attempt')}\n"
            f"- gate output tail:\n\n```\n{last.get('tail', '(no output)')}\n```\n\n"
            "Fix the cause of that failure. Do not start over; the earlier work is still in the repo.\n"
        )
    problems = spec_problems(fdir, state.get("name", ""))
    if problems:
        die("; ".join(problems) + " - fill spec.md before dispatching a worker")
    spec = read(fdir / "spec.md")
    design = read(fdir / "DESIGN.md").strip()
    design_block = ""
    if design and design != read(ASSETS / "design.md").strip():
        design_block = f"## Design system (use when the slice touches UI)\n{design}\n\n"
    notes = t["sections"].get("notes", "").strip()
    notes_block = ""
    if notes and not is_placeholder(notes):
        notes_block = f"## Notes from the planner (binding)\n{notes}\n\n"
    proof = t["proof"]
    acceptance = "\n".join(f"- {a}" for a in t["acceptance"]) or "- (none listed)"
    files = t["sections"].get("files", "(none listed)")
    packet = f"""# Worker packet: {t['id']} {t['title']}

You are a worker in a lights-out software factory. Nobody will answer questions.
Make a defensible decision, record it in `NOTES`, and keep going.

## Repository
{state['repo']}

## The slice you own
Ticket {t['id']}: {t['title']}

{t['sections'].get('problem', '(no problem statement)')}

## Acceptance criteria
{acceptance}

{notes_block}## Files you may touch
{files}

## Proof command (must exit 0)
```
{proof}
```

## Spec context
{spec}

{design_block}## Rules
1. Smallest diff that satisfies the acceptance criteria. No speculative abstractions, no new dependencies.
2. Read before writing. Match the existing style. Touch only the files listed above.
3. Write or update the test first when the proof command is a test command, then make it pass.
4. Run the proof command yourself before finishing. If it fails, fix and rerun; do not report success you did not observe.
5. Surface surprises in NOTES instead of silently widening scope.

## Report format (exact)
Last message must be:

STATUS: done | blocked
PROOF: <one line: what you ran and the observed result>
FILES: <space separated paths you changed>
NOTES: <one line: decisions made or what blocked you>
{feedback}"""
    path = fdir / "workers" / f"{t['id']}-attempt-{attempt}.md"
    write(path, packet)
    rec["last_packet_attempt"] = attempt
    rec["packets"] = rec.get("packets", []) + [path.name]
    rec["spec_sha"] = sha12(spec)
    save_state(fdir, state)
    print(path)
    print(f"attempt {attempt} of {state['max_attempts']} for ticket {t['id']}", file=sys.stderr)
    return EXIT_OK


TEST_COUNT = re.compile(r"(?:Ran\s+(\d+)\s+tests?|(\d+)\s+passed|Tests:\s+(\d+))", re.I)
ZERO_TEST_SIGNALS = re.compile(r"no tests ran|ran 0 tests|0 passed", re.I)


def count_tests(output: str) -> int | None:
    best = None
    for m in TEST_COUNT.finditer(output):
        groups = [g for g in m.groups() if g]
        if groups:
            best = max(best or 0, int(groups[0]))
    return best


def cmd_verify(args: argparse.Namespace) -> int:
    root = Path(args.repo).resolve()
    fdir = root / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    match = [t for t in tickets if t["id"] == args.ticket]
    if not match:
        die(f"no ticket {args.ticket}")
    t = match[0]
    if not t["proof"] or is_placeholder(t["proof"]):
        die(f"ticket {t['id']} has no runnable proof command")
    rec = state["tickets"].setdefault(t["id"], {"attempts": 0, "status": "pending", "history": []})
    attempt = args.attempt or rec.get("last_packet_attempt") or rec["attempts"] + 1
    stale = bool(rec.get("spec_sha")) and rec["spec_sha"] != sha12(read(fdir / "spec.md"))
    started = time.time()

    cmd = t["proof"]
    if os.name == "nt":
        proc = subprocess.run(cmd, cwd=root, shell=True, capture_output=True, text=True,
                              encoding="utf-8", errors="replace", timeout=args.timeout)
    else:
        proc = subprocess.run(["/bin/sh", "-c", cmd], cwd=root, capture_output=True, text=True,
                              encoding="utf-8", errors="replace", timeout=args.timeout)
    output = (proc.stdout or "") + (proc.stderr or "")
    elapsed = time.time() - started
    log = fdir / "evidence" / f"{t['id']}-attempt-{attempt}.txt"
    write(log, f"$ {cmd}\n# exit {proc.returncode} in {elapsed:.1f}s\n{output}")

    tests = count_tests(output)
    zero_tests = bool(ZERO_TEST_SIGNALS.search(output)) or tests == 0
    changed = changed_paths(root)
    allow = ticket_allowlist(t)
    siblings: set[str] = set()
    for o in tickets:
        if o["id"] != t["id"]:
            siblings |= ticket_allowlist(o)
    drift = [p for p in changed if allow and p not in allow and p not in siblings
             and not p.startswith(FACTORY_OWNED)]
    # An empty `__init__.py` is a toolchain marker, not a design decision. Report it, do not police it.
    markers = [p for p in drift if p.endswith("__init__.py") and not read(root / p).strip()]
    drift = [p for p in drift if p not in markers]
    if markers:
        print("note  package markers added: " + ", ".join(markers))
    ok = proc.returncode == 0 and not (args.require_tests and zero_tests)
    expected_miss = args.expect_tests and tests is not None and tests != args.expect_tests
    if expected_miss:
        ok = False
    first_pass = ok and attempt == 1

    rec["attempts"] = attempt
    rec["status"] = "done" if ok else "failed"
    if first_pass and rec.get("first_pass") is None:
        rec["first_pass"] = True
    # A re-run of the same attempt replaces its history row instead of duplicating it.
    rec["history"] = [h for h in rec["history"] if h.get("attempt") != attempt]
    rec["history"].append({
        "attempt": attempt,
        "at": now(),
        "exit": proc.returncode,
        "seconds": round(elapsed, 1),
        "tests": tests,
        "tail": output[-1500:],
        "ok": ok,
        "drift": drift,
        "spec_stale": stale,
    })
    save_state(fdir, state)

    print(f"{'PASS' if ok else 'FAIL'}  {t['id']} attempt {attempt}  exit {proc.returncode}  {elapsed:.1f}s"
          + (f"  tests={tests}" if tests is not None else ""))
    print(f"log: {log.relative_to(root)}")
    if args.require_tests and zero_tests and proc.returncode == 0:
        print("FAIL  test command exited 0 but ran no tests (false pass rejected)")
    if expected_miss:
        print(f"FAIL  expected {args.expect_tests} tests, gate ran {tests} (slice evidence is not attributable)")
    if stale:
        rec["spec_stale_gates"] = rec.get("spec_stale_gates", 0) + 1
        save_state(fdir, state)
        print("WARN  spec.md changed after the packet was cut; the worker acted on an older contract"
              " - re-cut the packet before trusting this gate")
    elif state.get("mode") == "lite" and args.expect_tests is None and tests is not None:
        print("WARN  no --expect-tests: the gate count is not attributable to this slice")
    if drift:
        if args.waive_drift:
            rec["drift_waiver"] = {"paths": drift, "reason": args.waive_drift, "at": now()}
            save_state(fdir, state)
            print("waived scope drift: " + ", ".join(drift) + f" ({args.waive_drift})")
        else:
            print("WARN  scope drift: " + ", ".join(drift) + " not in the ticket Files list")
    if ok:
        set_status(t["path"], "done")
        ticked = tick_boxes(t["path"])
        if ticked:
            print(f"ticked {ticked} acceptance box(es) on ticket {t['id']}")
        diff = git(root, "status", "--porcelain")
        if not diff:
            print("WARN  no working-tree changes; did the slice already exist?")
    else:
        tail = "\n".join(output.strip().splitlines()[-15:])
        print("--- last 15 lines ---")
        print(tail)
    return EXIT_OK if ok else EXIT_FAIL


def cmd_record(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    state = load_state(fdir)
    rec = state["tickets"].setdefault(args.ticket, {"attempts": 0, "status": "pending", "history": []})
    rec["attempts"] = args.attempt
    rec["status"] = args.status
    rec["history"].append({"attempt": args.attempt, "at": now(), "worker": args.status,
                           "notes": args.notes, "evidence": args.evidence or ""})
    save_state(fdir, state)
    print(f"recorded {args.ticket} attempt {args.attempt}: {args.status}")
    return EXIT_OK


def cmd_block(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    match = [t for t in tickets if t["id"] == args.ticket]
    if not match:
        die(f"no ticket {args.ticket}")
    set_status(match[0]["path"], "blocked")
    rec = state["tickets"].setdefault(args.ticket, {"attempts": 0, "history": []})
    rec["status"] = "blocked"
    state.setdefault("escalations", []).append({
        "ticket": args.ticket, "at": now(), "reason": args.reason,
        "attempts": rec.get("attempts", 0),
    })
    save_state(fdir, state)
    esc = fdir / "escalation.md"
    text = read(esc)
    if not text.strip():
        text = "# Escalations\n\nA ticket lands here after the attempt budget is spent. Nothing below is a question; each entry is a hypothesis plus the evidence to retry it.\n\n"
    text += f"""
## {args.ticket}  {match[0]['title']}

- blocked at: {now()}
- attempts: {rec.get('attempts', 0)}
- reason: {args.reason}
- next hypothesis: {args.hypothesis or 'split the slice smaller or pin the failing seam with a direct test'}
- evidence: {args.evidence or '(see .factory evidence dir)'}
"""
    write(esc, text)
    print(f"blocked {args.ticket}; escalation appended")
    return EXIT_OK


def cmd_review(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    done = [t for t in tickets if t["status"] == "done"]
    prompt_dir = fdir / "review"
    header = f"# Review: {args.slug}\n\nTickets: {len(tickets)}  done: {len(done)}  blocked: {len(tickets) - len(done)}\n\n"
    axes = {
        "standards": (
            "Review ONLY for code standards and maintainability. Do not judge whether the feature is correct.",
            "Cite file:line for every finding. Severity: must-fix or note.",
        ),
        "spec": (
            "Review ONLY whether the change matches spec.md and each ticket's acceptance criteria. Do not judge style.",
            "List any acceptance criterion not demonstrably met, with the evidence you looked for and did not find.",
        ),
        "proof": (
            "Review ONLY whether the evidence is real: does the proof command actually exercise the acceptance criteria, "
            "are the tests meaningful (would they fail if the behavior regressed), is anything asserted without running it?",
            "Name any claim that lacks a run, and any test that cannot fail.",
        ),
    }
    for name, (focus, shape) in axes.items():
        write(prompt_dir / f"{name}.md", f"""# {name} review

Repository: {Path(args.repo).resolve()}
Factory: .factory/{args.slug}

{focus}

{shape}

Read: .factory/{args.slug}/spec.md, tickets, evidence/*.txt, and `git diff` since the branch point.

End with exactly one line:

VERDICT: ship | rework
""")
    if args.verdict:
        body = read(fdir / "review.md") or header
        body = re.sub(r"^VERDICT:.*$", "", body, flags=re.M).rstrip()
        body += f"\n\nVERDICT: {args.verdict}\n\nNotes: {args.notes or '(none)'}\n"
        write(fdir / "review.md", body)
        print(f"verdict recorded: {args.verdict}")
        return EXIT_OK
    write(fdir / "review.md", header + "\n## Verdict\n\nVERDICT: pending\n")
    print(f"review prompts written to {prompt_dir}")
    for name in axes:
        print(f"  {prompt_dir / (name + '.md')}")
    return EXIT_OK


def cmd_report(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    attempts = sum(r.get("attempts", 0) for r in state["tickets"].values())
    done = [t for t in tickets if t["status"] == "done"]
    blocked = [t for t in tickets if t["status"] == "blocked"]
    first_pass = sum(1 for r in state["tickets"].values() if r.get("first_pass"))
    lead = time.time() - state.get("created_ts", time.time())
    review = read(fdir / "review.md")
    m = re.search(r"^VERDICT:\s*(\w+)", review, re.M)
    verdict = m.group(1) if m else "pending"
    escalations = state.get("escalations", [])
    gates = sum(len(r.get("history", [])) for r in state["tickets"].values())
    waivers = [r["drift_waiver"] for r in state["tickets"].values() if r.get("drift_waiver")]

    data = {
        "slug": state["slug"],
        "name": state["name"],
        "mode": state.get("mode"),
        "created": state.get("created"),
        "updated": state.get("updated"),
        "tickets": len(tickets),
        "done": len(done),
        "blocked": len(blocked),
        "attempts": attempts,
        "first_pass_rate": round(first_pass / len(tickets), 3) if tickets else 0,
        "mean_attempts": round(attempts / len(tickets), 2) if tickets else 0,
        "gate_runs": gates,
        "interventions": state.get("interventions", 0),
        "escalations": len(escalations),
        "drift_waivers": len(waivers),
        "lead_time_seconds": round(lead),
        "lead_time_human": fmt_seconds(lead),
        "verdict": verdict,
    }
    write(fdir / "report" / "report.json", json.dumps(data, indent=2) + "\n")
    rows = "\n".join(
        f"| {t['id']} | {t['title']} | {t['status']} | {state['tickets'].get(t['id'], {}).get('attempts', 0)} |"
        for t in tickets
    )
    md = f"""# Factory report: {state['name']}

Generated {now()} from `.factory/{state['slug']}/state.json`.

| Metric | Value |
|---|---|
| tickets | {data['tickets']} |
| done | {data['done']} |
| blocked | {data['blocked']} |
| gate runs | {data['gate_runs']} |
| attempts | {data['attempts']} |
| first-pass rate | {data['first_pass_rate']} |
| mean attempts per ticket | {data['mean_attempts']} |
| human interventions | {data['interventions']} |
| escalations | {data['escalations']} |
| drift waivers | {data['drift_waivers']} |
| lead time | {data['lead_time_human']} |
| review verdict | {data['verdict']} |

## Tickets

| id | title | status | attempts |
|---|---|---|---|
{rows}

## Reading

- interventions 0 means the run never needed a human question.
- first-pass rate is tickets that passed the gate on attempt 1.
- escalations are tickets that spent the attempt budget; see escalation.md for the retry hypothesis.
"""
    write(fdir / "report" / "report.md", md)
    print(md)
    return EXIT_OK


def cmd_status(args: argparse.Namespace) -> int:
    fdir = Path(args.repo).resolve() / ".factory" / args.slug
    state = load_state(fdir)
    tickets = [parse_ticket(p) for p in ticket_files(fdir)]
    ready, waiting = frontier(tickets)
    print(f"{state['name']}  ({state['mode']}, {len(tickets)} tickets)")
    for t in tickets:
        rec = state["tickets"].get(t["id"], {})
        print(f"  {t['id']}  {t['status']:<8} attempts={rec.get('attempts', 0)}  {t['title']}")
    print(f"ready: {', '.join(t['id'] for t in ready) or '(none)'}")
    return EXIT_OK


def cmd_doctor(args: argparse.Namespace) -> int:
    pkg = Path(__file__).resolve().parent.parent
    errs: list[str] = []
    notes: list[str] = []

    def files(base: Path) -> list[Path]:
        return sorted(
            p for p in base.rglob("*")
            if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc"
        )

    skill = pkg / "SKILL.md"
    text = read(skill) if skill.is_file() else ""
    if not text:
        errs.append("SKILL.md missing")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        errs.append("SKILL.md has no `---` frontmatter")
    else:
        fm = m.group(1)
        nm = re.search(r"^name:\s*(\S+)\s*$", fm, re.M)
        if not nm:
            errs.append("frontmatter: missing name")
        elif nm.group(1) != "dark-factory":
            errs.append(f"frontmatter: name is {nm.group(1)!r}, expected 'dark-factory'")
        dm = re.search(r'^description:\s*"(.*)"\s*$', fm, re.M)
        if not dm:
            errs.append("frontmatter: description must be one double-quoted line")
        elif len(dm.group(1)) > 500:
            errs.append(f"frontmatter: description {len(dm.group(1))} chars > 500")
        else:
            notes.append(f"description {len(dm.group(1))} chars")

    for rel in ["scripts/factory.py", "assets/brief.md", "assets/spec.md", "assets/design.md",
                "assets/ticket.md", "references/composition.md", "references/design.md",
                "references/dispatch.md", "references/gates.md", "references/learn.md"]:
        if not (pkg / rel).is_file():
            errs.append(f"missing {rel}")

    skill_bytes = len(text.encode("utf-8"))
    ref_bytes = sum(p.stat().st_size for p in files(pkg / "references"))
    asset_bytes = sum(p.stat().st_size for p in files(pkg / "assets"))
    notes.append(f"SKILL {skill_bytes} B, references {ref_bytes} B, assets {asset_bytes} B")
    if skill_bytes > 9000:
        errs.append(f"SKILL.md is {skill_bytes} B, over the 9000 B router budget")

    if args.target:
        tgt = Path(args.target)
        src = {p.relative_to(pkg).as_posix(): p for p in files(pkg)}
        dst = {p.relative_to(tgt).as_posix(): p for p in files(tgt)}
        for rel, sp in src.items():
            tp = dst.get(rel)
            if tp is None:
                errs.append(f"installed copy missing {rel}")
            elif hashlib.sha256(sp.read_bytes()).hexdigest() != hashlib.sha256(tp.read_bytes()).hexdigest():
                errs.append(f"hash differs: {rel}")
        for rel in dst:
            if rel not in src:
                errs.append(f"installed copy has extra file {rel}")
        notes.append(f"compared {len(src)} files against {tgt}")

    print(f"package: {pkg}")
    for n in notes:
        print(f"  {n}")
    for e in errs:
        print(f"FAIL  {e}")
    if errs:
        return EXIT_FAIL
    print("PASS  package is installable")
    return EXIT_OK


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "ticket"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="factory.py", description="Dark Factory driver")
    sub = ap.add_subparsers(dest="command", required=True)

    def base(name: str, help_text: str) -> argparse.ArgumentParser:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--slug", required=True)
        p.add_argument("--repo", default=".")
        return p

    p = base("init", "scaffold a factory workspace")
    p.add_argument("--name", required=True)
    p.add_argument("--mode", choices=["lite", "standard"], default="lite")
    p.add_argument("--tickets", default="", help="semicolon separated ticket titles")
    p.add_argument("--workers", type=int, default=2)
    p.add_argument("--max-attempts", type=int, default=3)
    p.add_argument("--force", action="store_true")
    p.add_argument("--ui", action="store_true", help="also scaffold DESIGN.md for UI slices")
    p.set_defaults(func=cmd_init)

    base("plan", "validate the ticket graph and print the frontier").set_defaults(func=cmd_plan)
    base("next", "print ready tickets").set_defaults(func=cmd_next)
    base("status", "show ticket state").set_defaults(func=cmd_status)

    p = base("packet", "write the worker packet for a ticket")
    p.add_argument("--ticket", required=True)
    p.add_argument("--attempt", type=int, default=0)
    p.set_defaults(func=cmd_packet)

    p = base("verify", "run a ticket's proof command and record the gate")
    p.add_argument("--ticket", required=True)
    p.add_argument("--attempt", type=int, default=0)
    p.add_argument("--timeout", type=int, default=600)
    p.add_argument("--require-tests", action="store_true", default=True)
    p.add_argument("--no-require-tests", dest="require_tests", action="store_false")
    p.add_argument("--waive-drift", default="", help="record a reason for out-of-allowlist paths")
    p.add_argument("--expect-tests", type=int, default=0, help="fail unless the gate ran exactly N tests")
    p.set_defaults(func=cmd_verify)

    p = base("record", "record a worker-reported attempt without a local gate run")
    p.add_argument("--ticket", required=True)
    p.add_argument("--attempt", type=int, required=True)
    p.add_argument("--status", required=True, choices=["done", "failed", "blocked"])
    p.add_argument("--notes", default="")
    p.add_argument("--evidence", default="")
    p.set_defaults(func=cmd_record)

    p = base("block", "escalate a ticket after the attempt budget")
    p.add_argument("--ticket", required=True)
    p.add_argument("--reason", required=True)
    p.add_argument("--hypothesis", default="")
    p.add_argument("--evidence", default="")
    p.set_defaults(func=cmd_block)

    p = base("review", "write the three review prompts and record the verdict")
    p.add_argument("--verdict", choices=["ship", "rework"], default=None)
    p.add_argument("--notes", default="")
    p.set_defaults(func=cmd_review)

    base("report", "write report.md and report.json").set_defaults(func=cmd_report)

    p = sub.add_parser("doctor", help="check the package and compare it with an installed copy")
    p.add_argument("--target", default="", help="installed copy to compare against")
    p.set_defaults(func=cmd_doctor)

    args = ap.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
