"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Building,
  CheckCircle2,
  FileText,
  DollarSign,
  ExternalLink,
  Shield,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Boxes,
  Percent,
} from "lucide-react";

export default function KvicSchemesPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [projectCost, setProjectCost] = useState<number>(500000); // 5 Lakhs
  const [beneficiaryCategory, setBeneficiaryCategory] = useState<"SPECIAL" | "GENERAL">("SPECIAL");
  const [areaType, setAreaType] = useState<"RURAL" | "URBAN">("RURAL");

  // PMEGP Subsidy calculation
  const subsidyPercent =
    areaType === "RURAL"
      ? beneficiaryCategory === "SPECIAL"
        ? 35
        : 25
      : beneficiaryCategory === "SPECIAL"
      ? 25
      : 15;

  const subsidyAmount = (projectCost * subsidyPercent) / 100;
  const ownContribution = (projectCost * (beneficiaryCategory === "SPECIAL" ? 5 : 10)) / 100;
  const bankLoan = projectCost - subsidyAmount - ownContribution;

  const audioText = isHindi
    ? "केवीआईसी सरकारी योजनाएं एवं सब्सिडी सेवा केंद्र। हनी मिशन के तहत प्रत्येक पात्र ग्रामीण किसान को 10 मधुमक्खी बक्से, कालोनियां और उपकरण किट नि:शुल्क दिए जाते हैं। पीएमईजीपी योजना में ग्रामीण क्षेत्र की महिलाओं और विशेष वर्ग को 35 प्रतिशत तक की सरकारी सब्सिडी का लाभ मिलता है।"
    : "KVIC Government Schemes and Subsidies Hub. Under Honey Mission, 10 bee boxes, colonies, and toolkit are provided free to eligible rural farmers. Under the PMEGP scheme, rural beekeepers and women receive up to 35 percent capital subsidy.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-2">
            <Building size={13} />
            {isHindi ? "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (MSME)" : "Ministry of MSME & KVIC"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "केवीआईसी सरकारी योजनाएं एवं सब्सिडी (KVIC Schemes)" : "KVIC Schemes & Government Subsidies Hub"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "हनी मिशन 10-बॉक्स वितरण, पीएमईजीपी 35% सब्सिडी एवं मधुक्रांति पोर्टल डीबीटी लाभ"
              : "Honey Mission 10-box allocation, PMEGP credit-linked subsidies & Madhukranti DBT benefits"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioText} label={isHindi ? "योजनाओं की जानकारी सुनें" : "Listen Scheme Guide"} />
        </div>
      </div>

      {/* Scheme 1: KVIC Honey Mission (Meethi Kranti) */}
      <div className="bg-gradient-to-r from-[var(--honey-700)] to-[var(--orange-800)] rounded-[var(--radius-xl)] p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
              <Boxes size={14} />
              {isHindi ? "फ्लैगशिप योजना — मीठी क्रांति" : "Flagship Scheme: Meethi Kranti"}
            </span>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">
              {isHindi ? "केवीआईसी हनी मिशन (10 बी-बॉक्स नि:शुल्क वितरण)" : "KVIC Honey Mission (10 Bee-Box Distribution)"}
            </h2>
            <p className="text-xs text-white/85 leading-relaxed">
              {isHindi
                ? "ग्रामीण किसानों, आदिवासियों और बेरोजगार युवाओं को स्वावलंबी बनाने हेतु 10 मधुमक्खी बक्से, रानी सहित लाइव कॉलोनी, निष्कासन उपकरण और 5 दिवसीय प्रशिक्षण पूर्णतः नि:शुल्क दिया जाता है।"
                : "Provides 10 bee colonies with boxes, toolkit (smoker, extractor, veil), and 5-day professional training completely free to rural farmers and SHGs."}
            </p>
          </div>

          <div className="shrink-0 space-y-2">
            <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-center">
              <span className="text-[10px] text-white/70 block uppercase">{isHindi ? "सत्र 2026 स्थिति" : "2026 Batch"}</span>
              <span className="text-lg font-bold font-mono text-emerald-300">
                {isHindi ? "आवेदन खुले हैं" : "Applications Open"}
              </span>
            </div>
            <a
              href="https://www.kviconline.gov.in"
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full text-xs py-2 bg-white !text-[var(--honey-900)] hover:bg-[var(--honey-50)] flex items-center justify-center gap-1.5 font-bold"
            >
              <span>{isHindi ? "केवीआईसी पोर्टल पर जाएं" : "Apply on KVIC Portal"}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{isHindi ? "10 लाइव बी-बॉक्सेस" : "10 Live Bee Boxes"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{isHindi ? "स्टेनलेस स्टील एक्सट्रैक्टर" : "Stainless Extractor"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{isHindi ? "धुआंदानी व सुरक्षा जाली" : "Smoker & Safety Veil"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{isHindi ? "5-दिवसीय प्रमाणिक प्रशिक्षण" : "5-Day CBRTI Training"}</span>
          </div>
        </div>
      </div>

      {/* Scheme 2: PMEGP Subsidy Calculator */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)]">
                  {isHindi ? "पीएमईजीपी सब्सिडी कैलकुलेटर (PMEGP Calculator)" : "PMEGP Apiary Loan Subsidy Calculator"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isHindi
                    ? "व्यावसायिक स्तर (50 से 500 बक्से) पर मधुमक्खी पालन व प्रोसेसिंग इकाई लगाने हेतु बैंक सब्सिडी"
                    : "Calculate capital subsidy for commercial beekeeping & processing units up to ₹25 Lakhs"}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {subsidyPercent}% {isHindi ? "सब्सिडी" : "Subsidy"}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  {isHindi ? "परियोजना लागत (Project Cost)" : "Total Project Cost (₹)"}
                </label>
                <input
                  type="number"
                  step="50000"
                  min="100000"
                  max="2500000"
                  value={projectCost}
                  onChange={(e) => setProjectCost(Number(e.target.value))}
                  className="input text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  {isHindi ? "लाभार्थी श्रेणी (Category)" : "Beneficiary Category"}
                </label>
                <select
                  value={beneficiaryCategory}
                  onChange={(e) => setBeneficiaryCategory(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="SPECIAL">विशेष वर्ग (महिला, SC/ST/OBC, पूर्व सैनिक)</option>
                  <option value="GENERAL">सामान्य वर्ग (General Category)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  {isHindi ? "क्षेत्र (Area Location)" : "Apiary Location"}
                </label>
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="RURAL">ग्रामीण क्षेत्र (Rural Area — 35%)</option>
                  <option value="URBAN">शहरी क्षेत्र (Urban Area — 25%)</option>
                </select>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-emerald-50 rounded-[var(--radius-lg)] border border-emerald-200">
                <p className="text-[11px] text-emerald-800 font-semibold">{isHindi ? "सरकारी सब्सिडी (माफ़ राशि)" : "Government Subsidy"}</p>
                <p className="text-xl font-bold font-mono text-emerald-950 mt-1">₹{subsidyAmount.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-emerald-700 font-medium">{subsidyPercent}% non-repayable grant</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-[var(--radius-lg)] border border-amber-200">
                <p className="text-[11px] text-amber-800 font-semibold">{isHindi ? "स्वयं का अंशदान (Own Share)" : "Own Contribution"}</p>
                <p className="text-xl font-bold font-mono text-amber-950 mt-1">₹{ownContribution.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-amber-700 font-medium">{beneficiaryCategory === "SPECIAL" ? "5%" : "10%"} farmer investment</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-[var(--radius-lg)] border border-blue-200">
                <p className="text-[11px] text-blue-800 font-semibold">{isHindi ? "बैंक ऋण (Bank Loan)" : "Bank Loan Balance"}</p>
                <p className="text-xl font-bold font-mono text-blue-950 mt-1">₹{bankLoan.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-blue-700 font-medium">Low interest agri-loan</span>
              </div>
            </div>
          </Card>

          {/* Scheme 3: Madhukranti & NBHM Portal */}
          <Card className="p-5">
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <FileText size={16} className="text-[var(--honey-600)]" />
              {isHindi ? "मधुक्रांति पोर्टल एवं राष्ट्रीय मधुमक्खी मिशन (NBHM)" : "Madhukranti Portal & NBHM Integration"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              {isHindi
                ? "राष्ट्रीय मधुमक्खी पालन बोर्ड (NBB) के अंतर्गत मधुक्रांति पोर्टल पर प्रत्येक मधुमक्खी पालक को 14 अंकों की विशिष्ट पहचान संख्या (Beekeeper ID) प्रदान की जाती है जिससे सरकारी डीबीटी सब्सिडी सीधे बैंक खाते में जमा होती है।"
                : "National Beekeeping & Honey Mission (NBHM) provides a unique 14-digit Beekeeper ID on the Madhukranti Portal for direct benefit transfers (DBT) and traceability registration."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://madhukranti.in"
                target="_blank"
                rel="noreferrer"
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <span>{isHindi ? "मधुक्रांति पोर्टल खोलें" : "Open Madhukranti Portal"}</span>
                <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-[var(--text-muted)]">
                {isHindi ? "आवश्यक दस्तावेज: आधार कार्ड, बैंक पासबुक, फोटो" : "Required: Aadhaar Card, Bank Passbook, Photo"}
              </span>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Eligibility Checklist */}
        <div>
          <Card className="p-5 space-y-4 sticky top-20">
            <h3 className="font-[family-name:var(--font-outfit)] text-base font-bold text-[var(--text-primary)]">
              {isHindi ? "आवेदन हेतु आवश्यक पात्रता" : "Scheme Eligibility Checklist"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{isHindi ? "आयु सीमा" : "Age Criteria"}</p>
                  <p className="text-[var(--text-muted)]">{isHindi ? "18 वर्ष या उससे अधिक" : "18 years and above"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{isHindi ? "शैक्षणिक योग्यता" : "Education"}</p>
                  <p className="text-[var(--text-muted)]">{isHindi ? "कोई न्यूनतम बाध्यता नहीं (हस्ताक्षर / अंगूठा)" : "No minimum qualification needed"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{isHindi ? "भूमि स्वामित्व" : "Land Requirement"}</p>
                  <p className="text-[var(--text-muted)]">{isHindi ? "भूमिहीन किसान भी पात्र हैं" : "Landless farmers & SHGs eligible"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{isHindi ? "दस्तावेज" : "Documents Required"}</p>
                  <p className="text-[var(--text-muted)]">{isHindi ? "आधार कार्ड, बैंक खाता, निवास प्रमाण" : "Aadhaar, Bank Passbook, Residence proof"}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[var(--honey-50)] rounded-lg border border-[var(--honey-200)] text-xs text-[var(--honey-800)]">
              <p className="font-bold mb-1">{isHindi ? "सहायता केंद्र" : "Assistance Desk"}</p>
              <p className="text-[11px] leading-relaxed">
                {isHindi
                  ? "निकटतम जिला उद्योग केंद्र (DIC) या खादी ग्रामोद्योग कार्यालय से संपर्क करें।"
                  : "Contact your nearest District Industries Centre (DIC) or KVIC State Office."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
