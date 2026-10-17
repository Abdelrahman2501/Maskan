"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DecisionBadge } from "@/components/recruitment/badges";
import { ApplicantCell } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import {
  DECISIONS,
  REVIEWERS,
  getApplicant,
  type Applicant,
  type DecisionKind,
  type DecisionLogEntry,
  type DecisionValue,
} from "@/mock/recruitment";

type Row = DecisionLogEntry & { applicant: Applicant };
const KINDS: DecisionKind[] = ["identity", "interview"];
const VALUES: DecisionValue[] = ["approved", "accepted", "action_required", "rejected", "reopened"];

const ALL_ROWS: Row[] = DECISIONS.flatMap((d) => {
  const applicant = getApplicant(d.applicantId);
  return applicant ? [{ ...d, applicant }] : [];
});

export default function DecisionsPage() {
  const t = useT("recruitment");
  const tc = useT();
  const f = useFormat();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<DecisionKind | "all">("all");
  const [value, setValue] = useState<DecisionValue | "all">("all");
  const [by, setBy] = useState<string>("all");

  const filtered = query.trim() !== "" || kind !== "all" || value !== "all" || by !== "all";
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ROWS.filter(
      (d) =>
        (kind === "all" || d.kind === kind) &&
        (value === "all" || d.decision === value) &&
        (by === "all" || d.decidedBy === by) &&
        (!q || d.applicant.name.en.toLowerCase().includes(q) || d.applicant.name.ar.includes(q) || d.applicant.email.includes(q)),
    );
  }, [query, kind, value, by]);

  const columns: Column<Row>[] = [
    { key: "applicant", header: t("columns.applicant"), cell: (d) => <ApplicantCell applicant={d.applicant} />, sortValue: (d) => d.applicant.name.en },
    { key: "kind", header: t("columns.kind"), cell: (d) => <span className="text-ink">{t(`decisionKind.${d.kind}`)}</span> },
    { key: "decision", header: t("columns.decision"), cell: (d) => <DecisionBadge decision={d.decision} /> },
    {
      key: "reason",
      header: t("columns.publicReason"),
      cell: (d) =>
        d.publicReason ? (
          <span className="line-clamp-2 max-w-xs text-ink-muted">{f.loc(d.publicReason)}</span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
      hideOnMobile: true,
    },
    { key: "by", header: t("columns.decidedBy"), cell: (d) => <span className="whitespace-nowrap">{d.decidedBy}</span>, sortValue: (d) => d.decidedBy, hideOnMobile: true },
    {
      key: "at",
      header: t("columns.decidedAt"),
      cell: (d) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(d.decidedAt)}</span>,
      sortValue: (d) => d.decidedAt,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("decisions.title")}
        description={t("decisions.description")}
        breadcrumbs={[{ label: t("breadcrumbs.recruitment") }, { label: t("decisions.title") }]}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-72"
          placeholder={t("identity.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-44" aria-label={t("filters.kind")} value={kind} onChange={(e) => setKind(e.target.value as DecisionKind | "all")}>
          <option value="all">{t("filters.allKinds")}</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`decisionKind.${k}`)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-48" aria-label={t("filters.decision")} value={value} onChange={(e) => setValue(e.target.value as DecisionValue | "all")}>
          <option value="all">{t("filters.allDecisions")}</option>
          {VALUES.map((v) => (
            <option key={v} value={v}>
              {t(`decisionValue.${v}`)}
            </option>
          ))}
        </Select>
        <Select className="sm:w-44" aria-label={t("filters.decidedBy")} value={by} onChange={(e) => setBy(e.target.value)}>
          <option value="all">{t("filters.anyReviewer")}</option>
          {REVIEWERS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setKind("all");
              setValue("all");
              setBy("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
      </FilterBar>
      <p className="mb-3 text-xs text-ink-muted">{t("decisions.appendOnly")}</p>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(d) => d.id}
        onRowClick={(d) => router.push(`/admin/applicants/${d.applicantId}`)}
        filtered={filtered}
        emptyTitle={t("decisions.empty")}
      />
    </>
  );
}
