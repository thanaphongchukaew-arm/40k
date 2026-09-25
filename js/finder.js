/* =========================================================
   หน้า "ทัพไหนเหมาะกับคุณ": เลือกแบบทดสอบ → ตอบทีละข้อ → ดูผล
   ต้องโหลด factions-data.js และ finder-data.js ก่อน
   ========================================================= */
(function () {
  const app = document.getElementById('ff-app');
  if (!app || !window.FINDER) return;
  const FD = window.FINDER, F = window.FACTIONS || [];
  const sides = {}; F.forEach(f => { sides[f.id] = f.side; });
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = window.siteStore || { get: () => null, set: () => {} };
  const SIDE = { imperium: 'Imperium', chaos: 'Chaos', xenos: 'Xenos' };

  let st = store.get('w40k-finder') || {};
  st.ans = st.ans || {}; st.idx = st.idx || {};
  let mode = null;
  const save = () => store.set('w40k-finder', st);

  function start(m, fresh) {
    mode = m;
    if (fresh || !st.ans[m]) { st.ans[m] = FD[m].q.map(() => undefined); st.idx[m] = 0; }
    save();
    if (location.hash !== '#' + m) history.replaceState(null, '', '#' + m);
    if (st.idx[m] >= FD[m].q.length) showResult(); else showQ();
    app.scrollIntoView({ block: 'start' });
  }

  function home() {
    mode = null;
    history.replaceState(null, '', location.pathname + location.search);
    app.innerHTML = '<div class="ff-modes">' + Object.keys(FD).map(k => {
      const done = st.ans[k] && st.idx[k] >= FD[k].q.length, part = st.ans[k] && !done && st.idx[k] > 0;
      return '<button type="button" class="ff-mode" data-mode="' + k + '"><span class="ff-mode-ic">' + ic(k === 'play' ? 'dice' : 'book') + '</span>' +
        '<b>' + FD[k].title + '</b><span>' + FD[k].desc + '</span><small>' + FD[k].q.length + ' ข้อ · ประมาณ ' + Math.round(FD[k].q.length * 12 / 60) + ' นาที' +
        (done ? ' · <em>ทำเสร็จแล้ว ดูผลได้</em>' : part ? ' · <em>ทำค้างไว้ข้อ ' + (st.idx[k] + 1) + '</em>' : '') + '</small></button>';
    }).join('') + '</div>';
  }

  function showQ() {
    const D = FD[mode], i = st.idx[mode], q = D.q[i], a = st.ans[mode][i];
    const pct = Math.round(i / D.q.length * 100);
    app.innerHTML = '<div class="ff-card" data-i="' + i + '">' +
      '<div class="ff-top"><span class="chip">' + ic(mode === 'play' ? 'dice' : 'book') + ' ' + D.title + '</span><span class="ff-count">ข้อ <b>' + (i + 1) + '</b> / ' + D.q.length + '</span></div>' +
      '<div class="progress-line ff-bar"><i style="width:' + pct + '%"></i></div>' +
      '<h3 class="ff-q" id="ff-q" tabindex="-1">' + esc(q[0]) + '</h3>' +
      '<div class="ff-opts" role="group" aria-labelledby="ff-q">' + q[1].map((o, k) =>
        '<button type="button" class="ff-opt' + (a === k ? ' picked' : '') + '" data-k="' + k + '"><span class="ff-key">' + 'ABCD'[k] + '</span>' + esc(o[0]) + '</button>').join('') + '</div>' +
      '<div class="ff-nav"><button type="button" class="btn btn-ghost btn-sm" data-act="back"' + (i === 0 ? ' disabled' : '') + '>' + ic('arrow-left') + ' ย้อนกลับ</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="skip">ข้ามข้อนี้</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="home">' + ic('home') + ' เลือกแบบทดสอบ</button></div></div>';
    const h = document.getElementById('ff-q'); if (h && document.activeElement && app.contains(document.activeElement)) h.focus({ preventScroll: true });
  }

  function next() {
    st.idx[mode]++; save();
    if (st.idx[mode] >= FD[mode].q.length) showResult(); else showQ();
  }

  function showResult() {
    const D = FD[mode], ans = st.ans[mode].map(x => x === undefined ? null : x);
    const res = window.finderScore(mode, ans, sides);
    const byId = id => F.find(f => f.id === id) || { id, name: id, th: '', img: '' };
    const card = (r, n) => {
      const f = byId(r.id);
      return '<article class="ff-res' + (n === 0 ? ' first' : '') + '" data-side="' + f.side + '"><div class="ff-res-img"><img src="../images/' + f.img + '" alt="' + esc(f.name) + '"></div>' +
        '<div class="ff-res-body"><span class="ff-rank">อันดับ ' + (n + 1) + '</span><h3>' + esc(f.name) + '</h3><p class="muted">' + esc(f.th) + ' · ' + SIDE[f.side] + '</p>' +
        '<div class="ff-meter"><i style="width:' + r.pct + '%"></i><b>' + r.pct + '%</b></div>' +
        (r.why.length ? '<p class="ff-why">เข้ากับคุณเรื่อง: ' + r.why.map(w => '<span class="chip">' + w + '</span>').join(' ') + '</p>' : '') +
        '<p>' + esc(f.tagline || '') + '</p>' +
        '<div class="ff-links"><a href="lore/' + f.id + '.html">' + ic('book') + ' อ่านเนื้อเรื่อง</a><a href="factions.html#' + f.id + '">' + ic('shield') + ' ข้อมูลทัพ</a><a href="army-builder.html?f=' + f.id + '">' + ic('calc') + ' ลองจัดทัพ</a></div></div></article>';
    };
    const other = Object.keys(FD).find(k => k !== mode);
    app.innerHTML = '<div class="ff-result">' +
      '<div class="ff-top"><span class="chip">' + ic('award') + ' ผลแบบทดสอบ' + D.title + '</span><span class="ff-count">ตอบ ' + res.answered + ' / ' + D.q.length + ' ข้อ</span></div>' +
      (res.answered < 8 ? '<div class="callout warn">' + ic('alert') + '<div><p>คุณข้ามไปหลายข้อ ผลอาจยังไม่แม่นยำ ลองตอบเพิ่มดูนะ</p></div></div>' : '') +
      '<div class="ff-top3">' + res.ranking.slice(0, 3).map(card).join('') + '</div>' +
      '<details class="ff-all"><summary>ดูอันดับทั้ง ' + res.ranking.length + ' ทัพ</summary><ol>' + res.ranking.map(r => {
        const f = byId(r.id);
        return '<li><a href="factions.html#' + f.id + '">' + esc(f.name) + '</a><span class="ff-mini"><i style="width:' + r.pct + '%"></i></span><b>' + r.pct + '%</b></li>';
      }).join('') + '</ol></details>' +
      '<div class="ff-nav"><button type="button" class="btn btn-primary btn-sm" data-act="other">' + ic(other === 'play' ? 'dice' : 'book') + ' ลองแบบ' + FD[other].title + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="edit">' + ic('arrow-left') + ' แก้คำตอบ</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="restart">' + ic('refresh') + ' เริ่มใหม่</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="copy">' + ic('scroll') + ' คัดลอกผล</button><span class="muted" id="ff-msg"></span></div>' +
      '<textarea id="ff-text" hidden rows="5" aria-label="ผลสำหรับคัดลอก"></textarea></div>';
  }

  app.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]');
    if (m) return start(m.dataset.mode);
    const o = e.target.closest('.ff-opt');
    if (o && mode) { st.ans[mode][st.idx[mode]] = +o.dataset.k; o.classList.add('picked'); return next(); }
    const b = e.target.closest('[data-act]'); if (!b || !mode) return;
    const act = b.dataset.act;
    if (act === 'back') { st.idx[mode] = Math.max(0, st.idx[mode] - 1); save(); showQ(); }
    else if (act === 'skip') { st.ans[mode][st.idx[mode]] = null; next(); }
    else if (act === 'home') home();
    else if (act === 'other') start(Object.keys(FD).find(k => k !== mode));
    else if (act === 'edit') { st.idx[mode] = FD[mode].q.length - 1; save(); showQ(); }
    else if (act === 'restart') start(mode, true);
    else if (act === 'copy') {
      const res = window.finderScore(mode, st.ans[mode].map(x => x === undefined ? null : x), sides);
      const txt = 'ทัพ 40K ที่เหมาะกับฉัน (' + FD[mode].title + ')\n' + res.ranking.slice(0, 3).map((r, n) => (n + 1) + '. ' + (F.find(f => f.id === r.id) || {}).name + ' — ' + r.pct + '%').join('\n');
      const ta = document.getElementById('ff-text'); ta.value = txt; ta.hidden = false; ta.focus(); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.getElementById('ff-msg').textContent = ok ? 'คัดลอกแล้ว' : 'กด Ctrl+C / ⌘C เพื่อคัดลอก';
    }
  });
  /* ปุ่มลัด: 1–4 หรือ A–D เลือกคำตอบ, ← ย้อนกลับ */
  document.addEventListener('keydown', e => {
    if (!mode || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test((e.target.tagName || ''))) return;
    if (document.body.classList.contains('search-open')) return;
    const opts = app.querySelectorAll('.ff-opt'); if (!opts.length) return;
    const k = e.key.toLowerCase(), n = '1234'.indexOf(k) > -1 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (n > -1 && opts[n]) { e.preventDefault(); opts[n].click(); }
    else if (e.key === 'ArrowLeft') { const b = app.querySelector('[data-act="back"]'); if (b && !b.disabled) b.click(); }
  });

  const h = location.hash.slice(1);
  if (FD[h]) start(h); else home();
})();
