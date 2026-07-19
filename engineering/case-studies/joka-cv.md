# Joka CV engineering lessons

Joka CV became the first large implementation of the shared Joka Source
engineering contract. Its reusable contribution is not one framework choice;
it is a set of product, data, release, and agent-workflow patterns proven under
real compatibility and operational pressure.

The generalized public rules are in the
[product development playbook](../product-development-playbook.md).
This case study records how Joka CV informed them.

## Workflow inherited by future products

- GitHub code, issues, pull requests, and repository instructions are durable
  truth; chat memory is not.
- The root `AGENTS.md` is canonical and tool-neutral.
- Every task starts from a reproducible, secret-safe context check.
- User-facing work delivers a runnable slice before broad maintenance.
- Focused verification supports iteration; full verification is consolidated.
- Security, privacy, migration, and deployment changes receive immediate
  focused evidence.
- A runtime incident closes only after the original browser journey passes.

## Important failure shields

### Isolate development previews

Parallel previews require separate build directories, application ports,
realtime ports, and logs. Sharing mutable framework output caused reload loops,
false route failures, noisy authentication symptoms, and memory amplification.
Development service workers must not cache mutable development assets, and
route warming must stay bounded.

### Diagnose ownership before restarting

Resolve listener, PID, working directory, registered project, environment, and
release revision. Port numbers and healthy probes alone are insufficient. A
browser can be broken while a health endpoint remains green.

### Preserve forward compatibility

Existing-user audits include schema migrations, flags, legacy rows, active
sessions, browser databases, caches, service workers, and long-lived tabs.
Never resolve a browser database mismatch by deleting user data.

### Measure amplification

The largest performance improvements came from bounding query count as the
workspace grew, not from cosmetic rendering changes. High-cardinality fixtures
and query-budget tests exposed one-query-per-object history loading. Batching,
parallel reads, bulk transactions, connection reuse, and real hot-path indexes
made the product scale predictably.

### Keep overflow non-blocking

When a product constraint is exceeded, show the condition without unnecessarily
locking unrelated editing, organizing, reordering, or removal actions. A
constraint should block only the operation that would violate it.

### Treat realtime as a projection

Feedback collaboration writes durable events first. Realtime communication
notifies clients to reconcile authoritative state by stable event identity.
Disconnects, delayed broadcasts, reconnects, and duplicate delivery therefore
remain recoverable.

### Release exact revisions

The Joka CV release chain separates default-branch acceptance, staging proof,
explicit approval of one revision, and production promotion of that same
revision. Immutable release directories and an atomic active-release pointer
make application rollback bounded. Database compatibility still requires
expand/contract migrations.

### Account for long-lived clients

Clients can remain open across deployments. Stable deployment identifiers,
environment-specific action keys, non-cacheable release coordination, and hard
navigation for incompatible stale clients prevent old browser code from
submitting actions against a new server shape.

### Make privacy executable

Authenticated feedback derives actor identity server-side. Private assets use
randomized non-public storage, bounded parsing, integrity checks, authorization
on every retrieval, private cache controls, and retention. Observability uses
allowlisted, content-free fields and excludes user documents, filenames,
request bodies, credentials, and raw URLs.

### Design recovery as product behavior

An encrypted offline workspace remains locally editable, persists before
synchronization, and sends only pending encrypted state after reconnect. A
single-writer network lease does not disable offline editing. Conflicts require
explicit choice. Recovery keys, device trust, and escape paths are user
journeys, not hidden security implementation details.

### Import atomically and idempotently

Document imports reject unsafe input before mutation, bound parser resources,
use stable per-user identity, serialize concurrent attempts, and commit the
complete lifecycle transaction once. Multi-document products distinguish
content, versions, placement, snapshots, import identity, copy lineage, and
recoverable deletion.

## Internal evidence map

Authorized maintainers can trace these lessons to the Joka CV repository:

| Subject | Primary Joka CV evidence |
|---|---|
| Shared workflow | `AGENTS.md`, `docs/ENGINEERING_WORKFLOW.md`, `scripts/task-context.sh`, `scripts/verify-dev.sh` |
| Agent repair loop | `docs/AGENT_HARNESS.md`, `docs/observability/runbook.md` |
| Preview isolation incident | `docs/incidents/2026-07-16-review-session-reload-loop.md` |
| Performance budgets | `docs/capabilities/perceived-performance.md`, `tests/point-editor-query-budget.test.ts` |
| Exact-revision releases | `deploy/README.md`, `deploy/bin/deploy-release.sh`, `deploy/bin/approve-production.sh` |
| Private-data boundaries | `docs/SECURITY.md`, `docs/PRIVACY.md` |
| Encrypted local-first design | `docs/ADR/009-end-to-end-encrypted-cv-vault.md` |
| Multi-document lifecycle | `docs/ADR/011-multi-cv-point-lifecycle.md` |
| Engineering synthesis | `docs/textbook/joka-cv-engineering-textbook.md` |

The evidence map is intentionally path-based. Future maintainers should inspect
the current code and tests before copying a historical pattern; an ADR explains
a decision at a point in time and may have been superseded.

## Knowledge promotion rule

When Joka CV or another project finds a new reusable lesson:

1. keep implementation and proof in the project repository;
2. add the generalized rule to the shared private work contract;
3. publish a sanitized version here if it is useful to contributors;
4. add a test, template, or check that makes the rule executable;
5. identify and retire conflicting older guidance.
