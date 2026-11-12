// Render the replica prototype for an archetype from the frozen content models.
//   node stardust/replica/build-prototype.mjs index
// Reads  stardust/replica/content/chrome.json + stardust/replica/content/<slug>.json
// Writes stardust/prototypes/shared/header.html, shared/footer.html (reusable chrome partials),
//        stardust/prototypes/<slug>-proposed.html
// Assets: every referenced image is localized under stardust/current/assets/{icons,media}/ (served to the
// prototype through the stardust/prototypes/assets -> ../current/assets symlink); missing files are fetched once.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const slug = process.argv[2] || 'index';
const ROOT = 'stardust/current/assets';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';
const chrome = JSON.parse(readFileSync('stardust/replica/content/chrome.json', 'utf8'));
const page = JSON.parse(readFileSync(`stardust/replica/content/${slug}.json`, 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (u) => (u.startsWith('http') ? u : `https://www.ergo.de${u}`);
const pending = [];
const fetchOnce = (url, file) => {
  if (existsSync(file)) return;
  pending.push((async () => {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/avif,image/webp,image/svg+xml,image/*,*/*' } });
    if (!r.ok) { console.warn(`asset ${r.status} ${url}`); return; }
    mkdirSync(file.replace(/\/[^/]+$/, ''), { recursive: true });
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  })());
};
// icon / vector: one file
const icon = (u) => {
  if (!u) return '';
  const name = u.split('/').pop().split('?')[0];
  const local = /\.dam\.svg$/.test(name) ? `media/${name}` : `icons/${name}`; // keep the live file name (icon signature parity)
  fetchOnce(abs(u), `${ROOT}/${local}`);
  return `assets/${local}`;
};
// raster: live rendition rules (<=480 w480, <=1440 w768, else w1440)
const picture = (u, alt, cls = '') => {
  if (/\.svg$/.test(u)) return `<img${cls ? ` class="${cls}"` : ''} src="${icon(u)}" alt="${esc(alt)}">`;
  const base = u.replace(/\.dam\.jpg$/, '');
  const name = base.split('/').pop();
  const r = (w) => { const local = `media/${name}.w${w}.webp`; fetchOnce(`${base}.w${w}.dam.jpg.webp`, `${ROOT}/${local}`); return `assets/${local}`; };
  return `<picture><source media="(min-width: 1441px)" srcset="${r(1440)}"><source media="(min-width: 481px)" srcset="${r(768)}"><img${cls ? ` class="${cls}"` : ''} src="${r(480)}" alt="${esc(alt)}"></picture>`;
};

// ---------- shared pieces ----------
const ICON_CLASS = { ChevronRightIcon: 'ic-chevron', CalculatorIcon: 'ic-calculator', HeadsetIcon: 'ic-headset' };
const cta = (c, extra = '') => {
  if (!c) return '';
  const cls = ['cmp-cta', c.variant === 'secondary' ? 'secondary' : c.variant === 'tertiary' ? 'tertiary' : c.variant === 'text-link' ? 'text-link' : '',
    c.size === 'auto' ? 'size-auto' : c.size === 'large' ? 'size-large' : '',
    c.width === '100' ? 'w-100' : c.width === '50' ? 'w-50' : c.width === '33' ? 'w-33' : '', c.iconPos === 'left' ? 'icon-left' : '', extra].filter(Boolean).join(' ');
  const ic = c.icon ? `<span class="cmp-cta__icon ${ICON_CLASS[c.icon] || ''}" aria-hidden="true"></span>` : '';
  const aria = c.aria ? ` aria-label="${esc(c.aria.trim())}"` : '';
  const inner = `<span class="cmp-cta__label">${esc(c.label)}</span>${ic}`;
  const link = c.tag === 'button'
    ? `<button class="cmp-cta__link" type="button"${aria}>${inner}</button>`
    : `<a class="cmp-cta__link" href="${esc(c.href)}"${aria}>${inner}</a>`;
  return `<div class="${cls}">${link}</div>`;
};
const sp = (b, more = '') => ['col', b.size ? `sp-${b.size}` : '', b.mode === 'top' ? 'sp-top' : b.mode === 'tb' ? 'sp-tb' : '', b.bg ? `bg-${b.bg} bleed` : '', more].filter(Boolean).join(' ');
const priceHtml = (p, cls) => `<div class="cmp-price ${cls}"><span class="cmp-price__prefix">${esc(p.prefix)}</span><span class="cmp-price__value">${esc(p.value)}</span><span class="cmp-price__currency">${esc(p.currency)}</span><span class="cmp-price__suffix">${esc(p.suffix)}</span></div>`;
const rgbHex = (c) => { const m = (c || '').match(/rgb\((\d+),(\d+),(\d+)\)/); return m ? `#${[m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('')}` : null; };
// AI-generated-image marker: harvested verbatim from the live DOM (svgs-index-1440.json #0), inlined like live
const AI_SVG = readFileSync(`${ROOT}/icons/ai-icon.svg`, 'utf8').replace('<svg ', '<svg class="cmp-image__ai-icon" aria-hidden="true" ').replace(/\s*\n\s*/g, '');

// ---------- header ----------
const H = chrome.header;
const navItems = (items, level, parent = null) => `<ul class="headerNavigation__navigation-list" data-level="${level}"${parent ? ` aria-label="${esc(parent.replace(/ /g, '-'))}"` : ''}>${items.map((it) => {
  if (!it.children) return `<li class="headerNavigation__navigation-item"><a class="headerNavigation__navigation-link" href="${esc(it.href)}">${esc(it.label)}</a></li>`;
  const tiles = it.tiles && it.tiles.length ? `<div class="headerNavigation__tiles-container has-tiles">${it.tiles.map((t) => `<div class="cmp-tile"><div class="cmp-tile__icon-wrapper"><img class="cmp-tile__icon" src="${icon(t.icon)}" alt=""></div><p class="cmp-tile__title">${esc(t.title)}</p><div class="cmp-tile__text">${esc(t.text)}</div><div class="cmp-tile__cta-wrapper">${cta({ tag: 'a', label: t.cta.label, href: t.cta.href, aria: t.cta.aria, variant: 'primary', size: 'auto' })}</div></div>`).join('')}</div>` : '';
  return `<li class="headerNavigation__navigation-item"><button class="headerNavigation__navigation-button" type="button" aria-haspopup="true" aria-expanded="false"><span>${esc(it.label)}</span></button>${it.heading ? `<p class="headerNavigation__navigation-item-heading">${esc(it.heading)}</p>` : ''}${navItems(it.children, level + 1, it.label)}${tiles}</li>`;
}).join('')}</ul>`;
const phone = (A) => `<div class="headerNavigation__phone-button-wrapper"><a class="headerNavigation__button headerNavigation__button-with-icon headerNavigation__button--phone" href="${esc(A.href)}" aria-label="${esc(A.aria)}"><span class="button__label">${esc(A.label)}</span><span class="phone-text"><span class="phone-text__phonenumber">${esc(A.number)}</span><span class="phone-text__hours">${esc(A.hours)}</span></span></a></div>`;
const A = H.actions;
const header = `<header class="site-header">
<span id="page-top"></span>
<a class="skip-to-content" href="#main">Zum Inhalt springen</a>
<div class="headerNavigation" id="MainNavi">
<div class="headerNavigation__container">
<div class="headerNavigation__logos">
<div class="headerNavigation__logo headerNavigation__logo--mobile"><a href="${esc(H.logoMobile.href)}"><img src="${icon(H.logoMobile.src)}" alt="${esc(H.logoMobile.alt)}"></a></div>
<div class="headerNavigation__logo headerNavigation__logo--desktop"><a href="${esc(H.logoDesktop.href)}"><img src="${icon(H.logoDesktop.src)}" alt="${esc(H.logoDesktop.alt)}"></a></div>
</div>
<nav class="headerNavigation__links-container" aria-label="Hauptmenü"><ul class="headerNavigation__links-list">${H.top.map((t, i) => `<li class="headerNavigation__links-list-item"><button class="headerNavigation__button" type="button" data-flyout="${i}" aria-haspopup="true" aria-expanded="false" aria-controls="headerNavigation__sidebar"><span class="button__label">${esc(t)}</span></button></li>`).join('')}</ul></nav>
<div class="headerNavigation__buttons-container">
<button class="headerNavigation__button headerNavigation__button-with-icon hn-desktop-only" type="button" data-action="search" aria-label="${esc(A.search.aria)}" aria-expanded="false" aria-controls="headerNavigation__sidebar"><img class="button__icon" src="${icon('/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/SearchIcon.svg')}" alt=""><span class="button__label">${esc(A.search.label)}</span></button>
<a class="headerNavigation__button headerNavigation__button-with-icon hn-desktop-only" href="${esc(A.agent.href)}" aria-label="${esc(A.agent.aria)}"><img class="button__icon" src="${icon('/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/LocationIcon.svg')}" alt=""><span class="button__label">${esc(A.agent.label)}</span></a>
<a class="headerNavigation__button headerNavigation__button-with-icon" href="${esc(A.login.href)}" aria-label="${esc(A.login.aria)}"><img class="button__icon" src="${icon('/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/ProfileIcon.svg')}" alt=""><span class="button__label">${esc(A.login.label)}</span></a>
${phone(A.phone)}
<button class="headerNavigation__button headerNavigation__button-with-icon headerNavigation__menu-toggle hn-mobile-only" type="button" data-action="menu" aria-expanded="false" aria-controls="headerNavigation__sidebar"><img class="button__icon" src="${icon('/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/BurgerMenuIcon.svg')}" alt=""><span class="button__label button__label--open">${esc(A.menu.open)}</span><span class="button__label button__label--close">${esc(A.menu.close)}</span></button>
</div>
</div>
</div>
<div class="headerNavigation__backdrop" hidden></div>
<div class="headerNavigation__sidebar" id="headerNavigation__sidebar" hidden>
<div class="headerNavigation__sidebar-content">
<div class="headerNavigation__flyout-container">
<button class="headerNavigation__close-button" type="button" aria-label="Schließen"><span class="button__label">Schließen</span></button>
<div class="headerNavigation__search-container"><div class="cmp-search"><p class="cmp-search__heading">${esc(H.search.heading)}</p><div class="cmp-search__container"><form class="cmp-search__form" role="search" aria-label="${esc(H.search.formAria)}" action="#" onsubmit="return false"><div class="cmp-search__input-wrapper"><input class="cmp-search__input" type="text" name="search" placeholder="${esc(H.search.placeholder || ' ')}" autocomplete="off" aria-label="${esc(H.search.formAria)}"><button class="cmp-search__input-button cmp-search__input-button--clear" type="button" aria-label="${esc(H.search.clear)}"><span class="button__label">${esc(H.search.clear)}</span></button><button class="cmp-search__input-button cmp-search__input-button--submit" type="submit" aria-label="${esc(H.search.submit)}"><span class="button__label">${esc(H.search.submit)}</span></button></div></form><div class="cmp-search__suggestions-container"><p class="cmp-search__suggestions-header">${esc(H.search.suggestionsHeader)}</p><ul class="cmp-search__suggestions-list" role="listbox">${H.search.suggestions.map((s) => `<li role="option"><a class="cmp-search__anchor" href="${esc(s.href)}">${esc(s.label)}</a></li>`).join('')}</ul></div></div></div></div>
<nav class="headerNavigation__navigation-container" aria-label="${esc(H.search.navAria || 'Untermenü')}">${navItems(H.nav, 1)}</nav>
<div class="headerNavigation__action-items-container">${phone(A.phone)}<ul class="headerNavigation__navigation-list">${H.actionItems.map((a) => `<li class="headerNavigation__navigation-item"><a class="headerNavigation__navigation-link" href="${esc(a.href)}"${a.aria ? ` aria-label="${esc(a.aria)}"` : ''}><img class="headerNavigation__navigation-button-icon" src="${icon(a.icon)}" alt=""><span>${esc(a.label)}</span></a></li>`).join('')}</ul></div>
</div>
</div>
</div>
</header>`;

// B2B header variant (Geschäftskunden pages): own top nav + flyouts, icon buttons from the page model, no search / phone
const P = page.header && page.header.variant === 'b2b' ? page.header : null;
const headerB2b = P ? `<header class="site-header site-header--b2b">
<span id="page-top"></span>
<a class="skip-to-content" href="#main">${esc(P.skip)}</a>
<div class="headerNavigation" id="MainNavi">
<div class="headerNavigation__container">
<div class="headerNavigation__logos">
<div class="headerNavigation__logo headerNavigation__logo--mobile"><a href="${esc(P.logoMobile.href)}"><img src="${icon(P.logoMobile.src)}" alt="${esc(P.logoMobile.alt)}"></a></div>
<div class="headerNavigation__logo headerNavigation__logo--desktop"><a href="${esc(P.logoDesktop.href)}"><img src="${icon(P.logoDesktop.src)}" alt="${esc(P.logoDesktop.alt)}"></a></div>
</div>
<nav class="headerNavigation__links-container" aria-label="Hauptmenü"><ul class="headerNavigation__links-list">${P.top.map((t, i) => `<li class="headerNavigation__links-list-item"><button class="headerNavigation__button" type="button" data-flyout="${i}" aria-haspopup="true" aria-expanded="false" aria-controls="headerNavigation__sidebar"><span class="button__label">${esc(t)}</span></button></li>`).join('')}</ul></nav>
<div class="headerNavigation__buttons-container">
${P.buttons.map((x) => `<a class="headerNavigation__button headerNavigation__button-with-icon${x.mobile ? '' : ' hn-desktop-only'}" href="${esc(x.href)}"${x.aria ? ` aria-label="${esc(x.aria)}"` : ''}><img class="button__icon" src="${icon(x.icon)}" alt=""><span class="button__label">${esc(x.label)}</span></a>`).join('\n')}
<button class="headerNavigation__button headerNavigation__button-with-icon headerNavigation__menu-toggle hn-mobile-only" type="button" data-action="menu" aria-expanded="false" aria-controls="headerNavigation__sidebar"><img class="button__icon" src="${icon('/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/BurgerMenuIcon.svg')}" alt=""><span class="button__label button__label--open">${esc(P.menu.open)}</span><span class="button__label button__label--close">${esc(P.menu.close)}</span></button>
</div>
</div>
</div>
<div class="headerNavigation__backdrop" hidden></div>
<div class="headerNavigation__sidebar" id="headerNavigation__sidebar" hidden>
<div class="headerNavigation__sidebar-content">
<div class="headerNavigation__flyout-container">
<button class="headerNavigation__close-button" type="button" aria-label="${esc(P.closeAria)}"><span class="button__label">Schließen</span></button>
<nav class="headerNavigation__navigation-container" aria-label="${esc(P.navAria || 'Untermenü')}">${navItems(P.nav, 1)}</nav>
<div class="headerNavigation__action-items-container"><ul class="headerNavigation__navigation-list">${P.actionItems.map((a) => `<li class="headerNavigation__navigation-item"><a class="headerNavigation__navigation-link" href="${esc(a.href)}"${a.aria ? ` aria-label="${esc(a.aria)}"` : ''}><img class="headerNavigation__navigation-button-icon" src="${icon(a.icon)}" alt=""><span>${esc(a.label)}</span></a></li>`).join('')}</ul></div>
</div>
</div>
</div>
</header>` : null;

// ---------- footer ----------
const linkList = (links, strong = false) => `<ul class="cmp-footerLinks__list">${links.map((l) => `<li class="cmp-footerLinks__list-item"><a class="cmp-footerLinks__link" href="${esc(l.href)}">${strong ? '<strong>' : ''}<span class="cmp-footerLinks__link-label">${esc(l.label)}</span>${strong ? '</strong>' : ''}</a></li>`).join('')}</ul>`;
const acc = (c) => `<details class="footer-acc" open><summary><h4 class="footer-acc__title"><span class="cmp-accordion__title">${esc(c.title)}</span></h4></summary><div class="footer-acc__panel">${linkList(c.links)}</div></details>`;
const footerHtml = (F) => `<footer class="site-footer${F.variant ? ` site-footer--${F.variant}` : ''}">
<div class="site-footer__inner">
${F.note ? `<div class="site-footer__note cmp-text rt">${F.note}</div>
` : ''}<div class="site-footer__cols">
${F.columns.slice(0, 3).map((c) => `<div class="footer-col footerAccordion">${acc(c)}</div>`).join('\n')}
<div class="footer-col"><div class="footerAccordion">${acc(F.columns[3])}</div><div class="cmp-socialLinks"><p class="cmp-socialLinks__heading">${esc(F.social.heading)}</p><ul>${F.social.links.map((s) => `<li><a href="${esc(s.href)}"><img src="${icon(s.src)}" alt="${esc(s.alt)}"></a></li>`).join('')}</ul></div></div>
<div class="page-footer__ribbon"><div class="ribbon__row">${linkList(F.ribbon.links)}<div class="cookies"><button class="footer-textbtn" type="button" aria-label="${esc(F.ribbon.cookies.aria)}"><span>${esc(F.ribbon.cookies.label)}</span></button></div>${F.ribbon.sitemap.label ? `<div class="sitemap"><button class="footer-textbtn" type="button"><span>${esc(F.ribbon.sitemap.label)}</span></button></div>` : ''}${linkList(F.ribbon.strong, true)}<div class="companyLogos"><ul class="cmp-companyLogos__list">${F.ribbon.logos.map((l) => `<li class="cmp-companyLogos__item"><img src="${icon(l.src)}" alt="${esc(l.alt)}"></li>`).join('')}</ul></div></div></div>
<div class="site-footer__copy cmp-text"><p class="txt-caption">${esc(F.copyright)}</p></div>
</div>
</div>
</footer>`;
const footer = footerHtml(chrome.footer);
const pageFooter = page.footer ? footerHtml(page.footer) : footer; // page-level footer variant (e.g. Ratgeber article footer)

// ---------- main blocks ----------
const promoCard = (p) => {
  const plain = p.color && p.color !== 'rgb(255,255,255)';
  const flag = p.flag ? `<div class="cmp-promo__flag-container ${p.image ? 'over' : 'centered'}"><div class="cmp-promo__flag"><p class="cmp-promo__flag-text">${esc(p.flag)}</p></div></div>` : '';
  const image = p.image ? `<div class="cmp-promo__image-container"><div class="cmp-promo__image">${picture(p.image.src, p.image.alt)}${p.ai ? AI_SVG : ''}</div>${p.small ? `<div class="cmp-promo__small-image"><img src="${icon(p.small.src)}" alt="${esc(p.small.alt)}"></div>` : ''}</div>` : '';
  const ic = p.icon ? `<div class="cmp-promo__icon-container"><img class="cmp-promo__icon" src="${icon(p.icon.src)}" alt="${esc(p.icon.alt)}"></div>` : '';
  const ph = (p.price || p.ctas.length) ? `<div class="cmp-promo__placeholder">${p.price ? `<div class="price">${priceHtml(p.price, 'center')}</div>` : ''}${p.ctas.map((c) => `<div class="cta">${cta(c)}</div>`).join('')}</div>` : '';
  return `<div class="cmp-promo${plain ? ' plain' : ''}"${plain ? ` style="--bg:${rgbHex(p.color)}"` : ''}>${flag}${image}${ic}<div class="cmp-promo__content"><div class="cmp-promo__headline${p.headlineCentered ? '' : ' left'}"><p class="txt-h4">${esc(p.headline)}</p></div>${p.title ? `<div class="cmp-promo__title"><p>${esc(p.title)}</p></div>` : ''}${p.textHtml ? `<div class="cmp-promo__text${p.textCentered ? '' : ' left'}">${p.textHtml}</div>` : ''}${ph}</div></div>`;
};
const tileCard = (t, reducedDesktop) => {
  const hex = rgbHex(t.color);
  const style = hex && hex !== '#ffffff' ? ` style="--tile-bg:${hex}"` : '';
  return `<div class="cmp-tile reduced-m${reducedDesktop ? ' reduced-d' : ''}"${style}><div class="cmp-tile__icon-wrapper"><img class="cmp-tile__icon" src="${icon(t.icon.src)}" alt=""></div><p class="cmp-tile__title">${esc(t.title)}</p><div class="cmp-tile__text">${esc(t.text)}</div>${t.cta ? `<div class="cmp-tile__cta-wrapper">${cta(t.cta)}</div>` : ''}</div>`;
};
const articleCard = (a) => `<section class="cmp-articleTeaser" style="--bg:${rgbHex(a.bg)}"><p class="cmp-articleTeaser__subhead">${esc(a.subhead)}</p><p class="cmp-articleTeaser__headline">${esc(a.headline)}</p><p class="cmp-articleTeaser__text">${esc(a.text)}</p><div class="cmp-articleTeaser__cta">${cta({ ...a.cta, variant: 'secondary', size: null, width: '100' })}</div></section>`;
const nav = '<div class="cmp-carousel__navigation"><div class="cmp-carousel__controls"><button class="cmp-carousel__control-button prev" type="button" aria-label="gehe zur letzten Seite"><span class="cmp-carousel__control-button-label">vorherige Seite</span></button><button class="cmp-carousel__control-button next" type="button" aria-label="nächste Seite"><span class="cmp-carousel__control-button-label">nächste Seite</span></button></div><div class="cmp-carousel__indicators-list" role="group" aria-label="ein Element zum Anzeigen auswählen"></div></div>';

// ---------- listing-family modules (shared/modules.css): v2 promo/tile from data attributes ----------
const promo2 = (p) => {
  const attrs = ` data-color="${esc(p.color || '#fff')}"${p.pos ? ` data-image-position="${p.pos}"` : ''} data-cta-count="${p.ctaCount}"${p.rounded ? ' data-rounded' : ''}`;
  const flag = p.flag ? `<div class="cmp-promo__flag-container"><div class="cmp-promo__flag"><p class="cmp-promo__flag-text">${esc(p.flag)}</p></div></div>` : '';
  const small = p.small ? `<div class="cmp-promo__small-image"><img src="${icon(p.small.src)}" alt="${esc(p.small.alt)}"></div>` : ''; // cluster-landing: störer badge
  const image = p.image ? `<div class="cmp-promo__image-container"><div class="cmp-promo__image"${p.hideMobile ? ' data-hidden-mobile' : ''}>${picture(p.image.src, p.image.alt)}${p.ai ? AI_SVG : ''}</div>${small}</div>` : '';
  const part = (cls, h) => (h ? `<div class="${cls} cmp-text rt">${h}</div>` : '');
  const ph = (p.price || p.ctas.length) ? `<div class="cmp-promo__placeholder"><div class="cmp-promo__children">${p.price ? `<div class="price">${priceHtml(p.price, '')}</div>` : ''}${p.ctas.map((c) => `<div class="cta">${cta(c)}</div>`).join('')}</div></div>` : '';
  return `<div class="cmp-promo${p.equal ? ' promo--equal' : ''}"${attrs}>${flag}${image}<div class="cmp-promo__content">${part('cmp-promo__headline', p.headlineHtml)}${part('cmp-promo__title', p.titleHtml)}${part('cmp-promo__text', p.textHtml)}${ph}</div></div>`;
};
const tile2 = (t) => {
  const cls = ['cmp-tile', t.reducedM ? 'reduced-m' : '', t.reducedD ? 'reduced-d' : '', t.icon ? '' : 'no-icon'].filter(Boolean).join(' ');
  const style = t.color && t.color !== '#fff' && t.color !== '#ffffff' ? ` style="--tile-bg:${t.color}"` : '';
  return `<div class="${cls}"${style}>${t.icon ? `<div class="cmp-tile__icon-wrapper"><img class="cmp-tile__icon" src="${icon(t.icon.src)}" alt=""></div>` : ''}<p class="cmp-tile__title">${esc(t.title)}</p>${t.text ? `<div class="cmp-tile__text">${esc(t.text)}</div>` : ''}${t.cta ? `<div class="cmp-tile__cta-wrapper">${cta(t.cta)}</div>` : ''}</div>`;
};
const downloadHtml = (b) => `<div class="cmp-download"><a class="cmp-download__link" href="${esc(b.href)}"><h3 class="cmp-download__title">${esc(b.title)}</h3><dl class="cmp-download__properties">${b.props.map((p) => `<div class="cmp-download__property cmp-download__property--${p.kind}"><dt class="cmp-download__property-label">${esc(p.label)}</dt><dd class="cmp-download__property-content">${esc(p.value)}</dd></div>`).join('')}</dl></a></div>`;
const crumbs = (b) => `<nav class="cmp-breadcrumb" aria-label="${esc(b.aria)}"><ol class="cmp-breadcrumb__list">${b.items.map((it, i) => {
  const ic = i === 0 ? '<span class="cmp-breadcrumb__item-icon" aria-hidden="true"></span>' : '';
  const sep = i > 0 ? '<span class="cmp-breadcrumb__separator-icon" aria-hidden="true"></span>' : '';
  const label = `<span class="cmp-breadcrumb__item-label">${esc(it.label)}</span>`;
  return `<li class="cmp-breadcrumb__item${it.current ? ' cmp-breadcrumb__item--active' : ''}"${it.current ? ' aria-current="page"' : ''}>${sep}${it.href && !it.current ? `<a class="cmp-breadcrumb__item-link" href="${esc(it.href)}"${it.aria ? ` aria-label="${esc(it.aria)}"` : ''}>${ic}${label}</a>` : `${ic}${label}`}</li>`;
}).join('')}</ol></nav>`;
// an XF column's own bottom padding (emitted as a trailing spacer) folds into the module it wraps
const merged = [];
for (const b of page.blocks) {
  const prev = merged[merged.length - 1];
  if (b.type === 'spacer' && prev && prev.type === 'hero') { prev.colPad = b; continue; }
  merged.push(b);
}
const render = (b) => {
  switch (b.type) {
    case 'articleHeader': return `<div class="${sp({ ...b, bg: null })}"><section class="cmp-article-header"><div class="cmp-article-header__wrapper"><div class="cmp-article-header__teaser"><h1 class="cmp-article-header__teaser-headline">${esc(b.h1)}</h1><p class="cmp-article-header__teaser-title">${esc(b.title)}</p><p class="cmp-article-header__teaser-text">${esc(b.text)}</p></div><div class="cmp-article-header__image">${picture(b.image.src, b.image.alt)}${b.ai ? AI_SVG : ''}</div></div></section></div>`;
    case 'breadcrumb': return `<div class="${sp(b, 'col--full')}">${crumbs(b)}</div>`;
    case 'columns': return `<div class="${sp(b)}"><div class="ccw">${b.cols.map((c) => `<div class="ccw__column ccw__column--${c.width}">${c.blocks ? c.blocks.map(render).join('') : `<div class="cmp-text rt">${c.html || ''}</div>`}</div>`).join('')}</div></div>`;
    case 'richtext': return `<div class="${sp(b, 'minh')}"><div class="cmp-text rt">${b.html || ''}</div></div>`;
    case 'promo': return `<div class="${sp(b)}">${promo2(b.promo)}</div>`;
    case 'benefits': return `<div class="${sp(b)}"><div class="benefits${b.frame ? ` is-${b.frame}` : ''}" style="--benefit-color:${esc(b.color)}">${b.flag ? `<div class="benefits__flag-container"><p class="benefits__flag pos-${b.flagPos}">${esc(b.flag)}</p></div>` : ''}<div class="benefits__items">${b.items.map((h) => (typeof h === 'string' ? `<div class="benefits__item cmp-text rt">${h}</div>`
      : `<div class="benefits__item${h.icon ? ' has-icon' : ''}">${h.icon ? `<img class="benefits__item-icon" src="${icon(h.icon.src)}" alt="">` : ''}${h.title ? `<p class="benefits__item-title">${esc(h.title)}</p>` : ''}<div class="benefits__item-text cmp-text rt">${h.html || ''}</div></div>`)).join('')}</div></div></div>`;
    case 'productHero': {
      const img = b.image ? `<div class="cmp-hero__image"><div class="media">${picture(b.image.src, b.image.alt)}</div></div>` : '';
      return `<div class="${sp({ ...b, bg: null })}"><div class="hero"><div class="cmp-hero cmp-hero--product bg-${b.bg || 'white'}" data-image-position="${b.pos}">${img}<div class="cmp-hero__teaser"><div class="cmp-hero__teaser-headline"><h1 class="txt-h1">${esc(b.h1)}</h1></div><div class="cmp-hero__teaser-title"><p class="cmp-hero__title">${esc(b.title)}</p></div>${b.textHtml ? `<div class="cmp-hero__teaser-text cmp-text rt">${b.textHtml}</div>` : ''}<div class="cmp-hero__child-components">${b.ctas.map((c) => `<div class="cta">${cta(c)}</div>`).join('')}</div></div></div></div></div>`;
    }
    case 'accordion': return `<div class="${sp(b)}"><div class="cmp-accordion">${b.items.map((it) => `<details class="cmp-accordion__item"${it.open ? ' open' : ''}><summary class="cmp-text"><h3 class="cmp-accordion__header"><span class="cmp-accordion__title">${esc(it.title)}</span></h3></summary><div class="cmp-accordion__panel">${it.blocks.map(render).join('')}</div></details>`).join('')}</div></div>`;
    case 'productTable': {
      const ncols = (r) => r.cells.length - 1;
      const cell = (c, i, r) => {
        const inner = c.icon ? `<div class="productTable__icon"><img src="${icon(c.icon.src)}" alt="${esc(c.icon.alt)}"></div>` : `<div class="cmp-text rt">${c.html || ''}</div>`;
        const role = r.header ? 'columnheader' : i === 0 ? 'rowheader' : 'cell';
        return i === 0 ? `<div class="productTable__cell productTable__cell--label has-tariff-cols-${ncols(r)}"${r.color ? ` data-color="${r.color}"` : ''} role="${role}">${inner}</div>` : `<div class="productTable__cell productTable__cell--tariff" role="${role}">${inner}</div>`;
      };
      const row = (r) => `<div class="productTable__row${r.header ? ' productTable__row--header' : ''}${r.sticky ? ' is-sticky' : ''}" role="row">${r.cells.map((c, i) => cell(c, i, r)).join('')}</div>`;
      const body = b.rows.map((r) => (r.group != null ? `<div class="productTable__row--subheading is-sticky" role="rowgroup"><div class="productTable__subheading" role="row"><div class="productTable__cell cmp-text rt" role="cell">${r.group}</div></div>${r.rows.map(row).join('')}</div>` : row(r))).join('');
      return `<div class="${sp(b)}"><div class="productTable"><div class="productTable__table productTable__table--label-width-${b.labelWidth} productTable__table--tariff-alignment-${b.align}" role="table">${body}</div></div></div>`;
    }
    case 'download': return `<div class="${sp(b)}">${downloadHtml(b)}</div>`;
    case 'banner': return `<div class="col"><div class="banner bg-yellow bleed sp-s sp-tb">${cta(b.cta)}</div></div>`;
    case 'spacer': return `<div class="${sp(b)}" aria-hidden="true"></div>`;
    case 'hero': {
      const img = b.image ? `<div class="cmp-hero__image"><div class="media">${picture(b.image.src, b.image.alt)}</div></div>` : '';
      const st = b.storer ? `<div class="cmp-hero__storer"><img src="${icon(b.storer.src)}" alt="${esc(b.storer.alt)}"></div>` : '';
      return `<div class="${b.colPad ? sp(b.colPad) : 'col'}"><div class="hero"><div class="cmp-hero">${img}<div class="cmp-hero__teaser${b.storer ? ' has-storer' : ''}">${st}<div class="cmp-hero__teaser-headline"><h1 class="txt-h1">${esc(b.h1)}</h1></div><div class="cmp-hero__teaser-title"><p class="cmp-hero__title">${esc(b.title)}</p></div><div class="cmp-hero__teaser-text cmp-text">${b.textHtml}</div><div class="cmp-hero__child-components">${b.price ? `<div class="price">${priceHtml(b.price, 'size-auto')}</div>` : ''}${b.ctas.map((c) => `<div class="cta">${cta(c)}</div>`).join('')}</div></div></div></div></div>`;
    }
    case 'text': {
      let inner;
      if (b.kind === 'eyebrow') inner = `<h2 class="txt-eyebrow ta-c">${b.html}</h2>`;
      else if (b.kind === 'h2') inner = `<h2 class="txt-h2 ta-c">${b.html.replace(/<span>/g, '<span class="color--red">')}</h2>`;
      else inner = `<p class="ta-c">${b.html}</p>`;
      return `<div class="${sp(b, 'minh')}"><div class="cmp-text">${inner}</div></div>`;
    }
    case 'cta': return `<div class="${sp(b, b.center ? 'pos-center' : '')}">${cta(b.cta)}</div>`;
    case 'carousel': {
      const slider = b.article || (b.loop && b.items[0]?.v) ? 'always' : b.loop ? 'mobile' : null;
      const reducedDesktop = b.items.every((i) => i.kind === 'tile' && rgbHex(i.color) === '#ffffff');
      const card = (it) => (it.v ? (it.kind === 'tile' ? tile2(it) : it.kind === 'download' ? downloadHtml(it) : promo2(it)) : it.kind === 'article' ? articleCard(it) : it.kind === 'tile' ? tileCard(it, reducedDesktop) : promoCard(it));
      return `<div class="${sp(b)}"><div class="cmp-carousel__container cols-m-${b.cols.m} cols-l-${b.cols.l}${b.article ? ' article-carousel' : ''}"${slider ? ` data-slider="${slider}"` : ''}><div class="splide"><div class="splide__track"><div class="splide__list">${b.items.map((it) => `<div class="slide${it.slidePad ? ` pad-${it.slidePad}` : ''}">${card(it)}</div>`).join('')}</div></div>${slider ? nav : ''}</div></div></div>`;
    }
    case 'ekomi': {
      const score = (b.score || '').replace(',', '.');
      return `<div class="${sp(b)}"><div class="ekomi-wrapper"><div class="cmp-ekomi"><div class="cmp-ekomi__blockquote"><figure class="cmp-ekomi__blockquote-figure"><blockquote class="cmp-ekomi__quote">${esc(b.quote)}</blockquote><figcaption class="cmp-ekomi__figcaption"></figcaption></figure></div><div class="cmp-ekomi__rating-container"><div class="cmp-ekomi__rating-seal" role="img" aria-label="${esc(b.seal)}"></div><div class="cmp-ekomi__rating" style="--score:${score}" aria-label="${esc(b.ratingAria)}"><span>${esc(b.score)}</span>/5</div><p class="cmp-ekomi__rating-text">${b.ratingTextHtml}</p></div><div class="cmp-ekomi__quoteslink">${cta({ ...b.link, variant: 'text-link', size: null, width: null })}</div></div></div></div>`;
    }
    case 'embed': return `<div class="${sp(b)}"><div class="cmp-embed cmp-embed--${esc(b.provider || 'youtube')}"><div class="cmp-embed__content" style="position:relative;padding-bottom:${esc(b.ratio)};height:0"><iframe class="cmp-embed__player-wrapper" style="position:absolute;inset:0;width:100%;height:100%;border:0" src="https://www.youtube.com/embed/${esc(b.videoId)}" title="${esc(b.title || '')}"${b.aria ? ` aria-label="${esc(b.aria)}"` : ''} allowfullscreen loading="lazy"></iframe></div></div></div>`;
    case 'scrolltop': return `<div class="${sp(b)}"><div class="cmp-scrollToTop"><a class="cmp-scrollToTop__link" href="${esc(b.href)}">${esc(b.label)}</a></div></div>`;
    default: return `<!-- unhandled block ${esc(b.type)} -->`;
  }
};
const blocks = merged.map(render).join('\n');

const html = `<!doctype html>
<html lang="${page.head.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.head.title)}</title>
<meta name="description" content="${esc(page.head.description)}">
<link rel="icon" href="assets/icons/favicon-32x32.png">
<link rel="preload" href="shared/fonts/fira-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="shared/fonts/fira-sans-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="shared/fonts/noto-serif-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="shared/fonts/noto-serif-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="shared/canon.css">
<link rel="stylesheet" href="shared/chrome.css">${page._source?.layout ? '\n<link rel="stylesheet" href="shared/modules.css">' : ''}${/"type":"(productHero|accordion|productTable|download)"/.test(JSON.stringify(page.blocks)) ? '\n<link rel="stylesheet" href="shared/program.css">' : ''}
<link rel="stylesheet" href="${slug}.css">
</head>
<body>
${headerB2b || header}
<main id="main" class="page-main">
<div class="grid${page._source?.layout ? ` grid--${page._source.layout}` : ''}">
${blocks}
</div>
</main>
${pageFooter}
<script src="shared/chrome.js" defer></script>
<script src="shared/carousel.js" defer></script>
${/"type":"productTable"/.test(JSON.stringify(page.blocks)) ? '<script src="shared/product-table.js" defer></script>\n' : ''}</body>
</html>
`;
fetchOnce('https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/favicons/favicon-32x32.png', `${ROOT}/icons/favicon-32x32.png`);
for (const n of ['CloseIcon', 'ChevronRightIcon', 'CalculatorIcon', 'ArrowLeftIcon', 'ArrowRightIcon', 'NewArrowRightIcon', 'NewChevronDownIcon', 'PhoneIcon', 'ScrollToTopIcon', 'SearchIcon', 'HeadsetIcon', 'BreadcrumbHomeIcon', 'NewChevronRightIcon', 'CheckIcon']) {
  fetchOnce(`https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/${n}.svg`, `${ROOT}/icons/${n}.svg`);
}
for (const n of ['EkomiSealSilver.png', 'StarIconFilled.svg']) fetchOnce(`https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/images/${n}`, `${ROOT}/icons/${n}`);
await Promise.all(pending);
writeFileSync('stardust/prototypes/shared/header.html', `${header}\n`);
writeFileSync('stardust/prototypes/shared/footer.html', `${footer}\n`);
if (headerB2b) writeFileSync('stardust/prototypes/shared/header-b2b.html', `${headerB2b}\n`);
if (page.footer && page.footer.variant === 'b2b') writeFileSync('stardust/prototypes/shared/footer-b2b.html', `${pageFooter}\n`);
writeFileSync(`stardust/prototypes/${slug}-proposed.html`, html);
console.log(`built stardust/prototypes/${slug}-proposed.html (${html.length} bytes), fetched ${pending.length} assets`);
