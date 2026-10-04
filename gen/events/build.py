"""สร้างหน้า "มหาสงครามและเหตุการณ์สำคัญ" (pages/events.html) และหน้าแยกรายเหตุการณ์ (pages/events/*.html)

ใช้: python3 gen/events/build.py
เนื้อหาแต่ละหน้าอยู่ที่ gen/events/content/<slug>.html — แก้ที่นั่นแล้วรันสคริปต์นี้ใหม่ (อย่าแก้ไฟล์ใน pages/events/ ตรง ๆ)

รูปแบบไฟล์เนื้อหา
  บรรทัดแรก  <!--META { ...JSON... } -->
  ตามด้วย    <section id="..." data-title="หัวข้อ"> ... </section>  (สคริปต์ใส่เลขหัวข้อและ <h2> ให้เอง)

แท็กย่อที่สคริปต์แปลงให้
  {R}                                   → ../../ (รากเว็บ)
  <fig src="events/x.webp" alt="..">คำบรรยาย</fig>          → รูปเต็มกว้าง + คำบรรยาย + เครดิต
  <gal> <fig ...>..</fig> ... </gal>    → แกลเลอรีรูปเล็ก
  <ev d="วันที่" t="หัวข้อ" [red]>ข้อความ</ev>   → รายการในไทม์ไลน์ (ต้องอยู่ใน <div class="timeline">)
"""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'gen/events/content')
OUT = os.path.join(ROOT, 'pages/events')
CSS_V, ICONS_V, LAYOUT_V, MAIN_V = '30', '18', '25', '19'

# ลำดับเหตุการณ์ตามเวลา (ใช้ทำปุ่มก่อนหน้า/ถัดไป และหน้ารวม)
ERAS = [
    ('ancient', 'ยุคโบราณ', 'ก่อนมนุษย์ครองกาแล็กซี', 'era-ancient'),
    ('30k', 'ยุค 30K', 'Great Crusade และ Horus Heresy (M30–M31)', 'era-30k'),
    ('dark', 'หมื่นปีแห่งความมืด', 'หลัง Heresy ถึงสหัสวรรษที่ 40 (M31–M40)', 'era-dark'),
    ('m41', 'สหัสวรรษที่ 41', 'ยุคหลักของเกม 40K', 'era-40k'),
    ('now', 'Era Indomitus', 'หลัง Great Rift จนถึงปัจจุบัน (M42)', 'era-now'),
]
ORDER = [
    'war-in-heaven', 'fall-of-the-aeldari',
    'unification-wars', 'great-crusade', 'horus-heresy', 'isstvan', 'burning-of-prospero', 'calth',
    'imperium-secundus', 'siege-of-terra', 'great-scouring',
    'war-of-the-beast', 'age-of-apostasy',
    'gothic-war', 'siege-of-vraks', 'badab-war', 'tyrannic-wars', 'armageddon-wars', 'fall-of-cadia',
    'great-rift', 'indomitus-crusade', 'devastation-of-baal', 'plague-wars',
]
WIKI = 'https://warhammer40k.fandom.com/wiki/'


def esc(s):
    return html.escape(s, quote=True)


def ic(name):
    return '<svg class="i"><use href="#i-%s"></use></svg>' % name


def load(slug):
    s = open(os.path.join(SRC, slug + '.html'), encoding='utf-8').read()
    m = re.match(r'\s*<!--META(.*?)-->', s, re.S)
    meta = json.loads(m.group(1))
    meta['slug'] = slug
    meta['body'] = s[m.end():]
    return meta


def fig_html(attrs, cap, small=False):
    src = re.search(r'src="([^"]+)"', attrs).group(1)
    alt = re.search(r'alt="([^"]*)"', attrs)
    alt = alt.group(1) if alt else re.sub('<[^>]+>', '', cap)
    pos = re.search(r'pos="([^"]+)"', attrs)
    style = ' style="object-position:%s"' % pos.group(1) if pos else ''
    contain = ' class="contain"' if re.search(r'\bcontain\b', re.sub(r'"[^"]*"', '', attrs)) else ''
    img = '<img src="{R}images/%s" alt="%s" loading="lazy" data-zoom%s%s>' % (src, alt, contain, style)
    if small:
        return '<figure>%s<figcaption>%s</figcaption></figure>' % (img, cap)
    return '<figure class="figure">%s<figcaption>%s · ภาพ: Warhammer 40k Wiki (Fandom)</figcaption></figure>' % (img, cap)


def expand(body):
    body = re.sub(r'<gal>(.*?)</gal>', lambda m: '<div class="gallery">' + re.sub(
        r'<fig(\s[^>]*)>(.*?)</fig>', lambda f: fig_html(f.group(1), f.group(2).strip(), True), m.group(1), flags=re.S) + '</div>',
        body, flags=re.S)
    body = re.sub(r'<fig(\s[^>]*)>(.*?)</fig>', lambda f: fig_html(f.group(1), f.group(2).strip()), body, flags=re.S)

    def ev(m):
        a = m.group(1)
        d = re.search(r'd="([^"]*)"', a).group(1)
        t = re.search(r't="([^"]*)"', a).group(1)
        cls = ' red' if re.search(r'\bred\b', a) else ''
        return '<div class="tl-item%s"><div class="tl-date">%s</div><h3>%s</h3><p>%s</p></div>' % (cls, d, t, m.group(2).strip())
    body = re.sub(r'<ev([^>]*)>(.*?)</ev>', ev, body, flags=re.S)
    return body


def number_sections(body, extra):
    n = [0]

    def sec(m):
        n[0] += 1
        return '<section id="%s"><h2><span class="num">%02d</span>%s</h2>' % (m.group(1), n[0], m.group(2))
    body = re.sub(r'<section id="([^"]+)" data-title="([^"]+)">', sec, body)
    for sid, title, inner in extra:
        n[0] += 1
        body += '\n<section id="%s"><h2><span class="num">%02d</span>%s</h2>%s</section>' % (sid, n[0], title, inner)
    return body


def read_minutes(text):
    t = re.sub(r'<[^>]+>', '', text)
    return max(3, round(len(re.sub(r'\s+', ' ', t)) / 650))


def head(title, desc, root, page, extra_body=''):
    return '''<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s | คู่มือ Warhammer 40K ฉบับมือใหม่</title>
  <meta name="description" content="%s">
  <meta name="theme-color" content="#0b0c0e">
  <link rel="icon" href="%simages/icons/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="%smanifest.webmanifest">
  <link rel="apple-touch-icon" href="%simages/icons/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="%scss/style.css?v=%s">
</head>
<body data-page="%s" data-root="%s"%s>
<script src="%sjs/icons.js?v=%s"></script>
''' % (esc(title), esc(desc), root, root, root, root, CSS_V, page, root, extra_body, root, ICONS_V)


def foot(root, page_nav=True):
    return ('''
      <div data-page-nav></div>
''' if page_nav else '\n') + '''    </article>
  </div>
</main>

<script src="%sjs/layout.js?v=%s"></script>
<script src="%sjs/main.js?v=%s"></script>
</body>
</html>
''' % (root, LAYOUT_V, root, MAIN_V)


def era_of(key):
    return next(e for e in ERAS if e[0] == key)


def build_event(meta, prev, nxt):
    R = '../../'
    era = era_of(meta['era'])
    title = meta['title']
    h1 = meta.get('h1', title)
    th = meta.get('th')
    facts = ''.join('<div class="fact"><small>%s</small><b>%s</b></div>' % (k, v) for k, v in meta['facts'])
    body = expand(meta['body'])
    # ส่วนท้ายทุกหน้า: แหล่งข้อมูล + อ่านต่อ
    src = ''.join('<li><a href="%s%s" target="_blank" rel="noopener">%s</a></li>' % (WIKI, esc(s.replace(' ', '_')), esc(s))
                  for s in meta['sources'])
    sources = ('<p>เนื้อหาหน้านี้สรุปและแปลเป็นภาษาไทยจากบทความใน Warhammer 40k Wiki (Fandom) ซึ่งเรียบเรียงจากหนังสือ Codex, '
               'หนังสือชุด Horus Heresy ของ Forge World และนิยาย Black Library ด้านล่างนี้ (ตรวจสอบ ต.ค. 2026)</p><ul>%s</ul>'
               '<div class="callout"><svg class="i"><use href="#i-info"></use></svg><div><p>เนื้อเรื่อง Warhammer ถูกเขียนเพิ่มและแก้ไขมาตลอดหลายสิบปี '
               'ปี จำนวน และรายละเอียดบางจุด<strong>ต่างกันไปตามหนังสือแต่ละเล่ม</strong> หน้านี้ใช้ฉบับที่แหล่งอ้างอิงส่วนใหญ่ยอมรับ '
               'และบอกไว้เมื่อมีหลายฉบับ</p></div></div>') % src
    rel = ''.join('<a class="btn btn-ghost btn-sm" href="%s%s">%s %s</a> ' % (R + 'pages/', h, ic(i), esc(l)) for h, l, i in meta['related'])
    nav = '<nav class="page-nav">'
    nav += ('<a class="prev" href="%s.html"><small>%s เหตุการณ์ก่อนหน้า</small><b>%s</b></a>' % (prev['slug'], ic('arrow-left'), esc(prev['title']))) if prev else '<span></span>'
    nav += ('<a class="next" href="%s.html"><small>เหตุการณ์ถัดไป %s</small><b>%s</b></a>' % (nxt['slug'], ic('arrow-right'), esc(nxt['title']))) if nxt else '<span></span>'
    nav += '</nav>'
    related = ('<p>%s<a class="btn btn-primary btn-sm" href="%spages/events.html">%s กลับหน้ารวมเหตุการณ์ทั้งหมด</a></p>%s'
               % (rel, R, ic('list'), nav))
    body = number_sections(body, [('sources', 'แหล่งข้อมูลและหมายเหตุ', sources), ('related', 'อ่านต่อ', related)])
    body = body.replace('{R}', R)
    overview = '<div class="facts ev-facts">%s</div>' % facts
    mins = read_minutes(body)
    hero_alt = meta.get('hero_alt', '')
    out = head(title + (' — ' + meta['tagline'] if meta.get('tagline') else ''), meta['desc'], R, 'events')
    out += '''
<main>
  <header class="page-hero">
    <div class="hero-bg"><img src="%simages/%s" alt="%s"%s></div>
    <div class="container">
      <nav class="breadcrumb" aria-label="breadcrumb"><a href="%sindex.html">หน้าแรก</a>%s<span>เนื้อเรื่อง</span>%s<a href="%spages/events.html">เหตุการณ์สำคัญ</a>%s<span>%s</span></nav>
      <h1>%s%s</h1>
      <p class="lead">%s</p>
      <div class="page-meta"><span class="era %s">%s</span><span class="chip">%s %s</span><span class="chip">%s อ่าน ~%d นาที</span></div>
    </div>
  </header>

  <div class="container doc">
    <aside class="toc" data-toc></aside>
    <article class="doc-body">
%s
%s
''' % (R, meta['hero'], esc(hero_alt), (' style="object-position:%s"' % meta['hero_pos']) if meta.get('hero_pos') else '',
       R, ic('chev-right'), ic('chev-right'), R, ic('chev-right'), esc(title),
       esc(h1), (' <span class="th-name">(%s)</span>' % esc(th)) if th else '', meta['lead'],
       era[3], esc(era[1]), ic('clock'), esc(meta['date']), ic('book'), mins, overview, body)
    out += foot(R, False)
    return out


def build_hub(metas):
    R = '../'
    groups = ''
    total = 0
    for key, name, sub, cls in ERAS:
        cards = ''
        for m in metas:
            if m['era'] != key:
                continue
            total += 1
            pos = (' style="object-position:%s"' % m['card_pos']) if m.get('card_pos') else ''
            cards += ('<a class="card img-card ev-card" href="events/%s.html"><div class="img"><img src="%simages/%s" alt="%s" loading="lazy"%s></div>'
                      '<div class="body"><span class="tl-date">%s</span><h3>%s</h3>%s<p>%s</p><span class="more">อ่านต่อ %s</span></div></a>') % (
                m['slug'], R, m.get('card', m['hero']), esc(m['title']), pos, esc(m['date']), esc(m['title']),
                ('<small class="ev-th">%s</small>' % esc(m['th'])) if m.get('th') else '', m['summary'], ic('arrow-right'))
        groups += ('<section id="era-%s"><h2><span class="num">%%02d</span>%s</h2><p class="muted">%s</p><div class="grid grid-3 ev-grid">%s</div></section>\n'
                   % (key, name, sub, cards))
    n = [0]

    def num(_m):
        n[0] += 1
        return '%02d' % n[0]
    intro = '''<section id="how"><h2><span class="num">00</span>อ่านหน้านี้อย่างไร</h2>
<p>หน้านี้รวม<strong>มหาสงครามและเหตุการณ์ใหญ่</strong>ที่เปลี่ยนประวัติศาสตร์ของจักรวาล Warhammer 40,000 แต่ละเหตุการณ์มีหน้าแยกที่เล่าละเอียดตั้งแต่ต้นเหตุ ลำดับการรบ ตัวละครสำคัญ จนถึงผลที่ตามมา พร้อมภาพประกอบ เรียงตามเวลาจากเก่าไปใหม่</p>
<div class="callout tip"><svg class="i"><use href="#i-bulb"></use></svg><div><strong class="title">มือใหม่ควรเริ่มตรงไหน?</strong><p>ถ้าอ่านได้เรื่องเดียว ให้อ่าน <a href="events/horus-heresy.html">Horus Heresy</a> ก่อน เพราะเกือบทุกอย่างในยุค 40K เป็นผลจากสงครามนี้ แล้วค่อยต่อด้วย <a href="events/fall-of-cadia.html">Cadia ล่มสลาย</a> และ <a href="events/great-rift.html">Great Rift</a> ที่เป็นจุดเริ่มของยุคปัจจุบัน ถ้าอยากเห็นภาพรวมทั้งหมดในหน้าเดียว ดู <a href="timeline.html">ไทม์ไลน์ 40K</a></p></div></div>
<div class="callout"><svg class="i"><use href="#i-info"></use></svg><div><strong class="title">อ่านปีแบบ 40K</strong><p>ปีในจักรวาลนี้เขียนแบบ <strong>ปี.สหัสวรรษ</strong> เช่น <span class="kbd">014.M31</span> = ปีที่ 14 ของสหัสวรรษที่ 31 (ราว ค.ศ. 30,014) ดูวิธีอ่านเต็มได้ที่ <a href="glossary.html?q=M41">อภิธานศัพท์</a></p></div></div>
</section>
'''
    groups = re.sub(r'%02d', num, groups)
    out = head('มหาสงครามและเหตุการณ์สำคัญ', 'รวมมหาสงครามและเหตุการณ์ใหญ่ของ Warhammer 40K แบบละเอียด แยกหน้าละเหตุการณ์: Great Crusade, Horus Heresy, Siege of Terra, Badab War, Armageddon, Cadia, Great Rift, Indomitus Crusade และอื่น ๆ', R, 'events')
    out += '''
<main>
  <header class="page-hero">
    <div class="hero-bg"><img src="../images/lore/fall-of-cadia.webp" alt=""></div>
    <div class="container">
      <nav class="breadcrumb" aria-label="breadcrumb"><a href="../index.html">หน้าแรก</a>%s<span>เนื้อเรื่อง</span>%s<span>เหตุการณ์สำคัญ</span></nav>
      <h1>มหาสงครามและเหตุการณ์สำคัญ</h1>
      <p class="lead">เจาะลึกทีละเหตุการณ์ ตั้งแต่สงครามแห่งสวรรค์เมื่อ 60 ล้านปีก่อน, Great Crusade, Horus Heresy จนถึงสงครามล่าสุดในยุค Era Indomitus</p>
      <div class="page-meta"><span class="chip">%s %d เหตุการณ์</span><span class="chip">%s เรียงตามเวลา</span></div>
    </div>
  </header>

  <div class="container doc">
    <aside class="toc" data-toc></aside>
    <article class="doc-body">
%s
%s''' % (ic('chev-right'), ic('chev-right'), ic('scroll'), total, ic('clock'), intro, groups)
    out += foot(R)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    have = [s for s in ORDER if os.path.exists(os.path.join(SRC, s + '.html'))]
    metas = [load(s) for s in have]
    for i, m in enumerate(metas):
        page = build_event(m, metas[i - 1] if i else None, metas[i + 1] if i + 1 < len(metas) else None)
        open(os.path.join(OUT, m['slug'] + '.html'), 'w', encoding='utf-8').write(page)
    open(os.path.join(ROOT, 'pages/events.html'), 'w', encoding='utf-8').write(build_hub(metas))
    missing = [s for s in ORDER if s not in have]
    print('สร้าง %d หน้าเหตุการณ์ + หน้ารวม' % len(metas) + ('' if not missing else ' (ยังไม่มีเนื้อหา: %s)' % ', '.join(missing)))


if __name__ == '__main__':
    main()
