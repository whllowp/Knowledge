# Learn: escalations, lessons, and the next run

## Escalation instead of a question

When a ticket spends its attempt budget, write an escalation, not a question:

```
factory.py block --slug X --ticket NN \
  --reason "test_greet still fails on the empty-name case after 3 attempts" \
  --hypothesis "worker keeps special-casing ''; split the empty case into its own ticket with a direct assertion"
```

A good escalation has three parts: the observed failure (from evidence), the attempts spent, and a hypothesis that changes something structural (smaller slice, different seam, different proof). "It does not work" is not an escalation.

Escalations are the only honest output of a failed run: they convert a dead ticket into an executable next step.

## Lessons

Keep a `knowledge.md` beside the factory workspace (or append to the repo's existing notes) with one line per lesson:

```
- 2026-11-18  tickets whose proof is a whole-suite run hide the slice: the zero-test rejection caught an empty discovery path. Prefer `python -m unittest tests.test_greet -q` as the slice proof.
```

Each line: date, the failure shape, the rule that changes. A lesson without a rule is a diary entry.

## Retro questions (answer in the report, one line each)

1. Which ticket took more than one attempt, and what did attempt 2 know that attempt 1 did not?
2. Did any gate pass without proving the slice? If yes, the proof command needs tightening.
3. Did any worker widen scope? If yes, the Files list was too vague.
4. What would have made the run one attempt shorter?

## Feeding the next run

- Escalation hypotheses become tickets in the next `init` call.
- Repeated lessons become rules in `references/design.md` or `references/gates.md`, not notes in a report.
- If a whole class of tickets keeps failing, the spec's seam line was wrong; fix the seam, not the workers.

## Metrics to watch across runs

- first-pass rate: falling means packets are underspecified or slices are too big;
- mean attempts: rising means retries are not receiving feedback;
- escalations: rising means the attempt budget is too small for the slice size;
- interventions: must stay 0; anything else means the loop leaked a question.
