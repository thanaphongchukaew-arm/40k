/* =========================================================
   Web Animation ทั้งเว็บ (โหลดอัตโนมัติจาก layout.js)
   - ดาว 3 มิติใน Hero (canvas + perspective projection) ขยับตามเมาส์
   - Parallax ภาพ Hero ตามการเลื่อน
   - เปลี่ยนหน้าแบบนุ่มนวล (View Transitions API หรือ fallback)
   - การ์ดโผล่ตามลำดับเมื่อเลื่อนถึง, การ์ดเอียง 3 มิติตามเมาส์
   - ตัวเลขนับขึ้น, ปุ่ม/ไอคอนตอบสนอง
   ทุกอย่างปิดเองเมื่อผู้ใช้ตั้ง "ลดการเคลื่อนไหว" (prefers-reduced-motion)
   ========================================================= */
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const html = document.documentElement;
  html.classList.add('fx-ready');
  if (reduce) { html.classList.add('fx-reduced'); return; }

  /* ---------- 1) ดาว 3 มิติใน Hero ---------- */
  function starfield(host) {
    const cv = document.createElement('canvas');
    cv.className = 'fx-stars'; cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, stars = [], run = false, raf = 0, mx = 0, my = 0, tx = 0, ty = 0, last = 0;
    const COLORS = ['255,255,255', '255,230,170', '190,210,255', '255,190,150'];
    function size() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const n = Math.min(260, Math.round(w * h / 5200));
      stars = Array.from({ length: n }, () => spawn(true));
    }
    function spawn(any) {
      return { x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: any ? Math.random() : 1, c: COLORS[Math.random() < .75 ? 0 : 1 + Math.floor(Math.random() * 3)], s: Math.random() * .8 + .4 };
    }
    function frame(t) {
      if (!run) return;
      const dt = Math.min(50, t - (last || t)); last = t;
      tx += (mx - tx) * .05; ty += (my - ty) * .05;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + tx * 40, cy = h / 2 + ty * 30, f = Math.max(w, h) * .55;
      for (const s of stars) {
        const pz = s.z;
        s.z -= dt * .00005 * (1 + s.s);          /* ดาวพุ่งเข้าหาผู้ชมช้า ๆ */
        if (s.z <= .02) { Object.assign(s, spawn(false)); continue; }
        const sx = cx + s.x / s.z * f * .5, sy = cy + s.y / s.z * f * .5;
        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) { Object.assign(s, spawn(false)); continue; }
        const px = cx + s.x / pz * f * .5, py = cy + s.y / pz * f * .5;
        const a = Math.min(1, (1 - s.z) * 1.4), r = (1 - s.z) * 1.8 * s.s + .2;
        ctx.strokeStyle = 'rgba(' + s.c + ',' + (a * .55).toFixed(3) + ')';
        ctx.lineWidth = r; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!run && !document.hidden) { run = true; last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { run = false; cancelAnimationFrame(raf); };
    size();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
    host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; });
    host.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop())).observe(host);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }
  document.querySelectorAll('.hero, .page-hero').forEach(starfield);

  /* ---------- 2) Parallax ภาพ Hero ---------- */
  const heroImgs = [...document.querySelectorAll('.hero-bg img')];
  if (heroImgs.length) {
    let ticking = false;
    const par = () => {
      ticking = false;
      const y = scrollY;
      heroImgs.forEach(img => { if (y < innerHeight * 1.2) img.style.setProperty('--fx-par', (y * .25).toFixed(1) + 'px'); });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* ---------- 3) เปลี่ยนหน้า: View Transitions ถ้ารองรับ ไม่งั้นค่อย ๆ จางออก ---------- */
  const vtSupported = 'onpagereveal' in window || (CSS && CSS.supports && CSS.supports('view-transition-name: none') && 'PageRevealEvent' in window);
  if (!vtSupported) {
    html.classList.add('fx-page-in');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.closest('[data-no-fx]')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;   /* ลิงก์ในหน้าเดียวกัน */
      e.preventDefault();
      html.classList.add('fx-leave');
      setTimeout(() => { location.href = a.href; }, 170);
    });
    addEventListener('pageshow', ev => { if (ev.persisted) html.classList.remove('fx-leave'); });
  }

  /* ---------- 4) การ์ดโผล่ตามลำดับเมื่อเลื่อนถึง ---------- */
  const GROUPS = '.grid, .gear-grid, .abil-grid, .char-grid, .rel-tops, .faction-grid, .pm-grid, .gallery, .facts, .steps, .era-grid';
  const staggerIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('fx-in'); staggerIO.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  function prepStagger(root) {
    (root || document).querySelectorAll(GROUPS).forEach(g => {
      if (g.dataset.fxStagger || g.closest('.tt, .ab, .modal, .dropdown')) return;
      const kids = [...g.children].filter(k => !k.classList.contains('reveal'));
      if (kids.length < 2 || kids.length > 80) return;
      g.dataset.fxStagger = '1';
      kids.forEach((k, i) => { k.classList.add('fx-item'); k.style.setProperty('--fx-i', Math.min(i, 12)); });
      const r = g.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => g.classList.add('fx-in'));
      else staggerIO.observe(g);
    });
  }
  prepStagger();

  /* ---------- 5) ตัวเลขนับขึ้น ---------- */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, m = el.textContent.trim().match(/^([\d,]+)(.*)$/);
    if (!m) return;
    const end = +m[1].replace(/,/g, ''), suf = m[2], comma = m[1].indexOf(',') > -1, dur = 1100, t0 = performance.now();
    if (!end || end > 1e6) return;
    const fmt = v => (comma ? v.toLocaleString('en-US') : String(v)) + suf;
    const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = fmt(v); if (k < 1) requestAnimationFrame(step); };
    el.textContent = fmt(0); requestAnimationFrame(step);
  }), { threshold: .6 });
  document.querySelectorAll('.hero-stats b, .fact b, .stat b, .stat-num').forEach(el => { if (/^[\d,]+\D{0,3}$/.test(el.textContent.trim())) countIO.observe(el); });

  /* ---------- 6) การ์ดเอียง 3 มิติตามเมาส์ ---------- */
  if (finePointer) {
    const TILT = '.card, .faction-card, .gear, .rel-top, .pcard, .abil.race, .char-card';
    let cur = null, rq = 0, px = 0, py = 0;
    const apply = () => {
      rq = 0; if (!cur) return;
      const r = cur.getBoundingClientRect(), x = (px - r.left) / r.width - .5, y = (py - r.top) / r.height - .5;
      cur.style.setProperty('--fx-rx', (-y * 6).toFixed(2) + 'deg');
      cur.style.setProperty('--fx-ry', (x * 7).toFixed(2) + 'deg');
      cur.style.setProperty('--fx-gx', ((x + .5) * 100).toFixed(1) + '%');
      cur.style.setProperty('--fx-gy', ((y + .5) * 100).toFixed(1) + '%');
    };
    document.addEventListener('pointermove', e => {
      const c = e.target.closest(TILT);
      if (c !== cur) {
        if (cur) { cur.classList.remove('fx-tilting'); ['--fx-rx', '--fx-ry'].forEach(p => cur.style.removeProperty(p)); }
        cur = c && !c.closest('.tt, .ab, table, .modal') ? c : null;
        if (cur) cur.classList.add('fx-tilting');
      }
      if (cur) { px = e.clientX; py = e.clientY; if (!rq) rq = requestAnimationFrame(apply); }
    }, { passive: true });
  }

  /* ---------- 7) Micro-interaction: คลื่นกดปุ่ม + หมุนไอคอนธีม ---------- */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.tab, .search-btn');   /* .btn มีคลื่นจาก main.js อยู่แล้ว */
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'fx-ripple';
    s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-theme-set], [data-fs-step]');
    if (!t) return;
    t.classList.remove('fx-spin'); void t.offsetWidth; t.classList.add('fx-spin');
  });

  /* เนื้อหาที่สร้างทีหลังด้วย JS (เช่น รายการทัพ ผลค้นหา) ก็ได้เอฟเฟกต์โผล่ด้วย */
  if ('MutationObserver' in window) {
    let mt;
    new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(() => prepStagger(), 200); })
      .observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  }
})();
