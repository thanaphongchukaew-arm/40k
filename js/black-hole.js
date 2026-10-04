/* =========================================================
   Black hole canvas — พื้นหลัง hero ของหน้า Warp เท่านั้น
   Canvas2D ล้วน (ไม่ใช้ WebGL) จำลองจานฝุ่นหมุนรอบหลุมดำ
   ถ้า JS ปิดหรือ canvas ใช้ไม่ได้ จะเห็นภาพ hero เดิมแทนโดยอัตโนมัติ
   (canvas วาดทับภาพ แต่ถ้าไม่มีการวาดเกิดขึ้น ภาพเดิมจะยังมองเห็นได้ปกติ)
   ========================================================= */
(function () {
  if (document.body.dataset.page !== 'warp') return;
  const heroBg = document.querySelector('.page-hero .hero-bg');
  if (!heroBg) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'black-hole-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  heroBg.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BG = '13,14,17';
  const OUTER = [120, 60, 150];   // ม่วง — พลังงาน Warp
  const MID = [192, 52, 60];      // --crimson
  const WARM = [230, 199, 125];   // --gold-soft
  const HOT = [255, 246, 224];    // แกนในสุด เกือบขาว
  const DISK_SQUASH = 0.38;       // มุมมองจานแบบเฉียง

  let w = 1, h = 1, holeR = 1, diskIn = 1, diskOut = 1, originX = 0, originY = 0;

  function resize() {
    const rect = heroBg.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = Math.min(w, h);
    const mobile = w < 700; // จอแคบ: เนื้อหา hero เรียงเต็มความกว้าง ไม่มีที่ว่างฝั่งขวาให้วางจานใหญ่
    const scale = mobile ? 0.6 : 1;
    holeR = base * 0.1 * scale;
    diskIn = holeR * 1.25;
    diskOut = base * 0.52 * scale;
    originX = w * (mobile ? 0.8 : 0.68);
    originY = h * (mobile ? 0.24 : 0.46);
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixRgb = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  function diskColor(t) {
    if (t < 0.45) return mixRgb(OUTER, MID, t / 0.45);
    if (t < 0.8) return mixRgb(MID, WARM, (t - 0.45) / 0.35);
    return mixRgb(WARM, HOT, (t - 0.8) / 0.2);
  }

  const N = 170;
  const particles = [];
  function spawnOuter(p) {
    p.radius = diskOut * rand(0.92, 1);
    p.angle = rand(0, Math.PI * 2);
    p.stray = rand(-1, 1) * holeR * 0.16;
    p.size = rand(0.6, 1.8);
  }
  for (let i = 0; i < N; i++) {
    const p = {};
    spawnOuter(p);
    p.radius = rand(diskIn, diskOut); // กระจายทั่วจานตั้งแต่เริ่ม ไม่ให้ดูว่างตอนโหลด
    particles.push(p);
  }

  function step(dt) {
    for (const p of particles) {
      const ratio = p.radius / diskIn;
      const angSpeed = 2.4 / Math.pow(ratio, 1.5); // ยิ่งใกล้หมุนยิ่งเร็ว (Kepler-like)
      p.angle += angSpeed * dt;
      p.radius -= angSpeed * 6 * dt; // ไหลเข้าหาศูนย์กลางช้า ๆ
      if (p.radius <= diskIn * 0.98) spawnOuter(p);
    }
  }

  function draw() {
    ctx.fillStyle = `rgba(${BG},0.18)`; // เฟดภาพเก่าแทนการเคลียร์ -> เกิดทางยาวแสง
    ctx.fillRect(0, 0, w, h);

    const back = [], front = [];
    for (const p of particles) {
      const x = originX + Math.cos(p.angle) * p.radius;
      const y = originY + Math.sin(p.angle) * p.radius * DISK_SQUASH + p.stray;
      (Math.sin(p.angle) < 0 ? back : front).push([p, x, y]);
    }

    function drawSet(set) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [p, x, y] of set) {
        const t = 1 - (p.radius - diskIn) / (diskOut - diskIn);
        const c = diskColor(Math.max(0, Math.min(1, t)));
        const rgb = `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;
        const r = p.size * (0.9 + t * 1.6);
        // ไม่ใช้ shadowBlur (แพงมากบน canvas2d) ใช้วงนุ่มซ้อนวงสว่างแทนเพื่อให้ได้เอฟเฟกต์เรืองแสงแบบประหยัด
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${0.18 + 0.15 * t})`;
        ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${0.5 + 0.4 * t})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawSet(back);

    const grad = ctx.createRadialGradient(originX, originY, holeR * 0.2, originX, originY, holeR * 1.15);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.85, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(originX, originY, holeR * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ringGrad = ctx.createRadialGradient(originX, originY, holeR * 0.95, originX, originY, holeR * 1.1);
    ringGrad.addColorStop(0, 'rgba(255,246,224,0)');
    ringGrad.addColorStop(0.6, 'rgba(255,246,224,.5)');
    ringGrad.addColorStop(1, 'rgba(255,246,224,0)');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = holeR * 0.12;
    ctx.beginPath();
    ctx.ellipse(originX, originY, holeR * 1.03, holeR * 1.03 * DISK_SQUASH, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();

    drawSet(front);
  }

  let raf = 0, last = 0, running = false;
  function loop(ts) {
    if (!running) return;
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016;
    last = ts;
    step(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running) { running = true; last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, w, h);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduce) draw(); }, 150);
  });

  if (reduce) {
    for (let i = 0; i < 50; i++) step(0.12); // จัดองค์ประกอบนิ่งหนึ่งเฟรม ไม่มีอนิเมชัน
    draw();
  } else {
    let inView = true;
    if ('IntersectionObserver' in window) {
      inView = false;
      new IntersectionObserver(es => {
        inView = es[0].isIntersecting;
        if (inView && !document.hidden) start(); else stop();
      }, { threshold: .01 }).observe(heroBg);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else if (inView) start();
    });
  }
})();
