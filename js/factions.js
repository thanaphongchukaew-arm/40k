/* =========================================================
   หน้า "ทัพทั้งหมด": แสดงการ์ด ตัวกรอง ค้นหา และป๊อปอัปรายละเอียด
   ต้องโหลด factions-data.js ก่อน
   ========================================================= */
(function () {
  const root = document.body.dataset.root || '../';
  const data = window.FACTIONS || [];
  const ic = n => '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"></use></svg>';
  const SIDE = {
    imperium: { label: 'Imperium', th: 'จักรวรรดิ', chip: 'chip-imperium' },
    chaos: { label: 'Chaos', th: 'เคออส', chip: 'chip-chaos' },
    xenos: { label: 'Xenos', th: 'ต่างดาว', chip: 'chip-xenos' }
  };
  const DIFF = ['', 'ง่าย', 'ปานกลาง', 'ท้าทาย'];

  const diffHTML = d => '<span class="diff" title="ความยาก: ' + DIFF[d] + '">' +
    [1, 2, 3].map(i => '<i class="' + (i <= d ? 'on' : '') + '"></i>').join('') + '</span>';

  const card = f =>
    '<button class="faction-card reveal in" data-id="' + f.id + '" aria-label="ดูรายละเอียด ' + f.name + '">' +
      '<div class="img"><img src="' + root + 'images/' + f.img + '" alt="' + f.name + '" loading="lazy"></div>' +
      '<div class="body">' +
        '<div class="meta"><span class="chip ' + SIDE[f.side].chip + '">' + SIDE[f.side].label + '</span>' +
        (f.chapter ? '<span class="chip">Chapter</span>' : '') + '</div>' +
        '<h3>' + f.name + '</h3><span class="th-name">' + f.th + '</span>' +
        '<p class="tagline">' + f.tagline + '</p>' +
        '<div class="meta"><span class="chip">' + diffHTML(f.difficulty) + ' ' + DIFF[f.difficulty] + '</span>' +
        '<span class="chip">' + ic('users') + ' ' + f.models + '</span></div>' +
      '</div></button>';

  /* ---------- render ---------- */
  const grids = {
    imperium: document.getElementById('grid-imperium'),
    chapters: document.getElementById('grid-chapters'),
    chaos: document.getElementById('grid-chaos'),
    xenos: document.getElementById('grid-xenos')
  };
  const render = (filterSide, q) => {
    q = (q || '').trim().toLowerCase();
    const match = f => (!q || (f.name + ' ' + f.th + ' ' + (f.aka || '') + ' ' + f.tagline).toLowerCase().includes(q));
    let total = 0;
    Object.entries(grids).forEach(([key, el]) => {
      if (!el) return;
      const list = data.filter(f => (key === 'chapters' ? f.chapter : (!f.chapter && f.side === key)) && match(f));
      const sideOfKey = key === 'chapters' ? 'imperium' : key;
      const show = (filterSide === 'all' || filterSide === sideOfKey) && list.length > 0;
      el.innerHTML = list.map(card).join('');
      el.closest('[data-group]').hidden = !show;
      if (show) total += list.length;
    });
    document.getElementById('no-result').hidden = total > 0;
  };

  let side = 'all';
  const search = document.getElementById('faction-search');
  document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('active', x === b));
    side = b.dataset.filter; render(side, search.value);
  }));
  search.addEventListener('input', () => render(side, search.value));

  /* เปิดจาก hash เช่น factions.html#chaos */
  const h = location.hash.replace('#', '');
  if (SIDE[h]) { side = h; document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('active', x.dataset.filter === h)); }
  render(side, '');

  /* ---------- Modal ---------- */
  const modal = document.getElementById('faction-modal');
  const box = modal.querySelector('.modal-content');
  const bar = (label, v) => '<div class="stat-bar"><span>' + label + '</span><div class="track"><div class="fill" style="width:' + (v * 20) + '%"></div></div></div>';
  let lastFocus = null;
  const open = id => {
    const f = data.find(x => x.id === id);
    if (!f) return;
    lastFocus = document.activeElement;
    box.innerHTML =
      '<div class="modal-img"><img src="' + root + 'images/' + f.img + '" alt="' + f.name + '" data-zoom></div>' +
      '<div class="modal-body">' +
        '<div class="flex"><span class="chip ' + SIDE[f.side].chip + '">' + SIDE[f.side].label + ' · ' + SIDE[f.side].th + '</span>' +
        (f.chapter ? '<span class="chip">Chapter ของ Space Marines</span>' : '') + '</div>' +
        '<h2 class="mt-2" id="modal-title">' + f.name + '</h2>' +
        '<span class="th-name">คำอ่าน: ' + f.th + (f.aka ? ' · ชื่ออื่น: ' + f.aka : '') + '</span>' +
        '<p>' + f.desc + '</p>' +
        '<h4>' + ic('target') + ' สไตล์การเล่น</h4><ul>' + f.style.map(s => '<li>' + s + '</li>').join('') + '</ul>' +
        '<div class="stat-bars">' + bar('การยิง', f.ratings.shoot) + bar('ตะลุมบอน', f.ratings.melee) + bar('ความทนทาน', f.ratings.tough) + bar('ความเร็ว', f.ratings.speed) + '</div>' +
        '<p class="muted" style="font-size:.84rem;margin-top:-6px">แถบคะแนนเป็นภาพรวมคร่าว ๆ เพื่อเปรียบเทียบ ขึ้นกับ Detachment และยูนิตที่เลือก</p>' +
        '<div class="flex"><span class="chip">ความยากสำหรับมือใหม่: ' + diffHTML(f.difficulty) + ' ' + DIFF[f.difficulty] + '</span><span class="chip">' + ic('users') + ' จำนวนโมเดล: ' + f.models + '</span></div>' +
        '<div class="pros-cons"><div class="pros"><h4>' + ic('check-circle') + ' จุดเด่น</h4><ul>' + f.pros.map(s => '<li>' + s + '</li>').join('') + '</ul></div>' +
        '<div class="cons"><h4>' + ic('alert') + ' ข้อควรรู้</h4><ul>' + f.cons.map(s => '<li>' + s + '</li>').join('') + '</ul></div></div>' +
        '<p class="mt-2 mb-0"><a class="btn btn-primary btn-sm" href="' + root + 'pages/lore/' + f.id + '.html">' + ic('book') + ' อ่านเนื้อเรื่องเต็มของ ' + f.name + '</a></p>' +
      '</div>';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  document.addEventListener('click', e => {
    const c = e.target.closest('.faction-card');
    if (c) open(c.dataset.id);
  });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-close')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  /* ลิงก์ตรงไปยังทัพ เช่น factions.html#orks (มาจากการค้นหาทั้งเว็บ) */
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && data.some(x => x.id === id)) open(id);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
