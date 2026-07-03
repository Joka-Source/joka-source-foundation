# Joka Connect — PII Policy

> Data governance for Joka Connect's dating/matchmaking and alumni networking features.

## Principle

Sensitive personal data belonging to Joka Connect users **never enters this org-wrapper repository**. This file documents the policy; the data lives in the Joka Connect application database with its own consent infrastructure.

## What Lives Here (org-wrapper repo)

- This policy document
- Opt-in boolean in `roster/alumni.yml` (field: `opt_in_joka_connect: true/false`)
- IIMC cohort and LinkedIn handle (professional public data, with consent)

## What Lives in the App Database Only

- Dating preferences and relationship goals
- Marital status
- Photos and profile media
- Match history and conversation data
- Any health, religious, or caste data (not collected)

## Consent Model

1. Alumni opt in to Joka Connect via the app's consent flow — not via this repo
2. The `roster/alumni.yml` opt-in boolean is a pointer, not the consent record itself
3. The app must maintain its own consent log with timestamp and version of terms accepted

## Data Removal

- Users may request data deletion via the app or by emailing the responsible founder
- PII removal from `roster/alumni.yml`: open a private issue; founders must action within 48 hours
- App-side deletion: Joka Connect's own data deletion flow handles this

## Legal Review

A legal advisor must review the data model and consent flow before Joka Connect onboards non-founder contributors or any external partners. See `legal/` for entity status and IP assignment context.

## TODO

- Finalize consent flow design
- Draft Terms of Service and Privacy Policy for the Joka Connect app
- Legal review before v0 launch
