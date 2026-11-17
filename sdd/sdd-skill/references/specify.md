# G1 Specify

A spec is a **decision record**, not a description of code you are about to write. Its reader is a fresh agent, three sessions from now, with no memory of this conversation. If that agent has to make a design decision, the spec failed.

Write `spec.md` from `assets/spec.md`. Seven sections, in this order.

## 1. Problem statement

The failure the actor experiences, from their side. Copy the brief's problem, tightened. One paragraph. If the brief and the spec disagree, the brief wins and the spec is corrected.

## 2. Solution

The shape of the answer from the user's side: what they will be able to do. Not the architecture. One or two paragraphs.

## 3. User stories

A long, numbered list. `As an <actor>, I want <capability>, so that <benefit>.` Cover the whole surface, not the happy path:

- every actor, including operators, support, and the next developer
- the lifecycle, including retries, cancellation, and cleanup
- the failures, including invalid input, partial failure, timeout, and recovery
- the edges, including empty state, first use, and migration of existing data

Stories are how you find scope holes before they become review findings. If you can write fewer than five for a real feature, you have not looked at the edge cases.

## 4. Implementation decisions

The decisions a competent implementer must not make on their own: modules and their interfaces, schema or data-model changes, API contracts, state machines, error taxonomy, migration and rollback, backward compatibility, concurrency and idempotency.

For each decision, state: **the decision**, **the alternatives considered**, **why this one**, and **reversibility** (one-way or two-way door). A decision without alternatives is not a decision, it is a default that nobody examined.

Rules:

- No file paths and no code snippets. They go stale faster than the decision does.
- Exception: a prototype snippet that encodes a decision more precisely than prose can (a state machine, a reducer, a schema, a type shape). Inline the decision-bearing lines, trim the demo, and say it came from a prototype.
- If a decision depends on an unverified assumption, tag it `[assumes A3]` and make sure A3 has a verification step.

## 5. Testing decisions

- **Seams**: where the behaviour will be tested. A seam is a place where you can observe behaviour without reaching inside. Prefer an existing seam; prefer the highest seam available; the ideal number of new seams for a change is one. Listing a seam means the implementation must be testable through it, and review will check only these seams were used.
- **What makes a good test here**: external behaviour only, no implementation details, one reason to fail.
- **Which modules are covered** and by which level (unit, integration, end-to-end).
- **Prior art**: point at two or three existing tests that show the shape and the fixtures to copy.
- **What will not be tested**, and why that is acceptable.

Seams are agreed with the user before any test is written. This is the one mandatory design checkpoint in the whole pipeline; it is cheap now and expensive later.

## 6. Out of scope

The things adjacent to this work that this change does not do, each with a one-line reason. If you catch yourself writing "we could also", it goes here or into the backlog, not into the spec.

## 7. Further notes

Risks, open questions that are genuinely deferred, links to prior art, rollout notes, data-migration concerns, observability expectations.

## Assumptions and evidence

Keep a short table at the top or bottom of the spec:

| # | Assumption | How it will be verified | Status |
|---|---|---|---|
| A1 | The billing table has no rows older than 2024 | `SELECT min(created_at)` on staging | verified 2026-11-16 |

An assumption that is never verified becomes a defect later. Either verify it now (preferred), assign it to a ticket's acceptance criteria, or explicitly accept the risk with the user.

## Acceptance preview

Before leaving G1, sketch the acceptance criteria the tickets will carry: for each user story, the observable that proves it. This is a preview, not the final list, but it catches stories that cannot be verified. A story with no observable is either not a story or not a behaviour.

## Exit the gate

- [ ] Seven sections filled; nothing says `TBD`.
- [ ] Every decision carries alternatives and reversibility.
- [ ] Seams are listed, minimal, and agreed with the user.
- [ ] Testing decisions name concrete prior art.
- [ ] Out of scope is explicit and non-empty (every real change excludes something).
- [ ] Assumptions are verified or scheduled, not invisible.
- [ ] `Status: accepted` written, with the date and who agreed the seams.

## Anti-patterns

- A spec that restates the brief at length and decides nothing.
- Implementation decisions that are really plans: "step 1, write the parser". Order belongs in the tickets.
- Seams chosen because they are easy to test, not because they are where the behaviour is.
- User stories that only cover the happy path.
- A spec nobody could implement without asking three questions.
