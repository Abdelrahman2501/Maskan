import { Redirect, router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button, Card, Notice, ProgressBar, Screen, StatusIcon, Text } from "@/components/ui";
import { QUIZ_MAX_ATTEMPTS, QUIZ_PASS_PCT, usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";

// Stage 10 — Quiz result (QUIZ-008: pass/fail, score, remaining attempts; answers never revealed)
export default function QuizResultScreen() {
  const { t } = useTranslation("training");
  const params = useLocalSearchParams<{ score?: string; total?: string }>();
  const { stage, attempts } = usePrototype();

  const last = attempts[attempts.length - 1];
  const parsedScore = Number(params.score);
  const parsedTotal = Number(params.total);
  const hasParams = Number.isFinite(parsedScore) && Number.isFinite(parsedTotal) && parsedTotal > 0;
  const score = hasParams ? parsedScore : last?.score;
  const total = hasParams ? parsedTotal : last?.total;

  const remaining = Math.max(0, QUIZ_MAX_ATTEMPTS - attempts.length);
  const exhausted = stage === "quiz_exhausted" || (remaining === 0 && !attempts.some((a) => a.passed));

  if (score === undefined || total === undefined) {
    if (exhausted) return <Exhausted />;
    return <Redirect href="/(training)" />;
  }

  const percent = Math.round((score / total) * 100);
  const passed = percent >= QUIZ_PASS_PCT;

  const scoreCard = (
    <Card style={styles.scoreCard}>
      <Text variant="label" color="inkMuted" align="center">
        {t("result.scoreLabel")}
      </Text>
      <Text variant="display" color={passed ? "success" : "navy"} align="center" style={styles.digits}>
        {t("result.score", { score, total, percent })}
      </Text>
      <View style={styles.bar}>
        <ProgressBar value={score / total} tone={passed ? "success" : "accent"} height={8} />
        {/* Pass-mark tick */}
        <View style={[styles.tick, { start: `${QUIZ_PASS_PCT}%` }]} />
      </View>
      <Text variant="caption" color="inkMuted" align="center">
        {t("result.passMark", { percent: QUIZ_PASS_PCT })}
      </Text>
    </Card>
  );

  if (passed) {
    return (
      <Screen
        footer={
          <Button
            size="lg"
            label={t("result.continue")}
            trailingIcon="arrow-forward"
            onPress={() => router.replace("/(training)/qualified")}
          />
        }
      >
        <View style={styles.hero}>
          <StatusIcon name="checkmark-circle" tone="success" />
          <Text variant="h1" align="center">
            {t("result.passedTitle")}
          </Text>
          <Text color="inkMuted" align="center">
            {t("result.passedBody")}
          </Text>
        </View>
        {scoreCard}
      </Screen>
    );
  }

  if (exhausted) return <Exhausted scoreCard={scoreCard} />;

  return (
    <Screen
      footer={
        <>
          <Button size="lg" label={t("result.tryAgain")} onPress={() => router.replace("/(training)/quiz-intro")} />
          <Button size="lg" variant="secondary" label={t("result.reviewTraining")} onPress={() => router.replace("/(training)")} />
        </>
      }
    >
      <View style={styles.hero}>
        <StatusIcon name="refresh-circle-outline" tone="warning" />
        <Text variant="h1" align="center">
          {t("result.failedTitle")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("result.failedBody")}
        </Text>
      </View>
      {scoreCard}
      <View style={styles.notes}>
        <Notice tone="info" icon="repeat-outline" body={t("result.attemptsRemaining", { count: remaining })} />
        <Text variant="caption" color="inkMuted" align="center">
          {t("result.noAnswersNote")}
        </Text>
      </View>
    </Screen>
  );
}

function Exhausted({ scoreCard }: { scoreCard?: ReactNode }) {
  const { t } = useTranslation("training");
  return (
    <Screen
      footer={<Button size="lg" variant="secondary" label={t("result.backToTraining")} onPress={() => router.replace("/(training)")} />}
    >
      <View style={styles.hero}>
        <StatusIcon name="hourglass-outline" tone="navy" />
        <Text variant="h1" align="center">
          {t("result.exhaustedTitle")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("result.exhaustedBody")}
        </Text>
      </View>
      {scoreCard}
      <View style={styles.notes}>
        <Notice tone="info" icon="repeat-outline" body={t("result.attemptsRemaining", { count: 0 })} />
        <Text variant="caption" color="inkMuted" align="center">
          {t("result.noAnswersNote")}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xxxl, marginBottom: spacing.xl },
  scoreCard: { gap: spacing.md, alignItems: "stretch" },
  digits: { fontVariant: ["tabular-nums"] },
  bar: { justifyContent: "center", marginTop: spacing.xs },
  tick: {
    position: "absolute",
    width: 2,
    height: 16,
    marginStart: -1,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  notes: { gap: spacing.md, marginTop: spacing.lg },
});
