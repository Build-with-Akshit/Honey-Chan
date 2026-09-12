"use client";

/**
 * /scan — full-screen scanner (design.md §5.6, architecture.md §3).
 * The center tab action for consumer + beekeeper. Reuses
 * QRScannerWidget (camera + image upload + manual batch-ID fallback)
 * and redirects to /verify/[batchId].
 */

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import QRScannerWidget from "@/components/QRScannerWidget";
import AppIcon from "@/components/icons/AppIcon";

export default function ScanPage() {
  const { t } = useLanguage();

  return (
    <main
      className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
    >
      <header className="flex h-14 shrink-0 items-center justify-between">
        <Link href="/" className="btn-ghost min-h-[44px] px-3" aria-label={t("action.back")}>
          <AppIcon name="back" size={20} ariaLabel="" />
        </Link>
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
