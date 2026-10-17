"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useLocale } from "@/i18n/locale-provider";
import type { Localized } from "@/mock/properties";

/** Pick the active language from a bilingual value. */
export function useLocalized() {
  const { language } = useLocale();
  return useCallback((value: Localized | undefined) => (value ? value[language] || value.en : ""), [language]);
}

/**
 * Locale-aware formatters. Money always shows the explicit ISO 4217 code and is
 * never converted between currencies.
 */
export function useFormat() {
  const { intlLocale } = useLocale();
  return useMemo(() => {
    const dateFmt = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" });
    const dateTimeFmt = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short" });
    const numberFmt = new Intl.NumberFormat(intlLocale);
    return {
      money: (amount: string | number, currency: string) => {
        const value = typeof amount === "string" ? Number(amount) : amount;
        try {
          return new Intl.NumberFormat(intlLocale, {
            style: "currency",
            currency,
            currencyDisplay: "code",
            maximumFractionDigits: 2,
          }).format(value);
        } catch {
          return `${numberFmt.format(value)} ${currency}`;
        }
      },
      date: (iso: string) => dateFmt.format(new Date(iso)),
      dateTime: (iso: string) => dateTimeFmt.format(new Date(iso)),
      number: (n: number) => numberFmt.format(n),
      percent: (ratio: number) =>
        new Intl.NumberFormat(intlLocale, { style: "percent", maximumFractionDigits: 1 }).format(ratio),
      bytes: (bytes: number) => {
        const mb = bytes / 1_000_000;
        return mb >= 1
          ? `${new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 }).format(mb)} MB`
          : `${new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 0 }).format(bytes / 1000)} KB`;
      },
    };
  }, [intlLocale]);
}

/**
 * PROTOTYPE ONLY — an in-memory collection shared across admin pages for the
 * session (resets on reload). Stands in for API state.
 */
export function createMemoryStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const get = () => value;
  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    listeners.forEach((l) => l());
  };
  return function useStore(): [T, typeof set] {
    const current = useSyncExternalStore(subscribe, get, () => initial);
    return [current, set];
  };
}

/** Accepts "1234", "1234.5", "1234.50" — up to 12 integer digits and 2 decimals (NUMERIC(14,2)). */
export const DECIMAL_RE = /^\d{1,12}(\.\d{1,2})?$/;

/** E.164: + then 8–15 digits (spaces allowed while typing). */
export const isE164 = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone.replace(/\s+/g, ""));

export const nowIso = () => new Date().toISOString();
