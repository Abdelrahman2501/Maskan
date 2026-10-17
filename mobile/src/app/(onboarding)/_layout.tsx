import { Stack } from "expo-router";

// Applicant onboarding, Stages 4–8: identity → status → interview → submitted → decision.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
