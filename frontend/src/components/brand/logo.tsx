"use client";

import { House } from "lucide-react";

import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

/** Maskan wordmark (placeholder house mark until a final logo is designed). */
export function Logo({
  tone = "dark",
  iconOnly = false,
  className,
}: {
  tone?: "dark" | "light";
  iconOnly?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-lg font-bold tracking-tight",
        tone === "light" ? "text-white" : "text-navy",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-md",
          tone === "light" ? "bg-white text-navy" : "bg-navy text-white",
        )}
        aria-hidden="true"
      >
        <House className="size-4.5" />
      </span>
      {iconOnly ? <span className="sr-only">{t("brand")}</span> : t("brand")}
    </span>
  );
}
