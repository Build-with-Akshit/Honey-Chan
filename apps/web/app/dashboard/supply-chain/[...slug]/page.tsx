"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

// ── Batch Status Helpers ──
function statusBadge(status: string) {
  const map: Record<string, string> = {
    HARVESTED: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    QUALITY_TESTED: "bg-purple-100 text-purple-800",
    DISTRIBUTED: "bg-indigo-100 text-indigo-800",
    RETAIL: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

function statusIcon(status: string) {
  const map: Record<string, string> = {
    HARVESTED: "🍯",
    PROCESSING: "🏭",
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

  const handleTransfer = async () => {
    const recipient = prompt("Enter Recipient Wallet Address (e.g., Processor):");
    if (!recipient) return;

    const stages = ["PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
    const stageInput = prompt(
      `Enter next stage number:\n1. Processing\n2. Quality Tested\n3. Distributed\n4. Retail`,
      "2"
    );
    if (!stageInput) return;

    const stageInt = parseInt(stageInput);
    if (isNaN(stageInt) || stageInt < 1 || stageInt > 4) return;

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

      alert("Please approve the INITIATE TRANSFER transaction in MetaMask.");
      const tx = await contract.initiateTransfer(batch.batchId, recipient, blockchainStageInt);
      await tx.wait();

      await honeyApi.transferBatch(batch.batchId, {
        recipientWallet: recipient,
        txHash: tx.hash,
        stage: dbStage,
        action: "INITIATE",
        location: "Transferred on-chain",
        notes: `Transfer initiated by ${user.role}`,
      });

      alert(`⏳ Transfer initiated to ${recipient}. Waiting for acceptance.`);
      onDone();
    } catch (err: any) {
      console.error(err);
      alert("Transfer failed: " + (err.reason || err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleTransfer}
      disabled={busy}
      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
    >
      {busy ? "Processing..." : "Initiate Transfer 📤"}
    </button>
  );
}

// ── Accept/Reject Buttons ──
function AcceptRejectButtons({ batch, onDone }: { batch: any; onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    setBusy(true);
    try {
      const { getContractWithSigner } = await import("@/lib/blockchain");
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
function BatchTable({
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3">Batch ID</th>
            <th className="px-5 py-3">Honey Type</th>
            <th className="px-5 py-3">Qty</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Origin</th>
            <th className="px-5 py-3">Harvested</th>
            {showActions && <th className="px-5 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((batch) => {
            const events = batch.events || [];
            const lastEvent = events[events.length - 1];
            const isPending = lastEvent?.stage === "PENDING_TRANSFER";

            return (
              <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-5 py-4 font-mono font-semibold text-gray-900 text-xs">{batch.batchId}</td>
                <td className="px-5 py-4 text-xs">{batch.honeyType}</td>
                <td className="px-5 py-4 font-semibold text-xs">{batch.quantity} KG</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(batch.status)}`}>
                    {statusIcon(batch.status)} {batch.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{batch.location}</td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {new Date(batch.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                {showActions && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/verify/${batch.batchId}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Verify
                      </Link>
                      {isPending ? (
                        <AcceptRejectButtons batch={batch} onDone={onRefresh} />
                      ) : batch.status !== "COMPLETED" ? (
                        <TransferButton batch={batch} user={user} onDone={onRefresh} />
                      ) : null}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Processed Batches with QR Generator ──
function ProcessedBatchesPage({ batches, user, onRefresh }: { batches: any[]; user: any; onRefresh: () => void }) {
  const processed = batches.filter((b) => ["QUALITY_TESTED", "DISTRIBUTED", "RETAIL", "COMPLETED"].includes(b.status));

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

                if (Number(batch.status) === 6) {
                  alert(`⚠️ Batch "${batchId}" is ALREADY Completed/Locked!`);
                  return;
                }

                if (Number(batch.status) < 5) {
                  if (batch.currentOwner.toLowerCase() === signerAddress.toLowerCase()) {
                    const transferTx = await contract.transferBatch(batchId, signerAddress, 5);
                    await transferTx.wait();
                  }
                }

                const billHash = ethers.id(billNo);
                alert("Please approve the final sale transaction in MetaMask to lock the batch.");
                const tx = await contract.completeRetailSale(batchId, billHash);
                await tx.wait();
                alert("🎉 Consumer sale finalized on Blockchain. Batch is now permanently locked.");
                onRefresh();
              } catch (err: any) {
                console.error(err);
                alert("Failed to finalize: " + (err.reason || err.message));
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
export default function SupplyChainSubPage() {
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
          filterFn={(b) => b.status === "HARVESTED"}
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
          filterFn={(b) => b.status === "PROCESSING"}
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
      return (
        <FilteredListPage
          title="Pending Quality Tests"
          icon="🧪"
          description="Batches awaiting lab analysis and quality certification."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "PROCESSING"}
          emptyMessage="No pending quality tests at this time."
          onRefresh={refresh}
        />
      );
    }
    if (slug === "results") {
      return (
        <FilteredListPage
          title="Test Results"
          icon="📋"
          description="Completed quality test reports."
          batches={batches}
          user={user}
          filterFn={(b) => b.status === "QUALITY_TESTED"}
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
          filterFn={(b) => ["QUALITY_TESTED", "DISTRIBUTED", "RETAIL", "COMPLETED"].includes(b.status)}
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
          filterFn={(b) => b.status === "QUALITY_TESTED"}
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
          filterFn={(b) => b.status === "DISTRIBUTED"}
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
          filterFn={(b) => !["COMPLETED"].includes(b.status)}
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
          filterFn={(b) => b.status === "RETAIL"}
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
