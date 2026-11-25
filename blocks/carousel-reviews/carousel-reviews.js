import { createOptimizedPicture } from '../../scripts/aem.js';

const RATING_PATTERN = /^\s*(?:(\d(?:[.,]\d)?)\s*(?:\/\s*5)?(?:\s*sterne?|\s*stars?)?|([★☆]{1,5}))\s*$/i;

/**
 * Turns a rating paragraph ("5", "4,5/5", "★★★★★") into an accessible star row.
 * @param {Element} p
 * @returns {boolean} whether the paragraph was a rating
 */
function decorateRating(p) {
  const match = p.textContent.match(RATING_PATTERN);
  if (!match || p.querySelector('a, picture')) return false;
  const value = match[1]
    ? parseFloat(match[1].replace(',', '.'))
    : [...match[2]].filter((c) => c === '★').length;
  if (Number.isNaN(value) || value > 5) return false;
  p.className = 'carousel-reviews-rating';
  p.setAttribute('role', 'img');
  p.setAttribute('aria-label', `${value} / 5`);
  p.textContent = '';
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.className = 'carousel-reviews-star';
    if (i <= value) star.classList.add('carousel-reviews-star-full');
    else if (i - 0.5 <= value) star.classList.add('carousel-reviews-star-half');
    star.setAttribute('aria-hidden', 'true');
    p.append(star);
  }
  return true;
}

const DATE_PATTERN = /^(.*?)(\d{1,2})\.(\d{1,2})\.(\d{2,4})(.*)$/s;
const PUBLISHER_PATTERN = /^(.*\bauf)\s+(\S.*?)\s*$/is;

/**
 * Marks up the date line ("am 18.11.2026 auf Google"): wraps the date in a <time> and moves a
 * trailing publisher name into its own element (shown as the publisher wordmark by CSS).
 * @param {Element} p
 */
function decorateDate(p) {
  p.classList.add('carousel-reviews-date');
  if (p.children.length) return;
  const match = p.textContent.trim().match(DATE_PATTERN);
  if (!match) return;
  const [, before, day, month, year, after] = match;
  let rest = after;
  const publisher = after.match(PUBLISHER_PATTERN);
  if (publisher) {
    [, rest] = publisher;
    const name = publisher[2];
    const pub = document.createElement('p');
    pub.className = 'carousel-reviews-publisher';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (slug) pub.dataset.publisher = slug;
    const label = document.createElement('span');
    label.className = 'carousel-reviews-publisher-name';
    label.textContent = name;
    pub.append(label);
    p.after(pub);
  }
  const time = document.createElement('time');
  const fullYear = year.length === 2 ? `20${year}` : year;
  time.dateTime = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  time.textContent = `${day}.${month}.${year}`;
  p.textContent = '';
  p.append(before, time, rest);
}

/**
 * Tags the review cell: avatar, reviewer name, date line, source logo, rating, text.
 * @param {Element} cell
 */
function decorateReview(cell) {
  cell.className = 'carousel-reviews-review';
  let nameFound = false;
  [...cell.children].forEach((el) => {
    if (el.classList.contains('carousel-reviews-publisher')) return;
    const picture = el.matches('picture') ? el : el.querySelector(':scope > picture');
    if (picture && !el.textContent.trim()) {
      el.classList.add(nameFound ? 'carousel-reviews-source' : 'carousel-reviews-avatar');
      return;
    }
    if (decorateRating(el)) return;
    if (!nameFound && (/^H[1-6]$/.test(el.tagName) || el.querySelector(':scope > strong'))) {
      el.classList.add('carousel-reviews-name');
      nameFound = true;
      return;
    }
    if (!nameFound && el.tagName === 'P' && el.textContent.trim().length <= 2) {
      // letter avatar ("M") authored as text
      el.classList.add('carousel-reviews-avatar', 'carousel-reviews-avatar-letter');
      return;
    }
    if (nameFound && !cell.querySelector('.carousel-reviews-date') && /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(el.textContent)) {
      decorateDate(el);
      return;
    }
    el.classList.add('carousel-reviews-text');
  });
  // an authored source logo replaces the generated publisher wordmark
  const publisher = cell.querySelector('.carousel-reviews-publisher');
  if (publisher && cell.querySelector('.carousel-reviews-source')) delete publisher.dataset.publisher;
}

/**
 * Adds a "Weiterlesen" toggle to review texts that are cut off by the line clamp.
 * @param {Element} track
 */
function setupReadMore(track) {
  const texts = [...track.querySelectorAll('.carousel-reviews-text')];
  texts.forEach((text) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-reviews-more';
    button.textContent = 'Weiterlesen';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = text.classList.toggle('carousel-reviews-text-expanded');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.textContent = expanded ? 'Weniger anzeigen' : 'Weiterlesen';
    });
    text.after(button);
  });
  const check = () => texts.forEach((text) => {
    if (text.classList.contains('carousel-reviews-text-expanded')) return;
    // hidden section (zero size): leave the toggle hidden until laid out
    const clamped = text.clientHeight > 0 && text.scrollHeight > text.clientHeight + 1;
    text.nextElementSibling.hidden = !clamped;
  });
  check();
  if (window.ResizeObserver) new ResizeObserver(check).observe(track);
}

/**
 * Tags the agent footer cell: agent name, location, homepage link.
 * @param {Element} cell
 */
function decorateAgent(cell) {
  cell.className = 'carousel-reviews-agent';
  [...cell.children].forEach((el, i) => {
    if (el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim()) {
      el.classList.add('carousel-reviews-agent-link');
    } else if (i === 0) {
      el.classList.add('carousel-reviews-agent-name');
    } else {
      el.classList.add('carousel-reviews-agent-info');
      // a short line after the location ("Ergo") is the brand badge
      if (i > 1 && !el.querySelector('picture') && el.textContent.trim().length <= 20) {
        el.classList.add('carousel-reviews-agent-badge');
      }
    }
  });
}

function updateState(block, track, slides, dots) {
  const { scrollLeft, clientWidth, scrollWidth } = track;
  const step = slides[0] ? slides[0].offsetWidth : clientWidth;
  const pageCount = dots.length;
  const index = Math.min(pageCount - 1, Math.round(scrollLeft / Math.max(clientWidth, step)));
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
  });
  const prev = block.querySelector('.carousel-reviews-prev');
  const next = block.querySelector('.carousel-reviews-next');
  if (prev) prev.disabled = scrollLeft <= 1;
  if (next) next.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-reviews-track';

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
    if (!cells.length) return;
    const li = document.createElement('li');
    li.className = 'carousel-reviews-slide';
    decorateReview(cells[0]);
    li.append(cells[0]);
    if (cells[1]) {
      decorateAgent(cells[1]);
      li.append(cells[1]);
    }
    cells.slice(2).forEach((extra) => {
      extra.className = 'carousel-reviews-extra';
      li.append(extra);
    });
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  });

  block.textContent = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.append(track);
  setupReadMore(track);

  const slides = [...track.children];
  if (slides.length < 2) return;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-reviews-prev';
  prev.setAttribute('aria-label', 'vorherige Seite');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-reviews-next';
  next.setAttribute('aria-label', 'nächste Seite');
  const scrollByPage = (dir) => track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  prev.addEventListener('click', () => scrollByPage(-1));
  next.addEventListener('click', () => scrollByPage(1));

  const dotsNav = document.createElement('ol');
  dotsNav.className = 'carousel-reviews-dots';
  let dots = [];
  const buildDots = () => {
    // The section is still hidden while blocks load (widths are 0): fall back to one per page and
    // let the ResizeObserver rebuild the dots once the slider is laid out.
    const slideWidth = slides[0].offsetWidth || track.clientWidth;
    const perPage = slideWidth > 0 && track.clientWidth > 0
      ? Math.max(1, Math.round(track.clientWidth / slideWidth)) : 1;
    const count = Math.max(1, Math.ceil(slides.length / perPage)) || 1;
    if (count === dots.length) return;
    dotsNav.textContent = '';
    dots = [...Array(count).keys()].map((i) => {
      const li = document.createElement('li');
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-reviews-dot';
      dot.setAttribute('aria-label', `Gehen Sie zu Seite ${i + 1}`);
      dot.textContent = `${i + 1}`;
      dot.addEventListener('click', () => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }));
      li.append(dot);
      dotsNav.append(li);
      return dot;
    });
  };

  block.append(prev, next, dotsNav);
  buildDots();
  updateState(block, track, slides, dots);
  track.addEventListener('scroll', () => updateState(block, track, slides, dots), { passive: true });
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      buildDots();
      updateState(block, track, slides, dots);
    }).observe(track);
  }
}
