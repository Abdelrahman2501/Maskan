"use client";

import { CheckCircle2, Clock, Lock, Pause, Play, RotateCcw, Volume2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { IdentityStatusBadge, InterviewStatusBadge, OcrBadge, StageBadge } from "@/components/recruitment/badges";
import { NotFoundCard, Section, useActorLabel } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Textarea } from "@/components/ui/input";
import { Avatar, PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import {
  INTERVIEWS,
  getApplicant,
  identityForApplicant,
  maskNationalId,
  type InterviewHistoryEntry,
  type InterviewSubmission,
} from "@/mock/recruitment";

type Action = "accepted" | "rejected" | "reopened";

export function InterviewReview({ id }: { id: string }) {
  const t = useT("recruitment");
  const f = useFormat();
  const toast = useToast();
  const actorLabel = useActorLabel();
  const { can, user } = useAdmin();
  const [submission, setSubmission] = useState<InterviewSubmission | undefined>(() => INTERVIEWS.find((s) => s.id === id));
  const [playing, setPlaying] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();

  const applicant = submission ? getApplicant(submission.applicantId) : undefined;
  if (!submission || !applicant) {
    return <NotFoundCard backHref="/admin/interviews" backLabel={t("interviews.backToList")} />;
  }

  const name = f.loc(applicant.name);
  const identity = identityForApplicant(applicant.id);
  const canDecide = can("interviews.review") && can("applications.decide");
  const canReopen = can("applications.decide");
  const open = submission.status === "pending";
  const reasonRequired = action === "rejected" || action === "reopened";

  const startAction = (next: Action) => {
    setAction(next);
    setReason("");
    setReasonError(undefined);
  };

  const confirm = () => {
    if (!action) return;
    if (reasonRequired && reason.trim().length < 10) {
      setReasonError(t("review.reasonRequired"));
      return;
    }
    const entry: InterviewHistoryEntry = {
      id: `${submission.id}-e${submission.history.length + 1}`,
      action,
      actor: { kind: "staff", name: user.name },
      reason: reason.trim() ? { en: reason.trim(), ar: reason.trim() } : undefined,
      at: new Date().toISOString(),
    };
    setSubmission({ ...submission, status: action, history: [...submission.history, entry] });
    setAction(null);
    toast(t(`interviewReview.toast.${action}`, { name }));
  };

  return (
    <>
      <PageHeader
        title={t("interviewReview.title", { name })}
        breadcrumbs={[
          { label: t("breadcrumbs.recruitment") },
          { label: t("interviews.title"), href: "/admin/interviews" },
          { label: name },
        ]}
        actions={<InterviewStatusBadge status={submission.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Player placeholder */}
          <div className="overflow-hidden rounded-lg border border-border bg-navy shadow-card">
            <div className="relative grid aspect-video place-items-center bg-navy-deep">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-navy-secondary),transparent_60%)] opacity-70" />
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? t("interviewReview.pause") : t("interviewReview.play")}
                className="relative grid size-16 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
              >
                {playing ? <Pause className="size-7" /> : <Play className="ms-1 size-7 rtl:-scale-x-100" />}
              </button>
              <span className="absolute end-3 top-3 rounded-sm bg-navy-deep/60 px-2 py-0.5 text-xs text-white tabular-nums">
                {f.duration(submission.durationSec)}
              </span>
              <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-sm bg-navy-deep/60 px-2 py-0.5 text-xs text-white">
                <Lock className="size-3" aria-hidden="true" />
                {t("interviewReview.signedUrl")}
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-white/80">
              <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t("interviewReview.pause") : t("interviewReview.play")}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4 rtl:-scale-x-100" />}
              </button>
              <span className="text-xs tabular-nums">
                {f.duration(playing ? Math.round(submission.durationSec / 3) : 0)} / {f.duration(submission.durationSec)}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20" dir="ltr">
                <div className={cn("h-full rounded-full bg-white transition-all", playing ? "w-1/3" : "w-0")} />
              </div>
              <Volume2 className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="-mt-3 text-xs text-ink-muted">{t("interviewReview.prototypeNote")}</p>

          {/* Review history */}
          <Section title={t("interviewReview.history")}>
            <ol className="relative flex flex-col gap-5 border-s border-border ps-5">
              {[...submission.history].reverse().map((h, i) => (
                <li key={h.id} className="relative">
                  <span
                    className={cn("absolute -start-[25px] top-1 size-2.5 rounded-full ring-4 ring-surface", i === 0 ? "bg-navy" : "bg-border")}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-ink">{t(`interviewReview.action.${h.action}`)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {f.dateTime(h.at)} · {actorLabel(h.actor)}
                  </p>
                  {h.reason && <p className="mt-1 text-sm text-ink">{f.loc(h.reason)}</p>}
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section title={t("review.applicant")}>
            <div className="flex items-center gap-3">
              <Avatar name={applicant.name.en} className="size-11" />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{name}</p>
                <p className="truncate text-xs text-ink-muted" dir="ltr">
                  {applicant.email}
                </p>
              </div>
            </div>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              {[
                { label: t("fields.phone"), value: <span dir="ltr">{applicant.phone}</span> },
                { label: t("fields.stage"), value: <StageBadge stage={applicant.stage} /> },
                { label: t("fields.submitted"), value: f.dateTime(submission.submittedAt) },
                { label: t("columns.duration"), value: f.duration(submission.durationSec) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="text-end text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/admin/applicants/${applicant.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}>
              {t("review.openProfile")}
            </Link>
          </Section>

          <Section title={t("interviewReview.identityStatus")}>
            {identity ? (
              <dl className="flex flex-col gap-2.5 text-sm">
                {[
                  { label: t("fields.status"), value: <IdentityStatusBadge status={identity.status} /> },
                  { label: t("fields.ocrResult"), value: <OcrBadge result={identity.ocrResult} /> },
                  { label: t("fields.nationalId"), value: <span dir="ltr" className="font-mono">{maskNationalId(identity.enteredId)}</span> },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">{row.label}</dt>
                    <dd className="text-end text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-ink-muted">—</p>
            )}
          </Section>

          <Section title={t("review.decision")}>
            {!open ? (
              <p className="text-sm text-ink-muted">{t("interviewReview.closed")}</p>
            ) : !canDecide && !canReopen ? (
              <p className="flex items-start gap-2 rounded-md bg-background p-3 text-sm text-ink-muted">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t("review.noPermission")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {canDecide && (
                  <>
                    <Button onClick={() => startAction("accepted")}>
                      <CheckCircle2 aria-hidden="true" />
                      {t("interviewReview.accept")}
                    </Button>
                    <Button variant="destructive" onClick={() => startAction("rejected")}>
                      <XCircle aria-hidden="true" />
                      {t("interviewReview.reject")}
                    </Button>
                  </>
                )}
                {canReopen && (
                  <Button variant="secondary" onClick={() => startAction("reopened")}>
                    <RotateCcw aria-hidden="true" />
                    {t("interviewReview.reopen")}
                  </Button>
                )}
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {t("review.auditNote")}
                </p>
              </div>
            )}
          </Section>
        </div>
      </div>

      <ConfirmDialog
        open={action !== null}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        title={action ? t(`interviewReview.confirm.${action}.title`) : ""}
        description={action ? t(`interviewReview.confirm.${action}.body`, { name }) : undefined}
        confirmLabel={action ? t(`interviewReview.confirm.${action}.cta`) : ""}
        destructive={action === "rejected"}
      >
        <FormField
          label={reasonRequired ? t("review.publicReason") : t("interviewReview.optionalMessage")}
          hint={action === "reopened" ? t("interviewReview.reopenHint") : t("review.publicReasonHint")}
          error={reasonError}
          required={reasonRequired}
        >
          {(p) => (
            <Textarea
              {...p}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(undefined);
              }}
            />
          )}
        </FormField>
      </ConfirmDialog>
    </>
  );
}
