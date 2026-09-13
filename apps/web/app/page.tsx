"use client";

/**
 * HoneyChain v2 Landing (design.md, content.md §3).
 * ONE design, TWO compositions — same ink/paper tokens, same copy:
 *  - < lg  : the mobile column users liked (max-w-[480px]), unchanged.
 *  - ≥ lg  : true desktop composition — full-width nav header,
 *            two-column hero (copy left / scan card right),
 *            3-up tiles, connected journey strip, desktop footer.
 * No GSAP, no gradients, no emoji. Hindi-first (plan.md decision #1).
 */

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import QRScannerWidget from "@/components/QRScannerWidget";
import AppIcon, { type IconKey } from "@/components/icons/AppIcon";

/** Journey strip (design.md §5.3 shape language; content.md §4.2 labels). */
const JOURNEY: { icon: IconKey; key: string }[] = [
  { icon: "hives", key: "verdict.journey.step.harvest" },
  { icon: "factory", key: "verdict.journey.step.process" },
  { icon: "lab", key: "verdict.journey.step.lab" },
  { icon: "truck", key: "verdict.journey.step.distribution" },
  { icon: "store", key: "verdict.journey.step.retail" },
];

/** Role → dashboard route (unchanged behavior). */
function dashboardFor(role?: string) {
  if (role === "BEEKEEPER") return "/dashboard/beekeeper";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/supply-chain";
}

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const { language, setLanguage, cycleLanguage, t } = useLanguage();

  const header = (
    <>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm border border-amber-500/30 bg-gray-900">
          <Image
            src="/favicon.png"
            alt="HoneyChain Logo"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-[17px] font-bold lg:text-[20px]">{t("app.name")}</span>
      </div>

      {/* Mobile: single toggle. Desktop (hidden lg:flex): full nav. */}
      <button
        type="button"
        onClick={() => cycleLanguage()}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 text-[14px] font-semibold lg:hidden"
        style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
        aria-label={t("language")}
      >
        <AppIcon name="language" size={18} ariaLabel="" />
        {t("lang.toggle")}
      </button>

      <nav
        aria-label={t("app.name")}
        className="hidden items-center gap-1 lg:flex"
      >
        <Link href="/marketplace" className="nav-link">
          {t("land.nav.marketplace")}
        </Link>
        <Link href="/dashboard/beekeeper/ai" className="nav-link">
          {t("land.nav.advice")}
        </Link>
        {!isLoading && user ? (
          <>
            <Link href={dashboardFor(user.role)} className="nav-link">
              <AppIcon name="home" size={16} ariaLabel="" />
              {t("land.tile.beekeeper")}
            </Link>
            <button type="button" onClick={logout} className="nav-link">
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">
              {t("land.nav.login")}
            </Link>
            <Link href="/register" className="btn-primary !min-h-[44px] !px-5 !text-[14px]">
              {t("land.nav.register")}
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={() => cycleLanguage()}
          className="nav-link !font-semibold"
          aria-label={t("language")}
        >
          <AppIcon name="language" size={16} ariaLabel="" />
          {t("lang.toggle")}
        </button>
      </nav>
    </>
  );

  const heroCopy = (
    <section className="animate-fade-in pt-8 lg:pt-0">
      <h1 className="display">{t("land.title")}</h1>
      <p className="body-text mt-3 lg:mt-5 lg:max-w-[46ch]">{t("land.sub")}</p>

      {/* Desktop-only quiet trust row under the sub-copy */}
      <ul className="mt-6 hidden flex-wrap gap-2 lg:flex" aria-label={t("trust.blockchain")}>
        {(
          [
            ["verify", "trust.blockchain"],
            ["iot", "trust.iot"],
            ["ai", "trust.ai"],
            ["scan", "trust.qr"],
          ] as [IconKey, string][]
        ).map(([icon, key]) => (
          <li
            key={key}
            className="inline-flex min-h-[36px] items-center gap-2 rounded-md border px-3 text-[14px] font-medium"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            <AppIcon name={icon} size={16} ariaLabel="" />
            {t(key)}
          </li>
        ))}
      </ul>
    </section>
  );

  const scanCard = (
    <section className="card mt-8 lg:mt-0" aria-label={t("land.cta.scan")}>
      <div className="mb-4 flex flex-col items-center text-center">
        <span
          className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 shadow-2xs"
          aria-hidden
        >
          <AppIcon name="verify" size={22} ariaLabel="" />
        </span>
        <h2 className="text-[20px] font-bold leading-[1.3] text-gray-900">{t("land.tile.verify")}</h2>
        <p className="text-[14px] text-gray-500 mt-0.5">
          {t("land.tile.verifySub")}
        </p>
      </div>
      <QRScannerWidget />
    </section>
  );

  const entryTiles = !isLoading &&
    !user && (
      <>
        {/* Mobile: stacked cards (unchanged) */}
        <section className="mt-6 grid gap-3 lg:hidden">
          <Link href="/login" className="card card-interactive flex min-h-[76px] items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: "var(--page)", borderRadius: "var(--radius-full)" }}
              aria-hidden
            >
              <AppIcon name="hives" size={22} ariaLabel="" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold">{t("land.tile.beekeeper")}</span>
              <span className="block text-[15px]" style={{ color: "var(--ink-soft)" }}>
                {t("land.tile.beekeeperSub")}
              </span>
            </span>
            <AppIcon name="next" size={20} ariaLabel="" className="shrink-0" />
          </Link>
          <Link
            href="/dashboard/beekeeper/ai"
            className="card card-interactive flex min-h-[76px] items-center gap-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: "var(--page)", borderRadius: "var(--radius-full)" }}
              aria-hidden
            >
              <AppIcon name="ai" size={22} ariaLabel="" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold">{t("land.tile.ai")}</span>
              <span className="block text-[15px]" style={{ color: "var(--ink-soft)" }}>
                {t("land.tile.aiSub")}
              </span>
            </span>
            <AppIcon name="next" size={20} ariaLabel="" className="shrink-0" />
          </Link>
        </section>

        {/* Desktop: 3-up tiles */}
        <section className="mt-14 hidden lg:grid lg:grid-cols-3 lg:gap-4">
          {(
            [
              ["hives", "/login", "land.tile.beekeeper", "land.tile.beekeeperSub"],
              ["ai", "/dashboard/beekeeper/ai", "land.tile.ai", "land.tile.aiSub"],
              ["store", "/marketplace", "land.marketplace", "land.sub"],
            ] as [IconKey, string, string, string][]
          ).map(([icon, href, titleKey, subKey]) => (
            <Link key={href + titleKey} href={href} className="card card-interactive p-5">
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center border"
                style={{ borderColor: "var(--line-strong)", borderRadius: "var(--radius-full)" }}
                aria-hidden
              >
                <AppIcon name={icon} size={24} ariaLabel="" />
              </span>
              <span className="block text-[18px] font-semibold">{t(titleKey)}</span>
              <span className="mt-1 block text-[15px]" style={{ color: "var(--ink-soft)" }}>
                {t(subKey)}
              </span>
            </Link>
          ))}
        </section>
      </>
    );

  const journey = (
    <section className="mt-10 lg:mt-20" aria-label={t("verdict.journey.title")}>
      <h2 className="heading-3 journey-title">{t("verdict.journey.title")}</h2>
      <ol className="journey-strip mt-4 lg:mt-6">
        {JOURNEY.map((step) => (
          <li key={step.key} className="journey-step flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            <span
              className="journey-circle flex h-12 w-12 items-center justify-center border lg:h-14 lg:w-14"
              style={{
                borderColor: "var(--line-strong)",
                borderRadius: "var(--radius-full)",
                color: "var(--ink)",
              }}
              aria-hidden
            >
              <AppIcon name={step.icon} size={22} ariaLabel="" />
            </span>
            <span
              className="text-[12px] font-medium leading-tight lg:max-w-[14ch] lg:text-[14px]"
              style={{ color: "var(--ink-soft)" }}
            >
              {t(step.key)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );

  const demoEntry = !isLoading &&
    !user && (
      <section className="mt-8 lg:hidden">
        <Link href="/verify/HC-2026-963790" className="btn-secondary w-full">
          <AppIcon name="scan" size={22} ariaLabel="" />
          {t("land.tile.verifySub")}
        </Link>
      </section>
    );

  return (
    <main className="min-h-[100dvh] w-full">
      {/* ── Mobile shell: the exact column users liked ── */}
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 lg:hidden">
        <header
          className="flex items-center justify-between py-3"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
        >
          {header}
        </header>
        {heroCopy}
        {!isLoading && user && (
          <section className="mt-8">
            <Link href={dashboardFor(user.role)} className="btn-primary w-full">
              <AppIcon name="home" size={24} ariaLabel="" />
              {t("land.tile.beekeeperSub")}
            </Link>
            <button onClick={logout} className="btn-ghost mt-2 w-full text-[14px]">
              <AppIcon name="logout" size={20} ariaLabel="" />
              {t("logout")}
            </button>
          </section>
        )}
        {scanCard}
        {entryTiles}
        {journey}
        {demoEntry}
        {isLoading && (
          <div className="mt-8 space-y-3" aria-busy="true">
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-16 w-full" />
          </div>
        )}
        <footer className="mt-12 border-t pt-6 text-center" style={{ borderColor: "var(--line)" }}>
          <p className="text-[14px]" style={{ color: "var(--ink-mute)" }}>
            {t("kvicTitle")}
          </p>
        </footer>
      </div>

      {/* ── Desktop composition (lg+) ── */}
      <div className="hidden lg:block">
        <header
          className="mx-auto flex w-full max-w-[1200px] items-center justify-between border-b px-8 py-4"
          style={{ borderColor: "var(--line)" }}
        >
          {header}
        </header>

        <div className="mx-auto w-full max-w-[1200px] px-8 pb-16">
          {/* Hero: copy left, scan card right */}
          <div className="grid grid-cols-[1.15fr_0.85fr] items-center gap-16 pt-20">
            {heroCopy}
            <div className="mx-auto w-full max-w-[520px]">{scanCard}</div>
          </div>

          {entryTiles}
          {journey}
          {demoEntry}

          {/* Desktop loading skeleton */}
          {isLoading && (
            <div className="mt-14 grid grid-cols-3 gap-4" aria-busy="true">
              <div className="skeleton h-28 w-full" />
              <div className="skeleton h-28 w-full" />
              <div className="skeleton h-28 w-full" />
            </div>
          )}

          <footer
            className="mt-20 flex items-center justify-between border-t pt-8"
            style={{ borderColor: "var(--line)" }}
          >
            <p className="text-[14px] font-medium" style={{ color: "var(--ink-soft)" }}>
              {t("kvicTitle")}
            </p>
            <p className="text-[13px]" style={{ color: "var(--ink-mute)" }}>
              {t("land.foot.rights")}
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
