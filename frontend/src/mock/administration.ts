/**
 * PROTOTYPE SAMPLE DATA — fictional staff, agents, audit entries, settings and
 * report figures. Nothing here is real or persisted.
 */
import type { Role } from "@/components/admin/permissions";

import { AGENTS, LEADS, type LeadStatus } from "./leads";

export type UserStatus = "active" | "suspended";
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  type: "staff" | "agent";
  roles: Role[];
  status: UserStatus;
  lastLoginAt: string | null;
};

export const USERS: AdminUser[] = [
  { id: "u-nour", name: "Nour Salem", email: "nour.salem@maskan.example", type: "staff", roles: ["super_admin", "sales_manager"], status: "active", lastLoginAt: "2026-10-17T07:55:00Z" },
  { id: "u-laila", name: "Laila Mahmoud", email: "laila.mahmoud@maskan.example", type: "staff", roles: ["training_admin"], status: "active", lastLoginAt: "2026-10-16T16:20:00Z" },
  { id: "u-tarek", name: "Tarek Fouad", email: "tarek.fouad@maskan.example", type: "staff", roles: ["recruiter"], status: "active", lastLoginAt: "2026-10-17T08:40:00Z" },
  { id: "u-dina", name: "Dina Wael", email: "dina.wael@maskan.example", type: "staff", roles: ["property_manager"], status: "active", lastLoginAt: "2026-10-15T11:05:00Z" },
  { id: "u-hesham", name: "Hesham Adly", email: "hesham.adly@maskan.example", type: "staff", roles: ["recruiter"], status: "suspended", lastLoginAt: "2026-08-30T09:10:00Z" },
  ...AGENTS.map<AdminUser>((a, i) => ({
    id: `u-${a.id}`,
    name: a.name,
    email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    type: "agent",
    roles: [],
    status: "active",
    lastLoginAt: `2026-10-${String(17 - i).padStart(2, "0")}T${String((i + 6) % 24).padStart(2, "0")}:30:00Z`,
  })),
  { id: "u-agent-ex", name: "Ola Ramadan", email: "ola.ramadan@example.com", type: "agent", roles: [], status: "suspended", lastLoginAt: "2026-09-02T12:00:00Z" },
];

export const ROLE_DESCRIPTION_KEYS = {
  super_admin: "super_admin",
  recruiter: "recruiter",
  training_admin: "training_admin",
  sales_manager: "sales_manager",
  property_manager: "property_manager",
} satisfies Record<Role, string>;

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  /** Already redacted server-side: no passwords, OTPs or full national IDs. */
  details: string;
  ip: string;
  requestId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

export const AUDIT_ACTIONS = [
  "identity.decided",
  "interview.decided",
  "application.decided",
  "price.updated",
  "lead.assigned",
  "role.granted",
  "role.revoked",
  "user.suspended",
  "user.reactivated",
  "quiz_config.updated",
  "settings.updated",
] as const;

export const AUDIT_LOGS: AuditEntry[] = [
  {
    id: "au-107", at: "2026-09-20T10:15:00Z", actor: "Nour Salem", action: "user.reactivated", entityType: "user", entityId: "u-ag-rania",
    details: "Rania Farouk reactivated", ip: "197.45.12.21", requestId: "req_6e02b7",
    before: { status: "suspended" }, after: { status: "active" },
  },
  {
    id: "au-120", at: "2026-10-17T08:42:00Z", actor: "Tarek Fouad", action: "identity.decided", entityType: "identity_verification", entityId: "iv-3381",
    details: "approved · national ID ****4417", ip: "197.45.12.8", requestId: "req_8f2a91",
    before: { review_status: "pending_review", national_id: "****4417" }, after: { review_status: "approved", national_id: "****4417", reviewer: "Tarek Fouad" },
  },
  {
    id: "au-119", at: "2026-10-17T08:10:00Z", actor: "Nour Salem", action: "lead.assigned", entityType: "lead", entityId: "L-1042",
    details: "unassigned → Omar Hassan", ip: "197.45.12.21", requestId: "req_8f1c04",
    before: { current_assignee: null }, after: { current_assignee: "Omar Hassan" },
  },
  {
    id: "au-118", at: "2026-10-16T16:05:00Z", actor: "Laila Mahmoud", action: "quiz_config.updated", entityType: "quiz_config", entityId: "qc-7",
    details: "pass threshold 70% → 75%", ip: "41.233.4.150", requestId: "req_8e77d2",
    before: { version: 6, question_count: 20, pass_threshold_pct: 70, max_attempts: 3, time_limit_min: 30 },
    after: { version: 7, question_count: 20, pass_threshold_pct: 75, max_attempts: 3, time_limit_min: 30 },
  },
  {
    id: "au-117", at: "2026-10-16T11:30:00Z", actor: "Nour Salem", action: "role.granted", entityType: "user", entityId: "u-dina",
    details: "property_manager granted to Dina Wael", ip: "197.45.12.21", requestId: "req_8e3a10",
    before: { roles: [] }, after: { roles: ["property_manager"] },
  },
  {
    id: "au-116", at: "2026-10-15T14:12:00Z", actor: "Tarek Fouad", action: "interview.decided", entityType: "interview_submission", entityId: "is-2214",
    details: "accepted", ip: "197.45.12.8", requestId: "req_8d90ab",
    before: { status: "submitted" }, after: { status: "accepted", notes_internal: "[redacted]" },
  },
  {
    id: "au-115", at: "2026-10-14T09:00:00Z", actor: "Nour Salem", action: "lead.assigned", entityType: "lead", entityId: "L-1030",
    details: "Mahmoud Saeed → Yasmin Hany", ip: "197.45.12.21", requestId: "req_8c1f33",
    before: { current_assignee: "Mahmoud Saeed" }, after: { current_assignee: "Yasmin Hany", reason: "Rebalancing workload" },
  },
  {
    id: "au-114", at: "2026-10-12T09:00:00Z", actor: "Dina Wael", action: "price.updated", entityType: "unit_price", entityId: "pr-a-cash",
    details: "6,500,000.00 → 6,850,000.00 EGP", ip: "102.40.77.9", requestId: "req_8a0e52",
    before: { amount: "6500000.00", currency: "EGP", label: "Cash price" }, after: { amount: "6850000.00", currency: "EGP", label: "Cash price" },
  },
  {
    id: "au-113", at: "2026-10-11T13:25:00Z", actor: "Nour Salem", action: "settings.updated", entityType: "system_setting", entityId: "otp.max_sends_per_hour",
    details: "4 → 5", ip: "197.45.12.21", requestId: "req_89b7c1",
    before: { "otp.max_sends_per_hour": 4 }, after: { "otp.max_sends_per_hour": 5 },
  },
  {
    id: "au-112", at: "2026-10-10T10:40:00Z", actor: "Tarek Fouad", action: "application.decided", entityType: "application", entityId: "app-1187",
    details: "rejected · reason shared with applicant", ip: "197.45.12.8", requestId: "req_8977fe",
    before: { stage: "interview_review" }, after: { stage: "rejected", reason_public: "Interview did not meet requirements" },
  },
  {
    id: "au-111", at: "2026-10-08T15:00:00Z", actor: "Nour Salem", action: "user.suspended", entityType: "user", entityId: "u-hesham",
    details: "Hesham Adly suspended", ip: "197.45.12.21", requestId: "req_88d2aa",
    before: { status: "active" }, after: { status: "suspended" },
  },
  {
    id: "au-110", at: "2026-10-08T14:58:00Z", actor: "Nour Salem", action: "role.revoked", entityType: "user", entityId: "u-hesham",
    details: "sales_manager revoked from Hesham Adly", ip: "197.45.12.21", requestId: "req_88d29f",
    before: { roles: ["recruiter", "sales_manager"] }, after: { roles: ["recruiter"] },
  },
  {
    id: "au-109", at: "2026-10-05T09:15:00Z", actor: "Tarek Fouad", action: "identity.decided", entityType: "identity_verification", entityId: "iv-3302",
    details: "action required · photo unreadable · national ID ****0923", ip: "197.45.12.8", requestId: "req_87a011",
    before: { review_status: "pending_review", national_id: "****0923" }, after: { review_status: "action_required", national_id: "****0923" },
  },
  {
    id: "au-108", at: "2026-07-01T09:00:00Z", actor: "Dina Wael", action: "price.updated", entityType: "unit_price", entityId: "pr-b-cash",
    details: "5,100,000.00 → 5,350,000.00 EGP", ip: "102.40.77.9", requestId: "req_70f1d2",
    before: { amount: "5100000.00", currency: "EGP" }, after: { amount: "5350000.00", currency: "EGP" },
  },
];

export type SettingsValues = {
  otpExpiryMinutes: number;
  otpResendCooldownSeconds: number;
  otpMaxSendsPerHour: number;
  otpMaxWrongAttempts: number;
  uploadMaxImageMb: number;
  uploadMaxVideoMb: number;
  uploadAllowedTypes: string;
  interviewMaxDurationSeconds: number;
  identityOcrThresholdPct: number;
  identityResubmissionLimit: number;
  retentionIdImagesDays: number;
  retentionInterviewVideosDays: number;
};

export const DEFAULT_SETTINGS: SettingsValues = {
  otpExpiryMinutes: 5,
  otpResendCooldownSeconds: 60,
  otpMaxSendsPerHour: 5,
  otpMaxWrongAttempts: 5,
  uploadMaxImageMb: 10,
  uploadMaxVideoMb: 200,
  uploadAllowedTypes: "image/jpeg, image/png, application/pdf, video/mp4",
  interviewMaxDurationSeconds: 180,
  identityOcrThresholdPct: 90,
  identityResubmissionLimit: 3,
  retentionIdImagesDays: 365,
  retentionInterviewVideosDays: 180,
};

export const SETTINGS_META = { updatedBy: "Nour Salem", updatedAt: "2026-10-11T13:25:00Z" };

export const REPORT_RANGES = ["today", "7d", "30d", "90d", "ytd"] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export type ReportData = {
  funnel: { registered: number; phoneVerified: number; identityApproved: number; interviewAccepted: number; qualified: number };
  leadStatus: Record<LeadStatus, number>;
  catalogue: { locations: number; compounds: number; unitModels: number; prices: number; media: number };
  quizAttempts: number;
  quizPassed: number;
};

const leadCounts = (factor: number): Record<LeadStatus, number> => {
  const base = LEADS.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});
  const keys: LeadStatus[] = ["new", "contacted", "interested", "follow_up", "viewing_scheduled", "converted", "not_interested", "unreachable"];
  return Object.fromEntries(keys.map((k) => [k, Math.round((base[k] ?? 0) * factor)])) as Record<LeadStatus, number>;
};

const CATALOGUE = { locations: 4, compounds: 5, unitModels: 8, prices: 11, media: 16 };

export const REPORTS: Record<ReportRange, ReportData> = {
  today: {
    funnel: { registered: 0, phoneVerified: 0, identityApproved: 0, interviewAccepted: 0, qualified: 0 },
    leadStatus: leadCounts(0),
    catalogue: CATALOGUE,
    quizAttempts: 0,
    quizPassed: 0,
  },
  "7d": {
    funnel: { registered: 42, phoneVerified: 36, identityApproved: 24, interviewAccepted: 15, qualified: 6 },
    leadStatus: leadCounts(1),
    catalogue: CATALOGUE,
    quizAttempts: 11,
    quizPassed: 6,
  },
  "30d": {
    funnel: { registered: 186, phoneVerified: 158, identityApproved: 112, interviewAccepted: 71, qualified: 34 },
    leadStatus: leadCounts(3),
    catalogue: CATALOGUE,
    quizAttempts: 58,
    quizPassed: 34,
  },
  "90d": {
    funnel: { registered: 512, phoneVerified: 437, identityApproved: 318, interviewAccepted: 201, qualified: 97 },
    leadStatus: leadCounts(8),
    catalogue: CATALOGUE,
    quizAttempts: 164,
    quizPassed: 97,
  },
  ytd: {
    funnel: { registered: 1408, phoneVerified: 1197, identityApproved: 866, interviewAccepted: 548, qualified: 262 },
    leadStatus: leadCounts(21),
    catalogue: CATALOGUE,
    quizAttempts: 451,
    quizPassed: 262,
  },
};
