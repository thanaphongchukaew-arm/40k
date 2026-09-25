"""สร้าง js/planets-data.js + คัดลอกรูปไป images/planets/ จาก digest + คำแปลไทย (th/b*.py) + ดาวที่มีแค่ชื่อ"""
import json, re, glob, os, shutil, hashlib, math, sys
S = os.path.dirname(os.path.abspath(__file__)) + '/'
SITE = '/Users/thanaphong/Documents/test web/40K/'
sys.path.insert(0, S)
from planet_digest import clean
D = json.load(open(S + 'planets/digest.json'))
E = json.load(open(S + 'planets/extra_final.json'))
TH, DROP = {}, set()
for f in sorted(glob.glob(S + 'th/b*.py')):
    g = {}; exec(open(f, encoding='utf-8').read(), g); TH.update(g['TH']); DROP |= set(g.get('DROP', []))

# ---- ดาวเดิมบนแผนที่ (ตำแหน่งและรูปที่ตรวจแล้ว) ----
old = open(SITE + 'pages/galaxy-map.html', encoding='utf-8').read()
OLDL = json.loads(re.search(r'window\.PLANETS = (\[.*?\]);', old, re.S).group(1))
OLD = {p['id']: p for p in OLDL}
ALIAS_OLD = {'necromunda (planet)': 'necromunda', 'mundus planus': None, 'badab primaris': 'badab', "rynn's world": "rynn's world", 'vraks prime': None}

TYPE_TH = [('Hell-Forge', 'Hell-Forge (โรงงานนรกของ Chaos)'), ('Daemon World', 'Daemon World (ดาวปีศาจ)'), ('Forge World', 'Forge World (ดาวโรงงาน Mechanicus)'),
  ('Forge Moon', 'Forge Moon (ดวงจันทร์โรงงาน)'), ('Hive World', 'Hive World (ดาวเมืองหอคอย)'), ('Death World', 'Death World (ดาวมรณะ)'), ('Dead World', 'Dead World (ดาวไร้ชีวิต)'),
  ('Feral World', 'Feral World (ดาวยุคดึกดำบรรพ์)'), ('Feudal World', 'Feudal World (ดาวศักดินา)'), ('Agri', 'Agri-world (ดาวเกษตร)'), ('Civilised World', 'Civilised World (ดาวอารยธรรม)'),
  ('Shrine World', 'Shrine World (ดาวศักดิ์สิทธิ์)'), ('Cardinal World', 'Cardinal World (ดาวของศาสนจักร)'), ('Fortress World', 'Fortress World (ดาวป้อมปราการ)'), ('Mining World', 'Mining World (ดาวเหมือง)'),
  ('Ocean World', 'Ocean World (ดาวมหาสมุทร)'), ('Ice World', 'Ice World (ดาวน้ำแข็ง)'), ('Desert World', 'Desert World (ดาวทะเลทราย)'), ('Jungle World', 'Jungle World (ดาวป่า)'),
  ('Penal World', 'Penal World (ดาวคุก)'), ('Frontier World', 'Frontier World (ดาวชายแดน)'), ('Industrial World', 'Industrial World (ดาวอุตสาหกรรม)'), ('Tomb World', 'Tomb World (ดาวสุสาน Necron)'),
  ('Knight World', 'Knight World (ดาวอัศวิน)'), ('Maiden World', 'Maiden World (ดาวของ Aeldari)'), ('Exodite', 'Exodite World (ดาว Exodite)'), ('Garden World', 'Garden World (ดาวสวน)'),
  ('Pleasure World', 'Pleasure World (ดาวพักผ่อน)'), ('War World', 'War World (ดาวสงคราม)'), ('Kin World', 'Kin World (ดาวของ Votann)'), ('Hold World', 'Hold World (ดาวป้อมของ Votann)'),
  ('Sept', 'Sept World (ดาวของ T\'au)'), ('Xenos World', 'Xenos World (ดาวเอเลียน)'), ('Ork World', 'Ork World (ดาวออร์ค)'), ('Gas Giant', 'Gas Giant (ดาวแก๊สยักษ์)'),
  ('Chapter Homeworld', 'บ้านเกิด Space Marine Chapter'), ('Legion Homeworld', 'บ้านเกิด Space Marine Legion'), ('Throne', 'Throne World (ดาวบัลลังก์)'), ('Cemetery World', 'Cemetery World (ดาวสุสาน)'),
  ('Paradise World', 'Paradise World (ดาวสวรรค์)'), ('Research Station', 'Research Station (สถานีวิจัย)'), ('Arboreal', 'Arboreal World (ดาวป่าต้นไม้)'), ('Swamp World', 'Swamp World (ดาวหนองน้ำ)'),
  ('Quarantined', 'Quarantined (ถูกกักกัน)'), ('Forbidden World', 'Forbidden World (ดาวต้องห้าม)'), ('Derelict World', 'Derelict World (ดาวร้าง)'), ('Mountain World', 'Mountain World (ดาวภูเขา)'),
  ('Segmentum Fortress', 'Segmentum Fortress (ฐานทัพหลักของ Segmentum)'), ('Artificial', 'Artificial World (ดาวประดิษฐ์)')]
def type_th(t):
    if not t: return ''
    out = []
    for k, v in TYPE_TH:
        if k.lower() in t.lower() and v not in out: out.append(v)
    return ' · '.join(out[:4]) or t[:80]
SEG_RE = [('Solar', r'Solar'), ('Obscurus', r'Obscurus'), ('Ultima', r'Ultima'), ('Tempestus', r'Tempestus'), ('Pacificus', r'Pacificus')]
def seg_of(*txt):
    s = ' '.join(x for x in txt if x)
    for k, r in SEG_RE:
        if re.search(r'Segmentum ' + r + r'|' + r + r' Segmentum', s): return k
    return ''
# ---- โซนบนแผนที่ (พิกัดบนภาพ 1400x1120) ----
ZONE = {
  'Solar': ('c', 323, 598, 140), 'Obscurus': ('b', 140, 110, 700, 470), 'Pacificus': ('b', 35, 440, 220, 930), 'Tempestus': ('b', 190, 780, 780, 1070),
  'Ultima': ('b', 740, 140, 1350, 1060), 'Eye': ('c', 205, 318, 85), 'Maelstrom': ('c', 675, 628, 55), 'Core': ('c', 740, 560, 110), 'Ultramar': ('c', 1055, 925, 75),
  'Jericho': ('b', 1160, 300, 1350, 620), 'Calixis': ('c', 590, 210, 70), 'Askellon': ('c', 470, 170, 55), 'Sabbat': ('c', 120, 780, 70), 'Badab': ('c', 660, 730, 45),
  'Gothic': ('c', 330, 170, 55), 'Scarus': ('c', 470, 300, 45), 'Chalnath': ('b', 880, 160, 1080, 290), 'Koronus': ('c', 660, 150, 45), 'Hadex': ('c', 1240, 470, 45),
  'Ghoul': ('b', 1230, 150, 1350, 300), 'Charadon': ('c', 900, 740, 45), 'Elara': ('c', 1180, 700, 50), 'Cadian': ('c', 260, 390, 40), 'Tau': ('c', 1133, 802, 45),
}
def zone_for(p):
    txt = ' '.join([p.get('ib', {}).get(k, '') for k in ('segmentum', 'sector', 'sub-sector', 'system', 'type', 'affiliation')] + [p.get('lead', '')[:600]])
    rules = [('Jericho', r'Jericho Reach|Achilus Crusade'), ('Calixis', r'Calixis Sector'), ('Koronus', r'Koronus Expanse'), ('Askellon', r'Askellon Sector'),
             ('Sabbat', r'Sabbat Worlds'), ('Badab', r'Badab'), ('Ultramar', r'Ultramar|Konor System|Macragge System|Talasa System'), ('Maelstrom', r'Maelstrom'),
             ('Eye', r'Eye of Terror'), ('Hadex', r'Hadex Anomaly'), ('Gothic', r'Gothic Sector|Cyclops Cluster'), ('Scarus', r'Scarus Sector'),
             ('Chalnath', r'Chalnath'), ('Core', r'galactic core|Leagues of Votann'), ('Ghoul', r'Ghoul Stars'), ('Charadon', r'Charadon'),
             ('Elara', r"Elara's Veil"), ('Cadian', r'Cadian (Sector|System|Gate)|Agripinaa'), ('Tau', r"T'au Empire|Tau Empire|Sept")]
    for z, r in rules:
        if re.search(r, txt, re.I): return z
    s = seg_of(txt)
    if s == 'Solar' and re.search(r'Sol System', txt): return 'Solar'
    return s or ''
def spot(zone, key, taken):
    z = ZONE[zone]; h = int(hashlib.md5(key.encode()).hexdigest(), 16)
    for k in range(400):
        a = ((h >> (k % 40)) % 10007) / 10007.0; b = ((h >> ((k * 7) % 45)) % 10009) / 10009.0
        a = (a + k * 0.61803) % 1; b = (b + k * 0.41421) % 1
        if z[0] == 'c':
            r = z[3] * math.sqrt(b); x, y = z[1] + r * math.cos(a * 6.2832), z[2] + r * math.sin(a * 6.2832)
        else:
            x, y = z[1] + a * (z[3] - z[1]), z[2] + b * (z[4] - z[2])
        if zone != 'Solar' and math.hypot(x - 323, y - 598) < 150: continue
        if all(math.hypot(x - tx, y - ty) > 11 for tx, ty in taken): return round(x), round(y)
    return round(x), round(y)

FAMOUS = ['Terra', 'Mars', 'Cadia', 'Macragge', 'Fenris', 'Baal', 'Armageddon', 'Prospero', 'Calth', 'Isstvan V', 'Isstvan III', 'Caliban', 'Nostramo', 'Nocturne',
  'Medusa', 'Mundus Planus', 'Olympia', 'Barbarus', 'Colchis', 'Nuceria', 'Chemos', 'Cthonia', 'Deliverance', 'Vraks Prime', 'Ullanor Prime', 'Tallarn', 'Catachan',
  'Krieg', 'Titan (Moon)', 'Luna', 'Vigilus', 'Necromunda (Planet)', 'Nikaea', 'Davin', 'Planet of the Sorcerers', 'Plague Planet', 'Sicarus', 'Valhalla', 'Mordian',
  "T'au (Planet)", 'Ryza', 'Graia', 'Ophelia VII', 'Tanith', 'Signus Prime', 'Khur', 'Tsagualsa', 'Molech', 'Medusa V', 'Damnos', 'Kronus', 'Tartarus', 'Ichar IV',
  'Belis Corona', 'Cypra Mundi', 'Bakka', 'Hydraphur', 'Kar Duniash', 'Scintilla', 'Sotha', 'Tyran', 'Gryphonne IV', 'Badab Primaris', 'Stygies VIII', 'Lucius', 'Elysia', 'Praetoria', 'Savlar']
ST = {'stable', 'war', 'retaken', 'destroyed', 'chaos', 'xenos', 'unknown'}
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", '').replace('ü', 'u').replace('é', 'e').replace('â', 'a').replace('û', 'u').replace('ô', 'o').replace('ö', 'o')).strip('-')
os.makedirs(SITE + 'images/planets/wiki', exist_ok=True)
out, taken, used_slugs = [], [], set()
MAPRE = re.compile(r'map|segmentum|salient|reach|forge_worlds|expansion|system|orbit|cartograph|galactic', re.I)
for d in D:
    t = d['title']
    if t in DROP or t not in TH: continue
    e = TH[t]; ib = d['ib']
    assert e['st'] in ST, (t, e['st'])
    name = re.sub(r'\s*\((Planet|Moon)\)$', '', t)
    o = OLD.get(name.lower()) or OLD.get((ALIAS_OLD.get(t.lower()) or '').lower() if ALIAS_OLD.get(t.lower()) else '')
    sid = slug(name);
    while sid in used_slugs: sid += '-2'
    used_slugs.add(sid)
    img, cap = None, ''
    if o and o.get('img'): img = o['img']; cap = 'ภาพประกอบ'
    elif d.get('img') and os.path.exists(S + 'planets/img/' + d['slug'] + '.webp'):
        shutil.copy(S + 'planets/img/' + d['slug'] + '.webp', SITE + 'images/planets/wiki/' + sid + '.webp')
        img = 'planets/wiki/' + sid + '.webp'; cap = 'แผนที่' if MAPRE.search(d['img']) else 'ภาพประกอบ'
    zone = zone_for(d)
    if o: x, y = o['x'], o['y']
    elif zone: x, y = spot(zone, sid, taken)
    else: x = y = None
    if x is not None: taken.append((x, y))
    score = d['len'] + (400000 - FAMOUS.index(t) * 3000 if t in FAMOUS else 0)
    rec = {'id': sid, 'name': name, 'th': e['th'], 'st': e['st'], 'type': type_th(ib.get('type', '')), 'seg': seg_of(ib.get('segmentum', ''), d.get('lead', '')[:400]),
           'sector': ib.get('sector', '')[:80], 'system': ib.get('system', '')[:80], 'pop': ib.get('population', '')[:120], 'aff': ib.get('affiliation', '')[:120],
           'gov': ib.get('planetary_governor', '')[:100], 'tithe': ib.get('tithe_grade', '')[:80], 'climate': ib.get('temperature_/_climate', '')[:160],
           'sum': e['sum'], 'life': e.get('life', ''), 'ev': e.get('ev', []), 'now': e.get('now', ''), 'fact': e.get('fact', ''), 'img': img, 'cap': cap,
           'x': x, 'y': y, 'score': score, 'src': 'https://warhammer40k.fandom.com/wiki/' + t.replace(' ', '_') if d['article'] else '', 'lore': 1}
    out.append(rec)
# ---- ภูมิภาค/ป้อมจากแผนที่เดิมที่ไม่ใช่ดาว (Eye of Terror, Maelstrom ฯลฯ) ----
matched = {r['id'] for r in out} | {'badab'}
for o in OLDL:
    if o['id'] in matched: continue
    used_slugs.add(o['id']); taken.append((o['x'], o['y']))
    out.append({'id': o['id'], 'name': o['name'], 'th': o['th'], 'st': o['status'], 'type': o['type'], 'seg': '', 'sector': '', 'system': '', 'pop': '', 'aff': o['ruler'],
                'gov': '', 'tithe': '', 'climate': '', 'sum': o['society'], 'life': o['life'], 'ev': o['events'], 'now': o['now'], 'fact': '', 'img': o.get('img'), 'cap': 'ภาพประกอบ',
                'x': o['x'], 'y': o['y'], 'score': 380000 if o['id'] in ('eye-of-terror', 'maelstrom') else 25000, 'src': '', 'lore': 1, 'region': 1})
# ---- ดาวที่มีแค่ชื่อ ----
for e in E:
    name = e['title']; sid = slug(name)
    if sid in used_slugs: continue
    used_slugs.add(sid)
    txt = ' '.join([e.get('snip', ''), e.get('lead', '')])
    zone = zone_for({'ib': e.get('ib', {}), 'lead': txt})
    x = y = None
    if zone: x, y = spot(zone, sid, taken); taken.append((x, y))
    ms = [m for m in e.get('mentions', []) if m][:3]
    out.append({'id': sid, 'name': name, 'th': '', 'st': 'unknown', 'type': type_th(e.get('ib', {}).get('type', '')), 'seg': seg_of(txt), 'sector': '', 'system': '', 'pop': '', 'aff': '',
                'gov': '', 'tithe': '', 'climate': '', 'sum': '', 'life': '', 'ev': [], 'now': '', 'fact': '', 'img': None, 'cap': '', 'x': x, 'y': y, 'score': 0,
                'src': ('https://warhammer40k.fandom.com/wiki/' + name.replace(' ', '_')) if e.get('article') else '', 'lore': 0,
                'men': [{'t': m, 'u': 'https://warhammer40k.fandom.com/wiki/' + m.replace(' ', '_')} for m in ms]})
out.sort(key=lambda r: (-r['score'], r['name']))
for i, r in enumerate(out): r['rank'] = i + 1
js = '/* ข้อมูลดาวทั้งหมดของแผนที่กาแล็กซี — สร้างจาก Warhammer 40k Wiki แปลและตรวจทานเป็นภาษาไทย (อย่าแก้มือ) */\nwindow.PLANETS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(SITE + 'js/planets-data.js', 'w', encoding='utf-8').write(js)
print('planets', len(out), 'with lore', sum(r['lore'] for r in out), 'on map', sum(r['x'] is not None for r in out), 'img', sum(bool(r['img']) for r in out), 'size', len(js) // 1024, 'KB')
import collections; print(collections.Counter(r['st'] for r in out)); print([r['name'] for r in out[:25]])
