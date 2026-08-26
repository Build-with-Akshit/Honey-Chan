"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";

export default function BeekeeperAIPage() {
  const [aiData, setAiData] = useState<any>(null);
  const [selectedHive, setSelectedHive] = useState("HIVE-007");
  const [loading, setLoading] = useState(true);
  const [scanningImage, setScanningImage] = useState(false);
  const [imageReport, setImageReport] = useState<any>(null);

  const fetchAI = async (hiveCode: string) => {
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
    fetchAI(selectedHive);
  }, [selectedHive]);

  const runImageScan = async () => {
    setScanningImage(true);
    try {
      const res = await honeyApi.analyzeImage({
        fileName: "hive_007_brood_frame.jpg",
        colonyType: "Apis mellifera",
      });
      setImageReport(res);
    } catch (err) {
      console.error("Image scan failed:", err);
    } finally {
      setScanningImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">AI Hive Intelligence & Disease Detection</h1>
            <span className="badge badge-info text-xs whitespace-nowrap shrink-0">AI-ASSISTED</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Micro-climate analytics, harvest yield forecasting, and comb health screening
          </p>
        </div>

        {/* Hive Switcher */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-600">Select Hive:</span>
          <select
            value={selectedHive}
            onChange={(e) => setSelectedHive(e.target.value)}
            className="text-xs font-bold text-amber-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="HIVE-007">HIVE-007 (Sonipat • Healthy 91%)</option>
            <option value="HIVE-001">HIVE-001 (Sonipat • Healthy 94%)</option>
            <option value="HIVE-012">HIVE-012 (Murthal • Warning 72%)</option>
            <option value="HIVE-018">HIVE-018 (Kundli • Prime 96%)</option>
          </select>
        </div>
      </div>

      {loading && !aiData ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Running Predictive AI Analysis...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Health Score */}
            <div className="card p-6 bg-white border-emerald-200">
              <p className="text-xs font-semibold text-gray-500">Colony Health Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black text-emerald-700">{aiData?.healthScore}</span>
                <span className="text-gray-400 text-sm">/100</span>
              </div>

              <div className="mt-3 health-bar h-2.5">
                <div
                  className="health-bar-fill bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${aiData?.healthScore}%` }}
                />
              </div>

              <p className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1.5">
                <span>🟢</span>
                <span>Risk Assessment: {aiData?.riskLevel} RISK</span>
              </p>
            </div>

            {/* Productivity Prediction */}
            <div className="card p-6 bg-white border-blue-200">
              <p className="text-xs font-semibold text-gray-500">Honey Yield Forecast</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black text-blue-700">{aiData?.productivityKg}</span>
                <span className="text-gray-400 text-sm font-semibold">KG Surplus</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <span>Model Confidence:</span>
                <span className="font-bold text-blue-800">{Math.round(aiData?.confidence * 100)}%</span>
              </div>

              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>Expected Harvest Window:</span>
                <span className="font-bold text-blue-800">In {aiData?.windowDays} Days</span>
              </div>
            </div>

            {/* Swarm / Queen Indicator */}
            <div className="card p-6 bg-white border-amber-200">
              <p className="text-xs font-semibold text-gray-500">Colony Behavior & Queen</p>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Brood Chilling Hazard:</span>
                  <span className="font-semibold text-emerald-700">{aiData?.anomalyDetection?.broodCoolingRisk}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Varroa Mite Vulnerability:</span>
                  <span className="font-semibold text-emerald-700">{aiData?.anomalyDetection?.varroaMiteRisk}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Swarming Probability:</span>
                  <span className="font-semibold text-amber-700">
                    {Math.round((aiData?.anomalyDetection?.swarmingProbability || 0.1) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="card p-4 bg-amber-50/80 border-amber-300">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900">AI Agronomist Recommendation</p>
                <p className="text-xs text-amber-800 leading-relaxed">{aiData?.recommendation}</p>
                <p className="text-[11px] text-gray-500">{aiData?.explanation}</p>
              </div>
            </div>
          </div>

          {/* Diagnostic Environmental Factors Breakdown */}
          <div className="card p-5 bg-white">
            <h3 className="font-bold text-sm text-gray-800 mb-3">📋 Environmental Telemetry Audit</h3>
            <div className="space-y-2">
              {aiData?.factors?.map((f: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{f.status === "optimal" ? "✅" : f.status === "warning" ? "⚠️" : "🚨"}</span>
                    <span className="font-semibold text-gray-700">{f.name}</span>
                  </div>
                  <span className={`font-medium ${f.status === "optimal" ? "text-emerald-700" : "text-amber-700"}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Computer Vision Frame Anomaly & Disease Detection Tool */}
          <div className="card p-6 bg-gradient-to-r from-purple-50/50 via-white to-purple-50/50 border-purple-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-start sm:items-center gap-2">
                  <span className="text-xl">📸</span>
                  <h3 className="font-bold text-sm text-gray-900">
                    Computer Vision Honeycomb Disease Screening
                  </h3>
                  <span className="badge badge-tested text-[10px] whitespace-nowrap shrink-0 mt-0.5 sm:mt-0">CV PROTOTYPE</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scan honeycomb frame photography to detect Varroa destructor mites, Queen cup regularity & brood diseases
                </p>
              </div>

              <button
                onClick={runImageScan}
                disabled={scanningImage}
                className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm flex items-center gap-2"
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

            {imageReport && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-purple-200 space-y-3 page-enter">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                  <span className="font-bold text-gray-800">
                    Visual Score: {imageReport.overallVisualHealth}% (Confidence: {Math.round(imageReport.confidence * 100)}%)
                  </span>
                  <span className="badge badge-verified">✓ PASSED HEALTH CHECK</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-gray-400">Comb Pattern:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {imageReport.detectionResults.combPatternRegularity}% Regular
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-gray-400">Varroa Mite Scan:</span>
                    <p className="font-semibold text-emerald-700 mt-0.5">
                      {imageReport.detectionResults.varroaMiteInfestation}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-gray-400">Queen Brood Pattern:</span>
                    <p className="font-semibold text-emerald-700 mt-0.5">
                      {imageReport.detectionResults.queenStatus}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 italic mt-1">
                  💡 {imageReport.advisory}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
