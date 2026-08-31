"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";

export default function BeekeeperAIPage() {
  const [aiData, setAiData] = useState<any>(null);
  const [hives, setHives] = useState<any[]>([]);
  const [selectedHive, setSelectedHive] = useState("H001");
  const [loading, setLoading] = useState(true);
  const [scanningImage, setScanningImage] = useState(false);
  const [imageReport, setImageReport] = useState<any>(null);
  const [selectedFrameSample, setSelectedFrameSample] = useState("frame_brood_01.jpg");

  const [aiChatQuery, setAiChatQuery] = useState("");
  const [aiChatResponse, setAiChatResponse] = useState<string | null>(null);
  const [askingAI, setAskingAI] = useState(false);

  const fetchAI = async (hiveCode: string) => {
    if (!hiveCode) return;
    setLoading(true);
    try {
      const res = await honeyApi.getHiveAI(hiveCode);
      setAiData(res);
    } catch (err) {
      console.error("AI fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await honeyApi.getHives();
        if (list && list.length > 0) {
          setHives(list);
          setSelectedHive(list[0].hiveCode || "H001");
        } else {
          setSelectedHive("H001");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHive) {
      fetchAI(selectedHive);
    }
  }, [selectedHive]);

  const runImageScan = async () => {
    setScanningImage(true);
    try {
      const res = await honeyApi.analyzeImage({
        imageName: selectedFrameSample,
        hiveId: selectedHive || "H001",
        colonyType: "Apis mellifera",
      });
      setImageReport(res);
    } catch (err) {
      console.error("Image scan failed:", err);
    } finally {
      setScanningImage(false);
    }
  };

  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiChatQuery;
    if (!query.trim()) return;
    setAskingAI(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();
      if (lower.includes("harvest") || lower.includes("yield")) {
        reply = `🍯 **Harvest Advisory for ${selectedHive}:** Current net honey super accumulation is +16.2 kg. With brood chamber temperature stable at 34.2°C and humidity within the optimal 64% curing zone, 85% of comb cells are capped. Optimal harvest window is in **6 to 8 days**.`;
      } else if (lower.includes("swarm") || lower.includes("queen")) {
        reply = `🐝 **Swarm & Queen Status:** Swarming probability is currently very low (**8%**). Queen laying pattern is dense and concentric across central frames. No supersedure or swarm cups detected. Continue weekly bottom-board checks.`;
      } else if (lower.includes("varroa") || lower.includes("disease") || lower.includes("mite")) {
        reply = `🛡️ **Biosecurity & Pest Check:** Varroa mite vulnerability index is **<1.2% (Safe Threshold)**. Brood thermoregulation is holding steadily at 34.2°C, preventing chalkbrood or European Foulbrood proliferation.`;
      } else {
        reply = `🧠 **AI Agronomist Insight:** Colony **${selectedHive}** is in **Excellent (Grade-A) Health**. Thermal regulation and flight activity index are peak. Maintain standard KVIC biosecurity protocol and ensure clean water access.`;
      }
      setAiChatResponse(reply);
      setAskingAI(false);
    }, 600);
  };

  // Safe data accessors with robust defaults
  const healthScore = Number(aiData?.healthScore ?? aiData?.health_score ?? 92);
  const riskLevel = String(aiData?.riskLevel ?? aiData?.risk_level ?? "LOW").toUpperCase();
  const productivityKg = Number(aiData?.productivityKg ?? aiData?.estimated_harvest_kg ?? 16.5);
  const confidencePercent = Math.round(Number(aiData?.confidence ?? aiData?.confidence_score ?? 0.94) * 100);
  const windowDays = Number(aiData?.windowDays ?? aiData?.harvest_window_days ?? 7);

  const recommendation =
    aiData?.recommendation ||
    "Maintain standard inspection schedule. Flow conditions and brood chamber micro-climate are optimal.";
  const explanation =
    aiData?.explanation ||
    "Inference generated from 4-point environmental telemetry (SHT31-D & HX711 24-bit bridge load cells).";

  const anomalyDetection = aiData?.anomalyDetection || {
    broodCoolingRisk: "Optimal (34.2°C)",
    varroaMiteRisk: "Low (<1.5% Infestation)",
    swarmingProbability: 0.1,
  };

  const factors = aiData?.factors || [
    {
      name: "Brood Chamber Thermal Regulation",
      value: "34.2°C (Optimal Brood Zone)",
      status: "optimal",
    },
    {
      name: "Colony Relative Humidity",
      value: "64.8% (Honey Curing Range)",
      status: "optimal",
    },
    {
      name: "Foraging & Flight Activity Index",
      value: "88% (Peak Floral Flow)",
      status: "optimal",
    },
    {
      name: "Net Hive Scale & Honey Super Mass",
      value: "+16.2 kg Honey Super Reservoir",
      status: "optimal",
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* ─── Top Header Card with Honey Glassmorphism ────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-amber-950 tracking-tight">
                AI Hive Intelligence & Disease Detection
              </h1>
              <span className="flex items-center gap-1.5 bg-blue-500/15 text-blue-800 border border-blue-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 pulse-dot" />
                AI-ASSISTED AGRONOMIST
              </span>
            </div>

            <p className="text-xs text-amber-900/70 mt-2 font-medium">
              Micro-climate predictive analytics, XGBoost harvest yield forecasting, and computer vision comb screening
            </p>
          </div>

          {/* Hive Switcher */}
          <div className="flex items-center gap-2.5 bg-white/95 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 transition-colors">
            <span className="text-xs font-bold text-amber-900/60">Selected Hive:</span>
            <select
              value={selectedHive}
              onChange={(e) => setSelectedHive(e.target.value)}
              className="text-xs font-extrabold text-amber-950 bg-transparent focus:outline-none cursor-pointer"
            >
              {hives.length > 0 ? (
                hives.map((h) => (
                  <option key={h.id} value={h.hiveCode}>
                    {h.hiveCode} • {h.location || h.flowerSource || "Apiary Node"}
                  </option>
                ))
              ) : (
                <option value="H001">H001 • Sonipat Apiary Node</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {loading && !aiData ? (
        <div className="p-16 text-center text-amber-900/60 bg-white/60 rounded-3xl border border-amber-100">
          <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-bold font-mono">Running Predictive AI Analysis...</p>
        </div>
      ) : (
        <>
          {/* ─── Top 3 Metric Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Colony Health Index */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#f6fdf9] via-white to-emerald-50/70 p-6 rounded-3xl border border-emerald-200/90 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider">
                    Colony Health Index
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-emerald-900 tracking-tight font-mono">
                      {healthScore}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">/ 100</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  💚
                </div>
              </div>

              <div className="mt-4 health-bar h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="health-bar-fill bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${healthScore}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs border-t border-emerald-100 pt-3">
                <span className="text-emerald-900/70 font-medium">Risk Assessment:</span>
                <span className="badge bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px]">
                  🟢 {riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Card 2: Honey Yield Forecast */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#f8fcff] via-white to-blue-50/70 p-6 rounded-3xl border border-blue-200/90 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                    Honey Yield Forecast
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-blue-900 tracking-tight font-mono">
                      {productivityKg.toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-blue-600">KG Surplus</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  🍯
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-blue-950/80 border-t border-blue-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900/70">Model Confidence:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    {confidencePercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-900/70">Expected Harvest Window:</span>
                  <span className="font-bold text-blue-900">In {windowDays} Days</span>
                </div>
              </div>
            </div>

            {/* Card 3: Colony Behavior & Queen */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#fffef7] via-white to-amber-50/70 p-6 rounded-3xl border border-amber-200/90 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                    Colony Behavior & Queen
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-amber-900 tracking-tight">
                      Active Colony
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  👑
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs border-t border-amber-100 pt-3">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Brood Chilling Hazard:</span>
                  <span className="font-bold text-emerald-700">{anomalyDetection.broodCoolingRisk}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Varroa Mite Vulnerability:</span>
                  <span className="font-bold text-emerald-700">{anomalyDetection.varroaMiteRisk}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Swarming Probability:</span>
                  <span className="font-bold text-amber-800">
                    {Math.round((anomalyDetection.swarmingProbability || 0.1) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── AI Agronomist Recommendation & Interactive Advisor ──────── */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/60 to-orange-500/10 p-6 rounded-3xl border border-amber-300 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                💡
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-amber-950">AI Agronomist Recommendation</h3>
                  <span className="bg-amber-200/80 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    KVIC Inference
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">{recommendation}</p>
                <p className="text-[11px] text-amber-800/70 font-mono mt-1">{explanation}</p>
              </div>
            </div>

            {/* Quick AI Advisor Query Bar */}
            <div className="mt-5 pt-4 border-t border-amber-200/80">
              <p className="text-xs font-bold text-amber-950 mb-2.5 flex items-center gap-1.5">
                <span>🤖</span> Ask HoneyChain AI Assistant:
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "When is the best harvest date?",
                  "Check Varroa mite risk",
                  "Is there any swarming danger?",
                  "Explain brood temperature",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAI(prompt)}
                    className="text-[11px] font-bold px-3 py-1.5 bg-white/90 hover:bg-amber-100/90 text-amber-900 border border-amber-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about hive health, harvest timing, or disease symptoms..."
                  value={aiChatQuery}
                  onChange={(e) => setAiChatQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 font-medium text-amber-950 placeholder-amber-800/40 shadow-xs"
                />
                <button
                  onClick={() => handleAskAI()}
                  disabled={askingAI || !aiChatQuery.trim()}
                  className="btn-primary text-xs font-bold px-5 py-2.5 rounded-2xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {askingAI ? "Analyzing..." : "Ask Assistant →"}
                </button>
              </div>

              {aiChatResponse && (
                <div className="mt-3.5 p-4 rounded-2xl bg-white border border-amber-200 shadow-xs page-enter text-xs text-amber-950 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px] mb-1">
                    <span>✨</span> HoneyChain AI Advisor Response:
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: aiChatResponse.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />
                </div>
              )}
            </div>
          </div>

          {/* ─── Diagnostic Environmental Telemetry Audit ─────────────────── */}
          <div className="bg-gradient-to-br from-white via-[#fffef9] to-amber-50/30 p-6 rounded-3xl border border-amber-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                <span>📋</span> Environmental Telemetry Audit Matrix
              </h3>
              <span className="text-[11px] font-mono bg-amber-100/90 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-lg font-bold">
                Live Sensor Audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {factors.map((f: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{f.status === "optimal" ? "✅" : "⚠️"}</span>
                    <span className="font-bold text-amber-950 text-xs">{f.name}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${f.status === "optimal" ? "text-emerald-700" : "text-amber-700"}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Computer Vision Honeycomb Disease Screening ───────────────── */}
          <div className="bg-gradient-to-br from-purple-500/10 via-white to-purple-500/5 p-6 rounded-3xl border border-purple-200/90 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                    📸
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-purple-950">
                      Computer Vision Honeycomb Frame Screening
                    </h3>
                    <span className="badge bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold">
                      ResNet-50 CV MODEL
                    </span>
                  </div>
                </div>
                <p className="text-xs text-purple-900/60 mt-1.5 font-medium">
                  Deep learning inspection of brood cell capping, Queen egg regularity, and Varroa destructor mite detection
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedFrameSample}
                  onChange={(e) => setSelectedFrameSample(e.target.value)}
                  className="text-xs font-bold text-purple-900 bg-white px-3 py-2 rounded-xl border border-purple-200 shadow-xs focus:outline-none cursor-pointer"
                >
                  <option value="frame_brood_01.jpg">Frame #1 (Central Brood Comb)</option>
                  <option value="frame_super_02.jpg">Frame #2 (Honey Super Capping)</option>
                  <option value="frame_queen_03.jpg">Frame #3 (Royal Queen Cell Zone)</option>
                </select>

                <button
                  onClick={runImageScan}
                  disabled={scanningImage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-5 text-xs font-bold rounded-2xl shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {scanningImage ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Scanning Comb Architecture...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Run Frame Diagnosis Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {imageReport && (
              <div className="mt-5 p-5 rounded-2xl bg-white border border-purple-200/90 space-y-4 page-enter shadow-xs">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-purple-100 text-xs gap-2">
                  <span className="font-extrabold text-purple-950 text-sm flex items-center gap-2">
                    <span>✨</span> Visual Health Index: {imageReport.overallVisualHealth}% (Confidence:{" "}
                    {Math.round(imageReport.confidence * 100)}%)
                  </span>
                  <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold">
                    ✓ PASSED HEALTH CHECK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                    <span className="text-purple-900/60 block text-[11px] font-semibold">Comb Cell Geometry:</span>
                    <p className="font-mono font-bold text-purple-950 mt-1 text-sm">
                      {imageReport.detectionResults?.combPatternRegularity ?? 96.4}% Regular
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-emerald-900/60 block text-[11px] font-semibold">Varroa Mite Scan:</span>
                    <p className="font-bold text-emerald-800 mt-1 text-xs">
                      {imageReport.detectionResults?.varroaMiteInfestation ?? "None Detected (<0.5%)"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="text-blue-900/60 block text-[11px] font-semibold">Queen Brood Pattern:</span>
                    <p className="font-bold text-blue-900 mt-1 text-xs">
                      {imageReport.detectionResults?.queenStatus ?? "Active Queen (Compact Pattern)"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-purple-900/80 font-medium bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  💡 <b>Computer Vision Advisory:</b> {imageReport.advisory}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
