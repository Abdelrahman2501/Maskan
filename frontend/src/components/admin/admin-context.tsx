"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { createPersistedStore } from "@/lib/persisted-store";

import { ROLE_PERMISSIONS, ROLES, type Permission, type Role } from "./permissions";

/**
 * PROTOTYPE ONLY — the signed-in staff member and a role switcher so reviewers
 * can see how navigation and actions change per role. In the real app this
 * comes from GET /api/v1/auth/me and is enforced by the backend.
 */
type AdminContextValue = {
  user: { name: string; email: string };
  role: Role;
  setRole: (role: Role) => void;
  can: (permission: Permission) => boolean;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const isRole = (v: unknown): v is Role => typeof v === "string" && (ROLES as readonly string[]).includes(v);
const useStoredRole = createPersistedStore<Role>("elsakka.prototype.role", "super_admin", isRole);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useStoredRole();

  const value = useMemo<AdminContextValue>(
    () => ({
      user: { name: "Nour Salem", email: "nour.salem@elsakka.example" },
      role,
      setRole,
      can: (permission) => ROLE_PERMISSIONS[role].includes(permission),
    }),
    [role, setRole],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
