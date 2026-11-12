import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * ERGO header — template-slotted from the gated prototype chrome
 * (stardust/prototypes/shared/header.html + chrome.js; behaviour per
 * stardust/chrome/header-contract.json: click/Enter opens the flyout for a top-level item,
 * Suche opens the search overlay, "Menü" opens the drill-down drawer below 1152px;
 * Schließen / Escape / second click / backdrop close and focus returns to the opener).
 *
 * Authored document (/nav, /nav-geschaeftskunden; page metadata `nav` overrides), one
 * section per role, named by section-metadata `Style`:
 *   brand  — logo link (:ergo-logo-small: :ergo-logo:), skip link (#main)
 *   tools  — list of bar controls: no-link item with :search: = search toggle, no-link item
 *            with :burger-menu: = drawer toggle ("Menü <em>Schließen</em>"), tel: link =
 *            phone button (<em>label</em> <strong>number</strong> hours), other links =
 *            icon buttons (bold = also shown below 1152px)
 *   search — heading, placeholder, link (form action + submit label), suggestions head + list
 *   menu   — nested list: level-1 labels, level-2 links or labels with level-3 link lists
 *   tiles  — one section per level-1 item, in order: :icon:, bold title, text, bold CTA link
 *   drawer — mobile action items (phone + icon links)
 * @ew-exempt chrome fragment: the header renders a fetched /nav fragment that the
 * Experience Workspace never instruments; menu labels live in <button>s for the
 * header contract's keyboard parity; the search placeholder is text-as-metadata.
 */

const DESKTOP = window.matchMedia('(min-width: 1152px)');
const ROLES = ['brand', 'tools', 'search', 'menu', 'tiles', 'drawer'];

function el(tag, className, attrs = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

/** style tokens of a fragment section: delivered classes, else a leftover section-metadata */
function stylesOf(section) {
  const meta = section.querySelector('.section-metadata');
  if (!meta) return [...section.classList];
  const row = [...meta.children].find((r) => /style/i.test(r.children[0]?.textContent || ''));
  const value = (row?.children[1]?.textContent || '').trim().toLowerCase();
  return [...section.classList, ...value.split(/[\s,]+/)];
}

function roleOf(section) {
  const tokens = stylesOf(section);
  section.dataset.styles = tokens.join(' ');
  return ROLES.find((r) => tokens.includes(r)) || null;
}

function collectSections(fragment) {
  const roles = { tiles: [] };
  const sections = [...fragment.querySelectorAll(':scope > .section')]
    .filter((sec) => sec.textContent.trim() || sec.querySelector('.icon, img'));
  sections.forEach((section, i) => {
    let role = roleOf(section);
    section.querySelectorAll('.section-metadata').forEach((m) => {
      (m.closest('.section-metadata-wrapper') || m).remove();
    });
    if (!role) {
      // order fallback for an undecorated document
      if (section.querySelector('ul ul')) role = 'menu';
      else if (i === 0) role = 'brand';
      else if (i === 1) role = 'tools';
      else if (i === sections.length - 1) role = 'drawer';
      else role = 'tiles';
    }
    if (role === 'tiles') roles.tiles.push(section);
    else roles[role] = section;
  });
  return roles;
}

/** the label nodes of a list item: everything before its nested list (unwraps a <p>) */
function labelNodes(li) {
  const nodes = [];
  [...li.childNodes].forEach((n) => {
    if (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')) return;
    if (n.nodeType === 1 && n.tagName === 'P') nodes.push(...n.childNodes);
    else nodes.push(n);
  });
  return nodes.filter((n) => n.nodeType === 1 || n.textContent.trim());
}

function iconImg(scope, className) {
  const span = scope.querySelector('.icon');
  const img = span?.querySelector('img');
  if (!img) return null;
  img.className = className;
  img.alt = '';
  span.remove();
  return img;
}

/** phone link: <em>label</em> <strong>number</strong> hours */
function buildPhone(link) {
  link.className = 'headerNavigation__button headerNavigation__button-with-icon '
    + 'headerNavigation__button--phone';
  const em = link.querySelector('em');
  const strong = link.querySelector('strong');
  const label = el('span', 'button__label');
  if (em) label.append(...em.childNodes);
  const text = el('span', 'phone-text');
  const num = el('span', 'phone-text__phonenumber');
  if (strong) num.append(...strong.childNodes);
  const hours = el('span', 'phone-text__hours');
  em?.remove();
  strong?.remove();
  hours.append(...link.childNodes);
  text.append(num, hours);
  link.append(label, text);
  const wrap = el('div', 'headerNavigation__phone-button-wrapper');
  wrap.append(link);
  return wrap;
}

function buildTools(section, ctx) {
  const box = el('div', 'headerNavigation__buttons-container');
  if (!section) return box;
  section.querySelectorAll(':scope li').forEach((li) => {
    const link = li.querySelector('a');
    if (link && link.href.startsWith('tel:')) {
      box.append(buildPhone(link));
      return;
    }
    const img = iconImg(li, 'button__icon');
    const name = img?.dataset.iconName || '';
    if (!link && name === 'burger-menu') {
      const btn = el('button', 'headerNavigation__button headerNavigation__button-with-icon '
        + 'headerNavigation__menu-toggle hn-mobile-only', {
        type: 'button',
        'data-action': 'menu',
        'aria-expanded': 'false',
        'aria-controls': 'headerNavigation__sidebar',
      });
      const em = li.querySelector('em');
      const close = el('span', 'button__label button__label--close');
      if (em) {
        close.append(...em.childNodes);
        em.remove();
      }
      const open = el('span', 'button__label button__label--open');
      open.append(...li.childNodes);
      if (img) btn.append(img);
      btn.append(open, close);
      ctx.closeLabel = close.textContent.trim();
      box.append(btn);
      return;
    }
    if (!link) {
      const btn = el('button', 'headerNavigation__button headerNavigation__button-with-icon '
        + 'hn-desktop-only', {
        type: 'button',
        'data-action': 'search',
        'aria-expanded': 'false',
        'aria-controls': 'headerNavigation__sidebar',
      });
      const label = el('span', 'button__label');
      label.append(...li.childNodes);
      if (img) btn.append(img);
      btn.append(label);
      box.append(btn);
      return;
    }
    const mobileToo = !!link.closest('strong');
    link.className = `headerNavigation__button headerNavigation__button-with-icon${
      mobileToo ? '' : ' hn-desktop-only'}`;
    const label = el('span', 'button__label');
    label.append(...link.childNodes);
    if (img) link.append(img);
    link.append(label);
    box.append(link);
  });
  return box;
}

function buildSearch(section) {
  const container = el('div', 'headerNavigation__search-container');
  const cmp = el('div', 'cmp-search');
  container.append(cmp);
  const ps = [...section.querySelectorAll('p')];
  const actionLink = section.querySelector('p a');
  const actionP = actionLink?.closest('p');
  const texts = ps.filter((p) => p !== actionP);
  const [heading, placeholder, suggHead] = texts;
  if (heading) {
    heading.className = 'cmp-search__heading';
    cmp.append(heading);
  }
  const inner = el('div', 'cmp-search__container');
  const form = el('form', 'cmp-search__form', {
    role: 'search', method: 'get', action: actionLink ? actionLink.getAttribute('href') : '#',
  });
  const placeholderText = placeholder ? placeholder.textContent.trim() : '';
  form.setAttribute('aria-label', placeholderText);
  const wrap = el('div', 'cmp-search__input-wrapper');
  const input = el('input', 'cmp-search__input', {
    type: 'text',
    name: 'search',
    placeholder: placeholderText,
    autocomplete: 'off',
    'aria-label': placeholderText,
  });
  const clear = el('button', 'cmp-search__input-button cmp-search__input-button--clear', {
    type: 'button', 'aria-label': 'Eingabe löschen',
  });
  const submitLabel = actionLink ? actionLink.textContent.trim() : 'Suche starten';
  const submit = el('button', 'cmp-search__input-button cmp-search__input-button--submit', {
    type: 'submit', 'aria-label': submitLabel,
  });
  wrap.append(input, clear, submit);
  form.append(wrap);
  inner.append(form);
  const sugg = el('div', 'cmp-search__suggestions-container');
  if (suggHead) {
    suggHead.className = 'cmp-search__suggestions-header';
    sugg.append(suggHead);
  }
  const list = section.querySelector('ul');
  if (list) {
    list.className = 'cmp-search__suggestions-list';
    list.setAttribute('role', 'listbox');
    list.querySelectorAll(':scope > li').forEach((li) => {
      li.setAttribute('role', 'option');
      li.querySelector('a')?.classList.add('cmp-search__anchor');
    });
    sugg.append(list);
  }
  inner.append(sugg);
  cmp.append(inner);
  placeholder?.remove();
  actionP?.remove();
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) e.preventDefault();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
  });
  return container;
}

function buildTiles(section) {
  const box = el('div', 'headerNavigation__tiles-container');
  if (!section) return box;
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  let tile = null;
  let next = wrapper.firstElementChild;
  while (next) {
    const node = next;
    next = node.nextElementSibling;
    const onlyIcon = node.tagName === 'P' && node.querySelector('.icon')
      && !node.textContent.trim();
    if (onlyIcon || !tile) {
      tile = el('div', 'cmp-tile');
      box.append(tile);
    }
    if (onlyIcon) {
      const iw = el('div', 'cmp-tile__icon-wrapper');
      iw.append(...node.childNodes);
      node.remove();
      tile.append(iw);
    } else if (node.querySelector('a.button, a')) {
      const cw = el('div', 'cmp-tile__cta-wrapper');
      const cta = el('div', 'cmp-cta size-auto');
      cta.append(node);
      cw.append(cta);
      tile.append(cw);
    } else if (!tile.querySelector('.cmp-tile__title')) {
      const t = el('div', 'cmp-tile__title');
      t.append(node);
      tile.append(t);
    } else {
      const t = el('div', 'cmp-tile__text');
      t.append(node);
      tile.append(t);
    }
  }
  // per-tile variants from the section style: tile-<n>-<colour> | tile-<n>-reduced
  const tokens = (section.dataset.styles || '').split(' ');
  [...box.children].forEach((t, i) => {
    tokens.filter((x) => x.startsWith(`tile-${i + 1}-`)).forEach((x) => {
      const v = x.slice(`tile-${i + 1}-`.length);
      if (v === 'reduced') t.classList.add('reduced');
      else {
        t.classList.add('tile-bg');
        t.style.setProperty('--tile-bg', `var(--bg-${v})`);
      }
    });
    const a = t.querySelector('a');
    if (a) {
      const label = el('span', 'cmp-cta__label');
      label.append(...a.childNodes);
      a.append(label);
      if (a.title && a.title.trim() !== label.textContent.trim()) {
        a.setAttribute('aria-label', a.title);
      }
    }
  });
  if (box.children.length) box.classList.add('has-tiles');
  return box;
}

function decorateMenuList(ul, level) {
  ul.className = 'headerNavigation__navigation-list';
  ul.dataset.level = level;
  [...ul.children].forEach((li) => {
    li.className = 'headerNavigation__navigation-item';
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      const btn = el('button', 'headerNavigation__navigation-button', {
        type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false',
      });
      const span = el('span');
      span.append(...labelNodes(li));
      btn.append(span);
      li.querySelectorAll(':scope > p').forEach((p) => p.remove());
      li.prepend(btn);
      sub.setAttribute('aria-label', span.textContent.trim());
      decorateMenuList(sub, level + 1);
    } else {
      const a = li.querySelector('a');
      if (a) {
        a.className = 'headerNavigation__navigation-link';
        li.replaceChildren(a);
      }
    }
  });
}

function buildMenu(section, tiles) {
  const nav = el('nav', 'headerNavigation__navigation-container', { 'aria-label': 'Untermenü' });
  const ul = section?.querySelector('ul');
  const labels = [];
  if (!ul) return { nav, labels };
  decorateMenuList(ul, 1);
  [...ul.children].forEach((li, i) => {
    const span = li.querySelector(':scope > .headerNavigation__navigation-button > span');
    labels.push(span);
    // presentational copies of the authored label (bar button + desktop flyout heading)
    const heading = el('p', 'headerNavigation__navigation-item-heading');
    if (span) heading.append(...span.cloneNode(true).childNodes);
    const sub = li.querySelector(':scope > ul');
    if (sub) sub.before(heading);
    else li.append(heading);
    li.append(buildTiles(tiles[i]));
  });
  nav.append(ul);
  return { nav, labels };
}

function buildDrawer(section) {
  const box = el('div', 'headerNavigation__action-items-container');
  if (!section) return box;
  const list = el('ul', 'headerNavigation__navigation-list');
  section.querySelectorAll('li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    if (a.href.startsWith('tel:')) {
      box.append(buildPhone(a));
      return;
    }
    a.className = 'headerNavigation__navigation-link';
    const img = iconImg(a, 'headerNavigation__navigation-button-icon');
    const span = el('span');
    span.append(...a.childNodes);
    if (img) a.append(img);
    a.append(span);
    const item = el('li', 'headerNavigation__navigation-item');
    item.append(a);
    list.append(item);
  });
  box.append(list);
  return box;
}

function buildBrand(section) {
  const logos = el('div', 'headerNavigation__logos');
  const links = section ? [...section.querySelectorAll('a')] : [];
  const logo = links.find((a) => a.querySelector('.icon'));
  const skip = links.find((a) => a !== logo && a.getAttribute('href')?.startsWith('#'));
  if (logo) {
    const icons = [...logo.querySelectorAll('.icon')];
    const mobile = el('div', 'headerNavigation__logo headerNavigation__logo--mobile');
    const desktop = el('div', 'headerNavigation__logo headerNavigation__logo--desktop');
    const mLink = logo.cloneNode(false);
    if (icons.length > 1) mLink.append(icons[0]);
    [...logo.childNodes].forEach((n) => {
      if (n.nodeType === 3 && !n.textContent.trim()) n.remove();
    });
    mobile.append(icons.length > 1 ? mLink : logo.cloneNode(true));
    desktop.append(logo);
    logos.append(mobile, desktop);
    logos.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager';
      img.alt = '';
    });
  }
  if (skip) skip.className = 'skip-to-content';
  return { logos, skip };
}

function wireBehaviour(block) {
  const nav = block.querySelector('.headerNavigation');
  const sidebar = block.querySelector('.headerNavigation__sidebar');
  const backdrop = block.querySelector('.headerNavigation__backdrop');
  const topButtons = [...nav.querySelectorAll('[data-flyout]')];
  const searchBtn = nav.querySelector('[data-action="search"]');
  const menuBtn = nav.querySelector('[data-action="menu"]');
  const level1 = [...sidebar.querySelectorAll(
    '.headerNavigation__navigation-list[data-level="1"] > .headerNavigation__navigation-item',
  )];
  let opener = null;

  const resetLevels = () => {
    sidebar.querySelectorAll('.headerNavigation__navigation-button[aria-expanded="true"]')
      .forEach((b) => b.setAttribute('aria-expanded', 'false'));
    level1.forEach((li) => li.classList.remove('is-open'));
  };
  const content = sidebar.querySelector('.headerNavigation__sidebar-content');
  content.tabIndex = -1;
  const close = () => {
    document.documentElement.style.removeProperty('overflow');
    sidebar.hidden = true;
    backdrop.hidden = true;
    nav.classList.remove('search-open');
    [...topButtons, searchBtn, menuBtn].forEach((b) => b && b.setAttribute('aria-expanded', 'false'));
    resetLevels();
    if (opener) {
      opener.focus({ preventScroll: true });
      opener = null;
    }
  };
  const open = (btn, e) => {
    sidebar.hidden = false;
    backdrop.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    opener = btn;
    // keyboard open (Enter / Space): the next Tab lands inside the panel
    if (e && e.detail === 0 && btn !== menuBtn) content.focus({ preventScroll: true });
  };
  topButtons.forEach((btn) => btn.addEventListener('click', (e) => {
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    close();
    if (wasOpen) return;
    const li = level1[Number(btn.dataset.flyout)];
    if (li) {
      li.classList.add('is-open');
      li.querySelector(':scope > .headerNavigation__navigation-button')
        ?.setAttribute('aria-expanded', 'true');
    }
    open(btn, e);
  }));
  searchBtn?.addEventListener('click', () => {
    const wasOpen = searchBtn.getAttribute('aria-expanded') === 'true';
    close();
    if (wasOpen) return;
    nav.classList.add('search-open');
    open(searchBtn);
    sidebar.querySelector('.cmp-search__input')?.focus({ preventScroll: true });
  });
  menuBtn?.addEventListener('click', () => {
    const wasOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    close();
    if (!wasOpen) open(menuBtn);
  });
  // nested levels: one expanded sibling at a time; second click collapses (mobile "back")
  sidebar.querySelectorAll('.headerNavigation__navigation-button[aria-haspopup="true"]')
    .forEach((b) => {
      b.addEventListener('click', () => {
        const expanded = b.getAttribute('aria-expanded') === 'true';
        const list = b.closest('.headerNavigation__navigation-list');
        list.querySelectorAll(
          ':scope > .headerNavigation__navigation-item > .headerNavigation__navigation-button',
        ).forEach((s) => s.setAttribute('aria-expanded', 'false'));
        if (list.dataset.level === '1') level1.forEach((li) => li.classList.remove('is-open'));
        if (!expanded) {
          b.setAttribute('aria-expanded', 'true');
          if (list.dataset.level === '1') b.parentElement.classList.add('is-open');
        }
      });
    });
  sidebar.querySelector('.headerNavigation__close-button')?.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  // the desktop flyout spans the viewport; a click on its empty (backdrop) area closes it
  sidebar.addEventListener('click', (e) => {
    if (e.target === sidebar) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebar.hidden) close();
  });
  DESKTOP.addEventListener('change', close);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  const s = collectSections(fragment);
  const ctx = { closeLabel: '' };

  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';

  const { logos, skip } = buildBrand(s.brand);
  const tools = buildTools(s.tools, ctx);
  const { nav: subnav, labels } = buildMenu(s.menu, s.tiles);

  // bar
  const bar = el('div', 'headerNavigation', { id: 'MainNavi' });
  const container = el('div', 'headerNavigation__container');
  const links = el('nav', 'headerNavigation__links-container', { 'aria-label': 'Hauptmenü' });
  const list = el('ul', 'headerNavigation__links-list');
  labels.forEach((label, i) => {
    const li = el('li', 'headerNavigation__links-list-item');
    const btn = el('button', 'headerNavigation__button', {
      type: 'button',
      'data-flyout': String(i),
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': 'headerNavigation__sidebar',
    });
    const span = el('span', 'button__label');
    if (label) span.append(...label.cloneNode(true).childNodes);
    btn.append(span);
    li.append(btn);
    list.append(li);
  });
  links.append(list);
  container.append(logos, links, tools);
  bar.append(container);

  // sidebar: flyout (desktop) / drawer (mobile) / search overlay
  const backdrop = el('div', 'headerNavigation__backdrop');
  backdrop.hidden = true;
  const sidebar = el('div', 'headerNavigation__sidebar', { id: 'headerNavigation__sidebar' });
  sidebar.hidden = true;
  const content = el('div', 'headerNavigation__sidebar-content');
  const flyout = el('div', 'headerNavigation__flyout-container');
  const closeBtn = el('button', 'headerNavigation__close-button', {
    type: 'button', 'aria-label': ctx.closeLabel || 'Schließen',
  });
  const closeSpan = el('span', 'button__label');
  closeSpan.textContent = 'Schließen';
  closeBtn.append(closeSpan);
  flyout.append(closeBtn);
  if (s.search) flyout.append(buildSearch(s.search));
  flyout.append(subnav);
  content.append(flyout, buildDrawer(s.drawer));
  sidebar.append(content);

  const top = el('span', '', { id: 'page-top' });
  block.replaceChildren(top);
  if (skip) block.append(skip);
  block.append(bar, backdrop, sidebar);
  wireBehaviour(block);
}
