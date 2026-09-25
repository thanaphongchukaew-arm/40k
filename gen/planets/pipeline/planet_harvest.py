"""หาดาวเพิ่ม: (1) บทความใหม่ที่เป็นดาว (2) ชื่อดาวจากรายการในบทความ Sector/System, บ้านเกิด Chapter, สถานที่ของศึก"""
import json, re, os, collections, sys
S = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, S)
from planet_digest import clean, infobox, lead_and_sections, GENERIC
W = json.load(open(S + 'planets/wikitext.json'))
D = json.load(open(S + 'planets/digest.json'))
X = json.load(open(S + 'planets/extra_titles.json'))
have = {d['title'].lower() for d in D}
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'\s*\((planet|moon|world)\)', '', s, flags=re.I)).strip().lower()
have_n = {norm(d['title']) for d in D}
PL = re.compile(r'\{\{\s*(infobox[ _])?planet\b', re.I)
WORLDY = re.compile(r"^[^.]{0,200}\b(is|was)\s+(a|an|the)\s+[^.]{0,80}?\b(world|planet|moon|planetoid|hive world|forge world|homeworld|death world|gas giant)\b", re.I)
NONPLANET = re.compile(r'\{\{\s*(infobox[ _](chapter|campaigns?|chaos warband|titan legion|adeptus|necron dynasty|character|regiment|vehicle|weapon))', re.I)

add = []
# (1) บทความใหม่
for t, cats in X.items():
    if norm(t) in have_n or t in GENERIC or t not in W: continue
    tx = W[t]['text']
    if tx.lower().startswith('#redirect') or NONPLANET.search(tx[:5000]): continue
    lead, secs = lead_and_sections(tx)
    if PL.search(tx[:6000]) or WORLDY.search(lead[:400]):
        if re.search(r'\b(sector|sub-sector|subsector|segmentum|system|crusade|craftworld|cluster|nebula|region|zone|reach|expanse)\b', t, re.I) and not PL.search(tx[:6000]):
            continue
        add.append({'title': t, 'len': W[t]['len'], 'img': W[t]['img'], 'ib': infobox(tx), 'lead': lead[:3000], 'list': '', 'secs': [(h, x[:1800]) for h, x in secs][:14], 'article': True, 'from': cats})
        have_n.add(norm(t))
print('new planet articles', len(add))

# (2) ชื่อดาวอย่างเดียว
names = collections.OrderedDict()
def put(name, ctx, desc='', seg=''):
    name = clean(name).strip(" '\"")
    if not name or len(name) > 40 or norm(name) in have_n: return
    if re.search(r'\b(sector|sub-sector|subsector|segmentum|crusade|campaign|war|battle|fleet|legion|chapter|system|cluster|nebula|region|zone|expanse|imperium|galaxy|warp|eye of terror|maelstrom|unknown|various|none)\b', name, re.I): return
    if name[0].islower() or re.search(r'[{}\[\]|=]', name): return
    e = names.setdefault(norm(name), {'name': name, 'ctx': [], 'desc': desc, 'seg': seg})
    if ctx not in e['ctx']: e['ctx'].append(ctx)
    if desc and not e['desc']: e['desc'] = desc
    if seg and not e['seg']: e['seg'] = seg
SEGS = ['Solar', 'Obscurus', 'Ultima', 'Tempestus', 'Pacificus']
def seg_of(tx):
    m = re.search(r'\|\s*segmentum\s*=\s*([^\n]*)', tx, re.I)
    s = m.group(1) if m else tx[:3000]
    for g in SEGS:
        if re.search(r'Segmentum ' + g + r'|' + g + r' Segmentum', s): return g
    return ''
for t, v in W.items():
    tx = v['text']
    if tx.lower().startswith('#redirect'): continue
    # บ้านเกิด Chapter / Regiment
    for f in ('homeworld', 'home world', 'origin', 'fortress-monastery', 'fortress_monastery'):
        for m in re.finditer(r'\|\s*' + f + r'\s*=\s*([^\n]*)', tx[:6000], re.I):
            for link in re.findall(r'\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]', m.group(1)):
                if link.lower() not in have: put(link, t + ' (บ้านเกิด)', '', seg_of(tx))
    # สถานที่ของศึก
    for m in re.finditer(r'\|\s*(location|place|planet|theatre)\s*=\s*([^\n]*)', tx[:6000], re.I):
        for link in re.findall(r'\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]', m.group(2)):
            if link.lower() not in have: put(link, t + ' (สมรภูมิ)', '', seg_of(tx))
    # รายการดาวในบทความ Sector / System / Subsector
    cats = X.get(t, [])
    if any(c in ('Sector', 'System', 'Subsector', 'Calixis Sector', 'Askellon Sector', 'Sabbat Worlds', 'Gothic Sector', 'Scarus Sector', 'Octarius Sector', 'Caligari Sector', 'Gilead System', 'Bastior Sub-sector', 'Sector Solar') for c in cats) or re.search(r'\b(Sector|System|Sub-sector)\b', t):
        sg = seg_of(tx)
        for sec in re.split(r'^==+', tx, flags=re.M):
            head = sec.split('\n', 1)[0]
            if not re.search(r'world|planet|system|moon|location|notable', head, re.I): continue
            for line in re.findall(r'^\*+\s*(.+)$', sec, re.M):
                m = re.match(r"\s*'*\[\[([^\]|#]+)(?:\|([^\]]*))?\]\]'*\s*(?:[-–—:]\s*(.*))?", line)
                if m:
                    put(m.group(2) or m.group(1), t, clean(m.group(3) or '')[:400], sg)
print('name-only candidates', len(names))
json.dump({'articles': add, 'names': list(names.values())}, open(S + 'planets/harvest.json', 'w'), ensure_ascii=False, indent=0)
print([a['title'] for a in add[:40]])
print([n['name'] + ' <' + n['ctx'][0] + '>' for n in list(names.values())[:120]])
