/* ERGO replica — product table sticky header: `is-pinned` while the header row is stuck under the site header
   (observed on live, motion/<program>.json: class added on scroll). Pinned header cells show only their first text line. */
(() => {
  const rows = [...document.querySelectorAll('.productTable__row--header.is-sticky')];
  if (!rows.length) return;
  const sync = () => rows.forEach((row) => {
    const top = parseFloat(getComputedStyle(row).top) || 0;
    const table = row.closest('.productTable__table');
    const stuck = row.getBoundingClientRect().top <= top + 0.5 && table.getBoundingClientRect().top < top;
    row.classList.toggle('is-pinned', stuck);
  });
  document.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
