/* =========================================================
   Layout กลาง: Header / Footer / สารบัญ / ปุ่มก่อน-ถัดไป
   ทุกหน้าใส่ <body data-page="ชื่อหน้า" data-root="./ หรือ ../">
   ========================================================= */
(function () {
  const body = document.body;
  const root = body.dataset.root || './';
  const current = body.dataset.page || 'home';

  /* ลำดับการเรียน (ใช้ทำปุ่มก่อนหน้า/ถัดไป และเมนู) */
  const PAGES = [
    { id: 'home', file: 'index.html', title: 'หน้าแรก', icon: 'home', desc: 'ภาพรวมและเส้นทางการเรียน' },
    { id: 'getting-started', file: 'pages/getting-started.html', title: 'เริ่มต้นต้องมีอะไร', icon: 'box', desc: 'อุปกรณ์ ชุดเริ่มต้น และการเลือกทัพ' },
    { id: 'lore', file: 'pages/lore.html', title: 'เนื้อเรื่องย่อ', icon: 'book', desc: 'ภาพรวมจักรวาลแห่ง 41st Millennium' },
    { id: 'gods', file: 'pages/gods.html', title: 'เทพเจ้าทุกองค์', icon: 'star', desc: 'Chaos, Aeldari, Ork, C\'tan และอื่น ๆ' },
    { id: 'primarchs', file: 'pages/primarchs.html', title: 'จักรพรรดิ & Primarch ทั้ง 20', icon: 'crown', desc: 'ต้นกำเนิด การทรยศ และสถานะปัจจุบัน' },
    { id: 'lore-30k', file: 'pages/lore-30k.html', title: 'ยุค 30K: Horus Heresy', icon: 'scroll', desc: 'Great Crusade และ Legion สมัยยังภักดี' },
    { id: 'lore-40k', file: 'pages/lore-40k.html', title: 'ยุค 40K–42K', icon: 'clock', desc: 'หมื่นปีแห่งความมืดจนถึงวันนี้' },
    { id: 'compare', file: 'pages/compare-30k-40k.html', title: 'เปรียบเทียบ 30K vs 40K', icon: 'layers', desc: 'อะไรเปลี่ยนไปบ้างในหมื่นปี' },
    { id: 'faction-lore', file: 'pages/faction-lore.html', title: 'เนื้อเรื่องรายทัพ', icon: 'book', desc: 'ต้นกำเนิดและวีรกรรมของทุกทัพ' },
    { id: 'factions', file: 'pages/factions.html', title: 'ทัพทั้งหมด', icon: 'shield', desc: 'รู้จักทุกฝ่ายและสไตล์การเล่น' },
    { id: 'basics', file: 'pages/basics.html', title: 'พื้นฐาน & Datasheet', icon: 'scroll', desc: 'ลูกเต๋า ระยะ ค่าสถานะ คีย์เวิร์ด' },
    { id: 'turn', file: 'pages/turn.html', title: 'ลำดับเทิร์น 5 เฟส', icon: 'clock', desc: 'Command → Movement → Shooting → Charge → Fight' },
    { id: 'combat', file: 'pages/combat.html', title: 'การโจมตี & ทอยเต๋า', icon: 'dice', desc: 'Hit → Wound → Save → Damage + ตัวจำลอง' },
    { id: 'terrain', file: 'pages/terrain.html', title: 'ฉาก & Objective', icon: 'mountain', desc: 'Cover, Hidden, การยึดจุด' },
    { id: 'stratagems', file: 'pages/stratagems.html', title: 'Stratagem & ความสามารถ', icon: 'zap', desc: 'ใช้ CP และความสามารถหลักของอาวุธ' },
    { id: 'army-building', file: 'pages/army-building.html', title: 'การจัดทัพ', icon: 'layers', desc: 'แต้ม Detachment Leader Enhancement' },
    { id: 'game-modes', file: 'pages/game-modes.html', title: 'รูปแบบการเล่น & ภารกิจ', icon: 'trophy', desc: 'Combat Patrol, Matched, Crusade และการทำแต้ม' },
    { id: 'first-game', file: 'pages/first-game.html', title: 'เกมแรกทีละขั้น', icon: 'flag', desc: 'ตั้งแต่จัดโต๊ะจนนับแต้มจบเกม' },
    { id: 'hobby', file: 'pages/hobby.html', title: 'ประกอบ & ทำสีโมเดล', icon: 'brush', desc: 'งานอดิเรกอีกครึ่งหนึ่งของ 40K' },
    { id: 'glossary', file: 'pages/glossary.html', title: 'อภิธานศัพท์', icon: 'list', desc: 'ศัพท์ทุกคำ + คำอ่าน + ความหมาย' },
    { id: 'quiz', file: 'pages/quiz.html', title: 'แบบทดสอบ', icon: 'help', desc: 'เช็กว่าพร้อมลงสนามหรือยัง' }
  ];
  window.SITE_PAGES = PAGES;

  const byId = id => PAGES.find(p => p.id === id);
  const href = p => root + p.file;
  const ic = (n, c) => '<svg class="i ' + (c || '') + '" aria-hidden="true"><use href="#i-' + n + '"></use></svg>';

  const MENU = [
    { label: 'เริ่มต้น', items: ['getting-started', 'first-game', 'quiz'] },
    { label: 'โลกของ 40K', items: ['lore', 'gods', 'primarchs', 'lore-30k', 'lore-40k', 'compare', 'faction-lore', 'factions'] },
    { label: 'กติกา', items: ['basics', 'turn', 'combat', 'terrain', 'stratagems'] },
    { label: 'จัดทัพ & โหมด', items: ['army-building', 'game-modes'] },
    { label: 'งานอดิเรก', items: ['hobby', 'glossary'] }
  ];

  /* ---------- Header ---------- */
  const navHTML = MENU.map((g, gi) => {
    const active = g.items.includes(current);
    const links = g.items.map(id => {
      const p = byId(id);
      return '<a href="' + href(p) + '"' + (id === current ? ' aria-current="page"' : '') + '>' + ic(p.icon) +
        '<span>' + p.title + '<small>' + p.desc + '</small></span></a>';
    }).join('');
    return '<div class="nav-item"><button class="nav-link' + (active ? ' is-active' : '') + '" aria-expanded="false" aria-controls="dd' + gi + '">' +
      g.label + ic('chev-down', 'chev') + '</button><div class="dropdown" id="dd' + gi + '">' + links + '</div></div>';
  }).join('');

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="container">' +
      '<a class="brand" href="' + root + 'index.html" aria-label="หน้าแรก">' +
        '<span class="brand-mark">' + ic('emblem') + '</span>' +
        '<span>คู่มือ 40K ฉบับมือใหม่<small>Warhammer 40,000 · 11th Edition</small></span></a>' +
      '<button class="nav-toggle" aria-label="เปิดเมนู" aria-expanded="false">' + ic('menu') + '</button>' +
      '<nav class="nav" aria-label="เมนูหลัก">' + navHTML + '</nav>' +
    '</div><div class="read-progress"></div>';
  body.insertBefore(header, body.children[1] || null);

  /* mobile toggle */
  const toggle = header.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.innerHTML = ic(open ? 'x' : 'menu');
  });
  header.querySelectorAll('.nav-item > .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1020px)').matches) {
        const item = btn.parentElement;
        const open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      }
    });
  });

  /* ---------- Prev / Next ---------- */
  const slot = document.querySelector('[data-page-nav]');
  const idx = PAGES.findIndex(p => p.id === current);
  if (slot && idx > -1) {
    const prev = PAGES[idx - 1], next = PAGES[idx + 1];
    slot.className = 'page-nav';
    slot.innerHTML =
      (prev ? '<a class="prev" href="' + href(prev) + '"><small>' + ic('arrow-left') + ' ก่อนหน้า</small><b>' + prev.title + '</b></a>' : '<span></span>') +
      (next ? '<a class="next" href="' + href(next) + '"><small>ถัดไป ' + ic('arrow-right') + '</small><b>' + next.title + '</b></a>' : '<span></span>');
  }

  /* ---------- Footer ---------- */
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  const col = ids => ids.map(id => '<li><a href="' + href(byId(id)) + '">' + byId(id).title + '</a></li>').join('');
  footer.innerHTML =
    '<div class="container"><div class="footer-grid">' +
      '<div><a class="brand" href="' + root + 'index.html"><span class="brand-mark">' + ic('emblem') + '</span><span>คู่มือ 40K ฉบับมือใหม่</span></a>' +
      '<p class="mt-2">เว็บสรุปกติกาและเนื้อเรื่อง Warhammer 40,000 ภาษาไทย สำหรับคนที่เพิ่งเริ่ม อ้างอิงกติกา 11th Edition (เปิดตัว มิ.ย. 2026)</p></div>' +
      '<div><h4>เริ่มต้น & โลกของ 40K</h4><ul>' + col(['getting-started', 'lore', 'gods', 'primarchs', 'lore-30k', 'lore-40k', 'factions', 'first-game']) + '</ul></div>' +
      '<div><h4>กติกา</h4><ul>' + col(['basics', 'turn', 'combat', 'terrain', 'stratagems']) + '</ul></div>' +
      '<div><h4>อื่น ๆ</h4><ul>' + col(['army-building', 'game-modes', 'hobby', 'glossary', 'quiz']) +
      '<li><a href="' + root + 'pages/credits.html">แหล่งอ้างอิง & เครดิตรูป</a></li></ul></div>' +
    '</div><div class="footer-bottom">' +
      'เว็บไซต์นี้เป็นสื่อการเรียนรู้ที่แฟนทำขึ้นเอง อ่านฟรีเพื่อผู้อ่านชาวไทย ไม่มีโฆษณาและไม่หารายได้ · ไม่ได้เป็นของหรือได้รับการรับรองจาก Games Workshop · Warhammer 40,000, Citadel และชื่อ/ภาพที่เกี่ยวข้องเป็นเครื่องหมายการค้าของ Games Workshop Limited · ' +
      'กติกาถูกย่อและแปลเพื่อความเข้าใจ — ใช้กฎฉบับเต็มในหนังสือ Core Rules / แอป Warhammer 40,000 เป็นหลักเสมอ' +
    '</div></div>';
  body.appendChild(footer);

  /* ปุ่มกลับขึ้นบน */
  const top = document.createElement('button');
  top.className = 'to-top';
  top.setAttribute('aria-label', 'กลับขึ้นด้านบน');
  top.innerHTML = ic('arrow-up');
  top.addEventListener('click', () => window.scrollTo({ top: 0 }));
  body.appendChild(top);

  /* ---------- สารบัญอัตโนมัติ ---------- */
  const toc = document.querySelector('[data-toc]');
  if (toc) {
    const secs = [...document.querySelectorAll('.doc-body > section[id] > h2')];
    toc.innerHTML = '<h4>ในหน้านี้</h4><ol>' + secs.map(h => {
      const t = h.cloneNode(true); t.querySelectorAll('.num, svg').forEach(n => n.remove());
      return '<li><a href="#' + h.parentElement.id + '">' + t.textContent.trim() + '</a></li>';
    }).join('') + '</ol>';
    const links = [...toc.querySelectorAll('a')];
    const spy = () => {
      let cur = secs[0] && secs[0].parentElement.id;
      secs.forEach(h => { if (h.getBoundingClientRect().top < 140) cur = h.parentElement.id; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  }

  /* ---------- Scroll: progress bar + to-top ---------- */
  const bar = header.querySelector('.read-progress');
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    top.classList.toggle('show', h.scrollTop > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
