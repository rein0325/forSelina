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
    sphere: 'radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed 55%, #3b1f8c)',
    ringColor: 'rgba(196,181,253,0.5)',
    ringW: 130, ringH: 28,
    glowColor: 'rgba(124,58,237,0.55)',
    glowSize: 150,
  },
  {
    id: 'confession',
    name: '許願星',
    x: 560,
    yRatio: 0.58,
    sphere: 'radial-gradient(circle at 35% 35%, #fda4af, #ec4899 55%, #831843)',
    ringColor: 'rgba(249,168,212,0.5)',
    ringW: 130, ringH: 28,
    glowColor: 'rgba(236,72,153,0.5)',
    glowSize: 150,
  },
  {
    id: 'dating',
    name: '約會星',
    x: 820,
    yRatio: 0.36,
    sphere: 'radial-gradient(circle at 35% 35%, #6ee7b7, #10b981 55%, #064e3b)',
    ringColor: 'rgba(110,231,183,0.5)',
    ringW: 130, ringH: 28,
    glowColor: 'rgba(16,185,129,0.5)',
    glowSize: 150,
  },
  {
    id: 'love-game',
    name: '愛星',
    x: 1060,
    yRatio: 0.60,
    sphere: 'radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 55%, #7f1d1d)',
    ringColor: 'rgba(252,165,165,0.5)',
    ringW: 130, ringH: 28,
    glowColor: 'rgba(239,68,68,0.5)',
    glowSize: 150,
  },
  {
    id: 'ending',
    name: '第100天',
    x: 1260,
    yRatio: 0.44,
    sphere: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 55%, #78350f)',
    ringColor: 'rgba(253,230,138,0.55)',
    ringW: 140, ringH: 30,
    glowColor: 'rgba(245,158,11,0.55)',
    glowSize: 165,
  },
];

/* ===== 狀態 ===== */
let unlockedCount = 1;   // 一開始只有第一顆
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
  let stars = [];
  let shooters = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 160 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.006,
      color: randomStarColor(),
    }));
  }

  function randomStarColor() {
    const palette = [
      'rgba(255,255,255,',
      'rgba(196,181,253,',
      'rgba(249,168,212,',
      'rgba(253,230,138,',
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function spawnShooter() {
    if (Math.random() > 0.012) return;
    shooters.push({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height * 0.5,
      vx: 4 + Math.random() * 4,
      vy: 2 + Math.random() * 2,
      len: 60 + Math.random() * 60,
      life: 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景漸層
    const bg = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.4, 0,
      canvas.width * 0.5, canvas.height * 0.4, canvas.height * 0.8
    );
    bg.addColorStop(0, '#160d3a');
    bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星點
    stars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + s.a + ')';
      ctx.fill();
    });

    // 流星
    spawnShooter();
    shooters = shooters.filter(sh => sh.life > 0);
    shooters.forEach(sh => {
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * (sh.len / 6), sh.y - sh.vy * (sh.len / 6));
      const grad = ctx.createLinearGradient(
        sh.x, sh.y,
        sh.x - sh.vx * (sh.len / 6), sh.y - sh.vy * (sh.len / 6)
      );
      grad.addColorStop(0, `rgba(255,255,255,${sh.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life -= 0.022;
    });

    if (currentScreen === 'opening') raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ===== 開始旅程按鈕 ===== */
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('universe');
  initUniverseCanvas();
  renderPlanets();
});

/* ===== 宇宙地圖拖曳 ===== */
(function initDrag() {
  const map   = document.getElementById('universe-map');
  const inner = document.getElementById('universe-inner');
  const INNER_W = 1400;
  let dragX = 0, startX = 0, isDragging = false;
  let velX = 0, lastX = 0, lastT = 0;
  let raf;

  function clamp(v) {
    const minX = Math.min(0, window.innerWidth - INNER_W);
    return Math.max(minX, Math.min(0, v));
  }

  function applyX(x) {
    dragX = clamp(x);
    inner.style.transform = `translateX(${dragX}px)`;
  }

  function onStart(cx) {
    isDragging = true;
    startX = cx - dragX;
    lastX  = cx;
    lastT  = Date.now();
    velX   = 0;
    cancelAnimationFrame(raf);
  }

  function onMove(cx) {
    if (!isDragging) return;
    const now = Date.now();
    velX = (cx - lastX) / Math.max(1, now - lastT) * 16;
    lastX = cx; lastT = now;
    applyX(cx - startX);
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    momentum();
  }

  function momentum() {
    if (Math.abs(velX) < 0.3) return;
    velX *= 0.92;
    applyX(dragX + velX);
    raf = requestAnimationFrame(momentum);
  }

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
  if (universeCanvasRunning) return;   // 只初始化一次，避免重複跑多個迴圈
  universeCanvasRunning = true;

  const canvas = document.getElementById('canvas-universe');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shooters = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 200 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.3 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.005,
    }));
  }

  function spawnShooter() {
    if (Math.random() > 0.008) return;
    shooters.push({
      x:   Math.random() * canvas.width * 0.7,
      y:   Math.random() * canvas.height * 0.4,
      vx:  5 + Math.random() * 5,
      vy:  2 + Math.random() * 3,
      len: 80 + Math.random() * 80,
      life: 1,
    });
  }

  function draw() {
    requestAnimationFrame(draw);   // 永遠跑，不判斷 currentScreen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.35, 0,
      canvas.width * 0.5, canvas.height * 0.35, canvas.height * 0.9
    );
    bg.addColorStop(0, '#130c35');
    bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星點
    stars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });

    // 流星
    spawnShooter();
    shooters = shooters.filter(sh => sh.life > 0);
    shooters.forEach(sh => {
      const tailX = sh.x - sh.vx * (sh.len / 5);
      const tailY = sh.y - sh.vy * (sh.len / 5);
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${sh.life})`);
      grad.addColorStop(0.3, `rgba(196,181,253,${sh.life * 0.6})`);
      grad.addColorStop(1, 'rgba(196,181,253,0)');
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${sh.life})`;
      ctx.fill();
      sh.x    += sh.vx;
      sh.y    += sh.vy;
      sh.life -= 0.018;
    });
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ===== 渲染星球 ===== */
function renderPlanets() {
  const inner = document.getElementById('universe-inner');
  inner.innerHTML = '';

  PLANETS.slice(0, unlockedCount).forEach((p, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'planet-wrap';
    wrap.id = 'planet-' + p.id;

    const top = window.innerHeight * p.yRatio;
    wrap.style.left = p.x + 'px';
    wrap.style.top  = top + 'px';

    wrap.innerHTML = `
      <div class="planet-body">
        <div class="planet-glow-pulse" style="
          width:${p.glowSize}px; height:${p.glowSize}px;
          background: radial-gradient(circle, ${p.glowColor}, transparent 70%);
        "></div>
        <div class="planet-sphere" style="background: ${p.sphere};"></div>
        <div class="planet-ring" style="
          width:${p.ringW}px; height:${p.ringH}px;
          border-color: ${p.ringColor};
        "></div>
      </div>
      <div class="planet-label">${p.name}</div>
    `;

    wrap.addEventListener('click', () => enterPlanet(p));
    inner.appendChild(wrap);
  });
}

/* ===== 解鎖下一顆星球 ===== */
function unlockNextPlanet() {
  if (unlockedCount >= PLANETS.length) return;
  unlockedCount++;
  renderPlanets();

  // 讓新星球有出現動畫
  const newId = 'planet-' + PLANETS[unlockedCount - 1].id;
  setTimeout(() => {
    const el = document.getElementById(newId);
    if (el) el.classList.add('appearing');
  }, 50);
}

/* ===== 進入星球 ===== */
let currentLoveGame  = null;
let currentEnding    = null;
let currentFirstMeet = null;
let currentDating    = null;
let currentWishing   = null;

function enterPlanet(planet) {
  if (planet.id === 'first-meet') {
    if (currentFirstMeet) currentFirstMeet.destroy();
    showScreen('first-meet');
    const canvas = document.getElementById('canvas-first-meet');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    currentFirstMeet = FirstMeetScene;
    FirstMeetScene.init(canvas);

    window.onFirstMeetComplete = () => {
      if (currentFirstMeet) { currentFirstMeet.destroy(); currentFirstMeet = null; }
      showScreen('universe');
      unlockNextPlanet();
    };

  } else if (planet.id === 'confession') {
    if (currentWishing) currentWishing.destroy();
    showScreen('wishing');
    const canvas = document.getElementById('canvas-wishing');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    currentWishing = WishingScene;
    WishingScene.init(canvas);

    window.onWishingComplete = () => {
      if (currentWishing) { currentWishing.destroy(); currentWishing = null; }
      showScreen('universe');
      unlockNextPlanet();
    };

  } else if (planet.id === 'ending') {
    if (currentEnding) currentEnding.destroy();
    showScreen('ending');
    const canvas = document.getElementById('canvas-ending');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    currentEnding = EndingScene;
    EndingScene.init(canvas);

  } else if (planet.id === 'love-game') {
    if (currentLoveGame) currentLoveGame.destroy();
    showScreen('love-game');
    const canvas = document.getElementById('canvas-love-game');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    currentLoveGame = LoveGame;
    LoveGame.init(canvas);

    window.onLoveGameComplete = () => {
      if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; }
      showScreen('universe');
      unlockNextPlanet();
    };

    window.onLoveGameLeave = () => {
      if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; }
      showScreen('universe');
    };

  } else if (planet.id === 'dating') {
    if (typeof currentDating !== 'undefined' && currentDating) currentDating.destroy();
    showScreen('dating');
    const canvas = document.getElementById('canvas-dating');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    currentDating = DatingScene;
    DatingScene.init(canvas);

    window.onDatingComplete = () => {
      if (currentDating) { currentDating.destroy(); currentDating = null; }
      showScreen('universe');
      unlockNextPlanet();
    };

  } else {
    document.getElementById('planet-content').innerHTML = `
      <p style="letter-spacing:3px; font-size:18px; margin-bottom:12px;">${planet.name}</p>
      <p style="font-size:13px; color:rgba(240,236,255,0.3); letter-spacing:2px;">（內容製作中）</p>
    `;
    showScreen('planet');
  }
}

/* ===== 返回宇宙 ===== */
document.getElementById('btn-back').addEventListener('click', () => {
  showScreen('universe');
});

document.getElementById('btn-back-love').addEventListener('click', () => {
  if (currentLoveGame) { currentLoveGame.destroy(); currentLoveGame = null; }
  showScreen('universe');
});

/* ===== 開發用：鍵盤解鎖測試（之後移除） ===== */
document.addEventListener('keydown', e => {
  if (e.key === 'u') unlockNextPlanet();
});