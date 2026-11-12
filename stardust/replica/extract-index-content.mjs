// Freeze the landing page content model from the live DOM snapshot (stardust/.work/replica/live-1440.html,
// taken with snap.mjs) + CTA attributes from the extract capture (stardust/current/pages/index.html).
// Output: stardust/replica/content/index.json — the verbatim content the prototype renders.
// Landing siblings (cluster-landing): node stardust/replica/extract-index-content.mjs <slug> <dom.html>
//   reads the sibling's own hydrated capture (e.g. de stardust/current/pages/de.html) as both DOM and
//   CTA-attribute source → stardust/replica/content/<slug>.json (no frozen file unless <slug>.frozen.json).
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';
const SLUG = process.argv[2] || 'index';
const DOM = process.argv[3] || 'stardust/.work/replica/live-1440.html';
const $ = cheerio.load(readFileSync(DOM, 'utf8'));
const $cap = cheerio.load(readFileSync(`stardust/current/pages/${SLUG}.html`, 'utf8'));
const T = (el) => $(el).text().replace(/\s+/g, ' ').trim();
const inner = (el) => ($(el).html() || '').replace(/ data-[rt]="[^"]*"/g, '').replace(/ (class|id|style)="[^"]*"/g, '').replace(/\s+/g, ' ').trim();
const ctaAttr = {};
$cap('.cmp-cta').each((_, c) => {
  const a = $cap(c).find('.cmp-cta__link').first();
  const key = `${$cap(a).text().replace(/\s+/g, ' ').trim()}|${a.attr('href') || ''}`;
  ctaAttr[key] = { variant: $cap(c).attr('data-variant'), size: $cap(c).attr('data-size'), width: $cap(c).attr('data-width'), icon: $cap(c).attr('data-icon'), iconPos: $cap(c).attr('data-icon-position') };
});
const iconOf = (el) => { const s = $(el).find('.cmp-cta__icon').attr('style') || ''; const m = s.match(/icons\/([A-Za-z]+)\.svg/); return m ? m[1] : null; };
const cta = (c) => {
  const a = $(c).find('.cmp-cta__link').first();
  const label = T(a.find('.cmp-cta__label').length ? a.find('.cmp-cta__label') : a);
  const href = a.attr('href') || null;
  const at = ctaAttr[`${label}|${href || ''}`] || {};
  const t = (a.attr('data-t') || '').split('/');
  const variant = at.variant || (t[4] === 'rgb(142,0,56)' ? 'primary' : 'secondary');
  return { tag: a.prop('tagName').toLowerCase(), label, href, aria: a.attr('aria-label') || null, variant, size: at.size || null, width: at.width || null, icon: iconOf(a) || at.icon || null, iconPos: at.iconPos || 'right' };
};
// colour: live snapshot data-t field 5; the extract capture carries data-color (hex) / data-color-index instead
const hexRgb = (h) => { const m = (h || '').match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null; const x = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1]; return `rgb(${[0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)).join(',')})`; };
const colorOf = (el) => ((($(el).attr('data-t') || '').split('/')[4]) || hexRgb($(el).attr('data-color')) || null);
const ART_COLORS = ['rgb(245,225,235)', 'rgb(204,236,239)', 'rgb(211,235,229)', 'rgb(254,246,210)', 'rgb(255,224,203)'];
const rel = (u) => (u || '').replace('https://www.ergo.de', '');
const img = (el) => (el && $(el).length ? { src: $(el).attr('src'), alt: $(el).attr('alt') ?? '' } : null);
const centered = (el) => /text-align:\s*center/.test($(el).attr('style') || '') || /text-align:\s*center/.test($(el).find('[style]').first().attr('style') || '');
const spacing = (cls) => {
  const size = (cls.match(/padding-(s|m|l|xl)\b/) || [])[1] || null;
  const mode = /padding-top-bottom/.test(cls) ? 'tb' : /padding-top\b/.test(cls) ? 'top' : /padding-bottom/.test(cls) ? 'bottom' : 'bottom';
  const bg = (cls.match(/\bbg-(yellow|orange|magenta|green|blue|warmgrey)\b/) || [])[1] || null;
  return { size, mode, bg };
};
const promo = (p) => {
  const flag = $(p).find('.cmp-promo__flag-text').first();
  const priceEl = $(p).find('.cmp-price').first();
  return {
    kind: 'promo', color: null,
    flag: flag.length ? T(flag) : null,
    image: img($(p).find('.cmp-promo__image img').first()),
    ai: $(p).find('.cmp-promo__image svg').length > 0,
    small: img($(p).find('.cmp-promo__small-image img').first()),
    icon: img($(p).find('.cmp-promo__icon').first()),
    headline: T($(p).find('.cmp-promo__headline').first()), headlineCentered: centered($(p).find('.cmp-promo__headline p').first()),
    title: $(p).find('.cmp-promo__title').length ? T($(p).find('.cmp-promo__title')) || null : null,
    textHtml: $(p).find('.cmp-promo__text').length ? inner($(p).find('.cmp-promo__text').first()) || null : null,
    textCentered: centered($(p).find('.cmp-promo__text p').first()),
    price: priceEl.length ? { prefix: T(priceEl.find('.cmp-price__prefix')), value: T(priceEl.find('.cmp-price__value')), currency: T(priceEl.find('.cmp-price__currency')), suffix: T(priceEl.find('.cmp-price__suffix')) } : null,
    ctas: $(p).find('.cmp-promo__placeholder .cmp-cta').map((_, c) => cta(c)).get(),
  };
};
const tile = (t) => ({
  kind: 'tile', color: colorOf(t),
  icon: img($(t).find('.cmp-tile__icon').first()), title: T($(t).find('.cmp-tile__title')), text: T($(t).find('.cmp-tile__text')),
  cta: $(t).find('.cmp-cta').length ? cta($(t).find('.cmp-cta').first()) : null,
});
const blocks = [];
const walk = (col, inXf = false) => {
  const cls = $(col).attr('class') || '';
  const sp = spacing(cls);
  if (/\bexperienceFragment\b/.test(cls) && !/\bcarousel/.test(cls)) {
    const kids = $(col).find('.aem-Grid').first().children();
    const start = blocks.length;
    kids.each((_, k) => walk(k, true));
    if (sp.size) blocks.push({ type: 'spacer', ...sp });
    blocks.slice(start).forEach((b) => { b.inXf = true; });
    return;
  }
  if (/\bhtml\b/.test(cls)) return;
  if (/\bhero\b/.test(cls)) {
    const h = $(col).find('.cmp-hero').first();
    const pr = h.find('.cmp-price').first();
    blocks.push({ type: 'hero', ...sp, image: img(h.find('.cmp-hero__image img').first()), storer: img(h.find('.cmp-hero__storer img').first()),
      h1: T(h.find('.cmp-hero__teaser-headline')), title: T(h.find('.cmp-hero__teaser-title')), textHtml: inner(h.find('.cmp-hero__teaser-text').first()),
      price: pr.length ? { prefix: T(pr.find('.cmp-price__prefix')), value: T(pr.find('.cmp-price__value')), currency: T(pr.find('.cmp-price__currency')), suffix: T(pr.find('.cmp-price__suffix')) } : null,
      ctas: h.find('.cmp-hero__child-components .cmp-cta').map((_, c) => cta(c)).get() });
    return;
  }
  if (/\btext\b/.test(cls)) {
    const el = $(col).find('.cmp-text > div').first();
    const first = el.children().first();
    const tcls = first.attr('class') || '';
    const kind = /txt__teaser/.test(tcls) ? 'eyebrow' : /txt__h2/.test(tcls) ? 'h2' : /txt__caption/.test(tcls) ? 'caption' : 'p';
    blocks.push({ type: 'text', ...sp, kind, tag: first.prop('tagName').toLowerCase(), html: inner(first), centered: true });
    return;
  }
  if (/\bcarouselContainer\b|\barticleTeaserCarousel\b/.test(cls)) {
    const cont = $(col).find('.cmp-carousel__container').first();
    const ccls = cont.attr('class') || '';
    const m = +(ccls.match(/has-(\d)-cols-m/) || [])[1] || 1; const l = +(ccls.match(/has-(\d)-cols-l/) || [])[1] || 1;
    const loop = /splide--loop|splide--draggable/.test(cont.find('.splide').attr('class') || '') || cont.find('.splide__slide').length > 0;
    let items;
    if (/articleTeaserCarousel/.test(cls)) {
      items = cont.find('.splide__slide').not('.splide__slide--clone').map((_, s) => {
        const a = $(s).find('.cmp-articleTeaser');
        return { kind: 'article', bg: (a.attr('data-t') || '').split('/')[4] || ART_COLORS[+a.attr('data-color-index')], subhead: T(a.find('.cmp-articleTeaser__subhead')), headline: T(a.find('.cmp-articleTeaser__headline')), text: T(a.find('.cmp-articleTeaser__text')), cta: cta(a.find('.cmp-cta').first()) };
      }).get();
    } else {
      items = cont.find('.splide__list').first().children().not('.splide__slide--clone').map((_, s) => {
        if ($(s).find('.cmp-tile').length) return tile($(s).find('.cmp-tile').first());
        const p = $(s).find('.cmp-promo').first(); const o = promo(p); o.color = colorOf(p); return o;
      }).get();
    }
    blocks.push({ type: 'carousel', ...sp, article: /articleTeaserCarousel/.test(cls), cols: { m, l }, loop, items });
    return;
  }
  if (/\bekomi\b/.test(cls)) {
    const e = $(col).find('.cmp-ekomi');
    blocks.push({ type: 'ekomi', ...sp, quote: T(e.find('.cmp-ekomi__quote')), seal: e.find('.cmp-ekomi__rating-seal').attr('aria-label'),
      ratingAria: e.find('.cmp-ekomi__rating').attr('aria-label'), score: T(e.find('.cmp-ekomi__rating span')), ratingTextHtml: inner(e.find('.cmp-ekomi__rating-text')),
      link: cta(e.find('.cmp-ekomi__quoteslink')) });
    return;
  }
  if (/\bcta\b/.test(cls)) { blocks.push({ type: sp.bg === 'yellow' ? 'banner' : 'cta', ...sp, center: /position-center/.test(cls), cta: cta($(col).find('.cmp-cta').first()) }); return; }
  if (/\bscrollToTop\b/.test(cls)) { blocks.push({ type: 'scrolltop', ...sp, label: T($(col).find('a')), href: $(col).find('a').attr('href') }); return; }
  blocks.push({ type: 'unknown', cls });
};
$('main .aem-Grid').first().children().each((_, c) => walk(c));
// frozen choices for nondeterministic live content (index.frozen.json)
const FZ = `stardust/replica/content/${SLUG}.frozen.json`;
try {
  const fz = JSON.parse(readFileSync(FZ, 'utf8'));
  for (const b of blocks) {
    if (b.type === 'carousel' && b.article && fz.articleOrder) {
      const pool = [...b.items, ...(fz.articleExtra || [])];
      b.items = fz.articleOrder.map((s, i) => ({ ...pool.find((a) => a.subhead === s), bg: fz.articleColors[i] }));
    }
    if (b.type === 'ekomi' && fz.ekomiQuote) b.quote = fz.ekomiQuote;
  }
} catch (e) { if (e.code !== 'ENOENT') throw e; }
const head = { title: $cap('title').text(), description: $cap('meta[name="description"]').attr('content') || '', lang: 'de' };
const SRC = SLUG === 'index' ? { dom: 'live https://www.ergo.de/ @1440, snap 2026-10-28', note: 'article teaser set + eKomi quote are randomized per load on live — frozen here (permanent residual)' }
  : { dom: `extract capture ${DOM}`, note: 'article teaser set + eKomi quote as captured (randomized per load on live)' };
writeFileSync(`stardust/replica/content/${SLUG}.json`, JSON.stringify({ _source: SRC, head, blocks }, null, 1));
console.log(blocks.map((b) => `${b.type}${b.kind ? ':' + b.kind : ''} ${b.size || ''}/${b.mode}${b.bg ? ' bg-' + b.bg : ''}${b.inXf ? ' xf' : ''}${b.items ? ' items=' + b.items.length + ' cols=' + b.cols.m + '/' + b.cols.l + (b.loop ? ' loop' : '') : ''}`).join('\n'));
