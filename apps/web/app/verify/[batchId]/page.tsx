"use client";

/**
 * Verify page — v2 rebuild (design.md, content.md §4, architecture.md).
 * Mobile-first single column (480px). One question per screen:
 * "Is this honey real?" — verdict first, details beneath.
 *
 * Danger states (tamper/recall) fire the full-screen DangerTakeover
 * (design.md §5.4); after acknowledge, a persistent banner remains.
 * The SIH judge demo panel is kept (restyled quiet-monochrome) — it
 * triggers the same takeover via the tamper/recall simulation.
 * No GSAP — motion budget is CSS-only (design.md §6).
 */

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import AppIcon, { type IconKey } from "@/components/icons/AppIcon";
import DangerTakeover from "@/components/ui/DangerTakeover";

/* ── Status glyph (design.md §5.3 — shape, not color) ── */
function StatusGlyph({
  state,
  size = 56,
}: {
  state: "ok" | "fail" | "warn" | "pending";
  size?: number;
}) {
  const s = { width: size, height: size };
  if (state === "ok")
    return (
      <span className="flex items-center justify-center" style={{ ...s, borderRadius: "9999px", background: "var(--ink)", color: "var(--paper)" }} aria-hidden>
        <AppIcon name="check" size={size * 0.55} ariaLabel="" />
      </span>
    );
  if (state === "fail")
    return (
      <span className="flex items-center justify-center" style={{ ...s, borderRadius: "22%", background: "var(--ink)", color: "var(--paper)" }} aria-hidden>
        <AppIcon name="cross" size={size * 0.55} ariaLabel="" />
      </span>
    );
  if (state === "warn")
    return (
      <span className="flex items-center justify-center" style={{ ...s, color: "var(--ink)" }} aria-hidden>
        <AppIcon name="warn" size={size * 0.7} ariaLabel="" />
      </span>
    );
  return (
    <span className="flex items-center justify-center" style={{ ...s, color: "var(--ink)" }} aria-hidden>
      <AppIcon name="pending" size={size * 0.7} ariaLabel="" />
    </span>
  );
}

/* ── Tx hash short form (content.md §8: first 6 + last 4) ── */
function txShort(hash?: string) {
  if (!hash) return "";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

/* ── Journey stage → icon key (content.md §1 registry) ── */
function stageIcon(stage: string): IconKey {
  switch (stage) {
    case "HARVEST": return "hives";
    case "PROCESSING": return "factory";
    case "QUALITY_TESTED":
    case "TESTED":
    case "LAB_TESTING": return "lab";
    case "DISTRIBUTED":
    case "DISTRIBUTION": return "truck";
    case "RETAIL": return "store";
    case "COMPLETED": return "sale";
    case "PENDING_TRANSFER": return "transfer";
    case "TRANSFER_REJECTED": return "cross";
    case "RECALLED": return "cross";
    default: return "pending";
  }
}

/* ── Inline TTS speak (content.md §7: hi-IN, rate 0.95) ── */
function useSpeak() {
  const { language } = useLanguage();
  return (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    const v = window.speechSynthesis
      .getVoices()
      .find((v) => (language === "hi" ? v.lang.startsWith("hi") || v.name.includes("Hindi") : v.lang.startsWith("en")));
    if (v) u.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
}

export default function VerifyPage() {
  const params = useParams();
  const rawBatchId = params.batchId as string;
  const batchId = rawBatchId || "HC-2026-963790";
  const router = useRouter();

  const { language, setLanguage, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [dangerAcked, setDangerAcked] = useState(false);
  const speak = useSpeak();

  const loadVerification = async () => {
    try {
      const res = await honeyApi.verifyBatch(batchId);
      setData(res);
    } catch (err: unknown) {
      console.error("Verification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  // Re-arm the takeover whenever the danger state changes (demo re-triggers).
  useEffect(() => {
    setDangerAcked(false);
  }, [data?.isTampered, data?.isRecalled]);

  const handleTamperAction = async (action: "tamper" | "restore") => {
    setBusy(true);
    try {
      await honeyApi.tamperBatch(batchId, action);
      await loadVerification();
    } catch (err: unknown) {
      console.error("Tamper error:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleRecallAction = async (action: "recall" | "restore") => {
    setBusy(true);
    try {
      await honeyApi.recallBatch(batchId, {
        action,
        reason: "Product anomaly detected via post-market NMR / C4 testing.",
        authority: "National Quality Control & Food Safety Directorate",
      });
      await loadVerification();
    } catch (err: unknown) {
      console.error("Recall error:", err);
    } finally {
      setBusy(false);
    }
  };

  /* ── Loading skeleton (design.md §5.8) ── */
  if (loading && !data) {
    return (
      <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] px-4 py-10" aria-busy="true">
        <div className="skeleton h-8 w-24" />
        <div className="card mt-6 space-y-4">
          <div className="skeleton mx-auto h-14 w-14" style={{ borderRadius: "9999px" }} />
          <div className="skeleton h-7 w-3/4 mx-auto" />
          <div className="skeleton h-4 w-1/2 mx-auto" />
        </div>
        <div className="card mt-4 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
    );
  }

  /* ── Not found / network error ── */
  if (!data) {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col items-center justify-center px-4 text-center">
        <StatusGlyph state="warn" size={64} />
        <h1 className="heading-2 mt-4">{t("scan.notFound")}</h1>
        <p className="body-text mt-2">{t("verdict.unverified.body")}</p>
        <p className="mt-2 font-mono text-[14px]" style={{ color: "var(--ink-mute)" }}>
          {decodeURIComponent(batchId)}
        </p>
        <Link href="/" className="btn-primary mt-6 w-full">
          <AppIcon name="home" size={22} ariaLabel="" />
          {t("app.name")}
        </Link>
      </div>
    );
  }

  const isTampered = !!data?.isTampered;
  const isRecalled = !!data?.isRecalled;
  const inDanger = isTampered || isRecalled;
  const isVerified = data?.hashMatch && !inDanger && data?.verificationMode !== "unverified";
  const mode = data?.verificationMode || "unverified";
  const dangerKind: "tamper" | "recall" = isTampered ? "tamper" : "recall";

  /* Journey grouping (transfer + outcome pairs) — unchanged logic */
  const journey = data?.journey || [];
  const groupedJourney: any[] = [];
  let i = 0;
  while (i < journey.length) {
    const step = journey[i];
    if (step.stage === "PENDING_TRANSFER" && i + 1 < journey.length) {
      groupedJourney.push({ isGroup: true, actor: step.actor, transferEvent: step, outcomeEvent: journey[i + 1] });
      i += 2;
    } else {
      groupedJourney.push({ isGroup: false, ...step });
      i++;
    }
  }

  const verdictState = inDanger ? "fail" : isVerified ? "ok" : data?.labResult === "PENDING" ? "pending" : "warn";

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] px-4 pb-10">
      {/* ═══ Danger takeover (design.md §5.4) ═══ */}
      <DangerTakeover
        open={inDanger && !dangerAcked}
        kind={dangerKind}
        reason={data?.recallDetails?.reason}
        onAcknowledge={() => setDangerAcked(true)}
      />

      {/* ── Header: back + batch id + language ── */}
      <header className="flex items-center justify-between gap-2 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <button onClick={() => router.back()} className="btn-ghost min-h-[44px] px-3" aria-label={t("action.back")}>
          <AppIcon name="back" size={20} ariaLabel="" />
        </button>
        <span
          className="min-w-0 flex-1 truncate text-center font-mono text-[14px] font-semibold"
          title={data?.batchId || decodeURIComponent(batchId)}
        >
          {data?.batchId || decodeURIComponent(batchId)}
        </span>
        <button
          type="button"
          onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-md border px-2.5 text-[13px] font-semibold"
          style={{ borderColor: "var(--line-strong)" }}
          aria-label={t("language")}
        >
          <AppIcon name="language" size={16} ariaLabel="" />
          {t("lang.toggle")}
        </button>
      </header>

      {/* ── Persistent danger banner (after takeover ack) ── */}
      {inDanger && dangerAcked && (
        <div
          role="alert"
          className="flex items-center gap-3 p-3"
          style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-md)" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center" style={{ background: "var(--danger)", borderRadius: "22%" }} aria-hidden>
            <AppIcon name="cross" size={22} ariaLabel="" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">{t(`danger.${dangerKind}.title`)}</p>
            <p className="text-[13px] leading-snug text-white/70">{t(`danger.${dangerKind}.body`, { reason: data?.recallDetails?.reason ?? "" })}</p>
          </div>
          <button onClick={() => setDangerAcked(false)} className="min-h-[44px] px-2 text-[13px] font-semibold underline" style={{ color: "var(--paper)" }}>
            {t("action.details")}
          </button>
        </div>
      )}

      {/* ═══ Verdict hero: one glance, one decision ═══ */}
      <section
        className="card mt-3 flex flex-col items-center py-8 text-center animate-slide-up"
        aria-live="polite"
      >
        <StatusGlyph state={verdictState} size={64} />
        <h1 className="heading-2 mt-4">
          {inDanger
            ? t(`danger.${dangerKind}.title`)
            : isVerified
              ? t("verdict.ok.title")
              : data?.labResult === "PENDING"
                ? t("verdict.pending.title")
                : t("verdict.unverified.title")}
        </h1>
        <p className="body-text mt-2 max-w-[36ch]">
          {inDanger
            ? t(`danger.${dangerKind}.body`, { reason: data?.recallDetails?.reason ?? "" })
            : isVerified
              ? mode === "on-chain"
                ? t("verdict.mode.onchain")
                : t("verdict.mode.dbhash")
              : data?.labResult === "PENDING"
                ? t("verdict.pending.body")
                : t("verdict.unverified.body")}
        </p>

        {/* Listen (TTS) — 56px, per content.md §7 */}
        {(isVerified || inDanger) && (
          <button onClick={() => speak(isVerified ? t("verdict.ok.speak") : t(`danger.${dangerKind}.speak`))} className="btn-secondary mt-5 w-full">
            <AppIcon name="listen" size={22} ariaLabel="" />
            {t("listenAudio")}
          </button>
        )}

        {/* Trust score — {n}/100 (content.md §8) */}
        {typeof data?.trustScore === "number" && (
          <div className="mt-6 w-full" aria-label={t("verdict.trustScore", { n: data.trustScore })}>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">{t("verdict.trust")}</span>
              <span className="tabular-data text-[20px] font-bold">
                {data.trustScore}<span className="text-[14px]" style={{ color: "var(--ink-mute)" }}>/100</span>
              </span>
            </div>
            <div className="health-bar mt-2">
              <div className="health-bar-fill" style={{ width: `${Math.min(100, Math.max(0, data.trustScore))}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* ═══ Passport (producer & harvest) ═══ */}
      <section className="card mt-4" aria-label={t("verdict.producer")}>
        <h2 className="heading-3">{t("app.tagline")}</h2>
        <dl className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
          {[
            { icon: "hives" as IconKey, label: t("verdict.producer"), value: data?.producer },
            { icon: "home" as IconKey, label: t("verdict.origin"), value: data?.origin },
            { icon: "flower" as IconKey, label: t("verdict.flower"), value: data?.honeyType },
            { icon: "weight" as IconKey, label: t("verdict.weight"), value: data?.quantity ? `${data.quantity} ${language === "hi" ? "किलो" : "kg"}` : undefined },
            { icon: "next" as IconKey, label: t("verdict.harvest"), value: data?.harvestDate },
          ]
            .filter((r) => r.value)
            .map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-3">
                <span className="shrink-0" style={{ color: "var(--ink-soft)" }}><AppIcon name={row.icon} size={20} ariaLabel="" /></span>
                <dt className="flex-1 text-[15px]" style={{ color: "var(--ink-soft)" }}>{row.label}</dt>
                <dd className="max-w-[55%] truncate text-right text-[15px] font-semibold">{row.value}</dd>
              </div>
            ))}
        </dl>

        {/* Lab result row (shape language, not color) */}
        {data?.labResult && (
          <div className="flex items-center gap-3 py-3" style={{ borderTop: "1px solid var(--line)" }}>
            <AppIcon name="lab" size={20} ariaLabel="" className="shrink-0" />
            <span className="flex-1 text-[15px]" style={{ color: "var(--ink-soft)" }}>
              {data.labResult === "PASS" ? t("verdict.lab.pass") : data.labResult === "PENDING" ? t("verdict.pending.title") : t("cross")}
            </span>
            <span className="badge">
              {data.labResult === "PASS" ? <AppIcon name="check" size={16} ariaLabel="" /> : <AppIcon name={data.labResult === "PENDING" ? "pending" : "cross"} size={16} ariaLabel="" />}
              {data.labResult === "PASS" ? t("verdict.trust") : data.labResult}
            </span>
          </div>
        )}
      </section>

      {/* ═══ Journey (design.md §5.7 timeline) ═══ */}
      {groupedJourney.length > 0 && (
        <section className="card mt-4" aria-label={t("verdict.journey.title")}>
          <h2 className="heading-3">{t("verdict.journey.title")}</h2>
          <ol className="mt-4">
            {groupedJourney.map((item: any, idx: number) => {
              if (item.isGroup) {
                const rejected = item.outcomeEvent.stage === "TRANSFER_REJECTED";
                return (
                  <li key={idx} className="relative flex gap-3 pb-6">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border bg-[var(--paper)]" style={{ borderColor: "var(--line-strong)", borderRadius: "9999px" }} aria-hidden>
                      <AppIcon name="transfer" size={18} ariaLabel="" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{t("tr.initiated")}</p>
                      <p className="text-[13px]" style={{ color: "var(--ink-soft)" }}>{item.actor} · {item.transferEvent.date}</p>
                      <p className={`mt-1 text-[15px] font-semibold ${rejected ? "" : ""}`}>
                        {rejected ? <><AppIcon name="cross" size={16} ariaLabel="" className="mr-1 inline" />{t("tr.reject")}</> : <><AppIcon name="check" size={16} ariaLabel="" className="mr-1 inline" />{t("tr.received")}</>}
                      </p>
                      {item.transferEvent.txHash && (
                        <p className="mt-0.5 font-mono text-[12px]" style={{ color: "var(--ink-mute)" }}>{t("verdict.tx")}: {txShort(item.transferEvent.txHash)}</p>
                      )}
                    </div>
                    {idx < groupedJourney.length - 1 && <span className="absolute bottom-0 left-[19px] top-10 w-px" style={{ background: "var(--line)" }} aria-hidden />}
                  </li>
                );
              }
              const completed = item.stage === "COMPLETED";
              const isFail = item.stage === "RECALLED" || item.stage === "TRANSFER_REJECTED";
              return (
                <li key={idx} className="relative flex gap-3 pb-6">
                  <span
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center"
                    style={
                      completed
                        ? { background: "var(--ink)", color: "var(--paper)", borderRadius: "9999px" }
                        : isFail
                          ? { background: "var(--ink)", color: "var(--paper)", borderRadius: "22%" }
                          : { border: "1px solid var(--line-strong)", background: "var(--paper)", borderRadius: "9999px" }
                    }
                    aria-hidden
                  >
                    <AppIcon name={stageIcon(item.stage)} size={18} ariaLabel="" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">
                      {t(`verdict.journey.step.${item.stage === "COMPLETED" ? "retail" : (item.stage === "HARVEST" ? "harvest" : item.stage === "PROCESSING" ? "process" : item.stage === "QUALITY_TESTED" || item.stage === "TESTED" || item.stage === "LAB_TESTING" ? "lab" : item.stage === "DISTRIBUTED" || item.stage === "DISTRIBUTION" ? "distribution" : item.stage === "RETAIL" ? "retail" : item.stage === "RECALLED" ? "" : "") || "harvest"}`) || item.stage}
                    </p>
                    <p className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                      {item.actor}{item.location ? ` · ${item.location}` : ""}{item.date ? ` · ${item.date}` : ""}
                    </p>
                    {item.notes && (
                      <p className="mt-1 text-[14px]" style={{ color: "var(--ink-soft)" }}>{item.notes}</p>
                    )}
                    {item.txHash && (
                      <p className="mt-0.5 font-mono text-[12px]" style={{ color: "var(--ink-mute)" }}>{t("verdict.tx")}: {txShort(item.txHash)}</p>
                    )}
                  </div>
                  {idx < groupedJourney.length - 1 && <span className="absolute bottom-0 left-[19px] top-10 w-px" style={{ background: "var(--line)" }} aria-hidden />}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ═══ Tamper evidence (original vs altered) ═══ */}
      {isTampered && data?.originalDataBeforeTamper && (
        <section className="card mt-4" aria-label={t("danger.tamper.changed")}>
          <h2 className="heading-3 flex items-center gap-2">
            <AppIcon name="warn" size={20} ariaLabel="" />
            {t("danger.tamper.changed")}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-3" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-sm)" }}>
              <span className="block text-[13px]" style={{ color: "var(--ink-mute)" }}>{t("danger.original")}</span>
              <span className="tabular-data block text-[17px] font-bold">{data.originalDataBeforeTamper.quantity} {language === "hi" ? "किलो" : "kg"}</span>
              <span className="block truncate text-[13px]" style={{ color: "var(--ink-soft)" }}>{data.originalDataBeforeTamper.honeyType}</span>
            </div>
            <div className="p-3" style={{ border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)" }}>
              <span className="block text-[13px]" style={{ color: "var(--ink-mute)" }}>{t("danger.current")}</span>
              <span className="tabular-data block text-[17px] font-bold" style={{ color: "var(--danger)" }}>{data.quantity}</span>
              <span className="block truncate text-[13px]" style={{ color: "var(--danger)" }}>{data.honeyType}</span>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Recall details ═══ */}
      {isRecalled && data?.recallDetails && (
        <section className="card mt-4">
          <h2 className="heading-3 flex items-center gap-2">
            <AppIcon name="warn" size={20} ariaLabel="" />
            {t("danger.recall.title")}
          </h2>
          <dl className="mt-2 space-y-1 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt style={{ color: "var(--ink-soft)" }}>{t("danger.by")}</dt>
              <dd className="text-right font-semibold">{data.recallDetails.authority}</dd>
            </div>
            {data.recallDetails.recalledAt && (
              <div className="flex justify-between gap-3">
                <dt style={{ color: "var(--ink-soft)" }}>{t("verdict.harvest")}</dt>
                <dd className="text-right font-semibold">{new Date(data.recallDetails.recalledAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* ═══ Ledger anchor ═══ */}
      <section className="card mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold">{t("verdict.tx")}</h2>
          <span className={`badge ${data?.blockchainVerified ? "badge-verified" : ""}`}>
            <AppIcon name={data?.blockchainVerified ? "check" : "pending"} size={14} ariaLabel="" />
            {data?.blockchainVerified ? "✓" : "◐"} {mode !== "unverified" ? (mode === "on-chain" ? t("verdict.mode.onchain") : t("verdict.mode.dbhash")) : t("state.loading")}
          </span>
        </div>
        {data?.txHash && (
          <p className="mt-1 break-all font-mono text-[12px]" style={{ color: "var(--ink-mute)" }}>{data.txHash}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2" style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          {data?.etherscanUrl && (
            <a href={data.etherscanUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-[44px] text-[14px]">
              <AppIcon name="wallet" size={16} ariaLabel="" />
              Sepolia
            </a>
          )}
          <Link href={`/trace/${encodeURIComponent(batchId)}`} className="btn-ghost min-h-[44px] text-[14px]">
            <AppIcon name="folder" size={16} ariaLabel="" />
            {t("action.details")}
          </Link>
          <button onClick={() => window.print()} className="btn-ghost min-h-[44px] text-[14px]">
            <AppIcon name="folder" size={16} ariaLabel="" />
            QR
          </button>
        </div>
        {data?.contractAddress && (
          <p className="mt-2 break-all font-mono text-[11px]" style={{ color: "var(--ink-mute)" }}>{data.contractAddress}</p>
        )}
      </section>

      {/* ═══ SIH judge demo panel (quiet monochrome) ═══ */}
      <section className="card mt-6" aria-label="SIH 2026 Judge Demo">
        <h2 className="text-[15px] font-semibold">SIH 2026 · Live Attack Simulation</h2>
        <p className="mt-1 text-[14px]" style={{ color: "var(--ink-soft)" }}>
          {language === "hi"
            ? "देखें कि हनीचेन छेड़छाड़ और रिकॉल को तुरंत कैसे पकड़ता है:"
            : "Demonstrate how HoneyChain catches tampering and recalls instantly:"}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {!isTampered ? (
            <button onClick={() => handleTamperAction("tamper")} disabled={busy} className="btn-secondary w-full">
              <AppIcon name="warn" size={20} ariaLabel="" />
              {language === "hi" ? "डेटाबेस छेड़छाड़ का अनुकरण करें" : "Simulate DB Tampering"}
            </button>
          ) : (
            <button onClick={() => handleTamperAction("restore")} disabled={busy} className="btn-secondary w-full">
              <AppIcon name="refresh" size={20} ariaLabel="" />
              {language === "hi" ? "सत्यापित रिकॉर्ड पुनर्स्थापित करें" : "Restore Authentic Record"}
            </button>
          )}
          {!isRecalled ? (
            <button onClick={() => handleRecallAction("recall")} disabled={busy} className="btn-secondary w-full">
              <AppIcon name="warn" size={20} ariaLabel="" />
              {language === "hi" ? "बैच रिकॉल ट्रिगर करें" : "Trigger Batch Recall"}
            </button>
          ) : (
            <button onClick={() => handleRecallAction("restore")} disabled={busy} className="btn-secondary w-full">
              <AppIcon name="refresh" size={20} ariaLabel="" />
              {language === "hi" ? "रिकॉल वापस लें" : "Revoke Batch Recall"}
            </button>
          )}
        </div>
      </section>

      {/* ═══ Print-only certificate (unchanged behavior) ═══ */}
      <div className="hidden print:flex min-h-screen w-full flex-col items-center justify-center bg-white p-10 text-black">
        <h2 className="text-3xl font-bold">HoneyChain Verification</h2>
        <p className="mb-8 font-mono text-lg text-gray-600">Batch ID: {decodeURIComponent(batchId)}</p>
        <div className="rounded-xl border-4 border-gray-900 p-4">
          <QRCodeSVG
            value={typeof window !== "undefined" ? window.location.href : `https://honey-chan.vercel.app/verify/${batchId}`}
            size={250}
          />
        </div>
        <p className="mt-8 font-medium text-gray-500">
          {isVerified ? t("verdict.ok.title") : t(`danger.${dangerKind}.title`)}
        </p>
      </div>
    </div>
  );
}
