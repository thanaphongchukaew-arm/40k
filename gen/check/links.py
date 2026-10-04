"""ตรวจลิงก์ รูป และ anchor (#id) ทุกหน้าในเว็บ แบบไม่ต้องเปิดเบราว์เซอร์

ใช้: python3 gen/check/links.py
ตรวจ: href/src ที่ชี้ไปไฟล์ในเว็บต้องมีไฟล์จริง, ลิงก์ที่มี #id ต้องมี id นั้นในหน้าปลายทาง,
      รูปทุกรูปต้องมี alt, id ห้ามซ้ำในหน้าเดียวกัน
หมายเหตุ: ลิงก์ที่หน้าเว็บสร้างด้วย JavaScript (เช่น factions.html#orks, galaxy-map.html#p-...) ตรวจแยกในเบราว์เซอร์
"""
import html, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JS_HASH_PAGES = {'pages/factions.html', 'pages/galaxy-map.html', 'pages/timeline.html', 'pages/glossary.html',
                 'pages/characters.html', 'pages/army-builder.html'}


def pages():
    for d, _, fs in os.walk(ROOT):
        if any(x in d for x in ('/gen', '/.git', '/node_modules')):
            continue
        for f in fs:
            if f.endswith('.html'):
                yield os.path.relpath(os.path.join(d, f), ROOT)


ids_cache = {}


def ids_of(rel):
    if rel not in ids_cache:
        s = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        ids_cache[rel] = set(re.findall(r'\sid="([^"]+)"', s))
    return ids_cache[rel]


def main():
    problems = []
    for rel in sorted(pages()):
        s = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        base = os.path.dirname(rel)
        # id ซ้ำ
        seen = {}
        for i in re.findall(r'\sid="([^"]+)"', s):
            seen[i] = seen.get(i, 0) + 1
        for i, n in seen.items():
            if n > 1:
                problems.append((rel, 'id ซ้ำ', i))
        for m in re.finditer(r'<img\b[^>]*>', s):
            if not re.search(r'\salt="', m.group(0)):
                problems.append((rel, 'รูปไม่มี alt', m.group(0)[:120]))
        for attr, url in re.findall(r'\s(href|src)="([^"]+)"', s):
            url = html.unescape(url)
            if re.match(r'^(https?:|mailto:|tel:|data:|javascript:|#$|#i-)', url) or url.startswith('{'):
                continue
            path, _, frag = url.partition('#')
            path = path.split('?')[0]
            if not path:
                target = rel
            else:
                target = os.path.normpath(os.path.join(base, urllib.parse.unquote(path)))
            if not os.path.exists(os.path.join(ROOT, target)):
                problems.append((rel, 'ไฟล์ไม่มีอยู่', url))
                continue
            if frag and target.endswith('.html') and target not in JS_HASH_PAGES:
                if frag not in ids_of(target):
                    problems.append((rel, 'ไม่พบ #' + frag, url))
    for p in problems:
        print(' | '.join(p))
    print('รวมปัญหา', len(problems))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
