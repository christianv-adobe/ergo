import { createOptimizedPicture } from '../../scripts/aem.js';

const FLAG_MAX_LENGTH = 40;
const PRICE_MAX_LENGTH = 48;
const PRICE_PATTERN = /\d[\d.,]*\s*€|€\s*\d/;
const STEP_PATTERN = /^\d{1,2}\.?$/;

/* looks that turn into a one-card slider on small screens (source data-carousel-mobile) */
const CAROUSEL_LOOKS = ['alt', 'alt-2', 'alt-3', 'grey', 'grey-3'];

/**
 * Whether a cell is a short, text-only badge ("Bestseller", "Mit Waisenschutz").
 * @param {Element} cell
 */
function isFlagCell(cell) {
  if (!cell || cell.querySelector('ul, ol, h1, h2, h3, h4, h5, h6, picture, a')) return false;
  const text = cell.textContent.trim();
  return text.length > 0 && text.length <= FLAG_MAX_LENGTH;
}

function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

/**
 * Splits "z. B. <strong>5,45 €</strong> mtl." into prefix, amount, currency and suffix spans.
 * @param {Element} price
 */
function decoratePrice(price) {
  const strong = price.querySelector(':scope > strong');
  if (!strong || strong.children.length) return;

  [...price.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const text = node.textContent.trim();
    if (!text) {
      node.remove();
      return;
    }
    // eslint-disable-next-line no-bitwise
    const before = node.compareDocumentPosition(strong) & Node.DOCUMENT_POSITION_FOLLOWING;
    node.replaceWith(span(before ? 'cards-tariff-price-prefix' : 'cards-tariff-price-suffix', text));
  });

  const match = strong.textContent.trim().match(/^(.*\d)\s*(€)$/);
  if (match) {
    strong.textContent = '';
    strong.append(span('cards-tariff-price-amount', match[1]), ' ', span('cards-tariff-price-currency', match[2]));
  }
}

/**
 * Tags the parts of a card body: tagline, plan name, feature list, price, links.
 * @param {Element} body
 */
function decorateBody(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('cards-tariff-name');
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a')) {
      prev.classList.add('cards-tariff-tagline');
      // a step number ("1.") instead of a tagline
      if (STEP_PATTERN.test(prev.textContent.trim())) prev.classList.add('cards-tariff-number');
    }
  }

  body.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => list.classList.add('cards-tariff-features'));

  [...body.querySelectorAll(':scope > p')].forEach((p) => {
    if (p.classList.contains('cards-tariff-tagline')) return;
    const text = p.textContent.trim();
    const links = p.querySelectorAll('a');
    if (links.length && text === [...links].map((a) => a.textContent.trim()).join('')) {
      p.classList.add('cards-tariff-action');
    } else if (text.length <= PRICE_MAX_LENGTH && PRICE_PATTERN.test(text)) {
      p.classList.add('cards-tariff-price');
      decoratePrice(p);
    }
  });

  // the last action is the primary (calculate) button, earlier ones are text links
  const actions = body.querySelectorAll('.cards-tariff-action');
  actions.forEach((p, i) => p.classList.add(i === actions.length - 1 ? 'cards-tariff-cta' : 'cards-tariff-link'));
  const firstAction = actions[0];
  if (firstAction) firstAction.classList.add('cards-tariff-actions-start');
}

function navButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Prev / dots / next controls for the small-screen slider; hidden by CSS on wide screens.
 * @param {Element} block
 * @param {Element} list
 */
function decorateCarousel(block, list) {
  const cards = [...list.children];
  if (cards.length < 2) return;
  block.classList.add('cards-tariff-carousel');

  const nav = document.createElement('div');
  nav.className = 'cards-tariff-nav';
  const dots = document.createElement('div');
  dots.className = 'cards-tariff-dots';
  cards.forEach((card, i) => {
    const dot = navButton('cards-tariff-dot', `Gehe zu Element ${i + 1}`);
    dot.dataset.index = i;
    dots.append(dot);
  });
  const prev = navButton('cards-tariff-prev', 'Vorherige Seite');
  const next = navButton('cards-tariff-next', 'Nächste Seite');
  nav.append(prev, dots, next);
  block.append(nav);

  const current = () => {
    const left = list.scrollLeft;
    let index = 0;
    cards.forEach((card, i) => {
      if (Math.abs(card.offsetLeft - left) < Math.abs(cards[index].offsetLeft - left)) index = i;
    });
    return index;
  };

  const update = () => {
    const index = current();
    [...dots.children].forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const goTo = (index) => {
    const target = cards[(index + cards.length) % cards.length];
    list.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  };

  nav.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button === prev) goTo(current() - 1);
    else if (button === next) goTo(current() + 1);
    else goTo(Number(button.dataset.index));
  });

  let frame;
  list.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-tariff-card';
    const cells = [...row.children].filter((cell) => cell.textContent.trim() || cell.querySelector('picture'));

    // optional leading flag cell when the row holds more than one cell
    if (cells.length > 1 && isFlagCell(cells[0])) {
      const flag = document.createElement('p');
      flag.className = 'cards-tariff-flag';
      flag.textContent = cells.shift().textContent.trim();
      li.append(flag);
      li.classList.add('cards-tariff-card-flagged');
    }

    cells.forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector(':scope > picture, :scope > p > picture') && !cell.textContent.trim()) {
        cell.className = 'cards-tariff-card-image';
      } else {
        cell.className = 'cards-tariff-card-body';
        decorateBody(cell);
      }
      li.append(cell);
    });

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.textContent = '';
  block.append(ul);

  if (CAROUSEL_LOOKS.some((look) => block.classList.contains(look))) decorateCarousel(block, ul);
}
