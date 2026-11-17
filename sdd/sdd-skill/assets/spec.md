# Spec: <feature name>

Slug: <feature-slug>
Date: YYYY-MM-DD
Status: draft | accepted
Seams agreed with: <user> on YYYY-MM-DD

## Problem statement

<The failure the actor experiences, from their side. One paragraph.>

## Solution

<The shape of the answer from the user's side. What they will be able to do.>

## User stories

1. As a <actor>, I want <capability>, so that <benefit>.
2. ...
3. ... (cover lifecycle edges, failures, empty states, migration, operators)

## Implementation decisions

### D1 <decision name>

- **Decision**: <what will be true.>
- **Alternatives**: <what else was considered and why rejected.>
- **Reversibility**: one-way | two-way
- **Assumes**: A1 (optional)

### D2 <decision name>

...

No file paths or code snippets. Exception: a decision-bearing snippet from a prototype (state machine, schema, type shape), trimmed to the decision.

## Testing decisions

- **Seams**: <where behaviour is observed; the ideal number of new seams is one>
- **Good test here means**: <external behaviour, one reason to fail>
- **Coverage**: <module -> level (unit/integration/e2e)>
- **Prior art**: <two or three existing tests to copy>
- **Not tested, and why**:

## Out of scope

- <adjacent thing> — <reason>

## Assumptions

| # | Assumption | Verification | Status |
|---|---|---|---|
| A1 | <assumption> | <command or check> | verified YYYY-MM-DD / pending |

## Acceptance preview

| Story | Observable that proves it |
|---|---|
| 1 | <value, state, or visible outcome> |
| 2 | <...> |

## Further notes

<risks, rollout, observability, deferred questions with owners>

## Acceptance of this gate

- [ ] Seven sections filled
- [ ] Decisions carry alternatives and reversibility
- [ ] Seams minimal and agreed
- [ ] Assumptions verified or scheduled
- [ ] Out of scope non-empty
- [ ] Status: accepted
