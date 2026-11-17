# Workflow Map: `mattpocock/skills` (aka "skills for real engineers")

Read-only analysis of `E:\sdd\skills-main\skills-main`. Sources: `skills/engineering/*`, `skills/productivity/*`, `docs/engineering/*.md`, `docs/agents/*`, `.agents/*`, root `CLAUDE.md`, `GLOSSARY.md`, `SCOPE.md`. Nothing in the repo was modified.

The repo is not a methodology essay. It is an executable operating system: 30-odd `SKILL.md` files that each own one phase, one artifact, or one vocabulary, wired together by explicit `Call the Skill tool with "X"` instructions, with all durable state pushed out to an issue tracker (real or a `.scratch/` markdown convention) plus three in-repo doc types (`GLOSSARY.md`, `docs/adr/`, `CODING_STANDARDS.md`).

---

## 1. The lifecycle, in order

The canonical chain (stated verbatim in `docs/engineering/to-spec.md:78` and repeated on every docs page):

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review → retro
```

with `tdd` running *inside* `implement`, and `implement-spec` replacing *both* `to-tickets`-driven dispatch and `implement` in one run:

```txt
grill-with-docs → to-spec → to-tickets → implement-spec → retro
```

| # | Phase | Owner skill(s) | Invocation | Handoff artifact out |
|---|-------|----------------|------------|----------------------|
| 0 | Setup (once per repo) | `setup-matt-pocock-skills` | user | `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `docs/agents/triage-labels.md`, an `## Agent skills` block in `CLAUDE.md`/`AGENTS.md` |
| 1 | Sharpen the idea | `grill-with-docs` (or `grill-me` with no repo); primitive `grilling`; side-effect `domain-modeling` | user | `GLOSSARY.md` terms + `docs/adr/NNNN-slug.md`; settled decisions live only in the conversation |
| 2 | Collapse to a spec | `to-spec` | user | one issue in the tracker: the spec (7 template sections), labelled `ready-for-agent` |
| 3 | Split into tickets | `to-tickets` | user | one issue per tracer-bullet ticket, blockers-first, each with blocking edges (native links, or `Blocked by:` text) |
| 4a | Build one ticket | `implement` (drives `tdd`) | user | commits on the *current* branch; ticket left open by design |
| 4b | Build the whole spec | `implement-spec` (implementer + merger subagents, each `tdd`) | user | one **integration branch**, tickets resolved "the way the issue tracker closes work", optional PR |
| 5 | Review the diff | `code-review` (2 parallel subagents) | user or model (called by `implement`/`implement-spec`) | two-axis report, no file written to repo |
| 6 | Shape the PR | `pr` | model-invoked | PR body: Summary / Evidence / Merge Danger |
| 7 | Close the loop | `retro` | user | proposed edits to the *environment*: checks, `CODING_STANDARDS.md`, `AGENTS.md`, navigation pointers, tooling |

Phase 0 is a hard precondition for 2, 3, 4b and the triage on-ramp (`to-spec`, `to-tickets`, `triage` name it explicitly; see `.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md`, which splits hard vs soft dependants: hard = "output is wrong, not just fuzzy").

### On-ramps that merge onto the chain

| Situation | Skill | Where it rejoins |
|---|---|---|
| Bugs/requests piling up, not created by you | `triage` | produces agent briefs + `ready-for-agent` label, which `implement` later picks up |
| Something broken, hard | `diagnosing-bugs` | ends in a regression test + fix commit; `retro` follows in-session; missing seam escalates to `improve-codebase-architecture` |
| Huge, foggy, multi-session effort | `wayfinder` | **must** hand off at `to-spec` (`/to-spec #<map_issue>`), never straight to `implement` |

### Side branches (not steps)

`prototype` (throwaway artifact answering one design question; branch `prototype/<name>`, never merged), `research` (background agent; cited markdown file, or `research/<name>` branch under wayfinder), `improve-codebase-architecture` (periodic maintenance; HTML report then grilling; picking a candidate *generates an idea* for `/grill-with-docs`), `handoff` (portability file in `$TMPDIR`/`%TEMP%`), `wizard` (interactive bash script for human-only steps), plus the two vocabulary layers `domain-modeling` and `codebase-design` that run *beneath* everything.

---

## 2. Phase detail: inputs, outputs, storage, gates

### 0. `setup-matt-pocock-skills` (setup, once)

- **In**: repo state (`git remote -v`, existing `GLOSSARY.md`/`GLOSSARY-MAP.md`, legacy `CONTEXT.md`, `docs/adr/`, `.scratch/`, monorepo signals like `pnpm-workspace.yaml`).
- **Out**: three consumer docs in `docs/agents/` (`issue-tracker.md`, `domain.md`, `triage-labels.md`), an `## Agent skills` block appended or updated in `CLAUDE.md` (preferred if it exists) else `AGENTS.md`, and any missing tracker labels (`gh label create`).
- **Decision rules**: tracker choice defaults to GitHub if a GitHub remote exists, GitLab if a GitLab remote, else offer local markdown or freeform "other". Domain docs default to **single-context** (one `GLOSSARY.md` + `docs/adr/`); multi-context (`GLOSSARY-MAP.md` + per-context files) offered *only* on monorepo signals. Triage vocabulary section is skipped entirely if the `triage` skill is not installed. "Never create `AGENTS.md` when `CLAUDE.md` already exists".
- **Gate**: "One section, one answer, then the next." Draft is shown and the user may edit before writing. For a GitHub/GitLab tracker it is done only when `gh repo view` / `glab repo view` prints the project.

### 1. `grill-with-docs` → `grilling` + `domain-modeling`

- **In**: a loose idea, the working directory, existing `GLOSSARY.md` and ADRs.
- **Out**: no build artifact. Two by-products: glossary terms written **inline as they resolve** ("Don't batch these up"), and ADRs written only when all three tests pass (hard to reverse, surprising without context, the result of a real trade-off). The rest of the state stays in the context window on purpose.
- **Mechanism** (`grilling`): model the subject as a **design tree**; ask the whole **frontier** per **round**; fixed format per question:

```
❓ **Q1** - **<title>**: <body, possibly multiple choices>

➡️ <recommended answer>
```

  "Word each question so 'yes' accepts your recommended answer." Facts are the agent's job and are dispatched to a subagent; decisions are the user's and the agent waits. End condition: "The session is done when the frontier is empty". Then an explicit confirmation gate before anything is acted on.
- **Stop/gate**: shared-understanding confirmation. `grill-with-docs` is a 7-line wrapper whose entire body is `Call the Skill tool twice, for "grilling" and "domain-modeling"`.

### 2. `to-spec`

- **In**: the current conversation (the decisions already made), the codebase, `GLOSSARY.md`, ADRs.
- **Out**: **one tracker issue**, the spec, with these exact sections: `Problem Statement`, `Solution`, `User Stories` (a "LONG, numbered list" of `As an <actor>, I want a <feature>, so that <benefit>`), `Implementation Decisions`, `Testing Decisions`, `Out of Scope`, `Further Notes`.
- **Process**: explore repo → sketch test **seams** at the highest existing seam → "Check with the user that these seams match their expectations" → write → publish → apply `ready-for-agent`.
- **Decision rules**: existing seams beat new ones; highest seam possible; "The fewer seams across the codebase, the better - the ideal number is one." No file paths, no code snippets, except a decision-dense prototype snippet (state machine, reducer, schema, type shape), marked as coming from a prototype.
- **Gate**: the seam confirmation is the only interactive stop. If the tracker vocabulary was never provided: "tell the user to run `/setup-matt-pocock-skills`".
- **Known sharp edge** (documented, not fixed): the spec carries `ready-for-agent`, so AFK pollers may try to build the whole spec; mitigation is to exclude the parent explicitly or drop the label after `/to-tickets`.

### 3. `to-tickets`

- **In**: a spec (argument, issue URL, or the live thread), plus codebase state.
- **Out**: N tickets, each a **tracer-bullet vertical slice** with **blocking edges**, published blockers-first.
  - Local tracker: one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order. "one ticket per file, never a single combined file".
  - Real tracker: one issue per ticket in dependency order, sub-issues of the source issue, native blocking links (`gh issue create --blocked-by 12,15`), `ready-for-agent` label.
- **Local ticket format**: `# <NN>: <title>` / `**What to build:**` / `**Blocked by:**` (or "None (can start immediately)") / `**Status:** ready-for-agent` / `- [ ]` acceptance criteria.
- **Issue template**: `## Parent`, `## What to build`, `## Acceptance criteria`, `## Blocked by` (omitted when edges are native).
- **Rules**: vertical not horizontal; demoable/verifiable alone; "sized to fit in a single fresh context window"; prefactoring first ("Make the change easy, then make the easy change."); no file paths/line numbers; do not close or modify the parent.
- **Gate**: an explicit quiz before publishing. "Present the proposed breakdown as a numbered list" with Title / Blocked by / What it delivers, then ask granularity, edge correctness, merge-or-split. "Iterate until the user approves the breakdown."
- **Exception**: **wide refactors** become expand → migrate (batches by blast radius, each blocked by the expand) → contract (blocked by every batch), with a shared integration branch and a final integrate-and-verify ticket when batches cannot stay green alone.

### 4a. `implement` (one ticket, one session)

The whole `SKILL.md` is 17 lines, deliberately: fetch the ticket and "state its title before starting", "Call the Skill tool with 'tdd' where possible, at pre-agreed seams", "Run typechecking regularly, single test files regularly, and the full test suite once at the end", then `code-review`, then "Commit your work to the current branch."
- **Out**: a commit on the branch you were already on. It does not create a branch, does not open a PR, does not close the ticket, does not tick acceptance boxes (all documented as expected behavior, with the consequence that "If nothing gets closed, nothing ever becomes visibly unblocked").
- **Gate**: none internal. The intended rhythm is external: clear context, one ticket, commit, clear again.
- **Ambiguity rule**: a passed reference is fetched and its title stated; "If the reference is ambiguous, ask."

### 4b. `implement-spec` (whole spec, one run)

- **In**: spec + tickets with blocking edges + tracker config.
- **Out**: one **integration branch** with every ticket landed; draft PR only if the tracker closes work through PRs or the user asked; then the PR is marked ready. Worktrees are cleaned up at the end.
- **Steps** (verbatim order): read spec/tickets as a task graph → optional **exploration subagent** saving notes *outside the repo* for reuse → create integration branch → one fresh **implementer subagent per ticket, each in its own worktree and branch** (confirm based on integration branch, reset if not; call `tdd`; merge the integration branch tip before reporting done) → **merger subagent** lands each finished branch → re-check the frontier and launch more implementers → one `code-review` over the integration branch → all findings fixed by **a single fresh implementer subagent** → mark PR ready or resolve each ticket → clean up worktrees.
- **Decision rules**: "The tickets are not a list of steps. They are a **task graph**"; "there is always a **frontier** of tickets which are ready to be grabbed"; communicate by **context pointers** ("to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.").
- **Gate**: review happens exactly once, after everything lands. Running it mid-run makes unbuilt tickets read as failures.

### 5. `tdd` (inside 4a/4b; also standalone)

- **In**: a concrete behaviour, and agreed seams.
- **Out**: red-green commits; no refactor step.
- **Rules**: "Test only at pre-agreed seams. Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam." Ask "What's the public interface, and which seams should we test?" and give each seam "a one-line note on what it catches and what it misses". Red before green, one slice at a time, no speculative features, "Refactoring is not part of the loop" (it moved to `code-review`; the trigger phrase `red-green-refactor` was kept and the mismatch is a known open issue).
- **Mocking**: at system boundaries only (external APIs, sometimes DB, time/randomness, sometimes filesystem). "Don't mock: Your own classes/modules, Internal collaborators, Anything you control."
- **Gate**: the seam confirmation, before any test file exists.

### 6. `code-review`

- **In**: a **fixed point** supplied by the user (SHA, branch, tag, `main`, `HEAD~5`) plus the repo's standards sources and the spec.
- **Out**: a chat report only, two blocks: `## Standards` and `## Spec`, each with a `Under 400 words` brief, plus a one-line summary of counts and the worst issue *per axis*.
- **Process**: pin the point and capture `git diff <fixed-point>...HEAD` (three dots, merge-base) plus `git log <fixed-point>..HEAD --oneline`; validate with `git rev-parse` and non-empty diff **before** spawning anything; find the spec in a fixed order (commit-message issue refs → argument path → `docs/`, `specs/`, `.scratch/` file matching branch name → ask); collect every standards doc (with `CODING_STANDARDS.md` / `CONTRIBUTING.md` mandatory if present); add the 12-smell Fowler baseline; spawn both axes in parallel, foreground.
- **Decision rules**: "The repo overrides"; each smell is "a labelled heuristic ('possible Feature Envy'), never a hard violation"; skip anything tooling already enforces; "Do not merge or rerank findings"; never pick a cross-axis winner. Missing spec: skip the Spec subagent and report "no spec available".
- **Gate**: bad ref or empty diff fails before any subagent spawns.

### 7. `pr` (model-invoked)

- **Out**: a PR body with exactly three parts: `## Summary` (the *smallest* visual that makes the point: pseudocode, call tree, component tree, file tree, Mermaid, or a diff sketch), `## Evidence` (`**Before:**` / `**After:**`, screenshots S-tier, execution-based A-tier), `## Merge Danger` (`**Door:**` one-way or two-way, `**Blast Radius:**` one word).
- **Rules**: "Skip all preambles and keep prose brief." Use `GLOSSARY.md` language. You may use one visual, several, "it is unlikely you will use all of them".

### 8. `retro`

- **In**: the session (default: the current one), or its logs.
- **Out**: a severity-ordered list of **environment** changes, in seven categories: Navigation, Automated checks, Coding standards, Global `AGENTS.md`, Tool economy, No-ops, Information access.
- **Decision rule**: classify a violation first. "a **mechanical** one ... gets a deterministic check, full stop"; "Default to building the check over writing the rule"; `CODING_STANDARDS.md` is reserved for genuine judgement calls; an unguarded repo (no pre-commit hook, no CI lint/typecheck/test) "is itself a finding".
- **Model of the system**: the review agent has the least context pressure, so it owns standards; the implementation agent has the most, so `CLAUDE.md`/`AGENTS.md` carry "incredibly sparingly, usually only for **navigation pointers**".

### On-ramp: `triage`

- **In**: untriaged issues and (optionally) external PRs. "a PR is an issue with attached code".
- **Out**: exactly one category role (`bug`/`enhancement`) and one state role (`needs-triage`/`needs-info`/`ready-for-agent`/`ready-for-human`/`wontfix`), plus an **agent brief** comment for `ready-for-agent`, triage notes for `needs-info`, or an `.out-of-scope/<concept>.md` record for a rejected enhancement.
- **Hard rule**: every comment posted "**must** start with" `> *This was generated by AI during triage.*`
- **Process**: gather context → recommend and wait → **verify the claim** (reproduce the bug; for a PR, check it out and run the tests) → grill if needed (`grilling` + `domain-modeling`) → apply outcome. Two codebase checks precede all of it: redundancy (already implemented ⇒ `wontfix` with a pointer, and *no* `.out-of-scope/` write) and prior rejection (read `.out-of-scope/*.md`).
- **Agent brief format** (`AGENT-BRIEF.md`): `**Category:**`, `**Summary:**`, `**Current behavior:**`, `**Desired behavior:**`, `**Key interfaces:**`, `**Acceptance criteria:**` checkboxes, `**Out of scope:**`. Principle: "Durability over precision", "Behavioral, not procedural", "Don't reference file paths", "Don't reference line numbers".
- **Gate**: "Wait for direction" after the recommendation; state overrides are trusted but confirmed before acting.

### On-ramp: `wayfinder`

- **In**: a loose idea too big for one session, whose route is invisible.
- **Out**: a **map** issue labelled `wayfinder:map` whose body has exactly five sections (`## Destination`, `## Notes`, `## Decisions so far`, `## Not yet specified`, `## Out of scope`) and whose tickets are **child issues**, each labelled `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`) and carrying a `## Question` body.
- **Charting** (one session, six steps): name the destination (`grilling` + `domain-modeling`) → breadth-first grill to map the frontier; "**If this surfaces no fog** ... you don't need a map. Stop and ask" → create the map → create the tickets you can specify, then wire blocking in a **second pass** (ids are needed first; placeholders auto-link wrongly) → fire one `research` subagent per research ticket in parallel on `research/<name>` branches, pushed, no PR → stop.
- **Working** (one ticket per session, except research): load the low-res map → choose (user's pick, else first frontier) and **claim by assigning before any work** → resolve per the type label (labels, not bodies, carry the type) → post a **resolution comment**, close, append a context pointer to Decisions-so-far → create-then-wire newly surfaced tickets; graduate fog; rule out-of-scope work; delete invalidated tickets.
- **Rules**: "produce decisions, not deliverables"; "The map is an **index**, not a store"; "a decision lives in exactly one place, its ticket"; refer to tickets **by name** ("never by a bare id, number, or slug"); fog vs ticket test is "whether you can state the question precisely now, _not_ whether you can answer it now"; `wayfinder:` labels only, "never a triage label like `ready-for-agent`".
- **Gate**: nothing resolves in the charting session; a session stops after one resolution; handoff is to `to-spec`, not to code.

### Standalone: `diagnosing-bugs`

Six phases, with an explicit gate between 1 and 2: **Phase 1 build a feedback loop** (10 escalating constructions: failing test → curl → CLI fixture → headless browser → captured trace replay → throwaway harness → fuzz → bisection → differential → HITL script). Completion criterion is a single named command, already run once, that is red-capable, deterministic, fast (seconds), and agent-runnable. "No red-capable command, no Phase 2." Then **Phase 2 reproduce + minimise** (cut one element at a time until every remaining element is load-bearing), **Phase 3** 3–5 ranked falsifiable hypotheses shown to the user, **Phase 4** instrument one variable at a time, tagged `[DEBUG-a4f2]`, **Phase 5** regression test before fix but only at a correct seam (and "If no correct seam exists, that itself is the finding"), **Phase 6** cleanup checklist. Secrets: "Redact every secret first", write `<REDACTED>`.

### Vocabulary layers (always available, never a session)

- `domain-modeling`: challenge against the glossary, sharpen fuzzy language, stress-test with concrete scenarios, cross-reference code, update `GLOSSARY.md` inline, offer ADRs sparingly. "It is a glossary and nothing else", explicitly "devoid of implementation details".
- `codebase-design`: fixed vocabulary (module, interface, implementation, depth, seam, adapter, leverage, locality) with banned substitutes ("**Avoid**: unit, component, service", "**Avoid**: API, signature", "**Avoid**: boundary"). Principles: depth is a property of the interface; the deletion test; "The interface is the test surface"; "One adapter means a hypothetical seam. Two adapters means a real one." Sub-docs: `DEEPENING.md` (4 dependency categories: in-process, local-substitutable, remote-but-owned via ports & adapters, true external via mock; "replace, don't layer" testing) and `DESIGN-IT-TWICE.md` (3+ parallel subagents, each given a different design constraint, then a comparison by depth/locality/seam placement and an opinionated recommendation).

---

## 3. Recurring conventions

**Tracer bullet.** The unit of decomposition everywhere. `to-tickets` defines it as "a narrow but COMPLETE path through every layer (schema, API, UI, tests)"; `tdd` uses it for the first red-green cycle; wayfinder uses its inverse to keep decision tickets small.

**Blocking edges and the frontier.** The dependency graph is authored by `to-tickets` as explicit "Blocked by" edges, stored natively where the tracker has native dependencies (`gh issue create --blocked-by`), as text where it does not. Any ticket whose blockers are closed is on the **frontier**. The same word is reused by `grilling` (questions whose prerequisites are settled) and by wayfinder (open + unblocked + unclaimed). "Blockers-first" publication is what makes ids available for the edges.

**Fixed review point.** `code-review` refuses to run without one: "If they didn't specify one, ask for it." Always `git diff <fixed-point>...HEAD`, three-dot merge-base, never two-dot, never working tree. This is why `implement`'s review-before-commit is documented as broken ("unless an interim commit already exists there is nothing in that diff to review").

**One vertical slice.** "One slice at a time. One seam, one test, one minimal implementation per cycle." Applies to a ticket (one demoable path), a TDD cycle (one test), an `implement` run (one ticket), a wayfinder session (one ticket), and a spec's seam budget (ideally one seam total).

**Grilled decisions.** Everything upstream of code is an interview, not a proposal: rounds over a design tree, recommendations attached to every question, facts delegated and decisions withheld from the agent. "An agent running `grilling` that answers its own decisions has broken the skill."

**Phase boundaries.** `ask-matt/PHASE-BOUNDARIES.md` gives an ordered five-question tree at every phase boundary, "The first **yes** wins":
1. Continue (next phase needs this phase as a primary source, or there is smart-zone room) → 2. `/clear` (context irrelevant; also non-terminal, the old session stays resumable) → 3. `/handoff` (only for a new harness, a new directory, a colleague, or forking a side task mid-phase; it buys "portability") → 4. subagent (the task can be done AFK) → 5. `/compact` (the default, "not the first reach").
The framing is primary-source loss: every move except Continue turns "the session as it happened" into "a summary of it". Smart zone is quoted as "~150k tokens".

**Subagent usage: fresh context, pointers not payloads.** Every skill that dispatches a subagent says to start it with a fresh context window, and the repo enforces this in `CLAUDE.md` ("Some harnesses (Codex, for one) fork the parent conversation by default, and a fork inherits the parent's context, which is what the subagent was meant to escape"). Communication is by **context pointer** (spec, ticket, notes, commit), never by pasted summary. Subagents appear in: `implement-spec` (exploration, implementers, mergers, one fixer), `code-review` (2 axes), `DESIGN-IT-TWICE.md` (3+), `grilling` (facts), `research` (background agent), `improve-codebase-architecture` (codebase walker), `wayfinder` (research tickets).

**User-invoked vs model-invoked.** Two classes, mechanically enforced per harness (`.agents/invocation.md`):
- **User-invoked**: `disable-model-invocation: true` in frontmatter + `policy.allow_implicit_invocation: false` in `agents/openai.yaml`. Reachable **only** by the human typing it, and critically "A user-invoked skill may invoke model-invoked skills, but it can never reach another user-invoked skill." Its `description` is human-facing, with trigger lists stripped.
- **Model-invoked**: the default; omit both flags; rich trigger phrasing ("Use when the user wants…, mentions…") so auto-invocation fires. Test: "could the model usefully reach for this autonomously?"
- Dependencies are expressed as "Call the Skill tool with X", never as `../other/FILE.md` cross-links and never as a bare `/name` left to interpretation. "The Skill tool takes one skill per call", so a two-skill step says "Call the Skill tool twice, for 'grilling' and 'domain-modeling'". When the dependency is user-invoked, it must be phrased as an instruction to the human ("tell the user to run `/setup-matt-pocock-skills`").

The split across the set (this is load-bearing for how the chain is driven: everything a human must type is exactly the set of decisions the design refuses to let the model make on its own):

| User-invoked (human only) | Model-invoked (model or human) |
|---|---|
| `ask-matt`, `grill-with-docs`, `grill-me`, `handoff`, `triage`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `wayfinder`, `retro`, `improve-codebase-architecture`, `setup-matt-pocock-skills`, `teach`, `wait-what`, `to-questionnaire` | `grilling`, `domain-modeling`, `codebase-design`, `tdd`, `code-review`, `pr`, `prototype`, `research`, `diagnosing-bugs`, `wizard`, `writing-for-agents` |

Consequence: `implement` sits in the left column, so "then `/implement` per ticket" in `ask-matt` or `to-tickets` "is an instruction to you, not something the agent will do unprompted."

**State storage is abstracted, never hardcoded.** Skills say "publish to the project issue tracker" / "fetch the relevant ticket"; the meaning comes from `docs/agents/issue-tracker.md` (found through the `## Agent skills` block, not a fixed path). Three shipped backends: GitHub (`gh`), GitLab (`glab`), local markdown (`.scratch/`). Each backend doc has a **"Wayfinding operations"** section, because map/ticket/block/claim/frontier have to be expressed in that tracker's primitives.

---

## 4. Anti-patterns and hard rules (short verbatim quotes)

**Spec/tickets**
- `to-spec`: "Do NOT interview the user; just synthesize what you already know." Also "Do NOT include specific file paths or code snippets. They may end up being outdated very quickly."
- `to-tickets`: horizontal slicing (the single most-reported failure; a 26-ticket layer-sliced stack produced "roughly twenty agent runs per closed ticket", most of it rework). "never a single combined file". "Do NOT close or modify any parent issue."
- `to-tickets` acceptance criteria that cannot fail (already true at base commit, or satisfied only by another ticket) are called out as a recurring defect.
- Triage over generated tickets: "Tickets that `/to-tickets` produced are already agent-ready, so **don't triage them**."

**TDD**
- Implementation-coupled tests ("The tell: the test breaks when you refactor but behavior hasn't changed"); tautological tests ("the assertion recomputes the expected value the way the code does"); horizontal slicing ("writing all tests first, then all implementation").
- "No test is written at an unconfirmed seam." "Refactoring is not part of the loop."
- Don't mock "Your own classes/modules", "Internal collaborators", "Anything you control".

**Build**
- `implement` never reopens the plan ("It never reopens the plan", "no interview, no clarifying round"). It sits downstream and trusts its inputs: "a badly-structured map or a horizontally-layered ticket gets built as written."
- Multiple `/implement` sessions in one checkout is worse than unsupported (documented `git commit --amend` landing on another session's commit, `refs/stash` vanishing).
- `implement-spec`: no review mid-run; no pasted summaries between agents; no starting an implementer without confirming its worktree base.

**Review**
- "Do not merge or rerank findings." Don't pick a winner across axes. Don't trust findings without checking the citation: "Sub-agent output is a hypothesis, not evidence." Don't loop review to clean ("it never will").
- Prefer a fresh session: "Same context reviewing itself isn't review, it's confirmation bias with a slash command."

**Wayfinder**
- "produce decisions, not deliverables"; "never resolve more than one ticket per session" (research is the only exception); "never by a bare id, number, or slug"; no triage labels; a `wayfinder:task` that looks like a build slice "is either mis-typed or belongs downstream".

**Diagnosis**
- "Do not proceed to hypothesise without a loop." "Never 'log everything and grep'." Never leave `[DEBUG-...]` instrumentation behind. Never show an unredacted secret.

**Research / prototype**
- `research`: primary sources only, "not a secondary write-up of them"; one file per run; the skill has no stopping criterion, so scope it yourself.
- `prototype`: "Throwaway from day one, and clearly marked as such"; "No persistence by default"; "Skip the polish"; never promote a prototype into production; a whole-app prototype is a different artifact and doesn't belong here.

**Knowledge artifacts**
- `GLOSSARY.md` "should be totally devoid of implementation details"; "It is a glossary and nothing else." ADRs only when hard to reverse *and* surprising *and* a real trade-off; otherwise skip.
- `code-review`'s smell baseline is "Always a judgement call", suppressed wherever the repo documents otherwise.
- `retro`: don't write a standard for what a deterministic check can catch; don't add to `AGENTS.md` what belongs in standards or checks; hunt "No-ops" (steering text that changes nothing).

**Repo-wide prose rules** (`CLAUDE.md`)
- "No em-dashes anywhere in this repo's prose (`SKILL.md` files, docs, `README.md`, `CHANGELOG.md`, ADRs, changesets, code comments)." Where a sentence reaches for one, rewrite "with a comma, colon, period, parentheses, or a conjunction, whichever the sentence actually wants; never do a blind character substitution."
- Docs pages: no H1, "every link is absolute" (they publish to `aihero.dev/skills-<name>`), "Never name the author", "Branches go in a table or a list, never in a paragraph", fixed four sections (`What it does`, `When to reach for it`, `Common questions`, `It's working if`) plus `Where it fits`.

---

## 5. Composition: small vs large

Session count is the discriminator, explicitly, repeatedly.

| Work size | Route |
|---|---|
| Idea not yet decided, fits one session, in a repo | `grill-with-docs` → `implement` (no spec, no tickets) |
| Same, no working directory | `grill-me` → work by hand or `to-questionnaire` for missing knowledge |
| Decided, fits one context window | `implement` directly, even from the live thread |
| Multi-session feature, route is visible | `grill-with-docs` → `to-spec` → `to-tickets` → `implement` per ticket with `/clear` between |
| Multi-session, you would rather orchestrate than drive | `… → to-tickets → implement-spec` (one run, one integration branch) |
| Huge, foggy, route invisible | `wayfinder` (map) → **`to-spec #<map>`** → `to-tickets` → implement/implement-spec |
| One behaviour, test-first, no spec | `tdd` alone |
| Already built, want it checked | `code-review` alone against a fixed point |
| Incoming bug/request, not yours | `triage` → `ready-for-agent` brief → `implement` |
| Hard bug | `diagnosing-bugs` → fix commit → `retro` |
| Design question talking can't settle | `prototype` (own directory, own session, bridged by `handoff`), answer folds back into grilling or the spec |
| Missing external fact | `research` (background agent), file taken *into* `grill-with-docs` / `to-spec` |
| Codebase health | `improve-codebase-architecture`; the chosen candidate "generates an idea" for `/grill-with-docs` |

Three composition rules worth naming:
1. **Wayfinder must collapse through `to-spec`.** "Looping the map straight into `/implement` skips that collapse and throws the linked detail away." Exception: "go straight to `/implement` only when the effort turned out genuinely small."
2. **`implement` vs `implement-spec` is a dispatch question, not a size question.** `implement` makes *you* the dispatcher (one session per ticket, `/clear` between, you track the frontier). `implement-spec` makes one orchestrating session the dispatcher and costs you per-ticket visibility: "you review the integration branch at the end." Prerequisite for 4b: a harness that runs background subagents with git worktrees, else "it is only a slower `implement`."
3. **Prototype and research are side branches, not steps.** They leave the main chain untouched; what returns is the *decision* (prototype) or the *facts* (research), and the artifact stays on a throwaway branch (`prototype/<name>`, `research/<name>`) or a notes file, pointed at from the issue.

---

## 6. Parallel execution, task graphs, caps

**Where parallelism is designed in**
- `implement-spec`: the frontier is a live concurrency width. "Implementer subagents should be run in the background where possible for maximum concurrency"; step 6 re-reads the frontier after each landing and launches more. Isolation is one worktree + one branch per ticket, with merges done by a separate **merger subagent**. No numeric cap anywhere: the graph's shape sets the width. Documented collision mode: worktrees "postpone" collisions to merge time, and two frontier tickets touching one shared file can invent different names for the same thing (fix: add a blocking edge, or pin names in the exploration notes).
- `code-review`: exactly 2 subagents, deliberately isolated so one axis cannot contaminate the other, issued together in the foreground, each capped at ~400 words.
- `DESIGN-IT-TWICE.md`: 3+ subagents in parallel, each on a different design constraint, while the user reads the problem-space brief.
- `grilling`: a subagent per missing fact, and "Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait".
- `wayfinder`: one research subagent per research ticket, fired at charting time, run in parallel, AFK, on `research/<name>` branches.
- `research`: one background agent per invocation (its documented bug is that the background agent re-delegates and nests).

**Where parallelism is capped or refused**
- Grilling runs in **rounds**: a whole frontier per round, but the rounds are strictly sequential, and the frontier is chosen by judgement because "it does not compute it from a graph".
- One ticket per `implement` invocation, full stop.
- Wayfinder sessions: one ticket per session except research; parallel *sessions* are possible ("The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently") but the docs advise against it, because two grilling sessions cannot hear each other.
- One `/implement` per checkout: parallel sessions in one directory corrupt the index, `HEAD`, and shared `refs/stash`.
- Code review to convergence: refused ("Do not run it in a loop until it comes back clean").
- Human confirmation gates are serial by construction: spec seams, ticket quiz, grilling rounds, triage direction, retro ordering.

**Other numeric/capacity constraints that shape the workflow**: tickets sized to one fresh context window (wayfinder says "one 100K token agent session"); smart zone "~150k tokens"; `implement` runs routinely exceed 100k tokens and that is a ticket-sizing signal, not an effort-level signal; tdd loops must be seconds not minutes.

---

## 7. Naming, paths, and wording

**Repo layout conventions** (enforced by `CLAUDE.md` + `scripts/link-skills.sh`)
- `skills/<bucket>/<skill-name>/SKILL.md`, buckets `engineering`, `productivity`, `misc`, `in-progress`, `deprecated`; only the first two are "promoted" and ship docs.
- Every promoted skill needs: an entry in the top-level `README.md` (skill name linked to its `SKILL.md`), an entry in `.claude-plugin/plugin.json`'s `skills` array, a bucket `README.md` line under **User-invoked** or **Model-invoked**, and a docs page at `docs/<bucket>/<skill-name>.md`.
- `agents/openai.yaml` beside every `SKILL.md` (`interface.display_name`, `interface.short_description`, plus the Codex invocation policy).
- `ask-matt` is the router and must be re-read and updated whenever a user-reachable skill is added, renamed, removed, or re-wired: "a new skill it never mentions, or a stale one it still routes to, is a router that lies."

**Artifact names and paths**
| Artifact | Location |
|---|---|
| Spec (local tracker) | `.scratch/<feature-slug>/spec.md` |
| Ticket (local tracker) | `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, `NN` from `01`, works as `/implement 03` |
| Triage state (local) | `Status:` line near the top; conversation appends under `## Comments` |
| Wayfinder map (local) | `.scratch/<effort>/map.md` |
| Wayfinder ticket (local) | `.scratch/<effort>/issues/NN-<slug>.md`, with `Type:` and `Status:` (`claimed`/`resolved`), `Blocked by: NN, NN` |
| Map label / ticket labels | `wayfinder:map`, `wayfinder:<type>` |
| Triage labels | `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` (mapped per repo in `docs/agents/triage-labels.md`) |
| Glossary | `GLOSSARY.md`; multi-context via `GLOSSARY-MAP.md` |
| ADRs | `docs/adr/NNNN-slug.md`, sequential, lazy creation |
| Coding standards | `CODING_STANDARDS.md` (read by review, not implementation) |
| Rejected concepts | `.out-of-scope/<concept>.md`, one per concept, kebab-case, with `**Decision:**`, `**Reason:**`, `**Prior requests:**` |
| Prototype branch | `prototype/<name>`, out of main, never merged |
| Research branch | `research/<name>`, pushed, "open no PR: it is never merged" |
| Handoff doc | OS temp dir (`$TMPDIR`, `/tmp`, `%TEMP%`), "not the current workspace" |
| Architecture report | `<tmpdir>/architecture-review-<timestamp>.html`, Tailwind + Mermaid via CDN, opened for the user |
| Per-repo config | `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `docs/agents/triage-labels.md` |

**Wording rules that carry process meaning**
- No em-dashes (see section 4). Applies to skills, docs, ADRs, changesets, comments.
- Use `GLOSSARY.md` vocabulary in every generated artifact: issue titles, ticket bodies, spec sections, test names, hypotheses, PR prose.
- In-repo glossary is itself opinionated: the tracked unit is an **Issue**; "ticket" is reserved for a **Decision ticket** (`wayfinder`'s unit) or for quoting external systems. Avoid "backlog" entirely.
- Skill names in prose drop the leading `/` inside operative instructions (`Call the Skill tool with "tdd"`), and keep `/` in router prose meant for humans (`ask-matt`, bucket READMEs).
- Docs pages: absolute links, no author attribution, no install commands, no H1, the defining constraint stated as plain declarative prose ("never a labelled aside like 'The defining constraint:'").
- Truthfulness rules inside artifacts: a spec that "states something you never said, that is a defect"; research claims each carry a citation; review findings each carry a citation.

---

## 8. The design's known soft spots (documented in its own docs)

Worth carrying into any adaptation, because these are structural, not bugs in one prompt:
1. `implement` has "no completion step": it ends at the commit, so tickets stay open and acceptance boxes unticked. On a dependency chain "nothing ever becomes visibly unblocked."
2. `code-review` runs before `implement`'s commit, so `git diff <point>...HEAD` cannot see the work. Commit first, then review.
3. Review inside the authoring session is biased; the two-axis split exists for this reason, but the loop has no convergence.
4. `implement-spec`'s review-and-fix loop has no stop rule after the fix subagent; second broad reviews are a known runaway.
5. Wayfinder's "plan, don't do" default can be overridden in a **Notes** block the agent itself writes, which later sessions read as permission.
6. `research` has no stopping criterion and can nest into a second background agent.
7. `to-spec`'s `ready-for-agent` label makes AFK pollers treat a spec as a work order; and the spec is not searched against the tracker, so it can duplicate existing work.
8. Specs go stale by design; the durable knowledge is supposed to land in `GLOSSARY.md` and ADRs, not back in the edited spec.

---

## 9. One-paragraph compression

An idea is interrogated in rounds until its design tree has no unsettled frontier; the durable words land in a glossary and the hard-to-reverse calls in ADRs. If the build is bigger than one window, the conversation is synthesised (no new questions) into a spec issue whose seams were agreed before a line was written, and the spec is cut into vertical, independently demoable tickets that publish blockers-first so a graph of "Blocked by" edges exists. Then either a human drives one ticket per fresh session through red-green at the agreed seams, commits, and reviews the diff against a fixed point on two separate axes; or one orchestrating session reads the same edges as a task graph, runs a fresh implementer subagent per frontier ticket in its own worktree, merges them onto an integration branch, and reviews once at the end. A retro then converts whatever went wrong into a check, a standard, a navigation pointer, or a tool, so the next run starts from a better environment. Everything in between (grilling, wayfinding, prototyping, research, triage, diagnosis) exists to make sure the agent is executing a decision someone actually made, at a seam someone actually agreed, with an artifact someone can point at.
