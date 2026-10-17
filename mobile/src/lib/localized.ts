import { useLocale } from "@/i18n/locale-provider";

/** Bilingual content field for mock/server data (titles, descriptions). */
export type Localized = { en: string; ar: string };

export function useLocalized() {
  const { language } = useLocale();
  return (value: Localized) => value[language];
}
