/* ไทม์ไลน์ 40K: กรองตามยุค (จำค่าใน #era-xxx ของ URL) */
(function () {
  const tl = document.getElementById('tl'); if (!tl) return;
  const btns = [...document.querySelectorAll('.tl-tools [data-era]')];
  const set = era => {
    btns.forEach(b => b.classList.toggle('chip-gold', b.dataset.era === era));
    tl.querySelectorAll('[data-era]').forEach(li => { li.hidden = era !== 'all' && li.dataset.era !== era; });
  };
  btns.forEach(b => b.addEventListener('click', () => {
    set(b.dataset.era);
    history.replaceState(null, '', b.dataset.era === 'all' ? location.pathname : '#era-' + b.dataset.era);
  }));
  const m = location.hash.match(/^#era-(.+)$/);
  if (m && btns.some(b => b.dataset.era === m[1])) set(m[1]);
})();
