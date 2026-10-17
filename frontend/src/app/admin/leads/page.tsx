"use client";

import { Eye, Plus, Upload, UserPlus, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { AssignLeadDialog } from "@/components/sales/assign-dialog";
import { CreateLeadDialog } from "@/components/sales/create-lead-dialog";
import { ImportCsvDialog } from "@/components/sales/import-csv-dialog";
import { AgentCell, LeadStatusBadge, useSalesFormat } from "@/components/sales/shared";
import { useSalesStore } from "@/components/sales/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { AGENTS, LEAD_STATUSES, type Lead, type LeadStatus } from "@/mock/leads";

const UNASSIGNED = "__unassigned";

// covers: LEAD-001, LEAD-002 (admin lead list, create, manual assignment)
export default function LeadsPage() {
  const t = useT("sales");
  const tc = useT();
  const f = useSalesFormat();
  const router = useRouter();
  const { can } = useAdmin();
  const { leads } = useSalesStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");
  const [assigning, setAssigning] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  const canAssign = can("leads.assign");
  const canManage = can("leads.manage");
  const filtered = query.trim() !== "" || status !== "all" || assignee !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return leads
      .filter((l) => {
        if (status !== "all" && l.status !== status) return false;
        if (assignee === UNASSIGNED && l.assigneeId !== null) return false;
        if (assignee !== "all" && assignee !== UNASSIGNED && l.assigneeId !== assignee) return false;
        if (!q) return true;
        return (
          l.name.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.email?.toLowerCase().includes(q) ?? false) ||
          l.interest.en.toLowerCase().includes(q) ||
          l.interest.ar.includes(q) ||
          (digits.length > 0 && l.phone.replace(/\D/g, "").includes(digits))
        );
      })
      .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  }, [leads, query, status, assignee]);

  const columns: Column<Lead>[] = [
    {
      key: "id",
      header: t("columns.id"),
      cell: (l) => (
        <span dir="ltr" className="font-mono text-xs whitespace-nowrap text-ink-muted">
          {l.id}
        </span>
      ),
      sortValue: (l) => l.id,
    },
    { key: "name", header: t("columns.name"), cell: (l) => <span className="font-medium">{l.name}</span>, sortValue: (l) => l.name },
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
      cell: (l) => <span className="line-clamp-2 max-w-64 text-ink-muted">{f.loc(l.interest)}</span>,
      hideOnMobile: true,
    },
    {
      key: "assignee",
      header: t("columns.assignee"),
      cell: (l) => <AgentCell agentId={l.assigneeId} />,
      sortValue: (l) => AGENTS.find((a) => a.id === l.assigneeId)?.name ?? "",
    },
    { key: "status", header: t("columns.status"), cell: (l) => <LeadStatusBadge status={l.status} /> },
    {
      key: "activity",
      header: t("columns.lastActivity"),
      cell: (l) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(l.lastActivityAt)}</span>,
      sortValue: (l) => l.lastActivityAt,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (l) => (
        <ActionMenu
          label={t("leads.rowActions", { name: l.name })}
          items={[
            { label: tc("actions.view"), icon: <Eye />, onSelect: () => router.push(`/admin/leads/${l.id}`) },
            ...(canAssign
              ? [
                  {
                    label: l.assigneeId ? tc("actions.reassign") : tc("actions.assign"),
                    icon: l.assigneeId ? <UserRoundCog /> : <UserPlus />,
                    onSelect: () => setAssigning(l),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("leads.title")}
        description={t("leads.description", { count: f.number(leads.length) })}
        breadcrumbs={[{ label: t("breadcrumbs.sales") }, { label: t("leads.title") }]}
        actions={
          canManage && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setImporting(true)}>
                <Upload aria-hidden="true" />
                {t("leads.importCsv")}
              </Button>
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus aria-hidden="true" />
                {t("leads.create")}
              </Button>
            </>
          )
        }
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("leads.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-52" aria-label={t("filters.status")} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}>
          <option value="all">{t("filters.allStatuses")}</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-52" aria-label={t("filters.assignee")} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="all">{t("filters.allAssignees")}</option>
          <option value={UNASSIGNED}>{t("common.unassigned")}</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setAssignee("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("filters.results", { count: f.number(rows.length) })}</span>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(l) => l.id}
        onRowClick={(l) => router.push(`/admin/leads/${l.id}`)}
        filtered={filtered}
        emptyTitle={t("leads.empty")}
        emptyAction={
          canManage ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus aria-hidden="true" />
              {t("leads.create")}
            </Button>
          ) : undefined
        }
      />
      <AssignLeadDialog lead={assigning} onClose={() => setAssigning(null)} />
      <CreateLeadDialog open={creating} onClose={() => setCreating(false)} />
      <ImportCsvDialog open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
