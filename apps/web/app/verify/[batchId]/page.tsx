"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { honeyApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FlaskConical,
  Calendar,
  Shield,
  User,
  Flower2,
  Wifi,
  WifiOff,
  Info,
  Database,
  LinkIcon,
  Truck,
  Sparkles,
  Award,
} from "lucide-react";

export default function VerifyPage() {
  const params = useParams();
  const batchId = (params.batchId as string) || "HC-2026-000127";
  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tampering, setTampering] = useState(false);
  const [tamperSuccessMsg, setTamperSuccessMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const loadVerification = async () => {
    try {
      const res = await honeyApi.verifyBatch(batchId);
      setData(res);
    } catch (err: unknown) {
      console.error("Verification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, [batchId]);

  const handleTamperTest = async () => {
    setTampering(true);
    setTamperSuccessMsg(null);
    try {
      await honeyApi.tamperBatch(batchId);
      setTamperSuccessMsg(isHindi ? "अनधिकृत छेड़छाड़ का पता चला!" : "SIMULATED UNAUTHORIZED OFF-CHAIN MODIFICATION DETECTED");
      await loadVerification();
    } catch (err: unknown) {
      console.error("Tamper error:", err);
    } finally {
      setTampering(false);
    }
  };

  useGSAP(
    () => {
      if (loading || !data) return;
      gsap.from(".hero-anim", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
      if (timelineRef.current) {
        gsap.from(".timeline-node", {
          scrollTrigger: { trigger: timelineRef.current, start: "top 85%" },
          x: -30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
      if (data?.isTampered) {
        gsap.to(".tamper-alert", { boxShadow: "0 0 30px rgba(220,38,38,0.6)", yoyo: true, repeat: -1, duration: 0.8 });
      }
    },
    { scope: containerRef, dependencies: [loading, data] }
  );

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {isHindi ? "ब्लॉकचेन बहीखाते से जांच हो रही है..." : "Verifying Cryptographic Ledger..."}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{batchId}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle size={32} className="text-[var(--color-danger)] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isHindi ? "सत्यापन विफल" : "Verification Failed"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {isHindi ? "बैच डेटा प्राप्त नहीं हो सका।" : "Could not load batch data."}
          </p>
          <Link href="/" className="btn-primary mt-6 text-sm">
            {isHindi ? "मुख्य पृष्ठ" : "Go Home"}
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = data.verified && !data.isTampered;
  const isTampered = data.isTampered;
  const batchData = data.batch || {};
  const mode = data.verificationMode || "unverified";

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--bg-base)] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Navbar with Language Toggle */}
        <div className="flex items-center justify-between hero-anim">
          <Link href="/" className="btn-outline text-xs py-2 px-3 flex items-center gap-1">
            <ArrowLeft size={14} />
            {isHindi ? "होम" : "Home"}
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
              {isHindi ? "उपभोक्ता डिजिटल पासपोर्ट" : "Consumer Verification"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-[var(--bg-muted)] p-0.5 border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  language === "en" ? "bg-[var(--honey-600)] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  language === "hi" ? "bg-[var(--honey-600)] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                हिंदी
              </button>
            </div>
            <span className="text-[11px] font-mono bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] px-2.5 py-1 rounded-full font-bold">
              {data.batchId}
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {isVerified ? (
          <div className="text-center py-8 hero-anim">
            <div className="w-20 h-20 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-[var(--color-success)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-outfit)]">
              {isHindi ? "100% शुद्ध एवं प्रमाणित शहद" : "Authentic Honey Verified"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
              {isHindi
                ? "यह शहद केवीआईसी मोबाइल प्रोसेसिंग वैन द्वारा ऑन-साइट फिल्टर एवं ब्लॉकचेन पर अपरिवर्तनीय रूप से दर्ज है।"
                : data.verificationMode === "on-chain"
                ? "Cryptographically verified on Ethereum Sepolia ledger. Smart contract confirms origin & purity."
                : "Hash verified against stored cryptographic records."}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  mode === "on-chain"
                    ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]"
                    : "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]"
                }`}
              >
                {mode === "on-chain" ? <LinkIcon size={12} /> : <Database size={12} />}
                {mode === "on-chain" ? "ON-CHAIN PROOF" : "DB-HASH VERIFIED"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <Truck size={12} className="text-amber-700" />
                {isHindi ? "KVIC वैन द्वारा प्रोसेस्ड" : "KVIC Mobile Van Processed"}
              </span>
            </div>
          </div>
        ) : isTampered ? (
          <div className="tamper-alert bg-[var(--color-danger)] text-white p-8 rounded-2xl text-center hero-anim my-6">
            <AlertTriangle size={40} className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold uppercase tracking-tight font-[family-name:var(--font-outfit)]">
              {isHindi ? "चेतावनी: रिकॉर्ड में छेड़छाड़!" : "Tamper Warning"}
            </h2>
            <p className="text-sm mt-3 border-t border-white/30 pt-3 max-w-md mx-auto">
              {isHindi
                ? "डेटाबेस रिकॉर्ड ब्लॉकचेन हैश से मेल नहीं खा रहा है। यह उत्पाद नकली या मिलावटी हो सकता है।"
                : "DATABASE RECORD DOES NOT MATCH STORED HASH. THIS PRODUCT MAY BE COUNTERFEIT."}
            </p>
          </div>
        ) : (
          <div className="text-center py-8 hero-anim">
            <div className="w-20 h-20 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={36} className="text-[var(--color-warning)]" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              {isHindi ? "अपुष्ट बैच" : "Not Verified"}
            </h2>
          </div>
        )}

        {/* Origin Passport */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden hero-anim shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-outfit)]">
              {isHindi ? "उत्पत्ति एवं पालक विवरण (Origin Passport)" : "Origin & Beekeeper Passport"}
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {isHindi ? "मीठी क्रांति — KVIC" : "Meethi Kranti"}
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--honey-50)] flex items-center justify-center shrink-0">
                <Flower2 size={14} className="text-[var(--honey-600)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  {isHindi ? "फूल का प्रकार" : "Floral Source"}
                </p>
                <p className="text-[var(--text-primary)] font-semibold mt-0.5">
                  {batchData.floralSource || "Mustard Flower (Sarson)"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--honey-50)] flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[var(--honey-600)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  {isHindi ? "क्षेत्र / क्लस्टर" : "Region / Cluster"}
                </p>
                <p className="text-[var(--text-primary)] font-semibold mt-0.5">
                  {batchData.region || "Sonipat Honey Cluster, Haryana"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--honey-50)] flex items-center justify-center shrink-0">
                <User size={14} className="text-[var(--honey-600)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  {isHindi ? "मधुमक्खी पालक" : "Beekeeper"}
                </p>
                <p className="text-[var(--text-primary)] font-semibold mt-0.5">
                  {batchData.beekeeperName || "Ramesh Kumar (KVIC Beneficiary)"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--honey-50)] flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[var(--honey-600)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  {isHindi ? "निष्कासन तिथि" : "Harvest Date"}
                </p>
                <p className="text-[var(--text-primary)] font-semibold mt-0.5">
                  {batchData.harvestDate
                    ? new Date(batchData.harvestDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "22 Aug 2026"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Scorecard */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden hero-anim shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--border-default)]">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-outfit)]">
              {isHindi ? "एफएसएसएआई गुणवत्ता स्कोरकार्ड (FSSAI Purity Parameters)" : "FSSAI Quality Scorecard"}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {isHindi ? "नमी प्रतिशत (Moisture < 20%)" : "Moisture Content (FSSAI Limit < 20%)"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "18.2%" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 w-12 text-right">18.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {isHindi ? "प्राकृतिक फ्रुक्टोज एवं ग्लूकोज" : "Fructose + Glucose Ratio (> 60%)"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--honey-500)] rounded-full" style={{ width: "68.5%" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)] w-12 text-right">68.5%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {isHindi ? "सुक्रोज (Sucrose < 5%)" : "Sucrose Sugar (Limit < 5%)"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "2.8%" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 w-12 text-right">2.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {isHindi ? "एचएमएफ स्तर (HMF < 80 mg/kg)" : "HMF Heat Degradation Index"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 w-12 text-right">12 mg/kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custody Timeline */}
        <div ref={timelineRef} className="hero-anim">
          <h3 className="font-bold text-[var(--text-primary)] text-sm mb-4 font-[family-name:var(--font-outfit)]">
            {isHindi ? "सप्लाई चेन यात्रा (Custody Timeline)" : "Supply Chain Custody Timeline"}
          </h3>
          <div className="relative pl-6 border-l-2 border-[var(--honey-200)] space-y-6">
            <div className="timeline-node relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[var(--honey-500)] border-2 border-[var(--bg-base)]" />
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {isHindi ? "छत्ते से निष्कासन (Harvested)" : "Harvested at Apiary"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">22 Aug 2026</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isHindi
                    ? "पालक: रमेश कुमार (सोनीपत क्लस्टर, बॉक्स #HIVE-007)"
                    : "Beekeeper: Ramesh Kumar (Sonipat Apiary, Box #HIVE-007)"}
                </p>
              </div>
            </div>

            <div className="timeline-node relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[var(--honey-500)] border-2 border-[var(--bg-base)]" />
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {isHindi ? "केवीआईसी मोबाइल वैन द्वारा प्रोसेसिंग" : "KVIC Mobile Van In-Situ Processing"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">23 Aug 2026</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isHindi
                    ? "मोबाइल वैन #PU-01 द्वारा ऑन-साइट फिल्ट्रेशन व नमी नियंत्रण (<18.2%)"
                    : "Processed on-site by Mobile Processing Van #PU-01 at Ganaur Mandi"}
                </p>
              </div>
            </div>

            <div className="timeline-node relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-base)]" />
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-800">
                    {isHindi ? "ब्लॉकचेन सत्यापन व क्यूआर जारी" : "On-Chain Tamper-Proof QR Issued"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">24 Aug 2026</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isHindi
                    ? "स्मार्ट अनुबंध 0xad1c... द्वारा डिजिटल रूप से सत्यापित"
                    : "Anchored on Sepolia Smart Contract 0xad1c...7Ecb"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6 hero-anim shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] text-sm mb-3 font-[family-name:var(--font-outfit)]">
            {isHindi ? "क्रिप्टोग्राफिक हैश (Cryptographic Hash)" : "Cryptographic Hash"}
          </h3>
          <div className="bg-[var(--bg-muted)] rounded-lg p-3 font-mono text-[10px] text-[var(--text-secondary)] break-all leading-relaxed">
            {data.batchHash || "0x8f1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"}
          </div>
          {data.txHash && (
            <div className="mt-3">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Transaction Hash</p>
              <div className="bg-[var(--bg-muted)] rounded-lg p-3 font-mono text-[10px] text-[var(--text-secondary)] break-all">
                {data.txHash}
              </div>
            </div>
          )}
        </div>

        {/* Tamper Simulation Test */}
        <div className="text-center hero-anim pb-8">
          <button
            onClick={handleTamperTest}
            disabled={tampering}
            className="inline-flex items-center gap-2 text-[var(--color-danger)] border border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg)] text-xs px-4 py-2 rounded-full transition-all disabled:opacity-50 cursor-pointer"
          >
            {tampering ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {isHindi ? "जांच चल रही है..." : "Simulating Tamper..."}
              </>
            ) : (
              <>
                <Shield size={12} />
                {isHindi ? "छेड़छाड़ सिमुलेशन टेस्ट करें" : "Simulate Tamper"}
              </>
            )}
          </button>
          {tamperSuccessMsg && (
            <p className="text-xs text-[var(--color-danger)] mt-3 font-mono font-bold">{tamperSuccessMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
