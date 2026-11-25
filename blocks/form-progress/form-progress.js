/**
 * form-progress — static progress header of a multi-step form.
 * Renders authored content only; step navigation and live form state are out of scope.
 *
 * Default (progress bar) authoring, one row:
 *   | Step counter + step title (e.g. "Schritt 1 von 3" / "Termin auswählen") | Next step text |
 *   The bar width comes from the first "N von M" / "N of M" / "N/M" found in the block.
 *
 * Option `stepper` (numbered step indicator), one row per step:
 *   | Step title | optional "current" (or bold the current title) |
 *   A single cell holding a list also works (one <li> per step, bold = current).
 *
 * @options stepper
 */

const COUNT_RE = /(\d+)\s*(?:von|of|\/)\s*(\d+)/i;
const CURRENT_RE = /^(current|active|aktiv|aktuell)$/i;

function decorateStepper(block) {
  const steps = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const first = cells[0];
    if (!first) return;
    const items = [...first.querySelectorAll('li')];
    if (items.length) {
      items.forEach((li) => steps.push({
        text: li.textContent.trim(),
        current: !!li.querySelector('strong, b'),
      }));
      return;
    }
    const text = first.textContent.trim();
    if (!text) return;
    const flag = cells[1] ? cells[1].textContent.trim() : '';
    steps.push({ text, current: CURRENT_RE.test(flag) || !!first.querySelector('strong, b') });
  });

  let currentIndex = steps.findIndex((s) => s.current);
  if (currentIndex < 0) currentIndex = 0;

  const ol = document.createElement('ol');
  ol.className = 'form-progress-steps';
  steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'form-progress-step';
    if (i < currentIndex) li.classList.add('is-done');
    if (i === currentIndex) {
      li.classList.add('is-current');
      li.setAttribute('aria-current', 'step');
    }
    const num = document.createElement('span');
    num.className = 'form-progress-step-number';
    num.textContent = String(i + 1);
    const label = document.createElement('span');
    label.className = 'form-progress-step-label';
    label.textContent = s.text.replace(/^\d+\s*[.)]?\s*/, '');
    li.append(num, label);
    ol.append(li);
  });

  // compact header ("Step N: title"), shown where step labels are hidden (mobile)
  const header = document.createElement('div');
  header.className = 'form-progress-header';
  const current = steps[currentIndex];
  if (current) {
    const title = document.createElement('span');
    title.textContent = current.text.replace(/^\d+\s*[.)]?\s*/, '');
    header.append(`Step ${currentIndex + 1}: `, title);
  }
  block.replaceChildren(header, ol);
}

/* "Nächster Schritt: Persönliche Daten" -> label + emphasised title, when authored as plain text */
function splitNextText(cell) {
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  const el = only && only.tagName === 'P' ? only : cell;
  if (el.children.length) return;
  const m = el.textContent.trim().match(/^([^:]+:)\s*(.+)$/);
  if (!m) return;
  const [, labelText, titleText] = m;
  const label = document.createElement('span');
  label.className = 'form-progress-next-label';
  label.textContent = labelText;
  const title = document.createElement('strong');
  title.className = 'form-progress-next-title';
  title.textContent = titleText;
  el.replaceChildren(label, ' ', title);
}

function decorateBar(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => c.textContent.trim());
  const [currentCell, ...nextCells] = cells;

  const head = document.createElement('div');
  head.className = 'form-progress-head';
  if (currentCell) {
    const current = document.createElement('div');
    current.className = 'form-progress-current';
    current.append(...currentCell.childNodes);
    head.append(current);
  }
  nextCells.forEach((cell) => {
    const next = document.createElement('div');
    next.className = 'form-progress-next';
    next.append(...cell.childNodes);
    splitNextText(next);
    head.append(next);
  });

  const match = head.textContent.match(COUNT_RE);
  let percent = 0;
  if (match) {
    const n = Number(match[1]);
    const total = Number(match[2]);
    if (total > 0) percent = Math.min(100, Math.max(0, (n / total) * 100));
  }

  const bar = document.createElement('div');
  bar.className = 'form-progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', String(Math.round(percent)));
  const fill = document.createElement('span');
  fill.className = 'form-progress-bar-fill';
  fill.style.width = `${percent}%`;
  bar.append(fill);

  block.replaceChildren(head, bar);
}

export default function decorate(block) {
  if (block.classList.contains('stepper')) decorateStepper(block);
  else decorateBar(block);
}
