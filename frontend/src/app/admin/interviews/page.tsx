"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { IdentityStatusBadge, InterviewStatusBadge } from "@/components/recruitment/badges";
import { ApplicantCell } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/i18n/use-t";
import {
  INTERVIEWS,
  getApplicant,
  identityForApplicant,
  type Applicant,
  type InterviewStatus,
  type InterviewSubmission,
} from "@/mock/recruitment";

type Row = InterviewSubmission & { applicant: Applicant };
const TABS: InterviewStatus[] = ["pending", "accepted", "rejected", "reopened"];

const ALL_ROWS: Row[] = INTERVIEWS.flatMap((s) => {
  const applicant = getApplicant(s.applicantId);
  return applicant ? [{ ...s, applicant }] : [];
});

export default function InterviewsPage() {
  const t = useT("recruitment");
  const tc = useT();
  const f = useFormat();
  const router = useRouter();
  const [tab, setTab] = useState<InterviewStatus>("pending");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((s) => [s, ALL_ROWS.filter((r) => r.status === s).length])) as Record<InterviewStatus, number>,
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ROWS.filter(
      (r) =>
        r.status === tab &&
        (!q || r.applicant.name.en.toLowerCase().includes(q) || r.applicant.name.ar.includes(q) || r.applicant.email.includes(q)),
    ).sort((a, b) =>
      tab === "pending" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt),
    );
  }, [tab, query]);

  const columns: Column<Row>[] = [
    { key: "applicant", header: t("columns.applicant"), cell: (r) => <ApplicantCell applicant={r.applicant} />, sortValue: (r) => r.applicant.name.en },
    {
      key: "submitted",
      header: t("columns.submitted"),
      cell: (r) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(r.submittedAt)}</span>,
      sortValue: (r) => r.submittedAt,
    },
    {
      key: "duration",
      header: t("columns.duration"),
      cell: (r) => <span className="tabular-nums text-ink">{f.duration(r.durationSec)}</span>,
      sortValue: (r) => r.durationSec,
    },
    {
      key: "identity",
      header: t("columns.identity"),
      cell: (r) => {
        const idv = identityForApplicant(r.applicantId);
        return idv ? <IdentityStatusBadge status={idv.status} /> : <span className="text-ink-muted">—</span>;
      },
      hideOnMobile: true,
    },
    { key: "status", header: t("columns.status"), cell: (r) => <InterviewStatusBadge status={r.status} />, hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader
        title={t("interviews.title")}
        description={t("interviews.description")}
        breadcrumbs={[{ label: t("breadcrumbs.recruitment") }, { label: t("interviews.title") }]}
      />
      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={TABS.map((s) => ({ value: s, label: t(`interviews.tabs.${s}`), count: counts[s] }))}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("identity.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/interviews/${r.id}`)}
        filtered={query.trim() !== ""}
        emptyTitle={t(`interviews.empty.${tab}`)}
      />
    </>
  );
}
