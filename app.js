
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
let marketplaceDataLoadUserId = null;
let marketplaceDataLoadPromise = null;
let accountMode = 'signup';
let websiteGuideStep = 0;
let websiteGuideShownForSessionUserId = null;
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
let marketplaceLocationContext = window.TIME2INCOME_LOCATION?.getSelected() || null;
let searchLocationCoordinates = marketplaceLocationContext &&
  Number.isFinite(marketplaceLocationContext.latitude) &&
  Number.isFinite(marketplaceLocationContext.longitude)
  ? { latitude: marketplaceLocationContext.latitude, longitude: marketplaceLocationContext.longitude }
  : null;
const NEARBY_PROVIDER_RADIUS_KM = 15;
let demoTasks = [];
let taskCategories = [];
let accountProfile = null;
let currentWorkerProfile = null;
let nearbyAlertPreferences = null;
let nearbyAlertPreferencesError = null;
let nearbyPushEnabled = false;
let nearbyAlertChannel = null;
let nearbyAlertChannelUserId = null;
let currentIdentityVerified = false;
let identityVerificationRequest = null;
let identityVerificationAvailable = false;
let identityDocumentReviewRequest = null;
let identityDocumentReviewAvailable = false;
let accountPrivacyRequests = [];
let accountPrivacyRequestsAvailable = false;
let profilePhotoColumnAvailable = true;
let identitySelfiePreviewUrl = null;
let profilePhotoPreviewUrl = null;
let accountProfilePhotoUrl = '';
let portfolioImagesDraft = [];
let selectedWorker = null;
let selectedTask = null;
let editingTaskId = null;
let taskOfferStatuses = {};
let openTasks = [];
let taskDescriptions = {};
let myTasks = [];
let bookingRecords = [];
let activityRenderPromise = null;
let taskBoardRenderPromise = null;
let nearbySkillLoadRequest = 0;
let walletLoadRequest = 0;
let t2iWalletLoadRequest = 0;
let t2iTaskPostIdempotencyKey = null;
let t2iTaskPostPayloadSnapshot = '';
let t2iTransferAttempt = null;
let t2iCelebrationTimer = null;
const t2iCelebrationsSeen = new Set();
const t2iTaskOpenIdempotencyKeys = new Map();
let walletCreditRequests = [];
let walletIsAdmin = false;
let activeBookingChatId = null;
let bookingChatPoll = null;
let bookingChatWritable = false;
let bookingChatBlocked = false;
let pendingSafetyBookingId = null;
let selectedChatFiles = [];
const MAX_CHAT_FILE_BYTES = 5 * 1024 * 1024 * 1024;

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
    taskSkillSuggestionHint:'Skill ideas can help start your title. Add details below and choose the matching category.',
    taskDetailsPlaceholder:'Describe the work, timing and requirements',
    optional:'Optional', selectCountry:'Select or type country', cityOrRegion:'City or region',
    yourName:'Your name', emailPlaceholder:'you@example.com', passwordPlaceholder:'At least 8 characters',
    passwordNotice:'Your password is managed by Supabase Authentication. Never share your password with anyone.',
    signIn:'Sign in', signOut:'Sign out', join:'Join', accountAccess:'ACCOUNT ACCESS',
    myActivity:'My activity', myDashboard:'MY DASHBOARD',
    activityIntro:'View your posted tasks and booking requests.',
    openTasks:'Open tasks', openTasksIntro:'Find customer requests by skill, category, city and work mode',
    taskSkillFilterLabel:'Skill or keyword',
    taskSkillFilterPlaceholder:'Search or choose a skill',
    taskSkillFilterHint:'Search request titles and categories by skill or keyword. Private task details stay hidden until you open a request.',
    refreshTasks:'Refresh tasks', refreshActivity:'Refresh activity',
    tasksIPosted:'Tasks I posted', taskHistory:'Your task history',
    editTask:'Edit task', taskEditUsed:'One-time edit used', deleteTask:'Delete task', postTaskTitle:'What do you need help with?',
    saveTaskChanges:'Save changes', taskUpdatedToast:'Task updated.',
    taskOpen:'Open task',
    taskPostFeeNotice:'Posting a task costs 1 T2I. Your balance is checked before the task is posted.',
    taskOpenFeeNotice:'Opening a task costs 1 T2I. Reopening a task you already unlocked is free.',
    nearbyAlertsTitle:'Nearby alerts',
    nearbyAlertsIntro:'Get local task or provider alerts within 15 km. Matching categories are notified first, all opted-in nearby users are notified 30 minutes later.',
    nearbyAlertsCategories:'Choose categories you want alerts for',
    nearbyAlertsPrivacy:'Your approximate location is stored privately and used only to match nearby alerts. Browser notifications require separate permission.',
    nearbyAlertsLocationConsent:'I agree to share my approximate location privately for nearby alerts.',
    nearbyAlertsEnable:'Enable nearby alerts',
    nearbyAlertsDisable:'Turn off nearby alerts',
    nearbyAlertsPush:'Enable browser notifications',
    nearbyAlertsEnabled:'Nearby alerts are enabled for this account.',
    nearbyAlertsDisabled:'Nearby alerts are turned off.',
    nearbyAlertsPushEnabled:'Browser notifications are enabled on this device.',
    nearbyAlertsPushUnavailable:'Browser push is not configured yet. Ask the site administrator to finish push setup.',
    nearbyAlertsSetupRequired:'Nearby alert setup is not installed on the server yet.',
    nearbyAlertsNoCategories:'Categories are not available yet. Try again after marketplace setup finishes.',
    nearbyAlertsLocationFailed:'Nearby alert preferences could not be saved.',
    nearbyAlertsPushDenied:'Allow notifications in your browser settings, then try again.',
    nearbyAlertsOptInRequired:'Enable nearby alerts before enabling browser notifications.',
    taskPaymentDescription:'TIME2INCOME task action',
    taskPaymentClosed:'Checkout was closed; no action was completed.',
    taskPaymentFailed:'Payment could not be verified. No action was completed.',
    bookingPaymentDescription:'TIME2INCOME booking acceptance fee', acceptFeeHint:'A small acceptance fee applies. Chat opens right after you accept.',
    checkoutQuoteKicker:'CHECKOUT BREAKDOWN', checkoutQuoteTitle:'Review your total',
    checkoutQuoteIntro:'This is the full platform checkout fee for this action. Confirm to continue directly to secure payment.',
    checkoutQuoteWalletIntro:'Any available wallet credit may be applied to this total first; the remaining balance goes to secure payment.',
    checkoutCountry:'Your country', checkoutRegion:'State / province',
    checkoutCategory:'Malaysia service category', checkoutFixed:'Fixed charge',
    checkoutServiceFee:'Service fee (5%)', checkoutPlatformFee:'Platform fee (5%)',
    checkoutSubtotal:'Fee subtotal', checkoutTax:'Assumed local tax',
    checkoutGateway:'Gateway recovery (gross-up)', checkoutTotal:'Final checkout total',
    checkoutCancel:'Cancel', checkoutContinue:'Continue to secure payment',
    checkoutSelectCountry:'Choose a country to see the checkout breakdown.',
    checkoutSelectRegion:'Select a listed state or province to calculate the tax.',
    checkoutSelectCategory:'Select a service category to calculate the tax.',
    checkoutSelectRegionPlaceholder:'Select state / province',
    checkoutSelectCategoryPlaceholder:'Select service category',
    checkoutGatewayNote:'{rate}% assumed effective payment-gateway rate. The collected amount is rounded up to the currency’s supported minor unit.',
    checkoutBrazilNote:'Brazil uses the 5% planning assumption from your pricing chart; this is not a confirmed statutory tax rate.',
    checkoutGeneralNote:'Tax and gateway rates follow the supplied planning chart and may require legal and payment-provider validation.',
    checkoutWalletApplied:'wallet credit applied: {amount}',
    walletButton:'My Wallet',
    t2iBackMarketplace:'Back to marketplace',
    t2iWalletTitle:'TIME2INCOME Token Wallet',
    t2iWalletIntro:'Your T2I tokens and wallet activity',
    t2iWalletActions:'Wallet actions',
    t2iPendingSetup:'Pending setup',
    t2iWalletTotal:'Available T2I',
    t2iPromotionalBalance:'Free promotional tokens',
    t2iPurchasedBalance:'Purchased tokens',
    t2iWorkerEarnings:'Worker earnings (not spendable yet)',
    t2iWelcomeReward:'Welcome reward',
    t2iWelcomeRewardNote:'Your one-time 100 T2I welcome reward does not expire.',
    t2iTokenPolicy:'You can transfer T2I internally to another signed-in TIME2INCOME user with their wallet code. T2I cannot be withdrawn, converted to cash, or sent to external wallets.',
    t2iBuyAction:'Buy T2I',
    t2iSendAction:'Send',
    t2iReceiveAction:'Receive',
    t2iHistoryAction:'History',
    t2iHowToUse:'How you can use T2I',
    t2iPostTaskCost:'Post task · 1 T2I',
    t2iOpenTaskCost:'Open task · 1 T2I',
    t2iPublishProfileCost:'Publish profile · 1 T2I',
    t2iPremiumAccessCost:'Premium profile · 1 T2I',
    t2iComingSoon:'Coming soon',
    t2iRewardBannerTitle:'New user reward!',
    t2iRewardBannerBody:'Every eligible account receives a one-time 100 T2I reward.',
    t2iSendUnavailable:'Internal transfers are temporarily unavailable.',
    t2iReceiveUnavailable:'Your internal wallet code is not available yet.',
    t2iTransferTitle:'Send T2I to another user',
    t2iTransferIntro:'Enter the recipient’s T2I wallet code. Transfers are immediate and cannot be undone.',
    t2iTransferRecipientCode:'Recipient wallet code',
    t2iTransferAmount:'Amount (whole T2I)',
    t2iTransferSubmit:'Review and send',
    t2iTransferConfirm:'Send {amount} T2I to {code}? This transfer cannot be undone.',
    t2iTransferSuccess:'Transfer complete. {amount} T2I sent.',
    t2iTransferFailed:'Transfer could not be completed.',
    t2iTransferPending:'Processing your T2I transfer…',
    t2iTransferInsufficient:'You do not have enough available T2I for this transfer.',
    t2iTransferRecipientUnavailable:'That wallet code is unavailable. Check it and try again.',
    t2iTransferCodeInvalid:'Enter a wallet code in the format T2I- followed by 16 hexadecimal characters.',
    t2iTransferCopy:'Copy my wallet code',
    t2iTransferCopied:'Wallet code copied. Share it to receive T2I.',
    t2iTransferCopyFailed:'Could not copy the code. Please select and copy it manually.',
    t2iTransferCodeTitle:'Your T2I wallet code',
    t2iTransferCodeHelp:'Share this code with another signed-in user to receive T2I. Never share your password or sign-in code.',
    t2iTransferNote:'Internal T2I transfers only. They are immediate, non-refundable, and cannot be converted to cash.',
    t2iHistoryTransferSent:'T2I sent',
    t2iHistoryTransferReceived:'T2I received',
    t2iRewardCelebrate:'🎁 Your 100 T2I reward is here!',
    t2iPurchaseCelebrate:'✨ Your T2I purchase is confirmed!',
    t2iRewardCelebrationClose:'Close celebration',
    t2iBackWallet:'Back to My Wallet',
    t2iBuyHeroTitle:'Buy T2I Tokens',
    t2iBuyHeroBody:'The same numeric package base prices are shown in each listed local currency, fee estimates and payment availability depend on country.',
    t2iNoExpiryLabel:'No expiry on tokens',
    t2iSelectPackage:'Select token package',
    t2iMostPopular:'Most popular',
    t2iTokensPerHundred:'per 100 T2I',
    t2iPackageIndiaNote:'The country list follows the 249 profile countries and territories. Package prices use the same numeric amount in each listed local currency, not exchange-rate conversion. Local payment acceptance and checkout fees or taxes have not been verified for every location.',
    t2iCountryEstimateUnavailable:'Base prices are shown in this country’s listed currency. Fee estimates and payment support are not configured here, so checkout is unavailable.',
    t2iEstimateUnavailable:'Estimate unavailable',
    t2iPackageBaseLabel:'Token package base price',
    t2iPackageEstimatedTotal:'Estimated checkout total',
    t2iPackageTaxEstimate:'Estimated tax',
    t2iPackageProvisionalNote:'The displayed tax and gateway charges are planning estimates, not the payment amount. Any enabled package uses its exact server-approved total; no payment is available until a country and package are explicitly enabled.',
    t2iTokenDisclaimerTitle:'T2I Token Purchase Disclaimer',
    t2iTokenDisclaimerBody:'T2I Tokens are platform utility tokens purchased for accessing eligible services and features within TIME2INCOME. They are not real money, investments, deposits, or guaranteed monetary-value assets. Tokens can be used for eligible activities such as posting tasks, publishing profiles, accessing premium features, and other services listed on our platform. Tokens do not expire under the current policy and remain in your wallet until used, subject to account and platform terms. Purchased tokens are generally non-refundable and cannot be exchanged for cash, withdrawn, or transferred outside the platform. Please review token prices and usage details carefully before purchasing. Legally required refunds and verified technical-error corrections remain applicable.',
    t2iTokenDisclaimerAgreement:'I have read and agree to the T2I Token Purchase Disclaimer and understand the token usage and refund policy.',
    t2iLocalPrice:'Base price (your local currency)',
    t2iYouReceive:'You will receive exactly 100 T2I tokens.',
    t2iPriceBreakdown:'Price breakdown',
    t2iPackageLine:'Token package (100 T2I)',
    t2iTaxLine:'Applicable taxes',
    t2iGatewayLine:'Payment gateway fee',
    t2iPlatformFeeLine:'Platform service fee',
    t2iTotalPayable:'Estimated total',
    t2iPurchasePending:'Estimate uses provisional country tax and gateway rates. Token purchases are not available yet; no payment will be collected.',
    t2iPurchaseNotEnabled:'Token payments are not enabled for this country and package. No payment will be collected.',
    t2iPurchasePackagesError:'Could not verify available token packages. Payment is unavailable; please try again later.',
    t2iPurchaseCheckoutError:'Secure token checkout is unavailable. No payment was started.',
    t2iPurchaseSuccess:'Payment confirmed. Your T2I tokens have been added to your wallet.',
    t2iPurchaseVerifyError:'Payment could not be verified. If you were charged, check your wallet activity or contact support before retrying.',
    t2iPurchaseStarting:'Preparing secure checkout…',
    t2iPurchaseCancelled:'Checkout was closed. No token credit was made.',
    t2iPackageCheckoutTotal:'Final checkout total',
    t2iProceedPay:'Proceed to pay',
    t2iHistoryTitle:'Token activity',
    t2iHistoryEmpty:'Your T2I activity will appear here.',
    t2iHistoryWelcome:'Welcome reward',
    t2iHistoryTaskPost:'Task post',
    t2iHistoryTaskOpen:'Open task',
    t2iHistoryProfilePublish:'Publish profile',
    t2iHistoryPremiumProfile:'Premium profile access',
    t2iHistoryPurchase:'Token purchase',
    t2iHistoryWorkerEarning:'Worker earning',
    t2iHistoryRefund:'Refund',
    t2iHistoryAdminAdjustment:'Account adjustment',
    t2iPurchaseTitle:'Buy T2I',
    t2iPurchasePackage:'Mini package · 100 T2I',
    t2iPurchaseDisabled:'Purchases are not available yet. No payment will be collected.',
    t2iBuyTokens:'View token package',
    t2iNoExpiry:'Promotional tokens never expire.',
    t2iConfirmSpend:'This action costs {cost} T2I. Your balance after it will be {balance} T2I. Continue?',
    t2iInsufficient:'You need {cost} T2I, but your available balance is {balance}. Token purchases are not enabled yet.',
    t2iInsufficientRace:'Your T2I balance changed before this action. Check My Wallet and try again.',
    t2iBalanceLoading:'Loading your token wallet…',
    t2iBalanceError:'Your T2I wallet could not be loaded. Please try again.',
    t2iAdminTitle:'Token pricing controls',
    t2iAdminServiceTitle:'Marketplace service costs',
    t2iAdminRegionalTitle:'Regional purchase package settings',
    t2iAdminService:'Service',
    t2iAdminCost:'Cost (T2I)',
    t2iAdminEnabled:'Enabled',
    t2iAdminCountry:'Country code',
    t2iAdminCurrency:'Currency',
    t2iAdminPackageSize:'Package token amount',
    t2iAdminBasePrice:'Base price (local units)',
    t2iAdminTaxes:'Tax configuration (JSON)',
    t2iAdminGateway:'Gateway fee configuration (JSON)',
    t2iAdminPlatformFee:'Platform fee configuration (JSON)',
    t2iAdminPackageAvailable:'Package available',
    t2iAdminSave:'Save settings',
    t2iAdminSaved:'Token pricing settings saved.',
    t2iAdminSettingsError:'Token pricing settings could not be loaded.',
    t2iAdminRegionalRows:'Configured regional packages',
    t2iConfirmActionError:'T2I cost could not be confirmed. No tokens were deducted.',
    walletOverview:'WALLET OVERVIEW',
    walletTitle:'TIME2INCOME Wallet',
    walletIntro:'See your credits, reservations, and wallet activity in one place.',
    walletTokenLabel:'T2I token balance',
    walletTokenUnit:'T2I tokens',
    walletTokenNote:'Preview only—no tokens have been issued. This is not a spendable or transferable balance.',
    walletCreditExplainer:'These are wallet credits in the currency shown, not cryptocurrency tokens or withdrawable cash. Each currency has a separate balance, credits can only be used for eligible future task-action fees.',
    walletNoBalance:'No wallet credits yet. Credits approved by support will appear here.',
    walletByCurrency:'Credits by currency',
    walletTotalCredit:'Total wallet credit',
    walletSandboxNote:'Sandbox preview only. This wallet is not active for live payments.',
    walletPolicyNote:'Credits are non-withdrawable and apply only to future task-action fees. Proposed 60-day expiry is pending legal review.',
    walletRefresh:'Refresh wallet',
    walletBalance:'Balance',
    walletAvailable:'Available',
    walletReserved:'Reserved at checkout',
    walletHistory:'Wallet history',
    walletNoHistory:'No wallet transactions yet.',
    walletExpiry:'Expires',
    walletSupportForm:'Report a payment issue',
    walletIssueType:'Issue type',
    walletDuplicate:'Duplicate payment',
    walletFailedAction:'Failed task action',
    walletTechnical:'Verified technical or payment issue',
    walletEvidenceLabel:'Payment screenshot (optional)',
    walletEvidenceHint:'JPG, PNG, or WebP up to 5 MB. Hide card details, passwords, and verification codes before uploading.',
    walletEvidenceInvalidType:'Choose a JPG, PNG, or WebP image.',
    walletEvidenceTooLarge:'The screenshot must be 5 MB or smaller.',
    walletEvidenceUploading:'Uploading screenshot securely…',
    walletEvidenceFileReady:'Screenshot selected',
    walletEvidenceView:'View payment screenshot',
    walletEvidenceUnavailable:'Payment screenshot is unavailable.',
    walletReference:'Payment/provider reference',
    walletCurrency:'Currency',
    walletClaimedAmount:'Amount paid',
    walletDetails:'Describe the issue',
    walletSendRequest:'Send to support for review',
    walletRequestSent:'Your request was sent to support for verification.',
    walletRequestReturned:'The reserved wallet credits were returned to your available balance.',
    walletRequestFailed:'The support request could not be sent. Your payment status was not changed.',
    walletReviewQueue:'Support review queue',
    walletNoRequests:'No requests are waiting for review.',
    walletApprovedAmount:'Approved credit',
    walletReviewNote:'Review notes',
    walletApprove:'Approve credit',
    walletReject:'Reject request',
    walletReviewSaved:'Support review saved.',
    walletSetupRequired:'Wallet services are unavailable right now. Please try again later.',
    walletStatusPending:'Pending review',
    walletStatusApproved:'Approved',
    walletStatusRejected:'Rejected',
    walletPartialApplied:'Wallet credits were reserved; Razorpay will charge the remaining amount.',
    taskCurrencyUnsupported:'Your preferred currency is not supported for task charges. Choose a supported currency in your account settings.',
    taskCancelledToast:'Task deleted.',
    confirmCancelTask:'Remove this open task from the marketplace? It will no longer be visible to others, but a restricted record may be retained for safety, reports, or disputes.',
    taskNoLongerEditable:'This task is no longer open or has already used its one edit.',
    taskExpiresAt:'Active until',
    status_expired:'Expired',
    taskPostLimitReached:'You have reached the limit of 5 task posts in 24 hours. You can post again after {time}.',
    taskPostLimitSetupRequired:'Task-post limits are not configured on the server yet. Please contact support.',
    bookingRequests:'Booking requests', serviceRequests:'Your service requests',
    accountRolePrompt:'How will you use the platform?', bothRoles:'Both: hire and offer skills',
    languageSearch:'Search language', city:'City', state:'State', country:'Country',
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
    accountSkillPlaceholder:'Search or choose a skill',
    accountSkillHint:'Type to search or choose a suggested skill.',
    additionalSkills:'Additional skills', addSkill:'Add skill', removeSkill:'Remove',
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
    chatSafety:'Only the customer and provider on this booking can read these messages. Keep coordination here, never share passwords, verification codes, or payment details.',
    chatSafetyTitle:'Keep your conversation respectful',
    chatSafetyNotice:'Please keep messages respectful and related to the booking. Do not harass, threaten, or share passwords, verification codes, or sensitive financial information. You can report inappropriate behavior or block this booking chat. TIME2INCOME provides the connection platform, users are responsible for their own agreements and conduct. We review reports and take action under our policies.',
    chatSafetyContinue:'I understand - open chat',
    chatReport:'Report',
    chatBlock:'Block chat',
    chatBlocked:'This booking chat is blocked. New messages are disabled.',
    chatBlockConfirm:'Block this booking chat? Neither participant will be able to send more messages here.',
    chatReportTitle:'Report this conversation',
    chatReportReason:'Reason for report',
    chatReportSelectReason:'Choose a reason',
    chatReportHarassment:'Harassment or abusive behavior',
    chatReportScam:'Scam or suspicious payment request',
    chatReportSafety:'Safety concern',
    chatReportOther:'Other',
    chatReportDetails:'Additional details (optional)',
    chatReportSubmit:'Submit report',
    chatReportSent:'Report submitted. Our team will review it.',
    chatReportError:'Unable to submit your report. Please try again.',
    chatBlockError:'Unable to block this booking chat. Please try again.',
    chatOnlyAfterAcceptance:'Chat opens after the provider accepts the booking.',
    chatWaitingForAcceptance:'Chat is available after the provider accepts.',
    chatMessageLabel:'Message', chatMessagePlaceholder:'Write a message...',
    chatAttachFile:'Attach file', chatUploadQueued:'File queued for upload.',
    chatUploadProgress:'Uploading {count} file(s)...', chatUploadError:'Unable to upload selected file(s).',
    chatAttachment:'Attachment', chatDownload:'Download', sendMessage:'Send message', refreshMessages:'Refresh messages',
    chatNoMessages:'No messages yet. Send a message to coordinate the booking.',
    chatActive:'Messaging is open for this booking.',    chatReadOnly:'This booking has ended. You can view earlier messages, but cannot send new ones.',
    chatLoadError:'Unable to load booking messages.',
    navMessages:'Messages', chatNewMessages:'New messages', chatNewMessageFrom:'New message from', chatYou:'You',
    chatSendError:'Unable to send this message. Check your connection and try again.',
    you:'You',
    startWork:'Start work', markWorkComplete:'Mark work complete',
    confirmWorkComplete:'Confirm work complete', reportIssue:'Report an issue',
    browseNextTasks:'Browse next tasks', postNextTask:'Post another task',
    leaveReview:'Leave a review', reviewCustomer:'Review customer', reviewProvider:'Review provider', reviewed:'Reviewed', reviewPrompt:'Rating (1-5)?', reviewCommentPrompt:'Short comment (optional)', reviewThanks:'Thanks for your review!', reviewError:'Could not save the review.', reviewInvalidRating:'Enter a rating from 1 to 5.', reviewAlreadyReviewed:'You have already reviewed this person for this booking.', reviewPermissionError:'Only the customer or provider in a completed booking can leave a review.', reviewCommentTooLong:'Review comments must be 1000 characters or fewer.',
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
    budgetPreview:'Budget preview', conversionNote:'Converted values are estimates, the original amount is used for the task.',
    fxUpdating:'Updating exchange rates…', fxUnavailable:'Conversion unavailable; original amounts are shown.',
    fxEstimate:'Approximate rates from', updatedAt:'updated',
    publishedProfile:'Published provider profile',
    profileDraft:'Provider Profile Draft', publicProfile:'Public profile',
    profilePrivacy:'Your email and password are private. Only the details below appear in provider search.',
    profilePhotoTitle:'Your profile photo',
    profilePhotoGuidance:'Use a clear, professional head-and-shoulders photo. It appears to signed-in marketplace members across your profile and provider listing. A photo is not identity verification.',
    profilePhotoSetupRequired:'Profile photo uploads are not configured yet. Ask the site administrator to run supabase/profile-photos.sql in the Supabase project.',
    profilePhotoRequired:'Add a profile photo before booking, sending offers, posting tasks, or publishing your provider profile.',
    profilePhotoChoose:'Choose a headshot photo',
    profilePhotoSave:'Save profile photo',
    profilePhotoReplace:'Change photo',
    profilePhotoInvalid:'Choose a JPEG, PNG, or WebP photo under 5 MB.',
    profilePhotoSaved:'Profile photo saved.',
    profilePhotoError:'Could not save your profile photo.',
    providerRequiredFields:'Complete all required fields before publishing your provider profile.',
    providerPortfolioRequired:'Add at least one work portfolio photo before publishing your provider profile.',
    additionalSkillsRequired:'Add at least one additional skill before publishing your provider profile.',
    allCategories:'All categories', onboardingCustomerTitle:'Hire someone for a task',
    onboardingCustomerBody:'Your account is ready. Post a clear task with scope, location, timing and budget, then review worker offers in My activity.',
    onboardingWorkerTitle:'Set up your worker profile',
    onboardingWorkerBody:'Add your skills, rate, work area and experience, then publish your profile to appear in search.',
    onboardingWorkerLiveTitle:'Your profile is published',
    onboardingWorkerLiveBody:'Browse open tasks, check the scope and budget, then send an offer. Keep coordination in the booking messages.',
    onboardingProgress:'Step {step} of 3', postFirstTask:'Post your first task',
    browseOpenTasks:'Browse open tasks', becomeWorker:'Offer your skills too',
    websiteGuideTitle:'A quick guide to TIME2INCOME',
    websiteGuideStep1Title:'Explore the marketplace',
    websiteGuideStep1Body:'Browse providers and open tasks. Use the location and category filters to find work or help that fits you.',
    websiteGuideStep2Title:'Post a task and manage requests',
    websiteGuideStep2Body:'Describe what you need, where and when, and your budget. Review offers and booking updates in My activity.',
    websiteGuideStep3Title:'Offer your skills',
    websiteGuideStep3Body:'Complete and publish your provider profile, then browse open tasks and send offers that match your skills.',
    websiteGuideStep4Title:'Coordinate safely',
    websiteGuideStep4Body:'After a booking is accepted, use its chat to coordinate. You can report or block a chat, and completed bookings remain in your history.',
    websiteGuideProgress:'Step {step} of 4',
    websiteGuideBack:'Back',
    websiteGuideNext:'Next',
    websiteGuideFinish:'Finish',
    websiteGuideSkip:'Skip guide',
    websiteGuideDontShowAgain:'Don’t show this guide again on this account',
    websiteGuideSaveError:'Could not save this preference. Please try again.',
    customerProfileReady:'Customer profile', saveCustomerProfile:'Save customer profile',
    customerProfileSavedToast:'Customer profile saved.',
    portfolioImages:'Work portfolio photos',
    portfolioImageGuidance:'Upload up to 6 JPEG, PNG or WebP images (5 MB max each). Images are public when your provider profile is published, only upload work photos you have permission to share.',
    noPortfolioImages:'No portfolio photos added yet.', removePortfolioImage:'Remove image',
    portfolioLimitError:'A maximum of 6 portfolio images is allowed.',
    portfolioTypeError:'Use JPEG, PNG or WebP images no larger than 5 MB each.',
    portfolioUploadError:'Unable to upload portfolio images.',
    identityVerificationTitle:'Optional identity check',
    identityVerificationIntro:'Take or choose a clear selfie for a private review. It is never shown on your public profile. A photo alone does not verify identity, a reviewer must approve it before a Verified badge appears.',
    identitySelfieLabel:'Selfie for private review',
    identityConsent:'I agree to submit this selfie for private identity review. It will not be public.',
    identitySubmit:'Submit selfie for review',
    identityPending:'Your selfie is waiting for review. Your photo remains private.',
    identityRejected:'The review was not approved. You can submit a new selfie.',
    identityVerifiedBadge:'Identity reviewed',
    identityVerified:'Your identity review is complete.',
    identitySetupRequired:'Private photo review is not available until the secure verification setup is installed.',
    identityPhotoRequired:'Choose a selfie and confirm consent before submitting.',
    identityPhotoInvalid:'Choose a JPEG, PNG or WebP image up to 5 MB.',
    identityUploadError:'Could not submit the private selfie. Please try again.',
    identityRequestError:'Could not load identity review status.',
    identityDocumentReviewTitle:'Required marketplace identity review',
    identityDocumentReviewDescription:'This private document review is separate from regulated financial KYC. Submitting a document does not itself verify your identity.',
    identityDocumentPending:'Your ID document is waiting for review.',
    identityDocumentVerified:'Your marketplace identity review is verified.',
    identityDocumentRejected:'Your document was not accepted. Submit an updated document to request another review.',
    identityDocumentMoreInformationRequired:'The reviewer needs more information. Read the message below and submit an updated document.',
    identityDocumentNotSubmitted:'Submit an ID document to continue the required marketplace review.',
    identityDocumentUnavailable:'The identity-review status could not be loaded. Please try again later.',
    identityDocumentRequesterMessage:'Message from the reviewer',
    identityDocumentResubmit:'Submit or update ID document',
    privacyRequestsTitle:'Privacy and account requests',
    privacyRequestsIntro:'Send a request about your account or personal data. This form only records the request, it does not delete or change account data. A person must review it, and legally required records or valid legal holds may apply.',
    privacyRequestsUnavailable:'Privacy request intake is not available yet. Please contact support.',
    privacyRequestType:'Request type',
    privacyRequestChooseType:'Choose a request type',
    privacyRequestAccess:'Access my data',
    privacyRequestCorrection:'Correct my data',
    privacyRequestDeletion:'Request account or data deletion',
    privacyRequestRestriction:'Restrict processing',
    privacyRequestOther:'Other privacy request',
    privacyRequestMessage:'Details',
    privacyRequestPlaceholder:'Describe what you are requesting. Do not include passwords, verification codes, or payment details.',
    privacyRequestSubmit:'Submit privacy request',
    privacyRequestSubmitted:'Privacy request submitted.',
    privacyRequestSubmittedRefresh:'Request submitted. Refresh the page if it does not appear below.',
    privacyRequestSubmitFailed:'Could not submit the privacy request.',
    privacyRequestHistory:'Your requests',
    privacyRequestNone:'No privacy or account requests yet.',
    privacyRequestTicket:'Ticket',
    privacyRequestResponse:'Response',
    privacyRequestReceived:'Received',
    privacyRequestInReview:'In review',
    privacyRequestCompleted:'Completed',
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
    language:'Language', languageSearch:'Search language', taskCountry:'Country', taskCity:'City or region', cityOrCountry:'City, country or postal code', anyCityOrCountry:'Any city, country or postal code', workMode:'Work mode',
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
    mottoKicker:'Our idea', mottoTitle:'Your time. Your skill. Your income.',
    mottoSub:'Everyone has hours to spare and skills to share. TIME2INCOME connects people who need a task done with people ready to do it.',
    mottoStep1Title:'Share what you need or offer', mottoStep1Body:'Post a task, or publish your profile with the skills you offer.',
    mottoStep2Title:'Connect with the right person', mottoStep2Body:'Send a request. The provider accepts and your chat opens.',
    mottoStep3Title:'Get it done and earn', mottoStep3Body:'Agree the details in chat, finish the work, and confirm it.',
    mottoNeedWork:'Find Service', mottoFindWork:'Find Work', mottoDemo:'Try a quick demo',
    needWork:'Find Service', findWork:'Find Work',
    searchPlaceholder:'Try “plumber”, “logo designer”…',
    providerSearchPlaceholder:'Search open tasks by skill or category…',
    locationPlaceholder:'City, postal code or country', search:'Search', popular:'Popular nearby:',
    popularSkillsLoading:'Finding the most requested skills nearby…',
    popularSkillsNoLocation:'Choose a location with coordinates to see nearby demand.',
    popularSkillsNoDemand:'No recent open local tasks in this area yet.',
    popularSkillsLimited:'Fewer than five skills have recent nearby task requests.',
    popularSkillsUnavailable:'Nearby demand data is not available yet.',
    taskLocationIndexWarning:'Task saved, but its location could not be added to nearby-demand recommendations.',
    useMyLocation:'Use my location', searchLocationSearching:'Checking your location…',
    changeMarketplaceLocation:'Location',
    searchLocationFailed:'Could not get your location. Enter a city instead.',
    searchLocationActive:'Providers within about 15 km of your selected area appear first, other providers follow. Your coordinates stay on this device.',
    taskGlobalLocationHint:'Enter the city and country where the task should happen - even if you are posting from somewhere else.',
    taskDemandPrivacyHint:'For local discovery, this city is converted to an approximate area, coordinates stay private and are not shown on your task.',
    providerServiceAreaHint:'Choose the city and country where customers can find your service. It can be anywhere, not just where you are.',
    providerPostalCode:'Pin code',
    postalCode:'Postal code',
    profileLocationHint:'Optional: share a current location, rounded to about 15 km, so nearby customers can find you. It is visible to signed - in marketplace users.',
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
    categoriesSub:'Explore everyday help and professional skills. Your most-used categories move to the top.',
    relatedSkills:'Related skills', discoverMore:'DISCOVER MORE',
    tryNewCategories:'Try a new category', pickedForYou:'Picked for you',
    skillsToExplore:'{count} skills to explore',
    homeServicesDesc:'Plumbing, electrical, repairs', drivingDesc:'Drivers, pickups, moving',
    digitalDesc:'Design, editing, websites', officeDesc:'Admin, data entry, events',
    educationDesc:'Tutoring, coaching, languages', personalDesc:'Errands, packing, gardening',
    viewAll:'Browse skills →', skillCatalogTitle:'Explore skill ideas',
    skillCatalogHint:'Choose a skill to search the marketplace. Suggestions do not guarantee matching listings.',
    skillCatalogLimit:'Showing up to 100 matches. Type to search the full catalog.',
    skillSuggestionLimit:'Showing the first 50 matches. Type more to narrow your search.',
    catalogSuggestPending:'Your suggestion was submitted for review.',
    catalogSuggestError:'Could not submit the catalog suggestion.',
    skillCatalogSearchLabel:'Search skills', skillCatalogSearchPlaceholder:'Search skills',
    skillCatalogCategoryLabel:'Filter by category', skillCatalogAllCategories:'All categories', skillCategoryOther:'Other (uncategorized skills)', profileLiveNote:'Your profile is published. Change anything below, then press "Save and publish" to update it.',
    skillCategoryFilter:'Filter skills by category',
    taskSkillCategoryHint:'This only filters skill suggestions. Choose the task listing category below.',
    profileSkillCategoryHint:'This only filters skill suggestions. Your profile category remains separate.',
    noSkillsFound:'No matching skills. Try another search.',
    additionalSkills:'Additional skills', addSkill:'Add skill', removeSkill:'Remove',
    homeServices:'Home services',
    driving:'Driving & delivery', digital:'Digital & creative',
    office:'Office support', education:'Education', personal:'Personal help',
    readyToHelp:'READY TO HELP',
    professionalsTitle:'People with skills, ready to work',
    professionalsSub:'Published provider profiles appear here. Create a profile to start offering your skills.',
    providerSearchLabel:'Search provider profiles',
    providerSearchPlaceholder:'Search by skill, service or provider',
    searchProviders:'Search providers',
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
    categorySuggestion:'Category', skillCatalogSuggestion:'Skill idea', category:'Category',
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
    taskDialogKicker:'POST A TASK',
    taskDialogTitle:'What do you need help with?',
    taskTitleLabel:'Task title', taskDetailsLabel:'Details',
    taskCategoryLabel:'Category', taskBudgetLabel:'Budget',
    requiredField:'Please complete this required field.',
    taskLocationLabel:'City or region', demoWarning:'Posting a task costs 1 T2I.',
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
    finderSkillPlaceholder:'Search or choose a skill',
    skillDigital:'Digital & creative work',
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
    challengeKicker:'YOUR JOURNEY STARTS HERE',
    challengeTitle:'Start Your Work Journey',
    challengeIntro:'Your first earning opportunity, one step at a time.',
    challengeStep1:'Step 1: Choose one skill or service you can offer.',
    challengeStep2:'Step 2: Create your account and complete your profile.',
    challengeStep3:'Step 3: Add a clear photo or an example of your work.',
    challengeStep4:'Step 4: Set a fair rate for your time.',
    challengeStep5:'Step 5: Share your profile with people you trust.',
    challengeStep6:'Step 6: Send an offer on a task that matches your skills.',
    challengeStep7:'Step 7: Complete your first task and ask the customer for a review.',
    stepsComplete:'steps complete',
    shareWithFriends:'Share with friends',
    safetyKicker:'SAFETY',
    emergencyTitle:'Emergency help',
    emergencyIntro:'View emergency numbers for your account country or current location.',
    emergencyAccountCountryLabel:'Account country',
    emergencyCurrentCountryLabel:'I’m currently in',
    emergencyChooseCountry:'Choose a country',
    emergencyTravelHint:'Traveling? Select location, account country stays.',
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
    emergencyAccountCountryMissing:'Your account country is missing. Update your account details to view emergency numbers.',
    emergencyAccountCountryUnavailable:'Emergency numbers for this country are not listed. Check your local emergency services website.',
    emergencyCall:'Call',
    emergencyCountryNote:'If your country is not listed, check your local emergency services website. Always confirm the numbers work in your area before using them.',
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
    tourLanguageFallback:'Audio narration is available in English and Hindi. English audio is being used for this tour.',
    tourSessionError:'The tour could not be saved in this browser session. Please allow session storage and try again.',
    tourProgress:'Step {current} of {total}. {text}',
    tourClickButton:'Button: {label}. It performs the action shown by its name.',
    tourClickLink:'Link: {label}. It opens the related page or section.',
    tourClickField:'Field: {label}. Enter a value or choose an option here.',
    tourClickElement:'You selected {label}. This element belongs to the current section.',
    tourNavigation:'Use the navigation to move between Home, Find Work, Find Talent, Profile, and Guide.',
    tourHome:'Welcome to Home. Choose whether you need work done or want to find work, then search by skill and location.',
    tourExplore:'Browse skills and services, or search for a professional by name or category.',
    tourAppDownload:'This section explains how to install the TIME2INCOME app on your device.',
    tourTasks:'Find Work lists open customer tasks. Review each task and its details before deciding whether to open it or send an offer.',
    tourActivity:'View your posted tasks, bookings and offers. You can manage open tasks from your activity.',
    tourProfile:'Complete your provider profile with your skills, rates and service area so customers can understand what you offer.',
    tourHow:'Learn the basic steps: find a task, agree on time and price, then complete the work.',
    tourIncomeCalc:'Use the income calculator to estimate a monthly amount from your available hours and rate. It is only an estimate.',
    tourIncomeFinder:'Choose a skill and work mode to see practical ideas that may fit your schedule.',
    tourChallenge:'Use this step-by-step journey as a checklist to prepare your profile and start looking for work.',
    tourEmergency:'Choose your country to view emergency contact numbers. Confirm local details when possible.',
    tourTutorial:'Use Start tour to begin this guided walkthrough. Click a control during the tour to hear what it does.',
    tourFaq:'Read answers to common questions and practical safety guidance.',
    tourWorker:'Create a provider profile to share your skills and find work that fits your schedule.',
    tourCompleted:'You have reached the end of the TIME2INCOME tour.',
    tourClickFallback:'this control',
    faqKicker:'HELP & SUPPORT',
    faqTitle:'Frequently asked questions',
    faqFreeQuestion:'Is TIME2INCOME free to use?',
    faqFreeAnswer:'Creating an account and exploring tasks are free. Each task post and first opening of a task costs 1 T2I. Reopening a task you already unlocked is free. Eligible accounts receive a one-time 100 T2I welcome reward; token purchases are not available yet.',
    faqWorkQuestion:'How can I find work?',
    faqWorkAnswer:'Create a provider profile or send an offer on an open task. Customers can also send you a booking request.',
    faqIncomeQuestion:'Is income guaranteed?',
    faqIncomeAnswer:'No. Earnings depend on your skills, availability and demand. The calculator and finder provide estimates and ideas only.',
    faqSafetyQuestion:'How can I stay safe?',
    faqSafetyAnswer:'Agree on the details in the booking chat. Never share passwords, verification codes or bank details. Avoid large upfront payments and meet in a public place for a first in-person meeting.',
    faqReviewQuestion:'Who can leave a review?',
    faqReviewAnswer:'After a booking is completed, both the customer and provider can each leave one review for the other. Reviews help highlight trusted profiles and customer tasks within their area.',
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
    profilePhotoTitle:'आपकी प्रोफ़ाइल फ़ोटो',
    profilePhotoGuidance:'साफ़, पेशेवर सिर और कंधों वाली फ़ोटो चुनें। यह साइन-इन किए मार्केटप्लेस सदस्यों को आपकी प्रोफ़ाइल और प्रदाता सूची में दिखेगी। फ़ोटो पहचान सत्यापन नहीं है।',
    profilePhotoSetupRequired:'प्रोफ़ाइल फ़ोटो अपलोड अभी सेट नहीं है। साइट एडमिनिस्ट्रेटर से Supabase प्रोजेक्ट में supabase/profile-photos.sql चलाने को कहें।',
    profilePhotoRequired:'बुकिंग, संदेश, ऑफ़र, काम पोस्ट करने या प्रोवाइडर प्रोफ़ाइल प्रकाशित करने से पहले प्रोफ़ाइल फ़ोटो जोड़ें।',
    profilePhotoChoose:'हेडशॉट फ़ोटो चुनें', profilePhotoSave:'प्रोफ़ाइल फ़ोटो सेव करें',
    profilePhotoReplace:'फ़ोटो बदलें', profilePhotoInvalid:'5 MB से छोटी JPEG, PNG या WebP फ़ोटो चुनें।',
    profilePhotoSaved:'प्रोफ़ाइल फ़ोटो सेव हो गई।', profilePhotoError:'प्रोफ़ाइल फ़ोटो सेव नहीं हो सकी।',
    noTasksYet:'अभी कोई काम नहीं। पहला काम पोस्ट करें।', noBookingsYet:'अभी कोई बुकिंग नहीं। ऊपर से प्रोफेशनल चुनें।',
    providerProfile:'प्रोवाइडर प्रोफाइल', close:'बंद करें', taskTitlePlaceholder:'जैसे: रसोई का नल ठीक करें',
    taskSkillSuggestionHint:'कौशल के सुझाव शीर्षक शुरू करने में मदद कर सकते हैं। नीचे विवरण लिखें और सही कैटेगरी चुनें।',
    taskDetailsPlaceholder:'काम, समय और ज़रूरतों का विवरण दें', optional:'वैकल्पिक',
    selectCountry:'देश चुनें या लिखें', state:'राज्य', cityOrRegion:'शहर या क्षेत्र', yourName:'आपका नाम',
    emailPlaceholder:'you@example.com', passwordPlaceholder:'कम से कम 8 अक्षर',
    passwordNotice:'आपका पासवर्ड Supabase Authentication संभालता है। इसे किसी से साझा न करें।',
    signIn:'साइन इन', join:'जुड़ें',
    tutorialKicker:'क्विक टूर',
    tutorialTitle:'मार्केटप्लेस का निर्देशित टूर',
    tutorialIntro:'टूर शुरू करें और वेबसाइट के मुख्य फीचर्स को क्रम से समझें।',
    tutorialLanguageNote:'टूर मुख्य वेबसाइट पेजों पर जाएगा। आवाज़ के लिए हिंदी या English चुनें; बाकी भाषाओं में captions दिखेंगे।',
    startTour:'टूर शुरू करें', stopTour:'टूर रोकें',
    tourVoiceUnavailable:'इस डिवाइस पर चुनी हुई भाषा की आवाज़ उपलब्ध नहीं है। स्क्रीन पर captions दिखेंगे।',
    tourLanguageFallback:'आवाज़ में टूर हिंदी और English में उपलब्ध है। इस टूर में English आवाज़ इस्तेमाल हो रही है।',
    tourSessionError:'इस ब्राउज़र से टूर सेव नहीं हो पाया। Session storage की अनुमति दें और फिर कोशिश करें।',
    tourProgress:'चरण {current} / {total}। {text}',
    tourClickButton:'बटन: {label}। यह अपने नाम के अनुसार काम करता है।',
    tourClickLink:'लिंक: {label}। यह संबंधित पेज या सेक्शन खोलता है।',
    tourClickField:'फ़ील्ड: {label}। यहाँ जानकारी लिखें या विकल्प चुनें।',
    tourClickElement:'आपने {label} चुना है। यह मौजूदा सेक्शन का हिस्सा है।',
    tourNavigation:'ऊपर के नेविगेशन से Home, काम खोजें, ग्राहक खोजें, Profile और Guide पेज पर जाएँ।',
    tourHome:'Home में आपका स्वागत है। काम करवाने या काम खोजने का विकल्प चुनें, फिर कौशल और लोकेशन से खोजें।',
    tourExplore:'कौशल और सेवाएँ देखें या नाम और श्रेणी से प्रोफेशनल खोजें।',
    tourAppDownload:'इस सेक्शन में TIME2INCOME ऐप को अपने डिवाइस पर इंस्टॉल करने की जानकारी है।',
    tourTasks:'काम खोजें पेज पर ग्राहकों के खुले काम दिखते हैं। ऑफ़र देने या काम खोलने से पहले उसका विवरण पढ़ें।',
    tourActivity:'यहाँ अपने पोस्ट किए काम, बुकिंग और ऑफ़र देखें और खुले काम प्रबंधित करें।',
    tourProfile:'ग्राहकों को अपनी सेवाएँ बताने के लिए कौशल, दर और सेवा क्षेत्र के साथ Provider प्रोफाइल पूरी करें।',
    tourHow:'काम के आसान चरण जानें: काम खोजें, समय और कीमत तय करें, फिर काम पूरा करें।',
    tourIncomeCalc:'उपलब्ध समय और प्रति घंटे की दर से अनुमानित मासिक कमाई देखें। यह केवल एक अनुमान है।',
    tourIncomeFinder:'अपने कौशल और काम का तरीका चुनकर अपने समय के अनुकूल काम के सुझाव देखें।',
    tourChallenge:'प्रोफाइल तैयार करने और काम खोजने के लिए सात-दिन की चेकलिस्ट इस्तेमाल करें।',
    tourEmergency:'आपातकालीन संपर्क नंबर देखने के लिए देश चुनें। जहाँ संभव हो, स्थानीय नंबर की पुष्टि करें।',
    tourTutorial:'Start tour से यह निर्देशित जानकारी शुरू करें। टूर के दौरान किसी कंट्रोल पर क्लिक करें और जानें कि वह क्या करता है।',
    tourFaq:'आम सवालों के जवाब और सुरक्षा से जुड़ी सलाह यहाँ पढ़ें।',
    tourWorker:'अपना कौशल साझा करने और काम पाने के लिए Provider प्रोफाइल बनाएँ।',
    tourCompleted:'TIME2INCOME टूर पूरा हुआ।',
    tourClickFallback:'यह कंट्रोल',
    eyebrow:'समय, कौशल और अवसरों का मार्केटप्लेस',
    headline:'सही कौशल खोजें।<br><em>हर घंटे को उपयोगी बनाएँ।</em>',
    subhead:'कुछ घंटों के लिए प्रोफेशनल खोजें या लचीला काम पाएँ।',
    mottoKicker:'हमारा विचार', mottoTitle:'आपका समय। आपका हुनर। आपकी कमाई।',
    mottoSub:'हर किसी के पास खाली समय और बाँटने लायक हुनर है। TIME2INCOME काम करवाने वालों को काम करने वालों से जोड़ता है।',
    mottoStep1Title:'अपनी ज़रूरत या सेवा बताएँ', mottoStep1Body:'टास्क पोस्ट करें, या अपने हुनर के साथ प्रोफ़ाइल पब्लिश करें।',
    mottoStep2Title:'सही व्यक्ति से जुड़ें', mottoStep2Body:'रिक्वेस्ट भेजें। प्रोवाइडर स्वीकार करता है और चैट खुल जाती है।',
    mottoStep3Title:'काम पूरा करें और कमाएँ', mottoStep3Body:'चैट में बातें तय करें, काम पूरा करें और उसे कन्फ़र्म करें।',
    mottoNeedWork:'मुझे काम करवाना है', mottoFindWork:'मुझे काम चाहिए', mottoDemo:'एक छोटा डेमो देखें',
    categoriesSub:'रोज़मर्रा की मदद और पेशेवर कौशल खोजें। आपकी सबसे ज़्यादा इस्तेमाल की गई श्रेणियाँ ऊपर आएँगी।',
    relatedSkills:'संबंधित कौशल', discoverMore:'और खोजें',
    tryNewCategories:'नई श्रेणी आज़माएँ', pickedForYou:'आपके लिए चुना गया',
    skillsToExplore:'खोजने के लिए {count} कौशल',
    needWork:'मुझे काम करवाना है', findWork:'मुझे काम चाहिए',
    searchPlaceholder:'जैसे प्लंबर, लोगो डिज़ाइनर…',
    locationPlaceholder:'शहर, पिनकोड या देश', search:'खोजें', popular:'आपके पास लोकप्रिय:',
    popularSkillsLoading:'पास में सबसे अधिक माँगी गई स्किल खोज रहे हैं…',
    popularSkillsNoLocation:'पास की माँग देखने के लिए निर्देशांक वाला स्थान चुनें।',
    popularSkillsNoDemand:'इस क्षेत्र में अभी हाल के खुले स्थानीय टास्क नहीं हैं।',
    popularSkillsLimited:'पास में हाल के टास्क अनुरोध पाँच से कम स्किल के लिए हैं।',
    popularSkillsUnavailable:'पास की माँग का डेटा अभी उपलब्ध नहीं है।',
    taskLocationIndexWarning:'टास्क सहेजा गया, लेकिन उसका स्थान पास की माँग की सिफ़ारिशों में नहीं जोड़ा जा सका।',
    helpCenter:'सहायता', privacyPolicy:'गोपनीयता नीति', termsOfService:'सेवा की शर्तें',
    useMyLocation:'मेरी लोकेशन इस्तेमाल करें',
    changeMarketplaceLocation:'लोकेशन',
    searchLocationSearching:'आपकी लोकेशन जाँची जा रही है…',
    searchLocationFailed:'लोकेशन नहीं मिली। इसके बजाय शहर लिखें।',
    searchLocationActive:'चुने गए स्थान से लगभग 15 किमी के अंदर के प्रोवाइडर पहले दिखेंगे; बाकी उसके बाद। आपके निर्देशांक इसी डिवाइस पर रहते हैं।',
    taskGlobalLocationHint:'जिस शहर और देश में काम होना है, वह लिखें—चाहे आप किसी दूसरी जगह से पोस्ट कर रहे हों।',
    taskDemandPrivacyHint:'स्थानीय खोज के लिए इस शहर से अनुमानित क्षेत्र तय होता है। निर्देशांक निजी रहते हैं और आपके टास्क पर नहीं दिखते।',
    providerServiceAreaHint:'वह शहर और देश चुनें जहाँ ग्राहक आपकी सेवा पा सकते हैं। यह आपकी मौजूदा जगह से अलग, कहीं भी हो सकता है।',
    providerPostalCode:'Pin code',
    postalCode:'पिनकोड',
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
    viewAll:'कौशल ब्राउज़ करें →', skillCatalogTitle:'कौशल के सुझाव देखें',
    skillCatalogHint:'मार्केटप्लेस में खोजने के लिए कौशल चुनें। सुझाव मिलने से संबंधित लिस्टिंग की गारंटी नहीं होती।',
    skillCatalogLimit:'100 तक परिणाम दिख रहे हैं। सभी कौशल खोजने के लिए लिखें।',
    skillSuggestionLimit:'पहले 50 परिणाम दिख रहे हैं। खोज सीमित करने के लिए और लिखें।',
    catalogSuggestPending:'आपका सुझाव समीक्षा के लिए भेज दिया गया है।',
    catalogSuggestError:'कैटलॉग सुझाव भेजा नहीं जा सका।',
    skillCatalogSearchLabel:'कौशल खोजें', skillCatalogSearchPlaceholder:'कौशल खोजें',
    skillCatalogCategoryLabel:'श्रेणी से छाँटें', skillCatalogAllCategories:'सभी श्रेणियाँ', skillCategoryOther:'अन्य (बिना श्रेणी वाले कौशल)', profileLiveNote:'आपकी प्रोफ़ाइल प्रकाशित है। नीचे कुछ भी बदलें, फिर अपडेट करने के लिए "Save and publish" दबाएँ।',
    skillCategoryFilter:'कौशलों को श्रेणी से छाँटें',
    taskSkillCategoryHint:'यह केवल कौशल सुझावों को छाँटता है। नीचे काम की लिस्टिंग की श्रेणी चुनें।',
    profileSkillCategoryHint:'यह केवल कौशल सुझावों को छाँटता है। प्रोफाइल की श्रेणी अलग है।',
    noSkillsFound:'कोई मिलता-जुलता कौशल नहीं मिला। दूसरा शब्द आज़माएँ।',
    accountSkillPlaceholder:'कौशल खोजें या चुनें',
    accountSkillHint:'कौशल खोजने के लिए लिखें या सुझावों में से चुनें।',
    additionalSkills:'अतिरिक्त कौशल', additionalSkillsRequired:'प्रोवाइडर प्रोफाइल प्रकाशित करने से पहले कम-से-कम एक अतिरिक्त कौशल जोड़ें।', addSkill:'कौशल जोड़ें', removeSkill:'हटाएँ',
    homeServices:'घर की सेवाएँ',
    driving:'ड्राइविंग और डिलीवरी', digital:'डिजिटल और क्रिएटिव',
    office:'ऑफिस सहायता', education:'शिक्षा', personal:'व्यक्तिगत सहायता',
    readyToHelp:'मदद के लिए तैयार',
    professionalsTitle:'काम के लिए तैयार कुशल लोग',
    professionalsSub:'प्रकाशित प्रोवाइडर प्रोफाइल यहाँ दिखेंगी। अपनी स्किल देने के लिए प्रोफाइल बनाएँ।',
    providerSearchLabel:'प्रोवाइडर प्रोफाइल खोजें',
    providerSearchPlaceholder:'स्किल, सेवा या प्रोवाइडर खोजें',
    searchProviders:'प्रोवाइडर खोजें',
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
    taskDialogKicker:'काम पोस्ट करें',
    taskDialogTitle:'आपको किस काम में मदद चाहिए?',
    taskTitleLabel:'काम का शीर्षक', taskDetailsLabel:'विवरण',
    taskCategoryLabel:'कैटेगरी', taskBudgetLabel:'बजट',
    requiredField:'कृपया यह ज़रूरी फ़ील्ड भरें।',
    taskLocationLabel:'शहर या क्षेत्र', cityOrCountry:'शहर, देश या पिनकोड', anyCityOrCountry:'कोई भी शहर, देश या पिनकोड', demoWarning:'पहला काम पोस्ट करना मुफ़्त है। इसके बाद हर पोस्ट की कीमत आपकी पसंदीदा मुद्रा में 1 यूनिट है।',
    cancel:'रद्द करें', saveTask:'काम पोस्ट करें', contact:'प्रोफाइल देखें',
    editTask:'काम बदलें', taskEditUsed:'एक बार संपादन हो चुका है', deleteTask:'काम हटाएँ', postTaskTitle:'आपको किस काम में मदद चाहिए?',
    saveTaskChanges:'बदलाव सेव करें', taskUpdatedToast:'काम अपडेट हो गया।',
    taskOpen:'काम खोलें',
    taskPostFeeNotice:'काम पोस्ट करने में 1 T2I लगेगा। पोस्ट करने से पहले आपका बैलेंस जाँचा जाएगा।',
    taskOpenFeeNotice:'काम खोलने में 1 T2I लगेगा। पहले से खोला हुआ काम दोबारा खोलना मुफ़्त है।',
    nearbyAlertsTitle:'आस-पास के अलर्ट',
    nearbyAlertsIntro:'15 किमी के भीतर स्थानीय काम या सेवा के अलर्ट पाएँ। पहले मिलती-जुलती श्रेणियों को, फिर 30 मिनट बाद सभी सहमत आस-पास के उपयोगकर्ताओं को सूचना मिलेगी।',
    nearbyAlertsCategories:'जिन श्रेणियों के अलर्ट चाहिए, उन्हें चुनें',
    nearbyAlertsPrivacy:'आपकी अनुमानित लोकेशन निजी रूप से रखी जाएगी और केवल आस-पास के अलर्ट मिलाने के लिए उपयोग होगी। ब्राउज़र नोटिफिकेशन की अलग अनुमति चाहिए।',
    nearbyAlertsLocationConsent:'मैं आस-पास के अलर्ट के लिए अपनी अनुमानित लोकेशन निजी रूप से साझा करने की सहमति देता/देती हूँ।',
    nearbyAlertsEnable:'आस-पास के अलर्ट चालू करें',
    nearbyAlertsDisable:'आस-पास के अलर्ट बंद करें',
    nearbyAlertsPush:'ब्राउज़र नोटिफिकेशन चालू करें',
    nearbyAlertsEnabled:'इस खाते के लिए आस-पास के अलर्ट चालू हैं।',
    nearbyAlertsDisabled:'आस-पास के अलर्ट बंद हैं।',
    nearbyAlertsPushEnabled:'इस डिवाइस पर ब्राउज़र नोटिफिकेशन चालू हैं।',
    nearbyAlertsPushUnavailable:'ब्राउज़र पुश अभी कॉन्फ़िगर नहीं है। साइट व्यवस्थापक से सेटअप पूरा करने को कहें।',
    nearbyAlertsSetupRequired:'सर्वर पर आस-पास के अलर्ट का सेटअप अभी इंस्टॉल नहीं है।',
    nearbyAlertsNoCategories:'श्रेणियाँ अभी उपलब्ध नहीं हैं। मार्केटप्लेस सेटअप पूरा होने पर फिर कोशिश करें।',
    nearbyAlertsLocationFailed:'आस-पास के अलर्ट की पसंद सेव नहीं हो सकी।',
    nearbyAlertsPushDenied:'ब्राउज़र सेटिंग में नोटिफिकेशन की अनुमति दें, फिर कोशिश करें।',
    nearbyAlertsOptInRequired:'ब्राउज़र नोटिफिकेशन चालू करने से पहले आस-पास के अलर्ट चालू करें।',
    websiteGuideTitle:'TIME2INCOME की छोटी-सी गाइड',
    websiteGuideStep1Title:'मार्केटप्लेस देखें',
    websiteGuideStep1Body:'प्रोवाइडर और खुले काम देखें। अपने लिए सही काम या मदद खोजने के लिए लोकेशन और कैटेगरी फ़िल्टर करें।',
    websiteGuideStep2Title:'काम पोस्ट करें और अनुरोध देखें',
    websiteGuideStep2Body:'ज़रूरत, जगह, समय और बजट बताएँ। ऑफ़र और बुकिंग अपडेट “मेरी गतिविधि” में देखें।',
    websiteGuideStep3Title:'अपनी स्किल ऑफ़र करें',
    websiteGuideStep3Body:'अपनी प्रोवाइडर प्रोफाइल पूरी करके प्रकाशित करें, फिर अपनी स्किल से जुड़े खुले कामों पर ऑफ़र भेजें।',
    websiteGuideStep4Title:'सुरक्षित तरीके से बात करें',
    websiteGuideStep4Body:'बुकिंग स्वीकार होने के बाद उसी बुकिंग की चैट में बात करें। चैट रिपोर्ट या ब्लॉक कर सकते हैं; पूरे हुए काम हिस्ट्री में रहते हैं।',
    websiteGuideProgress:'चरण {step} / 4',
    websiteGuideBack:'वापस',
    websiteGuideNext:'आगे',
    websiteGuideFinish:'पूरा करें',
    websiteGuideSkip:'गाइड छोड़ें',
    websiteGuideDontShowAgain:'इस अकाउंट पर यह गाइड दोबारा न दिखाएँ',
    websiteGuideSaveError:'यह पसंद सेव नहीं हो सकी। कृपया फिर कोशिश करें।',
    taskPaymentDescription:'TIME2INCOME काम की कार्रवाई',
    taskPaymentClosed:'भुगतान विंडो बंद हुई; कोई कार्रवाई पूरी नहीं हुई।',
    taskPaymentFailed:'भुगतान की पुष्टि नहीं हुई। कोई कार्रवाई पूरी नहीं हुई।',
    bookingPaymentDescription:'TIME2INCOME बुकिंग स्वीकार शुल्क', acceptFeeHint:'स्वीकार करने पर छोटा शुल्क लगेगा। स्वीकार करते ही चैट खुल जाएगी।',
    checkoutQuoteKicker:'भुगतान का विवरण', checkoutQuoteTitle:'कुल राशि जाँचें',
    checkoutQuoteIntro:'यह इस कार्रवाई का पूरा प्लेटफ़ॉर्म चेकआउट शुल्क है। सुरक्षित भुगतान पर सीधे जाने के लिए पुष्टि करें।',
    checkoutQuoteWalletIntro:'उपलब्ध वॉलेट क्रेडिट पहले इस कुल राशि में समायोजित हो सकते हैं; बाकी राशि सुरक्षित भुगतान से ली जाएगी।',
    checkoutCountry:'आपका देश', checkoutRegion:'राज्य / प्रांत',
    checkoutCategory:'मलेशिया सेवा श्रेणी', checkoutFixed:'निश्चित शुल्क',
    checkoutServiceFee:'सेवा शुल्क (5%)', checkoutPlatformFee:'प्लेटफ़ॉर्म शुल्क (5%)',
    checkoutSubtotal:'शुल्क उप-योग', checkoutTax:'अनुमानित स्थानीय कर',
    checkoutGateway:'भुगतान गेटवे वसूली (ग्रोस-अप)', checkoutTotal:'चेकआउट की कुल राशि',
    checkoutCancel:'रद्द करें', checkoutContinue:'सुरक्षित भुगतान पर जाएँ',
    checkoutSelectCountry:'चेकआउट विवरण देखने के लिए देश चुनें।',
    checkoutSelectRegion:'कर की गणना के लिए सूची में से राज्य या प्रांत चुनें।',
    checkoutSelectCategory:'कर की गणना के लिए सेवा श्रेणी चुनें।',
    checkoutSelectRegionPlaceholder:'राज्य / प्रांत चुनें',
    checkoutSelectCategoryPlaceholder:'सेवा श्रेणी चुनें',
    checkoutGatewayNote:'{rate}% अनुमानित प्रभावी भुगतान-गेटवे दर। राशि मुद्रा की छोटी इकाई तक ऊपर की ओर पूर्णांकित होगी।',
    checkoutBrazilNote:'ब्राज़ील के लिए आपकी मूल्य-सूची का 5% अनुमान उपयोग हुआ है; यह पुष्टि किया हुआ वैधानिक कर-दर नहीं है।',
    checkoutGeneralNote:'कर और गेटवे दरें दी गई योजना-सूची पर आधारित हैं; कानूनी और भुगतान-प्रदाता से पुष्टि आवश्यक हो सकती है।',
    checkoutWalletApplied:'वॉलेट क्रेडिट लागू: {amount}',
    walletButton:'मेरा वॉलेट',
    t2iBackMarketplace:'मार्केटप्लेस पर लौटें',
    t2iWalletTitle:'TIME2INCOME टोकन वॉलेट',
    t2iWalletIntro:'आपके T2I टोकन और वॉलेट गतिविधि',
    t2iWalletActions:'वॉलेट विकल्प',
    t2iPendingSetup:'सेटअप बाकी है',
    t2iWalletTotal:'उपलब्ध T2I',
    t2iPromotionalBalance:'मुफ़्त प्रमोशनल टोकन',
    t2iPurchasedBalance:'खरीदे गए टोकन',
    t2iWorkerEarnings:'वर्कर की कमाई (अभी खर्च नहीं कर सकते)',
    t2iWelcomeReward:'स्वागत पुरस्कार',
    t2iWelcomeRewardNote:'एक बार मिलने वाले 100 T2I स्वागत पुरस्कार की कोई समाप्ति नहीं है।',
    t2iTokenPolicy:'आप दूसरे साइन-इन किए TIME2INCOME यूज़र के वॉलेट कोड पर T2I भेज सकते हैं। T2I को निकाला, नकदी में बदला या बाहरी वॉलेट में नहीं भेजा जा सकता।',
    t2iBuyAction:'T2I खरीदें',
    t2iSendAction:'भेजें',
    t2iReceiveAction:'प्राप्त करें',
    t2iHistoryAction:'इतिहास',
    t2iHowToUse:'T2I का उपयोग कैसे करें',
    t2iPostTaskCost:'टास्क पोस्ट · 1 T2I',
    t2iOpenTaskCost:'टास्क खोलें · 1 T2I',
    t2iPublishProfileCost:'प्रोफ़ाइल प्रकाशित करें · 1 T2I',
    t2iPremiumAccessCost:'प्रीमियम प्रोफ़ाइल · 1 T2I',
    t2iComingSoon:'जल्द आ रहा है',
    t2iRewardBannerTitle:'नए उपयोगकर्ता का इनाम!',
    t2iRewardBannerBody:'हर पात्र खाते को एक बार 100 T2I का इनाम मिलता है।',
    t2iSendUnavailable:'अभी आंतरिक ट्रांसफ़र उपलब्ध नहीं हैं।',
    t2iReceiveUnavailable:'अभी आपका वॉलेट कोड उपलब्ध नहीं है।',
    t2iTransferTitle:'दूसरे यूज़र को T2I भेजें',
    t2iTransferIntro:'प्राप्तकर्ता का T2I वॉलेट कोड लिखें। ट्रांसफ़र तुरंत होगा और वापस नहीं किया जा सकेगा।',
    t2iTransferRecipientCode:'प्राप्तकर्ता का वॉलेट कोड',
    t2iTransferAmount:'मात्रा (पूरे T2I)',
    t2iTransferSubmit:'जाँचें और भेजें',
    t2iTransferConfirm:'{code} को {amount} T2I भेजें? यह वापस नहीं किया जा सकेगा।',
    t2iTransferSuccess:'ट्रांसफ़र पूरा। {amount} T2I भेजे गए।',
    t2iTransferFailed:'ट्रांसफ़र पूरा नहीं हो सका।',
    t2iTransferPending:'T2I ट्रांसफ़र हो रहा है…',
    t2iTransferInsufficient:'इस ट्रांसफ़र के लिए आपके पास पर्याप्त T2I नहीं हैं।',
    t2iTransferRecipientUnavailable:'यह वॉलेट कोड उपलब्ध नहीं है। जाँचकर फिर कोशिश करें।',
    t2iTransferCodeInvalid:'T2I- के बाद 16 हेक्साडेसिमल अक्षरों वाला वॉलेट कोड लिखें।',
    t2iTransferCopy:'मेरा वॉलेट कोड कॉपी करें',
    t2iTransferCopied:'वॉलेट कोड कॉपी हुआ। T2I पाने के लिए इसे साझा करें।',
    t2iTransferCopyFailed:'कोड कॉपी नहीं हुआ। कृपया उसे चुनकर मैन्युअली कॉपी करें।',
    t2iTransferCodeTitle:'आपका T2I वॉलेट कोड',
    t2iTransferCodeHelp:'T2I पाने के लिए यह कोड किसी साइन-इन किए यूज़र को दें। पासवर्ड या साइन-इन कोड कभी साझा न करें।',
    t2iTransferNote:'केवल आंतरिक T2I ट्रांसफ़र। यह तुरंत होगा, वापस नहीं होगा और नकदी में नहीं बदलेगा।',
    t2iHistoryTransferSent:'T2I भेजे',
    t2iHistoryTransferReceived:'T2I मिले',
    t2iRewardCelebrate:'🎁 आपके 100 T2I इनाम आ गए!',
    t2iPurchaseCelebrate:'✨ आपका T2I भुगतान कन्फ़र्म हुआ!',
    t2iRewardCelebrationClose:'सेलिब्रेशन बंद करें',
    t2iBackWallet:'मेरे वॉलेट पर लौटें',
    t2iBuyHeroTitle:'T2I टोकन खरीदें',
    t2iBuyHeroBody:'हर सूचीबद्ध स्थानीय मुद्रा में पैकेज की आधार कीमत वही संख्या है; शुल्क अनुमान और भुगतान उपलब्धता देश पर निर्भर हैं।',
    t2iNoExpiryLabel:'टोकन की कोई समाप्ति नहीं',
    t2iSelectPackage:'टोकन पैक चुनें',
    t2iMostPopular:'सबसे लोकप्रिय',
    t2iTokensPerHundred:'प्रति 100 T2I',
    t2iPackageIndiaNote:'देश सूची में प्रोफ़ाइल के 249 देश और क्षेत्र शामिल हैं। पैकेज की समान संख्यात्मक कीमतें सूचीबद्ध स्थानीय मुद्रा में हैं; विनिमय-दर से रूपांतरण नहीं होता। हर जगह स्थानीय भुगतान स्वीकृति और चेकआउट शुल्क या कर सत्यापित नहीं हैं।',
    t2iCountryEstimateUnavailable:'मूल कीमत इस देश की सूचीबद्ध मुद्रा में दिखाई गई है। यहाँ शुल्क अनुमान और भुगतान समर्थन कॉन्फ़िगर नहीं हैं, इसलिए चेकआउट उपलब्ध नहीं है।',
    t2iEstimateUnavailable:'अनुमान उपलब्ध नहीं',
    t2iPackageBaseLabel:'टोकन पैक की मूल कीमत',
    t2iPackageEstimatedTotal:'अनुमानित चेकआउट कुल',
    t2iPackageTaxEstimate:'अनुमानित कर',
    t2iPackageProvisionalNote:'दिखाए गए कर और गेटवे शुल्क केवल योजना के अनुमान हैं, भुगतान राशि नहीं। चालू पैक में सर्वर द्वारा स्वीकृत सटीक कुल राशि ही ली जाएगी; देश और पैक स्पष्ट रूप से सक्षम होने तक भुगतान उपलब्ध नहीं है।',
    t2iTokenDisclaimerTitle:'T2I टोकन खरीद अस्वीकरण',
    t2iTokenDisclaimerBody:'T2I टोकन TIME2INCOME के भीतर योग्य सेवाओं और सुविधाओं तक पहुँचने के लिए खरीदे जाने वाले प्लेटफ़ॉर्म उपयोगिता टोकन हैं। ये असली पैसा, निवेश, जमा या गारंटीकृत मौद्रिक-मूल्य वाली संपत्ति नहीं हैं। इनका उपयोग टास्क पोस्ट करने, प्रोफ़ाइल प्रकाशित करने, प्रीमियम सुविधाएँ पाने और प्लेटफ़ॉर्म पर सूचीबद्ध अन्य योग्य गतिविधियों के लिए किया जा सकता है। वर्तमान नीति के अनुसार टोकन समाप्त नहीं होते और उपयोग होने तक आपके वॉलेट में रहते हैं, जो खाते और प्लेटफ़ॉर्म की शर्तों के अधीन है। खरीदे गए टोकन सामान्यतः वापस नहीं किए जाते और नकदी में बदले, निकाले या प्लेटफ़ॉर्म के बाहर ट्रांसफ़र नहीं किए जा सकते। खरीदने से पहले टोकन की कीमत और उपयोग की जानकारी ध्यान से देखें। कानूनन आवश्यक रिफ़ंड और सत्यापित तकनीकी त्रुटियों के सुधार लागू रहेंगे।',
    t2iTokenDisclaimerAgreement:'मैंने T2I टोकन खरीद अस्वीकरण पढ़ा और स्वीकार किया है तथा टोकन के उपयोग और रिफ़ंड नीति को समझता/समझती हूँ।',
    t2iLocalPrice:'आधार कीमत (आपकी स्थानीय मुद्रा)',
    t2iYouReceive:'आपको ठीक 100 T2I टोकन मिलेंगे।',
    t2iPriceBreakdown:'कीमत का विवरण',
    t2iPackageLine:'टोकन पैक (100 T2I)',
    t2iTaxLine:'लागू कर',
    t2iGatewayLine:'भुगतान गेटवे शुल्क',
    t2iPlatformFeeLine:'प्लेटफ़ॉर्म सेवा शुल्क',
    t2iTotalPayable:'अनुमानित कुल',
    t2iPurchasePending:'अनुमान में देश के अस्थायी कर और गेटवे दरें हैं। टोकन खरीद अभी उपलब्ध नहीं है; कोई भुगतान नहीं लिया जाएगा।',
    t2iPurchaseNotEnabled:'इस देश और पैक के लिए टोकन भुगतान चालू नहीं है। कोई भुगतान नहीं लिया जाएगा।',
    t2iPurchasePackagesError:'उपलब्ध टोकन पैक की पुष्टि नहीं हो सकी। भुगतान उपलब्ध नहीं है; कृपया बाद में फिर कोशिश करें।',
    t2iPurchaseCheckoutError:'सुरक्षित टोकन चेकआउट उपलब्ध नहीं है। भुगतान शुरू नहीं हुआ।',
    t2iPurchaseSuccess:'भुगतान की पुष्टि हो गई। आपके T2I टोकन वॉलेट में जोड़ दिए गए हैं।',
    t2iPurchaseVerifyError:'भुगतान की पुष्टि नहीं हो सकी। यदि राशि कटी है, तो दोबारा कोशिश करने से पहले वॉलेट गतिविधि देखें या सहायता से संपर्क करें।',
    t2iPurchaseStarting:'सुरक्षित चेकआउट तैयार हो रहा है…',
    t2iPurchaseCancelled:'चेकआउट बंद किया गया। कोई टोकन क्रेडिट नहीं हुआ।',
    t2iPackageCheckoutTotal:'अंतिम चेकआउट कुल',
    t2iProceedPay:'भुगतान करने के लिए आगे बढ़ें',
    t2iHistoryTitle:'टोकन गतिविधि',
    t2iHistoryEmpty:'आपकी T2I गतिविधि यहाँ दिखाई देगी।',
    t2iHistoryWelcome:'स्वागत पुरस्कार',
    t2iHistoryTaskPost:'टास्क पोस्ट',
    t2iHistoryTaskOpen:'टास्क खोलें',
    t2iHistoryProfilePublish:'प्रोफ़ाइल प्रकाशित करें',
    t2iHistoryPremiumProfile:'प्रीमियम प्रोफ़ाइल एक्सेस',
    t2iHistoryPurchase:'टोकन खरीद',
    t2iHistoryWorkerEarning:'वर्कर की कमाई',
    t2iHistoryRefund:'रिफ़ंड',
    t2iHistoryAdminAdjustment:'खाता समायोजन',
    t2iPurchaseTitle:'T2I खरीदें',
    t2iPurchasePackage:'मिनी पैक · 100 T2I',
    t2iPurchaseDisabled:'खरीद अभी उपलब्ध नहीं है। कोई भुगतान नहीं लिया जाएगा।',
    t2iBuyTokens:'टोकन पैक देखें',
    t2iNoExpiry:'प्रमोशनल टोकन कभी समाप्त नहीं होंगे।',
    t2iConfirmSpend:'इस कार्रवाई में {cost} T2I लगेंगे। इसके बाद बैलेंस {balance} T2I होगा। जारी रखें?',
    t2iInsufficient:'आपको {cost} T2I चाहिए, लेकिन उपलब्ध बैलेंस {balance} है। अभी टोकन खरीदने की सुविधा उपलब्ध नहीं है।',
    t2iInsufficientRace:'इस कार्रवाई से पहले आपका T2I बैलेंस बदल गया। My Wallet देखें और फिर कोशिश करें।',
    t2iBalanceLoading:'आपका टोकन वॉलेट लोड हो रहा है…',
    t2iBalanceError:'T2I वॉलेट लोड नहीं हो सका। कृपया फिर कोशिश करें।',
    t2iAdminTitle:'टोकन कीमत नियंत्रण',
    t2iAdminServiceTitle:'मार्केटप्लेस सेवा शुल्क',
    t2iAdminRegionalTitle:'क्षेत्रीय पैक सेटिंग',
    t2iAdminService:'सेवा',
    t2iAdminCost:'कीमत (T2I)',
    t2iAdminEnabled:'सक्रिय',
    t2iAdminCountry:'देश कोड',
    t2iAdminCurrency:'मुद्रा',
    t2iAdminPackageSize:'पैक में टोकन',
    t2iAdminBasePrice:'आधार कीमत (स्थानीय इकाई)',
    t2iAdminTaxes:'टैक्स सेटिंग (JSON)',
    t2iAdminGateway:'गेटवे शुल्क सेटिंग (JSON)',
    t2iAdminPlatformFee:'प्लेटफ़ॉर्म शुल्क सेटिंग (JSON)',
    t2iAdminPackageAvailable:'पैक उपलब्ध',
    t2iAdminSave:'सेटिंग सेव करें',
    t2iAdminSaved:'टोकन कीमत की सेटिंग सेव हो गई।',
    t2iAdminSettingsError:'टोकन कीमत की सेटिंग लोड नहीं हो सकी।',
    t2iAdminRegionalRows:'कॉन्फ़िगर किए गए क्षेत्रीय पैक',
    t2iConfirmActionError:'T2I लागत की पुष्टि नहीं हो सकी। कोई टोकन नहीं काटा गया।',
    walletOverview:'वॉलेट की जानकारी',
    walletTitle:'TIME2INCOME वॉलेट',
    walletIntro:'अपने क्रेडिट, सुरक्षित राशि और वॉलेट की गतिविधि एक जगह देखें।',
    walletTokenLabel:'T2I टोकन बैलेंस',
    walletTokenUnit:'T2I टोकन',
    walletTokenNote:'केवल पूर्वावलोकन—अभी कोई टोकन जारी नहीं हुआ है। यह खर्च या ट्रांसफ़र किया जा सकने वाला बैलेंस नहीं है।',
    walletCreditExplainer:'ये दिखाई गई मुद्रा के वॉलेट क्रेडिट हैं—क्रिप्टो टोकन या निकाली जा सकने वाली नकदी नहीं। हर मुद्रा का बैलेंस अलग है; क्रेडिट केवल भविष्य के योग्य टास्क-एक्शन शुल्क में इस्तेमाल हो सकते हैं।',
    walletNoBalance:'अभी वॉलेट में क्रेडिट नहीं हैं। सपोर्ट से स्वीकृत क्रेडिट यहाँ दिखेंगे।',
    walletByCurrency:'मुद्रा के अनुसार क्रेडिट',
    walletTotalCredit:'कुल वॉलेट क्रेडिट',
    walletSandboxNote:'केवल सैंडबॉक्स पूर्वावलोकन। यह वॉलेट लाइव भुगतान के लिए सक्रिय नहीं है।',
    walletPolicyNote:'क्रेडिट निकाले नहीं जा सकते और केवल भविष्य के टास्क-एक्शन शुल्क में उपयोग होंगे। प्रस्तावित 60-दिन की अवधि कानूनी समीक्षा के अधीन है।',
    walletRefresh:'वॉलेट रीफ़्रेश करें',
    walletBalance:'बैलेंस',
    walletAvailable:'उपलब्ध',
    walletReserved:'चेकआउट में सुरक्षित',
    walletHistory:'वॉलेट इतिहास',
    walletNoHistory:'अभी कोई वॉलेट लेन-देन नहीं है।',
    walletExpiry:'समाप्ति',
    walletSupportForm:'भुगतान समस्या रिपोर्ट करें',
    walletIssueType:'समस्या का प्रकार',
    walletDuplicate:'डुप्लिकेट भुगतान',
    walletFailedAction:'असफल टास्क कार्रवाई',
    walletTechnical:'सत्यापित तकनीकी या भुगतान समस्या',
    walletEvidenceLabel:'भुगतान का स्क्रीनशॉट (वैकल्पिक)',
    walletEvidenceHint:'5 MB तक JPG, PNG या WebP। अपलोड से पहले कार्ड विवरण, पासवर्ड और सत्यापन कोड छिपा दें।',
    walletEvidenceInvalidType:'JPG, PNG या WebP इमेज चुनें।',
    walletEvidenceTooLarge:'स्क्रीनशॉट 5 MB या उससे छोटा होना चाहिए।',
    walletEvidenceUploading:'स्क्रीनशॉट सुरक्षित रूप से अपलोड हो रहा है…',
    walletEvidenceFileReady:'स्क्रीनशॉट चुना गया',
    walletEvidenceView:'भुगतान का स्क्रीनशॉट देखें',
    walletEvidenceUnavailable:'भुगतान का स्क्रीनशॉट उपलब्ध नहीं है।',
    walletReference:'भुगतान/प्रदाता संदर्भ',
    walletCurrency:'मुद्रा',
    walletClaimedAmount:'भुगतान की गई राशि',
    walletDetails:'समस्या का विवरण दें',
    walletSendRequest:'समीक्षा के लिए सपोर्ट को भेजें',
    walletRequestSent:'सत्यापन के लिए आपका अनुरोध सपोर्ट को भेज दिया गया है।',
    walletRequestReturned:'सुरक्षित वॉलेट क्रेडिट आपके उपलब्ध बैलेंस में लौटाया गया है।',
    walletRequestFailed:'सपोर्ट अनुरोध नहीं भेजा जा सका। भुगतान की स्थिति नहीं बदली।',
    walletReviewQueue:'सपोर्ट समीक्षा कतार',
    walletNoRequests:'समीक्षा के लिए कोई अनुरोध लंबित नहीं है।',
    walletApprovedAmount:'स्वीकृत क्रेडिट',
    walletReviewNote:'समीक्षा टिप्पणी',
    walletApprove:'क्रेडिट स्वीकृत करें',
    walletReject:'अनुरोध अस्वीकार करें',
    walletReviewSaved:'सपोर्ट समीक्षा सहेजी गई।',
    walletSetupRequired:'वॉलेट सेवाएँ अभी उपलब्ध नहीं हैं। कृपया बाद में फिर कोशिश करें।',
    walletStatusPending:'समीक्षा लंबित',
    walletStatusApproved:'स्वीकृत',
    walletStatusRejected:'अस्वीकृत',
    walletPartialApplied:'वॉलेट क्रेडिट सुरक्षित है; शेष राशि Razorpay से ली जाएगी।',
    taskCurrencyUnsupported:'आपकी पसंदीदा मुद्रा में भुगतान उपलब्ध नहीं है। अकाउंट सेटिंग में समर्थित मुद्रा चुनें।',
    taskCancelledToast:'काम हटा दिया गया।',
    confirmCancelTask:'क्या इस खुले काम को स्थायी रूप से हटाएँ? यह वापस नहीं आएगा।',
    taskNoLongerEditable:'यह काम खुला नहीं है या इसमें एक बार संपादन हो चुका है।',
    taskExpiresAt:'सक्रियता समाप्त',
    status_expired:'समय सीमा समाप्त',
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
    taskSkillSuggestionHint:'કૌશલ્યના સૂચનો શીર્ષક શરૂ કરવામાં મદદ કરે છે. નીચે વિગતો લખો અને યોગ્ય શ્રેણી પસંદ કરો.',
    taskDetailsPlaceholder:'કામ, સમય અને જરૂરિયાતો લખો', optional:'વૈકલ્પિક',
    selectCountry:'દેશ પસંદ કરો અથવા લખો', state:'રાજ્ય', cityOrRegion:'શહેર અથવા વિસ્તાર', yourName:'તમારું નામ',
    emailPlaceholder:'you@example.com', passwordPlaceholder:'ઓછામાં ઓછા 8 અક્ષર',
    passwordNotice:'તમારો પાસવર્ડ Supabase Authentication સંભાળે છે. તેને કોઈ સાથે શેર ન કરો.',
    signIn:'સાઇન ઇન', join:'જોડાઓ',
    eyebrow:'સમય, કુશળતા અને તકોનું માર્કેટપ્લેસ',
    headline:'યોગ્ય કુશળતા શોધો.<br><em>દરેક કલાકનો ઉપયોગ કરો.</em>',
    subhead:'થોડા કલાકો માટે નિષ્ણાત શોધો અથવા લવચીક કામ મેળવો.',
    mottoKicker:'અમારો વિચાર', mottoTitle:'તમારો સમય. તમારી કુશળતા. તમારી કમાણી.',
    mottoSub:'દરેક પાસે ફાજલ સમય અને વહેંચવા જેવી કુશળતા છે. TIME2INCOME કામ કરાવનારને કામ કરનાર સાથે જોડે છે.',
    mottoStep1Title:'તમારી જરૂર કે સેવા જણાવો', mottoStep1Body:'ટાસ્ક પોસ્ટ કરો, અથવા તમારી કુશળતા સાથે પ્રોફાઇલ પ્રકાશિત કરો.',
    mottoStep2Title:'યોગ્ય વ્યક્તિ સાથે જોડાઓ', mottoStep2Body:'વિનંતી મોકલો. પ્રોવાઇડર સ્વીકારે છે અને ચેટ ખુલે છે.',
    mottoStep3Title:'કામ પૂરું કરો અને કમાઓ', mottoStep3Body:'ચેટમાં વિગતો નક્કી કરો, કામ પૂરું કરો અને કન્ફર્મ કરો.',
    mottoNeedWork:'મારે કામ કરાવવું છે', mottoFindWork:'મારે કામ જોઈએ છે', mottoDemo:'ટૂંકો ડેમો જુઓ',
    categoriesSub:'રોજિંદી મદદ અને વ્યાવસાયિક કુશળતાઓ શોધો. તમે સૌથી વધુ વાપરેલી શ્રેણીઓ ઉપર દેખાશે.',
    relatedSkills:'સંબંધિત કુશળતાઓ', discoverMore:'વધુ શોધો',
    tryNewCategories:'નવી શ્રેણી અજમાવો', pickedForYou:'તમારા માટે પસંદ કરેલ',
    skillsToExplore:'શોધવા માટે {count} કુશળતાઓ',
    needWork:'મારે કામ કરાવવું છે', findWork:'મારે કામ શોધવું છે',
    searchPlaceholder:'જેમ કે પ્લમ્બર, લોગો ડિઝાઇનર…',
    locationPlaceholder:'શહેર, પિનકોડ અથવા દેશ', search:'શોધો', popular:'તમારી નજીક લોકપ્રિય:',
    popularSkillsLoading:'નજીકમાં સૌથી વધુ માંગવાળી સ્કિલ શોધી રહ્યા છીએ…',
    popularSkillsNoLocation:'નજીકની માંગ જોવા માટે coordinates ધરાવતું સ્થાન પસંદ કરો.',
    popularSkillsNoDemand:'આ વિસ્તારમાં હાલમાં તાજેતરના ખુલ્લા સ્થાનિક ટાસ્ક નથી.',
    popularSkillsLimited:'નજીકમાં તાજેતરના ટાસ્કની માંગ પાંચથી ઓછી સ્કિલ માટે છે.',
    popularSkillsUnavailable:'નજીકની માંગનો ડેટા હજી ઉપલબ્ધ નથી.',
    taskLocationIndexWarning:'ટાસ્ક સાચવાયો, પરંતુ નજીકની માંગની ભલામણો માટે તેનું સ્થાન ઉમેરી શકાયું નથી.',
    helpCenter:'મદદ', privacyPolicy:'ગોપનીયતા નીતિ', termsOfService:'સેવાની શરતો',
    useMyLocation:'મારું સ્થાન વાપરો',
    changeMarketplaceLocation:'સ્થાન',
    searchLocationSearching:'તમારું સ્થાન તપાસી રહ્યા છીએ…',
    searchLocationFailed:'સ્થાન મળી શક્યું નથી. તેના બદલે શહેર લખો.',
    searchLocationActive:'પસંદ કરેલા સ્થાનથી લગભગ 15 કિમીની અંદરના પ્રોવાઇડર પહેલાં દેખાશે; બાકીના પછી. તમારા કોઓર્ડિનેટ આ ઉપકરણ પર જ રહે છે.',
    taskGlobalLocationHint:'કામ જ્યાં થવાનું છે તે શહેર અને દેશ લખો—ભલે તમે બીજી જગ્યાએથી પોસ્ટ કરતા હો.',
    taskDemandPrivacyHint:'સ્થાનિક શોધ માટે આ શહેરમાંથી અંદાજિત વિસ્તાર નક્કી થાય છે. કોઓર્ડિનેટ ખાનગી રહે છે અને તમારા ટાસ્ક પર દેખાતા નથી.',
    providerServiceAreaHint:'ગ્રાહકો તમારી સેવા જ્યાં મેળવી શકે તે શહેર અને દેશ પસંદ કરો. તે તમારા વર્તમાન સ્થાનથી અલગ, ગમે ત્યાં હોઈ શકે.',
    providerPostalCode:'Pin code',
    postalCode:'પિનકોડ',
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
    viewAll:'કુશળતાઓ બ્રાઉઝ કરો →', skillCatalogTitle:'કૌશલ્યના સૂચનો જુઓ',
    skillCatalogHint:'માર્કેટપ્લેસમાં શોધવા માટે કૌશલ્ય પસંદ કરો. સૂચન મળવાથી સંબંધિત લિસ્ટિંગની ખાતરી થતી નથી.',
    skillCatalogLimit:'100 સુધીનાં પરિણામો દેખાય છે. બધી કુશળતાઓ શોધવા લખો.',
    skillSuggestionLimit:'પહેલાં 50 પરિણામો દેખાય છે. શોધ સાંકડી કરવા વધુ લખો.',
    catalogSuggestPending:'તમારું સૂચન સમીક્ષા માટે મોકલવામાં આવ્યું છે.',
    catalogSuggestError:'કેટલોગ સૂચન મોકલી શકાયું નથી.',
    skillCatalogSearchLabel:'કૌશલ્ય શોધો', skillCatalogSearchPlaceholder:'કૌશલ્ય શોધો',
    skillCatalogCategoryLabel:'શ્રેણી પ્રમાણે ફિલ્ટર કરો', skillCatalogAllCategories:'બધી શ્રેણીઓ', skillCategoryOther:'અન્ય (વર્ગીકરણ વગરની કુશળતા)', profileLiveNote:'તમારી પ્રોફાઇલ પ્રકાશિત છે. નીચે કંઈપણ બદલો, પછી અપડેટ કરવા "Save and publish" દબાવો.',
    skillCategoryFilter:'કૌશલ્યોને શ્રેણી પ્રમાણે ફિલ્ટર કરો',
    taskSkillCategoryHint:'આ ફક્ત કૌશલ્ય સૂચનોને ફિલ્ટર કરે છે. નીચે કાર્ય લિસ્ટિંગની શ્રેણી પસંદ કરો.',
    profileSkillCategoryHint:'આ ફક્ત કૌશલ્ય સૂચનોને ફિલ્ટર કરે છે. પ્રોફાઇલની શ્રેણી અલગ છે.',
    noSkillsFound:'મેળ ખાતું કૌશલ્ય મળ્યું નથી. બીજો શબ્દ અજમાવો.',
    accountSkillPlaceholder:'કુશળતા શોધો અથવા પસંદ કરો',
    accountSkillHint:'કુશળતા શોધવા લખો અથવા સૂચનોમાંથી પસંદ કરો.',
    additionalSkills:'વધારાની કુશળતાઓ', additionalSkillsRequired:'પ્રોવાઇડર પ્રોફાઇલ પ્રકાશિત કરતાં પહેલાં ઓછામાં ઓછી એક વધારાની કુશળતા ઉમેરો.', addSkill:'કુશળતા ઉમેરો', removeSkill:'દૂર કરો',
    homeServices:'ઘરની સેવાઓ',
    driving:'ડ્રાઇવિંગ અને ડિલિવરી', digital:'ડિજિટલ અને ક્રિએટિવ',
    office:'ઓફિસ સહાય', education:'શિક્ષણ', personal:'વ્યક્તિગત સહાય',
    readyToHelp:'મદદ માટે તૈયાર',
    professionalsTitle:'કામ માટે તૈયાર કુશળ લોકો',
    professionalsSub:'પ્રકાશિત પ્રોવાઇડર પ્રોફાઇલ અહીં દેખાશે. તમારી કુશળતા આપવા પ્રોફાઇલ બનાવો.',
    providerSearchLabel:'પ્રોવાઇડર પ્રોફાઇલ શોધો',
    providerSearchPlaceholder:'કુશળતા, સેવા અથવા પ્રોવાઇડર શોધો',
    searchProviders:'પ્રોવાઇડર શોધો',
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
    taskDialogKicker:'કામ પોસ્ટ કરો',
    taskDialogTitle:'તમને કઈ મદદ જોઈએ છે?',
    taskTitleLabel:'કામનું શીર્ષક', taskDetailsLabel:'વિગતો',
    taskCategoryLabel:'શ્રેણી', taskBudgetLabel:'બજેટ',
    requiredField:'કૃપા કરીને આ જરૂરી ફીલ્ડ ભરો.',
    taskLocationLabel:'શહેર અથવા વિસ્તાર', cityOrCountry:'શહેર, દેશ અથવા પિનકોડ', anyCityOrCountry:'કોઈપણ શહેર, દેશ અથવા પિનકોડ', demoWarning:'કામ પોસ્ટ કરવા 1 T2I લાગશે.',
    cancel:'રદ કરો', saveTask:'કામ પોસ્ટ કરો', contact:'પ્રોફાઇલ જુઓ',
    editTask:'કામ સંપાદિત કરો', taskEditUsed:'એક વખત સંપાદન થઈ ગયું', deleteTask:'કામ કાઢી નાખો', postTaskTitle:'તમને કઈ મદદ જોઈએ છે?',
    saveTaskChanges:'ફેરફારો સાચવો', taskUpdatedToast:'કામ અપડેટ થયું.',
    taskOpen:'કામ ખોલો',
    taskPostFeeNotice:'કામ પોસ્ટ કરવા 1 T2I લાગશે. પોસ્ટ કરતાં પહેલાં તમારું બેલેન્સ તપાસાશે.',
    taskOpenFeeNotice:'કામ ખોલવા 1 T2I લાગશે. પહેલેથી ખોલેલું કામ ફરી ખોલવું મફત છે.',
    taskPaymentDescription:'TIME2INCOME કામની કાર્યવાહી',
    taskPaymentClosed:'ચેકઆઉટ બંધ થયું; કોઈ કાર્યવાહી પૂર્ણ થઈ નથી.',
    taskPaymentFailed:'ચુકવણીની પુષ્ટિ થઈ નથી. કોઈ કાર્યવાહી પૂર્ણ થઈ નથી.',
    bookingPaymentDescription:'TIME2INCOME બુકિંગ સ્વીકાર ફી', acceptFeeHint:'સ્વીકારવા પર નાની ફી લાગશે. સ્વીકારતા જ ચેટ ખુલશે.',
    checkoutQuoteKicker:'ચુકવણીની વિગત', checkoutQuoteTitle:'કુલ રકમ તપાસો',
    checkoutQuoteIntro:'આ આ કાર્યવાહી માટેની સંપૂર્ણ પ્લેટફોર્મ ચેકઆઉટ ફી છે. સુરક્ષિત ચુકવણી પર સીધા જવા માટે પુષ્ટિ કરો.',
    checkoutQuoteWalletIntro:'ઉપલબ્ધ વૉલેટ ક્રેડિટ પહેલાં આ કુલ રકમમાં લાગુ થઈ શકે છે; બાકી રકમ સુરક્ષિત ચુકવણીથી લેવામાં આવશે.',
    checkoutCountry:'તમારો દેશ', checkoutRegion:'રાજ્ય / પ્રાંત',
    checkoutCategory:'મલેશિયા સેવા શ્રેણી', checkoutFixed:'નિશ્ચિત ચાર્જ',
    checkoutServiceFee:'સેવા ફી (5%)', checkoutPlatformFee:'પ્લેટફોર્મ ફી (5%)',
    checkoutSubtotal:'ફીનો ઉપ-કુલ', checkoutTax:'અંદાજિત સ્થાનિક કર',
    checkoutGateway:'ચુકવણી ગેટવે રિકવરી (ગ્રોસ-અપ)', checkoutTotal:'ચેકઆઉટની કુલ રકમ',
    checkoutCancel:'રદ કરો', checkoutContinue:'સુરક્ષિત ચુકવણી પર આગળ વધો',
    checkoutSelectCountry:'ચેકઆઉટની વિગત જોવા દેશ પસંદ કરો.',
    checkoutSelectRegion:'કરની ગણતરી માટે સૂચિમાંથી રાજ્ય અથવા પ્રાંત પસંદ કરો.',
    checkoutSelectCategory:'કરની ગણતરી માટે સેવા શ્રેણી પસંદ કરો.',
    checkoutSelectRegionPlaceholder:'રાજ્ય / પ્રાંત પસંદ કરો',
    checkoutSelectCategoryPlaceholder:'સેવા શ્રેણી પસંદ કરો',
    checkoutGatewayNote:'{rate}% અંદાજિત અસરકારક ચુકવણી-ગેટવે દર. રકમ ચલણના નાના એકમ સુધી ઉપર ગોળ થશે.',
    checkoutBrazilNote:'બ્રાઝિલ માટે તમારી કિંમત સૂચિની 5% ધારણા વપરાઈ છે; આ પુષ્ટિ કરેલો કાનૂની કર દર નથી.',
    checkoutGeneralNote:'કર અને ગેટવે દરો આપેલી આયોજન સૂચિ પર આધારિત છે; કાનૂની અને ચુકવણી-પ્રદાતા ચકાસણી જરૂરી હોઈ શકે છે.',
    checkoutWalletApplied:'વૉલેટ ક્રેડિટ લાગુ: {amount}',
    walletButton:'મારું વૉલેટ',
    t2iBackMarketplace:'માર્કેટપ્લેસ પર પાછા જાઓ',
    t2iWalletTitle:'TIME2INCOME ટોકન વૉલેટ',
    t2iWalletIntro:'તમારા T2I ટોકન અને વૉલેટ પ્રવૃત્તિ',
    t2iWalletActions:'વૉલેટ વિકલ્પો',
    t2iPendingSetup:'સેટઅપ બાકી છે',
    t2iWalletTotal:'ઉપલબ્ધ T2I',
    t2iPromotionalBalance:'મફત પ્રમોશનલ ટોકન',
    t2iPurchasedBalance:'ખરીદેલા ટોકન',
    t2iWorkerEarnings:'કામદારની કમાણી (હાલ વાપરી શકાતી નથી)',
    t2iWelcomeReward:'સ્વાગત પુરસ્કાર',
    t2iWelcomeRewardNote:'એક વખતના 100 T2I સ્વાગત પુરસ્કારની કોઈ સમાપ્તિ નથી.',
    t2iTokenPolicy:'તમે બીજા સાઇન-ઇન કરેલા TIME2INCOME વપરાશકર્તાના વૉલેટ કોડ પર T2I મોકલી શકો છો. T2I ઉપાડી, રોકડમાં ફેરવી અથવા બહારના વૉલેટમાં મોકલી શકાતું નથી.',
    t2iBuyAction:'T2I ખરીદો',
    t2iSendAction:'મોકલો',
    t2iReceiveAction:'મેળવો',
    t2iHistoryAction:'ઇતિહાસ',
    t2iHowToUse:'T2I નો ઉપયોગ કેવી રીતે કરવો',
    t2iPostTaskCost:'ટાસ્ક પોસ્ટ · 1 T2I',
    t2iOpenTaskCost:'ટાસ્ક ખોલો · 1 T2I',
    t2iPublishProfileCost:'પ્રોફાઇલ પ્રકાશિત કરો · 1 T2I',
    t2iPremiumAccessCost:'પ્રીમિયમ પ્રોફાઇલ · 1 T2I',
    t2iComingSoon:'ટૂંક સમયમાં',
    t2iRewardBannerTitle:'નવા વપરાશકર્તાનું ઇનામ!',
    t2iRewardBannerBody:'દરેક પાત્ર ખાતાને એક વખત 100 T2I ઇનામ મળે છે.',
    t2iSendUnavailable:'હાલ આંતરિક ટ્રાન્સફર ઉપલબ્ધ નથી.',
    t2iReceiveUnavailable:'હાલ તમારો વૉલેટ કોડ ઉપલબ્ધ નથી.',
    t2iTransferTitle:'બીજા વપરાશકર્તાને T2I મોકલો',
    t2iTransferIntro:'પ્રાપ્તકર્તાનો T2I વૉલેટ કોડ દાખલ કરો. ટ્રાન્સફર તરત થશે અને પાછું લઈ શકાશે નહીં.',
    t2iTransferRecipientCode:'પ્રાપ્તકર્તાનો વૉલેટ કોડ',
    t2iTransferAmount:'જથ્થો (પૂર્ણ T2I)',
    t2iTransferSubmit:'ચકાસો અને મોકલો',
    t2iTransferConfirm:'{code} ને {amount} T2I મોકલવા છે? આ ટ્રાન્સફર પાછું લઈ શકાશે નહીં.',
    t2iTransferSuccess:'ટ્રાન્સફર પૂર્ણ. {amount} T2I મોકલાયા.',
    t2iTransferFailed:'ટ્રાન્સફર પૂર્ણ થઈ શક્યું નથી.',
    t2iTransferPending:'T2I ટ્રાન્સફર થઈ રહ્યું છે…',
    t2iTransferInsufficient:'આ ટ્રાન્સફર માટે તમારી પાસે પૂરતા T2I નથી.',
    t2iTransferRecipientUnavailable:'આ વૉલેટ કોડ ઉપલબ્ધ નથી. તપાસીને ફરી પ્રયાસ કરો.',
    t2iTransferCodeInvalid:'T2I- પછી 16 હેક્સાડેસિમલ અક્ષરવાળો વૉલેટ કોડ દાખલ કરો.',
    t2iTransferCopy:'મારો વૉલેટ કોડ કૉપી કરો',
    t2iTransferCopied:'વૉલેટ કોડ કૉપી થયો. T2I મેળવવા માટે તેને શેર કરો.',
    t2iTransferCopyFailed:'કોડ કૉપી થઈ શક્યો નથી. કૃપા કરીને પસંદ કરીને મેન્યુઅલી કૉપી કરો.',
    t2iTransferCodeTitle:'તમારો T2I વૉલેટ કોડ',
    t2iTransferCodeHelp:'T2I મેળવવા માટે આ કોડ બીજા સાઇન-ઇન કરેલા વપરાશકર્તા સાથે શેર કરો. પાસવર્ડ કે સાઇન-ઇન કોડ ક્યારેય શેર કરશો નહીં.',
    t2iTransferNote:'માત્ર આંતરિક T2I ટ્રાન્સફર. તે તરત થશે, પરત નહીં મળે અને રોકડમાં ફેરવી શકાશે નહીં.',
    t2iHistoryTransferSent:'T2I મોકલાયા',
    t2iHistoryTransferReceived:'T2I મળ્યા',
    t2iRewardCelebrate:'🎁 તમારા 100 T2I ઇનામ આવી ગયા!',
    t2iPurchaseCelebrate:'✨ તમારી T2I ખરીદીની પુષ્ટિ થઈ!',
    t2iRewardCelebrationClose:'ઉજવણી બંધ કરો',
    t2iBackWallet:'મારા વૉલેટ પર પાછા જાઓ',
    t2iBuyHeroTitle:'T2I ટોકન ખરીદો',
    t2iBuyHeroBody:'દરેક સૂચિબદ્ધ સ્થાનિક ચલણમાં પૅકેજની આધાર કિંમત સમાન સંખ્યાની છે; ફીનો અંદાજ અને ચુકવણીની ઉપલબ્ધતા દેશ પ્રમાણે અલગ છે.',
    t2iNoExpiryLabel:'ટોકનની સમયમર્યાદા નથી',
    t2iSelectPackage:'ટોકન પૅક પસંદ કરો',
    t2iMostPopular:'સૌથી લોકપ્રિય',
    t2iTokensPerHundred:'દર 100 T2I',
    t2iPackageIndiaNote:'દેશની યાદીમાં પ્રોફાઇલના 249 દેશો અને પ્રદેશો છે. પૅકેજની સમાન સંખ્યાત્મક કિંમતો સૂચિબદ્ધ સ્થાનિક ચલણમાં છે; વિનિમય દરથી રૂપાંતર થતું નથી. દરેક સ્થળે સ્થાનિક ચુકવણી સ્વીકાર અને ચેકઆઉટ ફી અથવા કરની પુષ્ટિ નથી.',
    t2iCountryEstimateUnavailable:'મૂળ કિંમત આ દેશના સૂચિબદ્ધ ચલણમાં દર્શાવાઈ છે. અહીં ફીના અંદાજ અને ચુકવણી સપોર્ટ ગોઠવાયેલા નથી, તેથી ચેકઆઉટ ઉપલબ્ધ નથી.',
    t2iEstimateUnavailable:'અંદાજ ઉપલબ્ધ નથી',
    t2iPackageBaseLabel:'ટોકન પૅકની મૂળ કિંમત',
    t2iPackageEstimatedTotal:'અંદાજિત ચેકઆઉટ કુલ',
    t2iPackageTaxEstimate:'અંદાજિત કર',
    t2iPackageProvisionalNote:'દર્શાવેલા કર અને ગેટવે ચાર્જ આયોજનના અંદાજ છે, ચુકવણીની રકમ નથી. સક્ષમ પૅકેજ માટે સર્વર દ્વારા મંજૂર કરાયેલ ચોક્કસ કુલ જ લેવામાં આવશે; દેશ અને પૅકેજ સ્પષ્ટ રીતે સક્ષમ ન થાય ત્યાં સુધી ચુકવણી ઉપલબ્ધ નથી.',
    t2iTokenDisclaimerTitle:'T2I ટોકન ખરીદી અસ્વીકરણ',
    t2iTokenDisclaimerBody:'T2I ટોકન TIME2INCOMEમાં પાત્ર સેવાઓ અને સુવિધાઓ મેળવવા માટે ખરીદવામાં આવતા પ્લેટફોર્મ યુટિલિટી ટોકન છે. તે વાસ્તવિક નાણાં, રોકાણ, થાપણ અથવા નાણાકીય મૂલ્યની ખાતરીવાળી સંપત્તિ નથી. તેનો ઉપયોગ ટાસ્ક પોસ્ટ કરવા, પ્રોફાઇલ પ્રકાશિત કરવા, પ્રીમિયમ સુવિધાઓ મેળવવા અને પ્લેટફોર્મ પર સૂચિબદ્ધ અન્ય પાત્ર પ્રવૃત્તિઓ માટે થઈ શકે છે. હાલની નીતિ મુજબ ટોકન સમાપ્ત થતા નથી અને ઉપયોગ થાય ત્યાં સુધી તમારા વૉલેટમાં રહે છે, જે એકાઉન્ટ અને પ્લેટફોર્મની શરતોને આધીન છે. ખરીદેલા ટોકન સામાન્ય રીતે રિફંડપાત્ર નથી અને રોકડમાં બદલી, ઉપાડી અથવા પ્લેટફોર્મની બહાર ટ્રાન્સફર કરી શકાતા નથી. ખરીદી પહેલાં ટોકનની કિંમતો અને ઉપયોગની વિગતો ધ્યાનથી તપાસો. કાયદા મુજબ જરૂરી રિફંડ અને ચકાસેલી તકનીકી ભૂલોના સુધારા લાગુ રહેશે.',
    t2iTokenDisclaimerAgreement:'મેં T2I ટોકન ખરીદી અસ્વીકરણ વાંચ્યું અને સ્વીકાર્યું છે તથા ટોકનનો ઉપયોગ અને રિફંડ નીતિ સમજી છે.',
    t2iLocalPrice:'મૂળ કિંમત (તમારા સ્થાનિક ચલણમાં)',
    t2iYouReceive:'તમને ચોક્કસ 100 T2I ટોકન મળશે.',
    t2iPriceBreakdown:'કિંમતની વિગતો',
    t2iPackageLine:'ટોકન પૅક (100 T2I)',
    t2iTaxLine:'લાગુ કર',
    t2iGatewayLine:'ચુકવણી ગેટવે ફી',
    t2iPlatformFeeLine:'પ્લેટફોર્મ સેવા ફી',
    t2iTotalPayable:'અંદાજિત કુલ',
    t2iPurchasePending:'અંદાજમાં દેશના કામચલાઉ કર અને ગેટવે દરો છે. ટોકન ખરીદી હજી ઉપલબ્ધ નથી; કોઈ ચુકવણી લેવામાં નહીં આવે.',
    t2iPurchaseNotEnabled:'આ દેશ અને પૅકેજ માટે ટોકન ચુકવણી સક્ષમ નથી. કોઈ ચુકવણી લેવામાં નહીં આવે.',
    t2iPurchasePackagesError:'ઉપલબ્ધ ટોકન પૅકેજની પુષ્ટિ થઈ શકી નથી. ચુકવણી ઉપલબ્ધ નથી; કૃપા કરીને પછી ફરી પ્રયાસ કરો.',
    t2iPurchaseCheckoutError:'સુરક્ષિત ટોકન ચેકઆઉટ ઉપલબ્ધ નથી. ચુકવણી શરૂ થઈ નથી.',
    t2iPurchaseSuccess:'ચુકવણીની પુષ્ટિ થઈ. તમારા T2I ટોકન વૉલેટમાં ઉમેરાયા છે.',
    t2iPurchaseVerifyError:'ચુકવણીની પુષ્ટિ થઈ શકી નથી. જો રકમ કપાઈ હોય, તો ફરી પ્રયાસ કરતાં પહેલાં વૉલેટ પ્રવૃત્તિ તપાસો અથવા સપોર્ટનો સંપર્ક કરો.',
    t2iPurchaseStarting:'સુરક્ષિત ચેકઆઉટ તૈયાર થઈ રહ્યું છે…',
    t2iPurchaseCancelled:'ચેકઆઉટ બંધ થયું. કોઈ ટોકન ક્રેડિટ થયું નથી.',
    t2iPackageCheckoutTotal:'અંતિમ ચેકઆઉટ કુલ',
    t2iProceedPay:'ચુકવણી કરવા આગળ વધો',
    t2iHistoryTitle:'ટોકન પ્રવૃત્તિ',
    t2iHistoryEmpty:'તમારી T2I પ્રવૃત્તિ અહીં દેખાશે.',
    t2iHistoryWelcome:'સ્વાગત પુરસ્કાર',
    t2iHistoryTaskPost:'ટાસ્ક પોસ્ટ',
    t2iHistoryTaskOpen:'ટાસ્ક ખોલો',
    t2iHistoryProfilePublish:'પ્રોફાઇલ પ્રકાશિત કરો',
    t2iHistoryPremiumProfile:'પ્રીમિયમ પ્રોફાઇલ ઍક્સેસ',
    t2iHistoryPurchase:'ટોકન ખરીદી',
    t2iHistoryWorkerEarning:'કામદારની કમાણી',
    t2iHistoryRefund:'રિફંડ',
    t2iHistoryAdminAdjustment:'ખાતા સમાયોજન',
    t2iPurchaseTitle:'T2I ખરીદો',
    t2iPurchasePackage:'મિની પૅક · 100 T2I',
    t2iPurchaseDisabled:'ખરીદી હજી ઉપલબ્ધ નથી. કોઈ ચુકવણી લેવામાં નહીં આવે.',
    t2iBuyTokens:'ટોકન પૅક જુઓ',
    t2iNoExpiry:'પ્રમોશનલ ટોકન ક્યારેય સમાપ્ત થતા નથી.',
    t2iConfirmSpend:'આ કાર્યમાં {cost} T2I લાગશે. પછી બૅલેન્સ {balance} T2I થશે. આગળ વધવું છે?',
    t2iInsufficient:'તમને {cost} T2I જોઈએ છે, પરંતુ ઉપલબ્ધ બૅલેન્સ {balance} છે. ટોકન ખરીદી હજી ઉપલબ્ધ નથી.',
    t2iInsufficientRace:'આ કાર્યવાહી પહેલાં તમારું T2I બૅલેન્સ બદલાયું. My Wallet તપાસીને ફરી પ્રયાસ કરો.',
    t2iBalanceLoading:'તમારું ટોકન વૉલેટ લોડ થઈ રહ્યું છે…',
    t2iBalanceError:'T2I વૉલેટ લોડ થઈ શક્યું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    t2iAdminTitle:'ટોકન કિંમત નિયંત્રણ',
    t2iAdminServiceTitle:'માર્કેટપ્લેસ સેવા ખર્ચ',
    t2iAdminRegionalTitle:'પ્રાદેશિક પૅક સેટિંગ',
    t2iAdminService:'સેવા',
    t2iAdminCost:'ખર્ચ (T2I)',
    t2iAdminEnabled:'સક્રિય',
    t2iAdminCountry:'દેશ કોડ',
    t2iAdminCurrency:'ચલણ',
    t2iAdminPackageSize:'પૅક ટોકન જથ્થો',
    t2iAdminBasePrice:'આધાર કિંમત (સ્થાનિક એકમ)',
    t2iAdminTaxes:'કર સેટિંગ (JSON)',
    t2iAdminGateway:'ગેટવે ફી સેટિંગ (JSON)',
    t2iAdminPlatformFee:'પ્લેટફોર્મ ફી સેટિંગ (JSON)',
    t2iAdminPackageAvailable:'પૅક ઉપલબ્ધ',
    t2iAdminSave:'સેટિંગ સાચવો',
    t2iAdminSaved:'ટોકન કિંમત સેટિંગ સાચવાઈ.',
    t2iAdminSettingsError:'ટોકન કિંમત સેટિંગ લોડ થઈ શકી નથી.',
    t2iAdminRegionalRows:'ગોઠવેલા પ્રાદેશિક પૅક',
    t2iConfirmActionError:'T2I ખર્ચની પુષ્ટિ થઈ શકી નથી. કોઈ ટોકન કપાયું નથી.',
    walletOverview:'વૉલેટની વિગતો',
    walletTitle:'TIME2INCOME વૉલેટ',
    walletIntro:'તમારા ક્રેડિટ, અનામત રકમ અને વૉલેટની પ્રવૃત્તિ એક જ જગ્યાએ જુઓ.',
    walletTokenLabel:'T2I ટોકન બૅલેન્સ',
    walletTokenUnit:'T2I ટોકન',
    walletTokenNote:'માત્ર પૂર્વાવલોકન—હજુ કોઈ ટોકન જારી થયું નથી. આ ખર્ચી શકાય અથવા ટ્રાન્સફર કરી શકાય એવું બૅલેન્સ નથી.',
    walletCreditExplainer:'આ દર્શાવેલી ચલણના વૉલેટ ક્રેડિટ છે—ક્રિપ્ટોકરન્સી ટોકન કે ઉપાડી શકાય તેવી રોકડ નથી. દરેક ચલણનો બૅલેન્સ અલગ છે; ક્રેડિટનો ઉપયોગ માત્ર ભવિષ્યની પાત્ર ટાસ્ક-ઍક્શન ફી માટે થઈ શકે છે.',
    walletNoBalance:'હાલમાં વૉલેટ ક્રેડિટ નથી. સપોર્ટ દ્વારા મંજૂર થયેલા ક્રેડિટ અહીં દેખાશે.',
    walletByCurrency:'ચલણ પ્રમાણે ક્રેડિટ',
    walletTotalCredit:'કુલ વૉલેટ ક્રેડિટ',
    walletSandboxNote:'માત્ર સૅન્ડબૉક્સ પૂર્વાવલોકન. આ વૉલેટ લાઇવ ચુકવણી માટે સક્રિય નથી.',
    walletPolicyNote:'ક્રેડિટ ઉપાડી શકાતી નથી અને માત્ર ભવિષ્યની ટાસ્ક-ઍક્શન ફી માટે છે. સૂચિત 60-દિવસની મુદત કાનૂની સમીક્ષા હેઠળ છે.',
    walletRefresh:'વૉલેટ રિફ્રેશ કરો',
    walletBalance:'બૅલેન્સ',
    walletAvailable:'ઉપલબ્ધ',
    walletReserved:'ચેકઆઉટ માટે અનામત',
    walletHistory:'વૉલેટ ઇતિહાસ',
    walletNoHistory:'હજુ કોઈ વૉલેટ વ્યવહાર નથી.',
    walletExpiry:'સમાપ્તિ',
    walletSupportForm:'ચુકવણીની સમસ્યા જણાવો',
    walletIssueType:'સમસ્યાનો પ્રકાર',
    walletDuplicate:'ડુપ્લિકેટ ચુકવણી',
    walletFailedAction:'નિષ્ફળ ટાસ્ક ઍક્શન',
    walletTechnical:'ચકાસેલી ટેકનિકલ અથવા ચુકવણી સમસ્યા',
    walletEvidenceLabel:'ચુકવણીનો સ્ક્રીનશૉટ (વૈકલ્પિક)',
    walletEvidenceHint:'5 MB સુધી JPG, PNG અથવા WebP. અપલોડ કરતાં પહેલાં કાર્ડની વિગતો, પાસવર્ડ અને વેરિફિકેશન કોડ છુપાવો.',
    walletEvidenceInvalidType:'JPG, PNG અથવા WebP ઇમેજ પસંદ કરો.',
    walletEvidenceTooLarge:'સ્ક્રીનશૉટ 5 MB અથવા તેનાથી નાનો હોવો જોઈએ.',
    walletEvidenceUploading:'સ્ક્રીનશૉટ સુરક્ષિત રીતે અપલોડ થઈ રહ્યો છે…',
    walletEvidenceFileReady:'સ્ક્રીનશૉટ પસંદ કર્યો',
    walletEvidenceView:'ચુકવણીનો સ્ક્રીનશૉટ જુઓ',
    walletEvidenceUnavailable:'ચુકવણીનો સ્ક્રીનશૉટ ઉપલબ્ધ નથી.',
    walletReference:'ચુકવણી/પ્રદાતા સંદર્ભ',
    walletCurrency:'ચલણ',
    walletClaimedAmount:'ચૂકવેલી રકમ',
    walletDetails:'સમસ્યાનું વર્ણન કરો',
    walletSendRequest:'સમીક્ષા માટે સપોર્ટને મોકલો',
    walletRequestSent:'ચકાસણી માટે તમારી વિનંતી સપોર્ટને મોકલાઈ છે.',
    walletRequestReturned:'અનામત વૉલેટ ક્રેડિટ તમારા ઉપલબ્ધ બૅલેન્સમાં પાછી આવી છે.',
    walletRequestFailed:'સપોર્ટ વિનંતી મોકલી શકાઈ નથી. ચુકવણીની સ્થિતિ બદલાઈ નથી.',
    walletReviewQueue:'સપોર્ટ સમીક્ષા કતાર',
    walletNoRequests:'સમીક્ષા માટે કોઈ વિનંતી બાકી નથી.',
    walletApprovedAmount:'મંજૂર ક્રેડિટ',
    walletReviewNote:'સમીક્ષા નોંધ',
    walletApprove:'ક્રેડિટ મંજૂર કરો',
    walletReject:'વિનંતી નકારો',
    walletReviewSaved:'સપોર્ટ સમીક્ષા સાચવાઈ.',
    walletSetupRequired:'વૉલેટ સેવાઓ અત્યારે ઉપલબ્ધ નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.',
    walletStatusPending:'સમીક્ષા બાકી',
    walletStatusApproved:'મંજૂર',
    walletStatusRejected:'નકારેલ',
    walletPartialApplied:'વૉલેટ ક્રેડિટ અનામત છે; બાકી રકમ Razorpay દ્વારા લેવામાં આવશે.',
    taskCurrencyUnsupported:'તમારી પસંદગીની ચલણમાં ટાસ્ક ચાર્જ ઉપલબ્ધ નથી. એકાઉન્ટ સેટિંગમાં સમર્થિત ચલણ પસંદ કરો.',
    taskCancelledToast:'કામ કાઢી નાખ્યું.',
    confirmCancelTask:'શું આ ખુલ્લું કામ કાયમી રીતે કાઢી નાખવું છે? આ પાછું મેળવી શકાશે નહીં.',
    taskNoLongerEditable:'આ કામ ખુલ્લું નથી અથવા તેમાં એક વખત ફેરફાર થઈ ચૂક્યો છે.',
    taskExpiresAt:'સક્રિય રહે ત્યાં સુધી',
    status_expired:'સમય પૂરો થયો',
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

const websiteGuideSteps = [
  ['websiteGuideStep1Title', 'websiteGuideStep1Body'],
  ['websiteGuideStep2Title', 'websiteGuideStep2Body'],
  ['websiteGuideStep3Title', 'websiteGuideStep3Body'],
  ['websiteGuideStep4Title', 'websiteGuideStep4Body']
];

function renderWebsiteGuideStep() {
  const [titleKey, bodyKey] = websiteGuideSteps[websiteGuideStep];
  $('websiteGuideProgress').textContent =
    t('websiteGuideProgress').replace('{step}', String(websiteGuideStep + 1));
  $('websiteGuideStepTitle').textContent = t(titleKey);
  $('websiteGuideBody').textContent = t(bodyKey);
  $('previousWebsiteGuideStep').hidden = websiteGuideStep === 0;
  $('nextWebsiteGuideStep').textContent = t(
    websiteGuideStep === websiteGuideSteps.length - 1 ? 'websiteGuideFinish' : 'websiteGuideNext'
  );
}

function maybeShowWebsiteGuide(user = currentUser) {
  if (!user || user.user_metadata?.time2income_website_guide_enabled !== true ||
      user.user_metadata?.time2income_website_guide_dismissed === true ||
      websiteGuideShownForSessionUserId === user.id ||
      document.documentElement.classList.contains('location-gateway-active') ||
      $('accountDialog').open) return;

  const dialog = $('websiteGuideDialog');
  if (dialog.open) return;
  websiteGuideStep = 0;
  $('websiteGuideDontShowAgain').checked = false;
  $('websiteGuideStatus').textContent = '';
  renderWebsiteGuideStep();
  dialog.showModal();
  websiteGuideShownForSessionUserId = user.id;
}

async function closeWebsiteGuide() {
  const dontShowAgain = $('websiteGuideDontShowAgain').checked;
  if (dontShowAgain) {
    if (!currentUser) throw new Error(t('signInDemo'));
    const { data, error } = await supabaseClient.auth.updateUser({
      data: {
        ...currentUser.user_metadata,
        time2income_website_guide_dismissed: true
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error(t('websiteGuideSaveError'));
    currentUser = data.user;
  }
  $('websiteGuideDialog').close();
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
  window.TIME2INCOME_COUNTRIES.forEach(({ name }) => addDatalistOption(countryOptions, name));
}

function skillAliasLabel(skill) {
  const aliases = window.TIME2INCOME_SKILL_ALIASES[skill] || [];
  return aliases.length ? `Also known as: ${aliases.join(', ')}` : '';
}

function resolveSkillAlias(value) {
  const normalized = String(value || '').trim().toLocaleLowerCase();
  if (!normalized) return '';
  return Object.entries(window.TIME2INCOME_SKILL_ALIASES).find(([, aliases]) =>
    aliases.some(alias => alias.toLocaleLowerCase() === normalized)
  )?.[0] || '';
}

async function loadNearbyPopularSkills(locationOverride = null) {
  const requestId = ++nearbySkillLoadRequest;
  const list = $('popularSkillList');
  const status = $('popularSkillStatus');
  if (!list || !status) return;

  list.replaceChildren();
  status.hidden = false;
  const location = locationOverride || marketplaceLocationContext;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    status.textContent = t('popularSkillsNoLocation');
    return;
  }

  status.textContent = t('popularSkillsLoading');
  try {
    const { data, error } = await supabaseClient.rpc('get_nearby_task_skills', {
      p_latitude: latitude,
      p_longitude: longitude
    });
    if (error) throw error;
    if (requestId !== nearbySkillLoadRequest) return;

    const skills = (Array.isArray(data) ? data : [])
      .map(row => String(row.skill_name || '').trim())
      .filter(Boolean)
      .slice(0, 5);
    if (!skills.length) {
      status.textContent = t('popularSkillsNoDemand');
      return;
    }

    list.replaceChildren(...skills.map(skill => {
      const button = document.createElement('button');
      button.className = 'chip';
      button.type = 'button';
      button.dataset.query = skill;
      button.textContent = skill;
      return button;
    }));
    status.hidden = skills.length === 5;
    status.textContent = skills.length < 5 ? t('popularSkillsLimited') : '';
  } catch (error) {
    if (requestId !== nearbySkillLoadRequest) return;
    console.warn('Nearby skill demand could not be loaded. Check supabase/nearby-task-demand.sql.', error);
    status.textContent = t('popularSkillsUnavailable');
  }
}

function expandSkillSearchTerms(value) {
  const normalized = String(value || '').trim().toLocaleLowerCase();
  const terms = [normalized];
  if (normalized.length < 3) return terms;

  Object.entries(window.TIME2INCOME_SKILL_ALIASES).forEach(([skill, aliases]) => {
    if (!skill.toLocaleLowerCase().includes(normalized) &&
      !aliases.some(alias => alias.toLocaleLowerCase().includes(normalized) || normalized.includes(alias.toLocaleLowerCase()))) return;
    terms.push(skill.toLocaleLowerCase(), ...aliases.map(alias => alias.toLocaleLowerCase()));
  });
  return [...new Set(terms)];
}

function populateSkillSuggestions() {
  const skillOptions = $('skillSuggestionOptions');
  if (!skillOptions) return;
  skillOptions.replaceChildren();
  window.TIME2INCOME_SKILLS.forEach(skill => addDatalistOption(skillOptions, skill, skillAliasLabel(skill)));
}

const OTHER_SKILL_CATEGORY = '__other__';

function populateSkillCategorySelect(select, selectedCategory = '') {
  const categoryMap = window.TIME2INCOME_SKILL_CATEGORIES;
  if (!categoryMap) throw new Error('Skill category data did not load.');
  const categories = window.TIME2INCOME_SKILL_CATEGORY_NAMES
    || [...new Set(Object.values(categoryMap))].sort((left, right) => left.localeCompare(right));
  select.replaceChildren(new Option(t('skillCatalogAllCategories'), ''));
  categories.forEach(category => select.add(new Option(category, category)));
  select.add(new Option(t('skillCategoryOther'), OTHER_SKILL_CATEGORY));
  select.value = categories.includes(selectedCategory) || selectedCategory === OTHER_SKILL_CATEGORY ? selectedCategory : '';
}

function populateCategorySkillOptions(list, category = '', query = '') {
  const categoryMap = window.TIME2INCOME_SKILL_CATEGORIES;
  if (!categoryMap) throw new Error('Skill category data did not load.');
  const needle = query.trim().toLocaleLowerCase();
  const skills = window.TIME2INCOME_SKILLS.filter(skill => {
    if (category === OTHER_SKILL_CATEGORY) { if (categoryMap[skill]) return false; }
    else if (category && categoryMap[skill] !== category) return false;
    if (!needle) return true;
    const aliases = window.TIME2INCOME_SKILL_ALIASES[skill] || [];
    return `${skill} ${aliases.join(' ')}`.toLocaleLowerCase().includes(needle);
  }).slice(0, 100);
  list.replaceChildren(...skills.map(skill => {
    const option = document.createElement('option');
    option.value = skill;
    const aliasLabel = skillAliasLabel(skill);
    if (aliasLabel) option.label = aliasLabel;
    return option;
  }));
}

function setupTaskSkillCategoryFilter() {
  const categorySelect = $('taskSkillCategory');
  const titleInput = $('taskTitle');
  const options = $('taskTitleSkillOptions');
  if (!categorySelect || !titleInput || !options) return;
  populateSkillCategorySelect(categorySelect);
  const updateOptions = () => {
    populateCategorySkillOptions(options, categorySelect.value, titleInput.value);
  };
  categorySelect.addEventListener('change', updateOptions);
  titleInput.addEventListener('input', updateOptions);
  updateOptions();
}

function setupSkillCatalog() {
  const toggle = $('showAllBtn');
  const catalog = $('skillCatalog');
  const search = $('skillCatalogSearch');
  const categoryFilter = $('skillCatalogCategory');
  const list = $('skillCatalogList');
  const empty = $('skillCatalogEmpty');
  const limitHint = $('skillCatalogLimit');
  const source = $('skillSuggestionOptions');
  if (!toggle || !catalog || !search || !categoryFilter || !list || !empty || !source) return;
  const allCategoriesOption = new Option('', '');
  const populateCategoryFilter = (selectedCategory = categoryFilter.value) => {
    const categoriesBySkill = window.TIME2INCOME_SKILL_CATEGORIES;
    if (!categoriesBySkill) throw new Error('Skill category data did not load.');
    const categoryCounts = new Map();
    Object.values(categoriesBySkill).forEach(category => {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    (window.TIME2INCOME_SKILL_CATEGORY_NAMES || []).forEach(category => {
      if (!categoryCounts.has(category)) categoryCounts.set(category, 0);
    });
    allCategoriesOption.textContent =
      `${t('skillCatalogAllCategories')} (${Object.keys(categoriesBySkill).length})`;
    categoryFilter.replaceChildren(allCategoriesOption);
    [...categoryCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([category, count]) => {
        categoryFilter.add(new Option(`${category} (${count})`, category));
      });
    categoryFilter.value = categoryCounts.has(selectedCategory) ? selectedCategory : '';
  };
  populateCategoryFilter('');
  window.addEventListener('time2income:displaychange', () => populateCategoryFilter());

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const selectedCategory = categoryFilter.value;
    const categoriesBySkill = window.TIME2INCOME_SKILL_CATEGORIES || {};
    const matches = [...source.options]
      .filter(option => (!selectedCategory || categoriesBySkill[option.value] === selectedCategory) &&
        `${option.value} ${option.label || ''}`.toLocaleLowerCase().includes(query))
      .map(option => option.value);
    const skills = matches.slice(0, 100);
    list.replaceChildren(...skills.map(skill => {
      const button = document.createElement('button');
      button.className = 'skill-catalog-chip';
      button.type = 'button';
      button.dataset.skill = skill;
      button.textContent = skill;
      return button;
    }));
    empty.hidden = skills.length > 0;
    if (limitHint) limitHint.hidden = matches.length <= skills.length;
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', catalog.id);
  toggle.addEventListener('click', () => {
    catalog.hidden = !catalog.hidden;
    toggle.setAttribute('aria-expanded', String(!catalog.hidden));
    if (catalog.hidden) return;
    search.value = '';
    render();
    catalog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    search.focus({ preventScroll: true });
  });
  search.addEventListener('input', render);
  categoryFilter.addEventListener('change', render);
  window.addEventListener('time2income:catalogupdated', () => {
    populateCategoryFilter();
    render();
  });
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-skill]');
    if (!button) return;
    catalog.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    $('searchInput').value = button.dataset.skill;
    $('searchInput').dispatchEvent(new Event('input', { bubbles: true }));
    const target = mode === 'work'
      ? $('taskBoardPanel')
      : document.querySelector('.featured-section');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setupPersonalizedCategories() {
  const grid = $('categoryGrid');
  const relatedPanel = $('categoryRelatedSkills');
  const relatedTitle = $('categoryRelatedTitle');
  const relatedList = $('categoryRelatedList');
  const discoverGrid = $('categoryDiscoverGrid');
  const catalog = $('skillCatalog');
  const catalogToggle = $('showAllBtn');
  const catalogCategory = $('skillCatalogCategory');
  const catalogSearch = $('skillCatalogSearch');
  const catalogList = $('skillCatalogList');
  const skills = window.TIME2INCOME_SKILLS || [];
  const categoriesBySkill = window.TIME2INCOME_SKILL_CATEGORIES || {};
  const usageKey = 'time2income_category_usage_v1';
  let categoryUsage = {};
  let discoveryUsage = {};

  if (!grid || !relatedPanel || !relatedTitle || !relatedList ||
      !discoverGrid || !catalog || !catalogToggle || !catalogCategory ||
      !catalogSearch || !catalogList) return;

  try {
    const saved = JSON.parse(localStorage.getItem(usageKey) || '{}');
    categoryUsage = saved.categories && typeof saved.categories === 'object' ? saved.categories : {};
    discoveryUsage = saved.discovery && typeof saved.discovery === 'object' ? saved.discovery : {};
  } catch (error) {
    console.warn('Could not read personalized category preferences:', error);
  }

  const categorySkillGroups = {
    'Home services': ['Home Services & Repair', 'Engineering & Construction', 'Agriculture & Animals'],
    'Driving & delivery': ['Transport & Logistics', 'Automotive & Mechanical'],
    'Digital & creative': ['Design & Creative', 'Technology & IT', 'Photography & Media'],
    'Office support': ['Business & Management', 'Data & Analytics', 'Finance & Accounting', 'Sales & Customer Support'],
    Education: ['Education & Coaching'],
    'Personal help': ['Health & Wellness', 'Beauty & Fashion', 'Food & Hospitality', 'Agriculture & Animals']
  };
  const preferredSkillTerms = {
    'Home services': ['plumbing', 'electrical', 'home repair', 'cleaning', 'gardening', 'furniture assembly', 'painting'],
    'Driving & delivery': ['driving', 'delivery', 'courier', 'moving', 'logistics', 'transport', 'automotive'],
    'Digital & creative': ['graphic design', 'logo design', 'web design', 'video editing', 'photography', 'ui design', 'social media design', 'illustration'],
    'Office support': ['data entry', 'virtual assistance', 'bookkeeping', 'administrative support', 'customer support', 'excel', 'project management'],
    Education: ['tutoring', 'language', 'coaching', 'music lessons', 'homework', 'teaching'],
    'Personal help': ['errand', 'pet sitting', 'dog walking', 'personal assistant', 'meal prep', 'gardening', 'fitness']
  };
  const discoveryCategories = [...new Set(Object.values(categoriesBySkill))];

  function saveUsage() {
    try {
      localStorage.setItem(usageKey, JSON.stringify({
        categories: categoryUsage,
        discovery: discoveryUsage
      }));
    } catch (error) {
      console.warn('Could not save personalized category preferences:', error);
    }
  }

  function incrementUsage(collection, name) {
    collection[name] = (Number(collection[name]) || 0) + 1;
    saveUsage();
  }

  function updateCardOrder() {
    [...grid.querySelectorAll('.category-card')]
      .sort((left, right) =>
        (Number(categoryUsage[right.dataset.category]) || 0) -
        (Number(categoryUsage[left.dataset.category]) || 0)
      )
      .forEach(card => grid.appendChild(card));
  }

  function renderDiscoveries() {
    const recommendations = discoveryCategories
      .filter(category => category)
      .sort((left, right) =>
        (Number(discoveryUsage[left]) || 0) - (Number(discoveryUsage[right]) || 0) ||
        discoveryCategories.indexOf(left) - discoveryCategories.indexOf(right)
      )
      .slice(0, 2);

    discoverGrid.replaceChildren(...recommendations.map(category => {
      const count = skills.filter(skill => categoriesBySkill[skill] === category).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-discover-card';
      button.dataset.discoverCategory = category;

      const icon = document.createElement('span');
      icon.className = 'category-discover-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✦';

      const copy = document.createElement('span');
      copy.className = 'category-discover-copy';
      const title = document.createElement('strong');
      title.textContent = category;
      const detail = document.createElement('small');
      detail.textContent = t('skillsToExplore').replace('{count}', String(count));
      copy.append(title, detail);

      const arrow = document.createElement('span');
      arrow.className = 'category-discover-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      button.append(icon, copy, arrow);
      return button;
    }));
  }

  function showRelatedSkills(categoryName) {
    const matchingGroups = categorySkillGroups[categoryName] || [];
    const candidates = skills.filter(skill => matchingGroups.includes(categoriesBySkill[skill]));
    const priorities = preferredSkillTerms[categoryName] || [];
    const relatedSkills = priorities
      .map(term => candidates.find(skill => skill.toLocaleLowerCase().includes(term)))
      .filter((skill, index, list) => skill && list.indexOf(skill) === index)
      .slice(0, 8);
    if (relatedSkills.length < 4) {
      candidates.forEach(skill => {
        if (relatedSkills.length < 8 && !relatedSkills.includes(skill)) relatedSkills.push(skill);
      });
    }
    relatedTitle.textContent = categoryName;
    relatedList.replaceChildren(...relatedSkills.map(skill => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-related-chip';
      button.dataset.relatedSkill = skill;
      button.textContent = skill;
      return button;
    }));
    relatedPanel.hidden = relatedSkills.length === 0;
  }

  updateCardOrder();
  renderDiscoveries();
  window.addEventListener('time2income:displaychange', renderDiscoveries);

  grid.addEventListener('click', event => {
    const card = event.target.closest('.category-card');
    if (!card) return;
    incrementUsage(categoryUsage, card.dataset.category);
    updateCardOrder();
    showRelatedSkills(card.dataset.category);
  }, true);

  relatedList.addEventListener('click', event => {
    const button = event.target.closest('[data-related-skill]');
    if (!button) return;
    incrementUsage(categoryUsage, relatedTitle.textContent);
    updateCardOrder();
    $('searchInput').value = button.dataset.relatedSkill;
    $('searchInput').dispatchEvent(new Event('input', { bubbles: true }));
    const target = mode === 'work'
      ? $('taskBoardPanel')
      : document.querySelector('.featured-section');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  discoverGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-discover-category]');
    if (!button) return;
    const category = button.dataset.discoverCategory;
    incrementUsage(discoveryUsage, category);
    renderDiscoveries();
    catalog.hidden = false;
    catalogToggle.setAttribute('aria-expanded', 'true');
    catalogCategory.value = category;
    catalogSearch.value = '';
    catalogCategory.dispatchEvent(new Event('change', { bubbles: true }));
    catalog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  catalogList.addEventListener('click', event => {
    if (!event.target.closest('[data-skill]') || !catalogCategory.value) return;
    incrementUsage(discoveryUsage, catalogCategory.value);
    renderDiscoveries();
  });
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

    function updateSelection() {
      const selected = [...source.options].some(option => option.value === input.value.trim());
      wrapper.classList.toggle('has-selection', selected);
    }

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
        label: option.label || option.value,
        displayLabel: option.dataset.displayLabel || ''
      })).filter(option => option.value).filter(option => {
        if (!needle) return true;
        return `${option.value} ${option.label}`.toLocaleLowerCase().includes(needle);
      });
      const seen = new Set();
      const matchingOptions = options.filter(option => {
        const key = `${option.value}\u0000${option.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const limitSkillOptions = ['skillSuggestionOptions', 'marketplaceSearchOptions', 'finderSkillOptions'].includes(listId);
      const hasMoreMatches = limitSkillOptions && matchingOptions.length > 50;
      filteredOptions = hasMoreMatches ? matchingOptions.slice(0, 50) : matchingOptions;
      activeIndex = -1;
      menu.replaceChildren();

      if (!filteredOptions.length) {
        const empty = document.createElement('div');
        empty.className = 'searchable-dropdown-empty';
        empty.textContent = t('noSuggestions');
        menu.appendChild(empty);
      } else {
        if (hasMoreMatches) {
          const hint = document.createElement('div');
          hint.className = 'searchable-dropdown-hint';
          hint.textContent = t('skillSuggestionLimit');
          menu.appendChild(hint);
        }
        filteredOptions.forEach((option, index) => {
          const button = document.createElement('button');
          button.className = 'searchable-dropdown-option';
          button.type = 'button';
          button.id = `${menu.id}-option-${index}`;
          button.setAttribute('role', 'option');
          const selected = option.value === input.value.trim();
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-selected', String(selected));
          button.textContent = option.displayLabel || (option.label
            ? listId === 'currencyOptions' || option.label.trim().toLocaleLowerCase() === option.value.trim().toLocaleLowerCase()
              ? option.label
              : `${option.value} — ${option.label}`
            : option.value);
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

    input.addEventListener('input', updateSelection);
    input.addEventListener('change', updateSelection);
    window.addEventListener('time2income:displaychange', updateSelection);
    updateSelection();
    input.addEventListener('focus', () => {
      updateSelection();
      render(true);
    });
    input.addEventListener('input', () => render());
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowDown') {
        if (menu.hidden) render();
        if (filteredOptions.length) markActive(Math.min(activeIndex + 1, filteredOptions.length - 1));
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

function updateHeaderCurrencySymbol(currencyCode = preferredCurrency) {
  const symbolElement = document.querySelector('.currency-symbol');
  if (symbolElement) symbolElement.textContent = window.TIME2INCOME_CURRENCY.symbolFor(currencyCode);
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
  updateHeaderCurrencySymbol(preferredCurrency);
  ['currencySelector', 'accountCurrency', 'customerCurrency', 'profileCurrency', 'taskCurrency', 'offerCurrency'].forEach(id => {
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
  const t2iWalletContent = $('t2iWalletContent');
  if (document.body.dataset.page === 'wallet' && t2iWalletContent?.firstElementChild) {
    renderT2iWalletPage();
    if (currentUser) {
      loadT2iWalletPage().catch(error => {
        console.error('Localized T2I wallet data could not be loaded:', error);
        const status = $('t2iWalletStatus');
        if (status) status.textContent = `${t('t2iBalanceError')} ${error.message || ''}`.trim();
      });
    }
  }
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

async function signProfilePhotoPaths(profiles) {
  const paths = [...new Set(profiles.map(profile => profile.avatar_url).filter(Boolean))];
  const photoUrls = Object.fromEntries(paths
    .filter(path => /^https:\/\//i.test(path))
    .map(path => [path, path]));
  const storagePaths = paths.filter(path => !/^https:\/\//i.test(path));
  if (!storagePaths.length) return photoUrls;
  const { data: signedPhotos, error } = await supabaseClient.storage
    .from('profile-photos').createSignedUrls(storagePaths, 86400);
  if (error) throw error;
  return {
    ...photoUrls,
    ...Object.fromEntries((signedPhotos || [])
      .filter(photo => photo.path && photo.signedUrl)
      .map(photo => [photo.path, photo.signedUrl]))
  };
}

function renderActivityAvatar(url, name) {
  const initials = String(name || '?').trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return url
    ? `<img class="activity-avatar" src="${safeText(url)}" alt="" loading="lazy">`
    : `<span class="activity-avatar activity-avatar-fallback" aria-hidden="true">${safeText(initials)}</span>`;
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

  [...$('skillSuggestionOptions').options].forEach(option => {
    const aliasLabel = skillAliasLabel(option.value);
    options.push({
      value: option.value,
      label: [t('skillCatalogSuggestion'), aliasLabel].filter(Boolean).join(' · ')
    });
  });

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

function compareNearbyProviders(a, b, coordinates) {
  if (!coordinates) return 0;
  const distanceA = a.type === 'Remote' ? Number.POSITIVE_INFINITY : providerDistanceKm(a, coordinates);
  const distanceB = b.type === 'Remote' ? Number.POSITIVE_INFINITY : providerDistanceKm(b, coordinates);
  const aNearby = distanceA <= NEARBY_PROVIDER_RADIUS_KM;
  const bNearby = distanceB <= NEARBY_PROVIDER_RADIUS_KM;
  if (aNearby !== bNearby) return aNearby ? -1 : 1;
  return aNearby ? distanceA - distanceB : 0;
}

function providerAreaRank(provider, location, coordinates) {
  if (coordinates) {
    const distance = provider.type === 'Remote'
      ? Number.POSITIVE_INFINITY
      : providerDistanceKm(provider, coordinates);
    return distance <= NEARBY_PROVIDER_RADIUS_KM ? 0 : 1;
  }
  return providerLocationRank(provider, location, coordinates);
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

function renderVerifiedBadge(verified) {
  if (!verified) return '';
  const label = safeText(t('identityVerifiedBadge'));
  return `<span class="verified-badge" title="${label}" aria-label="${label}">✓ ${label}</span>`;
}

async function loadUserTrust(userIds, includeRatings = true) {
  const ids = [...new Set(userIds.filter(Boolean))];
  const trustById = new Map(ids.map(id => [id, {
    identityVerified:false, rating:0, reviewCount:0, qualityScore:0
  }]));
  if (!ids.length) return trustById;

  const identityQuery = supabaseClient.from('identity_document_requirements')
    .select('user_id, approved_at')
    .in('user_id', ids)
    .not('approved_at', 'is', null);
  const ratingsQuery = includeRatings
    ? supabaseClient.from('reviews').select('worker_id, rating').in('worker_id', ids)
    : Promise.resolve({ data:[], error:null });
  const legacyIdentityQuery = supabaseClient.from('worker_profiles')
    .select('user_id, identity_verified')
    .in('user_id', ids);
  const [identityResult, ratingsResult, legacyIdentityResult] = await Promise.all([
    identityQuery, ratingsQuery, legacyIdentityQuery
  ]);

  const verifiedIds = new Set();
  if (identityResult.error) {
    console.error('Approved identity status could not be loaded; verified-first ordering is unavailable until the identity-document migration is applied:', identityResult.error);
  } else {
    (identityResult.data || []).forEach(row => verifiedIds.add(row.user_id));
  }
  if (legacyIdentityResult.error) {
    console.warn('Legacy provider verification flags are unavailable:', legacyIdentityResult.error);
  } else {
    (legacyIdentityResult.data || []).forEach(row => {
      if (row.identity_verified) verifiedIds.add(row.user_id);
    });
  }

  const ratingsByUser = new Map();
  let ratingTotal = 0;
  let totalReviews = 0;
  if (ratingsResult.error) {
    console.warn('Ratings are unavailable for marketplace ranking:', ratingsResult.error);
  } else {
    (ratingsResult.data || []).forEach(row => {
      const rating = Number(row.rating);
      if (!(rating >= 1 && rating <= 5)) return;
      const stats = ratingsByUser.get(row.worker_id) || { sum:0, count:0 };
      stats.sum += rating;
      stats.count += 1;
      ratingsByUser.set(row.worker_id, stats);
      ratingTotal += rating;
      totalReviews += 1;
    });
  }

  const priorRating = totalReviews ? ratingTotal / totalReviews : 0;
  ids.forEach(id => {
    const stats = ratingsByUser.get(id) || { sum:0, count:0 };
    trustById.set(id, {
      identityVerified:verifiedIds.has(id),
      rating:stats.count ? stats.sum / stats.count : 0,
      reviewCount:stats.count,
      qualityScore:(stats.sum + priorRating * 5) / (stats.count + 5)
    });
  });
  return trustById;
}

function providerQualityScore(provider) {
  return Number(provider.qualityScore) || 0;
}

function getTaskLocationFilterValue() {
  const enteredLocation = $('locationInput').value.trim();
  const selectedLocationLabels = marketplaceLocationContext
    ? [
      window.TIME2INCOME_LOCATION.formatLabel(marketplaceLocationContext),
      window.TIME2INCOME_LOCATION.formatSearchLabel(marketplaceLocationContext)
    ].map(label => label.toLocaleLowerCase())
    : [];
  if (!selectedLocationLabels.includes(enteredLocation.toLocaleLowerCase())) {
    return enteredLocation;
  }
  return [marketplaceLocationContext.city, marketplaceLocationContext.country].filter(Boolean).join(', ');
}

function setTaskSkillFilter(value = '') {
  workQuery = String(value || '').trim();
  const input = $('taskSkillFilter');
  if (input) input.value = workQuery;
}

function resolveSkillCategory(value) {
  const normalized = String(value || '').trim().toLocaleLowerCase();
  if (!normalized) return '';
  return (window.TIME2INCOME_SKILL_CATEGORY_NAMES || []).find(category =>
    category.toLocaleLowerCase() === normalized
  ) || '';
}

function refreshTaskBoardForSkill() {
  setTaskSkillFilter($('taskSkillFilter').value);
  renderTaskBoard().catch(error => toast(error.message));
}

function compareMarketplaceTrust(a = {}, b = {}) {
  return Number(Boolean(b.identityVerified)) - Number(Boolean(a.identityVerified)) ||
    (Number(b.qualityScore) || 0) - (Number(a.qualityScore) || 0) ||
    (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0);
}

function matchesLocationSearch(fields, query) {
  const place = fields.filter(Boolean).join(' ').toLocaleLowerCase();
  const terms = query.split(/[,/]+/).map(term => term.trim().toLocaleLowerCase()).filter(Boolean);
  return terms.every(term => place.includes(term));
}

function normalizeTaskCity(value) {
  return String(value || '').trim().normalize('NFKC').toLocaleLowerCase();
}

function isTaskInPriorityCity(task, location) {
  const taskCity = normalizeTaskCity(task.city);
  const priorityCity = normalizeTaskCity(location.city);
  if (!taskCity || !priorityCity || taskCity !== priorityCity) return false;

  const taskState = normalizeTaskCity(task.state);
  const priorityState = normalizeTaskCity(location.state);
  const taskCountry = normalizeTaskCity(task.country);
  const priorityCountry = normalizeTaskCity(location.country);
  return (!taskState || !priorityState || taskState === priorityState) &&
    (!taskCountry || !priorityCountry || taskCountry === priorityCountry);
}

function normalizePostalCode(value) {
  return String(value || '').normalize('NFKC').toLocaleUpperCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function renderWorkers() {
  const grid = $('workerGrid');
  if (!grid) return;

  const type = $('typeFilter')?.value || 'all';
  const sort = $('sortFilter').value;
  const location = $('locationInput').value.trim().toLocaleLowerCase();
  const locationCoordinates = searchLocationCoordinates;
  const requestedPostalCode = marketplaceLocationContext?.postalCode ||
    (/\d/.test(location) && !location.includes(',') ? location : '');
  const normalizedRequestedPostalCode = normalizePostalCode(requestedPostalCode);
  const selectedLocationLabel = marketplaceLocationContext
    ? window.TIME2INCOME_LOCATION.formatLabel(marketplaceLocationContext).toLocaleLowerCase()
    : '';
  const selectedLocationSearchLabel = marketplaceLocationContext
    ? window.TIME2INCOME_LOCATION.formatSearchLabel(marketplaceLocationContext).toLocaleLowerCase()
    : '';
  const usesSelectedLocation = Boolean(locationCoordinates && location &&
    [selectedLocationLabel, selectedLocationSearchLabel].includes(location));
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

  const checkedValues = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  const selectedSchedule = checkedValues('scheduleFilter');
  const selectedEmployment = checkedValues('employmentFilter');
  const selectedLevels = checkedValues('levelFilter');
  const salaryLimit = Number($('salaryRange')?.value || 90000);
  const scheduleAll = selectedSchedule.length === document.querySelectorAll('input[name="scheduleFilter"]').length;
  const levelsAll = selectedLevels.length === document.querySelectorAll('input[name="levelFilter"]').length;
  const employmentAll = selectedEmployment.length === document.querySelectorAll('input[name="employmentFilter"]').length;
  let list = getAllWorkers().filter(p => {
    const searchable = [
      p.name, p.skill, p.category, p.city, p.state, p.postalCode, p.description,
      ...(p.tags || []), ...(p.languages || [])
    ].join(' ').toLowerCase();
    const matchesQuery = !query || expandSkillSearchTerms(query).some(term => searchable.includes(term));
    const matchesCategory = !activeCategoryId || p.categoryId === activeCategoryId;
    const matchesType = type === 'all' || p.type === type || p.type === 'Both' && ['Local', 'Remote'].includes(type);
    const matchesLocation = !location || usesSelectedLocation || matchesLocationSearch([p.city, p.state, p.country, p.postalCode], location) || p.type === 'Remote';
    const employmentKey = p.type === 'Local' ? 'local' : p.type === 'Remote' ? 'remote' : 'both';
    const matchesEmployment = employmentAll || selectedEmployment.includes(employmentKey);
    const scheduleTerms = { full: /full.?time|full day/i, part: /part.?time/i, project: /project|freelance|contract/i, volunteer: /volunteer/i, internship: /intern/i };
    const matchesSchedule = scheduleAll || selectedSchedule.some(key => scheduleTerms[key]?.test(searchable));
    const levelTerms = { trainee: /trainee|entry.?level|fresher/i, junior: /junior|1.?2 years|0.?2 years/i, middle: /mid.?level|middle|3.?5 years/i, senior: /senior|lead|expert|5\+? years/i, director: /director|head of|principal/i };
    const matchesLevel = levelsAll || selectedLevels.some(key => levelTerms[key]?.test(searchable));
    const matchesSalary = !Number.isFinite(Number(p.rate)) || Number(p.rate) <= salaryLimit;
    const experience = $('experienceFilter')?.value || 'all';
    const matchesExperience = experience === 'all' || levelTerms[experience]?.test(searchable);
    return matchesQuery && matchesCategory && matchesType && matchesLocation && matchesEmployment && matchesSchedule && matchesLevel && matchesSalary && matchesExperience;
  });

  list.sort((a, b) => {
    if (normalizedRequestedPostalCode) {
      const postalCodeMatch = provider =>
        normalizePostalCode(provider.postalCode) === normalizedRequestedPostalCode;
      const postalCodeOrder = Number(postalCodeMatch(b)) - Number(postalCodeMatch(a));
      if (postalCodeOrder) return postalCodeOrder;
    }
    const areaOrder = providerAreaRank(a, location, locationCoordinates) -
      providerAreaRank(b, location, locationCoordinates);
    if (areaOrder) return areaOrder;
    if (sort === 'price') return compareMarketplaceTrust(a, b) || a.rate - b.rate;
    if (sort === 'rating') {
      return compareMarketplaceTrust(a, b) ||
        b.profileCompleteness - a.profileCompleteness;
    }
    return compareMarketplaceTrust(a, b) ||
      compareNearbyProviders(a, b, locationCoordinates) ||
      (locationCoordinates
        ? providerDistanceKm(a, locationCoordinates) - providerDistanceKm(b, locationCoordinates)
        : 0) ||
      b.profileCompleteness - a.profileCompleteness ||
      String(a.id).localeCompare(String(b.id));
  });

  const providerCards = list.map((p, index) => {
    const initials = p.initials || (p.name || 'U').split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
    const tags = [...(p.tags || []), ...(p.languages || []).map(language => `${t('languages')}: ${language}`)].slice(0, 4).map(tag =>
      `<span class="skill-tag">${safeText(tag)}</span>`
    ).join('');
    const categoryMark = (p.category || p.skill || 'T').trim().charAt(0).toUpperCase();
    return `
      <article class="worker-card finder-provider-card">
        <div class="finder-card-topline"><span class="finder-category-mark">${safeText(categoryMark)}</span><span class="finder-active-label">${p.reviewCount ? `★ ${Number(p.rating).toFixed(1)} · ${Number(p.reviewCount)} reviews` : t('providerRatingNone')}</span><button class="finder-save" data-save-worker="${safeText(p.id)}" type="button" aria-pressed="${isSavedWorker(p.id)}" aria-label="Save provider">${isSavedWorker(p.id) ? '♥' : '♡'}</button></div>
        <div class="worker-card-top">
          <div class="worker-avatar" style="background:${safeText(p.color || '#dce9fa')}">${p.avatarUrl ? `<img src="${safeText(p.avatarUrl)}" alt="${safeText(p.name)}" loading="lazy">` : safeText(initials)}</div>
          <div class="worker-meta"><h3>${safeText(p.name)}</h3>${renderVerifiedBadge(p.identityVerified)}<p>${safeText(p.skill)}</p></div>
        </div>
        <p class="finder-provider-location">⌖ ${safeText([p.city, p.state, p.country].filter(Boolean).join(', ') || 'Remote')}</p>
        <p class="worker-description">${safeText(p.description || p.bio || 'Marketplace service provider.')}</p>
        <div class="tag-row">${tags}</div>
        <div class="worker-bottom"><div class="worker-price"><small>${t('startingAt')}</small><strong>${p.rate ? safeText(formatMoney(p.rate, p.currency || 'INR')) : 'Contact'} <small>${p.rate ? '/ hr' : ''}</small></strong></div><span class="work-type">${safeText(p.type || 'Remote')}</span></div>
        <div class="worker-actions"><button class="btn btn-outline" data-action="profile" data-id="${safeText(p.id)}" type="button">${t('contact')}</button><button class="btn btn-primary" data-action="book" data-id="${safeText(p.id)}" type="button">${t('request')}</button></div>
      </article>`;
  });
  const promoCard = `<aside class="finder-promo-card"><div class="finder-promo-shape" aria-hidden="true"></div><span class="finder-promo-kicker">TIME2INCOME</span><h3>Find the right person for your next task.</h3><p>Post what you need. Compare providers and choose the right fit.</p><button type="button" class="finder-promo-button" id="finderPostTask">Post a task <span aria-hidden="true">→</span></button></aside>`;
  if (providerCards.length > 2) providerCards.splice(2, 0, promoCard);
  grid.innerHTML = providerCards.join('');
  const countLabel = $('jobsProviderCount');
  if (countLabel) countLabel.textContent = list.length ? list.length.toLocaleString() : '0';


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
    let { data, error } = await supabaseClient
      .from('worker_profiles')
      .select(`
      user_id, headline, skills, bio, category_id, service_languages, portfolio_images, work_preference,
        service_latitude, service_longitude,
        hourly_rate, currency_code, service_city, service_state, service_country, service_postal_code
      `)
      .eq('is_published', true);

    if (error) throw error;

    const userIds = [...new Set((data || []).map(w => w.user_id).filter(Boolean))];
    const categoryIds = [...new Set((data || []).map(w => w.category_id).filter(Boolean))];
    let profilesById = {};
    let categoriesById = {};

    if (userIds.length) {
      const { data: profiles, error: profileError } = await selectProfiles('id, display_name, avatar_url',
        query => query.in('id', userIds));

      if (profileError) throw profileError;

      profilesById = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      );
    }

    const photoUrlsByPath = await signProfilePhotoPaths(Object.values(profilesById));

    if (categoryIds.length) {
      const { data: categories, error: categoryError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);
      if (categoryError) throw categoryError;
      categoriesById = Object.fromEntries((categories || []).map(category => [category.id, category.name]));
    }

    const trustByUserId = await loadUserTrust(userIds);
    realWorkers = (data || []).map(w => {
      const p = profilesById[w.user_id] || {};
      const name = p.display_name || '';
      const avatarUrl = photoUrlsByPath[p.avatar_url] || '';
      const trust = trustByUserId.get(w.user_id) || {};
      const category = categoriesById[w.category_id] || '';
      const workType = w.work_preference === 'both'
        ? 'Both'
        : w.work_preference === 'remote' ? 'Remote' : 'Local';
      const skills = Array.isArray(w.skills) ? w.skills.filter(Boolean) : [];
      const headline = String(w.headline || '').trim();
      const city = String(w.service_city || '').trim();
      const state = String(w.service_state || '').trim();
      const country = String(w.service_country || '').trim();
      const postalCode = String(w.service_postal_code || '').trim();
      const rate = Number(w.hourly_rate);
      const isComplete = name.trim() && avatarUrl && headline && w.category_id && category &&
        String(w.bio || '').trim() && city && state && country &&
        Array.isArray(w.service_languages) && w.service_languages.length > 0 &&
        Array.isArray(w.portfolio_images) && w.portfolio_images.length > 0 &&
        Number.isFinite(rate) && rate > 0;
      if (!isComplete) return null;
      return {
        id: w.user_id,
        name,
        avatarUrl,
        initials: name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase(),
        skill: headline,
        categoryId: w.category_id,
        category,
        city,
        state,
        country,
        postalCode,
        latitude: w.service_latitude === null ? null : Number(w.service_latitude),
        longitude: w.service_longitude === null ? null : Number(w.service_longitude),
        rate,
        currency: w.currency_code || 'INR',
        identityVerified: Boolean(trust.identityVerified),
        languages: w.service_languages || [],
        rating: trust.rating || 0,
        reviewCount: trust.reviewCount || 0,
        qualityScore: providerQualityScore(trust),
        profileCompleteness: [
          name.trim(), avatarUrl, headline, category, String(w.bio || '').trim(),
          country, city, Number.isFinite(rate) && rate > 0
        ].filter(Boolean).length,
        type: workType,
        description: String(w.bio || '').trim(),
        portfolioImages: (w.portfolio_images || []).map(path =>
          supabaseClient.storage.from('worker-portfolio').getPublicUrl(path).data.publicUrl
        ),
        tags: skills.filter(skill => skill.toLocaleLowerCase() !== headline.toLocaleLowerCase()),
        color: '#dce9fa'
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
    const matchedSkillCategory = resolveSkillCategory(value);
    activeCategory = '';
    activeCategoryId = '';
    query = '';
    $('taskCityFilter').value = getTaskLocationFilterValue();
    $('taskCategoryFilter').value = matchedCategory?.name || matchedSkillCategory;
    setTaskSkillFilter(matchedCategory || matchedSkillCategory ? '' : value);
    renderTaskBoard().catch(error => toast(error.message));
  } else {
    $('taskCategoryFilter').value = '';
    setTaskSkillFilter('');
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
  $('taskForm').querySelectorAll('[required]').forEach(field => field.setCustomValidity(''));
  editingTaskId = null;
  $('taskDialog').querySelector('[data-i18n="taskDialogKicker"]').textContent = t('taskDialogKicker');
  $('taskDialog').querySelector('[data-i18n="taskDialogTitle"]').textContent = t('postTaskTitle');
  $('taskForm').querySelector('button[type="submit"]').textContent = t('saveTask');
  updateTaskBudgetPreview();
  $('taskDialog').showModal();
}

function openTaskForEditing(task) {
  if (!currentUser || task.customer_id !== currentUser.id || task.status !== 'open' ||
      Number(task.edit_count) >= 1 ||
      Date.now() >= new Date(task.created_at).getTime() + 7 * 24 * 60 * 60 * 1000) {
    toast(t('taskNoLongerEditable'));
    return;
  }
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
  $('taskState').value = task.state || '';
  $('taskLocation').value = task.city || '';
  $('taskScheduledStart').value = task.scheduled_start
    ? new Date(new Date(task.scheduled_start).getTime() - new Date(task.scheduled_start).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : '';
  $('taskForm').querySelectorAll('[required]').forEach(field => field.setCustomValidity(''));
  $('taskDialog').querySelector('[data-i18n="taskDialogKicker"]').textContent = t('editTask');
  $('taskDialog').querySelector('[data-i18n="taskDialogTitle"]').textContent = t('editTask');
  $('taskForm').querySelector('button[type="submit"]').textContent = t('saveTaskChanges');
  updateTaskBudgetPreview();
  $('taskDialog').showModal();
}

function openAccountDialog(nextMode = 'signup') {
  accountMode = nextMode;
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
  $('workerFields').classList.toggle('hidden', !isSignup);
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

function renderProfilePhotoSection() {
  if (!profilePhotoColumnAvailable) {
    return `
      <section class="profile-photo-card" aria-labelledby="profilePhotoTitle">
        <div>
          <h4 id="profilePhotoTitle">${t('profilePhotoTitle')} *</h4>
          <label class="form-label" for="profilePhotoInput">${t('profilePhotoChoose')}
            <input id="profilePhotoInput" type="file" accept="image/jpeg,image/png,image/webp" disabled>
          </label>
          <button class="btn btn-outline" type="button" disabled>${t('profilePhotoSave')}</button>
        </div>
        <img id="profilePhotoPreview" src="" alt="${t('profilePhotoTitle')}" hidden>
      </section>`;
  }
  const photoRequired = !accountProfile?.avatar_url;
  return `
    <section class="profile-photo-card" aria-labelledby="profilePhotoTitle">
      <div>
        <h4 id="profilePhotoTitle">${t('profilePhotoTitle')}${photoRequired ? ' *' : ''}</h4>
        <p>${t('profilePhotoGuidance')}</p>
        <form id="profilePhotoForm">
          <label class="form-label" for="profilePhotoInput">${t('profilePhotoChoose')}
            <input id="profilePhotoInput" type="file" accept="image/jpeg,image/png,image/webp"${photoRequired ? ' required' : ''}>
          </label>
          <button class="btn btn-outline" type="submit">${photoRequired ? t('profilePhotoSave') : t('profilePhotoReplace')}</button>
        </form>
      </div>
      <img id="profilePhotoPreview" src="${safeText(accountProfilePhotoUrl)}" alt="${t('profilePhotoTitle')}"${accountProfilePhotoUrl ? '' : ' hidden'}>
    </section>`;
}

function openWalletPage() {
  if (!currentUser) {
    openAccountDialog('signin');
    toast(t('signInDemo'));
    return;
  }
  const walletUrl = new URL(location.href);
  walletUrl.searchParams.set('page', 'wallet');
  walletUrl.searchParams.delete('wallet_view');
  location.assign(walletUrl);
}

function walletLoadErrorMessage(error) {
  if (['PGRST202', '42883', '42P01', '42703'].includes(error?.code)) {
    return t('walletSetupRequired');
  }
  return error?.message || t('walletSetupRequired');
}

function requireProfilePhoto() {
  if (!profilePhotoColumnAvailable) {
    toast(t('profilePhotoSetupRequired'));
    return false;
  }
  if (accountProfile?.avatar_url) return true;
  toast(t('profilePhotoRequired'));
  const profileUrl = new URL(location.href);
  profileUrl.searchParams.set('page', 'profile');
  history.replaceState(null, '', profileUrl);
  document.body.dataset.page = 'profile';
  document.querySelectorAll('[data-workspace-page]').forEach(link => {
    if (link.dataset.workspacePage === 'profile') link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('accountPanel')?.scrollIntoView({ behavior:'smooth', block:'start' });
  return false;
}

async function uploadProfilePhotoBlob(user, imageBlob) {
  const oldPath = accountProfile?.avatar_url || '';
  const objectPath = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabaseClient.storage
    .from('profile-photos')
    .upload(objectPath, imageBlob, { upsert:false, contentType:'image/jpeg', cacheControl:'86400' });
  if (uploadError) throw uploadError;

  let signedUrl;
  try {
    const { data: signedPhoto, error: signedPhotoError } = await supabaseClient.storage
      .from('profile-photos').createSignedUrl(objectPath, 86400);
    if (signedPhotoError) throw signedPhotoError;
    signedUrl = signedPhoto.signedUrl;
  } catch (error) {
    const { error: cleanupError } = await supabaseClient.storage.from('profile-photos').remove([objectPath]);
    if (cleanupError) console.error('Could not clean up an unreadable profile photo:', cleanupError);
    throw error;
  }

  const { error: profileError } = await supabaseClient.from('profiles')
    .update({ avatar_url:objectPath })
    .eq('id', user.id);
  if (profileError) {
    const { error: cleanupError } = await supabaseClient.storage.from('profile-photos').remove([objectPath]);
    if (cleanupError) console.error('Could not clean up an unlinked profile photo:', cleanupError);
    throw profileError;
  }

  accountProfile = { ...(accountProfile || {}), avatar_url:objectPath };
  accountProfilePhotoUrl = signedUrl;

  if (oldPath && oldPath !== objectPath && !/^https:\/\//i.test(oldPath)) {
    const { error: cleanupError } = await supabaseClient.storage.from('profile-photos').remove([oldPath]);
    if (cleanupError) console.error('Could not remove the replaced profile photo:', cleanupError);
  }
}

async function uploadPendingSignupPhoto(user) {
  let photoData = '';
  let photoUserId = '';
  try {
    photoData = sessionStorage.getItem('time2income_pending_profile_photo') || '';
    photoUserId = sessionStorage.getItem('time2income_pending_profile_photo_user') || '';
  } catch (error) {
    console.warn('Could not read the pending signup photo:', error);
    return;
  }
  if (!photoData) return;
  if (!photoUserId || photoUserId !== user.id) {
    try {
      sessionStorage.removeItem('time2income_pending_profile_photo');
      sessionStorage.removeItem('time2income_pending_profile_photo_user');
    } catch (error) {
      console.error('Could not clear a signup photo that belongs to a different account:', error);
    }
    return;
  }
  const match = photoData.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error(t('profilePhotoInvalid'));
  const bytes = Uint8Array.from(atob(match[1]), character => character.charCodeAt(0));
  await uploadProfilePhotoBlob(user, new Blob([bytes], { type:'image/jpeg' }));
  try {
    sessionStorage.removeItem('time2income_pending_profile_photo');
    sessionStorage.removeItem('time2income_pending_profile_photo_user');
  } catch (error) {
    console.error('Could not clear the uploaded signup photo from this browser session:', error);
  }
}

async function submitProfilePhoto(event) {
  event.preventDefault();
  if (!currentUser) return;
  const file = $('profilePhotoInput').files?.[0];
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    toast(t('profilePhotoInvalid'));
    return;
  }
  const button = event.submitter || event.target.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const imageBlob = await prepareProfilePhoto(file);
    await uploadProfilePhotoBlob(currentUser, imageBlob);
    renderAccount();
    toast(t('profilePhotoSaved'));
    await Promise.all([loadRealWorkers(), renderActivity(), renderTaskBoard()])
      .catch(error => {
        console.error('Profile photo saved, but marketplace refresh failed:', error);
        toast(`${t('profilePhotoSaved')} ${error.message || ''}`.trim());
      });
  } catch (error) {
    console.error('Profile photo upload failed:', error);
    toast(`${t('profilePhotoError')} ${error.message || ''}`.trim());
  } finally {
    button.disabled = false;
  }
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
      reject(new Error(t('profilePhotoInvalid')));
    };
    image.src = imageUrl;
  });
}

function updateProfilePhotoPreview(input) {
  const preview = $('profilePhotoPreview');
  if (!preview) return;
  if (profilePhotoPreviewUrl) URL.revokeObjectURL(profilePhotoPreviewUrl);
  profilePhotoPreviewUrl = null;
  const file = input.files?.[0];
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    preview.src = accountProfilePhotoUrl;
    preview.hidden = !accountProfilePhotoUrl;
    return;
  }
  profilePhotoPreviewUrl = URL.createObjectURL(file);
  preview.src = profilePhotoPreviewUrl;
  preview.hidden = false;
}

function renderAdditionalSkillTags(skills) {
  const primarySkill = String(currentWorkerProfile?.headline || '').trim().toLocaleLowerCase();
  const seen = new Set([primarySkill]);
  return (Array.isArray(skills) ? skills : [])
    .map(skill => String(skill || '').trim())
    .filter(skill => {
      const key = skill.toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(skill => `
      <span class="profile-skill-chip">
        <span>${safeText(skill)}</span>
        <button type="button" data-remove-profile-skill="${safeText(skill)}" aria-label="${safeText(t('removeSkill'))} ${safeText(skill)}">×</button>
      </span>
    `).join('');
}

function addAdditionalProfileSkill() {
  const input = $('profileAdditionalSkill');
  const tags = $('profileAdditionalSkillTags');
  if (!input || !tags) return;
  const skill = input.value.trim();
  if (!skill) return;
  const existingSkills = [...tags.querySelectorAll('[data-remove-profile-skill]')]
    .map(button => button.dataset.removeProfileSkill);
  const primarySkill = String($('profileHeadline')?.value || '').trim();
  if ([primarySkill, ...existingSkills].some(value =>
    value.toLocaleLowerCase() === skill.toLocaleLowerCase()
  )) {
    input.value = '';
    return;
  }
  tags.innerHTML = renderAdditionalSkillTags([...existingSkills, skill]);
  input.value = '';
  input.setAttribute('aria-invalid', 'false');
}

function renderAccount() {
  const signedIn = Boolean(currentUser);
  $('accountState').innerHTML = signedIn
    ? `${safeText(currentUser.email)} ${renderVerifiedBadge(currentIdentityVerified)}`
    : 'Not signed in';
  $('signInBtn').textContent = signedIn ? t('signOut') : t('signIn');
  if (!signedIn) {
    currentIdentityVerified = false;
    accountPrivacyRequests = [];
    accountPrivacyRequestsAvailable = false;
    if ($('walletDialog').open) $('walletDialog').close();
    $('walletDialogContent').replaceChildren();
    $('accountSummary').innerHTML = `<div class="activity-empty">${t('joinDemo')}</div>`;
    return;
  }

  const accountRoles = Array.isArray(accountProfile?.roles)
    ? accountProfile.roles
    : ['customer', 'worker'];
  const fallbackDisplayName = currentUser.user_metadata?.full_name
    || currentUser.email?.split('@')[0]
    || t('yourName');
  const hasWorkerRole = accountRoles.includes('worker');
  const workerPublished = Boolean(currentWorkerProfile?.is_published);

  if (!hasWorkerRole) {
    $('accountSummary').innerHTML = `
      <section class="onboarding-guide">
        <p class="section-kicker">${t('onboardingProgress').replace('{step}', '2')}</p>
        <h3>${t('onboardingCustomerTitle')}</h3>
        <p>${t('onboardingCustomerBody')}</p>
        ${renderProfilePhotoSection()}
        <form id="customerProfileForm" class="customer-profile-editor">
          <div class="form-two">
            <label class="form-label">${t('displayName')}
              <input id="customerDisplayName" maxlength="80" required value="${safeText(accountProfile?.display_name || fallbackDisplayName)}">
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
        <p class="onboarding-profile-ready">${t('customerProfileReady')}: ${safeText(accountProfile?.display_name || fallbackDisplayName)}</p>
      </section>
      ${renderNearbyAlertSettings()}
      ${renderPrivacyRequestCard()}
      ${renderIdentityDocumentReview()}
      ${renderIdentityVerification()}`;
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
  const selectedSkillCategory = window.TIME2INCOME_SKILL_CATEGORIES?.[currentWorkerProfile?.headline || ''] || '';
  const workPreference = currentWorkerProfile?.work_preference || 'local';
  const published = Boolean(currentWorkerProfile?.is_published);
  const serviceLanguages = (currentWorkerProfile?.service_languages || []).join(', ');
  const additionalSkills = Array.isArray(currentWorkerProfile?.skills)
    ? currentWorkerProfile.skills
    : [];
  portfolioImagesDraft = Array.isArray(currentWorkerProfile?.portfolio_images)
    ? currentWorkerProfile.portfolio_images.slice(0, 6)
    : [];

  $('accountSummary').innerHTML = `
    <section class="onboarding-guide">
      <h3>${workerPublished ? t('onboardingWorkerLiveTitle') : t('onboardingWorkerTitle')}</h3>
      <p class="onboarding-guide-copy">${workerPublished ? t('onboardingWorkerLiveBody') : t('onboardingWorkerBody')}</p>
      ${workerPublished ? `<a class="btn btn-primary" id="onboardingBrowseTasksBtn" href="index.html?page=tasks">${t('browseOpenTasks')}</a>` : ''}
    </section>
    ${renderProfilePhotoSection()}
    <form id="workerProfileForm" class="account-card account-profile-editor">
      <span class="account-role">${published ? t('publishedProfile') : t('profileDraft')}</span>
      ${published ? `<p class="profile-live-note" id="profileLiveNote" role="note">${t('profileLiveNote')}</p>` : ''}
      <h3>${t('publicProfile')}</h3>
      <p>${t('profilePrivacy')}</p>
      <label class="form-label">${t('displayName')} <span class="required-field-mark" aria-hidden="true">*</span>
        <input id="profileDisplayName" maxlength="80" required value="${safeText(accountProfile?.display_name || fallbackDisplayName)}">
      </label>
      <div class="form-three provider-address-fields">
        <label class="form-label provider-postal-field">${t('providerPostalCode')}<sup class="provider-pin-star" aria-hidden="true">*</sup>
          <input id="profilePostalCode" name="service_postal_code" type="text" maxlength="32" autocomplete="postal-code" value="${safeText(currentWorkerProfile?.service_postal_code || '')}">
        </label>
        <label class="form-label">${t('country')} <span class="required-field-mark" aria-hidden="true">*</span>
          <input id="profileCountry" list="countryOptions" maxlength="80" required value="${safeText(currentWorkerProfile?.service_country || 'India')}">
        </label>
        <label class="form-label">${t('state')} <span class="required-field-mark" aria-hidden="true">*</span>
          <input id="profileState" maxlength="80" required value="${safeText(currentWorkerProfile?.service_state || '')}">
        </label>
        <label class="form-label">${t('city')} <span class="required-field-mark" aria-hidden="true">*</span>
          <input id="profileCity" maxlength="80" required value="${safeText(currentWorkerProfile?.service_city || '')}">
        </label>
      </div>
      <div class="provider-location-settings">
        <p class="form-hint">${t('providerServiceAreaHint')}</p>
        <p class="form-hint">${t('profileLocationHint')}</p>
        <input id="profileServiceLatitude" type="hidden" value="${safeText(currentWorkerProfile?.service_latitude ?? '')}">
        <input id="profileServiceLongitude" type="hidden" value="${safeText(currentWorkerProfile?.service_longitude ?? '')}">
        <button class="btn btn-outline" id="setProfileLocationBtn" type="button">${currentWorkerProfile?.service_latitude != null ? t('updateProviderLocation') : t('setProviderLocation')}</button>
        <button class="text-link" id="clearProfileLocationBtn" type="button"${currentWorkerProfile?.service_latitude == null ? ' hidden' : ''}>${t('clearProviderLocation')}</button>
        <p class="location-status" id="profileLocationStatus" role="status" aria-live="polite"></p>
      </div>
      <div class="worker-fields">
        <div class="provider-primary-fields">
          <label class="form-label">${t('taskCategoryLabel')} <span class="required-field-mark" aria-hidden="true">*</span>
            <select id="profileCategory" required>${categoryOptions}</select>
          </label>
          <label class="form-label">${t('primarySkill')} <span class="required-field-mark" aria-hidden="true">*</span>
            <input id="profileHeadline" list="profileHeadlineSkillOptions" maxlength="100" required value="${safeText(currentWorkerProfile?.headline || '')}" placeholder="e.g. Electrician">
          </label>
          <label class="form-label">${t('skillCategoryFilter')}
            <select id="profileSkillCategory"></select>
          </label>
          <datalist id="profileHeadlineSkillOptions"></datalist>
        </div>
        <small class="form-hint provider-skill-category-hint">${t('profileSkillCategoryHint')}</small>
        <div class="profile-additional-skills">
          <label class="form-label" for="profileAdditionalSkill">${t('additionalSkills')} <span class="required-field-mark" aria-hidden="true">*</span>
            <input id="profileAdditionalSkill" list="skillSuggestionOptions" maxlength="100" autocomplete="off" placeholder="e.g. Web development">
          </label>
          <button class="btn btn-outline" id="addProfileSkillBtn" type="button">${t('addSkill')}</button>
          <div class="profile-additional-skill-list" id="profileAdditionalSkillTags" aria-live="polite">${renderAdditionalSkillTags(additionalSkills)}</div>
        </div>
        <div class="form-two provider-currency-languages">
          <label class="form-label">${t('preferredCurrency')} <span class="required-field-mark" aria-hidden="true">*</span>
            <input id="profileCurrency" list="currencyOptions" required value="${safeText(currentWorkerProfile?.currency_code || preferredCurrency)}">
          </label>
          <label class="form-label">${t('languages')} <span class="required-field-mark" aria-hidden="true">*</span>
            <input id="profileLanguages" maxlength="200" required value="${safeText(serviceLanguages)}" placeholder="${t('languagesPlaceholder')}">
          </label>
          <label class="form-label">${t('hourlyRate')} <span class="required-field-mark" aria-hidden="true">*</span>
            <input id="profileRate" type="number" min="1" max="1000000" required value="${safeText(currentWorkerProfile?.hourly_rate || '')}" placeholder="e.g. 400">
          </label>
        </div>
        <label class="form-label">${t('aboutService')} <span class="required-field-mark" aria-hidden="true">*</span>
          <textarea id="profileBio" rows="3" maxlength="600" required placeholder="Describe your experience and services">${safeText(currentWorkerProfile?.bio || '')}</textarea>
        </label>
        <div class="portfolio-editor">
          <label class="form-label" for="profilePortfolioInput">${t('portfolioImages')} <span class="required-field-mark" aria-hidden="true">*</span></label>
          <input id="profilePortfolioInput" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-required="true">
          <p class="form-hint">${t('portfolioImageGuidance')}</p>
          <div id="profilePortfolioPreview" class="portfolio-editor-grid">${renderPortfolioPreview(portfolioImagesDraft)}</div>
        </div>
        <label class="form-label">${t('workPreference')} <span class="required-field-mark" aria-hidden="true">*</span>
          <select id="profileWorkPreference" required>
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
    </form>
    ${renderNearbyAlertSettings()}
    ${renderPrivacyRequestCard()}
    ${renderIdentityDocumentReview()}
    ${renderIdentityVerification()}`;
  const skillCategorySelect = $('profileSkillCategory');
  const headlineSkillOptions = $('profileHeadlineSkillOptions');
  const headlineInput = $('profileHeadline');
  populateSkillCategorySelect(skillCategorySelect, selectedSkillCategory);
  populateCategorySkillOptions(headlineSkillOptions, skillCategorySelect.value);
  skillCategorySelect.addEventListener('change', () => {
    populateCategorySkillOptions(headlineSkillOptions, skillCategorySelect.value, headlineInput.value);
  });
  headlineInput.addEventListener('input', () => {
    populateCategorySkillOptions(headlineSkillOptions, skillCategorySelect.value, headlineInput.value);
  });
}

function renderWalletSection() {
  return `
    <section class="wallet-card" id="walletCard" aria-labelledby="walletSectionTitle">
      <div class="wallet-heading">
        <h3 id="walletSectionTitle">${t('walletBalance')}</h3>
        <button class="btn btn-outline" id="refreshWalletBtn" type="button">${t('walletRefresh')}</button>
      </div>
      <div class="wallet-token-balance">
        <span class="wallet-credit-icon" aria-hidden="true">T2I</span>
        <div class="wallet-token-details">
          <strong class="wallet-token-label">${t('walletTokenLabel')}</strong>
          <strong class="wallet-token-amount">0 ${t('walletTokenUnit')}</strong>
          <p>${t('walletTokenNote')}</p>
        </div>
      </div>
      <div class="wallet-credit-explainer">
        <span class="wallet-credit-icon" aria-hidden="true">T2I</span>
        <p>${t('walletCreditExplainer')}</p>
      </div>
      <p class="wallet-sandbox-note">${t('walletSandboxNote')}</p>
      <p class="wallet-policy-note">${t('walletPolicyNote')}</p>
      <p class="wallet-status" id="walletStatus" role="status" aria-live="polite"></p>
      <h4>${t('walletByCurrency')}</h4>
      <div class="wallet-balances" id="walletBalances"></div>
      <h4>${t('walletHistory')}</h4>
      <ol class="wallet-history" id="walletHistory"></ol>
      <h4>${t('walletSupportForm')}</h4>
      <form class="wallet-request-form" id="walletCreditRequestForm">
        <label class="form-label">${t('walletIssueType')}
          <select id="walletIssueType" required>
            <option value="duplicate_payment">${t('walletDuplicate')}</option>
            <option value="failed_task_action">${t('walletFailedAction')}</option>
            <option value="technical_issue">${t('walletTechnical')}</option>
          </select>
        </label>
        <label class="form-label">${t('walletReference')}
          <input id="walletProviderReference" maxlength="160" required>
        </label>
        <div class="form-two">
          <label class="form-label">${t('walletCurrency')}
            <input id="walletRequestCurrency" list="currencyOptions" maxlength="3" required value="${safeText(preferredCurrency)}">
          </label>
          <label class="form-label">${t('walletClaimedAmount')}
            <input id="walletClaimedAmount" type="number" min="0.01" step="any" required>
          </label>
        </div>
        <label class="form-label">${t('walletDetails')}
          <textarea id="walletRequestDetails" rows="3" minlength="10" maxlength="1000" required></textarea>
        </label>
        <label class="form-label wallet-evidence-field" for="walletEvidenceFile">${t('walletEvidenceLabel')}
          <input id="walletEvidenceFile" type="file" accept="image/jpeg,image/png,image/webp">
          <span class="form-hint">${t('walletEvidenceHint')}</span>
          <span class="wallet-evidence-file-name" id="walletEvidenceFileName" aria-live="polite"></span>
        </label>
        <button class="btn btn-outline" type="submit">${t('walletSendRequest')}</button>
      </form>
      <div class="wallet-own-requests" id="walletOwnRequests"></div>
      <section class="wallet-admin-queue" id="walletAdminQueue" hidden>
        <h4>${t('walletReviewQueue')}</h4>
        <div id="walletAdminRequests"></div>
      </section>
    </section>`;
}

function renderT2iWalletPage(view = new URLSearchParams(location.search).get('wallet_view') === 'buy'
  ? 'buy'
  : 'overview') {
  const content = $('t2iWalletContent');
  if (!content) return;
  document.title = `${view === 'buy' ? t('t2iBuyHeroTitle') : t('t2iWalletTitle')} | TIME2INCOME`;
  if (view === 'buy') {
    const packages = [
      { code: 'mini', name: 'Mini', tokens: 100, price: 11 },
      { code: 'basic', name: 'Basic', tokens: 600, price: 59 },
      { code: 'popular', name: 'Popular', tokens: 1600, price: 145, popular: true },
      { code: 'pro', name: 'Pro', tokens: 3500, price: 275 }
    ];
    const pricingConfig = window.TIME2INCOME_PRICING_CONFIG;
    if (!pricingConfig) throw new Error('T2I package pricing is not configured.');
    const configuredCountries = new Map(pricingConfig.countries.map(country => [country.code, country]));
    const purchaseCountries = window.TIME2INCOME_COUNTRIES.map(profileCountry => {
      const configured = configuredCountries.get(profileCountry.code);
      const currency = profileCountry.code === 'BG' ? 'EUR' : profileCountry.currencyCode;
      return configured
        ? { ...configured, currency }
        : {
            code: profileCountry.code,
            country: profileCountry.name,
            currency,
            checkoutEstimateUnavailable: true
          };
    });
    const findPurchaseCountry = name => {
      const configured = pricingConfig.findCountryByName(name || '');
      if (configured) return configured;
      const normalized = String(name || '').trim().toLocaleLowerCase();
      return purchaseCountries.find(country =>
        country.code.toLocaleLowerCase() === normalized ||
        country.country.toLocaleLowerCase() === normalized) || null;
    };
    const formatLocalMoney = (amount, currency) =>
      window.TIME2INCOME_CURRENCY.formatOriginal(amount, currency, getFormatLocale());
    const formatRate = (amount, currency) => new Intl.NumberFormat(getFormatLocale(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    const initialCountry = findPurchaseCountry(accountProfile?.country) ||
      findPurchaseCountry(currentUser?.user_metadata?.country) ||
      purchaseCountries.find(country => country.currency === preferredCurrency) ||
      pricingConfig.findCountry('IN');
    let activeCountry = initialCountry;
    let selectedPackageIndex = packages.findIndex(item => item.popular);
    let quotes = [];
    content.innerHTML = `
      <section class="t2i-wallet-card t2i-buy-page" aria-labelledby="t2iWalletPageTitle">
        <a class="t2i-back-link" href="index.html?page=wallet">${t('t2iBackWallet')}</a>
        <header class="t2i-buy-hero">
          <span class="t2i-coin t2i-buy-coin" aria-hidden="true">T2I</span>
          <h1 id="t2iWalletPageTitle">${t('t2iBuyHeroTitle')}</h1>
          <p>${t('t2iBuyHeroBody')}</p>
          <div class="t2i-buy-benefits">
            <span>∞ ${t('t2iNoExpiryLabel')}</span>
            <span>◷ ${t('t2iComingSoon')}</span>
          </div>
        </header>
        <section class="t2i-wallet-section" aria-labelledby="t2iPackageHeading">
          <h2 id="t2iPackageHeading">${t('t2iSelectPackage')}</h2>
          <label class="t2i-purchase-country-label" for="t2iPurchaseCountry">${t('checkoutCountry')}
            <select id="t2iPurchaseCountry" required>
              ${purchaseCountries.map(country =>
                `<option value="${safeText(country.code)}">${safeText(country.country)} (${safeText(country.currency)})${country.checkoutEstimateUnavailable ? ` — ${safeText(t('t2iEstimateUnavailable'))}` : ''}</option>`
              ).join('')}
            </select>
          </label>
          <p class="t2i-country-support-note" id="t2iCountryEstimateStatus" role="status" hidden></p>
          <label class="t2i-purchase-country-label" id="t2iPurchaseRegionField" for="t2iPurchaseRegion" hidden>${t('checkoutRegion')}
            <select id="t2iPurchaseRegion" hidden></select>
          </label>
          <label class="t2i-purchase-country-label" id="t2iPurchaseCategoryField" for="t2iPurchaseCategory" hidden>${t('checkoutCategory')}
            <select id="t2iPurchaseCategory" hidden></select>
          </label>
          <div class="t2i-package-grid t2i-package-options" id="t2iPackageOptions"></div>
          <p class="t2i-package-receive">${t('t2iPackageIndiaNote')}</p>
        </section>
        <section class="t2i-price-card" aria-labelledby="t2iPriceBreakdownTitle">
          <h2 id="t2iPriceBreakdownTitle">${t('t2iPriceBreakdown')}</h2>
          <div class="t2i-price-row"><span>${t('t2iPackageBaseLabel')}</span><strong id="t2iPackageBasePrice"></strong></div>
          <div class="t2i-price-row"><span>${t('checkoutServiceFee')}</span><strong id="t2iPackageServiceFee"></strong></div>
          <div class="t2i-price-row"><span>${t('t2iPlatformFeeLine')}</span><strong id="t2iPackagePlatformFee"></strong></div>
          <div class="t2i-price-row"><span id="t2iPackageTaxLabel">${t('t2iPackageTaxEstimate')}</span><strong id="t2iPackageTax"></strong></div>
          <div class="t2i-price-row"><span>${t('t2iGatewayLine')}</span><strong id="t2iPackageGatewayFee"></strong></div>
          <div class="t2i-price-total" aria-live="polite"><span id="t2iPackageTotalLabel">${t('t2iPackageEstimatedTotal')}</span><strong id="t2iPackageTotal"></strong></div>
          <p class="t2i-purchase-note">${t('t2iPackageProvisionalNote')}</p>
        </section>
        <section class="t2i-token-disclaimer" aria-labelledby="t2iTokenDisclaimerTitle">
          <h2 id="t2iTokenDisclaimerTitle">${t('t2iTokenDisclaimerTitle')}</h2>
          <p id="t2iTokenDisclaimerBody">${t('t2iTokenDisclaimerBody')}</p>
        </section>
        <label class="t2i-token-consent" for="t2iTokenDisclaimerAgreement">
          <input id="t2iTokenDisclaimerAgreement" type="checkbox" required aria-required="true">
          <span>${t('t2iTokenDisclaimerAgreement')}</span>
        </label>
        <button class="btn btn-primary t2i-proceed-button" type="button" disabled aria-disabled="true" aria-describedby="t2iTokenDisclaimerBody t2iTokenDisclaimerAgreement">
          ${t('t2iProceedPay')}
        </button>
        <p class="t2i-wallet-status" id="t2iPurchaseStatus" role="status" aria-live="polite"></p>
      </section>`;
    const tokenAgreement = $('t2iTokenDisclaimerAgreement');
    const proceedButton = content.querySelector('.t2i-proceed-button');
    const purchaseStatus = $('t2iPurchaseStatus');
    let approvedPackages = new Map();
    let packageRequestId = 0;
    let purchaseInProgress = false;
    const updateProceedButton = () => {
      const selectedPackage = packages[selectedPackageIndex];
      const disabled = purchaseInProgress || !tokenAgreement.checked ||
        !approvedPackages.has(selectedPackage.code);
      proceedButton.disabled = disabled;
      proceedButton.setAttribute('aria-disabled', String(disabled));
    };
    tokenAgreement.addEventListener('change', updateProceedButton);
    updateProceedButton();
    const countrySelect = $('t2iPurchaseCountry');
    const regionSelect = $('t2iPurchaseRegion');
    const categorySelect = $('t2iPurchaseCategory');
    const fillJurisdictions = (select, items, placeholder) => {
      select.replaceChildren(new Option(placeholder, ''));
      for (const item of items || []) select.add(new Option(item.name, item.code));
    };
    const minorDigitsForCurrency = currency =>
      pricingConfig.fractionDigits[currency] ??
        new Intl.NumberFormat('en', {
          style: 'currency',
          currency
        }).resolvedOptions().maximumFractionDigits;
    const formatMinorAmount = (amountMinor, currency) =>
      formatLocalMoney(amountMinor / (10 ** minorDigitsForCurrency(currency)), currency);
    const loadApprovedPackages = async country => {
      const requestId = ++packageRequestId;
      approvedPackages = new Map();
      purchaseStatus.textContent = t('t2iPurchaseNotEnabled');
      renderPackages();
      if (!currentUser) return;
      try {
        const { data, error } = await supabaseClient.rpc(
          't2i_get_available_purchase_packages',
          { p_country_code: country.code }
        );
        if (error) throw error;
        if (requestId !== packageRequestId) return;
        if (!Array.isArray(data)) {
          throw new Error('The approved T2I package list is invalid.');
        }
        data.forEach(item => {
          if (!item || typeof item !== 'object' ||
              typeof item.package_code !== 'string' ||
              !packages.some(packageItem => packageItem.code === item.package_code) ||
              item.country_code !== country.code ||
              item.currency !== country.currency ||
              !Number.isSafeInteger(item.token_amount) || item.token_amount <= 0 ||
              !Number.isSafeInteger(item.amount_minor) || item.amount_minor <= 0) {
            throw new Error('An approved T2I package has invalid pricing data.');
          }
          approvedPackages.set(item.package_code, {
            token_amount: item.token_amount,
            amount_minor: item.amount_minor,
            currency: item.currency
          });
        });
        purchaseStatus.textContent = approvedPackages.size
          ? ''
          : t('t2iPurchaseNotEnabled');
        renderPackages();
      } catch (error) {
        if (requestId !== packageRequestId) return;
        console.error('Approved T2I package prices could not be loaded:', error);
        approvedPackages = new Map();
        purchaseStatus.textContent = t('t2iPurchasePackagesError');
        renderPackages();
      }
    };
    const renderPackages = () => {
      const taxRate = pricingConfig.getTaxRate(
        activeCountry,
        regionSelect.value,
        categorySelect.value
      );
      quotes = packages.map(item => taxRate === null
        ? null
        : pricingConfig.quote(activeCountry, taxRate, item.price));
      const localPrice = amount => formatLocalMoney(amount, activeCountry.currency);
      $('t2iPackageOptions').innerHTML = packages.map((item, index) => {
        const quote = quotes[index];
        const approvedPackage = approvedPackages.get(item.code);
        const selected = index === selectedPackageIndex;
        const displayTotal = approvedPackage
          ? `${t('t2iPackageCheckoutTotal')}: ${formatMinorAmount(approvedPackage.amount_minor, approvedPackage.currency)}`
          : quote
          ? `${t('t2iPackageEstimatedTotal')}: ${localPrice(quote.total)}`
          : activeCountry.checkoutEstimateUnavailable
            ? t('t2iEstimateUnavailable')
          : activeCountry.regions
            ? t('checkoutSelectRegion')
            : t('checkoutSelectCategory');
        return `
          <button class="t2i-package-option${item.popular ? ' is-popular' : ''}${selected ? ' is-selected' : ''}" type="button" data-t2i-package="${index}" aria-pressed="${selected}">
            ${item.popular ? `<span class="t2i-package-popular">${t('t2iMostPopular')}</span>` : ''}
            <span class="t2i-package-name">${item.name}</span>
            <strong class="t2i-package-tokens">${new Intl.NumberFormat(getFormatLocale()).format(approvedPackage?.token_amount || item.tokens)} <small>T2I</small></strong>
            <span class="t2i-package-price">${localPrice(item.price)}</span>
            <span class="t2i-package-rate">${formatRate((approvedPackage ? approvedPackage.amount_minor / (10 ** minorDigitsForCurrency(activeCountry.currency)) : item.price) / (approvedPackage?.token_amount || item.tokens) * 100, activeCountry.currency)} ${t('t2iTokensPerHundred')}</span>
            <span class="t2i-package-total">${displayTotal}</span>
          </button>`;
      }).join('');
      $('t2iPackageOptions').querySelectorAll('[data-t2i-package]').forEach(button => {
        button.addEventListener('click', () => {
          selectedPackageIndex = Number(button.dataset.t2iPackage);
          renderBreakdown();
          renderPackages();
        });
      });
      renderBreakdown();
      updateProceedButton();
    };
    const renderBreakdown = () => {
      const item = packages[selectedPackageIndex];
      const quote = quotes[selectedPackageIndex];
      const approvedPackage = approvedPackages.get(item.code);
      $('t2iPriceBreakdownTitle').textContent =
        `${t('t2iPriceBreakdown')} · ${item.name} (${formatLocalMoney(item.price, activeCountry.currency)})`;
      $('t2iPackageBasePrice').textContent = formatLocalMoney(item.price, activeCountry.currency);
      $('t2iPackageTaxLabel').textContent = quote
        ? `${t('t2iPackageTaxEstimate')} (${quote.taxRate}%)`
        : t('t2iPackageTaxEstimate');
      $('t2iPackageServiceFee').textContent = activeCountry.checkoutEstimateUnavailable
        ? t('t2iEstimateUnavailable')
        : formatLocalMoney(item.price * pricingConfig.serviceFeeRate, activeCountry.currency);
      $('t2iPackagePlatformFee').textContent = activeCountry.checkoutEstimateUnavailable
        ? t('t2iEstimateUnavailable')
        : formatLocalMoney(item.price * pricingConfig.platformFeeRate, activeCountry.currency);
      $('t2iPackageTax').textContent = quote
        ? formatLocalMoney(quote.tax, activeCountry.currency)
        : activeCountry.checkoutEstimateUnavailable
          ? t('t2iEstimateUnavailable')
        : activeCountry.regions
          ? t('checkoutSelectRegion')
          : activeCountry.categories ? t('checkoutSelectCategory') : '—';
      $('t2iPackageGatewayFee').textContent = quote
        ? formatLocalMoney(quote.gatewayRecovery, activeCountry.currency)
        : activeCountry.checkoutEstimateUnavailable ? t('t2iEstimateUnavailable') : '—';
      $('t2iPackageTotal').textContent = quote
        ? formatLocalMoney(quote.total, activeCountry.currency)
        : activeCountry.checkoutEstimateUnavailable ? t('t2iEstimateUnavailable') : '—';
      $('t2iPackageTotalLabel').textContent = approvedPackage
        ? t('t2iPackageCheckoutTotal')
        : t('t2iPackageEstimatedTotal');
      if (approvedPackage) {
        $('t2iPackageTotal').textContent =
          formatMinorAmount(approvedPackage.amount_minor, approvedPackage.currency);
      }
      $('t2iPriceBreakdownTitle').textContent =
        `${t('t2iPriceBreakdown')} · ${item.name} (${formatLocalMoney(item.price, activeCountry.currency)})`;
    };
    const configureCountry = country => {
      if (!country) return;
      activeCountry = country;
      const supportNote = $('t2iCountryEstimateStatus');
      supportNote.hidden = !country.checkoutEstimateUnavailable;
      supportNote.textContent = country.checkoutEstimateUnavailable
        ? t('t2iCountryEstimateUnavailable')
        : '';
      const needsRegion = Boolean(country.regions);
      $('t2iPurchaseRegionField').hidden = !needsRegion;
      regionSelect.hidden = !needsRegion;
      regionSelect.required = needsRegion;
      fillJurisdictions(regionSelect, country.regions, t('checkoutSelectRegionPlaceholder'));
      const needsCategory = Boolean(country.categories);
      $('t2iPurchaseCategoryField').hidden = !needsCategory;
      categorySelect.hidden = !needsCategory;
      categorySelect.required = needsCategory;
      fillJurisdictions(categorySelect, country.categories, t('checkoutSelectCategoryPlaceholder'));
      renderPackages();
      loadApprovedPackages(country);
    };
    countrySelect.value = activeCountry?.code || 'IN';
    countrySelect.addEventListener('change', () => {
      configureCountry(purchaseCountries.find(country => country.code === countrySelect.value));
    });
    proceedButton.addEventListener('click', async () => {
      const item = packages[selectedPackageIndex];
      const approvedPackage = approvedPackages.get(item.code);
      if (!tokenAgreement.checked || !approvedPackage || purchaseInProgress) return;
      purchaseInProgress = true;
      purchaseStatus.textContent = t('t2iPurchaseStarting');
      updateProceedButton();
      try {
        const { data: order, error } = await supabaseClient.functions.invoke(
          'create-t2i-purchase-order',
          {
            body: {
              country_code: activeCountry.code,
              package_code: item.code,
              disclaimer_accepted: true,
              disclaimer_version: '2026-11-06-v1'
            }
          }
        );
        if (error) throw await taskPaymentError(error);
        if (!Number.isSafeInteger(order?.amount) ||
            order.amount !== approvedPackage.amount_minor ||
            order.currency !== approvedPackage.currency ||
            order.token_amount !== approvedPackage.token_amount ||
            order.package_code !== item.code ||
            order.purpose !== 't2i_purchase' ||
            !order.order_id || !order.key_id) {
          throw new Error(t('t2iPurchaseCheckoutError'));
        }
        if (!window.Razorpay) {
          throw new Error(t('t2iPurchaseCheckoutError'));
        }
        let paymentHandled = false;
        const checkout = new Razorpay({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'TIME2INCOME',
          description: `${item.name} · ${new Intl.NumberFormat(getFormatLocale()).format(order.token_amount)} T2I`,
          order_id: order.order_id,
          prefill: { email: order.user_email || currentUser?.email || '' },
          theme: { color: '#173969' },
          handler: async response => {
            paymentHandled = true;
            try {
              const { data, error: verifyError } = await supabaseClient.functions.invoke(
                'verify-t2i-purchase',
                {
                  body: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  }
                }
              );
              if (verifyError) throw await taskPaymentError(verifyError);
              if (data?.verified !== true ||
                  data.purpose !== 't2i_purchase' ||
                  data.token_amount !== approvedPackage.token_amount) {
                throw new Error(t('t2iPurchaseVerifyError'));
              }
              purchaseStatus.textContent = t('t2iPurchaseSuccess');
              purchaseInProgress = false;
              setT2iWalletView('overview');
              await loadT2iWalletPage();
            } catch (error) {
              console.error('T2I purchase verification did not complete:', error);
              purchaseStatus.textContent =
                `${t('t2iPurchaseVerifyError')} ${error.message || ''}`.trim();
              purchaseInProgress = false;
              updateProceedButton();
            }
          },
          modal: {
            ondismiss: () => {
              if (paymentHandled) return;
              purchaseInProgress = false;
              purchaseStatus.textContent = t('t2iPurchaseCancelled');
              updateProceedButton();
            }
          }
        });
        checkout.on('payment.failed', event => {
          paymentHandled = true;
          purchaseInProgress = false;
          purchaseStatus.textContent =
            event.error?.description || t('t2iPurchaseCheckoutError');
          updateProceedButton();
        });
        checkout.open();
      } catch (error) {
        console.error('T2I secure checkout could not be started:', error);
        purchaseStatus.textContent =
          `${t('t2iPurchaseCheckoutError')} ${error.message || ''}`.trim();
        purchaseInProgress = false;
        updateProceedButton();
      }
    });
    regionSelect.addEventListener('change', renderPackages);
    categorySelect.addEventListener('change', renderPackages);
    configureCountry(purchaseCountries.find(country => country.code === countrySelect.value));
    return;
  }
  const metadata = currentUser?.user_metadata || {};
  const displayName = accountProfile?.display_name || metadata.full_name || metadata.name ||
    currentUser?.email?.split('@')[0] || '';
  const initials = displayName.trim().split(/\s+/).slice(0, 2)
    .map(part => Array.from(part)[0] || '').join('').toLocaleUpperCase(locale);
  content.innerHTML = `
    <section class="t2i-wallet-card" aria-labelledby="t2iWalletPageTitle">
      <header class="t2i-wallet-heading">
        <div class="t2i-wallet-identity">
          <span class="t2i-wallet-avatar" id="t2iWalletAvatar" aria-hidden="true">${safeText(initials || 'T')}</span>
          <div class="t2i-wallet-title-copy">
          <p class="t2i-wallet-kicker">◉ &nbsp; TIME2INCOME · T2I</p>
          <h1 id="t2iWalletPageTitle">${t('t2iWalletTitle')}</h1>
          <p>${t('t2iWalletIntro')}</p>
          </div>
        </div>
        <button class="btn btn-outline" id="refreshT2iWalletBtn" type="button">${t('walletRefresh')}</button>
      </header>
      <div class="t2i-wallet-total">
        <span class="t2i-coin" aria-hidden="true">T2I</span>
        <div class="t2i-wallet-total-copy">
          <span>${t('t2iWalletTotal')} ⓘ</span>
          <strong id="t2iAvailableTotal">— T2I</strong>
          <small class="t2i-welcome-pill">🎁 ${t('t2iWelcomeReward')}</small>
        </div>
      </div>
      <div class="t2i-wallet-overview">
        <article class="t2i-wallet-balance">
          <span class="t2i-balance-icon is-promo" aria-hidden="true">🎁</span>
          <div><span class="t2i-wallet-balance-label">${t('t2iPromotionalBalance')}</span>
            <strong class="t2i-wallet-balance-value" id="t2iPromotionalBalance">—</strong>
            <small class="t2i-balance-note">${t('t2iWelcomeRewardNote')}</small></div>
        </article>
        <article class="t2i-wallet-balance">
          <span class="t2i-balance-icon is-purchased" aria-hidden="true">◉</span>
          <div><span class="t2i-wallet-balance-label">${t('t2iPurchasedBalance')}</span>
            <strong class="t2i-wallet-balance-value" id="t2iPurchasedBalance">—</strong></div>
        </article>
      </div>
      <nav class="t2i-wallet-actions" aria-label="${t('t2iWalletActions')}">
        <button class="t2i-wallet-action is-buy" type="button" data-t2i-wallet-view="buy">
          <span aria-hidden="true">🛒</span><strong>${t('t2iBuyAction')}</strong>
        </button>
        <button class="t2i-wallet-action" id="t2iSendActionButton" type="button" data-t2i-wallet-action="send" aria-controls="t2iSendPanel" aria-expanded="false" disabled aria-disabled="true" title="${t('t2iSendUnavailable')}">
          <span aria-hidden="true">➤</span><strong>${t('t2iSendAction')}</strong>
        </button>
        <button class="t2i-wallet-action" id="t2iReceiveActionButton" type="button" data-t2i-wallet-action="receive" aria-controls="t2iReceivePanel" aria-expanded="false" disabled aria-disabled="true" title="${t('t2iReceiveUnavailable')}">
          <span aria-hidden="true">⇩</span><strong>${t('t2iReceiveAction')}</strong>
        </button>
        <a class="t2i-wallet-action" href="#t2iHistoryHeading">
          <span aria-hidden="true">◷</span><strong>${t('t2iHistoryAction')}</strong>
        </a>
      </nav>
      <section class="t2i-wallet-section t2i-transfer-panel" id="t2iSendPanel" aria-labelledby="t2iTransferTitle" hidden>
        <h2 id="t2iTransferTitle">${t('t2iTransferTitle')}</h2>
        <p>${t('t2iTransferIntro')}</p>
        <form class="t2i-transfer-form" id="t2iTransferForm">
          <label>${t('t2iTransferRecipientCode')}
            <input id="t2iRecipientCode" type="text" inputmode="text" autocapitalize="characters"
              maxlength="20" pattern="T2I-[A-Fa-f0-9]{16}" placeholder="T2I-XXXXXXXXXXXXXXXX" required>
          </label>
          <label>${t('t2iTransferAmount')}
            <input id="t2iTransferAmount" type="number" min="1" step="1" inputmode="numeric" required>
          </label>
          <p>${t('t2iTransferNote')}</p>
          <button class="btn btn-primary" type="submit">${t('t2iTransferSubmit')}</button>
        </form>
      </section>
      <section class="t2i-wallet-section t2i-transfer-panel" id="t2iReceivePanel" aria-labelledby="t2iTransferCodeTitle" hidden>
        <h2 id="t2iTransferCodeTitle">${t('t2iTransferCodeTitle')}</h2>
        <p>${t('t2iTransferCodeHelp')}</p>
        <div class="t2i-transfer-code-row">
          <code id="t2iTransferCode">—</code>
          <button class="btn btn-outline" id="t2iCopyCodeBtn" type="button">${t('t2iTransferCopy')}</button>
        </div>
      </section>
      <section class="t2i-wallet-section t2i-use-section" aria-labelledby="t2iHowToUseTitle">
        <h2 id="t2iHowToUseTitle">${t('t2iHowToUse')}</h2>
        <div class="t2i-use-grid">
          <article><span aria-hidden="true">▤</span><strong>${t('t2iHistoryTaskPost')}</strong><small>1 T2I</small></article>
          <article><span aria-hidden="true">◇</span><strong>${t('t2iHistoryTaskOpen')}</strong><small>1 T2I</small></article>
          <article><span aria-hidden="true">♙</span><strong>${t('t2iHistoryProfilePublish')}</strong><small>1 T2I</small></article>
          <article><span aria-hidden="true">◎</span><strong>${t('t2iHistoryPremiumProfile')}</strong><small>${t('t2iComingSoon')}</small></article>
        </div>
      </section>
      <aside class="t2i-reward-banner">
        <span aria-hidden="true">🎁</span>
        <div><strong>${t('t2iRewardBannerTitle')}</strong><p>${t('t2iRewardBannerBody')}</p></div>
        <span class="t2i-reward-spark" aria-hidden="true">✦</span>
      </aside>
      <p class="t2i-wallet-policy">${t('t2iTokenPolicy')}</p>
      <section class="t2i-wallet-section" aria-labelledby="t2iPurchaseHeading">
        <h2 id="t2iPurchaseHeading">${t('t2iPurchaseTitle')}</h2>
        <div class="t2i-wallet-purchase">
          <div>
            <strong>${t('t2iPurchasePackage')}</strong>
            <p>₹11 · ${t('t2iPurchaseDisabled')}</p>
          </div>
          <button class="btn btn-primary" type="button" data-t2i-wallet-view="buy">${t('t2iBuyTokens')}</button>
        </div>
      </section>
      <section class="t2i-wallet-section" aria-labelledby="t2iHistoryHeading">
        <h2 id="t2iHistoryHeading">${t('t2iHistoryTitle')}</h2>
        <ol class="t2i-wallet-history" id="t2iWalletHistory">
          <li class="t2i-wallet-empty">${t('t2iBalanceLoading')}</li>
        </ol>
      </section>
      <article class="t2i-worker-earnings">
        <span>${t('t2iWorkerEarnings')}</span>
        <strong id="t2iWorkerEarnings">— T2I</strong>
      </article>
      <p class="t2i-wallet-status" id="t2iWalletStatus" role="status" aria-live="polite"></p>
      <div class="t2i-reward-celebration" id="t2iRewardCelebration" role="status" aria-live="polite" hidden>
        <span class="t2i-celebration-gift" aria-hidden="true">🎁</span>
        <strong id="t2iCelebrationMessage"></strong>
        <button id="t2iCelebrationClose" type="button" aria-label="${t('t2iRewardCelebrationClose')}">×</button>
      </div>
      <section class="t2i-wallet-admin" id="t2iWalletAdmin" hidden>
        <h2>${t('t2iAdminTitle')}</h2>
        <form class="t2i-wallet-admin-form" id="t2iAdminServiceForm">
          <h3 class="t2i-admin-wide">${t('t2iAdminServiceTitle')}</h3>
          <label>${t('t2iAdminService')}
            <select id="t2iAdminServiceCode" required>
              <option value="task_post">${t('t2iHistoryTaskPost')}</option>
              <option value="task_open">${t('t2iHistoryTaskOpen')}</option>
              <option value="profile_publish">${t('t2iHistoryProfilePublish')}</option>
              <option value="premium_profile_access">${t('t2iHistoryPremiumProfile')}</option>
            </select>
          </label>
          <label>${t('t2iAdminCost')}
            <input id="t2iAdminTokenCost" type="number" min="0" step="1" required value="1">
          </label>
          <label><span>${t('t2iAdminEnabled')}</span>
            <input id="t2iAdminServiceEnabled" type="checkbox" checked>
          </label>
          <button class="btn btn-primary t2i-admin-wide" type="submit">${t('t2iAdminSave')}</button>
        </form>
        <form class="t2i-wallet-admin-form" id="t2iAdminRegionalForm">
          <h3 class="t2i-admin-wide">${t('t2iAdminRegionalTitle')}</h3>
          <label>${t('t2iAdminCountry')}
            <input id="t2iAdminCountryCode" maxlength="2" pattern="[A-Za-z]{2}" required>
          </label>
          <label>${t('t2iAdminCurrency')}
            <input id="t2iAdminRegionalCurrency" maxlength="3" pattern="[A-Za-z]{3}" required>
          </label>
          <label>${t('t2iAdminPackageSize')}
            <input id="t2iAdminPackageTokens" type="number" min="1" step="1" required value="100">
          </label>
          <label>${t('t2iAdminBasePrice')}
            <input id="t2iAdminBasePrice" type="number" min="0.001" step="0.001" required value="11">
          </label>
          <label>${t('t2iAdminTaxes')}
            <textarea id="t2iAdminTaxConfig" required>{}</textarea>
          </label>
          <label>${t('t2iAdminGateway')}
            <textarea id="t2iAdminGatewayConfig" required>{}</textarea>
          </label>
          <label>${t('t2iAdminPlatformFee')}
            <textarea id="t2iAdminPlatformConfig" required>{}</textarea>
          </label>
          <label><span>${t('t2iAdminPackageAvailable')}</span>
            <input id="t2iAdminPackageAvailable" type="checkbox">
          </label>
          <button class="btn btn-primary t2i-admin-wide" type="submit">${t('t2iAdminSave')}</button>
        </form>
        <div id="t2iAdminRegionalRows"></div>
      </section>
    </section>`;
  const photoUrl = accountProfilePhotoUrl || metadata.avatar_url || metadata.picture || '';
  let validPhotoUrl = '';
  try {
    const parsedPhotoUrl = new URL(photoUrl);
    if (parsedPhotoUrl.protocol === 'https:' || parsedPhotoUrl.protocol === 'http:') {
      validPhotoUrl = parsedPhotoUrl.href;
    }
  } catch (error) {
    if (photoUrl) console.warn('T2I wallet profile photo URL is invalid:', error);
  }
  if (validPhotoUrl) {
    const avatar = $('t2iWalletAvatar');
    const image = new Image();
    image.className = 't2i-wallet-avatar-image';
    image.alt = '';
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = validPhotoUrl;
    avatar.append(image);
  }
}

function formatT2iAmount(amount) {
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value < 0) return '—';
  return value.toLocaleString(getFormatLocale());
}

function claimT2iCelebration(key) {
  if (t2iCelebrationsSeen.has(key)) return false;
  try {
    if (window.localStorage.getItem(key)) {
      t2iCelebrationsSeen.add(key);
      return false;
    }
    window.localStorage.setItem(key, 'shown');
  } catch (error) {
    console.warn('T2I celebration could not be saved in browser storage:', error);
  }
  t2iCelebrationsSeen.add(key);
  return true;
}

function showT2iCelebration(type, key) {
  if (!claimT2iCelebration(key)) return false;
  const celebration = $('t2iRewardCelebration');
  const message = $('t2iCelebrationMessage');
  if (!celebration || !message) return false;
  clearTimeout(t2iCelebrationTimer);
  celebration.classList.remove('is-visible');
  message.textContent = t(type === 'purchase' ? 't2iPurchaseCelebrate' : 't2iRewardCelebrate');
  celebration.hidden = false;
  requestAnimationFrame(() => celebration.classList.add('is-visible'));
  t2iCelebrationTimer = setTimeout(() => {
    celebration.classList.remove('is-visible');
    celebration.hidden = true;
  }, 5200);
  return true;
}

function renderT2iWalletHistory(entries) {
  const history = $('t2iWalletHistory');
  const reasonKeys = {
    welcome_reward: 't2iHistoryWelcome',
    task_post: 't2iHistoryTaskPost',
    task_open: 't2iHistoryTaskOpen',
    profile_publish: 't2iHistoryProfilePublish',
    premium_profile_access: 't2iHistoryPremiumProfile',
    token_purchase: 't2iHistoryPurchase',
    worker_earning: 't2iHistoryWorkerEarning',
    refund: 't2iHistoryRefund',
    admin_adjustment: 't2iHistoryAdminAdjustment'
  };
  const bucketLabels = {
    promotional: t('t2iPromotionalBalance'),
    purchased: t('t2iPurchasedBalance'),
    worker_earnings: t('t2iWorkerEarnings')
  };
  if (!Array.isArray(entries) || entries.length === 0) {
    history.innerHTML = `<li class="t2i-wallet-empty">${t('t2iHistoryEmpty')}</li>`;
    return;
  }
  history.innerHTML = entries.map(entry => {
    const isCredit = entry.entry_type === 'credit';
    const reason = entry.reason === 'token_transfer'
      ? (isCredit ? 't2iHistoryTransferReceived' : 't2iHistoryTransferSent')
      : reasonKeys[entry.reason];
    const amount = formatT2iAmount(entry.amount);
    const date = formatDateTime(entry.created_at);
    const counterparty = entry.counterparty_code
      ? ` · ${entry.counterparty_code}`
      : '';
    return `
      <li class="t2i-wallet-history-item">
        <span class="t2i-wallet-history-copy">
          <strong>${safeText(reason ? t(reason) : entry.reason)}</strong>
          <small>${safeText(bucketLabels[entry.bucket] || entry.bucket)}${safeText(counterparty)} · ${safeText(date)}</small>
        </span>
        <span class="t2i-wallet-history-amount${isCredit ? '' : ' is-debit'}">
          <strong>${isCredit ? '+' : '−'}${safeText(amount)} T2I</strong>
          <small>${safeText(entry.status)}</small>
        </span>
      </li>`;
  }).join('');
}

function setT2iWalletView(view) {
  const walletUrl = new URL(location.href);
  if (view === 'buy') walletUrl.searchParams.set('wallet_view', 'buy');
  else walletUrl.searchParams.delete('wallet_view');
  history.pushState(null, '', walletUrl);
  renderT2iWalletPage(view);
  $('t2iWalletPage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadT2iWalletPage() {
  const content = $('t2iWalletContent');
  if (!content || document.body.dataset.page !== 'wallet' || !currentUser) return;
  if (new URLSearchParams(location.search).get('wallet_view') === 'buy') return;
  if (!$('t2iAvailableTotal')) renderT2iWalletPage();
  const requestId = ++t2iWalletLoadRequest;
  const status = $('t2iWalletStatus');
  status.textContent = '';
  const [walletResult, historyResult] = await Promise.all([
    supabaseClient.rpc('t2i_get_my_wallet'),
    supabaseClient.rpc('t2i_get_my_history', { p_limit: 50 })
  ]);
  if (walletResult.error) throw walletResult.error;
  if (historyResult.error) throw historyResult.error;
  if (requestId !== t2iWalletLoadRequest || !content.isConnected) return;

  const wallet = walletResult.data;
  if (!wallet || typeof wallet !== 'object') {
    throw new Error(t('t2iBalanceError'));
  }
  const promotional = Number(wallet.promotional);
  const purchased = Number(wallet.purchased);
  const workerEarnings = Number(wallet.worker_earnings);
  if (![promotional, purchased, workerEarnings].every(Number.isSafeInteger) ||
      promotional < 0 || purchased < 0 || workerEarnings < 0) {
    throw new Error(t('t2iBalanceError'));
  }
  $('t2iAvailableTotal').textContent = `${formatT2iAmount(promotional + purchased)} T2I`;
  $('t2iPromotionalBalance').textContent = `${formatT2iAmount(promotional)} T2I`;
  $('t2iPurchasedBalance').textContent = `${formatT2iAmount(purchased)} T2I`;
  $('t2iWorkerEarnings').textContent = `${formatT2iAmount(workerEarnings)} T2I`;
  $('t2iTransferCode').textContent = typeof wallet.transfer_code === 'string'
    ? wallet.transfer_code
    : '—';
  const transfersEnabled = wallet.internal_transfers_enabled === true;
  for (const id of ['t2iSendActionButton', 't2iReceiveActionButton']) {
    const button = $(id);
    button.disabled = !transfersEnabled;
    button.setAttribute('aria-disabled', String(!transfersEnabled));
    button.title = transfersEnabled ? '' : t('t2iSendUnavailable');
  }
  $('t2iWalletAdmin').hidden = wallet.is_admin !== true;
  renderT2iWalletHistory(historyResult.data);
  const rewardCelebrated = wallet.welcome_reward_at &&
    showT2iCelebration('reward', `t2i-welcome-seen:${currentUser.id}`);
  const recentPurchase = historyResult.data.find(entry =>
    entry.reason === 'token_purchase' &&
    entry.entry_type === 'credit' &&
    entry.status === 'completed' &&
    Date.now() - new Date(entry.created_at).getTime() < 120000
  );
  if (!rewardCelebrated && recentPurchase) {
    showT2iCelebration('purchase', `t2i-purchase-seen:${currentUser.id}:${recentPurchase.id}`);
  }
  if (wallet.is_admin === true) await loadT2iAdminPricing();
}

async function submitT2iTransfer(event) {
  event.preventDefault();
  const form = event.target;
  const status = $('t2iWalletStatus');
  const recipientCode = $('t2iRecipientCode').value.trim().toUpperCase();
  const amount = Number($('t2iTransferAmount').value);
  if (!/^T2I-[A-F0-9]{16}$/.test(recipientCode)) {
    $('t2iRecipientCode').setCustomValidity(t('t2iTransferCodeInvalid'));
    $('t2iRecipientCode').reportValidity();
    return;
  }
  $('t2iRecipientCode').setCustomValidity('');
  if (!Number.isSafeInteger(amount) || amount < 1) {
    $('t2iTransferAmount').reportValidity();
    return;
  }
  const confirmMessage = t('t2iTransferConfirm')
    .replace('{amount}', formatT2iAmount(amount))
    .replace('{code}', recipientCode);
  if (!window.confirm(confirmMessage)) return;

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  status.textContent = t('t2iTransferPending');
  const transferStorageKey = `t2i-pending-transfer:${currentUser.id}:${recipientCode}:${amount}`;
  try {
    if (!t2iTransferAttempt ||
        t2iTransferAttempt.recipientCode !== recipientCode ||
        t2iTransferAttempt.amount !== amount) {
      let idempotencyKey = null;
      try {
        idempotencyKey = window.sessionStorage.getItem(transferStorageKey);
      } catch (storageError) {
        console.warn('Pending T2I transfer could not be read from session storage:', storageError);
      }
      t2iTransferAttempt = {
        recipientCode,
        amount,
        idempotencyKey: idempotencyKey || crypto.randomUUID()
      };
      if (!idempotencyKey) {
        try {
          window.sessionStorage.setItem(transferStorageKey, t2iTransferAttempt.idempotencyKey);
        } catch (storageError) {
          console.warn('Pending T2I transfer could not be saved in session storage:', storageError);
        }
      }
    }
    const result = await supabaseClient.rpc('t2i_transfer_tokens', {
      p_recipient_code: recipientCode,
      p_amount: amount,
      p_idempotency_key: t2iTransferAttempt.idempotencyKey
    });
    if (result.error) throw result.error;
    if (!result.data || result.data.status !== 'completed') {
      throw new Error('The transfer was not confirmed by the wallet.');
    }

    t2iTransferAttempt = null;
    try {
      window.sessionStorage.removeItem(transferStorageKey);
    } catch (storageError) {
      console.warn('Completed T2I transfer key could not be cleared from session storage:', storageError);
    }
    form.reset();
    const successMessage = t('t2iTransferSuccess').replace('{amount}', formatT2iAmount(amount));
    status.textContent = successMessage;
    try {
      await loadT2iWalletPage();
      status.textContent = successMessage;
    } catch (refreshError) {
      console.error('Wallet balances could not be refreshed after a completed T2I transfer:', refreshError);
      status.textContent = `${successMessage} ${t('t2iBalanceError')}`;
    }
  } catch (error) {
    console.error('T2I transfer could not be completed:', error);
    const message = String(error?.message || '');
    if (message.includes('T2I_INSUFFICIENT')) {
      status.textContent = t('t2iTransferInsufficient');
    } else if (error?.code === 'P0002') {
      status.textContent = t('t2iTransferRecipientUnavailable');
    } else {
      status.textContent = `${t('t2iTransferFailed')} ${message}`.trim();
    }
  } finally {
    if (submitButton.isConnected) submitButton.disabled = false;
  }
}

async function copyT2iTransferCode() {
  const code = $('t2iTransferCode')?.textContent?.trim() || '';
  const status = $('t2iWalletStatus');
  if (!/^T2I-[A-F0-9]{16}$/.test(code)) {
    status.textContent = t('t2iTransferFailed');
    return;
  }
  try {
    await navigator.clipboard.writeText(code);
    status.textContent = t('t2iTransferCopied');
  } catch (error) {
    console.error('T2I wallet code could not be copied:', error);
    status.textContent = t('t2iTransferCopyFailed');
  }
}

async function loadT2iAdminPricing() {
  const [serviceResult, regionalResult] = await Promise.all([
    supabaseClient.rpc('t2i_admin_get_service_pricing'),
    supabaseClient.rpc('t2i_admin_get_regional_pricing')
  ]);
  if (serviceResult.error) throw serviceResult.error;
  if (regionalResult.error) throw regionalResult.error;
  const services = Array.isArray(serviceResult.data) ? serviceResult.data : [];
  $('t2iAdminRegionalRows').innerHTML = `
    <h3>${t('t2iAdminRegionalRows')}</h3>
    ${Array.isArray(regionalResult.data) && regionalResult.data.length
      ? `<ul>${regionalResult.data.map(item =>
        `<li>${safeText(item.country_code)} · ${safeText(item.currency)} — ${safeText(item.package_tokens)} T2I / ${safeText(item.base_price_units)} ${safeText(item.currency)}</li>`
      ).join('')}</ul>`
      : `<p class="t2i-wallet-empty">${t('t2iAdminRegionalRows')}: —</p>`}`;
  const selector = $('t2iAdminServiceCode');
  const updateForm = () => {
    const item = services.find(service => service.service_code === selector.value);
    if (!item) return;
    $('t2iAdminTokenCost').value = String(item.token_cost);
    $('t2iAdminServiceEnabled').checked = item.enabled === true;
  };
  selector.onchange = updateForm;
  updateForm();
}

async function submitT2iAdminSettings(event) {
  event.preventDefault();
  const form = event.target;
  const status = $('t2iWalletStatus');
  try {
    let result;
    if (form.id === 't2iAdminServiceForm') {
      const tokenCost = Number($('t2iAdminTokenCost').value);
      if (!Number.isSafeInteger(tokenCost) || tokenCost < 0) {
        throw new Error(t('t2iConfirmActionError'));
      }
      result = await supabaseClient.rpc('t2i_admin_set_service_price', {
        p_service_code: $('t2iAdminServiceCode').value,
        p_token_cost: tokenCost,
        p_enabled: $('t2iAdminServiceEnabled').checked
      });
    } else if (form.id === 't2iAdminRegionalForm') {
      const packageTokens = Number($('t2iAdminPackageTokens').value);
      const basePrice = Number($('t2iAdminBasePrice').value);
      if (!Number.isSafeInteger(packageTokens) || packageTokens <= 0 ||
          !Number.isFinite(basePrice) || basePrice <= 0) {
        throw new Error(t('t2iConfirmActionError'));
      }
      const readConfig = id => {
        const value = JSON.parse($(id).value);
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          throw new Error(t('t2iConfirmActionError'));
        }
        return value;
      };
      result = await supabaseClient.rpc('t2i_admin_upsert_regional_pricing', {
        p_country_code: $('t2iAdminCountryCode').value.trim().toUpperCase(),
        p_currency: $('t2iAdminRegionalCurrency').value.trim().toUpperCase(),
        p_package_tokens: packageTokens,
        p_base_price_units: basePrice,
        p_tax_configuration: readConfig('t2iAdminTaxConfig'),
        p_gateway_fee_configuration: readConfig('t2iAdminGatewayConfig'),
        p_platform_fee_configuration: readConfig('t2iAdminPlatformConfig'),
        p_package_available: $('t2iAdminPackageAvailable').checked
      });
    } else {
      return;
    }
    if (result.error) throw result.error;
    await loadT2iWalletPage();
    status.textContent = t('t2iAdminSaved');
  } catch (error) {
    console.error('T2I wallet settings could not be saved:', error);
    status.textContent = error.message || t('t2iConfirmActionError');
    toast(status.textContent);
  }
}

async function confirmT2iAction(action, resourceId = null) {
  const { data: quote, error } = await supabaseClient.rpc('t2i_quote_action', {
    p_action: action,
    p_resource_id: resourceId
  });
  if (error) throw error;
  if (!quote || typeof quote !== 'object') throw new Error(t('t2iConfirmActionError'));
  const cost = Number(quote.cost);
  const balance = Number(quote.total_balance);
  if (!Number.isSafeInteger(cost) || !Number.isSafeInteger(balance) ||
      cost < 0 || balance < 0) {
    throw new Error(t('t2iConfirmActionError'));
  }
  if (balance < cost) {
    toast(t('t2iInsufficient').replace('{cost}', formatT2iAmount(cost))
      .replace('{balance}', formatT2iAmount(balance)));
    return false;
  }
  if (cost === 0) return true;
  return window.confirm(t('t2iConfirmSpend')
    .replace('{cost}', formatT2iAmount(cost))
    .replace('{balance}', formatT2iAmount(balance - cost)));
}

function formatWalletAmount(amountMinor, currency) {
  const code = String(currency || '').toUpperCase();
  const digits = window.TIME2INCOME_CURRENCY.decimals(code);
  return window.TIME2INCOME_CURRENCY.formatOriginal(
    Number(amountMinor) / (10 ** digits),
    code,
    getFormatLocale()
  );
}

function walletAmountToMinorUnits(amount, currency) {
  const numericAmount = Number(amount);
  const digits = window.TIME2INCOME_CURRENCY.decimals(String(currency).toUpperCase());
  const minorUnits = Math.round(numericAmount * (10 ** digits));
  if (!Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !Number.isSafeInteger(minorUnits) || minorUnits <= 0) {
    throw new Error(t('walletRequestFailed'));
  }
  return minorUnits;
}

function renderWalletBalances(balances) {
  if (!Array.isArray(balances) || balances.length === 0) {
    return `<div class="wallet-empty-state"><span aria-hidden="true">◈</span><p>${t('walletNoBalance')}</p></div>`;
  }
  return balances.map(balance => {
    const availableMinor = Number(balance.available_minor);
    const reservedMinor = Number(balance.reserved_minor);
    const totalMinor = availableMinor + reservedMinor;
    const totalLabel = Number.isSafeInteger(availableMinor) &&
      Number.isSafeInteger(reservedMinor) &&
      Number.isSafeInteger(totalMinor)
      ? formatWalletAmount(totalMinor, balance.currency)
      : '—';
    return `
      <article class="wallet-balance-row">
        <div class="wallet-balance-top">
          <strong>${safeText(balance.currency)}</strong>
          <span>${t('walletTotalCredit')}</span>
        </div>
        <strong class="wallet-total-amount">${safeText(totalLabel)}</strong>
        <div class="wallet-balance-breakdown">
          <span>${t('walletAvailable')}</span>
          <strong>${safeText(formatWalletAmount(balance.available_minor, balance.currency))}</strong>
        </div>
        <div class="wallet-balance-breakdown">
          <span>${t('walletReserved')}</span>
          <strong>${safeText(formatWalletAmount(balance.reserved_minor, balance.currency))}</strong>
        </div>
      </article>`;
  }).join('');
}

function renderWalletHistory(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return `<li class="form-hint">${t('walletNoHistory')}</li>`;
  }
  const reasonLabels = {
    duplicate_payment: t('walletDuplicate'),
    failed_task_action: t('walletFailedAction'),
    technical_issue: t('walletTechnical'),
    task_post: t('taskPostFeeNotice'),
    task_open: t('taskOpenFeeNotice')
  };
  return entries.map(entry => {
    const direction = entry.entry_type === 'credit' ? '+' : '−';
    const label = reasonLabels[entry.reason] || String(entry.reason || '').replaceAll('_', ' ');
    const expiry = entry.expires_at
      ? `<span>${t('walletExpiry')}: ${safeText(new Date(entry.expires_at).toLocaleString(getFormatLocale()))}</span>`
      : '';
    const remaining = entry.entry_type === 'credit' && entry.remaining_minor != null
      ? `<span>${t('walletAvailable')}: ${safeText(formatWalletAmount(entry.remaining_minor, entry.currency))}</span>`
      : '';
    const status = entry.status === 'expired' ? t('status_expired') : entry.status;
    return `<li class="wallet-history-item">
      <div class="wallet-history-heading">
        <strong>${safeText(label)}</strong>
        <span>${safeText(direction + formatWalletAmount(entry.amount_minor, entry.currency))}</span>
      </div>
      <div class="wallet-history-meta">
        <span>${safeText(entry.currency)} · ${safeText(status)}</span>
        <span>${t('walletReference')}: ${safeText(entry.reference)}</span>
        ${remaining}${expiry}
        <span>${safeText(new Date(entry.created_at).toLocaleString(getFormatLocale()))}</span>
      </div>
    </li>`;
  }).join('');
}

function renderWalletOwnRequests(requests) {
  if (!Array.isArray(requests) || requests.length === 0) return '';
  return `<h4>${t('walletSupportForm')}</h4><ul class="wallet-own-request-list">${requests.map(item => `
    <li>
      <strong>${safeText(item.issue_type)}</strong>
      <span>${safeText(formatWalletAmount(item.claimed_amount_minor, item.currency))} · ${safeText(t(`walletStatus${item.status[0].toUpperCase()}${item.status.slice(1)}`))}</span>
      <span>${safeText(item.provider_reference)}</span>
      <p>${safeText(item.details)}</p>
    </li>`).join('')}</ul>`;
}

function renderWalletAdminRequests(requests) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return `<p class="form-hint">${t('walletNoRequests')}</p>`;
  }
  return requests.map(item => {
    const decimals = window.TIME2INCOME_CURRENCY.decimals(item.currency);
    const amount = Number(item.claimed_amount_minor) / (10 ** decimals);
    return `<article class="wallet-review-request" data-wallet-request-id="${safeText(item.id)}" data-wallet-currency="${safeText(item.currency)}">
      <strong>${safeText(item.issue_type)} · ${safeText(item.currency)}</strong>
      <p>${safeText(item.provider_reference)} · ${safeText(item.user_id)}</p>
      <p>${safeText(item.details)}</p>
      ${item.evidence_object_path
        ? item.evidence_url
          ? `<p><a class="wallet-evidence-link" href="${safeText(item.evidence_url)}" target="_blank" rel="noopener noreferrer">${t('walletEvidenceView')}</a></p>`
          : `<p>${t('walletEvidenceUnavailable')}</p>`
        : ''}
      <label class="form-label">${t('walletApprovedAmount')}
        <input data-wallet-approved-amount type="number" min="0.01" max="${safeText(amount)}" step="any" value="${safeText(amount)}">
      </label>
      <label class="form-label">${t('walletReviewNote')}
        <textarea data-wallet-review-note minlength="10" maxlength="1000" required></textarea>
      </label>
      <div class="account-card-actions">
        <button class="btn btn-primary" type="button" data-wallet-review="approve">${t('walletApprove')}</button>
        <button class="btn btn-outline" type="button" data-wallet-review="reject">${t('walletReject')}</button>
      </div>
    </article>`;
  }).join('');
}

async function loadWalletData() {
  const card = $('walletCard');
  if (!card || !currentUser) return;
  const requestId = ++walletLoadRequest;
  const status = $('walletStatus');
  status.textContent = '';
  const [balancesResult, historyResult, adminResult] = await Promise.all([
    supabaseClient.rpc('wallet_get_my_balances'),
    supabaseClient.rpc('wallet_get_my_history'),
    supabaseClient.rpc('wallet_is_admin')
  ]);
  if (balancesResult.error) throw balancesResult.error;
  if (historyResult.error) throw historyResult.error;
  if (adminResult.error) throw adminResult.error;
  const isAdmin = adminResult.data === true;
  const [ownRequestsResult, adminRequestsResult] = await Promise.all([
    supabaseClient.from('wallet_credit_requests')
      .select('id,issue_type,provider_reference,currency,claimed_amount_minor,details,status,created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20),
    isAdmin
      ? supabaseClient.from('wallet_credit_requests')
        .select('id,user_id,issue_type,provider_reference,currency,claimed_amount_minor,details,evidence_object_path,created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(50)
      : Promise.resolve({ data: [], error: null })
  ]);
  if (ownRequestsResult.error) throw ownRequestsResult.error;
  if (adminRequestsResult.error) throw adminRequestsResult.error;
  if (requestId !== walletLoadRequest || !card.isConnected) return;

  walletIsAdmin = isAdmin;
  walletCreditRequests = Array.isArray(adminRequestsResult.data)
    ? adminRequestsResult.data
    : [];
  const evidencePaths = [...new Set(walletCreditRequests
    .map(request => request.evidence_object_path)
    .filter(Boolean))];
  if (evidencePaths.length > 0) {
    const { data: signedEvidence, error: signedEvidenceError } = await supabaseClient
      .storage.from('wallet-payment-evidence')
      .createSignedUrls(evidencePaths, 300);
    if (signedEvidenceError) throw signedEvidenceError;
    const evidenceUrls = new Map((signedEvidence || [])
      .filter(item => item.signedUrl)
      .map(item => [item.path, item.signedUrl]));
    walletCreditRequests = walletCreditRequests.map(request => ({
      ...request,
      evidence_url: evidenceUrls.get(request.evidence_object_path) || null
    }));
  }
  $('walletBalances').innerHTML = renderWalletBalances(balancesResult.data);
  $('walletHistory').innerHTML = renderWalletHistory(historyResult.data);
  $('walletOwnRequests').innerHTML = renderWalletOwnRequests(ownRequestsResult.data);
  $('walletAdminQueue').hidden = !walletIsAdmin;
  $('walletAdminRequests').innerHTML = walletIsAdmin
    ? renderWalletAdminRequests(walletCreditRequests)
    : '';
}

async function submitWalletCreditRequest(event) {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const currency = String($('walletRequestCurrency').value).trim().toUpperCase();
  const amountMinor = walletAmountToMinorUnits($('walletClaimedAmount').value, currency);
  const evidenceFile = $('walletEvidenceFile').files?.[0] || null;
  const evidenceExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  if (evidenceFile && !evidenceExtensions[evidenceFile.type]) {
    throw new Error(t('walletEvidenceInvalidType'));
  }
  if (evidenceFile && evidenceFile.size > 5 * 1024 * 1024) {
    throw new Error(t('walletEvidenceTooLarge'));
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const status = $('walletStatus');
  let uploadedEvidencePath = null;
  submitButton.disabled = true;
  try {
    if (evidenceFile) {
      status.textContent = t('walletEvidenceUploading');
      const evidencePath = `${currentUser.id}/${crypto.randomUUID()}.${evidenceExtensions[evidenceFile.type]}`;
      const { error: uploadError } = await supabaseClient
        .storage.from('wallet-payment-evidence')
        .upload(evidencePath, evidenceFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: evidenceFile.type
        });
      if (uploadError) throw uploadError;
      uploadedEvidencePath = evidencePath;
    }

    const { error } = await supabaseClient.rpc('wallet_submit_credit_request', {
      p_issue_type: $('walletIssueType').value,
      p_provider_reference: $('walletProviderReference').value.trim(),
      p_currency: currency,
      p_claimed_amount_minor: amountMinor,
      p_details: $('walletRequestDetails').value.trim(),
      p_payment_id: null,
      p_evidence_object_path: uploadedEvidencePath
    });
    if (error) throw error;
    uploadedEvidencePath = null;
    form.reset();
    $('walletRequestCurrency').value = preferredCurrency;
    $('walletEvidenceFileName').textContent = '';
    toast(t('walletRequestSent'));
    try {
      await loadWalletData();
    } catch (error) {
      console.error('Wallet request was submitted but the wallet could not be refreshed:', error);
      const message = walletLoadErrorMessage(error);
      status.textContent = message;
      toast(message);
    }
  } catch (error) {
    if (uploadedEvidencePath) {
      try {
        const { error: cleanupError } = await supabaseClient
          .storage.from('wallet-payment-evidence')
          .remove([uploadedEvidencePath]);
        if (cleanupError) console.error('Unattached wallet evidence could not be removed:', cleanupError);
      } catch (cleanupError) {
        console.error('Unattached wallet evidence could not be removed:', cleanupError);
      }
    }
    throw error;
  } finally {
    submitButton.disabled = false;
    if (status.textContent === t('walletEvidenceUploading')) status.textContent = '';
  }
}

async function reviewWalletCreditRequest(button) {
  const requestCard = button.closest('[data-wallet-request-id]');
  if (!requestCard) return;
  const decision = button.dataset.walletReview;
  const note = requestCard.querySelector('[data-wallet-review-note]').value.trim();
  if (note.length < 10) {
    requestCard.querySelector('[data-wallet-review-note]').reportValidity();
    return;
  }
  const args = {
    p_request_id: requestCard.dataset.walletRequestId,
    p_decision: decision,
    p_approved_amount_minor: decision === 'approve'
      ? walletAmountToMinorUnits(
        requestCard.querySelector('[data-wallet-approved-amount]').value,
        requestCard.dataset.walletCurrency
      )
      : null,
    p_review_note: note
  };
  const { error } = await supabaseClient.rpc('wallet_review_credit_request', args);
  if (error) throw error;
  toast(t('walletReviewSaved'));
  await loadWalletData();
}

function renderNearbyAlertSettings() {
  const preferences = nearbyAlertPreferences;
  const categories = taskCategories.map(category => {
    const checked = preferences?.category_ids?.includes(category.id);
    return `<label class="nearby-alert-category"><input type="checkbox" data-nearby-alert-category value="${safeText(category.id)}"${checked ? ' checked' : ''}><span>${safeText(category.name)}</span></label>`;
  }).join('');
  const status = nearbyAlertPreferencesError
    ? t('nearbyAlertsSetupRequired')
    : preferences?.enabled
      ? t('nearbyAlertsEnabled')
      : '';
  return `
    <section class="account-card nearby-alert-settings" aria-labelledby="nearbyAlertsTitle">
      <h3 id="nearbyAlertsTitle">${t('nearbyAlertsTitle')}</h3>
      <p>${t('nearbyAlertsIntro')}</p>
      <fieldset class="nearby-alert-categories">
        <legend>${t('nearbyAlertsCategories')}</legend>
        ${categories || `<p class="form-hint">${t('nearbyAlertsNoCategories')}</p>`}
      </fieldset>
      <p class="nearby-alert-privacy">${t('nearbyAlertsPrivacy')}</p>
      <label class="nearby-alert-consent">
        <input type="checkbox" id="nearbyAlertLocationConsent"${preferences?.enabled ? ' checked' : ''}>
        <span>${t('nearbyAlertsLocationConsent')}</span>
      </label>
      <p class="nearby-alert-status" id="nearbyAlertStatus" role="status" aria-live="polite">${safeText(status)}</p>
      <div class="account-card-actions">
        <button class="btn btn-primary" type="button" id="enableNearbyAlertsBtn"${nearbyAlertPreferencesError || !categories || !preferences?.enabled ? ' disabled' : ''}>${t('nearbyAlertsEnable')}</button>
        <button class="btn btn-outline" type="button" id="enableNearbyPushBtn"${!preferences?.enabled || nearbyPushEnabled || nearbyAlertPreferencesError ? ' disabled' : ''}>${nearbyPushEnabled ? t('nearbyAlertsPushEnabled') : t('nearbyAlertsPush')}</button>
        <button class="text-link" type="button" id="disableNearbyAlertsBtn"${!preferences?.enabled || nearbyAlertPreferencesError ? ' hidden' : ''}>${t('nearbyAlertsDisable')}</button>
      </div>
    </section>`;
}

async function loadNearbyAlertPreferences() {
  nearbyAlertPreferencesError = null;
  const [preferencesResult, pushResult] = await Promise.all([
    supabaseClient.from('nearby_alert_preferences')
      .select('enabled, category_ids')
      .eq('user_id', currentUser.id)
      .maybeSingle(),
    supabaseClient.from('nearby_push_subscriptions')
      .select('endpoint')
      .eq('user_id', currentUser.id)
  ]);
  if (preferencesResult.error || pushResult.error) {
    nearbyAlertPreferences = null;
    nearbyPushEnabled = false;
    nearbyAlertPreferencesError = preferencesResult.error || pushResult.error;
    console.error('Nearby alert preferences could not be loaded. Apply supabase/nearby-alert-notifications.sql first:', nearbyAlertPreferencesError);
    return;
  }
  nearbyAlertPreferences = preferencesResult.data || { enabled: false, category_ids: [] };
  let localEndpoint = '';
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.getRegistration();
    localEndpoint = (await registration?.pushManager?.getSubscription())?.endpoint || '';
  }
  nearbyPushEnabled = Boolean(localEndpoint && pushResult.data?.some(row => row.endpoint === localEndpoint));
}

async function enableNearbyAlerts() {
  if (!currentUser) throw new Error(t('signInDemo'));
  if (!taskCategories.length) throw new Error(t('nearbyAlertsNoCategories'));
  if (!$('nearbyAlertLocationConsent').checked) throw new Error(t('nearbyAlertsLocationConsent'));
  const status = $('nearbyAlertStatus');
  status.textContent = t('searchLocationSearching');
  const coordinates = await readApproximateLocation();
  const categoryIds = [...document.querySelectorAll('[data-nearby-alert-category]:checked')]
    .map(input => input.value);
  const { error } = await supabaseClient.rpc('save_nearby_alert_preferences', {
    p_enabled: true,
    p_latitude: Math.round(coordinates.latitude * 1000) / 1000,
    p_longitude: Math.round(coordinates.longitude * 1000) / 1000,
    p_category_ids: categoryIds
  });
  if (error) {
    status.textContent = t('nearbyAlertsLocationFailed');
    throw error;
  }
  nearbyAlertPreferences = { enabled: true, category_ids: categoryIds };
  nearbyAlertPreferencesError = null;
  renderAccount();
  const updatedStatus = $('nearbyAlertStatus');
  if (updatedStatus) updatedStatus.textContent = t('nearbyAlertsEnabled');
}

function decodePushPublicKey(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

async function enableNearbyBrowserPush() {
  if (!nearbyAlertPreferences?.enabled) throw new Error(t('nearbyAlertsOptInRequired'));
  const publicKey = window.TIME2INCOME_PUSH_PUBLIC_KEY;
  if (!publicKey) throw new Error(t('nearbyAlertsPushUnavailable'));
  if (!('serviceWorker' in navigator) || !('PushManager' in window) ||
      typeof Notification === 'undefined' || !window.isSecureContext) {
    throw new Error(t('nearbyAlertsPushUnavailable'));
  }
  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();
  if (permission !== 'granted') throw new Error(t('nearbyAlertsPushDenied'));

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodePushPublicKey(publicKey)
  });
  const keys = subscription.toJSON().keys;
  if (!keys?.p256dh || !keys.auth) {
    await subscription.unsubscribe();
    throw new Error('The browser returned an incomplete push subscription.');
  }
  const { error } = await supabaseClient.from('nearby_push_subscriptions').upsert({
    user_id: currentUser.id,
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh,
    auth_secret: keys.auth,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,endpoint' });
  if (error) throw error;
  nearbyPushEnabled = true;
  renderAccount();
  const status = $('nearbyAlertStatus');
  if (status) status.textContent = t('nearbyAlertsPushEnabled');
}

async function disableNearbyAlerts() {
  if (!currentUser) throw new Error(t('signInDemo'));
  const { error } = await supabaseClient.rpc('save_nearby_alert_preferences', {
    p_enabled: false,
    p_latitude: null,
    p_longitude: null,
    p_category_ids: [...(nearbyAlertPreferences?.category_ids || [])]
  });
  if (error) throw error;
  nearbyAlertPreferences = {
    enabled: false,
    category_ids: [...(nearbyAlertPreferences?.category_ids || [])]
  };
  nearbyPushEnabled = false;
  renderAccount();

  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  if (subscription) await subscription.unsubscribe();
  const { error: deleteError } = await supabaseClient.from('nearby_push_subscriptions')
    .delete().eq('user_id', currentUser.id);
  if (deleteError) throw deleteError;
  const status = $('nearbyAlertStatus');
  if (status) status.textContent = t('nearbyAlertsDisabled');
}

function startNearbyAlertRealtime() {
  if (nearbyAlertChannel && nearbyAlertChannelUserId === currentUser?.id) return;
  if (nearbyAlertChannel) {
    supabaseClient.removeChannel(nearbyAlertChannel);
    nearbyAlertChannel = null;
  }
  nearbyAlertChannelUserId = currentUser?.id || null;
  if (!currentUser || nearbyAlertPreferencesError) return;
  nearbyAlertChannel = supabaseClient.channel(`nearby-alert-notifications-${currentUser.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'nearby_alert_notifications',
      filter: `user_id=eq.${currentUser.id}`
    }, payload => {
      const notification = payload.new;
      if (notification?.title && notification?.body) {
        toast(`${notification.title}: ${notification.body}`);
      }
    })
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Nearby in-app notifications could not connect through Supabase Realtime:', status);
      }
    });
}

function renderPrivacyRequestCard() {
  const requestTypeKeys = {
    access:'privacyRequestAccess',
    correction:'privacyRequestCorrection',
    deletion:'privacyRequestDeletion',
    restriction:'privacyRequestRestriction',
    other:'privacyRequestOther'
  };
  const statusKeys = {
    received:'privacyRequestReceived',
    in_review:'privacyRequestInReview',
    completed:'privacyRequestCompleted'
  };
  const history = accountPrivacyRequestsAvailable
    ? accountPrivacyRequests.length
      ? accountPrivacyRequests.map(request => `
        <article class="privacy-request-item">
          <div class="privacy-request-heading">
            <strong>${t('privacyRequestTicket')} #${safeText(request.id)}</strong>
            <span class="privacy-request-status">${t(statusKeys[request.status] || 'privacyRequestReceived')}</span>
          </div>
          <p>${t(requestTypeKeys[request.request_type] || 'privacyRequestOther')}</p>
          <p>${safeText(request.message)}</p>
          ${request.response_message ? `<p><strong>${t('privacyRequestResponse')}:</strong> ${safeText(request.response_message)}</p>` : ''}
          <time datetime="${safeText(request.created_at)}">${safeText(new Date(request.created_at).toLocaleString(getFormatLocale()))}</time>
        </article>
      `).join('')
      : `<p class="privacy-request-empty">${t('privacyRequestNone')}</p>`
    : `<p class="privacy-request-unavailable" role="status">${t('privacyRequestsUnavailable')}</p>`;

  return `
    <section class="account-card privacy-request-card" aria-labelledby="privacyRequestsTitle">
      <h3 id="privacyRequestsTitle">${t('privacyRequestsTitle')}</h3>
      <p>${t('privacyRequestsIntro')}</p>
      ${accountPrivacyRequestsAvailable ? `
        <form id="privacyRequestForm" class="privacy-request-form">
          <label class="form-label" for="privacyRequestType">${t('privacyRequestType')}
            <select id="privacyRequestType" name="request_type" required>
              <option value="" selected disabled>${t('privacyRequestChooseType')}</option>
              <option value="access">${t('privacyRequestAccess')}</option>
              <option value="correction">${t('privacyRequestCorrection')}</option>
              <option value="deletion">${t('privacyRequestDeletion')}</option>
              <option value="restriction">${t('privacyRequestRestriction')}</option>
              <option value="other">${t('privacyRequestOther')}</option>
            </select>
          </label>
          <label class="form-label" for="privacyRequestMessage">${t('privacyRequestMessage')}
            <textarea id="privacyRequestMessage" name="message" minlength="5" maxlength="2000" rows="4" required placeholder="${t('privacyRequestPlaceholder')}"></textarea>
          </label>
          <button class="btn btn-outline" type="submit">${t('privacyRequestSubmit')}</button>
        </form>
      ` : ''}
      <div class="privacy-request-history" aria-labelledby="privacyRequestHistoryTitle">
        <h4 id="privacyRequestHistoryTitle">${t('privacyRequestHistory')}</h4>
        ${history}
      </div>
    </section>
  `;
}

function renderIdentityDocumentReview() {
  const required = currentUser?.user_metadata?.identity_document_required === true
    || Boolean(identityDocumentReviewRequest);
  if (!required) return '';

  const status = identityDocumentReviewAvailable
    ? identityDocumentReviewRequest?.status || 'not_submitted'
    : 'unavailable';
  const statusCopy = {
    pending:'identityDocumentPending',
    verified:'identityDocumentVerified',
    rejected:'identityDocumentRejected',
    more_information_required:'identityDocumentMoreInformationRequired',
    not_submitted:'identityDocumentNotSubmitted',
    unavailable:'identityDocumentUnavailable'
  }[status] || 'identityDocumentUnavailable';
  const canResubmit = identityDocumentReviewAvailable
    && ['not_submitted', 'rejected', 'more_information_required'].includes(status);
  const requesterMessage = String(identityDocumentReviewRequest?.requester_message || '').trim();

  return `
    <section class="account-card identity-verification-card identity-document-review-card" aria-labelledby="identityDocumentReviewTitle">
      <h3 id="identityDocumentReviewTitle">${t('identityDocumentReviewTitle')}</h3>
      <p>${t('identityDocumentReviewDescription')}</p>
      <p class="identity-verification-status" role="status">${t(statusCopy)}</p>
      ${requesterMessage ? `<p class="identity-document-review-message"><strong>${t('identityDocumentRequesterMessage')}:</strong> ${safeText(requesterMessage)}</p>` : ''}
      ${canResubmit ? `<div class="account-card-actions"><a class="btn btn-outline" href="auth.html?mode=signin&amp;idVerification=required">${t('identityDocumentResubmit')}</a></div>` : ''}
    </section>
  `;
}

function renderIdentityVerification() {
  const verified = Boolean(currentIdentityVerified);
  const status = identityVerificationRequest?.status || '';
  const statusMessage = verified
    ? t('identityVerified')
    : status === 'pending'
      ? t('identityPending')
      : status === 'rejected'
        ? t('identityRejected')
        : identityVerificationAvailable
          ? ''
          : t('identitySetupRequired');
  const formHidden = !identityVerificationAvailable || verified || status === 'pending';
  return `
    <section class="account-card identity-verification-card" aria-labelledby="identityVerificationTitle">
      <h3 id="identityVerificationTitle">${t('identityVerificationTitle')}</h3>
      <p>${t('identityVerificationIntro')}</p>
      ${statusMessage ? `<p class="identity-verification-status" role="status">${safeText(statusMessage)}</p>` : ''}
      <form id="identityVerificationForm"${formHidden ? ' hidden' : ''}>
        <div class="identity-selfie-field">
          <label class="form-label" for="identitySelfieInput"><span>${t('identitySelfieLabel')}</span>
            <input id="identitySelfieInput" type="file" accept="image/jpeg,image/png,image/webp" required>
          </label>
          <img id="identitySelfiePreview" class="identity-selfie-preview" alt="${t('identitySelfieLabel')}" hidden>
        </div>
        <label class="identity-consent">
          <input id="identitySelfieConsent" type="checkbox" required>
          <span>${t('identityConsent')}</span>
        </label>
        <button class="btn btn-outline" type="submit">${t('identitySubmit')}</button>
      </form>
    </section>`;
}

function updateIdentitySelfiePreview(input) {
  const preview = $('identitySelfiePreview');
  if (!preview) return;
  if (identitySelfiePreviewUrl) URL.revokeObjectURL(identitySelfiePreviewUrl);
  identitySelfiePreviewUrl = null;
  const file = input.files?.[0];
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    preview.removeAttribute('src');
    preview.hidden = true;
    return;
  }
  identitySelfiePreviewUrl = URL.createObjectURL(file);
  preview.src = identitySelfiePreviewUrl;
  preview.hidden = false;
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

  const onboardingUrl = new URL(location.href);
  onboardingUrl.searchParams.set('page', 'profile');
  history.replaceState(null, '', onboardingUrl);
  document.body.dataset.page = 'profile';
  document.title = 'Provider | TIME2INCOME';
  document.querySelectorAll('[data-workspace-page]').forEach(link => {
    if (link.dataset.workspacePage === 'profile') link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('accountPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('profileHeadline')?.focus({ preventScroll: true });

  await loadAccountProfile();
  const roles = Array.isArray(accountProfile?.roles) ? accountProfile.roles : ['customer'];
  if (!roles.includes('worker')) await addWorkerRoleToCurrentAccount();
}

function isMissingProfileAvatarColumn(error) {
  return error?.code === '42703' && String(error.message).includes('avatar_url');
}

async function selectProfiles(columns, applyFilters) {
  let result = await applyFilters(supabaseClient.from('profiles').select(columns));
  if (isMissingProfileAvatarColumn(result.error)) {
    if (profilePhotoColumnAvailable) {
      console.error('Profile photo support is not installed. Run supabase/profile-photos.sql in the Supabase project.');
      toast(t('profilePhotoSetupRequired'));
    }
    profilePhotoColumnAvailable = false;
    renderAccount();
    const fallbackColumns = columns.split(',').map(column => column.trim()).filter(column => column !== 'avatar_url').join(', ');
    result = await applyFilters(supabaseClient.from('profiles').select(fallbackColumns));
  } else if (!result.error && columns.split(',').some(column => column.trim() === 'avatar_url')) {
    profilePhotoColumnAvailable = true;
  }
  return result;
}

async function saveMarketplaceLocationToAccount(profile) {
  if (!currentUser || !marketplaceLocationContext) return profile;
  const savedLocation = currentUser.user_metadata?.marketplace_location || {};
  const postalCode = marketplaceLocationContext.postalCode || '';
  if (savedLocation.city === marketplaceLocationContext.city &&
      savedLocation.state === marketplaceLocationContext.state &&
      savedLocation.country === marketplaceLocationContext.country &&
      savedLocation.country_code === marketplaceLocationContext.countryCode &&
      savedLocation.postal_code === postalCode) return profile;

  const { data, error } = await supabaseClient.auth.updateUser({
    data: {
      marketplace_location: {
        city: marketplaceLocationContext.city,
        state: marketplaceLocationContext.state,
        country: marketplaceLocationContext.country,
        country_code: marketplaceLocationContext.countryCode,
        postal_code: postalCode
      }
    }
  });
  if (error) throw error;
  if (!data.user) throw new Error('Your selected marketplace location could not be saved to your account.');
  currentUser = data.user;
  return profile;
}

function restoreMarketplaceLocationContext(user) {
  let savedLocation = window.TIME2INCOME_LOCATION.getSelected();
  if (!savedLocation) {
    const savedAccountLocation = user.user_metadata?.marketplace_location;
    const countryCode = String(savedAccountLocation?.country_code || '').toUpperCase();
    if (!savedAccountLocation?.city || !savedAccountLocation.country || !/^[A-Z]{2}$/.test(countryCode)) {
      return false;
    }
    savedLocation = {
      city: String(savedAccountLocation.city),
      state: String(savedAccountLocation.state || ''),
      country: String(savedAccountLocation.country),
      countryCode,
      postalCode: String(savedAccountLocation.postal_code || ''),
      latitude: null,
      longitude: null,
      source: 'account',
      displayName: [savedAccountLocation.city, savedAccountLocation.state, savedAccountLocation.country]
        .filter(Boolean).join(', ')
    };
    try {
      window.TIME2INCOME_LOCATION.saveSelected(savedLocation);
    } catch (error) {
      console.warn('Could not cache the account location on this device:', error);
    }
  }
  marketplaceLocationContext = savedLocation;
  searchLocationCoordinates = Number.isFinite(savedLocation.latitude) &&
    Number.isFinite(savedLocation.longitude)
    ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude }
    : null;
  $('locationInput').value = window.TIME2INCOME_LOCATION.formatLabel(marketplaceLocationContext);
  $('taskCityFilter').value = getTaskLocationFilterValue();
  $('searchLocationStatus').textContent = searchLocationCoordinates ? t('searchLocationActive') : '';
  $('locationContextLink').querySelector('small').textContent =
    [marketplaceLocationContext.city, marketplaceLocationContext.country].filter(Boolean).join(', ');
  $('locationContextLink').hidden = false;
  $('locationGateway').hidden = true;
  document.documentElement.classList.remove('location-gateway-active');
  loadNearbyPopularSkills();
  return true;
}

async function loadAccountProfile() {
  if (!currentUser) return;
  accountPrivacyRequests = [];
  accountPrivacyRequestsAvailable = false;
  const [profileResult, initialWorkerResult] = await Promise.all([
    selectProfiles('id, display_name, avatar_url, country, city, preferred_language, preferred_currency, roles',
      query => query.eq('id', currentUser.id).maybeSingle()),
    supabaseClient.from('worker_profiles').select('user_id, headline, bio, skills, service_languages, portfolio_images, hourly_rate, currency_code, category_id, work_preference, service_city, service_state, service_country, service_postal_code, service_latitude, service_longitude, is_published')
      .eq('user_id', currentUser.id).maybeSingle()
  ]);
  if (profileResult.error) throw profileResult.error;
  const workerResult = initialWorkerResult;
  if (workerResult.error) throw workerResult.error;
  const verificationResult = await supabaseClient.from('identity_verification_requests')
    .select('id, selfie_path, status, submitted_at')
    .eq('user_id', currentUser.id)
    .order('submitted_at', { ascending:false })
    .limit(1)
    .maybeSingle();
  identityVerificationAvailable = !verificationResult.error;
  if (verificationResult.error) {
    identityVerificationRequest = null;
    console.error('Could not load identity review status:', verificationResult.error);
  } else {
    identityVerificationRequest = verificationResult.data;
  }
  let identityDocumentResult = await supabaseClient.from('identity_document_requests')
    .select('id, status, submitted_at, requester_message')
    .eq('user_id', currentUser.id)
    .order('submitted_at', { ascending:false })
    .limit(1)
    .maybeSingle();
  const identityDocumentErrorText = `${identityDocumentResult.error?.message || ''} ${identityDocumentResult.error?.details || ''}`;
  if (identityDocumentResult.error
    && ['PGRST204', '42703'].includes(identityDocumentResult.error.code)
    && /requester_message/i.test(identityDocumentErrorText)) {
    console.warn('Identity-review messages are unavailable until the review migration is installed:', identityDocumentResult.error);
    identityDocumentResult = await supabaseClient.from('identity_document_requests')
      .select('id, status, submitted_at')
      .eq('user_id', currentUser.id)
      .order('submitted_at', { ascending:false })
      .limit(1)
      .maybeSingle();
  }
  identityDocumentReviewAvailable = !identityDocumentResult.error;
  if (identityDocumentResult.error) {
    identityDocumentReviewRequest = null;
    console.error('Could not load required marketplace identity review status:', identityDocumentResult.error);
  } else {
    identityDocumentReviewRequest = identityDocumentResult.data
      ? {
        ...identityDocumentResult.data,
        status:identityDocumentResult.data.status === 'approved'
          ? 'verified'
          : identityDocumentResult.data.status
      }
      : null;
  }
  await loadAccountPrivacyRequests();

  accountProfile = await saveMarketplaceLocationToAccount(profileResult.data);
  window.dispatchEvent(new Event('time2income:accountcountrychange'));
  accountProfilePhotoUrl = '';
  if (accountProfile?.avatar_url && /^https:\/\//i.test(accountProfile.avatar_url)) {
    accountProfilePhotoUrl = accountProfile.avatar_url;
  } else if (accountProfile?.avatar_url) {
    const { data: signedPhoto, error: signedPhotoError } = await supabaseClient.storage
      .from('profile-photos').createSignedUrl(accountProfile.avatar_url, 86400);
    if (signedPhotoError) throw signedPhotoError;
    accountProfilePhotoUrl = signedPhoto.signedUrl;
  }
  currentWorkerProfile = workerResult.data;
  await loadNearbyAlertPreferences();
  startNearbyAlertRealtime();
  const currentTrust = await loadUserTrust([currentUser.id], false);
  currentIdentityVerified = Boolean(currentTrust.get(currentUser.id)?.identityVerified);
  if (!$('locationInput').value.trim()) {
    let savedLocation = '';
    try {
      savedLocation = localStorage.getItem('time2income_marketplace_city') || '';
    } catch (error) {
      console.warn('Could not read saved marketplace location:', error);
    }
    $('locationInput').value = accountProfile?.city || savedLocation;
  }
  let authLanguageSelection = '';
  try {
    authLanguageSelection = localStorage.getItem('time2income_auth_language_selection') || '';
    if (authLanguageSelection) localStorage.removeItem('time2income_auth_language_selection');
  } catch (error) {
    console.warn('Could not load the language selected on the sign-in page:', error);
  }
  if (authLanguageSelection) applyLanguage(authLanguageSelection, false);
  else if (accountProfile?.preferred_language) applyLanguage(accountProfile.preferred_language, false);
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

async function loadAccountPrivacyRequests() {
  if (!currentUser) {
    accountPrivacyRequests = [];
    accountPrivacyRequestsAvailable = false;
    return false;
  }
  const { data, error } = await supabaseClient.from('account_privacy_requests')
    .select('id, request_type, message, status, response_message, created_at')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending:false })
    .limit(20);
  accountPrivacyRequestsAvailable = !error;
  if (error) {
    accountPrivacyRequests = [];
    console.error('Could not load privacy/account request history:', error);
    return false;
  }
  accountPrivacyRequests = data || [];
  return true;
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

function prepareIdentityReviewImage(file) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('This browser could not prepare the selfie for private upload.'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('This browser could not prepare the selfie for private upload.'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.9);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error(t('identityPhotoInvalid')));
    };
    image.src = imageUrl;
  });
}

async function submitIdentityVerification(event) {
  event.preventDefault();
  if (!currentUser || !identityVerificationAvailable) {
    toast(t('identitySetupRequired'));
    return;
  }
  const input = $('identitySelfieInput');
  const file = input.files?.[0];
  if (!file || !$('identitySelfieConsent').checked) {
    toast(t('identityPhotoRequired'));
    return;
  }
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
    toast(t('identityPhotoInvalid'));
    return;
  }

  const button = event.submitter || event.target.querySelector('[type="submit"]');
  button.disabled = true;
  const objectPath = `${currentUser.id}/${crypto.randomUUID()}.jpg`;
  try {
    const privateImage = await prepareIdentityReviewImage(file);
    const { error: uploadError } = await supabaseClient.storage
      .from('identity-verification')
      .upload(objectPath, privateImage, { upsert:false, contentType:'image/jpeg' });
    if (uploadError) throw uploadError;

    const { error: requestError } = await supabaseClient
      .from('identity_verification_requests')
      .insert({ user_id:currentUser.id, selfie_path:objectPath, status:'pending' });
    if (requestError) {
      const { error: cleanupError } = await supabaseClient.storage
        .from('identity-verification').remove([objectPath]);
      if (cleanupError) console.error('Failed to remove an unsubmitted private selfie:', cleanupError);
      throw requestError;
    }

    identityVerificationRequest = { selfie_path:objectPath, status:'pending' };
    if (identitySelfiePreviewUrl) URL.revokeObjectURL(identitySelfiePreviewUrl);
    identitySelfiePreviewUrl = null;
    renderAccount();
  } catch (error) {
    console.error('Private identity selfie submission failed:', error);
    toast(`${t('identityUploadError')} ${error.message || ''}`.trim());
  } finally {
    button.disabled = false;
  }
}

async function submitPrivacyRequest(event) {
  event.preventDefault();
  if (!currentUser || !accountPrivacyRequestsAvailable) {
    toast(t('privacyRequestsUnavailable'));
    return;
  }
  const form = event.currentTarget;
  const formData = new FormData(form);
  const requestType = String(formData.get('request_type') || '');
  const message = String(formData.get('message') || '').trim();
  const allowedTypes = new Set(['access', 'correction', 'deletion', 'restriction', 'other']);
  if (!allowedTypes.has(requestType) || message.length < 5 || message.length > 2000) {
    form.reportValidity();
    return;
  }

  const button = event.submitter || form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const { error } = await supabaseClient.from('account_privacy_requests')
      .insert({ user_id:currentUser.id, request_type:requestType, message });
    if (error) throw error;
    form.reset();
    const historyLoaded = await loadAccountPrivacyRequests();
    renderAccount();
    toast(historyLoaded ? t('privacyRequestSubmitted') : t('privacyRequestSubmittedRefresh'));
  } catch (error) {
    console.error('Privacy/account request submission failed:', error);
    toast(`${t('privacyRequestSubmitFailed')} ${error.message || ''}`.trim());
    button.disabled = false;
  }
}

function renderActivity() {
  if (activityRenderPromise) return activityRenderPromise;
  activityRenderPromise = renderActivityData().finally(() => {
    activityRenderPromise = null;
  });
  return activityRenderPromise;
}

async function renderActivityData() {
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
      .select('id, customer_id, title, category_id, work_mode, pricing_type, status, country, state, city, budget, currency_code, scheduled_start, estimated_hours, created_at, edit_count, expired_at')
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
  const taskDescriptionsResult = tasks.length
    ? await supabaseClient.rpc('get_my_task_descriptions', {
      p_task_ids: tasks.map(task => task.id)
    })
    : { data: [], error: null };
  if (taskDescriptionsResult.error) throw taskDescriptionsResult.error;
  const taskDescriptionById = Object.fromEntries(
    (taskDescriptionsResult.data || []).map(task => [task.task_id, task.description])
  );
  const tasksWithDescriptions = tasks.map(task => ({
    ...task,
    description: taskDescriptionById[task.id] || ''
  }));
  myTasks = tasksWithDescriptions;
  const bookings = bookingsResult.data || [];
  const taskOffersResult = tasks.length
    ? await supabaseClient.from('task_offers')
      .select('id, task_id, worker_id, proposed_price, currency_code, message, status, created_at')
      .in('task_id', tasks.map(task => task.id))
      .order('created_at', { ascending: false })
    : { data: [], error: null };
  if (taskOffersResult.error) throw taskOffersResult.error;

  const taskOffers = taskOffersResult.data || [];
  const trustByUserId = await loadUserTrust(taskOffers.map(offer => offer.worker_id));
  const otherUserIds = [...new Set([
    ...bookings.map(booking => booking.customer_id === currentUser.id ? booking.worker_id : booking.customer_id),
    ...taskOffers.map(offer => offer.worker_id)
  ])];
  let namesById = {};
  let photosById = {};
  if (otherUserIds.length) {
    const { data: people, error } = await selectProfiles('id, display_name, avatar_url',
      query => query.in('id', otherUserIds));
    if (error) throw error;
    namesById = Object.fromEntries((people || []).map(person => [person.id, person.display_name]));
    const photoUrlsByPath = await signProfilePhotoPaths(people || []);
    photosById = Object.fromEntries((people || [])
      .filter(person => person.avatar_url && photoUrlsByPath[person.avatar_url])
      .map(person => [person.id, photoUrlsByPath[person.avatar_url]]));
  }

  // reviews table is optional until supabase/reviews.sql has been applied
  let reviewedIds = new Set();
  let reviewsAvailable = true;
  const completedIds = bookings.filter(b => b.status === 'completed').map(b => b.id);
  if (completedIds.length) {
    const { data: reviewRows, error: reviewsError } = await supabaseClient.from('reviews')
      .select('booking_id, reviewer_id').in('booking_id', completedIds);
    if (reviewsError) reviewsAvailable = false;
    else reviewedIds = new Set((reviewRows || [])
      .filter(review => review.reviewer_id === currentUser.id)
      .map(review => review.booking_id));
  }

  await loadChatSummary(false);
  bookingRecords = bookings.map(booking => {
    const isWorker = booking.worker_id === currentUser.id;
    const otherUserId = isWorker ? booking.customer_id : booking.worker_id;
    return {
      ...booking,
      isWorker,
      otherName: namesById[otherUserId] || (isWorker ? 'Customer' : 'Provider'),
      otherAvatarUrl: photosById[otherUserId] || ''
    };
  }).sort((a, b) => {
    const lastA = Date.parse(chatSummaryById[a.id]?.last_at) || 0;
    const lastB = Date.parse(chatSummaryById[b.id]?.last_at) || 0;
    return lastB - lastA || (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0);
  });

  $('taskCount').textContent = tasks.length;
  $('bookingCount').textContent = bookings.length;
  $('myTasksList').innerHTML = tasks.length
    ? tasks.map(task => {
      const offers = taskOffers.filter(offer => offer.task_id === task.id)
        .sort((a, b) =>
          compareMarketplaceTrust(
            trustByUserId.get(a.worker_id),
            trustByUserId.get(b.worker_id)
          ) ||
          (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)
        );
      const offerRows = offers.map(offer => {
        const actions = task.status === 'open' && offer.status === 'pending'
          ? `<button class="text-link" type="button" data-task-offer-action="accept" data-offer-id="${safeText(offer.id)}">${t('accept')}</button><button class="text-link" type="button" data-task-offer-action="reject" data-offer-id="${safeText(offer.id)}">${t('decline')}</button>`
          : '';
        const offerStatusKey = `status_${offer.status}`;
        const offerStatus = t(offerStatusKey) === offerStatusKey ? offer.status : t(offerStatusKey);
        const workerName = namesById[offer.worker_id] || 'Worker';
        const trust = trustByUserId.get(offer.worker_id) || {};
        const ratingLabel = trust.reviewCount
          ? `★ ${Number(trust.rating).toFixed(1)} (${trust.reviewCount})`
          : t('providerRatingNone');
        return `<div class="task-offer-row"><div class="activity-person">${renderActivityAvatar(photosById[offer.worker_id], workerName)}<div><strong>${safeText(workerName)}</strong>${renderVerifiedBadge(trust.identityVerified)}<p>${safeText(ratingLabel)} · ${safeText(formatMoney(offer.proposed_price, offer.currency_code))} · ${safeText(offerStatus)}</p><p>${safeText(offer.message || t('noMessage'))}</p></div></div><div class="account-card-actions">${actions}</div></div>`;
      }).join('');
      const taskStatusKey = `status_${task.status}`;
      const expired = Boolean(task.expired_at) || (task.status === 'open' &&
        Date.now() >= new Date(task.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
      const visibleStatusKey = expired ? 'status_expired' : taskStatusKey;
      const taskStatus = t(visibleStatusKey) === visibleStatusKey ? task.status : t(visibleStatusKey);
      const schedule = task.scheduled_start ? formatDateTime(task.scheduled_start) : '';
      const hours = task.estimated_hours ? new Intl.NumberFormat(getFormatLocale()).format(task.estimated_hours) : '';
      const canEdit = task.status === 'open' && !expired && Number(task.edit_count) < 1;
      const taskActions = task.status === 'open'
        ? `<div class="account-card-actions">${canEdit ? `<button class="text-link" type="button" data-task-edit="${safeText(task.id)}">${t('editTask')}</button>` : Number(task.edit_count) >= 1 ? `<span class="activity-status">${t('taskEditUsed')}</span>` : ''}<button class="text-link" type="button" data-task-delete="${safeText(task.id)}">${t('deleteTask')}</button></div>`
        : '';
      const expiresAt = new Date(new Date(task.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
      const expiryNotice = task.status === 'open'
        ? `<p>${t('taskExpiresAt')}: ${safeText(formatDateTime(expiresAt.toISOString()))}</p>`
        : '';
      return `<article class="activity-item"><div class="activity-item-top"><strong>${safeText(task.title)}</strong><span class="activity-status">${safeText(taskStatus)}</span></div><p>${safeText([task.city, task.state, task.country].filter(Boolean).join(', ') || t('remote'))}</p><p>${task.budget ? `${t('budget')}: ${safeText(formatMoney(task.budget, task.currency_code))}` : t('budgetByAgreement')}</p>${schedule ? `<p>${t('schedule')}: ${safeText(schedule)}</p>` : ''}${hours ? `<p>${t('estimatedHours')}: ${safeText(hours)}</p>` : ''}${expiryNotice}${offers.length ? `<details class="task-offers"><summary>${formatPluralCount(offers.length, 'offerOne', 'offerMany')}</summary>${offerRows}</details>` : `<p>${t('noOffers')}</p>`}${taskActions}</article>`;
    }).join('')
    : `<div class="activity-empty">${t('noTasksYet')}</div>`;
  $('myBookingsList').innerHTML = bookingRecords.length
    ? bookingRecords.map(booking => {
      const isWorker = booking.isWorker;
      const otherName = booking.otherName;
      const actions = isWorker && booking.status === 'requested'
        ? `<button class="text-link" type="button" data-booking-action="accept" data-booking-id="${safeText(booking.id)}" title="${safeText(t('acceptFeeHint'))}">${t('accept')}</button><button class="text-link" type="button" data-booking-action="reject" data-booking-id="${safeText(booking.id)}">${t('decline')}</button>`
        : isWorker && ['accepted', 'confirmed'].includes(booking.status)
          ? `<button class="text-link" type="button" data-booking-action="start" data-booking-id="${safeText(booking.id)}">${t('startWork')}</button>`
          : isWorker && booking.status === 'in_progress'
            ? `<button class="text-link" type="button" data-booking-action="complete" data-booking-id="${safeText(booking.id)}">${t('markWorkComplete')}</button>`
            : !isWorker && booking.status === 'completion_pending'
              ? `<button class="text-link" type="button" data-booking-action="confirm_complete" data-booking-id="${safeText(booking.id)}">${t('confirmWorkComplete')}</button><button class="text-link" type="button" data-booking-action="dispute" data-booking-id="${safeText(booking.id)}">${t('reportIssue')}</button>`
              : !isWorker && ['requested', 'accepted'].includes(booking.status)
                ? `<button class="text-link" type="button" data-booking-action="cancel" data-booking-id="${safeText(booking.id)}">${t('cancelAction')}</button>`
                : booking.status === 'completed'
                  ? (reviewsAvailable
                    ? (reviewedIds.has(booking.id)
                      ? `<span class="activity-status">${t('reviewed')}</span>`
                      : `<button class="text-link" type="button" data-booking-review="${safeText(booking.id)}">${t(isWorker ? 'reviewCustomer' : 'reviewProvider')}</button>`)
                    : '') + `<button class="text-link" type="button" data-booking-next="${isWorker ? 'browse' : 'post'}">${t(isWorker ? 'browseNextTasks' : 'postNextTask')}</button>`
                  : '';
      const statusKey = `status_${booking.status}`;
      const statusText = t(statusKey) === statusKey ? booking.status : t(statusKey);
      const chatAvailable = ['accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed', 'completed', 'cancelled'].includes(booking.status);
      const chatAction = chatAvailable
        ? `<button class="text-link" type="button" data-booking-chat="${safeText(booking.id)}">${t('bookingChat')}<span class="chat-unread-dot" data-chat-unread="${safeText(booking.id)}" hidden></span></button>`
        : `<span class="activity-status">${t('chatWaitingForAcceptance')}</span>`;
      return `<article class="activity-item" data-booking-item="${safeText(booking.id)}"><div class="activity-item-top"><strong>${safeText(booking.title)}</strong><span class="activity-status">${safeText(statusText)}</span></div><p>${isWorker ? t('requestedBy') : t('provider')}:</p><div class="activity-person">${renderActivityAvatar(booking.otherAvatarUrl, otherName)}<strong>${safeText(otherName)}</strong></div><p>${safeText(formatMoney(booking.agreed_price, booking.currency_code))}</p><p>${safeText(formatDateTime(booking.created_at))}</p><p class="chat-last-message" data-chat-preview="${safeText(booking.id)}" hidden></p><div class="activity-item-bottom">${chatAction}${actions}</div></article>`;
    }).join('')
    : `<div class="activity-empty">${t('noBookingsYet')}</div>`;
  applyChatUnreadToDom();
  startChatUnreadPolling();
}

let chatSummaryById = {};
let chatUnreadTotal = 0;
let chatUnreadTimer = null;
let chatSummaryAvailable = true;

function applyChatUnreadToDom() {
  document.querySelectorAll('[data-chat-unread]').forEach(dot => {
    dot.hidden = !(chatSummaryById[dot.dataset.chatUnread]?.unread_count > 0);
  });
  document.querySelectorAll('[data-chat-preview]').forEach(line => {
    const summary = chatSummaryById[line.dataset.chatPreview];
    if (!summary?.last_body) {
      line.hidden = true;
      return;
    }
    const prefix = summary.last_sender_id === currentUser?.id ? `${t('chatYou')}: ` : '';
    line.textContent = `${prefix}${summary.last_body}`;
    line.classList.toggle('is-unread', summary.unread_count > 0);
    line.hidden = false;
  });
  document.querySelectorAll('[data-messages-nav]').forEach(link => {
    let badge = link.querySelector('.nav-unread-badge');
    if (!chatUnreadTotal) {
      badge?.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-unread-badge';
      badge.setAttribute('role', 'status');
      link.appendChild(badge);
    }
    badge.textContent = chatUnreadTotal > 99 ? '99+' : String(chatUnreadTotal);
    badge.setAttribute('aria-label', `${chatUnreadTotal} ${t('chatNewMessages')}`);
  });
}

async function loadChatSummary(notify = true) {
  if (!currentUser || !chatSummaryAvailable) return;
  const { data, error } = await supabaseClient.rpc('get_my_chat_summary');
  if (error) {
    // The chat-unread.sql migration may not be applied yet.
    chatSummaryAvailable = false;
    console.warn('Chat unread summary is unavailable:', error.message);
    return;
  }
  const previous = chatSummaryById;
  chatSummaryById = Object.fromEntries((data || []).map(row => [row.booking_id, {
    ...row,
    unread_count: Number(row.unread_count) || 0
  }]));
  chatUnreadTotal = Object.values(chatSummaryById).reduce((sum, row) => sum + row.unread_count, 0);
  if (notify) {
    const fresh = Object.values(chatSummaryById).find(row =>
      row.unread_count > (previous[row.booking_id]?.unread_count || 0) &&
      row.booking_id !== activeBookingChatId);
    if (fresh) {
      const booking = bookingRecords.find(record => record.id === fresh.booking_id);
      toast(`${t('chatNewMessageFrom')} ${booking?.otherName || ''}`.trim());
    }
  }
  applyChatUnreadToDom();
}

async function markBookingChatRead(bookingId) {
  if (!chatSummaryAvailable || !bookingId) return;
  const { error } = await supabaseClient.rpc('mark_booking_chat_read', { p_booking_id: bookingId });
  if (error) return;
  if (chatSummaryById[bookingId]) chatSummaryById[bookingId].unread_count = 0;
  chatUnreadTotal = Object.values(chatSummaryById).reduce((sum, row) => sum + row.unread_count, 0);
  applyChatUnreadToDom();
}

function startChatUnreadPolling() {
  if (chatUnreadTimer || !chatSummaryAvailable) return;
  chatUnreadTimer = setInterval(() => {
    if (document.hidden) return;
    if (!currentUser) {
      chatSummaryById = {};
      chatUnreadTotal = 0;
      applyChatUnreadToDom();
      return;
    }
    loadChatSummary().catch(() => {});
  }, 20000);
}

function stopBookingChatPolling() {
  if (bookingChatPoll) clearInterval(bookingChatPoll);
  bookingChatPoll = null;
  activeBookingChatId = null;
  bookingChatBlocked = false;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function renderSelectedChatFiles() {
  const container = $('bookingChatSelectedFiles');
  if (!container) return;
  const status = $('bookingChatUploadState');
  if (!selectedChatFiles.length) {
    container.innerHTML = '';
    if (status) status.textContent = '';
    return;
  }

  container.innerHTML = selectedChatFiles.map(file => `
    <div class="booking-chat-file-chip">
      <span class="booking-chat-file-name">${safeText(file.name)}</span>
      <span class="booking-chat-file-meta">${safeText(formatFileSize(file.size))}</span>
      <button type="button" class="text-link booking-chat-remove-file" data-chat-file-index="${safeText(String(selectedChatFiles.indexOf(file)))}">Remove</button>
    </div>
  `).join('');
  if (status) status.textContent = t('chatUploadQueued');
}

function handleChatFileSelection(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const validFiles = [];
  for (const file of files) {
    if (file.size <= 0) continue;
    if (file.size > MAX_CHAT_FILE_BYTES) {
      toast(`${file.name}: ${t('chatUploadError')}`);
      continue;
    }
    validFiles.push(file);
  }
  if (!validFiles.length) {
    event.target.value = '';
    return;
  }
  selectedChatFiles = [...selectedChatFiles, ...validFiles];
  event.target.value = '';
  renderSelectedChatFiles();
}

function removeSelectedChatFile(index) {
  if (!Number.isInteger(index) || index < 0 || index >= selectedChatFiles.length) return;
  selectedChatFiles.splice(index, 1);
  renderSelectedChatFiles();
}

async function uploadChatFiles(bookingId) {
  if (!selectedChatFiles.length) return [];
  const uploaded = [];
  const bucket = 'booking-chat-files';
  const uploadedState = $('bookingChatUploadState');

  for (let index = 0; index < selectedChatFiles.length; index += 1) {
    const file = selectedChatFiles[index];
    const fileId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${currentUser.id}/${bookingId}/${fileId}-${safeName}`;
    if (uploadedState) uploadedState.textContent = t('chatUploadProgress').replace('{count}', String(index + 1));
    const { data: uploadedFile, error } = await supabaseClient.storage.from(bucket).upload(objectKey, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
      duplex: 'half',
      onUploadProgress: (progress) => {
        if (uploadedState) {
          const percent = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
          uploadedState.textContent = `${t('chatUploadProgress').replace('{count}', String(index + 1))} ${percent}%`;
        }
      }
    });
    if (error) throw new Error(error.message || t('chatUploadError'));

    const { data: metadataRow, error: insertError } = await supabaseClient.from('chat_attachments').insert({
      booking_id: bookingId,
      uploader_id: currentUser.id,
      object_key: uploadedFile?.path || objectKey,
      file_name: file.name,
      size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
      status: 'uploaded'
    }).select('*').single();
    if (insertError) throw new Error(insertError.message || t('chatUploadError'));
    uploaded.push(metadataRow);
  }

  selectedChatFiles = [];
  renderSelectedChatFiles();
  if (uploadedState) uploadedState.textContent = '';
  return uploaded;
}

async function openChatAttachment(attachment) {
  if (!attachment || !attachment.object_key) return;
  const { data, error } = await supabaseClient.storage.from('booking-chat-files').createSignedUrl(attachment.object_key, 3600);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('Download link is unavailable.');

  const isPreviewable = (attachment.mime_type || '').startsWith('image/') || (attachment.mime_type || '').includes('pdf');
  if (isPreviewable) {
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = data.signedUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.download = attachment.file_name || 'attachment';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function loadBookingMessages() {
  const bookingId = activeBookingChatId;
  if (!bookingId || !currentUser) return;

  const { data, error } = await supabaseClient.from('booking_messages')
    .select('id, sender_id, body, created_at, attachment_id, message_type')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const attachmentIds = [...new Set((data || []).filter(message => message.attachment_id).map(message => message.attachment_id).filter(Boolean))];
  let attachmentsById = {};
  if (attachmentIds.length) {
    const { data: attachmentRows, error: attachmentError } = await supabaseClient.from('chat_attachments')
      .select('id, booking_id, object_key, file_name, mime_type, size_bytes, status, uploaded_at')
      .in('id', attachmentIds);
    if (attachmentError) throw attachmentError;

    const previewRows = await Promise.all((attachmentRows || []).map(async attachment => {
      if (!attachment.mime_type || !attachment.mime_type.startsWith('image/')) return [attachment.id, attachment];
      const { data, error } = await supabaseClient.storage.from('booking-chat-files').createSignedUrl(attachment.object_key, 3600);
      if (error || !data?.signedUrl) return [attachment.id, attachment];
      return [attachment.id, { ...attachment, preview_url: data.signedUrl }];
    }));
    attachmentsById = Object.fromEntries(previewRows);
  }

  if (bookingId !== activeBookingChatId || !$('bookingChatDialog').open) return;

  const messages = (data || []).reverse();
  $('bookingChatMessages').innerHTML = messages.length
    ? messages.map(message => {
      const isMine = message.sender_id === currentUser.id;
      const senderName = isMine ? t('you') : bookingRecords.find(booking => booking.id === bookingId)?.otherName || t('provider');
      const attachment = message.attachment_id ? attachmentsById[message.attachment_id] : null;
      const attachmentMarkup = attachment
        ? `<div class="booking-chat-attachment-card">
            ${attachment.mime_type && attachment.mime_type.startsWith('image/')
              ? `<img class="booking-chat-attachment-preview" src="${safeText(attachment.preview_url || '')}" alt="${safeText(attachment.file_name || t('chatAttachment'))}" />`
              : ''}
            <div class="booking-chat-attachment-summary">
              <strong>${safeText(attachment.file_name || t('chatAttachment'))}</strong>
              <small>${safeText(formatFileSize(attachment.size_bytes || 0))}</small>
            </div>
            <button class="text-link" type="button" data-chat-download="${safeText(attachment.id)}">${t('chatDownload')}</button>
          </div>`
        : '';
      const bodyText = message.body && message.body.trim() ? safeText(message.body) : '';
      return `<article class="booking-chat-message${isMine ? ' is-mine' : ''}"><div class="booking-chat-message-body">${bodyText ? `<p>${bodyText}</p>` : ''}${attachmentMarkup}</div><div class="booking-chat-message-meta"><strong>${safeText(senderName)}</strong><time>${safeText(formatDateTime(message.created_at))}</time></div></article>`;
    }).join('')
    : `<p class="booking-chat-empty">${t('chatNoMessages')}</p>`;

  const messageList = $('bookingChatMessages');
  messageList.scrollTop = messageList.scrollHeight;

  const downloadButtons = messageList.querySelectorAll('[data-chat-download]');
  downloadButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const attachmentId = button.dataset.chatDownload;
      const attachment = attachmentsById[attachmentId];
      if (!attachment) return;
      try {
        const { data: urlData, error } = await supabaseClient.storage.from('booking-chat-files').createSignedUrl(attachment.object_key, 3600);
        if (error) throw error;
        const link = document.createElement('a');
        link.href = urlData.signedUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = attachment.file_name || 'attachment';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        toast(error.message || t('chatUploadError'));
      }
    });
  });
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

  if (!['accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed', 'completed'].includes(booking.status)) {
    toast(t('chatOnlyAfterAcceptance'));
    return;
  }
  const acknowledgementKey = `time2income_chat_safety_v1_${currentUser.id}_${booking.id}`;
  let acknowledged = false;
  try {
    acknowledged = localStorage.getItem(acknowledgementKey) === 'accepted';
  } catch (error) {
    console.warn('Could not read the chat safety acknowledgement:', error);
  }
  if (!acknowledged) {
    pendingSafetyBookingId = booking.id;
    $('chatSafetyDialog').showModal();
    return;
  }
  await beginBookingChat(booking);
}

async function beginBookingChat(booking) {
  stopBookingChatPolling();
  selectedChatFiles = [];
  renderSelectedChatFiles();
  activeBookingChatId = booking.id;
  bookingChatWritable = ['accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed'].includes(booking.status);
  const { data: blocked, error: stateError } = await supabaseClient.rpc('get_booking_chat_state', {
    p_booking_id: booking.id
  });
  if (stateError) {
    activeBookingChatId = null;
    toast(stateError.message || t('chatLoadError'));
    return;
  }
  bookingChatBlocked = Boolean(blocked);
  $('bookingChatTitle').textContent = booking.title;
  $('bookingChatPartner').textContent = booking.otherName;
  $('bookingChatStatus').textContent = t(bookingChatBlocked ? 'chatBlocked' : bookingChatWritable ? 'chatActive' : 'chatReadOnly');
  $('bookingChatInput').disabled = !bookingChatWritable || bookingChatBlocked;
  $('bookingChatFileInput').disabled = !bookingChatWritable || bookingChatBlocked;
  $('sendBookingMessageBtn').disabled = !bookingChatWritable || bookingChatBlocked;
  $('blockBookingChatBtn').disabled = bookingChatBlocked || !bookingChatWritable;
  $('bookingChatMessages').innerHTML = '';
  $('bookingChatDialog').showModal();

  try {
    await loadBookingMessages();
  } catch (error) {
    toast(t('chatLoadError'));
  }
  if (activeBookingChatId !== booking.id || !$('bookingChatDialog').open) return;
  markBookingChatRead(booking.id);
  bookingChatPoll = setInterval(() => {
    loadBookingMessages().then(() => markBookingChatRead(activeBookingChatId)).catch(() => {
      if (bookingChatPoll) clearInterval(bookingChatPoll);
      bookingChatPoll = null;
      toast(t('chatLoadError'));
    });
  }, 5000);
}

async function sendBookingMessage(event) {
  event.preventDefault();
  if (!requireProfilePhoto()) return;
  const body = $('bookingChatInput').value.trim();
  if (!activeBookingChatId || !currentUser || !bookingChatWritable || bookingChatBlocked || (!body && !selectedChatFiles.length)) return;

  const button = $('sendBookingMessageBtn');
  button.disabled = true;
  $('bookingChatInput').disabled = true;
  try {
    const files = await uploadChatFiles(activeBookingChatId);
    const records = [];
    const textBody = body.trim();
    if (textBody) {
      records.push({
        booking_id: activeBookingChatId,
        sender_id: currentUser.id,
        body: textBody,
        message_type: 'text',
        attachment_id: null
      });
    }

    if (files.length) {
      files.forEach((fileRow, index) => {
        records.push({
          booking_id: activeBookingChatId,
          sender_id: currentUser.id,
          body: textBody || (files.length === 1 ? 'Shared a file.' : `Shared file ${index + 1} of ${files.length}.`),
          message_type: 'file',
          attachment_id: fileRow.id
        });
      });
    }

    if (!records.length) return;
    const { error } = await supabaseClient.from('booking_messages').insert(records);
    if (error) throw error;
    $('bookingChatInput').value = '';
    selectedChatFiles = [];
    renderSelectedChatFiles();
    try {
      await loadBookingMessages();
    } catch (error) {
      toast(t('chatLoadError'));
    }
  } catch (error) {
    toast(error.message || t('chatSendError'));
  } finally {
    button.disabled = !bookingChatWritable || bookingChatBlocked;
    $('bookingChatInput').disabled = !bookingChatWritable || bookingChatBlocked;
  }
}

async function submitBookingChatReport(event) {
  event.preventDefault();
  if (!activeBookingChatId || !currentUser) return;
  const submitButton = $('reportBookingForm').querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    const { error } = await supabaseClient.rpc('report_booking_chat', {
      p_booking_id: activeBookingChatId,
      p_reason: $('chatReportReason').value,
      p_details: $('chatReportDetails').value.trim() || null
    });
    if (error) throw error;
    $('reportBookingDialog').close();
    $('reportBookingForm').reset();
    toast(t('chatReportSent'));
  } catch (error) {
    toast(error.message || t('chatReportError'));
  } finally {
    submitButton.disabled = false;
  }
}

async function blockActiveBookingChat() {
  if (!activeBookingChatId || !bookingChatWritable || bookingChatBlocked) return;
  if (!window.confirm(t('chatBlockConfirm'))) return;
  const button = $('blockBookingChatBtn');
  button.disabled = true;
  const { error } = await supabaseClient.rpc('block_booking_chat', {
    p_booking_id: activeBookingChatId
  });
  if (error) {
    button.disabled = false;
    toast(error.message || t('chatBlockError'));
    return;
  }
  bookingChatBlocked = true;
  bookingChatWritable = false;
  $('bookingChatStatus').textContent = t('chatBlocked');
  $('bookingChatInput').disabled = true;
  $('bookingChatFileInput').disabled = true;
  $('sendBookingMessageBtn').disabled = true;
  toast(t('chatBlocked'));
}

async function loadTaskCategories() {
  const { data, error } = await supabaseClient.from('categories')
    .select('id, name').eq('is_active', true).order('name');
  if (error) throw error;
  taskCategories = data || [];

  populateTaskCategoryOptions();

  for (const selectId of ['taskCategory', 'accountCategory', 'profileCategory']) {
    const select = $(selectId);
    if (!select) continue;
    const selectedName = select.value;
    select.innerHTML = taskCategories.map(category =>
      `<option value="${safeText(category.name)}">${safeText(category.name)}</option>`
    ).join('');
    if (taskCategories.some(category => category.name === selectedName)) select.value = selectedName;
  }
}

function populateTaskCategoryOptions() {
  const categoryFilter = $('taskCategoryFilter');
  const options = $('taskCategoryOptions');
  if (!categoryFilter || !options) return;

  const skillCategories = window.TIME2INCOME_SKILL_CATEGORY_NAMES || [];
  const categoryNames = [...new Set([
    ...taskCategories.map(category => category.name),
    ...skillCategories
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b));

  options.replaceChildren(...categoryNames.map(name => {
    const option = document.createElement('option');
    option.value = name;
    return option;
  }));
}

function renderTaskBoard() {
  if (taskBoardRenderPromise) return taskBoardRenderPromise;
  taskBoardRenderPromise = renderTaskBoardData().finally(() => {
    taskBoardRenderPromise = null;
  });
  return taskBoardRenderPromise;
}

async function renderTaskBoardData() {
  if (!currentUser) {
    openTasks = [];
    taskOfferStatuses = {};
    taskDescriptions = {};
    $('openTaskCount').textContent = '0';
    $('openTaskList').innerHTML = '';
    return;
  }

  const [tasksResult, offersResult] = await Promise.all([
    supabaseClient.from('task_listings')
      .select('id, customer_id, title, category_id, country, state, city, work_mode, pricing_type, budget, currency_code, scheduled_start, estimated_hours, status, created_at')
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
  const taskCityFilter = $('taskCityFilter').value.trim();
  const defaultLocationFilters = marketplaceLocationContext
    ? [
      getTaskLocationFilterValue(),
      window.TIME2INCOME_LOCATION.formatLabel(marketplaceLocationContext),
      window.TIME2INCOME_LOCATION.formatSearchLabel(marketplaceLocationContext)
    ].map(normalizeTaskCity)
    : [];
  const hasManualCityFilter = taskCityFilter &&
    !defaultLocationFilters.includes(normalizeTaskCity(taskCityFilter));
  const location = hasManualCityFilter ? taskCityFilter.toLocaleLowerCase() : '';
  const priorityLocation = marketplaceLocationContext || {
    city: currentWorkerProfile?.service_city || accountProfile?.city,
    state: currentWorkerProfile?.service_state,
    country: currentWorkerProfile?.service_country || accountProfile?.country
  };
  const workMode = $('taskModeFilter').value;
  const categoryValue = $('taskCategoryFilter')?.value.trim() || '';
  const skillQuery = $('taskSkillFilter')?.value.trim() || workQuery;
  const skillTerms = skillQuery ? expandSkillSearchTerms(skillQuery) : [];
  const matchedTaskCategory = taskCategories.find(category =>
    category.name.toLocaleLowerCase() === categoryValue.toLocaleLowerCase()
  );
  const taskCategoryMatches = matchedTaskCategory
    ? [matchedTaskCategory]
    : taskCategories.filter(category =>
      category.name.toLocaleLowerCase().includes(categoryValue.toLocaleLowerCase())
    );
  const normalizedCategoryValue = categoryValue.toLocaleLowerCase();
  const matchingSkillCategories = normalizedCategoryValue.length >= 2
    ? (window.TIME2INCOME_SKILL_CATEGORY_NAMES || [])
      .filter(category => category.toLocaleLowerCase().includes(normalizedCategoryValue))
    : [];
  const categorySkillTerms = normalizedCategoryValue.length >= 2 && !matchedTaskCategory
    ? [...new Set(Object.entries(window.TIME2INCOME_SKILL_CATEGORIES)
      .filter(([, category]) => matchingSkillCategories.some(match =>
        match.toLocaleLowerCase() === category.toLocaleLowerCase()
      ))
      .flatMap(([skill]) => [skill, ...(window.TIME2INCOME_SKILL_ALIASES[skill] || [])])
      .flatMap(term => [term, ...term.split(/\s+/).filter(word => word.length >= 4)])
      .map(term => term.toLocaleLowerCase()))]
    : [];
  const taskCategoryIds = new Set(taskCategoryMatches.map(category => category.id));
  openTasks = (tasksResult.data || []).filter(task => {
    if (task.customer_id === currentUser.id) return false;
    const matchesCity = !location ||
      task.work_mode === 'remote' ||
      matchesLocationSearch([task.city, task.state, task.country], location);
    const matchesMode = workMode === 'all' || task.work_mode === workMode;
    const categoryName = taskCategories.find(category => category.id === task.category_id)?.name || '';
    const searchable = `${task.title || ''} ${categoryName}`.toLocaleLowerCase();
    const matchesCategory = !categoryValue ||
      (matchedTaskCategory
        ? task.category_id === matchedTaskCategory.id
        : taskCategoryIds.has(task.category_id) ||
          categorySkillTerms.some(term => searchable.includes(term)) ||
          searchable.includes(normalizedCategoryValue));
    const matchesQuery = !skillTerms.length || skillTerms.some(term => searchable.includes(term));
    return matchesCity && matchesMode && matchesCategory && matchesQuery;
  });
  const taskTrustByUserId = await loadUserTrust(openTasks.map(task => task.customer_id));
  openTasks = openTasks.map(task => ({
    ...task,
    category: taskCategories.find(category => category.id === task.category_id)?.name || '',
    ...(taskTrustByUserId.get(task.customer_id) || {})
  })).sort((a, b) =>
    Number(!isTaskInPriorityCity(a, priorityLocation)) -
      Number(!isTaskInPriorityCity(b, priorityLocation)) ||
    compareMarketplaceTrust(a, b) ||
    (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)
  );
  updateMarketplaceSuggestions();

  $('openTaskCount').textContent = openTasks.length;
  $('openTaskList').innerHTML = openTasks.length
    ? openTasks.map(task => {
      const offerStatus = taskOfferStatuses[task.id];
      const location = task.work_mode === 'remote'
        ? t('remote')
        : [task.city, task.state, task.country].filter(Boolean).join(', ') || 'Local';
      const categoryName = taskCategories.find(category => category.id === task.category_id)?.name || '';
      const customerRating = task.reviewCount
        ? `★ ${Number(task.rating).toFixed(1)} (${task.reviewCount})`
        : t('providerRatingNone');
      const isOpen = Object.hasOwn(taskDescriptions, task.id);
      const taskAction = isOpen
        ? offerStatus
          ? `<span class="activity-status">${t('offerStatus')} ${safeText(offerStatus)}</span>`
          : `<button class="btn btn-primary" type="button" data-open-task-offer="${safeText(task.id)}">${t('makeOffer')}</button>`
        : `<button class="btn btn-primary" type="button" data-open-task="${safeText(task.id)}">${t('taskOpen')}</button>`;
      return `<article class="activity-item"><div class="activity-item-top"><strong>${safeText(task.title)}</strong>${renderVerifiedBadge(task.identityVerified)}<span class="activity-status">${safeText(task.work_mode === 'remote' ? t('remote') : t('local'))}</span></div>${categoryName ? `<p class="task-category-name">${safeText(categoryName)}</p>` : ''}<p>${safeText(location)} · ${safeText(customerRating)}</p>${isOpen ? `<p>${safeText(taskDescriptions[task.id] || t('noExtraDetails'))}</p>` : ''}<div class="activity-item-bottom"><span>${task.budget ? `${safeText(task.pricing_type)} ${t('budget').toLowerCase()}: ${safeText(formatMoney(task.budget, task.currency_code))}` : t('priceByAgreement')}</span>${taskAction}</div></article>`;
    }).join('')
    : `<div class="activity-empty">${t('noTasksMatch')}</div>`;
}

async function taskPaymentError(error) {
  if (error?.context instanceof Response) {
    const body = await error.context.clone().json().catch(() => null);
    if (body && typeof body.error === 'string') return new Error(body.error);
  }
  return error;
}

async function payForTaskAction(
  purpose,
  taskId = null,
  taskPayload = null,
  bookingWorkerId = null
) {
  const pricing = window.TIME2INCOME_CHECKOUT;
  if (!pricing?.requestQuote) {
    throw new Error('Checkout pricing could not load. Refresh and try again.');
  }
  const countryName = accountProfile?.id === currentUser?.id
    ? accountProfile.country
    : currentUser?.user_metadata?.country;
  const quote = await pricing.requestQuote({ countryName, purpose, translate: t });
  if (!quote) throw new Error(t('taskPaymentClosed'));

  const { data: order, error } = await supabaseClient.functions.invoke('create-order', {
    body: {
      currency: quote.currency,
      purpose,
      ...(taskId ? { task_id: taskId } : {}),
      ...(taskPayload ? { task_payload: taskPayload } : {}),
      ...(bookingWorkerId ? { booking_worker_id: bookingWorkerId } : {}),
      country_code: quote.country_code,
      ...(quote.region_code ? { region_code: quote.region_code } : {}),
      ...(quote.service_category ? { service_category: quote.service_category } : {})
    }
  });
  if (error) throw await taskPaymentError(error);
  const walletAmountMinor = Number(order?.wallet_amount_minor) || 0;
  if (!Number.isSafeInteger(order?.amount) ||
      order.amount + walletAmountMinor !== quote.amount_minor) {
    throw new Error('The secure payment total changed. Review the checkout breakdown and try again.');
  }
  const currencyDigits = window.TIME2INCOME_PRICING_CONFIG.fractionDigits[quote.currency] ??
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: quote.currency
    }).resolvedOptions().maximumFractionDigits;
  const quoteTotal = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: quote.currency,
    minimumFractionDigits: currencyDigits,
    maximumFractionDigits: currencyDigits
  }).format(quote.amount_minor / (10 ** currencyDigits));
  const walletApplied = walletAmountMinor > 0
    ? ` · ${t('checkoutWalletApplied').replace('{amount}', new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: quote.currency,
      minimumFractionDigits: currencyDigits,
      maximumFractionDigits: currencyDigits
    }).format(walletAmountMinor / (10 ** currencyDigits)))}`
    : '';
  if (order?.payment_method === 'wallet') {
    if (!order.verified || !order.payment_id ||
        order.purpose !== purpose || (taskId && order.task_id !== taskId)) {
      throw new Error(t('taskPaymentFailed'));
    }
    return order;
  }
  if (!window.Razorpay) throw new Error('Secure checkout could not load. Check your connection and try again.');
  if (!order?.order_id || !order?.key_id) throw new Error('Could not create a secure payment order.');

  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = error => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const checkout = new Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'TIME2INCOME',
      description: `${t(purpose === 'booking' ? 'bookingPaymentDescription' : 'taskPaymentDescription')} · ${quoteTotal}${walletApplied}`,
      order_id: order.order_id,
      prefill: { email: order.user_email },
      theme: { color: '#173969' },
      handler: async response => {
        try {
          const { data, error: verifyError } = await supabaseClient.functions.invoke('verify-payment', {
            body: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
          });
          if (verifyError) throw await taskPaymentError(verifyError);
          if (!data?.verified || data.purpose !== purpose || !data.payment_id ||
              (taskId && data.task_id !== taskId)) {
            throw new Error(t('taskPaymentFailed'));
          }
          settled = true;
          resolve({
            ...data,
            payment_method: 'razorpay',
            wallet_amount_minor: walletAmountMinor
          });
        } catch (error) {
          fail(error);
        }
      },
      modal: {
        ondismiss: () => fail(new Error(t('taskPaymentClosed')))
      }
    });
    checkout.on('payment.failed', event => {
      fail(new Error(event.error?.description || t('taskPaymentFailed')));
    });
    checkout.open();
  });
}

async function openTaskDetails(taskId, button) {
  const task = openTasks.find(item => String(item.id) === taskId);
  if (!task || !currentUser) return;
  button.disabled = true;
  try {
    const confirmed = await confirmT2iAction('task_open', task.id);
    if (!confirmed) return;
    if (!t2iTaskOpenIdempotencyKeys.has(task.id)) {
      t2iTaskOpenIdempotencyKeys.set(task.id, crypto.randomUUID());
    }
    const { data: description, error } = await supabaseClient.rpc('t2i_open_task', {
      p_task_id: task.id,
      p_idempotency_key: t2iTaskOpenIdempotencyKeys.get(task.id)
    });
    if (error) throw error;
    taskDescriptions[task.id] = description || '';
    await renderTaskBoard();
  } catch (error) {
    if (String(error.message || '').includes('T2I_INSUFFICIENT')) {
      toast(t('t2iInsufficientRace'));
    } else {
      console.error('Task could not be opened with T2I:', error);
      toast(error.message || t('t2iConfirmActionError'));
    }
  } finally {
    button.disabled = false;
  }
}

function parseLanguageList(value) {
  return [...new Set(String(value || '').split(',').map(language => language.trim()).filter(Boolean))].slice(0, 12);
}

function openTaskOffer(taskId) {
  selectedTask = openTasks.find(task => String(task.id) === taskId);
  if (!selectedTask || !Object.hasOwn(taskDescriptions, selectedTask.id)) return;
  if (!requireProfilePhoto()) return;
  $('offerForm').reset();
  $('offerTaskTitle').textContent = selectedTask.title;
  $('offerTaskSummary').textContent = `${[selectedTask.city, selectedTask.state, selectedTask.country].filter(Boolean).join(', ') || 'Remote'} · ${taskDescriptions[selectedTask.id] || t('noExtraDetails')}`;
  $('offerCurrency').value = selectedTask.currency_code || preferredCurrency;
  $('offerDialog').showModal();
}

async function submitTaskOffer(event) {
  event.preventDefault();
  if (!currentUser || !selectedTask) return;
  if (!requireProfilePhoto()) return;
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
  if (!requireProfilePhoto()) return;
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
  const roles = ['customer', 'worker'];
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
    await saveAccountProfile(user);
  }
}

async function saveWorkerProfile(event) {
  event.preventDefault();
  if (!currentUser) return;
  const additionalSkillsInput = $('profileAdditionalSkill');
  if (!$('profileAdditionalSkillTags').querySelector('[data-remove-profile-skill]')) {
    additionalSkillsInput.setAttribute('aria-invalid', 'true');
    additionalSkillsInput.focus();
    toast(t('additionalSkillsRequired'));
    return;
  }
  if (!requireProfilePhoto()) return;
  if (!$('workerProfileForm').reportValidity()) return;

  const categoryName = $('profileCategory').value;
  const selectedFiles = Array.from($('profilePortfolioInput')?.files || []);
  const previousImages = Array.isArray(currentWorkerProfile?.portfolio_images)
    ? currentWorkerProfile.portfolio_images
    : [];
  const retainedImages = portfolioImagesDraft.filter(path => previousImages.includes(path));
  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const requiredTextFields = [
    'profileDisplayName', 'profileCountry', 'profileState', 'profileCity',
    'profileHeadline', 'profileCurrency', 'profileLanguages', 'profileBio'
  ];
  const emptyField = requiredTextFields.find(id => !$(id).value.trim());
  if (emptyField) {
    $(emptyField).focus();
    toast(t('providerRequiredFields'));
    return;
  }
  if (!parseLanguageList($('profileLanguages').value).length) {
    $('profileLanguages').focus();
    toast(t('providerRequiredFields'));
    return;
  }
  if (!retainedImages.length && !selectedFiles.length) {
    $('profilePortfolioInput').focus();
    toast(t('providerPortfolioRequired'));
    return;
  }
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
    if (currentWorkerProfile?.is_published !== true) {
      const confirmed = await confirmT2iAction('profile_publish');
      if (!confirmed) return;
    }
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
    const savedSkills = [headline, ...[...$('profileAdditionalSkillTags').querySelectorAll('[data-remove-profile-skill]')]
      .map(button => button.dataset.removeProfileSkill)]
      .map(skill => skill.trim())
      .filter((skill, index, list) => skill && list.findIndex(item =>
        item.toLocaleLowerCase() === skill.toLocaleLowerCase()
      ) === index);
    await saveOwnWorkerProfile(currentUser.id, {
      headline,
      skills: savedSkills,
      bio: $('profileBio').value.trim(),
      service_languages: parseLanguageList($('profileLanguages').value),
      category_id: category.id,
      work_preference: $('profileWorkPreference').value,
      hourly_rate: Number($('profileRate').value),
      currency_code: currency.code,
      portfolio_images: [...retainedImages, ...uploadedPaths],
      service_city: $('profileCity').value.trim() || null,
      service_state: $('profileState').value.trim(),
      service_country: $('profileCountry').value.trim(),
      service_postal_code: $('profilePostalCode').value.trim() || null,
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
    if (String(error.message || '').includes('T2I_INSUFFICIENT')) {
      toast(t('t2iInsufficientRace'));
    } else {
      toast(error.message || t('publishProfileError'));
    }
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
            role: 'both',
            time2income_website_guide_enabled: true,
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
    maybeShowWebsiteGuide(user);
    await Promise.all([loadAccountProfile(), loadRealWorkers(), renderActivity(), renderTaskBoard()]);
    if (document.body.dataset.page === 'wallet' &&
        new URLSearchParams(location.search).get('wallet_view') === 'buy') {
      renderT2iWalletPage('buy');
    }
    toast(t(accountMode === 'signup' ? 'accountCreatedToast' : 'signedInToast'));
  } catch (error) {
    toast(authErrorMessage(error));
  } finally {
    button.disabled = false;
  }
}

async function geocodeTaskLocation(city, state, country) {
  const endpoint = new URL('https://photon.komoot.io/api/');
  endpoint.searchParams.set('q', [city, state, country].filter(Boolean).join(', '));
  endpoint.searchParams.set('limit', '5');
  endpoint.searchParams.set('lang', locale || 'en');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) throw new Error(`Location search failed with status ${response.status}.`);
    const result = await response.json();
    const features = Array.isArray(result.features) ? result.features : [];
    const normalizedCity = city.toLocaleLowerCase();
    const normalizedCountry = country.toLocaleLowerCase();
    const feature = features.find(item => {
      const properties = item.properties || {};
      const cityMatches = [properties.city, properties.town, properties.village, properties.locality,
        properties.municipality, properties.name]
        .some(value => String(value || '').trim().toLocaleLowerCase() === normalizedCity);
      const countryMatches = String(properties.country || '').trim().toLocaleLowerCase() === normalizedCountry ||
        String(properties.countrycode || '').trim().toLocaleLowerCase() === normalizedCountry;
      return cityMatches && countryMatches;
    });
    const coordinates = feature?.geometry?.coordinates || [];
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Location search did not return valid coordinates.');
    }
    return {
      latitude: Math.round(latitude * 100) / 100,
      longitude: Math.round(longitude * 100) / 100
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function saveTaskDemandLocation(taskId, coordinates) {
  const { error } = await supabaseClient.rpc('save_task_demand_location', {
    p_task_id: taskId,
    p_latitude: coordinates?.latitude ?? null,
    p_longitude: coordinates?.longitude ?? null
  });
  if (error) throw error;
}

async function postTask(event) {
  event.preventDefault();
  const requiredFields = [...$('taskForm').querySelectorAll('[required]')];
  requiredFields.forEach(field => {
    field.setCustomValidity(String(field.value || '').trim() ? '' : t('requiredField'));
  });
  if (!requiredFields.every(field => field.checkValidity())) {
    $('taskForm').reportValidity();
    return;
  }
  if (!currentUser) {
    openAccountDialog('signin');
    toast(t('signInDemo'));
    return;
  }
  if (!requireProfilePhoto()) return;
  if (!editingTaskId) {
    const limitResult = await supabaseClient.rpc('get_task_post_limit_status');
    if (limitResult.error) {
      console.error('Task post-limit status could not be checked:', limitResult.error);
      toast(t('taskPostLimitSetupRequired'));
      return;
    }
    const limitStatus = Array.isArray(limitResult.data) ? limitResult.data[0] : limitResult.data;
    if (!limitStatus?.allowed) {
      const nextTime = limitStatus?.next_available_at
        ? formatDateTime(limitStatus.next_available_at)
        : '';
      toast(t('taskPostLimitReached').replace('{time}', nextTime));
      return;
    }
  }

  const city = $('taskLocation').value.trim();
  const state = $('taskState').value.trim();
  const country = $('taskCountry').value.trim();
  const categoryName = $('taskCategory').value;
  const wasEditing = Boolean(editingTaskId);
  let taskId = editingTaskId;
  let demandLocationWarning = false;
  const submitButton = $('taskForm').querySelector('button[type="submit"]');
  submitButton.disabled = true;
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
      state: state || null,
      country: country || null,
      budget: $('taskBudget').value ? Number($('taskBudget').value) : null,
      estimated_hours: $('taskEstimatedHours').value ? Number($('taskEstimatedHours').value) : null,
      scheduled_start: $('taskScheduledStart').value
        ? new Date($('taskScheduledStart').value).toISOString()
        : null
    };
    let taskCoordinates = null;
    if (taskValues.work_mode === 'local') {
      try {
        taskCoordinates = await geocodeTaskLocation(city, state, country);
      } catch (error) {
        demandLocationWarning = true;
        console.warn('Could not resolve the task location for nearby-demand recommendations:', error);
      }
    }

    if (editingTaskId) {
      const { data, error } = await supabaseClient.from('tasks').update(taskValues)
        .eq('id', editingTaskId).eq('customer_id', currentUser.id).eq('status', 'open')
        .select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(t('taskNoLongerEditable'));
      taskId = data.id;
    } else {
      const payloadSnapshot = JSON.stringify(taskValues);
      if (t2iTaskPostPayloadSnapshot !== payloadSnapshot) {
        t2iTaskPostIdempotencyKey = null;
        t2iTaskPostPayloadSnapshot = payloadSnapshot;
      }
      const confirmed = await confirmT2iAction('task_post');
      if (!confirmed) return;
      t2iTaskPostIdempotencyKey ||= crypto.randomUUID();
      const { data, error } = await supabaseClient.rpc('t2i_post_task', {
        p_task: taskValues,
        p_idempotency_key: t2iTaskPostIdempotencyKey
      });
      if (error) throw error;
      taskId = data;
      t2iTaskPostIdempotencyKey = null;
      t2iTaskPostPayloadSnapshot = '';
    }
    if (taskId && (taskValues.work_mode === 'local' || wasEditing)) {
      try {
        await saveTaskDemandLocation(taskId, taskCoordinates);
      } catch (error) {
        demandLocationWarning = true;
        console.warn('Task saved, but its private nearby-demand location could not be updated:', error);
      }
    }

    $('taskForm').reset();
    editingTaskId = null;
    $('taskCurrency').value = preferredCurrency;
    updateTaskBudgetPreview();
    $('taskDialog').close();
    await Promise.all([renderActivity(), renderTaskBoard()]);
    loadNearbyPopularSkills();
    toast(demandLocationWarning
      ? t('taskLocationIndexWarning')
      : t(wasEditing ? 'taskUpdatedToast' : 'posted'));
  } catch (error) {
    if (String(error.message || '').includes('T2I_INSUFFICIENT')) {
      toast(t('t2iInsufficientRace'));
    } else {
      toast(error.message || t('taskPostError'));
    }
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteOwnTask(taskId) {
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
  const { error } = await supabaseClient.rpc('delete_my_open_task', {
    p_task_id: taskId
  });
  if (error) throw error;
  await Promise.all([renderActivity(), renderTaskBoard()]);
  toast(t('taskCancelledToast'));
}

function openWorkerProfile(worker) {
  selectedWorker = worker;
  const isDemo = String(worker.id).startsWith('demo-');
  $('workerDialogName').textContent = worker.name;
  $('workerDialogContent').innerHTML = `
    ${worker.avatarUrl ? `<img class="worker-profile-avatar" src="${safeText(worker.avatarUrl)}" alt="${safeText(worker.name)}" loading="lazy">` : ''}
    <p><strong>${safeText(worker.skill)}</strong> · ${safeText(worker.category || 'Service provider')}</p>
    ${worker.identityVerified ? `<p class="verified-badge">✓ ${t('identityVerifiedBadge')}</p>` : ''}
    <p>${safeText(worker.description || 'No service description provided.')}</p>
    <p>${safeText([
      worker.city,
      worker.country,
      worker.postalCode ? `${t('postalCode')}: ${worker.postalCode}` : ''
    ].filter(Boolean).join(', ') || 'Remote')} · ${safeText(worker.type || 'Remote')}</p>
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
  if (!requireProfilePhoto()) return;
  const bookButton = $('workerDialogBook');
  bookButton.disabled = true;
  try {
    const { data: booking, error } = await supabaseClient.rpc('create_booking_after_payment', {
      p_worker_id: worker.id
    });
    if (error) throw error;
    if (!booking?.id) throw new Error(t('bookingRequestError'));
    $('workerDialog').close();
    await renderActivity();
    toast(t('bookingSentToast'));
  } catch (error) {
    toast(error.message || t('bookingRequestError'));
  } finally {
    bookButton.disabled = false;
  }
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
  if (!requireProfilePhoto()) return;
  await requestBooking(worker);
}

async function handleBookingAction(event) {
  if (!requireProfilePhoto()) return;
  const reviewButton = event.target.closest('[data-booking-review]');
  if (reviewButton) {
    const booking = bookingRecords.find(b => b.id === reviewButton.dataset.bookingReview);
    if (!booking || booking.status !== 'completed' ||
        ![booking.customer_id, booking.worker_id].includes(currentUser.id)) {
      toast(t('reviewPermissionError'));
      return;
    }

    const ratingInput = window.prompt(t('reviewPrompt'), '5');
    if (ratingInput === null) return;
    const rating = Number.parseInt(ratingInput, 10);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast(t('reviewInvalidRating'));
      return;
    }

    const comment = (window.prompt(t('reviewCommentPrompt'), '') || '').trim();
    if (comment.length > 1000) {
      toast(t('reviewCommentTooLong'));
      return;
    }

    reviewButton.disabled = true;
    const { error } = await supabaseClient.rpc('submit_review', {
      p_booking_id: booking.id,
      p_rating: rating,
      p_comment: comment || null
    });
    if (error) {
      reviewButton.disabled = false;
      const message = /already (?:been )?reviewed|duplicate/i.test(error.message || '')
        ? t('reviewAlreadyReviewed')
        : /not eligible|completed booking|sign in/i.test(error.message || '')
          ? t('reviewPermissionError')
          : t('reviewError');
      toast(message);
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
  if (button.dataset.bookingAction === 'accept') {
    const booking = bookingRecords.find(b => b.id === button.dataset.bookingId);
    try {
      if (!booking) throw new Error(t('bookingUpdateError'));
      const rpcArgs = { p_booking_id: booking.id };
      let { data: accepted, error: acceptError } = await supabaseClient.rpc('accept_booking_after_payment', rpcArgs);
      if (acceptError) throw acceptError;
      if (!accepted?.id) {
        await payForTaskAction('booking', null, null, booking.customer_id);
        const retry = await supabaseClient.rpc('accept_booking_after_payment', rpcArgs);
        if (retry.error) throw retry.error;
        accepted = retry.data;
      }
      if (!accepted?.id) throw new Error(t('bookingUpdateError'));
    } catch (error) {
      button.disabled = false;
      toast(error.message || t('bookingUpdateError'));
      return;
    }
    await renderActivity();
    toast(t('status_accepted'));
    return;
  }
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
  const previousUserId = currentUser?.id;
  currentSession = session;
  currentUser = session?.user || null;
  if (currentUser?.id !== previousUserId) {
    marketplaceDataLoadUserId = null;
    marketplaceDataLoadPromise = null;
  }
  if (!currentUser || currentUser.id !== previousUserId) websiteGuideShownForSessionUserId = null;
  window.dispatchEvent(new Event('time2income:accountcountrychange'));
  $('signUpBtn').hidden = Boolean(currentUser);
  $('myProfileBtn').hidden = !currentUser;
  if (currentUser) {
    const metadata = currentUser.user_metadata || {};
    const displayName = String(metadata.full_name || metadata.name || currentUser.email?.split('@')[0] || '').trim();
    const profileButton = $('myProfileBtn');
    if (displayName) {
      profileButton.textContent = displayName;
      profileButton.title = displayName;
      profileButton.setAttribute('aria-label', `My Profile: ${displayName}`);
      Object.assign(profileButton.style, {
        maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      });
    }
  }
  $('walletOpenBtn').hidden = !currentUser;
  $('mobileWalletOpenBtn').hidden = !currentUser;
  const messagesButton = $('messagesHeaderBtn');
  if (messagesButton) messagesButton.hidden = !currentUser;
  if (currentUser && !marketplaceLocationContext) {
    restoreMarketplaceLocationContext(currentUser);
  }
  if (!currentUser) {
    taskDescriptions = {};
    openTasks = [];
    taskOfferStatuses = {};
    if (document.documentElement.classList.contains('location-gateway-active')) {
      document.documentElement.classList.remove('auth-gate');
      return;
    }
    location.replace('auth.html?mode=signin');
    return;
  }
  if (document.documentElement.classList.contains('location-gateway-active')) {
    document.documentElement.classList.remove('auth-gate');
    return;
  }
  if (marketplaceDataLoadUserId === currentUser.id && marketplaceDataLoadPromise) {
    return marketplaceDataLoadPromise;
  }
  const loadingUserId = currentUser.id;
  marketplaceDataLoadUserId = loadingUserId;
  marketplaceDataLoadPromise = (async () => {
    try {
      const oauthProvider = currentUser.app_metadata?.provider;
      const oauthMetadata = currentUser.user_metadata || {};
      if (oauthProvider && oauthProvider !== 'email' && !oauthMetadata.profile_setup_completed
        && !(oauthMetadata.country && oauthMetadata.phone_number)) {
        location.replace('auth.html?mode=signin');
        return;
      }
      const identityRequirement = await window.TIME2INCOME_IDENTITY_DOCUMENTS.getRequirement(currentUser);
      if (identityRequirement.required && !identityRequirement.submitted) {
        location.replace('auth.html?mode=signin&idVerification=required');
        return;
      }
    } catch (error) {
      console.error('Required ID document status could not be checked:', error);
      location.replace('auth.html?mode=signin&idVerification=required');
      return;
    }
    try {
      const suggestionSubmitted = await window.TIME2INCOME_CATALOG.submitSignupSuggestion(currentUser);
      if (suggestionSubmitted) {
        await loadTaskCategories();
        populateSkillSuggestions();
        ['taskSkillCategory', 'profileSkillCategory'].forEach(id => {
          const select = $(id);
          if (select) populateSkillCategorySelect(select, select.value);
        });
        populateTaskCategoryOptions();
        window.dispatchEvent(new Event('time2income:catalogupdated'));
        toast(t('catalogSuggestPending'));
      }
    } catch (error) {
      console.error('Signup catalog suggestion could not be submitted:', error);
      toast(`${t('catalogSuggestError')} ${error.message || ''}`.trim());
    }
    document.documentElement.classList.remove('auth-gate');
    renderAccount();
    maybeShowWebsiteGuide(currentUser);
    if (document.body.dataset.page === 'wallet') {
      renderT2iWalletPage();
      try {
        await loadT2iWalletPage();
      } catch (error) {
        console.error('T2I wallet data could not be loaded:', error);
        const status = $('t2iWalletStatus');
        if (status) status.textContent = `${t('t2iBalanceError')} ${error.message || ''}`.trim();
      }
    }
    await loadTaskCategories();
    await ensureAccountProfile(currentUser);
    try {
      await uploadPendingSignupPhoto(currentUser);
    } catch (error) {
      console.error('Could not upload the pending signup profile photo:', error);
      toast(`${t('profilePhotoError')} ${error.message || ''}`.trim());
    }
    await Promise.all([loadAccountProfile(), loadRealWorkers(), renderActivity(), renderTaskBoard()]);
    if (document.body.dataset.page === 'wallet' &&
        new URLSearchParams(location.search).get('wallet_view') === 'buy') {
      renderT2iWalletPage('buy');
    }
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
    if (marketplaceDataLoadUserId === loadingUserId) {
      marketplaceDataLoadUserId = null;
      marketplaceDataLoadPromise = null;
    }
  });
  return marketplaceDataLoadPromise;
}

async function initializeApp() {
  await window.TIME2INCOME_CATALOG_READY;
  const mobileNavToggle = $('mobileNavToggle');
  const mainNavigation = $('mainNavigation');
  window.addEventListener('popstate', () => {
    if (document.body.dataset.page !== 'wallet') return;
    renderT2iWalletPage();
    loadT2iWalletPage().catch(error => {
      console.error('T2I wallet could not be restored from browser history:', error);
      const status = $('t2iWalletStatus');
      if (status) status.textContent = `${t('t2iBalanceError')} ${error.message || ''}`.trim();
    });
  });
  const closeMobileNavigation = () => {
    document.querySelector('.topbar').classList.remove('mobile-nav-open');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    mobileNavToggle.setAttribute('aria-label', 'Open navigation menu');
  };
  mobileNavToggle.addEventListener('click', () => {
    const isOpen = mobileNavToggle.getAttribute('aria-expanded') === 'true';
    document.querySelector('.topbar').classList.toggle('mobile-nav-open', !isOpen);
    mobileNavToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileNavToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  });
  mainNavigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMobileNavigation();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavToggle.getAttribute('aria-expanded') === 'true') {
      closeMobileNavigation();
      mobileNavToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMobileNavigation();
  });
  const requestedPage = new URLSearchParams(location.search).get('page');
  const workspacePages = new Set(['marketplace', 'tasks', 'activity', 'profile', 'guides', 'wallet']);
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
    profile: 'Profile',
    guides: 'Guide',
    wallet: 'My Wallet'
  };
  document.title = `${pageTitles[page]} | TIME2INCOME`;
  populateGlobalPickers();
  populateSkillSuggestions();
  populateTaskCategoryOptions();
  if (window.TIME2INCOME_CATALOG_READY) {
    window.TIME2INCOME_CATALOG_READY.then(() => {
      populateSkillSuggestions();
      populateTaskCategoryOptions();
    });
  }
  setupTaskSkillCategoryFilter();
  setupSkillCatalog();
  setupPersonalizedCategories();
  updateMarketplaceSuggestions();
  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('time2income_language') || 'en';
    preferredCurrency = window.TIME2INCOME_CURRENCY.resolveCurrency(localStorage.getItem('time2income_currency'))?.code || 'INR';
  } catch (error) {
    console.warn('Could not load saved localization preferences:', error);
  }
  $('currencySelector').value = preferredCurrency;
  updateHeaderCurrencySymbol(preferredCurrency);
  $('accountCurrency').value = preferredCurrency;
  $('taskCurrency').value = preferredCurrency;
  $('offerCurrency').value = preferredCurrency;
  applyLanguage(savedLanguage, false);
  if (page === 'wallet') renderT2iWalletPage();
  if (marketplaceLocationContext) {
    $('locationInput').value = window.TIME2INCOME_LOCATION.formatLabel(marketplaceLocationContext);
    $('taskCityFilter').value = getTaskLocationFilterValue();
    $('searchLocationStatus').textContent = searchLocationCoordinates ? t('searchLocationActive') : '';
  }
  loadNearbyPopularSkills();
  refreshExchangeRates();
  setInterval(() => refreshExchangeRates(true), 6 * 60 * 60 * 1000);
  renderAccount();
  renderActivity().catch(error => console.error('Activity load failed:', error));

  const handleLanguagePicker = event => {
    const language = resolveLanguage(event.target.value);
    if (language) applyLanguage(language.code);
  };
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
    $('taskForm').querySelectorAll('[required]').forEach(field => field.setCustomValidity(''));
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
      loadNearbyPopularSkills(searchLocationCoordinates);
    } catch (error) {
      status.textContent = error.message || t('searchLocationFailed');
    } finally {
      button.disabled = false;
    }
  });
  let marketplaceSearchTimer = null;
  let marketplaceLocationSearchTimer = null;
  let marketplaceLocationSearchController = null;
  let marketplaceLocationSuggestionsData = [];
  let activeMarketplaceLocationSuggestion = -1;
  const marketplaceLocationSuggestions = $('marketplaceLocationSuggestions');
  const closeMarketplaceLocationSuggestions = () => {
    marketplaceLocationSuggestions.hidden = true;
    $('locationInput').setAttribute('aria-expanded', 'false');
    $('locationInput').removeAttribute('aria-activedescendant');
    activeMarketplaceLocationSuggestion = -1;
  };
  const selectMarketplaceLocation = location => {
    marketplaceLocationContext = location;
    searchLocationCoordinates = Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude)
      ? { latitude:location.latitude, longitude:location.longitude }
      : null;
    $('locationInput').value = window.TIME2INCOME_LOCATION.formatSearchLabel(location);
    $('taskCityFilter').value = getTaskLocationFilterValue();
    closeMarketplaceLocationSuggestions();
    $('searchLocationStatus').textContent = searchLocationCoordinates
      ? t('searchLocationActive')
      : '';
    const locationLink = $('locationContextLink');
    locationLink.querySelector('small').textContent =
      [location.city, location.country].filter(Boolean).join(', ');
    locationLink.hidden = false;
    try {
      window.TIME2INCOME_LOCATION.saveSelected(location);
    } catch (error) {
      console.warn('Could not save the selected marketplace location:', error);
      toast(error.message);
    }
    if (currentUser) {
      saveMarketplaceLocationToAccount(accountProfile).catch(error => {
        console.error('Could not save the selected marketplace location to the account:', error);
        toast(error.message || t('searchLocationFailed'));
      });
    }
    renderWorkers();
    if (mode === 'work') renderTaskBoard().catch(error => toast(error.message));
    loadNearbyPopularSkills(searchLocationCoordinates);
    renderMarketplaceFilterSummary();
  };
  const renderMarketplaceLocationSuggestions = locations => {
    marketplaceLocationSuggestionsData = locations;
    activeMarketplaceLocationSuggestion = -1;
    marketplaceLocationSuggestions.replaceChildren(...locations.map((location, index) => {
      const option = document.createElement('button');
      option.className = 'marketplace-location-suggestion';
      option.type = 'button';
      option.id = `marketplace-location-suggestion-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const title = document.createElement('strong');
      title.textContent = location.city || location.postalCode || location.country;
      const details = document.createElement('small');
      details.textContent = [
        location.postalCode && location.postalCode !== location.city ? location.postalCode : '',
        location.state,
        location.country
      ].filter(Boolean).join(', ');
      option.append(title, details);
      option.addEventListener('click', () => selectMarketplaceLocation(location));
      return option;
    }));
    marketplaceLocationSuggestions.hidden = locations.length === 0;
    $('locationInput').setAttribute('aria-expanded', String(locations.length > 0));
  };
  const headerLocationLink = $('locationContextLink');
  const headerLocationEditor = $('headerLocationEditor');
  const headerLocationSearch = $('headerLocationSearch');
  const headerLocationSuggestions = $('headerLocationSuggestions');
  const headerLocationStatus = $('headerLocationStatus');
  let headerLocationSearchTimer = null;
  let headerLocationSearchController = null;
  let headerLocationSuggestionsData = [];
  let activeHeaderLocationSuggestion = -1;
  const closeHeaderLocationEditor = () => {
    clearTimeout(headerLocationSearchTimer);
    if (headerLocationSearchController) headerLocationSearchController.abort();
    headerLocationEditor.hidden = true;
    headerLocationLink.setAttribute('aria-expanded', 'false');
    headerLocationSearch.setAttribute('aria-expanded', 'false');
    headerLocationSearch.removeAttribute('aria-activedescendant');
    headerLocationSuggestions.hidden = true;
    activeHeaderLocationSuggestion = -1;
  };
  const positionHeaderLocationEditor = () => {
    const anchor = headerLocationLink.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    const left = Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12));
    const top = Math.max(8, Math.min(anchor.bottom + 8, window.innerHeight - 280));
    headerLocationEditor.style.left = `${left}px`;
    headerLocationEditor.style.top = `${top}px`;
    headerLocationEditor.style.width = `${width}px`;
  };
  const openHeaderLocationEditor = () => {
    headerLocationEditor.hidden = false;
    headerLocationLink.setAttribute('aria-expanded', 'true');
    headerLocationSearch.value = '';
    headerLocationSuggestions.replaceChildren();
    headerLocationSuggestions.hidden = true;
    headerLocationSuggestionsData = [];
    activeHeaderLocationSuggestion = -1;
    headerLocationSearch.setAttribute('aria-expanded', 'false');
    headerLocationStatus.textContent = 'Enter a city or postal code to search.';
    delete headerLocationStatus.dataset.state;
    positionHeaderLocationEditor();
    headerLocationSearch.focus();
  };
  const selectHeaderLocation = location => {
    selectMarketplaceLocation(location);
    closeHeaderLocationEditor();
  };
  const renderHeaderLocationSuggestions = locations => {
    headerLocationSuggestionsData = locations;
    activeHeaderLocationSuggestion = -1;
    headerLocationSuggestions.replaceChildren(...locations.map((location, index) => {
      const option = document.createElement('button');
      option.className = 'header-location-editor-option';
      option.type = 'button';
      option.id = `header-location-option-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const title = document.createElement('strong');
      title.textContent = location.city || location.postalCode || location.country;
      const details = document.createElement('small');
      details.textContent = [
        location.postalCode && location.postalCode !== location.city ? location.postalCode : '',
        location.state,
        location.country
      ].filter(Boolean).join(', ');
      option.append(title, details);
      option.addEventListener('click', () => selectHeaderLocation(location));
      return option;
    }));
    headerLocationSuggestions.hidden = locations.length === 0;
    headerLocationSearch.setAttribute('aria-expanded', String(locations.length > 0));
  };
  headerLocationLink.addEventListener('click', event => {
    event.preventDefault();
    if (headerLocationEditor.hidden) openHeaderLocationEditor();
    else closeHeaderLocationEditor();
  });
  headerLocationSearch.addEventListener('input', () => {
    clearTimeout(headerLocationSearchTimer);
    if (headerLocationSearchController) headerLocationSearchController.abort();
    headerLocationSuggestions.hidden = true;
    headerLocationSuggestions.replaceChildren();
    headerLocationSuggestionsData = [];
    activeHeaderLocationSuggestion = -1;
    headerLocationSearch.removeAttribute('aria-activedescendant');
    headerLocationSearch.setAttribute('aria-expanded', 'false');
    const locationQuery = headerLocationSearch.value.trim();
    if (locationQuery.length < 2) {
      headerLocationStatus.textContent = locationQuery ? 'Enter at least 2 characters.' : 'Enter a city or postal code to search.';
      delete headerLocationStatus.dataset.state;
      return;
    }

    headerLocationStatus.textContent = 'Searching locations…';
    delete headerLocationStatus.dataset.state;
    const preferredCountry = marketplaceLocationContext?.country ||
      window.TIME2INCOME_LOCATION.getSelected()?.country || '';
    const geocodingQuery = /^\d[\d\s-]*$/.test(locationQuery) && preferredCountry
      ? `${locationQuery}, ${preferredCountry}`
      : locationQuery;
    headerLocationSearchTimer = setTimeout(async () => {
      headerLocationSearchController = new AbortController();
      try {
        const locations = await window.TIME2INCOME_LOCATION.search(
          geocodingQuery,
          headerLocationSearchController.signal
        );
        if (headerLocationSearch.value.trim() !== locationQuery) return;
        const normalizedQuery = locationQuery.toLocaleLowerCase();
        const uniqueLocations = [...new Map(locations.map(location => [
          [
            location.city,
            location.postalCode,
            location.state,
            location.country
          ].join('|').toLocaleLowerCase(),
          location
        ])).values()];
        uniqueLocations.sort((a, b) =>
          Number(b.postalCode.toLocaleLowerCase() === normalizedQuery) -
            Number(a.postalCode.toLocaleLowerCase() === normalizedQuery)
        );
        const matches = uniqueLocations.slice(0, 6);
        renderHeaderLocationSuggestions(matches);
        headerLocationStatus.textContent = matches.length
          ? 'Choose a location to update nearby results.'
          : 'No locations found. Try a city or postal code.';
        if (!matches.length) headerLocationStatus.dataset.state = 'error';
        else delete headerLocationStatus.dataset.state;
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Header location search failed:', error);
        headerLocationStatus.textContent = error.message || t('searchLocationFailed');
        headerLocationStatus.dataset.state = 'error';
      }
    }, 350);
  });
  headerLocationSearch.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeHeaderLocationEditor();
      headerLocationLink.focus();
      return;
    }
    if (headerLocationSuggestions.hidden || !headerLocationSuggestionsData.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const count = headerLocationSuggestionsData.length;
      activeHeaderLocationSuggestion =
        (activeHeaderLocationSuggestion + (event.key === 'ArrowDown' ? 1 : -1) + count) % count;
      headerLocationSuggestions.querySelectorAll('[role="option"]').forEach((option, index) => {
        const active = index === activeHeaderLocationSuggestion;
        option.setAttribute('aria-selected', String(active));
        if (active) option.scrollIntoView({ block: 'nearest' });
      });
      headerLocationSearch.setAttribute(
        'aria-activedescendant',
        `header-location-option-${activeHeaderLocationSuggestion}`
      );
    } else if (event.key === 'Enter') {
      const location = headerLocationSuggestionsData[activeHeaderLocationSuggestion] ||
        headerLocationSuggestionsData.find(candidate =>
          candidate.postalCode.toLocaleLowerCase() === headerLocationSearch.value.trim().toLocaleLowerCase()
        );
      if (location) {
        event.preventDefault();
        selectHeaderLocation(location);
      }
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!headerLocationEditor.hidden &&
        !headerLocationEditor.contains(event.target) &&
        !headerLocationLink.contains(event.target)) closeHeaderLocationEditor();
  });
  window.addEventListener('resize', () => {
    if (!headerLocationEditor.hidden) positionHeaderLocationEditor();
  });
  window.addEventListener('scroll', () => {
    if (!headerLocationEditor.hidden) positionHeaderLocationEditor();
  }, true);
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
    const enteredPostalCode = $('locationInput').value.trim().toLocaleLowerCase();
    const exactPostalLocation = marketplaceLocationSuggestionsData.find(location =>
      location.postalCode.toLocaleLowerCase() === enteredPostalCode
    );
    if (!marketplaceLocationContext && exactPostalLocation) {
      selectMarketplaceLocation(exactPostalLocation);
    }
    const value = $('searchInput').value.trim();
    const matchedCategory = resolveMarketplaceCategory(value);
    if (mode === 'work') {
      const matchedSkillCategory = resolveSkillCategory(value);
      $('taskCategoryFilter').value = matchedCategory?.name || matchedSkillCategory;
      $('taskCityFilter').value = getTaskLocationFilterValue();
      setTaskSkillFilter(matchedCategory || matchedSkillCategory ? '' : value);
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
  const applyProviderSearch = (scrollToResults = false) => {
    const value = $('providerSearchInput').value.trim();
    query = value;
    activeCategory = '';
    activeCategoryId = '';
    $('searchInput').value = value;
    syncCategoryCards();
    updateMarketplaceSuggestions();
    renderWorkers();
    if (scrollToResults) {
      $('workerGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (workerDirectoryState === 'error') toast(t('providersLoadFailed'));
    }
  };
  let providerSearchTimer = null;
  $('providerSearchInput').addEventListener('input', () => {
    clearTimeout(providerSearchTimer);
    providerSearchTimer = setTimeout(() => applyProviderSearch(), 180);
  });
  $('providerSearchForm').addEventListener('submit', event => {
    event.preventDefault();
    clearTimeout(providerSearchTimer);
    applyProviderSearch(true);
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
      const matchedSkillCategory = resolveSkillCategory(value);
      $('taskCategoryFilter').value = matchedCategory?.name || matchedSkillCategory;
      setTaskSkillFilter(matchedCategory || matchedSkillCategory ? '' : value);
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
    clearTimeout(marketplaceLocationSearchTimer);
    if (marketplaceLocationSearchController) marketplaceLocationSearchController.abort();
    const preferredLocationCountry = marketplaceLocationContext?.country ||
      window.TIME2INCOME_LOCATION.getSelected()?.country || '';
    closeMarketplaceLocationSuggestions();
    searchLocationCoordinates = null;
    marketplaceLocationContext = null;
    $('searchLocationStatus').textContent = '';
    const locationQuery = $('locationInput').value.trim();
    if (mode === 'work') {
      $('taskCityFilter').value = getTaskLocationFilterValue();
      marketplaceSearchTimer = setTimeout(() => {
        renderTaskBoard().catch(error => toast(error.message));
      }, 180);
    } else {
      marketplaceSearchTimer = setTimeout(renderWorkers, 180);
    }
    if (locationQuery.length < 2 || /^remote$/i.test(locationQuery)) return;
    const geocodingQuery = /^\d[\d\s-]*$/.test(locationQuery) && preferredLocationCountry
      ? `${locationQuery}, ${preferredLocationCountry}`
      : locationQuery;
    marketplaceLocationSearchTimer = setTimeout(async () => {
      marketplaceLocationSearchController = new AbortController();
      try {
        const locations = await window.TIME2INCOME_LOCATION.search(
          geocodingQuery,
          marketplaceLocationSearchController.signal
        );
        if ($('locationInput').value.trim() !== locationQuery) return;
        const normalizedQuery = locationQuery.toLocaleLowerCase();
        const uniqueLocations = [...new Map(locations.map(location => [
          [
            location.city,
            location.postalCode,
            location.state,
            location.country
          ].join('|').toLocaleLowerCase(),
          location
        ])).values()];
        uniqueLocations.sort((a, b) =>
          Number(b.postalCode.toLocaleLowerCase() === normalizedQuery) -
            Number(a.postalCode.toLocaleLowerCase() === normalizedQuery)
        );
        renderMarketplaceLocationSuggestions(uniqueLocations.slice(0, 6));
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Marketplace location suggestions could not be loaded:', error);
        closeMarketplaceLocationSuggestions();
        $('searchLocationStatus').textContent = error.message || t('searchLocationFailed');
      }
    }, 350);
  });
  $('locationInput').addEventListener('keydown', event => {
    if (marketplaceLocationSuggestions.hidden) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const count = marketplaceLocationSuggestionsData.length;
      activeMarketplaceLocationSuggestion =
        (activeMarketplaceLocationSuggestion + (event.key === 'ArrowDown' ? 1 : -1) + count) % count;
      marketplaceLocationSuggestions.querySelectorAll('[role="option"]').forEach((option, index) => {
        const active = index === activeMarketplaceLocationSuggestion;
        option.setAttribute('aria-selected', String(active));
        if (active) option.scrollIntoView({ block:'nearest' });
      });
      $('locationInput').setAttribute(
        'aria-activedescendant',
        `marketplace-location-suggestion-${activeMarketplaceLocationSuggestion}`
      );
    } else if (event.key === 'Enter') {
      const location = activeMarketplaceLocationSuggestion >= 0
        ? marketplaceLocationSuggestionsData[activeMarketplaceLocationSuggestion]
        : marketplaceLocationSuggestionsData.find(candidate =>
          candidate.postalCode.toLocaleLowerCase() ===
            $('locationInput').value.trim().toLocaleLowerCase()
        );
      if (location) {
        event.preventDefault();
        selectMarketplaceLocation(location);
      }
    } else if (event.key === 'Escape') {
      closeMarketplaceLocationSuggestions();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!marketplaceLocationSuggestions.contains(event.target) &&
        event.target !== $('locationInput')) closeMarketplaceLocationSuggestions();
  });
  $('locationInput').addEventListener('change', () => {
    if (mode === 'work') $('taskCityFilter').value = getTaskLocationFilterValue();
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
    loadNearbyPopularSkills();
  });
  $('popularSkillList').addEventListener('click', event => {
    const button = event.target.closest('.chip');
    if (!button) return;
    $('searchInput').value = button.dataset.query;
    if (mode === 'work') {
      $('taskCategoryFilter').value = '';
      setTaskSkillFilter(button.dataset.query);
      renderTaskBoard().catch(error => toast(error.message));
      renderMarketplaceFilterSummary();
      return;
    }
    query = button.dataset.query;
    $('providerSearchInput').value = button.dataset.query;
    activeCategoryId = '';
    activeCategory = '';
    syncCategoryCards();
    renderWorkers();
    renderMarketplaceFilterSummary();
  });
  document.querySelectorAll('.category-card').forEach(button => {
    button.addEventListener('click', () => {
      const category = resolveMarketplaceCategory(button.dataset.category);
      if (mode === 'work') {
        $('taskCategoryFilter').value = category?.name || '';
        $('taskCityFilter').value = getTaskLocationFilterValue();
        setTaskSkillFilter('');
        renderTaskBoard().catch(error => toast(error.message));
        $('taskBoardPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      activeCategoryId = category?.id || '';
      activeCategory = category?.name || '';
      query = '';
      $('searchInput').value = '';
      $('providerSearchInput').value = '';
      syncCategoryCards();
      updateMarketplaceSuggestions();
      renderWorkers();
      const relatedSkills = $('categoryRelatedSkills');
      (relatedSkills && !relatedSkills.hidden
        ? relatedSkills
        : document.querySelector('.featured-section')
      ).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  $('typeFilter').addEventListener('change', renderWorkers);
  $('sortFilter').addEventListener('change', renderWorkers);
  ['experienceFilter', 'salaryRange'].forEach(id => {
    const control = $(id);
    control?.addEventListener('input', () => {
      if (id === 'salaryRange') $('salaryRangeLabel').textContent = `₹0 – ₹${Number(control.value).toLocaleString('en-IN')}`;
      renderWorkers();
    });
    control?.addEventListener('change', renderWorkers);
  });
  document.querySelectorAll('input[name="scheduleFilter"], input[name="employmentFilter"], input[name="levelFilter"]').forEach(control => control.addEventListener('change', renderWorkers));
  $('clearJobsFilters')?.addEventListener('click', () => {
    document.querySelectorAll('input[name="scheduleFilter"], input[name="employmentFilter"], input[name="levelFilter"]').forEach(input => input.checked = true);
    $('experienceFilter').value = 'all'; $('salaryRange').value = '90000'; $('salaryRangeLabel').textContent = '₹0 – ₹90,000';
    $('typeFilter').value = 'all'; $('sortFilter').value = 'recommended'; $('providerSearchInput').value = ''; query = ''; renderWorkers();
  });
  $('toggleJobsFilters')?.addEventListener('click', () => document.querySelector('.jobs-sidebar')?.classList.toggle('is-collapsed'));
  $('workerGrid')?.addEventListener('click', event => {
    if (event.target.closest('#finderPostTask')) $('postTaskBoardBtn')?.click();
  });
  $('clearFilters').addEventListener('click', () => {
    query = '';
    activeCategory = '';
    activeCategoryId = '';
    setTaskSkillFilter('');
    $('searchInput').value = '';
    $('providerSearchInput').value = '';
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
      setTaskSkillFilter('');
      updateMarketplaceSuggestions();
      renderWorkers();
      renderMarketplaceFilterSummary();
    }
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
  $('reportBookingForm').addEventListener('submit', submitBookingChatReport);
  $('reportBookingChatBtn').addEventListener('click', () => {
    if (activeBookingChatId) $('reportBookingDialog').showModal();
  });
  $('blockBookingChatBtn').addEventListener('click', () => {
    blockActiveBookingChat().catch(error => {
      $('blockBookingChatBtn').disabled = false;
      toast(error.message || t('chatBlockError'));
    });
  });
  const closeChatSafetyDialog = () => {
    pendingSafetyBookingId = null;
    $('chatSafetyDialog').close();
  };
  $('closeChatSafetyDialog').addEventListener('click', closeChatSafetyDialog);
  $('cancelChatSafety').addEventListener('click', closeChatSafetyDialog);
  $('chatSafetyDialog').addEventListener('cancel', () => {
    pendingSafetyBookingId = null;
  });
  $('acceptChatSafety').addEventListener('click', () => {
    const bookingId = pendingSafetyBookingId;
    pendingSafetyBookingId = null;
    $('chatSafetyDialog').close();
    if (!bookingId || !currentUser) return;
    try {
      localStorage.setItem(`time2income_chat_safety_v1_${currentUser.id}_${bookingId}`, 'accepted');
    } catch (error) {
      console.warn('Could not save the chat safety acknowledgement:', error);
    }
    const booking = bookingRecords.find(record => record.id === bookingId);
    if (booking) beginBookingChat(booking).catch(error => toast(error.message || t('chatLoadError')));
  });
  $('closeReportBookingDialog').addEventListener('click', () => $('reportBookingDialog').close());
  $('cancelReportBooking').addEventListener('click', () => $('reportBookingDialog').close());
  $('bookingChatFileInput').addEventListener('change', handleChatFileSelection);
  $('bookingChatSelectedFiles').addEventListener('click', event => {
    const removeButton = event.target.closest('.booking-chat-remove-file');
    if (!removeButton) return;
    const index = Number(removeButton.dataset.chatFileIndex);
    removeSelectedChatFile(index);
  });
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
    const deleteButton = event.target.closest('[data-task-delete]');
    if (deleteButton) {
      deleteOwnTask(deleteButton.dataset.taskDelete).catch(error => toast(error.message));
      return;
    }
    handleTaskOfferAction(event).catch(error => toast(error.message));
  });
  $('openTaskList').addEventListener('click', event => {
    const openButton = event.target.closest('[data-open-task]');
    if (openButton) {
      openTaskDetails(openButton.dataset.openTask, openButton);
      return;
    }
    const offerButton = event.target.closest('[data-open-task-offer]');
    if (offerButton) openTaskOffer(offerButton.dataset.openTaskOffer);
  });
  $('taskCityFilter').addEventListener('input', () => {
    renderTaskBoard().catch(error => toast(error.message));
  });
  let skillRefreshTimer = null;
  $('taskSkillFilter').addEventListener('input', () => {
    setTaskSkillFilter($('taskSkillFilter').value);
    clearTimeout(skillRefreshTimer);
    skillRefreshTimer = setTimeout(refreshTaskBoardForSkill, 180);
  });
  $('taskSkillFilter').addEventListener('change', () => {
    clearTimeout(skillRefreshTimer);
    refreshTaskBoardForSkill();
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
    if (event.target.id === 'profilePhotoForm') submitProfilePhoto(event);
    if (event.target.id === 'identityVerificationForm') submitIdentityVerification(event);
    if (event.target.id === 'privacyRequestForm') submitPrivacyRequest(event);
  });
  $('walletOpenBtn').addEventListener('click', openWalletPage);
  $('mobileWalletOpenBtn').addEventListener('click', openWalletPage);
  $('t2iWalletContent').addEventListener('submit', event => {
    if (event.target.id === 't2iAdminServiceForm' ||
        event.target.id === 't2iAdminRegionalForm') {
      submitT2iAdminSettings(event);
    } else if (event.target.id === 't2iTransferForm') {
      submitT2iTransfer(event);
    }
  });
  $('t2iWalletContent').addEventListener('input', event => {
    if (event.target.id === 't2iRecipientCode') {
      event.target.setCustomValidity('');
      t2iTransferAttempt = null;
    } else if (event.target.id === 't2iTransferAmount') {
      t2iTransferAttempt = null;
    }
  });
  $('t2iWalletContent').addEventListener('click', event => {
    const walletViewButton = event.target.closest('[data-t2i-wallet-view]');
    if (walletViewButton) {
      setT2iWalletView(walletViewButton.dataset.t2iWalletView);
      return;
    }
    const walletActionButton = event.target.closest('[data-t2i-wallet-action]');
    if (walletActionButton) {
      const sendPanel = $('t2iSendPanel');
      const receivePanel = $('t2iReceivePanel');
      const isSending = walletActionButton.dataset.t2iWalletAction === 'send';
      sendPanel.hidden = !isSending;
      receivePanel.hidden = isSending;
      $('t2iSendActionButton').setAttribute('aria-expanded', String(isSending));
      $('t2iReceiveActionButton').setAttribute('aria-expanded', String(!isSending));
      const panel = isSending ? sendPanel : receivePanel;
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (isSending) $('t2iRecipientCode').focus({ preventScroll: true });
      return;
    }
    if (event.target.closest('#t2iCopyCodeBtn')) {
      copyT2iTransferCode();
      return;
    }
    if (event.target.closest('#t2iCelebrationClose')) {
      clearTimeout(t2iCelebrationTimer);
      $('t2iRewardCelebration').hidden = true;
      return;
    }
    const refreshButton = event.target.closest('#refreshT2iWalletBtn');
    if (!refreshButton) return;
    refreshButton.disabled = true;
    loadT2iWalletPage().catch(error => {
      console.error('T2I wallet could not be refreshed:', error);
      const status = $('t2iWalletStatus');
      if (status) status.textContent = `${t('t2iBalanceError')} ${error.message || ''}`.trim();
      toast(t('t2iBalanceError'));
    }).finally(() => {
      if (refreshButton.isConnected) refreshButton.disabled = false;
    });
  });
  $('walletDialog').addEventListener('change', event => {
    if (event.target.id !== 'walletEvidenceFile') return;
    const file = event.target.files?.[0];
    $('walletEvidenceFileName').textContent = file
      ? `${t('walletEvidenceFileReady')}: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      : '';
  });
  $('walletDialog').addEventListener('submit', event => {
    if (event.target.id === 'walletCreditRequestForm') {
      submitWalletCreditRequest(event).catch(error => {
        console.error('Wallet support request could not be submitted:', error);
        const status = $('walletStatus');
        if (status) status.textContent = error.message || t('walletRequestFailed');
        toast(error.message || t('walletRequestFailed'));
      });
    }
  });
  $('walletDialog').addEventListener('click', event => {
    const refreshWalletButton = event.target.closest('#refreshWalletBtn');
    if (refreshWalletButton) {
      refreshWalletButton.disabled = true;
      loadWalletData().catch(error => {
        console.error('Wallet data could not be refreshed:', error);
        const status = $('walletStatus');
        const message = walletLoadErrorMessage(error);
        if (status) status.textContent = message;
        toast(message);
      }).finally(() => {
        if (refreshWalletButton.isConnected) refreshWalletButton.disabled = false;
      });
      return;
    }
    const walletReviewButton = event.target.closest('[data-wallet-review]');
    if (walletReviewButton) {
      walletReviewButton.disabled = true;
      reviewWalletCreditRequest(walletReviewButton).catch(error => {
        console.error('Wallet credit request review failed:', error);
        const status = $('walletStatus');
        if (status) status.textContent = error.message || t('walletRequestFailed');
        toast(error.message || t('walletRequestFailed'));
      }).finally(() => {
        if (walletReviewButton.isConnected) walletReviewButton.disabled = false;
      });
    }
  });
  $('accountSummary').addEventListener('change', event => {
    if (event.target.id === 'profilePhotoInput') updateProfilePhotoPreview(event.target);
    if (event.target.id === 'identitySelfieInput') updateIdentitySelfiePreview(event.target);
    if (event.target.id === 'nearbyAlertLocationConsent') {
      $('enableNearbyAlertsBtn').disabled = !event.target.checked
        || Boolean(nearbyAlertPreferencesError)
        || !taskCategories.length;
    }
  });
  $('accountSummary').addEventListener('keydown', event => {
    if (event.target.id === 'profileAdditionalSkill' && event.key === 'Enter') {
      event.preventDefault();
      addAdditionalProfileSkill();
    }
  });
  $('accountSummary').addEventListener('click', event => {
    const alertButton = event.target.closest('#enableNearbyAlertsBtn, #enableNearbyPushBtn, #disableNearbyAlertsBtn');
    if (alertButton) {
      alertButton.disabled = true;
      const action = alertButton.id === 'enableNearbyAlertsBtn'
        ? enableNearbyAlerts
        : alertButton.id === 'enableNearbyPushBtn'
          ? enableNearbyBrowserPush
          : disableNearbyAlerts;
      action().catch(error => {
        const status = $('nearbyAlertStatus');
        if (status) status.textContent = error.message || t('nearbyAlertsLocationFailed');
        toast(error.message || t('nearbyAlertsLocationFailed'));
      }).finally(() => {
        if (alertButton.isConnected) alertButton.disabled = false;
      });
      return;
    }
    if (event.target.closest('#addProfileSkillBtn')) {
      addAdditionalProfileSkill();
      return;
    }
    const removeProfileSkillButton = event.target.closest('[data-remove-profile-skill]');
    if (removeProfileSkillButton) {
      removeProfileSkillButton.closest('.profile-skill-chip').remove();
      const additionalSkillsInput = $('profileAdditionalSkill');
      if (additionalSkillsInput.hasAttribute('aria-invalid') &&
          !$('profileAdditionalSkillTags').querySelector('[data-remove-profile-skill]')) {
        additionalSkillsInput.setAttribute('aria-invalid', 'true');
      }
      return;
    }
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
  $('previousWebsiteGuideStep').addEventListener('click', () => {
    if (websiteGuideStep === 0) return;
    websiteGuideStep -= 1;
    renderWebsiteGuideStep();
  });
  $('nextWebsiteGuideStep').addEventListener('click', () => {
    if (websiteGuideStep === websiteGuideSteps.length - 1) {
      closeWebsiteGuide().catch(error => {
        console.error('Could not save the website guide preference:', error);
        $('websiteGuideStatus').textContent = t('websiteGuideSaveError');
        toast(t('websiteGuideSaveError'));
      });
      return;
    }
    websiteGuideStep += 1;
    renderWebsiteGuideStep();
  });
  const dismissWebsiteGuide = () => {
    closeWebsiteGuide().catch(error => {
      console.error('Could not save the website guide preference:', error);
      $('websiteGuideStatus').textContent = t('websiteGuideSaveError');
      toast(t('websiteGuideSaveError'));
    });
  };
  $('skipWebsiteGuide').addEventListener('click', dismissWebsiteGuide);
  $('closeWebsiteGuide').addEventListener('click', dismissWebsiteGuide);
  $('websiteGuideDialog').addEventListener('cancel', event => {
    event.preventDefault();
    dismissWebsiteGuide();
  });
  $('accountForm').addEventListener('submit', handleAccountSubmit);
  $('forgotPasswordBtn').addEventListener('click', sendPasswordReset);
  $('closeAccountDialog').addEventListener('click', () => $('accountDialog').close());
  $('cancelAccount').addEventListener('click', () => $('accountDialog').close());
  $('closeWalletDialog').addEventListener('click', () => $('walletDialog').close());
  $('postTaskBoardBtn').addEventListener('click', openTaskDialog);
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

initializeApp().catch(error => {
  console.error('Application initialization failed:', error);
  toast(`Application initialization failed: ${error.message || error}`);
});
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
    const highlightedAmount = document.createElement('span');
    highlightedAmount.className = 'income-calc-result-amount';
    highlightedAmount.textContent = amount;
    out.replaceChildren(
      document.createTextNode(`${t('incomeEstimate')}: `),
      highlightedAmount,
      document.createTextNode(` ${t('perMonth')} (${t('estimateDisclaimer')})`)
    );
  }
  [hours, rate, weeks].forEach(el => el.addEventListener('input', update));
  window.addEventListener('time2income:displaychange', update);
  update();
})();

(async function setupIncomeFinder() {
  await window.TIME2INCOME_CATALOG_READY;
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
  const broadSkillOptions = [
    { value:'digital', label:'skillDigital' },
    { value:'teaching', label:'skillTeaching' },
    { value:'home', label:'skillHome' },
    { value:'driving', label:'skillDriving' },
    { value:'people', label:'skillPeople' }
  ];
  const skillIdeaGroups = [
    { group:'teaching', pattern:/tutoring|teaching|lessons|instruction|coaching|coding for kids|robotics teaching|programming instruction|homework assistance|study buddy|technology coaching|instrument teaching|leadership training|soft skills training|learning and development|esl instruction/i },
    { group:'home', pattern:/cleaning|dry cleaning|carpet|decluttering|handyman|home organization|home repair|house sitting|housekeeping|ironing|laundry|plant care|plumbing|upholstery|window cleaning|furniture assembly|furniture repair|garden|gardening|lawn care|tree care|soil testing|irrigation management|composting|nursery management|plant propagation|landscaping|lawn mowing|painting and decorating|moving assistance|moving and hauling|home staging|interior styling|smart home setup|crop farming|organic farming|hydroponics|aquaponics|permaculture|greenhouse|seed production|harvesting|dairy farming|poultry farming|livestock|aquaculture|fisheries|beekeeping|rainwater harvesting|wall repair|tile repair|water tank|drain cleaning|gutter cleaning|pool maintenance|tree trimming|irrigation repair|pressure washing|flooring installation|drywall|masonry|plastering|tiling|waterproofing|bricklaying|concrete work/i },
    { group:'driving', pattern:/driving|courier|delivery|chauffeur|dispatch management|last-mile delivery|logistics coordination|route planning|fleet management|freight forwarding|inventory handling|shipping coordination|relocation services|warehouse|bicycle delivery|document delivery/i },
    { group:'people', pattern:/event|wedding|party planning|guest management|rsvp|emceeing|catering|chef|cooking|baking|barista|bartending|mixology|food styling|food photography|floral|hospitality|venue management|banquet|kitchen assistance|recipe development|stage sound|event teardown|personal fitness|personal assistant|personal concierge|personal errand|personal document organization|gift wrapping|local guide|photography|videography|account management|administrative support|business development|call center|crm administration|customer|executive assistance|help desk|inside sales|live chat|office management|order processing|recruitment|retail sales|technical customer support|vendor management|virtual assistance|guest relations|hotel front desk|restaurant service|waitstaff|pet|dog walking|animal training|animal welfare|horse care|agricultural consulting|tour guiding|tour planning|travel|itinerary|reservation management|conference management|live music performance|dance performance|vocal performance|choir singing|opera singing|guitar|piano|singing|vocal|choir|opera|volunteering|donation pickup|organizational development|partnership development|performance management|process mapping|sop development|startup advising|sales strategy|sales development|prospecting|field sales|key account management|retail customer assistance|luxury retail sales|automotive sales|real estate telesales|queue assistance|cashier|telemarketing|trade show|visual merchandising|stage management|theatre production|entertainment booking|hair|barbering|makeup|bridal makeup|nail art|manicure|pedicure|eyebrow shaping|eyelash extensions|skincare|facial treatments|waxing|threading|spa services|personal styling|wardrobe|fashion|tailoring|sewing|textile|jewelry|personal shopping|image consulting|henna|mehndi|shoemaking|leather craft|woodworking|wood carving|metal art|property|real estate|lease administration|space planning|building management|facility management|people analytics|human resources|beauty|bike repair|fisheries/i }
  ];
  const skillInput = document.getElementById('finderSkill');
  const skillOptions = document.getElementById('finderSkillOptions');
  const skillCategorySelect = document.getElementById('finderSkillCategory');
  const skillCategories = window.TIME2INCOME_SKILL_CATEGORIES;
  if (!skillCategories) throw new Error('Skill category data did not load.');
  const skillCategoryCounts = new Map();
  Object.values(skillCategories).forEach(category => {
    skillCategoryCounts.set(category, (skillCategoryCounts.get(category) || 0) + 1);
  });
  (window.TIME2INCOME_SKILL_CATEGORY_NAMES || []).forEach(category => {
    if (!skillCategoryCounts.has(category)) skillCategoryCounts.set(category, 0);
  });
  const finderAllCategories = new Option(
    `${t('skillCatalogAllCategories')} (${window.TIME2INCOME_SKILLS.length})`,
    ''
  );
  skillCategorySelect.replaceChildren(finderAllCategories);
  [...skillCategoryCounts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([category, count]) => {
      skillCategorySelect.add(new Option(`${category} (${count})`, category));
    });
  window.addEventListener('time2income:displaychange', () => {
    finderAllCategories.textContent = `${t('skillCatalogAllCategories')} (${window.TIME2INCOME_SKILLS.length})`;
  });

  function populateOptions(query = '') {
    skillOptions.replaceChildren();
    broadSkillOptions.forEach(option => addDatalistOption(skillOptions, t(option.label)));
    const needle = query.trim().toLocaleLowerCase();
    window.TIME2INCOME_SKILLS
      .filter(skill => (!skillCategorySelect.value || skillCategories[skill] === skillCategorySelect.value) &&
        (!needle || `${skill} ${(window.TIME2INCOME_SKILL_ALIASES[skill] || []).join(' ')}`.toLocaleLowerCase().includes(needle)))
      .slice(0, 100)
      .forEach(skill => addDatalistOption(skillOptions, skill, skillAliasLabel(skill)));
  }
  function resolveIdeaGroup(value) {
    const canonicalSkill = resolveSkillAlias(value) || value;
    const broadOption = broadSkillOptions.find(option => t(option.label) === canonicalSkill);
    if (broadOption) {
      skillInput.dataset.ideaGroup = broadOption.value;
      skillInput.dataset.selectionType = 'broad';
      return broadOption.value;
    }
    const matchedGroup = skillIdeaGroups.find(item => item.pattern.test(canonicalSkill));
    skillInput.dataset.ideaGroup = matchedGroup?.group || 'digital';
    skillInput.dataset.selectionType = 'specific';
    return skillInput.dataset.ideaGroup;
  }
  function render() {
    const skill = resolveIdeaGroup(skillInput.value.trim());
    const hours = document.getElementById('finderHours').value;
    const mode = document.getElementById('finderMode').value;
    const items = (ideas[skill] && ideas[skill][mode]) || [];
    list.innerHTML = items.map(([titleKey, textKey]) =>
      `<li><strong>${safeText(t(titleKey))}</strong>${safeText(t(textKey))}</li>`
    ).join('') + `<li>${safeText(t(hoursNote[hours] || 'timeNoteMid'))}</li>`;
  }
  populateOptions();
  if (!skillInput.value) skillInput.value = t('skillDigital');
  skillInput.dataset.ideaGroup = 'digital';
  skillInput.dataset.selectionType = 'broad';
  skillCategorySelect.addEventListener('change', () => {
    const canonicalSkill = resolveSkillAlias(skillInput.value.trim()) || skillInput.value.trim();
    if (skillInput.dataset.selectionType === 'specific' &&
      skillCategorySelect.value && skillCategories[canonicalSkill] !== skillCategorySelect.value) {
      skillInput.value = t('skillDigital');
      skillInput.dataset.ideaGroup = 'digital';
      skillInput.dataset.selectionType = 'broad';
    }
    populateOptions(skillInput.dataset.selectionType === 'specific' ? skillInput.value : '');
    render();
  });
  skillInput.addEventListener('input', () => {
    const isBroad = broadSkillOptions.some(option => t(option.label) === skillInput.value.trim());
    skillInput.dataset.selectionType = isBroad ? 'broad' : 'specific';
    if (!isBroad) populateOptions(skillInput.value);
    render();
  });
  skillInput.addEventListener('change', render);
  window.addEventListener('time2income:displaychange', () => {
    const previousGroup = skillInput.dataset.ideaGroup || 'digital';
    const previousWasBroad = skillInput.dataset.selectionType !== 'specific';
    populateOptions(previousWasBroad ? '' : skillInput.value);
    if (previousWasBroad) {
      skillInput.value = t(broadSkillOptions.find(option => option.value === previousGroup)?.label || 'skillDigital');
    }
    render();
  });
  form.addEventListener('change', render);
  render();
})();

(function setupChallenge() {
  const list = document.getElementById('challengeList');
  const progress = document.getElementById('challengeProgress');
  if (!list || !progress) return;
  const steps = [
    'challengeStep1',
    'challengeStep2',
    'challengeStep3',
    'challengeStep4',
    'challengeStep5',
    'challengeStep6',
    'challengeStep7'
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
  const currentCountryInput = document.getElementById('emergencyCurrentCountry');
  const currentCountrySelect = document.getElementById('emergencyCurrentCountryValue');
  const countryOptions = document.getElementById('emergencyCountryOptions');
  const list = document.getElementById('emergencyList');
  if (!countryInput || !currentCountryInput || !currentCountrySelect || !countryOptions || !list) return;
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
  const normalizeCountry = country => country.trim().toLocaleLowerCase().normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
  const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
  const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
  countryCodes.sort((a, b) => countryNames.of(a).localeCompare(countryNames.of(b)));
  countryCodes.forEach(code => {
    currentCountrySelect.add(new Option(countryNames.of(code), countryNames.of(code)));
  });
  if (!Array.isArray(window.TIME2INCOME_COUNTRIES) || !window.TIME2INCOME_COUNTRIES.length) {
    throw new Error('The country reference directory did not load.');
  }
  const countryDirectory = window.TIME2INCOME_COUNTRIES;
  let localizedCountryNames = (() => {
    try {
      return new Intl.DisplayNames([document.documentElement.lang || 'en'], { type: 'region' });
    } catch (error) {
      return countryNames;
    }
  })();
  const countryCodesByName = new Map();
  countryDirectory.forEach(({ code, name }) => {
    countryCodesByName.set(normalizeCountry(name), code);
    countryCodesByName.set(normalizeCountry(countryNames.of(code)), code);
  });
  [
    ['usa', 'US'], ['unitedstatesofamerica', 'US'], ['uk', 'GB'],
    ['greatbritain', 'GB'], ['britain', 'GB'], ['turkey', 'TR'],
    ['czechrepublic', 'CZ'], ['ivorycoast', 'CI'], ['russia', 'RU'],
    ['southkorea', 'KR'], ['northkorea', 'KP']
  ].forEach(([name, code]) => countryCodesByName.set(name, code));
  const europeanUnionCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE'
  ];
  const emergencyEntriesByCountry = new Map();
  data.forEach(([country, numbers]) => {
    if (country === 'United States / Canada') {
      emergencyEntriesByCountry.set('US', numbers);
      emergencyEntriesByCountry.set('CA', numbers);
    } else if (country === 'European Union') {
      europeanUnionCountryCodes.forEach(code => emergencyEntriesByCountry.set(code, numbers));
    } else {
      const code = countryCodesByName.get(normalizeCountry(country));
      if (code) emergencyEntriesByCountry.set(code, numbers);
    }
  });
  const populateCountryOptions = () => {
    const selectedCode = currentCountrySelect.value;
    try {
      localizedCountryNames = new Intl.DisplayNames([document.documentElement.lang || 'en'], { type: 'region' });
    } catch (error) {
      localizedCountryNames = countryNames;
    }
    currentCountrySelect.replaceChildren(new Option(t('emergencyChooseCountry'), ''));
    countryOptions.replaceChildren();
    [...countryDirectory]
      .sort((a, b) => localizedCountryNames.of(a.code).localeCompare(localizedCountryNames.of(b.code)))
      .forEach(country => {
        const localizedName = localizedCountryNames.of(country.code) || country.name;
        currentCountrySelect.add(new Option(localizedName, country.code));
        const option = new Option(localizedName, localizedName, false, false);
        option.label = `${localizedName} ${country.name} ${country.code}`;
        option.dataset.displayLabel = localizedName;
        countryOptions.appendChild(option);
        countryCodesByName.set(normalizeCountry(localizedName), country.code);
      });
    if (selectedCode) currentCountrySelect.value = selectedCode;
    if (currentCountrySelect.value) {
      currentCountryInput.value = currentCountrySelect.selectedOptions[0]?.textContent || '';
    }
  };
  populateCountryOptions();
  let activeUserId = null;
  let currentCountryWasSelected = false;
  const accountCountryOption = accountCountry => {
    return countryCodesByName.get(normalizeCountry(accountCountry)) || '';
  };
  const accountCountryForUser = () => {
    const profileCountry = currentUser && accountProfile?.id === currentUser.id ? accountProfile.country : '';
    return [profileCountry, currentUser?.user_metadata?.country]
      .map(value => typeof value === 'string' ? value.trim() : '')
      .find(Boolean) || '';
  };
  function render() {
    const accountCountry = accountCountryForUser();
    const userId = currentUser?.id || null;
    if (activeUserId !== userId) {
      activeUserId = userId;
      currentCountryWasSelected = false;
    }
    countryInput.value = accountCountry;
    if (!currentCountryWasSelected) {
      currentCountrySelect.value = accountCountryOption(accountCountry);
      currentCountryInput.value = currentCountrySelect.selectedOptions[0]?.textContent || '';
    }
    const currentCountryCode = currentCountrySelect.value;
    if (!currentCountryCode) {
      list.innerHTML = `<li class="emergency-note">${safeText(accountCountry ? t('emergencyChooseCountry') : t('emergencyAccountCountryMissing'))}</li>`;
      return;
    }
    const emergencyNumbers = emergencyEntriesByCountry.get(currentCountryCode);
    if (!emergencyNumbers) {
      list.innerHTML = `<li class="emergency-note">${safeText(t('emergencyAccountCountryUnavailable'))}</li>`;
      return;
    }
    list.innerHTML = emergencyNumbers.map(([labelKey, number]) =>
      `<li><strong>${safeText(t(labelKey))}</strong><a class="btn btn-primary" href="tel:${number}">${safeText(t('emergencyCall'))} ${number}</a></li>`
    ).join('') + `<li class="emergency-note emergency-country-note">${safeText(t('emergencyCountryNote'))}</li>`;
  }
  currentCountrySelect.addEventListener('change', () => {
    currentCountryWasSelected = true;
    render();
  });
  currentCountryInput.addEventListener('input', () => {
    const countryCode = countryCodesByName.get(normalizeCountry(currentCountryInput.value)) || '';
    currentCountrySelect.value = countryCode;
    currentCountrySelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
  window.addEventListener('time2income:accountcountrychange', render);
  window.addEventListener('time2income:displaychange', () => {
    populateCountryOptions();
    render();
  });
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
  const runner = document.getElementById('tourRunner');
  const caption = document.getElementById('tourCaption');
  const note = document.getElementById('tourNote');
  if (!play || !stop || !runner || !caption || !note) return;
  const storageKey = 'time2income_guided_tour';
  const pages = new Set(['marketplace', 'tasks', 'activity', 'profile', 'guides']);
  const steps = [
    { page: 'marketplace', selector: '.topbar', key: 'tourNavigation' },
    { page: 'marketplace', selector: '.hero-copy', key: 'tourHome' },
    { page: 'marketplace', selector: '#explore', key: 'tourExplore' },
    { page: 'marketplace', selector: '#appDownload', key: 'tourAppDownload' },
    { page: 'marketplace', selector: '#worker', key: 'tourWorker' },
    { page: 'tasks', selector: '#taskBoardPanel', key: 'tourTasks' },
    { page: 'activity', selector: '#activity', key: 'tourActivity' },
    { page: 'profile', selector: '#accountPanel', key: 'tourProfile' },
    { page: 'guides', selector: '#how', key: 'tourHow' },
    { page: 'guides', selector: '#incomeCalc', key: 'tourIncomeCalc' },
    { page: 'guides', selector: '#incomeFinder', key: 'tourIncomeFinder' },
    { page: 'guides', selector: '#challenge', key: 'tourChallenge' },
    { page: 'guides', selector: '#emergency', key: 'tourEmergency' },
    { page: 'guides', selector: '#tutorial', key: 'tourTutorial' },
    { page: 'guides', selector: '#faq', key: 'tourFaq' }
  ];
  let running = false;
  let current = null;
  let activeIndex = -1;
  let tourLanguage = 'en';
  let languageNotice = '';
  let speechToken = 0;
  let speechTimer = null;
  let advanceTimer = null;
  const synth = window.speechSynthesis;
  function setNote(message) {
    note.textContent = message;
    note.hidden = !message;
    if (message) runner.hidden = false;
  }
  function clearHighlight() {
    if (current) current.classList.remove('tour-highlight');
    current = null;
  }
  function saveState(index) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ index, language: tourLanguage }));
      return true;
    } catch (error) {
      console.error('Could not save guided tour progress:', error);
      setNote(t('tourSessionError'));
      try {
        const url = new URL(location.href);
        url.searchParams.set('tourStep', String(index));
        url.searchParams.set('tourLanguage', tourLanguage);
        history.replaceState(null, '', url.href);
      } catch (fallbackError) {
        console.error('Could not preserve guided tour progress in the page URL:', fallbackError);
      }
      return true;
    }
  }
  function readUrlState() {
    const params = new URLSearchParams(location.search);
    const savedIndex = params.get('tourStep');
    const language = params.get('tourLanguage');
    const index = Number(savedIndex);
    if (savedIndex !== null && Number.isInteger(index) && index >= 0 &&
        index < steps.length && ['en', 'hi'].includes(language)) {
      return { index, language };
    }
    return null;
  }
  function readState() {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return readUrlState();
      const state = JSON.parse(saved);
      if (!Number.isInteger(state.index) || state.index < 0 || state.index >= steps.length ||
          !['en', 'hi'].includes(state.language)) {
        sessionStorage.removeItem(storageKey);
        return null;
      }
      return state;
    } catch (error) {
      console.error('Could not restore guided tour progress:', error);
      setNote(t('tourSessionError'));
      return readUrlState();
    }
  }
  function removeState() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Could not clear guided tour progress:', error);
    }
    try {
      const url = new URL(location.href);
      url.searchParams.delete('tourStep');
      url.searchParams.delete('tourLanguage');
      if (url.href !== location.href) history.replaceState(null, '', url.href);
    } catch (error) {
      console.error('Could not remove guided tour progress from the page URL:', error);
    }
  }
  function stateUrl(index, page) {
    const url = new URL('index.html', location.href);
    url.searchParams.set('page', page);
    url.searchParams.set('tourStep', String(index));
    url.searchParams.set('tourLanguage', tourLanguage);
    return url.href;
  }
  function cancelSpeech() {
    speechToken += 1;
    clearTimeout(speechTimer);
    speechTimer = null;
    if (synth) synth.cancel();
  }
  function finishTour(completed = false) {
    running = false;
    activeIndex = -1;
    clearTimeout(advanceTimer);
    advanceTimer = null;
    cancelSpeech();
    clearHighlight();
    removeState();
    play.hidden = false;
    stop.hidden = true;
    if (completed) {
      caption.textContent = t('tourCompleted');
      setNote('');
      runner.hidden = false;
      setTimeout(() => {
        if (!running) runner.hidden = true;
      }, 5000);
    } else {
      runner.hidden = true;
    }
  }
  function pickVoice(lang) {
    const voices = synth ? synth.getVoices() : [];
    const languageCode = lang.slice(0, 2).toLowerCase();
    return voices.find(voice => voice.lang && voice.lang.toLowerCase().slice(0, 2) === languageCode) || null;
  }
  function speak(text, done) {
    const token = ++speechToken;
    let finished = false;
    const finish = () => {
      if (finished || token !== speechToken) return;
      finished = true;
      clearTimeout(speechTimer);
      speechTimer = null;
      done();
    };
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      setNote(t('tourVoiceUnavailable'));
      speechTimer = setTimeout(finish, 3200);
      return;
    }
    const language = getLanguage(tourLanguage);
    const voiceDeadline = Date.now() + 1200;
    const speakWhenReady = () => {
      if (token !== speechToken) return;
      const voice = pickVoice(language.locale);
      if (!voice && Date.now() < voiceDeadline) {
        speechTimer = setTimeout(speakWhenReady, 100);
        return;
      }
      if (!voice) {
        setNote(t('tourVoiceUnavailable'));
        speechTimer = setTimeout(finish, 3200);
        return;
      }
      setNote(languageNotice);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language.locale;
      u.voice = voice;
      u.rate = 0.92;
      u.onend = finish;
      u.onerror = () => {
        if (token === speechToken) setNote(t('tourVoiceUnavailable'));
        finish();
      };
      speechTimer = setTimeout(finish, 20000);
      synth.speak(u);
    };
    speakWhenReady();
  }
  function run(i) {
    if (!running) return;
    if (i >= steps.length) {
      finishTour(true);
      return;
    }
    activeIndex = i;
    if (!saveState(i)) {
      finishTour();
      return;
    }
    const step = steps[i];
    if (document.body.dataset.page !== step.page) {
      location.href = stateUrl(i, step.page);
      return;
    }
    const el = document.querySelector(step.selector);
    if (!el || !el.getClientRects().length) {
      advanceTimer = setTimeout(() => run(i + 1), 0);
      return;
    }
    clearHighlight();
    current = el;
    el.classList.add('tour-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const text = t(step.key);
    caption.textContent = t('tourProgress')
      .replace('{current}', String(i + 1))
      .replace('{total}', String(steps.length))
      .replace('{text}', text);
    runner.hidden = false;
    setNote('');
    advanceTimer = setTimeout(() => speak(text, () => {
      advanceTimer = setTimeout(() => run(i + 1), 700);
    }), 650);
  }
  function controlLabel(control) {
    const explicit = control.getAttribute('aria-label') || control.getAttribute('title');
    const label = control.labels && control.labels.length ? control.labels[0].textContent : '';
    const text = explicit || label || control.innerText || control.textContent ||
      control.getAttribute('placeholder') || '';
    return text.replace(/\s+/g, ' ').trim().slice(0, 100) || t('tourClickFallback');
  }
  function clickExplanation(control) {
    const label = controlLabel(control);
    if (control.matches('input, select, textarea, label')) {
      return t('tourClickField').replace('{label}', label);
    }
    if (control.matches('a[href]')) {
      return t('tourClickLink').replace('{label}', label);
    }
    if (control.matches('button, [role="button"]')) {
      return t('tourClickButton').replace('{label}', label);
    }
    return t('tourClickElement').replace('{label}', label);
  }
  function internalPageLink(control) {
    if (!control.matches('a[href]')) return null;
    const url = new URL(control.href, location.href);
    const page = url.searchParams.get('page');
    return url.origin === location.origin && url.pathname === location.pathname && pages.has(page)
      ? { href: url.href, page }
      : null;
  }
  function explainClick(event) {
    if (!running || !(event.target instanceof Element)) return;
    const control = event.target.closest('button, a[href], input, select, textarea, label, summary, [role="button"]');
    if (!control || control === play || control === stop || control.closest('#tourRunner')) return;
    const pageLink = internalPageLink(control);
    if (pageLink) event.preventDefault();
    clearTimeout(advanceTimer);
    advanceTimer = null;
    cancelSpeech();
    const explanation = clickExplanation(control);
    caption.textContent = explanation;
    runner.hidden = false;
    const next = activeIndex + 1;
    speak(explanation, () => {
      if (!running) return;
      if (pageLink) {
        const nextOnPage = steps.findIndex((step, index) => index > activeIndex && step.page === pageLink.page);
        const firstOnPage = steps.findIndex(step => step.page === pageLink.page);
        const resumeAt = nextOnPage >= 0 ? nextOnPage : firstOnPage;
        if (pageLink.page === document.body.dataset.page) {
          advanceTimer = setTimeout(() => run(next), 700);
        } else if (resumeAt >= 0 && saveState(resumeAt)) {
          const targetUrl = new URL(pageLink.href);
          targetUrl.searchParams.set('tourStep', String(resumeAt));
          targetUrl.searchParams.set('tourLanguage', tourLanguage);
          location.href = targetUrl.href;
        }
        else finishTour();
      } else {
        advanceTimer = setTimeout(() => run(next), 700);
      }
    });
  }
  play.addEventListener('click', () => {
    setNote('');
    tourLanguage = locale === 'hi' ? 'hi' : 'en';
    languageNotice = locale !== 'hi' && locale !== 'en' ? t('tourLanguageFallback') : '';
    if (languageNotice) setNote(languageNotice);
    if (!saveState(0)) return;
    running = true;
    play.hidden = true;
    stop.hidden = false;
    runner.hidden = false;
    run(0);
  });
  stop.addEventListener('click', () => finishTour());
  document.addEventListener('click', explainClick, true);
  window.addEventListener('time2income:displaychange', () => {
    if (running && (locale === 'en' || locale === 'hi')) {
      tourLanguage = locale;
      languageNotice = '';
      saveState(activeIndex);
    }
  });
  const savedState = readState();
  if (savedState) {
    running = true;
    activeIndex = savedState.index;
    tourLanguage = savedState.language;
    languageNotice = locale !== 'hi' && locale !== 'en' ? t('tourLanguageFallback') : '';
    play.hidden = true;
    stop.hidden = false;
    runner.hidden = false;
    setNote(languageNotice);
    setTimeout(() => run(savedState.index), 650);
  }
})();
