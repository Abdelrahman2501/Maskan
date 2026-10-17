import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle, Logo } from "@/components/brand/logo";
import { Button, Icon, Screen, Text, type IconName } from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";

const STEPS: { key: string; icon: IconName }[] = [
  { key: "verify", icon: "shield-checkmark-outline" },
  { key: "interview", icon: "videocam-outline" },
  { key: "train", icon: "school-outline" },
  { key: "sell", icon: "business-outline" },
];

// Stage 1 — Welcome
export default function WelcomeScreen() {
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation();
  const { setStage } = usePrototype();

  return (
    <Screen
      dark
      footer={
        <>
          <Button
            variant="inverse"
            size="lg"
            label={t("welcome.apply")}
            trailingIcon="arrow-forward"
            onPress={() => router.push("/(auth)/register")}
          />
          <Button
            variant="inverseOutline"
            size="lg"
            label={t("welcome.login")}
            onPress={() => {
              setStage("guest");
              router.push("/(auth)/login");
            }}
          />
          {/* Prototype shortcut: straight into the qualified-agent workspace. */}
          <Button
            variant="inverseOutline"
            size="sm"
            icon="compass-outline"
            label={t("welcome.explore")}
            onPress={() => {
              setStage("qualified");
              router.replace("/home");
            }}
          />
        </>
      }
    >
      <View style={styles.top}>
        {/* Long-press the logo to open the prototype menu. */}
        <Pressable onLongPress={() => router.push("/prototype")} delayLongPress={500}>
          <Logo tone="light" />
        </Pressable>
        <LanguageToggle tone="light" />
      </View>

      <View style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text variant="caption" color="whiteA70">
            {t("welcome.badge")}
          </Text>
        </View>
        <Text variant="display" color="white">
          {t("welcome.title")}
        </Text>
        <Text variant="body" color="whiteA70">
          {t("welcome.body")}
        </Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step.key} style={styles.step}>
            <View style={styles.stepIcon}>
              <Icon name={step.icon} size={20} color="white" />
            </View>
            <Text variant="caption" color="whiteA70" align="center">
              {`${i + 1}. ${t(`welcome.steps.${step.key}`)}`}
            </Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.push("/prototype")} style={styles.protoLink} accessibilityRole="button">
        <Icon name="construct-outline" size={14} color="whiteA70" />
        <Text variant="caption" color="whiteA70">
          {tc("prototype.label")}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.sm },
  hero: { gap: spacing.lg, marginTop: spacing.xxxl },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.whiteA20,
    backgroundColor: colors.whiteA10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  steps: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xxxl },
  step: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.whiteA10,
    backgroundColor: colors.whiteA10,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.navySecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  protoLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: spacing.xs,
    marginTop: "auto",
    paddingTop: spacing.xl,
  },
});
