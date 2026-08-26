"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

export default function BeekeeperBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    honeyApi
      .getBatches()
      .then(setBatches)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
            You haven't harvested or registered any honey batches on the blockchain yet. Click the button below to register your first batch.
          </p>
          <Link href="/batches/create" className="btn-primary text-xs py-2 px-5 shadow-sm">
            + Create New Batch
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden bg-white">
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <div key={batch.id} className="p-5 hover:bg-amber-50/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-800">{batch.batchId || batch.id}</span>
                    <span className="badge badge-verified text-[10px]">
                      {batch.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {batch.status !== "RETAIL" && batch.status !== "COMPLETED" && (
                      <button
                        onClick={async () => {
                          const recipient = prompt("Enter Recipient Wallet Address (e.g., Processor):", "0xB36465C84c124EF7BBD40952A0A5897f7D7a4ab5");
                          if (!recipient) return;
                          
                          const stages = ["PROCESSING", "QUALITY_TESTED", "DISTRIBUTED", "RETAIL"];
                          const stageInput = prompt(`Enter next stage number:\n1. Processing\n2. Quality Tested\n3. Distributed\n4. Retail`, "1");
                          if (!stageInput) return;
                          
                          const stageInt = parseInt(stageInput);
                          if (isNaN(stageInt) || stageInt < 1 || stageInt > 4) return;
                          
                          // Smart contract stage enum offset: Harvested=1, Processing=2, QualityTested=3, Distributed=4, Retail=5
                          const blockchainStageInt = stageInt + 1; 
                          const dbStage = stages[stageInt - 1];

                          try {
                            const { getContractWithSigner } = await import("@/lib/blockchain");
                            const contract = await getContractWithSigner();
                            alert("Please approve the INITIATE TRANSFER transaction in MetaMask.");
                            // Step 1 of Two-Step Handshake: Initiate Transfer
                            const tx = await contract.initiateTransfer(batch.batchId, recipient, blockchainStageInt);
                            await tx.wait();
                            
                            await honeyApi.transferBatch(batch.batchId, {
                              recipientWallet: recipient,
                              txHash: tx.hash,
                              stage: dbStage,
                              action: "INITIATE",
                              location: "Transferred on-chain",
                              notes: "Transfer initiated by Beekeeper"
                            });
                            
                            alert(`⏳ Success! Transfer initiated to ${recipient}. Waiting for their acceptance.`);
                            window.location.reload();
                          } catch (err: any) {
                            console.error(err);
                            alert("Transfer initiation failed: " + (err.reason || err.message));
                          }
                        }}
                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        Initiate Transfer 📤
                      </button>
                    )}
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
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.honeyType || "Mixed Flora"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Harvest Quantity:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.quantityKg || batch.quantity} KG</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Source Hive:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.hive?.hiveCode || batch.hiveCode || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Trust Score:</span>
                    <p className="font-bold text-amber-700 mt-0.5">{batch.trustScore || 95}/100</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-mono truncate max-w-[280px]">Tx: {batch.blockchainTx || batch.transactionHash || "Pending..."}</span>
                  <span>Harvested: {new Date(batch.createdAt || batch.harvestDate || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
