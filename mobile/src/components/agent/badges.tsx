import { useTranslation } from "react-i18next";

import { Badge, type BadgeTone } from "@/components/ui";
import type { LeadStatus } from "@/mock/leads";
import type { Compound, UnitModel } from "@/mock/properties";
import { useLocale } from "@/i18n/locale-provider";

import { formatYear } from "./format";

export const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: "info",
  contacted: "brand",
  interested: "success",
  follow_up: "warning",
  viewing_scheduled: "info",
  converted: "success",
  not_interested: "neutral",
  unreachable: "error",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { t } = useTranslation("agent");
  return <Badge label={t(`leadStatus.${status}`)} tone={LEAD_STATUS_TONE[status]} />;
}

const COMPOUND_TONE: Record<Compound["status"], BadgeTone> = {
  launching: "info",
  under_construction: "warning",
  ready: "success",
};

export function CompoundStatusBadge({ compound }: { compound: Compound }) {
  const { t } = useTranslation("agent");
  const { intlLocale } = useLocale();
  const label =
    compound.status === "ready"
      ? t("compoundStatus.ready")
      : t("compoundStatus.withDelivery", {
          status: t(`compoundStatus.${compound.status}`),
          year: formatYear(compound.deliveryYear, intlLocale),
        });
  return <Badge label={label} tone={COMPOUND_TONE[compound.status]} />;
}

const AVAILABILITY_TONE: Record<UnitModel["availability"], BadgeTone> = {
  available: "success",
  limited: "warning",
  sold_out: "neutral",
};

export function AvailabilityBadge({ availability }: { availability: UnitModel["availability"] }) {
  const { t } = useTranslation("agent");
  return <Badge label={t(`availability.${availability}`)} tone={AVAILABILITY_TONE[availability]} />;
}
