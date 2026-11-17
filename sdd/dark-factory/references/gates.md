# Gates: what verify proves, and how it fails

`factory.py verify --slug X --ticket NN` runs the ticket's Proof command inside the repo, writes `evidence/NN-attempt-K.txt`, updates `state.json`, and returns:

- `0` - gate passed, ticket status set to `done`;
- `1` - gate failed, attempt recorded with the output tail.

## Failure taxonomy

| Class | Signal | Meaning | Handling |
|---|---|---|---|
| real failure | nonzero exit + assertion/traceback | the slice is not done | rework with the tail in the next packet |
| false pass | exit 0 + `Ran 0 tests` / `0 passed` | the command proved nothing | treated as FAIL; fix the test command or the test file |
| missing module | `ModuleNotFoundError` / import error | the seam was never written | rework; the worker likely edited the wrong path |
| timeout | process killed at `--timeout` (default 600s) | hangs, live servers, infinite loops | block with hypothesis "isolate the hanging command" |
| no diff | exit 0 but `git status` clean | the slice already existed or the worker wrote nothing | warning, not a failure; check the claim |
| environment | toolchain missing, permission denied | not a code problem | block; the report names the missing tool |
| stale contract | `spec.md changed after the packet was cut` | the worker read an older spec | re-cut the packet, re-dispatch, re-verify |
| unattributed count | lite gate without `--expect-tests` | the count may belong to the whole suite | pass `--expect-tests N`, or target the slice's module |

## Evidence file

```
$ <proof command>
# exit <code> in <seconds>s
<raw combined output>
```

Evidence is committed with the work by default: a clone must be able to read the proof the ticket cites. Keep `.factory/*/evidence/` in the repo unless the output contains secrets, in which case ignore that directory and record why in the spec's Non-goals.

## Waiver rule

A gate may be waived only by a written decision in `spec.md` (Non-goals) or `review.md` (verdict notes) that names the missing proof and the residual risk. An undocumented waiver is a bug in the process, and the review's proof axis exists to catch it: a claim asserted without a run is a finding.

## Coverage checklist

Before recording the verdict, confirm the run proved:

- every ticket's proof command (evidence files exist for the final attempt);
- the feature-level acceptance commands from `spec.md`;
- the tests would fail on regression: at least one slice names a mutation or a direct seam test, or the proof axis records why not.

The last one is the most commonly skipped. Say so in the review instead of pretending it was covered.
