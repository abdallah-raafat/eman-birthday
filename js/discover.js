/* ==========================================================================
   js/discover.js — Wheel of Love, Scratch Coupons, Envelopes & Secrets
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_DISCOVER = 'eman_discover_secrets_v2';
  const STORAGE_COUPONS = 'eman_coupons_state_v2';
  const STORAGE_ENVELOPES = 'eman_envelopes_state_v2';

  // ---------------------------------------------------------------------------
  // 1. Secrets Tracking State
  // ---------------------------------------------------------------------------
  const SECRETS = [
    { id: 'moon', icon: '🌙', title: 'سر هلال السماء', hint: 'دوسي على الهلال الصغير المتداري فوق في الشمال' },
    { id: 'photo', icon: '📸', title: 'دقة قلوب الصورة', hint: 'دوسي على صورتنا وإحنا سوا 5 مرات ورا بعض' },
    { id: 'wax', icon: '💌', title: 'ختم الجواب الملكي', hint: 'دوسي على ختم الشمع الأزرق اللي على الجواب' },
    { id: 'sig', icon: '✍️', title: 'إمضاء دودك وميشو', hint: 'دوسي على إمضاء "دودك وميشو" في آخر الجواب' },
    { id: 'wheel', icon: '🎡', title: 'عجلة الحظ العشقي', hint: 'لفّي عجلة الحب وشوفي نصيبك' },
    { id: 'coupon', icon: '🎟️', title: 'كاشف الكوبونات', hint: 'اكشطي أي كوبون حب واستخدميه' },
    { id: 'password', icon: '🔐', title: 'كلمة السر الغرامية', hint: 'خمّني كلمة السر السحرية في الخانة المخصصة' }
  ];

  let foundSecrets = {};
  try {
    foundSecrets = JSON.parse(localStorage.getItem(STORAGE_DISCOVER) || '{}');
  } catch (e) {
    foundSecrets = {};
  }

  function saveSecrets() {
    try {
      localStorage.setItem(STORAGE_DISCOVER, JSON.stringify(foundSecrets));
    } catch (e) {}
    updateSecretsUI();
  }

  function unlockSecret(id, customMsg) {
    if (foundSecrets[id]) return false;
    foundSecrets[id] = Date.now();
    saveSecrets();

    const sec = SECRETS.find(s => s.id === id);
    window.AppCore.playWin();
    window.AppCore.vibrate([60, 40, 100, 50, 150]);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
    }

    window.AppCore.toast({
      icon: sec ? sec.icon : '✨',
      text: `لقيتي سر جديد: ${sec ? sec.title : 'سر غرامي'}! 🔍`,
      sub: customMsg || 'شاطرة يا مونمونتي.. اكتشفي باقي الأسرار!'
    });

    if (window.ScoreEngine) {
      window.ScoreEngine.unlockAchievement('secret_finder');
      if (id === 'moon') window.ScoreEngine.unlockAchievement('moon_whisper');
    }

    return true;
  }

  function updateSecretsUI() {
    const countEl = document.getElementById('secretsProgress');
    const listEl = document.getElementById('secretsList');
    const total = SECRETS.length;
    const foundCount = Object.keys(foundSecrets).length;

    if (countEl) {
      countEl.textContent = `لقيتي ${foundCount} من ${total} أسرار 🔍`;
    }

    if (listEl) {
      listEl.innerHTML = '';
      SECRETS.forEach(s => {
        const isFound = !!foundSecrets[s.id];
        const item = document.createElement('div');
        item.className = `secret-item ${isFound ? 'found' : ''}`;
        item.innerHTML = `
          <span class="s-ic">${isFound ? s.icon : '🔒'}</span>
          <div class="s-text">
            <div>${isFound ? s.title : 'سر مستخبي…'}</div>
            <small style="opacity:0.75; font-size:0.72rem;">${isFound ? 'تم اكتشافه بنجاح ✨' : s.hint}</small>
          </div>
        `;
        listEl.appendChild(item);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Love Wheel (عجلة الحب 🎡)
  // ---------------------------------------------------------------------------
  const WHEEL_SLICES = [
    { text: 'خروجة عشاء رومانسي 🕯️', color: '#0284c7' },
    { text: 'شوكولاتة وهدية مفاجأة 🍫', color: '#0369a1' },
    { text: 'يوم كامل طلباتك أوامر 👑', color: '#38bdf8' },
    { text: 'مساج ودلع لأحلى ميمي 💆🏻‍♀️', color: '#0284c7' },
    { text: 'أغنية بصوت عبدالله 🎤', color: '#0369a1' },
    { text: 'بوسة على راسك 100 مرة 💋', color: '#38bdf8' },
    { text: 'فسحة في مكان جديد تختاريه 🚗', color: '#0284c7' },
    { text: 'حضن دافي يمسح كل تعب 🫂', color: '#0369a1' }
  ];

  let currentRotation = 0;
  let isSpinning = false;

  function initWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const spinBtn = document.getElementById('spinBtn');
    const resultBox = document.getElementById('wheelResult');
    if (!canvas || !spinBtn) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const sliceAngle = (Math.PI * 2) / WHEEL_SLICES.length;

    function drawWheel() {
      ctx.clearRect(0, 0, size, size);

      // Outer glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      WHEEL_SLICES.forEach((slice, i) => {
        const start = i * sliceAngle;
        const end = start + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();

        // Border between slices
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Slice text
        ctx.translate(center, center);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(slice.text, radius - 24, 6);
        ctx.restore();
      });

      // Center Hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#031225';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🩵', center, center);
      ctx.restore();
    }

    drawWheel();

    spinBtn.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      spinBtn.disabled = true;
      window.AppCore.playWhoosh();
      window.AppCore.vibrate(40);

      // Random target index
      const winIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
      const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
      
      // Calculate target angle so pointer at top (270 deg / -90 deg) points to chosen slice
      const targetSliceCenter = (winIdx + 0.5) * (360 / WHEEL_SLICES.length);
      const targetDeg = spins * 360 + (270 - targetSliceCenter);

      currentRotation += targetDeg;
      canvas.style.transform = `rotate(${currentRotation}deg)`;

      // Audio ticks while spinning
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        tickCount++;
        window.AppCore.playTap();
        if (tickCount > 18) clearInterval(tickInterval);
      }, 200);

      setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        clearInterval(tickInterval);

        const won = WHEEL_SLICES[winIdx];
        window.AppCore.playWin();
        window.AppCore.vibrate([60, 40, 100, 50, 150]);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        }

        if (resultBox) {
          resultBox.innerHTML = `
            <p style="font-size:1.1rem; font-weight:900; color:var(--gold);">🎉 مبروك يا مونمونتي!</p>
            <p style="font-size:1rem; font-weight:800; color:#fff; margin-top:4px;">${won.text}</p>
            <small style="color:var(--labani); opacity:0.85;">صوري الشاشة واطلبيها من عبدالله في أي وقت 😉</small>
          `;
        }

        unlockSecret('wheel', 'لفيتي عجلة الحب وعرفتِ نصيبك!');
        if (window.ScoreEngine) window.ScoreEngine.unlockAchievement('wheel_spinner');
      }, 4600);
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Scratch Coupons (كوبونات الحب 🎟️)
  // ---------------------------------------------------------------------------
  const COUPONS = [
    { id: 'c1', title: 'خروجة في أي مكان 🚗', sub: 'تختاري المكان والزمان على ذوقك' },
    { id: 'c2', title: 'اعتذار فوري ومصالحة 🥺', sub: 'صالحة للاستخدام وقت أي زعل بدون نقاش' },
    { id: 'c3', title: 'أكل وحلويات على حساب دودي 🍕', sub: 'كل اللي نفسك فيه يوصل لحد عندك' },
    { id: 'c4', title: 'يوم كامل دلع وطلباتك أوامر 👑', sub: 'الكلمة كلمتك ومحدش يقدر يراجعك' },
    { id: 'c5', title: 'شوكولاتة ووردة مفاجأة 🌹', sub: 'في أول مقابلة جاية مخصوص ليكي' },
    { id: 'c6', title: 'جلسة تصوير ودلع مخصوص 📸', sub: 'هصورك 100 صورة حلوة لحد ما ترضي' }
  ];

  let couponsState = {};
  try {
    couponsState = JSON.parse(localStorage.getItem(STORAGE_COUPONS) || '{}');
  } catch (e) {
    couponsState = {};
  }

  function saveCoupons() {
    try {
      localStorage.setItem(STORAGE_COUPONS, JSON.stringify(couponsState));
    } catch (e) {}
  }

  function initCoupons() {
    const grid = document.getElementById('couponsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    COUPONS.forEach(c => {
      const state = couponsState[c.id] || { revealed: false, used: false };
      const card = document.createElement('div');
      card.className = `coupon ${state.revealed ? 'revealed' : ''} ${state.used ? 'used' : ''}`;
      card.id = `coupon_${c.id}`;

      card.innerHTML = `
        <div class="coupon-text">
          🎟️ <b>${c.title}</b>
          <small>${c.sub}</small>
        </div>
        <button class="coupon-use">${state.used ? 'تم الاستخدام ✓' : 'استخدم الكوبون ✨'}</button>
        <canvas width="280" height="180"></canvas>
      `;

      grid.appendChild(card);

      const canvas = card.querySelector('canvas');
      const useBtn = card.querySelector('.coupon-use');

      // Setup scratch layer
      if (!state.revealed) {
        setupScratch(canvas, card, c.id);
      }

      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.used) {
          window.AppCore.toast({ icon: '✓', text: 'الكوبون ده استخدمتيه خلاص يا ميمي 🩵' });
          return;
        }
        state.used = true;
        couponsState[c.id] = state;
        saveCoupons();
        card.classList.add('used');
        useBtn.textContent = 'تم الاستخدام ✓';

        window.AppCore.playWin();
        window.AppCore.vibrate([50, 40, 100]);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }

        window.AppCore.showModal(
          'تم تفعيل الكوبون! 🎟️🩵',
          `كوبون: "${c.title}" جاهز للتنفيذ!\n\nصوري الشاشة وابعتيها لعبدالله عشان ينفذ فوراً 😉`,
          '🎉'
        );

        unlockSecret('coupon', 'كشطتي واستخدمتي كوبون غرامي!');
        if (window.ScoreEngine) window.ScoreEngine.unlockAchievement('coupon_revealer');
      });
    });
  }

  function setupScratch(canvas, card, couponId) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Metallic Labani gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#7dd3fc');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Scratch pattern / text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('اخربشي هنا 🩵', w / 2, h / 2 - 8);

    ctx.font = '14px Cairo, sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText('وامسحي بإيدك تكشفي السر', w / 2, h / 2 + 18);

    let isScratching = false;
    let scratchedPixels = 0;

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      scratchedPixels++;
      if (scratchedPixels % 12 === 0) {
        window.AppCore.playTap();
        window.AppCore.vibrate(15);
      }

      // Check reveal threshold (~35 scratch points)
      if (scratchedPixels > 38 && !card.classList.contains('revealed')) {
        revealCoupon(card, couponId);
      }
    }

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = w / rect.width;
      const scaleY = h / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isScratching = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!isScratching) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: false });

    canvas.addEventListener('touchend', () => { isScratching = false; });

    canvas.addEventListener('mousedown', (e) => {
      isScratching = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isScratching) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    window.addEventListener('mouseup', () => { isScratching = false; });
  }

  function revealCoupon(card, couponId) {
    card.classList.add('revealed');
    if (!couponsState[couponId]) couponsState[couponId] = { revealed: true, used: false };
    couponsState[couponId].revealed = true;
    saveCoupons();

    window.AppCore.playWin();
    window.AppCore.vibrate([40, 30, 80]);
  }

  // ---------------------------------------------------------------------------
  // 4. Open When Letters (افتحي لما… 💌)
  // ---------------------------------------------------------------------------
  const ENVELOPES = [
    {
      id: 'env_miss',
      icon: '🥺',
      title: 'افتحي لما توحشيني',
      body: 'حبيبتي ونور عيني مونمونتي،\n\nلو فتحتي الجواب ده فاعرفي إنك وحشاني أكتر بكتير من ما بتتخيلي.. حتى وانتي نايمة بتوحشيني، وكل ثانية بتعدي من غير صوتك بتطول أوي.\nغمضي عينيكي وافتكري مسكة إيدينا سوا.. أنا دايماً في قلبك، ومستني اللحظة اللي هكون فيها جنبك ومسيبكيش أبداً 🩵'
    },
    {
      id: 'env_sad',
      icon: '💔',
      title: 'افتحي لما تزعلي مني',
      body: 'يا ميمي يا أغلى ما ليا،\n\nحقك على راسي وعيني.. لو زعلتك في يوم فده بيكون غباء مني ومن غير قصد أبداً.\nدموعك وزعلك بيهدوا حيلي والله، ومفيش أي حاجة في الدنيا تستاهل إن عيونك الحلوين دول يحزنوا ثانية واحدة.\nحقك عليا يا ستي، ومستعد أعمل أي حاجة في الكون عشان ضحكتك ترجع تنور وشك من تاني.. بحبك ومقدرش على بعدك 🥺'
    },
    {
      id: 'env_tired',
      icon: '💆🏻‍♀️',
      title: 'افتحي لما تحسي بتعب وضغط',
      body: 'حبيبتي القوية الشاطرة،\n\nخدي نفس عميق وارتاحي.. انتي تعبتي كتير وفخورة بيكي قد الدنيا، بس صحتك وراحتك عندي أهم من أي حاجة في الكون.\nسيبي كل حاجة على ربنا، وافتكري إن عندك دودي في ضهرك دايماً سند ومسؤول عنك ومش هيسيبك تشيلي هم حاجة لوحدك أبداً.. نامي وارتاحي يا روحي 🩵'
    },
    {
      id: 'env_happy',
      icon: '🥳',
      title: 'افتحي لما تكوني فرحانة ومبسوطة',
      body: 'يا بهجة عمري وفرحة أيامي! ✨\n\nلما انتي بتفرحي، بحس إن الدنيا كلها نورت في عيني! ضحكتك دي هي سر طاقتي وسعادتي في الحياة كلها.\nيا رب تفضلي مبسوطة وبتضحكي كل ثانية، وأنا هفضل الحارس اللي مهمته الأولى في الحياة يحافظ على الفرحة دي في قلبك وعينيكي 🩵'
    },
    {
      id: 'env_doubt',
      icon: '🩵',
      title: 'افتحي لما تشكي في غلاوتك عندي',
      body: 'ميمي.. اسمعيني كويس وركزي في الكلمتين دول:\n\nلو الكون كله اتقلب، وإذا الناس كلها اتغيرت، حبك في قلبي ثابت ومش هيتزحزح شعرة واحدة.\nانتي مش مجرد حبيبة.. انتي أهلي وأماني ونعمة عمري اللي دعيت ربنا بيها واستجابلي.\nمفيش ولا هيكون في حد يقدر ياخد مكانك في قلبي ولا يقرب من ربع غلاوتك.. انتي الملكة الوحيدة للأبد 👑'
    },
    {
      id: 'env_night',
      icon: '🌙',
      title: 'افتحي بالليل ومش عارفة تنامي',
      body: 'نص الليل والهدوء مالك المكان.. 🌌\n\nتخيلي إني قاعد جنبك دلوقتي، ماسك إيدك وبطبطب عليكي وبقولك كل سنة وانتي منورة حياتي يا مونمونتي.\nغمضي عينيكي واسمعي دقات قلبي اللي بتقول اسمك.. تصبحي على ألف خير وسعادة يا أجمل حلم اتحقق في عمري 🩵'
    }
  ];

  let openedEnvelopes = {};
  try {
    openedEnvelopes = JSON.parse(localStorage.getItem(STORAGE_ENVELOPES) || '{}');
  } catch (e) {
    openedEnvelopes = {};
  }

  function saveEnvelopes() {
    try {
      localStorage.setItem(STORAGE_ENVELOPES, JSON.stringify(openedEnvelopes));
    } catch (e) {}
  }

  function initEnvelopes() {
    const grid = document.getElementById('envelopesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    ENVELOPES.forEach(env => {
      const isOpened = !!openedEnvelopes[env.id];
      const btn = document.createElement('button');
      btn.className = `envelope ${isOpened ? 'opened' : ''}`;
      btn.innerHTML = `
        <span class="env-ic">${env.icon}</span>
        <span>${env.title}</span>
      `;

      btn.addEventListener('click', () => {
        window.AppCore.playTap();
        window.AppCore.vibrate(35);

        if (!openedEnvelopes[env.id]) {
          openedEnvelopes[env.id] = Date.now();
          saveEnvelopes();
          btn.classList.add('opened');
        }

        window.AppCore.showModal(
          env.title,
          env.body,
          env.icon
        );
      });

      grid.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Secret Password Form (كلمة السر 🔐)
  // ---------------------------------------------------------------------------
  const PASSWORDS = {
    'مونمونتي': 'يا روح قلب وعقل مونمونتك! مفيش حد بيعشقك في الدنيا قدي 🩵👑',
    'ميمي': 'أحلى ميمي في الكون كله! عيونك وضحكتك دول سحر حقيقي مسيطر عليا 🙈',
    'دودك': 'دودك فداكي بروحه وعمره كله وسندك في أي وقت وتحت أي ظرف! ✍️',
    'ميشو': 'ميشو بيحبك ومخلص ليكي لآخر نبضة في قلبه وعمره 🩵',
    'بحبك': 'وأنا بعشق تراب الأرض اللي بتمشي عليها يا أغلى نعمة دخلت حياتي! ✨',
    '1 اكتوبر': 'أعظم يوم في تاريخ كوكب الأرض! يوم ميلاد قمر الليالي 🎂🩵',
    '١ اكتوبر': 'أعظم يوم في تاريخ كوكب الأرض! يوم ميلاد قمر الليالي 🎂🩵',
    '1/10': 'اليوم اللي اتولدت فيه روحي وسعادتي كلها 🎉'
  };

  function initSecretForm() {
    const form = document.getElementById('secretForm');
    const input = document.getElementById('secretInput');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (input.value || '').trim();
      if (!val) return;

      let matchedMsg = null;
      for (const [key, msg] of Object.entries(PASSWORDS)) {
        if (val.toLowerCase() === key.toLowerCase()) {
          matchedMsg = msg;
          break;
        }
      }

      if (matchedMsg) {
        input.value = '';
        window.AppCore.playWin();
        window.AppCore.vibrate([50, 40, 100, 50, 150]);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        }

        window.AppCore.showModal(
          '🔐 سر اتكشف!',
          matchedMsg,
          '💖'
        );

        unlockSecret('password', 'خمّنتي كلمة السر الغرامية بنجاح!');
      } else {
        window.AppCore.playLose();
        window.AppCore.vibrate([80, 50, 80]);
        form.classList.remove('shake');
        void form.offsetWidth; // retrigger animation
        form.classList.add('shake');
        window.AppCore.toast({
          icon: '🤔',
          text: 'مش دي كلمة السر يا ميمي!',
          sub: 'جربي اسم دلع عبدالله بيحبه أوي 😉'
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Ambient Easter Eggs
  // ---------------------------------------------------------------------------
  function initEasterEggs() {
    // 1. Secret Moon
    const moon = document.getElementById('secretMoon');
    if (moon) {
      moon.addEventListener('click', () => {
        window.AppCore.playChime();
        window.AppCore.vibrate([40, 30, 80]);
        unlockSecret('moon', 'لقيتي سر القمر المتخفي في السما! 🌙');
        window.AppCore.showModal(
          'همس القمر 🌙',
          'القمر بص في السما وقال: "أنا بطلع بالليل بس.. إنما إيمان منورة الدنيا 24 ساعة ومغطية عليا!" 🩵',
          '✨'
        );
      });
    }

    // 2. Photo multi-tap
    const photoTogether = document.getElementById('photoTogether');
    let photoTaps = 0;
    let photoTimer = null;
    if (photoTogether) {
      photoTogether.addEventListener('click', () => {
        photoTaps++;
        clearTimeout(photoTimer);
        window.AppCore.playPop();
        window.AppCore.vibrate(20);

        if (photoTaps >= 5) {
          photoTaps = 0;
          unlockSecret('photo', 'كشفتي سر الصورة الرومانسية!');
          window.AppCore.showModal(
            'سر الصورة الرومانسية 📸🩵',
            'في اللحظة اللي اتصورت فيها الصورة دي، كنت سرحان في ملامحك وبقول في بالي: "يا بختي بيها يا رب.. احفظهالي ومتحرمنيش من حضنها أبداً".',
            '💍'
          );
        } else {
          photoTimer = setTimeout(() => { photoTaps = 0; }, 1800);
        }
      });
    }

    // 3. Wax seal
    const waxSeal = document.getElementById('waxSeal');
    if (waxSeal) {
      waxSeal.addEventListener('click', () => {
        window.AppCore.playChime();
        window.AppCore.vibrate([40, 30, 60]);
        unlockSecret('wax', 'كشفتي ختم الشمع الملكي!');
        window.AppCore.toast({
          icon: '👑',
          text: 'ختم معتمد 100% بحب إيمان الملكي!',
          sub: 'الجواب ده موثق بأعلى درجات العشق والغرام 🩵'
        });
      });
    }

    // 4. Signature
    const sigBtn = document.getElementById('signatureName');
    if (sigBtn) {
      sigBtn.addEventListener('click', () => {
        window.AppCore.playChime();
        window.AppCore.vibrate([50, 40, 100]);
        unlockSecret('sig', 'دوستي على إمضاء دودك وميشو!');
        window.AppCore.showModal(
          'إمضاء من القلب ✍️🩵',
          'الاسم ده انتي الوحيدة اللي ليكي حق تدلعي بيه.. "دودك وميشو" معمولين ليكي انتي وبس يا روح قلبي 🩵',
          '💖'
        );
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  function init() {
    updateSecretsUI();
    initWheel();
    initCoupons();
    initEnvelopes();
    initSecretForm();
    initEasterEggs();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.DiscoverApp = {
    unlockSecret,
    updateSecretsUI
  };

})();
