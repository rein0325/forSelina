/* =========================================
   相遇星 — 對話劇情
   ========================================= */

const FirstMeetScene = (() => {

  let canvas, ctx, W, H;
  let animRaf;
  let currentLine = 0;
  let phase = 'intro';
  let fadeAlpha = 0;
  let introAlpha = 0;
  let textReveal = 0;
  let canAdvance = false;
  let stars = [];
  let lampFlicker = 1;
  let lampTarget = 1;
  let curtainOffset = 0;
  let phoneGlow = 0.3;
  let phoneFade = 1;
  let finalTextAlpha = 0;
  let lastTime = 0;
  let flickerTimer = 3000;
  let avatarYu = null;
  let avatarTong = null;

  const DIALOG = [
    { speaker: '宇憲', text: '好好笑，你問卷填很快欸' },
    { speaker: '思彤', text: '噗哈哈 但你們要怎麼知道是誰填的呀' },
    { speaker: '宇憲', text: '死定了，忘記問老師的名字' },
    { speaker: '思彤', text: '聽說你現在被調到總部嗎？' },
    { speaker: '宇憲', text: '誰暴露我的行蹤' },
    { speaker: '思彤', text: '噗哈哈 不好說' },
    { speaker: '宇憲', text: '這麼神秘' },
    { speaker: '思彤', text: '其實是我沒記住人家名字' },
    { speaker: '宇憲', text: '你好過分' },
    { speaker: '宇憲', text: '那我可以等你約我' },
    { speaker: '思彤', text: '可以呀，等我回去' },
    { speaker: '宇憲', text: '煮飯...至少還沒有人被我毒死過' },
    { speaker: '思彤', text: '那聽起來比我好很多' },
    { speaker: '思彤', text: '不對！講的我毒死過人一樣～' },
    { speaker: '宇憲', text: '我會先給你試吃，要進去也是一起' },
    { speaker: '思彤', text: '倒也不用這麼浪漫，去醫院還要一起' },
    { speaker: '宇憲', text: '一起比較不孤單' },
    { speaker: '宇憲', text: '話說都能煮飯給你吃了，幫你夾個菜還好吧' },
    { speaker: '思彤', text: '哇，這是答應了？' },
    { speaker: '宇憲', text: '嗯？不然不要？' },
    { speaker: '思彤', text: '要！謝謝～' },
    { speaker: '宇憲', text: '有人要帶我去澳洲玩欸，怎麼會不忍心～' },
    { speaker: '思彤', text: '但我好窮？' },
    { speaker: '思彤', text: '話說，我可以加你 ig 嗎～' },
  ];

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    reset();
    bindEvents();
    // 載入頭像
    avatarYu = new Image();
    avatarYu.src = 'assets/images/yu-avatar.png';
    avatarTong = new Image();
    avatarTong.src = 'assets/images/tong-avatar.png';
    lastTime = performance.now();
    animRaf = requestAnimationFrame(loop);
  }

  function reset() {
    currentLine = 0;
    phase = 'intro';
    fadeAlpha = 0;
    introAlpha = 0;
    textReveal = 0;
    canAdvance = false;
    finalTextAlpha = 0;
    lampFlicker = 1;
    lampTarget = 1;
    curtainOffset = 0;
    phoneGlow = 0.3;
    phoneFade = 1;
    flickerTimer = 3000;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 40 }, () => ({
      x: W * 0.52 + Math.random() * W * 0.46,
      y: Math.random() * H * 0.72,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.006,
    }));
  }

  function bindEvents() {
    canvas.addEventListener('click', onAdvance);
    canvas.addEventListener('touchend', onAdvance, { passive: true });
  }

  function onAdvance() {
    if (phase === 'intro') {
      phase = 'dialog';
      textReveal = 0;
      canAdvance = false;
      return;
    }
    if (phase === 'dialog') {
      if (!canAdvance) {
        textReveal = DIALOG[currentLine].text.length;
        canAdvance = true;
        return;
      }
      currentLine++;
      if (currentLine >= DIALOG.length) {
        phase = 'fadeout';
      } else {
        textReveal = 0;
        canAdvance = false;
      }
    }
  }

  function loop(ts) {
    animRaf = requestAnimationFrame(loop);
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    flickerTimer -= dt;
    if (flickerTimer <= 0) {
      lampTarget = 0.55 + Math.random() * 0.3;
      setTimeout(() => { lampTarget = 0.92 + Math.random() * 0.08; }, 80);
      setTimeout(() => { lampTarget = 0.65 + Math.random() * 0.2; }, 160);
      setTimeout(() => { lampTarget = 1; }, 260);
      flickerTimer = 2500 + Math.random() * 4000;
    }
    lampFlicker += (lampTarget - lampFlicker) * 0.15;

    curtainOffset = Math.sin(ts * 0.0006) * 8;

    phoneGlow += phoneFade * dt * 0.0008;
    if (phoneGlow > 0.85) { phoneGlow = 0.85; phoneFade = -1; }
    if (phoneGlow < 0.25) { phoneGlow = 0.25; phoneFade = 1; }

    if (phase === 'intro') {
      introAlpha = Math.min(1, introAlpha + dt * 0.0008);
    }
    if (phase === 'dialog') {
      introAlpha = Math.max(0, introAlpha - dt * 0.003);
      const maxLen = DIALOG[currentLine].text.length;
      textReveal += dt * 0.045;
      if (textReveal >= maxLen) { textReveal = maxLen; canAdvance = true; }
    }
    if (phase === 'fadeout') {
      fadeAlpha = Math.min(1, fadeAlpha + dt * 0.0012);
      if (fadeAlpha >= 1) phase = 'finaltext';
    }
    if (phase === 'finaltext') {
      finalTextAlpha = Math.min(1, finalTextAlpha + dt * 0.0008);
      if (finalTextAlpha >= 1) {
        setTimeout(() => {
          if (typeof window.onFirstMeetComplete === 'function') {
            window.onFirstMeetComplete();
          }
        }, 2000);
        phase = 'done';
      }
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawWindow();
    drawCurtain();
    drawLamp();
    drawPhone();
    if (phase === 'dialog' || phase === 'fadeout') drawCharacters();
    if (phase === 'intro' && introAlpha > 0) drawIntro();
    if (phase === 'dialog' || phase === 'fadeout') drawDialog();
    if (phase === 'fadeout' || phase === 'finaltext' || phase === 'done') drawFade();
    if (phase === 'finaltext' || phase === 'done') drawFinalText();
  }

  function drawCharacters() {
    if (currentLine >= DIALOG.length) return;
    const isMe = DIALOG[currentLine].speaker === '宇憲';

    const dialogH = 184;
    const availH  = H - dialogH;
    const imgH    = availH * 0.88;

    // ── 宇憲（左側）──
    if (avatarYu && avatarYu.complete && avatarYu.naturalWidth > 0) {
      const ratio = avatarYu.naturalWidth / avatarYu.naturalHeight;
      const imgW  = imgH * ratio;
      const x     = -imgW * 0.05;
      const y     = availH - imgH;
      ctx.save();
      ctx.globalAlpha = isMe ? 1 : 0.35;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(avatarYu, x, y, imgW, imgH);
      ctx.restore();
    }

    // ── 思彤（右側）──
    if (avatarTong && avatarTong.complete && avatarTong.naturalWidth > 0) {
      const ratio = avatarTong.naturalWidth / avatarTong.naturalHeight;
      const imgW  = imgH * ratio;
      const x     = W - imgW * 0.95;
      const y     = availH - imgH;
      ctx.save();
      ctx.globalAlpha = isMe ? 0.35 : 1;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(avatarTong, x, y, imgW, imgH);
      ctx.restore();
    }
  }

  function drawBackground() {
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(0, 0, W, H);

    const lampX = W * 0.18;
    const lampY = H * 0.38;
    const wallLight = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, H * 0.75);
    wallLight.addColorStop(0, 'rgba(200,110,30,' + (0.45 * lampFlicker) + ')');
    wallLight.addColorStop(0.35, 'rgba(140,70,15,' + (0.28 * lampFlicker) + ')');
    wallLight.addColorStop(1, 'rgba(10,5,2,0)');
    ctx.fillStyle = wallLight;
    ctx.fillRect(0, 0, W, H);

    const deskY = H * 0.72;
    ctx.fillStyle = '#2a1a0c';
    ctx.fillRect(0, deskY, W * 0.45, H - deskY);

    const deskLight = ctx.createRadialGradient(lampX, deskY, 0, lampX, deskY + 20, 100);
    deskLight.addColorStop(0, 'rgba(230,160,50,' + (0.32 * lampFlicker) + ')');
    deskLight.addColorStop(1, 'rgba(230,160,50,0)');
    ctx.fillStyle = deskLight;
    ctx.fillRect(0, deskY, W * 0.45, H - deskY);
  }

  function drawWindow() {
    const wx = W * 0.54;
    const wy = H * 0.08;
    const ww = W * 0.38;
    const wh = H * 0.60;
    const frameW = 10;

    const nightGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
    nightGrad.addColorStop(0, '#050818');
    nightGrad.addColorStop(1, '#0a0e28');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(wx, wy, ww, wh);

    stars.forEach(function(s) {
      s.a += s.da;
      if (s.a < 0.05 || s.a > 0.9) s.da *= -1;
      if (s.x > wx && s.x < wx + ww && s.y > wy && s.y < wy + wh) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,210,255,' + s.a + ')';
        ctx.fill();
      }
    });

    ctx.strokeStyle = '#3d2410';
    ctx.lineWidth = frameW;
    ctx.strokeRect(wx + frameW / 2, wy + frameW / 2, ww - frameW, wh - frameW);

    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.strokeStyle = '#3d2410';
    ctx.lineWidth = frameW * 0.7;
    ctx.stroke();

    const winGlow = ctx.createLinearGradient(wx, wy, wx + ww * 0.3, wy);
    winGlow.addColorStop(0, 'rgba(200,110,30,' + (0.15 * lampFlicker) + ')');
    winGlow.addColorStop(1, 'rgba(180,100,30,0)');
    ctx.fillStyle = winGlow;
    ctx.fillRect(wx, wy, ww, wh);
  }

  function drawCurtain() {
    const wx = W * 0.54;
    const wy = H * 0.08;
    const wh = H * 0.60;
    const cw = 22;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.bezierCurveTo(
      wx + curtainOffset * 0.6, wy + wh * 0.3,
      wx + cw + curtainOffset, wy + wh * 0.6,
      wx + cw * 0.5 + curtainOffset * 0.4, wy + wh
    );
    ctx.lineTo(wx, wy + wh);
    ctx.closePath();
    ctx.fillStyle = 'rgba(60,35,15,0.85)';
    ctx.fill();

    const rx = wx + W * 0.38;
    ctx.beginPath();
    ctx.moveTo(rx, wy);
    ctx.bezierCurveTo(
      rx - curtainOffset * 0.6, wy + wh * 0.3,
      rx - cw - curtainOffset, wy + wh * 0.6,
      rx - cw * 0.5 - curtainOffset * 0.4, wy + wh
    );
    ctx.lineTo(rx, wy + wh);
    ctx.closePath();
    ctx.fillStyle = 'rgba(60,35,15,0.85)';
    ctx.fill();
    ctx.restore();
  }

  function drawLamp() {
    const lx = W * 0.18;
    const ly = H * 0.72;

    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx, ly - H * 0.28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lx - 30, ly - H * 0.28);
    ctx.lineTo(lx + 30, ly - H * 0.28);
    ctx.lineTo(lx + 20, ly - H * 0.33);
    ctx.lineTo(lx - 20, ly - H * 0.33);
    ctx.closePath();
    ctx.fillStyle = 'rgba(130,80,30,' + (0.7 + lampFlicker * 0.3) + ')';
    ctx.fill();

    ctx.strokeStyle = 'rgba(220,160,60,' + (0.3 * lampFlicker) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx - 30, ly - H * 0.28);
    ctx.lineTo(lx + 30, ly - H * 0.28);
    ctx.stroke();

    const glow = ctx.createRadialGradient(lx, ly - H * 0.26, 0, lx, ly - H * 0.26, H * 0.35);
    glow.addColorStop(0, 'rgba(255,210,80,' + (0.65 * lampFlicker) + ')');
    glow.addColorStop(0.15, 'rgba(240,160,40,' + (0.38 * lampFlicker) + ')');
    glow.addColorStop(0.4, 'rgba(200,100,20,' + (0.15 * lampFlicker) + ')');
    glow.addColorStop(1, 'rgba(180,80,10,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W * 0.5, H);

    const bulbGlow = ctx.createRadialGradient(lx, ly - H * 0.289, 0, lx, ly - H * 0.289, 18);
    bulbGlow.addColorStop(0, 'rgba(255,255,200,' + lampFlicker + ')');
    bulbGlow.addColorStop(0.4, 'rgba(255,220,100,' + (0.6 * lampFlicker) + ')');
    bulbGlow.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = bulbGlow;
    ctx.fillRect(lx - 18, ly - H * 0.289 - 18, 36, 36);

    ctx.beginPath();
    ctx.arc(lx, ly - H * 0.289, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,250,200,' + lampFlicker + ')';
    ctx.fill();
  }

  function drawPhone() {
    const px = W * 0.30;
    const deskY = H * 0.72;
    const pw = 32;
    const ph = 56;
    const py = deskY - ph - 2;
    const r = 6;

    // 手機外殼
    ctx.fillStyle = '#1c1c2a';
    roundRect(px - pw / 2, py, pw, ph, r);
    ctx.fill();

    // 外殼邊框
    ctx.strokeStyle = 'rgba(80,80,110,0.6)';
    ctx.lineWidth = 1.2;
    roundRect(px - pw / 2, py, pw, ph, r);
    ctx.stroke();

    // 螢幕區域（比外殼小一圈）
    const sx = px - pw / 2 + 3;
    const sy = py + 7;
    const sw = pw - 6;
    const sh = ph - 14;
    roundRect(sx, sy, sw, sh, 3);
    ctx.fillStyle = '#0a0f2e';
    ctx.fill();

    // 螢幕內容發光（藍白漸層，像開著某個app）
    const screenGlow = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    screenGlow.addColorStop(0, 'rgba(140,180,255,' + (phoneGlow * 0.9) + ')');
    screenGlow.addColorStop(0.5, 'rgba(100,140,255,' + (phoneGlow * 0.6) + ')');
    screenGlow.addColorStop(1, 'rgba(60,100,200,' + (phoneGlow * 0.4) + ')');
    ctx.fillStyle = screenGlow;
    roundRect(sx, sy, sw, sh, 3);
    ctx.fill();

    // 螢幕上的小假文字（兩條白線模擬聊天介面）
    ctx.fillStyle = 'rgba(255,255,255,' + (phoneGlow * 0.5) + ')';
    ctx.fillRect(sx + 4, sy + 6, sw * 0.55, 2.5);
    ctx.fillRect(sx + sw - sw * 0.45 - 4, sy + 12, sw * 0.45, 2.5);
    ctx.fillRect(sx + 4, sy + 18, sw * 0.4, 2.5);

    // 頂部鏡頭小點
    ctx.beginPath();
    ctx.arc(px, py + 4, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a40';
    ctx.fill();

    // 底部 home bar
    ctx.fillStyle = 'rgba(150,150,180,0.4)';
    ctx.fillRect(px - 8, py + ph - 5, 16, 2);

    // 螢幕光打在桌面上
    const tableGlow = ctx.createRadialGradient(px, deskY, 0, px, deskY, 50);
    tableGlow.addColorStop(0, 'rgba(100,140,255,' + (phoneGlow * 0.2) + ')');
    tableGlow.addColorStop(1, 'rgba(100,140,255,0)');
    ctx.fillStyle = tableGlow;
    ctx.fillRect(px - 50, deskY - 4, 100, 18);
  }

  function drawIntro() {
    ctx.save();
    ctx.globalAlpha = introAlpha;
    ctx.textAlign = 'center';

    ctx.font = '300 13px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(220,180,100,0.6)';
    ctx.fillText('2026.01.15', W / 2, H * 0.38);

    ctx.font = '300 18px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(240,220,180,0.85)';
    ctx.shadowColor = 'rgba(200,140,40,0.4)';
    ctx.shadowBlur = 12;
    ctx.fillText('那是一個普通的午後', W / 2, H * 0.38 + 40);
    ctx.fillText('一段對話，悄悄開始了', W / 2, H * 0.38 + 72);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(200,170,100,0.4)';
    ctx.shadowBlur = 0;
    ctx.fillText('點擊繼續', W / 2, H * 0.38 + 116);
    ctx.restore();
  }

  function drawDialog() {
    if (currentLine >= DIALOG.length) return;
    const line = DIALOG[currentLine];
    const isMe = line.speaker === '宇憲';
    const boxW = Math.min(W - 24, 460);
    const boxX = (W - boxW) / 2;
    const boxH = 160;
    const boxY = H - boxH - 16;
    const radius = 18;

    // 對話框背景
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = 'rgba(6,4,18,0.92)';
    roundRect(boxX, boxY, boxW, boxH, radius);
    ctx.fill();

    ctx.strokeStyle = isMe ? 'rgba(196,181,253,0.4)' : 'rgba(249,168,212,0.4)';
    ctx.lineWidth = 1.2;
    roundRect(boxX, boxY, boxW, boxH, radius);
    ctx.stroke();

    // 左側說話者色條
    ctx.fillStyle = isMe ? 'rgba(196,181,253,0.7)' : 'rgba(249,168,212,0.7)';
    roundRect(boxX, boxY + 20, 3, boxH - 40, 2);
    ctx.fill();
    ctx.restore();

    // 說話者名字
    ctx.font = '500 14px "Noto Serif TC", serif';
    ctx.fillStyle = isMe ? '#c4b5fd' : '#f9a8d4';
    ctx.textAlign = 'left';
    ctx.fillText(line.speaker, boxX + 20, boxY + 30);

    // 對話文字（逐字顯示）
    const displayText = line.text.slice(0, Math.floor(textReveal));
    ctx.font = '300 17px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(240,236,255,0.94)';
    wrapText(displayText, boxX + 20, boxY + 60, boxW - 40, 28);

    // 繼續提示
    if (canAdvance) {
      const pulse = 0.4 + Math.sin(Date.now() * 0.004) * 0.3;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,' + pulse + ')';
      ctx.textAlign = 'right';
      ctx.fillText('點擊繼續 ▶', boxX + boxW - 18, boxY + boxH - 14);
    }

    // 進度
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.22)';
    ctx.textAlign = 'left';
    ctx.fillText((currentLine + 1) + ' / ' + DIALOG.length, boxX + 18, boxY + boxH - 14);
  }

  function drawFade() {
    ctx.fillStyle = 'rgba(4,2,12,' + fadeAlpha + ')';
    ctx.fillRect(0, 0, W, H);
  }

  function drawFinalText() {
    ctx.save();
    ctx.globalAlpha = finalTextAlpha;
    ctx.textAlign = 'center';
    ctx.font = '300 20px "Noto Serif TC", serif';
    ctx.fillStyle = 'rgba(230,220,255,0.9)';
    ctx.shadowColor = 'rgba(196,181,253,0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText('就這樣開始了', W / 2, H / 2 - 16);
    ctx.fillText('我們的故事', W / 2, H / 2 + 20);
    ctx.shadowBlur = 0;

    const t = Date.now() * 0.0014;
    var decos = [
      { x: W / 2 - 80, y: H / 2 - 30 },
      { x: W / 2 + 80, y: H / 2 - 30 },
    ];
    decos.forEach(function(p, i) {
      const pulse = 0.3 + Math.sin(t + i * 1.5) * 0.25;
      ctx.globalAlpha = finalTextAlpha * pulse;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText('✦', p.x, p.y);
    });
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

  function wrapText(text, x, y, maxW, lineH) {
    const chars = text.split('');
    let line = '';
    let cy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line !== '') {
        ctx.fillText(line, x, cy);
        line = chars[i];
        cy += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, cy);
  }

  function destroy() {
    cancelAnimationFrame(animRaf);
    canvas.removeEventListener('click', onAdvance);
    canvas.removeEventListener('touchend', onAdvance);
  }

  return { init, destroy, reset };
})();