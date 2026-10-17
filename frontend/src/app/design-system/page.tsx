import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Design system", robots: { index: false } };

const COLOR_TOKENS = [
  ["navy", "bg-navy"],
  ["navy-deep", "bg-navy-deep"],
  ["navy-secondary", "bg-navy-secondary"],
  ["accent", "bg-accent"],
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["border", "bg-border"],
  ["ink", "bg-ink"],
  ["ink-muted", "bg-ink-muted"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["error", "bg-error"],
  ["info", "bg-info"],
] as const;

// Development-only reference of tokens and primitives (specs/05-ui-ux-design-system.md).
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Design system</h1>
        <p className="mt-1 text-ink-muted">Tokens and primitives. Development builds only.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Color tokens</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {COLOR_TOKENS.map(([name, className]) => (
            <div key={name} className="overflow-hidden rounded-md border border-border bg-surface">
              <div className={`h-14 ${className}`} />
              <p className="px-2 py-1.5 text-xs font-medium text-ink">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-navy-deep p-4">
          <Button variant="inverse">Inverse</Button>
          <Button variant="inverse-outline">Inverse outline</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <StatusBadge status="approved" label="Approved" />
          <StatusBadge status="pending_review" label="Pending review" />
          <StatusBadge status="processing" label="Processing" />
          <StatusBadge status="rejected" label="Rejected" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-ink">Card body content.</CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
