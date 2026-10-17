"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Switch, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import type { Localized } from "@/mock/recruitment";
import type { QuizQuestion } from "@/mock/training";

export type QuestionDraft = Omit<QuizQuestion, "id">;

const OPTION_COUNT = 4;
const blankOptions = (): Localized[] => Array.from({ length: OPTION_COUNT }, () => ({ en: "", ar: "" }));

/** Create / edit a single-correct multiple-choice question (QUIZ-001). Mount with a `key`. */
// covers: QUIZ-001
export function QuestionDialog({
  question,
  onClose,
  onSave,
}: {
  question?: QuizQuestion;
  onClose: () => void;
  onSave: (draft: QuestionDraft) => void;
}) {
  const t = useT("training");
  const tc = useT();
  const radioName = useId();
  const [text, setText] = useState<Localized>(question ? { ...question.text } : { en: "", ar: "" });
  const [options, setOptions] = useState<Localized[]>(() =>
    question ? question.options.map((o) => ({ ...o })) : blankOptions(),
  );
  const [correctIndex, setCorrectIndex] = useState<number | null>(question?.correctIndex ?? null);
  const [active, setActive] = useState(question?.active ?? true);
  const [showErrors, setShowErrors] = useState(false);

  const optionsFilled = options.every((o) => o.en.trim() && o.ar.trim());
  const valid = !!text.en.trim() && !!text.ar.trim() && optionsFilled && correctIndex !== null;
  const req = (v: string) => (showErrors && !v.trim() ? t("validation.required") : undefined);

  const setOption = (i: number, lang: keyof Localized, value: string) =>
    setOptions((all) => all.map((o, n) => (n === i ? { ...o, [lang]: value } : o)));

  const save = () => {
    if (!valid || correctIndex === null) {
      setShowErrors(true);
      return;
    }
    onSave({
      text: { en: text.en.trim(), ar: text.ar.trim() },
      options: options.map((o) => ({ en: o.en.trim(), ar: o.ar.trim() })),
      correctIndex,
      active,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={question ? t("questions.editTitle") : t("questions.createTitle")}
      description={t("questions.dialogDescription")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={save}>{question ? tc("actions.saveChanges") : t("questions.create")}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("fields.questionEn")} required error={req(text.en)}>
            {(p) => <Textarea {...p} dir="ltr" className="min-h-20" value={text.en} onChange={(e) => setText({ ...text, en: e.target.value })} />}
          </FormField>
          <FormField label={t("fields.questionAr")} required error={req(text.ar)}>
            {(p) => (
              <Textarea
                {...p}
                dir="rtl"
                lang="ar"
                className="min-h-20"
                value={text.ar}
                onChange={(e) => setText({ ...text, ar: e.target.value })}
              />
            )}
          </FormField>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-ink">{t("questions.options")}</legend>
          {options.map((o, i) => {
            const n = i + 1;
            const isCorrect = correctIndex === i;
            return (
              <div
                key={i}
                className={cn(
                  "grid gap-3 rounded-md border p-3 sm:grid-cols-[auto_1fr_1fr] sm:items-start",
                  isCorrect ? "border-success bg-success/5" : "border-border",
                )}
              >
                <label className="flex cursor-pointer items-center gap-2 pt-0 text-sm font-medium text-ink sm:pt-8">
                  <input
                    type="radio"
                    name={radioName}
                    checked={isCorrect}
                    onChange={() => setCorrectIndex(i)}
                    aria-label={t("questions.markCorrect", { n })}
                    className="size-4 accent-success"
                  />
                  <span className={cn("sm:hidden", isCorrect ? "text-success" : "text-ink-muted")}>
                    {t("questions.correctOption")}
                  </span>
                </label>
                <FormField label={t("fields.optionEn", { n })} required error={req(o.en)}>
                  {(p) => <Input {...p} dir="ltr" value={o.en} onChange={(e) => setOption(i, "en", e.target.value)} />}
                </FormField>
                <FormField label={t("fields.optionAr", { n })} required error={req(o.ar)}>
                  {(p) => <Input {...p} dir="rtl" lang="ar" value={o.ar} onChange={(e) => setOption(i, "ar", e.target.value)} />}
                </FormField>
              </div>
            );
          })}
          {showErrors && correctIndex === null && (
            <p role="alert" className="text-xs text-error">
              {t("validation.correctRequired")}
            </p>
          )}
          {showErrors && !optionsFilled && (
            <p role="alert" className="text-xs text-error">
              {t("validation.optionsRequired")}
            </p>
          )}
        </fieldset>

        <div className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">{t("fields.active")}</p>
            <p className="text-xs text-ink-muted">{t("questions.activeHint")}</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} label={t("fields.active")} />
        </div>
      </div>
    </Dialog>
  );
}
