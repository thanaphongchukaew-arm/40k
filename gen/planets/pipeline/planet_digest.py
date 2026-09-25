"""สร้าง digest ของดาวทุกดวง: infobox, บทนำ, หัวข้อ, รูป, ความยาวบทความ -> planets/digest.json"""
import json, re, os
S = os.path.dirname(os.path.abspath(__file__)) + '/'
W = json.load(open(S + 'planets/wikitext.json'))
K = json.load(open(S + 'planets/keep.json'))
E = json.load(open(S + 'planets/embedded.json'))

GENERIC = {'Agri-World', 'Arboreal World', 'Armoury World', 'Artificial World', 'Cardinal World', 'Cemetery World', 'Chem World', 'Civilised World',
           'Crone World', 'Daemon World', 'Dead World', 'Death World', 'Derelict World', 'Desert World', 'Feral World', 'Feudal World', 'Forbidden World',
           'Forge World', 'Fortress World', 'Frontier World', 'Hive World', 'Hold World', 'Ice World', 'Industrial World', 'Jungle World', 'Kin World',
           'Knight Worlds', 'Maiden World', 'Menagerie World', 'Mining World', 'Ocean World', 'Penal World', 'Pleasure World', 'Quarry World', 'Rad World',
           'Sentinel World', 'Shrine World', 'Swamp World', 'Tomb World', 'War World', 'Xenos World', 'Planets', 'Planets of Warhammer 40,000',
           'Space Marine Chapter Homeworld', 'Ork Empire', 'Hell-Forge', 'Tau Sept', 'Imperial planets', 'Research Station', 'Paradise World',
           'Garden World', 'Dead Worlds', 'Pleasure Worlds', 'Tomb Worlds', 'Exodite World', 'Craftworld', 'Hive City', 'Mechanicus Forge World'}

def strip_templates(t):
    out, depth, i = [], 0, 0
    while i < len(t):
        if t.startswith('{{', i): depth += 1; i += 2; continue
        if t.startswith('}}', i) and depth: depth -= 1; i += 2; continue
        if not depth: out.append(t[i])
        i += 1
    return ''.join(out)

def clean(t):
    t = re.sub(r'<ref[^>/]*/>', '', t)
    t = re.sub(r'<ref[^>]*>.*?</ref>', '', t, flags=re.S)
    t = strip_templates(t)
    t = re.sub(r'\[\[(?:File|Image):[^\[\]]*(?:\[\[[^\]]*\]\][^\[\]]*)*\]\]', '', t)
    t = re.sub(r'\[\[(?:Category):[^\]]*\]\]', '', t)
    t = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'\[\[([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'\[https?://\S+ ([^\]]*)\]', r'\1', t)
    t = re.sub(r"'{2,}", '', t)
    t = re.sub(r'<br\s*/?>', ' / ', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'__\w+__', '', t)
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

def infobox(t):
    m = re.search(r'\{\{\s*(?:Infobox )?Planet\s*\n?(.*?)\n\}\}', t, re.S | re.I)
    if not m: return {}
    d = {}
    for k, v in re.findall(r'^\s*\|\s*([^=|\n]+?)\s*=\s*(.*)$', m.group(1), re.M):
        k = k.strip().lower(); v = clean(v)
        if v and v.lower() not in ('unknown', 'n/a', 'none', '?'): d[k] = v
    alias = {'orbdist': 'orbital_radius', 'temp': 'temperature_/_climate', 'pop': 'population', 'subsector': 'sub-sector', 'governor': 'planetary_governor'}
    for a, b in alias.items():
        if a in d and b not in d: d[b] = d.pop(a)
    return d

def lead_and_sections(t):
    body = re.sub(r'\{\{\s*(?:Infobox )?Planet.*?\n\}\}', '', t, count=1, flags=re.S | re.I)
    parts = re.split(r'^==+\s*(.*?)\s*==+\s*$', body, flags=re.M)
    lead = clean(parts[0])
    secs = []
    for i in range(1, len(parts), 2):
        h = clean(parts[i]); tx = clean(parts[i + 1]) if i + 1 < len(parts) else ''
        if h.lower() in ('sources', 'gallery', 'see also', 'notable campaigns', 'related articles', 'references', 'notes'): continue
        secs.append((h, tx))
    return lead, secs

if __name__ == '__main__':
    # รายการจากบทความ "Planets of Warhammer 40,000"
    LIST = {}
    lt = W['Planets of Warhammer 40,000']['text']
    for m in re.finditer(r'^===\s*(.*?)\s*===\s*$\n(.*?)(?=^==)', lt, re.M | re.S):
        head = m.group(1)
        links = re.findall(r'\[\[([^\]|]+)', head)
        name = clean(head)
        LIST[links[0] if links else name] = {'name': name, 'text': clean(m.group(2))[:2500]}

    names = [t for t in K if t not in GENERIC] + [t for t in E if t not in K and t in W]
    for n in LIST:
        if n not in names and n not in GENERIC: names.append(n)
    out = []
    for n in names:
        src = W.get(n)
        ib, lead, secs, ln, img = {}, '', [], 0, None
        if src:
            ib = infobox(src['text']); lead, secs = lead_and_sections(src['text']); ln = src['len']; img = src['img']
            if 'image1' in ib: pass
        li = LIST.get(n)
        if not lead and li: lead = li['text']
        if not src and not li: continue
        out.append({'title': n, 'len': ln, 'img': img, 'ib': ib, 'lead': lead[:3000], 'list': li['text'] if li else '',
                    'secs': [(h, tx[:1800]) for h, tx in secs][:14], 'article': bool(src)})
    out.sort(key=lambda x: -(x['len'] or len(x['list'])))
    json.dump(out, open(S + 'planets/digest.json', 'w'), ensure_ascii=False, indent=0)
    print('planets', len(out), 'with article', sum(o['article'] for o in out), 'with img', sum(bool(o['img']) for o in out))
    print([ (o['title'], o['len']) for o in out[:30]])
    print('list-only', [o['title'] for o in out if not o['article']][:40])

