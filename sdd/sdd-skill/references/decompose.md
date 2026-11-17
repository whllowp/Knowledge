# G2 Decompose

A plan is not a list of steps. It is a **task graph** of vertical slices, each declaring what must finish before it can start. The graph always has a frontier: the tickets whose blockers are all done. Builders work the frontier.

## 1. Cut tracer bullets

Each ticket cuts a narrow but **complete** path through every layer it needs: schema, service, API, UI, tests. Vertical, never a horizontal slice of one layer.

A completed ticket must be:

- **demoable or verifiable on its own**, with its acceptance criteria met
- **sized to one fresh context window**: if an implementer would need to compact, split it
- **independent of sibling tickets**: parallel tickets must not touch the same files at the same time
- **pre-factored first**: if the change is easier after a mechanical preparation, that preparation is its own ticket at the root of the graph ("make the change easy, then make the easy change")

## 2. Declare blocking edges

For each ticket, list the tickets that must be `done` before it starts. Rules:

- An edge exists only when the dependency is real: shared schema, shared interface, or an ordering constraint on behaviour.
- No edge for "it would be nice to do this first". Speculative edges serialize the graph and destroy concurrency.
- The graph must be acyclic. Check it before publishing; a cycle means two tickets were cut along the wrong seam.
- Every ticket must be reachable from a root and must reach a `verify` terminal. Orphans are scope you forgot to wire up.

## 3. The wide-refactor exception

A **wide refactor** is one mechanical change whose blast radius covers the whole codebase, so no vertical slice can land green. Do not force it into a tracer bullet. Sequence it as **expand, migrate, contract**:

1. **Expand**: add the new form beside the old. Nothing breaks.
2. **Migrate**: move callers in batches sized by blast radius (per package, per directory). Each batch is its own ticket, blocked by the expand. CI stays green batch to batch because the old form still exists.
3. **Contract**: delete the old form once no caller remains, blocked by every migrate batch.

When even the batches cannot stay green alone, let them share an integration branch and add a final integrate-and-verify ticket that all batches block. Green is promised only there, and the PR says so.

## 4. Acceptance criteria

Every ticket carries checked criteria, and each one is checkable by someone who did not write the code:

- Name the command or the observation, and the expected result.
- Prefer behaviour over implementation: "the refund row shows `settled` and the ledger total decreases by 1200" beats "`RefundService` calls `settle()`".
- A criterion that requires reading the diff is a code-review item, not an acceptance criterion.
- If a criterion cannot be automated, say how a human checks it and in how many steps.

## 5. Publish and quiz

Publish one file per ticket under `.sdd/<slug>/tickets/NN-slug.md`, numbered from `01` in dependency order, blockers first. Never one combined file: the frontier is computed from individual files, and a builder claims exactly one.

Then show the user the breakdown as a numbered list: title, blocked-by, what it delivers. Ask only:

- is the granularity right (too coarse, too fine)?
- are the edges real?
- should anything merge or split?

Iterate until approved, then write `Status: ready` on each ticket. This is the last design checkpoint before building; after it, only the frontier moves.

## 6. Compute and publish the frontier

The frontier is every ticket whose blockers are all `done` and which is not itself `done` or `blocked`. Write it into `tickets/README.md` or at the top of the first ticket. Keep it current as tickets close; a stale frontier is how parallel work collides.

## Exit the gate

- [ ] One file per ticket, numbered in dependency order.
- [ ] The graph is acyclic (`check the edges, not the vibes`).
- [ ] Every ticket has checkable acceptance criteria.
- [ ] Every ticket fits one fresh context.
- [ ] Wide refactors use expand-migrate-contract.
- [ ] No two parallel tickets touch the same files.
- [ ] The user approved granularity and edges.
- [ ] The frontier is written down.

## Anti-patterns

- Layer tickets: "add the DB column", "add the endpoint", "add the UI". None is demoable; all fake progress.
- A ticket whose acceptance criteria are "tests pass" with no named test.
- Edges invented to express preference rather than dependency.
- Mega-tickets that hide three slices behind one title.
- A backlog with no frontier, so nothing can start until everything is planned.
