/** PROTOTYPE SAMPLE DATA — fictional customers. */
import type { Localized } from "@/lib/localized";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "follow_up",
  "viewing_scheduled",
  "converted",
  "not_interested",
  "unreachable",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadNote = { id: string; author: string; body: string; at: string };

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest: Localized;
  compoundId?: string;
  budget?: { amount: number; currency: string };
  source: Localized;
  status: LeadStatus;
  assignedAt: string;
  assignedBy: string;
  lastActivityAt: string;
  notes: LeadNote[];
};

export const LEADS: Lead[] = [
  {
    id: "L-1042",
    name: "Mariam Adel",
    phone: "+20 122 555 0142",
    email: "mariam.adel@example.com",
    interest: { en: "3-bedroom apartment, New Cairo", ar: "شقة 3 غرف، القاهرة الجديدة" },
    compoundId: "palm-ridge",
    budget: { amount: 7_000_000, currency: "EGP" },
    source: { en: "Website form", ar: "نموذج الموقع" },
    status: "new",
    assignedAt: "2026-10-16T10:15:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-16T10:15:00Z",
    notes: [],
  },
  {
    id: "L-1039",
    name: "Karim Mostafa",
    phone: "+20 100 555 0139",
    interest: { en: "Townhouse with garden", ar: "تاون هاوس بحديقة" },
    compoundId: "lotus-gardens",
    budget: { amount: 13_000_000, currency: "EGP" },
    source: { en: "Referral", ar: "ترشيح" },
    status: "viewing_scheduled",
    assignedAt: "2026-10-14T08:30:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-16T15:40:00Z",
    notes: [
      {
        id: "n-2",
        author: "Omar Hassan",
        body: "Viewing booked for Saturday 11:00 at the Lotus Gardens sales center. Client will bring his wife.",
        at: "2026-10-16T15:40:00Z",
      },
      {
        id: "n-1",
        author: "Omar Hassan",
        body: "First call. Interested in corner townhouses, prefers immediate delivery.",
        at: "2026-10-14T12:05:00Z",
      },
    ],
  },
  {
    id: "L-1033",
    name: "Hana Youssef",
    phone: "+20 111 555 0133",
    email: "hana.y@example.com",
    interest: { en: "Furnished studio for investment (USD)", ar: "استوديو مفروش للاستثمار (دولار)" },
    compoundId: "the-crest",
    budget: { amount: 200_000, currency: "USD" },
    source: { en: "Social media", ar: "وسائل التواصل" },
    status: "follow_up",
    assignedAt: "2026-10-10T09:00:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-15T11:20:00Z",
    notes: [
      {
        id: "n-3",
        author: "Omar Hassan",
        body: "Sent the payment plan. She will confirm after speaking with her family abroad. Call again Tuesday.",
        at: "2026-10-15T11:20:00Z",
      },
    ],
  },
  {
    id: "L-1027",
    name: "Youssef Kamal",
    phone: "+20 106 555 0127",
    interest: { en: "Villa, ready to move", ar: "فيلا جاهزة للسكن" },
    source: { en: "Walk-in", ar: "زيارة مباشرة" },
    status: "contacted",
    assignedAt: "2026-10-08T13:00:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-12T10:00:00Z",
    notes: [],
  },
  {
    id: "L-1019",
    name: "Salma Ibrahim",
    phone: "+20 127 555 0119",
    interest: { en: "2-bedroom apartment, New Capital", ar: "شقة غرفتين، العاصمة الإدارية" },
    compoundId: "capital-heights",
    budget: { amount: 5_500_000, currency: "EGP" },
    source: { en: "Website form", ar: "نموذج الموقع" },
    status: "converted",
    assignedAt: "2026-09-28T09:00:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-09T16:00:00Z",
    notes: [
      {
        id: "n-4",
        author: "Omar Hassan",
        body: "Reservation signed for Type A, floor 4. Handed over to the developer's contracts team.",
        at: "2026-10-09T16:00:00Z",
      },
    ],
  },
  {
    id: "L-1011",
    name: "Ahmed Fathy",
    phone: "+20 109 555 0111",
    interest: { en: "Apartment under 5M EGP", ar: "شقة أقل من 5 مليون جنيه" },
    source: { en: "Social media", ar: "وسائل التواصل" },
    status: "unreachable",
    assignedAt: "2026-09-25T09:00:00Z",
    assignedBy: "Nour Salem",
    lastActivityAt: "2026-10-01T09:30:00Z",
    notes: [],
  },
];
