/* Signed-in guidance: getting-started checklist, next-step cards, first-time tips, feedback. */
(function () {
  'use strict';

  const STR = {
    en: {
      title: 'Getting started', done: 'done', badge: 'Getting-started badge earned!', dismiss: 'Hide',
      sAccount: 'Create your account', sProfile: 'Publish your provider profile', sTask: 'Post your first task', sBooking: 'Get your first booking',
      next: 'Your next step', earn: 'Earn: publish your profile', earnSub: 'Add skills and rate so customers can find you.',
      hire: 'Hire: post a task', hireSub: 'Describe what you need and get offers.',
      tasks: 'Find tasks to work on', tasksSub: 'Browse open requests in your city or online.',
      requests: 'Check your requests', requestsSub: 'Open My activity to reply to bookings.',
      tipWallet: 'Tip: the wallet is for your balance. Never share your password or verification codes.',
      tipTask: 'Tip: a clear title, budget and city get better offers. Do not share phone numbers in the description.',
      helpful: 'Helpful?', yes: 'Yes', no: 'No', show: 'Show getting started', editProfile: 'Edit your profile', fbSubject: 'TIME2INCOME feedback'
    },
    hi: {
      title: 'शुरुआत करें', done: 'पूरा', badge: 'शुरुआत बैज मिल गया!', dismiss: 'छुपाएँ',
      sAccount: 'अकाउंट बनाएँ', sProfile: 'अपनी प्रोवाइडर प्रोफ़ाइल प्रकाशित करें', sTask: 'पहला टास्क पोस्ट करें', sBooking: 'पहली बुकिंग पाएँ',
      next: 'आपका अगला कदम', earn: 'कमाएँ: प्रोफ़ाइल प्रकाशित करें', earnSub: 'स्किल और रेट जोड़ें ताकि ग्राहक आपको ढूँढ सकें।',
      hire: 'काम करवाएँ: टास्क पोस्ट करें', hireSub: 'बताएँ आपको क्या चाहिए और ऑफ़र पाएँ।',
      tasks: 'काम के टास्क खोजें', tasksSub: 'अपने शहर या ऑनलाइन खुले अनुरोध देखें।',
      requests: 'अपने अनुरोध देखें', requestsSub: 'बुकिंग का जवाब देने के लिए My activity खोलें।',
      tipWallet: 'टिप: वॉलेट आपके बैलेंस के लिए है। पासवर्ड या वेरिफ़िकेशन कोड कभी साझा न करें।',
      tipTask: 'टिप: साफ़ शीर्षक, बजट और शहर से बेहतर ऑफ़र मिलते हैं। विवरण में फ़ोन नंबर न डालें।',
      helpful: 'उपयोगी?', yes: 'हाँ', no: 'नहीं', show: 'शुरुआत गाइड दिखाएँ', editProfile: 'अपनी प्रोफ़ाइल एडिट करें', fbSubject: 'TIME2INCOME फ़ीडबैक'
    },
    gu: {
      title: 'શરૂઆત કરો', done: 'પૂર્ણ', badge: 'શરૂઆત બૅજ મળ્યો!', dismiss: 'છુપાવો',
      sAccount: 'એકાઉન્ટ બનાવો', sProfile: 'તમારી પ્રોવાઇડર પ્રોફાઇલ પ્રકાશિત કરો', sTask: 'પહેલો ટાસ્ક પોસ્ટ કરો', sBooking: 'પહેલું બુકિંગ મેળવો',
      next: 'તમારું આગળનું પગલું', earn: 'કમાઓ: પ્રોફાઇલ પ્રકાશિત કરો', earnSub: 'સ્કિલ અને રેટ ઉમેરો જેથી ગ્રાહકો તમને શોધી શકે.',
      hire: 'કામ કરાવો: ટાસ્ક પોસ્ટ કરો', hireSub: 'તમને શું જોઈએ છે તે લખો અને ઑફર મેળવો.',
      tasks: 'કામના ટાસ્ક શોધો', tasksSub: 'તમારા શહેર કે ઑનલાઇન ખુલ્લી વિનંતીઓ જુઓ.',
      requests: 'તમારી વિનંતીઓ જુઓ', requestsSub: 'બુકિંગનો જવાબ આપવા My activity ખોલો.',
      tipWallet: 'ટિપ: વૉલેટ તમારા બૅલેન્સ માટે છે. પાસવર્ડ કે વેરિફિકેશન કોડ ક્યારેય શેર ન કરો.',
      tipTask: 'ટિપ: સ્પષ્ટ શીર્ષક, બજેટ અને શહેરથી સારી ઑફર મળે છે. વર્ણનમાં ફોન નંબર ન લખો.',
      helpful: 'ઉપયોગી?', yes: 'હા', no: 'ના', show: 'શરૂઆત ગાઇડ બતાવો', editProfile: 'તમારી પ્રોફાઇલ એડિટ કરો', fbSubject: 'TIME2INCOME ફીડબૅક'
    }
  };
  const tx = key => (STR[document.documentElement.lang] || STR.en)[key] || STR.en[key];
  const HIDE_KEY = 'time2income_checklist_hidden';
  const TIP_PREFIX = 'time2income_tip_';
  const FEEDBACK_EMAIL = 'support@time2income.com';

  const safeGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } };
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  let card = null;
  let userId = null;

  async function loadState(client, id) {
    const count = async (table, build) => {
      try {
        const { count: n, error } = await build(client.from(table).select('id', { count: 'exact', head: true }));
        return error ? 0 : (n || 0);
      } catch (e) { return 0; }
    };
    let published = false;
    try {
      const { data } = await client.from('worker_profiles').select('is_published').eq('user_id', id).maybeSingle();
      published = Boolean(data && data.is_published);
    } catch (e) { /* treated as not published */ }
    const [tasks, bookings] = await Promise.all([
      count('tasks', q => q.eq('customer_id', id)),
      count('bookings', q => q.or(`customer_id.eq.${id},worker_id.eq.${id}`))
    ]);
    return { published, tasks, bookings };
  }

  function feedbackLink(label, mood) {
    const a = el('a', 'exp-fb-btn', label);
    const body = `${mood}\n\nPage: ${location.pathname}${location.search}\nWhat could be better?\n`;
    a.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(tx('fbSubject'))}&body=${encodeURIComponent(body)}`;
    return a;
  }

  function actionButton(title, sub, onClick, href) {
    const node = el(href ? 'a' : 'button', 'exp-next-card');
    if (href) node.href = href; else node.type = 'button';
    node.append(el('strong', null, title), el('small', null, sub));
    if (onClick) node.addEventListener('click', onClick);
    return node;
  }

  function render(state) {
    if (!card) return;
    card.replaceChildren();
    const steps = [
      [tx('sAccount'), true],
      [tx('sProfile'), state.published],
      [tx('sTask'), state.tasks > 0],
      [tx('sBooking'), state.bookings > 0]
    ];
    const doneCount = steps.filter(s => s[1]).length;
    const head = el('div', 'exp-head');
    head.append(el('h3', null, tx('title')), el('span', 'exp-count', `${doneCount}/${steps.length} ${tx('done')}`));
    const hide = el('button', 'exp-hide', tx('dismiss'));
    hide.type = 'button';
    hide.addEventListener('click', () => { safeSet(HIDE_KEY + userId, '1'); renderStub(); });
    head.append(hide);
    const bar = el('div', 'exp-bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(steps.length));
    bar.setAttribute('aria-valuenow', String(doneCount));
    const fill = el('span');
    fill.style.width = `${(doneCount / steps.length) * 100}%`;
    bar.append(fill);
    const list = el('ul', 'exp-steps');
    steps.forEach(([label, ok]) => {
      const li = el('li', ok ? 'is-done' : '', `${ok ? '✓' : '○'} ${label}`);
      list.append(li);
    });
    card.append(head, bar, list);
    if (state.published) {
      const edit = el('a', 'exp-edit-link', `✎ ${tx('editProfile')}`);
      edit.href = 'index.html?page=profile';
      card.append(edit);
    }

    if (doneCount === steps.length) {
      card.append(el('p', 'exp-badge', `🏆 ${tx('badge')}`));
    } else {
      card.append(el('p', 'exp-next-title', tx('next')));
      const row = el('div', 'exp-next-row');
      const postTask = () => { const b = document.getElementById('postTaskBoardBtn'); if (b) b.click(); else location.href = 'index.html?page=tasks'; };
      if (!state.published) row.append(actionButton(tx('earn'), tx('earnSub'), null, 'index.html?page=profile'));
      else row.append(actionButton(tx('tasks'), tx('tasksSub'), null, 'index.html?page=tasks'));
      if (state.tasks === 0) row.append(actionButton(tx('hire'), tx('hireSub'), postTask));
      else row.append(actionButton(tx('requests'), tx('requestsSub'), null, 'index.html?page=activity'));
      card.append(row);
    }

    const fb = el('div', 'exp-feedback');
    fb.append(el('span', null, tx('helpful')), feedbackLink(`👍 ${tx('yes')}`, 'Helpful'), feedbackLink(`👎 ${tx('no')}`, 'Not helpful'));
    card.append(fb);
  }

  function renderStub() {
    card.replaceChildren();
    const show = el('button', 'exp-show', '+ ' + tx('show'));
    show.type = 'button';
    show.addEventListener('click', () => { try { localStorage.removeItem(HIDE_KEY + userId); } catch (e) { /* storage blocked */ } refresh(); });
    card.append(show);
  }

  let seq = 0;
  let retries = 0;

  async function refresh() {
    const mine = ++seq;
    const client = window.supabaseClient;
    if (!client) return;
    const { data } = await client.auth.getSession();
    const user = data && data.session && data.session.user;
    const host = document.getElementById('activity');
    if (mine !== seq) return;
    if (!user || !host) {
      if (card) card.hidden = true;
      if (retries++ < 5) setTimeout(refresh, 1500);
      return;
    }
    userId = user.id;
    if (!card) {
      card = el('section', 'exp-card');
      card.id = 'gettingStartedCard';
      card.setAttribute('aria-label', tx('title'));
      const grid = host.querySelector('.activity-grid');
      host.insertBefore(card, grid || null);
    }
    card.hidden = false;
    if (safeGet(HIDE_KEY + userId)) { renderStub(); return; }
    const state = await loadState(client, user.id);
    if (mine === seq) render(state);
  }

  function watchTip(dialogId, key) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    new MutationObserver(() => {
      if (!dialog.open || safeGet(TIP_PREFIX + key) || dialog.querySelector('.exp-tip')) return;
      const tip = el('p', 'exp-tip', tx(key === 'wallet' ? 'tipWallet' : 'tipTask'));
      tip.setAttribute('role', 'note');
      dialog.prepend(tip);
      safeSet(TIP_PREFIX + key, '1');
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }

  function init() {
    if (!document.getElementById('activity')) return;
    watchTip('walletDialog', 'wallet');
    watchTip('taskDialog', 'task');
    const client = window.supabaseClient;
    if (client) client.auth.onAuthStateChange(() => setTimeout(refresh, 300));
    ['refreshActivityBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => setTimeout(refresh, 1500));
    });
    ['taskDialog', 'workerDialog'].forEach(id => {
      const d = document.getElementById(id);
      if (d) d.addEventListener('close', () => setTimeout(refresh, 1500));
    });
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
