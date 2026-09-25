"""ตรวจ js/planets-data.js หลังแก้ไข: python3 gen/planets/check.py
เช็ค id ซ้ำ, ฟิลด์ที่ต้องมี, สถานะ/segmentum ที่ถูกต้อง, รูปมีอยู่จริง, พิกัดอยู่ในแผนที่, rank เรียงต่อเนื่อง"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, 'js/planets-data.js'), encoding='utf-8').read()
P = json.loads(src.split('window.PLANETS = ', 1)[1].rstrip().rstrip(';'))
ST = {'stable', 'war', 'retaken', 'destroyed', 'chaos', 'xenos', 'unknown'}
SEG = {'Solar', 'Obscurus', 'Ultima', 'Tempestus', 'Pacificus', '', None}
err = []
ids = set()
for i, p in enumerate(P):
    n = p.get('name') or '#%d' % i
    for k in ('id', 'name', 'st'):
        if not p.get(k): err.append('%s: ไม่มีฟิลด์ %s' % (n, k))
    if p.get('id') in ids: err.append('%s: id ซ้ำ %s' % (n, p['id']))
    ids.add(p.get('id'))
    if p.get('st') not in ST: err.append('%s: สถานะไม่รู้จัก %r' % (n, p.get('st')))
    if p.get('seg') not in SEG: err.append('%s: segmentum ไม่รู้จัก %r' % (n, p.get('seg')))
    if p.get('img') and not os.path.exists(os.path.join(ROOT, 'images', p['img'])): err.append('%s: ไม่พบรูป images/%s' % (n, p['img']))
    if p.get('x') is not None and not (0 <= p['x'] <= 1400 and 0 <= p.get('y', -1) <= 1120): err.append('%s: พิกัดนอกแผนที่' % n)
    if p.get('rank') != i + 1: err.append('%s: rank %s ควรเป็น %d' % (n, p.get('rank'), i + 1))
print('ดาวทั้งหมด', len(P), '· มีรูป', sum(1 for p in P if p.get('img')), '· ปักบนแผนที่', sum(1 for p in P if p.get('x') is not None))
if err:
    print('\n'.join(err[:50])); print('พบปัญหา', len(err), 'จุด'); sys.exit(1)
print('ผ่านทุกข้อ')
