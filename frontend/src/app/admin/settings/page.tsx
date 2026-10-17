"use client";

import { ArrowRight, Clock, FileUp, Fingerprint, History, Lock, MessageSquareText, ShieldCheck, Video, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat } from "@/components/recruitment/use-format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { DEFAULT_SETTINGS, SETTINGS_META, type SettingsValues } from "@/mock/administration";

type NumericKey = { [K in keyof SettingsValues]: SettingsValues[K] extends number ? K : never }[keyof SettingsValues];
type Field = { key: keyof SettingsValues; unit?: string; min?: number; max?: number };
type Group = { key: string; icon: LucideIcon; fields: Field[] };

/** Bounds mirror the backend validation for each setting (prototype values). */
const GROUPS: Group[] = [
  {
    key: "otp",
    icon: MessageSquareText,
    fields: [
      { key: "otpExpiryMinutes", unit: "minutes", min: 1, max: 30 },
      { key: "otpResendCooldownSeconds", unit: "seconds", min: 15, max: 600 },
      { key: "otpMaxSendsPerHour", unit: "count", min: 1, max: 20 },
      { key: "otpMaxWrongAttempts", unit: "count", min: 1, max: 10 },
    ],
  },
  {
    key: "uploads",
    icon: FileUp,
    fields: [
      { key: "uploadMaxImageMb", unit: "mb", min: 1, max: 25 },
      { key: "uploadMaxVideoMb", unit: "mb", min: 10, max: 1024 },
      { key: "uploadAllowedTypes" },
    ],
  },
  { key: "interview", icon: Video, fields: [{ key: "interviewMaxDurationSeconds", unit: "seconds", min: 30, max: 600 }] },
  {
    key: "identity",
    icon: Fingerprint,
    fields: [
      { key: "identityOcrThresholdPct", unit: "percent", min: 50, max: 100 },
      { key: "identityResubmissionLimit", unit: "count", min: 1, max: 10 },
    ],
  },
  {
    key: "retention",
    icon: History,
    fields: [
      { key: "retentionIdImagesDays", unit: "days", min: 30, max: 1825 },
      { key: "retentionInterviewVideosDays", unit: "days", min: 30, max: 1825 },
    ],
  },
];

const FIELDS = GROUPS.flatMap((g) => g.fields);
const MIME = /^[a-z]+\/[a-z0-9.+-]+$/;

type Draft = Record<keyof SettingsValues, string>;
const toDraft = (v: SettingsValues): Draft =>
  Object.fromEntries(Object.entries(v).map(([k, val]) => [k, String(val)])) as Draft;

export default function SettingsPage() {
  const t = useT("administration");
  const ts = useT("shell");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const editable = can("settings.manage");

  const [saved, setSaved] = useState<SettingsValues>(DEFAULT_SETTINGS);
  const [meta, setMeta] = useState(SETTINGS_META);
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_SETTINGS));
  const [touched, setTouched] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const errors = useMemo(() => {
    const out: Partial<Record<keyof SettingsValues, string>> = {};
    for (const field of FIELDS) {
      const raw = draft[field.key].trim();
      if (field.key === "uploadAllowedTypes") {
        const types = raw.split(",").map((s) => s.trim()).filter(Boolean);
        if (types.length === 0) out[field.key] = t("settings.errors.typesRequired");
        else if (types.some((x) => !MIME.test(x))) out[field.key] = t("settings.errors.typesFormat");
        continue;
      }
      const n = Number(raw);
      if (raw === "" || !Number.isInteger(n) || n < (field.min ?? 0) || n > (field.max ?? Infinity)) {
        out[field.key] = t("settings.errors.range", { min: f.number(field.min ?? 0), max: f.number(field.max ?? 0) });
      }
    }
    if (!out.otpResendCooldownSeconds && !out.otpExpiryMinutes && Number(draft.otpResendCooldownSeconds) >= Number(draft.otpExpiryMinutes) * 60) {
      out.otpResendCooldownSeconds = t("settings.errors.cooldownVsExpiry");
    }
    return out;
  }, [draft, t, f]);

  const parsed = (): SettingsValues => {
    const next = { ...saved };
    for (const field of FIELDS) {
      if (field.key === "uploadAllowedTypes") {
        next.uploadAllowedTypes = draft.uploadAllowedTypes.split(",").map((s) => s.trim()).filter(Boolean).join(", ");
      } else {
        next[field.key as NumericKey] = Number(draft[field.key]);
      }
    }
    return next;
  };

  const changed = FIELDS.filter((field) => draft[field.key].trim() !== String(saved[field.key]));
  const hasErrors = Object.keys(errors).length > 0;

  const unitLabel = (field: Field) => (field.unit ? t(`settings.units.${field.unit}`) : undefined);
  const display = (field: Field, v: string | number) => (field.unit ? `${v} ${unitLabel(field)}` : String(v));

  const onSave = () => {
    setTouched(true);
    if (hasErrors) {
      toast(t("settings.fixErrors"), "error");
      return;
    }
    setConfirming(true);
  };

  const confirmSave = () => {
    const next = parsed();
    setSaved(next);
    setDraft(toDraft(next));
    setMeta({ updatedBy: user.name, updatedAt: new Date().toISOString() });
    setConfirming(false);
    setTouched(false);
    toast(t("settings.saved", { count: changed.length }));
  };

  return (
    <>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
        breadcrumbs={[{ label: ts("groups.administration") }, { label: t("settings.title") }]}
      />

      {!editable && (
        <p className="mb-4 flex items-start gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm text-ink">
          <Lock className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          {t("settings.readOnly")}
        </p>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <fieldset disabled={!editable} className="flex flex-col gap-4">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.key} className="p-5 sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy/8 text-navy">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-ink">{t(`settings.groups.${group.key}.title`)}</h2>
                    <p className="text-sm text-ink-muted">{t(`settings.groups.${group.key}.description`)}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => {
                    const error = touched || draft[field.key].trim() !== String(saved[field.key]) ? errors[field.key] : undefined;
                    const isText = field.key === "uploadAllowedTypes";
                    return (
                      <FormField
                        key={field.key}
                        label={t(`settings.fields.${field.key}.label`)}
                        hint={
                          isText
                            ? t(`settings.fields.${field.key}.hint`)
                            : `${t(`settings.fields.${field.key}.hint`)} ${t("settings.allowedRange", {
                                min: f.number(field.min ?? 0),
                                max: f.number(field.max ?? 0),
                                unit: unitLabel(field) ?? "",
                              })}`
                        }
                        error={error}
                        required
                        className={isText ? "sm:col-span-2" : undefined}
                      >
                        {(props) => (
                          <div className="flex items-center gap-2">
                            <Input
                              {...props}
                              dir={isText ? "ltr" : undefined}
                              type={isText ? "text" : "number"}
                              inputMode={isText ? undefined : "numeric"}
                              min={field.min}
                              max={field.max}
                              value={draft[field.key]}
                              onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                              className={isText ? "font-mono text-xs" : "sm:max-w-40"}
                            />
                            {field.unit && <span className="shrink-0 text-sm text-ink-muted">{unitLabel(field)}</span>}
                          </div>
                        )}
                      </FormField>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </fieldset>

        <div className="sticky bottom-0 mt-4 flex flex-col gap-3 border-t border-border bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {t("common.auditedNote")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("settings.lastUpdated", { name: meta.updatedBy, date: f.dateTime(meta.updatedAt) })}
            </span>
          </div>
          {editable && (
            <div className="flex items-center gap-2">
              {changed.length > 0 && <span className="text-sm text-ink-muted">{t("settings.unsaved", { count: changed.length })}</span>}
              <Button
                variant="secondary"
                disabled={changed.length === 0}
                onClick={() => {
                  setDraft(toDraft(saved));
                  setTouched(false);
                }}
              >
                {t("common.discard")}
              </Button>
              <Button type="submit" disabled={changed.length === 0}>
                {tc("actions.saveChanges")}
              </Button>
            </div>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirmSave}
        title={t("settings.confirmTitle")}
        description={t("settings.confirmBody", { count: changed.length })}
        confirmLabel={tc("actions.saveChanges")}
      >
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border text-sm">
          {changed.map((field) => (
            <li key={field.key} className="flex flex-col gap-0.5 px-3 py-2">
              <span className="font-medium text-ink">{t(`settings.fields.${field.key}.label`)}</span>
              <span className="text-ink-muted">
                <span className="line-through">{display(field, saved[field.key])}</span>
                <ArrowRight className="mx-1.5 inline size-3.5 rtl:rotate-180" aria-hidden="true" />
                <span className="sr-only">{t("settings.changedTo")}</span>
                <span className="font-medium text-ink">{display(field, draft[field.key].trim())}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">{t("common.auditedNote")}</p>
      </ConfirmDialog>
    </>
  );
}
