"use client";

/**
 * /scan — full-screen scanner (design.md §5.6, architecture.md §3).
 * The center tab action for consumer + beekeeper. Reuses
 * QRScannerWidget (camera + image upload + manual batch-ID fallback)
 * and redirects to /verify/[batchId].
 */

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import QRScannerWidget from "@/components/QRScannerWidget";
import AppIcon from "@/components/icons/AppIcon";

export default function ScanPage() {
  const { t } = useLanguage();
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
    <main
      className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
    >
      <header className="flex h-14 shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="btn-ghost min-h-[44px] px-3 cursor-pointer inline-flex items-center justify-center transition-colors"
          aria-label={t("action.back")}
        >
          <AppIcon name="back" size={20} ariaLabel="" />
        </button>
        <h1 className="text-[17px] font-bold">{t("land.cta.scan")}</h1>
        <span className="w-[52px]" aria-hidden />
      </header>

      <section className="flex flex-1 flex-col justify-center gap-4 py-6">
        <p className="body-text text-center">{t("scan.hint")}</p>
        <QRScannerWidget />
      </section>
    </main>
  );
}
