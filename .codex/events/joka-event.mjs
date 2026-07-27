#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { appendFile, chmod, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const EVENT_VERSION = 1;
const EVENT_MARKER = "<!-- joka-event\n";
const EVENTS_HEADER = `# Development events

This is the canonical, append-only, privacy-safe record of work proposed and performed through Codex.
It records attributable summaries, changed files, verification, approvals, and releases. Raw chat
transcripts, credentials, tokens, private keys, cookies, production data, and personal content never
belong here.

<!-- joka-events:v1 -->
`;

const SECRET_PATTERNS = [
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i },
  { name: "GitHub token", pattern: /\bgh[opusr]_[A-Za-z0-9_]{20,}\b/ },
  { name: "OpenAI key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "bearer token", pattern: /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}={0,2}\b/i },
  { name: "password assignment", pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*[^\s]{8,}/i },
  { name: "database URL", pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/i },
];

const RAW_TRANSCRIPT_PATTERNS = [
  /"role"\s*:\s*"(?:user|assistant)"/i,
  /"messages"\s*:\s*\[/i,
  /<\/?(?:user|assistant|system)>/i,
  /(?:full|raw)\s+(?:chat|conversation)\s+transcript/i,
];

function fail(message, code = 1) {
  process.stderr.write(`joka-event: ${message}\n`);
  process.exit(code);
}

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    stdio: options.stdio ?? ["pipe", "pipe", "pipe"],
  });
  if (result.status !== 0 && !options.allowFailure) {
    fail((result.stderr || result.stdout || `git ${args.join(" ")} failed`).trim());
  }
  return result;
}

function gitText(args, cwd, allowFailure = false) {
  return git(args, { cwd, allowFailure }).stdout.trim();
}

function repoRoot(cwd = process.cwd()) {
  const root = gitText(["rev-parse", "--show-toplevel"], cwd, true);
  if (!root) fail(`not inside a Git repository: ${cwd}`);
  return root;
}

function gitCommonDir(root) {
  const value = gitText(["rev-parse", "--git-common-dir"], root);
  return resolve(root, value);
}

function gitWorktreeDir(root) {
  const value = gitText(["rev-parse", "--git-dir"], root);
  return resolve(root, value);
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function now() {
  return new Date().toISOString();
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function detectSecrets(value) {
  const text = String(value ?? "");
  return SECRET_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name);
}

function containsRawTranscript(value) {
  return RAW_TRANSCRIPT_PATTERNS.some((pattern) => pattern.test(String(value ?? "")));
}

function redact(value) {
  let text = normalizeWhitespace(value);
  for (const { pattern } of SECRET_PATTERNS) text = text.replace(pattern, "[REDACTED]");
  return text;
}

function safeExcerpt(value, limit = 240) {
  const text = redact(value);
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function validSessionId(value) {
  return typeof value === "string" && /^(?:[0-9a-f]{8}-[0-9a-f-]{27,}|manual:[A-Za-z0-9._-]{3,80})$/i.test(value);
}

function parseArgs(argv) {
  const positional = [];
  const flags = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      positional.push(item);
      continue;
    }
    const [rawKey, inline] = item.slice(2).split("=", 2);
    const value = inline ?? (argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : "true");
    const current = flags.get(rawKey);
    flags.set(rawKey, current === undefined ? value : Array.isArray(current) ? [...current, value] : [current, value]);
  }
  return { positional, flags };
}

function flag(flags, name, fallback = "") {
  const value = flags.get(name);
  return Array.isArray(value) ? value.at(-1) : value ?? fallback;
}

function flags(flags, name) {
  const value = flags.get(name);
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
}

async function journalPath(root, sessionId) {
  const directory = join(gitCommonDir(root), "joka-events");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  return join(directory, `${safeId(sessionId)}.jsonl`);
}

function extractPrompt(payload) {
  for (const key of ["prompt", "user_prompt", "message"]) {
    if (typeof payload[key] === "string") return payload[key];
  }
  return "";
}

function collectPathValues(value, output = new Set(), key = "") {
  if (typeof value === "string") {
    if (/(?:path|file|cwd|workdir)/i.test(key) && value.length < 2048) output.add(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPathValues(item, output, key);
    return output;
  }
  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) collectPathValues(childValue, output, childKey);
  }
  return output;
}

function relativeSafePaths(root, values) {
  const paths = [];
  for (const value of values) {
    const absolute = resolve(root, value);
    const candidate = relative(root, absolute);
    if (candidate && !candidate.startsWith("..") && !candidate.includes("/.git/") && candidate !== ".git") paths.push(candidate);
  }
  return [...new Set(paths)].sort();
}

async function appendJournal(root, sessionId, record) {
  const target = await journalPath(root, sessionId);
  await appendFile(target, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  await chmod(target, 0o600);
}

async function setActiveSession(root, sessionId) {
  const directory = join(gitWorktreeDir(root), "joka-events");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const target = join(directory, "active-session");
  await writeFile(target, `${sessionId}\n`, { encoding: "utf8", mode: 0o600 });
  await chmod(target, 0o600);
}

async function activeSession(root) {
  try {
    return (await readFile(join(gitWorktreeDir(root), "joka-events", "active-session"), "utf8")).trim();
  } catch {
    return "";
  }
}

async function hook(kind) {
  const raw = await readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    fail("hook received invalid JSON", 2);
  }
  const root = repoRoot(payload.cwd || process.cwd());
  const sessionId = payload.session_id;
  if (!validSessionId(sessionId)) fail("hook payload is missing a valid session_id", 2);

  if (kind === "prompt") {
    const prompt = extractPrompt(payload);
    const secretKinds = detectSecrets(prompt);
    if (secretKinds.length > 0) {
      process.stdout.write(JSON.stringify({
        continue: false,
        stopReason: `Potential ${secretKinds.join(", ")} detected. Remove the secret and retry.`,
        systemMessage: "The prompt was blocked before Codex work began because it appears to contain secret material.",
      }));
      return;
    }
    await appendJournal(root, sessionId, {
      v: EVENT_VERSION,
      type: "prompt",
      at: now(),
      session_id: sessionId,
      turn_id: payload.turn_id ?? null,
      model: payload.model ?? null,
      permission_mode: payload.permission_mode ?? null,
      prompt_sha256: sha256(prompt),
      prompt_excerpt: safeExcerpt(prompt),
    });
    await setActiveSession(root, sessionId);
    return;
  }

  if (kind === "tool") {
    const toolInput = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
    await appendJournal(root, sessionId, {
      v: EVENT_VERSION,
      type: "tool",
      at: now(),
      session_id: sessionId,
      turn_id: payload.turn_id ?? null,
      tool: payload.tool_name ?? payload.toolName ?? payload.matcher ?? "unknown",
      paths: relativeSafePaths(root, collectPathValues(toolInput)),
    });
    return;
  }

  if (kind === "stop") {
    const changed = gitText(["status", "--porcelain=v1"], root, true)
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(3))
      .sort();
    await appendJournal(root, sessionId, {
      v: EVENT_VERSION,
      type: "stop",
      at: now(),
      session_id: sessionId,
      turn_id: payload.turn_id ?? null,
      changed_paths: changed,
    });
    return;
  }

  fail(`unknown hook kind: ${kind}`, 2);
}

async function readJournal(root, sessionId) {
  const target = await journalPath(root, sessionId);
  let text = "";
  try {
    text = await readFile(target, "utf8");
  } catch {
    return [];
  }
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function stagedFiles(root) {
  return gitText(["diff", "--cached", "--name-only", "--diff-filter=ACMR"], root, true)
    .split("\n")
    .filter(Boolean)
    .sort();
}

function parseVerification(items) {
  if (items.length === 0) fail("record requires at least one --verification 'PASS — command or evidence'");
  return items.map((item) => {
    const match = String(item).match(/^(PASS|FAIL|NOT_RUN)\s*(?:—|--|:)\s*(.+)$/i);
    if (!match) fail(`invalid verification entry: ${item}`);
    return { status: match[1].toUpperCase(), evidence: safeExcerpt(match[2], 400) };
  });
}

function eventId() {
  return `evt-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${randomBytes(4).toString("hex")}`;
}

function markdownEvent(event) {
  const verification = event.verification.map((item) => `  - ${item.status} — ${item.evidence}`).join("\n");
  const files = event.files.length ? event.files.map((file) => `\`${file}\``).join(", ") : "None";
  return `\n## ${event.at} · ${event.id}\n\n- **Actor:** ${event.actor}\n- **Codex session:** \`${event.session_id}\`\n- **Request:** ${event.request}\n- **Outcome:** ${event.outcome}\n- **Files:** ${files}\n- **Verification:**\n${verification}\n- **Approval:** ${event.approval}\n- **Deployment:** ${event.deployment}\n- **Base revision:** \`${event.base_revision}\`\n- **Prompt evidence:** ${event.prompt_sha256.map((digest) => `\`sha256:${digest}\``).join(", ") || "None"}\n\n${EVENT_MARKER}${JSON.stringify(event)}\n-->\n`;
}

async function ensureEventsFile(root) {
  const target = join(root, "events.md");
  try {
    await stat(target);
  } catch {
    await writeFile(target, EVENTS_HEADER, "utf8");
  }
  return target;
}

async function repoIdentity(root) {
  try {
    const config = JSON.parse(await readFile(join(root, ".joka", "events.json"), "utf8"));
    return config.repository || basename(root);
  } catch {
    return basename(root);
  }
}

async function record(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const sessionId = flag(parsed.flags, "session") || await activeSession(root);
  if (!validSessionId(sessionId)) fail("record requires --session with a Codex UUID or manual:<id>");
  const summary = safeExcerpt(flag(parsed.flags, "summary"), 600);
  if (!summary) fail("record requires --summary");
  const journal = await readJournal(root, sessionId);
  const promptRecords = journal.filter((item) => item.type === "prompt");
  const request = safeExcerpt(flag(parsed.flags, "request", promptRecords.at(-1)?.prompt_excerpt ?? summary), 400);
  const actor = safeExcerpt(flag(parsed.flags, "actor", `${gitText(["config", "user.name"], root, true) || "Unknown"} <${gitText(["config", "user.email"], root, true) || "unknown"}>`), 240);
  const event = {
    v: EVENT_VERSION,
    id: eventId(),
    at: now(),
    repository: await repoIdentity(root),
    actor,
    session_id: sessionId,
    request,
    prompt_sha256: promptRecords.map((item) => item.prompt_sha256).filter(Boolean).slice(-10),
    outcome: summary,
    files: stagedFiles(root).filter((file) => file !== "events.md"),
    verification: parseVerification(flags(parsed.flags, "verification")),
    approval: safeExcerpt(flag(parsed.flags, "approval", "development change only"), 240),
    deployment: safeExcerpt(flag(parsed.flags, "deployment", "not requested"), 240),
    base_revision: gitText(["rev-parse", "HEAD"], root),
  };
  const serialized = JSON.stringify(event);
  const secretKinds = detectSecrets(serialized);
  if (secretKinds.length > 0 || containsRawTranscript(serialized)) fail("event contains prohibited secret or raw-transcript material");
  const target = await ensureEventsFile(root);
  await appendFile(target, markdownEvent(event), "utf8");
  git(["add", "--", "events.md"], { cwd: root });
  const pending = join(gitCommonDir(root), "joka-events", "pending-event-id");
  await writeFile(pending, `${event.id}\n`, { encoding: "utf8", mode: 0o600 });
  process.stdout.write(`${event.id}\n`);
}

function parseEvents(text) {
  const events = [];
  let offset = 0;
  while (true) {
    const start = text.indexOf(EVENT_MARKER, offset);
    if (start < 0) break;
    const jsonStart = start + EVENT_MARKER.length;
    const end = text.indexOf("\n-->", jsonStart);
    if (end < 0) fail("events.md contains an unterminated event record");
    try {
      events.push(JSON.parse(text.slice(jsonStart, end)));
    } catch {
      fail("events.md contains invalid event JSON");
    }
    offset = end + 4;
  }
  return events;
}

function validateEvent(event, repository, changedFiles, baseRevision = null) {
  const errors = [];
  if (event.v !== EVENT_VERSION) errors.push(`unsupported event version ${event.v}`);
  if (!/^evt-[0-9]{14}-[a-f0-9]{8}$/.test(event.id ?? "")) errors.push("invalid event id");
  if (!validSessionId(event.session_id)) errors.push("invalid session id");
  if (!event.actor || !event.request || !event.outcome) errors.push("actor, request, and outcome are required");
  if (event.repository !== repository) errors.push(`repository must be ${repository}`);
  if (baseRevision && event.base_revision !== baseRevision) errors.push(`base revision must be ${baseRevision}`);
  if (!Array.isArray(event.verification) || event.verification.length === 0) errors.push("verification evidence is required");
  if (event.verification?.some((item) => !["PASS", "FAIL", "NOT_RUN"].includes(item.status) || !item.evidence)) errors.push("verification entries are malformed");
  if (event.verification?.some((item) => item.status === "FAIL")) errors.push("failed verification cannot be committed");
  const expected = changedFiles.filter((file) => file !== "events.md").sort();
  const actual = Array.isArray(event.files) ? [...event.files].sort() : [];
  if (JSON.stringify(expected) !== JSON.stringify(actual)) errors.push(`event files do not match staged files (expected: ${expected.join(", ") || "none"})`);
  const serialized = JSON.stringify(event);
  const secrets = detectSecrets(serialized);
  if (secrets.length > 0) errors.push(`event contains ${secrets.join(", ")}`);
  if (containsRawTranscript(serialized)) errors.push("event appears to contain a raw transcript");
  return errors;
}

async function verifyStaged(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const changed = stagedFiles(root);
  if (changed.length === 0) return;
  if (!changed.includes("events.md")) fail("staged changes require a staged events.md entry");
  const stagedText = gitText(["show", ":events.md"], root, true);
  if (!stagedText) fail("staged events.md is empty or unavailable");
  const events = parseEvents(stagedText);
  const latest = events.at(-1);
  if (!latest) fail("events.md has no machine-verifiable event record");
  const errors = validateEvent(latest, await repoIdentity(root), changed, gitText(["rev-parse", "HEAD"], root));
  if (errors.length > 0) fail(errors.join("; "));
  process.stdout.write(`${latest.id}\n`);
}

async function commitMessage(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const messageFile = parsed.positional[1];
  if (!messageFile) fail("commit-msg requires the commit message file", 2);
  const eventsText = gitText(["show", ":events.md"], root, true);
  const latest = parseEvents(eventsText).at(-1);
  if (!latest) fail("cannot bind commit message without an event");
  const message = await readFile(messageFile, "utf8");
  const trailer = `Joka-Event: ${latest.id}`;
  const cleaned = message.replace(/^Joka-Event:\s+.*$/gim, "").trimEnd();
  await writeFile(messageFile, `${cleaned}\n\n${trailer}\n`, "utf8");
}

function commitChangedFiles(root, commit) {
  return gitText(["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", commit], root, true)
    .split("\n")
    .filter(Boolean)
    .sort();
}

function validRebasedBase(root, parent, event, events) {
  if (!parent || !event.base_revision) return false;
  const ancestor = git(["merge-base", "--is-ancestor", event.base_revision, parent], { cwd: root, allowFailure: true });
  if (ancestor.status === 0) return true;

  const index = events.findIndex((item) => item.id === event.id);
  if (index <= 0) return false;
  const predecessor = events[index - 1];
  const parentTrailer = gitText(["show", "-s", "--format=%(trailers:key=Joka-Event,valueonly)", parent], root, true);
  if (!parentTrailer || parentTrailer !== predecessor.id) return false;
  const parentEventsText = gitText(["show", `${parent}:events.md`], root, true);
  if (!parentEventsText) return false;
  return parseEvents(parentEventsText).some((item) => item.id === predecessor.id);
}

async function verifyCommit(root, commit) {
  const configText = gitText(["show", `${commit}:.joka/events.json`], root, true);
  if (!configText) return { commit, enforced: false, ok: true, event: null };
  let config;
  try {
    config = JSON.parse(configText);
  } catch {
    return { commit, enforced: true, ok: false, event: null, errors: ["invalid .joka/events.json"] };
  }
  const eventsText = gitText(["show", `${commit}:events.md`], root, true);
  if (!eventsText) return { commit, enforced: true, ok: false, event: null, errors: ["events.md missing"] };
  const events = parseEvents(eventsText);
  const trailer = gitText(["show", "-s", "--format=%(trailers:key=Joka-Event,valueonly)", commit], root, true);
  if (!trailer) return { commit, enforced: true, ok: false, event: null, errors: ["Joka-Event commit trailer missing"] };
  const event = events.find((item) => item.id === trailer);
  if (!event) return { commit, enforced: true, ok: false, event: trailer, errors: ["commit trailer has no matching event"] };
  const parent = gitText(["rev-parse", `${commit}^`], root, true) || event.base_revision;
  const errors = validateEvent(event, config.repository || basename(root), commitChangedFiles(root, commit));
  if (event.base_revision !== parent && !validRebasedBase(root, parent, event, events)) {
    errors.push(`base revision must be ${parent}`);
  }
  return { commit, enforced: true, ok: errors.length === 0, event: trailer, errors };
}

async function verifyCommitCommand(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const commit = flag(parsed.flags, "commit", "HEAD");
  const result = await verifyCommit(root, commit);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}

async function verifyRange(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const head = flag(parsed.flags, "head", "HEAD");
  const base = flag(parsed.flags, "base");
  const revision = base && !/^0+$/.test(base) ? `${base}..${head}` : head;
  const commits = gitText(["rev-list", "--reverse", revision], root, true).split("\n").filter(Boolean);
  const results = [];
  for (const commit of commits) results.push(await verifyCommit(root, commit));
  process.stdout.write(`${JSON.stringify({ base: base || null, head, results }, null, 2)}\n`);
  if (results.some((item) => !item.ok)) process.exitCode = 1;
}

function hooksJson() {
  const command = 'sh "$(git rev-parse --show-toplevel)/.codex/events/run-node.sh"';
  return `${JSON.stringify({
    description: "Capture privacy-safe Codex activity for commit-linked development events.",
    hooks: {
      UserPromptSubmit: [{ hooks: [{ type: "command", command: `${command} hook prompt`, timeout: 5, statusMessage: "Recording safe request metadata" }] }],
      PostToolUse: [{ matcher: "^(Bash|apply_patch|Edit|Write)$", hooks: [{ type: "command", command: `${command} hook tool`, timeout: 5 }] }],
      Stop: [{ hooks: [{ type: "command", command: `${command} hook stop`, timeout: 5, statusMessage: "Finalizing safe development evidence" }] }],
    },
  }, null, 2)}\n`;
}

async function mergedHooksJson(root) {
  const generated = JSON.parse(hooksJson());
  const target = join(root, ".codex", "hooks.json");
  let existing;
  try {
    existing = JSON.parse(await readFile(target, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return hooksJson();
    fail(`cannot safely merge ${relative(root, target)}: ${error.message}`);
  }
  existing.hooks ??= {};
  for (const [eventName, groups] of Object.entries(generated.hooks)) {
    existing.hooks[eventName] ??= [];
    const alreadyInstalled = existing.hooks[eventName].some((group) =>
      group?.hooks?.some((handler) => String(handler?.command ?? "").includes(".codex/events/run-node.sh")),
    );
    if (!alreadyInstalled) existing.hooks[eventName].push(...groups);
  }
  existing.description ||= generated.description;
  return `${JSON.stringify(existing, null, 2)}\n`;
}

function gitHookBlock(kind) {
  const command = kind === "pre-commit" ? "verify-staged" : 'commit-msg "$1"';
  return `# JOKA-CODEX-EVENTS:START
root=$(git rev-parse --show-toplevel)
sh "$root/.codex/events/run-node.sh" ${command}
# JOKA-CODEX-EVENTS:END`;
}

async function mergeGitHook(target, kind) {
  let current = "";
  try {
    current = await readFile(target, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const marker = /# JOKA-CODEX-EVENTS:START[\s\S]*?# JOKA-CODEX-EVENTS:END/;
  const block = gitHookBlock(kind);
  let next;
  if (marker.test(current)) {
    next = current.replace(marker, block);
  } else if (current.startsWith("#!")) {
    const newline = current.indexOf("\n");
    next = `${current.slice(0, newline + 1)}${block}\n${current.slice(newline + 1)}`;
  } else {
    next = `#!/bin/sh\n${block}\n${current}`;
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  await chmod(target, 0o755);
}

async function installGitHooks(root, activate = true) {
  const configured = gitText(["config", "--get", "core.hooksPath"], root, true);
  let targetDirectory;
  if (!activate) {
    // Package portable hooks without changing or reading a developer's existing
    // local hook installation. Remote verification remains authoritative.
    targetDirectory = join(root, ".githooks");
  } else if (!configured) {
    targetDirectory = join(root, ".githooks");
    git(["config", "core.hooksPath", ".githooks"], { cwd: root });
  } else if (configured === ".husky/_" || configured.endsWith("/.husky/_")) {
    targetDirectory = join(root, ".husky");
  } else {
    targetDirectory = resolve(root, configured);
  }
  await mergeGitHook(join(targetDirectory, "pre-commit"), "pre-commit");
  await mergeGitHook(join(targetDirectory, "commit-msg"), "commit-msg");
  return targetDirectory;
}

function nodeRunnerScript() {
  return `#!/bin/sh
set -eu
root=$(git rev-parse --show-toplevel)
script="$root/.codex/events/joka-event.mjs"
configured=$(git config --get joka.events.node 2>/dev/null || true)
if [ -n "$configured" ] && [ -x "$configured" ]; then
  exec "$configured" "$script" "$@"
fi
if command -v node >/dev/null 2>&1; then
  exec node "$script" "$@"
fi
if command -v mise >/dev/null 2>&1; then
  exec mise exec -- node "$script" "$@"
fi
printf '%s\n' 'joka-event: no Node runtime found; rerun the repository onboarding installer' >&2
exit 127
`;
}

function githubWorkflow() {
  return `name: Codex event ledger

on:
  pull_request:
  push:

permissions:
  contents: read

jobs:
  verify-events:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Verify commit-linked Codex events
        env:
          EVENT_BASE: \${{ github.event.pull_request.base.sha || github.event.before }}
          EVENT_HEAD: \${{ github.event.pull_request.head.sha || github.sha }}
        run: node .codex/events/joka-event.mjs verify-range --base "$EVENT_BASE" --head "$EVENT_HEAD"
`;
}

function agentsBlock(project, what, why) {
  return `<!-- JOKA-CODEX-EVENTS:START -->
## Canonical Codex handoff

**This is the canonical handoff for everyone working in ${project}. Do not ignore it.**

### What this repository is

${what}

### Why it exists

${why}

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

  \`sh .codex/events/run-node.sh record --summary "What changed and why" --verification "PASS — command or evidence"\`

- Repeat \`--verification\` for each material check. Use \`NOT_RUN — reason\` only when no executable verification applies. Failed verification may not be committed.
- \`events.md\` is append-only. The pre-commit hook rejects a missing, malformed, mismatched, secret-bearing, or failed event. The commit-message hook binds the event ID to the commit.
- Preview approval is not production approval. Record the named production authorization and exact deployed revision separately.
<!-- JOKA-CODEX-EVENTS:END -->`;
}

async function updateAgents(root, project, what, why) {
  const target = join(root, "AGENTS.md");
  let current = "";
  try {
    current = await readFile(target, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const block = agentsBlock(project, what, why);
  const pattern = /<!-- JOKA-CODEX-EVENTS:START -->[\s\S]*?<!-- JOKA-CODEX-EVENTS:END -->/;
  const next = pattern.test(current)
    ? current.replace(pattern, block)
    : `${current.trimEnd()}${current.trim() ? "\n\n" : "# Repository guide\n\n"}${block}\n`;
  await writeFile(target, next, "utf8");
}

async function install(parsed) {
  const root = repoRoot(flag(parsed.flags, "repo", process.cwd()));
  const project = flag(parsed.flags, "project", basename(root));
  const repository = flag(parsed.flags, "repository", basename(root));
  const what = safeExcerpt(flag(parsed.flags, "what", `${project} is the product or operating system maintained in this repository.`), 600);
  const why = safeExcerpt(flag(parsed.flags, "why", `It gives ${project} one governed place for proposed changes, verification, review, and release evidence.`), 600);
  const localScript = join(root, ".codex", "events", "joka-event.mjs");
  await mkdir(dirname(localScript), { recursive: true });
  const source = fileURLToPath(import.meta.url);
  if (resolve(source) !== resolve(localScript)) await copyFile(source, localScript);
  await chmod(localScript, 0o755);
  await writeFile(join(root, ".codex", "events", "run-node.sh"), nodeRunnerScript(), "utf8");
  await chmod(join(root, ".codex", "events", "run-node.sh"), 0o755);
  await writeFile(join(root, ".codex", "hooks.json"), await mergedHooksJson(root), "utf8");
  const activateLocalHooks = flag(parsed.flags, "activate", "true") !== "false";
  await installGitHooks(root, activateLocalHooks);
  await mkdir(join(root, ".joka"), { recursive: true });
  await mkdir(join(root, ".github", "workflows"), { recursive: true });
  const workflowPath = join(root, ".github", "workflows", "codex-events.yml");
  try {
    const currentWorkflow = await readFile(workflowPath, "utf8");
    if (!currentWorkflow.includes("name: Codex event ledger")) fail(`${relative(root, workflowPath)} already exists and is not managed by joka-event`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeFile(workflowPath, githubWorkflow(), "utf8");
  const config = {
    version: EVENT_VERSION,
    project,
    repository,
    events: "events.md",
    installed_from: "Joka-Source/joka-source#dev/codex-events",
    tool_sha256: sha256(await readFile(localScript)),
    raw_transcripts: "forbidden",
    local_hooks_activated_during_install: activateLocalHooks,
  };
  await writeFile(join(root, ".joka", "events.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await ensureEventsFile(root);
  await updateAgents(root, project, what, why);
  git(["config", "joka.events.node", process.execPath], { cwd: root });
  process.stdout.write(`installed ${project} event ledger in ${root}\n`);
}

async function inspectRepo(root) {
  const result = {
    repository: basename(root),
    root,
    head: gitText(["rev-parse", "HEAD"], root, true) || null,
    branch: gitText(["branch", "--show-current"], root, true) || null,
    dirty: gitText(["status", "--porcelain=v1"], root, true).split("\n").filter(Boolean).length,
    installed: false,
    hooks_active: gitText(["config", "--get", "core.hooksPath"], root, true) === ".githooks",
    head_event: null,
    errors: [],
  };
  try {
    const config = JSON.parse(await readFile(join(root, ".joka", "events.json"), "utf8"));
    await stat(join(root, ".codex", "hooks.json"));
    await stat(join(root, ".githooks", "pre-commit"));
    const installedToolHash = sha256(await readFile(join(root, ".codex", "events", "joka-event.mjs")));
    const canonicalToolHash = sha256(await readFile(fileURLToPath(import.meta.url)));
    const text = await readFile(join(root, "events.md"), "utf8");
    const events = parseEvents(text);
    const trailer = gitText(["show", "-s", "--format=%(trailers:key=Joka-Event,valueonly)", "HEAD"], root, true);
    result.head_event = trailer || null;
    result.installed = true;
    if (config.tool_sha256 !== installedToolHash) result.errors.push("installed tool does not match repository configuration");
    if (canonicalToolHash !== installedToolHash) result.errors.push("installed tool has drifted from the canonical implementation");
    if (trailer && !events.some((event) => event.id === trailer)) result.errors.push("HEAD trailer has no matching event");
  } catch (error) {
    result.errors.push(error.code === "ENOENT" ? "event ledger not installed" : error.message);
  }
  return result;
}

async function reconcile(parsed) {
  const roots = flags(parsed.flags, "repo").map((item) => repoRoot(item));
  if (roots.length === 0) roots.push(repoRoot(process.cwd()));
  const results = [];
  for (const root of roots) results.push(await inspectRepo(root));
  process.stdout.write(`${JSON.stringify({ version: EVENT_VERSION, at: now(), repositories: results }, null, 2)}\n`);
  if (results.some((item) => item.errors.length > 0)) process.exitCode = 1;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const command = parsed.positional[0];
  if (command === "hook") return hook(parsed.positional[1]);
  if (command === "record") return record(parsed);
  if (command === "verify-staged") return verifyStaged(parsed);
  if (command === "verify-commit") return verifyCommitCommand(parsed);
  if (command === "verify-range") return verifyRange(parsed);
  if (command === "commit-msg") return commitMessage(parsed);
  if (command === "install") return install(parsed);
  if (command === "reconcile") return reconcile(parsed);
  fail("usage: joka-event <install|hook prompt|hook tool|hook stop|record|verify-staged|verify-commit|verify-range|commit-msg|reconcile>", 2);
}

await main();
