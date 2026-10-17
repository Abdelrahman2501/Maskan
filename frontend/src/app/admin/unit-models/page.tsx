"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat, useLocalized } from "@/components/properties/format";
import { PriceSummary } from "@/components/properties/price-summary";
import { AvailabilityBadge, LangTag } from "@/components/properties/shared";
import {
  slugify,
  useCompoundsStore,
  usePricesStore,
  usePropertyTypesStore,
  useUnitModelsStore,
} from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { AVAILABILITIES, type Availability, type ExtraSpec, type UnitModel } from "@/mock/properties";

type SpecRow = { labelEn: string; labelAr: string; valueEn: string; valueAr: string };

type Draft = {
  id?: string;
  compoundId: string;
  propertyTypeId: string;
  nameEn: string;
  nameAr: string;
  areaSqm: string;
  bedrooms: string;
  bathrooms: string;
  floorEn: string;
  floorAr: string;
  finishingEn: string;
  finishingAr: string;
  viewEn: string;
  viewAr: string;
  availability: Availability;
  specs: SpecRow[];
};

type Errors = Partial<Record<keyof Omit<Draft, "specs" | "id" | "availability">, string>> & { specs?: string };

const MAX_SPECS = 20;

const emptyDraft = (compoundId = "", propertyTypeId = ""): Draft => ({
  compoundId,
  propertyTypeId,
  nameEn: "",
  nameAr: "",
  areaSqm: "",
  bedrooms: "",
  bathrooms: "",
  floorEn: "",
  floorAr: "",
  finishingEn: "",
  finishingAr: "",
  viewEn: "",
  viewAr: "",
  availability: "available",
  specs: [],
});

const draftFrom = (u: UnitModel): Draft => ({
  id: u.id,
  compoundId: u.compoundId,
  propertyTypeId: u.propertyTypeId,
  nameEn: u.name.en,
  nameAr: u.name.ar,
  areaSqm: String(u.areaSqm),
  bedrooms: String(u.bedrooms),
  bathrooms: String(u.bathrooms),
  floorEn: u.floor.en,
  floorAr: u.floor.ar,
  finishingEn: u.finishing.en,
  finishingAr: u.finishing.ar,
  viewEn: u.view.en,
  viewAr: u.view.ar,
  availability: u.availability,
  specs: u.extraSpecs.map((s) => ({ labelEn: s.label.en, labelAr: s.label.ar, valueEn: s.value.en, valueAr: s.value.ar })),
});

const INT_RE = /^\d{1,2}$/;
const AREA_RE = /^\d{1,5}(\.\d{1,2})?$/;

export default function UnitModelsPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [models, setModels] = useUnitModelsStore();
  const [compounds] = useCompoundsStore();
  const [types] = usePropertyTypesStore();
  const [prices] = usePricesStore();
  const [query, setQuery] = useState("");
  const [compoundId, setCompoundId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [availability, setAvailability] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [deleting, setDeleting] = useState<UnitModel | null>(null);

  const compoundName = (id: string) => loc(compounds.find((c) => c.id === id)?.name);
  const typeName = (id: string) => loc(types.find((p) => p.id === id)?.name);
  const pricesFor = (id: string) => prices.filter((p) => p.unitModelId === id);

  const filtered = query.trim() !== "" || compoundId !== "" || typeId !== "" || availability !== "";
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter(
      (u) =>
        (!q || u.name.en.toLowerCase().includes(q) || u.name.ar.includes(q)) &&
        (!compoundId || u.compoundId === compoundId) &&
        (!typeId || u.propertyTypeId === typeId) &&
        (!availability || u.availability === availability),
    );
  }, [models, query, compoundId, typeId, availability]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const setSpec = (i: number, patch: Partial<SpecRow>) =>
    setDraft((d) => (d ? { ...d, specs: d.specs.map((s, j) => (j === i ? { ...s, ...patch } : s)) } : d));

  const validate = (d: Draft): Errors => {
    const e: Errors = {};
    if (!d.compoundId) e.compoundId = t("validation.required");
    if (!d.propertyTypeId) e.propertyTypeId = t("validation.required");
    if (!d.nameEn.trim()) e.nameEn = t("validation.required");
    if (!d.nameAr.trim()) e.nameAr = t("validation.required");
    if (!AREA_RE.test(d.areaSqm) || Number(d.areaSqm) <= 0) e.areaSqm = t("validation.positiveNumber");
    if (!INT_RE.test(d.bedrooms)) e.bedrooms = t("validation.wholeNumber");
    if (!INT_RE.test(d.bathrooms)) e.bathrooms = t("validation.wholeNumber");
    const incomplete = d.specs.some((s) => !s.labelEn.trim() || !s.valueEn.trim());
    const labels = d.specs.map((s) => s.labelEn.trim().toLowerCase()).filter(Boolean);
    if (incomplete) e.specs = t("unitModels.specsIncomplete");
    else if (new Set(labels).size !== labels.length) e.specs = t("unitModels.specsDuplicate");
    return e;
  };

  const save = () => {
    if (!draft) return;
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    const both = (en: string, ar: string) => ({ en: en.trim(), ar: ar.trim() || en.trim() });
    const extraSpecs: ExtraSpec[] = draft.specs.map((s) => ({
      label: both(s.labelEn, s.labelAr),
      value: both(s.valueEn, s.valueAr),
    }));
    const value: Omit<UnitModel, "id"> = {
      compoundId: draft.compoundId,
      propertyTypeId: draft.propertyTypeId,
      name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() },
      areaSqm: Number(draft.areaSqm),
      bedrooms: Number(draft.bedrooms),
      bathrooms: Number(draft.bathrooms),
      floor: both(draft.floorEn, draft.floorAr),
      finishing: both(draft.finishingEn, draft.finishingAr),
      view: both(draft.viewEn, draft.viewAr),
      availability: draft.availability,
      extraSpecs,
    };
    if (draft.id) {
      setModels((all) => all.map((u) => (u.id === draft.id ? { ...u, ...value } : u)));
      toast(tc("states.saved"));
    } else {
      const base = `${draft.compoundId}-${slugify(draft.nameEn)}`;
      const id = models.some((u) => u.id === base) ? `${base}-${models.length + 1}` : base;
      setModels((all) => [{ id, ...value }, ...all]);
      toast(t("unitModels.created", { name: loc(value.name) }));
    }
    setDraft(null);
  };

  const columns: Column<UnitModel>[] = [
    {
      key: "name",
      header: t("shared.name"),
      sortValue: (u) => loc(u.name),
      cell: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{loc(u.name)}</p>
          {u.extraSpecs.length > 0 && (
            <p className="text-xs text-ink-muted">{t("unitModels.specsCount", { count: u.extraSpecs.length })}</p>
          )}
        </div>
      ),
    },
    { key: "compound", header: t("shared.compound"), sortValue: (u) => compoundName(u.compoundId), cell: (u) => compoundName(u.compoundId) },
    {
      key: "type",
      header: t("shared.propertyType"),
      hideOnMobile: true,
      sortValue: (u) => typeName(u.propertyTypeId),
      cell: (u) => typeName(u.propertyTypeId),
    },
    {
      key: "area",
      header: t("unitModels.area"),
      sortValue: (u) => u.areaSqm,
      cell: (u) => (
        <span dir="ltr" className="inline-block tabular-nums">
          {f.number(u.areaSqm)} m²
        </span>
      ),
    },
    {
      key: "rooms",
      header: t("unitModels.bedsBaths"),
      hideOnMobile: true,
      sortValue: (u) => u.bedrooms,
      cell: (u) => (
        <span className="tabular-nums">{t("unitModels.bedsBathsValue", { beds: u.bedrooms, baths: u.bathrooms })}</span>
      ),
    },
    {
      key: "availability",
      header: t("unitModels.availability"),
      sortValue: (u) => u.availability,
      cell: (u) => <AvailabilityBadge availability={u.availability} />,
    },
    { key: "price", header: t("unitModels.priceSummary"), cell: (u) => <PriceSummary prices={pricesFor(u.id)} /> },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (u) =>
        canManage ? (
          <ActionMenu
            items={[
              {
                label: tc("actions.edit"),
                onSelect: () => {
                  setErrors({});
                  setDraft(draftFrom(u));
                },
              },
              { label: tc("actions.delete"), onSelect: () => setDeleting(u), destructive: true },
            ]}
          />
        ) : null,
    },
  ];

  const textPair = (
    label: string,
    en: keyof Draft,
    ar: keyof Draft,
    required = false,
  ) =>
    draft && (
      <>
        <FormField label={`${label} (EN)`} required={required} error={errors[en as keyof Errors]}>
          {(p) => <Input {...p} dir="ltr" value={draft[en] as string} onChange={(e) => set(en, e.target.value)} />}
        </FormField>
        <FormField label={`${label} (AR)`} required={required} error={errors[ar as keyof Errors]}>
          {(p) => <Input {...p} dir="rtl" lang="ar" value={draft[ar] as string} onChange={(e) => set(ar, e.target.value)} />}
        </FormField>
      </>
    );

  return (
    <>
      <PageHeader
        title={t("unitModels.title")}
        description={t("unitModels.description")}
        breadcrumbs={[{ label: t("breadcrumb") }, { label: t("unitModels.title") }]}
        actions={
          canManage && (
            <Button
              onClick={() => {
                setErrors({});
                setDraft(emptyDraft(compoundId, typeId));
              }}
            >
              <Plus aria-hidden="true" />
              {t("unitModels.create")}
            </Button>
          )
        }
      />
      <FilterBar>
        <SearchInput
          className="sm:w-64"
          placeholder={t("unitModels.search")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-56" aria-label={t("shared.compound")} value={compoundId} onChange={(e) => setCompoundId(e.target.value)}>
          <option value="">{t("shared.allCompounds")}</option>
          {compounds.map((c) => (
            <option key={c.id} value={c.id}>
              {loc(c.name)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-44" aria-label={t("shared.propertyType")} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          <option value="">{t("shared.allTypes")}</option>
          {types.map((p) => (
            <option key={p.id} value={p.id}>
              {loc(p.name)}
            </option>
          ))}
        </Select>
        <Select
          className="sm:w-44"
          aria-label={t("unitModels.availability")}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="">{t("unitModels.allAvailability")}</option>
          {AVAILABILITIES.map((a) => (
            <option key={a} value={a}>
              {t(`availability.${a}`)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCompoundId("");
              setTypeId("");
              setAvailability("");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(u) => u.id}
        filtered={filtered}
        emptyTitle={t("unitModels.empty")}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("unitModels.edit") : t("unitModels.create")}
        description={t("unitModels.formHint")}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {tc("actions.cancel")}
            </Button>
            <Button onClick={save}>{draft?.id ? tc("actions.saveChanges") : tc("actions.create")}</Button>
          </>
        }
      >
        {draft && (
          <div className="flex flex-col gap-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("shared.compound")} required error={errors.compoundId}>
                {(p) => (
                  <Select {...p} value={draft.compoundId} onChange={(e) => set("compoundId", e.target.value)}>
                    <option value="">{t("shared.selectPlaceholder")}</option>
                    {compounds.map((c) => (
                      <option key={c.id} value={c.id}>
                        {loc(c.name)}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label={t("shared.propertyType")} required error={errors.propertyTypeId}>
                {(p) => (
                  <Select {...p} value={draft.propertyTypeId} onChange={(e) => set("propertyTypeId", e.target.value)}>
                    <option value="">{t("shared.selectPlaceholder")}</option>
                    {types
                      .filter((pt) => pt.isActive || pt.id === draft.propertyTypeId)
                      .map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {loc(pt.name)}
                        </option>
                      ))}
                  </Select>
                )}
              </FormField>
              <FormField label={t("shared.nameEn")} required error={errors.nameEn}>
                {(p) => <Input {...p} dir="ltr" value={draft.nameEn} onChange={(e) => set("nameEn", e.target.value)} />}
              </FormField>
              <FormField label={t("shared.nameAr")} required error={errors.nameAr}>
                {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.nameAr} onChange={(e) => set("nameAr", e.target.value)} />}
              </FormField>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-ink">{t("unitModels.structured")}</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <FormField label={t("unitModels.areaSqm")} required error={errors.areaSqm}>
                  {(p) => (
                    <Input
                      {...p}
                      dir="ltr"
                      inputMode="decimal"
                      value={draft.areaSqm}
                      onChange={(e) => set("areaSqm", e.target.value.replace(/[^\d.]/g, ""))}
                    />
                  )}
                </FormField>
                <FormField label={t("unitModels.bedrooms")} required error={errors.bedrooms}>
                  {(p) => (
                    <Input
                      {...p}
                      dir="ltr"
                      inputMode="numeric"
                      value={draft.bedrooms}
                      onChange={(e) => set("bedrooms", e.target.value.replace(/\D/g, "").slice(0, 2))}
                    />
                  )}
                </FormField>
                <FormField label={t("unitModels.bathrooms")} required error={errors.bathrooms}>
                  {(p) => (
                    <Input
                      {...p}
                      dir="ltr"
                      inputMode="numeric"
                      value={draft.bathrooms}
                      onChange={(e) => set("bathrooms", e.target.value.replace(/\D/g, "").slice(0, 2))}
                    />
                  )}
                </FormField>
                <FormField label={t("unitModels.availability")}>
                  {(p) => (
                    <Select {...p} value={draft.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                      {AVAILABILITIES.map((a) => (
                        <option key={a} value={a}>
                          {t(`availability.${a}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {textPair(t("unitModels.floor"), "floorEn", "floorAr")}
                {textPair(t("unitModels.finishing"), "finishingEn", "finishingAr")}
                {textPair(t("unitModels.view"), "viewEn", "viewAr")}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t("unitModels.extraSpecs")}</h3>
                  <p className="mt-0.5 text-xs text-ink-muted">{t("unitModels.extraSpecsHint")}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={draft.specs.length >= MAX_SPECS}
                  onClick={() => set("specs", [...draft.specs, { labelEn: "", labelAr: "", valueEn: "", valueAr: "" }])}
                >
                  <Plus aria-hidden="true" />
                  {t("unitModels.addSpec")}
                </Button>
              </div>
              {draft.specs.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-ink-muted">
                  {t("unitModels.noSpecs")}
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {draft.specs.map((s, i) => (
                    <li key={i} className="rounded-md border border-border p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          dir="ltr"
                          aria-label={`${t("unitModels.specLabel")} EN ${i + 1}`}
                          placeholder={t("unitModels.specLabelEn")}
                          value={s.labelEn}
                          onChange={(e) => setSpec(i, { labelEn: e.target.value })}
                        />
                        <Input
                          dir="rtl"
                          lang="ar"
                          aria-label={`${t("unitModels.specLabel")} AR ${i + 1}`}
                          placeholder={t("unitModels.specLabelAr")}
                          value={s.labelAr}
                          onChange={(e) => setSpec(i, { labelAr: e.target.value })}
                        />
                        <Input
                          dir="ltr"
                          aria-label={`${t("unitModels.specValue")} EN ${i + 1}`}
                          placeholder={t("unitModels.specValueEn")}
                          value={s.valueEn}
                          onChange={(e) => setSpec(i, { valueEn: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Input
                            dir="rtl"
                            lang="ar"
                            aria-label={`${t("unitModels.specValue")} AR ${i + 1}`}
                            placeholder={t("unitModels.specValueAr")}
                            value={s.valueAr}
                            onChange={(e) => setSpec(i, { valueAr: e.target.value })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-error hover:bg-error/10"
                            aria-label={t("unitModels.removeSpec", { n: i + 1 })}
                            onClick={() => set("specs", draft.specs.filter((_, j) => j !== i))}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {errors.specs && (
                <p role="alert" className="mt-2 text-xs text-error">
                  {errors.specs}
                </p>
              )}
              <p className="mt-2 flex items-center text-xs text-ink-muted">
                {t("unitModels.specsLangHint")}
                <LangTag lang="en" />
                <LangTag lang="ar" />
              </p>
            </section>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            setModels((all) => all.filter((u) => u.id !== deleting.id));
            toast(t("unitModels.deleted", { name: loc(deleting.name) }));
          }
          setDeleting(null);
        }}
        title={t("unitModels.deleteTitle", { name: deleting ? loc(deleting.name) : "" })}
        description={t("unitModels.deleteBody", { count: deleting ? pricesFor(deleting.id).length : 0 })}
        confirmLabel={tc("actions.delete")}
        destructive
      />
    </>
  );
}
