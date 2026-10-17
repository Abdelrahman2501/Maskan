import { StyleSheet, View } from "react-native";

import { colors, radius, spacing, tints, type ColorToken } from "@/theme/tokens";

import { Text } from "./text";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "error" | "info";

const TONES: Record<BadgeTone, { bg: string; fg: ColorToken }> = {
  neutral: { bg: colors.background, fg: "inkMuted" },
  brand: { bg: tints.navy, fg: "navy" },
  success: { bg: tints.success, fg: "success" },
  warning: { bg: tints.warning, fg: "warning" },
  error: { bg: tints.error, fg: "error" },
  info: { bg: tints.info, fg: "info" },
};

export function Badge({ label, tone = "neutral", dot = true }: { label: string; tone?: BadgeTone; dot?: boolean }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: colors[t.fg] }]} />}
      <Text variant="caption" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
