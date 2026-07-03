# Contributing to Joka Source Foundation

Thank you for your interest in contributing. JSF is built to outlive its founders — every contribution compounds institutional knowledge for future IIMC cohorts.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## How to Contribute

### 1. Find something to work on

- Browse open issues in the relevant project folder under [`projects/`](projects/).
- Check [`governance/DECISIONS.md`](governance/DECISIONS.md) for open decisions where input is welcome.
- For new project proposals, read the CRISPR cell lifecycle in [`constitution/v0.md`](constitution/v0.md) first.

### 2. Fork and branch

```bash
git clone https://github.com/Joka-Source/joka-source-foundation.git
cd joka-source-foundation
git checkout -b your-branch-name
```

Branch naming: `feat/`, `fix/`, `docs/`, `chore/` prefix + short kebab-case description.  
Example: `docs/update-joka-cv-charter`

### 3. Make your changes

- Keep changes focused and minimal — one logical change per PR.
- For new project cells: copy `projects/_template/` to `projects/{your-slug}/`, fill the front-matter and CHARTER.md, then open a PR.
- For constitution / governance changes: open a discussion issue first. These require founder approval per [`governance/voting-rules.md`](governance/voting-rules.md).

### 4. Sign off (DCO)

All commits must carry a Developer Certificate of Origin sign-off:

```bash
git commit -s -m "your commit message"
```

This adds `Signed-off-by: Your Name <your@email.com>` to the commit, certifying that you wrote or have rights to the contribution. See [developercertificate.org](https://developercertificate.org) for the full text.

A full CLA is only required for sub-projects that onboard outside corporate contributors. The founding cell will flag this when applicable.

### 5. Open a Pull Request

- Target branch: `main`
- Fill in the PR template.
- CI must pass before review. CI checks:
  - Markdown linting
  - Charter validator (for changes under `projects/**`)
- Request review from a founder or designated reviewer.

### 6. Review SLA

Founders aim to review PRs within 5 business days. If you haven't heard back in 7 days, ping on the issue thread.

## Git Workflow

- Commit messages: `<type>: <short description>` — types: `feat`, `fix`, `docs`, `chore`, `refactor`
- Squash merge is preferred for feature branches; rebase merge for doc-only branches.
- No force-push to `main`.

## Testing & CI

This is primarily a documentation and governance repository. CI checks:

- **Markdown lint** (`.github/workflows/lint.yml`) — all `.md` files
- **Charter validator** (`.github/workflows/archive-check.yml`) — PRs touching `projects/**` must pass front-matter and retirement-condition checks

Fix any CI failures before requesting review.

## Naming Conventions

- **Project slugs:** lowercase alphanumeric + hyphens. `joka-*` prefix reserved for JSF flagship projects. Slugs are never reused after archival.
- **Files:** lowercase kebab-case
- **YAML front-matter keys:** snake_case

## Questions?

Open an issue. For governance questions, mention a founder in the issue.
