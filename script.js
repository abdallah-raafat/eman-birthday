/* ==========================================================================
   HAPPY BIRTHDAY EMAN (مونمونتي وميمي) ❤️ | INTERACTION ENGINE
   Optimized specifically for Mobile & iPhone 13 (iOS Safari)
   Features: Audio Autoplay & Loop, Floating Balloons, Cake Blowing,
             Flirty Triggers, Starry Night Particles, Confetti Fireworks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Audio Player & iOS Safari Autoplay Management
  // --------------------------------------------------------------------------
  const audio = document.getElementById('bgMusic');
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioPillText = document.getElementById('audioPillText');
  const unlockOverlay = document.getElementById('unlockOverlay');
  const unlockBtn = document.getElementById('unlockBtn');
  let isPlaying = false;

  const startMusic = () => {
    if (!audio) return;
    
    // Attempt play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        if (audioBtn) audioBtn.classList.add('playing');
        if (audioPillText) audioPillText.textContent = "العسيلي شغال 🎵";
        if (unlockOverlay) {
          unlockOverlay.classList.add('hidden');
          setTimeout(() => {
            unlockOverlay.style.display = 'none';
          }, 500);
        }
      }).catch(err => {
        console.log('iOS Autoplay blocked initially, waiting for tap:', err);
        if (unlockOverlay) {
          unlockOverlay.style.display = 'flex';
          unlockOverlay.classList.remove('hidden');
        }
      });
    }
  };

  // Immediate attempt
  startMusic();

  // iOS Safari touch unlock handlers
  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMusic();
      launchConfettiCannon(100);
      playCelebrationChime();
    });
  }

  if (unlockOverlay) {
    unlockOverlay.addEventListener('click', () => {
      startMusic();
      launchConfettiCannon(100);
      playCelebrationChime();
    });
  }

  // Audio Toggle Button (Pill at top)
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
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
        }).catch(err => console.log('Audio error:', err));
      }
    });
  }

  // Ensure seamless endless looping on iOS Safari
  if (audio) {
    audio.loop = true;
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Loop audio error:', e));
    });
  }

  // --------------------------------------------------------------------------
  // 2. Extra Birthday Animation: Floating Colorful Birthday Balloons
  // --------------------------------------------------------------------------
  const balloonContainer = document.getElementById('balloonContainer');
  const balloonColors = [
    '#38bdf8', // Vibrant Baby Blue
    '#7dd3fc', // Soft Cheerful Labani
    '#bae6fd', // Powder Baby Blue
    '#00b4d8', // Radiant Sky Cyan
    '#ffd166', // Joyful Birthday Gold Sparkle
    '#a5f3fc', // Pastel Aqua Labani
    '#ffffff'  // Sparkling Pearl White
  ];

  function createFloatingBalloon() {
    if (!balloonContainer) return;
    // Don't overwhelm iPhone DOM; max 7 balloons concurrently
    if (balloonContainer.children.length >= 7) return;

    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';

    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    balloon.style.backgroundColor = color;
    balloon.style.color = color; // for string pseudo-element inheritance

    // Random horizontal position across screen (5% to 90%)
    const leftPercent = Math.random() * 85 + 5;
    balloon.style.left = `${leftPercent}%`;

    // Random size variation for natural look
    const scale = Math.random() * 0.35 + 0.85; // 0.85 to 1.2
    balloon.style.width = `${52 * scale}px`;
    balloon.style.height = `${64 * scale}px`;

    // Random float duration (11s to 18s)
    const duration = Math.random() * 7 + 11;
    balloon.style.animationDuration = `${duration}s`;

    // Balloon String
    const string = document.createElement('div');
    string.className = 'balloon-string';
    string.style.top = `${62 * scale}px`;
    string.style.height = `${55 * scale}px`;
    balloon.appendChild(string);

    // Interactive Tap to Pop Balloon!
    const popBalloon = (e) => {
      e.stopPropagation();
      const rect = balloon.getBoundingClientRect();

      // Mini confetti pop explosion at balloon coordinate
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 22,
          spread: 55,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: [color, '#ffffff', '#ffd166']
        });
      }

      // Play soft pop sound
      playPopSound();

      // Quick pop animation & removal
      balloon.style.transition = 'transform 0.15s ease, opacity 0.15s ease';
      balloon.style.transform = 'scale(1.4)';
      balloon.style.opacity = '0';
      setTimeout(() => {
        balloon.remove();
      }, 150);
    };

    balloon.addEventListener('click', popBalloon);
    balloon.addEventListener('touchstart', popBalloon, { passive: true });

    balloonContainer.appendChild(balloon);

    // Remove when animation finishes
    setTimeout(() => {
      if (balloon.parentNode) balloon.remove();
    }, duration * 1000);
  }

  // Spawn initial balloons and maintain steady stream
  setTimeout(() => {
    createFloatingBalloon();
    createFloatingBalloon();
    createFloatingBalloon();
  }, 1000);

  setInterval(createFloatingBalloon, 3200);

  // --------------------------------------------------------------------------
  // 3. Interactive Birthday Cake (Blow Out the Candles 🎂)
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

        // Extinguish flames with progressive delay
        flames.forEach((f, idx) => {
          if (f) {
            setTimeout(() => {
              f.classList.add('extinguished');
            }, idx * 130);
          }
        });

        // Update button text & style
        if (blowBtnText) {
          blowBtnText.textContent = "طفينا الشمع وولعنا الحب! 🎉❤️";
        }
        blowBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        blowBtn.style.color = "#ffffff";

        // Show Wish Reveal Card smoothly
        setTimeout(() => {
          if (wishRevealCard) {
            wishRevealCard.classList.add('show');
            wishRevealCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 350);

        // Huge Celebration Confetti & Sparkles
        launchConfettiCannon(100);
        setTimeout(() => launchConfettiCannon(80), 600);

        // Spawn a burst of balloons
        for (let i = 0; i < 4; i++) {
          setTimeout(createFloatingBalloon, i * 250);
        }

        // Celebratory Audio Chime
        playCelebrationChime();
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
  // 4. Flirty Buttons & Interactive Quotes
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
        flirtyQuoteBox.style.transform = 'scale(0.97)';
        setTimeout(() => {
          flirtyQuoteText.textContent = quote;
          flirtyQuoteBox.style.opacity = '1';
          flirtyQuoteBox.style.transform = 'scale(1)';
        }, 120);
      }

      // Small heart & sparkle burst at button touch position
      if (typeof confetti === 'function') {
        const rect = btn.getBoundingClientRect();
        confetti({
          particleCount: 16,
          spread: 50,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#ff2a6d', '#ffd166', '#ff758c']
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. "بحبك أوي" Romantic Heartfelt Animation Trigger
  // --------------------------------------------------------------------------
  const loveYouBtn = document.getElementById('loveYouBtn');
  if (loveYouBtn) {
    loveYouBtn.addEventListener('click', (e) => {
      // Grand celebratory fireworks & romantic confetti showers
      launchConfettiCannon(160);
      setTimeout(() => launchConfettiCannon(110), 320);
      setTimeout(() => launchConfettiCannon(80), 650);

      // Wave of cheerful floating balloons
      for (let i = 0; i < 6; i++) {
        setTimeout(createFloatingBalloon, i * 160);
      }

      // Celebratory chime
      playCelebrationChime();

      // Tactile haptic if supported
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([60, 50, 100]);
      }

      // Heart burst right at the button center
      if (typeof confetti === 'function') {
        const rect = loveYouBtn.getBoundingClientRect();
        confetti({
          particleCount: 30,
          spread: 70,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#38bdf8', '#7dd3fc', '#ffffff', '#ffd166', '#bae6fd']
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Confetti Cannon Function
  // --------------------------------------------------------------------------
  function launchConfettiCannon(count = 80) {
    if (typeof confetti !== 'function') return;

    confetti({
      particleCount: count,
      spread: 100,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffd166', '#00b4d8', '#ffffff', '#e0f2fe']
    });
  }

  // Periodic celebration micro-fireworks (every 6 seconds for vibrant joy!)
  setInterval(() => {
    if (document.hidden) return; // save battery when tab is in background
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 24,
        spread: 65,
        origin: {
          x: Math.random() * 0.7 + 0.15, // across screen
          y: Math.random() * 0.35 + 0.15  // upper half
        },
        colors: ['#38bdf8', '#7dd3fc', '#ffd166', '#ffffff', '#bae6fd']
      });
    }
  }, 6500);

  // --------------------------------------------------------------------------
  // 7. Web Audio API Sounds (Pop Sound & Birthday Chime)
  // --------------------------------------------------------------------------
  let sharedAudioCtx = null;
  function getAudioContext() {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  }

  function playPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playCelebrationChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Celebratory Major Chord)
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.001, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.75);
      });
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --------------------------------------------------------------------------
  // 8. Ambient Starry Night & Rising Hearts Canvas
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
    // Efficient count for iPhone 13 60Hz/120Hz smooth scrolling
    const particleCount = window.innerWidth < 480 ? 24 : 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.75 + 0.25,
        color: Math.random() > 0.55 ? '#38bdf8' : (Math.random() > 0.25 ? '#7dd3fc' : '#ffd166')
      });
    }

    function renderParticles() {
      if (document.hidden) {
        requestAnimationFrame(renderParticles);
        return;
      }

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
});
