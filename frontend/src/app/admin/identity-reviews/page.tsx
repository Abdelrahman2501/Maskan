"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { IdentityStatusBadge, OcrBadge } from "@/components/recruitment/badges";
import { ApplicantCell } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import {
  IDENTITY_REVIEWS,
  getApplicant,
  maskNationalId,
  type Applicant,
  type IdentityReview,
  type IdentityStatus,
  type OcrResult,
} from "@/mock/recruitment";

type Row = IdentityReview & { applicant: Applicant };
const TABS: IdentityStatus[] = ["pending", "action_required", "approved", "rejected"];
const OCR_RESULTS: OcrResult[] = ["match", "mismatch", "low_confidence", "failed"];

const ALL_ROWS: Row[] = IDENTITY_REVIEWS.flatMap((r) => {
  const applicant = getApplicant(r.applicantId);
  return applicant ? [{ ...r, applicant }] : [];
});

export default function IdentityReviewsPage() {
  const t = useT("recruitment");
  const tc = useT();
  const f = useFormat();
  const router = useRouter();
  const [tab, setTab] = useState<IdentityStatus>("pending");
  const [query, setQuery] = useState("");
  const [ocr, setOcr] = useState<OcrResult | "all">("all");

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((s) => [s, ALL_ROWS.filter((r) => r.status === s).length])) as Record<IdentityStatus, number>,
    [],
  );

  const filtered = query.trim() !== "" || ocr !== "all";
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ROWS.filter(
      (r) =>
        r.status === tab &&
        (ocr === "all" || r.ocrResult === ocr) &&
        (!q || r.applicant.name.en.toLowerCase().includes(q) || r.applicant.name.ar.includes(q) || r.applicant.email.includes(q)),
    ).sort((a, b) =>
      // Oldest first for the work queue; newest first for finished tabs.
      tab === "pending" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt),
    );
  }, [tab, query, ocr]);

  const columns: Column<Row>[] = [
    { key: "applicant", header: t("columns.applicant"), cell: (r) => <ApplicantCell applicant={r.applicant} />, sortValue: (r) => r.applicant.name.en },
    {
      key: "submitted",
      header: t("columns.submitted"),
      cell: (r) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(r.submittedAt)}</span>,
      sortValue: (r) => r.submittedAt,
    },
    { key: "ocr", header: t("columns.ocrResult"), cell: (r) => <OcrBadge result={r.ocrResult} /> },
    {
      key: "confidence",
      header: t("columns.confidence"),
      cell: (r) =>
        r.confidence === null ? (
          <span className="text-ink-muted">—</span>
        ) : (
          <span className={cn("font-medium tabular-nums", r.confidence >= 85 ? "text-success" : r.confidence >= 65 ? "text-warning" : "text-error")}>
            {f.percent(r.confidence)}
          </span>
        ),
      sortValue: (r) => r.confidence ?? -1,
      hideOnMobile: true,
    },
    {
      key: "id",
      header: t("columns.nationalId"),
      cell: (r) => (
        <span dir="ltr" className="font-mono text-xs tracking-wider text-ink-muted">
          {maskNationalId(r.enteredId)}
        </span>
      ),
      hideOnMobile: true,
    },
    ...(tab === "pending"
      ? []
      : [
          {
            key: "status",
            header: t("columns.status"),
            cell: (r: Row) => <IdentityStatusBadge status={r.status} />,
            hideOnMobile: true,
          },
        ]),
  ];

  return (
    <>
      <PageHeader
        title={t("identity.title")}
        description={t("identity.description")}
        breadcrumbs={[{ label: t("breadcrumbs.recruitment") }, { label: t("identity.title") }]}
      />
      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={TABS.map((s) => ({ value: s, label: t(`identity.tabs.${s}`), count: counts[s] }))}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("identity.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-56" aria-label={t("filters.ocr")} value={ocr} onChange={(e) => setOcr(e.target.value as OcrResult | "all")}>
          <option value="all">{t("filters.allOcr")}</option>
          {OCR_RESULTS.map((o) => (
            <option key={o} value={o}>
              {t(`ocr.${o}`)}
            </option>
          ))}
        </Select>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/identity-reviews/${r.id}`)}
        filtered={filtered}
        emptyTitle={t(`identity.empty.${tab}`)}
      />
    </>
  );
}
