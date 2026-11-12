# EDS conversion log — www.ergo.de replica

## Publish decision (2026-10-28)
Decision (made by the run owner before the run): **publish**. Every delivered page, the redirects sheet and the chrome documents (nav, footer and their locale variants) go live on the aem.live origin (deploy-batch.mjs without --no-publish, or POST admin.hlx.page/live/…).

## Foundation (C0)

Written by the C0 foundation subagent, 2026-10-28. Runtime facts: `stardust/runtime-contract.json`
(vanilla aem-boilerplate; `p.button-wrapper`, formatted-only buttonization; this aem.js has NO
client-side section-metadata — section styles are rendered by the delivery pipeline).

**Section styles (section-metadata `Style`)** — verified on the preview: a multi-value
`Style: bg-yellow, sp-s, sp-tb` was delivered as all three classes on the section div, so the
canon's split vocabulary works; compound single tokens are also defined as a fallback.
| canon (prototype `.col …`) | EDS `Style` value(s) | effect |
|---|---|---|
| `sp-s/m/l/xl` | `sp-m` | padding-bottom 8/24/40/56 px (12/–/48/64 from 480) |
| `sp-m sp-top` | `sp-m, sp-top` (or `sp-m-top`) | padding-top only |
| `sp-m sp-tb` | `sp-m, sp-tb` (or `sp-m-tb`) | top + bottom |
| `minh` | `minh` | min-height 24px |
| `bg-yellow|orange|magenta|green|blue|warmgrey` (+`bleed`) | `bg-magenta` | section background, full width by construction (no border-image needed) |
| `pos-center` | `pos-center` | centres CTAs (`--cta-margin-inline: auto`) |
| full-bleed module | `full-bleed` | removes the column cap on the section's wrappers |
Container model: `:where(main > .section) > div` = `width: min(1256px, 100% - 24px)` + 12px
inline padding (canon `.col`), at specificity (0,0,1) so any `.x-wrapper` rule escapes it.
Header is in flow (`body > header` reserves `--nav-height` = `--header-height` 73 / 97 px from
1152) with the bar `position: fixed` inside it — pages need NO `margin-top` on main.
`main` has `padding-bottom: 24px`, `body > footer` `margin-bottom: 24px` (canon).

**Type** — canon base kept verbatim: `p, h1–h6` margin 0, headings `font: inherit`, `ul` reset
(no bullets), `a { color: inherit }`, `* { hyphens: auto }`. Utilities `.txt-h1/.txt-h2/.txt-h4/
.txt-eyebrow/.txt-caption/.cmp-text/.color--red/.serif` live in styles.css. Default content gets
the ramp: `p` = cmp-text p (14/21 → 16/24 at 768), `h1` = txt-h1, `h2` = txt-h2 (serif), `h3–h6`
= txt-h4. Blocks needing other type set it on their own wrappers.

**Fonts** — licensed FS Me / Fedra Serif kits are NOT rehosted. `fonts/` ships the gated OFL
substitutes (Fira Sans 400/700, Noto Serif 400/700) declared in `styles/fonts.css` as
`"FS Me Substitute"` / `"Fedra Serif Substitute"` with the canon size-adjust/ascent/descent values
(99 / 102.1 / 103.7 / 104.5 %). Stacks (`--ff-sans`, `--ff-serif`): brand family first,
substitute second, then local metric fallbacks `fs-me-fallback` (Arial, size-adjust 98.7 %) and
`fedra-serif-fallback` (Times, 120.7 %) in styles.css. `font-display: swap`. Roboto removed;
no font loads in head.html.

**Buttons** — canon `.cmp-cta` painted onto the EDS convention:
`<strong><a>` → `a.button.primary` = cmp-cta default (brand fill);
`<em><a>` → `a.button.secondary` = cmp-cta secondary (brand outline);
`<strong><em><a>` → `a.button.accent` = cmp-cta **tertiary** (grey outline, the most used variant).
The anchor only READS `--cta-*` vars; blocks put a wrapper `div.cmp-cta` with the canon
modifiers around the moved CTA `<p>` (`w-33 | w-50 | w-100 | size-auto | size-large |
primary | secondary | tertiary | text-link | icon-left | ic-chevron | ic-calculator |
ic-headset`) — a wrapper always wins over the authored emphasis (EW3-safe: no class on the
anchor). Mobile width default 100 %, `fit-content` from 912 (`--cta-width` / `--cta-width-l`).
Edit-mode repaint (`.prosemirror-editor`) shipped. Promo/tile/price/carousel/teaser canon
rules are NOT in styles.css — archetype blocks lift them into their own block CSS.

**Chrome documents** (all carry metadata `Robots | noindex`; published live):
`/nav`, `/footer` (private customers, default) and `/nav-geschaeftskunden`,
`/footer-geschaeftskunden` (business chrome) — pages under /de/Geschaeftskunden-Produkte set page
metadata `nav: /nav-geschaeftskunden` and `footer: /footer-geschaeftskunden`.
Nav sections by `Style`: `brand` (logo link `:ergo-logo-small: :ergo-logo:` + skip link),
`tools` (bar controls; bold link = also shown below 1152; `:search:` item = search toggle;
`:burger-menu:` item = drawer toggle; `tel:` link = phone), `search`, `menu` (nested lists),
`tiles` × one per top-level item, `drawer`. Footer: `columns`, `ribbon`, `copyright`.
Generated from the gated prototype chrome by `stardust/.work/deploy/probes/gen-chrome-docs.py`
(labels/hrefs/order verbatim; root-relative prototype hrefs authored as absolute
`https://www.ergo.de/…` so `localize-links.mjs` rewrites them once the target page is
delivered — re-run it over the whole tree and re-deploy the chrome docs after cluster waves;
the logo links to `/`). Icons and logos are code-origin `icons/*.svg`.
Decode tier: template-slotted (header/footer blocks build the prototype chrome DOM and move the
authored nodes in); `@ew-exempt` chrome fragment (never instrumented by the workspace).
Header behaviour per `stardust/chrome/header-contract.json` (click/Enter flyouts — the source
records no hover opening; search overlay; drawer drill-down; Escape / backdrop / Schließen close
with focus return; fixed bar, no scroll morph).

**Favicon** — `favicon.ico` = the site's 32×32 icon (PNG-in-ICO); head.html untouched.
**Lint** — `.stylelintrc.json` allows the source BEM class names (`block__el--mod`) in header,
footer and styles.css and turns off `no-descending-specificity` for the two chrome blocks;
`.eslintignore` skips `stardust/` and `content/` (tooling/content, not runtime). No
`DESIGN.json extensions.breakpoints.target` is set, so no `lint:breakpoints` script was added.

**Header contract fixes beyond the prototype (C0 parity rounds, evidence `stardust/chrome/header-parity.json`)**:
the gated prototype rendered all flyout tiles alike; live (`stardust/current/pages/index.html`) shows tile 1 on a
colour ground (V&F `#ccecef`, Service/Kontakt `#f5e1eb`) and tile 2 "reduced" (icon left, arrow, CTA named by
its aria-label). Authored as tiles-section styles `tiles, tile-1-blue|magenta, tile-2-reduced` and the CTA
link `title` (→ aria-label). Also from the contract: page scroll locked while a panel is open, 50 ms opacity
fade on open, keyboard-open moves focus into the panel, desktop flyout spans to the viewport bottom (a click on
its empty area closes it), drawer level heads left-aligned. Business chrome tiles keep the prototype form
(no business-page contract recorded).
Named residuals: (1) search typeahead — live shows API suggestions while typing; backend data, dynamics plan
Phase C (`/de/sonstige/suchergebnisse` results + query index); the form submits there today. (2) open-state crop
texture 2–7 % on sub-level lists — glyph shapes of the OFL substitute vs the licensed FS Me (same geometry,
same line boxes).

## archetype-program — /de/geschaeftskunden-produkte/cyber-versicherung-fuer-unternehmen (2026-10-28)

Source `/de/Geschaeftskunden-Produkte/Cyber-Versicherung-fuer-Unternehmen` (redirect in `stardust/redirects.tsv`);
schema `stardust/eds-schema/de-geschaeftskunden-produkte-cyber-versicherung-fuer-unternehmen.json` (prototype copy
with `data-section` per `.col`: `stardust/.work/deploy/probes/proto-sections.mjs`). Page metadata: business chrome
(`nav`/`footer` = `-geschaeftskunden`), `Theme: narrow` (888 column), og `Image` = hero image.
New blocks (all kebab-case DOM, canon CSS lifted from program.css / modules.css / canon.css):
| block | tier | variants (block classes) | notes |
|---|---|---|---|
| hero | template-slotted | `product` · `yellow`/`orange` · `image-right` | replaces the boilerplate hero; image/h1/title/CTAs classified by content |
| benefits | reconstructive (item = heading) | `frame`/`box` · `grey green teal magenta orange yellow` · `flag-center/right` | flag = text before first item; icon = `:name:` paragraph before the item heading |
| accordion | reconstructive (row = item) | `open-first` | EW7: title in div.accordion-title, chevron-only button; a row with an EMPTY panel cell adopts the next block of the same section (product-table, promo, carousel nest in panels without nested tables) |
| cta | template-slotted | the cmp-cta modifiers (`w-33 size-auto …`) | block element itself becomes the `div.cmp-cta` wrapper; centring via section style `pos-center` |
| product-table | reconstructive (row = table row) | `label-4/label-6` · header colour · `sticky` | single-cell heading row = group sub-heading; header row = last multi-cell row before the first sub-heading/icon row; `is-pinned` while stuck (motion) |
| promo | reconstructive (card = heading) | colour · `image-left` · `hide-image-mobile` · `center` | flag/image before the heading belong to the card; ≥2 cards lay out as ccw halves |
| carousel | reconstructive (slide = heading) | `cols-m-*/cols-l-*` · `slider-always/slider-mobile` · `slide-pad` · `reduced-mobile/-desktop` | slide kinds: download card (linked heading + `Label<ul><li>value` list, dt labels/file name hidden as on source), tile (icon/heading/text/CTA); slider = arrows, dots, loop clones (EW4 stripped), drag |
Decisions: headline-like `<p>`s of the source (benefit/tile titles, promo headlines, table column heads) are authored
as headings (ROLE UPGRADE, same look). Section `sp-xl sp-top` spacer before "Wissenswertes" folded into that section's
`sp-xl-top`. Trailing `<br>` in "Wissenswertes im Überblick" dropped. davids-model D1 (prose-only blocks) accepted: each is a
canon component with its own frame/grid; D3 (product-table 3/1 cells) is the group sub-heading row by design.
Page-layer rules for `Theme: narrow` (column, rich-text default content, `ta-c`, `scroll-top`) live in hero.css as a
stopgap — foundation request filed. Icons added to `icons/`: check, compass, download, edit, house-ground, mail, man.
Gate (preview origin, 3 rounds): 1440 PASS 8.32 % Δh 90 · 360 FAIL 10.38 % Δh 102 (pixel only; clip 0, content
MISSING 0 / HIDDEN 0). Round fixes: accordion panels closed with `hidden="until-found"` (content-visibility, native
`<details>` parity — display:none read as MISSING), spacer `<p>&nbsp;</p>` dropped by the pipeline compensated with
`sp-m-tb`, green check lists (`check-list` section style / accordion variant, live `check-list--green`), centred table
header text. Residual cause (360): instrument asymmetry — gate-all stitches the origin in headed real Chrome (no German
hyphenation dictionary) and the EDS page in bundled Chromium (hyphenates); in the same browser live and EDS hero title
heights match (Chrome 156/156 px, Chromium 104/104 px), so every narrow-column paragraph re-wraps in the diff only.
Komfort promo text's trailing `<br><br><br>&nbsp;` is also dropped by the pipeline (closed panel, not visible at rest).

## cluster-program — /de/geschaeftskunden-produkte/betriebliche-altersversorgung, /de/geschaeftskunden-produkte/dienstreiseversicherung (2026-10-28)

Siblings of archetype-program, encoded by `stardust/.work/deploy/probes/encode-program-sibling.mjs` (prototype →
archetype content shape: section styles from `.col` classes, spacer columns folded into the next section, a trailing
`<p>&nbsp;</p>` line compensated sp-m-top→sp-m-tb as on the archetype). Variance probe:
`stardust/rollout/units/cluster-program-variance.json` (content-driven deltas only). No new blocks; additive variants:
product-table `left` (source tariff-alignment-left) + list styling in cells; accordion prose panels style `h3`
sub-headings and full-width panel images (the bAV panels' three diagram images were dropped by the prototype
renderer and restored from the capture); benefits `light-teal` / `light-green` box colours (stopgap in hero.css,
foundation request filed — benefits is owned by the listing unit). New icon `icons/risk.svg` (RiskIcon).
Deviations (closed panels only): accordion `check-list` styles every panel list (source mixes green check and disc
lists in the bAV "Produkte" accordion); caption paragraphs authored as plain paragraphs.
Gate (preview origin, round 1, archetype re-checked unchanged after the shared block edits): bAV 1440 8.74 % Δh 142 /
360 9.89 % Δh 86; Dienstreise 1440 3.95 % Δh 36 / 360 7.72 % Δh 49; clip 0, MISSING 0 / HIDDEN 0 — all PASS.

## archetype-listing — /de/ratgeber (2026-10-28)

New blocks: article-header, breadcrumb, ccw; listing variants of promo, carousel and benefits. Deployed and published
(deploy ledger `stardust/deploy/ledger-archetype-listing.json`: PUT/preview/live 200, verify ok).
Fix rounds on the preview origin: (1) carousel tile CTAs carry `aria-label` = authored link title (live names the
reduced tile links "Familie absichern" / "Gesunde Zähne" / "Schaden melden"); (2) the CTA text moves into a
`.cta-label` span hidden with `display: none` under the reduced variants (live `.cmp-cta__label`), so the accessible
name is the title, not the hidden "mehr lesen"/"weiter". Content MISSING 3 → 0 (1440), 1 → 0 (360).
Gate: gate-all rows 1440 19.48 % Δh 402 / 360 30.17 % Δh 334 — capture-browser hyphenation asymmetry (source CSS
`* { hyphens: auto }`; origin stitched in headed real Chrome without a German hyphenation dictionary, EDS in bundled
Chromium). Same-browser (Chromium both sides, `origin-chromium.png` vs `eds.png`): 1440 8.06 % Δh 86 (0.6 %), 360
5.68 % Δh 85 (0.3 %) — PASS; recorded as documented overrides in `gates/all-<w>/overrides.json`. Clip 0, MISSING 0 /
HIDDEN 0 at both widths. "Chat öffnen" stays an inert button face (chat off until the martech decision).

## cluster-listing — /de/rechtsportal (2026-10-28)

Sibling of archetype-listing (source `/de/rechtsportal`, already lowercase — no redirect row). Content model by
`extract-listing-content.mjs`, structural clone `stardust/prototypes/de-rechtsportal-proposed.html`, migrate render
A′ (`--archetype de-rechtsportal=de-ratgeber`), encoded by `stardust/.work/deploy/probes/gen-listing-sibling.mjs`
(gen-ratgeber-content.mjs generalised: slug/path args, generic `bg-*` / `pos-center` section styles, standalone
`cta` sections, spacer folding into `gap-m`, carousel slider flags from the capture's `data-carousel-*`, CTA icon
tokens the prototype has no class for read from the content model). Variance probe:
`stardust/rollout/units/cluster-listing-variance.json`. Deployed and published (ledger
`stardust/deploy/ledger-cluster-listing.json`). No new blocks; additive variants only:
| block | variant | live evidence |
|---|---|---|
| article-header | `blue` (band `--bg-blue`; default stays orange) | articleHeader `padding … bg-blue` |
| carousel | `plain` — sans 16→18 left headline, left text, a flag before the image overlays its top-right corner | `.cmp-promo__headline p` FS Me 16/20.8 → 18/23.4, flag `margin-left:auto` over the image |
| carousel | `cta-primary` — primary card CTAs (default tertiary) | card CTAs `data-variant=primary` |
| promo | `headline-xs` (16→18) · `headline-s` (18→20) — canon txt__h1 / txt__h4 ramps | computed 360/1440 |
| promo | `ic-lock` CTA icon (`:lock:` token, painted with ::before so single-CTA cards keep the stretched link) + `icons/lock.svg` | LockIcon mask on "Alle Musterdokumente anzeigen" |
Page-layer section style `h-red` (brand-red sans section headlines; serif-red stays serif) in article-header.css.
The 3-col cards carousel is `slider-always` (live `data-carousel-mobile/desktop=true`: one card + dots on mobile,
static three-up at 1440). Deviations: ROLE UPGRADE p→h3/h4 as on the archetype; plain-text promo/card titles
authored as text paragraphs (the title slot is the serif heading).
Gate (preview origin, 3 rounds: slider + plain cards, promo headline ramps): gate-all rows 1440 12.91 % Δh 126 /
360 15.81 % Δh 119 — hyphenation asymmetry (headed Chrome origin vs Chromium EDS). Same-browser: 1440 4.99 % Δh 61,
360 6.87 % Δh 80 — PASS, documented overrides merged into `gates/all-<w>/overrides.json`. Clip 0, MISSING 0 /
HIDDEN 0. Residual Δh = the article footer note row (footer frozen; foundation request filed). de-ratgeber re-gated
after the shared block edits: same-browser 8.06 % / 5.68 % unchanged, eds.png pixel-identical to the previous run.

## archetype-landing — / (2026-10-28)

Home page (source `https://www.ergo.de/`, DA doc `/index`, consumer chrome `/nav` + `/footer`, no nav/footer metadata).
Encoded by `stardust/.work/deploy/probes/encode-landing.mjs <slug> <path>` (prototype `.grid > .col` → one section per
col; col classes → `Style` sp-<s>[-top|-tb], bg-*, minh, pos-center; module → block per the contracts below). Schema
`stardust/eds-schema/index.json` (sections copy `proto-sections-index.mjs`). Media scope `index` (11 files, 4 störer SVGs
pure-vector). Deployed and published (ledger `stardust/deploy/ledger-archetype-landing.json`).
| block | tier | variants / slots | notes |
|---|---|---|---|
| banner (new) | template-slotted | — | one `<em><a>` CTA inside canon `cmp-cta text-link size-auto w-100 ic-chevron`; band = section `bg-yellow, sp-s-tb` |
| ekomi (new) | template-slotted, by content | — | quote · seal label (p before the rating → role=img aria-label, label visually hidden) · `<strong>4,6</strong>/5` (→ `--score` stars, aria-label "4,6 von 5 Sternen") · source line · text-link CTA. Dynamics row 10 (host-bound quotes JSON): captured quote authored as snapshot |
| hero (reused) | additive | `landing` variant (CTA stack gap, 24px below band, teaser text 14/21→16/24); content slots: second image = störer, price paragraph (`z. B. <strong>20,65&nbsp;€</strong> monatlich`), CTA icon token (`:calculator: <em><a>` = icon left) | slots only appear when authored — program heroes unchanged |
| carousel (reused) | additive | `canon` (canon default promo cards: flag over image top-left / centred above an icon, second image = störer badge, `:icon:` paragraph = card icon, price, CTA colour from emphasis), `stats` (text = 8px title line), `cta-text-link`, `articles` (c15 article teasers: subhead, serif brand headline clamp 3, `<em><a title>` CTA named by its title); per-card option cell in `cards`/`articles` rows: colour word and/or `left` | 7 carousels: products (canon), Aktuelles tiles (reduced both), services (canon slider-mobile), contact tiles (reduced-mobile, colour cells), Wissenswertes (canon cta-text-link), Ratgeber articles (slider-always), Warum ERGO (canon stats) |
| cta (reused) | — | `secondary size-auto w-50` + section `pos-center` | |
Section heads: `<h2><strong>X</strong></h2>` + `eyebrow`, `<h2>` + `serif-red`, `<p>` + `ta-c` (landing page layer stopgap in hero.css,
foundation request filed). Decisions: tile/card/article titles ROLE UPGRADE p → h3; article teaser set frozen to the captured
six (captureState; live randomizes 6 of ~10 per load, dynamics row 6 A1 interim = authored rows); eKomi quote frozen (row 10);
chat tile CTA inert face (row 19 off); personalization slots (#reminder-offer, #recommendations) empty on live headless —
not authored. New code icons: airplane, broken-arm, business-card, chevron (= chevron-right, token name of the canon
ic-chevron), dental-orthodontics, funeral, globe, group, hands-money, handshake, hobby, hospital, megaphone, store,
star-filled, ekomi-seal-silver.png. Local roundtrip: banner/hero/cta/ekomi closed; carousel reds were the prototype's eager
loop clones (12 cloned "Mehr lesen" CTAs; EDS builds clones on first navigation) and were cleared for option cells by the
`@variants cell 2` vocabulary line.
Gate (preview origin, round 1): 1440 PASS 4.18 % Δh 47 · 360 PASS 9.56 % Δh −3; clip 0, MISSING 0 / HIDDEN 0. Largest 360
bands = narrow card text re-wrapping (headed-Chrome origin without German hyphenation vs Chromium EDS) and live price
prefix/suffix spacing. Shared-block re-gate (hero, carousel edits): program pages (cyber, bAV, Dienstreise) eds.png
pixel-identical to the previous run at 1440/360, numbers unchanged (cyber 360 10.38 % pre-existing residual).

## cluster-landing — /de, /de/geschaeftskunden-produkte, /de/produkte, /de/service (2026-10-28)

Siblings of archetype-landing. Variance probe `stardust/rollout/units/cluster-landing-variance.json` (exit 2: /de =
home; the three others vary in every probe). Migrate render A′ (`--archetype <s>=index`), deployed and published
(ledger `stardust/deploy/ledger-cluster-landing.json`, paths `stardust/rollout/units/cluster-landing.paths`).
- **/de** (DA doc `/de` → `content/de.html`, next to the `/de/…` folder — DA/content bus keep a doc and a folder of
  the same name apart; `/de` and `/de/ratgeber` both answer 200 on aem.live). Source `https://www.ergo.de/de`
  **redirects to `/`** on live (finalUrl) — delivered as its own page from its own capture because every in-scope
  page must answer 200 at its path. **Owner decision:** keep `/de` as a page or turn it into a redirect `/de → /`
  (redirects sheet) later. Content model by `extract-index-content.mjs de stardust/current/pages/de.html` (now takes
  `<slug> <dom>`; capture colours from `data-color` / `data-color-index`, index output unchanged), encoded by
  `encode-landing.mjs de /de` (archetype shape, media scope `de`). Differs from `/` only in the captured article
  teaser set (randomized on live; deviation logged).
- **/de/geschaeftskunden-produkte, /de/produkte, /de/service** are AEM `productpage`s (product hero, promos, tile/promo
  carousels, benefits, accordion, YouTube embed) — the program/listing family, not the home shape. Content models by
  `extract-listing-content.mjs` (+ `embed`; `layout` = `full` when the live root grid is `full-grid`), prototypes by
  `build-prototype.mjs` (+ embed, promo störer badge), encoded by `stardust/.work/deploy/probes/encode-landing-product.mjs`
  (gen-listing-sibling + program hero/accordion/icon-benefits shapes + embed). Metadata `Theme: narrow`
  (geschaeftskunden, `standardpage-grid`, 888) / `Theme: narrow, full-grid` (produkte, service: narrow rich-text
  layer on the 1256 column); geschaeftskunden carries nav/footer = `-geschaeftskunden`. redirects.tsv rows added.
| block | change | live evidence |
|---|---|---|
| embed (new) | YouTube player from one authored link (title = player title, link title = aria-label); `@ew-exempt` source link | `cmp-embed--youtube` /de/Service |
| hero | `magenta`, `hide-image-mobile` | hero bg-magenta; `data-image-hide-mobile="true"` |
| promo | `image-right`; flag overlays the card edge in image-left/right cards; `flag-right`; second image = störer badge (`.promo-small-image`); `headline-sub`, `title-sans`, `img-natural`; plain-link CTA = canon text-link | `data-image-position="right"`, `data-flag-position`, `.cmp-promo__small-image`, untyped headline over txt__h2 title, 2.13:1 / 4:3 renditions, `cmp-cta text-link` |
| carousel | card subhead slot (two headings in a card row), `h-red`, `wide-image`, `cta-secondary`, `plain headline-s`; tile colour `warmgrey` | v2 promo headline over title (/de/Service cards), color--red titles, 2:1 crops, secondary CTAs, txt__h4 titles, tile `#ebe6d8` |
Section styles (stopgap in hero.css, foundation request filed): `h-xs`, `gap-s|m|l|xl`, narrow `serif-red`/`h-red`/`h-teaser`/`h-s`, `Theme full-grid`.
New code icons: award, broken-arm-star, car-plus, cross-selling, currency-euro, dental-prophylaxis, document,
document-star, law, orders, patch, tools. Deviations: ROLE UPGRADE p→h2/h3/h4 (card/promo titles, serif section
titles); /de article teaser set as captured; embed as a block (davids-model D1 wants an auto-blocked link — scripts/
frozen, request filed). Known residuals: promo flag icon (trophy/megaphone) not painted; /de/Geschaeftskunden-Produkte
check-list--green bullets render as discs (the section also holds a plain list).
Gate (preview origin; 3 fix rounds on the product pages: full-grid width, promo/card slots and variants, mobile
flag/badge/image ratio): 1440 — /de 5.56 % Δh −46, /de/geschaeftskunden-produkte 8.15 % Δh 84, /de/produkte 1.80 % Δh 0
PASS; /de/service 15.26 % Δh 4 → PASS (same-browser) 2.41 %. 360 — /de 8.81 % Δh 25 PASS; /de/service 22.46 % →
PASS (same-browser) 8.39 % (overrides merged into gates/all-<w>/overrides.json); residual FAIL /de/produkte 21.81 % Δh
159 (same-browser 10.06 %: narrow centred copy re-wrap + promo price 24 px vs live 28 px at 360) and
/de/geschaeftskunden-produkte 23.53 % Δh 162 (same-browser 16.03 %: check-list--green items render as indented discs,
21 px list wrap shifts everything below). Clip 0, MISSING 0 / HIDDEN 0 on every row. Shared-block re-gate (hero,
carousel, promo edits): /, program ×3, /de/ratgeber, /de/rechtsportal — eds.png pixel-identical to the previous run at
1440 and 360 (/ 360 origin-side variance only: live randomized teasers/eKomi).

## C-final — foundation requests applied, 360 fixes (2026-10-28)
**Foundation (styles/styles.css § Page layers, appended last so the cascade position is unchanged):** `Theme: narrow`
(888 column, rich-text h2/h3/p/lists, inline links), `Theme: narrow, full-grid` (1256 column), section styles `ta-c`,
`serif-red` (narrow: serif + brand; default grid: brand), `h-red`, `h-teaser`, `h-s`, `h-xs`, `eyebrow`,
`gap-s|m|l|xl`, `scroll-top`, `check-list`, new `check-list-first` (only the section's first list is the green check
list — /de/Geschaeftskunden-Produkte holds a check list and a plain list in one cmp-text). Stopgap copies removed from
blocks/hero/hero.css and blocks/article-header/article-header.css (icon mask URLs now `../icons/…`). Before push the
move was proven render-identical: local code over previewed content vs preview, 10 pages × 1440/360, 0 differing px.
Inline-link rule now applies on every narrow page (live: brand #8e0038, 700, underline, 0.25 px on /de/Service,
/de/Geschaeftskunden-Produkte, …/Betriebliche-Altersversorgung — previously listing-only).
**benefits:** `light-teal` #ccecef / `light-green` #d3ebe5 now block-owned in blocks/benefits/benefits.css.
**footer:** new optional section role `note` (section style `note`; caption row above the columns, canon
`.site-footer--article .site-footer__note`, 12/18 → 14/21). Chrome doc `/footer-article` (= /footer + note row,
Service "Ratgeber & Rechtsportal" / "Freundschaftswerbung", Kontakt order as captured; columns section carries
`Style: columns` because the note shifts the index fallback). Page metadata `footer: /footer-article` on /de/ratgeber
and /de/rechtsportal (generators gen-ratgeber-content.mjs / gen-listing-sibling.mjs updated). Published live.
**scripts.js:** `buildEmbedAutoBlocks` — a paragraph in default content holding only a YouTube link
(youtube.com/embed|watch, youtu.be) becomes an `embed` block; links inside blocks untouched, so the authored embed on
/de/service keeps working.
**Encoder:** encode-landing-product.mjs emits `check-list-first`. Deploy: deploy-batch `--paths
stardust/rollout/units/c-final.paths --ledger stardust/deploy/ledger-c-final.json` (publish) — 4/4 live.
**Gate (preview origin, --skip-existing --recapture-eds; same-browser = pixel-compare origin-chromium.png vs eds.png):**
1440 — / 2.90, /de 5.56, /de/produkte 1.80, /de/geschaeftskunden-produkte 8.17, BAV 8.74, cyber 8.32, Dienstreise
3.95 PASS; /de/service 15.26 → 2.40, /de/ratgeber 19.38 → 8.02, /de/rechtsportal 12.81 → 4.91 PASS (same-browser).
360 — /de 8.81, BAV 9.88, Dienstreise 7.72 PASS; / 14.59 → 8.93, cyber 10.38 → 2.97, /de/geschaeftskunden-produkte
22.64 → 4.25, /de/service 22.46 → 8.39, /de/ratgeber 30.09 → 5.61, /de/rechtsportal 15.76 → 6.72 PASS (same-browser);
**/de/produkte 21.81 → 10.06 FAIL** — residual: the Kfz section's centred paragraph wraps to 7 lines in FS Me and 6 in
the Fira Sans substitute (same 312 px box, same hyphens), 21 px shift below y≈7100 = ~90 % of the differing pixels;
the noted promo-price difference does not exist (28/36 both sides, measured). Clip 0, MISSING/HIDDEN 0 on every row.

### Rollout D2-dynamic (2026-10-28)
Dynamic parity written to `stardust/dynamics/parity.json` and replayed against https://main--856f1bba--aemcoder.aem.live: 18/18 PASS (`stardust/qa/dynamics-report.md`). Martech stays disabled (contract all-off, no third-party tag fires). No block JS/CSS change, no content change, no republish. Open: header search hands off to ergo.de results (no index in scope); tooltips not delivered.

## Rollout G-aem (2026-10-28)
Source JSON-LD is carried verbatim as a `json-ld` metadata row per page (pipeline-rendered as application/ld+json). /de and / share title and description exactly as on the source; left as captured — turning /de into a redirect to / (redirects sheet) is the owner's call.
