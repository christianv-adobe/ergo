/**
 * carousel — canon carousel container (c18, splide behaviour as observed on live): a wrapped
 * grid of slides; in slider mode arrows, pagination dots, loop (prev on the first page wraps
 * to the last), pointer drag. Reconstructive (repeat group, schema § carousel, unit DIV.slide).
 *
 * Authoring: slides are segmented on the slide heading (one heading = one slide; an icon
 * paragraph `:icon:` authored before the heading belongs to that slide). Slide kinds,
 * classified by content:
 *   - download card: the heading is a link (to the file); an optional list after it holds
 *     file name | format | size (file name hidden as on the source)
 *   - tile: optional icon, heading (title), text paragraph(s), CTA paragraph(s)
 *     (<em><a> secondary — the canon tile CTA)
 *   - anything else: the slide keeps the authored content as-is
 *   - a tile CTA authored without a link (`<em>Chat öffnen</em>`) renders as an inert button
 *     face (the chat is off until the martech decision, dynamics row 19)
 * Tile colour: an optional second cell in the tile's row holding one colour word.
 * Variant `cards` — promo-card slides (canon c36 inside c18), ONE ROW PER CARD: optional
 *   image, optional flag (text before the heading; without a heading the first of several
 *   text paragraphs), heading, text, CTA paragraphs (an icon token `:headset:` after the link
 *   paints the canon CTA icon). Images whose alt says "KI-unterstützt" get the AI badge.
 *   Two headings in a row (`<h4>` then `<h3>`): the first is the subhead line above the title
 *   (canon .cmp-promo__headline over .cmp-promo__title).
 *
 * @variants block class: cols-m-2 | cols-m-3 (768–911) · cols-l-2 | cols-l-3 | cols-l-4 (≥912)
 *   · slider-always | slider-mobile (slider below 768) · slide-pad (24px under each slide)
 *   · reduced-mobile | reduced-desktop (reduced tiles: icon left, arrow right)
 *   · cards (promo-card slides) · blue | warmgrey (card colour, default white) · cta-auto
 *   (canon size-auto card CTAs, default full width) · cta-primary (primary card CTAs, default
 *   tertiary) · plain (sans, left-aligned card text; a flag before the image overlays it)
 *   · canon (landing: canon default promo cards — sans centred headline, border; a flag before
 *   the image overlays its top-left corner, a flag before an icon is centred; a SECOND image
 *   is the störer badge over the image; an icon paragraph `:megaphone:` is the card icon; a
 *   price paragraph `Ab <strong>12,17€</strong> monatlich`; CTA colour from the authored
 *   emphasis) · stats (canon: the text is the 8px title line) · cta-text-link (canon text-link
 *   card CTAs) · articles (canon c15 article teasers: text before the heading = subhead,
 *   serif brand headline, `<em><a title>` CTA named by its title) · h-red (brand-colour card
 *   titles, canon color--red) · wide-image (2:1 card images, default 3:2)
 *   · cta-secondary (canon secondary card CTAs: brand outline) · headline-s (plain card titles at
 *   canon txt__h4, 18→20)
 * @variants cell 2: blue | green | magenta | yellow | orange | warmgrey | left (default white)
 *   (`left` only in `cards` rows: left-aligned headline/text, canon .cmp-promo__headline.left;
 *   colour words also colour `cards` and `articles` rows)
 * @ew-exempt metadata — the tile background colour cell (cell 2) is never displayed
 */

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

const div = (cls) => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isIconPara = (el) => el.tagName === 'P' && el.querySelector('.icon') && !el.textContent.trim();
const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();
// a CTA face without a target: the paragraph is one <em>/<strong> run and nothing else
const isStaticCta = (el) => el.tagName === 'P' && !el.querySelector('a')
  && el.children.length === 1 && /^(EM|STRONG)$/.test(el.firstElementChild.tagName)
  && el.textContent.trim() === el.firstElementChild.textContent.trim();
const isMedia = (el) => el.matches('picture, img')
  || (el.tagName === 'P' && el.querySelector('picture, img') && !el.textContent.trim());
const TILE_COLOURS = ['blue', 'green', 'magenta', 'yellow', 'orange', 'warmgrey'];
const CARD_OPTIONS = [...TILE_COLOURS, 'left'];
const isPrice = (el) => el.tagName === 'P' && !el.querySelector('a')
  && [...el.querySelectorAll('strong')].some((b) => /^[\d.,]+\s*€$/.test(b.textContent.trim()));

// card option cell (last cell of a multi-cell card row: colour word and/or `left`) → words
function takeCardOptions(row) {
  const cells = [...row.children];
  if (cells.length < 2) return [];
  const last = cells[cells.length - 1];
  const words = last.textContent.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (!words.length || !words.every((w) => CARD_OPTIONS.includes(w))) return [];
  last.remove();
  return words;
}

// tile colour cells: remove them from the rows, remember the colour per tile heading
function takeColours(block) {
  const colours = new Map();
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const last = cells[cells.length - 1];
    const word = last.textContent.trim().toLowerCase();
    if (!TILE_COLOURS.includes(word)) return;
    last.remove();
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) colours.set(heading, word);
  });
  return colours;
}

function segment(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => nodes.push(...cell.children));
  const counts = {};
  nodes.filter(isHeading).forEach((n) => {
    counts[n.tagName] = (counts[n.tagName] || 0) + 1;
  });
  const headTag = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
  if (!headTag) {
    // no slide headings: one slide per authored row
    return [...block.children].map((row) => ({ lead: [], heading: null, rest: [...row.querySelectorAll(':scope > div > *')] }));
  }
  const slides = [];
  let pending = [];
  let current = null;
  nodes.forEach((el) => {
    if (el.tagName === headTag) {
      current = { lead: pending, heading: el, rest: [] };
      slides.push(current);
      pending = [];
    } else if (isIconPara(el) || !current) {
      pending.push(el);
    } else {
      current.rest.push(el);
    }
  });
  if (pending.length) {
    if (current) current.rest.push(...pending);
    else slides.push({ lead: [], heading: null, rest: pending });
  }
  return slides;
}

function buildDownload(unit, link) {
  const a = document.createElement('a');
  a.className = 'download-link';
  a.href = link.href;
  if (link.title) a.title = link.title;
  link.replaceWith(...link.childNodes); // EW6 — card-as-link, no nested anchors
  const title = div('download-title');
  title.append(unit.heading);
  a.append(title);
  const props = div('download-props');
  unit.rest.forEach((el) => props.append(el));
  // label | value pairs (`<li>Format<ul><li>pdf</li></ul></li>`): the label text node moves
  // into a span (presentation refinement — the li keeps its text, EW1); labels are hidden
  props.querySelectorAll('li').forEach((li) => {
    if (!li.querySelector('ul, ol')) return;
    const label = document.createElement('span');
    label.className = 'download-prop-label';
    const lead = [...li.childNodes].filter((n) => n.nodeType === 3 || n.tagName === 'STRONG');
    if (!lead.length) return;
    label.append(...lead);
    li.prepend(label);
  });
  unit.lead.forEach((el) => props.append(el));
  if (props.children.length) a.append(props);
  const card = div('download');
  card.append(a);
  return card;
}

function buildTile(unit, block, colours) {
  const tile = div('tile');
  const colour = colours && colours.get(unit.heading);
  if (colour) tile.classList.add(`tile-${colour}`);
  if (block.classList.contains('reduced-mobile')) tile.classList.add('reduced-m');
  if (block.classList.contains('reduced-desktop')) tile.classList.add('reduced-d');
  const icons = unit.lead.filter(isIconPara);
  const other = unit.lead.filter((el) => !isIconPara(el));
  if (icons.length) {
    const iw = div('tile-icon-wrapper');
    iw.append(...icons);
    tile.append(iw);
  } else {
    tile.classList.add('no-icon');
  }
  const title = div('tile-title');
  title.append(...other, unit.heading);
  tile.append(title);
  const text = div('tile-text');
  const ctas = div('tile-cta-wrapper');
  unit.rest.forEach((el) => {
    if (isCta(el) || isStaticCta(el)) {
      const c = div('cmp-cta secondary size-auto');
      if (!isCta(el)) c.classList.add('static');
      // live parity: the tile CTA is named by its title ("mehr lesen" → "Familie absichern");
      // its visible text sits in a label span the reduced variants hide (display: none, as live)
      el.querySelectorAll('a').forEach((a) => {
        if (a.title) a.setAttribute('aria-label', a.title);
        const label = document.createElement('span');
        label.className = 'cta-label';
        label.append(...a.childNodes);
        a.append(label);
      });
      c.append(el);
      ctas.append(c);
    } else {
      text.append(el);
    }
  });
  if (text.children.length) tile.append(text);
  if (ctas.children.length) tile.append(ctas);
  return tile;
}

// CTA icon token (decorated `.icon-<name>` span) → canon wrapper modifiers ic-<name> (+ icon-left)
function ctaIcon(p, wrapper) {
  const icon = p.querySelector('.icon');
  const a = p.querySelector('a');
  if (!icon || !a) return;
  const name = [...icon.classList].find((c) => c.startsWith('icon-') && c !== 'icon');
  if (!name) return;
  wrapper.classList.add(`ic-${name.slice(5)}`, 'has-icon');
  // eslint-disable-next-line no-bitwise
  if (icon.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) {
    wrapper.classList.add('icon-left');
  }
}

// promo-card slide (variant `cards`): one authored row = one card
function buildCard(nodes, block, options = []) {
  const canon = block.classList.contains('canon');
  let media = null;
  let small = null;
  let heading = null;
  let subhead = null;
  let price = null;
  const icons = [];
  const pre = [];
  const text = [];
  const ctas = [];
  nodes.forEach((el) => {
    if (!heading && isIconPara(el)) icons.push(el);
    else if (!media && isMedia(el)) media = el;
    else if (media && !small && isMedia(el)) small = el;
    else if (!heading && /^H[1-6]$/.test(el.tagName)) heading = el;
    else if (heading && !subhead && !text.length && /^H[1-6]$/.test(el.tagName)) {
      // two headings in one card row: the first is the subhead line above the title
      // (canon v2 promo .cmp-promo__headline over .cmp-promo__title, /de/Service cards)
      subhead = heading;
      heading = el;
    } else if (isCta(el)) ctas.push(el);
    else if (heading && !price && isPrice(el)) price = el;
    else if (heading) text.push(el);
    else pre.push(el);
  });
  let flag = [];
  if (heading) flag = pre;
  else if (pre.length > 1) {
    flag = [pre.shift()];
    text.push(...pre);
  } else text.push(...pre);
  const card = div('card');
  if (!canon) card.dataset.ctaCount = String(ctas.length);
  options.forEach((o) => card.classList.add(TILE_COLOURS.includes(o) ? `card-${o}` : o));
  if (flag.length) {
    const fc = div('card-flag-container');
    if (canon) fc.classList.add(media ? 'over' : 'centered');
    const f = div('card-flag');
    f.append(...flag);
    fc.append(f);
    card.append(fc);
  }
  if (media) {
    const ic = div('card-image-container');
    const im = div('card-image');
    const img = media.matches('picture, img') ? media : media.querySelector('picture, img');
    const alt = (img.querySelector('img') || img).getAttribute('alt') || '';
    if (/KI-unterstützt/i.test(alt)) im.classList.add('ai-generated');
    im.append(img);
    ic.append(im);
    if (small) {
      const sm = div('card-small-image');
      sm.append(small.matches('picture, img') ? small : small.querySelector('picture, img'));
      ic.append(sm);
    }
    card.append(ic);
    card.classList.add('has-image');
  }
  if (icons.length) {
    const icc = div('card-icon-container');
    icc.append(...icons);
    card.append(icc);
  }
  const content = div('card-content');
  if (subhead) {
    const sh = div('card-subhead');
    sh.append(subhead);
    content.append(sh);
  }
  if (heading) {
    const h = div('card-headline');
    h.append(heading);
    content.append(h);
  }
  if (text.length) {
    const t = div('card-text');
    t.append(...text);
    content.append(t);
  }
  if (ctas.length || price) {
    const actions = div('card-actions');
    if (price) {
      const pr = div('card-price');
      pr.append(price);
      actions.append(pr);
    }
    ctas.forEach((p) => {
      let cls;
      if (canon) cls = `size-auto w-100${block.classList.contains('cta-text-link') ? ' text-link' : ''}`;
      else {
        let kind = 'tertiary';
        if (block.classList.contains('cta-primary')) kind = 'primary';
        else if (block.classList.contains('cta-secondary')) kind = 'secondary';
        cls = `${kind} ${block.classList.contains('cta-auto') ? 'size-auto' : 'w-100'}`;
      }
      const c = div(`card-cta cmp-cta ${cls}`);
      ctaIcon(p, c);
      c.append(p);
      actions.append(c);
    });
    content.append(actions);
  }
  card.append(content);
  return card;
}

// article teaser slide (variant `articles`, canon c15): subhead, serif headline, text, CTA
function buildArticle(nodes, options = []) {
  const card = div('article');
  options.filter((o) => TILE_COLOURS.includes(o)).forEach((o) => card.classList.add(`article-${o}`));
  let heading = null;
  const sub = [];
  const text = [];
  const ctas = [];
  nodes.forEach((el) => {
    if (!heading && /^H[1-6]$/.test(el.tagName)) heading = el;
    else if (isCta(el)) ctas.push(el);
    else if (heading) text.push(el);
    else sub.push(el);
  });
  if (sub.length) {
    const s = div('article-subhead');
    s.append(...sub);
    card.append(s);
  }
  if (heading) {
    const h = div('article-headline');
    h.append(heading);
    card.append(h);
  }
  if (text.length) {
    const t = div('article-text');
    t.append(...text);
    card.append(t);
  }
  if (ctas.length) {
    const w = div('article-cta');
    ctas.forEach((p) => {
      const c = div('cmp-cta secondary w-100');
      // live parity: the CTA is named by its title ("Mehr lesen: <article>")
      p.querySelectorAll('a').forEach((a) => {
        if (a.title) a.setAttribute('aria-label', a.title);
      });
      c.append(p);
      w.append(c);
    });
    card.append(w);
  }
  return card;
}

function buildSlide(unit, block, colours) {
  const slide = div('slide');
  if (block.classList.contains('slide-pad')) slide.classList.add('pad-m');
  const link = unit.heading && unit.heading.querySelector('a[href]');
  const headingIsLink = link && unit.heading.textContent.trim() === link.textContent.trim();
  if (headingIsLink && !unit.rest.some(isCta)) {
    slide.append(buildDownload(unit, link));
  } else if (unit.heading) {
    slide.append(buildTile(unit, block, colours));
  } else {
    slide.append(...unit.lead, ...unit.rest);
  }
  return slide;
}

function navigation() {
  const nav = div('carousel-navigation');
  const controls = div('carousel-controls');
  const mk = (cls, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `carousel-control ${cls}`;
    b.setAttribute('aria-label', label);
    return b;
  };
  controls.append(mk('prev', 'vorherige Seite'), mk('next', 'nächste Seite'));
  const dots = document.createElement('ul');
  dots.className = 'carousel-indicators';
  dots.setAttribute('aria-label', 'ein Element zum Anzeigen auswählen');
  nav.append(controls, dots);
  return nav;
}

function mountSlider(block, list, slides, nav) {
  const MOBILE = window.matchMedia('(width <= 767px)');
  const dots = nav.querySelector('.carousel-indicators');
  const prev = nav.querySelector('.prev');
  const next = nav.querySelector('.next');
  const state = {
    page: 0, pages: 1, per: 1, on: false, clones: 0, cloned: false,
  };
  const unclone = () => {
    list.querySelectorAll('.slide-clone').forEach((c) => c.remove());
    state.clones = 0;
  };
  const reclone = () => {
    unclone();
    const n = Math.min(slides.length, state.per * 2);
    const mk = (s) => {
      const c = stripInstrumentation(s.cloneNode(true)); // EW4
      c.classList.add('slide-clone');
      c.setAttribute('inert', '');
      c.setAttribute('aria-hidden', 'true');
      return c;
    };
    slides.slice(-n).forEach((s) => list.insertBefore(mk(s), slides[0]));
    slides.slice(0, n).forEach((s) => list.append(mk(s)));
    state.clones = n;
  };
  const perPage = () => {
    const pct = parseFloat(getComputedStyle(block).getPropertyValue('--column-width')) || 100;
    return Math.max(1, Math.round(100 / pct));
  };
  const render = () => {
    if (!state.on) {
      list.style.transform = '';
      return;
    }
    const slideW = slides[0].getBoundingClientRect().width;
    list.style.transform = `translateX(${-(state.clones + state.page * state.per) * slideW}px)`;
    [...dots.children].forEach((li, i) => li.firstElementChild.classList.toggle('is-active', i === state.page));
    prev.setAttribute('aria-label', state.page === 0 ? 'gehe zur letzten Seite' : 'vorherige Seite');
    next.setAttribute('aria-label', state.page === state.pages - 1 ? 'gehe zur ersten Seite' : 'nächste Seite');
    const first = state.page * state.per;
    slides.forEach((s, i) => {
      const vis = i >= first && i < first + state.per;
      s.classList.toggle('is-visible', vis);
      s.toggleAttribute('inert', !vis);
    });
  };
  // loop clones are built on the first navigation (presentational only; at rest they would
  // just duplicate the slide text for non-rendering readers)
  const ensureClones = () => {
    if (!state.on || state.clones) return;
    state.cloned = true;
    reclone();
    list.style.transition = 'none';
    render();
    list.getBoundingClientRect();
    list.style.transition = '';
  };
  const go = (p) => {
    ensureClones();
    state.page = (p + state.pages) % state.pages;
    render();
  };
  const build = () => {
    state.per = perPage();
    const always = block.classList.contains('slider-always');
    const mobile = block.classList.contains('slider-mobile') && MOBILE.matches;
    state.on = (always || mobile) && slides.length > state.per;
    block.classList.toggle('is-slider', state.on);
    if (state.on && state.cloned) reclone();
    else unclone();
    state.pages = state.on ? Math.ceil(slides.length / state.per) : 1;
    state.page = Math.min(state.page, state.pages - 1);
    dots.replaceChildren();
    if (state.on) {
      const unit = state.per === 1 ? 'Element' : 'Seite';
      for (let i = 0; i < state.pages; i += 1) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel-indicator';
        b.setAttribute('aria-label', `gehe zu ${unit} ${i + 1}`);
        b.addEventListener('click', () => go(i));
        li.append(b);
        dots.append(li);
      }
    } else {
      slides.forEach((s) => {
        s.classList.remove('is-visible');
        s.removeAttribute('inert');
      });
    }
    render();
  };
  prev.addEventListener('click', () => go(state.page - 1));
  next.addEventListener('click', () => go(state.page + 1));
  let x0 = null;
  list.addEventListener('pointerdown', (e) => {
    if (state.on) x0 = e.clientX;
  });
  window.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) go(state.page + (dx < 0 ? 1 : -1));
  });
  list.addEventListener('dragstart', (e) => e.preventDefault());
  build();
  window.addEventListener('resize', build);
}

// cell children; a media-led cell folded into ONE <p> by the runtime is expanded back (#104)
function cellNodes(row) {
  const out = [];
  row.querySelectorAll(':scope > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
        && kids[0].querySelector('picture, img') && kids[0].textContent.trim()) {
      [...kids[0].childNodes].forEach((n) => {
        if (n.nodeType === 1) out.push(n);
        else if (n.textContent.trim()) {
          // HARNESS-ONLY fallback (EW5): wrap the bare text node, never copy its text
          const p = document.createElement('p');
          p.append(n);
          out.push(p);
        }
      });
    } else out.push(...kids);
  });
  return out;
}

function cardSlides(block) {
  const rows = [...block.children];
  const options = rows.length > 1 ? rows.map(takeCardOptions) : [];
  const groups = rows.length > 1
    ? rows.map(cellNodes)
    : segment(block).map((u) => [...u.lead, u.heading, ...u.rest].filter(Boolean));
  const articles = block.classList.contains('articles');
  return groups.map((nodes, i) => ({ nodes, opts: options[i] || [] }))
    .filter((g) => g.nodes.length).map(({ nodes, opts }) => {
      const slide = div('slide');
      if (block.classList.contains('slide-pad')) slide.classList.add('pad-m');
      slide.append(articles ? buildArticle(nodes, opts) : buildCard(nodes, block, opts));
      return slide;
    });
}

export default function decorate(block) {
  let slides;
  if (block.classList.contains('cards') || block.classList.contains('articles')) {
    slides = cardSlides(block);
  } else {
    const colours = takeColours(block);
    const units = segment(block);
    slides = units.map((u) => buildSlide(u, block, colours));
  }
  if (!slides.length) return;
  const splide = div('splide');
  const track = div('splide-track');
  const list = div('splide-list');
  list.append(...slides);
  track.append(list);
  splide.append(track);
  const nav = navigation();
  splide.append(nav);
  block.replaceChildren(splide);
  if (block.classList.contains('slider-always') || block.classList.contains('slider-mobile')) {
    mountSlider(block, list, slides, nav);
  }
}
