# Evidence ledger: <feature-slug>

Append-only. Never edit a row; append a correction that references the original.

| Ticket | Criterion | Command | Observed | Raw output | Date |
|---|---|---|---|---|---|
| T01 | <criterion> | `<exact command>` | <exit code, counts, value> | evidence/t01-<name>.txt | YYYY-MM-DD |

## Rules

- The command is exactly what ran, from the stated directory.
- The observation includes a number, a state, or a status; "passed" alone is not an observation.
- Raw output is the full, unedited log. Redactions are marked.
- A regression or bug fix carries two rows: baseline failure, post-change pass, same command.
- A criterion with no row is not done.

## Waivers

| # | Gate or criterion waived | Missing | Compensating check | Approved by | Expires |
|---|---|---|---|---|---|
| W01 | | | | | |
