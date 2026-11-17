# Dispatch: packets, workers, parallelism

## Packet

`factory.py packet --slug X --ticket NN` writes `workers/NN-attempt-K.md`. It contains the slice, acceptance, the planner's binding notes, allowed files, proof command, spec excerpt, DESIGN.md (only for UI runs), the four worker rules, and (from attempt 2) the previous gate tail. A packet refuses to build while `spec.md` is still the template or has placeholder seams: a worker must never read a template.

Hand a worker a **pointer**, never the payload:

```
Read E:\path\.factory\X\workers\01-attempt-1.md and execute it exactly.
Reply with the packet's report format.
```

Why: a worker that receives the spec inline starts re-designing; a worker that opens the packet follows the slice. Fresh context also keeps the worker from inheriting the planner's assumptions.

## Worker prompt contract

The packet ends with an exact report format:

```
STATUS: done | blocked
PROOF: <what you ran and the observed result>
FILES: <paths changed>
NOTES: <decisions or blocker>
```

`STATUS: done` is a claim, not a verdict. The orchestrator runs `verify`; only that exit code closes the ticket.

## Parallel safety

- Dispatch only tickets that `factory.py next` lists; they have no unfinished dependency.
- Cap concurrent workers at `--workers` (default 2). More workers on shared files means more conflicts, not more throughput.
- Disjoint Files lists are a hard requirement for parallel dispatch. If two ready tickets name the same file, merge them into one ticket before dispatching.
- Optional isolation: each worker in its own git worktree (`git worktree add ../<slug>-01 -b factory/01`). Use it when the repo has long builds or when a worker is expected to run formatters that rewrite files. Merge back with `git checkout` of the branch after verify passes.

## Attempts

`attempt` is per ticket, not per run. `verify` records attempt N; `packet --attempt N+1` embeds the last failure. A retry that receives the same prompt as attempt 1 wastes the budget: always re-packet with feedback.

Each packet records the hash of the spec it was cut from. If `spec.md` changes afterwards, `plan` warns and `verify` prints `spec.md changed after the packet was cut`, because the worker acted on an older contract. Re-cut the packet rather than trusting the gate.

After `max_attempts`:

```
factory.py block --slug X --ticket NN --reason "<what keeps failing>" --hypothesis "<smaller slice or direct seam test>"
```

Blocked tickets do not stop the run. Continue with the rest of the frontier; the report carries the escalation.

## Orchestrator checklist per round

1. `status` → know what is done.
2. `next` → ready ids.
3. For each ready id (up to workers): `packet`, spawn subagent, keep the packet path.
4. On each worker return: `verify --ticket id`. On failure: next attempt or `block`.
5. Repeat until `next` prints "all tickets closed" or every remaining ticket is blocked.
6. `review`, then `report`.
