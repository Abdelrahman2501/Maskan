import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import {
  Button,
  Card,
  Header,
  Icon,
  Notice,
  ProgressBar,
  Screen,
  StatusIcon,
  StepIndicator,
  Text,
  type IconName,
} from "@/components/ui";
import { formatDuration } from "@/lib/format";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";

const MAX_SECONDS = 90; // INT-002 default maximum
const SHORT_SECONDS = 20;
const REFERENCE_SECONDS = 58;

type Mode = "instructions" | "denied" | "recorder" | "preview" | "uploading";

const PROMPTS = ["name", "background", "why", "areas"] as const;
const TIPS: { key: string; icon: IconName }[] = [
  { key: "light", icon: "sunny-outline" },
  { key: "quiet", icon: "volume-mute-outline" },
  { key: "camera", icon: "eye-outline" },
];

// Stage 6 — Interview instructions + simulated recorder (no expo-camera in the prototype)
export default function InterviewScreen() {
  const [mode, setMode] = useState<Mode>("instructions");
  const [duration, setDuration] = useState(0);

  switch (mode) {
    case "denied":
      return <Denied onBack={() => setMode("instructions")} onRetry={() => setMode("recorder")} />;
    case "recorder":
      return (
        <Recorder
          onClose={() => setMode("instructions")}
          onDone={(seconds) => {
            setDuration(seconds);
            setMode("preview");
          }}
        />
      );
    case "preview":
      return <Preview duration={duration} onRetake={() => setMode("recorder")} onSubmit={() => setMode("uploading")} />;
    case "uploading":
      return <Uploading />;
    default:
      return <Instructions onStart={() => setMode("recorder")} onDenied={() => setMode("denied")} />;
  }
}

function Instructions({ onStart, onDenied }: { onStart: () => void; onDenied: () => void }) {
  const { t } = useTranslation("onboarding");
  const steps = useJourneySteps();
  const [playing, setPlaying] = useState(false);

  return (
    <Screen
      footer={
        <>
          <Button label={t("interview.start")} size="lg" icon="videocam" onPress={onStart} />
          <Pressable accessibilityRole="button" onPress={onDenied} style={styles.protoLink} hitSlop={6}>
            <Icon name="construct-outline" size={14} color="inkMuted" />
            <Text variant="caption" color="inkMuted">
              {t("interview.simulateDenied")}
            </Text>
          </Pressable>
        </>
      }
    >
      <Header back={false} trailing={<LanguageToggle />} />
      <StepIndicator steps={steps} current={2} />

      <View style={styles.head}>
        <Text variant="h1">{t("interview.title")}</Text>
        <Text color="inkMuted">{t("interview.subtitle")}</Text>
        <View style={styles.durationRow}>
          <Icon name="time-outline" size={16} color="navy" />
          <Text variant="label" color="navy">
            {t("interview.duration")}
          </Text>
        </View>
      </View>

      <Card>
        <Text variant="h3" style={styles.cardTitle}>
          {t("interview.promptsTitle")}
        </Text>
        <View style={styles.list}>
          {PROMPTS.map((key, i) => (
            <View key={key} style={styles.listRow}>
              <View style={styles.number}>
                <Text variant="caption" color="navy">
                  {String(i + 1)}
                </Text>
              </View>
              <Text variant="body" style={styles.flex}>
                {t(`interview.prompts.${key}`)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.section}>
        <Text variant="h3">{t("interview.referenceTitle")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("interview.referenceTitle")}
          onPress={() => setPlaying((p) => !p)}
          style={styles.player}
        >
          <Icon name="person" size={64} color="whiteA20" />
          <View style={styles.playButton}>
            <Icon name={playing ? "pause" : "play"} size={26} color="navy" />
          </View>
          <View style={styles.playerBar}>
            <ProgressBar value={playing ? 0.35 : 0} tone="accent" height={3} />
          </View>
          <View style={styles.durationPill}>
            <Text variant="caption" color="white">
              {formatDuration(REFERENCE_SECONDS)}
            </Text>
          </View>
        </Pressable>
        <Text variant="bodySm" color="inkMuted">
          {t("interview.referenceBody")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="h3">{t("interview.tipsTitle")}</Text>
        <View style={styles.list}>
          {TIPS.map((tip) => (
            <View key={tip.key} style={styles.listRow}>
              <View style={styles.tipIcon}>
                <Icon name={tip.icon} size={18} color="navy" />
              </View>
              <Text variant="body" style={styles.flex}>
                {t(`interview.tips.${tip.key}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Notice
          tone="info"
          icon="videocam-outline"
          title={t("interview.permissionTitle")}
          body={t("interview.permissionBody")}
        />
      </View>
    </Screen>
  );
}

function Recorder({ onClose, onDone }: { onClose: () => void; onDone: (seconds: number) => void }) {
  const { t } = useTranslation("onboarding");
  // Ticks every half second so the recording dot can blink without Animated.
  const [halfTicks, setHalfTicks] = useState(0);
  const [recording, setRecording] = useState(false);
  const seconds = Math.floor(halfTicks / 2);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setHalfTicks((h) => h + 1), 500);
    return () => clearInterval(id);
  }, [recording]);

  // Auto-stop at the configured maximum (INT-002).
  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) {
      setRecording(false);
      doneRef.current(MAX_SECONDS);
    }
  }, [recording, seconds]);

  const toggle = () => {
    if (recording) {
      setRecording(false);
      onDone(Math.max(seconds, 1));
    } else {
      setHalfTicks(0);
      setRecording(true);
    }
  };

  return (
    <Screen dark scroll={false} padded={false}>
      <View style={styles.recTop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("interview.recorder.close")}
          onPress={onClose}
          disabled={recording}
          hitSlop={10}
          style={[styles.roundDark, recording && styles.dim]}
        >
          <Icon name="close" size={22} color="white" />
        </Pressable>
        <View style={styles.timerPill}>
          {recording && <View style={[styles.recDot, halfTicks % 2 === 1 && styles.recDotOff]} />}
          <Text variant="label" color="white" style={styles.ltr}>
            {`${formatDuration(seconds)} / ${formatDuration(MAX_SECONDS)}`}
          </Text>
        </View>
        <View style={styles.roundSpacer} />
      </View>

      <View style={styles.viewfinder}>
        <View style={[styles.faceFrame, recording && styles.faceFrameRec]}>
          <Icon name="person" size={120} color="whiteA20" />
        </View>
        <Text variant="bodySm" color="whiteA70" align="center">
          {recording ? t("interview.recorder.recording") : t("interview.recorder.ready")}
        </Text>
      </View>

      <View style={styles.recBottom}>
        <View style={styles.recProgress}>
          <ProgressBar value={seconds / MAX_SECONDS} tone="accent" height={4} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recording ? t("interview.recorder.stop") : t("interview.recorder.start")}
          onPress={toggle}
          style={styles.recButtonOuter}
        >
          <View style={recording ? styles.recButtonStop : styles.recButtonInner} />
        </Pressable>
        <Text variant="label" color="white" align="center">
          {recording ? t("interview.recorder.tapToStop") : t("interview.recorder.tapToStart")}
        </Text>
        <Text variant="caption" color="whiteA70" align="center">
          {t("interview.recorder.autoStop")}
        </Text>
      </View>
    </Screen>
  );
}

function Preview({ duration, onRetake, onSubmit }: { duration: number; onRetake: () => void; onSubmit: () => void }) {
  const { t } = useTranslation("onboarding");
  const steps = useJourneySteps();
  const [playing, setPlaying] = useState(false);

  return (
    <Screen
      footer={
        <>
          <Button label={t("interview.preview.submit")} size="lg" icon="cloud-upload-outline" onPress={onSubmit} />
          <Button label={t("interview.preview.retake")} variant="secondary" icon="refresh" onPress={onRetake} />
        </>
      }
    >
      <Header onBack={onRetake} />
      <StepIndicator steps={steps} current={2} />
      <View style={styles.head}>
        <Text variant="h1">{t("interview.preview.title")}</Text>
        <Text color="inkMuted">{t("interview.preview.body")}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("interview.preview.title")}
        onPress={() => setPlaying((p) => !p)}
        style={[styles.player, styles.previewPlayer]}
      >
        <Icon name="person" size={96} color="whiteA20" />
        <View style={styles.playButton}>
          <Icon name={playing ? "pause" : "play"} size={26} color="navy" />
        </View>
        <View style={styles.playerBar}>
          <ProgressBar value={playing ? 0.4 : 0} tone="accent" height={3} />
        </View>
      </Pressable>

      <Card style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Icon name="time-outline" size={18} color="navy" />
          <Text variant="body" color="inkMuted" style={styles.flex}>
            {t("interview.preview.duration")}
          </Text>
          <Text variant="body" weight="semibold" style={styles.ltr}>
            {formatDuration(duration)}
          </Text>
        </View>
      </Card>

      {duration < SHORT_SECONDS && (
        <View style={styles.section}>
          <Notice tone="warning" body={t("interview.preview.tooShort")} />
        </View>
      )}
    </Screen>
  );
}

function Uploading() {
  const { t } = useTranslation("onboarding");
  const { setStage } = usePrototype();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(1, p + 0.04)), 90);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (progress < 1) return;
    const id = setTimeout(() => {
      setStage("interview_submitted");
      router.replace("/(onboarding)/interview-submitted");
    }, 400);
    return () => clearTimeout(id);
  }, [progress, setStage]);

  return (
    <Screen scroll={false}>
      <View style={styles.centered}>
        <StatusIcon name="cloud-upload-outline" tone="navy" />
        <Text variant="h2" align="center">
          {t("interview.uploading.title")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("interview.uploading.body")}
        </Text>
        <View style={styles.uploadBar}>
          <ProgressBar value={progress} tone={progress >= 1 ? "success" : "accent"} height={8} />
          <Text variant="label" color="navy" align="center">
            {t("interview.uploading.percent", { percent: Math.round(progress * 100) })}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function Denied({ onBack, onRetry }: { onBack: () => void; onRetry: () => void }) {
  const { t } = useTranslation("onboarding");
  const stepsKeys = ["step1", "step2", "step3"] as const;
  const openSettings = () => {
    if (Platform.OS === "web") return;
    Linking.openSettings().catch(() => undefined);
  };

  return (
    <Screen
      footer={
        <>
          <Button label={t("interview.denied.openSettings")} size="lg" icon="settings-outline" onPress={openSettings} />
          <Button label={t("interview.denied.tryAgain")} variant="secondary" onPress={onRetry} />
        </>
      }
    >
      <Header onBack={onBack} />
      <View style={styles.deniedHero}>
        <StatusIcon name="videocam-off-outline" tone="error" />
        <Text variant="h1" align="center">
          {t("interview.denied.title")}
        </Text>
        <Text color="inkMuted" align="center">
          {t("interview.denied.body")}
        </Text>
      </View>

      <Card>
        <Text variant="h3" style={styles.cardTitle}>
          {t("interview.denied.stepsTitle")}
        </Text>
        <View style={styles.list}>
          {stepsKeys.map((key, i) => (
            <View key={key} style={styles.listRow}>
              <View style={styles.number}>
                <Text variant="caption" color="navy">
                  {String(i + 1)}
                </Text>
              </View>
              <Text variant="body" style={styles.flex}>
                {t(`interview.denied.${key}`)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ltr: { writingDirection: "ltr" },
  head: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: tints.navy,
  },
  section: { marginTop: spacing.xl, gap: spacing.md },
  cardTitle: { marginBottom: spacing.md },
  list: { gap: spacing.md },
  listRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  number: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  player: {
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewPlayer: { aspectRatio: 3 / 4, backgroundColor: colors.navyDeep },
  playButton: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBar: { position: "absolute", bottom: 0, start: 0, end: 0 },
  durationPill: {
    position: "absolute",
    bottom: spacing.md,
    end: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.scrim,
  },
  protoLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.xs },
  // Recorder
  recTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  roundDark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.whiteA10,
    borderWidth: 1,
    borderColor: colors.whiteA20,
  },
  roundSpacer: { width: 40 },
  dim: { opacity: 0.4 },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteA10,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  recDotOff: { opacity: 0.2 },
  viewfinder: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: spacing.xl },
  faceFrame: {
    width: 200,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.whiteA20,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  faceFrameRec: { borderStyle: "solid", borderColor: colors.error },
  recBottom: { alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  recProgress: { alignSelf: "stretch", marginBottom: spacing.lg },
  recButtonOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  recButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.error },
  recButtonStop: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.error },
  metaCard: { marginTop: spacing.lg },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
  uploadBar: { alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.lg },
  deniedHero: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.xl },
});
