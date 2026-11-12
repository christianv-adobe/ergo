/**
 * banner — promo text-link bar above the hero (live: yellow band with one canon
 * `cmp-cta text-link size-auto w-100` link and a chevron). Template-slotted: the authored
 * CTA paragraph(s) move into a `div.cmp-cta` wrapper carrying the canon modifiers
 * (EW3 — the paragraph moves as-is, no class on the anchor).
 *
 * Authoring: one CTA paragraph `<em><a href>…</a></em>` (the wrapper repaints it as a
 *   brand text link). The band colour and spacing come from the section style
 *   (`bg-yellow, sp-s-tb`).
 *
 * @variants block class: none
 */
export default function decorate(block) {
  const paras = [...block.querySelectorAll(':scope > div > div > *')];
  const cta = document.createElement('div');
  cta.className = 'cmp-cta text-link size-auto w-100 ic-chevron';
  cta.append(...paras);
  block.replaceChildren(cta);
}
