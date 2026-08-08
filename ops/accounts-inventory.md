# Accounts Inventory

> Inventory of all official JSF accounts, services, and infrastructure. No actual secrets or credentials here — see `ops/secrets-policy.md` for where credentials live.

## GitHub

| Resource | Value |
|----------|-------|
| Org | <https://github.com/Joka-Source> |
| Org owner | Krishna Chaudhari (TrueKrishna) |
| 2FA required | Yes |

## Hosting / Cloud

| Service | Purpose | Owner | Status |
|---------|---------|-------|--------|
| TODO | TODO | TODO | pending |

## CI/CD

| Service | Purpose | Status |
|---------|---------|--------|
| GitHub Actions | Charter validation, markdown lint | active |

## Secrets Manager

TODO: Define which service holds production secrets (e.g. GitHub Secrets, Doppler, Vault).

## Communication

| Platform | Handle | Purpose |
|----------|--------|---------|
| Discord | TODO | Community |
| TODO | TODO | TODO |

## Public Email Addresses

Public role addresses use Cloudflare Email Routing for inbound delivery. The private destination,
credentials, recovery methods, and forwarding rules are maintained outside this public repository.
An address is `live` only after a dated external delivery test; provider configuration alone is
`configured`.

| Address | Purpose | Status |
|---------|---------|--------|
| `hello@jokasource.org` | General contact | live — accepted 2026-07-13 |
| `security@jokasource.org` | Responsible security reports | configured — acceptance test due |
| `privacy@jokasource.org` | Privacy and data-subject requests | configured — acceptance test due |
| `postmaster@jokasource.org` | Delivery administration | configured — acceptance test due |
| `noreply@jokasource.org` | Transactional sender and bounce/reply capture | configured — acceptance test due |
| `support@jokasource.org` | Product and foundation support | configured — acceptance test due |
| `abuse@jokasource.org` | Abuse and platform-safety reports | configured — acceptance test due |
| `billing@jokasource.org` | Billing and vendor correspondence | configured — acceptance test due |

The private Joka Source mail-transport playbook owns routing, custody, sender authorization, and
quarterly verification. This public inventory intentionally contains no forwarding destination or
credential details.

## Domain Registrar

See `ops/domains.md`.
