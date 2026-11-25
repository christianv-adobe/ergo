/**
 * calculator — static structural rendering of an authored calculator / tariff configurator.
 *
 * No calculation, no live services and no submission: the block shows the fields, labels,
 * options, values and result table exactly as authored.
 *
 * Authoring (one row per item):
 * - 1 cell, heading or text            -> intro / panel heading
 * - 1 cell containing a table          -> result table (kept as authored)
 * - 2-3 cells: label | control | hint  -> one field
 *   control cell:
 *     "select" + list, or just a list   -> <select>; a <strong> item is the selected option
 *     "checkbox" (or "[ ]" / "[x]")    -> checkbox, label taken from the label cell
 *     "range: <value>"                  -> range slider with the authored value displayed
 *     "date"                            -> day / month / year inputs
 *     "input: <value>" / "search: <v>"  -> text / search input with the authored placeholder
 *     anything else                     -> static value output (e.g. "67 Jahre")
 * - a row whose first cell reads "results" (or "ergebnis") starts the result panel
 *
 * Options (block classes): light, light-2, light-3, alt (results stacked below inputs),
 * magenta-shadow-light, cyan-dark-shadow-light (carded panels).
 */

let fieldCounter = 0;

function nextId() {
  fieldCounter += 1;
  return `calculator-field-${fieldCounter}`;
}

function cellText(cell) {
  return (cell?.textContent || '').replace(/\s+/g, ' ').trim();
}

function parseControl(cell) {
  const list = cell.querySelector('ul, ol');
  const text = cellText(cell);
  const match = text.match(/^(select|checkbox|range|date|input|search|text|number)\b\s*:?\s*(.*)$/i);
  if (list) return { type: 'select', list };
  if (/^\[\s*x?\s*\]/i.test(text)) return { type: 'checkbox', checked: /^\[\s*x/i.test(text) };
  if (match) {
    const type = match[1].toLowerCase();
    return { type: type === 'text' || type === 'number' ? 'input' : type, value: match[2] };
  }
  return { type: 'value', value: text };
}

function buildSelect(id, list) {
  const select = document.createElement('select');
  select.id = id;
  [...list.querySelectorAll(':scope > li')].forEach((li) => {
    const option = document.createElement('option');
    option.textContent = cellText(li);
    if (li.querySelector('strong, b')) option.selected = true;
    select.append(option);
  });
  return select;
}

function buildDate(id) {
  const wrap = document.createElement('div');
  wrap.className = 'calculator-date';
  [['TT', 2], ['MM', 2], ['JJJJ', 4]].forEach(([placeholder, size], i) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.placeholder = placeholder;
    input.size = size;
    if (i === 0) input.id = id;
    wrap.append(input);
  });
  return wrap;
}

function buildField(cells) {
  const [labelCell, controlCell, hintCell] = cells;
  const control = parseControl(controlCell);
  const id = nextId();
  const field = document.createElement('div');
  field.className = `calculator-field calculator-field-${control.type}`;

  const label = document.createElement(control.type === 'value' ? 'div' : 'label');
  label.className = 'calculator-label';
  label.append(...labelCell.childNodes);
  if (control.type !== 'value') label.htmlFor = id;

  let input;
  if (control.type === 'select') {
    input = buildSelect(id, control.list);
  } else if (control.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = !!control.checked;
  } else if (control.type === 'range') {
    input = document.createElement('div');
    input.className = 'calculator-range';
    const range = document.createElement('input');
    range.type = 'range';
    range.id = id;
    const output = document.createElement('output');
    output.htmlFor = id;
    // numbers in the displayed value are emphasised ("<strong>40.000</strong> €")
    control.value.split(/(\d[\d.,]*)/).forEach((part, i) => {
      if (!part) return;
      if (i % 2) {
        const strong = document.createElement('strong');
        strong.textContent = part;
        output.append(strong);
      } else {
        output.append(part);
      }
    });
    input.append(range, output);
  } else if (control.type === 'date') {
    input = buildDate(id);
  } else if (control.type === 'input' || control.type === 'search') {
    const textInput = document.createElement('input');
    textInput.type = control.type === 'search' ? 'search' : 'text';
    textInput.id = id;
    // "25 Jahre" / "z.B. 25 Jahre": trailing word after a number is the unit adornment
    const [, text, unit] = (control.value || '').match(/^(.*\d)\s+(\D+)$/) || [null, control.value || '', ''];
    if (/^[\d.,]+$/.test(text)) {
      textInput.value = text;
      textInput.inputMode = 'numeric';
    } else {
      textInput.placeholder = text;
    }
    if (unit) {
      input = document.createElement('span');
      input.className = 'calculator-input';
      const adornment = document.createElement('span');
      adornment.className = 'calculator-unit';
      adornment.textContent = unit.trim();
      input.append(textInput, adornment);
    } else {
      input = textInput;
    }
  } else {
    input = document.createElement('div');
    input.className = 'calculator-value';
    input.append(...controlCell.childNodes);
  }

  if (control.type === 'checkbox') field.append(input, label);
  else field.append(label, input);

  if (hintCell && cellText(hintCell)) {
    const hint = document.createElement('div');
    hint.className = 'calculator-hint';
    hint.append(...hintCell.childNodes);
    field.append(hint);
  }
  return field;
}

export default function decorate(block) {
  const inputs = document.createElement('div');
  inputs.className = 'calculator-inputs';
  const results = document.createElement('div');
  results.className = 'calculator-results';
  let target = inputs;

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.nodeType === 1);
    if (!cells.length) return;
    const first = cellText(cells[0]).toLowerCase();

    if (cells.length > 1 && /^(results?|ergebnis(se)?)$/.test(first)) {
      target = results;
      const intro = document.createElement('div');
      intro.className = 'calculator-intro';
      intro.append(...cells.slice(1).flatMap((c) => [...c.childNodes]));
      if (intro.textContent.trim() || intro.querySelector('picture, table')) results.append(intro);
      return;
    }

    if (cells.length === 1 || cells.slice(1).every((c) => !cellText(c) && !c.querySelector('*'))) {
      const item = document.createElement('div');
      item.className = cells[0].querySelector('table') ? 'calculator-table' : 'calculator-intro';
      item.append(...cells[0].childNodes);
      target.append(item);
      return;
    }

    target.append(buildField(cells));
  });

  // text-only blocks with several headed parts (e.g. tariff comparisons): one group per heading
  const headed = [...inputs.children].filter((item) => item.querySelector(':scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6'));
  if (headed.length > 1 && !inputs.querySelector('.calculator-field')) {
    let group;
    [...inputs.children].forEach((item) => {
      if (headed.includes(item) || !group) {
        group = document.createElement('div');
        group.className = 'calculator-group';
        inputs.append(group);
      }
      group.append(item);
    });
    block.classList.add('calculator-has-groups');
  }

  block.replaceChildren(inputs);
  if (results.children.length) {
    block.append(results);
    block.classList.add('calculator-has-results');
  }
}
