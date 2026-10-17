import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import { PrototypeControls } from "@/components/onboarding/prototype-controls";
import { Timeline, type TimelineItem, type TimelineStatus } from "@/components/onboarding/timeline";
import {
  Badge,
  Button,
  Card,
  Header,
  Icon,
  Notice,
  Screen,
  StatusIcon,
  StepIndicator,
  Text,
  type BadgeTone,
  type IconName,
} from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { spacing } from "@/theme/tokens";

type View_ = "processing" | "review" | "actionRequired" | "approved";

const META: Record<View_, { icon: IconName; tone: "info" | "warning" | "success"; badge: BadgeTone }> = {
  processing: { icon: "scan-outline", tone: "info", badge: "info" },
  review: { icon: "hourglass-outline", tone: "warning", badge: "warning" },
  actionRequired: { icon: "alert-circle-outline", tone: "warning", badge: "warning" },
  approved: { icon: "shield-checkmark", tone: "success", badge: "success" },
};

// Stage 5 — Identity verification status
export default function IdentityStatusScreen() {
  const { t } = useTranslation("onboarding");
  const { stage, setStage } = usePrototype();
  const steps = useJourneySteps();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // Remembers whether approval skipped manual review (OCR auto-approve, Q-02).
  const [autoApproved, setAutoApproved] = useState(false);

  const view: View_ =
    stage === "identity_processing"
      ? "processing"
      : stage === "identity_review"
        ? "review"
        : stage === "identity_action_required"
          ? "actionRequired"
          : "approved";
  const meta = META[view];
  const key = `identityStatus.${view}` as const;

  const caption = (s: TimelineStatus) =>
    ({
      done: t("identityStatus.timeline.done"),
      active: t("identityStatus.timeline.inProgress"),
      pending: t("identityStatus.timeline.waiting"),
      skipped: t("identityStatus.timeline.skipped"),
      attention: t("identityStatus.timeline.attention"),
    })[s];

  const statuses: Record<View_, [TimelineStatus, TimelineStatus, TimelineStatus, TimelineStatus]> = {
    processing: ["done", "active", "pending", "pending"],
    review: ["done", "done", "active", "pending"],
    actionRequired: ["done", "done", "attention", "pending"],
    approved: ["done", "done", autoApproved ? "skipped" : "done", "done"],
  };
  const labels = ["submitted", "check", "review", "approved"] as const;
  const items: TimelineItem[] = labels.map((label, i) => {
    const status = statuses[view][i];
    return { key: label, label: t(`identityStatus.timeline.${label}`), caption: caption(status), status };
  });

  const footer =
    view === "approved" ? (
      <Button
        label={t("identityStatus.approved.continue")}
        size="lg"
        trailingIcon="arrow-forward"
        onPress={() => router.replace("/(onboarding)/interview")}
      />
    ) : view === "actionRequired" ? (
      <Button
        label={t("identityStatus.actionRequired.resubmit")}
        size="lg"
        icon="camera-outline"
        onPress={() => {
          setStage("identity_pending");
          router.replace("/(onboarding)/identity");
        }}
      />
    ) : undefined;

  return (
    <Screen footer={footer}>
      <Header back={false} trailing={<LanguageToggle />} />
      <StepIndicator steps={steps} current={view === "approved" ? 2 : 1} />

      <View style={styles.hero}>
        <StatusIcon name={meta.icon} tone={meta.tone} />
        <View style={styles.badge}>
          <Badge label={t(`${key}.badge`)} tone={meta.badge} />
        </View>
        <Text variant="h1" align="center">
          {t(`${key}.title`)}
        </Text>
        <Text color="inkMuted" align="center">
          {t(`${key}.body`)}
        </Text>
      </View>

      {view === "actionRequired" && (
        <Notice
          tone="warning"
          title={t("identityStatus.actionRequired.reasonLabel")}
          body={t("identityStatus.actionRequired.reason")}
        />
      )}

      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <Text variant="h3">{t("identityStatus.timeline.title")}</Text>
          {id ? (
            <View style={styles.idRow}>
              <Icon name="id-card-outline" size={14} color="inkMuted" />
              <Text variant="caption" color="inkMuted" style={styles.ltr}>
                {id}
              </Text>
            </View>
          ) : null}
        </View>
        <Timeline items={items} />
      </Card>

      {view !== "approved" && (
        <View style={styles.notify}>
          <Icon name="logo-whatsapp" size={18} color="success" />
          <Text variant="bodySm" color="inkMuted" style={styles.flex}>
            {t("identityStatus.notify")}
          </Text>
        </View>
      )}

      {view !== "approved" && (
        <PrototypeControls title={t("identityStatus.simulate.title")}>
          <Button
            size="sm"
            variant="secondary"
            icon="checkmark-circle-outline"
            label={t("identityStatus.simulate.approve")}
            onPress={() => {
              setAutoApproved(stage === "identity_processing");
              setStage("interview_pending");
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            icon="person-outline"
            label={t("identityStatus.simulate.review")}
            disabled={view === "review"}
            onPress={() => setStage("identity_review")}
          />
          <Button
            size="sm"
            variant="secondary"
            icon="refresh-outline"
            label={t("identityStatus.simulate.resubmit")}
            disabled={view === "actionRequired"}
            onPress={() => setStage("identity_action_required")}
          />
        </PrototypeControls>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxl, marginBottom: spacing.xl },
  badge: { alignItems: "center" },
  card: { marginTop: spacing.lg },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  idRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  ltr: { writingDirection: "ltr" },
  notify: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg },
  flex: { flex: 1 },
});
