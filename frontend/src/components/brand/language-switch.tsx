"use client";

import { Globe } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

/** EN ⇄ العربية switch. Shows the name of the language you'll switch to. */
export function LanguageSwitch({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  const { language, setLanguage } = useLocale();
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      aria-label={t("language.label")}
      className={cn(buttonVariants({ variant: inverse ? "inverse-outline" : "secondary", size: "sm" }), className)}
    >
      <Globe aria-hidden="true" />
      {t("language.switchTo")}
    </button>
  );
}
