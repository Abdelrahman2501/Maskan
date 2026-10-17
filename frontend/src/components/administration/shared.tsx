"use client";

import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Permission } from "@/components/admin/permissions";
import type { UserStatus } from "@/mock/administration";

/** Card wrapper for one report chart: title, optional description, body. */
export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      <div className="mt-4 flex-1">{children}</div>
    </Card>
  );
}

export function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-8 text-center">
      <BarChart3 className="size-6 text-ink-muted" aria-hidden="true" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function ChartSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  );
}

export type BarItem = { key: string; label: string; value: number; hint?: string; tone?: "navy" | "accent" | "success" | "warning" | "error" | "muted" };

const BAR_TONE = {
  navy: "bg-navy",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  muted: "bg-ink-muted",
} as const;

/**
 * Horizontal bar list built from plain divs. Every bar carries its numeric
 * value as text, so the chart is readable without colour or sight.
 */
export function BarList({
  items,
  format,
  emptyLabel,
  ariaLabel,
}: {
  items: BarItem[];
  format: (n: number) => string;
  emptyLabel: string;
  ariaLabel: string;
}) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (max === 0) return <ChartEmpty label={emptyLabel} />;
  return (
    <ul className="flex flex-col gap-3" aria-label={ariaLabel}>
      {items.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <li key={item.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink">{item.label}</span>
              {/* <bdi> isolates each run so Arabic bidi doesn't merge adjacent digits. */}
              <span className="flex shrink-0 items-baseline gap-2 text-ink tabular-nums">
                <bdi className="font-semibold">{format(item.value)}</bdi>
                {item.hint && <bdi className="text-xs text-ink-muted">{item.hint}</bdi>}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className={cn("h-full rounded-full", BAR_TONE[item.tone ?? "navy"])}
                style={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** SVG ring showing a single percentage, with the value printed in the middle. */
export function RingGauge({ value, label }: { value: number; label: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <svg viewBox="0 0 100 100" className="size-36" role="img" aria-label={label}>
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-background" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(clamped / 100) * c} ${c}`}
        transform="rotate(-90 50 50)"
        className="stroke-success"
      />
      <text x="50" y="55" textAnchor="middle" className="fill-ink text-[18px] font-bold">
        {label}
      </text>
    </svg>
  );
}

export function UserStatusBadge({ status, label }: { status: UserStatus; label: string }) {
  return (
    <Badge tone={status === "active" ? "success" : "error"}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}

const SENSITIVE_KEY = /pass(word)?|otp|^code$|token|secret|authorization|cookie|national_id|nid/i;

/**
 * Defensive second redaction pass for audit payloads (SEC-013). The backend
 * already redacts; this guarantees the UI never prints a secret or a full
 * national ID even if one slips through. Masked values (****1234) are kept.
 */
export function redact(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => redact(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v, k)]));
  }
  if (key && SENSITIVE_KEY.test(key) && value !== null) {
    const s = String(value);
    if (/^\*{4}\d{4}$/.test(s)) return s;
    if (/national_id|nid/i.test(key) && /\d{4}$/.test(s)) return `****${s.slice(-4)}`;
    return "[redacted]";
  }
  if (typeof value === "string") return value.replace(/\b\d{14}\b/g, (m) => `****${m.slice(-4)}`);
  return value;
}

export function JsonBlock({ value, emptyLabel }: { value: unknown; emptyLabel: string }) {
  if (value === null || value === undefined) {
    return <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }
  return (
    <pre dir="ltr" className="max-h-72 overflow-auto rounded-md border border-border bg-background p-3 text-start font-mono text-xs leading-relaxed text-ink">
      {JSON.stringify(redact(value), null, 2)}
    </pre>
  );
}

/** Dots are path separators in the translation lookup, so permission keys use underscores. */
export const permissionKey = (p: Permission) => p.replace(/\./g, "_");
