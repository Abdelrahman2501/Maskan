"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

import { createPersistedStore } from "@/lib/persisted-store";

import { DIRECTION, INTL_LOCALE, isLanguage, type Language } from "./config";

type LocaleContextValue = {
  language: Language;
  dir: "ltr" | "rtl";
  intlLocale: string;
  setLanguage: (language: Language) => void;
};

const FALLBACK: LocaleContextValue = {
  language: "en",
  dir: "ltr",
  intlLocale: INTL_LOCALE.en,
  setLanguage: () => {},
};

const LocaleContext = createContext<LocaleContextValue>(FALLBACK);
const useStoredLanguage = createPersistedStore<Language>("elsakka.language", "en", isLanguage);

/**
 * Client-side language state (prototype). Persists the choice and keeps
 * <html lang/dir> in sync so CSS logical properties flip the whole layout.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useStoredLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = DIRECTION[language];
  }, [language]);

  const value = useMemo(
    () => ({ language, dir: DIRECTION[language], intlLocale: INTL_LOCALE[language], setLanguage }),
    [language, setLanguage],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
