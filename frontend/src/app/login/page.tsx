"use client";

import { Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { LanguageSwitch } from "@/components/brand/language-switch";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";
import { useT } from "@/i18n/use-t";

// Staff sign-in (prototype: any credentials continue to the admin dashboard).
export default function StaffLoginPage() {
  const t = useT("shell");
  const tc = useT();
  const router = useRouter();
  const [email, setEmail] = useState("nour.salem@elsakka.example");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(tc("states.errorGeneric"));
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => router.push("/admin"), 600);
  };

  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-deep p-10 text-white lg:flex">
        <div aria-hidden="true" className="absolute -top-32 -end-32 size-[28rem] rounded-full bg-navy-secondary opacity-60 blur-3xl" />
        <Link href="/" className="relative">
          <Logo tone="light" />
        </Link>
        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-bold">{t("adminTitle")}</p>
          <p className="mt-3 text-white/70">{t("login.subtitle")}</p>
        </div>
        <p className="relative text-xs text-white/50">{tc("prototype.banner")}</p>
      </div>

      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-5 sm:px-8">
          <Link href="/" className="lg:invisible">
            <Logo />
          </Link>
          <LanguageSwitch />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-ink">{t("login.title")}</h1>
              <p className="mt-1 text-sm text-ink-muted">{t("login.subtitle")}</p>
              <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
                {error && <p className="rounded-sm bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}
                <FormField label={t("login.email")} required>
                  {(p) => (
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                      <Input {...p} type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="ps-9" />
                    </div>
                  )}
                </FormField>
                <FormField label={t("login.password")} required>
                  {(p) => (
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                      <Input {...p} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="ps-9" />
                    </div>
                  )}
                </FormField>
                <button type="button" className="self-end text-sm text-accent hover:underline">
                  {t("login.forgot")}
                </button>
                <Button type="submit" size="lg" loading={loading}>
                  {t("login.submit")}
                </Button>
                <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
                  {t("login.skip")}
                </Link>
              </form>
              <p className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-ink-muted">
                <Smartphone className="size-4 shrink-0" aria-hidden="true" />
                {t("login.appHint")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
