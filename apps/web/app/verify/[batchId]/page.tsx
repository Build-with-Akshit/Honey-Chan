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

  const formatStageDisplay = (stage: string) => {
    if (stage === "DISTRIBUTED") return "DISTRIBUTION";
    if (stage === "PROCESSING") return "PROCESSING";
    if (stage === "QUALITY_TESTED" || stage === "TESTED") return "QUALITY TESTING";
    if (stage === "RETAIL") return "RETAIL";
    if (stage === "HARVEST") return "HARVEST";
    return stage;
  };

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
          <div className="inline-block p-2 rounded-full mb-3 shadow-inner">
            {isVerified ? (
              <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-green-500/30">
                ✓
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-500/30 animate-pulse">
                ✕
              </div>
            )}
          </div>

          <h2
            className={`text-xl font-black mb-1 ${
              isVerified ? "text-green-800" : "text-red-700"
            }`}
          >
            {isVerified ? "Authentic Honey Verified" : "Tamper Warning Detected"}
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {isVerified
              ? "Cryptographic hashes match on-chain immutable smart contract."
              : "Cryptographic hash mismatch! The physical quantity, origin, or botanical source does not match the blockchain record."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`badge ${
                data?.blockchainVerified
                  ? "badge-verified"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              ✓ Blockchain Record
            </span>
            <span
              className={`badge ${
                data?.hashMatch
                  ? "badge-verified"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {data?.hashMatch ? "✓ Hash Match" : "✕ Hash Mismatch"}
            </span>
            <span
              className={`badge ${
                data?.labResult === "PASS"
                  ? "badge-verified"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {data?.labResult === "PASS"
                ? "✓ NABL / FSSAI Pass"
                : "⏳ Lab Test Pending"}
            </span>
          </div>

          {/* Cryptographic Proof Comparison Panel */}
          <div className="mt-4 p-3 rounded-lg bg-gray-900 text-left text-[10px] font-mono text-gray-300 space-y-1 overflow-hidden">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1.5 text-amber-400">
              Keccak-256 Hash Comparison:
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">On-Chain:</span>
              <span className="text-emerald-400 truncate">{data?.onChainHash}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">Computed:</span>
              <span
                className={
                  data?.hashMatch
                    ? "text-emerald-400 truncate"
                    : "text-red-400 truncate font-bold"
                }
              >
                {data?.currentDataHash}
              </span>
            </div>
            <div className="pt-1 mt-1 border-t border-gray-800 flex items-center justify-between text-[9px] text-gray-400">
              <span>Blockchain Status: <strong className="text-amber-300">{data?.onChainStatus || "Active"}</strong></span>
              <span>DB Status: <strong className="text-amber-300">{data?.dbStatus}</strong></span>
            </div>
          </div>
        </div>

        {/* Honey Trust Score Card */}
        <div className="card p-5 bg-white shadow-sm border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-xs text-gray-800">
                Honey Trust &amp; Transparency Score
              </h3>
              <p className="text-[10px] text-gray-400">
                Multi-parameter audit composite score
              </p>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-amber-900">
                {data?.trustScore}
              </span>
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
            <h3 className="font-bold text-xs text-amber-900">🍯 Producer &amp; Harvest Passport</h3>
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
            <div className={`p-3 rounded-xl border text-center ${parseFloat(data?.labMoisture || "0") > 20 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
              <span className="text-gray-400 block text-[10px]">Moisture Content</span>
              <span className={`font-black text-lg ${parseFloat(data?.labMoisture || "0") > 20 ? "text-red-800" : "text-emerald-800"}`}>{data?.labMoisture}</span>
              <span className={`text-[10px] block ${parseFloat(data?.labMoisture || "0") > 20 ? "text-red-600" : "text-emerald-600"}`}>(FSSAI Limit &lt;20%)</span>
            </div>
            <div className={`p-3 rounded-xl border text-center ${parseFloat(data?.labAdulteration || "0") > 0 ? "bg-red-50 border-red-200" : data?.labAdulteration === "Pending" ? "bg-gray-50 border-gray-200" : "bg-emerald-50 border-emerald-200"}`}>
              <span className="text-gray-400 block text-[10px]">Adulteration (C3/C4 Sugar)</span>
              <span className={`font-black text-lg ${parseFloat(data?.labAdulteration || "0") > 0 ? "text-red-800" : data?.labAdulteration === "Pending" ? "text-gray-500" : "text-emerald-800"}`}>{data?.labAdulteration || "Pending"}</span>
              <span className={`text-[10px] block ${parseFloat(data?.labAdulteration || "0") > 0 ? "text-red-700" : data?.labAdulteration === "Pending" ? "text-gray-500" : "text-emerald-600"}`}>{parseFloat(data?.labAdulteration || "0") > 0 ? "Adulteration Detected" : data?.labAdulteration === "Pending" ? "Awaiting Test" : "100% Pure Nectar"}</span>
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
                               {isRejected ? 'Transfer Rejected' : `Transfer Accepted • Stage: ${formatStageDisplay(item.outcomeEvent.stage)}`}
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
              const isCompleted = item.stage === 'COMPLETED';
              return (
                 <div key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-200' : 'bg-amber-100 border border-amber-300'} flex items-center justify-center text-sm z-10 font-bold`}>
                        {isCompleted ? "🛍️" : item.icon}
                      </div>
                      {i < groupedJourney.length - 1 && <div className="w-0.5 h-full bg-amber-200 my-1 absolute top-8 bottom-0" />}
                    </div>
                    <div className="pb-6 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold ${isCompleted ? 'text-emerald-950 text-sm flex items-center gap-1.5' : 'text-gray-900'}`}>
                          {isCompleted ? "🎉 Purchased by Consumer" : item.stage === 'PENDING_TRANSFER' ? `Transfer Initiated to ${item.actor}` : formatStageDisplay(item.stage)}
                          {isCompleted && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                              Final Sale Verified
                            </span>
                          )}
                        </p>
                        <span className="text-[10px] text-gray-400">{item.date}</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{item.actor} {item.location ? `• ${item.location}` : ''}</p>
                      {item.notes && (
                        <div className={`mt-1.5 p-2.5 rounded-xl border text-[11px] font-medium ${isCompleted ? 'bg-gradient-to-r from-emerald-50/90 to-amber-50/50 border-emerald-200 text-emerald-950 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                          {item.notes}
                        </div>
                      )}
                      <p className="font-mono text-[9px] text-amber-800 truncate max-w-[260px] mt-1">
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
          
          <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-gray-200">
            {data?.etherscanUrl && (
              <a
                href={data.etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                🔗 Sepolia Etherscan →
              </a>
            )}
            <Link
              href={`/trace/${encodeURIComponent(batchId as string)}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200"
            >
              🔍 Open On-Chain Technical Explorer →
            </Link>
          </div>

          {data?.contractAddress && (
            <p className="font-mono text-[9px] text-gray-400 mt-2">Contract: {data.contractAddress}</p>
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
