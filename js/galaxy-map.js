/* =========================================================
   แผนที่กาแล็กซีแบบกดได้: วาดกาแล็กซีด้วย SVG, ซูม/เลื่อน, กดดาวเพื่อดูรายละเอียด
   ข้อมูลมาจาก window.PLANETS (js/planets-data.js สร้างจาก Warhammer 40k Wiki)
   ดาวเรียงตามความสำคัญ (บทความยาว/บทบาทในเนื้อเรื่อง) — ดาวที่มีแค่ชื่อจะแสดงสถานะ "ไม่ทราบ"
   ========================================================= */
(function () {
  const W = 1400, H = 1120, PAGE = 48;
  const root = document.body ? (document.body.dataset.root || '../') : '../';
  const P = (typeof window !== 'undefined' && window.PLANETS) || [];
  const ST = {
    stable: ['st-alive', 'มั่นคง (จักรวรรดิ)'], war: ['st-daemon', 'กำลังมีสงคราม'], retaken: ['st-alive', 'ยึดคืนได้แล้ว'],
    destroyed: ['st-dead', 'ถูกทำลาย / ไร้ชีวิต'], chaos: ['st-daemon', 'ดินแดน Chaos'], xenos: ['st-missing', 'ดินแดนเผ่าต่างดาว'], unknown: ['st-erased', 'ไม่ทราบ']
  };
  const SEG = { Solar: 'Segmentum Solar', Obscurus: 'Segmentum Obscurus', Ultima: 'Ultima Segmentum', Tempestus: 'Segmentum Tempestus', Pacificus: 'Segmentum Pacificus' };
  const REG = [['SEGMENTUM OBSCURUS', 420, 140], ['SEGMENTUM SOLAR', 275, 525], ['ULTIMA SEGMENTUM', 1045, 400], ['SEGMENTUM TEMPESTUS', 385, 950], ['SEGMENTUM PACIFICUS', 150, 640], ['IMPERIUM NIHILUS', 1080, 200], ['CICATRIX MALEDICTUM · GREAT RIFT', 660, 470]];
  const norm = s => (s || '').normalize('NFC').toLowerCase().replace(/[‘’]/g, "'").trim();

  /* ฟังก์ชันล้วน (ทดสอบใน node ได้) */
  const matches = (p, q, st, seg, lore) => (st === 'all' || p.st === st) && (!seg || seg === 'all' || p.seg === seg) && (!lore || lore === 'all' || (lore === 'lore' ? p.lore : !p.lore)) &&
    (!norm(q) || norm([p.name, p.th, p.type, p.aff, p.sector, p.system, p.sum].join(' ')).indexOf(norm(q)) > -1);
  const ZMIN = .6, ZMAX = 30;
  const clampView = v => {
    v.s = Math.min(ZMAX, Math.max(ZMIN, v.s));
    if (v.s < 1) { v.x = v.y = (1 - v.s) * 50; return v; } /* ซูมออกเกินขนาดจริง: จัดไว้กลางกรอบ */
    v.x = Math.min(0, Math.max(-(v.s - 1) * 100, v.x)); v.y = Math.min(0, Math.max(-(v.s - 1) * 100, v.y));
    return v;
  };
  /* ภาพดาววาดเอง (สำหรับดาวที่ไม่มีภาพ) — สีตามประเภทดาว ไม่ได้อ้างว่าเป็นภาพจริง */
  function artStyle(p) {
    const t = (p.type + ' ' + p.name).toLowerCase();
    let h = 0; for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const pick = [[/ice|น้ำแข็ง/, '#e6f4ff', '#6f9fcc'], [/desert|ทะเลทราย/, '#f0c98a', '#8a5a2a'], [/jungle|ป่า|arboreal/, '#7ccf6e', '#1d4a24'], [/ocean|มหาสมุทร/, '#6fb4ff', '#123a6a'],
      [/daemon|hell-forge|ปีศาจ|chaos/, '#e07aff', '#3a0a4a'], [/dead|ไร้ชีวิต|ร้าง/, '#b8b8b8', '#2a2a2e'], [/forge|industrial|hive|โรงงาน|อุตสาหกรรม|หอคอย/, '#e08a5a', '#3a2020'],
      [/death|มรณะ/, '#9ad16a', '#3a1a10'], [/gas giant|แก๊ส/, '#f3d7a0', '#8a5a3a'], [/tomb|necron/, '#8affc0', '#0a2a1a'], [/sept|t'au/, '#ffd07a', '#6a3a10']];
    let c = null; for (const k of pick) if (k[0].test(t)) { c = k; break; }
    const hue = h % 360, c1 = c ? c[1] : 'hsl(' + hue + ',55%,70%)', c2 = c ? c[2] : 'hsl(' + ((hue + 40) % 360) + ',50%,18%)';
    const band = /gas giant|แก๊ส/.test(t) ? ',repeating-linear-gradient(' + (h % 40 - 20) + 'deg,transparent 0 9%,rgba(0,0,0,.18) 9% 14%)' : '';
    return 'background:radial-gradient(circle at 32% 30%,' + c1 + ' 0%,' + c2 + ' 72%,#000 100%)' + band + ';';
  }
  if (typeof window !== 'undefined') window.GalaxyMap = { matches, clampView, artStyle };
  if (typeof document === 'undefined' || !document.getElementById('gmap')) return;

  const map = document.getElementById('gmap'), inner = document.getElementById('gmap-inner');
  const panel = document.getElementById('gm-panel'), list = document.getElementById('gm-list');
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byId = {}; P.forEach(p => { byId[p.id] = p; });
  const pic = (p, cls) => p.img ? '<img class="' + cls + '" src="' + root + 'images/' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span class="' + cls + ' gm-art" style="' + artStyle(p) + '" title="ภาพวาดประกอบ (ไม่มีภาพจากวิกิ)"></span>';

  /* ---------- วาดกาแล็กซี ---------- */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  let stars = '';
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() < .92 ? rnd() * 1.2 + .3 : rnd() * 2 + 1.2;
    stars += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="#fff" opacity="' + (rnd() * .6 + .25).toFixed(2) + '"/>';
  }
  let arms = '';
  for (let a = 0; a < 4; a++) for (let i = 0; i < 90; i++) {
    const t = i / 90, ang = a * Math.PI / 2 + t * 5.2, rad = 40 + t * 520;
    const x = 740 + Math.cos(ang) * rad * 1.15 + (rnd() - .5) * 60, y = 560 + Math.sin(ang) * rad * .72 + (rnd() - .5) * 50;
    arms += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (rnd() * 26 + 10).toFixed(0) + '" fill="url(#armGlow)" opacity="' + (0.5 - t * .35).toFixed(2) + '"/>';
  }
  const rift = 'M150,330 C260,380 360,410 470,430 C560,448 640,470 720,520 C800,570 880,610 960,640 C1040,670 1090,720 1120,800 C1140,850 1180,880 1220,900';
  const svg = '<svg class="gm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
    '<defs><radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7e0" stop-opacity=".95"/><stop offset=".25" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset=".6" stop-color="#8a6cc0" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="armGlow"><stop offset="0" stop-color="#cfc2ff" stop-opacity=".55"/><stop offset="1" stop-color="#6a58a8" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="eye"><stop offset="0" stop-color="#ff4d8a" stop-opacity=".9"/><stop offset=".5" stop-color="#9b2d7a" stop-opacity=".45"/><stop offset="1" stop-color="#3a0d3a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mael"><stop offset="0" stop-color="#ff7a4d" stop-opacity=".7"/><stop offset="1" stop-color="#5a1d0d" stop-opacity="0"/></radialGradient>' +
    '<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="#05060b"/>' + '<g class="gm-stars">' + stars + '</g><g filter="url(#blur8)">' + arms + '</g>' +
    '<ellipse cx="740" cy="560" rx="300" ry="210" fill="url(#core)"/>' +
    '<circle cx="205" cy="318" r="120" fill="url(#eye)" filter="url(#blur3)"/><circle cx="675" cy="628" r="70" fill="url(#mael)" filter="url(#blur3)"/>' +
    '<path d="' + rift + '" stroke="#5ff2c9" stroke-width="42" fill="none" opacity=".18" filter="url(#blur8)"/>' +
    '<path d="' + rift + '" stroke="#8effe0" stroke-width="10" fill="none" opacity=".45" filter="url(#blur3)" stroke-dasharray="2 14" stroke-linecap="round"/>' +
    '<circle cx="323" cy="598" r="160" fill="none" stroke="#d0a84f" stroke-opacity=".25" stroke-dasharray="4 8"/>' +
    REG.map(r => '<text x="' + r[1] + '" y="' + r[2] + '" class="gm-region" text-anchor="middle">' + esc(r[0]) + '</text>').join('') + '</svg>';
  const placed = P.filter(p => p.x != null);
  inner.innerHTML = svg + placed.map(p =>
    '<button type="button" class="gm-pin st-' + p.st + (p.rank <= 30 ? ' major' : p.rank <= 120 ? ' mid' : ' minor') + (p.region ? ' region' : '') + '" data-id="' + p.id + '" style="left:' + (p.x / W * 100) + '%;top:' + (p.y / H * 100) + '%" aria-label="' + esc(p.name) + '">' +
      '<i></i><span>' + esc(p.name) + '</span></button>').join('');

  /* ---------- ซูม / เลื่อน ---------- */
  const view = { s: 1, x: 0, y: 0 };
  const apply = () => { clampView(view); inner.style.transform = 'translate(' + view.x + '%,' + view.y + '%) scale(' + view.s + ')'; map.style.setProperty('--z', view.s); map.classList.toggle('zoomed', view.s >= 1.6); map.classList.toggle('zoomed2', view.s >= 2.6); map.classList.toggle('zoomed3', view.s >= 7);
    zl.textContent = (view.s < 10 ? view.s.toFixed(1) : Math.round(view.s)) + '×'; };
  const zl = document.createElement('span'); zl.className = 'gm-zlevel'; zl.setAttribute('aria-live', 'polite');
  map.querySelector('.gm-zoom').prepend(zl);
  const zoomAt = (factor, cx, cy) => {
    const r = map.getBoundingClientRect();
    const px = (cx - r.left) / r.width * 100, py = (cy - r.top) / r.height * 100;
    const ns = Math.min(ZMAX, Math.max(ZMIN, view.s * factor)), k = ns / view.s;
    view.x = px - (px - view.x) * k; view.y = py - (py - view.y) * k; view.s = ns; apply();
  };
  map.addEventListener('wheel', e => { e.preventDefault(); zoomAt(Math.pow(1.0025, -Math.max(-240, Math.min(240, e.deltaY))), e.clientX, e.clientY); }, { passive: false });
  map.addEventListener('dblclick', e => { if (e.target.closest('.gm-zoom,.gm-pin')) return; zoomAt(e.shiftKey ? 1 / 2.5 : 2.5, e.clientX, e.clientY); });
  let drag = null, moved = false;
  map.addEventListener('pointerdown', e => { if (e.target.closest('.gm-zoom')) return; drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; moved = false; });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const r = map.getBoundingClientRect(), dx = (e.clientX - drag.x) / r.width * 100, dy = (e.clientY - drag.y) / r.height * 100;
    if (Math.abs(dx) + Math.abs(dy) > .6) moved = true;
    if (moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; apply(); map.classList.add('dragging'); }
  });
  window.addEventListener('pointerup', () => { drag = null; map.classList.remove('dragging'); });
  map.querySelector('.gm-zoom').addEventListener('click', e => {
    const b = e.target.closest('[data-z]'); if (!b) return;
    const r = map.getBoundingClientRect();
    if (b.dataset.z === '0') { view.s = 1; view.x = 0; view.y = 0; apply(); }
    else zoomAt(b.dataset.z === '1' ? 1.8 : 1 / 1.8, r.left + r.width / 2, r.top + r.height / 2);
  });
  map.addEventListener('keydown', e => {
    const r = map.getBoundingClientRect(), step = 6;
    if (e.key === '+' || e.key === '=') zoomAt(1.6, r.left + r.width / 2, r.top + r.height / 2);
    else if (e.key === '-') zoomAt(1 / 1.6, r.left + r.width / 2, r.top + r.height / 2);
    else if (e.key === 'ArrowLeft') { view.x += step; apply(); } else if (e.key === 'ArrowRight') { view.x -= step; apply(); }
    else if (e.key === 'ArrowUp') { view.y += step; apply(); } else if (e.key === 'ArrowDown') { view.y -= step; apply(); }
    else return;
    e.preventDefault();
  });
  /* เลื่อนแผนที่ไปที่ดาว */
  const focusPin = p => {
    if (p.x == null) return;
    if (view.s < 2) view.s = 2.2;
    view.x = 50 - p.x / W * 100 * view.s; view.y = 50 - p.y / H * 100 * view.s; apply();
  };

  /* ---------- แผงรายละเอียด ---------- */
  const row = (icn, label, v) => v ? '<dt>' + ic(icn) + ' ' + label + '</dt><dd>' + esc(v) + '</dd>' : '';
  const show = (id, pan) => {
    const p = byId[id]; if (!p) return;
    document.querySelectorAll('.gm-pin').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    const st = ST[p.st] || ST.unknown;
    panel.innerHTML =
      (p.img ? '<figure class="gm-fig"><img src="' + root + 'images/' + p.img + '" alt="' + esc(p.name) + '" data-zoom><figcaption>' + esc(p.cap || 'ภาพประกอบ') + ' · ที่มา: Warhammer 40k Wiki</figcaption></figure>'
             : '<div class="gm-fig gm-noimg"><span class="gm-art gm-art-lg" style="' + artStyle(p) + '"></span><small>ภาพวาดประกอบ — ไม่มีภาพของดาวนี้ในแหล่งข้อมูล</small></div>') +
      '<div class="gm-body"><div class="gm-tags"><span class="status ' + st[0] + '">' + esc(st[1]) + '</span>' + (p.region ? '<span class="chip">ภูมิภาค</span>' : '') + '<span class="chip">อันดับ ' + p.rank + '</span></div>' +
      '<h3>' + esc(p.name) + (p.th ? ' <span class="th">(' + esc(p.th) + ')</span>' : '') + '</h3>' +
      (p.sum ? '<p class="gm-sum">' + esc(p.sum) + '</p>' : '') +
      '<dl>' + row('planet', 'ประเภท', p.type) + row('compass', 'ที่ตั้ง', [SEG[p.seg] || '', p.sector, p.system].filter(Boolean).join(' · ')) +
        row('flag', 'สังกัด / ผู้ครอบครอง', p.aff) + row('crown', 'ผู้ปกครอง', p.gov) + row('users', 'ประชากร', p.pop) + row('scroll', 'Tithe Grade (ภาษี)', p.tithe) + row('globe', 'สภาพอากาศ', p.climate) + '</dl>' +
      (p.life ? '<h4>' + ic('users') + ' ผู้คนและสิ่งมีชีวิต</h4><p>' + esc(p.life) + '</p>' : '') +
      (p.ev && p.ev.length ? '<h4>' + ic('clock') + ' เหตุการณ์สำคัญ</h4><ol class="gm-events">' + p.ev.map(e => '<li><b>' + esc(e[0]) + '</b> ' + esc(e[1]) + '</li>').join('') + '</ol>' : '') +
      (p.now ? '<p class="gm-now"><b>สถานะตอนนี้:</b> ' + esc(p.now) + '</p>' : '') +
      (p.fact ? '<p class="gm-fact">' + ic('star') + ' ' + esc(p.fact) + '</p>' : '') +
      (!p.lore ? '<p class="gm-now"><b>ข้อมูลที่มี:</b> ดาวนี้ถูกกล่าวถึงในเนื้อเรื่องแต่ยังไม่มีรายละเอียดมากพอ สถานะจึงเป็น "ไม่ทราบ"' + (p.men && p.men.length ? ' — พบชื่อในบทความ: ' + p.men.map(m => '<a href="' + esc(m.u) + '" target="_blank" rel="noopener">' + esc(m.t) + '</a>').join(', ') : '') + '</p>' : '') +
      (p.x == null ? '<p class="muted gm-small">' + ic('info') + ' ไม่มีข้อมูลตำแหน่งที่ชัดเจน จึงไม่ได้ปักบนแผนที่</p>' : '<p class="muted gm-small">' + ic('info') + ' ตำแหน่งบนแผนที่เป็นตำแหน่งโดยประมาณตาม Segmentum/Sector</p>') +
      (p.src ? '<a class="btn btn-ghost btn-sm" href="' + esc(p.src) + '" target="_blank" rel="noopener">' + ic('external') + ' อ่านต้นฉบับ (อังกฤษ)</a>' : '') + '</div>';
    panel.classList.add('open'); panel.scrollTop = 0;
    if (pan) focusPin(p);
    if (window.matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#p-' + id); } catch (e) { /* ไม่เป็นไร */ }
  };
  inner.addEventListener('click', e => { const b = e.target.closest('.gm-pin'); if (!b || moved) return; show(b.dataset.id); });

  /* ---------- รายชื่อ (ทุกดวงอยู่ใน DOM เพื่อการค้นหา แสดงทีละหน้า) ---------- */
  list.innerHTML = P.map(p => {
    const st = ST[p.st] || ST.unknown;
    const desc = p.sum || (p.men && p.men.length ? 'ถูกกล่าวถึงในเรื่องของ ' + p.men.map(m => m.t).join(', ') : 'ถูกกล่าวถึงในเนื้อเรื่อง');
    return '<li id="p-' + p.id + '" data-id="' + p.id + '"><button type="button" class="gm-item" data-planet="' + p.id + '">' + pic(p, 'gm-thumb') +
      '<span class="gm-item-body"><span class="gm-rank">#' + p.rank + '</span><h3>' + esc(p.name) + (p.th ? ' <span class="th">' + esc(p.th) + '</span>' : '') + '</h3>' +
      '<span class="status ' + st[0] + '">' + esc(st[1]) + '</span>' + (p.type ? '<small>' + esc(p.type.split(' · ')[0]) + '</small>' : '') +
      '<p>' + esc(desc.length > 150 ? desc.slice(0, 148) + '…' : desc) + '</p></span></button></li>';
  }).join('');
  const items = [...list.children];
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-planet]'); if (!b) return;
    show(b.dataset.planet, true); map.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- ค้นหา / กรอง / แบ่งหน้า ---------- */
  let st = 'all', seg = 'all', lore = 'all', shown = PAGE;
  const input = document.getElementById('gm-search'), more = document.getElementById('gm-more'), count = document.getElementById('gm-count'), all = document.getElementById('gm-all');
  const counts = {}; P.forEach(p => { counts[p.st] = (counts[p.st] || 0) + 1; });
  document.querySelectorAll('.gm-legend [data-st]').forEach(b => { const n = b.dataset.st === 'all' ? P.length : (counts[b.dataset.st] || 0); b.insertAdjacentHTML('beforeend', ' <em>' + n + '</em>'); });
  const filter = () => {
    const q = input.value, hit = new Set();
    P.forEach(p => { if (matches(p, q, st, seg, lore)) hit.add(p.id); });
    inner.querySelectorAll('.gm-pin').forEach(b => b.classList.toggle('dim', !hit.has(b.dataset.id)));
    let n = 0;
    items.forEach(li => { const ok = hit.has(li.dataset.id); li.hidden = !ok || n >= shown; if (ok) n++; });
    count.textContent = 'พบ ' + hit.size.toLocaleString() + ' จาก ' + P.length.toLocaleString() + ' ดวง';
    more.hidden = all.hidden = hit.size <= shown;
    all.textContent = 'แสดงทั้งหมด (' + hit.size + ' ดวง)';
    more.textContent = 'แสดงเพิ่มอีก ' + Math.min(PAGE, hit.size - shown) + ' ดวง (เหลือ ' + (hit.size - shown) + ')';
  };
  const reset = () => { shown = PAGE; filter(); };
  input.addEventListener('input', reset);
  input.addEventListener('keydown', e => { if (e.key !== 'Enter') return; const h = P.find(p => matches(p, input.value, st, seg, lore)); if (h) show(h.id, true); });
  document.querySelector('.gm-legend').addEventListener('click', e => {
    const b = e.target.closest('[data-st]'); if (!b) return;
    st = b.dataset.st; document.querySelectorAll('.gm-legend [data-st]').forEach(x => x.classList.toggle('chip-gold', x === b)); reset();
  });
  document.getElementById('gm-seg').addEventListener('change', e => { seg = e.target.value; reset(); });
  document.getElementById('gm-lore').addEventListener('change', e => { lore = e.target.value; reset(); });
  more.addEventListener('click', () => { shown += PAGE; filter(); });
  all.addEventListener('click', () => { shown = Infinity; filter(); });

  apply(); filter();
  /* เปิดดาวจากลิงก์ #p-ชื่อดาว (เช่นจากการค้นหาทั้งเว็บ) */
  const fromHash = () => {
    const h = location.hash.match(/^#p-(.+)$/); if (!h) return;
    const id = decodeURIComponent(h[1]); if (!byId[id]) return;
    const idx = P.findIndex(p => p.id === id); if (idx >= shown) { shown = Math.ceil((idx + 1) / PAGE) * PAGE; filter(); }
    show(id, true);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
