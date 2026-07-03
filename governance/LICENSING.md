# Licensing Policy

## Default License

**Recommended: Apache-2.0**

Rationale: The explicit patent grant matters for an alumni-contributed codebase where IP provenance will be murky in five years. The NOTICE file gives JSF a clean attribution surface. Tradeoff vs. MIT is ~10 extra lines of boilerplate.

**Status: TODO — founder to confirm (see ADR-002 in DECISIONS.md)**

## IP Assignment

All contributors sign off via Developer Certificate of Origin (DCO) on every commit:

```
Signed-off-by: Your Name <your@email.com>
```

This certifies that you wrote or have rights to the code. See [developercertificate.org](https://developercertificate.org).

A full CLA (Contributor License Agreement) is only required for sub-projects that onboard outside corporate contributors. The founding cell will flag this when applicable and a legal advisor should review before activation.

## Project-Specific Overrides

A sub-project may adopt a different license if:
1. Approved by the founding cell (unanimous)
2. Recorded in `governance/DECISIONS.md`
3. The sub-project's `CHARTER.md` explicitly states the override

No silent overrides. If a sub-project depends on GPL-licensed libraries, it re-licenses locally and the override is logged.

## Trademark

JSF brand assets (logos, "Joka Source Foundation" name, "Joka" prefix in project names) are not covered by the Apache-2.0 license. Usage requires written permission from the founding cell.

See `legal/registered-trademarks.md` for brand registration status.
