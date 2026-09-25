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
    { id: 'lore-ancient', file: 'pages/lore-ancient.html', title: 'ยุคโบราณ: ก่อนจักรวรรดิ', icon: 'clock', desc: 'Old Ones, War in Heaven, Dark Age of Technology' },
    { id: 'gods', file: 'pages/gods.html', title: 'เทพเจ้าทุกองค์', icon: 'star', desc: 'Chaos, Aeldari, Ork, C\'tan และอื่น ๆ' },
    { id: 'warp', file: 'pages/warp.html', title: 'Warp และกลไกของจักรวาล', icon: 'planet', desc: 'Navigator, Astropath, Psyker และ Great Rift' },
    { id: 'primarchs', file: 'pages/primarchs.html', title: 'จักรพรรดิ & Primarch ทั้ง 20', icon: 'crown', desc: 'ต้นกำเนิด การทรยศ และสถานะปัจจุบัน' },
    { id: 'primarch-relations', file: 'pages/primarch-relations.html', title: 'ความสัมพันธ์ของ Primarch', icon: 'users', desc: 'ใครรักใคร ใครเกลียดใคร ทุกคู่' },
    { id: 'lore-30k', file: 'pages/lore-30k.html', title: 'ยุค 30K: Horus Heresy', icon: 'scroll', desc: 'Great Crusade และ Legion สมัยยังภักดี' },
    { id: 'lore-40k', file: 'pages/lore-40k.html', title: 'ยุค 40K–42K', icon: 'clock', desc: 'หมื่นปีแห่งความมืดจนถึงวันนี้' },
    { id: 'compare', file: 'pages/compare-30k-40k.html', title: 'เปรียบเทียบ 30K vs 40K', icon: 'layers', desc: 'อะไรเปลี่ยนไปบ้างในหมื่นปี' },
    { id: 'faction-lore', file: 'pages/faction-lore.html', title: 'เนื้อเรื่องรายทัพ', icon: 'book', desc: 'ต้นกำเนิดและวีรกรรมของทุกทัพ' },
    { id: 'xenos-races', file: 'pages/xenos-races.html', title: 'เผ่าพันธุ์อื่น ๆ ในจักรวาล', icon: 'eye', desc: 'Jokaero, Hrud, Enslavers และอีกกว่า 70 เผ่า' },
    { id: 'characters', file: 'pages/characters.html', title: 'บุคคลสำคัญ', icon: 'users', desc: 'ตัวละครที่มีชื่อ พร้อมค้นหาและตัวกรอง' },
    { id: 'space-marines', file: 'pages/space-marines.html', title: 'Space Marine เจาะลึก', icon: 'shield', desc: 'คัดคน อวัยวะ ชุดเกราะ Mk I–X และ Dreadnought' },
    { id: 'codex-astartes', file: 'pages/codex-astartes.html', title: 'Codex Astartes', icon: 'scroll', desc: 'คัมภีร์ของ Space Marine ทั้ง 52 ข้อ พร้อมเหตุการณ์จริง' },
    { id: 'ranks', file: 'pages/ranks.html', title: 'ลำดับยศทุกฝ่าย', icon: 'layers', desc: 'ใครสั่งใครได้ และแต่ละตำแหน่งมีกี่คน' },
    { id: 'honours', file: 'pages/honours.html', title: 'เหรียญตราและเกียรติยศ', icon: 'award', desc: 'Crux Terminatus, Iron Halo, เหรียญทหาร และอื่น ๆ' },
    { id: 'galaxy-map', file: 'pages/galaxy-map.html', title: 'แผนที่กาแล็กซี', icon: 'planet', desc: 'กดดาวเพื่อดูผู้ครอบครองและเหตุการณ์' },
    { id: 'organizations', file: 'pages/organizations.html', title: 'องค์กรลับและกองกำลังพิเศษ', icon: 'eye', desc: 'Inquisition, Assassins, Legion of the Damned ฯลฯ' },
    { id: 'novels', file: 'pages/novels.html', title: 'นิยายที่ควรเริ่มอ่าน', icon: 'book', desc: 'ลำดับนิยาย Black Library พร้อมระดับภาษา' },
    { id: 'factions', file: 'pages/factions.html', title: 'ทัพทั้งหมด', icon: 'shield', desc: 'รู้จักทุกฝ่ายและสไตล์การเล่น' },
    { id: 'finder', file: 'pages/faction-finder.html', title: 'ทัพไหนเหมาะกับคุณ', icon: 'compass', desc: 'ตอบคำถามแล้วดูว่าทัพไหนเข้ากับคุณ' },
    { id: 'basics', file: 'pages/basics.html', title: 'พื้นฐาน & Datasheet', icon: 'scroll', desc: 'ลูกเต๋า ระยะ ค่าสถานะ คีย์เวิร์ด' },
    { id: 'turn', file: 'pages/turn.html', title: 'ลำดับเทิร์น 5 เฟส', icon: 'clock', desc: 'Command → Movement → Shooting → Charge → Fight' },
    { id: 'combat', file: 'pages/combat.html', title: 'การโจมตี & ทอยเต๋า', icon: 'dice', desc: 'Hit → Wound → Save → Damage + ตัวจำลอง' },
    { id: 'terrain', file: 'pages/terrain.html', title: 'ฉาก & Objective', icon: 'mountain', desc: 'Cover, Hidden, การยึดจุด' },
    { id: 'stratagems', file: 'pages/stratagems.html', title: 'Stratagem & ความสามารถ', icon: 'zap', desc: 'ใช้ CP และความสามารถหลักของอาวุธ' },
    { id: 'cheat-sheet', file: 'pages/cheat-sheet.html', title: 'สรุปกติกา (พิมพ์ได้)', icon: 'scroll', desc: 'กติกาทั้งหมดในแผ่นเดียว พิมพ์วางข้างโต๊ะ' },
    { id: 'army-building', file: 'pages/army-building.html', title: 'การจัดทัพ', icon: 'layers', desc: 'แต้ม Detachment Leader Enhancement' },
    { id: 'game-modes', file: 'pages/game-modes.html', title: 'รูปแบบการเล่น & ภารกิจ', icon: 'trophy', desc: 'Combat Patrol, Matched, Crusade และการทำแต้ม' },
    { id: 'army-builder', file: 'pages/army-builder.html', title: 'ทดลองจัดทีม', icon: 'calc', desc: 'เลือกทัพ ใส่ยูนิต และตรวจกติกา' },
    { id: 'tabletop', file: 'pages/tabletop.html', title: 'โต๊ะจำลองการรบ', icon: 'swords', desc: 'เดิน ยิง ชาร์จ ต่อสู้ บนโต๊ะจำลอง' },
    { id: 'first-game', file: 'pages/first-game.html', title: 'เกมแรกทีละขั้น', icon: 'flag', desc: 'ตั้งแต่จัดโต๊ะจนนับแต้มจบเกม' },
    { id: 'hobby', file: 'pages/hobby.html', title: 'ประกอบ & ทำสีโมเดล', icon: 'brush', desc: 'งานอดิเรกอีกครึ่งหนึ่งของ 40K' },
    { id: 'glossary', file: 'pages/glossary.html', title: 'อภิธานศัพท์', icon: 'list', desc: 'ศัพท์ทุกคำ + คำอ่าน + ความหมาย' },
    { id: 'quiz', file: 'pages/quiz.html', title: 'แบบทดสอบ', icon: 'help', desc: 'เช็กว่าพร้อมลงสนามหรือยัง' }
  ];
  window.SITE_PAGES = PAGES;

  const byId = id => PAGES.find(p => p.id === id);
  const href = p => root + p.file;
  const ic = (n, c) => '<svg class="i ' + (c || '') + '" aria-hidden="true"><use href="#i-' + n + '"></use></svg>';

  /* เมนูหลัก: จัดเป็นกลุ่มตามลำดับการเรียน แต่ละกลุ่มแบ่งหัวข้อย่อย (sec) — link = ลิงก์ตรงไม่มีเมนูย่อย */
  const MENU = [
    { label: 'เริ่มต้น', secs: [
      ['เริ่มจากศูนย์', ['getting-started', 'factions', 'first-game', 'hobby']],
      ['ช่วยเลือกและทบทวน', ['finder', 'quiz']] ] },
    { label: 'เนื้อเรื่อง', secs: [
      ['ไทม์ไลน์ตามยุค', ['lore', 'lore-ancient', 'lore-30k', 'lore-40k', 'compare']],
      ['กลไกของจักรวาล', ['gods', 'warp', 'galaxy-map', 'organizations']] ] },
    { label: 'ทัพ & ตัวละคร', secs: [
      ['ทัพและเผ่าพันธุ์', ['faction-lore', 'space-marines', 'xenos-races']],
      ['บุคคลสำคัญ', ['primarchs', 'primarch-relations', 'characters', 'ranks', 'honours']] ] },
    { link: 'codex-astartes' },
    { label: 'กติกา & จัดทัพ', secs: [
      ['กติกาการเล่น', ['basics', 'turn', 'combat', 'terrain', 'stratagems']],
      ['จัดทัพและรูปแบบเกม', ['army-building', 'game-modes', 'cheat-sheet']] ] },
    { label: 'เครื่องมือ', secs: [
      ['ลองเล่น', ['army-builder', 'tabletop']],
      ['อ้างอิง', ['glossary', 'novels']] ] }
  ];
  MENU.forEach(g => { if (g.secs) g.items = g.secs.reduce((a, s) => a.concat(s[1]), []); });


  /* ---------- ธีมและขนาดตัวอักษร ---------- */
  const THEMES = [['dark', 'ธีมดำ'], ['light', 'ธีมขาว'], ['chaos', 'ธีมม่วง Chaos']];
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ไม่เป็นไร */ } };
  const themeSwitch = () => '<div class="theme-switch" role="group" aria-label="เลือกธีม">' +
    THEMES.map(([id, label]) => '<button type="button" class="t-' + id + '" data-theme-set="' + id + '" title="' + label + '" aria-label="' + label + '"></button>').join('') + '</div>';
  const fontSwitch = () => '<div class="font-switch" role="group" aria-label="ขนาดตัวอักษร">' +
    '<button type="button" data-fs-step="-1" title="ตัวอักษรเล็กลง" aria-label="ตัวอักษรเล็กลง">ก-</button>' +
    '<button type="button" data-fs-step="1" title="ตัวอักษรใหญ่ขึ้น" aria-label="ตัวอักษรใหญ่ขึ้น">ก+</button></div>';
  const html = document.documentElement;
  const paintTheme = () => {
    const cur = html.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', b.dataset.themeSet === cur));
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-theme-set]');
    if (t) {
      const v = t.dataset.themeSet;
      if (v === 'dark') html.removeAttribute('data-theme'); else html.setAttribute('data-theme', v);
      save('w40k-theme', v === 'dark' ? '' : v); paintTheme();
    }
    const f = e.target.closest('[data-fs-step]');
    if (f) {
      const cur = +(html.getAttribute('data-fs') || 0);
      const next = Math.max(-1, Math.min(2, cur + +f.dataset.fsStep));
      if (next === 0) html.removeAttribute('data-fs'); else html.setAttribute('data-fs', next);
      save('w40k-fs', next === 0 ? '' : String(next));
    }
  });

  /* ---------- Header ---------- */
  const navHTML = MENU.map((g, gi) => {
    if (g.link) {
      const p = byId(g.link);
      return '<div class="nav-item nav-direct"><a class="nav-link' + (g.link === current ? ' is-active' : '') + '" href="' + href(p) + '"' + (g.link === current ? ' aria-current="page"' : '') + ' title="' + p.desc + '">' + ic(p.icon) + p.title + '</a></div>';
    }
    const active = g.items.includes(current);
    const link = id => {
      const p = byId(id);
      return '<a href="' + href(p) + '"' + (id === current ? ' aria-current="page"' : '') + '>' + ic(p.icon) +
        '<span>' + p.title + '<small>' + p.desc + '</small></span></a>';
    };
    const cols = g.secs.map(sc => '<div class="dd-col"><div class="dd-h">' + sc[0] + '</div>' + sc[1].map(link).join('') + '</div>').join('');
    /* กลุ่มริมซ้าย/ขวาเปิดชิดขอบด้านนั้น กันเมนูล้นจอ */
    const edge = gi >= MENU.length - 2 ? ' dd-right' : gi < 2 ? ' dd-left' : '';
    return '<div class="nav-item"><button class="nav-link' + (active ? ' is-active' : '') + '" aria-expanded="false" aria-controls="dd' + gi + '">' +
      g.label + ic('chev-down', 'chev') + '</button><div class="dropdown dd-cols' + edge + '" id="dd' + gi + '">' + cols + '</div></div>';
  }).join('');

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="container">' +
      '<a class="brand" href="' + root + 'index.html" aria-label="หน้าแรก">' +
        '<span class="brand-mark">' + ic('aquila') + '</span>' +
        '<span>คู่มือ 40K ฉบับมือใหม่<small>Warhammer 40,000 · 11th Edition</small></span></a>' +
      '<nav class="nav" aria-label="เมนูหลัก">' + navHTML +
        '<div class="mobile-tools">ขนาดตัวอักษร ' + fontSwitch() + '</div></nav>' +
      '<div class="header-tools"><button type="button" class="search-btn" data-open-search aria-label="ค้นหาทั้งเว็บ" title="ค้นหาทั้งเว็บ (กด / )">' + ic('search') + '<span>ค้นหา</span><kbd>/</kbd></button>' + fontSwitch() + themeSwitch() + '</div>' +
      '<button class="nav-toggle" aria-label="เปิดเมนู" aria-expanded="false">' + ic('menu') + '</button>' +
    '</div><div class="read-progress"></div>';
  body.insertBefore(header, body.children[1] || null);
  paintTheme();

  /* mobile toggle */
  const toggle = header.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.innerHTML = ic(open ? 'x' : 'menu');
  });
  header.querySelectorAll('.nav-item > .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1100px)').matches) {
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
      '<div><a class="brand" href="' + root + 'index.html"><span class="brand-mark">' + ic('aquila') + '</span><span>คู่มือ 40K ฉบับมือใหม่</span></a>' +
      '<p class="mt-2">เว็บสรุปกติกาและเนื้อเรื่อง Warhammer 40,000 ภาษาไทย สำหรับคนที่เพิ่งเริ่ม อ้างอิงกติกา 11th Edition (เปิดตัว มิ.ย. 2026)</p></div>' +
      '<div><h4>เริ่มต้น & โลกของ 40K</h4><ul>' + col(['getting-started', 'lore', 'gods', 'primarchs', 'lore-30k', 'lore-40k', 'factions', 'first-game']) + '</ul></div>' +
      '<div><h4>กติกา</h4><ul>' + col(['basics', 'turn', 'combat', 'terrain', 'stratagems']) + '</ul></div>' +
      '<div><h4>เครื่องมือ & อื่น ๆ</h4><ul>' + col(['army-builder', 'tabletop', 'finder', 'cheat-sheet', 'hobby', 'glossary', 'quiz']) +
      '<li><a href="' + root + 'pages/credits.html">แหล่งอ้างอิง & เครดิตรูป</a></li></ul></div>' +
    '</div><div class="offline-box" id="offline-box" hidden><div><b>' + ic('box') + ' อ่านแบบออฟไลน์</b><small id="offline-msg">หน้าที่เคยเปิดแล้วอ่านได้แม้ไม่มีอินเทอร์เน็ต กดปุ่มเพื่อบันทึกทั้งเว็บรวมรูปภาพ (ประมาณ 45 MB)</small></div>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="offline-btn">บันทึกทั้งเว็บ</button><div class="progress-line" id="offline-bar" hidden><i></i></div></div>' +
    '<div class="footer-bottom">' +
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

  /* ---------- PWA: ทำงานออฟไลน์ (เฉพาะเมื่อเปิดผ่าน http/https) ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register(root + 'sw.js').then(reg => {
      const box = document.getElementById('offline-box'), btn = document.getElementById('offline-btn');
      const msg = document.getElementById('offline-msg'), bar = document.getElementById('offline-bar');
      if (!box) return;
      box.hidden = false;
      let saved = null;
      try { saved = localStorage.getItem('w40k-offline'); } catch (e) { /* ไม่มี storage */ }
      if (saved) { msg.textContent = 'บันทึกทั้งเว็บไว้แล้วเมื่อ ' + saved + ' — กดอีกครั้งเพื่ออัปเดต'; btn.textContent = 'อัปเดตข้อมูลออฟไลน์'; }
      navigator.serviceWorker.addEventListener('message', e => {
        const d = e.data || {};
        if (d.type === 'cache-progress') { bar.hidden = false; bar.firstChild.style.width = Math.round(d.done / d.total * 100) + '%'; msg.textContent = 'กำลังบันทึก ' + d.done + ' / ' + d.total + ' ไฟล์…'; }
        if (d.type === 'cache-done') {
          const when = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
          try { localStorage.setItem('w40k-offline', when); } catch (err) { /* ไม่มี storage */ }
          msg.textContent = d.failed ? 'บันทึกเสร็จ (ไม่สำเร็จ ' + d.failed + ' ไฟล์ ลองกดอีกครั้งตอนเน็ตดี)' : 'บันทึกเสร็จแล้ว อ่านทั้งเว็บได้แม้ไม่มีอินเทอร์เน็ต';
          btn.disabled = false; btn.textContent = 'อัปเดตข้อมูลออฟไลน์';
        }
      });
      btn.addEventListener('click', () => {
        const sw = reg.active || navigator.serviceWorker.controller; if (!sw) { msg.textContent = 'กำลังเตรียมระบบ ลองใหม่อีกครั้งในไม่กี่วินาที'; return; }
        btn.disabled = true; sw.postMessage({ type: 'cache-all' });
      });
    }).catch(() => { /* ไม่รองรับหรือผิดพลาด: ใช้งานออนไลน์ตามปกติ */ });
  }

  /* ---------- โหลดระบบค้นหา ---------- */
  const ver = ((document.querySelector('script[src*="layout.js"]') || {}).src || '').split('?')[1];
  const ss = document.createElement('script');
  ss.src = root + 'js/search.js' + (ver ? '?' + ver : '');
  body.appendChild(ss);

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
    /* ปุ่มสารบัญลอย (จอเล็ก) */
    const fab = document.createElement('button');
    fab.className = 'toc-fab'; fab.type = 'button';
    fab.innerHTML = ic('list') + ' สารบัญ';
    const sheet = document.createElement('div');
    sheet.className = 'toc-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'สารบัญหน้านี้');
    sheet.innerHTML = '<h4>ในหน้านี้ <button type="button" aria-label="ปิดสารบัญ">' + ic('x') + '</button></h4>' + toc.querySelector('ol').outerHTML;
    const back = document.createElement('div'); back.className = 'toc-backdrop';
    const setOpen = o => { sheet.classList.toggle('open', o); back.classList.toggle('open', o); };
    fab.addEventListener('click', () => setOpen(true));
    back.addEventListener('click', () => setOpen(false));
    sheet.addEventListener('click', e => { if (e.target.closest('a, h4 button')) setOpen(false); });
    if (secs.length > 1) body.append(fab, back, sheet);
    links.push(...sheet.querySelectorAll('a'));
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
