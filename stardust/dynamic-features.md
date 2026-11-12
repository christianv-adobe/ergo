# Dynamic features — www.ergo.de (replica, Phase 2 preserve-direction)

Source: `stardust/current/_dynamics.json` (dynamics-detect on `/`, `/de/Ratgeber`,
`/de/Geschaeftskunden-Produkte/Cyber-Versicherung-fuer-Unternehmen`; reach from 10/10 crawled pages) ·
draft `stardust/dynamics/dynamic-features.generated-plan.md` (39 rows, target probe
`main--856f1bba--aemcoder.aem.page`) · header contract `stardust/chrome/header-contract.json` ·
martech `stardust/martech/` → `stardust/martech-contract.json`. Hands-off run: every non-`self` decision
is a named assumption below; nothing is `decided-out`. Static recreation continues regardless.

Curation: 39 draft rows → 22 rows. Merged: chrome trigger rows into `chrome-menu`; the search form into
`chrome-search`; 6 `articledata.json` + `articleteaserdata.json` into `d-article-data`; CSRF / Granite / CQ /
segmentation into `aem-plumbing`; 13 tag rows into the four martech rows (every host below is loaded by
Launch rule custom code or gtag — `stardust/martech/rc/`). Reclassified: `www.google.com` (A → T, Google Ads
`ccm/collect` + `rmkt/collect`), `assets.ergo.com` (T → static DAM image host), `chat12.realperson.de`
(A → T chat embed). Added from the captures: content accordions, carousel interaction, tooltips, footer
accordion, product tariff table.

## Listings contract

- **Ratgeber articles** (`/de/Ratgeber/**`): each article page emits `<meta name="title">`, `description`,
  `image`, `category` (Zahngesundheit, Gesundheit, …), `published-date`. Read by the article teaser rail
  (`l-article-teaser-rail`) once `helix-query.yaml` indexes `/de/Ratgeber/**` (listings.md). Until then the
  rail is document-first authored rows.
- **Product teaser carousels**: editorially curated — no index (authored rows).
- Search index: `/query-index.json` over all migrated pages (`title`, `description`, `image`, `path`,
  `category` for the facet labels Produkte / Services / Ratgeber / Rechtsportal / Geschäftskunden).

## Features

| # | id | feature | class | reach | disposition | target | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chrome-menu | header mega-menu flyouts (Versicherungen & Finanzen / Produkte für Geschäftskunden, Service, Kontakt) + mobile drawer "Menü" with sub-levels (Zahn, Gesundheit, Hausrat & Gebäude, …) | M | 3/3 (164 triggers on 10/10) | rebuild-native | runtime | self | pending | chrome-interaction | none — header contract is the spec | `aria-haspopup` toggles `#MainNavi-navigation-item-*>button`; header-contract.json 1440/390 |
| 2 | chrome-search | header search overlay (`Suche`) with suggestions list + results page with category facets (Gesamt / Produkte / Services / Ratgeber / …) | S | header 3/3, form 2/3 | index-backed | widget | self | pending | search-index-backed | none — corpus = migrated pages; header form must not point at `ergo.de/…/suchergebnisse` | `cmp-search__form` → `/content/ergo/…/sonstige/suchergebnisse`; probe "Zahnzusatzversicherung" = 28 results (`stardust/dynamics/search-probes.json`) |
| 3 | footer-accordion | footer link columns collapse to accordions at mobile | M | 3/3 | rebuild-native | runtime | self | pending | chrome-interaction | none | `footerAccordion cmp-accordion` ×3–4 per page |
| 4 | content-accordion | content accordions (Cyber: 7 accordions, 12 items, h1-styled titles; FAQ / coverage detail) | M | 1/3 (program type) | rebuild-native | block | self | pending | disclosure | none | `cmp-accordion__item/__panel` in program archetype |
| 5 | carousel-interaction | splide carousels: arrows, pagination dots, loop, drag; 2/3-col homogeneous card tracks | M | 3/3 | rebuild-native | block | self | pending | carousel | none | `splide cmp-carousel__container has-*-cols-*` (home 7, Ratgeber 9+, Cyber 3) |
| 6 | l-article-teaser-rail | Ratgeber article teaser rail (18 dated cards) | L | 2/3 | index-backed | block | needs-business-decision | interim | listing-index-backed | ASSUMPTION A1: ship document-first authored rows now; index top-up when owner confirms index-driven | `splide__list` 18 cards hasDate; fed by `articleteaserdata.json` |
| 7 | l-product-carousels | product / topic teaser carousels (8, 13, 3-card splide tracks; 6-card `ul` grid on Ratgeber) | L | 2/3 | static-snapshot | block | needs-business-decision | interim | listing-index-backed | ASSUMPTION A2: undecided — revisit at rollout; authored rows (editorial), unfreeze if owner wants index-driven | `splide__list` 8/13/3, `ul` 6 |
| 8 | cr-promo-placeholder | client-rendered price/CTA promo slots ("Ab 12,17 € monatlich Jetzt informieren", "Unwetterschaden melden") | CR | 3/3 | static-snapshot | content | self | pending | settled-dom-snapshot | none — settled text captured (not blank); unfreeze when a price feed is provided | `cmp-promo__placeholder` ×5 / ×12 / ×1 |
| 9 | cr-ccw-placeholder | client-rendered column-control content (Ratgeber intro + topic list; Cyber tariff highlights, prevention download) | CR | 2/3 | static-snapshot | content | self | pending | settled-dom-snapshot | none — settled text captured | `ccw__column__placeholder` |
| 10 | d-reviews-quotes | customer review quotes / eKomi rating band | D | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync (snapshot) | none — snapshot to `data/reviews/quotes.json` + `_provenance.json`; review text authored in the document | GET `…/jcr:content/root/ekomireact.quotes.json` 200 · **host-bound (404 on target)** |
| 11 | d-article-data | article teaser data (`articleteaserdata.json`, 6× `articledata.json`: image, date, category) | D | 1/3 (reach ≤2/10 each) | data-fed | content | self | pending | sheet-sync (snapshot) | none — non-text fields only; text stays authored (row 6) | 7 GETs 200 on source · **host-bound (404 on target)** |
| 12 | aem-plumbing | AEM 6 runtime plumbing: CSRF token, `Granite`/`CQ` globals, ContextHub segmentation / `stores.init.js` | A/D | 3/3 (10/10) | static-snapshot | — | self | pending | read-settings | none — undecided — revisit at rollout: no consumer on the static pages, nothing ships | GET `/libs/granite/csrf/token.json` (host-bound), `/etc/segmentation.segment.js` |
| 13 | tooltips | info-i tooltips on price teasers / product table | M | 3/3 | rebuild-native | block | self | pending | disclosure | none | `tooltip medium` / `tooltip auto` |
| 14 | product-table | tariff comparison table (2 tariff columns, 27 rows, check marks) | — (static) | 1/3 | static-snapshot | block | self | pending | — | none — static content, no network | `productTable__table` on Cyber |
| 15 | i18n-locale | single locale tree `de` (`/de` 301 → `/`) | I18N | 1/3 | rebuild-native | runtime | needs-business-decision | interim | locale-tree | ASSUMPTION A3: one `de` tree at `/`; other ERGO locales out of the 10-page scope | hreflang de only |
| 16 | x-sign-in | "Log-in" / registration links to the customer portal `kunde-s.ergo.de` | X | 2/3 + header | static-snapshot | content | needs-backend | interim | link-out | ASSUMPTION A4: keep absolute links to the authenticated portal (no auth on EDS); owner confirms | header-contract `#MainNavi-action-item-login` |
| 17 | rum | Operational telemetry `rum.hlx.page` (source already samples RUM) | T | 3/3 | rebuild-native | runtime | self | pending | — | none — ships with `scripts/aem.js` sampleRUM | rum.hlx.page |
| 18 | dam-assets | DAM image/logo host `assets.ergo.com` | — (static) | 3/3 | static-snapshot | content | self | pending | — | none — images rehosted at deploy (media), logos inline | `assets.ergo.com/content/dam/…` |
| 19 | chat-realperson | Realperson live-chat status button + chat module | T | 2/3 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | DECISION D1: chat account + domain allowlist for the new host; OneTrust category `E0030` | `#RealpersonChatStatusButton`, `chat12.realperson.de/system/scripts/loadchatmodul.js`, `/api/embed/config` |
| 20 | martech-onetrust | OneTrust CMP + preference-centre dialog "Einstellungen zum Datenschutz" | T | 3/3 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | DECISION D2: reuse domain script on the new host — contract `consent.cmp` **disabled** | `cdn.cookielaw.org`, data-domain-script `2e444b6c-…a79b`, model `per-tag` |
| 21 | martech-launch | Adobe Launch property (Adobe Analytics / Web SDK `edge.adobedc.net`, ACDL `dataLayer`, emarsys, CND Motion Media, Spoteffects, Taboola, Outbrain, Facebook, Bing via rule custom code) | T | 3/3 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | DECISION D3: enable route + rewrite 18 rules / 5 data elements — route `adobe-launch` **disabled**; `aemMartech` **disabled** | `launch-EN641c…min.js`, 114 rules, 347 data elements |
| 22 | martech-gtag | Google gtag `AW-980528457` (Ads conversion/remarketing, `www.google.com/ccm`, adservice, Floodlight iframe) | T | 3/3 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | DECISION D3 — route `google-tag-manager` **disabled** | `googletagmanager.com/gtag/js?id=AW-980528457`, `10334510.fls.doubleclick.net` |

## Decision batch (one message to the owner — recorded, not asked; hands-off)

- **Business decisions (interim shipped):** A1 article rail index-driven vs curated (row 6) · A2 product
  carousels index-driven vs curated (row 7) · A3 locale scope (row 15).
- **Backend:** A4 customer portal auth stays on `kunde-s.ergo.de` (row 16).
- **Martech (owner decided to keep source tags/consent; every part scaffolded OFF):** D2 enable OneTrust
  `consent.cmp` · D3 enable `adobe-launch` and/or `google-tag-manager` routes, optionally `aemMartech`
  (Web SDK, orgId `1D3511B55605198B7F000101@AdobeOrg`, datastream `a91a67cc-…f`), rewrite the 18 Launch
  rules / 5 data elements listed in `stardust/martech-handoff.md`, add the collector CNAME / CSP for the new
  host. Rows 20–22.
- **Chat:** D1 Realperson account allowlist for the new host (row 19).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| — | none (hands-off run: no owner statement, no hard blocker) | — |
