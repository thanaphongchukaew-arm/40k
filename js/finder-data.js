/* =========================================================
   ข้อมูลแบบทดสอบ "ทัพไหนเหมาะกับคุณ" 2 แบบ
   - play: สไตล์การเล่นบนโต๊ะ   - lore: นิสัยและความเชื่อในเนื้อเรื่อง
   PROFILE = คะแนน 0–5 ของแต่ละทัพในแต่ละด้าน (ตามลำดับ AXES)
   ตัวเลือกแต่ละข้อ: [ข้อความ, {ด้าน: น้ำหนัก}, ฝ่ายที่ได้โบนัส(ไม่บังคับ)]
   ========================================================= */
(function (root) {
  const FINDER = {
    play: {
      title: 'สไตล์การเล่น',
      desc: 'ดูจากวิธีเล่นบนโต๊ะที่คุณชอบ — เหมาะกับคนที่อยากเลือกทัพไว้เล่นจริง',
      axes: { mel: 'ตะลุมบอน', sht: 'ยิงระยะไกล', spd: 'ความเร็ว', tough: 'ความทนทาน', horde: 'ทัพจำนวนมาก', psy: 'พลังจิต/เวทมนตร์', cmplx: 'กลยุทธ์ซับซ้อน', big: 'หุ่น/ยานยักษ์', fin: 'เล่นเสี่ยง เน้นความแม่นยำ', easy: 'เล่นง่าย ให้อภัยความผิดพลาด' },
      profile: {
        'space-marines':       { mel: 3, sht: 3, spd: 2, tough: 3, horde: 1, psy: 1, cmplx: 2, big: 2, fin: 1, easy: 5 },
        'ultramarines':        { mel: 2, sht: 3, spd: 2, tough: 3, horde: 1, psy: 1, cmplx: 3, big: 2, fin: 1, easy: 5 },
        'blood-angels':        { mel: 5, sht: 2, spd: 4, tough: 3, horde: 1, psy: 1, cmplx: 3, big: 1, fin: 3, easy: 3 },
        'dark-angels':         { mel: 3, sht: 3, spd: 3, tough: 5, horde: 1, psy: 1, cmplx: 3, big: 2, fin: 1, easy: 3 },
        'space-wolves':        { mel: 5, sht: 2, spd: 3, tough: 3, horde: 1, psy: 1, cmplx: 2, big: 2, fin: 2, easy: 4 },
        'black-templars':      { mel: 5, sht: 1, spd: 3, tough: 3, horde: 2, psy: 0, cmplx: 2, big: 1, fin: 2, easy: 4 },
        'deathwatch':          { mel: 2, sht: 4, spd: 2, tough: 3, horde: 0, psy: 1, cmplx: 4, big: 1, fin: 3, easy: 2 },
        'grey-knights':        { mel: 4, sht: 2, spd: 4, tough: 4, horde: 0, psy: 5, cmplx: 4, big: 2, fin: 2, easy: 2 },
        'astra-militarum':     { mel: 0, sht: 5, spd: 1, tough: 2, horde: 4, psy: 1, cmplx: 4, big: 5, fin: 1, easy: 3 },
        'adeptus-custodes':    { mel: 5, sht: 2, spd: 2, tough: 5, horde: 0, psy: 0, cmplx: 2, big: 1, fin: 2, easy: 3 },
        'adepta-sororitas':    { mel: 3, sht: 3, spd: 3, tough: 2, horde: 2, psy: 2, cmplx: 3, big: 2, fin: 3, easy: 3 },
        'adeptus-mechanicus':  { mel: 1, sht: 4, spd: 3, tough: 1, horde: 3, psy: 0, cmplx: 5, big: 2, fin: 4, easy: 1 },
        'imperial-knights':    { mel: 4, sht: 4, spd: 2, tough: 5, horde: 0, psy: 0, cmplx: 2, big: 5, fin: 0, easy: 4 },
        'imperial-agents':     { mel: 2, sht: 3, spd: 2, tough: 1, horde: 2, psy: 2, cmplx: 4, big: 1, fin: 4, easy: 1 },
        'chaos-space-marines': { mel: 4, sht: 3, spd: 2, tough: 3, horde: 2, psy: 2, cmplx: 3, big: 3, fin: 2, easy: 3 },
        'death-guard':         { mel: 3, sht: 3, spd: 0, tough: 5, horde: 1, psy: 2, cmplx: 2, big: 3, fin: 0, easy: 4 },
        'thousand-sons':       { mel: 1, sht: 3, spd: 1, tough: 4, horde: 1, psy: 5, cmplx: 4, big: 2, fin: 3, easy: 2 },
        'world-eaters':        { mel: 5, sht: 0, spd: 4, tough: 3, horde: 2, psy: 0, cmplx: 1, big: 1, fin: 3, easy: 5 },
        'emperors-children':   { mel: 4, sht: 2, spd: 5, tough: 2, horde: 1, psy: 1, cmplx: 4, big: 1, fin: 4, easy: 2 },
        'chaos-daemons':       { mel: 5, sht: 1, spd: 4, tough: 2, horde: 3, psy: 4, cmplx: 4, big: 3, fin: 3, easy: 2 },
        'chaos-knights':       { mel: 4, sht: 4, spd: 2, tough: 5, horde: 1, psy: 0, cmplx: 2, big: 5, fin: 1, easy: 3 },
        'aeldari':             { mel: 2, sht: 4, spd: 5, tough: 1, horde: 1, psy: 5, cmplx: 5, big: 2, fin: 5, easy: 1 },
        'drukhari':            { mel: 4, sht: 3, spd: 5, tough: 0, horde: 2, psy: 0, cmplx: 5, big: 1, fin: 5, easy: 0 },
        'orks':                { mel: 5, sht: 1, spd: 3, tough: 2, horde: 5, psy: 2, cmplx: 2, big: 3, fin: 1, easy: 4 },
        'necrons':             { mel: 2, sht: 3, spd: 1, tough: 5, horde: 2, psy: 0, cmplx: 2, big: 3, fin: 0, easy: 5 },
        'tau-empire':          { mel: 0, sht: 5, spd: 3, tough: 2, horde: 2, psy: 0, cmplx: 4, big: 4, fin: 3, easy: 2 },
        'tyranids':            { mel: 4, sht: 2, spd: 3, tough: 2, horde: 5, psy: 2, cmplx: 3, big: 5, fin: 1, easy: 3 },
        'genestealer-cults':   { mel: 3, sht: 2, spd: 4, tough: 0, horde: 4, psy: 2, cmplx: 5, big: 1, fin: 5, easy: 0 },
        'leagues-of-votann':   { mel: 1, sht: 5, spd: 1, tough: 5, horde: 0, psy: 1, cmplx: 3, big: 3, fin: 0, easy: 4 }
      },
      q: [
        ['คุณอยากชนะเกมด้วยวิธีไหนมากที่สุด?', [['บุกเข้าไปบดขยี้ศัตรูแบบประชิดตัว', { mel: 2 }], ['ยิงถล่มจากระยะไกลก่อนศัตรูจะเข้าถึง', { sht: 2 }], ['วิ่งยึดจุดภารกิจเร็ว ๆ เก็บแต้มจนชนะ', { spd: 2, fin: 1 }], ['ยืนหยัดไม่ยอมตาย จนศัตรูหมดแรง', { tough: 2 }]]],
        ['กองทัพในฝันของคุณมีกี่โมเดล?', [['ไม่กี่ตัว แต่ละตัวเก่งและทาสีได้ละเอียด', { tough: 2, horde: -2 }], ['ปานกลาง ไม่มากไม่น้อย', { easy: 1 }], ['เป็นร้อยตัว เต็มโต๊ะ', { horde: 2, tough: -1 }], ['หุ่นยักษ์ไม่กี่ตัวที่สูงเท่าตึก', { big: 2, horde: -2 }]]],
        ['คุณชอบกติกาแบบไหน?', [['เรียบง่าย เข้าใจเร็ว เล่นได้ทันที', { easy: 2, cmplx: -2 }], ['มีลูกเล่นพอประมาณ', { easy: 1, cmplx: 1 }], ['คอมโบลึก ๆ ต้องวางแผนหลายเทิร์น', { cmplx: 2, easy: -1 }]]],
        ['ถ้าเสียกองทัพไปครึ่งหนึ่งในเทิร์นแรก คุณจะรู้สึกอย่างไร?', [['เครียดมาก อยากให้ทัพทนกว่านี้', { tough: 2, easy: 1 }], ['ไม่เป็นไร ยังมีอีกเยอะ', { horde: 2 }], ['เสี่ยงคือเสน่ห์ของเกม เดี๋ยวตีกลับ', { fin: 2 }]]],
        ['พลังจิตและเวทมนตร์ในเกม', [['ชอบมาก อยากให้เป็นหัวใจของทัพ', { psy: 2 }], ['มีบ้างก็ดี', { psy: 1 }], ['ไม่สนใจ ขอปืนกับดาบพอ', { psy: -2 }]]],
        ['ความเร็วของทัพสำคัญแค่ไหน?', [['สำคัญมาก อยากโผล่ได้ทุกที่บนโต๊ะ', { spd: 2 }], ['ช้าไม่เป็นไร ขอให้ถึงแล้วไม่ตาย', { spd: -1, tough: 2 }], ['แค่เดินหน้าตรง ๆ ไปหาศัตรูก็พอ', { mel: 1, easy: 1 }]]],
        ['คุณอยากให้ทัพมียานพาหนะหรือสัตว์ยักษ์แค่ไหน?', [['รถถังเยอะ ๆ ยิงกระหน่ำ', { big: 2, sht: 1 }], ['สัตว์ประหลาดหรือหุ่นยักษ์บุกประชิด', { big: 2, mel: 1 }], ['ทหารราบล้วน ๆ', { big: -2, horde: 1 }], ['มีบ้างนิดหน่อย', { easy: 1 }]]],
        ['เวลาทอยลูกเต๋า คุณชอบแบบไหน?', [['ทอยทีละกำมือ ลุ้นทีเดียวเยอะ ๆ', { horde: 2, easy: 1 }], ['ทอยน้อยแต่ทุกลูกมีความหมาย', { tough: 1, fin: 1, horde: -1 }], ['ชอบทอยซ้ำและแก้ผลทอยด้วยสกิลต่าง ๆ', { cmplx: 2 }]]],
        ['การวางกำลังที่คุณชอบ', [['ซุ่มไว้นอกโต๊ะ แล้วโผล่ลงหลังแนวศัตรู', { spd: 1, fin: 2 }], ['ตั้งแนวรับแน่นหนา ให้ศัตรูเดินเข้ามาเอง', { sht: 2, tough: 1 }], ['วางทุกอย่างไว้หน้าสุดแล้วเดินหน้าเต็มกำลัง', { mel: 1, horde: 1 }]]],
        ['ตัวละครฮีโร่ในทัพ คุณอยากได้แบบไหน?', [['ยอดนักรบที่แบกทั้งเกมได้คนเดียว', { mel: 2, tough: 1 }], ['แม่ทัพที่เสริมพลังให้หน่วยรอบตัว', { cmplx: 1, sht: 1 }], ['ไม่ต้องมีฮีโร่เด่น เน้นทีมเวิร์ก', { horde: 1, easy: 1 }], ['ผู้ใช้พลังจิตที่เปลี่ยนเกมได้', { psy: 2 }]]],
        ['คุณมีประสบการณ์เกมกระดานแค่ไหน?', [['แทบไม่มี เพิ่งเริ่ม', { easy: 2, cmplx: -1 }], ['เคยเล่นเกมวางแผนมาบ้าง', { cmplx: 1 }], ['เล่นเยอะ ชอบความท้าทาย', { cmplx: 2, easy: -2 }]]],
        ['ระยะการต่อสู้ที่ชอบที่สุด', [['ไกลสุดตา', { sht: 2, mel: -1 }], ['กลาง ๆ ยิงแล้วค่อยชาร์จ', { sht: 1, mel: 1 }], ['ประชิดตัว หน้าชนหน้า', { mel: 2, sht: -1 }]]],
        ['สไตล์โดยรวมของคุณ', [['บุกก่อนได้เปรียบ', { mel: 1, spd: 1 }], ['สมดุล ปรับตามสถานการณ์', { easy: 1, cmplx: 1 }], ['ตั้งรับแล้วสวนกลับ', { tough: 1, sht: 1 }]]],
        ['ถ้าเลือกได้ คุณอยากลอบสังหารตัวละครของศัตรูไหม?', [['ชอบมาก เล็งจุดอ่อนแล้วสอยหัวหน้า', { fin: 2, sht: 1 }], ['เฉย ๆ ขอตีทั้งกองดีกว่า', { horde: 1, mel: 1 }], ['ไม่ชอบ อยากให้ทัพตัวเองทนมากกว่า', { tough: 1 }]]],
        ['ทัพที่ "ผิดนิดเดียวก็แพ้" คุณรับได้ไหม?', [['รับได้ ยิ่งยากยิ่งสนุก', { fin: 2, easy: -2 }], ['พอรับได้', { fin: 1 }], ['ไม่ อยากให้ทัพอภัยความผิดพลาด', { easy: 2, tough: 1, fin: -1 }]]],
        ['การเริ่มสะสมโมเดล', [['อยากเริ่มกล่องเดียวแล้วเล่นได้เลย', { easy: 1, tough: 1, horde: -1 }], ['ซื้อเยอะหน่อยไม่เป็นไร', { horde: 2 }], ['อยากได้ชิ้นใหญ่เป็นจุดเด่นกลางโต๊ะ', { big: 2 }]]],
        ['การฟื้นคืนชีพหรือซ่อมแซมหน่วยระหว่างเกม', [['ชอบมาก ศัตรูฆ่าเท่าไรก็ลุกขึ้นมาใหม่', { tough: 2, easy: 1 }], ['ชอบส่งกำลังเสริมใหม่เข้ามาแทน', { horde: 2 }], ['ไม่จำเป็น ตายก็คือตาย', { fin: 1 }]]],
        ['คุณชอบพนันหมดหน้าตักแบบ "ชาร์จเทิร์นสองหรือแพ้" ไหม?', [['ชอบ ลุ้นดี', { mel: 2, spd: 1, fin: 1 }], ['บางครั้ง', { mel: 1 }], ['ไม่ชอบ ค่อย ๆ บีบดีกว่า', { sht: 1, tough: 1 }]]],
        ['Stratagem และสกิลพิเศษระหว่างเกม', [['อยากมีให้เลือกเยอะ ๆ', { cmplx: 2 }], ['ใช้แค่ไม่กี่อันที่ดีที่สุด', { easy: 2 }], ['แค่ให้ยูนิตเก่งในตัวเองก็พอ', { tough: 1, easy: 1 }]]],
        ['อาวุธที่ชอบ', [['ปืนใหญ่ยิงนัดเดียวพังรถถัง', { sht: 1, big: 1, fin: 1 }], ['ปืนกลห่ากระสุน', { sht: 2, horde: 1 }], ['ดาบ ขวาน หรือกรงเล็บ', { mel: 2 }], ['พลังจิตหรืออาวุธแปลก ๆ', { psy: 2 }]]],
        ['คุณอยากให้เกมหนึ่งเล่นนานแค่ไหน?', [['เร็ว ๆ มีโมเดลไม่กี่ตัวให้ขยับ', { horde: -2, tough: 1 }], ['นานได้ ไม่รีบ', { horde: 1, cmplx: 1 }], ['ไม่สนใจเรื่องเวลา', {}]]],
        ['การยึดจุดภารกิจ คุณจะทำอย่างไร?', [['ส่งทหารจำนวนมากไปยืนทับ', { horde: 2 }], ['ส่งหน่วยเล็กที่เร็ววิ่งไปแย่งจุด', { spd: 2, fin: 1 }], ['ส่งตัวแข็งไปยืนแล้วไม่มีใครดันออก', { tough: 2 }]]],
        ['หน่วยเล็กที่เก่งมากแต่บอบบาง คุณชอบไหม?', [['ชอบ เหมือนนักดาบฝีมือดี', { fin: 2, tough: -1 }], ['เฉย ๆ', {}], ['ไม่ชอบ ขอหนาไว้ก่อน', { tough: 2, fin: -1 }]]],
        ['ความสุ่ม เช่น พลังที่อาจย้อนกลับมาทำร้ายตัวเอง', [['สนุกดี', { psy: 1, fin: 1 }], ['นิดหน่อยพอ', {}], ['ไม่ชอบ อยากให้ทุกอย่างคาดเดาได้', { easy: 1, psy: -1 }]]],
        ['ถ้าต้องสู้กับรถถังของศัตรู คุณจะ...', [['ยิงด้วยอาวุธต่อต้านรถถังจากไกล ๆ', { sht: 2 }], ['วิ่งเข้าไปฟันด้วยค้อนพลังงาน', { mel: 2 }], ['ส่งหุ่นหรือสัตว์ยักษ์ของเราไปปะทะ', { big: 2 }], ['ใช้พลังจิตพิเศษจัดการ', { psy: 2 }]]],
        ['คุณชอบการเคลื่อนที่แบบไหน?', [['บินหรือกระโดดข้ามฉาก', { spd: 2 }], ['เทเลพอร์ตหรือโผล่จากใต้ดิน', { spd: 1, fin: 1, psy: 1 }], ['เดินทีละก้าวแต่มั่นคง', { tough: 1, spd: -1 }]]],
        ['หน่วยทหารราบในทัพ คุณอยากให้เป็นแบบไหน?', [['ยอดนักรบเกราะหนา', { tough: 2, horde: -1 }], ['ทหารธรรมดาจำนวนมหาศาล', { horde: 2, tough: -1 }], ['นักรบคล่องแคล่วฝีมือดี', { spd: 1, fin: 1 }]]],
        ['การยิงสนับสนุนจากปืนใหญ่หลังแนว', [['ชอบมาก ขอปืนใหญ่เยอะ ๆ', { sht: 2, big: 1 }], ['มีบ้างก็ดี', { sht: 1 }], ['ไม่ชอบ ทุกคนต้องบุก', { mel: 2, sht: -1 }]]],
        ['คุณอยากเล่นทัพที่คนเล่นเยอะ หาคู่ซ้อมและคำแนะนำง่ายไหม?', [['อยาก สำคัญมาก', { easy: 2 }], ['ไม่สำคัญ', {}], ['อยากเล่นทัพที่แปลกไม่ซ้ำใคร', { cmplx: 1, fin: 1 }]]],
        ['หน่วยที่เป็น "ตัวถ่วง" ให้ศัตรูเสียเวลา', [['ชอบใช้ ยอมสละหน่วยราคาถูก', { horde: 2 }], ['ชอบให้ตัวแข็งไปยืนขวางแทน', { tough: 2 }], ['ไม่ใช้ เน้นหลบแล้วแทงสวน', { spd: 1, fin: 1 }]]],
        ['หน้าตาของโมเดลที่ดึงดูดคุณที่สุด', [['นักรบเกราะหนาของมนุษยชาติ', { tough: 1, easy: 1 }, 'imperium'], ['ปีศาจ หนามแหลม และเกราะที่ถูกบิดเบือน', { mel: 1 }, 'chaos'], ['เอเลี่ยน สัตว์ประหลาด หรือหุ่นยนต์โบราณ', { big: 1 }, 'xenos'], ['อะไรก็ได้ ขอให้เล่นสนุก', {}]]],
        ['สุดท้าย ถ้าต้องเลือกหนึ่งอย่าง', [['ความแรง', { mel: 1, sht: 1 }], ['ความทน', { tough: 2 }], ['ความเร็ว', { spd: 2 }], ['ความฉลาดแกมโกง', { cmplx: 1, fin: 1, psy: 1 }]]]
      ]
    },
    lore: {
      title: 'นิสัยและเนื้อเรื่อง',
      desc: 'ดูจากความเชื่อ คุณค่า และนิสัยของคุณ — เหมาะกับคนที่อยากเลือกทัพที่ "เป็นตัวเรา"',
      axes: { faith: 'ศรัทธา', order: 'ระเบียบวินัย', honor: 'เกียรติ', freedom: 'อิสรภาพ', know: 'ความรู้และความลับ', tech: 'เทคโนโลยี', ancient: 'ความเก่าแก่', hunger: 'ความหิวและสัญชาตญาณ', cruel: 'ความโหดเหี้ยม', fun: 'ความบ้าบิ่นสนุกสนาน', kin: 'พวกพ้อง', pride: 'ความหยิ่งทะนง' },
      profile: {
        'space-marines':       { faith: 2, order: 5, honor: 4, freedom: 1, know: 2, tech: 3, ancient: 2, hunger: 0, cruel: 1, fun: 1, kin: 5, pride: 3 },
        'ultramarines':        { faith: 1, order: 5, honor: 5, freedom: 0, know: 4, tech: 3, ancient: 2, hunger: 0, cruel: 0, fun: 0, kin: 4, pride: 3 },
        'blood-angels':        { faith: 3, order: 3, honor: 4, freedom: 1, know: 1, tech: 2, ancient: 3, hunger: 4, cruel: 1, fun: 1, kin: 4, pride: 4 },
        'dark-angels':         { faith: 2, order: 4, honor: 3, freedom: 1, know: 5, tech: 3, ancient: 4, hunger: 0, cruel: 2, fun: 0, kin: 4, pride: 4 },
        'space-wolves':        { faith: 1, order: 1, honor: 4, freedom: 4, know: 1, tech: 1, ancient: 3, hunger: 3, cruel: 1, fun: 4, kin: 5, pride: 3 },
        'black-templars':      { faith: 5, order: 3, honor: 5, freedom: 1, know: 0, tech: 1, ancient: 2, hunger: 2, cruel: 2, fun: 0, kin: 4, pride: 3 },
        'deathwatch':          { faith: 2, order: 5, honor: 4, freedom: 1, know: 4, tech: 4, ancient: 1, hunger: 0, cruel: 1, fun: 0, kin: 3, pride: 1 },
        'grey-knights':        { faith: 4, order: 5, honor: 5, freedom: 0, know: 5, tech: 2, ancient: 2, hunger: 0, cruel: 1, fun: 0, kin: 3, pride: 2 },
        'astra-militarum':     { faith: 4, order: 5, honor: 3, freedom: 0, know: 0, tech: 2, ancient: 0, hunger: 2, cruel: 2, fun: 2, kin: 4, pride: 1 },
        'adeptus-custodes':    { faith: 3, order: 5, honor: 5, freedom: 1, know: 3, tech: 4, ancient: 4, hunger: 0, cruel: 0, fun: 0, kin: 3, pride: 5 },
        'adepta-sororitas':    { faith: 5, order: 4, honor: 4, freedom: 0, know: 1, tech: 2, ancient: 2, hunger: 1, cruel: 3, fun: 0, kin: 4, pride: 2 },
        'adeptus-mechanicus':  { faith: 5, order: 4, honor: 1, freedom: 0, know: 5, tech: 5, ancient: 3, hunger: 2, cruel: 2, fun: 0, kin: 1, pride: 1 },
        'imperial-knights':    { faith: 3, order: 3, honor: 5, freedom: 2, know: 1, tech: 4, ancient: 4, hunger: 0, cruel: 1, fun: 1, kin: 4, pride: 5 },
        'imperial-agents':     { faith: 4, order: 4, honor: 1, freedom: 2, know: 5, tech: 2, ancient: 1, hunger: 1, cruel: 4, fun: 1, kin: 0, pride: 2 },
        'chaos-space-marines': { faith: 2, order: 1, honor: 1, freedom: 5, know: 2, tech: 2, ancient: 3, hunger: 3, cruel: 4, fun: 2, kin: 2, pride: 5 },
        'death-guard':         { faith: 3, order: 3, honor: 1, freedom: 2, know: 2, tech: 1, ancient: 3, hunger: 2, cruel: 3, fun: 4, kin: 5, pride: 1 },
        'thousand-sons':       { faith: 1, order: 2, honor: 2, freedom: 3, know: 5, tech: 1, ancient: 4, hunger: 2, cruel: 2, fun: 0, kin: 2, pride: 5 },
        'world-eaters':        { faith: 2, order: 0, honor: 0, freedom: 4, know: 0, tech: 1, ancient: 1, hunger: 5, cruel: 5, fun: 1, kin: 1, pride: 2 },
        'emperors-children':   { faith: 2, order: 0, honor: 0, freedom: 5, know: 2, tech: 1, ancient: 3, hunger: 5, cruel: 4, fun: 4, kin: 0, pride: 5 },
        'chaos-daemons':       { faith: 4, order: 0, honor: 0, freedom: 5, know: 3, tech: 0, ancient: 5, hunger: 5, cruel: 4, fun: 4, kin: 0, pride: 3 },
        'chaos-knights':       { faith: 1, order: 2, honor: 1, freedom: 4, know: 1, tech: 4, ancient: 3, hunger: 2, cruel: 5, fun: 1, kin: 1, pride: 5 },
        'aeldari':             { faith: 2, order: 3, honor: 2, freedom: 3, know: 5, tech: 4, ancient: 5, hunger: 0, cruel: 1, fun: 1, kin: 3, pride: 5 },
        'drukhari':            { faith: 0, order: 1, honor: 0, freedom: 5, know: 2, tech: 4, ancient: 5, hunger: 5, cruel: 5, fun: 4, kin: 0, pride: 5 },
        'orks':                { faith: 3, order: 0, honor: 1, freedom: 5, know: 0, tech: 3, ancient: 2, hunger: 4, cruel: 2, fun: 5, kin: 3, pride: 3 },
        'necrons':             { faith: 0, order: 5, honor: 4, freedom: 1, know: 4, tech: 5, ancient: 5, hunger: 1, cruel: 2, fun: 2, kin: 1, pride: 5 },
        'tau-empire':          { faith: 1, order: 5, honor: 4, freedom: 1, know: 4, tech: 5, ancient: 0, hunger: 1, cruel: 0, fun: 1, kin: 5, pride: 2 },
        'tyranids':            { faith: 0, order: 3, honor: 0, freedom: 0, know: 0, tech: 0, ancient: 3, hunger: 5, cruel: 3, fun: 0, kin: 4, pride: 0 },
        'genestealer-cults':   { faith: 5, order: 3, honor: 1, freedom: 4, know: 2, tech: 3, ancient: 1, hunger: 3, cruel: 3, fun: 1, kin: 5, pride: 1 },
        'leagues-of-votann':   { faith: 1, order: 4, honor: 5, freedom: 3, know: 3, tech: 5, ancient: 4, hunger: 2, cruel: 1, fun: 2, kin: 5, pride: 3 }
      },
      q: [
        ['คุณเชื่อในอะไรมากที่สุด?', [['พระเจ้าหรือสิ่งศักดิ์สิทธิ์ที่คุ้มครองเรา', { faith: 2 }], ['เหตุผลและวิทยาศาสตร์', { know: 1, tech: 2, faith: -1 }], ['ตัวเองเท่านั้น', { freedom: 2, pride: 1 }], ['พวกพ้องที่ยืนเคียงข้าง', { kin: 2 }]]],
        ['คุณค่าที่สำคัญที่สุดในชีวิต', [['หน้าที่', { order: 2 }], ['เกียรติ', { honor: 2 }], ['อิสรภาพ', { freedom: 2 }], ['ความรู้', { know: 2 }]]],
        ['ถ้ากฎหมายของบ้านเมืองไม่ยุติธรรม คุณจะ...', [['ทำตามอยู่ดี เพราะระเบียบสำคัญกว่า', { order: 2, freedom: -1 }], ['หาทางแก้จากข้างใน', { know: 1, honor: 1 }], ['ลุกขึ้นต่อต้าน', { freedom: 2, order: -1 }], ['ใช้ช่องโหว่หาประโยชน์ให้ตัวเอง', { pride: 1, cruel: 1 }]]],
        ['ถ้าศัตรูยอมแพ้ คุณจะทำอย่างไร?', [['ไว้ชีวิต เพราะเป็นเรื่องของเกียรติ', { honor: 2, cruel: -1 }], ['จับไปสอบสวนหาความลับ', { know: 2, cruel: 1 }], ['ไม่มีความเมตตาให้ศัตรู', { cruel: 2, faith: 1 }], ['ชวนมาเข้าพวก', { kin: 1, freedom: 1 }]]],
        ['คุณรู้สึกอย่างไรกับอดีตอันยาวนาน?', [['หลงใหลอารยธรรมโบราณ', { ancient: 2 }], ['อดีตคือบทเรียน', { know: 1, order: 1 }], ['ไม่สนใจ อนาคตสำคัญกว่า', { tech: 1, ancient: -2 }]]],
        ['เทคโนโลยีสำหรับคุณคือ...', [['สิ่งศักดิ์สิทธิ์ที่ต้องเคารพ', { tech: 2, faith: 2 }], ['เครื่องมือพัฒนาสังคม', { tech: 2, order: 1 }], ['ของที่ปล้นมาได้แล้วดัดแปลงเล่น', { fun: 2, tech: 1 }], ['ไม่จำเป็น ร่างกายคืออาวุธ', { hunger: 2, tech: -2 }]]],
        ['เวลาหิวหรืออยากได้อะไรมาก ๆ', [['อดทนไว้ ใจต้องชนะกาย', { order: 1, honor: 1, hunger: -1 }], ['ต้องได้ ไม่ว่าจะแลกกับอะไร', { hunger: 2 }], ['แบ่งกับเพื่อนก่อน', { kin: 2 }]]],
        ['วิธีจัดการกับคนที่ทรยศคุณ', [['ลงโทษตามกฎ', { order: 2 }], ['แก้แค้นให้สาสม', { cruel: 2, pride: 1 }], ['ตามล่าทั้งชีวิตจนกว่าจะได้ความจริง', { know: 1, honor: 1, pride: 1 }], ['ปล่อยไป คนแบบนั้นไม่คุ้มเสียเวลา', { freedom: 1 }]]],
        ['อารมณ์ขันในสนามรบ', [['สงครามคือความสนุก!', { fun: 2 }], ['หัวเราะได้บ้างเพื่อคลายเครียด', { fun: 1, kin: 1 }], ['สงครามเป็นเรื่องจริงจัง', { order: 1, fun: -1 }]]],
        ['คุณชอบความสมบูรณ์แบบไหม?', [['ต้องสมบูรณ์แบบเท่านั้น', { pride: 2 }], ['ขอแค่ดีพอ', { kin: 1, fun: 1 }], ['ความสมบูรณ์แบบคือเสน่ห์ของสิ่งเก่าแก่', { ancient: 1, pride: 1 }]]],
        ['คุณพบดาวดวงหนึ่งที่ถูกศัตรูยึดครอง จะทำอย่างไร?', [['ทำลายทั้งดาว เพื่อไม่ให้ภัยลุกลาม', { order: 1, cruel: 1, faith: 1 }], ['ส่งทูตเจรจาให้เข้าร่วมกับเรา', { know: 1, order: 1, kin: 1 }], ['กลืนกินทุกสิ่งบนดาวนั้น', { hunger: 2 }], ['บุกเข้าไปปล้นให้สนุก', { fun: 2, freedom: 1 }]]],
        ['ผู้นำที่ดีควรเป็นแบบไหน?', [['นักบุญที่ทุกคนศรัทธา', { faith: 2 }], ['นักยุทธศาสตร์ที่ฉลาดที่สุด', { know: 1, order: 1 }], ['ตัวที่ใหญ่และแข็งแรงที่สุด', { hunger: 1, fun: 1, freedom: 1 }], ['กษัตริย์ผู้สืบทอดราชวงศ์', { ancient: 2, pride: 1 }]]],
        ['ความลับในอดีตที่อาจทำลายชื่อเสียงของคุณ', [['ต้องเก็บไว้ ไม่ว่าจะต้องทำอะไร', { know: 2, pride: 1, cruel: 1 }], ['ยอมรับความจริงแล้วแก้ไข', { honor: 2 }], ['ไม่มีความลับ ชีวิตเปิดเผย', { freedom: 1, kin: 1 }]]],
        ['ความตายสำหรับคุณคือ...', [['เกียรติสูงสุดถ้าตายเพื่อหน้าที่', { order: 1, honor: 1, faith: 1 }], ['ไม่ใช่จุดจบ เพราะร่างใหม่หรือจิตวิญญาณยังอยู่', { ancient: 1, tech: 1 }], ['สิ่งที่ต้องหนีให้พ้นด้วยทุกวิธี', { pride: 1, cruel: 1, hunger: 1 }], ['ส่วนหนึ่งของวัฏจักร', { hunger: 1, kin: 1 }]]],
        ['คุณชอบใช้ชีวิตแบบไหน?', [['มีตารางชัดเจน ทุกอย่างเป็นระบบ', { order: 2 }], ['ผจญภัยไม่ซ้ำวัน', { freedom: 1, fun: 1 }], ['ศึกษาค้นคว้าเงียบ ๆ', { know: 2 }], ['อยู่กับครอบครัวหรือเพื่อนสนิท', { kin: 2 }]]],
        ['การเสียสละตัวเองเพื่อส่วนรวม', [['ยินดีเสมอ', { order: 1, kin: 1, faith: 1 }], ['ถ้าคุ้มค่า', { know: 1 }], ['ส่วนรวมต้องรับใช้ฉันต่างหาก', { pride: 2, freedom: 1 }]]],
        ['ถ้าได้พลังวิเศษหนึ่งอย่าง จะเลือก...', [['รู้ความลับทุกอย่างในจักรวาล', { know: 2 }], ['เป็นอมตะ', { ancient: 1, tech: 1, pride: 1 }], ['แข็งแกร่งที่สุด', { hunger: 1, cruel: 1 }], ['ปกป้องคนที่รัก', { kin: 2, honor: 1 }]]],
        ['สิ่งแปลกปลอมหรือคนต่างถิ่น', [['อันตราย ต้องกำจัด', { faith: 1, cruel: 1, order: 1 }], ['น่าสนใจ อยากศึกษา', { know: 2 }], ['อาจเป็นพันธมิตรได้', { kin: 1, order: 1 }], ['เหยื่อ', { hunger: 2, cruel: 1 }]]],
        ['คุณคิดว่าตัวเองมีความอดทนแค่ไหน?', [['อดทนได้เป็นพันปี', { ancient: 2, order: 1 }], ['พอสมควร', {}], ['ใจร้อน อยากลงมือทันที', { hunger: 1, fun: 1, freedom: 1 }]]],
        ['ความสวยงาม ศิลปะ และความหรูหรา', [['สำคัญมาก ชีวิตต้องงดงาม', { pride: 2, ancient: 1 }], ['งามแบบเรียบง่ายและใช้งานได้', { tech: 1, order: 1 }], ['ไม่สำคัญ', { hunger: 1, fun: 1, pride: -1 }], ['ความสุขและความตื่นเต้นสุดขั้วคือศิลปะ', { hunger: 1, freedom: 1, fun: 1 }]]],
        ['ถ้าบ้านเกิดของคุณถูกทำลาย', [['ล้างแค้นทุกคนที่เกี่ยวข้อง', { cruel: 1, pride: 1, honor: 1 }], ['สร้างใหม่ร่วมกับพวกพ้อง', { kin: 2, tech: 1 }], ['ไปหาที่ใหม่ที่ดีกว่า', { freedom: 2 }], ['ยึดของคนอื่นมาแทน', { hunger: 2 }]]],
        ['การเชื่อฟังคำสั่ง', [['เชื่อฟังโดยไม่ถาม', { order: 2, faith: 1 }], ['เชื่อฟังถ้าผู้สั่งมีเกียรติ', { honor: 2 }], ['ทำตามถ้าเห็นด้วย', { freedom: 1, know: 1 }], ['ไม่มีใครสั่งฉันได้', { freedom: 2, pride: 1 }]]],
        ['สังคมในอุดมคติของคุณ', [['ทุกคนมีหน้าที่ของตัวเองเพื่อส่วนรวม', { order: 2, kin: 1 }], ['ผู้แข็งแรงอยู่รอด ผู้อ่อนแอตกไป', { hunger: 1, cruel: 1, freedom: 1 }], ['กลุ่มครอบครัวใหญ่ที่ช่วยเหลือกัน', { kin: 2 }], ['ทุกคนทำตามใจอยากได้อิสระเต็มที่', { freedom: 2, order: -1 }]]],
        ['คนรอบตัวมองคุณว่าเป็นคนแบบไหน?', [['จริงจัง ซื่อตรง', { honor: 2, order: 1 }], ['ตลก ร่าเริง', { fun: 2 }], ['ลึกลับ เข้าใจยาก', { know: 1, pride: 1 }], ['ใจดี เอาใจใส่เพื่อน', { kin: 2 }]]],
        ['คุณทำอะไรเมื่อเจอปัญหาที่แก้ไม่ได้?', [['สวดภาวนาและเชื่อว่าจะผ่านไปได้', { faith: 2 }], ['หาข้อมูลเพิ่มจนกว่าจะเจอทางออก', { know: 2 }], ['ใช้กำลังดันไปจนสำเร็จ', { hunger: 1, fun: 1 }], ['ขอความช่วยเหลือจากพวกพ้อง', { kin: 2 }]]],
        ['ความกลัวสำหรับคุณคือ...', [['ต้องไม่มี เพราะศรัทธาคือเกราะ', { faith: 2, honor: 1 }], ['อาวุธที่ใช้กับศัตรู', { cruel: 2 }], ['ไม่รู้จักความกลัว เพราะมันสนุกเกินกว่าจะกลัว', { fun: 2 }], ['เป็นเรื่องธรรมชาติ ยอมรับได้', { kin: 1 }]]],
        ['การทำงานกับผู้อื่น', [['ชอบทำงานเป็นทีมใหญ่ ทุกคนเป็นหนึ่งเดียว', { kin: 2, order: 1 }], ['ทำงานคนเดียวดีที่สุด', { freedom: 1, pride: 1, kin: -1 }], ['นำทีมเล็ก ๆ ที่ไว้ใจได้', { honor: 1, kin: 1 }]]],
        ['คุณรู้สึกอย่างไรกับคำว่า "ประเพณี"?', [['ต้องรักษาไว้ทุกอย่าง', { ancient: 2, order: 1 }], ['ปรับให้เข้ากับยุคสมัย', { tech: 1, know: 1 }], ['ประเพณีคือโซ่ตรวน', { freedom: 2, ancient: -1 }]]],
        ['ถ้าได้รับอำนาจล้นมือ คุณจะ...', [['ใช้ปกป้องผู้อ่อนแอ', { honor: 2, kin: 1 }], ['ใช้สร้างระเบียบใหม่ให้จักรวาล', { order: 2, pride: 1 }], ['ใช้ทำทุกอย่างที่อยากทำ', { freedom: 2, hunger: 1 }], ['ใช้ค้นหาความจริงของจักรวาล', { know: 2 }]]],
        ['สิ่งที่คุณรับไม่ได้ที่สุด', [['คนนอกรีตหรือคนไร้ศรัทธา', { faith: 2 }], ['ความขี้ขลาด', { honor: 2 }], ['การถูกควบคุม', { freedom: 2 }], ['ความน่าเบื่อ', { fun: 2 }]]],
        ['ฝ่ายไหนดึงดูดคุณในเนื้อเรื่อง?', [['จักรวรรดิมนุษย์ ผู้ยืนหยัดท่ามกลางความมืด', { order: 1, faith: 1 }, 'imperium'], ['เคออส ผู้ปลดโซ่แห่งความเชื่อฟัง', { freedom: 1 }, 'chaos'], ['เผ่าพันธุ์ต่างดาวที่มีวัฒนธรรมของตัวเอง', { ancient: 1 }, 'xenos'], ['ยังไม่แน่ใจ', {}]]],
        ['คำไหนตรงกับคุณที่สุด?', [['ผู้พิทักษ์', { honor: 1, order: 1, kin: 1 }], ['ผู้แสวงหา', { know: 2 }], ['ผู้ปลดปล่อย', { freedom: 2 }], ['ผู้ล่า', { hunger: 2, cruel: 1 }]]]
      ]
    }
  };

  /* ---------- คำนวณผล ----------
     ใช้ cosine similarity ระหว่างคะแนนผู้ตอบ (u) กับโปรไฟล์ทัพ โดยลบค่าเฉลี่ยออกทั้งสองฝั่ง
     เพื่อให้ด้านที่ "ทุกทัพมีเหมือนกัน" ไม่มีผลต่ออันดับ
     answers = index ของตัวเลือกในแต่ละข้อ (null = ข้าม)  sides = { factionId: 'imperium'|'chaos'|'xenos' } */
  function finderScore(kind, answers, sides) {
    const D = FINDER[kind], axes = Object.keys(D.axes), ids = Object.keys(D.profile);
    const u = {}; axes.forEach(a => { u[a] = 0; });
    let side = null, n = 0;
    answers.forEach((ai, qi) => {
      if (ai == null || !D.q[qi]) return;
      const opt = D.q[qi][1][ai]; if (!opt) return;
      n++;
      /* ลบค่าเฉลี่ยของตัวเลือกในข้อนั้นออก เพื่อให้วัดเฉพาะ "ความต่าง" จากการเลือกแบบกลาง ๆ */
      const opts = D.q[qi][1];
      axes.forEach(a => { u[a] += (opt[1][a] || 0) - opts.reduce((s, o) => s + (o[1][a] || 0), 0) / opts.length; });
      if (opt[2]) side = opt[2];
    });
    const mean = {}; axes.forEach(a => { mean[a] = ids.reduce((s, id) => s + D.profile[id][a], 0) / ids.length; });
    const un = Math.sqrt(axes.reduce((s, a) => s + u[a] * u[a], 0)) || 1;
    const res = ids.map(id => {
      const c = {}; axes.forEach(a => { c[a] = D.profile[id][a] - mean[a]; });
      const cn = Math.sqrt(axes.reduce((s, a) => s + c[a] * c[a], 0)) || 1;
      let cos = axes.reduce((s, a) => s + u[a] * c[a], 0) / (un * cn);
      if (side && sides && sides[id] === side) cos += 0.15;
      const why = axes.filter(a => u[a] > 0 && c[a] > 0).sort((x, y) => u[y] * c[y] - u[x] * c[x]).slice(0, 3).map(a => D.axes[a]);
      return { id, score: cos, pct: Math.max(0, Math.min(100, Math.round((cos + 1) / 2 * 100))), why };
    }).sort((a, b) => b.score - a.score);
    return { answered: n, user: u, ranking: res };
  }

  root.FINDER = FINDER;
  root.finderScore = finderScore;
  if (typeof module !== 'undefined') module.exports = { FINDER, finderScore };
})(typeof window !== 'undefined' ? window : globalThis);
