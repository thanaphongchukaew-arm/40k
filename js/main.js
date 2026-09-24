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

  /* ---------- Lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'ภาพขยาย');
  lb.innerHTML = '<img alt=""><p></p>';
  document.body.appendChild(lb);
  document.addEventListener('click', e => {
    const img = e.target.closest('.figure img, [data-zoom]');
    if (!img) return;
    lb.querySelector('img').src = img.currentSrc || img.src;
    lb.querySelector('img').alt = img.alt;
    const cap = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    lb.querySelector('p').textContent = cap ? cap.textContent : img.alt;
    lb.classList.add('open');
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

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
  const pc = document.querySelector('[data-path-count]');
  if (pc) {
    const total = document.querySelectorAll('.path a[data-id]').length;
    const n = [...document.querySelectorAll('.path a[data-id]')].filter(a => read.includes(a.dataset.id)).length;
    pc.textContent = n + ' / ' + total;
  }
})();
