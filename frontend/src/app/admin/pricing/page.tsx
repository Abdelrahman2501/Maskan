"use client";

import { History, Info, Lock } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { DECIMAL_RE, nowIso, useFormat, useLocalized } from "@/components/properties/format";
import { useCompoundsStore, usePricesStore, useUnitModelsStore } from "@/components/properties/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { CURRENCIES, type Price } from "@/mock/properties";

type Draft = { id: string; amount: string; currency: string; labelEn: string; labelAr: string };
type Errors = Partial<Record<"amount" | "currency" | "labelEn" | "labelAr", string>>;

/** Strip trailing ".00"-style zeros for editing, keep the decimal string otherwise. */
const editable = (amount: string) => amount.replace(/\.0+$/, "");
/** Normalise to two decimals without going through a float. */
const toNumeric = (amount: string) => {
  const [int, frac = ""] = amount.split(".");
  return `${int.replace(/^0+(?=\d)/, "")}.${frac.padEnd(2, "0")}`;
};

export default function PricingPage() {
  const t = useT("properties");
  const tc = useT();
  const loc = useLocalized();
  const f = useFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const canManage = can("prices.manage");
  const [prices, setPrices] = usePricesStore();
  const [models] = useUnitModelsStore();
  const [compounds] = useCompoundsStore();
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("");
  const [compoundId, setCompoundId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const [historyFor, setHistoryFor] = useState<Price | null>(null);

  const modelOf = (p: Price) => models.find((u) => u.id === p.unitModelId);
  const compoundOf = (p: Price) => compounds.find((c) => c.id === modelOf(p)?.compoundId);

  const filtered = query.trim() !== "" || currency !== "" || compoundId !== "";
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prices.filter((p) => {
      const model = models.find((u) => u.id === p.unitModelId);
      return (
        (!q ||
          p.label.en.toLowerCase().includes(q) ||
          p.label.ar.includes(q) ||
          model?.name.en.toLowerCase().includes(q) ||
          model?.name.ar.includes(q)) &&
        (!currency || p.currency === currency) &&
        (!compoundId || model?.compoundId === compoundId)
      );
    });
  }, [prices, models, query, currency, compoundId]);

  const editing = draft ? prices.find((p) => p.id === draft.id) : undefined;

  const validate = (d: Draft): Errors => {
    const e: Errors = {};
    if (!DECIMAL_RE.test(d.amount) || Number(d.amount) <= 0) e.amount = t("pricing.amountInvalid");
    if (!(CURRENCIES as readonly string[]).includes(d.currency)) e.currency = t("validation.required");
    if (!d.labelEn.trim()) e.labelEn = t("validation.required");
    if (!d.labelAr.trim()) e.labelAr = t("validation.required");
    return e;
  };

  const review = () => {
    if (!draft || !editing) return;
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    const unchanged =
      toNumeric(draft.amount) === editing.amount &&
      draft.currency === editing.currency &&
      draft.labelEn.trim() === editing.label.en &&
      draft.labelAr.trim() === editing.label.ar;
    if (unchanged) {
      setDraft(null);
      return;
    }
    setConfirming(true);
  };

  const commit = () => {
    if (!draft || !editing) return;
    const amount = toNumeric(draft.amount);
    const at = nowIso();
    const valueChanged = amount !== editing.amount || draft.currency !== editing.currency;
    setPrices((all) =>
      all.map((p) =>
        p.id === draft.id
          ? {
              ...p,
              amount,
              currency: draft.currency,
              label: { en: draft.labelEn.trim(), ar: draft.labelAr.trim() },
              updatedAt: at,
              updatedBy: user.name,
              // Append-only: new entries are prepended; existing rows are never edited.
              history: valueChanged
                ? [{ amount, currency: draft.currency, changedBy: user.name, changedAt: at }, ...p.history]
                : p.history,
            }
          : p,
      ),
    );
    toast(t("pricing.updated"));
    setConfirming(false);
    setDraft(null);
  };

  const columns: Column<Price>[] = [
    {
      key: "model",
      header: t("shared.unitModel"),
      sortValue: (p) => loc(modelOf(p)?.name),
      cell: (p) => <span className="font-medium text-ink">{loc(modelOf(p)?.name)}</span>,
    },
    {
      key: "compound",
      header: t("shared.compound"),
      hideOnMobile: true,
      sortValue: (p) => loc(compoundOf(p)?.name),
      cell: (p) => loc(compoundOf(p)?.name),
    },
    { key: "label", header: t("pricing.label"), cell: (p) => loc(p.label) },
    {
      key: "amount",
      header: t("pricing.amount"),
      className: "text-end",
      sortValue: (p) => Number(p.amount),
      cell: (p) => (
        <span dir="ltr" className="inline-block font-semibold text-ink tabular-nums">
          {f.money(p.amount, p.currency)}
        </span>
      ),
    },
    {
      key: "currency",
      header: t("pricing.currency"),
      sortValue: (p) => p.currency,
      cell: (p) => (
        <Badge tone="brand">
          <span dir="ltr">{p.currency}</span>
        </Badge>
      ),
    },
    {
      key: "updated",
      header: t("pricing.lastUpdated"),
      hideOnMobile: true,
      sortValue: (p) => p.updatedAt,
      cell: (p) => (
        <div>
          <p className="text-sm text-ink">{f.dateTime(p.updatedAt)}</p>
          <p className="text-xs text-ink-muted">{t("pricing.by", { name: p.updatedBy })}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (p) => (
        <ActionMenu
          items={[
            {
              label: t("pricing.editPrice"),
              disabled: !canManage,
              onSelect: () => {
                setErrors({});
                setDraft({
                  id: p.id,
                  amount: editable(p.amount),
                  currency: p.currency,
                  labelEn: p.label.en,
                  labelAr: p.label.ar,
                });
              },
            },
            { label: t("pricing.viewHistory"), onSelect: () => setHistoryFor(p) },
          ]}
        />
      ),
    },
  ];

  const historyRows = historyFor ? (prices.find((p) => p.id === historyFor.id)?.history ?? []) : [];

  return (
    <>
      <PageHeader
        title={t("pricing.title")}
        description={t("pricing.description")}
        breadcrumbs={[{ label: t("breadcrumb") }, { label: t("pricing.title") }]}
      />

      <div className="mb-4 flex flex-col gap-2 rounded-md border border-border bg-info/5 px-4 py-3 text-sm text-ink sm:flex-row sm:items-center sm:gap-4">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
          {tc("currencyNote")}
        </p>
        {!canManage && (
          <p className="flex items-center gap-1.5 text-ink-muted sm:ms-auto">
            <Lock className="size-3.5" aria-hidden="true" />
            {t("pricing.readOnly")}
          </p>
        )}
      </div>

      <FilterBar>
        <SearchInput
          className="sm:w-64"
          placeholder={t("pricing.search")}
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
        <Select className="sm:w-40" aria-label={t("pricing.currency")} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="">{t("pricing.allCurrencies")}</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c} — {t(`currency.${c}`)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCurrency("");
              setCompoundId("");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
      </FilterBar>

      <DataTable columns={columns} rows={rows} getRowId={(p) => p.id} filtered={filtered} emptyTitle={t("pricing.empty")} />

      <Dialog
        open={draft !== null && !confirming}
        onClose={() => setDraft(null)}
        title={t("pricing.editTitle")}
        description={editing ? `${loc(compoundOf(editing)?.name)} · ${loc(modelOf(editing)?.name)}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {tc("actions.cancel")}
            </Button>
            <Button onClick={review}>{tc("actions.saveChanges")}</Button>
          </>
        }
      >
        {draft && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <FormField label={t("pricing.amount")} required hint={t("pricing.amountHint")} error={errors.amount}>
                {(p) => (
                  <Input
                    {...p}
                    dir="ltr"
                    inputMode="decimal"
                    className="tabular-nums"
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/[^\d.]/g, "") })}
                  />
                )}
              </FormField>
              <FormField label={t("pricing.currency")} required error={errors.currency}>
                {(p) => (
                  <Select {...p} dir="ltr" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
            {editing && draft.currency !== editing.currency && (
              <p role="status" className="rounded-md bg-warning/12 px-3 py-2 text-xs text-warning">
                {t("pricing.currencyChangeWarning", { from: editing.currency, to: draft.currency })}
              </p>
            )}
            <FormField label={t("pricing.labelEn")} required error={errors.labelEn}>
              {(p) => <Input {...p} dir="ltr" value={draft.labelEn} onChange={(e) => setDraft({ ...draft, labelEn: e.target.value })} />}
            </FormField>
            <FormField label={t("pricing.labelAr")} required error={errors.labelAr}>
              {(p) => (
                <Input {...p} dir="rtl" lang="ar" value={draft.labelAr} onChange={(e) => setDraft({ ...draft, labelAr: e.target.value })} />
              )}
            </FormField>
            <p className="text-xs text-ink-muted">{tc("currencyNote")}</p>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={commit}
        title={t("pricing.confirmTitle")}
        description={t("pricing.confirmBody")}
        confirmLabel={t("pricing.confirmAction")}
      >
        {draft && editing && (
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-border p-3 text-sm">
            <div>
              <dt className="text-xs text-ink-muted">{t("pricing.current")}</dt>
              <dd dir="ltr" className="font-medium text-ink tabular-nums">
                {f.money(editing.amount, editing.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t("pricing.new")}</dt>
              <dd dir="ltr" className="font-semibold text-navy tabular-nums">
                {DECIMAL_RE.test(draft.amount) ? f.money(toNumeric(draft.amount), draft.currency) : draft.amount}
              </dd>
            </div>
          </dl>
        )}
      </ConfirmDialog>

      <Dialog
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        title={t("pricing.historyTitle")}
        description={historyFor ? `${loc(modelOf(historyFor)?.name)} · ${loc(historyFor.label)}` : undefined}
        footer={
          <Button variant="secondary" onClick={() => setHistoryFor(null)}>
            {tc("actions.close")}
          </Button>
        }
      >
        <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <History className="size-3.5" aria-hidden="true" />
          {t("pricing.historyHint")}
        </p>
        {historyRows.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">{t("pricing.noHistory")}</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-background/60 text-xs text-ink-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 text-start font-semibold">
                    {t("pricing.amount")}
                  </th>
                  <th scope="col" className="px-3 py-2 text-start font-semibold">
                    {t("pricing.changedAt")}
                  </th>
                  <th scope="col" className="px-3 py-2 text-start font-semibold">
                    {t("pricing.changedBy")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyRows.map((h, i) => (
                  <tr key={`${h.changedAt}-${i}`}>
                    <td className="px-3 py-2">
                      <span dir="ltr" className="inline-block font-medium text-ink tabular-nums">
                        {f.money(h.amount, h.currency)}
                      </span>
                      {i === 0 && (
                        <Badge tone="success" className="ms-2">
                          {t("pricing.currentBadge")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-muted">{f.dateTime(h.changedAt)}</td>
                    <td className="px-3 py-2 text-ink-muted">{h.changedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Dialog>
    </>
  );
}
