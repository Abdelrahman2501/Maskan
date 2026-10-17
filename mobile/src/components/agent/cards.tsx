import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Card, Chip, Icon, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatMoney } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import type { Lead } from "@/mock/leads";
import { compoundById, LOCATIONS, type Compound } from "@/mock/properties";
import { colors, radius, spacing, tints } from "@/theme/tokens";

import { CompoundStatusBadge, LeadStatusBadge } from "./badges";
import { formatActivity, initials } from "./format";
import { PropertyCover } from "./property-cover";

export const locationName = (id: string) => LOCATIONS.find((l) => l.id === id)?.name;

/** Catalogue card for a compound (cover, name, location, developer, status, starting price). */
export function CompoundCard({ compound }: { compound: Compound }) {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const location = locationName(compound.locationId);
  return (
    <Card
      padded={false}
      style={styles.compoundCard}
      onPress={() => router.push(`/compound/${compound.id}`)}
      accessibilityLabel={L(compound.name)}
    >
      <PropertyCover tone={compound.coverTone} height={150} rounded={false}>
        <View style={styles.coverTop}>
          {compound.featured ? (
            <View style={styles.featuredPill}>
              <Icon name="star" size={12} color="white" />
              <Text variant="caption" color="white">
                {t("properties.featured")}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>
      </PropertyCover>
      <View style={styles.compoundBody}>
        <View style={styles.titleRow}>
          <Text variant="h3" style={styles.flex} numberOfLines={1}>
            {L(compound.name)}
          </Text>
          <CompoundStatusBadge compound={compound} />
        </View>
        <View style={styles.metaRow}>
          <Icon name="location-outline" size={15} color="inkMuted" />
          <Text variant="bodySm" color="inkMuted" numberOfLines={1} style={styles.flex}>
            {location ? L(location) : ""}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="briefcase-outline" size={15} color="inkMuted" />
          <Text variant="bodySm" color="inkMuted" numberOfLines={1} style={styles.flex}>
            {L(compound.developer)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <View style={styles.flex}>
            <Text variant="caption" color="inkMuted">
              {t("properties.startingFrom")}
            </Text>
            <Text variant="h3" color="navy">
              {formatMoney(compound.startingPrice.amount, compound.startingPrice.currency, intlLocale)}
            </Text>
          </View>
          <View style={styles.arrow}>
            <Icon name="arrow-forward" size={18} color="navy" directional />
          </View>
        </View>
      </View>
    </Card>
  );
}

/** Compact card for the featured developments carousel. */
export function FeaturedCompoundCard({ compound, width }: { compound: Compound; width: number }) {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const location = locationName(compound.locationId);
  return (
    <Card
      padded={false}
      style={[styles.featuredCard, { width }]}
      onPress={() => router.push(`/compound/${compound.id}`)}
      accessibilityLabel={L(compound.name)}
    >
      <PropertyCover tone={compound.coverTone} height={130} rounded={false} />
      <View style={styles.featuredBody}>
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {L(compound.name)}
        </Text>
        <Text variant="caption" color="inkMuted" numberOfLines={1}>
          {location ? L(location) : ""}
        </Text>
        <Text variant="label" color="navy" weight="semibold" numberOfLines={1}>
          {t("properties.fromPrice", {
            price: formatMoney(compound.startingPrice.amount, compound.startingPrice.currency, intlLocale),
          })}
        </Text>
      </View>
    </Card>
  );
}

/** One assigned lead in a list. */
export function LeadRow({ lead }: { lead: Lead }) {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const compound = lead.compoundId ? compoundById(lead.compoundId) : undefined;
  return (
    <Card style={styles.leadCard} onPress={() => router.push(`/lead/${lead.id}`)} accessibilityLabel={lead.name}>
      <View style={styles.leadTop}>
        <View style={styles.avatar}>
          <Text variant="label" weight="semibold" color="navy">
            {initials(lead.name)}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {lead.name}
          </Text>
          <Text variant="bodySm" color="inkMuted" numberOfLines={1}>
            {L(lead.interest)}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color="inkMuted" directional />
      </View>
      <View style={styles.leadBottom}>
        <LeadStatusBadge status={lead.status} />
        {compound && (
          <View style={[styles.metaRow, styles.shrink]}>
            <Icon name="business-outline" size={13} color="inkMuted" />
            <Text variant="caption" color="inkMuted" numberOfLines={1} style={styles.shrink}>
              {L(compound.name)}
            </Text>
          </View>
        )}
        <View style={styles.spacer} />
        <Text variant="caption" color="inkMuted">
          {formatActivity(lead.lastActivityAt, intlLocale, t)}
        </Text>
      </View>
    </Card>
  );
}

/** Horizontally scrolling single-select chip row. `null` = "All". */
export function ChipFilter<T extends string>({
  options,
  value,
  onChange,
  allLabel,
}: {
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      <Chip label={allLabel} selected={value === null} onPress={() => onChange(null)} />
      {options.map((o) => (
        <Chip key={o.id} label={o.label} selected={value === o.id} onPress={() => onChange(o.id)} />
      ))}
    </ScrollView>
  );
}

const AMENITY_ICONS: [RegExp, IconName][] = [
  [/pool|swim/i, "water-outline"],
  [/security/i, "shield-checkmark-outline"],
  [/kids/i, "happy-outline"],
  [/jog|track/i, "walk-outline"],
  [/retail|mall|commercial/i, "storefront-outline"],
  [/club/i, "people-outline"],
  [/garden|park/i, "leaf-outline"],
  [/mosque/i, "moon-outline"],
  [/gym/i, "barbell-outline"],
  [/parking/i, "car-outline"],
  [/concierge/i, "key-outline"],
  [/work/i, "laptop-outline"],
  [/school/i, "school-outline"],
  [/cycl/i, "bicycle-outline"],
  [/monorail/i, "train-outline"],
  [/smart/i, "bulb-outline"],
];

/** Picks an icon from the English amenity name (sample data has no icon field). */
export function amenityIcon(englishName: string): IconName {
  return AMENITY_ICONS.find(([re]) => re.test(englishName))?.[1] ?? "sparkles-outline";
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  spacer: { flex: 1 },
  compoundCard: { overflow: "hidden" },
  coverTop: { flexDirection: "row", justifyContent: "space-between" },
  featuredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.whiteA20,
  },
  compoundBody: { padding: spacing.lg, gap: spacing.xs + 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredCard: { overflow: "hidden" },
  featuredBody: { padding: spacing.md, gap: 2 },
  leadCard: { gap: spacing.md, padding: spacing.md + 2 },
  leadTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  leadBottom: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
});
