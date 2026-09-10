"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { honeyApi } from "@/lib/api";
import { UniversalBatchTimeline } from "@/components/supply-chain/UniversalBatchTimeline";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";

const ROLE_TITLES: Record<string, string> = {
  PROCESSOR: "Processor Operations",
  LAB: "Lab Testing Dashboard",
  DISTRIBUTOR: "Distribution Management",
  WHOLESALER: "Wholesale Inventory",
  RETAILER: "Retail Operations",
};

export default function GenericSupplyChainPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = pathname.split("/").pop() || "overview";
  const title = ROLE_TITLES[user?.role || ""] || slug.charAt(0).toUpperCase() + slug.slice(1);

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
          {user?.role} portal — manage your supply chain operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4">
          <Package size={16} className="text-[var(--honey-600)] mb-2" />
          <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Total Batches</p>
          <p className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>{batches.length}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4">
          <div className="w-4 h-4 rounded-full bg-[var(--color-success)] mb-2" />
          <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Verified</p>
          <p className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>{batches.filter((b) => b.status === "RETAIL" || b.status === "Verified").length}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4">
          <div className="w-4 h-4 rounded-full bg-[var(--color-warning)] mb-2" />
          <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">In Progress</p>
          <p className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>{batches.filter((b) => !["RETAIL", "Verified"].includes(b.status)).length}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4">
          <div className="w-4 h-4 rounded-full bg-[var(--color-info)] mb-2" />
          <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">This Week</p>
          <p className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>{batches.length}</p>
        </div>
      </div>

      {/* Batch List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)]">
          <Package size={24} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">No batches in the system yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <UniversalBatchTimeline
              key={batch.id}
              batch={batch}
              viewerRole={user?.role}
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
