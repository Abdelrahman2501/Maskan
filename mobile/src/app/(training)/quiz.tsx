import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { clearSession, getSession, saveSession, type AttemptSession } from "@/components/training/attempt-session";
import { Button, Header, Icon, Notice, ProgressBar, Screen, Text } from "@/components/ui";
import { formatDuration } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { QUIZ_QUESTIONS } from "@/mock/training";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";
import { DirectionView } from "@/components/ui/direction-view";

const WARNING_MS = 60_000;
const TIME_UP_DELAY_MS = 1800;

// Stage 10 — Timed quiz attempt
export default function QuizScreen() {
  const [session] = useState(getSession);
  // No attempt was started from the intro screen (e.g. deep link) → back to instructions.
  if (!session) return <Redirect href="/(training)/quiz-intro" />;
  return <Attempt session={session} />;
}

function Attempt({ session }: { session: AttemptSession }) {
  const { t } = useTranslation("training");
  const { t: tc } = useTranslation();
  const loc = useLocalized();
  const { recordAttempt } = usePrototype();

  const total = QUIZ_QUESTIONS.length;
  const [answers, setAnswers] = useState(session.answers);
  const [index, setIndex] = useState(session.index);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [confirming, setConfirming] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const submitted = useRef(false);

  const remainingMs = Math.max(0, session.deadline - now);
  const unanswered = answers.filter((a) => a === null).length;
  const question = QUIZ_QUESTIONS[index];
  const letters = Array.from(t("quiz.letters"));

  const submit = useCallback(
    (final: (number | null)[]) => {
      if (submitted.current) return;
      submitted.current = true;
      const score = final.filter((a, i) => a === QUIZ_QUESTIONS[i].correctIndex).length;
      recordAttempt(score, total);
      clearSession();
      router.replace({ pathname: "/(training)/quiz-result", params: { score: String(score), total: String(total) } });
    },
    [recordAttempt, total],
  );

  // Countdown (deadline is fixed when the attempt starts — QUIZ-003).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  // Deadline reached → brief notice, then auto-submit (QUIZ-005).
  useEffect(() => {
    if (remainingMs > 0 || submitted.current) return;
    setTimeUp(true);
    setConfirming(false);
    const timer = setTimeout(() => submit(answers), TIME_UP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [remainingMs, answers, submit]);

  // "Saved" indicator after each answer (QUIZ-004 autosave).
  useEffect(() => {
    if (saving !== "saving") return;
    const timer = setTimeout(() => setSaving("saved"), 450);
    return () => clearTimeout(timer);
  }, [saving, answers]);

  const choose = (option: number) => {
    if (timeUp) return;
    const next = answers.map((a, i) => (i === index ? option : a));
    setAnswers(next);
    saveSession({ answers: next });
    setSaving("saving");
  };

  const goTo = (i: number) => {
    setIndex(i);
    setConfirming(false);
    saveSession({ index: i });
  };

  const isLast = index === total - 1;
  const warn = remainingMs < WARNING_MS;

  const footer = confirming ? (
    <View style={styles.confirm}>
      <Text variant="h3">{t("quiz.confirmTitle")}</Text>
      <Text variant="bodySm" color={unanswered > 0 ? "warning" : "inkMuted"}>
        {unanswered > 0 ? t("quiz.confirmUnanswered", { count: unanswered }) : t("quiz.confirmAllAnswered")}
      </Text>
      <View style={styles.footerRow}>
        <Button variant="secondary" label={t("quiz.keepWorking")} onPress={() => setConfirming(false)} style={styles.flex} />
        <Button label={t("quiz.confirmSubmit")} onPress={() => submit(answers)} style={styles.flex} />
      </View>
    </View>
  ) : (
    <View style={styles.footerRow}>
      <Button
        variant="secondary"
        label={tc("actions.previous")}
        disabled={index === 0 || timeUp}
        onPress={() => goTo(index - 1)}
        style={styles.flex}
      />
      {isLast ? (
        <Button label={t("quiz.submit")} disabled={timeUp} onPress={() => setConfirming(true)} style={styles.flex} />
      ) : (
        <Button
          label={tc("actions.next")}
          trailingIcon="arrow-forward"
          disabled={timeUp}
          onPress={() => goTo(index + 1)}
          style={styles.flex}
        />
      )}
    </View>
  );

  return (
    <Screen footer={footer}>
      <Header title={t("quiz.title")} />

      <View style={styles.progressHead}>
        <Text variant="label" color="inkMuted">
          {t("quiz.questionOf", { index: index + 1, total })}
        </Text>
        <DirectionView
          dir="ltr"
          accessibilityLabel={`${t("quiz.timeLeft")} ${formatDuration(Math.ceil(remainingMs / 1000))}`}
          style={[styles.timer, warn && styles.timerWarn]}
        >
          <Icon name="timer-outline" size={14} color={warn ? "warning" : "navy"} />
          <Text variant="label" weight="semibold" color={warn ? "warning" : "navy"} style={styles.digits}>
            {formatDuration(Math.ceil(remainingMs / 1000))}
          </Text>
        </DirectionView>
      </View>
      <ProgressBar value={(index + 1) / total} tone="navy" />
      <View style={styles.saved}>
        {saving !== "idle" && (
          <>
            <Icon name={saving === "saved" ? "cloud-done-outline" : "cloud-upload-outline"} size={14} color="inkMuted" />
            <Text variant="caption" color="inkMuted">
              {saving === "saved" ? t("quiz.saved") : t("quiz.saving")}
            </Text>
          </>
        )}
      </View>

      {timeUp ? (
        <View style={styles.notice}>
          <Notice tone="warning" icon="alarm-outline" title={t("quiz.timeUp")} body={t("quiz.timeUpBody")} />
        </View>
      ) : (
        warn && (
          <View style={styles.notice}>
            <Notice tone="warning" icon="timer-outline" body={t("quiz.warning")} />
          </View>
        )
      )}

      <Text variant="h2" style={styles.question}>
        {loc(question.text)}
      </Text>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {question.options.map((option, i) => {
          const selected = answers[index] === i;
          const letter = letters[i] ?? String(i + 1);
          return (
            <Pressable
              key={`${question.id}-${i}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: timeUp }}
              accessibilityLabel={`${t("quiz.optionLabel", { letter })}: ${loc(option)}`}
              onPress={() => choose(i)}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && !selected && styles.optionPressed]}
            >
              <View style={[styles.letter, selected && styles.letterSelected]}>
                <Text variant="label" weight="semibold" color={selected ? "white" : "navy"}>
                  {letter}
                </Text>
              </View>
              <Text variant="body" weight={selected ? "medium" : "regular"} style={styles.flex}>
                {loc(option)}
              </Text>
              <Icon
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selected ? "accent" : "border"}
              />
            </Pressable>
          );
        })}
      </View>

      <Text variant="label" color="inkMuted" style={styles.navTitle}>
        {t("quiz.navigator")}
      </Text>
      <View style={styles.dots}>
        {QUIZ_QUESTIONS.map((q, i) => {
          const answered = answers[i] !== null;
          const current = i === index;
          return (
            <Pressable
              key={q.id}
              accessibilityRole="button"
              accessibilityLabel={t("quiz.questionOf", { index: i + 1, total })}
              accessibilityState={{ selected: current }}
              hitSlop={4}
              disabled={timeUp}
              onPress={() => goTo(i)}
              style={[styles.dot, answered && styles.dotAnswered, current && styles.dotCurrent]}
            >
              <Text variant="caption" color={answered ? "white" : current ? "navy" : "inkMuted"}>
                {String(i + 1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const DOT = 30;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: tints.navy,
  },
  timerWarn: { backgroundColor: tints.warning },
  digits: { fontVariant: ["tabular-nums"] },
  progressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  saved: { flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: 20, marginTop: spacing.sm },
  notice: { marginTop: spacing.lg },
  question: { marginTop: spacing.lg, marginBottom: spacing.lg },
  options: { gap: spacing.sm + 2 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: tints.info },
  optionPressed: { backgroundColor: colors.background },
  letter: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  letterSelected: { backgroundColor: colors.accent },
  navTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dotAnswered: { backgroundColor: colors.navy, borderColor: colors.navy },
  dotCurrent: { borderColor: colors.accent, borderWidth: 2 },
  confirm: { gap: spacing.sm },
  footerRow: { flexDirection: "row", gap: spacing.sm },
});
