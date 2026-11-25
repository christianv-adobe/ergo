import { toClassName, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

let blockCount = 0;

// a raw (unrendered) document still carries `:icon:` tokens as text (local preview of
// imported .plain.html); render them as the pipeline does: <span class="icon icon-name">
const ICON_TOKEN = /:([a-z][a-z0-9-]*):/g;
function renderIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (ICON_TOKEN.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
    ICON_TOKEN.lastIndex = 0;
  }
  hits.forEach((node) => {
    const frag = document.createDocumentFragment();
    let last = 0;
    node.nodeValue.replace(ICON_TOKEN, (m, name, at) => {
      if (at > last) frag.append(node.nodeValue.slice(last, at));
      const span = document.createElement('span');
      span.className = `icon icon-${name}`;
      frag.append(span);
      last = at + m.length;
      return m;
    });
    if (last < node.nodeValue.length) frag.append(node.nodeValue.slice(last).replace(/^\s+/, ''));
    node.replaceWith(frag);
  });
  if (hits.length) decorateIcons(root);
}

/** exposes each icon's svg as a mask source so CSS can tint it (stepper dots, notes) */
function maskIcons(root) {
  const base = (window.hlx && window.hlx.codeBasePath) || '';
  root.querySelectorAll('.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-'));
    if (name) icon.style.setProperty('--tabs-content-icon', `url("${base}/icons/${name.slice(5)}.svg")`);
  });
}

/**
 * icon-stepper panel: kicker (tab label), title + intro, then the authored
 * value/heading groups as side-by-side boxes and icon paragraphs as notes.
 * @param {Element} panel
 * @param {string} labelText
 */
function structureStepperPanel(panel, labelText) {
  const cells = [...panel.querySelectorAll(':scope > .tabs-content-panel-cell')];
  if (cells.length !== 1) return;
  const cell = cells[0];
  const intro = [];
  const boxes = [];
  const after = [];
  const notes = [];
  let box = null;
  [...cell.children].forEach((el) => {
    const first = el.firstElementChild;
    const isNote = el.tagName === 'P' && first && el.firstChild === first
      && first.classList.contains('icon');
    const isBig = el.tagName === 'P' && el.children.length === 1 && first.tagName === 'STRONG'
      && el.textContent.trim() === first.textContent.trim();
    const isHead = /^H[4-6]$/.test(el.tagName);
    if (isNote) {
      notes.push(el);
      box = null;
    } else if (isBig || isHead) {
      el.classList.add(isBig ? 'tabs-content-big' : 'tabs-content-box-title');
      box = { lead: el, body: null };
      boxes.push(box);
    } else if (box && !box.body) {
      box.body = el;
    } else {
      (boxes.length ? after : intro).push(el);
    }
  });

  const kicker = document.createElement('span');
  kicker.className = 'tabs-content-kicker';
  kicker.textContent = labelText;
  const out = [kicker, ...intro];
  if (boxes.length) {
    const cols = document.createElement('div');
    cols.className = 'tabs-content-cols';
    boxes.forEach(({ lead, body }) => {
      const div = document.createElement('div');
      div.className = 'tabs-content-box';
      div.append(lead);
      if (body) div.append(body);
      if (body && body.tagName === 'UL') div.classList.add('tabs-content-box-new');
      cols.append(div);
    });
    out.push(cols);
  }
  out.push(...after);
  notes.forEach((p) => {
    const note = document.createElement('div');
    note.className = 'tabs-content-note';
    note.append(p.firstElementChild, p);
    out.push(note);
  });
  cell.replaceChildren(...out);
}

/**
 * Returns the fragment path when a panel cell holds only a fragment link, else null.
 * A link counts as a fragment reference when it points into /fragments/ or its text is the URL.
 * @param {Element} cell
 */
function getFragmentPath(cell) {
  const links = cell.querySelectorAll('a[href]');
  if (links.length !== 1) return null;
  const link = links[0];
  if (cell.textContent.trim() !== link.textContent.trim()) return null;
  if (cell.querySelector('picture, ul, ol, h1, h2, h3, h4, h5, h6')) return null;
  let url;
  try {
    url = new URL(link.getAttribute('href'), window.location.href);
  } catch {
    return null;
  }
  const text = link.textContent.trim();
  const isFragment = url.pathname.includes('/fragments/') || text === link.href || text === link.getAttribute('href');
  if (!isFragment) return null;
  if (url.origin !== window.location.origin && !/\.aem\.(page|live)$/.test(url.hostname)) return null;
  return url.pathname.replace(/(\.plain)?\.html$/, '');
}

/**
 * Default look: a short title paragraph directly followed by a list is the source's promo
 * box (title + check list); group the pair so it renders as one box.
 * @param {Element} root
 */
function groupPromoBoxes(root) {
  root.querySelectorAll('p + ul').forEach((ul) => {
    const title = ul.previousElementSibling;
    if (title.closest('.tabs-content-promo') || title.querySelector('a, picture, img')) return;
    const box = document.createElement('div');
    box.className = 'tabs-content-promo';
    title.classList.add('tabs-content-promo-title');
    title.before(box);
    box.append(title, ul);
  });
}

/**
 * Loads a fragment into the panel once.
 * @param {Element} panel
 */
const pending = new WeakMap();
function ensurePanelContent(panel) {
  const path = panel.dataset.fragment;
  if (!path) return Promise.resolve();
  if (!pending.has(panel)) {
    pending.set(panel, loadFragment(path).then((fragment) => {
      if (!fragment) return;
      panel.textContent = '';
      panel.append(...fragment.childNodes);
      if (!panel.closest('.icon-stepper')) groupPromoBoxes(panel);
    }));
  }
  return pending.get(panel);
}

export default async function decorate(block) {
  blockCount += 1;
  const prefix = `tabs-content-${blockCount}`;
  const stepper = block.classList.contains('icon-stepper');

  const tablist = document.createElement('div');
  tablist.className = 'tabs-content-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.firstElementChild && row.textContent.trim());
  const panels = [];
  const buttons = [];

  const select = (index, focus = false) => {
    buttons.forEach((btn, i) => {
      const active = i === index;
      btn.setAttribute('aria-selected', active);
      btn.tabIndex = active ? 0 : -1;
      btn.classList.toggle('tabs-content-tab-done', stepper && i < index);
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', i !== index);
    });
    if (focus) buttons[index].focus();
    ensurePanelContent(panels[index]);
  };

  rows.forEach((row, i) => {
    renderIconTokens(row);
    const [labelCell, ...contentCells] = [...row.children];
    const id = `${prefix}-${toClassName(labelCell.textContent) || i}`;

    // panel: remaining cells of the row
    const panel = document.createElement('div');
    panel.className = 'tabs-content-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    const contentCell = contentCells.length === 1 ? contentCells[0] : null;
    const fragmentPath = contentCell ? getFragmentPath(contentCell) : null;
    if (fragmentPath) {
      panel.dataset.fragment = fragmentPath;
    } else {
      contentCells.forEach((cell) => {
        cell.classList.add('tabs-content-panel-cell');
        panel.append(cell);
      });
      if (contentCells.length > 1) panel.classList.add('tabs-content-panel-multi');
      if (stepper) structureStepperPanel(panel, labelCell.textContent.trim());
      else groupPromoBoxes(panel);
    }
    if (stepper) maskIcons(panel);
    panels.push(panel);

    // tab: label cell content (optional icon/picture + text)
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-content-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    const icon = labelCell.querySelector('.icon, picture, svg');
    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'tabs-content-tab-icon';
      iconWrap.append(icon);
      button.append(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'tabs-content-tab-label';
    label.textContent = labelCell.textContent.trim();
    button.append(label);
    if (stepper) maskIcons(button);
    button.addEventListener('click', () => select(i));
    buttons.push(button);
    tablist.append(button);
  });

  tablist.addEventListener('keydown', (e) => {
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = buttons.length - 1;
    if (next !== null) {
      e.preventDefault();
      select(next, true);
    }
  });

  block.textContent = '';
  if (!buttons.length) return;
  tablist.style.setProperty('--tabs-content-count', buttons.length);
  block.append(tablist, ...panels);
  select(0);
  // the first panel is visible on load, so wait for its fragment
  await pending.get(panels[0]);
}
