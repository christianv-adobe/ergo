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
 */

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

const isPrice = (el) => el.tagName === 'P' && !el.querySelector('a')
  && [...el.querySelectorAll('strong')].some((b) => /^[\d.,]+\s*€$/.test(b.textContent.trim()));

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
