/* =========================================================
   พฤติกรรมทั่วไปของทุกหน้า
   - Animation ตอนเลื่อน, Lightbox ขยายรูป, Tabs, Phase stepper
   - บันทึกว่า "อ่านแล้ว" (localStorage — ถ้าใช้ไม่ได้ก็ข้าม)
   ========================================================= */
(function () {
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ไม่เป็นไร */ } }
  };
  window.siteStore = store;

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  /* ---------- Lightbox + เลื่อนดูรูปถัดไป ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'ภาพขยาย');
  lb.innerHTML = '<span class="lb-count"></span><button class="lb-close" aria-label="ปิด">' + window.icon('x') + '</button>' +
    '<button class="lb-nav lb-prev" aria-label="รูปก่อนหน้า">' + window.icon('arrow-left') + '</button><img alt=""><p></p>' +
    '<button class="lb-nav lb-next" aria-label="รูปถัดไป">' + window.icon('arrow-right') + '</button>';
  document.body.appendChild(lb);
  const ZOOM = '.figure img, [data-zoom]';
  let list = [], at = 0;
  const capOf = img => {
    const fig = img.closest('figure');
    const cap = fig && fig.querySelector('figcaption');
    return cap ? cap.textContent : img.alt;
  };
  const show = i => {
    at = (i + list.length) % list.length;
    const img = list[at];
    const big = lb.querySelector('img');
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    big.style.animation = 'none'; void big.offsetWidth; big.style.animation = '';
    lb.querySelector('p').textContent = capOf(img);
    lb.querySelector('.lb-count').textContent = list.length > 1 ? (at + 1) + ' / ' + list.length : '';
    lb.querySelectorAll('.lb-nav').forEach(b => { b.hidden = list.length < 2; });
  };
  const closeLb = () => lb.classList.remove('open');
  document.addEventListener('click', e => {
    const img = e.target.closest(ZOOM);
    if (!img || lb.contains(img)) return;
    list = [...document.querySelectorAll(ZOOM)].filter(x => x.offsetParent !== null && !lb.contains(x));
    show(Math.max(0, list.indexOf(img)));
    lb.classList.add('open');
  });
  lb.addEventListener('click', e => {
    if (e.target.closest('.lb-prev')) return show(at - 1);
    if (e.target.closest('.lb-next')) return show(at + 1);
    if (e.target.tagName !== 'IMG') closeLb();
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
  });

  /* ---------- Tabs: <div data-tabs> .tab[data-tab=x] + [data-panel=x] ---------- */
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = group.querySelectorAll('.tab');
    const panels = group.querySelectorAll('[data-panel]');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.toggle('active', x === t));
      panels.forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));
  });

  /* ---------- Phase stepper ---------- */
  document.querySelectorAll('[data-phases]').forEach(wrap => {
    const btns = wrap.querySelectorAll('.phase-btn');
    const panels = wrap.querySelectorAll('.phase-panel');
    const show = i => {
      btns.forEach((b, j) => { b.classList.toggle('active', i === j); b.setAttribute('aria-selected', i === j); });
      panels.forEach((p, j) => p.classList.toggle('active', i === j));
    };
    btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
    wrap.querySelectorAll('[data-phase-go]').forEach(a => a.addEventListener('click', () => {
      show(+a.dataset.phaseGo);
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    show(0);
  });

  /* ---------- Datasheet แบบคลิกอธิบาย ---------- */
  document.querySelectorAll('[data-datasheet]').forEach(ds => {
    const out = ds.querySelector('.ds-explain');
    const def = out ? out.innerHTML : '';
    ds.querySelectorAll('[data-explain]').forEach(el => {
      const show = () => {
        ds.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
        el.classList.add('hl');
        out.innerHTML = el.dataset.explain;
      };
      el.addEventListener('mouseenter', show);
      el.addEventListener('click', show);
      el.addEventListener('focus', show);
      el.tabIndex = 0;
    });
    ds.addEventListener('mouseleave', () => {
      ds.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
      if (out) out.innerHTML = def;
    });
  });


  /* ---------- รูปพื้นขาว → วางบนแผ่นกระดาษเก่า / ภาพเบลอระหว่างโหลด ---------- */
  const PLATES = ['characters/aun-va', 'characters/belisarius-cawl', 'characters/helbrecht', 'characters/imotekh', 'characters/swarmlord',
    'factions/imperium/chapter-blood-angels', 'factions/imperium/chapter-dark-angels', 'factions/imperium/chapter-deathwatch', 'factions/imperium/chapter-space-wolves',
    'factions/imperium/imperial-agents-inquisitor', 'factions/imperium/imperial-knights', 'factions/imperium/space-marines', 'factions/xenos/drukhari',
    'factions/xenos/harlequins', 'factions/xenos/necrons', 'factions/xenos/orks', 'gods/deceiver', 'gods/malice-mark', 'gods/mark-khorne', 'gods/mark-nurgle',
    'gods/mark-slaanesh', 'lore/30k/typhon-first-captain', 'lore/star-of-chaos', 'lore/xenos/tau-fire-warrior', 'primarchs/fulgrim-now'];
  const isPlate = src => /\/legions\//.test(src) || PLATES.some(p => src.indexOf('/' + p + '.webp') > -1);
  const prep = img => {
    if (img.dataset.prep || !img.parentElement) return; img.dataset.prep = '1';
    const src = img.getAttribute('src') || '';
    if (isPlate(src) && !img.closest('.god-sym, .lightbox, .pm-thumbs, .rel-faces, .rel-pop, .mx, .abil') && !img.classList.contains('god-sym') && !img.classList.contains('cr-thumb')) {
      img.classList.add('plate');
      const par = img.parentElement;
      if (par.classList.contains('img')) par.classList.add('plate-bg');
      else {
        const wrap = document.createElement('div');
        wrap.className = 'plate-wrap plate-bg' + (par.classList.contains('char') ? ' char-plate' : '');
        par.insertBefore(wrap, img); wrap.appendChild(img);
      }
    }
    if (img.getAttribute('loading') === 'lazy') {
      const done = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    }
  };
  document.querySelectorAll('img').forEach(prep);
  if ('MutationObserver' in window) {
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.tagName === 'IMG') prep(n); else n.querySelectorAll && n.querySelectorAll('img').forEach(prep);
    }))).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- ตารางบนมือถือ → การ์ด ---------- */
  document.querySelectorAll('table').forEach(t => {
    const heads = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
    if (heads.length < 3 || t.classList.contains('no-stack')) return;
    t.classList.add('stack');
    t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((c, i) => {
      if (c.tagName === 'TD' && heads[i]) c.setAttribute('data-label', heads[i]);
    }));
  });

  /* ---------- อนิเมชันตอนเลื่อน: หัวข้อในหน้าเนื้อหา + รายการแบบไล่ทีละชิ้น ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.doc-body > section').forEach((sec, i) => {
      if (i === 0) return;
      const r = sec.getBoundingClientRect();
      if (r.top < window.innerHeight) return;
      sec.classList.add('reveal-auto'); io2.observe(sec);
    });
    document.querySelectorAll('.char-grid, .gallery, .compare-grid').forEach(g => {
      [...g.children].forEach((c, i) => { c.style.transitionDelay = Math.min(i, 8) * 60 + 'ms'; });
      const r = g.getBoundingClientRect();
      if (r.top < window.innerHeight) return;
      g.classList.add('stagger'); io2.observe(g);
    });
  }

  /* ---------- ปุ่มกดมีคลื่นกระเพื่อม ---------- */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn');
    if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const w = document.createElement('span');
    w.className = 'ripple';
    w.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(w);
    setTimeout(() => w.remove(), 650);
  });

  /* ---------- อ่านแล้ว ---------- */
  const page = document.body.dataset.page;
  const read = store.get('w40k-read') || [];
  const markBtn = document.querySelector('[data-mark-read]');
  const paint = () => {
    if (!markBtn) return;
    const done = read.includes(page);
    markBtn.innerHTML = done
      ? window.icon('check-circle') + ' อ่านหน้านี้แล้ว'
      : window.icon('check') + ' ทำเครื่องหมายว่าอ่านแล้ว';
    markBtn.classList.toggle('btn-primary', done);
    markBtn.classList.toggle('btn-ghost', !done);
  };
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      const i = read.indexOf(page);
      if (i > -1) read.splice(i, 1); else read.push(page);
      store.set('w40k-read', read); paint();
    });
    paint();
  }
  /* แสดงสถานะบนเส้นทางการเรียน (หน้าแรก) */
  document.querySelectorAll('.path a[data-id]').forEach(a => a.classList.toggle('is-read', read.includes(a.dataset.id)));
  document.querySelectorAll('[data-progress]').forEach(el => {
    const ids = el.dataset.progress.split(',');
    const n = ids.filter(id => read.includes(id)).length;
    const bar = el.querySelector('.progress-line > i'), txt = el.querySelector('[data-progress-text]');
    if (bar) bar.style.width = (n / ids.length * 100) + '%';
    if (txt) txt.textContent = n + ' / ' + ids.length;
  });
  const pc = document.querySelector('[data-path-count]');
  if (pc) {
    const total = document.querySelectorAll('.path a[data-id]').length;
    const n = [...document.querySelectorAll('.path a[data-id]')].filter(a => read.includes(a.dataset.id)).length;
    pc.textContent = n + ' / ' + total;
  }
  /* ---------- ป๊อปอัปเรื่องราว: <button data-event="id"> + <template id="id"><img><h3>… ---------- */
  if (document.querySelector('[data-event]')) {
    const ev = document.createElement('div');
    ev.className = 'modal ev-modal';
    ev.setAttribute('role', 'dialog'); ev.setAttribute('aria-modal', 'true'); ev.setAttribute('aria-label', 'เหตุการณ์ตัวอย่าง');
    ev.innerHTML = '<div class="modal-box"><button type="button" class="modal-close" aria-label="ปิด">' + window.icon('x') + '</button>' +
      '<div class="modal-img"></div><div class="modal-body"></div></div>';
    document.body.appendChild(ev);
    let back = null;
    const openEv = id => {
      const tpl = document.getElementById(id);
      if (!tpl || !tpl.content) return;
      const frag = tpl.content.cloneNode(true);
      const img = [...frag.children].find(n => n.tagName === 'IMG'); /* เฉพาะรูปชั้นบนสุด — รูปคู่ใน .rel-pop ให้อยู่ที่เดิม */
      const imgBox = ev.querySelector('.modal-img'), body = ev.querySelector('.modal-body');
      imgBox.innerHTML = ''; body.innerHTML = '';
      if (img) { img.setAttribute('data-zoom', ''); imgBox.appendChild(img); }
      imgBox.hidden = !img;
      ev.querySelector('.modal-box').style.gridTemplateColumns = img ? '' : '1fr';
      body.appendChild(frag);
      back = document.activeElement;
      ev.classList.add('open'); document.body.style.overflow = 'hidden';
      body.scrollTop = 0; ev.querySelector('.modal-box').scrollTop = 0;
      ev.querySelector('.modal-close').focus();
    };
    const closeEv = () => { ev.classList.remove('open'); document.body.style.overflow = ''; if (back) back.focus(); };
    document.addEventListener('click', e => { const b = e.target.closest('[data-event]'); if (b) { e.preventDefault(); openEv(b.dataset.event); } });
    ev.addEventListener('click', e => { if (e.target === ev || e.target.closest('.modal-close')) closeEv(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ev.classList.contains('open') && !lb.classList.contains('open')) closeEv(); });
  }

  /* ---------- ตัวกรองการ์ดความสัมพันธ์: <div data-rel-filter> .tab[data-f="tone,tone"] ---------- */
  document.querySelectorAll('[data-rel-filter]').forEach(bar => {
    const list = bar.nextElementSibling;
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b || !list) return;
      bar.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === b));
      const f = b.dataset.f.split(',');
      list.querySelectorAll('.rel-card').forEach(c => { c.hidden = !(f[0] === 'all' || f.includes(c.dataset.tone)); });
    });
  });

  /* ---------- ปุ่มพิมพ์ ---------- */
  document.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));

  /* ---------- คำอธิบายลอยเมื่อชี้เมาส์ (data-tip, data-tip-title) — ใช้กับรายการที่สร้างด้วย JS ได้ ---------- */
  const tip = document.createElement('div');
  tip.className = 'hover-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
  document.body.appendChild(tip);
  let tipFor = null;
  const placeTip = (x, y) => {
    const w = tip.offsetWidth, h = tip.offsetHeight, pad = 14;
    let left = x + pad, top = y + pad;
    if (left + w > innerWidth - 8) left = Math.max(8, x - w - pad);
    if (top + h > innerHeight - 8) top = Math.max(8, y - h - pad);
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  };
  const showTip = (el, x, y) => {
    tipFor = el;
    const t = el.getAttribute('data-tip-title');
    tip.innerHTML = (t ? '<b>' + t.replace(/</g, '&lt;') + '</b>' : '') + '<span>' + el.getAttribute('data-tip').replace(/</g, '&lt;') + '</span>';
    tip.hidden = false; placeTip(x, y);
  };
  const hideTip = () => { tipFor = null; tip.hidden = true; };
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (el && el !== tipFor) showTip(el, e.clientX, e.clientY);
    else if (!el && tipFor) hideTip();
  });
  document.addEventListener('mousemove', e => { if (tipFor) placeTip(e.clientX, e.clientY); });
  document.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left, r.bottom); } });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('scroll', hideTip, true);

  /* ---------- รูปขยายเมื่อชี้เมาส์ (data-hover-zoom) — ลอยอยู่นอกตาราง ไม่ถูกกรอบตัด; คลิกยังทำงานตามลิงก์เดิม ---------- */
  const hz = document.createElement('div');
  hz.className = 'hover-zoom'; hz.hidden = true; hz.setAttribute('aria-hidden', 'true');
  hz.innerHTML = '<img alt=""><span></span>';
  document.body.appendChild(hz);
  let hzFor = null;
  document.addEventListener('mouseover', e => {
    const im = e.target.closest('img[data-hover-zoom]');
    if (im === hzFor) return;
    if (!im) { if (hzFor) { hzFor = null; hz.hidden = true; } return; }
    hzFor = im;
    hz.className = 'hover-zoom' + (im.classList.contains('loyal') ? ' loyal' : im.classList.contains('traitor') ? ' traitor' : '');
    hz.querySelector('img').src = im.currentSrc || im.src;
    hz.querySelector('span').textContent = im.alt;
    hz.hidden = false;
    const r = im.getBoundingClientRect(), W = 220, H = 280;
    let left = r.left + r.width / 2 - W / 2, top = r.bottom + 10;
    if (top + H > innerHeight - 8) top = Math.max(8, r.top - H - 10);
    left = Math.max(8, Math.min(innerWidth - W - 8, left));
    hz.style.left = left + 'px'; hz.style.top = top + 'px';
  });
  document.addEventListener('scroll', () => { if (hzFor) { hzFor = null; hz.hidden = true; } }, true);
})();

/* แผนภาพ X-ray อวัยวะเสริม: ชี้/แตะหมายเลขหรือแถวตาราง เพื่อไฮไลต์และแสดงคำอธิบาย */
(function () {
  const wrap = document.querySelector('[data-xray]'); if (!wrap) return;
  const sec = wrap.closest('section') || document, card = wrap.querySelector('.xr-card');
  const rows = [...sec.querySelectorAll('tr[data-o]')], dots = [...wrap.querySelectorAll('.xr-o')];
  const def = card.innerHTML; let pinned = null;
  const show = id => {
    dots.forEach(d => d.classList.toggle('on', d.dataset.o === id)); rows.forEach(r => r.classList.toggle('on', r.dataset.o === id));
    wrap.classList.toggle('hl', !!id);
    const r = rows.find(x => x.dataset.o === id);
    if (!r) { card.innerHTML = def; return; }
    const c = r.cells, name = c[1].querySelector('strong'), th = c[1].querySelector('small');
    card.innerHTML = '<small>อวัยวะลำดับที่ ' + c[0].textContent + (c.length > 3 ? ' · ฝังอายุ ' + c[2].textContent + ' ปี' : ' · เฉพาะ Primaris') + '</small><b>' + name.textContent + (th ? ' — ' + th.textContent : '') + '</b><p>' + c[c.length - 1].textContent + '</p>';
  };
  const bind = (el) => {
    el.addEventListener('mouseenter', () => show(el.dataset.o));
    el.addEventListener('mouseleave', () => show(pinned));
    el.addEventListener('focus', () => show(el.dataset.o));
    el.addEventListener('click', () => { pinned = pinned === el.dataset.o ? null : el.dataset.o; show(pinned); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
  };
  dots.forEach(bind); rows.forEach(bind);
})();
