/* สร้าง js/chatbot-lexicon.js ใหม่: รวมชื่อเฉพาะจาก search-index.js + glossary.js + gen/lexicon-extra.txt
   ใช้: node gen/genlexicon.js
   ห้ามแก้ js/chatbot-lexicon.js ด้วยมือ — แก้ gen/lexicon-extra.txt แล้วรันสคริปต์นี้ใหม่แทน */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- 1) โหลด search-index.js (แบบเดียวกับ gen/genindex.js) ---------- */
global.window = {};
require(path.join(ROOT, 'js/search-index.js'));
const INDEX = global.window.SEARCH_INDEX;

/* ---------- 2) โหลด glossary.js แบบไม่รัน DOM: ดึงแค่ array G ด้วย regex ---------- */
const glossarySrc = fs.readFileSync(path.join(ROOT, 'js/glossary.js'), 'utf8');
const gMatch = glossarySrc.match(/const G = (\[[\s\S]*?\n  \]);/);
if (!gMatch) throw new Error('หารายการศัพท์ G ใน glossary.js ไม่เจอ — รูปแบบไฟล์เปลี่ยนไปหรือเปล่า?');
const GLOSSARY = new Function('return ' + gMatch[1])();

/* ---------- 3) โหลด gen/lexicon-extra.txt ---------- */
const extraSrc = fs.readFileSync(path.join(__dirname, 'lexicon-extra.txt'), 'utf8');
const EXTRA = extraSrc.split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'))
  .map(l => {
    const [en, th, type] = l.split('|');
    return { en: (en || '').trim(), th: (th || '').trim(), type: (type || 'lore').trim() };
  })
  .filter(e => e.en);

/* ---------- ตัวช่วย ---------- */
// ตัดหัวข้อทั่วไปที่ไม่ใช่ชื่อเฉพาะ แม้จะมีวงเล็บติดมาก็ตาม (กันกรณีพิเศษ)
const GENERIC_TITLES = new Set([
  'overview', 'notes', 'gallery', 'related', 'history', 'summary', 'example', 'steps', 'all',
  'home', 'how to play', 'strengths', 'weaknesses'
]);
// hash ที่เป็นหัวข้อทั่วไปในหน้า ไม่ใช่ anchor ของชื่อเฉพาะนั้นเอง — ให้คะแนนต่ำตอน dedupe
const GENERIC_HASH = new Set(['c-grid', 'overview', 'related', 'gallery', 'notes', 'finder', 'path', 'builder', 'rules', 'ab-app', 'how', 'cheat']);

const CAT_TYPE = {
  'ตัวละคร': 'character',
  'ทัพ': 'faction',
  'เนื้อเรื่องทัพ': 'faction',
  'ศัพท์': 'term',
  'โลกของ 40K': 'lore',
  'กติกา & การเล่น': 'rule'
};
const SKIP_CATEGORIES = new Set(['หน้าแรก', 'เครื่องมือ']);

/** แยก "English (ไทย)" หรือ "English (ขยาย) (ไทย)" โดยจับวงเล็บสุดท้ายเป็นคำอ่านไทย */
function splitTitle(title) {
  const t = (title || '').trim();
  if (!t.endsWith(')')) return null;
  const open = t.lastIndexOf('(');
  if (open === -1) return null;
  const en = t.slice(0, open).trim();
  const th = t.slice(open + 1, t.length - 1).trim();
  if (!en || !th) return null;
  if (en.length > 60 || en.length < 2) return null;
  if (!/[A-Za-z]/.test(en)) return null; // ต้องมีตัวอักษรอังกฤษอยู่บ้าง ไม่ใช่วงเล็บไทยซ้อนไทย
  if (/[฀-๿]/.test(en)) return null; // en ต้องไม่มีตัวอักษรไทยปน (กันหัวข้อไทยที่มี (M31–M32) ต่อท้าย)
  if (/^\d+$/.test(en)) return null;
  if (GENERIC_TITLES.has(en.toLowerCase())) return null;
  return [en, th];
}

function norm(s) {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/['’]/g, "'");
}

/* ---------- 4) ดึงชื่อเฉพาะจาก SEARCH_INDEX ---------- */
const candidates = []; // {en, th, type, url, score}
for (const e of INDEX) {
  const [url, title, , category] = e;
  if (SKIP_CATEGORIES.has(category)) continue;
  const type = CAT_TYPE[category];
  if (!type) continue;
  const pair = splitTitle(title);
  if (!pair) continue;
  const [en, th] = pair;
  const hash = (url.split('#')[1] || '').split('?')[0];
  let score = 0;
  if (hash && GENERIC_HASH.has(hash)) score -= 50;
  if (!url.includes('#')) score += 5; // หน้าหลักของเรื่องนั้น ดีกว่า anchor ย่อย
  score -= url.length * 0.01;
  candidates.push({ en, th, type, url, score });
}

/* ---------- 5) รวม glossary.js ---------- */
for (const [term, th, , ] of GLOSSARY) {
  candidates.push({
    en: term, th, type: 'term',
    url: 'pages/glossary.html?q=' + term, // ไม่ encode: เว็บนี้ใช้ query string แบบดิบ (เว้นวรรค/วงเล็บตรงตัว) ทุกที่ ดู js/search-index.js
    score: 100 // ศัพท์จากอภิธานศัพท์ ชัดเจนอยู่แล้ว ให้คะแนนสูงสุด กันไม่ให้ถูกทับ
  });
}

/* ---------- 6) dedupe: คีย์เดียวกัน (en ตัวพิมพ์เล็ก) เลือกคะแนนสูงสุด ---------- */
const byKey = new Map();
for (const c of candidates) {
  const key = norm(c.en);
  const prev = byKey.get(key);
  if (!prev || c.score > prev.score) byKey.set(key, c);
}

/* ---------- 7) เติมจาก lexicon-extra.txt เฉพาะชื่อที่ยังไม่มี ---------- */
let addedExtra = 0;
for (const e of EXTRA) {
  const key = norm(e.en);
  if (byKey.has(key)) continue; // เว็บมีหน้าอยู่แล้ว ไม่ต้องเพิ่มซ้ำ
  byKey.set(key, { en: e.en, th: e.th, type: e.type, url: '', score: 0 });
  addedExtra++;
}

/* ---------- 8) สร้างชื่อเล่น/ชื่อสั้นอัตโนมัติ สำหรับชื่อหลายคำ
   เช่น "Horus Lupercal" → เพิ่มคำว่า "Horus" ให้ค้นเจอด้วย (คนพิมพ์ชื่อสั้นเป็นส่วนใหญ่)
   ทำเฉพาะ character/faction/place และคำที่ไม่ชนกับชื่ออื่นเท่านั้น กันความกำกวม ---------- */
const GENERIC_WORDS = new Set(['the', 'of', 'and', 'van', 'von', 'der', 'den', 'el', 'de']);
const aliasCandidates = new Map(); // token(lower) -> {display, canonical, pos} หรือ null(ชนกัน=ห้ามใช้)
const fullEntries = [...byKey.values()];
for (const c of fullEntries) {
  if (!['character', 'faction', 'place'].includes(c.type)) continue;
  const words = c.en.split(/\s+/).filter(w => /^[A-Za-z'][A-Za-z'.-]*$/.test(w));
  if (words.length < 2) continue;
  // เก็บตำแหน่ง (first/last) ไว้ด้วย เพื่อเดาคำอ่านไทยของชื่อเล่นได้ (ดูขั้นถัดไป)
  const tokens = [{ w: words[0], pos: 'first' }, { w: words[words.length - 1], pos: 'last' }];
  const seen = new Set();
  for (const { w, pos } of tokens) {
    if (seen.has(w)) continue; // ชื่อคำเดียว first/last ซ้ำกัน กันเพิ่มสองรอบ
    seen.add(w);
    if (w.length < 4 || GENERIC_WORDS.has(w.toLowerCase())) continue;
    const key = norm(w);
    if (byKey.has(key)) continue; // มีชื่อเต็มของตัวเองอยู่แล้ว ไม่ต้องสร้าง alias ทับ
    const existing = aliasCandidates.get(key);
    if (existing === null) continue; // รู้อยู่แล้วว่ากำกวม
    if (existing && existing.canonical !== c.en) {
      aliasCandidates.set(key, null); // ชนกับชื่ออื่น → กำกวม ห้ามใช้
    } else if (!existing) {
      aliasCandidates.set(key, { display: w, canonical: c, canonicalEn: c.en, pos, wordCount: words.length });
    }
  }
}
let aliasCount = 0;
let aliasWithThaiCount = 0;
for (const [key, info] of aliasCandidates) {
  if (!info) continue; // กำกวม ข้าม
  // เดาคำอ่านไทยของชื่อเล่น: ถ้าคำอ่านไทยเต็มมีจำนวนคำตรงกับชื่ออังกฤษเต็ม (คำต่อคำตามลำดับเดียวกัน)
  // ให้ตัดคำแรก/คำสุดท้ายของคำอ่านไทยมาใช้ตามตำแหน่งเดียวกับชื่อเล่นนี้ เช่น "Horus Lupercal" (ฮอรัส ลูเพอร์คัล)
  // → ชื่อเล่น "Horus" ได้คำอ่าน "ฮอรัส" ไปด้วย (ไม่ใช่แค่ url เฉย ๆ เหมือนเดิม) — ถ้าจำนวนคำไม่ตรงปล่อยว่างไว้ ไม่เดา
  let th = '';
  const thWords = (info.canonical.th || '').trim().split(/\s+/).filter(Boolean);
  if (thWords.length === info.wordCount) {
    th = info.pos === 'first' ? thWords[0] : thWords[thWords.length - 1];
    aliasWithThaiCount++;
  }
  byKey.set(key, { en: info.display, th, type: info.canonical.type, url: info.canonical.url, score: -1, aliasOf: info.canonicalEn });
  aliasCount++;
}

/* ---------- 9) เขียนไฟล์ผลลัพธ์ ---------- */
const out = [...byKey.values()]
  .sort((a, b) => a.en.localeCompare(b.en))
  .map(c => [c.en, c.th, c.type, c.url]);

const banner = '/* คลังชื่อเฉพาะ 40K สำหรับแชทบอท — สร้างอัตโนมัติจาก gen/genlexicon.js ห้ามแก้มือ\n' +
  '   รูปแบบ: [English, คำอ่านไทย, ประเภท, url] — url ว่าง = ไม่มีหน้าตรงในเว็บนี้ (ไปค้นใน Wiki)\n' +
  '   แก้ไขได้จาก: js/search-index.js (อัตโนมัติ), js/glossary.js, gen/lexicon-extra.txt (มือ) */\n';
fs.writeFileSync(path.join(ROOT, 'js/chatbot-lexicon.js'),
  banner + 'window.CHAT_LEXICON = ' + JSON.stringify(out) + ';\n');

const byType = {};
out.forEach(c => { byType[c[2]] = (byType[c[2]] || 0) + 1; });
console.log('chatbot-lexicon.js: รวม %d รายการ (เพิ่มจาก extra %d, ชื่อเล่น/ชื่อสั้น %d มีคำอ่านไทยด้วย %d) — %s',
  out.length, addedExtra, aliasCount, aliasWithThaiCount, JSON.stringify(byType));
