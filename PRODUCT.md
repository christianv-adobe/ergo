<!-- stardust:provenance
  writtenBy:        stardust:extract
  writtenAt:        2026-10-28T14:40:00Z
  readArtifacts:
    - stardust/current/pages/*.json (10 pages)
    - stardust/current/_brand-extraction.json
    - stardust/current/_computed-styles.json
  synthesizedInputs: []
  stardustVersion:  0.10.0
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

_provenance: inferred — from the site's IA (private vs. Geschäftskunden navigation), CTAs and copy.

- **Private customers in Germany** comparing and buying insurance and provision products (dental, travel, motor, legal, liability, household, life, pension, care, health) — "Beitrag berechnen", "Online abschließen".
- **Existing customers** handling service tasks: claims ("Schaden oder Leistungsfall melden"), contract info, customer-portal login, cancellation/withdrawal.
- **Business customers (Geschäftskunden)** — owners of SMEs and the self-employed seeking commercial cover (Gewerbe-Haftpflicht, Cyber, Dienstreise, betriebliche Altersversorgung/Krankenversicherung, Flotte) — "Angebot anfordern", "ERGO Berater finden".
- **Readers of the Ratgeber / Rechtsportal** looking for guidance on health, money, mobility and legal questions.

## Product Purpose

ERGO's German consumer and business web presence: a product catalogue plus purchase entry points for insurance and finance products, a service hub for existing customers, a sales channel to tied agents (Berater) and a content hub (Ratgeber, Rechtsportal) that feeds organic search. Success reads as tariff calculations started, quotes requested, adviser contacts and self-service completions.

## Positioning

_provenance: inferred — from the tagline and hero claims.

"Einfach, weil's wichtig ist." — insurance made simple and human: plain-language claims ("Wer zuletzt lacht – ist bei ERGO versichert!"), a large direct-plus-adviser network (phone 0800 / 3746 095, Mo–Sa 7–20 Uhr, free of charge) and a DKV co-brand for health.

## Capabilities and Constraints

- AEM Sites (ergoone component library: hero, text, tile, promo, carouselContainer, accordion, cta, experienceFragment, productTable, benefits, download, ekomi, articleTeaserCarousel).
- Tariff calculators, the customer portal, login, search and chat are separate applications reached by link; this site hosts the entry points.
- OneTrust cookie consent; Adobe client context / segmentation; personalised home recommendations ("Ihre Versicherungen") for returning visitors.
- German only (`/de`; `/de` 301-redirects to `/`).
- Regulated: Impressum/Erstinformation, EU-Offenlegungsverordnung, Hinweisgebersystem, Barrierefreiheit statement, "Vertrag widerrufen" in the footer.

## Brand Commitments

- **Register:** `brand` (marketing/catalogue site with a strong visual identity).
- **Name and marks:** ERGO wordmark (logo red `#bf1528`), claim "Einfach, weil's wichtig ist.", ERGO | DKV co-brand in the footer.
- **Personality (observed):** warm, reassuring, plain-spoken, formal "Sie"; friendly lifestyle photography; soft pastel bands; Bordeaux `#8e0038` as the action colour; Fedra Serif claims against an FS Me sans body.
- **Anti-references (observed):** no dark mode, no gradients, no heavy shadows, no jargon-led headlines, no stock-ticker "financial" coldness.

## Evidence on Hand

- Page records + rendered DOM + screenshots: `stardust/current/pages/<slug>.{json,html}`, `stardust/current/assets/screenshots/<slug>.png` (10 pages).
- Brand surface: `stardust/current/_brand-extraction.json`; computed-style census: `stardust/current/_computed-styles.json`.
- Logos: `stardust/current/assets/logo.svg`, `logo-claim.svg`, `logo-dkv.svg`; favicon `assets/favicon.png`.
- Licensed webfonts (FS Me, Fedra Serif): `stardust/current/assets/fonts/`.
- Customer reviews via eKomi widget on home (live data — not to be fabricated).
- Absent: prices beyond the "ab X €" teasers, calculator internals, customer-portal screens.

## Product Principles

_provenance: inferred — from recurring page structure.

1. Every page leads to an action: calculate, request a quote, or reach an adviser.
2. Help is always one step away — the contact band (e-mail, adviser, phone) closes nearly every page.
3. Explain before selling: Wissenswertes accordions, downloads and Ratgeber articles sit beside products.
4. One system across private and business segments; only the navigation entry differs.

## Accessibility & Inclusion

The site publishes a Barrierefreiheit statement (footer) and ships a skip link ("Zum Inhalt springen"); a same-design migration must keep both, and keep German BFSG obligations in view.
