import type { TFunction } from "i18next";

import { formatDate } from "@/lib/format";

/** Year without digit grouping (e.g. 2028, not 2,028), in the locale's numerals. */
export function formatYear(year: number, intlLocale: string): string {
  try {
    return new Intl.NumberFormat(intlLocale, { useGrouping: false }).format(year);
  } catch {
    return String(year);
  }
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today, 3:40 PM" / "Yesterday" / "12 Oct 2026" — avoids plural-heavy relative strings. */
export function formatActivity(iso: string, intlLocale: string, t: TFunction, now = new Date()): string {
  const date = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) {
    let time = "";
    try {
      time = new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit" }).format(date);
    } catch {
      time = iso.slice(11, 16);
    }
    return t("agent:time.todayAt", { time });
  }
  if (days === 1) return t("agent:time.yesterday");
  return formatDate(iso, intlLocale);
}

/** Initials for an avatar, from one or more names. */
export function initials(...names: string[]): string {
  return names
    .flatMap((n) => n.trim().split(/\s+/))
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
