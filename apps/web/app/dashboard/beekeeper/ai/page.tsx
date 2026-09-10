"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Brain,
  Heart,
  TrendingUp,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Info,
  Shield,
  Activity,
  Zap,
} from "lucide-react";

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
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
              AI Hive Intelligence
            </h1>
            <StatusBadge state="info" label="AI-ASSISTED" showDot={false} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Micro-climate analytics, yield forecasting, and comb health screening
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs">
          <Brain size={14} className="text-[var(--honey-600)]" />
          <select
            value={selectedHive}
            onChange={(e) => setSelectedHive(e.target.value)}
            className="text-xs font-semibold text-[var(--text-primary)] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="HIVE-007">HIVE-007 (Sonipat · Healthy 91%)</option>
            <option value="HIVE-001">HIVE-001 (Sonipat · Healthy 94%)</option>
            <option value="HIVE-012">HIVE-012 (Murthal · Warning 72%)</option>
            <option value="HIVE-018">HIVE-018 (Kundli · Prime 96%)</option>
          </select>
        </div>
      </div>

      {loading && !aiData ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Running Predictive AI Analysis...</p>
        </div>
      ) : (
        <>
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Health Score */}
            <Card className="p-6 border-l-4 border-l-[var(--color-success)]">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-[var(--color-success)]" />
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Colony Health</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[var(--color-success)] font-[family-name:var(--font-outfit)] tabular-data">
                  {aiData?.healthScore}
                </span>
                <span className="text-[var(--text-muted)] text-sm">/100</span>
              </div>
              <div className="mt-3 health-bar">
                <div className="health-bar-fill bg-[var(--color-success)]" style={{ width: `${aiData?.healthScore}%` }} />
              </div>
              <p className="text-xs text-[var(--color-success)] font-semibold mt-3 flex items-center gap-1.5">
                <Shield size={12} />
                Risk: {aiData?.riskLevel}
              </p>
            </Card>

            {/* Yield Forecast */}
            <Card className="p-6 border-l-4 border-l-[var(--color-info)]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[var(--color-info)]" />
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Yield Forecast</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[var(--color-info)] font-[family-name:var(--font-outfit)] tabular-data">
                  {aiData?.productivityKg}
                </span>
                <span className="text-[var(--text-muted)] text-sm font-semibold">KG</span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Confidence</span>
                  <span className="font-bold text-[var(--color-info)]">{Math.round(aiData?.confidence * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Harvest Window</span>
                  <span className="font-bold text-[var(--color-info)]">In {aiData?.windowDays} Days</span>
                </div>
              </div>
            </Card>

            {/* Colony Behavior */}
            <Card className="p-6 border-l-4 border-l-[var(--honey-500)]">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-[var(--honey-600)]" />
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Colony Behavior</p>
              </div>
              <div className="mt-1 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--border-default)]">
                  <span className="text-[var(--text-secondary)]">Brood Chilling</span>
                  <span className="font-semibold text-[var(--color-success)]">{aiData?.anomalyDetection?.broodCoolingRisk}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-default)]">
                  <span className="text-[var(--text-secondary)]">Varroa Mite</span>
                  <span className="font-semibold text-[var(--color-success)]">{aiData?.anomalyDetection?.varroaMiteRisk}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--text-secondary)]">Swarming</span>
                  <span className="font-semibold text-[var(--honey-600)]">
                    {Math.round((aiData?.anomalyDetection?.swarmingProbability || 0.1) * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Recommendation */}
          <Card className="p-4 bg-[var(--honey-50)] border-[var(--honey-200)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--honey-100)] flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-[var(--honey-600)]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--honey-700)]">AI Agronomist Recommendation</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{aiData?.recommendation}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{aiData?.explanation}</p>
              </div>
            </div>
          </Card>

          {/* Environmental Factors */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-[var(--text-muted)]" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">Environmental Telemetry Audit</h3>
            </div>
            <div className="space-y-2">
              {aiData?.factors?.map((f: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)] text-xs"
                >
                  <div className="flex items-center gap-2">
                    {f.status === "optimal" ? (
                      <CheckCircle2 size={14} className="text-[var(--color-success)]" />
                    ) : f.status === "warning" ? (
                      <AlertTriangle size={14} className="text-[var(--color-warning)]" />
                    ) : (
                      <AlertTriangle size={14} className="text-[var(--color-danger)]" />
                    )}
                    <span className="font-semibold text-[var(--text-primary)]">{f.name}</span>
                  </div>
                  <span className={`font-medium ${f.status === "optimal" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* CV Scan Tool */}
          <Card className="p-6 bg-gradient-to-r from-purple-50/50 via-white to-purple-50/50 border-purple-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-purple-600" />
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    Computer Vision Disease Screening
                  </h3>
                  <StatusBadge state="tested" label="CV PROTOTYPE" showDot={false} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Scan honeycomb frames to detect Varroa mites and brood diseases
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={Camera}
                onClick={runImageScan}
                disabled={scanningImage}
              >
                {scanningImage ? "Scanning..." : "Run Frame Scan"}
              </Button>
            </div>

            {imageReport && (
              <div className="mt-4 p-4 rounded-[var(--radius-lg)] bg-white border border-purple-200 space-y-3 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)] text-xs">
                  <span className="font-bold text-[var(--text-primary)]">
                    Visual Health: {imageReport.overallVisualHealth}% (Confidence: {Math.round(imageReport.confidence * 100)}%)
                  </span>
                  <StatusBadge state="pass" label="PASSED" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                    <span className="text-[var(--text-muted)]">Comb Pattern</span>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                      {imageReport.detectionResults.combPatternRegularity}% Regular
                    </p>
                  </div>
                  <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                    <span className="text-[var(--text-muted)]">Varroa Scan</span>
                    <p className="font-semibold text-[var(--color-success)] mt-0.5">
                      {imageReport.detectionResults.varroaMiteInfestation}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border-default)]">
                    <span className="text-[var(--text-muted)]">Queen Pattern</span>
                    <p className="font-semibold text-[var(--color-success)] mt-0.5">
                      {imageReport.detectionResults.queenStatus}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] italic">
                  {imageReport.advisory}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
