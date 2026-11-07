(function () {
  'use strict';

  const TEXT = {
    en: {
      badge: 'DEMO · Sample data only, no real people',
      close: 'Close demo', stepOf: 'Step {n} of 5',
      s1t: '1. Search for a service', s1b: 'Pick a skill to see sample professionals near you.',
      all: 'All', view: 'View profile', away: 'km away', reviews: 'reviews',
      s2t: '2. Check the profile', s2b: 'See skills, price and availability before you decide.',
      about: 'About', price: 'Rate', avail: 'Available', request: 'Send request (free)',
      s3t: '3. Request sent', s3b: 'The provider is notified instantly. Requesting is free for customers.',
      s3n: 'When the provider accepts, a small acceptance fee applies to the provider, then your chat opens.',
      accept: 'Provider accepts →',
      s4t: '4. Chat and agree details', s4b: 'Once accepted, both of you can chat, share files and fix the time and price.',
      s5t: 'You are ready!', s5b: 'That is the whole flow: search, request, chat, get it done. Create a free account to try it for real.',
      signup: 'Create free account', again: 'Replay demo', next: 'Next →', back: '← Back',
      you: 'You', typing: 'Hi! Can you come tomorrow at 10 AM?', reply: 'Yes, 10 AM works. I will bring my tools.',
      chatNote: 'Sample conversation',
      chooseT: 'Which side do you want to try?', chooseB: 'Take a 1-minute walk through with sample data.',
      asCustomer: 'I need a service', asCustomerB: 'Search, request and chat with a professional.',
      asProvider: 'I want to earn', asProviderB: 'Publish a profile, get a request and accept it.',
      p1t: '1. Publish your profile', p1b: 'Tell customers what you do, where, and when you are free.',
      skillL: 'Skill', areaL: 'Service area', availL: 'Available', rateL: 'Your rate',
      sampleSkill: 'Plumber', sampleArea: 'Within 10 km of Sample City', sampleAvail: 'Mon–Sat, 9 AM–7 PM', sampleRate: '₹300 / hour',
      pubBtn: 'Publish profile',
      p2t: '2. A request arrives', p2b: 'Customers find you and send a request. You get a notification.',
      reqFrom: 'Request from Priya M.', reqMsg: 'Hi, my kitchen tap is leaking. Can you come tomorrow at 10 AM?',
      reqBtn: 'Review request →',
      p3t: '3. Accept the request', p3b: 'You decide. Accepting is when a small acceptance fee applies, and it is shown before you pay.',
      p3n: 'Customers never pay to send a request. After you accept, your chat opens right away.',
      acceptOpen: 'Accept and open chat →',
      p4t: '4. Chat and agree details', p4b: 'Confirm the time and price in chat, then do the work.',
      pReply: 'Yes, I can come at 10 AM tomorrow.', pMsg: 'Great, please bring a new washer too.',
      goService: 'Find a Service', goWork: 'Find Work', mockTitle: 'Sample profile'
    },
    hi: {
      badge: 'डेमो · सिर्फ़ नमूना डेटा, कोई असली व्यक्ति नहीं',
      close: 'डेमो बंद करें', stepOf: 'चरण {n} / 5',
      s1t: '1. सेवा खोजें', s1b: 'कोई स्किल चुनें और आसपास के नमूना प्रोफ़ेशनल देखें।',
      all: 'सभी', view: 'प्रोफ़ाइल देखें', away: 'किमी दूर', reviews: 'रिव्यू',
      s2t: '2. प्रोफ़ाइल देखें', s2b: 'फ़ैसले से पहले स्किल, रेट और उपलब्धता देखें।',
      about: 'परिचय', price: 'रेट', avail: 'उपलब्ध', request: 'रिक्वेस्ट भेजें (मुफ़्त)',
      s3t: '3. रिक्वेस्ट भेजी गई', s3b: 'प्रोवाइडर को तुरंत सूचना मिलती है। कस्टमर के लिए रिक्वेस्ट मुफ़्त है।',
      s3n: 'प्रोवाइडर के स्वीकार करने पर उस पर छोटा एक्सेप्टेंस शुल्क लगता है, फिर आपकी चैट खुलती है।',
      accept: 'प्रोवाइडर स्वीकार करता है →',
      s4t: '4. चैट करें और तय करें', s4b: 'स्वीकार होने के बाद दोनों चैट, फ़ाइल शेयर और समय-कीमत तय कर सकते हैं।',
      s5t: 'आप तैयार हैं!', s5b: 'पूरा तरीका: खोजें, रिक्वेस्ट भेजें, चैट करें, काम पूरा करें। असली में आज़माने के लिए मुफ़्त अकाउंट बनाएँ।',
      signup: 'मुफ़्त अकाउंट बनाएँ', again: 'डेमो फिर देखें', next: 'आगे →', back: '← पीछे',
      you: 'आप', typing: 'नमस्ते! क्या आप कल सुबह 10 बजे आ सकते हैं?', reply: 'हाँ, 10 बजे ठीक है। मैं अपने औज़ार ले आऊँगा।',
      chatNote: 'नमूना बातचीत',
      chooseT: 'आप किस तरफ़ से आज़माना चाहते हैं?', chooseB: 'नमूना डेटा के साथ 1 मिनट का वॉकथ्रू।',
      asCustomer: 'मुझे सेवा चाहिए', asCustomerB: 'खोजें, रिक्वेस्ट भेजें और प्रोफेशनल से चैट करें।',
      asProvider: 'मुझे कमाना है', asProviderB: 'प्रोफ़ाइल पब्लिश करें, रिक्वेस्ट पाएँ और स्वीकार करें।',
      p1t: '1. अपनी प्रोफ़ाइल पब्लिश करें', p1b: 'कस्टमर को बताएँ कि आप क्या करते हैं, कहाँ और कब खाली हैं।',
      skillL: 'हुनर', areaL: 'सेवा क्षेत्र', availL: 'उपलब्ध', rateL: 'आपका रेट',
      sampleSkill: 'प्लंबर', sampleArea: 'सैंपल सिटी से 10 किमी के भीतर', sampleAvail: 'सोम–शनि, सुबह 9–शाम 7', sampleRate: '₹300 / घंटा',
      pubBtn: 'प्रोफ़ाइल पब्लिश करें',
      p2t: '2. रिक्वेस्ट आती है', p2b: 'कस्टमर आपको खोजकर रिक्वेस्ट भेजते हैं। आपको सूचना मिलती है।',
      reqFrom: 'प्रिया एम. की रिक्वेस्ट', reqMsg: 'नमस्ते, मेरे किचन का नल टपक रहा है। क्या आप कल सुबह 10 बजे आ सकते हैं?',
      reqBtn: 'रिक्वेस्ट देखें →',
      p3t: '3. रिक्वेस्ट स्वीकार करें', p3b: 'फ़ैसला आपका है। स्वीकार करने पर छोटा एक्सेप्टेंस शुल्क लगता है, जो भुगतान से पहले दिखता है।',
      p3n: 'रिक्वेस्ट भेजने के लिए कस्टमर कुछ नहीं देता। स्वीकार करते ही आपकी चैट खुल जाती है।',
      acceptOpen: 'स्वीकार करें और चैट खोलें →',
      p4t: '4. चैट करें और तय करें', p4b: 'चैट में समय और कीमत पक्की करें, फिर काम करें।',
      pReply: 'हाँ, मैं कल सुबह 10 बजे आ सकता हूँ।', pMsg: 'बढ़िया, एक नया वॉशर भी लेते आइएगा।',
      goService: 'सेवा खोजें', goWork: 'काम खोजें', mockTitle: 'नमूना प्रोफ़ाइल'
    },
    gu: {
      badge: 'ડેમો · ફક્ત નમૂના ડેટા, કોઈ વાસ્તવિક વ્યક્તિ નથી',
      close: 'ડેમો બંધ કરો', stepOf: 'પગલું {n} / 5',
      s1t: '1. સેવા શોધો', s1b: 'કોઈ કુશળતા પસંદ કરો અને નજીકના નમૂના નિષ્ણાતો જુઓ.',
      all: 'બધા', view: 'પ્રોફાઇલ જુઓ', away: 'કિમી દૂર', reviews: 'રિવ્યૂ',
      s2t: '2. પ્રોફાઇલ જુઓ', s2b: 'નિર્ણય પહેલાં કુશળતા, દર અને ઉપલબ્ધતા જુઓ.',
      about: 'પરિચય', price: 'દર', avail: 'ઉપલબ્ધ', request: 'વિનંતી મોકલો (મફત)',
      s3t: '3. વિનંતી મોકલાઈ', s3b: 'પ્રોવાઇડરને તરત સૂચના મળે છે. ગ્રાહક માટે વિનંતી મફત છે.',
      s3n: 'પ્રોવાઇડર સ્વીકારે ત્યારે તેના પર નાની સ્વીકાર ફી લાગે છે, પછી તમારી ચેટ ખુલે છે.',
      accept: 'પ્રોવાઇડર સ્વીકારે છે →',
      s4t: '4. ચેટ કરો અને નક્કી કરો', s4b: 'સ્વીકાર્યા પછી બંને ચેટ કરી, ફાઇલ શેર કરી, સમય અને ભાવ નક્કી કરી શકે છે.',
      s5t: 'તમે તૈયાર છો!', s5b: 'આખી રીત: શોધો, વિનંતી મોકલો, ચેટ કરો, કામ પૂરું કરો. સાચે અજમાવવા મફત એકાઉન્ટ બનાવો.',
      signup: 'મફત એકાઉન્ટ બનાવો', again: 'ડેમો ફરી જુઓ', next: 'આગળ →', back: '← પાછળ',
      you: 'તમે', typing: 'નમસ્તે! શું તમે કાલે સવારે 10 વાગ્યે આવી શકો?', reply: 'હા, 10 વાગ્યે ચાલશે. હું મારા સાધનો લઈ આવીશ.',
      chatNote: 'નમૂના વાતચીત',
      chooseT: 'તમે કઈ બાજુથી અજમાવવા માંગો છો?', chooseB: 'નમૂના ડેટા સાથે 1 મિનિટનું વૉકથ્રૂ.',
      asCustomer: 'મને સેવા જોઈએ છે', asCustomerB: 'શોધો, વિનંતી મોકલો અને નિષ્ણાત સાથે ચેટ કરો.',
      asProvider: 'મારે કમાવું છે', asProviderB: 'પ્રોફાઇલ પ્રકાશિત કરો, વિનંતી મેળવો અને સ્વીકારો.',
      p1t: '1. તમારી પ્રોફાઇલ પ્રકાશિત કરો', p1b: 'ગ્રાહકોને કહો કે તમે શું કરો છો, ક્યાં અને ક્યારે ફ્રી છો.',
      skillL: 'કુશળતા', areaL: 'સેવા વિસ્તાર', availL: 'ઉપલબ્ધ', rateL: 'તમારો દર',
      sampleSkill: 'પ્લમ્બર', sampleArea: 'સેમ્પલ સિટીથી 10 કિમીની અંદર', sampleAvail: 'સોમ–શનિ, સવારે 9–સાંજે 7', sampleRate: '₹300 / કલાક',
      pubBtn: 'પ્રોફાઇલ પ્રકાશિત કરો',
      p2t: '2. વિનંતી આવે છે', p2b: 'ગ્રાહકો તમને શોધીને વિનંતી મોકલે છે. તમને સૂચના મળે છે.',
      reqFrom: 'પ્રિયા એમ. ની વિનંતી', reqMsg: 'નમસ્તે, મારા રસોડાનો નળ ટપકે છે. શું તમે કાલે સવારે 10 વાગ્યે આવી શકો?',
      reqBtn: 'વિનંતી જુઓ →',
      p3t: '3. વિનંતી સ્વીકારો', p3b: 'નિર્ણય તમારો છે. સ્વીકારતી વખતે નાની સ્વીકાર ફી લાગે છે, જે ચુકવણી પહેલાં દેખાય છે.',
      p3n: 'વિનંતી મોકલવા ગ્રાહક કંઈ ચૂકવતો નથી. સ્વીકારતાં જ તમારી ચેટ ખુલી જાય છે.',
      acceptOpen: 'સ્વીકારો અને ચેટ ખોલો →',
      p4t: '4. ચેટ કરો અને નક્કી કરો', p4b: 'ચેટમાં સમય અને ભાવ નક્કી કરો, પછી કામ કરો.',
      pReply: 'હા, હું કાલે સવારે 10 વાગ્યે આવી શકું છું.', pMsg: 'સરસ, એક નવું વૉશર પણ લાવજો.',
      goService: 'સેવા શોધો', goWork: 'કામ શોધો', mockTitle: 'નમૂના પ્રોફાઇલ'
    }
  };

  const PROS = [
    { id: 'p1', name: 'Ravi K.', skill: 'Plumber', city: 'Sample City', km: 2, rating: '4.8', n: 36, rate: '₹300 / hour', about: 'Leaks, taps, bathroom fittings and pipe repair. 8 years of experience.', avail: 'Mon–Sat, 9 AM–7 PM' },
    { id: 'p2', name: 'Anita S.', skill: 'Tutor', city: 'Sample City', km: 3, rating: '4.9', n: 52, rate: '₹400 / hour', about: 'Maths and science for classes 6 to 10, home or online.', avail: 'Weekdays, 4 PM–8 PM' },
    { id: 'p3', name: 'Imran D.', skill: 'Designer', city: 'Sample City', km: 5, rating: '4.7', n: 21, rate: '₹500 / hour', about: 'Logos, posters and social media graphics with quick turnaround.', avail: 'Every day, flexible' },
    { id: 'p4', name: 'Meera P.', skill: 'Tutor', city: 'Sample City', km: 6, rating: '4.6', n: 18, rate: '₹350 / hour', about: 'Spoken English and basic computer skills for all ages.', avail: 'Sat–Sun, 10 AM–6 PM' }
  ];

  let layer = null;
  let opener = null;
  let state = null;

  const lang = () => ((document.documentElement.lang || 'en').slice(0, 2) in TEXT ? (document.documentElement.lang || 'en').slice(0, 2) : 'en');
  const tx = key => (TEXT[lang()] || TEXT.en)[key];

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, cls, onClick) {
    const b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  function close() {
    if (!layer) return;
    layer.remove();
    layer = null;
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.isConnected) opener.focus();
  }

  function onKey(event) {
    if (!layer) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = [...layer.querySelectorAll('button:not([disabled]), a[href]')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function render() {
    const panel = layer.querySelector('.demo-panel');
    panel.replaceChildren();
    const head = el('div', 'demo-head');
    head.append(el('span', 'demo-badge', tx('badge')), button('×', 'demo-close', close));
    head.lastChild.setAttribute('aria-label', tx('close'));
    panel.append(head);
    if (state.step > 0) panel.append(el('p', 'demo-progress', tx('stepOf').replace('{n}', state.step)));
    const body = el('div', 'demo-body');
    panel.append(body);
    const pro = PROS.find(p => p.id === state.pro) || PROS[0];
    const nav = el('div', 'demo-nav');
    const go = (step) => () => { state.step = step; render(); };

    if (state.step === 0) {
      body.append(el('h2', null, tx('chooseT')), el('p', 'demo-sub', tx('chooseB')));
      const choices = el('div', 'demo-choices');
      [['customer', 'asCustomer', 'asCustomerB'], ['provider', 'asProvider', 'asProviderB']].forEach(([role, head2, sub]) => {
        const choice = el('button', 'demo-choice');
        choice.type = 'button';
        choice.append(el('strong', null, tx(head2)), el('small', null, tx(sub)));
        choice.addEventListener('click', () => { state.role = role; state.step = 1; render(); });
        choices.append(choice);
      });
      body.append(choices);
    } else if (state.role === 'provider' && state.step < 5) {
      if (state.step === 1) {
        body.append(el('h2', null, tx('p1t')), el('p', 'demo-sub', tx('p1b')));
        const dl = el('dl', 'demo-facts');
        [[tx('skillL'), tx('sampleSkill')], [tx('areaL'), tx('sampleArea')], [tx('availL'), tx('sampleAvail')], [tx('rateL'), tx('sampleRate')]].forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
        body.append(el('p', 'demo-chat-note', tx('mockTitle')), dl);
        nav.append(button(tx('back'), 'demo-ghost', go(0)), button(tx('pubBtn'), 'demo-primary', go(2)));
      } else if (state.step === 2) {
        body.append(el('h2', null, tx('p2t')), el('p', 'demo-sub', tx('p2b')));
        const req = el('div', 'demo-chat');
        req.append(el('p', 'demo-chat-note', tx('reqFrom')), el('p', 'demo-bubble', tx('reqMsg')));
        body.append(req);
        nav.append(button(tx('back'), 'demo-ghost', go(1)), button(tx('reqBtn'), 'demo-primary', go(3)));
      } else if (state.step === 3) {
        body.append(el('h2', null, tx('p3t')), el('p', 'demo-sub', tx('p3b')), el('p', 'demo-note', tx('p3n')));
        nav.append(button(tx('back'), 'demo-ghost', go(2)), button(tx('acceptOpen'), 'demo-primary', go(4)));
      } else {
        body.append(el('h2', null, tx('p4t')), el('p', 'demo-sub', tx('p4b')));
        const chat = el('div', 'demo-chat');
        chat.append(el('p', 'demo-chat-note', `${tx('chatNote')} · Priya M.`), el('p', 'demo-bubble', tx('pMsg')), el('p', 'demo-bubble is-me', tx('pReply')));
        body.append(chat);
        nav.append(button(tx('back'), 'demo-ghost', go(3)), button(tx('next'), 'demo-primary', go(5)));
      }
    } else if (state.step === 1) {
      body.append(el('h2', null, tx('s1t')), el('p', 'demo-sub', tx('s1b')));
      const chips = el('div', 'demo-chips');
      ['All', ...new Set(PROS.map(p => p.skill))].forEach(skill => {
        const chip = button(skill === 'All' ? tx('all') : skill, 'demo-chip' + (state.filter === skill ? ' is-active' : ''), () => { state.filter = skill; render(); });
        chip.setAttribute('aria-pressed', String(state.filter === skill));
        chips.append(chip);
      });
      const list = el('div', 'demo-list');
      PROS.filter(p => state.filter === 'All' || p.skill === state.filter).forEach(p => {
        const card = el('div', 'demo-card');
        const info = el('div', 'demo-info');
        info.append(el('strong', null, p.name), el('span', null, `${p.skill} · ${p.km} ${tx('away')}`), el('span', 'demo-rating', `★ ${p.rating} (${p.n} ${tx('reviews')})`));
        card.append(el('span', 'demo-avatar', p.name[0]), info, button(tx('view'), 'demo-secondary', () => { state.pro = p.id; state.step = 2; render(); }));
        list.append(card);
      });
      body.append(chips, list);
      nav.append(button(tx('back'), 'demo-ghost', go(0)));
    } else if (state.step === 2) {
      body.append(el('h2', null, tx('s2t')), el('p', 'demo-sub', tx('s2b')));
      const card = el('div', 'demo-profile');
      card.append(el('span', 'demo-avatar is-large', pro.name[0]), el('strong', null, `${pro.name} · ${pro.skill}`), el('span', 'demo-rating', `★ ${pro.rating} (${pro.n} ${tx('reviews')})`));
      const dl = el('dl', 'demo-facts');
      [[tx('about'), pro.about], [tx('price'), pro.rate], [tx('avail'), pro.avail]].forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
      body.append(card, dl);
      nav.append(button(tx('back'), 'demo-ghost', () => { state.step = 1; render(); }), button(tx('request'), 'demo-primary', () => { state.step = 3; render(); }));
    } else if (state.step === 3) {
      body.append(el('h2', null, tx('s3t')), el('p', 'demo-sub', tx('s3b')), el('p', 'demo-note', tx('s3n')));
      nav.append(button(tx('back'), 'demo-ghost', () => { state.step = 2; render(); }), button(tx('accept'), 'demo-primary', () => { state.step = 4; render(); }));
    } else if (state.step === 4) {
      body.append(el('h2', null, tx('s4t')), el('p', 'demo-sub', tx('s4b')));
      const chat = el('div', 'demo-chat');
      chat.append(el('p', 'demo-chat-note', `${tx('chatNote')} · ${pro.name}`), el('p', 'demo-bubble is-me', tx('typing')), el('p', 'demo-bubble', tx('reply')));
      body.append(chat);
      nav.append(button(tx('back'), 'demo-ghost', () => { state.step = 3; render(); }), button(tx('next'), 'demo-primary', () => { state.step = 5; render(); }));
    } else {
      body.append(el('h2', null, tx('s5t')), el('p', 'demo-sub', tx('s5b')));
      const signup = el('a', 'demo-primary', tx('signup'));
      signup.href = 'auth.html?mode=signup';
      const goService = el('a', 'demo-secondary', tx('goService'));
      goService.href = 'index.html?page=marketplace';
      const goWork = el('a', 'demo-secondary', tx('goWork'));
      goWork.href = 'index.html?page=tasks';
      body.append(el('div', 'demo-final-links'));
      body.lastChild.append(goService, goWork);
      nav.append(button(tx('again'), 'demo-ghost', () => { state = { step: 0, role: 'customer', filter: 'All', pro: 'p1' }; render(); }), signup);
    }
    panel.append(nav);
    const focusTarget = panel.querySelector('.demo-primary, .demo-secondary, .demo-chip');
    (focusTarget || panel.querySelector('.demo-close')).focus({ preventScroll: true });
  }

  function open() {
    if (layer) return;
    opener = document.activeElement;
    state = { step: 0, role: 'customer', filter: 'All', pro: 'p1' };
    layer = el('div', 'demo-layer');
    const panel = el('div', 'demo-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'TIME2INCOME demo');
    layer.append(panel);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    document.body.append(layer);
    document.addEventListener('keydown', onKey, true);
    render();
  }

  window.TIME2INCOME_DEMO = { open };
  document.addEventListener('click', event => {
    const trigger = event.target.closest && event.target.closest('[data-open-demo]');
    if (trigger) { event.preventDefault(); open(); }
  });
})();
