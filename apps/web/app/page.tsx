"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isLoading, logout } = useAuth();

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-gray-800">
      {/* Gentle background glow */}
      <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-[-100px] w-[350px] h-[350px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍯</span>
          <span className="font-bold text-lg text-amber-900">HoneyChain</span>
        </div>
        <div>
          {!isLoading && user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium"
              >
                Logout
              </button>
            </div>
          ) : !isLoading ? (
            <div className="flex gap-3">
              <Link
                href="/marketplace"
                className="px-4 py-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            From Hive to Home, <span className="gradient-text">Verified.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium mt-4">
            Blockchain Traceability • Smart Beekeeping
          </p>
        </div>

        {/* Dashboard Access */}
        {!isLoading && user ? (
          <div className="text-center mb-16">
            <Link
              href={
                user.role === "BEEKEEPER" ? "/dashboard/beekeeper" :
                  user.role === "ADMIN" ? "/dashboard/admin" :
                    "/dashboard/supply-chain"
              }
              className="inline-flex flex-col items-center p-8 bg-white border border-amber-200 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:border-amber-400 transition-all group"
            >
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-center">
                {user.role === "BEEKEEPER" ? "🐝" : user.role === "ADMIN" ? "🏛️" : "🏭"}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue to Dashboard</h2>
              <p className="text-sm text-gray-500 mb-6">Access your {user.role.toLowerCase()} operations</p>
              <div className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg shadow-sm group-hover:bg-amber-600 transition-colors w-full text-center">
                Enter Portal →
              </div>
            </Link>
          </div>
        ) : !isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">

            {/* Beekeeper Portal */}
            <Link
              href="/login"
              className="card p-8 border-amber-200 bg-white hover:border-amber-400 hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex flex-col h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">🐝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Beekeeper Portal</h2>
                <p className="text-sm text-gray-500 flex-grow mb-6">
                  IoT • AI • Hives<br />
                  Harvest • Batches
                </p>
                <div className="flex justify-between items-center text-amber-600 font-bold text-sm border-t border-gray-100 pt-4">
                  <span>Enter Portal</span>
                  <span>→</span>
                </div>
              </div>
            </Link>

            {/* Supply Chain Portal */}
            <Link
              href="/login"
              className="card p-8 border-orange-200 bg-white hover:border-orange-400 hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex flex-col h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">🏭</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Supply Chain Portal</h2>
                <p className="text-sm text-gray-500 flex-grow mb-6">
                  Factory • Lab • Distributor<br />
                  Wholesaler • Retailer
                </p>
                <div className="flex justify-between items-center text-orange-600 font-bold text-sm border-t border-gray-100 pt-4">
                  <span>Enter Portal</span>
                  <span>→</span>
                </div>
              </div>
            </Link>

          </div>
        ) : (
          <div className="h-64 flex items-center justify-center mb-16">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Verify a Honey Product */}
        <div className="text-center">
          <div className="inline-block p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <span>🔍</span> Verify a Honey Product
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-sm">
              Consumers can instantly verify the authenticity and entire supply chain journey of their honey. No account needed.
            </p>
            <Link
              href="/verify/HC-2026-000127"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              Scan / Enter QR
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-gray-400 border-t border-amber-100 pt-6">
          <p className="font-medium text-gray-500">
            Honey Chain • Digital Ecosystem for Rural Beekeepers & Consumer Trust
          </p>
          <p className="mt-1 text-gray-400">
            Khadi and Village Industries Commission (KVIC) • Ministry of Micro, Small & Medium Enterprises
          </p>
        </div>
      </div>
    </main>
  );
}
