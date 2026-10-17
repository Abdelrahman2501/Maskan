import { resources } from "@/i18n/resources";

function keys(tree: unknown, prefix = ""): string[] {
  if (!tree || typeof tree !== "object") return [prefix];
  return Object.entries(tree).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

// covers: BR-6.2 — every English key has an Arabic translation and vice versa.
describe("translation catalogues", () => {
  const namespaces = Object.keys(resources.en) as (keyof typeof resources.en)[];

  it.each(namespaces)('"%s" has identical keys in en and ar', (ns) => {
    expect(keys(resources.ar[ns]).sort()).toEqual(keys(resources.en[ns]).sort());
  });

  it.each(namespaces)('"%s" has no empty strings', (ns) => {
    for (const lang of ["en", "ar"] as const) {
      const flat = JSON.stringify(resources[lang][ns]);
      expect(flat.includes('""')).toBe(false);
    }
  });
});
