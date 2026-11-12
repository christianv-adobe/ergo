/**
 * cta — standalone call-to-action (canon .cmp-cta wrapper around the authored CTA paragraph).
 * Template-slotted: the block element itself becomes the `div.cmp-cta` wrapper and the
 * authored paragraphs move into it (EW3 — CTAs move as their <p>; no class on the anchor).
 *
 * Authoring: one or more CTA paragraphs — <strong><a> primary, <em><a> secondary,
 *   <strong><em><a> tertiary (EDS button convention, foundation styles.css).
 *
 * @variants block class: w-33 | w-50 | w-100 | size-auto | size-large | primary | secondary
 *   | tertiary | text-link | icon-left | ic-chevron | ic-calculator | ic-headset
 *   (the canon cmp-cta modifiers; centring comes from the section style `pos-center`)
 */
export default function decorate(block) {
  const paras = [...block.querySelectorAll(':scope > div > div > *')];
  block.classList.add('cmp-cta');
  block.replaceChildren(...paras);
}
