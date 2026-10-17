export const LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export const DIRECTION: Record<Language, "ltr" | "rtl"> = { en: "ltr", ar: "rtl" };
export const INTL_LOCALE: Record<Language, string> = { en: "en-EG", ar: "ar-EG" };
