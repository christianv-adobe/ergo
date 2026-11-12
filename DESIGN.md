---
name: ERGO (ergo.de, current state)
description: "Einfach, weil's wichtig ist." — warm, pastel-banded insurance catalogue with Bordeaux actions and Fedra Serif claims.
colors:
  ergo-red: "#8e0038"
  ergo-red-dark: "#601028"
  logo-red: "#bf1528"
  text: "#333333"
  text-muted: "#737373"
  background: "#ffffff"
  border: "#c9c5c7"
  header-border: "#d9d9d9"
  bg-orange: "#ffe0cb"
  bg-yellow: "#fef6d2"
  bg-magenta: "#f5e1eb"
  bg-blue: "#ccecef"
  bg-green: "#d3ebe5"
  bg-gray: "#ebe6d8"
  accent-green: "#428071"
  accent-magenta: "#c34a89"
  accent-teal: "#318187"
  accent-yellow: "#e5c536"
  accent-orange: "#b46018"
typography:
  claim:
    fontFamily: "Fedra Serif, Georgia, Times New Roman, serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.3
  claim-mobile:
    fontFamily: "Fedra Serif, Georgia, Times New Roman, serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
  section-heading:
    fontFamily: "Fedra Serif, Georgia, Times New Roman, serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
  eyebrow:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  kicker:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  subheading:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  footer-heading:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "FS Me, Arial, Helvetica, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.5px"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
  button: "12px"
  pill: "50%"
spacing:
  xxs: "4px"
  unit: "8px"
  xs: "12px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  xxl: "64px"
  xxxl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ergo-red}"
    textColor: "{colors.background}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ergo-red-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ergo-red}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 24px"
  button-secondary-hover:
    textColor: "{colors.ergo-red-dark}"
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
  band-orange:
    backgroundColor: "{colors.bg-orange}"
  band-yellow:
    backgroundColor: "{colors.bg-yellow}"
  band-magenta:
    backgroundColor: "{colors.bg-magenta}"
  band-blue:
    backgroundColor: "{colors.bg-blue}"
  band-green:
    backgroundColor: "{colors.bg-green}"
---

<!-- stardust:provenance
  writtenBy:        stardust:extract
  writtenAt:        2026-10-28T14:45:00Z
  readArtifacts:
    - stardust/current/_computed-styles.json
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/*.json
    - live stylesheets (/etc.clientlibs/ergoone/**.css)
  synthesizedInputs: []
  stardustVersion:  0.10.0
-->

# Design System: ERGO (current state)

## Overview

**Creative North Star: "The Friendly Policy Desk"**

ergo.de is a calm, approachable catalogue. White pages are broken into full-width pastel bands (peach, cream, rose, aqua, mint, sand); content sits in white 8px-radius cards on those bands. One saturated colour, ERGO Bordeaux `#8e0038`, carries every action and every hero claim. Typography pairs a humanist sans (FS Me) for UI, eyebrows and body with a warm book serif (Fedra Serif) for claims and section headings. Photography is lifestyle, people-first, always in the right half of a split hero.

**Key Characteristics:**
- Split hero on a pastel band: small FS Me eyebrow (the page's h1), large red Fedra Serif claim, short lede, one Bordeaux CTA, photo on the right.
- Section rhythm: FS Me kicker (authored in capitals, e.g. "BESTSELLER") above a Fedra Serif 28px h2.
- Pastel band alternation driven by AEM style-system classes (`bg-orange`, `bg-yellow`, `bg-magenta`, `bg-blue`, `bg-green`, `bg-gray`) and padding classes (`padding-s|m|l|xl`).
- Flat surfaces: no gradients; shadows only as a faint hover lift.

## Colors

- **ERGO Bordeaux `#8e0038`** (`--theme-primary`): buttons, links on hover, hero claims, phone number, outline borders. Hover deepens to `#601028`.
- **Logo Red `#bf1528`**: the wordmark only; never used for UI.
- **Ink `#333333`** body and headings; **Muted `#737373`** for meta lines (tile sub-labels).
- **Pastel surfaces**: Peach `#ffe0cb` (hero default), Cream `#fef6d2`, Rose `#f5e1eb`, Aqua `#ccecef`, Mint `#d3ebe5`, Sand `#ebe6d8`.
- **Dark accents** (badges, numbered markers, product-table heads): Forest `#428071`, Berry `#c34a89`, Teal `#318187`, Mustard `#e5c536`, Rust `#b46018`.
- **Borders**: Warm grey `#c9c5c7` on cards and outline controls; `#d9d9d9` under the header.

**The One Red Rule.** Bordeaux is the only saturated colour on a page; pastels carry the mood, red carries the action.

## Typography

- **FS Me** (Fontsmith; 300/500/700/900 + italics) — UI, eyebrows, body 16/24, h3/h4, buttons (700, 0.5px tracking), footer headings (20px 700).
- **Fedra Serif** (Typotheque; 400–700 + italics) — hero claim 40px/52 (28px under 768px) in Bordeaux; section h2 28px/36.4 in Ink.
- Scale is token-driven but ad hoc: 12, 14, 16, 18, 20, 24, 28, 40px.
- Both families are commercial licences held by ERGO (self-hosted from `/etc.clientlibs/ergoone/.../fonts/`); fallbacks Arial/Helvetica and Georgia.

**The Eyebrow-H1 Rule.** The semantic h1 is the small FS Me eyebrow; the visual headline is a `p.txt__claim` in Fedra Serif. Preserve both roles.

## Layout

- 12-column AEM responsive grid; gap 24px; 8px spacing unit with `--gap--*` steps 4/12/16/24/32/48/64/96.
- Pastel bands are full-bleed; content inside is centred. Cap-probe (2560px) measured fixed module widths: 888px on Ratgeber and product pages, 1256px on home experience fragments; shell fluid. See `DESIGN.json` `extensions.breakpoints`.
- Source breakpoints (`--cc-breakpoint-*`): 320, 768, 1024, 1280, 1440px.

## Elevation & Depth

Flat. Buttons and tiles lift on hover with `0 0 2px rgba(58,58,58,.04), 0 4px 8px rgba(58,58,58,.05)`. The floating chat launcher and overlays use the stronger base shadow `0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px rgba(0,0,0,.14), 0 1px 18px rgba(0,0,0,.12)`.

## Shapes

8px radius is the mode across all pages (cards, tiles, images, bands); buttons 12px; carousel dots, icon buttons and the chat launcher are circles. The skip link has a 0 0 16px 16px tab shape.

## Components

- **Buttons**: primary filled Bordeaux / white text; secondary outline Bordeaux; both 12px radius, FS Me 700 16px. Hover: darker Bordeaux + faint lift.
- **Product tile**: white card, product icon, title, "ab X €" price (`cmp-price`), primary "Jetzt informieren" + outline "Beitrag berechnen".
- **Link-tile grid** (`tile.cta`): icon + label + arrow rows, used for services and segment navigation.
- **Teaser-card carousel** (`carouselContainer` + `promo`): image cards with title, short text and "mehr lesen", splide dot navigation.
- **Accordion** ("Wissenswertes im Überblick"): full-width rows with chevrons.
- **Contact band** (experience fragment): "Nicht sicher, was Sie benötigen?" with e-mail, adviser and phone channels.
- **Header**: logo with claim, primary nav (Versicherungen & Finanzen / Produkte für Geschäftskunden, Service, Kontakt) with mega-menu, utility icons (Suche, Berater, Log-in) and phone.
- **Footer**: four accordion columns, social icons, legal ribbon, ERGO | DKV logos, "Nach oben".

## Do's and Don'ts

- Do keep every action in Bordeaux `#8e0038` and every claim in Fedra Serif.
- Do alternate full-width pastel bands with white sections.
- Do keep cards at 8px radius and buttons at 12px.
- Don't introduce gradients, dark sections or heavy shadows.
- Don't use the logo red `#bf1528` for UI.
- Don't promote the eyebrow to a large heading; the claim carries the visual weight.
