# Decision Log

All significant decisions affecting JSF — licensing, governance, project spawns/retirements, infrastructure — are recorded here in ADR (Architecture Decision Record) style.

## Entry Template

```markdown
### ADR-NNN: Title

**Date:** YYYY-MM-DD
**Status:** Open | Decided | Superseded by ADR-NNN
**Deciders:** [names or roles]

**Context:** What was the situation that prompted this decision?

**Decision:** What was decided?

**Rationale:** Why this option over alternatives?

**Consequences:** What changes as a result? What becomes easier / harder?
```

---

## Open Decisions

### ADR-002: Default license

**Date:** 2026-07-01
**Status:** Open
**Deciders:** Founding Cell

**Context:** The root repository and all JSF sub-projects need a default open source license. Blueprint recommends Apache-2.0 (explicit patent grant, NOTICE file, clean IP provenance for alumni-contributed codebase). MIT is the simpler alternative.

**Decision:** TODO — founder to confirm Apache-2.0 vs MIT.

**Rationale pending.**

---

### ADR-003: Monorepo vs. polyrepo for sub-projects

**Date:** 2026-07-01
**Status:** Open
**Deciders:** Founding Cell

**Context:** Should Joka CV, AlumERP, and Joka Connect code live in this repo or in separate repos?

**Recommendation:** Hybrid — this wrapper stays a monorepo for governance/charter/docs; each sub-project gets its own code repo linked from `projects/{slug}/README.md`.

**Decision:** TODO — founder to confirm.

---

### ADR-004: Public vs. private during incubation

**Date:** 2026-07-01
**Status:** Open
**Deciders:** Founding Cell

**Recommendation:** Wrapper repo public from day one; sub-project code repos start private until v0.1.

**Decision:** TODO — founder to confirm.

---

### ADR-005: Cell retirement quorum

**Date:** 2026-07-01
**Status:** Open
**Deciders:** Founding Cell

**Recommendation:** 2-of-2 founders during founding period; majority-of-board once a board exists.

**Decision:** TODO — see `governance/voting-rules.md`.

---

## Closed Decisions

### ADR-001: GitHub org name

**Date:** 2026-07-01
**Status:** Decided
**Deciders:** Founding Cell (Krishna Chaudhari)

**Context:** JSF needed a GitHub org to host the wrapper repo and sub-project repos.

**Decision:** `Joka-Source` — <https://github.com/Joka-Source>

**Rationale:** Short, matches "Joka Source Foundation" without the trailing word. Org created and available.

**Consequences:** All repo URLs will be `github.com/Joka-Source/*`. This slug is hard to change once links propagate.
