import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import { PrototypeControls } from "@/components/onboarding/prototype-controls";
import {
  Badge,
  Button,
  Card,
  Divider,
  Header,
  Icon,
  Notice,
  Screen,
  StatusIcon,
  StepIndicator,
  Text,
  type IconName,
} from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatDate } from "@/lib/format";
import { usePrototype } from "@/prototype/store";
import { radius, spacing, tints } from "@/theme/tokens";

const NEXT: { key: string; icon: IconName }[] = [
  { key: "review", icon: "eye-outline" },
  { key: "decision", icon: "mail-unread-outline" },
  { key: "training", icon: "school-outline" },
];

// Stage 7 — Interview submitted, pending recruiter review
export default function InterviewSubmittedScreen() {
  const { t } = useTranslation("onboarding");
  const { intlLocale } = useLocale();
  const { setStage } = usePrototype();
  const steps = useJourneySteps();
  // Prototype: the backend would return the submission timestamp.
  const [submittedAt] = useState(() => new Date().toISOString());

  return (
    <Screen>
      <Header back={false} trailing={<LanguageToggle />} />
      <StepIndicator steps={steps} current={2} />

      <View style={styles.hero}>
        <StatusIcon name="checkmark-done" tone="success" />
        <View style={styles.badge}>
          <Badge label={t("submitted.badge")} tone="warning" />
        </View>
        <Text variant="h1" align="center">
          {t("submitted.title")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("submitted.body")}
        </Text>
      </View>

      <Card padded={false}>
        <View style={styles.metaRow}>
          <Icon name="calendar-outline" size={18} color="navy" />
          <Text variant="body" color="inkMuted" style={styles.flex}>
            {t("submitted.submittedAt")}
          </Text>
          <Text variant="body" weight="semibold">
            {formatDate(submittedAt, intlLocale, true)}
          </Text>
        </View>
        <Divider />
        <View style={styles.next}>
          <Text variant="h3">{t("submitted.nextTitle")}</Text>
          {NEXT.map((item) => (
            <View key={item.key} style={styles.nextRow}>
              <View style={styles.nextIcon}>
                <Icon name={item.icon} size={18} color="navy" />
              </View>
              <Text variant="bodySm" style={styles.flex}>
                {t(`submitted.next.${item.key}`)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.notice}>
        <Notice tone="info" icon="notifications-outline" body={t("submitted.notify")} />
      </View>

      <PrototypeControls title={t("submitted.simulate.title")}>
        <Button
          size="sm"
          variant="secondary"
          icon="checkmark-circle-outline"
          label={t("submitted.simulate.accept")}
          onPress={() => {
            setStage("training");
            router.replace({ pathname: "/(onboarding)/decision", params: { outcome: "accepted" } });
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          icon="close-circle-outline"
          label={t("submitted.simulate.reject")}
          onPress={() => {
            setStage("rejected");
            router.replace({ pathname: "/(onboarding)/decision", params: { outcome: "rejected" } });
          }}
        />
      </PrototypeControls>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxl, marginBottom: spacing.xl },
  badge: { alignItems: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  next: { padding: spacing.lg, gap: spacing.md },
  nextRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  nextIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: { marginTop: spacing.lg },
});
