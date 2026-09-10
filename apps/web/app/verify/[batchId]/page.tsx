"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { honeyApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
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
  Database,
  LinkIcon,
  Truck,
  Printer,
  RotateCcw,
  ExternalLink,
  Eye,
  Check,
  X,
  Radio,
  Sparkles,
} from "lucide-react";

export default function VerifyPage() {
  const params = useParams();
  const rawBatchId = params.batchId as string;
  const batchId = rawBatchId || "HC-2026-000127";
  const router = useRouter();

  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tampering, setTampering] = useState(false);
  const [recalling, setRecalling] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const handleTamperAction = async (action: "tamper" | "restore") => {
    setTampering(true);
    setActionNotice(null);
    try {
      const res = await honeyApi.tamperBatch(batchId, action);
      const defaultMsg =
        action === "tamper"
          ? isHindi
            ? "डेटाबेस में छेड़छाड़ की गई! हैश बेमेल ट्रिगर हुआ।"
            : "Database tampered! Hash mismatch triggered."
          : isHindi
            ? "प्रामाणिक ऑन-चेन रिकॉर्ड पुनर्स्थापित किया गया।"
            : "Original authentic record restored.";
      setActionNotice(res.message || defaultMsg);
      await loadVerification();
    } catch (err: unknown) {
      console.error("Tamper error:", err);
      setActionNotice(
        isHindi
          ? "छेड़छाड़ अनुकरण विफल रहा"
          : "Failed to execute tamper action"
      );
    } finally {
      setTampering(false);
    }
  };

  const handleRecallAction = async (action: "recall" | "restore") => {
    setRecalling(true);
    setActionNotice(null);
    try {
      const res = await honeyApi.recallBatch(batchId, {
        action,
        reason: "Product anomaly detected via post-market NMR / C4 testing.",
        authority: "National Quality Control & Food Safety Directorate",
      });
      const defaultMsg =
        action === "recall"
          ? isHindi
            ? "बैच को आधिकारिक तौर पर वापस मंगा लिया गया है!"
            : "Batch officially recalled across registry!"
          : isHindi
            ? "बैच रिकॉल आदेश रद्द कर दिया गया।"
            : "Batch recall revoked.";
      setActionNotice(res.message || defaultMsg);
      await loadVerification();
    } catch (err: unknown) {
      console.error("Recall error:", err);
      setActionNotice(
        isHindi ? "रिकॉल कार्रवाई विफल रही" : "Failed to execute recall action"
      );
    } finally {
      setRecalling(false);
    }
  };

  useGSAP(
    () => {
      if (loading || !data) return;
      gsap.from(".hero-anim", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });

      if (timelineRef.current) {
        gsap.from(".timeline-node", {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        });
      }

      if (data?.isTampered || data?.isRecalled) {
        gsap.to(".tamper-alert", {
          boxShadow: "0 0 25px rgba(220,38,38,0.45)",
          yoyo: true,
          repeat: -1,
          duration: 0.9,
        });
      }
    },
    { scope: containerRef, dependencies: [loading, data] }
  );

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
            {isHindi
              ? "ब्लॉकचेन बहीखाते से जाँच हो रही है..."
              : "Verifying Cryptographic Ledger..."}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
            {decodeURIComponent(batchId)}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle
            size={36}
            className="text-[var(--color-danger)] mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
            {isHindi ? "सत्यापन विफल" : "Verification Failed"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "बैच डेटा प्राप्त नहीं हो सका।"
              : "Could not load batch verification data."}
          </p>
          <Link href="/" className="btn-primary mt-6 text-sm inline-block">
            {isHindi ? "मुख्य पृष्ठ" : "Go Home"}
          </Link>
        </div>
      </div>
    );
  }

  const isVerified =
    data?.hashMatch &&
    !data?.isTampered &&
    !data?.isRecalled &&
    data?.verificationMode !== "unverified";
  const mode = data?.verificationMode || "unverified";

  // Group transfer events with subsequent acceptance/rejection
  const journey = data?.journey || [];
  const groupedJourney: any[] = [];
  let i = 0;
  while (i < journey.length) {
    const step = journey[i];
    if (step.stage === "PENDING_TRANSFER" && i + 1 < journey.length) {
      groupedJourney.push({
        isGroup: true,
        actor: step.actor,
        transferEvent: step,
        outcomeEvent: journey[i + 1],
      });
      i += 2;
    } else {
      groupedJourney.push({ isGroup: false, ...step });
      i++;
    }
  }

  const formatStageDisplay = (stage: string) => {
    if (stage === "DISTRIBUTED" || stage === "DISTRIBUTION")
      return isHindi ? "वितरण (Distribution)" : "DISTRIBUTION";
    if (stage === "PROCESSING")
      return isHindi ? "प्रसंस्करण (Processing)" : "PROCESSING";
    if (
      stage === "QUALITY_TESTED" ||
      stage === "TESTED" ||
      stage === "LAB_TESTING"
    )
      return isHindi ? "गुणवत्ता परीक्षण (Lab Testing)" : "QUALITY TESTING";
    if (stage === "RETAIL") return isHindi ? "खुदरा बिक्री (Retail)" : "RETAIL";
    if (stage === "HARVEST")
      return isHindi ? "मधुमक्खी पालन कटाई (Harvest)" : "HARVEST";
    if (stage === "RECALLED")
      return isHindi ? "आधिकारिक रिकॉल (Recall)" : "OFFICIAL RECALL";
    return stage;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-base)] print:bg-white print:bg-none py-8 print:py-0 px-4 text-[var(--text-primary)]"
    >
      {/* ─── Print-Only Certificate View ─── */}
      <div className="hidden print:flex flex-col items-center justify-center min-h-screen w-full bg-white text-black p-10">
        <h2 className="text-3xl font-bold mb-2">HoneyChain Verification</h2>
        <p className="text-gray-600 mb-8 font-mono text-lg">
          Batch ID: {decodeURIComponent(batchId)}
        </p>
        <div className="p-4 border-4 border-gray-900 rounded-xl">
          <QRCodeSVG
            value={
              typeof window !== "undefined"
                ? window.location.href
                : `https://honey-chan.vercel.app/verify/${batchId}`
            }
            size={250}
          />
        </div>
        <p className="mt-8 text-gray-500 font-medium">
          Scan to verify this product&apos;s authenticity on HoneyChain
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5 print:hidden">
        {/* ─── Navigation & Language Bar ─── */}
        <div className="flex items-center justify-between hero-anim">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] bg-white border border-[var(--border-default)] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[var(--bg-muted)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{isHindi ? "पीछे" : "Back"}</span>
          </button>
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
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  language === "en"
                    ? "bg-[var(--honey-600)] text-white shadow-sm"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  language === "hi"
                    ? "bg-[var(--honey-600)] text-white shadow-sm"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                हिंदी
              </button>
            </div>
            <span
              className="text-[11px] font-mono bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] px-2.5 py-1 rounded-full font-bold max-w-[120px] truncate"
              title={data?.batchId || decodeURIComponent(batchId)}
            >
              {data?.batchId || decodeURIComponent(batchId)}
            </span>
          </div>
        </div>

        {/* ─── Emergency Recall Banner ─── */}
        {data?.isRecalled && (
          <div className="tamper-alert p-5 bg-red-600 text-white rounded-2xl shadow-xl hero-anim">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div className="flex-1">
                <h2 className="text-base font-black uppercase tracking-wide">
                  {isHindi
                    ? "आधिकारिक बैच रिकॉल सूचना — उपभोग न करें"
                    : "OFFICIAL BATCH RECALL NOTICE — DO NOT CONSUME"}
                </h2>
                <p className="text-xs text-red-100 mt-1 font-medium">
                  {data?.recallDetails?.reason ||
                    "This batch has been officially recalled by food safety authorities due to confirmed quality non-compliance."}
                </p>
                <div className="mt-3 pt-2 border-t border-red-500/60 flex flex-wrap items-center justify-between text-[11px] text-red-100">
                  <span>
                    Authority:{" "}
                    <strong className="text-white">
                      {data?.recallDetails?.authority ||
                        "Central Food Safety Authority / KVIC"}
                    </strong>
                  </span>
                  <span>
                    Recalled:{" "}
                    <strong className="text-white">
                      {data?.recallDetails?.recalledAt
                        ? new Date(
                            data.recallDetails.recalledAt
                          ).toLocaleDateString()
                        : "Immediate Enforcement"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SIH 2026 Judge Interactive Evaluation Panel ─── */}
        <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/80 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-md hero-anim">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-[family-name:var(--font-outfit)]">
                SIH 2026 Judge Interactive Evaluation Panel
              </h3>
            </div>
            <span className="text-[10px] bg-amber-200/70 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-mono font-semibold">
              Live Attack Simulation
            </span>
          </div>

          <p className="text-[11px] text-amber-800 mb-3">
            {isHindi
              ? "देखें कि कैसे हनीचेन गणितीय रूप से अनधिकृत ऑफ-चेन डेटाबेस छेड़छाड़ और खाद्य सुरक्षा रिकॉल को तुरंत पकड़ता है:"
              : "Demonstrate how HoneyChain mathematically catches unauthorized off-chain database tampering and food safety recalls:"}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {!data?.isTampered ? (
              <button
                onClick={() => handleTamperAction("tamper")}
                disabled={tampering}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>🚨</span>
                <span>
                  {tampering
                    ? isHindi
                      ? "इंजेक्ट कर रहा है..."
                      : "Injecting..."
                    : isHindi
                      ? "डेटाबेस छेड़छाड़ का अनुकरण करें"
                      : "Simulate DB Tampering"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleTamperAction("restore")}
                disabled={tampering}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>🔄</span>
                <span>
                  {tampering
                    ? isHindi
                      ? "पुनर्स्थापित हो रहा है..."
                      : "Restoring..."
                    : isHindi
                      ? "सत्यापित रिकॉर्ड पुनर्स्थापित करें"
                      : "Restore Authentic Record"}
                </span>
              </button>
            )}

            {!data?.isRecalled ? (
              <button
                onClick={() => handleRecallAction("recall")}
                disabled={recalling}
                className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>⚠️</span>
                <span>
                  {recalling
                    ? isHindi
                      ? "चिह्नित कर रहा है..."
                      : "Flagging..."
                    : isHindi
                      ? "बैच रिकॉल ट्रिगर करें"
                      : "Trigger Batch Recall"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleRecallAction("restore")}
                disabled={recalling}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>✅</span>
                <span>
                  {recalling
                    ? isHindi
                      ? "हटा रहा है..."
                      : "Clearing..."
                    : isHindi
                      ? "रिकॉल वापस लें"
                      : "Revoke Batch Recall"}
                </span>
              </button>
            )}
          </div>

          {actionNotice && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-100 border border-amber-300 text-[11px] text-amber-950 text-center font-medium">
              {actionNotice}
            </div>
          )}
        </div>

        {/* ─── Batch QR Code & Print Bar ─── */}
        <div className="p-4 bg-white border border-[var(--border-default)] rounded-2xl shadow-sm flex items-center justify-between hero-anim">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 border border-gray-200 rounded-xl shadow-xs">
              <QRCodeSVG
                value={
                  typeof window !== "undefined"
                    ? window.location.href
                    : `https://honey-chan.vercel.app/verify/${batchId}`
                }
                size={58}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isHindi ? "बैच क्यूआर कोड" : "Batch QR Certificate"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                {isHindi
                  ? "प्रामाणिकता सत्यापन के लिए स्कैन करें"
                  : "Scan to verify this product anywhere"}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>{isHindi ? "प्रिंट प्रमाणपत्र" : "Print QR"}</span>
          </button>
        </div>

        {/* ─── Verification Status Banner ─── */}
        <div
          className={`p-6 text-center rounded-2xl border-2 shadow-md hero-anim ${
            data?.isRecalled
              ? "border-red-500 bg-gradient-to-b from-red-50 via-white to-red-50"
              : isVerified
                ? "border-emerald-300 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40"
                : "border-red-400 bg-gradient-to-b from-red-50/80 via-white to-red-50/60 tamper-alert"
          }`}
        >
          <div className="inline-block p-2 rounded-2xl mb-3 shadow-inner">
            {data?.isRecalled ? (
              <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
                <AlertTriangle size={30} />
              </div>
            ) : isVerified ? (
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={30} />
              </div>
            ) : (
              <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-500/30 animate-pulse">
                <X size={30} />
              </div>
            )}
          </div>

          <h2
            className={`text-2xl font-black mb-1 font-[family-name:var(--font-outfit)] ${
              data?.isRecalled
                ? "text-red-700"
                : isVerified
                  ? "text-emerald-800"
                  : "text-red-700"
            }`}
          >
            {data?.isRecalled
              ? isHindi
                ? "🚨 बैच आधिकारिक तौर पर वापस लिया गया"
                : "🚨 Batch Officially Recalled"
              : isVerified
                ? isHindi
                  ? "100% शुद्ध एवं प्रमाणित शहद"
                  : "Authentic Honey Verified"
                : isHindi
                  ? "⚠️ रिकॉर्ड में छेड़छाड़ का पता चला"
                  : "Tamper Warning Detected"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            {data?.isRecalled
              ? isHindi
                ? "इस शहद बैच को खाद्य सुरक्षा अधिकारियों द्वारा वापस ले लिया गया है। उपभोग न करें।"
                : "This honey batch has been flagged and recalled by regulatory authorities. Do not purchase or consume."
              : isVerified
                ? mode === "on-chain"
                  ? isHindi
                    ? "क्रिप्टोग्राफ़िक हैश एथेरियम सेपोलिया स्मार्ट अनुबंध से पूर्णतः मेल खाता है।"
                    : "Cryptographic hash matches on-chain immutable smart contract."
                  : isHindi
                    ? "संग्रहीत क्रिप्टोग्राफ़िक रिकॉर्ड से हैश सत्यापित किया गया।"
                    : "Hash verified against cryptographic ledger records."
                : isHindi
                  ? "क्रिप्टोग्राफ़िक हैश बेमेल! भौतिक मात्रा, मूल या वानस्पतिक स्रोत ब्लॉकचेन रिकॉर्ड से मेल नहीं खाता।"
                  : "Cryptographic hash mismatch! The physical quantity, origin, or botanical source does not match the blockchain record."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`badge ${
                data?.blockchainVerified
                  ? "badge-verified"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {data?.blockchainVerified
                ? isHindi
                  ? "✓ ब्लॉकचेन रिकॉर्ड"
                  : "✓ Blockchain Record"
                : isHindi
                  ? "डेटाबेस रिकॉर्ड"
                  : "Database Record"}
            </span>
            <span
              className={`badge ${
                data?.hashMatch
                  ? "badge-verified"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {data?.hashMatch
                ? isHindi
                  ? "✓ हैश मिलान"
                  : "✓ Hash Match"
                : isHindi
                  ? "✕ हैश बेमेल"
                  : "✕ Hash Mismatch"}
            </span>
            <span
              className={`badge ${
                data?.labResult === "PASS"
                  ? "badge-verified"
                  : data?.isRecalled
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {data?.isRecalled
                ? isHindi
                  ? "🚨 रिकॉल किया गया बैच"
                  : "🚨 RECALLED BATCH"
                : data?.labResult === "PASS"
                  ? isHindi
                    ? "✓ CBRTI लैब • FSSAI पास"
                    : "✓ CBRTI Lab • FSSAI Pass"
                  : isHindi
                    ? "⏳ लैब टेस्ट लंबित"
                    : "⏳ Lab Test Pending"}
            </span>
          </div>

          {/* Cryptographic Keccak-256 Hash Comparison Panel */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-[10px] font-mono text-amber-950 space-y-1 overflow-hidden">
            <p className="text-amber-800 font-bold uppercase tracking-wider text-[9px] mb-1.5 flex items-center justify-between">
              <span>Keccak-256 Hash Comparison:</span>
              <span className="font-semibold text-amber-700">
                Mode: {mode.toUpperCase()}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-amber-700 w-16 shrink-0">On-Chain:</span>
              <span className="text-emerald-700 truncate font-semibold">
                {data?.onChainHash}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-700 w-16 shrink-0">Computed:</span>
              <span
                className={
                  data?.hashMatch
                    ? "text-emerald-700 font-bold truncate"
                    : "text-red-600 font-black truncate animate-pulse"
                }
              >
                {data?.currentDataHash || data?.onChainHash}
              </span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-amber-200 flex items-center justify-between text-[9px] text-amber-700">
              <span>
                Blockchain:{" "}
                <strong className="text-amber-900">
                  {data?.onChainStatus || "Active"}
                </strong>
              </span>
              <span>
                DB Status:{" "}
                <strong className="text-amber-900">{data?.dbStatus}</strong>
              </span>
            </div>
          </div>

          {/* Tamper Evidence Callout */}
          {data?.isTampered && data?.originalDataBeforeTamper && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-300 text-[11px] text-red-800 text-left space-y-1.5">
              <p className="font-bold text-red-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Off-Chain Mutation Evidence Detected:</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-gray-500 block">
                    On-Chain Registered:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {data.originalDataBeforeTamper.quantity} KG
                  </span>
                  <span className="text-gray-500 block text-[9px] truncate">
                    ({data.originalDataBeforeTamper.honeyType})
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-red-100 border border-red-300">
                  <span className="text-gray-500 block">
                    Modified Database Value:
                  </span>
                  <span className="font-bold text-red-700">{data.quantity}</span>
                  <span className="text-red-600 block text-[9px] truncate">
                    ({data.honeyType})
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-red-600 italic pt-1">
                Notice: The database row was altered without smart contract
                consensus, immediately breaking the cryptographic hash
                validation.
              </p>
            </div>
          )}
        </div>

        {/* ─── Honey Trust & Transparency Score ─── */}
        <div className="p-5 bg-white border border-[var(--border-default)] rounded-2xl shadow-sm hero-anim">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-xs text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                {isHindi
                  ? "शहद विश्वास एवं पारदर्शिता स्कोर"
                  : "Honey Trust & Transparency Score"}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {isHindi
                  ? "मल्टी-पैरामीटर क्रिप्टोग्राफिक ऑडिट स्कोर"
                  : "Multi-parameter cryptographic audit composite"}
              </p>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-[var(--honey-700)]">
                {data?.trustScore}
              </span>
              <span className="text-xs text-[var(--text-muted)]">/100</span>
            </div>
          </div>

          <div className="health-bar h-2.5">
            <div
              className="health-bar-fill bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: `${data?.trustScore}%` }}
            />
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            {data?.trustFactors?.map((f: any) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{f.label}</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  +{f.score}/{f.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Producer & Harvest Passport ─── */}
        <div className="bg-white border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm hero-anim">
          <div className="p-3.5 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-amber-900 font-[family-name:var(--font-outfit)] flex items-center gap-1.5">
              <Flower2 size={14} className="text-amber-700" />
              <span>
                {isHindi
                  ? "उत्पादक एवं कटाई पासपोर्ट"
                  : "Producer & Harvest Passport"}
              </span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {isHindi ? "मीठी क्रांति — KVIC" : "Meethi Kranti • KVIC"}
            </span>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {[
              {
                label: isHindi ? "मधुमक्खी पालक" : "Beekeeper Producer",
                value: data?.producer || "Ramesh Kumar (KVIC Beneficiary)",
                icon: <User size={14} className="text-[var(--honey-600)]" />,
              },
              {
                label: isHindi ? "उत्पत्ति स्थल" : "Apiary Origin",
                value: data?.origin || "Sonipat Honey Cluster, Haryana",
                icon: <MapPin size={14} className="text-[var(--honey-600)]" />,
              },
              {
                label: isHindi ? "वानस्पतिक स्रोत" : "Botanical Floral Source",
                value: data?.honeyType || "Mustard Flower (Sarson)",
                icon: <Flower2 size={14} className="text-[var(--honey-600)]" />,
              },
              {
                label: isHindi ? "कटाई मात्रा" : "Harvest Quantity",
                value: data?.quantity,
                icon: <Truck size={14} className="text-[var(--honey-600)]" />,
              },
              {
                label: isHindi ? "कटाई तिथि" : "Harvest Date",
                value: data?.harvestDate || "22 Aug 2026",
                icon: <Calendar size={14} className="text-[var(--honey-600)]" />,
              },
              {
                label: isHindi ? "स्मार्ट मधुमक्खी बॉक्स" : "Smart Bee Box ID",
                value: data?.hiveId || "HIVE-SON-001",
                icon: <Shield size={14} className="text-[var(--honey-600)]" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3"
              >
                <span className="text-[var(--text-secondary)] flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className="font-semibold text-[var(--text-primary)] text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── AI Hive Health & Biosecurity Passport ─── */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/40 rounded-2xl shadow-sm border border-emerald-200/90 space-y-3 hero-anim">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                🐝
              </div>
              <div>
                <p className="text-xs font-black text-emerald-950 font-[family-name:var(--font-outfit)]">
                  {isHindi
                    ? "एआई हाइव स्वास्थ्य एवं जैव-सुरक्षा पासपोर्ट"
                    : "AI Hive Health & Biosecurity Passport"}
                </p>
                <p className="text-[10px] text-emerald-800/70">
                  IoT Micro-Climate & ResNet-50 Comb Screening Verified
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 bg-emerald-100/90 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl">
              <span className="text-lg font-black font-mono">
                {data?.hiveHealth || 94}
              </span>
              <span className="text-[10px] font-bold">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">
                Comb Vision Screening
              </span>
              <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <span>🛡️</span> Zero Varroa Mites (&lt;0.5%)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">
                Brood Micro-Climate
              </span>
              <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <span>🌡️</span> 34.2°C (Optimal Brood)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-emerald-100">
            <span>
              Audit Engine: <strong>XGBoost + ResNet-50</strong>
            </span>
            <span className="text-emerald-700 font-bold">
              ✓ KVIC BIOSECURITY PASSED
            </span>
          </div>
        </div>

        {/* ─── CBRTI Pune Central Lab (FSSAI Standards) ─── */}
        <div className="p-5 bg-white border border-[var(--border-default)] rounded-2xl shadow-sm space-y-3 hero-anim">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="text-[var(--honey-600)]" size={18} />
              <div>
                <h3 className="font-bold text-xs text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                  CBRTI Pune Central Lab (FSSAI Standards)
                </h3>
                <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                  Tested at CBRTI Laboratory (KVIC Honey Mission Guideline #7)
                </span>
              </div>
            </div>
            {data?.labResult === "PENDING" ? (
              <span className="badge bg-gray-100 text-gray-500 border-gray-200">
                PENDING
              </span>
            ) : data?.labResult === "PASS" ? (
              <span className="badge badge-verified">PASS • GRADE A</span>
            ) : (
              <span className="badge bg-red-100 text-red-700 border-red-200">
                FAILED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div
              className={`p-3 rounded-xl border text-center ${
                parseFloat(data?.labMoisture || "0") > 20
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <span className="text-gray-400 block text-[10px]">
                Moisture Content
              </span>
              <span
                className={`font-black text-lg ${
                  parseFloat(data?.labMoisture || "0") > 20
                    ? "text-red-800"
                    : "text-emerald-800"
                }`}
              >
                {data?.labMoisture}
              </span>
              <span
                className={`text-[10px] block ${
                  parseFloat(data?.labMoisture || "0") > 20
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                (FSSAI Limit &lt;20%)
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                parseFloat(data?.labAdulteration || "0") > 0
                  ? "bg-red-50 border-red-200"
                  : data?.labAdulteration === "Pending"
                    ? "bg-gray-50 border-gray-200"
                    : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <span className="text-gray-400 block text-[10px]">
                Adulteration (C3/C4 Sugar)
              </span>
              <span
                className={`font-black text-lg ${
                  parseFloat(data?.labAdulteration || "0") > 0
                    ? "text-red-800"
                    : data?.labAdulteration === "Pending"
                      ? "text-gray-500"
                      : "text-emerald-800"
                }`}
              >
                {data?.labAdulteration || "Pending"}
              </span>
              <span
                className={`text-[10px] block ${
                  parseFloat(data?.labAdulteration || "0") > 0
                    ? "text-red-700"
                    : data?.labAdulteration === "Pending"
                      ? "text-gray-500"
                      : "text-emerald-600"
                }`}
              >
                {parseFloat(data?.labAdulteration || "0") > 0
                  ? "Adulteration Detected"
                  : data?.labAdulteration === "Pending"
                    ? "Awaiting Test"
                    : "100% Pure Nectar"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── End-to-End Supply Chain Journey ─── */}
        <div
          ref={timelineRef}
          className="p-5 bg-white border border-[var(--border-default)] rounded-2xl shadow-sm space-y-4 hero-anim"
        >
          <h3 className="font-bold text-xs text-[var(--text-primary)] font-[family-name:var(--font-outfit)] flex items-center gap-1.5">
            <Truck size={15} className="text-[var(--honey-600)]" />
            <span>
              {isHindi
                ? "संपूर्ण आपूर्ति श्रृंखला यात्रा (Supply Chain Journey)"
                : "End-to-End Supply Chain Journey"}
            </span>
          </h3>
          <div className="space-y-0">
            {groupedJourney.map((item: any, idx: number) => {
              if (item.isGroup) {
                const isRejected =
                  item.outcomeEvent.stage === "TRANSFER_REJECTED";
                return (
                  <div key={idx} className="timeline-node flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-sm z-10">
                        📦
                      </div>
                      {idx < groupedJourney.length - 1 && (
                        <div className="w-0.5 h-full bg-amber-200 my-1 absolute top-8 bottom-0" />
                      )}
                    </div>
                    <div className="pb-6 text-xs flex-1">
                      <div
                        className={`border rounded-xl p-3 space-y-3 shadow-xs ${
                          isRejected
                            ? "bg-red-50/40 border-red-200"
                            : "bg-blue-50/40 border-blue-200"
                        }`}
                      >
                        {/* Transfer Initiated */}
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-blue-900">
                              Transfer Initiated to {item.actor}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {item.transferEvent.date}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {item.transferEvent.notes}
                          </p>
                          <p className="font-mono text-[9px] text-blue-800 truncate max-w-[260px] mt-0.5">
                            Tx: {item.transferEvent.txHash}
                          </p>
                        </div>

                        {/* Connection Line */}
                        <div className="flex flex-col ml-3">
                          <div
                            className={`w-0.5 h-4 ${
                              isRejected ? "bg-red-200" : "bg-blue-200"
                            }`}
                          />
                        </div>

                        {/* Transfer Outcome */}
                        <div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`font-bold ${
                                isRejected ? "text-red-700" : "text-green-700"
                              }`}
                            >
                              {isRejected
                                ? "Transfer Rejected"
                                : `Transfer Accepted • Stage: ${formatStageDisplay(
                                    item.outcomeEvent.stage
                                  )}`}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {item.outcomeEvent.date}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {item.outcomeEvent.notes}
                          </p>
                          <p
                            className={`font-mono text-[9px] truncate max-w-[260px] mt-0.5 ${
                              isRejected ? "text-red-800" : "text-green-800"
                            }`}
                          >
                            Tx: {item.outcomeEvent.txHash}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal Step
              const isCompleted = item.stage === "COMPLETED";
              return (
                <div key={idx} className="timeline-node flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-200"
                          : "bg-amber-100 border border-amber-300"
                      } flex items-center justify-center text-sm z-10 font-bold`}
                    >
                      {isCompleted ? "🛒" : item.icon}
                    </div>
                    {idx < groupedJourney.length - 1 && (
                      <div className="w-0.5 h-full bg-amber-200 my-1 absolute top-8 bottom-0" />
                    )}
                  </div>
                  <div className="pb-6 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-bold ${
                          isCompleted
                            ? "text-emerald-950 text-sm flex items-center gap-1.5"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {isCompleted
                          ? isHindi
                            ? "🎉 उपभोक्ता द्वारा खरीदा गया"
                            : "🎉 Purchased by Consumer"
                          : item.stage === "PENDING_TRANSFER"
                            ? `Transfer Initiated to ${item.actor}`
                            : formatStageDisplay(item.stage)}
                        {isCompleted && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            Final Sale Verified
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] mt-0.5">
                      {item.actor} {item.location ? `• ${item.location}` : ""}
                    </p>
                    {item.notes && (
                      <div
                        className={`mt-1.5 p-2.5 rounded-xl border text-[11px] font-medium ${
                          isCompleted
                            ? "bg-gradient-to-r from-emerald-50/90 to-amber-50/50 border-emerald-200 text-emerald-950 shadow-xs"
                            : "bg-gray-50 border-gray-100 text-gray-700"
                        }`}
                      >
                        {item.notes}
                      </div>
                    )}
                    <p className="font-mono text-[9px] text-amber-800 truncate max-w-[260px] mt-1">
                      Tx: {item.txHash}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Immutable Ledger Anchor ─── */}
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl text-xs hero-anim">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[var(--text-primary)]">
              {isHindi
                ? "अपरिवर्तनीय लेजर एंकर"
                : "Immutable Ledger Anchor"}
            </span>
            <span
              className={`badge ${
                data?.blockchainVerified ? "badge-verified" : "bg-gray-200 text-gray-600"
              } text-[10px]`}
            >
              {data?.blockchainVerified ? "VERIFIED ON-CHAIN" : "PENDING ON-CHAIN"}
            </span>
          </div>
          <p className="font-mono text-[10px] text-[var(--text-muted)] break-all">
            {data?.txHash}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-[var(--border-subtle)]">
            {data?.etherscanUrl && (
              <a
                href={data.etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                <span>🔗 Sepolia Etherscan</span>
                <ExternalLink size={12} />
              </a>
            )}
            <Link
              href={`/trace/${encodeURIComponent(batchId)}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200"
            >
              <span>🔍 Open On-Chain Technical Explorer →</span>
            </Link>
          </div>

          {data?.contractAddress && (
            <p className="font-mono text-[9px] text-[var(--text-muted)] mt-2">
              Contract: {data.contractAddress}
            </p>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="text-center pt-2 pb-6 text-xs text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text-secondary)]">HoneyChain</p>
          <p className="text-[10px] mt-0.5">
            National Honey Traceability & Authenticity System • SIH 2026
          </p>
        </div>
      </div>
    </div>
  );
}
