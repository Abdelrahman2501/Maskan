"use client";

import { useMemo } from "react";

import { useLocale } from "@/i18n/locale-provider";
import type { Localized } from "@/mock/recruitment";

/**
 * Locale-aware formatters shared by the recruitment and training screens.
 * A fixed time zone keeps server and client renders identical.
 */
export function useFormat() {
  const { language, intlLocale } = useLocale();
  return useMemo(() => {
    const timeZone = "Africa/Cairo";
    const date = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeZone });
    const dateTime = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short", timeZone });
    const num = new Intl.NumberFormat(intlLocale);
    const two = new Intl.NumberFormat(intlLocale, { minimumIntegerDigits: 2 });
    return {
      loc: (value: Localized | undefined) => (value ? value[language] : ""),
      date: (iso: string) => date.format(new Date(iso)),
      dateTime: (iso: string) => dateTime.format(new Date(iso)),
      number: (n: number) => num.format(n),
      percent: (n: number) => `${num.format(Math.round(n))}%`,
      /** m:ss (or h:mm:ss for long totals). */
      duration: (totalSec: number) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = Math.round(totalSec % 60);
        return h > 0 ? `${num.format(h)}:${two.format(m)}:${two.format(s)}` : `${num.format(m)}:${two.format(s)}`;
      },
    };
  }, [language, intlLocale]);
}
