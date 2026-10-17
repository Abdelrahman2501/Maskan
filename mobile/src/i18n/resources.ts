/**
 * Locale catalogues, one JSON file per namespace per language.
 * Keys must match between en and ar (enforced by __tests__/i18n-parity-test.ts).
 */
import agentAr from "./locales/ar/agent.json";
import authAr from "./locales/ar/auth.json";
import commonAr from "./locales/ar/common.json";
import onboardingAr from "./locales/ar/onboarding.json";
import trainingAr from "./locales/ar/training.json";
import agentEn from "./locales/en/agent.json";
import authEn from "./locales/en/auth.json";
import commonEn from "./locales/en/common.json";
import onboardingEn from "./locales/en/onboarding.json";
import trainingEn from "./locales/en/training.json";

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    onboarding: onboardingEn,
    training: trainingEn,
    agent: agentEn,
  },
  ar: {
    common: commonAr,
    auth: authAr,
    onboarding: onboardingAr,
    training: trainingAr,
    agent: agentAr,
  },
} as const;
