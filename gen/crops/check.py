"""ขั้น 3: หารูปที่ใบหน้า/จุดเด่นโดนกรอบตัด แล้วเสนอ object-position ใหม่ (ไม่แก้ไฟล์ใด ๆ)
ผลลัพธ์: out/moves.json และ out/sheet.html (ภาพก่อน | หลัง ขอบเขียว) — เปิดผ่าน http://localhost:8765/gen/crops/out/sheet.html
ดูภาพเทียบด้วยตาก่อนเสมอ แล้วค่อยใส่ style="object-position:X% Y%" ที่แท็ก <img> ที่ต้องการ"""
import json,urllib.parse,collections,os
D=os.path.dirname(os.path.abspath(__file__)); R=os.path.dirname(os.path.dirname(D)); O=D+'/out'
d=json.load(open(O+'/crawl.json')); V=json.load(open(O+'/vis.json'))
def pp(s,ow):
    s=s.strip()
    if s.endswith('%'): return float(s[:-1])/100
    if s.endswith('px'): return float(s[:-2])/ow if ow>0 else .5
    return .5
def subject(v):
    if v['faces']:
        xs=[f[0] for f in v['faces']];ys=[f[1] for f in v['faces']];xe=[f[0]+f[2] for f in v['faces']];ye=[f[1]+f[3] for f in v['faces']]
        x0,y0,x1,y1=min(xs),min(ys),max(xe),max(ye); hh=y1-y0
        return ('face',x0,max(0,y0-.35*hh),x1,min(1,y1+.15*hh))   # include head/helmet top
    a=[o for o in v['att']]
    if not a: return None
    return ('att',min(o[0] for o in a),min(o[1] for o in a),max(o[0]+o[2] for o in a),max(o[1]+o[3] for o in a))
def window(W,H,w,h,px,py):
    s=max(w/W,h/H); RW,RH=W*s,H*s; ox,oy=RW-w,RH-h
    return (px*ox/RW, px*ox/RW+w/RW, py*oy/RH, py*oy/RH+h/RH), ox>1, oy>1
def cov(a0,a1,b0,b1):
    L=b1-b0; return 1 if L<=1e-6 else max(0,min(a1,b1)-max(a0,b0))/L
def best(vf,vt,s0,s1,kind,axis):
    # choose p in [0,1] so window [p*(1-vf)... ] covers subject; window length vf
    L=vt
    if kind=='face' and axis=='y': c=s0+(s1-s0)/2; tgt=c-.38*L   # face in upper third-ish
    else: tgt=(s0+s1)/2-L/2
    if s1-s0<=L: tgt=min(max(tgt,s1-L),s0)
    tgt=min(max(tgt,0),1-L)
    return tgt/(1-L) if 1-L>1e-6 else .5
groups=collections.defaultdict(list)
for x in d:
    p=R+urllib.parse.unquote(urllib.parse.urlparse(x['abs']).path)
    if p not in V: continue
    groups[(x['page'],x['i'])].append((x,V[p],p))
res=[]
for k,lst in groups.items():
    x,v,p=lst[0]; sub=subject(v)
    if not sub: continue
    kind,sx0,sy0,sx1,sy1=sub
    cur=[];cand=[]
    for x,v,p in lst:
        parts=x['pos'].split(); px,py=pp(parts[0],1),pp(parts[1] if len(parts)>1 else '50%',1)
        (wx0,wx1,wy0,wy1),cx,cy=window(v['w'],v['h'],x['w'],x['h'],px,py)
        cur.append((px,py,cx,cy,cov(wx0,wx1,sx0,sx1),cov(wy0,wy1,sy0,sy1),wx1-wx0,wy1-wy0,x))
    px,py=cur[0][0],cur[0][1]
    # candidate: per axis, average of per-viewport bests, only on cropped axes
    nx=[best(0,c[6],sx0,sx1,kind,'x') for c in cur if c[2]]; ny=[best(0,c[7],sy0,sy1,kind,'y') for c in cur if c[3]]
    npx=sum(nx)/len(nx) if nx else px; npy=sum(ny)/len(ny) if ny else py
    npx,npy=round(npx*20)/20,round(npy*20)/20
    newc=[]
    for c in cur:
        x=c[8]; (wx0,wx1,wy0,wy1),_,_=window(v['w'],v['h'],x['w'],x['h'],npx,npy)
        newc.append((cov(wx0,wx1,sx0,sx1),cov(wy0,wy1,sy0,sy1)))
    oldm=min(min(c[4],c[5]) for c in cur); newm=min(min(a,b) for a,b in newc)
    olda=sum(c[4]*c[5] for c in cur)/len(cur); newa=sum(a*b for a,b in newc)/len(newc)
    moved=abs(npx-px)>=.08 or abs(npy-py)>=.08
    need=(kind=='face' and oldm<.95) or (kind=='att' and oldm<.8)
    if moved and need and newm>=oldm and newa-olda>=.1:
        res.append(dict(page=k[0],i=k[1],src=x['src'],img=p,kind=kind,old=[px,py],new=[npx,npy],oldcov=round(olda,2),newcov=round(newa,2),inl=x['inl'],vps=[c[8]['vp'] for c in cur]))
json.dump(res,open(O+'/moves.json','w'),ensure_ascii=False,indent=1)
sz={}
for x in d: sz.setdefault((x['page'],x['i']),(x['w'],x['h']))
h=['<html><body style="background:#222;color:#ddd;font:12px sans-serif;margin:0">']
for n,r in enumerate(res):
    w,hh=sz[(r['page'],r['i'])]; k=180/max(w,hh); w,hh=w*k,hh*k
    url='/'+os.path.relpath(r['img'],R).replace(os.sep,'/')
    st=lambda q:f'width:{w}px;height:{hh}px;object-fit:cover;object-position:{q[0]*100:.0f}% {q[1]*100:.0f}%;margin:2px'
    h.append(f'<div style="display:inline-block;width:390px;vertical-align:top;margin:3px;border:1px solid #444"><b>#{n}</b> {r["page"]} · {r["src"].split("/")[-1]} → {r["new"][0]*100:.0f}% {r["new"][1]*100:.0f}%<br><img src="{url}" style="{st(r["old"])}"><img src="{url}" style="{st(r["new"])};outline:2px solid #6c6"></div>')
open(O+'/sheet.html','w').write(''.join(h))
print('ตำแหน่งที่ตรวจ',len(groups),'· เสนอให้ขยับ',len(res),'· ดูภาพเทียบที่ gen/crops/out/sheet.html')
