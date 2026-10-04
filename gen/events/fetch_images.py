"""ดาวน์โหลดรูปประกอบหน้าเหตุการณ์จาก Warhammer 40k Wiki (Fandom) แล้วแปลงเป็น WebP

ใช้: python3 gen/events/fetch_images.py
อ่านรายการจาก gen/events/images.json  ({"events/<slug>/<ชื่อ>.webp": "ชื่อไฟล์บนวิกิ"})
ข้ามไฟล์ที่มีอยู่แล้ว ต้องมี cwebp (brew install webp)
"""
import functools, json, os, subprocess, sys, tempfile, urllib.parse, urllib.request
print = functools.partial(print, flush=True)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
API = 'https://warhammer40k.fandom.com/api.php?'
UA = {'User-Agent': 'Mozilla/5.0 w40k-th-fan-guide'}
MAXW = 960


def url_of(name):
    q = API + urllib.parse.urlencode({'action': 'query', 'titles': 'File:' + name, 'prop': 'imageinfo',
                                      'iiprop': 'url|size', 'format': 'json'})
    d = json.load(urllib.request.urlopen(urllib.request.Request(q, headers=UA), timeout=60))
    page = next(iter(d['query']['pages'].values()))
    if 'imageinfo' not in page:
        return None, None
    ii = page['imageinfo'][0]
    return ii['url'], ii['width']


def main():
    items = json.load(open(os.path.join(ROOT, 'gen/events/images.json')))
    bad = 0
    for local, name in items.items():
        out = os.path.join(ROOT, 'images', local)
        if os.path.exists(out):
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        url, w = url_of(name)
        if not url:
            print('ไม่พบไฟล์บนวิกิ:', name); bad += 1; continue
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(name)[1] or '.img', delete=False) as t:
            t.write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
        args = ['cwebp', '-quiet', '-q', '80', '-metadata', 'none']
        if w and w > MAXW:
            args += ['-resize', str(MAXW), '0']
        r = subprocess.run(args + [t.name, '-o', out])
        os.unlink(t.name)
        if r.returncode:
            print('แปลงไม่สำเร็จ:', name); bad += 1
        else:
            print('ok', local, os.path.getsize(out) // 1024, 'KB')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
