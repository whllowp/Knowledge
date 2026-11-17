# Charter: what SDD is fused from, and why

SDD exists because each parent tradition is strong exactly where the other is weak.

- Composable engineering skills produce a clean delivery spine: a spec that decides, tracer-bullet tickets with blocking edges, a task-graph frontier, TDD at agreed seams, two-axis review, fresh subagents, a PR shape that states merge danger. Their weak point is proof: review reads prose, "done" is a status, and nothing survives the session.
- An operating knowledge system produces a clean honesty spine: evidence with citations, resolve-before-asking, measurement before fixes, gates on destructive actions, typed failures with an operator fix path, durable decisions with provenance, output that avoids filler. Its weak point is delivery: it can tell you what is true but not how work gets cut, sequenced, built, and merged.

SDD keeps both spines and drops the parts that existed to serve a particular product.

## Contribution ledger

| Mechanism in SDD | Source | Why it survived |
|---|---|---|
| Six gates with fail-closed exits | fusion | A gate is the smallest unit that can be verified without reading the whole conversation |
| Spec sections (problem, solution, stories, decisions, testing, out of scope) | engineering skills | Forces intent to be decided before code, in a form that survives a context reset |
| Seams agreed before tests | engineering skills | The cheapest place to prevent test churn is before the first test exists |
| Tracer-bullet tickets + blocking edges + frontier | engineering skills | Turns a plan into a DAG that parallel agents can consume safely |
| Expand-contract for wide refactors | engineering skills | The only honest sequencing for a change that cannot land green in one slice |
| Two-axis review (Standards, Spec), never merged | engineering skills | One axis passing must not mask the other failing |
| Fresh subagents, pointers not payloads | engineering skills | Context inheritance is the main cause of duplicated and contradictory work |
| Evidence ledger with command + observed output | knowledge system | Converts "done" from a claim into an artifact |
| Resolve-before-asking with hypothesis escalation | knowledge system | Spends the user's attention only on decisions only they can make |
| Measure-before-you-fix | knowledge system | Prevents plausible fixes for unmeasured problems |
| Destructive-action gate | knowledge system | The flag confirms the agent is sure; the gate confirms the user is |
| Typed failure → fix → verify cycle | knowledge system | Makes failure handling auditable instead of improvised |
| Decision records with provenance | knowledge system | Rationale outlives the session that produced it |
| Glossary and ADR discipline | both | Shared vocabulary is the cheapest coordination mechanism between agents |
| Anti-slop output rules | knowledge system | Unverifiable prose is worse than a short honest report |

Deliberately dropped: mandatory issue-tracker integration, tracker-specific triage labels, any requirement that a human invoke each phase by name, and per-skill length theater. SDD must work in a plain repository with no tracker and no plugin, driven by a model that can invoke it directly.

## Precedence when rules conflict

1. **Safety and consent** beat everything. An irreversible action without scoped confirmation does not proceed, even if the spec says so, even if the user is in a hurry.
2. **Evidence** beats narrative. When a claim and a measurement disagree, the measurement wins; when neither exists, the claim is downgraded to an assumption and marked.
3. **The spec** beats improvisation. Work not in the spec is scope creep and belongs in the spec or out of scope, not in the diff.
4. **The user's decision** beats the agent's preference on anything user-owned: scope, product behavior, risk appetite, spend, merge.
5. **Speed** loses to the four above. If a deadline forces a shortcut, the shortcut is written as a dated waiver with its compensating check.

## Non-negotiables

- No gate passes on prose alone.
- No irreversible action without an explicit, scoped confirmation.
- No asking the user what the repository can answer.
- No subagent receives a copy of the parent's context instead of pointers.
- No review verdict that merges the axes.
- No hidden waiver: an exception is written where the next agent will find it.

## Tunables

Gate count for `lite`, evidence retention, whether the ledger is one file or one file per ticket, branch naming, and the review subagent count are all local choices. Change them in project conventions, not in this skill; a per-project convention overrides this default and says so explicitly.

## When to stop using SDD

Single-line changes, pure questions, and chores with their own skill do not need six gates. `lite` exists for the borderline case. If the whole feature fits in one paragraph of prose and one commit, skip SDD and say so; ceremony without risk is just cost.
