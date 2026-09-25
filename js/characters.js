/* =========================================================
   หน้าบุคคลสำคัญ: ค้นหา + ตัวกรอง (ฝ่าย / ยุค / สถานะ / กลุ่ม) + เรียงลำดับ
   ตัวกรองจำค่าไว้ใน URL (?q=&side=&era=&status=&org=&sort=) แชร์ลิงก์ได้
   ========================================================= */
(function () {
  const norm = s => (s || '').normalize('NFC').toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'").replace(/\s+/g, ' ').trim();
  const STATUS_GROUP = { alive: 'alive', dead: 'dead', missing: 'missing', unknown: 'missing', captured: 'missing', erased: 'missing', daemon: 'daemon' };

  /* เงื่อนไขการกรอง — แยกเป็นฟังก์ชันล้วนเพื่อทดสอบใน node ได้ */
  function match(p, st) {
    if (st.side !== 'all' && p.side !== st.side) return false;
    if (st.era !== 'all' && !(p.era === st.era || p.era === 'both')) return false;
    if (st.status !== 'all' && STATUS_GROUP[p.status] !== st.status) return false;
    if (st.org !== 'all' && p.org !== st.org) return false;
    const q = norm(st.q);
    if (q) {
      const hay = norm([p.name, p.th, p.org, p.fac || '', p.role, p.text].join(' '));
      if (!q.split(' ').every(t => hay.indexOf(t) > -1)) return false;
    }
    return true;
  }
  const api = { match, norm, STATUS_GROUP };
  if (typeof window !== 'undefined') window.CharFilter = api;
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof document === 'undefined' || !document.getElementById('c-grid')) return;

  const grid = document.getElementById('c-grid');
  const cards = [...grid.querySelectorAll('.pcard')];
  const data = cards.map((el, i) => ({
    el, i,
    side: el.dataset.side, era: el.dataset.era, status: el.dataset.status, org: el.dataset.org,
    name: el.querySelector('h3').firstChild.textContent.trim(),
    th: (el.querySelector('h3 .th') || {}).textContent || '',
    fac: el.querySelector('.org').textContent,
    role: el.querySelector('.role').textContent, text: el.querySelector('.txt').textContent
  }));
  const $ = id => document.getElementById(id);
  const input = $('c-search'), org = $('c-org'), sort = $('c-sort'), count = $('c-count'), empty = $('c-empty');
  const st = { q: '', side: 'all', era: 'all', status: 'all', org: 'all', sort: 'default' };

  try {
    const u = new URLSearchParams(location.search);
    ['q', 'side', 'era', 'status', 'org', 'sort'].forEach(k => { if (u.get(k)) st[k] = u.get(k); });
  } catch (e) { /* ใช้ค่าเริ่มต้น */ }

  function paintControls() {
    input.value = st.q; org.value = st.org; sort.value = st.sort;
    if (org.value !== st.org) { st.org = 'all'; org.value = 'all'; }
    document.querySelectorAll('#char-tools [data-f]').forEach(b => {
      const on = st[b.dataset.f] === b.dataset.v;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
    });
  }
  function apply(pushUrl) {
    let shown = 0;
    data.forEach(d => { const ok = match(d, st); d.el.hidden = !ok; if (ok) shown++; });
    const order = data.slice();
    if (st.sort === 'az') order.sort((a, b) => a.name.localeCompare(b.name));
    else if (st.sort === 'za') order.sort((a, b) => b.name.localeCompare(a.name));
    else order.sort((a, b) => a.i - b.i);
    order.forEach(d => grid.appendChild(d.el));
    count.textContent = shown;
    empty.hidden = shown > 0;
    if (pushUrl) {
      const u = new URLSearchParams();
      Object.entries(st).forEach(([k, v]) => { if (v && v !== 'all' && v !== 'default') u.set(k, v); });
      const qs = u.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) { /* file:// บางเบราว์เซอร์ */ }
    }
  }
  document.getElementById('char-tools').addEventListener('click', e => {
    const b = e.target.closest('[data-f]');
    if (b) { st[b.dataset.f] = b.dataset.v; paintControls(); apply(true); }
  });
  input.addEventListener('input', () => { st.q = input.value; apply(true); });
  org.addEventListener('change', () => { st.org = org.value; apply(true); });
  sort.addEventListener('change', () => { st.sort = sort.value; apply(true); });
  $('c-reset').addEventListener('click', () => {
    Object.assign(st, { q: '', side: 'all', era: 'all', status: 'all', org: 'all', sort: 'default' });
    paintControls(); apply(true); input.focus();
  });
  paintControls(); apply(false);

  /* มาจากลิงก์ #id — ถ้าการ์ดถูกกรองซ่อนอยู่ ให้ล้างตัวกรองแล้วเลื่อนไปหา */
  const focusHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el || !el.classList.contains('pcard')) return;
    if (el.hidden) { Object.assign(st, { q: '', side: 'all', era: 'all', status: 'all', org: 'all' }); paintControls(); apply(true); }
    cards.forEach(c => c.classList.remove('hit')); el.classList.add('hit');
    setTimeout(() => el.scrollIntoView({ block: 'center' }), 50);
  };
  window.addEventListener('hashchange', focusHash); focusHash();
})();
