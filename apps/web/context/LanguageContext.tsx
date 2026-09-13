"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { translations, SUPPORTED_LANGUAGES, LANGUAGE_METADATA, type Language } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "hi", // Hindi-first (plan.md decision #1)
  setLanguage: () => {},
  cycleLanguage: () => {},
  t: (key) => String(key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Hindi is the default; saved preference wins after first visit.
  const [language, setLanguageState] = useState<Language>("hi");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("honeychain_lang") as Language;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "hi";
    }
  }, []);

  const showLanguageToast = (lang: Language) => {
    const meta = LANGUAGE_METADATA[lang];
    const label = meta ? `${meta.nativeName}` : lang.toUpperCase();
    setToastMessage(`🌐 ${label}`);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  const setLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem("honeychain_lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const cycleLanguage = (fromKeyboard = false) => {
    setLanguageState((curr) => {
      const idx = SUPPORTED_LANGUAGES.indexOf(curr);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % SUPPORTED_LANGUAGES.length;
      const nextLang = SUPPORTED_LANGUAGES[nextIdx];
      try {
        localStorage.setItem("honeychain_lang", nextLang);
      } catch {}
      if (typeof document !== "undefined") {
        document.documentElement.lang = nextLang;
      }
      if (fromKeyboard) {
        showLanguageToast(nextLang);
      }
      return nextLang;
    });
  };

  // Alt + T shortcut listener — loops through all supported languages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAlt = e.altKey;
      const isT = e.key === "t" || e.key === "T" || e.code === "KeyT" || e.key === "†";

      if (isAlt && isT && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        cycleLanguage(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // v2 t(): dotted keys + {var} interpolation; falls back to en, then key.
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = (translations[language] ?? translations.en) as Record<string, string>;
    const en = translations.en as Record<string, string>;
    let value = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, cycleLanguage, t }}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none transition-all duration-200"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-xl text-sm font-semibold backdrop-blur-md bg-neutral-900/95 text-white border-neutral-700">
            <span>{toastMessage}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/20 text-neutral-200 font-mono">
              Alt + T
            </span>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
