import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { colors, radius, spacing, tints, type ColorToken } from "@/theme/tokens";

export type TimelineStatus = "done" | "active" | "pending" | "skipped" | "attention";

export type TimelineItem = { key: string; label: string; caption: string; status: TimelineStatus };

const CAPTION_COLOR: Record<TimelineStatus, ColorToken> = {
  done: "success",
  active: "accent",
  pending: "inkMuted",
  skipped: "inkMuted",
  attention: "warning",
};

/** Vertical status timeline (logical layout, mirrors in RTL automatically). */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <View>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.rail}>
              <Marker status={item.status} />
              {!last && <View style={[styles.line, item.status === "done" && styles.lineDone]} />}
            </View>
            <View style={[styles.body, !last && styles.bodyGap]}>
              <Text variant="body" weight={item.status === "pending" ? "regular" : "semibold"} color={item.status === "pending" || item.status === "skipped" ? "inkMuted" : "ink"}>
                {item.label}
              </Text>
              <Text variant="caption" color={CAPTION_COLOR[item.status]}>
                {item.caption}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Marker({ status }: { status: TimelineStatus }) {
  switch (status) {
    case "done":
      return (
        <View style={[styles.marker, { backgroundColor: colors.success, borderColor: colors.success }]}>
          <Icon name="checkmark" size={14} color="white" />
        </View>
      );
    case "active":
      return (
        <View style={[styles.marker, { backgroundColor: tints.info, borderColor: colors.accent }]}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    case "attention":
      return (
        <View style={[styles.marker, { backgroundColor: tints.warning, borderColor: colors.warning }]}>
          <Icon name="alert" size={14} color="warning" />
        </View>
      );
    case "skipped":
      return (
        <View style={styles.marker}>
          <Icon name="remove" size={14} color="inkMuted" />
        </View>
      );
    default:
      return <View style={styles.marker} />;
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  rail: { alignItems: "center", width: 28 },
  marker: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { flex: 1, width: 2, minHeight: 18, backgroundColor: colors.border, marginVertical: spacing.xs },
  lineDone: { backgroundColor: colors.success },
  body: { flex: 1, gap: 2, paddingTop: 3 },
  bodyGap: { paddingBottom: spacing.lg },
});
