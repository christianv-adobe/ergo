/**
 * article-header — listing/article lead band (canon c14 .cmp-article-header): teaser (page h1
 * as a small kicker, serif brand-coloured title line, teaser text) beside a full-height image;
 * full-bleed, capped at 1440. Template-slotted (stardust/eds-schema/de-ratgeber.json
 * § article-header).
 *
 * Authoring (any row/cell shape; classified by content, never by index):
 *   - the page <h1> (kicker)
 *   - the title line: first text paragraph after the h1
 *   - further text paragraphs: teaser text
 *   - one image (editorial, content.da.live)
 *
 * Also hosts the listing page layer (metadata `Theme: narrow`) in its CSS — stopgap pending
 * the foundation request (stardust/rollout/foundation-requests.md).
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

const isMedia = (el) => el.matches('picture, img')
  || (el.tagName === 'P' && el.querySelector('picture, img') && !el.textContent.trim());

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const inner = document.createElement('div');
  inner.className = 'article-header-inner';
  const teaser = document.createElement('div');
  teaser.className = 'article-header-teaser';
  const image = document.createElement('div');
  image.className = 'article-header-image';
  const rest = [];
  let heading = null;
  let title = null;
  const text = document.createElement('div');
  text.className = 'teaser-text';
  nodes.forEach((el) => {
    if (isMedia(el)) {
      if (!image.children.length) {
        image.append(el.matches('picture, img') ? el : el.querySelector('picture, img'));
      } else rest.push(el);
    } else if (!heading && /^H[1-6]$/.test(el.tagName)) {
      heading = el;
    } else if (heading && !title && el.tagName === 'P') {
      title = el;
    } else {
      text.append(el);
    }
  });
  if (heading) teaser.append(wrapNode(heading, 'teaser-headline'));
  if (title) teaser.append(wrapNode(title, 'teaser-title'));
  if (text.children.length) teaser.append(text);
  // leftovers (a second image) stay visible after the teaser text
  rest.forEach((el) => teaser.append(el));
  inner.append(teaser);
  if (image.children.length) inner.append(image);
  else block.classList.add('no-image');
  block.replaceChildren(inner);
}
