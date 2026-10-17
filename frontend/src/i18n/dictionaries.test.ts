import { describe, expect, it } from "vitest";

import { dictionaries } from "./dictionaries";

function keys(tree: unknown, prefix = ""): string[] {
  if (!tree || typeof tree !== "object") return [prefix];
  return Object.entries(tree).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

// covers: BR-6.2 — every English key has an Arabic translation and vice versa.
describe("translation catalogues", () => {
  for (const ns of Object.keys(dictionaries.en) as (keyof typeof dictionaries.en)[]) {
    it(`"${ns}" has identical keys in en and ar`, () => {
      expect(keys(dictionaries.ar[ns]).sort()).toEqual(keys(dictionaries.en[ns]).sort());
    });
  }
});
