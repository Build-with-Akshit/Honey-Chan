"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HoneyChain] Global error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center animate-slide-up">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-[var(--color-danger)]" />
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-[var(--text-primary)]">
          Something went wrong
        </h1>
        <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto leading-relaxed">
          An unexpected error occurred while loading this page. Our system has
          logged the issue for investigation.
        </p>

        {/* Error Details */}
        {error.message && (
          <div className="mt-6 p-4 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[var(--radius-lg)] text-left">
            <div className="flex items-center gap-2 mb-2">
              <Bug size={14} className="text-[var(--text-muted)]" />
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Error Details
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--color-danger)] break-all leading-relaxed">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-[var(--text-muted)] mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            onClick={reset}
            className="btn-primary px-6 py-2.5 text-sm cursor-pointer"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-outline px-6 py-2.5 text-sm cursor-pointer"
          >
            <Home size={16} />
            Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost px-6 py-2.5 text-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
