import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AvailabilityBadge, CompoundStatusBadge } from "@/components/agent/badges";
import { amenityIcon, locationName } from "@/components/agent/cards";
import { PropertyCover } from "@/components/agent/property-cover";
import { Button, Card, EmptyState, Header, Icon, Notice, Screen, SectionHeader, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatMoney, formatNumber } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { compoundById, propertyTypeById, unitModelsForCompound, type UnitModel } from "@/mock/properties";
import { colors, radius, spacing, tints } from "@/theme/tokens";

export default function CompoundDetail() {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const { id } = useLocalSearchParams<{ id: string }>();
  const compound = id ? compoundById(id) : undefined;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/properties"));

  if (!compound) {
    return (
      <Screen>
        <Header onBack={goBack} />
        <EmptyState
          icon="business-outline"
          title={t("compound.notFoundTitle")}
          body={t("compound.notFoundBody")}
          action={<Button label={t("compound.backToCatalogue")} fullWidth={false} onPress={() => router.replace("/properties")} />}
        />
      </Screen>
    );
  }

  const units = unitModelsForCompound(compound.id);
  const mediaCount = units.reduce((sum, u) => sum + u.mediaCount, 0);
  const location = locationName(compound.locationId);

  return (
    <Screen edges={["top"]}>
      <Header title={L(compound.name)} onBack={goBack} />

      <PropertyCover tone={compound.coverTone} height={220}>
        <View style={styles.coverTop}>
          <View />
          <View style={styles.galleryPill}>
            <Icon name="images-outline" size={14} color="white" />
            <Text variant="caption" color="white">
              {t("compound.photos", { value: formatNumber(mediaCount, intlLocale) })}
            </Text>
          </View>
        </View>
      </PropertyCover>

      <View style={styles.intro}>
        <CompoundStatusBadge compound={compound} />
        <Text variant="h1">{L(compound.name)}</Text>
        <MetaLine icon="briefcase-outline" text={t("compound.byDeveloper", { developer: L(compound.developer) })} />
        <MetaLine icon="location-outline" text={L(compound.address)} />
        {location && <MetaLine icon="map-outline" text={L(location)} />}
      </View>

      <Card style={styles.priceCard}>
        <Text variant="caption" color="whiteA70">
          {t("properties.startingFrom")}
        </Text>
        <Text variant="h1" color="white">
          {formatMoney(compound.startingPrice.amount, compound.startingPrice.currency, intlLocale)}
        </Text>
        <Text variant="caption" color="whiteA70">
          {t("compound.priceHint")}
        </Text>
      </Card>

      <View style={styles.section}>
        <SectionHeader title={t("compound.about")} />
        <Text color="ink">{L(compound.description)}</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("compound.amenities")} />
        <View style={styles.amenities}>
          {compound.amenities.map((a) => (
            <View key={a.en} style={styles.amenity}>
              <View style={styles.amenityIcon}>
                <Icon name={amenityIcon(a.en)} size={18} color="navy" />
              </View>
              <Text variant="label" style={styles.flex} numberOfLines={2}>
                {L(a)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("compound.propertyTypes")} />
        <View style={styles.types}>
          {compound.propertyTypeIds.map((pid) => {
            const pt = propertyTypeById(pid);
            if (!pt) return null;
            return (
              <View key={pid} style={styles.typePill}>
                <Icon name={pt.icon as IconName} size={16} color="navy" />
                <Text variant="label" color="navy">
                  {L(pt.name)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("compound.unitModels", { value: formatNumber(units.length, intlLocale) })} />
        {units.length === 0 ? (
          <Card>
            <EmptyState icon="grid-outline" title={t("compound.noUnits")} />
          </Card>
        ) : (
          <View style={styles.units}>
            {units.map((u) => (
              <UnitCard key={u.id} unit={u} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Notice tone="info" icon="cash-outline" body={t("common:currencyNote")} />
      </View>
    </Screen>
  );
}

function MetaLine({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={16} color="inkMuted" />
      <Text variant="bodySm" color="inkMuted" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

function UnitCard({ unit }: { unit: UnitModel }) {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const type = propertyTypeById(unit.propertyTypeId);
  const first = unit.prices[0];
  return (
    <Card onPress={() => router.push(`/unit/${unit.id}`)} accessibilityLabel={L(unit.name)} style={styles.unitCard}>
      <View style={styles.unitHead}>
        <View style={styles.flex}>
          <Text variant="body" weight="semibold">
            {L(unit.name)}
          </Text>
          {type && (
            <Text variant="caption" color="inkMuted">
              {L(type.name)}
            </Text>
          )}
        </View>
        <AvailabilityBadge availability={unit.availability} />
      </View>
      <View style={styles.specRow}>
        <Spec icon="resize-outline" text={t("unit.sqm", { value: formatNumber(unit.areaSqm, intlLocale) })} />
        <Spec icon="bed-outline" text={t("unit.bedsShort", { value: formatNumber(unit.bedrooms, intlLocale) })} />
        <Spec icon="water-outline" text={t("unit.bathsShort", { value: formatNumber(unit.bathrooms, intlLocale) })} />
      </View>
      {first && (
        <View style={styles.unitPrice}>
          <View style={styles.flex}>
            <Text variant="caption" color="inkMuted">
              {L(first.label)}
            </Text>
            <Text variant="h3" color="navy">
              {formatMoney(first.amount, first.currency, intlLocale)}
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color="inkMuted" directional />
        </View>
      )}
    </Card>
  );
}

function Spec({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.spec}>
      <Icon name={icon} size={15} color="navy" />
      <Text variant="label">{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  coverTop: { flexDirection: "row", justifyContent: "space-between" },
  galleryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  intro: { marginTop: spacing.lg, gap: spacing.sm },
  meta: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  priceCard: { marginTop: spacing.lg, backgroundColor: colors.navy, borderColor: colors.navy, gap: 2 },
  section: { marginTop: spacing.xl },
  amenities: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.sm, columnGap: spacing.sm },
  amenity: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 2,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  types: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: tints.navy,
  },
  units: { gap: spacing.md },
  unitCard: { gap: spacing.md },
  unitHead: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  specRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  spec: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  unitPrice: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
