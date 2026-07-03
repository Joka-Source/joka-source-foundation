# Joka Source Foundation

> Open source, for IIM Calcutta. Built to outlive us.

Joka Source Foundation (JSF) is the umbrella organization for open source software built for — and maintained by — the IIM Calcutta community. Projects here are designed to survive their founders: the code, governance, and institutional memory all live here so that graduating students hand the baton, not a graveyard.

JSF is modelled on the CRISPR cell lifecycle (see [`constitution/v0.md`](constitution/v0.md)): small autonomous project cells spawn, contribute to the institution, and are either maintained or gracefully retired — with knowledge carried forward.

---

## Mission & Vision

**Mission:** Build software for IIM Calcutta that outlives its founders and serves every cohort that follows.

**Vision:** A self-sustaining open source foundation where each graduating batch contributes, inherits, and improves — compounding institutional knowledge over decades.

---

## Current Projects

| Project | Status | Description | Repo |
|---------|--------|-------------|------|
| **Joka CV** | `incubating` | Alumni CV and hiring product | [projects/joka-cv](projects/joka-cv/README.md) |
| **AlumERP** | `incubating` | Full alumni ERP — the parent platform | [projects/alumerp](projects/alumerp/README.md) |
| **Joka Connect** | `incubating` | Internal LinkedIn / alumni network & community | [projects/joka-connect](projects/joka-connect/README.md) |

---

## Getting Involved

1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) — contributor workflow, PR process, CLA/DCO.
2. Read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — community standards.
3. Pick a project in [`projects/`](projects/) and open an issue or PR.
4. Graduating IIMC students: contributor → committer → cell governance (see [`constitution/v0.md`](constitution/v0.md)).

---

## Governance

JSF is governed by its founding constitution and the CRISPR cell lifecycle model.

- **Constitution:** [`constitution/v0.md`](constitution/v0.md)
- **Decision log:** [`governance/DECISIONS.md`](governance/DECISIONS.md)
- **Contribution policy:** [`governance/CONTRIBUTION.md`](governance/CONTRIBUTION.md)
- **Voting rules:** [`governance/voting-rules.md`](governance/voting-rules.md)
- **Meeting notes:** [`governance/meeting-notes/`](governance/meeting-notes/)

---

## Contact

| Founder | Role | LinkedIn |
|---------|------|----------|
| Krishna Chaudhari | Co-founder | [linkedin.com/in/truekrishna](https://www.linkedin.com/in/truekrishna/) |
| Satyam Anand | Co-founder | [linkedin.com/in/chrometraum](https://www.linkedin.com/in/chrometraum/) |

For general inquiries, open an issue in this repository.

---

## Repository Structure

```
joka-source-foundation/
├── constitution/     — founding bylaws, CRISPR model, amendments
├── roster/           — member schema and founder/advisor records
├── projects/         — one folder per project cell (+ _template for new ones)
├── brand/            — logos, palette, typography, voice & tone
├── socials/          — handle registry, playbooks, content calendar
├── content/          — announcements, blog posts, talks
├── governance/       — decisions log, meeting notes, contribution policy
├── legal/            — entity status, IP assignment, MoUs
├── ops/              — accounts inventory, domains, secrets policy
├── archive/          — retired project cells (final state + retrospective)
├── tools/            — project scaffold script, charter linter
└── .github/          — issue templates, CI workflows, CODEOWNERS
```

See [`constitution/v0.md`](constitution/v0.md) for how new project cells are added and retired.
