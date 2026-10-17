"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { StageBadge } from "@/components/recruitment/badges";
import { ApplicantCell } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { APPLICANTS, LIST_STAGES, type Applicant, type ApplicantStage } from "@/mock/recruitment";

export default function ApplicantsPage() {
  const t = useT("recruitment");
  const tc = useT();
  const f = useFormat();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<ApplicantStage | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = query.trim() !== "" || stage !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return APPLICANTS.filter((a) => {
      if (stage !== "all" && a.stage !== stage) return false;
      if (!q) return true;
      return (
        a.name.en.toLowerCase().includes(q) ||
        a.name.ar.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (digits.length > 0 && a.phone.replace(/\D/g, "").includes(digits))
      );
    }).sort((a, b) =>
      sort === "newest" ? b.registeredAt.localeCompare(a.registeredAt) : a.registeredAt.localeCompare(b.registeredAt),
    );
  }, [query, stage, sort]);

  const columns: Column<Applicant>[] = [
    {
      key: "name",
      header: t("columns.applicant"),
      cell: (a) => <ApplicantCell applicant={a} />,
      sortValue: (a) => a.name.en,
    },
    {
      key: "phone",
      header: t("columns.phone"),
      cell: (a) => (
        <span dir="ltr" className="whitespace-nowrap text-ink-muted tabular-nums">
          {a.phone}
        </span>
      ),
      hideOnMobile: true,
    },
    { key: "stage", header: t("columns.stage"), cell: (a) => <StageBadge stage={a.stage} /> },
    {
      key: "registered",
      header: t("columns.registered"),
      cell: (a) => <span className="whitespace-nowrap text-ink-muted">{f.date(a.registeredAt)}</span>,
      sortValue: (a) => a.registeredAt,
      hideOnMobile: true,
    },
    {
      key: "activity",
      header: t("columns.lastActivity"),
      cell: (a) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(a.lastActivityAt)}</span>,
      sortValue: (a) => a.lastActivityAt,
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("applicants.title")}
        description={t("applicants.description", { count: APPLICANTS.length })}
        breadcrumbs={[{ label: t("breadcrumbs.recruitment") }, { label: t("applicants.title") }]}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("applicants.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="sm:w-56"
          aria-label={t("filters.stage")}
          value={stage}
          onChange={(e) => setStage(e.target.value as ApplicantStage | "all")}
        >
          <option value="all">{t("filters.allStages")}</option>
          {LIST_STAGES.map((s) => (
            <option key={s} value={s}>
              {t(`stages.${s}`)}
            </option>
          ))}
        </Select>
        <Select
          className="sm:w-48"
          aria-label={t("filters.sort")}
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">{t("filters.newest")}</option>
          <option value="oldest">{t("filters.oldest")}</option>
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStage("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("filters.results", { count: rows.length })}</span>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(a) => a.id}
        onRowClick={(a) => router.push(`/admin/applicants/${a.id}`)}
        filtered={filtered}
        emptyTitle={t("applicants.empty")}
      />
    </>
  );
}
