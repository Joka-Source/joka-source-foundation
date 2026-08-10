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

QM is the canonical JSF credential authority. Provider-native authentication and workload identity may consume credentials under QM custody, but they do not become independent credential records.

All secrets must be stored in the approved manager. No secrets in:
- Git repository (any branch)
- Issue comments or PR descriptions
- Slack / Discord
- Email
- `.env` files committed to version control

Allowed repository values are public account aliases, public endpoints, and non-secret resource IDs needed for audit and reproducibility. Redacted evidence must be reviewed before publication.

For CI/CD, prefer short-lived workload identity such as GitHub Actions OIDC. If a provider requires a stored CI secret, scope it to one environment and purpose, keep it in a protected GitHub environment, and retain its authoritative custody record in QM.

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

Review access quarterly and after every personnel, provider, or production-ownership change. Audit account recovery ownership, MFA, active service identities, GitHub environments, provider roles, and the corresponding QM custody entries without exporting credential values.

## Incident Response

If a secret is suspected to be compromised:
1. Rotate it immediately
2. Notify the founding cell
3. Document the incident in `governance/meeting-notes/`
4. Determine root cause and update this policy if needed
