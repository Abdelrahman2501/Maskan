import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useTranslation } from "react-i18next";

import { AvailabilityBadge } from "@/components/agent/badges";
import { PropertyCover } from "@/components/agent/property-cover";
import { Button, Card, Divider, EmptyState, Header, Icon, Notice, Screen, SectionHeader, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { compoundById, propertyTypeById, unitModelById } from "@/mock/properties";
import { colors, radius, spacing, tints } from "@/theme/tokens";
import { DirectionView } from "@/components/ui/direction-view";

const MAX_DOTS = 8;

export default function UnitModelDetail() {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = id ? unitModelById(id) : undefined;
  const compound = unit ? compoundById(unit.compoundId) : undefined;
  const [page, setPage] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [shared, setShared] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(compound ? `/compound/${compound.id}` : "/properties");
  };

  if (!unit || !compound) {
    return (
      <Screen>
        <Header onBack={goBack} />
        <EmptyState
          icon="grid-outline"
          title={t("unit.notFoundTitle")}
          body={t("unit.notFoundBody")}
          action={<Button label={t("compound.backToCatalogue")} fullWidth={false} onPress={() => router.replace("/properties")} />}
        />
      </Screen>
    );
  }

  const type = propertyTypeById(unit.propertyTypeId);
  const photos = Math.max(1, unit.mediaCount);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!galleryWidth) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / galleryWidth);
    if (next !== page) setPage(Math.max(0, Math.min(photos - 1, next)));
  };

  const share = () => {
    setShared(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShared(false), 4000);
  };

  return (
    <Screen
      edges={["top", "bottom"]}
      footer={
        <>
          {shared && <Notice tone="success" title={t("unit.sharedTitle")} body={t("unit.sharedBody")} />}
          <Button label={t("unit.share")} icon="share-social-outline" size="lg" onPress={share} />
        </>
      }
    >
      <Header title={L(unit.name)} onBack={goBack} />

      {/* Breadcrumb back to the compound */}
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push(`/compound/${compound.id}`)}
        style={styles.breadcrumb}
        hitSlop={6}
      >
        <Icon name="business-outline" size={14} color="accent" />
        <Text variant="label" color="accent" numberOfLines={1} style={styles.shrink}>
          {L(compound.name)}
        </Text>
        <Icon name="chevron-forward" size={12} color="inkMuted" directional />
        <Text variant="label" color="inkMuted" numberOfLines={1} style={styles.shrink}>
          {type ? L(type.name) : L(unit.name)}
        </Text>
      </Pressable>

      {/* Gallery (placeholder). Kept LTR so swipe order and dots match on every platform. */}
      <View style={styles.gallery} onLayout={(e) => setGalleryWidth(e.nativeEvent.layout.width)}>
        {galleryWidth > 0 && (
          <DirectionView dir="ltr">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {Array.from({ length: photos }, (_, i) => (
              <PropertyCover
                key={i}
                tone={compound.coverTone + i}
                height={240}
                rounded={false}
                icon={i === 0 ? "business" : "image-outline"}
                style={{ width: galleryWidth }}
              />
            ))}
          </ScrollView>
          </DirectionView>
        )}
        <View style={styles.galleryCount} pointerEvents="none">
          <Icon name="images-outline" size={13} color="white" />
          <Text variant="caption" color="white">
            {t("unit.photoOf", {
              current: formatNumber(page + 1, intlLocale),
              total: formatNumber(photos, intlLocale),
            })}
          </Text>
        </View>
        <DirectionView dir="ltr" style={styles.dots} pointerEvents="none">
          {Array.from({ length: Math.min(photos, MAX_DOTS) }, (_, i) => {
            const active = Math.min(page, MAX_DOTS - 1) === i;
            return <View key={i} style={[styles.dot, active && styles.dotActive]} />;
          })}
        </DirectionView>
      </View>

      <View style={styles.titleBlock}>
        <AvailabilityBadge availability={unit.availability} />
        <Text variant="h1">{L(unit.name)}</Text>
        <Text variant="bodySm" color="inkMuted">
          {t("compound.byDeveloper", { developer: L(compound.developer) })}
        </Text>
      </View>

      {/* Key specs */}
      <View style={styles.keySpecs}>
        <KeySpec icon="resize-outline" value={t("unit.sqm", { value: formatNumber(unit.areaSqm, intlLocale) })} label={t("unit.area")} />
        <KeySpec icon="bed-outline" value={formatNumber(unit.bedrooms, intlLocale)} label={t("unit.bedrooms")} />
        <KeySpec icon="water-outline" value={formatNumber(unit.bathrooms, intlLocale)} label={t("unit.bathrooms")} />
        <KeySpec icon="layers-outline" value={L(unit.floor)} label={t("unit.floor")} />
      </View>

      {/* Prices */}
      <View style={styles.section}>
        <SectionHeader title={t("unit.prices")} />
        <Card padded={false} style={styles.priceCard}>
          {unit.prices.map((p, i) => (
            <View key={`${p.label.en}-${p.currency}`}>
              {i > 0 && <Divider />}
              <View style={styles.priceRow}>
                <View style={styles.flex}>
                  <Text variant="label" color="inkMuted">
                    {L(p.label)}
                  </Text>
                  <Text variant="h2" color="navy">
                    {formatMoney(p.amount, p.currency, intlLocale)}
                  </Text>
                  <Text variant="caption" color="inkMuted">
                    {t("unit.lastUpdated", { date: formatDate(p.updatedAt, intlLocale) })}
                  </Text>
                </View>
                <View style={styles.currency}>
                  <Text variant="caption" weight="semibold" color="navy" style={styles.ltr}>
                    {p.currency}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
        <View style={styles.noteGap}>
          <Notice tone="info" icon="cash-outline" body={t("common:currencyNote")} />
        </View>
      </View>

      {/* Media */}
      {(unit.hasVideo || unit.hasFloorPlan) && (
        <View style={styles.section}>
          <SectionHeader title={t("unit.media")} />
          <View style={styles.mediaRow}>
            {unit.hasVideo && (
              <MediaCard icon="play" title={t("unit.video")} subtitle={t("unit.videoHint")} tone={compound.coverTone + 1} />
            )}
            {unit.hasFloorPlan && (
              <MediaCard icon="git-network-outline" title={t("unit.floorPlan")} subtitle={t("unit.floorPlanHint")} plan />
            )}
          </View>
        </View>
      )}

      {/* Specifications */}
      <View style={styles.section}>
        <SectionHeader title={t("unit.specifications")} />
        <Card padded={false} style={styles.table}>
          <SpecRow label={t("unit.propertyType")} value={type ? L(type.name) : "—"} />
          <SpecRow label={t("unit.finishing")} value={L(unit.finishing)} />
          <SpecRow label={t("unit.view")} value={L(unit.view)} />
          <SpecRow label={t("unit.availability")} value={t(`availability.${unit.availability}`)} />
          {unit.specs.map((s) => (
            <SpecRow key={s.label.en} label={L(s.label)} value={L(s.value)} />
          ))}
        </Card>
      </View>

    </Screen>
  );
}

function KeySpec({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={styles.keySpec}>
      <Icon name={icon} size={20} color="navy" />
      <Text variant="body" weight="semibold" align="center" numberOfLines={2}>
        {value}
      </Text>
      <Text variant="caption" color="inkMuted" align="center" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text variant="bodySm" color="inkMuted" style={styles.specLabel}>
        {label}
      </Text>
      <Text variant="bodySm" weight="medium" align="end" style={styles.flex}>
        {value}
      </Text>
    </View>
  );
}

function MediaCard({
  icon,
  title,
  subtitle,
  tone,
  plan = false,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  tone?: number;
  plan?: boolean;
}) {
  return (
    <Card padded={false} style={styles.mediaCard} accessibilityLabel={title}>
      {plan ? (
        <View style={styles.planPreview}>
          <View style={styles.planGrid}>
            <View style={[styles.planRoom, { flex: 2 }]} />
            <View style={styles.planCol}>
              <View style={styles.planRoom} />
              <View style={styles.planRoom} />
            </View>
          </View>
          <View style={styles.mediaIcon}>
            <Icon name={icon} size={18} color="navy" />
          </View>
        </View>
      ) : (
        <PropertyCover tone={tone ?? 0} height={96} rounded={false} icon={icon} />
      )}
      <View style={styles.mediaBody}>
        <Text variant="label" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" color="inkMuted">
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  ltr: { writingDirection: "ltr" },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2, marginBottom: spacing.md },
  gallery: { height: 240, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.navy },
  galleryCount: {
    position: "absolute",
    top: spacing.md,
    end: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  dots: {
    position: "absolute",
    bottom: spacing.md,
    start: 0,
    end: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs + 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.whiteA70 },
  dotActive: { width: 18, backgroundColor: colors.white },
  titleBlock: { marginTop: spacing.lg, gap: spacing.sm },
  keySpecs: {
    flexDirection: "row",
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  keySpec: { flex: 1, alignItems: "center", gap: 2, paddingHorizontal: spacing.xs },
  section: { marginTop: spacing.xl },
  priceCard: { overflow: "hidden" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  currency: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: tints.navy,
  },
  noteGap: { marginTop: spacing.md },
  mediaRow: { flexDirection: "row", gap: spacing.md },
  mediaCard: { flex: 1, overflow: "hidden" },
  mediaBody: { padding: spacing.md, gap: 2 },
  planPreview: {
    height: 96,
    backgroundColor: tints.info,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  planGrid: {
    ...StyleSheet.absoluteFill,
    margin: spacing.md,
    flexDirection: "row",
    gap: spacing.xs,
  },
  planCol: { flex: 1, gap: spacing.xs },
  planRoom: { flex: 1, borderWidth: 1.5, borderColor: colors.accent, borderRadius: 2, opacity: 0.45 },
  mediaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  table: { overflow: "hidden", paddingVertical: spacing.xs },
  specRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  specLabel: { flex: 1 },
});
