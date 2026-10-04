# หน้า "มหาสงครามและเหตุการณ์สำคัญ"

หน้า `pages/events.html` และ `pages/events/*.html` **สร้างจากสคริปต์** อย่าแก้ไฟล์ HTML ตรง ๆ ให้แก้ที่ `gen/events/content/<slug>.html` แล้วรัน

```
python3 gen/events/fetch_images.py   # ดาวน์โหลดรูปที่ยังไม่มี (รายการอยู่ใน images.json)
python3 gen/events/build.py          # สร้างหน้ารวม + หน้าเหตุการณ์ทั้งหมด
python3 gen/events/credits.py        # อัปเดตหน้าเครดิต (รันซ้ำได้)
python3 gen/sw/build_sw.py           # อัปเดตรายการไฟล์ใน sw.js
NODE_PATH=... node gen/genindex.js   # สร้างดัชนีค้นหาใหม่ (ต้องเปิด http.server 8765)
python3 gen/check/links.py           # ตรวจลิงก์/รูป/anchor
NODE_PATH=... node gen/check/browser.js   # ทดสอบทุกหน้าใน Chrome (มือถือ + จอคอม)
```

## เพิ่มเหตุการณ์ใหม่

1. สร้าง `content/<slug>.html` (ดูรูปแบบ META และแท็กย่อ `<fig>`, `<gal>`, `<ev>` ในหัวไฟล์ `build.py`)
2. เพิ่ม slug ใน `ORDER` ของ `build.py` ตามลำดับเวลา
3. รูปใหม่: เพิ่ม `"events/<slug>/<ชื่อ>.webp": "ชื่อไฟล์บนวิกิ"` ใน `images.json` — ตั้งชื่อไฟล์ตามสิ่งที่อยู่ในภาพ ไม่ใช่ตามที่ใช้ และเช็คก่อนว่าเว็บมีรูปเดียวกันอยู่แล้วหรือไม่

ข้อมูลทุกหน้าตรวจกับบทความ Warhammer 40k Wiki ที่ระบุใน `sources` ของแต่ละหน้า (ต.ค. 2026) จุดที่หนังสือแต่ละเล่มขัดกันระบุไว้ในเนื้อหา
