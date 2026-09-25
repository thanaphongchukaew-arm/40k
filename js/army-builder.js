/* =========================================================
   หน้าจัดทีม: เลือกทัพ ขนาดเกม เพิ่มยูนิต/ตัวละคร แล้วตรวจกติกาการจัดทัพเบื้องต้น
   ต้องโหลด factions-data.js และ army-data.js ก่อน
   ========================================================= */
(function () {
  const $ = id => document.getElementById(id);
  if (!$('ab-app')) return;
  const F = window.FACTIONS || [], U = window.ARMY_UNITS || {}, S = window.ARMY_SIZES;
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ROLE = { char: 'ตัวละคร', epic: 'Epic Hero', line: 'Battleline', inf: 'ทหารราบ', veh: 'ยานพาหนะ', mon: 'หุ่น/สัตว์ยักษ์', trans: 'ยานขนส่ง' };
  const store = window.siteStore || { get: () => null, set: () => {} };

  let st = store.get('w40k-army') || { faction: 'space-marines', size: 'strike', roster: [], warlord: null, name: '' };
  if (!U[st.faction]) st.faction = 'space-marines';
  let roleFilter = 'all';
  /* ?f=ทัพ จากหน้าอื่น (เช่นผลแบบทดสอบ) → เปิดทัพนั้นโดยเก็บรายชื่อทัพเดิมไว้ */
  const qf = new URLSearchParams(location.search).get('f');
  if (qf && U[qf] && qf !== st.faction) {
    st.saved = st.saved || {};
    st.saved[st.faction] = { roster: st.roster, warlord: st.warlord };
    const back = st.saved[qf] || { roster: [], warlord: null };
    st.faction = qf; st.roster = back.roster; st.warlord = back.warlord;
  }

  /* ตัวเลือกทัพ */
  const sel = $('ab-faction');
  const groups = { imperium: 'Imperium', chaos: 'Chaos', xenos: 'Xenos' };
  sel.innerHTML = Object.keys(groups).map(g => '<optgroup label="' + groups[g] + '">' +
    F.filter(f => f.side === g && U[f.id]).map(f => '<option value="' + f.id + '">' + esc(f.name) + ' (' + esc(f.th) + ')</option>').join('') + '</optgroup>').join('');

  function save() { store.set('w40k-army', st); }
  function renderCatalog() {
    const list = (U[st.faction] || []).map((u, i) => ({ name: u[0], role: u[1], pts: u[2], i }))
      .filter(u => roleFilter === 'all' || u.role === roleFilter || (roleFilter === 'char' && u.role === 'epic'));
    $('ab-catalog').innerHTML = list.map(u =>
      '<li><button type="button" class="ab-add" data-i="' + u.i + '" aria-label="เพิ่ม ' + esc(u.name) + '">' + ic('plus') + '</button>' +
      '<span class="ab-name">' + esc(u.name) + '</span><span class="chip r-' + u.role + '">' + ROLE[u.role] + '</span><span class="ab-pts">~' + u.pts + '</span></li>').join('') ||
      '<li class="muted">ไม่มียูนิตประเภทนี้</li>';
  }
  function renderRoster() {
    const r = st.roster;
    $('ab-roster').innerHTML = r.length ? r.map((u, i) => {
      const isChar = u.role === 'char' || u.role === 'epic';
      return '<tr><td><strong>' + esc(u.name) + '</strong><br><span class="chip r-' + u.role + '">' + ROLE[u.role] + '</span></td>' +
        '<td class="center"><div class="ab-qty"><button type="button" data-act="dec" data-i="' + i + '" aria-label="ลดจำนวน">−</button><b>' + u.qty + '</b><button type="button" data-act="inc" data-i="' + i + '" aria-label="เพิ่มจำนวน">+</button></div></td>' +
        '<td class="center"><input type="number" min="0" step="5" value="' + u.pts + '" data-act="pts" data-i="' + i + '" aria-label="แต้มต่อยูนิต"></td>' +
        '<td class="center"><b>' + (u.pts * u.qty) + '</b></td>' +
        '<td class="center">' + (isChar ? '<input type="radio" name="ab-warlord" data-act="warlord" data-i="' + i + '"' + (st.warlord === i ? ' checked' : '') + ' aria-label="เลือกเป็นแม่ทัพ">' : '–') + '</td>' +
        '<td class="center">' + (u.role === 'char' ? '<input type="checkbox" data-act="enh" data-i="' + i + '"' + (u.enh ? ' checked' : '') + ' aria-label="ใส่ Enhancement">' : '–') + '</td>' +
        '<td class="center"><button type="button" class="ab-del" data-act="del" data-i="' + i + '" aria-label="ลบ">' + ic('x') + '</button></td></tr>';
    }).join('') : '<tr><td colspan="7" class="muted center">ยังไม่มียูนิต — กดปุ่มในรายการด้านซ้ายเพื่อเพิ่ม</td></tr>';
    const enh = r.filter(u => u.enh).length;
    const res = window.checkArmy(r, { size: st.size, warlord: st.warlord, enh });
    const pct = Math.min(100, res.total / res.limit * 100);
    $('ab-total').textContent = res.total + ' / ' + res.limit;
    const bar = $('ab-bar'); bar.style.width = pct + '%'; bar.classList.toggle('over', res.total > res.limit);
    $('ab-enh').textContent = enh + ' / ' + S[st.size].enh;
    $('ab-check').innerHTML = res.issues.map(t => '<li class="bad">' + ic('alert') + ' ' + esc(t) + '</li>').join('') +
      res.ok.map(t => '<li class="good">' + ic('check-circle') + ' ' + esc(t) + '</li>').join('') +
      (res.valid && r.length ? '<li class="good">' + ic('award') + ' ผ่านการตรวจเบื้องต้น พร้อมไปจัดทัพจริงในแอป</li>' : '');
    save();
  }
  function renderAll() {
    sel.value = st.faction;
    document.querySelectorAll('[name="ab-size"]').forEach(x => { x.checked = x.value === st.size; });
    const f = F.find(x => x.id === st.faction);
    $('ab-faction-card').innerHTML = f ? '<img src="../images/' + f.img + '" alt="' + esc(f.name) + '"><div><b>' + esc(f.name) + '</b><p>' + esc(f.tagline) + '</p><a href="lore/' + f.id + '.html">' + ic('book') + ' เนื้อเรื่องของทัพนี้</a></div>' : '';
    renderCatalog(); renderRoster();
  }

  /* เปลี่ยนทัพ: เก็บรายชื่อของทัพเดิมไว้ กลับมาแล้วยังอยู่ */
  sel.addEventListener('change', () => {
    st.saved = st.saved || {};
    st.saved[st.faction] = { roster: st.roster, warlord: st.warlord };
    st.faction = sel.value;
    const back = st.saved[st.faction] || { roster: [], warlord: null };
    st.roster = back.roster; st.warlord = back.warlord;
    renderAll();
  });
  document.querySelectorAll('[name="ab-size"]').forEach(x => x.addEventListener('change', () => { st.size = x.value; renderRoster(); }));
  $('ab-roles').addEventListener('click', e => {
    const b = e.target.closest('[data-role]'); if (!b) return;
    roleFilter = b.dataset.role;
    $('ab-roles').querySelectorAll('[data-role]').forEach(x => x.classList.toggle('active', x === b));
    renderCatalog();
  });
  $('ab-catalog').addEventListener('click', e => {
    const b = e.target.closest('.ab-add'); if (!b) return;
    const u = U[st.faction][+b.dataset.i];
    const ex = st.roster.find(x => x.name === u[0] && x.role !== 'char' && x.role !== 'epic');
    if (ex) ex.qty++;
    else st.roster.push({ name: u[0], role: u[1], pts: u[2], qty: 1, enh: false });
    if (st.warlord == null) { const ci = st.roster.findIndex(x => x.role === 'char' || x.role === 'epic'); if (ci > -1) st.warlord = ci; }
    renderRoster();
  });
  $('ab-roster').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.dataset.i, u = st.roster[i];
    if (b.dataset.act === 'inc') u.qty++;
    else if (b.dataset.act === 'dec') u.qty = Math.max(1, u.qty - 1);
    else if (b.dataset.act === 'del') {
      st.roster.splice(i, 1);
      if (st.warlord === i) st.warlord = null; else if (st.warlord > i) st.warlord--;
    } else if (b.dataset.act === 'warlord') st.warlord = i;
    else if (b.dataset.act === 'enh') u.enh = b.checked;
    else return;
    renderRoster();
  });
  $('ab-roster').addEventListener('change', e => {
    const t = e.target; if (t.dataset.act !== 'pts') return;
    st.roster[+t.dataset.i].pts = Math.max(0, Math.round(Number(t.value) || 0));
    renderRoster();
  });
  $('ab-clear').addEventListener('click', () => { st.roster = []; st.warlord = null; renderRoster(); });
  $('ab-copy').addEventListener('click', () => {
    const f = F.find(x => x.id === st.faction), size = S[st.size];
    const res = window.checkArmy(st.roster, { size: st.size, warlord: st.warlord, enh: st.roster.filter(u => u.enh).length });
    const txt = [(f ? f.name : '') + ' — ' + size.label + ' (' + res.total + '/' + size.pts + ' แต้ม)'].concat(
      st.roster.map((u, i) => '• ' + (u.qty > 1 ? u.qty + 'x ' : '') + u.name + ' [' + u.pts * u.qty + ']' + (st.warlord === i ? ' (Warlord)' : '') + (u.enh ? ' + Enhancement' : ''))).join('\n');
    /* แสดงข้อความให้เลือกเองเสมอ เผื่อเบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ */
    const ta = $('ab-text'); ta.value = txt; ta.hidden = false; ta.focus(); ta.select();
    const msg = t => { $('ab-copy-msg').textContent = t; setTimeout(() => { $('ab-copy-msg').textContent = ''; }, 2500); };
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    if (ok) msg('คัดลอกแล้ว');
    else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => msg('คัดลอกแล้ว'), () => msg('กด Ctrl+C / ⌘C เพื่อคัดลอก'));
    else msg('กด Ctrl+C / ⌘C เพื่อคัดลอก');
  });
  $('ab-print').addEventListener('click', () => window.print());
  renderAll();
})();
