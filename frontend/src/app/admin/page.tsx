"use client";

import {
  ArrowRight,
  Building,
  GraduationCap,
  Inbox,
  ShieldCheck,
  UserCheck,
  Users,
  UserSquare,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useAdmin } from "@/components/admin/admin-context";
import type { Permission } from "@/components/admin/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/page";
import { useLocale } from "@/i18n/locale-provider";
import { useT } from "@/i18n/use-t";
import { agentById, ASSIGNMENTS, LEADS } from "@/mock/leads";
import { COMPOUNDS } from "@/mock/properties";
import { APPLICANTS, DECISIONS, getApplicant, IDENTITY_REVIEWS, INTERVIEWS } from "@/mock/recruitment";

type Stat = {
  key: string;
  value: number;
  icon: LucideIcon;
  href: string;
  tone: "navy" | "success" | "warning" | "error" | "info";
  permission: Permission;
};

const TRAINING_STAGES = new Set(["training", "quiz_eligible"]);

// Admin overview (ADM-002). Every figure is computed from the (sample) records.
export default function AdminDashboardPage() {
  const t = useT("shell");
  const { can, user } = useAdmin();
  const { language, intlLocale } = useLocale();

  const stats: Stat[] = [
    { key: "applicants", value: APPLICANTS.length, icon: Users, href: "/admin/applicants", tone: "navy", permission: "applicants.read" },
    {
      key: "pendingIdentity",
      value: IDENTITY_REVIEWS.filter((r) => r.status === "pending").length,
      icon: ShieldCheck,
      href: "/admin/identity-reviews",
      tone: "warning",
      permission: "identity.review",
    },
    {
      key: "pendingInterviews",
      value: INTERVIEWS.filter((i) => i.status === "pending").length,
      icon: Video,
      href: "/admin/interviews",
      tone: "warning",
      permission: "interviews.review",
    },
    {
      key: "inTraining",
      value: APPLICANTS.filter((a) => TRAINING_STAGES.has(a.stage)).length,
      icon: GraduationCap,
      href: "/admin/applicants",
      tone: "info",
      permission: "applicants.read",
    },
    {
      key: "qualified",
      value: APPLICANTS.filter((a) => a.stage === "qualified").length,
      icon: UserCheck,
      href: "/admin/quiz/attempts",
      tone: "success",
      permission: "quiz.results.read",
    },
    {
      key: "activeCompounds",
      value: COMPOUNDS.filter((c) => c.published).length,
      icon: Building,
      href: "/admin/compounds",
      tone: "navy",
      permission: "properties.manage",
    },
    { key: "leads", value: LEADS.length, icon: UserSquare, href: "/admin/leads", tone: "navy", permission: "leads.read_all" },
    {
      key: "unassigned",
      value: LEADS.filter((l) => !l.assigneeId).length,
      icon: Inbox,
      href: "/admin/assignments",
      tone: "error",
      permission: "leads.assign",
    },
  ];
  const visibleStats = stats.filter((s) => can(s.permission));

  const funnel = [
    { key: "registered", value: APPLICANTS.length },
    {
      key: "identityApproved",
      value: APPLICANTS.filter((a) => !["phone_pending", "identity_pending", "identity_review", "identity_action_required"].includes(a.stage)).length,
    },
    { key: "interviewAccepted", value: APPLICANTS.filter((a) => ["training", "quiz_eligible", "qualified"].includes(a.stage)).length },
    { key: "qualified", value: APPLICANTS.filter((a) => a.stage === "qualified").length },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  const dateFmt = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const activity = [
    ...(can("applicants.read")
      ? DECISIONS.map((d) => ({
          id: d.id,
          at: d.decidedAt,
          text: t(`dashboard.activity.${d.kind}`, {
            actor: d.decidedBy,
            decision: t(`dashboard.decisions.${d.decision}`),
            name: getApplicant(d.applicantId)?.name[language] ?? "—",
          }),
          href: `/admin/applicants/${d.applicantId}`,
        }))
      : []),
    ...(can("leads.read_all")
      ? ASSIGNMENTS.map((a) => ({
          id: a.id,
          at: a.assignedAt,
          text: t("dashboard.activity.assignment", {
            actor: a.assignedBy,
            lead: a.leadId,
            agent: agentById(a.toAgentId)?.name ?? "—",
          }),
          href: `/admin/leads/${a.leadId}`,
        }))
      : []),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.welcome", { name: user.name.split(" ")[0] ?? user.name })}
      />

      {visibleStats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map((s) => (
            <StatCard
              key={s.key}
              label={t(`dashboard.stats.${s.key}`)}
              value={new Intl.NumberFormat(intlLocale).format(s.value)}
              icon={s.icon}
              tone={s.tone}
              href={s.href}
            />
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {can("applicants.read") && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.funnel.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {APPLICANTS.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("dashboard.empty")}</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {funnel.map((step) => (
                    <li key={step.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-ink">{t(`dashboard.funnel.${step.key}`)}</span>
                        <span className="font-semibold text-ink tabular-nums">
                          {new Intl.NumberFormat(intlLocale).format(step.value)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-background" aria-hidden="true">
                        <div className="h-full rounded-full bg-navy" style={{ width: `${(step.value / funnelMax) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={can("applicants.read") ? undefined : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle>{t("dashboard.activity.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-ink-muted">{t("dashboard.empty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="group flex items-start justify-between gap-3 py-3 text-sm">
                      <span className="text-ink group-hover:text-navy">{item.text}</span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-ink-muted">
                        {dateFmt.format(new Date(item.at))}
                        <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
