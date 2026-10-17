"use client";

import { Lock, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { ROLES, type Role } from "@/components/admin/permissions";
import { UserStatusBadge } from "@/components/administration/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Checkbox, Select } from "@/components/ui/input";
import { ActionMenu, type MenuItem } from "@/components/ui/menu";
import { Avatar, FilterBar, PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { USERS, type AdminUser, type UserStatus } from "@/mock/administration";

type TypeFilter = "all" | AdminUser["type"];
type StatusFilter = "all" | UserStatus;

const isSuper = (u: AdminUser) => u.status === "active" && u.roles.includes("super_admin");

export default function UsersPage() {
  const t = useT("administration");
  const ts = useT("shell");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can } = useAdmin();
  const canUsers = can("users.manage");
  const canRoles = can("roles.manage");

  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<Role[]>([]);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);

  const activeSuperCount = users.filter(isSuper).length;
  const isLastSuper = (u: AdminUser) => isSuper(u) && activeSuperCount <= 1;

  const filtered = query.trim() !== "" || type !== "all" || status !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (type !== "all" && u.type !== type) return false;
      if (status !== "all" && u.status !== status) return false;
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query, type, status]);

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setDraftRoles(u.roles);
    setRoleError(null);
  };

  const toggleRole = (role: Role, checked: boolean) =>
    setDraftRoles((current) => (checked ? ROLES.filter((r) => r === role || current.includes(r)) : current.filter((r) => r !== role)));

  const saveRoles = () => {
    if (!editing) return;
    if (draftRoles.length === 0) {
      setRoleError(t("users.editRoles.atLeastOne"));
      return;
    }
    if (isLastSuper(editing) && !draftRoles.includes("super_admin")) {
      setRoleError(t("users.lastSuperAdmin.roles"));
      return;
    }
    setUsers((all) => all.map((u) => (u.id === editing.id ? { ...u, roles: draftRoles } : u)));
    toast(t("users.editRoles.saved", { name: editing.name }));
    setEditing(null);
  };

  const confirmStatus = () => {
    if (!statusTarget) return;
    const next: UserStatus = statusTarget.status === "active" ? "suspended" : "active";
    if (next === "suspended" && isLastSuper(statusTarget)) return;
    setUsers((all) => all.map((u) => (u.id === statusTarget.id ? { ...u, status: next } : u)));
    toast(t(next === "suspended" ? "users.suspend.done" : "users.reactivate.done", { name: statusTarget.name }));
    setStatusTarget(null);
  };

  const menuFor = (u: AdminUser): MenuItem[] => {
    const items: MenuItem[] = [];
    if (canRoles && u.type === "staff") {
      items.push({ label: t("users.actions.editRoles"), icon: <ShieldCheck />, onSelect: () => openEdit(u) });
    }
    if (canUsers) {
      if (u.status === "active") {
        const locked = isLastSuper(u);
        items.push({
          label: locked ? t("users.actions.suspendLocked") : t("users.actions.suspend"),
          icon: locked ? <Lock /> : <UserX />,
          destructive: !locked,
          disabled: locked,
          onSelect: () => setStatusTarget(u),
        });
      } else {
        items.push({ label: t("users.actions.reactivate"), icon: <UserCheck />, onSelect: () => setStatusTarget(u) });
      }
    }
    return items;
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: t("users.columns.user"),
      sortValue: (u) => u.name,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{u.name}</p>
            <p dir="ltr" className="truncate text-start text-xs text-ink-muted">
              {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: t("users.columns.type"),
      hideOnMobile: true,
      cell: (u) => <Badge tone={u.type === "staff" ? "brand" : "info"}>{t(`users.types.${u.type}`)}</Badge>,
    },
    {
      key: "roles",
      header: t("users.columns.roles"),
      hideOnMobile: true,
      cell: (u) =>
        u.roles.length === 0 ? (
          <span className="text-xs text-ink-muted">{u.type === "agent" ? t("users.agentStage") : "—"}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge key={r} tone={r === "super_admin" ? "warning" : "neutral"}>
                {ts(`roles.${r}`)}
              </Badge>
            ))}
            {isLastSuper(u) && (
              <Badge tone="neutral" title={t("users.lastSuperAdmin.hint")}>
                <Lock className="size-3" aria-hidden="true" />
                {t("users.lastSuperAdmin.badge")}
              </Badge>
            )}
          </div>
        ),
    },
    {
      key: "status",
      header: t("users.columns.status"),
      sortValue: (u) => u.status,
      cell: (u) => <UserStatusBadge status={u.status} label={t(`users.statuses.${u.status}`)} />,
    },
    {
      key: "lastLogin",
      header: t("users.columns.lastLogin"),
      hideOnMobile: true,
      sortValue: (u) => u.lastLoginAt ?? "",
      cell: (u) => (
        <span className="whitespace-nowrap text-ink-muted">{u.lastLoginAt ? f.dateTime(u.lastLoginAt) : t("users.never")}</span>
      ),
    },
  ];

  if (canUsers || canRoles) {
    columns.push({
      key: "actions",
      header: tc("table.actions"),
      className: "w-12 text-end",
      cell: (u) => {
        const items = menuFor(u);
        return items.length > 0 ? <ActionMenu items={items} label={t("users.actions.menu", { name: u.name })} /> : null;
      },
    });
  }

  const suspending = statusTarget?.status === "active";
  const editingLastSuper = editing ? isLastSuper(editing) : false;

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description", { count: users.length })}
        breadcrumbs={[{ label: ts("groups.administration") }, { label: t("users.title") }]}
      />

      {activeSuperCount <= 1 && (canUsers || canRoles) && (
        <p className="mb-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/12 px-4 py-3 text-sm text-ink">
          <Lock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          {t("users.lastSuperAdmin.notice")}
        </p>
      )}

      <FilterBar>
        <SearchInput
          className="sm:w-80"
          placeholder={t("users.searchPlaceholder")}
          aria-label={tc("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select className="sm:w-44" aria-label={t("users.filters.type")} value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
          <option value="all">{t("users.filters.allTypes")}</option>
          <option value="staff">{t("users.types.staff")}</option>
          <option value="agent">{t("users.types.agent")}</option>
        </Select>
        <Select
          className="sm:w-44"
          aria-label={t("users.filters.status")}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">{t("users.filters.allStatuses")}</option>
          <option value="active">{t("users.statuses.active")}</option>
          <option value="suspended">{t("users.statuses.suspended")}</option>
        </Select>
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setType("all");
              setStatus("all");
            }}
          >
            {tc("actions.clear")}
          </Button>
        )}
        <span className="text-sm text-ink-muted sm:ms-auto">{t("common.results", { count: rows.length })}</span>
      </FilterBar>

      <DataTable columns={columns} rows={rows} getRowId={(u) => u.id} filtered={filtered} emptyTitle={t("users.empty")} />

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={t("users.editRoles.title", { name: editing?.name ?? "" })}
        description={t("users.editRoles.description")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {tc("actions.cancel")}
            </Button>
            <Button onClick={saveRoles}>{tc("actions.saveChanges")}</Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">{t("users.columns.roles")}</legend>
          {ROLES.map((r) => {
            const locked = r === "super_admin" && editingLastSuper;
            return (
              <div key={r} className="rounded-md border border-border px-3 py-2.5">
                <Checkbox
                  label={<span className="font-medium">{ts(`roles.${r}`)}</span>}
                  checked={draftRoles.includes(r)}
                  disabled={locked}
                  onChange={(e) => {
                    toggleRole(r, e.target.checked);
                    setRoleError(null);
                  }}
                />
                <p className="mt-1 ps-6 text-xs text-ink-muted">{t(`roles.descriptions.${r}`)}</p>
                {locked && (
                  <p className="mt-1 flex items-center gap-1 ps-6 text-xs text-warning">
                    <Lock className="size-3" aria-hidden="true" />
                    {t("users.lastSuperAdmin.roles")}
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>
        {roleError && (
          <p role="alert" className="mt-3 text-sm text-error">
            {roleError}
          </p>
        )}
        <p className="mt-4 text-xs text-ink-muted">{t("common.auditedNote")}</p>
      </Dialog>

      <ConfirmDialog
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatus}
        destructive={suspending}
        title={t(suspending ? "users.suspend.title" : "users.reactivate.title", { name: statusTarget?.name ?? "" })}
        description={t(suspending ? "users.suspend.body" : "users.reactivate.body")}
        confirmLabel={t(suspending ? "users.actions.suspend" : "users.actions.reactivate")}
      >
        <p className="text-xs text-ink-muted">{t("common.auditedNote")}</p>
      </ConfirmDialog>
    </>
  );
}
