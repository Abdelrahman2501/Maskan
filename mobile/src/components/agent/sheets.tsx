import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Button, Icon, Text } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { LEAD_STATUSES, type LeadStatus } from "@/mock/leads";
import { colors, radius, shadow, spacing } from "@/theme/tokens";

import { LEAD_STATUS_TONE } from "./badges";
import { DirectionView } from "@/components/ui/direction-view";

/**
 * Modals render outside the root `direction` view, so direction is re-applied here.
 */
function ModalFrame({
  visible,
  onClose,
  variant,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  variant: "sheet" | "dialog";
  children: ReactNode;
}) {
  const { isRTL } = useLocale();
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={variant === "sheet" ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <DirectionView
        dir={isRTL ? "rtl" : "ltr"}
        style={[styles.root, variant === "sheet" ? styles.rootSheet : styles.rootDialog]}
      >
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("actions.close")}
        />
        {children}
      </DirectionView>
    </Modal>
  );
}

/** Bottom sheet listing lead statuses (LEAD-006). */
export function StatusSheet({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: LeadStatus;
  onSelect: (status: LeadStatus) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("agent");
  const insets = useSafeAreaInsets();
  return (
    <ModalFrame visible={visible} onClose={onClose} variant="sheet">
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.handle} />
        <Text variant="h3">{t("lead.statusSheet.title")}</Text>
        <Text variant="bodySm" color="inkMuted" style={styles.sheetSubtitle}>
          {t("lead.statusSheet.subtitle")}
        </Text>
        {LEAD_STATUSES.map((status) => {
          const selected = status === current;
          const tone = LEAD_STATUS_TONE[status];
          return (
            <Pressable
              key={status}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onSelect(status)}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
            >
              <View style={[styles.dot, { backgroundColor: tone === "neutral" ? colors.inkMuted : tone === "brand" ? colors.navy : colors[tone] }]} />
              <Text variant="body" weight={selected ? "semibold" : "regular"} style={styles.flex}>
                {t(`leadStatus.${status}`)}
              </Text>
              {selected && <Icon name="checkmark-circle" size={20} color="navy" />}
            </Pressable>
          );
        })}
      </View>
    </ModalFrame>
  );
}

/** Centered confirm dialog (replaces Alert.alert so it is styled, translated and RTL-aware). */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalFrame visible={visible} onClose={onCancel} variant="dialog">
      <View style={styles.dialog} accessibilityRole="alert">
        <Text variant="h3" align="center">
          {title}
        </Text>
        {body && (
          <Text variant="bodySm" color="inkMuted" align="center">
            {body}
          </Text>
        )}
        <View style={styles.dialogActions}>
          <Button label={confirmLabel} variant={destructive ? "destructive" : "primary"} onPress={onConfirm} />
          <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
        </View>
      </View>
    </ModalFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  rootSheet: { justifyContent: "flex-end" },
  rootDialog: { justifyContent: "center", padding: spacing.xl },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.surface,
    borderTopStartRadius: radius.xl,
    borderTopEndRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    ...shadow.elevated,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetSubtitle: { marginBottom: spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionSelected: { backgroundColor: colors.background },
  pressed: { opacity: 0.7 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    ...shadow.elevated,
  },
  dialogActions: { gap: spacing.sm, marginTop: spacing.md },
});
