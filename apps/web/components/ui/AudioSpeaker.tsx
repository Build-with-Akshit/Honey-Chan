"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AudioSpeakerProps {
  text?: string;
  className?: string;
  label?: string;
}

export function AudioSpeaker({ text, className = "", label }: AudioSpeakerProps) {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!supported || typeof window === "undefined") return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = text || t("audioSummary");
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Find best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      language === "hi"
        ? v.lang.startsWith("hi") || v.name.includes("Hindi")
        : v.lang === "en-IN" || v.lang.startsWith("en")
    );
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleToggleSpeak}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
        isSpeaking
          ? "bg-[var(--honey-500)] text-white animate-pulse"
          : "bg-[var(--honey-50)] text-[var(--honey-700)] border border-[var(--honey-300)] hover:bg-[var(--honey-100)]"
      } ${className}`}
      title={isSpeaking ? t("stopAudio") : t("listenAudio")}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={15} />
          <span>{t("stopAudio")}</span>
        </>
      ) : (
        <>
          <Volume2 size={15} />
          <Sparkles size={13} className="text-[var(--honey-500)]" />
          <span>{label || t("listenAudio")}</span>
        </>
      )}
    </button>
  );
}
