# Journal — ergo.de replica

## Extract — 10 selected pages captured live, 3 page types (2026-10-28)
- `extract --prep --dynamics --pages <10 selected>`: 10/10 live (Playwright, medium wait, HTTP 200), no bot protection; OneTrust consent dismissed.
- Types: landing (index, de, de-geschaeftskunden-produkte, de-produkte, de-service; archetype `/`), listing (de-ratgeber, de-rechtsportal; archetype `/de/Ratgeber`), program (3 Geschaeftskunden product pages; archetype `…/Cyber-Versicherung-fuer-Unternehmen`).
- 13 module candidates in DESIGN.json `extensions.modules`. Fonts FS Me + Fedra Serif — commercial kits, never rehosted (substitute policy at Phase 3).
- `/de` 301-redirects to `/`; both kept as in the plan. Links to the 500+ non-selected pages stay out of scope.
- Run ordering: sequential phases (no two-track first-page split) — the home page is the first archetype either way.

## dynamics detect, classify, triage — replica Phase 2 dynamic surface (2026-10-28)
- detect (Phase 1+2 classify): 3 archetypes, 37 findings (A5 CR2 D9 I18N1 L4 M1 S1 T13 X1); search probe "Zahnzusatzversicherung" → 28 on source (`stardust/dynamics/search-probes.json`).
- triage: `dynamics-plan.mjs --target-origin main--856f1bba--aemcoder.aem.page --chrome --martech` → 39 draft rows, 9 first-party data paths host-bound (404 on target); curated to 22 rows in `stardust/dynamic-features.md` + plan; no decided-out.
- martech (owner keeps source tags/consent): OneTrust CMP, Adobe Launch, gtag AW-980528457, aemMartech Web SDK — all disabled in `stardust/martech-contract.json`; scaffold dry-run exit 0.

## Preserve direction — spec promoted verbatim, empty register, dynamics triaged (2026-10-28)
- Full-prep branch: current/PRODUCT.md, DESIGN.md, DESIGN.json promoted byte-for-byte to the root; direction.md records PRESERVE mode.
- Inconsistency register empty (hands-off adopts no audit findings) — pure replica. Per-template content widths (1256 home / 888 article+product) are replicated as measured, not unified.
- Dynamics: 37 findings → 22 dispositioned rows (dynamic-features.md / -plan.md). Widgets the prototypes implement: mega-menu + mobile drawer, search overlay, mobile footer accordion, carousels, content accordions, tooltips.
- Martech (owner decision: keep tags/consent): OneTrust, Adobe Launch, gtag, Web SDK carried into martech-contract.json with every part disabled; martech-handoff.md lists Launch rules to rewrite. Scaffold dry-run OK; real scaffold runs at the deploy foundation.
- Publish decision recorded in eds-conversion-log.md.

## Recreate landing — source-fidelity-gate: 0 red, 1.18%/3.09% pixel, residuals logged after the 3-iteration cap (2026-10-28)

- Archetype `landing` / slug `index` (https://www.ergo.de/) → `stardust/prototypes/index-proposed.html` + `index.css`, built by `stardust/replica/build-prototype.mjs` from frozen content models (`stardust/replica/content/{index,chrome}.json`, verbatim from the live DOM snapshot + extract capture). Content root `#main` on both sides.
- Shared layers established for later archetypes: `shared/canon.css` (tokens, fonts, type ramp, module grid, spacing, full-bleed bg via lifted border-image, CTA, price, promo, tile, carousel, article teaser), `shared/chrome.css` + `shared/chrome.js` (fixed header, desktop flyouts, search overlay, mobile drawer, footer accordion <768), `shared/carousel.js` (splide-parity loop slider), `shared/header.html` / `footer.html` partials.
- Fonts: FS Me and Fedra Serif are licensed kits — not rehosted. Substitutes Fira Sans 400/700 and Noto Serif 400/700 (OFL, self-hosted under shared/fonts), size-adjust from measured advance-width ratios, brand family first in every stack. Permanent justified font residual (FONT FORK / FONT MISMATCH advisories, ±2–4px glyph widths in chrome-parity).
- Gate (3 iterations per breakpoint + post-motion confirmation): 1440 pixel 1.18%, Δh 0, content-diff 0 🔴 / 6 nothing-lost 🟡; 360 pixel 3.09%, Δh −12, 0 🔴 / 6 🟡; clip 0, overflow 0 both; chrome crops header 1.85%/0.75%, footer 1.76%/1.18%; cap-probe PASS at 2560 (after removing a wrapper cap — live caps each module).
- Residuals (all nondeterministic live content or out-of-scope chat): live randomizes the Ratgeber article set (6 of ~10) and the eKomi quote (1 of 9) per load — one observed value frozen (`content/index.frozen.json`); the remaining nothing-lost 🟡 are the randomized articles' aria-labels and the 360 Δh −12 is the frozen set's tallest card vs the cached capture's. The Realperson chat invite (martech, out of the prototype) paints into the live 360 hero band.
- Motion: observed on live (motion/index.json) — carousel track transition 0.4s + slide/dot state classes and header-button hover fired and are implemented; card/tile/teaser hovers and header scroll-morph are dead; Realperson chat animations out of scope. motion-compare: 6 parity, 5 missing (all chat), 0 extra.

## Recreate listing — source-fidelity-gate: 0 red / 0 nothing-lost, 8.01%/5.70% pixel, 1440 Δh +17 font-wrap residual (2026-10-28)

- Archetype `listing` / slug `de-ratgeber` (https://www.ergo.de/de/Ratgeber) → `stardust/prototypes/de-ratgeber-proposed.html` + `de-ratgeber.css` (empty page layer), built by `build-prototype.mjs de-ratgeber` from `content/de-ratgeber.json` (frozen by the new `extract-listing-content.mjs` from the extract capture: rich text kept as sanitized AEM text-style markup, promos/tiles/CTAs from their data-* attributes). Content root `#main` both sides.
- Cumulative: imports canon.css + chrome.css + chrome.js + carousel.js unchanged; new modules live in the new shared layer `shared/modules.css` (narrow 888 grid track with flow-root modules, rich text, article header, breadcrumb, column control, promo by data attributes incl. left / rounded image, tertiary CTA + headset icon, icon-less reduced tile, benefits, article-footer note row). Index is not linked to it and its rebuilt HTML + shared header/footer partials are byte-identical, so no index re-run was needed.
- Chrome: header = canon (crops 1.85% / 0.75%). Ratgeber pages carry an older "article" footer XF (Hinweis note row, different Service and Über ERGO links, © 2025) → page-level footer variant `site-footer--article` from the page content model; shared footer.html untouched (crops 1.86% / 1.50%).
- Gate (3 iterations per breakpoint incl. full first + full confirmation): 1440 pixel 8.01%, Δh +17, content-diff 0 🔴 / 0 🟡, clip 0, overflow 0, units PASS; 360 pixel 5.70%, Δh +1, 0 🔴 / 0 🟡, clip 0, overflow 0, units PASS; cap-probe PASS at 2560 (0/41 rows).
- Residuals: 1440 Δh +17 = one card text (first Ratgeber card) wrapping 6 vs 7 lines in the gate's bundled Chromium with the substitute font — in real Chrome every module row matches live to 0px; the three 1440 hot bands are that offset (aligned crops 2.1–3.3%). 360: two paragraphs wrap one line shorter (−21px each) in real Chrome, net +1 in the gate. All font-substitution class, permanent until the licensed kits are rehosted.
- Motion: carousel track 0.4s + slide state classes (parity, shared carousel.js) and breadcrumb hover fired → implemented; promo/tile/CTA/link hovers dead → lifted promo hover shadow and link hover removed; Realperson chat out of scope. motion-compare 5 parity, 4 missing (chat), 0 extra.

## Recreate program — source-fidelity-gate: 0 red / 0 nothing-lost, 1.22%/3.13% pixel, 360 Δh −10 font-wrap residual (2026-10-28)

- Archetype `program` / slug `de-geschaeftskunden-produkte-cyber-versicherung-fuer-unternehmen` (https://www.ergo.de/de/Geschaeftskunden-Produkte/Cyber-Versicherung-fuer-Unternehmen) → `stardust/prototypes/<slug>-proposed.html` + empty page layer, built by `build-prototype.mjs <slug>` from `content/<slug>.json`, frozen by the extended `extract-listing-content.mjs` (Ratgeber model and index/Ratgeber HTML re-checked byte-identical after every extension).
- Cumulative: canon + chrome + modules.css reused; new shared layer `shared/program.css` (product hero image-right, accordion on native details, product table with sticky header/group rows, download, icon benefits, CTA w-33) + `shared/product-table.js`. Two additions to modules.css lifted from live c10/c36: rich-text p+p −10/−12px and promo image hidden on mobile (Ratgeber has neither, so unaffected).
- Chrome: Geschäftskunden pages carry their own header (top nav Produkte für Geschäftskunden / Service / Kontakt; Berater, Log-in, Über ERGO icon buttons; no search/phone; own flyout tree; "zum Inhalt springen") and footer (B2B product column, different Kontakt/Über ERGO links, no Sitemap button) — both from the page model, partials `shared/header-b2b.html` / `footer-b2b.html`. Crops header 0.55%/0.43%, footer 1.62%/1.20%.
- Gate (3 iterations per breakpoint + full confirmation): 1440 pixel 1.22%, Δh 0; 360 pixel 3.13%, Δh −10; content-diff 0 🔴 / 0 🟡 both; clip 0, overflow 0; cap-probe PASS at 2560 (0/27). Fixes all came off module-row and measure probes: missing carousel downloads, close-button aria, footer accordion title leak (accordion CSS scoped), XF slide padding, hidden-mobile promo image, p+p margins, stray Sitemap button.
- Residuals (360, font substitution, permanent until the licensed kits are rehosted): h2 "Präventionsdienstleistungen" fits one line in Fira Sans (−31px), contact-tile text wraps one line more (+10px), footer link "Alle Geschäftskunden-Produkte im Überblick" wraps (+24px in the footer).
- Motion: accordion chevron rotate and product-table header `is-pinned` fired → implemented (motion-compare 2 parity, 0 missing, 0 extra); summary/download/tile/CTA/row hovers dead.
- Prototype table (`gate-all --stage prototype`): 3/3 PASS at 1440 and 360. Instrument note: unit-geometry caches the origin unit inventory per slug, not per width (`stardust/current/measure/<slug>-units.json`) — delete it between widths, or a 1440 run reuses the 360 inventory (seen as a false Ratgeber "units off 17").

## Recreate — all three archetypes gated (2026-10-28)

- landing (index), listing (de-ratgeber), program (Cyber-Versicherung) each prototyped from frozen content models on shared layers and gated at 1440 + 360; all approved hands-off; prototype table 3/3 PASS at both widths. Next: Phase 5 handoff (migrate → deploy → rollout C-deliver).

## Migrate plan — archetypes placed, siblings deferred to their archetype units (2026-10-28)
- Gated-archetype precondition met: landing/index, listing/de-ratgeber, program/cyber each pass at 1440 + 360 (replica/progress.json).
- `migrate.mjs render` Path A for the 3 archetypes → stardust/migrated/ (canon = prototypes/shared/canon.css); "broken" link counts are hrefs to out-of-scope pages (repointed to the source host at E2).
- modules[] recorded per archetype sidecar (banner, hero, carousel, cta, ekomi / article-header, breadcrumb, ccw, promo, benefits / accordion, product-table).
- Siblings (4 landing, 1 listing, 2 program) render Path A′ inside C-deliver after each archetype is live and gated (#126); units in stardust/migrate/progress.json.

## Rollout A-inventory — 10 rows, 3 archetypes to deliver, 7 content-pending (2026-10-28)
- `inventory.mjs` over stardust/migrated (archetypes-only mode): 3 pending (index, de-ratgeber, cyber), 7 content-pending siblings.
- rollout.json site: DA org aemcoder / site 856f1bba / ref main; live host main--856f1bba--aemcoder.aem.live.

## Rollout B-block — 12 distinct blocks, representative-first plan (2026-10-28)
- blocks.mjs: 12 module blocks, 18 instances → 12 conversions (carousel×3, benefits/cta/hero/promo×2).
- plan.mjs: cyber converts hero, benefits, accordion, cta, product-table, carousel, promo; ratgeber converts article-header, breadcrumb, ccw; index converts banner, ekomi.

## Rollout B2-dynamic — fresh detect matches the curated triage; martech scaffolded all-off (2026-10-28)
- dynamics-detect on the 3 archetypes: 37 findings, the same set Phase 2 curated (22 rows in stardust/dynamic-features.md, every row dispositioned).
- dynamics-plan --target-origin main--856f1bba--aemcoder.aem.page --migrated --martech --chrome: 39 draft rows (chrome rows added), host-bound 2/2 first-party APIs — both already snapshot rows (d-article-data, d-reviews-quotes).
- martech-scaffold.mjs from stardust/martech-contract.json: scripts/martech.js + loadConsent/loadTags hooks in scripts/scripts.js; no CMP, 0 routes enabled (every part off, owner switches on). ESLint clean.

## C-deliver foundation (C0) — styles, substitute fonts, header/footer blocks, 4 chrome docs live (2026-10-28)
- One foundation subagent authored + deployed: runtime-contract, styles (canon lifted), Fira Sans / Noto Serif substitutes (licensed FS Me / Fedra never rehosted), favicon, header/footer blocks, /nav, /footer, /nav-geschaeftskunden, /footer-geschaeftskunden (noindex, live); shell /index previewed only.
- Gate on the shell (preview): crop header 1.85% / 0.75%, footer 1.75% / 1.13% (1440 / 360) — all ≤ 2%. chrome-compare 59 → 24 → 16 errors in 3 rounds; residuals: search typeahead (backend API) + 15 open-state crops 2–7% from substitute-font glyphs. Only the owner can clear these (header-decisions.json). Shell pixel deferred to the landing archetype unit (shell carries the hero only).
- foundation-freeze.mjs freeze done; section-style + button mapping in eds-conversion-log.md § Foundation (C0).

## C-deliver archetype-program — Cyber-Versicherung live; 1440 8.32% pass, 360 10.38% hyphenation residual (2026-10-28)
- 7 blocks converted (hero, benefits, accordion, cta, product-table, promo, carousel), EW round-trip 157/157 editable, ai-readability 100, computed-style guard clean; published live.
- gate-all on preview: 1440 8.32% Δh+90 PASS; 360 10.38% Δh+102 FAIL on pixel only after the 3-round cap. Cause measured: live captured in headed Chrome (no German hyphenation dictionary) vs EDS in bundled Chromium (hyphenates) → narrow-column wrap differences; same-browser box heights identical. No mask applied; decision deferred to the gate-all unit (documented override or same-browser re-capture).
- Foundation request queued: narrow page layer (888px column, rich-text, ta-c / scroll-top / check-list styles) — interim in blocks/hero/hero.css via `Theme: narrow`.
- gate-all needs pages with status `deployed` + liveUrl in its --state: units pass a generated copy under stardust/.work/rollout/.

## C-deliver cluster-program — 2 business siblings rendered (sibling tier) and live, all rows pass (2026-10-28)
- migrate render unit `program`: rendered 2, unchanged 0, refused 0, passthrough 0 (siblings advanced extracted → directed by the subagent via state.mjs so the driver takes Path A′).
- gate-all: bAV 1440 8.74% / 360 9.89%; Dienstreise 3.95% / 7.72%; clip 0, missing 0; archetype re-gated unchanged after accordion/product-table/hero CSS changes.
- content-diff: 0 missing, but ROLE SWAP 🔴 (headline-styled source <p> authored as headings — the archetype's encoder choice) + redundant aria-label 🟡; recorded as a role-upgrade deviation. To revisit at C-final if the content gate is enforced on roles.
- Request queued: benefits light-teal / light-green box colours (interim in hero.css).

## C-deliver archetype-listing — interrupted at the session boundary (2026-10-28)
- Runner answered stop (elapsed). The listing subagent had authored + pushed its blocks and started the /de/ratgeber deploy; its gate-all jobs and the prototype server were stopped by PID. Unit stays `running` in stardust/rollout/progress.json: the next session re-runs it (verify deploy ledger, then gate-all at 1440 + 360).
- Remaining C-deliver units: archetype-listing, archetype-landing, cluster-listing (rechtsportal), cluster-landing (de, Geschaeftskunden-Produkte, Produkte, Service), gate-all, final. migrate render phase is open (unit `program` done).

## C-deliver archetype-listing — /de/ratgeber live; same-browser 8.06% / 5.68%, content MISSING 0 (2026-10-28)
- Resumed: deploy ledger already live; gate-all needs the unit state file (`--state stardust/.work/rollout/archetype-listing/state.json`).
- Rows 19.48% / 30.17% were the capture-browser hyphenation asymmetry (origin headed Chrome, EDS Chromium); a Chromium origin shot gives 8.06% Δh 86 / 5.68% Δh 85 — documented overrides in gates/all-<w>/overrides.json.
- 3 missing tile links fixed in carousel.js (aria-label from title; label span display:none in reduced tiles, as live). Coverage de-ratgeber → deployed.

## C-deliver cluster-listing — /de/rechtsportal rendered (sibling tier) and live; same-browser 4.99% / 6.87% (2026-10-28)
- migrate render unit `listing`: rendered 1, unchanged 0, refused 0, passthrough 0; encoder `stardust/.work/deploy/probes/gen-listing-sibling.mjs`.
- Fix rounds: 3-col cards slider-always (Δh −952 at 360), carousel `plain` variant, promo headline-xs/-s; additive only. de-ratgeber re-gated unchanged.
- Gate rows 12.91% / 15.81% are the hyphenation asymmetry (override with Chromium origin evidence); residual Δh ~60–80 px = article-footer variant (frozen footer) → foundation request for C-final.

## C-deliver archetype-landing — home page live; 1440 4.18% / 360 9.56% PASS without override (2026-10-28)
- New blocks banner, ekomi; additive hero `landing` slots and carousel canon/stats/cta-text-link/articles variants; encoder `stardust/.work/deploy/probes/encode-landing.mjs` (paths file needs `/index`).
- Re-gated program + listing pages after the shared edits: unchanged (cyber 360 still 10.38% — prior hyphenation residual, needs same-browser override before C-final).
- Snapshots per dynamics plan: article teasers, eKomi quote; chat inert. Request queued: landing page layer section styles (stopgap in hero.css).

## C-deliver cluster-landing — 4 overview pages live; 2 rows fail at 360 after the 3-round cap (2026-10-28)
- migrate render unit `landing`: rendered 4, unchanged 0, refused 0, passthrough 0. /de delivered as its own doc (source redirects /de → /, logged as owner decision); the three product-shaped overview pages use the new encoder `encode-landing-product.mjs`.
- 1440: all pass (service via same-browser override 2.41%). 360: /de and /de/service pass (service override 8.39%); /de/produkte same-browser 10.06% (promo price 24 vs 28 px + centred wrap) and /de/geschaeftskunden-produkte same-browser 16.03% (check-list item width → 21 px wrap offset) remain FAIL.
- Next: C-final must fix those two 360 rows (promo price size; business check-list width) and add a same-browser override for cyber 360 (10.38%, hyphenation), then gate-all roster + done-check. New block `embed`; 2 foundation requests (product-page layer, YouTube auto-block).

## Migrate render — all sibling render units done: program 2, listing 1, landing 4 (2026-10-28)
- 7/7 siblings rendered at sibling tier after their archetype was live and gated; every render unit `rendered N, unchanged 0, refused 0, passthrough 0`.

## C-deliver final — 6/6 foundation requests applied; 1440 10/10 and 360 9/10 PASS, /de/produkte 360 font-wrap residual (2026-10-28)
- Foundation requests applied once: narrow / full-grid / landing page layers and section styles moved verbatim from hero.css + article-header.css into styles/styles.css § Page layers (pre-push A/B: 10 pages × 1440/360 pixel-identical, 0 px diff); benefits light colours into benefits.css; article footer = footer `note` role + `/footer-article` doc (metadata `footer` on /de/ratgeber, /de/rechtsportal; live); YouTube auto-block in buildAutoBlocks (authored embed kept).
- 360 fixes: /de/geschaeftskunden-produkte — section style `check-list-first` (first list = green check list) + narrow rich-text links brand/bold/underlined on every narrow page (live canon `.cmp-text.rt a`): same-browser 16.03 → 4.25 %. /de/produkte — the promo price is 28 px on both sides (measured); the 21 px Δh is one centred paragraph wrapping to 7 lines in FS Me vs 6 in the Fira Sans substitute → same-browser 10.06 % stays FAIL (font-substitute residual, no CSS cause).
- Re-gate (preview origin, eds re-shot): 1440 all PASS (3 via same-browser override, refreshed); 360 PASS 9/10 with overrides refreshed/added (geschaeftskunden 4.25 %, cyber 2.97 %, / 8.93 %); clip 0, MISSING/HIDDEN 0 everywhere; no regressions.
- Code commit 8d096dc on main; content redeployed + published: /footer-article, /de/geschaeftskunden-produkte, /de/ratgeber, /de/rechtsportal (ledger stardust/deploy/ledger-c-final.json).

## C-deliver gate-all — roster 10/10 delivered at 1440 and 360 on the published origin (2026-10-28)
- `gate-all.mjs --skip-existing` over the roster (state copy `stardust/.work/rollout/c-final/state.json`, which carries the deployed rows): 1440 7 PASS + 3 overrides; 360 3 PASS + 7 overrides; clip 0 and MISSING/HIDDEN 0 everywhere.
- Overrides: hyphenation capture asymmetry (same-browser numbers ≤ 8.93%) on 9 rows; /de/produkte 360 same-browser 10.06% kept as a documented licensed-font-substitution residual (FS Me → Fira Sans wraps one centred paragraph 7→6 lines).
- `update-coverage.mjs --gate` both widths: 10/10 rows `delivery.gate.pass` true, 0 flips. Foundation re-frozen after C-final's request application.

## Rollout D-site — redirects sheet live (7 rows), served sitemap 10 = assembled 10, / 200 (2026-10-28)
- `/redirects.json` sheet PUT to DA from `stardust/redirects.tsv`, previewed and published; `/de/Produkte` etc. answer 301 → the lowercase delivered path.
- Served `/sitemap.xml` lists exactly the 10 delivered pages; `assemble.mjs --verify-origin` reports 7 extra/7 missing only because coverage rows keep the source-cased path — mapped through redirects.tsv the sets are identical (checked by diff).
- Chrome docs (nav, footer, footer-article, nav/footer-geschaeftskunden) all serve `robots: noindex`; `curl -sIL /` ends 200; robots.txt is the platform default.

## Rollout D2-dynamic — dynamics-check 18/18 PASS on 10 live pages, martech all-off verified, no code change (2026-10-28)
- `stardust/dynamics/parity.json`: 24 feature rows, 17 checks (14 dom-count, 1 consent-gate, 1 video-plays, 1 no-page-errors) + the contract martech gate; 7 rows document their disposition without a check (article data, AEM plumbing, tooltips, locale, sign-in link-out, RUM, DAM) and the three martech rows point at the contract gate.
- Interactions replayed by probe at 1440/360: menu aria-expanded true → Escape false, drawer opens at 360, footer details 0 → 1 open, bAV accordion 1 → 2 expanded with panel shown, home article slider pages 3–5 then loops to 0–2; YouTube player requests www.youtube.com 200 (no googlevideo stream headless — recorded as environment limit).
- No query index: no delivered page lists or searches the corpus; the header search form hands off to ergo.de's results page (interim, named in the parity row). Gap recorded: info-i tooltips (row 13) are not authored/rendered on the 10 pages.
- Martech: `scripts/martech.js` served on the live origin byte-identical to the repo; contract consent.cmp / adobe-launch / google-tag-manager / aemMartech all `enabled: false`; gate check: no tag or CMP host requested, no realperson.de request on /de/service.

## Rollout E-full-site — 10/10 verified on the live origin (2026-10-28)
- Coverage rows carried the source-cased path; rewritten to the delivered lowercase path (source kept as `sourcePath`), so link integrity and the sitemap compare against what is served (`assemble --verify-origin` now ✓ 10 = 10).
- Two archetypes (`index.html`-style migrated sources) were fetched with a trailing slash by verify and 404'd; added `/de/ratgeber/` and the cyber trailing-slash path to the redirects sheet (9 rows, republished) — both 301 to the page.
- `verify.mjs --all`: 10 verified, 0 failed; every page `delivery.gate.pass` true at 1440 and 360. restoreAtDelivery entries (random article teasers, eKomi quote) are delivered as snapshots per the dynamics plan and replayed as dom-count rows in D2.

## Rollout E2-link-audit — 32 links localized, 0 internal 404s; out-of-scope targets point to ergo.de (2026-10-28)
- `localize-links.mjs` rewrote 32 absolute ergo.de links whose targets are delivered pages (8 docs: nav, footer, footer-article, nav/footer-geschaeftskunden, index, ratgeber, rechtsportal) to root-relative; redeployed and published (deploy-batch 8/8 live).
- Every root-relative href on the 10 pages and 5 chrome docs answers 200 on aem.live; verify.mjs 10/10 verified.
- ~238 targets outside the 10-page scope stay absolute to www.ergo.de — scope-extension decision recorded in direction.md.

## Rollout F-optimize — gate clear: 0 P1, 11 P2, 1 P3 (2026-10-28)
- `optimize.mjs --all` on aem.live: health 43/100 (automated layers only; judgment layers not assessed), 0 open P1 → gate passes.
- P2 ×10 `ai-search/jsonld`: the source pages carry JSON-LD the delivered pages lack (platform-migration fix → G-aem).
- P2/P3 cross-page: /de and / share title + description — mirrors the source (/de redirects to / there); upstream, kept as captured.

## Rollout G-aem — source JSON-LD carried over on 10/10 pages; health 43 → 93 (2026-10-28)
- `autofix-aem --dry-run`: 11 candidates, all `manual` (JSON-LD placement, title disambiguation) — nothing auto-applied (aggressive content drafts would break the replica's verbatim-content rule).
- Source JSON-LD (WebSite/WebPage/Organization/Article/FAQPage graphs, service VideoObject) carried over verbatim as a `json-ld` page-metadata row (`stardust/.work/rollout/jsonld-metadata.mjs`); the EDS pipeline renders it as `<script type="application/ld+json">` — parsed OK on the live origin. Also fixed a double-escaped `&amp;amp;` in the /de/produkte title.
- 10 pages redeployed and published; verify 10/10; optimize 0 P1, 10 P2 fixed, open: duplicate title/description /de = / (mirrors the source, where /de redirects to /; owner decision logged in the conversion log).

## Rollout H-report — report written: 10/10 verified, 12/12 blocks, health 93, 4 learnings (2026-10-28)
- `stardust/rollout/report.md`: summary block, pixel-table line, overrides and open owner decisions, D2 dynamic parity table.
- Coverage: the three listing blocks (article-header, breadcrumb, ccw) recorded deployed (they had shipped in archetype-listing).
- `stardust/learnings.md`: 4 pending entries (source-cased coverage paths, verify trailing slash, hyphenation capture asymmetry, JSON-LD dropped by encoders).

## Rollout I-dashboard — dashboard written; header parity re-compared on the live host (2026-10-28)
- `dashboard.mjs`: 10 pages identified/prototyped/deployed, 8 optimised (/ and /de carry the shared-title finding).
- Header contract re-explored on aem.live (root `header .headerNavigation`, the fixed bar ↔ source `#MainNavi`): 16 errors, the same set C0 named — 15 open-state panel crops 2–6 % (identical geometry; substitute-font glyph texture) and the ergo.de search typeahead. Both clear only by a site-owner decision; proposals written unsigned to `stardust/chrome/header-decisions.json`.
- Coverage: the two `index.html`-shaped rows keep their file as `source.migratedFile` so the live probe asks the leaf URL (no trailing slash).

## Replica handoff — complete: 10/10 pages live on aem.live, gated at 1440 and 360 (2026-10-28)
- Phase 5 closed: migrate (3 archetypes + 7 siblings), C-deliver (foundation, 3 archetype + 3 cluster units, final, gate-all), rollout D–I. state.json: 10 pages `migrated`.
- Runner done-check: complete, no gaps. Owner decisions handed over: martech parts (all carried disabled), licensed fonts (substitutes in place; header panel texture and /de/produkte 360 residual clear with them), search typeahead, /de page vs redirect to /.
