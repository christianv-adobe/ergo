/**
 * fund-chart — static structural rendering of a fund allocation chart: a tab bar of views
 * (Sektoren, Anlage nach Regionen, Größte Einzelwerte), each with the authored chart graphic
 * and a legend.
 *
 * No live fund data and no chart library: each view shows the authored image and legend.
 * The tab bar only switches between the authored views.
 *
 * Authoring:
 * - optional 1-cell row(s)             -> intro (heading / text) above the tabs
 * - tab label | graphic | legend list  -> one view; the graphic cell holds a picture (or text,
 *                                         e.g. a table of largest holdings); the legend cell holds
 *                                         a list, one item per series ("66,4 % Nordamerika")
 *
 * Options: cyan-magenta (series palette for the legend markers).
 */

let instance = 0;

function cellText(cell) {
  return (cell?.textContent || '').replace(/\s+/g, ' ').trim();
}

export default function decorate(block) {
  instance += 1;
  const intro = document.createElement('div');
  intro.className = 'fund-chart-intro';
  const tablist = document.createElement('div');
  tablist.className = 'fund-chart-tabs';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'fund-chart-panels';

  const views = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    if (cells.length === 1) {
      intro.append(...cells[0].childNodes);
      return;
    }
    views.push(cells);
  });

  views.forEach(([labelCell, graphicCell, legendCell], i) => {
    const id = `fund-chart-${instance}-${i}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'fund-chart-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.textContent = cellText(labelCell) || `${i + 1}`;
    tablist.append(tab);

    const panel = document.createElement('div');
    panel.className = 'fund-chart-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = i !== 0;

    if (graphicCell && (cellText(graphicCell) || graphicCell.querySelector('picture, img, table'))) {
      const graphic = document.createElement('div');
      graphic.className = 'fund-chart-graphic';
      graphic.append(...graphicCell.childNodes);
      panel.append(graphic);
    }
    if (legendCell && cellText(legendCell)) {
      const legend = document.createElement('div');
      legend.className = 'fund-chart-legend';
      legend.append(...legendCell.childNodes);
      legend.querySelectorAll('li').forEach((li, n) => li.style.setProperty('--fund-chart-series', n));
      panel.append(legend);
    }
    panels.append(panel);
  });

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('.fund-chart-tab');
    if (!tab) return;
    tablist.querySelectorAll('.fund-chart-tab').forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
    panels.querySelectorAll('.fund-chart-panel').forEach((p) => {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
  });

  block.replaceChildren();
  if (intro.childNodes.length) block.append(intro);
  if (views.length > 1) block.append(tablist);
  block.append(panels);
}
