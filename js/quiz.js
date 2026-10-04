/* =========================================================
   แบบทดสอบความเข้าใจ — คำตอบอิงกติกา 11th Edition
   a = index ของคำตอบที่ถูก (ก่อนสลับตัวเลือก)
   ========================================================= */
(function () {
  const Q = [
    { q: 'หนึ่งเทิร์นมีเฟสเรียงตามลำดับอย่างไร?', o: ['Movement → Command → Shooting → Fight → Charge', 'Command → Movement → Shooting → Charge → Fight', 'Command → Shooting → Movement → Charge → Fight', 'Movement → Shooting → Charge → Fight → Command'], a: 1, e: 'ลำดับคือ สั่งการ → เคลื่อนที่ → ยิง → ชาร์จ → ต่อสู้' },
    { q: 'อาวุธ S5 ยิงใส่เป้า T4 ต้องทอย Wound ได้เท่าไร?', o: ['2+', '3+', '4+', '5+'], a: 1, e: 'S มากกว่า T (แต่ไม่ถึง 2 เท่า) = 3+' },
    { q: 'อาวุธ S4 ใส่เป้า T8 ต้องทอย Wound ได้เท่าไร?', o: ['4+', '5+', '6+', 'ทำแผลไม่ได้เลย'], a: 2, e: 'S น้อยกว่าหรือเท่ากับครึ่งหนึ่งของ T = 6+ (ทำแผลได้เสมอถ้าทอยได้ 6)' },
    { q: 'เกราะ Sv 3+ ถูกยิงด้วยอาวุธ AP -2 ต้องทอยเซฟได้เท่าไร?', o: ['3+', '4+', '5+', '6+'], a: 2, e: 'ผลทอยถูกหัก 2 → ต้องทอยได้ 5 ขึ้นไป (5−2 = 3)' },
    { q: 'ใน 11th ระยะ Engagement Range (ระยะติดพัน) คือเท่าไร?', o: ['1 นิ้ว', '2 นิ้ว', '3 นิ้ว', '6 นิ้ว'], a: 1, e: '11th ขยายเป็น 2" แนวนอน (5" แนวตั้ง)' },
    { q: 'ที่กำบัง (Benefit of Cover) ใน 11th มีผลอย่างไร?', o: ['เซฟดีขึ้น 1', 'BS ของผู้ยิงแย่ลง 1', 'ศัตรูมองไม่เห็นเลย', 'ได้ Feel No Pain 5+'], a: 1, e: 'เปลี่ยนจากการเพิ่มเซฟ มาเป็นทำให้ BS ของผู้ยิงแย่ลง 1' },
    { q: 'ยูนิตที่ Advance ในเทิร์นนี้ ทำอะไรไม่ได้?', o: ['ยิงอาวุธ [ASSAULT]', 'ชาร์จ', 'ยึด Objective', 'ถูกใช้ Stratagem'], a: 1, e: 'ยูนิตที่ Advance ชาร์จไม่ได้และเริ่ม Action ไม่ได้ แต่ยิงอาวุธ [ASSAULT] ได้' },
    { q: 'ในเฟสชาร์จของ 11th ลำดับที่ถูกต้องคือ?', o: ['เลือกเป้าหมาย แล้วทอย 2D6', 'ทอย 2D6 แล้วเลือกเป้าหมายที่อยู่ในระยะ', 'ทอย D6 แล้วบวก 6', 'วัดระยะแล้วเดินเข้าไปได้เลยไม่ต้องทอย'], a: 1, e: 'ประกาศชาร์จ ทอย 2D6 แล้วค่อยเลือกศัตรูที่อยู่ในระยะ 12" และในระยะที่ทอยได้' },
    { q: 'ยูนิตต้องทดสอบ Battle-shock ใน Command Phase เมื่อไหร่?', o: ['ทุกเทิร์นทุกยูนิต', 'เมื่อเหลือครึ่งกำลังหรือต่ำกว่า หรือขวัญแตกอยู่แล้ว', 'เฉพาะเมื่อถูกชาร์จ', 'เฉพาะตัวละคร'], a: 1, e: 'ทดสอบเมื่ออยู่ที่ครึ่งกำลังหรือต่ำกว่า และยูนิตที่ขวัญแตกอยู่ต้องทอยผ่านถึงจะหาย' },
    { q: 'ยูนิตที่ขวัญแตก (Battle-shocked) มีผลอย่างไร?', o: ['ยิงไม่ได้', 'ค่า OC เป็น "–" และใช้ Stratagem กับยูนิตนั้นไม่ได้', 'ตายทันที', 'เดินได้ครึ่งเดียว'], a: 1, e: 'OC เป็น "–" (ยึดจุดไม่ได้) ใช้ Stratagem ไม่ได้ และเริ่ม Action ไม่ได้' },
    { q: 'Coherency ใน 11th กำหนดอย่างไร?', o: ['ห่างกันไม่เกิน 2" จากอย่างน้อยหนึ่งตัว เท่านั้น', 'ห่างไม่เกิน 2" จากอย่างน้อยหนึ่งตัว และทุกตัวห่างกันไม่เกิน 9"', 'ทุกตัวต้องแตะฐานกัน', 'ห่างกันไม่เกิน 6"'], a: 1, e: 'ใหม่ใน 11th: เพิ่มเงื่อนไขว่าทุกโมเดลต้องห่างกันไม่เกิน 9"' },
    { q: 'ในเฟสต่อสู้ ใครเลือกยูนิต Fights First ตัวแรก?', o: ['ผู้เล่นที่ไม่ได้เป็นเจ้าของเทิร์น', 'ผู้เล่นที่เป็นเจ้าของเทิร์น (Active Player)', 'ทอย Roll-off', 'ผู้ที่มีแต้มน้อยกว่า'], a: 1, e: 'ใน 11th เริ่มจาก Active Player' },
    { q: 'Fire Overwatch ใน 11th ใช้เมื่อไหร่ และโดนเมื่อไร?', o: ['ตอนศัตรูชาร์จ โดนที่ BS ปกติ', 'ท้าย Movement Phase ของศัตรู โดนเฉพาะ 6 ดิบ', 'ต้นเทิร์นตัวเอง โดนที่ 4+', 'ตอนเฟสต่อสู้ โดนที่ 5+'], a: 1, e: 'ย้ายมาท้าย Movement Phase ของศัตรู ยิงแบบ Snap Shooting โดนเฉพาะ 6 ดิบ ห้ามทอยซ้ำ' },
    { q: 'หน่วยทหารราบจะ Hidden (ซ่อนตัว) ได้เมื่อ?', o: ['ยืนหลังรถถัง', 'อยู่ในพื้นที่ฉากที่มีฉาก Light/Dense และไม่ได้ยิงในเทิร์นนี้และเทิร์นก่อน', 'จ่าย 1 CP', 'อยู่ห่างศัตรูเกิน 24"'], a: 1, e: 'ต้องอยู่ในพื้นที่ฉากที่มีฉาก Light หรือ Dense และไม่ได้ยิงทั้งเทิร์นนี้และเทิร์นก่อน ศัตรูเห็นได้ในระยะ 15"' },
    { q: 'ใครคุม Objective?', o: ['ฝ่ายที่เข้าไปก่อน', 'ฝ่ายที่มีโมเดลมากกว่า', 'ฝ่ายที่รวมค่า OC ในพื้นที่ได้สูงกว่า', 'ฝ่ายที่มีตัวละครอยู่'], a: 2, e: 'รวม OC ของทุกโมเดลที่อยู่ในพื้นที่ ฝ่ายที่สูงกว่าคุม ถ้าเท่ากันไม่มีใครคุม' },
    { q: 'เกม Strike Force (2,000 แต้ม) มี Detachment Points เท่าไร?', o: ['1', '2', '3', '5'], a: 2, e: 'Strike Force 3 DP, Incursion 2 DP' },
    { q: 'ในหนึ่งเฟส ยูนิตเดียวกันถูกใช้ Stratagem ได้กี่อัน?', o: ['ไม่จำกัด', '1 อัน', '2 อัน', '3 อัน'], a: 1, e: 'ใหม่ใน 11th: ยูนิตหนึ่งเป็นเป้าของ Stratagem ได้ 1 อันต่อเฟส' },
    { q: 'ทอยได้ 1 ดิบตอน Hit Roll เป็นอย่างไร?', o: ['โดนถ้ามีโบนัส +1', 'พลาดเสมอ', 'โดนแบบ Critical', 'ทอยใหม่อัตโนมัติ'], a: 1, e: 'ผลทอย 1 ดิบตอน Hit/Wound/Save ล้มเหลวเสมอ' },
    { q: 'ยูนิตในกองหนุน (Strategic Reserves) ลงสนามได้เร็วสุดเมื่อไร?', o: ['รอบที่ 1', 'รอบที่ 2', 'รอบที่ 3', 'รอบที่ 4'], a: 1, e: 'ตั้งแต่รอบที่ 2 และต้องลงให้ครบภายในรอบที่ 3 ไม่อย่างนั้นถูกทำลาย' },
    { q: 'ในเกม Matched Play คะแนน VP เต็มคือเท่าไร?', o: ['50', '90', '100', '150'], a: 2, e: 'ภารกิจหลัก 45 + ภารกิจรอง 45 + Battle Ready 10 = 100' }
  ];

  /* ชุดเนื้อเรื่อง — คำตอบอิงเนื้อหาในหน้าเนื้อเรื่องของเว็บนี้ */
  const L = [
    { q: 'Primarch คนใดทรยศจักรพรรดิและเป็นผู้นำ Horus Heresy?', o: ['Horus Lupercal', 'Lion El\'Jonson', 'Rogal Dorn', 'Sanguinius'], a: 0, e: 'Horus ได้ตำแหน่ง Warmaster แล้วถูก Chaos ชักจูงจนทรยศ พา Legion ครึ่งหนึ่งไปด้วย' },
    { q: 'จักรพรรดิประทับอยู่บนสิ่งใดมาตลอดหนึ่งหมื่นปี?', o: ['Golden Throne', 'Astronomican', 'Eye of Terror', 'Phalanx'], a: 0, e: 'หลังบาดเจ็บสาหัสจากการสู้กับ Horus ร่างของจักรพรรดิถูกค้ำชีวิตไว้บน Golden Throne บนดาว Terra' },
    { q: 'Primarch คนใดเสียชีวิตบนเรือของ Horus ระหว่างการสู้รบตอนจบ Heresy?', o: ['Sanguinius', 'Ferrus Manus', 'Vulkan', 'Leman Russ'], a: 0, e: 'Sanguinius แห่ง Blood Angels สู้กับ Horus ก่อนจักรพรรดิมาถึง และถูกสังหาร' },
    { q: 'สงครามตอนจบของ Horus Heresy ที่ดาว Terra เรียกว่าอะไร?', o: ['Siege of Terra', 'Battle of Calth', 'Drop Site Massacre', 'Fall of Cadia'], a: 0, e: 'Horus บุก Terra เพื่อปิดล้อมพระราชวังของจักรพรรดิ — Calth และ Drop Site Massacre เป็นศึกช่วงต้นของ Heresy' },
    { q: 'Primarch คนใดฟื้นคืนชีพในยุคปัจจุบันและนำ Indomitus Crusade?', o: ['Roboute Guilliman', 'Rogal Dorn', 'Corax', 'Jaghatai Khan'], a: 0, e: 'Guilliman ฟื้นขึ้นมาและเป็น Lord Commander of the Imperium นำสงครามครูเสดครั้งใหญ่หลัง Great Rift' },
    { q: 'ตำรา Codex Astartes ที่แบ่ง Legion เป็น Chapter เขียนโดยใคร?', o: ['Roboute Guilliman', 'จักรพรรดิ', 'Rogal Dorn', 'Malcador'], a: 0, e: 'Guilliman เขียนหลัง Heresy เพื่อไม่ให้ใครคุมกำลังมหาศาลได้คนเดียวอีก' },
    { q: 'ข้อใด<strong>ไม่ใช่</strong>เทพแห่ง Chaos?', o: ['Gork', 'Khorne', 'Nurgle', 'Slaanesh'], a: 0, e: 'เทพ Chaos ทั้งสี่คือ Khorne, Nurgle, Tzeentch และ Slaanesh ส่วน Gork เป็นเทพของ Orks' },
    { q: 'Black Crusade ครั้งที่ 13 ของ Abaddon ทำให้ดาวป้อมปราการใดล่มสลาย?', o: ['Cadia', 'Macragge', 'Armageddon', 'Fenris'], a: 0, e: 'Cadia เฝ้าทางออกของ Eye of Terror มาหลายพันปี การล่มสลายของ Cadia นำไปสู่การเกิด Great Rift' },
    { q: 'รอยแยก Warp ที่ผ่ากาแล็กซีเป็นสองซีกในยุคปัจจุบันเรียกว่าอะไร?', o: ['Great Rift (Cicatrix Maledictum)', 'Maelstrom', 'Webway', 'Gellar Field'], a: 0, e: 'Great Rift ตัดจักรวรรดิออกเป็นสองฝั่ง ฝั่งที่มองไม่เห็นแสง Astronomican เรียกว่า Imperium Nihilus' },
    { q: 'Navigator ใช้แสงอะไรนำทางยานผ่าน Warp?', o: ['Astronomican', 'Gellar Field', 'Golden Throne', 'Warp Storm'], a: 0, e: 'Astronomican คือแสงพลังจิตที่ส่งจาก Terra ส่วน Gellar Field คือสนามพลังกันปีศาจรอบตัวยาน' },
    { q: 'อวัยวะที่ส่งต่อพันธุกรรมของ Primarch ให้ Space Marine แต่ละรุ่นเรียกว่าอะไร?', o: ['Gene-seed', 'Black Carapace', 'Progenoid', 'Servo-skull'], a: 0, e: 'Gene-seed ทำให้ Space Marine แต่ละ Chapter มีลักษณะเฉพาะสืบทอดจาก Primarch ต้นสาย' },
    { q: 'ดาวบ้านของ Ultramarines คือดาวอะไร?', o: ['Macragge', 'Fenris', 'Baal', 'Nocturne'], a: 0, e: 'Macragge เป็นเมืองหลวงของ Ultramar — Fenris เป็นของ Space Wolves, Baal ของ Blood Angels, Nocturne ของ Salamanders' },
    { q: 'Primarch ของ Space Wolves คือใคร?', o: ['Leman Russ', 'Jaghatai Khan', 'Lion El\'Jonson', 'Konrad Curze'], a: 0, e: 'Leman Russ เป็น "หมาป่าของจักรพรรดิ" — Jaghatai Khan เป็นของ White Scars' },
    { q: 'Primarch คนใดนำ Death Guard และรับใช้ Nurgle?', o: ['Mortarion', 'Angron', 'Perturabo', 'Fulgrim'], a: 0, e: 'Mortarion และ Death Guard ติดโรคระบาดใน Warp จนกลายเป็นผู้รับใช้ Nurgle — Angron (Khorne), Fulgrim (Slaanesh), Perturabo (Iron Warriors)' },
    { q: 'ผู้นำ Black Legion ที่พยายามทำลายจักรวรรดิมาตลอดหมื่นปีคือใคร?', o: ['Abaddon the Despoiler', 'Ahriman', 'Kharn', 'Huron Blackheart'], a: 0, e: 'Abaddon เคยเป็นกัปตันคนสนิทของ Horus แล้วเปลี่ยนชื่อ Sons of Horus เป็น Black Legion' },
    { q: 'ก่อนกลายเป็นหุ่นโลหะ Necron เคยเป็นเผ่าอะไร?', o: ['Necrontyr', 'Old Ones', 'Aeldari', 'C\'tan'], a: 0, e: 'Necrontyr ยอมให้ C\'tan ย้ายจิตไปไว้ในร่างโลหะ แลกกับการไม่ตายแต่สูญเสียวิญญาณ' },
    { q: 'การกำเนิดของเทพองค์ใดทำให้อาณาจักร Aeldari ล่มสลาย?', o: ['Slaanesh', 'Khorne', 'Khaine', 'Cegorach'], a: 0, e: 'ความหลงระเริงของ Aeldari ให้กำเนิด Slaanesh ซึ่งกลืนวิญญาณ Aeldari ไปจำนวนมหาศาล (The Fall)' },
    { q: 'Tyranid มาจากที่ใด?', o: ['นอกกาแล็กซี', 'ใน Eye of Terror', 'ใต้ผิวดาว Terra', 'ใน Webway'], a: 0, e: 'กองเรือรัง (Hive Fleet) ของ Tyranid บุกเข้ามาจากอวกาศนอกกาแล็กซีเพื่อกลืนกินชีวมวล' },
    { q: 'ปรัชญาที่ T\'au ทุกวรรณะยึดถือคืออะไร?', o: ['The Greater Good', 'The Imperial Truth', 'The Codex Astartes', 'Waaagh!'], a: 0, e: 'Greater Good ให้ทุกคนทำงานเพื่อส่วนรวม และเปิดรับเผ่าอื่นอย่าง Kroot และ Vespid' },
    { q: 'Primarch กี่คนที่ถูกลบออกจากบันทึกของจักรวรรดิ?', o: ['2 คน', '1 คน', '4 คน', 'ไม่มีเลย'], a: 0, e: 'Legion ที่ II และ XI ถูกลบจากบันทึกทั้งหมด จึงมี Primarch ที่รู้จักกันเพียง 18 คนจาก 20' }
  ];

  const SETS = { rules: Q, lore: L };
  let set = /lore/.test(location.hash) ? 'lore' : 'rules', cur = SETS[set];
  const wrap = document.getElementById('quiz');
  const scoreEl = document.getElementById('quiz-score');
  let answered = 0, correct = 0;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const upd = () => { scoreEl.innerHTML = '<span>ตอบแล้ว <b>' + answered + '/' + cur.length + '</b> · ถูก <b class="gold">' + correct + '</b></span>' + (answered === cur.length ? '<b>' + (correct >= cur.length * .9 ? (set === 'lore' ? '🏆 รู้จักจักรวาล 40K ดีมาก!' : '🏆 พร้อมลงสนามแล้ว!') : correct >= cur.length * .65 ? '👍 ดีมาก ทบทวนอีกนิด' : (set === 'lore' ? '📖 ลองอ่านหน้าเนื้อเรื่องอีกรอบ' : '📖 ลองอ่านหน้ากติกาอีกรอบ')) + '</b>' : '<button class="btn btn-ghost btn-sm" id="quiz-reset" type="button">เริ่มใหม่</button>'); const r = document.getElementById('quiz-reset'); if (r) r.onclick = build; };

  function build() {
    answered = 0; correct = 0;
    wrap.innerHTML = cur.map((x, i) => {
      const opts = shuffle(x.o.map((t, k) => ({ t, ok: k === x.a })));
      return '<div class="quiz-q" data-i="' + i + '"><h3>' + (i + 1) + '. ' + x.q + '</h3><div class="quiz-opts">' +
        opts.map(o => '<button class="quiz-opt" type="button" data-ok="' + (o.ok ? 1 : 0) + '">' + o.t + '</button>').join('') +
        '</div><div class="quiz-exp">' + (window.icon ? window.icon('info') : '') + ' ' + x.e + '</div></div>';
    }).join('');
    upd();
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.quiz-opt');
    if (!b) return;
    const box = b.closest('.quiz-q');
    if (box.classList.contains('answered')) return;
    box.classList.add('answered');
    box.querySelectorAll('.quiz-opt').forEach(o => { o.disabled = true; if (o.dataset.ok === '1') o.classList.add('correct'); });
    if (b.dataset.ok === '1') correct++; else b.classList.add('wrong');
    answered++; upd();
  });
  /* แท็บเลือกชุดคำถาม: กติกา / เนื้อเรื่อง (ลิงก์ตรง quiz.html#lore) */
  const tabs = document.getElementById('quiz-sets');
  const setTab = () => tabs && tabs.querySelectorAll('.tab').forEach(t => { const on = t.dataset.set === set; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
  if (tabs) tabs.addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t || t.dataset.set === set) return;
    set = t.dataset.set; cur = SETS[set]; setTab(); build();
    history.replaceState(null, '', set === 'lore' ? '#lore' : location.pathname + location.search);
  });
  setTab();
  build();
})();
