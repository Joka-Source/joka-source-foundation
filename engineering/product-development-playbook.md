# Product development playbook

This public playbook distills reusable engineering practices first exercised
at product scale in Joka CV. It is a starting contract for future Joka Source
products, not a substitute for a product's own architecture and runbooks.

## Durable source of truth

Use this hierarchy:

1. accepted code, tests, ADRs, and committed documentation;
2. the active GitHub issue and pull request;
3. shared engineering practices and project records;
4. local chat history and agent memory.

An issue defines the outcome, acceptance criteria, boundaries, and human-only
gates. A pull request records implementation, risk, verification, recovery,
and remaining work. If another person or agent needs a fact, move it out of
chat before handoff.

Keep one canonical, tool-neutral `AGENTS.md`. Tool-specific files should import
or point to it instead of maintaining competing workflows.

## Visible delivery and verification cadence

For user-facing work, deliver the smallest safe, runnable, visible slice first.
Do only the setup and hardening needed to run that slice safely. After it is
visible:

- use focused tests while iterating;
- keep required CI as the merge gate;
- consolidate the full local suite once per active development period instead
  of repeating it after every small change;
- immediately verify authentication, authorization, privacy, migration,
  data-integrity, recovery, and deployment changes.

Never weaken a safety gate to obtain a preview. Equally, do not hide an honest
local preview merely because a later production gate is still pending.

## Evidence-first debugging

Use this diagnostic order:

1. Identify the authoritative state: database record, append-only event,
   encrypted local workspace, deployment metadata, or exact release revision.
2. Separate authentication from authorization.
3. Separate durable state from its cache, broadcast, realtime, or UI
   projection.
4. Resolve the process, port, environment, and worktree that own the behavior.
5. Reproduce through the real user journey.
6. Correlate browser evidence, logs, metrics, traces, and the deployed revision.
7. Apply a bounded, reversible repair.
8. Rerun the same failing journey.
9. Record evidence or escalate without claiming success.

Common traps:

- a healthy endpoint does not disprove a browser failure;
- an old ADR is historical evidence, not necessarily current behavior;
- a later deployment does not prove an earlier issue shipped;
- green unit tests do not prove browser journeys, DNS, email delivery,
  realtime, backup restore, or recovery;
- a familiar port number does not identify the owning process.

## Durable state and realtime projections

Treat collaborative and event-driven products as durable systems with
realtime projections, not shared browser arrays.

- Commit the durable write first.
- Broadcast an authenticated notification, not the only copy of state.
- Let reconnecting clients reload authoritative state.
- Reconcile by stable event or revision identity.
- Make duplicate delivery harmless.
- Test delayed broadcasts, disconnects, restarts, and concurrent transitions.

This structure makes a lost notification recoverable. A design in which the
broadcast itself is the source of truth does not.

## Performance and query shape

Measure request and query amplification before changing rendering.

- Add query-budget tests with high-cardinality fixtures.
- Batch immutable histories instead of querying once per object.
- Parallelize independent reads.
- Use one transactional bulk action for multi-select operations.
- Reuse one browser-database connection and group related reads in one
  transaction.
- Add indexes for observed owner, order, and history hot paths.
- Stream genuinely independent slow panels.
- Preserve immediate interaction feedback and layout-stable loading states.
- Measure click response and warm-route latency, not only server duration.
- Keep telemetry labels fixed and allowlisted; never attach dynamic URLs,
  identifiers, or user content.

A growing-workspace test should prove that query count remains bounded as the
number of user objects increases.

## Security and private assets

- Authenticate at the framework edge and authorize ownership, role, lifecycle
  state, and target coherence inside the server boundary.
- Treat every client-supplied identifier as hostile.
- Derive actor identity on the server instead of accepting an email or user ID
  from the client.
- Use guarded database transitions for race-sensitive state.
- Store private files outside the public web root under randomized keys.
- Reauthorize every private-file request and return private, non-cacheable
  responses.
- Validate size, count, declared type, container signature, parser workload,
  and retention.
- Keep operational analytics typed, bounded, and free of user content.
- Treat screenshot or copy discouragement as defense in depth, never DRM.

Do not log credentials, cookies, authorization headers, magic links, user
documents, uploads, filenames, request bodies, raw URLs, or environment dumps.

## Local-first encrypted workspaces

For an offline-capable encrypted product:

- make encrypted local storage the immediate source of truth after unlock;
- persist every edit locally before synchronization;
- coalesce pending synchronization around the latest encrypted snapshot;
- send only pending state after reconnect;
- use revision-conditional writes to prevent silent overwrite;
- use a short lease for network synchronization, not to disable offline edits;
- require explicit conflict choice rather than inventing automatic merge;
- clear account-scoped rendered caches when the account changes;
- keep recovery and device trust as first-class product journeys.

Never fix browser-database compatibility by deleting user data. Open newer
databases forward-compatibly and prove that old and new clients fail safely.

## Import and data lifecycle

Import untrusted documents fail-closed:

- parse locally when raw upload is unnecessary;
- reject empty, oversized, malformed, encrypted, scanned, or unsupported input
  before mutation;
- bound parser time and always release parser resources;
- keep pre-auth import tab-bound, retryable, and per-document;
- delete temporary state only after durable success;
- use stable document identity and per-user idempotency;
- serialize competing imports;
- apply the complete durable change in one transaction.

For multi-document systems, keep these identities separate:

- reusable content;
- immutable content versions;
- document-local placement;
- document snapshots;
- import identity;
- copy lineage;
- recoverable deletion.

## Release and existing-user safety

Use an exact-revision chain:

```text
feature branch
  -> PR, CI, and human review
  -> default branch
  -> exact-revision staging deployment
  -> staging browser, security, and recovery proof
  -> explicit approval of that revision
  -> protected production promotion
  -> live verification of the same revision
```

A deployment should lock the environment, verify ancestry, build an immutable
release, validate configuration, back up before migration, apply migrations,
atomically switch the active release, restart, poll readiness, and record
status. Application rollback and database rollback are separate; use
expand/contract migrations.

Before claiming a returning-user release safe, inspect:

- migrations and compatibility windows;
- feature flags and fallback behavior;
- legacy rows and ownership assumptions;
- active sessions and long-lived tabs;
- browser storage and service workers;
- stale client/server action behavior;
- the actual deployed revision in every environment.

## Observability and bounded repair

The operational loop is:

```text
observe -> diagnose -> allowlisted action -> restart -> same journey -> close or escalate
```

Keep repair budgets finite. Store append-only incident evidence with strict
redaction. An automated agent may propose or apply only reviewed, reversible
actions; it may not turn an unreachable host or missing evidence into success.

Use independent signals:

- public reachability;
- application readiness;
- structured logs;
- metrics and alerts;
- traces;
- synthetic browser journeys;
- backup and restore drills.

## Test portfolio

Build contracts at several levels:

- pure policy and model tests;
- database integration and race tests;
- security regression tests;
- distributed-state and reconciliation tests;
- measured visual-contract tests;
- deployment shell-contract tests;
- real browser journeys;
- staging operational proof;
- restore drills.

Report unit-suite health and browser-journey health separately. A minimum
product gate should cover a deterministic create/import, edit, save, reload,
recovery, role-authentication, concurrent-user flow, service restart/reconnect,
and synthetic production read/write/readback where appropriate.

## Agent task shape

High-quality implementation tasks specify:

- one concrete outcome;
- architecture and technology context;
- non-negotiable constraints;
- exact owned files or surfaces;
- consumed and produced interfaces;
- a failing contract first where practical;
- the smallest implementation;
- focused verification;
- explicit commit boundary;
- final review against every requirement.

Agents propose work. CI, review, environment evidence, and authorized release
decisions determine whether the product actually changed.
