# G5 Ship and Learn

The change is proven and reviewed. Now make it mergeable and make the next change cheaper.

## 1. The PR body

Four parts, in this order, and nothing else unless the project template demands it.

**Summary.** The smallest artifact that makes the change clear: a before/after screenshot, a log line pair, a table of old and new values, a diagram of the flow. One visual beats three paragraphs. If no visual exists, use a three-sentence summary: what changed, why, what it affects.

**Evidence.** The ledger's highest-value rows, as commands and observed results, with links to the raw files. At minimum: the acceptance command that proves the main criterion, and the regression test that now discriminates. Never paste a result you did not run in this branch.

**Risk and merge danger.** State the door:

- **One-way door** (data migration, public API removal, irreversible schema change): say so, name the blast radius, name the rollback, and require the strongest review.
- **Two-way door** (behind a flag, additive, client-side): say so and say how to revert.

Name who or what is affected if this is wrong: which users, which jobs, which downstream consumers. "Low risk" without a reason is not a risk statement.

**Follow-ups.** Decisions deferred, tickets created, waivers still open, and anything the reviewer should watch after merge.

## 2. Close the work properly

- Mark every ticket `done` with its merge commit; leave none at `in-progress`.
- If the project uses an issue tracker, close the parent only after every ticket is done, and only by the mechanism the repo uses.
- Do not delete `.sdd/<slug>/`: the spec, tickets, decisions, and evidence are the record. Archive the folder (or link it from the PR) instead.
- Clean up worktrees and stale branches. A leftover worktree is a future collision.

## 3. Retro

`retro.md` answers one question: what in the environment made this harder than it should have been? Most severe first. Candidates, in the order that pays off:

1. **Missing automated check** that would have caught a finding: add the test, the lint rule, or the CI gate.
2. **Navigation**: a file that was hard to find, a module with no entry point in the docs, a spec section nobody could locate.
3. **Convention gap**: a rule that lived only in someone's head; write it in `AGENTS.md`, `CONTRIBUTING.md`, or the coding standards.
4. **Spec quality**: a section that had to be re-litigated; fix the template, not just the instance.
5. **Tooling**: a command that was slow or unclear; make it one command.
6. **This skill**: a step that never fired, or fired and cost more than it saved. Propose the edit.

Do not write a retro that lists what went well. It does not change the next session.

## 4. Memory writeback

Write, with provenance:

- decision records for decisions taken during build that were not in the spec
- glossary entries for vocabulary introduced or changed
- durable facts about the environment or external constraints, if the harness has a memory facility
- a one-line pointer in the project's conventions if this feature established a pattern others should follow

Do not write a summary of the work. The artifacts already are the summary; a second one drifts.

## 5. Process amendment

If `retro.md` proposes a change to this skill, make it as a small, reviewable edit: one rule per edit, with the friction that justified it quoted in the commit message. Delete rules that never fire. A process that only grows becomes noise that agents skip.

## Exit the gate

- [ ] PR body has summary, evidence, risk (with door type), follow-ups.
- [ ] All tickets closed; no `in-progress` left.
- [ ] `.sdd/<slug>/` archived or linked, not deleted.
- [ ] `retro.md` written with at least one concrete environment improvement or an explicit "none".
- [ ] Decisions and glossary updated.
- [ ] Waivers either expired or carried into the follow-up list.

## After merge

Watch the first real use. If the feature is behind a flag, say who turns it on and when. If a follow-up is required before GA, make it a ticket with an owner, not a sentence in the PR.
