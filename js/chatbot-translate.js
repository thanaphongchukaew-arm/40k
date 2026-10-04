/* =========================================================
   ค้นข้อมูลจาก Warhammer 40k Wiki (Fandom, MediaWiki API — ฟรี ไม่ต้องมี key)
   + แปล EN→TH บนเครื่องผู้ใช้โดยไม่แปลชื่อเฉพาะผิด (ซ่อนชื่อก่อนแปล แล้วใส่คืน)
   โหลดแบบ lazy จาก js/chatbot.js เฉพาะตอนเปิดแชทครั้งแรก (ไม่กระทบความเร็วหน้าเว็บ)

   ข้อจำกัดที่ตั้งใจไว้ (บอกตรง ๆ ไม่ซ่อน):
   - ซ่อนชื่อเฉพาะได้เฉพาะชื่อที่อยู่ใน js/chatbot-lexicon.js (~650 รายการ) + ตัวย่อตัวใหญ่ + รหัสยุค (M41 ฯลฯ)
     ชื่อเฉพาะที่ไม่อยู่ในคลังและไม่เข้ารูปแบบเหล่านี้ อาจถูกแปลผิดได้ — ยังไม่ได้ทำตัวจับ "คำขึ้นต้นตัวใหญ่ทั่วไป"
     เพิ่มเติม เพราะเสี่ยง false positive สูงและซับซ้อนเกินจำเป็นสำหรับเว็บนี้
   - แปลได้จริงเฉพาะเบราว์เซอร์ที่มี Translator API (Chrome รุ่นใหม่ที่รองรับคู่ en→th) — เบราว์เซอร์อื่นจะได้ภาษาอังกฤษ
   ========================================================= */
(function () {
  const D = window.CHAT_DATA;
  const WIKI_API = 'https://warhammer40k.fandom.com/api.php';
  const CACHE_PREFIX = 'w40k-chat-wiki:';
  const CACHE_DAYS = 7;
  const CACHE_MAX = 100;

  /* ---------- แคชผลจาก Wiki ใน localStorage (ลดการเรียกซ้ำ, ครอบ try/catch ทุกครั้ง) ---------- */
  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return undefined;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.t > CACHE_DAYS * 86400000) return undefined;
      return obj.v;
    } catch (e) { return undefined; }
  }
  function cacheSet(key, v) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v }));
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      if (keys.length > CACHE_MAX) {
        keys.map(k => { try { return { k, t: JSON.parse(localStorage.getItem(k)).t }; } catch (e) { return { k, t: 0 }; } })
          .sort((a, b) => a.t - b.t).slice(0, keys.length - CACHE_MAX)
          .forEach(x => localStorage.removeItem(x.k));
      }
    } catch (e) { /* ไม่มี storage — แคชไม่ได้ก็ยังใช้งานได้ */ }
  }

  /* ---------- เรียก Wiki อย่างมีมารยาท: ห่างกันอย่างน้อย 1 วินาที/ครั้ง, timeout 6 วินาที, ไม่ลองใหม่อัตโนมัติ ---------- */
  let lastCallAt = 0;
  async function politeFetch(url) {
    const wait = 1000 - (Date.now() - lastCallAt);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCallAt = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('http ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  async function searchTitle(name) {
    const key = 'search:' + name.toLowerCase();
    const cached = cacheGet(key);
    if (cached !== undefined) return cached;
    const url = WIKI_API + '?action=query&list=search&srsearch=' + encodeURIComponent(name) +
      '&srlimit=5&srnamespace=0&format=json&origin=*';
    const data = await politeFetch(url);
    const results = (data.query && data.query.search) || [];
    const n = name.toLowerCase();
    const hit = results.find(r => r.title.toLowerCase() === n) || results.find(r => r.title.toLowerCase().startsWith(n));
    const title = hit ? hit.title : null;
    cacheSet(key, title);
    return title;
  }

  function stripWikiHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('aside, table, sup, .reference, .mw-editsection, style, script, figure, .thumb, .navbox').forEach(n => n.remove());
    const text = (doc.body && doc.body.textContent) || '';
    return text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
  }

  /** ค้นหาและดึงย่อหน้าแรกของบทความจาก Fandom Wiki — คืน null ถ้าไม่เจอหรือเนื้อหาไม่น่าเชื่อถือ */
  async function fetchArticle(name) {
    const title = await searchTitle(name);
    if (!title) return null;
    const key = 'article:' + title.toLowerCase();
    const cached = cacheGet(key);
    if (cached !== undefined) return cached;
    const url = WIKI_API + '?action=parse&page=' + encodeURIComponent(title) +
      '&prop=text&section=0&redirects=1&disableeditsection=1&format=json&origin=*';
    const data = await politeFetch(url);
    const html = data.parse && data.parse.text && data.parse.text['*'];
    if (!html) { cacheSet(key, null); return null; }
    let text = stripWikiHtml(html).slice(0, 700);
    if (!/[A-Za-z]{10,}/.test(text)) { cacheSet(key, null); return null; } // เนื้อหาเพี้ยนหรือว่างเปล่า
    const result = { title, text, url: 'https://warhammer40k.fandom.com/wiki/' + title.replace(/ /g, '_') };
    cacheSet(key, result);
    return result;
  }

  /* ---------- ซ่อนชื่อเฉพาะก่อนแปล แล้วใส่คืนหลังแปล (กันเครื่องแปลพลาดชื่อ 40K) ---------- */
  // ใช้ตัวเดียวกับ js/chatbot.js (ซึ่งโหลดก่อนไฟล์นี้เสมอ เพราะเป็นตัวที่โหลดไฟล์นี้แบบ lazy) ไม่เขียนซ้ำ
  const escapeRe = window.W40KChat.escapeRe;

  function maskNames(text) {
    const lexicon = (window.CHAT_LEXICON || []).filter(e => e[0].length >= 3);
    const sorted = lexicon.slice().sort((a, b) => b[0].length - a[0].length); // ยาวก่อนสั้น กันจับคำสั้นซ้อนในคำยาว
    const map = [];
    let out = text;
    for (const entry of sorted) {
      const re = new RegExp('\\b' + escapeRe(entry[0]) + "('s)?\\b", 'g');
      out = out.replace(re, () => {
        const idx = map.length;
        map.push({ en: entry[0], th: entry[1] });
        return ' ZQX' + idx + 'ZQX ';
      });
    }
    // ตัวย่อตัวใหญ่ล้วน (AP, CP, OC...) และรหัสยุค (M41, M31...) — เสี่ยงน้อย เพราะรูปแบบจำเพาะมาก
    out = out.replace(/\bM\d{2,3}\b/g, m => { const i = map.length; map.push({ en: m, th: '' }); return ' ZQX' + i + 'ZQX '; });
    out = out.replace(/\b[A-Z]{2,6}\b/g, m => {
      if (/^ZQX\d+ZQX$/.test(m)) return m;
      const i = map.length; map.push({ en: m, th: '' }); return ' ZQX' + i + 'ZQX ';
    });
    out = maskUnknownProperNouns(out, map);
    return { masked: out.replace(/\s+/g, ' ').trim(), map };
  }

  /* ---------- ซ่อนชื่อเฉพาะที่ "ไม่อยู่ในคลัง 659 รายการ" เป็นชั้นเสริม ----------
     จับกลุ่มคำขึ้นต้นตัวใหญ่ 2 คำขึ้นไปติดกัน (คั่นด้วยคำเชื่อม of/the/van/von/... ได้) เช่น
     "Ollanius Pius", "Siege of Vraks" — ความเสี่ยง false positive ต่ำกว่าจับคำตัวใหญ่เดี่ยว ๆ มาก
     เพราะประโยคอังกฤษทั่วไปไม่ค่อยมีคำตัวใหญ่ติดกันสองคำขึ้นไปนอกจากเป็นชื่อเฉพาะจริง ๆ
     เพื่อความปลอดภัยเพิ่ม: ถ้าคำใดในกลุ่มที่จับได้อยู่ใน DENY (คำเชื่อมประโยคที่มักขึ้นต้นด้วยตัวใหญ่
     เช่น "However", "Many") จะไม่ซ่อนกลุ่มนั้นทั้งกลุ่ม ปล่อยให้ตัวแปลแปลตามปกติ (เสี่ยงน้อยกว่าซ่อนผิด) */
  const PROPER_LINK_WORDS = new Set(['of', 'the', 'van', 'von', 'der', 'den', 'el', 'de', 'di', 'la', 'du']);
  const PROPER_DENY_WORDS = new Set([
    'however', 'although', 'though', 'many', 'most', 'some', 'all', 'few', 'each', 'every', 'several',
    'various', 'certain', 'other', 'another', 'such', 'same', 'first', 'second', 'third', 'next', 'last',
    'also', 'even', 'still', 'yet', 'rather', 'instead', 'indeed', 'perhaps', 'maybe', 'probably',
    'certainly', 'clearly', 'obviously', 'according', 'based', 'given', 'unlike', 'within', 'without',
    'throughout', 'across', 'beyond', 'among', 'between', 'through', 'under', 'over', 'above', 'below',
    'meanwhile', 'furthermore', 'moreover', 'nevertheless', 'nonetheless', 'since', 'until', 'unless',
    'whether', 'either', 'neither', 'both', 'this', 'that', 'these', 'those', 'there', 'here', 'then',
    'thus', 'because', 'therefore', 'when', 'while', 'after', 'before', 'during', 'despite', 'during'
  ]);
  const PROPER_RUN_RE = new RegExp(
    "\\b[A-Z][a-z]{2,}(?:['\u2019]s)?(?:\\s+(?:of|the|van|von|der|den|el|de|di|la|du)\\s+[A-Z][a-z]{2,}(?:['\u2019]s)?|\\s+[A-Z][a-z]{2,}(?:['\u2019]s)?){1,4}\\b",
    'g'
  );
  function maskUnknownProperNouns(text, map) {
    return text.replace(PROPER_RUN_RE, m => {
      const words = m.split(/\s+/);
      const allOk = words.every(w => {
        const bare = w.toLowerCase().replace(/'s$/, '');
        return PROPER_LINK_WORDS.has(bare) || !PROPER_DENY_WORDS.has(bare);
      });
      if (!allOk) return m; // มีคำเชื่อมประโยคปนอยู่ — น่าจะเป็นแค่โครงประโยค ไม่ใช่ชื่อเฉพาะ ปล่อยผ่าน
      const idx = map.length;
      map.push({ en: m, th: '' });
      return ' ZQX' + idx + 'ZQX ';
    });
  }

  function unmaskNames(text, map) {
    const shown = new Set();
    return text.replace(/ZQX\s*(\d+)\s*ZQX/gi, (m, i) => {
      const e = map[+i];
      if (!e) return '';
      if (!shown.has(e.en)) {
        shown.add(e.en);
        return e.th ? (e.en + ' (' + e.th + ')') : e.en;
      }
      return e.en;
    });
  }

  /** เนื้อหาแปลแล้ว ถ้าโทเค็นหายไปเกิน 20% ถือว่าแปลไม่สำเร็จ ห้ามนำไปแสดง */
  function verifyMasking(translated, map) {
    if (!map.length) return true;
    const found = new Set((translated.match(/ZQX\s*\d+\s*ZQX/gi) || []).map(t => t.match(/\d+/)[0]));
    return (map.length - found.size) / map.length <= 0.2;
  }

  function applyMistranslationFixes(text) {
    let out = text;
    Object.keys(D.MISTRANSLATION_FIXES).forEach(bad => { out = out.split(bad).join(D.MISTRANSLATION_FIXES[bad]); });
    return out;
  }

  /* ---------- ตัวแปล: ใช้ Translator API ที่มีในเบราว์เซอร์เท่านั้น (ฟรี ทำงานบนเครื่อง ไม่มีคลาวด์) ---------- */
  let translatorPromise = null;
  function getTranslator() {
    if (translatorPromise) return translatorPromise;
    translatorPromise = (async () => {
      try {
        if (typeof Translator === 'undefined') return null; // เบราว์เซอร์นี้ไม่มี Translator API
        const avail = await Translator.availability({ sourceLanguage: 'en', targetLanguage: 'th' });
        if (avail === 'unavailable') return null;
        return await Translator.create({ sourceLanguage: 'en', targetLanguage: 'th' });
      } catch (e) { return null; }
    })();
    return translatorPromise;
  }

  /** แปล EN→TH พร้อมป้องกันชื่อเฉพาะ — คืน {text, translated:boolean}
      translated=false แปลว่าแสดงภาษาอังกฤษเดิม (ไม่มีตัวแปล หรือแปลไม่สำเร็จ) */
  async function translateText(enText) {
    const { masked, map } = maskNames(enText);
    const translator = await getTranslator();
    if (!translator) return { text: enText, translated: false };
    try {
      const out = await translator.translate(masked);
      if (!verifyMasking(out, map)) return { text: enText, translated: false };
      return { text: applyMistranslationFixes(unmaskNames(out, map)), translated: true };
    } catch (e) {
      return { text: enText, translated: false };
    }
  }

  window.W40KWiki = { fetchArticle, translateText, maskNames, unmaskNames, verifyMasking, applyMistranslationFixes };
})();
