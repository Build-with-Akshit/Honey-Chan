"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    honeyApi.getBatches().then(setBatches).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">National Honey Batch Registry</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Centralized blockchain ledger of all registered batches and verification statuses
        </p>
      </div>

      <div className="card overflow-hidden bg-white">
        <div className="divide-y divide-gray-100">
          {batches.map((batch) => (
            <div key={batch.id} className="p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-amber-50/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-800">{batch.batchId}</span>
                  <span className="badge badge-verified">{batch.status}</span>
                </div>
                <p className="text-xs text-gray-600">
                  {batch.honeyType} • {batch.quantityKg} KG • By {batch.beekeeperName} ({batch.originLocation})
                </p>
                <p className="font-mono text-[10px] text-gray-400">SHA-256: {batch.metadataHash}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <span className="text-gray-400 block text-[10px]">Trust Score</span>
                  <span className="font-bold text-amber-700">{batch.trustScore}/100</span>
                </div>
                <Link
                  href={`/verify/${batch.batchId}`}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Verify →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
