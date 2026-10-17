"use client";

import { useT } from "@/i18n/use-t";
import type { Price } from "@/mock/properties";

import { useFormat } from "./format";

/** First listed price of a unit model plus a "+N more" hint. Currencies are never mixed or converted. */
export function PriceSummary({ prices }: { prices: Price[] }) {
  const t = useT("properties");
  const f = useFormat();
  if (prices.length === 0) return <span className="text-ink-muted">{t("shared.noPrice")}</span>;
  const [first, ...rest] = prices;
  return (
    <div>
      <span dir="ltr" className="inline-block font-medium text-ink tabular-nums">
        {f.money(first.amount, first.currency)}
      </span>
      {rest.length > 0 && <p className="text-xs text-ink-muted">{t("shared.morePrices", { count: rest.length })}</p>}
    </div>
  );
}
