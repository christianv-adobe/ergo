// Freeze a listing page content model (Ratgeber-family: article header, breadcrumb, column control,
// promos in every image position, rich text, benefits, promo/tile carousels, XF) from the extract capture.
// Also the program family (product pages): product hero, accordion (panels walked recursively), product
// table, standalone CTA, download, nested responsive grids, and the B2B header/footer chrome variant.
//   node stardust/replica/extract-listing-content.mjs de-ratgeber
// Input : stardust/current/pages/<slug>.html (rendered DOM with data-variant/-color attributes) + <slug>.json (head)
// Output: stardust/replica/content/<slug>.json — the verbatim content the prototype renders.
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';

const slug = process.argv[2] || 'de-ratgeber';
const $ = cheerio.load(readFileSync(`stardust/current/pages/${slug}.html`, 'utf8'));
const meta = JSON.parse(readFileSync(`stardust/current/pages/${slug}.json`, 'utf8'));
const T = (el) => $(el).text().replace(/\s+/g, ' ').trim();
const KEEP_CLASS = /^(txt|font|color|check-list|ta-c)$|^(txt|font|color|check-list)[-_]/;
// authored rich text: tags + href/target/anchor ids + the AEM text-style classes; no ids/data/style
const rich = (el) => {
  if (!el || !$(el).length) return null;
  const c = $(el).clone();
  c.find('script,style,link,meta,noscript').remove();
  c.find('*').each((_, n) => {
    const keep = {};
    const a = n.attribs || {};
    if (a.href) keep.href = a.href;
    if (a['aria-label'] && n.name === 'a') keep['aria-label'] = a['aria-label'];
    if (a.id && n.name === 'a' && /^ank/.test(a.id)) keep.id = a.id;
    const cl = (a.class || '').split(/\s+/).filter((x) => KEEP_CLASS.test(x));
    if (/text-align:\s*center/.test(a.style || '')) cl.push('ta-c');
    const cls = cl.join(' ');
    if (cls) keep.class = cls;
    n.attribs = keep;
  });
  const h = (c.html() || '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  return h || null;
};
const src = (im) => {
  if (!im || !$(im).length) return null;
  let s = $(im).attr('src') || $(im).closest('picture').find('source').last().attr('srcset') || '';
  s = s.replace('https://www.ergo.de', '').replace(/\.w\d+\.dam\.jpg\.webp$/, '.dam.jpg');
  return { src: s, alt: $(im).attr('alt') ?? '' };
};
const cta = (c) => {
  const a = $(c).find('.cmp-cta__link').first();
  const label = T(a.find('.cmp-cta__label').length ? a.find('.cmp-cta__label') : a);
  return {
    tag: (a.prop('tagName') || 'a').toLowerCase(), label, href: a.attr('href') || null, aria: a.attr('aria-label') || null,
    variant: $(c).attr('data-variant') || 'primary', size: $(c).attr('data-size') || null, width: $(c).attr('data-width') || null,
    icon: $(c).attr('data-icon') || null, iconPos: $(c).attr('data-icon-position') || 'right',
  };
};
const spacing = (cls) => {
  const size = (cls.match(/padding-(s|m|l|xl)\b/) || [])[1] || null;
  const mode = /padding-top-bottom/.test(cls) ? 'tb' : /padding-top\b/.test(cls) ? 'top' : 'bottom';
  const bg = (cls.match(/\bbg-(yellow|orange|magenta|green|blue|warmgrey)\b/) || [])[1] || null;
  return { size, mode, bg };
};
const price = (p) => {
  const e = $(p).find('.cmp-price').first();
  return e.length ? { prefix: T(e.find('.cmp-price__prefix')), value: T(e.find('.cmp-price__value')), currency: T(e.find('.cmp-price__currency')), suffix: T(e.find('.cmp-price__suffix')) } : null;
};
const promo = (p) => {
  const im = $(p).find('.cmp-promo__image').first();
  return {
    kind: 'promo', v: 2, color: $(p).attr('data-color') || null, pos: $(p).attr('data-image-position') || null,
    ctaCount: +($(p).attr('data-cta-count') || 0), equal: $(p).hasClass('promo--has-equal-height'),
    flag: $(p).find('.cmp-promo__flag-text').length ? T($(p).find('.cmp-promo__flag-text').first()) : null,
    image: src(im.find('img').first()), ...(im.attr('data-is-hidden-mobile') === 'true' ? { hideMobile: true } : {}), rounded: im.attr('data-is-rounded') === 'true', ai: im.find('svg, .cmp-image__ai').length > 0,
    small: src($(p).find('.cmp-promo__small-image img').first()), icon: src($(p).find('.cmp-promo__icon').first()),
    headlineHtml: rich($(p).find('.cmp-promo__headline').first()), titleHtml: rich($(p).find('.cmp-promo__title').first()),
    textHtml: rich($(p).find('.cmp-promo__text').first()), price: price(p),
    ctas: $(p).find('.cmp-promo__placeholder .cmp-cta').map((_, c) => cta(c)).get(),
  };
};
const download = (d) => ({ href: d.find('a').attr('href'), title: T(d.find('.cmp-download__title')),
  props: d.find('.cmp-download__property').map((_, p) => ({ kind: (($(p).attr('class') || '').match(/--(\w+)/) || [])[1], label: T($(p).find('dt')), value: T($(p).find('dd')) })).get() });
const tile = (t) => ({
  kind: 'tile', v: 2, color: $(t).attr('data-color') || '#fff',
  reducedM: $(t).attr('data-variant-mobile') === 'reduced', reducedD: $(t).attr('data-variant-desktop') === 'reduced',
  icon: src($(t).find('.cmp-tile__icon').first()), title: T($(t).find('.cmp-tile__title')), text: T($(t).find('.cmp-tile__text')) || null,
  cta: $(t).find('.cmp-cta').length ? cta($(t).find('.cmp-cta').first()) : null,
});

// a column carries either authored rich text or modules (promo, download …), walked like grid children
const colContent = (c) => {
  const kids = $(c).find('.ccw__column__placeholder').first().children();
  if (!kids.length || kids.toArray().every((k) => /\btext\b/.test($(k).attr('class') || ''))) return { html: rich($(c).find('.cmp-text > div').first()) };
  const out = [];
  $(c).find('.ccw__column__placeholder').first().children().each((_, k) => walk(k, out));
  return { blocks: out };
};
const blocks = [];
const walk = (col, out = blocks) => {
  const cls = $(col).attr('class') || '';
  const sp = spacing(cls);
  if (/\bexperienceFragment\b/.test(cls)) {
    // the XF's own padding wraps its inner modules: leading top spacer + trailing bottom spacer
    if (sp.size && sp.mode !== 'bottom') out.push({ type: 'spacer', ...sp, mode: 'top', inXf: true });
    const start = out.length;
    $(col).find('.aem-Grid').first().children().each((_, k) => walk(k, out));
    out.slice(start).forEach((b) => { b.inXf = true; });
    if (sp.size && sp.mode !== 'top') out.push({ type: 'spacer', ...sp, mode: 'bottom', inXf: true });
    return;
  }
  if (/\barticleHeader\b/.test(cls)) {
    const h = $(col).find('.cmp-article-header').first();
    out.push({ type: 'articleHeader', ...sp, h1: T(h.find('.cmp-article-header__teaser-headline')), title: T(h.find('.cmp-article-header__teaser-title')),
      text: T(h.find('.cmp-article-header__teaser-text')), image: src(h.find('.cmp-article-header__image img').first()), ai: h.find('.cmp-article-header__image svg').length > 0 });
    return;
  }
  if (/\bbreadcrumb\b/.test(cls)) {
    out.push({ type: 'breadcrumb', ...sp, aria: $(col).find('nav').attr('aria-label') || 'Breadcrumb',
      items: $(col).find('.cmp-breadcrumb__item').map((_, li) => ({ label: T($(li).find('.cmp-breadcrumb__item-label')), href: $(li).find('a').attr('href') || null,
        aria: $(li).find('a').attr('aria-label') || null, current: $(li).hasClass('cmp-breadcrumb__item--active') })).get() });
    return;
  }
  if (/\bcolumnControl\b/.test(cls)) {
    out.push({ type: 'columns', ...sp, cols: $(col).find('.ccw__column').map((_, c) => ({
      width: (($(c).attr('class') || '').match(/ccw__column--(\w+)/) || [])[1] || 'half', ...colContent(c) })).get() });
    return;
  }
  if (/\bbenefits\b/.test(cls)) {
    const b = $(col).find('.benefits__container').first();
    out.push({ type: 'benefits', ...sp, color: b.attr('data-color'), frame: b.hasClass('is-frame') ? 'frame' : b.hasClass('is-box') ? 'box' : null,
      flag: T(b.find('.benefits__flag')) || null, flagPos: ((b.find('.benefits__flag').attr('class') || '').match(/has-position-(\w+)/) || [])[1] || 'left',
      items: b.find('.benefits__item-title, .benefits__item-icon').length
        ? b.find('.benefits__item').map((_, it) => ({ icon: src($(it).find('.benefits__item-icon').first()), title: T($(it).find('.benefits__item-title')) || null, html: rich($(it).find('.benefits__item-text').first()) })).get()
        : b.find('.benefits__item-text').map((_, t) => rich(t)).get() });
    return;
  }
  if (/\bcarouselContainer\b/.test(cls)) {
    const cont = $(col).find('.cmp-carousel__container').first();
    const ccls = cont.attr('class') || '';
    const m = +(ccls.match(/has-(\d)-cols-m/) || [])[1] || 1; const l = +(ccls.match(/has-(\d)-cols-l/) || [])[1] || 1;
    const loop = /splide--loop/.test(cont.find('.splide').attr('class') || '');
    const items = cont.find('.splide__list').first().children().not('.splide__slide--clone').map((_, s) => {
      const sc = $(s).attr('class') || '';
      // an XF-wrapped slide carries its padding on the inner module column (div.tile.padding-bottom.padding-m)
      const inner = /experienceFragment/.test(sc) ? ($(s).find('.aem-Grid').first().children().first().attr('class') || '') : '';
      const pad = /no-padding/.test(sc) ? null : (sc.match(/padding-(s|m|l|xl)\b/) || inner.match(/padding-(s|m|l|xl)\b/) || [])[1] || null;
      const it = $(s).find('.cmp-tile').length ? tile($(s).find('.cmp-tile').first()) : $(s).find('.cmp-download').length ? { kind: 'download', v: 2, ...download($(s).find('.cmp-download').first()) } : promo($(s).find('.cmp-promo').first());
      return { ...it, slidePad: pad };
    }).get();
    out.push({ type: 'carousel', ...sp, cols: { m, l }, loop, items });
    return;
  }
  if (/\bhero\b/.test(cls)) {
    const h = $(col).find('.cmp-hero').first();
    out.push({ type: 'productHero', ...sp, pos: h.attr('data-image-position') || 'left', image: src(h.find('.cmp-hero__image img').first()),
      h1: T(h.find('.cmp-hero__teaser-headline')), title: T(h.find('.cmp-hero__teaser-title')), textHtml: rich(h.find('.cmp-hero__teaser-text').first()),
      ctas: h.find('.cmp-hero__child-components .cmp-cta').map((_, c) => cta(c)).get() });
    return;
  }
  if (/\baccordion\b/.test(cls)) {
    out.push({ type: 'accordion', ...sp, items: $(col).find('.cmp-accordion').first().children('details').map((_, d) => {
      const kidsOut = [];
      $(d).children('.cmp-accordion__panel').children().each((__, k) => walk(k, kidsOut));
      return { title: T($(d).find('.cmp-accordion__title').first()), open: $(d).attr('open') !== undefined, blocks: kidsOut };
    }).get() });
    return;
  }
  if (/\bproductTable\b/.test(cls)) {
    const t = $(col).find('.productTable__table').first();
    const tcls = t.attr('class') || '';
    const cell = (c) => {
      const im = $(c).find('.icon img').first();
      if (im.length) return { icon: src(im) };
      const tx = $(c).find('.cmp-text > div:not([class])').first();
      return { html: rich(tx.length ? tx : $(c).find('.cmp-text').first()) };
    };
    const row = (r) => ({ header: $(r).hasClass('productTable__row--header'), sticky: $(r).hasClass('is-sticky'), color: $(r).children().first().attr('data-color') || null,
      cells: $(r).children('.productTable__cell').map((_, c) => cell(c)).get() });
    const rows = t.children().map((_, r) => ($(r).hasClass('productTable__row--subheading')
      ? { group: rich($(r).find('.productTable__subheading .productTable__cell').first()), rows: $(r).children('.productTable__row').map((__, x) => row(x)).get() }
      : row(r))).get();
    out.push({ type: 'productTable', ...sp, labelWidth: +(tcls.match(/label-width-(\d+)/) || [])[1] || 4, align: (tcls.match(/tariff-alignment-(\w+)/) || [])[1] || 'center', rows });
    return;
  }
  if (/\bdownload\b/.test(cls)) {
    out.push({ type: 'download', ...sp, ...download($(col).find('.cmp-download').first()) });
    return;
  }
  if (/\bresponsivegrid\b/.test(cls)) { $(col).find('.aem-Grid').first().children().each((_, k) => walk(k, out)); return; }
  if (/^cta\b/.test(cls)) { out.push({ type: 'cta', ...sp, center: /position-center/.test(cls), cta: cta($(col).find('.cmp-cta').first()) }); return; }
  if (/\bpromo\b/.test(cls)) { out.push({ type: 'promo', ...sp, promo: promo($(col).find('.cmp-promo').first()) }); return; }
  if (/\btext\b/.test(cls)) { out.push({ type: 'richtext', ...sp, html: rich($(col).find('.cmp-text > div').first()) }); return; }
  if (/^embed\b/.test(cls)) {
    // cluster-landing (/de/Service): YouTube embed — iframe src/title + the template's aria-label (videoObject name)
    const e = $(col).find('.cmp-embed').first();
    const f = e.find('iframe.cmp-embed__player-wrapper, iframe').first();
    const tpl = (e.find('template.cmp-embed__template').first().html() || '') + (e.find('template').first().html() || '');
    const id = ((f.attr('src') || '') + tpl).match(/youtube\.com\/embed\/([\w-]+)/);
    out.push({ type: 'embed', ...sp, provider: e.attr('data-provider') || null, videoId: id ? id[1] : null,
      title: f.attr('title') || null, aria: (tpl.match(/aria-label="([^"]*)"/) || [])[1] || null,
      ratio: ((e.find('.cmp-embed__content').attr('style') || '').match(/padding-bottom:\s*([\d.]+%)/) || [])[1] || '56.25%' });
    return;
  }
  if (/\bscrollToTop\b/.test(cls)) { out.push({ type: 'scrolltop', ...sp, label: T($(col).find('a')), href: $(col).find('a').attr('href') }); return; }
  out.push({ type: 'unknown', cls });
};
$('main .aem-Grid').first().children().each((_, c) => walk(c));
const head = { title: meta.title, description: meta.description || '', lang: 'de' };
// page footer: Ratgeber-family pages carry the older article footer XF (note row, different Service / Über ERGO links)
const f = $('footer').first();
const links = (sel) => sel.find('.cmp-footerLinks__link').map((_, a) => ({ label: T(a), href: $(a).attr('href') })).get();
const footerTexts = f.find('.aem-Grid').first().children('.text');
const footer = {
  variant: footerTexts.length > 1 ? 'article' : 'b2b',
  note: footerTexts.length > 1 ? rich(footerTexts.first().find('.cmp-text > div').first()) : null,
  columns: f.find('.footerAccordion').map((_, acc) => ({ title: T($(acc).find('.cmp-accordion__title').first()), links: links($(acc)) })).get(),
  social: { heading: T(f.find('.cmp-socialLinks__heading')), links: f.find('.cmp-socialLinks a').map((_, a) => ({ href: $(a).attr('href'), src: $(a).find('img').attr('src'), alt: $(a).find('img').attr('alt') })).get() },
  ribbon: {
    links: links(f.find('.page-footer__ribbon .linkSection').first()),
    cookies: { label: T(f.find('.cmp-footerCookies__toggle-button')), aria: f.find('.cmp-footerCookies__toggle-button').attr('aria-label') },
    sitemap: { label: T(f.find('.cmp-footerSitemap__toggle-button')) },
    strong: links(f.find('.page-footer__ribbon .linkSection').eq(1)),
    logos: f.find('.cmp-companyLogos__item-image').map((_, i) => ({ src: $(i).attr('src'), alt: $(i).attr('alt') || '' })).get(),
  },
  copyright: T(footerTexts.last()),
};
// header: the B2B pages carry their own header XF (other top nav, no search / phone, an extra Über ERGO action)
const chrome = JSON.parse(readFileSync('stardust/replica/content/chrome.json', 'utf8'));
const top = $('.headerNavigation__links-list > li').map((_, b) => T(b)).get();
let header = null;
if (top.join('|') !== chrome.header.top.join('|')) {
  const navList = (ul) => $(ul).children('li').map((_, li) => {
    const btn = $(li).children('button').first(); const a = $(li).children('a').first();
    if (btn.length) {
      const tiles = $(li).children('.headerNavigation__tiles-container').find('.cmp-tile').map((__, t) => ({
        icon: $(t).find('.cmp-tile__icon').attr('src') || null, title: T($(t).find('.cmp-tile__title')), text: T($(t).find('.cmp-tile__text')),
        cta: { label: T($(t).find('.cmp-cta__label')), href: $(t).find('.cmp-cta__link').attr('href'), aria: $(t).find('.cmp-cta__link').attr('aria-label') || null } })).get();
      return { label: T(btn), heading: T($(li).children('.headerNavigation__navigation-item-heading')) || null, children: navList($(li).children('ul').first()), tiles };
    }
    return { label: T(a), href: a.attr('href') };
  }).get();
  const sb = $('.headerNavigation__sidebar').first();
  header = {
    variant: 'b2b', skip: T($('#skip-to-content')), closeAria: $('.headerNavigation__close-button').attr('aria-label') || 'Schließen', top,
    logoDesktop: chrome.header.logoDesktop, logoMobile: chrome.header.logoMobile,
    buttons: $('.headerNavigation__buttons-container > a').map((_, a) => ({ label: T($(a).find('.button__label')), href: $(a).attr('href'), aria: $(a).attr('aria-label') || null,
      icon: $(a).find('img').attr('src'), mobile: /login/.test($(a).attr('class') || '') })).get(),
    menu: { open: T($('#MainNavi-mobile-navigation-toggle-button .button__label').first()), close: T($('#MainNavi-mobile-navigation-toggle-button .button__label').eq(1)) },
    navAria: sb.find('.headerNavigation__navigation-container').attr('aria-label') || null,
    nav: navList(sb.find('.headerNavigation__navigation-container > ul').first()),
    actionItems: sb.find('.headerNavigation__action-items-container .headerNavigation__navigation-link').map((_, a) => ({ label: T($(a).find('span')), href: $(a).attr('href'), aria: $(a).attr('aria-label') || null, icon: $(a).find('img').attr('src') || null })).get(),
  };
}
writeFileSync(`stardust/replica/content/${slug}.json`, JSON.stringify({ _source: { dom: `extract capture stardust/current/pages/${slug}.html (${meta.fetchedAt})`, layout: /\bfull-grid\b/.test($('main .aem-Grid').first().parent().attr('class') || '') ? 'full' : 'narrow' }, head, ...(header ? { header } : {}), footer, blocks }, null, 1));
console.log(blocks.map((b) => `${b.type} ${b.size || ''}/${b.mode}${b.bg ? ' bg-' + b.bg : ''}${b.inXf ? ' xf' : ''}${b.items ? ` items=${b.items.length} ${b.items[0].kind} cols=${b.cols ? b.cols.m + '/' + b.cols.l : ''}${b.loop ? ' loop' : ''}` : ''}${b.promo ? ' pos=' + b.promo.pos + (b.promo.rounded ? ' round' : '') : ''}`).join('\n'));
