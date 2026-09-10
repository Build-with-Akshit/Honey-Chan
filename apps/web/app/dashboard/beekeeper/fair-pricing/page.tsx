"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Coins,
  TrendingUp,
  Scale,
  ShieldCheck,
  Building2,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Percent,
} from "lucide-react";

interface FloralPrice {
  id: string;
  name: string;
  nameHi: string;
  middlemanRate: number; // ₹ per KG
  kvicRate: number; // ₹ per KG
  directRetailRate: number; // ₹ per KG
}

const PRICING_DATA: FloralPrice[] = [
  {
    id: "mustard",
    name: "Mustard Flower (Sarson)",
    nameHi: "सरसों का शहद",
    middlemanRate: 95,
    kvicRate: 165,
    directRetailRate: 350,
  },
  {
    id: "eucalyptus",
    name: "Eucalyptus (Safeda)",
    nameHi: "सफेदा (यूकेलिप्टस)",
    middlemanRate: 110,
    kvicRate: 175,
    directRetailRate: 380,
  },
  {
    id: "litchi",
    name: "Litchi Monofloral (Muzaffarpur)",
    nameHi: "लीची शहद (मुजफ्फरपुर)",
    middlemanRate: 140,
    kvicRate: 230,
    directRetailRate: 520,
  },
  {
    id: "multiflora",
    name: "Wild Forest Multiflora",
    nameHi: "जंगली / प्राकृतिक शहद",
    middlemanRate: 130,
    kvicRate: 210,
    directRetailRate: 480,
  },
  {
    id: "jamun",
    name: "Jamun & Ber (Medicinal)",
    nameHi: "जामुन एवं बेर शहद",
    middlemanRate: 135,
    kvicRate: 220,
    directRetailRate: 500,
  },
];

export default function FairPricingPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [selectedHoney, setSelectedHoney] = useState<string>(PRICING_DATA[0].id);
  const [harvestKg, setHarvestKg] = useState<number>(100);

  const selectedData = PRICING_DATA.find((p) => p.id === selectedHoney) || PRICING_DATA[0];

  const middlemanTotal = harvestKg * selectedData.middlemanRate;
  const kvicTotal = harvestKg * selectedData.kvicRate;
  const directTotal = harvestKg * selectedData.directRetailRate;

  const kvicGain = kvicTotal - middlemanTotal;
  const directGain = directTotal - middlemanTotal;

  const audioText = isHindi
    ? `उचित मूल्य कैलकुलेटर। यदि आप ${harvestKg} किलो सरसों का शहद बिचौलियों को बेचते हैं तो आपको केवल ₹${middlemanTotal.toLocaleString()} मिलेंगे। लेकिन केवीआईसी और हनी-चेन प्रमाणित करके बेचने पर आपको ₹${directTotal.toLocaleString()} तक का उचित मूल्य मिल सकता है, जिससे आपका मुनाफा ₹${directGain.toLocaleString()} तक बढ़ जाएगा।`
    : `Fair Price Calculator. Selling ${harvestKg} kilograms of raw honey to middlemen yields only ₹${middlemanTotal.toLocaleString()}. But certifying your batch with KVIC on HoneyChain enables you to earn up to ₹${directTotal.toLocaleString()}, increasing your net income by ₹${directGain.toLocaleString()}.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <Coins size={13} />
            {isHindi ? "मंडी मूल्य पारदर्शिता" : "Fair Trade & Price Transparency"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "मंडी भाव एवं उचित मूल्य कैलकुलेटर" : "Mandi Rate & Fair Price Calculator"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "बिचौलियों की सस्ती दरों से बचें; केवीआईसी और ब्लॉकचेन प्रमाणीकरण से अपनी आय दोगुनी करें"
              : "Eliminate middleman exploitation; realize 2x to 3x higher farm-gate revenue via verified purity"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioText} label={isHindi ? "भाव की जानकारी सुनें" : "Listen Pricing Breakdown"} />
        </div>
      </div>

      {/* Interactive Calculator Box */}
      <Card className="p-6 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--honey-50)]/30 border-[var(--honey-200)]">
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--honey-600)]" />
          {isHindi ? "अपनी फसल का मुनाफा निकालें (Profit Estimator)" : "Calculate Your Farm-Gate Realization"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isHindi ? "शहद का प्रकार (Floral Variety)" : "Honey Floral Source"}
            </label>
            <select
              value={selectedHoney}
              onChange={(e) => setSelectedHoney(e.target.value)}
              className="input text-xs font-medium"
            >
              {PRICING_DATA.map((item) => (
                <option key={item.id} value={item.id}>
                  {isHindi ? item.nameHi : item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isHindi ? "कुल शहद उत्पादन (KG)" : "Harvested Honey Quantity (KG)"}
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              step="5"
              value={harvestKg}
              onChange={(e) => setHarvestKg(Math.max(1, Number(e.target.value)))}
              className="input text-xs font-mono font-bold"
            />
          </div>
        </div>

        {/* 3-Tier Rate Comparison Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Middleman / Local Mandi */}
          <div className="p-5 rounded-[var(--radius-lg)] bg-red-50/70 border border-red-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                {isHindi ? "स्थानीय बिचौलिया / कच्ची दर" : "Local Middleman Distress Rate"}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-red-900">
                  ₹{selectedData.middlemanRate}
                </span>
                <span className="text-xs text-red-700 font-medium"> / KG</span>
              </div>
              <p className="text-xs text-red-800/80 mt-1">
                {isHindi ? "कच्चा व अनफिल्टर्ड शहद, बिना किसी जांच के" : "Raw unverified distress sale"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-red-200">
              <span className="text-xs text-red-700">{isHindi ? "कुल अनुमानित आय:" : "Total Income:"}</span>
              <p className="text-xl font-bold font-mono text-red-950">₹{middlemanTotal.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* KVIC Assured Procurement */}
          <div className="p-5 rounded-[var(--radius-lg)] bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                {isHindi ? "केवीआईसी न्यूनतम सुनिश्चित मूल्य" : "KVIC Assured Minimum Rate"}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-blue-900">
                  ₹{selectedData.kvicRate}
                </span>
                <span className="text-xs text-blue-700 font-medium"> / KG</span>
              </div>
              <p className="text-xs text-blue-800/80 mt-1">
                {isHindi ? "मोबाइल वैन द्वारा शुद्धिकरण के बाद सरकारी खरीद" : "Post-mobile van processing procurement"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <span className="text-xs text-blue-700">{isHindi ? "कुल अनुमानित आय:" : "Total Income:"}</span>
              <p className="text-xl font-bold font-mono text-blue-950">₹{kvicTotal.toLocaleString("en-IN")}</p>
              <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /> +₹{kvicGain.toLocaleString("en-IN")} {isHindi ? "अतिरिक्त लाभ" : "Extra Gain"}
              </span>
            </div>
          </div>

          {/* HoneyChain Certified Direct Retail */}
          <div className="p-5 rounded-[var(--radius-lg)] bg-gradient-to-br from-emerald-50 to-[var(--honey-100)] border border-emerald-300 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                {isHindi ? "हनी-चेन प्रमाणित सीधा विक्रय" : "HoneyChain Direct Verified"}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-emerald-950">
                  ₹{selectedData.directRetailRate}
                </span>
                <span className="text-xs text-emerald-800 font-medium"> / KG</span>
              </div>
              <p className="text-xs text-emerald-900/80 mt-1">
                {isHindi ? "क्यूआर कोड सहित स्थानीय हाट व ग्राहकों को सीधा विक्रय" : "Direct sale with QR purity passport"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-300/80">
              <span className="text-xs text-emerald-800">{isHindi ? "कुल अनुमानित आय:" : "Total Income:"}</span>
              <p className="text-xl font-bold font-mono text-emerald-950">₹{directTotal.toLocaleString("en-IN")}</p>
              <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /> +₹{directGain.toLocaleString("en-IN")} ({Math.round((directGain / middlemanTotal) * 100)}% {isHindi ? "अधिक मुनाफा" : "More Profit"})
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Regional Mandi Live Price Board */}
      <Card className="p-5">
        <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Building2 size={16} className="text-[var(--honey-600)]" />
          {isHindi ? "क्षेत्रीय प्रमुख शहद मंडियों के दैनिक भाव (Live Mandi Board)" : "Regional Honey Mandi Live Benchmark Rates"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)] font-semibold uppercase">
                <th className="pb-2.5">{isHindi ? "मंडी / क्षेत्र" : "Mandi / Hub"}</th>
                <th className="pb-2.5">{isHindi ? "राज्य" : "State"}</th>
                <th className="pb-2.5">{isHindi ? "प्रमुख वनस्पति" : "Flora"}</th>
                <th className="pb-2.5">{isHindi ? "कच्ची दर (Raw)" : "Raw Mandi"}</th>
                <th className="pb-2.5">{isHindi ? "केवीआईसी दर" : "KVIC Price"}</th>
                <th className="pb-2.5">{isHindi ? "प्रमाणित दर (Verified)" : "HoneyChain Retail"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <td className="py-2.5 font-bold text-[var(--text-primary)]">Sonipat Apiary Mandi</td>
                <td>Haryana</td>
                <td>Sarson (Mustard)</td>
                <td className="font-mono text-red-700">₹95 / KG</td>
                <td className="font-mono text-blue-700 font-bold">₹165 / KG</td>
                <td className="font-mono text-emerald-700 font-bold">₹350 / KG</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[var(--text-primary)]">Muzaffarpur Litchi Hub</td>
                <td>Bihar</td>
                <td>Litchi Blossom</td>
                <td className="font-mono text-red-700">₹140 / KG</td>
                <td className="font-mono text-blue-700 font-bold">₹230 / KG</td>
                <td className="font-mono text-emerald-700 font-bold">₹520 / KG</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[var(--text-primary)]">Bharatpur Mandi</td>
                <td>Rajasthan</td>
                <td>Mustard & Ber</td>
                <td className="font-mono text-red-700">₹100 / KG</td>
                <td className="font-mono text-blue-700 font-bold">₹170 / KG</td>
                <td className="font-mono text-emerald-700 font-bold">₹360 / KG</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[var(--text-primary)]">Saharanpur Wood & Honey Belt</td>
                <td>Uttar Pradesh</td>
                <td>Eucalyptus</td>
                <td className="font-mono text-red-700">₹110 / KG</td>
                <td className="font-mono text-blue-700 font-bold">₹175 / KG</td>
                <td className="font-mono text-emerald-700 font-bold">₹380 / KG</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
