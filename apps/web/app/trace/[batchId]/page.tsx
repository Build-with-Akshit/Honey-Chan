"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { getContract } from "@/lib/blockchain";

export default function TracePage() {
  const { batchId } = useParams();
  const [batchData, setBatchData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create full URL for QR code
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    async function fetchBlockchainData() {
      if (!batchId) return;
      try {
        setLoading(true);
        const contract = getContract();
        
        // Ensure batch exists
        const exists = await contract.doesBatchExist(batchId);
        if (!exists) {
          setError("Batch not found on the blockchain.");
          return;
        }

        const batch = await contract.getBatch(batchId);
        const batchHistory = await contract.getBatchHistory(batchId);

        setBatchData(batch);
        setHistory(batchHistory);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch blockchain data.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlockchainData();
  }, [batchId]);

  if (loading) return <div className="p-10 text-center">Loading blockchain data...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  const STATUS_LABELS = [
    "Created", "Harvested", "Processing", "Quality Tested", 
    "Distributed", "Retail", "Completed"
  ];
  const currentStatus = STATUS_LABELS[Number(batchData?.status)] || "Unknown";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-600 mb-2">Honey Traceability</h1>
        <p className="text-gray-500">Transparent Supply Chain Verification</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-100 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">Batch Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-semibold text-gray-600">Batch ID:</div>
            <div className="font-mono">{batchId}</div>
            
            <div className="font-semibold text-gray-600">Beekeeper:</div>
            <div className="font-mono text-xs truncate">{batchData?.beekeeper}</div>
            
            <div className="font-semibold text-gray-600">Quantity:</div>
            <div>{Number(batchData?.quantity)} grams</div>
            
            <div className="font-semibold text-gray-600">Status:</div>
            <div className="font-bold text-green-600">{currentStatus}</div>
            
            <div className="font-semibold text-gray-600">Quality Passed:</div>
            <div>{batchData?.qualityPassed ? "✅ Yes" : "❌ No"}</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <QRCodeSVG value={currentUrl} size={150} />
          <p className="mt-4 text-xs text-center text-gray-500 max-w-[200px]">
            Scan this QR code on the physical bottle to verify authenticity.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-100">
        <h2 className="text-2xl font-semibold mb-6">Supply Chain History (Blockchain)</h2>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {history.map((event, index) => {
            const date = new Date(Number(event.timestamp) * 1000).toLocaleString();
            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-yellow-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  ✓
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">Stage: {Number(event.stage)}</div>
                    <time className="text-xs text-slate-500">{date}</time>
                  </div>
                  <div className="text-slate-500 text-xs font-mono break-all mt-2">
                    Actor: {event.actor}
                  </div>
                  {event.dataHash && event.dataHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                    <div className="text-slate-500 text-xs mt-2 truncate text-ellipsis">
                      <span className="font-semibold text-gray-600">Data Hash: </span> 
                      {event.dataHash}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {currentStatus === "Completed" && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-green-800 text-center font-bold">
          Retail Sale Completed. This batch is finalized on the blockchain.
        </div>
      )}
    </div>
  );
}
