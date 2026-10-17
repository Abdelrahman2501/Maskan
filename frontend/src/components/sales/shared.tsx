"use client";

import { SearchX, UserX } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/page";
import { useLocale } from "@/i18n/locale-provider";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { agentById, type LeadStatus } from "@/mock/leads";
import type { Localized } from "@/mock/properties";

/** Locale-aware formatters for the sales screens (fixed Cairo time zone). */
export function useSalesFormat() {
  const { language, intlLocale } = useLocale();
  return useMemo(() => {
    const timeZone = "Africa/Cairo";
    const date = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeZone });
    const dateTime = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short", timeZone });
    const num = new Intl.NumberFormat(intlLocale);
    return {
      loc: (value: Localized | undefined) => (value ? value[language] || value.en : ""),
      date: (iso: string) => date.format(new Date(iso)),
      dateTime: (iso: string) => dateTime.format(new Date(iso)),
      number: (n: number) => num.format(n),
      /** Explicit ISO 4217 code; never converted between currencies. */
      money: (amount: string, currency: string) => {
        try {
          return new Intl.NumberFormat(intlLocale, {
            style: "currency",
            currency,
            currencyDisplay: "code",
            maximumFractionDigits: 0,
          }).format(Number(amount));
        } catch {
          return `${num.format(Number(amount))} ${currency}`;
        }
      },
    };
  }, [language, intlLocale]);
}

const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: "info",
  contacted: "brand",
  interested: "brand",
  follow_up: "warning",
  viewing_scheduled: "info",
  converted: "success",
  not_interested: "neutral",
  unreachable: "error",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const t = useT("sales");
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(`status.${status}`)}
    </Badge>
  );
}

/** Agent avatar + name, or an "Unassigned" marker. */
export function AgentCell({ agentId, className }: { agentId: string | null | undefined; className?: string }) {
  const t = useT("sales");
  const agent = agentById(agentId);
  if (!agent) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-ink-muted", className)}>
        <UserX className="size-4" aria-hidden="true" />
        {t("common.unassigned")}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <Avatar name={agent.name} className="size-7 text-[10px]" />
      <span className="truncate">{agent.name}</span>
    </span>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-background px-4 py-6 text-center text-sm text-ink-muted">{children}</p>;
}

export function LeadNotFound() {
  const t = useT("sales");
  return (
    <Card className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-navy/8 text-navy">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold text-ink">{t("detail.notFoundTitle")}</h1>
      <p className="text-sm text-ink-muted">{t("detail.notFoundBody")}</p>
      <Link href="/admin/leads" className={buttonVariants({ variant: "secondary", size: "sm" })}>
        {t("detail.backToList")}
      </Link>
    </Card>
  );
}
