"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Flower2,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sun,
  Droplets,
  Award,
  ChevronRight,
} from "lucide-react";

interface FloraItem {
  id: string;
  name: string;
  nameHi: string;
  botanical: string;
  months: string;
  monthsHi: string;
  regions: string;
  regionsHi: string;
  nectarYield: "VERY_HIGH" | "HIGH" | "MEDIUM";
  honeyColor: string;
  flavorProfile: string;
  marketDemand: string;
  migrationTips: string;
  migrationTipsHi: string;
  activeNow: boolean;
}

const FLORA_CALENDAR: FloraItem[] = [
  {
    id: "mustard",
    name: "Mustard Flower (Sarson)",
    nameHi: "सरसों (पीला फूल)",
    botanical: "Brassica campestris",
    months: "Nov – Jan",
    monthsHi: "नवंबर – जनवरी",
    regions: "Haryana (Sonipat, Panipat), Rajasthan (Bharatpur, Alwar), Western UP",
    regionsHi: "हरियाणा (सोनीपत, पानीपत), राजस्थान (भरतपुर, अलवर), पश्चिमी उत्तर प्रदेश",
    nectarYield: "VERY_HIGH",
    honeyColor: "Light Yellow / Whitish Cream",
    flavorProfile: "Sweet, mildly pungent, fast crystallizing (natural glucose rich)",
    marketDemand: "High bulk demand (Exports, Ayurveda & daily table honey)",
    migrationTips: "Shift boxes to open fields by early November before early frost. Excellent for rapid colony expansion.",
    migrationTipsHi: "नवंबर के प्रथम सप्ताह में बक्से सरसों के खेतों में स्थापित करें। कॉलोनी की संख्या बढ़ाने के लिए सर्वोत्तम समय।",
    activeNow: true,
  },
  {
    id: "eucalyptus",
    name: "Eucalyptus (Safeda)",
    nameHi: "सफेदा / नीलगिरी (यूकेलिप्टस)",
    botanical: "Eucalyptus tereticornis",
    months: "Feb – Mar",
    monthsHi: "फरवरी – मार्च",
    regions: "Punjab, Haryana, Western UP, Tarai Belt",
    regionsHi: "पंजाब, हरियाणा, पश्चिमी यूपी, तराई क्षेत्र",
    nectarYield: "HIGH",
    honeyColor: "Amber to Dark Golden",
    flavorProfile: "Herbal, slightly medicinal aroma with warm undertones",
    marketDemand: "Strong domestic pharmaceutical and wellness demand",
    migrationTips: "Move colonies from mustard fields to canal banks and forest plantations in late January.",
    migrationTipsHi: "जनवरी अंत में सरसों के खेतों से बक्सों को नहर के किनारे और सफेदा बागानों में ले जाएं।",
    activeNow: false,
  },
  {
    id: "litchi",
    name: "Litchi Orchard Flower",
    nameHi: "लीची का फूल (मुजफ्फरपुर स्पेशल)",
    botanical: "Litchi chinensis",
    months: "Mar – May",
    monthsHi: "मार्च – मई",
    regions: "Bihar (Muzaffarpur, Vaishali), Uttarakhand (Ramnagar, Dehradun)",
    regionsHi: "बिहार (मुजफ्फरपुर, वैशाली), उत्तराखंड (रामनगर, देहरादून)",
    nectarYield: "VERY_HIGH",
    honeyColor: "Golden Amber, Clear Translucent",
    flavorProfile: "Exotic floral, fruity, sweet, slow crystallizing",
    marketDemand: "Super Premium Monofloral Honey (₹450–650 / KG direct farm-gate)",
    migrationTips: "Book orchard contracts in early March. Place hives under shade to protect from midday heat.",
    migrationTipsHi: "मार्च की शुरुआत में लीची बागवानों से संपर्क करें। तेज धूप से बचाव के लिए छत्तों को पेड़ों की छांव में रखें।",
    activeNow: false,
  },
  {
    id: "sunflower",
    name: "Sunflower (Surajmukhi)",
    nameHi: "सूरजमुखी",
    botanical: "Helianthus annuus",
    months: "May – June",
    monthsHi: "मई – जून",
    regions: "Punjab (Ludhiana, Jalandhar), Karnataka, Maharashtra",
    regionsHi: "पंजाब, कर्नाटक, महाराष्ट्र",
    nectarYield: "MEDIUM",
    honeyColor: "Bright Golden Yellow",
    flavorProfile: "Mildly sweet with gentle floral aroma",
    marketDemand: "Critical dearth bridge before monsoon",
    migrationTips: "Provide fresh water pots near hives as high summer temperatures increase bee water needs.",
    migrationTipsHi: "मई की गर्मी में छत्तों के पास पानी के बर्तन रखें ताकि मक्खियों को ठंडक और नमी मिलती रहे।",
    activeNow: false,
  },
  {
    id: "jamun",
    name: "Jamun & Ber (Blackberry)",
    nameHi: "जामुन एवं बेर का फूल",
    botanical: "Syzygium cumini / Ziziphus",
    months: "June – Aug",
    monthsHi: "जून – अगस्त",
    regions: "Central India, Madhya Pradesh, Haryana, Rajasthan",
    regionsHi: "मध्य भारत, मध्य प्रदेश, हरियाणा, राजस्थान",
    nectarYield: "HIGH",
    honeyColor: "Dark Brownish Amber",
    flavorProfile: "Low glycemic index, rich in minerals, distinctive earthy taste",
    marketDemand: "High demand among diabetic & Ayurvedic consumers",
    migrationTips: "Ensure hive covers are rainproof before monsoon showers start.",
    migrationTipsHi: "मानसून की बारिश से पहले बक्सों के ऊपर वॉटरप्रूफ कवर लगाना सुनिश्चित करें।",
    activeNow: false,
  },
  {
    id: "multiflora",
    name: "Wild Forest Multiflora",
    nameHi: "जंगली वनस्पति एवं कश्मीर फ्लोरा",
    botanical: "Wild Himalayan & Sunderban Flora",
    months: "Sep – Oct",
    monthsHi: "सितंबर – अक्टूबर",
    regions: "Kashmir Valley, Himachal Pradesh, Sunderbans (WB)",
    regionsHi: "कश्मीर घाटी, हिमाचल प्रदेश, सुंदरबन (पं. बंगाल)",
    nectarYield: "HIGH",
    honeyColor: "Deep Amber to Reddish Gold",
    flavorProfile: "Complex multi-layered herbal aroma, high flavonoids",
    marketDemand: "Export Grade & GI Tagged Premium Quality",
    migrationTips: "Post-monsoon foraging surge; inspect frames weekly for rapid honey supers filling.",
    migrationTipsHi: "बरसात के बाद फूलों की बहार आती है; सुपर फ्रेम को हर हफ्ते जांचें ताकि भरा हुआ शहद समय पर निकाल सकें।",
    activeNow: false,
  },
];

export default function FloraCalendarPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [selectedFlora, setSelectedFlora] = useState<FloraItem>(FLORA_CALENDAR[0]);

  const audioText = isHindi
    ? "भारतीय फूल एवं प्रवास कैलेंडर। वर्तमान में हरियाणा और राजस्थान में सरसों का फूल सक्रिय है। यह कॉलोनी बढ़ाने और भरपूर शहद उत्पादन के लिए सर्वोत्तम है। मार्च में बक्सों को लीची के बागों में मुजफ्फरपुर या रामनगर ले जाने की सलाह दी जाती है।"
    : "Indian Flora and Migratory Beekeeping Calendar. Currently Mustard Sarson is active in Haryana and Rajasthan. It provides very high nectar yield. For March, migrating boxes to Litchi orchards in Muzaffarpur or Ramnagar is recommended for premium monofloral honey.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-2">
            <Compass size={13} className="text-[var(--honey-600)]" />
            {isHindi ? "प्रवासी मधुमक्खी पालन गाइड" : "Migratory Apiary Intelligence"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "भारतीय फूल एवं प्रवास कैलेंडर (Flora Calendar)" : "Indian Flora Bloom & Migration Calendar"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "मौसम के अनुसार फूलों का खिलना, प्रवास योजना और अधिकतम शहद उत्पादन गाइड"
              : "Track seasonal nectar flows, plan box relocation, and maximize monofloral honey yield"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioText} label={isHindi ? "कैलेंडर की जानकारी सुनें" : "Listen Flora Advisory"} />
        </div>
      </div>

      {/* Migration Route Visualizer */}
      <div className="bg-gradient-to-r from-amber-900 via-[var(--honey-800)] to-orange-900 rounded-[var(--radius-xl)] p-6 text-white shadow-md relative overflow-hidden">
        <h2 className="text-base font-bold font-[family-name:var(--font-outfit)] mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--honey-400)]" />
          {isHindi ? "वार्षिक प्रवास चक्र (Annual Migration Route)" : "Recommended Annual Migration Circuit"}
        </h2>
        <p className="text-xs text-white/80 max-w-2xl mb-6">
          {isHindi
            ? "भारतीय मधुमक्खी पालक साल में 4 से 5 बार बक्सों को एक राज्य से दूसरे राज्य ले जाकर वर्ष भर भरपूर शहद और पराग प्राप्त करते हैं।"
            : "Commercial Indian beekeepers migrate colonies across North & Central India 4–5 times annually to maintain year-round foraging."}
        </p>

        {/* Stepper Circuit */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-lg border border-white/15 backdrop-blur-sm">
            <span className="text-[10px] text-[var(--honey-300)] font-mono font-bold">1. NOV – JAN</span>
            <p className="font-bold text-sm mt-1">{isHindi ? "सरसों (Haryana/Raj)" : "Mustard (Sarson)"}</p>
            <p className="text-[11px] text-white/70 mt-1">{isHindi ? "छत्तों की संख्या दोगुनी करें" : "Colony multiplication"}</p>
          </div>

          <div className="p-3 bg-white/10 rounded-lg border border-white/15 backdrop-blur-sm">
            <span className="text-[10px] text-[var(--honey-300)] font-mono font-bold">2. FEB – MAR</span>
            <p className="font-bold text-sm mt-1">{isHindi ? "सफेदा (Punjab/UP)" : "Eucalyptus (Safeda)"}</p>
            <p className="text-[11px] text-white/70 mt-1">{isHindi ? "तेज ब्रूड व पराग विकास" : "Heavy spring brood"}</p>
          </div>

          <div className="p-3 bg-white/10 rounded-lg border border-white/15 backdrop-blur-sm">
            <span className="text-[10px] text-[var(--honey-300)] font-mono font-bold">3. APR – MAY</span>
            <p className="font-bold text-sm mt-1">{isHindi ? "लीची (Muzaffarpur)" : "Litchi (Bihar/UK)"}</p>
            <p className="text-[11px] text-white/70 mt-1">{isHindi ? "प्रीमियम सुगंधित शहद" : "Premium monofloral honey"}</p>
          </div>

          <div className="p-3 bg-white/10 rounded-lg border border-white/15 backdrop-blur-sm">
            <span className="text-[10px] text-[var(--honey-300)] font-mono font-bold">4. JUN – AUG</span>
            <p className="font-bold text-sm mt-1">{isHindi ? "सूरजमुखी / जामुन" : "Sunflower / Jamun"}</p>
            <p className="text-[11px] text-white/70 mt-1">{isHindi ? "बरसात से पहले सुरक्षा" : "Pre-monsoon storage"}</p>
          </div>
        </div>
      </div>

      {/* Flora Grid & Detail Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Flora Timeline List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)]">
            {isHindi ? "प्रमुख भारतीय शहद वनस्पति (Flora List)" : "Major Indian Honey Floral Sources"}
          </h2>

          <div className="space-y-3">
            {FLORA_CALENDAR.map((flora) => {
              const isSelected = selectedFlora.id === flora.id;
              return (
                <div
                  key={flora.id}
                  onClick={() => setSelectedFlora(flora)}
                  className={`p-4 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--honey-500)] bg-[var(--honey-50)]/50 shadow-sm"
                      : "border-[var(--border-default)] bg-white hover:border-[var(--honey-300)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--honey-100)] flex items-center justify-center text-[var(--honey-700)] shrink-0 mt-0.5">
                        <Flower2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[var(--text-primary)]">
                            {isHindi ? flora.nameHi : flora.name}
                          </h3>
                          {flora.activeNow && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {isHindi ? "वर्तमान में सक्रिय" : "Active Now"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] italic font-mono mt-0.5">{flora.botanical}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--honey-800)] bg-[var(--honey-100)] px-2.5 py-1 rounded-full">
                        <Calendar size={12} />
                        {isHindi ? flora.monthsHi : flora.months}
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-[var(--honey-600)] shrink-0" />
                      <span className="truncate">{isHindi ? flora.regionsHi : flora.regions}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={13} className="text-[var(--honey-600)] shrink-0" />
                      <span>{isHindi ? "नेक्टर उपज:" : "Nectar:"} <strong>{flora.nectarYield}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Flora Advisory Card */}
        <div>
          <Card className="p-5 sticky top-20 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--honey-700)] bg-[var(--honey-50)] px-2.5 py-1 rounded-md border border-[var(--honey-200)]">
              <Flower2 size={14} />
              {isHindi ? "वनस्पति विस्तृत गाइड" : "Flora Field Guide"}
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-[var(--text-primary)]">
                {isHindi ? selectedFlora.nameHi : selectedFlora.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] italic font-mono">{selectedFlora.botanical}</p>
            </div>

            <div className="space-y-3 text-xs border-t border-b border-[var(--border-default)] py-3">
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">{isHindi ? "शहद का रंग व बनावट:" : "Honey Color & Consistency:"}</p>
                <p className="text-[var(--text-primary)] font-medium mt-0.5">{selectedFlora.honeyColor}</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-secondary)]">{isHindi ? "स्वाद एवं सुगंध:" : "Aroma & Flavor:"}</p>
                <p className="text-[var(--text-primary)] font-medium mt-0.5">{selectedFlora.flavorProfile}</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-secondary)]">{isHindi ? "बाजार मांग व मूल्य:" : "Market Demand & Value:"}</p>
                <p className="text-emerald-700 font-semibold mt-0.5">{selectedFlora.marketDemand}</p>
              </div>
            </div>

            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-xs space-y-1">
              <p className="font-bold text-[var(--honey-800)] flex items-center gap-1.5">
                <Compass size={14} className="text-[var(--honey-600)]" />
                {isHindi ? "प्रवास एवं देखरेख सलाह:" : "Apiary Field Advisory:"}
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {isHindi ? selectedFlora.migrationTipsHi : selectedFlora.migrationTips}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-[var(--radius-md)] border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isHindi
                  ? "पेस्टीसाइड छिड़काव चेतावनी: सरसों या सूरजमुखी के खेतों में कीटनाशक छिड़कने से 48 घंटे पहले किसानों से समन्वय करें।"
                  : "Pesticide Alert: Coordinate with farmers to avoid toxic sprays during peak morning foraging hours."}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
