"use client";

import { ArrowDown, ArrowUp, Building2, ExternalLink, History, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import {
  CompoundFields,
  draftFromCompound,
  validateCompound,
  type CompoundDraft,
  type CompoundErrors,
} from "@/components/properties/compound-form";
import { useFormat, useLocalized } from "@/components/properties/format";
import { ACCEPT, checkUpload, MAX_IMAGE_MB, MAX_VIDEO_MB } from "@/components/properties/media-utils";
import { PriceSummary } from "@/components/properties/price-summary";
import {
  AvailabilityBadge,
  CompoundStatusBadge,
  CoverThumb,
  FileDropzone,
  MediaKindBadge,
  MediaPreview,
} from "@/components/properties/shared";
import {
  useCompoundsStore,
  useLocationsStore,
  useMediaStore,
  usePricesStore,
  usePropertyTypesStore,
  useUnitModelsStore,
} from "@/components/properties/store";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { COMPOUND_ACTIVITY, type MediaItem, type UnitModel } from "@/mock/properties";

type Tab = "overview" | "models" | "media" | "activity";

export function CompoundDetail({ id }: { id: string }) {
  const t = useT("properties");
  const [compounds] = useCompoundsStore();
  const compound = compounds.find((c) => c.id === id);

  if (!compound) {
    return (
      <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-navy/8 text-navy">
          <Building2 className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold text-ink">{t("compoundDetail.notFound")}</h1>
        <p className="text-sm text-ink-muted">{t("compoundDetail.notFoundBody")}</p>
        <Link href="/admin/compounds" className={buttonVariants({ variant: "secondary" })}>
          {t("compoundDetail.backToList")}
        </Link>
      </div>
    );
  }
  // Remount the editor when switching compounds so the draft resets.
  return <CompoundEditor key={compound.id} id={compound.id} />;
}

function CompoundEditor({ id }: { id: string }) {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [compounds, setCompounds] = useCompoundsStore();
  const [locations] = useLocationsStore();
  const [unitModels] = useUnitModelsStore();
  const [types] = usePropertyTypesStore();
  const [prices] = usePricesStore();
  const [media, setMedia] = useMediaStore();
  const compound = compounds.find((c) => c.id === id)!;
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<CompoundDraft>(() => draftFromCompound(compound));
  const [errors, setErrors] = useState<CompoundErrors>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<MediaItem | null>(null);

  const models = unitModels.filter((u) => u.compoundId === id);
  const compoundMedia = useMemo(
    () => media.filter((m) => m.parentType === "compound" && m.parentId === id).sort((a, b) => a.position - b.position),
    [media, id],
  );
  const activity = COMPOUND_ACTIVITY[id] ?? [];
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFromCompound(compound));

  const save = () => {
    const e = validateCompound(draft, t);
    setErrors(e);
    if (Object.keys(e).length) {
      toast(t("validation.fixErrors"), "error");
      return;
    }
    setCompounds((all) =>
      all.map((c) =>
        c.id === id
          ? {
              ...c,
              name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() },
              locationId: draft.locationId,
              developer: { en: draft.developerEn.trim(), ar: draft.developerAr.trim() },
              address: { en: draft.addressEn.trim(), ar: draft.addressAr.trim() },
              description: { en: draft.descriptionEn.trim(), ar: draft.descriptionAr.trim() },
              amenities: draft.amenities,
              status: draft.status,
              deliveryYear: Number(draft.deliveryYear),
            }
          : c,
      ),
    );
    toast(tc("states.saved"));
  };

  const move = (item: MediaItem, delta: -1 | 1) => {
    const ordered = [...compoundMedia];
    const i = ordered.findIndex((m) => m.id === item.id);
    const j = i + delta;
    if (j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    const positions = new Map(ordered.map((m, idx) => [m.id, idx + 1]));
    setMedia((all) => all.map((m) => (positions.has(m.id) ? { ...m, position: positions.get(m.id)! } : m)));
  };

  const onFiles = (files: File[]) => {
    const added: MediaItem[] = [];
    let error: string | null = null;
    files.forEach((file, idx) => {
      const check = checkUpload(file);
      if (!check.ok) {
        error = t(`media.errors.${check.errorKey}`, { name: file.name, image: MAX_IMAGE_MB, video: MAX_VIDEO_MB });
        return;
      }
      added.push({
        id: `m-${Date.now()}-${idx}`,
        parentType: "compound",
        parentId: id,
        kind: check.kind,
        fileName: file.name,
        sizeBytes: file.size,
        position: compoundMedia.length + added.length + 1,
      });
    });
    setUploadError(error);
    if (added.length) {
      setMedia((all) => [...all, ...added]);
      toast(t("media.uploaded", { count: added.length }));
    }
  };

  const modelColumns: Column<UnitModel>[] = [
    { key: "name", header: t("shared.name"), cell: (u) => <span className="font-medium">{loc(u.name)}</span> },
    { key: "type", header: t("shared.propertyType"), cell: (u) => loc(types.find((p) => p.id === u.propertyTypeId)?.name) },
    {
      key: "area",
      header: t("unitModels.area"),
      cell: (u) => (
        <span dir="ltr" className="tabular-nums">
          {f.number(u.areaSqm)} m²
        </span>
      ),
    },
    { key: "avail", header: t("unitModels.availability"), cell: (u) => <AvailabilityBadge availability={u.availability} /> },
    { key: "price", header: t("unitModels.priceSummary"), cell: (u) => <PriceSummary prices={prices.filter((p) => p.unitModelId === u.id)} /> },
  ];

  return (
    <>
      <PageHeader
        title={loc(compound.name)}
        description={`${loc(locations.find((l) => l.id === compound.locationId)?.name)} · ${loc(compound.developer)}`}
        breadcrumbs={[
          { label: t("breadcrumb") },
          { label: t("compounds.title"), href: "/admin/compounds" },
          { label: loc(compound.name) },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <CompoundStatusBadge status={compound.status} />
            <Badge tone={compound.published ? "success" : "neutral"}>
              {compound.published ? t("compounds.published") : t("compounds.draft")}
            </Badge>
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
        <CoverThumb tone={compound.coverTone} label={compound.name.en} className="size-16 text-lg" />
        <div className="grid flex-1 grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-muted">{t("compounds.unitModelsCount")}</p>
            <p className="font-semibold text-ink tabular-nums">{models.length}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">{t("compoundDetail.mediaCount")}</p>
            <p className="font-semibold text-ink tabular-nums">{compoundMedia.length}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">{t("compounds.deliveryYear")}</p>
            <p className="font-semibold text-ink tabular-nums">{compound.deliveryYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={compound.published}
              disabled={!canManage}
              label={t("compounds.publishLabel", { name: loc(compound.name) })}
              onCheckedChange={(published) => {
                setCompounds((all) => all.map((c) => (c.id === id ? { ...c, published } : c)));
                toast(
                  published
                    ? t("compounds.publishedToast", { name: loc(compound.name) })
                    : t("compounds.unpublishedToast", { name: loc(compound.name) }),
                );
              }}
            />
            <span className="text-sm text-ink">{t("compounds.published")}</span>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-6"
        items={[
          { value: "overview", label: t("compoundDetail.tabs.overview") },
          { value: "models", label: t("compoundDetail.tabs.models"), count: models.length },
          { value: "media", label: t("compoundDetail.tabs.media"), count: compoundMedia.length },
          { value: "activity", label: t("compoundDetail.tabs.activity") },
        ]}
      />

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("compoundDetail.overviewTitle")}</CardTitle>
            <CardDescription>{t("compoundDetail.overviewHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CompoundFields draft={draft} onChange={setDraft} errors={errors} disabled={!canManage} />
            {canManage && (
              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(draftFromCompound(compound))}>
                  {tc("actions.cancel")}
                </Button>
                <Button disabled={!dirty} onClick={save}>
                  {tc("actions.saveChanges")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "models" && (
        <>
          <div className="mb-4 flex justify-end">
            <Link href="/admin/unit-models" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              <ExternalLink className="rtl:-scale-x-100" aria-hidden="true" />
              {t("compoundDetail.manageModels")}
            </Link>
          </div>
          <DataTable columns={modelColumns} rows={models} getRowId={(u) => u.id} emptyTitle={t("compoundDetail.noModels")} />
        </>
      )}

      {tab === "media" && (
        <div className="flex flex-col gap-6">
          {canManage && (
            <div>
              <FileDropzone
                title={t("media.dropTitle")}
                hint={t("media.dropHint", { image: MAX_IMAGE_MB, video: MAX_VIDEO_MB })}
                accept={ACCEPT}
                onFiles={onFiles}
                invalid={uploadError !== null}
              />
              {uploadError && (
                <p role="alert" className="mt-2 text-sm text-error">
                  {uploadError}
                </p>
              )}
            </div>
          )}
          {compoundMedia.length === 0 ? (
            <Card className="p-10 text-center text-sm text-ink-muted">{t("media.empty")}</Card>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {compoundMedia.map((m, i) => (
                <li key={m.id}>
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <MediaPreview kind={m.kind} tone={compound.coverTone + i} className="rounded-none" />
                      <span className="absolute start-2 top-2 rounded-sm bg-navy/80 px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                        {i + 1}
                      </span>
                      {i === 0 && m.kind === "image" && (
                        <span className="absolute end-2 top-2 rounded-sm bg-surface px-1.5 py-0.5 text-xs font-medium text-navy">
                          {t("media.cover")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-3">
                      <p className="truncate text-sm font-medium text-ink" dir="ltr" title={m.fileName}>
                        {m.fileName}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <MediaKindBadge kind={m.kind} />
                        <span className="text-xs text-ink-muted tabular-nums">{f.bytes(m.sizeBytes)}</span>
                      </div>
                      {m.kind === "video" && (
                        <p className="flex items-center gap-1 text-xs text-ink-muted">
                          <Lock className="size-3" aria-hidden="true" />
                          {t("media.privateStorage")}
                        </p>
                      )}
                      {canManage && (
                        <div className="flex items-center gap-1 border-t border-border pt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={t("media.moveUp", { name: m.fileName })}
                            disabled={i === 0}
                            onClick={() => move(m, -1)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={t("media.moveDown", { name: m.fileName })}
                            disabled={i === compoundMedia.length - 1}
                            onClick={() => move(m, 1)}
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ms-auto size-8 text-error hover:bg-error/10"
                            aria-label={t("media.remove", { name: m.fileName })}
                            onClick={() => setRemoving(m)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {tab === "activity" && (
        <Card>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">{t("compoundDetail.noActivity")}</p>
            ) : (
              <ol className="relative flex flex-col gap-5 border-s border-border ps-6">
                {activity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -start-[31px] top-0.5 grid size-4 place-items-center rounded-full bg-surface ring-2 ring-border">
                      <History className="size-2.5 text-navy" aria-hidden="true" />
                    </span>
                    <p className="text-sm text-ink">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <code className="rounded-sm bg-background px-1 text-xs text-navy" dir="ltr">
                        {a.action}
                      </code>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      <bdi dir="ltr">{a.detail}</bdi>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">{f.dateTime(a.at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

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
