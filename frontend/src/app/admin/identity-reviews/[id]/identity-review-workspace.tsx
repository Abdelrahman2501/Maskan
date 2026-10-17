"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Expand,
  Info,
  Lock,
  RotateCcw,
  ShieldCheck,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { DecisionBadge, IdentityStatusBadge, OcrBadge, StageBadge } from "@/components/recruitment/badges";
import { NotFoundCard, Section } from "@/components/recruitment/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Textarea } from "@/components/ui/input";
import { Avatar, PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import {
  IDENTITY_REVIEWS,
  getApplicant,
  maskNationalId,
  type IdentityDecision,
  type IdentityReview,
} from "@/mock/recruitment";

type DocKind = "front" | "back" | "selfie";
type Choice = IdentityDecision["decision"];

const DOCS: { kind: DocKind; icon: LucideIcon; size: string }[] = [
  { kind: "front", icon: CreditCard, size: "1.8 MB" },
  { kind: "back", icon: CreditCard, size: "1.6 MB" },
  { kind: "selfie", icon: UserRound, size: "2.3 MB" },
];

function DigitCompare({ value, other, label }: { value: string | null; other: string | null; label: string }) {
  const t = useT("recruitment");
  return (
    <div className="min-w-0 flex-1 rounded-md border border-border bg-background/60 p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      {value ? (
        <p dir="ltr" className="mt-2 flex flex-wrap gap-0.5 font-mono text-lg font-semibold text-ink">
          {value.split("").map((d, i) => {
            const differs = other !== null && other[i] !== d;
            return (
              <span key={i} className={cn("rounded-xs px-0.5", differs && "bg-error/10 text-error")}>
                {d}
              </span>
            );
          })}
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">{t("review.notExtracted")}</p>
      )}
    </div>
  );
}

function DocPlaceholder({ icon: Icon, large = false }: { icon: LucideIcon; large?: boolean }) {
  return (
    <div className="grid aspect-16/10 place-items-center rounded-md border border-dashed border-border bg-background">
      <Icon className={cn("text-ink-muted/60", large ? "size-20" : "size-10")} aria-hidden="true" />
    </div>
  );
}

export function IdentityReviewWorkspace({ id }: { id: string }) {
  const t = useT("recruitment");
  const tc = useT();
  const f = useFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const initial = IDENTITY_REVIEWS.find((r) => r.id === id);
  const [review, setReview] = useState<IdentityReview | undefined>(initial);
  const [preview, setPreview] = useState<DocKind | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [publicReason, setPublicReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const applicant = review ? getApplicant(review.applicantId) : undefined;
  if (!review || !applicant) {
    return <NotFoundCard backHref="/admin/identity-reviews" backLabel={t("identity.backToQueue")} />;
  }

  const name = f.loc(applicant.name);
  const numbersMatch = review.ocrId !== null && review.ocrId === review.enteredId;
  const reasonRequired = choice === "action_required" || choice === "rejected";
  const reasonError = showErrors && reasonRequired && publicReason.trim().length < 10 ? t("review.reasonRequired") : undefined;
  const canDecide = can("identity.review");
  const open = review.status === "pending";
  const previewDoc = DOCS.find((d) => d.kind === preview);

  const submit = () => {
    if (!choice) return;
    if (reasonRequired && publicReason.trim().length < 10) {
      setShowErrors(true);
      return;
    }
    setConfirming(true);
  };

  const confirm = () => {
    if (!choice) return;
    const text = (s: string) => (s.trim() ? { en: s.trim(), ar: s.trim() } : undefined);
    setReview({
      ...review,
      status: choice,
      decision: {
        decision: choice,
        publicReason: reasonRequired ? text(publicReason) : undefined,
        internalNote: text(internalNote),
        reviewer: user.name,
        decidedAt: new Date().toISOString(),
      },
    });
    setConfirming(false);
    toast(t(`review.toast.${choice}`, { name }));
  };

  const choices: { value: Choice; icon: LucideIcon; tone: string }[] = [
    { value: "approved", icon: CheckCircle2, tone: "peer-checked:border-success peer-checked:bg-success/5 [&_svg]:text-success" },
    { value: "action_required", icon: RotateCcw, tone: "peer-checked:border-warning peer-checked:bg-warning/5 [&_svg]:text-warning" },
    { value: "rejected", icon: XCircle, tone: "peer-checked:border-error peer-checked:bg-error/5 [&_svg]:text-error" },
  ];

  return (
    <>
      <PageHeader
        title={t("review.title", { name })}
        breadcrumbs={[
          { label: t("breadcrumbs.recruitment") },
          { label: t("identity.title"), href: "/admin/identity-reviews" },
          { label: name },
        ]}
        actions={<IdentityStatusBadge status={review.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Number check */}
          <Section
            title={t("review.numberCheck")}
            action={
              numbersMatch ? (
                <Badge tone="success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {t("review.numbersMatch")}
                </Badge>
              ) : (
                <Badge tone={review.ocrId ? "error" : "neutral"}>
                  {review.ocrId ? <XCircle className="size-3.5" aria-hidden="true" /> : <AlertTriangle className="size-3.5" aria-hidden="true" />}
                  {review.ocrId ? t("review.numbersDiffer") : t("review.cannotCompare")}
                </Badge>
              )
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <DigitCompare label={t("review.enteredNumber")} value={review.enteredId} other={review.ocrId} />
              <DigitCompare label={t("review.ocrNumber")} value={review.ocrId} other={review.enteredId} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-ink-muted">{t("fields.ocrResult")}</p>
                <div className="mt-1.5">
                  <OcrBadge result={review.ocrResult} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-muted">{t("fields.confidence")}</p>
                {review.confidence === null ? (
                  <p className="mt-1.5 text-sm text-ink-muted">—</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          review.confidence >= 85 ? "bg-success" : review.confidence >= 65 ? "bg-warning" : "bg-error",
                        )}
                        style={{ width: `${review.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-ink tabular-nums">{f.percent(review.confidence)}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-ink-muted">{t("review.providerStatus")}</p>
                <p className={cn("mt-1.5 text-sm font-medium", review.providerStatus === "failed" ? "text-error" : "text-ink")}>
                  {t(`review.provider.${review.providerStatus}`)}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm text-info">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t("review.ocrDisclaimer")}
            </p>
          </Section>

          {/* Documents */}
          <Section
            title={t("review.documents")}
            action={
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <Lock className="size-3.5" aria-hidden="true" />
                {t("review.privateStorage")}
              </span>
            }
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {DOCS.map((doc) => (
                <div key={doc.kind} className="flex flex-col gap-2">
                  <DocPlaceholder icon={doc.icon} />
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{t(`review.doc.${doc.kind}`)}</p>
                      <p className="text-xs text-ink-muted">JPEG · {doc.size}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setPreview(doc.kind)}>
                      <Expand aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">{t("review.viewFull")}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          {/* Applicant */}
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
                { label: t("fields.nationalId"), value: <span dir="ltr" className="font-mono">{maskNationalId(review.enteredId)}</span> },
                { label: t("fields.submitted"), value: f.dateTime(review.submittedAt) },
                { label: t("review.submissionNo"), value: f.number(review.submissionNo) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="text-end text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={`/admin/applicants/${applicant.id}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}
            >
              {t("review.openProfile")}
            </Link>
          </Section>

          {/* Decision */}
          <Section title={t("review.decision")}>
            {review.decision ? (
              <div className="flex flex-col gap-3">
                <DecisionBadge decision={review.decision.decision} />
                {review.decision.publicReason && (
                  <div>
                    <p className="text-xs font-medium text-ink-muted">{t("review.publicReason")}</p>
                    <p className="mt-1 text-sm text-ink">{f.loc(review.decision.publicReason)}</p>
                  </div>
                )}
                {review.decision.internalNote && (
                  <div className="rounded-md border border-dashed border-warning/40 bg-warning/5 p-3">
                    <p className="flex items-center gap-1 text-xs font-medium text-warning">
                      <Lock className="size-3" aria-hidden="true" />
                      {t("review.internalNoteHidden")}
                    </p>
                    <p className="mt-1 text-sm text-ink">{f.loc(review.decision.internalNote)}</p>
                  </div>
                )}
                <p className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-ink-muted">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {t("review.decidedBy", { name: review.decision.reviewer, date: f.dateTime(review.decision.decidedAt) })}
                </p>
              </div>
            ) : !open ? (
              <p className="text-sm text-ink-muted">{t("review.notOpen")}</p>
            ) : !canDecide ? (
              <p className="flex items-start gap-2 rounded-md bg-background p-3 text-sm text-ink-muted">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t("review.noPermission")}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-2">
                  <legend className="sr-only">{t("review.decision")}</legend>
                  {choices.map((c) => {
                    const Icon = c.icon;
                    return (
                      <label key={c.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          value={c.value}
                          checked={choice === c.value}
                          onChange={() => {
                            setChoice(c.value);
                            setShowErrors(false);
                          }}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-accent",
                            c.tone,
                          )}
                        >
                          <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                          {t(`review.choice.${c.value}`)}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                {choice && (
                  <>
                    {reasonRequired && (
                      <FormField label={t("review.publicReason")} hint={t("review.publicReasonHint")} error={reasonError} required>
                        {(p) => (
                          <Textarea
                            {...p}
                            value={publicReason}
                            onChange={(e) => setPublicReason(e.target.value)}
                            placeholder={t(choice === "rejected" ? "review.rejectPlaceholder" : "review.resubmitPlaceholder")}
                          />
                        )}
                      </FormField>
                    )}
                    <div className="rounded-md border border-dashed border-warning/40 bg-warning/5 p-3">
                      <FormField label={t("review.internalNote")} hint={t("review.internalNoteHint")}>
                        {(p) => (
                          <Textarea {...p} className="min-h-16" value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
                        )}
                      </FormField>
                    </div>
                    <Button variant={choice === "rejected" ? "destructive" : "primary"} onClick={submit}>
                      {t("review.submitDecision")}
                    </Button>
                  </>
                )}
                <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {t("review.auditNote")}
                </p>
              </div>
            )}
          </Section>
        </div>
      </div>

      <Dialog
        open={previewDoc !== undefined}
        onClose={() => setPreview(null)}
        title={previewDoc ? t(`review.doc.${previewDoc.kind}`) : ""}
        description={name}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setPreview(null)}>
            {tc("actions.close")}
          </Button>
        }
      >
        {previewDoc && (
          <div className="flex flex-col gap-3">
            <DocPlaceholder icon={previewDoc.icon} large />
            <p className="flex items-center gap-2 text-xs text-ink-muted">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("review.signedUrlNote")}
            </p>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirm}
        title={choice ? t(`review.confirm.${choice}.title`) : ""}
        description={choice ? t(`review.confirm.${choice}.body`, { name }) : undefined}
        confirmLabel={choice ? t(`review.choice.${choice}`) : tc("actions.confirm")}
        destructive={choice === "rejected"}
      >
        {reasonRequired && publicReason.trim() && (
          <div className="rounded-md bg-background p-3 text-sm">
            <p className="text-xs font-medium text-ink-muted">{t("review.publicReason")}</p>
            <p className="mt-1 text-ink">{publicReason.trim()}</p>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
