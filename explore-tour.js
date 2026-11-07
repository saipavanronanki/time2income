(function () {
  'use strict';

  const SEEN_KEY = 'time2income_explore_seen';
  const ROLE_KEY = 'time2income_explore_role';
  const root = document.documentElement;

  const TEXT = {
    en: {
      welcomeKicker: 'Welcome to TIME2INCOME',
      welcomeTitle: 'Your Time. Your Skills. Your Income.',
      welcomeBody: 'Earn from your skills, or find the right professional for your everyday tasks.',
      welcomeStart: 'Explore How It Works →',
      welcomeNote: 'Takes less than 60 seconds · No technical knowledge needed',
      skip: 'Skip',
      roleTitle: 'What brings you here?',
      roleNeed: 'I need a service', roleNeedBody: 'Find professionals and get your work done.',
      roleEarn: 'I want to earn', roleEarnBody: 'Showcase your skills and find opportunities.',
      next: 'Next →', back: '← Back', done: 'Got it', stepOf: 'Step {n} of {total}', close: 'Close tour',
      helpButton: 'Help', helpTour: 'Take a tour', helpDemo: 'Try a demo', helpCenter: 'Help Center', helpFaq: 'FAQ',
      actSearch: 'Search now', actTasks: 'Open tasks', actSignup: 'Create free account',
      lastTime: 'Last time', resumeFrom: 'Continue from step {n}',
      need: [
        ['Discover services', 'Search by skill, category, location or your requirements. Plumbers, designers, tutors and many more.'],
        ['Find professionals', 'See profiles, skills and availability before you decide.'],
        ['Post a task', 'Describe your work and requirements, and let providers come to you.'],
        ['Connect and book', 'Send a request. When the provider accepts, your chat opens and you agree the details.'],
        ['Turn your skills into income too', 'One account can be both a customer and a provider.'],
        ['Help is always here', 'Use the Help button any time to retake this tour or open the Help Center.']
      ],
      earn: [
        ['Publish your profile', 'Add your skills, your service area and when you are available.'],
        ['Receive requests', 'Customers can send you requests, and you can also browse open tasks.'],
        ['Accept and chat', 'Accept a request (a small acceptance fee applies) and the chat opens right away.'],
        ['See what people look for', 'Browse services to learn which skills are in demand near you.'],
        ['Help is always here', 'Use the Help button any time to retake this tour or open the Help Center.']
      ]
    },
    hi: {
      welcomeKicker: 'TIME2INCOME में आपका स्वागत है',
      welcomeTitle: 'आपका समय। आपका हुनर। आपकी कमाई।',
      welcomeBody: 'अपने हुनर से कमाएँ, या रोज़ के कामों के लिए सही प्रोफेशनल खोजें।',
      welcomeStart: 'जानें यह कैसे काम करता है →',
      welcomeNote: '60 सेकंड से कम · किसी तकनीकी जानकारी की ज़रूरत नहीं',
      skip: 'छोड़ें',
      roleTitle: 'आप यहाँ किसलिए आए हैं?',
      roleNeed: 'मुझे सेवा चाहिए', roleNeedBody: 'प्रोफेशनल खोजें और अपना काम करवाएँ।',
      roleEarn: 'मुझे कमाना है', roleEarnBody: 'अपना हुनर दिखाएँ और काम के मौके पाएँ।',
      next: 'आगे →', back: '← पीछे', done: 'समझ गया', stepOf: 'चरण {n} / {total}', close: 'टूर बंद करें',
      helpButton: 'मदद', helpTour: 'टूर देखें', helpDemo: 'डेमो आज़माएँ', helpCenter: 'हेल्प सेंटर', helpFaq: 'सवाल-जवाब',
      actSearch: 'अभी खोजें', actTasks: 'खुले टास्क', actSignup: 'मुफ़्त अकाउंट बनाएँ',
      lastTime: 'पिछली बार', resumeFrom: 'चरण {n} से जारी रखें',
      need: [
        ['सेवाएँ खोजें', 'हुनर, श्रेणी, जगह या अपनी ज़रूरत से खोजें। प्लंबर, डिज़ाइनर, ट्यूटर और भी बहुत कुछ।'],
        ['प्रोफेशनल खोजें', 'फ़ैसला करने से पहले प्रोफ़ाइल, हुनर और उपलब्धता देखें।'],
        ['टास्क पोस्ट करें', 'अपना काम और ज़रूरतें लिखें, प्रोवाइडर आप तक आएँगे।'],
        ['जुड़ें और बुक करें', 'रिक्वेस्ट भेजें। प्रोवाइडर के स्वीकार करते ही चैट खुलती है और आप बातें तय करते हैं।'],
        ['अपने हुनर से भी कमाएँ', 'एक ही अकाउंट कस्टमर भी हो सकता है और प्रोवाइडर भी।'],
        ['मदद हमेशा यहाँ है', 'यह टूर दोबारा देखने या हेल्प सेंटर खोलने के लिए कभी भी मदद बटन दबाएँ।']
      ],
      earn: [
        ['अपनी प्रोफ़ाइल पब्लिश करें', 'अपने हुनर, सेवा क्षेत्र और उपलब्धता जोड़ें।'],
        ['रिक्वेस्ट पाएँ', 'कस्टमर आपको रिक्वेस्ट भेज सकते हैं, और आप खुले टास्क भी देख सकते हैं।'],
        ['स्वीकार करें और चैट करें', 'रिक्वेस्ट स्वीकार करें (एक छोटा स्वीकार शुल्क लगता है) और चैट तुरंत खुल जाती है।'],
        ['देखें लोग क्या खोजते हैं', 'सेवाएँ देखें और जानें आपके पास किन हुनर की माँग है।'],
        ['मदद हमेशा यहाँ है', 'यह टूर दोबारा देखने या हेल्प सेंटर खोलने के लिए कभी भी मदद बटन दबाएँ।']
      ]
    },
    gu: {
      welcomeKicker: 'TIME2INCOME માં આપનું સ્વાગત છે',
      welcomeTitle: 'તમારો સમય. તમારી કુશળતા. તમારી કમાણી.',
      welcomeBody: 'તમારી કુશળતાથી કમાઓ, અથવા રોજિંદા કામ માટે યોગ્ય નિષ્ણાત શોધો.',
      welcomeStart: 'જાણો આ કેવી રીતે કામ કરે છે →',
      welcomeNote: '60 સેકન્ડથી ઓછા · કોઈ ટેકનિકલ જ્ઞાનની જરૂર નથી',
      skip: 'છોડો',
      roleTitle: 'તમે અહીં શા માટે આવ્યા છો?',
      roleNeed: 'મને સેવા જોઈએ છે', roleNeedBody: 'નિષ્ણાત શોધો અને તમારું કામ કરાવો.',
      roleEarn: 'મારે કમાવું છે', roleEarnBody: 'તમારી કુશળતા બતાવો અને તકો મેળવો.',
      next: 'આગળ →', back: '← પાછળ', done: 'સમજાઈ ગયું', stepOf: 'પગલું {n} / {total}', close: 'ટૂર બંધ કરો',
      helpButton: 'મદદ', helpTour: 'ટૂર જુઓ', helpDemo: 'ડેમો અજમાવો', helpCenter: 'હેલ્પ સેન્ટર', helpFaq: 'પ્રશ્નો-જવાબો',
      actSearch: 'હમણાં શોધો', actTasks: 'ખુલ્લા ટાસ્ક', actSignup: 'મફત એકાઉન્ટ બનાવો',
      lastTime: 'છેલ્લી વખતે', resumeFrom: 'પગલું {n} થી ચાલુ રાખો',
      need: [
        ['સેવાઓ શોધો', 'કુશળતા, શ્રેણી, સ્થળ કે તમારી જરૂરિયાતથી શોધો. પ્લમ્બર, ડિઝાઇનર, ટ્યુટર અને ઘણું બધું.'],
        ['નિષ્ણાત શોધો', 'નક્કી કરતા પહેલા પ્રોફાઇલ, કુશળતા અને ઉપલબ્ધતા જુઓ.'],
        ['ટાસ્ક પોસ્ટ કરો', 'તમારું કામ અને જરૂરિયાતો લખો, પ્રોવાઇડર તમારા સુધી આવશે.'],
        ['જોડાઓ અને બુક કરો', 'વિનંતી મોકલો. પ્રોવાઇડર સ્વીકારે કે તરત ચેટ ખુલે છે અને તમે વિગતો નક્કી કરો છો.'],
        ['તમારી કુશળતાથી પણ કમાઓ', 'એક જ એકાઉન્ટ ગ્રાહક પણ હોઈ શકે અને પ્રોવાઇડર પણ.'],
        ['મદદ હંમેશા અહીં છે', 'આ ટૂર ફરી જોવા કે હેલ્પ સેન્ટર ખોલવા ગમે ત્યારે મદદ બટન દબાવો.']
      ],
      earn: [
        ['તમારી પ્રોફાઇલ પ્રકાશિત કરો', 'તમારી કુશળતા, સેવા વિસ્તાર અને ઉપલબ્ધતા ઉમેરો.'],
        ['વિનંતીઓ મેળવો', 'ગ્રાહકો તમને વિનંતી મોકલી શકે છે, અને તમે ખુલ્લા ટાસ્ક પણ જોઈ શકો છો.'],
        ['સ્વીકારો અને ચેટ કરો', 'વિનંતી સ્વીકારો (નાની સ્વીકાર ફી લાગે છે) અને ચેટ તરત ખુલે છે.'],
        ['લોકો શું શોધે છે તે જુઓ', 'સેવાઓ જુઓ અને જાણો તમારા વિસ્તારમાં કઈ કુશળતાની માંગ છે.'],
        ['મદદ હંમેશા અહીં છે', 'આ ટૂર ફરી જોવા કે હેલ્પ સેન્ટર ખોલવા ગમે ત્યારે મદદ બટન દબાવો.']
      ]
    }
  };
  const TARGETS = {
    need: ['#explore', '.featured-section', '#postTaskBoardBtn', '#how', '#worker', '#exploreHelpFab'],
    earn: ['#worker', '#activity', '#how', '#explore', '#exploreHelpFab']
  };

  const ACTIONS = {
    need: [{ key: 'actSearch', focus: '#searchInput' }, null, { key: 'actTasks', href: 'index.html?page=tasks' }, null, { key: 'actSignup', href: 'auth.html?mode=signup' }, null],
    earn: [{ key: 'actSignup', href: 'auth.html?mode=signup' }, { key: 'actTasks', href: 'index.html?page=tasks' }, null, null, null]
  };
  const STEP_KEY = 'time2income_explore_step';

  const lang = () => {
    const code = String(root.lang || 'en').slice(0, 2).toLowerCase();
    return TEXT[code] ? code : 'en';
  };
  const tx = key => TEXT[lang()][key] ?? TEXT.en[key];
  const safeGet = key => { try { return localStorage.getItem(key); } catch (e) { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ } };

  let layer = null;
  let tour = null;
  let previousFocus = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function closeLayer() {
    if (layer) layer.remove();
    layer = null;
    tour = null;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', positionStep);
    window.removeEventListener('scroll', positionStep, true);
    if (previousFocus && document.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function finish() {
    safeSet(SEEN_KEY, '1');
    safeSet(STEP_KEY, '0');
    closeLayer();
  }

  function onKey(event) {
    if (!layer) return;
    if (event.key === 'Escape') { event.preventDefault(); finish(); return; }
    if (event.key !== 'Tab') return;
    const items = [...layer.querySelectorAll('button')].filter(b => !b.disabled && b.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function openLayer(className) {
    closeLayer();
    previousFocus = document.activeElement;
    layer = el('div', `explore-layer ${className}`);
    document.body.appendChild(layer);
    document.addEventListener('keydown', onKey, true);
    return layer;
  }

  function showWelcome() {
    const wrap = openLayer('explore-welcome');
    const card = el('div', 'explore-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'exploreWelcomeTitle');
    card.append(el('p', 'explore-kicker', tx('welcomeKicker')));
    const title = el('h2', null, tx('welcomeTitle'));
    title.id = 'exploreWelcomeTitle';
    card.append(title, el('p', 'explore-body', tx('welcomeBody')));
    const start = el('button', 'explore-btn explore-primary', tx('welcomeStart'));
    start.type = 'button';
    start.addEventListener('click', showRoleChoice);
    const skip = el('button', 'explore-btn explore-ghost', tx('skip'));
    skip.type = 'button';
    skip.addEventListener('click', finish);
    card.append(start, el('p', 'explore-note', tx('welcomeNote')), skip);
    wrap.appendChild(card);
    start.focus();
  }

  function showRoleChoice() {
    const wrap = openLayer('explore-welcome');
    const card = el('div', 'explore-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'exploreRoleTitle');
    const title = el('h2', null, tx('roleTitle'));
    title.id = 'exploreRoleTitle';
    card.append(title);
    const choices = el('div', 'explore-choices');
    const savedRole = safeGet(ROLE_KEY);
    const savedStep = Number(safeGet(STEP_KEY)) || 0;
    [['need', 'roleNeed', 'roleNeedBody'], ['earn', 'roleEarn', 'roleEarnBody']].forEach(([role, head, body]) => {
      const button = el('button', 'explore-choice');
      button.type = 'button';
      button.append(el('strong', null, tx(head)), el('small', null, tx(body)));
      const canResume = savedRole === role && savedStep > 0 && savedStep < TEXT[lang()][role].length - 1;
      if (savedRole === role) {
        button.classList.add('is-last');
        button.append(el('span', 'explore-last', canResume ? tx('resumeFrom').replace('{n}', savedStep + 1) : tx('lastTime')));
      }
      button.addEventListener('click', () => { safeSet(ROLE_KEY, role); startTour(role, canResume ? savedStep : 0); });
      choices.appendChild(button);
    });
    const skip = el('button', 'explore-btn explore-ghost', tx('skip'));
    skip.type = 'button';
    skip.addEventListener('click', finish);
    card.append(choices, skip);
    wrap.appendChild(card);
    (choices.querySelector('.is-last') || choices.firstChild).focus();
  }

  function startTour(role, startIndex = 0) {
    const steps = TEXT[lang()][role].map((pair, index) => ({ title: pair[0], body: pair[1], target: TARGETS[role][index], action: ACTIONS[role][index] }));
    const wrap = openLayer('explore-tour');
    const spot = el('div', 'explore-spot');
    const pop = el('div', 'explore-pop');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'exploreStepTitle');
    const progress = el('p', 'explore-kicker');
    progress.setAttribute('aria-live', 'polite');
    const title = el('h3');
    title.id = 'exploreStepTitle';
    const body = el('p', 'explore-body');
    const dots = el('div', 'explore-dots');
    dots.setAttribute('aria-hidden', 'true');
    steps.forEach(() => dots.appendChild(el('span', 'explore-dot')));
    const actionLink = el('a', 'explore-btn explore-action');
    actionLink.hidden = true;
    actionLink.addEventListener('click', event => {
      const act = tour.steps[tour.index].action;
      if (act && act.focus) {
        event.preventDefault();
        const input = document.querySelector(act.focus);
        finish();
        if (input) { input.scrollIntoView({ block: 'center' }); input.focus(); }
      }
    });
    const actions = el('div', 'explore-actions');
    const skip = el('button', 'explore-btn explore-ghost', tx('skip'));
    const back = el('button', 'explore-btn explore-outline', tx('back'));
    const next = el('button', 'explore-btn explore-primary');
    [skip, back, next].forEach(b => { b.type = 'button'; });
    skip.addEventListener('click', finish);
    back.addEventListener('click', () => goTo(tour.index - 1));
    next.addEventListener('click', () => (tour.index >= steps.length - 1 ? finish() : goTo(tour.index + 1)));
    const right = el('div', 'explore-actions-right');
    right.append(back, next);
    actions.append(skip, right);
    pop.append(progress, dots, title, body, actionLink, actions);
    wrap.append(spot, pop);
    tour = { steps, index: 0, role, spot, pop, progress, title, body, back, next, dots, actionLink };
    window.addEventListener('resize', positionStep);
    window.addEventListener('scroll', positionStep, true);
    goTo(startIndex);
  }

  function currentTarget() {
    const node = document.querySelector(tour.steps[tour.index].target);
    if (!node || node.hidden || !node.getClientRects().length) return null;
    return node;
  }

  function goTo(index) {
    if (!tour) return;
    tour.index = Math.max(0, Math.min(tour.steps.length - 1, index));
    const step = tour.steps[tour.index];
    tour.progress.textContent = tx('stepOf').replace('{n}', tour.index + 1).replace('{total}', tour.steps.length);
    tour.title.textContent = step.title;
    tour.body.textContent = step.body;
    [...tour.dots.children].forEach((dot, i) => dot.classList.toggle('is-on', i <= tour.index));
    if (step.action) {
      tour.actionLink.textContent = tx(step.action.key);
      tour.actionLink.href = step.action.href || '#';
      tour.actionLink.hidden = false;
    } else {
      tour.actionLink.hidden = true;
    }
    safeSet(STEP_KEY, String(tour.index));
    tour.back.disabled = tour.index === 0;
    tour.next.textContent = tour.index === tour.steps.length - 1 ? tx('done') : tx('next');
    const target = currentTarget();
    if (target) {
      const rect = target.getBoundingClientRect();
      const offscreen = rect.top < 80 || rect.bottom > window.innerHeight - 80;
      if (offscreen) target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    positionStep();
    setTimeout(positionStep, 450);
    tour.next.focus({ preventScroll: true });
  }

  function positionStep() {
    if (!tour) return;
    const { spot, pop } = tour;
    const target = currentTarget();
    const margin = 12;
    if (!target) {
      spot.style.cssText = 'display:none';
      pop.style.cssText = '';
      pop.classList.add('is-centered');
      return;
    }
    pop.classList.remove('is-centered');
    const rect = target.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, window.innerHeight);
    const height = Math.max(Math.min(bottom - top, window.innerHeight * 0.7), 48);
    spot.style.cssText = `display:block;top:${top - 6}px;left:${Math.max(rect.left - 6, 4)}px;width:${Math.min(rect.width + 12, window.innerWidth - 8)}px;height:${height + 12}px`;
    const popHeight = pop.offsetHeight;
    const popWidth = Math.min(pop.offsetWidth || 340, window.innerWidth - 2 * margin);
    const below = top + height + 12 + popHeight + margin <= window.innerHeight;
    const y = below ? top + height + 18 : Math.max(margin, top - popHeight - 18);
    const x = Math.min(Math.max(margin, rect.left), window.innerWidth - popWidth - margin);
    pop.style.cssText = `top:${Math.min(y, window.innerHeight - popHeight - margin)}px;left:${x}px`;
  }

  const isHome = Boolean(document.getElementById('motto'));

  function buildHelp() {
    if (document.getElementById('exploreHelpFab')) return;
    const fab = el('button', 'explore-fab', `? ${tx('helpButton')}`);
    fab.id = 'exploreHelpFab';
    fab.type = 'button';
    fab.setAttribute('aria-haspopup', 'true');
    fab.setAttribute('aria-expanded', 'false');
    const menu = el('div', 'explore-help-menu');
    menu.id = 'exploreHelpMenu';
    menu.hidden = true;
    const tourBtn = el('button', null, tx('helpTour'));
    tourBtn.type = 'button';
    const center = el('a', null, tx('helpCenter'));
    center.href = 'help.html';
    const faq = el('a', null, tx('helpFaq'));
    faq.href = isHome ? '#faq' : 'index.html#faq';
    const demoBtn = el('button', null, tx('helpDemo'));
    demoBtn.type = 'button';
    demoBtn.setAttribute('data-open-demo', '');
    demoBtn.addEventListener('click', () => setOpen(false));
    menu.append(tourBtn, demoBtn, center, faq);
    const setOpen = open => { menu.hidden = !open; fab.setAttribute('aria-expanded', String(open)); };
    fab.addEventListener('click', () => setOpen(menu.hidden));
    faq.addEventListener('click', () => setOpen(false));
    tourBtn.addEventListener('click', () => {
      setOpen(false);
      if (isHome) showWelcome();
      else if (window.TIME2INCOME_DEMO) window.TIME2INCOME_DEMO.open();
    });
    document.addEventListener('click', event => {
      if (!menu.hidden && !menu.contains(event.target) && event.target !== fab) setOpen(false);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) setOpen(false); });
    document.body.append(menu, fab);
  }

  function isBlocked() {
    return root.classList.contains('location-gateway-active')
      || root.classList.contains('app-preview')
      || Boolean(document.querySelector('dialog[open]'));
  }

  async function isSignedIn() {
    try {
      const client = window.supabaseClient;
      if (!client) return false;
      const { data } = await client.auth.getSession();
      return Boolean(data && data.session);
    } catch (e) { return false; }
  }

  async function maybeAutoStart() {
    if (safeGet(SEEN_KEY) || new URLSearchParams(location.search).has('page')) return;
    if (await isSignedIn()) { safeSet(SEEN_KEY, '1'); return; }
    let waited = 0;
    const timer = setInterval(() => {
      waited += 500;
      if (safeGet(SEEN_KEY) || waited > 120000) { clearInterval(timer); return; }
      if (isBlocked() || layer) return;
      clearInterval(timer);
      showWelcome();
    }, 500);
  }

  function init() {
    buildHelp();
    if (!isHome) return;
    maybeAutoStart();
  }

  window.TIME2INCOME_EXPLORE = { start: showWelcome };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
