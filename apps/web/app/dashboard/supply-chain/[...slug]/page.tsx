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

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    setBusy(true);
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
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("ACCEPT")}
        disabled={busy}
        className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50"
      >
        Accept ✅
      </button>
      <button
        onClick={() => handleAction("REJECT")}
        disabled={busy}
        className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 disabled:opacity-50"
      >
        Reject ❌
      </button>
    </div>
  );
}

// ── Batch Table ──
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
  const filtered = filterFn ? batches.filter(filterFn) : batches;

  if (filtered.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {batches.map((batch: any) => {
        const events = batch.events || [];
        const lastEvent = events[events.length - 1];
        const isPendingForMe = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId === user.id;
        const isPendingForOther = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId !== user.id;

        return (
          <div key={batch.id} className="p-5 hover:bg-amber-50/30 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-amber-800">
                  {batch.batchId || batch.id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(getDisplayStatus(batch, user))}`}>
                  {statusIcon(getDisplayStatus(batch, user))} {getDisplayStatus(batch, user)}
                </span>
              </div>

              {showActions && (
                <div className="flex items-center gap-2">
                    {batch.qualityTests && batch.qualityTests.length > 0 && (
                      <a
                        href={batch.qualityTests[batch.qualityTests.length - 1].reportUrl || `https://gateway.pinata.cloud/ipfs/${batch.qualityTests[batch.qualityTests.length - 1].reportHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        Certificate 📝
                      </a>
                    )}
                  <Link
                    href={`/verify/${batch.batchId}`}
                    className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Verify QR 📱
                  </Link>
                  {isPendingForMe ? (
                    <AcceptRejectButtons batch={batch} user={user} onDone={onRefresh} />
                  ) : isPendingForOther ? (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg max-w-[180px]" 
                      title={`Awaiting acceptance from ${lastEvent?.actor?.name || 'User'} (${lastEvent?.actor?.role || 'Unknown'})`}
                    >
                      <span className="shrink-0">⏳</span>
                      <span className="truncate">Awaiting: {lastEvent?.actor?.name || "Recipient"}</span>
                    </span>
                  ) : batch.status !== "COMPLETED" && isOwner(batch, user.id) && user.role !== "RETAILER" ? (
                    <TransferButton batch={batch} user={user} onDone={onRefresh} />
                  ) : null}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600 mt-3">
              <div>
                <span className="text-gray-400">Honey Flora:</span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {batch.honeyType || "Mixed Flora"}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Harvest Quantity:</span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {batch.quantityKg || batch.quantity} KG
                </p>
              </div>
              <div>
                <span className="text-gray-400">Source Hive:</span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {batch.hive?.hiveCode || batch.hiveCode || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Location:</span>
                <p className="font-semibold text-gray-800 mt-0.5 truncate max-w-[150px]" title={batch.location}>
                  {batch.location || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-mono truncate max-w-[280px]">
                Tx: {batch.blockchainTx || batch.transactionHash || "Pending..."}
              </span>
              <span>
                Harvested:{" "}
                {new Date(
                  batch.createdAt || batch.harvestDate || Date.now()
                ).toLocaleDateString()}
              </span>
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

  return (
    <div className="space-y-6">
      <div className="card bg-white p-6 border border-amber-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">🏷️ Batch Packaging & QR Generation</h2>
        <p className="text-gray-500 text-xs mb-4">
          Generate a unique QR code for your processed honey batches. Print and attach these to the physical bottles before distribution.
        </p>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Enter Batch ID (e.g. HC-2026-000127)"
            className="border border-gray-200 rounded-lg px-4 py-2.5 flex-1 text-sm focus:outline-none focus:border-amber-400"
            id="batchIdInput"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const batchId = (e.target as HTMLInputElement).value;
                if (batchId) window.open(`/trace/${batchId}`, "_blank");
              }
            }}
          />
          <button
            onClick={() => {
              const batchId = (document.getElementById("batchIdInput") as HTMLInputElement).value;
              if (batchId) window.open(`/trace/${batchId}`, "_blank");
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            Generate Trace QR
          </button>
        </div>
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
  return (
    <div className="space-y-6">
      <div className="card bg-white p-6 border border-green-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">🏪 Retail Point of Sale (Finalize Batch)</h2>
        <p className="text-gray-500 text-xs mb-4">
          Record the final sale to a consumer. This action permanently locks the batch on the blockchain, ensuring no further modifications can be made.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter Batch ID (e.g. HC-2026-000127)"
            className="border border-gray-200 rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:border-green-400"
            id="retailBatchId"
          />
          <input
            type="text"
            placeholder="Enter Consumer Bill / Invoice Number"
            className="border border-gray-200 rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:border-green-400"
            id="retailBillNumber"
          />
          <button
            onClick={async () => {
              const batchId = (document.getElementById("retailBatchId") as HTMLInputElement).value;
              const billNo = (document.getElementById("retailBillNumber") as HTMLInputElement).value;
              if (!batchId || !billNo) return alert("Please fill all fields");

              try {
                const { getContractWithSigner } = await import("@/lib/blockchain");
                const { ethers } = await import("ethers");
                const contract = await getContractWithSigner();

                const exists = await contract.doesBatchExist(batchId);
                if (!exists) {
                  alert(`❌ Batch "${batchId}" not found on blockchain!`);
                  return;
                }

                const batch = await contract.getBatch(batchId);
                const signerAddress = await (
                  await new ethers.BrowserProvider((window as any).ethereum)
                )
                  .getSigner()
                  .then((s: any) => s.getAddress());

                const currentOwner = batch[5];
                const status = batch[6];

                if (Number(status) === 6) {
                  alert(`⚠️ Batch "${batchId}" is ALREADY Completed/Locked!`);
                  return;
                }
                
                if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
                  alert(`❌ You are not the current owner of this batch on the blockchain.\nPlease accept the pending transfer first!`);
                  return;
                }

                if (Number(status) !== 5) { // 5 is Retail
                   alert(`❌ Batch is not in the correct 'Retail' stage on the blockchain.\nIt is currently in stage ${Number(status)}.\n(This happened due to the old dropdown bug). Please create a new batch to test this flow.`);
                   return;
                }

                const billHash = ethers.id(billNo);
                alert("Please approve the final sale transaction in MetaMask to lock the batch.");
                const tx = await contract.completeRetailSale(batchId, billHash);
                await tx.wait();

                // Sync status with backend database
                try {
                  await fetch(`/api/batches/${batchId}/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ billHash }),
                  });
                } catch (e) {
                  console.error("Failed to sync completion to backend database", e);
                }

                alert("🎉 Consumer sale finalized on Blockchain. Batch is now permanently locked.");
                onRefresh();
              } catch (err: any) {
                console.error(err);
                if (err.message.includes("AccessControlUnauthorizedAccount")) {
                  alert("❌ Your MetaMask wallet does not have the 'Retailer' role on the smart contract.");
                } else if (err.message.includes("InvalidTransition")) {
                  alert("❌ Batch cannot be locked because it was transferred with the wrong stage (e.g. Processing instead of Retail).");
                } else {
                  alert("Failed to finalize: " + (err.reason || err.message));
                }
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg w-full text-sm transition-colors shadow-sm"
          >
            🔒 Finalize Sale on Blockchain
          </button>
        </div>
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
  const filtered = filterFn ? batches.filter(filterFn) : batches;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {icon} {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
        <div className="card p-5 bg-white">
          <p className="text-gray-400 text-xs">Volume</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {filtered.reduce((acc, b) => acc + Number(b.quantity || 0), 0).toFixed(1)} KG
          </p>
        </div>
        <div className="card p-5 bg-white">
          <p className="text-gray-400 text-xs">Pending Actions</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {filtered.filter((b) => {
              const events = b.events || [];
              return events[events.length - 1]?.stage === "PENDING_TRANSFER";
            }).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <BatchTable batches={filtered} user={user} emptyMessage={emptyMessage} showActions={showActions} onRefresh={onRefresh} />
      </div>
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
          description="Batches being shipped to your warehouse."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id) || (b.status === "QUALITY_TESTED" && isOwner(b, user.id))}
          emptyMessage="No incoming shipments at this time."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "transit") {
      return (
        <FilteredListPage
          title="In Transit"
          icon="🚚"
          description="Batches currently in transit to retail destinations."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "DISTRIBUTED" && isOwner(b, user.id)}
          emptyMessage="No batches currently in transit."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "warehouse") {
      return (
        <FilteredListPage
          title="Warehouse Stock"
          icon="🏢"
          description="Batches stored in your warehouse ready for dispatch."
          batches={batches}
          user={user}
          emptyMessage="Warehouse is empty."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "dispatch") {
      return (
        <FilteredListPage
          title="Dispatch Queue"
          icon="📤"
          description="Batches ready to be dispatched to retailers and wholesalers."
          batches={batches}
          user={user}
          filterFn={(b) => !["COMPLETED", "RETAIL"].includes(b.status)}
          emptyMessage="No batches in dispatch queue."
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
          title="My Purchases"
          icon="🛒"
          description="All batches you have purchased."
          batches={batches}
          user={user}
          emptyMessage="No purchases yet."
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
          filterFn={(b) => !["COMPLETED"].includes(b.status) && isOwner(b, user.id)}
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
          filterFn={(b) => ["RETAIL", "COMPLETED"].includes(b.status)}
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
          title="Received Stock"
          icon="🏪"
          description="Batches received in your store from distributors/wholesalers."
          batches={batches}
          user={user}
          filterFn={(b) => isPendingForUser(b, user.id) || (b.status === "RETAIL" && isOwner(b, user.id))}
          emptyMessage="No stock received yet."
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
          filterFn={(b) => b.status === "COMPLETED"}
          emptyMessage="No products sold yet."
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
