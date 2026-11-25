/**
 * benefits — framed/boxed list of benefit items (canon c16 .benefits), optional flag.
 * Reconstructive (repeat group): one item per heading (schema § benefits, unit DIV.benefits__item).
 *
 * Authoring (rows are not significant — content is segmented on the item heading):
 *   - optional flag: text paragraph(s) BEFORE the first item (e.g. "Einige Beispiele …")
 *   - per item: optional icon paragraph (`:icon-name:`), the item title as a heading (h3),
 *     then the item text (paragraphs / lists)
 *   - without item headings the block is ONE rich-text item; a flag is then authored as its
 *     own first row (text paragraphs only) above the content row(s)
 *
 * @variants block class: frame | box (default frame) · grey | green | teal | magenta | orange
 *   | yellow (accent colour) · flag-center | flag-right (default flag left) · check-list
 *   (list items with the canon black check icon)
 *
 * A block holding only one short text paragraph (no heading, link, image or list) is a flag on
 * its own (`flag-only`): the import splits a framed box's flag from its items, so the flag sits
 * over the top edge of a benefits block that follows it. An icon paragraph inside the item text
 * followed by a paragraph renders as an icon row (icon at the line start, text indented).
 */

import { decorateIcons } from '../../scripts/aem.js';

// a raw (unrendered) document still carries `:icon:` tokens as text (local preview of
// imported .plain.html); render them as the pipeline does: <span class="icon icon-name"><img>
const ICON_TOKEN = /^\s*:([a-z][a-z0-9-]*):\s*$/;
function renderIconTokens(block) {
  let hits = 0;
  block.querySelectorAll('p').forEach((p) => {
    if (p.children.length) return;
    const m = ICON_TOKEN.exec(p.textContent);
    if (!m) return;
    const span = document.createElement('span');
    span.className = `icon icon-${m[1]}`;
    p.replaceChildren(span);
    hits += 1;
  });
  if (hits) decorateIcons(block);
}

const FLAG_MAX = 48;
/** one short plain-text paragraph and nothing else: a flag authored as its own block */
function isFlagOnly(block) {
  const rows = [...block.children];
  if (rows.length !== 1) return false;
  const cells = [...rows[0].children];
  if (cells.length !== 1) return false;
  const kids = [...cells[0].children];
  if (kids.length > 1 || (kids[0] && kids[0].tagName !== 'P')) return false;
  if (cells[0].querySelector('a, picture, img, .icon')) return false;
  const text = cells[0].textContent.replace(/\s+/g, ' ').trim();
  return !!text && text.length <= FLAG_MAX && !/[.!?]$/.test(text);
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    out.push(...cell.children);
  });
  return out;
}

const isIconPara = (el) => el.tagName === 'P' && el.querySelector('.icon') && !el.textContent.trim();

function iconRows(items) {
  items.querySelectorAll('.benefits-item-text').forEach((text) => {
    [...text.children].forEach((el) => {
      const next = el.nextElementSibling;
      if (!isIconPara(el) || !next || isIconPara(next)) return;
      const row = document.createElement('div');
      row.className = 'benefits-icon-row';
      el.replaceWith(row);
      el.classList.add('benefits-icon-row-icon');
      row.append(el, next);
    });
  });
}

export default function decorate(block) {
  renderIconTokens(block);
  if (isFlagOnly(block)) {
    const cell = block.querySelector(':scope > div > div');
    const flagEl = document.createElement('div');
    flagEl.className = 'benefits-flag';
    const p = cell.querySelector('p') || document.createElement('p');
    if (!p.parentElement) p.textContent = cell.textContent.trim();
    flagEl.append(p);
    const flag = document.createElement('div');
    flag.className = 'benefits-flag-container';
    flag.append(flagEl);
    block.classList.add('flag-only');
    block.replaceChildren(flag);
    return;
  }
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const headTag = (() => {
    const counts = {};
    nodes.filter((n) => /^H[1-6]$/.test(n.tagName)).forEach((n) => {
      counts[n.tagName] = (counts[n.tagName] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
  })();

  const flag = document.createElement('div');
  flag.className = 'benefits-flag-container';
  const items = document.createElement('div');
  items.className = 'benefits-items';

  let pendingIcon = null;
  let current = null;
  const openItem = () => {
    current = document.createElement('div');
    current.className = 'benefits-item';
    items.append(current);
    return current;
  };

  let body = nodes;
  if (!headTag) {
    // headingless: a first row of plain paragraphs above further rows is the flag
    const rows = [...block.children];
    const firstRow = rows.length > 1 ? [...rows[0].querySelectorAll(':scope > div > *')] : [];
    if (firstRow.length && firstRow.every((el) => el.tagName === 'P' && !el.querySelector('a, picture, img'))) {
      firstRow.forEach((el) => {
        const f = document.createElement('div');
        f.className = 'benefits-flag';
        f.append(el);
        flag.append(f);
      });
      body = nodes.filter((el) => !firstRow.includes(el));
    }
    const text = document.createElement('div');
    text.className = 'benefits-item-text';
    openItem().append(text);
  }

  body.forEach((el, i) => {
    // an icon paragraph right before an item heading is the item's icon; elsewhere it is content
    if (headTag && isIconPara(el) && body[i + 1] && body[i + 1].tagName === headTag) {
      pendingIcon = el;
      return;
    }
    if (headTag && el.tagName === headTag) {
      const item = openItem();
      if (pendingIcon) {
        item.classList.add('has-icon');
        const icon = document.createElement('div');
        icon.className = 'benefits-item-icon';
        icon.append(pendingIcon);
        item.append(icon);
        pendingIcon = null;
      }
      const title = document.createElement('div');
      title.className = 'benefits-item-title';
      title.append(el);
      item.append(title);
      const text = document.createElement('div');
      text.className = 'benefits-item-text';
      item.append(text);
      return;
    }
    if (!current) {
      // before the first item: the flag
      const f = document.createElement('div');
      f.className = 'benefits-flag';
      f.append(el);
      flag.append(f);
      return;
    }
    current.querySelector('.benefits-item-text').append(el);
  });
  // leftovers: an icon with no item heading after it stays visible
  if (pendingIcon) (current || items).append(pendingIcon);

  iconRows(items);
  const parts = [];
  if (flag.children.length) parts.push(flag);
  parts.push(items);
  block.replaceChildren(...parts);
}
