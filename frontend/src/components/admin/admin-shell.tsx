"use client";

import { Bell, ChevronsLeft, LogOut, Menu, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { LanguageSwitch } from "@/components/brand/language-switch";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

import { AdminProvider, useAdmin } from "./admin-context";
import { NAV_GROUPS, navItemForPath, type NavItem } from "./nav-config";
import { ROLES, type Role } from "./permissions";

function useVisibleGroups() {
  const { can } = useAdmin();
  const visible = (item: NavItem) => !item.permissions || item.permissions.some(can);
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter(visible) })).filter((g) => g.items.length > 0);
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const t = useT("shell");
  const pathname = usePathname();
  const groups = useVisibleGroups();
  const active = navItemForPath(pathname);

  return (
    <nav aria-label={t("adminTitle")} className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.key} className="mb-5">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-white/45 uppercase">
              {t(`groups.${group.key}`)}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = active?.href === item.href;
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? t(`nav.${item.key}`) : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      isActive ? "bg-white/12 font-medium text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const ts = useT("shell");
  const { role, setRole } = useAdmin();
  const router = useRouter();
  return (
    <label className={cn("flex flex-col gap-1", compact && "w-full")}>
      <span className="text-[11px] font-semibold tracking-wider text-white/45 uppercase">
        {t("prototype.roleSwitcher")}
      </span>
      <select
        value={role}
        onChange={(e) => {
          setRole(e.target.value as Role);
          router.push("/admin");
        }}
        className="h-9 rounded-sm border border-white/15 bg-white/8 px-2 text-sm text-white focus:outline-none [&>option]:text-ink"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ts(`roles.${r}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NotificationsButton() {
  const t = useT("shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("header.notifications")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-9 place-items-center rounded-md text-ink-muted hover:bg-background hover:text-ink"
      >
        <Bell className="size-5" />
        <span className="absolute end-2 top-2 size-2 rounded-full bg-error ring-2 ring-surface" />
      </button>
      {open && (
        <div className="absolute end-0 z-40 mt-2 w-80 rounded-lg border border-border bg-surface shadow-elevated">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">{t("notifications.title")}</p>
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => setOpen(false)}>
              {t("notifications.markAll")}
            </button>
          </div>
          <ul className="divide-y divide-border">
            {["n1", "n2", "n3"].map((id) => (
              <li key={id} className="px-4 py-3 text-sm text-ink">
                {t(`notifications.items.${id}`)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const t = useT();
  const ts = useT("shell");
  const { user, role } = useAdmin();
  return (
    <div className="flex items-center gap-3">
      <Avatar name={user.name} />
      <div className="hidden min-w-0 leading-tight md:block">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="truncate text-xs text-ink-muted">{ts(`roles.${role}`)}</p>
      </div>
      <Link href="/login" aria-label={t("actions.logout")} className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-background hover:text-error">
        <LogOut className="size-4.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}

function ForbiddenGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { can } = useAdmin();
  const t = useT();
  const item = navItemForPath(pathname);
  const allowed = !item?.permissions || item.permissions.some(can);
  if (allowed) return <>{children}</>;
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-error/10 text-error">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-semibold text-ink">{t("states.forbiddenTitle")}</h1>
      <p className="text-sm text-ink-muted">{t("states.forbiddenBody")}</p>
      <Link href="/admin" className={buttonVariants({ variant: "secondary" })}>
        {t("actions.back")}
      </Link>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const t = useT("shell");
  const tc = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-navy text-white transition-[width] lg:flex",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-white/10 px-5", collapsed && "justify-center px-0")}>
          {collapsed ? <Logo tone="light" iconOnly /> : <Logo tone="light" />}
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="flex flex-col gap-3 border-t border-white/10 p-4">
          {!collapsed && <RoleSwitcher />}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t("header.expand") : t("header.collapse")}
            className="flex items-center justify-center gap-2 rounded-md py-1.5 text-xs text-white/60 hover:bg-white/6 hover:text-white"
          >
            <ChevronsLeft className={cn("size-4 transition-transform", collapsed ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-deep/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 start-0 flex w-[280px] flex-col bg-navy text-white shadow-elevated">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Logo tone="light" />
              <button type="button" onClick={() => setMobileOpen(false)} aria-label={tc("actions.close")} className="text-white/70">
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-white/10 p-4">
              <RoleSwitcher compact />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-warning/12 px-4 py-1.5 text-center text-xs font-medium text-warning">{tc("prototype.banner")}</div>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("header.openMenu")}
            className="grid size-9 place-items-center rounded-md text-ink hover:bg-background lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <p className="text-sm font-semibold text-ink lg:hidden">{t("adminTitle")}</p>
          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitch className="hidden sm:inline-flex" />
            <NotificationsButton />
            <span className="h-6 w-px bg-border" aria-hidden="true" />
            <AccountMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <ForbiddenGuard>{children}</ForbiddenGuard>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
