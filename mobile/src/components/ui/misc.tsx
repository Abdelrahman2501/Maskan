import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, spacing, tints, type ColorToken } from "@/theme/tokens";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

/** Big circular icon used on status/result screens. */
export function StatusIcon({
  name,
  tone,
  size = 88,
}: {
  name: IconName;
  tone: "success" | "warning" | "error" | "info" | "navy";
  size?: number;
}) {
  const bg = tone === "navy" ? tints.navy : tints[tone];
  const fg: ColorToken = tone === "navy" ? "navy" : tone;
  return (
    <View style={[styles.statusOuter, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Icon name={name} size={size * 0.45} color={fg} />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={28} color="navy" />
      </View>
      <Text variant="h3" align="center">
        {title}
      </Text>
      {body && (
        <Text variant="bodySm" color="inkMuted" align="center">
          {body}
        </Text>
      )}
      {action}
    </View>
  );
}

/** Tappable settings/list row with leading icon and trailing chevron. */
export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  destructive = false,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      {icon && (
        <View style={[styles.rowIcon, destructive && { backgroundColor: tints.error }]}>
          <Icon name={icon} size={18} color={destructive ? "error" : "navy"} />
        </View>
      )}
      <View style={styles.flex}>
        <Text variant="body" weight="medium" color={destructive ? "error" : "ink"}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="inkMuted">
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ?? (onPress && <Icon name="chevron-forward" size={18} color="inkMuted" directional />)}
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

/** Inline notice box (info / warning / error / success). */
export function Notice({
  tone = "info",
  title,
  body,
  icon,
}: {
  tone?: "info" | "warning" | "error" | "success";
  title?: string;
  body: string;
  icon?: IconName;
}) {
  const defaultIcons: Record<typeof tone, IconName> = {
    info: "information-circle",
    warning: "warning",
    error: "alert-circle",
    success: "checkmark-circle",
  };
  return (
    <View style={[styles.notice, { backgroundColor: tints[tone] }]}>
      <Icon name={icon ?? defaultIcons[tone]} size={20} color={tone} />
      <View style={styles.flex}>
        {title && (
          <Text variant="label" weight="semibold" color={tone}>
            {title}
          </Text>
        )}
        <Text variant="bodySm" color="ink">
          {body}
        </Text>
      </View>
    </View>
  );
}

/** Section heading with optional trailing action link. */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="h3">{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text variant="label" color="accent">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/** Horizontal filter chips. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text variant="label" color={selected ? "white" : "ink"}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusOuter: { alignItems: "center", justifyContent: "center", alignSelf: "center" },
  empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  rowPressed: { backgroundColor: colors.background },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: colors.border },
  notice: { flexDirection: "row", gap: spacing.md, padding: spacing.md + 2, borderRadius: radius.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
});
