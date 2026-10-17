/**
 * PROTOTYPE SAMPLE DATA — fictional developments, not real listings or developers
 * (BR-3.6). Real catalogue content is supplied by the client.
 */
import type { Localized } from "@/lib/localized";

export type Price = { label: Localized; amount: number; currency: string; updatedAt: string };

export type UnitModel = {
  id: string;
  compoundId: string;
  name: Localized;
  propertyTypeId: string;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  floor: Localized;
  finishing: Localized;
  view: Localized;
  availability: "available" | "limited" | "sold_out";
  prices: Price[];
  specs: { label: Localized; value: Localized }[];
  mediaCount: number;
  hasVideo: boolean;
  hasFloorPlan: boolean;
};

export type Compound = {
  id: string;
  locationId: string;
  name: Localized;
  developer: Localized;
  description: Localized;
  address: Localized;
  amenities: Localized[];
  propertyTypeIds: string[];
  status: "launching" | "under_construction" | "ready";
  deliveryYear: number;
  startingPrice: { amount: number; currency: string };
  featured: boolean;
  /** Index into the placeholder gradient palette. */
  coverTone: number;
};

export type Location = { id: string; name: Localized; compoundCount: number };

export type PropertyType = { id: string; name: Localized; icon: string };

export const PROPERTY_TYPES: PropertyType[] = [
  { id: "apartment", name: { en: "Apartment", ar: "شقة" }, icon: "business-outline" },
  { id: "villa", name: { en: "Villa", ar: "فيلا" }, icon: "home-outline" },
  { id: "townhouse", name: { en: "Townhouse", ar: "تاون هاوس" }, icon: "home-outline" },
  { id: "twinhouse", name: { en: "Twin house", ar: "توين هاوس" }, icon: "home-outline" },
];

export const LOCATIONS: Location[] = [
  { id: "new-cairo", name: { en: "New Cairo", ar: "القاهرة الجديدة" }, compoundCount: 3 },
  { id: "mostakbal", name: { en: "Mostakbal City", ar: "مدينة المستقبل" }, compoundCount: 1 },
  { id: "new-capital", name: { en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" }, compoundCount: 1 },
];

const UPDATED = "2026-10-12T09:00:00Z";

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
    propertyTypeIds: ["apartment", "villa"],
    status: "under_construction",
    deliveryYear: 2028,
    startingPrice: { amount: 6_850_000, currency: "EGP" },
    featured: true,
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
    propertyTypeIds: ["townhouse", "twinhouse"],
    status: "ready",
    deliveryYear: 2026,
    startingPrice: { amount: 12_400_000, currency: "EGP" },
    featured: true,
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
    propertyTypeIds: ["apartment"],
    status: "launching",
    deliveryYear: 2029,
    startingPrice: { amount: 185_000, currency: "USD" },
    featured: false,
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
    propertyTypeIds: ["apartment", "villa"],
    status: "under_construction",
    deliveryYear: 2028,
    startingPrice: { amount: 4_950_000, currency: "EGP" },
    featured: false,
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
    propertyTypeIds: ["apartment"],
    status: "under_construction",
    deliveryYear: 2027,
    startingPrice: { amount: 5_300_000, currency: "EGP" },
    featured: false,
    coverTone: 4,
  },
];

const spec = (en: string, ar: string, ven: string, var_: string) => ({
  label: { en, ar },
  value: { en: ven, ar: var_ },
});

export const UNIT_MODELS: UnitModel[] = [
  {
    id: "pr-a",
    compoundId: "palm-ridge",
    name: { en: "Type A — Garden apartment", ar: "النموذج A — شقة بحديقة" },
    propertyTypeId: "apartment",
    areaSqm: 145,
    bedrooms: 3,
    bathrooms: 2,
    floor: { en: "Ground floor", ar: "الدور الأرضي" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Landscape", ar: "إطلالة على الحدائق" },
    availability: "available",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 6_850_000, currency: "EGP", updatedAt: UPDATED },
      { label: { en: "8-year installments", ar: "تقسيط على 8 سنوات" }, amount: 7_900_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [
      spec("Garden", "الحديقة", "60 m²", "60 م²"),
      spec("Down payment", "المقدم", "10%", "10%"),
      spec("Delivery", "الاستلام", "Q2 2028", "الربع الثاني 2028"),
      spec("Parking", "جراج", "1 space", "مكان واحد"),
    ],
    mediaCount: 8,
    hasVideo: true,
    hasFloorPlan: true,
  },
  {
    id: "pr-b",
    compoundId: "palm-ridge",
    name: { en: "Type B — Typical apartment", ar: "النموذج B — شقة متكررة" },
    propertyTypeId: "apartment",
    areaSqm: 120,
    bedrooms: 2,
    bathrooms: 2,
    floor: { en: "Floors 1–4", ar: "الأدوار 1–4" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Pool", ar: "إطلالة على حمام السباحة" },
    availability: "limited",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 5_600_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [
      spec("Down payment", "المقدم", "10%", "10%"),
      spec("Delivery", "الاستلام", "Q2 2028", "الربع الثاني 2028"),
    ],
    mediaCount: 6,
    hasVideo: false,
    hasFloorPlan: true,
  },
  {
    id: "pr-c",
    compoundId: "palm-ridge",
    name: { en: "Type C — Standalone villa", ar: "النموذج C — فيلا مستقلة" },
    propertyTypeId: "villa",
    areaSqm: 310,
    bedrooms: 5,
    bathrooms: 4,
    floor: { en: "Ground + 2", ar: "أرضي + دورين" },
    finishing: { en: "Core & shell", ar: "نصف تشطيب" },
    view: { en: "Lake", ar: "إطلالة على البحيرة" },
    availability: "available",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 24_500_000, currency: "EGP", updatedAt: UPDATED },
      { label: { en: "Cash price (USD)", ar: "سعر الكاش (دولار)" }, amount: 495_000, currency: "USD", updatedAt: UPDATED },
    ],
    specs: [
      spec("Land area", "مساحة الأرض", "480 m²", "480 م²"),
      spec("Pool", "حمام سباحة", "Optional", "اختياري"),
      spec("Delivery", "الاستلام", "Q4 2028", "الربع الرابع 2028"),
    ],
    mediaCount: 12,
    hasVideo: true,
    hasFloorPlan: true,
  },
  {
    id: "lg-a",
    compoundId: "lotus-gardens",
    name: { en: "Townhouse — Corner", ar: "تاون هاوس — كورنر" },
    propertyTypeId: "townhouse",
    areaSqm: 220,
    bedrooms: 4,
    bathrooms: 3,
    floor: { en: "Ground + 1 + roof", ar: "أرضي + دور + روف" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Garden", ar: "إطلالة على الحديقة" },
    availability: "limited",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 12_400_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [spec("Garden", "الحديقة", "120 m²", "120 م²"), spec("Delivery", "الاستلام", "Immediate", "فوري")],
    mediaCount: 9,
    hasVideo: true,
    hasFloorPlan: true,
  },
  {
    id: "lg-b",
    compoundId: "lotus-gardens",
    name: { en: "Twin house", ar: "توين هاوس" },
    propertyTypeId: "twinhouse",
    areaSqm: 260,
    bedrooms: 4,
    bathrooms: 4,
    floor: { en: "Ground + 1 + roof", ar: "أرضي + دور + روف" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Garden", ar: "إطلالة على الحديقة" },
    availability: "sold_out",
    prices: [
      { label: { en: "Last listed price", ar: "آخر سعر معلن" }, amount: 15_200_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [spec("Garden", "الحديقة", "180 m²", "180 م²")],
    mediaCount: 7,
    hasVideo: false,
    hasFloorPlan: true,
  },
  {
    id: "cr-a",
    compoundId: "the-crest",
    name: { en: "Studio suite", ar: "جناح استوديو" },
    propertyTypeId: "apartment",
    areaSqm: 68,
    bedrooms: 1,
    bathrooms: 1,
    floor: { en: "Floors 6–14", ar: "الأدوار 6–14" },
    finishing: { en: "Furnished", ar: "مفروش" },
    view: { en: "Skyline", ar: "إطلالة على الأفق" },
    availability: "available",
    prices: [
      { label: { en: "Price (USD)", ar: "السعر (دولار)" }, amount: 185_000, currency: "USD", updatedAt: UPDATED },
      { label: { en: "Price (EUR)", ar: "السعر (يورو)" }, amount: 171_000, currency: "EUR", updatedAt: UPDATED },
    ],
    specs: [spec("Service charge", "رسوم الخدمة", "8% yearly", "8% سنويًا")],
    mediaCount: 5,
    hasVideo: true,
    hasFloorPlan: false,
  },
  {
    id: "hp-a",
    compoundId: "horizon-park",
    name: { en: "Type A — Apartment", ar: "النموذج A — شقة" },
    propertyTypeId: "apartment",
    areaSqm: 135,
    bedrooms: 3,
    bathrooms: 2,
    floor: { en: "Floors 1–5", ar: "الأدوار 1–5" },
    finishing: { en: "Semi-finished", ar: "نصف تشطيب" },
    view: { en: "Park", ar: "إطلالة على الحديقة" },
    availability: "available",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 4_950_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [spec("Down payment", "المقدم", "5%", "5%")],
    mediaCount: 6,
    hasVideo: false,
    hasFloorPlan: true,
  },
  {
    id: "ch-a",
    compoundId: "capital-heights",
    name: { en: "Type A — Apartment", ar: "النموذج A — شقة" },
    propertyTypeId: "apartment",
    areaSqm: 150,
    bedrooms: 3,
    bathrooms: 3,
    floor: { en: "Floors 2–8", ar: "الأدوار 2–8" },
    finishing: { en: "Fully finished", ar: "تشطيب كامل" },
    view: { en: "Boulevard", ar: "إطلالة على البوليفارد" },
    availability: "available",
    prices: [
      { label: { en: "Cash price", ar: "سعر الكاش" }, amount: 5_300_000, currency: "EGP", updatedAt: UPDATED },
    ],
    specs: [spec("Delivery", "الاستلام", "2027", "2027")],
    mediaCount: 6,
    hasVideo: false,
    hasFloorPlan: true,
  },
];

export const compoundById = (id: string) => COMPOUNDS.find((c) => c.id === id);
export const unitModelById = (id: string) => UNIT_MODELS.find((u) => u.id === id);
export const unitModelsForCompound = (compoundId: string) => UNIT_MODELS.filter((u) => u.compoundId === compoundId);
export const compoundsForLocation = (locationId: string) => COMPOUNDS.filter((c) => c.locationId === locationId);
export const propertyTypeById = (id: string) => PROPERTY_TYPES.find((p) => p.id === id);
