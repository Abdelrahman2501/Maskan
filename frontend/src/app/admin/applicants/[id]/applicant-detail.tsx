"use client";

import { ArrowRight, Film, ShieldCheck, Video } from "lucide-react";
import Link from "next/link";

import { useAdmin } from "@/components/admin/admin-context";
import { DecisionBadge, IdentityStatusBadge, InterviewStatusBadge, OcrBadge, StageBadge } from "@/components/recruitment/badges";
import { NotFoundCard, Section, useActorLabel } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, DetailList, PageHeader } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import {
  DECISIONS,
  STAGE_HISTORY,
  getApplicant,
  identityForApplicant,
  interviewsForApplicant,
  maskNationalId,
} from "@/mock/recruitment";
import { COURSES, attemptsForApplicant, isPassed, progressForApplicant } from "@/mock/training";

function Empty({ children }: { children: string }) {
  return <p className="rounded-md bg-background px-4 py-6 text-center text-sm text-ink-muted">{children}</p>;
}

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
      {label}
      <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
    </Link>
  );
}

export function ApplicantDetail({ id }: { id: string }) {
  const t = useT("recruitment");
  const f = useFormat();
  const actorLabel = useActorLabel();
  const { can } = useAdmin();
  const applicant = getApplicant(id);

  if (!applicant) return <NotFoundCard backHref="/admin/applicants" backLabel={t("applicants.backToList")} />;

  const history = STAGE_HISTORY[applicant.id] ?? [];
  const identity = identityForApplicant(applicant.id);
  const interviews = interviewsForApplicant(applicant.id);
  const latestInterview = interviews[interviews.length - 1];
  const progress = progressForApplicant(applicant.id);
  const attempts = attemptsForApplicant(applicant.id);
  const decisions = DECISIONS.filter((d) => d.applicantId === applicant.id);
  const name = f.loc(applicant.name);

  return (
    <>
      <PageHeader
        title={name}
        breadcrumbs={[
          { label: t("breadcrumbs.recruitment") },
          { label: t("applicants.title"), href: "/admin/applicants" },
          { label: name },
        ]}
        actions={
          <>
            {identity && can("identity.review") && (
              <Link href={`/admin/identity-reviews/${identity.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                <ShieldCheck aria-hidden="true" />
                {t("detail.openIdentityReview")}
              </Link>
            )}
            {latestInterview && can("interviews.review") && (
              <Link href={`/admin/interviews/${latestInterview.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                <Video aria-hidden="true" />
                {t("detail.openInterview")}
              </Link>
            )}
          </>
        }
      />

      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar name={applicant.name.en} className="size-14 text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-ink">{name}</p>
            <StageBadge stage={applicant.stage} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            <span dir="ltr">{applicant.email}</span> · <span dir="ltr">{applicant.phone}</span> · {f.loc(applicant.city)}
          </p>
        </div>
        <div className="text-sm text-ink-muted sm:text-end">
          <p>{t("detail.registeredOn", { date: f.date(applicant.registeredAt) })}</p>
          <p>{t("detail.lastActivity", { date: f.dateTime(applicant.lastActivityAt) })}</p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Identity */}
          <Section
            title={t("detail.identity")}
            action={identity && can("identity.review") ? <SectionLink href={`/admin/identity-reviews/${identity.id}`} label={t("detail.viewReview")} /> : undefined}
          >
            {identity ? (
              <DetailList
                items={[
                  { label: t("fields.status"), value: <IdentityStatusBadge status={identity.status} /> },
                  { label: t("fields.nationalId"), value: <span dir="ltr" className="font-mono tracking-wider">{maskNationalId(identity.enteredId)}</span> },
                  { label: t("fields.ocrResult"), value: <OcrBadge result={identity.ocrResult} /> },
                  { label: t("fields.confidence"), value: identity.confidence === null ? "—" : f.percent(identity.confidence) },
                  { label: t("fields.submitted"), value: f.dateTime(identity.submittedAt) },
                  {
                    label: t("fields.decidedBy"),
                    value: identity.decision ? `${identity.decision.reviewer} · ${f.dateTime(identity.decision.decidedAt)}` : "—",
                  },
                ]}
              />
            ) : (
              <Empty>{t("detail.noIdentity")}</Empty>
            )}
          </Section>

          {/* Interview */}
          <Section
            title={t("detail.interview")}
            action={latestInterview && can("interviews.review") ? <SectionLink href={`/admin/interviews/${latestInterview.id}`} label={t("detail.viewInterview")} /> : undefined}
          >
            {interviews.length > 0 ? (
              <ul className="divide-y divide-border">
                {interviews.map((s, i) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-md bg-navy/8 text-navy">
                        <Video className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink">{t("detail.submissionNo", { n: i + 1 })}</p>
                        <p className="text-xs text-ink-muted">
                          {f.dateTime(s.submittedAt)} · {f.duration(s.durationSec)}
                        </p>
                      </div>
                    </div>
                    <InterviewStatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>{t("detail.noInterview")}</Empty>
            )}
          </Section>

          {/* Training */}
          <Section title={t("detail.training")}>
            {progress ? (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-ink">{t("detail.videosCompleted", { done: progress.completedVideos, total: progress.totalVideos })}</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {f.percent((progress.completedVideos / progress.totalVideos) * 100)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-valuemin={0} aria-valuemax={progress.totalVideos} aria-valuenow={progress.completedVideos}>
                  <div className="h-full rounded-full bg-navy" style={{ width: `${(progress.completedVideos / progress.totalVideos) * 100}%` }} />
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {progress.courses.map((c) => {
                    const course = COURSES.find((x) => x.id === c.courseId);
                    const done = c.completed === c.total;
                    return (
                      <li key={c.courseId} className="rounded-md border border-border p-3">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                          <Film className="size-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                          {f.loc(course?.title)}
                        </p>
                        <p className={cn("mt-1 text-xs", done ? "text-success" : "text-ink-muted")}>
                          {t("detail.videosShort", { done: c.completed, total: c.total })}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <Empty>{t("detail.noTraining")}</Empty>
            )}
          </Section>

          {/* Quiz */}
          <Section title={t("detail.quiz")}>
            {attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="py-2 pe-4 text-start font-medium">{t("columns.attempt")}</th>
                      <th className="py-2 pe-4 text-start font-medium">{t("columns.finished")}</th>
                      <th className="py-2 pe-4 text-start font-medium">{t("columns.score")}</th>
                      <th className="py-2 text-start font-medium">{t("columns.result")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 pe-4 text-ink">#{f.number(a.attemptNo)}</td>
                        <td className="py-2.5 pe-4 text-ink-muted">{f.dateTime(a.endedAt)}</td>
                        <td className="py-2.5 pe-4 text-ink tabular-nums">
                          {f.number(a.correct)}/{f.number(a.total)} · {f.percent((a.correct / a.total) * 100)}
                        </td>
                        <td className="py-2.5">
                          <Badge tone={isPassed(a) ? "success" : "error"}>{isPassed(a) ? t("quiz.pass") : t("quiz.fail")}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>{t("detail.noAttempts")}</Empty>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section title={t("detail.profile")}>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                { label: t("fields.applicantId"), value: <span className="font-mono">{applicant.id.toUpperCase()}</span> },
                { label: t("fields.email"), value: <span dir="ltr">{applicant.email}</span> },
                { label: t("fields.phone"), value: <span dir="ltr">{applicant.phone}</span> },
                { label: t("fields.city"), value: f.loc(applicant.city) },
                { label: t("fields.registered"), value: f.dateTime(applicant.registeredAt) },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="text-end text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title={t("detail.timeline")}>
            <ol className="relative flex flex-col gap-5 border-s border-border ps-5">
              {[...history].reverse().map((h, i) => (
                <li key={h.id} className="relative">
                  <span
                    className={cn(
                      "absolute -start-[25px] top-1 size-2.5 rounded-full ring-4 ring-surface",
                      i === 0 ? "bg-navy" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                  <StageBadge stage={h.to} />
                  <p className="mt-1 text-xs text-ink-muted">
                    {f.dateTime(h.at)} · {actorLabel(h.actor)}
                  </p>
                  {h.reason && <p className="mt-1 text-sm text-ink">{f.loc(h.reason)}</p>}
                </li>
              ))}
            </ol>
          </Section>

          <Section title={t("detail.decisions")}>
            {decisions.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {decisions.map((d) => (
                  <li key={d.id} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-ink-muted">{t(`decisionKind.${d.kind}`)}</span>
                      <DecisionBadge decision={d.decision} />
                    </div>
                    {d.publicReason && <p className="mt-2 text-sm text-ink">{f.loc(d.publicReason)}</p>}
                    <p className="mt-2 text-xs text-ink-muted">
                      {d.decidedBy} · {f.dateTime(d.decidedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>{t("detail.noDecisions")}</Empty>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}
