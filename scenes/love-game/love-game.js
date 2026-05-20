/* =========================================
   愛星 — 接愛心小遊戲
   ========================================= */

const LoveGame = (() => {

  /* ===== 設定 ===== */
  const CFG = {
    duration:      45,      // 遊戲秒數
    cupCapacity:   40,      // 杯子容量（愛心數）
    spawnInterval: 900,     // 初始愛心生成間隔 ms
    spawnMin:      600,     // 最快間隔 ms
    heartSpeed:    3.2,     // 初始掉落速度 px/frame
    heartSpeedMax: 6.0,     // 最快速度
    playerW:       76,
    playerH:       90,
    heartSize:     42,      // 愛心變大
  };

  /* ===== 狀態 ===== */
  let canvas, ctx;
  let W, H;
  let player, hearts, particles, overflowParticles;
  let cupCount, gameTimer, spawnTimer, lastTime;
  let isRunning, isOver, isDragging;
  let animRaf, spawnRaf;
  let touchOffsetX;
  let playerImg = null;

  /* ===== 初始化 ===== */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    resize();
    reset();
    bindEvents();
    // 載入角色圖片
    playerImg = new Image();
    playerImg.src = 'assets/images/tong-game.png';
    loop(performance.now());
    startSpawn();
    startCountdown();
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function reset() {
    player = {
      x: W / 2,
      y: H - 100,
      w: CFG.playerW,
      h: CFG.playerH,
    };
    hearts             = [];
    particles          = [];
    overflowParticles  = [];
    cupCount           = 0;
    gameTimer          = CFG.duration;
    isRunning          = true;
    isOver             = false;
    isDragging         = false;
    touchOffsetX       = 0;
  }

  /* ===== 倒數計時 ===== */
  function startCountdown() {
    const tick = setInterval(() => {
      if (!isRunning) { clearInterval(tick); return; }
      gameTimer--;
      if (gameTimer <= 0) {
        gameTimer = 0;
        clearInterval(tick);
        endGame();
      }
    }, 1000);
  }

  /* ===== 生成愛心 ===== */
  function startSpawn() {
    let interval = CFG.spawnInterval;
    const schedule = () => {
      if (!isRunning) return;
      spawnHeart();
      // 隨時間加速
      const progress = 1 - gameTimer / CFG.duration;
      interval = Math.max(CFG.spawnMin,
        CFG.spawnInterval - progress * (CFG.spawnInterval - CFG.spawnMin));
      spawnRaf = setTimeout(schedule, interval);
    };
    spawnRaf = setTimeout(schedule, interval);
  }

  function spawnHeart() {
    const margin = 40;
    hearts.push({
      x:    margin + Math.random() * (W - margin * 2),
      y:    -CFG.heartSize,
      size: CFG.heartSize * (0.85 + Math.random() * 0.3),
      speed: CFG.heartSpeed + (1 - gameTimer / CFG.duration) *
             (CFG.heartSpeedMax - CFG.heartSpeed) * Math.random(),
      alpha: 1,
      caught: false,
      missed: false,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  /* ===== 事件綁定 ===== */
  function bindEvents() {
    canvas.addEventListener('touchstart',  onTouchStart, { passive: true });
    canvas.addEventListener('touchmove',   onTouchMove,  { passive: true });
    canvas.addEventListener('touchend',    onTouchEnd,   { passive: true });
    canvas.addEventListener('mousedown',   onMouseDown);
    window.addEventListener('mousemove',   onMouseMove);
    window.addEventListener('mouseup',     onMouseUp);
  }

  function hitPlayer(cx, cy) {
    return (
      cx >= player.x - player.w / 2 - 10 &&
      cx <= player.x + player.w / 2 + 10 &&
      cy >= player.y - player.h / 2 - 10 &&
      cy <= player.y + player.h / 2 + 10
    );
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const cx = t.clientX - rect.left;
    const cy = t.clientY - rect.top;
    if (hitPlayer(cx, cy)) {
      isDragging   = true;
      touchOffsetX = cx - player.x;
    }
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const cx = t.clientX - rect.left;
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, cx - touchOffsetX));
  }

  function onTouchEnd() { isDragging = false; }

  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (hitPlayer(cx, cy)) {
      isDragging   = true;
      touchOffsetX = cx - player.x;
    }
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, cx - touchOffsetX));
  }

  function onMouseUp() { isDragging = false; }

  /* ===== 遊戲結束 ===== */
  function endGame() {
    isRunning = false;
    isOver    = true;
    clearTimeout(spawnRaf);
  }

  function isWin() {
    return cupCount >= CFG.cupCapacity;
  }

  /* ===== 碰撞偵測 ===== */
  function checkCatch(h) {
    const dx = Math.abs(h.x - player.x);
    const dy = Math.abs(h.y - (player.y - player.h / 2 + 8));
    return dx < player.w / 2 + h.size * 0.4 && dy < h.size * 0.5 + 10;
  }

  /* ===== 粒子 ===== */
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 7; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        size: 4 + Math.random() * 4,
        color,
      });
    }
  }

  function spawnOverflow(cupX, cupBottomY) {
    // 往旁邊彈出再落下堆積
    const side = Math.random() > 0.5 ? 1 : -1;
    overflowParticles.push({
      x:    cupX + (Math.random() - 0.5) * 20,
      y:    cupBottomY,
      vx:   side * (1.5 + Math.random() * 2.5),
      vy:   -(2 + Math.random() * 3),
      gravity: 0.18,
      alpha: 1,
      size:  14 + Math.random() * 10,
      settled: false,
      settleY: cupBottomY + 10 + Math.random() * 20,
    });
  }

  /* ===== 主迴圈 ===== */
  function loop(ts) {
    animRaf = requestAnimationFrame(loop);
    update();
    draw();
  }

  function update() {
    if (!isRunning && !isOver) return;

    // 愛心更新
    hearts.forEach(h => {
      if (h.caught || h.missed) return;
      h.y    += h.speed;
      h.wobble += 0.05;
      h.x    += Math.sin(h.wobble) * 0.4;

      if (checkCatch(h)) {
        h.caught = true;
        spawnParticles(h.x, h.y, '#f9a8d4');
        if (cupCount < CFG.cupCapacity) {
          cupCount++;
        } else {
          // 杯子滿了，從杯口溢出堆在底下
          const cupX = getCupX();
          const cupBottom = getCupTop() + getCupH();
          spawnOverflow(cupX, cupBottom);
        }
      } else if (h.y > H + 20) {
        h.missed = true;
      }
    });

    hearts = hearts.filter(h => !h.missed && !(h.caught && h.alpha <= 0));
    hearts.forEach(h => { if (h.caught) h.alpha -= 0.08; });

    // 粒子
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.03;
    });
    particles = particles.filter(p => p.alpha > 0);

    overflowParticles.forEach(p => {
      if (p.settled) return;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96;
      if (p.y >= p.settleY) {
        p.y = p.settleY;
        p.settled = true;
        p.vx = 0; p.vy = 0;
      }
    });
    // 堆積的愛心慢慢淡出（只有超過30個才開始淡）
    if (overflowParticles.length > 30) {
      overflowParticles[0].alpha -= 0.01;
      if (overflowParticles[0].alpha <= 0) overflowParticles.shift();
    }
  }

  /* ===== 繪圖 ===== */
  function getCupX()  { return W - 68; }
  function getCupTop(){ return H * 0.22; }
  function getCupH()  { return H * 0.52; }
  function getCupW()  { return 64; }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 背景
    const bg = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, H*0.9);
    bg.addColorStop(0, '#130c35');
    bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawStarsBg();
    drawCup();
    drawOverflowParticles();
    drawHearts();
    drawParticles();
    drawPlayer();
    drawHUD();

    if (isOver) drawEndScreen();
  }

  // 靜態小星點背景
  function drawStarsBg() {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    // 用固定seed讓背景不閃爍
    for (let i = 0; i < 60; i++) {
      const x = ((i * 137.5) % W);
      const y = ((i * 97.3 + 40) % H);
      const r = i % 3 === 0 ? 1.2 : 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCup() {
    const cx  = getCupX();
    const top = getCupTop();
    const ch  = getCupH();
    const cw  = getCupW();

    // 填充愛心（從底部往上）
    const fillRatio = cupCount / CFG.cupCapacity;
    const fillH     = ch * fillRatio;
    const fillY     = top + ch - fillH;

    if (fillRatio > 0) {
      ctx.save();
      // clip 到杯子內部
      ctx.beginPath();
      ctx.moveTo(cx - cw/2 + 4, top);
      ctx.lineTo(cx - cw/2 - 4, top + ch);
      ctx.lineTo(cx + cw/2 + 4, top + ch);
      ctx.lineTo(cx + cw/2 - 4, top);
      ctx.closePath();
      ctx.clip();

      const fillGrad = ctx.createLinearGradient(0, fillY, 0, top + ch);
      fillGrad.addColorStop(0, 'rgba(249,168,212,0.7)');
      fillGrad.addColorStop(1, 'rgba(236,72,153,0.85)');
      ctx.fillStyle = fillGrad;
      ctx.fillRect(cx - cw/2 - 4, fillY, cw + 8, fillH);

      // 液面波紋
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const wx = cx - cw/2 + i * (cw/20);
        const wy = fillY + Math.sin(i * 0.6 + Date.now() * 0.003) * 3;
        i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    // 杯子外框
    ctx.beginPath();
    ctx.moveTo(cx - cw/2 + 4, top);
    ctx.lineTo(cx - cw/2 - 4, top + ch);
    ctx.lineTo(cx + cw/2 + 4, top + ch);
    ctx.lineTo(cx + cw/2 - 4, top);
    ctx.strokeStyle = fillRatio >= 1
      ? 'rgba(253,230,138,0.9)'
      : 'rgba(196,181,253,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 杯口
    ctx.beginPath();
    ctx.ellipse(cx, top, cw/2, 6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(196,181,253,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 杯子標籤
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('愛的容器', cx, top + ch + 18);

    // 愛心小icon on cup
    drawHeartIcon(cx, top - 16, 10, fillRatio >= 1 ? '#fde68a' : 'rgba(249,168,212,0.7)');
  }

  function drawHearts() {
    hearts.forEach(h => {
      if (h.missed) return;
      ctx.globalAlpha = h.alpha;
      drawHeartIcon(h.x, h.y, h.size * 0.5, '#f9a8d4');
      ctx.globalAlpha = 1;
    });
  }

  function drawHeartIcon(x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.4);
    ctx.bezierCurveTo(-r * 0.1, -r * 0.2, -r, -r * 0.2, -r, r * 0.2);
    ctx.bezierCurveTo(-r, r * 0.7, 0, r * 1.2, 0, r * 1.2);
    ctx.bezierCurveTo(0, r * 1.2, r, r * 0.7, r, r * 0.2);
    ctx.bezierCurveTo(r, -r * 0.2, r * 0.1, -r * 0.2, 0, r * 0.4);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      drawHeartIcon(p.x, p.y, p.size * 0.5, p.color);
    });
    ctx.globalAlpha = 1;
  }

  function drawOverflowParticles() {
    overflowParticles.forEach(p => {
      ctx.globalAlpha = p.alpha * (p.settled ? 0.85 : 0.7);
      // 堆積的愛心用金色，飛行中用粉色
      drawHeartIcon(p.x, p.y, p.size * 0.5, p.settled ? '#fde68a' : '#f9a8d4');
    });
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const bobY = Math.sin(Date.now() * 0.003) * 3;
    const imgW = 110;
    const imgH = 140;

    ctx.save();

    // 拖曳時底部發光圈
    if (isDragging) {
      const glow = ctx.createRadialGradient(x, y + bobY, 0, x, y + bobY, 40);
      glow.addColorStop(0, 'rgba(249,168,212,0.4)');
      glow.addColorStop(1, 'rgba(249,168,212,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(x, y + bobY + imgH * 0.3, 40, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (playerImg && playerImg.complete && playerImg.naturalWidth > 0) {
      // 圖片載入成功，用圖片繪製
      ctx.drawImage(
        playerImg,
        x - imgW / 2,
        y - imgH * 0.75 + bobY,
        imgW, imgH
      );
    } else {
      // 圖片還沒載入，fallback 用簡單圓形
      ctx.translate(x, y + bobY);
      const headGrad = ctx.createRadialGradient(-5, -28, 0, 0, -24, 24);
      headGrad.addColorStop(0, '#e9d5ff');
      headGrad.addColorStop(1, '#a78bfa');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -24, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawHUD() {
    // 倒數計時 — 置中上方
    const timerColor = gameTimer <= 10 ? '#fca5a5' : 'rgba(196,181,253,0.9)';
    ctx.font = '500 22px sans-serif';
    ctx.fillStyle = timerColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${gameTimer}″`, W / 2, 38);

    // 杯子滿了的提示
    if (cupCount >= CFG.cupCapacity) {
      ctx.font = '500 13px sans-serif';
      ctx.fillStyle = 'rgba(253,230,138,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('✦ 愛心已經裝滿了！✦', W / 2, 62);
    }
  }

  function drawEndScreen() {
    if (isWin()) {
      drawWinScreen();
    } else {
      drawLoseScreen();
    }
  }

  function drawWinScreen() {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(7,7,26,0.82)';
    ctx.fillRect(0, 0, W, H);

    // 旋轉愛心煙火
    const t = Date.now() * 0.001;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + t;
      const r = 60 + Math.sin(t * 2 + i) * 20;
      const fx = W / 2 + Math.cos(angle) * r;
      const fy = H * 0.38 + Math.sin(angle) * r * 0.6;
      ctx.globalAlpha = 0.6 + Math.sin(t * 3 + i) * 0.3;
      drawHeartIcon(fx, fy, 7, i % 2 === 0 ? '#f9a8d4' : '#fde68a');
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = '500 15px sans-serif';
    ctx.fillStyle = 'rgba(253,230,138,0.9)';
    ctx.fillText('已經感受到', W / 2, H * 0.52);

    ctx.font = '500 18px sans-serif';
    const grad = ctx.createLinearGradient(W/2 - 80, 0, W/2 + 80, 0);
    grad.addColorStop(0, '#c4b5fd');
    grad.addColorStop(0.5, '#f9a8d4');
    grad.addColorStop(1, '#fde68a');
    ctx.fillStyle = grad;
    ctx.fillText('寶寶給我滿滿的愛~', W / 2, H * 0.52 + 34);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.5)';
    ctx.fillText('✦  新的星球正在亮起  ✦', W / 2, H * 0.52 + 72);

    // 繼續按鈕
    drawBtn(W / 2, H * 0.52 + 112, '繼續旅程 →', () => {
      if (typeof window.onLoveGameComplete === 'function') {
        window.onLoveGameComplete();
      }
    });
  }

  function drawLoseScreen() {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(7,7,26,0.85)';
    ctx.fillRect(0, 0, W, H);

    // 搖晃的空杯子暗示
    const t = Date.now() * 0.001;
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 5; i++) {
      const fx = W / 2 + Math.cos(i * 1.2 + t * 0.5) * 50;
      const fy = H * 0.36 + Math.sin(i * 0.9) * 20;
      drawHeartIcon(fx, fy, 8, '#c4b5fd');
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = '500 16px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.85)';
    ctx.fillText('愛心還沒裝滿...', W / 2, H * 0.46);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.45)';
    ctx.fillText('再努力接接看吧 ♡', W / 2, H * 0.46 + 30);

    // 再試一次
    drawBtn(W / 2, H * 0.46 + 86, '再試一次 ↺', () => {
      canvas.onclick = null;
      reset();
      startSpawn();
      startCountdown();
    });

    // 離開
    drawOutlineBtn(W / 2, H * 0.46 + 140, '離開', () => {
      canvas.onclick = null;
      if (typeof window.onLoveGameLeave === 'function') {
        window.onLoveGameLeave();
      }
    });
  }

  /* ===== 通用按鈕繪製 ===== */
  function drawBtn(cx, cy, label, onClick) {
    const bw = 150, bh = 40;
    const x = cx - bw / 2, y = cy - bh / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, 999);
    ctx.fillStyle = 'rgba(124,58,237,0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196,181,253,0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 5);

    // 點擊判斷
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const ex = e.clientX - rect.left;
      const ey = e.clientY - rect.top;
      if (ex > x && ex < x + bw && ey > y && ey < y + bh) {
        canvas.onclick = null;
        onClick();
      }
    };
  }

  function drawOutlineBtn(cx, cy, label, onClick) {
    const bw = 150, bh = 40;
    const x = cx - bw / 2, y = cy - bh / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, 999);
    ctx.strokeStyle = 'rgba(196,181,253,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 5);

    const prevOnClick = canvas.onclick;
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const ex = e.clientX - rect.left;
      const ey = e.clientY - rect.top;
      if (ex > x && ex < x + bw && ey > y && ey < y + bh) {
        canvas.onclick = null;
        onClick();
      } else if (prevOnClick) {
        prevOnClick(e);
      }
    };
  }

  /* ===== 清除 ===== */
  function destroy() {
    cancelAnimationFrame(animRaf);
    clearTimeout(spawnRaf);
    canvas.removeEventListener('touchstart',  onTouchStart);
    canvas.removeEventListener('touchmove',   onTouchMove);
    canvas.removeEventListener('touchend',    onTouchEnd);
    canvas.removeEventListener('mousedown',   onMouseDown);
    window.removeEventListener('mousemove',   onMouseMove);
    window.removeEventListener('mouseup',     onMouseUp);
  }

  return { init, destroy };
})();