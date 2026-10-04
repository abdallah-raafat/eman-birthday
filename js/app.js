/* ==========================================================================
   js/app.js — Main Application Orchestrator, Tab Router & Challenge UI
   ========================================================================== */

(function () {
  'use strict';

  // State
  let activeTab = 'home';
  let activeGameInstance = null;
  let activeGameId = null;

  // DOM Elements
  const pages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('.nav-btn');
  const navIndicator = document.getElementById('navIndicator');

  // Game Overlay Elements
  const gameOverlay = document.getElementById('gameOverlay');
  const gameClose = document.getElementById('gameClose');
  const gameTitle = document.getElementById('gameTitle');
  const gameHud = document.getElementById('gameHud');
  const gameStage = document.getElementById('gameStage');
  const gameIntro = document.getElementById('gameIntro');
  const introIcon = document.getElementById('introIcon');
  const introTitle = document.getElementById('introTitle');
  const introDesc = document.getElementById('introDesc');
  const introBests = document.getElementById('introBests');
  const introStart = document.getElementById('introStart');
  const gameResult = document.getElementById('gameResult');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultScore = document.getElementById('resultScore');
  const resultMsg = document.getElementById('resultMsg');
  const resultBests = document.getElementById('resultBests');
  const resultAgain = document.getElementById('resultAgain');
  const resultBack = document.getElementById('resultBack');

  // ==========================================================================
  // 1. Navigation & Tab Routing
  // ==========================================================================
  function switchTab(tabId) {
    if (!tabId) tabId = 'home';
    activeTab = tabId;

    pages.forEach(p => {
      if (p.getAttribute('data-page') === tabId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    navButtons.forEach((btn, index) => {
      const target = btn.getAttribute('data-goto');
      if (target === tabId) {
        btn.classList.add('active');
        if (navIndicator) {
          // 4 tabs in grid: right-to-left in RTL
          const isRTL = document.documentElement.dir === 'rtl';
          const offsetPercent = index * 100;
          navIndicator.style.transform = isRTL 
            ? `translateX(-${offsetPercent}%)` 
            : `translateX(${offsetPercent}%)`;
        }
      } else {
        btn.classList.remove('active');
      }
    });

    // Clear challenge badge if visiting challenge
    if (tabId === 'challenge') {
      const badge = document.getElementById('challengeBadge');
      if (badge) badge.classList.add('hidden');
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh views if needed
    if (tabId === 'games') renderGamesGrid();
    if (tabId === 'challenge') renderChallengeView();
    if (tabId === 'discover' && window.DiscoverApp) window.DiscoverApp.updateSecretsUI();
  }

  function initNav() {
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const goto = btn.getAttribute('data-goto');
        window.AppCore.playTap();
        window.AppCore.vibrate(20);
        switchTab(goto);
      });
    });

    // Position initial indicator
    setTimeout(() => {
      switchTab('home');
    }, 100);
  }

  // ==========================================================================
  // 2. Home Page Interactions
  // ==========================================================================
  function initHomeInteractions() {
    // 1. Birthday Cake blow
    const blowBtn = document.getElementById('blowCandlesBtn');
    const blowBtnText = document.getElementById('blowBtnText');
    const wishCard = document.getElementById('wishRevealCard');
    const flames = document.querySelectorAll('.flame');
    let blownOut = false;

    if (blowBtn) {
      blowBtn.addEventListener('click', () => {
        if (blownOut) {
          // Relight
          blownOut = false;
          flames.forEach(f => f.style.display = '');
          if (blowBtnText) blowBtnText.textContent = 'اطفي الشمع واتمني أمنية 🕯️💨';
          if (wishCard) wishCard.classList.remove('revealed');
          window.AppCore.playPop();
          return;
        }

        blownOut = true;
        flames.forEach(f => f.style.display = 'none');
        if (blowBtnText) blowBtnText.textContent = 'طفتي الشمع واتحقق حلمك! 🩵 (دوسي تنوري تاني)';
        if (wishCard) wishCard.classList.add('revealed');

        window.AppCore.playWin();
        window.AppCore.vibrate([60, 40, 100, 50, 150]);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
        }
      });
    }

    // 2. Flirty triggers
    const flirtyButtons = document.querySelectorAll('.flirty-btn');
    const quoteBox = document.getElementById('flirtyQuoteBox');
    const quoteText = document.getElementById('flirtyQuoteText');

    flirtyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const quote = btn.getAttribute('data-quote');
        if (!quote || !quoteText) return;

        window.AppCore.playTap();
        window.AppCore.vibrate(25);

        // Pop animation
        if (quoteBox) {
          quoteBox.style.transform = 'scale(0.96)';
          setTimeout(() => {
            quoteText.textContent = quote;
            quoteBox.style.transform = 'scale(1)';
          }, 150);
        } else {
          quoteText.textContent = quote;
        }
      });
    });

    // 3. "بحبك أوي" Button
    const loveBtn = document.getElementById('loveYouBtn');
    let loveClickCount = 0;
    let loveTimer = null;

    if (loveBtn) {
      loveBtn.addEventListener('click', (e) => {
        loveClickCount++;
        clearTimeout(loveTimer);

        window.AppCore.playPop();
        window.AppCore.vibrate(30);

        // Spawn flying heart from button
        spawnHeartBurst(e.clientX || (loveBtn.getBoundingClientRect().left + 40), 
                        e.clientY || (loveBtn.getBoundingClientRect().top + 20));

        // Spawn celebratory balloons
        if (loveClickCount % 2 === 0) {
          window.AppCore.spawnBalloon();
        }

        if (loveClickCount >= 5) {
          loveClickCount = 0;
          window.AppCore.playWin();
          if (typeof confetti === 'function') {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
          }
          window.AppCore.toast({
            icon: '🩵',
            text: 'عبدالله بيحبك أضعاف أضعاف الدوسات دي كلها!',
            sub: 'حبك في قلبي ملوش أول من آخر يا مونمونتي 👑'
          });
          if (window.ScoreEngine) window.ScoreEngine.unlockAchievement('love_spammer');
        } else {
          loveTimer = setTimeout(() => { loveClickCount = 0; }, 2000);
        }
      });
    }
  }

  function spawnHeartBurst(x, y) {
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'float-pts';
      el.textContent = Math.random() > 0.4 ? '🩵' : '✨';
      el.style.left = `${x + (Math.random() - 0.5) * 60}px`;
      el.style.top = `${y + (Math.random() - 0.5) * 40}px`;
      el.style.fontSize = `${Math.random() * 1.2 + 1.2}rem`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  }

  // ==========================================================================
  // 3. Games Hub Grid Rendering
  // ==========================================================================
  function renderGamesGrid() {
    const grid = document.getElementById('gamesGrid');
    if (!grid || !window.ScoreEngine) return;

    grid.innerHTML = '';
    const games = window.ScoreEngine.GAMES;
    const myRole = window.AppCore.getRole();

    const sub = document.getElementById('gamesSub');
    if (sub) {
      sub.textContent = myRole === 'eman' 
        ? 'العبي واكسري أرقام عبدالله 😏🩵' 
        : 'العب واكسر أرقام إيمان يا بطل 🤴🏻🩵';
    }

    Object.values(games).forEach(g => {
      const bestAbd = window.ScoreEngine.getBest(g.id, 'abdallah');
      const bestEman = window.ScoreEngine.getBest(g.id, 'eman');
      const plays = window.ScoreEngine.getPlaysCount(g.id);

      const abdScoreStr = bestAbd !== null ? `${bestAbd} ${g.unit}` : '—';
      const emanScoreStr = bestEman !== null ? `${bestEman} ${g.unit}` : '—';

      let abdLeader = false;
      let emanLeader = false;
      if (bestAbd !== null && bestEman !== null) {
        if (bestAbd === bestEman) {
          abdLeader = true; emanLeader = true;
        } else if (g.higherIsBetter) {
          abdLeader = bestAbd > bestEman;
          emanLeader = bestEman > bestAbd;
        } else {
          abdLeader = bestAbd < bestEman;
          emanLeader = bestEman < bestAbd;
        }
      } else if (bestAbd !== null) {
        abdLeader = true;
      } else if (bestEman !== null) {
        emanLeader = true;
      }

      const card = document.createElement('div');
      card.className = 'game-card';
      card.style.setProperty('--g', g.gradient);

      card.innerHTML = `
        <span class="game-plays">${plays > 0 ? `لُعبت ${plays} مرات` : 'جديدة ✨'}</span>
        <div class="game-icon">${g.icon}</div>
        <div class="game-name">${g.title}</div>
        <div class="game-desc">${g.desc}</div>
        <div class="game-bests">
          <div class="${emanLeader ? 'leader' : ''}">
            <span>👸🏻 إيمان</span>
            <b>${emanScoreStr} ${emanLeader && bestEman !== null ? '👑' : ''}</b>
          </div>
          <div class="${abdLeader ? 'leader' : ''}">
            <span>🤴🏻 عبدالله</span>
            <b>${abdScoreStr} ${abdLeader && bestAbd !== null ? '👑' : ''}</b>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.AppCore.playTap();
        window.AppCore.vibrate(30);
        openGame(g.id);
      });

      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // 4. Game Overlay & Execution Engine
  // ==========================================================================
  function openGame(gameId) {
    if (!window.ScoreEngine || !window.MiniGames) return;
    const g = window.ScoreEngine.getGameDef(gameId);
    if (!g) return;

    activeGameId = gameId;
    document.body.classList.add('game-open');
    gameOverlay.classList.remove('hidden');

    gameTitle.textContent = g.title;
    gameHud.textContent = '0';
    gameStage.innerHTML = '';

    // Show Intro Sheet
    introIcon.textContent = g.icon;
    introTitle.textContent = g.title;
    introDesc.textContent = g.desc;

    const bestAbd = window.ScoreEngine.getBest(gameId, 'abdallah');
    const bestEman = window.ScoreEngine.getBest(gameId, 'eman');

    introBests.innerHTML = `
      <div class="sheet-best">
        <span>أعلى رقم لإيمان 👸🏻</span>
        <b>${bestEman !== null ? `${bestEman} ${g.unit}` : 'لسه ملعبتش'}</b>
      </div>
      <div class="sheet-best">
        <span>أعلى رقم لعبدالله 🤴🏻</span>
        <b>${bestAbd !== null ? `${bestAbd} ${g.unit}` : 'لسه ملعبش'}</b>
      </div>
    `;

    gameIntro.classList.remove('hidden');
    gameResult.classList.add('hidden');
  }

  function startGameCountdown() {
    gameIntro.classList.add('hidden');
    gameStage.innerHTML = '';

    // 3, 2, 1 Countdown
    let count = 3;
    const countEl = document.createElement('div');
    countEl.className = 'center-msg';
    countEl.innerHTML = `<span class="countdown-num">${count}</span>`;
    gameStage.appendChild(countEl);

    window.AppCore.playTap();
    window.AppCore.vibrate(30);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countEl.innerHTML = `<span class="countdown-num">${count}</span>`;
        window.AppCore.playTap();
        window.AppCore.vibrate(30);
      } else if (count === 0) {
        countEl.innerHTML = '<span class="countdown-num">يلا! 🩵</span>';
        window.AppCore.playChime();
        window.AppCore.vibrate([40, 20, 50]);
      } else {
        clearInterval(timer);
        countEl.remove();
        launchActiveGame();
      }
    }, 700);
  }

  function launchActiveGame() {
    if (!activeGameId || !window.MiniGames) return;

    activeGameInstance = window.MiniGames.launch(activeGameId, gameStage, {
      updateHud: (text) => {
        if (gameHud) gameHud.textContent = text;
      },
      onFinish: (score) => {
        handleGameFinished(score);
      }
    });
  }

  function handleGameFinished(score) {
    if (!activeGameId || !window.ScoreEngine) return;
    const g = window.ScoreEngine.getGameDef(activeGameId);
    const myRole = window.AppCore.getRole();
    const partnerName = window.AppCore.getPartnerInfo().name;

    // Record score in engine (handles MQTT sync, achievements, alerts)
    const result = window.ScoreEngine.recordScore(activeGameId, score, myRole);

    // Show Result Sheet
    resultScore.textContent = `${score} ${g.unit}`;

    let msg = '';
    let icon = '🎉';

    if (result.isRivalCrusher) {
      icon = '👑';
      msg = `كسرتي رقم ${partnerName} القياسي! انتي دلوقتي الملكة! 😏🩵`;
      window.AppCore.playWin();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
      }
    } else if (result.isPersonalBest) {
      icon = '⭐';
      msg = 'عاش يا قمر! ده أعلى رقم قياسي شخصي ليكي حتى الآن!';
      window.AppCore.playWin();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
      }
    } else if (result.beatsPartner) {
      icon = '👏';
      msg = `أحسن من رقم ${partnerName}! عاشت البطلة! 💪`;
    } else {
      icon = '🩵';
      msg = `لعب رائع يا روحي! العبي تاني واكسري رقم ${partnerName}! 😉`;
    }

    resultIcon.textContent = icon;
    resultTitle.textContent = result.isRivalCrusher ? 'رقم قياسي جديد! 👑' : 'نهاية اللعبة!';
    resultMsg.textContent = msg;

    const bestAbd = window.ScoreEngine.getBest(activeGameId, 'abdallah');
    const bestEman = window.ScoreEngine.getBest(activeGameId, 'eman');

    resultBests.innerHTML = `
      <div class="sheet-best">
        <span>رقم إيمان القياسي 👸🏻</span>
        <b>${bestEman !== null ? `${bestEman} ${g.unit}` : '—'}</b>
      </div>
      <div class="sheet-best">
        <span>رقم عبدالله القياسي 🤴🏻</span>
        <b>${bestAbd !== null ? `${bestAbd} ${g.unit}` : '—'}</b>
      </div>
    `;

    gameResult.classList.remove('hidden');
    renderGamesGrid();
    renderChallengeView();
  }

  function closeGame() {
    if (activeGameInstance && typeof activeGameInstance.stop === 'function') {
      activeGameInstance.stop();
    }
    activeGameInstance = null;
    activeGameId = null;

    gameOverlay.classList.add('hidden');
    gameIntro.classList.add('hidden');
    gameResult.classList.add('hidden');
    gameStage.innerHTML = '';
    document.body.classList.remove('game-open');

    renderGamesGrid();
  }

  function initGameOverlay() {
    if (gameClose) gameClose.addEventListener('click', closeGame);
    if (introStart) introStart.addEventListener('click', startGameCountdown);
    if (resultAgain) resultAgain.addEventListener('click', startGameCountdown);
    if (resultBack) resultBack.addEventListener('click', closeGame);
  }

  // ==========================================================================
  // 5. Challenge Tab UI Rendering
  // ==========================================================================
  function renderChallengeView() {
    if (!window.ScoreEngine) return;
    const stats = window.ScoreEngine.getVersusStats();
    const myRole = window.AppCore.getRole();

    // Versus banner
    const winsAbd = document.getElementById('winsAbdallah');
    const winsEmn = document.getElementById('winsEman');
    const vsAbdSide = document.getElementById('vsAbdallah');
    const vsEmnSide = document.getElementById('vsEman');
    const verdictEl = document.getElementById('vsVerdict');

    if (winsAbd) winsAbd.textContent = stats.winsAbdallah;
    if (winsEmn) winsEmn.textContent = stats.winsEman;

    if (vsAbdSide && vsEmnSide) {
      vsAbdSide.className = `vs-side ${stats.winsAbdallah > stats.winsEman ? 'leading' : ''} ${myRole === 'abdallah' ? 'me' : ''}`;
      vsEmnSide.className = `vs-side ${stats.winsEman > stats.winsAbdallah ? 'leading' : ''} ${myRole === 'eman' ? 'me' : ''}`;
    }

    if (verdictEl) {
      if (stats.winsEman === 0 && stats.winsAbdallah === 0) {
        verdictEl.textContent = 'لسه محدش لعب.. يلا نبدأ التحدي! 🎮';
      } else if (stats.winsEman > stats.winsAbdallah) {
        verdictEl.textContent = `👸🏻 إيمان متصدرة بـ ${stats.winsEman} لعبة! عاشت الملكة!`;
      } else if (stats.winsAbdallah > stats.winsEman) {
        verdictEl.textContent = `🤴🏻 عبدالله متقدم بـ ${stats.winsAbdallah} لعبة! هتردي عليه يا ميمي؟ 😏`;
      } else {
        verdictEl.textContent = '🔥 تعادل ناري بين الحبايب! مين هيكسر التعادل؟';
      }
    }

    // Records breakdown
    const recordsList = document.getElementById('recordsList');
    if (recordsList) {
      const records = window.ScoreEngine.getRecordsList();
      recordsList.innerHTML = '';

      records.forEach(r => {
        const item = document.createElement('div');
        item.className = 'record';
        const abdWin = r.leaderRole === 'abdallah';
        const emnWin = r.leaderRole === 'eman';

        item.innerHTML = `
          <div class="record-ic">${r.icon}</div>
          <div class="record-name">
            <div>${r.title}</div>
            <small>${r.leaderRole ? `المتصدر: ${r.leaderName} 👑` : 'لا يوجد متصدر بعد'}</small>
          </div>
          <div class="record-val ${emnWin ? 'win' : ''}">
            <span>إيمان</span>
            ${r.bestEman !== null ? `${r.bestEman}` : '—'}
          </div>
          <div class="record-val ${abdWin ? 'win' : ''}">
            <span>عبدالله</span>
            ${r.bestAbdallah !== null ? `${r.bestAbdallah}` : '—'}
          </div>
        `;
        recordsList.appendChild(item);
      });
    }

    // Achievements Grid
    const achGrid = document.getElementById('achGrid');
    const achCountEl = document.getElementById('achCount');
    if (achGrid) {
      const achs = window.ScoreEngine.getAchievementsList();
      const unlockedCount = achs.filter(a => myRole === 'eman' ? a.unlockedEman : a.unlockedAbdallah).length;
      if (achCountEl) achCountEl.textContent = `${unlockedCount}/${achs.length}`;

      achGrid.innerHTML = '';
      achs.forEach(a => {
        const isMineUnlocked = myRole === 'eman' ? a.unlockedEman : a.unlockedAbdallah;
        const item = document.createElement('div');
        item.className = `ach ${isMineUnlocked ? 'unlocked' : ''}`;

        let whoBadges = '';
        if (a.unlockedAbdallah) whoBadges += '🤴🏻';
        if (a.unlockedEman) whoBadges += '👸🏻';

        item.innerHTML = `
          <div class="ach-ic">${a.icon}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-who">${whoBadges}</div>
        `;

        item.addEventListener('click', () => {
          window.AppCore.playTap();
          window.AppCore.showModal(
            `${a.icon} ${a.name}`,
            `${a.desc}\n\n${isMineUnlocked ? '✓ تم إنجازه بنجاح!' : '🔒 لسه مقفول.. كمل لعب لفتحه!'}`,
            a.icon
          );
        });

        achGrid.appendChild(item);
      });
    }

    // Activity Feed
    const feed = document.getElementById('activityFeed');
    if (feed) {
      const items = window.ScoreEngine.getActivityFeed();
      if (!items || items.length === 0) {
        feed.innerHTML = '<div class="feed-empty">مفيش أحداث مسجلة لسه.. العبوا وهيظهر كل جديد هنا 🩵</div>';
      } else {
        feed.innerHTML = '';
        items.slice(0, 10).forEach(it => {
          const row = document.createElement('div');
          row.className = 'feed-item';
          const timeStr = formatRelativeTime(it.ts);
          row.innerHTML = `
            <span>${it.text}</span>
            <time>${timeStr}</time>
          `;
          feed.appendChild(row);
        });
      }
    }

    // Switch Role Button
    const changeRoleBtn = document.getElementById('changeRoleBtn');
    if (changeRoleBtn) {
      changeRoleBtn.onclick = () => {
        const cur = window.AppCore.getRole();
        const next = cur === 'eman' ? 'abdallah' : 'eman';
        window.AppCore.setRole(next);
        window.AppCore.playPop();
        window.AppCore.toast({
          icon: '🔄',
          text: `تم التبديل إلى: ${next === 'eman' ? 'إيمان 👸🏻' : 'عبدالله 🤴🏻'}`
        });
        renderChallengeView();
        renderGamesGrid();
      };
    }
  }

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  }

  // ==========================================================================
  // 6. Global Subscriptions & Initialization
  // ==========================================================================
  function init() {
    initNav();
    initHomeInteractions();
    initGameOverlay();
    renderGamesGrid();
    renderChallengeView();

    // Subscribe to score engine changes (MQTT or local play)
    if (window.ScoreEngine) {
      window.ScoreEngine.onScoresUpdated(() => {
        renderGamesGrid();
        renderChallengeView();
      });
    }

    // Modal close button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        window.AppCore.hideModal();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose router
  window.AppRouter = {
    switchTab,
    openGame,
    closeGame
  };

})();
