'use strict';

const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const authSubmit = document.getElementById('authSubmit');
const signInTab = document.getElementById('signInTab');
const signUpTab = document.getElementById('signUpTab');
const authCountry = document.getElementById('authCountry');
const authCountryOptions = document.getElementById('authCountryOptions');
const authCountryPicker = document.getElementById('authCountryPicker');
const authCountryToggle = document.getElementById('authCountryToggle');
const authCountryEmpty = document.getElementById('authCountryEmpty');
const authCountryDetails = document.getElementById('authCountryDetails');
const authDialCode = document.getElementById('authDialCode');
const authDialSearch = document.getElementById('authDialSearch');
const authDialPicker = document.getElementById('authDialPicker');
const authDialOptions = document.getElementById('authDialOptions');
const authDialToggle = document.getElementById('authDialToggle');
const authDialEmpty = document.getElementById('authDialEmpty');
const authCurrency = document.getElementById('authCurrency');
const authCurrencySearch = document.getElementById('authCurrencySearch');
const authCurrencyPicker = document.getElementById('authCurrencyPicker');
const authCurrencyOptions = document.getElementById('authCurrencyOptions');
const authCurrencyToggle = document.getElementById('authCurrencyToggle');
const authCurrencyEmpty = document.getElementById('authCurrencyEmpty');
const authProfilePhoto = document.getElementById('authProfilePhoto');
const authProfilePhotoPreview = document.getElementById('authProfilePhotoPreview');
const authIdentityDocument = document.getElementById('authIdentityDocument');
const authIdentityDocumentField = document.getElementById('authIdentityDocumentField');
const authIdentityDocumentTypeField = document.getElementById('authIdentityDocumentTypeField');
const authIdentityDocumentType = document.getElementById('authIdentityDocumentType');
const authIdentityDocumentTypePicker = document.getElementById('authIdentityDocumentTypePicker');
const authIdentityDocumentTypeOptions = document.getElementById('authIdentityDocumentTypeOptions');
const authIdentityDocumentTypeToggle = document.getElementById('authIdentityDocumentTypeToggle');
const authIdentityDocumentConsent = document.getElementById('authIdentityConsent');
const authIdentityConsentGroup = document.getElementById('authIdentityConsentGroup');
const authIdentityDocumentFileName = document.getElementById('authIdentityDocumentFileName');
const authPassword = document.getElementById('authPassword');
const authConfirmPassword = document.getElementById('authConfirmPassword');
const authConfirmPasswordHint = document.getElementById('authConfirmPasswordHint');
const authSkill = document.getElementById('authSkill');
const authSkillCategory = document.getElementById('authSkillCategory');
const authCategory = document.getElementById('authCategory');
const authCatalogSuggestionKind = document.getElementById('authCatalogSuggestionKind');
const authCatalogSuggestionSkillCategoryField = document.getElementById('authCatalogSuggestionSkillCategoryField');
const authCatalogSuggestionSkillCategory = document.getElementById('authCatalogSuggestionSkillCategory');
const authCatalogSuggestionCategoryField = document.getElementById('authCatalogSuggestionCategoryField');
const authCatalogSuggestionCategoryName = document.getElementById('authCatalogSuggestionCategoryName');
const OTHER_SIGNUP_UNCATEGORIZED = '__other__';
const authBirthDate = document.getElementById('authBirthDate');
const authGender = document.getElementById('authGender');
const authCity = document.getElementById('authCity');
const authState = document.getElementById('authState');
const authPhone = document.getElementById('authPhone');
const authConsent = document.getElementById('authConsent');
const authLanguage = document.getElementById('authLanguage');
const authLanguageSearch = document.getElementById('authLanguageSearch');
const authLanguagePicker = document.getElementById('authLanguagePicker');
const authLanguageOptions = document.getElementById('authLanguageOptions');
const authLanguageToggle = document.getElementById('authLanguageToggle');
const authLanguageEmpty = document.getElementById('authLanguageEmpty');
let authMode = 'signin';
let countryDirectory = [];
let signupCountryOptions = [];
let signupCurrencyOptions = [];
let authLanguageOptionsData = [];
let activeCountryOptionIndex = -1;
let activeCurrencyOptionIndex = -1;
let activeDialOptionIndex = -1;
let activeLanguageOptionIndex = -1;
let identityDocumentMode = false;
let identityDocumentUser = null;
let legacyIdentityDocumentCleanup = null;
const normalizeCountryName = value => String(value || '').trim().toLocaleLowerCase().replace(/[^a-z]/g, '');
const findSignupCountry = value => {
  const normalized = normalizeCountryName(value);
  return countryDirectory.find(country =>
    normalizeCountryName(country.name) === normalized || normalizeCountryName(country.code) === normalized
  );
};
const findSignupCountryByName = value => {
  const normalized = normalizeCountryName(value);
  return countryDirectory.find(country => normalizeCountryName(country.name) === normalized);
};

function updateSignupCountryDetails(country) {
  authCountryDetails.hidden = !country;
  if (!country) return;
  document.getElementById('authCountryCodeValue').textContent = country.code;
  document.getElementById('authCountryDialValue').textContent = country.dialCode;
  document.getElementById('authCountryCurrencyValue').textContent = `${country.currencyCode} · ${window.TIME2INCOME_CURRENCY.resolveCurrency(country.currencyCode)?.name || 'Not available'}`;
  document.getElementById('authCountryLanguagesValue').textContent = country.languages || '—';
}

function renderCountryOptions(query = '') {
  const search = query.trim().toLocaleLowerCase();
  const matchingCountries = signupCountryOptions.filter(({ country, displayName }) =>
    !search
    || country.name.toLocaleLowerCase().includes(search)
    || country.code.toLocaleLowerCase().includes(search)
    || displayName.toLocaleLowerCase().includes(search)
  );
  if (search) {
    const startsWithSearch = ({ country, displayName }) =>
      country.name.toLocaleLowerCase().startsWith(search)
      || country.code.toLocaleLowerCase().startsWith(search)
      || displayName.toLocaleLowerCase().startsWith(search);
    matchingCountries.sort((first, second) => Number(startsWithSearch(second)) - Number(startsWithSearch(first)));
  }
  authCountryOptions.replaceChildren();
  matchingCountries.forEach(({ country, displayName, flag }) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `authCountryOption-${country.code}`;
    option.className = 'auth-country-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(findSignupCountry(authCountry.value)?.code === country.code));
    option.textContent = `${flag} ${displayName} (${country.code})`;
    option.addEventListener('click', () => {
      authCountry.value = country.name;
      authCountry.dispatchEvent(new Event('change', { bubbles: true }));
      closeCountryOptions();
      authCountry.focus();
    });
    authCountryOptions.append(option);
  });
  authCountryEmpty.hidden = matchingCountries.length > 0;
  activeCountryOptionIndex = -1;
  authCountry.removeAttribute('aria-activedescendant');
}

function openCountryOptions(query = '') {
  renderCountryOptions(query);
  authCountryOptions.hidden = false;
  authCountry.setAttribute('aria-expanded', 'true');
  authCountryToggle.setAttribute('aria-expanded', 'true');
}

function closeCountryOptions() {
  authCountryOptions.hidden = true;
  authCountryEmpty.hidden = true;
  authCountry.setAttribute('aria-expanded', 'false');
  authCountryToggle.setAttribute('aria-expanded', 'false');
  authCountry.removeAttribute('aria-activedescendant');
  activeCountryOptionIndex = -1;
}

function moveActiveCountryOption(direction) {
  const options = [...authCountryOptions.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  activeCountryOptionIndex = (activeCountryOptionIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.dataset.active = String(index === activeCountryOptionIndex));
  const activeOption = options[activeCountryOptionIndex];
  authCountry.setAttribute('aria-activedescendant', activeOption.id);
  activeOption.scrollIntoView({ block: 'nearest' });
}

function getDialCountryLabel(country) {
  const displayName = signupCountryOptions.find(option => option.country.code === country.code)?.displayName || country.name;
  return `${country.code} ${country.dialCode} · ${displayName} (${country.code})`;
}

function renderDialOptions(query = '') {
  const search = query.trim().toLocaleLowerCase();
  const matchingCountries = signupCountryOptions.filter(({ country, displayName }) =>
    !search
    || country.name.toLocaleLowerCase().includes(search)
    || displayName.toLocaleLowerCase().includes(search)
    || country.code.toLocaleLowerCase().includes(search)
    || country.dialCode.replace(/\s/g, '').includes(search.replace(/\s/g, ''))
  );
  if (search) {
    const startsWithSearch = ({ country, displayName }) =>
      country.name.toLocaleLowerCase().startsWith(search)
      || displayName.toLocaleLowerCase().startsWith(search)
      || country.code.toLocaleLowerCase().startsWith(search)
      || country.dialCode.replace(/\s/g, '').startsWith(search.replace(/\s/g, ''));
    matchingCountries.sort((first, second) => Number(startsWithSearch(second)) - Number(startsWithSearch(first)));
  }
  authDialOptions.replaceChildren();
  matchingCountries.forEach(({ country }) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `authDialOption-${country.code}`;
    option.className = 'auth-country-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(authDialCode.value === country.code));
    option.textContent = getDialCountryLabel(country);
    option.addEventListener('click', () => selectSignupDialCountry(country.code));
    authDialOptions.append(option);
  });
  authDialEmpty.hidden = matchingCountries.length > 0;
  activeDialOptionIndex = -1;
  authDialSearch.removeAttribute('aria-activedescendant');
}

function openDialOptions(query = '') {
  renderDialOptions(query);
  authDialOptions.hidden = false;
  authDialSearch.setAttribute('aria-expanded', 'true');
  authDialToggle.setAttribute('aria-expanded', 'true');
}

function closeDialOptions() {
  authDialOptions.hidden = true;
  authDialEmpty.hidden = true;
  authDialSearch.setAttribute('aria-expanded', 'false');
  authDialToggle.setAttribute('aria-expanded', 'false');
  authDialSearch.removeAttribute('aria-activedescendant');
  activeDialOptionIndex = -1;
}

function moveActiveDialOption(direction) {
  const options = [...authDialOptions.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  activeDialOptionIndex = (activeDialOptionIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.dataset.active = String(index === activeDialOptionIndex));
  const activeOption = options[activeDialOptionIndex];
  authDialSearch.setAttribute('aria-activedescendant', activeOption.id);
  activeOption.scrollIntoView({ block: 'nearest' });
}

function syncDialSearch(country) {
  authDialSearch.value = country ? getDialCountryLabel(country) : '';
  authDialSearch.setCustomValidity(country ? '' : 'Choose a country calling code.');
}

function selectSignupDialCountry(code) {
  const country = countryDirectory.find(item => item.code === code);
  if (!country) return;
  authDialCode.value = country.code;
  syncDialSearch(country);
  authDialCode.dispatchEvent(new Event('change', { bubbles: true }));
  closeDialOptions();
}

function renderCurrencyOptions(query = '') {
  const search = query.trim().toLocaleLowerCase();
  const matchingCurrencies = signupCurrencyOptions.filter(({ currency, label }) =>
    !search
    || currency.code.toLocaleLowerCase().includes(search)
    || currency.name.toLocaleLowerCase().includes(search)
    || label.toLocaleLowerCase().includes(search)
  );
  if (search) {
    const startsWithSearch = ({ currency, label }) =>
      currency.code.toLocaleLowerCase().startsWith(search)
      || currency.name.toLocaleLowerCase().startsWith(search)
      || label.toLocaleLowerCase().startsWith(search);
    matchingCurrencies.sort((first, second) => Number(startsWithSearch(second)) - Number(startsWithSearch(first)));
  }
  authCurrencyOptions.replaceChildren();
  matchingCurrencies.forEach(({ currency, label }) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `authCurrencyOption-${currency.code}`;
    option.className = 'auth-country-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(authCurrency.value === currency.code));
    option.textContent = label;
    option.addEventListener('click', () => selectSignupCurrency(currency.code));
    authCurrencyOptions.append(option);
  });
  authCurrencyEmpty.hidden = matchingCurrencies.length > 0;
  activeCurrencyOptionIndex = -1;
  authCurrencySearch.removeAttribute('aria-activedescendant');
}

function openCurrencyOptions(query = '') {
  renderCurrencyOptions(query);
  authCurrencyOptions.hidden = false;
  authCurrencySearch.setAttribute('aria-expanded', 'true');
  authCurrencyToggle.setAttribute('aria-expanded', 'true');
}

function closeCurrencyOptions() {
  authCurrencyOptions.hidden = true;
  authCurrencyEmpty.hidden = true;
  authCurrencySearch.setAttribute('aria-expanded', 'false');
  authCurrencyToggle.setAttribute('aria-expanded', 'false');
  authCurrencySearch.removeAttribute('aria-activedescendant');
  activeCurrencyOptionIndex = -1;
}

function moveActiveCurrencyOption(direction) {
  const options = [...authCurrencyOptions.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  activeCurrencyOptionIndex = (activeCurrencyOptionIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.dataset.active = String(index === activeCurrencyOptionIndex));
  const activeOption = options[activeCurrencyOptionIndex];
  authCurrencySearch.setAttribute('aria-activedescendant', activeOption.id);
  activeOption.scrollIntoView({ block: 'nearest' });
}

function selectSignupCurrency(code) {
  const selected = signupCurrencyOptions.find(({ currency }) => currency.code === code);
  if (!selected) return;
  authCurrency.value = selected.currency.code;
  authCurrencySearch.value = selected.label;
  authCurrencySearch.setCustomValidity('');
  if (!authCurrencyOptions.hidden) renderCurrencyOptions(authCurrencySearch.value);
  closeCurrencyOptions();
}

function getAuthLanguageLabel(language) {
  return `${language.native} · ${language.name}`;
}

function renderAuthLanguageOptions(query = '') {
  const search = query.trim().toLocaleLowerCase();
  const matchingLanguages = authLanguageOptionsData.filter(language =>
    !search
    || language.name.toLocaleLowerCase().includes(search)
    || language.native.toLocaleLowerCase().includes(search)
    || language.code.toLocaleLowerCase().includes(search)
  );
  if (search) {
    const startsWithSearch = language =>
      language.name.toLocaleLowerCase().startsWith(search)
      || language.native.toLocaleLowerCase().startsWith(search)
      || language.code.toLocaleLowerCase().startsWith(search);
    matchingLanguages.sort((first, second) => Number(startsWithSearch(second)) - Number(startsWithSearch(first)));
  }
  authLanguageOptions.replaceChildren();
  matchingLanguages.forEach(language => {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `authLanguageOption-${language.code.replace(/[^a-z0-9-]/gi, '-')}`;
    option.className = 'auth-country-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(authLanguage.value === language.code));
    option.textContent = getAuthLanguageLabel(language);
    option.addEventListener('click', () => {
      authLanguage.value = language.code;
      authLanguage.dispatchEvent(new Event('change', { bubbles: true }));
      closeAuthLanguageOptions();
      authLanguageSearch.focus();
    });
    authLanguageOptions.append(option);
  });
  authLanguageEmpty.hidden = matchingLanguages.length > 0;
  activeLanguageOptionIndex = -1;
  authLanguageSearch.removeAttribute('aria-activedescendant');
}

function openAuthLanguageOptions(query = '') {
  renderAuthLanguageOptions(query);
  authLanguageOptions.hidden = false;
  authLanguageSearch.setAttribute('aria-expanded', 'true');
  authLanguageToggle.setAttribute('aria-expanded', 'true');
}

function closeAuthLanguageOptions() {
  authLanguageOptions.hidden = true;
  authLanguageEmpty.hidden = true;
  authLanguageSearch.setAttribute('aria-expanded', 'false');
  authLanguageToggle.setAttribute('aria-expanded', 'false');
  authLanguageSearch.removeAttribute('aria-activedescendant');
  activeLanguageOptionIndex = -1;
}

function moveActiveAuthLanguageOption(direction) {
  const options = [...authLanguageOptions.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  activeLanguageOptionIndex = (activeLanguageOptionIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.dataset.active = String(index === activeLanguageOptionIndex));
  const activeOption = options[activeLanguageOptionIndex];
  authLanguageSearch.setAttribute('aria-activedescendant', activeOption.id);
  activeOption.scrollIntoView({ block: 'nearest' });
}

const authTranslations = {
  hi: {
    languageSelectLabel:'भाषा चुनें', languageOptions:'भाषा विकल्प दिखाएँ',
    languageNoMatch:'कोई मिलती-जुलती भाषा नहीं मिली', accountAccess:'खाते में प्रवेश',
    callingCode:'देश का फ़ोन कोड', legalNavigation:'सहायता और कानूनी जानकारी',
    headerNote:'समय, कौशल और अवसरों का बाज़ार', kicker:'समय, कौशल और अवसर',
    stateProvince:'राज्य / प्रांत', statePlaceholder:'अपना राज्य या प्रांत दर्ज करें',
    headline:'हर ज़रूरत के लिए एक खाता।',
    intro:'एक ही T2I खाते से दुनिया में कहीं भी कुशल लोगों को काम पर रखें या अपनी सेवाएँ दें।',
    benefitWork:'काम खोजें और कमाई करें', benefitHire:'काम पोस्ट करें और प्रतिभा को नियुक्त करें',
    benefitGlobal:'दुनियाभर के अवसरों से जुड़ें', benefitProfile:'अपनी प्रोफ़ाइल और पोर्टफ़ोलियो बनाएँ',
    signIn:'साइन इन', createAccount:'खाता बनाएँ',
    signInTitle:'वापस स्वागत है', signUpTitle:'अपना T2I खाता बनाएँ',
    signInDescription:'मार्केटप्लेस जारी रखने के लिए लॉग इन करें।',
    signUpDescription:'दुनिया में कहीं भी काम देने और कौशल साझा करने के लिए एक खाता। ईमेल की पुष्टि के बाद साइन इन करके निजी पहचान समीक्षा के लिए ID जमा करें।',
    fullName:'पूरा नाम', namePlaceholder:'अपना पूरा नाम दर्ज करें',
    profilePhoto:'प्रोफ़ाइल फ़ोटो',
    profilePhotoHint:'साफ़, पेशेवर फ़ोटो चुनें। यह मार्केटप्लेस सदस्यों को दिखेगी; ID की निजी समीक्षा होगी।',
    documentTypePlaceholder:'अपना ID दस्तावेज़ चुनें',
    documentTypeHint:'सूची में से चुनें या अपने देश के फोटो पहचान-पत्र पर दिए दस्तावेज़ का नाम लिखें।',
    identityDocument:'फोटो पहचान दस्तावेज़',
    identityDocumentHint:'कोई भी मान्य पहचान दस्तावेज़ अपलोड करें जिसमें आपकी फोटो और पहचान संख्या हो। फोन कैमरे से फोटो लें या फ़ाइल चुनें। तस्वीर या PDF, अधिकतम 50 MB। अधिकृत समीक्षक इसकी मैन्युअल जाँच करेंगे; जमा करने से पहचान अपने-आप सत्यापित नहीं होती।',
    identityDocumentConsent:'मैं इस पहचान दस्तावेज़ की निजी समीक्षा के लिए अधिकृत T2I Verification Staff को सहमति देता/देती हूँ। कोई निश्चित retention अवधि तय नहीं है; कानून या वैध कानूनी रोक के कारण रिकॉर्ड रखा जा सकता है। यह marketplace समीक्षा regulated financial KYC नहीं है।',
    identityDocumentRequiredBeforeContinue:'मार्केटप्लेस जारी रखने से पहले साइन इन करके पहचान दस्तावेज़ जमा करें।',
    identityDocumentResubmit:'आपकी पहचान समीक्षा के लिए नया दस्तावेज़ जमा करना आवश्यक है।',
    identityDocumentReviewerMessage:'समीक्षक का संदेश',
    identityDocumentSubmit:'सुरक्षित रूप से दस्तावेज़ जमा करें',
    identityDocumentAccepted:'पहचान दस्तावेज़ जमा हो गया है। समीक्षा लंबित है।',
    identityDocumentUploading:'पहचान दस्तावेज़ को निजी रूप से अपलोड किया जा रहा है…',
    identityDocumentFileInvalid:'JPEG, PNG, WebP, HEIC, HEIF या PDF फ़ाइल चुनें, जिसका आकार 50 MB या उससे कम हो।',
    gender:'लिंग', selectGender:'अपना लिंग चुनें', female:'महिला', male:'पुरुष',
    nonBinary:'नॉन-बाइनरी', selfDescribe:'खुद बताना चाहूँगा/चाहूँगी', preferNot:'बताने की इच्छा नहीं',
    birthDate:'जन्म तिथि', country:'देश', city:'शहर', cityPlaceholder:'अपना शहर दर्ज करें',
    mobile:'मोबाइल नंबर', mobilePlaceholder:'अपना मोबाइल नंबर दर्ज करें',
    countryOptions:'देश के विकल्प दिखाएँ',
    countryNoMatch:'कोई मिलता-जुलता देश नहीं मिला',
    callingCodeOptions:'देश के फ़ोन कोड के विकल्प दिखाएँ',
    callingCodeNoMatch:'कोई मिलता-जुलता देश नहीं मिला',
    currencyOptions:'मुद्रा के विकल्प दिखाएँ',
    currencyNoMatch:'कोई मिलती-जुलती मुद्रा नहीं मिली',
    email:'ईमेल पता', emailPlaceholder:'अपना ईमेल पता दर्ज करें',
    password:'पासवर्ड', passwordPlaceholder:'मज़बूत पासवर्ड बनाएँ',
    passwordHint:'कम से कम 8 अक्षर रखें, जिनमें अक्षर, अंक और एक प्रतीक हो।',
    preferredCurrency:'पसंदीदा मुद्रा',
    currencyHint:'आपके देश के अनुसार सुझाई गई। इसे बाद में खाते में बदल सकते हैं।',
    confirmPassword:'पासवर्ड की पुष्टि करें', confirmPlaceholder:'पासवर्ड फिर से दर्ज करें',
    passwordsMatch:'पासवर्ड मेल खाते हैं।', passwordsMismatch:'पासवर्ड मेल नहीं खाते।',
    categoryChoose:'कौशल श्रेणी चुनें',
    skillCategory:'कौशल श्रेणी', primarySkill:'मुख्य कौशल', skillPlaceholder:'जैसे: प्लंबिंग या डिज़ाइन',
    skillHint:'कौशल खोजने के लिए लिखें या सुझावों में से चुनें।',
    catalogSuggestionOptionLabel:'कौशल या श्रेणी सुझाएँ? (वैकल्पिक)',
    catalogSuggestionNone:'कोई सुझाव नहीं',
    catalogSuggestionSkill:'ऊपर दिया मुख्य कौशल सुझाएँ',
    catalogSuggestionCategory:'नई श्रेणी सुझाएँ',
    catalogSuggestionSignupHint:'कैटलॉग में जोड़ने से पहले सुझावों की समीक्षा की जाएगी।',
    catalogSuggestionSkillCategoryLabel:'इस नए कौशल की श्रेणी',
    skillCategoryOther:'अन्य (बिना श्रेणी वाले कौशल)',
    catalogSuggestionCategoryNameLabel:'नई श्रेणी का नाम',
    catalogSuggestChooseCategory:'श्रेणी चुनें',
    catalogSuggestionSkillRequired:'कौशल जोड़ने के लिए मुख्य कौशल दर्ज करें।',
    catalogSuggestionCategoryRequired:'नई श्रेणी का नाम दर्ज करें।',
    consentStart:'मैं पुष्टि करता/करती हूँ कि मेरी आयु 18 वर्ष या अधिक है और मैं सहमत हूँ:',
    terms:'सेवा की शर्तें', and:'और', privacy:'गोपनीयता नीति',
    footer:'अपना पासवर्ड या सत्यापन कोड कभी साझा न करें।',
    forgotPassword:'पासवर्ड भूल गए?', alreadyAccount:'पहले से खाता है?',
    logIn:'लॉग इन', help:'सहायता',
    categoryHome:'घरेलू सेवाएँ और मरम्मत', categoryConstruction:'निर्माण और कुशल कारीगरी',
    categoryCleaning:'सफाई और घर की देखभाल', categoryGardening:'बागवानी और लैंडस्केपिंग',
    categoryBeauty:'सौंदर्य, बाल और स्वास्थ्य', categoryHealth:'स्वास्थ्य सेवा और देखभाल',
    categoryChildcare:'बच्चों की देखभाल और बेबीसिटिंग', categoryFood:'खाना बनाना, कैटरिंग और भोजन',
    categoryAuto:'ऑटोमोबाइल और मैकेनिक', categoryDriving:'ड्राइविंग और डिलीवरी',
    categoryMoving:'सामान ले जाना और लॉजिस्टिक्स', categoryIT:'आईटी, सॉफ्टवेयर और तकनीकी सहायता',
    categoryWeb:'वेब और ऐप विकास', categoryDesign:'ग्राफ़िक, वेब और उत्पाद डिज़ाइन',
    categoryWriting:'लेखन, संपादन और अनुवाद', categoryMarketing:'मार्केटिंग, बिक्री और सोशल मीडिया',
    categoryPhoto:'फ़ोटोग्राफ़ी और वीडियो', categoryBusiness:'व्यवसाय, वित्त और परामर्श',
    categoryAdmin:'प्रशासनिक और वर्चुअल सहायता', categoryEducation:'शिक्षा, ट्यूशन और भाषाएँ',
    categoryEvents:'कार्यक्रम, आतिथ्य और मनोरंजन', categoryLegal:'कानूनी और पेशेवर सेवाएँ',
    categoryPets:'पालतू जानवरों की देखभाल', categoryManufacturing:'निर्माण और उत्पादन',
    categorySecurity:'सुरक्षा और सेफ़्टी', categoryRealEstate:'रियल एस्टेट और संपत्ति सेवाएँ',
    categoryPersonal:'व्यक्तिगत और जीवनशैली सेवाएँ', categoryOther:'अन्य',
    ageError:'खाता बनाने के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए।',
    enterEmail:'पहले अपना ईमेल पता दर्ज करें।',
    resetSent:'यदि इस ईमेल से खाता मौजूद है, तो पासवर्ड रीसेट निर्देश भेजे जाएँगे।',
    signupSuccess:'खाता बन गया। ईमेल से पुष्टि करें, फिर लॉग इन करें।',
    accessError:'खाते तक पहुँचा नहीं जा सका। कृपया फिर कोशिश करें।',
    resetError:'पासवर्ड रीसेट निर्देश भेजे नहीं जा सके।'
  },
  gu: {
    languageSelectLabel:'ભાષા પસંદ કરો', accountAccess:'ખાતામાં પ્રવેશ',
    callingCode:'દેશનો ફોન કોડ', legalNavigation:'મદદ અને કાનૂની માહિતી',
    headerNote:'સમય, કૌશલ્ય અને તકોનું બજાર', kicker:'સમય, કૌશલ્ય અને તક',
    stateProvince:'રાજ્ય / પ્રાંત', statePlaceholder:'તમારું રાજ્ય અથવા પ્રાંત દાખલ કરો',
    headline:'દરેક જરૂરિયાત માટે એક ખાતું.',
    intro:'એક જ T2I ખાતાથી દુનિયામાં ક્યાંય કુશળ લોકોને કામે રાખો અથવા તમારી સેવાઓ આપો.',
    benefitWork:'કામ શોધો અને આવક મેળવો', benefitHire:'કામ પોસ્ટ કરો અને પ્રતિભાને કામે રાખો',
    benefitGlobal:'વૈશ્વિક તકો સાથે જોડાઓ', benefitProfile:'તમારી પ્રોફાઇલ અને પોર્ટફોલિયો બનાવો',
    signIn:'સાઇન ઇન', createAccount:'ખાતું બનાવો',
    signInTitle:'ફરી સ્વાગત છે', signUpTitle:'તમારું T2I ખાતું બનાવો',
    signInDescription:'માર્કેટપ્લેસ ચાલુ રાખવા સાઇન ઇન કરો.',
    signUpDescription:'દુનિયામાં ક્યાંય પણ કામ આપવા અને કૌશલ્ય આપવા માટે એક ખાતું.',
    fullName:'પૂરું નામ', namePlaceholder:'તમારું પૂરું નામ દાખલ કરો',
    gender:'લિંગ', selectGender:'તમારું લિંગ પસંદ કરો', female:'સ્ત્રી', male:'પુરુષ',
    nonBinary:'નોન-બાઇનરી', selfDescribe:'જાતે જણાવો', preferNot:'જણાવવાનું પસંદ નથી',
    birthDate:'જન્મ તારીખ', country:'દેશ', city:'શહેર', cityPlaceholder:'તમારું શહેર દાખલ કરો',
    mobile:'મોબાઇલ નંબર', mobilePlaceholder:'તમારો મોબાઇલ નંબર દાખલ કરો',
    email:'ઇમેઇલ સરનામું', emailPlaceholder:'તમારું ઇમેઇલ દાખલ કરો',
    password:'પાસવર્ડ', passwordPlaceholder:'મજબૂત પાસવર્ડ બનાવો',
    passwordHint:'અક્ષરો, અંકો અને પ્રતીક સાથે ઓછામાં ઓછા 8 અક્ષરો વાપરો.',
    preferredCurrency:'પસંદગીનું ચલણ',
    currencyHint:'તમારા દેશના આધારે સૂચવાયું છે. તમે આ પછી ખાતામાં બદલી શકો છો.',
    confirmPassword:'પાસવર્ડની પુષ્ટિ કરો', confirmPlaceholder:'પાસવર્ડ ફરી દાખલ કરો',
    passwordsMatch:'પાસવર્ડ મેળ ખાય છે.', passwordsMismatch:'પાસવર્ડ મેળ ખાતા નથી.',
    categoryChoose:'કૌશલ્ય શ્રેણી પસંદ કરો',
    skillCategory:'કૌશલ્ય શ્રેણી', primarySkill:'મુખ્ય કૌશલ્ય', skillPlaceholder:'દા.ત. પ્લમ્બિંગ અથવા ડિઝાઇન',
    skillHint:'કુશળતા શોધવા લખો અથવા સૂચનોમાંથી પસંદ કરો.',
    catalogSuggestionOptionLabel:'કૌશલ્ય અથવા શ્રેણી સૂચવવી છે? (વૈકલ્પિક)',
    catalogSuggestionNone:'કોઈ સૂચન નહીં',
    catalogSuggestionSkill:'ઉપરનું મુખ્ય કૌશલ્ય સૂચવો',
    catalogSuggestionCategory:'નવી શ્રેણી સૂચવો',
    catalogSuggestionSignupHint:'કેટલોગમાં ઉમેરતાં પહેલાં સૂચનોની સમીક્ષા કરવામાં આવે છે.',
    catalogSuggestionSkillCategoryLabel:'આ નવા કૌશલ્યની શ્રેણી',
    skillCategoryOther:'અન્ય (વર્ગીકરણ વગરના કૌશલ્યો)',
    catalogSuggestionCategoryNameLabel:'નવી શ્રેણીનું નામ',
    catalogSuggestChooseCategory:'શ્રેણી પસંદ કરો',
    catalogSuggestionSkillRequired:'કૌશલ્ય ઉમેરવા મુખ્ય કૌશલ્ય દાખલ કરો.',
    catalogSuggestionCategoryRequired:'નવી શ્રેણીનું નામ દાખલ કરો.',
    consentStart:'હું પુષ્ટિ કરું છું કે મારી ઉંમર 18 વર્ષ કે તેથી વધુ છે અને હું સંમત છું:',
    terms:'સેવાની શરતો', and:'અને', privacy:'ગોપનીયતા નીતિ',
    footer:'તમારો પાસવર્ડ અથવા ચકાસણી કોડ ક્યારેય શેર કરશો નહીં.',
    forgotPassword:'પાસવર્ડ ભૂલી ગયા?', alreadyAccount:'પહેલેથી ખાતું છે?',
    logIn:'લૉગ ઇન', help:'મદદ',
    categoryHome:'ઘર સેવાઓ અને સમારકામ', categoryConstruction:'બાંધકામ અને કુશળ કારીગરી',
    categoryCleaning:'સફાઈ અને ઘરકામ', categoryGardening:'બાગકામ અને લેન્ડસ્કેપિંગ',
    categoryBeauty:'સૌંદર્ય, વાળ અને સુખાકારી', categoryHealth:'આરોગ્ય સંભાળ અને દેખભાળ',
    categoryChildcare:'બાળ સંભાળ અને બેબીસિટિંગ', categoryFood:'રસોઈ, કેટરિંગ અને ખોરાક',
    categoryAuto:'ઓટોમોટિવ અને મિકેનિક', categoryDriving:'ડ્રાઇવિંગ અને ડિલિવરી',
    categoryMoving:'સ્થળાંતર અને લોજિસ્ટિક્સ', categoryIT:'આઇટી, સોફ્ટવેર અને ટેક સહાય',
    categoryWeb:'વેબ અને એપ્લિકેશન વિકાસ', categoryDesign:'ગ્રાફિક, વેબ અને પ્રોડક્ટ ડિઝાઇન',
    categoryWriting:'લેખન, સંપાદન અને અનુવાદ', categoryMarketing:'માર્કેટિંગ, વેચાણ અને સોશિયલ મીડિયા',
    categoryPhoto:'ફોટોગ્રાફી અને વિડિયો', categoryBusiness:'વ્યવસાય, નાણાં અને સલાહકાર સેવા',
    categoryAdmin:'વહીવટી અને વર્ચ્યુઅલ સહાય', categoryEducation:'શિક્ષણ, ટ્યુશન અને ભાષાઓ',
    categoryEvents:'ઇવેન્ટ, આતિથ્ય અને મનોરંજન', categoryLegal:'કાનૂની અને વ્યાવસાયિક સેવાઓ',
    categoryPets:'પાળતુ પ્રાણીઓની સંભાળ', categoryManufacturing:'ઉત્પાદન અને મેન્યુફેક્ચરિંગ',
    categorySecurity:'સુરક્ષા અને સલામતી', categoryRealEstate:'રિયલ એસ્ટેટ અને મિલકત સેવાઓ',
    categoryPersonal:'વ્યક્તિગત અને જીવનશૈલી સેવાઓ', categoryOther:'અન્ય',
    ageError:'ખાતું બનાવવા માટે તમારી ઉંમર ઓછામાં ઓછી 18 વર્ષની હોવી જોઈએ.',
    enterEmail:'પહેલાં તમારું ઇમેઇલ દાખલ કરો.',
    resetSent:'આ સરનામે ખાતું હશે તો પાસવર્ડ રીસેટ સૂચનાઓ મોકલવામાં આવશે.',
    signupSuccess:'ખાતું બન્યું. ઇમેઇલથી પુષ્ટિ કરો, પછી સાઇન ઇન કરો.',
    accessError:'ખાતામાં પ્રવેશ થઈ શક્યો નથી. ફરી પ્રયાસ કરો.',
    resetError:'પાસવર્ડ રીસેટ સૂચનાઓ મોકલી શકાઈ નથી.'
  },
  bn: {
    stateProvince:'রাজ্য / প্রদেশ', statePlaceholder:'আপনার রাজ্য বা প্রদেশ লিখুন',
    headline:'সবকিছুর জন্য একটি অ্যাকাউন্ট।',
    intro:'একটি T2I অ্যাকাউন্ট দিয়ে বিশ্বের যেকোনো স্থানে দক্ষ মানুষকে নিয়োগ করুন বা নিজের দক্ষতা দিয়ে কাজ করুন।',
    benefitWork:'কাজ খুঁজুন ও আয় করুন', benefitHire:'কাজ পোস্ট করুন ও দক্ষ কর্মী নিয়োগ করুন',
    benefitGlobal:'বিশ্বব্যাপী সুযোগের সঙ্গে যুক্ত হন', benefitProfile:'নিজের প্রোফাইল ও পোর্টফোলিও তৈরি করুন',
    signInTitle:'আবার স্বাগতম', signUpTitle:'আপনার T2I অ্যাকাউন্ট তৈরি করুন',
    signInDescription:'মার্কেটপ্লেসে যেতে সাইন ইন করুন।',
    signUpDescription:'বিশ্বের যেকোনো স্থানে কাজ দেওয়া ও দক্ষতা দেওয়ার জন্য একটি অ্যাকাউন্ট।',
    passwordHint:'অক্ষর, সংখ্যা ও প্রতীক মিলিয়ে অন্তত ৮টি অক্ষর ব্যবহার করুন।',
    confirmPassword:'পাসওয়ার্ড নিশ্চিত করুন', footer:'আপনার পাসওয়ার্ড বা যাচাইকরণ কোড কাউকে দেবেন না।'
  },
  mr: {
    stateProvince:'राज्य / प्रांत', statePlaceholder:'तुमचे राज्य किंवा प्रांत लिहा',
    headline:'सर्व गोष्टींसाठी एक खाते.',
    intro:'एकाच T2I खात्याने जगात कुठेही कुशल लोकांना कामावर घ्या किंवा तुमची कौशल्ये द्या.',
    benefitWork:'काम शोधा आणि कमाई करा', benefitHire:'काम पोस्ट करा आणि कुशल लोकांना नियुक्त करा',
    benefitGlobal:'जागतिक संधींशी जोडा', benefitProfile:'तुमची प्रोफाइल आणि पोर्टफोलिओ तयार करा',
    signInTitle:'पुन्हा स्वागत आहे', signUpTitle:'तुमचे T2I खाते तयार करा',
    signInDescription:'मार्केटप्लेस सुरू ठेवण्यासाठी लॉग इन करा.',
    signUpDescription:'जगात कुठेही काम देण्यासाठी आणि कौशल्ये देण्यासाठी एक खाते.',
    passwordHint:'अक्षरे, अंक आणि चिन्ह यांसह किमान ८ अक्षरे वापरा.',
    confirmPassword:'पासवर्डची पुष्टी करा', footer:'तुमचा पासवर्ड किंवा पडताळणी कोड कधीही शेअर करू नका.'
  },
  ta: {
    stateProvince:'மாநிலம் / மாகாணம்', statePlaceholder:'உங்கள் மாநிலம் அல்லது மாகாணத்தை உள்ளிடவும்',
    headline:'அனைத்திற்கும் ஒரே கணக்கு.',
    intro:'ஒரே T2I கணக்கில் உலகின் எங்கிருந்தும் திறமையானவர்களை பணியமர்த்துங்கள் அல்லது உங்கள் திறன்களை வழங்குங்கள்.',
    benefitWork:'வேலை தேடி வருமானம் ஈட்டுங்கள்', benefitHire:'வேலைகளைப் பதிவிட்டு திறமையாளர்களை நியமியுங்கள்',
    benefitGlobal:'உலகளாவிய வாய்ப்புகளுடன் இணையுங்கள்', benefitProfile:'உங்கள் சுயவிவரத்தையும் பணித்தொகுப்பையும் உருவாக்குங்கள்',
    signInTitle:'மீண்டும் வருக', signUpTitle:'உங்கள் T2I கணக்கை உருவாக்கவும்',
    signInDescription:'சந்தையைத் தொடர உள்நுழையவும்.',
    signUpDescription:'உலகில் எங்கும் வேலை வழங்கவும் திறன்களை வழங்கவும் ஒரே கணக்கு.',
    passwordHint:'எழுத்துகள், எண்கள் மற்றும் குறியீடு சேர்த்து குறைந்தது 8 எழுத்துகள் பயன்படுத்தவும்.',
    confirmPassword:'கடவுச்சொல்லை உறுதிப்படுத்தவும்', footer:'உங்கள் கடவுச்சொல் அல்லது சரிபார்ப்புக் குறியீட்டை பகிர வேண்டாம்.'
  },
  te: {
    stateProvince:'రాష్ట్రం / ప్రావిన్స్', statePlaceholder:'మీ రాష్ట్రం లేదా ప్రావిన్స్ నమోదు చేయండి',
    headline:'అన్నింటికీ ఒకే ఖాతా.',
    intro:'ఒకే T2I ఖాతాతో ప్రపంచంలో ఎక్కడైనా నైపుణ్యం కలిగిన వారిని నియమించండి లేదా మీ సేవలను అందించండి.',
    benefitWork:'పని కనుగొని ఆదాయం పొందండి', benefitHire:'పనులను పోస్ట్ చేసి ప్రతిభావంతులను నియమించండి',
    benefitGlobal:'ప్రపంచ అవకాశాలతో అనుసంధానమవ్వండి', benefitProfile:'మీ ప్రొఫైల్, పోర్ట్‌ఫోలియోను నిర్మించండి',
    signInTitle:'తిరిగి స్వాగతం', signUpTitle:'మీ T2I ఖాతాను సృష్టించండి',
    signInDescription:'మార్కెట్‌ప్లేస్‌ను కొనసాగించడానికి సైన్ ఇన్ చేయండి.',
    signUpDescription:'ప్రపంచంలో ఎక్కడైనా పనిని ఇవ్వడానికి, నైపుణ్యాలను అందించడానికి ఒకే ఖాతా.',
    passwordHint:'అక్షరాలు, సంఖ్యలు, చిహ్నం కలిపి కనీసం 8 అక్షరాలు వాడండి.',
    confirmPassword:'పాస్‌వర్డ్‌ను నిర్ధారించండి', footer:'మీ పాస్‌వర్డ్ లేదా ధృవీకరణ కోడ్‌ను ఎప్పుడూ పంచుకోవద్దు.'
  },
  ar: {
    stateProvince:'الولاية / المقاطعة', statePlaceholder:'أدخل الولاية أو المقاطعة',
    headline:'حساب واحد لكل شيء.',
    intro:'وظّف أشخاصًا مهرة أو اعرض مهاراتك في أي مكان في العالم باستخدام حساب T2I واحد.',
    benefitWork:'اعثر على عمل واكسب دخلاً', benefitHire:'انشر المهام واستعن بالمواهب',
    benefitGlobal:'تواصل مع فرص عالمية', benefitProfile:'أنشئ ملفك الشخصي وأعمالك',
    signInTitle:'مرحبًا بعودتك', signUpTitle:'أنشئ حساب T2I',
    signInDescription:'سجّل الدخول للمتابعة إلى السوق.',
    signUpDescription:'حساب واحد لتوظيف الآخرين أو تقديم مهاراتك في أي مكان.',
    passwordHint:'استخدم 8 أحرف على الأقل تشمل حروفًا وأرقامًا ورمزًا.',
    confirmPassword:'تأكيد كلمة المرور', footer:'لا تشارك كلمة المرور أو رموز التحقق مع أي شخص.'
  },
  es: {
    stateProvince:'Estado / Provincia', statePlaceholder:'Escribe tu estado o provincia',
    headline:'Una cuenta para todo.',
    intro:'Contrata personas cualificadas u ofrece tus habilidades en cualquier lugar del mundo con una sola cuenta T2I.',
    benefitWork:'Encuentra trabajo y gana ingresos', benefitHire:'Publica tareas y contrata talento',
    benefitGlobal:'Conecta con oportunidades globales', benefitProfile:'Crea tu perfil y portafolio',
    signInTitle:'Te damos la bienvenida', signUpTitle:'Crea tu cuenta T2I',
    signInDescription:'Inicia sesión para continuar en el mercado.',
    signUpDescription:'Una cuenta para contratar o ofrecer habilidades en cualquier lugar del mundo.',
    passwordHint:'Usa al menos 8 caracteres con letras, números y un símbolo.',
    confirmPassword:'Confirmar contraseña', footer:'Nunca compartas tu contraseña ni códigos de verificación.'
  },
  fr: {
    stateProvince:'État / Province', statePlaceholder:'Saisissez votre état ou province',
    headline:'Un compte pour tout.',
    intro:'Recrutez des personnes qualifiées ou proposez vos compétences partout dans le monde avec un seul compte T2I.',
    benefitWork:'Trouvez du travail et gagnez un revenu', benefitHire:'Publiez des missions et recrutez des talents',
    benefitGlobal:'Accédez aux opportunités mondiales', benefitProfile:'Créez votre profil et votre portfolio',
    signInTitle:'Ravi de vous revoir', signUpTitle:'Créez votre compte T2I',
    signInDescription:'Connectez-vous pour accéder à la marketplace.',
    signUpDescription:'Un compte pour recruter ou proposer vos compétences partout dans le monde.',
    passwordHint:'Utilisez au moins 8 caractères avec lettres, chiffres et un symbole.',
    confirmPassword:'Confirmer le mot de passe', footer:'Ne partagez jamais votre mot de passe ni vos codes de vérification.'
  },
  de: {
    stateProvince:'Bundesland / Provinz', statePlaceholder:'Bundesland oder Provinz eingeben',
    headline:'Ein Konto für alles.',
    intro:'Beauftrage Fachkräfte oder biete deine Fähigkeiten überall auf der Welt mit einem T2I-Konto an.',
    benefitWork:'Finde Arbeit und verdiene Geld', benefitHire:'Veröffentliche Aufgaben und finde Talente',
    benefitGlobal:'Entdecke weltweite Möglichkeiten', benefitProfile:'Erstelle dein Profil und Portfolio',
    signInTitle:'Willkommen zurück', signUpTitle:'Erstelle dein T2I-Konto',
    signInDescription:'Melde dich an, um fortzufahren.',
    signUpDescription:'Ein Konto, um weltweit Aufgaben zu vergeben oder Fähigkeiten anzubieten.',
    passwordHint:'Mindestens 8 Zeichen mit Buchstaben, Zahlen und einem Symbol verwenden.',
    confirmPassword:'Passwort bestätigen', footer:'Teile niemals dein Passwort oder deine Bestätigungscodes.'
  },
  pt: {
    stateProvince:'Estado / Província', statePlaceholder:'Digite seu estado ou província',
    headline:'Uma conta para tudo.',
    intro:'Contrate pessoas qualificadas ou ofereça suas habilidades em qualquer lugar do mundo com uma conta T2I.',
    benefitWork:'Encontre trabalho e ganhe renda', benefitHire:'Publique tarefas e contrate talentos',
    benefitGlobal:'Conecte-se a oportunidades globais', benefitProfile:'Crie seu perfil e portfólio',
    signInTitle:'Bem-vindo de volta', signUpTitle:'Crie sua conta T2I',
    signInDescription:'Entre para continuar no marketplace.',
    signUpDescription:'Uma conta para contratar ou oferecer habilidades em qualquer lugar do mundo.',
    passwordHint:'Use pelo menos 8 caracteres com letras, números e um símbolo.',
    confirmPassword:'Confirmar senha', footer:'Nunca compartilhe sua senha ou códigos de verificação.'
  },
  ar: {
    languageSelectLabel:'اختر اللغة', accountAccess:'الوصول إلى الحساب', callingCode:'رمز الاتصال الدولي', legalNavigation:'المساعدة والمعلومات القانونية',
    headerNote:'سوق للوقت والمهارات والفرص', kicker:'الوقت والمهارات والفرص', headline:'حساب واحد لكل شيء.',
    intro:'وظّف أشخاصًا مهرة أو اعرض مهاراتك في أي مكان في العالم باستخدام حساب T2I واحد.',
    benefitWork:'اعثر على عمل واكسب دخلاً', benefitHire:'انشر المهام واستعن بالمواهب', benefitGlobal:'تواصل مع فرص عالمية', benefitProfile:'أنشئ ملفك الشخصي وأعمالك',
    signIn:'تسجيل الدخول', createAccount:'إنشاء حساب', signInTitle:'مرحبًا بعودتك', signUpTitle:'أنشئ حساب T2I',
    signInDescription:'سجّل الدخول للمتابعة إلى السوق.', signUpDescription:'حساب واحد لتوظيف الآخرين أو تقديم مهاراتك في أي مكان.',
    fullName:'الاسم الكامل', namePlaceholder:'أدخل اسمك الكامل', gender:'الجنس', selectGender:'اختر الجنس',
    female:'أنثى', male:'ذكر', nonBinary:'غير ثنائي', selfDescribe:'اذكر بنفسك', preferNot:'أفضل عدم الإجابة',
    birthDate:'تاريخ الميلاد', country:'الدولة', stateProvince:'الولاية / المقاطعة', statePlaceholder:'أدخل الولاية أو المقاطعة',
    city:'المدينة', cityPlaceholder:'أدخل مدينتك', mobile:'رقم الهاتف المحمول', mobilePlaceholder:'أدخل رقم هاتفك المحمول',
    email:'البريد الإلكتروني', emailPlaceholder:'أدخل بريدك الإلكتروني', password:'كلمة المرور', passwordPlaceholder:'أنشئ كلمة مرور قوية',
    passwordHint:'استخدم 8 أحرف على الأقل تشمل حروفًا وأرقامًا ورمزًا.', confirmPassword:'تأكيد كلمة المرور', confirmPlaceholder:'أعد إدخال كلمة المرور',
    passwordsMatch:'كلمتا المرور متطابقتان.', passwordsMismatch:'كلمتا المرور غير متطابقتين.',
    skillCategory:'فئة المهارة', primarySkill:'المهارة الرئيسية', skillPlaceholder:'مثال: السباكة أو التصميم',
    consentStart:'أؤكد أن عمري 18 عامًا أو أكثر وأوافق على', terms:'شروط الخدمة', and:'و', privacy:'سياسة الخصوصية',
    footer:'لا تشارك كلمة المرور أو رموز التحقق مع أي شخص.', forgotPassword:'هل نسيت كلمة المرور؟',
    alreadyAccount:'لديك حساب بالفعل؟', logIn:'تسجيل الدخول', help:'المساعدة',
    categoryHome:'الخدمات المنزلية والإصلاحات', categoryConstruction:'البناء والمهن الحرفية', categoryCleaning:'التنظيف والعناية بالمنزل',
    categoryGardening:'البستنة وتنسيق الحدائق', categoryBeauty:'التجميل والشعر والعافية', categoryHealth:'الرعاية الصحية ورعاية الآخرين',
    categoryChildcare:'رعاية الأطفال ومجالسة الأطفال', categoryFood:'الطبخ والتموين والطعام', categoryAuto:'السيارات والميكانيكا',
    categoryDriving:'القيادة والتوصيل', categoryMoving:'النقل والخدمات اللوجستية', categoryIT:'تقنية المعلومات والبرمجيات والدعم التقني',
    categoryWeb:'تطوير المواقع والتطبيقات', categoryDesign:'التصميم الجرافيكي وتصميم الويب والمنتجات', categoryWriting:'الكتابة والتحرير والترجمة',
    categoryMarketing:'التسويق والمبيعات ووسائل التواصل', categoryPhoto:'التصوير والفيديو', categoryBusiness:'الأعمال والتمويل والاستشارات',
    categoryAdmin:'الإدارة والمساعدة الافتراضية', categoryEducation:'التعليم والدروس واللغات', categoryEvents:'الفعاليات والضيافة والترفيه',
    categoryLegal:'الخدمات القانونية والمهنية', categoryPets:'رعاية الحيوانات الأليفة', categoryManufacturing:'التصنيع والإنتاج',
    categorySecurity:'الأمن والسلامة', categoryRealEstate:'العقارات وخدمات الممتلكات', categoryPersonal:'الخدمات الشخصية وأسلوب الحياة', categoryOther:'أخرى',
    ageError:'يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب.', enterEmail:'أدخل بريدك الإلكتروني أولاً.',
    resetSent:'إذا كان هناك حساب لهذا العنوان، فستُرسل تعليمات إعادة تعيين كلمة المرور.',
    signupSuccess:'تم إنشاء الحساب. أكّد بريدك الإلكتروني ثم سجّل الدخول.',
    accessError:'تعذر الوصول إلى حسابك. حاول مرة أخرى.', resetError:'تعذر إرسال تعليمات إعادة تعيين كلمة المرور.'
  },
  'zh-Hans': {
    languageSelectLabel:'选择语言', accountAccess:'账户登录', callingCode:'国家/地区电话区号', legalNavigation:'帮助与法律信息',
    headerNote:'时间、技能与机会的市场', kicker:'时间、技能与机会', headline:'一个账户，满足所有需求。',
    intro:'使用一个 T2I 账户，随时随地聘请专业人才或提供您的技能服务。',
    benefitWork:'寻找工作并获得收入', benefitHire:'发布任务并聘请人才', benefitGlobal:'连接全球机会', benefitProfile:'建立个人资料和作品集',
    signIn:'登录', createAccount:'创建账户', signInTitle:'欢迎回来', signUpTitle:'创建您的 T2I 账户',
    signInDescription:'登录以继续使用平台。', signUpDescription:'一个账户，助您在世界各地聘请人才或提供技能。',
    fullName:'姓名', namePlaceholder:'请输入您的姓名', gender:'性别', selectGender:'请选择性别',
    female:'女性', male:'男性', nonBinary:'非二元性别', selfDescribe:'自行填写', preferNot:'不愿透露',
    birthDate:'出生日期', country:'国家/地区', stateProvince:'州 / 省', statePlaceholder:'请输入州或省',
    city:'城市', cityPlaceholder:'请输入城市', mobile:'手机号码', mobilePlaceholder:'请输入手机号码',
    email:'电子邮箱', emailPlaceholder:'请输入电子邮箱', password:'密码', passwordPlaceholder:'创建安全密码',
    passwordHint:'请使用至少 8 个字符，并包含字母、数字和符号。', confirmPassword:'确认密码', confirmPlaceholder:'再次输入密码',
    passwordsMatch:'两次密码一致。', passwordsMismatch:'两次密码不一致。',
    skillCategory:'技能类别', primarySkill:'主要技能', skillPlaceholder:'例如：管道维修或设计',
    consentStart:'我确认自己年满 18 岁，并同意', terms:'服务条款', and:'和', privacy:'隐私政策',
    footer:'请勿与他人分享密码或验证码。', forgotPassword:'忘记密码？', alreadyAccount:'已有账户？',
    logIn:'登录', help:'帮助',
    categoryHome:'家庭服务与维修', categoryConstruction:'建筑与专业技工', categoryCleaning:'清洁与家政',
    categoryGardening:'园艺与景观美化', categoryBeauty:'美容、美发与健康', categoryHealth:'医疗护理与照护',
    categoryChildcare:'儿童照护与临时看护', categoryFood:'烹饪、餐饮与食品', categoryAuto:'汽车与机械维修',
    categoryDriving:'驾驶与配送', categoryMoving:'搬家与物流', categoryIT:'IT、软件与技术支持',
    categoryWeb:'网站与应用开发', categoryDesign:'平面、网页与产品设计', categoryWriting:'写作、编辑与翻译',
    categoryMarketing:'营销、销售与社交媒体', categoryPhoto:'摄影与视频', categoryBusiness:'商业、金融与咨询',
    categoryAdmin:'行政与虚拟助理', categoryEducation:'教育、辅导与语言', categoryEvents:'活动、酒店与娱乐',
    categoryLegal:'法律与专业服务', categoryPets:'宠物照护', categoryManufacturing:'制造与生产',
    categorySecurity:'安保与安全', categoryRealEstate:'房地产与物业服务', categoryPersonal:'个人与生活服务', categoryOther:'其他',
    ageError:'您必须年满 18 岁才能创建账户。', enterEmail:'请先输入电子邮箱。',
    resetSent:'如果该邮箱对应账户，系统将发送密码重置说明。',
    signupSuccess:'账户已创建。请先验证邮箱，然后登录。', accessError:'无法访问账户，请重试。',
    resetError:'无法发送密码重置说明。'
  },
  'zh-Hant': {
    languageSelectLabel:'選擇語言', accountAccess:'帳戶登入', callingCode:'國家/地區電話區碼', legalNavigation:'協助與法律資訊',
    headerNote:'時間、技能與機會的市場', kicker:'時間、技能與機會', headline:'一個帳戶，滿足所有需求。',
    intro:'使用一個 T2I 帳戶，隨時隨地聘請專業人才或提供你的技能服務。',
    benefitWork:'尋找工作並獲得收入', benefitHire:'發布任務並聘請人才', benefitGlobal:'連結全球機會', benefitProfile:'建立個人資料和作品集',
    signIn:'登入', createAccount:'建立帳戶', signInTitle:'歡迎回來', signUpTitle:'建立你的 T2I 帳戶',
    signInDescription:'登入以繼續使用平台。', signUpDescription:'一個帳戶，助你在世界各地聘請人才或提供技能。',
    fullName:'姓名', namePlaceholder:'請輸入你的姓名', gender:'性別', selectGender:'請選擇性別',
    female:'女性', male:'男性', nonBinary:'非二元性別', selfDescribe:'自行填寫', preferNot:'不願透露',
    birthDate:'出生日期', country:'國家/地區', stateProvince:'州 / 省', statePlaceholder:'請輸入州或省',
    city:'城市', cityPlaceholder:'請輸入城市', mobile:'手機號碼', mobilePlaceholder:'請輸入手機號碼',
    email:'電子郵件', emailPlaceholder:'請輸入電子郵件', password:'密碼', passwordPlaceholder:'建立安全密碼',
    passwordHint:'請使用至少 8 個字元，並包含字母、數字和符號。', confirmPassword:'確認密碼', confirmPlaceholder:'再次輸入密碼',
    passwordsMatch:'兩次密碼相符。', passwordsMismatch:'兩次密碼不相符。',
    skillCategory:'技能類別', primarySkill:'主要技能', skillPlaceholder:'例如：水管維修或設計',
    consentStart:'我確認自己年滿 18 歲，並同意', terms:'服務條款', and:'和', privacy:'隱私權政策',
    footer:'請勿與他人分享密碼或驗證碼。', forgotPassword:'忘記密碼？', alreadyAccount:'已有帳戶？',
    logIn:'登入', help:'協助',
    categoryHome:'居家服務與維修', categoryConstruction:'建築與專業技工', categoryCleaning:'清潔與家事服務',
    categoryGardening:'園藝與景觀美化', categoryBeauty:'美容、美髮與健康', categoryHealth:'醫療照護與看護',
    categoryChildcare:'兒童照護與臨時托育', categoryFood:'烹飪、餐飲與食品', categoryAuto:'汽車與機械維修',
    categoryDriving:'駕駛與配送', categoryMoving:'搬家與物流', categoryIT:'資訊科技、軟體與技術支援',
    categoryWeb:'網站與應用程式開發', categoryDesign:'平面、網頁與產品設計', categoryWriting:'寫作、編輯與翻譯',
    categoryMarketing:'行銷、銷售與社群媒體', categoryPhoto:'攝影與影片', categoryBusiness:'商業、金融與顧問服務',
    categoryAdmin:'行政與虛擬助理', categoryEducation:'教育、家教與語言', categoryEvents:'活動、旅宿與娛樂',
    categoryLegal:'法律與專業服務', categoryPets:'寵物照護', categoryManufacturing:'製造與生產',
    categorySecurity:'保全與安全', categoryRealEstate:'房地產與物業服務', categoryPersonal:'個人與生活服務', categoryOther:'其他',
    ageError:'你必須年滿 18 歲才能建立帳戶。', enterEmail:'請先輸入電子郵件。',
    resetSent:'如果該電子郵件有對應帳戶，系統將寄送密碼重設說明。',
    signupSuccess:'帳戶已建立。請先驗證電子郵件，然後登入。', accessError:'無法存取帳戶，請再試一次。',
    resetError:'無法寄送密碼重設說明。'
  },
  ja: {
    languageSelectLabel:'言語を選択', accountAccess:'アカウントアクセス', callingCode:'国番号', legalNavigation:'ヘルプと法的情報',
    headerNote:'時間・スキル・機会のマーケットプレイス', kicker:'時間・スキル・機会', headline:'すべてに使えるひとつのアカウント。',
    intro:'ひとつのT2Iアカウントで、世界中の人材を雇ったり、自分のスキルを提供したりできます。',
    benefitWork:'仕事を見つけて収入を得る', benefitHire:'仕事を掲載して人材を採用する', benefitGlobal:'世界中の機会につながる', benefitProfile:'プロフィールとポートフォリオを作成する',
    signIn:'サインイン', createAccount:'アカウントを作成', signInTitle:'おかえりなさい', signUpTitle:'T2Iアカウントを作成',
    signInDescription:'サインインしてマーケットプレイスを続けます。', signUpDescription:'世界中で人材を雇ったり、スキルを提供したりできるアカウントです。',
    fullName:'氏名', namePlaceholder:'氏名を入力', gender:'性別', selectGender:'性別を選択',
    female:'女性', male:'男性', nonBinary:'ノンバイナリー', selfDescribe:'自由記入', preferNot:'回答しない',
    birthDate:'生年月日', country:'国', stateProvince:'都道府県 / 州', statePlaceholder:'都道府県または州を入力',
    city:'市区町村', cityPlaceholder:'市区町村を入力', mobile:'携帯電話番号', mobilePlaceholder:'携帯電話番号を入力',
    email:'メールアドレス', emailPlaceholder:'メールアドレスを入力', password:'パスワード', passwordPlaceholder:'強力なパスワードを作成',
    passwordHint:'英字・数字・記号を含む8文字以上を使用してください。', confirmPassword:'パスワードを確認', confirmPlaceholder:'パスワードを再入力',
    passwordsMatch:'パスワードが一致しています。', passwordsMismatch:'パスワードが一致しません。',
    skillCategory:'スキルカテゴリー', primarySkill:'主なスキル', skillPlaceholder:'例：配管修理、デザイン',
    consentStart:'18歳以上であることを確認し、次に同意します：', terms:'利用規約', and:'および', privacy:'プライバシーポリシー',
    footer:'パスワードや認証コードを他人に共有しないでください。', forgotPassword:'パスワードをお忘れですか？',
    alreadyAccount:'すでにアカウントをお持ちですか？', logIn:'ログイン', help:'ヘルプ',
    categoryHome:'住宅サービス・修理', categoryConstruction:'建設・専門技能職', categoryCleaning:'清掃・家事代行',
    categoryGardening:'園芸・造園', categoryBeauty:'美容・ヘア・ウェルネス', categoryHealth:'医療・介護',
    categoryChildcare:'保育・ベビーシッター', categoryFood:'料理・ケータリング・食品', categoryAuto:'自動車・整備',
    categoryDriving:'運転・配達', categoryMoving:'引っ越し・物流', categoryIT:'IT・ソフトウェア・技術サポート',
    categoryWeb:'ウェブ・アプリ開発', categoryDesign:'グラフィック・ウェブ・製品デザイン', categoryWriting:'執筆・編集・翻訳',
    categoryMarketing:'マーケティング・営業・SNS', categoryPhoto:'写真・動画', categoryBusiness:'ビジネス・金融・コンサルティング',
    categoryAdmin:'事務・オンラインアシスタント', categoryEducation:'教育・家庭教師・語学', categoryEvents:'イベント・接客・エンターテインメント',
    categoryLegal:'法律・専門サービス', categoryPets:'ペットケア', categoryManufacturing:'製造・生産',
    categorySecurity:'警備・安全', categoryRealEstate:'不動産・物件サービス', categoryPersonal:'個人向け・ライフスタイルサービス', categoryOther:'その他',
    ageError:'アカウントを作成するには18歳以上である必要があります。', enterEmail:'先にメールアドレスを入力してください。',
    resetSent:'このメールアドレスにアカウントがある場合、パスワード再設定の案内を送信します。',
    signupSuccess:'アカウントを作成しました。メールを確認してからサインインしてください。',
    accessError:'アカウントにアクセスできません。もう一度お試しください。',
    resetError:'パスワード再設定の案内を送信できませんでした。'
  },
  ne: {
    languageSelectLabel:'भाषा छान्नुहोस्', accountAccess:'खाता पहुँच',
    callingCode:'देशको फोन कोड', legalNavigation:'सहायता र कानुनी जानकारी',
    headerNote:'समय, सीप र अवसरको बजार', kicker:'समय, सीप र अवसर',
    stateProvince:'प्रदेश / राज्य', statePlaceholder:'आफ्नो प्रदेश वा राज्य लेख्नुहोस्',
    headline:'सबैका लागि एउटै खाता।',
    intro:'एउटै T2I खाताबाट संसारको जुनसुकै ठाउँमा दक्ष मानिसलाई काममा लगाउनुहोस् वा आफ्नो सीप दिनुहोस्।',
    benefitWork:'काम खोज्नुहोस् र आम्दानी गर्नुहोस्',
    benefitHire:'काम पोस्ट गर्नुहोस् र दक्ष व्यक्तिलाई नियुक्त गर्नुहोस्',
    benefitGlobal:'विश्वव्यापी अवसरसँग जोडिनुहोस्',
    benefitProfile:'आफ्नो प्रोफाइल र पोर्टफोलियो बनाउनुहोस्',
    signIn:'साइन इन', createAccount:'खाता बनाउनुहोस्',
    signInTitle:'फेरि स्वागत छ', signUpTitle:'आफ्नो T2I खाता बनाउनुहोस्',
    signInDescription:'बजारमा जान साइन इन गर्नुहोस्।',
    signUpDescription:'संसारको जुनसुकै ठाउँमा काम दिन र आफ्नो सीप प्रस्ताव गर्न एउटै खाता।',
    fullName:'पूरा नाम', namePlaceholder:'आफ्नो पूरा नाम लेख्नुहोस्',
    gender:'लिङ्ग', selectGender:'आफ्नो लिङ्ग छान्नुहोस्',
    female:'महिला', male:'पुरुष', nonBinary:'गैर-द्विआधारी',
    selfDescribe:'आफैं वर्णन गर्नुहोस्', preferNot:'भन्न चाहन्नँ',
    birthDate:'जन्म मिति', country:'देश', city:'सहर',
    preferredCurrency:'रुचाइएको मुद्रा',
    currencyHint:'तपाईंको देशअनुसार सुझाव गरिएको। पछि खातामा परिवर्तन गर्न सक्नुहुन्छ।',
    cityPlaceholder:'आफ्नो सहर लेख्नुहोस्', mobile:'मोबाइल नम्बर',
    mobilePlaceholder:'आफ्नो मोबाइल नम्बर लेख्नुहोस्',
    email:'इमेल ठेगाना', emailPlaceholder:'आफ्नो इमेल ठेगाना लेख्नुहोस्',
    password:'पासवर्ड', passwordPlaceholder:'बलियो पासवर्ड बनाउनुहोस्',
    passwordHint:'अक्षर, अंक र चिन्हसहित कम्तीमा ८ वर्ण प्रयोग गर्नुहोस्।',
    confirmPassword:'पासवर्ड पुष्टि गर्नुहोस्',
    confirmPlaceholder:'पासवर्ड फेरि लेख्नुहोस्',
    passwordsMatch:'पासवर्ड मिल्यो।', passwordsMismatch:'पासवर्ड मिलेन।',
    skillCategory:'सीपको श्रेणी', primarySkill:'मुख्य सीप',
    skillPlaceholder:'जस्तै: प्लम्बिङ वा डिजाइन',
    consentStart:'म १८ वर्ष वा सोभन्दा माथिको हुँ र म सहमत छु:',
    terms:'सेवा सर्तहरू', and:'र', privacy:'गोपनीयता नीति',
    footer:'आफ्नो पासवर्ड वा प्रमाणीकरण कोड कसैलाई नदिनुहोस्।',
    forgotPassword:'पासवर्ड बिर्सनुभयो?', alreadyAccount:'पहिले नै खाता छ?',
    logIn:'लग इन', help:'सहायता',
    categoryHome:'घरायसी सेवा र मर्मत',
    categoryConstruction:'निर्माण र दक्ष काम',
    categoryCleaning:'सफाइ र घरको हेरचाह',
    categoryGardening:'बगैंचा र भू-दृश्य सजावट',
    categoryBeauty:'सौन्दर्य, कपाल र स्वास्थ्य',
    categoryHealth:'स्वास्थ्य सेवा र हेरचाह',
    categoryChildcare:'बाल हेरचाह र बेबीसिटिङ',
    categoryFood:'खाना पकाउने, क्याटरिङ र भोजन',
    categoryAuto:'सवारी साधन र मेकानिक',
    categoryDriving:'ड्राइभिङ र डेलिभरी',
    categoryMoving:'सामान सार्ने र ढुवानी',
    categoryIT:'आईटी, सफ्टवेयर र प्राविधिक सहयोग',
    categoryWeb:'वेब र एप विकास',
    categoryDesign:'ग्राफिक, वेब र उत्पादन डिजाइन',
    categoryWriting:'लेखन, सम्पादन र अनुवाद',
    categoryMarketing:'मार्केटिङ, बिक्री र सामाजिक सञ्जाल',
    categoryPhoto:'फोटोग्राफी र भिडियो',
    categoryBusiness:'व्यवसाय, वित्त र परामर्श',
    categoryAdmin:'प्रशासनिक र भर्चुअल सहयोग',
    categoryEducation:'शिक्षा, ट्युसन र भाषा',
    categoryEvents:'कार्यक्रम, आतिथ्य र मनोरञ्जन',
    categoryLegal:'कानुनी र व्यावसायिक सेवा',
    categoryPets:'घरपालुवा जनावरको हेरचाह',
    categoryManufacturing:'निर्माण र उत्पादन',
    categorySecurity:'सुरक्षा',
    categoryRealEstate:'घरजग्गा र सम्पत्ति सेवा',
    categoryPersonal:'व्यक्तिगत र जीवनशैली सेवा',
    categoryOther:'अन्य',
    ageError:'खाता बनाउन तपाईं कम्तीमा १८ वर्षको हुनुपर्छ।',
    enterEmail:'पहिले आफ्नो इमेल ठेगाना लेख्नुहोस्।',
    resetSent:'यो इमेलमा खाता भएमा पासवर्ड रिसेट गर्ने निर्देशन पठाइनेछ।',
    signupSuccess:'खाता बन्यो। इमेल पुष्टि गरेर साइन इन गर्नुहोस्।',
    accessError:'खाता खोल्न सकिएन। फेरि प्रयास गर्नुहोस्।',
    resetError:'पासवर्ड रिसेट निर्देशन पठाउन सकिएन।'
  },
  ha: {
    languageSelectLabel:'Zaɓi harshe', accountAccess:'Shiga asusu',
    callingCode:'Lambar kiran ƙasa', legalNavigation:'Taimako da bayanan doka',
    headerNote:'Kasuwar lokaci, ƙwarewa da dama', kicker:'LOKACI, ƘWAREWA DA DAMA',
    stateProvince:'Jiha / Lardi', statePlaceholder:'Shigar da jiharka ko lardinka',
    headline:'Asusu guda don komai.',
    intro:'Yi amfani da asusun T2I guda don ɗaukar ƙwararru aiki ko bayar da ƙwarewarka a ko’ina a duniya.',
    benefitWork:'Nemi aiki ka sami kuɗin shiga',
    benefitHire:'Sanya ayyuka ka ɗauki ƙwararru aiki',
    benefitGlobal:'Haɗu da damar aiki ta duniya',
    benefitProfile:'Gina bayanan martaba da kundin ayyukanka',
    signIn:'Shiga', createAccount:'Ƙirƙiri asusu',
    signInTitle:'Barka da dawowa', signUpTitle:'Ƙirƙiri asusun T2I',
    signInDescription:'Shiga don ci gaba zuwa kasuwarka.',
    signUpDescription:'Asusu guda don ɗaukar ma’aikata ko bayar da ƙwarewa a ko’ina a duniya.',
    fullName:'Cikakken suna', namePlaceholder:'Shigar da cikakken sunanka',
    gender:'Jinsi', selectGender:'Zaɓi jinsinka',
    female:'Mace', male:'Namiji', nonBinary:'Ba namiji ko mace kaɗai ba',
    selfDescribe:'Bayyana da kanka', preferNot:'Ba na son faɗa',
    birthDate:'Ranar haihuwa', country:'Ƙasa', city:'Birni',
    preferredCurrency:'Kuɗin da aka zaɓa',
    currencyHint:'An ba da shawara bisa ƙasarka. Za ka iya canza shi daga baya a asusunka.',
    cityPlaceholder:'Shigar da birninka', mobile:'Lambar waya',
    mobilePlaceholder:'Shigar da lambar wayarka',
    email:'Adireshin imel', emailPlaceholder:'Shigar da adireshin imel',
    password:'Kalmar sirri', passwordPlaceholder:'Ƙirƙiri kalmar sirri mai ƙarfi',
    passwordHint:'Yi amfani da aƙalla haruffa 8, tare da haruffa, lambobi da alama.',
    confirmPassword:'Tabbatar da kalmar sirri',
    confirmPlaceholder:'Sake shigar da kalmar sirri',
    passwordsMatch:'Kalmomin sirri sun dace.',
    passwordsMismatch:'Kalmomin sirri ba su dace ba.',
    skillCategory:'Rukuni na ƙwarewa', primarySkill:'Babbar ƙwarewa',
    skillPlaceholder:'Misali: aikin famfo ko zane',
    consentStart:'Na tabbatar ina da shekara 18 ko fiye kuma na amince da:',
    terms:'Sharuɗɗan sabis', and:'da', privacy:'Manufar sirri',
    footer:'Kada ka raba kalmar sirrinka ko lambar tabbatarwa da kowa.',
    forgotPassword:'Ka manta kalmar sirri?', alreadyAccount:'Kana da asusu tuni?',
    logIn:'Shiga', help:'Taimako',
    categoryHome:'Ayyukan gida da gyare-gyare',
    categoryConstruction:'Gine-gine da sana’o’in hannu',
    categoryCleaning:'Tsaftacewa da kula da gida',
    categoryGardening:'Lambu da gyaran fili',
    categoryBeauty:'Kyakkyawa, gyaran gashi da walwala',
    categoryHealth:'Kiwon lafiya da kulawa',
    categoryChildcare:'Kula da yara da renon jarirai',
    categoryFood:'Dafa abinci, hidimar abinci da abinci',
    categoryAuto:'Motoci da kanikanci',
    categoryDriving:'Tuki da kai kaya',
    categoryMoving:'Ɗaukar kaya da jigilar kayayyaki',
    categoryIT:'IT, manhajoji da taimakon fasaha',
    categoryWeb:'Ƙirƙirar yanar gizo da manhajoji',
    categoryDesign:'Zane-zanen hoto, yanar gizo da kaya',
    categoryWriting:'Rubutu, gyara rubutu da fassara',
    categoryMarketing:'Tallace-tallace, sayarwa da kafofin sada zumunta',
    categoryPhoto:'Ɗaukar hoto da bidiyo',
    categoryBusiness:'Kasuwanci, kuɗi da shawarwari',
    categoryAdmin:'Ayyukan ofis da taimakon kama-da-wane',
    categoryEducation:'Ilimi, koyarwa da harsuna',
    categoryEvents:'Biki, baƙunci da nishaɗi',
    categoryLegal:'Ayyukan shari’a da ƙwararru',
    categoryPets:'Kula da dabbobin gida',
    categoryManufacturing:'Kera kayayyaki da samarwa',
    categorySecurity:'Tsaro da kariya',
    categoryRealEstate:'Gidaje da kula da kadarori',
    categoryPersonal:'Ayyukan mutum da salon rayuwa',
    categoryOther:'Sauran',
    ageError:'Dole ne ka kai shekara 18 ko fiye don ƙirƙirar asusu.',
    enterEmail:'Da farko shigar da adireshin imel.',
    resetSent:'Idan akwai asusu da wannan adireshin, za a aika da umarnin sake saita kalmar sirri.',
    signupSuccess:'An ƙirƙiri asusu. Tabbatar da imel ɗinka sannan ka shiga.',
    accessError:'Ba a iya shiga asusunka ba. Sake gwadawa.',
    resetError:'Ba a iya aika umarnin sake saita kalmar sirri ba.'
  },
  sw: {
    languageSelectLabel:'Chagua lugha', accountAccess:'Ufikiaji wa akaunti',
    callingCode:'Msimbo wa simu wa nchi', legalNavigation:'Msaada na taarifa za kisheria',
    headerNote:'Soko la muda, ujuzi na fursa', kicker:'MUDA, UJUZI NA FURSA',
    stateProvince:'Kaunti / Mkoa', statePlaceholder:'Weka kaunti au mkoa wako',
    headline:'Akaunti moja kwa kila kitu.',
    intro:'Tumia akaunti moja ya T2I kuajiri watu wenye ujuzi au kutoa huduma zako popote duniani.',
    benefitWork:'Tafuta kazi na upate kipato',
    benefitHire:'Chapisha kazi na uajiri wenye vipaji',
    benefitGlobal:'Ungana na fursa za kimataifa',
    benefitProfile:'Unda wasifu na jalada la kazi zako',
    signIn:'Ingia', createAccount:'Fungua akaunti',
    signInTitle:'Karibu tena', signUpTitle:'Fungua akaunti yako ya T2I',
    signInDescription:'Ingia ili uendelee kwenye soko lako.',
    signUpDescription:'Akaunti moja ya kuajiri au kutoa ujuzi popote duniani.',
    fullName:'Jina kamili', namePlaceholder:'Weka jina lako kamili',
    gender:'Jinsia', selectGender:'Chagua jinsia yako',
    female:'Mwanamke', male:'Mwanaume', nonBinary:'Jinsia isiyo ya kiume au kike pekee',
    selfDescribe:'Eleza mwenyewe', preferNot:'Sipendi kusema',
    birthDate:'Tarehe ya kuzaliwa', country:'Nchi', city:'Jiji',
    preferredCurrency:'Sarafu unayopendelea',
    currencyHint:'Imependekezwa kulingana na nchi yako. Unaweza kuibadilisha baadaye kwenye akaunti yako.',
    cityPlaceholder:'Weka jiji lako', mobile:'Nambari ya simu',
    mobilePlaceholder:'Weka nambari yako ya simu',
    email:'Anwani ya barua pepe', emailPlaceholder:'Weka anwani yako ya barua pepe',
    password:'Nenosiri', passwordPlaceholder:'Unda nenosiri imara',
    passwordHint:'Tumia angalau vibambo 8 vyenye herufi, nambari na alama.',
    confirmPassword:'Thibitisha nenosiri',
    confirmPlaceholder:'Weka nenosiri tena',
    passwordsMatch:'Nenosiri zinafanana.',
    passwordsMismatch:'Nenosiri hazifanani.',
    skillCategory:'Aina ya ujuzi', primarySkill:'Ujuzi mkuu',
    skillPlaceholder:'Mfano: ufundi bomba au usanifu',
    consentStart:'Ninathibitisha kuwa nina miaka 18 au zaidi na ninakubali:',
    terms:'Masharti ya huduma', and:'na', privacy:'Sera ya faragha',
    footer:'Usimshirikishe mtu yeyote nenosiri au misimbo ya uthibitishaji.',
    forgotPassword:'Umesahau nenosiri?', alreadyAccount:'Tayari una akaunti?',
    logIn:'Ingia', help:'Msaada',
    categoryHome:'Huduma za nyumbani na ukarabati',
    categoryConstruction:'Ujenzi na ufundi stadi',
    categoryCleaning:'Usafi na utunzaji wa nyumba',
    categoryGardening:'Bustani na mandhari',
    categoryBeauty:'Urembo, nywele na afya njema',
    categoryHealth:'Huduma za afya na utunzaji',
    categoryChildcare:'Utunzaji wa watoto na walezi',
    categoryFood:'Upishi, huduma za chakula na vyakula',
    categoryAuto:'Magari na ufundi wa mitambo',
    categoryDriving:'Udereva na usafirishaji',
    categoryMoving:'Uhamishaji na usafirishaji wa mizigo',
    categoryIT:'TEHAMA, programu na usaidizi wa kiufundi',
    categoryWeb:'Uundaji wa tovuti na programu',
    categoryDesign:'Ubunifu wa picha, tovuti na bidhaa',
    categoryWriting:'Uandishi, uhariri na tafsiri',
    categoryMarketing:'Masoko, mauzo na mitandao ya kijamii',
    categoryPhoto:'Upigaji picha na video',
    categoryBusiness:'Biashara, fedha na ushauri',
    categoryAdmin:'Usimamizi na usaidizi wa mtandaoni',
    categoryEducation:'Elimu, mafunzo na lugha',
    categoryEvents:'Matukio, ukarimu na burudani',
    categoryLegal:'Huduma za kisheria na kitaalamu',
    categoryPets:'Utunzaji wa wanyama vipenzi',
    categoryManufacturing:'Utengenezaji na uzalishaji',
    categorySecurity:'Usalama na ulinzi',
    categoryRealEstate:'Majengo na huduma za mali',
    categoryPersonal:'Huduma binafsi na za mtindo wa maisha',
    categoryOther:'Nyingine',
    ageError:'Lazima uwe na umri wa miaka 18 au zaidi ili kufungua akaunti.',
    enterEmail:'Weka anwani yako ya barua pepe kwanza.',
    resetSent:'Ikiwa akaunti ipo kwa anwani hii, maagizo ya kuweka upya nenosiri yatatumwa.',
    signupSuccess:'Akaunti imeundwa. Thibitisha barua pepe yako kisha uingie.',
    accessError:'Imeshindikana kufikia akaunti yako. Tafadhali jaribu tena.',
    resetError:'Imeshindikana kutuma maagizo ya kuweka upya nenosiri.'
  }
};

const authEnglishDefaults = new Map(
  [...document.querySelectorAll('[data-auth-copy]')].map(element => [element.dataset.authCopy, element.textContent])
);
const authEnglishPlaceholders = new Map(
  [...document.querySelectorAll('[data-auth-placeholder]')].map(element => [element.dataset.authPlaceholder, element.placeholder])
);
const sharedAuthKeys = {
  signIn:'signIn', signInTitle:'signIn', createAccount:'join', signUpTitle:'join',
  fullName:'fullName', country:'country',
  city:'city', email:'emailAddress', password:'password', primarySkill:'primarySkill',
  preferredCurrency:'preferredCurrency',
  forgotPassword:'forgotPassword',
  installApp:'installApp'
};
const authStaticEnglish = {
  languageSelectLabel:'Select language',
  languageOptions:'Show language options',
  languageNoMatch:'No matching languages',
  signInTitle:'Welcome back',
  signUpTitle:'Create your T2I account',
  signInDescription:'Sign in to continue to your marketplace.',
  signUpDescription:'One account to hire and offer skills anywhere in the world. After email confirmation, sign in and submit an ID for private marketplace review.',
  passwordsMatch:'Passwords match.',
  passwordsMismatch:'Passwords do not match.',
  categoryChoose:'Choose a skill category',
  ageError:'You must be at least 18 years old to create an account.',
  enterEmail:'Enter your email address first.',
  resetSent:'If an account exists for this address, password reset instructions will be sent.',
  currencyRequired:'Choose a supported currency.',
  profilePhoto:'Profile photo',
  profilePhotoHint:'Use a clear, professional photo. Visible to marketplace members, your ID is reviewed privately.',
  documentTypePlaceholder:'Select your ID document type',
  documentTypeHint:"Choose a listed type or enter the name used for your country's photo ID.",
  profilePhotoInvalid:'Choose a JPEG, PNG, or WebP photo under 5 MB.',
  identityDocument:'Photo ID document',
  identityDocumentHint:'Upload any valid ID document showing your photo and ID number. Take a photo with your phone camera or choose a file. Image or PDF, up to 50 MB. The original is unchanged and may contain photo metadata. Authorized reviewers will check it manually, submission alone does not verify identity.',
  identityDocumentConsent:'I consent to private review of this ID document by authorized TIME2INCOME verification staff. No fixed retention period is approved; records may be preserved where required by law or a valid legal hold. This marketplace review is separate from regulated financial KYC.',
  identityDocumentRequiredBeforeContinue:'Sign in and submit an ID document before continuing in the marketplace.',
  identityDocumentResubmit:'Submit an updated ID document for your marketplace identity review.',
  identityDocumentReviewerMessage:'Reviewer message',
  identityDocumentSubmit:'Submit document securely',
  identityDocumentAccepted:'Your ID document was submitted. Review is pending.',
  identityDocumentUploading:'Uploading your ID document privately…',
  identityDocumentFileInvalid:'Choose a JPEG, PNG, WebP, HEIC, HEIF, or PDF file up to 50 MB.',
  catalogSuggestionSkillRequired:'Enter your primary skill to suggest it.',
  catalogSuggestionCategoryRequired:'Enter a name for the category to suggest.',
  catalogSuggestChooseCategory:'Choose a category',
  skillCategoryOther:'Other (uncategorized skills)',
  countryOptions:'Show country options',
  countryNoMatch:'No matching countries',
  callingCodeOptions:'Show calling code options',
  callingCodeNoMatch:'No matching countries',
  currencyOptions:'Show currency options',
  currencyNoMatch:'No matching currencies',
  signupSuccess:'Account created. Check your email to confirm your account, then sign in.',
  accessError:'Unable to access your account. Please try again.',
  resetError:'Unable to send password reset instructions.'
};
let currentAuthLanguage = 'en';

const authSocialCopy = {
  en: ['Continue with Google', 'or use email', 'You can sign up with any email address, such as Gmail, Yahoo, Outlook or your own. A Google account is not required.'],
  hi: ['Google से जारी रखें', 'या ईमेल का उपयोग करें', 'आप किसी भी ईमेल से साइन अप कर सकते हैं, जैसे Gmail, Yahoo, Outlook या अपना ईमेल। Google अकाउंट ज़रूरी नहीं है।'],
  gu: ['Google સાથે ચાલુ રાખો', 'અથવા ઇમેઇલ વાપરો', 'તમે કોઈપણ ઇમેઇલથી સાઇન અપ કરી શકો છો, જેમ કે Gmail, Yahoo, Outlook અથવા તમારો પોતાનો. Google એકાઉન્ટ જરૂરી નથી.'],
  bn: ['Google দিয়ে চালিয়ে যান', 'অথবা ইমেইল ব্যবহার করুন', 'আপনি যেকোনো ইমেইল দিয়ে সাইন আপ করতে পারেন, যেমন Gmail, Yahoo, Outlook বা নিজের ইমেইল। Google অ্যাকাউন্ট বাধ্যতামূলক নয়।'],
  mr: ['Google सह सुरू ठेवा', 'किंवा ईमेल वापरा', 'तुम्ही कोणत्याही ईमेलने साइन अप करू शकता, जसे Gmail, Yahoo, Outlook किंवा स्वतःचा ईमेल. Google खाते आवश्यक नाही.'],
  ta: ['Google மூலம் தொடரவும்', 'அல்லது மின்னஞ்சலைப் பயன்படுத்தவும்', 'Gmail, Yahoo, Outlook அல்லது உங்கள் சொந்த மின்னஞ்சல் என எந்த மின்னஞ்சலிலும் பதிவு செய்யலாம். Google கணக்கு தேவையில்லை.'],
  te: ['Google తో కొనసాగండి', 'లేదా ఈమెయిల్ ఉపయోగించండి', 'Gmail, Yahoo, Outlook లేదా మీ సొంత ఈమెయిల్ వంటి ఏ ఈమెయిల్‌తోనైనా సైన్ అప్ చేయవచ్చు. Google ఖాతా అవసరం లేదు.'],
  kn: ['Google ಮೂಲಕ ಮುಂದುವರಿಸಿ', 'ಅಥವಾ ಇಮೇಲ್ ಬಳಸಿ', 'Gmail, Yahoo, Outlook ಅಥವಾ ನಿಮ್ಮದೇ ಇಮೇಲ್ ಸೇರಿದಂತೆ ಯಾವುದೇ ಇಮೇಲ್‌ನಿಂದ ಸೈನ್ ಅಪ್ ಮಾಡಬಹುದು. Google ಖಾತೆ ಅಗತ್ಯವಿಲ್ಲ.'],
  ml: ['Google ഉപയോഗിച്ച് തുടരുക', 'അല്ലെങ്കിൽ ഇമെയിൽ ഉപയോഗിക്കുക', 'Gmail, Yahoo, Outlook അല്ലെങ്കിൽ സ്വന്തം ഇമെയിൽ പോലുള്ള ഏത് ഇമെയിൽ ഉപയോഗിച്ചും സൈൻ അപ്പ് ചെയ്യാം. Google അക്കൗണ്ട് നിർബന്ധമില്ല.'],
  pa: ['Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ', 'ਜਾਂ ਈਮੇਲ ਵਰਤੋ', 'ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਈਮੇਲ ਨਾਲ ਸਾਈਨ ਅਪ ਕਰ ਸਕਦੇ ਹੋ, ਜਿਵੇਂ Gmail, Yahoo, Outlook ਜਾਂ ਆਪਣੀ ਈਮੇਲ। Google ਖਾਤਾ ਲਾਜ਼ਮੀ ਨਹੀਂ ਹੈ।'],
  ur: ['Google کے ساتھ جاری رکھیں', 'یا ای میل استعمال کریں', 'آپ کسی بھی ای میل سے سائن اپ کر سکتے ہیں، جیسے Gmail، Yahoo، Outlook یا اپنی ای میل۔ Google اکاؤنٹ ضروری نہیں۔'],
  ar: ['المتابعة باستخدام Google', 'أو استخدم البريد الإلكتروني', 'يمكنك التسجيل بأي بريد إلكتروني مثل Gmail أو Yahoo أو Outlook أو بريدك الخاص. حساب Google غير مطلوب.'],
  'zh-Hans': ['使用 Google 继续', '或使用邮箱', '你可以使用任何邮箱注册，例如 Gmail、Yahoo、Outlook 或自己的邮箱。不需要 Google 账号。'],
  'zh-Hant': ['使用 Google 繼續', '或使用電子郵件', '你可以使用任何電子郵件註冊，例如 Gmail、Yahoo、Outlook 或自己的信箱。不需要 Google 帳號。'],
  es: ['Continuar con Google', 'o usa tu correo', 'Puedes registrarte con cualquier correo, como Gmail, Yahoo, Outlook o el tuyo propio. No necesitas una cuenta de Google.'],
  fr: ['Continuer avec Google', 'ou utilisez votre e-mail', 'Vous pouvez vous inscrire avec n’importe quelle adresse e-mail : Gmail, Yahoo, Outlook ou la vôtre. Un compte Google n’est pas obligatoire.'],
  de: ['Weiter mit Google', 'oder E-Mail verwenden', 'Sie können sich mit jeder E-Mail-Adresse registrieren, z. B. Gmail, Yahoo, Outlook oder Ihrer eigenen. Ein Google-Konto ist nicht erforderlich.'],
  pt: ['Continuar com o Google', 'ou use o e-mail', 'Você pode se cadastrar com qualquer e-mail, como Gmail, Yahoo, Outlook ou o seu próprio. Não é preciso ter conta Google.'],
  ru: ['Продолжить через Google', 'или используйте эл. почту', 'Зарегистрироваться можно с любой электронной почтой: Gmail, Yahoo, Outlook или своей. Аккаунт Google не нужен.'],
  ja: ['Google で続行', 'またはメールを使用', 'Gmail、Yahoo、Outlook、独自ドメインなど、どのメールアドレスでも登録できます。Google アカウントは不要です。'],
  ko: ['Google로 계속하기', '또는 이메일 사용', 'Gmail, Yahoo, Outlook 또는 직접 사용하는 이메일 등 어떤 이메일로도 가입할 수 있습니다. Google 계정은 필요하지 않습니다.'],
  id: ['Lanjutkan dengan Google', 'atau gunakan email', 'Anda dapat mendaftar dengan email apa pun, seperti Gmail, Yahoo, Outlook, atau email Anda sendiri. Akun Google tidak diperlukan.'],
  ms: ['Teruskan dengan Google', 'atau guna e-mel', 'Anda boleh mendaftar dengan mana-mana e-mel seperti Gmail, Yahoo, Outlook atau e-mel anda sendiri. Akaun Google tidak diperlukan.'],
  th: ['ดำเนินการต่อด้วย Google', 'หรือใช้อีเมล', 'คุณสมัครด้วยอีเมลใดก็ได้ เช่น Gmail, Yahoo, Outlook หรืออีเมลของคุณเอง ไม่จำเป็นต้องมีบัญชี Google'],
  vi: ['Tiếp tục với Google', 'hoặc dùng email', 'Bạn có thể đăng ký bằng bất kỳ email nào, như Gmail, Yahoo, Outlook hoặc email riêng. Không cần tài khoản Google.'],
  tr: ['Google ile devam et', 'veya e-posta kullan', 'Gmail, Yahoo, Outlook veya kendi e-postanız gibi herhangi bir e-posta ile kayıt olabilirsiniz. Google hesabı gerekmez.'],
  it: ['Continua con Google', 'oppure usa l’e-mail', 'Puoi registrarti con qualsiasi indirizzo e-mail, come Gmail, Yahoo, Outlook o il tuo. Non serve un account Google.'],
  nl: ['Doorgaan met Google', 'of gebruik e-mail', 'Je kunt je met elk e-mailadres registreren, zoals Gmail, Yahoo, Outlook of je eigen adres. Een Google-account is niet nodig.'],
  sw: ['Endelea na Google', 'au tumia barua pepe', 'Unaweza kujisajili kwa barua pepe yoyote, kama Gmail, Yahoo, Outlook au yako mwenyewe. Akaunti ya Google haihitajiki.'],
  ne: ['Google मार्फत जारी राख्नुहोस्', 'वा इमेल प्रयोग गर्नुहोस्', 'तपाईं Gmail, Yahoo, Outlook वा आफ्नै इमेल जस्ता कुनै पनि इमेलबाट साइन अप गर्न सक्नुहुन्छ। Google खाता आवश्यक छैन।'],
  ha: ['Ci gaba da Google', 'ko amfani da imel', 'Kuna iya yin rajista da kowace imel, kamar Gmail, Yahoo, Outlook ko naku. Ba sai kuna da asusun Google ba.'],
  fa: ['ادامه با Google', 'یا استفاده از ایمیل', 'می‌توانید با هر ایمیلی مانند Gmail، Yahoo، Outlook یا ایمیل شخصی خود ثبت‌نام کنید. حساب Google لازم نیست.'],
  fil: ['Magpatuloy gamit ang Google', 'o gumamit ng email', 'Maaari kang mag-sign up gamit ang anumang email, tulad ng Gmail, Yahoo, Outlook o sarili mong email. Hindi kailangan ng Google account.'],
  as: ['Google ৰে আগবাঢ়ক', 'বা ইমেইল ব্যৱহাৰ কৰক', 'আপুনি Gmail, Yahoo, Outlook বা নিজৰ ইমেইলৰ দৰে যিকোনো ইমেইলেৰে ছাইন আপ কৰিব পাৰে। Google একাউণ্ট বাধ্যতামূলক নহয়।'],
  or: ['Google ସହ ଜାରି ରଖନ୍ତୁ', 'କିମ୍ବା ଇମେଲ୍ ବ୍ୟବହାର କରନ୍ତୁ', 'ଆପଣ Gmail, Yahoo, Outlook କିମ୍ବା ନିଜ ଇମେଲ୍ ଭଳି ଯେକୌଣସି ଇମେଲ୍ ସହ ସାଇନ୍ ଅପ୍ କରିପାରିବେ। Google ଆକାଉଣ୍ଟ ଆବଶ୍ୟକ ନୁହେଁ।']
};
const authSocialHints = {
  en: 'Any email works: Gmail, Yahoo, Outlook or your own',
  hi: 'कोई भी ईमेल चलेगा: Gmail, Yahoo, Outlook या अपना',
  gu: 'કોઈપણ ઇમેઇલ ચાલશે: Gmail, Yahoo, Outlook કે પોતાનો',
  bn: 'যেকোনো ইমেইল চলবে: Gmail, Yahoo, Outlook বা নিজের',
  mr: 'कोणताही ईमेल चालेल: Gmail, Yahoo, Outlook किंवा स्वतःचा',
  ta: 'எந்த மின்னஞ்சலும் போதும்: Gmail, Yahoo, Outlook அல்லது சொந்தம்',
  te: 'ఏ ఈమెయిల్ అయినా చాలు: Gmail, Yahoo, Outlook లేదా సొంతం',
  kn: 'ಯಾವುದೇ ಇಮೇಲ್ ಸಾಕು: Gmail, Yahoo, Outlook ಅಥವಾ ನಿಮ್ಮದು',
  ml: 'ഏത് ഇമെയിലും മതി: Gmail, Yahoo, Outlook അല്ലെങ്കിൽ സ്വന്തം',
  pa: 'ਕੋਈ ਵੀ ਈਮੇਲ ਚੱਲੇਗੀ: Gmail, Yahoo, Outlook ਜਾਂ ਆਪਣੀ',
  ur: 'کوئی بھی ای میل چلے گی: Gmail، Yahoo، Outlook یا اپنی',
  ar: 'أي بريد إلكتروني يصلح: Gmail أو Yahoo أو Outlook أو بريدك',
  'zh-Hans': '任何邮箱都可以：Gmail、Yahoo、Outlook 或自有邮箱',
  'zh-Hant': '任何信箱都可以：Gmail、Yahoo、Outlook 或自有信箱',
  es: 'Sirve cualquier correo: Gmail, Yahoo, Outlook o el tuyo',
  fr: 'Tout e-mail convient : Gmail, Yahoo, Outlook ou le vôtre',
  de: 'Jede E-Mail geht: Gmail, Yahoo, Outlook oder Ihre eigene',
  pt: 'Qualquer e-mail serve: Gmail, Yahoo, Outlook ou o seu',
  ru: 'Подойдёт любая почта: Gmail, Yahoo, Outlook или своя',
  ja: 'どのメールでもOK：Gmail、Yahoo、Outlook、独自ドメイン',
  ko: '어떤 이메일이든 가능: Gmail, Yahoo, Outlook 또는 직접 보유',
  id: 'Email apa pun bisa: Gmail, Yahoo, Outlook atau milik Anda',
  ms: 'Mana-mana e-mel boleh: Gmail, Yahoo, Outlook atau milik anda',
  th: 'อีเมลไหนก็ได้: Gmail, Yahoo, Outlook หรืออีเมลของคุณ',
  vi: 'Email nào cũng được: Gmail, Yahoo, Outlook hoặc riêng',
  tr: 'Her e-posta olur: Gmail, Yahoo, Outlook veya kendiniz',
  it: 'Va bene qualsiasi e-mail: Gmail, Yahoo, Outlook o la tua',
  nl: 'Elk e-mailadres werkt: Gmail, Yahoo, Outlook of eigen adres',
  sw: 'Barua pepe yoyote inafaa: Gmail, Yahoo, Outlook au yako',
  ne: 'कुनै पनि इमेल चल्छ: Gmail, Yahoo, Outlook वा आफ्नै',
  ha: 'Kowace imel tana aiki: Gmail, Yahoo, Outlook ko naka',
  fa: 'هر ایمیلی کار می‌کند: Gmail، Yahoo، Outlook یا شخصی',
  fil: 'Kahit anong email: Gmail, Yahoo, Outlook o sarili mo',
  as: 'যিকোনো ইমেইল চলিব: Gmail, Yahoo, Outlook বা নিজৰ',
  or: 'ଯେକୌଣସି ଇମେଲ୍ ଚଳିବ: Gmail, Yahoo, Outlook କିମ୍ବା ନିଜର'
};
const authSocialKeys = { socialGoogle: 0, socialDivider: 1 };

function authText(key) {
  if (key === 'socialEmailHint') return authSocialHints[currentAuthLanguage] || authSocialHints.en;
  if (key in authSocialKeys) return (authSocialCopy[currentAuthLanguage] || authSocialCopy.en)[authSocialKeys[key]];
  const custom = authTranslations[currentAuthLanguage] || {};
  if (custom[key]) return custom[key];
  const shared = window.TIME2INCOME_LOCALIZATION.translations[currentAuthLanguage] || {};
  if (sharedAuthKeys[key] && shared[sharedAuthKeys[key]]) return shared[sharedAuthKeys[key]];
  return authEnglishDefaults.get(key) || authStaticEnglish[key] || '';
}

function applyAuthLanguage(code, persist = true) {
  const language = window.TIME2INCOME_LOCALIZATION.languages.find(item => item.code === code)
    || window.TIME2INCOME_LOCALIZATION.languages[0];
  currentAuthLanguage = language.code;
  document.documentElement.lang = language.locale;
  document.documentElement.dir = language.dir || 'ltr';
  authLanguage.value = language.code;
  authLanguageSearch.value = getAuthLanguageLabel(language);
  document.querySelectorAll('[data-auth-copy]').forEach(element => {
    element.textContent = authText(element.dataset.authCopy);
  });
  const categoryPlaceholder = authSkillCategory?.options[0];
  if (categoryPlaceholder) categoryPlaceholder.textContent = authText('categoryChoose');
  populateAuthCatalogSuggestionCategories();
  document.querySelectorAll('[data-auth-placeholder]').forEach(element => {
    const custom = authTranslations[currentAuthLanguage] || {};
    const shared = window.TIME2INCOME_LOCALIZATION.translations[currentAuthLanguage] || {};
    const sharedKey = {
      emailPlaceholder:'emailPlaceholder',
      passwordPlaceholder:'passwordPlaceholder'
    }[element.dataset.authPlaceholder];
    element.placeholder = custom[element.dataset.authPlaceholder] || shared[sharedKey]
      || authEnglishPlaceholders.get(element.dataset.authPlaceholder) || '';
  });
  document.querySelectorAll('[data-auth-aria-label]').forEach(element => {
    element.setAttribute('aria-label', authText(element.dataset.authAriaLabel));
  });
  if (countryDirectory.length) populateCountryOptions(language.locale);
  document.getElementById('authTitle').textContent = authText(authMode === 'signup' ? 'signUpTitle' : 'signInTitle')
    || (authMode === 'signup' ? 'Create your T2I account' : 'Welcome back');
  document.getElementById('authDescription').textContent = authText(authMode === 'signup' ? 'signUpDescription' : 'signInDescription');
  if (persist) {
    try {
      localStorage.setItem('time2income_language', language.code);
      localStorage.setItem('time2income_auth_language_selection', language.code);
    } catch (error) {
      console.warn('Could not save language preference:', error);
    }
  }
}

function populateAuthLanguageOptions() {
  authLanguageOptionsData = window.TIME2INCOME_LOCALIZATION.languages;
  authLanguageOptionsData.forEach(language => {
    authLanguage.add(new Option(getAuthLanguageLabel(language), language.code));
  });
  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('time2income_language') || 'en';
  } catch (error) {
    console.warn('Could not load saved language preference:', error);
  }
  applyAuthLanguage(savedLanguage, false);
}

const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');

const countryCodes195 = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CR CI HR CU CY CZ CD DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');

const countryCodes196 = countryCodes195.concat('TW');

function populateCountryOptions(locale = document.documentElement.lang || 'en') {
  const selectedCountry = findSignupCountry(authCountry.value)?.name || 'India';
  const canonicalNames = new Intl.DisplayNames(['en'], { type: 'region' });
  let displayNames;
  try {
    displayNames = new Intl.DisplayNames([locale], { type: 'region' });
  } catch (error) {
    displayNames = canonicalNames;
  }
  if (!Array.isArray(window.TIME2INCOME_COUNTRIES) || !window.TIME2INCOME_COUNTRIES.length) {
    throw new Error('The country reference directory did not load.');
  }
  countryDirectory = window.TIME2INCOME_COUNTRIES.map(({ code, name, dialCode, currencyCode, languages }) => ({
    code, name, dialCode, currencyCode, languages
  }));
  const flagForCountry = code => String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0)));
  const displayName = code => displayNames.of(code) || canonicalNames.of(code);
  const sortedCountries = [...countryDirectory].sort((a, b) => displayName(a.code).localeCompare(displayName(b.code)));

  signupCountryOptions = sortedCountries.map(country => ({
    country,
    displayName: displayName(country.code),
    flag: flagForCountry(country.code)
  }));
  authDialCode.replaceChildren();
  countryDirectory.forEach(({ code, name, dialCode }) => {
    authDialCode.add(new Option(`${flagForCountry(code)} ${dialCode} · ${displayName(code)} (${code})`, code));
  });

  authCountry.value = countryDirectory.some(country => country.name === selectedCountry) ? selectedCountry : 'India';
  authDialCode.value = countryDirectory.find(country => country.name === authCountry.value).code;
  syncDialSearch(countryDirectory.find(country => country.code === authDialCode.value));
  updateSignupCountryDetails(findSignupCountry(authCountry.value));
  if (!authCountryOptions.hidden) openCountryOptions('');
  if (!authDialOptions.hidden) openDialOptions('');
}

function populateAuthCurrencyOptions() {
  const selectedCountry = countryDirectory.find(country => country.name === authCountry.value);
  const selectedCurrency = authCurrency.value;
  const currencyFlag = currency => {
    const associatedCountry = selectedCountry && currency.code === selectedCountry.currencyCode
      ? selectedCountry
      : selectedCountry && currency.countries.includes(normalizeCountryName(selectedCountry.name))
      ? selectedCountry
      : null;
    if (!associatedCountry) return '';
    const flag = String.fromCodePoint(...[...associatedCountry.code].map(char => 127397 + char.charCodeAt(0)));
    return `${flag} ${associatedCountry.name} · `;
  };
  signupCurrencyOptions = window.TIME2INCOME_CURRENCY.currencies.map(currency => ({
    currency,
    label: `${currencyFlag(currency)}${currency.name} (${currency.code})`
  }));
  const nextCurrency = window.TIME2INCOME_CURRENCY.resolveCurrency(selectedCurrency)?.code
    || window.TIME2INCOME_CURRENCY.resolveCurrency(selectedCountry?.currencyCode)?.code
    || window.TIME2INCOME_CURRENCY.suggestCurrency(authCountry.value)
    || 'USD';
  authCurrency.value = nextCurrency;
  const selectedOption = signupCurrencyOptions.find(({ currency }) => currency.code === nextCurrency);
  authCurrencySearch.value = selectedOption?.label || '';
  authCurrencySearch.setCustomValidity(selectedOption ? '' : 'Choose a supported currency.');
  if (!authCurrencyOptions.hidden) openCurrencyOptions('');
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.dataset.error = String(isError);
}

let oauthProfileMode = false;
let oauthProfileUser = null;

function needsOAuthProfileSetup(user) {
  const provider = user?.app_metadata?.provider;
  if (!user || !provider || provider === 'email') return false;
  const metadata = user.user_metadata || {};
  return !metadata.profile_setup_completed && !(metadata.country && metadata.phone_number);
}

function enterOAuthProfileMode(user) {
  setAuthMode('signup');
  oauthProfileMode = true;
  oauthProfileUser = user;
  document.body.classList.add('auth-oauth-profile');
  const authEmailInput = document.getElementById('authEmail');
  authEmailInput.value = user.email || '';
  authEmailInput.required = false;
  authEmailInput.disabled = true;
  authPassword.required = false;
  authPassword.disabled = true;
  authConfirmPassword.required = false;
  authConfirmPassword.disabled = true;
  const nameInput = document.getElementById('authName');
  if (!nameInput.value) {
    nameInput.value = String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim().slice(0, 80);
  }
  document.getElementById('authTitle').textContent = 'Almost done';
  document.getElementById('authDescription').textContent =
    'Your account is created. Add the details below so people can find and trust your profile.';
  authSubmit.textContent = 'Save and continue';
}

async function startOAuthSignIn(button) {
  const provider = button.dataset.oauthProvider;
  const redirectTarget = new URL('auth.html?mode=signin', window.location.href);
  const next = new URLSearchParams(window.location.search).get('next');
  if (next === 'my-profile.html') redirectTarget.searchParams.set('next', next);
  document.querySelectorAll('[data-oauth-provider]').forEach(item => { item.disabled = true; });
  showAuthMessage('');
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTarget.href }
    });
    if (error) throw error;
  } catch (error) {
    document.querySelectorAll('[data-oauth-provider]').forEach(item => { item.disabled = false; });
    showAuthMessage(error.message || authText('accessError'), true);
  }
}

function setAuthMode(mode) {
  identityDocumentMode = false;
  oauthProfileMode = false;
  oauthProfileUser = null;
  document.body.classList.remove('auth-oauth-profile');
  document.getElementById('authEmail').disabled = false;
  document.getElementById('authEmail').required = true;
  authPassword.disabled = false;
  authPassword.required = true;
  closeIdentityDocumentTypeOptions();
  document.body.classList.remove('auth-identity-only');
  authMode = mode === 'signup' ? 'signup' : 'signin';
  document.querySelectorAll('.auth-password-toggle').forEach(button => {
    const passwordInput = document.getElementById(button.dataset.passwordTarget);
    passwordInput.type = 'password';
    button.dataset.visible = 'false';
    button.setAttribute('aria-label', 'Show password');
    button.title = 'Show password';
  });
  document.body.classList.toggle('auth-only-signup', authMode === 'signup');
  document.body.classList.toggle('auth-only-signin', authMode === 'signin');
  signInTab.setAttribute('aria-selected', String(authMode === 'signin'));
  signUpTab.setAttribute('aria-selected', String(authMode === 'signup'));
  document.getElementById('authTitle').textContent = authText(authMode === 'signup' ? 'signUpTitle' : 'signInTitle');
  document.getElementById('authDescription').textContent = authText(authMode === 'signup' ? 'signUpDescription' : 'signInDescription');
  document.getElementById('authSubmit').textContent = authText(authMode === 'signup' ? 'createAccount' : 'signIn');
  authPassword.autocomplete = authMode === 'signup' ? 'new-password' : 'current-password';
  authConfirmPassword.required = authMode === 'signup';
  authConfirmPassword.disabled = authMode !== 'signup';
  authCurrencySearch.required = authMode === 'signup';
  authCurrencySearch.disabled = authMode !== 'signup';
  authCurrency.disabled = authMode !== 'signup';
  authDialSearch.required = authMode === 'signup';
  authDialSearch.disabled = authMode !== 'signup';
  authDialCode.disabled = authMode !== 'signup';
  authProfilePhoto.required = authMode === 'signup';
  authProfilePhoto.disabled = authMode !== 'signup';
  authIdentityDocument.required = false;
  authIdentityDocument.disabled = true;
  authIdentityDocumentType.required = false;
  authIdentityDocumentType.disabled = true;
  authIdentityDocumentConsent.required = false;
  authIdentityDocumentConsent.disabled = true;
  authIdentityDocumentField.hidden = true;
  authIdentityDocumentTypeField.hidden = true;
  authIdentityConsentGroup.hidden = true;
  authCategory.required = authMode === 'signup';
  authCategory.disabled = authMode !== 'signup';
  authSkillCategory.required = authMode === 'signup';
  authSkillCategory.disabled = authMode !== 'signup';
  authSkill.required = authMode === 'signup';
  authSkill.disabled = authMode !== 'signup';
  authConfirmPassword.setCustomValidity('');
  authConfirmPasswordHint.textContent = '';
  document.getElementById('authName').required = authMode === 'signup';
  authGender.required = authMode === 'signup';
  authBirthDate.required = authMode === 'signup';
  authBirthDate.max = `${new Date().getFullYear() - 18}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  authCountry.required = authMode === 'signup';
  authState.required = authMode === 'signup';
  authCity.required = authMode === 'signup';
  authPhone.required = authMode === 'signup';
  authConsent.required = authMode === 'signup';
  updateAuthCatalogSuggestionFields();
  showAuthMessage('');
}

function enterIdentityDocumentMode(user) {
  setAuthMode('signin');
  identityDocumentMode = true;
  identityDocumentUser = user;
  document.body.classList.add('auth-identity-only');
  for (const control of authForm.elements) {
    if (!authIdentityDocumentField.contains(control)
      && !authIdentityDocumentTypeField.contains(control)
      && control !== authIdentityDocumentConsent && control !== authSubmit) {
      control.disabled = true;
    }
  }
  authIdentityDocumentTypeField.hidden = false;
  authIdentityDocumentField.hidden = false;
  authIdentityConsentGroup.hidden = false;
  authIdentityDocument.disabled = false;
  authIdentityDocument.required = true;
  authIdentityDocumentType.disabled = false;
  authIdentityDocumentType.required = true;
  authIdentityDocumentType.value = String(user.user_metadata?.identity_document_type || '');
  authIdentityDocumentConsent.checked = Boolean(user.user_metadata?.identity_document_consent_at);
  authIdentityDocumentConsent.disabled = authIdentityDocumentConsent.checked;
  authIdentityDocumentConsent.required = !authIdentityDocumentConsent.checked;
  document.getElementById('authTitle').textContent = authText('identityDocument');
  document.getElementById('authDescription').textContent = authText('identityDocumentRequiredBeforeContinue');
  authSubmit.textContent = authText('identityDocumentSubmit');
  showAuthMessage(authText('identityDocumentRequiredBeforeContinue'));
}

function updateAuthCatalogSuggestionFields() {
  const isSignup = authMode === 'signup';
  const kind = authCatalogSuggestionKind.value;
  const suggestSkill = isSignup && kind === 'skill';
  const suggestCategory = isSignup && kind === 'category';
  authCatalogSuggestionSkillCategoryField.hidden = !suggestSkill;
  authCatalogSuggestionSkillCategory.disabled = !suggestSkill;
  authCatalogSuggestionSkillCategory.required = suggestSkill;
  authCatalogSuggestionCategoryField.hidden = !suggestCategory;
  authCatalogSuggestionCategoryName.disabled = !suggestCategory;
  authCatalogSuggestionCategoryName.required = suggestCategory;
  authSkill.required = isSignup;
  authSkill.minLength = isSignup ? 2 : 0;
  authCatalogSuggestionCategoryName.minLength = suggestCategory ? 2 : 0;
}

function populateAuthCatalogSuggestionCategories() {
  const selectedCategory = authCatalogSuggestionSkillCategory.value;
  authCatalogSuggestionSkillCategory.replaceChildren(
    new Option(authText('catalogSuggestChooseCategory') || 'Choose a category', '')
  );
  (window.TIME2INCOME_SKILL_CATEGORY_NAMES || []).forEach(category => {
    authCatalogSuggestionSkillCategory.add(new Option(category, category));
  });
  authCatalogSuggestionSkillCategory.value =
    window.TIME2INCOME_SKILL_CATEGORY_NAMES?.includes(selectedCategory) ? selectedCategory : '';
  updateAuthCatalogSuggestionFields();
}

function getSignupCountry() {
  return authCountry.value;
}

function prepareProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('This browser could not prepare the profile photo.'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('This browser could not prepare the profile photo.'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.88);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error(authText('profilePhotoInvalid')));
    };
    image.src = imageUrl;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not prepare the profile photo.'));
    reader.readAsDataURL(blob);
  });
}

function clearPendingProfilePhoto() {
  try {
    sessionStorage.removeItem('time2income_pending_profile_photo');
    sessionStorage.removeItem('time2income_pending_profile_photo_user');
  } catch (error) {
    console.warn('Could not clear the pending profile photo from this browser session:', error);
  }
}

async function continueAuthenticatedUser() {
  const next = new URLSearchParams(window.location.search).get('next');
  window.location.replace(next === 'my-profile.html' ? next : 'index.html');
}

async function continueAfterIdentityCheck(user) {
  if (needsOAuthProfileSetup(user)) {
    enterOAuthProfileMode(user);
    return false;
  }
  const identity = window.TIME2INCOME_IDENTITY_DOCUMENTS;
  const requirement = await identity.getRequirement(user);
  if (!requirement.required || requirement.submitted) {
    await continueAuthenticatedUser();
    return true;
  }
  enterIdentityDocumentMode(user);
  const statusMessage = ['rejected', 'more_information_required'].includes(requirement.status)
    ? authText('identityDocumentResubmit')
    : authText('identityDocumentRequiredBeforeContinue');
  const reviewerMessage = String(requirement.requesterMessage || '').trim();
  showAuthMessage(reviewerMessage
    ? `${statusMessage} ${authText('identityDocumentReviewerMessage')}: ${reviewerMessage}`
    : statusMessage);
  return false;
}

async function submitIdentityDocument() {
  if (!identityDocumentUser || !authForm.reportValidity()) return;
  authSubmit.disabled = true;
  showAuthMessage(authText('identityDocumentUploading'));
  try {
    let user = identityDocumentUser;
    const metadata = {
      identity_document_type: authIdentityDocumentType.value.trim()
    };
    if (!user.user_metadata?.identity_document_consent_at) {
      metadata.identity_document_consent_at = new Date().toISOString();
    }
    if (metadata.identity_document_type !== user.user_metadata?.identity_document_type
      || metadata.identity_document_consent_at) {
      const { data, error } = await supabaseClient.auth.updateUser({
        data: metadata
      });
      if (error) throw error;
      user = data.user;
      identityDocumentUser = user;
    }
    await window.TIME2INCOME_IDENTITY_DOCUMENTS.submitSelected(
      user,
      authIdentityDocument.files?.[0]
    );
    showAuthMessage(authText('identityDocumentAccepted'));
    await continueAfterIdentityCheck(user);
  } catch (error) {
    showAuthMessage(error.message || authText('identityDocumentRequiredBeforeContinue'), true);
  } finally {
    authSubmit.disabled = false;
  }
}

function clearLegacyIdentityDocumentsOnce() {
  if (!legacyIdentityDocumentCleanup) {
    legacyIdentityDocumentCleanup =
      window.TIME2INCOME_IDENTITY_DOCUMENTS.clearLegacyStagedDocuments();
  }
  return legacyIdentityDocumentCleanup;
}

async function submitAuth(event) {
  event.preventDefault();
  if (identityDocumentMode) {
    await submitIdentityDocument();
    return;
  }
  authConfirmPassword.setCustomValidity('');
  if (authMode === 'signup') {
    const country = findSignupCountry(authCountry.value);
    authCountry.setCustomValidity(country ? '' : 'Choose a country from the suggestions.');
    if (!country) {
      authCountry.reportValidity();
      return;
    }
  }
  if (authMode === 'signup' && authPassword.value !== authConfirmPassword.value) {
    authConfirmPassword.setCustomValidity(authText('passwordsMismatch'));
    authConfirmPasswordHint.textContent = authText('passwordsMismatch');
    authConfirmPasswordHint.dataset.match = 'false';
    authConfirmPassword.reportValidity();
    return;
  }
  if (authMode === 'signup' && authConfirmPassword.value) {
    authConfirmPasswordHint.textContent = authText('passwordsMatch');
    authConfirmPasswordHint.dataset.match = 'true';
  }
  if (!authForm.reportValidity()) return;

  if (authMode === 'signup') {
    const birthDate = new Date(`${authBirthDate.value}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayNotReached = today.getMonth() < birthDate.getMonth()
      || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (birthdayNotReached) age -= 1;
    if (!Number.isFinite(birthDate.getTime()) || age < 18) {
      showAuthMessage(authText('ageError'), true);
      authBirthDate.focus();
      return;
    }
    const photoFile = authProfilePhoto.files?.[0];
    if (!photoFile || !['image/jpeg', 'image/png', 'image/webp'].includes(photoFile.type) || photoFile.size > 5 * 1024 * 1024) {
      showAuthMessage(authText('profilePhotoInvalid'), true);
      authProfilePhoto.focus();
      return;
    }
  }

  try {
    await clearLegacyIdentityDocumentsOnce();
  } catch (error) {
    showAuthMessage(error.message || authText('accessError'), true);
    return;
  }

  authSubmit.disabled = true;
  showAuthMessage('');
  let pendingPhotoStored = false;
  try {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    if (authMode === 'signin') {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await continueAfterIdentityCheck(data.user);
      return;
    }

    const phoneCountry = countryDirectory.find(country => country.code === authDialCode.value);
    const preferredCurrency = window.TIME2INCOME_CURRENCY.resolveCurrency(authCurrency.value);
    if (!preferredCurrency) throw new Error(authText('currencyRequired') || 'Choose a supported currency.');
    const preparedPhoto = await prepareProfilePhoto(authProfilePhoto.files[0]);
    const pendingPhotoData = await blobToDataUrl(preparedPhoto);
    try {
      sessionStorage.setItem('time2income_pending_profile_photo', pendingPhotoData);
      pendingPhotoStored = true;
    } catch (error) {
      throw new Error('The photo could not be saved for account setup. Please try again in this browser.');
    }
    let preferredLanguage = 'en';
    try {
      preferredLanguage = localStorage.getItem('time2income_language') || 'en';
    } catch (error) {
      console.warn('Could not read saved language preference:', error);
    }

    const profileData = {
          full_name: document.getElementById('authName').value.trim(),
          role: 'both',
          gender: authGender.value,
          date_of_birth: authBirthDate.value,
          country: getSignupCountry(),
          state: authState.value.trim(),
          region: authState.value.trim(),
          city: authCity.value.trim(),
          phone_number: `${phoneCountry.dialCode} ${authPhone.value.trim()}`,
          primary_skill: document.getElementById('authSkill').value.trim(),
          hourly_rate: '',
          work_preference: 'Local',
          category: document.getElementById('authCategory').value,
          preferred_language: preferredLanguage,
          preferred_currency: preferredCurrency.code,
          languages: '',
          identity_document_required: true,
          catalog_suggestion: authCatalogSuggestionKind.value === 'skill'
            ? {
              kind: 'skill',
              name: authSkill.value.trim(),
              category: authCatalogSuggestionSkillCategory.value
            }
            : authCatalogSuggestionKind.value === 'category'
              ? {
                kind: 'category',
                name: authCatalogSuggestionCategoryName.value.trim()
              }
              : null
    };
    if (oauthProfileMode) {
      profileData.profile_setup_completed = true;
      const updated = await supabaseClient.auth.updateUser({ data: profileData });
      if (updated.error) {
        if (pendingPhotoStored) clearPendingProfilePhoto();
        throw updated.error;
      }
      try {
        sessionStorage.setItem('time2income_pending_profile_photo_user', updated.data.user.id);
      } catch (error) {
        console.warn('Could not link the pending photo to the account; the user will be asked to upload it after sign-in:', error);
        clearPendingProfilePhoto();
      }
      try {
        localStorage.setItem('time2income_currency', preferredCurrency.code);
      } catch (error) {
        console.warn('Could not save the selected currency:', error);
      }
      await continueAfterIdentityCheck(updated.data.user);
      return;
    }
    const signup = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: profileData,
        emailRedirectTo: new URL('auth.html?mode=signin&idVerification=required', window.location.href).href
      }
    });
    if (signup.error) {
      if (pendingPhotoStored) clearPendingProfilePhoto();
      throw signup.error;
    }
    if (pendingPhotoStored && signup.data.user?.id) {
      try {
        sessionStorage.setItem('time2income_pending_profile_photo_user', signup.data.user.id);
      } catch (error) {
        console.warn('Could not link the pending photo to the new account; the user will be asked to upload it after sign-in:', error);
        clearPendingProfilePhoto();
        pendingPhotoStored = false;
      }
    }
    try {
      localStorage.setItem('time2income_currency', preferredCurrency.code);
    } catch (error) {
      console.warn('Could not save the selected currency:', error);
    }
    if (signup.data.session) {
      await continueAfterIdentityCheck(signup.data.user);
      return;
    }
    setAuthMode('signin');
    showAuthMessage(authText('signupSuccess'));
  } catch (error) {
    if (pendingPhotoStored && authMode === 'signup') clearPendingProfilePhoto();
    showAuthMessage(error.message || authText('accessError'), true);
  } finally {
    authSubmit.disabled = false;
  }
}

signInTab.addEventListener('click', () => setAuthMode('signin'));
signUpTab.addEventListener('click', () => setAuthMode('signup'));
authIdentityDocument.addEventListener('change', () => {
  const file = authIdentityDocument.files?.[0];
  if (!file) {
    authIdentityDocumentFileName.textContent = '';
    authIdentityDocument.setCustomValidity('');
    return;
  }
  try {
    window.TIME2INCOME_IDENTITY_DOCUMENTS.validateFile(file);
    authIdentityDocument.setCustomValidity('');
    authIdentityDocumentFileName.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  } catch (error) {
    authIdentityDocument.setCustomValidity(error.message);
    authIdentityDocumentFileName.textContent = error.message || authText('identityDocumentFileInvalid');
  }
});
window.addEventListener('time2income:identity-upload-progress', event => {
  const percent = Number(event.detail?.percent);
  if (Number.isFinite(percent)) {
    showAuthMessage(`${authText('identityDocumentUploading')} ${percent}%`);
  }
});
authProfilePhoto.addEventListener('change', () => {
  if (authProfilePhotoPreview.dataset.objectUrl) {
    URL.revokeObjectURL(authProfilePhotoPreview.dataset.objectUrl);
    delete authProfilePhotoPreview.dataset.objectUrl;
  }
  const file = authProfilePhoto.files?.[0];
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    authProfilePhotoPreview.removeAttribute('src');
    authProfilePhotoPreview.hidden = true;
    return;
  }
  const previewUrl = URL.createObjectURL(file);
  authProfilePhotoPreview.dataset.objectUrl = previewUrl;
  authProfilePhotoPreview.src = previewUrl;
  authProfilePhotoPreview.hidden = false;
});
document.getElementById('authBackToSignIn').addEventListener('click', () => setAuthMode('signin'));
authConfirmPassword.addEventListener('input', () => {
  const passwordsMatch = authPassword.value === authConfirmPassword.value;
  authConfirmPassword.setCustomValidity(authConfirmPassword.value && !passwordsMatch ? authText('passwordsMismatch') : '');
  authConfirmPasswordHint.textContent = !authConfirmPassword.value
    ? ''
    : passwordsMatch ? authText('passwordsMatch') : authText('passwordsMismatch');
  authConfirmPasswordHint.dataset.match = String(passwordsMatch);
});
authPassword.addEventListener('input', () => {
  if (!authConfirmPassword.value) return;
  const passwordsMatch = authPassword.value === authConfirmPassword.value;
  authConfirmPassword.setCustomValidity(passwordsMatch ? '' : authText('passwordsMismatch'));
  authConfirmPasswordHint.textContent = passwordsMatch ? authText('passwordsMatch') : authText('passwordsMismatch');
  authConfirmPasswordHint.dataset.match = String(passwordsMatch);
});
document.querySelectorAll('.auth-password-toggle').forEach(button => {
  button.dataset.visible = 'false';
  button.addEventListener('click', () => {
    const passwordInput = document.getElementById(button.dataset.passwordTarget);
    const visible = passwordInput.type === 'password';
    passwordInput.type = visible ? 'text' : 'password';
    button.dataset.visible = String(visible);
    button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    button.title = visible ? 'Hide password' : 'Show password';
  });
});
authCountry.addEventListener('change', () => {
  const country = findSignupCountry(authCountry.value);
  authCountry.setCustomValidity(country ? '' : 'Choose a country from the suggestions.');
  updateSignupCountryDetails(country);
  if (!country) return;
  authCountry.value = country.name;
  authDialCode.value = country.code;
  syncDialSearch(country);
  authCurrency.value = window.TIME2INCOME_CURRENCY.resolveCurrency(country?.currencyCode)?.code
    || window.TIME2INCOME_CURRENCY.suggestCurrency(country.name)
    || 'USD';
  populateAuthCurrencyOptions();
});

let activeIdentityDocumentTypeIndex = -1;

function renderIdentityDocumentTypeOptions(query = '') {
  const search = query.trim().toLocaleLowerCase();
  const options = [...authIdentityDocumentTypeOptions.querySelectorAll('[data-document-type]')];
  options.forEach(option => {
    option.hidden = Boolean(search) && !option.dataset.documentType.toLocaleLowerCase().includes(search);
    option.removeAttribute('data-active');
    option.setAttribute('aria-selected', String(authIdentityDocumentType.value === option.dataset.documentType));
  });
  const customOption = authIdentityDocumentTypeOptions.querySelector('[data-custom-document-type]');
  if (customOption) customOption.remove();
  if (search && !options.some(option => option.dataset.documentType.toLocaleLowerCase() === search)) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'auth-country-option';
    option.id = 'authIdentityDocumentTypeOption-custom';
    option.setAttribute('role', 'option');
    option.dataset.customDocumentType = 'true';
    option.textContent = `Use "${authIdentityDocumentType.value.trim()}"`;
    option.addEventListener('click', () => selectIdentityDocumentType(authIdentityDocumentType.value.trim()));
    authIdentityDocumentTypeOptions.append(option);
  }
  activeIdentityDocumentTypeIndex = -1;
  authIdentityDocumentType.removeAttribute('aria-activedescendant');
}

function openIdentityDocumentTypeOptions(query = '') {
  renderIdentityDocumentTypeOptions(query);
  authIdentityDocumentTypeOptions.hidden = false;
  authIdentityDocumentType.setAttribute('aria-expanded', 'true');
  authIdentityDocumentTypeToggle.setAttribute('aria-expanded', 'true');
}

function closeIdentityDocumentTypeOptions() {
  authIdentityDocumentTypeOptions.hidden = true;
  authIdentityDocumentType.setAttribute('aria-expanded', 'false');
  authIdentityDocumentTypeToggle.setAttribute('aria-expanded', 'false');
  authIdentityDocumentType.removeAttribute('aria-activedescendant');
  activeIdentityDocumentTypeIndex = -1;
}

function selectIdentityDocumentType(value) {
  authIdentityDocumentType.value = value;
  closeIdentityDocumentTypeOptions();
  authIdentityDocumentType.focus();
}

function moveActiveIdentityDocumentTypeOption(direction) {
  const options = [...authIdentityDocumentTypeOptions.querySelectorAll('[role="option"]:not([hidden])')];
  if (!options.length) return;
  activeIdentityDocumentTypeIndex = (activeIdentityDocumentTypeIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.dataset.active = String(index === activeIdentityDocumentTypeIndex));
  const activeOption = options[activeIdentityDocumentTypeIndex];
  authIdentityDocumentType.setAttribute('aria-activedescendant', activeOption.id);
  activeOption.scrollIntoView({ block: 'nearest' });
}

authIdentityDocumentType.addEventListener('input', () => openIdentityDocumentTypeOptions(authIdentityDocumentType.value));
authIdentityDocumentType.addEventListener('click', () => {
  if (authIdentityDocumentTypeOptions.hidden) openIdentityDocumentTypeOptions(authIdentityDocumentType.value);
});
authIdentityDocumentType.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (authIdentityDocumentTypeOptions.hidden) openIdentityDocumentTypeOptions(authIdentityDocumentType.value);
    moveActiveIdentityDocumentTypeOption(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && !authIdentityDocumentTypeOptions.hidden) {
    const activeOption = authIdentityDocumentTypeOptions.querySelector('[data-active="true"]');
    if (activeOption) {
      event.preventDefault();
      activeOption.click();
    }
  } else if (event.key === 'Escape' && !authIdentityDocumentTypeOptions.hidden) {
    event.preventDefault();
    closeIdentityDocumentTypeOptions();
  }
});
authIdentityDocumentTypeToggle.addEventListener('click', () => {
  if (authIdentityDocumentTypeOptions.hidden) openIdentityDocumentTypeOptions(authIdentityDocumentType.value);
  else closeIdentityDocumentTypeOptions();
  authIdentityDocumentType.focus();
});
authIdentityDocumentTypeOptions.querySelectorAll('[data-document-type]').forEach(option => {
  option.addEventListener('click', () => selectIdentityDocumentType(option.dataset.documentType));
});

authCountry.addEventListener('input', () => {
  authCountry.setCustomValidity('');
  const country = findSignupCountryByName(authCountry.value);
  updateSignupCountryDetails(country);
  openCountryOptions(authCountry.value);
  if (!country) {
    authDialCode.value = '';
    syncDialSearch(null);
    authCurrency.value = '';
    authCurrencySearch.value = '';
    authCurrencySearch.setCustomValidity('');
    return;
  }
  authDialCode.value = country.code;
  syncDialSearch(country);
  authCurrency.value = window.TIME2INCOME_CURRENCY.resolveCurrency(country.currencyCode)?.code
    || window.TIME2INCOME_CURRENCY.suggestCurrency(country.name)
    || 'USD';
  populateAuthCurrencyOptions();
});
authCountry.addEventListener('click', () => {
  if (authCountryOptions.hidden) openCountryOptions('');
});
authCountry.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (authCountryOptions.hidden) openCountryOptions('');
    moveActiveCountryOption(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && !authCountryOptions.hidden) {
    const activeOption = authCountryOptions.querySelector('[data-active="true"]');
    if (activeOption) {
      event.preventDefault();
      activeOption.click();
    }
  } else if (event.key === 'Escape' && !authCountryOptions.hidden) {
    event.preventDefault();
    closeCountryOptions();
  }
});
authCountryToggle.addEventListener('click', () => {
  if (authCountryOptions.hidden) openCountryOptions('');
  else closeCountryOptions();
  authCountry.focus();
});
authCurrencySearch.addEventListener('input', () => {
  openCurrencyOptions(authCurrencySearch.value);
  const normalized = normalizeCountryName(authCurrencySearch.value);
  const currency = window.TIME2INCOME_CURRENCY.currencies.find(item =>
    normalizeCountryName(item.code) === normalized || normalizeCountryName(item.name) === normalized
  );
  authCurrency.value = currency?.code || '';
  authCurrencySearch.setCustomValidity(currency ? '' : 'Choose a supported currency.');
});
authCurrencySearch.addEventListener('click', () => {
  if (authCurrencyOptions.hidden) openCurrencyOptions('');
});
authCurrencySearch.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (authCurrencyOptions.hidden) openCurrencyOptions('');
    moveActiveCurrencyOption(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && !authCurrencyOptions.hidden) {
    const activeOption = authCurrencyOptions.querySelector('[data-active="true"]');
    if (activeOption) {
      event.preventDefault();
      activeOption.click();
    }
  } else if (event.key === 'Escape' && !authCurrencyOptions.hidden) {
    event.preventDefault();
    closeCurrencyOptions();
  }
});
authCurrencyToggle.addEventListener('click', () => {
  if (authCurrencyOptions.hidden) openCurrencyOptions('');
  else closeCurrencyOptions();
  authCurrencySearch.focus();
});
authDialSearch.addEventListener('input', () => {
  authDialCode.value = '';
  authDialSearch.setCustomValidity('Choose a country calling code.');
  openDialOptions(authDialSearch.value);
});
authDialSearch.addEventListener('click', () => {
  if (authDialOptions.hidden) openDialOptions('');
});
authDialSearch.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (authDialOptions.hidden) openDialOptions('');
    moveActiveDialOption(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && !authDialOptions.hidden) {
    const activeOption = authDialOptions.querySelector('[data-active="true"]');
    if (activeOption) {
      event.preventDefault();
      activeOption.click();
    }
  } else if (event.key === 'Escape' && !authDialOptions.hidden) {
    event.preventDefault();
    closeDialOptions();
  }
});
authDialToggle.addEventListener('click', () => {
  if (authDialOptions.hidden) openDialOptions('');
  else closeDialOptions();
  authDialSearch.focus();
});
document.addEventListener('pointerdown', event => {
  if (!authCountryPicker.contains(event.target)) closeCountryOptions();
  if (!authCurrencyPicker.contains(event.target)) closeCurrencyOptions();
  if (!authDialPicker.contains(event.target)) closeDialOptions();
  if (!authIdentityDocumentTypePicker.contains(event.target)) closeIdentityDocumentTypeOptions();
});
authDialCode.addEventListener('change', () => {
  const country = countryDirectory.find(item => item.code === authDialCode.value);
  if (country) {
    syncDialSearch(country);
    authCountry.value = country.name;
    updateSignupCountryDetails(country);
    authCurrency.value = window.TIME2INCOME_CURRENCY.resolveCurrency(country.currencyCode)?.code
      || window.TIME2INCOME_CURRENCY.suggestCurrency(country.name)
      || 'USD';
    populateAuthCurrencyOptions();
  } else {
    syncDialSearch(null);
  }
});
document.getElementById('forgotPasswordBtn').addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) {
    showAuthMessage(authText('enterEmail'), true);
    document.getElementById('authEmail').focus();
    return;
  }
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    showAuthMessage(authText('resetSent'));
  } catch (error) {
    showAuthMessage(error.message || authText('resetError'), true);
  }
});
authForm.addEventListener('submit', submitAuth);
document.querySelectorAll('[data-oauth-provider]').forEach(button => {
  button.addEventListener('click', () => startOAuthSignIn(button));
});
const authSkillOptions = document.getElementById('authSkillOptions');
function populateAuthSkillCategories() {
  const categoryByName = window.TIME2INCOME_SKILL_CATEGORIES;
  if (!categoryByName) throw new Error('Skill category data did not load.');
  const selectedCategory = authSkillCategory.value;
  const categoryCounts = new Map();
  Object.values(categoryByName).forEach(category => {
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  });
  (window.TIME2INCOME_SKILL_CATEGORY_NAMES || []).forEach(category => {
    if (!categoryCounts.has(category)) categoryCounts.set(category, 0);
  });
  const categoryPlaceholder = new Option(authText('categoryChoose'), '', true, true);
  categoryPlaceholder.disabled = true;
  authSkillCategory.replaceChildren(categoryPlaceholder);
  [...categoryCounts.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .forEach(([category, count]) => {
      authSkillCategory.add(new Option(`${category} (${count})`, category));
    });
  authSkillCategory.add(new Option(authText('skillCategoryOther'), OTHER_SIGNUP_UNCATEGORIZED));
  authSkillCategory.value = categoryCounts.has(selectedCategory) ||
    selectedCategory === OTHER_SIGNUP_UNCATEGORIZED ? selectedCategory : '';
  updateAuthSkillOptions();
}

function updateAuthSkillOptions() {
  const skillCategoryByName = window.TIME2INCOME_SKILL_CATEGORIES;
  const category = authSkillCategory.value;
  const query = authSkill.value.trim().toLocaleLowerCase();
  const matches = window.TIME2INCOME_SKILLS.filter(skill => {
    if (category === OTHER_SIGNUP_UNCATEGORIZED) {
      if (skillCategoryByName[skill]) return false;
    } else if (category && skillCategoryByName[skill] !== category) return false;
    if (!query) return true;
    const aliases = window.TIME2INCOME_SKILL_ALIASES[skill] || [];
    return `${skill} ${aliases.join(' ')}`.toLocaleLowerCase().includes(query);
  }).slice(0, 100);
  authSkillOptions.replaceChildren(...matches.map(skill => {
    const option = document.createElement('option');
    option.value = skill;
    const aliases = window.TIME2INCOME_SKILL_ALIASES[skill] || [];
    if (aliases.length) option.label = `${skill} · ${aliases.join(', ')}`;
    return option;
  }));
}
authSkillCategory.addEventListener('change', updateAuthSkillOptions);
authSkill.addEventListener('input', updateAuthSkillOptions);
authCatalogSuggestionKind.addEventListener('change', updateAuthCatalogSuggestionFields);
authCatalogSuggestionSkillCategory.addEventListener('change', updateAuthCatalogSuggestionFields);
populateAuthSkillCategories();
populateAuthCatalogSuggestionCategories();
window.TIME2INCOME_CATALOG_READY.then(populateAuthSkillCategories).catch(error => {
  console.error('Could not refresh signup skill categories:', error);
});
window.TIME2INCOME_CATALOG_READY.then(populateAuthCatalogSuggestionCategories).catch(error => {
  console.error('Could not refresh signup suggestion categories:', error);
});

signInTab.setAttribute('aria-controls', 'authForm');
signUpTab.setAttribute('aria-controls', 'authForm');
populateCountryOptions();
populateAuthLanguageOptions();
populateAuthCurrencyOptions();
authLanguage.addEventListener('change', () => {
  const mode = authMode;
  const isIdentityDocumentMode = identityDocumentMode;
  const currentUser = identityDocumentUser;
  const profileSetupUser = oauthProfileMode ? oauthProfileUser : null;
  applyAuthLanguage(authLanguage.value);
  if (profileSetupUser) enterOAuthProfileMode(profileSetupUser);
  else if (isIdentityDocumentMode) enterIdentityDocumentMode(currentUser);
  else setAuthMode(mode);
});
authLanguageSearch.addEventListener('input', () => openAuthLanguageOptions(authLanguageSearch.value));
authLanguageSearch.addEventListener('click', () => {
  if (authLanguageOptions.hidden) openAuthLanguageOptions('');
});
authLanguageSearch.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (authLanguageOptions.hidden) openAuthLanguageOptions('');
    moveActiveAuthLanguageOption(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && !authLanguageOptions.hidden) {
    const activeOption = authLanguageOptions.querySelector('[data-active="true"]');
    if (activeOption) {
      event.preventDefault();
      activeOption.click();
    }
  } else if (event.key === 'Escape' && !authLanguageOptions.hidden) {
    event.preventDefault();
    closeAuthLanguageOptions();
  }
});
authLanguageToggle.addEventListener('click', () => {
  if (authLanguageOptions.hidden) openAuthLanguageOptions('');
  else closeAuthLanguageOptions();
  authLanguageSearch.focus();
});
document.addEventListener('pointerdown', event => {
  if (!authLanguagePicker.contains(event.target)) closeAuthLanguageOptions();
});
setAuthMode(new URLSearchParams(window.location.search).get('mode'));
supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) throw error;
  return clearLegacyIdentityDocumentsOnce().then(() => data);
}).then(data => {
  if (data.session) return continueAfterIdentityCheck(data.session.user);
}).catch(error => {
  console.error('Session or platform access check failed:', error);
  showAuthMessage('Your session or account access could not be checked. Please refresh and try again.', true);
});
