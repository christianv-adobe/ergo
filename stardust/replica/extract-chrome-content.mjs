// Freeze the shared chrome content (header nav tree, flyout tiles, search suggestions, footer)
// from the extract capture (header sidebar is static markup) and the live snapshot (footer).
// Output: stardust/replica/content/chrome.json — reused by every archetype prototype.
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';
const $ = cheerio.load(readFileSync('stardust/.work/replica/live-1440.html', 'utf8'));
const $l = cheerio.load(readFileSync('stardust/.work/replica/live-1440.html', 'utf8'));
const T = (x, el) => x(el).text().replace(/\s+/g, ' ').trim();
const navList = (ul) => $(ul).children('li').map((_, li) => {
  const btn = $(li).children('button').first();
  const a = $(li).children('a').first();
  if (btn.length) {
    const sub = $(li).children('ul').first();
    const tiles = $(li).children('.headerNavigation__tiles-container').find('.cmp-tile').map((__, t) => ({
      icon: $(t).find('.cmp-tile__icon').attr('src') || null, title: T($, $(t).find('.cmp-tile__title')), text: T($, $(t).find('.cmp-tile__text')),
      cta: { label: T($, $(t).find('.cmp-cta__label')), href: $(t).find('.cmp-cta__link').attr('href'), aria: $(t).find('.cmp-cta__link').attr('aria-label') || null } })).get();
    return { label: T($, btn), heading: T($, $(li).children('.headerNavigation__navigation-item-heading')) || null, children: navList(sub), tiles };
  }
  return { label: T($, a), href: a.attr('href') };
}).get();
const sb = $('.headerNavigation__sidebar').first();
const header = {
  logoDesktop: { src: $('#MainNavi-logo-ergo img').attr('src'), alt: $('#MainNavi-logo-ergo img').attr('alt'), href: '/de' },
  logoMobile: { src: $('#MainNavi-logo-ergo-smallView img').attr('src'), alt: $('#MainNavi-logo-ergo-smallView img').attr('alt'), href: '/de' },
  top: $('.headerNavigation__links-list > li button').map((_, b) => T($, b)).get(),
  actions: {
    search: { label: 'Suche', aria: $('#MainNavi-action-item-search').attr('aria-label') },
    agent: { label: 'Berater', aria: $('#MainNavi-action-item-agentSearch').attr('aria-label'), href: $('#MainNavi-action-item-agentSearch').attr('href') },
    login: { label: 'Log-in', aria: $('#MainNavi-action-item-login').attr('aria-label'), href: $('#MainNavi-action-item-login').attr('href') },
    phone: { label: 'Anrufen', aria: $('#MainNavi-action-item-phone').attr('aria-label'), href: $('#MainNavi-action-item-phone').attr('href'), number: T($, $('#MainNavi-action-item-phone .phone-text__phonenumber')), hours: T($, $('#MainNavi-action-item-phone .phone-text__hours')) },
    menu: { open: 'Menü', close: 'Schließen' },
  },
  search: {
    placeholder: sb.find('.cmp-search__input').attr('placeholder') || null, navAria: sb.find('.headerNavigation__navigation-container').attr('aria-label') || null,
    heading: T($, sb.find('.cmp-search__heading')), formAria: sb.find('.cmp-search__form').attr('aria-label'),
    clear: 'Eingabe löschen', submit: 'Suche starten',
    suggestionsHeader: T($, sb.find('.cmp-search__suggestions-header')),
    suggestions: sb.find('.cmp-search__suggestions-list a').map((_, a) => ({ label: T($, a), href: $(a).attr('href') })).get(),
  },
  nav: navList(sb.find('.headerNavigation__navigation-container > ul').first()),
  actionItems: sb.find('.headerNavigation__action-items-container .headerNavigation__navigation-link').map((_, a) => ({ label: T($, $(a).find('span')), href: $(a).attr('href'), aria: $(a).attr('aria-label') || null, icon: $(a).find('img').attr('src') || null })).get(),
};
const f = $l('footer').first();
const footer = {
  columns: f.find('.footerAccordion').map((_, acc) => ({
    title: T($l, $l(acc).find('.cmp-accordion__title')),
    links: $l(acc).find('.cmp-footerLinks__link').map((__, a) => ({ label: T($l, a), href: $l(a).attr('href') })).get(),
  })).get(),
  social: { heading: T($l, f.find('.cmp-socialLinks__heading')), links: f.find('.cmp-socialLinks a').map((_, a) => ({ href: $l(a).attr('href'), src: $l(a).find('img').attr('src'), alt: $l(a).find('img').attr('alt') })).get() },
  ribbon: {
    links: f.find('.page-footer__ribbon .linkSection').first().find('.cmp-footerLinks__link').map((_, a) => ({ label: T($l, a), href: $l(a).attr('href') })).get(),
    cookies: { label: T($l, f.find('.cmp-footerCookies__toggle-button')), aria: f.find('.cmp-footerCookies__toggle-button').attr('aria-label') },
    sitemap: { label: T($l, f.find('.cmp-footerSitemap__toggle-button')) },
    strong: f.find('.page-footer__ribbon .linkSection').eq(1).find('.cmp-footerLinks__link').map((_, a) => ({ label: T($l, a), href: $l(a).attr('href') })).get(),
    logos: f.find('.cmp-companyLogos__item-image').map((_, i) => ({ src: $l(i).attr('src'), alt: $l(i).attr('alt') || '' })).get(),
  },
  copyright: T($l, f.find('.txt__caption')),
};
writeFileSync('stardust/replica/content/chrome.json', JSON.stringify({ _source: 'header: extract capture stardust/current/pages/index.html; footer: live snapshot @1440', header, footer }, null, 1));
console.log('nav top', header.nav.map((n) => `${n.label}(${n.children.length}, tiles ${n.tiles.length})`).join(' | '));
console.log('footer cols', footer.columns.map((c) => `${c.title}:${c.links.length}`).join(' | '), 'social', footer.social.links.length, 'ribbon', footer.ribbon.links.length, footer.ribbon.strong.length, footer.ribbon.logos.length, footer.copyright);
console.log('actionItems', JSON.stringify(header.actionItems), JSON.stringify(header.nav[0].tiles[0]));
