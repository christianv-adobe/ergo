# Rollout report — https://www.ergo.de/ → aem-eds (2026-10-28)

```
rollout — https://www.ergo.de/ → aem-eds
==================================================
Pages       10 total · 10 verified · 0 deployed · 0 pending · 0 content-pending · 0 stale · 0 failed
Templates   3 (landing 5/5 · listing 2/2 · program 3/3 delivered)
Blocks      12 total · 12 deployed · 0 pending
Quality     health 93/100 · open P1 0 / P2 1 / P3 1
Pixel table prototypes 3/3 PASS · deployed 1440 10/10 delivered (pixel-only 7/10, 3 documented overrides) · 360 10/10 delivered (pixel-only 3/10, 7 documented overrides) — gates/{prototypes,all}-{1440,360}/summary.md
To deliver  — (none)
Content     0 pages awaiting content
```

Live origin: https://main--856f1bba--aemcoder.aem.live/ (published). Redirects sheet: 9 rows (source-cased paths → delivered lowercase, plus two trailing-slash rows).

Overrides (documented in `stardust/replica/gates/all-<w>/overrides.json`): capture-browser hyphenation asymmetry (same-browser ≤ 8.93 %), and one licensed-font-substitution residual — /de/produkte at 360, same-browser 10.06 % (FS Me → Fira Sans wraps one centred paragraph 7 → 6 lines; resolves when the licensed face is dropped in).

Open findings: /de and / share title and description — mirrors the source (where /de redirects to /); owner decision.

Owner decisions open: turn on martech contract parts (all carried over disabled — `stardust/martech-handoff.md`); /de as page vs redirect to /; licensed FS Me / brand serif fonts to replace the metric-matched substitutes; header search currently sends to ergo.de results.

## Dynamic parity (D2)

# Dynamics parity check — https://main--856f1bba--aemcoder.aem.live — 2026-10-28T23:16:24.816Z

Replayed 18 checks over 25 features · pass 18 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| header mega-menu flyouts + mobile drawer | M | done | dom-count | PASS | 5 × header .headerNavigation__button[aria-expanded] (min 5) |  |
| header mega-menu flyouts + mobile drawer | M | done | dom-count | PASS | 4 × header .headerNavigation__button[aria-expanded] (min 4) |  |
| header search overlay + suggestions; results page | S | interim | dom-count | PASS | 1 × header form.cmp-search__form[role=search] input[name=search] (min 1) |  |
| footer link columns collapse to accordions (mobile) | M | done | dom-count | PASS | 4 × footer details > summary (min 4) |  |
| content accordions (FAQ / coverage detail) | M | done | dom-count | PASS | 20 × .accordion .accordion-toggle[aria-controls][aria-expanded] (min 20) |  |
| content accordions (FAQ / coverage detail) | M | done | dom-count | PASS | 8 × .accordion .accordion-toggle[aria-controls][aria-expanded] (min 8) |  |
| splide-style carousels (arrows, dots, loop, drag) | M | done | dom-count | PASS | 7 × .carousel .carousel-control.next (min 7) |  |
| splide-style carousels (arrows, dots, loop, drag) | M | done | dom-count | PASS | 12 × .carousel .carousel-control.next (min 12) |  |
| Ratgeber article teaser rail | L | interim | dom-count | PASS | 6 × .carousel.articles .slide:not(.slide-clone) (min 6) |  |
| product / topic teaser carousels | L | interim | dom-count | PASS | 33 × .carousel.cards .slide:not(.slide-clone) (min 33) |  |
| client-rendered price/CTA promo slots | CR | done | dom-count | PASS | 13 × .promo (min 13) |  |
| client-rendered column-control content | CR | done | dom-count | PASS | 1 × .ccw (min 1) |  |
| eKomi review quote / rating band | D | done | dom-count | PASS | 1 × .ekomi (min 1) |  |
| tariff comparison table | static | done | dom-count | PASS | 30 × .product-table [role=row] (min 30) |  |
| Realperson live chat | T | scaffolded-awaiting-owner | consent-gate | PASS | no request to 1 gated host pattern(s) before consent |  |
| YouTube player (embed block, /de/service) | M | done | video-plays | PASS | iframe/video: true · no <video> · playback requests 8 (ok) | www.youtube.com:200×7 fonts.gstatic.com:200×2 googleads.g.doubleclick.net:302×1 static.doubleclick.net:200×1 googleads.g.doubleclick.net:200×1 www.google.com:200×1 yt3.ggpht.com:200×1 www.gstatic.com:200×1 i.ytimg.com:200×1 www.youtube.com:204×1 jnn-pa.googleapis.com:200×1 |
| no uncaught exceptions on delivered pages | — | done | no-page-errors | PASS | none on 10 page(s) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (4 gated · 0 cross-site host(s) blocked) |  |

## Features without checks

- article teaser data (image, date, category) (D) — interim · owner: ASSUMPTION A1 — snapshot ships with the index-driven rail
- AEM 6 CSRF / Granite / ContextHub (A/D) — done
- info-i tooltips on price teasers / product table (M) — pending rollout · owner: gap: the source info-i popovers were not carried into the delivered documents; needs content + a tooltip affordance in a later round
- single de locale tree (I18N) — interim · owner: ASSUMPTION A3: one de tree
- Log-in / registration → kunde-s.ergo.de (X) — interim · owner: ASSUMPTION A4: portal auth stays on kunde-s.ergo.de
- RUM sampling (T) — done
- DAM image host assets.ergo.com (static) — done
- OneTrust CMP (T) — scaffolded-awaiting-owner · owner: DECISION D2: enable consent.cmp on the new host
- Adobe Launch / Web SDK (T) — scaffolded-awaiting-owner · owner: DECISION D3: enable route + rewrite 18 rules / 5 data elements
- Google gtag AW-980528457 (T) — scaffolded-awaiting-owner · owner: DECISION D3
