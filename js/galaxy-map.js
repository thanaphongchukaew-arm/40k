/* =========================================================
   แผนที่กาแล็กซีแบบกดได้: วาดกาแล็กซีด้วย SVG, ซูม/เลื่อน, กดดาวเพื่อดูรายละเอียด
   ข้อมูลมาจาก window.PLANETS (สร้างจาก gen/galaxy_map.py)
   ========================================================= */
(function () {
  const W = 1400, H = 1120;
  const MAJOR = ['terra', 'cadia', 'eye-of-terror', 'armageddon', 'baal', 'macragge', 'tau', 'fenris', 'valhalla', 'nocturne', 'scourge-stars', 'catachan'];
  const root = document.body.dataset.root || '../';
  const P = window.PLANETS || [], ST = window.PLANET_STATUS || {}, REG = window.MAP_REGIONS || [];
  const norm = s => (s || '').normalize('NFC').toLowerCase().replace(/[‘’]/g, "'").trim();

  /* ฟังก์ชันล้วน (ทดสอบใน node ได้) */
  const matches = (p, q, st) => (st === 'all' || p.status === st) &&
    (!norm(q) || norm([p.name, p.th, p.type, p.ruler, p.life, p.society, p.now].join(' ')).indexOf(norm(q)) > -1);
  const clampView = (v) => {
    v.s = Math.min(4, Math.max(1, v.s));
    const maxX = 0, minX = -(v.s - 1) * 100, maxY = 0, minY = -(v.s - 1) * 100;
    v.x = Math.min(maxX, Math.max(minX, v.x)); v.y = Math.min(maxY, Math.max(minY, v.y));
    return v;
  };
  window.GalaxyMap = { matches, clampView };
  if (typeof document === 'undefined' || !document.getElementById('gmap')) return;

  const map = document.getElementById('gmap'), inner = document.getElementById('gmap-inner');
  const panel = document.getElementById('gm-panel');
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- วาดกาแล็กซี ---------- */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  let stars = '';
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() < .92 ? rnd() * 1.2 + .3 : rnd() * 2 + 1.2;
    stars += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="#fff" opacity="' + (rnd() * .6 + .25).toFixed(2) + '"/>';
  }
  let arms = '';
  for (let a = 0; a < 4; a++) {
    for (let i = 0; i < 90; i++) {
      const t = i / 90, ang = a * Math.PI / 2 + t * 5.2, rad = 40 + t * 520;
      const x = 740 + Math.cos(ang) * rad * 1.15 + (rnd() - .5) * 60, y = 560 + Math.sin(ang) * rad * .72 + (rnd() - .5) * 50;
      arms += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (rnd() * 26 + 10).toFixed(0) + '" fill="url(#armGlow)" opacity="' + (0.5 - t * .35).toFixed(2) + '"/>';
    }
  }
  const rift = 'M150,330 C260,380 360,410 470,430 C560,448 640,470 720,520 C800,570 880,610 960,640 C1040,670 1090,720 1120,800 C1140,850 1180,880 1220,900';
  const svg = '<svg class="gm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
    '<defs><radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7e0" stop-opacity=".95"/><stop offset=".25" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset=".6" stop-color="#8a6cc0" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="armGlow"><stop offset="0" stop-color="#cfc2ff" stop-opacity=".55"/><stop offset="1" stop-color="#6a58a8" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="eye"><stop offset="0" stop-color="#ff4d8a" stop-opacity=".9"/><stop offset=".5" stop-color="#9b2d7a" stop-opacity=".45"/><stop offset="1" stop-color="#3a0d3a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mael"><stop offset="0" stop-color="#ff7a4d" stop-opacity=".7"/><stop offset="1" stop-color="#5a1d0d" stop-opacity="0"/></radialGradient>' +
    '<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="#05060b"/>' + stars +
    '<g filter="url(#blur8)">' + arms + '</g>' +
    '<ellipse cx="740" cy="560" rx="300" ry="210" fill="url(#core)"/>' +
    '<circle cx="205" cy="318" r="120" fill="url(#eye)" filter="url(#blur3)"/>' +
    '<circle cx="675" cy="628" r="70" fill="url(#mael)" filter="url(#blur3)"/>' +
    '<path d="' + rift + '" stroke="#5ff2c9" stroke-width="42" fill="none" opacity=".18" filter="url(#blur8)"/>' +
    '<path d="' + rift + '" stroke="#8effe0" stroke-width="10" fill="none" opacity=".45" filter="url(#blur3)" stroke-dasharray="2 14" stroke-linecap="round"/>' +
    '<circle cx="323" cy="598" r="160" fill="none" stroke="#d0a84f" stroke-opacity=".25" stroke-dasharray="4 8"/>' +
    REG.map(r => '<text x="' + r[1] + '" y="' + r[2] + '" class="gm-region" text-anchor="middle">' + esc(r[0]) + '</text>').join('') +
    '</svg>';
  inner.innerHTML = svg + P.map(p =>
    '<button type="button" class="gm-pin st-' + p.status + (MAJOR.indexOf(p.id) > -1 ? ' major' : '') + '" data-id="' + p.id + '" style="left:' + (p.x / W * 100) + '%;top:' + (p.y / H * 100) + '%" aria-label="' + esc(p.name) + '">' +
      '<i></i><span>' + esc(p.name) + '</span></button>').join('');

  /* ---------- ซูม / เลื่อน ---------- */
  const zoomedClass = () => map.classList.toggle('zoomed', view.s >= 1.6);
  const view = { s: 1, x: 0, y: 0 };
  const apply = () => { clampView(view); inner.style.transform = 'translate(' + view.x + '%,' + view.y + '%) scale(' + view.s + ')'; map.style.setProperty('--z', view.s); zoomedClass(); };
  const zoomAt = (factor, cx, cy) => {
    const r = map.getBoundingClientRect();
    const px = (cx - r.left) / r.width * 100, py = (cy - r.top) / r.height * 100;
    const ns = Math.min(4, Math.max(1, view.s * factor)), k = ns / view.s;
    view.x = px - (px - view.x) * k; view.y = py - (py - view.y) * k; view.s = ns; apply();
  };
  map.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
  let drag = null, moved = false;
  map.addEventListener('pointerdown', e => {
    if (e.target.closest('.gm-zoom')) return;
    drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; moved = false;
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const r = map.getBoundingClientRect();
    const dx = (e.clientX - drag.x) / r.width * 100, dy = (e.clientY - drag.y) / r.height * 100;
    if (Math.abs(dx) + Math.abs(dy) > .6) moved = true;
    if (moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; apply(); map.classList.add('dragging'); }
  });
  window.addEventListener('pointerup', () => { drag = null; map.classList.remove('dragging'); });
  map.querySelector('.gm-zoom').addEventListener('click', e => {
    const b = e.target.closest('[data-z]'); if (!b) return;
    const r = map.getBoundingClientRect();
    if (b.dataset.z === '0') { view.s = 1; view.x = 0; view.y = 0; apply(); }
    else zoomAt(b.dataset.z === '1' ? 1.4 : 1 / 1.4, r.left + r.width / 2, r.top + r.height / 2);
  });
  map.addEventListener('keydown', e => {
    const step = 6;
    if (e.key === '+' || e.key === '=') { const r = map.getBoundingClientRect(); zoomAt(1.3, r.left + r.width / 2, r.top + r.height / 2); }
    else if (e.key === '-') { const r = map.getBoundingClientRect(); zoomAt(1 / 1.3, r.left + r.width / 2, r.top + r.height / 2); }
    else if (e.key === 'ArrowLeft') { view.x += step; apply(); } else if (e.key === 'ArrowRight') { view.x -= step; apply(); }
    else if (e.key === 'ArrowUp') { view.y += step; apply(); } else if (e.key === 'ArrowDown') { view.y -= step; apply(); }
    else return;
    e.preventDefault();
  });

  /* ---------- แผงรายละเอียด ---------- */
  const show = id => {
    const p = P.find(x => x.id === id); if (!p) return;
    document.querySelectorAll('.gm-pin').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    const st = ST[p.status] || ['', ''];
    panel.innerHTML =
      (p.img ? '<img src="' + root + 'images/' + p.img + '" alt="' + esc(p.name) + '" data-zoom>' : '') +
      '<div class="gm-body"><span class="status ' + st[0] + '">' + esc(st[1]) + '</span>' +
      '<h3>' + esc(p.name) + ' <span class="th">(' + esc(p.th) + ')</span></h3>' +
      '<dl><dt>' + ic('planet') + ' ประเภท</dt><dd>' + esc(p.type) + '</dd>' +
      '<dt>' + ic('flag') + ' ผู้ครอบครอง</dt><dd>' + esc(p.ruler) + '</dd>' +
      '<dt>' + ic('users') + ' ผู้คน / สิ่งมีชีวิต</dt><dd>' + esc(p.life) + '</dd>' +
      '<dt>' + ic('layers') + ' สังคม</dt><dd>' + esc(p.society) + '</dd></dl>' +
      '<h4>' + ic('clock') + ' เหตุการณ์สำคัญ</h4><ul class="gm-events">' + p.events.map(e => '<li><b>' + esc(e[0]) + '</b> ' + esc(e[1]) + '</li>').join('') + '</ul>' +
      '<p class="gm-now"><b>ตอนนี้:</b> ' + esc(p.now) + '</p>' +
      (p.link ? '<a class="btn btn-ghost btn-sm" href="' + p.link + '">' + ic('arrow-right') + ' อ่านเรื่องที่เกี่ยวข้อง</a>' : '') + '</div>';
    panel.classList.add('open');
    if (window.matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#p-' + id); } catch (e) { /* ไม่เป็นไร */ }
  };
  inner.addEventListener('click', e => {
    const b = e.target.closest('.gm-pin'); if (!b || moved) return;
    show(b.dataset.id);
  });
  document.getElementById('gm-list').addEventListener('click', e => {
    const a = e.target.closest('[data-planet]'); if (!a) return;
    e.preventDefault(); show(a.dataset.planet);
    map.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- ค้นหา / กรอง ---------- */
  let st = 'all';
  const input = document.getElementById('gm-search');
  const filter = () => {
    const q = input.value;
    document.querySelectorAll('.gm-pin').forEach(b => { const p = P.find(x => x.id === b.dataset.id); b.classList.toggle('dim', !matches(p, q, st)); });
    document.querySelectorAll('#gm-list li').forEach(li => { const p = P.find(x => x.id === li.firstElementChild.dataset.planet); li.hidden = !matches(p, q, st); });
  };
  input.addEventListener('input', filter);
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const hit = P.find(p => matches(p, input.value, st)); if (hit) show(hit.id);
  });
  document.querySelector('.gm-legend').addEventListener('click', e => {
    const b = e.target.closest('[data-st]'); if (!b) return;
    st = b.dataset.st;
    document.querySelectorAll('.gm-legend [data-st]').forEach(x => x.classList.toggle('chip-gold', x === b));
    filter();
  });

  apply();
  const h = location.hash.match(/^#p-(.+)$/);
  if (h) show(decodeURIComponent(h[1]));
})();
