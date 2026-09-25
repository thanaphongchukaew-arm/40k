/* =========================================================
   ตัวกรอง Primarch: ฝ่าย / สถานะ / ค้นชื่อหรือ Legion
   อ่านข้อมูลจาก class ที่มีอยู่แล้วในหน้า (primarch loyal|traitor, status st-*)
   ========================================================= */
(function () {
  const cards = [...document.querySelectorAll('section.primarch')].filter(s => s.id !== 'emperor');
  const first = cards[0];
  if (!first) return;
  const ic = n => window.icon ? window.icon(n) : '';
  const STATUS = { alive: 'มีชีวิต', dead: 'ตายแล้ว', missing: 'สูญหาย', daemon: 'กลายเป็นปีศาจ', erased: 'ถูกลบประวัติ' };
  const norm = s => (s || '').toLowerCase().replace(/[\s'’\-]+/g, '');
  const info = cards.map(c => {
    const head = c.querySelector('.primarch-head');
    const st = [...head.querySelectorAll('.status')].map(x => (x.className.match(/st-(\w+)/) || [])[1]).filter(Boolean);
    return { c, side: c.classList.contains('loyal') ? 'loyal' : c.classList.contains('traitor') ? 'traitor' : 'lost', st, text: norm(head.textContent + ' ' + (c.querySelector('.facts') || {}).textContent) };
  });
  const used = Object.keys(STATUS).filter(k => info.some(i => i.st.indexOf(k) > -1));

  const bar = document.createElement('div');
  bar.className = 'char-tools pm-filter';
  bar.innerHTML =
    '<div class="tabs" data-f="side"><button type="button" class="tab active" data-v="">ทั้งหมด</button><button type="button" class="tab" data-v="loyal">ภักดี</button><button type="button" class="tab" data-v="traitor">ทรยศ</button><button type="button" class="tab" data-v="lost">ถูกลบ (II, XI)</button></div>' +
    '<div class="tabs" data-f="st"><button type="button" class="tab active" data-v="">ทุกสถานะ</button>' + used.map(k => '<button type="button" class="tab" data-v="' + k + '">' + STATUS[k] + '</button>').join('') + '</div>' +
    '<label class="pm-search">' + ic('search') + '<input type="search" placeholder="ค้นชื่อ Primarch หรือ Legion เช่น Horus, Ultramarines" aria-label="ค้นหา Primarch"></label>' +
    '<p class="muted pm-count" aria-live="polite"></p>';
  first.parentNode.insertBefore(bar, first);
  const empty = document.createElement('p');
  empty.className = 'muted pm-empty'; empty.hidden = true;
  empty.textContent = 'ไม่พบ Primarch ที่ตรงกับตัวกรอง';
  first.parentNode.insertBefore(empty, first);

  const st = { side: '', st: '', q: '' };
  const emperor = document.getElementById('emperor');
  function apply() {
    const q = norm(st.q); let n = 0;
    info.forEach(i => {
      const ok = (!st.side || i.side === st.side) && (!st.st || i.st.indexOf(st.st) > -1) && (!q || i.text.indexOf(q) > -1);
      i.c.hidden = !ok; if (ok) n++;
    });
    const filtering = st.side || st.st || q;
    if (emperor) emperor.hidden = !!filtering;
    bar.querySelector('.pm-count').textContent = filtering ? 'แสดง ' + n + ' จาก ' + info.length + ' องค์' : 'Primarch ทั้งหมด ' + info.length + ' องค์ — เลือกตัวกรองเพื่อดูเฉพาะกลุ่ม';
    empty.hidden = n > 0;
  }
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const grp = b.closest('[data-f]');
    st[grp.dataset.f] = b.dataset.v;
    grp.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('active', x === b));
    apply();
  });
  bar.querySelector('input').addEventListener('input', e => { st.q = e.target.value; apply(); });
  apply();
})();
