# Learnings — ergo.de replica run (2026-10-28)

### Coverage rows keep the source-cased path, so delivery checks compare the wrong URL
- failure class: path-safety
- evidence: `inventory.mjs` wrote `path` = source path (`/de/Produkte`, `/de/Geschaeftskunden-Produkte/...`) while EDS serves lowercase; `assemble.mjs --verify-origin` reported 7 extra / 7 missing, `verify.mjs` flagged every link to a delivered page as broken, and the runner's done-check listed 7 pages "not live" until the redirects sheet existed. Fixed by rewriting `path` to the delivered path (source kept as `sourcePath`).
- proposed change: `skills/rollout/scripts/inventory.mjs` — store the eds-path-normalised delivered path in `path` (source in `sourcePath`), and match gate rows/redirects by either.
- status: pending

### verify.mjs fetches a trailing-slash URL for index.html-shaped migrated sources
- failure class: path-safety
- evidence: `publicUrl()` appends `/` when `source.migratedHtml` ends in `index.html`; /de/ratgeber/ and the cyber page 404 on EDS (leaf documents) although the page answers 200. Worked around with trailing-slash rows in the redirects sheet.
- proposed change: `skills/rollout/scripts/lib.mjs` `publicUrl` — derive the URL from `delivery.deployedUrl` when present; only folder indexes in the content tree get a trailing slash.
- status: pending

### Hyphenation asymmetry between capture browsers inflates pixel rows on German sites
- failure class: capture-gap
- evidence: source CSS `* { hyphens: auto }`; gate-all stitches the origin in headed real Chrome (no German hyphenation dictionary) and EDS in bundled Chromium (hyphenates) — 9 rows needed a same-browser override (raw up to 30 %, same-browser ≤ 8.9 %).
- proposed change: `skills/replica/scripts/gate-all.mjs` — when the origin's computed `hyphens` is `auto` and `lang` is not `en`, stitch both sides in the same browser by default and record the asymmetry.
- status: pending

### Source JSON-LD dropped by the encoders
- failure class: silent-render
- evidence: optimize flagged `ai-search/jsonld` on 10/10 pages; every source page carried JSON-LD (WebSite/WebPage/Organization/Article/FAQPage). Carried over verbatim as a `json-ld` page-metadata row — the EDS pipeline renders it as `application/ld+json`.
- proposed change: `skills/migrate` encoders / `skills/deploy` metadata step — emit the captured JSON-LD as a `json-ld` metadata row at encode time.
- status: pending
