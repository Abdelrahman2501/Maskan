import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui";
import { ALL_VIDEOS, type Course } from "@/mock/training";
import { usePrototype } from "@/prototype/store";
import { colors, tints } from "@/theme/tokens";

/** A video counts as watched at ≥ 90% (TRN-005 / Q-06 placeholder rule). */
export const WATCHED_THRESHOLD = 0.9;

export function isWatched(fraction: number | undefined): boolean {
  return (fraction ?? 0) >= WATCHED_THRESHOLD;
}

export type CourseStats = { watched: number; total: number; durationSec: number; fraction: number };

export function courseStats(course: Course, progress: Record<string, number>): CourseStats {
  const durationSec = course.videos.reduce((sum, v) => sum + v.durationSec, 0);
  const watchedSec = course.videos.reduce((sum, v) => sum + Math.min(1, progress[v.id] ?? 0) * v.durationSec, 0);
  return {
    watched: course.videos.filter((v) => isWatched(progress[v.id])).length,
    total: course.videos.length,
    durationSec,
    fraction: durationSec ? watchedSec / durationSec : 0,
  };
}

/** Overall training progress derived from the prototype store. */
export function useTrainingProgress() {
  const { videoProgress } = usePrototype();
  return useMemo(() => {
    const totalSec = ALL_VIDEOS.reduce((sum, v) => sum + v.durationSec, 0);
    const watchedSec = ALL_VIDEOS.reduce((sum, v) => sum + Math.min(1, videoProgress[v.id] ?? 0) * v.durationSec, 0);
    const missing = ALL_VIDEOS.filter((v) => !isWatched(videoProgress[v.id]));
    return {
      watched: ALL_VIDEOS.length - missing.length,
      total: ALL_VIDEOS.length,
      fraction: totalSec ? watchedSec / totalSec : 0,
      missing,
      allDone: missing.length === 0,
    };
  }, [videoProgress]);
}

/** Small circular watched / in-progress / not-started indicator. */
export function VideoStatusIcon({ fraction, size = 32 }: { fraction: number; size?: number }) {
  const watched = isWatched(fraction);
  const started = fraction > 0;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        watched ? styles.done : started ? styles.progress : styles.idle,
      ]}
    >
      <Icon
        name={watched ? "checkmark" : started ? "play" : "play-outline"}
        size={size * 0.5}
        color={watched ? "white" : started ? "accent" : "inkMuted"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  done: { backgroundColor: colors.success, borderColor: colors.success },
  progress: { backgroundColor: tints.info, borderColor: colors.accent },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
});
