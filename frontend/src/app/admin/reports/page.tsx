"use client";

import { Building2, Download, Home, Image as ImageIcon, MapPin, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import type { Role } from "@/components/admin/permissions";
import { BarList, ChartCard, ChartEmpty, ChartSkeleton, RingGauge, type BarItem } from "@/components/administration/shared";
import { useFormat } from "@/components/recruitment/use-format";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { REPORT_RANGES, REPORTS, type ReportData, type ReportRange } from "@/mock/administration";
import { LEAD_STATUSES, type LeadStatus } from "@/mock/leads";

type Section = "recruitment" | "training" | "sales" | "catalogue";

/** Scoped report access (specs/02 §4): each role sees the reports for its area. */
const SECTIONS_BY_ROLE: Record<Role, Section[]> = {
  super_admin: ["recruitment", "training", "sales", "catalogue"],
  recruiter: ["recruitment"],
  training_admin: ["training"],
  sales_manager: ["sales"],
  property_manager: ["catalogue"],
};

const LEAD_TONE: Record<LeadStatus, BarItem["tone"]> = {
  new: "accent",
  contacted: "navy",
  interested: "navy",
  follow_up: "warning",
  viewing_scheduled: "navy",
  converted: "success",
  not_interested: "muted",
  unreachable: "error",
};

const FUNNEL_STEPS = ["registered", "phoneVerified", "identityApproved", "interviewAccepted", "qualified"] as const;

export default function ReportsPage() {
  const t = useT("administration");
  const ts = useT("shell");
  const f = useFormat();
  const toast = useToast();
  const { role } = useAdmin();
  const [range, setRange] = useState<ReportRange>("30d");
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const changeRange = (next: ReportRange) => {
    setRange(next);
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 350);
  };

  const data: ReportData = REPORTS[range];
  const sections = SECTIONS_BY_ROLE[role];
  const show = (s: Section) => sections.includes(s);

  const pctOf = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

  const funnelItems: BarItem[] = FUNNEL_STEPS.map((step, i) => {
    const value = data.funnel[step];
    const prev = i === 0 ? null : data.funnel[FUNNEL_STEPS[i - 1]];
    return {
      key: step,
      label: t(`reports.funnel.steps.${step}`),
      value,
      tone: step === "qualified" ? "success" : "navy",
      hint: prev === null ? undefined : t("reports.funnel.ofPrevious", { pct: f.percent(pctOf(value, prev)) }),
    };
  });

  const leadTotal = LEAD_STATUSES.reduce((n, s) => n + data.leadStatus[s], 0);
  const leadItems: BarItem[] = LEAD_STATUSES.map((s) => ({
    key: s,
    label: t(`reports.leads.statuses.${s}`),
    value: data.leadStatus[s],
    tone: LEAD_TONE[s],
    hint: leadTotal > 0 ? f.percent(pctOf(data.leadStatus[s], leadTotal)) : undefined,
  }));

  const qualRate = pctOf(data.quizPassed, data.quizAttempts);
  const overallConversion = pctOf(data.funnel.qualified, data.funnel.registered);

  const catalogue = [
    { key: "locations", icon: MapPin, value: data.catalogue.locations },
    { key: "compounds", icon: Building2, value: data.catalogue.compounds },
    { key: "unitModels", icon: Home, value: data.catalogue.unitModels },
    { key: "prices", icon: Tag, value: data.catalogue.prices },
    { key: "media", icon: ImageIcon, value: data.catalogue.media },
  ] as const;
  const catalogueEmpty = catalogue.every((c) => c.value === 0);

  return (
    <>
      <PageHeader
        title={t("reports.title")}
        description={role === "super_admin" ? t("reports.description") : t("reports.scoped", { role: ts(`roles.${role}`) })}
        breadcrumbs={[{ label: ts("groups.administration") }, { label: t("reports.title") }]}
        actions={
          <>
            <Select
              className="w-48"
              aria-label={t("reports.range.label")}
              value={range}
              onChange={(e) => changeRange(e.target.value as ReportRange)}
            >
              {REPORT_RANGES.map((r) => (
                <option key={r} value={r}>
                  {t(`reports.range.${r}`)}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => toast(t("reports.exportQueued"), "info")}>
              <Download aria-hidden="true" />
              {t("reports.export")}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {show("recruitment") && (
          <ChartCard
            title={t("reports.funnel.title")}
            description={t("reports.funnel.description")}
            className="lg:col-span-2"
          >
            {loading ? (
              <ChartSkeleton />
            ) : (
              <>
                <BarList items={funnelItems} format={f.number} emptyLabel={t("reports.emptyRange")} ariaLabel={t("reports.funnel.title")} />
                {data.funnel.registered > 0 && (
                  <p className="mt-4 border-t border-border pt-3 text-sm text-ink-muted">
                    {t("reports.funnel.overall", { pct: f.percent(overallConversion) })}
                  </p>
                )}
              </>
            )}
          </ChartCard>
        )}

        {show("sales") && (
          <ChartCard title={t("reports.leads.title")} description={t("reports.leads.description", { count: f.number(leadTotal) })}>
            {loading ? (
              <ChartSkeleton rows={8} />
            ) : (
              <BarList items={leadItems} format={f.number} emptyLabel={t("reports.emptyRange")} ariaLabel={t("reports.leads.title")} />
            )}
          </ChartCard>
        )}

        {show("training") && (
          <ChartCard title={t("reports.qualification.title")} description={t("reports.qualification.description")}>
            {loading ? (
              <Skeleton className="mx-auto size-36 rounded-full" />
            ) : data.quizAttempts === 0 ? (
              <ChartEmpty label={t("reports.emptyRange")} />
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
                <RingGauge value={qualRate} label={f.percent(qualRate)} />
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-1">
                  <div>
                    <dt className="text-ink-muted">{t("reports.qualification.attempts")}</dt>
                    <dd className="text-lg font-semibold text-ink tabular-nums">{f.number(data.quizAttempts)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">{t("reports.qualification.passed")}</dt>
                    <dd className="text-lg font-semibold text-success tabular-nums">{f.number(data.quizPassed)}</dd>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="text-ink-muted">{t("reports.qualification.failed")}</dt>
                    <dd className="text-lg font-semibold text-ink tabular-nums">{f.number(data.quizAttempts - data.quizPassed)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </ChartCard>
        )}

        {show("catalogue") && (
          <ChartCard
            title={t("reports.catalogue.title")}
            description={t("reports.catalogue.description")}
            className={sections.length === 4 ? "lg:col-span-2" : undefined}
          >
            {loading ? (
              <ChartSkeleton rows={2} />
            ) : catalogueEmpty ? (
              <ChartEmpty label={t("reports.catalogue.empty")} />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {catalogue.map(({ key, icon: Icon, value }) => (
                  <li key={key} className="flex items-center gap-3 rounded-md border border-border p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy/8 text-navy">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-ink tabular-nums">{f.number(value)}</p>
                      <p className="truncate text-xs text-ink-muted">{t(`reports.catalogue.items.${key}`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        )}
      </div>

      <p className="mt-6 text-xs text-ink-muted">{t("reports.footnote")}</p>
    </>
  );
}
