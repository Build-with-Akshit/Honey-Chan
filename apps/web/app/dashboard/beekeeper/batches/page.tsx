"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import Link from "next/link";
import { UniversalBatchTimeline } from "@/components/supply-chain/UniversalBatchTimeline";
import { Plus } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
            My Honey Batches
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Immutable blockchain records and QR verification passports
          </p>
        </div>
        <Link href="/dashboard/beekeeper/create" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--honey-600)] hover:bg-[var(--honey-700)] px-4 py-2 rounded-full transition-colors">
          <Plus size={14} />
          Create New Batch
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading batches from ledger...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)]">
          <p className="text-sm text-[var(--text-muted)]">No batches yet. Create your first batch to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <UniversalBatchTimeline
              key={batch.id}
              batch={batch}
              viewerRole="BEEKEEPER"
              variant="card"
              showMetadata
              showTxHash
              showVerify
              collapsible
            />
          ))}
        </div>
      )}
    </div>
  );
}
