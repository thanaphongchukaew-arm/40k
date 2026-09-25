"""ตรวจชื่อดาวที่เก็บมาอย่างเข้มงวด: ต้องยืนยันได้ว่าเป็นดาว/ดวงจันทร์จริง"""
import json, re, os, sys, time, urllib.request, urllib.parse
S = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, S)
from planet_digest import clean, infobox, lead_and_sections
W = json.load(open(S + 'planets/wikitext.json'))
H = json.load(open(S + 'planets/harvest.json'))
def q(p):
    p['format'] = 'json'
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request('https://warhammer40k.fandom.com/api.php', data=urllib.parse.urlencode(p).encode(), headers={'User-Agent': 'Mozilla/5.0'}), timeout=90))
        except Exception: time.sleep(3)
PL = re.compile(r'\{\{\s*(infobox[ _])?planet\b', re.I)
BAD = re.compile(r'\b(species|creature|beast|plant|tree|flower|fungus|insect|animal|predator|ship|vessel|voidship|battleship|cruiser|station|fortress-monastery|fortress monastery|monastery|citadel|fortress|keep|castle|city|hive city|spire|temple|cathedral|chapter|regiment|warband|order|legion|weapon|relic|artefact|artifact|daemon|character|person|sword)\b', re.I)
def first_sentence(lead):
    lead = re.sub(r'\s+', ' ', lead).strip()
    m = re.match(r'(.{20,400}?[.!?])(\s|$)', lead)
    return m.group(1) if m else lead[:400]
def is_planet_text(title, lead):
    fs = first_sentence(lead)
    m = re.search(r'\b(is|was)\s+(?:once\s+)?(?:a|an|the)\s+([^.]{0,120}?)\b(world|planet|moon|planetoid|gas giant|homeworld)\b', fs, re.I)
    if not m: return False
    before = fs[:m.start()]
    if re.search(r'\b(native|found|indigenous|endemic)\b', before + m.group(2), re.I): return False
    if BAD.search(m.group(2)): return False
    return True

# 1) บทความใหม่ (ตรวจซ้ำแบบเข้ม)
arts = [a for a in H['articles'] if PL.search(W[a['title']]['text'][:6000]) or is_planet_text(a['title'], a['lead'])]
print('articles kept', [a['title'] for a in arts])

# 2) ชื่อจากลิงก์: ดูว่ามีบทความไหม
names = H['names']
titles = [n['name'] for n in names]
exist = {}
for i in range(0, len(titles), 50):
    d = q({'action': 'query', 'titles': '|'.join(titles[i:i + 50]), 'redirects': 1, 'prop': 'revisions|info|pageimages', 'rvprop': 'content', 'rvslots': 'main', 'piprop': 'name'})
    if not d: continue
    red = {x['from']: x['to'] for x in d['query'].get('redirects', [])}
    nm = {x['from']: x['to'] for x in d['query'].get('normalized', [])}
    pages = {p['title']: p for p in d['query']['pages'].values()}
    for t in titles[i:i + 50]:
        tt = nm.get(t, t); tt = red.get(tt, tt)
        p = pages.get(tt)
        if p and 'revisions' in p: exist[t] = (tt, p)
keep, rej = [], []
for n in names:
    t = n['name']
    if t in exist:
        tt, p = exist[t]; tx = p['revisions'][0]['slots']['main']['*']
        lead, secs = lead_and_sections(tx)
        if PL.search(tx[:6000]) or is_planet_text(tt, lead):
            n.update({'title': tt, 'len': p.get('length', 0), 'img': p.get('pageimage'), 'ib': infobox(tx), 'lead': lead[:3000], 'secs': [(h, x[:1800]) for h, x in secs][:14], 'article': True})
            keep.append(n)
        else: rej.append(t + ' [page:not planet]')
    else:
        # ไม่มีบทความ: ต้องมีคำบรรยายว่าเป็นดาว หรือบริบทบ้านเกิดที่ประโยคระบุว่าเป็นโลก/ดาว
        ok = False
        if n['desc'] and re.search(r'\b(world|planet|moon|planetoid)\b', n['desc'], re.I) and not BAD.search(n['desc'][:60]): ok = True
        else:
            for c in n['ctx']:
                src = re.sub(r'\s*\((บ้านเกิด|สมรภูมิ)\)$', '', c)
                if src in W:
                    txt = clean(W[src]['text'])
                    for sent in re.split(r'(?<=[.!?])\s+', txt):
                        if t in sent and re.search(r'\b(world|planet|moon)\b', sent, re.I) and not re.search(re.escape(t) + r'\W{0,3}\s*(fortress|monastery|citadel|keep|station|ship)', sent, re.I):
                            ok = True; n['desc'] = n['desc'] or sent[:400]; break
                if ok: break
        if ok: n.update({'title': t, 'len': 0, 'img': None, 'ib': {}, 'lead': n['desc'], 'secs': [], 'article': False}); keep.append(n)
        else: rej.append(t + ' [no page, unconfirmed]')
print('names kept', len(keep), 'rejected', len(rej))
json.dump({'articles': arts, 'names': keep, 'rejected': rej}, open(S + 'planets/verified.json', 'w'), ensure_ascii=False, indent=0)
print('KEPT:', [k['name'] + ('*' if k['article'] else '') for k in keep])
print('REJ sample:', rej[:80])
