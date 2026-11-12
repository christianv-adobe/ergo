---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-28T14:39:59Z
  againstInput: https://www.ergo.de/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.ergo.de/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-28T14:39:59Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Roster: the 10 selected pages of stardust/.labs/site-plan.json only.

## Direction log

- 2026-10-28T14:31:31Z HANDS-OFF activated (stardust:replica → extract --prep --dynamics --hands-off): interactive gates auto-resolve; quality gates unchanged. Roster: the 10 explicitly listed pages only.

## Link-audit decision (rollout E2, 2026-10-28)
Scope extension, repointed to the source: the run's scope is the 10 `selected: true` pages of
`stardust/.labs/site-plan.json`. Every internal link to one of those 10 is root-relative on EDS
(32 localized by `localize-links.mjs`). The ~238 other ergo.de targets linked from nav, footer and
the pages (product, service, contact, forms pages — e.g. /de/service/vermittlersuche,
/de/service/kontakt, /de/produkte/rechtsschutzversicherung) are outside the declared scope and stay
absolute links to https://www.ergo.de (list: `localize-links.mjs --check` "KEPT" section). No
internal link 404s on the delivered tree.
