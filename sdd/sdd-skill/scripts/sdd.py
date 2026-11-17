#!/usr/bin/env python3
"""SDD helper: scaffold artifacts, run-and-record evidence, check gates.

Commands:
  init     scaffold .sdd/<slug>/ from the skill's templates
  run      execute a command, capture its log, append a ledger row
  check    validate the current gate (and instruction budgets)
  next     print the ticket frontier
  review   validate a fixed point and generate three reviewer prompts
  ask      turn owner-scoped unknowns into one decision packet
  bench    static process-cost metrics for the skill tree
  doctor   verify the installed copy and the skill's contract

The script is optional. Without it, the same work is done manually; see
references/operations.md. Python 3.9+.
"""

import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
GATE_ORDER = ["G0", "G1", "G2", "G3", "G4", "G5"]

BUDGETS = {
    "SKILL.md": 7000,
    "references": 6000,
    "assets": 4000,
    "docs": 20000,
    "total": 75000,
}

SMELLS = [
    "Mysterious Name", "Duplicated Code", "Feature Envy", "Data Clumps",
    "Primitive Obsession", "Repeated Switches", "Shotgun Surgery",
    "Divergent Change", "Speculative Generality", "Message Chains",
    "Middle Man", "Refused Bequest",
]

LITE_REFS = ["references/lite.md"]
STANDARD_REFS = [
    "references/frame.md", "references/specify.md", "references/decompose.md",
    "references/build.md", "references/verify.md", "references/ship-learn.md",
    "references/evidence.md",
]
AGENT_TEMPLATES = [
    "assets/brief.md", "assets/spec.md", "assets/ticket.md",
    "assets/evidence-ledger.md", "assets/review.md", "assets/pr.md",
    "assets/retro.md",
]


# ---------- small helpers ----------

def today():
    return datetime.date.today().isoformat()


def now():
    return datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")


def die(msg, code=2):
    print(f"error: {msg}", file=sys.stderr)
    raise SystemExit(code)


def read(path):
    return Path(path).read_text(encoding="utf-8-sig")


def write(path, text):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8", newline="\n")


def find_root(start=None):
    cur = Path(start or os.getcwd()).resolve()
    for candidate in [cur, *cur.parents]:
        if (candidate / ".sdd").is_dir():
            return candidate
    return cur


def feature_dir(root, slug):
    return Path(root) / ".sdd" / slug


def rel(path, root):
    try:
        return str(Path(path).resolve().relative_to(Path(root).resolve()))
    except ValueError:
        return str(path)


def run_git(root, *args, check=False):
    proc = subprocess.run(["git", "-C", str(root), *args],
                          capture_output=True, text=True, encoding="utf-8",
                          errors="replace")
    if check and proc.returncode != 0:
        die(f"git {' '.join(args)} failed: {proc.stderr.strip()}")
    return proc


def git_available(root):
    return run_git(root, "rev-parse", "--is-inside-work-tree").returncode == 0


def substitute(text, mapping):
    for key, value in mapping.items():
        text = text.replace(key, value)
    return text.replace("YYYY-MM-DD", today())


def template(name, mapping):
    path = SKILL_ROOT / name
    if not path.is_file():
        die(f"template missing: {name}")
    return substitute(read(path), mapping)


def scaffold_files(slug, name, mode, tickets):
    mapping = {
        "<feature-slug>": slug,
        "<feature name>": name,
        "<slug>": slug,
        "<date>": today(),
    }
    files = {}
    if mode != "lite":
        files[f".sdd/{slug}/brief.md"] = template("assets/brief.md", {
            **mapping, "standard | lite | wayfinder": mode})
    if mode != "lite":
        files[f".sdd/{slug}/spec.md"] = template("assets/spec.md", mapping)
    ticket_src = "assets/ticket.md" if mode != "lite" else "assets/lite-ticket.md"
    titles = tickets or ([name] if mode == "lite" else [])
    for index, title in enumerate(titles, start=1):
        nn = f"{index:02d}"
        body = template(ticket_src, {**mapping, "<ticket title>": title,
                                     "<short-title>": slugify(title),
                                     "<NN>": nn, "NN": nn, "<title>": title})
        body = re.sub(r"^#\s+(?:\d+\s*:\s*)?", f"# {nn}: ", body, count=1, flags=re.M)
        files[f".sdd/{slug}/tickets/{nn}-{slugify(title)}.md"] = body
    files[f".sdd/{slug}/evidence.md"] = template("assets/evidence-ledger.md", mapping)
    if mode == "wayfinder":
        files[f".sdd/{slug}/map.md"] = template("assets/map.md", mapping)
    return files


def slugify(text):
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text or "ticket"


def ensure_gitignore(root):
    path = Path(root) / ".gitignore"
    lines = read(path).splitlines() if path.is_file() else []
    wanted = ["__pycache__/", ".sdd/*/evidence/"]
    added = []
    for entry in wanted:
        if entry not in lines:
            lines.append(entry)
            added.append(entry)
    write(path, "\n".join(lines).rstrip() + "\n")
    return added


def next_evidence_index(evidence_dir):
    if not evidence_dir.is_dir():
        return 1
    return len([p for p in evidence_dir.iterdir() if p.is_file()]) + 1


def summarize(log_text):
    lines = [line.strip() for line in log_text.splitlines() if line.strip()]
    patterns = [
        r"^Ran \d+ tests?",
        r"^OK\b",
        r"^FAILED\b",
        r"^ERROR\b",
        r"Error:",
        r"Traceback \(most recent call last\)",
    ]
    hits = [line for line in lines if any(re.search(p, line) for p in patterns)]
    if hits:
        return " / ".join(dict.fromkeys(hits[-3:]))
    return lines[-1] if lines else "no output"


def append_ledger_row(ledger_path, row):
    if not ledger_path.is_file():
        write(ledger_path, "# Evidence ledger\n\n| Ticket | Criterion | Command | Observed | Raw output | Date |\n|---|---|---|---|---|---|\n")
    lines = read(ledger_path).splitlines()
    lines = [line for line in lines if not (line.startswith("|") and "<criterion>" in line)]
    header = next((i for i, line in enumerate(lines) if line.startswith("| Ticket")), None)
    if header is None:
        lines += ["", "| Ticket | Criterion | Command | Observed | Raw output | Date |",
                  "|---|---|---|---|---|---|", row]
        write(ledger_path, "\n".join(lines) + "\n")
        return
    end = header + 1
    if end < len(lines) and set(lines[end].replace("|", "").strip()) <= set("-: "):
        end += 1
    while end < len(lines) and lines[end].startswith("|"):
        end += 1
    lines.insert(end, row)
    write(ledger_path, "\n".join(lines) + "\n")


# ---------- init ----------

def cmd_init(args):
    root = Path(args.root).resolve()
    if not args.slug or not re.fullmatch(r"[a-z0-9][a-z0-9-]*", args.slug):
        die("--slug must be kebab-case (lowercase letters, digits, hyphens)")
    fdir = feature_dir(root, args.slug)
    if fdir.exists() and not args.force:
        die(f"{rel(fdir, root)} already exists; use --force to overwrite templates")
    tickets = [t.strip() for t in (args.tickets or "").split(";") if t.strip()]
    if args.mode == "standard" and not tickets:
        tickets = [args.name]
    files = scaffold_files(args.slug, args.name, args.mode, tickets)
    for target, body in files.items():
        path = root / target
        path.parent.mkdir(parents=True, exist_ok=True)
        write(path, body)
    write(fdir / ".mode", args.mode + "\n")
    (fdir / "evidence").mkdir(parents=True, exist_ok=True)
    (fdir / "decisions").mkdir(parents=True, exist_ok=True)
    (fdir / "tickets").mkdir(parents=True, exist_ok=True)
    added = ensure_gitignore(root)
    print(f"scaffolded {rel(fdir, root)} (mode: {args.mode})")
    for target in sorted(files):
        print(f"  + {target}")
    if added:
        print(f"  .gitignore: added {', '.join(added)}")
    print(f"next: " + (f"fill the ticket Spec, then run: sdd.py check --slug {args.slug} --gate G0"
                       if args.mode == "lite" else
                       f"fill brief.md, then run: sdd.py check --slug {args.slug} --gate G0"))
    return 0


# ---------- run ----------

def record_run(root, slug, ticket, criterion, label, cmd):
    fdir = feature_dir(root, slug)
    if not fdir.is_dir():
        die(f"no feature at {rel(fdir, root)}")
    evidence_dir = fdir / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    index = next_evidence_index(evidence_dir)
    label = re.sub(r"[^a-z0-9-]+", "-", label.lower()).strip("-") or "run"
    log_path = evidence_dir / f"{index:02d}-{label}.txt"
    proc = subprocess.run(cmd, cwd=str(root), capture_output=True,
                          text=True, encoding="utf-8", errors="replace")
    log_text = (proc.stdout or "") + (proc.stderr or "")
    write(log_path, log_text)
    observed = f"exit {proc.returncode}; {summarize(log_text)}"
    command = " ".join(cmd)
    row = f"| T{ticket.upper().lstrip('T')} | {criterion} | `{command}` | {observed} | {rel(log_path, root)} | {today()} |"
    append_ledger_row(fdir / "evidence.md", row)
    print(f"exit {proc.returncode}")
    print(f"observed: {observed}")
    print(f"log: {rel(log_path, root)}")
    print(f"ledger: {rel(fdir / 'evidence.md', root)}")
    if proc.returncode != 0:
        tail = log_text.splitlines()[-15:]
        print("--- last 15 lines ---")
        print("\n".join(tail))
    return proc.returncode


def cmd_run(args):
    if not args.cmd:
        die("run needs a command after --")
    root = Path(args.root).resolve()
    return record_run(root, args.slug, args.ticket, args.criterion, args.label, args.cmd)


# ---------- check ----------

def parse_ticket(path):
    text = read(path)
    ticket = {"path": path, "status": None, "blockers": [], "criteria": 0, "title": ""}
    title = re.search(r"^#\s+(?:\d+\s*:\s*)?(.+)$", text, re.M)
    ticket["title"] = title.group(1).strip() if title else path.stem
    status = re.search(r"^\s*Status:\s*([A-Za-z-]+)", text, re.M)
    ticket["status"] = status.group(1).lower() if status else None
    blocked = re.search(r"^##\s+Blocked by\s*$(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    if blocked:
        for line in blocked.group(1).splitlines():
            item = re.match(r"^\s*-\s*(?:T)?(\d{2})\b", line)
            if item and item.group(1) != re.search(r"^(\d{2})-", path.name).group(1):
                ticket["blockers"].append(item.group(1))
    criteria = re.search(r"^##\s+Acceptance criteria\s*$(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    if criteria:
        ticket["criteria"] = len(re.findall(r"^\s*-\s*\[[ xX]\]", criteria.group(1), re.M))
    return ticket


def parse_tickets(fdir):
    tickets = []
    for path in sorted((fdir / "tickets").glob("*.md")):
        match = re.match(r"^(\d{2})-", path.name)
        if not match:
            continue
        ticket = parse_ticket(path)
        ticket["id"] = match.group(1)
        tickets.append(ticket)
    return tickets


def find_cycle(tickets):
    graph = {t["id"]: t["blockers"] for t in tickets}
    state = {}

    def visit(node, stack):
        if state.get(node) == "visiting":
            return stack[stack.index(node):] + [node]
        if state.get(node) == "done":
            return None
        state[node] = "visiting"
        for dep in graph.get(node, []):
            if dep in graph:
                found = visit(dep, stack + [node])
                if found:
                    return found
        state[node] = "done"
        return None

    for node in graph:
        found = visit(node, [])
        if found:
            return found
    return None


def frontier(tickets):
    done = {t["id"] for t in tickets if t["status"] == "done"}
    ready = []
    for ticket in tickets:
        if ticket["status"] != "ready":
            continue
        if all(dep in done for dep in ticket["blockers"] if dep in {x["id"] for x in tickets}):
            ready.append(ticket)
    return ready


def ledger_rows(fdir):
    path = fdir / "evidence.md"
    if not path.is_file():
        return []
    rows = []
    for line in read(path).splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 6:
            continue
        if not re.fullmatch(r"T?\d+", cells[0]):
            continue
        if any("<" in cell for cell in cells):
            continue
        rows.append(cells)
    return rows


def check_gate(fdir, gate):
    mode_path = fdir / ".mode"
    mode = read(mode_path).strip() if mode_path.is_file() else "standard"
    checks = []

    def add(ok, msg):
        checks.append((ok, msg))

    if gate == "G0":
        if mode == "lite":
            tickets = parse_tickets(fdir)
            add(bool(tickets), "lite: a ticket exists")
            for ticket in tickets:
                text = read(ticket["path"])
                problem = re.search(r"\*\*Problem\.\*\*\s*(.+)", text)
                add(bool(problem and "<" not in problem.group(1)),
                    f"lite {ticket['id']}: spec problem filled")
            return checks
        brief = fdir / "brief.md"
        add(brief.is_file(), "brief.md exists")
        if brief.is_file():
            text = read(brief)
            add(bool(re.search(r"^\s*Status:\s*accepted", text, re.M)), "brief accepted")
            add(not re.search(r"\bTBD\b", text), "no TBD in brief")
            for section in ["## Problem", "## Actor", "## Observable success", "## Non-goals"]:
                add(section in text, f"brief has {section}")
    elif gate == "G1":
        if mode == "lite":
            add(True, "lite mode: spec lives in the ticket")
        else:
            spec = fdir / "spec.md"
            add(spec.is_file(), "spec.md exists")
            if spec.is_file():
                text = read(spec)
                add(bool(re.search(r"^\s*Status:\s*accepted", text, re.M)), "spec accepted")
                for section in ["## Problem statement", "## Solution", "## User stories",
                                "## Implementation decisions", "## Testing decisions",
                                "## Out of scope"]:
                    add(section in text, f"spec has {section}")
                add(bool(re.search(r"Seams agreed with:\s*[^<\s]", text)), "seams agreed with a person")
    elif gate == "G2":
        tickets = parse_tickets(fdir)
        add(bool(tickets), "at least one ticket")
        for ticket in tickets:
            add(ticket["status"] is not None, f"{ticket['id']} has a status")
            add(ticket["criteria"] >= 1, f"{ticket['id']} has acceptance criteria")
        cycle = find_cycle(tickets) if tickets else None
        add(cycle is None, "ticket graph is acyclic" + (f" (cycle: {' -> '.join(cycle)})" if cycle else ""))
        closed = all(t["status"] in ("done", "blocked") for t in tickets) if tickets else False
        add(bool(frontier(tickets)) or closed, "frontier valid (ready work or all tickets closed)")
    elif gate == "G3":
        tickets = parse_tickets(fdir)
        rows = ledger_rows(fdir)
        done = [t for t in tickets if t["status"] == "done"]
        add(bool(done), "at least one ticket done")
        for ticket in done:
            ticket_rows = [r for r in rows if r[0].lstrip("Tt").zfill(2) == ticket["id"]]
            add(len(ticket_rows) >= ticket["criteria"],
                f"{ticket['id']} ledger rows {len(ticket_rows)} >= criteria {ticket['criteria']}")
        for row in rows:
            log = row[4]
            if log and not (fdir.parent.parent / log).is_file():
                add(False, f"ledger row points at missing log: {log}")
    elif gate == "G4":
        review = fdir / "review.md"
        add(review.is_file(), "review.md exists")
        if review.is_file():
            add(bool(re.search(r"^VERDICT:\s*(ship|rework|blocked)", read(review), re.M)),
                "review has a verdict line")
    elif gate == "G5":
        mode = read(fdir / ".mode").strip() if (fdir / ".mode").is_file() else "standard"
        add((fdir / "retro.md").is_file(), "retro.md exists")
        if mode == "lite":
            add(True, "lite mode: no PR body required")
        else:
            add((fdir / "pr.md").is_file(), "pr.md exists")
    else:
        die(f"unknown gate {gate}")
    return checks


def cmd_check(args):
    root = Path(args.root).resolve()
    fdir = feature_dir(root, args.slug)
    if not fdir.is_dir():
        die(f"no feature at {rel(fdir, root)}")
    gates = [args.gate] if args.gate else GATE_ORDER
    failures = 0
    for gate in gates:
        checks = check_gate(fdir, gate)
        for ok, msg in checks:
            print(f"{'PASS' if ok else 'FAIL'}  {gate}  {msg}")
            failures += 0 if ok else 1
    if args.budget:
        failures += check_budgets()
    print(f"\n{args.slug}: {'OK' if failures == 0 else f'{failures} failing check(s)'}")
    return 1 if failures else 0


def budget_limit(path):
    if path.name == "SKILL.md":
        return BUDGETS["SKILL.md"], "instruction"
    if "references" in path.parts:
        return BUDGETS["references"], "instruction"
    if "assets" in path.parts:
        return BUDGETS["assets"], "instruction"
    return BUDGETS["docs"], "docs"


def check_budgets(verbose=True):
    failures = 0
    instruction = 0
    for path in sorted(SKILL_ROOT.rglob("*")):
        if not path.is_file() or path.suffix != ".md":
            continue
        if "scripts" in path.parts or "bench" in path.parts:
            continue
        size = path.stat().st_size
        limit, kind = budget_limit(path)
        if kind == "instruction":
            instruction += size
        if size > limit:
            failures += 1
            if verbose:
                print(f"FAIL  budget  {path.name} {size} > {limit}")
    if instruction > BUDGETS["total"]:
        failures += 1
        if verbose:
            print(f"FAIL  budget  instruction total {instruction} > {BUDGETS['total']}")
    if verbose:
        verdict = "PASS" if failures == 0 else "FAIL"
        print(f"{verdict}  budget  instruction total {instruction} (limit {BUDGETS['total']})")
    return failures


# ---------- next ----------

def cmd_next(args):
    root = Path(args.root).resolve()
    fdir = feature_dir(root, args.slug)
    tickets = parse_tickets(fdir)
    ready = frontier(tickets)
    if not ready:
        if tickets and all(t["status"] in ("done", "blocked") for t in tickets):
            print("all tickets closed")
            return 0
        print("no ready tickets")
        return 1
    for ticket in ready:
        print(f"{ticket['id']}  {ticket['title']}  (blocked by: {', '.join(ticket['blockers']) or 'none'})")
    return 0


# ---------- finish ----------

def cmd_finish(args):
    root = Path(args.root).resolve()
    fdir = feature_dir(root, args.slug)
    if not fdir.is_dir():
        die(f"no feature at {rel(fdir, root)}")
    number = args.ticket.upper().lstrip("T").zfill(2)
    matches = sorted((fdir / "tickets").glob(f"{number}-*.md"))
    if not matches:
        die(f"no ticket {number} in {rel(fdir, root)}")
    ticket_path = matches[0]
    if args.cmd:
        rc = record_run(root, args.slug, args.ticket, args.criterion, "verify", args.cmd)
        if rc != 0:
            print("final proof failed; ticket left open")
            return rc
    text = read(ticket_path)
    text = re.sub(r"^\s*Status:.*$", "Status: done", text, count=1, flags=re.M)
    text = re.sub(r"^\s*-\s*\[ \]", "- [x]", text, flags=re.M)
    git = git_available(root)
    fixed_point = run_git(root, "rev-parse", "--short", "HEAD").stdout.strip() if git else ""
    branch = ""
    if git:
        branch = run_git(root, "symbolic-ref", "--short", "HEAD").stdout.strip()
    text = re.sub(r"^Merged:.*$",
                  f"Merged: {branch or 'local'}; fixed point: {fixed_point or 'initial commit'}",
                  text, count=1, flags=re.M)
    write(ticket_path, text)
    if args.verdict:
        review = fdir / "review.md"
        body = read(review) if review.is_file() else template("assets/review.md", {
            "<feature-slug>": args.slug, "<feature name>": args.slug,
            "<slug>": args.slug, "<date>": today()})
        body = re.sub(r"^VERDICT:.*$", f"VERDICT: {args.verdict}", body, count=1, flags=re.M)
        if not re.search(r"^VERDICT:", body, re.M):
            body += f"\nVERDICT: {args.verdict}\n"
        body = "".join(line + "\n" for line in body.splitlines() if "<If not ship" not in line)
        write(review, body)
    if args.retro:
        write(fdir / "retro.md", f"# Retro: {args.slug}\n\nDate: {today()}\nTicket: {number}\n"
              f"Verdict: {args.verdict or 'not recorded'}\n\n## What happened\n\n{args.retro}\n\n"
              "## What to change\n\n- none recorded for this ticket\n")
    mode = read(fdir / ".mode").strip() if (fdir / ".mode").is_file() else "standard"
    gates = GATE_ORDER if mode == "lite" else GATE_ORDER[:-1]
    checks = []
    for gate in gates:
        checks.extend(check_gate(fdir, gate))
    failures = [msg for ok, msg in checks if not ok]
    for gate in gates:
        gate_checks = check_gate(fdir, gate)
        bad = [m for ok, m in gate_checks if not ok]
        print(f"{'PASS' if not bad else 'FAIL'}  {gate}" + ("" if not bad else f"  {len(bad)} failing"))
        for msg in bad:
            print(f"      - {msg}")
    if mode != "lite":
        print("NOTE  G5 is feature-level: open pr.md and retro.md before merging")
    sha = None
    if not args.no_commit and git_available(root):
        run_git(root, "add", "-A")
        commit = run_git(root, "commit", "-m", args.message)
        if commit.returncode == 0:
            sha = run_git(root, "rev-parse", "--short", "HEAD").stdout.strip()
            print(f"commit: {sha}  {args.message}")
        else:
            print(f"commit skipped: {commit.stdout.strip() or commit.stderr.strip()}")
    print(f"ticket {number}: done")
    if sha:
        print(f"report: ticket {number} closed in {sha}; evidence in {rel(fdir / 'evidence.md', root)}; "
              f"verdict {args.verdict or 'not recorded'}")
    remaining = frontier(parse_tickets(fdir))
    if remaining:
        print("next: " + ", ".join(f"{t['id']} {t['title']}" for t in remaining))
    else:
        print("next: all tickets closed")
    return 1 if failures else 0


# ---------- review ----------

def cmd_review(args):
    root = Path(args.root).resolve()
    fdir = feature_dir(root, args.slug)
    proc = run_git(root, "rev-parse", args.fixed_point)
    if proc.returncode != 0:
        die(f"fixed point does not resolve: {args.fixed_point}")
    sha = proc.stdout.strip()
    stat = run_git(root, "diff", "--stat", f"{args.fixed_point}...HEAD")
    commits = run_git(root, "log", "--oneline", f"{args.fixed_point}..HEAD")
    if not stat.stdout.strip():
        die("diff against the fixed point is empty")
    specs = [rel(p, root) for p in [fdir / "spec.md", *sorted((fdir / "tickets").glob("*.md"))] if p.is_file()]
    prompts = fdir / "review" / "prompts"
    prompts.mkdir(parents=True, exist_ok=True)
    common = (
        f"Fixed point: {args.fixed_point} ({sha})\n"
        f"Diff command: git diff {args.fixed_point}...HEAD\n"
        f"Commits:\n{commits.stdout}"
        f"Pointers (read these; do not expect pasted context): {', '.join(specs)}\n"
        f"Evidence ledger: {rel(fdir / 'evidence.md', root)}\n"
    )
    standards = common + (
        "\nReview the diff on the Standards axis only.\n"
        "Report per file or hunk: (a) violations of documented repo standards, citing file and rule;"
        " (b) baseline smells, named and quoted. Documented repo standards override the baseline."
        " Baseline smells are judgement calls. Skip what tooling enforces. Under 400 words.\n"
        f"Smell baseline: {', '.join(SMELLS)}.\n"
    )
    spec = common + (
        "\nReview the diff on the Spec axis only. Report: (a) requirements from the spec that are"
        " missing or partial; (b) behaviour not asked for; (c) requirements implemented wrongly."
        " Quote the spec line for each finding. Under 400 words.\n"
    )
    proof = common + (
        "\nReview the diff on the Proof axis only. Report: criteria without evidence rows; rows whose"
        " command does not test the claim; re-run the three riskiest commands and record the result;"
        " whether each regression test would fail on the baseline; boundaries not exercised;"
        " truncated logs or edited output; destructive steps without scoped confirmation."
        " Mark any criterion you cannot reproduce as 'not yet proven'. Under 400 words.\n"
    )
    for name, body in (("standards", standards), ("spec", spec), ("proof", proof)):
        write(prompts / f"{name}.txt", body)
    review = fdir / "review.md"
    if not review.is_file():
        write(review, template("assets/review.md", {
            "<feature-slug>": args.slug, "<feature name>": args.slug,
            "<slug>": args.slug, "<date>": today()}))
    print(f"fixed point: {args.fixed_point} -> {sha}")
    print(stat.stdout.strip())
    print(f"prompts: {rel(prompts, root)}/{{standards,spec,proof}}.txt")
    print(f"review skeleton: {rel(review, root)}")
    return 0


# ---------- ask ----------

def cmd_ask(args):
    root = Path(args.root).resolve()
    fdir = feature_dir(root, args.slug)
    sources = [p for p in [fdir / "brief.md", fdir / "spec.md"] if p.is_file()]
    questions = []
    for path in sources:
        for line in read(path).splitlines():
            if "<" in line or "resolved" in line.lower():
                continue
            if not re.search(r"\bowner:\s*\S", line):
                continue
            question = re.sub(r"\s*owner:.*$", "", line).strip(" |-")
            question = re.sub(r"^Q:\s*", "", question).strip()
            if question and question not in [q for _, q in questions]:
                questions.append((path.name, question))
    if not questions:
        print("no owner-scoped unknowns")
        return 0
    out = [f"# Decision packet: {args.slug}", "", "Answer these in one pass; each has a default.", ""]
    for index, (source, question) in enumerate(questions[:4], start=1):
        out += [f"## Q{index}. {question}", f"Source: {source}",
                "Options: A) <recommended default>  B) <alternative>  C) defer (record a waiver)",
                "If unanswered: proceed with A and record it as an assumption.", ""]
    write(fdir / "ask.md", "\n".join(out))
    print("\n".join(out))
    return 0


# ---------- bench ----------

def file_sizes(names):
    total = 0
    detail = {}
    for name in names:
        path = SKILL_ROOT / name
        if path.is_file():
            size = path.stat().st_size
            detail[name] = size
            total += size
    return total, detail


def bench_metrics():
    lite_refs = [n for n in LITE_REFS if (SKILL_ROOT / n).is_file()]
    std_refs = [n for n in STANDARD_REFS if (SKILL_ROOT / n).is_file()]
    skill = file_sizes(["SKILL.md"])[0]
    lite_ctx = file_sizes(["SKILL.md", *lite_refs])[0]
    std_ctx = file_sizes(["SKILL.md", *std_refs])[0]
    assets = file_sizes(AGENT_TEMPLATES)[0]
    ref_sizes = [file_sizes([n])[0] for n in std_refs]
    return {
        "skill_bytes": skill,
        "lite_context_bytes": lite_ctx,
        "standard_context_bytes": std_ctx + assets,
        "peak_context_bytes": skill + (max(ref_sizes) if ref_sizes else 0),
        "template_bytes": assets,
        "hand_written_artifacts_standard": 6,
        "hand_written_artifacts_lite": 2,
        "mandatory_stops": 2,
        "refs": len(std_refs),
    }


def cmd_bench(args):
    m = bench_metrics()
    print(json.dumps(m, indent=2) if args.json else
          "\n".join(f"{k:38s} {v}" for k, v in m.items()))
    return 0


# ---------- doctor ----------

def cmd_doctor(args):
    failures = 0

    def check(ok, msg):
        nonlocal failures
        print(f"{'PASS' if ok else 'FAIL'}  {msg}")
        failures += 0 if ok else 1

    skill = SKILL_ROOT / "SKILL.md"
    check(skill.is_file(), "SKILL.md exists")
    if skill.is_file():
        text = read(skill)
        front = text.split("---")[1] if text.startswith("---") else ""
        name = re.search(r"^name:\s*(\S+)", front, re.M)
        desc = re.search(r'^description:\s*"(.*)"\s*$', front, re.M)
        check(bool(name and re.fullmatch(r"[a-z0-9][a-z0-9-]*", name.group(1))), "name is kebab-case")
        check(bool(desc and len(desc.group(1)) <= 500), f"description <= 500 chars ({len(desc.group(1)) if desc else 0})")
        for rel_path in ["references/lite.md", "assets/lite-ticket.md"]:
            check((SKILL_ROOT / rel_path).is_file(), f"{rel_path} exists")
    check(check_budgets(verbose=False) == 0, "instruction budgets")
    m = bench_metrics()
    print(f"bench  skill={m['skill_bytes']} lite={m['lite_context_bytes']} standard={m['standard_context_bytes']}")
    target = Path(args.target).expanduser() if args.target else Path(os.environ.get("DSH_HOME", Path.home() / ".dsh")) / "skills" / "sdd"
    if target.is_dir():
        source_files = {rel(p, SKILL_ROOT): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in SKILL_ROOT.rglob("*") if p.is_file()}
        target_files = {rel(p, target): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in target.rglob("*") if p.is_file()}
        only_source = sorted(set(source_files) - set(target_files))
        only_target = sorted(set(target_files) - set(source_files))
        changed = sorted(k for k in source_files if k in target_files and source_files[k] != target_files[k])
        check(not only_source and not only_target and not changed,
              f"installed copy matches source at {target}")
        for name in only_source + only_target + changed:
            print(f"       differs: {name}")
    else:
        print(f"INFO  no installed copy at {target} (skip comparison)")
    return 1 if failures else 0


# ---------- main ----------

def build_parser():
    parser = argparse.ArgumentParser(prog="sdd.py", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=None, help="repository root (default: detect .sdd upward)")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("init", help="scaffold a feature directory")
    p.add_argument("--slug", required=True)
    p.add_argument("--name", default="")
    p.add_argument("--mode", choices=["lite", "standard", "wayfinder"], default="standard")
    p.add_argument("--tickets", default="", help="semicolon-separated ticket titles")
    p.add_argument("--force", action="store_true")
    p.set_defaults(func=cmd_init)

    p = sub.add_parser("run", help="run a command, capture the log, append a ledger row")
    p.add_argument("--slug", required=True)
    p.add_argument("--ticket", required=True)
    p.add_argument("--criterion", required=True)
    p.add_argument("--label", default="run")
    p.add_argument("cmd", nargs=argparse.REMAINDER)
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("check", help="validate gates and budgets")
    p.add_argument("--slug", required=True)
    p.add_argument("--gate", choices=GATE_ORDER, default=None)
    p.add_argument("--budget", action="store_true")
    p.set_defaults(func=cmd_check)

    p = sub.add_parser("next", help="print the frontier")
    p.add_argument("--slug", required=True)
    p.set_defaults(func=cmd_next)

    p = sub.add_parser("finish", help="close a ticket: proof, status, verdict/retro, commit, check")
    p.add_argument("--slug", required=True)
    p.add_argument("--ticket", required=True)
    p.add_argument("--message", default="chore: close ticket")
    p.add_argument("--criterion", default="final proof")
    p.add_argument("--verdict", choices=["ship", "rework", "blocked"], default=None)
    p.add_argument("--retro", default="")
    p.add_argument("--no-commit", action="store_true")
    p.add_argument("cmd", nargs=argparse.REMAINDER)
    p.set_defaults(func=cmd_finish)

    p = sub.add_parser("review", help="validate a fixed point and write reviewer prompts")
    p.add_argument("--slug", required=True)
    p.add_argument("--fixed-point", required=True)
    p.set_defaults(func=cmd_review)

    p = sub.add_parser("ask", help="build one decision packet from owner-scoped unknowns")
    p.add_argument("--slug", required=True)
    p.set_defaults(func=cmd_ask)

    p = sub.add_parser("bench", help="static process-cost metrics")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_bench)

    p = sub.add_parser("doctor", help="verify the skill and its installed copy")
    p.add_argument("--target", default=None)
    p.set_defaults(func=cmd_doctor)
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    root = Path(args.root).resolve() if getattr(args, "root", None) else find_root()
    args.root = root
    if args.command in ("run", "finish") and args.cmd and args.cmd[0] == "--":
        args.cmd = args.cmd[1:]
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
