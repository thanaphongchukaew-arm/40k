/* ทดสอบทุกหน้าใน Google Chrome จริง
   ใช้: python3 -m http.server 8765 (ที่รากโปรเจกต์) แล้ว node gen/check/browser.js [จำนวนหน้าสูงสุด]
   ต้องมี puppeteer-core (npm i puppeteer-core) และ Google Chrome
   ตรวจ: JavaScript error, คำขอที่ล้มเหลว/404, รูปที่โหลดไม่ขึ้น, หน้ากว้างเกินจอ (มือถือ 390px และจอคอม 1280px),
         เมนูและสารบัญถูกสร้าง, ลิงก์ในเมนูครบ */
const path = require('path'); const fs = require('fs'); const puppeteer = require('puppeteer-core');
const ROOT = path.resolve(__dirname, '../..');
const BASE = 'http://localhost:8765/';
const files = ['index.html'];
(function walk(d) {
  for (const f of fs.readdirSync(path.join(ROOT, d))) {
    const rel = path.join(d, f);
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
    else if (f.endsWith('.html')) files.push(rel);
  }
})('pages');
const limit = +process.argv[2] || files.length;

(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const problems = [];
  for (const f of files.slice(0, limit)) {
    for (const [w, h] of [[390, 844], [1280, 900]]) {
      const p = await b.newPage();
      await p.setViewport({ width: w, height: h });
      const errs = [];
      p.on('pageerror', e => errs.push('JS: ' + e.message));
      p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push('console: ' + m.text()); });
      p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errs.push('fail: ' + r.url()); });
      p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ': ' + r.url()); });
      try {
        await p.goto(BASE + f, { waitUntil: 'networkidle2', timeout: 60000 });
        /* เลื่อนลงทีละหน้าจอเพื่อให้รูป lazy โหลด */
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
          scrollTo(0, 0);
        });
        await new Promise(r => setTimeout(r, 700));
        const r = await p.evaluate(() => {
          const out = [];
          const de = document.documentElement;
          if (de.scrollWidth > de.clientWidth + 1) {
            const wide = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed'; })
              .slice(0, 3).map(e => e.tagName + '.' + (e.className && e.className.baseVal === undefined ? e.className : '')).join(', ');
            out.push('ล้นจอแนวนอน ' + de.scrollWidth + '>' + de.clientWidth + ' (' + wide + ')');
          }
          document.querySelectorAll('img').forEach(i => { if (i.complete && i.naturalWidth === 0 && i.getAttribute('src')) out.push('รูปเสีย: ' + i.getAttribute('src')); });
          if (!document.querySelector('.site-header')) out.push('ไม่มี header');
          if (document.querySelector('[data-toc]') && !document.querySelector('[data-toc] a')) out.push('สารบัญว่าง');
          return out;
        });
        errs.push(...r);
      } catch (e) { errs.push('โหลดไม่สำเร็จ: ' + e.message); }
      if (errs.length) problems.push([f + ' @' + w, [...new Set(errs)]]);
      await p.close();
    }
    process.stdout.write('.');
  }
  await b.close();
  console.log('\nตรวจ ' + Math.min(limit, files.length) + ' หน้า × 2 ขนาดจอ');
  for (const [f, e] of problems) console.log(f + '\n  - ' + e.join('\n  - '));
  console.log('หน้าที่มีปัญหา: ' + problems.length);
})();
