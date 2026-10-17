"use client";

import { useCallback } from "react";

import { dictionaries, type Namespace } from "./dictionaries";
import { useLocale } from "./locale-provider";

type Vars = Record<string, string | number>;

function lookup(tree: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) return (node as Record<string, unknown>)[key];
    return undefined;
  }, tree);
}

/**
 * Minimal translation hook: `t("section.key", { count: 3 })` with {{var}}
 * interpolation. Falls back to English, then to the key itself, so a missing
 * translation is visible but never crashes.
 */
export function useT(namespace: Namespace = "common") {
  const { language } = useLocale();
  return useCallback(
    (key: string, vars?: Vars): string => {
      const raw =
        lookup(dictionaries[language][namespace], key) ?? lookup(dictionaries.en[namespace], key) ?? key;
      const text = typeof raw === "string" ? raw : key;
      return vars ? text.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? "")) : text;
    },
    [language, namespace],
  );
}
