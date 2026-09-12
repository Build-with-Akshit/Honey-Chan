export type Language = "hi" | "en";

/**
 * HoneyChain v2 dictionary — source of truth: /content.md.
 * Hindi is the DEFAULT language (plan.md decision #1).
 * Legacy keys (nav*, dashboard*, audioSummary…) are kept so
 * existing pages keep working; new keys use dotted names.
 */
export const translations = {
  en: {
    /* ── v2 global ── */
    "app.name": "HoneyChain",
    "app.tagline": "Every bottle's full truth",
    "action.retry": "Try again",
    "action.next": "Next",
    "action.back": "Back",
    "action.done": "Done",
    "action.details": "Details",
    "action.close": "Close",
    "state.loading": "One moment…",
    "state.empty": "Nothing here yet",
    "error.network": "No internet connection",
    "lang.toggle": "EN | हि",

    /* ── v2 landing ── */
    "land.title": "The whole truth of honey, in one scan",
    "land.sub": "Hive to bottle — every step recorded",
    "land.tile.verify": "Real or fake?",
    "land.tile.verifySub": "Scan the code",
    "land.tile.beekeeper": "Beekeeper",
    "land.tile.beekeeperSub": "See your hives",
    "land.tile.ai": "Advice",
    "land.tile.aiSub": "Weather and disease guidance",
    "land.cta.scan": "Scan a code",
    "land.badge": "KVIC Honey Mission • Blockchain Verified",
    "land.demo": "Try the demo",
    "land.marketplace": "Marketplace",
    "land.login": "Log in",
    "land.register": "Get started",
    "trust.blockchain": "Blockchain secured",
    "trust.iot": "IoT monitored",
    "trust.ai": "AI insights",
    "trust.qr": "QR verified",

    /* ── v2 beekeeper home ── */
    "bk.greeting": "Namaste",
    "bk.node": "KVIC Smart Apiary Node",
    "bk.harvest.cta": "Log Harvest",
    "bk.harvest.ready": "Harvest window open",
    "bk.harvest.readySub": "Hive {hive} is at {kg} kg — the honey is ripe.",
    "bk.alert.title": "Check this hive",
    "bk.alert.sub": "Hive {hive} is at {temp}°C. Check ventilation.",
    "bk.allGood": "All {n} colonies are healthy.",
    "bk.vitals": "Your apiary",
    "bk.hives.title": "Your hives",
    "bk.hives.sub": "Tap a hive for live readings",
    "bk.batches.title": "Recent batches",
    "bk.batches.sub": "On their way to the shop",
    "bk.advice.title": "Advice for you",
    "bk.advice.body": "Weather is good for honey flow. Check the bottom board weekly for mites.",
    "bk.manage": "Manage",
    "bk.viewAll": "See all",
    "bk.sensors": "Sensors",
    "bk.askAi": "Ask AI",
    "bk.temp": "Temp",
    "bk.humidity": "Humidity",
    "bk.online": "All online",

    /* ── v2 tabs + beekeeper desktop sidebar ── */
    "tab.home": "Home",
    "tab.hives": "Hives",
    "tab.scan": "Scan",
    "tab.iot": "Sensors",
    "tab.ai": "Advice",
    "tab.batches": "Batches",
    "tab.profile": "Profile",
    "wallet.connect": "Connect Wallet",

    /* ── v2 landing (desktop nav) ── */
    "land.nav.verify": "Verify",
    "land.nav.marketplace": "Marketplace",
    "land.nav.advice": "Advice",
    "land.nav.login": "Log in",
    "land.nav.register": "Get started",
    "land.cta.manual": "No camera? Type the batch ID",
    "land.foot.rights": "Blockchain honey traceability for the KVIC Honey Mission",

    /* ── v2 scanner ── */
    "scan.hint": "Bring the code into the frame",
    "scan.manual": "Type the code",
    "scan.manualPlaceholder": "Enter batch ID (e.g. HC-2026-000127)",
    "scan.manualSubmit": "Search",
    "scan.notFound": "This code is not in our records",
    "scan.notFoundSub": "Check the code again or ask the seller",

    /* ── v2 verdict ── */
    "verdict.ok.title": "Genuine honey ✓",
    "verdict.ok.speak": "This honey is genuine. Full details are below.",
    "verdict.trust": "Trust",
    "verdict.trustScore": "{n}/100 points",
    "verdict.mode.onchain": "Verified on blockchain",
    "verdict.mode.dbhash": "Verified against records",
    "verdict.producer": "Beekeeper",
    "verdict.origin": "Village / area",
    "verdict.harvest": "Harvest date",
    "verdict.weight": "Weight",
    "verdict.flower": "Flower source",
    "verdict.lab.pass": "Lab test passed ✓",
    "verdict.lab.moisture": "Moisture",
    "verdict.lab.sugar": "Sugar adulteration",
    "verdict.journey.title": "This honey's journey",
    "verdict.journey.step.harvest": "Harvested from hive",
    "verdict.journey.step.process": "Cleaned at factory",
    "verdict.journey.step.lab": "Tested in lab",
    "verdict.journey.step.distribution": "Sent by truck",
    "verdict.journey.step.retail": "Reached the shop",
    "verdict.tx": "Blockchain receipt",

    /* ── v2 danger ── */
    "danger.tamper.title": "Tamper danger",
    "danger.tamper.body":
      "This honey is not genuine. Records were altered. Do not buy or consume it.",
    "danger.tamper.speak":
      "Warning. This honey is not genuine. The records were tampered with. Please do not buy or consume it.",
    "danger.recall.title": "Recalled",
    "danger.recall.body":
      "Authorities have recalled this batch. Reason: {reason}.",
    "danger.recall.speak":
      "Warning. Authorities have recalled this honey. Please do not use it.",
    "danger.original": "Original record",
    "danger.current": "Altered record",
    "danger.ack": "Understood, close",

    /* ── v2 pending ── */
    "verdict.pending.title": "Test in progress",
    "verdict.pending.body": "Waiting for the lab report. Check again in a few days.",
    "verdict.unverified.title": "Could not confirm",
    "verdict.unverified.body":
      "Could not reach the server. Check your internet and try again.",

    /* ── legacy (existing pages) ── */
    appName: "HoneyChain",
    tagline: "Blockchain Honey Traceability & Smart Beekeeping",
    kvicTitle: "KVIC Honey Mission (Meethi Kranti)",
    language: "Language",
    english: "English",
    hindi: "हिंदी (Hindi)",
    logout: "Log Out",
    iotActive: "IoT Active",
    iotSimulated: "Simulated Telemetry",
    verified: "Verified",
    liveTelemetry: "Live Telemetry",
    listenAudio: "Listen Audio Summary",
    speaking: "Playing Audio...",
    stopAudio: "Stop Audio",

    navOverview: "Overview",
    navMyHives: "My Hives",
    navCreateBatch: "Create Batch",
    navMyBatches: "My Batches",
    navIotMonitor: "IoT Monitor",
    navAiInsights: "AI Insights",
    navProcessingVan: "🚚 Mobile Processing Van",
    navFloraCalendar: "🌸 Flora & Migration",
    navBeeDoctor: "🩺 Bee Doctor (Diseases)",
    navFairPricing: "💰 Mandi & Fair Price",
    navKvicSchemes: "🏛️ KVIC Schemes & Subsidies",
    navQrLabels: "🏷️ Print QR Jar Labels",
    navAllBatches: "All Batches",
    navClusters: "Clusters",
    navBeekeepers: "Beekeepers",
    navAnalytics: "Analytics",

    dashboardTitle: "Beekeeper Portal",
    welcomeBeekeeper:
      "Welcome back, Beekeeper! Monitor your apiary, book mobile processing, and track batches.",
    totalHives: "Total Hives",
    activeBatches: "Active Batches",
    honeyProduced: "Honey Produced",
    avgHiveHealth: "Avg Hive Health",
    quickActions: "Rural Empowerment Quick Actions",
    bookMobileVan: "Book Mobile Processing Van",
    bookMobileVanSub:
      "On-site 300kg/day filtration & moisture testing by KVIC van at your doorstep",
    checkFloraCalendar: "Flora Bloom Calendar",
    checkFloraCalendarSub:
      "Check current bloom in Haryana/UP/Bihar & plan box migration",
    openBeeDoctor: "Bee Doctor & Diagnosis",
    openBeeDoctorSub:
      "Visual symptoms and organic remedies for Varroa, Wax Moth & diseases",
    calcFairPrice: "Fair Price Calculator",
    calcFairPriceSub: "Compare Mandi vs KVIC rate & calculate your extra profit",
    applyKvicSchemes: "KVIC Schemes & Subsidies",
    applyKvicSchemesSub:
      "10-Box Honey Mission distribution & PMEGP 35% subsidy",
    printStickers: "Print Bottle QR Stickers",
    printStickersSub:
      "Generate physical labels for selling at local haats & melas",

    audioSummary:
      "Welcome to HoneyChain Beekeeper Portal. You have 24 hives active in Sonipat cluster. Average hive health is 91 percent, which is excellent.",
  },

  hi: {
    /* ── v2 global ── */
    "app.name": "हनीचेन",
    "app.tagline": "हर बोतल का पूरा सच",
    "action.retry": "फिर से कोशिश करें",
    "action.next": "आगे",
    "action.back": "पीछे",
    "action.done": "हो गया",
    "action.details": "विवरण",
    "action.close": "बंद करें",
    "state.loading": "एक पल…",
    "state.empty": "अभी कुछ नहीं है",
    "error.network": "इंटरनेट नहीं मिल रहा",
    "lang.toggle": "हि | EN",

    /* ── v2 landing ── */
    "land.title": "शहद का पूरा सच, एक स्कैन में",
    "land.sub": "छत्ते से बोतल तक — हर कदम दर्ज",
    "land.tile.verify": "असली या नकली?",
    "land.tile.verifySub": "कोड स्कैन करें",
    "land.tile.beekeeper": "मधुमक्खी पालक",
    "land.tile.beekeeperSub": "अपने छत्ते देखें",
    "land.tile.ai": "सलाह",
    "land.tile.aiSub": "मौसम और बीमारी की जानकारी",
    "land.cta.scan": "कोड स्कैन करें",
    "land.badge": "KVIC हनी मिशन • ब्लॉकचेन प्रमाणित",
    "land.demo": "डेमो देखें",
    "land.marketplace": "बाज़ार",
    "land.login": "लॉग इन",
    "land.register": "शुरू करें",
    "trust.blockchain": "ब्लॉकचेन सुरक्षित",
    "trust.iot": "IoT निगरानी",
    "trust.ai": "एआई अनुमान",
    "trust.qr": "क्यूआर जाँच",

    /* ── v2 beekeeper home ── */
    "bk.greeting": "नमस्ते",
    "bk.node": "KVIC स्मार्ट एपियरी",
    "bk.harvest.cta": "निकासी दर्ज करें",
    "bk.harvest.ready": "निकासी का समय आ गया",
    "bk.harvest.readySub": "छत्ता {hive} अब {kg} किलो है — शहद पक गया है।",
    "bk.alert.title": "इस छत्ते को देखें",
    "bk.alert.sub": "छत्ता {hive} अब {temp}°C है। हवा का रास्ता जाँचें।",
    "bk.allGood": "आपके सभी {n} छत्ते स्वस्थ हैं।",
    "bk.vitals": "आपका एपियरी",
    "bk.hives.title": "आपके छत्ते",
    "bk.hives.sub": "लाइव रीडिंग के लिए छत्ते पर टैप करें",
    "bk.batches.title": "हाल के बैच",
    "bk.batches.sub": "दुकान की ओर जा रहे हैं",
    "bk.advice.title": "आपके लिए सलाह",
    "bk.advice.body": "मौसम शहद के लिए अच्छा है। हर हफ्ते नीचे की पट्टी पर माइट जाँचें।",
    "bk.manage": "प्रबंधन",
    "bk.viewAll": "सभी देखें",
    "bk.sensors": "सेंसर",
    "bk.askAi": "एआई से पूछें",
    "bk.temp": "ताप",
    "bk.humidity": "नमी",
    "bk.online": "सभी सक्रिय",

    /* ── v2 tabs + beekeeper desktop sidebar ── */
    "tab.home": "होम",
    "tab.hives": "छत्ते",
    "tab.scan": "स्कैन",
    "tab.iot": "सेंसर",
    "tab.ai": "सलाह",
    "tab.batches": "बैच",
    "tab.profile": "प्रोफ़ाइल",
    "wallet.connect": "वॉलेट जोड़ें",

    /* ── v2 landing (desktop nav) ── */
    "land.nav.verify": "जाँच करें",
    "land.nav.marketplace": "बाज़ार",
    "land.nav.advice": "सलाह",
    "land.nav.login": "लॉग इन",
    "land.nav.register": "शुरू करें",
    "land.cta.manual": "कैमरा नहीं है? बैच नंबर लिखें",
    "land.foot.rights": "केवीआईसी हनी मिशन हेतु ब्लॉकचेन शहद अनुरेखण",

    /* ── v2 scanner ── */
    "scan.hint": "कोड को फ्रेम में लाएँ",
    "scan.manual": "कोड टाइप करें",
    "scan.manualPlaceholder": "बैच नंबर लिखें (जैसे HC-2026-000127)",
    "scan.manualSubmit": "खोजें",
    "scan.notFound": "यह कोड हमारे यहाँ दर्ज नहीं है",
    "scan.notFoundSub": "कोड फिर से देखें या दुकानदार से पूछें",

    /* ── v2 verdict ── */
    "verdict.ok.title": "असली शहद ✓",
    "verdict.ok.speak": "यह शहद असली है। इसकी पूरी जानकारी नीचे दी गई है।",
    "verdict.trust": "भरोसा",
    "verdict.trustScore": "{n}/100 अंक",
    "verdict.mode.onchain": "ब्लॉकचेन से जाँचा गया",
    "verdict.mode.dbhash": "रिकॉर्ड से जाँचा गया",
    "verdict.producer": "पालक",
    "verdict.origin": "गाँव / क्षेत्र",
    "verdict.harvest": "निकासी तारीख",
    "verdict.weight": "वज़न",
    "verdict.flower": "फूल का पौधा",
    "verdict.lab.pass": "जाँच पास ✓",
    "verdict.lab.moisture": "नमी",
    "verdict.lab.sugar": "चीनी की मिलावट",
    "verdict.journey.title": "इस शहद का सफ़र",
    "verdict.journey.step.harvest": "छत्ते से निकाला",
    "verdict.journey.step.process": "कारखाने में साफ़ किया",
    "verdict.journey.step.lab": "लैब में जाँची",
    "verdict.journey.step.distribution": "ट्रक से भेजा",
    "verdict.journey.step.retail": "दुकान पर पहुँचा",
    "verdict.tx": "ब्लॉकचेन रसीद",

    /* ── v2 danger ── */
    "danger.tamper.title": "छेड़छाड़ का खतरा",
    "danger.tamper.body":
      "यह शहद असली नहीं है। रिकॉर्ड बदला गया है। इसे न खरीदें, न पीएँ।",
    "danger.tamper.speak":
      "चेतावनी। यह शहद असली नहीं है। रिकॉर्ड में छेड़छाड़ हुई है। कृपया इसे न खरीदें और न पीएँ।",
    "danger.recall.title": "वापस बुलाया गया",
    "danger.recall.body": "अधिकारियों ने यह बैच वापस लिया है। कारण: {reason}।",
    "danger.recall.speak":
      "चेतावनी। अधिकारियों ने यह शहद वापस बुलाया है। कृपया इसे इस्तेमाल न करें।",
    "danger.original": "असली रिकॉर्ड",
    "danger.current": "बदला हुआ रिकॉर्ड",
    "danger.ack": "समझ गया, बंद करें",

    /* ── v2 pending ── */
    "verdict.pending.title": "जाँच चल रही है",
    "verdict.pending.body": "लैब रिपोर्ट का इंतज़ार है। कुछ दिन में फिर देखें।",
    "verdict.unverified.title": "पुष्टि नहीं हो सकी",
    "verdict.unverified.body":
      "सर्वर से संपर्क नहीं हो सका। इंटरनेट देखें और फिर से कोशिश करें।",

    /* ── legacy (existing pages) ── */
    appName: "हनी-चेन (HoneyChain)",
    tagline: "ब्लॉकचेन शहद प्रमाणीकरण एवं स्मार्ट मधुमक्खी पालन",
    kvicTitle: "केवीआईसी (KVIC) हनी मिशन — मीठी क्रांति",
    language: "भाषा",
    english: "English",
    hindi: "हिंदी (Hindi)",
    logout: "लॉग आउट",
    iotActive: "सक्रिय सेंसर (IoT Active)",
    iotSimulated: "सिम्युलेटेड डेटा",
    verified: "प्रमाणित (Verified)",
    liveTelemetry: "लाइव टेलीमेट्री",
    listenAudio: "आवाज़ में जानकारी सुनें",
    speaking: "ऑडियो चल रहा है...",
    stopAudio: "ऑडियो बंद करें",

    navOverview: "डैशबोर्ड अवलोकन",
    navMyHives: "मेरे बी-बॉक्सेस (Hives)",
    navCreateBatch: "नया बैच दर्ज करें",
    navMyBatches: "शहद के बैच",
    navIotMonitor: "आईओटी सेंसर मॉनिटर",
    navAiInsights: "एआई सलाह एवं अनुमान",
    navProcessingVan: "🚚 मोबाइल प्रोसेसिंग वैन",
    navFloraCalendar: "🌸 फूल एवं प्रवास कैलेंडर",
    navBeeDoctor: "🩺 मधुमक्खी डॉक्टर (रोग निवारण)",
    navFairPricing: "💰 मंडी भाव एवं उचित मूल्य",
    navKvicSchemes: "🏛️ सरकारी योजनाएं एवं सब्सिडी",
    navQrLabels: "🏷️ जार के लिए क्यूआर लेबल",
    navAllBatches: "सभी शहद बैच",
    navClusters: "मधुमक्खी क्लस्टर",
    navBeekeepers: "पालक सूची",
    navAnalytics: "कुल आंकड़े व रिपोर्ट",

    dashboardTitle: "मधुमक्खी पालक सेवा केंद्र",
    welcomeBeekeeper:
      "स्वागत है! अपने छत्तों की निगरानी करें, मोबाइल प्रोसेसिंग वैन बुक करें और उचित मूल्य पाएं।",
    totalHives: "कुल बक्से (Hives)",
    activeBatches: "सक्रिय शहद बैच",
    honeyProduced: "कुल उत्पादित शहद",
    avgHiveHealth: "औसत छत्ता स्वास्थ्य",
    quickActions: "ग्रामीण पालक विशेष सुविधाएं",
    bookMobileVan: "केवीआईसी मोबाइल प्रोसेसिंग वैन बुक करें",
    bookMobileVanSub:
      "खेत पर ही 300 किग्रा/दिन फिल्ट्रेशन, नमी नियंत्रण (<20%) और तुरंत लैब टेस्ट",
    checkFloraCalendar: "फूलों का खिलना एवं प्रवास कैलेंडर",
    checkFloraCalendarSub:
      "सरसों, सफेदा, लीची के फूलों का समय देखें और बक्सों को सही जगह ले जाएं",
    openBeeDoctor: "मधुमक्खी डॉक्टर (रोग व लक्षण)",
    openBeeDoctorSub:
      "वारोआ माइट, मोम का कीड़ा (वैक्स मॉथ) और बीमारियों के जैविक देसी इलाज",
    calcFairPrice: "उचित मूल्य एवं मुनाफा कैलकुलेटर",
    calcFairPriceSub:
      "बिचौलियों की सस्ती मंडी दर बनाम केवीआईसी सुनिश्चित मूल्य की तुलना करें",
    applyKvicSchemes: "केवीआईसी योजनाएं एवं 35% सब्सिडी",
    applyKvicSchemesSub:
      "10-बॉक्स हनी मिशन वितरण एवं PMEGP के तहत ₹25 लाख तक की सब्सिडी",
    printStickers: "शहद की शीशी के क्यूआर स्टीकर",
    printStickersSub:
      "स्थानीय मेले और हाट में सीधे बेचने के लिए प्रामाणिक क्यूआर लेबल प्रिंट करें",

    audioSummary:
      "हनी-चेन मधुमक्खी पालक पोर्टल में आपका स्वागत है। सोनीपत क्लस्टर में आपके 24 बक्से सक्रिय हैं। बक्सों का औसत स्वास्थ्य 91 प्रतिशत है, जो बहुत उत्तम है।",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
