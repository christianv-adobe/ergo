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
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    out.push(...cell.children);
  });
  return out;
}

const isIconPara = (el) => el.tagName === 'P' && el.querySelector('.icon') && !el.textContent.trim();

export default function decorate(block) {
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

  body.forEach((el) => {
    if (isIconPara(el)) {
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

  const parts = [];
  if (flag.children.length) parts.push(flag);
  parts.push(items);
  block.replaceChildren(...parts);
}
