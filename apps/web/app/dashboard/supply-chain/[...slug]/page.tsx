"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function GenericSupplyChainPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // E.g. /dashboard/supply-chain/purchases -> "purchases"
  const slug = pathname.split("/").pop() || "feature";
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-amber-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title} Module</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your {title.toLowerCase()} operations and blockchain records.
        </p>
      </div>

      {slug === "processed" && user?.role === "PROCESSOR" ? (
        <div className="card bg-white p-8 border border-amber-200 shadow-sm mt-6">
          <h2 className="text-xl font-bold mb-4">Batch Packaging & QR Generation</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Generate a unique QR code for your processed honey batches. Print and attach these to the physical bottles before distribution.
          </p>
          <div className="flex gap-4 items-center">
            <input 
              type="text" 
              placeholder="Enter Batch ID (e.g. HC-2026-000127)" 
              className="border border-gray-300 rounded px-4 py-2 flex-1"
              id="batchIdInput"
            />
            <button 
              onClick={() => {
                const batchId = (document.getElementById('batchIdInput') as HTMLInputElement).value;
                if(batchId) {
                  // Direct to the trace page
                  window.open(`/trace/${batchId}`, "_blank");
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Generate Trace QR
            </button>
          </div>
        </div>
      ) : slug === "inventory" && user?.role === "RETAILER" ? (
        <div className="card bg-white p-8 border border-amber-200 shadow-sm mt-6">
          <h2 className="text-xl font-bold mb-4">Retail Point of Sale (Finalize Batch)</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Record the final sale to a consumer. This action permanently locks the batch on the blockchain, ensuring no further modifications can be made.
          </p>
          <div className="space-y-4">
             <input 
              type="text" 
              placeholder="Enter Batch ID (e.g. HC-2026-000127)" 
              className="border border-gray-300 rounded px-4 py-2 w-full"
              id="retailBatchId"
            />
            <input 
              type="text" 
              placeholder="Enter Consumer Bill / Invoice Number" 
              className="border border-gray-300 rounded px-4 py-2 w-full"
              id="retailBillNumber"
            />
            <button 
              onClick={async () => {
                const batchId = (document.getElementById('retailBatchId') as HTMLInputElement).value;
                const billNo = (document.getElementById('retailBillNumber') as HTMLInputElement).value;
                if(!batchId || !billNo) return alert("Please fill all fields");

                try {
                  const { getContractWithSigner } = await import("@/lib/blockchain");
                  const { ethers } = await import("ethers");
                  const contract = await getContractWithSigner();
                  
                  const exists = await contract.doesBatchExist(batchId);
                  if (!exists) {
                    alert(`❌ Batch "${batchId}" not found on blockchain!\n\nPlease first create this batch from the Beekeeper Dashboard.`);
                    return;
                  }

                  const batch = await contract.getBatch(batchId);
                  const signerAddress = await (await (new ethers.BrowserProvider((window as any).ethereum))).getSigner().then(s => s.getAddress());

                  if (Number(batch.status) === 6) {
                    alert(`⚠️ Batch "${batchId}" is ALREADY Completed/Locked on the blockchain!`);
                    return;
                  }

                  if (Number(batch.status) < 5) {
                    if (batch.currentOwner.toLowerCase() === signerAddress.toLowerCase()) {
                      alert(`Batch is currently in stage ${Number(batch.status)}. Advancing to Retail stage on blockchain...`);
                      const transferTx = await contract.transferBatch(batchId, signerAddress, 5); // 5 = SupplyChainStage.Retail
                      await transferTx.wait();
                    }
                  }

                  const billHash = ethers.id(billNo);
                  alert("Please approve the final sale transaction in MetaMask to permanently lock the batch.");
                  
                  const tx = await contract.completeRetailSale(batchId, billHash);
                  await tx.wait();
                  alert("🎉 Success! Consumer sale finalized on Blockchain. This batch is now permanently locked.");
                } catch(err: any) {
                  console.error(err);
                  alert("Failed to finalize: " + (err.reason || err.message));
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg w-full"
            >
              Finalize Sale on Blockchain
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-white p-12 text-center border-dashed border-2 border-amber-200">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Work in Progress</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            The <strong>{title}</strong> module for the <strong>{user?.role}</strong> portal is currently being connected to the blockchain smart contracts. Check back later!
          </p>
          
          <div className="mt-8 flex justify-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
               <span>🔗</span> Smart Contract Binding in Progress
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
