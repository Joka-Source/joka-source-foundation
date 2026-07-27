# Repository guide

<!-- JOKA-CODEX-EVENTS:START -->
## Canonical Codex handoff

**This is the canonical handoff for everyone working in Joka Source Foundation. Do not ignore it.**

### What this repository is

The public governance, contribution, project-cell, brand, and institutional-memory repository for open-source work serving IIM Calcutta.

### Why it exists

It lets each graduating cohort inherit and improve maintainable public projects instead of losing knowledge when individual founders leave.

### The simple way to make a change

1. Open this repository in Codex and start one Worktree task for one outcome.
2. Describe the visible result you want in ordinary language. You do not need Git commands.
3. Let Codex inspect the repository rules, make the change, and run the relevant checks.
4. Review the preview, screenshots, or other evidence Codex gives you. Ask for corrections in the same task.
5. When the result is right, tell Codex to propose it. Codex must create the event record and a reviewable change; it must not silently publish production.
6. A named reviewer approves the proposal. Production changes require separate, explicit production approval and exact deployed-revision evidence.

The repository's existing README and technical files remain reference material. This page is the only onboarding path a non-technical teammate needs to begin safely.

### Development event record

- Use one Codex Worktree chat for each independent change.
- Never copy a raw chat transcript, secret, credential, token, cookie, private key, production value, or private user content into the repository.
- Codex lifecycle hooks retain only bounded redacted request excerpts, prompt hashes, tool names, and repository paths outside tracked source.
- Before every commit, stage the complete intended change and run:

  `sh .codex/events/run-node.sh record --summary "What changed and why" --verification "PASS — command or evidence"`

- Repeat `--verification` for each material check. Use `NOT_RUN — reason` only when no executable verification applies. Failed verification may not be committed.
- `events.md` is append-only. The pre-commit hook rejects a missing, malformed, mismatched, secret-bearing, or failed event. The commit-message hook binds the event ID to the commit.
- Preview approval is not production approval. Record the named production authorization and exact deployed revision separately.
<!-- JOKA-CODEX-EVENTS:END -->
