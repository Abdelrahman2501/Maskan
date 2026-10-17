"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n/use-t";
import type { PublishStatus } from "@/mock/training";

export function PublishBadge({ status, archived = false }: { status: PublishStatus; archived?: boolean }) {
  const t = useT("training");
  if (archived) return <Badge tone="neutral">{t("status.archived")}</Badge>;
  return (
    <Badge tone={status === "published" ? "success" : "warning"}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(`status.${status}`)}
    </Badge>
  );
}
