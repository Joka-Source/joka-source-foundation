# Domains

> All domains owned or operated by JSF.

## Registry

| Domain | Purpose | Registrar | Expiry | DNS Manager | Status |
|--------|---------|-----------|--------|-------------|--------|
| `jjty.in` | JJTY public product | GoDaddy | 2031-08-03 | Cloudflare | cutover pending registrar KYC and live verification |

## Naming Convention

- `jokasource.org` (or .in) — primary foundation domain (TODO: register)
- `jokacv.in` — Joka CV product (TODO: register)
- `alumerp.in` — AlumERP product (TODO: register)
- `jokaconnect.in` — Joka Connect product (TODO: register)

## Renewal Policy

All domains must be renewed at least 60 days before expiry. The responsible founder receives renewal reminders from the registrar. Expiry of a domain is treated as a critical incident.

## DNS Management

Cloudflare full-zone setup is the JSF production default. Each domain keeps registration and renewal at its registrar while Cloudflare owns authoritative DNS, TLS, edge policy, and DNSSEC. The machine-readable policy is [`cloudflare-standard.json`](cloudflare-standard.json).

Before a delegation change, preserve the existing zone, registrar nameservers, parent DS state, independent rollback origin, and exact release evidence. Remove any stale parent DS record before changing nameservers. Enable Cloudflare DNSSEC and install the new DS only after the unsigned delegation is stable through the parent and two independent recursive resolvers.

A domain is not `active` merely because a dashboard accepts it. Closure requires public apex and `www` TLS, canonical redirects, exact content and assets, required security headers, DNSSEC validation, immutable preview-to-production version equality, a healthy rollback target, and redacted evidence committed to the owning project repository.
