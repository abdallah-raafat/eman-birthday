/* ==========================================================================
   js/scores.js — Scores, Synced Challenge Engine, MQTT & Achievements
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Game Definitions & Scoring Rules
  // ---------------------------------------------------------------------------
  const GAMES = {
    catcher: {
      id: 'catcher',
      title: 'لقط القلوب 💙',
      shortTitle: 'لقط القلوب',
      icon: '💙',
      desc: 'حركي السلة واجمعي القلوب الزرقاء الساقطة وابعدي عن القلوب المكسورة 💔',
      unit: 'نقطة',
      higherIsBetter: true,
      defaultBest: 0,
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, .3), rgba(2, 132, 199, .1))'
    },
    memory: {
      id: 'memory',
      title: 'ذاكرة الحب 🧠',
      shortTitle: 'ذاكرة الحب',
      icon: '🧠',
      desc: 'اقلبي الكروت وافتكري أماكن الصور والرموز الرومانسية بأقل وقت وحركات!',
      unit: 'ثانية',
      higherIsBetter: false,
      defaultBest: null, // lower is better
      gradient: 'linear-gradient(135deg, rgba(125, 211, 252, .3), rgba(6, 182, 212, .1))'
    },
    balloon: {
      id: 'balloon',
      title: 'فرقع البالونات 🎈',
      shortTitle: 'فرقع البالونات',
      icon: '🎈',
      desc: '30 ثانية سريعة.. فرقعي أكبر عدد من البالونات قبل ما الوقت يخلص!',
      unit: 'بالونة',
      higherIsBetter: true,
      defaultBest: 0,
      gradient: 'linear-gradient(135deg, rgba(255, 209, 102, .25), rgba(56, 189, 248, .15))'
    },
    reflex: {
      id: 'reflex',
      title: 'سرعة نبضك ⚡',
      shortTitle: 'سرعة النبض',
      icon: '⚡',
      desc: 'خليكي مستعدة.. أول ما القلب يتحول للأزرق دوسي بأسرع سرعة في ثواني!',
      unit: 'ms',
      higherIsBetter: false,
      defaultBest: null, // lower is better
      gradient: 'linear-gradient(135deg, rgba(186, 230, 253, .3), rgba(2, 132, 199, .15))'
    },
    cake: {
      id: 'cake',
      title: 'ابني التورتة 🎂',
      shortTitle: 'ابني التورتة',
      icon: '🎂',
      desc: 'نزلي أدوار التورتة فوق بعض في التوقيت الصح عشان تبني أعلى برج تورتة!',
      unit: 'دور',
      higherIsBetter: true,
      defaultBest: 0,
      gradient: 'linear-gradient(135deg, rgba(224, 242, 254, .3), rgba(56, 189, 248, .12))'
    },
    quiz: {
      id: 'quiz',
      title: 'تعرف عني إيه؟ 💌',
      shortTitle: 'كويز الحب',
      icon: '💌',
      desc: 'أسئلة سريعة عن ذكرياتنا وتفاصيلنا.. السرعة بتديكي بونص نقط زيادة!',
      unit: 'نقطة',
      higherIsBetter: true,
      defaultBest: 0,
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, .28), rgba(255, 209, 102, .18))'
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Achievements Definitions
  // ---------------------------------------------------------------------------
  const ACHIEVEMENTS = [
    { id: 'first_game', icon: '🎮', name: 'أول الغيث', desc: 'لعب أول لعبة في التحدي' },
    { id: 'catch_pro', icon: '💙', name: 'قناص القلوب', desc: 'سجل 30+ نقطة في لقط القلوب' },
    { id: 'catch_god', icon: '🏹', name: 'صياد الغرام', desc: 'سجل 50+ نقطة في لقط القلوب' },
    { id: 'memory_master', icon: '🧠', name: 'ذاكرة حديدية', desc: 'حل الذاكرة في أقل من 30 ثانية' },
    { id: 'balloon_maniac', icon: '🎈', name: 'سفاح البالونات', desc: 'فرقع 30+ بالونة في الجولة' },
    { id: 'ninja_reflex', icon: '⚡', name: 'سرعة البرق', desc: 'رد فعل أقل من 250ms' },
    { id: 'cake_tower', icon: '🎂', name: 'معلم الحلواني', desc: 'بنى 10 أدوار أو أكثر في التورتة' },
    { id: 'quiz_genius', icon: '💌', name: 'دكتوراه فينا', desc: 'جاوب كل أسئلة الكويز صح' },
    { id: 'rival_crusher', icon: '👑', name: 'قاهر الأرقام', desc: 'كسر رقم الطرف التاني في لعبة' },
    { id: 'wheel_spinner', icon: '🎡', name: 'لفة الحظ', desc: 'لف عجلة الحب في قسم اكتشفي' },
    { id: 'coupon_revealer', icon: '🎟️', name: 'كاشف الأسرار', desc: 'كشط كوبون حب واستخدمه' },
    { id: 'secret_finder', icon: '🕵️', name: 'المحقق السري', desc: 'اكتشف سر مستخبي في الموقع' },
    { id: 'love_spammer', icon: '🩵', name: 'عاشق للنخاع', desc: 'داس على زرار بحبك أوي 5 مرات' },
    { id: 'moon_whisper', icon: '🌙', name: 'همس القمر', desc: 'لقي سر القمر المتخفي في السما' },
    { id: 'all_rounder', icon: '🌟', name: 'أسطورة الألعاب', desc: 'لعب كل الـ 6 ألعاب وجربهم' }
  ];

  // ---------------------------------------------------------------------------
  // 3. Local State Storage Keys
  // ---------------------------------------------------------------------------
  const STORAGE_SCORES = 'eman_bday_scores_v2';
  const STORAGE_ACH = 'eman_bday_ach_v2';
  const STORAGE_FEED = 'eman_bday_feed_v2';

  // In-memory cache
  let scoresData = loadScores();
  let achievementsData = loadAchievements();
  let activityFeed = loadFeed();

  function loadScores() {
    try {
      const raw = localStorage.getItem(STORAGE_SCORES);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      abdallah: {},
      eman: {}
    };
  }

  function saveScores() {
    try {
      localStorage.setItem(STORAGE_SCORES, JSON.stringify(scoresData));
    } catch (e) {}
  }

  function loadAchievements() {
    try {
      const raw = localStorage.getItem(STORAGE_ACH);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {}; // { `${achId}_${role}`: timestamp }
  }

  function saveAchievements() {
    try {
      localStorage.setItem(STORAGE_ACH, JSON.stringify(achievementsData));
    } catch (e) {}
  }

  function loadFeed() {
    try {
      const raw = localStorage.getItem(STORAGE_FEED);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveFeed() {
    try {
      localStorage.setItem(STORAGE_FEED, JSON.stringify(activityFeed.slice(0, 30)));
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 4. Score Management Logic
  // ---------------------------------------------------------------------------
  function getBest(gameId, roleId) {
    if (!scoresData[roleId] || !scoresData[roleId][gameId]) {
      return GAMES[gameId].defaultBest;
    }
    return scoresData[roleId][gameId].best;
  }

  function getPlaysCount(gameId, roleId) {
    if (!scoresData[roleId] || !scoresData[roleId][gameId]) return 0;
    return scoresData[roleId][gameId].plays || 0;
  }

  function isBetterScore(gameId, scoreA, scoreB) {
    if (scoreA === null || scoreA === undefined) return false;
    if (scoreB === null || scoreB === undefined) return true;
    const g = GAMES[gameId];
    return g.higherIsBetter ? scoreA > scoreB : scoreA < scoreB;
  }

  function recordScore(gameId, score) {
    const role = window.AppCore.getRole() || 'eman';
    const partnerRole = role === 'eman' ? 'abdallah' : 'eman';
    const game = GAMES[gameId];
    if (!game) return null;

    if (!scoresData[role]) scoresData[role] = {};
    if (!scoresData[role][gameId]) {
      scoresData[role][gameId] = { best: null, plays: 0, history: [] };
    }

    const currentBest = scoresData[role][gameId].best;
    const partnerBest = getBest(gameId, partnerRole);
    const isPersonalBest = isBetterScore(gameId, score, currentBest);
    const beatsPartner = partnerBest !== null && isBetterScore(gameId, score, partnerBest);
    const wasLosingBefore = !isBetterScore(gameId, currentBest, partnerBest);
    const isRivalCrusher = beatsPartner && wasLosingBefore;

    scoresData[role][gameId].plays = (scoresData[role][gameId].plays || 0) + 1;
    if (isPersonalBest) {
      scoresData[role][gameId].best = score;
    }
    scoresData[role][gameId].history = (scoresData[role][gameId].history || []).slice(-9);
    scoresData[role][gameId].history.push({ score, ts: Date.now() });

    saveScores();

    // Add activity feed entry
    const myName = window.AppCore.getMyInfo().name;
    const partnerName = window.AppCore.getPartnerInfo().name;
    let feedText = `${myName} جاب ${score} ${game.unit} في ${game.shortTitle}`;
    if (isRivalCrusher) {
      feedText = `👑 ${myName} كسر رقم ${partnerName} في ${game.shortTitle}! (${score} ${game.unit})`;
    } else if (isPersonalBest) {
      feedText = `⭐ ${myName} حطم رقمه الشخصي في ${game.shortTitle}: ${score} ${game.unit}`;
    }
    addFeedItem({ text: feedText, ts: Date.now() });

    // Check game-specific achievements
    checkScoreAchievements(gameId, score, role, isRivalCrusher);

    // Sync out via MQTT
    broadcastScores();
    if (isRivalCrusher) {
      broadcastRivalAlert(gameId, score);
    }

    notifySubscribers();

    return {
      isPersonalBest,
      beatsPartner,
      isRivalCrusher,
      currentBest: scoresData[role][gameId].best,
      partnerBest
    };
  }

  function addFeedItem(item) {
    activityFeed.unshift(item);
    if (activityFeed.length > 30) activityFeed.pop();
    saveFeed();
  }

  // ---------------------------------------------------------------------------
  // 5. Achievement Evaluation
  // ---------------------------------------------------------------------------
  function isAchievementUnlocked(achId, role) {
    return !!achievementsData[`${achId}_${role}`];
  }

  function unlockAchievement(achId, role) {
    if (!role) role = window.AppCore.getRole() || 'eman';
    const key = `${achId}_${role}`;
    if (achievementsData[key]) return false;

    achievementsData[key] = Date.now();
    saveAchievements();

    const ach = ACHIEVEMENTS.find(a => a.id === achId);
    if (ach) {
      const myRole = window.AppCore.getRole();
      if (role === myRole) {
        window.AppCore.playCoin();
        window.AppCore.vibrate([60, 40, 100]);
        window.AppCore.toast({
          icon: ach.icon,
          text: `إنجاز جديد: ${ach.name}! 🏅`,
          sub: ach.desc,
          ach: true
        });
      }
    }

    broadcastAchievements();
    notifySubscribers();
    return true;
  }

  function checkScoreAchievements(gameId, score, role, isRivalCrusher) {
    unlockAchievement('first_game', role);

    if (gameId === 'catcher') {
      if (score >= 30) unlockAchievement('catch_pro', role);
      if (score >= 50) unlockAchievement('catch_god', role);
    } else if (gameId === 'memory') {
      if (score <= 30) unlockAchievement('memory_master', role);
    } else if (gameId === 'balloon') {
      if (score >= 30) unlockAchievement('balloon_maniac', role);
    } else if (gameId === 'reflex') {
      if (score <= 250) unlockAchievement('ninja_reflex', role);
    } else if (gameId === 'cake') {
      if (score >= 10) unlockAchievement('cake_tower', role);
    } else if (gameId === 'quiz') {
      if (score >= 50) unlockAchievement('quiz_genius', role);
    }

    if (isRivalCrusher) {
      unlockAchievement('rival_crusher', role);
    }

    // Check if played all 6
    const allPlayed = Object.keys(GAMES).every(g => (scoresData[role][g]?.plays || 0) > 0);
    if (allPlayed) {
      unlockAchievement('all_rounder', role);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Versus Totals & Board
  // ---------------------------------------------------------------------------
  function getVersusStats() {
    let abdallahWins = 0;
    let emanWins = 0;
    let ties = 0;

    Object.keys(GAMES).forEach(g => {
      const a = getBest(g, 'abdallah');
      const e = getBest(g, 'eman');
      if (a === null && e === null) return;
      if (a !== null && e === null) {
        abdallahWins++;
      } else if (e !== null && a === null) {
        emanWins++;
      } else if (a === e) {
        ties++;
      } else if (isBetterScore(g, a, e)) {
        abdallahWins++;
      } else {
        emanWins++;
      }
    });

    let leader = null;
    if (abdallahWins > emanWins) leader = 'abdallah';
    else if (emanWins > abdallahWins) leader = 'eman';

    return {
      abdallahWins,
      emanWins,
      ties,
      leader,
      totalGames: Object.keys(GAMES).length
    };
  }

  function getRecordsList() {
    return Object.keys(GAMES).map(id => {
      const g = GAMES[id];
      const a = getBest(id, 'abdallah');
      const e = getBest(id, 'eman');
      let winner = null;
      if (a !== null && e !== null) {
        if (a === e) winner = 'tie';
        else winner = isBetterScore(id, a, e) ? 'abdallah' : 'eman';
      } else if (a !== null) {
        winner = 'abdallah';
      } else if (e !== null) {
        winner = 'eman';
      }
      return {
        gameId: id,
        title: g.title,
        shortTitle: g.shortTitle,
        icon: g.icon,
        unit: g.unit,
        higherIsBetter: g.higherIsBetter,
        abdallahBest: a,
        emanBest: e,
        winner
      };
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Real-Time MQTT Sync Engine (EMQX Public Broker)
  // ---------------------------------------------------------------------------
  const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
  const TOPIC_PREFIX = 'eman_abdallah_challenge_2026';
  const TOPIC_SYNC = `${TOPIC_PREFIX}/scores_sync`;
  const TOPIC_EVENTS = `${TOPIC_PREFIX}/events`;

  let mqttClient = null;
  let isConnected = false;
  let partnerOnline = false;
  let lastPartnerPing = 0;

  function initMQTT() {
    if (typeof mqtt === 'undefined') {
      setTimeout(initMQTT, 500);
      return;
    }

    const role = window.AppCore.getRole() || 'guest';
    const clientId = `bday_${role}_${Math.random().toString(16).substr(2, 6)}`;

    try {
      mqttClient = mqtt.connect(MQTT_BROKER, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        keepalive: 15,
        will: {
          topic: TOPIC_EVENTS,
          payload: JSON.stringify({ type: 'presence', role, status: 'offline', ts: Date.now() }),
          qos: 1,
          retain: false
        }
      });

      mqttClient.on('connect', () => {
        isConnected = true;
        updatePresenceUI();
        mqttClient.subscribe([TOPIC_SYNC, TOPIC_EVENTS], (err) => {
          if (!err) {
            sendPresence('online');
            // Request or re-broadcast
            broadcastScores();
          }
        });
      });

      mqttClient.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          if (topic === TOPIC_SYNC) {
            handleIncomingSync(data);
          } else if (topic === TOPIC_EVENTS) {
            handleIncomingEvent(data);
          }
        } catch (e) {}
      });

      mqttClient.on('close', () => {
        isConnected = false;
        partnerOnline = false;
        updatePresenceUI();
      });

      // Periodic ping
      setInterval(() => {
        if (isConnected) {
          sendPresence('online');
          checkPartnerPresence();
        }
      }, 3000);

    } catch (e) {
      console.warn('MQTT connect error:', e);
    }
  }

  function sendPresence(status) {
    if (!mqttClient || !mqttClient.connected) return;
    const role = window.AppCore.getRole();
    if (!role) return;
    mqttClient.publish(TOPIC_EVENTS, JSON.stringify({
      type: 'presence',
      role,
      status,
      ts: Date.now()
    }), { qos: 0, retain: false });
  }

  function checkPartnerPresence() {
    const role = window.AppCore.getRole();
    const partnerRole = role === 'eman' ? 'abdallah' : 'eman';
    const wasOnline = partnerOnline;
    partnerOnline = (Date.now() - lastPartnerPing) < 7000;
    if (wasOnline !== partnerOnline) {
      updatePresenceUI();
    }
  }

  function updatePresenceUI() {
    const pill = document.getElementById('presencePill');
    const text = document.getElementById('presenceText');
    const syncStatus = document.getElementById('syncStatus');
    if (!pill || !text) return;

    const partnerName = window.AppCore.getPartnerInfo().name;

    if (!isConnected) {
      pill.classList.remove('online');
      text.textContent = 'أوفلاين 📴';
      if (syncStatus) syncStatus.textContent = 'غير متصل بالشبكة (النتائج محفوظة على جهازك)';
    } else if (partnerOnline) {
      pill.classList.add('online');
      text.textContent = `${partnerName} فاتح(ة) دلوقتي 🟢`;
      if (syncStatus) syncStatus.textContent = `متزامن مباشرة مع ${partnerName} ⚡`;
    } else {
      pill.classList.remove('online');
      text.textContent = 'متصل بالسيرفر ☁️';
      if (syncStatus) syncStatus.textContent = `متصل بالسيرفر — ${partnerName} مش فاتح(ة) حالياً`;
    }
  }

  function broadcastScores() {
    if (!mqttClient || !mqttClient.connected) return;
    const payload = JSON.stringify({
      type: 'scores_sync',
      sender: window.AppCore.getRole(),
      scores: scoresData,
      achievements: achievementsData,
      feed: activityFeed.slice(0, 10),
      ts: Date.now()
    });
    // Publish as retained message so the other phone receives it whenever it opens!
    mqttClient.publish(TOPIC_SYNC, payload, { qos: 1, retain: true });
  }

  function broadcastRivalAlert(gameId, score) {
    if (!mqttClient || !mqttClient.connected) return;
    const role = window.AppCore.getRole();
    const game = GAMES[gameId];
    mqttClient.publish(TOPIC_EVENTS, JSON.stringify({
      type: 'rival_crushed',
      sender: role,
      gameId,
      gameTitle: game.shortTitle,
      score,
      unit: game.unit,
      ts: Date.now()
    }), { qos: 1, retain: false });
  }

  function broadcastAchievements() {
    broadcastScores();
  }

  function handleIncomingSync(data) {
    if (!data || !data.scores) return;
    const myRole = window.AppCore.getRole();

    let updated = false;

    // Merge partner's scores
    ['abdallah', 'eman'].forEach(r => {
      if (r === myRole) {
        // Only accept if remote has a better score recorded on another device
        if (data.scores[r]) {
          Object.keys(data.scores[r]).forEach(g => {
            const remoteVal = data.scores[r][g]?.best;
            const localVal = scoresData[r]?.[g]?.best;
            if (remoteVal !== undefined && isBetterScore(g, remoteVal, localVal)) {
              if (!scoresData[r]) scoresData[r] = {};
              if (!scoresData[r][g]) scoresData[r][g] = { best: null, plays: 0 };
              scoresData[r][g].best = remoteVal;
              updated = true;
            }
          });
        }
      } else {
        // Accept partner's latest scores directly
        if (data.scores[r]) {
          if (!scoresData[r]) scoresData[r] = {};
          Object.keys(data.scores[r]).forEach(g => {
            const remote = data.scores[r][g];
            if (!remote) return;
            const current = scoresData[r][g];
            if (!current || isBetterScore(g, remote.best, current.best) || remote.plays > (current.plays || 0)) {
              scoresData[r][g] = remote;
              updated = true;
            }
          });
        }
      }
    });

    // Merge achievements
    if (data.achievements) {
      Object.keys(data.achievements).forEach(k => {
        if (!achievementsData[k]) {
          achievementsData[k] = data.achievements[k];
          updated = true;
        }
      });
    }

    if (updated) {
      saveScores();
      saveAchievements();
      notifySubscribers();
    }
  }

  function handleIncomingEvent(data) {
    if (!data || !data.type) return;
    const myRole = window.AppCore.getRole();

    if (data.type === 'presence') {
      if (data.role && data.role !== myRole) {
        if (data.status === 'online') {
          lastPartnerPing = Date.now();
          if (!partnerOnline) {
            partnerOnline = true;
            updatePresenceUI();
            const partnerName = window.AppCore.getPartnerInfo().name;
            window.AppCore.toast({
              icon: '👋',
              text: `${partnerName} دخل(ت) الموقع دلوقتي!`,
              sub: 'أي رقم قياسي جديد هيظهرلك في وقته 🩵'
            });
          }
        } else {
          partnerOnline = false;
          updatePresenceUI();
        }
      }
    } else if (data.type === 'rival_crushed') {
      if (data.sender && data.sender !== myRole) {
        const partnerName = window.AppCore.getPartnerInfo().name;
        window.AppCore.playLose();
        window.AppCore.vibrate([100, 50, 100, 50, 200]);
        window.AppCore.toast({
          icon: '😏',
          text: `${partnerName} كسر(ت) رقمك في ${data.gameTitle}!`,
          sub: `جاب(ت) ${data.score} ${data.unit}.. هترد عليها ولا هتسكت؟`,
          action: 'العب دلوقتي 🎮',
          onAction: () => {
            if (window.AppRouter) window.AppRouter.openGame(data.gameId);
          },
          rival: true,
          duration: 7000
        });

        // Add badge on challenge tab
        const badge = document.getElementById('challengeBadge');
        if (badge) badge.classList.remove('hidden');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Event Subscription System
  // ---------------------------------------------------------------------------
  const subscribers = [];
  function onScoresUpdated(fn) {
    if (typeof fn === 'function') subscribers.push(fn);
  }

  function notifySubscribers() {
    subscribers.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  }

  // Handle role changes
  document.addEventListener('roleChanged', () => {
    updatePresenceUI();
    notifySubscribers();
  });

  // ---------------------------------------------------------------------------
  // Export Public API
  // ---------------------------------------------------------------------------
  window.ScoreEngine = {
    GAMES,
    ACHIEVEMENTS,
    getGameDef: (id) => GAMES[id],
    getBest,
    getPlaysCount,
    isBetterScore,
    recordScore,
    getVersusStats,
    getRecordsList,
    getAchievementsList: () => ACHIEVEMENTS.map(a => ({
      ...a,
      unlockedAbdallah: isAchievementUnlocked(a.id, 'abdallah'),
      unlockedEman: isAchievementUnlocked(a.id, 'eman')
    })),
    isAchievementUnlocked,
    unlockAchievement,
    getActivityFeed: () => activityFeed,
    onScoresUpdated,
    init: initMQTT
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMQTT();
  });

})();
