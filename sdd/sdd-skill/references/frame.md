# G0 Frame

Goal: replace an ambiguous request with a short, decision-complete framing that a stranger could act on. You are not designing the solution yet; you are making sure the problem, the actor, the edges, and the open questions are real.

## 1. Resolve before asking

Run this chain and stop at the first clear answer. Record what you looked at, because the brief needs it.

1. **The repository.** Read the files the request touches, their tests, and the README or docs that describe current behavior. Check `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, and any standards file.
2. **History.** `git log` on the area, open branches, recent changes to the same files, and the commit that introduced the behavior being changed. Prior art usually answers "why is it like this".
3. **The request itself.** Re-read the user's exact words. If they pasted an issue, log, or screenshot, extract every named symbol, path, and error code.
4. **Durable memory.** If the harness has a memory or knowledge tool, search it for prior decisions on this area. Look for a glossary, ADR directory, or decisions file in the repository.
5. **External sources.** Only when the question is about an external API, version, or upstream behavior. Cite the URL and the access date in the brief.

Escalate only what survives the chain. An escalation states what you searched, what you found, your best hypothesis, and 2 to 4 options. Never "what do you want?" with no work behind it.

## 2. Write the brief

Use `assets/brief.md`. Keep it under a page. Required content:

- **Problem**: the user-visible failure or gap, in the words of the person who has it.
- **Actor**: who is affected, and how often.
- **Observable success**: what someone can see or do after this ships that they cannot now. This becomes the source of acceptance criteria.
- **Scope**: what this change includes, at the level of behaviour, not files.
- **Non-goals**: what it deliberately does not do. Non-goals prevent the single most common review finding, scope creep.
- **Constraints**: compatibility, data, deadline, platform, approvals, spend.
- **Unknowns**: each one either `resolved: <answer + source>` or `owner: <who decides>`. No `TBD`.
- **Risk**: what breaks if this is wrong, and whether the change is a one-way or two-way door. Reversibility decides how much evidence the gate needs.

## 3. Size it, then pick a mode

Ask three questions in order:

1. Can this be described, decided, built, and verified in one session without compaction? If no, `wayfinder`.
2. Does it require more than one vertical slice, or more than one layer of the stack? If yes, `standard`.
3. Otherwise `lite`.

If the answer is `wayfinder`, do not write a spec yet. Write a **decision map** under `.sdd/<slug>/map.md`: the destination in one sentence, the open decisions that block the path, each as a ticket-like item with the question, the options, the owner, and what resolving it unblocks. Resolve one decision per session, append the answer to `decisions/`, and collapse into `standard` when the path is clear. Never build from a map.

## 4. Exit the gate

G0 is accepted when all of these are true:

- [ ] Every unknown is resolved or owned. `grep -n "TBD\|TODO\|??" brief.md` returns nothing.
- [ ] Success is stated as an observable, not an adjective.
- [ ] Non-goals are explicit.
- [ ] Reversibility is stated.
- [ ] The mode is chosen and written on the first line.
- [ ] `Status: accepted` is written, with the date.

Then move to `specify.md`. Do not start coding from the brief.

## Failure modes at this gate

- **Solution smuggled into the problem.** "We need a Redis cache" is a solution. The problem is "p95 reads are 900 ms". Rewrite.
- **Success defined as effort.** "Migrate the module" is effort. "Every caller of the old API compiles against the new one and the old export is deleted" is success.
- **Unknowns hidden as assumptions.** An assumption is fine, but it must be marked and scheduled for verification, not buried.
- **Premature confidence about users.** If you cannot name the actor, you have not framed the request; ask, with a hypothesis about who it might be.
