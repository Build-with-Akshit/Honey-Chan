"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import {
  Printer,
  QrCode,
  Sparkles,
  ShieldCheck,
  Award,
  Flower2,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  Tag,
} from "lucide-react";

interface BatchOption {
  batchId: string;
  honeyType: string;
  honeyTypeHi: string;
  beekeeperName: string;
  location: string;
  harvestDate: string;
  netWeight: string;
  fssaiNumber: string;
}

const DEMO_BATCHES: BatchOption[] = [
  {
    batchId: "HC-2026-000127",
    honeyType: "Raw Mustard Flower (Sarson)",
    honeyTypeHi: "100% शुद्ध सरसों का शहद",
    beekeeperName: "Ramesh Kumar (KVIC Certified)",
    location: "Sonipat Honey Cluster, Haryana",
    harvestDate: "22 Aug 2026",
    netWeight: "500 Grams",
    fssaiNumber: "FSSAI Lic: 10020022001842",
  },
  {
    batchId: "HC-2026-000125",
    honeyType: "Pure Eucalyptus (Safeda)",
    honeyTypeHi: "शुद्ध सफेदा (यूकेलिप्टस) शहद",
    beekeeperName: "Ramesh Kumar",
    location: "Sonipat, Haryana",
    harvestDate: "18 Aug 2026",
    netWeight: "1 KG",
    fssaiNumber: "FSSAI Lic: 10020022001842",
  },
  {
    batchId: "HC-2026-000121",
    honeyType: "Aromatic Litchi Blossom Honey",
    honeyTypeHi: "सुगंधित लीची का शहद (मुजफ्फरपुर)",
    beekeeperName: "Ramesh Kumar",
    location: "Muzaffarpur Orchard, Bihar",
    harvestDate: "12 Aug 2026",
    netWeight: "500 Grams",
    fssaiNumber: "FSSAI Lic: 10020022001842",
  },
];

export default function QrLabelsPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [selectedBatchId, setSelectedBatchId] = useState(DEMO_BATCHES[0].batchId);
  const [labelCount, setLabelCount] = useState<number>(4);
  const [customPrice, setCustomPrice] = useState("₹250");
  const printRef = useRef<HTMLDivElement>(null);

  const selectedBatch = DEMO_BATCHES.find((b) => b.batchId === selectedBatchId) || DEMO_BATCHES[0];

  const getVerifyUrl = (batchId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${batchId}`;
    }
    return `http://localhost:3000/verify/${batchId}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const audioText = isHindi
    ? "शहद की शीशी के लिए क्यूआर लेबल प्रिंटर। आप अपने उत्पादित शहद के बैच का चयन करके सीधे 4 या 6 लेबल की शीट प्रिंट कर सकते हैं। इन क्यूआर कोड को ग्राहक अपने फोन से स्कैन करके शहद की असली पहचान और शुद्धता देख सकेंगे।"
    : "Honey Jar QR Label Generator. You can select your harvested batch and print sticker sheets for 500 gram or 1 kg bottles. Consumers can scan these QR codes on their phone to verify purity and origin on blockchain.";

  return (
    <div className="space-y-6">
      {/* Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--honey-50)] border border-[var(--honey-200)] text-[var(--honey-700)] text-xs font-semibold mb-2">
            <Tag size={13} />
            {isHindi ? "सीधा विक्रय एवं पैकेजिंग टूल" : "Direct Farm-Gate Selling Kit"}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            {isHindi ? "शहद की शीशी के क्यूआर लेबल (Print QR Stickers)" : "Printable Honey Jar QR Label Generator"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "स्थानीय हाट, मेले और सीधे ग्राहकों को बेचने के लिए ब्लॉकचेन सत्यापित क्यूआर स्टीकर शीट प्रिंट करें"
              : "Generate tamper-proof physical bottle labels with verifiable QR codes for local haats & melas"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AudioSpeaker text={audioText} label={isHindi ? "लेबल निर्देश सुनें" : "Listen Label Guide"} />
          <button
            onClick={handlePrint}
            type="button"
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 font-bold shadow-md cursor-pointer"
          >
            <Printer size={15} />
            <span>{isHindi ? "प्रिंट निकालें (Print Sheet)" : "Print Label Sheet"}</span>
          </button>
        </div>
      </div>

      {/* Control Panel (Hidden during print) */}
      <Card className="p-5 print:hidden bg-gradient-to-r from-[var(--bg-surface)] to-[var(--honey-50)]/40 border-[var(--honey-200)]">
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">
              {isHindi ? "शहद का बैच चुनें" : "Select Harvested Batch"}
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="input text-xs font-medium"
            >
              {DEMO_BATCHES.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} — {b.honeyType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">
              {isHindi ? "लेबल की संख्या (प्रति शीट)" : "Labels Per Sheet"}
            </label>
            <select
              value={labelCount}
              onChange={(e) => setLabelCount(Number(e.target.value))}
              className="input text-xs"
            >
              <option value={2}>2 {isHindi ? "बड़े लेबल (1 KG जार)" : "Large Labels (1 KG Jar)"}</option>
              <option value={4}>4 {isHindi ? "मध्यम लेबल (500g शीशी)" : "Medium Labels (500g Jar)"}</option>
              <option value={6}>6 {isHindi ? "छोटे लेबल (250g शीशी)" : "Compact Labels (250g Jar)"}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">
              {isHindi ? "एमआरपी / विक्रय मूल्य (MRP)" : "Bottle MRP / Retail Price"}
            </label>
            <input
              type="text"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="input text-xs font-mono font-bold"
              placeholder="e.g. ₹250"
            />
          </div>
        </div>
      </Card>

      {/* Printable Sheet Area */}
      <div ref={printRef} className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] print:hidden">
          <span className="font-semibold">{isHindi ? "लेबल प्रीव्यू (A4 शीट):" : "Sticker Sheet Preview (A4 Paper):"}</span>
          <span>{labelCount} {isHindi ? "लेबल तैयार हैं" : "Labels Ready to Print"}</span>
        </div>

        {/* Labels Grid */}
        <div className={`grid ${labelCount === 2 ? "grid-cols-1 md:grid-cols-2" : labelCount === 6 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"} gap-4 print:grid-cols-2 print:gap-4`}>
          {Array.from({ length: labelCount }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border-2 border-dashed border-[var(--honey-400)] bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              style={{ minHeight: "220px" }}
            >
              {/* Top Banner with KVIC / HoneyChain Branding */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--honey-100)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--honey-500)] to-[var(--orange-600)] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    HC
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[var(--honey-900)] tracking-tight font-[family-name:var(--font-outfit)]">
                      HoneyChain Verified
                    </h3>
                    <p className="text-[9px] text-[var(--honey-700)] font-semibold">
                      KVIC Honey Mission • Meethi Kranti
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                    <ShieldCheck size={10} className="text-emerald-600" />
                    100% PURE
                  </span>
                </div>
              </div>

              {/* Middle Section: Honey Details & QR Code */}
              <div className="grid grid-cols-3 gap-3 items-center py-3">
                {/* 2 Cols Details */}
                <div className="col-span-2 space-y-1.5 text-[11px]">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] leading-snug">
                      {isHindi ? selectedBatch.honeyTypeHi : selectedBatch.honeyType}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                      {selectedBatch.location}
                    </p>
                  </div>

                  <div className="space-y-0.5 text-[10px] text-[var(--text-secondary)]">
                    <p className="truncate">
                      <strong>{isHindi ? "पालक:" : "Farmer:"}</strong> {selectedBatch.beekeeperName}
                    </p>
                    <p>
                      <strong>{isHindi ? "निष्कासन:" : "Harvest:"}</strong> {selectedBatch.harvestDate}
                    </p>
                    <p>
                      <strong>{isHindi ? "शुद्ध भार:" : "Net Wt:"}</strong> {selectedBatch.netWeight} | <strong>MRP:</strong> {customPrice}
                    </p>
                  </div>
                </div>

                {/* 1 Col QR Code */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-1.5 bg-white border border-[var(--honey-300)] rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={getVerifyUrl(selectedBatch.batchId)}
                      size={72}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-[var(--honey-800)] mt-1 uppercase tracking-tight">
                    {isHindi ? "शुद्धता जांचें" : "Scan to Verify"}
                  </span>
                </div>
              </div>

              {/* Bottom Footer with Batch Code & FSSAI */}
              <div className="pt-2 border-t border-[var(--honey-100)] flex items-center justify-between text-[9px] text-[var(--text-muted)] font-mono">
                <span>{selectedBatch.batchId}</span>
                <span>{selectedBatch.fssaiNumber}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
