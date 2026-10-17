"use client";

import { AlertTriangle, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat } from "@/components/recruitment/use-format";
import { QuestionDialog, type QuestionDraft } from "@/components/training/question-dialog";
import { nextId, useQuestions, useQuizConfig } from "@/components/training/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select, Switch } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import type { QuizQuestion } from "@/mock/training";

type ActiveFilter = "all" | "active" | "inactive";

// covers: QUIZ-001
export default function QuestionBankPage() {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("quiz.manage");
  const [questions, setQuestions] = useQuestions();
  const [{ config }] = useQuizConfig();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [editing, setEditing] = useState<QuizQuestion | "new" | null>(null);

  const activeCount = questions.filter((q) => q.active).length;
  const filtered = query.trim() !== "" || activeFilter !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((x) => {
      if (activeFilter === "active" && !x.active) return false;
      if (activeFilter === "inactive" && x.active) return false;
      return !q || x.text.en.toLowerCase().includes(q) || x.text.ar.includes(q);
    });
  }, [questions, query, activeFilter]);

  const toggleReveal = (id: string) =>
    setRevealed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setActive = (question: QuizQuestion, active: boolean) => {
    setQuestions((all) => all.map((x) => (x.id === question.id ? { ...x, active } : x)));
    toast(t(active ? "questions.toast.activated" : "questions.toast.deactivated"));
  };

  const save = (draft: QuestionDraft) => {
    if (editing === "new") {
      setQuestions((all) => [...all, { id: nextId("q", all), ...draft }]);
      toast(t("questions.toast.created"));
    } else if (editing) {
      const id = editing.id;
      setQuestions((all) => all.map((x) => (x.id === id ? { ...x, ...draft } : x)));
      toast(t("questions.toast.updated"));
    }
    setEditing(null);
  };

  const columns: Column<QuizQuestion>[] = [
    {
      key: "question",
      header: t("questions.columns.question"),
      cell: (q) => <span className="line-clamp-2 min-w-60 text-ink">{f.loc(q.text)}</span>,
      sortValue: (q) => f.loc(q.text),
    },
    {
      key: "answer",
      header: t("questions.columns.answer"),
      className: "min-w-56",
      cell: (q) => {
        const shown = revealed.has(q.id);
        return (
          <span className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2"
              aria-pressed={shown}
              aria-label={`${shown ? t("questions.hide") : t("questions.show")} — ${t("questions.correctAnswer")}`}
              onClick={() => toggleReveal(q.id)}
            >
              {shown ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {shown ? t("questions.hide") : t("questions.show")}
            </Button>
            {shown ? (
              <span className="text-sm text-success">{f.loc(q.options[q.correctIndex])}</span>
            ) : (
              <span className="text-ink-muted" aria-hidden="true">
                ••••••
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "active",
      header: t("questions.columns.active"),
      className: "w-24",
      cell: (q) => (
        <Switch
          checked={q.active}
          onCheckedChange={(v) => setActive(q, v)}
          label={t("questions.toggleActive")}
          disabled={!canManage}
        />
      ),
      sortValue: (q) => (q.active ? 0 : 1),
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-16 text-end",
      cell: (q) =>
        canManage ? (
          <ActionMenu items={[{ label: tc("actions.edit"), icon: <Pencil />, onSelect: () => setEditing(q) }]} />
        ) : null,
    },
  ];

  const createButton = canManage ? (
    <Button onClick={() => setEditing("new")}>
      <Plus aria-hidden="true" />
      {t("questions.create")}
    </Button>
  ) : null;

  return (
    <>
      <PageHeader
        title={t("questions.title")}
        description={t("questions.description")}
        breadcrumbs={[{ label: t("breadcrumbs.training") }, { label: t("questions.title") }]}
        actions={createButton}
      />
      {activeCount < config.questionCount && (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          {t("questions.shortage", { active: activeCount, count: config.questionCount })}
        </div>
      )}
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("questions.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="sm:w-48"
          aria-label={t("fields.active")}
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
        >
          <option value="all">{t("questions.all")}</option>
          <option value="active">{t("questions.activeOnly")}</option>
          <option value="inactive">{t("questions.inactiveOnly")}</option>
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setActiveFilter("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">
          {t("questions.results", { count: rows.length })} ·{" "}
          {t("questions.activeSummary", { active: activeCount, total: questions.length })}
        </span>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(q) => q.id}
        filtered={filtered}
        emptyTitle={t("questions.empty")}
        emptyAction={createButton}
        pageSize={10}
      />

      {editing && (
        <QuestionDialog
          key={editing === "new" ? "new" : editing.id}
          question={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}
