# Design stage: brief -> spec -> DESIGN.md -> slices

Time budget: 10 minutes of thinking for a lite run. The goal is not a beautiful document; it is a set of verifiable statements a worker can execute without asking anything.

## brief.md

Copy the request near-verbatim. Then two lists:

- **Done looks like**: observable outcomes, each phrased as something a command can check.
- **Unknowns**: each unknown on one line, with the assumption the factory will take. `unknown -> assumption: default` is a decision; leaving it blank is a question in disguise.

If an unknown changes the shape of the solution (not just a detail), it becomes a Non-goal instead of an assumption: scope out, do not guess scope in.

## spec.md

- **Problem**: who hurts, when, and what the current state does instead.
- **Solution**: the smallest shape. One seam beats a framework. No "flexibility" nobody asked for.
- **Seams**: `module.function` - contract, inputs, outputs, failure mode. Placeholder text (`<...>`) fails `factory.py plan`.
- **Non-goals**: what this run will not do, written down so review cannot relitigate it.
- **Acceptance**: feature-level commands and their expected results.

## DESIGN.md (UI slices only)

Semantic, not token dump. Five sections: atmosphere, palette with roles, typography, components, layout. Give colors as `Name (#RRGGBB) - role` so a worker can pick the right one and a reviewer can judge taste. Delete the file when no slice touches UI; an empty design contract is worse than none.

## Slices

One tracer bullet per ticket:

- It must be independently verifiable: its proof command passes without relying on an unfinished sibling.
- It must be small enough that one worker can finish it in one attempt: roughly one seam plus its tests.
- Order by dependency, not by importance; the frontier (`factory.py next`) only offers tickets whose deps are done.
- Two slices that would touch the same file must be merged into one ticket. Overlapping write scopes are the main source of worker conflict.

## Choosing the proof command

Best: a test command that fails before the slice and passes after, and whose count proves the slice exists (`Ran 3 tests`).

For a slice with its own test module, target that module so the evidence belongs to the ticket:

```
python -m unittest tests.test_greet -q
```

Then pass the count at the gate (`verify --expect-tests 3`). A whole-suite command (`discover -s .`) proves the repo, not the slice: two tickets gated with it produce two identical test counts, and neither log is attributable.

Acceptable: a typecheck or lint command when the slice is structural.

Never: a command that exits 0 regardless of the change (an empty test run, a `git status`, an echo). `verify` rejects the zero-test case explicitly.
