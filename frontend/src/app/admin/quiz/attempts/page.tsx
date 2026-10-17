"use client";

import { Award, ClipboardList, Percent, TimerOff } from "lucide-react";
import { useMemo, useState } from "react";

import { ApplicantCell } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/input";
import { FilterBar, PageHeader, SearchInput, StatCard } from "@/components/ui/page";
import { Tabs } from "@/components/ui/tabs";
import { useT } from "@/i18n/use-t";
import { getApplicant } from "@/mock/recruitment";
import { QUALIFICATIONS, QUIZ_ATTEMPTS, isPassed, type QualificationRecord, type QuizAttempt } from "@/mock/training";

type Tab = "attempts" | "qualifications";
type ResultFilter = "all" | "passed" | "failed";

function ApplicantById({ id }: { id: string }) {
  const applicant = getApplicant(id);
  return applicant ? <ApplicantCell applicant={applicant} href={`/admin/applicants/${id}`} /> : <span>{id}</span>;
}

function matches(applicantId: string, q: string) {
  if (!q) return true;
  const a = getApplicant(applicantId);
  return !!a && (a.name.en.toLowerCase().includes(q) || a.name.ar.includes(q) || a.email.toLowerCase().includes(q));
}

// covers: QUIZ-006, QUIZ-008
export default function AttemptsPage() {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const [tab, setTab] = useState<Tab>("attempts");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResultFilter>("all");

  const q = query.trim().toLowerCase();
  const filtered = q !== "" || (tab === "attempts" && result !== "all");

  const attempts = useMemo(
    () =>
      QUIZ_ATTEMPTS.filter((a) => {
        if (result === "passed" && !isPassed(a)) return false;
        if (result === "failed" && isPassed(a)) return false;
        return matches(a.applicantId, q);
      }).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [result, q],
  );

  const qualifications = useMemo(
    () =>
      QUALIFICATIONS.filter((r) => matches(r.applicantId, q)).sort((a, b) => b.qualifiedAt.localeCompare(a.qualifiedAt)),
    [q],
  );

  const passedCount = QUIZ_ATTEMPTS.filter(isPassed).length;
  const expiredCount = QUIZ_ATTEMPTS.filter((a) => a.outcome === "expired").length;
  const passRate = QUIZ_ATTEMPTS.length ? (passedCount / QUIZ_ATTEMPTS.length) * 100 : 0;

  const attemptColumns: Column<QuizAttempt>[] = [
    {
      key: "applicant",
      header: t("attempts.columns.applicant"),
      cell: (a) => <ApplicantById id={a.applicantId} />,
      sortValue: (a) => f.loc(getApplicant(a.applicantId)?.name),
    },
    {
      key: "attempt",
      header: t("attempts.columns.attempt"),
      cell: (a) => <span className="tabular-nums">#{f.number(a.attemptNo)}</span>,
      sortValue: (a) => a.attemptNo,
    },
    {
      key: "started",
      header: t("attempts.columns.started"),
      cell: (a) => <span className="whitespace-nowrap text-ink-muted">{f.dateTime(a.startedAt)}</span>,
      sortValue: (a) => a.startedAt,
      hideOnMobile: true,
    },
    {
      key: "ended",
      header: t("attempts.columns.ended"),
      cell: (a) => (
        <span className="flex flex-col items-start gap-1">
          <Badge tone={a.outcome === "expired" ? "warning" : "info"}>{t(`attempts.${a.outcome}`)}</Badge>
          <span className="whitespace-nowrap text-xs text-ink-muted">{f.dateTime(a.endedAt)}</span>
        </span>
      ),
      sortValue: (a) => a.endedAt,
      hideOnMobile: true,
    },
    {
      key: "score",
      header: t("attempts.columns.score"),
      cell: (a) => (
        <span className="whitespace-nowrap tabular-nums">
          <span dir="ltr" className="font-medium">
            {t("attempts.score", { correct: f.number(a.correct), total: f.number(a.total) })}
          </span>
          <span className="ms-1.5 text-ink-muted">· {f.percent((a.correct / a.total) * 100)}</span>
        </span>
      ),
      sortValue: (a) => a.correct / a.total,
    },
    {
      key: "result",
      header: t("attempts.columns.result"),
      cell: (a) => {
        const passed = isPassed(a);
        return (
          <Badge tone={passed ? "success" : "error"}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {passed ? t("attempts.passed") : t("attempts.failed")}
          </Badge>
        );
      },
    },
    {
      key: "duration",
      header: t("attempts.columns.duration"),
      cell: (a) => <span className="text-ink-muted tabular-nums">{f.duration(a.durationSec)}</span>,
      sortValue: (a) => a.durationSec,
      hideOnMobile: true,
    },
  ];

  const qualificationColumns: Column<QualificationRecord>[] = [
    {
      key: "applicant",
      header: t("attempts.columns.applicant"),
      cell: (r) => <ApplicantById id={r.applicantId} />,
      sortValue: (r) => f.loc(getApplicant(r.applicantId)?.name),
    },
    {
      key: "qualifiedAt",
      header: t("attempts.columns.qualifiedAt"),
      cell: (r) => <span className="whitespace-nowrap text-ink-muted">{f.date(r.qualifiedAt)}</span>,
      sortValue: (r) => r.qualifiedAt,
    },
    {
      key: "attemptsUsed",
      header: t("attempts.columns.attemptsUsed"),
      cell: (r) => <span className="tabular-nums">{f.number(r.attemptsUsed)}</span>,
      sortValue: (r) => r.attemptsUsed,
      hideOnMobile: true,
    },
    {
      key: "bestScore",
      header: t("attempts.columns.bestScore"),
      cell: (r) => (
        <span dir="ltr" className="tabular-nums">
          {t("attempts.score", { correct: f.number(r.bestScore), total: f.number(10) })}
        </span>
      ),
      sortValue: (r) => r.bestScore,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("attempts.title")}
        description={t("attempts.description")}
        breadcrumbs={[{ label: t("breadcrumbs.training") }, { label: t("attempts.title") }]}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("attempts.stats.total")} value={f.number(QUIZ_ATTEMPTS.length)} icon={ClipboardList} />
        <StatCard label={t("attempts.stats.passRate")} value={f.percent(passRate)} icon={Percent} tone="info" />
        <StatCard label={t("attempts.stats.qualified")} value={f.number(QUALIFICATIONS.length)} icon={Award} tone="success" />
        <StatCard label={t("attempts.stats.expired")} value={f.number(expiredCount)} icon={TimerOff} tone="warning" />
      </div>

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: "attempts", label: t("attempts.tabs.attempts"), count: QUIZ_ATTEMPTS.length },
          { value: "qualifications", label: t("attempts.tabs.qualifications"), count: QUALIFICATIONS.length },
        ]}
      />

      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("attempts.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {tab === "attempts" && (
          <Select
            className="sm:w-48"
            aria-label={t("attempts.columns.result")}
            value={result}
            onChange={(e) => setResult(e.target.value as ResultFilter)}
          >
            <option value="all">{t("attempts.allResults")}</option>
            <option value="passed">{t("attempts.passed")}</option>
            <option value="failed">{t("attempts.failed")}</option>
          </Select>
        )}
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setResult("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        {tab === "attempts" && (
          <span className="text-sm text-ink-muted sm:ms-auto">{t("attempts.results", { count: attempts.length })}</span>
        )}
      </FilterBar>

      {tab === "attempts" ? (
        <DataTable
          columns={attemptColumns}
          rows={attempts}
          getRowId={(a) => a.id}
          filtered={filtered}
          emptyTitle={t("attempts.empty")}
        />
      ) : (
        <DataTable
          columns={qualificationColumns}
          rows={qualifications}
          getRowId={(r) => r.applicantId}
          filtered={filtered}
          emptyTitle={t("attempts.qualificationsEmpty")}
        />
      )}
    </>
  );
}
