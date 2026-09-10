"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function TracePage() {
  const params = useParams();
  const rawBatchId = params.batchId as string;
  const batchId = rawBatchId ? decodeURIComponent(rawBatchId) : "";
  const router = useRouter();

  const [batchData, setBatchData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [anomalyWarning, setAnomalyWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const consumerVerifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${encodeURIComponent(batchId)}`
    : `https://honey-chan.vercel.app/verify/${encodeURIComponent(batchId)}`;

  useEffect(() => {
    async function fetchTraceData() {
      if (!batchId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/trace/${encodeURIComponent(batchId)}`);

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Batch not found on the blockchain.");
          return;
        }

        const data = await res.json();
        setBatchData(data.batch);
        setHistory(data.history || []);
        setAnomalyWarning(data.anomalyWarning || false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch blockchain data.");
      } finally {
        setLoading(false);
      }
    }

    fetchTraceData();
  }, [batchId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const STATUS_LABELS = [
    "Created", "Harvested", "Processing", "Quality Tested",
    "Distributed", "Retail", "Completed"
  ];
  const currentStatus = STATUS_LABELS[Number(batchData?.status)] || "Unknown";

  const getStatusBadge = (statusNum: number) => {
    const map: Record<number, string> = {
      0: "bg-gray-100 text-gray-800 border-gray-200",
      1: "bg-amber-100 text-amber-900 border-amber-300",
      2: "bg-blue-100 text-blue-900 border-blue-300",
      3: "bg-purple-100 text-purple-900 border-purple-300",
      4: "bg-indigo-100 text-indigo-900 border-indigo-300",
      5: "bg-emerald-100 text-emerald-900 border-emerald-300",
      6: "bg-green-100 text-green-900 border-green-300",
    };
    return map[statusNum] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStageIcon = (stageNum: number) => {
    const map: Record<number, string> = {
      0: "🌱",
      1: "🐝",
      2: "🏭",
      3: "🧪",
      4: "🚚",
      5: "🏪",
      6: "🔒",
    };
    return map[stageNum] || "📦";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🔍</div>
          <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-800">Reading Blockchain State...</p>
          <p className="text-xs text-gray-500 font-mono mt-1">{batchId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 flex items-center justify-center p-4">
        <div className="card p-8 bg-white border-red-200 max-w-md w-full text-center space-y-4 shadow-lg">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-lg font-bold text-gray-900">Blockchain Record Not Found</h2>
          <p className="text-xs text-red-600 font-mono">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              ← Go Back
            </button>
            <Link
              href={`/verify/${encodeURIComponent(batchId)}`}
              className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 rounded-lg"
            >
              Open Consumer Verification
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 py-8 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Link
              href={`/verify/${encodeURIComponent(batchId)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span>🍯</span>
              <span>Consumer View</span>
            </Link>
            <Link
              href="/dashboard/supply-chain"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
              Sepolia Testnet
            </span>
            <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
              {batchId}
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-bold">
            <span>⛓️</span>
            <span>On-Chain Smart Contract Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Honey Traceability Explorer
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Cryptographically audited state machine logs fetched directly from the Ethereum smart contract.
          </p>
        </div>

        {/* Anti-Counterfeit Alert if Triggered */}
        {anomalyWarning && (
          <div className="bg-red-50 border border-red-300 p-4 rounded-2xl shadow-sm flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-900">Anti-Counterfeit Geolocation Alert</h3>
              <p className="text-xs text-red-700">
                This QR code has been scanned across geographically incongruent locations in a short timeframe.
                Physical sample duplication or unauthorized counterfeit distribution detected.
              </p>
            </div>
          </div>
        )}

        {/* Batch Overview & QR Passport */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unique Identifier</span>
                <h2 className="text-lg font-mono font-bold text-gray-900">{batchId}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(Number(batchData?.status))}`}>
                {currentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[10px]">Registered Beekeeper</span>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="font-mono font-bold text-gray-800 truncate" title={batchData?.beekeeper}>
                    {batchData?.beekeeper ? `${batchData.beekeeper.slice(0, 8)}...${batchData.beekeeper.slice(-6)}` : "None"}
                  </span>
                  {batchData?.beekeeper && (
                    <button
                      onClick={() => copyToClipboard(batchData.beekeeper, "beekeeper")}
                      className="text-[10px] text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                    >
                      {copiedHash === "beekeeper" ? "✓" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[10px]">Current On-Chain Owner</span>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="font-mono font-bold text-gray-800 truncate" title={batchData?.currentOwner}>
                    {batchData?.currentOwner ? `${batchData.currentOwner.slice(0, 8)}...${batchData.currentOwner.slice(-6)}` : "None"}
                  </span>
                  {batchData?.currentOwner && (
                    <button
                      onClick={() => copyToClipboard(batchData.currentOwner, "owner")}
                      className="text-[10px] text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                    >
                      {copiedHash === "owner" ? "✓" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[10px]">Harvest Quantity</span>
                <span className="font-bold text-gray-800 text-sm block mt-0.5">
                  {batchData?.quantity ? `${Number(batchData.quantity) / 1000} KG (${Number(batchData.quantity)} g)` : "0 KG"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[10px]">Quality Laboratory Status</span>
                <span className="font-bold text-sm block mt-0.5 text-purple-700">
                  {batchData?.qualityPassed ? "✅ Certified Pass" : "⏳ Pending / Unverified"}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code & Consumer Link Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50/70 to-white rounded-2xl border border-amber-200 text-center space-y-2">
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-sm">
              <QRCodeSVG value={consumerVerifyUrl} size={110} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-800 block">Physical Bottle QR</span>
              <p className="text-[10px] text-gray-500 max-w-[170px]">
                Scannable by any mobile camera to load the verification passport.
              </p>
            </div>
            <Link
              href={`/verify/${encodeURIComponent(batchId)}`}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline pt-1"
            >
              Open Consumer View →
            </Link>
          </div>

        </div>

        {/* Smart Contract State Machine Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>📜</span>
              <span>On-Chain Supply Chain Event Logs ({history.length})</span>
            </h3>
            <span className="text-[11px] text-gray-400">Immutable Contract Events</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No history events recorded yet.</p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-amber-200">
              {history.map((event: any, index: number) => {
                const date = new Date(Number(event.timestamp) * 1000).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
                const stageNum = Number(event.stage);
                const stageName = STATUS_LABELS[stageNum] || `Stage ${stageNum}`;
                const hasDataHash = event.dataHash && event.dataHash !== "0x0000000000000000000000000000000000000000000000000000000000000000";

                return (
                  <div key={index} className="relative flex items-start gap-4 pl-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm z-10 shrink-0 border-2 border-white">
                      {getStageIcon(stageNum)}
                    </div>
                    <div className="flex-1 bg-amber-50/30 border border-amber-200/80 rounded-xl p-3.5 shadow-sm space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                          <span>{stageName}</span>
                          <span className="text-[10px] font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono">
                            Stage #{stageNum}
                          </span>
                        </span>
                        <time className="text-[11px] text-gray-400 font-medium">{date}</time>
                      </div>

                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-gray-400">Actor Address:</span>
                          <span className="font-mono text-gray-800 break-all font-semibold">
                            {event.actor}
                          </span>
                        </div>

                        {hasDataHash && (
                          <div className="flex items-start gap-1.5 text-gray-600 pt-1 border-t border-amber-100/60">
                            <span className="text-gray-400 whitespace-nowrap">Keccak Hash:</span>
                            <span className="font-mono text-[10px] text-amber-900 break-all bg-white px-2 py-0.5 rounded border border-amber-200/60">
                              {event.dataHash}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Finalized Status Banner */}
        {currentStatus === "Completed" && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-emerald-900 text-center font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
            <span>🔒</span>
            <span>Retail Sale Finalized. This batch is permanently locked on the blockchain.</span>
          </div>
        )}

      </div>
    </div>
  );
}
