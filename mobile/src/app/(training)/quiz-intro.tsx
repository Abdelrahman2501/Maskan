import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { getSession, startSession } from "@/components/training/attempt-session";
import { Button, Card, Header, Icon, Notice, Screen, StatusIcon, Text, type IconName } from "@/components/ui";
import { QUIZ_QUESTIONS } from "@/mock/training";
import { QUIZ_MAX_ATTEMPTS, QUIZ_PASS_PCT, QUIZ_TIME_LIMIT_MIN, usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";

const RULES: { key: string; icon: IconName }[] = [
  { key: "single", icon: "radio-button-on-outline" },
  { key: "autosave", icon: "cloud-done-outline" },
  { key: "timer", icon: "timer-outline" },
  { key: "noPause", icon: "phone-portrait-outline" },
  { key: "switching", icon: "eye-outline" },
  { key: "timeout", icon: "send-outline" },
  { key: "attempts", icon: "repeat-outline" },
];

// Stage 10 — Quiz instructions
export default function QuizIntroScreen() {
  const { t } = useTranslation("training");
  const { attempts } = usePrototype();
  const remaining = Math.max(0, QUIZ_MAX_ATTEMPTS - attempts.length);
  const session = getSession();
  // An expired attempt is finalized when the quiz screen opens (QUIZ-005).
  const inProgress = !!session;

  const start = () => {
    if (!inProgress) startSession(QUIZ_QUESTIONS.length, QUIZ_TIME_LIMIT_MIN);
    router.replace("/(training)/quiz");
  };

  const facts: { label: string; value: string; icon: IconName }[] = [
    { label: t("intro.facts.questions"), value: String(QUIZ_QUESTIONS.length), icon: "help-circle-outline" },
    { label: t("intro.facts.timeLimit"), value: t("intro.facts.timeLimitValue", { minutes: QUIZ_TIME_LIMIT_MIN }), icon: "timer-outline" },
    { label: t("intro.facts.passMark"), value: `${QUIZ_PASS_PCT}%`, icon: "trophy-outline" },
    { label: t("intro.facts.attemptsLeft"), value: `${remaining}/${QUIZ_MAX_ATTEMPTS}`, icon: "repeat-outline" },
  ];

  return (
    <Screen
      footer={
        <Button
          size="lg"
          label={inProgress ? t("intro.resume") : t("intro.start")}
          trailingIcon="arrow-forward"
          disabled={!inProgress && remaining === 0}
          onPress={start}
        />
      }
    >
      <Header />
      <StatusIcon name="document-text-outline" tone="navy" size={72} />
      <View style={styles.head}>
        <Text variant="h1" align="center">
          {t("intro.title")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("intro.subtitle")}
        </Text>
      </View>

      <View style={styles.facts}>
        {facts.map((f) => (
          <View key={f.label} style={styles.fact}>
            <Icon name={f.icon} size={18} color="navy" />
            <Text variant="h3">{f.value}</Text>
            <Text variant="caption" color="inkMuted">
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      {inProgress && (
        <View style={styles.notice}>
          <Notice tone="warning" body={t("intro.resumeNote")} icon="timer-outline" />
        </View>
      )}
      {!inProgress && remaining === 0 && (
        <View style={styles.notice}>
          <Notice tone="warning" body={t("intro.noAttempts")} />
        </View>
      )}

      <Text variant="h3" style={styles.sectionTitle}>
        {t("intro.rulesTitle")}
      </Text>
      <Card style={styles.rules}>
        {RULES.map((r) => (
          <View key={r.key} style={styles.rule}>
            <View style={styles.ruleIcon}>
              <Icon name={r.icon} size={16} color="navy" />
            </View>
            <Text variant="bodySm" style={styles.flex}>
              {t(`intro.rules.${r.key}`)}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  facts: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  fact: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  notice: { marginTop: spacing.lg },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  rules: { gap: spacing.md },
  rule: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  ruleIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
