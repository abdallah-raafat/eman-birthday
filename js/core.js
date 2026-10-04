/* ==========================================================================
   js/core.js — Core Audio, Effects, Role, Toasts, and App Infrastructure
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. App Roles & State
  // ---------------------------------------------------------------------------
  const STORAGE_ROLE = 'eman_bday_role';
  const ROLES = {
    eman: {
      id: 'eman',
      name: 'إيمان',
      title: 'مونمونتي وميمي 🩵',
      avatar: '👸🏻',
      partnerId: 'abdallah',
      partnerName: 'عبدالله',
      partnerTitle: 'دودك وميشو 🤴🏻'
    },
    abdallah: {
      id: 'abdallah',
      name: 'عبدالله',
      title: 'دودك وميشو 🤴🏻',
      avatar: '🤴🏻',
      partnerId: 'eman',
      partnerName: 'إيمان',
      partnerTitle: 'مونمونتي وميمي 👸🏻'
    }
  };

  let currentRole = localStorage.getItem(STORAGE_ROLE) || null;

  function getRole() {
    return currentRole;
  }

  function setRole(roleId) {
    if (!ROLES[roleId]) return;
    currentRole = roleId;
    localStorage.setItem(STORAGE_ROLE, roleId);
    document.dispatchEvent(new CustomEvent('roleChanged', { detail: { role: roleId } }));
  }

  function getMyInfo() {
    return ROLES[currentRole] || ROLES.eman;
  }

  function getPartnerInfo() {
    const me = getMyInfo();
    return ROLES[me.partnerId];
  }

  // ---------------------------------------------------------------------------
  // 2. Synthesized Sound Effects (Web Audio API — 100% Zero Network Dependency)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playPop(pitch = 1) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  function playTap() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  function playCoin() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [987.77, 1318.51]; // B5, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.18, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      });
    } catch (e) {}
  }

  function playChime() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Celebratory Major)
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.75);
      });
    } catch (e) {}
  }

  function playWin() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C, E, G, C, E
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + i * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch (e) {}
  }

  function playLose() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + i * 0.12;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  }

  function playWhoosh() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.07);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 3. Tactile Vibration
  // ---------------------------------------------------------------------------
  function vibrate(pattern) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Background Music (Esseily)
  // ---------------------------------------------------------------------------
  const audioEl = document.getElementById('bgMusic');
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioText = document.getElementById('audioPillText');
  let isMusicPlaying = false;

  function tryPlayMusic() {
    if (!audioEl) return Promise.resolve(false);
    audioEl.loop = true;
    return audioEl.play().then(() => {
      isMusicPlaying = true;
      if (audioBtn) audioBtn.classList.add('playing');
      if (audioText) audioText.textContent = 'العسيلي شغال 🎵';
      return true;
    }).catch(err => {
      isMusicPlaying = false;
      if (audioBtn) audioBtn.classList.remove('playing');
      if (audioText) audioText.textContent = 'الموسيقى ⏸️';
      return false;
    });
  }

  function toggleMusic() {
    if (!audioEl) return;
    if (isMusicPlaying) {
      audioEl.pause();
      isMusicPlaying = false;
      if (audioBtn) audioBtn.classList.remove('playing');
      if (audioText) audioText.textContent = 'الموسيقى متوقفة ⏸️';
    } else {
      tryPlayMusic();
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playTap();
      toggleMusic();
    });
  }

  if (audioEl) {
    audioEl.addEventListener('ended', () => {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Toast System
  // ---------------------------------------------------------------------------
  const toastStack = document.getElementById('toastStack');

  function toast({ icon = '✨', text, sub, action, onAction, rival = false, ach = false, duration = 4000 }) {
    if (!toastStack) return;
    const el = document.createElement('div');
    el.className = 'toast' + (rival ? ' rival' : '') + (ach ? ' ach' : '');
    el.innerHTML = `
      <span class="toast-ic">${icon}</span>
      <div class="toast-body">
        <div>${text}</div>
        ${sub ? `<small>${sub}</small>` : ''}
      </div>
      ${action ? `<button class="toast-action">${action}</button>` : ''}
    `;

    if (action && onAction) {
      const btn = el.querySelector('.toast-action');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onAction();
          dismiss();
        });
      }
    }

    function dismiss() {
      if (el.classList.contains('out')) return;
      el.classList.add('out');
      setTimeout(() => el.remove(), 360);
    }

    el.addEventListener('click', dismiss);
    toastStack.appendChild(el);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Generic Modal
  // ---------------------------------------------------------------------------
  const modalEl = document.getElementById('modal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  let currentModalCloseCb = null;

  function showModal({ icon = '💌', title = '', body = '', onClose = null }) {
    if (!modalEl) return;
    if (modalIcon) modalIcon.textContent = icon;
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.textContent = body;
    currentModalCloseCb = onClose;
    modalEl.classList.remove('hidden');
    playPop();
  }

  function hideModal() {
    if (!modalEl || modalEl.classList.contains('hidden')) return;
    modalEl.classList.add('hidden');
    if (typeof currentModalCloseCb === 'function') {
      currentModalCloseCb();
      currentModalCloseCb = null;
    }
  }

  if (modalClose) modalClose.addEventListener('click', hideModal);
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) hideModal();
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Ambient Sparkles Canvas
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('sparkleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const count = window.innerWidth < 480 ? 26 : 42;
    const particles = [];
    const colors = ['#38bdf8', '#7dd3fc', '#ffd166', '#bae6fd', '#ffffff'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.45 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.75 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function renderSparkles() {
      if (!document.hidden) {
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
      }
      requestAnimationFrame(renderSparkles);
    }
    requestAnimationFrame(renderSparkles);
  }

  // ---------------------------------------------------------------------------
  // 8. Floating Birthday Balloons in Background
  // ---------------------------------------------------------------------------
  const balloonContainer = document.getElementById('balloonContainer');
  const balloonColors = ['#38bdf8', '#7dd3fc', '#bae6fd', '#00b4d8', '#ffd166', '#a5f3fc', '#ffffff'];

  function spawnBalloon() {
    if (!balloonContainer || document.hidden) return;
    if (balloonContainer.children.length >= 6) return;

    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';

    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    balloon.style.backgroundColor = color;
    balloon.style.left = `${Math.random() * 85 + 5}%`;

    const scale = Math.random() * 0.35 + 0.85;
    balloon.style.width = `${50 * scale}px`;
    balloon.style.height = `${62 * scale}px`;

    const duration = Math.random() * 6 + 12;
    balloon.style.animationDuration = `${duration}s`;

    const string = document.createElement('div');
    string.className = 'balloon-string';
    balloon.appendChild(string);

    function pop(e) {
      if (e) e.stopPropagation();
      const rect = balloon.getBoundingClientRect();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 22,
          spread: 60,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: [color, '#ffffff', '#ffd166']
        });
      }
      playPop();
      vibrate(40);
      balloon.style.transition = 'transform 0.12s, opacity 0.12s';
      balloon.style.transform = 'scale(1.4)';
      balloon.style.opacity = '0';
      setTimeout(() => balloon.remove(), 120);

      document.dispatchEvent(new CustomEvent('balloonPopped', { detail: { color } }));
    }

    balloon.addEventListener('click', pop);
    balloon.addEventListener('touchstart', pop, { passive: true });

    balloonContainer.appendChild(balloon);
    setTimeout(() => {
      if (balloon.parentNode) balloon.remove();
    }, duration * 1000);
  }

  setInterval(spawnBalloon, 3500);
  setTimeout(spawnBalloon, 800);
  setTimeout(spawnBalloon, 1800);

  // ---------------------------------------------------------------------------
  // 9. Birthday Countdown to Next October 1st
  // ---------------------------------------------------------------------------
  function updateCountdown() {
    const el = document.getElementById('bdayCountdown');
    if (!el) return;

    const now = new Date();
    let target = new Date(now.getFullYear(), 9, 1); // Oct 1 of current year
    if (now > target) {
      target = new Date(now.getFullYear() + 1, 9, 1);
    }
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days === 0 && hours === 0) {
      el.textContent = 'النهارده عيدك! 🎂🎉';
    } else {
      el.textContent = `${days} يوم و ${hours} س`;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 60000);

  // ---------------------------------------------------------------------------
  // 10. Start Screen / Role Selection
  // ---------------------------------------------------------------------------
  const startOverlay = document.getElementById('startOverlay');
  const roleButtons = document.querySelectorAll('.role-btn');
  const enterBtn = document.getElementById('enterBtn');
  const enterBtnText = document.getElementById('enterBtnText');
  const startSub = document.getElementById('startSub');
  const switchRoleLink = document.getElementById('switchRoleLink');
  let selectedRoleCandidate = currentRole || null;

  function initStartScreen() {
    if (!startOverlay) return;

    if (currentRole) {
      // Returning user: preselect
      selectedRoleCandidate = currentRole;
      highlightRole(currentRole);
      if (enterBtn) {
        enterBtn.classList.remove('hidden');
        if (enterBtnText) {
          enterBtnText.textContent = currentRole === 'eman' ? 'ادخلي يا مونمونتي 🎶🩵' : 'ادخل يا عبدالله 🎶🩵';
        }
      }
      if (switchRoleLink) switchRoleLink.classList.remove('hidden');
      if (startSub) {
        startSub.textContent = `أهلاً بيك يا ${currentRole === 'eman' ? 'إيمان' : 'عبدالله'}!`;
      }
    }

    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.getAttribute('data-role');
        selectedRoleCandidate = r;
        highlightRole(r);
        playTap();
        vibrate(30);

        if (enterBtn) {
          enterBtn.classList.remove('hidden');
          if (enterBtnText) {
            enterBtnText.textContent = r === 'eman' ? 'ادخلي يا مونمونتي 🎶🩵' : 'ادخل يا عبدالله 🎶🩵';
          }
        }
      });
    });

    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        if (!selectedRoleCandidate) return;
        setRole(selectedRoleCandidate);
        playChime();
        vibrate([50, 40, 80]);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        }
        tryPlayMusic();
        startOverlay.classList.add('gone');
        setTimeout(() => startOverlay.remove(), 550);
      });
    }

    if (switchRoleLink) {
      switchRoleLink.addEventListener('click', () => {
        playTap();
        localStorage.removeItem(STORAGE_ROLE);
        currentRole = null;
        selectedRoleCandidate = null;
        roleButtons.forEach(b => b.classList.remove('selected'));
        if (enterBtn) enterBtn.classList.add('hidden');
        switchRoleLink.classList.add('hidden');
        if (startSub) startSub.textContent = 'مين اللي فاتح دلوقتي؟';
      });
    }
  }

  function highlightRole(roleId) {
    roleButtons.forEach(b => {
      if (b.getAttribute('data-role') === roleId) {
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initStartScreen);

  // ---------------------------------------------------------------------------
  // Export Public API
  // ---------------------------------------------------------------------------
  window.AppCore = {
    getRole,
    setRole,
    getMyInfo,
    getPartnerInfo,
    playPop,
    playTap,
    playCoin,
    playChime,
    playWin,
    playLose,
    playWhoosh,
    vibrate,
    toast,
    showModal,
    hideModal,
    tryPlayMusic,
    toggleMusic,
    spawnBalloon
  };

})();
