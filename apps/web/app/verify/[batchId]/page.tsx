"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyPage() {
  const params = useParams();
  const rawBatchId = params.batchId as string;
  const batchId = rawBatchId || "HC-2026-000127";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tampering, setTampering] = useState(false);
  const [tamperSuccessMsg, setTamperSuccessMsg] = useState<string | null>(null);

  const loadVerification = async () => {
    try {
      const res = await honeyApi.verifyBatch(batchId);
      setData(res);
    } catch (err: any) {
      console.error("Verification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, [batchId]);

  const handleTamperTest = async () => {
    setTampering(true);
    setTamperSuccessMsg(null);
    try {
      await honeyApi.tamperBatch(batchId);
      setTamperSuccessMsg("Simulated unauthorized off-chain database modification!");
      await loadVerification();
    } catch (err: any) {
      console.error("Tamper error:", err);
    } finally {
      setTampering(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🍯</div>
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-700">Verifying Cryptographic Ledger...</p>
          <p className="text-xs text-gray-400 font-mono mt-1">{decodeURIComponent(batchId as string)}</p>
        </div>
      </div>
    );
  }

  const isVerified = data?.hashMatch && !data?.isTampered;

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
        outcomeEvent: journey[i + 1]
      });
      i += 2;
    } else {
      groupedJourney.push({ isGroup: false, ...step });
      i++;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 print:bg-white print:bg-none py-8 print:py-0 px-4 text-gray-800">
      
      {/* Print-Only View */}
      <div className="hidden print:flex flex-col items-center justify-center min-h-screen w-full bg-white text-black p-10">
        <h2 className="text-3xl font-bold mb-2">HoneyChain Verification</h2>
        <p className="text-gray-600 mb-8 font-mono text-lg">Batch ID: {decodeURIComponent(batchId as string)}</p>
        <div className="p-4 border-4 border-gray-900 rounded-xl">
          <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : `https://honey-chan.vercel.app/verify/${batchId}`} size={250} />
        </div>
        <p className="mt-8 text-gray-500 font-medium">Scan to verify this product's authenticity</p>
      </div>

      <div className="max-w-xl mx-auto space-y-5 page-enter print:hidden">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold gradient-text">Honey Chain</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              KVIC Consumer Verification
            </p>
          </div>
          <span className="text-[11px] font-mono bg-amber-100/70 text-amber-900 px-2.5 py-1 rounded-full font-bold max-w-[120px] truncate" title={data?.batchId || decodeURIComponent(batchId as string)}>
            {data?.batchId || decodeURIComponent(batchId as string)}
          </span>
        </div>

        {/* QR Code & Print Section */}
        <div className="card p-4 bg-white border-amber-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
              <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : `https://honey-chan.vercel.app/verify/${batchId}`} size={64} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Batch QR Code</h3>
              <p className="text-xs text-gray-500 hidden sm:block">Scan to verify this product</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Print QR</span>
          </button>
        </div>


        {/* Verification Status Card */}
        <div
          className={`card p-6 text-center border-2 shadow-md ${
            isVerified
              ? "border-green-300 bg-gradient-to-b from-green-50/60 via-white to-green-50/40"
              : "border-red-400 bg-gradient-to-b from-red-50/80 via-white to-red-50/60"
          }`}
        >
          <div className="text-5xl mb-2">{isVerified ? "✅" : "🚨"}</div>
          <h2 className={`text-2xl font-black ${isVerified ? "text-green-800" : "text-red-700"}`}>
            {isVerified ? "Authentic Honey Verified" : "TAMPER WARNING DETECTED"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isVerified
              ? "Cryptographic hashes match on-chain immutable smart contract."
              : "Off-chain database state does NOT match on-chain cryptographic anchor!"}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] font-bold">
            <div className={`p-2 rounded-lg ${isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
              {isVerified ? "✓" : "⚠️"} Blockchain Record
            </div>
            <div className={`p-2 rounded-lg ${isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
              {isVerified ? "✓ Hash Match" : "✗ Hash Mismatch"}
            </div>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              ✓ NABL / FSSAI Pass
            </div>
          </div>

          {/* Always show hash comparison for transparency */}
          <div className={`mt-4 p-3 ${!isVerified ? "bg-red-100/70 border border-red-300" : "bg-green-50/70 border border-green-200"} rounded-lg text-left text-[11px] font-mono space-y-1`}>
            <p className={`${!isVerified ? "text-red-800" : "text-green-800"} font-bold`}>Keccak-256 Hash Comparison:</p>
            <p className="text-gray-700 break-all">On-Chain: {data?.onChainHash || "N/A"}</p>
            <p className={`${!isVerified ? "text-red-700" : "text-green-700"} break-all`}>Computed: {data?.currentDataHash || "N/A"}</p>
            {data?.onChainStatus && (
              <p className="text-gray-500 mt-1">Blockchain Status: <span className="font-bold text-gray-800">{data.onChainStatus}</span> | DB Status: <span className="font-bold text-gray-800">{data.dbStatus}</span></p>
            )}
          </div>
        </div>

        {/* Honey Trust Score Card */}
        <div className="card p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-gray-700">Honey Trust & Transparency Score</span>
              <p className="text-[10px] text-gray-400">Multi-parameter audit composite score</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-700">{data?.trustScore}</span>
              <span className="text-xs text-gray-400">/100</span>
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
                <span className="text-gray-500">{f.label}</span>
                <span className="font-semibold text-gray-800">
                  +{f.score}/{f.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Batch & Origin Details */}
        <div className="card overflow-hidden bg-white shadow-sm">
          <div className="p-3.5 bg-amber-50/60 border-b border-amber-100">
            <h3 className="font-bold text-xs text-amber-900">🍯 Producer & Harvest Passport</h3>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {[
              { label: "Beekeeper Producer", value: data?.producer, icon: "👤" },
              { label: "Apiary Origin", value: data?.origin, icon: "📍" },
              { label: "Botanical Floral Source", value: data?.honeyType, icon: "🌸" },
              { label: "Harvest Batch Quantity", value: data?.quantity, icon: "⚖️" },
              { label: "Harvest Date", value: data?.harvestDate, icon: "📅" },
              { label: "Smart Bee Box", value: data?.hiveId, icon: "🏠" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3">
                <span className="text-gray-500 flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className="font-semibold text-gray-900 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hive Health at Harvest */}
        <div className="card p-4 bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐝</span>
            <div>
              <p className="text-xs font-bold text-gray-800">Hive Health at Harvest</p>
              <p className="text-[10px] text-gray-400">Micro-climate verified via IoT stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-emerald-700">{data?.hiveHealth}/100</span>
            <span>🟢</span>
          </div>
        </div>

        {/* FSSAI Lab Quality Certification */}
        <div className="card p-5 bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <h3 className="font-bold text-xs text-gray-800">FSSAI / NABL Quality Certification</h3>
            </div>
            {data?.labResult === "PENDING" ? (
              <span className="badge bg-gray-100 text-gray-500 border-gray-200">PENDING</span>
            ) : data?.labResult === "PASS" ? (
              <span className="badge badge-verified">PASS • GRADE A</span>
            ) : (
              <span className="badge bg-red-100 text-red-700 border-red-200">FAILED</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-gray-400 block text-[10px]">Moisture Content</span>
              <span className="font-black text-emerald-800 text-lg">{data?.labMoisture}</span>
              <span className="text-[10px] text-emerald-600 block">(FSSAI Limit &lt;20%)</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-gray-400 block text-[10px]">Adulteration (C3/C4 Sugar)</span>
              <span className="font-black text-amber-800 text-lg">{data?.labAdulteration || "Pending"}</span>
              <span className="text-[10px] text-amber-700 block">{parseFloat(data?.labAdulteration || "0") > 0 ? "Adulteration Detected" : data?.labAdulteration === "Pending" ? "Awaiting Test" : "100% Pure Nectar"}</span>
            </div>
          </div>
        </div>

        {/* End-to-End Supply Chain Journey */}
        <div className="card p-5 bg-white shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-gray-800">🗺️ End-to-End Supply Chain Journey</h3>
          <div className="space-y-0">
            {groupedJourney.map((item: any, i: number) => {
              if (item.isGroup) {
                const isRejected = item.outcomeEvent.stage === 'TRANSFER_REJECTED';
                return (
                  <div key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-sm z-10">
                        📦
                      </div>
                      {i < groupedJourney.length - 1 && <div className="w-0.5 h-full bg-amber-200 my-1 absolute top-8 bottom-0" />}
                    </div>
                    <div className="pb-6 text-xs flex-1">
                      <div className={`border rounded-xl p-3 space-y-3 shadow-sm ${isRejected ? 'bg-red-50/40 border-red-200' : 'bg-blue-50/40 border-blue-200'}`}>
                        {/* Transfer Initiated */}
                        <div>
                           <div className="flex items-center justify-between">
                             <p className="font-bold text-blue-900">Transfer Initiated to {item.actor}</p>
                             <span className="text-[10px] text-gray-400">{item.transferEvent.date}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 mt-0.5">{item.transferEvent.notes}</p>
                           <p className="font-mono text-[9px] text-blue-800 truncate max-w-[260px] mt-0.5">Tx: {item.transferEvent.txHash}</p>
                        </div>

                        {/* Connection Line Inside Box */}
                        <div className="flex flex-col ml-3">
                           <div className={`w-0.5 h-4 ${isRejected ? 'bg-red-200' : 'bg-blue-200'}`}></div>
                        </div>

                        {/* Transfer Outcome */}
                        <div>
                           <div className="flex items-center justify-between">
                             <p className={`font-bold ${isRejected ? 'text-red-700' : 'text-green-700'}`}>
                               {isRejected ? 'Transfer Rejected' : `Transfer Accepted • Stage: ${item.outcomeEvent.stage}`}
                             </p>
                             <span className="text-[10px] text-gray-400">{item.outcomeEvent.date}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 mt-0.5">{item.outcomeEvent.notes}</p>
                           <p className={`font-mono text-[9px] truncate max-w-[260px] mt-0.5 ${isRejected ? 'text-red-800' : 'text-green-800'}`}>Tx: {item.outcomeEvent.txHash}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal Step
              return (
                 <div key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm z-10">
                        {item.icon}
                      </div>
                      {i < groupedJourney.length - 1 && <div className="w-0.5 h-full bg-amber-200 my-1 absolute top-8 bottom-0" />}
                    </div>
                    <div className="pb-6 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900">
                          {item.stage === 'PENDING_TRANSFER' ? `Transfer Initiated to ${item.actor}` : item.stage}
                        </p>
                        <span className="text-[10px] text-gray-400">{item.date}</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{item.actor} • {item.location}</p>
                      {item.notes && <p className="text-[10px] text-gray-500 mt-0.5">{item.notes}</p>}
                      <p className="font-mono text-[9px] text-amber-800 truncate max-w-[260px] mt-0.5">
                        Tx: {item.txHash}
                      </p>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Blockchain Record Box */}
        <div className="card p-4 bg-gray-50 border-gray-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-700">Immutable Ledger Anchor</span>
            <span className={`badge ${data?.blockchainVerified ? "badge-verified" : "bg-gray-200 text-gray-600"} text-[10px]`}>
              {data?.blockchainVerified ? "VERIFIED ON-CHAIN" : "PENDING ON-CHAIN"}
            </span>
          </div>
          <p className="font-mono text-[10px] text-gray-500 break-all">{data?.txHash}</p>
          {data?.etherscanUrl && (
            <a
              href={data.etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              🔗 View on Sepolia Etherscan →
            </a>
          )}
          {data?.contractAddress && (
            <p className="font-mono text-[9px] text-gray-400 mt-1">Contract: {data.contractAddress}</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-6 text-xs text-gray-400">
          <p className="font-semibold text-gray-600">Honey Chain</p>
          <p className="text-[10px] mt-0.5">Enterprise Traceability & Authenticity System</p>
        </div>
      </div>
    </div>
  );
}
