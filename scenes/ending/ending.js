/* =========================================
   第100天 — 最終結局
   ========================================= */

const EndingScene = (() => {

  let canvas, ctx, W, H;
  let animRaf;
  let phase = 'darken'; // darken → fireworks → text
  let phaseTimer = 0;
  let particles = [];
  let textAlpha = 0;
  let overlayAlpha = 0;
  let stars = [];
  let lastTime = 0;

  /* ===== 初始化 ===== */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    resize();
    reset();
    // 立刻畫一幀背景確認 canvas 正常
    draw();
    lastTime = performance.now();
    animRaf  = requestAnimationFrame(loop);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function reset() {
    phase        = 'darken';
    phaseTimer   = 0;
    particles    = [];
    textAlpha    = 0;
    overlayAlpha = 0;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 180 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.3 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.004,
    }));
  }

  /* ===== 煙火 ===== */
  function launchFirework() {
    const x = W * (0.15 + Math.random() * 0.7);
    const y = H * (0.12 + Math.random() * 0.38);
    const palette = [
      '#f9a8d4', '#c4b5fd', '#fde68a',
      '#6ee7b7', '#fca5a5', '#a5f3fc',
    ];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const count = 30 + Math.floor(Math.random() * 14);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2.2 + Math.random() * 3.8;
      particles.push({
        x, y,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        alpha:   1,
        color,
        size:    2.2 + Math.random() * 2.2,
        gravity: 0.055,
        trail:   [],
        isHeart: Math.random() > 0.5,
      });
    }
  }

  /* ===== 主迴圈 ===== */
  function loop(ts) {
    animRaf = requestAnimationFrame(loop);
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;
    phaseTimer += dt;
    update();
    draw();
  }

  function update() {
    if (phase === 'darken') {
      overlayAlpha = Math.min(0.55, phaseTimer / 800 * 0.55);
      if (phaseTimer > 800) { phase = 'fireworks'; phaseTimer = 0; }
    }

    if (phase === 'fireworks') {
      // 每幀都有機會發射，確保一定看得到
      if (phaseTimer % 500 < 18) launchFirework();
      if (phaseTimer > 3500) { phase = 'text'; phaseTimer = 0; }
    }

    if (phase === 'text') {
      if (phaseTimer % 1000 < 18) launchFirework();
      textAlpha = Math.min(1, phaseTimer / 1800);
    }

    // 粒子物理
    particles.forEach(p => {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 5) p.trail.shift();
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.97;
      p.alpha -= 0.015;
    });
    particles = particles.filter(p => p.alpha > 0);
  }

  /* ===== 繪圖 ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 背景
    const bg = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, H*0.95);
    bg.addColorStop(0, '#130c35');
    bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 星點（暗化時變暗）
    stars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * (1 - overlayAlpha * 0.65)})`;
      ctx.fill();
    });

    // 暗化遮罩
    if (overlayAlpha > 0) {
      ctx.fillStyle = `rgba(4,3,18,${overlayAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    drawParticles();

    if (phase === 'text' && textAlpha > 0) {
      drawEndText();
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      // 拖尾
      for (let i = 1; i < p.trail.length; i++) {
        const ta = (i / p.trail.length) * p.alpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
        ctx.strokeStyle = hexToRgba(p.color, ta);
        ctx.lineWidth = p.size * 0.45;
        ctx.stroke();
      }

      ctx.globalAlpha = p.alpha;
      if (p.isHeart) {
        drawHeartIcon(p.x, p.y, p.size, p.color);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  function drawHeartIcon(x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.4);
    ctx.bezierCurveTo(-r*0.1, -r*0.2, -r, -r*0.2, -r, r*0.2);
    ctx.bezierCurveTo(-r, r*0.7, 0, r*1.2, 0, r*1.2);
    ctx.bezierCurveTo(0, r*1.2, r, r*0.7, r, r*0.2);
    ctx.bezierCurveTo(r, -r*0.2, r*0.1, -r*0.2, 0, r*0.4);
    ctx.fill();
    ctx.restore();
  }

  function drawEndText() {
    const cx  = W / 2;
    const baseY = H * 0.42;

    const lines = [
      { text: '下一個紀念日',  size: 22, weight: '300', type: 'soft',     dy: 0   },
      { text: '也要請多指教',  size: 22, weight: '300', type: 'soft',     dy: 46  },
      { text: '我的寶 ❤️',    size: 26, weight: '500', type: 'gradient', dy: 104 },
      { text: '永遠愛你',      size: 19, weight: '300', type: 'pink',     dy: 158 },
    ];

    lines.forEach((line, i) => {
      const lineAlpha = Math.max(0, Math.min(1, textAlpha * 1.8 - i * 0.3));
      if (lineAlpha <= 0) return;

      ctx.textAlign    = 'center';
      ctx.font         = `${line.weight} ${line.size}px 'Noto Serif TC', serif`;
      ctx.shadowColor  = 'rgba(196,181,253,0.55)';
      ctx.shadowBlur   = 20;

      if (line.type === 'gradient') {
        const g = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
        g.addColorStop(0,   `rgba(196,181,253,${lineAlpha})`);
        g.addColorStop(0.5, `rgba(249,168,212,${lineAlpha})`);
        g.addColorStop(1,   `rgba(253,230,138,${lineAlpha})`);
        ctx.fillStyle = g;
      } else if (line.type === 'pink') {
        ctx.fillStyle = `rgba(249,168,212,${lineAlpha})`;
        ctx.shadowColor = 'rgba(236,72,153,0.4)';
      } else {
        ctx.fillStyle = `rgba(230,225,255,${lineAlpha})`;
      }

      ctx.fillText(line.text, cx, baseY + line.dy);
      ctx.shadowBlur = 0;
    });

    // 四角裝飾星
    if (textAlpha > 0.75) {
      const deco = (textAlpha - 0.75) / 0.25;
      const t    = Date.now() * 0.0016;
      [
        { x: cx - 100, y: baseY - 22 },
        { x: cx + 100, y: baseY - 22 },
        { x: cx - 70,  y: baseY + 175 },
        { x: cx + 70,  y: baseY + 175 },
      ].forEach((pos, i) => {
        const pulse = 0.45 + Math.sin(t + i * 1.3) * 0.35;
        ctx.globalAlpha = deco * pulse;
        ctx.font        = '13px sans-serif';
        ctx.fillStyle   = '#fde68a';
        ctx.textAlign   = 'center';
        ctx.fillText('✦', pos.x, pos.y);
        ctx.globalAlpha = 1;
      });
    }

    // 文字完全顯示後，加入返回按鈕
    if (textAlpha >= 1 && !document.getElementById('btn-back-universe')) {
      const btn = document.createElement('button');
      btn.id = 'btn-back-universe';
      btn.textContent = '✦ 返回宇宙 ✦';
      btn.style.cssText = `
        position: fixed;
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%);
        background: transparent;
        border: 1px solid rgba(196,181,253,0.6);
        color: rgba(196,181,253,0.9);
        font-family: 'Noto Serif TC', serif;
        font-size: 15px;
        padding: 10px 28px;
        border-radius: 999px;
        cursor: pointer;
        letter-spacing: 2px;
        transition: all 0.3s;
      `;
      btn.onmouseenter = () => btn.style.background = 'rgba(196,181,253,0.15)';
      btn.onmouseleave = () => btn.style.background = 'transparent';
      btn.onclick = () => {
        destroy();
        showScreen('universe');
      };
      document.body.appendChild(btn);
    }
  }

  /* ===== 工具 ===== */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ===== 清除 ===== */
  function destroy() {
    cancelAnimationFrame(animRaf);
    const btn = document.getElementById('btn-back-universe'); // ← 加這兩行
    if (btn) btn.remove();
  }

  return { init, destroy, reset };
})();