#!/usr/bin/env bash
# project-scaffold.sh — Spawn a new JSF project cell from the _template/
# Usage: ./tools/project-scaffold.sh <project-slug>
#
# This copies projects/_template/ to projects/<slug>/ and prompts for
# required front-matter fields. Run from the repo root.

set -euo pipefail

SLUG="${1:-}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
TEMPLATE_DIR="$REPO_ROOT/projects/_template"
TARGET_DIR="$REPO_ROOT/projects/$SLUG"

# Validate
if [[ -z "$SLUG" ]]; then
  echo "Error: provide a project slug" >&2
  echo "Usage: $0 <project-slug>" >&2
  exit 1
fi

if [[ ! "$SLUG" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: slug must be lowercase alphanumeric + hyphens only" >&2
  exit 1
fi

if [[ -d "$TARGET_DIR" ]]; then
  echo "Error: projects/$SLUG already exists" >&2
  exit 1
fi

# Check if slug is burned (retired)
if grep -q "| $SLUG |" "$REPO_ROOT/archive/retired-cells.md" 2>/dev/null; then
  echo "Error: slug '$SLUG' is permanently retired and cannot be reused" >&2
  exit 1
fi

# Copy template
cp -r "$TEMPLATE_DIR" "$TARGET_DIR"
mkdir -p "$TARGET_DIR/docs"
touch "$TARGET_DIR/docs/.gitkeep"

echo "Created projects/$SLUG/ from _template/"
echo ""
echo "Next steps:"
echo "  1. Edit projects/$SLUG/README.md — fill front-matter (status, spawned_on, responsible_founder, retirement_condition)"
echo "  2. Edit projects/$SLUG/CHARTER.md — fill all sections, especially the retirement condition"
echo "  3. git add projects/$SLUG/ && git commit -s -m 'feat: spawn project cell $SLUG'"
echo "  4. Open a PR — CI charter-validator will check required fields"
echo "  5. Get founding cell approval"
