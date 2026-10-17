"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Link2, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { useFormat } from "@/components/recruitment/use-format";
import { PublishBadge } from "@/components/training/status-badge";
import { nextId, useCourses, useVideos } from "@/components/training/store";
import { VideoDialog, type VideoDraft } from "@/components/training/video-dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/menu";
import { FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import type { CourseVideo } from "@/mock/training";

// covers: TRN-002
export default function CourseVideosPage() {
  const t = useT("training");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canManage = can("training.manage");
  const [courses] = useCourses();
  const [videos, setVideos] = useVideos();
  const [courseId, setCourseId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CourseVideo | "new" | null>(null);
  const [deleting, setDeleting] = useState<CourseVideo | null>(null);

  const activeCourses = useMemo(() => courses.filter((c) => !c.archived).sort((a, b) => a.order - b.order), [courses]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const filtered = query.trim() !== "" || courseId !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos
      .filter((v) => {
        const course = courseById.get(v.courseId);
        if (!course || course.archived) return false;
        if (courseId !== "all" && v.courseId !== courseId) return false;
        return !q || v.title.en.toLowerCase().includes(q) || v.title.ar.includes(q);
      })
      .sort((a, b) => {
        const ca = courseById.get(a.courseId)?.order ?? 0;
        const cb = courseById.get(b.courseId)?.order ?? 0;
        return ca - cb || a.order - b.order;
      });
  }, [videos, courseById, courseId, query]);

  /** Siblings in display order, used to bound and apply up/down moves. */
  const siblings = (v: CourseVideo) =>
    videos.filter((x) => x.courseId === v.courseId).sort((a, b) => a.order - b.order);

  const move = (v: CourseVideo, dir: -1 | 1) => {
    const list = siblings(v);
    const i = list.findIndex((x) => x.id === v.id);
    const other = list[i + dir];
    if (!other) return;
    setVideos((all) =>
      all.map((x) => (x.id === v.id ? { ...x, order: other.order } : x.id === other.id ? { ...x, order: v.order } : x)),
    );
    toast(t("videos.toast.reordered"));
  };

  const save = (draft: VideoDraft) => {
    if (editing === "new") {
      setVideos((all) => {
        const order = Math.max(0, ...all.filter((x) => x.courseId === draft.courseId).map((x) => x.order)) + 1;
        return [...all, { id: nextId("v", all), ...draft, order }];
      });
      toast(t("videos.toast.created"));
    } else if (editing) {
      const current = editing;
      setVideos((all) => {
        const movedCourse = draft.courseId !== current.courseId;
        const order = movedCourse
          ? Math.max(0, ...all.filter((x) => x.courseId === draft.courseId).map((x) => x.order)) + 1
          : current.order;
        return all.map((x) => (x.id === current.id ? { ...x, ...draft, order } : x));
      });
      toast(t("videos.toast.updated"));
    }
    setEditing(null);
  };

  const togglePublish = (v: CourseVideo) => {
    const next = v.status === "published" ? "draft" : "published";
    setVideos((all) => all.map((x) => (x.id === v.id ? { ...x, status: next } : x)));
    toast(t(next === "published" ? "videos.toast.published" : "videos.toast.unpublished"));
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const { id, courseId: cid } = deleting;
    setVideos((all) => {
      const rest = all.filter((x) => x.id !== id);
      // Re-number the course so order stays 1..n.
      const ordered = rest.filter((x) => x.courseId === cid).sort((a, b) => a.order - b.order);
      return rest.map((x) => (x.courseId === cid ? { ...x, order: ordered.indexOf(x) + 1 } : x));
    });
    setDeleting(null);
    toast(t("videos.toast.deleted"));
  };

  const columns: Column<CourseVideo>[] = [
    {
      key: "order",
      header: t("videos.columns.order"),
      className: "w-32",
      cell: (v) => {
        const list = siblings(v);
        const i = list.findIndex((x) => x.id === v.id);
        return (
          <span className="flex items-center gap-1">
            <span className="w-6 text-ink-muted tabular-nums">{f.number(v.order)}</span>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t("videos.moveUp")}
                  title={t("videos.moveUp")}
                  disabled={i <= 0}
                  onClick={() => move(v, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t("videos.moveDown")}
                  title={t("videos.moveDown")}
                  disabled={i === list.length - 1}
                  onClick={() => move(v, 1)}
                >
                  <ArrowDown />
                </Button>
              </>
            )}
          </span>
        );
      },
    },
    {
      key: "title",
      header: t("videos.columns.title"),
      cell: (v) => {
        const Icon = v.source.kind === "upload" ? UploadCloud : Link2;
        return (
          <span className="block min-w-0">
            <span className="block font-medium text-ink">{f.loc(v.title)}</span>
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Icon className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate" dir="ltr">
                {v.source.kind === "upload" ? v.source.fileName : v.source.url}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      key: "course",
      header: t("videos.columns.course"),
      cell: (v) => <span className="text-ink-muted">{f.loc(courseById.get(v.courseId)?.title)}</span>,
      hideOnMobile: true,
    },
    {
      key: "duration",
      header: t("videos.columns.duration"),
      cell: (v) => <span className="text-ink-muted tabular-nums">{f.duration(v.durationSec)}</span>,
    },
    {
      key: "status",
      header: t("videos.columns.status"),
      cell: (v) => <PublishBadge status={v.status} />,
    },
    {
      key: "actions",
      header: tc("table.actions"),
      className: "w-16 text-end",
      cell: (v) =>
        canManage ? (
          <ActionMenu
            items={[
              { label: tc("actions.edit"), icon: <Pencil />, onSelect: () => setEditing(v) },
              v.status === "published"
                ? { label: t("videos.unpublish"), icon: <EyeOff />, onSelect: () => togglePublish(v) }
                : { label: t("videos.publish"), icon: <Eye />, onSelect: () => togglePublish(v) },
              { label: tc("actions.delete"), icon: <Trash2 />, destructive: true, onSelect: () => setDeleting(v) },
            ]}
          />
        ) : null,
    },
  ];

  const addButton =
    canManage && activeCourses.length > 0 ? (
      <Button onClick={() => setEditing("new")}>
        <Plus aria-hidden="true" />
        {t("videos.add")}
      </Button>
    ) : null;

  return (
    <>
      <PageHeader
        title={t("videos.title")}
        description={t("videos.description")}
        breadcrumbs={[{ label: t("breadcrumbs.training") }, { label: t("videos.title") }]}
        actions={addButton}
      />
      <FilterBar>
        <SearchInput
          className="sm:w-72"
          placeholder={t("videos.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="sm:w-64"
          aria-label={t("fields.course")}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="all">{t("videos.allCourses")}</option>
          {activeCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {f.loc(c.title)}
            </option>
          ))}
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCourseId("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("videos.results", { count: rows.length })}</span>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(v) => v.id}
        filtered={filtered}
        emptyTitle={t("videos.empty")}
        emptyAction={addButton}
        pageSize={25}
      />

      {editing && (
        <VideoDialog
          key={editing === "new" ? "new" : editing.id}
          video={editing === "new" ? undefined : editing}
          courses={activeCourses}
          defaultCourseId={courseId !== "all" ? courseId : undefined}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t("videos.delete.title")}
        description={deleting ? t("videos.delete.description", { name: f.loc(deleting.title) }) : undefined}
        confirmLabel={t("videos.delete.confirm")}
        destructive
      />
    </>
  );
}
