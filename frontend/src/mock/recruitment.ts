/**
 * PROTOTYPE SAMPLE DATA — fictional applicants, identity reviews, interviews and
 * decisions for the admin recruitment screens. Nothing here is real; the real
 * app reads these from the API. All dates are relative to a fixed "today"
 * (17 Oct 2026) so server and client renders match.
 */

export type Localized = { en: string; ar: string };

/** Stages shown in the applicant list filter (spec 03 §1). */
export const LIST_STAGES = [
  "phone_pending",
  "identity_pending",
  "identity_review",
  "identity_action_required",
  "interview_pending",
  "interview_submitted",
  "training",
  "quiz_eligible",
  "qualified",
  "rejected",
] as const;
export type ApplicantStage = (typeof LIST_STAGES)[number];

/** Every stage that can appear in application_stage_history. */
export type HistoryStage = ApplicantStage | "identity_processing" | "identity_approved";

export type OcrResult = "match" | "mismatch" | "low_confidence" | "failed";
export type OcrProviderStatus = "completed" | "failed";
export type IdentityStatus = "pending" | "action_required" | "approved" | "rejected";
export type InterviewStatus = "pending" | "accepted" | "rejected" | "reopened";

export type Actor = { kind: "applicant" | "system" | "staff"; name?: string };

export type StageHistoryEntry = {
  id: string;
  from: HistoryStage | null;
  to: HistoryStage;
  actor: Actor;
  reason?: Localized;
  at: string;
};

export type Applicant = {
  id: string;
  name: Localized;
  email: string;
  phone: string;
  city: Localized;
  stage: ApplicantStage;
  registeredAt: string;
  lastActivityAt: string;
};

export type IdentityDecision = {
  decision: "approved" | "action_required" | "rejected";
  publicReason?: Localized;
  internalNote?: Localized;
  reviewer: string;
  decidedAt: string;
};

export type IdentityReview = {
  id: string;
  applicantId: string;
  status: IdentityStatus;
  submittedAt: string;
  enteredId: string;
  ocrId: string | null;
  ocrResult: OcrResult;
  /** 0–100, null when OCR failed. */
  confidence: number | null;
  providerStatus: OcrProviderStatus;
  submissionNo: number;
  decision?: IdentityDecision;
};

export type InterviewHistoryEntry = {
  id: string;
  action: "submitted" | "accepted" | "rejected" | "reopened";
  actor: Actor;
  reason?: Localized;
  at: string;
};

export type InterviewSubmission = {
  id: string;
  applicantId: string;
  status: InterviewStatus;
  durationSec: number;
  submittedAt: string;
  history: InterviewHistoryEntry[];
};

export type DecisionKind = "identity" | "interview";
export type DecisionValue = "approved" | "action_required" | "rejected" | "accepted" | "reopened";

export type DecisionLogEntry = {
  id: string;
  applicantId: string;
  kind: DecisionKind;
  decision: DecisionValue;
  publicReason?: Localized;
  decidedBy: string;
  decidedAt: string;
};

// ---------------------------------------------------------------------------

const DAY = 86_400_000;
const TODAY = Date.UTC(2026, 9, 17, 9, 0);
const at = (daysAgo: number) => new Date(TODAY - Math.round(daysAgo * 24) * 3_600_000).toISOString();

export const REVIEWERS = ["Nour Salem", "Heba Kamal", "Sameh Adly"] as const;

export function maskNationalId(id: string): string {
  return `${id.slice(0, 1)}${"•".repeat(10)}${id.slice(-2)}`;
}

const REASONS = {
  actionRequired: {
    en: "The back of your ID card is blurry. Please retake the photo in good lighting with all four corners visible.",
    ar: "صورة ظهر البطاقة غير واضحة. يرجى إعادة التصوير في إضاءة جيدة مع ظهور الأركان الأربعة.",
  },
  actionRequiredSelfie: {
    en: "Your personal photo is too dark to compare with the ID. Please upload a clear, well-lit selfie.",
    ar: "صورتك الشخصية داكنة جدًا ولا يمكن مقارنتها بالبطاقة. يرجى رفع صورة واضحة بإضاءة جيدة.",
  },
  identityRejected: {
    en: "The ID number you entered does not match the submitted document.",
    ar: "رقم البطاقة الذي أدخلته لا يطابق المستند المرفوع.",
  },
  interviewRejected: {
    en: "Thank you for your time. Your interview did not meet the communication requirements for this role.",
    ar: "شكرًا لوقتك. لم تستوفِ المقابلة متطلبات التواصل الخاصة بهذا الدور.",
  },
  interviewAccepted: {
    en: "Clear introduction and strong motivation. Welcome to training.",
    ar: "تقديم واضح ودافع قوي. مرحبًا بك في التدريب.",
  },
  reopened: {
    en: "The recording has no audio. Please record your interview again.",
    ar: "التسجيل بدون صوت. يرجى تسجيل المقابلة مرة أخرى.",
  },
  ocrReview: { en: "OCR result needs manual review", ar: "نتيجة التعرف الضوئي تحتاج إلى مراجعة يدوية" },
} satisfies Record<string, Localized>;

const INTERNAL_NOTES = {
  mismatch: {
    en: "Two digits differ between the entered number and the card. Second mismatch for this phone number.",
    ar: "يختلف رقمان بين الرقم المدخل والبطاقة. ثاني عدم تطابق لنفس رقم الهاتف.",
  },
  blurry: { en: "Glare over the lower half of the back image.", ar: "انعكاس ضوئي على النصف السفلي لصورة الظهر." },
} satisfies Record<string, Localized>;

type Seed = {
  name: Localized;
  email: string;
  phone: string;
  city: Localized;
  stage: ApplicantStage;
  /** Days since registration. */
  days: number;
  ocr?: OcrResult;
  confidence?: number;
  rejectedAt?: "identity" | "interview";
  reopened?: boolean;
  durationSec?: number;
};

const CAIRO = { en: "Cairo", ar: "القاهرة" };
const GIZA = { en: "Giza", ar: "الجيزة" };
const ALEX = { en: "Alexandria", ar: "الإسكندرية" };
const NEW_CAIRO = { en: "New Cairo", ar: "القاهرة الجديدة" };

const SEEDS: Seed[] = [
  { name: { en: "Ahmed Hassan", ar: "أحمد حسن" }, email: "ahmed.hassan@example.com", phone: "+20 100 412 7781", city: NEW_CAIRO, stage: "qualified", days: 46, durationSec: 74 },
  { name: { en: "Mariam Adel", ar: "مريم عادل" }, email: "mariam.adel@example.com", phone: "+20 111 205 3394", city: CAIRO, stage: "qualified", days: 41, ocr: "low_confidence", confidence: 71, durationSec: 63 },
  { name: { en: "Omar Khaled", ar: "عمر خالد" }, email: "omar.khaled@example.com", phone: "+20 122 870 1456", city: GIZA, stage: "qualified", days: 38, durationSec: 88 },
  { name: { en: "Youssef Mahmoud", ar: "يوسف محمود" }, email: "youssef.mahmoud@example.com", phone: "+20 101 334 9020", city: ALEX, stage: "quiz_eligible", days: 33, durationSec: 59 },
  { name: { en: "Nourhan Samir", ar: "نورهان سمير" }, email: "nourhan.samir@example.com", phone: "+20 115 662 0187", city: NEW_CAIRO, stage: "quiz_eligible", days: 30, ocr: "mismatch", confidence: 88, durationSec: 67 },
  { name: { en: "Karim Fathy", ar: "كريم فتحي" }, email: "karim.fathy@example.com", phone: "+20 127 910 4432", city: CAIRO, stage: "quiz_eligible", days: 28, durationSec: 81 },
  { name: { en: "Salma Ibrahim", ar: "سلمى إبراهيم" }, email: "salma.ibrahim@example.com", phone: "+20 106 778 2210", city: GIZA, stage: "training", days: 24, durationSec: 70 },
  { name: { en: "Mostafa Ali", ar: "مصطفى علي" }, email: "mostafa.ali@example.com", phone: "+20 112 431 6675", city: CAIRO, stage: "training", days: 21, ocr: "low_confidence", confidence: 64, durationSec: 55 },
  { name: { en: "Hana Mostafa", ar: "هنا مصطفى" }, email: "hana.mostafa@example.com", phone: "+20 128 054 3398", city: ALEX, stage: "training", days: 19, durationSec: 90 },
  { name: { en: "Tarek Nabil", ar: "طارق نبيل" }, email: "tarek.nabil@example.com", phone: "+20 109 227 8841", city: NEW_CAIRO, stage: "rejected", days: 18, rejectedAt: "interview", durationSec: 38 },
  { name: { en: "Dina Ashraf", ar: "دينا أشرف" }, email: "dina.ashraf@example.com", phone: "+20 114 908 1123", city: CAIRO, stage: "interview_submitted", days: 12, durationSec: 72 },
  { name: { en: "Amr Saeed", ar: "عمرو سعيد" }, email: "amr.saeed@example.com", phone: "+20 120 563 7709", city: GIZA, stage: "interview_submitted", days: 10, ocr: "low_confidence", confidence: 68, durationSec: 61 },
  { name: { en: "Rana Hossam", ar: "رنا حسام" }, email: "rana.hossam@example.com", phone: "+20 102 671 4450", city: NEW_CAIRO, stage: "interview_submitted", days: 8, durationSec: 84 },
  { name: { en: "Mohamed Gamal", ar: "محمد جمال" }, email: "mohamed.gamal@example.com", phone: "+20 111 889 0326", city: CAIRO, stage: "interview_pending", days: 9, reopened: true, durationSec: 47 },
  { name: { en: "Yasmin Farouk", ar: "ياسمين فاروق" }, email: "yasmin.farouk@example.com", phone: "+20 127 342 5518", city: ALEX, stage: "interview_pending", days: 6 },
  { name: { en: "Hossam Reda", ar: "حسام رضا" }, email: "hossam.reda@example.com", phone: "+20 100 776 2294", city: GIZA, stage: "rejected", days: 11, rejectedAt: "identity", ocr: "mismatch", confidence: 91 },
  { name: { en: "Laila Sherif", ar: "ليلى شريف" }, email: "laila.sherif@example.com", phone: "+20 115 210 9873", city: CAIRO, stage: "identity_action_required", days: 7, ocr: "low_confidence", confidence: 49 },
  { name: { en: "Ibrahim Wael", ar: "إبراهيم وائل" }, email: "ibrahim.wael@example.com", phone: "+20 106 459 3301", city: NEW_CAIRO, stage: "identity_action_required", days: 5, ocr: "failed" },
  { name: { en: "Aya Magdy", ar: "آية مجدي" }, email: "aya.magdy@example.com", phone: "+20 122 118 6647", city: GIZA, stage: "identity_review", days: 4, ocr: "mismatch", confidence: 86 },
  { name: { en: "Sherif Mounir", ar: "شريف منير" }, email: "sherif.mounir@example.com", phone: "+20 109 905 7712", city: CAIRO, stage: "identity_review", days: 3, ocr: "low_confidence", confidence: 58 },
  { name: { en: "Farida Hany", ar: "فريدة هاني" }, email: "farida.hany@example.com", phone: "+20 128 640 2259", city: ALEX, stage: "identity_review", days: 2, ocr: "failed" },
  { name: { en: "Ziad Osama", ar: "زياد أسامة" }, email: "ziad.osama@example.com", phone: "+20 101 507 8836", city: NEW_CAIRO, stage: "identity_pending", days: 2 },
  { name: { en: "Malak Emad", ar: "ملك عماد" }, email: "malak.emad@example.com", phone: "+20 114 362 1190", city: CAIRO, stage: "identity_pending", days: 1.5 },
  { name: { en: "Khaled Tawfik", ar: "خالد توفيق" }, email: "khaled.tawfik@example.com", phone: "+20 120 284 5563", city: GIZA, stage: "phone_pending", days: 0.6 },
  { name: { en: "Nada Ramadan", ar: "ندى رمضان" }, email: "nada.ramadan@example.com", phone: "+20 112 793 4407", city: CAIRO, stage: "phone_pending", days: 0.25 },
];

function nationalIdFor(i: number): string {
  const p2 = (n: number) => String(n).padStart(2, "0");
  const yy = p2(85 + ((i * 3) % 15));
  const mm = p2(1 + ((i * 5) % 12));
  const dd = p2(1 + ((i * 7) % 28));
  const gov = ["01", "02", "21", "12", "88"][i % 5];
  const seq = String(1000 + ((i * 373) % 9000)).padStart(4, "0");
  return `2${yy}${mm}${dd}${gov}${seq}${(i * 7) % 10}`;
}

function misreadId(id: string): string {
  const digits = id.split("");
  digits[9] = String((Number(digits[9]) + 3) % 10);
  digits[10] = String((Number(digits[10]) + 6) % 10);
  return digits.join("");
}

type Step = { to: HistoryStage; actor: Actor; reason?: Localized };

const ORDERED_REVIEWER = (i: number) => REVIEWERS[i % REVIEWERS.length];

function stepsFor(seed: Seed, i: number): Step[] {
  const applicant: Actor = { kind: "applicant" };
  const system: Actor = { kind: "system" };
  const reviewer: Actor = { kind: "staff", name: ORDERED_REVIEWER(i) };
  const recruiter: Actor = { kind: "staff", name: ORDERED_REVIEWER(i + 1) };
  const steps: Step[] = [{ to: "phone_pending", actor: applicant }];
  if (seed.stage === "phone_pending") return steps;
  steps.push({ to: "identity_pending", actor: applicant });
  if (seed.stage === "identity_pending") return steps;
  steps.push({ to: "identity_processing", actor: applicant });
  const ocr = seed.ocr ?? "match";
  if (ocr !== "match") steps.push({ to: "identity_review", actor: system, reason: REASONS.ocrReview });
  if (seed.stage === "identity_review") return steps;
  if (seed.stage === "identity_action_required") {
    steps.push({
      to: "identity_action_required",
      actor: reviewer,
      reason: ocr === "failed" ? REASONS.actionRequiredSelfie : REASONS.actionRequired,
    });
    return steps;
  }
  if (seed.rejectedAt === "identity") {
    steps.push({ to: "rejected", actor: reviewer, reason: REASONS.identityRejected });
    return steps;
  }
  steps.push({ to: "identity_approved", actor: reviewer });
  steps.push({ to: "interview_pending", actor: system });
  if (seed.reopened) {
    steps.push({ to: "interview_submitted", actor: applicant });
    steps.push({ to: "interview_pending", actor: recruiter, reason: REASONS.reopened });
  }
  if (seed.stage === "interview_pending") return steps;
  steps.push({ to: "interview_submitted", actor: applicant });
  if (seed.stage === "interview_submitted") return steps;
  if (seed.rejectedAt === "interview") {
    steps.push({ to: "rejected", actor: recruiter, reason: REASONS.interviewRejected });
    return steps;
  }
  steps.push({ to: "training", actor: recruiter, reason: REASONS.interviewAccepted });
  if (seed.stage === "training") return steps;
  steps.push({ to: "quiz_eligible", actor: system });
  if (seed.stage === "quiz_eligible") return steps;
  steps.push({ to: "qualified", actor: system });
  return steps;
}

export const APPLICANTS: Applicant[] = [];
export const STAGE_HISTORY: Record<string, StageHistoryEntry[]> = {};
export const IDENTITY_REVIEWS: IdentityReview[] = [];
export const INTERVIEWS: InterviewSubmission[] = [];
export const DECISIONS: DecisionLogEntry[] = [];

SEEDS.forEach((seed, i) => {
  const id = `a${String(i + 1).padStart(3, "0")}`;
  const steps = stepsFor(seed, i);
  // Spread the steps between registration and (almost) now.
  const span = Math.max(seed.days - 0.15, 0);
  const gap = steps.length > 1 ? span / (steps.length - 1) : 0;
  const history: StageHistoryEntry[] = steps.map((s, n) => ({
    id: `${id}-h${n + 1}`,
    from: n === 0 ? null : steps[n - 1].to,
    to: s.to,
    actor: s.actor,
    reason: s.reason,
    at: at(seed.days - gap * n),
  }));
  STAGE_HISTORY[id] = history;

  APPLICANTS.push({
    id,
    name: seed.name,
    email: seed.email,
    phone: seed.phone,
    city: seed.city,
    stage: seed.stage,
    registeredAt: history[0].at,
    lastActivityAt: history[history.length - 1].at,
  });

  const find = (stage: HistoryStage, last = false) => {
    const list = history.filter((h) => h.to === stage);
    return last ? list[list.length - 1] : list[0];
  };

  // Identity verification record
  const processing = find("identity_processing");
  if (processing) {
    const ocr = seed.ocr ?? "match";
    const enteredId = nationalIdFor(i + 3);
    const approved = find("identity_approved");
    const actionRequired = find("identity_action_required");
    const rejected = seed.rejectedAt === "identity" ? find("rejected") : undefined;
    const decided = approved ?? actionRequired ?? rejected;
    const status: IdentityStatus = approved
      ? "approved"
      : actionRequired
        ? "action_required"
        : rejected
          ? "rejected"
          : "pending";
    const review: IdentityReview = {
      id: `idv-${id.slice(1)}`,
      applicantId: id,
      status,
      submittedAt: processing.at,
      enteredId,
      ocrId: ocr === "failed" ? null : ocr === "mismatch" ? misreadId(enteredId) : enteredId,
      ocrResult: ocr,
      confidence: ocr === "failed" ? null : (seed.confidence ?? 93 + (i % 6)),
      providerStatus: ocr === "failed" ? "failed" : "completed",
      submissionNo: 1,
      decision:
        decided && decided.actor.name
          ? {
              decision: status as IdentityDecision["decision"],
              publicReason: decided.reason,
              internalNote: rejected ? INTERNAL_NOTES.mismatch : actionRequired && ocr !== "failed" ? INTERNAL_NOTES.blurry : undefined,
              reviewer: decided.actor.name,
              decidedAt: decided.at,
            }
          : undefined,
    };
    IDENTITY_REVIEWS.push(review);
    if (review.decision) {
      DECISIONS.push({
        id: `d-${review.id}`,
        applicantId: id,
        kind: "identity",
        decision: review.decision.decision,
        publicReason: review.decision.publicReason,
        decidedBy: review.decision.reviewer,
        decidedAt: review.decision.decidedAt,
      });
    }
  }

  // Interview submissions (a reopened one is archived, then a new one may exist)
  const submittedSteps = history.filter((h) => h.to === "interview_submitted");
  submittedSteps.forEach((sub, n) => {
    const next = history[history.indexOf(sub) + 1];
    const intId = `int-${id.slice(1)}${submittedSteps.length > 1 ? `-${n + 1}` : ""}`;
    const entries: InterviewHistoryEntry[] = [
      { id: `${intId}-e1`, action: "submitted", actor: { kind: "applicant" }, at: sub.at },
    ];
    let status: InterviewStatus = "pending";
    if (next) {
      status =
        next.to === "interview_pending" ? "reopened" : next.to === "rejected" ? "rejected" : "accepted";
      entries.push({
        id: `${intId}-e2`,
        action: status,
        actor: next.actor,
        reason: next.reason,
        at: next.at,
      });
      DECISIONS.push({
        id: `d-${intId}`,
        applicantId: id,
        kind: "interview",
        decision: status === "reopened" ? "reopened" : status === "rejected" ? "rejected" : "accepted",
        publicReason: next.reason,
        decidedBy: next.actor.name ?? "",
        decidedAt: next.at,
      });
    }
    INTERVIEWS.push({
      id: intId,
      applicantId: id,
      status,
      durationSec: n === 0 && seed.reopened ? (seed.durationSec ?? 60) : (seed.durationSec ?? 60) + n * 9,
      submittedAt: sub.at,
      history: entries,
    });
  });
});

DECISIONS.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

export const TODAY_ISO = new Date(TODAY).toISOString();
export const DAY_MS = DAY;

export function getApplicant(id: string): Applicant | undefined {
  return APPLICANTS.find((a) => a.id === id);
}

export function identityForApplicant(applicantId: string): IdentityReview | undefined {
  return IDENTITY_REVIEWS.find((r) => r.applicantId === applicantId);
}

export function interviewsForApplicant(applicantId: string): InterviewSubmission[] {
  return INTERVIEWS.filter((s) => s.applicantId === applicantId);
}

export function stageDate(applicantId: string, stage: HistoryStage): string | undefined {
  return STAGE_HISTORY[applicantId]?.filter((h) => h.to === stage).pop()?.at;
}
