import json,re,glob,sys,os
sys.path.insert(0,'.')
from planet_digest import clean
D=json.load(open('planets/digest.json')); W=json.load(open('planets/wikitext.json'))
TH={};DROP=set()
for f in sorted(glob.glob('th/b*.py')):
    g={}; exec(open(f,encoding='utf-8').read(),g); TH.update(g['TH']); DROP|=set(g.get('DROP',[]))
missing=[d['title'] for d in D if d['title'] not in TH and d['title'] not in DROP]
extra=[t for t in TH if t not in {d['title'] for d in D}]
print('digest',len(D),'written',len(TH),'drop',len(DROP),'missing',missing,'extra',extra)
# token verification
STOP={'M','Chaos','Imperium','World','Ork','Orks','Space','Marine','Marines','Chapter','Legion','Warp','Great','Sector','Segmentum','Forge','Hive','Death','Dead','Titan','Knight','Crusade','Heresy','Horus','Aeldari','Eldar','Necron','Tyranid','T','Kin','Votann','Dark','Age','Technology','Mechanicus','Emperor','Astra','Militarum','Imperial','Guard','Era','Indomitus','Fleet','Hive','Rift','Agri','Feral','Frontier','Mining','Shrine','Fortress','Civilised','Ocean','Desert','Ice','Jungle','Penal','Tomb','Daemon','Xenos','Sept','Hold','War','World','Worlds','Pleasure','Cardinal','Industrial','Genestealer','Primarch','Primaris','Legion','Sub','sector','Cult','Prime','II','III','IV','V','VI','VII','VIII','IX','XI','of','the','and','Omnissiah','Nurgle','Khorne','Tzeentch','Slaanesh','Machine','God','Webway','Squat','Abhuman','Ratling','Ogryn','STC','Kill','Team','Dawn','PDF','DLC','Epsilon','Exodite','Maiden','Garden','Paradise','Dynasty','Overlord','Warboss','Warlord','WAAAGH','Waaagh','Inquisition','Deathwatch','Sisters','Battle','Ecclesiarchy','Administratum','Munitorum','Navy','Gas','Giant','Mountain','Swamp','Arboreal','Derelict','Kin','Imperium','Nihilus','Sanctus','Solar','Ultima','Obscurus','Tempestus','Pacificus','Eastern','Fringe','Grand','Lord','Commander','Chaos','Marines','Heretic','Astartes','Hell','Sphere','Expansion','Tyrannic','Caste','Earth','Water','Fire','Air','Ethereal','Air','Titan','Legio','Game','Games','Workshop','Edition','Tithe','Grade','Stratagem'}
def toks(s):
    return set(re.findall(r"[A-Z][A-Za-z'’\-âûôêÛÂöü]+|\d{2,}(?:\.\d+)?(?:\.M\d+)?|M\d{2}",s))
report=[]
for d in D:
    t=d['title']
    if t not in TH: continue
    e=TH[t]
    txt=' '.join([e.get('sum',''),e.get('life',''),e.get('now',''),e.get('fact','')]+[a+' '+b for a,b in e.get('ev',[])])
    src=(W.get(t,{}).get('text','')+' '+d.get('list','')+' '+d.get('lead',''))
    srcn=clean(src).replace('’',"'")
    bad=[k for k in toks(txt) if k not in STOP and k.replace('’',"'") not in srcn and k.rstrip('s') not in srcn]
    # numbers like 999.M41 check
    if bad: report.append((t,bad))
print('entries with unverified tokens:',len(report))
for t,b in report: print(' -',t,':',', '.join(sorted(b)))
