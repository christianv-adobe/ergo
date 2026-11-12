/**
 * breadcrumb — page trail (canon c17 .cmp-breadcrumb): home icon link, chevron separators,
 * current page bold. Template-slotted (stardust/eds-schema/de-ratgeber.json § breadcrumb).
 *
 * Authoring: one list (<ul>) — one item per trail step, a link for every step but the current
 * page (a list is one editable unit, EW5). The first item's label is visually hidden (home
 * icon, the label stays the link's accessible name).
 */
export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(list);
  const items = [...list.children];
  const last = items[items.length - 1];
  if (last && !last.querySelector('a')) last.setAttribute('aria-current', 'page');
  block.replaceChildren(nav);
}
