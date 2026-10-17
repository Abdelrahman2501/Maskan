/**
 * PROTOTYPE SAMPLE DATA — fictional customers and agents.
 * Leads L-1042 … L-1011 match mobile/src/mock/leads.ts (all assigned to Omar
 * Hassan, the agent signed in on the mobile prototype). The admin view adds
 * other agents' and unassigned leads, assignment history and status history.
 */
import type { Localized } from "./properties";

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

/** Statuses that still count against an agent's open-lead load. */
export const OPEN_STATUSES: LeadStatus[] = ["new", "contacted", "interested", "follow_up", "viewing_scheduled"];

export type Agent = { id: string; name: string; phone: string; qualifiedAt: string };

export const AGENTS: Agent[] = [
  { id: "ag-omar", name: "Omar Hassan", phone: "+20 101 555 0201", qualifiedAt: "2026-06-14T10:00:00Z" },
  { id: "ag-rania", name: "Rania Farouk", phone: "+20 102 555 0202", qualifiedAt: "2026-07-02T10:00:00Z" },
  { id: "ag-mahmoud", name: "Mahmoud Saeed", phone: "+20 114 555 0203", qualifiedAt: "2026-07-20T10:00:00Z" },
  { id: "ag-yasmin", name: "Yasmin Hany", phone: "+20 128 555 0204", qualifiedAt: "2026-08-11T10:00:00Z" },
  { id: "ag-sherif", name: "Sherif Nabil", phone: "+20 155 555 0205", qualifiedAt: "2026-09-30T10:00:00Z" },
];

export const agentById = (id: string | null | undefined) => (id ? AGENTS.find((a) => a.id === id) : undefined);

export type LeadNote = { id: string; author: string; body: string; at: string };
export type LeadAssignment = {
  id: string;
  leadId: string;
  fromAgentId: string | null;
  toAgentId: string;
  assignedBy: string;
  assignedAt: string;
  reason?: string;
};
export type LeadStatusChange = { id: string; from: LeadStatus | null; to: LeadStatus; changedBy: string; changedAt: string };

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest: Localized;
  compoundId?: string;
  locationId?: string;
  budget?: { amount: string; currency: string };
  source: Localized;
  status: LeadStatus;
  assigneeId: string | null;
  createdAt: string;
  lastActivityAt: string;
  notes: LeadNote[];
  statusHistory: LeadStatusChange[];
};

const SRC = {
  web: { en: "Website form", ar: "نموذج الموقع" },
  referral: { en: "Referral", ar: "ترشيح" },
  social: { en: "Social media", ar: "وسائل التواصل" },
  walkIn: { en: "Walk-in", ar: "زيارة مباشرة" },
  csv: { en: "CSV import", ar: "استيراد CSV" },
};

let sh = 0;
const hist = (steps: [LeadStatus | null, LeadStatus, string, string][]): LeadStatusChange[] =>
  steps.map(([from, to, changedBy, changedAt]) => ({ id: `sh-${++sh}`, from, to, changedBy, changedAt })).reverse();

export const LEADS: Lead[] = [
  {
    id: "L-1048",
    name: "Aya Lotfy",
    phone: "+20 122 555 0148",
    email: "aya.lotfy@example.com",
    interest: { en: "Chalet or apartment near the monorail", ar: "شقة قريبة من المونوريل" },
    locationId: "new-capital",
    budget: { amount: "4000000.00", currency: "EGP" },
    source: SRC.web,
    status: "new",
    assigneeId: null,
    createdAt: "2026-10-17T07:40:00Z",
    lastActivityAt: "2026-10-17T07:40:00Z",
    notes: [],
    statusHistory: hist([[null, "new", "System", "2026-10-17T07:40:00Z"]]),
  },
  {
    id: "L-1047",
    name: "Reem Abdelaziz",
    phone: "+20 100 555 0147",
    interest: { en: "Villa with private pool", ar: "فيلا بحمام سباحة خاص" },
    compoundId: "palm-ridge",
    locationId: "new-cairo",
    budget: { amount: "25000000.00", currency: "EGP" },
    source: SRC.referral,
    status: "new",
    assigneeId: null,
    createdAt: "2026-10-16T18:05:00Z",
    lastActivityAt: "2026-10-16T18:05:00Z",
    notes: [],
    statusHistory: hist([[null, "new", "Nour Salem", "2026-10-16T18:05:00Z"]]),
  },
  {
    id: "L-1046",
    name: "Tamer Galal",
    phone: "+20 111 555 0146",
    email: "tamer.g@example.com",
    interest: { en: "Investment studio, USD budget", ar: "استوديو للاستثمار بميزانية بالدولار" },
    compoundId: "the-crest",
    locationId: "new-cairo",
    budget: { amount: "190000.00", currency: "USD" },
    source: SRC.social,
    status: "new",
    assigneeId: null,
    createdAt: "2026-10-16T12:30:00Z",
    lastActivityAt: "2026-10-16T12:30:00Z",
    notes: [],
    statusHistory: hist([[null, "new", "System", "2026-10-16T12:30:00Z"]]),
  },
  {
    id: "L-1045",
    name: "Nada Sherif",
    phone: "+20 127 555 0145",
    interest: { en: "Apartment in Mostakbal City", ar: "شقة في مدينة المستقبل" },
    compoundId: "horizon-park",
    locationId: "mostakbal",
    budget: { amount: "5000000.00", currency: "EGP" },
    source: SRC.csv,
    status: "new",
    assigneeId: null,
    createdAt: "2026-10-16T09:00:00Z",
    lastActivityAt: "2026-10-16T09:00:00Z",
    notes: [],
    statusHistory: hist([[null, "new", "Nour Salem", "2026-10-16T09:00:00Z"]]),
  },
  {
    id: "L-1044",
    name: "Mostafa Ali",
    phone: "+20 106 555 0144",
    interest: { en: "Townhouse, ready to move", ar: "تاون هاوس جاهز للسكن" },
    compoundId: "lotus-gardens",
    locationId: "new-cairo",
    budget: { amount: "12000000.00", currency: "EGP" },
    source: SRC.web,
    status: "contacted",
    assigneeId: "ag-rania",
    createdAt: "2026-10-15T08:00:00Z",
    lastActivityAt: "2026-10-16T13:10:00Z",
    notes: [
      { id: "n-21", author: "Rania Farouk", body: "Called and shared the Lotus Gardens brochure. Wants to compare with a second option.", at: "2026-10-16T13:10:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "System", "2026-10-15T08:00:00Z"],
      ["new", "contacted", "Rania Farouk", "2026-10-16T13:10:00Z"],
    ]),
  },
  {
    id: "L-1042",
    name: "Mariam Adel",
    phone: "+20 122 555 0142",
    email: "mariam.adel@example.com",
    interest: { en: "3-bedroom apartment, New Cairo", ar: "شقة 3 غرف، القاهرة الجديدة" },
    compoundId: "palm-ridge",
    locationId: "new-cairo",
    budget: { amount: "7000000.00", currency: "EGP" },
    source: SRC.web,
    status: "new",
    assigneeId: "ag-omar",
    createdAt: "2026-10-16T10:00:00Z",
    lastActivityAt: "2026-10-16T10:15:00Z",
    notes: [],
    statusHistory: hist([[null, "new", "System", "2026-10-16T10:00:00Z"]]),
  },
  {
    id: "L-1040",
    name: "Dalia Mansour",
    phone: "+20 109 555 0140",
    email: "dalia.m@example.com",
    interest: { en: "Garden apartment for family", ar: "شقة بحديقة لعائلة" },
    compoundId: "palm-ridge",
    locationId: "new-cairo",
    budget: { amount: "7500000.00", currency: "EGP" },
    source: SRC.referral,
    status: "interested",
    assigneeId: "ag-rania",
    createdAt: "2026-10-11T09:20:00Z",
    lastActivityAt: "2026-10-15T17:45:00Z",
    notes: [
      { id: "n-22", author: "Rania Farouk", body: "Likes Type A. Asked for the 8-year installment schedule.", at: "2026-10-15T17:45:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "Nour Salem", "2026-10-11T09:20:00Z"],
      ["new", "contacted", "Rania Farouk", "2026-10-12T10:00:00Z"],
      ["contacted", "interested", "Rania Farouk", "2026-10-15T17:45:00Z"],
    ]),
  },
  {
    id: "L-1039",
    name: "Karim Mostafa",
    phone: "+20 100 555 0139",
    interest: { en: "Townhouse with garden", ar: "تاون هاوس بحديقة" },
    compoundId: "lotus-gardens",
    locationId: "new-cairo",
    budget: { amount: "13000000.00", currency: "EGP" },
    source: SRC.referral,
    status: "viewing_scheduled",
    assigneeId: "ag-omar",
    createdAt: "2026-10-14T08:00:00Z",
    lastActivityAt: "2026-10-16T15:40:00Z",
    notes: [
      { id: "n-2", author: "Omar Hassan", body: "Viewing booked for Saturday 11:00 at the Lotus Gardens sales center. Client will bring his wife.", at: "2026-10-16T15:40:00Z" },
      { id: "n-1", author: "Omar Hassan", body: "First call. Interested in corner townhouses, prefers immediate delivery.", at: "2026-10-14T12:05:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "Nour Salem", "2026-10-14T08:00:00Z"],
      ["new", "contacted", "Omar Hassan", "2026-10-14T12:05:00Z"],
      ["contacted", "viewing_scheduled", "Omar Hassan", "2026-10-16T15:40:00Z"],
    ]),
  },
  {
    id: "L-1036",
    name: "Hossam Ezzat",
    phone: "+20 114 555 0136",
    interest: { en: "Apartment under 4M EGP", ar: "شقة أقل من 4 مليون جنيه" },
    locationId: "mostakbal",
    budget: { amount: "4000000.00", currency: "EGP" },
    source: SRC.social,
    status: "not_interested",
    assigneeId: "ag-mahmoud",
    createdAt: "2026-10-06T11:00:00Z",
    lastActivityAt: "2026-10-13T09:15:00Z",
    notes: [
      { id: "n-23", author: "Mahmoud Saeed", body: "Budget does not match current inventory. Asked to be contacted for future launches.", at: "2026-10-13T09:15:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "System", "2026-10-06T11:00:00Z"],
      ["new", "contacted", "Mahmoud Saeed", "2026-10-07T10:30:00Z"],
      ["contacted", "not_interested", "Mahmoud Saeed", "2026-10-13T09:15:00Z"],
    ]),
  },
  {
    id: "L-1033",
    name: "Hana Youssef",
    phone: "+20 111 555 0133",
    email: "hana.y@example.com",
    interest: { en: "Furnished studio for investment (USD)", ar: "استوديو مفروش للاستثمار (دولار)" },
    compoundId: "the-crest",
    locationId: "new-cairo",
    budget: { amount: "200000.00", currency: "USD" },
    source: SRC.social,
    status: "follow_up",
    assigneeId: "ag-omar",
    createdAt: "2026-10-09T15:00:00Z",
    lastActivityAt: "2026-10-15T11:20:00Z",
    notes: [
      { id: "n-3", author: "Omar Hassan", body: "Sent the payment plan. She will confirm after speaking with her family abroad. Call again Tuesday.", at: "2026-10-15T11:20:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "System", "2026-10-09T15:00:00Z"],
      ["new", "contacted", "Omar Hassan", "2026-10-11T10:00:00Z"],
      ["contacted", "follow_up", "Omar Hassan", "2026-10-15T11:20:00Z"],
    ]),
  },
  {
    id: "L-1030",
    name: "Nermeen Fawzy",
    phone: "+20 128 555 0130",
    interest: { en: "Twin house, Lotus district", ar: "توين هاوس، حي اللوتس" },
    compoundId: "lotus-gardens",
    locationId: "new-cairo",
    budget: { amount: "15000000.00", currency: "EGP" },
    source: SRC.walkIn,
    status: "interested",
    assigneeId: "ag-yasmin",
    createdAt: "2026-10-03T10:00:00Z",
    lastActivityAt: "2026-10-14T14:30:00Z",
    notes: [
      { id: "n-24", author: "Mahmoud Saeed", body: "Twin houses are sold out; offered corner townhouse instead.", at: "2026-10-05T11:00:00Z" },
      { id: "n-25", author: "Yasmin Hany", body: "Took over the lead. Client open to a corner townhouse if delivery is immediate.", at: "2026-10-14T14:30:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "Nour Salem", "2026-10-03T10:00:00Z"],
      ["new", "contacted", "Mahmoud Saeed", "2026-10-05T11:00:00Z"],
      ["contacted", "interested", "Yasmin Hany", "2026-10-14T14:30:00Z"],
    ]),
  },
  {
    id: "L-1027",
    name: "Youssef Kamal",
    phone: "+20 106 555 0127",
    interest: { en: "Villa, ready to move", ar: "فيلا جاهزة للسكن" },
    source: SRC.walkIn,
    status: "contacted",
    assigneeId: "ag-omar",
    createdAt: "2026-10-08T12:30:00Z",
    lastActivityAt: "2026-10-12T10:00:00Z",
    notes: [],
    statusHistory: hist([
      [null, "new", "Nour Salem", "2026-10-08T12:30:00Z"],
      ["new", "contacted", "Omar Hassan", "2026-10-12T10:00:00Z"],
    ]),
  },
  {
    id: "L-1025",
    name: "Waleed Samy",
    phone: "+20 155 555 0125",
    email: "waleed.samy@example.com",
    interest: { en: "Apartment near Government District", ar: "شقة قرب الحي الحكومي" },
    compoundId: "capital-heights",
    locationId: "new-capital",
    budget: { amount: "5500000.00", currency: "EGP" },
    source: SRC.web,
    status: "follow_up",
    assigneeId: "ag-mahmoud",
    createdAt: "2026-10-02T09:00:00Z",
    lastActivityAt: "2026-10-11T12:00:00Z",
    notes: [
      { id: "n-26", author: "Mahmoud Saeed", body: "Waiting for the updated Capital Heights price list before the next call.", at: "2026-10-11T12:00:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "System", "2026-10-02T09:00:00Z"],
      ["new", "contacted", "Mahmoud Saeed", "2026-10-04T10:00:00Z"],
      ["contacted", "follow_up", "Mahmoud Saeed", "2026-10-11T12:00:00Z"],
    ]),
  },
  {
    id: "L-1019",
    name: "Salma Ibrahim",
    phone: "+20 127 555 0119",
    interest: { en: "2-bedroom apartment, New Capital", ar: "شقة غرفتين، العاصمة الإدارية" },
    compoundId: "capital-heights",
    locationId: "new-capital",
    budget: { amount: "5500000.00", currency: "EGP" },
    source: SRC.web,
    status: "converted",
    assigneeId: "ag-omar",
    createdAt: "2026-09-27T16:00:00Z",
    lastActivityAt: "2026-10-09T16:00:00Z",
    notes: [
      { id: "n-4", author: "Omar Hassan", body: "Reservation signed for Type A, floor 4. Handed over to the developer's contracts team.", at: "2026-10-09T16:00:00Z" },
    ],
    statusHistory: hist([
      [null, "new", "System", "2026-09-27T16:00:00Z"],
      ["new", "contacted", "Omar Hassan", "2026-09-29T10:00:00Z"],
      ["contacted", "viewing_scheduled", "Omar Hassan", "2026-10-02T09:00:00Z"],
      ["viewing_scheduled", "converted", "Omar Hassan", "2026-10-09T16:00:00Z"],
    ]),
  },
  {
    id: "L-1011",
    name: "Ahmed Fathy",
    phone: "+20 109 555 0111",
    interest: { en: "Apartment under 5M EGP", ar: "شقة أقل من 5 مليون جنيه" },
    source: SRC.social,
    status: "unreachable",
    assigneeId: "ag-omar",
    createdAt: "2026-09-24T10:00:00Z",
    lastActivityAt: "2026-10-01T09:30:00Z",
    notes: [],
    statusHistory: hist([
      [null, "new", "System", "2026-09-24T10:00:00Z"],
      ["new", "unreachable", "Omar Hassan", "2026-10-01T09:30:00Z"],
    ]),
  },
];

/** Append-only assignment log (newest first). */
export const ASSIGNMENTS: LeadAssignment[] = [
  { id: "as-14", leadId: "L-1042", fromAgentId: null, toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-10-16T10:15:00Z" },
  { id: "as-13", leadId: "L-1044", fromAgentId: null, toAgentId: "ag-rania", assignedBy: "Nour Salem", assignedAt: "2026-10-15T08:30:00Z" },
  { id: "as-12", leadId: "L-1030", fromAgentId: "ag-mahmoud", toAgentId: "ag-yasmin", assignedBy: "Nour Salem", assignedAt: "2026-10-14T09:00:00Z", reason: "Rebalancing workload" },
  { id: "as-11", leadId: "L-1039", fromAgentId: null, toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-10-14T08:30:00Z" },
  { id: "as-10", leadId: "L-1040", fromAgentId: null, toAgentId: "ag-rania", assignedBy: "Nour Salem", assignedAt: "2026-10-11T09:30:00Z" },
  { id: "as-09", leadId: "L-1033", fromAgentId: "ag-sherif", toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-10-10T09:00:00Z", reason: "Client asked for an English-speaking agent" },
  { id: "as-08", leadId: "L-1033", fromAgentId: null, toAgentId: "ag-sherif", assignedBy: "Nour Salem", assignedAt: "2026-10-09T15:30:00Z" },
  { id: "as-07", leadId: "L-1027", fromAgentId: null, toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-10-08T13:00:00Z" },
  { id: "as-06", leadId: "L-1036", fromAgentId: null, toAgentId: "ag-mahmoud", assignedBy: "Nour Salem", assignedAt: "2026-10-06T11:30:00Z" },
  { id: "as-05", leadId: "L-1030", fromAgentId: null, toAgentId: "ag-mahmoud", assignedBy: "Nour Salem", assignedAt: "2026-10-03T10:30:00Z" },
  { id: "as-04", leadId: "L-1025", fromAgentId: null, toAgentId: "ag-mahmoud", assignedBy: "Nour Salem", assignedAt: "2026-10-02T09:30:00Z" },
  { id: "as-03", leadId: "L-1019", fromAgentId: null, toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-09-28T09:00:00Z" },
  { id: "as-02", leadId: "L-1011", fromAgentId: "ag-rania", toAgentId: "ag-omar", assignedBy: "Nour Salem", assignedAt: "2026-09-25T09:00:00Z", reason: "Agent on leave" },
  { id: "as-01", leadId: "L-1011", fromAgentId: null, toAgentId: "ag-rania", assignedBy: "Nour Salem", assignedAt: "2026-09-24T10:30:00Z" },
];

export const LEAD_SOURCES: Localized[] = [SRC.web, SRC.referral, SRC.social, SRC.walkIn, SRC.csv];

export const CURRENCY_OPTIONS = ["EGP", "USD", "EUR"] as const;

export const leadById = (id: string) => LEADS.find((l) => l.id === id);

/** CSV import columns (Q-10 default; import itself is pending that decision). */
export const CSV_COLUMNS = [
  { key: "full_name", required: true },
  { key: "phone", required: true },
  { key: "email", required: false },
  { key: "interest", required: true },
  { key: "location", required: false },
  { key: "source", required: false },
] as const;

export type CsvRowError = { row: number; column: string; code: "phone_invalid" | "name_missing" | "duplicate_phone" | "email_invalid" | "location_unknown"; value: string };

/** Fixed validation report shown by the prototype import dialog. */
export const SAMPLE_IMPORT_REPORT: { fileName: string; total: number; valid: number; errors: CsvRowError[] } = {
  fileName: "new-cairo-expo-leads.csv",
  total: 50,
  valid: 48,
  errors: [
    { row: 17, column: "phone", code: "phone_invalid", value: "0100 555" },
    { row: 33, column: "full_name", code: "name_missing", value: "" },
  ],
};
