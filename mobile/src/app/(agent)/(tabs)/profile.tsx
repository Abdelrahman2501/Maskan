import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useTranslation } from "react-i18next";

import { initials } from "@/components/agent/format";
import { ConfirmDialog } from "@/components/agent/sheets";
import { Card, Divider, Icon, ListRow, Notice, Screen, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import type { Language } from "@/i18n/languages";
import { formatDate } from "@/lib/format";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";

export default function Profile() {
  const { t } = useTranslation("agent");
  const { t: tc } = useTranslation();
  const { language, intlLocale, setLanguage } = useLocale();
  const { profile, attempts, setStage } = usePrototype();
  const [notifications, setNotifications] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const qualifiedAt = attempts.find((a) => a.passed)?.at;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const logout = () => {
    setConfirmLogout(false);
    setStage("guest");
    router.replace("/");
  };

  return (
    <Screen edges={["top"]}>
      <Text variant="h1" style={styles.title}>
        {t("profile.title")}
      </Text>

      {/* Identity card */}
      <Card style={styles.identity}>
        <View style={styles.avatar}>
          <Text variant="h2" color="white">
            {initials(profile.firstName, profile.lastName)}
          </Text>
        </View>
        <Text variant="h2" align="center">
          {fullName}
        </Text>
        <View style={styles.badge}>
          <Icon name="shield-checkmark" size={14} color="success" />
          <Text variant="caption" color="success">
            {t("profile.qualifiedAgent")}
          </Text>
        </View>
        {qualifiedAt && (
          <Text variant="caption" color="inkMuted" align="center">
            {t("profile.qualifiedOn", { date: formatDate(qualifiedAt, intlLocale) })}
          </Text>
        )}
        <View style={styles.contact}>
          <ContactLine icon="mail-outline" value={profile.email} />
          <ContactLine icon="call-outline" value={profile.phone} />
        </View>
      </Card>

      {/* Language */}
      <Section title={tc("language.title")}>
        <View style={styles.segment}>
          {(["en", "ar"] as Language[]).map((lng) => {
            const active = lng === language;
            return (
              <Pressable
                key={lng}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setLanguage(lng)}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                {active && <Icon name="checkmark" size={16} color="white" />}
                <Text variant="label" weight="semibold" color={active ? "white" : "ink"}>
                  {lng === "en" ? tc("language.english") : tc("language.arabic")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Preferences & support */}
      <Section title={t("profile.preferences")}>
        <Card padded={false} style={styles.group}>
          <ListRow
            icon="notifications-outline"
            title={t("profile.notifications")}
            subtitle={t("profile.notificationsHint")}
            trailing={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                accessibilityLabel={t("profile.notifications")}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={colors.white}
              />
            }
          />
          <Divider />
          <ListRow icon="help-buoy-outline" title={t("profile.help")} onPress={() => setInfo(t("profile.helpInfo"))} />
          <Divider />
          <ListRow
            icon="document-lock-outline"
            title={t("profile.privacy")}
            onPress={() => setInfo(t("profile.privacyInfo"))}
          />
        </Card>
        {info && (
          <View style={styles.info}>
            <Notice tone="info" body={info} />
          </View>
        )}
      </Section>

      <Section title={t("profile.more")}>
        <Card padded={false} style={styles.group}>
          <ListRow icon="construct-outline" title={tc("prototype.menuTitle")} onPress={() => router.push("/prototype")} />
          <Divider />
          <ListRow icon="log-out-outline" title={tc("actions.logout")} destructive onPress={() => setConfirmLogout(true)} />
        </Card>
      </Section>

      <Text variant="caption" color="inkMuted" align="center" style={styles.footer}>
        {tc("prototype.label")}
      </Text>

      <ConfirmDialog
        visible={confirmLogout}
        title={t("profile.logoutTitle")}
        body={t("profile.logoutBody")}
        confirmLabel={tc("actions.logout")}
        cancelLabel={tc("actions.cancel")}
        destructive
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="label" color="inkMuted" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function ContactLine({ icon, value }: { icon: IconName; value: string }) {
  return (
    <View style={styles.contactLine}>
      <Icon name={icon} size={16} color="inkMuted" />
      <Text variant="bodySm" style={styles.ltr} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.md, marginBottom: spacing.lg },
  identity: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: tints.success,
  },
  contact: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  ltr: { writingDirection: "ltr" },
  section: { marginTop: spacing.xl },
  sectionTitle: { marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.4 },
  segment: {
    flexDirection: "row",
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    height: 42,
    borderRadius: radius.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: colors.navy },
  group: { overflow: "hidden" },
  info: { marginTop: spacing.md },
  footer: { marginTop: spacing.xl },
});
