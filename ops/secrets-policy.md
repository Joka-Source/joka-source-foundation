# Secrets Policy

> This document describes HOW secrets are stored, rotated, and audited. No actual secrets or credentials here.

## What Is a Secret

- API keys, tokens, passwords
- OAuth client secrets
- Private signing keys
- Database connection strings

## What Is NOT a Secret

- Public API endpoints
- Public domain names
- Public GitHub org names
- This document

## Storage

TODO: Define the approved secrets manager (e.g. GitHub Secrets for CI, Doppler for application secrets, Bitwarden for shared team credentials).

All secrets must be stored in the approved manager. No secrets in:
- Git repository (any branch)
- Issue comments or PR descriptions
- Slack / Discord
- Email
- `.env` files committed to version control

## Rotation Policy

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| CI/CD tokens | Every 90 days |
| API keys (third-party) | Every 6 months or on personnel change |
| Shared passwords | On personnel change |

## Access Control

- Principle of least privilege: only the people / services that need a secret get it
- Shared credentials are only used when individual accounts are not possible
- Personnel offboarding: revoke all access within 24 hours

## Audit

TODO: Define audit cadence (recommendation: quarterly review of who has access to what).

## Incident Response

If a secret is suspected to be compromised:
1. Rotate it immediately
2. Notify the founding cell
3. Document the incident in `governance/meeting-notes/`
4. Determine root cause and update this policy if needed
