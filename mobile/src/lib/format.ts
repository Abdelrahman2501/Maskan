/** Locale-aware formatting. Prices always keep their explicit ISO currency (BR-3.3). */

export function formatMoney(amount: number, currency: string, intlLocale: string): string {
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(value: number, intlLocale: string): string {
  try {
    return new Intl.NumberFormat(intlLocale).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(iso: string, intlLocale: string, withTime = false): string {
  try {
    return new Intl.DateTimeFormat(intlLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
