import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Icon, Text, type IconName } from "@/components/ui";
import { colors, radius, spacing, tints } from "@/theme/tokens";

export type CaptureState = "empty" | "capturing" | "captured";

/**
 * PROTOTYPE capture tile: no real camera. The "thumbnail" is drawn with Views so
 * the flow can be clicked through; swap for expo-image-picker / camera in FEAT-003.
 */
export function CaptureTile({
  kind,
  title,
  hint,
  state,
  onCapture,
}: {
  kind: "front" | "back" | "selfie";
  title: string;
  hint: string;
  state: CaptureState;
  onCapture: () => void;
}) {
  const { t } = useTranslation("onboarding");
  const icon: IconName = kind === "selfie" ? "person-circle-outline" : "card-outline";

  if (state === "captured") {
    return (
      <View style={[styles.tile, styles.tileCaptured]}>
        <Thumbnail kind={kind} />
        <View style={styles.flex}>
          <Text variant="body" weight="semibold">
            {title}
          </Text>
          <View style={styles.capturedRow}>
            <Icon name="checkmark-circle" size={14} color="success" />
            <Text variant="caption" color="success">
              {t("identity.captured")}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t("identity.retake")} — ${title}`}
          onPress={onCapture}
          hitSlop={8}
          style={styles.retake}
        >
          <Icon name="refresh" size={14} color="navy" />
          <Text variant="caption" color="navy">
            {t("identity.retake")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const busy = state === "capturing";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} — ${t("identity.tap")}`}
      accessibilityState={{ busy }}
      disabled={busy}
      onPress={onCapture}
      style={({ pressed }) => [styles.tile, styles.tileEmpty, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        {busy ? <ActivityIndicator color={colors.navy} /> : <Icon name={icon} size={26} color="navy" />}
      </View>
      <View style={styles.flex}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" color="inkMuted">
          {busy ? t("identity.capturing") : hint}
        </Text>
      </View>
      {!busy && (
        <View style={styles.camera}>
          <Icon name="camera" size={18} color="white" />
        </View>
      )}
    </Pressable>
  );
}

/** Stylised placeholder of the captured photo. */
function Thumbnail({ kind }: { kind: "front" | "back" | "selfie" }) {
  if (kind === "selfie") {
    return (
      <View style={[styles.thumb, styles.thumbSelfie]}>
        <Icon name="person" size={30} color="whiteA70" />
      </View>
    );
  }
  return (
    <View style={[styles.thumb, styles.thumbCard]}>
      {kind === "front" ? (
        <View style={styles.cardFront}>
          <View style={styles.cardPhoto}>
            <Icon name="person" size={12} color="whiteA70" />
          </View>
          <View style={styles.cardLines}>
            <View style={[styles.line, { width: "90%" }]} />
            <View style={[styles.line, { width: "70%" }]} />
            <View style={[styles.line, { width: "80%" }]} />
          </View>
        </View>
      ) : (
        <View style={styles.cardLines}>
          <View style={[styles.line, { width: "95%" }]} />
          <View style={[styles.line, { width: "75%" }]} />
          <View style={[styles.line, { width: "85%" }]} />
          <View style={[styles.barcode]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    minHeight: 80,
  },
  tileEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.border },
  tileCaptured: { borderWidth: 1, borderColor: colors.success },
  pressed: { backgroundColor: colors.background },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  capturedRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  retake: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 72, height: 56, borderRadius: radius.sm, overflow: "hidden", justifyContent: "center" },
  thumbSelfie: { width: 56, backgroundColor: colors.navySecondary, alignItems: "center" },
  thumbCard: { backgroundColor: colors.navySecondary, padding: spacing.sm },
  cardFront: { flexDirection: "row", gap: spacing.xs + 2, alignItems: "center" },
  cardPhoto: {
    width: 20,
    height: 26,
    borderRadius: 3,
    backgroundColor: colors.whiteA20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLines: { flex: 1, gap: 5 },
  line: { height: 4, borderRadius: 2, backgroundColor: colors.whiteA20 },
  barcode: { height: 8, borderRadius: 1, backgroundColor: colors.whiteA70, marginTop: 2 },
});
