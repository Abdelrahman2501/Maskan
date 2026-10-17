/** Role → permission matrix from specs/02-user-roles-and-permissions.md §4 (prototype copy). */
export const ROLES = ["super_admin", "recruiter", "training_admin", "sales_manager", "property_manager"] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "applicants.read"
  | "identity.review"
  | "interviews.review"
  | "applications.decide"
  | "training.manage"
  | "quiz.manage"
  | "quiz.results.read"
  | "properties.manage"
  | "prices.manage"
  | "leads.manage"
  | "leads.assign"
  | "leads.read_all"
  | "reports.read"
  | "users.manage"
  | "roles.manage"
  | "audit.read"
  | "settings.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "applicants.read",
  "identity.review",
  "interviews.review",
  "applications.decide",
  "training.manage",
  "quiz.manage",
  "quiz.results.read",
  "properties.manage",
  "prices.manage",
  "leads.manage",
  "leads.assign",
  "leads.read_all",
  "reports.read",
  "users.manage",
  "roles.manage",
  "audit.read",
  "settings.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  recruiter: [
    "applicants.read",
    "identity.review",
    "interviews.review",
    "applications.decide",
    "quiz.results.read",
    "reports.read",
  ],
  training_admin: ["applicants.read", "training.manage", "quiz.manage", "quiz.results.read", "reports.read"],
  sales_manager: ["leads.manage", "leads.assign", "leads.read_all", "reports.read"],
  property_manager: ["properties.manage", "prices.manage", "reports.read"],
};
