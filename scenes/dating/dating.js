/* =========================================
   約會星 — 互動探索，收集回憶碎片
   ========================================= */

const DatingScene = (() => {

  let canvas, ctx, W, H;
  let animRaf;
  let bgImage = null;
  let phase = 'explore'; // explore → memory → complete
  let collected = [];
  let activeMemory = null;
  let memoryAlpha = 0;
  let completeAlpha = 0;
  let particles = [];
  let lastTime = 0;
  let sparkles = [];

  const ITEMS = [
    {
      id: 'clothes',
      emoji: '👗',
      label: '衣服',
      xRatio: 0.22,
      yRatio: 0.38,
      color: '#f9a8d4',
      glow: 'rgba(249,168,212,0.5)',
      lines: [
        '你說這件衣服好可愛',
        '但我感覺是衣服在襯托你的可愛',
      ],
      // 飄移參數
      drift: { ax: 0.0007, ay: 0.0011, px: 0, py: 1.2, rangeX: 38, rangeY: 28 },
    },
    {
      id: 'bag',
      emoji: '🛍️',
      label: '購物袋',
      xRatio: 0.75,
      yRatio: 0.52,
      color: '#c4b5fd',
      glow: 'rgba(196,181,253,0.5)',
      lines: [
        '偶爾的小驚喜',
        '都是愛你的證明',
      ],
      drift: { ax: 0.0009, ay: 0.0006, px: 2.1, py: 0, rangeX: 32, rangeY: 40 },
    },
    {
      id: 'food',
      emoji: '🍽️',
      label: '餐點',
      xRatio: 0.28,
      yRatio: 0.68,
      color: '#6ee7b7',
      glow: 'rgba(110,231,183,0.5)',
      lines: [
        '不愛吃菜菜的寶寶',
        '我願意幫你吃',
        '但前提是你要健健康康的',
      ],
      drift: { ax: 0.0006, ay: 0.0013, px: 1.0, py: 2.5, rangeX: 44, rangeY: 24 },
    },
    {
      id: 'drink',
      emoji: '☕',
      label: '飲料',
      xRatio: 0.70,
      yRatio: 0.28,
      color: '#fde68a',
      glow: 'rgba(253,230,138,0.5)',
      lines: [
        '我實在不太能喝太甜的飲料',
        '所以每次願意跟我一起喝一杯',
        '我都很感動',
      ],
      drift: { ax: 0.0011, ay: 0.0008, px: 3.0, py: 1.5, rangeX: 30, rangeY: 36 },
    },
  ];

  /* ===== 初始化 ===== */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    reset();
    bindEvents();

    bgImage = new Image();
    bgImage.src = 'assets/images/CG1.png';

    lastTime = performance.now();
    animRaf  = requestAnimationFrame(loop);
  }

  function reset() {
    phase        = 'explore';
    collected    = [];
    activeMemory = null;
    memoryAlpha  = 0;
    completeAlpha = 0;
    particles    = [];
    sparkles     = buildSparkles();
  }

  function buildSparkles() {
    return Array.from({ length: 18 }, () => ({
      x:  Math.random() * (W || window.innerWidth),
      y:  Math.random() * (H || window.innerHeight),
      r:  Math.random() * 1.2 + 0.3,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.007,
    }));
  }

  /* ===== 事件 ===== */
  function bindEvents() {
    canvas.addEventListener('click',    onClick);
    canvas.addEventListener('touchend', onTouch, { passive: true });
  }

  function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    handleTap(e.clientX - rect.left, e.clientY - rect.top);
  }

  function onTouch(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    handleTap(t.clientX - rect.left, t.clientY - rect.top);
  }

  function handleTap(x, y) {
    // 如果有回憶卡片開著，點擊關掉
    if (activeMemory !== null) {
      activeMemory = null;
      return;
    }

    // 完成畫面點擊繼續
    if (phase === 'complete') {
      if (typeof window.onDatingComplete === 'function') {
        window.onDatingComplete();
      }
      return;
    }

    // 檢查點到哪個物件
    ITEMS.forEach(item => {
      const ix   = item._cx !== undefined ? item._cx : item.xRatio * W;
      const iy   = item._cy !== undefined ? item._cy : item.yRatio * H;
      const dist = Math.sqrt((x - ix) ** 2 + (y - iy) ** 2);
      if (dist < 48) {
        // 點到了！
        spawnCollectParticles(ix, iy, item.color);
        if (!collected.includes(item.id)) {
          collected.push(item.id);
        }
        activeMemory = item;
        memoryAlpha  = 0;

        // 全部收集完
        if (collected.length >= ITEMS.length && phase === 'explore') {
          setTimeout(() => {
            activeMemory = null;
            phase = 'complete';
            completeAlpha = 0;
          }, 2800);
        }
      }
    });
  }

  /* ===== 粒子 ===== */
  function spawnCollectParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        alpha: 1,
        color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  /* ===== 主迴圈 ===== */
  function loop(ts) {
    animRaf = requestAnimationFrame(loop);
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    if (activeMemory !== null) {
      memoryAlpha = Math.min(1, memoryAlpha + dt * 0.004);
    }
    if (phase === 'complete') {
      completeAlpha = Math.min(1, completeAlpha + dt * 0.0015);
    }

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.08;
      p.alpha -= 0.025;
    });
    particles = particles.filter(p => p.alpha > 0);

    sparkles.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 0.9) s.da *= -1;
    });

    draw();
  }

  /* ===== 繪圖 ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawItems();
    drawProgress();
    drawParticles();
    if (activeMemory !== null) drawMemoryCard();
    if (phase === 'complete') drawComplete();
  }

  function drawBg() {
    if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
      // 等比填滿
      const scale = Math.max(W / bgImage.naturalWidth, H / bgImage.naturalHeight);
      const bw = bgImage.naturalWidth  * scale;
      const bh = bgImage.naturalHeight * scale;
      const bx = (W - bw) / 2;
      const by = (H - bh) / 2;
      ctx.drawImage(bgImage, bx, by, bw, bh);

      // 半透明暗化遮罩，讓物件更清楚
      ctx.fillStyle = 'rgba(4,2,16,0.38)';
      ctx.fillRect(0, 0, W, H);
    } else {
      // 圖片還沒載入，用深色背景
      const bg = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, H);
      bg.addColorStop(0, '#130c35');
      bg.addColorStop(1, '#07071a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    // 閃爍小星點疊加
    sparkles.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    });
  }

  function drawItems() {
    const t = Date.now() * 0.001;
    ITEMS.forEach((item, i) => {
      const isDone = collected.includes(item.id);
      const d = item.drift;

      // 飄移位置（雙軸 sin 疊加，每個物件頻率不同）
      const dx = Math.sin(t * d.ax * 1000 + d.px) * d.rangeX;
      const dy = Math.sin(t * d.ay * 1000 + d.py) * d.rangeY;
      const x  = item.xRatio * W + dx;
      const y  = item.yRatio * H + dy;

      // 儲存當前位置供點擊判斷用
      item._cx = x;
      item._cy = y;

      if (isDone) {
        // 已收集：縮小暗淡
        ctx.globalAlpha = 0.35;
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, x, y);
        ctx.globalAlpha = 1;
        ctx.font = '12px sans-serif';
        ctx.fillStyle = item.color;
        ctx.fillText('✓', x + 16, y - 14);
        ctx.textBaseline = 'alphabetic';
        return;
      }

      // ── 外層大光暈（呼吸） ──
      const breathe = 0.5 + Math.sin(t * 1.8 + i * 1.3) * 0.25;
      const glowR = 52 + Math.sin(t * 2.2 + i) * 10;
      const glow  = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0,   item.glow.replace('0.5', String(0.55 * breathe)));
      glow.addColorStop(0.5, item.glow.replace('0.5', String(0.25 * breathe)));
      glow.addColorStop(1,   item.glow.replace('0.5', '0'));
      ctx.fillStyle = glow;
      ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);

      // ── 旋轉粒子環繞 ──
      const orbitCount = 5;
      for (let j = 0; j < orbitCount; j++) {
        const angle  = (j / orbitCount) * Math.PI * 2 + t * 1.2 + i * 0.8;
        const radius = 30 + Math.sin(t * 2 + j * 1.1) * 6;
        const ox = x + Math.cos(angle) * radius;
        const oy = y + Math.sin(angle) * radius * 0.55; // 橢圓感
        const pa = 0.4 + Math.sin(t * 3 + j) * 0.3;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = item.color.replace(')', ',' + pa + ')').startsWith('rgba')
          ? item.color
          : item.color;
        // 用 globalAlpha 控制透明
        ctx.globalAlpha = pa;
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── 反向旋轉外圈光點 ──
      for (let j = 0; j < 3; j++) {
        const angle  = (j / 3) * Math.PI * 2 - t * 0.7 + i;
        const radius = 42 + Math.sin(t + j * 2) * 8;
        const ox = x + Math.cos(angle) * radius;
        const oy = y + Math.sin(angle) * radius * 0.5;
        ctx.globalAlpha = 0.25 + Math.sin(t * 2 + j) * 0.15;
        ctx.beginPath();
        ctx.arc(ox, oy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── 旋轉光環 ──
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.5 + i);
      ctx.scale(1, 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.strokeStyle = item.color;
      ctx.globalAlpha = 0.15 + Math.sin(t * 1.5) * 0.08;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── emoji 主體 ──
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 輕微縮放脈動
      const scale = 1 + Math.sin(t * 2.5 + i * 0.9) * 0.06;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();
      ctx.textBaseline = 'alphabetic';

      // ── 閃光提示環 ──
      const pulse = 0.25 + Math.sin(t * 2 + i * 1.4) * 0.18;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + pulse + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function drawProgress() {
    const total = ITEMS.length;
    const done  = collected.length;
    const barW  = 120;
    const barH  = 6;
    const barX  = (W - barW) / 2;
    const barY  = 28;

    // 背景
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    // 進度
    if (done > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#c4b5fd');
      grad.addColorStop(1, '#f9a8d4');
      ctx.fillStyle = grad;
      roundRect(barX, barY, barW * (done / total), barH, 3);
      ctx.fill();
    }

    // 文字
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('回憶碎片 ' + done + ' / ' + total, W / 2, barY + barH + 16);

    // 提示
    if (done === 0) {
      const pulse = 0.4 + Math.sin(Date.now() * 0.002) * 0.25;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,' + pulse + ')';
      ctx.fillText('✦ 點擊發光的物件收集回憶 ✦', W / 2, H - 24);
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawMemoryCard() {
    const item  = activeMemory;
    const cardW = Math.min(W - 48, 340);
    const cardH = 60 + item.lines.length * 32 + 40;
    const cardX = (W - cardW) / 2;
    const cardY = (H - cardH) / 2;

    ctx.save();
    ctx.globalAlpha = memoryAlpha;

    // 背景遮罩
    ctx.fillStyle = 'rgba(4,2,16,0.55)';
    ctx.fillRect(0, 0, W, H);

    // 卡片
    ctx.fillStyle = 'rgba(8,5,24,0.94)';
    roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    ctx.strokeStyle = item.color + '66';
    ctx.lineWidth = 1.5;
    roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.stroke();

    // emoji
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, W / 2, cardY + 36);

    // 文字
    ctx.textBaseline = 'alphabetic';
    item.lines.forEach((line, i) => {
      ctx.font = i === 0
        ? '500 16px "Noto Serif TC", serif'
        : '300 15px "Noto Serif TC", serif';
      ctx.fillStyle = i === 0
        ? item.color
        : 'rgba(240,236,255,0.85)';
      ctx.shadowColor = item.color;
      ctx.shadowBlur  = i === 0 ? 10 : 0;
      ctx.fillText(line, W / 2, cardY + 74 + i * 32);
    });
    ctx.shadowBlur = 0;

    // 關閉提示
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.35)';
    ctx.fillText('點擊繼續', W / 2, cardY + cardH - 14);

    ctx.restore();
  }

  function drawComplete() {
    ctx.save();
    ctx.globalAlpha = completeAlpha;

    ctx.fillStyle = 'rgba(4,2,16,0.78)';
    ctx.fillRect(0, 0, W, H);

    // 標題
    ctx.textAlign = 'center';
    ctx.font = '300 15px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(253,230,138,0.9)';
    ctx.shadowColor = 'rgba(253,230,138,0.4)';
    ctx.shadowBlur = 16;
    ctx.fillText('回憶都找回來了', W / 2, H / 2 - 30);

    ctx.font = '500 18px "Noto Serif TC", serif';
    const grad = ctx.createLinearGradient(W/2 - 80, 0, W/2 + 80, 0);
    grad.addColorStop(0, 'rgba(196,181,253,' + completeAlpha + ')');
    grad.addColorStop(0.5, 'rgba(249,168,212,' + completeAlpha + ')');
    grad.addColorStop(1, 'rgba(253,230,138,' + completeAlpha + ')');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 0;
    ctx.fillText('謝謝你陪我走過這一天', W / 2, H / 2 + 10);

    // 繼續按鈕
    if (completeAlpha > 0.7) {
      const btnAlpha = (completeAlpha - 0.7) / 0.3;
      const pulse = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
      ctx.globalAlpha = completeAlpha * btnAlpha * pulse;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,0.7)';
      ctx.fillText('✦ 點擊繼續 ✦', W / 2, H / 2 + 56);
    }

    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function destroy() {
    cancelAnimationFrame(animRaf);
    canvas.removeEventListener('click',    onClick);
    canvas.removeEventListener('touchend', onTouch);
  }

  return { init, destroy, reset };
})();