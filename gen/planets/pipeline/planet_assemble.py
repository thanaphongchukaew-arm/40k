"""รวมผู้สมัครทั้งหมด -> resolve redirect -> ตรวจว่าเป็นดาว -> planets/extra_final.json"""
import json, re, os, sys, time, urllib.request, urllib.parse
S = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, S)
from planet_digest import clean, infobox, lead_and_sections
from planet_verify import is_planet_text, PL
W = json.load(open(S + 'planets/wikitext.json'))
D = json.load(open(S + 'planets/digest.json'))
M = json.load(open(S + 'planets/mined.json'))
H = json.load(open(S + 'planets/harvest.json'))
def q(p):
    p['format'] = 'json'
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request('https://warhammer40k.fandom.com/api.php', data=urllib.parse.urlencode(p).encode(), headers={'User-Agent': 'Mozilla/5.0'}), timeout=90))
        except Exception: time.sleep(3)
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'\s*\((planet|moon|world)\)', '', s, flags=re.I)).strip().lower()

# ผู้สมัครที่ตรวจด้วยตาแล้ว (บ้านเกิด Chapter/Knight House/Titan Legion และรายการในบทความระบบดาว)
MANUAL = """108/Beta-Kalapus-9.2|Allhallow|Arachnus|Archea|Armato|Ascalon|Atargatis Prime|Aurelius|Avachrus|Aventinium|Baalus Trine|Badwater|Bellicas|Beta Entebes II|Bloodfall|Bronta-Median|Brycantia|Coralax|Corinal|Cortiz-Pol|Cousteau XI|Cyclopia|Dessah|Draconith|Drogsh|Eden|Eidolica|Elusia Prime|Epos|Erenon|Erwynn's World|Eschara|Felis|Firestorm (Planet)|Gartuli|Gathis II|Gheren|Ghorstangrad|Goritus|Haakoneth|Haldroth|Harkilae IV|Hasciar|Howsbridge|Ingiga|Jaggafall|Jagun|Jahga|Jonol|Kalevala|Keletros|Khassedur|Khoraj|Kracsis IV|Kremonas|Lavantia|Libethra|Luhnborg-IX|Lychnos|Lycosidae|Lynoxis|Lyria|M'Khand|Mancora|Meldegod|Mercuria|Molech|Montsegnur|Moriorum|Mortikah VII|Mundus Pyra|Nachwald|Naktis|Nautilos|Necris|Newfound|Nihilas|Novaris|Numina|Occludus|Ogrys|Ootheca|Orinus|Orpheus Prime|Ossum|Outrenacht|Oxatan|Pervigilium|Phobian|Praedis Zeta|Praesidia|Pranagar|Preyspire|Prism|Ra|Raikan|Repentance|Rhoghon|San Guisiga|Scelus|Scintil-Novax|Shoba|Shovith|Silence (Planet)|Sternac|Stormfall|Taongar|Taran III|Tassandar V|Tauron|Tembron|Thaxis|Tocharion|Traekonnis Major|Tryjon II|Vagoris|Valnum|Vindict V|Vitrea Mundi|Vorinth|Vorl Secunda|Wychval|Zephyr|Zerindal|Highlock IV|Avalus|Nova Thulium|Thulium|Laphis|Mortendar|Angstrom II|Tranquility II|Andermung|Parmenio|Prandium|Protos|Vespator|Frostheim|Midgardia|Aventine|Cel|Terminus Prime|Thaur|Laran 9k|Vanth|Korolis|Macharia|Prosan|Solar Macharius|St. Josmane's Hope|Vigilatum|Badab II|Sagan III|Balhaut|Dominica Minor|Planet 1274-PM|Mercury|Venus|Phobos|Ceres|Saturn|Uranus|Neptune|Pluto""".split('|')
JUNK = set("""Mankind|Humanity|Era Indomitus|Horus Heresy|Great Rift|Cadian Shock Troops|Tanith First-and-Only|House Dorath|Kanak Skull Takers|Hive Fleet Leviathan|Hive Fleet Kraken|WAAAGH! Grimtoof|WAAAGH!|Sons of Horus|Ultramarines|Adepta Sororitas|Sisters of Silence|Daemons|Nurgle|Tzeentch|Humans|Hereteks|Imperial|Compliant|Taghmata|Taghmata Omnissiah|Master of the Hunt|Sacristan|Kasr Holn|Space Hulk|Gas Giant|Agri-world|Hell-Forge|Imperial Compliance|Kayvaan Shrike|Undred-Undred Teef|Aghoru Campaign|Battle of Faith's Anchorage|Endymion Cluster|Cyclops Cluster|Halo Stars|Sub-sector Aurelia|Segmentum Obscurus|Segmentum Solar|Eye of Terror|Age of Strife|Imperium of Man|Ultramar|House Col'Khak|House Orhlacc|House Trainor|Desoleum Oathsmen Grenadiers|Attack Moon|Death of Bianzeer|Isstvan Extremis|Kalkin's Tribune|Conqueror's Due|Scarus|M'Shen""".split('|'))
cands = {}
for k, v in M.items():
    if k not in JUNK: cands[k] = {'name': k, 'snip': v['snip'], 'src': v['src'][:3], 'n': v['n'], 'manual': False}
for k in MANUAL:
    cands.setdefault(k, {'name': k, 'snip': '', 'src': [], 'n': 0, 'manual': True})['manual'] = True
# ข้อมูลบริบทจาก harvest (คำบรรยาย/แหล่งที่มา)
for n in H['names']:
    if n['name'] in cands:
        c = cands[n['name']]; c['src'] = c['src'] or [re.sub(r'\s*\((บ้านเกิด|สมรภูมิ)\)$', '', x) for x in n['ctx']][:3]; c['snip'] = c['snip'] or n['desc']
names = list(cands)
have_title = {d['title'] for d in D}; have_norm = {norm(d['title']) for d in D}
resolved = {}
for i in range(0, len(names), 50):
    d = q({'action': 'query', 'titles': '|'.join(names[i:i + 50]), 'redirects': 1, 'prop': 'revisions|info|pageimages', 'rvprop': 'content', 'rvslots': 'main', 'piprop': 'name'})
    red = {x['from']: x['to'] for x in d['query'].get('redirects', [])}
    nm = {x['from']: x['to'] for x in d['query'].get('normalized', [])}
    pages = {p['title']: p for p in d['query']['pages'].values()}
    for t in names[i:i + 50]:
        tt = nm.get(t, t); tt = red.get(tt, tt)
        resolved[t] = (tt, pages.get(tt))
out, rej, seen = [], [], set()
for t, c in cands.items():
    tt, p = resolved.get(t, (t, None))
    if tt in have_title or norm(tt) in have_norm: rej.append(t + ' [dup of ' + tt + ']'); continue
    key = norm(tt)
    if key in seen: rej.append(t + ' [dup]'); continue
    if p and 'revisions' in p:
        tx = p['revisions'][0]['slots']['main']['*']
        lead, secs = lead_and_sections(tx)
        if '#' in tx[:10].lower() and 'redirect' in tx[:20].lower(): rej.append(t + ' [section redirect]'); continue
        if PL.search(tx[:6000]) or is_planet_text(tt, lead):
            seen.add(key)
            out.append({'title': tt, 'len': p.get('length', 0), 'img': p.get('pageimage'), 'ib': infobox(tx), 'lead': lead[:3000], 'list': '', 'secs': [(h, x[:1800]) for h, x in secs][:14], 'article': True, 'mentions': c['src'], 'snip': c['snip']})
        else: rej.append(t + ' [page not planet]')
    elif c['manual'] or c['n'] >= 1:
        seen.add(key)
        out.append({'title': t, 'len': 0, 'img': None, 'ib': {}, 'lead': c['snip'], 'list': '', 'secs': [], 'article': False, 'mentions': c['src'], 'snip': c['snip']})
    else: rej.append(t + ' [unconfirmed]')
json.dump(out, open(S + 'planets/extra_final.json', 'w'), ensure_ascii=False, indent=0)
print('extra planets', len(out), 'with article', sum(o['article'] for o in out), 'img', sum(bool(o['img']) for o in out))
print('REJECTED', len(rej)); print(rej)
