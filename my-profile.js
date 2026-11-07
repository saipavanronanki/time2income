'use strict';

const profileStatus = document.getElementById('myProfileStatus');
const resumeFileStatus = document.getElementById('resumeFileStatus');
const profileCopy = {
  en: {
    marketplace:'Marketplace', signOut:'Sign out', kicker:'YOUR PROFESSIONAL IDENTITY',
    title:'Build a profile for every opportunity',
    intro:'Choose the profile that fits your goal. Add only the information that matters, save multiple profiles, and download a branded PDF, Word, PowerPoint, PNG, or JPG file.',
    savedKicker:'YOUR WORKSPACE', savedProfiles:'Your profiles', newProfile:'+ New',
    multipleHint:'Keep separate profiles for different goals for example, Job Seeker and Freelancer.',
    stepOne:'CHOOSE A DIRECTION', chooseType:'What type of profile do you want to create?',
    chooseHint:'Select a category to see what information you may want to include.',
    stepTwo:'MAKE IT YOURS', completeProfile:'Complete your profile',
    profileName:'Profile name', profileNameHint:'A label to help you find this profile in your workspace.',
    basicInformation:'Basic information', basicInformationHint:'These details help people recognize and contact you.',
    profilePhoto:'Profile photo (optional)',
    profilePhotoHint:'JPG, PNG or WebP · Up to 5 MB. Stored privately with this profile.',
    removePhoto:'Remove photo', profileDetails:'Profile details',
    profileDetailsHint:'Add relevant information. You can leave optional sections blank.',
    uploadedResume:'Existing Resume Or Portfolio File Here (Optional)',
    chooseResumeFile:'Choose a PDF, Word, PowerPoint, or image file',
    uploadHint:'Maximum 5 MB. Source files stay private and unchanged; downloads generated from your profile include TIME2INCOME branding.',
    uploadFile:'Upload file', downloadUploaded:'Download original file',
    removeUploaded:'Remove uploaded file', saveProfile:'Save profile',
    exportAs:'Download format', exportPdf:'PDF', exportDocx:'Word (.docx)',
    exportPptx:'PowerPoint (.pptx)', exportPng:'PNG image', exportJpg:'JPG image',
    downloadProfile:'Download profile', deleteProfile:'Delete profile',
    informationRequired:'Information to include', selectProfile:'Select this profile type',
    editProfile:'Edit', emptyProfiles:'Your saved profiles will appear here.',
    untitled:'Untitled profile', profileSelected:'Profile type selected. Add your details below.',
    saved:'Profile saved to your account.', deleted:'Profile deleted.',
    enterName:'Add your full name before saving this profile.',
    selectType:'Choose a profile type first.',
    saveProfileFirst:'Save this profile before uploading a file.',
    chooseFirst:'Choose a file first.',
    invalidResumeFile:'Choose a supported PDF, Word, PowerPoint, PNG, JPG, or WebP file under 5 MB.',
    uploading:'Uploading your private file…',
    uploaded:'Your original file was saved privately and will download unchanged.',
    removed:'Uploaded file removed.',
    noAvailable:'No uploaded file is available for this profile.',
    noDetails:'Add a name and at least one profile detail before downloading.',
    downloaded:'Your branded profile file has been downloaded.',
    printReady:'Print preview opened. Choose “Save as PDF” to download your résumé.',
    saveFailed:'Could not save your profile. Please try again.',
    downloadFailed:'Could not create the selected file. Please try again.',
    uploadFailed:'Could not upload the file. Please try again.',
    removeFailed:'Could not remove the uploaded file.',
    pdfUnavailable:'The PDF tool did not load. Check your internet connection and reload this page.',
    docxUnavailable:'The Word export tool did not load. Check your internet connection and reload this page.',
    pptxUnavailable:'The PowerPoint export tool did not load. Check your internet connection and reload this page.',
    imageUnavailable:'The image export tool did not load. Check your internet connection and reload this page.',
    serviceUnavailable:'Account service is unavailable. Please try again later.',
    loadFailed:'Could not load your profile. Please try again.',
    imageInvalid:'Choose a JPG, PNG or WebP photo under 5 MB.',
    storageLimit:'Your saved profile information is too large. Shorten some entries and try again.',
    commonTitle:'Basic information', profilePhotoLabel:'Profile photo',
    fullName:'Full name', headline:'Professional headline', email:'Email address',
    phone:'Phone number', country:'Country', city:'City', languages:'Languages known',
    website:'Website', linkedin:'LinkedIn profile',
    jobTitle:'Job Seeker', jobDescription:'Job, employment aur career opportunities ke liye CV',
    freelanceTitle:'Freelancer', freelanceDescription:'Independent projects aur freelance work ke liye',
    serviceTitle:'Service Provider', serviceDescription:'Local ya online services offer karne ke liye',
    businessTitle:'Business / Company', businessDescription:'Company aur business details present karne ke liye',
    founderTitle:'Entrepreneur / Founder', founderDescription:'Startup, founder profile aur business journey ke liye',
    investorTitle:'Investor', investorDescription:'Investment profile aur professional background ke liye',
    studentTitle:'Student / Fresher', studentDescription:'First job, internship aur education ke liye',
    creatorTitle:'Creator / Professional', creatorDescription:'Creative work aur professional portfolio ke liye',
    objective:'Career objective', education:'Education', experience:'Work experience',
    skills:'Skills', certifications:'Certifications', projects:'Projects',
    achievements:'Achievements', summary:'Professional summary', services:'Services offered',
    portfolio:'Portfolio links', rates:'Hourly or project rates', locations:'Service locations',
    availability:'Availability', company:'Company name', description:'Business description',
    industry:'Industry', products:'Products and services', team:'Team information',
    founderDetails:'Founder details', startup:'Startup name', idea:'Business idea',
    problemSolution:'Problem and solution', model:'Business model', vision:'Vision',
    interests:'Investment interests', industries:'Preferred industries',
    investmentExperience:'Investment experience', background:'Professional background',
    contactDetails:'Contact details', academicAchievements:'Academic achievements',
    internships:'Internships', introduction:'Professional introduction',
    expertise:'Area of expertise', workSamples:'Work samples', portfolioLinks:'Portfolio links',
    socialLinks:'Social links',
    enter:'Enter', enterDetails:'Add your information here…',
    fullNameRequired:'Full name is required.', noProfiles:'No profiles created yet.',
    confirmDelete:'Delete this profile? This cannot be undone.',
    uploadedPrefix:'Uploaded:', photoMissing:'Could not load the saved profile photo.'
  },
  hi: {
    marketplace:'मार्केटप्लेस', signOut:'साइन आउट', kicker:'आपकी पेशेवर पहचान',
    title:'हर अवसर के लिए प्रोफ़ाइल बनाएँ',
    intro:'अपने लक्ष्य के अनुसार प्रोफ़ाइल चुनें। काम की जानकारी जोड़ें, कई प्रोफ़ाइल सेव करें और ब्रांडेड PDF, Word, PowerPoint, PNG या JPG फ़ाइल डाउनलोड करें।',
    savedKicker:'आपका वर्कस्पेस', savedProfiles:'आपकी प्रोफ़ाइलें', newProfile:'+ नई',
    multipleHint:'अलग लक्ष्यों के लिए अलग प्रोफ़ाइल रखें—जैसे नौकरी खोजने और फ्रीलांस काम के लिए।',
    stepOne:'अपना लक्ष्य चुनें', chooseType:'आप किस तरह की प्रोफ़ाइल बनाना चाहते हैं?',
    chooseHint:'जानकारी देखने के लिए कोई श्रेणी चुनें।',
    stepTwo:'अपनी जानकारी जोड़ें', completeProfile:'अपनी प्रोफ़ाइल पूरी करें',
    profileName:'प्रोफ़ाइल का नाम', profileNameHint:'अपनी प्रोफ़ाइल पहचानने के लिए एक नाम।',
    basicInformation:'बुनियादी जानकारी', basicInformationHint:'इन जानकारियों से लोग आपको पहचान और संपर्क कर सकेंगे।',
    profilePhoto:'प्रोफ़ाइल फ़ोटो (वैकल्पिक)',
    profilePhotoHint:'JPG, PNG या WebP · अधिकतम 5 MB। इस प्रोफ़ाइल के साथ निजी रूप से सेव होगी।',
    removePhoto:'फ़ोटो हटाएँ', profileDetails:'प्रोफ़ाइल की जानकारी',
    profileDetailsHint:'ज़रूरी जानकारी भरें। वैकल्पिक हिस्से खाली छोड़ सकते हैं।',
    uploadedResume:'मौजूदा रिज़्यूमे या पोर्टफोलियो फ़ाइल यहाँ (वैकल्पिक)',
    chooseResumeFile:'PDF, Word, PowerPoint या इमेज फ़ाइल चुनें',
    uploadHint:'अधिकतम 5 MB। मूल फ़ाइल निजी और बिना बदलाव के रहेगी; प्रोफ़ाइल से बनाए गए डाउनलोड में TIME2INCOME ब्रांडिंग होगी।',
    uploadFile:'फ़ाइल अपलोड करें', downloadUploaded:'मूल फ़ाइल डाउनलोड करें',
    removeUploaded:'अपलोड की गई फ़ाइल हटाएँ', saveProfile:'प्रोफ़ाइल सेव करें',
    exportAs:'डाउनलोड फ़ॉर्मेट', exportPdf:'PDF', exportDocx:'Word (.docx)',
    exportPptx:'PowerPoint (.pptx)', exportPng:'PNG इमेज', exportJpg:'JPG इमेज',
    downloadProfile:'प्रोफ़ाइल डाउनलोड करें', deleteProfile:'प्रोफ़ाइल हटाएँ',
    informationRequired:'शामिल करने योग्य जानकारी', selectProfile:'इस प्रोफ़ाइल का प्रकार चुनें',
    editProfile:'बदलें', emptyProfiles:'आपकी सेव की गई प्रोफ़ाइलें यहाँ दिखेंगी।',
    untitled:'बिना नाम की प्रोफ़ाइल', profileSelected:'प्रोफ़ाइल प्रकार चुना गया। नीचे अपनी जानकारी भरें।',
    saved:'प्रोफ़ाइल आपके खाते में सेव हो गई।', deleted:'प्रोफ़ाइल हटा दी गई।',
    enterName:'सेव करने से पहले अपना पूरा नाम लिखें।',
    selectType:'पहले प्रोफ़ाइल का प्रकार चुनें.',
    saveProfileFirst:'फ़ाइल अपलोड करने से पहले यह प्रोफ़ाइल सेव करें।',
    chooseFirst:'पहले फ़ाइल चुनें।',
    invalidResumeFile:'5 MB से छोटी मान्य PDF, Word, PowerPoint, PNG, JPG या WebP फ़ाइल चुनें।',
    uploading:'आपकी निजी फ़ाइल अपलोड हो रही है…',
    uploaded:'मूल फ़ाइल निजी रूप से सेव हुई है और बिना बदलाव के डाउनलोड होगी।',
    removed:'अपलोड की गई फ़ाइल हटा दी गई।',
    noAvailable:'इस प्रोफ़ाइल के लिए कोई फ़ाइल अपलोड नहीं है।',
    noDetails:'डाउनलोड करने से पहले नाम और प्रोफ़ाइल की जानकारी जोड़ें।',
    downloaded:'आपकी ब्रांडेड प्रोफ़ाइल फ़ाइल डाउनलोड हो गई।',
    printReady:'प्रिंट प्रीव्यू खुल गया है। डाउनलोड करने के लिए “Save as PDF” चुनें।',
    saveFailed:'प्रोफ़ाइल सेव नहीं हो सकी। फिर कोशिश करें।',
    downloadFailed:'चुनी गई फ़ाइल नहीं बन सकी। फिर कोशिश करें।',
    uploadFailed:'फ़ाइल अपलोड नहीं हो सकी। फिर कोशिश करें।',
    removeFailed:'अपलोड की गई फ़ाइल हटाई नहीं जा सकी।',
    pdfUnavailable:'PDF टूल लोड नहीं हुआ। इंटरनेट जाँचकर पेज फिर से लोड करें।',
    docxUnavailable:'Word एक्सपोर्ट टूल लोड नहीं हुआ। इंटरनेट जाँचकर पेज फिर से लोड करें।',
    pptxUnavailable:'PowerPoint एक्सपोर्ट टूल लोड नहीं हुआ। इंटरनेट जाँचकर पेज फिर से लोड करें।',
    imageUnavailable:'इमेज एक्सपोर्ट टूल लोड नहीं हुआ। इंटरनेट जाँचकर पेज फिर से लोड करें।',
    serviceUnavailable:'खाता सेवा उपलब्ध नहीं है। बाद में फिर कोशिश करें।',
    loadFailed:'प्रोफ़ाइल लोड नहीं हो सकी। फिर कोशिश करें।',
    imageInvalid:'5 MB से छोटी JPG, PNG या WebP फ़ोटो चुनें।',
    storageLimit:'सेव की गई प्रोफ़ाइल बहुत बड़ी है। कुछ जानकारी छोटी करके फिर कोशिश करें।',
    commonTitle:'बुनियादी जानकारी', profilePhotoLabel:'प्रोफ़ाइल फ़ोटो',
    fullName:'पूरा नाम', headline:'पेशेवर परिचय', email:'ईमेल पता',
    phone:'फ़ोन नंबर', country:'देश', city:'शहर', languages:'भाषाएँ',
    website:'वेबसाइट', linkedin:'LinkedIn प्रोफ़ाइल',
    jobTitle:'नौकरी खोजने वाला', freelanceTitle:'फ्रीलांसर',
    serviceTitle:'सेवा प्रदाता', businessTitle:'व्यवसाय / कंपनी',
    founderTitle:'उद्यमी / संस्थापक', investorTitle:'निवेशक',
    studentTitle:'छात्र / फ्रेशर', creatorTitle:'क्रिएटर / प्रोफ़ेशनल',
    jobDescription:'नौकरी और करियर के लिए CV',
    freelanceDescription:'स्वतंत्र प्रोजेक्ट और फ्रीलांस काम के लिए',
    serviceDescription:'स्थानीय या ऑनलाइन सेवाओं के लिए',
    businessDescription:'कंपनी और व्यवसाय की जानकारी के लिए',
    founderDescription:'स्टार्टअप और संस्थापक की यात्रा के लिए',
    investorDescription:'निवेश और पेशेवर पृष्ठभूमि के लिए',
    studentDescription:'पहली नौकरी, इंटर्नशिप और पढ़ाई के लिए',
    creatorDescription:'क्रिएटिव काम और पोर्टफ़ोलियो के लिए',
    objective:'करियर का लक्ष्य', education:'शिक्षा', experience:'काम का अनुभव',
    skills:'कौशल', certifications:'प्रमाणपत्र', projects:'प्रोजेक्ट',
    achievements:'उपलब्धियाँ', summary:'पेशेवर परिचय', services:'दी जाने वाली सेवाएँ',
    portfolio:'पोर्टफ़ोलियो लिंक', rates:'प्रति घंटे या प्रोजेक्ट की दर',
    locations:'सेवा के स्थान', availability:'उपलब्धता', company:'कंपनी का नाम',
    description:'व्यवसाय का परिचय', industry:'उद्योग', products:'उत्पाद और सेवाएँ',
    team:'टीम की जानकारी', founderDetails:'संस्थापक की जानकारी',
    startup:'स्टार्टअप का नाम', idea:'व्यवसाय का विचार',
    problemSolution:'समस्या और समाधान', model:'व्यवसाय मॉडल', vision:'दृष्टि',
    interests:'निवेश में रुचि', industries:'पसंदीदा उद्योग',
    investmentExperience:'निवेश का अनुभव', background:'पेशेवर पृष्ठभूमि',
    contactDetails:'संपर्क जानकारी', academicAchievements:'शैक्षणिक उपलब्धियाँ',
    internships:'इंटर्नशिप', introduction:'पेशेवर परिचय',
    expertise:'विशेषज्ञता', workSamples:'काम के नमूने',
    portfolioLinks:'पोर्टफ़ोलियो लिंक', socialLinks:'सोशल लिंक',
    enter:'लिखें', enterDetails:'अपनी जानकारी यहाँ लिखें…',
    fullNameRequired:'पूरा नाम ज़रूरी है।', noProfiles:'अभी कोई प्रोफ़ाइल नहीं बनाई।',
    confirmDelete:'यह प्रोफ़ाइल हटाएँ? इसे वापस नहीं किया जा सकता।',
    uploadedPrefix:'अपलोड किया गया:', photoMissing:'सेव की गई फ़ोटो लोड नहीं हो सकी।'
  },
  gu: {
    marketplace:'માર્કેટપ્લેસ', signOut:'સાઇન આઉટ', kicker:'તમારી વ્યાવસાયિક ઓળખ',
    title:'દરેક તક માટે પ્રોફાઇલ બનાવો',
    intro:'તમારા હેતુ પ્રમાણે પ્રોફાઇલ પસંદ કરો. જરૂરી માહિતી ઉમેરો, ઘણી પ્રોફાઇલ સાચવો અને બ્રાન્ડેડ PDF, Word, PowerPoint, PNG અથવા JPG ફાઇલ ડાઉનલોડ કરો.',
    savedKicker:'તમારું વર્કસ્પેસ', savedProfiles:'તમારી પ્રોફાઇલ', newProfile:'+ નવી',
    multipleHint:'અલગ હેતુ માટે અલગ પ્રોફાઇલ રાખો—જેમ કે નોકરી અને ફ્રીલાન્સ કામ માટે.',
    stepOne:'હેતુ પસંદ કરો', chooseType:'તમે કયા પ્રકારની પ્રોફાઇલ બનાવવા માંગો છો?',
    chooseHint:'માહિતી જોવા માટે કેટેગરી પસંદ કરો.',
    stepTwo:'તમારી વિગતો ઉમેરો', completeProfile:'તમારી પ્રોફાઇલ પૂર્ણ કરો',
    profileName:'પ્રોફાઇલનું નામ', profileNameHint:'તમારી પ્રોફાઇલ ઓળખવા માટેનું નામ.',
    basicInformation:'મૂળભૂત માહિતી', basicInformationHint:'આ માહિતીથી લોકો તમને ઓળખી અને સંપર્ક કરી શકે છે.',
    profilePhoto:'પ્રોફાઇલ ફોટો (વૈકલ્પિક)',
    profilePhotoHint:'JPG, PNG અથવા WebP · વધુમાં વધુ 5 MB. આ પ્રોફાઇલ સાથે ખાનગી રીતે સાચવાશે.',
    removePhoto:'ફોટો દૂર કરો', profileDetails:'પ્રોફાઇલની વિગતો',
    profileDetailsHint:'સંબંધિત માહિતી ઉમેરો. વૈકલ્પિક વિભાગ ખાલી રાખી શકો છો.',
    uploadedResume:'હાલની રિઝ્યૂમે અથવા પોર્ટફોલિયો ફાઇલ અહીં (વૈકલ્પિક)',
    chooseResumeFile:'PDF, Word, PowerPoint અથવા ઇમેજ ફાઇલ પસંદ કરો',
    uploadHint:'વધુમાં વધુ 5 MB. મૂળ ફાઇલ ખાનગી અને બદલ્યા વગર રહેશે; પ્રોફાઇલમાંથી બનાવેલા ડાઉનલોડમાં TIME2INCOME બ્રાન્ડિંગ હશે.',
    uploadFile:'ફાઇલ અપલોડ કરો', downloadUploaded:'મૂળ ફાઇલ ડાઉનલોડ કરો',
    removeUploaded:'અપલોડ કરેલી ફાઇલ દૂર કરો', saveProfile:'પ્રોફાઇલ સાચવો',
    exportAs:'ડાઉનલોડ ફોર્મેટ', exportPdf:'PDF', exportDocx:'Word (.docx)',
    exportPptx:'PowerPoint (.pptx)', exportPng:'PNG ઇમેજ', exportJpg:'JPG ઇમેજ',
    downloadProfile:'પ્રોફાઇલ ડાઉનલોડ કરો', deleteProfile:'પ્રોફાઇલ દૂર કરો',
    informationRequired:'સમાવી શકાય તેવી માહિતી', selectProfile:'આ પ્રોફાઇલ પ્રકાર પસંદ કરો',
    editProfile:'ફેરફાર', emptyProfiles:'તમારી સાચવેલી પ્રોફાઇલ અહીં દેખાશે.',
    untitled:'નામ વગરની પ્રોફાઇલ', profileSelected:'પ્રોફાઇલ પ્રકાર પસંદ થયો. નીચે વિગતો ઉમેરો.',
    saved:'પ્રોફાઇલ તમારા ખાતામાં સાચવાઈ.', deleted:'પ્રોફાઇલ દૂર થઈ.',
    enterName:'સાચવતાં પહેલાં તમારું પૂરું નામ દાખલ કરો.',
    selectType:'પહેલા પ્રોફાઇલ પ્રકાર પસંદ કરો.',
    saveProfileFirst:'ફાઇલ અપલોડ કરતાં પહેલાં આ પ્રોફાઇલ સાચવો.',
    chooseFirst:'પહેલા ફાઇલ પસંદ કરો.',
    invalidResumeFile:'5 MBથી નાની માન્ય PDF, Word, PowerPoint, PNG, JPG અથવા WebP ફાઇલ પસંદ કરો.',
    uploading:'તમારી ખાનગી ફાઇલ અપલોડ થઈ રહી છે…',
    uploaded:'મૂળ ફાઇલ ખાનગી રીતે સાચવાઈ છે અને બદલ્યા વગર ડાઉનલોડ થશે.',
    removed:'અપલોડ કરેલી ફાઇલ દૂર થઈ.',
    noAvailable:'આ પ્રોફાઇલ માટે કોઈ ફાઇલ અપલોડ નથી.',
    noDetails:'ડાઉનલોડ કરતાં પહેલાં નામ અને પ્રોફાઇલની વિગતો ઉમેરો.',
    downloaded:'તમારી બ્રાન્ડેડ પ્રોફાઇલ ફાઇલ ડાઉનલોડ થઈ.',
    printReady:'પ્રિન્ટ પ્રિવ્યૂ ખુલ્યું છે. ડાઉનલોડ કરવા “Save as PDF” પસંદ કરો.',
    saveFailed:'પ્રોફાઇલ સાચવી શકાઈ નહીં. ફરી પ્રયાસ કરો.',
    downloadFailed:'પસંદ કરેલી ફાઇલ બનાવી શકાઈ નહીં. ફરી પ્રયાસ કરો.',
    uploadFailed:'ફાઇલ અપલોડ થઈ શકી નહીં. ફરી પ્રયાસ કરો.',
    removeFailed:'અપલોડ કરેલી ફાઇલ દૂર થઈ શકી નહીં.',
    pdfUnavailable:'PDF ટૂલ લોડ થયું નથી. ઇન્ટરનેટ તપાસીને પેજ ફરી લોડ કરો.',
    docxUnavailable:'Word એક્સપોર્ટ ટૂલ લોડ થયું નથી. ઇન્ટરનેટ તપાસીને પેજ ફરી લોડ કરો.',
    pptxUnavailable:'PowerPoint એક્સપોર્ટ ટૂલ લોડ થયું નથી. ઇન્ટરનેટ તપાસીને પેજ ફરી લોડ કરો.',
    imageUnavailable:'ઇમેજ એક્સપોર્ટ ટૂલ લોડ થયું નથી. ઇન્ટરનેટ તપાસીને પેજ ફરી લોડ કરો.',
    serviceUnavailable:'ખાતા સેવા ઉપલબ્ધ નથી. પછી ફરી પ્રયાસ કરો.',
    loadFailed:'પ્રોફાઇલ લોડ થઈ શકી નહીં. ફરી પ્રયાસ કરો.',
    imageInvalid:'5 MBથી નાનો JPG, PNG અથવા WebP ફોટો પસંદ કરો.',
    storageLimit:'સાચવેલી પ્રોફાઇલ ઘણી મોટી છે. વિગતો ટૂંકી કરીને ફરી પ્રયાસ કરો.',
    commonTitle:'મૂળભૂત માહિતી', profilePhotoLabel:'પ્રોફાઇલ ફોટો',
    fullName:'પૂરું નામ', headline:'વ્યાવસાયિક પરિચય', email:'ઇમેઇલ સરનામું',
    phone:'ફોન નંબર', country:'દેશ', city:'શહેર', languages:'જાણતી ભાષાઓ',
    website:'વેબસાઇટ', linkedin:'LinkedIn પ્રોફાઇલ',
    jobTitle:'નોકરી શોધનાર', freelanceTitle:'ફ્રીલાન્સર',
    serviceTitle:'સેવા પ્રદાતા', businessTitle:'વ્યવસાય / કંપની',
    founderTitle:'ઉદ્યોગસાહસિક / સ્થાપક', investorTitle:'રોકાણકાર',
    studentTitle:'વિદ્યાર્થી / ફ્રેશર', creatorTitle:'ક્રિએટર / પ્રોફેશનલ',
    jobDescription:'નોકરી અને કારકિર્દી માટે CV',
    freelanceDescription:'સ્વતંત્ર પ્રોજેક્ટ અને ફ્રીલાન્સ કામ માટે',
    serviceDescription:'સ્થાનિક અથવા ઓનલાઇન સેવાઓ માટે',
    businessDescription:'કંપની અને વ્યવસાયની વિગતો માટે',
    founderDescription:'સ્ટાર્ટઅપ અને સ્થાપકની સફર માટે',
    investorDescription:'રોકાણ અને વ્યાવસાયિક પૃષ્ઠભૂમિ માટે',
    studentDescription:'પ્રથમ નોકરી, ઇન્ટર્નશિપ અને શિક્ષણ માટે',
    creatorDescription:'ક્રિએટિવ કામ અને પોર્ટફોલિયો માટે',
    objective:'કારકિર્દીનો હેતુ', education:'શિક્ષણ', experience:'કાર્યનો અનુભવ',
    skills:'કુશળતા', certifications:'પ્રમાણપત્રો', projects:'પ્રોજેક્ટ',
    achievements:'સિદ્ધિઓ', summary:'વ્યાવસાયિક પરિચય', services:'આપવામાં આવતી સેવાઓ',
    portfolio:'પોર્ટફોલિયો લિંક્સ', rates:'કલાક અથવા પ્રોજેક્ટના દર',
    locations:'સેવાના સ્થળો', availability:'ઉપલબ્ધતા', company:'કંપનીનું નામ',
    description:'વ્યવસાયનું વર્ણન', industry:'ઉદ્યોગ', products:'ઉત્પાદનો અને સેવાઓ',
    team:'ટીમની માહિતી', founderDetails:'સ્થાપકની વિગતો',
    startup:'સ્ટાર્ટઅપનું નામ', idea:'વ્યવસાયનો વિચાર',
    problemSolution:'સમસ્યા અને ઉકેલ', model:'વ્યવસાય મોડેલ', vision:'વિઝન',
    interests:'રોકાણમાં રસ', industries:'પસંદગીના ઉદ્યોગો',
    investmentExperience:'રોકાણનો અનુભવ', background:'વ્યાવસાયિક પૃષ્ઠભૂમિ',
    contactDetails:'સંપર્ક વિગતો', academicAchievements:'શૈક્ષણિક સિદ્ધિઓ',
    internships:'ઇન્ટર્નશિપ', introduction:'વ્યાવસાયિક પરિચય',
    expertise:'નિષ્ણાત ક્ષેત્ર', workSamples:'કામના નમૂના',
    portfolioLinks:'પોર્ટફોલિયો લિંક્સ', socialLinks:'સોશિયલ લિંક્સ',
    enter:'દાખલ કરો', enterDetails:'તમારી માહિતી અહીં ઉમેરો…',
    fullNameRequired:'પૂરું નામ જરૂરી છે.', noProfiles:'હજુ પ્રોફાઇલ બનાવી નથી.',
    confirmDelete:'આ પ્રોફાઇલ દૂર કરવી છે? આ પાછું થઈ શકશે નહીં.',
    uploadedPrefix:'અપલોડ કરેલું:', photoMissing:'સાચવેલો ફોટો લોડ થઈ શક્યો નહીં.'
  }
};

const templateCopy = {
  en:{
    title:'Choose your résumé design',
    hint:'Pick a style. Your profile details stay the same.',
    count:'10 designs',
    preview:'Live preview',
    choose:'Choose',
    selected:'Selected',
    contact:'Contact',
    noDetails:'Your profile details will appear in this preview.',
    templates:{
      verdant:['Verdant','Fresh green · Modern'],
      swiss:['Swiss','Structured · Classic'],
      mono:['Monochrome','Minimal · ATS-friendly'],
      editorial:['Editorial','Refined · Serif'],
      coral:['Coral','Creative · Warm'],
      executive:['Executive','Navy · Leadership'],
      aurora:['Aurora','Violet · Contemporary'],
      nordic:['Nordic','Calm · Natural'],
      sidebar:['Sidebar','Two-column · Contact panel'],
      studio:['Studio','Portfolio · Bold']
    }
  },
  hi:{
    title:'अपना रिज़्यूमे डिज़ाइन चुनें',
    hint:'एक शैली चुनें। आपकी प्रोफ़ाइल की जानकारी वही रहेगी।',
    count:'10 डिज़ाइन',
    preview:'लाइव प्रीव्यू',
    choose:'चुनें',
    selected:'चुना गया',
    contact:'संपर्क',
    noDetails:'आपकी प्रोफ़ाइल की जानकारी यहाँ दिखाई देगी।',
    templates:{
      verdant:['वर्डेंट','हरा · आधुनिक'],
      swiss:['स्विस','व्यवस्थित · क्लासिक'],
      mono:['मोनोक्रोम','मिनिमल · ATS-अनुकूल'],
      editorial:['एडिटोरियल','सुघड़ · सेरिफ़'],
      coral:['कोरल','क्रिएटिव · गर्म रंग'],
      executive:['एग्ज़ीक्यूटिव','नेवी · नेतृत्व'],
      aurora:['ऑरोरा','वायलेट · आधुनिक'],
      nordic:['नॉर्डिक','शांत · प्राकृतिक'],
      sidebar:['साइडबार','दो कॉलम · संपर्क पैनल'],
      studio:['स्टूडियो','पोर्टफोलियो · बोल्ड']
    }
  },
  gu:{
    title:'તમારી રિઝ્યૂમે ડિઝાઇન પસંદ કરો',
    hint:'એક શૈલી પસંદ કરો. પ્રોફાઇલની વિગતો એ જ રહેશે.',
    count:'10 ડિઝાઇન',
    preview:'લાઇવ પ્રિવ્યૂ',
    choose:'પસંદ કરો',
    selected:'પસંદ કરેલી',
    contact:'સંપર્ક',
    noDetails:'તમારી પ્રોફાઇલની વિગતો અહીં દેખાશે.',
    templates:{
      verdant:['વર્ડન્ટ','લીલો · આધુનિક'],
      swiss:['સ્વિસ','વ્યવસ્થિત · ક્લાસિક'],
      mono:['મોનોક્રોમ','મિનિમલ · ATS-મૈત્રીપૂર્ણ'],
      editorial:['એડિટોરિયલ','સુઘડ · સેરિફ'],
      coral:['કોરલ','ક્રિએટિવ · ગરમ રંગ'],
      executive:['એક્ઝિક્યુટિવ','નેવી · નેતૃત્વ'],
      aurora:['ઓરોરા','વાયોલેટ · આધુનિક'],
      nordic:['નોર્ડિક','શાંત · કુદરતી'],
      sidebar:['સાઇડબાર','બે કોલમ · સંપર્ક પેનલ'],
      studio:['સ્ટુડિયો','પોર્ટફોલિયો · બોલ્ડ']
    }
  }
};

const PROFILE_TEMPLATES = [
  { id:'verdant', className:'verdant' },
  { id:'swiss', className:'swiss' },
  { id:'mono', className:'mono' },
  { id:'editorial', className:'editorial' },
  { id:'coral', className:'coral' },
  { id:'executive', className:'executive' },
  { id:'aurora', className:'aurora' },
  { id:'nordic', className:'nordic' },
  { id:'sidebar', className:'sidebar' },
  { id:'studio', className:'studio' }
];

const COMMON_FIELDS = [
  { key:'name', label:'fullName', type:'text', required:true },
  { key:'headline', label:'headline', type:'text' },
  { key:'email', label:'email', type:'email' },
  { key:'phone', label:'phone', type:'tel' },
  { key:'country', label:'country', type:'text' },
  { key:'city', label:'city', type:'text' },
  { key:'languages', label:'languages', type:'text' },
  { key:'website', label:'website', type:'url' },
  { key:'linkedin', label:'linkedin', type:'url' }
];

const PROFILE_TYPES = [
  { id:'job', icon:'▣', title:'jobTitle', description:'jobDescription', fields:[
    ['objective','objective'], ['education','education'], ['experience','experience'],
    ['skills','skills'], ['certifications','certifications'], ['projects','projects'],
    ['achievements','achievements']
  ] },
  { id:'freelancer', icon:'▱', title:'freelanceTitle', description:'freelanceDescription', fields:[
    ['summary','summary'], ['skills','skills'], ['services','services'],
    ['experience','experience'], ['portfolio','portfolio'], ['projects','projects'],
    ['rates','rates']
  ] },
  { id:'service-provider', icon:'⚒', title:'serviceTitle', description:'serviceDescription', fields:[
    ['services','services'], ['skills','skills'], ['experience','experience'],
    ['locations','locations'], ['availability','availability'], ['certifications','certifications']
  ] },
  { id:'business', icon:'⌂', title:'businessTitle', description:'businessDescription', fields:[
    ['company','company','text'], ['description','description'], ['industry','industry','text'],
    ['products','products'], ['team','team'],
    ['achievements','achievements']
  ] },
  { id:'founder', icon:'↗', title:'founderTitle', description:'founderDescription', fields:[
    ['founderDetails','founderDetails'], ['startup','startup','text'], ['idea','idea'],
    ['problemSolution','problemSolution'], ['model','model'], ['experience','experience'],
    ['achievements','achievements'], ['vision','vision']
  ] },
  { id:'investor', icon:'⌁', title:'investorTitle', description:'investorDescription', fields:[
    ['interests','interests'], ['industries','industries'], ['investmentExperience','investmentExperience'],
    ['portfolio','portfolio'], ['background','background'], ['contactDetails','contactDetails']
  ] },
  { id:'student', icon:'⌑', title:'studentTitle', description:'studentDescription', fields:[
    ['education','education'], ['academicAchievements','academicAchievements'],
    ['skills','skills'], ['internships','internships'], ['projects','projects'],
    ['certifications','certifications'], ['objective','objective']
  ] },
  { id:'creator', icon:'✳', title:'creatorTitle', description:'creatorDescription', fields:[
    ['introduction','introduction'], ['expertise','expertise'], ['skills','skills'],
    ['workSamples','workSamples'], ['portfolioLinks','portfolioLinks'], ['experience','experience'],
    ['achievements','achievements'], ['socialLinks','socialLinks']
  ] }
];

const $ = id => document.getElementById(id);
let profileLanguage = 'en';
let currentUser = null;
let savedProfiles = [];
let selectedType = null;
let selectedTemplateId = 'verdant';
let activeProfileId = '';
let savedPhotoPath = '';
let photoUrl = '';
let photoPreviewUrl = '';
let photoFile = null;
let removePhoto = false;
let resumeFilePath = '';
let resumeFileName = '';
let resumeFileMime = '';

try {
  const savedLanguage = localStorage.getItem('time2income_language');
  if (savedLanguage && profileCopy[savedLanguage]) profileLanguage = savedLanguage;
} catch (error) {
  console.warn('Could not read the selected language:', error);
}
document.documentElement.lang = profileLanguage;

function t(key) {
  return profileCopy[profileLanguage]?.[key] || profileCopy.en[key] || key;
}

document.querySelectorAll('[data-profile-copy]').forEach(element => {
  element.textContent = t(element.dataset.profileCopy);
});
document.querySelectorAll('[data-profile-template-copy]').forEach(element => {
  element.textContent = tt(element.dataset.profileTemplateCopy);
});

function tt(key) {
  return templateCopy[profileLanguage]?.[key] || templateCopy.en[key] || key;
}

function templateText(templateId, index) {
  return tt('templates')[templateId]?.[index] || tt('templates').verdant[index];
}

function showProfileStatus(message, isError = false) {
  profileStatus.textContent = message;
  profileStatus.dataset.error = String(isError);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[character]);
}

function getType(typeId) {
  return PROFILE_TYPES.find(type => type.id === typeId) || null;
}

function getTemplate(templateId) {
  return PROFILE_TEMPLATES.find(template => template.id === templateId) || PROFILE_TEMPLATES[0];
}

function getFieldLabel(field) {
  return t(field[1]);
}

function safeUserFilePath(path, extension) {
  if (typeof path !== 'string' || !currentUser) return false;
  const [ownerId, objectName, extra] = path.split('/');
  const expression = extension === 'jpg'
    ? /^[0-9a-f-]+\.jpg$/i
    : extension === 'resume'
      ? /^[0-9a-f-]+\.(pdf|docx?|pptx?|png|jpe?g|webp)$/i
      : /^[0-9a-f-]+\.pdf$/i;
  return ownerId === currentUser.id && Boolean(objectName) && !extra && expression.test(objectName);
}

function renderProfileTypeChoices(openTypeId = '') {
  const container = $('profileTypeChoices');
  container.replaceChildren();
  PROFILE_TYPES.forEach(type => {
    const details = document.createElement('details');
    details.className = 'profile-type-card';
    details.dataset.profileType = type.id;
    details.open = type.id === openTypeId;

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <span class="profile-type-icon" aria-hidden="true">${type.icon}</span>
      <span class="profile-type-title"><strong>${escapeHtml(t(type.title))}</strong>
        <small>${escapeHtml(t(type.description))}</small>
      </span>
      <span class="profile-type-chevron" aria-hidden="true">⌄</span>`;
    details.append(summary);

    const body = document.createElement('div');
    body.className = 'profile-type-details';
    const heading = document.createElement('h3');
    heading.textContent = t('informationRequired');
    body.append(heading);
    const list = document.createElement('ul');
    type.fields.forEach(field => {
      const item = document.createElement('li');
      item.textContent = t(field[1]);
      list.append(item);
    });
    body.append(list);
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.className = 'btn btn-primary profile-type-select';
    choose.dataset.selectProfileType = type.id;
    choose.textContent = t('selectProfile');
    body.append(choose);
    details.append(body);
    container.append(details);
  });
}

function createField(field, data, prefix) {
  const [key, labelKey, configuredType] = field;
  const defaultType = COMMON_FIELDS.find(item => item.key === key)?.type || 'textarea';
  const type = configuredType || defaultType;
  const id = `${prefix}-${key}`;
  const label = document.createElement('label');
  label.className = 'form-label profile-dynamic-field';
  label.htmlFor = id;
  const title = document.createElement('span');
  title.textContent = t(labelKey);
  label.append(title);
  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 3;
    input.maxLength = key === 'description' ? 3500 : 2400;
    input.placeholder = `${t('enter')} ${t(labelKey).toLocaleLowerCase()}…`;
  } else {
    input = document.createElement('input');
    input.type = type;
    input.maxLength = key === 'name' ? 100 : 500;
    input.autocomplete = 'off';
    if (type === 'url') input.placeholder = 'https://';
    else input.placeholder = `${t('enter')} ${t(labelKey).toLocaleLowerCase()}`;
    if (key === 'name') input.required = true;
  }
  input.id = id;
  input.name = key;
  input.value = typeof data[key] === 'string' ? data[key] : '';
  label.append(input);
  return label;
}

function getDefaultProfileData(type) {
  const metadata = currentUser.user_metadata || {};
  const details = {
    name: metadata.full_name || '',
    email: currentUser.email || '',
    phone: metadata.phone_number || '',
    country: metadata.country || '',
    city: metadata.city || '',
    headline: metadata.primary_skill || ''
  };
  if (type.id === 'job' && metadata.resume_profile) {
    details.objective = metadata.resume_profile.summary || '';
    details.experience = metadata.resume_profile.experience || '';
    details.education = metadata.resume_profile.education || '';
    details.skills = metadata.resume_profile.skills || '';
  }
  return details;
}

function getResumeSections(profile, type) {
  const sidebarKeys = new Set(['skills', 'languages', 'certifications', 'interests', 'industries', 'availability']);
  const sections = type.fields
    .map(([key, label]) => ({ key, title:t(label), value:profile.data[key] || '' }))
    .filter(section => String(section.value).trim());
  return {
    sidebar:sections.filter(section => sidebarKeys.has(section.key)),
    main:sections.filter(section => !sidebarKeys.has(section.key))
  };
}

function getResumeContacts(data) {
  return [
    data.email,
    data.phone,
    [data.city, data.country].filter(Boolean).join(', '),
    data.website,
    data.linkedin
  ].filter(Boolean);
}

function renderResumeSection(section) {
  return `<section class="resume-section"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.value).replace(/\r?\n/g, '<br>')}</p></section>`;
}

function buildResumeMarkup(profile, type, photo = '') {
  const template = getTemplate(profile.templateId || selectedTemplateId);
  const { sidebar, main } = getResumeSections(profile, type);
  const contacts = getResumeContacts(profile.data);
  const languages = profile.data.languages && !sidebar.some(section => section.key === 'languages')
    ? `<span>${escapeHtml(`${t('languages')}: ${profile.data.languages}`)}</span>`
    : '';
  const photoMarkup = photo
    ? `<img class="resume-photo" src="${escapeHtml(photo)}" width="240" height="240" alt="">`
    : '';
  const contactMarkup = contacts.map(item => `<span>${escapeHtml(item)}</span>`).join('');
  const sidebarSections = sidebar.map(renderResumeSection).join('');
  const nonSidebarSections = ['coral', 'aurora', 'sidebar'].includes(template.id) ? '' : sidebarSections;
  const mainSections = main.map(renderResumeSection).join('');
  return `<article class="resume-sheet template-${template.className}" data-template="${template.id}">
    <header class="resume-heading">
      ${photoMarkup}
      <div class="resume-heading-copy">
        <h1>${escapeHtml(profile.data.name || t('fullName'))}</h1>
        ${profile.data.headline ? `<p class="resume-headline">${escapeHtml(profile.data.headline)}</p>` : ''}
        <p class="resume-role">${escapeHtml(t(type.title))}</p>
        <div class="resume-contact-line">${contactMarkup}${languages}</div>
      </div>
    </header>
    <aside class="resume-sidebar">
      <h2>${escapeHtml(tt('contact'))}</h2>
      <div class="resume-sidebar-contacts">${contactMarkup}${languages}</div>
      ${sidebarSections}
    </aside>
    <main class="resume-content">${nonSidebarSections}${mainSections}</main>
    <footer class="resume-brand">time2income.com | Powered by Spactisu</footer>
  </article>`;
}

function renderProfileTemplateGallery() {
  const grid = $('profileTemplateGrid');
  grid.replaceChildren();
  PROFILE_TEMPLATES.forEach(template => {
    const item = document.createElement('div');
    item.className = 'profile-template-item';
    item.setAttribute('role', 'listitem');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-template-option';
    button.dataset.profileTemplate = template.id;
    button.setAttribute('aria-pressed', String(template.id === selectedTemplateId));
    button.setAttribute('aria-label', `${templateText(template.id, 0)}. ${templateText(template.id, 1)}`);

    const thumbnail = document.createElement('span');
    thumbnail.className = 'profile-template-thumbnail';
    thumbnail.dataset.template = template.id;
    thumbnail.setAttribute('aria-hidden', 'true');
    const page = document.createElement('span');
    page.className = 'template-thumb-page';
    const header = document.createElement('span');
    header.className = 'template-thumb-header';
    const avatar = document.createElement('span');
    avatar.className = 'template-thumb-avatar';
    const heading = document.createElement('span');
    heading.className = 'template-thumb-heading';
    const nameLine = document.createElement('span');
    nameLine.className = 'template-thumb-name';
    const role = document.createElement('span');
    role.className = 'template-thumb-role';
    heading.append(nameLine, role);
    header.append(avatar, heading);
    const content = document.createElement('span');
    content.className = 'template-thumb-content';
    const sidebar = document.createElement('span');
    sidebar.className = 'template-thumb-sidebar';
    for (let index = 0; index < 3; index += 1) {
      const line = document.createElement('span');
      line.className = `template-thumb-side-line template-thumb-side-line-${index + 1}`;
      sidebar.append(line);
    }
    const main = document.createElement('span');
    main.className = 'template-thumb-main';
    for (let index = 0; index < 3; index += 1) {
      const section = document.createElement('span');
      section.className = 'template-thumb-section';
      const title = document.createElement('span');
      title.className = 'template-thumb-section-title';
      const lines = document.createElement('span');
      lines.className = 'template-thumb-section-lines';
      for (let lineIndex = 0; lineIndex < 2; lineIndex += 1) {
        const line = document.createElement('span');
        line.className = 'template-thumb-line';
        lines.append(line);
      }
      section.append(title, lines);
      main.append(section);
    }
    content.append(sidebar, main);
    page.append(header, content);
    thumbnail.append(page);

    const info = document.createElement('span');
    info.className = 'profile-template-info';
    const name = document.createElement('strong');
    name.textContent = templateText(template.id, 0);
    const description = document.createElement('small');
    description.textContent = templateText(template.id, 1);
    const badge = document.createElement('span');
    badge.className = 'profile-template-badge';
    badge.textContent = tt(template.id === selectedTemplateId ? 'selected' : 'choose');
    info.append(name, description, badge);
    button.append(thumbnail, info);
    item.append(button);
    grid.append(item);
  });
  $('selectedTemplateName').textContent = templateText(selectedTemplateId, 0);
}

function renderProfileLivePreview() {
  if (!selectedType || !$('profileLivePreview')) return;
  const profile = {
    type:selectedType.id,
    templateId:selectedTemplateId,
    data:collectProfileData()
  };
  $('profileLivePreview').innerHTML = buildResumeMarkup(profile, selectedType, photoPreviewUrl || photoUrl);
}

function selectProfileTemplate(templateId) {
  if (!PROFILE_TEMPLATES.some(template => template.id === templateId)) return;
  selectedTemplateId = templateId;
  renderProfileTemplateGallery();
  renderProfileLivePreview();
}

function renderProfileEditor(type, data = {}, profile = null) {
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = '';
  $('profilePhotoInput').value = '';
  selectedType = type;
  activeProfileId = profile?.id || '';
  savedPhotoPath = profile?.photoPath || '';
  photoUrl = '';
  photoFile = null;
  removePhoto = false;
  resumeFilePath = profile?.resumePath && safeUserFilePath(profile.resumePath, 'resume')
    ? profile.resumePath
    : '';
  resumeFileName = resumeFilePath ? (profile.resumeName || '') : '';
  resumeFileMime = resumeFilePath ? (profile.resumeMime || resumeMimeFromName(resumeFileName || resumeFilePath)) : '';
  selectedTemplateId = PROFILE_TEMPLATES.some(template => template.id === profile?.templateId)
    ? profile.templateId
    : 'verdant';
  $('editingProfileId').value = activeProfileId;
  $('profileDisplayName').value = profile?.label || t(type.title);
  $('profileEditorTitle').textContent = t('completeProfile');
  $('profileEditorDescription').textContent = t(type.description);
  $('commonProfileFields').replaceChildren(
    ...COMMON_FIELDS.map(field => createField(
      [field.key, field.label, field.type, field.required],
      data,
      'common'
    ))
  );
  $('specificProfileFields').replaceChildren(
    ...type.fields.map(field => createField(field, data, 'specific'))
  );
  renderProfileTemplateGallery();
  renderProfileLivePreview();
  $('profileEditorPanel').hidden = false;
  $('deleteProfileBtn').hidden = !profile;
  $('resumeFileInput').value = '';
  setPhotoPreview('');
  updateResumeFileControls();
  showProfileStatus(t('profileSelected'));
  renderProfileTypeChoices(type.id);
  renderSavedProfiles();

  if (savedPhotoPath) {
    supabaseClient.storage.from('private-resume-photos')
      .createSignedUrl(savedPhotoPath, 900)
      .then(({ data: signed, error }) => {
        if (error) throw error;
        if (signed?.signedUrl && savedPhotoPath === profile?.photoPath && !photoFile && !removePhoto) {
          photoUrl = signed.signedUrl;
          setPhotoPreview(photoUrl);
          renderProfileLivePreview();
        }
      })
      .catch(error => {
        console.error('Could not load the private résumé profile photo:', error);
        showProfileStatus(t('photoMissing'), true);
      });
  }
}

function selectProfileType(typeId) {
  const type = getType(typeId);
  if (!type) return;
  const defaults = getDefaultProfileData(type);
  renderProfileEditor(type, defaults);
  $('profileEditorPanel').scrollIntoView({ behavior:'smooth', block:'start' });
}

function setPhotoPreview(url) {
  const preview = $('profilePhotoPreview');
  preview.replaceChildren();
  if (url) {
    const image = document.createElement('img');
    image.src = url;
    image.alt = t('profilePhotoLabel');
    image.width = 120;
    image.height = 120;
    preview.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.textContent = '👤';
    preview.append(placeholder);
  }
  $('removeProfilePhotoBtn').hidden = !url && !photoFile;
}

function updateResumeFileControls() {
  const hasSavedFile = Boolean(resumeFilePath);
  $('downloadUploadedResumeBtn').hidden = !hasSavedFile;
  $('removeUploadedResumeBtn').hidden = !hasSavedFile;
  resumeFileStatus.textContent = hasSavedFile
    ? `${t('uploadedPrefix')} ${resumeFileName || 'file'}`
    : '';
}

function collectProfileData() {
  const data = {};
  [...COMMON_FIELDS, ...selectedType.fields.map(field => ({
    key:field[0]
  }))].forEach(field => {
    const input = $(field.key === 'name' || COMMON_FIELDS.some(common => common.key === field.key)
      ? `common-${field.key}`
      : `specific-${field.key}`);
    if (input) data[field.key] = input.value.trim();
  });
  return data;
}

function renderSavedProfiles() {
  const container = $('savedProfilesList');
  container.replaceChildren();
  if (!savedProfiles.length) {
    const empty = document.createElement('p');
    empty.className = 'saved-profiles-empty';
    empty.textContent = t('emptyProfiles');
    container.append(empty);
    return;
  }

  savedProfiles.forEach(profile => {
    const type = getType(profile.type);
    const card = document.createElement('article');
    card.className = `saved-profile-card${profile.id === activeProfileId ? ' is-active' : ''}`;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'saved-profile-open';
    open.dataset.editProfile = profile.id;
    const label = document.createElement('strong');
    label.textContent = profile.data?.name || profile.label || t('untitled');
    const category = document.createElement('small');
    category.textContent = type ? t(type.title) : profile.type;
    open.append(label, category);
    const edit = document.createElement('span');
    edit.className = 'saved-profile-edit';
    edit.textContent = t('editProfile');
    open.append(edit);
    card.append(open);
    container.append(card);
  });
}

function findProfile(id) {
  return savedProfiles.find(profile => profile.id === id) || null;
}

function renderEditProfile(profile) {
  const type = getType(profile.type);
  if (!type) return;
  renderProfileEditor(type, profile.data || {}, profile);
  $('profileEditorPanel').scrollIntoView({ behavior:'smooth', block:'start' });
}

function loadSavedProfiles(user) {
  const metadata = user.user_metadata || {};
  const existing = Array.isArray(metadata.professional_profiles)
    ? metadata.professional_profiles
    : [];
  savedProfiles = existing
    .filter(profile => profile && typeof profile.id === 'string'
      && getType(profile.type) && profile.data && typeof profile.data === 'object')
    .map(profile => ({
      id:profile.id,
      type:profile.type,
      templateId:getTemplate(profile.templateId).id,
      label:typeof profile.label === 'string' ? profile.label : '',
      data:profile.data,
      photoPath:safeUserFilePath(profile.photoPath, 'jpg') ? profile.photoPath : '',
      resumePath:safeUserFilePath(profile.resumePath, 'resume') ? profile.resumePath : '',
      resumeName:typeof profile.resumeName === 'string' ? profile.resumeName : '',
      resumeMime:typeof profile.resumeMime === 'string' ? profile.resumeMime : ''
    }));

  if (savedProfiles.length === 0) {
    const legacy = metadata.resume_profile;
    if (legacy && typeof legacy === 'object'
      && Object.values(legacy).some(value => typeof value === 'string' && value.trim())) {
      savedProfiles.push({
        id:crypto.randomUUID(),
        type:'job',
        label:t('jobTitle'),
        data:{
          name:metadata.full_name || user.email || '',
          email:user.email || '',
          country:metadata.country || '',
          city:metadata.city || '',
          objective:legacy.summary || '',
          experience:legacy.experience || '',
          education:legacy.education || '',
          skills:legacy.skills || ''
        },
        photoPath:'',
        resumePath:safeUserFilePath(metadata.resume_file_path, 'resume') ? metadata.resume_file_path : '',
        resumeName:metadata.resume_file_name || ''
      });
    }
  }
  renderSavedProfiles();
  renderProfileTypeChoices();
}

async function persistProfiles(profiles) {
  const serialized = JSON.stringify(profiles);
  if (serialized.length > 45000) throw new Error(t('storageLimit'));
  const { data, error } = await supabaseClient.auth.updateUser({
    data: { professional_profiles:profiles }
  });
  if (error) throw error;
  currentUser = data.user || currentUser;
  savedProfiles = profiles;
  renderSavedProfiles();
}

function validateProfilePhoto(file) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    && file.size > 0 && file.size <= 5 * 1024 * 1024;
}

async function prepareProfilePhoto(file) {
  if (!validateProfilePhoto(file)) throw new Error(t('imageInvalid'));
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error(t('imageInvalid'));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (!blob) throw new Error(t('imageInvalid'));
    return blob;
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function uploadPrivateFile(bucket, path, file, contentType) {
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, {
    upsert:false,
    contentType,
    cacheControl:'3600'
  });
  if (error) throw error;
}

async function cleanupUploadedFiles(files) {
  for (const [bucket, path] of files) {
    const { error } = await supabaseClient.storage.from(bucket).remove([path]);
    if (error) console.error(`Could not clean up an unlinked file in ${bucket}:`, error);
  }
}

async function removeReplacedFiles(previous, next) {
  const removed = [];
  if (previous?.photoPath && previous.photoPath !== next.photoPath
    && safeUserFilePath(previous.photoPath, 'jpg')) {
    removed.push(['private-resume-photos', previous.photoPath]);
  }
  if (previous?.resumePath && previous.resumePath !== next.resumePath
    && safeUserFilePath(previous.resumePath, 'resume')) {
    removed.push(['private-resumes', previous.resumePath]);
  }
  for (const [bucket, path] of removed) {
    const { error } = await supabaseClient.storage.from(bucket).remove([path]);
    if (error) console.error(`Could not remove a replaced private file from ${bucket}:`, error);
  }
}

async function saveProfile(event) {
  event.preventDefault();
  if (!selectedType) {
    showProfileStatus(t('selectType'), true);
    return;
  }
  const data = collectProfileData();
  if (!data.name) {
    showProfileStatus(t('enterName'), true);
    $('common-name').focus();
    return;
  }
  if (photoFile && !validateProfilePhoto(photoFile)) {
    showProfileStatus(t('imageInvalid'), true);
    return;
  }

  const saveButton = $('saveResumeProfileBtn');
  saveButton.disabled = true;
  showProfileStatus('');
  const previous = findProfile(activeProfileId);
  const newFiles = [];
  let nextPhotoPath = removePhoto ? '' : (previous?.photoPath || savedPhotoPath);
  let nextResumePath = previous?.resumePath || resumeFilePath;
  let nextResumeName = previous?.resumeName || resumeFileName;
  let nextResumeMime = previous?.resumeMime || resumeFileMime;
  try {
    if (photoFile) {
      const image = await prepareProfilePhoto(photoFile);
      nextPhotoPath = `${currentUser.id}/${crypto.randomUUID()}.jpg`;
      await uploadPrivateFile('private-resume-photos', nextPhotoPath, image, 'image/jpeg');
      newFiles.push(['private-resume-photos', nextPhotoPath]);
    }
    const newResume = $('resumeFileInput').files?.[0] || null;
    if (newResume) {
      const fileInfo = await validateResumeFile(newResume);
      nextResumePath = `${currentUser.id}/${crypto.randomUUID()}.${fileInfo.extension}`;
      await uploadPrivateFile('private-resumes', nextResumePath, newResume, fileInfo.mime);
      newFiles.push(['private-resumes', nextResumePath]);
      nextResumeName = newResume.name;
      nextResumeMime = fileInfo.mime;
    }

    const profile = {
      id:activeProfileId || crypto.randomUUID(),
      type:selectedType.id,
      label:$('profileDisplayName').value.trim() || t(selectedType.title),
        templateId:selectedTemplateId,
        data,
      photoPath:nextPhotoPath,
      resumePath:nextResumePath,
        resumeName:nextResumeName,
        resumeMime:nextResumeMime
    }
    const profiles = savedProfiles.filter(item => item.id !== profile.id);
    profiles.unshift(profile);
    await persistProfiles(profiles);
    activeProfileId = profile.id;
    $('editingProfileId').value = profile.id;
    savedPhotoPath = nextPhotoPath;
    photoFile = null;
    removePhoto = false;
    photoUrl = '';
    if ($('profilePhotoInput')) $('profilePhotoInput').value = '';
    resumeFilePath = nextResumePath;
    resumeFileName = nextResumeName;
    resumeFileMime = nextResumeMime;
    if ($('resumeFileInput')) $('resumeFileInput').value = '';
    renderSavedProfiles();
    updateResumeFileControls();
    $('deleteProfileBtn').hidden = false;
    await removeReplacedFiles(previous, profile);
    showProfileStatus(t('saved'));
  } catch (error) {
    await cleanupUploadedFiles(newFiles);
    console.error('Could not save professional profile:', error);
    showProfileStatus(error.message || t('saveFailed'), true);
  } finally {
    saveButton.disabled = false;
  }
}

const RESUME_FILE_TYPES = {
  pdf:{ mime:'application/pdf' },
  doc:{ mime:'application/msword' },
  docx:{ mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  ppt:{ mime:'application/vnd.ms-powerpoint' },
  pptx:{ mime:'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  png:{ mime:'image/png' },
  jpg:{ mime:'image/jpeg' },
  jpeg:{ mime:'image/jpeg' },
  webp:{ mime:'image/webp' }
};

function getResumeFileInfo(file) {
  const extension = file?.name?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  const type = RESUME_FILE_TYPES[extension];
  if (!type || !file.size || file.size > 5 * 1024 * 1024) {
    throw new Error(t('invalidResumeFile'));
  }
  const compatibleTypes = [type.mime, '', 'application/octet-stream'];
  if (['docx', 'pptx'].includes(extension)) compatibleTypes.push('application/zip');
  if (!compatibleTypes.includes(file.type)) {
    throw new Error(t('invalidResumeFile'));
  }
  return { extension, mime:type.mime };
}

function resumeMimeFromName(name) {
  const extension = String(name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  return RESUME_FILE_TYPES[extension]?.mime || '';
}

async function validateResumeFile(file) {
  const fileInfo = getResumeFileInfo(file);
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = bytes => bytes.every((byte, index) => signature[index] === byte);
  const validSignature = {
    pdf:() => startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]),
    doc:() => startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    docx:() => startsWith([0x50, 0x4b, 0x03, 0x04]),
    ppt:() => startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    pptx:() => startsWith([0x50, 0x4b, 0x03, 0x04]),
    png:() => startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    jpg:() => startsWith([0xff, 0xd8, 0xff]),
    jpeg:() => startsWith([0xff, 0xd8, 0xff]),
    webp:() => startsWith([0x52, 0x49, 0x46, 0x46])
      && String.fromCharCode(...signature.slice(8, 12)) === 'WEBP'
  }[fileInfo.extension]();
  if (!validSignature) throw new Error(t('invalidResumeFile'));
  if (fileInfo.extension === 'pdf') await addBrandingToPdf(await file.arrayBuffer());
  return fileInfo;
}

function currentProfileSnapshot() {
  return {
    id:activeProfileId,
    type:selectedType?.id,
    templateId:selectedTemplateId,
    label:$('profileDisplayName').value.trim() || t(selectedType?.title || 'untitled'),
    data:collectProfileData(),
    photoPath:removePhoto ? '' : savedPhotoPath,
    resumePath:resumeFilePath,
    resumeName:resumeFileName,
    resumeMime:resumeFileMime
  };
}

async function uploadResumeFile() {
  const file = $('resumeFileInput').files?.[0];
  if (!file) {
    resumeFileStatus.textContent = t('chooseFirst');
    return;
  }
  let fileInfo;
  try {
    fileInfo = await validateResumeFile(file);
    if (!activeProfileId) {
      resumeFileStatus.textContent = t('saveProfileFirst');
      return;
    }
  } catch (error) {
    resumeFileStatus.textContent = error.message || t('invalidResumeFile');
    return;
  }

  const button = $('uploadResumeBtn');
  button.disabled = true;
  resumeFileStatus.textContent = t('uploading');
  let uploadedPath = '';
  try {
    uploadedPath = `${currentUser.id}/${crypto.randomUUID()}.${fileInfo.extension}`;
    await uploadPrivateFile('private-resumes', uploadedPath, file, fileInfo.mime);
    const previous = findProfile(activeProfileId);
    const next = {
      ...currentProfileSnapshot(),
      resumePath:uploadedPath,
      resumeName:file.name,
      resumeMime:fileInfo.mime
    };
    const profiles = savedProfiles.map(profile => profile.id === activeProfileId ? next : profile);
    await persistProfiles(profiles);
    resumeFilePath = uploadedPath;
    resumeFileName = file.name;
    resumeFileMime = fileInfo.mime;
    $('resumeFileInput').value = '';
    updateResumeFileControls();
    if (previous) await removeReplacedFiles(previous, next);
    resumeFileStatus.textContent = t('uploaded');
  } catch (error) {
    if (uploadedPath) await cleanupUploadedFiles([['private-resumes', uploadedPath]]);
    console.error('Could not upload private profile file:', error);
    resumeFileStatus.textContent = error.message || t('uploadFailed');
  } finally {
    button.disabled = false;
  }
}

async function removeUploadedResume() {
  if (!safeUserFilePath(resumeFilePath, 'resume')) {
    resumeFileStatus.textContent = t('noAvailable');
    return;
  }
  const button = $('removeUploadedResumeBtn');
  button.disabled = true;
  try {
    const previous = findProfile(activeProfileId);
    const next = { ...currentProfileSnapshot(), resumePath:'', resumeName:'', resumeMime:'' };
    const profiles = savedProfiles.map(profile => profile.id === activeProfileId ? next : profile);
    await persistProfiles(profiles);
    resumeFilePath = '';
    resumeFileName = '';
    resumeFileMime = '';
    updateResumeFileControls();
    if (previous) await removeReplacedFiles(previous, next);
    resumeFileStatus.textContent = t('removed');
  } catch (error) {
    console.error('Could not remove private profile file:', error);
    resumeFileStatus.textContent = error.message || t('removeFailed');
  } finally {
    button.disabled = false;
  }
}

function requirePdfLibrary() {
  if (!window.PDFLib?.PDFDocument || !window.PDFLib?.StandardFonts) {
    throw new Error(t('pdfUnavailable'));
  }
  return window.PDFLib;
}

function brandedPdfName(name) {
  const safeName = String(name || 'profile')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${safeName || 'profile'}-time2income.pdf`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function openResumePrintPreview(profile, popup) {
  const type = getType(profile.type);
  if (!type) throw new Error(t('selectType'));
  const template = getTemplate(profile.templateId);
  const photo = profile.photoPath && safeUserFilePath(profile.photoPath, 'jpg')
    ? supabaseClient.storage.from('private-resume-photos').createSignedUrl(profile.photoPath, 300)
    : Promise.resolve({ data:null, error:null });
  return photo.then(({ data, error }) => {
    if (error) throw error;
    const markup = buildResumeMarkup(profile, type, photo?.signedUrl || '');
    popup.document.open();
    popup.document.write(`<!doctype html>
      <html lang="${escapeHtml(profileLanguage)}">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>${escapeHtml(profile.data.name)} - ${escapeHtml(templateText(template.id, 0))}</title>
        <style>
          @page{size:A4;margin:15mm 15mm 18mm}
          *{box-sizing:border-box}
          body{margin:0;color:#24312a;font:10pt/1.55 Arial,"Noto Sans Devanagari","Noto Sans Gujarati",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .resume-sheet{--accent:#083574;--heading:#182537;--header-bg:#083574;--header-text:#fff;--soft:#edf1f6;--rule:#d8dde4;--body-font:Arial,"Noto Sans Devanagari","Noto Sans Gujarati",sans-serif;--title-font:Arial,"Noto Sans Devanagari","Noto Sans Gujarati",sans-serif;display:grid;grid-template-columns:minmax(0,1fr);align-content:start;min-height:255mm;font-family:var(--body-font)}
          .resume-heading{position:relative;display:flex;align-items:center;gap:8mm;min-height:37mm;margin:0 0 8mm;padding:9mm;background:var(--header-bg);color:var(--header-text)}
          .resume-heading-copy{min-width:0;flex:1}
          .resume-heading h1{max-width:100%;margin:0;font-family:var(--title-font);font-size:25pt;line-height:1.14;overflow-wrap:anywhere}
          .resume-headline{margin:2mm 0 0;font-size:11pt}
          .resume-role{margin:2mm 0 0;font-size:8pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.82}
          .resume-contact-line{display:flex;flex-wrap:wrap;gap:1mm 4mm;margin-top:4mm;font-size:8pt;overflow-wrap:anywhere}
          .resume-photo{flex:0 0 auto;width:27mm;height:27mm;border:1mm solid rgba(255,255,255,.55);border-radius:50%;object-fit:cover}
          .resume-sidebar{display:none}
          .resume-content{min-width:0}
          .resume-section{margin:0 0 6mm;break-inside:avoid}
          .resume-section h2,.resume-sidebar>h2{margin:0 0 2mm;padding:0 0 1.5mm;border-bottom:.4mm solid var(--rule);color:var(--accent);font-family:var(--title-font);font-size:10pt;line-height:1.3;text-transform:uppercase;letter-spacing:.08em}
          .resume-section p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
          .resume-brand{position:fixed;right:0;bottom:-12mm;left:0;padding:2mm 0;border-top:.3mm solid var(--rule);background:#fff;color:var(--accent);font-size:8pt;font-weight:700;text-align:center}
          .template-swiss{--accent:#24487a;--heading:#18263a;--header-bg:#fff;--header-text:#18263a;--soft:#edf1f7;--rule:#9eadc1;--title-font:Georgia,"Noto Serif",serif}
          .template-swiss .resume-heading{border-top:2mm solid var(--accent);border-bottom:.5mm solid var(--rule)}
          .template-swiss .resume-content{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5mm}
          .template-mono{--accent:#252525;--heading:#181818;--header-bg:#fff;--header-text:#181818;--soft:#f3f3f3;--rule:#222;--body-font:Arial,"Noto Sans Devanagari","Noto Sans Gujarati",sans-serif}
          .template-mono .resume-heading{border-bottom:1mm solid var(--accent)}
          .template-mono .resume-heading h1{letter-spacing:.07em;text-transform:uppercase}
          .template-editorial{--accent:#305c9a;--heading:#1f2732;--header-bg:#e5ecf5;--header-text:#1f2732;--soft:#e5ecf5;--rule:#adbfd8;--title-font:Georgia,"Noto Serif",serif}
          .template-editorial .resume-heading{justify-content:center;text-align:center}
          .template-editorial .resume-contact-line{justify-content:center}
          .template-coral{--accent:#4278c4;--heading:#2c3440;--header-bg:#eff6ff;--header-text:#2c3440;--soft:#eff6ff;--rule:#bdd1ed}
          .resume-sheet.template-coral{grid-template-columns:52mm minmax(0,1fr);column-gap:8mm}
          .template-coral .resume-heading{grid-column:1/-1;border-left:3mm solid var(--accent)}
          .template-coral .resume-contact-line{display:none}
          .template-coral .resume-sidebar{display:block;min-width:0;padding:5mm;background:#eff6ff;color:#2c3440;overflow-wrap:anywhere}
          .template-coral .resume-sidebar>h2,.template-coral .resume-sidebar .resume-section h2{color:var(--accent)}
          .template-coral .resume-sidebar .resume-section{margin-top:5mm}
          .template-coral .resume-sidebar-contacts{font-size:8pt}
          .template-coral .resume-brand{grid-column:1/-1}
          .template-executive{--accent:#4874b1;--heading:#17263a;--header-bg:#17263a;--header-text:#fff;--soft:#f1f3f7;--rule:#c8d0dc}
          .template-executive .resume-heading{border-bottom:1.5mm solid var(--accent)}
          .template-executive .resume-content,.template-studio .resume-content{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5mm}
          .template-aurora{--accent:#547db6;--heading:#243650;--header-bg:#44689b;--header-text:#fff;--soft:#eff4fb;--rule:#d0dcee}
          .resume-sheet.template-aurora{grid-template-columns:52mm minmax(0,1fr);column-gap:8mm}
          .template-aurora .resume-heading{grid-column:1/-1;border-radius:0 0 8mm 0}
          .template-aurora .resume-contact-line{display:none}
          .template-aurora .resume-sidebar{display:block;min-width:0;padding:5mm;background:#243650;color:#fff;overflow-wrap:anywhere}
          .template-aurora .resume-sidebar>h2,.template-aurora .resume-sidebar .resume-section h2{border-color:rgba(255,255,255,.35);color:#bfdaff}
          .template-aurora .resume-sidebar .resume-section{margin-top:5mm}
          .template-aurora .resume-sidebar .resume-section p,.template-aurora .resume-sidebar-contacts{font-size:8pt;overflow-wrap:anywhere}
          .template-aurora .resume-brand{grid-column:1/-1}
          .template-nordic{--accent:#526073;--heading:#262e39;--header-bg:#edf0f3;--header-text:#262e39;--soft:#edf0f3;--rule:#cfd5dd}
          .template-nordic .resume-heading{border-bottom:1mm solid var(--accent)}
          .template-nordic .resume-section{padding-left:3mm;border-left:.5mm solid var(--rule)}
          .template-compact{--accent:#083c85;--heading:#182940;--header-bg:#fff;--header-text:#182940;--soft:#edf0f5;--rule:#c7d0dd}
          .template-compact .resume-heading{min-height:24mm;margin-bottom:5mm;padding:4mm 0;border-bottom:.6mm solid var(--accent)}
          .template-compact .resume-heading h1{font-size:21pt}
          .template-compact .resume-section{margin-bottom:3.5mm}
          .template-compact .resume-section h2{margin-bottom:1mm;padding-bottom:.7mm;font-size:9pt}
          .template-studio{--accent:#4886de;--heading:#fff;--header-bg:#22242b;--header-text:#fff;--soft:#ebeff4;--rule:#c9d2df}
          .template-studio .resume-heading{border-bottom:1.5mm solid var(--accent)}
          .template-studio .resume-section h2{display:inline-block;padding:1mm 2mm;border:0;border-left:1.2mm solid var(--accent);background:var(--soft)}
          .template-sidebar{--accent:#fff;--heading:#182537;--header-bg:#083574;--header-text:#fff;--soft:#edf1f6;--rule:#d8dde4}
          .resume-sheet.template-sidebar{grid-template-columns:58mm minmax(0,1fr);column-gap:8mm}
          .template-sidebar .resume-heading{grid-column:1/-1}
          .template-sidebar .resume-contact-line{display:none}
          .template-sidebar .resume-sidebar{display:block;min-width:0;padding:5mm;background:#182537;color:#fff;overflow-wrap:anywhere}
          .template-sidebar .resume-sidebar>h2,.template-sidebar .resume-sidebar .resume-section h2{border-color:rgba(255,255,255,.35);color:#a7c0e4}
          .template-sidebar .resume-sidebar .resume-section{margin-top:5mm}
          .template-sidebar .resume-sidebar .resume-section p,.template-sidebar .resume-sidebar-contacts{font-size:8pt;overflow-wrap:anywhere}
          .template-sidebar .resume-content{padding-top:2mm}
          .template-sidebar .resume-brand{color:#083574}
          @media screen{body{min-height:100vh;padding:18px;background:#eef0f3}.resume-sheet{width:min(100%,760px);min-height:850px;margin:0 auto;padding:34px;background:#fff;box-shadow:0 12px 40px rgba(20,54,35,.12)}.resume-heading{min-height:154px;margin-bottom:26px;padding:28px}.resume-heading h1{font-size:clamp(23px,4vw,34px)}.resume-headline{margin-top:8px}.resume-role{margin-top:8px}.resume-contact-line{margin-top:12px}.resume-photo{width:92px;height:92px}.resume-section{margin-bottom:24px}.resume-section h2,.resume-sidebar>h2{margin-bottom:8px;padding-bottom:5px;font-size:11px}.resume-sidebar{padding:18px!important}.resume-brand{position:static;align-self:end;margin-top:30px;padding:10px 0}.template-sidebar{grid-template-columns:180px minmax(0,1fr)}.template-sidebar .resume-heading{grid-column:1/-1}.template-sidebar .resume-content{padding-top:10px}.template-compact .resume-heading{min-height:90px;padding:14px 0}.template-compact .resume-section{margin-bottom:14px}}
          @media print{body{background:#fff}.resume-sheet{min-height:255mm;padding:0;box-shadow:none}.resume-heading{break-inside:avoid}.resume-section{orphans:3;widows:3}.resume-brand{position:fixed}.template-sidebar .resume-brand{color:#083574}}
        </style>
      </head>
      <body>${markup}
        <script>window.addEventListener('load',function(){setTimeout(function(){window.focus();window.print();},500);});<\/script>
      </body></html>`);
    popup.document.close();
  });
}

async function addBrandingToPdf(bytes) {
  const { PDFDocument, StandardFonts, rgb } = requirePdfLibrary();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.setProducer('TIME2INCOME');
  pdf.setCreator('TIME2INCOME');
  pdf.getPages().forEach(page => {
    const { width } = page.getSize();
    const text = 'time2income.com  |  Powered by Spactisu';
    const size = 9;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawRectangle({
      x:0, y:0, width, height:28, color:rgb(1, 1, 1)
    });
    page.drawText(text, {
      x:Math.max(24, (width - textWidth) / 2),
      y:10, size, font, color:rgb(0.04, 0.31, 0.23)
    });
  });
  return pdf.save();
}

function pdfSafeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, '');
}

function wrapPdfText(text, font, fontSize, maxWidth) {
  const lines = [];
  String(text || '').split(/\r?\n/).forEach(paragraph => {
    const words = pdfSafeText(paragraph).trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      return;
    }
    let line = '';
    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

async function embedPrivatePhoto(pdf, path) {
  if (!path) return null;
  if (!safeUserFilePath(path, 'jpg')) throw new Error(t('photoMissing'));
  const { data, error } = await supabaseClient.storage.from('private-resume-photos').download(path);
  if (error) throw error;
  return pdf.embedJpg(new Uint8Array(await data.arrayBuffer()));
}

function drawFooter(page, font, green, width) {
  const text = 'time2income.com  |  Powered by Spactisu';
  const size = 9;
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawRectangle({ x:0, y:0, width, height:28, color:window.PDFLib.rgb(1, 1, 1) });
  page.drawText(text, {
    x:Math.max(24, (width - textWidth) / 2),
    y:10, size, font, color:green
  });
}

async function createProfilePdf(profile) {
  const { PDFDocument, StandardFonts, rgb } = requirePdfLibrary();
  const type = getType(profile.type);
  if (!type || !profile.data?.name
    || !Object.values(profile.data).some(value => typeof value === 'string' && value.trim())) {
    throw new Error(t('noDetails'));
  }

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.04, 0.31, 0.23);
  const ink = rgb(0.12, 0.18, 0.15);
  const muted = rgb(0.35, 0.41, 0.37);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  const profilePhoto = await embedPrivatePhoto(pdf, profile.photoPath);
  let page;
  let cursorY;

  function addPage(first = false) {
    page = pdf.addPage([pageWidth, pageHeight]);
    cursorY = pageHeight - margin;
    if (first) {
      page.drawRectangle({
        x:0, y:pageHeight - 130, width:pageWidth, height:130, color:green
      });
      const photoSpace = profilePhoto ? 90 : 0;
      const textWidth = contentWidth - photoSpace;
      page.drawText(pdfSafeText(profile.data.name), {
        x:margin, y:pageHeight - 62, size:23, font:bold,
        color:rgb(1, 1, 1), maxWidth:textWidth
      });
      if (profile.data.headline) {
        page.drawText(pdfSafeText(profile.data.headline), {
          x:margin, y:pageHeight - 87, size:11, font:regular,
          color:rgb(0.88, 0.96, 0.91), maxWidth:textWidth
        });
      }
      page.drawText(pdfSafeText(t(type.title).toUpperCase()), {
        x:margin, y:pageHeight - 108, size:9, font:bold,
        color:rgb(0.75, 0.9, 0.8), maxWidth:textWidth
      });
      if (profilePhoto) {
        const dimensions = profilePhoto.scale(1);
        const scale = Math.min(78 / dimensions.width, 78 / dimensions.height);
        page.drawImage(profilePhoto, {
          x:pageWidth - margin - dimensions.width * scale,
          y:pageHeight - 104,
          width:dimensions.width * scale,
          height:dimensions.height * scale
        });
      }
      cursorY = pageHeight - 155;
    }
  }

  function drawTextSection(title, body) {
    if (!body) return;
    const fontSize = 10.5;
    const lineHeight = 15;
    const lines = wrapPdfText(body, regular, fontSize, contentWidth);
    if (cursorY - 28 < margin + 35) addPage();
    page.drawText(pdfSafeText(title.toUpperCase()), {
      x:margin, y:cursorY, size:10, font:bold, color:green
    });
    cursorY -= 9;
    page.drawLine({
      start:{ x:margin, y:cursorY },
      end:{ x:pageWidth - margin, y:cursorY },
      thickness:0.7,
      color:rgb(0.82, 0.88, 0.83)
    });
    cursorY -= 16;
    lines.forEach(line => {
      if (cursorY < margin + 35) addPage();
      if (line) {
        page.drawText(line, {
          x:margin, y:cursorY, size:fontSize, font:regular,
          color:ink, maxWidth:contentWidth
        });
      }
      cursorY -= lineHeight;
    });
    cursorY -= 12;
  }

  addPage(true);
  const contact = [
    profile.data.email,
    profile.data.phone,
    [profile.data.city, profile.data.country].filter(Boolean).join(', '),
    profile.data.languages ? `${t('languages')}: ${profile.data.languages}` : '',
    profile.data.website,
    profile.data.linkedin
  ].filter(Boolean).join('  ·  ');
  drawTextSection(t('commonTitle'), contact);
  type.fields.forEach(([key, labelKey]) => drawTextSection(t(labelKey), profile.data[key]));
  pdf.setTitle(`${pdfSafeText(profile.data.name)} - ${pdfSafeText(t(type.title))}`);
  pdf.setAuthor('TIME2INCOME');
  pdf.getPages().forEach(pageToBrand => drawFooter(pageToBrand, regular, green, pageWidth));
  return pdf.save();
}

async function downloadProfilePdf() {
  if (!selectedType) {
    showProfileStatus(t('selectType'), true);
    return;
  }
  const button = $('downloadProfileResumeBtn');
  button.disabled = true;
  showProfileStatus('');
  let popup = null;
  try {
    const profile = currentProfileSnapshot();
    if (!profile.data.name) throw new Error(t('noDetails'));
    popup = window.open('', '_blank');
    if (!popup) throw new Error('Allow pop-ups to open the résumé print preview.');
    await openResumePrintPreview(profile, popup);
    showProfileStatus(t('printReady'));
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    console.error('Could not create branded profile PDF:', error);
    showProfileStatus(error.message || t('downloadFailed'), true);
  } finally {
    button.disabled = false;
  }
}

function getProfileExportStyle(templateId) {
  const styles = {
    verdant:{ accent:'087443', header:'087443', headerText:'FFFFFF', soft:'EDF6F0' },
    swiss:{ accent:'245B7A', header:'FFFFFF', headerText:'182D3A', soft:'EDF3F7' },
    mono:{ accent:'252525', header:'FFFFFF', headerText:'181818', soft:'F3F3F3' },
    editorial:{ accent:'9A6B30', header:'F5EFE5', headerText:'32291F', soft:'F5EFE5' },
    coral:{ accent:'C45142', header:'FFF3EF', headerText:'402C2C', soft:'FFF3EF' },
    executive:{ accent:'B18B48', header:'17243A', headerText:'FFFFFF', soft:'F1F3F7' },
    aurora:{ accent:'6554B6', header:'52449B', headerText:'FFFFFF', soft:'F0EFFB' },
    nordic:{ accent:'52735F', header:'EEF3ED', headerText:'26392E', soft:'EEF3ED' },
    sidebar:{ accent:'087443', header:'087443', headerText:'FFFFFF', soft:'EDF6F0' },
    studio:{ accent:'DE9B48', header:'22242B', headerText:'FFFFFF', soft:'F4F1EB' }
  };
  return styles[getTemplate(templateId).id] || styles.verdant;
}

function getProfileExportSections(profile, type) {
  return type.fields
    .map(([key, label]) => ({ title:t(label), value:String(profile.data[key] || '').trim() }))
    .filter(section => section.value);
}

function profileExportFileName(profile, extension) {
  const safeName = String(profile.data.name || 'profile')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${safeName || 'profile'}-time2income.${extension}`;
}

async function downloadProfileDocx(profile, type) {
  if (!window.docx?.Document || !window.docx?.Packer) throw new Error(t('docxUnavailable'));
  const { AlignmentType, BorderStyle, Document, Footer, Packer, Paragraph, TextRun } = window.docx;
  const style = getProfileExportStyle(profile.templateId);
  const sections = getProfileExportSections(profile, type);
  const children = [
    new Paragraph({
      spacing:{ after:100 },
      children:[new TextRun({ text:profile.data.name, bold:true, color:style.headerText, size:34 })]
    }),
    ...(profile.data.headline ? [new Paragraph({
      spacing:{ after:80 },
      children:[new TextRun({ text:profile.data.headline, color:style.accent, size:24 })]
    })] : []),
    new Paragraph({
      spacing:{ after:160 },
      children:[new TextRun({ text:t(type.title).toUpperCase(), bold:true, color:style.accent, size:18 })]
    }),
    new Paragraph({
      spacing:{ after:260 },
      children:[new TextRun({
        text:getResumeContacts(profile.data).join('  ·  '),
        color:'56645B',
        size:18
      })]
    })
  ];
  sections.forEach(section => {
    children.push(
      new Paragraph({
        keepNext:true,
        spacing:{ before:150, after:70 },
        border:{ bottom:{ color:style.accent, space:1, size:6, style:BorderStyle.SINGLE } },
        children:[new TextRun({ text:section.title.toUpperCase(), bold:true, color:style.accent, size:20 })]
      }),
      ...section.value.split(/\r?\n/).map(line => new Paragraph({
        spacing:{ after:50 },
        children:[new TextRun({ text:line, size:20 })]
      }))
    );
  });
  const footer = new Footer({ children:[new Paragraph({
    alignment:AlignmentType.CENTER,
    children:[new TextRun({
      text:'time2income.com | Powered by Spactisu',
      bold:true,
      color:style.accent,
      size:16
    })]
  })] });
  const document = new Document({
    creator:'TIME2INCOME',
    title:`${profile.data.name} - ${t(type.title)}`,
    sections:[{
      properties:{ page:{ margin:{ top:720, right:900, bottom:1100, left:900 } } },
      footers:{ default:footer },
      children
    }]
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(blob, profileExportFileName(profile, 'docx'));
}

function splitExportText(value, maxLength = 640) {
  const words = String(value).split(/\s+/).filter(Boolean);
  const chunks = [];
  let chunk = '';
  words.forEach(word => {
    const next = chunk ? `${chunk} ${word}` : word;
    if (chunk && next.length > maxLength) {
      chunks.push(chunk);
      chunk = word;
    } else {
      chunk = next;
    }
  });
  if (chunk) chunks.push(chunk);
  return chunks;
}

async function downloadProfilePptx(profile, type) {
  if (typeof window.PptxGenJS !== 'function') throw new Error(t('pptxUnavailable'));
  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'TIME2INCOME';
  pptx.subject = t(type.title);
  pptx.title = `${profile.data.name} - ${t(type.title)}`;
  pptx.company = 'Spactisu';
  pptx.theme = {
    headFontFace:'Aptos Display',
    bodyFontFace:'Aptos',
    lang:profileLanguage
  };
  const style = getProfileExportStyle(profile.templateId);
  const sections = getProfileExportSections(profile, type);
  const slideWidth = 13.333;
  const addFooter = slide => slide.addText('time2income.com | Powered by Spactisu', {
    x:0.55, y:7.13, w:12.23, h:0.18,
    color:style.accent, fontFace:'Aptos', fontSize:9,
    align:'center', margin:0, breakLine:false
  });
  const addHeader = (slide, first) => {
    slide.background = { color:'FFFFFF' };
    slide.addShape(pptx.ShapeType.rect, {
      x:0, y:0, w:slideWidth, h:first ? 1.65 : 0.13,
      line:{ color:style.header, transparency:100 },
      fill:{ color:style.header }
    });
    if (first) {
      slide.addText(profile.data.name, {
        x:0.65, y:0.34, w:11.9, h:0.47,
        color:style.headerText, bold:true, fontFace:'Aptos Display',
        fontSize:27, breakLine:false, margin:0, fit:'shrink'
      });
      if (profile.data.headline) slide.addText(profile.data.headline, {
        x:0.67, y:0.88, w:11.7, h:0.25,
        color:style.headerText, fontFace:'Aptos', fontSize:14,
        breakLine:false, margin:0, fit:'shrink'
      });
      slide.addText(t(type.title).toUpperCase(), {
        x:0.67, y:1.26, w:11.7, h:0.18,
        color:style.headerText, bold:true, fontFace:'Aptos',
        fontSize:10, charSpacing:1, breakLine:false, margin:0
      });
      const contacts = getResumeContacts(profile.data).join('  |  ');
      if (contacts) slide.addText(contacts, {
        x:0.65, y:1.87, w:12, h:0.48,
        color:'56645B', fontFace:'Aptos', fontSize:11,
        breakLine:false, margin:0.04, fit:'shrink'
      });
    } else {
      slide.addText(profile.data.name, {
        x:0.6, y:0.35, w:12, h:0.38,
        color:'26372D', bold:true, fontFace:'Aptos Display',
        fontSize:20, breakLine:false, margin:0, fit:'shrink'
      });
      slide.addText(t(type.title), {
        x:0.62, y:0.81, w:12, h:0.24,
        color:style.accent, fontFace:'Aptos', fontSize:11,
        breakLine:false, margin:0
      });
    }
    addFooter(slide);
  };
  const chunks = sections.flatMap(section => splitExportText(section.value)
    .map((value, index) => ({ title:index ? `${section.title} (continued)` : section.title, value })));
  const firstSlide = pptx.addSlide();
  addHeader(firstSlide, true);
  let chunkIndex = 0;
  let slide = firstSlide;
  let y = 2.55;
  while (chunkIndex < chunks.length) {
    const chunk = chunks[chunkIndex];
    const body = chunk.value.split(/\r?\n/).join('\n');
    const estimatedHeight = Math.min(2.15, Math.max(1.05, 0.65 + body.length / 360));
    if (y + estimatedHeight > 6.85) {
      slide = pptx.addSlide();
      addHeader(slide, false);
      y = 1.45;
    }
    slide.addShape(pptx.ShapeType.roundRect, {
      x:0.55, y, w:12.23, h:estimatedHeight,
      rectRadius:0.08,
      line:{ color:style.soft, transparency:100 },
      fill:{ color:style.soft }
    });
    slide.addText(chunk.title.toUpperCase(), {
      x:0.78, y:y + 0.16, w:11.75, h:0.22,
      color:style.accent, bold:true, fontFace:'Aptos',
      fontSize:11, charSpacing:0.8, breakLine:false, margin:0
    });
    slide.addText(body, {
      x:0.78, y:y + 0.49, w:11.75, h:estimatedHeight - 0.62,
      color:'26312A', fontFace:'Aptos', fontSize:13,
      breakLine:false, margin:0, valign:'top', fit:'shrink'
    });
    y += estimatedHeight + 0.2;
    chunkIndex += 1;
  }
  const blob = await pptx.write({ outputType:'blob' });
  downloadBlob(blob, profileExportFileName(profile, 'pptx'));
}

async function downloadProfileImage(profile) {
  if (typeof window.html2canvas !== 'function') throw new Error(t('imageUnavailable'));
  const source = $('profileLivePreview').querySelector('.resume-sheet');
  if (!source) throw new Error(t('noDetails'));
  const wrapper = document.createElement('div');
  wrapper.className = 'profile-live-preview';
  Object.assign(wrapper.style, {
    position:'fixed',
    left:'-10000px',
    top:'0',
    zIndex:'-1',
    width:'760px',
    maxHeight:'none',
    overflow:'visible'
  });
  const clone = source.cloneNode(true);
  wrapper.append(clone);
  document.body.append(wrapper);
  try {
    await document.fonts.ready;
    const canvas = await window.html2canvas(clone, {
      backgroundColor:'#ffffff',
      scale:2,
      useCORS:true,
      logging:false
    });
    const format = $('profileExportFormat').value === 'jpg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'image/jpeg' ? 'jpg' : 'png';
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.94));
    if (!blob) throw new Error(t('downloadFailed'));
    downloadBlob(blob, profileExportFileName(profile, extension));
  } finally {
    wrapper.remove();
  }
}

async function downloadSelectedProfile() {
  if (!selectedType) {
    showProfileStatus(t('selectType'), true);
    return;
  }
  const format = $('profileExportFormat').value;
  if (format === 'pdf') return downloadProfilePdf();
  const button = $('downloadProfileResumeBtn');
  button.disabled = true;
  showProfileStatus('');
  try {
    const profile = currentProfileSnapshot();
    if (!profile.data.name
      || !Object.values(profile.data).some(value => typeof value === 'string' && value.trim())) {
      throw new Error(t('noDetails'));
    }
    if (format === 'docx') await downloadProfileDocx(profile, selectedType);
    else if (format === 'pptx') await downloadProfilePptx(profile, selectedType);
    else if (format === 'png' || format === 'jpg') await downloadProfileImage(profile);
    else throw new Error(t('downloadFailed'));
    showProfileStatus(t('downloaded'));
  } catch (error) {
    console.error(`Could not create branded profile ${format} export:`, error);
    showProfileStatus(error.message || t('downloadFailed'), true);
  } finally {
    button.disabled = false;
  }
}

async function downloadUploadedResume() {
  if (!safeUserFilePath(resumeFilePath, 'resume')) {
    resumeFileStatus.textContent = t('noAvailable');
    return;
  }
  const button = $('downloadUploadedResumeBtn');
  button.disabled = true;
  try {
    const { data, error } = await supabaseClient.storage.from('private-resumes').download(resumeFilePath);
    if (error) throw error;
    const extension = resumeFilePath.split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      const bytes = await addBrandingToPdf(await data.arrayBuffer());
      downloadBlob(new Blob([bytes], { type:'application/pdf' }), brandedPdfName(resumeFileName));
    } else {
      downloadBlob(data, resumeFileName.split(/[\\/]/).pop() || `profile-file.${extension}`);
    }
  } catch (error) {
    console.error('Could not download the private profile file:', error);
    resumeFileStatus.textContent = error.message || t('downloadFailed');
  } finally {
    button.disabled = false;
  }
}

async function removeCurrentProfile() {
  const profile = findProfile(activeProfileId);
  if (!profile || !window.confirm(t('confirmDelete'))) return;
  const button = $('deleteProfileBtn');
  button.disabled = true;
  try {
    await persistProfiles(savedProfiles.filter(item => item.id !== profile.id));
    await removeReplacedFiles(profile, { photoPath:'', resumePath:'' });
    $('profileEditorPanel').hidden = true;
    selectedType = null;
    activeProfileId = '';
    renderProfileTypeChoices();
    renderSavedProfiles();
    showProfileStatus(t('deleted'));
  } catch (error) {
    console.error('Could not delete professional profile:', error);
    showProfileStatus(error.message || t('saveFailed'), true);
  } finally {
    button.disabled = false;
  }
}

async function initializeMyProfile() {
  if (typeof supabaseClient === 'undefined') {
    showProfileStatus(t('serviceUnavailable'), true);
    throw new Error('supabaseClient is not defined');
  }
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) {
    window.location.replace('auth.html?mode=signin&next=my-profile.html');
    return;
  }
  currentUser = data.session.user;
  loadSavedProfiles(currentUser);
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      window.location.replace('auth.html?mode=signin&next=my-profile.html');
    } else if (session.user.id === currentUser.id) {
      currentUser = session.user;
    }
  });
}

$('profileTypeChoices').addEventListener('click', event => {
  const button = event.target.closest('[data-select-profile-type]');
  if (button) selectProfileType(button.dataset.selectProfileType);
});
$('profileTypeChoices').addEventListener('toggle', event => {
  if (event.target.tagName !== 'DETAILS' || !event.target.open) return;
  $('profileTypeChoices').querySelectorAll('details[open]').forEach(details => {
    if (details !== event.target) details.open = false;
  });
}, true);
$('savedProfilesList').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-profile]');
  if (!button) return;
  const profile = findProfile(button.dataset.editProfile);
  if (profile) renderEditProfile(profile);
});
$('profileTemplateGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-profile-template]');
  if (button) selectProfileTemplate(button.dataset.profileTemplate);
});
$('myResumeForm').addEventListener('input', event => {
  if (event.target.matches('input:not([type="file"]), textarea')) renderProfileLivePreview();
});
$('newProfileBtn').addEventListener('click', () => {
  activeProfileId = '';
  selectedType = null;
  selectedTemplateId = 'verdant';
  savedPhotoPath = '';
  resumeFilePath = '';
  resumeFileName = '';
  resumeFileMime = '';
  $('profileEditorPanel').hidden = true;
  $('resumeFileInput').value = '';
  renderProfileTypeChoices();
  renderSavedProfiles();
  $('profileTypeTitle').scrollIntoView({ behavior:'smooth', block:'start' });
});
$('myResumeForm').addEventListener('submit', event => {
  saveProfile(event);
});
$('downloadProfileResumeBtn').addEventListener('click', downloadSelectedProfile);
$('uploadResumeBtn').addEventListener('click', uploadResumeFile);
$('downloadUploadedResumeBtn').addEventListener('click', downloadUploadedResume);
$('removeUploadedResumeBtn').addEventListener('click', removeUploadedResume);
$('deleteProfileBtn').addEventListener('click', removeCurrentProfile);
$('profilePhotoInput').addEventListener('change', event => {
  const file = event.target.files?.[0] || null;
  if (!file) return;
  if (!validateProfilePhoto(file)) {
    event.target.value = '';
    showProfileStatus(t('imageInvalid'), true);
    return;
  }
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoFile = file;
  removePhoto = false;
  photoPreviewUrl = URL.createObjectURL(file);
  setPhotoPreview(photoPreviewUrl);
  renderProfileLivePreview();
});
$('removeProfilePhotoBtn').addEventListener('click', () => {
  photoFile = null;
  photoUrl = '';
  removePhoto = true;
  $('profilePhotoInput').value = '';
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = '';
  setPhotoPreview('');
  renderProfileLivePreview();
});
$('profileSignOut').addEventListener('click', async event => {
  event.currentTarget.disabled = true;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    event.currentTarget.disabled = false;
    showProfileStatus(error.message, true);
  }
});

initializeMyProfile().catch(error => {
  console.error('Could not initialize My Profile:', error);
  showProfileStatus(error.message || t('loadFailed'), true);
});
