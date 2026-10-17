"use client";

import { ArrowRight, BadgeCheck, Building2, GraduationCap, ShieldCheck, Smartphone, Video } from "lucide-react";
import Link from "next/link";

import { LanguageSwitch } from "@/components/brand/language-switch";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "s1", icon: ShieldCheck },
  { key: "s2", icon: Video },
  { key: "s3", icon: GraduationCap },
  { key: "s4", icon: Building2 },
] as const;

function StoreBadges({ className }: { className?: string }) {
  const t = useT("landing");
  // Store listings don't exist yet (CR-001); badges link to the download section.
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      {[t("appStore"), t("googlePlay")].map((label) => (
        <a
          key={label}
          href="#download"
          className="inline-flex h-12 items-center gap-3 rounded-md border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
        >
          <Smartphone className="size-5" aria-hidden="true" />
          <span className="flex flex-col leading-tight">
            <span>{label}</span>
            <span className="text-[11px] font-normal text-white/60">{t("soon")}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

// Stage 1 — Public landing (PLAT-008). Applicants are pointed to the mobile app (ADR-0003).
export default function LandingPage() {
  const t = useT("landing");

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-white)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-white)_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-40 end-[-10%] -z-10 size-[36rem] rounded-full bg-navy-secondary opacity-60 blur-3xl"
        />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <Logo tone="light" />
          <nav className="flex items-center gap-2">
            <LanguageSwitch inverse />
            <Link href="/login" className={buttonVariants({ variant: "inverse-outline", size: "sm" })}>
              {t("nav.staffLogin")}
            </Link>
          </nav>
        </header>

        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div className="flex flex-col gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {t("badge")}
            </p>
            <h1 className="text-4xl leading-[1.15] font-bold tracking-tight text-balance sm:text-5xl">{t("title")}</h1>
            <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t("body")}</p>
            <div className="flex flex-col gap-3">
              <a href="#download" className={cn(buttonVariants({ variant: "inverse", size: "lg" }), "w-full sm:w-fit")}>
                {t("download")}
                <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
              </a>
            </div>
          </div>

          <ul className="flex flex-col justify-center gap-3 self-center">
            {(["b1", "b2", "b3"] as const).map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85 backdrop-blur-sm"
              >
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                {t(`benefits.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {t("how.title")}
            </h2>
            <p className="mt-3 text-ink-muted">{t("how.subtitle")}</p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ key, icon: Icon }, index) => (
              <li key={key} className="rounded-lg border border-border bg-surface p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md bg-navy text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-semibold text-ink">{t(`how.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(`how.${key}.body`)}</p>
              </li>
            ))}
          </ol>

          <div
            id="download"
            className="mt-12 flex scroll-mt-8 flex-col items-start gap-6 rounded-xl bg-navy p-8 text-white lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="text-lg font-semibold">{t("cta.title")}</p>
              <p className="mt-1 text-sm text-white/70">{t("cta.body")}</p>
            </div>
            <StoreBadges />
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo className="text-base" />
          <p>{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
