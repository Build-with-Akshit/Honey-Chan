"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { honeyApi } from "@/lib/api";
import { UniversalBatchTimeline } from "@/components/supply-chain/UniversalBatchTimeline";
import { Package } from "lucide-react";

export default function GenericBeekeeperPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = pathname.split("/").pop() || "overview";
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  useEffect(() => {
    honeyApi
      .getBatches()
      .then(setBatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Manage your {title.toLowerCase()} operations and blockchain records.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)]">
          <Package size={24} className="text-[var(--text-muted)] mx-auto mb-3" />
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
