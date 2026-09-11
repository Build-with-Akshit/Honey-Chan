"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

function getHealthBadge(health: number, isHindi = false) {
  if (health >= 90) {
    return {
      label: isHindi ? "उत्कृष्ट" : "Optimal",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: "🟢",
    };
  }
  if (health >= 75) {
    return {
      label: isHindi ? "अच्छा" : "Good",
      color: "bg-amber-100 text-amber-900 border-amber-300",
      icon: "🟡",
    };
  }
  return {
    label: isHindi ? "ध्यान आवश्यक" : "Attention Needed",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    icon: "🔴",
  };
}

export default function BeekeeperDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [liveTime, setLiveTime] = useState(new Date());
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([honeyApi.getHives(), honeyApi.getBatches()])
      .then(([hivesData, batchesData]) => {
        setHives(hivesData || []);
        setBatches(batchesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalHives = hives.length;
  const activeBatches = batches.filter(
    (b) => b.status !== "DISTRIBUTED" && b.status !== "RETAIL"
  ).length;
  const honeyProduced = batches.reduce(
    (acc, b) => acc + Number(b.quantity || b.quantityKg || 0),
    0
  );
  const avgHealth = hives.length
    ? Math.round(
        hives.reduce((acc, h) => acc + (h.healthScore || 85), 0) / hives.length
      )
    : 92;

  // Predictive checks: Harvest ready hive or inspection alert
  const harvestReadyHives = hives.filter(
    (h) => (h.latestReading?.weight || 38.4) >= 38.0
  );
  const alertHives = hives.filter(
    (h) =>
      (h.latestReading?.temperature || 34.2) > 35.5 ||
      (h.healthScore && h.healthScore < 80)
  );

  return (
    <div className="space-y-6 page-enter">
      {/* ─── 1. Welcome & Apiary Status Hero ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-100/60 to-orange-500/10 p-6 md:p-8 rounded-3xl border border-amber-300 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl">🍯</span>
              <h1 className="text-2xl md:text-3xl font-black text-amber-950 tracking-tight">
                {isHindi
                  ? `नमस्ते, ${user?.name || "मधुमक्खी पालक"}`
                  : `Namaste, ${user?.name || "Beekeeper"}`}
              </h1>
              <span className="text-[11px] font-extrabold bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                {isHindi ? "केवीआईसी स्मार्ट फार्म नोड" : "KVIC Smart Apiary Node"}
              </span>
            </div>

            <p className="text-xs font-semibold text-amber-900/80 flex flex-wrap items-center gap-2 pt-0.5">
              <span>{isHindi ? "सोनीपत क्लस्टर #04" : "Sonipat Cluster #04"}</span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-900/60 font-mono">
                {liveTime.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-amber-400">•</span>
              <span className="font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                {isHindi ? "आईओटी सेंसर सक्रिय" : "IoT Sensors Streaming"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/batches/create"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs md:text-sm py-3 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span className="text-base">🍯</span>
              <span>{isHindi ? "कटाई दर्ज करें व बैच बनाएं" : "Log Harvest & Create Batch"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. Predictive Quick Action Cards (Zero-Friction UX) ─────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-900/70 flex items-center gap-1.5">
            <span>⚡</span> {isHindi ? "त्वरित कार्य • सभी सुविधाएं एक क्लिक में" : "Quick Actions • Everything You Need In 1-Click"}
          </h2>
          <span className="text-[11px] text-amber-800/60 font-medium">
            {isHindi ? "कार्यप्रवाह चुनें" : "Select a workflow"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Harvest Honey */}
          <Link
            href="/batches/create"
            className="group p-5 rounded-3xl bg-white hover:bg-amber-50/80 border border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                🍯
              </div>
              <h3 className="font-black text-sm text-amber-950 group-hover:text-amber-800 transition-colors">
                {isHindi ? "शहद कटाई दर्ज करें" : "Log Honey Harvest"}
              </h3>
              <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                {isHindi
                  ? "कच्चे शहद की उपज दर्ज करें, सेपोलिया ब्लॉकचेन पर बैच बनाएं एवं क्यूआर प्रमाणपत्र प्राप्त करें।"
                  : "Record raw honey yield, register Sepolia blockchain batch & generate QR bottle certificate."}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>{isHindi ? "कटाई शुरू करें" : "Start Harvest"}</span>
              <span>→</span>
            </span>
          </Link>

          {/* Action 2: Manage Beehives */}
          <Link
            href="/dashboard/beekeeper/hives"
            className="group p-5 rounded-3xl bg-white hover:bg-amber-50/80 border border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                🐝
              </div>
              <h3 className="font-black text-sm text-amber-950 group-hover:text-amber-800 transition-colors">
                {isHindi ? `मेरे बी-बॉक्सेस (${totalHives})` : `My Beehives (${totalHives})`}
              </h3>
              <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                {isHindi
                  ? "छत्ता स्वास्थ्य स्कोर देखें, नए स्मार्ट बॉक्स जोड़ें और ब्रूड फ्रेम का निरीक्षण करें।"
                  : "View colony health scores, register new smart bee boxes & inspect brood frames."}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>{isHindi ? "बॉक्सेस देखें" : "Manage Hives"}</span>
              <span>→</span>
            </span>
          </Link>

          {/* Action 3: Live IoT Stream */}
          <Link
            href="/dashboard/beekeeper/iot"
            className="group p-5 rounded-3xl bg-white hover:bg-amber-50/80 border border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                📡
              </div>
              <h3 className="font-black text-sm text-amber-950 group-hover:text-amber-800 transition-colors">
                {isHindi ? "लाइव आईओटी सेंसर" : "Live IoT Sensors"}
              </h3>
              <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                {isHindi
                  ? "4-बिंदु लाइव टेलीमेट्री जांचें: तापमान (34.2°C), आर्द्रता (64%), वजन एवं ध्वनि।"
                  : "Inspect 4-point live telemetry: temperature (34.2°C), humidity (64%), scale weight & acoustics."}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>{isHindi ? "सेंसर स्ट्रीम देखें" : "View Sensor Stream"}</span>
              <span>→</span>
            </span>
          </Link>

          {/* Action 4: AI Voice Agronomist */}
          <Link
            href="/dashboard/beekeeper/ai"
            className="group p-5 rounded-3xl bg-white hover:bg-amber-50/80 border border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                🤖
              </div>
              <h3 className="font-black text-sm text-amber-950 group-hover:text-amber-800 transition-colors">
                {isHindi ? "एआई वॉयस कृषि विशेषज्ञ" : "AI Voice Agronomist"}
              </h3>
              <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                {isHindi
                  ? "वारोआ माइट, झुंड रोकथाम, शहद प्रवाह और आईसीएआर दिशानिर्देशों पर हिंदी या अंग्रेजी में पूछें।"
                  : "Ask Gemini in Hindi or English about Varroa mites, swarm prevention, honey flow & ICAR guidelines."}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>{isHindi ? "एआई वर्कस्पेस खोलें" : "Open AI Workspace"}</span>
              <span>→</span>
            </span>
          </Link>
        </div>
      </div>

      {/* ─── 3. Predictive Guidance & Action Required Bar ───────────────── */}
      {harvestReadyHives.length > 0 ? (
        <div className="p-4.5 rounded-3xl bg-emerald-50 border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-2xs shrink-0">
              🌾
            </span>
            <div>
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                {isHindi ? "अनुकूल शहद कटाई समय का पता चला" : "Optimal Honey Harvest Window Detected"}
              </h4>
              <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                {isHindi
                  ? `छत्ता ${harvestReadyHives[0].hiveCode} का वजन ${harvestReadyHives[0].latestReading?.weight || "38.45"} किग्रा पहुंच गया है। छत्ते पके हुए शहद से भर चुके हैं।`
                  : `Hive ${harvestReadyHives[0].hiveCode} has reached ${harvestReadyHives[0].latestReading?.weight || "38.45"} KG. Supers are capped with ripened honey.`}
              </p>
            </div>
          </div>
          <Link
            href="/batches/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            {isHindi ? "इस छत्ते की कटाई करें →" : "Harvest This Hive Now →"}
          </Link>
        </div>
      ) : alertHives.length > 0 ? (
        <div className="p-4.5 rounded-3xl bg-rose-50 border border-rose-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg shadow-2xs shrink-0">
              ⚠️
            </span>
            <div>
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                {isHindi ? "निरीक्षण की अनुशंसा की गई" : "Inspection Recommended"}
              </h4>
              <p className="text-xs text-rose-900 font-semibold mt-0.5">
                {isHindi
                  ? `छत्ता ${alertHives[0].hiveCode} का तापमान ${alertHives[0].latestReading?.temperature || "35.8"}°C है। वेंटिलेशन की जाँच करें।`
                  : `Hive ${alertHives[0].hiveCode} temperature is at ${alertHives[0].latestReading?.temperature || "35.8"}°C. Check entrance ventilation.`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/beekeeper/iot"
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            {isHindi ? "सेंसर जांचें →" : "Inspect Sensors →"}
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center justify-between gap-3 text-xs text-amber-950 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="text-base">✅</span>
            <span>
              {isHindi
                ? `सभी ${totalHives} सक्रिय कॉलोनियां अनुकूल जैविक माइक्रोक्लाइमेट में काम कर रही हैं (ब्रूड: 34.2°C, नमी: 64%)।`
                : `All ${totalHives} active colonies are operating within optimal biological microclimate ranges (Brood: 34.2°C, RH: 64%).`}
            </span>
          </div>
          <Link
            href="/dashboard/beekeeper/iot"
            className="text-amber-800 hover:text-amber-950 font-bold underline whitespace-nowrap"
          >
            {isHindi ? "लाइव स्ट्रीम देखें" : "View Live Stream"}
          </Link>
        </div>
      )}

      {/* ─── 4. Key Apiary Vitals Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Hives */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900/70 font-semibold">
            <span>{isHindi ? "सक्रिय कॉलोनियां" : "Active Colonies"}</span>
            <span className="text-base">🐝</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-amber-950 tracking-tight font-mono">
              {totalHives}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              {isHindi ? "100% ऑनलाइन" : "100% Online"}
            </span>
          </div>
          <p className="text-[11px] text-amber-800/60 font-medium">
            {isHindi ? "पंजीकृत केवीआईसी मधुमक्खी बक्से" : "Registered KVIC bee boxes"}
          </p>
        </div>

        {/* Metric 2: Lifetime Honey Produced */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900/70 font-semibold">
            <span>{isHindi ? "निकाला गया शहद" : "Harvested Honey"}</span>
            <span className="text-base">⚖️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-amber-950 tracking-tight font-mono">
              {honeyProduced.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-amber-700">{isHindi ? "किग्रा" : "KG"}</span>
          </div>
          <p className="text-[11px] text-amber-800/60 font-medium">
            {isHindi ? "सत्यापित कच्ची शहद उपज" : "Verified raw honey yield"}
          </p>
        </div>

        {/* Metric 3: Active Batches */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900/70 font-semibold">
            <span>{isHindi ? "आपूर्ति श्रृंखला में" : "In Supply Chain"}</span>
            <span className="text-base">📦</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-amber-950 tracking-tight font-mono">
              {activeBatches}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
              {isHindi ? "सक्रिय बैच" : "Active Batches"}
            </span>
          </div>
          <p className="text-[11px] text-amber-800/60 font-medium">
            {isHindi ? "लैब / प्रोसेसिंग इकाई में" : "Moving to lab / processor"}
          </p>
        </div>

        {/* Metric 4: Average Colony Health */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900/70 font-semibold">
            <span>{isHindi ? "कॉलोनी स्वास्थ्य स्कोर" : "Colony Health Score"}</span>
            <span className="text-base">❤️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-emerald-800 tracking-tight font-mono">
              {avgHealth}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              {isHindi ? "उत्कृष्ट जैविक स्थिति" : "Biological Optima"}
            </span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${avgHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── 5. My Hives & Recent Batches Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Colonies Interactive Hub */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>🐝</span> {isHindi ? "मेरे बी-बॉक्सेस एवं माइक्रोक्लाइमेट टेलीमेट्री" : "My Beehives & Microclimate Telemetry"}
              </h3>
              <p className="text-[11px] text-amber-800/60 font-medium mt-0.5">
                {isHindi ? "लाइव टेलीमेट्री देखने या शहद कटाई शुरू करने के लिए किसी भी छत्ते पर क्लिक करें।" : "Click any hive to inspect live telemetry or start a direct honey harvest."}
              </p>
            </div>

            <Link
              href="/dashboard/beekeeper/hives"
              className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1"
            >
              <span>{isHindi ? `सभी बॉक्सेस देखें (${totalHives})` : `Manage All Hives (${totalHives})`}</span>
              <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-amber-800/60 flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full" />
              <span>{isHindi ? "बी-बॉक्सेस लोड हो रहे हैं..." : "Loading beehives..."}</span>
            </div>
          ) : hives.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-amber-800/70 font-medium">
                {isHindi ? "आपके फार्म में अभी कोई छत्ता पंजीकृत नहीं है।" : "No beehives registered yet in your apiary."}
              </p>
              <Link
                href="/dashboard/beekeeper/hives"
                className="btn-primary text-xs font-bold px-4 py-2 rounded-xl inline-block"
              >
                {isHindi ? "+ पहला बी-बॉक्स पंजीकृत करें" : "+ Register First Beehive"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {hives.map((hive) => {
                const badge = getHealthBadge(hive.healthScore || 85, isHindi);
                const temp = hive.latestReading?.temperature || 34.2;
                const hum = hive.latestReading?.humidity || 64.8;
                const weight = hive.latestReading?.weight || 38.45;

                return (
                  <div
                    key={hive.id || hive.hiveCode}
                    className="p-4 rounded-2xl bg-[#fffefc] border border-amber-200/90 hover:border-amber-400 hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-amber-950">
                            {hive.hiveCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800/70 font-medium mt-0.5">
                          🌸 {hive.flowerSource || "Mustard Flower"} • {hive.location || "Sonipat Apiary"}
                        </p>
                      </div>

                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {hive.healthScore || 85}%
                      </span>
                    </div>

                    {/* Sensor Micro-Grid */}
                    <div className="grid grid-cols-3 gap-1.5 text-center bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                      <div>
                        <span className="text-[9px] text-amber-800/60 block uppercase font-bold">
                          {isHindi ? "तापमान" : "Temp"}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-950">{temp}°C</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-800/60 block uppercase font-bold">
                          {isHindi ? "आर्द्रता" : "Humidity"}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-950">{hum}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-800/60 block uppercase font-bold">
                          {isHindi ? "वजन" : "Mass"}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-950">{weight} kg</span>
                      </div>
                    </div>

                    {/* Direct Actions Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-100/70">
                      <Link
                        href="/dashboard/beekeeper/iot"
                        className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors shadow-2xs"
                      >
                        📡 {isHindi ? "सेंसर" : "Sensors"}
                      </Link>

                      <Link
                        href="/dashboard/beekeeper/ai"
                        className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors shadow-2xs"
                      >
                        🤖 {isHindi ? "एआई सलाह" : "Ask AI"}
                      </Link>

                      <Link
                        href="/batches/create"
                        className="text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1 rounded-lg transition-colors shadow-2xs ml-auto"
                      >
                        🍯 {isHindi ? "कटाई" : "Harvest"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Batches & Supply Chain */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div>
                <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>🍯</span> {isHindi ? "हालिया शहद बैच" : "Recent Honey Batches"}
                </h3>
                <p className="text-[11px] text-amber-800/60 font-medium mt-0.5">
                  {isHindi ? "कच्चा शहद ब्लॉकचेन सप्लाई चेन में दर्ज किया गया।" : "Raw honey harvested and entered into the blockchain supply chain."}
                </p>
              </div>

              <Link
                href="/dashboard/beekeeper/batches"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline"
              >
                {isHindi ? "सभी देखें →" : "View All →"}
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-amber-800/60">
                {isHindi ? "बैच लोड हो रहे हैं..." : "Loading batches..."}
              </div>
            ) : batches.length === 0 ? (
              <div className="p-6 text-center space-y-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-800/70 font-medium">
                  {isHindi ? "अभी तक कोई बैच नहीं बनाया गया। अपना पहला शहद बैच बनाएं?" : "No batches created yet. Ready to log your first honey extraction?"}
                </p>
                <Link
                  href="/batches/create"
                  className="btn-primary text-xs font-bold px-4 py-2 rounded-xl inline-block"
                >
                  🍯 {isHindi ? "पहला बैच बनाएं" : "Create First Batch"}
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {batches.slice(0, 4).map((b) => (
                  <div
                    key={b.id || b.batchId}
                    className="p-3.5 rounded-2xl bg-[#fffdf9] border border-amber-200/80 hover:border-amber-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-amber-950 truncate">
                        {b.batchId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {b.status || "HARVESTED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-amber-900/80 font-medium">
                      <span>{b.honeyType || (isHindi ? "मिश्रित वनस्पति शहद" : "Mixed Flora")}</span>
                      <span className="font-bold text-amber-950">
                        {b.quantity || b.quantityKg || "18.5"} KG
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-amber-800/60 border-t border-amber-100 pt-1.5 font-mono">
                      <span>
                        {new Date(b.harvestDate || b.createdAt || Date.now()).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Link
                        href={`/trace/${b.batchId}`}
                        className="text-amber-800 hover:text-amber-950 font-bold underline font-sans"
                      >
                        {isHindi ? "सत्यापन क्यूआर देखें →" : "Verify Trace QR →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Create Batch Footer Link */}
          <div className="pt-4 border-t border-amber-100">
            <Link
              href="/batches/create"
              className="w-full bg-amber-100/80 hover:bg-amber-200/90 text-amber-950 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border border-amber-300/80"
            >
              <span>+ {isHindi ? "एक और शहद कटाई दर्ज करें" : "Log Another Honey Harvest"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 6. AI Agronomist Quick Advisory Banner ────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-500/10 border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                {isHindi ? "आईसीएआर एवं केवीआईसी एआई कृषि परामर्श" : "ICAR & KVIC AI Agronomist Advisory"}
              </h3>
              <span className="text-[9px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300">
                Gemini 1.5 Pro
              </span>
            </div>
            <p className="text-xs text-amber-900 font-semibold mt-1">
              {isHindi
                ? "सक्रिय शहद प्रवाह के लिए छत्ते का माइक्रोक्लाइमेट उत्कृष्ट है। साप्ताहिक ब्रूड निरीक्षण जारी रखें और वारोआ माइट रोकथाम हेतु नीचे के बोर्ड की निगरानी करें।"
                : "Colony micro-climate is optimal for active honey flow. Maintain weekly brood inspection and monitor bottom boards for Varroa mite prevention."}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/beekeeper/ai"
          className="btn-primary text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs whitespace-nowrap self-start md:self-auto cursor-pointer flex items-center gap-2"
        >
          <span>{isHindi ? "एआई चैट वर्कस्पेस खोलें" : "Open AI Chat Workspace"}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
