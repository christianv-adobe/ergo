import { getMetadata, decorateIcons } from '../../scripts/aem.js';

/**
 * ERGO footer.
 *
 * Authored document (/footer; page metadata `footer` names a variant such as /footer-article or
 * /footer-geschaeftskunden). Flat sections, no section metadata needed; each section's role is
 * read from its content:
 *   note      — paragraphs only, before the link columns (article footer "Hinweis: ...")
 *   columns   — several headings, each followed by a link list; a trailing paragraph + list of
 *               image links is the social block of the last column
 *   ribbon    — link lists without headings: legal links, plain paragraphs (text buttons such as
 *               "Cookies" / "Sitemap"), a bold link list, a paragraph of logo images
 *   copyright — paragraphs only, after the link columns
 *   dialog    — one heading + list (+ optional close-label paragraph) whose heading matches a
 *               ribbon text button: rendered as that button's modal dialog (e.g. Sitemap)
 * @ew-exempt chrome fragment: the footer renders a fetched /footer fragment that the
 * Experience Workspace never instruments; column headings sit in <summary> for the
 * accordion and the text buttons are <button>s.
 */

// breakpoint of the source footer (accordions below, open columns from here)
const FOOTER_OPEN = window.matchMedia('(min-width: 768px)');
const ROLES = ['note', 'columns', 'ribbon', 'copyright', 'dialog'];
const FOOTER_OVERRIDE_META = 'footer';

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/** normalises a `footer` metadata value to a document path (/footer-article) or '' */
function overridePath() {
  const value = (getMetadata(FOOTER_OVERRIDE_META) || '').trim();
  if (!value) return '';
  try {
    return new URL(value, window.location).pathname
      .replace(/^\/content(?=\/)/, '').replace(/(\.plain)?\.html$/, '').replace(/\/$/, '');
  } catch (e) {
    return '';
  }
}

/**
 * Fetches the footer fragment: the local content folder first (aem up serves the raw file at
 * /content/...), then the site root (DA/EDS preview + publish). A page-level variant is tried
 * the same two ways; any failure falls back to the default footer.
 */
async function fetchFooter() {
  const name = overridePath();
  if (name && name !== '/footer') {
    const localUrl = '/content' + name + '.plain.html'; // eslint-disable-line prefer-template
    const rootUrl = name + '.plain.html'; // eslint-disable-line prefer-template
    let custom = await fetch(localUrl);
    if (!custom.ok) custom = await fetch(rootUrl);
    if (custom.ok) return custom;
  }
  // metadata-independent default: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  return resp;
}

/** parses the fragment and resolves media relative to the fragment document */
async function loadFooterDocument() {
  const resp = await fetchFooter();
  if (!resp.ok) return null;
  const root = el('div');
  root.innerHTML = (await resp.text()).replace(
    /:([a-z][a-z0-9-]*):/g,
    (m, icon) => `<span class="icon icon-${icon}"></span>`,
  );
  root.querySelectorAll('img[src], source[srcset]').forEach((m) => {
    const attr = m.tagName === 'IMG' ? 'src' : 'srcset';
    const value = m.getAttribute(attr);
    if (!/^(\/|[a-z]+:)/i.test(value)) m.setAttribute(attr, new URL(value, resp.url).href);
  });
  root.querySelectorAll('.metadata').forEach((m) => m.closest('div:not(.metadata)')?.remove());
  root.querySelectorAll('.section-metadata').forEach((m) => m.remove());
  await decorateIcons(root);
  return root;
}

const textOf = (node) => (node.textContent || '').trim().replace(/\s+/g, ' ');

/** classifies the fragment sections; an authored section class (rendered metadata) wins */
function classify(sections) {
  let columnsSeen = false;
  return sections.map((section) => {
    const named = ROLES.find((r) => section.classList.contains(r));
    const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const lists = section.querySelectorAll('ul, ol');
    let role = named;
    if (!role) {
      if (headings.length > 1) role = 'columns';
      else if (headings.length === 1 && lists.length) role = 'dialog';
      else if (lists.length) role = 'ribbon';
      else role = columnsSeen ? 'copyright' : 'note';
    }
    if (role === 'columns') columnsSeen = true;
    return { section, role };
  });
}

/** wrap link text in a label span; external links open in a new tab */
function decorateLinks(ul) {
  ul.className = 'cmp-footerLinks__list';
  [...ul.children].forEach((li) => {
    li.className = 'cmp-footerLinks__list-item';
    li.querySelectorAll('a').forEach((a) => {
      a.classList.add('cmp-footerLinks__link');
      const label = el('span', 'cmp-footerLinks__link-label');
      label.append(...a.childNodes);
      a.append(label);
    });
  });
}

function decorateExternal(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (a.hostname && a.hostname !== window.location.hostname && /^https?:$/.test(a.protocol)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

function buildColumns(wrapper) {
  const cols = [];
  let col = null;
  [...wrapper.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      col = { heading: node, list: null, extra: [] };
      cols.push(col);
    } else if (col && /^[UO]L$/.test(node.tagName) && !col.list) {
      col.list = node;
    } else if (col) {
      col.extra.push(node);
    }
  });
  return cols.map(({ heading, list, extra }) => {
    const column = el('div', 'footer-col');
    const details = el('details', 'footer-acc');
    const summary = el('summary');
    const title = el('div', 'footer-acc__title');
    title.append(heading);
    summary.append(title);
    const panel = el('div', 'footer-acc__panel');
    if (list) {
      decorateLinks(list);
      panel.append(list);
    }
    details.append(summary, panel);
    if (!extra.length) {
      column.classList.add('footerAccordion');
      column.append(details);
      return column;
    }
    const acc = el('div', 'footerAccordion');
    acc.append(details);
    column.append(acc);
    const social = el('div', 'cmp-socialLinks');
    extra.forEach((node) => {
      if (/^[UO]L$/.test(node.tagName)) {
        node.querySelectorAll('a').forEach((a) => {
          // icon-only links: keep any text for screen readers only
          const sr = el('span', 'visually-hidden');
          [...a.childNodes].forEach((n) => {
            if (n.nodeType === 3 && n.textContent.trim()) sr.append(n);
          });
          if (sr.textContent) a.append(sr);
          const img = a.querySelector('img');
          if (img && !a.getAttribute('aria-label') && img.alt) a.setAttribute('aria-label', img.alt);
        });
        social.append(node);
      } else {
        const head = el('div', 'cmp-socialLinks__heading');
        head.append(node);
        social.append(head);
      }
    });
    column.append(social);
    return column;
  });
}

/** modal dialog for a text button; content stays in a <template> until opened */
function buildDialog(section) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6');
  const label = textOf(heading);
  const closeLabel = [...wrapper.children].reverse()
    .find((n) => n.tagName === 'P' && !n.querySelector('a, img, picture'));
  const template = document.createElement('template');
  const content = el('div', 'footer-dialog__content');
  heading.classList.add('footer-dialog__title');
  content.append(heading);
  wrapper.querySelectorAll(':scope > ul, :scope > ol').forEach((ul) => {
    decorateLinks(ul);
    content.append(ul);
  });
  template.content.append(content);
  return { label, closeText: closeLabel ? textOf(closeLabel) : '', template };
}

function openDialog({ label, closeText, template }, opener) {
  const dialog = el('dialog', 'footer-dialog');
  dialog.setAttribute('aria-label', label);
  const wrap = el('div', 'footer-dialog__wrapper');
  const close = el('button', 'footer-dialog__close');
  close.type = 'button';
  const closeSpan = el('span', 'footer-dialog__close-label');
  closeSpan.textContent = closeText;
  close.append(closeSpan);
  if (!closeText) close.setAttribute('aria-label', label);
  const container = el('div', 'footer-dialog__container');
  container.tabIndex = 0;
  container.append(template.content.cloneNode(true));
  decorateExternal(container);
  wrap.append(close, container);
  dialog.append(wrap);
  // inside the block so block-scoped styles apply; showModal() lifts it to the top layer
  (opener.closest('.footer') || document.body).append(dialog);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.addEventListener('close', () => {
    document.body.style.overflow = prevOverflow;
    dialog.remove();
    opener.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === wrap) dialog.close();
  });
  dialog.showModal();
  container.focus();
}

function buildRibbon(wrapper, dialogs) {
  const ribbon = el('div', 'page-footer__ribbon');
  const row = el('div', 'ribbon__row');
  ribbon.append(row);
  [...wrapper.children].forEach((node) => {
    const images = node.querySelectorAll('img, .icon');
    if (/^[UO]L$/.test(node.tagName)) {
      decorateLinks(node);
      row.append(node);
    } else if (images.length && !textOf(node)) {
      const logos = el('div', 'companyLogos');
      const list = el('ul', 'cmp-companyLogos__list');
      images.forEach((img) => {
        const li = el('li', 'cmp-companyLogos__item');
        li.append(img.closest('picture') || img);
        list.append(li);
      });
      logos.append(list);
      row.append(logos);
    } else if (node.tagName === 'P') {
      const label = textOf(node);
      const dialog = dialogs.find((d) => d.label.toLowerCase() === label.toLowerCase());
      const isCookies = /^cookie/i.test(label);
      const box = el('div', isCookies ? 'cookies' : 'textbtn');
      const btn = el('button', 'footer-textbtn');
      btn.type = 'button';
      const span = el('span');
      span.append(...node.childNodes);
      btn.append(span);
      if (dialog) {
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.addEventListener('click', () => openDialog(dialog, btn));
      } else if (isCookies) {
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.addEventListener('click', () => {
          // consent manager preference center (OneTrust on the live site)
          if (window.OneTrust?.ToggleInfoDisplay) window.OneTrust.ToggleInfoDisplay();
          else window.dispatchEvent(new CustomEvent('consent.open'));
        });
      }
      box.append(btn);
      row.append(box);
    }
  });
  return ribbon;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await loadFooterDocument();
  if (!fragment) return;

  const sections = [...fragment.children].filter((s) => s.tagName === 'DIV'
    && (textOf(s) || s.querySelector('img, .icon')));
  const classified = classify(sections);
  const dialogs = classified.filter((c) => c.role === 'dialog').map((c) => buildDialog(c.section));

  const root = el('div', 'site-footer');
  const inner = el('div', 'site-footer__inner');
  const cols = el('div', 'site-footer__cols');
  inner.append(cols);
  root.append(inner);

  classified.forEach(({ section, role }) => {
    const wrapper = section.querySelector('.default-content-wrapper') || section;
    if (role === 'note') {
      const note = el('div', 'site-footer__note cmp-text');
      note.append(...wrapper.children);
      cols.append(note);
    } else if (role === 'columns') {
      cols.append(...buildColumns(wrapper));
    } else if (role === 'ribbon') {
      cols.append(buildRibbon(wrapper, dialogs));
    } else if (role === 'copyright') {
      const copy = el('div', 'site-footer__copy cmp-text');
      copy.append(...wrapper.children);
      cols.append(copy);
    }
  });

  decorateExternal(root);
  block.replaceChildren(root);

  const accs = [...block.querySelectorAll('.footer-acc')];
  const sync = () => accs.forEach((d) => { d.open = FOOTER_OPEN.matches; });
  sync();
  FOOTER_OPEN.addEventListener('change', sync);
  accs.forEach((d) => d.querySelector('summary').addEventListener('click', (e) => {
    if (FOOTER_OPEN.matches) e.preventDefault();
  }));
}
