# ตรวจรูปที่โดนกรอบตัด (หัวขาด หน้าหลุดกรอบ)

รูปในการ์ดส่วนใหญ่ใช้ `object-fit: cover` รูปจึงถูกครอบให้พอดีกรอบ ถ้าเป็นรูปแนวตั้งในกรอบแนวนอน ค่าเริ่มต้นจะเก็บแค่ตรงกลางภาพ ทำให้หัวตัวละครหลุดกรอบ

## เวลาเพิ่มรูปใหม่

ถ้ารูปเป็นแนวตั้งและหัวอยู่ด้านบน ให้ใส่ตำแหน่งไปพร้อมกันเลย

```html
<img src="..." alt="..." loading="lazy" style="object-position:center 15%">
```

ค่าแรกคือแนวนอน (`0%` ชิดซ้าย, `center`, `100%` ชิดขวา) ค่าที่สองคือแนวตั้ง (`0%` ชิดบน, `100%` ชิดล่าง)

## ตรวจทั้งเว็บ

ต้องมี Google Chrome, Xcode command line tools (`swift`) และ `npm i puppeteer-core` (เหมือน `gen/genindex.js`)

```
python3 -m http.server 8765          # เปิดค้างไว้ที่รากโปรเจกต์
node gen/crops/crawl.js              # 1) วัดกรอบรูปทุกหน้า (จอคอม + มือถือ) ~5 นาที
swift gen/crops/vis.swift gen/crops/out   # 2) หาใบหน้าและจุดเด่นของภาพ
python3 gen/crops/check.py           # 3) เสนอตำแหน่งใหม่ + ภาพเทียบ
```

แล้วเปิด `http://localhost:8765/gen/crops/out/sheet.html` ดูภาพซ้าย (ตอนนี้) กับขวา (ที่เสนอ ขอบเขียว)
สคริปต์ไม่แก้ไฟล์เอง ให้เลือกเฉพาะรูปที่ดีขึ้นจริงแล้วใส่ `object-position` ตามที่เสนอ

ข้อจำกัด: ตรวจได้เฉพาะรูปที่แสดงตอนเปิดหน้า (รูปในแท็บที่ยังไม่กด หรือในหน้าต่างที่เด้งขึ้นมา จะไม่ถูกตรวจ) และตัวตรวจจุดเด่นของภาพอาจเลือกผิดกับภาพวาดที่มีหลายจุดเด่น

รายการที่ดูแล้วตัดสินใจว่า**ไม่ขยับ** (ต.ค. 2026) — ถ้าสคริปต์เสนอรายการเหล่านี้อีกให้ข้ามได้:
`lucius-pre-heresy.webp` (lore-30k, emperors-children, credits), `ynnead-yncarne.webp` (aeldari, ynnari), `prospero.webp` (thousand-sons), `baal.webp` (blood-angels), `sm-service-studs.webp`, `tournament-hall.webp`, `painting-at-event.webp` (credits)
