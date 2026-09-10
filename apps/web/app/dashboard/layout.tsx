"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { UserRole } from "@/lib/contracts";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BlockchainIndicator } from "@/components/ui/BlockchainIndicator";
import { AlertBell } from "@/components/ui/AlertBell";
import {
  LayoutDashboard,
  Box,
  Plus,
  FlaskConical,
  Radio,
  Brain,
  Users,
  MapPin,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Wallet,
  Bell,
  ChevronDown,
  Truck,
  Package,
  Store,
  ShoppingCart,
  FileText,
  ClipboardCheck,
  Warehouse,
  Send,
  Receipt,
  Compass,
  Stethoscope,
  Coins,
  Building,
  Tag,
  Globe,
  Sparkles,
} from "lucide-react";

/* ─── Icon Mapping ─── */

const NAV_ICONS: Record<string, React.ReactNode> = {
  Overview: <LayoutDashboard size={18} />,
  "My Hives": <Box size={18} />,
  "Create Batch": <Plus size={18} />,
  "My Batches": <FlaskConical size={18} />,
  "IoT Monitor": <Radio size={18} />,
  "AI Insights": <Brain size={18} />,
  "Mobile Processing Van": <Truck size={18} />,
  "Flora & Migration": <Compass size={18} />,
  "Bee Doctor (Diseases)": <Stethoscope size={18} />,
  "Mandi & Fair Price": <Coins size={18} />,
  "KVIC Schemes": <Building size={18} />,
  "Print QR Labels": <Tag size={18} />,
  Beekeepers: <Users size={18} />,
  Clusters: <MapPin size={18} />,
  "All Batches": <FlaskConical size={18} />,
  Analytics: <BarChart3 size={18} />,
  "Incoming Raw Honey": <Package size={18} />,
  "Processing Queue": <Warehouse size={18} />,
  "Processed Batches": <FlaskConical size={18} />,
  "Pending Tests": <ClipboardCheck size={18} />,
  "Test Results": <FileText size={18} />,
  Certificates: <FileText size={18} />,
  "Incoming Shipments": <Package size={18} />,
  Transit: <Truck size={18} />,
  Warehouse: <Warehouse size={18} />,
  Dispatch: <Send size={18} />,
  Purchases: <ShoppingCart size={18} />,
  Inventory: <Box size={18} />,
  "Retailer Transfers": <Truck size={18} />,
  "Received Stock": <Store size={18} />,
  "Store Inventory": <Box size={18} />,
  "Products Sold": <Receipt size={18} />,
};

/* ─── Nav Items by Role ─── */

const NAV_ITEMS_BY_ROLE: Record<UserRole, { labelEn: string; labelHi: string; iconKey: string; path: string }[]> = {
  ADMIN: [
    { labelEn: "Overview", labelHi: "डैशबोर्ड अवलोकन", iconKey: "Overview", path: "/dashboard/admin" },
    { labelEn: "Beekeepers", labelHi: "पालक सूची", iconKey: "Beekeepers", path: "/dashboard/admin/beekeepers" },
    { labelEn: "Clusters", labelHi: "क्लस्टर प्रबंधन", iconKey: "Clusters", path: "/dashboard/admin/clusters" },
    { labelEn: "All Batches", labelHi: "सभी शहद बैच", iconKey: "All Batches", path: "/dashboard/admin/batches" },
    { labelEn: "Analytics", labelHi: "आंकड़े एवं रिपोर्ट", iconKey: "Analytics", path: "/dashboard/admin/analytics" },
  ],
  BEEKEEPER: [
    { labelEn: "Overview", labelHi: "डैशबोर्ड अवलोकन", iconKey: "Overview", path: "/dashboard/beekeeper" },
    { labelEn: "Mobile Processing Van", labelHi: "🚚 मोबाइल प्रोसेसिंग वैन", iconKey: "Mobile Processing Van", path: "/dashboard/beekeeper/processing-van" },
    { labelEn: "Flora & Migration", labelHi: "🌸 फूल एवं प्रवास", iconKey: "Flora & Migration", path: "/dashboard/beekeeper/flora-calendar" },
    { labelEn: "Bee Doctor (Diseases)", labelHi: "🩺 मधुमक्खी डॉक्टर", iconKey: "Bee Doctor (Diseases)", path: "/dashboard/beekeeper/disease-guide" },
    { labelEn: "Mandi & Fair Price", labelHi: "💰 मंडी भाव व लाभ", iconKey: "Mandi & Fair Price", path: "/dashboard/beekeeper/fair-pricing" },
    { labelEn: "KVIC Schemes", labelHi: "🏛️ सरकारी योजनाएं", iconKey: "KVIC Schemes", path: "/dashboard/beekeeper/kvic-schemes" },
    { labelEn: "Print QR Labels", labelHi: "🏷️ शीशी के क्यूआर लेबल", iconKey: "Print QR Labels", path: "/dashboard/beekeeper/qr-labels" },
    { labelEn: "My Hives", labelHi: "मेरे बी-बॉक्सेस", iconKey: "My Hives", path: "/dashboard/beekeeper/hives" },
    { labelEn: "Create Batch", labelHi: "नया बैच दर्ज करें", iconKey: "Create Batch", path: "/dashboard/beekeeper/create" },
    { labelEn: "My Batches", labelHi: "मेरे शहद बैच", iconKey: "My Batches", path: "/dashboard/beekeeper/batches" },
    { labelEn: "IoT Monitor", labelHi: "आईओटी सेंसर", iconKey: "IoT Monitor", path: "/dashboard/beekeeper/iot" },
    { labelEn: "AI Insights", labelHi: "एआई सलाह", iconKey: "AI Insights", path: "/dashboard/beekeeper/ai" },
  ],
  PROCESSOR: [
    { labelEn: "Overview", labelHi: "अवलोकन", iconKey: "Overview", path: "/dashboard/supply-chain" },
    { labelEn: "Incoming Raw Honey", labelHi: "आगत कच्चा शहद", iconKey: "Incoming Raw Honey", path: "/dashboard/supply-chain/incoming" },
    { labelEn: "Processing Queue", labelHi: "प्रोसेसिंग कतार", iconKey: "Processing Queue", path: "/dashboard/supply-chain/processing" },
    { labelEn: "Processed Batches", labelHi: "तैयार बैच", iconKey: "Processed Batches", path: "/dashboard/supply-chain/processed" },
  ],
  LAB: [
    { labelEn: "Overview", labelHi: "अवलोकन", iconKey: "Overview", path: "/dashboard/supply-chain" },
    { labelEn: "Pending Tests", labelHi: "परीक्षण कतार", iconKey: "Pending Tests", path: "/dashboard/supply-chain/pending" },
    { labelEn: "Test Results", labelHi: "जांच परिणाम", iconKey: "Test Results", path: "/dashboard/supply-chain/results" },
    { labelEn: "Certificates", labelHi: "प्रमाण पत्र", iconKey: "Certificates", path: "/dashboard/supply-chain/certificates" },
  ],
  DISTRIBUTOR: [
    { labelEn: "Overview", labelHi: "अवलोकन", iconKey: "Overview", path: "/dashboard/supply-chain" },
    { labelEn: "Incoming Shipments", labelHi: "आगत खेप", iconKey: "Incoming Shipments", path: "/dashboard/supply-chain/incoming" },
    { labelEn: "Transit", labelHi: "पारगमन (Transit)", iconKey: "Transit", path: "/dashboard/supply-chain/transit" },
    { labelEn: "Warehouse", labelHi: "गोदाम", iconKey: "Warehouse", path: "/dashboard/supply-chain/warehouse" },
    { labelEn: "Dispatch", labelHi: "डिस्पैच", iconKey: "Dispatch", path: "/dashboard/supply-chain/dispatch" },
  ],
  WHOLESALER: [
    { labelEn: "Overview", labelHi: "अवलोकन", iconKey: "Overview", path: "/dashboard/supply-chain" },
    { labelEn: "Purchases", labelHi: "खरीद", iconKey: "Purchases", path: "/dashboard/supply-chain/purchases" },
    { labelEn: "Inventory", labelHi: "भंडार सूची", iconKey: "Inventory", path: "/dashboard/supply-chain/inventory" },
    { labelEn: "Retailer Transfers", labelHi: "हस्तांतरण", iconKey: "Retailer Transfers", path: "/dashboard/supply-chain/transfers" },
  ],
  RETAILER: [
    { labelEn: "Overview", labelHi: "अवलोकन", iconKey: "Overview", path: "/dashboard/supply-chain" },
    { labelEn: "Received Stock", labelHi: "प्राप्त स्टॉक", iconKey: "Received Stock", path: "/dashboard/supply-chain/received" },
    { labelEn: "Store Inventory", labelHi: "दुकान भंडार", iconKey: "Store Inventory", path: "/dashboard/supply-chain/inventory" },
    { labelEn: "Products Sold", labelHi: "बिक्री रसीद", iconKey: "Products Sold", path: "/dashboard/supply-chain/sold" },
  ],
  NONE: [],
};

const ROLE_NAMES: Record<UserRole, { en: string; hi: string }> = {
  ADMIN: { en: "Admin Console", hi: "प्रशासनिक केंद्र (KVIC)" },
  BEEKEEPER: { en: "Beekeeper Portal", hi: "मधुमक्खी पालक केंद्र" },
  PROCESSOR: { en: "Factory / Processor", hi: "प्रोसेसिंग इकाई" },
  LAB: { en: "Quality Lab", hi: "गुणवत्ता परीक्षण लैब" },
  DISTRIBUTOR: { en: "Distributor", hi: "वितरक केंद्र" },
  WHOLESALER: { en: "Wholesaler", hi: "थोक विक्रेता" },
  RETAILER: { en: "Retailer", hi: "खुदरा विक्रेता" },
  NONE: { en: "", hi: "" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, linkWallet } = useAuth();
  const wallet = useWallet();
  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Auto-link wallet and guarantee on-chain smart contract role authorization whenever a wallet is connected
  useEffect(() => {
    if (wallet.isConnected && wallet.address && user) {
      if (!user.walletAddress || user.walletAddress.toLowerCase() !== wallet.address.toLowerCase()) {
        linkWallet(wallet.address).catch(console.error);
      }
    }
  }, [wallet.isConnected, wallet.address, user?.walletAddress, linkWallet]);

  // Keyboard shortcuts for sidebar navigation (Alt + 1, 2, 3... and Alt + Up/Down Arrows)
  useEffect(() => {
    if (!user) return;
    const items = NAV_ITEMS_BY_ROLE[user.role as UserRole] || [];
    if (items.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + \ to toggle sidebar (ignoring AltGr which also sends ctrlKey)
      if (e.ctrlKey && !e.altKey && !e.getModifierState?.("AltGraph") && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
        return;
      }

      // Check for Left Alt OR Right Alt (AltGraph / AltRight)
      const isAltPressed = 
        e.altKey || 
        (e.getModifierState && e.getModifierState("AltGraph")) || 
        (e.getModifierState && e.getModifierState("Alt"));

      if (isAltPressed) {
        // Alt + ` : Home
        if (e.key === '`' || e.code === 'Backquote') {
          e.preventDefault();
          router.push("/");
          return;
        }

        // Alt + 0 : Profile
        if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          router.push("/dashboard/profile");
          return;
        }

        // Alt + ArrowDown: Navigate to Next Section
        if (e.key === 'ArrowDown' || e.code === 'ArrowDown') {
          e.preventDefault();
          const currentIndex = items.findIndex(item => item.path === pathname);
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
          router.push(items[nextIndex].path);
          return;
        }

        // Alt + ArrowUp: Navigate to Previous Section
        if (e.key === 'ArrowUp' || e.code === 'ArrowUp') {
          e.preventDefault();
          const currentIndex = items.findIndex(item => item.path === pathname);
          const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + items.length) % items.length;
          router.push(items[prevIndex].path);
          return;
        }
        
        // Alt + Number Keys (1, 2, 3...)
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
          return;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, router, pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[var(--honey-500)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {isHindi ? "पोर्टल लोड हो रहा है..." : "Loading your portal..."}
          </p>
        </div>
      </div>
    );
  }

  const navItems = NAV_ITEMS_BY_ROLE[user.role] || [];

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Logo */}
      <div
        className="px-4 py-4 flex items-center gap-3 cursor-pointer border-b border-[var(--border-default)]"
        onClick={() => router.push("/")}
      >
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--honey-500)] to-[var(--orange-600)] flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white font-bold text-sm">HC</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--text-primary)] truncate leading-tight font-[family-name:var(--font-outfit)]">
              HoneyChain
            </h1>
            <p className="text-[10px] text-[var(--honey-600)] uppercase tracking-wider font-semibold truncate">
              {ROLE_NAMES[user.role]?.[language] || ROLE_NAMES[user.role]?.en}
            </p>
          </div>
        )}
      </div>

      {/* User Card */}
      <div className="px-3 py-3 border-b border-[var(--border-default)]">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-muted)] transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--honey-400)] to-[var(--honey-600)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--honey-700)] transition-colors">
                {user.name}
              </p>
              {user.walletAddress ? (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                  On-Chain Verified
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                  KVIC Direct ID
                </div>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-200 text-xs font-medium ${
                isActive
                  ? "bg-[var(--honey-50)] text-[var(--honey-700)] font-semibold border-l-2 border-[var(--honey-600)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-[var(--honey-600)]" : "text-[var(--text-muted)]"}`}>
                {NAV_ICONS[item.iconKey] || <LayoutDashboard size={17} />}
              </span>
              {!collapsed && <span className="truncate">{isHindi ? item.labelHi : item.labelEn}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="px-3 py-3 border-t border-[var(--border-default)]">
        {!collapsed ? (
          <div className="flex gap-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              {isHindi ? "छोटा करें" : "Collapse"}
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              {isHindi ? "लॉग आउट" : "Sign Out"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full flex items-center justify-center py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 sidebar transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-[72px]"
        }`}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <aside className="relative w-72 h-full sidebar flex flex-col shadow-2xl animate-slide-in-left">
            <button
              onClick={closeMobile}
              className="absolute top-4 right-4 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 topbar sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] cursor-pointer transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                HoneyChain
              </span>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-secondary)] text-xs font-medium">
                {ROLE_NAMES[user.role]?.[language] || ROLE_NAMES[user.role]?.en}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher Button (EN / HI) */}
            <div className="flex items-center rounded-full bg-[var(--bg-muted)] p-0.5 border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  language === "en"
                    ? "bg-[var(--honey-600)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  language === "hi"
                    ? "bg-[var(--honey-600)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Blockchain Status */}
            <BlockchainIndicator />

            {/* Alerts */}
            <AlertBell />

            {/* Wallet */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-2">
                {wallet.isCorrectNetwork ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2.5 py-1 rounded-[var(--radius-full)] border border-[var(--color-success-border)]">
                    <span className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full pulse-dot" />
                    Sepolia
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={wallet.switchNetwork}
                    className="!text-[var(--color-danger)] !border-[var(--color-danger-border)] hover:!bg-[var(--color-danger-bg)]"
                  >
                    Switch Network
                  </Button>
                )}
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--honey-700)] bg-[var(--honey-50)] px-3 py-1 rounded-[var(--radius-full)] border border-[var(--honey-200)]">
                  <Wallet size={12} />
                  {wallet.shortAddress}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {wallet.error && (
                  <span className="text-[10px] text-[var(--color-danger)] font-semibold bg-[var(--color-danger-bg)] px-2 py-1 rounded border border-[var(--color-danger-border)] max-w-[150px] truncate" title={wallet.error}>
                    {wallet.error}
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Wallet}
                  onClick={() => {
                    if (!wallet.hasMetaMask) {
                      window.open("https://metamask.io/download/", "_blank");
                    } else {
                      wallet.connect();
                    }
                  }}
                  disabled={wallet.isConnecting}
                >
                  {wallet.isConnecting ? "Connecting..." : isHindi ? "वॉलेट जोड़ें" : "Connect"}
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
