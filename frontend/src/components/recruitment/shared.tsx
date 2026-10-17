"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/page";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import type { Actor, Applicant } from "@/mock/recruitment";

import { useFormat } from "./use-format";

/** Avatar + name + email, used as the first column of applicant tables. */
export function ApplicantCell({ applicant, href }: { applicant: Applicant; href?: string }) {
  const f = useFormat();
  const name = f.loc(applicant.name);
  const body = (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={applicant.name.en} className="size-8" />
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink">{name}</span>
        <span className="block truncate text-xs text-ink-muted" dir="ltr">
          {applicant.email}
        </span>
      </span>
    </span>
  );
  return href ? (
    <Link href={href} className="hover:underline" onClick={(e) => e.stopPropagation()}>
      {body}
    </Link>
  ) : (
    body
  );
}

export function useActorLabel() {
  const t = useT("recruitment");
  return (actor: Actor) => (actor.kind === "staff" ? (actor.name ?? "") : t(`actors.${actor.kind}`));
}

/** Shown when an [id] route does not match any sample record. */
export function NotFoundCard({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const t = useT("recruitment");
  return (
    <Card className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-navy/8 text-navy">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold text-ink">{t("notFound.title")}</h1>
      <p className="text-sm text-ink-muted">{t("notFound.body")}</p>
      <Link href={backHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
        {backLabel}
      </Link>
    </Card>
  );
}

/** Small titled section inside a card. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
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
