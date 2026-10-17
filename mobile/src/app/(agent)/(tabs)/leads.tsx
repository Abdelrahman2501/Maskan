import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ChipFilter, LeadRow } from "@/components/agent/cards";
import { SearchField } from "@/components/agent/search-field";
import { Button, Card, EmptyState, Icon, Notice, Screen, Text } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatNumber } from "@/lib/format";
import { LEAD_STATUSES, type LeadStatus } from "@/mock/leads";
import { usePrototype } from "@/prototype/store";
import { spacing } from "@/theme/tokens";

export default function MyLeads() {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  // PROTOTYPE: the store only holds leads assigned to the signed-in agent (LEAD-003).
  const { leads } = usePrototype();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [newestFirst, setNewestFirst] = useState(true);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return leads
      .filter((l) => {
        if (status && l.status !== status) return false;
        if (!q) return true;
        return l.name.toLowerCase().includes(q) || (digits.length > 0 && l.phone.replace(/\D/g, "").includes(digits));
      })
      .sort((a, b) =>
        newestFirst ? b.lastActivityAt.localeCompare(a.lastActivityAt) : a.lastActivityAt.localeCompare(b.lastActivityAt),
      );
  }, [leads, query, status, newestFirst]);

  return (
    <Screen edges={["top"]}>
      <View style={styles.head}>
        <Text variant="h1">{t("leads.title")}</Text>
        <Text variant="bodySm" color="inkMuted">
          {t("leads.subtitle", { value: formatNumber(leads.length, intlLocale) })}
        </Text>
      </View>

      <SearchField value={query} onChangeText={setQuery} placeholder={t("leads.searchPlaceholder")} />

      <View style={styles.filters}>
        <ChipFilter
          allLabel={t("leads.allStatuses")}
          value={status}
          onChange={setStatus}
          options={LEAD_STATUSES.map((s) => ({ id: s, label: t(`leadStatus.${s}`) }))}
        />
      </View>

      <View style={styles.toolbar}>
        <Text variant="label" color="inkMuted" style={styles.flex}>
          {t("leads.resultCount", { value: formatNumber(results.length, intlLocale) })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("leads.sortLabel")}
          onPress={() => setNewestFirst((v) => !v)}
          hitSlop={8}
          style={styles.sort}
        >
          <Icon name="swap-vertical" size={16} color="navy" />
          <Text variant="label" color="navy">
            {newestFirst ? t("leads.sortNewest") : t("leads.sortOldest")}
          </Text>
        </Pressable>
      </View>

      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon="people-outline"
            title={t("leads.emptyTitle")}
            body={t("leads.emptyBody")}
            action={
              query || status ? (
                <Button
                  label={t("leads.clearFilters")}
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => {
                    setQuery("");
                    setStatus(null);
                  }}
                />
              ) : undefined
            }
          />
        </Card>
      ) : (
        <View style={styles.list}>
          {results.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </View>
      )}

      <View style={styles.note}>
        <Notice tone="info" icon="lock-closed-outline" body={t("leads.assignedOnly")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.lg },
  filters: { marginTop: spacing.md },
  toolbar: { flexDirection: "row", alignItems: "center", marginTop: spacing.md, marginBottom: spacing.md },
  sort: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  list: { gap: spacing.sm },
  note: { marginTop: spacing.xl },
});
