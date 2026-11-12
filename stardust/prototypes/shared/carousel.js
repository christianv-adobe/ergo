/* ERGO replica — carousel (splide behaviour as observed on live): arrows, pagination dots,
   loop (prev on the first page wraps to the last), pointer drag. A container is a slider when
   data-slider="always", or data-slider="mobile" below 768px; otherwise a wrapped grid.
   Pages = ceil(slides / perPage); perPage comes from the CSS --column-width of the breakpoint.
   Navigation is hidden when there is a single page (live parity). */
(() => {
  const MOBILE = window.matchMedia('(max-width: 767px)');
  const carousels = [...document.querySelectorAll('.cmp-carousel__container[data-slider]')];

  const setup = (root) => {
    const list = root.querySelector('.splide__list');
    const slides = [...list.children];
    const nav = root.querySelector('.cmp-carousel__navigation');
    const dots = nav.querySelector('.cmp-carousel__indicators-list');
    const prev = nav.querySelector('.prev');
    const next = nav.querySelector('.next');
    const state = { page: 0, pages: 1, per: 1, on: false, clones: 0 };
    // loop clones as splide renders them: 2 x perPage per side (capped at the slide count)
    const unclone = () => { list.querySelectorAll('.splide__slide--clone').forEach((c) => c.remove()); state.clones = 0; };
    const reclone = () => {
      unclone();
      const n = Math.min(slides.length, state.per * 2);
      const mk = (s) => { const c = s.cloneNode(true); c.classList.add('splide__slide--clone'); c.setAttribute('inert', ''); return c; };
      slides.slice(-n).forEach((s) => list.insertBefore(mk(s), slides[0]));
      slides.slice(0, n).forEach((s) => list.append(mk(s)));
      state.clones = n;
    };

    const perPage = () => {
      const w = getComputedStyle(root).getPropertyValue('--column-width').trim();
      const pct = parseFloat(w) || 100;
      return Math.max(1, Math.round(100 / pct));
    };
    const render = () => {
      if (!state.on) { list.style.transform = ''; return; }
      const slideW = slides[0].getBoundingClientRect().width;
      list.style.transform = `translateX(${-(state.clones + state.page * state.per) * slideW}px)`;
      [...dots.children].forEach((li, i) => li.firstElementChild.classList.toggle('is-active', i === state.page));
      prev.setAttribute('aria-label', state.page === 0 ? 'gehe zur letzten Seite' : 'vorherige Seite');
      next.setAttribute('aria-label', state.page === state.pages - 1 ? 'gehe zur ersten Seite' : 'nächste Seite');
      const first = state.page * state.per;
      slides.forEach((s, i) => {
        const vis = i >= first && i < first + state.per;
        s.classList.toggle('is-visible', vis);
        s.classList.toggle('is-active', i === first);
        s.classList.toggle('is-prev', i === (first - 1 + slides.length) % slides.length);
        s.classList.toggle('is-next', i === (first + 1) % slides.length);
        s.toggleAttribute('inert', !vis);
      });
    };
    const go = (p) => { state.page = (p + state.pages) % state.pages; render(); };
    const build = () => {
      const mode = root.dataset.slider;
      state.per = perPage();
      state.on = (mode === 'always' || (mode === 'mobile' && MOBILE.matches)) && slides.length > state.per;
      root.classList.toggle('is-slider', state.on);
      if (state.on) reclone(); else unclone();
      state.pages = state.on ? Math.ceil(slides.length / state.per) : 1;
      state.page = Math.min(state.page, state.pages - 1);
      dots.innerHTML = '';
      if (state.on) {
        const unit = state.per === 1 ? 'Element' : 'Seite';
        for (let i = 0; i < state.pages; i += 1) {
          const li = document.createElement('li');
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'splide__pagination__page cmp-carousel__indicator-button';
          b.setAttribute('aria-label', `gehe zu ${unit} ${i + 1}`);
          b.addEventListener('click', () => go(i));
          li.append(b);
          dots.append(li);
        }
      }
      slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} von ${slides.length}`));
      list.querySelectorAll('.splide__slide--clone').forEach((c) => { const i = slides.findIndex((s) => s.isEqualNode && s.querySelector('a, button') && c.textContent === s.textContent); if (i >= 0) c.setAttribute('aria-label', `${i + 1} von ${slides.length}`); });
      if (!state.on) slides.forEach((s) => { s.classList.remove('is-visible'); s.removeAttribute('inert'); });
      render();
    };
    prev.addEventListener('click', () => go(state.page - 1));
    next.addEventListener('click', () => go(state.page + 1));
    // drag / swipe
    let x0 = null;
    list.addEventListener('pointerdown', (e) => { if (state.on) { x0 = e.clientX; } });
    window.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(state.page + (dx < 0 ? 1 : -1));
    });
    list.addEventListener('dragstart', (e) => e.preventDefault());
    build();
    window.addEventListener('resize', build);
  };
  carousels.forEach(setup);
})();
