"use client";

import { AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Skeleton } from "./skeleton";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Return a comparable value to make the column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
  /** Hide on small screens. */
  hideOnMobile?: boolean;
};

/**
 * Data table with built-in loading (skeleton), empty, error, sorting and
 * client-side pagination states (spec 05 §7). Rows can be clickable.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  loading = false,
  error,
  onRetry,
  filtered = false,
  emptyTitle,
  emptyAction,
  pageSize = 10,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** True when filters are active (changes the empty message). */
  filtered?: boolean;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  pageSize?: number;
}) {
  const t = useT();
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-start text-xs font-semibold tracking-wide text-ink-muted uppercase",
                    col.hideOnMobile && "hidden md:table-cell",
                    col.className,
                  )}
                  aria-sort={
                    sort?.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 uppercase hover:text-ink"
                    >
                      {col.header}
                      {sort?.key === col.key &&
                        (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5", col.hideOnMobile && "hidden md:table-cell")}>
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              !error &&
              visible.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer hover:bg-background/70")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 align-middle text-ink", col.hideOnMobile && "hidden md:table-cell", col.className)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <AlertTriangle className="size-8 text-error" aria-hidden="true" />
          <p className="text-sm text-ink">{error}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {t("actions.retry")}
            </Button>
          )}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-navy/8 text-navy">
            <Inbox className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-ink">
            {filtered ? t("table.emptyFiltered") : (emptyTitle ?? t("table.empty"))}
          </p>
          {!filtered && emptyAction}
        </div>
      )}

      {!loading && !error && rows.length > pageSize && (
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm text-ink-muted">
          <span>
            {t("table.showing", {
              from: (current - 1) * pageSize + 1,
              to: Math.min(current * pageSize, sorted.length),
              total: sorted.length,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("table.previous")}
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="rtl:rotate-180" />
            </Button>
            <span className="px-2 tabular-nums">
              {current} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("table.next")}
              disabled={current >= pageCount}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
