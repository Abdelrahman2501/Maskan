"use client";

import { AlertTriangle, CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { CSV_COLUMNS, SAMPLE_IMPORT_REPORT } from "@/mock/leads";

import { useSalesFormat } from "./shared";

/**
 * CSV import (LEAD-001, optional). Q-10 is still open, so this is a
 * prototype: the dropzone does not read files; it shows a sample report.
 */
export function ImportCsvDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <ImportBody onClose={onClose} />;
}

function ImportBody({ onClose }: { onClose: () => void }) {
  const t = useT("sales");
  const tc = useT();
  const f = useSalesFormat();
  const toast = useToast();
  const [validated, setValidated] = useState(false);
  const report = SAMPLE_IMPORT_REPORT;

  const importRows = () => {
    toast(t("import.toast", { count: f.number(report.valid) }), "info");
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("import.title")}
      description={t("import.description")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          {validated ? (
            <Button onClick={importRows}>{t("import.importValid", { count: f.number(report.valid) })}</Button>
          ) : (
            <Button onClick={() => setValidated(true)}>{t("import.validateSample")}</Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="flex items-start gap-2 rounded-md bg-warning/12 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("import.pendingNote")}
        </p>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">{t("import.columnsTitle")}</h3>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {CSV_COLUMNS.map((col) => (
                  <tr key={col.key}>
                    <td className="px-3 py-2 align-top">
                      <code dir="ltr" className="font-mono text-xs text-navy">
                        {col.key}
                      </code>
                    </td>
                    <td className="px-3 py-2 text-ink-muted">{t(`import.columns.${col.key}`)}</td>
                    <td className="px-3 py-2 text-end">
                      <Badge tone={col.required ? "brand" : "neutral"}>{col.required ? t("import.required") : t("import.optional")}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!validated ? (
          <button
            type="button"
            onClick={() => setValidated(true)}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-6 py-8 text-center hover:border-accent"
          >
            <UploadCloud className="size-8 text-ink-muted" aria-hidden="true" />
            <span className="text-sm font-medium text-ink">{t("import.dropzone")}</span>
            <span className="text-xs text-ink-muted">{t("import.dropzoneHint")}</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-ink">
              <FileSpreadsheet className="size-4 text-ink-muted" aria-hidden="true" />
              <span dir="ltr" className="font-medium">
                {report.fileName}
              </span>
              <span className="text-ink-muted">· {t("import.totalRows", { count: f.number(report.total) })}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md bg-success/10 px-4 py-3 text-success">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium">{t("import.validRows", { count: f.number(report.valid) })}</span>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-error/10 px-4 py-3 text-error">
                <AlertTriangle className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium">{t("import.invalidRows", { count: f.number(report.errors.length) })}</span>
              </div>
            </div>
            <ul className="divide-y divide-border rounded-md border border-border text-sm">
              {report.errors.map((e) => (
                <li key={e.row} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                  <span className="font-medium text-ink">{t("import.row", { n: f.number(e.row) })}</span>
                  <code dir="ltr" className="font-mono text-xs text-ink-muted">
                    {e.column}
                  </code>
                  <span className="text-error">{t(`import.errors.${e.code}`)}</span>
                  {e.value && (
                    <span dir="ltr" className="text-xs text-ink-muted">
                      “{e.value}”
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-muted">{t("import.invalidSkipped")}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
