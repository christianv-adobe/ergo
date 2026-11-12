/**
 * accordion — canon accordion (accordion.min.css): bordered items, chevron rotates .275s,
 * click / Enter / Space toggles. Reconstructive (repeat group, schema § accordion,
 * unit DETAILS.cmp-accordion__item).
 *
 * Authoring: one row per item — cell 1 the item title (a heading, h3), cell 2 the panel
 * content (paragraphs, lists). A row whose panel cell is EMPTY adopts the next block that
 * follows the accordion in the same section (product-table, promo, carousel …): panels can
 * host blocks without nesting tables in the document. Adopted blocks move whole (EW9) and
 * are still loaded by the section loader.
 *
 * EW7: the authored title never sits in a <button>/<summary>; it moves into
 * div.accordion-title, the whole head row toggles, the button is a chevron-only control.
 *
 * @variants block class: open-first (first item open at rest) · check-list (green check bullets)
 */

let seq = 0;

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const wrapper = block.parentElement;
  // blocks that follow the accordion in its section, in order (adoption candidates)
  const followers = [];
  let next = wrapper ? wrapper.nextElementSibling : null;
  while (next) {
    const b = next.querySelector(':scope > div.block, :scope > div[class]');
    if (b && !next.classList.contains('default-content-wrapper') && !b.classList.contains('accordion')) {
      followers.push(next);
    } else break;
    next = next.nextElementSibling;
  }

  const items = rows.map((row, i) => {
    const cells = [...row.children];
    const headCell = cells[0];
    const panelCell = cells[1];
    const item = document.createElement('div');
    item.className = 'accordion-item';
    seq += 1;
    const id = `accordion-panel-${seq}`;

    const head = document.createElement('div');
    head.className = 'accordion-head';
    const title = document.createElement('div');
    title.className = 'accordion-title';
    if (headCell) title.append(...headCell.children);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-label', title.textContent.trim());
    head.append(title, toggle);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = id;
    const body = document.createElement('div');
    body.className = 'accordion-body';
    if (panelCell && panelCell.children.length) {
      body.append(...panelCell.children);
    } else if (panelCell && panelCell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): bare text in the cell — move the nodes, never copy text
      const p = document.createElement('p');
      p.append(...panelCell.childNodes);
      body.append(p);
    } else if (followers.length) {
      body.classList.add('has-block');
      body.append(followers.shift());
    }
    panel.append(body);
    item.append(head, panel);

    const open = block.classList.contains('open-first') && i === 0;
    const set = (state) => {
      item.classList.toggle('is-open', state);
      toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
      // closed = hidden="until-found" (content-visibility, like native <details>): the content
      // stays in the layout tree for find-in-page / crawlers; beforematch opens the item
      if (state) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', 'until-found');
    };
    set(open);
    panel.addEventListener('beforematch', () => set(true));
    head.addEventListener('click', () => set(!item.classList.contains('is-open')));
    return item;
  });

  block.replaceChildren(...items);
}
