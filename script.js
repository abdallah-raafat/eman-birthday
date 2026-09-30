/* ==========================================================================
   HAPPY BIRTHDAY EMAN ❤️ | INTERACTION ENGINE
   Handles Audio Autoplay, Interactive Cake, Confetti, and Flirty Triggers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Audio Player & Autoplay Management
  // --------------------------------------------------------------------------
  const audio = document.getElementById('bgMusic');
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioPillText = document.getElementById('audioPillText');
  const unlockOverlay = document.getElementById('unlockOverlay');
  const unlockBtn = document.getElementById('unlockBtn');
  let isPlaying = false;

  const startMusic = () => {
    if (!audio) return;
    audio.play().then(() => {
      isPlaying = true;
      if (audioBtn) audioBtn.classList.add('playing');
      if (audioPillText) audioPillText.textContent = "العسيلي شغال 🎵";
      if (unlockOverlay) unlockOverlay.classList.add('hidden');
    }).catch(err => {
      console.log('Autoplay blocked by browser policy, showing unlock button:', err);
      if (unlockOverlay) unlockOverlay.classList.remove('hidden');
    });
  };

  // Attempt automatic playback immediately
  startMusic();

  // If user clicks unlock button or anywhere on overlay
  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMusic();
      launchConfettiCannon();
    });
  }

  if (unlockOverlay) {
    unlockOverlay.addEventListener('click', () => {
      startMusic();
      launchConfettiCannon();
    });
  }

  // Audio Toggle Button
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        audioBtn.classList.remove('playing');
        if (audioPillText) audioPillText.textContent = "الموسيقى متوقفة ⏸️";
      } else {
        audio.play().then(() => {
          isPlaying = true;
          audioBtn.classList.add('playing');
          if (audioPillText) audioPillText.textContent = "العسيلي شغال 🎵";
        });
      }
    });
  }

  // Ensure seamless looping forever
  if (audio) {
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Loop error:', e));
    });
  }

  // --------------------------------------------------------------------------
  // 2. Interactive Birthday Cake (Blow Out the Candles 🎂)
  // --------------------------------------------------------------------------
  const blowBtn = document.getElementById('blowCandlesBtn');
  const blowBtnText = document.getElementById('blowBtnText');
  const flames = [
    document.getElementById('flame1'),
    document.getElementById('flame2'),
    document.getElementById('flame3')
  ];
  const wishRevealCard = document.getElementById('wishRevealCard');
  let candlesBlown = false;

  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      if (!candlesBlown) {
        candlesBlown = true;

        // Extinguish flames with delay
        flames.forEach((f, idx) => {
          if (f) {
            setTimeout(() => {
              f.classList.add('extinguished');
            }, idx * 120);
          }
        });

        // Update button
        if (blowBtnText) {
          blowBtnText.textContent = "طفينا الشمع وولعنا الحب! 🎉❤️";
        }
        blowBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        blowBtn.style.color = "#ffffff";

        // Show Wish Reveal Card
        setTimeout(() => {
          if (wishRevealCard) {
            wishRevealCard.classList.add('show');
            wishRevealCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 400);

        // Huge Celebration Confetti
        launchConfettiCannon();
        setTimeout(launchConfettiCannon, 700);

        // Play gentle chime via Web Audio
        playBirthdayChime();
      } else {
        // Relight candles if tapped again
        candlesBlown = false;
        flames.forEach(f => f && f.classList.remove('extinguished'));
        if (blowBtnText) blowBtnText.textContent = "اطفي الشمع تاني واتمني أمنية 🕯️💨";
        blowBtn.style.background = "";
        blowBtn.style.color = "";
        if (wishRevealCard) wishRevealCard.classList.remove('show');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Flirty Buttons & Interactive Quotes
  // --------------------------------------------------------------------------
  const flirtyButtons = document.querySelectorAll('.btn-flirty');
  const flirtyQuoteText = document.getElementById('flirtyQuoteText');
  const flirtyQuoteBox = document.getElementById('flirtyQuoteBox');

  flirtyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      flirtyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const quote = btn.getAttribute('data-quote');
      if (flirtyQuoteText && quote) {
        flirtyQuoteBox.style.opacity = '0.3';
        flirtyQuoteBox.style.transform = 'scale(0.98)';
        setTimeout(() => {
          flirtyQuoteText.textContent = quote;
          flirtyQuoteBox.style.opacity = '1';
          flirtyQuoteBox.style.transform = 'scale(1)';
        }, 150);
      }

      // Small heart burst at touch location
      if (typeof confetti === 'function') {
        const rect = btn.getBoundingClientRect();
        confetti({
          particleCount: 15,
          spread: 45,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#ff2a6d', '#ffd166', '#ffffff']
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Rain Hearts Button (Shower of Love)
  // --------------------------------------------------------------------------
  const rainHeartsBtn = document.getElementById('rainHeartsBtn');
  if (rainHeartsBtn) {
    rainHeartsBtn.addEventListener('click', () => {
      launchConfettiCannon(120);
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 80, 140]);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Celebration Confetti Cannon
  // --------------------------------------------------------------------------
  function launchConfettiCannon(count = 80) {
    if (typeof confetti !== 'function') return;

    confetti({
      particleCount: count,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff2a6d', '#ff758c', '#ffd166', '#ffffff', '#e11d48']
    });
  }

  // --------------------------------------------------------------------------
  // 6. Gentle Birthday Chime (Web Audio API)
  // --------------------------------------------------------------------------
  function playBirthdayChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major celebratory chord)
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.001, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.85);
      });
    } catch (e) {
      console.log('Audio chime info:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 7. Ambient Starry Night & Rising Hearts Canvas
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('sparkleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = window.innerWidth < 480 ? 25 : 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.4 ? '#ff758c' : '#ffd166'
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);
  }

  // --------------------------------------------------------------------------
  // 8. Polaroid Subtle 3D Tilt Effect on Touch/Hover
  // --------------------------------------------------------------------------
  const polaroidCard = document.getElementById('polaroidCard');
  if (polaroidCard) {
    const handleMove = (x, y) => {
      const rect = polaroidCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = ((y - centerY) / (rect.height / 2)) * -6;
      const rotateY = ((x - centerX) / (rect.width / 2)) * 6;

      polaroidCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    polaroidCard.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    polaroidCard.addEventListener('mouseleave', () => {
      polaroidCard.style.transform = '';
    });
  }
});
