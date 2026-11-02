"""HES P0/P1/P2/P3 reference prototype.

P0: efficiency ledger and vector.
P1: team necessity gate and minimal team compiler.
P2: deterministic GraphRun/TeamRun, Context Bus, Handoff, Coordination Budget.
P3: TeamBench subset, hidden tests, real Codex Agent execution.

P0-P2 are deterministic and dependency-free. P3 shells out to the installed
Codex CLI and requires a working model/quota.
"""

__version__ = "0.3.0"
