"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { useLocalized } from "@/components/properties/format";
import { useLocationsStore } from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/use-t";
import { COMPOUND_STATUSES, type Compound, type CompoundStatus, type Localized } from "@/mock/properties";

export type CompoundDraft = {
  nameEn: string;
  nameAr: string;
  locationId: string;
  developerEn: string;
  developerAr: string;
  addressEn: string;
  addressAr: string;
  descriptionEn: string;
  descriptionAr: string;
  amenities: Localized[];
  status: CompoundStatus;
  deliveryYear: string;
};

export type CompoundErrors = Partial<Record<keyof CompoundDraft, string>>;

export const emptyCompoundDraft = (locationId = ""): CompoundDraft => ({
  nameEn: "",
  nameAr: "",
  locationId,
  developerEn: "",
  developerAr: "",
  addressEn: "",
  addressAr: "",
  descriptionEn: "",
  descriptionAr: "",
  amenities: [],
  status: "launching",
  deliveryYear: String(new Date().getFullYear() + 2),
});

export const draftFromCompound = (c: Compound): CompoundDraft => ({
  nameEn: c.name.en,
  nameAr: c.name.ar,
  locationId: c.locationId,
  developerEn: c.developer.en,
  developerAr: c.developer.ar,
  addressEn: c.address.en,
  addressAr: c.address.ar,
  descriptionEn: c.description.en,
  descriptionAr: c.description.ar,
  amenities: c.amenities,
  status: c.status,
  deliveryYear: String(c.deliveryYear),
});

export function validateCompound(d: CompoundDraft, t: (k: string, v?: Record<string, string | number>) => string) {
  const e: CompoundErrors = {};
  if (!d.nameEn.trim()) e.nameEn = t("validation.required");
  if (!d.nameAr.trim()) e.nameAr = t("validation.required");
  if (!d.locationId) e.locationId = t("validation.required");
  if (!d.developerEn.trim()) e.developerEn = t("validation.required");
  const year = Number(d.deliveryYear);
  if (!/^\d{4}$/.test(d.deliveryYear) || year < 2000 || year > 2100) e.deliveryYear = t("validation.year");
  return e;
}

/** Shared compound fields for the create dialog and the detail Overview tab. */
export function CompoundFields({
  draft,
  onChange,
  errors,
  disabled,
  compact = false,
}: {
  draft: CompoundDraft;
  onChange: (d: CompoundDraft) => void;
  errors: CompoundErrors;
  disabled?: boolean;
  compact?: boolean;
}) {
  const t = useT("properties");
  const loc = useLocalized();
  const [locations] = useLocationsStore();
  const [amenityEn, setAmenityEn] = useState("");
  const [amenityAr, setAmenityAr] = useState("");
  const set = <K extends keyof CompoundDraft>(k: K, v: CompoundDraft[K]) => onChange({ ...draft, [k]: v });

  const addAmenity = () => {
    if (!amenityEn.trim()) return;
    set("amenities", [...draft.amenities, { en: amenityEn.trim(), ar: amenityAr.trim() || amenityEn.trim() }]);
    setAmenityEn("");
    setAmenityAr("");
  };

  return (
    <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
      <FormField label={t("shared.nameEn")} required error={errors.nameEn}>
        {(p) => <Input {...p} dir="ltr" value={draft.nameEn} onChange={(e) => set("nameEn", e.target.value)} />}
      </FormField>
      <FormField label={t("shared.nameAr")} required error={errors.nameAr}>
        {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.nameAr} onChange={(e) => set("nameAr", e.target.value)} />}
      </FormField>
      <FormField label={t("shared.location")} required error={errors.locationId}>
        {(p) => (
          <Select {...p} value={draft.locationId} onChange={(e) => set("locationId", e.target.value)}>
            <option value="">{t("shared.selectPlaceholder")}</option>
            {locations
              .filter((l) => l.isActive || l.id === draft.locationId)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {loc(l.name)}
                </option>
              ))}
          </Select>
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label={t("shared.status")}>
          {(p) => (
            <Select {...p} value={draft.status} onChange={(e) => set("status", e.target.value as CompoundStatus)}>
              {COMPOUND_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`compoundStatus.${s}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("compounds.deliveryYear")} error={errors.deliveryYear}>
          {(p) => (
            <Input
              {...p}
              dir="ltr"
              inputMode="numeric"
              value={draft.deliveryYear}
              onChange={(e) => set("deliveryYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          )}
        </FormField>
      </div>
      <FormField label={t("compounds.developerEn")} required error={errors.developerEn}>
        {(p) => <Input {...p} dir="ltr" value={draft.developerEn} onChange={(e) => set("developerEn", e.target.value)} />}
      </FormField>
      <FormField label={t("compounds.developerAr")}>
        {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.developerAr} onChange={(e) => set("developerAr", e.target.value)} />}
      </FormField>
      {!compact && (
        <>
          <FormField label={t("compounds.addressEn")}>
            {(p) => <Input {...p} dir="ltr" value={draft.addressEn} onChange={(e) => set("addressEn", e.target.value)} />}
          </FormField>
          <FormField label={t("compounds.addressAr")}>
            {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.addressAr} onChange={(e) => set("addressAr", e.target.value)} />}
          </FormField>
          <FormField label={t("compounds.descriptionEn")}>
            {(p) => <Textarea {...p} dir="ltr" value={draft.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />}
          </FormField>
          <FormField label={t("compounds.descriptionAr")}>
            {(p) => (
              <Textarea {...p} dir="rtl" lang="ar" value={draft.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} />
            )}
          </FormField>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-ink">{t("compounds.amenities")}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{t("compounds.amenitiesHint")}</p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={t("compounds.amenities")}>
              {draft.amenities.length === 0 && <li className="text-sm text-ink-muted">{t("compounds.noAmenities")}</li>}
              {draft.amenities.map((a, i) => (
                <li
                  key={`${a.en}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-1 ps-3 pe-1 text-sm text-ink"
                >
                  {loc(a)}
                  <button
                    type="button"
                    aria-label={t("compounds.removeAmenity", { name: loc(a) })}
                    onClick={() => set("amenities", draft.amenities.filter((_, j) => j !== i))}
                    className="grid size-5 place-items-center rounded-full text-ink-muted hover:bg-error/10 hover:text-error"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                dir="ltr"
                aria-label={t("compounds.amenityEn")}
                placeholder={t("compounds.amenityEn")}
                value={amenityEn}
                onChange={(e) => setAmenityEn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Input
                dir="rtl"
                lang="ar"
                aria-label={t("compounds.amenityAr")}
                placeholder={t("compounds.amenityAr")}
                value={amenityAr}
                onChange={(e) => setAmenityAr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Button variant="secondary" onClick={addAmenity} disabled={!amenityEn.trim()}>
                <Plus aria-hidden="true" />
                {t("compounds.addAmenity")}
              </Button>
            </div>
          </div>
        </>
      )}
    </fieldset>
  );
}
