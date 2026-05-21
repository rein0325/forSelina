/* =========================================
   許願星 — 流星許願
   ========================================= */

const WishingScene = (() => {

  let canvas, ctx, W, H;
  let animRaf, lastTime = 0;
  let bgStars = [], shooters = [], wishedStars = [];
  let phase = 'catch';  // catch → input → forming → done
  let caught = [];
  let activeCard = null;
  let cardAlpha = 0;
  let inputPhaseAlpha = 0;
  let formingProgress = 0;
  let doneAlpha = 0;
  let spawnTimer = 0;
  let inputEl = null;
  let doneBtn = null;
  let wishCount = 0;
  let cardOpenTime = 0;

  // 愛心形狀點位（參數方程）
  function heartPoints(count) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const scale = Math.min(W, H) * 0.18;
      const x = W/2 + scale * 16 * Math.pow(Math.sin(t), 3) / 16;
      const y = H/2 - scale * (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)) / 16;
      pts.push({ x, y });
    }
    return pts;
  }

  const MY_WISHES = [
    { emoji: '🌊', text: '想帶你去看海',              color: '#a5f3fc' },
    { emoji: '🎂', text: '陪你過好多生日',             color: '#fde68a' },
    { emoji: '🍚', text: '想吃寶寶做的飯',             color: '#6ee7b7' },
    { emoji: '🌟', text: '未來有你',                   color: '#fcd34d' },
    { emoji: '🤗', text: '想要你需要我時隨時給你抱抱',  color: '#c4b5fd' },
    { emoji: '🗺️', text: '帶你去好多地方玩',           color: '#f9a8d4' },
  ];

  /* ===== 初始化 ===== */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    reset();
    bindEvents();
    lastTime = performance.now();
    animRaf  = requestAnimationFrame(loop);
  }

  function reset() {
    phase           = 'catch';
    caught          = [];
    activeCard      = null;
    cardAlpha       = 0;
    inputPhaseAlpha = 0;
    formingProgress = 0;
    doneAlpha       = 0;
    spawnTimer      = 0;
    wishCount       = 0;
    shooters        = [];
    wishedStars     = [];
    explosionParticles = [];
    buildBgStars();
    removeUI();
  }

  function buildBgStars() {
    bgStars = Array.from({ length: 160 }, () => ({
      x:  Math.random() * (W || 400),
      y:  Math.random() * (H || 700),
      r:  Math.random() * 1.3 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.005,
    }));
  }

  /* ===== 流星生成 ===== */
  function spawnShooter() {
    const uncaught = MY_WISHES.filter(w => !caught.includes(w.text));
    if (uncaught.length === 0) return;
    const wish  = uncaught[Math.floor(Math.random() * uncaught.length)];
    const angle = Math.PI * 0.18 + Math.random() * 0.14;
    const speed = 2.0 + Math.random() * 2.0;
    shooters.push({
      x:      Math.random() * W * 0.55,
      y:      Math.random() * H * 0.28,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed,
      len:    100 + Math.random() * 60,
      life:   1,
      wish,
      hit:    false,
      trail:  [],
    });
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
    if (activeCard !== null) {
      if (Date.now() - cardOpenTime < 400) return;
      activeCard = null;
      return;
    }
    if (phase !== 'catch') return;

    shooters.forEach(sh => {
      if (sh.hit) return;
      const dist = Math.sqrt((x - sh.x)**2 + (y - sh.y)**2);
      if (dist < 40) {
        sh.hit     = true;
        activeCard = sh.wish;
        cardOpenTime = Date.now();
        cardAlpha  = 0;
        if (!caught.includes(sh.wish.text)) {
          caught.push(sh.wish.text);
          addWishedStar(sh.x, sh.y, sh.wish.color, sh.wish.emoji, sh.wish.text, false);
        }
        // 全部抓完 → 進許願輸入
        if (caught.length >= MY_WISHES.length && phase === 'catch') {
          setTimeout(() => {
            activeCard = null;
            phase = 'input';
            showInput();
          }, 1200);
        }
      }
    });
  }

  /* ===== 許願星加入 ===== */
  function addWishedStar(fromX, fromY, color, emoji, text, isHers) {
    wishedStars.push({
      x:      fromX,
      y:      fromY,
      tx:     60 + Math.random() * (W - 120),
      ty:     30 + Math.random() * H * 0.4,
      color,
      emoji,
      text:   isHers ? text : null,
      isHers,
      a:      0,
      r:      isHers ? 3.5 : 2.5,
      formX:  0,
      formY:  0,
    });
  }

  /* ===== UI ===== */
  function showInput() {
    removeInput();
    inputEl = document.createElement('input');
    inputEl.type        = 'text';
    inputEl.placeholder = '寫下你的願望...';
    inputEl.maxLength   = 24;
    Object.assign(inputEl.style, {
      position:     'fixed',
      left:         '50%',
      top:          '60%',
      transform:    'translateX(-50%)',
      width:        '260px',
      padding:      '12px 18px',
      background:   'rgba(8,5,24,0.9)',
      border:       '1px solid rgba(249,168,212,0.55)',
      borderRadius: '999px',
      color:        '#f0ecff',
      fontSize:     '15px',
      textAlign:    'center',
      outline:      'none',
      fontFamily:   '"Noto Serif TC", serif',
      letterSpacing:'2px',
      zIndex:       '999',
    });
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitWish(); });
    document.body.appendChild(inputEl);
    setTimeout(() => inputEl && inputEl.focus(), 100);

    // 送出按鈕
    const sendBtn = document.createElement('button');
    sendBtn.textContent = '✦ 送上星空';
    sendBtn.id = 'wish-send-btn';
    Object.assign(sendBtn.style, {
      position:     'fixed',
      left:         '50%',
      top:          'calc(60% + 56px)',
      transform:    'translateX(-50%)',
      padding:      '10px 28px',
      background:   'rgba(249,168,212,0.12)',
      border:       '1px solid rgba(249,168,212,0.5)',
      borderRadius: '999px',
      color:        'rgba(249,168,212,0.9)',
      fontSize:     '13px',
      fontFamily:   '"Noto Serif TC", serif',
      letterSpacing:'2px',
      cursor:       'pointer',
      zIndex:       '999',
    });
    sendBtn.addEventListener('click', submitWish);
    document.body.appendChild(sendBtn);

    // 完成按鈕
    doneBtn = document.createElement('button');
    doneBtn.textContent = '許完了 →';
    doneBtn.id = 'wish-done-btn';
    Object.assign(doneBtn.style, {
      position:     'fixed',
      right:        '24px',
      bottom:       '32px',
      padding:      '10px 20px',
      background:   'transparent',
      border:       '1px solid rgba(196,181,253,0.3)',
      borderRadius: '999px',
      color:        'rgba(196,181,253,0.5)',
      fontSize:     '12px',
      fontFamily:   '"Noto Serif TC", serif',
      letterSpacing:'1px',
      cursor:       'pointer',
      zIndex:       '999',
    });
    doneBtn.addEventListener('click', startForming);
    document.body.appendChild(doneBtn);
  }

  function removeInput() {
    document.getElementById('wish-send-btn') && document.getElementById('wish-send-btn').remove();
    document.getElementById('wish-done-btn') && document.getElementById('wish-done-btn').remove();
    if (inputEl) { inputEl.remove(); inputEl = null; }
    doneBtn = null;
  }

  function submitWish() {
    if (!inputEl || !inputEl.value.trim()) return;
    const text = inputEl.value.trim();
    inputEl.value = '';
    wishCount++;

    // 從畫面底部發射上去
    const sx = W * 0.3 + Math.random() * W * 0.4;
    const sy = H + 20;
    shooters.push({
      x: sx, y: sy,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(3.5 + Math.random() * 2),
      len: 70, life: 1,
      wish: { color: '#f9a8d4', text },
      hit: false, trail: [], isHers: true,
    });

    addWishedStar(sx, sy - 30, '#f9a8d4', '💫', text, true);
    setTimeout(() => inputEl && inputEl.focus(), 50);
  }

  function startForming() {
    if (wishedStars.length === 0) return;
    removeUI();
    phase = 'forming';
    formingProgress = 0;

    // 每顆星往中心聚集
    wishedStars.forEach(s => {
      s.formX = W / 2 + (Math.random() - 0.5) * 40;
      s.formY = H / 2 + (Math.random() - 0.5) * 40;
      s.angle = Math.random() * Math.PI * 2;
      s.orbitR = 20 + Math.random() * 60;
      s.scatterVx = (Math.random() - 0.5) * 6;
      s.scatterVy = (Math.random() - 0.5) * 6 - 2;
      s.scatterAlpha = 1;
    });
  }

  let explosionParticles = [];

  function spawnExplosion(x, y) {
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      const colors = ['#f9a8d4','#c4b5fd','#fde68a','#6ee7b7','#a5f3fc','#ffffff'];
      explosionParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size:  1.5 + Math.random() * 3,
        gravity: 0.05,
      });
    }
  }

  /* ===== 主迴圈 ===== */
  function loop(ts) {
    animRaf = requestAnimationFrame(loop);
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    // 爆炸粒子更新
    explosionParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.97;
      p.alpha -= 0.012;
    });
    explosionParticles = explosionParticles.filter(p => p.alpha > 0);

    // 生成流星
    if (phase === 'catch') {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const uncaught = MY_WISHES.filter(w => !caught.includes(w.text));
        if (uncaught.length > 0) spawnShooter();
        spawnTimer = 1600 + Math.random() * 1200;
      }
    }

    // 流星移動
    shooters.forEach(sh => {
      sh.trail.push({ x: sh.x, y: sh.y });
      if (sh.trail.length > 12) sh.trail.shift();
      sh.x    += sh.vx;
      sh.y    += sh.vy;
      sh.life -= sh.isHers ? 0.014 : 0.007;
    });
    shooters = shooters.filter(sh => sh.life > 0 && !sh.hit);

    // 許願星移動
    wishedStars.forEach((s, i) => {
      if (phase === 'forming') {
        // 螺旋往中心聚集
        s.angle = (s.angle || 0) + 0.04;
        s.orbitR = Math.max(0, (s.orbitR || 60) - formingProgress * 1.5);
        const tx = W/2 + Math.cos(s.angle) * s.orbitR;
        const ty = H/2 + Math.sin(s.angle) * s.orbitR * 0.6;
        s.x += (tx - s.x) * 0.1;
        s.y += (ty - s.y) * 0.1;
        s.a  = Math.min(1, s.a + 0.02);
      } else if (phase === 'glow') {
        // 聚在中心不動，微微往中心靠
        s.x += (W/2 - s.x) * 0.06;
        s.y += (H/2 - s.y) * 0.06;
        s.a  = Math.min(1, s.a + 0.02);
      } else if (phase === 'flyaway') {
        // 快速往右飛走，加速度
        s.flyVx = (s.flyVx || 8) * 1.08;
        s.x    += s.flyVx;
        s.y    += (s.flyVy || 0);
        s.a     = Math.max(0, s.a - 0.05);
      } else if (phase === 'done') {
        // done 不動
      } else {
        s.x += (s.tx - s.x) * 0.04;
        s.y += (s.ty - s.y) * 0.04;
        s.a  = Math.min(1, s.a + 0.02);
      }
    });

    if (activeCard !== null)  cardAlpha       = Math.min(1, cardAlpha + dt * 0.005);
    if (phase === 'input')    inputPhaseAlpha = Math.min(1, inputPhaseAlpha + dt * 0.003);

    if (phase === 'forming') {
      formingProgress = Math.min(1, formingProgress + dt * 0.0009);
      if (formingProgress >= 1) {
        // 聚集完畢 → 發光一下後飛走
        phase = 'glow';
        formingProgress = 1;
      }
    }

    if (phase === 'glow') {
      formingProgress = Math.min(1.6, formingProgress + dt * 0.003);
      if (formingProgress >= 1.6) {
        // 飛走
        phase = 'flyaway';
        wishedStars.forEach(s => {
          const spread = (Math.random() - 0.5) * 4;
          s.flyVx = 8 + Math.random() * 6;
          s.flyVy = spread;
        });
      }
    }

    if (phase === 'flyaway') {
      // 所有星星飛出畫面後進 done
      const allGone = wishedStars.every(s => s.x > W + 50 || s.a <= 0);
      if (allGone) { phase = 'done'; doneAlpha = 0; }
    }

    if (phase === 'done') {
      doneAlpha = Math.min(1, doneAlpha + dt * 0.0018);
    }

    draw();
  }

  /* ===== 繪圖 ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawWishedStars();
    drawShooters();
    if (phase === 'catch')  drawHUD();
    if (activeCard)         drawCard();
    if (phase === 'input')  drawInputPhase();
    if (phase === 'forming' || phase === 'glow') drawFormingOverlay();
    if (phase === 'done')   drawDone();
  }

  function drawBg() {
    const bg = ctx.createRadialGradient(W*0.5, H*0.35, 0, W*0.5, H*0.35, H);
    bg.addColorStop(0, '#160d3a');
    bg.addColorStop(1, '#07071a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    bgStars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    });
  }

  function drawShooters() {
    shooters.forEach(sh => {
      const color = sh.wish ? sh.wish.color : '#ffffff';
      for (let i = 1; i < sh.trail.length; i++) {
        const ta = (i / sh.trail.length) * sh.life * 0.55;
        ctx.beginPath();
        ctx.moveTo(sh.trail[i-1].x, sh.trail[i-1].y);
        ctx.lineTo(sh.trail[i].x,   sh.trail[i].y);
        ctx.strokeStyle = hexToRgba(color, ta);
        ctx.lineWidth = sh.isHers ? 2 : 2.5;
        ctx.stroke();
      }
      ctx.globalAlpha = sh.life;
      const hg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 12);
      hg.addColorStop(0, color);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(sh.x-12, sh.y-12, 24, 24);
      if (!sh.isHers && sh.wish && sh.wish.emoji) {
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sh.wish.emoji, sh.x, sh.y - 2);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.globalAlpha = 1;
    });
  }

  function drawWishedStars() {
    const t = Date.now() * 0.001;
    wishedStars.forEach((s, i) => {
      ctx.globalAlpha = s.a;
      const pulse = 1 + Math.sin(t * 2 + i * 0.8) * 0.15;

      // 光暈
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 18 * pulse);
      g.addColorStop(0, s.color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.x-18, s.y-18, 36, 36);

      // emoji
      ctx.font = (14 * pulse) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, s.x, s.y);
      ctx.textBaseline = 'alphabetic';

      // 她的願望文字（phase不是forming才顯示）
      if (s.isHers && s.text && phase !== 'forming' && phase !== 'done') {
        ctx.font = '10px "Noto Serif TC", serif';
        ctx.fillStyle = s.color;
        ctx.textAlign = 'center';
        ctx.fillText(s.text, s.x, s.y + 16);
      }

      ctx.globalAlpha = 1;
    });
  }

  function drawHUD() {
    const total = MY_WISHES.length;
    const done  = caught.length;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('點擊流星收集  ' + done + ' / ' + total, W/2, H - 24);

    const bw = 140, bh = 4, bx = (W-bw)/2, by = H-14;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(bx, by, bw, bh, 2); ctx.fill();
    if (done > 0) {
      const grad = ctx.createLinearGradient(bx, 0, bx+bw, 0);
      grad.addColorStop(0, '#c4b5fd');
      grad.addColorStop(1, '#fde68a');
      ctx.fillStyle = grad;
      roundRect(bx, by, bw*(done/total), bh, 2); ctx.fill();
    }
  }

  function drawCard() {
    const item  = activeCard;
    const cardW = Math.min(W-48, 300);
    const cardH = 150;
    const cardX = (W-cardW)/2;
    const cardY = (H-cardH)/2;
    ctx.save();
    ctx.globalAlpha = cardAlpha;
    ctx.fillStyle = 'rgba(4,2,16,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(8,5,24,0.95)';
    roundRect(cardX, cardY, cardW, cardH, 20); ctx.fill();
    ctx.strokeStyle = item.color; ctx.lineWidth = 1.5;
    roundRect(cardX, cardY, cardW, cardH, 20); ctx.stroke();
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, W/2, cardY+46);
    ctx.font = '500 15px "Noto Serif TC", serif';
    ctx.fillStyle = item.color;
    ctx.shadowColor = item.color; ctx.shadowBlur = 10;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(item.text, W/2, cardY+96);
    ctx.shadowBlur = 0;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.35)';
    ctx.fillText('點擊繼續', W/2, cardY+cardH-14);
    ctx.restore();
  }

  function drawInputPhase() {
    ctx.save();
    ctx.globalAlpha = inputPhaseAlpha;
    ctx.textAlign = 'center';
    ctx.font = '300 14px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(249,168,212,0.85)';
    ctx.shadowColor = 'rgba(249,168,212,0.4)';
    ctx.shadowBlur = 12;
    ctx.fillText('所有願望都在天上等著了', W/2, H*0.38);
    ctx.font = '300 13px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(240,236,255,0.6)';
    ctx.shadowBlur = 0;
    ctx.fillText('換你許下願望吧，想許幾個都可以', W/2, H*0.38+30);
    ctx.restore();
  }

  function drawFormingOverlay() {
    const overlayA = Math.min(formingProgress, 1) * 0.4;
    ctx.fillStyle = 'rgba(4,2,16,' + overlayA + ')';
    ctx.fillRect(0, 0, W, H);

    const t = Date.now() * 0.001;

    // 旋轉光環
    [0.14, 0.2, 0.27].forEach((ratio, i) => {
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.rotate(t * (1.1 - i*0.3) * (i%2===0?1:-1));
      ctx.globalAlpha = Math.min(formingProgress,1) * (0.22 - i*0.05);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(W,H)*ratio, Math.min(W,H)*ratio*0.6, 0, 0, Math.PI*2);
      ctx.strokeStyle = i%2===0 ? '#c4b5fd' : '#f9a8d4';
      ctx.lineWidth = 1;
      ctx.setLineDash([5,10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // 發光球（glow 階段更亮）
    const glowIntensity = phase === 'glow'
      ? (formingProgress - 1) / 0.6  // 0→1
      : formingProgress * 0.6;
    const pulseR = 18 + Math.sin(t*5)*6 + glowIntensity*40;
    const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, pulseR*3);
    cg.addColorStop(0,   'rgba(255,255,255,' + Math.min(1, glowIntensity*1.5 + 0.3) + ')');
    cg.addColorStop(0.25,'rgba(249,168,212,' + Math.min(1, glowIntensity + 0.2) + ')');
    cg.addColorStop(0.6, 'rgba(196,181,253,' + (glowIntensity*0.4) + ')');
    cg.addColorStop(1,   'rgba(196,181,253,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(W/2-pulseR*3, H/2-pulseR*3, pulseR*6, pulseR*6);
  }

  function drawDone() {
    ctx.save();
    ctx.globalAlpha = doneAlpha;
    ctx.textAlign = 'center';

    // 宇宙背景光暈
    const hg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.45);
    hg.addColorStop(0, 'rgba(196,181,253,0.12)');
    hg.addColorStop(1, 'rgba(196,181,253,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, W, H);

    ctx.font = '300 17px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(249,168,212,0.9)';
    ctx.shadowColor = 'rgba(249,168,212,0.5)';
    ctx.shadowBlur = 18;
    ctx.fillText('帶著這些願望', W/2, H*0.78);
    ctx.font = '300 15px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(196,181,253,0.85)';
    ctx.shadowBlur = 0;
    ctx.fillText('飛向更遠的地方', W/2, H*0.78 + 32);
    ctx.font = '300 13px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(240,236,255,0.5)';
    ctx.fillText('希望都能實現', W/2, H*0.78 + 62);

    if (doneAlpha > 0.6) {
      const pulse = 0.4 + Math.sin(Date.now()*0.003)*0.3;
      ctx.globalAlpha = doneAlpha * pulse;
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,0.7)';
      ctx.fillText('✦ 點擊繼續 ✦', W/2, H*0.78 + 96);
    }
    ctx.restore();

    if (doneAlpha > 0.5) {
      canvas.onclick = () => {
        canvas.onclick = null;
        if (typeof window.onWishingComplete === 'function') {
          window.onWishingComplete();
        }
      };
    }
  }

  /* ===== 工具 ===== */
  function hexToRgba(hex, alpha) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  function destroy() {
    cancelAnimationFrame(animRaf);
    removeUI();
    canvas.removeEventListener('click',    onClick);
    canvas.removeEventListener('touchend', onTouch);
  }

  function removeUI() {
    document.getElementById('wish-send-btn') && document.getElementById('wish-send-btn').remove();
    document.getElementById('wish-done-btn') && document.getElementById('wish-done-btn').remove();
    if (inputEl) { inputEl.remove(); inputEl = null; }
    doneBtn = null;
  }

  return { init, destroy, reset };
})();