import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { Icon, type IconName } from "@/components/ui";
import { colors, radius, spacing } from "@/theme/tokens";

/** Placeholder palettes (base, accent layer) built only from tokens. */
const TONES: { base: string; layer: string; glow: string }[] = [
  { base: colors.navy, layer: colors.navySecondary, glow: colors.accent },
  { base: colors.navySecondary, layer: colors.accent, glow: colors.navy },
  { base: colors.navyDeep, layer: colors.navy, glow: colors.navySecondary },
  { base: colors.navy, layer: colors.accent, glow: colors.navySecondary },
  { base: colors.navyDeep, layer: colors.navySecondary, glow: colors.accent },
];

/** Skyline silhouette: [relative height, width] per block. Varied per tone. */
const SKYLINES: number[][] = [
  [0.35, 0.55, 0.8, 0.45, 0.6, 0.3],
  [0.25, 0.4, 0.4, 0.3, 0.5, 0.45],
  [0.5, 0.9, 0.65, 0.75, 0.4, 0.55],
  [0.3, 0.6, 0.45, 0.7, 0.35, 0.5],
  [0.45, 0.7, 0.85, 0.5, 0.65, 0.4],
];

/**
 * PROTOTYPE image placeholder — a layered navy "photo" with a skyline motif.
 * Real media (PROP-005) replaces this.
 */
export function PropertyCover({
  tone,
  height = 160,
  icon = "business",
  rounded = true,
  children,
  style,
}: {
  tone: number;
  height?: number;
  icon?: IconName;
  rounded?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
}) {
  const palette = TONES[Math.abs(tone) % TONES.length];
  const skyline = SKYLINES[Math.abs(tone) % SKYLINES.length];
  const blockMax = height * 0.55;

  return (
    <View
      style={[
        styles.cover,
        { height, backgroundColor: palette.base },
        rounded && styles.rounded,
        style,
      ]}
    >
      <View
        style={[
          styles.orb,
          { backgroundColor: palette.layer, width: height * 1.3, height: height * 1.3, borderRadius: height },
        ]}
      />
      <View
        style={[
          styles.orbSmall,
          { backgroundColor: palette.glow, width: height * 0.7, height: height * 0.7, borderRadius: height },
        ]}
      />
      <View style={styles.band} />
      <View style={styles.skyline}>
        {skyline.map((h, i) => (
          <View key={i} style={[styles.block, { height: blockMax * h }]}>
            <View style={styles.windowRow} />
            <View style={styles.windowRow} />
          </View>
        ))}
      </View>
      <View style={styles.center}>
        <View style={styles.iconRing}>
          <Icon name={icon} size={Math.min(30, height * 0.18)} color="white" />
        </View>
      </View>
      {children && <View style={styles.overlay}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: "hidden", justifyContent: "center", alignItems: "center" },
  rounded: { borderRadius: radius.lg },
  orb: { position: "absolute", top: "-45%", end: "-25%", opacity: 0.55 },
  orbSmall: { position: "absolute", bottom: "-30%", start: "-12%", opacity: 0.35 },
  band: {
    position: "absolute",
    start: 0,
    end: 0,
    bottom: 0,
    height: "28%",
    backgroundColor: colors.whiteA10,
  },
  skyline: {
    position: "absolute",
    start: spacing.lg,
    end: spacing.lg,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  block: {
    flex: 1,
    backgroundColor: colors.whiteA10,
    borderTopStartRadius: radius.sm,
    borderTopEndRadius: radius.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  windowRow: { height: 3, borderRadius: 2, backgroundColor: colors.whiteA10 },
  center: { alignItems: "center", justifyContent: "center" },
  iconRing: {
    padding: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteA10,
    borderWidth: 1,
    borderColor: colors.whiteA20,
  },
  overlay: { ...StyleSheet.absoluteFill, padding: spacing.md, justifyContent: "space-between" },
});
