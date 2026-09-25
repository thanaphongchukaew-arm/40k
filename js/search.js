/* =========================================================
   ค้นหาทั้งเว็บ — เปิดด้วยปุ่มแว่นขยาย, กด "/" หรือ Ctrl/⌘ + K
   ดัชนี (js/search-index.js) โหลดเฉพาะตอนเปิดครั้งแรก เพื่อไม่ให้หน้าเว็บช้า
   ========================================================= */
(function () {
  const hasDOM = typeof document !== 'undefined' && !!document.body;
  const root = hasDOM ? (document.body.dataset.root || '') : '';
  const V = hasDOM ? ((document.querySelector('script[src*="layout.js"]') || { src: '' }).src.split('?')[1] || '') : '';
  const ic = n => window.icon ? window.icon(n) : '';

  /* ---------- ตัวค้นหา (ใช้ร่วมกับการทดสอบใน node ได้) ---------- */
  const norm = s => (s || '').normalize('NFC').toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'").replace(/[“”]/g, '"')
    .replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();

  /* คำย่อที่คนนิยมพิมพ์ แต่ในเนื้อหาเขียนเต็ม: Mk VII → Mark VII */
  const qnorm = s => norm(s).replace(/(^|\s)mk\.?(?=\s|[ivx\d]|$)\s*/g, '$1mark ').trim();

  function search(index, query, limit) {
    const q = qnorm(query);
    if (!q) return [];
    const tokens = q.split(' ').filter(Boolean);
    const out = [];
    for (let i = 0; i < index.length; i++) {
      const e = index[i];
      const title = e._t || (e._t = norm(e[1]));
      const pageT = e._p || (e._p = norm(e[2]));
      const body = e._b || (e._b = norm(e[4]));
      const all = title + ' ' + pageT + ' ' + body;
      let ok = true;
      for (const t of tokens) if (all.indexOf(t) === -1) { ok = false; break; }
      if (!ok) continue;
      let score = 0;
      if (title === q) score += 200;
      else if (title.startsWith(q)) score += 120;
      else if (title.indexOf(q) > -1) score += 80;
      for (const t of tokens) {
        if (title.indexOf(t) > -1) score += 25;
        if (pageT.indexOf(t) > -1) score += 6;
        let n = 0, p = body.indexOf(t);
        while (p > -1 && n < 5) { n++; p = body.indexOf(t, p + t.length); }
        score += n;
      }
      if (e[0].indexOf('#') === -1 && e[0].indexOf('?') === -1) score += 8; // ทั้งหน้า
      if (e[3] === 'ศัพท์' || e[3] === 'ทัพ') score += 4;
      if (e[3] === 'ตัวละคร' && title.indexOf(q) > -1) score += 60; // ชื่อตัวละครตรง ให้ขึ้นก่อน
      out.push({ e, score });
    }
    out.sort((a, b) => b.score - a.score || a.e[1].length - b.e[1].length);
    return out.slice(0, limit || 40).map(r => r.e);
  }

  function snippet(text, query) {
    const t = text || '', tokens = qnorm(query).split(' ').filter(Boolean);
    const low = norm(t);
    let at = -1;
    for (const k of tokens) { at = low.indexOf(k); if (at > -1) break; }
    let s = at > 70 ? '…' + t.slice(at - 60, at + 110) : t.slice(0, 170);
    if (t.length > (at > 70 ? at + 110 : 170)) s += '…';
    return s;
  }

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function mark(text, query) {
    let h = esc(text);
    qnorm(query).split(' ').filter(Boolean).sort((a, b) => b.length - a.length).forEach(t => {
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      h = h.replace(re, m => '<mark>' + m + '</mark>');
    });
    return h;
  }

  window.SiteSearch = { norm, search, snippet };
  if (!hasDOM) return;

  /* ---------- UI ---------- */
  const box = document.createElement('div');
  box.className = 'search-modal';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'ค้นหาทั้งเว็บ');
  box.innerHTML =
    '<div class="search-panel">' +
      '<div class="search-bar">' + ic('search') +
        '<input type="search" id="site-search-input" placeholder="ค้นหา ศัพท์ ทัพ ตัวละคร กติกา… เช่น Dante, Horus, Stratagem" autocomplete="off" aria-label="คำค้นหา" aria-controls="site-search-results">' +
        '<button type="button" class="search-close" aria-label="ปิดการค้นหา">Esc</button></div>' +
      '<div class="search-filters" role="group" aria-label="กรองผลการค้นหา"></div>' +
      '<ol class="search-results" id="site-search-results" role="listbox"></ol>' +
      '<div class="search-foot"><span>' + ic('info') + ' พิมพ์ได้ทั้งภาษาไทยและอังกฤษ · ↑↓ เลือก · Enter เปิด</span><span class="search-count"></span></div>' +
    '</div>';
  document.body.appendChild(box);
  const input = box.querySelector('input');
  const list = box.querySelector('.search-results');
  const filters = box.querySelector('.search-filters');
  const count = box.querySelector('.search-count');
  const CATS = ['ทั้งหมด', 'โลกของ 40K', 'เนื้อเรื่องทัพ', 'ตัวละคร', 'ทัพ', 'ศัพท์', 'กติกา & การเล่น', 'เครื่องมือ'];
  let cat = 'ทั้งหมด', sel = 0, results = [], loading = null;

  filters.innerHTML = CATS.map(c => '<button type="button" class="chip' + (c === cat ? ' chip-gold' : '') + '" data-cat="' + c + '">' + c + '</button>').join('');

  const loadIndex = () => loading || (loading = new Promise((res, rej) => {
    if (window.SEARCH_INDEX) return res();
    const s = document.createElement('script');
    s.src = root + 'js/search-index.js' + (V ? '?' + V : '');
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  }));

  function render() {
    const q = input.value;
    if (!window.SEARCH_INDEX) { list.innerHTML = '<li class="search-empty loading">กำลังโหลดดัชนี…</li>'; return; }
    if (!norm(q)) { list.innerHTML = '<li class="search-empty">เริ่มพิมพ์เพื่อค้นหาจากทั้ง ' + window.SEARCH_INDEX.length + ' หัวข้อในเว็บ</li>'; count.textContent = ''; return; }
    let r = search(window.SEARCH_INDEX, q, 400);
    if (cat !== 'ทั้งหมด') r = r.filter(e => e[3] === cat);
    results = r.slice(0, 60);
    count.textContent = 'พบ ' + r.length + ' รายการ' + (r.length > 60 ? ' (แสดง 60)' : '');
    sel = 0;
    if (!results.length) { list.innerHTML = '<li class="search-empty">ไม่พบ "' + esc(q) + '" — ลองคำอื่น หรือพิมพ์เป็นภาษาอังกฤษ</li>'; return; }
    list.innerHTML = results.map((e, i) =>
      '<li role="option" aria-selected="' + (i === 0) + '"><a href="' + root + e[0] + '">' +
        '<span class="sr-top"><span class="chip">' + esc(e[3]) + '</span><span class="sr-page">' + esc(e[2]) + '</span></span>' +
        '<b>' + mark(e[1], q) + '</b>' +
        '<small>' + mark(snippet(e[4], q), q) + '</small></a></li>').join('');
  }
  const move = d => {
    const items = list.querySelectorAll('li[role=option]');
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    items.forEach((li, i) => li.setAttribute('aria-selected', i === sel));
    items[sel].scrollIntoView({ block: 'nearest' });
  };
  const open = () => {
    box.classList.add('open'); document.body.classList.add('search-open');
    setTimeout(() => input.focus(), 30);
    loadIndex().then(render, () => { list.innerHTML = '<li class="search-empty">โหลดดัชนีค้นหาไม่สำเร็จ</li>'; });
    render();
  };
  const close = () => { box.classList.remove('open'); document.body.classList.remove('search-open'); };
  window.SiteSearch.open = open; window.SiteSearch.close = close;

  input.addEventListener('input', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const a = list.querySelectorAll('li[role=option] a')[sel];
      if (a) { e.preventDefault(); close(); location.href = a.href; }
    }
  });
  filters.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    cat = b.dataset.cat;
    filters.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('chip-gold', x === b));
    render(); input.focus();
  });
  list.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  box.addEventListener('click', e => { if (e.target === box || e.target.closest('.search-close')) close(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-open-search]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || (document.activeElement || {}).isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && box.classList.contains('open')) close();
  });
})();
