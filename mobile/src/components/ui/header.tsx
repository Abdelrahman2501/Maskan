import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors, spacing } from "@/theme/tokens";

import { Icon } from "./icon";
import { Text } from "./text";

/** Top bar with a direction-aware back button, title, and optional trailing action. */
export function Header({
  title,
  back = true,
  onBack,
  trailing,
  dark = false,
}: {
  title?: string;
  back?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
  dark?: boolean;
}) {
  const { t } = useTranslation();
  const fg = dark ? "white" : "navy";

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("actions.back")}
            hitSlop={10}
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))}
            style={[styles.iconButton, dark && styles.iconButtonDark]}
          >
            <Icon name="chevron-back" size={22} color={fg} directional />
          </Pressable>
        )}
      </View>
      {title ? (
        <Text variant="h3" color={fg} align="center" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.side, styles.trailing]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  side: { width: 44 },
  trailing: { alignItems: "flex-end" },
  title: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonDark: { backgroundColor: colors.whiteA10, borderColor: colors.whiteA20 },
});
