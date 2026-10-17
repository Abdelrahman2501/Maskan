import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Icon, Text } from "@/components/ui";
import { colors, radius, spacing, tints } from "@/theme/tokens";

/**
 * PROTOTYPE ONLY — dashed card holding buttons that simulate backend/staff
 * decisions. Remove together with @/prototype/store.
 */
export function PrototypeControls({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="construct-outline" size={16} color="warning" />
        <Text variant="caption" color="warning" style={styles.flex}>
          {t("prototype.label")}
        </Text>
      </View>
      <Text variant="label" weight="semibold">
        {title}
      </Text>
      <View style={styles.actions}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.warning,
    backgroundColor: tints.warning,
  },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  flex: { flex: 1 },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});
