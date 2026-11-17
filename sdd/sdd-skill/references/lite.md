# Lite playbook (one ticket, one session)

Use `lite` when the change is provably one vertical slice: one behaviour, roughly one file or module, verifiable in a single session. When in doubt, use `standard`.

## Six steps, ~6 tool calls

1. **Scaffold** (one call):
   `python scripts/sdd.py init --slug <slug> --name "<title>" --mode lite`
   Creates `tickets/01-<slug>.md` (spec inline), `evidence.md`, and the gitignore entries.

2. **Fill the spec** inside the ticket: problem, solution, decisions (with alternatives and reversibility), the seam, out of scope, acceptance criteria as commands. Keep it under 25 lines.

3. **Red** (one call):
   `python scripts/sdd.py run --slug <slug> --ticket 01 --criterion "baseline fails" --label red -- <test command>`
   Expect exit 1. If it exits 0, the test is wrong.

4. **Implement**, then **green** (one call): same command with `--label green`. Expect exit 0.

5. **Discriminate** when the ticket fixes a bug or guards a regression: mutate or revert the fix, run again, expect failure, restore. The ledger keeps both rows. New features may skip this and say so in review.

6. **Check and review**:
   `python scripts/sdd.py check --slug <slug>` must print all PASS.
   Review the diff in three separate passes (Standards, Spec, Proof). For one small change, one agent may do three passes; the axes stay separate and are reported separately. Write `review.md` with one verdict line.

Close with `review.md` + `retro.md` (one line each is fine for lite), commit, and report: ticket, command that proved it, verdict.

## What lite must not skip

- evidence rows that name the command and the observed result
- the red run, or a dated waiver saying why it could not exist
- a verdict line
- the destructive-action gate, if the change touches data

## What lite may skip

- separate `brief.md` and `spec.md` files (they collapse into the ticket)
- multi-ticket DAG and frontier
- parallel implementers
- a formal decision record (inline in the ticket is enough)
