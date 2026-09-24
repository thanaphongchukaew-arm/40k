/* =========================================================
   SVG icon sprite — ถูกแทรกเข้า <body> ทุกหน้า
   ใช้งาน: <svg class="i"><use href="#i-dice"></use></svg>
   (แทรกแบบ inline เพื่อให้ทำงานได้ทั้งบนเซิร์ฟเวอร์และเปิดไฟล์ตรง file://)
   ========================================================= */
(function () {
  const icons = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/><path d="M8 7h8M8 11h6"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="M12 8v8M8.5 11.5h7"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><circle cx="8.3" cy="8.3" r="1.2" fill="currentColor"/><circle cx="15.7" cy="15.7" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="15.7" cy="8.3" r="1.2" fill="currentColor"/><circle cx="8.3" cy="15.7" r="1.2" fill="currentColor"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    sword: '<path d="M14.5 3.5H20v5.5L9 20l-2-2 .5-.5-3-3 2-2 3 3z"/><path d="M5 19l-1.5 1.5"/>',
    swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5 12 4h3v3l-2.5 2.5"/><path d="M5 14l-2 2 3 3 2-2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    crosshair: '<circle cx="12" cy="12" r="8"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
    move: '<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
    crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/><path d="M5 19h14"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    mountain: '<path d="M3 20 9.5 8l4 7 2.5-4L21 20z"/><path d="M8 12.5l1.5 1.5 1.5-1.5"/>',
    layers: '<path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5"/><path d="M2 17.5l10 5 10-5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4.5a3 3 0 0 0 3.5 4M16 5h3.5A3 3 0 0 1 16 9"/><path d="M12 13v4M8 21h8M9.5 17h5v4h-5z"/>',
    brush: '<path d="M18.5 3.5 10 12l2 2 8.5-8.5a1.4 1.4 0 0 0-2-2z"/><path d="M9 13c-2.5 0-4 1.5-4 4 0 1.5-1 2.5-2 3 2.5 1 7 .5 8-3z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-right': '<path d="m9 6 6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.8" r=".7" fill="currentColor"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".7" fill="currentColor"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V20h10v-3.4c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8z"/><circle cx="9" cy="11.5" r="1.8"/><circle cx="15" cy="11.5" r="1.8"/><path d="M10.5 20v-2.5M13.5 20v-2.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16.5 14.2A5 5 0 0 1 21.5 19"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10 8v4.5M13.5 8v3M17 8v4.5"/>',
    box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.1 6.1C3.4 7.9 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20v-4h-4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
    calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8 6.5h8v3H8z"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" stroke-width="2.6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7 5-2.5 5 2.5-1.5-7"/>',
    puzzle: '<path d="M9 3h6v3a1.5 1.5 0 1 0 3 0V3h0v6h-3a1.5 1.5 0 1 0 0 3h3v9h-6v-3a1.5 1.5 0 1 0-3 0v3H3v-9h3a1.5 1.5 0 1 0 0-3H3V3z"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    planet: '<circle cx="12" cy="12" r="5.5"/><path d="M4.2 15.5C1.8 17.8 1.3 19.7 2.4 20.4c1.8 1.1 7-1.6 11.6-6.1s7.4-9.4 6.3-11.1c-.7-1-2.7-.6-5 1"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7c-2.5 0-4-1-5.4-3L3 14.5a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
    scroll: '<path d="M7 3h11a2 2 0 0 1 2 2v2h-4"/><path d="M16 7v12a2 2 0 0 1-4 0v-1H4v1a2 2 0 0 0 2 2h8"/><path d="M7 3a2 2 0 0 0-2 2v13"/><path d="M9 8h4M9 12h4"/>',
    wand: '<path d="m4 20 11-11"/><path d="M15 4v3M13.5 5.5h3M19 8v2M18 9h2M18.5 3.5l1 1"/>',
    zap: '<circle cx="12" cy="12" r="9"/><path d="m13 6-4 7h4l-2 5"/>',
    fire: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.6-8.3.6 1.6 1.4 2.6 2.4 3.2C12 6.5 13.4 4.4 15 3c.3 3.4 3.5 5.9 3.5 11.2 0 4-2.6 6.8-6.5 6.8z"/><path d="M12 21c-1.7 0-2.8-1.2-2.8-2.8 0-1.8 1.8-2.8 2.2-4.5 1.2.8 3.4 2.4 3.4 4.5 0 1.6-1.1 2.8-2.8 2.8z"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2.5 2.5 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    emblem: '<path d="M12 4.5 9.8 7.3 12 9.2l2.2-1.9z" fill="currentColor" stroke="none"/><path d="M12 9.5c-1.6 0-2.6 1.1-2.6 2.6 0 1.2.7 2 1.3 2.4v1.7h2.6v-1.7c.6-.4 1.3-1.2 1.3-2.4 0-1.5-1-2.6-2.6-2.6z"/><path d="M9.2 12.3C7 11 4.6 9.2 2.5 6.5c.4 3.7 2 6.5 4.2 8 1.1.8 2.1 1.1 3 1.2"/><path d="M14.8 12.3c2.2-1.3 4.6-3.1 6.7-5.8-.4 3.7-2 6.5-4.2 8-1.1.8-2.1 1.1-3 1.2"/><path d="M5 10.5l3.5 1.2M19 10.5l-3.5 1.2M10.5 19.5 12 18l1.5 1.5"/>'
  };
  const sprite = Object.entries(icons).map(([id, body]) =>
    '<symbol id="i-' + id + '" viewBox="0 0 24 24">' + body + '</symbol>').join('');
  const holder = document.createElement('div');
  holder.style.display = 'none';
  holder.setAttribute('aria-hidden', 'true');
  holder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + sprite + '</svg>';
  document.body.insertBefore(holder, document.body.firstChild);
})();

/* helper สร้าง markup ไอคอน */
window.icon = function (name, cls) {
  return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
};
