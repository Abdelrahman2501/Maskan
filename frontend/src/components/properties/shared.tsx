"use client";

import { FileImage, FileText, Film, UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import type { Availability, CompoundStatus, MediaKind } from "@/mock/properties";

const COVER_TONES = [
  "from-navy to-navy-secondary",
  "from-navy-secondary to-accent",
  "from-navy-deep to-success/80",
  "from-accent to-navy",
  "from-navy to-warning/70",
];

export function coverToneClass(tone: number) {
  return COVER_TONES[Math.abs(tone) % COVER_TONES.length];
}

/** Placeholder thumbnail standing in for a cover image. */
export function CoverThumb({ tone, label, className }: { tone: number; label: string; className?: string }) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-md bg-gradient-to-br text-sm font-semibold text-white",
        coverToneClass(tone),
        className,
      )}
    >
      {initials}
    </span>
  );
}

const STATUS_TONE: Record<CompoundStatus, BadgeTone> = {
  launching: "info",
  under_construction: "warning",
  ready: "success",
};

export function CompoundStatusBadge({ status }: { status: CompoundStatus }) {
  const t = useT("properties");
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(`compoundStatus.${status}`)}
    </Badge>
  );
}

const AVAILABILITY_TONE: Record<Availability, BadgeTone> = {
  available: "success",
  limited: "warning",
  sold_out: "neutral",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const t = useT("properties");
  return <Badge tone={AVAILABILITY_TONE[availability]}>{t(`availability.${availability}`)}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useT("properties");
  return <Badge tone={active ? "success" : "neutral"}>{active ? t("shared.active") : t("shared.inactive")}</Badge>;
}

const KIND_ICON = { image: FileImage, floor_plan: FileText, video: Film } as const;
const KIND_TONE: Record<MediaKind, BadgeTone> = { image: "brand", floor_plan: "info", video: "warning" };

export function MediaKindBadge({ kind }: { kind: MediaKind }) {
  const t = useT("properties");
  const Icon = KIND_ICON[kind];
  return (
    <Badge tone={KIND_TONE[kind]}>
      <Icon className="size-3" aria-hidden="true" />
      {t(`mediaKind.${kind}`)}
    </Badge>
  );
}

/** Placeholder media preview tile. */
export function MediaPreview({ kind, tone, className }: { kind: MediaKind; tone: number; className?: string }) {
  const Icon = KIND_ICON[kind];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid aspect-[4/3] w-full place-items-center rounded-md bg-gradient-to-br text-white/85",
        kind === "floor_plan" ? "from-background to-border text-navy/60" : coverToneClass(tone),
        className,
      )}
    >
      <Icon className="size-8" />
    </div>
  );
}

/**
 * Drag-and-drop / click-to-browse file picker. The prototype validates the
 * chosen file locally and never uploads it.
 */
export function FileDropzone({
  title,
  hint,
  accept,
  onFiles,
  invalid,
}: {
  title: string;
  hint: string;
  accept?: string;
  onFiles: (files: File[]) => void;
  invalid?: boolean;
}) {
  const t = useT("properties");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
        dragging ? "border-accent bg-accent/5" : invalid ? "border-error/60 bg-error/5" : "border-border bg-background/60",
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-navy/8 text-navy">
        <UploadCloud className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-1 text-sm font-semibold text-accent hover:underline"
      >
        {t("shared.browse")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Small "EN"/"AR" pill used next to bilingual field labels. */
export function LangTag({ lang }: { lang: "en" | "ar" }) {
  return (
    <span className="ms-1.5 rounded-sm bg-background px-1 py-px text-[10px] font-semibold text-ink-muted uppercase ring-1 ring-border">
      {lang}
    </span>
  );
}
