"use client";

import { CheckCircle2, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { LeadStatusBadge, useSalesFormat } from "@/components/sales/shared";
import { assignLeads, openLeadCount, useSalesStore } from "@/components/sales/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { Avatar, PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { AGENTS, agentById, type Lead } from "@/mock/leads";

// covers: LEAD-002 (bulk manual assignment of unassigned leads)
export default function AssignmentsPage() {
  const t = useT("sales");
  const f = useSalesFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const { leads } = useSalesStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [agentId, setAgentId] = useState("");
  const [confirming, setConfirming] = useState(false);

  const canAssign = can("leads.assign");
  const unassigned = useMemo(
    () => leads.filter((l) => l.assigneeId === null).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [leads],
  );
  const selectedIds = unassigned.filter((l) => selected.has(l.id)).map((l) => l.id);
  const allSelected = unassigned.length > 0 && selectedIds.length === unassigned.length;
  const agent = agentById(agentId);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirm = () => {
    if (!agent) return;
    const count = assignLeads(selectedIds, agent.id, user.name);
    toast(t("assignments.toast", { count: f.number(count), agent: agent.name }));
    setSelected(new Set());
    setConfirming(false);
  };

  const columns: Column<Lead>[] = [
    {
      key: "select",
      header: "",
      className: "w-10",
      cell: (l) => (
        <input
          type="checkbox"
          className="size-4 accent-navy"
          aria-label={t("assignments.selectRow", { name: l.name })}
          checked={selected.has(l.id)}
          disabled={!canAssign}
          onChange={() => toggle(l.id)}
        />
      ),
    },
    {
      key: "lead",
      header: t("columns.lead"),
      cell: (l) => (
        <Link href={`/admin/leads/${l.id}`} className="block min-w-0 hover:underline">
          <span className="block font-medium text-ink">{l.name}</span>
          <span dir="ltr" className="block font-mono text-xs text-ink-muted">
            {l.id}
          </span>
        </Link>
      ),
      sortValue: (l) => l.name,
    },
    {
      key: "phone",
      header: t("columns.phone"),
      cell: (l) => (
        <span dir="ltr" className="whitespace-nowrap text-ink-muted tabular-nums">
          {l.phone}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "interest",
      header: t("columns.interest"),
      cell: (l) => <span className="line-clamp-2 max-w-72 text-ink-muted">{f.loc(l.interest)}</span>,
      hideOnMobile: true,
    },
    { key: "source", header: t("columns.source"), cell: (l) => <span className="text-ink-muted">{f.loc(l.source)}</span>, hideOnMobile: true },
    { key: "status", header: t("columns.status"), cell: (l) => <LeadStatusBadge status={l.status} /> },
    {
      key: "created",
      header: t("columns.created"),
      cell: (l) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(l.createdAt)}</span>,
      sortValue: (l) => l.createdAt,
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("assignments.title")}
        description={t("assignments.description")}
        breadcrumbs={[{ label: t("breadcrumbs.sales") }, { label: t("assignments.title") }]}
      />

      {!canAssign && (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-warning/12 px-4 py-3 text-sm text-warning">
          <Lock className="size-4 shrink-0" aria-hidden="true" />
          {t("assignments.noPermission")}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="size-4 accent-navy"
                checked={allSelected}
                disabled={!canAssign || unassigned.length === 0}
                onChange={() => setSelected(allSelected ? new Set() : new Set(unassigned.map((l) => l.id)))}
              />
              {t("assignments.selectAll")}
            </label>
            <span className="text-sm text-ink-muted">{t("assignments.selected", { count: f.number(selectedIds.length) })}</span>
            <div className="flex flex-col gap-2 sm:ms-auto sm:flex-row sm:items-center">
              <Select
                className="sm:w-64"
                aria-label={t("assign.agent")}
                value={agentId}
                disabled={!canAssign}
                onChange={(e) => setAgentId(e.target.value)}
              >
                <option value="">{t("assign.agentPlaceholder")}</option>
                {AGENTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {t("assign.agentOption", { name: a.name, count: f.number(openLeadCount(leads, a.id)) })}
                  </option>
                ))}
              </Select>
              <Button disabled={!canAssign || !agent || selectedIds.length === 0} onClick={() => setConfirming(true)}>
                <UserPlus aria-hidden="true" />
                {t("assignments.assignSelected")}
              </Button>
            </div>
          </div>

          {unassigned.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-ink">{t("assignments.empty")}</p>
              <p className="text-sm text-ink-muted">{t("assignments.emptyBody")}</p>
            </Card>
          ) : (
            <DataTable columns={columns} rows={unassigned} getRowId={(l) => l.id} />
          )}
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-base font-semibold text-ink">{t("assignments.workloadTitle")}</h2>
          <p className="mt-1 text-xs text-ink-muted">{t("assignments.workloadHint")}</p>
          <ul className="mt-4 flex flex-col gap-1">
            {AGENTS.map((a) => {
              const count = openLeadCount(leads, a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    disabled={!canAssign}
                    onClick={() => setAgentId(a.id)}
                    aria-pressed={agentId === a.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-start text-sm hover:bg-background disabled:pointer-events-none",
                      agentId === a.id && "bg-navy/8 ring-1 ring-navy/20",
                    )}
                  >
                    <Avatar name={a.name} className="size-7 text-[10px]" />
                    <span className="min-w-0 flex-1 truncate text-ink">{a.name}</span>
                    <span className="rounded-full bg-background px-2 text-xs text-ink-muted tabular-nums">
                      {t("assignments.openCount", { count: f.number(count) })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={confirming && !!agent}
        onClose={() => setConfirming(false)}
        onConfirm={confirm}
        title={t("assignments.confirmTitle")}
        description={agent ? t("assignments.confirmBody", { count: f.number(selectedIds.length), agent: agent.name }) : undefined}
        confirmLabel={t("assignments.assignSelected")}
      >
        <p className="text-xs text-ink-muted">{t("assign.appendOnlyNote")}</p>
      </ConfirmDialog>
    </>
  );
}
