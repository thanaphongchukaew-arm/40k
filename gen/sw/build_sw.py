"""สร้างรายการไฟล์ใน sw.js ใหม่ (CORE / LAZY / IMAGES) จากไฟล์จริงในโปรเจกต์ แล้วเพิ่มเลข VERSION

ใช้: python3 gen/sw/build_sw.py  — รันทุกครั้งที่เพิ่ม/ลบหน้า รูป หรือเปลี่ยนเลข ?v= ของ CSS/JS
CORE  = ทุกหน้า .html (ยกเว้นหน้าใน LAZY) + CSS/JS ตามเลขเวอร์ชันที่หน้าเว็บอ้างจริง + manifest + ไอคอน
LAZY  = ไฟล์ใหญ่ที่เก็บเมื่อเปิดใช้ครั้งแรก
IMAGES = รูปทุกไฟล์ใน images/ (ใช้กับปุ่ม "บันทึกทั้งเว็บ")
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LAZY_PAGES = ['pages/credits.html']
LAZY_JS = ('js/planets-data.js', 'js/search-index.js', 'js/chatbot-translate.js',
           'js/chatbot-data.js', 'js/chatbot-lexicon.js')


def main():
    p = os.path.join(ROOT, 'sw.js')
    s = open(p, encoding='utf-8').read()
    pages = ['index.html'] + sorted(os.path.relpath(os.path.join(d, f), ROOT)
                                    for d, _, fs in os.walk(os.path.join(ROOT, 'pages')) for f in fs if f.endswith('.html'))
    assets = set()
    for pg in pages:
        h = open(os.path.join(ROOT, pg), encoding='utf-8').read()
        for u in re.findall(r'(?:href|src)="(?:\.\./)*((?:css|js)/[^"]+)"', h):
            assets.add(u)
    # search.js, search-index.js และไฟล์แชทบอททั้งหมด ถูกโหลดด้วยเลขเวอร์ชันเดียวกับ layout.js
    # (ดู js/layout.js, js/search.js, js/chatbot.js — chatbot.js โหลด chatbot-translate.js lazy ตอนเปิดแชทครั้งแรก)
    lv = next(a.split('?')[1] for a in assets if a.startswith('js/layout.js?'))
    assets |= {'js/search.js?' + lv, 'js/search-index.js?' + lv,
               'js/chatbot-data.js?' + lv, 'js/chatbot-lexicon.js?' + lv,
               'js/chatbot.js?' + lv, 'js/chatbot-translate.js?' + lv}
    lazy = LAZY_PAGES + sorted(a for a in assets if a.split('?')[0] in LAZY_JS)
    core = [x for x in pages if x not in LAZY_PAGES] + sorted(a for a in assets if a not in lazy) + \
        ['images/icons/favicon.svg', 'images/icons/icon-192.png', 'manifest.webmanifest']
    images = sorted(os.path.relpath(os.path.join(d, f), ROOT) for d, _, fs in os.walk(os.path.join(ROOT, 'images'))
                    for f in fs if not f.startswith('.'))
    v = int(re.search(r"const VERSION = 'w40k-v(\d+)';", s).group(1)) + 1
    s = re.sub(r"const VERSION = 'w40k-v\d+';", "const VERSION = 'w40k-v%d';" % v, s)
    s = re.sub(r'const CORE = \[.*?\];', 'const CORE = ' + json.dumps(core, ensure_ascii=False) + ';', s, flags=re.S)
    s = re.sub(r'const LAZY = \[.*?\];', 'const LAZY = ' + json.dumps(lazy, ensure_ascii=False) + ';', s, flags=re.S)
    s = re.sub(r'const IMAGES = \[.*?\];', 'const IMAGES = ' + json.dumps(images, ensure_ascii=False) + ';', s, flags=re.S)
    open(p, 'w', encoding='utf-8').write(s)
    print('sw.js: VERSION w40k-v%d · CORE %d · LAZY %d · IMAGES %d' % (v, len(core), len(lazy), len(images)))


if __name__ == '__main__':
    main()
