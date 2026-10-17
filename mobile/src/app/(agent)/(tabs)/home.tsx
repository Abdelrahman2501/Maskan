import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FeaturedCompoundCard, LeadRow } from "@/components/agent/cards";
import { formatActivity, initials } from "@/components/agent/format";
import { LanguageToggle } from "@/components/brand/logo";
import { Card, EmptyState, Icon, Screen, SectionHeader, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatNumber } from "@/lib/format";
import type { LeadStatus } from "@/mock/leads";
import { COMPOUNDS } from "@/mock/properties";
import { usePrototype } from "@/prototype/store";
import { colors, radius, shadow, spacing, tints, type ColorToken } from "@/theme/tokens";

const SUMMARY: { status: LeadStatus; icon: IconName; color: ColorToken; bg: string }[] = [
  { status: "new", icon: "sparkles-outline", color: "info", bg: tints.info },
  { status: "follow_up", icon: "time-outline", color: "warning", bg: tints.warning },
  { status: "viewing_scheduled", icon: "calendar-outline", color: "success", bg: tints.success },
];

export default function AgentHome() {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const { profile, leads } = usePrototype();
  const { width } = useWindowDimensions();

  const featured = COMPOUNDS.filter((c) => c.featured);
  const needsAttention = useMemo(
    () =>
      leads
        .filter((l) => l.status === "new" || l.status === "follow_up")
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt)),
    [leads],
  );
  const recent = useMemo(
    () =>
      leads
        .flatMap((lead) => lead.notes.map((note) => ({ lead, note })))
        .sort((a, b) => b.note.at.localeCompare(a.note.at))
        .slice(0, 3),
    [leads],
  );
  const count = (status: LeadStatus) => leads.filter((l) => l.status === status).length;
  const carouselWidth = Math.min(width * 0.68, 280);

  return (
    <Screen edges={["top"]} padded={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text variant="label" weight="semibold" color="white">
              {initials(profile.firstName, profile.lastName)}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="caption" color="whiteA70">
              {t("home.welcome")}
            </Text>
            <Text variant="h2" color="white" numberOfLines={1}>
              {profile.firstName}
            </Text>
          </View>
          <LanguageToggle tone="light" />
        </View>
        <View style={styles.qualifiedPill}>
          <Icon name="shield-checkmark" size={14} color="white" />
          <Text variant="caption" color="white">
            {t("home.qualifiedBadge")}
          </Text>
        </View>
        <Text variant="bodySm" color="whiteA70">
          {t("home.subtitle")}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickTile
            icon="business"
            title={t("home.quick.properties")}
            subtitle={t("home.quick.propertiesSub", { value: formatNumber(COMPOUNDS.length, intlLocale) })}
            onPress={() => router.push("/properties")}
          />
          <QuickTile
            icon="people"
            title={t("home.quick.leads")}
            subtitle={t("home.quick.leadsSub", { value: formatNumber(leads.length, intlLocale) })}
            onPress={() => router.push("/leads")}
          />
        </View>

        {/* Lead summary */}
        <View>
          <SectionHeader title={t("home.summaryTitle")} actionLabel={t("home.seeLeads")} onAction={() => router.push("/leads")} />
          <View style={styles.summaryRow}>
            {SUMMARY.map((s) => (
              <Card key={s.status} style={styles.summaryTile} onPress={() => router.push("/leads")}>
                <View style={[styles.summaryIcon, { backgroundColor: s.bg }]}>
                  <Icon name={s.icon} size={16} color={s.color} />
                </View>
                <Text variant="h1" color="navy">
                  {formatNumber(count(s.status), intlLocale)}
                </Text>
                <Text variant="caption" color="inkMuted" numberOfLines={2}>
                  {t(`leadStatus.${s.status}`)}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Needs attention */}
        <View>
          <SectionHeader title={t("home.attentionTitle")} />
          {needsAttention.length === 0 ? (
            <Card>
              <EmptyState icon="checkmark-done-outline" title={t("home.attentionEmpty")} />
            </Card>
          ) : (
            <View style={styles.stack}>
              {needsAttention.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Featured developments */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionPad}>
          <SectionHeader
            title={t("home.featuredTitle")}
            actionLabel={t("home.browseAll")}
            onAction={() => router.push("/properties")}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          decelerationRate="fast"
          snapToInterval={carouselWidth + spacing.md}
        >
          {featured.map((c) => (
            <FeaturedCompoundCard key={c.id} compound={c} width={carouselWidth} />
          ))}
        </ScrollView>
      </View>

      {/* Recent activity */}
      <View style={styles.body}>
        <View>
          <SectionHeader title={t("home.activityTitle")} />
          {recent.length === 0 ? (
            <Card>
              <EmptyState icon="document-text-outline" title={t("home.activityEmpty")} />
            </Card>
          ) : (
            <Card padded={false} style={styles.activityCard}>
              {recent.map(({ lead, note }, i) => (
                <Pressable
                  key={note.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/lead/${lead.id}`)}
                  style={({ pressed }) => [styles.activityRow, i > 0 && styles.activityDivider, pressed && styles.pressed]}
                >
                  <View style={styles.activityIcon}>
                    <Icon name="chatbox-ellipses-outline" size={16} color="navy" />
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.activityHead}>
                      <Text variant="label" weight="semibold" numberOfLines={1} style={styles.flex}>
                        {t("home.noteOn", { name: lead.name })}
                      </Text>
                      <Text variant="caption" color="inkMuted">
                        {formatActivity(note.at, intlLocale, t)}
                      </Text>
                    </View>
                    <Text variant="bodySm" color="inkMuted" numberOfLines={2}>
                      {note.body}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}

function QuickTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Card style={styles.quickTile} onPress={onPress} accessibilityLabel={title}>
      <View style={styles.quickIcon}>
        <Icon name={icon} size={20} color="white" />
      </View>
      <Text variant="body" weight="semibold">
        {title}
      </Text>
      <Text variant="caption" color="inkMuted">
        {subtitle}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    borderBottomStartRadius: radius.xl,
    borderBottomEndRadius: radius.xl,
    gap: spacing.md,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.whiteA20,
    alignItems: "center",
    justifyContent: "center",
  },
  qualifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  body: { paddingHorizontal: spacing.lg, gap: spacing.xl },
  quickRow: { flexDirection: "row", gap: spacing.md, marginTop: -spacing.xxl },
  quickTile: { flex: 1, gap: spacing.xs, padding: spacing.lg, ...shadow.elevated },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  summaryRow: { flexDirection: "row", gap: spacing.sm },
  summaryTile: { flex: 1, padding: spacing.md, gap: spacing.xs },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: { gap: spacing.sm },
  featuredSection: { marginVertical: spacing.xl },
  sectionPad: { paddingHorizontal: spacing.lg },
  carousel: { paddingHorizontal: spacing.lg, gap: spacing.md },
  activityCard: { overflow: "hidden" },
  activityRow: { flexDirection: "row", gap: spacing.md, padding: spacing.lg },
  activityDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  activityHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 2 },
});
