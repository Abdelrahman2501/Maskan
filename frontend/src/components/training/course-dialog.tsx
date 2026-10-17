"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/use-t";
import type { Course, PublishStatus } from "@/mock/training";

export type CourseDraft = Pick<Course, "title" | "description" | "status">;

const EMPTY: CourseDraft = { title: { en: "", ar: "" }, description: { en: "", ar: "" }, status: "draft" };

/** Create / edit course form. Mount with a `key` so it resets per course. */
export function CourseDialog({
  course,
  onClose,
  onSave,
}: {
  course?: Course;
  onClose: () => void;
  onSave: (draft: CourseDraft) => void;
}) {
  const t = useT("training");
  const tc = useT();
  const [draft, setDraft] = useState<CourseDraft>(() =>
    course ? { title: { ...course.title }, description: { ...course.description }, status: course.status } : EMPTY,
  );
  const [showErrors, setShowErrors] = useState(false);

  const err = (v: string) => (showErrors && !v.trim() ? t("validation.required") : undefined);

  const save = () => {
    if (!draft.title.en.trim() || !draft.title.ar.trim()) {
      setShowErrors(true);
      return;
    }
    onSave({
      ...draft,
      title: { en: draft.title.en.trim(), ar: draft.title.ar.trim() },
      description: { en: draft.description.en.trim(), ar: draft.description.ar.trim() },
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={course ? t("courses.editTitle") : t("courses.createTitle")}
      description={t("courses.dialogDescription")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={save}>{course ? tc("actions.saveChanges") : t("courses.create")}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fields.titleEn")} required error={err(draft.title.en)}>
          {(p) => (
            <Input {...p} dir="ltr" value={draft.title.en} onChange={(e) => setDraft({ ...draft, title: { ...draft.title, en: e.target.value } })} />
          )}
        </FormField>
        <FormField label={t("fields.titleAr")} required error={err(draft.title.ar)}>
          {(p) => (
            <Input {...p} dir="rtl" lang="ar" value={draft.title.ar} onChange={(e) => setDraft({ ...draft, title: { ...draft.title, ar: e.target.value } })} />
          )}
        </FormField>
        <FormField label={t("fields.descriptionEn")}>
          {(p) => (
            <Textarea
              {...p}
              dir="ltr"
              value={draft.description.en}
              onChange={(e) => setDraft({ ...draft, description: { ...draft.description, en: e.target.value } })}
            />
          )}
        </FormField>
        <FormField label={t("fields.descriptionAr")}>
          {(p) => (
            <Textarea
              {...p}
              dir="rtl"
              lang="ar"
              value={draft.description.ar}
              onChange={(e) => setDraft({ ...draft, description: { ...draft.description, ar: e.target.value } })}
            />
          )}
        </FormField>
        <FormField label={t("fields.status")} hint={t("courses.statusHint")}>
          {(p) => (
            <Select {...p} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PublishStatus })}>
              <option value="draft">{t("status.draft")}</option>
              <option value="published">{t("status.published")}</option>
            </Select>
          )}
        </FormField>
      </div>
    </Dialog>
  );
}
