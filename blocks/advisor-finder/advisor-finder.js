/**
 * advisor-finder — static structural rendering of the advisor search results:
 * heading, filter / sort controls, result summary, advisor list and a map panel.
 *
 * No live search, no geolocation, no map embed: authored content is shown as-is.
 * The map panel only shows the authored consent notice / placeholder content.
 *
 * Authoring (one row per item, in this order):
 * - 1 cell with a heading                      -> title ("ERGO Berater / Dinslaken")
 * - label | list                               -> filter or sort control (select of list items;
 *                                                 a bold item is the selected one)
 * - 1 cell of text                             -> result summary ("100 ERGO Berater gefunden")
 * - picture | details | optional badge         -> one advisor (details: rating, name, address,
 *                                                 distance, links as authored)
 * - "Map" (or "Karte") | content               -> map panel (consent notice, button)
 *   Rows after the last advisor also go to the map panel.
 *
 * Options: no-map (list only, the map panel is not rendered).
 */

function cellText(cell) {
  return (cell?.textContent || '').replace(/\s+/g, ' ').trim();
}

// mobile shows the list in pages (source: "5 von 100 Ergebnissen wurden angezeigt")
const PAGE_SIZE = 5;

function buildControl(labelCell, list, index) {
  const id = `advisor-finder-control-${index}`;
  const wrap = document.createElement('div');
  wrap.className = 'advisor-finder-control';
  const labelText = cellText(labelCell);
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  const select = document.createElement('select');
  select.id = id;
  const items = [...list.querySelectorAll(':scope > li')];
  // "Sortieren:Bewertung" under label "Sortieren": show "Sortieren:" + "Bewertung"
  const prefix = `${labelText.toLowerCase()}:`;
  const prefixed = labelText && items.length
    && items.every((li) => cellText(li).toLowerCase().startsWith(prefix));
  if (prefixed) label.textContent = `${labelText}:`;
  items.forEach((li) => {
    const option = document.createElement('option');
    const text = cellText(li);
    option.textContent = prefixed ? text.slice(prefix.length).trim() : text;
    if (li.querySelector('strong, b')) option.selected = true;
    select.append(option);
  });
  wrap.append(label, select);
  return wrap;
}

/* name the detail paragraphs: rating, name, address, distance, links */
function decorateDetails(part) {
  [...part.querySelectorAll(':scope > p')].forEach((p) => {
    const text = cellText(p);
    const rating = text.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)$/);
    if (rating) {
      p.className = 'advisor-finder-rating';
      const value = parseFloat(rating[1].replace(',', '.'));
      const max = parseFloat(rating[2]) || 5;
      p.style.setProperty('--rating', Math.max(0, Math.min(1, value / max)).toFixed(3));
      p.setAttribute('aria-label', `${rating[1]} / ${rating[2]}`);
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      span.textContent = `/${rating[2]}`;
      strong.append(rating[1], span);
      p.replaceChildren(strong);
    } else if (p.querySelector('a')) {
      p.className = 'advisor-finder-links';
    } else if (/^\(.*\)$/.test(text)) {
      p.className = 'advisor-finder-distance';
    } else if (p.querySelector('strong, b') && cellText(p.querySelector('strong, b')) === text) {
      p.className = 'advisor-finder-name';
    } else if (text) {
      p.className = 'advisor-finder-address';
    }
  });
  // the distance runs on with the address line: "Kaiserstr. 15, 51145 Köln (10.6 km)"
  part.querySelectorAll(':scope > .advisor-finder-address + .advisor-finder-distance').forEach((p) => {
    const span = document.createElement('span');
    span.className = 'advisor-finder-distance';
    span.append(...p.childNodes);
    p.previousElementSibling.append(span);
    p.remove();
  });
}

function buildAdvisor(cells) {
  const li = document.createElement('li');
  li.className = 'advisor-finder-item';
  cells.forEach((cell, i) => {
    if (!cellText(cell) && !cell.querySelector('picture, img')) return;
    const part = document.createElement('div');
    if (cell.querySelector('picture, img') && !cellText(cell)) part.className = 'advisor-finder-image';
    else if (i === cells.length - 1 && i > 1) {
      part.className = 'advisor-finder-badge';
      const brand = cellText(cell).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (brand) part.classList.add(`advisor-finder-badge-${brand}`);
    } else part.className = 'advisor-finder-details';
    part.append(...cell.childNodes);
    if (part.classList.contains('advisor-finder-details')) decorateDetails(part);
    li.append(part);
  });
  return li;
}

/* summary "100 ERGO Berater ..." -> bold count */
function decorateSummary(item) {
  const first = item.querySelector('p') || item;
  const { firstChild: node } = first;
  if (node?.nodeType !== Node.TEXT_NODE) return;
  const match = node.textContent.match(/^\s*(\d+)\s+/);
  if (!match) return;
  const strong = document.createElement('strong');
  [, strong.textContent] = match;
  node.textContent = node.textContent.slice(match[0].length);
  first.prepend(strong);
}

/* mobile paging: show PAGE_SIZE advisors, "load more" reveals the next page */
function buildPager(list, total) {
  const items = [...list.children];
  if (items.length <= PAGE_SIZE) return null;
  const pager = document.createElement('div');
  pager.className = 'advisor-finder-pager';
  const status = document.createElement('p');
  status.className = 'advisor-finder-counter';
  status.setAttribute('aria-live', 'polite');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'advisor-finder-more';
  button.textContent = 'Weitere Ergebnisse laden';
  let shown = 0;
  const show = (count) => {
    shown = Math.min(items.length, count);
    items.forEach((li, i) => li.classList.toggle('advisor-finder-item-hidden', i >= shown));
    const strong = document.createElement('strong');
    strong.textContent = `${shown} von ${Math.max(total, items.length)}`;
    status.replaceChildren(strong, ' Ergebnissen wurden angezeigt');
    button.hidden = shown >= items.length;
  };
  button.addEventListener('click', () => show(shown + PAGE_SIZE));
  show(PAGE_SIZE);
  pager.append(status, button);
  return pager;
}

export default function decorate(block) {
  const noMap = block.classList.contains('no-map');
  const head = document.createElement('div');
  head.className = 'advisor-finder-head';
  const controls = document.createElement('div');
  controls.className = 'advisor-finder-controls';
  // sort controls sit below the result summary (filters above it)
  const sort = document.createElement('div');
  sort.className = 'advisor-finder-sort';
  const list = document.createElement('ul');
  list.className = 'advisor-finder-list';
  const map = document.createElement('div');
  map.className = 'advisor-finder-map';

  let controlIndex = 0;
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const first = cellText(cells[0]).toLowerCase();

    if (cells.length > 1 && /^(map|karte)$/.test(first)) {
      cells.slice(1).forEach((c) => map.append(...c.childNodes));
      return;
    }
    if (cells[0].querySelector('picture, img')) {
      list.append(buildAdvisor(cells));
      return;
    }
    const listEl = cells.length > 1 && cells[1].querySelector('ul, ol');
    if (listEl) {
      controlIndex += 1;
      const target = /^(sort|sortieren|sortierung)/.test(first) ? sort : controls;
      target.append(buildControl(cells[0], listEl, controlIndex));
      return;
    }
    // trailing rows after the advisor list belong to the map panel
    if (list.children.length) {
      cells.forEach((c) => map.append(...c.childNodes));
      return;
    }
    const item = document.createElement('div');
    item.className = cells[0].querySelector('h1, h2, h3, h4, h5, h6')
      ? 'advisor-finder-title' : 'advisor-finder-summary';
    cells.forEach((c) => item.append(...c.childNodes));
    head.append(item);
  });

  const results = document.createElement('div');
  results.className = 'advisor-finder-results';
  // keep the title first, then controls, then the summary line
  const title = head.querySelector('.advisor-finder-title');
  if (title) results.append(title);
  if (controls.children.length) results.append(controls);
  head.querySelectorAll('.advisor-finder-summary').forEach(decorateSummary);
  const total = parseInt(cellText(head.querySelector('.advisor-finder-summary')), 10) || 0;
  results.append(...head.children);
  if (sort.children.length) results.append(sort);
  if (list.children.length) {
    results.append(list);
    const pager = buildPager(list, total);
    if (pager) results.append(pager);
  }

  block.replaceChildren(results);
  if (!noMap && map.childNodes.length) {
    // consent notice card: the title paragraph, the text and the accept label
    const card = document.createElement('div');
    card.className = 'advisor-finder-map-card';
    card.append(...map.childNodes);
    const paras = [...card.querySelectorAll(':scope > p')];
    const titleP = paras[0];
    if (titleP && titleP.querySelector('strong, b')
      && cellText(titleP.querySelector('strong, b')) === cellText(titleP)) {
      titleP.className = 'advisor-finder-map-title';
    }
    const last = paras[paras.length - 1];
    if (last && last !== titleP && !last.querySelector('a') && cellText(last).length < 40) {
      last.className = 'advisor-finder-map-action';
    }
    map.append(card);
    block.append(map);
    block.classList.add('advisor-finder-has-map');
  }
}
