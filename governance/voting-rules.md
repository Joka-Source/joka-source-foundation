# Voting Rules

Defines quorum and process for decisions that require a formal vote.

## Current Period: Founding (Cell 0 only)

During the founding period (until a formal board is constituted), all votes require **both founders** (Krishna Chaudhari and Satyam Anand) to agree. This period ends when:

- TODO: define trigger (e.g. "three or more non-founder committers active for 6+ months", or "formal board constituted")

## Decision Types and Quorum

| Decision | Required Quorum | Veto Rights |
|----------|----------------|-------------|
| New project cell spawn | Founding Cell unanimous | Either founder |
| Cell retirement | Founding Cell unanimous | Either founder |
| Constitutional amendment | Founding Cell unanimous | Either founder |
| License change (root or sub-project) | Founding Cell unanimous | Either founder |
| Advisor appointment | Founding Cell majority | — |
| Merger / archival of this repo | Founding Cell unanimous | Either founder |

## Post-Founding Period (placeholder)

TODO: Define board composition, quorum percentages, and transition trigger. Recommendation from blueprint:
- Transition to majority-of-board once the board exists
- Document the transition trigger explicitly so it isn't a judgment call when a founder departs

## Voting Process

1. Proposal raised as an issue (labelled `vote-required`)
2. 14-day comment period for non-binding input
3. Founders vote in the issue thread (explicit `+1` / `-1` with rationale for `-1`)
4. Result recorded in `governance/DECISIONS.md` within 3 business days of vote close
5. PR implementing the decision references the ADR number

## Cell Retirement Quorum (CRISPR model)

A project cell may be retired when **any of** the following hold:
- Its explicitly stated `retirement_condition` in `CHARTER.md` is met, AND founding cell approves
- Founding cell unanimous vote (overrides stated retirement condition only for cause)

After retirement vote:
- `projects/{slug}/` → `archive/{slug}-{year}/`
- `RETROSPECTIVE.md` filed
- `archive/retired-cells.md` updated
- Slug permanently burned (never reused)
