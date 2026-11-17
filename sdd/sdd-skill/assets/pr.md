# <type>(<scope>): <summary>

## Summary

<The smallest artifact that makes the change clear: before/after screenshot, log-line pair, value table, or a three-sentence summary.>

Closes: <spec / tickets / issue>

## Evidence

| Claim | Command | Observed |
|---|---|---|
| <main criterion> | `<command>` | <result> |
| <regression fixed> | `<command>` | baseline fails (<link>) -> now passes (<link>) |

Raw logs: `.sdd/<slug>/evidence/`

## Merge danger

- Door: one-way | two-way
- Blast radius: <who and what is affected if this is wrong>
- Rollback: <how, in one step>
- Behind a flag: yes <flag name> | no

## Follow-ups

- <deferred decision or ticket>

## Reviewer notes

<where to look first, what is deliberately unchanged, known limitations>
