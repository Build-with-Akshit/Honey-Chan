import { useState } from "react";
import { honeyApi } from "@/lib/api";
import { BatchTable } from "./page"; // Reusing the table from [...slug]/page.tsx

export function LabTestingPage({ batches, user, onRefresh }: { batches: any[]; user: any; onRefresh: () => void }) {
  const [testModal, setTestModal] = useState<{ open: boolean; batch: any }>({ open: false, batch: null });
  const [file, setFile] = useState<File | null>(null);
  const [passed, setPassed] = useState(true);
  const [uploading, setUploading] = useState(false);

  const pendingBatches = batches.filter(
    (b) => b.events?.[b.events.length - 1]?.stage === "PENDING_TRANSFER" && b.events[b.events.length - 1].actorId === user.id || (b.status === "PROCESSING" && b.events[b.events.length-1]?.actorId === user.id)
  );

  const handleTestSubmit = async () => {
    if (!testModal.batch || !file) return alert("Please select a PDF report to upload");

    setUploading(true);
    try {
      // 1. Upload to Pinata / IPFS
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batchId", testModal.batch.batchId);

      const uploadRes = await fetch("/api/quality/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to IPFS");
      const uploadData = await uploadRes.json();
      const ipfsHash = uploadData.ipfsHash;

      // 2. Submit to Blockchain
      const { getContractWithSigner } = await import("@/lib/blockchain");
      const contract = await getContractWithSigner();
      
      alert("Please approve the QUALITY TEST transaction in MetaMask.");
      // Blockchain expects a bytes32 hash, we can use the IPFS CID or a hash of it
      // Let's just use the first 31 chars of the CID as a demo, or keccak256 it
      const { ethers } = await import("ethers");
      const reportHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));

      const tx = await contract.submitQualityTest(testModal.batch.batchId, reportHashBytes32, passed);
      await tx.wait();

      // 3. Update Database
      await fetch(`/api/batches/${testModal.batch.batchId}/quality`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipfsHash,
          txHash: tx.hash,
          passed,
          reportUrl: uploadData.url
        }),
      });

      alert(`✅ Quality Test Recorded! CID: ${ipfsHash}`);
      setTestModal({ open: false, batch: null });
      setFile(null);
      onRefresh();

    } catch (err: any) {
      console.error(err);
      alert("Test submission failed: " + (err.reason || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🧪 Lab Quality Testing
        </h1>
        <p className="text-sm text-gray-500 mt-1">Upload IPFS Lab Reports and certify batches.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="divide-y divide-gray-100">
          {pendingBatches.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No batches awaiting testing.</div>
          ) : (
            pendingBatches.map((batch: any) => (
               <div key={batch.id} className="p-5 flex justify-between items-center">
                 <div>
                   <span className="font-mono text-sm font-bold text-amber-800">{batch.batchId}</span>
                   <p className="text-xs text-gray-500">Flora: {batch.honeyType} | Qty: {batch.quantity}</p>
                 </div>
                 <button 
                   onClick={() => setTestModal({ open: true, batch })}
                   className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
                 >
                   Upload Lab Report
                 </button>
               </div>
            ))
          )}
         </div>
      </div>

      {testModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Submit Lab Test for {testModal.batch?.batchId}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Result</label>
                <select 
                  className="w-full border rounded p-2 text-sm"
                  value={passed ? "PASS" : "FAIL"}
                  onChange={e => setPassed(e.target.value === "PASS")}
                >
                  <option value="PASS">✅ PASSED (Meets FSSAI Standards)</option>
                  <option value="FAIL">❌ FAILED (Adulteration Detected)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold mb-1">Upload PDF Report (IPFS)</label>
                <input 
                  type="file" 
                  accept="application/pdf,image/*" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border p-2 rounded"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setTestModal({ open: false, batch: null })} className="flex-1 p-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={handleTestSubmit} disabled={uploading || !file} className="flex-1 p-2 bg-purple-600 text-white rounded disabled:opacity-50">
                  {uploading ? "Uploading to IPFS..." : "Submit to Blockchain"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
