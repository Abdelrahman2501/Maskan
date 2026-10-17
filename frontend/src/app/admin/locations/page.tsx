"use client";

import { MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useLocalized } from "@/components/properties/format";
import { ActiveBadge } from "@/components/properties/shared";
import { slugify, useCompoundsStore, useLocationsStore } from "@/components/properties/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Switch } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import type { Location } from "@/mock/properties";

type Draft = { id?: string; en: string; ar: string; isActive: boolean };
const EMPTY: Draft = { en: "", ar: "", isActive: true };

export default function LocationsPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("properties.manage");
  const [locations, setLocations] = useLocationsStore();
  const [compounds] = useCompoundsStore();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<{ en?: string; ar?: string }>({});
  const [deactivating, setDeactivating] = useState<Location | null>(null);

  const countFor = (id: string) => compounds.filter((c) => c.locationId === id).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? locations.filter((l) => l.name.en.toLowerCase().includes(q) || l.name.ar.includes(q) || l.slug.includes(q))
      : locations;
  }, [locations, query]);

  const setActive = (l: Location, active: boolean) => {
    setLocations((all) => all.map((x) => (x.id === l.id ? { ...x, isActive: active } : x)));
    toast(active ? t("locations.activated", { name: loc(l.name) }) : t("locations.deactivated", { name: loc(l.name) }));
  };

  const save = () => {
    const next: typeof errors = {};
    if (!draft) return;
    if (!draft.en.trim()) next.en = t("validation.required");
    if (!draft.ar.trim()) next.ar = t("validation.required");
    const dup = locations.some(
      (l) => l.id !== draft.id && l.name.en.trim().toLowerCase() === draft.en.trim().toLowerCase(),
    );
    if (!next.en && dup) next.en = t("validation.duplicateName");
    setErrors(next);
    if (Object.keys(next).length) return;
    if (draft.id) {
      setLocations((all) =>
        all.map((l) => (l.id === draft.id ? { ...l, name: { en: draft.en.trim(), ar: draft.ar.trim() }, isActive: draft.isActive } : l)),
      );
    } else {
      const slug = slugify(draft.en);
      setLocations((all) => [...all, { id: slug, slug, name: { en: draft.en.trim(), ar: draft.ar.trim() }, isActive: draft.isActive }]);
    }
    toast(draft.id ? tc("states.saved") : t("locations.created"));
    setDraft(null);
  };

  const columns: Column<Location>[] = [
    {
      key: "name",
      header: t("shared.name"),
      sortValue: (l) => loc(l.name),
      cell: (l) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-navy/8 text-navy">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-ink">{l.name.en}</p>
            <p className="text-xs text-ink-muted" dir="rtl" lang="ar">
              {l.name.ar}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      header: t("shared.slug"),
      hideOnMobile: true,
      cell: (l) => (
        <code dir="ltr" className="text-xs text-ink-muted">
          {l.slug}
        </code>
      ),
    },
    {
      key: "compounds",
      header: t("locations.compoundsCount"),
      sortValue: (l) => countFor(l.id),
      cell: (l) => <span className="tabular-nums">{countFor(l.id)}</span>,
    },
    {
      key: "status",
      header: t("shared.status"),
      cell: (l) => <ActiveBadge active={l.isActive} />,
    },
    {
      key: "active",
      header: t("shared.active"),
      cell: (l) => (
        <Switch
          checked={l.isActive}
          disabled={!canManage}
          label={t("locations.toggleLabel", { name: loc(l.name) })}
          onCheckedChange={(checked) => (checked ? setActive(l, true) : setDeactivating(l))}
        />
      ),
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (l) =>
        canManage ? (
          <ActionMenu
            items={[
              {
                label: tc("actions.edit"),
                onSelect: () => {
                  setErrors({});
                  setDraft({ id: l.id, en: l.name.en, ar: l.name.ar, isActive: l.isActive });
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
        title={t("locations.title")}
        description={t("locations.description")}
        breadcrumbs={[{ label: t("breadcrumb"), href: "/admin/compounds" }, { label: t("locations.title") }]}
        actions={
          canManage && (
            <Button
              onClick={() => {
                setErrors({});
                setDraft(EMPTY);
              }}
            >
              <Plus aria-hidden="true" />
              {t("locations.create")}
            </Button>
          )
        }
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("locations.search")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(l) => l.id}
        filtered={query.trim().length > 0}
        emptyTitle={t("locations.empty")}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("locations.edit") : t("locations.create")}
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
            <FormField label={t("shared.nameEn")} required error={errors.en}>
              {(p) => <Input {...p} dir="ltr" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />}
            </FormField>
            <FormField label={t("shared.nameAr")} required error={errors.ar}>
              {(p) => <Input {...p} dir="rtl" lang="ar" value={draft.ar} onChange={(e) => setDraft({ ...draft, ar: e.target.value })} />}
            </FormField>
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{t("shared.active")}</p>
                <p className="text-xs text-ink-muted">{t("locations.activeHint")}</p>
              </div>
              <Switch
                checked={draft.isActive}
                label={t("shared.active")}
                onCheckedChange={(isActive) => setDraft({ ...draft, isActive })}
              />
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
        title={t("locations.deactivateTitle", { name: deactivating ? loc(deactivating.name) : "" })}
        description={t("locations.deactivateBody", { count: deactivating ? countFor(deactivating.id) : 0 })}
        confirmLabel={t("locations.deactivate")}
        destructive
      />
    </>
  );
}
