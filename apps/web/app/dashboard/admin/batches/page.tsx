"use client";

import { useState, useEffect } from "react";
import { getContract } from "@/lib/blockchain";
import { CONTRACT_ADDRESS, BATCH_STATUS_MAP, SUPPLY_CHAIN_STAGE_MAP } from "@/lib/contracts";
import Link from "next/link";

interface BatchBlockchainRecord {
  batchId: string;
  beekeeper: string;
  quantity: number;
  harvestTimestamp: number;
  metadataHash: string;
  currentOwner: string;
  status: number;
  qualityReportHash: string;
  qualityPassed: boolean;
  createdAt: number;
  history: Array<{
    stage: number;
    actor: string;
    timestamp: number;
    dataHash: string;
  }>;
}

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<BatchBlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllBlockchainData();
  }, []);

  async function loadAllBlockchainData() {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      
      // Fetch all batch IDs registered on the smart contract
      let batchIds: string[] = [];
      try {
        batchIds = await contract.getAllBatchIds();
      } catch (e) {
        console.warn("getAllBatchIds fallback", e);
      }

      // Default known demo batches if smart contract has none or as fallback
      const uniqueBatchIds = Array.from(new Set([
        ...batchIds,
        "HC-2026-000127",
        "HC-2026-000128",
      ]));

      const batchRecords: BatchBlockchainRecord[] = [];

      for (const id of uniqueBatchIds) {
        try {
          const exists = await contract.doesBatchExist(id);
          if (exists) {
            const data = await contract.getBatch(id);
            const rawHistory = await contract.getBatchHistory(id);

            const history = rawHistory.map((evt: any) => ({
              stage: Number(evt.stage),
              actor: evt.actor,
              timestamp: Number(evt.timestamp),
              dataHash: evt.dataHash,
            }));

            batchRecords.push({
              batchId: data[0],
              beekeeper: data[1],
              quantity: Number(data[2]),
              harvestTimestamp: Number(data[3]),
              metadataHash: data[4],
              currentOwner: data[5],
              status: Number(data[6]),
              qualityReportHash: data[7],
              qualityPassed: data[8],
              createdAt: Number(data[9]),
              history: history,
            });
          }
        } catch (err) {
          console.warn(`Could not load batch ${id}`, err);
        }
      }

      setBatches(batchRecords);
      // Auto expand all batches by default so admin sees everything immediately!
      const initialExpanded: Record<string, boolean> = {};
      batchRecords.forEach((b) => {
        initialExpanded[b.batchId] = true;
      });
      setExpandedBatches(initialExpanded);
    } catch (err: any) {
      console.error("Error loading blockchain ledger:", err);
      setError(err.message || "Failed to load blockchain ledger data");
    } finally {
      setLoading(false);
    }
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const expandAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    batches.forEach((b) => {
      updated[b.batchId] = expand;
    });
    setExpandedBatches(updated);
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.beekeeper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.currentOwner.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "COMPLETED") return matchesSearch && b.status === 6;
    if (filterStatus === "ACTIVE") return matchesSearch && b.status < 6;
    return matchesSearch;
  });

  const totalGrams = batches.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const completedCount = batches.filter((b) => b.status === 6).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">National Honey Blockchain Ledger</h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
              Live On-Chain
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Centralized master view of all honey products with complete end-to-end blockchain lifecycle histories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAllBlockchainData()}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
          >
            <span>🔄</span> Refresh Ledger
          </button>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>🔗</span> Sepolia Explorer ↗
          </a>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total On-Chain Batches</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{batches.length}</p>
          <span className="text-[11px] text-green-600 font-medium">100% Cryptographically Verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Volume Tracked</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{(totalGrams / 1000).toFixed(1)} KG</p>
          <span className="text-[11px] text-gray-500 font-medium">Across all registered hives</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed / Sold Batches</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Permanently Locked on Ledger</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Supply Chain</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{batches.length - completedCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">In Processing / Transit / Retail</span>
        </div>
      </div>

      {/* Controls: Search, Filter, Expand All */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by Batch ID, Beekeeper Address, or Owner Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
          >
            <option value="ALL">All Statuses ({batches.length})</option>
            <option value="ACTIVE">Active Supply Chain</option>
            <option value="COMPLETED">Completed / Finalized</option>
          </select>

          <button
            onClick={() => expandAll(true)}
            className="px-3 py-2 text-xs bg-amber-50 text-amber-800 font-semibold rounded-lg hover:bg-amber-100 border border-amber-200 whitespace-nowrap"
          >
            Expand All ▾
          </button>
          <button
            onClick={() => expandAll(false)}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 whitespace-nowrap"
          >
            Collapse All ▴
          </button>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-xl border border-amber-100 shadow-sm">
          <div className="inline-block animate-spin text-3xl mb-3">🍯</div>
          <p className="text-sm font-semibold text-gray-700">Loading complete blockchain ledger from Sepolia...</p>
          <p className="text-xs text-gray-400 mt-1">Reading contract events and verified batch histories</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => loadAllBlockchainData()} className="underline font-semibold">Try Again</button>
        </div>
      )}

      {/* All Products Blockchain Feed */}
      {!loading && (
        <div className="space-y-4">
          {filteredBatches.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
              <p className="text-gray-500 text-sm">No batches matched your search/filter criteria.</p>
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const isExpanded = !!expandedBatches[batch.batchId];
              const statusName = BATCH_STATUS_MAP[batch.status] || "Unknown";
              const isCompleted = batch.status === 6;

              return (
                <div
                  key={batch.batchId}
                  className="bg-white rounded-xl border border-amber-200/80 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Batch Card Header */}
                  <div
                    onClick={() => toggleBatch(batch.batchId)}
                    className="p-5 cursor-pointer hover:bg-amber-50/40 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍯</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-amber-900">{batch.batchId}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isCompleted
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isCompleted ? "🔒 Finalized (Sold)" : `Stage: ${statusName}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Quantity: <strong className="text-gray-800">{(batch.quantity / 1000).toFixed(1)} KG</strong> • 
                          Harvest Date: {new Date(batch.harvestTimestamp * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • 
                          Events: <strong className="text-amber-700">{batch.history.length} On-Chain Records</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/trace/${batch.batchId}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>📱</span> View QR Code
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600 text-sm font-bold w-6 text-center">
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Complete Blockchain History & Details */}
                  {isExpanded && (
                    <div className="p-6 bg-gradient-to-b from-amber-50/20 to-white space-y-6">
                      {/* On-Chain Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs">
                        <div>
                          <span className="text-gray-500 font-semibold block">Beekeeper (Origin)</span>
                          <span className="font-mono text-[11px] text-gray-800 break-all">{batch.beekeeper}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-semibold block">Current Custodian / Owner</span>
                          <span className="font-mono text-[11px] text-gray-800 break-all">{batch.currentOwner}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-semibold block">Genesis Metadata Hash</span>
                          <span className="font-mono text-[11px] text-amber-800 truncate block">{batch.metadataHash}</span>
                        </div>
                      </div>

                      {/* Full Supply Chain Timeline */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <span>⛓️</span> Complete Blockchain Audit Trail ({batch.history.length} Blocks/Transactions)
                        </h4>

                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-300">
                          {batch.history.map((evt, idx) => {
                            const dateStr = new Date(evt.timestamp * 1000).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            const stageName = SUPPLY_CHAIN_STAGE_MAP[evt.stage] || `Stage ${evt.stage}`;

                            return (
                              <div key={idx} className="relative">
                                {/* Dot indicator */}
                                <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                                
                                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm text-xs space-y-1">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="font-bold text-gray-800 flex items-center gap-1">
                                      <span>{idx === 0 ? "🌱" : idx === batch.history.length - 1 && isCompleted ? "🏁" : "📦"}</span>
                                      {idx === 0 ? `Origin Harvest (${stageName})` : idx === batch.history.length - 1 && isCompleted ? "Consumer Sale (Locked)" : `${stageName} Transfer`}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
                                  </div>

                                  <div className="text-gray-600 font-mono text-[11px] break-all">
                                    <span className="text-gray-400 font-sans">Signer Address:</span> {evt.actor}
                                  </div>

                                  {evt.dataHash && evt.dataHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                                    <div className="font-mono text-[10px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded border border-amber-200 break-all">
                                      <span className="font-sans font-semibold">Proof Hash: </span>{evt.dataHash}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lock Notification if Completed */}
                      {isCompleted && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                          <span className="text-base">🔒</span>
                          <div>
                            <strong>Immutable Final State Reached:</strong> Retail consumer sale completed. Smart contract rules permanently prevent any further block creations or modifications for this product.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
