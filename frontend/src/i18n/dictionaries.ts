/**
 * Translation catalogues, one JSON per namespace per language. Keys must match
 * between en and ar (enforced by src/i18n/dictionaries.test.ts).
 */
import administrationAr from "./locales/ar/administration.json";
import commonAr from "./locales/ar/common.json";
import landingAr from "./locales/ar/landing.json";
import propertiesAr from "./locales/ar/properties.json";
import recruitmentAr from "./locales/ar/recruitment.json";
import salesAr from "./locales/ar/sales.json";
import shellAr from "./locales/ar/shell.json";
import trainingAr from "./locales/ar/training.json";
import administrationEn from "./locales/en/administration.json";
import commonEn from "./locales/en/common.json";
import landingEn from "./locales/en/landing.json";
import propertiesEn from "./locales/en/properties.json";
import recruitmentEn from "./locales/en/recruitment.json";
import salesEn from "./locales/en/sales.json";
import shellEn from "./locales/en/shell.json";
import trainingEn from "./locales/en/training.json";

export const dictionaries = {
  en: {
    common: commonEn,
    landing: landingEn,
    shell: shellEn,
    recruitment: recruitmentEn,
    training: trainingEn,
    properties: propertiesEn,
    sales: salesEn,
    administration: administrationEn,
  },
  ar: {
    common: commonAr,
    landing: landingAr,
    shell: shellAr,
    recruitment: recruitmentAr,
    training: trainingAr,
    properties: propertiesAr,
    sales: salesAr,
    administration: administrationAr,
  },
} as const;

export type Namespace = keyof (typeof dictionaries)["en"];
