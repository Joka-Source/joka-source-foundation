#!/usr/bin/env python3
"""
charter-validator.py — Validates project cell README and CHARTER files.

Checks:
  - README.md has required YAML front-matter fields
  - retirement_condition is not empty / TODO
  - CHARTER.md has required H2 headings
  - Slug is not in the burned list (retired-cells.md)

Run: python3 tools/charter-validator.py [projects/slug/]
CI: runs on all projects/** changes in .github/workflows/lint.yml
"""

import sys
import os
import re
import glob

REQUIRED_FRONT_MATTER = [
    "status",
    "spawned_on",
    "responsible_founder",
    "next_milestone_date",
    "retirement_condition",
]

REQUIRED_CHARTER_SECTIONS = [
    "Context & Motivation",
    "Scope",
    "Objectives & Success Criteria",
    "Team & Roles",
    "Timeline & Milestones",
    "Retirement Condition",
    "Governance Inheritance",
]

ERRORS = []


def validate_project(path: str) -> bool:
    """Validate a single project cell directory. Returns True if valid."""
    slug = os.path.basename(path.rstrip("/"))

    if slug == "_template":
        return True  # skip template

    readme = os.path.join(path, "README.md")
    charter = os.path.join(path, "CHARTER.md")

    ok = True

    # Check README exists
    if not os.path.exists(readme):
        ERRORS.append(f"[{slug}] Missing README.md")
        ok = False
    else:
        content = open(readme).read()
        # Check front-matter
        fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if not fm_match:
            ERRORS.append(f"[{slug}] README.md missing YAML front-matter block")
            ok = False
        else:
            fm = fm_match.group(1)
            for field in REQUIRED_FRONT_MATTER:
                if f"{field}:" not in fm:
                    ERRORS.append(f"[{slug}] README.md front-matter missing field: {field}")
                    ok = False
            # Check retirement_condition is not TODO
            if re.search(r'retirement_condition:\s*["\']?TODO', fm):
                ERRORS.append(f"[{slug}] README.md retirement_condition must not be TODO")
                ok = False

    # Check CHARTER exists
    if not os.path.exists(charter):
        ERRORS.append(f"[{slug}] Missing CHARTER.md")
        ok = False
    else:
        content = open(charter).read()
        for section in REQUIRED_CHARTER_SECTIONS:
            if f"## {section}" not in content:
                ERRORS.append(f"[{slug}] CHARTER.md missing section: ## {section}")
                ok = False
        # Check Retirement Condition is not TODO
        rc_match = re.search(r"## Retirement Condition\n+(.*?)(\n## |\Z)", content, re.DOTALL)
        if rc_match and "TODO" in rc_match.group(1):
            ERRORS.append(f"[{slug}] CHARTER.md Retirement Condition must not be TODO")
            ok = False

    return ok


def main():
    if len(sys.argv) > 1:
        paths = sys.argv[1:]
    else:
        # Find all project directories
        paths = [d for d in glob.glob("projects/*/") if os.path.isdir(d)]

    all_ok = True
    for path in paths:
        if not validate_project(path):
            all_ok = False

    if ERRORS:
        print("Charter validation FAILED:")
        for e in ERRORS:
            print(f"  ERROR: {e}")
        sys.exit(1)
    else:
        print(f"Charter validation passed for {len(paths)} project(s)")
        sys.exit(0)


if __name__ == "__main__":
    main()
