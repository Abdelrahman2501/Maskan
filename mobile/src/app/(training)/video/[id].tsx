import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { isWatched } from "@/components/training/progress";
import { Badge, Button, EmptyState, Header, Icon, Notice, ProgressBar, Screen, Text } from "@/components/ui";
import { formatDuration } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { ALL_VIDEOS, COURSES } from "@/mock/training";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";
import { DirectionView } from "@/components/ui/direction-view";

const TICK_MS = 250;
const SPEED = 10; // simulated playback speed
const END_EPSILON = 0.99;

// Stage 9 — Simulated video player (TRN-003/004)
export default function VideoScreen() {
  const { t } = useTranslation("training");
  const { id } = useLocalSearchParams<{ id: string }>();
  const video = ALL_VIDEOS.find((v) => v.id === id);

  if (!video) {
    return (
      <Screen>
        <Header />
        <EmptyState
          icon="alert-circle-outline"
          title={t("video.notFound")}
          action={<Button variant="secondary" fullWidth={false} label={t("video.backToTraining")} onPress={() => router.replace("/(training)")} />}
        />
      </Screen>
    );
  }
  // Keyed so state resets when "Next video" swaps the id.
  return <Player key={video.id} videoId={video.id} />;
}

function Player({ videoId }: { videoId: string }) {
  const { t } = useTranslation("training");
  const loc = useLocalized();
  const { videoProgress, setVideoProgress } = usePrototype();

  const index = ALL_VIDEOS.findIndex((v) => v.id === videoId);
  const video = ALL_VIDEOS[index];
  const course = COURSES.find((c) => c.id === video.courseId);
  const next = ALL_VIDEOS[index + 1];
  const duration = video.durationSec;

  const stored = videoProgress[videoId] ?? 0;
  const [initial] = useState(() => (stored < END_EPSILON ? stored * duration : 0));
  const [position, setPosition] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // Simulated playback.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((p) => Math.min(duration, p + (TICK_MS / 1000) * SPEED));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, duration]);

  // Report progress (store keeps it monotonic, like the server — TRN-004).
  useEffect(() => {
    if (position > 0) setVideoProgress(videoId, position / duration);
    if (position >= duration) setPlaying(false);
  }, [position, duration, videoId, setVideoProgress]);

  const ended = position >= duration;
  const completed = isWatched(stored);
  const canResume = !started && initial > 0;

  const toggle = () => {
    if (ended) setPosition(0);
    setStarted(true);
    setPlaying((p) => !p || ended);
  };

  const startOver = () => {
    setPosition(0);
    setStarted(true);
    setPlaying(true);
  };

  const playIcon = playing ? "pause" : ended ? "refresh" : "play";
  const playLabel = playing ? t("video.pause") : ended ? t("video.replay") : canResume ? t("video.resumeFrom", { time: formatDuration(initial) }) : t("video.play");

  return (
    <Screen
      footer={
        next ? (
          <Button
            size="lg"
            label={t("video.next")}
            trailingIcon="arrow-forward"
            variant={completed ? "primary" : "secondary"}
            onPress={() => router.replace({ pathname: "/(training)/video/[id]", params: { id: next.id } })}
          />
        ) : (
          <Button size="lg" label={t("video.backToTraining")} onPress={() => router.replace("/(training)")} />
        )
      }
    >
      <Header title={course ? loc(course.title) : t("video.title")} />

      {/* Player */}
      <View style={styles.player}>
        <Pressable accessibilityRole="button" accessibilityLabel={playLabel} onPress={toggle} style={styles.stage}>
          <View style={styles.bigButton}>
            <Icon name={playIcon} size={34} color="white" />
          </View>
          {canResume && (
            <View style={styles.resumePill}>
              <Text variant="caption" color="white">
                {playLabel}
              </Text>
            </View>
          )}
        </Pressable>
        <DirectionView dir="ltr" style={styles.controls}>
          <Pressable accessibilityRole="button" accessibilityLabel={playLabel} hitSlop={8} onPress={toggle}>
            <Icon name={playIcon} size={20} color="white" />
          </Pressable>
          <View style={styles.flex}>
            <ProgressBar value={position / duration} tone={completed ? "success" : "accent"} height={4} />
          </View>
          <Text variant="caption" color="whiteA70" style={styles.time}>
            {`${formatDuration(position)} / ${formatDuration(duration)}`}
          </Text>
        </DirectionView>
      </View>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text variant="caption" color="inkMuted">
            {t("video.of", { index: index + 1, total: ALL_VIDEOS.length })}
          </Text>
          {completed ? (
            <Badge tone="success" label={t("video.completed")} />
          ) : (
            <Badge tone={stored > 0 ? "info" : "neutral"} label={t("video.watchedPercent", { percent: Math.round(stored * 100) })} />
          )}
        </View>
        <Text variant="h2">{loc(video.title)}</Text>
        {!completed && (
          <Text variant="bodySm" color="inkMuted">
            {t("video.completeHint")}
          </Text>
        )}
        {canResume && (
          <Pressable accessibilityRole="button" onPress={startOver} style={styles.link}>
            <Icon name="refresh" size={14} color="accent" />
            <Text variant="label" color="accent">
              {t("video.startOver")}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.note}>
        <Notice tone="info" icon="construct-outline" body={t("video.simulatedNote")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  player: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.navyDeep,
  },
  stage: { aspectRatio: 16 / 9, alignItems: "center", justifyContent: "center", gap: spacing.md },
  bigButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.whiteA20,
    borderWidth: 1,
    borderColor: colors.whiteA20,
    alignItems: "center",
    justifyContent: "center",
  },
  resumePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteA10,
  },
  // Media timelines stay left→right in both languages.
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.navy,
  },
  time: { fontVariant: ["tabular-nums"] },
  info: { gap: spacing.sm, marginTop: spacing.xl },
  infoTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", marginTop: spacing.xs },
  note: { marginTop: spacing.xl },
});
