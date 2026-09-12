"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "hi", // Hindi-first (plan.md decision #1)
  setLanguage: () => {},
  t: (key) => String(key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Hindi is the default; saved preference wins after first visit.
  const [language, setLanguageState] = useState<Language>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("honeychain_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLanguageState(saved);
    }
    document.documentElement.lang = saved === "en" ? "en" : "hi";
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("honeychain_lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "hi";
  };

  // v2 t(): dotted keys + {var} interpolation; falls back to en, then key.
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[language] as Record<string, string>;
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
