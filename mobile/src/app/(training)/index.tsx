import { router, type Href } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import { courseStats, useTrainingProgress } from "@/components/training/progress";
import { Badge, Button, Card, Divider, Icon, ProgressBar, StepIndicator, Screen, Text, type IconName } from "@/components/ui";
import { useLocalized } from "@/lib/localized";
import { formatDuration } from "@/lib/format";
import { ALL_VIDEOS, COURSES, QUIZ_QUESTIONS } from "@/mock/training";
import { QUIZ_MAX_ATTEMPTS, QUIZ_PASS_PCT, QUIZ_TIME_LIMIT_MIN, usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";

const MISSING_SHOWN = 3;

// Stage 9 — Training dashboard
export default function TrainingDashboard() {
  const { t } = useTranslation("training");
  const { t: tc } = useTranslation();
  const steps = useJourneySteps();
  const loc = useLocalized();
  const { profile, stage, videoProgress, attempts, setStage, setVideoProgress } = usePrototype();
  const progress = useTrainingProgress();

  // T10 — training → quiz_eligible once the completion rule is met.
  useEffect(() => {
    if (stage === "training" && progress.allDone) setStage("quiz_eligible");
  }, [stage, progress.allDone, setStage]);

  const passed = stage === "qualified" || attempts.some((a) => a.passed);
  const remaining = Math.max(0, QUIZ_MAX_ATTEMPTS - attempts.length);
  const exhausted = !passed && (stage === "quiz_exhausted" || remaining === 0);

  const markAllWatched = () => ALL_VIDEOS.forEach((v) => setVideoProgress(v.id, 1));

  return (
    <Screen>
      <View style={styles.top}>
        <Text variant="label" color="accent">
          {t("dashboard.eyebrow")}
        </Text>
        <LanguageToggle />
      </View>

      <View style={styles.head}>
        <Text variant="h1">{t("dashboard.greeting", { name: profile.firstName })}</Text>
        <Text color="inkMuted">{t("dashboard.subtitle")}</Text>
      </View>

      <StepIndicator steps={steps} current={3} />

      {/* Overall progress */}
      <View style={styles.overall}>
        <View style={styles.overallRow}>
          <View style={styles.flex}>
            <Text variant="label" color="whiteA70">
              {t("dashboard.overallTitle")}
            </Text>
            <Text variant="h2" color="white">
              {t("dashboard.overallVideos", { watched: progress.watched, total: progress.total })}
            </Text>
          </View>
          <View style={styles.overallIcon}>
            <Icon name="school-outline" size={22} color="white" />
          </View>
        </View>
        <ProgressBar value={progress.fraction} tone={progress.allDone ? "success" : "accent"} height={8} />
        <Text variant="caption" color="whiteA70">
          {t("dashboard.overallPercent", { percent: Math.round(progress.fraction * 100) })}
        </Text>
      </View>

      {/* Courses */}
      <Text variant="h3" style={styles.sectionTitle}>
        {t("dashboard.coursesTitle")}
      </Text>
      <View style={styles.list}>
        {COURSES.map((course, i) => {
          const s = courseStats(course, videoProgress);
          const done = s.watched === s.total;
          return (
            <Card
              key={course.id}
              accessibilityLabel={loc(course.title)}
              onPress={() => router.push({ pathname: "/(training)/course/[id]", params: { id: course.id } })}
            >
              <View style={styles.courseTop}>
                <View style={[styles.courseNum, done && styles.courseNumDone]}>
                  {done ? (
                    <Icon name="checkmark" size={16} color="white" />
                  ) : (
                    <Text variant="label" weight="semibold" color="navy">
                      {String(i + 1)}
                    </Text>
                  )}
                </View>
                <View style={styles.flex}>
                  <Text variant="h3">{loc(course.title)}</Text>
                  <Text variant="bodySm" color="inkMuted" numberOfLines={2}>
                    {loc(course.description)}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={18} color="inkMuted" directional />
              </View>
              <View style={styles.courseMeta}>
                <Meta icon="videocam-outline" label={t("dashboard.courseVideos", { count: s.total })} />
                <Meta icon="time-outline" label={formatDuration(s.durationSec)} />
                <View style={styles.metaEnd}>
                  <Badge
                    tone={done ? "success" : s.fraction > 0 ? "info" : "neutral"}
                    label={
                      done
                        ? t("dashboard.courseCompleted")
                        : s.fraction > 0
                          ? t("dashboard.courseInProgress")
                          : t("dashboard.courseNotStarted")
                    }
                  />
                </View>
              </View>
              <View style={styles.courseProgress}>
                <ProgressBar value={s.fraction} tone={done ? "success" : "accent"} />
                <Text variant="caption" color="inkMuted">
                  {t("dashboard.courseWatched", { watched: s.watched, total: s.total })}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Quiz */}
      <Text variant="h3" style={styles.sectionTitle}>
        {t("dashboard.quiz.title")}
      </Text>
      <Card>
        {passed ? (
          <QuizState
            icon="ribbon-outline"
            tone="success"
            title={t("dashboard.quiz.passedTitle")}
            body={t("dashboard.quiz.passedBody")}
          >
            <Button label={t("dashboard.quiz.openQualified")} trailingIcon="arrow-forward" onPress={() => router.push("/(training)/qualified")} />
          </QuizState>
        ) : exhausted ? (
          <QuizState
            icon="hourglass-outline"
            tone="warning"
            title={t("dashboard.quiz.exhaustedTitle")}
            body={t("dashboard.quiz.exhaustedBody")}
          >
            <AttemptsLine used={attempts.length} remaining={remaining} />
            <Button variant="secondary" label={t("dashboard.quiz.viewResult")} onPress={() => router.push("/(training)/quiz-result")} />
          </QuizState>
        ) : !progress.allDone ? (
          <QuizState
            icon="lock-closed-outline"
            tone="navy"
            title={t("dashboard.quiz.lockedTitle")}
            body={t("dashboard.quiz.lockedBody")}
          >
            <View style={styles.missing}>
              <Text variant="label" color="inkMuted">
                {t("dashboard.quiz.missingTitle")}
              </Text>
              {progress.missing.slice(0, MISSING_SHOWN).map((v) => (
                <View key={v.id} style={styles.missingRow}>
                  <Icon name="ellipse-outline" size={12} color="inkMuted" />
                  <Text variant="bodySm" style={styles.flex} numberOfLines={1}>
                    {loc(v.title)}
                  </Text>
                  <Text variant="caption" color="inkMuted">
                    {`${Math.round((videoProgress[v.id] ?? 0) * 100)}%`}
                  </Text>
                </View>
              ))}
              {progress.missing.length > MISSING_SHOWN && (
                <Text variant="caption" color="inkMuted">
                  {t("dashboard.quiz.missingMore", { count: progress.missing.length - MISSING_SHOWN })}
                </Text>
              )}
            </View>
          </QuizState>
        ) : (
          <QuizState
            icon="document-text-outline"
            tone="info"
            title={t("dashboard.quiz.availableTitle")}
            body={t("dashboard.quiz.availableBody")}
          >
            <View style={styles.rules}>
              <Rule icon="help-circle-outline" label={t("dashboard.quiz.rules.questions", { count: QUIZ_QUESTIONS.length })} />
              <Rule icon="trophy-outline" label={t("dashboard.quiz.rules.passMark", { percent: QUIZ_PASS_PCT })} />
              <Rule icon="repeat-outline" label={t("dashboard.quiz.rules.attempts", { count: QUIZ_MAX_ATTEMPTS })} />
              <Rule icon="timer-outline" label={t("dashboard.quiz.rules.timer", { minutes: QUIZ_TIME_LIMIT_MIN })} />
            </View>
            <AttemptsLine used={attempts.length} remaining={remaining} />
            <Button
              size="lg"
              label={t("dashboard.quiz.start")}
              trailingIcon="arrow-forward"
              onPress={() => router.push("/(training)/quiz-intro" as Href)}
            />
          </QuizState>
        )}
      </Card>

      {!progress.allDone && (
        <Pressable accessibilityRole="button" onPress={markAllWatched} style={styles.protoLink}>
          <Icon name="construct-outline" size={14} color="inkMuted" />
          <Text variant="caption" color="inkMuted">
            {`${tc("prototype.label")} · `}
          </Text>
          <Text variant="caption" color="accent">
            {t("dashboard.markAllWatched")}
          </Text>
        </Pressable>
      )}
    </Screen>
  );
}

function AttemptsLine({ used, remaining }: { used: number; remaining: number }) {
  const { t } = useTranslation("training");
  return (
    <View>
      <Divider />
      <View style={styles.attempts}>
        <Text variant="label" color="inkMuted">
          {t("dashboard.quiz.attemptsUsed", { used, max: QUIZ_MAX_ATTEMPTS })}
        </Text>
        <Text variant="label" weight="semibold" color={remaining > 0 ? "navy" : "warning"}>
          {t("dashboard.quiz.attemptsRemaining", { count: remaining })}
        </Text>
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={14} color="inkMuted" />
      <Text variant="caption" color="inkMuted">
        {label}
      </Text>
    </View>
  );
}

function Rule({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.rule}>
      <Icon name={icon} size={16} color="navy" />
      <Text variant="bodySm" style={styles.flex}>
        {label}
      </Text>
    </View>
  );
}

function QuizState({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: IconName;
  tone: "navy" | "success" | "warning" | "info";
  title: string;
  body: string;
  children?: ReactNode;
}) {
  const bg = tone === "navy" ? tints.navy : tints[tone];
  return (
    <View style={styles.quiz}>
      <View style={styles.quizHead}>
        <View style={[styles.quizIcon, { backgroundColor: bg }]}>
          <Icon name={icon} size={22} color={tone} />
        </View>
        <View style={styles.flex}>
          <Text variant="h3">{title}</Text>
          <Text variant="bodySm" color="inkMuted">
            {body}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.sm },
  head: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  overall: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
  },
  overallRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  overallIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.whiteA10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  list: { gap: spacing.md },
  courseTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  courseNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  courseNumDone: { backgroundColor: colors.success },
  courseMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaEnd: { marginStart: "auto" },
  courseProgress: { gap: spacing.xs + 2, marginTop: spacing.md },
  quiz: { gap: spacing.lg },
  quizHead: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  quizIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  missing: { gap: spacing.sm },
  missingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rules: { gap: spacing.sm },
  rule: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  attempts: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  protoLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
});
