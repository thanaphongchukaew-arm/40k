/* =========================================================
   เครื่องจำลองโต๊ะเล่นแบบย่อ — กติกาหลักตามหน้าเว็บ (11th Edition แบบย่อ)
   ไม่มี DOM: ใช้ได้ทั้งในเบราว์เซอร์และ node (สำหรับทดสอบ)
   1 โทเคน = 1 ยูนิต, ระยะวัดขอบฐานถึงขอบฐาน, หน่วยเป็นนิ้ว
   ต้องโหลด tabletop-data.js ก่อน (TT_DATA)
   ========================================================= */
(function (root) {
  const DATA = root.TT_DATA || (typeof require !== 'undefined' ? require('./tabletop-data.js') : null);
  const ARMIES = DATA.FACTIONS, MAPS = DATA.MAPS, SIZES = DATA.SIZES;
  const ENGAGE = 2, OBJ_RANGE = 3, ROUNDS = 5, AURA = 6;
  const PHASES = ['command', 'movement', 'shooting', 'charge', 'fight'];
  const PHASE_TH = { deploy: 'วางกำลัง', command: 'สั่งการ', movement: 'เคลื่อนที่', shooting: 'ยิง', charge: 'ชาร์จ', fight: 'ต่อสู้' };
  const DIFF = { easy: 'ง่าย', normal: 'ปกติ', hard: 'ยาก', brutal: 'โหด' };
  const SIDE = ['ฝ่ายน้ำเงิน', 'ฝ่ายแดง'];

  /* ---------- สุ่ม ---------- */
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const d6 = rng => 1 + Math.floor(rng() * 6);
  const d3 = rng => 1 + Math.floor(rng() * 3);

  /* ---------- เรขาคณิต ---------- */
  const cdist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const edge = (a, b) => cdist(a, b) - (a.r || 0) - (b.r || 0);
  function segRect(x1, y1, x2, y2, t, pad) {
    pad = pad || 0;
    const rx = t.x - pad, ry = t.y - pad, rw = t.w + pad * 2, rh = t.h + pad * 2;
    let u0 = 0, u1 = 1; const dx = x2 - x1, dy = y2 - y1;
    const p = [-dx, dx, -dy, dy], q = [x1 - rx, rx + rw - x1, y1 - ry, ry + rh - y1];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return false; }
      else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > u1) return false; if (r > u0) u0 = r; } else { if (r < u0) return false; if (r < u1) u1 = r; } }
    }
    return true;
  }
  function touches(u, t) {
    const cx = Math.max(t.x, Math.min(u.x, t.x + t.w)), cy = Math.max(t.y, Math.min(u.y, t.y + t.h));
    return Math.hypot(u.x - cx, u.y - cy) <= u.r;
  }

  /* ---------- ฉากและจุดยึด ---------- */
  function buildTerrain(mapKey, W, H, rng) {
    let pieces;
    if (mapKey === 'random') {
      pieces = [];
      const n = 3 + Math.floor(rng() * 2), names = [['ซากตึก', 'dense'], ['หินผา', 'dense'], ['ป่าทึบ', 'light'], ['หลุมระเบิด', 'light'], ['แนวกระสอบทราย', 'light'], ['ซากยาน', 'dense']];
      for (let i = 0; i < n; i++) {
        const nm = names[Math.floor(rng() * names.length)];
        pieces.push({ x: .18 + rng() * .26, y: .06 + rng() * .7, w: .08 + rng() * .06, h: .1 + rng() * .08, type: nm[1], name: nm[0] });
      }
      if (rng() < .7) pieces.push({ x: .45, y: .42, w: .1, h: .16, type: rng() < .5 ? 'dense' : 'light', name: 'ซากกลางสนาม', center: true });
    } else pieces = (MAPS[mapKey] || MAPS.ruins).pieces;
    const out = [];
    pieces.forEach(p => {
      const t = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H, type: p.type, name: p.name };
      out.push(t);
      if (!p.center) out.push({ x: W - t.x - t.w, y: H - t.y - t.h, w: t.w, h: t.h, type: t.type, name: t.name });
    });
    return out;
  }
  function buildObjectives(W, H) {
    return [{ x: W / 2, y: H / 2 }, { x: W * .3, y: H * .82 }, { x: W * .7, y: H * .18 }, { x: W * .12, y: H * .3 }, { x: W * .88, y: H * .7 }];
  }

  /* ---------- บัญชีทัพ ---------- */
  const unitDef = (fac, key) => ARMIES[fac] && ARMIES[fac].units.find(u => u.key === key);
  const rosterPts = (fac, keys) => keys.reduce((s, k) => s + ((unitDef(fac, k) || {}).pts || 0), 0);
  /* จำกัดจำนวนต่อชื่อ: ตัวละคร/Epic Hero 1, ทหารหลัก (Battleline — ทหารราบ OC 2 ขึ้นไป) 6, อื่น ๆ 3 */
  const unitCap = u => (u.kind === 'char' || u.epic) ? 1 : (u.kind === 'inf' && u.OC >= 2 && u.models >= 5) ? 6 : 3;
  /* จัดทัพอัตโนมัติ: ตัวละคร 1 ตัวก่อน แล้วสุ่มเพิ่มจนเต็มแต้ม (ยูนิตเดียวกันไม่เกิน 3) */
  function autoRoster(fac, limit, rng) {
    rng = rng || Math.random;
    const pool = ARMIES[fac].units, out = [];
    const chars = pool.filter(u => u.kind === 'char' || (u.kind === 'mon' && u.ab.indexOf('synapse') > -1));
    const c = chars[Math.floor(rng() * chars.length)];
    if (c && c.pts <= limit) out.push(c.key);
    const troops = pool.filter(u => u.kind === 'inf' && u.models >= 5).sort((a, b) => a.pts - b.pts)[0];
    if (troops && rosterPts(fac, out) + troops.pts <= limit) out.push(troops.key);
    for (let tries = 0; tries < 200; tries++) {
      const left = limit - rosterPts(fac, out);
      const ok = pool.filter(u => u.pts <= left && out.filter(k => k === u.key).length < unitCap(u));
      if (!ok.length) break;
      out.push(ok[Math.floor(rng() * ok.length)].key);
    }
    return out;
  }

  /* ทัพสำเร็จรูป: balanced = สมดุล, melee = บุกประชิด, ranged = ยิงไกล — ถูกกติกาแต้มเสมอ */
  const PRESETS = { balanced: 'ทัพสมดุล', melee: 'บุกประชิด', ranged: 'ยิงไกล' };
  function presetRoster(fac, limit, style) {
    const pool = ARMIES[fac].units, out = [];
    const cnt = k => out.filter(x => x === k).length;
    const pts = () => rosterPts(fac, out);
    const cap = unitCap;
    const fits = u => cnt(u.key) < cap(u) && pts() + u.pts <= limit;
    const mp = u => u.melee ? u.melee[2] * u.models * u.melee[6] * (7 - u.melee[3]) : 0;
    const rp = u => u.ranged ? u.ranged[2] * u.models * u.ranged[6] * (u.ranged[3] ? 7 - u.ranged[3] : 5) * (u.ranged[1] >= 24 ? 1.2 : 0.8) : 0;
    const pref = u => style === 'melee' ? (mp(u) + 1) / (rp(u) + mp(u) + 1) : style === 'ranged' ? (rp(u) + 1) / (rp(u) + mp(u) + 1) : 0.5;
    /* แม่ทัพ: ตัวละครที่เข้ากับสไตล์ที่สุด (ถ้าแต้มพอ) */
    const chars = pool.filter(u => u.kind === 'char' && u.pts <= limit * 0.3).sort((a, b) => pref(b) - pref(a) || a.pts - b.pts);
    if (chars[0]) out.push(chars[0].key);
    /* ทหารหลักอย่างน้อย 1 หน่วยไว้ยึดจุด */
    const troop = pool.filter(u => u.kind === 'inf' && u.models >= 5 && fits(u)).sort((a, b) => pref(b) - pref(a) || a.pts - b.pts)[0];
    if (troop) out.push(troop.key);
    for (let g = 0; g < 80; g++) {
      const c = pool.filter(u => u.kind !== 'char' || cnt(u.key) === 0).filter(fits)
        .sort((a, b) => (pref(b) + (style === 'balanced' ? 0 : 0) ) / (1 + cnt(b.key) * 0.9) - (pref(a)) / (1 + cnt(a.key) * 0.9) || b.pts - a.pts)[0];
      if (!c) break;
      out.push(c.key);
    }
    return out;
  }

  /* ---------- สถานะเกม ---------- */
  const freshFlags = s => ({ moved: 0, didMove: false, advanced: false, fellBack: false, shot: false, charged: false, chargeTried: false, fought: false, shocked: !!s });
  function makeUnit(def, fac, side, idx, dup) {
    return Object.assign(JSON.parse(JSON.stringify(def)), {
      id: side + '-' + def.key + '-' + idx, fac, side, name: def.name + (dup ? ' #' + dup : ''), x: 0, y: 0, start: def.models, wl: def.W, dead: false, f: freshFlags(false)
    });
  }
  function zoneOf(g, side) { return side === 0 ? { x: 0, w: g.zone } : { x: g.board.w - g.zone, w: g.zone }; }
  function inZone(g, u, x, y) { const z = zoneOf(g, u.side); return x - u.r >= z.x - 1e-6 && x + u.r <= z.x + z.w + 1e-6; }
  /* วางกำลังอัตโนมัติ: ยานใหญ่ไว้หลัง ทหารราบไว้หน้า เรียงเป็นตาราง */
  function autoDeploy(g, side) {
    const us = alive(g, side).slice().sort((a, b) => (big(b) ? 1 : 0) - (big(a) ? 1 : 0) || b.r - a.r);
    const z = zoneOf(g, side), H = g.board.h;
    us.forEach(u => { u.x = -99; u.y = -99; });
    us.forEach(u => {
      /* ตัวเลือกตำแหน่ง: ใกล้แนวกลางกระดานแนวตั้งดีกว่า, ทหารราบอยู่หน้า ยาน/ตัวละครอยู่หลัง — กระจายหลายแถว */
      const front = !big(u) && u.kind !== 'char', cands = [];
      for (let x = z.x + u.r + 0.2; x <= z.x + z.w - u.r - 0.2 + 1e-6; x += 0.5)
        for (let y = u.r + 0.3; y <= H - u.r - 0.3 + 1e-6; y += 0.5) {
          const depth = side === 0 ? (z.x + z.w - x) : (x - z.x);          /* ห่างจากขอบหน้าเขต */
          cands.push({ x, y, s: Math.abs(y - H / 2) * 0.55 + (front ? depth : Math.abs(depth - z.w * 0.6)) * 1.4 });
        }
      cands.sort((a, b) => a.s - b.s);
      for (const c of cands) {
        if (deployCheck(g, u, c.x, c.y)) continue;
        /* เว้นช่องไฟระหว่างยูนิต 0.8" ให้ดูเป็นกองทัพ ไม่ติดกันเป็นกำแพง */
        if (alive(g, side).some(v => v !== u && v.x > -50 && Math.hypot(v.x - c.x, v.y - c.y) < v.r + u.r + 0.8)) continue;
        u.x = c.x; u.y = c.y; break;
      }
      if (u.x < -50) for (const c of cands) if (!deployCheck(g, u, c.x, c.y)) { u.x = c.x; u.y = c.y; break; }
    });
  }
  function deployCheck(g, u, x, y) {
    if (!inBounds(g, u, x, y)) return 'ออกนอกโต๊ะ';
    if (!inZone(g, u, x, y)) return 'ต้องวางในเขตวางกำลังของฝ่ายตัวเอง';
    if (overlapAt(g, u, x, y)) return 'ทับโมเดลอื่น';
    if (big(u) && !has(u, 'fly') && g.terrain.some(t => t.type === 'dense' && touches({ x, y, r: u.r }, t))) return 'ยาน/สัตว์ยักษ์เข้าไปในซากตึกไม่ได้';
    return null;
  }
  function deployTo(g, u, x, y) { const e = deployCheck(g, u, x, y); if (e) return { ok: false, err: e }; u.x = x; u.y = y; return { ok: true }; }

  function createGame(opts) {
    opts = opts || {};
    const seed = opts.seed == null ? Date.now() : opts.seed;
    const rng = rngFrom(seed);
    const size = SIZES[opts.size] ? +opts.size : 1000, S = SIZES[size];
    const armies = opts.armies || ['sm', 'orks'];
    const rosters = [0, 1].map(s => (opts.rosters && opts.rosters[s] && opts.rosters[s].length) ? opts.rosters[s].filter(k => unitDef(armies[s], k)) : autoRoster(armies[s], size, rng));
    const board = { w: S.board[0], h: S.board[1] };
    const mapKey = opts.map || 'ruins';
    const g = { rng, seed, size, armies, rosters, board, zone: S.zone, map: mapKey, terrain: buildTerrain(mapKey, board.w, board.h, rng), objectives: buildObjectives(board.w, board.h),
      units: [], round: 1, first: 0, active: 0, phase: 'deploy', vp: [0, 0], cp: [0, 0], log: [], over: false, winner: null,
      diff: opts.diff || ['normal', 'normal'], oath: [null, null], waaagh: [0, 0], used: {}, marks: {}, kills: [0, 0] };
    [0, 1].forEach(side => {
      const count = {};
      rosters[side].forEach((k, i) => {
        count[k] = (count[k] || 0) + 1;
        const total = rosters[side].filter(x => x === k).length;
        g.units.push(makeUnit(unitDef(armies[side], k), armies[side], side, i, total > 1 ? count[k] : 0));
      });
      autoDeploy(g, side);
    });
    g.first = opts.first != null ? opts.first : (rng() < 0.5 ? 0 : 1);
    g.active = g.first;
    return g;
  }
  /* จบการวางกำลัง → เริ่มรอบ 1 */
  function startBattle(g) {
    g.units.filter(u => u.x < 0).forEach(u => { u.dead = true; log(g, u.name + ' หาที่วางไม่ได้ — ไม่ได้ลงสนาม', 'bad'); });
    g.phase = 'command'; g.active = g.first;
  }

  const has = (u, ab) => u.ab && u.ab.indexOf(ab) > -1;
  const rule = (g, side) => ARMIES[g.armies[side]].rule.id;
  const alive = (g, side) => g.units.filter(u => !u.dead && (side == null || u.side === side));
  const enemiesOf = (g, u) => alive(g).filter(v => v.side !== u.side);
  const engagedWith = (g, u) => enemiesOf(g, u).filter(v => edge(u, v) <= ENGAGE + 1e-9);
  const isEngaged = (g, u) => engagedWith(g, u).length > 0;
  const big = u => u.kind === 'veh' || u.kind === 'mon';
  const phaseKey = g => g.round + ':' + g.active + ':' + g.phase;
  const waaaghOn = (g, side) => rule(g, side) === 'waaagh' && g.waaagh[side] === g.round;
  function log(g, text, kind) { g.log.push({ r: g.round, side: g.active, phase: g.phase, text, kind: kind || '' }); }

  /* ---------- การมองเห็นและที่กำบัง ---------- */
  function visible(g, a, b) {
    return !g.terrain.some(t => t.type === 'dense' && !touches(a, t) && !touches(b, t) && segRect(a.x, a.y, b.x, b.y, t));
  }
  /* Benefit of Cover: ยืนในฉาก (ทหารราบ/ตัวละคร) หรือมีฉากขวางแนวยิง */
  function inCover(g, a, b) {
    if (b.kind === 'inf' || b.kind === 'char') { if (g.terrain.some(t => touches(b, t))) return true; }
    return g.terrain.some(t => !touches(a, t) && segRect(a.x, a.y, b.x, b.y, t));
  }

  /* ---------- ทอยทำแผล ---------- */
  function woundNeed(S, T) { if (S >= 2 * T) return 2; if (S > T) return 3; if (S === T) return 4; if (S * 2 <= T) return 6; return 5; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* ค่า T จริงของเป้า (Nurgle's Gift ของ Death Guard ลด T ศัตรูที่อยู่ใกล้) */
  function effT(g, b) {
    const dg = [0, 1].find(s => s !== b.side && rule(g, s) === 'contagion');
    if (dg != null && alive(g, dg).some(v => edge(v, b) <= AURA)) return Math.max(1, b.T - 1);
    return b.T;
  }
  function kwOf(g, a, w, melee) {
    const kw = w[7].slice(), r = rule(g, a.side);
    if (r === 'pacts') kw.push(melee ? 'lethal' : 'sustained');
    if (r === 'blood' && melee) kw.push('lethal');
    if (r === 'katah' && melee) kw.push('sustained');
    if (r === 'focus' && !melee) kw.push('assault');
    return kw;
  }
  const invOf = (g, b) => waaaghOn(g, b.side) ? Math.min(b.inv || 7, 5) : b.inv;

  /* คำนวณเงื่อนไขการยิงของ a ใส่ b — คืน null ถ้ายิงไม่ได้ */
  function shotInfo(g, a, b) {
    if (a.dead || b.dead || a.side === b.side || !a.ranged) return null;
    const w = a.ranged, kw = kwOf(g, a, w, false);
    if (a.f.shot || a.f.fellBack) return null;
    if (a.f.advanced && kw.indexOf('assault') < 0) return null;
    const aEng = isEngaged(g, a), bEng = isEngaged(g, b);
    let hitMod = 0; const why = [];
    if (aEng) {
      if (kw.indexOf('pistol') > -1) { if (engagedWith(g, a).indexOf(b) < 0) return null; }
      else if (big(a)) { if (engagedWith(g, a).indexOf(b) < 0) return null; hitMod -= 1; why.push('Big Guns −1'); }
      else return null;
    } else if (bEng) {
      if (!big(b)) return null;
      hitMod -= 1; why.push('ยิงเข้าวงประชิด −1');
    }
    const range = edge(a, b);
    if (range > w[1]) return null;
    if (!aEng && !visible(g, a, b)) return null;
    const cover = !aEng && kw.indexOf('torrent') < 0 && inCover(g, a, b);
    const half = range <= w[1] / 2;
    if (kw.indexOf('heavy') > -1 && !a.f.didMove && !aEng) { hitMod += 1; why.push('Heavy +1'); }
    if (has(b, 'stealth')) { hitMod -= 1; why.push('Stealth −1'); }
    if (rule(g, a.side) === 'orders' && a.kind === 'inf' && alive(g, a.side).some(o => has(o, 'officer') && edge(o, a) <= AURA)) { hitMod += 1; why.push('Take Aim! +1'); }
    if (rule(g, a.side) === 'greater' && g.marks[b.id] === phaseKey(g)) { hitMod += 1; why.push('ยิงประสาน +1'); }
    let per = w[2];
    if (kw.indexOf('rapid') > -1 && half) { per += 1; why.push('Rapid Fire +1A'); }
    if (kw.indexOf('blast') > -1 && b.models >= 5) per += Math.floor(b.models / 5);
    return { weapon: w, kw, range, cover, half, bs: w[3], hitMod: clamp(hitMod, -1, 1), attacks: per * a.models, why, melta: kw.indexOf('melta') > -1 && half };
  }
  function meleeInfo(g, u, v) {
    const w = u.melee, kw = kwOf(g, u, w, true);
    let A = w[2], S = w[4];
    if (waaaghOn(g, u.side)) { A += 1; S += 1; }
    return { weapon: [w[0], 0, A, w[3], S, w[5], w[6], kw], kw, bs: w[3], hitMod: 0, attacks: A * u.models, cover: false };
  }

  /* ทอยตามลำดับ Hit → Wound → Save → Damage (+ FNP) แล้วลงดาเมจที่ b */
  function resolve(g, a, b, w, bs, hitMod, attacks, info) {
    info = info || {};
    const rng = g.rng, kw = info.kw || w[7] || [], melee = !w[1];
    const out = { hit: [], wound: [], save: [], hits: 0, wounds: 0, unsaved: 0, dmg: 0, killed: 0, mortal: 0, notes: [] };
    const oath = rule(g, a.side) === 'oath' && g.oath[a.side] === b.id;
    const brutal = g.ai && g.ai[a.side] && g.diff[a.side] === 'brutal';
    let autoW = 0;
    if (kw.indexOf('torrent') > -1) { out.hits = attacks; for (let i = 0; i < attacks; i++) out.hit.push({ r: 6, ok: true, auto: true }); out.notes.push('Torrent โดนอัตโนมัติ'); }
    else for (let i = 0; i < attacks; i++) {
      let r = d6(rng); let ok = r !== 1 && (r === 6 || r + hitMod >= bs);
      if (!ok && (oath || (r === 1 && brutal))) { r = d6(rng); ok = r !== 1 && (r === 6 || r + hitMod >= bs); }
      const crit = ok && r === 6;
      out.hit.push({ r, ok, crit });
      if (!ok) continue;
      if (crit && kw.indexOf('lethal') > -1) autoW++; else out.hits++;
      if (crit && kw.indexOf('sustained') > -1) out.hits++;
    }
    if (oath) out.notes.push('Oath of Moment ทอยใหม่');
    if (autoW) out.notes.push('Lethal Hits ' + autoW);
    const T = effT(g, b), need = woundNeed(w[4], T);
    if (T < b.T) out.notes.push("Nurgle's Gift T" + T);
    let dev = 0;
    for (let i = 0; i < out.hits; i++) {
      const r = d6(rng), ok = r !== 1 && (r === 6 || r >= need);
      out.wound.push({ r, ok, crit: ok && r === 6 });
      if (ok) { if (r === 6 && kw.indexOf('devastating') > -1) dev++; else out.wounds++; }
    }
    out.wounds += autoW;
    const coverOK = info.cover && !(b.Sv <= 3 && w[5] === 0);
    const sv = b.Sv - w[5] - (coverOK ? 1 : 0), inv = invOf(g, b) || 7, needSv = Math.max(2, Math.min(sv, inv));
    const faith = rule(g, b.side) === 'faith' && !g.used['faith:' + b.side + ':' + phaseKey(g)];
    for (let i = 0; i < out.wounds; i++) {
      const r = d6(rng); let ok = r !== 1 && r >= needSv;
      if (!ok && faith && !g.used['faith:' + b.side + ':' + phaseKey(g)]) { ok = true; g.used['faith:' + b.side + ':' + phaseKey(g)] = 1; out.notes.push('Act of Faith เซฟผ่าน!'); }
      out.save.push({ r, ok }); if (!ok) out.unsaved++;
    }
    const D = w[6] + (info.melta ? 2 : 0);
    const before = b.models;
    for (let i = 0; i < out.unsaved && !b.dead; i++) out.dmg += damage(g, b, D, true);
    for (let i = 0; i < dev && !b.dead; i++) { const m = mortal(g, b, D); out.dmg += m; out.mortal += m; }
    if (dev) out.notes.push('Devastating Wounds ' + dev);
    out.killed = before - b.models;
    out.need = { hit: kw.indexOf('torrent') > -1 ? 0 : clamp(bs - hitMod, 2, 6), wound: need, save: needSv > 6 ? 7 : needSv };
    if (rule(g, a.side) === 'greater' && !melee) g.marks[b.id] = phaseKey(g);
    if (rule(g, a.side) === 'pacts' && !a.dead) {
      const x = d6(rng), y = d6(rng); out.pact = { dice: [x, y], pass: x + y >= a.Ld };
      if (!out.pact.pass) { mortal(g, a, 1); out.notes.push('Dark Pact ล้มเหลว: ' + a.name + ' โดน 1 mortal wound'); }
    }
    return out;
  }
  /* ดาเมจหนึ่งครั้ง: ลงโมเดลที่บาดเจ็บก่อน ดาเมจเกินไม่ทะลุ, ทอย Feel No Pain ต่อแผล */
  function damage(g, b, D, fnp) {
    let d = Math.min(D, b.wl);
    if (fnp && b.fnp) { let saved = 0; for (let i = 0; i < d; i++) if (d6(g.rng) >= b.fnp) saved++; d -= saved; }
    b.wl -= d;
    if (b.wl <= 0) { b.models--; if (b.models <= 0) { b.models = 0; b.dead = true; g.kills[1 - b.side]++; log(g, b.name + ' ถูกทำลาย!', 'dead'); } else b.wl = b.W; }
    return d;
  }
  /* mortal wound ทะลุโมเดลได้ ไม่มีเซฟ (แต่มี FNP) */
  function mortal(g, b, n) {
    let tot = 0;
    for (let i = 0; i < n && !b.dead; i++) { if (b.fnp && d6(g.rng) >= b.fnp) continue; tot += damage(g, b, 1, false); }
    return tot;
  }

  /* ---------- เคลื่อนที่ ---------- */
  function overlapAt(g, u, x, y) { return alive(g).some(v => v !== u && v.x > -50 && Math.hypot(v.x - x, v.y - y) < v.r + u.r + 0.05); }
  function inBounds(g, u, x, y) { return x - u.r >= 0 && y - u.r >= 0 && x + u.r <= g.board.w && y + u.r <= g.board.h; }
  function moveCheck(g, u, x, y, max) {
    if (!inBounds(g, u, x, y)) return 'ออกนอกโต๊ะ';
    if (Math.hypot(x - u.x, y - u.y) > max + 1e-6) return 'ไกลเกินระยะเดิน (' + max + '")';
    if (overlapAt(g, u, x, y)) return 'ทับโมเดลอื่น';
    if (big(u) && !has(u, 'fly') && g.terrain.some(t => t.type === 'dense' && touches({ x, y, r: u.r }, t))) return 'ยาน/สัตว์ยักษ์เข้าไปในซากตึกไม่ได้';
    const ghost = { x, y, r: u.r };
    if (enemiesOf(g, u).some(v => edge(ghost, v) <= ENGAGE)) return 'จบการเดินในระยะติดพัน (2") ของศัตรูไม่ได้';
    return null;
  }
  function move(g, u, x, y, mode, adv) {
    const max = u.M + (mode === 'advance' ? adv : 0);
    const err = moveCheck(g, u, x, y, max); if (err) return { ok: false, err };
    const d = Math.hypot(x - u.x, y - u.y);
    u.x = x; u.y = y; u.f.moved = d; u.f.didMove = true;
    if (mode === 'advance') u.f.advanced = true;
    if (mode === 'fallback') u.f.fellBack = true;
    return { ok: true, dist: d };
  }

  /* ---------- ชาร์จ ---------- */
  function canCharge(g, u) {
    return !u.dead && u.side === g.active && !!u.melee && (!u.f.advanced || waaaghOn(g, u.side)) && !u.f.fellBack && !u.f.charged && !isEngaged(g, u) && enemiesOf(g, u).some(v => edge(u, v) <= 12);
  }
  const chargeNeed = (u, v) => Math.max(1, Math.ceil(edge(u, v) - 1));
  function contactSpot(g, u, v) {
    const base = Math.atan2(u.y - v.y, u.x - v.x), dd = u.r + v.r + 0.5;
    for (let k = 0; k < 24; k++) {
      const ang = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
      const x = v.x + Math.cos(ang) * dd, y = v.y + Math.sin(ang) * dd;
      if (inBounds(g, u, x, y) && !overlapAt(g, u, x, y)) return { x, y };
    }
    return null;
  }
  const chargeBonus = (g, u) => rule(g, u.side) === 'blood' ? 1 : 0;
  function chargeTargets(g, u, roll) {
    return roll === 2 ? [] : enemiesOf(g, u).filter(v => edge(u, v) <= 12 && chargeNeed(u, v) <= roll + chargeBonus(g, u) && contactSpot(g, u, v));
  }
  function chargeRoll(g, u) {
    const a = d6(g.rng), b = d6(g.rng), roll = a + b;
    u.f.chargeTried = true;
    return { dice: [a, b], roll, bonus: chargeBonus(g, u), targets: chargeTargets(g, u, roll) };
  }
  function chargeTo(g, u, v) {
    const s = contactSpot(g, u, v); if (!s) return false;
    u.x = s.x; u.y = s.y; u.f.charged = true; return true;
  }

  /* ---------- Stratagem ---------- */
  const STRATS = {
    reroll: { name: 'Command Re-roll', cp: 1, desc: 'ทอยชาร์จใหม่ทั้ง 2 ลูก' },
    grenade: { name: 'Grenade', cp: 1, desc: 'ทหารราบที่ยังไม่ยิง ขว้างระเบิดใส่ศัตรูที่มองเห็นในระยะ 8" ทอย 6D6 ลูกละ 4+ = 1 mortal wound' }
  };
  function stratOK(g, side, key, u) {
    if (g.cp[side] < STRATS[key].cp) return false;
    if (g.used['s:' + key + ':' + side + ':' + phaseKey(g)]) return false;
    if (u && u.f.shocked) return false;
    return true;
  }
  function payStrat(g, side, key) { g.cp[side] -= STRATS[key].cp; g.used['s:' + key + ':' + side + ':' + phaseKey(g)] = 1; }
  function rerollCharge(g, u) {
    if (!stratOK(g, u.side, 'reroll', u)) return null;
    payStrat(g, u.side, 'reroll');
    const a = d6(g.rng), b = d6(g.rng), roll = a + b;
    log(g, u.name + ' ใช้ Command Re-roll (1 CP) ทอยชาร์จใหม่ได้ ' + roll, 'strat');
    return { dice: [a, b], roll, bonus: chargeBonus(g, u), targets: chargeTargets(g, u, roll) };
  }
  const canGrenade = (g, u) => u.kind === 'inf' && !u.f.shot && !u.f.fellBack && !isEngaged(g, u) && stratOK(g, u.side, 'grenade', u);
  const grenadeTargets = (g, u) => enemiesOf(g, u).filter(v => edge(u, v) <= 8 && !isEngaged(g, v) && visible(g, u, v));
  function grenade(g, u, v) {
    if (!canGrenade(g, u) || grenadeTargets(g, u).indexOf(v) < 0) return null;
    payStrat(g, u.side, 'grenade'); u.f.shot = true;
    const dice = []; let hits = 0;
    for (let i = 0; i < 6; i++) { const r = d6(g.rng); dice.push({ r, ok: r >= 4 }); if (r >= 4) hits++; }
    const before = v.models, dmg = mortal(g, v, hits);
    log(g, u.name + ' ขว้างระเบิด (1 CP) ใส่ ' + v.name + ': ' + hits + ' mortal wound' + (dmg < hits ? ' (FNP กันได้ ' + (hits - dmg) + ')' : ''), 'strat');
    return { dice, hits, dmg, killed: before - v.models };
  }
  function callWaaagh(g, side) {
    if (rule(g, side) !== 'waaagh' || g.waaagh[side]) return false;
    g.waaagh[side] = g.round; log(g, 'WAAAGH!!! ออร์คทั้งทัพคลั่ง — รอบนี้ A+1 S+1 ประชิด, เซฟอมตะ 5+, Advance แล้วชาร์จได้', 'strat');
    return true;
  }

  /* ---------- ต่อสู้ ---------- */
  function buildFightQueue(g) {
    const eng = alive(g).filter(u => isEngaged(g, u) && u.melee);
    const ff = eng.filter(u => u.side === g.active && u.f.charged);
    const rest = eng.filter(u => ff.indexOf(u) < 0);
    const other = rest.filter(u => u.side !== g.active), mine = rest.filter(u => u.side === g.active);
    const q = ff.slice();
    while (other.length || mine.length) { if (other.length) q.push(other.shift()); if (mine.length) q.push(mine.shift()); }
    return q.map(u => u.id);
  }
  function fightTarget(g, u) {
    const e = engagedWith(g, u); if (!e.length) return null;
    return e.sort((x, y) => (x.models * x.W) - (y.models * y.W))[0];
  }
  function fight(g, u, v) {
    const m = meleeInfo(g, u, v);
    const res = resolve(g, u, v, m.weapon, m.bs, 0, m.attacks, { kw: m.kw });
    u.f.fought = true;
    return res;
  }
  /* Pile in / Consolidate แบบย่อ: ขยับเข้าหาศัตรูที่ใกล้ที่สุดไม่เกิน 3" */
  function consolidate(g, u) {
    if (u.dead || isEngaged(g, u)) return null;
    const foes = enemiesOf(g, u).filter(v => edge(u, v) <= 3 + ENGAGE); if (!foes.length) return null;
    const v = foes.sort((a, b) => edge(u, a) - edge(u, b))[0];
    const s = contactSpot(g, u, v); if (!s || Math.hypot(s.x - u.x, s.y - u.y) > 3.01) return null;
    const from = { x: u.x, y: u.y }; u.x = s.x; u.y = s.y; return { from, to: s, v };
  }

  /* ---------- จุดยึด ---------- */
  function control(g) {
    return g.objectives.map(o => {
      const oc = [0, 0];
      alive(g).forEach(u => { if (edge(u, { x: o.x, y: o.y, r: 0 }) <= OBJ_RANGE) oc[u.side] += u.f.shocked ? 0 : u.OC * u.models; });
      return { oc, owner: oc[0] > oc[1] ? 0 : oc[1] > oc[0] ? 1 : null };
    });
  }
  function score(g, side) {
    const n = control(g).filter(c => c.owner === side).length;
    const vp = Math.min(15, n * 5);
    g.vp[side] += vp;
    log(g, SIDE[side] + ' คุม ' + n + ' จุด ได้ ' + vp + ' VP', 'vp');
    return vp;
  }

  /* ---------- เฟสสั่งการ ---------- */
  const belowHalf = u => u.start > 1 ? u.models * 2 <= u.start : u.wl * 2 <= u.W;
  const shockImmune = (g, u) => alive(g, u.side).some(o => (has(o, 'synapse') || has(o, 'aura')) && edge(o, u) <= AURA);
  function pickOath(g, side) {
    const foes = alive(g, 1 - side); if (!foes.length) return null;
    const val = v => v.pts * (v.models * v.W - (v.W - v.wl)) / (v.start * v.W) / (1 + Math.max(0, Math.min(...alive(g, side).map(u => edge(u, v)))) / 24);
    return foes.sort((a, b) => val(b) - val(a))[0];
  }
  function commandPhase(g) {
    g.cp[0]++; g.cp[1]++;
    if (g.diff[g.active] === 'brutal' && g.ai && g.ai[g.active]) g.cp[g.active]++;
    const out = { tests: [], heals: [] };
    const side = g.active, r = rule(g, side);
    if (r === 'reanimate') alive(g, side).forEach(u => {
      if (u.models === u.start && u.wl === u.W) return;
      let n = d3(g.rng), got = 0;
      for (let k = 0; k < n; k++) { if (u.wl < u.W) { u.wl++; got++; } else if (u.models < u.start) { u.models++; u.wl = 1; got++; } }
      if (got) { out.heals.push({ u, n: got }); log(g, u.name + ' Reanimation Protocols ซ่อมตัวเอง ' + got + ' แผล', 'good'); }
    });
    if (r === 'oath') { const t = pickOath(g, side); g.oath[side] = t ? t.id : null; if (t) log(g, 'Oath of Moment: สาบานจะทำลาย ' + t.name, 'strat'); }
    alive(g, side).forEach(u => {
      if (belowHalf(u) || u.f.shocked) {
        if (shockImmune(g, u)) { u.f.shocked = false; out.tests.push({ u, dice: [], pass: true, auto: true }); log(g, u.name + ' ผ่านการทดสอบขวัญอัตโนมัติ (' + (r === 'synapse' ? 'Synapse' : 'ผู้นำใกล้ตัว') + ')'); return; }
        const a = d6(g.rng), b = d6(g.rng), pass = a + b >= u.Ld;
        u.f.shocked = !pass;
        out.tests.push({ u, dice: [a, b], pass });
        log(g, u.name + ' ทดสอบ Battle-shock ทอย ' + (a + b) + (pass ? ' ผ่าน' : ' ไม่ผ่าน — ขวัญแตก (OC = 0)'), pass ? '' : 'bad');
      }
    });
    if (g.round >= 2) score(g, side);
    return out;
  }

  /* ---------- เดินเฟส / เทิร์น ---------- */
  function nextPhase(g) {
    if (g.over) return;
    const i = PHASES.indexOf(g.phase);
    if (i < PHASES.length - 1) { g.phase = PHASES[i + 1]; return; }
    endTurn(g);
  }
  function endTurn(g) {
    const second = 1 - g.first;
    if (g.active === second && g.round === ROUNDS) { score(g, second); return finish(g); }
    if (g.active === second) g.round++;
    g.active = 1 - g.active; g.phase = 'command';
    alive(g).forEach(u => { u.f = freshFlags(u.f.shocked); });
  }
  function finish(g) {
    g.over = true; g.phase = 'end';
    g.winner = g.vp[0] > g.vp[1] ? 0 : g.vp[1] > g.vp[0] ? 1 : null;
    log(g, 'จบเกม! ' + (g.winner == null ? 'เสมอ' : SIDE[g.winner] + ' ชนะ') + ' (' + g.vp[0] + ' : ' + g.vp[1] + ' VP)', 'end');
  }
  function checkWipe(g) {
    if (g.over) return true;
    if (g.phase === 'deploy') return false;
    for (const s of [0, 1]) if (!alive(g, s).length) { g.over = true; g.phase = 'end'; g.winner = 1 - s; log(g, 'จบเกม! ' + SIDE[1 - s] + ' กวาดล้างศัตรูหมด', 'end'); return true; }
    return false;
  }

  /* ---------- AI ---------- */
  function expected(g, a, b, w, bs, hitMod, attacks, kw) {
    kw = kw || w[7] || [];
    const ph = kw.indexOf('torrent') > -1 ? 1 : clamp(7 - clamp(bs - hitMod, 2, 6), 1, 5) / 6, pw = (7 - woundNeed(w[4], effT(g, b))) / 6;
    const sv = Math.min(b.Sv - w[5], invOf(g, b) || 7), pu = sv >= 7 ? 1 : clamp(sv - 1, 1, 6) / 6;
    return attacks * ph * pw * pu * Math.min(w[6], b.W);
  }
  const rangedPow = u => u.ranged ? u.ranged[2] * u.models * u.ranged[6] * (u.ranged[3] ? (7 - u.ranged[3]) : 5) : 0;
  const meleePow = u => u.melee ? u.melee[2] * u.models * u.melee[6] * (7 - u.melee[3]) : 0;
  const meleeMinded = u => meleePow(u) >= rangedPow(u) * 1.2;
  function stepToward(g, u, tx, ty, max, stopEdge) {
    const d = Math.hypot(tx - u.x, ty - u.y); if (d < 0.01) return null;
    const want = Math.max(0, Math.min(max, d - stopEdge));
    for (let s = want; s > 0.2; s -= 0.5) {
      for (const off of [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1, 1.5, -1.5]) {
        const ang = Math.atan2(ty - u.y, tx - u.x) + off;
        const x = u.x + Math.cos(ang) * s, y = u.y + Math.sin(ang) * s;
        if (!moveCheck(g, u, x, y, max)) return { x, y };
      }
    }
    return null;
  }
  /* มูลค่าของการยิง/ฟันเป้า: ความเสียหายคาดหวัง × มูลค่าแต้มต่อแผล + โบนัสถ้าฆ่าได้/เป้าบนจุดยึด */
  function targetScore(g, a, v, e, lvl) {
    if (lvl === 'normal') return e + (v.kind === 'char' ? 0.5 : 0);
    const hp = v.models > 1 ? (v.models - 1) * v.W + v.wl : v.wl;
    const perW = v.pts / (v.start * v.W);
    let s = Math.min(e, hp) * perW;
    if (e >= hp * 0.9) s *= 1.6;
    if (g.objectives.some(o => edge(v, { x: o.x, y: o.y, r: 0 }) <= OBJ_RANGE)) s *= 1.3;
    if (g.oath[a.side] === v.id) s *= 1.25;
    return s;
  }
  function aiMovePlan(g, u, lvl) {
    const foes = enemiesOf(g, u); if (!foes.length) return null;
    const rng = g.rng;
    if (lvl === 'easy' && rng() < 0.3) return null;
    if (isEngaged(g, u)) {
      if (meleeMinded(u) || !u.ranged) return null;
      const e = engagedWith(g, u)[0], ang = Math.atan2(u.y - e.y, u.x - e.x);
      for (let s = u.M; s > 1; s -= 1) for (const off of [0, 0.5, -0.5, 1, -1]) {
        const x = u.x + Math.cos(ang + off) * s, y = u.y + Math.sin(ang + off) * s;
        if (!moveCheck(g, u, x, y, u.M)) return { x, y, mode: 'fallback' };
      }
      return null;
    }
    const smart = lvl === 'hard' || lvl === 'brutal';
    if (meleeMinded(u) || !u.ranged) {
      const t = foes.slice().sort((p, q) => edge(u, p) - edge(u, q))[0];
      const dist = edge(u, t);
      if (lvl !== 'easy') {
        const objD = o => edge(u, { x: o.x, y: o.y, r: 0 }), ctrl = control(g);
        const hold = g.objectives.find(o => objD(o) <= OBJ_RANGE);
        /* เฝ้าจุดยึด: ถ้าเป็นยูนิตเดียวที่ยืนคุมและศัตรูยังไกล ให้อยู่กับที่ */
        if (hold && dist > 9 && alive(g, u.side).filter(v => edge(v, { x: hold.x, y: hold.y, r: 0 }) <= OBJ_RANGE).length === 1) return null;
        /* ศัตรูยังไกล → แวะยึดจุดที่ใกล้กว่าระหว่างทาง */
        if (dist > u.M + 9) {
          const c = g.objectives.map((o, i) => ({ o, i })).filter(x => ctrl[x.i].owner !== u.side && !(g._claims && g._claims[x.i])).sort((a, b) => objD(a.o) - objD(b.o))[0];
          if (c && objD(c.o) < dist) { if (g._claims) g._claims[c.i] = 1; const sp = stepToward(g, u, c.o.x, c.o.y, u.M, u.r + 0.5); if (sp) return Object.assign(sp, { mode: 'normal' }); }
        }
      }
      /* ศัตรูไกลมากและยูนิตไม่มีปืน → Advance เข้าหา (ไม่ได้ชาร์จเทิร์นนี้อยู่แล้ว) */
      if (smart && !u.ranged && dist - u.M > 14) { const adv = d6(rng), sp = stepToward(g, u, t.x, t.y, u.M + adv, u.r + t.r + ENGAGE + 0.3); if (sp) return Object.assign(sp, { mode: 'advance', adv }); }
      const spot = stepToward(g, u, t.x, t.y, u.M, u.r + t.r + ENGAGE + 0.3);
      return spot ? Object.assign(spot, { mode: 'normal' }) : null;
    }
    /* ยิง: บอทฉลาดยืนนิ่งถ้ามีอาวุธ Heavy และมีเป้าอยู่แล้ว หรือยืนคุมจุดยึดอยู่ */
    const ctrl = control(g);
    const onObj = g.objectives.some(o => edge(u, { x: o.x, y: o.y, r: 0 }) <= OBJ_RANGE - 0.5);
    if (smart && u.ranged[7].indexOf('heavy') > -1 && foes.some(v => shotInfo(g, u, v))) return null;
    let objs = g.objectives.map((o, i) => ({ o, i, d: cdist(u, o) })).filter(x => ctrl[x.i].owner !== u.side || edge(u, { x: x.o.x, y: x.o.y, r: 0 }) <= OBJ_RANGE)
      .sort((p, q) => p.d - q.d);
    /* บอทฉลาดกระจายกำลัง: ไม่ส่งทุกยูนิตไปจุดเดียวกัน */
    if (smart && g._claims) { const free = objs.filter(x => !g._claims[x.i] || edge(u, { x: x.o.x, y: x.o.y, r: 0 }) <= OBJ_RANGE); if (free.length) objs = free; if (objs[0]) g._claims[objs[0].i] = 1; }
    const tgt = objs[0] || { o: foes[0] };
    if (onObj && (objs[0] && edge(u, { x: objs[0].o.x, y: objs[0].o.y, r: 0 }) <= OBJ_RANGE)) return null;
    const spot = stepToward(g, u, tgt.o.x, tgt.o.y, u.M, u.r + 0.5);
    return spot ? Object.assign(spot, { mode: 'normal' }) : null;
  }
  function aiShootTarget(g, u, lvl) {
    const opts = [];
    enemiesOf(g, u).forEach(v => { const s = shotInfo(g, u, v); if (!s) return; const e = expected(g, u, v, s.weapon, s.bs, s.hitMod, s.attacks, s.kw); opts.push({ v, s, e, sc: targetScore(g, u, v, e, lvl) }); });
    if (!opts.length) return null;
    if (lvl === 'easy') return opts[Math.floor(g.rng() * opts.length)];
    return opts.sort((a, b) => b.sc - a.sc)[0];
  }
  function aiChargeWanted(g, u, lvl) {
    if (!canCharge(g, u)) return false;
    if (lvl === 'easy') return meleeMinded(u) && g.rng() < 0.5;
    if (lvl === 'normal') return meleeMinded(u) || !u.ranged;
    return meleeMinded(u) || !u.ranged || meleePow(u) > 0 && enemiesOf(g, u).some(v => edge(u, v) <= 7 && meleePow(v) < meleePow(u));
  }

  /* AI เล่นหนึ่งเฟส — คืนรายการเหตุการณ์ให้หน้าเว็บเล่นแอนิเมชันตาม */
  function aiPhase(g) {
    const ev = [], side = g.active, lvl = g.diff[side] || 'normal', smart = lvl === 'hard' || lvl === 'brutal';
    if (g.over) return ev;
    if (g.phase === 'movement') {
      if (rule(g, side) === 'waaagh' && !g.waaagh[side] && lvl !== 'easy') {
        const close = alive(g, side).some(u => enemiesOf(g, u).some(v => edge(u, v) <= 14));
        if (close || g.round >= 3) { callWaaagh(g, side); ev.push({ t: 'waaagh', side }); }
      }
      g._claims = {};
      alive(g, side).slice().sort((a, b) => smart ? (a.OC * a.models) - (b.OC * b.models) : (meleeMinded(b) ? 1 : 0) - (meleeMinded(a) ? 1 : 0)).forEach(u => {
        const p = aiMovePlan(g, u, lvl); if (!p) return;
        const from = { x: u.x, y: u.y }, r = move(g, u, p.x, p.y, p.mode, p.adv || 0);
        if (r.ok) ev.push({ t: 'move', u: u.id, from, to: { x: u.x, y: u.y }, mode: p.mode, adv: p.adv });
      });
    } else if (g.phase === 'shooting') {
      /* บอทฉลาดยิงด้วยอาวุธแรงก่อน แล้วค่อยเก็บเป้าที่บาดเจ็บ */
      const shooters = alive(g, side).slice();
      if (smart) shooters.sort((a, b) => rangedPow(b) - rangedPow(a));
      shooters.forEach(u => {
        if (u.dead) return;
        if (smart && canGrenade(g, u)) {
          const gt = grenadeTargets(g, u), best = aiShootTarget(g, u, lvl);
          if (gt.length && (!best || best.e < 1.2)) {
            const v = gt.sort((a, b) => targetScore(g, u, b, 3, lvl) - targetScore(g, u, a, 3, lvl))[0];
            const res = grenade(g, u, v); if (res) { ev.push({ t: 'grenade', u: u.id, v: v.id, res }); return; }
          }
        }
        const b = aiShootTarget(g, u, lvl); if (!b) return;
        const res = resolve(g, u, b.v, b.s.weapon, b.s.bs, b.s.hitMod, b.s.attacks, b.s); u.f.shot = true;
        ev.push({ t: 'shoot', u: u.id, v: b.v.id, res, info: { cover: b.s.cover, bs: b.s.bs, hitMod: b.s.hitMod, attacks: b.s.attacks, weapon: b.s.weapon[0], why: b.s.why } });
      });
    } else if (g.phase === 'charge') {
      alive(g, side).filter(u => aiChargeWanted(g, u, lvl)).forEach(u => {
        if (!canCharge(g, u)) return;
        let c = chargeRoll(g, u); const from = { x: u.x, y: u.y };
        let rr = null;
        if (!c.targets.length && smart && stratOK(g, side, 'reroll', u) && enemiesOf(g, u).some(v => chargeNeed(u, v) - chargeBonus(g, u) <= 9)) { rr = c; c = rerollCharge(g, u); }
        const pick = c.targets.sort((p, q) => smart ? targetScore(g, u, q, meleePow(u) / 6, lvl) - targetScore(g, u, p, meleePow(u) / 6, lvl) : edge(u, p) - edge(u, q))[0];
        const ok = !!pick && chargeTo(g, u, pick);
        ev.push({ t: 'charge', u: u.id, v: pick ? pick.id : null, dice: c.dice, roll: c.roll, bonus: c.bonus, ok, from, to: { x: u.x, y: u.y }, rr });
      });
    } else if (g.phase === 'fight') {
      ev.push.apply(ev, fightAll(g));
    }
    return ev;
  }
  function fightAll(g) {
    const ev = [], q = buildFightQueue(g);
    q.forEach(id => {
      const u = g.units.find(x => x.id === id); if (!u || u.dead || u.f.fought) return;
      const v = fightTarget(g, u); if (!v) return;
      ev.push({ t: 'fight', u: u.id, v: v.id, res: fight(g, u, v), first: u.f.charged && u.side === g.active });
      if (v.dead) { const c = consolidate(g, u); if (c) ev.push({ t: 'consolidate', u: u.id, from: c.from, to: c.to }); }
    });
    return ev;
  }

  const API = { ENGAGE, OBJ_RANGE, ROUNDS, AURA, PHASES, PHASE_TH, DIFF, SIDE, ARMIES, MAPS, SIZES, STRATS, rngFrom, d6, cdist, edge, segRect, touches,
    unitDef, rosterPts, unitCap, autoRoster, PRESETS, presetRoster, createGame, startBattle, autoDeploy, deployCheck, deployTo, zoneOf, alive, enemiesOf, engagedWith, isEngaged, visible, inCover,
    woundNeed, effT, shotInfo, meleeInfo, resolve, damage, mortal, moveCheck, move, canCharge, chargeNeed, contactSpot, chargeRoll, chargeTo, chargeTargets,
    stratOK, rerollCharge, canGrenade, grenadeTargets, grenade, callWaaagh, waaaghOn, rule, has, buildFightQueue, fightTarget, fight, consolidate,
    control, score, commandPhase, nextPhase, endTurn, checkWipe, belowHalf, expected, meleeMinded, aiMovePlan, aiShootTarget, aiPhase, fightAll, log };
  root.TT = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
