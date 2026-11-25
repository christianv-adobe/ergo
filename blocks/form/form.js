/**
 * form — static structural rendering of an authored form (contact, consultation, filters).
 * Submission and live services are out of scope: the form never posts anywhere.
 *
 * Authoring (one row per field):
 *   | Label | Type | Placeholder or options | Help text (optional) |
 *   Type: text | email | tel | number | date | textarea | select | checkbox | radio | submit
 *         (unknown or missing -> text). Use "text, text" style pairs ("text+text") to put
 *         two inputs on one line; placeholders/options are then split on "|" or line breaks.
 *   Options for select/radio: a list (<ul>/<ol>) or one option per line/paragraph.
 *   A row with a single cell is rendered as a heading/intro/legal text row.
 *   A row whose only cell holds a picture becomes the form image (option `image`).
 *
 * @options dark-light | image
 */

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'date', 'textarea', 'select', 'checkbox', 'radio', 'submit', 'password', 'url'];

let fieldCounter = 0;

function nextId() {
  fieldCounter += 1;
  return `form-field-${fieldCounter}`;
}

function cellTextList(cell) {
  if (!cell) return [];
  const items = [...cell.querySelectorAll('li')];
  if (items.length) return items.map((li) => li.textContent.trim()).filter(Boolean);
  const paras = [...cell.querySelectorAll('p')];
  if (paras.length > 1) return paras.map((p) => p.textContent.trim()).filter(Boolean);
  return (cell.innerText || cell.textContent || '')
    .split(/\n|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normaliseType(raw) {
  const t = (raw || '').trim().toLowerCase();
  return FIELD_TYPES.includes(t) ? t : 'text';
}

function buildControl(type, id, label, placeholders, index) {
  const name = id;
  if (type === 'textarea') {
    const el = document.createElement('textarea');
    el.id = id;
    el.name = name;
    const [placeholder] = placeholders;
    if (placeholder) el.placeholder = placeholder;
    return el;
  }
  if (type === 'select') {
    const el = document.createElement('select');
    el.id = id;
    el.name = name;
    const [first, ...rest] = placeholders;
    const opts = placeholders.length > 1 ? rest : [];
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = first || '';
    ph.disabled = true;
    ph.selected = true;
    el.append(ph);
    opts.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      el.append(opt);
    });
    return el;
  }
  if (type === 'checkbox' || type === 'radio') {
    const group = document.createElement('div');
    group.className = 'form-choices';
    const choices = placeholders.length ? placeholders : [label];
    choices.forEach((c, i) => {
      const choiceId = `${id}-${i}`;
      const wrap = document.createElement('label');
      wrap.className = 'form-choice';
      wrap.htmlFor = choiceId;
      const input = document.createElement('input');
      input.type = type;
      input.id = choiceId;
      input.name = name;
      input.value = c;
      const span = document.createElement('span');
      span.textContent = c;
      wrap.append(input, span);
      group.append(wrap);
    });
    return group;
  }
  if (type === 'submit') {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'button';
    el.textContent = placeholders[0] || label || '';
    return el;
  }
  const el = document.createElement('input');
  el.type = type;
  el.id = index ? `${id}-${index}` : id;
  el.name = el.id;
  if (placeholders[index]) el.placeholder = placeholders[index];
  return el;
}

function buildField(cells) {
  const [labelCell, typeCell, valueCell, helpCell] = cells;
  const labelText = labelCell ? labelCell.textContent.trim() : '';
  const types = (typeCell ? typeCell.textContent : '')
    .split('+')
    .map(normaliseType);
  const primaryType = types[0];
  const values = cellTextList(valueCell);
  const id = nextId();

  const field = document.createElement('div');
  field.className = `form-field form-field-${primaryType}`;

  if (primaryType === 'submit') {
    field.append(buildControl('submit', id, labelText, values.length ? values : [labelText], 0));
    return field;
  }

  const label = document.createElement(primaryType === 'radio' || primaryType === 'checkbox' ? 'span' : 'label');
  label.className = 'form-label';
  if (label.tagName === 'LABEL') label.htmlFor = id;
  label.textContent = labelText;
  field.append(label);

  const controls = document.createElement('div');
  controls.className = 'form-controls';
  if (types.length > 1) {
    controls.classList.add('form-controls-split');
    types.forEach((t, i) => controls.append(buildControl(t, id, labelText, values, i)));
  } else {
    controls.append(buildControl(primaryType, id, labelText, values, 0));
  }
  field.append(controls);

  if (helpCell && helpCell.textContent.trim()) {
    const help = document.createElement('div');
    help.className = 'form-help';
    help.append(...helpCell.childNodes);
    controls.append(help);
  }
  return field;
}

export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'form-body';
  form.noValidate = true;
  form.addEventListener('submit', (e) => e.preventDefault());

  let media = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const nonEmpty = cells.filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
    if (!nonEmpty.length) return;
    if (nonEmpty.length === 1) {
      const cell = nonEmpty[0];
      if (!cell.textContent.trim() && cell.querySelector('picture, img')) {
        media = document.createElement('div');
        media.className = 'form-image';
        media.append(...cell.childNodes);
        return;
      }
      const text = document.createElement('div');
      text.className = 'form-text';
      text.append(...cell.childNodes);
      form.append(text);
      return;
    }
    form.append(buildField(cells));
  });

  block.replaceChildren();
  if (media) block.append(media);
  block.append(form);
}
