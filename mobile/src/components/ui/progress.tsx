import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";

import { Icon } from "./icon";
import { Text } from "./text";

export function ProgressBar({
  value,
  tone = "accent",
  height = 6,
}: {
  /** 0..1 */
  value: number;
  tone?: "accent" | "success" | "navy";
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { height, borderRadius: height / 2 }]}
    >
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: colors[tone] }} />
    </View>
  );
}

/** Horizontal step indicator for the onboarding journey. */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={styles.steps}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={styles.step}>
            <View style={styles.stepTop}>
              <View
                style={[
                  styles.circle,
                  done && styles.circleDone,
                  active && styles.circleActive,
                ]}
              >
                {done ? (
                  <Icon name="checkmark" size={14} color="white" />
                ) : (
                  <Text variant="caption" color={active ? "white" : "inkMuted"} align="center">
                    {String(i + 1)}
                  </Text>
                )}
              </View>
              {i < steps.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <Text
              variant="caption"
              color={active ? "navy" : done ? "ink" : "inkMuted"}
              numberOfLines={1}
              style={styles.stepLabel}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", backgroundColor: colors.border, overflow: "hidden" },
  steps: { flexDirection: "row" },
  step: { flex: 1, gap: spacing.xs + 2 },
  stepTop: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: { backgroundColor: colors.success, borderColor: colors.success },
  circleActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: spacing.xs },
  lineDone: { backgroundColor: colors.success },
  stepLabel: { paddingEnd: spacing.xs },
});
