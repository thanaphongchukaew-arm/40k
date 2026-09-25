/* สร้าง js/search-index.js ใหม่: เปิดเว็บด้วย python3 -m http.server 8765 ที่รากโปรเจกต์ แล้วรัน node gen/genindex.js (ต้องมี puppeteer-core และ Google Chrome) */
const path = require('path'); const puppeteer = require('puppeteer-core'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
global.window = {}; require(ROOT + '/js/search-index.js'); const OLD = window.SEARCH_INDEX;
const oldCat = {}; OLD.forEach(e => { const p = e[0].split(/[#?]/)[0]; if (e[0] === p) oldCat[p] = e[3]; });
const files = ['index.html'].concat(fs.readdirSync(ROOT + '/pages').filter(f => f.endsWith('.html')).map(f => 'pages/' + f))
  .concat(fs.readdirSync(ROOT + '/pages/lore').filter(f => f.endsWith('.html')).map(f => 'pages/lore/' + f))
  .concat(fs.readdirSync(ROOT + '/pages/primarchs').filter(f => f.endsWith('.html')).map(f => 'pages/primarchs/' + f));
const catFor = p => oldCat[p] || (p.startsWith('pages/lore/') ? 'เนื้อเรื่องทัพ' : p.startsWith('pages/primarchs/') ? 'ตัวละคร' : 'โลกของ 40K');
const itemCat = p => ({ 'pages/characters.html': 'ตัวละคร', 'pages/factions.html': 'ทัพ', 'pages/primarchs.html': 'ตัวละคร' }[p]);
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const pg = await b.newPage(); const out = [];
  for (const f of files) {
    if (f === 'pages/offline.html' || f === 'pages/404.html') continue;
    if (f === 'index.html') { OLD.filter(e => e[0].split('#')[0] === 'index.html').forEach(e => out.push(e)); continue; }
    await pg.goto('http://localhost:8765/' + f, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 150));
    const E = await pg.evaluate((f, cat, icat) => {
      const clean = s => (s || '').replace(/\s+/g, ' ').trim();
      const cut = s => { s = clean(s); return s.length > 400 ? s.slice(0, 400) : s; };
      const h1 = clean((document.querySelector('.page-hero h1, h1') || {}).innerText);
      const desc = (document.querySelector('meta[name=description]') || {}).content || '';
      const lead = clean((document.querySelector('.page-hero .lead') || {}).innerText) || desc;
      const R = [[f, h1, h1, cat, cut(lead)]];
      const body = document.querySelector('.doc-body') || document.querySelector('main');
      if (!body) return R;
      body.querySelectorAll('section[id]').forEach(s => {
        const h = s.querySelector('h2'); if (!h) return;
        const t = clean(h.innerText.replace(/^\s*\d+\s*/, ''));
        R.push([f + '#' + s.id, t, h1, cat, cut(s.innerText.replace(h.innerText, ''))]);
      });
      body.querySelectorAll('[id]').forEach(el => {
        if (el.tagName === 'SECTION' || el.tagName === 'TEMPLATE' || el.closest('template') || el.closest('nav,header,footer,.toc')) return;
        const h = el.querySelector('h3'); if (!h || el.querySelector('[id] h3') && el.querySelector('[id] h3') !== h && el.querySelectorAll('h3').length > 1) return;
        R.push([f + '#' + el.id, clean(h.innerText), h1, icat || cat, cut(el.innerText)]);
      });
      return R;
    }, f, catFor(f), itemCat(f));
    E.forEach(e => out.push(e));
    if (f === 'pages/glossary.html') OLD.filter(e => e[0].startsWith('pages/glossary.html?q=')).forEach(e => out.push(e));
  }
  await b.close();
  /* เก็บรายการเดิมที่ยังใช้ได้: ลิงก์ที่ JS เปิดจาก hash (เช่น factions.html#orks) หรือ anchor ที่ยังมีอยู่ในหน้า */
  const have = new Set(out.map(e => e[0]));
  OLD.forEach(e => {
    if (have.has(e[0])) return;
    const [f, h] = e[0].split('#');
    if (!h || !fs.existsSync(ROOT + '/' + f)) return;
    if (f === 'pages/factions.html' || fs.readFileSync(ROOT + '/' + f, 'utf8').includes('id="' + h + '"')) out.push(e);
  });
  const seen = new Set(), final = out.filter(e => { if (seen.has(e[0])) return false; seen.add(e[0]); return e[1]; });
  fs.writeFileSync(ROOT + '/js/search-index.js', '/* ดัชนีค้นหาทั้งเว็บ — สร้างอัตโนมัติจาก gen/genindex.js ห้ามแก้มือ */\nwindow.SEARCH_INDEX = ' + JSON.stringify(final) + ';\n');
  console.log('entries', final.length, 'pages', files.length);
})();
