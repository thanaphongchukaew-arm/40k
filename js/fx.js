/* =========================================================
   Web Animation ทั้งเว็บ (โหลดอัตโนมัติจาก layout.js)
   ใช้การเคลื่อนไหวเฉพาะที่ช่วยผู้อ่าน:
   - เนื้อหาในกลุ่มการ์ดค่อย ๆ ปรากฏเมื่อเลื่อนถึง (บอกว่ามีเนื้อหาใหม่เข้ามา)
   - เปลี่ยนหน้าแบบจางข้ามด้วย View Transitions (CSS) — ไม่หน่วงการคลิก
   ทุกอย่างปิดเองเมื่อผู้ใช้ตั้ง "ลดการเคลื่อนไหว" (prefers-reduced-motion)
   ========================================================= */
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;
  /* ต้องเช็กก่อนใส่ fx-ready — CSS ซ่อนเนื้อหาไว้รออนิเมชันเฉพาะเมื่อมีคลาสนี้ */
  if (reduce) { html.classList.remove('fx-ready'); html.classList.add('fx-reduced'); return; }
  html.classList.add('fx-ready');

  /* ---------- 1) การ์ดปรากฏตามลำดับเมื่อเลื่อนถึง ---------- */
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
      kids.forEach((k, i) => { k.classList.add('fx-item'); k.style.setProperty('--fx-i', Math.min(i, 8)); });
      const r = g.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => g.classList.add('fx-in'));
      else staggerIO.observe(g);
    });
  }
  prepStagger();

  /* เนื้อหาที่สร้างทีหลังด้วย JS (เช่น รายการทัพ ผลค้นหา) ก็ปรากฏแบบเดียวกัน */
  if ('MutationObserver' in window) {
    let mt;
    new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(() => prepStagger(), 200); })
      .observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  }

})();
