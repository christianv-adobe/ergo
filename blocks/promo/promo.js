/**
 * promo — canon promo card (c36 .cmp-promo by data attributes): optional flag, optional
 * image (top or left), headline, text, CTAs. Several cards in one block lay out as the canon
 * two-column control (ccw halves from 768).
 * Reconstructive (schema § promo): content is segmented on the card heading — one heading
 * opens one card; a flag paragraph or image authored BEFORE the heading belongs to it.
 *
 * Authoring per card (rows/cells not significant):
 *   - optional image (editorial, content.da.live); a second image right after it is the
 *     störer badge over the image's bottom-left corner (canon .cmp-promo__small-image)
 *   - optional flag: a short text paragraph before the heading
 *   - the headline as a heading (h3/h4)
 *   - optional title line: a further heading right after the headline (serif, brand colour)
 *   - text paragraphs / lists
 *   - optional price: a paragraph whose bold part is the amount (`Ab <strong>1,85€</strong>
 *     monatlich`)
 *   - CTA paragraphs: <strong><a> primary, <em><a> secondary, <strong><em><a> tertiary, a
 *     plain <a> the canon text-link CTA; an
 *     icon token in the CTA paragraph (`:calculator:`, `:headset:`) paints the canon CTA icon
 *     — before the link = icon left, after it = icon right
 *
 * @variants block class: white | blue | yellow | green | magenta | orange | warmgrey
 *   (card colour, default white) · image-left | image-right (default image top)
 *   · hide-image-mobile
 *   · center (centred flag/headline/text) · rounded (round image, podcast) · headline-m |
 *   headline-l (headline at h3 | h2 size) · headline-xs (16→18 from 768, canon txt__h1) |
 *   headline-s (18→20 from 768, canon txt__h4) · cta-auto (canon size-auto CTAs)
 *   · headline-sub (headline as a plain subhead line 14→16, canon untyped .cmp-promo__headline)
 *   · img-natural (image at its own aspect ratio, default 3:2) · flag-right (flag top-right)
 *   · title-sans (title line sans, text colour
 *   — canon txt__h2 without serif/red)
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
        && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback (EW5): wrap a bare text node, never copy its text
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    out.push(...kids);
  });
  return out;
}

const isMedia = (el) => el.matches('picture, img')
  || (el.tagName === 'P' && el.querySelector('picture, img') && !el.textContent.trim());
const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();
const isPrice = (el) => el.tagName === 'P' && !el.querySelector('a')
  && [...el.querySelectorAll('strong')].some((b) => /^[\d.,]+\s*€$/.test(b.textContent.trim()));
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const div = (cls) => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};

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

function buildCard(unit, block) {
  const card = div('promo-card');
  const content = div('promo-content');
  const headline = div('promo-headline');
  const text = div('promo-text');
  const actions = div('promo-actions');
  if (unit.flag.length) {
    const fc = div('promo-flag-container');
    const flag = div('promo-flag');
    flag.append(...unit.flag);
    fc.append(flag);
    card.append(fc);
  }
  if (unit.media) {
    const ic = div('promo-image-container');
    const im = div('promo-image');
    im.append(unit.media.matches('picture, img') ? unit.media : unit.media.querySelector('picture, img'));
    ic.append(im);
    if (unit.small) {
      const sm = div('promo-small-image');
      sm.append(unit.small.matches('picture, img') ? unit.small : unit.small.querySelector('picture, img'));
      ic.append(sm);
    }
    card.append(ic);
    card.classList.add('has-image');
  }
  if (unit.heading) headline.append(unit.heading);
  let title = null;
  if (unit.text.length && isHeading(unit.text[0])) {
    title = div('promo-title');
    title.append(unit.text.shift());
  }
  text.append(...unit.text);
  if (unit.price) {
    const price = div('promo-price');
    price.append(unit.price);
    actions.append(price);
  }
  unit.ctas.forEach((p) => {
    const cta = div('promo-cta cmp-cta w-100');
    if (block.classList.contains('cta-auto')) cta.classList.add('size-auto');
    // a CTA link authored without emphasis = canon text-link CTA (cluster-landing /de/Produkte)
    const plain = p.querySelector('a');
    // (decorateButtons has already turned emphasised links into a.button and dropped the marks)
    if (plain && !plain.classList.contains('button') && !p.querySelector('strong, em')) {
      cta.classList.add('text-link');
      plain.classList.add('button');
      p.classList.add('button-wrapper');
    }
    ctaIcon(p, cta);
    cta.append(p);
    actions.append(cta);
  });
  if (headline.children.length) content.append(headline);
  if (title) content.append(title);
  if (text.children.length) content.append(text);
  if (actions.children.length) content.append(actions);
  card.dataset.ctaCount = String(unit.ctas.length);
  card.append(content);
  return card;
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const counts = {};
  nodes.filter((n) => /^H[1-6]$/.test(n.tagName)).forEach((n) => {
    counts[n.tagName] = (counts[n.tagName] || 0) + 1;
  });
  const headTag = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;

  const units = [];
  const fresh = () => ({
    flag: [], media: null, heading: null, text: [], ctas: [], price: null,
  });
  let pending = fresh();
  let current = null;
  nodes.forEach((el) => {
    if (headTag && el.tagName === headTag) {
      current = pending;
      current.heading = el;
      units.push(current);
      pending = fresh();
    } else if (isMedia(el)) {
      const u = current && !current.heading ? current : pending;
      // a second image before the heading = the störer badge over the first (cluster-landing)
      if (u.media && !u.small) u.small = el;
      else u.media = el;
    } else if (current && isCta(el)) {
      current.ctas.push(el);
    } else if (current && !current.price && isPrice(el)) {
      current.price = el;
    } else if (current && !pending.media && !pending.flag.length && !current.ctas.length) {
      current.text.push(el);
    } else if (!current && !headTag) {
      // no headings at all: one card holding everything
      pending.text.push(el);
    } else {
      pending.flag.push(el);
    }
  });
  if (!headTag) units.push(pending);
  else if (pending.flag.length || pending.media) {
    // leftovers after the last card stay visible as a trailing card
    pending.text.push(...pending.flag);
    pending.flag = [];
    units.push(pending);
  }

  const cards = units.map((u) => buildCard(u, block));
  if (cards.length > 1) {
    block.classList.add('cols');
    const cols = cards.map((c) => {
      const col = div('promo-column');
      col.append(c);
      return col;
    });
    block.replaceChildren(...cols);
  } else {
    block.replaceChildren(...cards);
  }
}
