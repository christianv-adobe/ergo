/**
 * ccw — canon column control (c20 .ccw): rich-text columns, stacked below 768, halves from 768.
 * Reconstructive (stardust/eds-schema/de-ratgeber.json § ccw, unit DIV.ccw__column):
 * one column per authored cell (rows are read in order; an empty cell is skipped).
 *
 * Authoring: one row, one cell per column; any rich text (paragraphs, lists, headings, links).
 */
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
    cols.push(col);
  });
  if (!cols.length) return;
  block.replaceChildren(...cols);
}
