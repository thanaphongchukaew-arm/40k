/* =========================================================
   ข้อมูลกองทัพ/ฉากของโต๊ะจำลอง — ค่าพลัง "แบบย่อเพื่อการเรียน" อ้างอิงแนวค่าจาก datasheet
   ไม่ใช่ค่าทางการ แต้มเป็นค่าประมาณ (ปรับตาม Munitorum Field Manual ได้ตลอด)
   อาวุธ = [ชื่อ, ระยะ(นิ้ว, 0=ประชิด), A ต่อโมเดล, BS/WS, S, AP, D, [คีย์เวิร์ด]]
   คีย์เวิร์ดอาวุธ: assault heavy pistol rapid torrent blast melta sustained lethal devastating psychic
   ความสามารถยูนิต (ab): synapse aura officer stealth fly · epic = ตัวละครเอก (Epic Hero) ใส่ได้ 1 ครั้ง
   ========================================================= */
(function (root) {
  const F = {
    sm: {
      name: 'Space Marines', th: 'สเปซ มารีน', img: 'units/intercessor.webp',
      rule: { id: 'oath', name: 'Oath of Moment', desc: 'ต้นเทิร์นเลือกศัตรู 1 ยูนิต (ระบบเลือกเป้าที่มีค่าที่สุดให้) ยิง/ฟันใส่เป้านั้นทอย Hit ที่พลาดใหม่ได้' },
      units: [
        { key: 'captain', name: 'Captain', kind: 'char', img: 'units/captain.webp', pts: 85, M: 6, T: 4, Sv: 3, inv: 4, W: 5, Ld: 6, OC: 1, models: 1,
          ranged: ['Master-crafted bolt rifle', 24, 2, 2, 4, -1, 2, ['assault', 'heavy']], melee: ['Power fist', 0, 5, 2, 8, -2, 2, []] },
        { key: 'uriel', name: 'Uriel Ventris', epic: true, kind: 'char', img: 'characters/uriel-ventris.webp', pts: 100, M: 6, T: 4, Sv: 3, inv: 4, W: 6, Ld: 6, OC: 1, models: 1,
          ranged: ['Bolt pistol', 12, 1, 2, 4, 0, 1, ['pistol']], melee: ['Sword of Idaeus', 0, 6, 2, 5, -2, 2, []] },
        { key: 'librarian', name: 'Librarian', kind: 'char', img: 'units/librarian.webp', pts: 65, M: 6, T: 4, Sv: 3, inv: 4, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Smite', 24, 4, 3, 6, -1, 2, ['psychic', 'devastating']], melee: ['Force weapon', 0, 4, 3, 6, -1, 2, []] },
        { key: 'intercessors', name: 'Intercessor Squad', kind: 'inf', img: 'units/intercessor.webp', pts: 85, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 5,
          ranged: ['Bolt rifle', 24, 2, 3, 4, -1, 1, ['assault', 'heavy']], melee: ['Close combat weapon', 0, 3, 3, 4, 0, 1, []] },
        { key: 'assault', name: 'Assault Intercessors', kind: 'inf', img: 'units/assault-squad.webp', pts: 75, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 5,
          ranged: ['Heavy bolt pistol', 18, 1, 3, 4, -1, 1, ['pistol']], melee: ['Astartes chainsword', 0, 4, 3, 4, -1, 1, []] },
        { key: 'scouts', name: 'Scout Squad', kind: 'inf', img: 'units/scout.webp', pts: 70, M: 6, T: 4, Sv: 4, inv: 0, W: 2, Ld: 6, OC: 2, models: 5, ab: ['stealth'],
          ranged: ['Bolt carbine', 24, 2, 3, 4, 0, 1, ['assault']], melee: ['Combat knife', 0, 3, 3, 4, 0, 1, []] },
        { key: 'devastators', name: 'Devastator Squad', kind: 'inf', img: 'units/devastator.webp', pts: 120, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 5,
          ranged: ['Missile launcher', 48, 1, 3, 9, -2, 3, ['heavy']], melee: ['Close combat weapon', 0, 3, 3, 4, 0, 1, []] },
        { key: 'terminators', name: 'Terminator Squad', kind: 'inf', img: 'units/terminator.webp', pts: 170, M: 5, T: 5, Sv: 2, inv: 4, W: 3, Ld: 6, OC: 1, models: 5,
          ranged: ['Storm bolter', 24, 2, 3, 4, 0, 1, ['rapid']], melee: ['Power fist', 0, 3, 3, 8, -2, 2, []] },
        { key: 'redemptor', name: 'Redemptor Dreadnought', kind: 'veh', img: 'space-marines/dread-redemptor.webp', pts: 210, M: 8, T: 10, Sv: 2, inv: 0, W: 12, Ld: 6, OC: 4, models: 1,
          ranged: ['Onslaught gatling cannon', 24, 8, 3, 6, 0, 1, []], melee: ['Redemptor fist', 0, 5, 3, 12, -2, 3, []] }
      ]
    },
    orks: {
      name: 'Orks', th: 'ออร์ค', img: 'units/boyz.webp',
      rule: { id: 'waaagh', name: 'Waaagh!', desc: 'ครั้งเดียวต่อเกม: ตลอดรอบนั้นออร์คทุกตัว A +1 และ S +1 ในการต่อสู้ ได้เซฟอมตะ 5+ และชาร์จหลัง Advance ได้' },
      units: [
        { key: 'warboss', name: 'Warboss', kind: 'char', img: 'tabletop/ork-warboss-2.webp', pts: 70, M: 6, T: 5, Sv: 4, inv: 5, W: 6, Ld: 6, OC: 1, models: 1,
          ranged: ['Kombi-shoota', 24, 3, 5, 5, 0, 1, []], melee: ['Big choppa', 0, 5, 2, 7, -1, 2, []] },
        { key: 'ghaz', name: 'Ghazghkull Thraka', epic: true, kind: 'char', img: 'characters/ghazghkull-mag-uruk-thraka.webp', pts: 235, r: 1.2, M: 5, T: 9, Sv: 2, inv: 4, W: 12, Ld: 6, OC: 4, models: 1,
          ranged: ["Gork's Klaw (ปืน)", 18, 4, 5, 8, -2, 2, []], melee: ["Gork's Klaw", 0, 6, 2, 14, -3, 4, []] },
        { key: 'weirdboy', name: 'Weirdboy', kind: 'char', img: 'units/weirdboy.webp', pts: 60, M: 6, T: 5, Sv: 6, inv: 5, W: 4, Ld: 7, OC: 1, models: 1,
          ranged: ["'Eadbanger", 24, 3, 5, 6, -1, 2, ['psychic', 'devastating']], melee: ['Weirdboy staff', 0, 3, 4, 7, -1, 2, []] },
        { key: 'boyz', name: 'Boyz', kind: 'inf', img: 'tabletop/ork-slugga-boy.webp', pts: 75, M: 6, T: 5, Sv: 5, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Slugga', 12, 1, 5, 4, 0, 1, ['pistol']], melee: ['Choppa', 0, 3, 3, 5, -1, 1, []] },
        { key: 'nobz', name: 'Nobz', kind: 'inf', img: 'tabletop/ork-nob.webp', pts: 95, M: 6, T: 5, Sv: 4, inv: 0, W: 2, Ld: 7, OC: 2, models: 5,
          ranged: ['Slugga', 12, 1, 5, 4, 0, 1, ['pistol']], melee: ['Power klaw', 0, 3, 3, 9, -2, 2, []] },
        { key: 'meganobz', name: 'Meganobz', kind: 'inf', img: 'units/meganobz.webp', pts: 90, M: 5, T: 6, Sv: 2, inv: 0, W: 3, Ld: 7, OC: 1, models: 3,
          ranged: ['Kustom shoota', 18, 4, 5, 4, 0, 1, []], melee: ['Power klaw', 0, 3, 4, 9, -2, 2, []] },
        { key: 'kommandos', name: 'Kommandos', kind: 'inf', img: 'units/kommandos.webp', pts: 120, M: 6, T: 5, Sv: 5, inv: 0, W: 1, Ld: 7, OC: 1, models: 10, ab: ['stealth'],
          ranged: ['Slugga', 12, 1, 5, 4, 0, 1, ['pistol']], melee: ['Choppa', 0, 3, 3, 5, -1, 1, []] },
        { key: 'gretchin', name: 'Gretchin', kind: 'inf', img: 'units/gretchin.webp', pts: 40, M: 5, T: 2, Sv: 7, inv: 0, W: 1, Ld: 8, OC: 2, models: 10,
          ranged: ['Grot blasta', 12, 1, 4, 3, 0, 1, ['pistol']], melee: ['Close combat weapon', 0, 1, 5, 2, 0, 1, []] },
        { key: 'deffdread', name: 'Deff Dread', kind: 'veh', img: 'space-marines/dread-deff-dread.webp', pts: 120, M: 6, T: 9, Sv: 2, inv: 0, W: 11, Ld: 7, OC: 3, models: 1,
          ranged: ['Big shootas', 36, 6, 5, 5, 0, 1, []], melee: ['Dread klaws', 0, 5, 3, 12, -2, 3, []] }
      ]
    },
    necrons: {
      name: 'Necrons', th: 'เนครอน', img: 'units/necron-warriors.webp',
      rule: { id: 'reanimate', name: 'Reanimation Protocols', desc: 'เฟสสั่งการของตัวเอง ทุกยูนิตที่เสียหายซ่อมตัวเอง D3 แผล (โมเดลที่ตายลุกกลับมาได้)' },
      units: [
        { key: 'overlord', name: 'Overlord', kind: 'char', img: 'units/overlord.webp', pts: 85, M: 5, T: 5, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 1, models: 1,
          ranged: ['Staff of light', 18, 3, 2, 5, -2, 1, []], melee: ['Voidscythe', 0, 4, 2, 8, -2, 2, []] },
        { key: 'imotekh', name: 'Imotekh the Stormlord', epic: true, kind: 'char', img: 'characters/imotekh.webp', pts: 100, M: 5, T: 5, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 1, models: 1,
          ranged: ['Staff of the Destroyer', 18, 3, 2, 6, -2, 2, []], melee: ['Gauntlet of fire', 0, 4, 2, 6, -1, 1, ['devastating']] },
        { key: 'technomancer', name: 'Technomancer', kind: 'char', img: 'units/cryptek.webp', pts: 75, M: 5, T: 4, Sv: 4, inv: 0, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Staff of light', 18, 3, 3, 5, -2, 1, []], melee: ['Staff of light', 0, 2, 4, 5, -2, 1, []] },
        { key: 'warriors', name: 'Necron Warriors', kind: 'inf', img: 'units/necron-warriors.webp', pts: 100, M: 5, T: 4, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Gauss flayer', 24, 1, 4, 4, 0, 1, ['rapid', 'lethal']], melee: ['Close combat weapon', 0, 1, 4, 4, 0, 1, []] },
        { key: 'immortals', name: 'Immortals', kind: 'inf', img: 'units/immortals.webp', pts: 75, M: 5, T: 5, Sv: 3, inv: 0, W: 1, Ld: 6, OC: 2, models: 5,
          ranged: ['Gauss blaster', 24, 2, 3, 5, -1, 1, ['lethal']], melee: ['Close combat weapon', 0, 2, 3, 4, 0, 1, []] },
        { key: 'lychguard', name: 'Lychguard', kind: 'inf', img: 'units/lychguard.webp', pts: 85, M: 5, T: 5, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 1, models: 5,
          ranged: null, melee: ['Warscythe', 0, 2, 3, 8, -2, 2, []] },
        { key: 'flayed', name: 'Flayed Ones', kind: 'inf', img: 'units/flayed-ones.webp', pts: 60, M: 5, T: 4, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 1, models: 5, ab: ['stealth'],
          ranged: null, melee: ['Flayer claws', 0, 4, 3, 4, -1, 1, ['sustained']] },
        { key: 'wraiths', name: 'Canoptek Wraiths', kind: 'inf', img: 'units/canoptek.webp', pts: 110, M: 8, T: 6, Sv: 4, inv: 4, W: 4, Ld: 8, OC: 1, models: 3, ab: ['fly'],
          ranged: null, melee: ['Vicious claws', 0, 4, 4, 6, -2, 2, []] },
        { key: 'ctan', name: "C'tan Shard", epic: true, kind: 'mon', img: 'units/ctan-shard.webp', pts: 280, M: 8, T: 11, Sv: 4, inv: 4, W: 14, Ld: 6, OC: 4, models: 1, ab: ['fly'],
          ranged: ['Star-god power', 24, 4, 2, 8, -3, 3, ['devastating']], melee: ['Star-god fist', 0, 6, 2, 12, -3, 3, []] }
      ]
    },
    tyranids: {
      name: 'Tyranids', th: 'ไทรานิด', img: 'units/termagants.webp',
      rule: { id: 'synapse', name: 'Synapse', desc: 'ยูนิตที่อยู่ในระยะ 6" จากยูนิต SYNAPSE ผ่านการทดสอบขวัญอัตโนมัติ (ภาพ: สมองรวม Hive Mind)' },
      units: [
        { key: 'hivetyrant', name: 'Hive Tyrant', kind: 'mon', img: 'units/hive-tyrant.webp', pts: 200, M: 8, T: 10, Sv: 2, inv: 4, W: 10, Ld: 7, OC: 3, models: 1, ab: ['synapse'],
          ranged: ['Heavy venom cannon', 36, 2, 2, 9, -2, 3, ['blast']], melee: ['Monstrous bonesword', 0, 6, 2, 9, -2, 3, []] },
        { key: 'swarmlord', name: 'The Swarmlord', epic: true, kind: 'mon', img: 'characters/swarmlord.webp', pts: 220, M: 8, T: 10, Sv: 2, inv: 4, W: 10, Ld: 7, OC: 3, models: 1, ab: ['synapse'],
          ranged: ['Synaptic pulse', 18, 6, 2, 5, -1, 1, ['psychic']], melee: ['Bone sabres', 0, 8, 2, 9, -2, 3, []] },
        { key: 'warriors', name: 'Tyranid Warriors', kind: 'inf', img: 'units/tyranid-warriors.webp', pts: 70, M: 6, T: 5, Sv: 4, inv: 0, W: 3, Ld: 7, OC: 1, models: 3, ab: ['synapse'],
          ranged: ['Deathspitter', 24, 3, 4, 5, -1, 1, []], melee: ['Boneswords', 0, 3, 3, 5, -2, 1, []] },
        { key: 'termagants', name: 'Termagants', kind: 'inf', img: 'units/termagants.webp', pts: 55, M: 6, T: 3, Sv: 5, inv: 0, W: 1, Ld: 8, OC: 2, models: 10,
          ranged: ['Fleshborer', 18, 1, 4, 5, 0, 1, ['assault']], melee: ['Xenos claws', 0, 1, 4, 3, 0, 1, []] },
        { key: 'genestealers', name: 'Genestealers', kind: 'inf', img: 'units/genestealers.webp', pts: 70, M: 8, T: 4, Sv: 5, inv: 5, W: 2, Ld: 7, OC: 1, models: 5,
          ranged: null, melee: ['Genestealer claws', 0, 4, 2, 4, -2, 1, ['lethal']] },
        { key: 'lictor', name: 'Lictor', kind: 'inf', img: 'units/lictor.webp', pts: 60, M: 8, T: 5, Sv: 4, inv: 0, W: 6, Ld: 7, OC: 1, models: 1, ab: ['stealth'],
          ranged: null, melee: ['Talons', 0, 6, 2, 7, -2, 2, ['lethal']] },
        { key: 'zoanthropes', name: 'Zoanthropes', kind: 'inf', img: 'units/zoanthrope.webp', pts: 100, M: 5, T: 5, Sv: 5, inv: 4, W: 3, Ld: 7, OC: 1, models: 3, ab: ['synapse', 'fly'],
          ranged: ['Warp blast', 24, 1, 3, 10, -3, 3, ['psychic', 'devastating']], melee: ['Chitin claws', 0, 1, 4, 3, 0, 1, []] },
        { key: 'carnifex', name: 'Carnifex', kind: 'mon', img: 'units/carnifex.webp', pts: 115, M: 8, T: 9, Sv: 2, inv: 0, W: 8, Ld: 8, OC: 3, models: 1,
          ranged: ['Deathspitter with slimer maggots', 24, 3, 4, 7, -1, 1, []], melee: ['Monstrous scything talons', 0, 6, 3, 9, -2, 3, []] }
      ]
    },
    guard: {
      name: 'Astra Militarum', th: 'แอสตรา มิลิทารัม', img: 'units/infantry-squad.webp',
      rule: { id: 'orders', name: 'Voice of Command', desc: 'ทหารราบที่อยู่ในระยะ 6" จากนายทหาร (OFFICER) ได้คำสั่ง "Take Aim!" ยิง Hit +1' },
      units: [
        { key: 'creed', name: 'Lord Castellan Creed', epic: true, kind: 'char', img: 'characters/creed.webp', pts: 65, M: 6, T: 3, Sv: 4, inv: 5, W: 4, Ld: 6, OC: 1, models: 1, ab: ['officer'],
          ranged: ['Duty and Vengeance', 12, 2, 2, 4, -1, 1, ['pistol']], melee: ['Close combat weapon', 0, 3, 3, 3, 0, 1, []] },
        { key: 'commissar', name: 'Commissar', kind: 'char', img: 'units/commissar.webp', pts: 30, M: 6, T: 3, Sv: 4, inv: 5, W: 3, Ld: 6, OC: 1, models: 1, ab: ['aura'],
          ranged: ['Bolt pistol', 12, 1, 3, 4, 0, 1, ['pistol']], melee: ['Power weapon', 0, 3, 3, 5, -2, 1, []] },
        { key: 'psyker', name: 'Primaris Psyker', kind: 'char', img: 'units/primaris-psyker.webp', pts: 60, M: 6, T: 3, Sv: 5, inv: 5, W: 3, Ld: 7, OC: 1, models: 1,
          ranged: ['Psychic Maelstrom', 18, 4, 3, 6, -1, 1, ['psychic', 'devastating']], melee: ['Force weapon', 0, 2, 3, 6, -1, 2, []] },
        { key: 'infantry', name: 'Cadian Shock Troops', kind: 'inf', img: 'units/infantry-squad.webp', pts: 55, M: 6, T: 3, Sv: 5, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Lasgun', 24, 1, 4, 3, 0, 1, ['rapid']], melee: ['Close combat weapon', 0, 1, 4, 3, 0, 1, []] },
        { key: 'scions', name: 'Tempestus Scions', kind: 'inf', img: 'units/tempestus-scions.webp', pts: 55, M: 6, T: 3, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 1, models: 5,
          ranged: ['Hot-shot lasgun', 24, 1, 3, 3, -2, 1, ['rapid']], melee: ['Close combat weapon', 0, 1, 3, 3, 0, 1, []] },
        { key: 'ratlings', name: 'Ratlings', kind: 'inf', img: 'units/ratling.webp', pts: 60, M: 6, T: 2, Sv: 6, inv: 0, W: 1, Ld: 7, OC: 1, models: 5, ab: ['stealth'],
          ranged: ['Sniper rifle', 36, 1, 3, 4, -1, 2, ['heavy']], melee: ['Close combat weapon', 0, 1, 4, 2, 0, 1, []] },
        { key: 'ogryns', name: 'Ogryns', kind: 'inf', img: 'units/ogryn.webp', pts: 60, M: 6, T: 6, Sv: 5, inv: 0, W: 3, Ld: 7, OC: 1, models: 3,
          ranged: ['Ripper gun', 18, 3, 4, 5, 0, 1, []], melee: ['Huge knife', 0, 4, 3, 6, -1, 2, []] },
        { key: 'lemanruss', name: 'Leman Russ Battle Tank', kind: 'veh', img: 'units/leman-russ.webp', pts: 160, r: 1.9, M: 10, T: 11, Sv: 2, inv: 0, W: 13, Ld: 7, OC: 3, models: 1,
          ranged: ['Leman Russ battle cannon', 48, 6, 4, 10, -1, 3, ['blast', 'heavy']], melee: ['Armoured tracks', 0, 3, 4, 6, 0, 1, []] }
      ]
    },
    csm: {
      name: 'Chaos Space Marines', th: 'เคออส สเปซ มารีน', img: 'units/legionaries.webp',
      rule: { id: 'pacts', name: 'Dark Pacts', desc: 'ทุกการโจมตีได้พรจาก Chaos: ยิงได้ Sustained Hits ฟันได้ Lethal Hits แต่หลังโจมตีต้องทอย 2D6 ≥ Ld ไม่งั้นโดน 1 mortal wound' },
      units: [
        { key: 'lord', name: 'Chaos Lord', kind: 'char', img: 'units/chaos-lord.webp', pts: 90, M: 6, T: 4, Sv: 3, inv: 4, W: 5, Ld: 6, OC: 1, models: 1,
          ranged: ['Plasma pistol', 12, 1, 2, 8, -3, 2, ['pistol']], melee: ['Accursed weapon', 0, 6, 2, 5, -2, 2, []] },
        { key: 'sorcerer', name: 'Chaos Sorcerer', kind: 'char', img: 'units/chaos-sorcerer.webp', pts: 60, M: 6, T: 4, Sv: 3, inv: 5, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Infernal Gaze', 18, 3, 3, 8, -3, 2, ['psychic']], melee: ['Force weapon', 0, 4, 3, 6, -1, 2, []] },
        { key: 'legionaries', name: 'Legionaries', kind: 'inf', img: 'units/legionaries.webp', pts: 95, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 5,
          ranged: ['Boltgun', 24, 1, 3, 4, 0, 1, ['rapid']], melee: ['Astartes chainsword', 0, 4, 3, 4, -1, 1, []] },
        { key: 'chosen', name: 'Chosen', kind: 'inf', img: 'units/chosen.webp', pts: 130, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 1, models: 5,
          ranged: ['Combi-weapon', 24, 1, 3, 4, 0, 1, ['rapid', 'devastating']], melee: ['Accursed weapon', 0, 4, 3, 5, -2, 1, []] },
        { key: 'cultists', name: 'Cultist Mob', kind: 'inf', img: 'units/cultists.webp', pts: 50, M: 6, T: 3, Sv: 6, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Autogun', 24, 1, 4, 3, 0, 1, ['rapid']], melee: ['Brutal assault weapon', 0, 1, 4, 3, 0, 1, []] },
        { key: 'havocs', name: 'Havocs', kind: 'inf', img: 'units/havocs.webp', pts: 125, M: 6, T: 4, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 1, models: 5,
          ranged: ['Havoc autocannon', 48, 2, 3, 9, -1, 3, ['heavy']], melee: ['Close combat weapon', 0, 3, 3, 4, 0, 1, []] },
        { key: 'possessed', name: 'Possessed', kind: 'inf', img: 'units/possessed.webp', pts: 120, M: 9, T: 5, Sv: 3, inv: 5, W: 2, Ld: 6, OC: 1, models: 5,
          ranged: null, melee: ['Hideous mutations', 0, 4, 3, 5, -2, 2, []] },
        { key: 'dprince', name: 'Daemon Prince', kind: 'mon', img: 'units/daemon-prince.webp', pts: 180, M: 8, T: 10, Sv: 2, inv: 4, W: 10, Ld: 6, OC: 3, models: 1, ab: ['fly'],
          ranged: ['Infernal cannon', 24, 3, 2, 5, -1, 2, []], melee: ['Hellforged sword', 0, 6, 2, 8, -2, 3, []] }
      ]
    },
    aeldari: {
      name: 'Aeldari', th: 'เอลดาร์', img: 'units/guardians.webp',
      rule: { id: 'focus', name: 'Battle Focus', desc: 'ยิงได้หลัง Advance ด้วยอาวุธทุกชนิด (เสมือนทุกกระบอกเป็น ASSAULT) — ว่องไวเหนือทุกเผ่า' },
      units: [
        { key: 'farseer', name: 'Farseer', kind: 'char', img: 'units/farseer.webp', pts: 70, M: 7, T: 3, Sv: 6, inv: 4, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Eldritch Storm', 18, 6, 3, 5, -1, 1, ['psychic', 'blast']], melee: ['Witchblade', 0, 3, 2, 3, 0, 2, ['devastating']] },
        { key: 'autarch', name: 'Autarch', kind: 'char', img: 'units/autarch.webp', pts: 75, M: 7, T: 3, Sv: 3, inv: 5, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Fusion pistol', 6, 1, 2, 8, -4, 3, ['pistol', 'melta']], melee: ['Star glaive', 0, 4, 2, 6, -2, 2, []] },
        { key: 'guardians', name: 'Guardian Defenders', kind: 'inf', img: 'units/guardians.webp', pts: 85, M: 7, T: 3, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Shuriken catapult', 18, 2, 3, 4, -1, 1, ['assault']], melee: ['Close combat weapon', 0, 1, 3, 3, 0, 1, []] },
        { key: 'avengers', name: 'Dire Avengers', kind: 'inf', img: 'units/aspect-warriors.webp', pts: 75, M: 7, T: 3, Sv: 4, inv: 0, W: 1, Ld: 6, OC: 1, models: 5,
          ranged: ['Avenger shuriken catapult', 18, 3, 3, 4, -1, 1, ['assault']], melee: ['Close combat weapon', 0, 2, 3, 3, 0, 1, []] },
        { key: 'rangers', name: 'Rangers', kind: 'inf', img: 'units/rangers.webp', pts: 50, M: 7, T: 3, Sv: 5, inv: 0, W: 1, Ld: 7, OC: 1, models: 5, ab: ['stealth'],
          ranged: ['Ranger long rifle', 36, 1, 3, 4, -1, 2, ['heavy']], melee: ['Close combat weapon', 0, 1, 3, 3, 0, 1, []] },
        { key: 'wraithguard', name: 'Wraithguard', kind: 'inf', img: 'units/wraithguard.webp', pts: 150, M: 5, T: 7, Sv: 2, inv: 0, W: 3, Ld: 6, OC: 1, models: 5,
          ranged: ['Wraithcannon', 18, 1, 4, 12, -4, 4, ['heavy']], melee: ['Wraithguard fists', 0, 2, 4, 5, 0, 1, []] },
        { key: 'avatar', name: 'Avatar of Khaine', epic: true, kind: 'mon', img: 'units/avatar-of-khaine.webp', pts: 280, M: 10, T: 11, Sv: 2, inv: 4, W: 14, Ld: 6, OC: 5, models: 1,
          ranged: ['The Wailing Doom', 12, 1, 2, 16, -4, 6, ['melta']], melee: ['The Wailing Doom', 0, 6, 2, 16, -4, 3, []] }
      ]
    },
    tau: {
      name: "T'au Empire", th: 'เทา เอ็มไพร์', img: 'units/fire-warriors.webp',
      rule: { id: 'greater', name: 'For the Greater Good', desc: 'ยิงประสานกัน: เป้าที่ถูกหน่วยเทาอื่นยิงไปแล้วในเฟสนี้ ยูนิตถัดไปยิงเป้านั้น Hit +1' },
      units: [
        { key: 'ethereal', name: 'Ethereal', kind: 'char', img: 'units/ethereal.webp', pts: 50, M: 6, T: 3, Sv: 5, inv: 5, W: 3, Ld: 7, OC: 1, models: 1, ab: ['aura'],
          ranged: null, melee: ['Honour blade', 0, 3, 3, 4, 0, 1, []] },
        { key: 'shadowsun', name: "Commander Shadowsun", epic: true, kind: 'char', img: 'characters/shadowsun.webp', pts: 100, M: 10, T: 5, Sv: 3, inv: 5, W: 6, Ld: 6, OC: 1, models: 1, ab: ['stealth', 'fly'],
          ranged: ['High-energy fusion blaster', 18, 2, 2, 9, -4, 4, ['melta']], melee: ['Battlesuit fists', 0, 3, 4, 4, 0, 1, []] },
        { key: 'firewarriors', name: 'Strike Team', kind: 'inf', img: 'units/fire-warriors.webp', pts: 70, M: 6, T: 3, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Pulse rifle', 30, 1, 4, 5, 0, 1, ['rapid']], melee: ['Close combat weapon', 0, 1, 5, 3, 0, 1, []] },
        { key: 'pathfinders', name: 'Pathfinder Team', kind: 'inf', img: 'units/pathfinders.webp', pts: 80, M: 7, T: 3, Sv: 4, inv: 0, W: 1, Ld: 7, OC: 1, models: 10, ab: ['stealth'],
          ranged: ['Pulse carbine', 20, 2, 4, 5, 0, 1, ['assault']], melee: ['Close combat weapon', 0, 1, 5, 3, 0, 1, []] },
        { key: 'crisis', name: 'Crisis Battlesuits', kind: 'inf', img: 'units/crisis.webp', pts: 120, M: 10, T: 5, Sv: 3, inv: 0, W: 4, Ld: 7, OC: 2, models: 3, ab: ['fly'],
          ranged: ['Plasma rifle ×2', 24, 2, 4, 8, -3, 3, []], melee: ['Battlesuit fists', 0, 3, 5, 5, 0, 1, []] },
        { key: 'kroot', name: 'Kroot Carnivores', kind: 'inf', img: 'units/kroot.webp', pts: 60, M: 7, T: 3, Sv: 6, inv: 0, W: 1, Ld: 7, OC: 1, models: 10, ab: ['stealth'],
          ranged: ['Kroot rifle', 24, 1, 4, 4, -1, 1, ['rapid']], melee: ['Tanglebomb & blades', 0, 2, 3, 3, 0, 1, []] }
      ]
    },
    sororitas: {
      name: 'Adepta Sororitas', th: 'แอดเดปตา โซโรริทัส', img: 'units/battle-sisters.webp',
      rule: { id: 'faith', name: 'Acts of Faith', desc: 'ปาฏิหาริย์: ครั้งหนึ่งต่อเฟส เซฟที่ทอยไม่ผ่านลูกแรกของฝ่ายนี้เปลี่ยนเป็นผ่าน (จำลองลูกเต๋า Miracle)' },
      units: [
        { key: 'canoness', name: 'Canoness', kind: 'char', img: 'units/canoness.webp', pts: 60, M: 6, T: 3, Sv: 3, inv: 4, W: 4, Ld: 6, OC: 1, models: 1,
          ranged: ['Condemnor boltgun', 24, 1, 2, 4, 0, 1, ['rapid']], melee: ['Blessed blade', 0, 5, 2, 5, -2, 2, []] },
        { key: 'celestine', name: 'Saint Celestine', epic: true, kind: 'char', img: 'characters/saint-celestine.webp', pts: 160, M: 12, T: 3, Sv: 2, inv: 4, W: 5, Ld: 6, OC: 1, models: 1, fnp: 5, ab: ['fly'],
          ranged: ['The Ardent Blade (ไฟ)', 12, 6, 0, 5, -1, 1, ['torrent']], melee: ['The Ardent Blade', 0, 6, 2, 6, -3, 2, []] },
        { key: 'sisters', name: 'Battle Sisters Squad', kind: 'inf', img: 'units/battle-sisters.webp', pts: 105, M: 6, T: 3, Sv: 3, inv: 0, W: 1, Ld: 7, OC: 2, models: 10,
          ranged: ['Boltgun', 24, 1, 3, 4, 0, 1, ['rapid']], melee: ['Close combat weapon', 0, 1, 4, 3, 0, 1, []] },
        { key: 'retributors', name: 'Retributor Squad', kind: 'inf', img: 'units/retributors.webp', pts: 115, M: 6, T: 3, Sv: 3, inv: 0, W: 1, Ld: 7, OC: 1, models: 5,
          ranged: ['Heavy bolter', 36, 3, 3, 5, -1, 2, ['heavy', 'sustained']], melee: ['Close combat weapon', 0, 1, 4, 3, 0, 1, []] },
        { key: 'seraphim', name: 'Seraphim Squad', kind: 'inf', img: 'units/seraphim.webp', pts: 80, M: 12, T: 3, Sv: 3, inv: 0, W: 1, Ld: 7, OC: 1, models: 5, ab: ['fly'],
          ranged: ['Bolt pistols ×2', 12, 2, 3, 4, 0, 1, ['pistol']], melee: ['Close combat weapon', 0, 2, 3, 3, 0, 1, []] },
        { key: 'repentia', name: 'Sisters Repentia', kind: 'inf', img: 'units/repentia.webp', pts: 80, M: 7, T: 3, Sv: 7, inv: 0, W: 1, Ld: 7, OC: 1, models: 5, fnp: 5,
          ranged: null, melee: ['Penitent eviscerator', 0, 3, 3, 7, -2, 2, []] },
        { key: 'penitent', name: 'Penitent Engine', kind: 'veh', img: 'units/penitent-engine.webp', pts: 75, M: 8, T: 6, Sv: 4, inv: 0, W: 8, Ld: 8, OC: 1, models: 1, fnp: 5,
          ranged: ['Penitent flamers', 12, 6, 0, 5, -1, 1, ['torrent']], melee: ['Penitent buzz-blades', 0, 4, 4, 7, -2, 2, []] }
      ]
    },
    deathguard: {
      name: 'Death Guard', th: 'เดธการ์ด', img: 'units/plague-marines.webp',
      rule: { id: 'contagion', name: "Nurgle's Gift", desc: 'ศัตรูที่อยู่ในระยะ 6" จากยูนิต Death Guard ติดโรค: ค่า T ลดลง 1 (ทำแผลง่ายขึ้น)' },
      units: [
        { key: 'typhus', name: 'Typhus', epic: true, kind: 'char', img: 'characters/typhus.webp', pts: 80, M: 5, T: 5, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 1, models: 1, fnp: 5,
          ranged: ['Master of the Destroyer Hive', 12, 6, 0, 5, -1, 1, ['torrent', 'psychic']], melee: ['Manreaper', 0, 5, 2, 8, -2, 3, []] },
        { key: 'lordcontagion', name: 'Lord of Contagion', kind: 'char', img: 'units/lord-of-contagion.webp', pts: 85, M: 4, T: 6, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 1, models: 1, fnp: 5,
          ranged: null, melee: ['Plaguereaper', 0, 5, 2, 8, -2, 3, ['lethal']] },
        { key: 'plaguemarines', name: 'Plague Marines', kind: 'inf', img: 'units/plague-marines.webp', pts: 80, M: 5, T: 5, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 5, fnp: 5,
          ranged: ['Plague boltgun', 24, 1, 3, 4, 0, 1, ['rapid', 'lethal']], melee: ['Plague knife', 0, 3, 3, 4, 0, 1, ['lethal']] },
        { key: 'poxwalkers', name: 'Poxwalkers', kind: 'inf', img: 'units/poxwalkers.webp', pts: 45, M: 4, T: 3, Sv: 7, inv: 0, W: 1, Ld: 8, OC: 1, models: 10, fnp: 5,
          ranged: null, melee: ['Improvised weapon', 0, 2, 4, 3, 0, 1, []] },
        { key: 'deathshroud', name: 'Deathshroud Terminators', kind: 'inf', img: 'units/deathshroud.webp', pts: 120, M: 4, T: 6, Sv: 2, inv: 4, W: 4, Ld: 6, OC: 1, models: 3, fnp: 5,
          ranged: ['Plaguespurt gauntlet', 12, 3, 0, 4, -1, 1, ['torrent']], melee: ['Manreaper', 0, 3, 3, 8, -2, 3, []] },
        { key: 'plaguebearers', name: 'Plaguebearers', kind: 'inf', img: 'units/plaguebearers.webp', pts: 100, M: 5, T: 5, Sv: 7, inv: 5, W: 2, Ld: 7, OC: 1, models: 10, fnp: 5,
          ranged: null, melee: ['Plaguesword', 0, 2, 4, 4, -1, 1, ['lethal']] }
      ]
    },
    worldeaters: {
      name: 'World Eaters', th: 'เวิลด์ อีทเตอร์', img: 'units/berzerkers.webp',
      rule: { id: 'blood', name: 'Blessings of Khorne', desc: 'ทอยชาร์จ +1 และอาวุธประชิดทุกชิ้นได้ Lethal Hits — Khorne ต้องการเลือด!' },
      units: [
        { key: 'kharn', name: 'Khârn the Betrayer', epic: true, kind: 'char', img: 'characters/kharn.webp', pts: 100, M: 6, T: 5, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 1, models: 1,
          ranged: ['Plasma pistol', 12, 1, 2, 8, -3, 2, ['pistol']], melee: ['Gorechild', 0, 8, 2, 7, -2, 2, []] },
        { key: 'lordjugg', name: 'Lord on Juggernaut', kind: 'char', img: 'units/lord-juggernaut.webp', pts: 100, M: 10, T: 6, Sv: 2, inv: 4, W: 7, Ld: 6, OC: 2, models: 1,
          ranged: ['Plasma pistol', 12, 1, 2, 8, -3, 2, ['pistol']], melee: ['Wrathforged axe', 0, 6, 2, 8, -2, 2, []] },
        { key: 'moe', name: 'Master of Executions', kind: 'char', img: 'units/master-of-executions.webp', pts: 70, M: 6, T: 4, Sv: 3, inv: 0, W: 5, Ld: 6, OC: 1, models: 1,
          ranged: ['Bolt pistol', 12, 1, 3, 4, 0, 1, ['pistol']], melee: ['Axe of dismemberment', 0, 5, 2, 8, -2, 3, []] },
        { key: 'berzerkers', name: 'Khorne Berzerkers', kind: 'inf', img: 'units/berzerkers.webp', pts: 180, M: 6, T: 5, Sv: 3, inv: 0, W: 2, Ld: 6, OC: 2, models: 10, fnp: 6,
          ranged: ['Bolt pistol', 12, 1, 3, 4, 0, 1, ['pistol']], melee: ['Berzerker chainblade', 0, 4, 3, 5, -1, 1, []] },
        { key: 'bloodletters', name: 'Bloodletters', kind: 'inf', img: 'units/bloodletters.webp', pts: 110, M: 7, T: 4, Sv: 7, inv: 5, W: 2, Ld: 7, OC: 2, models: 10,
          ranged: null, melee: ['Hellblade', 0, 2, 3, 5, -2, 1, []] },
        { key: 'dprince', name: 'Daemon Prince of Khorne', kind: 'mon', img: 'units/daemon-prince.webp', pts: 200, M: 8, T: 10, Sv: 2, inv: 4, W: 10, Ld: 6, OC: 3, models: 1,
          ranged: ['Infernal cannon', 24, 3, 2, 5, -1, 2, []], melee: ['Hellforged weapons', 0, 8, 2, 8, -2, 3, []] },
        { key: 'bloodthirster', name: 'Bloodthirster', kind: 'mon', img: 'units/bloodthirster.webp', pts: 340, r: 2.1, M: 12, T: 12, Sv: 2, inv: 4, W: 18, Ld: 6, OC: 5, models: 1, ab: ['fly'],
          ranged: ['Hellfire', 12, 6, 0, 6, -1, 1, ['torrent']], melee: ['Great axe of Khorne', 0, 8, 2, 18, -3, 6, []] }
      ]
    },
    custodes: {
      name: 'Adeptus Custodes', th: 'แอดเดปตัส คัสโตเดส', img: 'units/custodian-guard.webp',
      rule: { id: 'katah', name: "Martial Ka'tah", desc: 'ศิลปะการต่อสู้ของผู้พิทักษ์จักรพรรดิ: อาวุธประชิดทุกชิ้นได้ Sustained Hits 1' },
      units: [
        { key: 'shieldcap', name: 'Shield-Captain', kind: 'char', img: 'units/shield-captain.webp', pts: 130, M: 6, T: 6, Sv: 2, inv: 4, W: 6, Ld: 6, OC: 2, models: 1,
          ranged: ['Guardian spear (ยิง)', 24, 2, 2, 4, -1, 2, ['assault']], melee: ['Guardian spear', 0, 7, 2, 7, -2, 2, []] },
        { key: 'trajann', name: 'Trajann Valoris', epic: true, kind: 'char', img: 'characters/trajann-valoris.webp', pts: 150, M: 6, T: 6, Sv: 2, inv: 4, W: 7, Ld: 6, OC: 2, models: 1,
          ranged: ['Eagle\'s Scream', 18, 2, 2, 5, -1, 3, ['assault']], melee: ['Watcher\'s Axe', 0, 6, 2, 10, -3, 3, []] },
        { key: 'guard', name: 'Custodian Guard', kind: 'inf', img: 'units/custodian-guard.webp', pts: 170, M: 6, T: 6, Sv: 2, inv: 4, W: 3, Ld: 6, OC: 2, models: 4,
          ranged: ['Guardian spear (ยิง)', 24, 2, 2, 4, -1, 2, ['assault']], melee: ['Guardian spear', 0, 5, 2, 7, -2, 2, []] },
        { key: 'allarus', name: 'Allarus Custodians', kind: 'inf', img: 'units/allarus.webp', pts: 130, M: 5, T: 7, Sv: 2, inv: 4, W: 4, Ld: 6, OC: 2, models: 2,
          ranged: ['Balistus grenade launcher', 18, 3, 2, 4, -1, 1, ['blast']], melee: ['Castellan axe', 0, 5, 2, 9, -1, 3, []] },
        { key: 'prosecutors', name: 'Prosecutors (Sisters of Silence)', kind: 'inf', img: 'units/sisters-of-silence.webp', pts: 40, M: 6, T: 3, Sv: 3, inv: 0, W: 1, Ld: 7, OC: 2, models: 5,
          ranged: ['Boltgun', 24, 1, 3, 4, 0, 1, ['rapid']], melee: ['Close combat weapon', 0, 1, 3, 3, 0, 1, []] },
        { key: 'praetors', name: 'Vertus Praetors', kind: 'inf', img: 'units/vertus-praetor.webp', pts: 240, r: 1.6, M: 12, T: 7, Sv: 2, inv: 4, W: 4, Ld: 6, OC: 2, models: 3,
          ranged: ['Salvo launcher', 24, 2, 2, 8, -2, 2, []], melee: ['Interceptor lance', 0, 5, 2, 7, -2, 2, []] },
        { key: 'contemptor', name: 'Contemptor-Achillus Dreadnought', kind: 'veh', img: 'units/contemptor.webp', pts: 155, M: 6, T: 9, Sv: 2, inv: 4, W: 10, Ld: 6, OC: 3, models: 1,
          ranged: ['Achillus dreadspear (ยิง)', 18, 2, 2, 9, -2, 3, ['melta']], melee: ['Achillus dreadspear', 0, 5, 2, 12, -3, 3, []] }
      ]
    }
  };
  Object.keys(F).forEach(k => F[k].units.forEach(u => {
    if (!u.r) u.r = u.kind === 'char' ? 0.85 : (u.kind === 'veh' || u.kind === 'mon') ? 1.7 : u.models >= 10 ? 1.6 : u.models >= 5 ? 1.3 : 1.1;
    u.ab = u.ab || []; u.fnp = u.fnp || 0;
  }));

  /* ฉาก — พิกัดเป็นสัดส่วนของกระดาน (0..1) เพื่อใช้ได้ทั้งโต๊ะเล็กและใหญ่ แล้วสะท้อนจุดกลางให้สมมาตร */
  const MAPS = {
    ruins: { name: 'ซากเมือง', desc: 'ซากตึกหนาแน่น บังสายตาเยอะ เหมาะกับทัพประชิด', pieces: [
      { x: .25, y: .12, w: .14, h: .17, type: 'dense', name: 'ซากตึก' },
      { x: .44, y: .41, w: .12, h: .18, type: 'dense', name: 'ซากโบสถ์', center: true },
      { x: .16, y: .64, w: .12, h: .14, type: 'light', name: 'แนวกระสอบทราย' },
      { x: .35, y: .8, w: .1, h: .14, type: 'dense', name: 'ซากตึก' }] },
    wastes: { name: 'ทุ่งร้าง', desc: 'พื้นที่โล่งเกือบทั้งหมด ทัพยิงไกลได้เปรียบ', pieces: [
      { x: .3, y: .2, w: .1, h: .13, type: 'light', name: 'หลุมระเบิด' },
      { x: .46, y: .43, w: .08, h: .14, type: 'dense', name: 'หินยักษ์', center: true },
      { x: .2, y: .72, w: .1, h: .12, type: 'light', name: 'ซากรถถัง' }] },
    jungle: { name: 'ป่าเดธเวิร์ล', desc: 'ป่าดงดิบกระจายทั่ว ที่กำบังเบาเต็มไปหมด', pieces: [
      { x: .22, y: .1, w: .12, h: .16, type: 'light', name: 'ป่ากินคน' },
      { x: .36, y: .38, w: .1, h: .16, type: 'light', name: 'ป่าทึบ' },
      { x: .45, y: .12, w: .1, h: .12, type: 'dense', name: 'หินผา' },
      { x: .14, y: .62, w: .12, h: .16, type: 'light', name: 'หนองน้ำ' },
      { x: .38, y: .74, w: .1, h: .14, type: 'dense', name: 'ซากวิหาร' }] },
    manufactorum: { name: 'นิคมโรงงาน', desc: 'โรงงาน Mechanicus ผสมทั้งกำแพงทึบและท่อ', pieces: [
      { x: .24, y: .08, w: .16, h: .1, type: 'dense', name: 'โรงหลอม' },
      { x: .24, y: .4, w: .08, h: .2, type: 'dense', name: 'ถังเชื้อเพลิง' },
      { x: .43, y: .44, w: .14, h: .12, type: 'light', name: 'ลานท่อ', center: true },
      { x: .3, y: .74, w: .14, h: .12, type: 'light', name: 'รางลำเลียง' }] }
  };
  const SIZES = {
    500: { name: 'Combat Patrol (500)', board: [44, 30], zone: 10, cp: 1 },
    1000: { name: 'Incursion (1,000)', board: [44, 30], zone: 10, cp: 1 },
    2000: { name: 'Strike Force (2,000)', board: [60, 44], zone: 12, cp: 1 },
    3000: { name: 'Onslaught (3,000)', board: [60, 44], zone: 12, cp: 1 }
  };

  root.TT_DATA = { FACTIONS: F, MAPS, SIZES };
  if (typeof module !== 'undefined') module.exports = root.TT_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
