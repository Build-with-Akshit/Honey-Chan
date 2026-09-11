"use client";

import Link from "next/link";
import { Home, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-slide-up">
        {/* Big 404 */}
        <p className="font-[family-name:var(--font-outfit)] text-[80px] font-extrabold leading-none bg-gradient-to-br from-[var(--honey-400)] to-[var(--orange-600)] bg-clip-text text-transparent select-none">
          404
        </p>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-[var(--text-primary)] mt-2">
          Page not found in portal
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto leading-relaxed">
          This portal route doesn&apos;t exist. Navigate from the sidebar or
          return to your dashboard.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href="/dashboard/beekeeper" className="btn-primary px-5 py-2 text-sm">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline px-5 py-2 text-sm cursor-pointer"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
          <Link href="/" className="btn-ghost px-5 py-2 text-sm">
            <Home size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
