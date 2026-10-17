"use client";

import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { JsonBlock, redact } from "@/components/administration/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { DetailList, FilterBar, PageHeader } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { AUDIT_ACTIONS, AUDIT_LOGS, type AuditEntry } from "@/mock/administration";

const actionKey = (a: string) => a.replace(/\./g, "_");

const ACTION_TONE: Record<string, "brand" | "warning" | "info" | "error" | "neutral"> = {
  "role.granted": "warning",
  "role.revoked": "warning",
  "user.suspended": "error",
  "user.reactivated": "info",
  "settings.updated": "warning",
  "price.updated": "info",
};

export default function AuditLogsPage() {
  const t = useT("administration");
  const ts = useT("shell");
  const tc = useT();
  const f = useFormat();

  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");
  const [entity, setEntity] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const actors = useMemo(() => [...new Set(AUDIT_LOGS.map((e) => e.actor))].sort(), []);
  const entities = useMemo(() => [...new Set(AUDIT_LOGS.map((e) => e.entityType))].sort(), []);

  const rangeInvalid = from !== "" && to !== "" && from > to;
  const filtered = actor !== "all" || action !== "all" || entity !== "all" || from !== "" || to !== "";

  const rows = useMemo(() => {
    if (rangeInvalid) return [];
    return AUDIT_LOGS.filter((e) => {
      const day = e.at.slice(0, 10);
      if (actor !== "all" && e.actor !== actor) return false;
      if (action !== "all" && e.action !== action) return false;
      if (entity !== "all" && e.entityType !== entity) return false;
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    }).sort((a, b) => b.at.localeCompare(a.at));
  }, [actor, action, entity, from, to, rangeInvalid]);

  const clear = () => {
    setActor("all");
    setAction("all");
    setEntity("all");
    setFrom("");
    setTo("");
  };

  const columns: Column<AuditEntry>[] = [
    {
      key: "at",
      header: t("audit.columns.time"),
      sortValue: (e) => e.at,
      cell: (e) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(e.at)}</span>,
    },
    { key: "actor", header: t("audit.columns.actor"), sortValue: (e) => e.actor, cell: (e) => <span className="whitespace-nowrap">{e.actor}</span> },
    {
      key: "action",
      header: t("audit.columns.action"),
      cell: (e) => (
        <Badge tone={ACTION_TONE[e.action] ?? "brand"} title={e.action}>
          {t(`audit.actions.${actionKey(e.action)}`)}
        </Badge>
      ),
    },
    {
      key: "entity",
      header: t("audit.columns.entity"),
      hideOnMobile: true,
      cell: (e) => (
        <div className="min-w-0">
          <p className="text-ink">{t(`audit.entities.${e.entityType}`)}</p>
          <p dir="ltr" className="text-start font-mono text-xs text-ink-muted">
            {e.entityId}
          </p>
        </div>
      ),
    },
    {
      key: "summary",
      header: t("audit.columns.summary"),
      hideOnMobile: true,
      cell: (e) => <span className="line-clamp-2 text-ink-muted">{String(redact(e.details))}</span>,
    },
    {
      key: "ip",
      header: t("audit.columns.ip"),
      hideOnMobile: true,
      cell: (e) => (
        <span dir="ltr" className="font-mono text-xs whitespace-nowrap text-ink-muted">
          {e.ip}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("audit.title")}
        description={t("audit.description")}
        breadcrumbs={[{ label: ts("groups.administration") }, { label: t("audit.title") }]}
      />

      <FilterBar>
        <Select className="sm:w-48" aria-label={t("audit.filters.actor")} value={actor} onChange={(e) => setActor(e.target.value)}>
          <option value="all">{t("audit.filters.allActors")}</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select className="sm:w-56" aria-label={t("audit.filters.action")} value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="all">{t("audit.filters.allActions")}</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {t(`audit.actions.${actionKey(a)}`)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-52" aria-label={t("audit.filters.entity")} value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="all">{t("audit.filters.allEntities")}</option>
          {entities.map((en) => (
            <option key={en} value={en}>
              {t(`audit.entities.${en}`)}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          {t("audit.filters.from")}
          <Input type="date" className="sm:w-40" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-invalid={rangeInvalid || undefined} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          {t("audit.filters.to")}
          <Input type="date" className="sm:w-40" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-invalid={rangeInvalid || undefined} />
        </label>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("common.results", { count: rows.length })}</span>
      </FilterBar>
      {rangeInvalid && (
        <p role="alert" className="-mt-2 mb-4 text-sm text-error">
          {t("audit.filters.invalidRange")}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(e) => e.id}
        onRowClick={setSelected}
        filtered={filtered}
        emptyTitle={t("audit.empty")}
        pageSize={10}
      />

      <p className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t("audit.appendOnly")}
      </p>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected ? t(`audit.actions.${actionKey(selected.action)}`) : ""}
        description={selected ? f.dateTime(selected.at) : undefined}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <DetailList
              items={[
                { label: t("audit.columns.actor"), value: selected.actor },
                {
                  label: t("audit.detail.actionCode"),
                  value: (
                    <code dir="ltr" className="font-mono text-xs">
                      {selected.action}
                    </code>
                  ),
                },
                {
                  label: t("audit.columns.entity"),
                  value: (
                    <>
                      {t(`audit.entities.${selected.entityType}`)}{" "}
                      <code dir="ltr" className="font-mono text-xs text-ink-muted">
                        {selected.entityId}
                      </code>
                    </>
                  ),
                },
                {
                  label: t("audit.columns.ip"),
                  value: (
                    <span dir="ltr" className="font-mono text-xs">
                      {selected.ip}
                    </span>
                  ),
                },
                {
                  label: t("audit.detail.requestId"),
                  value: (
                    <span dir="ltr" className="font-mono text-xs">
                      {selected.requestId}
                    </span>
                  ),
                },
                { label: t("audit.columns.summary"), value: String(redact(selected.details)) },
              ]}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="text-sm font-semibold text-ink">{t("audit.detail.before")}</h3>
                <JsonBlock value={selected.before} emptyLabel={t("audit.detail.none")} />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="text-sm font-semibold text-ink">{t("audit.detail.after")}</h3>
                <JsonBlock value={selected.after} emptyLabel={t("audit.detail.none")} />
              </div>
            </div>
            <p className="text-xs text-ink-muted">{t("audit.detail.redactionNote")}</p>
          </div>
        )}
      </Dialog>
    </>
  );
}
