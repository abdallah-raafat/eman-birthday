/* ==========================================================================
   js/games.js — 6 Interactive Modern Mini-Games
   ========================================================================== */

(function () {
  'use strict';

  window.MiniGames = {
    launch(gameId, container, callbacks) {
      // Clear container
      container.innerHTML = '';
      
      const handlers = {
        catcher: launchCatcher,
        memory: launchMemory,
        balloon: launchBalloon,
        reflex: launchReflex,
        cake: launchCake,
        quiz: launchQuiz
      };

      const fn = handlers[gameId];
      if (!fn) {
        console.error('Unknown game ID:', gameId);
        return { stop: () => {} };
      }

      return fn(container, callbacks);
    }
  };

  // Helper for crisp high-DPI canvas
  function setupHiDPICanvas(canvas, container) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const rect = container.getBoundingClientRect();
    const w = rect.width || 360;
    const h = rect.height || 500;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: w, height: h, dpr };
  }

  // ==========================================================================
  // 1. GAME: CATCHER (لقط القلوب 💙)
  // ==========================================================================
  function launchCatcher(container, { updateHud, onFinish }) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    let { ctx, width, height } = setupHiDPICanvas(canvas, container);

    let score = 0;
    let lives = 3;
    let running = true;
    let animId = null;
    let spawnTimer = null;

    // Basket / Cloud
    const basket = {
      x: width / 2,
      y: height - 55,
      w: Math.min(width * 0.28, 110),
      h: 36,
      targetX: width / 2
    };

    const items = [];
    const particles = [];
    const floatTexts = [];

    function updateHudDisplay() {
      const hearts = '💙'.repeat(Math.max(0, lives)) + '🩶'.repeat(Math.max(0, 3 - lives));
      updateHud(`${score} نقطة  |  ${hearts}`);
    }
    updateHudDisplay();

    // Input handlers (drag/touch)
    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      basket.targetX = clientX - rect.left;
      if (basket.targetX < basket.w / 2) basket.targetX = basket.w / 2;
      if (basket.targetX > width - basket.w / 2) basket.targetX = width - basket.w / 2;
    }

    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchstart', onPointerMove, { passive: false });
    canvas.addEventListener('mousemove', onPointerMove);

    // Spawn falling items
    function spawnItem() {
      if (!running) return;
      const rand = Math.random();
      let type = 'heart';
      let symbol = '🩵';
      let pts = 1;
      let radius = 18;

      if (rand < 0.12) {
        type = 'star';
        symbol = '⭐';
        pts = 3;
        radius = 20;
      } else if (rand < 0.22) {
        type = 'letter';
        symbol = '💌';
        pts = 2;
        radius = 19;
      } else if (rand < 0.42 && score >= 4) {
        type = 'broken';
        symbol = '💔';
        pts = -2;
        radius = 20;
      }

      const speed = 2.2 + Math.min(score * 0.08, 4.5) + Math.random() * 0.8;
      items.push({
        x: Math.random() * (width - 60) + 30,
        y: -30,
        speed,
        type,
        symbol,
        pts,
        radius,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.05
      });

      const nextDelay = Math.max(450, 1100 - score * 18);
      spawnTimer = setTimeout(spawnItem, nextDelay);
    }
    spawnTimer = setTimeout(spawnItem, 500);

    function addParticles(x, y, color) {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1.5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1,
          color,
          radius: Math.random() * 3 + 2
        });
      }
    }

    function addFloatText(x, y, text, color) {
      floatTexts.push({ x, y, text, color, alpha: 1, vy: -1.8 });
    }

    // Main loop
    let lastTime = performance.now();
    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth basket follow
      basket.x += (basket.targetX - basket.x) * 0.35;

      ctx.clearRect(0, 0, width, height);

      // Draw faint vertical lanes guide
      ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
      ctx.fillRect(0, 0, width, height);

      // Update & Draw Items
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;
        item.rot += item.rotSpeed;

        // Collision with basket
        const hitX = Math.abs(item.x - basket.x) < basket.w / 2 + 10;
        const hitY = item.y + item.radius >= basket.y && item.y - item.radius <= basket.y + basket.h;

        if (hitX && hitY) {
          // Collected!
          if (item.type === 'broken') {
            lives--;
            score = Math.max(0, score + item.pts);
            window.AppCore.playLose();
            window.AppCore.vibrate([80, 50, 80]);
            addParticles(item.x, item.y, '#fb7185');
            addFloatText(item.x, item.y, '-2 💔', '#fb7185');
          } else {
            score += item.pts;
            if (item.type === 'star') {
              window.AppCore.playChime();
              window.AppCore.vibrate([40, 30, 60]);
              addParticles(item.x, item.y, '#ffd166');
              addFloatText(item.x, item.y, '+3 ⭐', '#ffd166');
            } else {
              window.AppCore.playPop();
              window.AppCore.vibrate(30);
              addParticles(item.x, item.y, '#38bdf8');
              addFloatText(item.x, item.y, `+${item.pts} 🩵`, '#38bdf8');
            }
          }
          updateHudDisplay();
          items.splice(i, 1);

          if (lives <= 0) {
            endGame();
            return;
          }
          continue;
        }

        // Missed item (off bottom)
        if (item.y > height + 40) {
          items.splice(i, 1);
          continue;
        }

        // Render Item
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot);
        ctx.font = `${item.radius * 1.8}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, 0, 0);
        ctx.restore();
      }

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Floating Texts
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.03;
        if (ft.alpha <= 0) {
          floatTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Draw Basket (Labani rounded cloud/cart with glow)
      ctx.save();
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 18;
      
      // Cart base
      const grad = ctx.createLinearGradient(basket.x - basket.w / 2, basket.y, basket.x + basket.w / 2, basket.y + basket.h);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = grad;

      ctx.beginPath();
      const r = 16;
      const bx = basket.x - basket.w / 2;
      const by = basket.y;
      const bw = basket.w;
      const bh = basket.h;
      ctx.roundRect(bx, by, bw, bh, [r, r, 20, 20]);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Basket label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#031225';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MIMI 🩵', basket.x, basket.y + basket.h / 2);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      clearTimeout(spawnTimer);
      cancelAnimationFrame(animId);
      window.AppCore.playLose();
      window.AppCore.vibrate([100, 50, 150]);
      setTimeout(() => {
        onFinish(score);
      }, 500);
    }

    animId = requestAnimationFrame(loop);

    return {
      stop() {
        running = false;
        clearTimeout(spawnTimer);
        cancelAnimationFrame(animId);
        canvas.removeEventListener('touchmove', onPointerMove);
        canvas.removeEventListener('touchstart', onPointerMove);
        canvas.removeEventListener('mousemove', onPointerMove);
      }
    };
  }

  // ==========================================================================
  // 2. GAME: MEMORY (ذاكرة الحب 🧠)
  // ==========================================================================
  function launchMemory(container, { updateHud, onFinish }) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    container.appendChild(grid);

    // 6 Pairs = 12 Cards
    const cardDefs = [
      { id: 'us', type: 'img', src: 'us-together.jpg' },
      { id: 'hands', type: 'img', src: 'our-love.jpg' },
      { id: 'heart', type: 'emoji', val: '🩵' },
      { id: 'cake', type: 'emoji', val: '🎂' },
      { id: 'ring', type: 'emoji', val: '💍' },
      { id: 'crown', type: 'emoji', val: '👑' }
    ];

    let deck = [...cardDefs, ...cardDefs]
      .map((item, idx) => ({ ...item, uid: idx }))
      .sort(() => Math.random() - 0.5);

    let flipped = [];
    let matchedCount = 0;
    let moves = 0;
    let startTime = null;
    let timerInterval = null;
    let elapsed = 0;
    let locked = false;

    function renderCards() {
      grid.innerHTML = '';
      deck.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.dataset.id = item.id;
        card.dataset.uid = item.uid;

        const back = document.createElement('div');
        back.className = 'mem-face mem-back';

        const front = document.createElement('div');
        front.className = 'mem-face mem-front';
        if (item.type === 'img') {
          front.style.backgroundImage = `url("${item.src}")`;
        } else {
          front.textContent = item.val;
          front.style.fontSize = '2.2rem';
        }

        card.appendChild(back);
        card.appendChild(front);

        card.addEventListener('click', () => onCardClick(card, item));
        grid.appendChild(card);
      });
    }

    function onCardClick(cardEl, item) {
      if (locked || cardEl.classList.contains('flip') || cardEl.classList.contains('done')) return;

      if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
          elapsed = Math.floor((Date.now() - startTime) / 1000);
          updateHud(`⏱️ ${elapsed}s  |  🔄 ${moves} حركة`);
        }, 1000);
      }

      cardEl.classList.add('flip');
      window.AppCore.playTap();
      window.AppCore.vibrate(25);
      flipped.push({ el: cardEl, item });

      if (flipped.length === 2) {
        moves++;
        updateHud(`⏱️ ${elapsed}s  |  🔄 ${moves} حركة`);
        const [c1, c2] = flipped;
        locked = true;

        if (c1.item.id === c2.item.id) {
          // Match!
          matchedCount++;
          window.AppCore.playCoin();
          window.AppCore.vibrate([40, 30, 60]);
          setTimeout(() => {
            c1.el.classList.add('done');
            c2.el.classList.add('done');
            flipped = [];
            locked = false;

            if (matchedCount === cardDefs.length) {
              // Game Won!
              clearInterval(timerInterval);
              window.AppCore.playWin();
              window.AppCore.vibrate([50, 40, 100, 50, 150]);
              if (typeof confetti === 'function') {
                confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
              }
              setTimeout(() => {
                onFinish(elapsed);
              }, 900);
            }
          }, 350);
        } else {
          // Mismatch
          window.AppCore.playPop();
          setTimeout(() => {
            c1.el.classList.remove('flip');
            c2.el.classList.remove('flip');
            flipped = [];
            locked = false;
          }, 850);
        }
      }
    }

    renderCards();
    updateHud('⏱️ 0s  |  🔄 0 حركة');

    return {
      stop() {
        clearInterval(timerInterval);
      }
    };
  }

  // ==========================================================================
  // 3. GAME: BALLOON (فرقع البالونات 🎈)
  // ==========================================================================
  function launchBalloon(container, { updateHud, onFinish }) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    let { ctx, width, height } = setupHiDPICanvas(canvas, container);

    let score = 0;
    let timeLeft = 30;
    let running = true;
    let animId = null;
    let countdownInterval = null;
    let spawnTimer = null;

    const balloons = [];
    const particles = [];
    const floatTexts = [];

    function updateHudDisplay() {
      updateHud(`⏱️ ${timeLeft}s  |  🎈 ${score}`);
    }
    updateHudDisplay();

    countdownInterval = setInterval(() => {
      timeLeft--;
      updateHudDisplay();
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    const colors = [
      { fill: '#38bdf8', stroke: '#7dd3fc', type: 'blue', pts: 1, sym: '' },
      { fill: '#0284c7', stroke: '#38bdf8', type: 'blue', pts: 1, sym: '' },
      { fill: '#bae6fd', stroke: '#e0f2fe', type: 'ice', pts: 1, sym: '' },
      { fill: '#ffd166', stroke: '#fff', type: 'gold', pts: 3, sym: '⭐' },
      { fill: '#38bdf8', stroke: '#ffd166', type: 'love', pts: 2, sym: '🩵' }
    ];

    function spawnBalloon() {
      if (!running) return;
      const rand = Math.random();
      let preset = colors[0];
      if (rand < 0.15) preset = colors[3]; // gold
      else if (rand < 0.35) preset = colors[4]; // love
      else if (rand < 0.65) preset = colors[1];
      else preset = colors[2];

      const radius = Math.random() * 12 + 28;
      balloons.push({
        x: Math.random() * (width - radius * 2) + radius,
        y: height + radius + 20,
        radius,
        speed: Math.random() * 2.2 + 2.4,
        swaySpeed: Math.random() * 0.03 + 0.02,
        swayAmp: Math.random() * 18 + 10,
        swayOffset: Math.random() * Math.PI * 2,
        baseX: 0,
        preset
      });
      balloons[balloons.length - 1].baseX = balloons[balloons.length - 1].x;

      const delay = Math.max(300, 650 - (30 - timeLeft) * 8);
      spawnTimer = setTimeout(spawnBalloon, delay);
    }
    spawnTimer = setTimeout(spawnBalloon, 200);

    function onPointerDown(e) {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const clientY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        const dx = clientX - b.x;
        const dy = clientY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= b.radius * 1.25) {
          // Popped!
          score += b.preset.pts;
          updateHudDisplay();
          window.AppCore.playPop();
          window.AppCore.vibrate(28);

          // Add splash particles
          for (let k = 0; k < 12; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 4 + 2;
            particles.push({
              x: b.x, y: b.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              alpha: 1,
              color: b.preset.fill,
              radius: Math.random() * 3 + 2
            });
          }

          // Floating score
          const sign = b.preset.pts > 1 ? `+${b.preset.pts} ${b.preset.sym}` : '+1';
          floatTexts.push({
            x: b.x,
            y: b.y,
            text: sign,
            color: b.preset.type === 'gold' ? '#ffd166' : '#bae6fd',
            alpha: 1,
            vy: -2
          });

          balloons.splice(i, 1);
          break;
        }
      }
    }

    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('mousedown', onPointerDown);

    let step = 0;
    function loop() {
      if (!running) return;
      step++;
      ctx.clearRect(0, 0, width, height);

      // Draw faint blue background
      ctx.fillStyle = 'rgba(6, 20, 42, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Update & Draw Balloons
      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.y -= b.speed;
        b.x = b.baseX + Math.sin(step * b.swaySpeed + b.swayOffset) * b.swayAmp;

        if (b.y < -b.radius - 40) {
          balloons.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(b.x, b.y);

        // String
        ctx.beginPath();
        ctx.moveTo(0, b.radius);
        ctx.quadraticCurveTo(Math.sin(step * 0.1) * 8, b.radius + 15, 0, b.radius + 35);
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Balloon body
        ctx.beginPath();
        ctx.ellipse(0, 0, b.radius, b.radius * 1.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = b.preset.fill;
        ctx.shadowColor = b.preset.fill;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = b.preset.stroke;
        ctx.stroke();

        // Knot
        ctx.beginPath();
        ctx.moveTo(-4, b.radius * 1.15);
        ctx.lineTo(4, b.radius * 1.15);
        ctx.lineTo(0, b.radius * 1.25);
        ctx.closePath();
        ctx.fillStyle = b.preset.fill;
        ctx.fill();

        // Highlight sheen
        ctx.beginPath();
        ctx.ellipse(-b.radius * 0.35, -b.radius * 0.4, b.radius * 0.22, b.radius * 0.35, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        // Symbol if special
        if (b.preset.sym) {
          ctx.font = `${b.radius * 0.9}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.preset.sym, 0, 0);
        }

        ctx.restore();
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Floating Texts
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.035;
        if (ft.alpha <= 0) {
          floatTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      clearInterval(countdownInterval);
      clearTimeout(spawnTimer);
      cancelAnimationFrame(animId);
      window.AppCore.playWin();
      window.AppCore.vibrate([60, 40, 100]);
      setTimeout(() => {
        onFinish(score);
      }, 600);
    }

    animId = requestAnimationFrame(loop);

    return {
      stop() {
        running = false;
        clearInterval(countdownInterval);
        clearTimeout(spawnTimer);
        cancelAnimationFrame(animId);
        canvas.removeEventListener('touchstart', onPointerDown);
        canvas.removeEventListener('mousedown', onPointerDown);
      }
    };
  }

  // ==========================================================================
  // 4. GAME: REFLEX (سرعة نبضك ⚡)
  // ==========================================================================
  function launchReflex(container, { updateHud, onFinish }) {
    container.innerHTML = '';
    const zone = document.createElement('div');
    zone.className = 'reflex-zone';

    const heart = document.createElement('div');
    heart.className = 'reflex-heart';
    heart.textContent = '💙';

    const label = document.createElement('div');
    label.className = 'reflex-label';
    label.textContent = 'استعدي وركزي في الشاشة.. 👀';

    const roundsBox = document.createElement('div');
    roundsBox.className = 'reflex-rounds';
    roundsBox.innerHTML = `
      <span id="rr1">—</span>
      <span id="rr2">—</span>
      <span id="rr3">—</span>
      <span id="rr4">—</span>
      <span id="rr5">—</span>
    `;

    zone.appendChild(heart);
    zone.appendChild(label);
    zone.appendChild(roundsBox);
    container.appendChild(zone);

    const TOTAL_ROUNDS = 5;
    let currentRound = 1;
    let scores = [];
    let state = 'waiting'; // 'waiting', 'ready', 'clicked'
    let greenStartTime = 0;
    let waitTimer = null;
    let active = true;

    function updateHudDisplay() {
      updateHud(`الجولة ${currentRound}/${TOTAL_ROUNDS}`);
    }
    updateHudDisplay();

    function startRound() {
      if (!active) return;
      state = 'waiting';
      zone.className = 'reflex-zone';
      label.textContent = 'استعدي.. أول ما القلب ينور أزرق دوسي فوراً!';
      updateHudDisplay();

      // Random delay between 1.6s and 3.8s
      const delay = Math.random() * 2200 + 1600;
      waitTimer = setTimeout(() => {
        if (!active || state !== 'waiting') return;
        state = 'ready';
        zone.classList.add('go');
        label.textContent = 'دوسي دلوقتييييي! ⚡⚡';
        greenStartTime = performance.now();
        window.AppCore.playPop();
      }, delay);
    }

    function onZoneTap() {
      if (!active) return;

      if (state === 'waiting') {
        // Tapped too early!
        clearTimeout(waitTimer);
        state = 'clicked';
        zone.classList.add('early');
        label.textContent = 'بدري أوي يا ميمي! 🙈 استني لما ينور أزرق!';
        window.AppCore.playLose();
        window.AppCore.vibrate([100, 50, 100]);

        setTimeout(() => {
          if (active) startRound();
        }, 1200);
      } else if (state === 'ready') {
        // Successful tap!
        const reactionTime = Math.round(performance.now() - greenStartTime);
        state = 'clicked';
        scores.push(reactionTime);

        const rSlot = document.getElementById(`rr${currentRound}`);
        if (rSlot) {
          rSlot.textContent = `${reactionTime}ms`;
          rSlot.style.borderColor = 'var(--ok)';
          rSlot.style.color = 'var(--labani)';
        }

        window.AppCore.playChime();
        window.AppCore.vibrate(30);

        if (reactionTime < 240) {
          label.textContent = `⚡ صاااروخ! ${reactionTime}ms! سريعة جداً ما شاء الله! 🩵`;
        } else if (reactionTime < 340) {
          label.textContent = `✨ ممتاز! ${reactionTime}ms! رد فعلك رائع! 👏`;
        } else {
          label.textContent = `💕 ${reactionTime}ms! عاش يا قمر، شدي حيلك!`;
        }

        currentRound++;
        if (currentRound > TOTAL_ROUNDS) {
          // Finished all rounds!
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          window.AppCore.playWin();
          window.AppCore.vibrate([50, 40, 100, 50, 150]);
          setTimeout(() => {
            onFinish(avg);
          }, 1100);
        } else {
          setTimeout(() => {
            if (active) startRound();
          }, 1300);
        }
      }
    }

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onZoneTap();
    });
    zone.addEventListener('mousedown', onZoneTap);

    // Initial countdown
    setTimeout(startRound, 600);

    return {
      stop() {
        active = false;
        clearTimeout(waitTimer);
      }
    };
  }

  // ==========================================================================
  // 5. GAME: CAKE STACKER (ابني التورتة 🎂)
  // ==========================================================================
  function launchCake(container, { updateHud, onFinish }) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    let { ctx, width, height } = setupHiDPICanvas(canvas, container);

    let score = 0;
    let running = true;
    let animId = null;

    // Tiers stack
    const tierHeight = 32;
    const baseWidth = Math.min(width * 0.72, 240);
    const baseY = height - 50;

    const stack = [
      { x: (width - baseWidth) / 2, y: baseY, w: baseWidth, color: '#0284c7' }
    ];

    // Current moving block
    let moving = {
      x: 0,
      y: baseY - tierHeight,
      w: baseWidth,
      speed: 3.2,
      dir: 1,
      color: '#38bdf8'
    };

    const palette = ['#38bdf8', '#7dd3fc', '#bae6fd', '#0284c7', '#ffd166', '#e0f2fe'];
    const particles = [];
    const floatTexts = [];

    function updateHudDisplay() {
      updateHud(`🎂 ${score} أدوار`);
    }
    updateHudDisplay();

    function placeTier() {
      if (!running) return;

      const topTier = stack[stack.length - 1];
      const diff = moving.x - topTier.x;
      const absDiff = Math.abs(diff);

      if (absDiff < 4) {
        // Perfect Alignment!
        moving.x = topTier.x; // snap
        stack.push({ x: moving.x, y: moving.y, w: moving.w, color: moving.color });
        score++;
        window.AppCore.playChime();
        window.AppCore.vibrate([30, 20, 60]);

        // Sparkle
        for (let i = 0; i < 14; i++) {
          particles.push({
            x: moving.x + Math.random() * moving.w,
            y: moving.y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 4 - 1,
            color: '#ffd166',
            alpha: 1,
            r: Math.random() * 3 + 2
          });
        }
        floatTexts.push({ x: width / 2, y: moving.y - 15, text: 'PERFECT! ✨', color: '#ffd166', alpha: 1 });
      } else if (absDiff < moving.w) {
        // Partial overlap
        const newWidth = moving.w - absDiff;
        let newX = diff > 0 ? moving.x : topTier.x;

        stack.push({ x: newX, y: moving.y, w: newWidth, color: moving.color });
        score++;
        window.AppCore.playTap();
        window.AppCore.vibrate(30);

        // Falling cut piece
        const cutX = diff > 0 ? newX + newWidth : moving.x;
        const cutW = absDiff;
        particles.push({
          x: cutX + cutW / 2,
          y: moving.y,
          vx: diff > 0 ? 2 : -2,
          vy: 2,
          color: moving.color,
          alpha: 1,
          r: 6,
          isBlock: true,
          bw: cutW,
          bh: tierHeight
        });

        moving.w = newWidth;
      } else {
        // Total Miss! Game Over!
        endGame();
        return;
      }

      updateHudDisplay();

      // Check if stack reaches too high -> scroll down
      if (moving.y < height * 0.35) {
        stack.forEach(t => t.y += tierHeight);
      }

      // Next tier
      const nextColor = palette[score % palette.length];
      const nextSpeed = Math.min(3.2 + score * 0.18, 7.5);
      moving = {
        x: Math.random() > 0.5 ? 0 : width - moving.w,
        y: stack[stack.length - 1].y - tierHeight,
        w: moving.w,
        speed: nextSpeed,
        dir: 1,
        color: nextColor
      };
    }

    function onScreenTap(e) {
      e.preventDefault();
      placeTier();
    }

    canvas.addEventListener('touchstart', onScreenTap, { passive: false });
    canvas.addEventListener('mousedown', onScreenTap);

    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      // Background lines
      ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
      ctx.fillRect(0, 0, width, height);

      // Update Moving Block
      moving.x += moving.speed * moving.dir;
      if (moving.x <= 0) {
        moving.x = 0;
        moving.dir = 1;
      } else if (moving.x + moving.w >= width) {
        moving.x = width - moving.w;
        moving.dir = -1;
      }

      // Draw Stack
      stack.forEach((tier, idx) => {
        ctx.save();
        ctx.fillStyle = tier.color;
        ctx.shadowColor = tier.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(tier.x, tier.y, tier.w, tierHeight - 2, 8);
        ctx.fill();

        // Drip frosting on top edge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(tier.x + 3, tier.y + 2, tier.w - 6, 6, 3);
        ctx.fill();

        if (idx === 0) {
          // Plate
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Moving Tier
      ctx.save();
      ctx.fillStyle = moving.color;
      ctx.shadowColor = moving.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(moving.x, moving.y, moving.w, tierHeight - 2, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.roundRect(moving.x + 3, moving.y + 2, moving.w - 6, 6, 3);
      ctx.fill();
      ctx.restore();

      // Particles & cut pieces
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.alpha -= 0.025;
        if (p.alpha <= 0 || p.y > height + 50) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.isBlock) {
          ctx.fillRect(p.x, p.y, p.bw, p.bh);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Floating Texts
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y -= 1.2;
        ft.alpha -= 0.03;
        if (ft.alpha <= 0) {
          floatTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      cancelAnimationFrame(animId);
      window.AppCore.playLose();
      window.AppCore.vibrate([100, 50, 150]);
      setTimeout(() => {
        onFinish(score);
      }, 700);
    }

    animId = requestAnimationFrame(loop);

    return {
      stop() {
        running = false;
        cancelAnimationFrame(animId);
        canvas.removeEventListener('touchstart', onScreenTap);
        canvas.removeEventListener('mousedown', onScreenTap);
      }
    };
  }

  // ==========================================================================
  // 6. GAME: QUIZ (تعرف عني إيه؟ 💌)
  // ==========================================================================
  function launchQuiz(container, { updateHud, onFinish }) {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'quiz-wrap';

    wrap.innerHTML = `
      <div class="quiz-progress">
        <span id="quizQNum">السؤال 1 من 6</span>
        <span id="quizScoreText">0 نقطة</span>
      </div>
      <div class="quiz-timer"><div id="quizTimerBar"></div></div>
      <div class="quiz-q" id="quizQuestionText">—</div>
      <div class="quiz-opts" id="quizOptionsBox"></div>
    `;
    container.appendChild(wrap);

    const questions = [
      {
        q: 'مين أكتر واحد بيحب التاني أكتر في الكون والوجود؟ 😉',
        opts: [
          { text: 'عبدالله بيحب إيمان أكتر بكتير ومستولية على قلبه 🩵', right: true },
          { text: 'إيمان بتحب عبدالله أكتر', right: false },
          { text: 'الاتنين قد بعض بالظبط', right: false },
          { text: 'محدش بيحب حد 😂', right: false }
        ]
      },
      {
        q: 'إيه أكتر كلمة عبدالله بيحب يسمعها بصوت ميمي الرقيق؟ 💕',
        opts: [
          { text: '"بحبك يا دودي" برقة ودلع 🙈', right: true },
          { text: '"عايزة آكل"', right: false },
          { text: '"يلا نخرج ونلف"', right: false },
          { text: '"فين الهدية بتاعتي"', right: false }
        ]
      },
      {
        q: 'أعظم وأحلى يوم في تاريخ البشرية بالنسبة لعبدالله هو: ✨',
        opts: [
          { text: '1 أكتوبر.. يوم ما نورتي الدنيا يا ميمي 🎂🩵', right: true },
          { text: 'أول يوم في الإجازة', right: false },
          { text: 'يوم نهائي دوري الأبطال', right: false },
          { text: 'يوم الخميس بالليل', right: false }
        ]
      },
      {
        q: 'لما إيمان بتزعل أو تتقمص، عبدالله بيعمل إيه فوراً؟ 🥺',
        opts: [
          { text: 'بيصالحها ويدلعها ومينامش إلا وهي بتضحك 🩵', right: true },
          { text: 'بيقولها براحتك يا ستي', right: false },
          { text: 'بيطنشها', right: false },
          { text: 'بيروح ينام ويسيبها', right: false }
        ]
      },
      {
        q: 'أكتر حاجة بتسحر عبدالله في مونمونتي وتخليه يضيع: 👀',
        opts: [
          { text: 'ضحكتها وعينيها اللي مليانة حنية وأمان ✨', right: true },
          { text: 'طريقة أكلها للحلويات', right: false },
          { text: 'طول لسانها لما بتعاند 😂', right: false },
          { text: 'صوتها وهي نايمة', right: false }
        ]
      },
      {
        q: 'وعد عبدالله لحبيبته ميمي في عيد ميلادها وكل سنين عمرها: 💍',
        opts: [
          { text: 'هفضل جنبك وسندك وأحبك أكتر مع كل دقة قلب للأبد 🩵', right: true },
          { text: 'هشتريلك كل الشوكولاتة في السوبرماركت', right: false },
          { text: 'مش هتخانق معاكي خالص', right: false },
          { text: 'هخرجك كل يوم جمعة', right: false }
        ]
      }
    ];

    let currentIdx = 0;
    let score = 0;
    let qTimer = null;
    let timeLeft = 10;
    let active = true;

    const qNumEl = wrap.querySelector('#quizQNum');
    const scoreTextEl = wrap.querySelector('#quizScoreText');
    const timerBarEl = wrap.querySelector('#quizTimerBar');
    const qTextEl = wrap.querySelector('#quizQuestionText');
    const optsBox = wrap.querySelector('#quizOptionsBox');

    function updateHudDisplay() {
      updateHud(`${score} نقطة`);
      scoreTextEl.textContent = `${score} نقطة`;
    }
    updateHudDisplay();

    function showQuestion() {
      if (!active || currentIdx >= questions.length) {
        endQuiz();
        return;
      }

      const qObj = questions[currentIdx];
      qNumEl.textContent = `السؤال ${currentIdx + 1} من ${questions.length}`;
      qTextEl.textContent = qObj.q;
      optsBox.innerHTML = '';

      // Shuffle options for variety
      const shuffledOpts = [...qObj.opts].sort(() => Math.random() - 0.5);

      shuffledOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => pickOption(btn, opt, shuffledOpts));
        optsBox.appendChild(btn);
      });

      // 10s Timer bar
      timeLeft = 10;
      timerBarEl.style.transition = 'none';
      timerBarEl.style.transform = 'scaleX(1)';
      setTimeout(() => {
        timerBarEl.style.transition = 'transform 10s linear';
        timerBarEl.style.transform = 'scaleX(0)';
      }, 30);

      clearInterval(qTimer);
      const startT = Date.now();
      qTimer = setInterval(() => {
        timeLeft = 10 - Math.floor((Date.now() - startT) / 1000);
        if (timeLeft <= 0) {
          clearInterval(qTimer);
          timeOutQuestion(shuffledOpts);
        }
      }, 250);
    }

    function pickOption(btn, opt, allOpts) {
      clearInterval(qTimer);
      const allBtns = optsBox.querySelectorAll('.quiz-opt');
      allBtns.forEach(b => b.disabled = true);

      if (opt.right) {
        btn.classList.add('right');
        // Base points + speed bonus
        const speedBonus = Math.max(0, timeLeft * 5);
        const earned = 100 + speedBonus;
        score += earned;
        window.AppCore.playCoin();
        window.AppCore.vibrate([40, 30, 60]);
      } else {
        btn.classList.add('wrong');
        window.AppCore.playLose();
        window.AppCore.vibrate([80, 50, 80]);
        // Highlight the right answer
        allBtns.forEach((b, i) => {
          if (allOpts[i].right) b.classList.add('right');
        });
      }

      updateHudDisplay();

      setTimeout(() => {
        if (!active) return;
        currentIdx++;
        showQuestion();
      }, 1100);
    }

    function timeOutQuestion(allOpts) {
      const allBtns = optsBox.querySelectorAll('.quiz-opt');
      allBtns.forEach(b => b.disabled = true);
      window.AppCore.playLose();
      window.AppCore.vibrate([80, 50, 80]);

      allBtns.forEach((b, i) => {
        if (allOpts[i].right) b.classList.add('right');
      });

      setTimeout(() => {
        if (!active) return;
        currentIdx++;
        showQuestion();
      }, 1100);
    }

    function endQuiz() {
      active = false;
      clearInterval(qTimer);
      window.AppCore.playWin();
      window.AppCore.vibrate([50, 40, 100, 50, 150]);
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }
      setTimeout(() => {
        onFinish(score);
      }, 700);
    }

    showQuestion();

    return {
      stop() {
        active = false;
        clearInterval(qTimer);
      }
    };
  }

})();
