/**
 * product-table — canon tariff comparison table (productTable.min.css): label column +
 * N tariff columns, coloured header row, sticky header + group sub-headings, zebra rows.
 * Reconstructive (repeat group, schema § product-table).
 *
 * Authoring: one block row per table row.
 *   - multi-cell row: label cell | tariff cell … (text, or an icon paragraph `:check:`,
 *     `:close:`, `:calculator:`)
 *   - single-cell row: a group sub-heading (h3) — the rows after it form its group
 *   - the HEADER row is the last multi-cell row before the first group sub-heading or the
 *     first icon row (falls back to the first row); headings in cells render teaser-size
 *
 * @variants block class: label-4 | label-6 (label column width in 12ths at ≥912, default 6)
 *   · green | magenta | teal | yellow | orange | grey | dark (header colour)
 *   · sticky (header row + sub-headings stick under the site header; pinned header shows
 *     only the first line of each cell)
 */

const isIconOnly = (cell) => !!cell && !!cell.querySelector('.icon, img, picture') && !cell.textContent.trim();

const AMOUNT = /^([\d.,\s]*\d[\d.,]*)\s*(€|EUR)$/;

/**
 * Price cell (parser output "prefix **27,02 €** suffix") -> canon cmp-price stack:
 * prefix line, bold value + currency, suffix line.
 */
function decoratePrice(cell) {
  const els = [...cell.children];
  const line = els.length === 1 && els[0].tagName === 'P' ? els[0] : null;
  const host = line || (els.length === 1 && els[0].tagName === 'STRONG' ? cell : null);
  if (!host) return;
  const nodes = [...host.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
  const strongs = nodes.filter((n) => n.nodeType === 1);
  if (strongs.length !== 1 || strongs[0].tagName !== 'STRONG') return;
  const m = strongs[0].textContent.trim().replace(/\u00a0/g, ' ').match(AMOUNT);
  if (!m) return;
  const at = nodes.indexOf(strongs[0]);
  const text = (list) => list.map((n) => n.textContent).join(' ').trim();
  const span = (cls, txt) => {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = txt;
    return s;
  };
  const p = document.createElement('p');
  p.className = 'pt-price';
  const prefix = text(nodes.slice(0, at));
  const suffix = text(nodes.slice(at + 1));
  if (prefix) p.append(span('pt-price-prefix', prefix));
  p.append(span('pt-price-value', m[1].trim()), span('pt-price-currency', `\u00a0${m[2]}`));
  if (suffix) p.append(span('pt-price-suffix', suffix));
  host.replaceChildren(p);
}

function cellEl(source, kind, role, tariffCols) {
  const cell = document.createElement('div');
  cell.className = `pt-cell pt-cell-${kind}`;
  if (kind === 'label') cell.classList.add(`has-tariff-cols-${Math.min(tariffCols, 3)}`);
  cell.setAttribute('role', role);
  if (source && isIconOnly(source)) {
    const icon = document.createElement('div');
    icon.className = 'pt-icon';
    icon.append(...source.children);
    cell.append(icon);
  } else {
    const text = document.createElement('div');
    text.className = 'pt-text';
    if (source) {
      if (kind === 'tariff') decoratePrice(source);
      text.append(...source.children);
    }
    cell.append(text);
  }
  return cell;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;
  const sticky = block.classList.contains('sticky');
  const isSub = (row) => row.children.length === 1 && row.textContent.trim();
  const isIconRow = (row) => row.children.length > 1 && [...row.children].slice(1).some(isIconOnly);

  const firstData = rows.findIndex((r) => isSub(r) || isIconRow(r));
  // a one-row block (a single comparison row cut out of its table) has no header
  let headerIdx = rows.length > 1 ? 0 : -1;
  if (firstData > 0) {
    for (let i = firstData - 1; i >= 0; i -= 1) {
      if (rows[i].children.length > 1) {
        headerIdx = i;
        break;
      }
    }
  }

  const table = document.createElement('div');
  table.className = 'pt-table';
  table.setAttribute('role', 'table');
  let group = null;

  rows.forEach((row, i) => {
    const cells = [...row.children];
    if (isSub(row)) {
      group = document.createElement('div');
      group.className = 'pt-group';
      if (sticky) group.classList.add('is-sticky');
      group.setAttribute('role', 'rowgroup');
      const sub = document.createElement('div');
      sub.className = 'pt-subheading';
      sub.setAttribute('role', 'row');
      const c = document.createElement('div');
      c.className = 'pt-cell pt-text';
      c.setAttribute('role', 'cell');
      c.append(...cells[0].children);
      sub.append(c);
      group.append(sub);
      table.append(group);
      return;
    }
    const header = i === headerIdx;
    const r = document.createElement('div');
    r.className = 'pt-row';
    r.setAttribute('role', 'row');
    if (header) {
      r.classList.add('pt-row-header');
      if (sticky) r.classList.add('is-sticky');
    }
    const tariffCols = Math.max(cells.length - 1, 1);
    r.append(cellEl(cells[0], 'label', header ? 'columnheader' : 'rowheader', tariffCols));
    cells.slice(1).forEach((c) => r.append(cellEl(c, 'tariff', header ? 'columnheader' : 'cell', tariffCols)));
    (group && !header ? group : table).append(r);
  });

  block.replaceChildren(table);

  if (sticky) {
    const head = table.querySelector('.pt-row-header.is-sticky');
    if (head) {
      const sync = () => {
        const top = parseFloat(getComputedStyle(head).top) || 0;
        const stuck = head.getBoundingClientRect().top <= top + 0.5
          && table.getBoundingClientRect().top < top;
        head.classList.toggle('is-pinned', stuck);
      };
      document.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    }
  }
}
