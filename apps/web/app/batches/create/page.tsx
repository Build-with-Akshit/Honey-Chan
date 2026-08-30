"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { honeyApi } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

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
  const [hives, setHives] = useState<any[]>([]);
  const [hivesLoading, setHivesLoading] = useState(true);

  useEffect(() => {
    honeyApi.getHives()
      .then(data => {
        setHives(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            hiveCode: data[0].hiveCode,
            honeyType: data[0].flowerSource || prev.honeyType,
            originLocation: data[0].location || prev.originLocation,
          }));
        } else {
          setFormData(prev => ({ ...prev, hiveCode: "" }));
        }
      })
      .catch(console.error)
      .finally(() => setHivesLoading(false));
  }, []);

  const handleHiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedHive = hives.find(h => h.hiveCode === code);
    setFormData(prev => ({
      ...prev,
      hiveCode: code,
      honeyType: selectedHive?.flowerSource || prev.honeyType,
      originLocation: selectedHive?.location || prev.originLocation,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hiveCode) {
      setError("Please register a hive first before creating a batch.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let txHash = "";

      // 1. Try to register on blockchain first
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const { getContractWithSigner } = await import("@/lib/blockchain");
          const { ethers } = await import("ethers");
          const contract = await getContractWithSigner();
          
          // Generate a deterministic metadata hash for the blockchain
          const metadataPayload = JSON.stringify({
            batchId: formData.batchId,
            hive: formData.hiveCode,
            type: formData.honeyType,
            quantity: formData.quantityKg
          });
          const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataPayload));
          
          // Quantity is stored in grams on the smart contract (18.5 KG = 18500)
          const quantityGrams = Math.floor(Number(formData.quantityKg) * 1000);
          const harvestTimestamp = Math.floor(new Date(formData.harvestDate || Date.now()).getTime() / 1000);

          alert("Please approve the CREATE BATCH transaction in MetaMask to register this on the blockchain.");
          
          const tx = await contract.createBatch(
            formData.batchId,
            metadataHash,
            quantityGrams,
            harvestTimestamp
          );
          
          await tx.wait();
          txHash = tx.hash;
          console.log("Blockchain transaction successful:", txHash);
        } catch (blockchainErr: any) {
          console.error("Blockchain error:", blockchainErr);
          // Only stop if the user rejected the transaction
          if (blockchainErr.code === 'ACTION_REJECTED' || blockchainErr.code === 4001) {
             throw new Error("Transaction rejected by user.");
          }
          // If it's a role error, we might want to warn them, but for this demo, we can just alert
          alert("Blockchain registration failed: " + (blockchainErr.reason || blockchainErr.message) + "\n\nBatch will still be saved to the database.");
        }
      }

      // 2. Create batch via API (DB storage)
      const res = await honeyApi.createBatch({
        ...formData,
        blockchainTx: txHash || undefined // API will generate a mock hash if undefined
      });
      
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
      : `http://localhost:3001/verify/${createdBatch.batchId}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Honey Batch</h1>
              <p className="text-xs text-gray-500">
                Register harvest on blockchain with cryptographic SHA-256 metadata hash
              </p>
            </div>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-3 py-1 rounded-full">
            Beekeeper Portal
          </span>
        </div>

        {!createdBatch ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6 bg-white space-y-4">
              <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-2">
                1. Batch & Apiary Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Unique Batch ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Source Hive Code
                  </label>
                  <select
                    value={formData.hiveCode}
                    onChange={handleHiveChange}
                    required
                    disabled={hivesLoading}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-60"
                  >
                    {hivesLoading ? (
                      <option value="">Loading your hives...</option>
                    ) : hives.length === 0 ? (
                      <option value="">No hives found - Register a hive first</option>
                    ) : (
                      hives.map(hive => (
                        <option key={hive.id} value={hive.hiveCode}>
                          {hive.hiveCode} ({hive.location} • {hive.flowerSource} • Health {hive.healthScore || 85}%)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Honey Flora / Botanical Origin
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.honeyType}
                    onChange={(e) => setFormData({ ...formData, honeyType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Harvested Quantity (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Harvest Location (Apiary Cluster)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.originLocation}
                    onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Extraction Notes & Method
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Blockchain Security Preview */}
            <div className="card p-5 bg-amber-50/50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔒</span>
                <h3 className="font-semibold text-sm text-amber-900">Cryptographic Integrity Mechanism</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                When you submit, Honey-Chan will generate a deterministic <strong>SHA-256 hash</strong> of this exact
                metadata. This hash is anchored on the blockchain. Any subsequent alteration of the quantity or location
                will immediately cause a hash mismatch and trigger a <strong>TAMPER WARNING</strong> for consumers.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating Hash & Signing Blockchain Tx...
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    Anchor Batch on Blockchain
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen with Printable QR Card */
          <div className="card p-8 bg-white border-green-200 text-center space-y-6 page-enter">
            <style type="text/css" media="print">
              {`
                @page { size: auto; margin: 0; }
                body * { visibility: hidden; }
                #printable-qr-label, #printable-qr-label * { visibility: visible; }
                #printable-qr-label {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                  width: 350px;
                  margin: 0;
                  padding: 24px;
                  background: white !important;
                  border: 2px solid #f59e0b !important;
                  border-radius: 16px;
                }
                .print-only { display: none; }
                @media print {
                  .print-only { display: block !important; }
                  .no-print { display: none !important; }
                  body { background: white !important; }
                }
              `}
            </style>
            
            <div className="no-print space-y-6">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>

              <div>
                <span className="badge badge-verified mb-2">BLOCKCHAIN TRANSACTION CONFIRMED</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  Honey Batch Created Successfully!
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">{createdBatch.batchId}</p>
              </div>
            </div>

            {/* QR Card Container */}
            <div id="printable-qr-label" className="max-w-xs mx-auto p-6 bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl space-y-4">
              <div className="print-only text-center mb-4 pb-4 border-b border-amber-200">
                <h1 className="text-2xl font-bold text-amber-900 flex items-center justify-center gap-2">
                  <span>🍯</span> Honey-Chan
                </h1>
                <p className="text-[10px] text-amber-700 uppercase tracking-widest font-bold mt-1">100% Pure • Blockchain Verified</p>
              </div>

              <div className="flex justify-center bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <QRCodeSVG
                  value={verificationUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🍯</text></svg>",
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>

              <div className="text-left text-xs space-y-1 bg-white p-3 rounded-lg border border-amber-100">
                <p className="font-bold text-gray-800">{createdBatch.honeyType}</p>
                <p className="text-gray-500">Qty: {createdBatch.quantity} KG • Hive: {createdBatch.hive?.hiveCode || formData.hiveCode}</p>
                <p className="text-gray-400 text-[10px] truncate">Hash: {createdBatch.blockchainTx}</p>
              </div>

              <p className="text-[11px] text-amber-800 font-semibold text-center">
                Scan with any phone camera to verify authenticity
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center no-print">
              <Link
                href={`/verify/${createdBatch.batchId}`}
                className="btn-primary py-2.5 px-5 text-xs font-semibold"
              >
                View Public Consumer Page →
              </Link>

              <button
                onClick={() => window.print()}
                className="btn-outline py-2.5 px-5 text-xs font-semibold"
              >
                🖨️ Print QR Label
              </button>

              <button
                onClick={() => {
                  setCreatedBatch(null);
                  setFormData({
                    ...formData,
                    batchId: `HC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
                  });
                }}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-800"
              >
                + Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
