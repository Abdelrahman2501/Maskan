"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import {
  CompoundFields,
  emptyCompoundDraft,
  validateCompound,
  type CompoundDraft,
  type CompoundErrors,
} from "@/components/properties/compound-form";
import { useLocalized } from "@/components/properties/format";
import { CompoundStatusBadge, CoverThumb } from "@/components/properties/shared";
import { slugify, useCompoundsStore, useLocationsStore, useUnitModelsStore } from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Select, Switch } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { COMPOUND_STATUSES, type Compound } from "@/mock/properties";

export default function CompoundsPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const toast = useToast();
  const router = useRouter();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [compounds, setCompounds] = useCompoundsStore();
  const [locations] = useLocationsStore();
  const [unitModels] = useUnitModelsStore();
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState<CompoundDraft | null>(null);
  const [errors, setErrors] = useState<CompoundErrors>({});
  const [unpublishing, setUnpublishing] = useState<Compound | null>(null);

  const locationName = (id: string) => loc(locations.find((l) => l.id === id)?.name);
  const modelCount = (id: string) => unitModels.filter((u) => u.compoundId === id).length;

  const filtered = query.trim() !== "" || locationId !== "" || status !== "";
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return compounds.filter(
      (c) =>
        (!q ||
          c.name.en.toLowerCase().includes(q) ||
          c.name.ar.includes(q) ||
          c.developer.en.toLowerCase().includes(q) ||
          c.developer.ar.includes(q)) &&
        (!locationId || c.locationId === locationId) &&
        (!status || c.status === status),
    );
  }, [compounds, query, locationId, status]);

  const setPublished = (c: Compound, published: boolean) => {
    setCompounds((all) => all.map((x) => (x.id === c.id ? { ...x, published } : x)));
    toast(published ? t("compounds.publishedToast", { name: loc(c.name) }) : t("compounds.unpublishedToast", { name: loc(c.name) }));
  };

  const create = () => {
    if (!draft) return;
    const e = validateCompound(draft, t);
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = slugify(draft.nameEn);
    const compound: Compound = {
      id: compounds.some((c) => c.id === id) ? `${id}-${compounds.length + 1}` : id,
      locationId: draft.locationId,
      name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() },
      developer: { en: draft.developerEn.trim(), ar: draft.developerAr.trim() || draft.developerEn.trim() },
      address: { en: "", ar: "" },
      description: { en: "", ar: "" },
      amenities: [],
      status: draft.status,
      deliveryYear: Number(draft.deliveryYear),
      published: false,
      coverTone: compounds.length,
    };
    setCompounds((all) => [compound, ...all]);
    setDraft(null);
    toast(t("compounds.created", { name: loc(compound.name) }));
  };

  const columns: Column<Compound>[] = [
    {
      key: "name",
      header: t("shared.name"),
      sortValue: (c) => loc(c.name),
      cell: (c) => (
        <div className="flex items-center gap-3">
          <CoverThumb tone={c.coverTone} label={c.name.en} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{loc(c.name)}</p>
            <p className="truncate text-xs text-ink-muted">{t("compounds.deliveryShort", { year: c.deliveryYear })}</p>
          </div>
        </div>
      ),
    },
    { key: "location", header: t("shared.location"), sortValue: (c) => locationName(c.locationId), cell: (c) => locationName(c.locationId) },
    { key: "developer", header: t("compounds.developer"), hideOnMobile: true, cell: (c) => loc(c.developer) },
    {
      key: "models",
      header: t("compounds.unitModelsCount"),
      hideOnMobile: true,
      sortValue: (c) => modelCount(c.id),
      cell: (c) => <span className="tabular-nums">{modelCount(c.id)}</span>,
    },
    { key: "status", header: t("shared.status"), sortValue: (c) => c.status, cell: (c) => <CompoundStatusBadge status={c.status} /> },
    {
      key: "published",
      header: t("compounds.published"),
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={c.published}
            disabled={!canManage}
            label={t("compounds.publishLabel", { name: loc(c.name) })}
            onCheckedChange={(v) => (v ? setPublished(c, true) : setUnpublishing(c))}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("compounds.title")}
        description={t("compounds.description")}
        breadcrumbs={[{ label: t("breadcrumb") }, { label: t("compounds.title") }]}
        actions={
          canManage && (
            <Button
              onClick={() => {
                setErrors({});
                setDraft(emptyCompoundDraft(locationId));
              }}
            >
              <Plus aria-hidden="true" />
              {t("compounds.create")}
            </Button>
          )
        }
      />
      <FilterBar>
        <SearchInput
          className="sm:w-72"
          placeholder={t("compounds.search")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-56" aria-label={t("shared.location")} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">{t("shared.allLocations")}</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {loc(l.name)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-52" aria-label={t("shared.status")} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t("shared.allStatuses")}</option>
          {COMPOUND_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`compoundStatus.${s}`)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setLocationId("");
              setStatus("");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(c) => c.id}
        onRowClick={(c) => router.push(`/admin/compounds/${c.id}`)}
        filtered={filtered}
        emptyTitle={t("compounds.empty")}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={t("compounds.create")}
        description={t("compounds.createHint")}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {tc("actions.cancel")}
            </Button>
            <Button onClick={create}>{tc("actions.create")}</Button>
          </>
        }
      >
        {draft && <CompoundFields draft={draft} onChange={setDraft} errors={errors} compact />}
      </Dialog>

      <ConfirmDialog
        open={unpublishing !== null}
        onClose={() => setUnpublishing(null)}
        onConfirm={() => {
          if (unpublishing) setPublished(unpublishing, false);
          setUnpublishing(null);
        }}
        title={t("compounds.unpublishTitle", { name: unpublishing ? loc(unpublishing.name) : "" })}
        description={t("compounds.unpublishBody")}
        confirmLabel={t("compounds.unpublish")}
        destructive
      />
    </>
  );
}
