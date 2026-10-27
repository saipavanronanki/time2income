
/* TIME2INCOME — Supabase-connected application
   Requires:
   1. Supabase JS v2 loaded in index.html
   2. supabase/client.js defining const supabaseClient
   3. Existing database schema and RLS policies
*/

'use strict';

const $ = id => document.getElementById(id);

if (typeof supabaseClient === 'undefined') {
  alert('Supabase client is unavailable. Check supabase/client.js.');
  throw new Error('supabaseClient is not defined');
}

let currentUser = null;
let currentSession = null;
let accountMode = 'signup';
let mode = 'hire';
let locale = 'en';
let preferredCurrency = 'INR';
let query = '';
let activeCategory = '';
let activeCategoryId = '';
let workQuery = '';
let toastTimer;
let realWorkers = [];
let workerDirectoryState = 'loading';
let searchLocationCoordinates = null;
let demoTasks = [];
let taskCategories = [];
let accountProfile = null;
let currentWorkerProfile = null;
let portfolioImagesDraft = [];
let selectedWorker = null;
let selectedTask = null;
let editingTaskId = null;
let taskOfferStatuses = {};
let openTasks = [];
let myTasks = [];
let bookingRecords = [];
let activeBookingChatId = null;
let bookingChatPoll = null;
let bookingChatWritable = false;

const translations = {
  en: {
    explore:'Explore', how:'How it works', earn:'Earn with your skills',
    providerPreview:'PROVIDER PREVIEW', sampleProvider:'Sample provider', exampleService:'Example service listing',
    previewOnly:'Preview only', oneProfile:'One profile', multipleWorkModes:'Multiple ways to work',
    allWorkTypes:'All work types', recommended:'Recommended', lowestRate:'Lowest rate', topRated:'Top rated',
    activityDisclaimer:'Only complete, published provider profiles appear in search. Booking requests are confirmed by the provider.',
    yourAccount:'YOUR ACCOUNT', marketplaceProfile:'Your marketplace profile', manageProfile:'Manage your customer and worker profile.',
    noTasksYet:'No tasks yet. Post your first task to get started.',
    noBookingsYet:'No booking requests yet. Choose a professional above.',
    providerProfile:'PROVIDER PROFILE', close:'Close',
    taskTitlePlaceholder:'e.g. Fix a leaking kitchen tap',
    taskDetailsPlaceholder:'Describe the work, timing and requirements',
    optional:'Optional', selectCountry:'Select or type country', cityOrRegion:'City or region',
    yourName:'Your name', emailPlaceholder:'you@example.com', passwordPlaceholder:'At least 8 characters',
    passwordNotice:'Your password is managed by Supabase Authentication. Never share your password with anyone.',
    signIn:'Sign in', signOut:'Sign out', join:'Join', accountAccess:'ACCOUNT ACCESS',
    myActivity:'My activity', myDashboard:'MY DASHBOARD',
    activityIntro:'View your posted tasks and booking requests.',
    openTasks:'Open tasks', openTasksIntro:'Find customer requests by city and work mode',
    refreshTasks:'Refresh tasks', refreshActivity:'Refresh activity',
    tasksIPosted:'Tasks I posted', taskHistory:'Your task history',
    editTask:'Edit task', cancelTaskPosting:'Delete task', postTaskTitle:'What do you need help with?',
    saveTaskChanges:'Save changes', taskUpdatedToast:'Task updated.',
    taskCancelledToast:'Task deleted from the open marketplace.',
    confirmCancelTask:'Delete this task from the marketplace? It will remain in your history as cancelled.',
    taskNoLongerEditable:'This task is no longer open and cannot be changed.',
    bookingRequests:'Booking requests', serviceRequests:'Your service requests',
    accountRolePrompt:'How will you use the platform?', bothRoles:'Both: hire and offer skills',
    languageSearch:'Search language', city:'City', country:'Country',
    workMode:'Work mode', allModes:'All modes', pricingType:'Pricing type',
    local:'Local', remote:'Remote', bothModes:'Local and remote',
    fixedPrice:'Fixed price', hourly:'Hourly', shift:'Shift',
    estimatedHours:'Estimated hours', schedule:'Schedule',
    postTask:'Post a task', sendOffer:'Send an offer', proposedPrice:'Your proposed price',
    messageToCustomer:'Message to the customer', offerCurrency:'Offer currency',
    accept:'Accept', decline:'Decline', cancelAction:'Cancel',
    budget:'Budget', budgetCurrency:'Budget currency', currency:'Currency',
    preferredCurrency:'Preferred currency', fullName:'Full name', emailAddress:'Email address',
    password:'Password', primarySkill:'Primary skill', hourlyRate:'Hourly rate',
    workPreference:'Work preference', languages:'Languages',
    forgotPassword:'Forgot password?', newPassword:'New password',
    resetPasswordTitle:'Reset your password', updatePassword:'Update password',
    passwordResetSentToast:'If an account exists for this address, reset instructions will be sent.',
    passwordUpdatedToast:'Password updated. Sign in with your new password.',
    passwordResetError:'Unable to send password reset instructions.',
    emailAlreadyRegistered:'An account with this email already exists. Sign in instead.',
    invalidCredentials:'Email or password is incorrect.', emailNotConfirmed:'Confirm your email before signing in.',
    expiredAuthLink:'This link has expired or is invalid. Request a new one.',
    networkError:'Network error. Check your connection and try again.',
    offers:'Offers', offerOne:'offer', offerMany:'offers', taskOffer:'TASK OFFER',
    booking:'Booking',
    bookingChat:'Open chat', privateBookingChat:'PRIVATE BOOKING CHAT',
    chatSafety:'Only the customer and provider on this booking can read these messages. Keep coordination here; never share passwords, verification codes, or payment details.',
    chatMessageLabel:'Message', chatMessagePlaceholder:'Write a message...',
    sendMessage:'Send message', refreshMessages:'Refresh messages',
    chatNoMessages:'No messages yet. Send a message to coordinate the booking.',
    chatActive:'Messaging is open for this booking.',
    chatReadOnly:'This booking has ended. You can view earlier messages, but cannot send new ones.',
    chatLoadError:'Unable to load booking messages.',
    chatSendError:'Unable to send this message. Check your connection and try again.',
    you:'You',
    startWork:'Start work', markWorkComplete:'Mark work complete',
    confirmWorkComplete:'Confirm work complete', reportIssue:'Report an issue',
    browseNextTasks:'Browse next tasks', postNextTask:'Post another task',
    leaveReview:'Leave a review', reviewed:'Reviewed', reviewPrompt:'Rating (1-5)?', reviewCommentPrompt:'Short comment (optional)', reviewThanks:'Thanks for your review!', reviewError:'Could not save the review.',
    status_completion_pending:'Awaiting customer confirmation',
    bookingStartedToast:'Work started. Keep updates in the booking chat.',
    completionRequestedToast:'Completion sent to the customer for confirmation.',
    completionConfirmedToast:'Work confirmed complete. You can move to your next task.',
    issueReportedToast:'Issue reported. Continue discussing it in the booking chat.',
    noOffers:'No offers yet.', noMessage:'No message included.', budgetByAgreement:'Price by agreement',
    makeOffer:'Make an offer', offerStatus:'Offer', priceByAgreement:'Price by agreement',
    noExtraDetails:'No extra details provided.', hour:'hour', rateOnRequest:'Rate available on request',
    requestedBy:'Requested by', provider:'Provider', invalidCurrency:'Choose a supported currency.',
    localLocationRequired:'Enter a country and city for local tasks.',
    budgetPreview:'Budget preview', conversionNote:'Converted values are estimates; the original amount is used for the task.',
    fxUpdating:'Updating exchange rates…', fxUnavailable:'Conversion unavailable; original amounts are shown.',
    fxEstimate:'Approximate rates from', updatedAt:'updated',
    publishedProfile:'Published provider profile',
    profileDraft:'Provider profile draft', publicProfile:'Public profile',
    profilePrivacy:'Your email and password are private. Only the details below appear in provider search.',
    allCategories:'All categories', onboardingCustomerTitle:'Hire someone for a task',
    onboardingCustomerBody:'Your account is ready. Post a clear task with scope, location, timing and budget, then review worker offers in My activity.',
    onboardingWorkerTitle:'Set up your worker profile',
    onboardingWorkerBody:'Add your skills, rate, work area and experience, then publish your profile to appear in search.',
    onboardingWorkerLiveTitle:'Your profile is published',
    onboardingWorkerLiveBody:'Browse open tasks, check the scope and budget, then send an offer. Keep coordination in the booking messages.',
    onboardingProgress:'Step {step} of 3', postFirstTask:'Post your first task',
    browseOpenTasks:'Browse open tasks', becomeWorker:'Offer your skills too',
    customerProfileReady:'Customer profile', saveCustomerProfile:'Save customer profile',
    customerProfileSavedToast:'Customer profile saved.',
    portfolioImages:'Work portfolio photos',
    portfolioImageGuidance:'Upload up to 6 JPEG, PNG or WebP images (5 MB max each). Images are public when your provider profile is published; only upload work photos you have permission to share.',
    noPortfolioImages:'No portfolio photos added yet.', removePortfolioImage:'Remove image',
    portfolioLimitError:'A maximum of 6 portfolio images is allowed.',
    portfolioTypeError:'Use JPEG, PNG or WebP images no larger than 5 MB each.',
    portfolioUploadError:'Unable to upload portfolio images.',
    displayName:'Display name', country:'Country', primarySkill:'Headline / primary skill',
    hourlyRate:'Hourly rate', preferredCurrency:'Preferred currency', languages:'Languages',
    languagesPlaceholder:'For example: English, Hindi',
    aboutService:'About your service', savePublish:'Save and publish', hideProfile:'Hide profile',
    workPreference:'Work preference',
    priceEstimate:'Approximate conversion, not a payment amount',
    status_open:'Open', status_assigned:'Assigned', status_in_progress:'In progress',
    status_completed:'Completed', status_cancelled:'Cancelled', status_requested:'Requested',
    status_accepted:'Accepted', status_declined:'Declined', status_rejected:'Rejected',
    status_withdrawn:'Withdrawn', status_confirmed:'Confirmed', status_disputed:'Disputed',
    language:'Language', languageSearch:'Search language', taskCountry:'Country', taskCity:'City or region', workMode:'Work mode',
    allModes:'All modes', pricingType:'Pricing type', fixedPrice:'Fixed price',
    hourly:'Hourly', shift:'Shift', estimatedHours:'Estimated hours', schedule:'Schedule',
    localTask:'Local task', remoteTask:'Remote task', budgetCurrency:'Budget currency',
    sendOffer:'Send an offer', messageToCustomer:'Message to the customer',
    noTasksMatch:'No open tasks match this city and work mode.',
    signInToTasks:'Sign in to browse open tasks.', signInToBookings:'Sign in to view booking requests.',
    originalAmount:'Original transaction amount',
    profilePublishedToast:'Your provider profile is published.', profileHiddenToast:'Your provider profile is hidden from search.',
    accountConfirmToast:'Account created. Check your email, then sign in.', accountCreatedToast:'Account created successfully.',
    signedInToast:'Signed in successfully.', taskOfferSentToast:'Offer sent to the customer.',
    offerAcceptedToast:'Offer accepted and task assigned.', offerDeclinedToast:'Offer declined.',
    bookingSentToast:'Booking request sent.', ownBookingError:'You cannot request a booking with your own profile.',
    directorySchemaError:'Supabase setup needs an update. Run supabase/upgrade-live-project.sql.',
    directoryLoadError:'Provider directory could not load. Check your Supabase setup.',
    updateOfferError:'Unable to update task offer.', sendOfferError:'Unable to send offer.',
    publishProfileError:'Unable to publish profile.', hideProfileError:'Unable to hide profile.',
    accountRequestError:'Unable to complete account request.', taskPostError:'Unable to post task.',
    bookingRequestError:'Unable to request booking.', bookingUpdateError:'Unable to update booking.',
    eyebrow:'A marketplace for time, skills and opportunity',
    headline:'Find the right skill.<br><em>Make every hour count.</em>',
    subhead:'Hire a professional for a few hours, find flexible work, or connect with talent anywhere.',
    needWork:'I need work done', findWork:'I want to find work',
    searchPlaceholder:'Try “plumber”, “logo designer”…',
    providerSearchPlaceholder:'Search open tasks by skill or category…',
    locationPlaceholder:'City or remote', search:'Search', popular:'Popular:',
    useMyLocation:'Use my location', searchLocationSearching:'Checking your location…',
    searchLocationFailed:'Could not get your location. Enter a city instead.',
    searchLocationActive:'Nearby providers will be ranked first. Your search location stays on this device for this session.',
    profileLocationHint:'Optional: share a coarse location, rounded to about 11 km, so nearby customers can find you. It is visible to signed-in marketplace users.',
    setProviderLocation:'Set approximate location', updateProviderLocation:'Update approximate location',
    clearProviderLocation:'Remove approximate location',
    providerLocationSet:'Approximate location set. Save your profile to apply it.',
    providerLocationCleared:'Approximate location removed. Save your profile to apply it.',
    providerLocationPermission:'Allow location access or enter a city manually.',
    providerLocationInvalid:'Set a valid approximate location, or remove both coordinates.',
    availableNow:'AVAILABLE NOW', startingAt:'Starting at', verified:'Verified',
    matchFound:'Great match found', matchSub:'Skills + availability',
    skillsDemo:'skills to discover', flexibleHours:'Flexible hours',
    localRemote:'Local & remote work', clearPricing:'Clear pricing',
    oneAccount:'One account, two roles', browseBySkill:'BROWSE BY SKILL',
    categoriesTitle:'What can we help you with?',
    categoriesSub:'Explore everyday help and professional skills in one place.',
    homeServicesDesc:'Plumbing, electrical, repairs', drivingDesc:'Drivers, pickups, moving',
    digitalDesc:'Design, editing, websites', officeDesc:'Admin, data entry, events',
    educationDesc:'Tutoring, coaching, languages', personalDesc:'Errands, packing, gardening',
    viewAll:'View all skills →', homeServices:'Home services',
    driving:'Driving & delivery', digital:'Digital & creative',
    office:'Office support', education:'Education', personal:'Personal help',
    readyToHelp:'READY TO HELP',
    professionalsTitle:'People with skills, ready to work',
    professionalsSub:'Published provider profiles appear here. Create a profile to start offering your skills.',
    appSectionKicker:'TIME2INCOME APP',
    appHeadline:'Take TIME2INCOME Anywhere.',
    appDescription:'Find opportunities, connect with skilled people and manage your work from your phone.',
    installApp:'Install App', continueWeb:'Continue on Web',
    googlePlay:'Google Play', appleAppStore:'Apple App Store', appComingSoon:'Coming soon',
    qrCodeLabel:'SCAN TO OPEN WEBSITE', installGuides:'Installation instructions',
    androidInstallGuide:'Android: use Install App when available, or choose Install app from your browser menu.',
    androidInstallHelp:'If the home screen icon does nothing: remove it, update Chrome, open this website in Chrome, then install it again. Website updates appear in the installed app when you reopen it online.',
    iosInstallGuide:'iPhone or iPad: open this site in Safari, tap Share, then Add to Home Screen.',
    noResults:'No matching providers', tryDifferent:'Try another skill or clear your filters.',
    clearFilters:'Clear filters', simpleSteps:'SIMPLE STEPS',
    browseCategories:'Browse categories', changeLocation:'Change location',
    footerMarketplace:'Marketplace', footerHelp:'Help & information',
    helpCenter:'Help', privacyPolicy:'Privacy Policy', termsOfService:'Terms of Service',
    browseSkills:'Browse skills', howItWorks:'How it works',
    clearSearch:'Clear search', loadingProviders:'Loading published providers…',
    providersLoadFailed:'Provider listings could not be loaded. Please try again.',
    noProvidersForLocation:'No published providers match this category in this location.',
    moreProvidersRemote:'Remote providers are included when they can work from anywhere.',
    providerRatingNone:'No reviews yet',
    categorySuggestion:'Category', category:'Category',
    providersFound:'{count} published provider(s)',
    providerOnboardingError:'Provider setup could not be opened. Please try again.',
    howTitle:'Work that fits your time',
    howSub:'From finding a skill to getting a task done, keep it simple.',
    step1Title:'Find or post a task',
    step1Body:'Search for a skill or describe what you need done.',
    step2Title:'Agree on time & price',
    step2Body:'Compare profiles and confirm the scope, schedule and rate.',
    step3Title:'Get it done',
    step3Body:'Complete the task, keep a record and share a review.',
    yourSkills:'YOUR SKILLS, YOUR SCHEDULE',
    ctaTitle:'Turn available hours into opportunities.',
    ctaBody:'Create a profile, show what you can do and discover work that fits your schedule.',
    becomeProvider:'Become a provider →', profileReady:'Your skills matter',
    profileSub:'Start with what you know',
    footerLine:'A marketplace for time, skills and opportunity.',
    poweredBy:'Powered by Spactisu',
    prototypeNotice:'Prototype in development',
    taskDialogKicker:'POST A TASK',
    taskDialogTitle:'What do you need help with?',
    taskTitleLabel:'Task title', taskDetailsLabel:'Details',
    taskCategoryLabel:'Category', taskBudgetLabel:'Budget',
    taskLocationLabel:'City or region', demoWarning:'Post a task to your account.',
    cancel:'Cancel', saveTask:'Post task', contact:'View profile',
    request:'Request booking', posted:'Task posted successfully.',
    profileDemo:'This is a demo profile. No real booking was sent.',
    signInDemo:'Please sign in to continue.',
    joinDemo:'Create your account to get started.',
    providerDemo:'Create your worker profile to offer your skills.',
    workModeNote:'Find work mode: explore jobs and skills.',
    hireModeNote:'Hire mode: search for a professional.',
    noSearch:'Enter a skill or choose a category.',
    incomeCalcKicker:'INCOME CALCULATOR',
    incomeCalcTitle:'Estimate your monthly earning potential',
    incomeCalcIntro:'Enter your available hours and hourly rate for a simple estimate. This is not a guarantee of income.',
    hoursPerWeek:'Hours per week',
    incomeRateLabel:'Rate per hour',
    weeksPerMonth:'Weeks worked per month',
    incomeEstimate:'Estimated monthly earning potential',
    estimateDisclaimer:'before fees or taxes',
    perMonth:'per month',
    incomeFinderKicker:'INCOME FINDER',
    incomeFinderTitle:'Find work ideas that fit your skills',
    incomeFinderIntro:'Choose your skills, available time and preferred work mode. These ideas are guidance, not a promise of income.',
    yourSkill:'Your skill',
    skillDigital:'Computer, design or writing',
    skillTeaching:'Teaching or tutoring',
    skillHome:'Home services or repairs',
    skillDriving:'Driving or delivery',
    skillPeople:'Customer or event support',
    availableTime:'Available time per week',
    timeLow:'Under 5 hours',
    timeMid:'5–15 hours',
    timeHigh:'More than 15 hours',
    workLocation:'Where would you like to work?',
    incomeFinderRemote:'Remote',
    incomeFinderLocal:'Local',
    ideaDigitalRemoteTitle:'Freelance design or writing',
    ideaDigitalRemoteText:'Create social media graphics, simple brand materials or written content for small businesses.',
    ideaDigitalLocalTitle:'Social media support for local businesses',
    ideaDigitalLocalText:'Help a nearby shop or service business plan and create useful posts.',
    ideaTeachingRemoteTitle:'Online tutoring',
    ideaTeachingRemoteText:'Teach a school subject or language in focused one-to-one or small-group sessions.',
    ideaTeachingLocalTitle:'Local tutoring',
    ideaTeachingLocalText:'Offer lessons or exam practice to learners in your neighbourhood.',
    ideaHomeRemoteTitle:'Create practical how-to guides',
    ideaHomeRemoteText:'Share clear instructions or short lessons about a home skill you know well.',
    ideaHomeLocalTitle:'Home repair and maintenance',
    ideaHomeLocalText:'Offer small, clearly scoped repairs or maintenance services in your area.',
    ideaDrivingRemoteTitle:'Delivery coordination',
    ideaDrivingRemoteText:'Help a local business organise delivery schedules and customer updates.',
    ideaDrivingLocalTitle:'Local driving and errands',
    ideaDrivingLocalText:'Offer short trips, pickups or delivery help when you are available.',
    ideaPeopleRemoteTitle:'Remote customer support',
    ideaPeopleRemoteText:'Help a small business respond to customer questions by chat or email.',
    ideaPeopleLocalTitle:'Event and moving support',
    ideaPeopleLocalText:'Assist with event setup, guest support, packing or moving tasks.',
    timeNoteLow:'With limited time, start with a small weekend or evening task.',
    timeNoteMid:'With a few free hours, focus on one service and build repeat customers.',
    timeNoteHigh:'With more availability, offer a clear set of services and keep your schedule manageable.',
    challengeKicker:'7-DAY WORK CHALLENGE',
    challengeTitle:'Take your first steps toward finding work',
    challengeIntro:'Complete each step at your own pace. Your progress is saved on this device.',
    challengeDay1:'Day 1: Choose one skill or service you can offer.',
    challengeDay2:'Day 2: Create your account and complete your profile.',
    challengeDay3:'Day 3: Add a clear photo or an example of your work.',
    challengeDay4:'Day 4: Set a fair rate for your time.',
    challengeDay5:'Day 5: Share your profile with people you trust.',
    challengeDay6:'Day 6: Send an offer on a task that matches your skills.',
    challengeDay7:'Day 7: Complete your first task and ask the customer for a review.',
    stepsComplete:'steps complete',
    shareWithFriends:'Share with friends',
    safetyKicker:'SAFETY',
    emergencyTitle:'Emergency help',
    emergencyIntro:'Choose a country to view emergency numbers. Numbers can change—confirm the right number for your location when possible.',
    emergencyCountryLabel:'Country',
    searchCountry:'Search or choose a country',
    shareLocation:'Share my location',
    emergencyAll:'All emergencies',
    emergencyPolice:'Police',
    emergencyAmbulance:'Ambulance',
    emergencyFire:'Fire',
    emergencyWomen:'Women’s helpline',
    emergencyPoliceAmbulanceFire:'Police, ambulance and fire',
    emergencyAmbulanceFire:'Ambulance and fire',
    emergencyAllAlt:'All emergencies (alternate)',
    emergencyAllMobile:'All emergencies (mobile)',
    emergencyRescueAmbulance:'Rescue and ambulance',
    emergencyAlt:'Alternate number',
    emergencyNoCountry:'Choose a country from the suggestions to view its emergency numbers.',
    emergencyCall:'Call',
    emergencyCountryNote:'If your country is not listed, check your local government or emergency-services website. Do not rely on a general number without confirming it works in your area.',
    locationUnavailable:'Location is not available in this browser.',
    locationSearching:'Finding your location…',
    locationNotFound:'Could not get your location. Turn on location services and allow access, then try again.',
    locationShareTitle:'My location',
    locationShareText:'I am here and need help:',
    tutorialKicker:'QUICK TOUR',
    tutorialTitle:'Take a guided tour of the marketplace',
    tutorialIntro:'Start the tour to see key features highlighted and explained in your selected language where available.',
    tutorialLanguageNote:'The tour follows your language selection at the top of the page.',
    startTour:'Start tour',
    stopTour:'Stop tour',
    tourVoiceUnavailable:'A voice for this language is not available on this device. Captions will still be shown.',
    tourExplore:'Explore skills and services, or search for a professional by name or category.',
    tourActivity:'View your posted tasks, bookings and offers. You can manage open tasks from your activity.',
    tourIncomeCalc:'Use the income calculator to estimate a monthly amount from your available hours and rate. It is only an estimate.',
    tourIncomeFinder:'Choose a skill and work mode to see practical ideas that may fit your schedule.',
    tourChallenge:'Use the seven-day challenge as a checklist to prepare your profile and start looking for work.',
    tourEmergency:'Choose your country to view emergency contact numbers. Confirm local details when possible.',
    tourFaq:'Read answers to common questions and practical safety guidance.',
    tourWorker:'Create a provider profile to share your skills and find work that fits your schedule.',
    faqKicker:'HELP & SUPPORT',
    faqTitle:'Frequently asked questions',
    faqFreeQuestion:'Is TIME2INCOME free to use?',
    faqFreeAnswer:'Creating an account and browsing are free. Online payments are not available yet, so agree on the price and payment method directly with the other person.',
    faqWorkQuestion:'How can I find work?',
    faqWorkAnswer:'Create a provider profile or send an offer on an open task. Customers can also send you a booking request.',
    faqIncomeQuestion:'Is income guaranteed?',
    faqIncomeAnswer:'No. Earnings depend on your skills, availability and demand. The calculator and finder provide estimates and ideas only.',
    faqSafetyQuestion:'How can I stay safe?',
    faqSafetyAnswer:'Agree on the details in the booking chat. Never share passwords, verification codes or bank details. Avoid large upfront payments and meet in a public place for a first in-person meeting.',
    faqReviewQuestion:'Who can leave a review?',
    faqReviewAnswer:'The customer can leave one review after a booking is completed.',
    categorySearchPlaceholder:'Search or choose a category',
    showSuggestions:'Show choices',
    noSuggestions:'No matching choices',
    shareMessage:'TIME2INCOME helps you find flexible work or hire local help.',
    shareLocationTitle:'My location',
    shareLocationText:'I am here and need help:'
  },
  hi: {
    explore:'खोजें', how:'कैसे काम करता है', earn:'अपनी स्किल से कमाएँ',
    providerPreview:'प्रोवाइडर का पूर्वावलोकन', sampleProvider:'नमूना प्रोवाइडर', exampleService:'सेवा का उदाहरण',
    previewOnly:'केवल पूर्वावलोकन', oneProfile:'एक प्रोफाइल', multipleWorkModes:'काम के कई तरीके',
    allWorkTypes:'सभी काम के प्रकार', recommended:'अनुशंसित', lowestRate:'सबसे कम दर', topRated:'सबसे अधिक रेटिंग',
    activityDisclaimer:'डेमो प्रोफाइल केवल उदाहरण हैं। असली बुकिंग प्रकाशित प्रोवाइडर से ही हो सकती है।',
    yourAccount:'आपका अकाउंट', marketplaceProfile:'आपकी मार्केटप्लेस प्रोफाइल', manageProfile:'अपनी ग्राहक और प्रोवाइडर प्रोफाइल प्रबंधित करें।',
    noTasksYet:'अभी कोई काम नहीं। पहला काम पोस्ट करें।', noBookingsYet:'अभी कोई बुकिंग नहीं। ऊपर से प्रोफेशनल चुनें।',
    providerProfile:'प्रोवाइडर प्रोफाइल', close:'बंद करें', taskTitlePlaceholder:'जैसे: रसोई का नल ठीक करें',
    taskDetailsPlaceholder:'काम, समय और ज़रूरतों का विवरण दें', optional:'वैकल्पिक',
    selectCountry:'देश चुनें या लिखें', cityOrRegion:'शहर या क्षेत्र', yourName:'आपका नाम',
    emailPlaceholder:'you@example.com', passwordPlaceholder:'कम से कम 8 अक्षर',
    passwordNotice:'आपका पासवर्ड Supabase Authentication संभालता है। इसे किसी से साझा न करें।',
    signIn:'साइन इन', join:'जुड़ें',
    eyebrow:'समय, कौशल और अवसरों का मार्केटप्लेस',
    headline:'सही कौशल खोजें।<br><em>हर घंटे को उपयोगी बनाएँ।</em>',
    subhead:'कुछ घंटों के लिए प्रोफेशनल खोजें या लचीला काम पाएँ।',
    needWork:'मुझे काम करवाना है', findWork:'मुझे काम चाहिए',
    searchPlaceholder:'जैसे प्लंबर, लोगो डिज़ाइनर…',
    locationPlaceholder:'शहर या रिमोट', search:'खोजें', popular:'लोकप्रिय:',
    helpCenter:'सहायता', privacyPolicy:'गोपनीयता नीति', termsOfService:'सेवा की शर्तें',
    useMyLocation:'मेरी लोकेशन इस्तेमाल करें',
    searchLocationSearching:'आपकी लोकेशन जाँची जा रही है…',
    searchLocationFailed:'लोकेशन नहीं मिली। इसके बजाय शहर लिखें।',
    searchLocationActive:'आस-पास के प्रोवाइडर पहले दिखेंगे। आपकी सर्च लोकेशन इस डिवाइस पर केवल इस सेशन तक रहेगी।',
    profileLocationHint:'वैकल्पिक: आस-पास के ग्राहकों को खोजने में मदद के लिए लगभग 11 किमी तक गोल की गई लोकेशन साझा करें। यह साइन-इन किए मार्केटप्लेस उपयोगकर्ताओं को दिखेगी।',
    setProviderLocation:'लगभग लोकेशन सेट करें',
    updateProviderLocation:'लगभग लोकेशन अपडेट करें',
    clearProviderLocation:'लगभग लोकेशन हटाएँ',
    providerLocationSet:'लगभग लोकेशन सेट है। लागू करने के लिए प्रोफाइल सेव करें।',
    providerLocationCleared:'लगभग लोकेशन हटाई गई। लागू करने के लिए प्रोफाइल सेव करें।',
    providerLocationPermission:'लोकेशन की अनुमति दें या शहर मैन्युअल रूप से लिखें।',
    providerLocationInvalid:'सही लगभग लोकेशन सेट करें या दोनों निर्देशांक हटाएँ।',
    availableNow:'अभी उपलब्ध', startingAt:'शुरुआती दर', verified:'सत्यापित',
    matchFound:'अच्छा मिलान मिला', matchSub:'कौशल + उपलब्धता',
    skillsDemo:'कौशल खोजें', flexibleHours:'लचीले घंटे',
    localRemote:'स्थानीय और रिमोट काम', clearPricing:'स्पष्ट कीमत',
    oneAccount:'एक अकाउंट, दो भूमिकाएँ', browseBySkill:'कौशल के अनुसार खोजें',
    categoriesTitle:'आपको किस काम में मदद चाहिए?',
    categoriesSub:'रोज़मर्रा की मदद और पेशेवर कौशल एक जगह खोजें।',
    viewAll:'सभी कौशल देखें →', homeServices:'घर की सेवाएँ',
    driving:'ड्राइविंग और डिलीवरी', digital:'डिजिटल और क्रिएटिव',
    office:'ऑफिस सहायता', education:'शिक्षा', personal:'व्यक्तिगत सहायता',
    readyToHelp:'मदद के लिए तैयार',
    professionalsTitle:'काम के लिए तैयार कुशल लोग',
    professionalsSub:'प्रकाशित प्रोवाइडर प्रोफाइल यहाँ दिखेंगी। अपनी स्किल देने के लिए प्रोफाइल बनाएँ।',
    noResults:'कोई प्रोफाइल नहीं मिली',
    tryDifferent:'दूसरा कौशल खोजें या फ़िल्टर हटाएँ।',
    clearFilters:'फ़िल्टर हटाएँ', simpleSteps:'आसान चरण',
    howTitle:'आपके समय के अनुसार काम',
    howSub:'कौशल खोजने से काम पूरा करने तक सब आसान रखें।',
    step1Title:'काम खोजें या पोस्ट करें',
    step1Body:'कौशल खोजें या अपनी ज़रूरत बताएँ।',
    step2Title:'समय और कीमत तय करें',
    step2Body:'प्रोफाइल की तुलना करके समय और दर तय करें।',
    step3Title:'काम पूरा करें',
    step3Body:'काम पूरा करें और समीक्षा दें।',
    androidInstallHelp:'अगर होम स्क्रीन आइकन से कुछ न खुले: आइकन हटाएँ, Chrome अपडेट करें, वेबसाइट को Chrome में खोलें और फिर ⋮ > Install app चुनकर दोबारा इंस्टॉल करें। वेबसाइट के बदलाव ऑनलाइन दोबारा खोलने पर ऐप में अपने-आप दिखेंगे।',
    yourSkills:'आपकी स्किल, आपका समय',
    ctaTitle:'खाली समय को अवसर में बदलें।',
    ctaBody:'प्रोफाइल बनाएँ और अपने समय के अनुसार काम खोजें।',
    becomeProvider:'प्रोवाइडर बनें →', profileReady:'आपकी स्किल मायने रखती है',
    profileSub:'जो आता है, वहीं से शुरू करें',
    footerLine:'समय, कौशल और अवसरों का मार्केटप्लेस।',
    poweredBy:'Spactisu द्वारा संचालित',
    prototypeNotice:'प्रोटोटाइप विकासाधीन है',
    taskDialogKicker:'काम पोस्ट करें',
    taskDialogTitle:'आपको किस काम में मदद चाहिए?',
    taskTitleLabel:'काम का शीर्षक', taskDetailsLabel:'विवरण',
    taskCategoryLabel:'कैटेगरी', taskBudgetLabel:'बजट',
    taskLocationLabel:'शहर या क्षेत्र', demoWarning:'काम अपने अकाउंट पर पोस्ट करें।',
    cancel:'रद्द करें', saveTask:'काम पोस्ट करें', contact:'प्रोफाइल देखें',
    editTask:'काम बदलें', cancelTaskPosting:'काम हटाएँ', postTaskTitle:'आपको किस काम में मदद चाहिए?',
    saveTaskChanges:'बदलाव सेव करें', taskUpdatedToast:'काम अपडेट हो गया।',
    taskCancelledToast:'काम खुले मार्केटप्लेस से हटा दिया गया।',
    confirmCancelTask:'क्या इस काम को मार्केटप्लेस से हटाएँ? यह इतिहास में रद्द किया हुआ दिखेगा।',
    taskNoLongerEditable:'यह काम अब खुला नहीं है, इसलिए इसे बदला नहीं जा सकता।',
    request:'बुकिंग अनुरोध', posted:'काम सफलतापूर्वक पोस्ट हुआ।',
    profileDemo:'यह डेमो प्रोफाइल है। असली बुकिंग नहीं भेजी गई।',
    signInDemo:'आगे बढ़ने के लिए साइन इन करें।',
    accountConfirmToast:'अकाउंट बन गया। ईमेल जाँचें, फिर साइन इन करें।',
    accountCreatedToast:'अकाउंट सफलतापूर्वक बन गया।', signedInToast:'साइन इन सफल हुआ।',
    profilePublishedToast:'आपकी प्रोवाइडर प्रोफाइल प्रकाशित है।', profileHiddenToast:'आपकी प्रोफाइल खोज से छिपी है।',
    taskOfferSentToast:'ग्राहक को ऑफ़र भेज दिया गया।', offerAcceptedToast:'ऑफ़र स्वीकार हुआ और काम सौंपा गया।',
    offerDeclinedToast:'ऑफ़र अस्वीकार किया गया।', bookingSentToast:'बुकिंग अनुरोध भेज दिया गया।',
    ownBookingError:'आप अपनी ही प्रोफाइल पर बुकिंग नहीं कर सकते।',
    directorySchemaError:'Supabase सेटअप अपडेट करें। upgrade-live-project.sql चलाएँ।',
    directoryLoadError:'प्रोवाइडर सूची लोड नहीं हुई। Supabase सेटअप जाँचें।',
    updateOfferError:'टास्क ऑफ़र अपडेट नहीं हो सका।', sendOfferError:'ऑफ़र नहीं भेजा जा सका।',
    publishProfileError:'प्रोफाइल प्रकाशित नहीं हुई।', hideProfileError:'प्रोफाइल छिपाई नहीं जा सकी।',
    accountRequestError:'अकाउंट अनुरोध पूरा नहीं हुआ।', taskPostError:'काम पोस्ट नहीं हुआ।',
    bookingRequestError:'बुकिंग अनुरोध नहीं भेजा जा सका।', bookingUpdateError:'बुकिंग अपडेट नहीं हुई।',
    joinDemo:'शुरू करने के लिए अकाउंट बनाएँ।',
    providerDemo:'अपनी स्किल देने के लिए वर्कर प्रोफाइल बनाएँ।',
    workModeNote:'काम खोजें मोड: काम और स्किल खोजें।',
    hireModeNote:'हायर मोड: प्रोफेशनल खोजें।',
    noSearch:'कौशल लिखें या कैटेगरी चुनें।'
  },
  gu: {
    explore:'શોધો', how:'કેવી રીતે કામ કરે છે', earn:'તમારી કુશળતાથી કમાઓ',
    providerPreview:'પ્રોવાઇડરનું પૂર્વાવલોકન', sampleProvider:'નમૂનાનો પ્રોવાઇડર', exampleService:'સેવાનું ઉદાહરણ',
    previewOnly:'માત્ર પૂર્વાવલોકન', oneProfile:'એક પ્રોફાઇલ', multipleWorkModes:'કામ કરવાની અનેક રીતો',
    allWorkTypes:'કામના બધા પ્રકાર', recommended:'ભલામણ કરેલ', lowestRate:'સૌથી ઓછો દર', topRated:'સૌથી વધુ રેટિંગ',
    activityDisclaimer:'ડેમો પ્રોફાઇલ માત્ર ઉદાહરણ છે. સાચી બુકિંગ પ્રકાશિત પ્રોવાઇડર માટે જ છે.',
    yourAccount:'તમારું એકાઉન્ટ', marketplaceProfile:'તમારી માર્કેટપ્લેસ પ્રોફાઇલ', manageProfile:'તમારી ગ્રાહક અને પ્રોવાઇડર પ્રોફાઇલ સંભાળો.',
    noTasksYet:'હજુ કોઈ કામ નથી. પહેલું કામ પોસ્ટ કરો.', noBookingsYet:'હજુ બુકિંગ નથી. ઉપરથી પ્રોફેશનલ પસંદ કરો.',
    providerProfile:'પ્રોવાઇડર પ્રોફાઇલ', close:'બંધ કરો', taskTitlePlaceholder:'જેમ કે: રસોડાનો નળ સુધારો',
    taskDetailsPlaceholder:'કામ, સમય અને જરૂરિયાતો લખો', optional:'વૈકલ્પિક',
    selectCountry:'દેશ પસંદ કરો અથવા લખો', cityOrRegion:'શહેર અથવા વિસ્તાર', yourName:'તમારું નામ',
    emailPlaceholder:'you@example.com', passwordPlaceholder:'ઓછામાં ઓછા 8 અક્ષર',
    passwordNotice:'તમારો પાસવર્ડ Supabase Authentication સંભાળે છે. તેને કોઈ સાથે શેર ન કરો.',
    signIn:'સાઇન ઇન', join:'જોડાઓ',
    eyebrow:'સમય, કુશળતા અને તકોનું માર્કેટપ્લેસ',
    headline:'યોગ્ય કુશળતા શોધો.<br><em>દરેક કલાકનો ઉપયોગ કરો.</em>',
    subhead:'થોડા કલાકો માટે નિષ્ણાત શોધો અથવા લવચીક કામ મેળવો.',
    needWork:'મારે કામ કરાવવું છે', findWork:'મારે કામ શોધવું છે',
    searchPlaceholder:'જેમ કે પ્લમ્બર, લોગો ડિઝાઇનર…',
    locationPlaceholder:'શહેર અથવા રિમોટ', search:'શોધો', popular:'લોકપ્રિય:',
    helpCenter:'મદદ', privacyPolicy:'ગોપનીયતા નીતિ', termsOfService:'સેવાની શરતો',
    useMyLocation:'મારું સ્થાન વાપરો',
    searchLocationSearching:'તમારું સ્થાન તપાસી રહ્યા છીએ…',
    searchLocationFailed:'સ્થાન મળી શક્યું નથી. તેના બદલે શહેર લખો.',
    searchLocationActive:'નજીકના પ્રોવાઇડર પહેલાં દેખાશે. તમારું શોધ સ્થાન આ ઉપકરણ પર ફક્ત આ સત્ર માટે રહેશે.',
    profileLocationHint:'વૈકલ્પિક: નજીકના ગ્રાહકો માટે લગભગ 11 કિમી સુધી ગોળ કરેલું સ્થાન શેર કરો. તે સાઇન-ઇન કરેલા માર્કેટપ્લેસ વપરાશકર્તાઓને દેખાશે.',
    setProviderLocation:'અંદાજિત સ્થાન સેટ કરો',
    updateProviderLocation:'અંદાજિત સ્થાન અપડેટ કરો',
    clearProviderLocation:'અંદાજિત સ્થાન દૂર કરો',
    providerLocationSet:'અંદાજિત સ્થાન સેટ થયું. લાગુ કરવા પ્રોફાઇલ સાચવો.',
    providerLocationCleared:'અંદાજિત સ્થાન દૂર થયું. લાગુ કરવા પ્રોફાઇલ સાચવો.',
    providerLocationPermission:'સ્થાનની મંજૂરી આપો અથવા શહેર જાતે લખો.',
    providerLocationInvalid:'યોગ્ય અંદાજિત સ્થાન સેટ કરો અથવા બંને કોઓર્ડિનેટ દૂર કરો.',
    availableNow:'હમણાં ઉપલબ્ધ', startingAt:'શરૂઆતનો દર', verified:'ચકાસાયેલ',
    matchFound:'યોગ્ય વ્યક્તિ મળી', matchSub:'કુશળતા + ઉપલબ્ધતા',
    skillsDemo:'કુશળતાઓ શોધો', flexibleHours:'લવચીક કલાકો',
    localRemote:'સ્થાનિક અને રિમોટ કામ', clearPricing:'સ્પષ્ટ કિંમત',
    oneAccount:'એક એકાઉન્ટ, બે ભૂમિકાઓ', browseBySkill:'કુશળતા પ્રમાણે શોધો',
    categoriesTitle:'તમને કઈ મદદ જોઈએ છે?',
    categoriesSub:'રોજિંદી મદદ અને વ્યાવસાયિક કુશળતાઓ એક જગ્યાએ શોધો.',
    viewAll:'બધી કુશળતાઓ જુઓ →', homeServices:'ઘરની સેવાઓ',
    driving:'ડ્રાઇવિંગ અને ડિલિવરી', digital:'ડિજિટલ અને ક્રિએટિવ',
    office:'ઓફિસ સહાય', education:'શિક્ષણ', personal:'વ્યક્તિગત સહાય',
    readyToHelp:'મદદ માટે તૈયાર',
    professionalsTitle:'કામ માટે તૈયાર કુશળ લોકો',
    professionalsSub:'પ્રકાશિત પ્રોવાઇડર પ્રોફાઇલ અહીં દેખાશે. તમારી કુશળતા આપવા પ્રોફાઇલ બનાવો.',
    noResults:'કોઈ પ્રોફાઇલ મળી નથી',
    tryDifferent:'બીજી કુશળતા શોધો અથવા ફિલ્ટર દૂર કરો.',
    clearFilters:'ફિલ્ટર દૂર કરો', simpleSteps:'સરળ પગલાં',
    howTitle:'તમારા સમયને અનુકૂળ કામ',
    howSub:'કુશળતા શોધવાથી કામ પૂરું કરવા સુધી બધું સરળ રાખો.',
    step1Title:'કામ શોધો અથવા પોસ્ટ કરો',
    step1Body:'કુશળતા શોધો અથવા તમારી જરૂરિયાત જણાવો.',
    step2Title:'સમય અને કિંમત નક્કી કરો',
    step2Body:'પ્રોફાઇલ સરખાવો અને દર નક્કી કરો.',
    step3Title:'કામ પૂરું કરો',
    step3Body:'કામ પૂર્ણ કરો અને સમીક્ષા આપો.',
    androidInstallHelp:'હોમ સ્ક્રીનના આઇકનથી કંઈ ન ખૂલે તો: આઇકન દૂર કરો, Chrome અપડેટ કરો, વેબસાઇટ Chromeમાં ખોલો અને ⋮ > Install app પસંદ કરીને ફરી ઇન્સ્ટોલ કરો. વેબસાઇટના ફેરફારો ઓનલાઇન ફરી ખોલતાં એપમાં આપમેળે દેખાશે.',
    yourSkills:'તમારી કુશળતા, તમારો સમય',
    ctaTitle:'ખાલી કલાકોને તકમાં ફેરવો.',
    ctaBody:'પ્રોફાઇલ બનાવો અને અનુકૂળ કામ શોધો.',
    becomeProvider:'પ્રોવાઇડર બનો →', profileReady:'તમારી કુશળતા મહત્વની છે',
    profileSub:'તમને જે આવડે છે ત્યાંથી શરૂ કરો',
    footerLine:'સમય, કુશળતા અને તકોનું માર્કેટપ્લેસ.',
    poweredBy:'Spactisu દ્વારા સંચાલિત',
    prototypeNotice:'પ્રોટોટાઇપ વિકાસ હેઠળ છે',
    taskDialogKicker:'કામ પોસ્ટ કરો',
    taskDialogTitle:'તમને કઈ મદદ જોઈએ છે?',
    taskTitleLabel:'કામનું શીર્ષક', taskDetailsLabel:'વિગતો',
    taskCategoryLabel:'શ્રેણી', taskBudgetLabel:'બજેટ',
    taskLocationLabel:'શહેર અથવા વિસ્તાર', demoWarning:'તમારા એકાઉન્ટ પર કામ પોસ્ટ કરો.',
    cancel:'રદ કરો', saveTask:'કામ પોસ્ટ કરો', contact:'પ્રોફાઇલ જુઓ',
    editTask:'કામ સંપાદિત કરો', cancelTaskPosting:'કામ કાઢી નાખો', postTaskTitle:'તમને કઈ મદદ જોઈએ છે?',
    saveTaskChanges:'ફેરફારો સાચવો', taskUpdatedToast:'કામ અપડેટ થયું.',
    taskCancelledToast:'કામ ખુલ્લા માર્કેટપ્લેસમાંથી દૂર થયું.',
    confirmCancelTask:'શું આ કામ માર્કેટપ્લેસમાંથી કાઢી નાખવું છે? તે ઇતિહાસમાં રદ થયેલું રહેશે.',
    taskNoLongerEditable:'આ કામ હવે ખુલ્લું નથી, તેથી તેમાં ફેરફાર કરી શકાતો નથી.',
    request:'બુકિંગ વિનંતી', posted:'કામ સફળતાપૂર્વક પોસ્ટ થયું.',
    profileDemo:'આ ડેમો પ્રોફાઇલ છે. વાસ્તવિક બુકિંગ મોકલાયું નથી.',
    signInDemo:'આગળ વધવા માટે સાઇન ઇન કરો.',
    accountConfirmToast:'એકાઉન્ટ બન્યું. ઇમેઇલ તપાસો, પછી સાઇન ઇન કરો.',
    accountCreatedToast:'એકાઉન્ટ સફળતાપૂર્વક બન્યું.', signedInToast:'સાઇન ઇન સફળ થયું.',
    profilePublishedToast:'તમારી પ્રોવાઇડર પ્રોફાઇલ પ્રકાશિત છે.', profileHiddenToast:'તમારી પ્રોફાઇલ શોધમાંથી છુપાઈ છે.',
    taskOfferSentToast:'ગ્રાહકને ઓફર મોકલાઈ.', offerAcceptedToast:'ઓફર સ્વીકારાઈ અને કામ સોંપાયું.',
    offerDeclinedToast:'ઓફર નકારાઈ.', bookingSentToast:'બુકિંગ વિનંતી મોકલાઈ.',
    ownBookingError:'તમે તમારી પોતાની પ્રોફાઇલ પર બુકિંગ કરી શકતા નથી.',
    directorySchemaError:'Supabase સેટઅપ અપડેટ કરો. upgrade-live-project.sql ચલાવો.',
    directoryLoadError:'પ્રોવાઇડર યાદી લોડ થઈ નથી. Supabase તપાસો.',
    updateOfferError:'કામની ઓફર અપડેટ થઈ નથી.', sendOfferError:'ઓફર મોકલાઈ નથી.',
    publishProfileError:'પ્રોફાઇલ પ્રકાશિત થઈ નથી.', hideProfileError:'પ્રોફાઇલ છુપાઈ નથી.',
    accountRequestError:'એકાઉન્ટ વિનંતી પૂર્ણ થઈ નથી.', taskPostError:'કામ પોસ્ટ થયું નથી.',
    bookingRequestError:'બુકિંગ વિનંતી મોકલી શકાઈ નથી.', bookingUpdateError:'બુકિંગ અપડેટ થયું નથી.',
    joinDemo:'શરૂ કરવા માટે એકાઉન્ટ બનાવો.',
    providerDemo:'તમારી કુશળતા આપવા માટે વર્કર પ્રોફાઇલ બનાવો.',
    workModeNote:'કામ શોધો મોડ: કામ અને કુશળતા શોધો.',
    hireModeNote:'હાયર મોડ: નિષ્ણાત શોધો.',
    noSearch:'કુશળતા લખો અથવા શ્રેણી પસંદ કરો.'
  }
};

function getLanguage(code = locale) {
  return window.TIME2INCOME_LOCALIZATION.languages.find(language => language.code === code) ||
    window.TIME2INCOME_LOCALIZATION.languages[0];
}

function resolveLanguage(value) {
  const needle = String(value || '').trim().toLocaleLowerCase();
  return window.TIME2INCOME_LOCALIZATION.languages.find(language =>
    [language.code, language.name, language.native].some(label => label.toLocaleLowerCase() === needle)
  ) || null;
}

function getFormatLocale() {
  return getLanguage().locale;
}

function t(key) {
  return translations[locale]?.[key] ||
    window.TIME2INCOME_LOCALIZATION.translations[locale]?.[key] ||
    translations.en[key] || key;
}

function addDatalistOption(list, value, label) {
  const option = document.createElement('option');
  option.value = value;
  if (label) option.label = label;
  list.appendChild(option);
}

function populateGlobalPickers() {
  const languageOptions = $('languageOptions');
  window.TIME2INCOME_LOCALIZATION.languages.forEach(language => {
    addDatalistOption(languageOptions, language.name, language.native);
  });

  const currencyOptions = $('currencyOptions');
  window.TIME2INCOME_CURRENCY.currencies.forEach(currency => {
    const symbol = window.TIME2INCOME_CURRENCY.symbolFor(currency.code);
    addDatalistOption(currencyOptions, currency.code, `${currency.name} (${currency.code} ${symbol})`);
  });

  const countryOptions = $('countryOptions');
  const countries = [...new Set(window.TIME2INCOME_CURRENCY.currencies.flatMap(currency => currency.countries))];
  countries.forEach(country => addDatalistOption(countryOptions, country.replace(/\b\w/g, letter => letter.toUpperCase())));
}

function setupSearchableDropdowns() {
  const initialized = new WeakSet();
  let closeOpenMenus = () => {};

  function enhance(input) {
    if (initialized.has(input)) return;
    const listId = input.getAttribute('list') || input.dataset.searchList;
    const source = listId ? $(listId) : null;
    if (!source) return;

    initialized.add(input);
    input.dataset.searchList = listId;
    input.removeAttribute('list');
    input.setAttribute('aria-haspopup', 'listbox');
    input.setAttribute('aria-expanded', 'false');

    const wrapper = document.createElement('span');
    wrapper.className = 'searchable-dropdown';
    if (input.classList.contains('currency-picker') || listId === 'currencyOptions') {
      wrapper.classList.add('searchable-dropdown-currency');
    }
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const toggle = document.createElement('button');
    toggle.className = 'searchable-dropdown-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', t('showSuggestions'));
    toggle.setAttribute('tabindex', '-1');
    toggle.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 7.5 4.5 4.5 4.5-4.5"/></svg>';
    wrapper.appendChild(toggle);

    const menu = document.createElement('div');
    menu.className = 'searchable-dropdown-menu';
    menu.id = `${input.id || listId}-suggestions`;
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    wrapper.appendChild(menu);
    input.setAttribute('aria-controls', menu.id);

    let activeIndex = -1;
    let filteredOptions = [];

    function close() {
      menu.hidden = true;
      activeIndex = -1;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      if (closeOpenMenus === close) closeOpenMenus = () => {};
    }

    function choose(option) {
      input.value = option.value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      input.focus();
    }

    function markActive(nextIndex) {
      activeIndex = nextIndex;
      [...menu.querySelectorAll('[role="option"]')].forEach((option, index) => {
        const active = index === activeIndex;
        option.classList.toggle('is-active', active);
        option.setAttribute('aria-selected', String(active));
      });
      const activeOption = menu.querySelector('[role="option"].is-active');
      if (activeOption) {
        input.setAttribute('aria-activedescendant', activeOption.id);
        activeOption.scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function render(showAll = false) {
      const needle = showAll ? '' : input.value.trim().toLocaleLowerCase();
      const options = [...source.options].map(option => ({
        value: option.value,
        label: option.label || option.value
      })).filter(option => option.value).filter(option => {
        if (!needle) return true;
        return `${option.value} ${option.label}`.toLocaleLowerCase().includes(needle);
      });
      const seen = new Set();
      filteredOptions = options.filter(option => {
        const key = `${option.value}\u0000${option.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      activeIndex = -1;
      menu.replaceChildren();

      if (!filteredOptions.length) {
        const empty = document.createElement('div');
        empty.className = 'searchable-dropdown-empty';
        empty.textContent = t('noSuggestions');
        menu.appendChild(empty);
      } else {
        filteredOptions.slice(0, 100).forEach((option, index) => {
          const button = document.createElement('button');
          button.className = 'searchable-dropdown-option';
          button.type = 'button';
          button.id = `${menu.id}-option-${index}`;
          button.setAttribute('role', 'option');
          button.setAttribute('aria-selected', 'false');
          button.textContent = option.label
            ? listId === 'currencyOptions' ? option.label : `${option.value} — ${option.label}`
            : option.value;
          button.addEventListener('pointerdown', event => event.preventDefault());
          button.addEventListener('click', () => choose(option));
          menu.appendChild(button);
        });
      }

      closeOpenMenus();
      menu.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      closeOpenMenus = close;
    }

    input.addEventListener('focus', () => render(true));
    input.addEventListener('input', () => render());
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowDown') {
        if (menu.hidden) render();
        if (filteredOptions.length) markActive(Math.min(activeIndex + 1, Math.min(filteredOptions.length, 100) - 1));
        event.preventDefault();
      } else if (event.key === 'ArrowUp' && !menu.hidden) {
        if (filteredOptions.length) markActive(Math.max(activeIndex - 1, 0));
        event.preventDefault();
      } else if (event.key === 'Enter' && !menu.hidden && activeIndex >= 0) {
        choose(filteredOptions[activeIndex]);
        event.preventDefault();
      }
    });
    toggle.addEventListener('click', () => {
      if (!menu.hidden) {
        close();
        input.focus();
      } else {
        input.focus();
        render(true);
      }
    });

    const observer = new MutationObserver(() => {
      if (!menu.hidden) render();
    });
    observer.observe(source, { childList: true, subtree: true });
  }

  document.querySelectorAll('input[list]').forEach(enhance);
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches('input[list], input[data-search-list]')) enhance(node);
      node.querySelectorAll?.('input[list], input[data-search-list]').forEach(enhance);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', event => {
    if (!event.target.closest('.searchable-dropdown')) closeOpenMenus();
  });
  window.addEventListener('time2income:displaychange', () => {
    document.querySelectorAll('.searchable-dropdown-toggle').forEach(button => {
      button.setAttribute('aria-label', t('showSuggestions'));
    });
    document.querySelectorAll('.searchable-dropdown-menu:not([hidden])').forEach(menu => {
      const empty = menu.querySelector('.searchable-dropdown-empty');
      if (empty) empty.textContent = t('noSuggestions');
    });
  });
}

function formatMoney(amount, originalCurrency = 'INR') {
  return window.TIME2INCOME_CURRENCY.formatDisplay(
    Number(amount), originalCurrency, preferredCurrency, getFormatLocale()
  );
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(getFormatLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatPluralCount(count, singularKey, pluralKey) {
  const rule = new Intl.PluralRules(getFormatLocale()).select(count);
  const label = t(rule === 'one' ? singularKey : pluralKey);
  return `${new Intl.NumberFormat(getFormatLocale()).format(count)} ${label}`;
}

function updateFxStatus() {
  const status = $('fxStatus');
  if (status) status.textContent = window.TIME2INCOME_CURRENCY.rateStatus(getFormatLocale(), {
    unavailable: t('fxUnavailable'), source: t('fxEstimate'), updated: t('updatedAt')
  });
}

function updateTaskBudgetPreview() {
  const amount = Number($('taskBudget').value);
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('taskCurrency').value);
  if (!Number.isFinite(amount) || $('taskBudget').value === '') {
    $('taskBudgetPreview').textContent = '';
    return;
  }
  $('taskBudgetPreview').textContent = currency
    ? `${t('budgetPreview')}: ${formatMoney(amount, currency.code)}. ${t('conversionNote')}`
    : t('invalidCurrency');
}

function applyCountrySuggestion(countryId, currencyId, updatePreference = false) {
  const suggested = window.TIME2INCOME_CURRENCY.suggestCurrency($(countryId).value);
  if (!suggested) return;
  $(currencyId).value = suggested;
  if (updatePreference) setPreferredCurrency(suggested);
  if (currencyId === 'taskCurrency') updateTaskBudgetPreview();
}

function normalizeCurrencyInput(input) {
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency(input.value);
  if (!currency) {
    input.value = preferredCurrency;
    return null;
  }
  input.value = currency.code;
  return currency.code;
}

async function refreshExchangeRates(force = false) {
  try {
    await window.TIME2INCOME_CURRENCY.loadRates(preferredCurrency, force);
  } catch (error) {
    console.warn('Currency conversion unavailable; showing original amounts.', error);
  }
  updateFxStatus();
  renderWorkers();
  if (currentUser) {
    renderActivity().catch(error => console.error('Activity currency refresh failed:', error));
    renderTaskBoard().catch(error => console.error('Task currency refresh failed:', error));
  }
}

function setPreferredCurrency(value, persist = true) {
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency(value);
  if (!currency) return false;
  preferredCurrency = currency.code;
  ['currencySelector', 'accountCurrency', 'profileCurrency'].forEach(id => {
    const input = $(id);
    if (input) input.value = currency.code;
  });
  window.dispatchEvent(new Event('time2income:displaychange'));
  try { localStorage.setItem('time2income_currency', preferredCurrency); }
  catch (error) { console.warn('Could not save preferred currency locally:', error); }
  refreshExchangeRates();
  if (persist && currentUser) saveUserPreferences();
  return true;
}

async function saveUserPreferences() {
  if (!currentUser) return;
  const { error } = await supabaseClient.from('profiles').update({
    preferred_language: locale,
    preferred_currency: preferredCurrency
  }).eq('id', currentUser.id);
  if (error) console.error('Could not save localization preferences:', error);
}

function suggestFormCurrency(country, targetId) {
  const suggestion = window.TIME2INCOME_CURRENCY.suggestCurrency(country);
  if (!suggestion) return;
  const target = $(targetId);
  if (target) target.value = suggestion;
}

function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
}

function toast(message) {
  const el = $('toast');
  if (!el) {
    console.log(message);
    return;
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

function applyLanguage(value, persist = true) {
  const language = resolveLanguage(value);
  if (!language) {
    $('language').value = getLanguage().name;
    return false;
  }
  locale = language.code;
  document.documentElement.lang = language.locale;
  document.documentElement.dir = language.dir || 'ltr';
  $('language').value = language.name;
  if (persist) {
    try { localStorage.setItem('time2income_language', locale); }
    catch (error) { console.warn('Could not save language locally:', error); }
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = t(el.dataset.i18n);
    if (value.includes('<br>') || value.includes('<em>')) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  renderWorkers();
  renderAccount();
  renderActivity().catch(error => console.error('Localized activity render failed:', error));
  renderTaskBoard().catch(error => console.error('Localized task board render failed:', error));
  updateFxStatus();
  window.dispatchEvent(new Event('time2income:displaychange'));
  if (persist && currentUser) saveUserPreferences();
  return true;
}

function getAllWorkers() {
  return realWorkers;
}

function updateMarketplaceSuggestions() {
  const list = $('marketplaceSearchOptions');
  if (!list) return;
  const categoryIds = new Set(mode === 'work'
    ? openTasks.map(task => task.category_id).filter(Boolean)
    : realWorkers.map(worker => worker.categoryId).filter(Boolean));
  const options = [];
  taskCategories
    .filter(category => categoryIds.has(category.id))
    .forEach(category => options.push({ value: category.name, label: t('categorySuggestion') }));

  if (mode === 'work') {
    openTasks.forEach(task => {
      if (task.title) options.push({ value: task.title, label: task.category || t('openTasks') });
    });
  } else {
    realWorkers
      .filter(worker => !activeCategoryId || worker.categoryId === activeCategoryId)
      .forEach(worker => (worker.tags || []).forEach(skill => {
        if (skill) options.push({ value: skill, label: worker.category });
      }));
  }

  const seen = new Set();
  list.replaceChildren();
  options.forEach(option => {
    const key = option.value.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    addDatalistOption(list, option.value, option.label);
  });
}

function renderMarketplaceFilterSummary() {
  const summary = $('marketplaceFilterSummary');
  if (!summary) return;
  const parts = [];
  if (activeCategoryId) {
    const category = taskCategories.find(item => item.id === activeCategoryId);
    if (category) {
      const chip = document.createElement('button');
      chip.className = 'marketplace-filter-chip';
      chip.type = 'button';
      chip.dataset.clearCategory = 'true';
      chip.textContent = `${t('category')}: ${category.name} ×`;
      parts.push(chip);
    }
  }
  if ($('searchInput').value.trim()) {
    const clearButton = document.createElement('button');
    clearButton.className = 'marketplace-filter-chip';
    clearButton.type = 'button';
    clearButton.dataset.clearSearch = 'true';
    clearButton.textContent = `${t('clearSearch')}: ${$('searchInput').value.trim()} ×`;
    parts.push(clearButton);
  }
  summary.replaceChildren(...parts);
}

function providerLocationRank(provider, location, coordinates) {
  if (coordinates) {
    if (provider.type === 'Remote') return 2;
    return Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude) ? 0 : 1;
  }
  if (location) {
    if (provider.city?.toLocaleLowerCase().includes(location)) return 0;
    if (provider.type === 'Remote') return 1;
    return 2;
  }
  return provider.type === 'Remote' ? 1 : 0;
}

function providerDistanceKm(provider, coordinates) {
  if (!coordinates || !Number.isFinite(provider.latitude) || !Number.isFinite(provider.longitude)) {
    return Number.POSITIVE_INFINITY;
  }
  const radians = degrees => degrees * Math.PI / 180;
  const latitudeDelta = radians(provider.latitude - coordinates.latitude);
  const longitudeDelta = radians(provider.longitude - coordinates.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(coordinates.latitude)) * Math.cos(radians(provider.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  const clamped = Math.min(1, Math.max(0, a));
  return 6371 * 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}

function readApproximateLocation() {
  if (!navigator.geolocation) return Promise.reject(new Error(t('locationUnavailable')));
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }, () => reject(new Error(t('searchLocationFailed'))), {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 12000
    });
  });
}

function providerQualityScore(provider) {
  return provider.qualityScore || 0;
}

function interleaveUnreviewedProviders(providers, location, coordinates) {
  const locationGroups = new Map();
  providers.forEach(provider => {
    const locationRank = providerLocationRank(provider, location, coordinates);
    const distanceBand = coordinates && locationRank === 0
      ? Math.floor(providerDistanceKm(provider, coordinates) / 10)
      : 0;
    const groupKey = `${locationRank}:${distanceBand}`;
    if (!locationGroups.has(groupKey)) {
      locationGroups.set(groupKey, { locationRank, distanceBand, providers: [] });
    }
    locationGroups.get(groupKey).providers.push(provider);
  });

  const day = new Date().toISOString().slice(0, 10);
  const dailyRotationRank = provider => {
    let hash = 2166136261;
    for (const character of `${day}:${provider.id}`) {
      hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    }
    return hash >>> 0;
  };
  const result = [];

  [...locationGroups.values()]
    .sort((a, b) => a.locationRank - b.locationRank || a.distanceBand - b.distanceBand)
    .forEach(({ providers: group }) => {
    const distanceOrder = (a, b) => providerDistanceKm(a, coordinates) - providerDistanceKm(b, coordinates);
    const reviewed = group.filter(provider => provider.reviewCount > 0)
      .sort((a, b) =>
        distanceOrder(a, b) ||
        providerQualityScore(b) - providerQualityScore(a) ||
        b.profileCompleteness - a.profileCompleteness
      );
    const unreviewed = group.filter(provider => !provider.reviewCount)
      .sort((a, b) => distanceOrder(a, b) || dailyRotationRank(a) - dailyRotationRank(b));

    while (reviewed.length || unreviewed.length) {
      result.push(...reviewed.splice(0, 3));
      if (unreviewed.length) result.push(unreviewed.shift());
    }
  });

  return result;
}

function renderWorkers() {
  const grid = $('workerGrid');
  if (!grid) return;

  const type = $('typeFilter')?.value || 'all';
  const sort = $('sortFilter').value;
  const location = $('locationInput').value.trim().toLocaleLowerCase();
  const locationCoordinates = searchLocationCoordinates;
  const status = $('marketplaceResultsStatus');
  const empty = $('emptyState');
  if (workerDirectoryState === 'loading') {
    grid.replaceChildren();
    status.textContent = t('loadingProviders');
    empty.classList.add('hidden');
    renderMarketplaceFilterSummary();
    return;
  }
  if (workerDirectoryState === 'error') {
    grid.replaceChildren();
    status.textContent = t('providersLoadFailed');
    empty.classList.add('hidden');
    renderMarketplaceFilterSummary();
    return;
  }

  let list = getAllWorkers().filter(p => {
    const searchable = [
      p.name, p.skill, p.category, p.city, p.description,
      ...(p.tags || []), ...(p.languages || [])
    ].join(' ').toLowerCase();

    const matchesQuery = !query || searchable.includes(query.toLowerCase());
    const matchesCategory = !activeCategoryId || p.categoryId === activeCategoryId;
    const matchesType = type === 'all' || p.type === type ||
      p.type === 'Both' && ['Local', 'Remote'].includes(type);
    const matchesLocation = !location ||
      (p.city || '').toLocaleLowerCase().includes(location) ||
      (p.country || '').toLocaleLowerCase() === location ||
      p.type === 'Remote';

    return matchesQuery && matchesCategory && matchesType && matchesLocation;
  });

  if (sort === 'price') list.sort((a,b) => a.rate - b.rate);
  if (sort === 'rating') list.sort((a,b) => providerQualityScore(b) - providerQualityScore(a));
  if (sort === 'recommended') {
    list = interleaveUnreviewedProviders(list, location, locationCoordinates);
  }

  grid.innerHTML = list.map(p => {
    const initials = p.initials || (p.name || 'U')
      .split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
    const tags = [...(p.tags || []), ...(p.languages || []).map(language => `${t('languages')}: ${language}`)].map(tag =>
      `<span class="skill-tag">${safeText(tag)}</span>`
    ).join('');
    const portfolioPhotos = (p.portfolioImages || []).slice(0, 4).map((url, index) =>
      `<img src="${safeText(url)}" alt="${safeText(p.name)} portfolio image ${index + 1}" loading="lazy">`
    ).join('');

    return `
      <article class="worker-card">
        <div class="worker-card-top">
          <div class="worker-meta">
            <h3>${safeText(p.name)}</h3>
            <p>${safeText(p.skill)} · ${safeText(p.city || p.country || 'Remote')}</p>
          </div>
          <span class="rating">${p.reviewCount ? `★ ${Number(p.rating).toFixed(1)} (${p.reviewCount})` : t('providerRatingNone')}</span>
        </div>
        <p class="worker-description">${safeText(p.description || p.bio || 'Marketplace service provider.')}</p>
        ${portfolioPhotos ? `<div class="worker-portfolio-gallery" aria-label="${t('portfolioImages')}">${portfolioPhotos}</div>` : ''}
        <div class="tag-row">${tags}</div>
        <div class="worker-bottom">
          <div class="worker-price">
            <small>${t('startingAt')}</small>
            <strong>${p.rate ? safeText(window.TIME2INCOME_CURRENCY.formatDisplay(Number(p.rate), p.currency || 'INR', 'INR', 'en-IN')) : 'Contact'} <small>${p.rate ? '/ hr' : ''}</small></strong>
          </div>
          <span class="work-type">${safeText(p.type || 'Remote')}</span>
        </div>
        <div class="worker-actions">
          <button class="btn btn-outline" data-save-worker="${safeText(p.id)}" type="button" aria-pressed="${isSavedWorker(p.id)}" aria-label="Save provider">${isSavedWorker(p.id) ? '♥' : '♡'}</button>
          <button class="btn btn-outline" data-action="profile" data-id="${safeText(p.id)}" type="button">${t('contact')}</button>
          <button class="btn btn-primary" data-action="book" data-id="${safeText(p.id)}" type="button">${t('request')}</button>
        </div>
      </article>
    `;
  }).join('');

  status.textContent = list.length ? t('providersFound').replace('{count}', String(list.length)) : '';
  empty.classList.toggle('hidden', list.length > 0);
  $('emptyStateTitle').textContent = t('noResults');
  $('emptyStateMessage').textContent = location
    ? t('noProvidersForLocation')
    : t('tryDifferent');
  $('changeLocationBtn').classList.toggle('hidden', !location);
  renderMarketplaceFilterSummary();
}

function renderPortfolioPreview(paths) {
  if (!paths.length) return `<p class="portfolio-empty">${t('noPortfolioImages')}</p>`;
  return paths.map((path, index) => {
    const url = supabaseClient.storage.from('worker-portfolio').getPublicUrl(path).data.publicUrl;
    return `<figure class="portfolio-editor-item"><img src="${safeText(url)}" alt="${t('portfolioImages')} ${index + 1}" loading="lazy"><button class="portfolio-remove" type="button" data-remove-portfolio-image="${index}" aria-label="${t('removePortfolioImage')}">×</button></figure>`;
  }).join('');
}

async function loadRealWorkers() {
  workerDirectoryState = 'loading';
  renderWorkers();
  try {
    const { data, error } = await supabaseClient
      .from('worker_profiles')
      .select(`
        user_id, headline, skills, bio, category_id, service_languages, portfolio_images, work_preference,
        service_latitude, service_longitude,
        hourly_rate, currency_code, service_city, service_country
      `)
      .eq('is_published', true);

    if (error) throw error;

    const userIds = [...new Set((data || []).map(w => w.user_id).filter(Boolean))];
    const categoryIds = [...new Set((data || []).map(w => w.category_id).filter(Boolean))];
    let profilesById = {};
    let categoriesById = {};

    if (userIds.length) {
      const { data: profiles, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profileError) throw profileError;

      profilesById = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      );
    }

    if (categoryIds.length) {
      const { data: categories, error: categoryError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);
      if (categoryError) throw categoryError;
      categoriesById = Object.fromEntries((categories || []).map(category => [category.id, category.name]));
    }

    // ratings are optional: ignore failures if the reviews table is unavailable
    const ratingsByWorker = {};
    let reviewTotal = 0;
    let reviewCount = 0;
    if (userIds.length) {
      const { data: reviewRows, error: reviewError } = await supabaseClient
        .from('reviews').select('worker_id, rating').in('worker_id', userIds);
      if (!reviewError) {
        (reviewRows || []).forEach(r => {
          const rating = Number(r.rating);
          if (!(rating >= 1 && rating <= 5)) return;
          const entry = ratingsByWorker[r.worker_id] || (ratingsByWorker[r.worker_id] = { sum: 0, count: 0 });
          entry.sum += rating;
          entry.count += 1;
          reviewTotal += rating;
          reviewCount += 1;
        });
      }
    }

    const priorRating = reviewCount ? reviewTotal / reviewCount : 0;
    realWorkers = (data || []).map(w => {
      const p = profilesById[w.user_id] || {};
      const name = p.display_name || '';
      const stats = ratingsByWorker[w.user_id];
      const category = categoriesById[w.category_id] || '';
      const workType = w.work_preference === 'both'
        ? 'Both'
        : w.work_preference === 'remote' ? 'Remote' : 'Local';
      const skills = Array.isArray(w.skills) ? w.skills.filter(Boolean) : [];
      const headline = String(w.headline || '').trim();
      const city = String(w.service_city || '').trim();
      const country = String(w.service_country || '').trim();
      const rate = Number(w.hourly_rate);
      const isComplete = name.trim() && headline && w.category_id && category &&
        String(w.bio || '').trim() && country && Number.isFinite(rate) && rate > 0 &&
        (workType === 'Remote' || city);
      if (!isComplete) return null;
      const actualRating = stats ? stats.sum / stats.count : 0;

      return {
        id: w.user_id,
        name,
        initials: name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase(),
        skill: headline,
        categoryId: w.category_id,
        category,
        city,
        country,
        latitude: w.service_latitude === null ? null : Number(w.service_latitude),
        longitude: w.service_longitude === null ? null : Number(w.service_longitude),
        rate,
        currency: w.currency_code || 'INR',
        languages: w.service_languages || [],
        rating: actualRating,
        reviewCount: stats ? stats.count : 0,
        qualityScore: stats
          ? (stats.sum + priorRating * 5) / (stats.count + 5)
          : 0,
        profileCompleteness: [
          name.trim(), headline, category, String(w.bio || '').trim(),
          country, city, Number.isFinite(rate) && rate > 0
        ].filter(Boolean).length,
        type: workType,
        description: String(w.bio || '').trim(),
        portfolioImages: (w.portfolio_images || []).map(path =>
          supabaseClient.storage.from('worker-portfolio').getPublicUrl(path).data.publicUrl
        ),
        tags: skills,
        color: '#dceafa'
      };
    }).filter(Boolean);

    workerDirectoryState = 'ready';
    updateMarketplaceSuggestions();
    renderWorkers();
  } catch (error) {
    console.error('Worker directory load failed:', error);
    workerDirectoryState = 'error';
    renderWorkers();
    if (error.code === '42703') {
      toast(t('directorySchemaError'));
    } else {
      toast(t('directoryLoadError'));
    }
  }
}

function setMode(nextMode) {
  mode = nextMode === 'work' ? 'work' : 'hire';
  $('useSearchLocation').hidden = mode === 'work';
  $('searchLocationStatus').hidden = mode === 'work';
  document.querySelectorAll('.mode-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  $('searchInput').placeholder = t(mode === 'work' ? 'providerSearchPlaceholder' : 'searchPlaceholder');
  const value = $('searchInput').value.trim();
  const matchedCategory = taskCategories.find(category =>
    category.name.toLocaleLowerCase() === value.toLocaleLowerCase()
  );
  if (mode === 'work') {
    activeCategory = '';
    activeCategoryId = '';
    query = '';
    $('taskCategoryFilter').value = matchedCategory?.name || '';
    workQuery = matchedCategory ? '' : value;
    renderTaskBoard().catch(error => toast(error.message));
  } else {
    $('taskCategoryFilter').value = '';
    workQuery = '';
    if (matchedCategory) {
      activeCategoryId = matchedCategory.id;
      activeCategory = matchedCategory.name;
      query = '';
    } else {
      activeCategoryId = '';
      activeCategory = '';
      query = value;
    }
    renderWorkers();
  }
  updateMarketplaceSuggestions();
  renderMarketplaceFilterSummary();
}

function openTaskDialog() {
  if (!currentUser) {
    openAccountDialog('signin');
    toast(t('signInDemo'));
    return;
  }
  $('taskForm').reset();
  $('taskCurrency').value = preferredCurrency;
  $('taskCountry').required = $('taskWorkMode').value === 'local';
  $('taskLocation').required = $('taskWorkMode').value === 'local';
  editingTaskId = null;
  $('taskDialog').querySelector('[data-i18n="taskDialogKicker"]').textContent = t('taskDialogKicker');
  $('taskDialog').querySelector('[data-i18n="taskDialogTitle"]').textContent = t('postTaskTitle');
  $('taskForm').querySelector('button[type="submit"]').textContent = t('saveTask');
  updateTaskBudgetPreview();
  $('taskDialog').showModal();
}

function openTaskForEditing(task) {
  if (!currentUser || task.customer_id !== currentUser.id || task.status !== 'open') return;
  editingTaskId = task.id;
  $('taskTitle').value = task.title || '';
  $('taskDetails').value = task.description || '';
  $('taskCategory').value = taskCategories.find(category => category.id === task.category_id)?.name || '';
  $('taskWorkMode').value = task.work_mode || 'local';
  $('taskPricingType').value = task.pricing_type || 'fixed';
  $('taskEstimatedHours').value = task.estimated_hours ?? '';
  $('taskBudget').value = task.budget ?? '';
  $('taskCurrency').value = task.currency_code || preferredCurrency;
  $('taskCountry').value = task.country || '';
  $('taskLocation').value = task.city || '';
  $('taskScheduledStart').value = task.scheduled_start
    ? new Date(new Date(task.scheduled_start).getTime() - new Date(task.scheduled_start).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : '';
  $('taskCountry').required = task.work_mode === 'local';
  $('taskLocation').required = task.work_mode === 'local';
  $('taskDialog').querySelector('[data-i18n="taskDialogKicker"]').textContent = t('editTask');
  $('taskDialog').querySelector('[data-i18n="taskDialogTitle"]').textContent = t('editTask');
  $('taskForm').querySelector('button[type="submit"]').textContent = t('saveTaskChanges');
  updateTaskBudgetPreview();
  $('taskDialog').showModal();
}

function openAccountDialog(nextMode = 'signup', role) {
  accountMode = nextMode;
  if (role) $('accountRole').value = role;
  else if (nextMode === 'signup') $('accountRole').value = 'both';
  const isSignup = accountMode === 'signup';
  const isSignin = accountMode === 'signin';
  const isRecovery = accountMode === 'recovery';
  const nameLabel = $('accountName').closest('label');
  nameLabel.hidden = !isSignup;
  $('accountName').required = isSignup;
  $('accountEmail').closest('label').hidden = isRecovery;
  $('accountEmail').required = !isRecovery;
  $('accountLocationFields').hidden = !isSignup;
  $('accountCountry').required = isSignup;
  $('accountCurrencyField').hidden = !isSignup;
  $('accountCurrency').required = isSignup;
  $('accountRoleField').hidden = !isSignup;
  $('workerFields').classList.toggle('hidden', !isSignup || $('accountRole').value === 'client');
  $('accountPassword').required = true;
  $('accountPassword').autocomplete = isSignup || isRecovery ? 'new-password' : 'current-password';
  $('passwordLabel').querySelector('span').textContent = isRecovery ? t('newPassword') : t('password');
  $('forgotPasswordBtn').hidden = !isSignin;
  $('accountDialogTitle').textContent = isSignup ? t('joinDemo') : isRecovery ? t('resetPasswordTitle') : t('signIn');
  $('accountSubmitBtn').textContent = isSignup ? t('join') : isRecovery ? t('updatePassword') : t('signIn');
  $('accountDialog').showModal();
}

function authErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || error?.status || '').toLowerCase();
  if (code.includes('user_already_exists') || message.includes('already registered') || message.includes('already exists')) return t('emailAlreadyRegistered');
  if (code.includes('invalid_credentials') || message.includes('invalid login credentials')) return t('invalidCredentials');
  if (code.includes('email_not_confirmed') || message.includes('email not confirmed')) return t('emailNotConfirmed');
  if (code.includes('otp_expired') || message.includes('expired') || message.includes('invalid token')) return t('expiredAuthLink');
  if (!navigator.onLine || message.includes('network') || message.includes('fetch')) return t('networkError');
  return error?.message || t('accountRequestError');
}

async function sendPasswordReset() {
  const emailInput = $('accountEmail');
  emailInput.value = emailInput.value.trim();
  if (!emailInput.reportValidity()) return;

  const button = $('forgotPasswordBtn');
  button.disabled = true;
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    $('accountDialog').close();
    toast(t('passwordResetSentToast'));
  } catch (error) {
    toast(authErrorMessage(error) || t('passwordResetError'));
  } finally {
    button.disabled = false;
  }
}

function renderAccount() {
  const signedIn = Boolean(currentUser);
  $('accountState').textContent = signedIn ? currentUser.email : 'Not signed in';
  $('signInBtn').textContent = signedIn ? t('signOut') : t('signIn');
  if (!signedIn) {
    $('accountSummary').innerHTML = `<div class="activity-empty">${t('joinDemo')}</div>`;
    return;
  }

  const accountRoles = Array.isArray(accountProfile?.roles)
    ? accountProfile.roles
    : currentWorkerProfile ? ['worker'] : ['customer'];
  const hasWorkerRole = accountRoles.includes('worker');
  const workerPublished = Boolean(currentWorkerProfile?.is_published);

  if (!hasWorkerRole) {
    $('accountSummary').innerHTML = `
      <section class="onboarding-guide">
        <p class="section-kicker">${t('onboardingProgress').replace('{step}', '2')}</p>
        <h3>${t('onboardingCustomerTitle')}</h3>
        <p>${t('onboardingCustomerBody')}</p>
        <form id="customerProfileForm" class="customer-profile-editor">
          <div class="form-two">
            <label class="form-label">${t('displayName')}
              <input id="customerDisplayName" maxlength="80" required value="${safeText(accountProfile?.display_name || currentUser.email.split('@')[0])}">
            </label>
            <label class="form-label">${t('preferredCurrency')}
              <input id="customerCurrency" list="currencyOptions" required value="${safeText(accountProfile?.preferred_currency || preferredCurrency)}">
            </label>
          </div>
          <div class="form-two">
            <label class="form-label">${t('country')}
              <input id="customerCountry" list="countryOptions" maxlength="80" value="${safeText(accountProfile?.country || 'India')}">
            </label>
            <label class="form-label">${t('city')}
              <input id="customerCity" maxlength="80" value="${safeText(accountProfile?.city || '')}">
            </label>
          </div>
          <button class="btn btn-outline" type="submit">${t('saveCustomerProfile')}</button>
        </form>
        <div class="account-card-actions">
          <button class="btn btn-primary" id="onboardingPostTaskBtn" type="button">${t('postFirstTask')}</button>
          <button class="btn btn-outline" id="becomeWorkerBtn" type="button">${t('becomeWorker')}</button>
        </div>
        <p class="onboarding-profile-ready">${t('customerProfileReady')}: ${safeText(accountProfile?.display_name || currentUser.email.split('@')[0])}</p>
      </section>`;
    return;
  }

  const categoryNames = taskCategories.length
    ? taskCategories.map(category => category.name)
    : ['Home services', 'Driving & delivery', 'Digital & creative', 'Office support', 'Education', 'Personal help'];
  const categoryKeys = {
    'Home services':'homeServices', 'Driving & delivery':'driving',
    'Digital & creative':'digital', 'Office support':'office',
    Education:'education', 'Personal help':'personal'
  };
  const selectedCategory = currentWorkerProfile?.category || categoryNames[2];
  const categoryOptions = categoryNames.map(category =>
    `<option value="${safeText(category)}"${category === selectedCategory ? ' selected' : ''}>${safeText(categoryKeys[category] ? t(categoryKeys[category]) : category)}</option>`
  ).join('');
  const workPreference = currentWorkerProfile?.work_preference || 'local';
  const published = Boolean(currentWorkerProfile?.is_published);
  const serviceLanguages = (currentWorkerProfile?.service_languages || []).join(', ');
  portfolioImagesDraft = Array.isArray(currentWorkerProfile?.portfolio_images)
    ? currentWorkerProfile.portfolio_images.slice(0, 6)
    : [];

  $('accountSummary').innerHTML = `
    <section class="onboarding-guide">
      <p class="section-kicker">${t('onboardingProgress').replace('{step}', workerPublished ? '3' : '1')}</p>
      <h3>${workerPublished ? t('onboardingWorkerLiveTitle') : t('onboardingWorkerTitle')}</h3>
      <p>${workerPublished ? t('onboardingWorkerLiveBody') : t('onboardingWorkerBody')}</p>
      ${workerPublished ? `<button class="btn btn-primary" id="onboardingBrowseTasksBtn" type="button">${t('browseOpenTasks')}</button>` : ''}
    </section>
    <form id="workerProfileForm" class="account-card account-profile-editor">
      <span class="account-role">${published ? t('publishedProfile') : t('profileDraft')}</span>
      <h3>${t('publicProfile')}</h3>
      <p>${t('profilePrivacy')}</p>
      <label class="form-label">${t('displayName')}
        <input id="profileDisplayName" maxlength="80" required value="${safeText(accountProfile?.display_name || currentUser.email.split('@')[0])}">
      </label>
      <div class="form-two">
        <label class="form-label">${t('country')}
          <input id="profileCountry" list="countryOptions" maxlength="80" required value="${safeText(currentWorkerProfile?.service_country || 'India')}">
        </label>
        <label class="form-label">${t('city')}
          <input id="profileCity" maxlength="80" value="${safeText(currentWorkerProfile?.service_city || '')}"${workPreference === 'remote' ? '' : ' required'}>
        </label>
      </div>
      <div class="provider-location-settings">
        <p class="form-hint">${t('profileLocationHint')}</p>
        <input id="profileServiceLatitude" type="hidden" value="${safeText(currentWorkerProfile?.service_latitude ?? '')}">
        <input id="profileServiceLongitude" type="hidden" value="${safeText(currentWorkerProfile?.service_longitude ?? '')}">
        <button class="btn btn-outline" id="setProfileLocationBtn" type="button">${currentWorkerProfile?.service_latitude != null ? t('updateProviderLocation') : t('setProviderLocation')}</button>
        <button class="text-link" id="clearProfileLocationBtn" type="button"${currentWorkerProfile?.service_latitude == null ? ' hidden' : ''}>${t('clearProviderLocation')}</button>
        <p class="location-status" id="profileLocationStatus" role="status" aria-live="polite"></p>
      </div>
      <div class="worker-fields">
        <label class="form-label">${t('taskCategoryLabel')}
          <select id="profileCategory">${categoryOptions}</select>
        </label>
        <div class="form-two">
          <label class="form-label">${t('primarySkill')}
            <input id="profileHeadline" maxlength="100" required value="${safeText(currentWorkerProfile?.headline || '')}" placeholder="e.g. Electrician">
          </label>
          <label class="form-label">${t('hourlyRate')}
            <input id="profileRate" type="number" min="1" max="1000000" required value="${safeText(currentWorkerProfile?.hourly_rate || '')}" placeholder="e.g. 400">
          </label>
        </div>
        <label class="form-label">${t('preferredCurrency')}
          <input id="profileCurrency" list="currencyOptions" required value="${safeText(currentWorkerProfile?.currency_code || preferredCurrency)}">
        </label>
        <label class="form-label">${t('languages')}
          <input id="profileLanguages" maxlength="200" value="${safeText(serviceLanguages)}" placeholder="${t('languagesPlaceholder')}">
        </label>
        <label class="form-label">${t('aboutService')}
          <textarea id="profileBio" rows="3" maxlength="600" required placeholder="Describe your experience and services">${safeText(currentWorkerProfile?.bio || '')}</textarea>
        </label>
        <div class="portfolio-editor">
          <label class="form-label" for="profilePortfolioInput">${t('portfolioImages')}</label>
          <input id="profilePortfolioInput" type="file" accept="image/jpeg,image/png,image/webp" multiple>
          <p class="form-hint">${t('portfolioImageGuidance')}</p>
          <div id="profilePortfolioPreview" class="portfolio-editor-grid">${renderPortfolioPreview(portfolioImagesDraft)}</div>
        </div>
        <label class="form-label">${t('workPreference')}
          <select id="profileWorkPreference">
            <option value="local"${workPreference === 'local' ? ' selected' : ''}>${t('local')}</option>
            <option value="remote"${workPreference === 'remote' ? ' selected' : ''}>${t('remote')}</option>
            <option value="both"${workPreference === 'both' ? ' selected' : ''}>${t('bothModes')}</option>
          </select>
        </label>
      </div>
      <div class="account-card-actions">
        <button class="btn btn-primary" type="submit">${t('savePublish')}</button>
        ${published ? `<button class="btn btn-outline" type="button" id="unpublishWorkerBtn">${t('hideProfile')}</button>` : ''}
      </div>
    </form>`;
}

async function addWorkerRoleToCurrentAccount() {
  if (!currentUser) return;
  const roles = Array.isArray(accountProfile?.roles) ? accountProfile.roles : ['customer'];
  const nextRoles = [...new Set([...roles, 'customer', 'worker'])];
  const { error } = await supabaseClient.from('profiles')
    .update({ roles: nextRoles })
    .eq('id', currentUser.id);
  if (error) throw error;
  await loadAccountProfile();
}

async function startProviderOnboarding() {
  if (!currentUser) {
    try {
      localStorage.setItem('time2income_provider_onboarding', 'pending');
    } catch (error) {
      console.error('Could not preserve provider onboarding intent:', error);
      toast(t('providerOnboardingError'));
      return;
    }
    location.assign('auth.html?mode=signup');
    return;
  }

  await loadAccountProfile();
  const roles = Array.isArray(accountProfile?.roles) ? accountProfile.roles : ['customer'];
  if (!roles.includes('worker')) await addWorkerRoleToCurrentAccount();

  const onboardingUrl = new URL(location.href);
  onboardingUrl.searchParams.set('page', 'profile');
  history.replaceState(null, '', onboardingUrl);
  document.body.dataset.page = 'profile';
  document.querySelectorAll('[data-workspace-page]').forEach(link => {
    if (link.dataset.workspacePage === 'profile') link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('accountPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('profileHeadline')?.focus({ preventScroll: true });
}

async function loadAccountProfile() {
  if (!currentUser) return;
  const [profileResult, workerResult] = await Promise.all([
    supabaseClient.from('profiles').select('id, display_name, country, city, preferred_language, preferred_currency, roles')
      .eq('id', currentUser.id).maybeSingle(),
    supabaseClient.from('worker_profiles').select('user_id, headline, bio, skills, service_languages, portfolio_images, hourly_rate, currency_code, category_id, work_preference, service_city, service_country, service_latitude, service_longitude, is_published')
      .eq('user_id', currentUser.id).maybeSingle()
  ]);
  if (profileResult.error) throw profileResult.error;
  if (workerResult.error) throw workerResult.error;

  accountProfile = profileResult.data;
  currentWorkerProfile = workerResult.data;
  if (!$('locationInput').value.trim()) {
    let savedLocation = '';
    try {
      savedLocation = localStorage.getItem('time2income_marketplace_city') || '';
    } catch (error) {
      console.warn('Could not read saved marketplace location:', error);
    }
    $('locationInput').value = accountProfile?.city || savedLocation;
  }
  if (accountProfile?.preferred_language) applyLanguage(accountProfile.preferred_language, false);
  if (accountProfile?.preferred_currency) setPreferredCurrency(accountProfile.preferred_currency, false);
  if (currentWorkerProfile?.category_id) {
    const { data: category, error } = await supabaseClient.from('categories')
      .select('name').eq('id', currentWorkerProfile.category_id).maybeSingle();
    if (error) throw error;
    currentWorkerProfile.category = category?.name || '';
  }
  renderAccount();
  renderWorkers();
}

async function saveCustomerProfile(event) {
  event.preventDefault();
  if (!currentUser) return;
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('customerCurrency').value);
  if (!currency) {
    toast(t('invalidCurrency'));
    return;
  }

  const button = event.submitter || event.target.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const { error } = await supabaseClient.from('profiles').update({
      display_name: $('customerDisplayName').value.trim(),
      country: $('customerCountry').value.trim() || null,
      city: $('customerCity').value.trim() || null,
      preferred_currency: currency.code,
      preferred_language: locale
    }).eq('id', currentUser.id);
    if (error) throw error;
    setPreferredCurrency(currency.code);
    await loadAccountProfile();
    toast(t('customerProfileSavedToast'));
  } catch (error) {
    toast(authErrorMessage(error));
  } finally {
    button.disabled = false;
  }
}

async function renderActivity() {
  if (!currentUser) {
    bookingRecords = [];
    myTasks = [];
    $('taskCount').textContent = '0';
    $('bookingCount').textContent = '0';
    $('myTasksList').innerHTML = `<div class="activity-empty">${t('signInToTasks')}</div>`;
    $('myBookingsList').innerHTML = `<div class="activity-empty">${t('signInToBookings')}</div>`;
    return;
  }

  const [tasksResult, bookingsResult] = await Promise.all([
    supabaseClient.from('tasks')
      .select('id, customer_id, title, description, category_id, work_mode, pricing_type, status, country, city, budget, currency_code, scheduled_start, estimated_hours, created_at')
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false }),
    supabaseClient.from('bookings')
      .select('id, title, status, agreed_price, currency_code, created_at, customer_id, worker_id')
      .or(`customer_id.eq.${currentUser.id},worker_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const tasks = tasksResult.data || [];
  myTasks = tasks;
  const bookings = bookingsResult.data || [];
  const taskOffersResult = tasks.length
    ? await supabaseClient.from('task_offers')
      .select('id, task_id, worker_id, proposed_price, currency_code, message, status')
      .in('task_id', tasks.map(task => task.id))
      .order('created_at', { ascending: false })
    : { data: [], error: null };
  if (taskOffersResult.error) throw taskOffersResult.error;

  const taskOffers = taskOffersResult.data || [];
  const otherUserIds = [...new Set([
    ...bookings.map(booking => booking.customer_id === currentUser.id ? booking.worker_id : booking.customer_id),
    ...taskOffers.map(offer => offer.worker_id)
  ])];
  let namesById = {};
  if (otherUserIds.length) {
    const { data: people, error } = await supabaseClient.from('profiles')
      .select('id, display_name').in('id', otherUserIds);
    if (error) throw error;
    namesById = Object.fromEntries((people || []).map(person => [person.id, person.display_name]));
  }

  // reviews table is optional until supabase/reviews.sql has been applied
  let reviewedIds = new Set();
  let reviewsAvailable = true;
  const completedIds = bookings.filter(b => b.status === 'completed').map(b => b.id);
  if (completedIds.length) {
    const { data: reviewRows, error: reviewsError } = await supabaseClient.from('reviews')
      .select('booking_id').in('booking_id', completedIds);
    if (reviewsError) reviewsAvailable = false;
    else reviewedIds = new Set((reviewRows || []).map(r => r.booking_id));
  }

  bookingRecords = bookings.map(booking => {
    const isWorker = booking.worker_id === currentUser.id;
    const otherUserId = isWorker ? booking.customer_id : booking.worker_id;
    return {
      ...booking,
      isWorker,
      otherName: namesById[otherUserId] || (isWorker ? 'Customer' : 'Provider')
    };
  });

  $('taskCount').textContent = tasks.length;
  $('bookingCount').textContent = bookings.length;
  $('myTasksList').innerHTML = tasks.length
    ? tasks.map(task => {
      const offers = taskOffers.filter(offer => offer.task_id === task.id);
      const offerRows = offers.map(offer => {
        const actions = task.status === 'open' && offer.status === 'pending'
          ? `<button class="text-link" type="button" data-task-offer-action="accept" data-offer-id="${safeText(offer.id)}">${t('accept')}</button><button class="text-link" type="button" data-task-offer-action="reject" data-offer-id="${safeText(offer.id)}">${t('decline')}</button>`
          : '';
        const offerStatusKey = `status_${offer.status}`;
        const offerStatus = t(offerStatusKey) === offerStatusKey ? offer.status : t(offerStatusKey);
        return `<div class="task-offer-row"><div><strong>${safeText(namesById[offer.worker_id] || 'Worker')}</strong><p>${safeText(formatMoney(offer.proposed_price, offer.currency_code))} · ${safeText(offerStatus)}</p><p>${safeText(offer.message || t('noMessage'))}</p></div><div class="account-card-actions">${actions}</div></div>`;
      }).join('');
      const taskStatusKey = `status_${task.status}`;
      const taskStatus = t(taskStatusKey) === taskStatusKey ? task.status : t(taskStatusKey);
      const schedule = task.scheduled_start ? formatDateTime(task.scheduled_start) : '';
      const hours = task.estimated_hours ? new Intl.NumberFormat(getFormatLocale()).format(task.estimated_hours) : '';
      const taskActions = task.status === 'open'
        ? `<div class="account-card-actions"><button class="text-link" type="button" data-task-edit="${safeText(task.id)}">${t('editTask')}</button><button class="text-link" type="button" data-task-cancel="${safeText(task.id)}">${t('cancelTaskPosting')}</button></div>`
        : '';
      return `<article class="activity-item"><div class="activity-item-top"><strong>${safeText(task.title)}</strong><span class="activity-status">${safeText(taskStatus)}</span></div><p>${safeText([task.city, task.country].filter(Boolean).join(', ') || t('remote'))}</p><p>${task.budget ? `${t('budget')}: ${safeText(formatMoney(task.budget, task.currency_code))}` : t('budgetByAgreement')}</p>${schedule ? `<p>${t('schedule')}: ${safeText(schedule)}</p>` : ''}${hours ? `<p>${t('estimatedHours')}: ${safeText(hours)}</p>` : ''}${offers.length ? `<details class="task-offers"><summary>${formatPluralCount(offers.length, 'offerOne', 'offerMany')}</summary>${offerRows}</details>` : `<p>${t('noOffers')}</p>`}${taskActions}</article>`;
    }).join('')
    : `<div class="activity-empty">${t('noTasksYet')}</div>`;
  $('myBookingsList').innerHTML = bookingRecords.length
    ? bookingRecords.map(booking => {
      const isWorker = booking.isWorker;
      const otherName = booking.otherName;
      const actions = isWorker && booking.status === 'requested'
        ? `<button class="text-link" type="button" data-booking-action="accept" data-booking-id="${safeText(booking.id)}">${t('accept')}</button><button class="text-link" type="button" data-booking-action="reject" data-booking-id="${safeText(booking.id)}">${t('decline')}</button>`
        : isWorker && ['accepted', 'confirmed'].includes(booking.status)
          ? `<button class="text-link" type="button" data-booking-action="start" data-booking-id="${safeText(booking.id)}">${t('startWork')}</button>`
          : isWorker && booking.status === 'in_progress'
            ? `<button class="text-link" type="button" data-booking-action="complete" data-booking-id="${safeText(booking.id)}">${t('markWorkComplete')}</button>`
            : !isWorker && booking.status === 'completion_pending'
              ? `<button class="text-link" type="button" data-booking-action="confirm_complete" data-booking-id="${safeText(booking.id)}">${t('confirmWorkComplete')}</button><button class="text-link" type="button" data-booking-action="dispute" data-booking-id="${safeText(booking.id)}">${t('reportIssue')}</button>`
        : !isWorker && ['requested', 'accepted'].includes(booking.status)
          ? `<button class="text-link" type="button" data-booking-action="cancel" data-booking-id="${safeText(booking.id)}">${t('cancelAction')}</button>`
          : booking.status === 'completed'
            ? (!isWorker && reviewsAvailable
              ? (reviewedIds.has(booking.id)
                ? `<span class="activity-status">${t('reviewed')}</span>`
                : `<button class="text-link" type="button" data-booking-review="${safeText(booking.id)}">${t('leaveReview')}</button>`)
              : '') + `<button class="text-link" type="button" data-booking-next="${isWorker ? 'browse' : 'post'}">${t(isWorker ? 'browseNextTasks' : 'postNextTask')}</button>`
            : '';
      const statusKey = `status_${booking.status}`;
      const statusText = t(statusKey) === statusKey ? booking.status : t(statusKey);
      return `<article class="activity-item"><div class="activity-item-top"><strong>${safeText(booking.title)}</strong><span class="activity-status">${safeText(statusText)}</span></div><p>${isWorker ? t('requestedBy') : t('provider')}: ${safeText(otherName)}</p><p>${safeText(formatMoney(booking.agreed_price, booking.currency_code))}</p><p>${safeText(formatDateTime(booking.created_at))}</p><div class="activity-item-bottom"><button class="text-link" type="button" data-booking-chat="${safeText(booking.id)}">${t('bookingChat')}</button>${actions}</div></article>`;
    }).join('')
    : `<div class="activity-empty">${t('noBookingsYet')}</div>`;
}

function stopBookingChatPolling() {
  if (bookingChatPoll) clearInterval(bookingChatPoll);
  bookingChatPoll = null;
  activeBookingChatId = null;
}

async function loadBookingMessages() {
  const bookingId = activeBookingChatId;
  if (!bookingId || !currentUser) return;

  const { data, error } = await supabaseClient.from('booking_messages')
    .select('id, sender_id, body, created_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  if (bookingId !== activeBookingChatId || !$('bookingChatDialog').open) return;

  const messages = (data || []).reverse();
  $('bookingChatMessages').innerHTML = messages.length
    ? messages.map(message => {
      const isMine = message.sender_id === currentUser.id;
      const senderName = isMine ? t('you') : bookingRecords.find(booking => booking.id === bookingId)?.otherName || t('provider');
      return `<article class="booking-chat-message${isMine ? ' is-mine' : ''}"><p>${safeText(message.body)}</p><div><strong>${safeText(senderName)}</strong><time>${safeText(formatDateTime(message.created_at))}</time></div></article>`;
    }).join('')
    : `<p class="booking-chat-empty">${t('chatNoMessages')}</p>`;
  const messageList = $('bookingChatMessages');
  messageList.scrollTop = messageList.scrollHeight;
}

async function openBookingChat(bookingId) {
  if (!currentUser) {
    openAccountDialog('signin');
    return;
  }
  const booking = bookingRecords.find(record => record.id === bookingId);
  if (!booking) {
    toast(t('chatLoadError'));
    return;
  }

  stopBookingChatPolling();
  activeBookingChatId = booking.id;
  bookingChatWritable = ['requested', 'accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed'].includes(booking.status);
  $('bookingChatTitle').textContent = booking.title;
  $('bookingChatPartner').textContent = booking.otherName;
  $('bookingChatStatus').textContent = t(bookingChatWritable ? 'chatActive' : 'chatReadOnly');
  $('bookingChatInput').disabled = !bookingChatWritable;
  $('sendBookingMessageBtn').disabled = !bookingChatWritable;
  $('bookingChatMessages').innerHTML = '';
  $('bookingChatDialog').showModal();

  try {
    await loadBookingMessages();
  } catch (error) {
    toast(t('chatLoadError'));
  }
  if (activeBookingChatId !== booking.id || !$('bookingChatDialog').open) return;
  bookingChatPoll = setInterval(() => {
    loadBookingMessages().catch(() => {
      if (bookingChatPoll) clearInterval(bookingChatPoll);
      bookingChatPoll = null;
      toast(t('chatLoadError'));
    });
  }, 5000);
}

async function sendBookingMessage(event) {
  event.preventDefault();
  const body = $('bookingChatInput').value.trim();
  if (!activeBookingChatId || !currentUser || !bookingChatWritable || !body) return;

  const button = $('sendBookingMessageBtn');
  button.disabled = true;
  $('bookingChatInput').disabled = true;
  try {
    const { error } = await supabaseClient.from('booking_messages').insert({
      booking_id: activeBookingChatId,
      sender_id: currentUser.id,
      body
    });
    if (error) throw error;
    $('bookingChatInput').value = '';
    try {
      await loadBookingMessages();
    } catch (error) {
      toast(t('chatLoadError'));
    }
  } catch (error) {
    toast(t('chatSendError'));
  } finally {
    button.disabled = !bookingChatWritable;
    $('bookingChatInput').disabled = !bookingChatWritable;
  }
}

async function loadTaskCategories() {
  const { data, error } = await supabaseClient.from('categories')
    .select('id, name').eq('is_active', true).order('name');
  if (error) throw error;
  taskCategories = data || [];

  const categoryFilter = $('taskCategoryFilter');
  if (categoryFilter) {
    const selectedName = categoryFilter.value;
    $('taskCategoryOptions').innerHTML = taskCategories
      .map(category => `<option value="${safeText(category.name)}"></option>`)
      .join('');
    if (!taskCategories.some(category => category.name === selectedName)) categoryFilter.value = '';
  }

  for (const selectId of ['taskCategory', 'accountCategory']) {
    const select = $(selectId);
    if (!select || !taskCategories.length) continue;
    const selectedName = select.value;
    select.innerHTML = taskCategories.map(category =>
      `<option value="${safeText(category.name)}">${safeText(category.name)}</option>`
    ).join('');
    if (taskCategories.some(category => category.name === selectedName)) select.value = selectedName;
  }
}

async function renderTaskBoard() {
  if (!currentUser) {
    openTasks = [];
    taskOfferStatuses = {};
    $('openTaskCount').textContent = '0';
    $('openTaskList').innerHTML = `<div class="activity-empty">${t('signInToTasks')}</div>`;
    return;
  }

  const [tasksResult, offersResult] = await Promise.all([
    supabaseClient.from('tasks')
      .select('id, customer_id, title, description, category_id, country, city, work_mode, pricing_type, budget, currency_code, scheduled_start, estimated_hours, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseClient.from('task_offers')
      .select('task_id, status')
      .eq('worker_id', currentUser.id)
  ]);
  if (tasksResult.error) throw tasksResult.error;
  if (offersResult.error) throw offersResult.error;

  taskOfferStatuses = Object.fromEntries((offersResult.data || []).map(offer => [offer.task_id, offer.status]));
  const city = $('taskCityFilter').value.trim().toLowerCase();
  const workMode = $('taskModeFilter').value;
  const categoryValue = $('taskCategoryFilter')?.value.trim() || '';
  const matchedCategory = taskCategories.find(category =>
    category.name.toLocaleLowerCase() === categoryValue.toLocaleLowerCase()
  );
  const categoryId = matchedCategory?.id || (categoryValue ? 'invalid' : 'all');
  openTasks = (tasksResult.data || []).filter(task => {
    if (task.customer_id === currentUser.id) return false;
    const place = `${task.city || ''} ${task.country || ''}`.toLowerCase();
    const matchesCity = !city || task.work_mode === 'remote' || place.includes(city);
    const matchesMode = workMode === 'all' || task.work_mode === workMode;
    const matchesCategory = categoryId === 'all' || task.category_id === categoryId;
    const categoryName = taskCategories.find(category => category.id === task.category_id)?.name || '';
    const searchable = `${task.title || ''} ${task.description || ''} ${categoryName}`.toLocaleLowerCase();
    const matchesQuery = !workQuery || searchable.includes(workQuery.toLocaleLowerCase());
    return matchesCity && matchesMode && matchesCategory && matchesQuery;
  });
  openTasks = openTasks.map(task => ({
    ...task,
    category: taskCategories.find(category => category.id === task.category_id)?.name || ''
  }));
  updateMarketplaceSuggestions();

  $('openTaskCount').textContent = openTasks.length;
  $('openTaskList').innerHTML = openTasks.length
    ? openTasks.map(task => {
      const offerStatus = taskOfferStatuses[task.id];
      const location = task.work_mode === 'remote'
        ? t('remote')
        : [task.city, task.country].filter(Boolean).join(', ') || 'Local';
      const categoryName = taskCategories.find(category => category.id === task.category_id)?.name || '';
      const offerAction = offerStatus
        ? `<span class="activity-status">${t('offerStatus')} ${safeText(offerStatus)}</span>`
        : `<button class="btn btn-primary" type="button" data-open-task-offer="${safeText(task.id)}">${t('makeOffer')}</button>`;
      return `<article class="activity-item"><div class="activity-item-top"><strong>${safeText(task.title)}</strong><span class="activity-status">${safeText(task.work_mode === 'remote' ? t('remote') : t('local'))}</span></div>${categoryName ? `<p class="task-category-name">${safeText(categoryName)}</p>` : ''}<p>${safeText(location)}</p><p>${safeText(task.description || t('noExtraDetails'))}</p><div class="activity-item-bottom"><span>${task.budget ? `${safeText(task.pricing_type)} ${t('budget').toLowerCase()}: ${safeText(formatMoney(task.budget, task.currency_code))}` : t('priceByAgreement')}</span>${offerAction}</div></article>`;
    }).join('')
    : `<div class="activity-empty">${t('noTasksMatch')}</div>`;
}

function parseLanguageList(value) {
  return [...new Set(String(value || '').split(',').map(language => language.trim()).filter(Boolean))].slice(0, 12);
}

function openTaskOffer(taskId) {
  selectedTask = openTasks.find(task => String(task.id) === taskId);
  if (!selectedTask) return;
  $('offerForm').reset();
  $('offerTaskTitle').textContent = selectedTask.title;
  $('offerTaskSummary').textContent = `${selectedTask.city || 'Remote'} · ${selectedTask.description || 'No extra details provided.'}`;
  $('offerCurrency').value = selectedTask.currency_code || preferredCurrency;
  $('offerDialog').showModal();
}

async function submitTaskOffer(event) {
  event.preventDefault();
  if (!currentUser || !selectedTask) return;
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('offerCurrency').value);
  if (!currency) {
    toast(t('invalidCurrency'));
    return;
  }
  const { error } = await supabaseClient.from('task_offers').insert({
    task_id: selectedTask.id,
    worker_id: currentUser.id,
    proposed_price: Number($('offerPrice').value),
    currency_code: currency.code,
    message: $('offerMessage').value.trim() || null
  });
  if (error) {
    toast(error.message || 'Unable to send offer.');
    return;
  }
  $('offerDialog').close();
  await Promise.all([renderTaskBoard(), renderActivity()]);
  toast(t('taskOfferSentToast'));
}

async function handleTaskOfferAction(event) {
  const button = event.target.closest('[data-task-offer-action]');
  if (!button) return;
  button.disabled = true;
  const { error } = await supabaseClient.rpc('respond_to_task_offer', {
    p_offer_id: button.dataset.offerId,
    p_action: button.dataset.taskOfferAction
  });
  if (error) {
    button.disabled = false;
    toast(error.message || t('updateOfferError'));
    return;
  }
  await Promise.all([renderTaskBoard(), renderActivity()]);
  toast(t(button.dataset.taskOfferAction === 'accept' ? 'offerAcceptedToast' : 'offerDeclinedToast'));
}

async function saveOwnProfile(userId, values) {
  const result = await supabaseClient.from('profiles')
    .upsert({ id: userId, ...values }, { onConflict: 'id' });
  if (result.error) throw result.error;
}

async function saveOwnWorkerProfile(userId, values) {
  const result = await supabaseClient.from('worker_profiles')
    .upsert({ user_id: userId, ...values }, { onConflict: 'user_id' });
  if (result.error) throw result.error;
}

function readProfileCoordinates() {
  const latitude = $('profileServiceLatitude').value.trim();
  const longitude = $('profileServiceLongitude').value.trim();
  if (!latitude && !longitude) return { latitude: null, longitude: null };
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  if (!latitude || !longitude ||
      !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 ||
      !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
    throw new Error(t('providerLocationInvalid'));
  }
  return { latitude: parsedLatitude, longitude: parsedLongitude };
}

async function saveAccountProfile(user) {
  const roles = $('accountRole').value === 'client'
    ? ['customer']
    : $('accountRole').value === 'worker'
      ? ['worker']
      : ['customer', 'worker'];
  const { data: category, error: categoryError } = await supabaseClient.from('categories')
    .select('id').eq('name', $('accountCategory').value).maybeSingle();
  if (categoryError) throw categoryError;
  const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('accountCurrency').value) ||
    window.TIME2INCOME_CURRENCY.resolveCurrency(preferredCurrency);
  await saveOwnProfile(user.id, {
    display_name: $('accountName').value.trim() || user.user_metadata?.full_name || user.email.split('@')[0],
    country: $('accountCountry').value.trim() || 'India',
    city: $('accountCity').value.trim() || null,
    roles,
    preferred_language: locale,
    preferred_currency: currency.code
  });

  if (roles.includes('worker')) {
    const workPreference = $('accountWorkType').value.toLowerCase();
    await saveOwnWorkerProfile(user.id, {
      headline: $('accountSkill').value.trim() || null,
      skills: $('accountSkill').value.trim() ? [$('accountSkill').value.trim()] : [],
      category_id: category.id,
      work_preference: workPreference,
      hourly_rate: Number($('accountRate').value) || null,
      currency_code: currency.code,
      service_languages: parseLanguageList($('accountLanguages').value),
      service_city: $('accountCity').value.trim() || null,
      service_country: $('accountCountry').value.trim() || 'India',
      is_published: false
    });
  }
}

async function ensureAccountProfile(user) {
  const { data, error } = await supabaseClient.from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const metadata = user.user_metadata || {};
    $('accountName').value = metadata.full_name || '';
    $('accountRole').value = metadata.role || 'both';
    $('accountCountry').value = metadata.country || 'India';
    $('accountCity').value = metadata.city || '';
    $('accountSkill').value = metadata.primary_skill || '';
    $('accountRate').value = metadata.hourly_rate || '';
    $('accountWorkType').value = metadata.work_preference || 'Local';
    $('accountCurrency').value = metadata.preferred_currency || preferredCurrency;
    $('accountLanguages').value = metadata.languages || '';
    if (metadata.preferred_language) applyLanguage(metadata.preferred_language, false);
    if (metadata.preferred_currency) setPreferredCurrency(metadata.preferred_currency, false);
    $('accountCategory').value = metadata.category || 'Home services';
    $('workerFields').classList.toggle('hidden', $('accountRole').value === 'client');
    await saveAccountProfile(user);
  }
}

async function saveWorkerProfile(event) {
  event.preventDefault();
  if (!currentUser) return;

  const categoryName = $('profileCategory').value;
  const selectedFiles = Array.from($('profilePortfolioInput')?.files || []);
  const previousImages = Array.isArray(currentWorkerProfile?.portfolio_images)
    ? currentWorkerProfile.portfolio_images
    : [];
  const retainedImages = portfolioImagesDraft.filter(path => previousImages.includes(path));
  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (retainedImages.length + selectedFiles.length > 6) {
    toast(t('portfolioLimitError'));
    return;
  }
  if (selectedFiles.some(file => !allowedImageTypes.has(file.type) || file.size > 5 * 1024 * 1024)) {
    toast(t('portfolioTypeError'));
    return;
  }

  const uploadedPaths = [];
  let profileSaved = false;
  try {
    const { data: category, error: categoryError } = await supabaseClient.from('categories')
      .select('id').eq('name', categoryName).maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) throw new Error('Marketplace categories are not set up yet. Run the Supabase upgrade SQL.');
    const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('profileCurrency').value);
    if (!currency) throw new Error(t('invalidCurrency'));
    const serviceCoordinates = readProfileCoordinates();

    for (const file of selectedFiles) {
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const path = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabaseClient.storage
        .from('worker-portfolio')
        .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
    }

    const roles = ['customer', 'worker'];
    const { error: profileError } = await supabaseClient.from('profiles').update({
      display_name: $('profileDisplayName').value.trim(),
      country: $('profileCountry').value.trim(),
      city: $('profileCity').value.trim() || null,
      roles,
      preferred_language: locale,
      preferred_currency: currency.code
    }).eq('id', currentUser.id);
    if (profileError) throw profileError;

    const headline = $('profileHeadline').value.trim();
    await saveOwnWorkerProfile(currentUser.id, {
      headline,
      skills: [headline],
      bio: $('profileBio').value.trim(),
      service_languages: parseLanguageList($('profileLanguages').value),
      category_id: category.id,
      work_preference: $('profileWorkPreference').value,
      hourly_rate: Number($('profileRate').value),
      currency_code: currency.code,
      portfolio_images: [...retainedImages, ...uploadedPaths],
      service_city: $('profileCity').value.trim() || null,
      service_country: $('profileCountry').value.trim(),
      service_latitude: serviceCoordinates.latitude,
      service_longitude: serviceCoordinates.longitude,
      is_published: true
    });
    profileSaved = true;

    const removedImages = previousImages.filter(path => !retainedImages.includes(path));
    if (removedImages.length) {
      const { error: cleanupError } = await supabaseClient.storage.from('worker-portfolio').remove(removedImages);
      if (cleanupError) console.error('Portfolio image cleanup failed:', cleanupError);
    }

    await Promise.all([loadAccountProfile(), loadRealWorkers()]);
    toast(t('profilePublishedToast'));
  } catch (error) {
    if (!profileSaved && uploadedPaths.length) {
      await supabaseClient.storage.from('worker-portfolio').remove(uploadedPaths).catch(() => {});
    }
    toast(error.message || t('publishProfileError'));
  }
}

async function unpublishWorkerProfile() {
  if (!currentUser) return;
  const { error } = await supabaseClient.from('worker_profiles')
    .update({ is_published: false })
    .eq('user_id', currentUser.id);
  if (error) {
    toast(error.message || t('hideProfileError'));
    return;
  }
  await Promise.all([loadAccountProfile(), loadRealWorkers()]);
  toast(t('profileHiddenToast'));
}

async function handleAccountSubmit(event) {
  event.preventDefault();
  const email = $('accountEmail').value.trim();
  const password = $('accountPassword').value;
  const button = $('accountSubmitBtn');
  button.disabled = true;

  try {
    if (accountMode === 'recovery') {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      $('accountDialog').close();
      toast(t('passwordUpdatedToast'));
      return;
    }

    let user;
    if (accountMode === 'signup') {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: $('accountName').value.trim(),
            role: $('accountRole').value,
            country: $('accountCountry').value.trim(),
            city: $('accountCity').value.trim(),
            primary_skill: $('accountSkill').value.trim(),
            hourly_rate: $('accountRate').value,
            work_preference: $('accountWorkType').value,
            category: $('accountCategory').value,
            preferred_language: locale,
            preferred_currency: window.TIME2INCOME_CURRENCY.resolveCurrency($('accountCurrency').value)?.code || preferredCurrency,
            languages: $('accountLanguages').value
          },
          ...(window.location.protocol === 'http:' || window.location.protocol === 'https:'
            ? { emailRedirectTo: window.location.origin }
            : {})
        }
      });
      if (error) throw error;
      user = data.user;
      if (!data.session) {
        toast(t('accountConfirmToast'));
        $('accountDialog').close();
        return;
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      user = data.user;
    }

    currentUser = user;
    currentSession = (await supabaseClient.auth.getSession()).data.session;
    if (accountMode === 'signup') {
      await saveAccountProfile(user);
    } else {
      await ensureAccountProfile(user);
    }
    $('accountDialog').close();
    renderAccount();
    await Promise.all([loadAccountProfile(), loadRealWorkers(), renderActivity(), renderTaskBoard()]);
    toast(t(accountMode === 'signup' ? 'accountCreatedToast' : 'signedInToast'));
  } catch (error) {
    toast(authErrorMessage(error));
  } finally {
    button.disabled = false;
  }
}

async function postTask(event) {
  event.preventDefault();
  if (!currentUser) {
    openAccountDialog('signin');
    toast(t('signInDemo'));
    return;
  }

  const city = $('taskLocation').value.trim();
  const country = $('taskCountry').value.trim();
  const categoryName = $('taskCategory').value;
  const wasEditing = Boolean(editingTaskId);
  try {
    const currency = window.TIME2INCOME_CURRENCY.resolveCurrency($('taskCurrency').value);
    if (!currency) throw new Error(t('invalidCurrency'));
    if ($('taskWorkMode').value === 'local' && (!country || !city)) {
      throw new Error(t('localLocationRequired'));
    }

    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) throw new Error(t('invalidTaskCategory'));

    const taskValues = {
      title: $('taskTitle').value.trim(),
      description: $('taskDetails').value.trim() || null,
      category_id: category.id,
      work_mode: $('taskWorkMode').value,
      pricing_type: $('taskPricingType').value,
      currency_code: currency.code,
      city: $('taskWorkMode').value === 'local' ? city : null,
      country: country || null,
      budget: $('taskBudget').value ? Number($('taskBudget').value) : null,
      estimated_hours: $('taskEstimatedHours').value ? Number($('taskEstimatedHours').value) : null,
      scheduled_start: $('taskScheduledStart').value
        ? new Date($('taskScheduledStart').value).toISOString()
        : null
    };
    if (editingTaskId) {
      const { data, error } = await supabaseClient.from('tasks').update(taskValues)
        .eq('id', editingTaskId).eq('customer_id', currentUser.id).eq('status', 'open')
        .select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(t('taskNoLongerEditable'));
    } else {
      const { error } = await supabaseClient.from('tasks').insert({
        customer_id: currentUser.id,
        ...taskValues
      });
      if (error) throw error;
    }

    $('taskForm').reset();
    editingTaskId = null;
    $('taskCurrency').value = preferredCurrency;
    updateTaskBudgetPreview();
    $('taskDialog').close();
    await Promise.all([renderActivity(), renderTaskBoard()]);
    toast(t(wasEditing ? 'taskUpdatedToast' : 'posted'));
  } catch (error) {
    toast(error.message || t('taskPostError'));
  }
}

async function cancelOwnTask(taskId) {
  if (!currentUser) return;
  const { data: task, error: taskError } = await supabaseClient.from('tasks')
    .select('id, customer_id, status')
    .eq('id', taskId).eq('customer_id', currentUser.id).maybeSingle();
  if (taskError) throw taskError;
  if (!task || task.status !== 'open') {
    toast(t('taskNoLongerEditable'));
    return;
  }
  if (!window.confirm(t('confirmCancelTask'))) return;
  const { data, error } = await supabaseClient.from('tasks')
    .update({ status: 'cancelled' })
    .eq('id', taskId).eq('customer_id', currentUser.id).eq('status', 'open')
    .select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(t('taskNoLongerEditable'));
  await Promise.all([renderActivity(), renderTaskBoard()]);
  toast(t('taskCancelledToast'));
}

function openWorkerProfile(worker) {
  selectedWorker = worker;
  const isDemo = String(worker.id).startsWith('demo-');
  $('workerDialogName').textContent = worker.name;
  $('workerDialogContent').innerHTML = `
    <p><strong>${safeText(worker.skill)}</strong> · ${safeText(worker.category || 'Service provider')}</p>
    <p>${safeText(worker.description || 'No service description provided.')}</p>
    <p>${safeText([worker.city, worker.country].filter(Boolean).join(', ') || 'Remote')} · ${safeText(worker.type || 'Remote')}</p>
    <p>${worker.rate ? `${safeText(formatMoney(worker.rate, worker.currency || 'INR'))} / ${t('hour')}` : t('rateOnRequest')}</p>
    ${(worker.languages || []).length ? `<p>${t('languages')}: ${safeText(worker.languages.join(', '))}</p>` : ''}
    <div class="tag-row">${(worker.tags || []).map(tag => `<span class="skill-tag">${safeText(tag)}</span>`).join('')}</div>
    ${isDemo ? '<p class="demo-warning">Demo profile only. No booking can be sent to this person.</p>' : ''}`;
  $('workerDialogBook').hidden = isDemo || worker.id === currentUser?.id;
  $('workerDialog').showModal();
}

async function requestBooking(worker) {
  if (String(worker.id).startsWith('demo-')) {
    toast(t('profileDemo'));
    return;
  }
  if (!currentUser) {
    $('workerDialog').close();
    openAccountDialog('signin');
    toast(t('signInDemo'));
    return;
  }
  if (worker.id === currentUser.id) {
    toast(t('ownBookingError'));
    return;
  }
  const { error } = await supabaseClient.rpc('request_booking', {
    p_worker_id: worker.id
  });
  if (error) {
    toast(error.message || t('bookingRequestError'));
    return;
  }
  $('workerDialog').close();
  await renderActivity();
  toast(t('bookingSentToast'));
}

async function handleWorkerAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const worker = getAllWorkers().find(profile => String(profile.id) === button.dataset.id);
  if (!worker) return;

  if (button.dataset.action === 'profile') {
    openWorkerProfile(worker);
    return;
  }
  await requestBooking(worker);
}

async function handleBookingAction(event) {
  const reviewButton = event.target.closest('[data-booking-review]');
  if (reviewButton) {
    const booking = bookingRecords.find(b => b.id === reviewButton.dataset.bookingReview);
    if (!booking) return;
    const rating = parseInt(window.prompt(t('reviewPrompt'), '5'), 10);
    if (!(rating >= 1 && rating <= 5)) return;
    const comment = (window.prompt(t('reviewCommentPrompt'), '') || '').trim().slice(0, 1000);
    reviewButton.disabled = true;
    const { error } = await supabaseClient.from('reviews').insert({
      booking_id: booking.id, reviewer_id: currentUser.id, worker_id: booking.worker_id,
      rating, comment: comment || null
    });
    if (error) {
      reviewButton.disabled = false;
      toast(t('reviewError'));
      return;
    }
    await renderActivity();
    toast(t('reviewThanks'));
    return;
  }

  const nextTaskButton = event.target.closest('[data-booking-next]');
  if (nextTaskButton) {
    if (nextTaskButton.dataset.bookingNext === 'post') {
      openTaskDialog();
    } else {
      $('taskBoardPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }
  const button = event.target.closest('[data-booking-action]');
  if (!button) return;
  button.disabled = true;
  const { error } = await supabaseClient.rpc('respond_to_booking', {
    p_booking_id: button.dataset.bookingId,
    p_action: button.dataset.bookingAction
  });
  if (error) {
    button.disabled = false;
    toast(error.message || t('bookingUpdateError'));
    return;
  }
  await renderActivity();
  const toastByAction = {
    accept: 'status_accepted', reject: 'status_declined', cancel: 'status_cancelled',
    start: 'bookingStartedToast', complete: 'completionRequestedToast',
    confirm_complete: 'completionConfirmedToast', dispute: 'issueReportedToast'
  };
  toast(t(toastByAction[button.dataset.bookingAction] || 'bookingUpdateError'));
}

async function syncSession(session) {
  currentSession = session;
  currentUser = session?.user || null;
  if (!currentUser) {
    location.replace('auth.html?mode=signin');
    return;
  }
  try {
    const { data: hasAccess, error } = await supabaseClient.rpc('has_active_platform_access');
    if (error) throw error;
    if (!hasAccess) {
      location.replace('payment.html');
      return;
    }
  } catch (error) {
    console.error('Platform activation status check failed:', error);
    location.replace('payment.html?status=unavailable');
    return;
  }
  document.documentElement.classList.remove('auth-gate');
  renderAccount();
  (async () => {
    await loadTaskCategories();
    await ensureAccountProfile(currentUser);
    await Promise.all([loadAccountProfile(), loadRealWorkers(), renderActivity(), renderTaskBoard()]);
    let onboardingPending = false;
    try {
      onboardingPending = localStorage.getItem('time2income_provider_onboarding') === 'pending';
    } catch (error) {
      console.warn('Could not read provider onboarding intent:', error);
    }
    if (onboardingPending) {
      await startProviderOnboarding();
      localStorage.removeItem('time2income_provider_onboarding');
    }
  })().catch(error => {
    console.error('Account data load failed:', error);
    toast(`Marketplace data could not be loaded: ${error.message}`);
  });
}

function initializeApp() {
  const requestedPage = new URLSearchParams(location.search).get('page');
  const workspacePages = new Set(['marketplace', 'tasks', 'activity', 'profile', 'guides']);
  const page = workspacePages.has(requestedPage) ? requestedPage : 'marketplace';
  document.body.dataset.page = page;
  document.querySelectorAll('[data-workspace-page]').forEach(link => {
    if (link.dataset.workspacePage === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const pageTitles = {
    marketplace: 'Marketplace',
    tasks: 'Open tasks',
    activity: 'My activity',
    profile: 'My profile',
    guides: 'Guides'
  };
  document.title = `${pageTitles[page]} | TIME2INCOME`;
  populateGlobalPickers();
  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('time2income_language') || 'en';
    preferredCurrency = window.TIME2INCOME_CURRENCY.resolveCurrency(localStorage.getItem('time2income_currency'))?.code || 'INR';
  } catch (error) {
    console.warn('Could not load saved localization preferences:', error);
  }
  $('currencySelector').value = preferredCurrency;
  $('accountCurrency').value = preferredCurrency;
  $('taskCurrency').value = preferredCurrency;
  $('offerCurrency').value = preferredCurrency;
  applyLanguage(savedLanguage, false);
  refreshExchangeRates();
  setInterval(() => refreshExchangeRates(true), 6 * 60 * 60 * 1000);
  renderAccount();
  renderActivity().catch(error => console.error('Activity load failed:', error));

  const handleLanguagePicker = event => {
    const language = resolveLanguage(event.target.value);
    if (language) applyLanguage(language.code);
  };
  $('language').addEventListener('input', handleLanguagePicker);
  $('language').addEventListener('change', handleLanguagePicker);
  const handleCurrencyPicker = event => {
    const currency = window.TIME2INCOME_CURRENCY.resolveCurrency(event.target.value);
    if (currency) setPreferredCurrency(currency.code);
  };
  $('currencySelector').addEventListener('input', handleCurrencyPicker);
  $('currencySelector').addEventListener('change', event => {
    const currency = window.TIME2INCOME_CURRENCY.resolveCurrency(event.target.value);
    if (!currency) event.target.value = preferredCurrency;
    else if (currency.code !== preferredCurrency) setPreferredCurrency(currency.code);
  });
  const handleAccountCurrency = event => {
    const code = normalizeCurrencyInput(event.target);
    if (code) setPreferredCurrency(code);
  };
  $('accountCurrency').addEventListener('input', handleAccountCurrency);
  $('accountCurrency').addEventListener('change', event => {
    const currency = window.TIME2INCOME_CURRENCY.resolveCurrency(event.target.value);
    if (!currency) event.target.value = preferredCurrency;
    else if (currency.code !== preferredCurrency) setPreferredCurrency(currency.code);
  });
  const suggestAccountCurrency = () => applyCountrySuggestion('accountCountry', 'accountCurrency', true);
  $('accountCountry').addEventListener('input', suggestAccountCurrency);
  const suggestTaskCurrency = () => applyCountrySuggestion('taskCountry', 'taskCurrency');
  $('taskCountry').addEventListener('input', suggestTaskCurrency);
  $('taskCurrency').addEventListener('change', () => {
    normalizeCurrencyInput($('taskCurrency'));
    updateTaskBudgetPreview();
  });
  $('taskBudget').addEventListener('input', updateTaskBudgetPreview);
  $('taskWorkMode').addEventListener('change', () => {
    const local = $('taskWorkMode').value === 'local';
    $('taskCountry').required = local;
    $('taskLocation').required = local;
  });
  $('offerCurrency').addEventListener('change', event => normalizeCurrencyInput(event.target));
  document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
  $('useSearchLocation').addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = $('searchLocationStatus');
    button.disabled = true;
    status.textContent = t('searchLocationSearching');
    try {
      searchLocationCoordinates = await readApproximateLocation();
      $('locationInput').value = '';
      status.textContent = t('searchLocationActive');
      renderWorkers();
    } catch (error) {
      status.textContent = error.message || t('searchLocationFailed');
    } finally {
      button.disabled = false;
    }
  });
  let marketplaceSearchTimer = null;
  const resolveMarketplaceCategory = value => taskCategories.find(category =>
    category.name.toLocaleLowerCase() === String(value || '').trim().toLocaleLowerCase()
  );
  const syncCategoryCards = () => {
    document.querySelectorAll('.category-card').forEach(card => {
      const category = resolveMarketplaceCategory(card.dataset.category);
      card.classList.toggle('selected', Boolean(category && category.id === activeCategoryId));
      card.setAttribute('aria-pressed', String(Boolean(category && category.id === activeCategoryId)));
    });
  };
  $('searchForm').addEventListener('submit', event => {
    event.preventDefault();
    const value = $('searchInput').value.trim();
    const matchedCategory = resolveMarketplaceCategory(value);
    if (mode === 'work') {
      $('taskCategoryFilter').value = matchedCategory?.name || '';
      $('taskCityFilter').value = $('locationInput').value.trim();
      workQuery = matchedCategory ? '' : value;
      renderTaskBoard().then(() => {
        $('taskBoardPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(error => toast(error.message));
      return;
    }
    query = matchedCategory ? '' : value;
    if (matchedCategory) {
      activeCategoryId = matchedCategory.id;
      activeCategory = matchedCategory.name;
    }
    syncCategoryCards();
    updateMarketplaceSuggestions();
    renderWorkers();
    document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('searchInput').addEventListener('input', () => {
    clearTimeout(marketplaceSearchTimer);
    const value = $('searchInput').value.trim();
    if (mode === 'hire') {
      const matchedCategory = resolveMarketplaceCategory(value);
      if (matchedCategory) {
        activeCategoryId = matchedCategory.id;
        activeCategory = matchedCategory.name;
        query = '';
      } else {
        activeCategoryId = '';
        activeCategory = '';
        query = value;
      }
      syncCategoryCards();
      marketplaceSearchTimer = setTimeout(renderWorkers, 180);
    } else {
      const matchedCategory = resolveMarketplaceCategory(value);
      $('taskCategoryFilter').value = matchedCategory?.name || '';
      workQuery = matchedCategory ? '' : value;
      marketplaceSearchTimer = setTimeout(() => {
        renderTaskBoard().catch(error => toast(error.message));
      }, 180);
      updateMarketplaceSuggestions();
    }
    renderMarketplaceFilterSummary();
  });
  $('searchInput').addEventListener('change', updateMarketplaceSuggestions);
  $('locationInput').addEventListener('input', () => {
    clearTimeout(marketplaceSearchTimer);
    searchLocationCoordinates = null;
    $('searchLocationStatus').textContent = '';
    if (mode === 'work') {
      $('taskCityFilter').value = $('locationInput').value.trim();
      marketplaceSearchTimer = setTimeout(() => {
        renderTaskBoard().catch(error => toast(error.message));
      }, 180);
    } else {
      marketplaceSearchTimer = setTimeout(renderWorkers, 180);
    }
  });
  $('locationInput').addEventListener('change', () => {
    if (mode === 'work') $('taskCityFilter').value = $('locationInput').value.trim();
    try {
      localStorage.setItem('time2income_marketplace_city', $('locationInput').value.trim());
    } catch (error) {
      console.warn('Could not save marketplace location preference:', error);
    }
    if (mode === 'work') {
      renderTaskBoard().catch(error => toast(error.message));
    } else {
      renderWorkers();
    }
  });
  document.querySelectorAll('.chip').forEach(button => {
    button.addEventListener('click', () => {
      $('searchInput').value = button.dataset.query;
      if (mode === 'work') {
        $('taskCategoryFilter').value = '';
        workQuery = button.dataset.query;
        renderTaskBoard().catch(error => toast(error.message));
        renderMarketplaceFilterSummary();
        return;
      }
      query = button.dataset.query;
      activeCategoryId = '';
      activeCategory = '';
      syncCategoryCards();
      renderWorkers();
      renderMarketplaceFilterSummary();
    });
  });
  document.querySelectorAll('.category-card').forEach(button => {
    button.addEventListener('click', () => {
      const category = resolveMarketplaceCategory(button.dataset.category);
      if (mode === 'work') {
        $('taskCategoryFilter').value = category?.name || '';
        $('taskCityFilter').value = $('locationInput').value.trim();
        workQuery = '';
        renderTaskBoard().catch(error => toast(error.message));
        $('taskBoardPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      activeCategoryId = category?.id || '';
      activeCategory = category?.name || '';
      query = '';
      $('searchInput').value = '';
      syncCategoryCards();
      updateMarketplaceSuggestions();
      renderWorkers();
      document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  $('typeFilter').addEventListener('change', renderWorkers);
  $('sortFilter').addEventListener('change', renderWorkers);
  $('clearFilters').addEventListener('click', () => {
    query = '';
    activeCategory = '';
    activeCategoryId = '';
    workQuery = '';
    $('searchInput').value = '';
    $('locationInput').value = '';
    searchLocationCoordinates = null;
    $('searchLocationStatus').textContent = '';
    $('typeFilter').value = 'all';
    $('sortFilter').value = 'recommended';
    $('taskCategoryFilter').value = '';
    $('taskCityFilter').value = '';
    syncCategoryCards();
    updateMarketplaceSuggestions();
    renderWorkers();
  });
  $('marketplaceFilterSummary').addEventListener('click', event => {
    if (event.target.closest('[data-clear-category]')) {
      activeCategory = '';
      activeCategoryId = '';
      syncCategoryCards();
      updateMarketplaceSuggestions();
      renderWorkers();
      return;
    }
    if (event.target.closest('[data-clear-search]')) {
      $('searchInput').value = '';
      query = '';
      workQuery = '';
      updateMarketplaceSuggestions();
      renderWorkers();
      renderMarketplaceFilterSummary();
    }
  });
  $('showAllBtn').addEventListener('click', () => {
    $('clearFilters').click();
    document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('changeLocationBtn').addEventListener('click', () => $('locationInput').focus());
  $('workerGrid').addEventListener('click', event => {
    handleWorkerAction(event).catch(error => toast(error.message));
  });
  $('myBookingsList').addEventListener('click', event => {
    const chatButton = event.target.closest('[data-booking-chat]');
    if (chatButton) {
      openBookingChat(chatButton.dataset.bookingChat).catch(() => toast(t('chatLoadError')));
      return;
    }
    handleBookingAction(event).catch(error => toast(error.message));
  });
  $('bookingChatForm').addEventListener('submit', sendBookingMessage);
  $('refreshBookingChatBtn').addEventListener('click', () => {
    loadBookingMessages().catch(() => toast(t('chatLoadError')));
  });
  $('closeBookingChatDialog').addEventListener('click', () => $('bookingChatDialog').close());
  $('bookingChatDialog').addEventListener('close', stopBookingChatPolling);
  $('myTasksList').addEventListener('click', event => {
    const editButton = event.target.closest('[data-task-edit]');
    if (editButton) {
      const task = myTasks.find(item => String(item.id) === editButton.dataset.taskEdit);
      if (task) openTaskForEditing(task);
      return;
    }
    const cancelButton = event.target.closest('[data-task-cancel]');
    if (cancelButton) {
      cancelOwnTask(cancelButton.dataset.taskCancel).catch(error => toast(error.message));
      return;
    }
    handleTaskOfferAction(event).catch(error => toast(error.message));
  });
  $('openTaskList').addEventListener('click', event => {
    const button = event.target.closest('[data-open-task-offer]');
    if (button) openTaskOffer(button.dataset.openTaskOffer);
  });
  $('taskCityFilter').addEventListener('input', () => {
    renderTaskBoard().catch(error => toast(error.message));
  });
  $('taskModeFilter').addEventListener('change', () => {
    renderTaskBoard().catch(error => toast(error.message));
  });
  let categoryRefreshTimer = null;
  let lastCategoryValue = $('taskCategoryFilter').value;
  const refreshForCategory = () => {
    const value = $('taskCategoryFilter').value;
    if (value === lastCategoryValue) return;
    lastCategoryValue = value;
    renderTaskBoard().catch(error => toast(error.message));
  };
  $('taskCategoryFilter').addEventListener('input', () => {
    clearTimeout(categoryRefreshTimer);
    categoryRefreshTimer = setTimeout(refreshForCategory, 250);
  });
  $('taskCategoryFilter').addEventListener('change', () => {
    clearTimeout(categoryRefreshTimer);
    refreshForCategory();
  });
  $('refreshTasksBtn').addEventListener('click', () => {
    renderTaskBoard().catch(error => toast(error.message));
  });
  $('offerForm').addEventListener('submit', submitTaskOffer);
  $('closeOfferDialog').addEventListener('click', () => $('offerDialog').close());
  $('cancelOffer').addEventListener('click', () => $('offerDialog').close());
  $('accountSummary').addEventListener('submit', event => {
    if (event.target.id === 'workerProfileForm') saveWorkerProfile(event);
    if (event.target.id === 'customerProfileForm') saveCustomerProfile(event);
  });
  $('accountSummary').addEventListener('click', event => {
    const setProfileLocationButton = event.target.closest('#setProfileLocationBtn');
    if (setProfileLocationButton) {
      const status = $('profileLocationStatus');
      setProfileLocationButton.disabled = true;
      status.textContent = t('searchLocationSearching');
      readApproximateLocation().then(coordinates => {
        $('profileServiceLatitude').value = (Math.round(coordinates.latitude * 10) / 10).toFixed(1);
        $('profileServiceLongitude').value = (Math.round(coordinates.longitude * 10) / 10).toFixed(1);
        $('clearProfileLocationBtn').hidden = false;
        status.textContent = t('providerLocationSet');
      }).catch(error => {
        status.textContent = error.message || t('providerLocationPermission');
      }).finally(() => {
        setProfileLocationButton.disabled = false;
      });
      return;
    }
    if (event.target.closest('#clearProfileLocationBtn')) {
      $('profileServiceLatitude').value = '';
      $('profileServiceLongitude').value = '';
      $('clearProfileLocationBtn').hidden = true;
      $('profileLocationStatus').textContent = t('providerLocationCleared');
      return;
    }
    const removeImageButton = event.target.closest('[data-remove-portfolio-image]');
    if (removeImageButton) {
      const index = Number(removeImageButton.dataset.removePortfolioImage);
      if (Number.isInteger(index) && index >= 0 && index < portfolioImagesDraft.length) {
        portfolioImagesDraft.splice(index, 1);
        $('profilePortfolioPreview').innerHTML = renderPortfolioPreview(portfolioImagesDraft);
      }
      return;
    }
    if (event.target.closest('#onboardingPostTaskBtn')) {
      openTaskDialog();
      return;
    }
    if (event.target.closest('#becomeWorkerBtn')) {
      addWorkerRoleToCurrentAccount().catch(error => toast(authErrorMessage(error)));
      return;
    }
    if (event.target.closest('#onboardingBrowseTasksBtn')) {
      $('taskBoardPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (event.target.closest('#unpublishWorkerBtn')) unpublishWorkerProfile();
  });
  const updateProfileCurrency = event => {
    if (event.target.id === 'profileCountry') applyCountrySuggestion('profileCountry', 'profileCurrency', true);
    if (event.target.id === 'customerCountry') applyCountrySuggestion('customerCountry', 'customerCurrency', true);
    if (event.target.id === 'profileCurrency' || event.target.id === 'customerCurrency') {
      const code = normalizeCurrencyInput(event.target);
      if (code) setPreferredCurrency(code);
    }
  };
  $('accountSummary').addEventListener('input', updateProfileCurrency);
  $('workerDialogBook').addEventListener('click', () => {
    if (selectedWorker) requestBooking(selectedWorker).catch(error => toast(error.message));
  });
  $('closeWorkerDialog').addEventListener('click', () => $('workerDialog').close());
  $('cancelWorkerDialog').addEventListener('click', () => $('workerDialog').close());
  $('signInBtn').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) toast(error.message);
  });
  $('providerBtn').addEventListener('click', () => {
    startProviderOnboarding().catch(error => toast(authErrorMessage(error)));
  });
  $('accountRole').addEventListener('change', () => {
    $('workerFields').classList.toggle('hidden', $('accountRole').value === 'client');
  });
  $('accountForm').addEventListener('submit', handleAccountSubmit);
  $('forgotPasswordBtn').addEventListener('click', sendPasswordReset);
  $('closeAccountDialog').addEventListener('click', () => $('accountDialog').close());
  $('cancelAccount').addEventListener('click', () => $('accountDialog').close());
  $('postTaskBtn').addEventListener('click', openTaskDialog);
  $('taskForm').addEventListener('submit', postTask);
  $('closeDialog').addEventListener('click', () => $('taskDialog').close());
  $('cancelTask').addEventListener('click', () => $('taskDialog').close());
  $('refreshActivityBtn').addEventListener('click', () => {
    renderActivity().catch(error => toast(error.message));
  });

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') openAccountDialog('recovery');
    setTimeout(() => syncSession(session), 0);
  });

  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    syncSession(data.session);
  }).catch(error => {
    console.error('Session load failed:', error);
    location.replace('auth.html?mode=signin');
  });
}

initializeApp();
setupSearchableDropdowns();
(function setupIncomeCalculator() {
  const hours = document.getElementById('calcHours');
  const rate = document.getElementById('calcRate');
  const weeks = document.getElementById('calcWeeks');
  const out = document.getElementById('incomeCalcResult');
  if (!hours || !rate || !weeks || !out) return;
  function update() {
    const total = Math.max(0, Number(hours.value) || 0) * Math.max(0, Number(rate.value) || 0) * Math.max(0, Number(weeks.value) || 0);
    const amount = window.TIME2INCOME_CURRENCY.formatOriginal(Math.round(total), preferredCurrency, getFormatLocale());
    out.textContent = `${t('incomeEstimate')}: ${amount} ${t('perMonth')} (${t('estimateDisclaimer')})`;
  }
  [hours, rate, weeks].forEach(el => el.addEventListener('input', update));
  window.addEventListener('time2income:displaychange', update);
  update();
})();

(function setupIncomeFinder() {
  const form = document.getElementById('incomeFinderForm');
  const list = document.getElementById('finderResults');
  if (!form || !list) return;
  const ideas = {
    digital: {
      remote: [['ideaDigitalRemoteTitle', 'ideaDigitalRemoteText']],
      local: [['ideaDigitalLocalTitle', 'ideaDigitalLocalText']]
    },
    teaching: {
      remote: [['ideaTeachingRemoteTitle', 'ideaTeachingRemoteText']],
      local: [['ideaTeachingLocalTitle', 'ideaTeachingLocalText']]
    },
    home: {
      remote: [['ideaHomeRemoteTitle', 'ideaHomeRemoteText']],
      local: [['ideaHomeLocalTitle', 'ideaHomeLocalText']]
    },
    driving: {
      remote: [['ideaDrivingRemoteTitle', 'ideaDrivingRemoteText']],
      local: [['ideaDrivingLocalTitle', 'ideaDrivingLocalText']]
    },
    people: {
      remote: [['ideaPeopleRemoteTitle', 'ideaPeopleRemoteText']],
      local: [['ideaPeopleLocalTitle', 'ideaPeopleLocalText']]
    }
  };
  const hoursNote = {
    low: 'timeNoteLow',
    mid: 'timeNoteMid',
    high: 'timeNoteHigh'
  };
  function render() {
    const skill = document.getElementById('finderSkill').value;
    const hours = document.getElementById('finderHours').value;
    const mode = document.getElementById('finderMode').value;
    const items = (ideas[skill] && ideas[skill][mode]) || [];
    list.innerHTML = items.map(([titleKey, textKey]) =>
      `<li><strong>${safeText(t(titleKey))}</strong>${safeText(t(textKey))}</li>`
    ).join('') + `<li>${safeText(t(hoursNote[hours] || 'timeNoteMid'))}</li>`;
  }
  form.addEventListener('change', render);
  window.addEventListener('time2income:displaychange', render);
  render();
})();

(function setupChallenge() {
  const list = document.getElementById('challengeList');
  const progress = document.getElementById('challengeProgress');
  if (!list || !progress) return;
  const steps = [
    'challengeDay1',
    'challengeDay2',
    'challengeDay3',
    'challengeDay4',
    'challengeDay5',
    'challengeDay6',
    'challengeDay7'
  ];
  const KEY = 'time2income_challenge';
  let done = [];
  try { done = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { done = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { } }
  function render() {
    list.innerHTML = steps.map((key, i) => `<li class="${done.includes(i) ? 'done' : ''}"><label><input type="checkbox" data-step="${i}" ${done.includes(i) ? 'checked' : ''}><span>${safeText(t(key))}</span></label></li>`).join('');
    progress.textContent = `${done.length} / ${steps.length} ${t('stepsComplete')}`;
  }
  list.addEventListener('change', event => {
    const box = event.target.closest('input[data-step]');
    if (!box) return;
    const i = Number(box.dataset.step);
    done = box.checked ? [...new Set([...done, i])] : done.filter(n => n !== i);
    save();
    render();
  });
  window.addEventListener('time2income:displaychange', render);
  render();
})();

(function setupShareButton() {
  const btn = document.getElementById('shareSiteBtn');
  if (!btn) return;
  const url = 'https://time2income.com/';
  btn.addEventListener('click', async () => {
    const text = `TIME2INCOME: ${t('shareMessage')}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'TIME2INCOME', text, url });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
  });
})();

function getSavedWorkers() {
  try { return JSON.parse(localStorage.getItem('time2income_saved_workers') || '[]'); } catch (e) { return []; }
}
function isSavedWorker(id) {
  return getSavedWorkers().includes(String(id));
}
(function setupSavedWorkers() {
  const grid = document.getElementById('workerGrid');
  if (!grid) return;
  grid.addEventListener('click', event => {
    const btn = event.target.closest('[data-save-worker]');
    if (!btn) return;
    const id = btn.dataset.saveWorker;
    const saved = getSavedWorkers();
    const next = saved.includes(id) ? saved.filter(x => x !== id) : saved.concat(id);
    try { localStorage.setItem('time2income_saved_workers', JSON.stringify(next)); } catch (e) { }
    const on = next.includes(id);
    btn.textContent = on ? '♥' : '♡';
    btn.setAttribute('aria-pressed', on);
  });
})();

(function setupEmergency() {
  const countryInput = document.getElementById('emergencyCountry');
  const countryOptions = document.getElementById('emergencyCountryOptions');
  const list = document.getElementById('emergencyList');
  if (!countryInput || !countryOptions || !list) return;
  const data = [
    ['India', [['emergencyAll', '112'], ['emergencyPolice', '100'], ['emergencyAmbulance', '108'], ['emergencyFire', '101'], ['emergencyWomen', '1091']]],
    ['United States / Canada', [['emergencyPoliceAmbulanceFire', '911']]],
    ['United Kingdom', [['emergencyPoliceAmbulanceFire', '999'], ['emergencyAllAlt', '112']]],
    ['European Union', [['emergencyAll', '112']]],
    ['Australia', [['emergencyPoliceAmbulanceFire', '000']]],
    ['New Zealand', [['emergencyPoliceAmbulanceFire', '111']]],
    ['United Arab Emirates', [['emergencyPolice', '999'], ['emergencyAmbulance', '998'], ['emergencyFire', '997']]],
    ['Saudi Arabia', [['emergencyAll', '911']]],
    ['Singapore', [['emergencyPolice', '999'], ['emergencyAmbulanceFire', '995']]],
    ['Pakistan', [['emergencyPolice', '15'], ['emergencyRescueAmbulance', '1122']]],
    ['Bangladesh', [['emergencyAll', '999']]],
    ['Nepal', [['emergencyPolice', '100'], ['emergencyAmbulance', '102'], ['emergencyFire', '101']]],
    ['Sri Lanka', [['emergencyPolice', '119'], ['emergencyAmbulance', '1990']]],
    ['Japan', [['emergencyPolice', '110'], ['emergencyAmbulanceFire', '119']]],
    ['China', [['emergencyPolice', '110'], ['emergencyAmbulance', '120'], ['emergencyFire', '119']]],
    ['Malaysia', [['emergencyAll', '999']]],
    ['Indonesia', [['emergencyAll', '112']]],
    ['Philippines', [['emergencyAll', '911']]],
    ['South Africa', [['emergencyAllMobile', '112'], ['emergencyPolice', '10111'], ['emergencyAmbulance', '10177']]],
    ['Nigeria', [['emergencyAll', '112']]],
    ['Kenya', [['emergencyAll', '999'], ['emergencyAlt', '112']]],
    ['Brazil', [['emergencyPolice', '190'], ['emergencyAmbulance', '192'], ['emergencyFire', '193']]],
    ['Mexico', [['emergencyAll', '911']]]
  ];
  countryOptions.innerHTML = data.map(([country]) => `<option value="${safeText(country)}"></option>`).join('');
  countryInput.value = 'India';
  function render() {
    const entry = data.find(([country]) => country.toLocaleLowerCase() === countryInput.value.trim().toLocaleLowerCase());
    if (!entry) {
      list.innerHTML = `<li class="emergency-note">${safeText(t('emergencyNoCountry'))}</li>`;
      return;
    }
    list.innerHTML = entry[1].map(([labelKey, number]) =>
      `<li><strong>${safeText(t(labelKey))}</strong><a class="btn btn-primary" href="tel:${number}">${safeText(t('emergencyCall'))} ${number}</a></li>`
    ).join('') + `<li class="emergency-note">${safeText(t('emergencyCountryNote'))}</li>`;
  }
  countryInput.addEventListener('input', render);
  countryInput.addEventListener('change', render);
  window.addEventListener('time2income:displaychange', render);
  render();

  const btn = document.getElementById('shareLocationBtn');
  const status = document.getElementById('locationStatus');
  if (!btn || !status) return;
  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = t('locationUnavailable');
      return;
    }
    status.textContent = t('locationSearching');
    navigator.geolocation.getCurrentPosition(pos => {
      const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      const text = `${t('shareLocationText')} ${link}`;
      status.textContent = '';
      if (navigator.share) {
        navigator.share({ title: t('shareLocationTitle'), text }).catch(() => { });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    }, () => {
      status.textContent = t('locationNotFound');
    }, { enableHighAccuracy: true, timeout: 15000 });
  });
})();

(function setupTutorialTour() {
  const play = document.getElementById('tourPlayBtn');
  const stop = document.getElementById('tourStopBtn');
  const caption = document.getElementById('tourCaption');
  const note = document.getElementById('tourNote');
  if (!play || !stop || !caption || !note) return;
  const steps = [
    ['explore', 'tourExplore'],
    ['activity', 'tourActivity'],
    ['incomeCalc', 'tourIncomeCalc'],
    ['incomeFinder', 'tourIncomeFinder'],
    ['challenge', 'tourChallenge'],
    ['emergency', 'tourEmergency'],
    ['faq', 'tourFaq'],
    ['worker', 'tourWorker']
  ];
  let running = false;
  let current = null;
  const synth = window.speechSynthesis;
  function clearHighlight() { if (current) current.classList.remove('tour-highlight'); current = null; }
  function end() {
    running = false;
    clearHighlight();
    caption.hidden = true;
    stop.hidden = true;
    play.hidden = false;
    if (synth) synth.cancel();
  }
  function pickVoice(lang) {
    const voices = synth ? synth.getVoices() : [];
    return voices.find(v => v.lang && v.lang.toLowerCase().indexOf(lang.slice(0, 2).toLowerCase()) === 0) || null;
  }
  function speak(text, lang, done) {
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { setTimeout(done, 4500); return; }
    const u = new SpeechSynthesisUtterance(text);
    const code = getLanguage(lang).locale;
    u.lang = code;
    const v = pickVoice(code);
    if (v) u.voice = v;
    else note.textContent = t('tourVoiceUnavailable');
    let finished = false;
    const finish = () => { if (!finished) { finished = true; done(); } };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 15000);
    synth.speak(u);
  }
  function run(i, lang) {
    if (!running) return;
    if (i >= steps.length) { end(); return; }
    const [id, key] = steps[i];
    const el = document.getElementById(id);
    clearHighlight();
    if (el) {
      current = el;
      el.classList.add('tour-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const text = t(key);
    caption.textContent = text;
    caption.hidden = false;
    setTimeout(() => speak(text, lang, () => setTimeout(() => run(i + 1, lang), 600)), 700);
  }
  play.addEventListener('click', () => {
    note.textContent = '';
    if (synth) synth.cancel();
    const language = translations[locale]?.tourExplore ? locale : 'en';
    running = true;
    play.hidden = true;
    stop.hidden = false;
    run(0, language);
  });
  stop.addEventListener('click', end);
  window.addEventListener('time2income:displaychange', () => {
    if (running) end();
  });
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = () => { };
})();
