/* =========================================================
   ตัวจำลองการโจมตี (Attack Simulator) + ตัวคำนวณ Wound
   อิงลำดับการโจมตีของ 11th Edition:
   Hit → Wound → Save (ทอยพร้อมกัน ใช้จากค่าน้อยไปมาก) → Damage
   ========================================================= */
(function () {
  const $ = id => document.getElementById(id);
  const d6 = () => 1 + Math.floor(Math.random() * 6);

  /* ---------- ตาราง Wound ---------- */
  function woundTarget(S, T) {
    if (S >= 2 * T) return 2;
    if (S > T) return 3;
    if (S === T) return 4;
    if (S * 2 <= T) return 6;
    return 5;
  }
  window.woundTarget = woundTarget;

  const wc = $('wound-calc');
  if (wc) {
    const s = $('wc-s'), t = $('wc-t'), out = $('wc-out');
    const upd = () => {
      const S = Math.max(1, +s.value || 1), T = Math.max(1, +t.value || 1);
      const need = woundTarget(S, T);
      const why = S >= 2 * T ? 'S มากกว่าหรือเท่ากับ 2 เท่าของ T' : S > T ? 'S มากกว่า T' : S === T ? 'S เท่ากับ T' : S * 2 <= T ? 'S น้อยกว่าหรือเท่ากับครึ่งหนึ่งของ T' : 'S น้อยกว่า T';
      const pct = Math.round((7 - need) / 6 * 100);
      out.innerHTML = '<span class="die big">' + need + '+</span><div><b>ต้องทอยได้ ' + need + ' ขึ้นไป</b><br><span class="muted">' + why + ' · โอกาสสำเร็จประมาณ ' + pct + '%</span></div>';
    };
    s.addEventListener('input', upd); t.addEventListener('input', upd); upd();
  }

  /* ---------- Simulator ---------- */
  const form = $('sim');
  if (!form) return;

  const rollDmg = D => {
    if (D === 'D3') return Math.ceil(d6() / 2);
    if (D === 'D6') return d6();
    if (D === 'D6+1') return d6() + 1;
    return +D;
  };

  function read() {
    const v = n => form.elements[n];
    return {
      models: Math.max(1, +v('models').value || 1),
      A: Math.max(1, +v('A').value || 1),
      BS: +v('BS').value, S: Math.max(1, +v('S').value || 1), AP: +v('AP').value, D: v('D').value,
      T: Math.max(1, +v('T').value || 1), Sv: +v('Sv').value, Inv: +v('Inv').value,
      W: Math.max(1, +v('W').value || 1), N: Math.max(1, +v('N').value || 1), FNP: +v('FNP').value,
      cover: v('cover').checked, heavy: v('heavy').checked, torrent: v('torrent').checked,
      rrHit: v('rrHit').checked, rrWound: v('rrWound').checked, lethal: v('lethal').checked,
      sustained: v('sustained').checked, dev: v('dev').checked, anti: v('anti').checked
    };
  }

  /* จำลองหนึ่งครั้ง คืนผลละเอียดของแต่ละขั้น */
  function simulate(o) {
    const log = { hits: [], wounds: [], saves: [], dmg: [] };
    const nAtk = o.models * o.A;
    const effBS = Math.min(6, Math.max(2, o.BS + (o.cover ? 1 : 0)));  // ที่กำบัง: BS แย่ลง 1
    const hitMod = o.heavy ? 1 : 0;                                     // Heavy +1 ทอยโดน (สูงสุด ±1)

    /* 1) HIT */
    let hits = 0, autoWounds = 0, hitDice = 0, sust = 0;
    if (o.torrent) { hits = nAtk; hitDice = nAtk; log.hits = null; }
    else {
      for (let i = 0; i < nAtk; i++) {
        let r = d6(), rr = false;
        const ok = x => x !== 1 && (x === 6 || x + hitMod >= effBS);
        if (!ok(r) && o.rrHit) { r = d6(); rr = true; }
        const crit = r === 6, success = ok(r);
        log.hits.push({ r, ok: success, crit, rr });
        if (success) {
          hitDice++;
          if (crit && o.lethal) autoWounds++; else hits++;
          if (crit && o.sustained) { hits++; sust++; }
        }
      }
    }

    /* 2) WOUND */
    const need = woundTarget(o.S, o.T);
    const critW = o.anti ? 4 : 6;
    let wounds = 0, devCrits = 0;
    for (let i = 0; i < hits; i++) {
      let r = d6(), rr = false;
      const ok = x => x !== 1 && (x >= critW || x >= need);
      if (!ok(r) && o.rrWound) { r = d6(); rr = true; }
      const crit = r >= critW, success = ok(r);
      log.wounds.push({ r, ok: success, crit, rr });
      if (success) { if (crit && o.dev) devCrits++; else wounds++; }
    }
    wounds += autoWounds;

    /* 3) SAVE — ทอยพร้อมกัน เรียงจากน้อยไปมาก */
    const saveRolls = [];
    for (let i = 0; i < wounds; i++) saveRolls.push(d6());
    saveRolls.sort((a, b) => a - b);
    let failed = 0;
    saveRolls.forEach(r => {
      let saved;
      if (r === 1) saved = false;
      else if (o.Inv && r >= o.Inv) saved = true;
      else saved = (r + o.AP) >= o.Sv;          // AP เป็นค่าติดลบ เช่น -1
      log.saves.push({ r, ok: saved });
      if (!saved) failed++;
    });

    /* 4) DAMAGE */
    const hp = Array(o.N).fill(o.W);
    let idx = 0, totalDmg = 0, fnpSaved = 0;
    const applyWound = () => {
      if (o.FNP && d6() >= o.FNP) { fnpSaved++; return false; }
      hp[idx]--; totalDmg++;
      if (hp[idx] <= 0) { idx++; return true; }
      return false;
    };
    for (let i = 0; i < failed && idx < o.N; i++) {
      const dmg = rollDmg(o.D);
      log.dmg.push(dmg);
      for (let k = 0; k < dmg && idx < o.N; k++) { if (applyWound()) break; }  // ดาเมจเกินไม่ทะลุไปตัวถัดไป
    }
    /* Devastating Wounds: Mortal Wounds หลังดาเมจปกติ ทำลายได้สูงสุด 1 โมเดลต่อ 1 critical */
    let mortals = 0;
    for (let c = 0; c < devCrits && idx < o.N; c++) {
      const mw = rollDmg(o.D); mortals += mw;
      for (let k = 0; k < mw && idx < o.N; k++) { if (applyWound()) break; }
    }
    return { nAtk, effBS, hitMod, need, critW, hits, hitDice, sust, autoWounds, wounds, devCrits, failed, mortals, totalDmg, fnpSaved, killed: Math.min(idx, o.N), log };
  }

  const dieHTML = (d, extra) => '<span class="die ' + (d.ok ? (d.crit ? 'crit' : '') : 'fail') + '" title="' + (d.rr ? 'ทอยซ้ำแล้ว' : '') + '">' + d.r + (d.rr ? '<sup style="font-size:.6em">↻</sup>' : '') + '</span>';
  const MAXSHOW = 80;
  const diceRow = arr => '<div class="dice-row">' + arr.slice(0, MAXSHOW).map(dieHTML).join('') + (arr.length > MAXSHOW ? '<span class="muted">…อีก ' + (arr.length - MAXSHOW) + ' ลูก</span>' : '') + '</div>';

  function render(o, r) {
    const svText = (() => {
      const modSv = o.Sv - o.AP;                          // AP -1 ทำให้ต้องทอยสูงขึ้น 1
      const armour = modSv > 6 ? 'เกราะใช้ไม่ได้ (ต้องได้ ' + modSv + '+)' : 'เกราะ ' + modSv + '+';
      return armour + (o.Inv ? ' หรือ Invulnerable ' + o.Inv + '+ (ใช้ค่าที่ดีกว่าอัตโนมัติ)' : '');
    })();
    let html = '<div class="result-steps">';
    html += '<div class="r-step"><div class="r-step-head"><span>① Hit Roll — ' + r.nAtk + ' การโจมตี</span><span class="need">' +
      (o.torrent ? 'Torrent: โดนอัตโนมัติ' : 'ต้องได้ ' + r.effBS + '+' + (o.cover ? ' (BS แย่ลงเพราะที่กำบัง)' : '') + (r.hitMod ? ' · ทอย +1 (Heavy)' : '')) + '</span></div>' +
      (r.log.hits ? diceRow(r.log.hits) : '') +
      '<p class="mb-0 mt-2">โดน <b>' + r.hitDice + '</b> ครั้ง' +
      (r.sust ? ' + โดนเพิ่มจาก Sustained Hits <b>' + r.sust + '</b>' : '') +
      (r.autoWounds ? ' · ในนี้ <b>' + r.autoWounds + '</b> ครั้งเป็น Lethal Hits (ทำแผลอัตโนมัติ ไม่ต้องทอย Wound)' : '') +
      ' → ไปทอย Wound <b>' + r.hits + '</b> ลูก</p></div>';

    html += '<div class="r-step"><div class="r-step-head"><span>② Wound Roll — S' + o.S + ' vs T' + o.T + '</span><span class="need">ต้องได้ ' + r.need + '+' + (o.anti ? ' · Anti: 4+ ดิบเป็น Critical' : '') + '</span></div>' +
      diceRow(r.log.wounds) + '<p class="mb-0 mt-2">ทำแผลสำเร็จ <b>' + (r.wounds) + '</b> ครั้ง' + (r.devCrits ? ' · Devastating Wounds <b>' + r.devCrits + '</b> (กลายเป็น Mortal Wounds)' : '') + '</p></div>';

    html += '<div class="r-step"><div class="r-step-head"><span>③ Save Roll — ฝ่ายรับทอยพร้อมกัน</span><span class="need">' + svText + '</span></div>' +
      diceRow(r.log.saves) + '<p class="mb-0 mt-2">เซฟไม่ผ่าน <b>' + r.failed + '</b> ครั้ง <span class="muted">(ลูกเต๋าเรียงจากน้อยไปมาก ตามกฎ 11th)</span></p></div>';

    html += '<div class="r-step"><div class="r-step-head"><span>④ Damage — ' + o.D + ' ต่อครั้ง</span><span class="need">เป้าหมาย: ' + o.N + ' โมเดล × ' + o.W + ' W' + (o.FNP ? ' · Feel No Pain ' + o.FNP + '+' : '') + '</span></div>' +
      (r.log.dmg.length ? '<div class="dice-row">' + r.log.dmg.slice(0, MAXSHOW).map(x => '<span class="die">' + x + '</span>').join('') + '</div>' : '<p class="muted mb-0">ไม่มีดาเมจ</p>') +
      '<p class="mb-0 mt-2">ดาเมจรวมที่ทำได้ <b>' + r.totalDmg + '</b>' + (r.mortals ? ' (รวม Mortal Wounds ' + r.mortals + ')' : '') + (r.fnpSaved ? ' · Feel No Pain กันไว้ ' + r.fnpSaved : '') + '</p></div>';
    html += '</div>';

    html += '<div class="r-summary">ผลลัพธ์: ทำลายเป้าหมาย <b>' + r.killed + ' / ' + o.N + '</b> โมเดล' + (r.killed >= o.N ? ' — <b style="color:#f08a90">ยูนิตถูกทำลายทั้งหมด!</b>' : '') + '</div>';

    /* ค่าคาดหวังจากการจำลอง 3,000 ครั้ง */
    let sumK = 0, sumD = 0, wipe = 0; const RUNS = 3000;
    for (let i = 0; i < RUNS; i++) { const x = simulate(o); sumK += x.killed; sumD += x.totalDmg; if (x.killed >= o.N) wipe++; }
    html += '<p class="expected">📊 จากการจำลอง ' + RUNS.toLocaleString() + ' ครั้ง: เฉลี่ยทำลาย <b>' + (sumK / RUNS).toFixed(2) + '</b> โมเดล · ดาเมจเฉลี่ย <b>' + (sumD / RUNS).toFixed(2) + '</b> · โอกาสล้างยูนิต <b>' + Math.round(wipe / RUNS * 100) + '%</b></p>';
    $('sim-result').innerHTML = html;
  }

  form.addEventListener('submit', e => { e.preventDefault(); const o = read(); render(o, simulate(o)); });

  /* ปุ่มตัวอย่างสำเร็จรูป */
  const presets = {
    bolter: { models: 5, A: 2, BS: 3, S: 4, AP: -1, D: '1', T: 3, Sv: 5, Inv: 0, W: 1, N: 10, FNP: 0 },
    lascannon: { models: 1, A: 1, BS: 3, S: 12, AP: -3, D: 'D6+1', T: 10, Sv: 3, Inv: 0, W: 12, N: 1, FNP: 0 },
    choppa: { models: 10, A: 3, BS: 3, S: 5, AP: -1, D: '1', T: 4, Sv: 3, Inv: 0, W: 2, N: 5, FNP: 0 },
    custodes: { models: 5, A: 2, BS: 3, S: 4, AP: -1, D: '1', T: 6, Sv: 2, Inv: 4, W: 3, N: 3, FNP: 0 }
  };
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const p = presets[b.dataset.preset];
    Object.entries(p).forEach(([k, v]) => { form.elements[k].value = v; });
    ['cover', 'heavy', 'torrent', 'rrHit', 'rrWound', 'lethal', 'sustained', 'dev', 'anti'].forEach(k => { form.elements[k].checked = false; });
    const o = read(); render(o, simulate(o));
  }));
})();
