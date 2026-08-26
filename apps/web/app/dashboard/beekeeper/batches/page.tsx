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
      ) : (
        <div className="card overflow-hidden bg-white">
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <div key={batch.id} className="p-5 hover:bg-amber-50/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-800">{batch.batchId}</span>
                    <span className="badge badge-verified text-[10px]">
                      {batch.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/verify/${batch.batchId}`}
                      className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Verify QR 📱
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600 mt-3">
                  <div>
                    <span className="text-gray-400">Honey Flora:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.honeyType}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Harvest Quantity:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.quantityKg} KG</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Source Hive:</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{batch.hiveCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Trust Score:</span>
                    <p className="font-bold text-amber-700 mt-0.5">{batch.trustScore}/100</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-mono truncate max-w-[280px]">Tx: {batch.blockchainTx}</span>
                  <span>Harvested: {batch.harvestDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
