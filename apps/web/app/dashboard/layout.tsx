"use client";

/**
 * Dashboard layout — v2 responsive (architecture.md §3).
 * BEEKEEPER gets BOTH compositions, same tokens:
 *   < lg  : mobile app shell — 56px header + content + bottom tab bar
 *           with raised center Scan (design.md §4.2)
 *   ≥ lg  : desktop shell — 240px sidebar + topbar (wallet/network/lang)
 *           content up to max-w-[1100px]
 * Other roles keep the desktop sidebar at all sizes until Phase 3.
 * Auth redirect + wallet auto-link behavior unchanged (frozen backend).
 */

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/contracts";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import AppIcon, { type IconKey } from "@/components/icons/AppIcon";

/* ── Beekeeper nav (shared by mobile tabs + desktop sidebar, architecture.md §3) ── */
const BK_TABS: { icon: IconKey; path: string; key: string }[] = [
  { icon: "home", path: "/dashboard/beekeeper", key: "tab.home" },
  { icon: "hives", path: "/dashboard/beekeeper/hives", key: "tab.hives" },
  { icon: "scan", path: "/scan", key: "tab.scan" }, // mobile: center, raised
  { icon: "iot", path: "/dashboard/beekeeper/iot", key: "tab.iot" },
  { icon: "profile", path: "/dashboard/profile", key: "tab.profile" },
];



const NAV_ITEMS: Record<UserRole, { label: string; labelKey?: string; path: string; icon: string }[]> = {
  ADMIN: [
    { label: "Overview", path: "/dashboard/admin", icon: "📊" },
    { label: "Clusters", path: "/dashboard/admin/clusters", icon: "📍" },
    { label: "Beekeepers", path: "/dashboard/admin/beekeepers", icon: "🐝" },
    { label: "All Batches", path: "/dashboard/admin/batches", icon: "🍯" },
    { label: "Analytics", path: "/dashboard/admin/analytics", icon: "📈" },
  ],
  BEEKEEPER: [
    { label: "Overview", labelKey: "tab.home", path: "/dashboard/beekeeper", icon: "📊" },
    { label: "My Hives", labelKey: "tab.hives", path: "/dashboard/beekeeper/hives", icon: "🐝" },
    { label: "Honey Batches", labelKey: "tab.batches", path: "/dashboard/beekeeper/batches", icon: "🍯" },
    { label: "IoT Sensors", labelKey: "tab.iot", path: "/dashboard/beekeeper/iot", icon: "📡" },
    { label: "AI Advisory", labelKey: "tab.ai", path: "/dashboard/beekeeper/ai", icon: "🧠" },
    { label: "Scan QR", labelKey: "tab.scan", path: "/scan", icon: "📱" },
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
    { label: "Warehouse Stock", path: "/dashboard/supply-chain/warehouse", icon: "🏢" },
    { label: "In Transit", path: "/dashboard/supply-chain/transit", icon: "🚚" },
    { label: "Dispatch History", path: "/dashboard/supply-chain/dispatch", icon: "📤" },
  ],
  WHOLESALER: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Incoming Purchases", path: "/dashboard/supply-chain/purchases", icon: "🛒" },
    { label: "Warehouse Inventory", path: "/dashboard/supply-chain/inventory", icon: "🏢" },
    { label: "Retailer Transfers", path: "/dashboard/supply-chain/transfers", icon: "🔄" },
  ],
  RETAILER: [
    { label: "Overview", path: "/dashboard/supply-chain", icon: "📊" },
    { label: "Incoming Shipments", path: "/dashboard/supply-chain/received", icon: "📦" },
    { label: "Store Inventory", path: "/dashboard/supply-chain/inventory", icon: "🏪" },
    { label: "Sold Products", path: "/dashboard/supply-chain/sold", icon: "💰" },
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
  const { language, setLanguage, cycleLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isBeekeeper = user?.role === "BEEKEEPER";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Auto-link wallet and guarantee on-chain role authorization (frozen behavior)
  useEffect(() => {
    if (wallet.isConnected && wallet.address && user) {
      if (!user.walletAddress || user.walletAddress.toLowerCase() !== wallet.address.toLowerCase()) {
        linkWallet(wallet.address).catch(console.error);
      }
    }
  }, [wallet.isConnected, wallet.address, user?.walletAddress, linkWallet]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!user) return;
    const items = NAV_ITEMS[user.role as UserRole] || [];
    if (items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.altKey && !e.getModifierState?.("AltGraph") && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

      const isAltPressed =
        e.altKey ||
        (e.getModifierState && e.getModifierState("AltGraph")) ||
        (e.getModifierState && e.getModifierState("Alt"));

      if (isAltPressed) {
        if (e.key === "`" || e.code === "Backquote") {
          e.preventDefault();
          router.push("/");
          return;
        }
        if (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0") {
          e.preventDefault();
          router.push("/dashboard/profile");
          return;
        }
        if (e.key === "ArrowDown" || e.code === "ArrowDown") {
          e.preventDefault();
          const currentIndex = items.findIndex((item) => item.path === pathname);
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
          router.push(items[nextIndex].path);
          return;
        }
        if (e.key === "ArrowUp" || e.code === "ArrowUp") {
          e.preventDefault();
          const currentIndex = items.findIndex((item) => item.path === pathname);
          const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + items.length) % items.length;
          router.push(items[prevIndex].path);
          return;
        }

        let digit = -1;
        if (!isNaN(Number(e.key)) && e.key.trim() !== "") {
          digit = parseInt(e.key);
        } else if (e.code && e.code.startsWith("Digit")) {
          digit = parseInt(e.code.replace("Digit", ""));
        } else if (e.code && e.code.startsWith("Numpad")) {
          digit = parseInt(e.code.replace("Numpad", ""));
        }
        if (digit > 0 && digit <= items.length) {
          e.preventDefault();
          router.push(items[digit - 1].path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, router, pathname]);

  /* ── Loading: skeleton (design.md §5.8) ── */
  if (isLoading || !user) {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col justify-center px-4" aria-busy="true">
        <div className="skeleton h-8 w-40" />
        <div className="card mt-4 space-y-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-2/3" />
        </div>
      </div>
    );
  }


  /* ═══════════ Desktop roles: sidebar (until Phase 3) ═══════════ */
  const navItems = NAV_ITEMS[user.role] || [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-[72px]"
        } sidebar fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col md:relative md:z-0 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: "var(--line)" }}>
          <div
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-sm border border-amber-500/30 bg-amber-500/10"
            title={!sidebarOpen ? "Home (Alt + `)" : undefined}
            onClick={() => router.push("/")}
          >
            <Image
              src="/favicon.png"
              alt="HoneyChain Logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          {sidebarOpen && (
            <div className="cursor-pointer" onClick={() => router.push("/")}>
              <h1 className="text-lg font-bold leading-tight">{t("app.name")}</h1>
              <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
                {user.role === "BEEKEEPER" ? t("dashboardTitle") : ROLE_NAMES[user.role]}
              </p>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="border-b p-4" style={{ borderColor: "var(--line)" }}>
          <Link
            href="/dashboard/profile"
            title={!sidebarOpen ? `Profile - ${user.name} (Alt + 0)` : undefined}
            className="-m-2 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-[var(--line)] hover:bg-[var(--bg-muted)]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center text-lg font-bold"
              style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-md)" }}
            >
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name}</p>
                {user.walletAddress ? (
                  <div
                    className="mt-1 flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
                  >
                    <AppIcon name="check" size={12} ariaLabel="" /> On-Chain Linked
                  </div>
                ) : (
                  <div
                    className="mt-1 flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ borderColor: "var(--line)", color: "var(--ink-mute)" }}
                  >
                    <AppIcon name="pending" size={12} ariaLabel="" /> No Wallet Linked
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const label = item.labelKey ? t(item.labelKey) : item.label;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={!sidebarOpen ? label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive ? "font-bold" : "font-medium"
                }`}
                style={
                  isActive
                    ? { background: "var(--bg-muted)", color: "var(--ink)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                <span className="text-lg" aria-hidden>{item.icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="border-t p-4" style={{ borderColor: "var(--line)" }}>
          {sidebarOpen ? (
            <div className="flex gap-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors"
                style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              >
                Collapse
              </button>
              <button
                onClick={logout}
                className="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors"
                style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full rounded-lg border bg-white py-2 transition-all"
              style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              title="Expand Sidebar (Ctrl + \)"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md shadow-xs"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
              style={{ color: "var(--ink-soft)" }}
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {user.role === "BEEKEEPER" ? t("dashboardTitle") : ROLE_NAMES[user.role]}
            </h1>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50/90 text-xs font-medium text-gray-700">
              <span className="text-gray-500">{t("iotActive")}:</span>
              {wallet.isConnected ? (
                wallet.isCorrectNetwork ? (
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sepolia
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Wrong Network
                  </span>
                )
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Disconnected
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => cycleLanguage()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs shrink-0"
              aria-label={t("language")}
            >
              <AppIcon name="language" size={15} ariaLabel="" />
              <span>{t("lang.toggle")}</span>
            </button>
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 shrink-0">
                {!wallet.isCorrectNetwork && (
                  <button
                    onClick={wallet.switchNetwork}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                  >
                    <AppIcon name="warn" size={14} ariaLabel="" /> Switch Network
                  </button>
                )}
                <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-mono font-semibold text-gray-800 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{wallet.shortAddress}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                {wallet.error && (
                  <span
                    className="hidden sm:inline-block max-w-[140px] truncate rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700"
                    title={wallet.error}
                  >
                    {wallet.error}
                  </span>
                )}
                <button
                  onClick={() => {
                    if (!wallet.hasMetaMask) {
                      window.open("https://metamask.io/download/", "_blank");
                    } else {
                      wallet.connect();
                    }
                  }}
                  disabled={wallet.isConnecting}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 text-xs font-bold text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer border border-amber-600/30"
                >
                  <AppIcon name="wallet" size={15} ariaLabel="" />
                  <span>{wallet.isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className={`flex-1 overflow-auto p-4 sm:p-6 lg:p-8 ${isBeekeeper ? "pb-20 md:pb-8" : ""}`}>
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Beekeeper quick-access on mobile) */}
      {isBeekeeper && (
        <nav
          className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-gray-200 bg-white/95 backdrop-blur-md px-2 md:hidden shadow-lg"
          aria-label={t("dashboardTitle")}
        >
          {BK_TABS.map((tab) => {
            const isActive = tab.path === "/dashboard/beekeeper" ? pathname === tab.path : pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <AppIcon name={tab.icon} size={20} ariaLabel="" />
                <span>{t(tab.key)}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
