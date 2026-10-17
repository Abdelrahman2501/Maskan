import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { courseStats, isWatched, VideoStatusIcon } from "@/components/training/progress";
import { Button, Card, Divider, EmptyState, Header, Icon, ProgressBar, Screen, Text } from "@/components/ui";
import { formatDuration } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { COURSES } from "@/mock/training";
import { usePrototype } from "@/prototype/store";
import { colors, spacing } from "@/theme/tokens";

// Stage 9 — Course detail (TRN-003)
export default function CourseScreen() {
  const { t } = useTranslation("training");
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = useLocalized();
  const { videoProgress } = usePrototype();
  const course = COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <Screen>
        <Header />
        <EmptyState
          icon="alert-circle-outline"
          title={t("course.notFound")}
          action={<Button variant="secondary" fullWidth={false} label={t("course.backToTraining")} onPress={() => router.replace("/(training)")} />}
        />
      </Screen>
    );
  }

  const stats = courseStats(course, videoProgress);

  return (
    <Screen>
      <Header />
      <View style={styles.head}>
        <Text variant="h1">{loc(course.title)}</Text>
        <Text color="inkMuted">{loc(course.description)}</Text>
        <View style={styles.summary}>
          <Icon name="videocam-outline" size={16} color="inkMuted" />
          <Text variant="label" color="inkMuted">
            {t("course.summary", { count: stats.total, duration: formatDuration(stats.durationSec) })}
          </Text>
        </View>
        <ProgressBar value={stats.fraction} tone={stats.watched === stats.total ? "success" : "accent"} />
        <Text variant="caption" color="inkMuted">
          {t("dashboard.courseWatched", { watched: stats.watched, total: stats.total })}
        </Text>
      </View>

      <Text variant="h3" style={styles.sectionTitle}>
        {t("course.videosTitle")}
      </Text>
      <Card padded={false} style={styles.card}>
        {course.videos.map((video, i) => {
          const fraction = videoProgress[video.id] ?? 0;
          const watched = isWatched(fraction);
          const status = watched
            ? t("course.status.watched")
            : fraction > 0
              ? t("course.status.inProgress", { percent: Math.round(fraction * 100) })
              : t("course.status.notStarted");
          return (
            <View key={video.id}>
              {i > 0 && <Divider />}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${loc(video.title)}, ${status}`}
                onPress={() => router.push({ pathname: "/(training)/video/[id]", params: { id: video.id } })}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <VideoStatusIcon fraction={fraction} />
                <View style={styles.flex}>
                  <Text variant="body" weight="medium">
                    {loc(video.title)}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Text variant="caption" color="inkMuted">
                      {formatDuration(video.durationSec)}
                    </Text>
                    <Text variant="caption" color="inkMuted">
                      ·
                    </Text>
                    <Text variant="caption" color={watched ? "success" : fraction > 0 ? "accent" : "inkMuted"}>
                      {status}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={18} color="inkMuted" directional />
              </Pressable>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: spacing.sm, marginTop: spacing.md },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2, marginTop: spacing.xs, marginBottom: spacing.xs },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  card: { overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  rowPressed: { backgroundColor: colors.background },
  rowMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs + 2, marginTop: 2 },
});
