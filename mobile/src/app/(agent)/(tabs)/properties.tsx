import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ChipFilter, CompoundCard, locationName } from "@/components/agent/cards";
import { SearchField } from "@/components/agent/search-field";
import { Button, Card, EmptyState, Notice, Screen, Text } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatNumber } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import { COMPOUNDS, LOCATIONS, PROPERTY_TYPES } from "@/mock/properties";
import { spacing } from "@/theme/tokens";

export default function PropertiesCatalogue() {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const L = useLocalized();
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPOUNDS.filter((c) => {
      if (locationId && c.locationId !== locationId) return false;
      if (typeId && !c.propertyTypeIds.includes(typeId)) return false;
      if (!q) return true;
      const loc = locationName(c.locationId);
      // Search both languages so an agent can type either script.
      const haystack = [c.name.en, c.name.ar, c.developer.en, c.developer.ar, loc?.en ?? "", loc?.ar ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, locationId, typeId]);

  const clear = () => {
    setQuery("");
    setLocationId(null);
    setTypeId(null);
  };

  return (
    <Screen edges={["top"]}>
      <View style={styles.head}>
        <Text variant="h1">{t("properties.title")}</Text>
        <Text variant="bodySm" color="inkMuted">
          {t("properties.subtitle")}
        </Text>
      </View>

      <SearchField value={query} onChangeText={setQuery} placeholder={t("properties.searchPlaceholder")} />

      <View style={styles.filters}>
        <Text variant="caption" color="inkMuted">
          {t("properties.locationFilter")}
        </Text>
        <ChipFilter
          allLabel={t("properties.allLocations")}
          value={locationId}
          onChange={setLocationId}
          options={LOCATIONS.map((l) => ({ id: l.id, label: L(l.name) }))}
        />
        <Text variant="caption" color="inkMuted" style={styles.filterLabel}>
          {t("properties.typeFilter")}
        </Text>
        <ChipFilter
          allLabel={t("properties.allTypes")}
          value={typeId}
          onChange={setTypeId}
          options={PROPERTY_TYPES.map((p) => ({ id: p.id, label: L(p.name) }))}
        />
      </View>

      <Text variant="label" color="inkMuted" style={styles.count}>
        {t("properties.resultCount", { value: formatNumber(results.length, intlLocale) })}
      </Text>

      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon="search-outline"
            title={t("properties.emptyTitle")}
            body={t("properties.emptyBody")}
            action={
              <Button label={t("properties.clearFilters")} variant="secondary" fullWidth={false} onPress={clear} />
            }
          />
        </Card>
      ) : (
        <View style={styles.list}>
          {results.map((c) => (
            <CompoundCard key={c.id} compound={c} />
          ))}
        </View>
      )}

      <View style={styles.note}>
        <Notice tone="info" icon="cash-outline" body={t("common:currencyNote")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.lg },
  filters: { marginTop: spacing.lg, gap: spacing.xs },
  filterLabel: { marginTop: spacing.sm },
  count: { marginTop: spacing.lg, marginBottom: spacing.md },
  list: { gap: spacing.lg },
  note: { marginTop: spacing.xl },
});
