# Knowledge: decisions, vocabulary, memory

SDD's advantage over an ad-hoc session is that its thinking survives the session. That only happens if the thinking is written where the next agent looks.

## Decision records

Every decision that a future agent must not silently reverse gets a record in `.sdd/<slug>/decisions/NNNN-slug.md` (or in the repository's ADR directory if one exists; the project's convention wins).

```
# 0007 Retry with jittered backoff, not fixed intervals

Status: accepted
Date: 2026-11-16
Reversibility: two-way (client-side only)

## Context
Fixed 1s retries synchronized across workers during the outage, producing retry storms.

## Decision
Exponential backoff with full jitter, cap 30s, max 6 attempts.

## Alternatives
- Fixed interval: rejected, the storm is the failure mode.
- Server-side queue: rejected, out of scope for this change; recorded as backlog B-14.

## Consequences
Tail latency increases in the worst case; retry budget must be observable.
```

Rules: one decision per file, append-only status (`proposed`, `accepted`, `superseded by NNNN`), alternatives always stated, reversibility always stated. Never edit an accepted record's decision; supersede it.

## Vocabulary

When the feature introduces or sharpens a domain term, update `GLOSSARY.md` (or the project's equivalent). Format: term, one-sentence definition, and what it is *not*.

Agents coordinate through words. Two agents using "account" to mean different things is the most expensive bug in a multi-session project, and the cheapest to prevent.

When a decision changes how the domain is modeled, note it in the glossary entry and in the decision record, not in a comment.

## Durable memory

If the harness has a memory or knowledge tool, use it for facts that will matter beyond this feature: conventions the user confirmed, environment quirks, external constraints, and decisions with lasting effect. Save with provenance: who decided, when, and where the record lives.

Do not save: transient task state, ticket status, credentials, personal data, or anything the specification or a decision record already owns. Duplicated truth drifts; one owner per fact.

Corrections are operations, not overwrites: read the existing record, retire it, then write the corrected one, and verify the correction by reading it back. If the readback cannot see what you wrote (different scope, different visibility), say so rather than claiming the memory changed.

## Placeholders are bugs

`[to be filled]`, `TBD`, `???`, "we'll figure it out later" in a decision, and empty sections are defects. If a fact is genuinely unknown, write `unknown: <owner>`; that is different from an accidental hole.

## What the next agent needs

At the end of a feature, a fresh agent should be able to answer, from disk alone:

- what problem was solved and why it was worth solving
- what was explicitly not solved
- which decisions were made, and what was rejected
- how each claim was proven
- what to read first if the area changes again

If that agent would have to ask a question that the artifacts could have answered, write it down now.
