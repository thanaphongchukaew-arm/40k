"""อัปเดต pages/credits.html สำหรับหน้าเหตุการณ์สำคัญ (รันซ้ำได้)

ใช้: python3 gen/events/credits.py  (รันหลัง build.py และ fetch_images.py)
- สร้างกลุ่มรูป "มหาสงครามและเหตุการณ์สำคัญ" จาก gen/events/images.json ใหม่ทุกครั้ง
- เพิ่มหน้าเหตุการณ์ลงคอลัมน์ "ใช้ในหน้า" ของรูปเดิมที่หน้าเหตุการณ์นำไปใช้
- เพิ่มบทความวิกิที่ใช้อ้างอิงในหน้าเหตุการณ์ลงรายการแหล่งข้อมูล
- นับจำนวนรูปและบทความในหัวข้อต่าง ๆ ใหม่
"""
import html, json, os, re, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CR = os.path.join(ROOT, 'pages/credits.html')
WIKI = 'https://warhammer40k.fandom.com/wiki/'
GROUP = 'มหาสงครามและเหตุการณ์สำคัญ'
MAXSHOW = 4

import importlib.util
spec = importlib.util.spec_from_file_location('build', os.path.join(ROOT, 'gen/events/build.py'))
build = importlib.util.module_from_spec(spec); spec.loader.exec_module(build)


def esc(s):
    return html.escape(s, quote=True)


def event_usage():
    """{รูป (ไม่มี images/): [(href จากหน้าเครดิต, ชื่อหน้า)]} เฉพาะหน้าเหตุการณ์"""
    use = {}
    metas = [build.load(s) for s in build.ORDER if os.path.exists(os.path.join(build.SRC, s + '.html'))]
    pages = [('events.html', 'มหาสงครามและเหตุการณ์สำคัญ', open(os.path.join(ROOT, 'pages/events.html'), encoding='utf-8').read())]
    for m in metas:
        pages.append(('events/%s.html' % m['slug'], m['title'], open(os.path.join(ROOT, 'pages/events', m['slug'] + '.html'), encoding='utf-8').read()))
    for href, label, s in pages:
        for img in re.findall(r'src="(?:\.\./)+images/([^"]+)"', s):
            lst = use.setdefault(img, [])
            if (href, label) not in lst:
                lst.append((href, label))
    return use, metas


def other_usage(img):
    """หน้าอื่นนอกหมวดเหตุการณ์ที่ใช้รูปนี้ (สำหรับรูปใหม่)"""
    out = []
    for d, _, fs in os.walk(os.path.join(ROOT, 'pages')):
        if d.endswith('/events'):
            continue
        for f in sorted(fs):
            if not f.endswith('.html') or f == 'credits.html' or (f == 'events.html'):
                continue
            p = os.path.join(d, f)
            s = open(p, encoding='utf-8').read()
            if 'images/' + img in s:
                t = re.search(r'<title>([^|<]+)', s).group(1).split(' — ')[0].strip()
                out.append((os.path.relpath(p, os.path.join(ROOT, 'pages')), html.unescape(t)))
    s = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    if 'images/' + img in s:
        out.append(('../index.html', 'หน้าแรก'))
    return out


def cell(links, hidden=0):
    if not links:
        return '<span class="muted">—</span>'
    shown = links[:MAXSHOW]
    extra = len(links) - len(shown) + hidden
    out = ' · '.join('<a href="%s">%s</a>' % (h, esc(t)) for h, t in shown)
    return out + (' และอีก %d หน้า' % extra if extra else '')


def main():
    s = open(CR, encoding='utf-8').read()
    use, metas = event_usage()
    images = json.load(open(os.path.join(ROOT, 'gen/events/images.json')))
    new = {k: v for k, v in images.items()}

    # 1) ลบกลุ่มเดิม (ถ้ามี) แล้วสร้างใหม่
    s = re.sub(r'<details class="cr-group" data-group="events">.*?</details>', '', s, flags=re.S)
    rows = []
    for img in sorted(new):
        src = new[img]
        links = use.get(img, []) + other_usage(img)
        url = WIKI + 'File:' + urllib.parse.quote(src.replace(' ', '_'), safe="_.,'()&-")
        rows.append('<tr data-q="%s %s"><td><img class="cr-thumb" src="../images/%s" alt="" loading="lazy"></td><td><span class="kbd">images/%s</span></td>'
                    '<td><a href="%s" target="_blank" rel="noopener">%s</a></td><td>%s</td></tr>' % (
                        esc(img), esc(src.lower()), img, img, esc(url), esc(src.replace(' ', '_')), cell(links)))
    group = ('<details class="cr-group" data-group="events"><summary><h3>%s <span class="muted" style="font-size:.85rem">(%d รูป)</span></h3></summary>'
             '<div class="table-wrap"><table class="cr-table"><thead><tr><th></th><th>ไฟล์ในเว็บนี้</th><th>ต้นฉบับ</th><th>ใช้ในหน้า</th></tr></thead><tbody>%s</tbody></table></div></details>'
             % (GROUP, len(rows), '\n'.join(rows)))
    i = s.find('<section id="fandom">')
    j = s.find('</section>', i)
    s = s[:j] + group + '\n      ' + s[j:]

    # 2) รูปเดิมที่หน้าเหตุการณ์ใช้ซ้ำ: เพิ่มชื่อหน้าในคอลัมน์ "ใช้ในหน้า"
    #    ค่าเดิมก่อนเพิ่มเก็บไว้ใน credits_base.json เพื่อให้รันซ้ำแล้วไม่นับซ้ำ
    bp = os.path.join(ROOT, 'gen/events/credits_base.json')
    base = json.load(open(bp)) if os.path.exists(bp) else {}

    def upd(m):
        row, img = m.group(0), m.group(1)
        if img.startswith('events/') or img not in use:
            return row
        last = row.rfind('<td>')
        c = base.setdefault(img, row[last + 4:-len('</td></tr>')])
        links = re.findall(r'<a href="([^"]+)">([^<]*)</a>', c)
        links = [(h, html.unescape(t)) for h, t in links]
        hm = re.search(r'และอีก (\d+) หน้า', c)
        hidden = int(hm.group(1)) if hm else 0
        hrefs = {h for h, _ in links}
        for h, t in use[img]:
            if h not in hrefs:
                if len(links) < MAXSHOW:
                    links.append((h, t))
                else:
                    hidden += 1
        return row[:last + 4] + cell(links, hidden) + '</td></tr>'
    s = re.sub(r'<tr data-q="[^"]*"><td><img class="cr-thumb" src="\.\./images/([^"]+)".*?</tr>', upd, s, flags=re.S)
    json.dump(base, open(bp, 'w'), ensure_ascii=False, indent=0)

    # 3) บทความวิกิ
    ul = re.search(r'(<p>บทความวิกิทั้ง )(\d+)( บทความที่ใช้อ้างอิง:</p>\s*<ul class="cr-cols">)(.*?)(</ul>)', s, re.S)
    have = re.findall(r'<li><a href="[^"]+" target="_blank" rel="noopener">([^<]+)</a></li>', ul.group(4))
    names = set(html.unescape(x) for x in have)
    for m in metas:
        names.update(m['sources'])
    items = ''.join('<li><a href="%s%s" target="_blank" rel="noopener">%s</a></li>' % (WIKI, esc(urllib.parse.quote(n.replace(' ', '_'), safe="_.,'()&-")), esc(n))
                    for n in sorted(names, key=str.lower))
    s = s[:ul.start()] + ul.group(1) + str(len(names)) + ul.group(3) + items + ul.group(5) + s[ul.end():]

    # 4) นับใหม่
    fandom = len(re.findall(r'<tr data-q="[^"]*"><td><img class="cr-thumb"[^>]*></td><td><span class="kbd">[^<]*</span></td><td><a href="https://warhammer40k\.fandom\.com', s))
    commons = len(re.findall(r'href="https://commons\.wikimedia\.org/wiki/File:', s))
    total = fandom + commons
    rules = int(re.search(r'<small>บทความกติกา/รีวิว</small><b>(\d+) บทความ</b>', s).group(1))
    s = re.sub(r'(<small>บทความวิกิที่ใช้อ้างอิง</small><b>)\d+', r'\g<1>%d' % len(names), s)
    s = re.sub(r'(<small>รูปจาก Warhammer 40k Wiki</small><b>)\d+', r'\g<1>%d' % fandom, s)
    s = re.sub(r'(<small>รูปจาก Wikimedia Commons</small><b>)\d+', r'\g<1>%d' % commons, s)
    s = re.sub(r'(ภาพประกอบจาก Warhammer 40k Wiki \()\d+( รูป\))', r'\g<1>%d\2' % fandom, s)
    s = re.sub(r'(</svg> )\d+( บทความ</span>)', r'\g<1>%d\2' % (len(names) + rules), s, count=1)
    s = re.sub(r'(</svg> )\d+( รูป</span>)', r'\g<1>%d\2' % total, s, count=1)
    s = s.replace('(หน้าโลกของ 40K, ยุค 30K,', '(หน้าโลกของ 40K, มหาสงครามและเหตุการณ์สำคัญ, ยุค 30K,')
    open(CR, 'w', encoding='utf-8').write(s)
    print('credits: กลุ่มเหตุการณ์ %d รูป · รูปจากวิกิรวม %d · Commons %d · บทความวิกิ %d' % (len(rows), fandom, commons, len(names)))


if __name__ == '__main__':
    main()
