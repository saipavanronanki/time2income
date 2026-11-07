'use strict';

(() => {
  const currencies = [
    {code:'INR',name:'Indian Rupee',countries:['india']},
    {code:'USD',name:'US Dollar',countries:['united states','usa','united states of america']},
    {code:'EUR',name:'Euro',countries:['germany','france','italy','spain','portugal','netherlands']},
    {code:'GBP',name:'British Pound',countries:['united kingdom','uk']},
    {code:'AED',name:'UAE Dirham',countries:['united arab emirates','uae']},
    {code:'SAR',name:'Saudi Riyal',countries:['saudi arabia']},
    {code:'QAR',name:'Qatari Riyal',countries:['qatar']},
    {code:'OMR',name:'Omani Rial',countries:['oman']},
    {code:'BHD',name:'Bahraini Dinar',countries:['bahrain']},
    {code:'KWD',name:'Kuwaiti Dinar',countries:['kuwait']},
    {code:'SGD',name:'Singapore Dollar',countries:['singapore']},
    {code:'MYR',name:'Malaysian Ringgit',countries:['malaysia']},
    {code:'AUD',name:'Australian Dollar',countries:['australia']},
    {code:'NZD',name:'New Zealand Dollar',countries:['new zealand']},
    {code:'CAD',name:'Canadian Dollar',countries:['canada']},
    {code:'CHF',name:'Swiss Franc',countries:['switzerland']},
    {code:'CNY',name:'Chinese Yuan',countries:['china']},
    {code:'JPY',name:'Japanese Yen',countries:['japan']},
    {code:'KRW',name:'South Korean Won',countries:['south korea','korea']},
    {code:'THB',name:'Thai Baht',countries:['thailand']},
    {code:'IDR',name:'Indonesian Rupiah',countries:['indonesia']},
    {code:'PHP',name:'Philippine Peso',countries:['philippines']},
    {code:'VND',name:'Vietnamese Dong',countries:['vietnam']},
    {code:'PKR',name:'Pakistani Rupee',countries:['pakistan']},
    {code:'BDT',name:'Bangladeshi Taka',countries:['bangladesh']},
    {code:'LKR',name:'Sri Lankan Rupee',countries:['sri lanka']},
    {code:'NPR',name:'Nepalese Rupee',countries:['nepal']},
    {code:'ZAR',name:'South African Rand',countries:['south africa']},
    {code:'NGN',name:'Nigerian Naira',countries:['nigeria']},
    {code:'KES',name:'Kenyan Shilling',countries:['kenya']},
    {code:'EGP',name:'Egyptian Pound',countries:['egypt']},
    {code:'TRY',name:'Turkish Lira',countries:['turkey','turkiye']},
    {code:'BRL',name:'Brazilian Real',countries:['brazil']},
    {code:'MXN',name:'Mexican Peso',countries:['mexico']},
    {code:'HKD',name:'Hong Kong Dollar',countries:['hong kong']},
    {code:'TWD',name:'New Taiwan Dollar',countries:['taiwan']},
    {code:'SEK',name:'Swedish Krona',countries:['sweden']},
    {code:'NOK',name:'Norwegian Krone',countries:['norway']},
    {code:'DKK',name:'Danish Krone',countries:['denmark']},
    {code:'PLN',name:'Polish Zloty',countries:['poland']},
    {code:'CZK',name:'Czech Koruna',countries:['czechia','czech republic']},
    {code:'RUB',name:'Russian Ruble',countries:['russia']},
    {code:'ILS',name:'Israeli New Shekel',countries:['israel']},
    {code:'CLP',name:'Chilean Peso',countries:['chile']},
    {code:'COP',name:'Colombian Peso',countries:['colombia']},
    {code:'ARS',name:'Argentine Peso',countries:['argentina']},
    {code:'GHS',name:'Ghanaian Cedi',countries:['ghana']},
    {code:'MAD',name:'Moroccan Dirham',countries:['morocco']}
  ];
  const countryCurrencyEntries = `
    AF=AFN AL=ALL DZ=DZD AD=EUR AO=AOA AG=XCD AR=ARS AM=AMD AU=AUD AT=EUR AZ=AZN
    BS=BSD BH=BHD BD=BDT BB=BBD BY=BYN BE=EUR BZ=BZD BJ=XOF BT=BTN BO=BOB BA=BAM
    BW=BWP BR=BRL BN=BND BG=EUR BF=XOF BI=BIF CV=CVE KH=KHR CM=XAF CA=CAD CF=XAF
    TD=XAF CL=CLP CN=CNY CO=COP KM=KMF CG=XAF CR=CRC CI=XOF HR=EUR CU=CUP CY=EUR
    CZ=CZK CD=CDF DK=DKK DJ=DJF DM=XCD DO=DOP EC=USD EG=EGP SV=USD GQ=XAF ER=ERN
    EE=EUR SZ=SZL ET=ETB FJ=FJD FI=EUR FR=EUR GA=XAF GM=GMD GE=GEL DE=EUR GH=GHS
    GR=EUR GD=XCD GT=GTQ GN=GNF GW=XOF GY=GYD HT=HTG HN=HNL HU=HUF IS=ISK IN=INR
    ID=IDR IR=IRR IQ=IQD IE=EUR IL=ILS IT=EUR JM=JMD JP=JPY JO=JOD KZ=KZT KE=KES
    KI=AUD KP=KPW KR=KRW KW=KWD KG=KGS LA=LAK LV=EUR LB=LBP LS=LSL LR=LRD LY=LYD
    LI=CHF LT=EUR LU=EUR MG=MGA MW=MWK MY=MYR MV=MVR ML=XOF MT=EUR MH=USD MR=MRU
    MU=MUR MX=MXN FM=USD MD=MDL MC=EUR MN=MNT ME=EUR MA=MAD MZ=MZN MM=MMK NA=NAD
    NR=AUD NP=NPR NL=EUR NZ=NZD NI=NIO NE=XOF NG=NGN MK=MKD NO=NOK OM=OMR PK=PKR
    PW=USD PS=ILS,JOD PA=PAB,USD PG=PGK PY=PYG PE=PEN PH=PHP PL=PLN PT=EUR QA=QAR RO=RON
    RU=RUB RW=RWF KN=XCD LC=XCD VC=XCD WS=WST SM=EUR ST=STN SA=SAR SN=XOF RS=RSD
    SC=SCR SL=SLE SG=SGD SK=EUR SI=EUR SB=SBD SO=SOS ZA=ZAR SS=SSP ES=EUR LK=LKR
    SD=SDG SR=SRD SE=SEK CH=CHF SY=SYP TJ=TJS TZ=TZS TH=THB TL=USD TG=XOF TO=TOP
    TT=TTD TN=TND TR=TRY TW=TWD TM=TMT TV=AUD UG=UGX UA=UAH AE=AED GB=GBP US=USD UY=UYU
    UZ=UZS VU=VUV VA=EUR VE=VES VN=VND YE=YER ZM=ZMW ZW=ZWG
  `.trim().split(/\s+/).filter(Boolean).flatMap(entry => {
    const [regionCode, currencyCodes] = entry.split('=');
    return currencyCodes.split(',').map(currencyCode => [regionCode, currencyCode]);
  });
  const regionNames = new Intl.DisplayNames(['en'], {type:'region'});
  const currencyNames = new Intl.DisplayNames(['en'], {type:'currency'});
  for (const [regionCode, currencyCode] of countryCurrencyEntries) {
    const country = regionNames.of(regionCode);
    if (!country || country === regionCode) continue;
    let currency = currencies.find(item => item.code === currencyCode);
    if (!currency) {
      currency = {
        code:currencyCode,
        name:currencyNames.of(currencyCode) || currencyCode,
        countries:[]
      };
      currencies.push(currency);
    }
    const countryAliases = regionCode === 'PS' ? [country, 'Palestine'] : [country];
    for (const countryAlias of countryAliases) {
      if (!currency.countries.includes(countryAlias.toLocaleLowerCase())) {
        currency.countries.push(countryAlias.toLocaleLowerCase());
      }
    }
  }
  const cacheMaxAge = 6 * 60 * 60 * 1000;
  let currentRates = null;
  let currentRateBase = null;
  let lastUpdated = null;

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function symbolFor(code, locale = 'en') {
    try {
      return new Intl.NumberFormat(locale, {style:'currency',currency:code,currencyDisplay:'symbol'})
        .formatToParts(1).find(part => part.type === 'currency')?.value || code;
    } catch {
      return code;
    }
  }

  function resolveCurrency(value) {
    const needle = normalize(value);
    if (!needle) return null;
    const exact = currencies.find(currency =>
      currency.code.toLowerCase() === needle || normalize(currency.name) === needle
    );
    if (exact) return exact;
    const symbolMatches = currencies.filter(currency => normalize(symbolFor(currency.code)) === needle);
    if (symbolMatches.length === 1) return symbolMatches[0];
    if (symbolMatches.length > 1) return null;
    const code = String(value).match(/(?:^|[^a-z])([a-z]{3})(?:$|[^a-z])/i)?.[1]?.toUpperCase();
    return currencies.find(currency => currency.code === code) || null;
  }

  function suggestCurrency(country) {
    const needle = normalize(country);
    return currencies.find(currency => currency.countries.some(name => normalize(name) === needle))?.code || null;
  }

  function decimals(code) {
    try {
      return new Intl.NumberFormat('en', {style:'currency',currency:code}).resolvedOptions().maximumFractionDigits;
    } catch {
      return 2;
    }
  }

  function formatOriginal(amount, code, locale) {
    const currency = resolveCurrency(code);
    if (!currency || !Number.isFinite(Number(amount))) return `${amount} ${code || ''}`.trim();
    try {
      const formatted = new Intl.NumberFormat(locale, {
        style:'currency',currency:currency.code,
        minimumFractionDigits:decimals(currency.code),
        maximumFractionDigits:decimals(currency.code)
      }).format(Number(amount));
      return `${formatted} ${currency.code}`;
    } catch (error) {
      console.warn('Currency formatting failed:', error);
      return `${Number(amount).toLocaleString(locale)} ${currency.code}`;
    }
  }

  function getRateCache(base) {
    try { return JSON.parse(localStorage.getItem(`time2income-fx-${base}`) || 'null'); }
    catch { return null; }
  }

  function saveRateCache(base, entry) {
    try { localStorage.setItem(`time2income-fx-${base}`, JSON.stringify(entry)); }
    catch (error) { console.warn('Could not cache exchange rates:', error); }
  }

  async function loadRates(base, force = false) {
    const code = resolveCurrency(base)?.code || 'INR';
    const cached = getRateCache(code);
    if (cached?.rates) {
      currentRates = cached.rates;
      currentRateBase = code;
      lastUpdated = cached.timestamp;
      if (!force && Date.now() - cached.timestamp < cacheMaxAge) return cached;
    }
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${code}`, {cache:'no-store'});
      if (!response.ok) throw new Error(`Exchange-rate service returned ${response.status}`);
      const result = await response.json();
      if (result.result !== 'success' || result.base_code !== code || !result.rates) {
        throw new Error('Exchange-rate service returned invalid data.');
      }
      const entry = {rates:result.rates,timestamp:Date.now(),source:'open.er-api.com'};
      currentRates = entry.rates;
      currentRateBase = code;
      lastUpdated = entry.timestamp;
      saveRateCache(code, entry);
      return entry;
    } catch (error) {
      console.warn('Exchange rates unavailable:', error);
      if (currentRateBase === code && currentRates) return {rates:currentRates,timestamp:lastUpdated,source:'cached'};
      currentRates = null;
      currentRateBase = code;
      lastUpdated = null;
      throw error;
    }
  }

  function convert(amount, originalCode, preferredCode) {
    const original = resolveCurrency(originalCode)?.code;
    const preferred = resolveCurrency(preferredCode)?.code;
    if (!original || !preferred || !Number.isFinite(Number(amount))) return null;
    if (original === preferred) return Number(amount);
    if (!currentRates || currentRateBase !== preferred) return null;
    const rate = Number(currentRates[original]);
    return Number.isFinite(rate) && rate > 0 ? Number(amount) / rate : null;
  }

  function formatDisplay(amount, originalCode, preferredCode, locale) {
    const original = resolveCurrency(originalCode)?.code || 'INR';
    const preferred = resolveCurrency(preferredCode)?.code || original;
    const originalText = formatOriginal(amount, original, locale);
    if (original === preferred) return originalText;
    const estimate = convert(amount, original, preferred);
    if (estimate === null) return `${originalText} · Conversion unavailable`;
    return `${originalText} · ~${formatOriginal(estimate, preferred, locale)} estimate`;
  }

  function rateStatus(locale, messages = {}) {
    if (!currentRates || !lastUpdated) return messages.unavailable || 'Exchange conversion unavailable; original amounts shown.';
    const updated = new Intl.DateTimeFormat(locale, {dateStyle:'medium',timeStyle:'short'}).format(lastUpdated);
    return `${messages.source || 'Approximate rates from'} open.er-api.com · ${messages.updated || 'updated'} ${updated}`;
  }

  window.TIME2INCOME_CURRENCY = {currencies,resolveCurrency,suggestCurrency,symbolFor,decimals,formatOriginal,formatDisplay,loadRates,rateStatus};
})();