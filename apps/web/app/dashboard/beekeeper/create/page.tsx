"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { honeyApi } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
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
  const { language } = useLanguage();
  const isHindi = language === "hi";
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
            {isHindi ? "शहद का नया बैच बनाएं" : "Create Honey Batch"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isHindi
              ? "क्रिप्टोग्राफिक SHA-256 मेटाडेटा हैश के साथ ब्लॉकचेन पर कटाई दर्ज करें"
              : "Register harvest on blockchain with cryptographic SHA-256 metadata hash"}
          </p>
        </div>
        <StatusBadge state="created" label={isHindi ? "मधुमक्खी पालक सेवा केंद्र" : "Beekeeper Portal"} />
      </div>

      {!createdBatch ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-default)]">
              <div className="w-7 h-7 rounded-full bg-[var(--honey-50)] flex items-center justify-center text-[var(--honey-600)] text-xs font-bold">
                1
              </div>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">
                {isHindi ? "1. बैच एवं छत्ते का विवरण" : "1. Batch & Apiary Details"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input
                label={isHindi ? "विशिष्ट बैच आईडी (Unique Batch ID)" : "Unique Batch ID"}
                type="text"
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              />
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  {isHindi ? "स्रोत छत्ता कोड (Source Hive)" : "Source Hive Code"}
                </label>
                <select
                  value={formData.hiveCode}
                  onChange={(e) => setFormData({ ...formData, hiveCode: e.target.value })}
                  className="input"
                >
                  <option value="HIVE-007">
                    {isHindi ? "HIVE-007 (सोनीपत · सरसों · स्वास्थ्य 91%)" : "HIVE-007 (Sonipat · Mustard · Health 91%)"}
                  </option>
                  <option value="HIVE-001">
                    {isHindi ? "HIVE-001 (सोनीपत · सरसों · स्वास्थ्य 94%)" : "HIVE-001 (Sonipat · Mustard · Health 94%)"}
                  </option>
                  <option value="HIVE-018">
                    {isHindi ? "HIVE-018 (पानीपत · सूरजमुखी · स्वास्थ्य 96%)" : "HIVE-018 (Panipat · Sunflower · Health 96%)"}
                  </option>
                  <option value="HIVE-012">
                    {isHindi ? "HIVE-012 (मुरथल · लीची · स्वास्थ्य 72%)" : "HIVE-012 (Murthal · Litchi · Health 72%)"}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  {isHindi ? "शहद का वानस्पतिक स्रोत (Honey Flora)" : "Honey Flora / Botanical Origin"}
                </label>
                <select
                  value={formData.honeyType}
                  onChange={(e) => setFormData({ ...formData, honeyType: e.target.value })}
                  className="input"
                >
                  <option value="Mustard Flower Honey (Sarson)">
                    {isHindi ? "सरसों का शहद (Mustard Flower Honey)" : "Mustard Flower Honey (Sarson)"}
                  </option>
                  <option value="Eucalyptus Honey">
                    {isHindi ? "सफेदा/यूकेलिप्टस शहद (Eucalyptus Honey)" : "Eucalyptus Honey"}
                  </option>
                  <option value="Litchi Blossom Honey">
                    {isHindi ? "लीची के फूल का शहद (Litchi Blossom Honey)" : "Litchi Blossom Honey"}
                  </option>
                  <option value="Sunflower & Multi-flora Honey">
                    {isHindi ? "सूरजमुखी व बहु-पुष्पीय शहद (Sunflower & Multi-flora Honey)" : "Sunflower & Multi-flora Honey"}
                  </option>
                  <option value="Acacia / Kashmir White Honey">
                    {isHindi ? "बबूल / कश्मीरी सफेद शहद (Acacia / Kashmir White Honey)" : "Acacia / Kashmir White Honey"}
                  </option>
                </select>
              </div>
              <Input
                label={isHindi ? "निकाला गया शहद (KG)" : "Harvested Quantity (KG)"}
                type="number"
                step="0.1"
                min="0.5"
                required
                value={formData.quantityKg}
                onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
              />
              <Input
                label={isHindi ? "कटाई की तिथि (Harvest Date)" : "Harvest Date"}
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              />
              <Input
                label={isHindi ? "कटाई का स्थान (Harvest Location)" : "Harvest Location"}
                type="text"
                required
                value={formData.originLocation}
                onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isHindi ? "निष्कर्षण विधि व टिप्पणी (Extraction Notes)" : "Extraction Notes"}
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
              <h3 className="font-bold text-sm text-[var(--honey-700)]">
                {isHindi ? "क्रिप्टोग्राफिक सुरक्षा व अखंडता" : "Cryptographic Integrity"}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi ? (
                <>
                  जब आप दर्ज करते हैं, तो हनी-चेन इस मेटाडेटा का सुरक्षित <strong>SHA-256 हैश</strong> बनाकर ब्लॉकचेन पर दर्ज करता है। किसी भी बदलाव पर ग्राहकों को तुरंत <strong>चेतावनी (TAMPER WARNING)</strong> दिखाई देगी।
                </>
              ) : (
                <>
                  When you submit, HoneyChain generates a deterministic <strong>SHA-256 hash</strong> of this
                  metadata anchored on the blockchain. Any alteration triggers an immediate{" "}
                  <strong>TAMPER WARNING</strong> for consumers.
                </>
              )}
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
            {loading
              ? isHindi
                ? "हैश जनरेट कर ब्लॉकचेन पर दर्ज किया जा रहा है..."
                : "Generating Hash & Signing Blockchain Tx..."
              : isHindi
              ? "🔗 ब्लॉकचेन पर बैच सुरक्षित करें (Anchor on Blockchain)"
              : "Anchor Batch on Blockchain"}
          </Button>
        </form>
      ) : (
        <Card className="p-8 text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-[var(--color-success)]" />
          </div>

          <div>
            <StatusBadge
              state="pass"
              label={isHindi ? "ब्लॉकचेन पर पुष्टि सफल" : "BLOCKCHAIN CONFIRMED"}
            />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold mt-3 text-[var(--text-primary)]">
              {isHindi ? "शहद का बैच सफलतापूर्वक दर्ज हुआ!" : "Honey Batch Created Successfully"}
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
              <p className="text-[var(--text-secondary)] tabular-data">
                {isHindi ? "मात्रा: " : "Qty: "}{createdBatch.quantityKg} KG · {isHindi ? "छत्ता: " : "Hive: "}{createdBatch.hiveCode}
              </p>
              <p className="text-[var(--text-muted)] truncate text-[10px] font-mono">
                {isHindi ? "हैश: " : "Hash: "}{createdBatch.metadataHash}
              </p>
            </div>
            <p className="text-[11px] font-semibold text-[var(--honey-600)]">
              {isHindi
                ? "प्रामाणिकता की जांच के लिए किसी भी फोन कैमरे से स्कैन करें"
                : "Scan with any phone camera to verify authenticity"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-[var(--border-default)]">
            <Link href={`/verify/${createdBatch.batchId}`} className="btn-primary text-xs py-2.5 px-5">
              <ExternalLink size={14} />
              {isHindi ? "उपभोक्ता सत्यापन पेज देखें" : "View Consumer Page"}
            </Link>
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              {isHindi ? "🖨️ क्यूआर लेबल प्रिंट करें" : "Print QR Label"}
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
              {isHindi ? "+ एक और नया बैच बनाएं" : "Create Another"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
