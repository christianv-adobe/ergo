/**
 * hero — page lead band. Template-slotted (stardust/eds-schema/<page>.json § hero).
 *
 * Authoring (any row/cell shape; classified by content, never by index):
 *   - one image (editorial, content.da.live)
 *   - the page <h1>
 *   - the title line: first text paragraph after the h1 (serif, brand colour)
 *   - further text paragraphs: teaser text
 *   - CTA paragraphs: <strong><a> primary, <em><a> secondary; an icon token in the CTA
 *     paragraph (`:calculator: <em><a>`) paints the canon CTA icon — before the link = icon
 *     left, after it = icon right
 *   - optional second image: the störer badge (canon cmp-hero__storer, landing hero)
 *   - optional price: a paragraph whose bold part is the amount (`z. B. <strong>20,65€</strong>
 *     monatlich`, canon cmp-price size-auto)
 *
 * @variants block class: product (canon cmp-hero--product) | yellow | orange
 *   | image-right (default image left) | magenta | hide-image-mobile (no image below 768)
 *   | landing (canon landing cmp-hero: CTA stack gap, 24px below the band)
 *   · light | light-2 (tinted product hero) | image | image-2 (product hero with photo, price
 *   and störer badge): each implies `product` (the product-hero layout) when absent
 */

const PRODUCT_OPTIONS = ['light', 'light-2', 'image', 'image-2'];

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

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

// price line: a short paragraph (`ab <strong>24,80 €</strong> jährlich`), never a teaser
// sentence that happens to bold an amount
const isPrice = (el) => el.tagName === 'P' && !el.querySelector('a')
  && el.textContent.trim().length <= 40
  && [...el.querySelectorAll('strong')].some((b) => /^[\d.,]+\s*€$/.test(b.textContent.trim()));

/*
 * Icon tokens left as text (`:calculator: <strong><a>`): the content pipeline normally turns
 * them into `span.icon`; when it has not, the token stays in the paragraph text and
 * decorateButtons skipped the link. Turn the token into the icon span and buttonize the link
 * the same way decorateButtons does (strong = primary, em = secondary, both = accent).
 */
function decorateIconTokens(block) {
  block.querySelectorAll('p').forEach((p) => {
    const a = p.querySelector('a');
    if (!a) return;
    [...p.childNodes].forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE) return;
      const m = n.textContent.trim().match(/^:([a-z0-9-]+):$/);
      if (!m) return;
      const span = document.createElement('span');
      span.className = `icon icon-${m[1]}`;
      n.replaceWith(span);
    });
    if (a.classList.contains('button') || p.textContent.trim() !== a.textContent.trim()) return;
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;
    a.title = a.title || a.textContent;
    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) {
      a.classList.add('accent');
      (strong.contains(em) ? strong : em).replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
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

export default function decorate(block) {
  if (PRODUCT_OPTIONS.some((c) => block.classList.contains(c))) block.classList.add('product');
  decorateIconTokens(block);
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const isMedia = (el) => el.matches('picture, img') || (el.tagName === 'P' && el.querySelector('picture, img') && !el.textContent.trim());
  const isCta = (el) => el.tagName === 'P' && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim();

  const image = document.createElement('div');
  image.className = 'hero-image';
  const media = document.createElement('div');
  media.className = 'media';
  image.append(media);

  const teaser = document.createElement('div');
  teaser.className = 'hero-teaser';
  const headline = document.createElement('div');
  headline.className = 'hero-teaser-headline';
  const title = document.createElement('div');
  title.className = 'hero-teaser-title';
  const text = document.createElement('div');
  text.className = 'hero-teaser-text';
  const actions = document.createElement('div');
  actions.className = 'hero-actions';

  const storer = document.createElement('div');
  storer.className = 'hero-storer';
  const price = document.createElement('div');
  price.className = 'hero-price';

  let seenHeading = false;
  nodes.forEach((el) => {
    if (isMedia(el)) {
      const target = media.children.length ? storer : media;
      target.append(el.matches('picture, img') ? el : el.querySelector('picture, img'));
    } else if (isPrice(el) && !price.children.length) {
      price.append(el);
      actions.append(price);
    } else if (/^H[1-6]$/.test(el.tagName) && !seenHeading) {
      headline.append(el);
      seenHeading = true;
    } else if (isCta(el)) {
      const cta = wrapNode(el, 'hero-cta cmp-cta size-auto');
      ctaIcon(el, cta);
      actions.append(cta);
    } else if (el.tagName === 'P' && !title.children.length && seenHeading) {
      title.append(el);
    } else {
      text.append(el);
    }
  });

  if (storer.children.length) {
    teaser.classList.add('has-storer');
    teaser.append(storer);
  }
  teaser.append(headline);
  if (title.children.length) teaser.append(title);
  if (text.children.length) teaser.append(text);
  if (actions.children.length) teaser.append(actions);
  const parts = [];
  if (media.children.length) parts.push(image);
  parts.push(teaser);
  block.replaceChildren(...parts);
}
