import { getLocales } from "expo-localization";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { storage } from "@/lib/storage";

import i18n from "./index";
import { INTL_LOCALE, isLanguage, RTL_LANGUAGES, type Language } from "./languages";

const STORAGE_KEY = "maskan.language";

type LocaleContextValue = {
  language: Language;
  isRTL: boolean;
  intlLocale: string;
  setLanguage: (language: Language) => void;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isLanguage(code) ? code : "en";
}

/**
 * Owns the active language. Direction is applied by the root layout as a
 * `direction` style (works instantly, including in Expo Go) — native
 * I18nManager auto-flipping is disabled in app.json (supportsRTL: false)
 * so the app fully controls layout direction.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await storage.get(STORAGE_KEY);
      const initial = isLanguage(stored) ? stored : deviceLanguage();
      await i18n.changeLanguage(initial);
      if (!cancelled) {
        setLanguageState(initial);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    void i18n.changeLanguage(next);
    setLanguageState(next);
    void storage.set(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      language,
      isRTL: RTL_LANGUAGES.has(language),
      intlLocale: INTL_LOCALE[language],
      setLanguage,
      ready,
    }),
    [language, setLanguage, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
