"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { honeyApi } from "@/lib/api";
import { FlaskConical } from "lucide-react";

export function LabFssaiForm() {
  const [batchId, setBatchId] = useState("");
  const [moisture, setMoisture] = useState("");
  const [sucrose, setSucrose] = useState("");
  const [hmf, setHmf] = useState("");
  const [fgRatio, setFgRatio] = useState("");
  const [c3c4, setC3c4] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isMoisturePass = parseFloat(moisture) < 20.0;
  const isSucrosePass = parseFloat(sucrose) < 5.0;
  const isHmfPass = parseFloat(hmf) < 40.0;
  const isFgRatioPass = parseFloat(fgRatio) >= 1.0 && parseFloat(fgRatio) <= 1.5;
  const isC3c4Pass = parseFloat(c3c4) === 0.0;

  const allValuesEntered = moisture && sucrose && hmf && fgRatio && c3c4;
  const isOverallPass = allValuesEntered && isMoisturePass && isSucrosePass && isHmfPass && isFgRatioPass && isC3c4Pass;
  const isOverallFail = allValuesEntered && (!isMoisturePass || !isSucrosePass || !isHmfPass || !isFgRatioPass || !isC3c4Pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await honeyApi.submitQualityTest({
        batchId,
        metrics: { moisture, sucrose, hmf, fgRatio, c3c4 },
        passed: isOverallPass,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setBatchId(""); setMoisture(""); setSucrose(""); setHmf(""); setFgRatio(""); setC3c4("");
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit lab test to blockchain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
            FSSAI Lab Certification
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Submit chemical analysis results to the ledger.
          </p>
        </div>
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-purple-50 flex items-center justify-center text-purple-600">
          <FlaskConical size={18} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Target Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="e.g. HC-2026-000127"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Moisture (%)</label>
              {moisture && <StatusBadge state={isMoisturePass ? "pass" : "fail"} />}
            </div>
            <Input type="number" step="0.1" value={moisture} onChange={(e) => setMoisture(e.target.value)} placeholder="Limit: < 20.0" required />
          </div>

          <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Sucrose (%)</label>
              {sucrose && <StatusBadge state={isSucrosePass ? "pass" : "fail"} />}
            </div>
            <Input type="number" step="0.1" value={sucrose} onChange={(e) => setSucrose(e.target.value)} placeholder="Limit: < 5.0" required />
          </div>

          <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">HMF (mg/kg)</label>
              {hmf && <StatusBadge state={isHmfPass ? "pass" : "fail"} />}
            </div>
            <Input type="number" step="0.1" value={hmf} onChange={(e) => setHmf(e.target.value)} placeholder="Limit: < 40" required />
          </div>

          <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">F/G Ratio</label>
              {fgRatio && <StatusBadge state={isFgRatioPass ? "pass" : "fail"} />}
            </div>
            <Input type="number" step="0.01" value={fgRatio} onChange={(e) => setFgRatio(e.target.value)} placeholder="Limit: 1.0 - 1.5" required />
          </div>

          <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)] md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">C3/C4 Sugars (%)</label>
              {c3c4 && <StatusBadge state={isC3c4Pass ? "pass" : "fail"} />}
            </div>
            <Input type="number" step="0.1" value={c3c4} onChange={(e) => setC3c4(e.target.value)} placeholder="Limit: 0" required />
          </div>
        </div>

        <div className="p-5 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[var(--radius-lg)] flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Final Verdict</p>
            {isOverallPass ? (
              <p className="text-[var(--color-success)] font-bold text-sm">Passed FSSAI Standards</p>
            ) : isOverallFail ? (
              <p className="text-[var(--color-danger)] font-bold text-sm">Failed — Reject Batch</p>
            ) : (
              <p className="text-[var(--text-muted)] font-mono text-sm">Awaiting Data...</p>
            )}
          </div>
          <Button
            type="submit"
            variant={isOverallFail ? "danger" : "primary"}
            size="sm"
            disabled={!allValuesEntered || loading || submitted}
          >
            {loading ? "Writing to Ledger..." : submitted ? "Committed ✓" : isOverallFail ? "Submit Rejection" : "Certify Batch"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
