"use client";

import { Info, Lock } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat } from "@/components/recruitment/use-format";
import { useQuestions, useQuizConfig } from "@/components/training/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { QUIZ_CONFIG_FIELDS, QUIZ_CONFIG_LIMITS, type QuizConfig, type QuizConfigVersion } from "@/mock/training";

type Field = keyof QuizConfig;
type FormValues = Record<Field, string>;

const LABEL_KEY: Record<Field, string> = {
  questionCount: "questionCount",
  passThreshold: "passThreshold",
  maxAttempts: "maxAttempts",
  timeLimitMinutes: "timeLimit",
};

const toForm = (c: QuizConfig): FormValues => ({
  questionCount: String(c.questionCount),
  passThreshold: String(c.passThreshold),
  maxAttempts: String(c.maxAttempts),
  timeLimitMinutes: String(c.timeLimitMinutes),
});

// covers: QUIZ-002, QUIZ-003 (snapshot notice)
export default function QuizConfigPage() {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const canEdit = can("quiz.manage");
  const [{ config, history }, setStore] = useQuizConfig();
  const [questions] = useQuestions();
  const activeCount = questions.filter((q) => q.active).length;
  const [values, setValues] = useState<FormValues>(() => toForm(config));
  const [confirming, setConfirming] = useState(false);

  const currentVersion = history[0]?.version ?? 0;

  const errors = useMemo(() => {
    const out: Partial<Record<Field, string>> = {};
    for (const field of QUIZ_CONFIG_FIELDS) {
      const raw = values[field].trim();
      const n = Number(raw);
      const { min, max } = QUIZ_CONFIG_LIMITS[field];
      if (raw === "" || !Number.isInteger(n)) out[field] = t("validation.integer");
      else if (n < min || n > max) out[field] = t("validation.range", { min, max });
      else if (field === "questionCount" && n > activeCount)
        out[field] = t("validation.questionCountMax", { count: activeCount });
    }
    return out;
  }, [values, activeCount, t]);

  const valid = Object.keys(errors).length === 0;
  const changes = QUIZ_CONFIG_FIELDS.filter((field) => Number(values[field]) !== config[field]).map((field) => ({
    field,
    from: config[field],
    to: Number(values[field]),
  }));
  const dirty = changes.length > 0;

  const fmt = (field: Field, v: number) => (field === "passThreshold" ? f.percent(v) : f.number(v));
  const describe = (c: QuizConfigVersion["changes"][number]) => {
    const field = t(`config.${LABEL_KEY[c.field]}`);
    return c.from === null
      ? t("config.set", { field, to: fmt(c.field, c.to) })
      : t("config.change", { field, from: fmt(c.field, c.from), to: fmt(c.field, c.to) });
  };

  const save = () => {
    const next: QuizConfig = {
      questionCount: Number(values.questionCount),
      passThreshold: Number(values.passThreshold),
      maxAttempts: Number(values.maxAttempts),
      timeLimitMinutes: Number(values.timeLimitMinutes),
    };
    const version = currentVersion + 1;
    setStore((s) => ({
      config: next,
      history: [{ version, changedBy: user.name, changedAt: new Date().toISOString(), changes }, ...s.history],
    }));
    setConfirming(false);
    toast(t("config.saved", { version }));
  };

  const hints: Record<Field, string> = {
    questionCount: t("config.questionCountHint", { count: activeCount }),
    passThreshold: t("config.passThresholdHint"),
    maxAttempts: t("config.maxAttemptsHint"),
    timeLimitMinutes: t("config.timeLimitHint"),
  };

  const historyColumns: Column<QuizConfigVersion>[] = [
    {
      key: "version",
      header: t("config.columns.version"),
      className: "w-24",
      cell: (v) => (
        <Badge tone={v.version === currentVersion ? "brand" : "neutral"} dir="ltr">
          v{v.version}
        </Badge>
      ),
    },
    { key: "by", header: t("config.columns.changedBy"), cell: (v) => <span className="whitespace-nowrap">{v.changedBy}</span> },
    {
      key: "at",
      header: t("config.columns.changedAt"),
      cell: (v) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(v.changedAt)}</span>,
    },
    {
      key: "changes",
      header: t("config.columns.changes"),
      cell: (v) => (
        <ul className="flex flex-col gap-0.5 text-sm">
          {v.changes.map((c) => (
            <li key={c.field}>{describe(c)}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("config.title")}
        description={t("config.description")}
        breadcrumbs={[{ label: t("breadcrumbs.training") }, { label: t("config.title") }]}
        actions={
          <Badge tone="brand" dir="auto">
            {t("config.currentVersion", { version: currentVersion })}
          </Badge>
        }
      />

      <div className="mb-4 flex items-start gap-3 rounded-md border border-info/30 bg-info/10 px-4 py-3 text-sm text-ink">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
        {t("config.notice")}
      </div>
      {!canEdit && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm text-ink-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("config.readOnly")}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("config.settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (canEdit && valid && dirty) setConfirming(true);
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {QUIZ_CONFIG_FIELDS.map((field) => (
                <FormField
                  key={field}
                  label={t(`config.${LABEL_KEY[field]}`)}
                  required
                  hint={hints[field]}
                  error={errors[field]}
                >
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={QUIZ_CONFIG_LIMITS[field].min}
                      max={field === "questionCount" ? activeCount : QUIZ_CONFIG_LIMITS[field].max}
                      disabled={!canEdit}
                      value={values[field]}
                      onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    />
                  )}
                </FormField>
              ))}
            </div>
            {canEdit && (
              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" disabled={!dirty} onClick={() => setValues(toForm(config))}>
                  {t("config.reset")}
                </Button>
                <Button type="submit" disabled={!dirty || !valid}>
                  {tc("actions.saveChanges")}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-ink">{t("config.historyTitle")}</h2>
      <DataTable
        columns={historyColumns}
        rows={history}
        getRowId={(v) => String(v.version)}
        emptyTitle={t("config.historyEmpty")}
      />

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={save}
        title={t("config.confirmTitle")}
        description={t("config.confirmDescription", { version: currentVersion + 1 })}
        confirmLabel={t("config.confirmLabel")}
      >
        <ul className="flex flex-col gap-1 text-sm text-ink">
          {changes.map((c) => (
            <li key={c.field}>{describe(c)}</li>
          ))}
        </ul>
      </ConfirmDialog>
    </>
  );
}
