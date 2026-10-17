"use client";

import { Film, Link2, UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { useFormat } from "@/components/recruitment/use-format";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import type { Course, CourseVideo, PublishStatus, VideoSource } from "@/mock/training";

export type VideoDraft = Pick<CourseVideo, "courseId" | "title" | "durationSec" | "status" | "source">;

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

/** Add / edit video form. Mount with a `key` so it resets per video. */
// covers: TRN-002
export function VideoDialog({
  video,
  courses,
  defaultCourseId,
  onClose,
  onSave,
}: {
  video?: CourseVideo;
  courses: Course[];
  defaultCourseId?: string;
  onClose: () => void;
  onSave: (draft: VideoDraft) => void;
}) {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const fileRef = useRef<HTMLInputElement>(null);
  const radioName = useId();
  const [courseId, setCourseId] = useState(video?.courseId ?? defaultCourseId ?? courses[0]?.id ?? "");
  const [title, setTitle] = useState(video ? { ...video.title } : { en: "", ar: "" });
  const [minutes, setMinutes] = useState(video ? String(Math.floor(video.durationSec / 60)) : "");
  const [seconds, setSeconds] = useState(video ? String(video.durationSec % 60) : "0");
  const [status, setStatus] = useState<PublishStatus>(video?.status ?? "draft");
  const [kind, setKind] = useState<VideoSource["kind"]>(video?.source.kind ?? "upload");
  const [fileName, setFileName] = useState(video?.source.kind === "upload" ? video.source.fileName : "");
  const [url, setUrl] = useState(video?.source.kind === "url" ? video.source.url : "");
  const [dragging, setDragging] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const min = Number(minutes);
  const sec = Number(seconds || "0");
  const durationSec = Number.isFinite(min) && Number.isFinite(sec) ? Math.round(min) * 60 + Math.round(sec) : NaN;

  const errors = {
    course: !courseId ? t("validation.required") : undefined,
    titleEn: !title.en.trim() ? t("validation.required") : undefined,
    titleAr: !title.ar.trim() ? t("validation.required") : undefined,
    minutes:
      minutes.trim() === "" || !Number.isInteger(min) || min < 0
        ? t("validation.integer")
        : !(durationSec > 0)
          ? t("validation.durationPositive")
          : undefined,
    seconds: !Number.isInteger(sec) || sec < 0 || sec > 59 ? t("validation.secondsRange") : undefined,
    file: kind === "upload" && !fileName ? t("validation.fileRequired") : undefined,
    url: kind === "url" && !isHttpUrl(url.trim()) ? t("validation.urlInvalid") : undefined,
  };
  const valid = Object.values(errors).every((e) => !e);
  const show = (e: string | undefined) => (showErrors ? e : undefined);

  const save = () => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    onSave({
      courseId,
      title: { en: title.en.trim(), ar: title.ar.trim() },
      durationSec,
      status,
      source: kind === "upload" ? { kind, fileName } : { kind, url: url.trim() },
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={video ? t("videos.editTitle") : t("videos.addTitle")}
      description={t("videos.dialogDescription")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={save}>{video ? tc("actions.saveChanges") : t("videos.add")}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fields.course")} required error={show(errors.course)} className="sm:col-span-2">
          {(p) => (
            <Select {...p} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {f.loc(c.title)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("fields.titleEn")} required error={show(errors.titleEn)}>
          {(p) => <Input {...p} dir="ltr" value={title.en} onChange={(e) => setTitle({ ...title, en: e.target.value })} />}
        </FormField>
        <FormField label={t("fields.titleAr")} required error={show(errors.titleAr)}>
          {(p) => (
            <Input {...p} dir="rtl" lang="ar" value={title.ar} onChange={(e) => setTitle({ ...title, ar: e.target.value })} />
          )}
        </FormField>
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">{t("fields.duration")}</legend>
          <FormField label={t("fields.durationMinutes")} required error={show(errors.minutes)}>
            {(p) => (
              <Input {...p} type="number" inputMode="numeric" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            )}
          </FormField>
          <FormField label={t("fields.durationSeconds")} error={show(errors.seconds)}>
            {(p) => (
              <Input
                {...p}
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
            )}
          </FormField>
        </fieldset>
        <FormField label={t("fields.status")} hint={t("courses.statusHint")}>
          {(p) => (
            <Select {...p} value={status} onChange={(e) => setStatus(e.target.value as PublishStatus)}>
              <option value="draft">{t("status.draft")}</option>
              <option value="published">{t("status.published")}</option>
            </Select>
          )}
        </FormField>

        <fieldset className="flex flex-col gap-3 sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-ink">{t("fields.source")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["upload", "url"] as const).map((k) => {
              const Icon = k === "upload" ? UploadCloud : Link2;
              return (
                <label
                  key={k}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors",
                    kind === k ? "border-navy bg-navy/5 text-navy" : "border-border text-ink hover:bg-background",
                  )}
                >
                  <input
                    type="radio"
                    name={radioName}
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                    className="accent-navy"
                  />
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`videos.source.${k}`)}
                </label>
              );
            })}
          </div>

          {kind === "upload" ? (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setFileName(file.name);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
                  dragging ? "border-accent bg-accent/5" : showErrors && errors.file ? "border-error" : "border-border",
                )}
              >
                <span className="grid size-10 place-items-center rounded-full bg-navy/8 text-navy">
                  <Film className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-ink">{t("videos.source.dropTitle")}</p>
                <p className="max-w-sm text-xs text-ink-muted">{t("videos.source.dropHint")}</p>
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  {t("videos.source.choose")}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/quicktime"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
                {fileName && (
                  <p className="text-xs text-ink" dir="auto">
                    {t("videos.source.selected", { name: fileName })}
                  </p>
                )}
              </div>
              {showErrors && errors.file && <p className="mt-1.5 text-xs text-error">{errors.file}</p>}
            </div>
          ) : (
            <FormField label={t("videos.source.urlLabel")} required hint={t("videos.source.urlHint")} error={show(errors.url)}>
              {(p) => (
                <Input
                  {...p}
                  type="url"
                  dir="ltr"
                  placeholder="https://"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              )}
            </FormField>
          )}
        </fieldset>
      </div>
    </Dialog>
  );
}
