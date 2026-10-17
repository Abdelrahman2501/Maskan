import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LeadStatusBadge } from "@/components/agent/badges";
import { initials } from "@/components/agent/format";
import { StatusSheet } from "@/components/agent/sheets";
import { Button, Card, Divider, EmptyState, Header, Icon, ListRow, Notice, Screen, SectionHeader, Text, type IconName } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useLocalized } from "@/lib/localized";
import type { LeadStatus } from "@/mock/leads";
import { compoundById } from "@/mock/properties";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing, tints } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

const NOTE_MAX = 5000;

export default function LeadDetail() {
  const { t } = useTranslation("agent");
  const { language, isRTL, intlLocale } = useLocale();
  const L = useLocalized();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, addLeadNote, setLeadStatus } = usePrototype();
  // Only the agent's assigned leads are in scope; anything else is a 404 (LEAD-007).
  const lead = leads.find((l) => l.id === id);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const notes = useMemo(() => (lead ? [...lead.notes].sort((a, b) => b.at.localeCompare(a.at)) : []), [lead]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/leads"));

  if (!lead) {
    return (
      <Screen>
        <Header onBack={goBack} />
        <EmptyState
          icon="person-remove-outline"
          title={t("lead.notFoundTitle")}
          body={t("lead.notFoundBody")}
          action={<Button label={t("lead.backToLeads")} fullWidth={false} onPress={() => router.replace("/leads")} />}
        />
      </Screen>
    );
  }

  const compound = lead.compoundId ? compoundById(lead.compoundId) : undefined;
  const dial = lead.phone.replace(/[^\d+]/g, "");
  const trimmed = draft.trim();

  const notify = (message: string) => {
    setFlash(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(null), 3000);
  };

  const changeStatus = (status: LeadStatus) => {
    setSheetOpen(false);
    if (status === lead.status) return;
    setLeadStatus(lead.id, status);
    notify(t("lead.statusUpdated", { status: t(`leadStatus.${status}`) }));
  };

  const saveNote = () => {
    if (!trimmed) return;
    addLeadNote(lead.id, trimmed.slice(0, NOTE_MAX));
    setDraft("");
    notify(t("lead.noteSaved"));
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={t("lead.title")} onBack={goBack} />

      {flash && (
        <View style={styles.flash}>
          <Notice tone="success" body={flash} />
        </View>
      )}

      {/* Customer */}
      <Card style={styles.customer}>
        <View style={styles.customerHead}>
          <View style={styles.avatar}>
            <Text variant="h3" color="white">
              {initials(lead.name)}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="h2">{lead.name}</Text>
            <Text variant="caption" color="inkMuted" style={styles.ltrText}>
              {lead.id}
            </Text>
          </View>
        </View>
        <View style={styles.phoneRow}>
          <Icon name="call-outline" size={16} color="inkMuted" />
          <Text variant="body" weight="medium" style={styles.ltrText}>
            {lead.phone}
          </Text>
        </View>
        {lead.email && (
          <View style={styles.phoneRow}>
            <Icon name="mail-outline" size={16} color="inkMuted" />
            <Text variant="bodySm" style={styles.ltrText} numberOfLines={1}>
              {lead.email}
            </Text>
          </View>
        )}
        <View style={styles.actions}>
          <Button
            label={t("lead.call")}
            icon="call"
            size="sm"
            style={styles.flex}
            onPress={() => void Linking.openURL(`tel:${dial}`).catch(() => undefined)}
          />
          <Button
            label={t("lead.whatsapp")}
            icon="logo-whatsapp"
            size="sm"
            variant="secondary"
            style={styles.flex}
            onPress={() => void Linking.openURL(`https://wa.me/${dial.replace("+", "")}`).catch(() => undefined)}
          />
        </View>
      </Card>

      {/* Status */}
      <Card style={styles.statusCard}>
        <View style={styles.flex}>
          <Text variant="caption" color="inkMuted">
            {t("lead.status")}
          </Text>
          <View style={styles.statusBadge}>
            <LeadStatusBadge status={lead.status} />
          </View>
        </View>
        <Button
          label={t("lead.changeStatus")}
          variant="secondary"
          size="sm"
          fullWidth={false}
          trailingIcon="chevron-down"
          onPress={() => setSheetOpen(true)}
        />
      </Card>

      {/* Details */}
      <View style={styles.section}>
        <SectionHeader title={t("lead.details")} />
        <Card padded={false} style={styles.group}>
          <DetailRow icon="home-outline" label={t("lead.interest")} value={L(lead.interest)} />
          <Divider />
          <DetailRow
            icon="wallet-outline"
            label={t("lead.budget")}
            value={lead.budget ? formatMoney(lead.budget.amount, lead.budget.currency, intlLocale) : t("lead.notProvided")}
          />
          <Divider />
          <DetailRow icon="funnel-outline" label={t("lead.source")} value={L(lead.source)} />
          <Divider />
          <DetailRow
            icon="person-add-outline"
            label={t("lead.assignedBy")}
            value={t("lead.assignedByValue", { name: lead.assignedBy, date: formatDate(lead.assignedAt, intlLocale) })}
          />
        </Card>
        {compound && (
          <Card padded={false} style={[styles.group, styles.compoundLink]}>
            <ListRow
              icon="business-outline"
              title={L(compound.name)}
              subtitle={t("lead.viewCompound")}
              onPress={() => router.push(`/compound/${compound.id}`)}
            />
          </Card>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <SectionHeader title={t("lead.notes", { value: formatNumber(notes.length, intlLocale) })} />
        <Card style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t("lead.notePlaceholder")}
            accessibilityLabel={t("lead.addNote")}
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={NOTE_MAX}
            textAlignVertical="top"
            style={[
              styles.input,
              {
                fontFamily: fontFamily(language, "regular"),
                textAlign: isRTL ? "right" : "left",
                writingDirection: isRTL ? "rtl" : "ltr",
              },
            ]}
          />
          <View style={styles.composerFoot}>
            <Text variant="caption" color="inkMuted" style={styles.flex}>
              {t("lead.noteCounter", {
                value: formatNumber(draft.length, intlLocale),
                max: formatNumber(NOTE_MAX, intlLocale),
              })}
            </Text>
            <Button label={t("lead.saveNote")} size="sm" fullWidth={false} disabled={!trimmed} onPress={saveNote} />
          </View>
        </Card>
        <Text variant="caption" color="inkMuted" style={styles.appendOnly}>
          {t("lead.appendOnly")}
        </Text>

        {notes.length === 0 ? (
          <Card>
            <EmptyState icon="document-text-outline" title={t("lead.noNotesTitle")} body={t("lead.noNotesBody")} />
          </Card>
        ) : (
          <View style={styles.timeline}>
            {notes.map((note, i) => (
              <View key={note.id} style={styles.timelineItem}>
                <View style={styles.rail}>
                  <View style={[styles.railDot, i === 0 && styles.railDotFirst]} />
                  {i < notes.length - 1 && <View style={styles.railLine} />}
                </View>
                <Card style={styles.noteCard}>
                  <View style={styles.noteHead}>
                    <Text variant="label" weight="semibold" style={styles.flex} numberOfLines={1}>
                      {note.author}
                    </Text>
                    <Text variant="caption" color="inkMuted">
                      {formatDate(note.at, intlLocale, true)}
                    </Text>
                  </View>
                  <Text variant="bodySm">{note.body}</Text>
                </Card>
              </View>
            ))}
          </View>
        )}
      </View>

      <StatusSheet
        visible={sheetOpen}
        current={lead.status}
        onSelect={changeStatus}
        onClose={() => setSheetOpen(false)}
      />
    </Screen>
  );
}

function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Icon name={icon} size={16} color="navy" />
      </View>
      <View style={styles.flex}>
        <Text variant="caption" color="inkMuted">
          {label}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ltrText: { writingDirection: "ltr" },
  flash: { marginBottom: spacing.md },
  customer: { gap: spacing.md },
  customerHead: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  statusCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
  statusBadge: { marginTop: spacing.xs },
  section: { marginTop: spacing.xl },
  group: { overflow: "hidden" },
  compoundLink: { marginTop: spacing.md },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.lg },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm + 2,
    backgroundColor: tints.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  composer: { gap: spacing.sm, padding: spacing.md },
  input: {
    minHeight: 96,
    maxHeight: 200,
    fontSize: 15,
    color: colors.ink,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  composerFoot: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  appendOnly: { marginTop: spacing.sm, marginBottom: spacing.lg },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: spacing.md },
  rail: { width: 14, alignItems: "center" },
  railDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  railDotFirst: { backgroundColor: colors.accent },
  railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: spacing.xs },
  noteCard: { flex: 1, gap: spacing.xs, padding: spacing.md + 2, marginBottom: spacing.md },
  noteHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
