/**
 * ekomi — customer review band (canon c25 .cmp-ekomi): a quote, the eKomi seal, the star
 * rating and its source line, a link to all reviews. Template-slotted, classified by content
 * (rows/cells not significant).
 *
 * The live band is fed by a host-bound endpoint (ekomireact.quotes.json, 404 on this host —
 * dynamics row 10, `snapshot`): the captured quote and rating are authored in the document.
 *
 * Authoring (in order):
 *   - quote paragraph(s)
 *   - seal label: one short paragraph right before the rating (`eKomi Siegel: Silber`); it
 *     names the seal image (role=img) and stays in the DOM visually hidden
 *   - rating: `<strong>4,6</strong>/5` (the score fills the stars)
 *   - source paragraph(s) (`Ermittelt aus <strong>387.152</strong> Bewertungen<br>…`)
 *   - CTA paragraph `<em><a href>…</a></em>` (canon text link with chevron)
 *
 * @variants block class: none
 */
const div = (cls) => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};
const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();
const isRating = (el) => el.tagName === 'P' && /^[\d.,]+\s*\/\s*5$/.test(el.textContent.trim());

export default function decorate(block) {
  const nodes = [...block.querySelectorAll(':scope > div > div > *')];
  const r = nodes.findIndex(isRating);
  const quote = [];
  const text = [];
  const ctas = [];
  let seal = null;
  nodes.forEach((el, i) => {
    if (i === r) return;
    if (r > 0 && i === r - 1 && !isCta(el)) seal = el;
    else if (isCta(el)) ctas.push(el);
    else if (r < 0 || i < r) quote.push(el);
    else text.push(el);
  });
  const parts = [];
  if (quote.length) {
    const figure = document.createElement('figure');
    figure.className = 'ekomi-figure';
    const bq = document.createElement('blockquote');
    bq.className = 'ekomi-quote';
    bq.append(...quote);
    figure.append(bq);
    const wrap = div('ekomi-blockquote');
    wrap.append(figure);
    parts.push(wrap);
  }
  if (r >= 0) {
    const box = div('ekomi-rating-container');
    const sealBox = div('ekomi-seal');
    if (seal) {
      sealBox.setAttribute('role', 'img');
      sealBox.setAttribute('aria-label', seal.textContent.trim());
      seal.classList.add('ekomi-seal-label');
      sealBox.append(seal);
    }
    const rating = nodes[r];
    rating.classList.add('ekomi-rating');
    const score = (rating.querySelector('strong') || rating).textContent.trim().split('/')[0].trim();
    const value = parseFloat(score.replace(',', '.'));
    if (!Number.isNaN(value)) {
      rating.style.setProperty('--score', String(value));
      rating.setAttribute('aria-label', `${score} von 5 Sternen`);
    }
    box.append(sealBox, rating);
    if (text.length) {
      const t = div('ekomi-rating-text');
      t.append(...text);
      box.append(t);
    }
    parts.push(box);
  }
  if (ctas.length) {
    const link = div('ekomi-link');
    const c = div('cmp-cta text-link');
    c.append(...ctas);
    link.append(c);
    parts.push(link);
  }
  block.replaceChildren(...parts);
}
