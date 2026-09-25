/* =========================================================
   ข้อมูลยูนิตตัวอย่างสำหรับหน้าจัดทีม (army-builder)
   role: char = ตัวละคร, epic = ตัวละครมีชื่อ (Epic Hero), line = Battleline,
         inf = ทหารราบ, veh = ยานพาหนะ, knight = Knight ขนาดใหญ่ (มีคีย์เวิร์ด CHARACTER จึงเป็นแม่ทัพได้), mon = สัตว์ประหลาด/หุ่นยักษ์, trans = ยานขนส่ง (Dedicated Transport)
   pts = แต้มโดยประมาณเพื่อการเรียนรู้เท่านั้น — แต้มจริงเปลี่ยนตามเอกสาร Munitorum Field Manual
         ของ Games Workshop ให้เช็คในแอป Warhammer 40,000 เสมอ (ผู้ใช้แก้ตัวเลขได้ในหน้าเว็บ)
   ========================================================= */
window.ARMY_SIZES = {
  incursion: { label: 'Incursion', pts: 1000, limit: 2, enh: 2 },
  strike: { label: 'Strike Force', pts: 2000, limit: 3, enh: 4 }
};
window.ARMY_UNITS = {
  'space-marines': [
    ['Captain', 'char', 80], ['Lieutenant', 'char', 65], ['Librarian', 'char', 75], ['Chaplain', 'char', 70],
    ['Marneus Calgar', 'epic', 200], ['Intercessor Squad', 'line', 80], ['Assault Intercessor Squad', 'line', 75], ['Heavy Intercessor Squad', 'inf', 100],
    ['Hellblaster Squad', 'inf', 110], ['Terminator Squad', 'inf', 170], ['Scout Squad', 'inf', 70], ['Redemptor Dreadnought', 'veh', 210],
    ['Repulsor', 'trans', 180], ['Impulsor', 'trans', 80], ['Predator Destructor', 'veh', 130], ['Land Raider', 'veh', 240]
  ],
  'ultramarines': [
    ['Captain', 'char', 80], ['Lieutenant', 'char', 65], ['Marneus Calgar', 'epic', 200], ['Roboute Guilliman', 'epic', 340], ['Chief Librarian Tigurius', 'epic', 75],
    ['Captain Titus', 'epic', 85], ['Intercessor Squad', 'line', 80], ['Assault Intercessor Squad', 'line', 75], ['Hellblaster Squad', 'inf', 110],
    ['Terminator Squad', 'inf', 170], ['Redemptor Dreadnought', 'veh', 210], ['Impulsor', 'trans', 80]
  ],
  'blood-angels': [
    ['Captain', 'char', 80], ['Sanguinary Priest', 'char', 80], ['Commander Dante', 'epic', 130], ['Mephiston', 'epic', 120], ['Lemartes', 'epic', 100],
    ['Assault Intercessor Squad', 'line', 75], ['Intercessor Squad', 'line', 80], ['Death Company Marines', 'inf', 85], ['Sanguinary Guard', 'inf', 125],
    ['Baal Predator', 'veh', 125], ['Redemptor Dreadnought', 'veh', 210], ['Impulsor', 'trans', 80]
  ],
  'dark-angels': [
    ['Captain', 'char', 80], ['Lion El\'Jonson', 'epic', 315], ['Azrael', 'epic', 105], ['Belial', 'epic', 90], ['Ezekiel', 'epic', 75],
    ['Intercessor Squad', 'line', 80], ['Assault Intercessor Squad', 'line', 75], ['Deathwing Knights', 'inf', 250], ['Deathwing Terminator Squad', 'inf', 200],
    ['Ravenwing Black Knights', 'inf', 80], ['Land Speeder Vengeance', 'veh', 140], ['Impulsor', 'trans', 80]
  ],
  'space-wolves': [
    ['Wolf Guard Battle Leader', 'char', 70], ['Wolf Priest', 'char', 70], ['Logan Grimnar', 'epic', 110], ['Ragnar Blackmane', 'epic', 100], ['Njal Stormcaller', 'epic', 85],
    ['Bjorn the Fell-Handed', 'epic', 170], ['Blood Claws', 'line', 135], ['Grey Hunters', 'line', 180], ['Wulfen', 'inf', 180],
    ['Thunderwolf Cavalry', 'inf', 115], ['Redemptor Dreadnought', 'veh', 210], ['Impulsor', 'trans', 80]
  ],
  'black-templars': [
    ['Marshal', 'char', 80], ['Chaplain', 'char', 70], ['High Marshal Helbrecht', 'epic', 120], ['Chaplain Grimaldus', 'epic', 110], ['Emperor\'s Champion', 'epic', 80],
    ['Primaris Crusader Squad', 'line', 160], ['Intercessor Squad', 'line', 80], ['Sword Brethren', 'inf', 110], ['Terminator Squad', 'inf', 170],
    ['Land Raider Crusader', 'veh', 220], ['Impulsor', 'trans', 80]
  ],
  'deathwatch': [
    ['Watch Master', 'char', 110], ['Watch Captain Artemis', 'epic', 65], ['Intercessor Squad', 'line', 80], ['Kill Team (Veterans)', 'inf', 100],
    ['Deathwatch Terminator Squad', 'inf', 190], ['Corvus Blackstar', 'veh', 150], ['Redemptor Dreadnought', 'veh', 210], ['Impulsor', 'trans', 80]
  ],
  'grey-knights': [
    ['Brother-Captain', 'char', 90], ['Librarian', 'char', 85], ['Kaldor Draigo', 'epic', 200], ['Castellan Crowe', 'epic', 90],
    ['Strike Squad', 'line', 150], ['Terminator Squad', 'inf', 190], ['Paladin Squad', 'inf', 250], ['Purifier Squad', 'inf', 125],
    ['Nemesis Dreadknight', 'mon', 190], ['Land Raider', 'veh', 240]
  ],
  'astra-militarum': [
    ['Company Commander (Cadian Command Squad)', 'char', 65], ['Lord Solar Leontus', 'epic', 250], ['Ursula Creed', 'epic', 80], ['Commissar', 'char', 30],
    ['Cadian Shock Troops', 'line', 65], ['Catachan Jungle Fighters', 'line', 60], ['Death Korps of Krieg', 'line', 65], ['Kasrkin', 'inf', 110],
    ['Leman Russ Battle Tank', 'veh', 180], ['Rogal Dorn Battle Tank', 'veh', 240], ['Basilisk', 'veh', 140], ['Chimera', 'trans', 80]
  ],
  'adeptus-custodes': [
    ['Shield-Captain', 'char', 120], ['Trajann Valoris', 'epic', 140], ['Custodian Guard', 'line', 170], ['Allarus Custodians', 'inf', 130],
    ['Custodian Wardens', 'inf', 210], ['Vertus Praetors', 'inf', 150], ['Prosecutors (Sisters of Silence)', 'inf', 40], ['Contemptor-Achillus Dreadnought', 'veh', 145],
    ['Venerable Land Raider', 'veh', 240]
  ],
  'adepta-sororitas': [
    ['Canoness', 'char', 60], ['Palatine', 'char', 50], ['Saint Celestine', 'epic', 150], ['Morvenn Vahl', 'epic', 170],
    ['Battle Sisters Squad', 'line', 105], ['Dominion Squad', 'inf', 115], ['Retributor Squad', 'inf', 115], ['Seraphim Squad', 'inf', 80],
    ['Paragon Warsuits', 'veh', 170], ['Exorcist', 'veh', 210], ['Immolator', 'trans', 115]
  ],
  'adeptus-mechanicus': [
    ['Tech-Priest Dominus', 'char', 70], ['Belisarius Cawl', 'epic', 150], ['Skitarii Rangers', 'line', 85], ['Skitarii Vanguard', 'line', 90],
    ['Sicarian Infiltrators', 'inf', 100], ['Kataphron Breachers', 'inf', 160], ['Onager Dunecrawler', 'veh', 145], ['Skorpius Disintegrator', 'veh', 185],
    ['Skorpius Dunerider', 'trans', 85]
  ],
  'imperial-knights': [
    ['Canis Rex', 'epic', 385], ['Knight Paladin', 'knight', 375], ['Knight Errant', 'knight', 370], ['Knight Gallant', 'knight', 355],
    ['Knight Crusader', 'knight', 400], ['Armiger Warglaive', 'mon', 140], ['Armiger Helverin', 'mon', 140]
  ],
  'imperial-agents': [
    ['Inquisitor', 'char', 55], ['Inquisitor Greyfax', 'epic', 65], ['Inquisitor Eisenhorn', 'epic', 75], ['Vindicare Assassin', 'char', 90],
    ['Callidus Assassin', 'char', 90], ['Eversor Assassin', 'char', 90], ['Culexus Assassin', 'char', 90], ['Inquisitorial Agents', 'line', 50],
    ['Imperial Navy Breachers', 'inf', 90], ['Exaction Squad (Arbites)', 'inf', 90]
  ],
  'chaos-space-marines': [
    ['Chaos Lord', 'char', 90], ['Sorcerer', 'char', 70], ['Abaddon the Despoiler', 'epic', 270], ['Huron Blackheart', 'epic', 90], ['Haarken Worldclaimer', 'epic', 90],
    ['Legionaries', 'line', 90], ['Cultist Mob', 'line', 50], ['Chosen', 'inf', 125], ['Chaos Terminator Squad', 'inf', 180],
    ['Helbrute', 'veh', 140], ['Forgefiend', 'veh', 150], ['Rhino', 'trans', 75]
  ],
  'death-guard': [
    ['Lord of Contagion', 'char', 115], ['Malignant Plaguecaster', 'char', 65], ['Mortarion', 'epic', 380], ['Typhus', 'epic', 80],
    ['Plague Marines', 'line', 95], ['Poxwalkers', 'line', 50], ['Blightlord Terminators', 'inf', 160], ['Deathshroud Terminators', 'inf', 120],
    ['Plagueburst Crawler', 'veh', 180], ['Foetid Bloat-drone', 'veh', 90], ['Rhino', 'trans', 75]
  ],
  'thousand-sons': [
    ['Exalted Sorcerer', 'char', 80], ['Infernal Master', 'char', 85], ['Magnus the Red', 'epic', 430], ['Ahriman', 'epic', 110],
    ['Rubric Marines', 'line', 100], ['Tzaangors', 'line', 65], ['Scarab Occult Terminators', 'inf', 185], ['Mutalith Vortex Beast', 'mon', 150],
    ['Heldrake', 'veh', 205], ['Rhino', 'trans', 75]
  ],
  'world-eaters': [
    ['World Eaters Master of Executions', 'char', 75], ['Lord on Juggernaut', 'char', 90], ['Angron', 'epic', 350], ['Khârn the Betrayer', 'epic', 100],
    ['Khorne Berzerkers', 'line', 180], ['Jakhals', 'line', 65], ['Eightbound', 'inf', 135], ['Exalted Eightbound', 'inf', 150],
    ['Chaos Land Raider', 'veh', 240], ['Rhino', 'trans', 75]
  ],
  'emperors-children': [
    ['Lord Exultant', 'char', 90], ['Daemon Prince of Slaanesh', 'char', 180], ['Fulgrim', 'epic', 340], ['Lucius the Eternal', 'epic', 120], ['Fabius Bile', 'epic', 85],
    ['Infractors', 'line', 85], ['Tormentors', 'line', 80], ['Noise Marines', 'inf', 100], ['Flawless Blades', 'inf', 150], ['Rhino', 'trans', 75]
  ],
  'chaos-daemons': [
    ['Bloodthirster', 'mon', 330], ['Great Unclean One', 'mon', 260], ['Lord of Change', 'mon', 270], ['Keeper of Secrets', 'mon', 230],
    ['Be\'lakor', 'epic', 350], ['Bloodletters', 'line', 110], ['Plaguebearers', 'line', 110], ['Pink Horrors', 'line', 125], ['Daemonettes', 'line', 90],
    ['Flesh Hounds', 'inf', 75], ['Soul Grinder', 'mon', 180]
  ],
  'chaos-knights': [
    ['Knight Abominant', 'knight', 360], ['Knight Desecrator', 'knight', 375], ['Knight Despoiler', 'knight', 365], ['Knight Rampager', 'knight', 390],
    ['War Dog Karnivore', 'mon', 140], ['War Dog Stalker', 'mon', 140], ['War Dog Huntsman', 'mon', 150]
  ],
  'aeldari': [
    ['Farseer', 'char', 70], ['Autarch', 'char', 75], ['Eldrad Ulthran', 'epic', 110], ['Asurmen', 'epic', 125], ['Jain Zar', 'epic', 115], ['Avatar of Khaine', 'epic', 300],
    ['Guardian Defenders', 'line', 100], ['Dire Avengers', 'inf', 80], ['Howling Banshees', 'inf', 95], ['Fire Dragons', 'inf', 120],
    ['Wraithlord', 'mon', 140], ['Wave Serpent', 'trans', 120]
  ],
  'drukhari': [
    ['Archon', 'char', 75], ['Succubus', 'char', 50], ['Lelith Hesperax', 'epic', 85], ['Drazhar', 'epic', 110], ['Urien Rakarth', 'epic', 75],
    ['Kabalite Warriors', 'line', 110], ['Wyches', 'line', 90], ['Incubi', 'inf', 75], ['Mandrakes', 'inf', 70], ['Ravager', 'veh', 105], ['Raider', 'trans', 80]
  ],
  'orks': [
    ['Warboss', 'char', 75], ['Big Mek', 'char', 65], ['Painboy', 'char', 70], ['Ghazghkull Thraka', 'epic', 235], ['Boss Snikrot', 'epic', 70], ['Mad Dok Grotsnik', 'epic', 55],
    ['Boyz', 'line', 85], ['Gretchin', 'line', 40], ['Nobz', 'inf', 105], ['Meganobz', 'inf', 120], ['Kommandos', 'inf', 120],
    ['Deff Dread', 'veh', 120], ['Battlewagon', 'trans', 160], ['Trukk', 'trans', 70]
  ],
  'necrons': [
    ['Overlord', 'char', 85], ['Technomancer', 'char', 80], ['Imotekh the Stormlord', 'epic', 100], ['Trazyn the Infinite', 'epic', 75], ['Orikan the Diviner', 'epic', 80], ['The Silent King', 'epic', 400],
    ['Necron Warriors', 'line', 90], ['Immortals', 'line', 70], ['Lychguard', 'inf', 85], ['Skorpekh Destroyers', 'inf', 90],
    ['Canoptek Doomstalker', 'mon', 145], ['Doomsday Ark', 'veh', 200], ['Ghost Ark', 'trans', 115]
  ],
  'tau-empire': [
    ['Commander in Coldstar', 'char', 95], ['Cadre Fireblade', 'char', 50], ['Commander Shadowsun', 'epic', 100], ['Commander Farsight', 'epic', 90], ['Ethereal', 'char', 50],
    ['Strike Team', 'line', 75], ['Breacher Team', 'line', 90], ['Crisis Battlesuits', 'inf', 130], ['Stealth Battlesuits', 'inf', 60],
    ['Broadside Battlesuits', 'mon', 90], ['Riptide Battlesuit', 'mon', 190], ['Hammerhead Gunship', 'veh', 145], ['Devilfish', 'trans', 85]
  ],
  'tyranids': [
    ['Hive Tyrant', 'mon', 200], ['Winged Hive Tyrant', 'mon', 190], ['The Swarmlord', 'epic', 220], ['Old One Eye', 'epic', 150], ['Deathleaper', 'epic', 80],
    ['Termagants', 'line', 60], ['Hormagaunts', 'line', 65], ['Tyranid Warriors', 'inf', 75], ['Genestealers', 'inf', 75], ['Carnifexes', 'mon', 125],
    ['Tyrannofex', 'mon', 200], ['Tyrannocyte', 'trans', 105]
  ],
  'genestealer-cults': [
    ['Patriarch', 'char', 75], ['Magus', 'char', 50], ['Primus', 'char', 80], ['Acolyte Iconward', 'char', 50],
    ['Neophyte Hybrids', 'line', 65], ['Acolyte Hybrids', 'inf', 70], ['Purestrain Genestealers', 'inf', 75], ['Aberrants', 'inf', 135],
    ['Goliath Rockgrinder', 'veh', 115], ['Goliath Truck', 'trans', 85]
  ],
  'leagues-of-votann': [
    ['Kâhl', 'char', 75], ['Einhyr Champion', 'char', 70], ['Ûthar the Destined', 'epic', 90], ['Grimnyr', 'char', 65],
    ['Hearthkyn Warriors', 'line', 100], ['Einhyr Hearthguard', 'inf', 150], ['Hernkyn Pioneers', 'inf', 75], ['Brôkhyr Thunderkyn', 'inf', 90],
    ['Hekaton Land Fortress', 'veh', 240], ['Sagitaur', 'trans', 100]
  ]
};

/* ตรวจความถูกต้องของรายชื่อกองทัพ — ใช้ร่วมกับหน้าเว็บและการทดสอบ
   roster: [{ name, role, pts, qty }], opts: { size, warlord (index), enh (จำนวน) }  */
window.checkArmy = function (roster, opts) {
  const size = window.ARMY_SIZES[opts.size] || window.ARMY_SIZES.strike;
  const issues = [], ok = [];
  const total = roster.reduce((a, u) => a + (Number(u.pts) || 0) * (u.qty || 1), 0);
  if (!roster.length) issues.push('ยังไม่มียูนิตในกองทัพ');
  if (total > size.pts) issues.push('แต้มรวม ' + total + ' เกินขนาดเกม ' + size.label + ' (' + size.pts + ' แต้ม) อยู่ ' + (total - size.pts));
  else if (roster.length) ok.push('แต้มรวม ' + total + ' / ' + size.pts);
  const count = {};
  roster.forEach(u => { count[u.name] = (count[u.name] || 0) + (u.qty || 1); });
  Object.keys(count).forEach(name => {
    const u = roster.find(x => x.name === name);
    const lim = u.role === 'epic' ? 1 : (u.role === 'line' || u.role === 'trans') ? size.limit * 2 : size.limit;
    if (count[name] > lim) issues.push(name + ' ใส่ได้สูงสุด ' + lim + ' ยูนิต (ตอนนี้ ' + count[name] + ')' + (u.role === 'epic' ? ' — Epic Hero มีได้ชื่อละ 1' : ''));
  });
  const isChar = u => u.role === 'char' || u.role === 'epic' || u.role === 'knight';
  const chars = roster.filter(isChar);
  if (roster.length && !chars.length) issues.push('ต้องมีตัวละคร (Character) อย่างน้อย 1 ตัวเพื่อเป็นแม่ทัพ (Warlord)');
  else if (roster.length && (opts.warlord == null || !roster[opts.warlord] || !isChar(roster[opts.warlord]))) issues.push('ยังไม่ได้เลือกแม่ทัพ (Warlord) — ต้องเป็นตัวละคร');
  else if (roster.length) ok.push('แม่ทัพ: ' + roster[opts.warlord].name);
  if ((opts.enh || 0) > size.enh) issues.push('Enhancement ใส่ได้สูงสุด ' + size.enh + ' ชิ้นในขนาดเกมนี้ (ตอนนี้ ' + opts.enh + ')');
  return { total, limit: size.pts, issues, ok, valid: issues.length === 0 };
};
/* ทัพสำเร็จรูป: สร้างรายชื่อทัพที่ถูกกติกาจากรายการยูนิตของทัพนั้น
   style: 'balanced' = สมดุล (ตัวละครทั่วไป + Battleline + ยูนิตหลากประเภท)
          'heroes'   = ฮีโร่ดัง (ใส่ Epic Hero ของทัพเป็นแม่ทัพ)
   คืน { roster: [{name, role, pts, qty, enh}], warlord } */
window.ARMY_PRESET_STYLES = { balanced: 'ทัพสมดุล', heroes: 'ทัพฮีโร่ดัง' };
window.armyPreset = function (fid, sizeKey, style) {
  const list = (window.ARMY_UNITS[fid] || []).map(u => ({ name: u[0], role: u[1], pts: u[2] }));
  const size = window.ARMY_SIZES[sizeKey] || window.ARMY_SIZES.strike, L = size.pts;
  const picks = [], cnt = {};
  const lim = u => u.role === 'epic' ? 1 : (u.role === 'line' || u.role === 'trans') ? size.limit * 2 : size.limit;
  const total = () => picks.reduce((a, u) => a + u.pts, 0);
  const fits = u => (cnt[u.name] || 0) < lim(u) && total() + u.pts <= L;
  const add = u => { picks.push(u); cnt[u.name] = (cnt[u.name] || 0) + 1; };
  const epics = list.filter(u => u.role === 'epic').sort((a, b) => b.pts - a.pts);
  if (style === 'heroes' && epics.length) {
    epics.filter(u => u.pts <= L * 0.4).slice(0, sizeKey === 'strike' ? 2 : 1).forEach(u => { if (fits(u)) add(u); });
    if (!picks.length) add(epics[epics.length - 1]);
  } else {
    const c = list.find(u => u.role === 'char') || list.filter(u => u.role === 'knight').sort((a, b) => a.pts - b.pts)[0] || epics[epics.length - 1];
    if (c) add(c);
  }
  const line = list.filter(u => u.role === 'line');
  if (line.length) { for (let i = 0; i < 2; i++) { const u = line[i % line.length]; if (fits(u)) add(u); } }
  else { const u = list.filter(x => x.role === 'inf').sort((a, b) => a.pts - b.pts)[0]; if (u && fits(u)) add(u); }
  /* เติมให้หลากหลาย: วนตามประเภท เลือกยูนิตที่ใส่ไปน้อยที่สุดก่อน */
  const order = ['inf', 'veh', 'mon', 'knight', 'line', 'inf', 'trans', 'char'];
  for (let guard = 0; guard < 60; guard++) {
    let added = false;
    for (const r of order) {
      const c = list.filter(u => u.role === r && fits(u)).sort((a, b) => (cnt[a.name] || 0) - (cnt[b.name] || 0) || b.pts - a.pts)[0];
      if (c) { add(c); added = true; }
    }
    if (!added) {
      const any = list.filter(u => u.role !== 'epic' && fits(u)).sort((a, b) => b.pts - a.pts)[0];
      if (!any) break; add(any);
    }
  }
  /* รวมยูนิตซ้ำเป็นจำนวน (ตัวละครแยกบรรทัด) */
  const roster = [];
  picks.forEach(u => {
    const isChar = u.role === 'char' || u.role === 'epic' || u.role === 'knight';
    const ex = !isChar && roster.find(x => x.name === u.name);
    if (ex) ex.qty++; else roster.push({ name: u.name, role: u.role, pts: u.pts, qty: 1, enh: false });
  });
  const R = ['epic', 'char', 'knight', 'line', 'inf', 'mon', 'veh', 'trans'];
  roster.sort((a, b) => R.indexOf(a.role) - R.indexOf(b.role));
  const warlord = roster.findIndex(u => u.role === (style === 'heroes' ? 'epic' : 'char'));
  return { roster, warlord: warlord > -1 ? warlord : roster.findIndex(u => u.role === 'char' || u.role === 'epic' || u.role === 'knight') };
};
if (typeof module !== 'undefined') module.exports = { ARMY_UNITS: window.ARMY_UNITS, ARMY_SIZES: window.ARMY_SIZES, checkArmy: window.checkArmy, armyPreset: window.armyPreset };
