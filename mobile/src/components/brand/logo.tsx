import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Icon, Text } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { colors, radius, spacing } from "@/theme/tokens";

/** Placeholder wordmark until the client supplies a brand kit (Q-23). */
export function Logo({ tone = "dark", size = "md" }: { tone?: "dark" | "light"; size?: "md" | "lg" }) {
  const { t } = useTranslation();
  const light = tone === "light";
  const box = size === "lg" ? 44 : 34;
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: box, height: box, backgroundColor: light ? colors.white : colors.navy }]}>
        <Icon name="business" size={box * 0.5} color={light ? "navy" : "white"} />
      </View>
      <Text variant={size === "lg" ? "h1" : "h3"} weight="bold" color={light ? "white" : "navy"}>
        {t("brand")}
      </Text>
    </View>
  );
}

/** Compact language switch (shows the *other* language's name). */
export function LanguageToggle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { language, setLanguage } = useLocale();
  const { t } = useTranslation();
  const light = tone === "light";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("language.title")}
      onPress={() => setLanguage(language === "en" ? "ar" : "en")}
      style={[styles.toggle, light ? styles.toggleLight : styles.toggleDark]}
      hitSlop={6}
    >
      <Icon name="globe-outline" size={16} color={light ? "white" : "navy"} />
      <Text variant="label" color={light ? "white" : "navy"}>
        {t("language.switchTo")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  mark: { borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleLight: { borderColor: colors.whiteA20, backgroundColor: colors.whiteA10 },
  toggleDark: { borderColor: colors.border, backgroundColor: colors.surface },
});
