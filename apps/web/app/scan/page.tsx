"use client";

/**
 * /scan — Redesigned full-screen scanner (design.md §5.6, architecture.md §3).
 * Warm honey & golden amber design, multi-mode verification hub:
 * 1. Live camera scanner with animated golden laser sweep & glowing viewfinder
 * 2. Drag-and-drop QR image uploader with instant jsQR decoding
 * 3. Manual batch ID entry with clickable verified demo chips
 * 4. Purity & blockchain trust highlights and dynamic back navigation
 */

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import QRScannerWidget from "@/components/QRScannerWidget";
import AppIcon from "@/components/icons/AppIcon";

export default function ScanPage() {
  const { language, cycleLanguage, t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    // 1. If user came from another page on this site in the same session, go back
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      router.back();
      return;
    }

    // 2. Check tracked last visited page from RouteTracker
    try {
      const lastPage = sessionStorage.getItem("honeychain_last_page");
      if (lastPage && lastPage !== "/scan") {
        router.push(lastPage);
        return;
      }
      const lastDashboard = sessionStorage.getItem("honeychain_last_dashboard");
      if (lastDashboard && lastDashboard !== "/scan") {
        router.push(lastDashboard);
        return;
      }
    } catch {}

    // 3. If history length > 1, navigate back
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    // 4. Role-based smart fallback if opened directly without prior history
    if (user?.role === "BEEKEEPER") {
      router.push("/dashboard/beekeeper/ai");
    } else if (user?.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (user?.role && user.role !== "NONE") {
      router.push("/dashboard/supply-chain");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-honey-pattern text-[#221406] pb-12">
      {/* Ambient background glow effect */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        aria-hidden
      >
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-amber-400/25 via-amber-200/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col px-4 pt-3 sm:pt-6">
        {/* Top App Bar with back button, center badge, and language toggle */}
        <header className="flex h-14 items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 border border-amber-200/80 text-amber-950 hover:bg-amber-100 hover:border-amber-400 transition-all shadow-xs cursor-pointer"
            aria-label={t("action.back")}
            title={t("action.back")}
          >
            <AppIcon name="back" size={20} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 shadow-xs">
            <AppIcon name="hives" size={14} className="text-amber-700" />
            <span className="text-[11px] sm:text-xs font-bold text-amber-900 tracking-wide uppercase">
              {t("scan.badge")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => cycleLanguage()}
            className="inline-flex h-10 items-center gap-1.5 px-3 rounded-xl bg-white/90 border border-amber-200/80 text-amber-950 hover:bg-amber-100 hover:border-amber-400 text-xs font-bold transition-all shadow-xs cursor-pointer"
            aria-label={t("lang.toggle")}
            title="Switch Language (Alt + T)"
          >
            <AppIcon name="language" size={16} />
            <span>{language === "hi" ? "हिन्दी" : "EN"}</span>
          </button>
        </header>

        {/* Page Hero Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight mb-2">
            {t("scan.title")}
          </h1>
          <p className="text-xs sm:text-sm text-amber-900/80 max-w-md mx-auto leading-relaxed">
            {t("scan.subtitle")}
          </p>
        </div>

        {/* Main Interactive Scanner Card */}
        <div className="card overflow-hidden !p-4 sm:!p-6 !border-amber-200/90 !bg-white/95 !shadow-[0_12px_36px_rgba(217,119,6,0.12)] !rounded-2xl backdrop-blur-sm">
          <QRScannerWidget defaultOpen={true} showDemoBatches={true} />
        </div>

        {/* Trust & Purity Pillars */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-amber-200/80 bg-white/85 shadow-xs flex flex-col gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AppIcon name="verify" size={20} />
            </div>
            <h3 className="text-xs font-bold text-amber-950">
              {t("scan.guide.step1.title")}
            </h3>
            <p className="text-[11px] text-amber-900/70 leading-normal">
              {t("scan.guide.step1.desc")}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200/80 bg-white/85 shadow-xs flex flex-col gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AppIcon name="lab" size={20} />
            </div>
            <h3 className="text-xs font-bold text-amber-950">
              {t("scan.guide.step2.title")}
            </h3>
            <p className="text-[11px] text-amber-900/70 leading-normal">
              {t("scan.guide.step2.desc")}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200/80 bg-white/85 shadow-xs flex flex-col gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AppIcon name="hives" size={20} />
            </div>
            <h3 className="text-xs font-bold text-amber-950">
              {t("scan.guide.step3.title")}
            </h3>
            <p className="text-[11px] text-amber-900/70 leading-normal">
              {t("scan.guide.step3.desc")}
            </p>
          </div>
        </section>

        {/* QR Location Guidance Tip */}
        <div className="mt-4 p-3.5 rounded-xl border border-amber-200/70 bg-amber-100/50 flex items-center gap-3 text-xs text-amber-900 shadow-xs">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold">
            i
          </span>
          <p className="leading-snug">
            <span className="font-bold">{t("scan.guide.locationTitle")}</span>{" "}
            <span className="text-amber-900/80">{t("scan.guide.locationDesc")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
