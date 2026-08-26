"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

export default function SupplyChainDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      honeyApi
        .getBatches()
        .then(setBatches)
        .catch((err) => console.error("Error fetching batches", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is the overview for your {user.role.toLowerCase()} operations.
        </p>
      </div>

      {/* Dynamic Summary Widgets based on Role */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {user.role === "PROCESSOR" && (
          <>
            <Widget title="Incoming Raw Honey" value="12 Batches" />
            <Widget title="Processing Queue" value="3 Batches" />
            <Widget title="Processed Batches" value="45 Batches" />
            <Widget title="Quality Status" value="98% Pass" />
          </>
        )}
        {user.role === "LAB" && (
          <>
            <Widget title="Pending Tests" value="8 Samples" />
            <Widget title="Tests Completed" value="156" />
            <Widget title="Certificates Issued" value="142" />
            <Widget title="Average Turnaround" value="2.4 days" />
          </>
        )}
        {user.role === "DISTRIBUTOR" && (
          <>
            <Widget title="Incoming Shipments" value="5 Active" />
            <Widget title="In Transit" value="12 Trucks" />
            <Widget title="Warehouse Stock" value="850 kg" />
            <Widget title="Dispatched Today" value="2 Shipments" />
          </>
        )}
        {user.role === "WHOLESALER" && (
          <>
            <Widget title="My Purchases" value="18 Batches" />
            <Widget title="Inventory" value="420 kg" />
            <Widget title="Incoming" value="2 Shipments" />
            <Widget title="Retailer Transfers" value="15 Completed" />
          </>
        )}
        {user.role === "RETAILER" && (
          <>
            <Widget title="Received Stock" value="45 Batches" />
            <Widget title="Store Inventory" value="120 kg" />
            <Widget title="Products Sold" value="85 kg" />
            <Widget title="QR Verifications" value="342 Scans" />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {user.role === "WHOLESALER" ? "My Purchased Batches" :
            user.role === "RETAILER" ? "My Inventory" : "Recent Activity"}
        </h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs">Syncing with Blockchain Ledger...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-sm">No batches in your custody yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Hash Provenance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => {
                    // Find previous hash (the hash of the event before the current one, or genesis hash)
                    const events = batch.events || [];
                    const currentEvent = events[events.length - 1];
                    const previousEvent = events.length > 1 ? events[events.length - 2] : null;
                    
                    const previousHash = previousEvent ? previousEvent.txHash : batch.metadataHash;
                    const currentHash = currentEvent ? currentEvent.txHash : batch.blockchainTx;

                    return (
                      <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{batch.batchId}</td>
                        <td className="px-6 py-4">{batch.quantityKg || batch.quantity} kg</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-[10px] font-mono text-gray-500">
                            <span title="The transaction hash that brought this product to you">
                              Prev: {previousHash?.slice(0, 10)}...{previousHash?.slice(-8)}
                            </span>
                            <span className="text-green-600 font-semibold" title="The current transaction hash">
                              New: {currentHash?.slice(0, 10)}...{currentHash?.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/verify/${batch.batchId}`}
                              className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Verify
                            </Link>

                            {user.role === "RETAILER" && batch.status !== "COMPLETED" ? (
                              <button 
                                onClick={async () => {
                                  const confirmMsg = prompt("Enter Consumer Bill Number to finalize on Blockchain:", "INV-" + Date.now().toString().slice(-6));
                                  if (!confirmMsg) return;
                                  try {
                                    const { getContractWithSigner } = await import("@/lib/blockchain");
                                    const { ethers } = await import("ethers");
                                    const contract = await getContractWithSigner();
                                    
                                    const exists = await contract.doesBatchExist(batch.batchId);
                                    if (!exists) {
                                      alert(`❌ Batch "${batch.batchId}" not found on blockchain!\n\nPlease first create this batch from the Beekeeper Dashboard using "Harvest & Create Block".`);
                                      return;
                                    }

                                    const onChainBatch = await contract.getBatch(batch.batchId);
                                    const signerAddress = await (await (new ethers.BrowserProvider((window as any).ethereum))).getSigner().then(s => s.getAddress());

                                    // Status 5 is Retail, 6 is Completed
                                    if (Number(onChainBatch.status) === 6) {
                                      alert(`⚠️ Batch "${batch.batchId}" is ALREADY Completed/Locked on the blockchain!`);
                                      return;
                                    }

                                    // If batch is not in Retail stage yet (e.g. still in Harvest/Created stage), transition to Retail first if owned
                                    if (Number(onChainBatch.status) < 5) {
                                      if (onChainBatch.currentOwner.toLowerCase() === signerAddress.toLowerCase()) {
                                        alert(`Batch is currently in stage ${Number(onChainBatch.status)}. Advancing to Retail stage on blockchain...`);
                                        const transferTx = await contract.transferBatch(batch.batchId, signerAddress, 5); // 5 = SupplyChainStage.Retail
                                        await transferTx.wait();
                                      }
                                    }
                                    
                                    const billHash = ethers.id(confirmMsg);
                                    alert("Please approve the final sale transaction in MetaMask to lock the batch.");
                                    
                                    const tx = await contract.completeRetailSale(batch.batchId, billHash);
                                    await tx.wait();
                                    
                                    await honeyApi.transferBatch(batch.batchId, {
                                      recipientWallet: signerAddress,
                                      txHash: tx.hash,
                                      stage: "COMPLETED",
                                      location: "Retail Store",
                                      notes: "Consumer Sale Completed"
                                    });

                                    alert("🎉 Success! Consumer sale finalized on Blockchain. This batch is now permanently locked.");
                                    window.location.reload();
                                  } catch(err: any) {
                                    console.error(err);
                                    alert("Failed to finalize: " + (err.reason || err.message));
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm"
                              >
                                Finalize Sale
                              </button>
                            ) : batch.status !== "COMPLETED" ? (
                              <button 
                                onClick={async () => {
                                  const recipient = prompt("Enter Recipient Wallet Address (Next Stage):", "0x...");
                                  if (!recipient) return;
                                  
                                  const stages = ["PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
                                  const stageInput = prompt(`Enter next stage number:\n1. Processing\n2. Quality Tested\n3. Distributed\n4. Retail`, "2");
                                  if (!stageInput) return;
                                  
                                  const stageInt = parseInt(stageInput);
                                  if (isNaN(stageInt) || stageInt < 1 || stageInt > 4) return;
                                  
                                  const blockchainStageInt = stageInt + 1; 
                                  const dbStage = stages[stageInt - 1];

                                  try {
                                    const { getContractWithSigner } = await import("@/lib/blockchain");
                                    const contract = await getContractWithSigner();
                                    alert("Please approve the transfer transaction in MetaMask.");
                                    const tx = await contract.transferBatch(batch.batchId, recipient, blockchainStageInt);
                                    await tx.wait();
                                    
                                    await honeyApi.transferBatch(batch.batchId, {
                                      recipientWallet: recipient,
                                      txHash: tx.hash,
                                      stage: dbStage,
                                      location: "Transferred on-chain",
                                      notes: `Transferred by ${user.role}`
                                    });
                                    
                                    alert(`🎉 Success! Batch transferred to ${recipient}`);
                                    window.location.reload();
                                  } catch (err: any) {
                                    console.error(err);
                                    alert("Transfer failed: " + (err.reason || err.message));
                                  }
                                }}
                                className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                              >
                                Transfer 📤
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
