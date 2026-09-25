/* =========================================================
   หน้าเครื่องจำลองโต๊ะเล่น: ตั้งค่าเกม/จัดทัพ, วาดกระดาน SVG, รับคำสั่งผู้เล่น, เล่นแอนิเมชัน
   ต้องโหลด tabletop-data.js และ tabletop-engine.js ก่อน (window.TT)
   ========================================================= */
(function () {
  const app = document.getElementById('tt-app');
  if (!app || !window.TT) return;
  const TT = window.TT, NS = 'http://www.w3.org/2000/svg';
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = window.siteStore || { get: () => null, set: () => {} };
  const $ = s => app.querySelector(s);
  const SIDE_NAME = TT.SIDE, SIDE_CLS = ['blue', 'red'];
  const KIND = { char: 'ตัวละคร', inf: 'ทหารราบ', veh: 'ยานพาหนะ', mon: 'สัตว์ยักษ์' };
  const AB = { synapse: 'Synapse: พวกเดียวกันในระยะ 6" ไม่ขวัญแตก', aura: 'ผู้นำ: พวกเดียวกันในระยะ 6" ไม่ขวัญแตก', officer: 'Officer: ทหารราบในระยะ 6" ยิง Hit +1',
    stealth: 'Stealth: ถูกยิงแล้วศัตรู Hit −1', fly: 'Fly: บินข้ามซากตึกได้' };
  const KW_TH = { assault: 'ยิงได้หลัง Advance', heavy: 'Hit +1 ถ้ายืนนิ่ง', pistol: 'ยิงได้ตอนติดพัน', rapid: 'A +1 ในครึ่งระยะ', torrent: 'โดนอัตโนมัติ', blast: 'A เพิ่มตามจำนวนเป้า',
    melta: 'D +2 ในครึ่งระยะ', sustained: '6 = โดนเพิ่ม 1', lethal: '6 = ทำแผลอัตโนมัติ', devastating: 'ทำแผลได้ 6 = ไม่มีเซฟ', psychic: 'พลังจิต' };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FAC = Object.keys(TT.ARMIES);

  const DEF = { me: 0, opp: 'ai', speed: 1, diff: 'normal', size: 1000, map: 'ruins', armies: ['sm', 'orks'], rosters: [null, null] };
  let prefs = Object.assign({}, DEF, store.get('w40k-tt2') || {});
  if (FAC.indexOf(prefs.armies[0]) < 0 || FAC.indexOf(prefs.armies[1]) < 0) prefs.armies = DEF.armies.slice();
  if (!TT.SIZES[prefs.size]) prefs.size = 1000;
  const save = () => store.set('w40k-tt2', prefs);
  [0, 1].forEach(s => { if (!Array.isArray(prefs.rosters[s]) || !prefs.rosters[s].length || TT.rosterPts(prefs.armies[s], prefs.rosters[s]) > prefs.size) prefs.rosters[s] = TT.autoRoster(prefs.armies[s], prefs.size); });

  let g = null, sel = null, moveMode = 'normal', advRoll = null, chargeState = null, failedCharge = null, grenadeMode = false, busy = false, disp = {}, hover = null;

  /* ---------- โครงหน้า ---------- */
  const tabsHTML = (id, items) => '<div class="tabs" id="' + id + '">' + items.map(i => '<button type="button" class="tab" data-v="' + i[0] + '">' + i[1] + '</button>').join('') + '</div>';
  const facOpts = FAC.map(k => '<option value="' + k + '">' + esc(TT.ARMIES[k].name) + ' (' + TT.ARMIES[k].th + ')</option>').join('');
  const armyBox = s => '<div class="tt-army ' + SIDE_CLS[s] + '" data-side="' + s + '">' +
    '<div class="tt-army-head"><i class="tt-dot ' + SIDE_CLS[s] + '"></i><b>' + SIDE_NAME[s] + '</b><span class="tt-who" data-who="' + s + '"></span>' +
    '<select class="tt-fac" data-side="' + s + '" aria-label="เลือกกองทัพ' + SIDE_NAME[s] + '">' + facOpts + '</select></div>' +
    '<div class="tt-rule" data-rule="' + s + '"></div>' +
    '<div class="tt-pts"><div class="tt-bar"><i data-bar="' + s + '"></i></div><span data-pts="' + s + '"></span></div>' +
    '<div class="tt-roster" data-roster="' + s + '"></div>' +
    '<div class="tt-army-btns"><button type="button" class="btn btn-ghost btn-sm" data-auto="' + s + '">' + ic('refresh') + ' จัดทัพอัตโนมัติ</button><button type="button" class="btn btn-ghost btn-sm" data-clear="' + s + '">' + ic('x') + ' ล้าง</button></div>' +
    '</div>';
  app.innerHTML =
    '<details class="tt-setup-wrap" id="tt-setup-wrap" open><summary>' + ic('cog') + ' ตั้งค่าเกมและจัดทัพ <small id="tt-sum"></small></summary>' +
    '<div class="tt-setup" id="tt-setup">' +
      '<div class="tt-opt"><span>ขนาดเกม</span>' + tabsHTML('tt-size', Object.keys(TT.SIZES).map(k => [k, (+k).toLocaleString() + ' แต้ม'])) + '</div>' +
      '<div class="tt-opt"><span>สนามรบ</span>' + tabsHTML('tt-map', Object.keys(TT.MAPS).map(k => [k, TT.MAPS[k].name]).concat([['random', ic('dice') + ' สุ่ม']])) + '</div>' +
      '<div class="tt-opt"><span>คู่ต่อสู้</span>' + tabsHTML('tt-opp', [['ai', ic('cog') + ' คอมพิวเตอร์'], ['hot', ic('users') + ' เพื่อน (เครื่องเดียวกัน)'], ['watch', ic('eye') + ' ดูบอทสู้กัน']]) + '</div>' +
      '<div class="tt-opt" id="tt-side-opt"><span>คุณคุม</span>' + tabsHTML('tt-side', [['0', '<i class="tt-dot blue"></i> ฝ่ายน้ำเงิน'], ['1', '<i class="tt-dot red"></i> ฝ่ายแดง']]) + '</div>' +
      '<div class="tt-opt" id="tt-diff-opt"><span>ความยากของบอท</span>' + tabsHTML('tt-diff', Object.keys(TT.DIFF).map(k => [k, TT.DIFF[k]])) + '</div>' +
      '<div class="tt-opt"><span>ความเร็วแอนิเมชัน</span>' + tabsHTML('tt-speed', [['1.6', 'ช้า'], ['1', 'ปกติ'], ['0.45', 'เร็ว'], ['0.15', 'เร็วมาก']]) + '</div>' +
      '<p class="tt-note" id="tt-note"></p>' +
      '<div class="tt-armies">' + armyBox(0) + '<div class="tt-vs">VS</div>' + armyBox(1) + '</div>' +
    '</div></details>' +
    '<div class="tt-main">' +
      '<div class="tt-board-wrap"><div class="tt-scroll"><svg class="tt-board" id="tt-board" role="img" aria-label="กระดานจำลอง"></svg></div>' +
        '<div class="tt-dice" id="tt-dice" hidden></div><div class="tt-toast" id="tt-toast" hidden></div><div class="tt-over" id="tt-over" hidden></div></div>' +
      '<aside class="tt-panel">' +
        '<div class="tt-score"><div class="blue"><small id="tt-n0">ฝ่ายน้ำเงิน</small><b id="tt-vp0">0</b><span>VP · <em id="tt-cp0">0</em> CP</span></div><div class="tt-round"><small>รอบ</small><b id="tt-round">1/5</b></div><div class="red"><small id="tt-n1">ฝ่ายแดง</small><b id="tt-vp1">0</b><span>VP · <em id="tt-cp1">0</em> CP</span></div></div>' +
        '<div class="tt-turn" id="tt-turn"></div>' +
        '<ol class="tt-phases" id="tt-phases">' + ['deploy'].concat(TT.PHASES).map(p => '<li data-p="' + p + '">' + TT.PHASE_TH[p] + '</li>').join('') + '</ol>' +
        '<p class="tt-hint" id="tt-hint"></p>' +
        '<div class="tt-actions" id="tt-actions"></div>' +
        '<div class="tt-unit" id="tt-unit"></div>' +
        '<details class="tt-log-wrap" open><summary>บันทึกการรบ</summary><ol class="tt-log" id="tt-log" aria-live="polite"></ol></details>' +
      '</aside>' +
    '</div>';

  const svg = $('#tt-board');

  /* ---------- ตัวช่วย ---------- */
  const isHuman = side => prefs.opp === 'hot' || (prefs.opp === 'ai' && side === prefs.me);
  const U = id => g.units.find(u => u.id === id);
  const pos = u => disp[u.id] || u;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms * prefs.speed));
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const facName = s => TT.ARMIES[g ? g.armies[s] : prefs.armies[s]].name;
  function toast(msg, bad) {
    const t = $('#tt-toast'); t.textContent = msg; t.hidden = false; t.classList.toggle('bad', !!bad);
    clearTimeout(toast.tm); toast.tm = setTimeout(() => { t.hidden = true; }, 2800);
  }
  function svgPoint(evt) {
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: p.x, y: p.y };
  }
  const inProgress = () => g && !g.over && g.phase !== 'deploy';
  function syncAI() { if (g) { g.ai = [!isHuman(0), !isHuman(1)]; g.diff = [prefs.diff, prefs.diff]; } }

  /* ---------- ตั้งค่าเกม ---------- */
  function tabs(id, val, set) {
    const box = $('#' + id);
    const upd = () => box.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('active', String(val()) === b.dataset.v));
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b || String(val()) === b.dataset.v) return;
      if (set(b.dataset.v) === false) return;
      save(); upd();
    });
    upd();
    return upd;
  }
  /* เปลี่ยนสิ่งที่กระทบสนาม (ขนาด/ฉาก/ทัพ) — ถ้ากำลังเล่นอยู่ต้องยืนยันก่อน */
  function confirmRestart() { return !inProgress() || window.confirm('เกมกำลังเล่นอยู่ — เปลี่ยนค่านี้จะเริ่มเกมใหม่ (กลับไปขั้นวางกำลัง) ตกลงไหม?'); }
  tabs('tt-size', () => prefs.size, v => {
    if (!confirmRestart()) return false;
    prefs.size = +v;
    [0, 1].forEach(s => { if (TT.rosterPts(prefs.armies[s], prefs.rosters[s]) > prefs.size || TT.rosterPts(prefs.armies[s], prefs.rosters[s]) < prefs.size * 0.6) prefs.rosters[s] = TT.autoRoster(prefs.armies[s], prefs.size); });
    renderSetup(); newGame();
  });
  tabs('tt-map', () => prefs.map, v => { if (!confirmRestart()) return false; prefs.map = v; newGame(); });
  /* ฝ่าย/คู่ต่อสู้/ความยาก/ความเร็ว เปลี่ยนได้ทันทีระหว่างเกม (real-time) ไม่ต้องเริ่มใหม่ */
  tabs('tt-opp', () => prefs.opp, v => { prefs.opp = v; liveSwitch(); });
  tabs('tt-side', () => prefs.me, v => { prefs.me = +v; liveSwitch(); });
  tabs('tt-diff', () => prefs.diff, v => { prefs.diff = v; syncAI(); if (g) TT.log(g, 'ปรับความยากของบอทเป็น "' + TT.DIFF[v] + '"', 'strat'); if (g) renderPanel(); });
  tabs('tt-speed', () => prefs.speed, v => { prefs.speed = +v; });
  function liveSwitch() {
    save(); syncAI(); renderSetup();
    if (!g) return;
    TT.log(g, prefs.opp === 'watch' ? 'สลับเป็นโหมดดูบอทสู้กัน' : prefs.opp === 'hot' ? 'สลับเป็นเล่นกับเพื่อน' : 'คุณคุม' + SIDE_NAME[prefs.me] + ' ปะทะคอมพิวเตอร์', 'strat');
    sel = null; chargeState = null; failedCharge = null; grenadeMode = false;
    if (g.phase === 'deploy') { render(); return; }
    /* ถ้าตาปัจจุบันกลายเป็นของบอทและไม่มีอะไรเล่นอยู่ → ให้บอทเล่นต่อทันที */
    if (!busy && !g.over && !isHuman(g.active)) enterPhase(); else render();
  }
  app.querySelectorAll('.tt-fac').forEach(sb => sb.addEventListener('change', () => {
    const s = +sb.dataset.side;
    if (!confirmRestart()) { sb.value = prefs.armies[s]; return; }
    prefs.armies[s] = sb.value; prefs.rosters[s] = TT.autoRoster(sb.value, prefs.size); save(); renderSetup(); newGame();
  }));
  app.querySelector('.tt-armies').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const s = +(b.dataset.auto || b.dataset.clear || b.closest('[data-side]').dataset.side);
    const fac = prefs.armies[s];
    if (!confirmRestart()) return;
    if (b.dataset.auto != null) prefs.rosters[s] = TT.autoRoster(fac, prefs.size);
    else if (b.dataset.clear != null) prefs.rosters[s] = [];
    else if (b.dataset.add) {
      const d = TT.unitDef(fac, b.dataset.add);
      if (TT.rosterPts(fac, prefs.rosters[s]) + d.pts > prefs.size) { toast('แต้มเกิน! เหลือ ' + (prefs.size - TT.rosterPts(fac, prefs.rosters[s])) + ' แต้ม แต่ ' + d.name + ' ใช้ ' + d.pts, true); return; }
      if (d.epic && prefs.rosters[s].indexOf(d.key) > -1) { toast(d.name + ' เป็นตัวละครที่มีคนเดียว (Epic Hero) ใส่ได้ 1 ครั้ง', true); return; }
      prefs.rosters[s].push(d.key);
    } else if (b.dataset.rem) {
      const i = prefs.rosters[s].lastIndexOf(b.dataset.rem); if (i > -1) prefs.rosters[s].splice(i, 1);
    } else return;
    save(); renderSetup(); newGame();
  });
  function renderSetup() {
    [0, 1].forEach(s => {
      const fac = prefs.armies[s], A = TT.ARMIES[fac], R = prefs.rosters[s], pts = TT.rosterPts(fac, R);
      app.querySelector('.tt-fac[data-side="' + s + '"]').value = fac;
      app.querySelector('[data-rule="' + s + '"]').innerHTML = '<b>' + ic('star') + ' ' + esc(A.rule.name) + '</b> ' + esc(A.rule.desc);
      app.querySelector('[data-bar="' + s + '"]').style.width = Math.min(100, pts / prefs.size * 100) + '%';
      app.querySelector('[data-pts="' + s + '"]').innerHTML = '<b>' + pts.toLocaleString() + '</b> / ' + prefs.size.toLocaleString() + ' แต้ม · ' + R.length + ' ยูนิต';
      app.querySelector('[data-who="' + s + '"]').textContent = isHuman(s) ? (prefs.opp === 'hot' ? 'ผู้เล่น ' + (s + 1) : 'คุณ') : 'บอท (' + TT.DIFF[prefs.diff] + ')';
      app.querySelector('[data-roster="' + s + '"]').innerHTML = A.units.map(u => {
        const n = R.filter(k => k === u.key).length, left = prefs.size - pts;
        return '<div class="tt-ru' + (n ? ' on' : '') + '"><img src="../images/' + u.img + '" alt="" loading="lazy"><div><b>' + esc(u.name) + (u.epic ? ' <i class="tt-epic" title="Epic Hero ใส่ได้ 1 ครั้ง">★</i>' : '') + '</b><small>' + KIND[u.kind] + ' · ' + u.models + ' โมเดล · M' + u.M + ' T' + u.T + ' Sv' + (u.Sv > 6 ? '–' : u.Sv + '+') + ' W' + u.W + '</small></div>' +
          '<span class="tt-ru-pts">' + u.pts + '</span>' +
          '<span class="tt-ru-ctl"><button type="button" data-rem="' + u.key + '" aria-label="ลด ' + esc(u.name) + '"' + (n ? '' : ' disabled') + '>−</button><em>' + n + '</em><button type="button" data-add="' + u.key + '" aria-label="เพิ่ม ' + esc(u.name) + '"' + (u.pts > left ? ' disabled' : '') + '>+</button></span></div>';
      }).join('');
    });
    $('#tt-side-opt').hidden = prefs.opp !== 'ai';
    $('#tt-diff-opt').hidden = prefs.opp === 'hot';
    $('#tt-sum').textContent = '— ' + TT.SIZES[prefs.size].name + ' · ' + (TT.MAPS[prefs.map] ? TT.MAPS[prefs.map].name : 'สุ่มฉาก') + ' · ' + TT.ARMIES[prefs.armies[0]].name + ' vs ' + TT.ARMIES[prefs.armies[1]].name;
    const S = TT.SIZES[prefs.size];
    $('#tt-note').innerHTML = ic('info') + ' โต๊ะ ' + S.board[0] + '" × ' + S.board[1] + '" · เขตวางกำลังลึก ' + S.zone + '" · ' + (TT.MAPS[prefs.map] ? TT.MAPS[prefs.map].desc : 'สุ่มวางฉากแบบสมมาตรใหม่ทุกเกม') + ' — ทุกการเปลี่ยนแปลงจะแสดงบนกระดานทันที';
  }

  /* ---------- วาดกระดาน ---------- */
  function drawStatic() {
    const W = g.board.w, H = g.board.h;
    svg.setAttribute('viewBox', '-0.5 -0.5 ' + (W + 1) + ' ' + (H + 1));
    svg.setAttribute('aria-label', 'กระดานจำลอง ' + W + ' x ' + H + ' นิ้ว');
    svg.innerHTML = '';
    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: 'tt-grid', width: 1, height: 1, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: 'M1 0H0V1', fill: 'none', class: 'tt-gridline' }, pat);
    const hatch = el('pattern', { id: 'tt-hatch', width: 0.6, height: 0.6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 0.25, height: 0.6, class: 'tt-hatchline' }, hatch);
    const cp = el('clipPath', { id: 'tt-clip', clipPathUnits: 'objectBoundingBox' }, defs); el('circle', { cx: 0.5, cy: 0.5, r: 0.5 }, cp);
    el('rect', { x: 0, y: 0, width: W, height: H, class: 'tt-felt tt-map-' + g.map }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#tt-grid)' }, svg);
    [0, 1].forEach(s => { const z = TT.zoneOf(g, s); el('rect', { x: z.x, y: 0, width: z.w, height: H, class: 'tt-zone ' + SIDE_CLS[s] + (g.phase === 'deploy' ? ' deploying' : '') }, svg); });
    g.terrain.forEach(t => {
      const gg = el('g', { class: 'tt-terrain ' + t.type }, svg);
      el('rect', { x: t.x, y: t.y, width: t.w, height: t.h, rx: 0.3 }, gg);
      if (t.type === 'dense') el('rect', { x: t.x, y: t.y, width: t.w, height: t.h, rx: 0.3, fill: 'url(#tt-hatch)' }, gg);
      const tx = el('text', { x: t.x + t.w / 2, y: t.y + t.h / 2 + 0.25, 'text-anchor': 'middle' }, gg); tx.textContent = t.name;
      const ti = el('title', {}, gg); ti.textContent = t.name + (t.type === 'dense' ? ' — บังสายตาและให้ที่กำบัง' : ' — ให้ที่กำบัง (เซฟ +1)');
    });
    el('g', { id: 'tt-objs' }, svg);
    el('g', { id: 'tt-over-g' }, svg);
    el('g', { id: 'tt-toks' }, svg);
    el('g', { id: 'tt-fx' }, svg);
  }
  function drawObjectives() {
    const box = svg.querySelector('#tt-objs'); box.innerHTML = '';
    const ctrl = TT.control(g);
    g.objectives.forEach((o, i) => {
      const c = ctrl[i], cls = c.owner == null ? '' : SIDE_CLS[c.owner];
      const gg = el('g', { class: 'tt-obj ' + cls }, box);
      el('circle', { cx: o.x, cy: o.y, r: TT.OBJ_RANGE, class: 'ring' }, gg);
      el('circle', { cx: o.x, cy: o.y, r: 0.8, class: 'core' }, gg);
      const t = el('text', { x: o.x, y: o.y + 0.32, 'text-anchor': 'middle' }, gg); t.textContent = i + 1;
      const title = el('title', {}, gg); title.textContent = 'จุดยึด ' + (i + 1) + ' — OC น้ำเงิน ' + c.oc[0] + ' / แดง ' + c.oc[1];
    });
  }
  function drawTokens() {
    const box = svg.querySelector('#tt-toks'); box.innerHTML = '';
    g.units.forEach(u => {
      if ((u.dead && !disp[u.id]) || u.x < -50) return;
      const p = pos(u);
      const oath = g.oath.indexOf(u.id) > -1;
      const gg = el('g', { class: 'tt-tok ' + SIDE_CLS[u.side] + (sel === u ? ' sel' : '') + (u.dead ? ' dead' : '') + (u.f.shocked ? ' shocked' : '') + (oath ? ' oath' : '') + (TT.waaaghOn(g, u.side) ? ' waaagh' : '') + actedCls(u), transform: 'translate(' + p.x + ' ' + p.y + ')', 'data-id': u.id, tabindex: 0, role: 'button', 'aria-label': u.name + ' ' + SIDE_NAME[u.side] }, box);
      el('circle', { r: u.r + 0.55, class: 'hit' }, gg);
      el('circle', { r: u.r + 0.12, class: 'base' }, gg);
      el('image', { href: '../images/' + u.img, x: -u.r, y: -u.r, width: u.r * 2, height: u.r * 2, 'clip-path': 'url(#tt-clip)', preserveAspectRatio: 'xMidYMin slice' }, gg);
      el('circle', { r: u.r, class: 'rim' }, gg);
      if (oath) el('circle', { r: u.r + 0.35, class: 'oathring' }, gg);
      const tot = u.models > 1 ? u.models : u.wl;
      const bw = Math.max(1.6, u.r * 1.6), frac = u.models > 1 ? u.models / u.start : u.wl / u.W;
      el('rect', { x: -bw / 2, y: u.r + 0.25, width: bw, height: 0.32, rx: 0.16, class: 'hpbg' }, gg);
      el('rect', { x: -bw / 2, y: u.r + 0.25, width: bw * frac, height: 0.32, rx: 0.16, class: 'hp' }, gg);
      const bd = el('g', { class: 'badge', transform: 'translate(' + (u.r * 0.72) + ' ' + (-u.r * 0.72) + ')' }, gg);
      el('circle', { r: 0.55 }, bd);
      const t = el('text', { y: 0.22, 'text-anchor': 'middle' }, bd); t.textContent = tot;
      const title = el('title', {}, gg); title.textContent = u.name + ' (' + u.pts + ' แต้ม)' + (u.models > 1 ? ' — ' + u.models + ' โมเดล' : ' — แผลเหลือ ' + u.wl + '/' + u.W);
    });
  }
  function actedCls(u) {
    if (!g || u.side !== g.active || u.dead || !isHuman(u.side)) return '';
    const done = (g.phase === 'movement' && u.f.didMove) || (g.phase === 'shooting' && (u.f.shot || !canShootAny(u))) || (g.phase === 'charge' && (u.f.chargeTried || !TT.canCharge(g, u)));
    return done ? ' done' : '';
  }
  const canShootAny = u => TT.enemiesOf(g, u).some(v => TT.shotInfo(g, u, v)) || (TT.canGrenade(g, u) && TT.grenadeTargets(g, u).length);

  function drawOverlay() {
    const box = svg.querySelector('#tt-over-g'); if (!box) return; box.innerHTML = '';
    if (g.phase === 'deploy' && sel && isHuman(sel.side) && hover) {
      const err = TT.deployCheck(g, sel, hover.x, hover.y);
      el('circle', { cx: hover.x, cy: hover.y, r: sel.r, class: 'tt-ghost ' + (err ? 'bad' : 'ok') }, box);
      return;
    }
    if (!sel || sel.dead || busy) return;
    const p = pos(sel), mine = sel.side === g.active && isHuman(sel.side);
    if (g.phase === 'movement' && mine && !sel.f.didMove) {
      const max = sel.M + (moveMode === 'advance' && advRoll ? advRoll : 0);
      el('circle', { cx: p.x, cy: p.y, r: max, class: 'tt-range move' }, box);
      TT.enemiesOf(g, sel).forEach(v => el('circle', { cx: v.x, cy: v.y, r: v.r + TT.ENGAGE, class: 'tt-range engage' }, box));
    }
    if (g.phase === 'shooting' && mine && grenadeMode) {
      el('circle', { cx: p.x, cy: p.y, r: 8 + sel.r, class: 'tt-range shoot' }, box);
      TT.grenadeTargets(g, sel).forEach(v => el('circle', { cx: v.x, cy: v.y, r: v.r + 0.45, class: 'tt-target' }, box));
    } else if (g.phase === 'shooting' && mine && sel.ranged) {
      el('circle', { cx: p.x, cy: p.y, r: sel.ranged[1] + sel.r, class: 'tt-range shoot' }, box);
      TT.enemiesOf(g, sel).forEach(v => {
        const s = TT.shotInfo(g, sel, v);
        el('line', { x1: p.x, y1: p.y, x2: v.x, y2: v.y, class: 'tt-los ' + (s ? (s.cover ? 'cover' : 'ok') : 'no') }, box);
        if (s) el('circle', { cx: v.x, cy: v.y, r: v.r + 0.45, class: 'tt-target' }, box);
      });
    }
    if (g.phase === 'charge' && mine) {
      el('circle', { cx: p.x, cy: p.y, r: 12 + sel.r, class: 'tt-range charge' }, box);
      if (chargeState && chargeState.u === sel) chargeState.targets.forEach(v => el('circle', { cx: v.x, cy: v.y, r: v.r + 0.45, class: 'tt-target' }, box));
    }
    if (hover && g.phase === 'movement' && mine && !sel.f.didMove) {
      const max = sel.M + (moveMode === 'advance' && advRoll ? advRoll : 0);
      const err = TT.moveCheck(g, sel, hover.x, hover.y, max);
      el('line', { x1: p.x, y1: p.y, x2: hover.x, y2: hover.y, class: 'tt-path ' + (err ? 'bad' : 'ok') }, box);
      el('circle', { cx: hover.x, cy: hover.y, r: sel.r, class: 'tt-ghost ' + (err ? 'bad' : 'ok') }, box);
      const t = el('text', { x: hover.x, y: hover.y - sel.r - 0.4, 'text-anchor': 'middle', class: 'tt-dist' }, box);
      t.textContent = Math.hypot(hover.x - p.x, hover.y - p.y).toFixed(1) + '"';
    }
  }

  /* ---------- แผงข้อมูล ---------- */
  function unitCard(u) {
    if (!u) return '<p class="muted">แตะโทเคนบนกระดานเพื่อดูข้อมูลยูนิต</p>';
    const kws = x => x[7].length ? ' <small title="' + esc(x[7].map(k => k.toUpperCase() + ': ' + (KW_TH[k] || '')).join(' · ')) + '">[' + x[7].join(', ').toUpperCase() + ']</small>' : '';
    const w = (x, melee) => x ? '<tr><td>' + esc(x[0]) + kws(x) + '</td><td>' + (melee ? 'ประชิด' : x[1] + '"') + '</td><td>' + x[2] + '</td><td>' + (x[3] ? x[3] + '+' : 'N/A') + '</td><td>' + x[4] + '</td><td>' + (x[5] || 0) + '</td><td>' + x[6] + '</td></tr>' : '';
    const tags = [];
    if (u.dead) tags.push('<span class="chip bad">ถูกทำลาย</span>');
    if (u.f.shocked) tags.push('<span class="chip bad">ขวัญแตก</span>');
    if (!u.dead && g.phase !== 'deploy' && TT.isEngaged(g, u)) tags.push('<span class="chip">ติดพัน</span>');
    if (u.f.advanced) tags.push('<span class="chip">Advance แล้ว</span>');
    if (u.f.fellBack) tags.push('<span class="chip">ถอยแล้ว</span>');
    if (u.f.charged) tags.push('<span class="chip">ชาร์จสำเร็จ</span>');
    if (g.oath.indexOf(u.id) > -1) tags.push('<span class="chip bad">เป้า Oath of Moment</span>');
    const abs = u.ab.map(a => AB[a]).concat(u.fnp ? ['Feel No Pain ' + u.fnp + '+: ทอยกันแผลได้ทีละแผล'] : []);
    return '<div class="tt-uhead"><img src="../images/' + u.img + '" alt=""><div><b>' + esc(u.name) + '</b><small class="' + SIDE_CLS[u.side] + '">' + SIDE_NAME[u.side] + ' · ' + esc(TT.ARMIES[u.fac].name) + ' · ' + KIND[u.kind] + ' · ' + u.pts + ' แต้ม</small>' +
      '<small>' + (u.models > 1 ? 'เหลือ ' + u.models + '/' + u.start + ' โมเดล' : 'แผลเหลือ ' + u.wl + '/' + u.W) + '</small></div></div>' +
      (tags.length ? '<div class="tt-tags">' + tags.join('') + '</div>' : '') +
      '<div class="tt-stats">' + [['M', u.M + '"'], ['T', u.T], ['Sv', u.Sv > 6 ? '–' : u.Sv + '+'], ['InSv', u.inv ? u.inv + '+' : '–'], ['W', u.W], ['Ld', u.Ld + '+'], ['OC', u.OC]].map(s => '<span><small>' + s[0] + '</small><b>' + s[1] + '</b></span>').join('') + '</div>' +
      '<table class="tt-w"><thead><tr><th>อาวุธ</th><th>ระยะ</th><th>A</th><th>BS/WS</th><th>S</th><th>AP</th><th>D</th></tr></thead><tbody>' + w(u.ranged) + w(u.melee, true) + '</tbody></table>' +
      (abs.length ? '<ul class="tt-abs">' + abs.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul>' : '');
  }
  const HINT = {
    deploy: 'ขั้นวางกำลัง: แตะยูนิตของคุณ แล้วแตะในเขตสีของฝ่ายตัวเองเพื่อย้าย (ยานใหญ่เข้าซากตึกไม่ได้) พร้อมแล้วกด "เริ่มรบ!" · เปลี่ยนทัพ/ฉากด้านบนได้ทันที',
    command: 'เฟสสั่งการ: ได้ CP และทดสอบขวัญให้ยูนิตที่เหลือครึ่งกำลัง ตั้งแต่รอบ 2 นับแต้มจุดที่คุมอยู่ (จุดละ 5 VP สูงสุด 15)',
    movement: 'เลือกยูนิตของคุณ แล้วแตะจุดบนกระดานเพื่อเดิน (วงสีฟ้า = ระยะเดิน) จบในวงแดงรอบศัตรูไม่ได้ · ยูนิตที่ติดพันต้อง "ถอย"',
    shooting: 'เลือกยูนิตของคุณ แล้วแตะศัตรูที่มีวงสีทองเพื่อยิง · เส้นเขียว = มองเห็น, เหลือง = ศัตรูได้ที่กำบัง (เซฟ +1), แดง = ยิงไม่ได้ · ทหารราบขว้างระเบิดได้ (1 CP)',
    charge: 'เลือกยูนิตที่อยู่ห่างศัตรูไม่เกิน 12" แล้วกด "ประกาศชาร์จ" ทอย 2D6 จากนั้นเลือกเป้าที่ไปถึง · ทอยไม่ถึงใช้ Command Re-roll ได้ (1 CP)',
    fight: 'กด "เริ่มต่อสู้" ยูนิตที่ชาร์จสำเร็จได้สู้ก่อน แล้วผลัดกันจนครบทุกยูนิตที่ติดพัน · ฆ่าเป้าหมดแล้วจะ Consolidate เข้าหาศัตรูใกล้ ๆ 3"'
  };
  function renderPanel() {
    [0, 1].forEach(s => { $('#tt-vp' + s).textContent = g.vp[s]; $('#tt-cp' + s).textContent = g.cp[s]; $('#tt-n' + s).textContent = facName(s); });
    $('#tt-round').textContent = Math.min(g.round, TT.ROUNDS) + '/' + TT.ROUNDS;
    const who = s => isHuman(s) ? (prefs.opp === 'hot' ? ' — ผู้เล่น ' + (s + 1) : ' — คุณ') : ' — บอท (' + TT.DIFF[prefs.diff] + ') กำลังเล่น…';
    $('#tt-turn').innerHTML = g.over ? '<b>' + (g.winner == null ? 'เสมอ!' : SIDE_NAME[g.winner] + ' (' + esc(facName(g.winner)) + ') ชนะ!') + '</b>' :
      g.phase === 'deploy' ? '<b>ขั้นวางกำลัง</b> — ' + SIDE_NAME[g.first] + ' ได้เริ่มก่อน (ทอยแย่งแล้ว)' :
      'ตาของ <b class="' + SIDE_CLS[g.active] + '">' + SIDE_NAME[g.active] + '</b> (' + esc(facName(g.active)) + ')' + who(g.active);
    const order = ['deploy'].concat(TT.PHASES);
    $('#tt-phases').querySelectorAll('li').forEach(li => { const i = order.indexOf(li.dataset.p), c = order.indexOf(g.phase); li.className = g.over ? 'past' : i < c ? 'past' : i === c ? 'now' : ''; });
    $('#tt-hint').textContent = g.over ? 'กด "เล่นอีกครั้ง" หรือปรับทัพ/ฉากด้านบนแล้วเล่นใหม่' : (isHuman(g.active) || g.phase === 'deploy' ? HINT[g.phase] || '' : '');
    const A = [];
    if (g.phase === 'deploy') {
      A.push('<button type="button" class="btn btn-primary btn-sm" data-a="battle">' + ic('swords') + ' เริ่มรบ!</button>');
      A.push('<button type="button" class="btn btn-ghost btn-sm" data-a="redeploy">' + ic('refresh') + ' สุ่มตำแหน่งใหม่</button>');
    } else if (!g.over && isHuman(g.active) && !busy) {
      const side = g.active, mine = sel && sel.side === side;
      if (g.phase === 'movement' && TT.rule(g, side) === 'waaagh' && !g.waaagh[side]) A.push('<button type="button" class="btn btn-primary btn-sm tt-waaagh" data-a="waaagh">' + ic('zap') + ' WAAAGH! (ครั้งเดียว)</button>');
      if (g.phase === 'movement' && mine && !sel.f.didMove) {
        if (TT.isEngaged(g, sel)) A.push('<button type="button" class="btn btn-ghost btn-sm active" disabled>' + ic('arrow-left') + ' ติดพัน: เดินได้แบบถอย (Fall Back)</button>');
        else {
          A.push('<button type="button" class="btn btn-ghost btn-sm' + (moveMode === 'normal' ? ' active' : '') + '" data-a="normal">เดินปกติ ' + sel.M + '"</button>');
          A.push('<button type="button" class="btn btn-ghost btn-sm' + (moveMode === 'advance' ? ' active' : '') + '" data-a="advance">' + (advRoll ? 'Advance +' + advRoll + '" (ทอยแล้ว)' : 'Advance (ทอย D6)') + '</button>');
        }
        A.push('<button type="button" class="btn btn-ghost btn-sm" data-a="stay">อยู่กับที่</button>');
      }
      if (g.phase === 'shooting' && mine && TT.canGrenade(g, sel) && TT.grenadeTargets(g, sel).length) A.push('<button type="button" class="btn btn-ghost btn-sm' + (grenadeMode ? ' active' : '') + '" data-a="grenade">' + ic('fire') + ' ' + (grenadeMode ? 'เลือกเป้าระเบิด…' : 'ขว้างระเบิด (1 CP)') + '</button>');
      if (g.phase === 'charge' && mine && TT.canCharge(g, sel) && !sel.f.chargeTried) A.push('<button type="button" class="btn btn-primary btn-sm" data-a="charge">' + ic('dice') + ' ประกาศชาร์จ (ทอย 2D6)</button>');
      if (g.phase === 'charge' && failedCharge && failedCharge === sel && TT.stratOK(g, side, 'reroll', sel)) A.push('<button type="button" class="btn btn-primary btn-sm" data-a="reroll">' + ic('refresh') + ' Command Re-roll (1 CP)</button>');
      if (g.phase === 'charge' && chargeState && chargeState.u === sel) A.push('<button type="button" class="btn btn-ghost btn-sm" data-a="nocharge">ไม่ชาร์จ</button>');
      if (g.phase === 'fight') A.push('<button type="button" class="btn btn-primary btn-sm" data-a="fight">' + ic('sword') + ' เริ่มต่อสู้</button>');
      if (g.phase !== 'fight' && g.phase !== 'command') A.push('<button type="button" class="btn btn-primary btn-sm tt-next" data-a="next">จบเฟส' + TT.PHASE_TH[g.phase] + ' ' + ic('arrow-right') + '</button>');
    }
    if (g.over) A.push('<button type="button" class="btn btn-primary btn-sm" data-a="again">' + ic('refresh') + ' เล่นอีกครั้ง</button>');
    else if (inProgress()) A.push('<button type="button" class="btn btn-ghost btn-sm" data-a="restart">' + ic('x') + ' เริ่มใหม่</button>');
    $('#tt-actions').innerHTML = A.join('');
    $('#tt-unit').innerHTML = unitCard(sel);
    const L = g.log.slice(-80).reverse();
    $('#tt-log').innerHTML = L.map(l => '<li class="' + l.kind + ' ' + SIDE_CLS[l.side] + '"><small>R' + l.r + ' · ' + (TT.PHASE_TH[l.phase] || '') + '</small> ' + esc(l.text) + '</li>').join('');
    const ov = $('#tt-over');
    if (g.over) {
      const lost = s => g.units.filter(u => u.side === s && u.dead).reduce((a, u) => a + u.pts, 0);
      ov.innerHTML = '<div><b>' + (g.winner == null ? 'เสมอ!' : SIDE_NAME[g.winner] + ' ชนะ!') + '</b><p>' + esc(facName(0)) + ' <strong>' + g.vp[0] + '</strong> : <strong>' + g.vp[1] + '</strong> ' + esc(facName(1)) + ' VP</p>' +
        '<p class="muted">ทำลายศัตรูได้ ' + lost(1) + ' แต้ม : ' + lost(0) + ' แต้ม</p><button type="button" class="btn btn-primary btn-sm" data-a="again">' + ic('refresh') + ' เล่นอีกครั้ง</button> <button type="button" class="btn btn-ghost btn-sm" data-a="swap">' + ic('refresh') + ' สลับทัพแล้วเล่น</button></div>';
      ov.hidden = false;
    } else ov.hidden = true;
  }
  function render() { drawObjectives(); drawTokens(); drawOverlay(); renderPanel(); }

  /* ---------- ลูกเต๋าและเอฟเฟกต์ ---------- */
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const die = (v, cls) => '<span class="tt-die ' + (cls || '') + '">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => '<i' + (PIPS[v].indexOf(i) > -1 ? ' class="on"' : '') + '></i>').join('') + '</span>';
  async function showDice(rows, title, note) {
    const box = $('#tt-dice');
    box.innerHTML = '<b>' + esc(title) + '</b>' + rows.map(r => '<div class="tt-drow"><span>' + r.label + '</span><div>' + (r.dice.length > 40 ? r.dice.slice(0, 40) : r.dice).map(d => die(d.r, (d.ok ? 'ok' : 'no') + (d.crit ? ' crit' : ''))).join('') + (r.dice.length > 40 ? '<small>+' + (r.dice.length - 40) + '</small>' : '') + '</div><em>' + r.sum + '</em></div>').join('') + (note ? '<small class="tt-dnote">' + esc(note) + '</small>' : '');
    box.hidden = false;
    box.querySelectorAll('.tt-die').forEach((d, i) => { d.style.animationDelay = (reduce ? 0 : Math.min(i * 18, 500) * prefs.speed) + 'ms'; });
    await wait(900 + rows.length * 450);
  }
  function hideDice() { $('#tt-dice').hidden = true; }
  function floatText(x, y, text, cls) {
    const fx = svg.querySelector('#tt-fx'), t = el('text', { x, y, 'text-anchor': 'middle', class: 'tt-float ' + (cls || '') }, fx);
    t.textContent = text; setTimeout(() => t.remove(), 1600 * prefs.speed + 200);
  }
  async function animMove(u, from, to, ms) {
    disp[u.id] = { x: from.x, y: from.y };
    drawTokens();
    const dur = reduce || document.hidden ? 0 : (ms || 520) * prefs.speed, t0 = performance.now();
    await new Promise(res => {
      let done = false;
      const finish = () => { if (done) return; done = true; setPos(1); res(); };
      const setPos = k => {
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const x = from.x + (to.x - from.x) * e, y = from.y + (to.y - from.y) * e;
        disp[u.id] = { x, y };
        const node = svg.querySelector('.tt-tok[data-id="' + u.id + '"]'); if (node) node.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
      };
      if (!dur) return finish();
      const step = now => { if (done) return; const k = Math.min(1, (now - t0) / dur); if (k < 1) { setPos(k); requestAnimationFrame(step); } else finish(); };
      requestAnimationFrame(step);
      setTimeout(finish, dur + 150);
    });
    delete disp[u.id];
  }
  async function animShot(a, b, melee) {
    const fx = svg.querySelector('#tt-fx'), n = melee ? 1 : 5;
    for (let i = 0; i < n; i++) {
      const off = (Math.random() - 0.5) * b.r;
      const l = el('line', { x1: a.x, y1: a.y, x2: b.x + off, y2: b.y + off, class: melee ? 'tt-slash' : 'tt-tracer' }, fx);
      setTimeout(() => l.remove(), 420 * prefs.speed + 60);
      await wait(70);
    }
    const f = el('circle', { cx: b.x, cy: b.y, r: b.r + 0.3, class: 'tt-flash' }, fx); setTimeout(() => f.remove(), 500 * prefs.speed + 60);
  }
  async function playAttack(ev, melee) {
    const a = U(ev.u), b = U(ev.v), r = ev.res, G = g;
    if (!a || !b) return;
    await animShot(a, b, melee);
    const rows = [{ label: r.need.hit ? 'Hit ' + r.need.hit + '+' : 'Torrent', dice: r.hit, sum: r.hits + ' โดน' }];
    if (r.wound.length) rows.push({ label: 'Wound ' + r.need.wound + '+', dice: r.wound, sum: r.wounds + ' ทำแผล' });
    if (r.save.length) rows.push({ label: 'Save ' + (r.need.save > 6 ? '–' : r.need.save + '+'), dice: r.save, sum: r.unsaved + ' ไม่ผ่าน' });
    const why = (ev.info && ev.info.why ? ev.info.why : []).concat(r.notes || []);
    await showDice(rows, a.name + ' → ' + b.name + (melee ? ' (ประชิด)' : ''), why.join(' · '));
    if (g !== G) return;
    const txt = (melee ? 'ฟัน' : 'ยิง') + ' ' + b.name + ': ' + (ev.info ? ev.info.attacks : r.hit.length) + ' ครั้ง → โดน ' + r.hits + ' → ทำแผล ' + r.wounds + ' → เซฟไม่ผ่าน ' + r.unsaved + (r.mortal ? ' + mortal ' + r.mortal : '') + (r.killed ? ' → ตาย ' + r.killed + ' โมเดล' : r.dmg ? ' → เสีย ' + r.dmg + ' แผล' : '') + (ev.info && ev.info.cover ? ' (เป้าได้ที่กำบัง)' : '') + (why.length ? ' [' + why.join(', ') + ']' : '');
    TT.log(g, a.name + ' ' + txt, melee ? 'fight' : 'shoot');
    if (r.dmg) floatText(b.x, b.y - b.r - 0.5, r.killed ? '−' + r.killed + ' โมเดล' : '−' + r.dmg + ' แผล', 'hurt'); else floatText(b.x, b.y - b.r - 0.5, 'รอด!', 'safe');
    if (r.pact && !r.pact.pass) floatText(a.x, a.y - a.r - 0.5, 'Dark Pact −1', 'hurt');
    if (b.dead) { disp[b.id] = { x: b.x, y: b.y }; drawTokens(); await wait(500); delete disp[b.id]; }
    render(); hideDice();
  }
  async function playGrenade(ev) {
    const a = U(ev.u), b = U(ev.v), r = ev.res;
    await animShot(a, b, false);
    await showDice([{ label: 'ระเบิด 4+', dice: r.dice, sum: r.hits + ' mortal' }], a.name + ' ขว้างระเบิดใส่ ' + b.name);
    floatText(b.x, b.y - b.r - 0.5, r.dmg ? '−' + r.dmg + ' แผล' : 'รอด!', r.dmg ? 'hurt' : 'safe');
    if (b.dead) { disp[b.id] = { x: b.x, y: b.y }; drawTokens(); await wait(500); delete disp[b.id]; }
    render(); hideDice();
  }
  async function playEvents(evs) {
    const G = g;
    for (const ev of evs) {
      if (g !== G) return;
      if (ev.t === 'move') {
        const u = U(ev.u);
        if (ev.mode === 'advance') { await showDice([{ label: 'Advance', dice: [{ r: ev.adv, ok: true }], sum: '+' + ev.adv + '"' }], u.name + ' ทอย Advance'); hideDice(); }
        TT.log(g, u.name + (ev.mode === 'fallback' ? ' ถอยออกจากการติดพัน' : (ev.mode === 'advance' ? ' Advance ' : ' เดิน ') + Math.hypot(ev.to.x - ev.from.x, ev.to.y - ev.from.y).toFixed(1) + '"'));
        await animMove(u, ev.from, ev.to); render();
      }
      else if (ev.t === 'consolidate') { const u = U(ev.u); TT.log(g, u.name + ' Consolidate เข้าหาศัตรู'); await animMove(u, ev.from, ev.to, 300); render(); }
      else if (ev.t === 'waaagh') { toast('WAAAGH!!! ออร์คทั้งทัพคลั่งรบ'); render(); await wait(700); }
      else if (ev.t === 'shoot') await playAttack(ev, false);
      else if (ev.t === 'grenade') await playGrenade(ev);
      else if (ev.t === 'fight') await playAttack(ev, true);
      else if (ev.t === 'charge') {
        const u = U(ev.u);
        if (ev.rr) { await showDice([{ label: 'ชาร์จ 2D6', dice: ev.rr.dice.map(d => ({ r: d, ok: false })), sum: ev.rr.roll + '"' }], u.name + ' ประกาศชาร์จ'); hideDice(); }
        await showDice([{ label: ev.rr ? 'Re-roll 2D6' : 'ชาร์จ 2D6', dice: ev.dice.map(d => ({ r: d, ok: ev.ok })), sum: ev.roll + (ev.bonus ? '+' + ev.bonus : '') + '"' }], u.name + (ev.rr ? ' ใช้ Command Re-roll' : ' ประกาศชาร์จ'));
        hideDice();
        if (ev.ok) { TT.log(g, u.name + ' ชาร์จสำเร็จ (ทอย ' + ev.roll + ') ใส่ ' + U(ev.v).name, 'good'); await animMove(u, ev.from, ev.to, 380); }
        else TT.log(g, u.name + ' ชาร์จไม่ถึง (ทอย ' + ev.roll + ')', 'bad');
        render();
      }
      if (TT.checkWipe(g)) { render(); return; }
    }
  }

  /* ---------- ลำดับเกม ---------- */
  async function enterPhase() {
    const G = g, stale = () => g !== G;
    sel = null; chargeState = null; failedCharge = null; grenadeMode = false; moveMode = 'normal'; advRoll = null; hover = null;
    if (g.over || g.phase === 'deploy') { render(); return; }
    if (g.phase === 'command') {
      busy = true; render();
      TT.log(g, '— เริ่มรอบ ' + g.round + ' ตาของ' + SIDE_NAME[g.active] + ' —', 'turn');
      const out = TT.commandPhase(g);
      for (const h of out.heals) floatText(h.u.x, h.u.y - h.u.r - 0.5, '+' + h.n + ' แผล', 'safe');
      for (const t of out.tests) { if (t.auto) continue; await showDice([{ label: 'Ld ' + t.u.Ld + '+', dice: t.dice.map(d => ({ r: d, ok: t.pass })), sum: t.pass ? 'ผ่าน' : 'ขวัญแตก' }], t.u.name + ' ทดสอบ Battle-shock'); if (stale()) return; hideDice(); }
      render(); await wait(450); if (stale()) return; busy = false;
      TT.nextPhase(g); return enterPhase();
    }
    render();
    if (!isHuman(g.active)) {
      busy = true; render(); await wait(350); if (stale()) return;
      const evs = TT.aiPhase(g);
      await playEvents(evs); if (stale()) return;
      busy = false;
      if (g.over || TT.checkWipe(g)) { render(); return; }
      await wait(250); if (stale()) return;
      /* ระหว่างบอทเล่น ผู้ใช้อาจสลับให้ตัวเองคุมฝ่ายนี้ → หยุดรอผู้เล่น */
      if (isHuman(g.active)) { render(); return; }
      TT.nextPhase(g); return enterPhase();
    }
  }
  async function endPhase() {
    if (busy || g.over) return;
    TT.nextPhase(g);
    if (TT.checkWipe(g)) { render(); return; }
    await enterPhase();
  }
  function newGame() {
    g = TT.createGame({ armies: prefs.armies.slice(), rosters: prefs.rosters.map(r => r.slice()), size: prefs.size, map: prefs.map, diff: [prefs.diff, prefs.diff] });
    syncAI();
    disp = {}; sel = null; busy = false; hideDice();
    TT.log(g, TT.SIZES[g.size].name + ' · ' + (TT.MAPS[g.map] ? TT.MAPS[g.map].name : 'สนามสุ่ม') + ' · ' + facName(0) + ' ปะทะ ' + facName(1), 'turn');
    TT.log(g, 'ทอยแย่งเริ่มก่อน: ' + SIDE_NAME[g.first] + ' ได้เล่นก่อน', 'turn');
    drawStatic(); render();
  }
  function startBattle() {
    TT.startBattle(g); drawStatic();
    const w = $('#tt-setup-wrap'); if (w && window.innerWidth < 1000) w.open = false;
    enterPhase();
  }

  /* ---------- รับคำสั่ง ---------- */
  svg.addEventListener('click', async e => {
    if (!g || busy || g.over) return;
    const tokEl = e.target.closest('.tt-tok'), tok = tokEl && U(tokEl.dataset.id);
    /* ขั้นวางกำลัง */
    if (g.phase === 'deploy') {
      if (tok) { sel = tok; render(); return; }
      if (sel && isHuman(sel.side)) {
        const p = svgPoint(e), r = TT.deployTo(g, sel, p.x, p.y);
        if (!r.ok) { toast(r.err, true); return; }
        hover = null; render(); return;
      }
      if (sel && !isHuman(sel.side)) toast('ยูนิตนี้บอทเป็นคนวาง', true);
      sel = null; render(); return;
    }
    const human = isHuman(g.active);
    if (tok && !tok.dead) {
      /* ระเบิด */
      if (human && g.phase === 'shooting' && grenadeMode && sel && sel.side === g.active && tok.side !== g.active) {
        if (TT.grenadeTargets(g, sel).indexOf(tok) < 0) { toast('เป้าต้องอยู่ในระยะ 8" มองเห็น และไม่ติดพัน', true); return; }
        busy = true; grenadeMode = false; render();
        const res = TT.grenade(g, sel, tok);
        if (res) await playGrenade({ u: sel.id, v: tok.id, res });
        busy = false; TT.checkWipe(g); render(); return;
      }
      /* ยิงใส่ศัตรู */
      if (human && g.phase === 'shooting' && sel && sel.side === g.active && tok.side !== g.active) {
        const s = TT.shotInfo(g, sel, tok);
        if (!s) { toast(!sel.ranged ? 'ยูนิตนี้ไม่มีอาวุธยิง' : sel.f.shot ? 'ยูนิตนี้ยิงไปแล้ว' : 'ยิงเป้านี้ไม่ได้ (นอกระยะ มองไม่เห็น หรือติดพัน)', true); return; }
        busy = true; render();
        const res = TT.resolve(g, sel, tok, s.weapon, s.bs, s.hitMod, s.attacks, s); sel.f.shot = true;
        await playAttack({ u: sel.id, v: tok.id, res, info: { cover: s.cover, attacks: s.attacks, why: s.why } }, false);
        busy = false; TT.checkWipe(g); render(); return;
      }
      /* เลือกเป้าชาร์จ */
      if (human && g.phase === 'charge' && chargeState && chargeState.u === sel && tok.side !== g.active) {
        if (chargeState.targets.indexOf(tok) < 0) { toast('เป้านี้อยู่ไกลกว่าระยะที่ทอยได้', true); return; }
        const from = { x: sel.x, y: sel.y }; TT.chargeTo(g, sel, tok);
        busy = true; chargeState = null;
        TT.log(g, sel.name + ' ชาร์จสำเร็จใส่ ' + tok.name, 'good');
        await animMove(sel, from, { x: sel.x, y: sel.y }, 380); busy = false; render(); return;
      }
      sel = tok; moveMode = 'normal'; advRoll = null; grenadeMode = false;
      if (chargeState && chargeState.u !== tok) chargeState = null;
      render(); return;
    }
    /* แตะพื้น = เดิน */
    if (human && g.phase === 'movement' && sel && sel.side === g.active && !sel.f.didMove) {
      const p = svgPoint(e), engaged = TT.isEngaged(g, sel);
      const mode = engaged ? 'fallback' : moveMode;
      const from = { x: sel.x, y: sel.y };
      const r = TT.move(g, sel, p.x, p.y, mode, advRoll || 0);
      if (!r.ok) { toast(r.err, true); return; }
      busy = true; hover = null;
      TT.log(g, sel.name + (mode === 'fallback' ? ' ถอย ' : mode === 'advance' ? ' Advance ' : ' เดิน ') + r.dist.toFixed(1) + '"');
      await animMove(sel, from, { x: sel.x, y: sel.y }); busy = false; render(); return;
    }
    sel = null; chargeState = null; grenadeMode = false; render();
  });
  svg.addEventListener('mousemove', e => {
    const deploying = g && g.phase === 'deploy' && sel && isHuman(sel.side);
    if (!g || busy || (!deploying && (g.phase !== 'movement' || !sel || sel.f.didMove || !isHuman(g.active) || sel.side !== g.active))) { if (hover) { hover = null; drawOverlay(); } return; }
    if (e.target.closest('.tt-tok')) { if (hover) { hover = null; drawOverlay(); } return; }
    hover = svgPoint(e); drawOverlay();
  });
  svg.addEventListener('mouseleave', () => { if (hover) { hover = null; drawOverlay(); } });
  svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tt-tok')) { e.preventDefault(); e.target.closest('.tt-tok').dispatchEvent(new MouseEvent('click', { bubbles: true })); } });

  async function onAction(e) {
    const b = e.target.closest('[data-a]'); if (!b || busy) return;
    const a = b.dataset.a;
    if (a === 'battle') return startBattle();
    if (a === 'redeploy') { [0, 1].forEach(s => { if (isHuman(s)) TT.autoDeploy(g, s); }); render(); return; }
    if (a === 'again') { newGame(); return; }
    if (a === 'restart') { if (window.confirm('เริ่มเกมใหม่ตั้งแต่ขั้นวางกำลัง?')) newGame(); return; }
    if (a === 'swap') { prefs.armies.reverse(); prefs.rosters.reverse(); save(); renderSetup(); newGame(); return; }
    if (a === 'next') return endPhase();
    if (a === 'waaagh') { TT.callWaaagh(g, g.active); toast('WAAAGH!!! ออร์คทั้งทัพคลั่งรบ'); render(); return; }
    if (a === 'normal') { moveMode = 'normal'; render(); }
    else if (a === 'advance') {
      if (!advRoll) { advRoll = TT.d6(g.rng); busy = true; await showDice([{ label: 'Advance', dice: [{ r: advRoll, ok: true }], sum: '+' + advRoll + '"' }], sel.name + ' ทอย Advance'); hideDice(); busy = false; }
      moveMode = 'advance'; render();
    }
    else if (a === 'stay') { sel.f.didMove = true; sel.f.moved = 0; TT.log(g, sel.name + ' อยู่กับที่'); sel = null; render(); }
    else if (a === 'grenade') { grenadeMode = !grenadeMode; if (grenadeMode) toast('แตะศัตรูที่มีวงสีทอง (ระยะ 8") เพื่อขว้างระเบิด'); render(); }
    else if (a === 'charge' || a === 'reroll') {
      busy = true; render();
      const c = a === 'reroll' ? TT.rerollCharge(g, sel) : TT.chargeRoll(g, sel);
      failedCharge = null;
      if (!c) { busy = false; render(); return; }
      await showDice([{ label: (a === 'reroll' ? 'Re-roll' : 'ชาร์จ') + ' 2D6', dice: c.dice.map(d => ({ r: d, ok: c.targets.length > 0 })), sum: c.roll + (c.bonus ? '+' + c.bonus : '') + '"' }], sel.name + (a === 'reroll' ? ' ใช้ Command Re-roll' : ' ประกาศชาร์จ')); hideDice();
      busy = false;
      if (!c.targets.length) { TT.log(g, sel.name + ' ชาร์จไม่ถึง (ทอย ' + c.roll + ')', 'bad'); toast('ทอยได้ ' + c.roll + '" ไม่ถึงเป้าหมายใด' + (a === 'charge' && TT.stratOK(g, g.active, 'reroll', sel) ? ' — ใช้ Command Re-roll ได้' : ''), true); chargeState = null; if (a === 'charge') failedCharge = sel; }
      else { chargeState = { u: sel, targets: c.targets, roll: c.roll }; toast('ทอยได้ ' + c.roll + '" — แตะเป้าที่มีวงสีทองเพื่อชาร์จ'); }
      render();
    }
    else if (a === 'nocharge') { TT.log(g, sel.name + ' ตัดสินใจไม่ชาร์จ'); chargeState = null; render(); }
    else if (a === 'fight') {
      busy = true; render();
      const evs = TT.fightAll(g);
      if (!evs.length) TT.log(g, 'ไม่มียูนิตที่ติดพัน ไม่มีการต่อสู้');
      await playEvents(evs);
      busy = false;
      if (TT.checkWipe(g)) { render(); return; }
      endPhase();
    }
  }
  $('#tt-actions').addEventListener('click', onAction);
  $('#tt-over').addEventListener('click', onAction);

  renderSetup();
  newGame();
})();
