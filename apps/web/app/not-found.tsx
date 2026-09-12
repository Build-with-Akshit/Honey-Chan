"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center animate-slide-up">
        {/* Big 404 */}
        <p className="font-[family-name:var(--font-outfit)] text-[120px] font-extrabold leading-none bg-gradient-to-br from-[var(--honey-400)] to-[var(--orange-600)] bg-clip-text text-transparent select-none">
          404
        </p>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)] mt-2">
          Page not found
        </h1>
        <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Double-check the URL or head back home.
        </p>

        {/* Search Hint */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--honey-50)] border border-[var(--honey-200)] rounded-[var(--radius-full)] text-xs text-[var(--honey-600)] font-semibold">
          <Search size={14} />
          Check the URL or navigate from the dashboard
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/" className="btn-primary px-6 py-2.5 text-sm">
            <Home size={16} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline px-6 py-2.5 text-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            Previous Page
          </button>
        </div>

        {/* Branding */}
        <div className="mt-12 pt-6 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] overflow-hidden shadow-sm border border-amber-500/30">
              <Image src="/favicon.png" alt="HoneyChain" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-secondary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
