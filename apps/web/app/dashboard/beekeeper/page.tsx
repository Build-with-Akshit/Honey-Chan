"use client";

/**
 * Beekeeper home — v2 (design.md §5.2/§5.5, content.md §4.4).
 * Mobile-first: greeting → guidance bar → harvest CTA → vitals (2×2) →
 * hives → batches → advice. At lg+: vitals 4-up, hives/batches 2-col.
 * Monochrome, icon-first, no emoji. Hindi-first via t() (frozen API calls).
 */

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AppIcon, { type IconKey } from "@/components/icons/AppIcon";

export default function BeekeeperDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([honeyApi.getHives(), honeyApi.getBatches()])
      .then(([hivesData, batchesData]) => {
        setHives(hivesData || []);
        setBatches(batchesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalHives = hives.length;
  const activeBatches = batches.filter(
    (b) => b.status !== "DISTRIBUTED" && b.status !== "RETAIL"
  ).length;
  const honeyProduced = batches.reduce(
    (acc, b) => acc + Number(b.quantity || b.quantityKg || 0),
    0
  );
  const avgHealth = hives.length
    ? Math.round(
        hives.reduce((acc, h) => acc + (h.healthScore || 85), 0) / hives.length
      )
    : 92;

  // Predictive checks (unchanged logic)
  const harvestReadyHives = hives.filter((h) => (h.latestReading?.weight || 38.4) >= 38.0);
  const alertHives = hives.filter(
    (h) => (h.latestReading?.temperature || 34.2) > 35.5 || (h.healthScore && h.healthScore < 80)
  );

  const guidance = harvestReadyHives.length > 0
    ? {
        icon: "check" as IconKey,
        title: t("bk.harvest.ready"),
        sub: t("bk.harvest.readySub", {
          hive: harvestReadyHives[0].hiveCode,
          kg: String(harvestReadyHives[0].latestReading?.weight || "38.4"),
        }),
        href: "/batches/create",
        cta: t("bk.harvest.cta"),
        strong: true,
      }
    : alertHives.length > 0
      ? {
          icon: "warn" as IconKey,
          title: t("bk.alert.title"),
          sub: t("bk.alert.sub", {
            hive: alertHives[0].hiveCode,
            temp: String(alertHives[0].latestReading?.temperature || "35.8"),
          }),
          href: "/dashboard/beekeeper/iot",
          cta: t("bk.sensors"),
          strong: false,
        }
      : null;

  const vitals: { icon: IconKey; label: string; value: string; unit?: string }[] = [
    { icon: "hives", label: t("totalHives"), value: String(totalHives) },
    {
      icon: "weight",
      label: t("honeyProduced"),
      value: honeyProduced.toFixed(1),
      unit: "kg",
    },
    { icon: "batches", label: t("activeBatches"), value: String(activeBatches) },
    { icon: "check", label: t("avgHiveHealth"), value: `${avgHealth}%` },
  ];

  return (
    <div className="space-y-4 page-enter lg:space-y-6">
      {/* ── Greeting + primary action ── */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-3 lg:heading-2">
            {t("bk.greeting")}, {user?.name || "Beekeeper"}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: "var(--ink-soft)" }}>
            {t("bk.node")} · {avgHealth}% {t("avgHiveHealth").toLowerCase()}
          </p>
        </div>
        <Link href="/batches/create" className="btn-primary lg:!min-h-[56px] lg:!px-6">
          <AppIcon name="weight" size={22} ariaLabel="" />
          {t("bk.harvest.cta")}
        </Link>
      </section>

      {/* ── Guidance bar (context-aware; hidden when nothing to act on) ── */}
      {guidance && (
        <Link
          href={guidance.href}
          className="card card-interactive flex items-center gap-3"
          style={guidance.strong ? { borderColor: "var(--ink)" } : undefined}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              borderRadius: "var(--radius-full)",
            }}
            aria-hidden
          >
            <AppIcon name={guidance.icon} size={22} ariaLabel="" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold">{guidance.title}</span>
            <span className="block text-[14px]" style={{ color: "var(--ink-soft)" }}>
              {guidance.sub}
            </span>
          </span>
          <AppIcon name="next" size={20} ariaLabel="" className="shrink-0" />
        </Link>
      )}

      {/* ── Vitals: 2×2 on mobile, 4-up on desktop ── */}
      <section aria-label={t("bk.vitals")}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {vitals.map((v) => (
            <div key={v.label} className="card">
              <span className="flex h-9 w-9 items-center justify-center" aria-hidden
                style={{ background: "var(--page)", borderRadius: "var(--radius-full)" }}>
                <AppIcon name={v.icon} size={18} ariaLabel="" />
              </span>
              <p className="mt-3 text-[28px] font-bold leading-none tabular-data lg:text-[32px]">
                {v.value}
                {v.unit && (
                  <span className="ml-1 text-[14px] font-semibold" style={{ color: "var(--ink-soft)" }}>
                    {v.unit}
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>
                {v.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hives + batches: stacked on mobile, 2:1 on desktop ── */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Hives */}
        <section className="card lg:col-span-2" aria-label={t("bk.hives.title")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="heading-3">{t("bk.hives.title")}</h2>
              <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>
                {t("bk.hives.sub")}
              </p>
            </div>
            <Link href="/dashboard/beekeeper/hives" className="btn-ghost !min-h-[44px] !px-3 !text-[14px]">
              {t("bk.manage")}
              <AppIcon name="next" size={18} ariaLabel="" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
              <div className="skeleton h-36" />
              <div className="skeleton h-36" />
              <div className="skeleton h-36" />
              <div className="skeleton h-36" />
            </div>
          ) : hives.length === 0 ? (
            <div className="p-6 text-center">
              <p className="body-text">{t("state.empty")}</p>
              <Link href="/dashboard/beekeeper/hives" className="btn-secondary mt-4 inline-flex">
                <AppIcon name="hives" size={20} ariaLabel="" />
                {t("navMyHives")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hives.map((hive) => {
                const temp = hive.latestReading?.temperature || 34.2;
                const hum = hive.latestReading?.humidity || 64.8;
                const weight = hive.latestReading?.weight || 38.45;
                const health = hive.healthScore || 85;
                return (
                  <div
                    key={hive.id || hive.hiveCode}
                    className="rounded-md border p-3"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-bold tabular-data">{hive.hiveCode}</span>
                      <span
                        className="badge"
                        data-ok={health >= 80 ? "true" : undefined}
                        style={health < 80 ? { color: "var(--danger)", borderColor: "var(--danger)" } : undefined}
                      >
                        <AppIcon name={health >= 80 ? "check" : "warn"} size={14} ariaLabel="" />
                        {health}%
                      </span>
                    </div>

                    {/* Sensor micro-grid: icon + value, shape-coded */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(
                        [
                          ["temp", `${temp}°`, t("bk.temp")],
                          ["humidity", `${hum}%`, t("bk.humidity")],
                          ["weight", `${weight}kg`, ""],
                        ] as [IconKey, string, string][]
                      ).map(([icon, val, label]) => (
                        <div
                          key={icon}
                          className="flex flex-col items-center gap-0.5 rounded-md py-2"
                          style={{ background: "var(--page)" }}
                        >
                          <AppIcon name={icon} size={16} ariaLabel="" />
                          <span className="text-[14px] font-bold tabular-data leading-none">{val}</span>
                          {label && (
                            <span className="text-[11px] font-medium" style={{ color: "var(--ink-mute)" }}>
                              {label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href="/dashboard/beekeeper/iot"
                        className="btn-ghost !min-h-[40px] flex-1 !px-2 !text-[13px]"
                      >
                        <AppIcon name="iot" size={16} ariaLabel="" />
                        {t("bk.sensors")}
                      </Link>
                      <Link
                        href="/batches/create"
                        className="btn-secondary !min-h-[40px] flex-1 !px-2 !text-[13px]"
                      >
                        <AppIcon name="weight" size={16} ariaLabel="" />
                        {t("bk.harvest.cta")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Batches */}
        <section className="card" aria-label={t("bk.batches.title")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="heading-3">{t("bk.batches.title")}</h2>
              <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>
                {t("bk.batches.sub")}
              </p>
            </div>
            <Link href="/dashboard/beekeeper/batches" className="btn-ghost !min-h-[44px] !px-3 !text-[14px]">
              {t("bk.viewAll")}
              <AppIcon name="next" size={18} ariaLabel="" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <div className="skeleton h-20" />
              <div className="skeleton h-20" />
            </div>
          ) : batches.length === 0 ? (
            <div className="p-6 text-center">
              <p className="body-text">{t("state.empty")}</p>
              <Link href="/batches/create" className="btn-secondary mt-4 inline-flex">
                <AppIcon name="batches" size={20} ariaLabel="" />
                {t("navCreateBatch")}
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {batches.slice(0, 5).map((b) => (
                <li key={b.id || b.batchId}>
                  <Link
                    href={`/verify/${b.batchId}`}
                    className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-[#F6F6F6]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center"
                      style={{ background: "var(--page)", borderRadius: "var(--radius-full)" }}
                      aria-hidden
                    >
                      <AppIcon name="batches" size={20} ariaLabel="" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold tabular-data">{b.batchId}</span>
                      <span className="block text-[13px] tabular-data" style={{ color: "var(--ink-soft)" }}>
                        {b.quantity || b.quantityKg || "—"} kg · {b.honeyType || t("state.empty")}
                      </span>
                    </span>
                    <span className="badge badge-harvested shrink-0">{b.status || "HARVESTED"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Advice strip ── */}
      <section className="card card-interactive lg:hidden" aria-label={t("bk.advice.title")}>
        <Link href="/dashboard/beekeeper/ai" className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center"
            style={{ background: "var(--page)", borderRadius: "var(--radius-full)" }}
            aria-hidden
          >
            <AppIcon name="ai" size={22} ariaLabel="" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold">{t("bk.advice.title")}</span>
            <span className="block text-[14px]" style={{ color: "var(--ink-soft)" }}>
              {t("bk.advice.body")}
            </span>
          </span>
          <AppIcon name="next" size={20} ariaLabel="" className="shrink-0" />
        </Link>
      </section>
    </div>
  );
}
