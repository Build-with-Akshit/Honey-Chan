"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { UniversalBatchTimeline } from "@/components/supply-chain/UniversalBatchTimeline";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    honeyApi.getBatches().then(setBatches).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          National Honey Batch Registry
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Centralized blockchain ledger of all registered batches
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading registry...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <UniversalBatchTimeline
              key={batch.id}
              batch={batch}
              viewerRole="ADMIN"
              variant="timeline"
              showMetadata
              showTxHash
              showVerify
            />
          ))}
        </div>
      )}
    </div>
  );
}
