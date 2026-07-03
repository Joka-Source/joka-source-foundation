# Social Media Handle Registry

Canonical list of all JSF social accounts. This is the single source of truth — if it's not here, it's not an official JSF account.

## Account List

| Platform | Handle | URL | Custodian | Established | Status |
|----------|--------|-----|-----------|-------------|--------|
| GitHub Org | `Joka-Source` | https://github.com/Joka-Source | Founding cell | 2026-07-01 | live |
| LinkedIn | `joka-source-foundation` | TODO once registered | Founding cell | TODO | to register |
| Twitter/X | `@jokasource` (fallback `@jokasourcefdn`) | TODO once registered | Founding cell | TODO | to register — check availability first |
| Instagram | `@jokasource` (fallback `@joka.source`) | TODO once registered | Founding cell | TODO | to register |
| YouTube | `@jokasource` | TODO once registered | Founding cell | TODO | to register — hold until there's a recorded demo worth posting |
| Substack | `jokasource.substack.com` | TODO once registered | Founding cell | TODO | to register |
| Discord | TODO | TODO | TODO | TODO | pending — deferred until community size warrants it |

Where the primary handle `jokasource` is unavailable on a given platform, use `jokasourcefdn` consistently rather than mixing conventions per platform.

## Access Policy

- All account credentials are managed via the secrets manager documented in `ops/accounts-inventory.md`
- No individual holds sole access to any official account
- Two-factor authentication required on all accounts
- Custodian changes require a PR to this file with founding cell approval

## Posting Authority

| Account | Who Can Post |
|---------|-------------|
| All accounts | Founding cell members |
| Sub-project accounts | Cell lead + founding cell approval |

## TODO

- Register all handles above (check availability and trademark before committing)
- Set up password manager / secrets policy (see `ops/secrets-policy.md`)
- Per-channel playbooks are drafted — see `instagram-playbook.md`, `linkedin-playbook.md`, `twitter-playbook.md`, `discord-playbook.md`
