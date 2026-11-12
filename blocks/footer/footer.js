import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * ERGO footer — template-slotted from the gated prototype chrome
 * (stardust/prototypes/shared/footer.html; link columns are <details>, forced open from
 * 768px, accordions below).
 *
 * Authored document (/footer, /footer-geschaeftskunden; page metadata `footer` overrides):
 *   columns   — per column a heading + link list; an optional trailing paragraph + list of
 *               icon links is the social block (:instagram: Instagram …) of the last column
 *   ribbon    — legal link list, "Cookies" / "Sitemap" paragraphs (text buttons), a list of
 *               bold links, a paragraph of company logo icons
 *   copyright — one paragraph
 *   note      — optional (section style `note`): a caption row above the columns (article
 *               footer /footer-article on the Ratgeber / Rechtsportal family: "Hinweis: …")
 * @ew-exempt chrome fragment: the footer renders a fetched /footer fragment that the
 * Experience Workspace never instruments; column headings sit in <summary> for the
 * accordion and the text buttons are <button>s.
 */

const FOOTER_OPEN = window.matchMedia('(min-width: 768px)');
const ROLES = ['columns', 'ribbon', 'copyright'];
const NAMED_ROLES = ['note', ...ROLES];

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function roleOf(section, i) {
  const byClass = NAMED_ROLES.find((r) => section.classList.contains(r));
  if (byClass) return byClass;
  const meta = section.querySelector('.section-metadata');
  if (meta) {
    const value = (meta.textContent || '').toLowerCase();
    const r = NAMED_ROLES.find((x) => value.includes(x));
    if (r) return r;
  }
  return ROLES[Math.min(i, 2)];
}

/** wrap link text in the source's label span; icon links keep their text for screen readers */
function decorateLinks(ul) {
  ul.className = 'cmp-footerLinks__list';
  [...ul.children].forEach((li) => {
    li.className = 'cmp-footerLinks__list-item';
    const a = li.querySelector('a');
    if (!a) return;
    a.classList.add('cmp-footerLinks__link');
    const label = el('span', 'cmp-footerLinks__link-label');
    label.append(...a.childNodes);
    a.append(label);
  });
}

function buildColumns(wrapper) {
  const cols = [];
  let col = null;
  let next = wrapper.firstElementChild;
  while (next) {
    const node = next;
    next = node.nextElementSibling;
    if (/^H[1-6]$/.test(node.tagName)) {
      col = { heading: node, list: null, extra: [] };
      cols.push(col);
    } else if (col && node.tagName === 'UL' && !col.list) {
      col.list = node;
    } else if (col) {
      col.extra.push(node);
    }
  }
  return cols.map(({ heading, list, extra }) => {
    const column = el('div', 'footer-col');
    const acc = el('div', 'footerAccordion');
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
    acc.append(details);
    if (!extra.length) {
      column.classList.add('footerAccordion');
      column.append(details);
      return column;
    }
    column.append(acc);
    const social = el('div', 'cmp-socialLinks');
    extra.forEach((node) => {
      if (node.tagName === 'UL') {
        node.querySelectorAll('a').forEach((a) => {
          const sr = el('span', 'visually-hidden');
          [...a.childNodes].forEach((n) => {
            if (n.nodeType === 3 && n.textContent.trim()) sr.append(n);
          });
          a.append(sr);
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

function buildRibbon(wrapper) {
  const ribbon = el('div', 'page-footer__ribbon');
  const row = el('div', 'ribbon__row');
  ribbon.append(row);
  let next = wrapper.firstElementChild;
  while (next) {
    const node = next;
    next = node.nextElementSibling;
    if (node.tagName === 'UL') {
      decorateLinks(node);
      row.append(node);
    } else if (node.querySelector('.icon') && !node.textContent.trim()) {
      const logos = el('div', 'companyLogos');
      const list = el('ul', 'cmp-companyLogos__list');
      node.querySelectorAll('.icon').forEach((icon) => {
        const li = el('li', 'cmp-companyLogos__item');
        li.append(icon);
        list.append(li);
      });
      logos.append(list);
      row.append(logos);
    } else if (node.tagName === 'P') {
      const label = node.textContent.trim().toLowerCase();
      const box = el('div', label.startsWith('cookie') ? 'cookies' : 'sitemap');
      const btn = el('button', 'footer-textbtn');
      btn.type = 'button';
      const span = el('span');
      span.append(...node.childNodes);
      btn.append(span);
      if (box.className === 'cookies') {
        btn.addEventListener('click', () => {
          window.OneTrust?.ToggleInfoDisplay?.();
        });
      }
      box.append(btn);
      row.append(box);
    }
  }
  return ribbon;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const root = el('div', 'site-footer');
  const inner = el('div', 'site-footer__inner');
  const cols = el('div', 'site-footer__cols');
  inner.append(cols);
  root.append(inner);

  [...fragment.querySelectorAll(':scope > .section')]
    .filter((sec) => sec.textContent.trim() || sec.querySelector('.icon, img'))
    .forEach((section, i) => {
      const role = roleOf(section, i);
      section.querySelectorAll('.section-metadata').forEach((m) => {
        (m.closest('.section-metadata-wrapper') || m).remove();
      });
      const wrapper = section.querySelector('.default-content-wrapper') || section;
      if (role === 'note') {
        const note = el('div', 'site-footer__note cmp-text');
        note.append(...wrapper.children);
        cols.append(note);
      } else if (role === 'columns') cols.append(...buildColumns(wrapper));
      else if (role === 'ribbon') cols.append(buildRibbon(wrapper));
      else {
        const copy = el('div', 'site-footer__copy cmp-text');
        copy.append(...wrapper.children);
        cols.append(copy);
      }
    });

  block.replaceChildren(root);

  const accs = [...block.querySelectorAll('.footer-acc')];
  const sync = () => accs.forEach((d) => { d.open = FOOTER_OPEN.matches; });
  sync();
  FOOTER_OPEN.addEventListener('change', sync);
  accs.forEach((d) => d.querySelector('summary').addEventListener('click', (e) => {
    if (FOOTER_OPEN.matches) e.preventDefault();
  }));
}
