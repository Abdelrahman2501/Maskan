import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "./resources";

export const NAMESPACES = ["common", "auth", "onboarding", "training", "agent"] as const;
export type Namespace = (typeof NAMESPACES)[number];

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: NAMESPACES as unknown as string[],
  defaultNS: "common",
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export default i18n;
