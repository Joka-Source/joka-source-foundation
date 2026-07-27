#!/bin/sh
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
printf '%s
' 'joka-event: no Node runtime found; rerun the repository onboarding installer' >&2
exit 127
