# G4 Verify

Review answers three separate questions with three separate reviewers. They are reported side by side and never ranked against each other.

- **Standards**: does the change obey this repository's documented coding standards?
- **Spec**: does it implement what the spec asked, and only that?
- **Proof**: is each claimed result actually demonstrated, and would the tests have failed if the change were wrong?

A change can pass one and fail another. Code that follows every standard but implements the wrong thing passes Standards and fails Spec. Code that does exactly what was asked but breaks conventions passes Spec and fails Standards. Code that is correct but whose evidence is a status line passes both and fails Proof. Merging the axes into one verdict is how one failure hides behind two passes.

## 1. Pin the fixed point

The fixed point is a commit, tag, branch, or merge-base the user names. If none is given, use the integration branch's base (`git merge-base HEAD <main-branch>`).

Validate before spawning anything:

```
git rev-parse <fixed-point>          # must resolve
git diff --stat <fixed-point>...HEAD # must be non-empty
git log --oneline <fixed-point>..HEAD
```

Note the diff command exactly: `git diff <fixed-point>...HEAD` (three dots, compared to the merge-base). Two dots compares tips and pollutes the diff with unrelated upstream changes.

Without version control, the fixed point is a snapshot: copy the tree (or its file hashes) before the change, and review against that snapshot. Record the snapshot path in `review.md` so the review stays reproducible. A review against "whatever changed" is not a review.

## 2. Spawn three fresh reviewers

Issue the calls together, each with a fresh context, each given the diff command, the commit list, and pointers (spec path, ticket files, ledger path). Nothing else. Prompts must not inherit a preference for a verdict.

### Standards reviewer

Give it the list of files that document how code should be written here: `CONTRIBUTING.md`, `CODING_STANDARDS.md`, linter and formatter configs, `AGENTS.md` conventions, and the repo's own style guide. Plus the smell baseline below, pasted in full because the reviewer has no other access to it.

Report, per file or hunk: (a) each place the diff violates a documented standard, citing file and rule; (b) any baseline smell, naming it and quoting the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling already enforces.

Smell baseline (names only; the reviewer knows the shapes): Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest.

### Spec reviewer

Give it the spec and the ticket files. Report: (a) requirements asked for that are missing or partial; (b) behaviour in the diff that was not asked for (scope creep); (c) requirements that look implemented but look wrong. Quote the spec line for each finding. If there is no spec, say "no spec available" and review only against the tickets.

### Proof reviewer

Give it the ledger, the raw logs, and the diff. Report:

- **Coverage**: acceptance criteria with no evidence row, or a row whose command does not test the claim.
- **Reproduction**: pick the three highest-risk rows and actually run the commands. A claim that does not reproduce is a defect, not a documentation issue.
- **Discrimination**: for each regression test, would it fail on the pre-change baseline? If the reviewer cannot tell, the test does not prove the fix. Ask for the baseline failure output; absent that, mark the criterion unproven.
- **Boundaries attacked**: authorization, identity, concurrency, retries, crash recovery, stale queued work, idempotency, data survival, and rollback. Name the ones that were not exercised.
- **Integrity**: truncated logs, edited outputs, mocked-away assertions, skipped tests, silently swallowed errors.
- **Destructive steps**: any in the diff or the ledger without a recorded scoped confirmation.

## 3. Aggregate without reranking

Write `review.md` with three sections, verbatim or lightly cleaned, then a one-line summary: findings per axis, and the worst finding **within each axis**. Do not pick a single overall winner.

Then give every finding a verdict and an owner:

| Verdict | Meaning |
|---|---|
| `accept` | verified as done, evidence row exists |
| `rework` | must change before merge; owner and ticket named |
| `reject` | not a valid finding; reason recorded |
| `not yet proven` | plausibly fixed, evidence insufficient; blocks merge until proven |

Rework goes to a fresh implementer, one pass, then the reviewer rechecks only the changed findings.

## 4. The verdict

`review.md` ends with exactly one of:

- `VERDICT: ship` — all findings accepted/rejected, every criterion proven, no `rework` or `not yet proven` open.
- `VERDICT: rework` — with the list.
- `VERDICT: blocked` — with the missing input named (spec, credentials, environment, decision).

Deferrals are the user's call. You may propose one; you may not grant one.

## Exit the gate

- [ ] Fixed point validated and recorded.
- [ ] Three reviews ran in fresh contexts.
- [ ] Findings carry verdicts and owners.
- [ ] Every acceptance criterion has a reproducing evidence row.
- [ ] Regression tests are shown to discriminate.
- [ ] Boundaries named, exercised or explicitly accepted.
- [ ] One verdict line.

## Anti-patterns

- One reviewer wearing three hats: the axes collapse into a preference.
- Reviewing a branch that still moves.
- "Looks good to me" with no per-criterion check.
- Treating a passing test suite as proof that the tested behaviour is correct.
- A verdict without a fixed point, which cannot be reproduced later.
