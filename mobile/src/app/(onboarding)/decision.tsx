import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle, Logo } from "@/components/brand/logo";
import { Button, Icon, Screen, StatusIcon, Text, type IconName } from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";

const NEXT: { key: string; icon: IconName }[] = [
  { key: "courses", icon: "play-circle-outline" },
  { key: "quiz", icon: "ribbon-outline" },
  { key: "agent", icon: "business-outline" },
];

// Stage 8 — Recruiter decision. Internal notes are never shown (INT-008).
export default function DecisionScreen() {
  const { stage } = usePrototype();
  const { outcome } = useLocalSearchParams<{ outcome?: string }>();
  const accepted = outcome ? outcome === "accepted" : stage !== "rejected";
  return accepted ? <Accepted /> : <Rejected />;
}

function Accepted() {
  const { t } = useTranslation("onboarding");
  const { profile } = usePrototype();

  return (
    <Screen
      dark
      footer={
        <Button
          variant="inverse"
          size="lg"
          label={t("decision.accepted.continue")}
          trailingIcon="arrow-forward"
          onPress={() => router.replace("/(training)")}
        />
      }
    >
      <View style={styles.top}>
        <Logo tone="light" />
        <LanguageToggle tone="light" />
      </View>

      <View style={styles.acceptedHero}>
        <View style={styles.halo}>
          <View style={styles.haloInner}>
            <Icon name="trophy" size={44} color="navy" />
          </View>
        </View>
        <Text variant="label" color="whiteA70" align="center">
          {t("decision.accepted.eyebrow", { name: profile.firstName })}
        </Text>
        <Text variant="display" color="white" align="center">
          {t("decision.accepted.title")}
        </Text>
        <Text color="whiteA70" align="center">
          {t("decision.accepted.body")}
        </Text>
      </View>

      <View style={styles.nextCard}>
        <Text variant="h3" color="white">
          {t("decision.accepted.nextTitle")}
        </Text>
        {NEXT.map((item) => (
          <View key={item.key} style={styles.nextRow}>
            <View style={styles.nextIcon}>
              <Icon name={item.icon} size={18} color="white" />
            </View>
            <Text variant="bodySm" color="white" style={styles.flex}>
              {t(`decision.accepted.next.${item.key}`)}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function Rejected() {
  const { t } = useTranslation("onboarding");
  const { t: tc } = useTranslation();
  const { setStage } = usePrototype();

  return (
    <Screen
      footer={
        <>
          <Button size="lg" label={t("decision.rejected.home")} onPress={() => router.replace("/")} />
          <Button
            variant="ghost"
            icon="log-out-outline"
            label={tc("actions.logout")}
            onPress={() => {
              setStage("guest");
              router.replace("/");
            }}
          />
        </>
      }
    >
      <View style={styles.top}>
        <Logo />
        <LanguageToggle />
      </View>

      <View style={styles.rejectedHero}>
        <StatusIcon name="mail-open-outline" tone="navy" />
        <Text variant="h1" align="center">
          {t("decision.rejected.title")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("decision.rejected.body")}
        </Text>
      </View>

      <View style={styles.rejectedNote}>
        <Text variant="bodySm" align="center">
          {t("decision.rejected.note")}
        </Text>
        <Text variant="caption" color="inkMuted" align="center">
          {t("decision.rejected.contact")}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  acceptedHero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxl, marginBottom: spacing.xxl },
  halo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.whiteA10,
    borderWidth: 1,
    borderColor: colors.whiteA20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  haloInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  nextCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.whiteA10,
    borderWidth: 1,
    borderColor: colors.whiteA20,
  },
  nextRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  nextIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.whiteA10,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectedHero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxxl, marginBottom: spacing.xl },
  rejectedNote: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
