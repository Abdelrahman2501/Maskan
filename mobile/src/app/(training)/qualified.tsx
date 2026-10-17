import { router, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button, Icon, Screen, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatDate } from "@/lib/format";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";

const UNLOCKED: { key: "catalogue" | "leads" | "profile"; icon: IconName }[] = [
  { key: "catalogue", icon: "business-outline" },
  { key: "leads", icon: "people-outline" },
  { key: "profile", icon: "person-circle-outline" },
];

// Stage 11 — Qualified
export default function QualifiedScreen() {
  const { t } = useTranslation("training");
  const { intlLocale } = useLocale();
  const { attempts, profile } = usePrototype();
  const qualifiedAt = attempts.find((a) => a.passed)?.at ?? new Date().toISOString();

  return (
    <Screen
      dark
      footer={
        <Button
          variant="inverse"
          size="lg"
          label={t("qualified.open")}
          trailingIcon="arrow-forward"
          onPress={() => router.replace("/(agent)/home" as Href)}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.halo}>
          <View style={styles.medal}>
            <Icon name="ribbon" size={44} color="white" />
          </View>
        </View>
        <View style={styles.badge}>
          <Icon name="checkmark-circle" size={14} color="success" />
          <Text variant="caption" color="whiteA70">
            {t("qualified.badge")}
          </Text>
        </View>
        <Text variant="display" color="white" align="center">
          {t("qualified.title")}
        </Text>
        <Text variant="h3" color="white" align="center">
          {`${profile.firstName} ${profile.lastName}`}
        </Text>
        <Text color="whiteA70" align="center">
          {t("qualified.body")}
        </Text>
        <View style={styles.date}>
          <Icon name="calendar-outline" size={14} color="whiteA70" />
          <Text variant="label" color="whiteA70">
            {t("qualified.qualifiedOn", { date: formatDate(qualifiedAt, intlLocale) })}
          </Text>
        </View>
      </View>

      <Text variant="label" color="whiteA70" style={styles.sectionTitle}>
        {t("qualified.unlockedTitle")}
      </Text>
      <View style={styles.list}>
        {UNLOCKED.map((item) => (
          <View key={item.key} style={styles.item}>
            <View style={styles.itemIcon}>
              <Icon name={item.icon} size={20} color="white" />
            </View>
            <View style={styles.flex}>
              <Text variant="body" weight="semibold" color="white">
                {t(`qualified.unlocked.${item.key}`)}
              </Text>
              <Text variant="caption" color="whiteA70">
                {t(`qualified.unlocked.${item.key}Body`)}
              </Text>
            </View>
            <Icon name="lock-open-outline" size={16} color="whiteA70" />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxl },
  halo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: colors.whiteA20,
    backgroundColor: colors.whiteA10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  medal: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.navySecondary,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.whiteA20,
    backgroundColor: colors.whiteA10,
  },
  date: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2, marginTop: spacing.xs },
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.whiteA10,
    backgroundColor: colors.whiteA10,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.navySecondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
