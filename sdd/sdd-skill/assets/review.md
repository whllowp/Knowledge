# Review: <feature-slug>

Fixed point: <ref> (resolved at <sha>)
Diff: `git diff <ref>...HEAD` (<n> files, <n> commits)
Reviewed: YYYY-MM-DD
Reviewers: standards <agent>, spec <agent>, proof <agent>

## Standards

<Verbatim or lightly cleaned report. Documented violations cited by file and rule; baseline smells labelled as judgement calls; tooling-enforced items excluded.>

## Spec

<Missing or partial requirements, scope creep, wrong implementations. Each quotes the spec line.>

## Proof

- Coverage gaps:
- Reproduction results (top three rows re-run):
- Discrimination: <which regression tests were shown to fail on the baseline>
- Boundaries exercised:
- Boundaries not exercised:
- Integrity issues:

## Findings

| # | Axis | Finding | Verdict | Owner | Ticket |
|---|---|---|---|---|---|
| F1 | Standards | <finding> | accept \| rework \| reject \| not yet proven | <agent> | <ticket or -> |

Deferrals proposed: <list> | none
Deferrals approved by: <user> | pending

## Summary

- Standards: <n> findings, worst: <one line>
- Spec: <n> findings, worst: <one line>
- Proof: <n> findings, worst: <one line>

## Verdict

VERDICT: ship | rework | blocked
<If not ship, name what closes it.>
