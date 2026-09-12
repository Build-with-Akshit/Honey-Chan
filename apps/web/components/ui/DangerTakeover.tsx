"use client";

/**
 * DangerTakeover — design.md §5.4. The ONLY place --danger and
 * inversion exist. Used for: tampered batch, recalled batch.
 *
 * Behavior: 150ms fade (no bounce), navigator.vibrate([200,100,200]),
 * Hindi warning spoken via TTS on Listen, explicit acknowledge tap
 * required to dismiss. Acknowledge also stops speech + vibration.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface DangerTakeoverProps {
  open: boolean;
  /** "tamper" | "recall" — copy keys: danger.<kind>.* */
  kind: "tamper" | "recall";
  /** Recall reason substituted into danger.recall.body {reason}. */
  reason?: string;
  /** Fired by the acknowledge button. */
  onAcknowledge: () => void;
}

export default function DangerTakeover({
  open,
  kind,
  reason,
  onAcknowledge,
}: DangerTakeoverProps) {
  const { t, language } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const spokenRef = useRef(false);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const stopVibration = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(0);
    }
  }, []);

  // Enter: vibrate once. Reduced motion does NOT disable vibration —
  // it is safety feedback, not animation (content.md §7).
  useEffect(() => {
    if (!open) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    return () => {
      stopVibration();
      stopSpeech();
    };
  }, [open, stopVibration, stopSpeech]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const script =
      t(`danger.${kind}.speak`) || t(`danger.${kind}.body`, { reason: reason ?? "" });
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      language === "hi"
        ? v.lang.startsWith("hi") || v.name.includes("Hindi")
        : v.lang.startsWith("en")
    );
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [kind, reason, t, language]);

  const handleAcknowledge = () => {
    stopSpeech();
    stopVibration();
    onAcknowledge();
  };

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={t(`danger.${kind}.title`)}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-y-auto px-4 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] text-center"
      style={{ backgroundColor: "var(--takeover)", animation: "takeover-in 150ms ease-out" }}
    >
      {/* Giant glyph + title block */}
      <div className="flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-6">
        {/* 120px white cross in a filled --danger rounded square */}
        <div
          className="flex h-[120px] w-[120px] items-center justify-center"
          style={{ backgroundColor: "var(--danger)", borderRadius: 24 }}
          aria-hidden
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <h1
          className="text-[32px] font-bold leading-[1.15] text-[var(--paper)]"
          style={{ textWrap: "balance" }}
        >
          {t(`danger.${kind}.title`)}
        </h1>
        <p className="max-w-[36ch] text-[17px] leading-[1.55] text-white/70" style={{ textWrap: "pretty" }}>
          {t(`danger.${kind}.body`, { reason: reason ?? "" })}
        </p>
      </div>

      {/* Red banner bar (reserved --danger) + actions */}
      <div className="flex w-full max-w-[480px] flex-col gap-3 pb-2">
        <div
          className="flex h-12 items-center justify-center text-[15px] font-bold text-[var(--danger-ink)]"
          style={{ backgroundColor: "var(--danger)", animation: "danger-bar 200ms ease-out", transformOrigin: "left" }}
        >
          ✕ {t(`danger.${kind}.title`)}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={speaking ? stopSpeech : speak}
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-4 text-[15px] font-semibold text-[var(--paper)] transition-opacity active:opacity-85"
          >
            {/* listen glyph */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              {speaking ? <path d="m23 9-6 6M17 9l6 6" /> : <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />}
            </svg>
            {speaking ? t("action.close") : t("listenAudio")}
          </button>

          <button
            type="button"
            onClick={handleAcknowledge}
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-lg bg-[var(--paper)] px-4 text-[15px] font-semibold text-[var(--ink)] transition-opacity active:opacity-85"
          >
            {t("danger.ack")}
          </button>
        </div>
      </div>
    </div>
  );
}
