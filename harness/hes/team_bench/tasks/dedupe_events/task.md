# Dedupe events

Implement `dedupe_events(events: list[dict]) -> list[dict]` in `solution.py`.

Each event is a dict with at least `"id"` and `"ts"`. Rules:

- Keep only the **last** event for each `id` in input order.
- Return the kept events in the order of their last occurrence.
- Do not mutate the input list or the event dicts.

Examples:

```text
[] -> []
[{"id":"a","ts":1},{"id":"b","ts":2},{"id":"a","ts":3}]
  -> [{"id":"b","ts":2},{"id":"a","ts":3}]
[{"id":"a","ts":1},{"id":"a","ts":2}] -> [{"id":"a","ts":2}]
```

Only edit `solution.py`. Do not create test files that claim to be hidden tests.
