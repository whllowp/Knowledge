# G3 Build

Build one frontier ticket at a time, in a fresh context, with a red test first and evidence at the end. The unit of work is the ticket, not the session.

## 1. Claim exactly one ticket

Read the ticket file only, plus the pointers it names (spec sections, decisions, prior commits). Do not read the whole `.sdd` tree; if the ticket is not self-contained, fix the ticket.

Write `Status: in-progress` with a timestamp. Claiming is atomic: if another agent or worktree has claimed it, pick the next frontier ticket.

## 2. Isolate the workspace

- One ticket, one branch. Branch name: `sdd/<slug>/<NN>-<short-title>`.
- Where parallel implementers exist, one git worktree per ticket, based on the integration branch. Confirm the base before starting; reset onto it if not.
- Never two implementers in one checkout: shared index, HEAD, and stash are how parallel work corrupts itself.

## 3. Red, green, refactor

1. **Red**: write the smallest test at an agreed seam that expresses one acceptance criterion and fails for the right reason. Run it. Record the failure output in the ledger. A test that passes before the change is not a test of the change.
2. **Green**: write the least code that makes it pass. No speculative generality; no parameter nobody asked for.
3. **Refactor**: clean the shape with the test still green. Keep the commit history readable; the future reviewer reads the diff, not the transcript.
4. Repeat per criterion. Commit at each green step, small and coherent.

Mocking rule: mock the boundary you do not own (network, clock, randomness, third party). Never mock the module under test, and never mock something just to make an assertion pass; that converts a failing behaviour into a passing fiction.

## 4. Measure before you fix

Any ticket that claims a bug, regression, slowdown, or memory problem starts with a measurement of the current behavior, on a pinned baseline, with the exact command recorded. The fix is then judged against the same measurement. If you cannot measure it, say so in the ticket and get agreement on a different proof; do not proceed on intuition and write a diff.

## 5. Gate destructive steps

Before any step that deletes data, rewrites history, force-pushes, drops a table, rotates a credential, or spends money:

1. State exactly what will be destroyed, and what cannot be recovered.
2. State the recovery path, and verify a backup exists if one is claimed.
3. Get an explicit, scoped confirmation for that exact action. "Go ahead" on the plan is not confirmation for the purge.
4. Do one action, verify it, then the next. A batch does not resume after a stop.

## 6. Record evidence

For every acceptance criterion, append a row to `evidence.md`:

```
T03 | refund is settled | `pnpm test billing/refund` | exit 0, 12 passed | log: evidence/t03-refund.txt | 2026-11-16
```

Rules: the command as run, the observed result, a link to the raw output, and the date. Save raw output under `evidence/` (git-ignored). If output is long, save it whole and quote the relevant lines; never edit a log to look better. A criterion without a row is not done.

## 7. Parallel implementers and the merger

When the frontier has several ready tickets and the harness supports subagents:

- one fresh implementer subagent per ticket, each in its own worktree, each told to read only its ticket and pointers
- background where possible for concurrency; cap by what the machine and the reviewer can absorb, not by ambition
- integration branch is the only place work meets: before an implementer reports done, it merges the current integration tip into its branch and reruns its acceptance command
- a **merger subagent** (or a disciplined step) merges one ticket branch at a time, checks the acceptance row, and resolves conflicts in favour of the spec
- after every merge, recompute the frontier and start newly unblocked tickets

Communication between implementers is through artifacts: fixed-point commit hashes, ticket files, and the ledger. Never paste one ticket's design into another ticket's prompt.

## 8. When stuck

Stop and write down which of these you hit, then act:

- **Missing information** the repository cannot supply → ticket `Status: blocked`, reason, and the question with your hypothesis; ask the user.
- **Contradiction** between spec and code → the spec wins; if the spec is wrong, amend the spec (with the user) before coding around it.
- **A seam that does not exist** → the seam should have been found at G1; add it to the spec, tell the user, then continue.
- **A test that will not go red** → the test is asserting the wrong thing or the seam is wrong; fix the test, never the assertion's meaning.
- **A scope discovery** → new ticket, blocked by the current one; do not expand the current ticket.

## Exit a ticket

- [ ] Every acceptance criterion has a ledger row with a command and observed output.
- [ ] The red-then-green sequence is recorded (or a dated waiver explains why not).
- [ ] No destructive step without a recorded confirmation.
- [ ] The branch merges cleanly into the integration tip.
- [ ] `Status: done` with the merge commit.

When all tickets are `done`, go to `verify.md`. Do not start G4 with tickets still open; a review against a moving branch is a review of nothing.
