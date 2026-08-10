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
| Cloudflare | Authoritative DNS, TLS, edge runtime, DNSSEC, observability | Founding Cell | active standard; resources onboard per domain |
| AWS | Project infrastructure funded through approved startup credits | Founding Cell | project-scoped; no shared root sessions |

## CI/CD

| Service | Purpose | Status |
|---------|---------|--------|
| GitHub Actions | Charter validation, markdown lint | active |
| GitHub Actions OIDC | Short-lived project cloud access | required for supported providers |

## Credential Authority

QM is the canonical authority for JSF credentials. Repositories, issues, pull requests, evidence bundles, and chat may contain only approved account aliases and non-secret resource identifiers. Provider tokens, passwords, OTPs, PINs, private keys, identity details, and recovery codes remain in protected QM or provider authentication surfaces.

GitHub environment secrets may deliver a narrowly scoped credential to CI only when workload identity is unavailable. They are delivery surfaces, not a second source of truth.

## Communication

| Platform | Handle | Purpose |
|----------|--------|---------|
| Discord | TODO | Community |
| TODO | TODO | TODO |

## Domain Registrar

See `ops/domains.md`.
