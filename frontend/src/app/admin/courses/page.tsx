"use client";

import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat } from "@/components/recruitment/use-format";
import { CourseDialog, type CourseDraft } from "@/components/training/course-dialog";
import { PublishBadge } from "@/components/training/status-badge";
import { nextId, useCourses, useVideos } from "@/components/training/store";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import type { Course, PublishStatus } from "@/mock/training";

type StatusFilter = PublishStatus | "archived" | "all";

// covers: TRN-001
export default function CoursesPage() {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("training.manage");
  const [courses, setCourses] = useCourses();
  const [videos] = useVideos();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const [archiving, setArchiving] = useState<Course | null>(null);

  const filtered = query.trim() !== "" || status !== "all";

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; seconds: number }>();
    for (const v of videos) {
      const s = map.get(v.courseId) ?? { count: 0, seconds: 0 };
      map.set(v.courseId, { count: s.count + 1, seconds: s.seconds + v.durationSec });
    }
    return map;
  }, [videos]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter((c) => {
        if (status === "archived") return !!c.archived;
        if (c.archived) return false;
        if (status !== "all" && c.status !== status) return false;
        return !q || c.title.en.toLowerCase().includes(q) || c.title.ar.includes(q);
      })
      .sort((a, b) => a.order - b.order);
  }, [courses, query, status]);

  const save = (draft: CourseDraft) => {
    if (editing === "new") {
      setCourses((all) => [
        ...all,
        { id: nextId("c", all), ...draft, order: Math.max(0, ...all.map((c) => c.order)) + 1 },
      ]);
      toast(t("courses.toast.created"));
    } else if (editing) {
      const id = editing.id;
      setCourses((all) => all.map((c) => (c.id === id ? { ...c, ...draft } : c)));
      toast(t("courses.toast.updated"));
    }
    setEditing(null);
  };

  const confirmArchive = () => {
    if (!archiving) return;
    const id = archiving.id;
    setCourses((all) => all.map((c) => (c.id === id ? { ...c, archived: true } : c)));
    setArchiving(null);
    toast(t("courses.toast.archived"));
  };

  const restore = (course: Course) => {
    setCourses((all) => all.map((c) => (c.id === course.id ? { ...c, archived: false } : c)));
    toast(t("courses.toast.restored"));
  };

  const columns: Column<Course>[] = [
    {
      key: "order",
      header: t("courses.columns.order"),
      cell: (c) => <span className="text-ink-muted tabular-nums">{f.number(c.order)}</span>,
      sortValue: (c) => c.order,
      className: "w-20",
    },
    {
      key: "title",
      header: t("courses.columns.title"),
      cell: (c) => (
        <span className="block min-w-0">
          <span className="block font-medium text-ink">{f.loc(c.title)}</span>
          <span className="line-clamp-1 text-xs text-ink-muted">{f.loc(c.description)}</span>
        </span>
      ),
      sortValue: (c) => f.loc(c.title),
    },
    {
      key: "videos",
      header: t("courses.columns.videos"),
      cell: (c) => <span className="tabular-nums">{f.number(stats.get(c.id)?.count ?? 0)}</span>,
      sortValue: (c) => stats.get(c.id)?.count ?? 0,
    },
    {
      key: "duration",
      header: t("courses.columns.duration"),
      cell: (c) => <span className="text-ink-muted tabular-nums">{f.duration(stats.get(c.id)?.seconds ?? 0)}</span>,
      sortValue: (c) => stats.get(c.id)?.seconds ?? 0,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: t("courses.columns.status"),
      cell: (c) => <PublishBadge status={c.status} archived={c.archived} />,
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-16 text-end",
      cell: (c) =>
        canManage ? (
          <ActionMenu
            items={
              c.archived
                ? [{ label: t("courses.restore"), icon: <ArchiveRestore />, onSelect: () => restore(c) }]
                : [
                    { label: tc("actions.edit"), icon: <Pencil />, onSelect: () => setEditing(c) },
                    { label: tc("actions.archive"), icon: <Archive />, destructive: true, onSelect: () => setArchiving(c) },
                  ]
            }
          />
        ) : null,
    },
  ];

  const createButton = canManage ? (
    <Button onClick={() => setEditing("new")}>
      <Plus aria-hidden="true" />
      {t("courses.create")}
    </Button>
  ) : null;

  return (
    <>
      <PageHeader
        title={t("courses.title")}
        description={t("courses.description")}
        breadcrumbs={[{ label: t("breadcrumbs.training") }, { label: t("courses.title") }]}
        actions={createButton}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("courses.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="sm:w-48"
          aria-label={t("fields.status")}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">{t("status.all")}</option>
          <option value="published">{t("status.published")}</option>
          <option value="draft">{t("status.draft")}</option>
          <option value="archived">{t("courses.showArchived")}</option>
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("courses.results", { count: rows.length })}</span>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(c) => c.id}
        filtered={filtered}
        emptyTitle={t("courses.empty")}
        emptyAction={createButton}
      />

      {editing && (
        <CourseDialog
          key={editing === "new" ? "new" : editing.id}
          course={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={archiving !== null}
        onClose={() => setArchiving(null)}
        onConfirm={confirmArchive}
        title={t("courses.archive.title")}
        description={archiving ? t("courses.archive.description", { name: f.loc(archiving.title) }) : undefined}
        confirmLabel={t("courses.archive.confirm")}
        destructive
      />
    </>
  );
}
