"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HoneyChain] Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-slide-up">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-[var(--color-warning)]" />
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-[var(--text-primary)]">
          Portal Error
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto leading-relaxed">
          Something went wrong while loading this part of your dashboard.
        </p>

        {/* Error Details */}
        {error.message && (
          <div className="mt-5 p-3 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bug size={12} className="text-[var(--text-muted)]" />
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Error
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--color-danger)] break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[9px] font-mono text-[var(--text-muted)] mt-1.5">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="btn-primary px-5 py-2 text-sm cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
          <Link
            href="/dashboard/beekeeper"
            className="btn-outline px-5 py-2 text-sm"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <Link
            href="/"
            className="btn-ghost px-5 py-2 text-sm"
          >
            <Home size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
