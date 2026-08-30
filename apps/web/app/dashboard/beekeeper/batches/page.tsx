"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { getDisplayStatus } from "@/app/dashboard/supply-chain/[...slug]/page";

export default function BeekeeperBatchesPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState<{
    open: boolean;
    batch: any | null;
  }>({ open: false, batch: null });
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedStage, setSelectedStage] = useState("1");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    honeyApi
      .getBatches()
      .then(setBatches)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTransferModal({ open: false, batch: null });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSyncToBlockchain = async (batch: any) => {
    try {
      setLoading(true);
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const { getContractWithSigner } = await import("@/lib/blockchain");
        const { ethers } = await import("ethers");
        const contract = await getContractWithSigner();
        
        const metadataPayload = JSON.stringify({
          batchId: batch.batchId || batch.id,
          hive: batch.hive?.hiveCode || batch.hiveCode || "UNKNOWN",
          type: batch.honeyType || "Mixed Flora",
          quantity: String(batch.quantityKg || batch.quantity || 0)
        });
        const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataPayload));
        
        const quantityGrams = Math.floor(Number(batch.quantityKg || batch.quantity || 0) * 1000);
        const harvestTimestamp = Math.floor(new Date(batch.harvestDate || batch.createdAt || Date.now()).getTime() / 1000);

        const exists = await contract.doesBatchExist(batch.batchId || batch.id);
        let finalTxHash = batch.blockchainTx || "0x0000000000000000000000000000000000000000000000000000000000000000";

        if (!exists) {
          alert("Please approve the CREATE BATCH transaction in MetaMask to sync this batch to the blockchain.");
          
          const tx = await contract.createBatch(
            batch.batchId || batch.id,
            metadataHash,
            quantityGrams,
            harvestTimestamp
          );
          
          await tx.wait();
          finalTxHash = tx.hash;
        }
        
        // Update backend
        await fetch(`/api/batches/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchId: batch.batchId || batch.id, txHash: finalTxHash, metadataHash })
        });
        
        alert("Batch synced successfully!");
        window.location.reload(); // Reload the list
      } else {
        alert("MetaMask not found!");
      }
    } catch (err: any) {
      console.error(err);
      // Only alert if they didn't manually reject the transaction
      if (err.code !== 'ACTION_REJECTED' && err.code !== 4001) {
         alert("Sync failed: " + (err.reason || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = async (batch: any) => {
    setTransferModal({ open: true, batch });
    setSelectedUser(null);
    setSelectedStage("1");
    setUsersLoading(true);
    try {
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
    if (!selectedUser || !transferModal.batch) return;

    const stages = ["PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
    const stageInt = parseInt(selectedStage);
    const blockchainStageInt = stageInt + 1;
    const dbStage = stages[stageInt - 1];

    setTransferring(true);
    try {
      const { getContractWithSigner } = await import("@/lib/blockchain");
      const contract = await getContractWithSigner();
      
      const exists = await contract.doesBatchExist(transferModal.batch.batchId);
      if (!exists) {
        alert("❌ This batch is not registered on the blockchain! \n\nPlease click the 'Sync to Ledger 🔄' button for this batch to register it before initiating a transfer.");
        setTransferring(false);
        return;
      }

      alert("Please approve the INITIATE TRANSFER transaction in MetaMask.");
      // Pass lowercased address to bypass strict ethers.js checksum validation for dummy DB data
      const recipientAddress = selectedUser.walletAddress.toLowerCase();
      const tx = await contract.initiateTransfer(
        transferModal.batch.batchId,
        recipientAddress,
        blockchainStageInt
      );
      await tx.wait();

      await honeyApi.transferBatch(transferModal.batch.batchId, {
        recipientWallet: recipientAddress,
        txHash: tx.hash,
        stage: dbStage,
        action: "INITIATE",
        location: "Transferred on-chain",
        notes: `Transfer initiated to ${selectedUser.name} (${selectedUser.role})`,
      });

      alert(
        `✅ Transfer initiated to ${selectedUser.name} (${selectedUser.role})!\n\nWaiting for their acceptance on their dashboard.`
      );
      setTransferModal({ open: false, batch: null });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("Transfer failed: " + (err.reason || err.message));
    } finally {
      setTransferring(false);
    }
  };

  const roleIcon = (role: string) => {
    const map: Record<string, string> = {
      PROCESSOR: "🏭",
      LAB: "🧪",
      DISTRIBUTOR: "🚚",
      WHOLESALER: "🛒",
      RETAILER: "🏪",
      BEEKEEPER: "🐝",
      ADMIN: "👑",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Honey Batches</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable blockchain records and QR verification passports
          </p>
        </div>
        <Link href="/batches/create" className="btn-primary text-xs py-2 px-4 shadow-sm">
          + Create New Batch
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Loading Batches from Ledger...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-dashed border-amber-300 flex flex-col items-center justify-center">
          <span className="text-4xl mb-3">🍯</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Honey Batches Found</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
            You haven't harvested or registered any honey batches on the blockchain yet.
          </p>
          <Link href="/batches/create" className="btn-primary text-xs py-2 px-5 shadow-sm">
            + Create New Batch
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden bg-white">
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => {
              const events = batch.events || [];
              const lastEvent = events[events.length - 1];
              const isPendingForMe = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId === user?.id;
              const isPendingForOther = lastEvent?.stage === "PENDING_TRANSFER" && lastEvent.actorId !== user?.id;

              return (
              <div key={batch.id} className="p-5 hover:bg-amber-50/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-800">
                      {batch.batchId || batch.id}
                    </span>
                    <span className="badge badge-verified text-[10px]">{getDisplayStatus(batch, user)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!batch.metadataHash && (
                      <button
                        onClick={() => handleSyncToBlockchain(batch)}
                        className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        disabled={loading}
                      >
                        {loading ? "Syncing..." : "Sync to Ledger 🔄"}
                      </button>
                    )}
                    {batch.status === "CREATED" || batch.status === "HARVESTED" ? (
                      isPendingForOther ? (
                        <span className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg whitespace-nowrap" title={`Awaiting acceptance from ${lastEvent?.actor?.name || 'User'} (${lastEvent?.actor?.role || 'Unknown'})`}>
                          ⏳ Awaiting: {lastEvent?.actor?.name || "Recipient"}
                        </span>
                      ) : (
                        <button
                          onClick={() => openTransferModal(batch)}
                          className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Initiate Transfer 📤
                        </button>
                      )
                    ) : null}
                    <Link
                      href={`/verify/${batch.batchId || batch.id}`}
                      className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Verify QR 📱
                    </Link>
                  </div>
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
                      {batch.hive?.hiveCode || batch.hiveCode || "Deleted Hive"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Trust Score:</span>
                    <p className="font-bold text-amber-700 mt-0.5">
                      {batch.trustScore || 95}/100
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
        </div>
      )}

      {/* ── Transfer Modal ── */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📤 Transfer Batch</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select recipient for{" "}
                    <span className="font-mono font-bold text-amber-700">
                      {transferModal.batch?.batchId}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setTransferModal({ open: false, batch: null })}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Select Buyer / Next Custodian
                </label>
                {usersLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Loading registered users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500">No registered users with wallets found.</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Ask the buyer to register on Honey-Chan and connect their MetaMask wallet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
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
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${roleColor(
                                u.role
                              )}`}
                            >
                              {u.role}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 truncate">
                              {u.walletAddress?.slice(0, 6)}...{u.walletAddress?.slice(-4)}
                            </span>
                          </div>
                        </div>
                        {selectedUser?.id === u.id && (
                          <span className="text-amber-500 text-lg">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Transfer to Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                >
                  <option value="1">🏭 Processing</option>
                  <option value="2">🧪 Quality Testing</option>
                  <option value="3">🚚 Distribution</option>
                  <option value="4">🏪 Retail</option>
                </select>
              </div>

              {/* Selected User Preview */}
              {selectedUser && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs">
                  <p className="font-semibold text-green-800">
                    Transferring to: {selectedUser.name} ({selectedUser.role})
                  </p>
                  <p className="font-mono text-green-600 mt-0.5 text-[10px]">
                    Wallet: {selectedUser.walletAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                onClick={() => setTransferModal({ open: false, batch: null })}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedUser || transferring}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transferring ? "⏳ Processing on Blockchain..." : "🔗 Initiate Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
