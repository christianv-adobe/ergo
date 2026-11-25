/**
 * ccw — canon column control (c20 .ccw): rich-text columns, stacked below 768, halves from 768.
 * Reconstructive (stardust/eds-schema/de-ratgeber.json § ccw, unit DIV.ccw__column):
 * one column per authored cell (rows are read in order; an empty cell is skipped).
 *
 * Authoring: one row, one cell per column; any rich text (paragraphs, lists, headings, links).
 *
 * @variants block class: light | cyan-light (tinted band behind the columns)
 *   | image (an image-only column is narrow, the text column takes the rest)
 *
 * Design-pass hooks (no content change):
 * - `ccw-tile`: a bold-only paragraph directly followed by a lone CTA paragraph is the
 *   canon reduced navigation tile (cmp-tile: title + arrow, the whole tile is the link);
 *   both paragraphs are wrapped as they are.
 * - `ccw-row`: a block without option class whose first column is text and whose other
 *   columns are image-only (icons) is a comparison row (productTable__row look).
 */
function wrapTiles(col) {
  [...col.querySelectorAll(':scope > p')].forEach((p) => {
    const strong = p.children.length === 1 && p.querySelector(':scope > strong');
    if (!strong || p.textContent.trim() !== strong.textContent.trim()) return;
    const next = p.nextElementSibling;
    if (!next || next.tagName !== 'P' || next.querySelectorAll('a').length !== 1
      || next.textContent.trim() !== next.querySelector('a').textContent.trim()) return;
    const tile = document.createElement('div');
    tile.className = 'ccw-tile';
    p.classList.add('ccw-tile-title');
    p.before(tile);
    tile.append(p, next);
  });
}

export default function decorate(block) {
  const cols = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!cell.children.length && !cell.textContent.trim()) return;
    const col = document.createElement('div');
    col.className = 'ccw-column';
    if (!cell.children.length) {
      // HARNESS-ONLY fallback (EW5): bare text cell — wrap the existing text nodes
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      col.append(p);
    } else {
      col.append(...cell.children);
    }
    // image-only column (picture, optionally wrapped in a paragraph): hook for the `image` option
    const onlyPicture = col.children.length === 1 && col.querySelector('picture')
      && !col.textContent.trim();
    if (onlyPicture) col.classList.add('ccw-column-image');
    else wrapTiles(col);
    cols.push(col);
  });
  if (!cols.length) return;
  block.replaceChildren(...cols);

  const optioned = ['light', 'cyan-light', 'image'].some((c) => block.classList.contains(c));
  if (!optioned && cols.length > 1 && !cols[0].classList.contains('ccw-column-image')
    && cols.slice(1).every((c) => c.classList.contains('ccw-column-image'))) {
    block.classList.add('ccw-row');
    cols[0].classList.add('ccw-column-label');
  }
}
