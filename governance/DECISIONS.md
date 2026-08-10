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

### ADR-006: Cloudflare production and credential custody standard

**Date:** 2026-08-10
**Status:** Decided
**Deciders:** Founding Cell

**Context:** JSF projects need one auditable way to own domains, publish edge applications, promote exact artifacts, recover from failed releases, and keep credentials out of public repositories.

**Decision:** Cloudflare full-zone DNS, Worker versions, TLS, edge policy, observability, and DNSSEC are the production default. QM is the canonical credential authority. Preview and production must use the same immutable version, and every domain must retain registrar and application rollback evidence.

**Rationale:** One organization-owned edge control plane reduces fragmented custody while exact-artifact promotion, independent public verification, staged DNSSEC, and explicit rollback keep migrations reversible.

**Consequences:** Projects must satisfy [`ops/cloudflare-standard.json`](../ops/cloudflare-standard.json), validate their domain contract, and preserve redacted evidence. Exceptions require an owned, expiring decision record. Registrar identity and delegation steps remain human-controlled boundaries.

### ADR-001: GitHub org name

**Date:** 2026-07-01
**Status:** Decided
**Deciders:** Founding Cell (Krishna Chaudhari)

**Context:** JSF needed a GitHub org to host the wrapper repo and sub-project repos.

**Decision:** `Joka-Source` — <https://github.com/Joka-Source>

**Rationale:** Short, matches "Joka Source Foundation" without the trailing word. Org created and available.

**Consequences:** All repo URLs will be `github.com/Joka-Source/*`. This slug is hard to change once links propagate.
