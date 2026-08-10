# Infrastructure Runbook

> Operational procedures for JSF infrastructure. Covers bootstrap, deployment, and incident response.

## Bootstrap (New Environment)

1. Name the owning project cell, production repository, registrar owner, and rollback owner.
2. Create or adopt the provider account under the `JSF Cloudflare` alias and QM custody. Require MFA and recovery ownership before production use.
3. Create a project contract containing content and deployment SHAs, artifact digests, pending provider IDs, the preserved zone, and rollback targets.
4. Build from a clean worktree. Prove two consecutive builds produce the same Worker digest.
5. Upload one immutable Worker version, verify its preview URL, and record the version ID.
6. Create the Cloudflare full zone and import preserved records. Do not change registrar delegation yet.
7. Validate the project contract with `tools/validate-cloudflare-standard.py` before and after live values replace pending fields.

## Deployment

Projects own their build and deployment code. Production promotion follows [`cloudflare-standard.json`](cloudflare-standard.json): preview and production use the same immutable version ID, every live value is reconciled with the reviewed contract, and no rebuild occurs between preview and production.

### Cloudflare Production Cutover

1. Confirm registrar restrictions are clear and inventory the parent DS record.
2. If an old DS exists, remove it and wait for expiry before nameserver mutation.
3. Configure and verify both Worker custom domains in the active Cloudflare zone.
4. Replace registrar nameservers with exactly the two assigned Cloudflare nameservers.
5. Verify unsigned parent delegation, two recursive resolvers, apex and `www` TLS, redirects, content, assets, headers, and version alignment.
6. Enable Cloudflare DNSSEC, install the new DS at the registrar, and verify the chain through both resolvers.
7. Exercise the previous Worker version and restore the approved version. Keep the independent migration origin healthy until the drill passes.

Never put tokens, OTPs, PINs, identity data, or private recovery material in evidence. Use a protected authenticated read session and commit only redacted observations.

### Org-Wrapper Repo

- This repo is documentation only — no deployment step
- CI validates markdown and charter files on every PR
- CI validates the machine-readable Cloudflare standard and validator tests
- Merges to `main` are the "deployment"

## Incident Response Outline

TODO: Define severity levels and response steps.

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P0 | Data breach or security incident | Immediately |
| P1 | Service down for >10% of users | Within 1 hour |
| P2 | Degraded performance or partial outage | Within 4 hours |
| P3 | Non-critical issues | Next business day |

**P0/P1 response:**

1. Notify founding cell immediately
2. Assess and contain
3. Communicate to affected users
4. Post-incident review within 48 hours
5. Update this runbook with lessons learned

For DNS, TLS, or edge-release incidents, first deploy the last known-good immutable Worker version. If the zone or delegation itself is unhealthy during initial migration, restore the recorded registrar nameservers and independent origin. Never enable, remove, or replace a DS record while delegation ownership is uncertain.
