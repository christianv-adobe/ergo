<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-28T16:33:28.844Z · input stardust/current/_dynamics.json (3 pages, 39 findings) · target probe https://main--856f1bba--aemcoder.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 3/3 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 3/3 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 3 | a-cms-app-settings-object-granite | A | CMS / app settings object Granite | 3/3 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 3/3 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 5 | a-unknown-third-party-host-chat12-realperson-de | A | unknown third-party host chat12.realperson.de | 2/3 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 6 | cr-client-rendered-slot-cmp-promo-placeholder | CR | client-rendered slot cmp-promo__placeholder | 3/3 | static-snapshot | content | self | delivered-by-capture | settled-dom-snapshot | inspect the consumer | output already carries "Komm in die ERGO Fast Lane!" |
| 7 | cr-client-rendered-slot-ccw-column-placeholder | CR | client-rendered slot ccw__column__placeholder | 2/3 | static-snapshot | content | self | delivered-by-capture | settled-dom-snapshot | inspect the consumer | output already carries "Ihr Leben ist in Bewegung: Entscheidunge" |
| 8 | d-first-party-data-file-get-libs-granite-csrf-token-json | D | first-party data file GET /libs/granite/csrf/token.json | 3/3 (reach 10/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 9 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/jcr:content/root/ekomireact.quotes.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 10 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/jcr:content/root/articleteasercarouse.articleteaserdata.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/zahngesundheit/weisheitszaehne/jcr:content.articledata.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/zahngesundheit/Wurzelbehandlung/jcr:content.articledata.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 13 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/zahngesundheit/fissurenversiegelung/jcr:content.articledata.json | 1/3 (reach 1/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 14 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/gesundheit/amalgam/jcr:content.articledata.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 15 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/zahngesundheit/professionelle_zahnreinigung/jcr:content.articledata.json | 1/3 (reach 2/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 16 | d-first-party-data-file-get-content-ergo-ergo-one-ergo-one-p | D | first-party data file GET /content/ergo/ergo-one/ergo-one-portal/de/Ratgeber/zahngesundheit/zahnpflege-zahnerhalt/mundfaeule/jcr:content.articledata.json | 1/3 (reach 1/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 17 | i18n-locale-variants-de-de-de-de-de | I18N | locale variants de,de,de,de,de | 1/3 | rebuild-native | runtime | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://www.ergo.de/de" |
| 18 | l-listing-candidate-splide-list-18-cards | L | listing candidate splide__list (18 cards) | 2/3 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 19 | l-listing-candidate-splide-list-8-cards | L | listing candidate splide__list (8 cards) | 1/3 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 20 | l-listing-candidate-ul-6-cards | L | listing candidate ul (6 cards) | 1/3 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 21 | l-listing-candidate-splide-list-13-cards | L | listing candidate splide__list (13 cards) | 1/3 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 22 | m-modal-trigger-aria-haspopup-chrome-only-button-content | M | modal trigger aria-haspopup (chrome only) → button:content | 3/3 (reach 164/10) | rebuild-native | runtime | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "Service" |
| 23 | s-site-search-form-content-ergo-ergo-one-ergo-one-portal-de- | S | site search form → /content/ergo/ergo-one/ergo-one-portal/de/sonstige/suchergebnisse | 2/3 (reach 0/10) | index-backed | widget | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 24 | t-consent-onetrust | T | consent: OneTrust | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 25 | t-unknown-third-party-host-rum-hlx-page | T | unknown third-party host rum.hlx.page | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-unknown-third-party-host-assets-ergo-com | T | unknown third-party host assets.ergo.com | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-unknown-third-party-host-cdn-scarabresearch-com | T | unknown third-party host cdn.scarabresearch.com | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 3/3 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.facebook.com" |
| 33 | t-unknown-third-party-host-adservice-google-com | T | unknown third-party host adservice.google.com | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 34 | t-unknown-third-party-host-server-cnd-motionmedia-de | T | unknown third-party host server.cnd-motionmedia.de | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 35 | t-unknown-third-party-host-trck-spoteffects-net | T | unknown third-party host trck.spoteffects.net | 3/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 36 | t-unknown-third-party-host-trck-ipv6-spoteffects-net | T | unknown third-party host trck-ipv6.spoteffects.net | 1/3 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 37 | x-sign-in-account-links | X | sign-in / account links | 2/3 | decided-out | — | needs-backend | delivered-by-capture | decided-out | auth / commerce on the new host? | output already carries "https://kunde-s.ergo.de/meineversicherun" |
| 38 | chrome-menu | M | header menu: Menü, Versicherungen & Finanzen, Service, Kontakt (chrome only) | 1/1 | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 39 | chrome-search | S | header search: Suche (chrome only) | 1/1 | index-backed | widget | self | pending | search-index-backed | none (results from the query index; overlay and typeahead per the contract) |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 15 row(s) — read-settings, sheet-sync, search-index-backed, chrome-interaction.
- **One owner decision batch:** 18 row(s) — inspect the XHR, add a vendor row · index-driven or editorially curated? · CMP domain script reuse on the new host · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 6 row(s) — no work.
- **Host-bound on the target:** 9 of 2 probed API paths — the off-origin data work.
- **Martech:** OneTrust · 0/2 route(s) enabled by the owner — `stardust/martech-handoff.md`.

## Phases

- **tags** — 13
- **data** — 9
- **detect** — 5
- **listings** — 4
- **interactive** — 3
- **capture** — 2
- **locale wave** — 1
- **search** — 1
- **register** — 1
