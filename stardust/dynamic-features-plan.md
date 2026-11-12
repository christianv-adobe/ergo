# Dynamic features plan — www.ergo.de

Inventory: `stardust/dynamic-features.md` (22 rows, all with a disposition). Static first: every
archetype page works as a static page before any phase wires behaviour. Only reproducibility `self`
ships autonomously; the rest ships its interim tier and waits on the decision batch.

## Phase A — prototypes (replica Phase 3, static + client JS, no network)

Widgets the archetype prototypes must implement (all `self`):

| widget | archetypes | rows | notes |
|---|---|---|---|
| header mega-menu flyouts + mobile drawer (multi-level) | all | 1 | per `stardust/chrome/header-contract.json` (open states, close paths, 1440/390); gated by chrome-compare |
| header search overlay + suggestions | all | 2 | static open/close in the prototype; results wired in Phase C |
| footer accordion (mobile) | all | 3 | |
| splide-style carousels (arrows, dots, loop, drag; 2/3-col tracks) | home, Ratgeber, Cyber | 5–7 | re-authored, not the splide DOM; authored card rows |
| content accordions (FAQ / coverage) | Cyber (program) | 4 | block with authored rows |
| tooltips (info-i popovers) | home, Ratgeber, Cyber | 13 | |
| tariff comparison table | Cyber | 14 | static |
| promo price slots, ccw columns | all | 8, 9 | settled text as content; no fabrication |

Not in prototypes: OneTrust banner/dialog, chat button, tags (martech off — rows 19–22).

Verification: prototype gate at 1440/360; carousel/accordion/menu open states via motion-observe/chrome-compare.

## Phase B — data snapshots (deploy foundation)

- Row 10: `data/reviews/quotes.json` + `_provenance.json` from `ekomireact.quotes.json` (source 200, target 404).
- Row 11: `data/articles/teaserdata.json` (image, date, category only); text authored in the documents.
- Row 12: nothing ships (no consumer); revisit at rollout.
- Effort: S. Owner decision: none.

## Phase C — search + listings index (deploy foundation / rollout)

- `helix-query.yaml` committed in the code branch (all pages + `/de/Ratgeber/**` with `published-date`,
  `category`); push, publish live, poll `/query-index.json` (≤ every 5 s, bounded).
- Search widget: header form → `/suche` (or `/de/sonstige/suchergebnisse` path kept) results page on the
  migrated corpus, facets from `category`. Parity: `search-query` check, term "Zahnzusatzversicherung",
  source `expectCount` 28 (Produkte 9 / Services 4 / Ratgeber 15), top titles in
  `stardust/dynamics/search-probes.json` — migrated corpus is 10 pages, so the count gap is a parity note.
- Row 6: article rail document-first, index top-up for date/image (A1 interim).
- Effort: M. Owner decision: A1, A2 (interim shipped).

## Phase D — martech (owner-enabled; scaffold at deploy foundation)

- Contract `stardust/martech-contract.json`: `consent.cmp` (OneTrust, domain script `2e444b6c-…a79b`, model
  `per-tag`), routes `adobe-launch`, `google-tag-manager`, `aemMartech` (Web SDK) — **all `enabled: false`**;
  `productionHosts: [www.ergo.de]`; `target: null`.
- Hand-off `stardust/martech-handoff.md`: enabling steps, 60+ OneTrust categories, 18 Launch rules + 5 data
  elements to rewrite (old selectors / paths), ACDL extension missing for `aem-martech`.
- `martech-scaffold.mjs --dry-run`: exit 0 — "would write scripts/martech.js, scripts/scripts.js · no CMP · 0
  route(s) enabled". Real run at the deploy foundation step.
- Chat (row 19) stays off until D1. Verification: `dynamics-check.mjs` martech checks (`/` requests no route
  or CMP host while disabled).
- Owner decision: D1, D2, D3.

## Phase E — parity (rollout / qa)

`stardust/dynamics/parity.json`: menu/drawer open, search-query (above), carousel advance, accordion toggle,
reviews snapshot served, martech-off assertions. `dynamics-check.mjs --origin main--856f1bba--aemcoder.aem.page`.

## Named assumptions (hands-off)

A1 article rail interim = authored rows · A2 product carousels authored (undecided — revisit at rollout) ·
A3 single `de` locale tree · A4 portal links stay absolute to `kunde-s.ergo.de`. None is `decided-out`.
