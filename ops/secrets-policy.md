# Secrets policy

This public document defines the handling contract. It contains no secret
names, private repository paths, credentials, or production topology.

## Trust zones

1. **Public Foundation repository:** policy and contributor-safe guidance only.
   It stores neither plaintext nor ciphertext secrets.
2. **Private firm core:** ownership, consumer, environment, rotation, and
   approved-location references. It stores no plaintext secret values.
3. **Private production operations:** complete inventory and eligible
   SOPS/age ciphertext, protected by explicit access controls and review.
4. **Runtime backends:** the narrowest production host, GitHub environment, or
   approved secret manager that actually needs the value.

A private Git repository is not by itself a secret manager. Keep the age
identity on the production host, never in the repository it decrypts.

## What is a secret

- API keys, access tokens, passwords, and database connection strings;
- OAuth client secrets and signing keys;
- backup, tunnel, webhook, and deployment credentials;
- recovery codes and private encryption identities;
- authenticated browser or application sessions.

Public endpoints, public recipient keys, secret identifiers, and rotation
procedures are not secret values, although internal inventory can still be
access-controlled.

## Storage rules

- Never commit plaintext `.env` files, keys, credentials, or recovery material.
- Eligible long-lived service values may be committed only as reviewed
  SOPS/age ciphertext in the approved private operations repository.
- Keep age private identities, device-bound keys, personal sessions, passkey
  material, private user data, and production databases outside Git.
- Protect necessary local plaintext with owner-only permissions and the
  shortest practical lifetime.
- Prefer short-lived workload identity over copied long-lived tokens.
- Use GitHub organization, repository, or environment secrets only for the
  workflows and repositories that need them. Environment-specific values
  should use environment access and approval controls.

## Access and recovery

- Grant least privilege to individual identities; avoid shared accounts.
- Keep one protected recovery copy of the production age identity outside both
  the ciphertext repository and the production host it protects.
- Offboarding revokes access and rotates affected shared credentials promptly.
- Never download broad secret sets merely to make development convenient.

## Rotation and incidents

Rotate a secret when:

- it may have entered Git, chat, logs, email, an issue, or an unauthorized
  machine;
- access changes materially;
- its provider or policy requires rotation;
- its scope is reduced or a workload identity replaces it.

If exposure is suspected:

1. revoke or rotate the value;
2. identify every consumer and runtime copy;
3. update ciphertext and native runtime backends;
4. verify install, readback, and service health;
5. record a value-free incident and the preventive control added.

Deleting a leaked value from the latest Git commit is not remediation; history
and clones may retain it.

## Migration definition of done

A credential is centralized only when:

- its owner, consumers, environments, and runtime locations are inventoried;
- its eligibility for ciphertext escrow is decided;
- local and runtime permissions are correct;
- any plausibly exposed value is rotated;
- ciphertext decrypts through an approved recovery path;
- installation and service health are verified;
- no plaintext copy was added to Git, issues, logs, or prompts.

## References

- [SOPS](https://github.com/getsops/sops)
- [age](https://github.com/FiloSottile/age)
- [GitHub Actions secrets](https://docs.github.com/en/actions/reference/security/secrets)
