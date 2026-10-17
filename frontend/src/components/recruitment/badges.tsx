"use client";

import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from "lucide-react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { useT } from "@/i18n/use-t";
import type { DecisionValue, HistoryStage, IdentityStatus, InterviewStatus, OcrResult } from "@/mock/recruitment";

const STAGE_TONES: Record<HistoryStage, BadgeTone> = {
  phone_pending: "neutral",
  identity_pending: "neutral",
  identity_processing: "info",
  identity_review: "warning",
  identity_action_required: "error",
  identity_approved: "success",
  interview_pending: "info",
  interview_submitted: "warning",
  training: "brand",
  quiz_eligible: "brand",
  qualified: "success",
  rejected: "error",
};

function Dot() {
  return <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />;
}

export function StageBadge({ stage }: { stage: HistoryStage }) {
  const t = useT("recruitment");
  return (
    <Badge tone={STAGE_TONES[stage]}>
      <Dot />
      {t(`stages.${stage}`)}
    </Badge>
  );
}

const OCR_TONES: Record<OcrResult, BadgeTone> = {
  match: "success",
  mismatch: "error",
  low_confidence: "warning",
  failed: "neutral",
};
const OCR_ICONS = { match: CheckCircle2, mismatch: XCircle, low_confidence: AlertTriangle, failed: CircleHelp };

export function OcrBadge({ result }: { result: OcrResult }) {
  const t = useT("recruitment");
  const Icon = OCR_ICONS[result];
  return (
    <Badge tone={OCR_TONES[result]}>
      <Icon className="size-3.5" aria-hidden="true" />
      {t(`ocr.${result}`)}
    </Badge>
  );
}

const REVIEW_TONES: Record<IdentityStatus, BadgeTone> = {
  pending: "warning",
  action_required: "error",
  approved: "success",
  rejected: "error",
};

export function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
  const t = useT("recruitment");
  return (
    <Badge tone={REVIEW_TONES[status]}>
      <Dot />
      {t(`identityStatus.${status}`)}
    </Badge>
  );
}

const INTERVIEW_TONES: Record<InterviewStatus, BadgeTone> = {
  pending: "warning",
  accepted: "success",
  rejected: "error",
  reopened: "info",
};

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const t = useT("recruitment");
  return (
    <Badge tone={INTERVIEW_TONES[status]}>
      <Dot />
      {t(`interviewStatus.${status}`)}
    </Badge>
  );
}

const DECISION_TONES: Record<DecisionValue, BadgeTone> = {
  approved: "success",
  accepted: "success",
  action_required: "warning",
  rejected: "error",
  reopened: "info",
};

export function DecisionBadge({ decision }: { decision: DecisionValue }) {
  const t = useT("recruitment");
  return (
    <Badge tone={DECISION_TONES[decision]}>
      <Dot />
      {t(`decisionValue.${decision}`)}
    </Badge>
  );
}
