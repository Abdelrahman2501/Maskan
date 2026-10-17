import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-background text-ink-muted ring-1 ring-inset ring-border",
        brand: "bg-navy/8 text-navy",
        success: "bg-success/10 text-success",
        warning: "bg-warning/12 text-warning",
        error: "bg-error/10 text-error",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/**
 * Domain status → semantic tone. Extend as features add statuses so every
 * screen shows the same color for the same meaning.
 */
const STATUS_TONES: Record<string, BadgeTone> = {
  approved: "success",
  accepted: "success",
  completed: "success",
  qualified: "success",
  pending: "warning",
  pending_review: "warning",
  processing: "info",
  submitted: "info",
  rejected: "error",
  action_required: "error",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return (
    <Badge tone={tone} className={className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}
