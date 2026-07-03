# Roster Schema

All roster entries (founders, advisors, alumni) use a common YAML front-matter schema. This document is the authoritative definition.

## Front-Matter Schema

```yaml
---
# Required fields (all entries)
name: string                  # Legal full name
handle: string                # Primary identifier (LinkedIn username or campus ID)
role: string                  # e.g. "Co-founder", "Advisor", "Contributor"
status: active | inactive | alumni
joined_on: YYYY-MM-DD

# Optional fields
linkedin: url
github: url
cohort: string                # e.g. "PGP 2027" (for IIMC students/alums)
institution: string           # Undergrad institution
email: string                 # Only include if the person consented to public listing

# For founders only
founding_cell: true
---
```

## Field Definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Legal full name |
| `handle` | string | yes | Unique within the roster; never reuse after departure |
| `role` | string | yes | Descriptive title, not a job level |
| `status` | enum | yes | `active` / `inactive` / `alumni` |
| `joined_on` | date | yes | ISO 8601 |
| `linkedin` | url | no | Full URL |
| `github` | url | no | Full URL |
| `cohort` | string | no | IIMC batch, e.g. `PGP 2027` |
| `institution` | string | no | Undergrad institution |
| `email` | string | no | Public listing requires explicit consent |
| `founding_cell` | bool | no | `true` only for Cell 0 members |

## Privacy Rules

1. `alumni.yml` is a **private file** — it contains opt-in booleans for Joka Connect and must never be made public without a privacy review.
2. No dating preferences, marital status, photos, or health data belong in any roster file. These belong in the Joka Connect app database with its own consent flow.
3. `founders.yml` and `advisors.yml` may be public; verify each person has consented before making the file public.
4. PII removal requests: open a private issue. A founder must action within 48 hours.

## Example Entry

```yaml
---
name: Krishna Chaudhari
handle: truekrishna
role: Co-founder
status: active
joined_on: 2026-07-01
linkedin: https://www.linkedin.com/in/truekrishna/
github: https://github.com/TrueKrishna
cohort: PGP 2027
institution: IIIT Nagpur
founding_cell: true
---
```
