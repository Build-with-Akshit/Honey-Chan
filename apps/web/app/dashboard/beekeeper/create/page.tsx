"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { honeyApi } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Shield,
  Lock,
  CheckCircle2,
  Printer,
  Plus,
  ExternalLink,
  Hash,
  MapPin,
  Calendar,
  FlaskConical,
  FileText,
} from "lucide-react";

export default function CreateBatchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    batchId: `HC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    hiveCode: "HIVE-007",
    honeyType: "Mustard Flower Honey (Sarson)",
    quantityKg: "18.5",
    harvestDate: new Date().toISOString().split("T")[0],
    originLocation: "Ganaur Apiary, Sonipat, Haryana",
    notes: "Pure raw honey extracted using modern solar centrifugal extractor.",
  });

  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await honeyApi.createBatch(formData);
      setCreatedBatch(res);
    } catch (err: any) {
      setError(err.message || "Failed to create honey batch");
    } finally {
      setLoading(false);
    }
  };

  const verificationUrl = createdBatch
    ? typeof window !== "undefined"
      ? `${window.location.origin}/verify/${createdBatch.batchId}`
      : `http://localhost:3000/verify/${createdBatch.batchId}`
    : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            Create Honey Batch
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Register harvest on blockchain with cryptographic SHA-256 metadata hash
          </p>
        </div>
        <StatusBadge state="created" label="Beekeeper Portal" />
      </div>

      {!createdBatch ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-default)]">
              <div className="w-7 h-7 rounded-full bg-[var(--honey-50)] flex items-center justify-center text-[var(--honey-600)] text-xs font-bold">
                1
              </div>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">Batch & Apiary Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input
                label="Unique Batch ID"
                type="text"
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              />
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Source Hive Code
                </label>
                <select
                  value={formData.hiveCode}
                  onChange={(e) => setFormData({ ...formData, hiveCode: e.target.value })}
                  className="input"
                >
                  <option value="HIVE-007">HIVE-007 (Sonipat · Mustard · Health 91%)</option>
                  <option value="HIVE-001">HIVE-001 (Sonipat · Mustard · Health 94%)</option>
                  <option value="HIVE-018">HIVE-018 (Panipat · Sunflower · Health 96%)</option>
                  <option value="HIVE-012">HIVE-012 (Murthal · Litchi · Health 72%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Honey Flora / Botanical Origin
                </label>
                <select
                  value={formData.honeyType}
                  onChange={(e) => setFormData({ ...formData, honeyType: e.target.value })}
                  className="input"
                >
                  <option value="Mustard Flower Honey (Sarson)">Mustard Flower Honey (Sarson)</option>
                  <option value="Eucalyptus Honey">Eucalyptus Honey</option>
                  <option value="Litchi Blossom Honey">Litchi Blossom Honey</option>
                  <option value="Sunflower & Multi-flora Honey">Sunflower & Multi-flora Honey</option>
                  <option value="Acacia / Kashmir White Honey">Acacia / Kashmir White Honey</option>
                </select>
              </div>
              <Input
                label="Harvested Quantity (KG)"
                type="number"
                step="0.1"
                min="0.5"
                required
                value={formData.quantityKg}
                onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
              />
              <Input
                label="Harvest Date"
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              />
              <Input
                label="Harvest Location"
                type="text"
                required
                value={formData.originLocation}
                onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Extraction Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input resize-none"
              />
            </div>
          </Card>

          {/* Security Preview */}
          <div className="p-5 bg-[var(--honey-50)] border border-[var(--honey-200)] rounded-[var(--radius-lg)]">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-[var(--honey-600)]" />
              <h3 className="font-bold text-sm text-[var(--honey-700)]">Cryptographic Integrity</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When you submit, HoneyChain generates a deterministic <strong>SHA-256 hash</strong> of this
              metadata anchored on the blockchain. Any alteration triggers an immediate{" "}
              <strong>TAMPER WARNING</strong> for consumers.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-xs text-[var(--color-danger)] font-semibold">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            leftIcon={Shield}
            className="w-full"
          >
            {loading ? "Generating Hash & Signing Blockchain Tx..." : "Anchor Batch on Blockchain"}
          </Button>
        </form>
      ) : (
        <Card className="p-8 text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-[var(--color-success)]" />
          </div>

          <div>
            <StatusBadge state="pass" label="BLOCKCHAIN CONFIRMED" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold mt-3 text-[var(--text-primary)]">
              Honey Batch Created Successfully
            </h2>
            <p className="text-sm text-[var(--text-muted)] font-mono mt-1">{createdBatch.batchId}</p>
          </div>

          {/* QR Card */}
          <div className="max-w-xs mx-auto p-6 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[var(--radius-xl)] space-y-4">
            <div className="bg-white p-4 rounded-[var(--radius-lg)] flex justify-center">
              <QRCodeSVG
                value={verificationUrl}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-left text-xs space-y-1.5 p-3 rounded-[var(--radius-md)] bg-white border border-[var(--border-default)]">
              <p className="font-bold text-[var(--text-primary)]">{createdBatch.honeyType}</p>
              <p className="text-[var(--text-secondary)] tabular-data">Qty: {createdBatch.quantityKg} KG · Hive: {createdBatch.hiveCode}</p>
              <p className="text-[var(--text-muted)] truncate text-[10px] font-mono">Hash: {createdBatch.metadataHash}</p>
            </div>
            <p className="text-[11px] font-semibold text-[var(--honey-600)]">
              Scan with any phone camera to verify authenticity
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-[var(--border-default)]">
            <Link href={`/verify/${createdBatch.batchId}`} className="btn-primary text-xs py-2.5 px-5">
              <ExternalLink size={14} />
              View Consumer Page
            </Link>
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print QR Label
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Plus}
              onClick={() => {
                setCreatedBatch(null);
                setFormData({
                  ...formData,
                  batchId: `HC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
                });
              }}
            >
              Create Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
