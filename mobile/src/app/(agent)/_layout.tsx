import { Stack } from "expo-router";

import { useLocale } from "@/i18n/locale-provider";
import { colors } from "@/theme/tokens";

/** Qualified agent workspace: tabs plus pushed detail screens (compound, unit, lead). */
export default function AgentLayout() {
  const { isRTL } = useLocale();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: isRTL ? "slide_from_left" : "slide_from_right",
      }}
    />
  );
}
