/* =========================================================
   แชทบอท 40K — ตอบจากเนื้อหาในเว็บนี้ก่อนเสมอ (ไม่มี AI, ไม่มีเซิร์ฟเวอร์, ฟรีถาวร)
   ถ้าไม่เจอในเว็บ จะส่งต่อให้ js/chatbot-translate.js ไปค้น Warhammer 40k Wiki แทน
   ต้องโหลดหลัง: js/search.js, js/chatbot-lexicon.js, js/chatbot-data.js

   ไฟล์นี้แบ่งเป็น 2 ส่วน:
   ① ฟังก์ชันล้วน (pure) — ทดสอบได้ใน node ไม่ต้องมี DOM → ดู gen/test-chatbot.js
   ② UI — ปุ่มลอย/แผงแชท ทำงานเฉพาะมี document (ข้ามตอนทดสอบใน node)
   ========================================================= */
(function () {
  const hasDOM = typeof document !== 'undefined' && !!document.body;
  // let (ไม่ใช่ const): เมื่อโหลดจริงในเบราว์เซอร์ chatbot-data.js อาจยังไม่โหลดตอนไฟล์นี้รัน
  // (ดูการโหลดแบบ lazy ตอนเปิดแชทครั้งแรกในส่วน UI ด้านล่าง — loadDataModule() จะ reassign ตัวนี้)
  let D = window.CHAT_DATA;
  /* ค่าเกณฑ์ปรับจากการทดสอบจริงด้วย gen/test-chatbot.js (ไม่ใช่ค่าเดา) — คำถามธรรมชาติ 2 คำ AND กัน
     (เช่น "Blood Angels ต้นกำเนิด" หรือ "Ultramarines เล่นยังไง") มักได้คะแนนราว 25–40 แม้ตรงหน้าถูกต้องแล้ว
     เพราะคะแนนของ search.js ถูกออกแบบมาสำหรับกล่องค้นหาคำสั้น ไม่ใช่ประโยคคำถาม */
  const ANSWER_MIN = 25;   // คะแนนขั้นต่ำที่ถือว่า "เว็บมีคำตอบจริง"
  const RELATED_MIN = 10;  // คะแนนขั้นต่ำที่ถือว่า "ใกล้เคียงพอจะแนะนำ"

  /* ---------- ① ฟังก์ชันล้วน ---------- */

  /* normalize ของแชทบอท: ใช้ SiteSearch.norm เป็นฐาน + แปลงเลขไทยเป็นอารบิก
     (ไม่เขียนตัวค้นหาใหม่ซ้ำกับ search.js — ใช้ norm/search/snippet จากไฟล์นั้นต่อ) */
  function normTx(s) {
    const base = window.SiteSearch ? window.SiteSearch.norm(s) : String(s || '').toLowerCase().trim();
    return base.replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ตัดคำฟุ่มเฟือยออกก่อนค้นหา
     - คำไทย: ตัดแบบ substring (ภาษาไทยไม่มีช่องว่างคั่นคำ จึงตัดเป็นช่วง ๆ แทนการตัดคำจริง)
     - คำอังกฤษ: ต้องตัดแบบขอบคำ (\b) เท่านั้น ไม่งั้นคำสั้นอย่าง "an"/"a"/"is" จะไปตัดกลางชื่อเฉพาะ
       เช่น "an" ใน "Gulliman" หรือ "is" ใน "Thousand Sons" */
  function removeStopwords(q) {
    let s = ' ' + q + ' ';
    const thaiWords = D.STOPWORDS.filter(w => /[฀-๿]/.test(w)).sort((a, b) => b.length - a.length);
    const enWords = D.STOPWORDS.filter(w => /^[a-z]+$/i.test(w));
    for (const w of thaiWords) s = s.split(normTx(w)).join(' ');
    for (const w of enWords) s = s.replace(new RegExp('\\b' + w + '\\b', 'gi'), ' ');
    return s.replace(/\s+/g, ' ').trim();
  }

  function hasAny(text, list) {
    return list.some(w => text.indexOf(normTx(w)) > -1);
  }

  /* หาชื่อเฉพาะ 40K ในข้อความ: จับคำยาวก่อนสั้น (longest-match-first) กันคำสั้นไปจับซ้อนในคำยาว
     เช่น ถ้ามี "Blood Angels" และ "Angel" อยู่ในคลัง ให้จับ "Blood Angels" ก่อน
     ตรวจทั้งชื่ออังกฤษ (entry[0]) และคำอ่านไทย (entry[1]) — คำอ่านไทยเทียบแบบยอมให้เว้น/ไม่เว้นวรรคต่างกันได้
     (ผู้ใช้มักพิมพ์ "สเปซมารีน" ติดกัน ขณะที่เว็บเขียน "สเปซ มารีน" มีวรรค) และยอมรับพหูพจน์/เอกพจน์ของชื่ออังกฤษ
     (เช่น "Necron" ควรเจอ "Necrons") ด้วยขอบคำ กันจับคำสั้นผิดที่ */
  function findLexiconHits(text) {
    const lexicon = window.CHAT_LEXICON || [];
    const sorted = lexicon.slice().sort((a, b) =>
      Math.max(b[0].length, (b[1] || '').length) - Math.max(a[0].length, (a[1] || '').length));
    const hits = [];
    let remaining = ' ' + text + ' ';
    for (const entry of sorted) {
      const enKey = normTx(entry[0]);
      let matched = false;
      if (enKey.length >= 3 && remaining.indexOf(enKey) > -1) matched = true;
      if (!matched && enKey.length >= 4 && enKey.endsWith('s')) {
        const singular = enKey.slice(0, -1);
        if (new RegExp('\\b' + escapeRe(singular) + '\\b').test(remaining)) matched = true;
      }
      if (matched) { hits.push(entry); remaining = remaining.split(enKey).join(' '); continue; }
      const th = entry[1];
      if (th && th.length >= 3) {
        // แปลง "สเปซ มารีน" เป็น regex ที่มีวรรคหรือไม่มีก็เจอ แล้วลบส่วนที่เจอออกจาก remaining ด้วย
        const thRe = new RegExp(th.trim().split(/\s+/).map(escapeRe).join('\\s*'));
        if (thRe.test(remaining)) { hits.push(entry); remaining = remaining.replace(thRe, ' '); }
      }
    }
    return { hits, remaining: remaining.replace(/\s+/g, ' ').trim() };
  }

  const CANNED_KEYS = ['greet', 'thanks', 'bye', 'whoami'];
  function detectIntent(q) {
    // greet/thanks/bye/whoami ต้องอยู่ "ต้นประโยค" เท่านั้น ไม่งั้นคำว่า hello/hi ที่เป็นเนื้อหา
    // (เช่น "แปลคำว่า hello เป็นไทย") จะถูกเข้าใจผิดว่าทักทาย
    for (const key of CANNED_KEYS) {
      if (D.INTENT_WORDS[key].some(w => q.trim().startsWith(normTx(w)))) return key;
    }
    for (const key of Object.keys(D.INTENT_WORDS)) {
      if (CANNED_KEYS.includes(key)) continue;
      if (hasAny(q, D.INTENT_WORDS[key])) return key;
    }
    return null;
  }

  function matchFAQ(q) {
    for (const f of D.FAQ_BOOSTS) {
      if (f.patterns.some(p => q.indexOf(normTx(p)) > -1)) return f;
    }
    return null;
  }

  /* ---------- จับคำพิมพ์ผิดเล็กน้อย (ทั้งอังกฤษและไทย) ด้วย edit distance ----------
     ใช้ได้ทั้งสองภาษาเพราะเป็นการเทียบ "ตัวอักษร" ล้วน ๆ ไม่สนไวยากรณ์ — ก่อนเทียบจะตัดช่องว่างออกทั้งคู่
     (กัน "สเปซ มารีน" ในเว็บ ต่างจาก "สเปสมารีน" ที่พิมพ์ติดกัน ให้นับเป็นแค่ 1 ตัวต่าง ไม่ใช่ 2)
     ใช้ Damerau-Levenshtein (นับสลับอักษรติดกัน เช่น "Horsu"↔"Horus" เป็นแค่ 1 จุดผิด ไม่ใช่ 2)
     เพราะสลับอักษรเป็นรูปแบบพิมพ์ผิดที่พบบ่อยที่สุด — เกณฑ์: คำยาว ≤ 6 ตัวอักษร ยอมผิดได้ 1 ตัว,
     ยาวกว่านั้นยอมผิดได้ 2 ตัว (ตามที่ออกแบบไว้แต่แรก) */
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // สลับอักษรที่อยู่ติดกัน นับเป็น 1 จุดผิด
        }
      }
    }
    return d[m][n];
  }
  const maxEditDist = len => (len <= 6 ? 1 : 2);

  /** ลองหาว่าข้อความ (ที่หาแบบตรงตัวไม่เจอ) สะกดใกล้เคียงชื่อในคลังชื่อใดไหม — ไทยเทียบกับคำอ่าน
      อังกฤษเทียบกับชื่อโรมัน คืน {entry, dist} ของตัวที่ใกล้สุด (ถ้ามีมากกว่า 1 ตัวใกล้เท่ากัน ถือว่ากำกวม ไม่เดา) */
  function fuzzyLexiconMatch(text) {
    const noSpace = normTx(text).replace(/\s+/g, '');
    if (noSpace.length < 3 || noSpace.length > 24) return null; // สั้นเกินไปเสี่ยงมั่ว / ยาวเกินไปไม่ใช่แค่ชื่อเดียว
    const isLatin = /^[a-z']+$/i.test(noSpace);
    const lexicon = window.CHAT_LEXICON || [];
    let best = null, bestDist = Infinity, tie = false;
    for (const entry of lexicon) {
      const candRaw = isLatin ? entry[0] : entry[1];
      if (!candRaw) continue;
      const cand = normTx(candRaw).replace(/\s+/g, '');
      if (cand === noSpace) continue; // ตรงเป๊ะอยู่แล้วแปลว่า findLexiconHits ต้องเจอไปก่อนหน้านี้แล้ว ไม่ใช่กรณีพิมพ์ผิด
      if (Math.abs(cand.length - noSpace.length) > maxEditDist(Math.max(cand.length, noSpace.length))) continue;
      const d = levenshtein(noSpace, cand);
      if (d > maxEditDist(cand.length)) continue;
      if (d < bestDist) { bestDist = d; best = entry; tie = false; }
      else if (d === bestDist && best && best[0] !== entry[0]) tie = true; // ใกล้เคียงกันหลายชื่อ — กำกวม
    }
    return best && !tie ? { entry: best, dist: bestDist, guess: text } : null;
  }

  /* คำแปลไทย (ไม่ใช่คำทับศัพท์) ของศัพท์ 40K เช่น "ปีศาจ" → Daemon — คลังชื่อเฉพาะเก็บแต่คำอ่านทับศัพท์
     (ดีมอน) จึงหาด้วยคำแปลตรง ๆ ไม่เจอ ฟังก์ชันนี้คืนรายการ lexicon entry ที่ควรเติมเข้า hits */
  function matchConcepts(q) {
    const lexicon = window.CHAT_LEXICON || [];
    const found = [];
    for (const c of D.CONCEPT_SYNONYMS) {
      if (!c.patterns.some(p => q.indexOf(normTx(p)) > -1)) continue;
      const entry = lexicon.find(e => e[0].toLowerCase() === c.lexiconKey.toLowerCase());
      if (entry) found.push(entry);
    }
    return found;
  }

  const CANNED_INTENTS = ['greet', 'thanks', 'bye', 'whoami'];

  /** ตัดสินว่าคำถามนี้ตอบได้ไหม + เตรียมคำค้นสำหรับค้นในเว็บ
      state: { lastEntity, lastTopicIs40k, lastTpl } — เก็บไว้ที่ผู้เรียก (sessionStorage) */
  function classify(rawQuery, state) {
    state = state || {};
    let q = normTx(rawQuery);
    const intent = detectIntent(q);
    if (CANNED_INTENTS.includes(intent)) return { kind: intent, rawQuery };

    // แทนคำอ้างอิง (เขา/ทัพนี้/...) ด้วยชื่อที่คุยถึงล่าสุด ถ้าคำถามนี้ยังไม่มีชื่อใหม่ของตัวเอง
    // ครอบคลุมทั้งกรณีมีคำอ้างอิงตรง ๆ ("แล้วเขาตายยังไง") และกรณีพูดสั้น ๆ ต่อท้ายโดยไม่มีคำอ้างอิงเลย
    // ("ต้นกำเนิด" ต่อจาก "Blood Angels") ตราบใดที่เทิร์นก่อนยังเป็นเรื่อง 40K อยู่
    const selfHits = findLexiconHits(q).hits;
    const hasPronoun = hasAny(q, D.PRONOUNS);
    let usedPronoun = false;
    if (!selfHits.length && state.lastEntity && (hasPronoun || (state.lastTopicIs40k && q.length <= 15))) {
      q = q + ' ' + normTx(state.lastEntity[0]);
      usedPronoun = true;
    }

    const { hits, remaining: remainingWithPronoun } = findLexiconHits(q);
    // ตัดคำอ้างอิงที่เหลือออกจากส่วนที่จะเอาไปค้นหาต่อ (ใช้แทนชื่อไปแล้ว ไม่ควรติดไปเป็นคำค้นด้วย)
    let remaining = remainingWithPronoun;
    if (usedPronoun) D.PRONOUNS.filter(p => /[฀-๿]/.test(p)).forEach(p => { remaining = remaining.split(normTx(p)).join(' '); });
    // เติมชื่ออังกฤษจากคำแปลไทยที่รู้จัก (เช่น "ปีศาจ" → Daemon) เข้า hits ด้วย ก่อนตัดสินหัวข้อและเตรียมคำค้น
    matchConcepts(q).forEach(entry => { if (!hits.some(h => h[0] === entry[0])) hits.push(entry); });

    const remainder = removeStopwords(remaining);
    // พิมพ์ผิด (ทั้งอังกฤษและไทย): ลองเฉพาะตอนยังไม่เจอชื่ออะไรเลย และสิ่งที่เหลือดูเหมือนชื่อเดียว (ไม่ใช่ประโยคยาว)
    let corrected = null;
    if (!hits.length && remainder && remainder.length <= 20) {
      const fz = fuzzyLexiconMatch(remainder);
      if (fz) { hits.push(fz.entry); corrected = fz; }
    }

    const faq = matchFAQ(q);
    const hasContext = hasAny(q, D.CONTEXT_WORDS);
    const hasOfftopic = hasAny(q, D.OFFTOPIC_WORDS);
    const looksLikeProperNoun = /[A-Za-z]{4,}/.test(q); // อาจเป็นชื่อเฉพาะภาษาอังกฤษที่คลังยังไม่มี

    let level;
    if (faq || hits.length || hasContext) level = 'yes';
    else if (state.lastTopicIs40k && q.length <= 24) level = 'yes'; // คำถามสั้นต่อท้ายบทสนทนาเดิม เช่น "แล้วตายยังไง"
    else if (looksLikeProperNoun) level = 'unsure';
    else level = 'no';
    // คำนอกเรื่องชัดเจนชนะเสมอ แม้มีชื่อ 40K ปนอยู่ด้วยก็ตาม (เช่น "เขียนโค้ด python ชื่อ Horus")
    if (hasOfftopic) level = 'no';

    // ถ้าพิมพ์ผิดแล้วเจอชื่อ ตัดชื่อที่ "เดา" ออกจากคำค้นด้วย (เอาชื่อที่แก้แล้วไปค้นแทน ไม่ใช่คำที่พิมพ์ผิดเดิม)
    const searchRemainder = corrected ? '' : remainder;
    const searchQuery = faq ? '' : [hits.map(h => h[0]).join(' '), searchRemainder].filter(Boolean).join(' ').trim();

    return { kind: 'ask', level, intent, faq, hits, searchQuery, usedPronoun, corrected, rawQuery };
  }

  /* ---------- หมายเหตุ: เคยลองทำ "ค้นแบบคล้ายกัน" ด้วยอักขระคู่/สาม (bigram/trigram Dice coefficient)
     เป็นตาข่ายรองรับชั้นสุดท้ายสำหรับคำถามที่ใช้คำคนละชุดกับเว็บ แล้วถอดออกเพราะวัดจริงกับดัชนีทั้ง 2,695
     รายการแล้วพบว่า "แยกแยะไม่ได้จริง" — คู่ที่เกี่ยวข้องจริง (เช่น "ทอยเต๋าโจมตียังไง" กับหน้า combat.html)
     ได้คะแนนความคล้าย ~0.14-0.21 ขณะที่คู่ที่ไม่เกี่ยวข้องเลย (เช่น "อากาศพรุ่งนี้จะเป็นยังไง" กับหน้า Warp)
     บางคู่ได้คะแนนสูงถึง ~0.20 พอ ๆ กัน เพราะดัชนีมีคำเชื่อมภาษาไทยซ้ำกันมากจนบังสัญญาณจริง ไม่มีค่า threshold
     ไหนแยกสองกลุ่มนี้ได้ จึงไม่ปลอดภัยพอจะใช้แนะนำผู้ใช้ (จะแนะนำมั่ว ๆ ด้วยความมั่นใจเท่ากับของจริง)
     ทางที่ดีกว่าและทำไปแล้วคือ CONCEPT_SYNONYMS ใน chatbot-data.js ซึ่งเจาะจงแม่นยำกว่ามาก */

  /** จัดอันดับผลค้นจากเว็บ: ใช้ SiteSearch.searchScored เป็นฐาน แล้วปรับคะแนนตาม intent/คำถามสำเร็จรูป
      คืนอาร์เรย์ {e, score} เรียงดีสุดก่อน และรวมรายการซ้ำของหน้าเดียวกันเป็นตัวเดียว (dedupe by base url) */
  function rankSiteResults(index, plan) {
    if (plan.faq) {
      const baseWanted = plan.faq.url.split('?')[0].split('#')[0];
      const cands = index.filter(e => e[0] === plan.faq.url || e[0].split('?')[0].split('#')[0] === baseWanted);
      if (cands.length) {
        const exact = cands.find(e => e[0] === plan.faq.url) || cands[0];
        return [{ e: exact, score: 999 }];
      }
    }
    if (!plan.searchQuery) return [];
    const scored = window.SiteSearch.searchScored(index, plan.searchQuery, 80);
    const byBase = new Map();
    for (const { e, score } of scored) {
      let bonus = 0;
      const titleN = normTx(e[1]), cat = e[3];
      const hash = (e[0].split('#')[1] || '').split('?')[0];
      if (D.GENERIC_TITLES.some(g => titleN === normTx(g))) bonus -= 100;
      if (['related', 'gallery', 'c-grid', 'notes'].includes(hash)) bonus -= 100;
      if (plan.intent === 'who' && cat === 'ตัวละคร') bonus += 40;
      if (plan.intent === 'whatis' && cat === 'ศัพท์') bonus += 40;
      if (plan.intent === 'how' && cat === 'กติกา & การเล่น') bonus += 40;
      if ((plan.intent === 'why' || plan.intent === 'when') && (cat === 'เนื้อเรื่องทัพ' || cat === 'โลกของ 40K')) bonus += 25;
      const total = score + bonus;
      const base = e[0].split('#')[0].split('?')[0];
      const prev = byBase.get(base);
      if (!prev || total > prev.score) byBase.set(base, { e, score: total });
    }
    return [...byBase.values()].sort((a, b) => b.score - a.score);
  }

  /* เลือกแม่แบบประโยค โดยกันไม่ให้ซ้ำกับครั้งก่อนหน้าของ "หมวดเดียวกัน" ติดกัน */
  function pickTemplate(list, state, key) {
    state.lastTpl = state.lastTpl || {};
    let idx = Math.floor(Math.random() * list.length);
    if (list.length > 1 && idx === state.lastTpl[key]) idx = (idx + 1) % list.length;
    state.lastTpl[key] = idx;
    return list[idx];
  }

  const entityName = title => title.split('(')[0].trim();

  function buildSiteAnswer(entry, plan, state) {
    const [url, title, , cat, body] = entry;
    let opener;
    if (plan.intent === 'who') opener = pickTemplate(D.TEMPLATES.openWho, state, 'open').replace('{e}', entityName(title));
    else if (plan.intent === 'whatis') opener = pickTemplate(D.TEMPLATES.openWhatis, state, 'open').replace('{e}', entityName(title));
    else if (plan.intent === 'how') opener = pickTemplate(D.TEMPLATES.openHow, state, 'open');
    else opener = pickTemplate(D.TEMPLATES.openFromSite, state, 'open');
    const excerpt = window.SiteSearch.snippet(body, plan.searchQuery || plan.rawQuery) || body.slice(0, 300);
    state.lastEntity = plan.hits[0] || state.lastEntity || null;
    state.lastTopicIs40k = true;
    // ถ้าเข้ามาทางพิมพ์ผิด (fuzzy) ให้ยืนยันกับผู้ใช้ว่าหมายถึงชื่อนี้ใช่ไหม แทนการแก้แบบเงียบ ๆ
    let correctedNote = null;
    if (plan.corrected) {
      const [en, th] = plan.corrected.entry;
      correctedNote = pickTemplate(D.TEMPLATES.corrected, state, 'corrected').replace('{e}', en + (th ? ' (' + th + ')' : ''));
    }
    return {
      kind: 'site', opener, excerpt, url, title, category: cat, correctedNote,
      chips: followupChips(state.lastEntity)
    };
  }

  function followupChips(entity) {
    if (!entity) return [];
    const [name, , type] = entity;
    if (type === 'character') return [name + ' ทัพไหน', name + ' ตอนนี้เป็นยังไง'];
    if (type === 'faction') return [name + ' ต้นกำเนิด', name + ' เล่นยังไง'];
    if (type === 'term') return ['ศัพท์ที่เกี่ยวข้องกับ ' + name];
    return [];
  }

  function buildRefusal(state) {
    return { kind: 'refuse', text: pickTemplate(D.TEMPLATES.refuse, state, 'refuse'), chips: D.STARTER_CHIPS };
  }
  function buildUnsureRefusal(state, related) {
    return { kind: 'refuse-unsure', text: pickTemplate(D.TEMPLATES.refuseUnsure, state, 'refuse'), related, chips: D.STARTER_CHIPS };
  }
  function buildNotFound(state, related) {
    return { kind: 'not-found', text: pickTemplate(D.TEMPLATES.notFound, state, 'notfound'), related, chips: D.STARTER_CHIPS };
  }
  function buildCanned(kind, state) {
    const map = { greet: 'greet', thanks: 'thanks', bye: 'bye', whoami: 'whoami' };
    return { kind: 'canned', text: pickTemplate(D.TEMPLATES[map[kind]], state, kind), chips: kind === 'greet' ? D.STARTER_CHIPS : [] };
  }

  /* ---------- export สำหรับ UI ด้านล่าง และสำหรับ gen/test-chatbot.js (ไม่มี DOM) ---------- */
  window.W40KChat = {
    ANSWER_MIN, RELATED_MIN, normTx, removeStopwords, findLexiconHits, detectIntent, matchFAQ, matchConcepts,
    levenshtein, fuzzyLexiconMatch,
    classify, rankSiteResults, buildSiteAnswer, followupChips, escapeRe,
    buildRefusal, buildUnsureRefusal, buildNotFound, buildCanned, pickTemplate
  };

  if (!hasDOM) return;

  /* ---------- ② UI ---------- */
  const body = document.body;
  const root = body.dataset.root || '';
  const ver = ((document.querySelector('script[src*="layout.js"]') || {}).src || '').split('?')[1];
  const ic = n => window.icon ? window.icon(n) : '';
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* สถานะการสนทนา: จำไว้ใน sessionStorage เพื่อให้แชทไม่รีเซ็ตตอนเปลี่ยนหน้า (ครอบด้วย try/catch ทุกครั้ง) */
  let state = { lastEntity: null, lastTopicIs40k: false, lastTpl: {} };
  let history = [];
  try {
    const savedState = sessionStorage.getItem('w40k-chat-state');
    const savedHistory = sessionStorage.getItem('w40k-chat-history');
    if (savedState) state = JSON.parse(savedState);
    if (savedHistory) history = JSON.parse(savedHistory);
  } catch (e) { /* ไม่มี storage หรืออ่านไม่ได้ — เริ่มแชทใหม่ */ }
  function persist() {
    try {
      sessionStorage.setItem('w40k-chat-state', JSON.stringify(state));
      sessionStorage.setItem('w40k-chat-history', JSON.stringify(history.slice(-30)));
    } catch (e) { /* ไม่มี storage — ใช้งานได้ปกติแค่ไม่จำข้ามหน้า */ }
  }

  /* ---------- โครง UI ---------- */
  const fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'ถามบอท 40K');
  fab.title = 'ถามเรื่อง 40K';
  fab.innerHTML = ic('chat');
  body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'ผู้ช่วย 40K');
  panel.innerHTML =
    '<div class="chat-head">' +
      '<div><strong>ผู้ช่วย 40K</strong><small>ตอบจากคู่มือนี้และ Warhammer 40k Wiki</small></div>' +
      '<div class="chat-head-btns">' +
        '<button type="button" class="chat-clear" aria-label="ล้างแชท">' + ic('refresh') + '</button>' +
        '<button type="button" class="chat-close" aria-label="ปิดแชท">' + ic('x') + '</button>' +
      '</div></div>' +
    '<div class="chat-log" role="log" aria-live="polite"></div>' +
    '<div class="chat-chips"></div>' +
    '<form class="chat-form"><textarea rows="1" placeholder="ถามเรื่อง Warhammer 40K…" aria-label="พิมพ์คำถาม"></textarea>' +
      '<button type="submit" aria-label="ส่ง">' + ic('send') + '</button></form>';
  body.appendChild(panel);

  const log = panel.querySelector('.chat-log');
  const chipsBox = panel.querySelector('.chat-chips');
  const form = panel.querySelector('.chat-form');
  const textarea = form.querySelector('textarea');

  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addBubble(role, html, skipHistory) {
    const div = document.createElement('div');
    div.className = 'chat-bubble chat-' + role;
    div.innerHTML = html;
    log.appendChild(div);
    scrollLog();
    // บันทึกทั้งข้อความผู้ใช้และคำตอบของบอทลงบทสนทนา (role เดียวที่ไม่บันทึก: "bot loading" ซึ่งเป็นแค่สถานะชั่วคราวที่ถูก remove() ทันที)
    if (!skipHistory) { history.push({ role, html }); persist(); }
    return div;
  }

  function renderChips(list) {
    chipsBox.innerHTML = (list || []).slice(0, 4).map(c =>
      '<button type="button" class="chip">' + esc(c) + '</button>').join('');
  }

  function linkHref(url) {
    if (/^https?:\/\//.test(url)) return url;
    return root + url;
  }

  function relatedHtml(related) {
    if (!related || !related.length) return '';
    return '<div class="chat-related">' + (D.TEMPLATES.related[0]) + '<ul>' +
      related.slice(0, 3).map(r => '<li><a href="' + esc(linkHref(r.e[0])) + '">' + esc(r.e[1]) + '</a></li>').join('') +
      '</ul></div>';
  }

  function renderSiteAnswer(ans) {
    const correctedHtml = ans.correctedNote ? '<p class="chat-corrected">' + esc(ans.correctedNote) + '</p>' : '';
    const html = correctedHtml + '<p>' + esc(ans.opener) + '</p><p>' + esc(ans.excerpt) + '</p>' +
      '<div class="chat-source">📖 จากคู่มือ: ' + esc(ans.category) + ' › ' + esc(ans.title) + '</div>' +
      '<a class="chat-readmore" href="' + esc(linkHref(ans.url)) + '">อ่านต่อ ' + ic('arrow-right') + '</a>';
    addBubble('bot', html);
    if (Math.random() < 0.4) addBubble('bot', esc(pickClosing()));
    renderChips(ans.chips);
  }
  function pickClosing() {
    return window.W40KChat.pickTemplate(D.TEMPLATES.closing, state, 'closing');
  }

  function renderWikiAnswer(res, translated) {
    const opener = window.W40KChat.pickTemplate(translated ? D.TEMPLATES.openWiki : D.TEMPLATES.openWikiEn, state, 'wikiopen');
    const html = '<p>' + esc(opener) + '</p><p>' + esc(res.text) + '</p>' +
      '<div class="chat-source">🌐 จาก Warhammer 40k Wiki (Fandom) · CC BY-SA' + (translated ? ' · แปลอัตโนมัติ' : '') + '</div>' +
      '<a class="chat-readmore" href="' + esc(res.url) + '" target="_blank" rel="noopener">อ่านต้นฉบับ ' + ic('arrow-right') + '</a>';
    addBubble('bot', html);
    renderChips(D.STARTER_CHIPS);
  }

  function renderPlain(result) {
    const html = '<p>' + esc(result.text) + '</p>' + relatedHtml(result.related);
    addBubble('bot', html);
    renderChips(result.chips || []);
  }

  function setLoading(text) {
    return addBubble('bot loading', '<span class="chat-dots" aria-hidden="true">●●●</span> ' + esc(text), true);
  }

  async function handleAsk(plan) {
    if (plan.level === 'no') { renderPlain(window.W40KChat.buildRefusal(state)); return; }

    const loadingBubble = setLoading('กำลังค้นข้อมูล…');
    try {
      await window.SiteSearch.loadIndex();
    } catch (e) {
      loadingBubble.remove();
      renderPlain({ text: 'โหลดดัชนีค้นหาไม่สำเร็จ ลองใหม่อีกครั้งครับ', chips: D.STARTER_CHIPS });
      return;
    }
    const ranked = window.W40KChat.rankSiteResults(window.SEARCH_INDEX, plan);
    const best = ranked[0];
    loadingBubble.remove();

    if (best && best.score >= window.W40KChat.ANSWER_MIN) {
      renderSiteAnswer(window.W40KChat.buildSiteAnswer(best.e, plan, state));
      persist(); // buildSiteAnswer เปลี่ยน state.lastEntity/lastTopicIs40k — persist ซ้ำเพื่อเก็บ state ล่าสุดคู่กับข้อความที่ addBubble เพิ่งบันทึกไป
      return;
    }

    const related = ranked.filter(r => r.score >= window.W40KChat.RELATED_MIN).slice(0, 3);

    // ไม่เจอในเว็บ → ลองค้นใน Wiki (ต้องมีชื่อเฉพาะภาษาอังกฤษให้ค้น ไม่งั้นข้ามขั้นนี้)
    // รอให้โมดูล Wiki โหลดเสร็จจริง (ไม่ใช่แค่เช็กว่าโหลดเสร็จไปแล้วหรือยัง) กันพลาดในคำถามแรกที่พิมพ์เร็วมาก
    const enName = plan.hits.length ? plan.hits[0][0] : null;
    if (enName) await loadWikiModule().catch(() => { /* ออฟไลน์หรือโหลดไม่สำเร็จ — ข้ามขั้น Wiki ไปตอบแบบไม่พบ */ });
    if (window.W40KWiki && enName) {
      const wikiBubble = setLoading('ไม่พบในคู่มือ กำลังค้นใน Wiki…');
      try {
        const article = await window.W40KWiki.fetchArticle(enName);
        wikiBubble.remove();
        if (article) {
          const t = await window.W40KWiki.translateText(article.text);
          state.lastTopicIs40k = true;
          renderWikiAnswer({ text: t.text, url: article.url }, t.translated);
          persist();
          return;
        }
      } catch (e) {
        wikiBubble.remove();
      }
    }

    if (plan.level === 'unsure') renderPlain(window.W40KChat.buildUnsureRefusal(state, related));
    else renderPlain(window.W40KChat.buildNotFound(state, related));
  }

  /* กันยิงคำถามซ้อนกัน (เช่น พิมพ์คำถามที่สองก่อนคำตอบแรกตอบเสร็จ) ซึ่งจะทำให้ state.lastEntity
     ถูกเขียนทับสลับกันและคำตอบโผล่มาสับลำดับ — ล็อกช่องพิมพ์/ปุ่มส่งไว้จนกว่าคำตอบปัจจุบันจะเสร็จ */
  let busy = false;
  function setBusy(b) {
    busy = b;
    textarea.disabled = b;
    form.querySelector('button[type=submit]').disabled = b;
  }

  function ask(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    setBusy(true);
    addBubble('user', esc(text));
    chipsBox.innerHTML = '';
    const plan = window.W40KChat.classify(text, state);
    if (plan.kind !== 'ask') {
      renderPlain(window.W40KChat.buildCanned(plan.kind, state));
      setBusy(false);
      return;
    }
    handleAsk(plan).finally(() => setBusy(false));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = textarea.value;
    textarea.value = '';
    textarea.style.height = 'auto';
    ask(v);
  });
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';
  });
  chipsBox.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    ask(b.textContent);
  });
  log.addEventListener('click', e => {
    if (e.target.closest('a')) close();
  });

  let lastFocus = null;
  async function open() {
    panel.classList.add('open'); body.classList.add('chat-open');
    lastFocus = document.activeElement;
    if (!window.CHAT_DATA) {
      // เปิดแชทครั้งแรก: chatbot-data.js/chatbot-lexicon.js (~77KB) ยังไม่โหลด เพิ่งโหลดตอนนี้เลย
      // (ไม่โหลดทุกหน้าเหมือนเดิม เพื่อไม่ให้คนที่ไม่เปิดแชทต้องโหลดข้อมูลนี้ไปเปล่า ๆ)
      setBusy(true);
      log.innerHTML = '<div class="chat-bubble chat-bot loading"><span class="chat-dots" aria-hidden="true">●●●</span> กำลังเตรียมผู้ช่วย…</div>';
      try {
        await loadDataModule();
      } catch (e) {
        log.innerHTML = '<div class="chat-bubble chat-bot">โหลดข้อมูลแชทไม่สำเร็จครับ (อาจไม่มีอินเทอร์เน็ต) ลองปิดแล้วเปิดใหม่</div>';
        setBusy(false);
        setTimeout(() => textarea.focus(), 30);
        return;
      }
      D = window.CHAT_DATA; // อัปเดตให้ชี้ไปข้อมูลที่โหลดเสร็จแล้ว (D เป็น let ไว้เพื่อการนี้)
      log.innerHTML = '';
      setBusy(false);
    }
    if (!log.children.length) {
      if (history.length) {
        // history เก็บ html ที่ผ่านการ esc()/ประกอบไว้แล้วตั้งแต่ตอนสร้างจริง ไม่ต้อง esc() ซ้ำ (จะกลายเป็น &amp;amp; ซ้ำสอง)
        history.forEach(h => addBubble(h.role, h.html, true)); // skipHistory=true กันไม่ให้ push ซ้ำเข้า history ตัวเอง
      } else {
        addBubble('bot', '<p>สวัสดีครับ ผมคือผู้ช่วยเรื่อง Warhammer 40K ถามได้ทั้งเนื้อเรื่อง ทัพ ตัวละคร กติกา และการทำสีโมเดลครับ</p>');
        renderChips(D.STARTER_CHIPS);
      }
    }
    setTimeout(() => textarea.focus(), 30);
  }
  function close() {
    panel.classList.remove('open'); body.classList.remove('chat-open');
    if (lastFocus) lastFocus.focus();
  }
  fab.addEventListener('click', open);
  panel.querySelector('.chat-close').addEventListener('click', close);
  panel.querySelector('.chat-clear').addEventListener('click', () => {
    history = []; state = { lastEntity: null, lastTopicIs40k: false, lastTpl: {} };
    log.innerHTML = ''; persist();
    addBubble('bot', '<p>ล้างแชทแล้วครับ ถามใหม่ได้เลย</p>');
    renderChips(D.STARTER_CHIPS);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });

  /* ---------- โหลดข้อมูลแชท (คำฟุ่มเฟือย/คลังชื่อเฉพาะ ~77KB) แบบ lazy (เฉพาะตอนเปิดแชทครั้งแรก) ---------- */
  let dataLoading = null;
  function loadDataModule() {
    return dataLoading || (dataLoading = Promise.all(['chatbot-data.js', 'chatbot-lexicon.js'].map(f =>
      new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = root + 'js/' + f + (ver ? '?' + ver : '');
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      })
    )));
  }

  /* ---------- โหลดโมดูลค้น Wiki + แปล แบบ lazy (เฉพาะตอนเปิดแชทครั้งแรก) ---------- */
  let wikiLoading = null;
  function loadWikiModule() {
    return wikiLoading || (wikiLoading = new Promise((res, rej) => {
      if (window.W40KWiki) return res();
      const s = document.createElement('script');
      s.src = root + 'js/chatbot-translate.js' + (ver ? '?' + ver : '');
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    }));
  }
  fab.addEventListener('click', () => { loadWikiModule().catch(() => { /* ออฟไลน์หรือโหลดไม่สำเร็จ — ใช้ได้แค่ตอบจากเว็บ */ }); }, { once: true });
})();
