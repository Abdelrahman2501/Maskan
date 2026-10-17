export const LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof LANGUAGES)[number];

export const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/** Locale tag used for Intl number/date formatting. */
export const INTL_LOCALE: Record<Language, string> = { en: "en-EG", ar: "ar-EG" };
