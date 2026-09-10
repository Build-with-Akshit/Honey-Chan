"use client";

import { useBlockchainStatus } from "@/hooks/useBlockchainStatus";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function BlockchainIndicator() {
  const { reachable, mode, loading, lastChecked, refresh } = useBlockchainStatus(30_000);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={refresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[var(--radius-full)] border transition-all cursor-pointer disabled:opacity-50"
        title={reachable
          ? `On-chain · ${lastChecked ? `checked ${lastChecked.toLocaleTimeString()}` : ""}`
          : `DB-only mode · ${lastChecked ? `checked ${lastChecked.toLocaleTimeString()}` : ""}`
        }
        style={{
          backgroundColor: reachable ? "var(--color-success-bg)" : "var(--color-warning-bg)",
          color: reachable ? "var(--color-success)" : "var(--color-warning)",
          borderColor: reachable ? "var(--color-success-border)" : "var(--color-warning-border)",
        }}
      >
        {loading ? (
          <RefreshCw size={12} className="animate-spin" />
        ) : reachable ? (
          <Wifi size={12} />
        ) : (
          <WifiOff size={12} />
        )}
        <span className="hidden sm:inline">
          {loading ? "Checking..." : reachable ? "Chain Live" : "Chain Offline"}
        </span>
      </button>
    </div>
  );
}
