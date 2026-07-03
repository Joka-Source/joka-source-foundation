# JSF Repo Contribution Policy

This document governs contributions to the `joka-source-foundation` org-wrapper repository specifically. For contributing to individual project code repos, see each project's `CHARTER.md` and `CONTRIBUTING.md`.

## What Lives Here

This repo is governance, brand, and documentation — not deployable code. Changes here affect all JSF projects and the organization's public face.

## Proposal Process

### Minor changes (typos, factual corrections, formatting)
- Open a PR directly. No issue required.
- One founder approval needed to merge.

### Significant changes (new sections, policy updates, roster additions)
- Open an issue first, describe the proposed change and motivation.
- Allow 5 business days for comment from founders and active contributors.
- Then open a PR referencing the issue.
- Two founder approvals (or one founder + one active committer) needed to merge.

### Constitutional or governance changes
- Open an issue labelled `governance`.
- Mandatory 14-day comment window.
- Decision recorded in `governance/DECISIONS.md` before PR is opened.
- Ratification per `governance/voting-rules.md`.

### New project cell spawn
- Copy `projects/_template/` to `projects/{your-slug}/`
- Fill all YAML front-matter fields in `README.md` (including `retirement_condition`)
- Fill `CHARTER.md` section headings
- Open a PR — CI charter validator will check required fields
- Founder approval required

## Review SLA

- Founders aim to review within 5 business days
- If no response in 7 days, ping on the issue thread

## Merge Rights

- **Founders:** merge rights on all files
- **Committers:** merge rights within their designated project cell folder only
- **No self-merge:** all PRs require at least one external approval

## Naming Conventions

See `CONTRIBUTING.md` (root) for file naming and branch naming conventions.
