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
 *   · alt | magenta (single button) | alt-2 | magenta-2 (button pair / price + buttons in a row)
 *   | alt-3 (step navigation: each authored paragraph is one step, the first is current;
 *   rendered like the live ee_step-navigation as disabled step buttons)
 */

/**
 * alt-3: authored step labels become the live step navigation (ol > li > button[disabled]);
 * the step number is a CSS counter, as on the live page.
 * @param {Element[]} paras authored paragraphs, one per step
 * @returns {HTMLOListElement}
 */
function buildSteps(paras) {
  const ol = document.createElement('ol');
  ol.className = 'cta-steps';
  paras.filter((p) => p.textContent.trim()).forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'cta-step';
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = true;
    button.className = 'cta-step-button';
    const label = document.createElement('span');
    label.className = 'cta-step-label';
    label.textContent = p.textContent.trim();
    button.append(label);
    li.append(button);
    if (i === 0) {
      li.classList.add('active');
      li.setAttribute('aria-current', 'step');
    }
    ol.append(li);
  });
  return ol;
}

export default function decorate(block) {
  const paras = [...block.querySelectorAll(':scope > div > div > *')];
  block.classList.add('cmp-cta');
  if (block.classList.contains('alt-3') && paras.length && !block.querySelector('a[href]')) {
    block.replaceChildren(buildSteps(paras));
    return;
  }
  block.replaceChildren(...paras);
}
