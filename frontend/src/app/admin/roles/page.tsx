"use client";

import { Check, Lock, Minus, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLES, type Permission, type Role } from "@/components/admin/permissions";
import { permissionKey } from "@/components/administration/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { USERS } from "@/mock/administration";

/** Permissions marked 🔒 in specs/02 §3: every use is written to the audit log. */
const AUDITED: Permission[] = [
  "identity.review",
  "interviews.review",
  "applications.decide",
  "quiz.manage",
  "prices.manage",
  "leads.assign",
  "users.manage",
  "roles.manage",
  "settings.manage",
];

type Matrix = Record<Role, Permission[]>;

const countChanges = (a: Matrix, b: Matrix) =>
  ROLES.reduce((n, r) => n + ALL_PERMISSIONS.filter((p) => a[r].includes(p) !== b[r].includes(p)).length, 0);

export default function RolesPage() {
  const t = useT("administration");
  const ts = useT("shell");
  const tc = useT();
  const toast = useToast();
  const { can } = useAdmin();
  const editable = can("roles.manage");

  const [saved, setSaved] = useState<Matrix>(ROLE_PERMISSIONS);
  const [draft, setDraft] = useState<Matrix>(ROLE_PERMISSIONS);
  const [confirming, setConfirming] = useState(false);

  const changes = countChanges(saved, draft);

  const members = useMemo(
    () =>
      Object.fromEntries(
        ROLES.map((r) => {
          const holders = USERS.filter((u) => u.roles.includes(r));
          return [r, { total: holders.length, active: holders.filter((u) => u.status === "active").length }];
        }),
      ) as Record<Role, { total: number; active: number }>,
    [],
  );

  const toggle = (role: Role, perm: Permission) => {
    if (!editable || role === "super_admin") return;
    setDraft((m) => ({
      ...m,
      [role]: m[role].includes(perm) ? m[role].filter((p) => p !== perm) : ALL_PERMISSIONS.filter((p) => p === perm || m[role].includes(p)),
    }));
  };

  return (
    <>
      <PageHeader
        title={t("roles.title")}
        description={t("roles.description")}
        breadcrumbs={[{ label: ts("groups.administration") }, { label: t("roles.title") }]}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ROLES.map((r) => (
          <Card key={r} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-md",
                  r === "super_admin" ? "bg-warning/12 text-warning" : "bg-navy/8 text-navy",
                )}
              >
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              {r === "super_admin" && (
                <Badge tone="neutral">
                  <Lock className="size-3" aria-hidden="true" />
                  {t("roles.locked")}
                </Badge>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-ink">{ts(`roles.${r}`)}</h2>
              <p className="mt-1 text-sm text-ink-muted">{t(`roles.descriptions.${r}`)}</p>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" aria-hidden="true" />
                {t("roles.members", { count: members[r].total })}
              </span>
              <span>{t("roles.permissionCount", { count: draft[r].length, total: ALL_PERMISSIONS.length })}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">{t("roles.matrix.title")}</h2>
          <p className="text-sm text-ink-muted">{editable ? t("roles.matrix.hintEditable") : t("roles.matrix.hintReadOnly")}</p>
        </div>
        {editable && changes > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">{t("roles.matrix.pending", { count: changes })}</span>
            <Button variant="secondary" size="sm" onClick={() => setDraft(saved)}>
              {t("common.discard")}
            </Button>
            <Button size="sm" onClick={() => setConfirming(true)}>
              {tc("actions.saveChanges")}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">{t("roles.matrix.title")}</caption>
            <thead className="border-b border-border bg-background/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {t("roles.matrix.permission")}
                </th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-3 py-3 text-center text-xs font-semibold text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      {r === "super_admin" && <Lock className="size-3" aria-label={t("roles.locked")} />}
                      {ts(`roles.${r}`)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ALL_PERMISSIONS.map((p) => (
                <tr key={p}>
                  <th scope="row" className="px-4 py-3 text-start font-normal">
                    <span className="flex items-center gap-1.5">
                      <code dir="ltr" className="font-mono text-xs font-semibold text-ink">
                        {p}
                      </code>
                      {AUDITED.includes(p) && (
                        <span title={t("roles.matrix.audited")} className="inline-flex">
                          <Lock className="size-3 text-warning" aria-label={t("roles.matrix.audited")} />
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{t(`permissions.${permissionKey(p)}`)}</span>
                  </th>
                  {ROLES.map((r) => {
                    const has = draft[r].includes(p);
                    const changed = has !== saved[r].includes(p);
                    const label = t(has ? "roles.matrix.granted" : "roles.matrix.notGranted", {
                      role: ts(`roles.${r}`),
                      permission: p,
                    });
                    const icon = has ? (
                      <Check className="size-4 text-success" aria-hidden="true" />
                    ) : (
                      <Minus className="size-4 text-border" aria-hidden="true" />
                    );
                    const interactive = editable && r !== "super_admin";
                    return (
                      <td key={r} className={cn("px-3 py-2 text-center", r === "super_admin" && "bg-background/50")}>
                        {interactive ? (
                          <button
                            type="button"
                            aria-pressed={has}
                            aria-label={label}
                            onClick={() => toggle(r, p)}
                            className={cn(
                              "inline-grid size-8 place-items-center rounded-sm border transition-colors hover:bg-background",
                              changed ? "border-accent bg-accent/10" : "border-transparent",
                            )}
                          >
                            {icon}
                          </button>
                        ) : (
                          <span className="inline-grid size-8 place-items-center" role="img" aria-label={label}>
                            {icon}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-start gap-2 border-t border-border px-4 py-3 text-xs text-ink-muted">
          <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          {t("roles.matrix.superAdminNote")}
        </p>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setSaved(draft);
          setConfirming(false);
          toast(t("roles.matrix.saved"));
        }}
        title={t("roles.matrix.confirmTitle")}
        description={t("roles.matrix.confirmBody", { count: changes })}
        confirmLabel={tc("actions.saveChanges")}
      >
        <p className="text-xs text-ink-muted">{t("common.auditedNote")}</p>
      </ConfirmDialog>
    </>
  );
}
