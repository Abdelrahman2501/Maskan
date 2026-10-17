"use client";

import { Home, Plus } from "lucide-react";
import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useLocalized } from "@/components/properties/format";
import { ActiveBadge } from "@/components/properties/shared";
import { usePropertyTypesStore, useUnitModelsStore } from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Switch } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import type { PropertyType } from "@/mock/properties";

type Draft = { id?: string; key: string; en: string; ar: string; isActive: boolean };
type Errors = Partial<Record<"key" | "en" | "ar", string>>;

export default function PropertyTypesPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [types, setTypes] = usePropertyTypesStore();
  const [models] = useUnitModelsStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [deactivating, setDeactivating] = useState<PropertyType | null>(null);

  const usage = (id: string) => models.filter((m) => m.propertyTypeId === id).length;

  const setActive = (p: PropertyType, isActive: boolean) => {
    setTypes((all) => all.map((x) => (x.id === p.id ? { ...x, isActive } : x)));
    toast(isActive ? t("propertyTypes.activated", { name: loc(p.name) }) : t("propertyTypes.deactivated", { name: loc(p.name) }));
  };

  const save = () => {
    if (!draft) return;
    const e: Errors = {};
    if (!/^[a-z][a-z0-9_]{1,31}$/.test(draft.key)) e.key = t("propertyTypes.keyInvalid");
    else if (types.some((x) => x.key === draft.key && x.id !== draft.id)) e.key = t("propertyTypes.keyTaken");
    if (!draft.en.trim()) e.en = t("validation.required");
    if (!draft.ar.trim()) e.ar = t("validation.required");
    setErrors(e);
    if (Object.keys(e).length) return;
    const value = { key: draft.key, name: { en: draft.en.trim(), ar: draft.ar.trim() }, isActive: draft.isActive };
    if (draft.id) setTypes((all) => all.map((x) => (x.id === draft.id ? { ...x, ...value } : x)));
    else setTypes((all) => [...all, { id: draft.key, ...value }]);
    toast(draft.id ? tc("states.saved") : t("propertyTypes.created"));
    setDraft(null);
  };

  const columns: Column<PropertyType>[] = [
    {
      key: "name",
      header: t("shared.name"),
      sortValue: (p) => loc(p.name),
      cell: (p) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-navy/8 text-navy">
            <Home className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-ink">{p.name.en}</p>
            <p className="text-xs text-ink-muted" dir="rtl" lang="ar">
              {p.name.ar}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "key",
      header: t("propertyTypes.key"),
      cell: (p) => (
        <code dir="ltr" className="rounded-sm bg-background px-1.5 py-0.5 text-xs text-navy">
          {p.key}
        </code>
      ),
    },
    {
      key: "usage",
      header: t("propertyTypes.usage"),
      sortValue: (p) => usage(p.id),
      cell: (p) => <span className="tabular-nums">{usage(p.id)}</span>,
    },
    { key: "status", header: t("shared.status"), cell: (p) => <ActiveBadge active={p.isActive} /> },
    {
      key: "active",
      header: t("shared.active"),
      cell: (p) => (
        <Switch
          checked={p.isActive}
          disabled={!canManage}
          label={t("propertyTypes.toggleLabel", { name: loc(p.name) })}
          onCheckedChange={(v) => (v ? setActive(p, true) : setDeactivating(p))}
        />
      ),
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (p) =>
        canManage ? (
          <ActionMenu
            items={[
              {
                label: tc("actions.edit"),
                onSelect: () => {
                  setErrors({});
                  setDraft({ id: p.id, key: p.key, en: p.name.en, ar: p.name.ar, isActive: p.isActive });
                },
              },
            ]}
          />
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("propertyTypes.title")}
        description={t("propertyTypes.description")}
        breadcrumbs={[{ label: t("breadcrumb") }, { label: t("propertyTypes.title") }]}
        actions={
          canManage && (
            <Button
              onClick={() => {
                setErrors({});
                setDraft({ key: "", en: "", ar: "", isActive: true });
              }}
            >
              <Plus aria-hidden="true" />
              {t("propertyTypes.create")}
            </Button>
          )
        }
      />
      <DataTable columns={columns} rows={types} getRowId={(p) => p.id} emptyTitle={t("propertyTypes.empty")} />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("propertyTypes.edit") : t("propertyTypes.create")}
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
          <div className="flex flex-col gap-4">
            <FormField label={t("propertyTypes.key")} required hint={t("propertyTypes.keyHint")} error={errors.key}>
              {(p) => (
                <Input
                  {...p}
                  dir="ltr"
                  className="font-mono"
                  value={draft.key}
                  disabled={Boolean(draft.id)}
                  onChange={(e) => setDraft({ ...draft, key: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                />
              )}
            </FormField>
            <FormField label={t("shared.nameEn")} required error={errors.en}>
              {(p) => <Input {...p} dir="ltr" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />}
            </FormField>
            <FormField label={t("shared.nameAr")} required error={errors.ar}>
              {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.ar} onChange={(e) => setDraft({ ...draft, ar: e.target.value })} />}
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <p className="text-sm font-medium text-ink">{t("shared.active")}</p>
              <Switch checked={draft.isActive} label={t("shared.active")} onCheckedChange={(isActive) => setDraft({ ...draft, isActive })} />
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={deactivating !== null}
        onClose={() => setDeactivating(null)}
        onConfirm={() => {
          if (deactivating) setActive(deactivating, false);
          setDeactivating(null);
        }}
        title={t("propertyTypes.deactivateTitle", { name: deactivating ? loc(deactivating.name) : "" })}
        description={t("propertyTypes.deactivateBody", { count: deactivating ? usage(deactivating.id) : 0 })}
        confirmLabel={t("locations.deactivate")}
        destructive
      />
    </>
  );
}
