# Operations: modes, resume, stops, failures

## Modes

**`lite`** — one ticket, one session. Write `.sdd/<slug>/tickets/01-<slug>.md` with a short `## Spec` section inside it (problem, solution, two or three stories, decisions, seam), plus `evidence.md`. Review is still three axes, done by one fresh reviewer per axis if the harness allows, otherwise by three separate passes with the axes kept apart. Use it for a bug fix, a single endpoint, a one-file refactor. Do not use it as an excuse to skip evidence.

**`standard`** — the six gates as written. The default.

**`wayfinder`** — when the destination is unclear or the work exceeds one session. `.sdd/<slug>/map.md` holds the destination and the decision tickets. Each session resolves exactly one decision, appends a decision record, and updates the map. Collapse to `standard` when no decision blocks the first spec. Never implement from the map.

## Resume

Read in this order and stop at the first artifact without an acceptance line:

1. `brief.md` → G1
2. `spec.md` → G2
3. `tickets/` + frontier → G3
4. all tickets done → G4
5. `review.md` verdict `ship` → G5

If an artifact exists without its acceptance line, finish that gate; do not restart it. If the artifacts contradict each other (spec decides X, a ticket assumes Y), the spec wins and the ticket is corrected.

## Stop rules

Stop and ask, with a hypothesis and options, when:

- the work would change scope beyond the accepted spec
- an action is irreversible or destroys data
- two requirements contradict and no source resolves them
- credentials, access, or an environment are missing and only the user can supply them
- the user owns the decision (product behavior, risk appetite, spend, merge, deferral)
- the same failure repeats after two distinct fix attempts

Do not stop for: how something works in the repository, what the convention is, what a dependency's API is, what the tests do. Those are resolvable by inspection.

Ask format: one line of context, what you searched, found, your hypothesis, 2 to 4 options with a recommended default, and what happens if unanswered.

## When the user is unavailable

Asking is not blocking. When a decision owner cannot answer in time:

- adopt the most reversible option that keeps the work moving
- write it where the artifact records decisions, as `assumed by agent: <choice> (reversible: <how>)`
- surface it in the next report, in one line, so it is the first thing corrected
- do **not** proceed past an irreversible action, a spend, or a scope change on an assumption

An assumed decision is a debt, not a waiver. If the assumption later proves wrong, the artifact that recorded it tells the next agent exactly what to revisit.

## Failure taxonomy

Classify before reacting:

| Class | Example | Response |
|---|---|---|
| Missing input | file absent, secret unset | state the exact missing thing; do not guess |
| Wrong assumption | API behaves differently than assumed | record the correction, amend spec assumption, continue |
| Broken environment | toolchain, network, permissions | diagnose; do not code around it |
| Real defect | the thing under change is wrong | measure, then fix, then prove |
| Flaky check | passes and fails without changes | treat as a defect in the check; do not retry to green |
| Stale state | caches, old build artifacts, dirty worktree | clean, rebuild, re-run from scratch |

Never convert a failure into a success by weakening an assertion, skipping a test, narrowing a query until it returns, or reporting the last green run. A degraded result is not an empty result: say "partial" when it is partial.

After any fix, verify by reading back or re-running; a fix you did not observe is a theory.

## Context management

Long runs compact. Keep the working set small:

- one ticket in context at a time; everything else is a path
- after each gate, write the artifact and let the detail go
- use fresh subagents for review and for independent tickets
- hand off with pointers: artifact paths, commit hashes, the frontier

If you notice yourself re-deriving a decision the spec already made, you are holding the wrong context; re-read the artifact, do not re-decide.

## Concurrency

- Parallel implementers: one ticket, one branch, one worktree, no shared checkout.
- Reviewers: three independent, no shared context, no shared verdict.
- Never run two writers against the same file set without a merge protocol.
- Recompute the frontier after every merge; a stale frontier causes collisions.

## Waivers

`waivers.md`, one row per exception, with what is missing, the compensating check, who approved, and expiry. A waiver without an expiry is a permanent hole with polite wording.

## Anti-patterns (the full list)

- A spec that decides nothing, then a build that decides everything.
- Horizontal layer tickets.
- Status lines as proof.
- Reviewing without a fixed point.
- One reviewer, three axes merged into one rank.
- Subagents fed payloads instead of pointers.
- Asking the user what the code already answers.
- Fixing before measuring.
- Destructive action justified by confidence instead of consent.
- Retrying to green.
- A giant plan document nobody re-reads.
- Ceremony on a one-line change.
- Waivers nobody can find.
- A retro that praises the session.

## Maintaining this skill

Version the skill in its own frontmatter metadata. Every amendment names the friction it fixes. After a month of use, delete the rules that never fired; a long skill that is not read is worse than a short one that is.
