"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Search,
  Sparkles,
  Leaf,
  ThermometerSnowflake,
  Flame,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DiseaseItem {
  id: string;
  name: string;
  nameHi: string;
  scientificName: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  iconBg: string;
  symptoms: string[];
  symptomsHi: string[];
  causes: string;
  causesHi: string;
  organicRemedy: string[];
  organicRemedyHi: string[];
  prevention: string;
  preventionHi: string;
}

const DISEASES: DiseaseItem[] = [
  {
    id: "varroa",
    name: "Varroa Destructor Mite (Ectoparasite)",
    nameHi: "वारोआ माइट (मधुमक्खी का परजीवी कीड़ा)",
    scientificName: "Varroa destructor",
    severity: "CRITICAL",
    iconBg: "bg-red-100 text-red-700",
    symptoms: [
      "Small reddish-brown pinhead-sized mites visible on adult bees and brood",
      "Deformed Wing Virus (DWV) — bees emerging with stunted, shriveled wings",
      "Crawling, flightless bees outside the hive entrance",
      "Sudden drop in colony population and foraging activity",
    ],
    symptomsHi: [
      "मक्खियों और अंडों की पीठ पर छोटे लाल-भूरे रंग के कीड़े चिपके दिखना",
      "मुड़े और सिकुड़े पंखों वाली अपंग मक्खियों का छत्ते से बाहर निकलना",
      "छत्ते के प्रवेश द्वार पर मक्खियों का रेंगना और उड़ न पाना",
      "अचानक छत्ते की ताकत और शहद संग्रह में भारी गिरावट",
    ],
    causes: "Spreads through drifting drone bees, shared floral foraging, and introducing uninspected queen cages.",
    causesHi: "आस-पास के संक्रमित छत्तों, नर मक्खियों के आवागमन और बिना जांचे बक्से जोड़ने से फैलता है।",
    organicRemedy: [
      "Thymol Crystals (अजवाइन सत्व): Place 15g thymol crystals in a perforated tray over top brood frames for 21 days.",
      "Formic Acid 85% Pad: Apply 20ml per brood chamber during temperatures between 15°C–25°C.",
      "Neem Oil & Camphor: Light fumigation with dried neem leaves and camphor smoke during routine inspection.",
      "Drone Brood Trapping: Cull capped drone comb frames where 80% of mites reproduce.",
    ],
    organicRemedyHi: [
      "थाइमोल (अजवाइन सत्व): 15 ग्राम थाइमोल को जालीदार डिब्बी में ऊपरी फ्रेम पर 21 दिनों तक रखें।",
      "फॉर्मिक एसिड (85%): 15°C से 25°C तापमान होने पर 20 मिली पैड ब्रूड चैंबर पर लगाएं।",
      "नीम पत्ती और कपूर का धुआँ: साप्ताहिक निरीक्षण के समय नीम की सूखी पत्ती और कपूर से हल्का धुआँ दें।",
      "ड्रोन ब्रूड ट्रैपिंग: नर मक्खी वाले फ्रेम को काटकर हटा दें जहाँ 80% माइट पनपते हैं।",
    ],
    prevention: "Inspect bottom board sticky sheets every 14 days; treat colonies before winter clustering.",
    preventionHi: "हर 14 दिन में छत्ते के नीचे चिपचिपी शीट लगाकर माइट की गिनती करें; सर्दियों से पहले जैविक उपचार करें।",
  },
  {
    id: "waxmoth",
    name: "Greater & Lesser Wax Moth",
    nameHi: "मोम का कीड़ा / वैक्स मॉथ (गैलेरिया)",
    scientificName: "Galleria mellonella",
    severity: "HIGH",
    iconBg: "bg-amber-100 text-amber-800",
    symptoms: [
      "Silky white webbing spreading across honeycomb cells",
      "Dark brown to black fecal pellets inside tunnel tracks",
      "Combs crumbling into powdery debris and destroyed wax foundation",
      "Weak colony deserting the hive (absconding)",
    ],
    symptomsHi: [
      "मोम के छत्तों पर सफेद जाला और सुरंगें बनना",
      "छत्ते के कोष्ठकों में काले दानेदार मल के कण मिलना",
      "मोम का चूरा होकर टूटना और छत्ते का नष्ट होना",
      "कमजोर मक्खियों का छत्ता छोड़कर भाग जाना (पलायन)",
    ],
    causes: "Weak colonies with excess empty storage combs; warm, dark, humid hive conditions.",
    causesHi: "कमजोर छत्ते जिनमें खाली फ्रेम ज्यादा हों; अंधेरे और नमी वाले बक्से।",
    organicRemedy: [
      "Sunlight Exposure: Expose infested combs to direct bright sunlight for 2–3 hours.",
      "Freezing Treatment: Store spare combs in a freezer at -12°C for 24 hours to kill eggs and larvae.",
      "Sulfur Fumigation: Burn sulfur strips in sealed empty super boxes before seasonal storage.",
      "Hive Hygiene: Remove bottom board debris and reduce hive entrance for weak colonies.",
    ],
    organicRemedyHi: [
      "धूप दिखाना: प्रभावित फ्रेमों को 2–3 घंटे तेज धूप में रखें जिससे कीड़े बाहर निकल आएं।",
      "फ्रीजर उपचार: अतिरिक्त खाली फ्रेमों को 24 घंटे के लिए -12°C पर रखें जिससे अंडे व लार्वा नष्ट हो जाएं।",
      "सल्फर धूनी: भंडारण से पहले खाली बक्सों में गंधक (सल्फर) की धूनी दें।",
      "बक्से की सफाई: बक्से के फर्श की नियमित सफाई करें और कमजोर छत्तों का मुख्य द्वार छोटा करें।",
    ],
    prevention: "Never leave empty unoccupied supers in hives; maintain strong, populous colonies.",
    preventionHi: "छत्ते में खाली फ्रेम न छोड़ें; हमेशा छत्ते में मक्खियों की संख्या घनी बनाए रखें।",
  },
  {
    id: "foulbrood",
    name: "European Foulbrood (EFB) & Brood Rot",
    nameHi: "सड़न रोग / यूरोपीय फाउलब्रूड (EFB)",
    scientificName: "Melissococcus plutonius",
    severity: "CRITICAL",
    iconBg: "bg-red-100 text-red-700",
    symptoms: [
      "Larvae coiled unnaturally, turning from pearly white to yellow and dark brown",
      "Sour, acidic odor emanating from brood frames",
      "Spotty, irregular brood pattern with punctured sunken cappings",
      "Dying unsealed larvae melting at bottom of cells",
    ],
    symptomsHi: [
      "लार्वा का सफेद से पीला और गहरा भूरा होकर टेढ़ा मुड़ना",
      "छत्ते के फ्रेमों से खट्टी व तीखी बदबू आना",
      "छत्ते में अंडों का बिखरा हुआ व अनियमित पैटर्न",
      "अधपके लार्वा का कोष्ठक के तल पर पिघल कर सूखना",
    ],
    causes: "Bacterial infection transmitted via contaminated feeding, robber bees, and shared hive tools.",
    causesHi: "दूषित चाशनी, अन्य छत्तों से आई चोरी करने वाली मक्खियों और गंदे औजारों से फैलता है।",
    organicRemedy: [
      "Shook Swarm Method: Transfer all adult bees onto new sterile foundation frames and destroy infected combs.",
      "Re-queening: Replace the old queen with a hygienic certified Apis mellifera queen.",
      "Flame Sterilization: Disinfect hive wooden walls and metal hive tools using a blowtorch flame.",
      "Isolation: Quarantine infected boxes at least 3 km away from healthy apiaries.",
    ],
    organicRemedyHi: [
      "शुक स्वार्म तकनीक: सभी वयस्क मक्खियों को नए साफ फ्रेम पर झटकें और पुराने बीमार छत्तों को जला दें।",
      "रानी बदलना (Re-queening): पुरानी रानी को हटाकर रोग-प्रतिरोधी नई प्रमाणित रानी मक्खी डालें।",
      "आग से विसंक्रमण: बक्से की लकड़ी और लोहे के औजारों को आग की लौ से विसंक्रमित करें।",
      "क्वारंटाइन: प्रभावित बक्सों को स्वस्थ छत्तों से कम से कम 3 किमी दूर ले जाएं।",
    ],
    prevention: "Disinfect hive tools in 70% alcohol or flame between inspecting different colonies.",
    preventionHi: "हर छत्ता जांचने के बाद लोहे के खुरपे को आग या सैनिटाइजर से साफ करें।",
  },
  {
    id: "starvation",
    name: "Monsoon Dearth & Brood Chilling",
    nameHi: "बरसात में भुखमरी एवं ठंड से ब्रूड नष्ट होना",
    scientificName: "Nutritional Deficiency / Hypothermia",
    severity: "MODERATE",
    iconBg: "bg-blue-100 text-blue-800",
    symptoms: [
      "Dead brood ejected outside hive entrance in morning",
      "Bees lethargic, clustering tightly, refusing to forage",
      "No glistening nectar or sealed honey cells in top supers",
      "Colony cannibalizing young larvae to survive",
    ],
    symptomsHi: [
      "सुबह के समय छत्ते के बाहर मरे हुए बच्चे (ब्रूड) पड़े मिलना",
      "मक्खियों का सुस्त होना और आपस में गुच्छा बनाकर बैठे रहना",
      "छत्ते में शहद या चाशनी का बिल्कुल न होना",
      "भूख के कारण मक्खियों का अपने ही अंडों को खाना",
    ],
    causes: "Continuous heavy monsoon rains preventing foraging; winter cold drafts entering poorly sealed hives.",
    causesHi: "लगातार तेज बारिश के कारण मक्खियों का बाहर न जा पाना; सर्दियों में बक्से में ठंडी हवा घुसना।",
    organicRemedy: [
      "2:1 Sugar Syrup Feeding: Dissolve 2 kg clean sugar in 1 liter warm boiled water; feed inside feeder.",
      "Pollen Patty Supplement: Mix soy flour, brewer's yeast, and honey into soft dough and place above frames.",
      "Hive Insulation: Cover top lid with dry gunny bag / thermocol sheet to retain 34.5°C brood warmth.",
      "Entrance Reducer: Insert wooden gate reducer to prevent cold rain drafts and robber wasps.",
    ],
    organicRemedyHi: [
      "2:1 चाशनी पोषण: 2 किलो साफ चीनी को 1 लीटर उबले पानी में घोलकर शाम को फीडर में दें।",
      "पराग टिक्की (Pollen Patty): सोयाबीन आटा, खमीर और शहद मिलाकर नर्म टिक्की बनाकर फ्रेम के ऊपर रखें।",
      "बक्से की गर्माहट: बक्से के ढक्कन के नीचे सूखा टाट का बोरा लगाएं ताकि अंदर 34.5°C तापमान बना रहे।",
      "प्रवेश द्वार छोटा करना: बरसात व ठंड में हवा और ततैया (Wasps) से बचाव के लिए द्वार छोटा करें।",
    ],
    prevention: "Always leave at least 3–5 kg of honey reserve in the hive before monsoon or winter onset.",
    preventionHi: "बरसात या सर्दी शुरू होने से पहले छत्ते में कम से कम 3 से 5 किलो शहद मक्खियों के खाने के लिए अवश्य छोड़ें।",
  },
];

export default function BeeDoctorPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [expandedId, setExpandedId] = useState<string>(DISEASES[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiseases = DISEASES.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nameHi.includes(searchQuery) ||
      d.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const audioText = isHindi
    ? "मधुमक्खी डॉक्टर सेवा केंद्र। यदि छत्ते में मुड़े हुए पंखों वाली मक्खियां दिखें, तो यह वारोआ माइट का लक्षण है। इसके लिए 15 ग्राम थाइमोल जालीदार डिब्बी में रखें। बरसात के दिनों में दो अनुपात एक चीनी की चाशनी देकर भुखमरी से बचाएं। आपातकालीन सहायता के लिए केवीआईसी पुणे हेल्पलाइन पर संपर्क करें।"
    : "Bee Doctor Diagnostic Center. If bees emerge with deformed wings, it indicates Varroa mite infestation. Treat with 15 grams thymol crystals. During monsoon, feed two to one sugar syrup to prevent starvation. For emergency support, contact KVIC CBRTI Pune helpline.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-2">
            <Stethoscope size={13} />
            {isHindi ? "रोग निदान एवं जैविक उपचार" : "Apiary Pathology & Natural Cure"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "मधुमक्खी डॉक्टर (Bee Doctor — Rog Nivaran)" : "Bee Doctor: Diagnosis & Organic Remedies"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "प्रमुख रोगों के दृश्य लक्षण, केवीआईसी अनुमोदित जैविक देसी उपचार एवं रोकथाम सलाह"
              : "Visual symptom diagnosis, KVIC-approved natural remedies, and pest prevention guidelines"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioText} label={isHindi ? "डॉक्टर की सलाह सुनें" : "Listen Doctor Advice"} />
        </div>
      </div>

      {/* Emergency Helpline Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-[var(--radius-xl)] p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-300" />
            <h2 className="font-bold text-base font-[family-name:var(--font-outfit)]">
              {isHindi
                ? "केवीआईसी केंद्रीय मधुमक्खी अनुसंधान संस्थान (CBRTI, Pune) हेल्पलाइन"
                : "KVIC Central Bee Research & Training Institute (CBRTI) Helpline"}
            </h2>
          </div>
          <p className="text-xs text-white/80 max-w-2xl">
            {isHindi
              ? "किसी अज्ञात बीमारी या छत्ते में अचानक मृत्यु दर बढ़ने पर तुरंत सरकारी कृषि वैज्ञानिकों से नि:शुल्क मार्गदर्शन प्राप्त करें।"
              : "Direct emergency assistance from KVIC apiary scientists for unusual colony mortality or pest outbreaks."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:18001801551"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-emerald-900 font-bold text-xs shadow hover:bg-emerald-50 transition-colors"
          >
            <PhoneCall size={14} className="text-emerald-700" />
            <span>1800-180-1551 (Toll-Free)</span>
          </a>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isHindi
              ? "लक्षण या रोग खोजें (उदा. वारोआ, मोम का कीड़ा, पंख, जाला, चाशनी)..."
              : "Search disease, symptoms (e.g. varroa, wax moth, deformed wings, webbing, syrup)..."
          }
          className="input !pl-10 text-xs"
        />
      </div>

      {/* Disease Accordion List */}
      <div className="space-y-4">
        {filteredDiseases.map((disease) => {
          const isExpanded = expandedId === disease.id;
          return (
            <Card
              key={disease.id}
              className={`overflow-hidden transition-all border ${
                isExpanded ? "border-[var(--honey-500)] shadow-sm" : "border-[var(--border-default)]"
              }`}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? "" : disease.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[var(--bg-muted)]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 mt-0.5 ${disease.iconBg}`}>
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-[var(--text-primary)]">
                        {isHindi ? disease.nameHi : disease.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          disease.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : disease.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {disease.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] italic font-mono mt-0.5">
                      {disease.scientificName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] shrink-0"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Expandable Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[var(--border-default)] space-y-4 text-xs">
                  {/* Symptoms Grid */}
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5 text-xs">
                      <AlertTriangle size={14} className="text-red-500" />
                      {isHindi ? "पहचान के मुख्य दृश्य लक्षण (Visible Symptoms):" : "Key Visual Diagnostic Symptoms:"}
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(isHindi ? disease.symptomsHi : disease.symptoms).map((sym, idx) => (
                        <div key={idx} className="p-2.5 bg-red-50/60 rounded-md border border-red-100 text-red-950 flex items-start gap-2">
                          <span className="font-bold text-red-600 shrink-0">•</span>
                          <span>{sym}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organic Remedies */}
                  <div className="p-4 bg-emerald-50/70 rounded-[var(--radius-lg)] border border-emerald-200">
                    <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5 text-xs">
                      <Leaf size={14} className="text-emerald-600" />
                      {isHindi ? "केवीआईसी जैविक एवं देसी उपचार विधि (Organic Remedies):" : "KVIC Approved Organic Treatments:"}
                    </h4>
                    <div className="space-y-2 text-emerald-900">
                      {(isHindi ? disease.organicRemedyHi : disease.organicRemedy).map((rem, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{rem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prevention */}
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-muted)] p-3 rounded-lg">
                    <div>
                      <p className="font-bold text-[var(--text-primary)] mb-0.5">
                        {isHindi ? "फैलाव का कारण:" : "Mode of Transmission:"}
                      </p>
                      <p>{isHindi ? disease.causesHi : disease.causes}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] mb-0.5">
                        {isHindi ? "स्थायी रोकथाम (Prevention):" : "Permanent Prevention:"}
                      </p>
                      <p>{isHindi ? disease.preventionHi : disease.prevention}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
