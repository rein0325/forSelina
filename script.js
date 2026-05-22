/* =========================================
   100天 · 宇宙之旅 — script.js
   ========================================= */

/* ===== 星球設定 ===== */
const PLANETS = [
  {
    id: 'first-meet',
    name: '相遇星',
    x: 260,
    yRatio: 0.42,
    radius: 52,
    colorMain: '#6d28d9',
    colorLight: '#a78bfa',
    colorDark: '#2e1065',
    ringColor: 'rgba(196,181,253,0.55)',
    glowColor: 'rgba(124,58,237,0.45)',
    hasRing: true,
    ringTilt: 0.28,
    hasContinents: true,
    hasStripes: false,
    hasCraters: false,
    isSun: false,
    surfaceIcon: null,
    floatingStars: false,
    volcanoGlow: false,
    satellites: [],
  },
  {
    id: 'confession',
    name: '許願星',
    x: 560,
    yRatio: 0.58,
    radius: 52,
    colorMain: '#e879a0',
    colorLight: '#fda4af',
    colorDark: '#831843',
    ringColor: null,
    glowColor: 'rgba(236,72,153,0.45)',
    hasRing: false,
    hasContinents: false,
    hasStripes: false,
    hasCraters: false,
    isSun: false,
    surfaceIcon: '★',
    surfaceWaves: true,
    floatingStars: true,
    volcanoGlow: false,
    satellites: [],
  },
  {
    id: 'dating',
    name: '約會星',
    x: 820,
    yRatio: 0.36,
    radius: 62,
    colorMain: '#059669',
    colorLight: '#86efac',
    colorDark: '#064e3b',
    ringColor: null,
    glowColor: 'rgba(16,185,129,0.45)',
    hasRing: false,
    hasContinents: false,
    hasStripes: true,
    hasCraters: false,
    isSun: false,
    surfaceIcon: null,
    floatingStars: false,
    volcanoGlow: false,
    satellites: [
      { dist: 1.38, angle: -0.6, r: 7,  color: '#34d399' },
      { dist: 1.55, angle: 2.4,  r: 5,  color: '#6ee7b7' },
    ],
  },
  {
    id: 'love-game',
    name: '愛星',
    x: 1060,
    yRatio: 0.60,
    radius: 52,
    colorMain: '#dc2626',
    colorLight: '#fca5a5',
    colorDark: '#7f1d1d',
    ringColor: null,
    glowColor: 'rgba(239,68,68,0.45)',
    hasRing: false,
    hasContinents: false,
    hasStripes: false,
    hasCraters: true,
    isSun: false,
    surfaceIcon: '♡',
    floatingStars: false,
    volcanoGlow: true,
    satellites: [
      { dist: 1.42, angle: 0.8, r: 8, color: '#fca5a5' },
    ],
  },
  {
    id: 'ending',
    name: '第100天',
    x: 1260,
    yRatio: 0.44,
    radius: 72,
    colorMain: '#f59e0b',
    colorLight: '#fef08a',
    colorDark: '#92400e',
    ringColor: null,
    glowColor: 'rgba(245,158,11,0.55)',
    hasRing: false,
    hasContinents: false,
    hasStripes: false,
    hasCraters: false,
    isSun: true,
    surfaceIcon: null,
    floatingStars: false,
    volcanoGlow: false,
    satellites: [],
  },
];

/* ===== 狀態 ===== */
let unlockedCount = 1;
let currentScreen = 'opening';

/* ===== 畫面切換 ===== */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  currentScreen = id;
}

/* ===== 開場星空 Canvas ===== */
(function initOpeningCanvas() {
  const canvas = document.getElementById('canvas-opening');
  const ctx = canvas.getContext('2d');
  let stars = [], shooters = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }
  function buildStars() {
    const palette = ['rgba(255,255,255,','rgba(196,181,253,','rgba(249,168,212,','rgba(253,230,138,'];
    stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.006,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createRadialGradient(canvas.width*.5, canvas.height*.4, 0, canvas.width*.5, canvas.height*.4, canvas.height*.8);
    bg.addColorStop(0, '#160d3a'); bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.color + s.a + ')'; ctx.fill();
    });
    if (Math.random() > 0.988) shooters.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height*.5, vx: 4+Math.random()*4, vy: 2+Math.random()*2, len: 60+Math.random()*60, life: 1 });
    shooters = shooters.filter(s => s.life > 0);
    shooters.forEach(sh => {
      const g = ctx.createLinearGradient(sh.x, sh.y, sh.x-sh.vx*(sh.len/6), sh.y-sh.vy*(sh.len/6));
      g.addColorStop(0, `rgba(255,255,255,${sh.life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x-sh.vx*(sh.len/6), sh.y-sh.vy*(sh.len/6));
      ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
      sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.022;
    });
    if (currentScreen === 'opening') requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ===== 開始旅程按鈕 ===== */
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('universe');
  initUniverseCanvas();
  initPlanetCanvas();
});

/* ===== 宇宙地圖拖曳 ===== */
(function initDrag() {
  const map = document.getElementById('universe-map');
  const inner = document.getElementById('universe-inner');
  const INNER_W = 1400;
  let dragX = 0, startX = 0, isDragging = false, velX = 0, lastX = 0, lastT = 0, raf;

  function clamp(v) { const minX = Math.min(0, window.innerWidth - INNER_W); return Math.max(minX, Math.min(0, v)); }
  function applyX(x) { dragX = clamp(x); inner.style.transform = `translateX(${dragX}px)`; }
  function onStart(cx) { isDragging = true; startX = cx-dragX; lastX = cx; lastT = Date.now(); velX = 0; cancelAnimationFrame(raf); }
  function onMove(cx) { if (!isDragging) return; const now = Date.now(); velX = (cx-lastX)/Math.max(1,now-lastT)*16; lastX=cx; lastT=now; applyX(cx-startX); }
  function onEnd() { if (!isDragging) return; isDragging = false; momentum(); }
  function momentum() { if (Math.abs(velX) < 0.3) return; velX *= 0.92; applyX(dragX+velX); raf = requestAnimationFrame(momentum); }

  map.addEventListener('mousedown',  e => onStart(e.clientX));
  map.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
  window.addEventListener('mousemove',  e => onMove(e.clientX));
  window.addEventListener('touchmove',  e => onMove(e.touches[0].clientX), { passive: true });
  window.addEventListener('mouseup',  onEnd);
  window.addEventListener('touchend', onEnd);
})();

/* ===== 宇宙背景 Canvas ===== */
let universeCanvasRunning = false;
function initUniverseCanvas() {
  if (universeCanvasRunning) return;
  universeCanvasRunning = true;
  const canvas = document.getElementById('canvas-universe');
  const ctx = canvas.getContext('2d');
  let stars = [], shooters = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; buildStars(); }
  function buildStars() {
    stars = Array.from({ length: 200 }, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.3+0.2, a: Math.random(), da: (Math.random()-0.5)*0.005 }));
  }
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createRadialGradient(canvas.width*.5, canvas.height*.35, 0, canvas.width*.5, canvas.height*.35, canvas.height*.9);
    bg.addColorStop(0, '#130c35'); bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da; if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
    });
    if (Math.random() > 0.992) shooters.push({ x: Math.random()*canvas.width*.7, y: Math.random()*canvas.height*.4, vx: 5+Math.random()*5, vy: 2+Math.random()*3, len: 80+Math.random()*80, life: 1 });
    shooters = shooters.filter(s => s.life > 0);
    shooters.forEach(sh => {
      const tx = sh.x-sh.vx*(sh.len/5), ty = sh.y-sh.vy*(sh.len/5);
      const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${sh.life})`); g.addColorStop(0.3, `rgba(196,181,253,${sh.life*.6})`); g.addColorStop(1, 'rgba(196,181,253,0)');
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(tx, ty);
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.stroke();
      sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.018;
    });
  }
  window.addEventListener('resize', resize);
  resize(); draw();
}

/* ===== 星球 Canvas ===== */
let planetCanvas, planetCtx;
let planetCanvasRunning = false;
const INNER_W = 1400;

function initPlanetCanvas() {
  if (planetCanvasRunning) return;
  planetCanvasRunning = true;

  const inner = document.getElementById('universe-inner');
  planetCanvas = document.createElement('canvas');
  planetCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
  inner.appendChild(planetCanvas);
  planetCtx = planetCanvas.getContext('2d');

  PLANETS.forEach(p => {
    p._rotAngle = Math.random() * Math.PI * 2;
    p._rotSpeed = 0.00025 + Math.random() * 0.00015;
    p._continents = Array.from({ length: 5 }, () => ({
      ox: (Math.random()-0.5) * 1.4,
      oy: (Math.random()-0.5) * 1.6,
      rx: 0.12 + Math.random() * 0.2,
      ry: 0.07 + Math.random() * 0.12,
      rot: Math.random() * Math.PI,
      a: 0.3 + Math.random() * 0.2,
    }));
    if (p.floatingStars) {
      p._floatStars = Array.from({ length: 10 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist:  1.28 + Math.random() * 0.45,
        size:  5 + Math.random() * 5,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.0002 + Math.random() * 0.0002),
        alpha: 0.45 + Math.random() * 0.5,
      }));
    }
    if (p.volcanoGlow) {
      p._volcanos = [{ ox: -0.28, oy: 0.15 }, { ox: 0.22, oy: -0.24 }];
    }
  });

  renderPlanetClickAreas();
  animatePlanets();
}

function animatePlanets() {
  requestAnimationFrame(animatePlanets);
  const t = performance.now();
  const H = window.innerHeight;

  planetCanvas.width  = INNER_W;
  planetCanvas.height = H;
  planetCtx.clearRect(0, 0, INNER_W, H);

  PLANETS.slice(0, unlockedCount).forEach(p => {
    p._rotAngle += p._rotSpeed;
    drawPlanet(planetCtx, p, p.x, H * p.yRatio, t);
  });
}

/* ===== 繪製星球 ===== */
function drawPlanet(ctx, p, cx, cy, t) {
  const r = p.radius;
  const pulse = 1 + Math.sin(t * 0.001 + p.x * 0.01) * 0.018;

  // 外層光暈
  const glowR = r * (p.isSun ? 3.5 : 2.6);
  const glowA = 0.3 + Math.sin(t * 0.0012 + p.x * 0.01) * 0.08;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0,    replaceAlpha(p.glowColor, glowA));
  glow.addColorStop(0.45, replaceAlpha(p.glowColor, glowA * 0.35));
  glow.addColorStop(1,    replaceAlpha(p.glowColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(cx-glowR, cy-glowR, glowR*2, glowR*2);

  // 太陽光芒
  if (p.isSun) drawSunRays(ctx, p, cx, cy, r, t);

  // 土星環後段
  if (p.hasRing) drawRingBack(ctx, p, cx, cy, r);

  // 球體 clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI*2);
  ctx.clip();

  // 基礎漸層
  const sg = ctx.createRadialGradient(cx-r*0.32, cy-r*0.32, 0, cx, cy, r*1.08);
  sg.addColorStop(0,   p.colorLight);
  sg.addColorStop(0.5, p.colorMain);
  sg.addColorStop(1,   p.colorDark);
  ctx.fillStyle = sg;
  ctx.fillRect(cx-r, cy-r, r*2, r*2);

  // 各星球特效
  if (p.hasContinents) drawContinents(ctx, p, cx, cy, r);
  if (p.hasStripes)    drawStripes(ctx, p, cx, cy, r);
  if (p.hasCraters)    drawCraters(ctx, p, cx, cy, r);
  if (p.isSun)         drawSunSurface(ctx, p, cx, cy, r, t);
  if (p.surfaceIcon)   drawSurfaceIcon(ctx, p, cx, cy, r);
  if (p.surfaceWaves)  drawSurfaceWaves(ctx, p, cx, cy, r);
  if (p.volcanoGlow)   drawVolcanos(ctx, p, cx, cy, r, t);

  // 高光
  const shine = ctx.createRadialGradient(cx-r*0.36, cy-r*0.36, 0, cx-r*0.1, cy-r*0.1, r*0.88);
  shine.addColorStop(0,    'rgba(255,255,255,0.42)');
  shine.addColorStop(0.35, 'rgba(255,255,255,0.1)');
  shine.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(cx-r, cy-r, r*2, r*2);

  // 暗部
  const edge = ctx.createRadialGradient(cx, cy, r*0.62, cx, cy, r);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = edge;
  ctx.fillRect(cx-r, cy-r, r*2, r*2);

  ctx.restore();

  // 土星環前段
  if (p.hasRing) drawRingFront(ctx, p, cx, cy, r);

  // 小衛星
  if (p.satellites && p.satellites.length > 0) drawSatellites(ctx, p, cx, cy, r, t);

  // 許願星飄散小星星
  if (p.floatingStars) drawFloatingStars(ctx, p, cx, cy, r, t);

  // 標籤
  ctx.font = '300 13px "Noto Serif TC", serif';
  ctx.fillStyle = 'rgba(220,215,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText(p.name, cx, cy + r + 26);
}

function drawContinents(ctx, p, cx, cy, r) {
  p._continents.forEach((c, i) => {
    const angle = p._rotAngle * (i % 2 === 0 ? 0.9 : -0.6) + i * 1.3;
    const nx = cx + Math.cos(angle) * r * 0.38 * Math.abs(c.ox);
    const ny = cy + r * c.oy * 0.55;
    ctx.globalAlpha = c.a * 0.75;
    ctx.fillStyle = 'rgba(167,139,250,0.6)';
    ctx.beginPath();
    ctx.ellipse(nx, ny, r * c.rx, r * c.ry, angle * 0.4 + c.rot, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawStripes(ctx, p, cx, cy, r) {
  [
    { dy: -0.2,  h: 0.13, a: 0.35 },
    { dy:  0.0,  h: 0.09, a: 0.26 },
    { dy:  0.18, h: 0.07, a: 0.2  },
  ].forEach(s => {
    const sy = cy + r * s.dy;
    const sg = ctx.createLinearGradient(0, sy, 0, sy + r*s.h);
    sg.addColorStop(0,   'rgba(4,120,87,0)');
    sg.addColorStop(0.3, `rgba(4,120,87,${s.a})`);
    sg.addColorStop(0.7, `rgba(4,120,87,${s.a})`);
    sg.addColorStop(1,   'rgba(4,120,87,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(cx-r, sy, r*2, r*s.h);
  });
}

function drawCraters(ctx, p, cx, cy, r) {
  [
    { ox: -0.3, oy: -0.08, r: 0.14 },
    { ox:  0.2, oy:  0.18, r: 0.10 },
    { ox: -0.1, oy:  0.25, r: 0.08 },
  ].forEach(c => {
    const kx = cx + r*c.ox, ky = cy + r*c.oy;
    const cg = ctx.createRadialGradient(kx, ky, 0, kx, ky, r*c.r);
    cg.addColorStop(0,   'rgba(0,0,0,0.22)');
    cg.addColorStop(0.6, 'rgba(0,0,0,0.1)');
    cg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(kx-r*c.r, ky-r*c.r, r*c.r*2, r*c.r*2);
    ctx.beginPath();
    ctx.arc(kx, ky, r*c.r*0.85, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(252,165,165,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawVolcanos(ctx, p, cx, cy, r, t) {
  p._volcanos.forEach((v, i) => {
    const vx = cx + r*v.ox, vy = cy + r*v.oy;
    const pulse = 0.6 + Math.sin(t*0.004 + i*2.1) * 0.35;
    const vg = ctx.createRadialGradient(vx, vy, 0, vx, vy, r*0.18);
    vg.addColorStop(0,   `rgba(251,191,36,${0.9*pulse})`);
    vg.addColorStop(0.4, `rgba(251,191,36,${0.3*pulse})`);
    vg.addColorStop(1,   'rgba(251,191,36,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(vx-r*0.18, vy-r*0.18, r*0.36, r*0.36);
    ctx.beginPath();
    ctx.arc(vx, vy, r*0.055, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,220,60,${pulse})`;
    ctx.fill();
  });
}

function drawSurfaceIcon(ctx, p, cx, cy, r) {
  ctx.font = `${Math.floor(r*0.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.48)';
  ctx.fillText(p.surfaceIcon, cx, cy + r*0.08);
  ctx.textBaseline = 'alphabetic';
}

function drawSurfaceWaves(ctx, p, cx, cy, r) {
  [- 0.12, 0.1].forEach((dy, i) => {
    const wy = cy + r*dy;
    ctx.beginPath();
    for (let x = cx-r*0.8; x <= cx+r*0.8; x += 3) {
      const wyi = wy + Math.sin((x-cx)*0.2 + i*1.5) * 2.5;
      x === cx-r*0.8 ? ctx.moveTo(x, wyi) : ctx.lineTo(x, wyi);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawSunSurface(ctx, p, cx, cy, r, t) {
  for (let i = 0; i < 4; i++) {
    const angle = (i/4)*Math.PI*2 + t*0.0004*(i%2===0?1:-1);
    const sx = cx + Math.cos(angle)*r*0.38, sy = cy + Math.sin(angle)*r*0.3;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r*0.3);
    sg.addColorStop(0, 'rgba(255,200,50,0.2)');
    sg.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx-r*0.3, sy-r*0.3, r*0.6, r*0.6);
  }
}

function drawSunRays(ctx, p, cx, cy, r, t) {
  for (let i = 0; i < 8; i++) {
    const angle = (i/8)*Math.PI*2 + t*0.0003;
    const len = r*(0.38 + Math.sin(t*0.002+i)*0.1);
    const x1 = cx + Math.cos(angle)*(r+8), y1 = cy + Math.sin(angle)*(r+8);
    const x2 = cx + Math.cos(angle)*(r+8+len), y2 = cy + Math.sin(angle)*(r+8+len);
    const rg = ctx.createLinearGradient(x1, y1, x2, y2);
    rg.addColorStop(0, 'rgba(253,230,138,0.55)');
    rg.addColorStop(1, 'rgba(253,230,138,0)');
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle = rg; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
  }
}

function drawRingBack(ctx, p, cx, cy, r) {
  const rw = r*2.05, rh = r*0.35*Math.abs(p.ringTilt)+6;
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI);
  const rg = ctx.createLinearGradient(-rw, 0, rw, 0);
  rg.addColorStop(0,    'rgba(255,255,255,0)');
  rg.addColorStop(0.15, p.ringColor);
  rg.addColorStop(0.5,  p.ringColor.replace('0.55','0.2'));
  rg.addColorStop(0.85, p.ringColor);
  rg.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.strokeStyle = rg; ctx.lineWidth = r*0.18; ctx.stroke();
  ctx.restore();
}

function drawRingFront(ctx, p, cx, cy, r) {
  const rw = r*2.05, rh = r*0.35*Math.abs(p.ringTilt)+6;
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.ellipse(0, 0, rw, rh, 0, Math.PI, 0);
  const rg = ctx.createLinearGradient(-rw, 0, rw, 0);
  rg.addColorStop(0,    'rgba(255,255,255,0)');
  rg.addColorStop(0.15, p.ringColor);
  rg.addColorStop(0.5,  p.ringColor.replace('0.55','0.28'));
  rg.addColorStop(0.85, p.ringColor);
  rg.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.strokeStyle = rg; ctx.lineWidth = r*0.18; ctx.stroke();
  ctx.restore();
}

function drawSatellites(ctx, p, cx, cy, r, t) {
  p.satellites.forEach((s, i) => {
    const angle = s.angle + t*0.0006*(i%2===0?1:-1);
    const sx = cx + Math.cos(angle)*r*s.dist;
    const sy = cy + Math.sin(angle)*r*s.dist*0.55;
    // 軌道線
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.ellipse(0, 0, r*s.dist, r*s.dist*0.55, 0, 0, Math.PI*2);
    ctx.setLineDash([4,8]); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    // 衛星光暈
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r*2.2);
    sg.addColorStop(0, replaceAlpha(p.glowColor, 0.25));
    sg.addColorStop(1, replaceAlpha(p.glowColor, 0));
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sx, sy, s.r*2.2, 0, Math.PI*2); ctx.fill();
    // 衛星本體
    const satG = ctx.createRadialGradient(sx-s.r*0.3, sy-s.r*0.3, 0, sx, sy, s.r);
    satG.addColorStop(0, '#ffffff'); satG.addColorStop(0.4, s.color); satG.addColorStop(1, darken(s.color));
    ctx.fillStyle = satG;
    ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI*2); ctx.fill();
  });
}

function drawFloatingStars(ctx, p, cx, cy, r, t) {
  p._floatStars.forEach((s, i) => {
    s.angle += s.speed;
    const fx = cx + Math.cos(s.angle)*r*s.dist;
    const fy = cy + Math.sin(s.angle)*r*s.dist*0.78;
    const pulse = 0.5 + Math.sin(t*0.003+i*0.9)*0.38;
    ctx.globalAlpha = s.alpha * pulse;
    ctx.font = `${s.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fda4af';
    ctx.fillText('✦', fx, fy);
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  });
}

/* ===== 點擊區域 ===== */
function renderPlanetClickAreas() {
  const inner = document.getElementById('universe-inner');
  inner.querySelectorAll('.planet-wrap').forEach(el => el.remove());
  PLANETS.slice(0, unlockedCount).forEach(p => {
    const wrap = document.createElement('div');
    wrap.className = 'planet-wrap';
    wrap.id = 'planet-' + p.id;
    const top = window.innerHeight * p.yRatio;
    wrap.style.cssText = `position:absolute;left:${p.x}px;top:${top}px;width:${p.radius*2}px;height:${p.radius*2}px;transform:translate(-50%,-50%);cursor:pointer;z-index:2;`;
    wrap.addEventListener('click', () => enterPlanet(p));
    inner.appendChild(wrap);
  });
}

/* ===== 解鎖下一顆 ===== */
function unlockNextPlanet() {
  if (unlockedCount >= PLANETS.length) return;
  unlockedCount++;
  renderPlanetClickAreas();
  const newId = 'planet-' + PLANETS[unlockedCount-1].id;
  setTimeout(() => { const el = document.getElementById(newId); if (el) el.classList.add('appearing'); }, 50);
}

/* ===== DPR 設定 ===== */
function setCanvasDpr(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

/* ===== 進入星球 ===== */
let currentLoveGame = null, currentEnding = null, currentFirstMeet = null, currentDating = null, currentWishing = null;

function enterPlanet(planet) {
  if (planet.id === 'first-meet') {
    if (currentFirstMeet) currentFirstMeet.destroy();
    showScreen('first-meet');
    setCanvasDpr(document.getElementById('canvas-first-meet'));
    currentFirstMeet = FirstMeetScene;
    FirstMeetScene.init(document.getElementById('canvas-first-meet'));
    window.onFirstMeetComplete = () => { if (currentFirstMeet) { currentFirstMeet.destroy(); currentFirstMeet = null; } showScreen('universe'); unlockNextPlanet(); };

  } else if (planet.id === 'confession') {
    if (currentWishing) currentWishing.destroy();
    showScreen('wishing');
    setCanvasDpr(document.getElementById('canvas-wishing'));
    currentWishing = WishingScene;
    WishingScene.init(document.getElementById('canvas-wishing'));
    window.onWishingComplete = () => { if (currentWishing) { currentWishing.destroy(); currentWishing = null; } showScreen('universe'); unlockNextPlanet(); };

  } else if (planet.id === 'ending') {
    if (currentEnding) currentEnding.destroy();
    showScreen('ending');
    setCanvasDpr(document.getElementById('canvas-ending'));
    currentEnding = EndingScene;
    EndingScene.reset();
    EndingScene.init(document.getElementById('canvas-ending'));

  } else if (planet.id === 'love-game') {
    if (currentLoveGame) currentLoveGame.destroy();
    showScreen('love-game');
    setCanvasDpr(document.getElementById('canvas-love-game'));
    currentLoveGame = LoveGame;
    LoveGame.init(document.getElementById('canvas-love-game'));
    window.onLoveGameComplete = () => { if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; } showScreen('universe'); unlockNextPlanet(); };
    window.onLoveGameLeave   = () => { if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; } showScreen('universe'); };

  } else if (planet.id === 'dating') {
    if (currentDating) currentDating.destroy();
    showScreen('dating');
    setCanvasDpr(document.getElementById('canvas-dating'));
    currentDating = DatingScene;
    DatingScene.init(document.getElementById('canvas-dating'));
    window.onDatingComplete = () => { if (currentDating) { currentDating.destroy(); currentDating = null; } showScreen('universe'); unlockNextPlanet(); };

  } else {
    document.getElementById('planet-content').innerHTML = `<p style="letter-spacing:3px;font-size:18px;margin-bottom:12px;">${planet.name}</p><p style="font-size:13px;color:rgba(240,236,255,0.3);letter-spacing:2px;">（內容製作中）</p>`;
    showScreen('planet');
  }
}

/* ===== 返回宇宙 ===== */
document.getElementById('btn-back').addEventListener('click', () => showScreen('universe'));
document.getElementById('btn-back-love').addEventListener('click', () => {
  if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; }
  showScreen('universe');
});

/* ===== 工具 ===== */
function replaceAlpha(colorStr, alpha) {
  if (colorStr.startsWith('rgba')) return colorStr.replace(/[\d.]+\)$/, alpha + ')');
  if (colorStr.startsWith('#')) {
    const r = parseInt(colorStr.slice(1,3),16), g = parseInt(colorStr.slice(3,5),16), b = parseInt(colorStr.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return colorStr;
}
function darken(hex) {
  if (!hex.startsWith('#')) return hex;
  return `rgb(${Math.max(0,parseInt(hex.slice(1,3),16)-60)},${Math.max(0,parseInt(hex.slice(3,5),16)-60)},${Math.max(0,parseInt(hex.slice(5,7),16)-60)})`;
}

/* ===== 開發用（之後移除）===== */
document.addEventListener('keydown', e => { if (e.key === 'u') unlockNextPlanet(); });