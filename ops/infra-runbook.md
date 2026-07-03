# Infrastructure Runbook

> Operational procedures for JSF infrastructure. Covers bootstrap, deployment, and incident response.

## Bootstrap (New Environment)

TODO: Step-by-step instructions for setting up the JSF GitHub org, CI, and initial project infrastructure from scratch.

## Deployment

TODO: How projects under the JSF org are deployed. Default: each sub-project owns its own deployment process; this runbook covers the org-wrapper repo only.

### Org-Wrapper Repo
- This repo is documentation only — no deployment step
- CI validates markdown and charter files on every PR
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
