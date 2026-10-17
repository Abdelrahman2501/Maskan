/**
 * PROTOTYPE SAMPLE DATA — fictional developments, not real listings or developers.
 * Kept consistent with mobile/src/mock/properties.ts (same compounds, unit
 * models and prices) plus admin-only fields: active/published flags, media
 * library, price ids, updated_by and append-only price history.
 */

export type Localized = { en: string; ar: string };

export type CompoundStatus = "launching" | "under_construction" | "ready";
export const COMPOUND_STATUSES: CompoundStatus[] = ["launching", "under_construction", "ready"];

export type Availability = "available" | "limited" | "sold_out";
export const AVAILABILITIES: Availability[] = ["available", "limited", "sold_out"];

/** ISO 4217 codes the prototype offers. Amounts are never converted between them. */
export const CURRENCIES = ["EGP", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Location = { id: string; slug: string; name: Localized; isActive: boolean };

export type PropertyType = { id: string; key: string; name: Localized; isActive: boolean };

export type Compound = {
  id: string;
  locationId: string;
  name: Localized;
  developer: Localized;
  description: Localized;
  address: Localized;
  amenities: Localized[];
  status: CompoundStatus;
  deliveryYear: number;
  published: boolean;
  /** Index into the placeholder cover palette. */
  coverTone: number;
};

export type ExtraSpec = { label: Localized; value: Localized };

export type UnitModel = {
  id: string;
  compoundId: string;
  propertyTypeId: string;
  name: Localized;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  floor: Localized;
  finishing: Localized;
  view: Localized;
  availability: Availability;
  extraSpecs: ExtraSpec[];
};

export type PriceHistoryEntry = { amount: string; currency: string; changedBy: string; changedAt: string };

export type Price = {
  id: string;
  unitModelId: string;
  label: Localized;
  /** NUMERIC(14,2) as a decimal string — never a float. */
  amount: string;
  currency: string;
  updatedAt: string;
  updatedBy: string;
  /** Append-only, newest first. The first row is the current value. */
  history: PriceHistoryEntry[];
};

export type MediaKind = "image" | "floor_plan" | "video";
export const MEDIA_KINDS: MediaKind[] = ["image", "floor_plan", "video"];

export type MediaItem = {
  id: string;
  parentType: "compound" | "unit_model";
  parentId: string;
  kind: MediaKind;
  fileName: string;
  sizeBytes: number;
  position: number;
  caption?: Localized;
};

export type ActivityEntry = { id: string; actor: string; action: string; at: string; detail: string };

export const LOCATIONS: Location[] = [
  { id: "new-cairo", slug: "new-cairo", name: { en: "New Cairo", ar: "القاهرة الجديدة" }, isActive: true },
  { id: "mostakbal", slug: "mostakbal-city", name: { en: "Mostakbal City", ar: "مدينة المستقبل" }, isActive: true },
  {
    id: "new-capital",
    slug: "new-administrative-capital",
    name: { en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" },
    isActive: true,
  },
  { id: "north-coast", slug: "north-coast", name: { en: "North Coast", ar: "الساحل الشمالي" }, isActive: false },
];

export const PROPERTY_TYPES: PropertyType[] = [
  { id: "apartment", key: "apartment", name: { en: "Apartment", ar: "شقة" }, isActive: true },
  { id: "villa", key: "villa", name: { en: "Villa", ar: "فيلا" }, isActive: true },
  { id: "townhouse", key: "townhouse", name: { en: "Townhouse", ar: "تاون هاوس" }, isActive: true },
  { id: "twinhouse", key: "twinhouse", name: { en: "Twin house", ar: "توين هاوس" }, isActive: true },
  { id: "chalet", key: "chalet", name: { en: "Chalet", ar: "شاليه" }, isActive: false },
];

export const COMPOUNDS: Compound[] = [
  {
    id: "palm-ridge",
    locationId: "new-cairo",
    name: { en: "Palm Ridge Residences", ar: "بالم ريدج ريزيدنسز" },
    developer: { en: "Sample Developments Co.", ar: "شركة نموذج للتطوير" },
    description: {
      en: "A gated community of low-rise apartments and villas set around central landscaped gardens, minutes from the 90th Street business district.",
      ar: "مجتمع سكني مسوّر من الشقق منخفضة الارتفاع والفيلات حول حدائق مركزية، على بُعد دقائق من منطقة أعمال شارع التسعين.",
    },
    address: { en: "90th Street, Fifth Settlement, New Cairo", ar: "شارع التسعين، التجمع الخامس، القاهرة الجديدة" },
    amenities: [
      { en: "Clubhouse", ar: "نادٍ اجتماعي" },
      { en: "Swimming pools", ar: "حمامات سباحة" },
      { en: "24/7 security", ar: "أمن على مدار الساعة" },
      { en: "Kids area", ar: "منطقة أطفال" },
      { en: "Jogging track", ar: "مضمار جري" },
      { en: "Retail strip", ar: "منطقة تجارية" },
    ],
    status: "under_construction",
    deliveryYear: 2028,
    published: true,
    coverTone: 0,
  },
  {
    id: "lotus-gardens",
    locationId: "new-cairo",
    name: { en: "Lotus Gardens", ar: "لوتس جاردنز" },
    developer: { en: "Sample Urban Group", ar: "مجموعة نموذج العمرانية" },
    description: {
      en: "Family townhouses and twin houses with private gardens in the quiet Lotus district.",
      ar: "تاون هاوس وتوين هاوس عائلية بحدائق خاصة في حي اللوتس الهادئ.",
    },
    address: { en: "El Lotus, New Cairo", ar: "حي اللوتس، القاهرة الجديدة" },
    amenities: [
      { en: "Private gardens", ar: "حدائق خاصة" },
      { en: "Mosque", ar: "مسجد" },
      { en: "Gym", ar: "صالة رياضية" },
      { en: "Underground parking", ar: "جراج تحت الأرض" },
    ],
    status: "ready",
    deliveryYear: 2026,
    published: true,
    coverTone: 1,
  },
  {
    id: "the-crest",
    locationId: "new-cairo",
    name: { en: "The Crest", ar: "ذا كريست" },
    developer: { en: "Sample Developments Co.", ar: "شركة نموذج للتطوير" },
    description: {
      en: "Premium serviced apartments with skyline views, priced for international buyers.",
      ar: "شقق فندقية فاخرة بإطلالات على الأفق، بأسعار موجهة للمشترين الدوليين.",
    },
    address: { en: "South Teseen, New Cairo", ar: "جنوب التسعين، القاهرة الجديدة" },
    amenities: [
      { en: "Concierge", ar: "خدمة كونسيرج" },
      { en: "Rooftop pool", ar: "حمام سباحة على السطح" },
      { en: "Co-working lounge", ar: "مساحة عمل مشتركة" },
    ],
    status: "launching",
    deliveryYear: 2029,
    published: true,
    coverTone: 2,
  },
  {
    id: "horizon-park",
    locationId: "mostakbal",
    name: { en: "Horizon Park", ar: "هورايزون بارك" },
    developer: { en: "Sample Urban Group", ar: "مجموعة نموذج العمرانية" },
    description: {
      en: "A green, walkable neighborhood of apartments and villas in Mostakbal City.",
      ar: "حي أخضر صديق للمشاة من الشقق والفيلات في مدينة المستقبل.",
    },
    address: { en: "Mostakbal City, East Cairo", ar: "مدينة المستقبل، شرق القاهرة" },
    amenities: [
      { en: "Central park", ar: "حديقة مركزية" },
      { en: "Schools nearby", ar: "مدارس قريبة" },
      { en: "Cycling lanes", ar: "مسارات دراجات" },
    ],
    status: "under_construction",
    deliveryYear: 2028,
    published: true,
    coverTone: 3,
  },
  {
    id: "capital-heights",
    locationId: "new-capital",
    name: { en: "Capital Heights", ar: "كابيتال هايتس" },
    developer: { en: "Sample Capital Partners", ar: "شركاء نموذج العاصمة" },
    description: {
      en: "Mid-rise apartments next to the Government District and the monorail line.",
      ar: "شقق متوسطة الارتفاع بجوار الحي الحكومي وخط المونوريل.",
    },
    address: { en: "R7, New Administrative Capital", ar: "الحي السابع، العاصمة الإدارية الجديدة" },
    amenities: [
      { en: "Monorail access", ar: "قرب المونوريل" },
      { en: "Smart home", ar: "منزل ذكي" },
      { en: "Commercial mall", ar: "مول تجاري" },
    ],
    status: "under_construction",
    deliveryYear: 2027,
    published: false,
    coverTone: 4,
  },
];

const spec = (en: string, ar: string, ven: string, var_: string): ExtraSpec => ({
  label: { en, ar },
  value: { en: ven, ar: var_ },
});

export const UNIT_MODELS: UnitModel[] = [
  {
    id: "pr-a",
    compoundId: "palm-ridge",
    propertyTypeId: "apartment",
    name: { en: "Type A — Garden apartment", ar: "النموذج A — شقة بحديقة" },
    areaSqm: 145,
    bedrooms: 3,
    bathrooms: 2,
    floor: { en: "Ground floor", ar: "الدور الأرضي" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Landscape", ar: "إطلالة على الحدائق" },
    availability: "available",
    extraSpecs: [
      spec("Garden", "الحديقة", "60 m²", "60 م²"),
      spec("Down payment", "المقدم", "10%", "10%"),
      spec("Delivery", "الاستلام", "Q2 2028", "الربع الثاني 2028"),
      spec("Parking", "جراج", "1 space", "مكان واحد"),
    ],
  },
  {
    id: "pr-b",
    compoundId: "palm-ridge",
    propertyTypeId: "apartment",
    name: { en: "Type B — Typical apartment", ar: "النموذج B — شقة متكررة" },
    areaSqm: 120,
    bedrooms: 2,
    bathrooms: 2,
    floor: { en: "Floors 1–4", ar: "الأدوار 1–4" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Pool", ar: "إطلالة على حمام السباحة" },
    availability: "limited",
    extraSpecs: [spec("Down payment", "المقدم", "10%", "10%"), spec("Delivery", "الاستلام", "Q2 2028", "الربع الثاني 2028")],
  },
  {
    id: "pr-c",
    compoundId: "palm-ridge",
    propertyTypeId: "villa",
    name: { en: "Type C — Standalone villa", ar: "النموذج C — فيلا مستقلة" },
    areaSqm: 310,
    bedrooms: 5,
    bathrooms: 4,
    floor: { en: "Ground + 2", ar: "أرضي + دورين" },
    finishing: { en: "Core & shell", ar: "نصف تشطيب" },
    view: { en: "Lake", ar: "إطلالة على البحيرة" },
    availability: "available",
    extraSpecs: [
      spec("Land area", "مساحة الأرض", "480 m²", "480 م²"),
      spec("Pool", "حمام سباحة", "Optional", "اختياري"),
      spec("Delivery", "الاستلام", "Q4 2028", "الربع الرابع 2028"),
    ],
  },
  {
    id: "lg-a",
    compoundId: "lotus-gardens",
    propertyTypeId: "townhouse",
    name: { en: "Townhouse — Corner", ar: "تاون هاوس — كورنر" },
    areaSqm: 220,
    bedrooms: 4,
    bathrooms: 3,
    floor: { en: "Ground + 1 + roof", ar: "أرضي + دور + روف" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Garden", ar: "إطلالة على الحديقة" },
    availability: "limited",
    extraSpecs: [spec("Garden", "الحديقة", "120 m²", "120 م²"), spec("Delivery", "الاستلام", "Immediate", "فوري")],
  },
  {
    id: "lg-b",
    compoundId: "lotus-gardens",
    propertyTypeId: "twinhouse",
    name: { en: "Twin house", ar: "توين هاوس" },
    areaSqm: 260,
    bedrooms: 4,
    bathrooms: 4,
    floor: { en: "Ground + 1 + roof", ar: "أرضي + دور + روف" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Garden", ar: "إطلالة على الحديقة" },
    availability: "sold_out",
    extraSpecs: [spec("Garden", "الحديقة", "180 m²", "180 م²")],
  },
  {
    id: "cr-a",
    compoundId: "the-crest",
    propertyTypeId: "apartment",
    name: { en: "Studio suite", ar: "جناح استوديو" },
    areaSqm: 68,
    bedrooms: 1,
    bathrooms: 1,
    floor: { en: "Floors 6–14", ar: "الأدوار 6–14" },
    finishing: { en: "Furnished", ar: "مفروش" },
    view: { en: "Skyline", ar: "إطلالة على الأفق" },
    availability: "available",
    extraSpecs: [spec("Service charge", "رسوم الخدمة", "8% yearly", "8% سنويًا")],
  },
  {
    id: "hp-a",
    compoundId: "horizon-park",
    propertyTypeId: "apartment",
    name: { en: "Type A — Apartment", ar: "النموذج A — شقة" },
    areaSqm: 135,
    bedrooms: 3,
    bathrooms: 2,
    floor: { en: "Floors 1–5", ar: "الأدوار 1–5" },
    finishing: { en: "Semi-finished", ar: "نصف تشطيب" },
    view: { en: "Park", ar: "إطلالة على الحديقة" },
    availability: "available",
    extraSpecs: [spec("Down payment", "المقدم", "5%", "5%")],
  },
  {
    id: "ch-a",
    compoundId: "capital-heights",
    propertyTypeId: "apartment",
    name: { en: "Type A — Apartment", ar: "النموذج A — شقة" },
    areaSqm: 150,
    bedrooms: 3,
    bathrooms: 3,
    floor: { en: "Floors 2–8", ar: "الأدوار 2–8" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Boulevard", ar: "إطلالة على البوليفارد" },
    availability: "available",
    extraSpecs: [spec("Delivery", "الاستلام", "2027", "2027")],
  },
];

const UPDATED = "2026-10-12T09:00:00Z";

function price(
  id: string,
  unitModelId: string,
  label: Localized,
  amount: string,
  currency: string,
  previous: { amount: string; changedAt: string; changedBy: string }[] = [],
): Price {
  return {
    id,
    unitModelId,
    label,
    amount,
    currency,
    updatedAt: UPDATED,
    updatedBy: "Dina Wael",
    history: [
      { amount, currency, changedBy: "Dina Wael", changedAt: UPDATED },
      ...previous.map((p) => ({ ...p, currency })),
    ],
  };
}

const CASH = { en: "Cash price", ar: "سعر الكاش" };

export const PRICES: Price[] = [
  price("pr-a-cash", "pr-a", CASH, "6850000.00", "EGP", [
    { amount: "6500000.00", changedAt: "2026-07-01T09:00:00Z", changedBy: "Dina Wael" },
    { amount: "6200000.00", changedAt: "2026-03-15T10:30:00Z", changedBy: "Nour Salem" },
  ]),
  price("pr-a-inst", "pr-a", { en: "8-year installments", ar: "تقسيط على 8 سنوات" }, "7900000.00", "EGP", [
    { amount: "7600000.00", changedAt: "2026-07-01T09:00:00Z", changedBy: "Dina Wael" },
  ]),
  price("pr-b-cash", "pr-b", CASH, "5600000.00", "EGP", [
    { amount: "5350000.00", changedAt: "2026-07-01T09:00:00Z", changedBy: "Dina Wael" },
  ]),
  price("pr-c-cash", "pr-c", CASH, "24500000.00", "EGP"),
  price("pr-c-usd", "pr-c", { en: "Cash price (USD)", ar: "سعر الكاش (دولار)" }, "495000.00", "USD", [
    { amount: "480000.00", changedAt: "2026-05-20T12:00:00Z", changedBy: "Dina Wael" },
  ]),
  price("lg-a-cash", "lg-a", CASH, "12400000.00", "EGP", [
    { amount: "11900000.00", changedAt: "2026-06-10T08:00:00Z", changedBy: "Dina Wael" },
  ]),
  price("lg-b-last", "lg-b", { en: "Last listed price", ar: "آخر سعر معلن" }, "15200000.00", "EGP"),
  price("cr-a-usd", "cr-a", { en: "Price (USD)", ar: "السعر (دولار)" }, "185000.00", "USD"),
  price("cr-a-eur", "cr-a", { en: "Price (EUR)", ar: "السعر (يورو)" }, "171000.00", "EUR"),
  price("hp-a-cash", "hp-a", CASH, "4950000.00", "EGP", [
    { amount: "4700000.00", changedAt: "2026-04-02T11:00:00Z", changedBy: "Nour Salem" },
  ]),
  price("ch-a-cash", "ch-a", CASH, "5300000.00", "EGP"),
];

/** Mirrors mobile mediaCount / hasVideo / hasFloorPlan with a few representative files. */
export const MEDIA: MediaItem[] = [
  { id: "m-01", parentType: "compound", parentId: "palm-ridge", kind: "image", fileName: "palm-ridge-entrance.jpg", sizeBytes: 2_480_000, position: 1 },
  { id: "m-02", parentType: "compound", parentId: "palm-ridge", kind: "image", fileName: "palm-ridge-gardens.jpg", sizeBytes: 3_120_000, position: 2 },
  { id: "m-03", parentType: "compound", parentId: "palm-ridge", kind: "image", fileName: "palm-ridge-clubhouse.jpg", sizeBytes: 2_050_000, position: 3 },
  { id: "m-04", parentType: "compound", parentId: "palm-ridge", kind: "video", fileName: "palm-ridge-tour.mp4", sizeBytes: 84_500_000, position: 4 },
  { id: "m-05", parentType: "unit_model", parentId: "pr-a", kind: "floor_plan", fileName: "type-a-floor-plan.pdf", sizeBytes: 640_000, position: 1 },
  { id: "m-06", parentType: "unit_model", parentId: "pr-a", kind: "image", fileName: "type-a-living-room.jpg", sizeBytes: 2_760_000, position: 2 },
  { id: "m-07", parentType: "unit_model", parentId: "pr-a", kind: "video", fileName: "type-a-walkthrough.mp4", sizeBytes: 61_200_000, position: 3 },
  { id: "m-08", parentType: "unit_model", parentId: "pr-c", kind: "floor_plan", fileName: "villa-c-ground-floor.png", sizeBytes: 910_000, position: 1 },
  { id: "m-09", parentType: "compound", parentId: "lotus-gardens", kind: "image", fileName: "lotus-gardens-street.jpg", sizeBytes: 2_330_000, position: 1 },
  { id: "m-10", parentType: "compound", parentId: "lotus-gardens", kind: "video", fileName: "lotus-gardens-aerial.mp4", sizeBytes: 120_400_000, position: 2 },
  { id: "m-11", parentType: "unit_model", parentId: "lg-a", kind: "floor_plan", fileName: "townhouse-corner-plan.png", sizeBytes: 780_000, position: 1 },
  { id: "m-12", parentType: "compound", parentId: "the-crest", kind: "image", fileName: "the-crest-skyline.jpg", sizeBytes: 3_400_000, position: 1 },
  { id: "m-13", parentType: "unit_model", parentId: "cr-a", kind: "video", fileName: "studio-suite-tour.mp4", sizeBytes: 45_800_000, position: 1 },
  { id: "m-14", parentType: "compound", parentId: "horizon-park", kind: "image", fileName: "horizon-park-central-park.jpg", sizeBytes: 2_910_000, position: 1 },
  { id: "m-15", parentType: "unit_model", parentId: "hp-a", kind: "floor_plan", fileName: "horizon-type-a-plan.png", sizeBytes: 690_000, position: 1 },
  { id: "m-16", parentType: "compound", parentId: "capital-heights", kind: "image", fileName: "capital-heights-facade.jpg", sizeBytes: 2_640_000, position: 1 },
];

export const COMPOUND_ACTIVITY: Record<string, ActivityEntry[]> = {
  "palm-ridge": [
    { id: "a1", actor: "Dina Wael", action: "price.updated", at: "2026-10-12T09:00:00Z", detail: "pr-a-cash · 6,500,000.00 → 6,850,000.00 EGP" },
    { id: "a2", actor: "Dina Wael", action: "media.uploaded", at: "2026-10-05T14:20:00Z", detail: "palm-ridge-tour.mp4" },
    { id: "a3", actor: "Nour Salem", action: "compound.published", at: "2026-09-01T08:00:00Z", detail: "published = true" },
    { id: "a4", actor: "Dina Wael", action: "compound.created", at: "2026-08-28T11:45:00Z", detail: "Palm Ridge Residences" },
  ],
};

export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id);
export const compoundById = (id: string) => COMPOUNDS.find((c) => c.id === id);
export const unitModelById = (id: string) => UNIT_MODELS.find((u) => u.id === id);
export const propertyTypeById = (id: string) => PROPERTY_TYPES.find((p) => p.id === id);
