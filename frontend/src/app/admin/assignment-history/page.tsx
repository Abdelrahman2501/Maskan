"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AgentCell, useSalesFormat } from "@/components/sales/shared";
import { useSalesStore } from "@/components/sales/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { AGENTS, type LeadAssignment } from "@/mock/leads";

const RANGES = ["all", "today", "7d", "30d"] as const;
type Range = (typeof RANGES)[number];
const RANGE_DAYS: Record<Exclude<Range, "all">, number> = { today: 1, "7d": 7, "30d": 30 };

// covers: LEAD-002 (append-only assignment log)
export default function AssignmentHistoryPage() {
  const t = useT("sales");
  const tc = useT();
  const f = useSalesFormat();
  const { leads, assignments } = useSalesStore();
  const [query, setQuery] = useState("");
  const [agent, setAgent] = useState("all");
  const [range, setRangeValue] = useState<Range>("all");
  // Cut-off is captured when the range is picked (event handler), keeping render pure.
  const [since, setSince] = useState<number | null>(null);
  const setRange = (r: Range) => {
    setRangeValue(r);
    setSince(r === "all" ? null : Date.now() - RANGE_DAYS[r] * 24 * 60 * 60 * 1000);
  };

  const filtered = query.trim() !== "" || agent !== "all" || range !== "all";
  const leadName = useMemo(() => new Map(leads.map((l) => [l.id, l.name])), [leads]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignments
      .filter((a) => {
        if (agent !== "all" && a.toAgentId !== agent && a.fromAgentId !== agent) return false;
        if (since !== null && new Date(a.assignedAt).getTime() < since) return false;
        if (!q) return true;
        return a.leadId.toLowerCase().includes(q) || (leadName.get(a.leadId) ?? "").toLowerCase().includes(q);
      })
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
  }, [assignments, agent, since, query, leadName]);

  const columns: Column<LeadAssignment>[] = [
    {
      key: "lead",
      header: t("columns.lead"),
      cell: (a) => (
        <Link href={`/admin/leads/${a.leadId}`} className="block min-w-0 hover:underline">
          <span className="block font-medium text-ink">{leadName.get(a.leadId) ?? a.leadId}</span>
          <span dir="ltr" className="block font-mono text-xs text-ink-muted">
            {a.leadId}
          </span>
        </Link>
      ),
      sortValue: (a) => leadName.get(a.leadId) ?? a.leadId,
    },
    { key: "from", header: t("columns.from"), cell: (a) => <AgentCell agentId={a.fromAgentId} /> },
    { key: "to", header: t("columns.to"), cell: (a) => <AgentCell agentId={a.toAgentId} className="font-medium" /> },
    { key: "by", header: t("columns.assignedBy"), cell: (a) => <span className="text-ink-muted">{a.assignedBy}</span>, hideOnMobile: true },
    {
      key: "at",
      header: t("columns.at"),
      cell: (a) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(a.assignedAt)}</span>,
      sortValue: (a) => a.assignedAt,
    },
    {
      key: "reason",
      header: t("columns.reason"),
      cell: (a) => <span className="text-ink-muted">{a.reason ?? (a.fromAgentId ? t("common.none") : t("history.initial"))}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("history.title")}
        description={t("history.description")}
        breadcrumbs={[{ label: t("breadcrumbs.sales") }, { label: t("history.title") }]}
      />
      <p className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
        <Lock className="size-3.5" aria-hidden="true" />
        {t("history.appendOnly")}
      </p>
      <FilterBar>
        <SearchInput
          className="sm:w-72"
          placeholder={t("history.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-52" aria-label={t("filters.agent")} value={agent} onChange={(e) => setAgent(e.target.value)}>
          <option value="all">{t("filters.allAgents")}</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select className="sm:w-48" aria-label={t("filters.dateRange")} value={range} onChange={(e) => setRange(e.target.value as Range)}>
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {t(`filters.range.${r}`)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setAgent("all");
              setRange("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("filters.results", { count: f.number(rows.length) })}</span>
      </FilterBar>
      <DataTable columns={columns} rows={rows} getRowId={(a) => a.id} filtered={filtered} emptyTitle={t("history.empty")} pageSize={15} />
    </>
  );
}
