import type { TextStyle } from "react-native";

import type { Language } from "@/i18n/languages";

export type Weight = "regular" | "medium" | "semibold" | "bold";

/** Inter for English, IBM Plex Sans Arabic for Arabic (ADR-0003). One family per weight. */
const FAMILIES: Record<Language, Record<Weight, string>> = {
  en: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  ar: {
    regular: "IBMPlexSansArabic_400Regular",
    medium: "IBMPlexSansArabic_500Medium",
    semibold: "IBMPlexSansArabic_600SemiBold",
    bold: "IBMPlexSansArabic_700Bold",
  },
};

export function fontFamily(language: Language, weight: Weight): string {
  return FAMILIES[language][weight];
}

export type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "bodySm" | "label" | "caption";

export const variants: Record<TextVariant, { size: number; lineHeight: number; weight: Weight }> = {
  display: { size: 32, lineHeight: 38, weight: "bold" },
  h1: { size: 26, lineHeight: 32, weight: "bold" },
  h2: { size: 20, lineHeight: 26, weight: "semibold" },
  h3: { size: 17, lineHeight: 23, weight: "semibold" },
  body: { size: 15, lineHeight: 23, weight: "regular" },
  bodySm: { size: 14, lineHeight: 20, weight: "regular" },
  label: { size: 13, lineHeight: 18, weight: "medium" },
  caption: { size: 12, lineHeight: 16, weight: "medium" },
};

/** Arabic glyphs need a little more line height to avoid clipping diacritics. */
export function lineHeightFor(language: Language, base: number): TextStyle["lineHeight"] {
  return language === "ar" ? Math.round(base * 1.15) : base;
}
