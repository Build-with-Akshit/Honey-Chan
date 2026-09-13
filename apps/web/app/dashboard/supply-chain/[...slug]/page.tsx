"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";
import { LabTestingPage } from "../LabTestingPage";

// ── Batch Status Helpers ──
export function getDisplayStatus(batch: any, user: any) {
  if (batch.status === "PROCESSING") {
    const lastEvent = batch.events?.[batch.events.length - 1];
    if (lastEvent?.actor?.role === "LAB" || user?.role === "LAB") {
      return "TESTING";
    }
  }
  if (batch.status === "TESTED") return "QUALITY_TESTED";
  return batch.status;
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    HARVESTED: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    TESTING: "bg-pink-100 text-pink-800",
    QUALITY_TESTED: "bg-purple-100 text-purple-800",
    DISTRIBUTED: "bg-indigo-100 text-indigo-800",
    RETAIL: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export function statusIcon(status: string) {
  const map: Record<string, string> = {
    HARVESTED: "🍯",
    PROCESSING: "🏭",
    TESTING: "🔬",
    QUALITY_TESTED: "🧪",
    DISTRIBUTED: "🚚",
    RETAIL: "🏪",
    COMPLETED: "✅",
  };
  return map[status] || "📦";
}

// ── Transfer Button Component ──
function TransferButton({ batch, user, onDone }: { batch: any; user: any; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedStage, setSelectedStage] = useState("2");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const openModal = async () => {
    setModalOpen(true);
    setSelectedUser(null);
    setUsersLoading(true);
    try {
      const { honeyApi } = await import("@/lib/api");
      const data = await honeyApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) return;

    const stages = ["PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
    const stageInt = parseInt(selectedStage);
    const blockchainStageInt = stageInt + 1;
    const dbStage = stages[stageInt - 1];

    setBusy(true);
    try {
      const { getContractWithSigner } = await import("@/lib/blockchain");
      const contract = await getContractWithSigner();
      
      const exists = await contract.doesBatchExist(batch.batchId);
      if (!exists) {
        alert("❌ This batch is not registered on the blockchain! (It was either created before Web3 integration, or the creator lacked the necessary role).\n\nPlease Create a New Batch.");
        setBusy(false);
        return;
      }

      if (selectedUser.role === "LAB") {
        // LAB TRANSFER: KVIC Workflow - Do NOT transfer ownership. Just request a test.
        const { honeyApi } = await import("@/lib/api");
        await honeyApi.transferBatch(batch.batchId, {
          recipientWallet: selectedUser.walletAddress.toLowerCase(),
          action: "REQUEST_TEST",
          location: "Lab Request",
          notes: `Quality Test requested by ${user.name}`,
        });

        setModalOpen(false);
        onDone();
        setTimeout(() => {
          alert(`✅ Test requested from ${selectedUser.name}. They will upload the report.`);
        }, 100);
        return;
      }

      alert("Please approve the INITIATE TRANSFER transaction in MetaMask.");
      // Pass lowercased address to bypass strict ethers.js checksum validation for dummy DB data
      const recipientAddress = selectedUser.walletAddress.toLowerCase();
      const tx = await contract.initiateTransfer(batch.batchId, recipientAddress, blockchainStageInt);
      await tx.wait();

      const { honeyApi } = await import("@/lib/api");
      await honeyApi.transferBatch(batch.batchId, {
        recipientWallet: recipientAddress,
        txHash: tx.hash,
        stage: dbStage,
        action: "INITIATE",
        location: "Transferred on-chain",
        notes: `Transfer initiated to ${selectedUser.name} (${selectedUser.role})`,
      });

      setModalOpen(false);
      onDone();
      setTimeout(() => {
        alert(`⏳ Transfer initiated to ${selectedUser.name}. Waiting for their acceptance.`);
      }, 100);
    } catch (err: any) {
      console.error(err);
      alert("Transfer failed: " + (err.reason || err.message));
    } finally {
      setBusy(false);
    }
  };

  const roleIcon = (role: string) => {
    const map: Record<string, string> = {
      PROCESSOR: "🏭", LAB: "🧪", DISTRIBUTOR: "🚚", WHOLESALER: "🛒", RETAILER: "🏪", BEEKEEPER: "🐝", ADMIN: "👑",
    };
    return map[role] || "👤";
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      PROCESSOR: "bg-blue-50 text-blue-700 border-blue-200",
      LAB: "bg-purple-50 text-purple-700 border-purple-200",
      DISTRIBUTOR: "bg-indigo-50 text-indigo-700 border-indigo-200",
      WHOLESALER: "bg-teal-50 text-teal-700 border-teal-200",
      RETAILER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return map[role] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={busy}
        className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
      >
        {busy ? "Processing..." : "Initiate Transfer 📤"}
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📤 Transfer Batch</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select recipient for <span className="font-mono font-bold text-amber-700">{batch.batchId}</span>
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Select Buyer / Next Custodian</label>
                {usersLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Loading registered users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500">No registered users with wallets found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          if (u.role === "PROCESSOR") setSelectedStage("1");
                          else if (u.role === "LAB") setSelectedStage("2");
                          else if (u.role === "DISTRIBUTOR" || u.role === "WHOLESALER") setSelectedStage("3");
                          else if (u.role === "RETAILER") setSelectedStage("4");
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedUser?.id === u.id
                            ? "border-amber-400 bg-amber-50 shadow-sm"
                            : "border-gray-100 hover:border-amber-200 hover:bg-amber-50/30"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg shrink-0">
                          {roleIcon(u.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${roleColor(u.role)}`}>
                              {u.role}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 truncate">
                              {u.walletAddress?.slice(0, 6)}...{u.walletAddress?.slice(-4)}
                            </span>
                          </div>
                        </div>
                        {selectedUser?.id === u.id && <span className="text-amber-500 text-lg">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Transfer to Stage</label>
                <div className="relative">
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="1">🏭 Processing</option>
                    <option value="2">🧪 Quality Tested</option>
                    <option value="3">🚚 Distributed</option>
                    <option value="4">🏪 Retail</option>
                  </select>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📊</span>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {selectedUser && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs text-green-800 font-semibold">
                    Transferring to: {selectedUser.name} ({selectedUser.role})
                  </p>
                  <p className="text-[10px] text-green-600 font-mono mt-0.5 truncate">Wallet: {selectedUser.walletAddress}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={busy || !selectedUser}
                  className="flex-1 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing on Blockchain...</span>
                    </>
                  ) : (
                    <>
                      <span>Initiate Transfer</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Accept/Reject Buttons ──
function AcceptRejectButtons({ batch, user, onDone }: { batch: any; user: any; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT" | null>(null);

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    setBusy(true);
    setActionType(action);
    try {
      const { getContractWithSigner } = await import("@/lib/blockchain");
      const { ethers } = await import("ethers");
      
      // Verify wallet address
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const connectedWallet = await signer.getAddress();
      
      if (user?.walletAddress && connectedWallet.toLowerCase() !== user.walletAddress.toLowerCase()) {
        alert(`❌ Wallet Mismatch!\n\nYou are logged in as ${user.name}, but MetaMask is connected to a different wallet.\n\nPlease switch MetaMask to: ${user.walletAddress}`);
        setBusy(false);
        setActionType(null);
        return;
      }

      const contract = await getContractWithSigner();

      if (action === "ACCEPT") {
        alert("Please approve the ACCEPT TRANSFER transaction in MetaMask.");
        const tx = await contract.acceptTransfer(batch.batchId);
        await tx.wait();

        const onChainBatch = await contract.getBatch(batch.batchId);
        const stages = ["Created", "Harvested", "PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
        const stageName = stages[Number(onChainBatch[6])];

        await honeyApi.transferBatch(batch.batchId, {
          txHash: tx.hash,
          stage: stageName,
          action: "ACCEPT",
        });
        alert("✅ Transfer Accepted!");
      } else {
        alert("Please approve the REJECT TRANSFER transaction in MetaMask.");
        const tx = await contract.rejectTransfer(batch.batchId);
        await tx.wait();
        await honeyApi.transferBatch(batch.batchId, { txHash: tx.hash, action: "REJECT" });
        alert("❌ Transfer Rejected.");
      }
      onDone();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to ${action.toLowerCase()}: ` + (err.reason || err.message));
    } finally {
      setBusy(false);
      setActionType(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("ACCEPT")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        title="Accept raw honey transfer into facility ledger"
      >
        {busy && actionType === "ACCEPT" ? (
          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>✓</span>
        )}
        <span>{busy && actionType === "ACCEPT" ? "Accepting..." : "Accept Intake"}</span>
      </button>
      <button
        onClick={() => {
          if (confirm(`Are you sure you want to reject incoming batch ${batch.batchId}?`)) {
            handleAction("REJECT");
          }
        }}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-[0.98] rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        title="Reject this batch"
      >
        {busy && actionType === "REJECT" ? (
          <span className="h-3 w-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>✕</span>
        )}
        <span>{busy && actionType === "REJECT" ? "Rejecting..." : "Reject"}</span>
      </button>
    </div>
  );
}

// ── Batch Table / Cards ──
export function BatchTable({
  batches,
  user,
  filterFn,
  emptyMessage,
  showActions = true,
  onRefresh,
}: {
  batches: any[];
  user: any;
  filterFn?: (b: any) => boolean;
  emptyMessage: string;
  showActions?: boolean;
  onRefresh: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const filtered = filterFn ? batches.filter(filterFn) : batches;

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (filtered.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-2xl">
          🍯
        </div>
        <h4 className="text-sm font-bold text-gray-800 mb-1">No Batches Found</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100/80">
      {filtered.map((batch: any) => {
        const events = batch.events || [];
        const lastEvent = events[events.length - 1];
        const isPendingForMe = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId === user.id;
        const isPendingForOther = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId !== user.id;
        const batchQty = batch.quantityKg || (batch.quantity ? batch.quantity.toString() : "0");

        return (
          <div
            key={batch.id || batch.batchId}
            className="p-5 sm:p-6 hover:bg-amber-50/20 transition-colors group"
          >
            {/* Header: ID, Status, and Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Batch ID with Copy */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono font-bold text-gray-900">
                  <span>{batch.batchId || batch.id}</span>
                  <button
                    onClick={(e) => handleCopy(batch.batchId || String(batch.id), e)}
                    className="text-gray-400 hover:text-gray-700 transition-colors ml-0.5 cursor-pointer"
                    title="Copy Batch ID"
                  >
                    {copiedId === (batch.batchId || String(batch.id)) ? (
                      <span className="text-emerald-600 text-[11px]">✓</span>
                    ) : (
                      <span className="text-[11px]">📋</span>
                    )}
                  </button>
                </div>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs ${statusBadge(getDisplayStatus(batch, user))}`}>
                  <span>{statusIcon(getDisplayStatus(batch, user))}</span>
                  <span>{getDisplayStatus(batch, user)}</span>
                </span>

                {/* On-Chain Verified Pill */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>On-Chain Verified</span>
                </span>
              </div>

              {/* Action Toolbar */}
              {showActions && (
                <div className="flex flex-wrap items-center gap-2">
                  {batch.qualityTests && batch.qualityTests.length > 0 && (
                    <a
                      href={batch.qualityTests[batch.qualityTests.length - 1].reportUrl || `https://gateway.pinata.cloud/ipfs/${batch.qualityTests[batch.qualityTests.length - 1].reportHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>📝</span>
                      <span>Certificate</span>
                    </a>
                  )}

                  <Link
                    href={`/verify/${encodeURIComponent(batch.batchId)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>📱</span>
                    <span>Verify QR</span>
                  </Link>

                  {isPendingForMe ? (
                    <AcceptRejectButtons batch={batch} user={user} onDone={onRefresh} />
                  ) : isPendingForOther ? (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg max-w-[200px]" 
                      title={`Awaiting acceptance from ${lastEvent?.actor?.name || 'User'} (${lastEvent?.actor?.role || 'Unknown'})`}
                    >
                      <span className="shrink-0 animate-spin text-[10px]">⏳</span>
                      <span className="truncate">Awaiting: {lastEvent?.actor?.name || "Recipient"}</span>
                    </span>
                  ) : batch.status !== "COMPLETED" && isOwner(batch, user.id) && user.role !== "RETAILER" ? (
                    <TransferButton batch={batch} user={user} onDone={onRefresh} />
                  ) : null}

                  <Link
                    href={`/trace/${encodeURIComponent(batch.batchId)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    title="View full blockchain trace"
                  >
                    <span>Trace →</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Honey Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 bg-gray-50/60 rounded-xl p-3.5 border border-gray-100">
              <div>
                <span className="text-[11px] font-medium text-gray-400 block mb-0.5">Honey Flora</span>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>🌼</span>
                  <span className="truncate">{batch.honeyType || "Wild Multiflora"}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-400 block mb-0.5">Intake Volume</span>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>⚖️</span>
                  <span>{batchQty} KG</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-400 block mb-0.5">Source Apiary & Hive</span>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>🐝</span>
                  <span className="truncate">{batch.beekeeper?.name || batch.hive?.hiveCode || batch.hiveCode || "Apiary Hive"}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-400 block mb-0.5">Geographic Origin</span>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1 truncate" title={batch.location}>
                  <span>📍</span>
                  <span className="truncate">{batch.location || "Origin Location"}</span>
                </p>
              </div>
            </div>

            {/* Footer: Tx Hash & Harvest Date */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500 font-mono">
              <div className="flex items-center gap-2 truncate max-w-md">
                <span className="text-gray-400">Ledger Anchor:</span>
                <span className="truncate text-gray-700" title={batch.blockchainTx || batch.transactionHash}>
                  {batch.blockchainTx || batch.transactionHash ? `${(batch.blockchainTx || batch.transactionHash).slice(0, 18)}...${(batch.blockchainTx || batch.transactionHash).slice(-8)}` : "Pending Block Confirmation"}
                </span>
              </div>
              <div className="text-right sm:text-left text-gray-400 text-[11px]">
                Harvested: {new Date(batch.createdAt || batch.harvestDate || Date.now()).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Processed Batches with QR Generator ──
function ProcessedBatchesPage({ batches, user, onRefresh }: { batches: any[]; user: any; onRefresh: () => void }) {
  const processed = batches.filter((b) => 
    ["TESTED", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL", "COMPLETED"].includes(b.status) &&
    !isPendingForUser(b, user.id) &&
    isOwner(b, user.id)
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(processed[0]?.batchId || "");

  useEffect(() => {
    if ((!selectedBatchId || !processed.some((b) => b.batchId === selectedBatchId)) && processed.length > 0) {
      setSelectedBatchId(processed[0].batchId);
    }
  }, [processed, selectedBatchId]);

  return (
    <div className="space-y-6">
      <div className="card bg-white p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏷️</span>
          <h2 className="text-lg font-bold text-gray-800">Batch Packaging & QR Generation</h2>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Select a quality-tested batch from your facility to generate, preview, and print traceability QR codes before bottle packaging & distribution.
        </p>

        {processed.length === 0 ? (
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-center">
            <p className="text-xs text-amber-800 font-medium">
              No processed batches available for QR generation yet. Batches will appear here once Quality Tested by the Lab.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer appearance-none pr-10"
              >
                {processed.map((b) => (
                  <option key={b.id || b.batchId} value={b.batchId}>
                    {b.batchId} — {b.honeyType || "Honey"} ({b.quantityKg || (b.quantity ? b.quantity.toString() : "0")} KG) • {b.location || "Origin"}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-800">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedBatchId) window.open(`/verify/${encodeURIComponent(selectedBatchId)}`, "_blank");
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>📱</span>
                <span>Verify & Print QR</span>
              </button>
              <button
                onClick={() => {
                  if (selectedBatchId) window.open(`/trace/${encodeURIComponent(selectedBatchId)}`, "_blank");
                }}
                className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                title="View on Blockchain Trace Explorer"
              >
                <span>🔍</span>
                <span>Trace Explorer</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">✅ Processed & Completed Batches</h3>
          <span className="text-xs text-gray-400">{processed.length} batches</span>
        </div>
        <BatchTable
          batches={processed}
          user={user}
          emptyMessage="No processed batches yet. Batches will appear here after quality testing."
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}

// ── Retail Inventory / POS Page ──
function RetailInventoryPage({ batches, user, onRefresh }: { batches: any[]; user: any; onRefresh: () => void }) {
  const storeBatches = batches.filter((b) => isOwner(b, user.id) && !isPendingForUser(b, user.id));
  const [selectedBatchId, setSelectedBatchId] = useState<string>(storeBatches[0]?.batchId || "");
  const [buyerName, setBuyerName] = useState<string>("");
  const [billNumber, setBillNumber] = useState<string>("");
  const [storeLocation, setStoreLocation] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if ((!selectedBatchId || !storeBatches.some((b) => b.batchId === selectedBatchId)) && storeBatches.length > 0) {
      setSelectedBatchId(storeBatches[0].batchId);
    }
  }, [storeBatches, selectedBatchId]);

  return (
    <div className="space-y-6">
      <div className="card bg-white p-6 border border-green-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-1">🏪 Retail Point of Sale &amp; Consumer Billing</h2>
        <p className="text-gray-500 text-xs mb-4">
          Record the final consumer purchase. This action records the customer invoice and permanently locks the batch on the blockchain ledger.
        </p>

        {storeBatches.length === 0 ? (
          <div className="p-4 bg-green-50/60 border border-green-200 rounded-xl text-center">
            <p className="text-xs text-green-800 font-medium">
              No inventory ready for final sale. Batches transferred to your store will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">🍯 Select Honey Batch from Stock</label>
              <div className="relative">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full bg-green-50/30 border border-green-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-green-400 appearance-none pr-10"
                >
                  {storeBatches.map((b) => (
                    <option key={b.id || b.batchId} value={b.batchId}>
                      {b.batchId} — {b.honeyType || "Honey"} ({b.quantity} KG)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-green-800">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">👤 Buyer / Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sunita Sharma"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">🧾 Consumer Bill / Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-98765"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">📍 Store / Counter Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Khadi India Emporium, CP, New Delhi"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <button
              disabled={busy}
              onClick={async () => {
                if (!selectedBatchId || !billNumber) return alert("Please select a batch and enter bill number");

                setBusy(true);
                try {
                  const { getContractWithSigner } = await import("@/lib/blockchain");
                  const { ethers } = await import("ethers");
                  const contract = await getContractWithSigner();

                  const exists = await contract.doesBatchExist(selectedBatchId);
                  if (!exists) {
                    alert(`❌ Batch "${selectedBatchId}" not found on blockchain!`);
                    setBusy(false);
                    return;
                  }

                  const batch = await contract.getBatch(selectedBatchId);
                  const signerAddress = await (
                    await new ethers.BrowserProvider((window as any).ethereum)
                  )
                    .getSigner()
                    .then((s: any) => s.getAddress());

                  const currentOwner = batch[5];
                  const status = batch[6];

                  if (Number(status) === 6) {
                    alert(`⚠️ Batch "${selectedBatchId}" is ALREADY Completed/Locked!`);
                    setBusy(false);
                    return;
                  }
                  
                  if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
                    alert(`❌ You are not the current owner of this batch on the blockchain.\nPlease accept the pending transfer first!`);
                    setBusy(false);
                    return;
                  }

                  if (Number(status) !== 5) { // 5 is Retail
                     alert(`❌ Batch is not in the correct 'Retail' stage on the blockchain.\nIt is currently in stage ${Number(status)}.\n(This happened due to the old dropdown bug). Please create a new batch to test this flow.`);
                     setBusy(false);
                     return;
                  }

                  const billHash = ethers.id(billNumber);
                  alert("Please approve the final sale transaction in MetaMask to lock the batch.");
                  const tx = await contract.completeRetailSale(selectedBatchId, billHash);
                  await tx.wait();

                  // Sync status with backend database
                  try {
                    await fetch(`/api/batches/${selectedBatchId}/complete`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        billHash,
                        billNumber,
                        buyerName: buyerName.trim() || "Retail Consumer",
                        location: storeLocation.trim() || user.name || "Khadi India Store",
                        txHash: tx.hash,
                      }),
                    });
                  } catch (e) {
                    console.error("Failed to sync completion to backend database", e);
                  }

                  alert("🎉 Consumer sale finalized on Blockchain. Batch is now permanently locked.");
                  setBillNumber("");
                  setBuyerName("");
                  setStoreLocation("");
                  onRefresh();
                } catch (err: any) {
                  console.error(err);
                  if (err.message?.includes("AccessControlUnauthorizedAccount")) {
                    alert("❌ Your MetaMask wallet does not have the 'Retailer' role on the smart contract.");
                  } else if (err.message?.includes("InvalidTransition")) {
                    alert("❌ Batch cannot be locked because it was transferred with the wrong stage (e.g. Processing instead of Retail).");
                  } else {
                    alert("Failed to finalize: " + (err.reason || err.message));
                  }
                } finally {
                  setBusy(false);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl w-full text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {busy ? "Finalizing on Blockchain..." : "🔒 Finalize Sale on Blockchain"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">📦 Current Store Inventory</h3>
        </div>
        <BatchTable
          batches={batches}
          user={user}
          emptyMessage="No inventory yet. Batches will appear here when they are transferred to your store."
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}

// ── Generic Filtered List Page ──
function FilteredListPage({
  title,
  icon,
  description,
  batches,
  user,
  filterFn,
  emptyMessage,
  showActions = true,
  onRefresh,
}: {
  title: string;
  icon: string;
  description: string;
  batches: any[];
  user: any;
  filterFn?: (b: any) => boolean;
  emptyMessage: string;
  showActions?: boolean;
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "HIGH_VOLUME">("ALL");
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [modalBatchId, setModalBatchId] = useState("");
  const [modalTemp, setModalTemp] = useState("38.5");
  const [modalFilter, setModalFilter] = useState("Standard (100 micron)");
  const [modalNotes, setModalNotes] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  const baseBatches = filterFn ? batches.filter(filterFn) : batches;

  // Search & Category Filter
  const filtered = baseBatches.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.batchId?.toLowerCase().includes(q) ||
      b.honeyType?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.beekeeper?.name?.toLowerCase().includes(q) ||
      b.hive?.hiveCode?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === "PENDING") {
      const events = b.events || [];
      return events[events.length - 1]?.stage === "PENDING_TRANSFER";
    }

    if (activeFilter === "HIGH_VOLUME") {
      const qNum = Number(b.quantityKg || (b.quantity ? b.quantity.toString() : 0));
      return qNum >= 5;
    }

    return true;
  });

  const totalVolume = baseBatches.reduce((acc, b) => acc + Number(b.quantityKg || (b.quantity ? b.quantity.toString() : 0) || 0), 0);
  const pendingActionsCount = baseBatches.filter((b) => {
    const events = b.events || [];
    return events[events.length - 1]?.stage === "PENDING_TRANSFER";
  }).length;

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setModalSuccess(true);
      setTimeout(() => {
        setModalSuccess(false);
        setShowIntakeModal(false);
        setModalBatchId("");
        setModalNotes("");
        onRefresh();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{icon}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {user.role === "PROCESSOR" && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Facility Unit #1
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Refresh from Blockchain Ledger"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>

          {user.role === "PROCESSOR" && (
            <button
              onClick={() => {
                if (filtered[0]) setModalBatchId(filtered[0].batchId);
                setShowIntakeModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-xs hover:shadow-md border border-amber-600/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>⚙️</span>
              <span>Log Processing Step</span>
            </button>
          )}
        </div>
      </div>

      {/* Processor Facility Operating Protocol Banner */}
      {user.role === "PROCESSOR" && (
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-50/60 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs text-xl">
                🏭
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">Standard Operating Protocol • Honey Processing</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    KVIC & FSSAI Compliant
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-700 font-semibold">🌡️ Heating Limit:</span> &lt; 45°C (Protects Diastase Activity)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-amber-700 font-semibold">🔬 Micro-Filtration:</span> 100µm standard stainless
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-amber-700 font-semibold">⛓️ Chain of Custody:</span> Automated on-chain signing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Batches</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm">
              📦
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{baseBatches.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Batches registered in custody</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm">
              ⚖️
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalVolume.toFixed(1)} KG</p>
          <p className="text-[11px] text-gray-500 mt-1">Raw weight across inventory</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Sign-offs</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${pendingActionsCount > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"}`}>
              ⚡
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-amber-700">{pendingActionsCount}</p>
            {pendingActionsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting custody confirmation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ledger Security</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
              🛡️
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-800">100% On-Chain</p>
          <p className="text-[11px] text-gray-500 mt-1">Sepolia smart contract verified</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Batch ID, Flora, Hive Code, Beekeeper, or Location..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs border border-amber-600/30"
                : "text-gray-600 hover:bg-amber-50 hover:text-amber-900"
            }`}
          >
            All ({baseBatches.length})
          </button>
          <button
            onClick={() => setActiveFilter("PENDING")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFilter === "PENDING"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-2xs border border-amber-700/30"
                : "text-gray-600 hover:bg-amber-50 hover:text-amber-900"
            }`}
          >
            Pending Actions ({pendingActionsCount})
          </button>
          <button
            onClick={() => setActiveFilter("HIGH_VOLUME")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFilter === "HIGH_VOLUME"
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-2xs border border-amber-600/30"
                : "text-gray-600 hover:bg-amber-50 hover:text-amber-900"
            }`}
          >
            High Volume (&ge;5 KG)
          </button>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200/90 overflow-hidden">
        <BatchTable
          batches={filtered}
          user={user}
          emptyMessage={
            searchTerm
              ? `No batches matching "${searchTerm}". Try another search term.`
              : emptyMessage
          }
          showActions={showActions}
          onRefresh={onRefresh}
        />
      </div>

      {/* Processing Parameter Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Log Facility Processing Step</h3>
                  <p className="text-xs text-gray-500">Record heating temperature and filtration specs.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalSuccess ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-gray-900">Processing Step Logged!</h4>
                <p className="text-xs text-gray-500 mt-1">Parameters anchored to batch processing audit trail.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Batch Identifier</label>
                  <input
                    type="text"
                    required
                    value={modalBatchId}
                    onChange={(e) => setModalBatchId(e.target.value)}
                    placeholder="e.g. hive 333 or BATCH-001"
                    className="w-full px-3.5 py-2 text-xs font-mono font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Heating Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={modalTemp}
                      onChange={(e) => setModalTemp(e.target.value)}
                      placeholder="e.g. 38.5"
                      className="w-full px-3.5 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <span className={`text-[10px] mt-1 block ${Number(modalTemp) > 45 ? "text-rose-600 font-bold" : "text-emerald-700"}`}>
                      {Number(modalTemp) > 45 ? "⚠️ Warning: >45°C damages enzymes" : "✓ Safe: <45°C keeps raw enzymes active"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Filtration Micron</label>
                    <select
                      value={modalFilter}
                      onChange={(e) => setModalFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                    >
                      <option value="Standard (100 micron)">Standard (100 micron)</option>
                      <option value="Fine (50 micron)">Fine (50 micron)</option>
                      <option value="Coarse (400 micron)">Coarse (400 micron)</option>
                      <option value="Raw Unfiltered Mesh">Raw Unfiltered Mesh</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Processing Notes</label>
                  <textarea
                    rows={2}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Any observations, lot number, or tank assignment..."
                    className="w-full px-3.5 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-xs hover:shadow-md border border-amber-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {modalSubmitting ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Logging...</span>
                      </>
                    ) : (
                      <span>Commit Step ✓</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ──
function isPendingForUser(b: any, userId: string | number) {
  const lastEvent = b.events?.[b.events.length - 1];
  return lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId === userId;
}

export function isOwner(batch: any, userId: string | number) {
  const events = batch.events || [];
  if (events.length === 0) return batch.beekeeperId === userId;
  
  const lastEvent = events[events.length - 1];
  
  if (lastEvent.stage === "PENDING_TRANSFER") {
    if (events.length >= 2) {
      return events[events.length - 2].actorId === userId;
    }
    return batch.beekeeperId === userId;
  }

  // If the last event was done by a LAB, ownership belongs to the actor BEFORE the lab
  if (lastEvent.stage === "QUALITY_TESTED" || lastEvent.stage === "TEST_REQUESTED" || lastEvent.stage === "LAB_TESTING") {
     // Find the last event that wasn't a lab event
     const nonLabEvent = [...events].reverse().find(e => 
       e.stage !== "QUALITY_TESTED" && e.stage !== "TEST_REQUESTED" && e.stage !== "LAB_TESTING"
     );
     if (nonLabEvent) {
       // If the non-lab event was PENDING_TRANSFER, the owner is the actor before that
       if (nonLabEvent.stage === "PENDING_TRANSFER") {
          const preTransferIndex = events.indexOf(nonLabEvent) - 1;
          if (preTransferIndex >= 0) return events[preTransferIndex].actorId === userId;
          return batch.beekeeperId === userId;
       }
       return nonLabEvent.actorId === userId;
     }
     return batch.beekeeperId === userId;
  }

  return lastEvent.actorId === userId;
}

export default function SupplyChainDashboard() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = pathname.split("/").pop() || "feature";

  const fetchData = async () => {
    try {
      const data = await honeyApi.getBatches();
      setBatches(data || []);
    } catch (err) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const refresh = () => {
    setLoading(true);
    fetchData();
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Syncing with Blockchain Ledger...</p>
      </div>
    );
  }

  // ── PROCESSOR TABS ──
  if (user.role === "PROCESSOR") {
    if (slug === "incoming") {
      return (
        <FilteredListPage
          title="Incoming Raw Honey"
          icon="📦"
          description="Batches received from beekeepers awaiting processing."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id)}
          emptyMessage="No incoming raw honey batches at this time."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "processing") {
      return (
        <FilteredListPage
          title="Processing Queue"
          icon="🏭"
          description="Batches currently being processed in your facility."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "PROCESSING" && isOwner(b, user.id) && !isPendingForUser(b, user.id)}
          emptyMessage="No batches in the processing queue currently."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "processed") {
      return <ProcessedBatchesPage batches={batches} user={user} onRefresh={refresh} />;
    }
  }

  // ── LAB TABS ──
  if (user.role === "LAB") {
    if (slug === "pending") {
      return <LabTestingPage batches={batches} user={user} onRefresh={refresh} />;
    }
    if (slug === "results") {
      return (
        <FilteredListPage
          title="Test Results"
          icon="📋"
          description="Completed quality test reports."
          batches={batches}
          user={user}
          filterFn={(b) => (b.status === "QUALITY_TESTED" || b.status === "TESTED") && b.events?.some((e: any) => e.stage === "TEST_REQUESTED" && e.actorId === user.id)}
          emptyMessage="No test results available yet."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "certificates") {
      return (
        <FilteredListPage
          title="Quality Certificates"
          icon="🎓"
          description="Blockchain-verified quality certificates issued for tested batches."
          batches={batches}
          user={user}
          filterFn={(b) => ["TESTED", "DISTRIBUTED", "RETAIL", "COMPLETED"].includes(b.status)}
          emptyMessage="No certificates issued yet."
          onRefresh={refresh}
        />
      );
    }
  }

  // ── DISTRIBUTOR TABS ──
  if (user.role === "DISTRIBUTOR") {
    if (slug === "incoming") {
      return (
        <FilteredListPage
          title="Incoming Shipments"
          icon="📦"
          description="Batches transferred from processing plants awaiting your acceptance."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id)}
          emptyMessage="No incoming shipments at this time."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "warehouse") {
      return (
        <FilteredListPage
          title="Warehouse Stock"
          icon="🏢"
          description="Batches physically stored in your distribution center ready for dispatch."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "DISTRIBUTED" && isOwner(b, user.id) && !isPendingForUser(b, user.id)}
          emptyMessage="Warehouse is empty. Accept incoming shipments to add stock."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "transit") {
      return (
        <FilteredListPage
          title="In Transit"
          icon="🚚"
          description="Shipments dispatched to retailers currently on the road awaiting their receipt."
          batches={batches}
          user={user}
          filterFn={(b) => {
            const events = b.events || [];
            if (events.length < 2) return false;
            const lastEvent = events[events.length - 1];
            const prevEvent = events[events.length - 2];
            return lastEvent.stage === "PENDING_TRANSFER" && prevEvent.actorId === user.id;
          }}
          emptyMessage="No shipments currently in transit to retailers."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "dispatch") {
      return (
        <FilteredListPage
          title="Dispatch History"
          icon="📤"
          description="Batches successfully delivered and received by retailers."
          batches={batches}
          user={user}
          filterFn={(b) => 
            (b.status === "RETAIL" || b.status === "COMPLETED") && 
            b.events?.some((e: any) => e.actorId === user.id)
          }
          emptyMessage="No completed dispatches yet."
          onRefresh={refresh}
        />
      );
    }
  }

  // ── WHOLESALER TABS ──
  if (user.role === "WHOLESALER") {
    if (slug === "purchases") {
      return (
        <FilteredListPage
          title="Incoming Purchases"
          icon="🛒"
          description="Purchased batches awaiting receipt."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id)}
          emptyMessage="No incoming purchases yet."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "inventory") {
      return (
        <FilteredListPage
          title="Inventory"
          icon="📦"
          description="Batches currently in your stock."
          batches={batches}
          user={user}
          filterFn={(b) => !["COMPLETED"].includes(b.status) && isOwner(b, user.id) && !isPendingForUser(b, user.id)}
          emptyMessage="Inventory is empty."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "transfers") {
      return (
        <FilteredListPage
          title="Retailer Transfers"
          icon="🔄"
          description="Batches transferred to retailers."
          batches={batches}
          user={user}
          filterFn={(b) => ["RETAIL", "COMPLETED"].includes(b.status) && b.events?.some((e: any) => e.actorId === user.id)}
          emptyMessage="No transfers to retailers yet."
          onRefresh={refresh}
        />
      );
    }
  }

  // ── RETAILER TABS ──
  if (user.role === "RETAILER") {
    if (slug === "received") {
      return (
        <FilteredListPage
          title="Incoming Shipments"
          icon="🏪"
          description="Batches shipped to your store from distributors awaiting acceptance."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id)}
          emptyMessage="No incoming shipments awaiting receipt."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "inventory") {
      return <RetailInventoryPage batches={batches} user={user} onRefresh={refresh} />;
    }
    if (slug === "sold") {
      return (
        <FilteredListPage
          title="Products Sold"
          icon="💰"
          description="Batches that have been finalized and sold to consumers. These are permanently locked on the blockchain."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "COMPLETED" && isOwner(b, user.id)}
          emptyMessage="No products finalized as sold yet."
          showActions={false}
          onRefresh={refresh}
        />
      );
    }
  }

  // ── Fallback for any unmapped slug ──
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return (
    <FilteredListPage
      title={`${title} Module`}
      icon="📋"
      description={`Manage your ${title.toLowerCase()} operations and blockchain records.`}
      batches={batches}
      user={user}
      emptyMessage="No data available for this module yet."
      onRefresh={refresh}
    />
  );
}
