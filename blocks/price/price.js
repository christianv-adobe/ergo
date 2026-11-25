/**
 * price — inline "from" price line: prefix, amount, period, optional info tooltip.
 *
 * Authoring, one row:
 *   | Price line, e.g. "Beitrag z. B. **24,15 €** monatlich" | Info text (optional) |
 *   The amount is the bold text; without bold, the first "<number> €" in the text is used.
 *   The optional second cell becomes an info toggle that reveals the authored text.
 */

const AMOUNT_RE = /(\d[\d.,]*\s*(?:€|EUR))/;

function textSpan(cls, text) {
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = text;
  return span;
}

function buildLine(cell) {
  const line = document.createElement('p');
  line.className = 'price-line';
  const strong = cell.querySelector('strong, b');
  const text = cell.textContent.replace(/\s+/g, ' ').trim();

  let amount = '';
  if (strong) amount = strong.textContent.trim();
  else {
    const m = text.match(AMOUNT_RE);
    if (m) [, amount] = m;
  }
  if (!amount) {
    line.append(textSpan('price-prefix', text));
    return line;
  }
  const idx = text.indexOf(amount);
  const before = idx >= 0 ? text.slice(0, idx).trim() : '';
  const after = idx >= 0 ? text.slice(idx + amount.length).trim() : '';
  if (before) line.append(textSpan('price-prefix', before));
  line.append(textSpan('price-amount', amount));
  if (after) line.append(textSpan('price-suffix', after));
  return line;
}

let infoCounter = 0;

function buildInfo(cell, line) {
  infoCounter += 1;
  const id = `price-info-${infoCounter}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'price-info-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', id);
  button.setAttribute('aria-label', 'Info');
  button.textContent = 'i';

  const panel = document.createElement('div');
  panel.className = 'price-info';
  panel.id = id;
  panel.hidden = true;
  panel.append(...cell.childNodes);

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
  line.append(button);
  return panel;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => c.textContent.trim());
  if (!cells.length) return;
  const [lineCell, infoCell] = cells;
  const line = buildLine(lineCell);
  const parts = [line];
  if (infoCell) parts.push(buildInfo(infoCell, line));
  block.replaceChildren(...parts);
}
