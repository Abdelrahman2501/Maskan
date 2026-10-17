import { useTranslation } from "react-i18next";

/** Labels for the applicant journey StepIndicator: account → identity → interview → training. */
export function useJourneySteps(): string[] {
  const { t } = useTranslation("auth");
  return [t("journey.account"), t("journey.identity"), t("journey.interview"), t("journey.training")];
}
