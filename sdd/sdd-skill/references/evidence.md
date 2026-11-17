# Evidence

Evidence is the currency of SDD. A gate closes because a command ran and its output was recorded, not because someone said so.

## The ledger

`.sdd/<slug>/evidence.md`, append-only, one row per acceptance criterion. Never rewrite a row; append a correction row that references it.

```
| Ticket | Criterion | Command | Observed | Raw output | Date |
|---|---|---|---|---|---|
| T03 | refund settles and ledger total drops by 1200 | `pnpm test billing/refund -t settled` | exit 0, 12 passed, total 8800 | evidence/t03-refund.txt | 2026-11-16 |
```

Columns, and what makes each one valid:

- **Ticket and criterion**: copied from the ticket, not paraphrased. If the criterion changes, the ticket changes first.
- **Command**: exactly what was run, from the repository root, with the working directory and any environment variables that matter. `pnpm test` is not a command; `pnpm test billing/refund -t settled` is.
- **Observed**: the result as it printed: exit code, counts, the specific value. "Passed" alone is not an observation.
- **Raw output**: a path under `.sdd/<slug>/evidence/` holding the full, unedited output. Git-ignore the directory; keep the files.
- **Date**: when it ran, in ISO form.

## What counts as evidence

| Claim | Counts | Does not count |
|---|---|---|
| A test covers the behaviour | test name, command, exit code, full log | "added tests" |
| A bug is fixed | pre-change failure output + post-change pass, same command | a new test that passes |
| Performance improved | before and after measurement, same environment, same command | "should be faster now" |
| Data migrated | row counts before and after, sampled rows, constraint check | "migration ran" |
| UI works | screenshot or recording, plus the interaction that produced it | "renders correctly" |
| An API contract holds | request and response captured, status and body | "endpoint works" |

## Green from a truncated log is not green

Never pipe a test run through `head` or `tail` to make it readable, and never report a pass from a filtered log: the failure you filtered out is the one that matters. Capture the full output to a file, then read the file, and record the exit code separately:

```
pnpm test > /tmp/sdd-t03.txt 2>&1; rc=$?; cat /tmp/sdd-t03.txt; echo "EXIT=$rc"; exit $rc
```

If you must quote a log, quote the failing lines verbatim and link the full file.

When the command writes its results to stderr, redirect at the shell level (`cmd /c "... > log 2>&1"` on Windows, `... > log 2>&1` on POSIX). Piping through the host's error stream can prefix the log with host error records, which makes it unreadable as evidence.

## Discrimination

A regression test proves something only if it would have failed before the change. For every bug fix and every regression test, the ledger carries two rows: the baseline failure (on the pre-change commit) and the post-change pass, with the same command. If you cannot produce the baseline, mark the criterion `not yet proven` in the review and say why.

## Reproduction

Every row must be reproducible by a stranger: repository at a named commit, the command, the environment, the expected result. If a row depends on a secret, a personal account, or an unrepeatable state, say so in the row and treat it as weaker evidence.

## Redaction

Before committing a ledger or a log:

- remove secrets, tokens, cookies, and connection strings; replace with `<redacted:kind>`.
- remove personal data that is not needed to prove the claim; prove the shape, not the identity.
- keep enough to reproduce: the command shape and the relevant values survive redaction.

Redacted evidence is still evidence if the redaction is marked. Silent editing is not.

## Retention

Keep the ledger and the raw output for the life of the feature folder, and at least until the change has shipped and been stable for one release. Raw logs may be deleted after that; the ledger rows stay, because they are the record of what was proven and how.

## Waivers

A gate that cannot be satisfied is waived, not skipped. A waiver is a row in `waivers.md`:

```
W02 | performance criterion for T04 | no staging environment with production-shaped data | compensating: profiler run on the 10k-row fixture, p95 within 15% of baseline | approved: user, 2026-11-16 | expires: before GA
```

A waiver names what is missing, what was done instead, who approved it, and when it expires. An undocumented shortcut is a defect.
