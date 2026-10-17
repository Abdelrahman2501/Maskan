"use client";

import { Lock, Trash2, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat, useLocalized } from "@/components/properties/format";
import { ACCEPT, checkUpload, MAX_IMAGE_MB, MAX_VIDEO_MB } from "@/components/properties/media-utils";
import { FileDropzone, MediaKindBadge, MediaPreview } from "@/components/properties/shared";
import { useCompoundsStore, useMediaStore, useUnitModelsStore } from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { MEDIA_KINDS, type MediaItem, type MediaKind } from "@/mock/properties";

/** Parent filter/select value: "compound:<id>" or "unit_model:<id>". */
type ParentKey = string;
const parentKey = (m: Pick<MediaItem, "parentType" | "parentId">): ParentKey => `${m.parentType}:${m.parentId}`;
const parseParent = (key: ParentKey) => {
  const [parentType, parentId] = key.split(":") as [MediaItem["parentType"], string];
  return { parentType, parentId };
};

type Pending = { file: File; kind: MediaKind };

export default function MediaPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [media, setMedia] = useMediaStore();
  const [compounds] = useCompoundsStore();
  const [models] = useUnitModelsStore();
  const [query, setQuery] = useState("");
  const [parent, setParent] = useState<ParentKey>("");
  const [kind, setKind] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadParent, setUploadParent] = useState<ParentKey>("");
  const [uploadKind, setUploadKind] = useState<MediaKind>("image");
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [parentError, setParentError] = useState<string | undefined>();
  const [removing, setRemoving] = useState<MediaItem | null>(null);

  const parentLabel = (m: Pick<MediaItem, "parentType" | "parentId">) => {
    if (m.parentType === "compound") return loc(compounds.find((c) => c.id === m.parentId)?.name);
    const u = models.find((x) => x.id === m.parentId);
    return u ? `${loc(compounds.find((c) => c.id === u.compoundId)?.name)} · ${loc(u.name)}` : m.parentId;
  };
  const toneFor = (m: MediaItem) => {
    const compoundId = m.parentType === "compound" ? m.parentId : models.find((u) => u.id === m.parentId)?.compoundId;
    return compounds.find((c) => c.id === compoundId)?.coverTone ?? 0;
  };

  const filtered = query.trim() !== "" || parent !== "" || kind !== "";
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return media
      .filter(
        (m) =>
          (!q || m.fileName.toLowerCase().includes(q)) &&
          (!parent || parentKey(m) === parent) &&
          (!kind || m.kind === kind),
      )
      .sort((a, b) => parentKey(a).localeCompare(parentKey(b)) || a.position - b.position);
  }, [media, query, parent, kind]);

  const totalBytes = items.reduce((sum, m) => sum + m.sizeBytes, 0);

  const parentOptions = (
    <>
      <optgroup label={t("media.compoundsGroup")}>
        {compounds.map((c) => (
          <option key={c.id} value={`compound:${c.id}`}>
            {loc(c.name)}
          </option>
        ))}
      </optgroup>
      <optgroup label={t("media.unitModelsGroup")}>
        {models.map((u) => (
          <option key={u.id} value={`unit_model:${u.id}`}>
            {parentLabel({ parentType: "unit_model", parentId: u.id })}
          </option>
        ))}
      </optgroup>
    </>
  );

  const openUpload = () => {
    setUploadParent(parent);
    setUploadKind(kind ? (kind as MediaKind) : "image");
    setPending([]);
    setUploadErrors([]);
    setParentError(undefined);
    setUploadOpen(true);
  };

  const onFiles = (files: File[]) => {
    const errs: string[] = [];
    const ok: Pending[] = [];
    files.forEach((file) => {
      const check = checkUpload(file, uploadKind);
      if (!check.ok) {
        errs.push(t(`media.errors.${check.errorKey}`, { name: file.name, image: MAX_IMAGE_MB, video: MAX_VIDEO_MB }));
        return;
      }
      ok.push({ file, kind: check.kind });
    });
    setUploadErrors(errs);
    setPending((p) => [...p, ...ok]);
  };

  const upload = () => {
    if (!uploadParent) {
      setParentError(t("validation.required"));
      return;
    }
    if (pending.length === 0) {
      setUploadErrors([t("media.noFilesSelected")]);
      return;
    }
    const { parentType, parentId } = parseParent(uploadParent);
    const existing = media.filter((m) => m.parentType === parentType && m.parentId === parentId).length;
    const stamp = Date.now();
    const added: MediaItem[] = pending.map((p, i) => ({
      id: `m-${stamp}-${i}`,
      parentType,
      parentId,
      kind: p.kind,
      fileName: p.file.name,
      sizeBytes: p.file.size,
      position: existing + i + 1,
    }));
    setMedia((all) => [...all, ...added]);
    toast(t("media.uploaded", { count: added.length }));
    setUploadOpen(false);
  };

  return (
    <>
      <PageHeader
        title={t("media.title")}
        description={t("media.description")}
        breadcrumbs={[{ label: t("breadcrumb") }, { label: t("media.title") }]}
        actions={
          canManage && (
            <Button onClick={openUpload}>
              <Upload aria-hidden="true" />
              {t("media.upload")}
            </Button>
          )
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-border bg-info/5 px-4 py-3 text-sm text-ink">
        <Lock className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
        <p>{t("media.privateNote")}</p>
      </div>

      <FilterBar>
        <SearchInput
          className="sm:w-64"
          placeholder={t("media.search")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-72" aria-label={t("media.parent")} value={parent} onChange={(e) => setParent(e.target.value)}>
          <option value="">{t("media.allParents")}</option>
          {parentOptions}
        </Select>
        <Select className="sm:w-44" aria-label={t("media.kind")} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">{t("media.allKinds")}</option>
          {MEDIA_KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`mediaKind.${k}`)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setParent("");
              setKind("");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <p className="text-sm text-ink-muted sm:ms-auto">
          {t("media.summary", { count: items.length })} · <span dir="ltr">{f.bytes(totalBytes)}</span>
        </p>
      </FilterBar>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm font-medium text-ink">{filtered ? tc("table.emptyFiltered") : t("media.empty")}</p>
          {filtered ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setParent("");
                setKind("");
              }}
            >
              {tc("actions.clear")}
            </Button>
          ) : (
            canManage && (
              <Button size="sm" onClick={openUpload}>
                <Upload aria-hidden="true" />
                {t("media.upload")}
              </Button>
            )
          )}
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <li key={m.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="relative">
                  <MediaPreview kind={m.kind} tone={toneFor(m) + m.position} className="rounded-none" />
                  <span className="absolute start-2 top-2 rounded-sm bg-navy/80 px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                    #{m.position}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate text-sm font-medium text-ink" dir="ltr" title={m.fileName}>
                    {m.fileName}
                  </p>
                  <p className="truncate text-xs text-ink-muted" title={parentLabel(m)}>
                    {t(m.parentType === "compound" ? "media.parentCompound" : "media.parentUnitModel")}: {parentLabel(m)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <MediaKindBadge kind={m.kind} />
                    <span dir="ltr" className="text-xs text-ink-muted tabular-nums">
                      {f.bytes(m.sizeBytes)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-1 border-t border-border pt-2 text-xs text-ink-muted">
                    <Lock className="size-3" aria-hidden="true" />
                    <span>{t("media.privateStorage")}</span>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ms-auto size-8 text-error hover:bg-error/10"
                        aria-label={t("media.remove", { name: m.fileName })}
                        onClick={() => setRemoving(m)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={t("media.uploadTitle")}
        description={t("media.uploadHint")}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              {tc("actions.cancel")}
            </Button>
            <Button onClick={upload} disabled={pending.length === 0}>
              <Upload aria-hidden="true" />
              {t("media.uploadCount", { count: pending.length })}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("media.attachTo")} required error={parentError}>
              {(p) => (
                <Select
                  {...p}
                  value={uploadParent}
                  onChange={(e) => {
                    setUploadParent(e.target.value);
                    setParentError(undefined);
                  }}
                >
                  <option value="">{t("shared.selectPlaceholder")}</option>
                  {parentOptions}
                </Select>
              )}
            </FormField>
            <FormField label={t("media.kind")} hint={t("media.kindHint")}>
              {(p) => (
                <Select {...p} value={uploadKind} onChange={(e) => setUploadKind(e.target.value as MediaKind)}>
                  {MEDIA_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {t(`mediaKind.${k}`)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
          <FileDropzone
            title={t("media.dropTitle")}
            hint={t("media.dropHint", { image: MAX_IMAGE_MB, video: MAX_VIDEO_MB })}
            accept={ACCEPT}
            onFiles={onFiles}
            invalid={uploadErrors.length > 0}
          />
          <ul className="flex flex-col gap-1 text-xs text-ink-muted">
            <li>{t("media.rules.images", { image: MAX_IMAGE_MB })}</li>
            <li>{t("media.rules.floorPlans", { image: MAX_IMAGE_MB })}</li>
            <li>{t("media.rules.videos", { video: MAX_VIDEO_MB })}</li>
          </ul>
          {uploadErrors.length > 0 && (
            <ul role="alert" className="flex flex-col gap-1 rounded-md bg-error/5 px-3 py-2 text-sm text-error">
              {uploadErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {pending.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">{t("media.selected", { count: pending.length })}</p>
              <ul className="divide-y divide-border rounded-md border border-border">
                {pending.map((p, i) => (
                  <li key={`${p.file.name}-${i}`} className="flex items-center gap-3 px-3 py-2">
                    <MediaKindBadge kind={p.kind} />
                    <span dir="ltr" className="min-w-0 flex-1 truncate text-sm text-ink" title={p.file.name}>
                      {p.file.name}
                    </span>
                    <span dir="ltr" className="text-xs text-ink-muted tabular-nums">
                      {f.bytes(p.file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={t("media.unselect", { name: p.file.name })}
                      onClick={() => setPending((all) => all.filter((_, j) => j !== i))}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Lock className="size-3" aria-hidden="true" />
            {t("media.privateNote")}
          </p>
        </div>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            setMedia((all) => all.filter((m) => m.id !== removing.id));
            toast(t("media.removed", { name: removing.fileName }));
          }
          setRemoving(null);
        }}
        title={t("media.removeTitle")}
        description={t("media.removeBody", { name: removing?.fileName ?? "" })}
        confirmLabel={tc("actions.delete")}
        destructive
      />
    </>
  );
}
