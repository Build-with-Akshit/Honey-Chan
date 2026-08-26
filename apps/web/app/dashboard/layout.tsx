"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/contracts";
import Link from "next/link";

const NAV_ITEMS: Record<UserRole, { label: string; path: string; icon: string }[]> = {
  ADMIN: [
    { label: "Overview", path: "/dashboard/admin", icon: "📊" },
    { label: "Beekeepers", path: "/dashboard/admin/beekeepers", icon: "🐝" },
    { label: "Clusters", path: "/dashboard/admin/clusters", icon: "📍" },
    { label: "All Batches", path: "/dashboard/admin/batches", icon: "🍯" },
    { label: "Analytics", path: "/analytics", icon: "📈" },
  ],
  BEEKEEPER: [
    { label: "Overview", path: "/dashboard/beekeeper", icon: "📊" },
    { label: "My Hives", path: "/dashboard/beekeeper/hives", icon: "🐝" },
    { label: "Create Batch", path: "/dashboard/beekeeper/create", icon: "➕" },
    { label: "My Batches", path: "/dashboard/beekeeper/batches", icon: "🍯" },
    { label: "IoT Monitor", path: "/dashboard/beekeeper/iot", icon: "📡" },
    { label: "AI Insights", path: "/dashboard/beekeeper/ai", icon: "🧠" },
  ],
  PROCESSOR: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Incoming Raw Honey", path: "/dashboard/supply-chain/incoming", icon: "📦" },
    { label: "Processing Queue", path: "/dashboard/supply-chain/processing", icon: "🏭" },
    { label: "Processed Batches", path: "/dashboard/supply-chain/processed", icon: "🍯" },
  ],
  LAB: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Pending Tests", path: "/dashboard/supply-chain/pending", icon: "🧪" },
    { label: "Test Results", path: "/dashboard/supply-chain/results", icon: "📋" },
    { label: "Certificates", path: "/dashboard/supply-chain/certificates", icon: "🎓" },
  ],
  DISTRIBUTOR: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Incoming Shipments", path: "/dashboard/supply-chain/incoming", icon: "📦" },
    { label: "Transit", path: "/dashboard/supply-chain/transit", icon: "🚚" },
    { label: "Warehouse", path: "/dashboard/supply-chain/warehouse", icon: "🏢" },
    { label: "Dispatch", path: "/dashboard/supply-chain/dispatch", icon: "📤" },
  ],
  WHOLESALER: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Purchases", path: "/dashboard/supply-chain/purchases", icon: "🛒" },
    { label: "Inventory", path: "/dashboard/supply-chain/inventory", icon: "📦" },
    { label: "Retailer Transfers", path: "/dashboard/supply-chain/transfers", icon: "🔄" },
  ],
  RETAILER: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Received Stock", path: "/dashboard/supply-chain/received", icon: "🏪" },
    { label: "Store Inventory", path: "/dashboard/supply-chain/inventory", icon: "📦" },
    { label: "Products Sold", path: "/dashboard/supply-chain/sold", icon: "💰" },
  ],
  NONE: [],
};

const ROLE_NAMES: Record<UserRole, string> = {
  ADMIN: "Admin Console",
  BEEKEEPER: "Beekeeper Portal",
  PROCESSOR: "Factory / Processor",
  LAB: "Quality Lab",
  DISTRIBUTOR: "Distributor",
  WHOLESALER: "Wholesaler",
  RETAILER: "Retailer",
  NONE: "",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, linkWallet } = useAuth();
  const wallet = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // If user connects wallet and they don't have one linked in DB, link it automatically
  useEffect(() => {
    if (wallet.isConnected && wallet.address && user && !user.walletAddress) {
      linkWallet(wallet.address).catch(console.error);
    }
  }, [wallet.isConnected, wallet.address, user, linkWallet]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your portal...</p>
        </div>
      </div>
    );
  }

  const navItems = NAV_ITEMS[user.role] || [];

  return (
    <div className="min-h-screen flex bg-amber-50/20">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-[72px]"} transition-all duration-300 sidebar flex flex-col shrink-0 bg-white border-r border-amber-100 shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-amber-100/50 flex items-center gap-3">
          <span className="text-2xl cursor-pointer" onClick={() => router.push("/")}>🍯</span>
          {sidebarOpen && (
            <div className="cursor-pointer" onClick={() => router.push("/")}>
              <h1 className="text-lg font-bold text-amber-900 leading-tight">HoneyChain</h1>
              <p className="text-[10px] text-amber-600 uppercase tracking-widest font-semibold">{ROLE_NAMES[user.role]}</p>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="p-4 border-b border-amber-100/50">
          <Link href="/dashboard/profile" className="flex items-center gap-3 hover:bg-amber-50 p-2 -m-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-amber-900 transition-colors">{user.name}</p>

                {user.walletAddress ? (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mt-1 w-fit">
                    <span>🔵⭐</span> On-Chain Linked
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 mt-1 w-fit">
                    <span>⚪</span> No Wallet Linked
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                    ? "bg-amber-100/60 text-amber-900 font-bold shadow-sm"
                    : "text-gray-600 font-medium hover:text-amber-800 hover:bg-amber-50"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-amber-100/50 bg-amber-50/30">
          {sidebarOpen ? (
            <div className="flex gap-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex-1 py-1.5 text-xs font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm"
              >
                Collapse
              </button>
              <button
                onClick={logout}
                className="flex-1 py-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-100 rounded-lg transition-colors shadow-sm"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white shadow-sm"
            >
              »
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <span className="text-sm font-semibold text-gray-700">HoneyChain Net:</span>
          </div>

          <div className="flex items-center gap-4">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                {wallet.isCorrectNetwork ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Sepolia Linked
                  </div>
                ) : (
                  <button
                    onClick={wallet.switchNetwork}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                  >
                    ⚠️ Switch Network
                  </button>
                )}
                <div className="font-mono text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm flex items-center gap-2">
                  <span className="text-[10px]">🦊</span>
                  {wallet.shortAddress}
                </div>
              </div>
            ) : (
              <button
                onClick={wallet.connect}
                className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-900 px-4 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <span>🦊</span> Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
