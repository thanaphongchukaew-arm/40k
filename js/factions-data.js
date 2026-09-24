/* =========================================================
   ข้อมูลกองทัพ (Factions) — ใช้ในหน้า pages/factions.html
   ค่า rating (1–5) และ difficulty (1–3) เป็นการประเมินภาพรวมคร่าว ๆ
   เพื่อช่วยมือใหม่เลือกทัพ ของจริงขึ้นกับ Detachment และการจัดทัพ
   ========================================================= */
window.FACTIONS = [
  /* ---------------- IMPERIUM ---------------- */
  {
    id: 'space-marines', side: 'imperium', name: 'Space Marines', th: 'สเปซ มารีน',
    aka: 'Adeptus Astartes (อเดปตัส แอสตาร์ทีส)',
    img: 'factions/imperium/space-marines.webp',
    tagline: 'ยอดทหารดัดแปลงพันธุกรรมในเกราะพลังงาน ทำได้ทุกอย่าง — ทัพยอดนิยมอันดับหนึ่ง',
    desc: 'นักรบยอดมนุษย์สูงกว่า 2 เมตร ผ่านการผ่าตัดฝังอวัยวะเพิ่มและฝึกมาทั้งชีวิต แบ่งเป็น Chapter ละประมาณพันนาย แต่ละ Chapter มีสีและธรรมเนียมของตัวเอง (Ultramarines, Imperial Fists, Salamanders ฯลฯ) ในเกมเป็นทัพ "สารพัดประโยชน์" มีทั้งทหารราบ รถถัง ทหารจู่โจม และหน่วยสอดแนม',
    style: ['เล่นได้ทั้งยิงและตะลุมบอน', 'ยูนิตทนทาน (เกราะ 3+ เป็นพื้นฐาน)', 'ตัวเลือกยูนิตเยอะที่สุดในเกม'],
    pros: ['ให้อภัยความผิดพลาดของมือใหม่ เพราะทนทาน', 'หาโมเดลและคลิปสอนได้ง่ายที่สุด', 'อยู่ในชุดเริ่มต้นทุกกล่องของ 11th'],
    cons: ['จำนวนโมเดลน้อย เสียทีละตัวก็เจ็บ', 'ตัวเลือกเยอะจนอาจงงตอนจัดทัพ', 'เจอบ่อยมาก คู่แข่งรู้ทาง'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 4, speed: 3 }
  },
  {
    id: 'ultramarines', side: 'imperium', chapter: true, name: 'Ultramarines', th: 'อัลตร้ามารีน',
    img: 'factions/imperium/chapter-ultramarines.webp',
    tagline: 'Chapter ต้นแบบสีน้ำเงิน ผู้เคร่งครัดตำรา Codex Astartes',
    desc: 'Chapter ที่โด่งดังที่สุด เป็นลูกหลานของ Roboute Guilliman ผู้เขียน Codex Astartes มีระเบียบวินัยสูงและยืดหยุ่นทางยุทธวิธี เล่นด้วยกฎ Space Marines ทั่วไปพร้อมตัวละครพิเศษของตัวเอง เช่น Marneus Calgar',
    style: ['สมดุลทุกด้าน', 'เหมาะเป็นทัพแรกของสาย Space Marines'],
    pros: ['เป็นสีของโมเดลในชุดเริ่มต้นส่วนใหญ่', 'มีตัวละครพิเศษและเนื้อเรื่องเยอะ'], cons: ['เจอบ่อยที่สุดในสนาม'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 4, speed: 3 }
  },
  {
    id: 'blood-angels', side: 'imperium', chapter: true, name: 'Blood Angels', th: 'บลัด แองเจิลส์',
    img: 'factions/imperium/chapter-blood-angels.webp',
    tagline: 'อัศวินสีแดงผู้งดงามแต่แบกคำสาปกระหายเลือด — ตัวเอกของกล่อง Armageddon',
    desc: 'ลูกหลานของ Sanguinius Primarch ผู้มีปีกดั่งเทวดา สง่างามแต่มี "ข้อบกพร่องทางพันธุกรรม" คือความกระหายเลือด (Red Thirst) และภาวะคลุ้มคลั่ง (Black Rage) ในเกมเน้นกระโดดเข้าตะลุมบอนด้วยเครื่องบินไอพ่นติดหลัง (jump pack)',
    style: ['บุกประชิดเร็ว', 'ชาร์จแรง'],
    pros: ['ดุดัน สนุก ภาพสวย', 'เป็นทัพเด่นในเนื้อเรื่องปัจจุบัน'], cons: ['พลาดจังหวะชาร์จแล้วเสียหายหนัก'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 3, melee: 5, tough: 4, speed: 4 }
  },
  {
    id: 'dark-angels', side: 'imperium', chapter: true, name: 'Dark Angels', th: 'ดาร์ก แองเจิลส์',
    img: 'factions/imperium/chapter-dark-angels.webp',
    tagline: 'Legion ที่หนึ่ง ผู้เก็บความลับอันน่าอับอายไว้นับหมื่นปี',
    desc: 'ลูกหลานของ Lion El\'Jonson ซึ่งกลับมาแล้วในยุคปัจจุบัน ขึ้นชื่อเรื่องหน่วยชุดเกราะหนัก Deathwing (ชุดสีกระดูก) และหน่วยยานเร็ว Ravenwing ตามล่า "Fallen" ผู้ทรยศในอดีตอย่างลับ ๆ',
    style: ['หน่วย Terminator ทนทาน', 'หรือยานเร็วโจมตีแบบยิงแล้วหนี'],
    pros: ['มีหน่วยชั้นยอดที่ทนมาก'], cons: ['กฎพิเศษมีรายละเอียดมากกว่า Marines ทั่วไป'],
    difficulty: 2, models: 'น้อย–ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 5, speed: 3 }
  },
  {
    id: 'space-wolves', side: 'imperium', chapter: true, name: 'Space Wolves', th: 'สเปซ วูล์ฟส์',
    img: 'factions/imperium/chapter-space-wolves.webp',
    tagline: 'นักรบไวกิ้งแห่งดาวน้ำแข็ง Fenris พร้อมหมาป่ายักษ์',
    desc: 'ลูกหลานของ Leman Russ ไม่ค่อยทำตาม Codex Astartes มีโครงสร้างเป็น "Great Company" แบบเผ่า ชอบเข้าตะลุมบอน ขี่หมาป่ายักษ์ และมีนักบวชรูนที่ใช้พลังจิต',
    style: ['ตะลุมบอนหนัก', 'ตัวละครผู้นำเก่ง'],
    pros: ['บุคลิกชัดเจน โมเดลเท่'], cons: ['ต้องเข้าใกล้ศัตรูถึงจะเก่ง'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 3, melee: 5, tough: 4, speed: 4 }
  },
  {
    id: 'black-templars', side: 'imperium', chapter: true, name: 'Black Templars', th: 'แบล็ก เทมพลาร์ส',
    img: 'factions/imperium/chapter-black-templars.webp',
    tagline: 'อัศวินครูเสดคลั่งศรัทธา ที่ไม่เคยหยุดทำสงครามศักดิ์สิทธิ์',
    desc: 'Chapter ที่แยกจาก Imperial Fists นับถือจักรพรรดิเหมือนพระเจ้าอย่างเคร่งครัด ไม่มีนักพลังจิต (ไม่ไว้ใจเวทมนตร์) ออกรบแบบกองทัพครูเสดเคลื่อนที่ไม่หยุด เคยรบที่ Armageddon มาแล้ว',
    style: ['บุกหน้าตรง', 'ทหารราบจำนวนมากกว่า Marines ทั่วไป'],
    pros: ['เล่นตรงไปตรงมา ดุดัน'], cons: ['ขาดความยืดหยุ่นในการยิงระยะไกล'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 3, melee: 5, tough: 4, speed: 3 }
  },
  {
    id: 'deathwatch', side: 'imperium', chapter: true, name: 'Deathwatch', th: 'เดธวอทช์',
    img: 'factions/imperium/chapter-deathwatch.webp',
    tagline: 'หน่วยรบพิเศษล่าเอเลียน รวมยอดฝีมือจากทุก Chapter',
    desc: 'Space Marines ที่ถูกส่งมาจาก Chapter ต่าง ๆ มาประจำการชั่วคราว สวมเกราะดำพร้อมแขนซ้ายสีเงิน และทาไหล่ขวาเป็นสัญลักษณ์ Chapter เดิม เป็นแขนติดอาวุธของ Inquisition สาย Ordo Xenos',
    style: ['หน่วย Kill Team ผสมหลายบทบาท', 'อาวุธกระสุนพิเศษ'],
    pros: ['ปรับแต่งยูนิตได้สนุก'], cons: ['เหมาะกับคนที่เข้าใจพื้นฐานแล้ว'],
    difficulty: 2, models: 'น้อย', ratings: { shoot: 4, melee: 3, tough: 4, speed: 3 }
  },
  {
    id: 'grey-knights', side: 'imperium', name: 'Grey Knights', th: 'เกรย์ ไนท์ส',
    img: 'factions/imperium/grey-knights.webp',
    tagline: 'นักล่าปีศาจผู้มีพลังจิตทุกคน — Chapter ลับของจักรวรรดิ',
    desc: 'Chapter ลับที่ก่อตั้งเพื่อต่อสู้กับปีศาจแห่ง Chaos ทุกนายเป็น Psyker สวมเกราะสีเงินและอาวุธ Nemesis force weapon เป็นทัพแยกของตัวเอง (ไม่ได้อยู่ในกลุ่ม Space Marines ทั่วไป)',
    style: ['Elite สุด ๆ', 'วาร์ปลงสนามกลางเกม (Deep Strike)', 'พลังจิต'],
    pros: ['โมเดลน้อย ทำสีเสร็จเร็ว', 'ทุกตัวแข็งแกร่ง'], cons: ['เสียตัวเดียวก็เสียเปอร์เซ็นต์กองทัพเยอะ', 'ต้องวางแผนดี'],
    difficulty: 3, models: 'น้อย', ratings: { shoot: 3, melee: 4, tough: 4, speed: 4 }
  },
  {
    id: 'astra-militarum', side: 'imperium', name: 'Astra Militarum', th: 'แอสตรา มิลิทารุม',
    aka: 'Imperial Guard (อิมพีเรียล การ์ด)',
    img: 'factions/imperium/astra-militarum.webp',
    tagline: 'มนุษย์ธรรมดานับล้าน รถถัง และปืนใหญ่ — ค้อนแห่งจักรพรรดิ',
    desc: 'กองทัพมนุษย์ธรรมดาที่ใหญ่ที่สุดในกาแล็กซี ทหารแต่ละคนอ่อนแอแต่มีจำนวนมหาศาล สนับสนุนด้วยรถถังตระกูล Leman Russ ปืนใหญ่ และนายทหารที่คอย "สั่งการ" ให้ยูนิตเก่งขึ้น',
    style: ['ยิงจากระยะไกล', 'ใช้จำนวนและรถถัง', 'สั่งการ (Orders)'],
    pros: ['ได้เล่นกับรถถังเยอะ', 'ให้ความรู้สึกเป็นแม่ทัพ'], cons: ['ทหารราบตายง่าย', 'โมเดลเยอะ ทำสีนาน'],
    difficulty: 2, models: 'มาก', ratings: { shoot: 5, melee: 1, tough: 3, speed: 2 }
  },
  {
    id: 'adeptus-custodes', side: 'imperium', name: 'Adeptus Custodes', th: 'อเดปตัส คัสโตดีส',
    img: 'factions/imperium/adeptus-custodes.webp',
    tagline: 'องครักษ์ทองคำส่วนพระองค์ของจักรพรรดิ — แกร่งกว่า Space Marines',
    desc: 'นักรบที่จักรพรรดิสร้างขึ้นเองทีละคน แข็งแกร่งกว่า Space Marines หลายเท่า เดิมไม่เคยออกจาก Terra แต่ในยุคปัจจุบันออกรบทั่วกาแล็กซี มักมากับ Sisters of Silence (นักรบหญิงไร้พลังจิต)',
    style: ['Elite ที่สุดในเกม', 'ตะลุมบอนและทนทาน'],
    pros: ['โมเดลน้อยมาก ประหยัดเวลาทำสี', 'ทุกตัวอึด ตายยาก'], cons: ['มีโมเดลน้อยจนยึดพื้นที่ได้ไม่ทั่วถึง', 'ผิดพลาดครั้งเดียวเสียหายมาก'],
    difficulty: 2, models: 'น้อยมาก', ratings: { shoot: 3, melee: 5, tough: 5, speed: 3 }
  },
  {
    id: 'adepta-sororitas', side: 'imperium', name: 'Adepta Sororitas', th: 'อเดปตา โซโรริทาส',
    aka: 'Sisters of Battle (ซิสเตอร์ส ออฟ แบทเทิล)',
    img: 'factions/imperium/adepta-sororitas.webp',
    tagline: 'นักรบหญิงศักดิ์สิทธิ์ผู้ชำระล้างด้วยเปลวไฟและศรัทธา',
    desc: 'กองกำลังทหารของศาสนจักรจักรวรรดิ (Ecclesiarchy) สวมเกราะพลังงาน ถือปืน bolter ปืนไฟ และปืน melta ใช้กลไก "Miracle" จากศรัทธาที่ช่วยพลิกผลลูกเต๋าในจังหวะสำคัญ',
    style: ['ยิงระยะกลาง–ใกล้', 'ปืนไฟ', 'กลไกปาฏิหาริย์'],
    pros: ['ธีมชัด โมเดลสวย', 'เล่นได้หลายสไตล์'], cons: ['เกราะดีแต่ความทนน้อยกว่า Space Marines'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 3, speed: 3 }
  },
  {
    id: 'adeptus-mechanicus', side: 'imperium', name: 'Adeptus Mechanicus', th: 'อเดปตัส เมคานิคัส',
    img: 'factions/imperium/adeptus-mechanicus.webp',
    tagline: 'ลัทธิไซบอร์กจากดาวอังคาร ผู้บูชาเทพแห่งเครื่องจักร',
    desc: 'นักบวชเทคโนโลยี (Tech-Priest) ที่เปลี่ยนร่างกายเป็นเครื่องจักรเกือบทั้งหมด บูชา Omnissiah ผลิตอาวุธให้ทั้งจักรวรรดิ ออกรบด้วยทหาร Skitarii หุ่นรบ และอาวุธรังสีแปลกประหลาด',
    style: ['ยิงระยะไกล', 'ปรับบัฟตามจังหวะ'],
    pros: ['โมเดลเท่ ดีไซน์ไม่เหมือนใคร'], cons: ['ยูนิตค่อนข้างเปราะ', 'ต้องจัดการบัฟหลายอย่าง'],
    difficulty: 3, models: 'ปานกลาง–มาก', ratings: { shoot: 4, melee: 2, tough: 2, speed: 3 }
  },
  {
    id: 'imperial-knights', side: 'imperium', name: 'Imperial Knights', th: 'อิมพีเรียล ไนท์ส',
    img: 'factions/imperium/imperial-knights.webp',
    tagline: 'หุ่นรบยักษ์ของตระกูลขุนนาง — ทั้งกองทัพมีไม่กี่ตัว',
    desc: 'ขุนนางจาก "Knight World" ที่ขับหุ่นรบสูงหลายชั้นตึกซึ่งสืบทอดกันมาในตระกูล ในเกมทั้งกองทัพอาจมีแค่ 3–5 ตัวใหญ่ พร้อมหุ่นเล็ก (Armiger) คอยสนับสนุน',
    style: ['หุ่นยักษ์ไม่กี่ตัว', 'ยิงแรงและเหยียบแหลก'],
    pros: ['โมเดลน้อยมาก เป็นชิ้นงานโชว์', 'กฎตรงไปตรงมา'], cons: ['ยึดพื้นที่ได้ไม่กี่จุด', 'ถ้าศัตรูมีอาวุธต่อต้านรถถังเยอะจะลำบาก'],
    difficulty: 2, models: 'น้อยมาก', ratings: { shoot: 4, melee: 4, tough: 5, speed: 3 }
  },
  {
    id: 'imperial-agents', side: 'imperium', name: 'Imperial Agents', th: 'อิมพีเรียล เอเจนท์ส',
    img: 'factions/imperium/imperial-agents-inquisitor.webp',
    tagline: 'Inquisitor, มือสังหาร และหน่วยพิเศษ — ทีมผู้เชี่ยวชาญของจักรวรรดิ',
    desc: 'รวมหน่วยงานลับของจักรวรรดิ เช่น Inquisition (หน่วยสืบสวน), Officio Assassinorum (มือสังหาร), Sisters of Silence และหน่วยทหารของ Inquisitor ใช้เป็นทัพหลักก็ได้ หรือเติมเข้าไปเสริมกองทัพ Imperium อื่น',
    style: ['เครื่องมือเฉพาะทาง', 'ผสมกับทัพ Imperium อื่น'],
    pros: ['มีตัวละครน่าสนใจมาก'], cons: ['ไม่แนะนำเป็นทัพแรก'],
    difficulty: 3, models: 'น้อย–ปานกลาง', ratings: { shoot: 3, melee: 3, tough: 2, speed: 3 }
  },

  /* ---------------- CHAOS ---------------- */
  {
    id: 'chaos-space-marines', side: 'chaos', name: 'Chaos Space Marines', th: 'เคออส สเปซ มารีน',
    aka: 'Heretic Astartes (เฮเรติก แอสตาร์ทีส)',
    img: 'factions/chaos/chaos-space-marines.webp',
    tagline: 'Space Marines ผู้ทรยศ ที่ขายวิญญาณให้เทพแห่ง Chaos',
    desc: 'ลูกหลานของ Legion ที่ทรยศใน Horus Heresy และ Marines ที่หันหลังให้จักรวรรดิในภายหลัง เช่น Black Legion, Night Lords, Iron Warriors, Word Bearers และ Alpha Legion นำโดย Abaddon the Despoiler มีทั้งพลังของทหารเกราะหนัก ปีศาจ และสาวกมนุษย์',
    style: ['ยืดหยุ่นแบบ Space Marines', 'แลกความเสี่ยงเพื่อพลัง'],
    pros: ['ธีมมืดหม่นเท่', 'ดัดแปลงโมเดลได้อิสระ'], cons: ['กฎบางอย่างมีความเสี่ยงต้องคำนวณ'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 3, melee: 4, tough: 4, speed: 3 }
  },
  {
    id: 'death-guard', side: 'chaos', name: 'Death Guard', th: 'เดธ การ์ด',
    img: 'factions/chaos/death-guard.webp',
    tagline: 'นักรบโรคระบาดของ Nurgle ที่ทนทานจนน่าขนลุก',
    desc: 'Legion ที่ 14 ของ Mortarion ผู้บูชาเทพแห่งโรคภัย Nurgle ร่างกายเน่าเปื่อยแต่แทบฆ่าไม่ตาย เดินหน้าช้า ๆ พร้อมแพร่เชื้อโรคที่ทำให้ศัตรูอ่อนแอลง',
    style: ['ช้าแต่ทนมาก', 'ทำให้ศัตรูอ่อนแอ (debuff)'],
    pros: ['ทนทานมาก เหมาะกับมือใหม่', 'ทำสีแบบเลอะ ๆ ได้ง่าย'], cons: ['ช้า ยึดจุดไกลลำบาก'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 3, melee: 3, tough: 5, speed: 1 }
  },
  {
    id: 'thousand-sons', side: 'chaos', name: 'Thousand Sons', th: 'เธาซันด์ ซันส์',
    img: 'factions/chaos/thousand-sons.webp',
    tagline: 'นักเวทแห่ง Tzeentch และทหารผีในชุดเกราะว่างเปล่า',
    desc: 'Legion ที่ 15 ของ Magnus the Red เกือบทั้งหมดถูกคาถา "Rubric" เปลี่ยนเป็นฝุ่นที่ขังอยู่ในชุดเกราะ (Rubric Marines) นำโดยนักเวท Sorcerer ที่ใช้พลังจิตรุนแรง',
    style: ['พลังจิตและดาเมจพิเศษ', 'ทหารราบทนทาน'],
    pros: ['ธีมเวทมนตร์ชัดเจน', 'สีฟ้า–ทองสวย'], cons: ['ต้องบริหารพลังจิตให้เป็น'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 4, melee: 2, tough: 4, speed: 2 }
  },
  {
    id: 'world-eaters', side: 'chaos', name: 'World Eaters', th: 'เวิลด์ อีทเทอร์ส',
    img: 'factions/chaos/world-eaters.webp',
    tagline: 'เลือด! เพื่อเทพเจ้าแห่งเลือด! — ทัพตะลุมบอนล้วน',
    desc: 'Legion ที่ 12 ของ Angron ผู้ถูกฝังอุปกรณ์ Butcher\'s Nails ในสมองที่ทำให้คลั่งและรู้สึกสุขได้จากการเข่นฆ่าเท่านั้น บูชา Khorne ซึ่งเกลียดเวทมนตร์ จึงไม่มีนักพลังจิตเลย',
    style: ['วิ่งเข้าตะลุมบอนอย่างเดียว', 'เล่นง่าย เข้าใจง่าย'],
    pros: ['แผนการเล่นชัดเจนมาก', 'สนุก ดุเดือด'], cons: ['แทบไม่มีการยิง', 'ถูกยิงร่วงก่อนเข้าถึงตัว'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 1, melee: 5, tough: 3, speed: 4 }
  },
  {
    id: 'emperors-children', side: 'chaos', name: "Emperor's Children", th: 'เอ็มเพอเรอร์ส ชิลเดรน',
    img: 'factions/chaos/emperors-children.webp',
    tagline: 'ผู้แสวงหาความสมบูรณ์แบบที่หลงผิด สาวกแห่ง Slaanesh',
    desc: 'Legion ที่ 3 ของ Fulgrim เดิมหมกมุ่นกับความสมบูรณ์แบบ จนตกเป็นของ Slaanesh เทพแห่งความเกินพอดี ขึ้นชื่อเรื่องความเร็ว ดาบคู่ และอาวุธเสียงของ Noise Marines',
    style: ['เร็ว เคลื่อนไหวคล่อง', 'ยิงแล้วบุก'],
    pros: ['คล่องตัวสูง'], cons: ['ต้องจับจังหวะดี'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 3, melee: 4, tough: 3, speed: 5 }
  },
  {
    id: 'chaos-daemons', side: 'chaos', name: 'Chaos Daemons', th: 'เคออส ดีมอน',
    img: 'factions/chaos/chaos-daemons.webp',
    tagline: 'ปีศาจจากมิติ Warp ของเทพทั้งสี่ บุกโลกแห่งความจริง',
    desc: 'สิ่งมีชีวิตที่สร้างจากพลังงาน Warp รับใช้เทพ Khorne, Nurgle, Tzeentch และ Slaanesh มีตั้งแต่ปีศาจเล็กจำนวนมากไปจนถึง Greater Daemon ขนาดยักษ์ ผสมปีศาจของเทพหลายองค์ในทัพเดียวกันได้',
    style: ['โผล่กลางสนาม', 'ปีศาจยักษ์'],
    pros: ['โมเดลหลากหลายสุด ๆ', 'ธีมแฟนตาซีจัด'], cons: ['ไม่มีเกราะดี ใช้เซฟพิเศษแทน'],
    difficulty: 2, models: 'ปานกลาง–มาก', ratings: { shoot: 2, melee: 5, tough: 3, speed: 4 }
  },
  {
    id: 'chaos-knights', side: 'chaos', name: 'Chaos Knights', th: 'เคออส ไนท์ส',
    img: 'factions/chaos/chaos-knights.webp',
    tagline: 'หุ่นรบยักษ์ที่ถูกความมืดครอบงำ ปล่อยความหวาดกลัว',
    desc: 'Imperial Knights ที่หันไปรับใช้ Chaos บางตัวถูกปีศาจสิงจนหุ่นกับนักบินหลอมรวมกัน ใช้ความหวาดกลัวทำให้ศัตรูเสียขวัญ (Battle-shock)',
    style: ['หุ่นยักษ์ไม่กี่ตัว', 'ทำให้ศัตรูเสียขวัญ'],
    pros: ['โมเดลน้อยมาก', 'ธีมสยองโหด'], cons: ['จำนวนตัวน้อย ยึดพื้นที่ยาก'],
    difficulty: 2, models: 'น้อยมาก', ratings: { shoot: 4, melee: 4, tough: 5, speed: 3 }
  },

  /* ---------------- XENOS ---------------- */
  {
    id: 'aeldari', side: 'xenos', name: 'Aeldari', th: 'เอลดาริ',
    aka: 'Craftworlds / Asuryani (แอซูรยานี)',
    img: 'factions/xenos/aeldari.webp',
    tagline: 'เอลฟ์อวกาศผู้เร็วและแม่นยำ เผ่าพันธุ์ที่กำลังค่อย ๆ สูญพันธุ์',
    desc: 'ผู้รอดชีวิตจากการล่มสลายของอาณาจักรเอลดาร์โบราณ อาศัยบนยานขนาดดาว (Craftworld) แต่ละคนเชี่ยวชาญ "เส้นทาง" เดียวในชีวิต เช่น Aspect Warrior นักรบเฉพาะทาง ในเกมรวม Harlequins และ Ynnari ไว้ด้วย',
    style: ['เร็ว คล่อง ยิงแล้วหลบ', 'ยูนิตเฉพาะทาง'],
    pros: ['มีลูกเล่นเยอะ สนุกเมื่อชำนาญ', 'โมเดลสวยพลิ้ว'], cons: ['เปราะ วางตำแหน่งผิดคือหาย', 'ต้องคิดหลายขั้น'],
    difficulty: 3, models: 'ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 2, speed: 5 }
  },
  {
    id: 'drukhari', side: 'xenos', name: 'Drukhari', th: 'ดรูคาริ',
    aka: 'Dark Eldar (ดาร์ก เอลดาร์)',
    img: 'factions/xenos/drukhari.webp',
    tagline: 'โจรสลัดเอลฟ์ซาดิสต์จากเมืองมืด Commorragh',
    desc: 'เอลฟ์ที่หนีการกลืนวิญญาณของ Slaanesh ด้วยการดูดความเจ็บปวดของผู้อื่น บุกจู่โจมจับทาส ด้วยยานเร็วมาก',
    style: ['จู่โจมเร็วบนยาน', 'ยิงแล้วเข้าตะลุมบอน'],
    pros: ['เร็วที่สุดกลุ่มหนึ่ง', 'ความเสียหายสูง'], cons: ['เปราะมาก', 'ต้องจับจังหวะแม่น'],
    difficulty: 3, models: 'ปานกลาง', ratings: { shoot: 4, melee: 4, tough: 1, speed: 5 }
  },
  {
    id: 'orks', side: 'xenos', name: 'Orks', th: 'ออร์ค',
    img: 'factions/xenos/orks.webp',
    tagline: 'WAAAGH! เผ่าพันธุ์สีเขียวที่เกิดมาเพื่อต่อยตี — ตัวร้ายของกล่อง Armageddon',
    desc: 'ตัวใหญ่ แข็งแรง รักการต่อสู้เหนือสิ่งอื่นใด เทคโนโลยีดูเหมือนขยะประกอบกัน แต่ใช้ได้เพราะพวกมัน "เชื่อ" ว่าใช้ได้ ยิ่ง Ork ตัวใหญ่ก็ยิ่งเป็นหัวหน้า มีอารมณ์ขันแบบตลกร้าย',
    style: ['จำนวนมาก บุกประชิด', 'ยิงไม่แม่นแต่ยิงเยอะ', 'เรียก WAAAGH! ให้ทั้งทัพคลั่งบุกพร้อมกัน'],
    pros: ['สนุก เฮฮา อิสระในการแต่งโมเดล', 'อยู่ในชุดเริ่มต้นของ 11th'], cons: ['โมเดลเยอะ', 'ความแม่นต่ำ ต้องพึ่งจำนวน'],
    difficulty: 1, models: 'มาก', ratings: { shoot: 2, melee: 5, tough: 3, speed: 4 }
  },
  {
    id: 'necrons', side: 'xenos', name: 'Necrons', th: 'เนครอน',
    img: 'factions/xenos/necrons.webp',
    tagline: 'กองทัพหุ่นโครงกระดูกโลหะผู้ไม่รู้จักตาย ตื่นจากการหลับหกสิบล้านปี',
    desc: 'อารยธรรมที่ย้ายจิตสำนึกเข้าสู่ร่างโลหะ ทหารส่วนใหญ่เหลือแต่สัญชาตญาณ ส่วนชนชั้นสูงยังมีบุคลิกเต็มที่ ร่างเสียหายซ่อมตัวเองได้ด้วยระบบ Reanimation Protocols',
    style: ['เดินหน้าช้า ๆ ทนทาน', 'ฟื้นคืนโมเดลที่ตาย'],
    pros: ['ทนและให้อภัยความผิดพลาด', 'ทำสีเร็ว (สีเงิน + ล้างสี)'], cons: ['ไม่เร็ว', 'ตะลุมบอนไม่เด่น (ยกเว้นบางยูนิต)'],
    difficulty: 1, models: 'ปานกลาง', ratings: { shoot: 4, melee: 2, tough: 4, speed: 2 }
  },
  {
    id: 'tau-empire', side: 'xenos', name: "T'au Empire", th: 'ทาว เอ็มไพร์',
    img: 'factions/xenos/tau-empire.webp',
    tagline: 'อาณาจักรเทคโนโลยีสูง ชุดหุ่นรบ (Battlesuit) และปืนที่ยิงแรงที่สุด',
    desc: 'เผ่าพันธุ์หนุ่มที่ขยายอาณาจักรเพื่อ "Greater Good" แบ่งสังคมเป็นวรรณะ วรรณะนักรบ (Fire Caste) ใช้ปืนพลาสมาระยะไกลและชุดหุ่นรบ แต่ต่อสู้ระยะประชิดได้แย่มาก',
    style: ['ยิงระยะไกลที่สุดในเกม', 'หาเป้าร่วมกัน'],
    pros: ['ยิงแรงและแม่น', 'หุ่นรบสวยแบบเมคา'], cons: ['ถูกชาร์จเมื่อไหร่แทบไม่มีทางสู้', 'ต้องวางตำแหน่งดี'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 5, melee: 1, tough: 3, speed: 3 }
  },
  {
    id: 'tyranids', side: 'xenos', name: 'Tyranids', th: 'ไทรานิด',
    img: 'factions/xenos/tyranids.webp',
    tagline: 'ฝูงสัตว์ประหลาดจากนอกกาแล็กซี ที่กินทุกอย่างบนดาว',
    desc: 'สิ่งมีชีวิตทุกตัวเป็นอาวุธชีวภาพที่ถูกควบคุมโดยจิตรวมหมู่ Hive Mind เคลื่อนที่เป็น "Hive Fleet" มีตั้งแต่ตัวเล็กนับร้อยจนถึงสัตว์ประหลาดขนาดยักษ์',
    style: ['ฝูงใหญ่ หรือ สัตว์ประหลาดยักษ์', 'บุกประชิด'],
    pros: ['ธีม "เอเลี่ยน" ชัดเจน', 'ดัดแปลงสีได้อิสระ'], cons: ['ยูนิตแต่ละตัวต้องทำงานร่วมกัน'],
    difficulty: 2, models: 'มาก', ratings: { shoot: 3, melee: 4, tough: 3, speed: 4 }
  },
  {
    id: 'genestealer-cults', side: 'xenos', name: 'Genestealer Cults', th: 'จีนสตีลเลอร์ คัลท์',
    img: 'factions/xenos/genestealer-cults.webp',
    tagline: 'ลัทธิลูกผสมมนุษย์–เอเลียนที่ซ่อนตัวรอวันลุกฮือ',
    desc: 'เมื่อ Genestealer ฝังพันธุกรรมในมนุษย์ ลูกหลานหลายรุ่นจะกลายเป็นลูกผสมที่ภักดีต่อ "ลัทธิ" โดยไม่รู้ว่ากำลังเรียก Tyranids มากินดาวของตัวเอง ใช้อุปกรณ์เหมืองแร่และยานขุดเป็นอาวุธ',
    style: ['ซุ่มโจมตี โผล่จากใต้ดิน', 'ฟื้นหน่วยกลับมา'],
    pros: ['ลูกเล่นหลอกล่อสนุก'], cons: ['ยูนิตเปราะ', 'ต้องวางแผนการซุ่มดี'],
    difficulty: 3, models: 'มาก', ratings: { shoot: 3, melee: 3, tough: 2, speed: 4 }
  },
  {
    id: 'leagues-of-votann', side: 'xenos', name: 'Leagues of Votann', th: 'ลีกส์ ออฟ โวทันน์',
    img: 'factions/xenos/leagues-of-votann.webp',
    tagline: 'คนแคระอวกาศนักธุรกิจ ผู้บันทึกความแค้นทุกอย่างไว้',
    desc: 'ลูกหลานมนุษย์โบราณที่ถูกดัดแปลงให้อยู่รอดในใจกลางกาแล็กซี (เรียกตัวเองว่า Kin) บูชาปัญญาประดิษฐ์ Votann ทำเหมืองและการค้า และทำสงครามเพื่อผลประโยชน์ ใช้ระบบ "Grudge" ตั้งเป้าศัตรูที่ต้องล้างแค้น',
    style: ['ทหารราบตัวเตี้ยแต่อึด', 'ยิงหนัก'],
    pros: ['ทนทาน ยิงดี'], cons: ['ช้า'],
    difficulty: 2, models: 'ปานกลาง', ratings: { shoot: 4, melee: 3, tough: 4, speed: 2 }
  }
];
