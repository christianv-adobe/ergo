/* ERGO replica — chrome behaviour (header contract: stardust/chrome/header-contract.json).
   Desktop >= 1152: top-nav toggles open the flyout panel for that section; Suche opens the
   search overlay; Schließen / Escape / second click / backdrop close (focus returns).
   Mobile < 1152: "Menü" toggles the drawer; level buttons drill down / back.
   Footer: link columns are <details>, forced open >= 768, accordions below. */
(() => {
  const DESKTOP = window.matchMedia('(min-width: 1152px)');
  const nav = document.querySelector('.headerNavigation');
  const sidebar = document.querySelector('.headerNavigation__sidebar');
  const backdrop = document.querySelector('.headerNavigation__backdrop');
  if (nav && sidebar) {
    const topButtons = [...nav.querySelectorAll('[data-flyout]')];
    const searchBtn = nav.querySelector('[data-action="search"]');
    const menuBtn = nav.querySelector('[data-action="menu"]');
    const level1 = [...sidebar.querySelectorAll('.headerNavigation__navigation-list[data-level="1"] > .headerNavigation__navigation-item')];
    let opener = null;

    const resetLevels = () => {
      sidebar.querySelectorAll('.headerNavigation__navigation-button[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      level1.forEach((li) => li.classList.remove('is-open'));
    };
    const close = () => {
      sidebar.hidden = true;
      if (backdrop) backdrop.hidden = true;
      nav.classList.remove('search-open');
      [...topButtons, searchBtn, menuBtn].forEach((b) => b && b.setAttribute('aria-expanded', 'false'));
      resetLevels();
      if (opener) { opener.focus({ preventScroll: true }); opener = null; }
    };
    const open = (btn) => {
      sidebar.hidden = false;
      if (backdrop) backdrop.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      opener = btn;
    };
    topButtons.forEach((btn) => btn.addEventListener('click', () => {
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      close();
      if (wasOpen) return;
      const idx = Number(btn.dataset.flyout);
      const li = level1[idx];
      if (li) {
        li.classList.add('is-open');
        const b = li.querySelector(':scope > .headerNavigation__navigation-button');
        if (b) b.setAttribute('aria-expanded', 'true');
      }
      open(btn);
    }));
    if (searchBtn) searchBtn.addEventListener('click', () => {
      const wasOpen = searchBtn.getAttribute('aria-expanded') === 'true';
      close();
      if (wasOpen) return;
      nav.classList.add('search-open');
      open(searchBtn);
      const input = sidebar.querySelector('.cmp-search__input');
      if (input) input.focus({ preventScroll: true });
    });
    if (menuBtn) menuBtn.addEventListener('click', () => {
      const wasOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      close();
      if (!wasOpen) open(menuBtn);
    });
    // nested levels: one expanded sibling at a time; second click collapses (mobile "back")
    sidebar.querySelectorAll('.headerNavigation__navigation-button[aria-haspopup="true"]').forEach((b) => {
      b.addEventListener('click', () => {
        const expanded = b.getAttribute('aria-expanded') === 'true';
        const list = b.closest('.headerNavigation__navigation-list');
        list.querySelectorAll(':scope > .headerNavigation__navigation-item > .headerNavigation__navigation-button').forEach((s) => s.setAttribute('aria-expanded', 'false'));
        if (list.dataset.level === '1') level1.forEach((li) => li.classList.remove('is-open'));
        if (!expanded) {
          b.setAttribute('aria-expanded', 'true');
          if (list.dataset.level === '1') b.parentElement.classList.add('is-open');
        }
      });
    });
    const closeBtn = sidebar.querySelector('.headerNavigation__close-button');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sidebar.hidden) close(); });
    DESKTOP.addEventListener('change', close);
    // search field: clear button
    const input = sidebar.querySelector('.cmp-search__input');
    const clear = sidebar.querySelector('.cmp-search__input-button--clear');
    if (input && clear) clear.addEventListener('click', () => { input.value = ''; input.focus(); });
  }

  // footer accordions
  const FOOTER_OPEN = window.matchMedia('(min-width: 768px)');
  const accs = [...document.querySelectorAll('.footer-acc')];
  const syncFooter = () => accs.forEach((d) => { d.open = FOOTER_OPEN.matches; });
  syncFooter();
  FOOTER_OPEN.addEventListener('change', syncFooter);
  accs.forEach((d) => d.querySelector('summary').addEventListener('click', (e) => { if (FOOTER_OPEN.matches) e.preventDefault(); }));
})();
