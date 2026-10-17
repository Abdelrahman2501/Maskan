/**
 * PROTOTYPE SAMPLE DATA — placeholder training content for the admin screens.
 * Course, video and question content mirrors the mobile app sample
 * (mobile/src/mock/training.ts); real courses come from the client.
 */
import { APPLICANTS, stageDate, type Localized } from "./recruitment";

export type PublishStatus = "draft" | "published";
export type VideoSource = { kind: "upload"; fileName: string } | { kind: "url"; url: string };

export type CourseVideo = {
  id: string;
  courseId: string;
  title: Localized;
  durationSec: number;
  order: number;
  status: PublishStatus;
  source: VideoSource;
};

export type Course = {
  id: string;
  title: Localized;
  description: Localized;
  status: PublishStatus;
  order: number;
  archived?: boolean;
};

export const COURSES: Course[] = [
  {
    id: "c1",
    title: { en: "Welcome to Maskan", ar: "مرحبًا بك في مسكن" },
    description: {
      en: "How the agency works, our standards, and what we expect from every agent.",
      ar: "كيف تعمل الوكالة، ومعاييرنا، وما نتوقعه من كل وكيل.",
    },
    status: "published",
    order: 1,
  },
  {
    id: "c2",
    title: { en: "The New Cairo market", ar: "سوق القاهرة الجديدة" },
    description: {
      en: "Districts, price ranges, payment plans, and how developers structure launches.",
      ar: "الأحياء، ونطاقات الأسعار، وخطط السداد، وكيف ينظم المطورون الإطلاقات.",
    },
    status: "published",
    order: 2,
  },
  {
    id: "c3",
    title: { en: "Working with clients", ar: "التعامل مع العملاء" },
    description: {
      en: "First contact, qualifying needs, viewings, objections, and closing professionally.",
      ar: "التواصل الأول، وتحديد الاحتياجات، والمعاينات، والاعتراضات، وإتمام البيع باحترافية.",
    },
    status: "published",
    order: 3,
  },
  {
    id: "c4",
    title: { en: "Using the Maskan app", ar: "استخدام تطبيق مسكن" },
    description: {
      en: "Managing your leads, notes, and the property catalogue day to day.",
      ar: "إدارة العملاء المحتملين والملاحظات وكتالوج العقارات يوميًا.",
    },
    status: "draft",
    order: 4,
  },
];

const up = (fileName: string): VideoSource => ({ kind: "upload", fileName });

export const VIDEOS: CourseVideo[] = [
  { id: "v1", courseId: "c1", title: { en: "Our story and values", ar: "قصتنا وقيمنا" }, durationSec: 312, order: 1, status: "published", source: up("our-story.mp4") },
  { id: "v2", courseId: "c1", title: { en: "How agents earn", ar: "كيف يربح الوكلاء" }, durationSec: 425, order: 2, status: "published", source: up("how-agents-earn.mp4") },
  { id: "v3", courseId: "c2", title: { en: "Districts and compounds", ar: "الأحياء والكمبوندات" }, durationSec: 540, order: 1, status: "published", source: up("districts.mp4") },
  { id: "v4", courseId: "c2", title: { en: "Understanding payment plans", ar: "فهم خطط السداد" }, durationSec: 488, order: 2, status: "published", source: { kind: "url", url: "https://videos.example.com/payment-plans" } },
  { id: "v5", courseId: "c2", title: { en: "Prices in different currencies", ar: "الأسعار بعملات مختلفة" }, durationSec: 296, order: 3, status: "published", source: up("currencies.mp4") },
  { id: "v6", courseId: "c3", title: { en: "The first call", ar: "المكالمة الأولى" }, durationSec: 366, order: 1, status: "published", source: up("first-call.mp4") },
  { id: "v7", courseId: "c3", title: { en: "Running a great viewing", ar: "إدارة معاينة ناجحة" }, durationSec: 402, order: 2, status: "published", source: up("viewings.mp4") },
  { id: "v8", courseId: "c3", title: { en: "Ethics and data privacy", ar: "الأخلاقيات وخصوصية البيانات" }, durationSec: 318, order: 3, status: "published", source: up("ethics-privacy.mp4") },
  { id: "v9", courseId: "c4", title: { en: "Your leads list", ar: "قائمة عملائك المحتملين" }, durationSec: 274, order: 1, status: "draft", source: { kind: "url", url: "https://videos.example.com/leads-list" } },
];

export type QuizQuestion = {
  id: string;
  text: Localized;
  options: Localized[];
  correctIndex: number;
  active: boolean;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: { en: "A client asks for a price in USD but the unit is only listed in EGP. What should you do?", ar: "طلب عميل السعر بالدولار لكن الوحدة مسعّرة بالجنيه فقط. ماذا تفعل؟" },
    options: [
      { en: "Convert it yourself using today's rate", ar: "أحوّله بنفسي بسعر اليوم" },
      { en: "Share the listed EGP price and say no official USD price exists", ar: "أشارك السعر بالجنيه وأوضح عدم وجود سعر رسمي بالدولار" },
      { en: "Estimate a rounded USD figure", ar: "أقدّر رقمًا تقريبيًا بالدولار" },
      { en: "Refuse to answer", ar: "أرفض الإجابة" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q2",
    text: { en: "When should you first contact a newly assigned lead?", ar: "متى يجب التواصل لأول مرة مع عميل محتمل تم تعيينه حديثًا؟" },
    options: [
      { en: "Within the same working day", ar: "في نفس يوم العمل" },
      { en: "After one week", ar: "بعد أسبوع" },
      { en: "Only if they call first", ar: "فقط إذا اتصل هو أولًا" },
      { en: "At the end of the month", ar: "في نهاية الشهر" },
    ],
    correctIndex: 0,
    active: true,
  },
  {
    id: "q3",
    text: { en: "What does a 10% down payment on a 6,000,000 EGP unit equal?", ar: "كم يساوي مقدم 10% لوحدة سعرها 6,000,000 جنيه؟" },
    options: [
      { en: "60,000 EGP", ar: "60,000 جنيه" },
      { en: "600,000 EGP", ar: "600,000 جنيه" },
      { en: "6,000 EGP", ar: "6,000 جنيه" },
      { en: "1,000,000 EGP", ar: "1,000,000 جنيه" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q4",
    text: { en: "Where should you record what happened on a client call?", ar: "أين يجب تسجيل ما حدث في مكالمة العميل؟" },
    options: [
      { en: "In a personal notebook", ar: "في دفتر شخصي" },
      { en: "As a note on the lead in the Maskan app", ar: "كملاحظة على العميل في تطبيق مسكن" },
      { en: "Nowhere", ar: "لا داعي للتسجيل" },
      { en: "In a WhatsApp group", ar: "في مجموعة واتساب" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q5",
    text: { en: "\"Core & shell\" finishing means:", ar: "تشطيب \"نصف تشطيب\" يعني:" },
    options: [
      { en: "Fully furnished", ar: "مفروش بالكامل" },
      { en: "Structure and exterior done; interior not finished", ar: "الهيكل والواجهات منتهية والداخل غير مشطب" },
      { en: "Not yet built", ar: "لم يُبنَ بعد" },
      { en: "Ready with appliances", ar: "جاهز بالأجهزة" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q6",
    text: { en: "A client shares their national ID photo with you on WhatsApp. You should:", ar: "أرسل لك عميل صورة بطاقته الشخصية على واتساب. يجب عليك:" },
    options: [
      { en: "Forward it to colleagues", ar: "إعادة إرسالها للزملاء" },
      { en: "Keep it in your gallery", ar: "الاحتفاظ بها في معرض الصور" },
      { en: "Use only the official process and delete local copies", ar: "استخدام الإجراء الرسمي فقط وحذف النسخ المحلية" },
      { en: "Post it in the team group", ar: "نشرها في مجموعة الفريق" },
    ],
    correctIndex: 2,
    active: true,
  },
  {
    id: "q7",
    text: { en: "Which lead status fits a client who agreed to visit the compound on Saturday?", ar: "أي حالة تناسب عميلًا وافق على زيارة الكمبوند يوم السبت؟" },
    options: [
      { en: "New", ar: "جديد" },
      { en: "Viewing scheduled", ar: "معاينة محددة" },
      { en: "Converted", ar: "تم البيع" },
      { en: "Unreachable", ar: "لا يمكن الوصول إليه" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q8",
    text: { en: "If you cannot answer a technical question about a unit, you should:", ar: "إذا لم تستطع الإجابة عن سؤال فني عن وحدة، يجب أن:" },
    options: [
      { en: "Guess confidently", ar: "تخمّن بثقة" },
      { en: "Promise to check and follow up with accurate information", ar: "تعد بالتحقق والرد بمعلومة دقيقة" },
      { en: "Change the subject", ar: "تغيّر الموضوع" },
      { en: "End the call", ar: "تنهي المكالمة" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q9",
    text: { en: "Prices in the catalogue show a \"last updated\" date because:", ar: "تظهر الأسعار في الكتالوج بتاريخ \"آخر تحديث\" لأن:" },
    options: [
      { en: "It is decorative", ar: "هو للزينة فقط" },
      { en: "Prices change and clients must get current information", ar: "الأسعار تتغير ويجب أن يحصل العملاء على معلومة حديثة" },
      { en: "It shows when the compound opened", ar: "يوضح تاريخ افتتاح الكمبوند" },
      { en: "It is required for the quiz", ar: "مطلوب للاختبار" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q10",
    text: { en: "Who assigns leads to agents at Maskan?", ar: "من يعيّن العملاء المحتملين للوكلاء في مسكن؟" },
    options: [
      { en: "Agents choose their own", ar: "الوكلاء يختارون بأنفسهم" },
      { en: "An authorized sales manager", ar: "مدير مبيعات مفوّض" },
      { en: "The client", ar: "العميل" },
      { en: "It is random", ar: "بشكل عشوائي" },
    ],
    correctIndex: 1,
    active: true,
  },
  {
    id: "q11",
    text: { en: "What is the usual maximum installment period offered by New Cairo developers?", ar: "ما أقصى مدة تقسيط معتادة يقدمها مطورو القاهرة الجديدة؟" },
    options: [
      { en: "1 year", ar: "سنة واحدة" },
      { en: "It varies by developer and launch", ar: "تختلف حسب المطور والإطلاق" },
      { en: "Always 20 years", ar: "دائمًا 20 سنة" },
      { en: "There are no installments", ar: "لا يوجد تقسيط" },
    ],
    correctIndex: 1,
    active: false,
  },
  {
    id: "q12",
    text: { en: "A lead asks you to keep their budget confidential. You should:", ar: "طلب منك عميل محتمل إبقاء ميزانيته سرية. يجب عليك:" },
    options: [
      { en: "Share it with other agents to find a match", ar: "مشاركتها مع وكلاء آخرين لإيجاد وحدة مناسبة" },
      { en: "Record it in the lead notes, visible only to authorized staff", ar: "تسجيلها في ملاحظات العميل المرئية للموظفين المصرّح لهم فقط" },
      { en: "Post it on social media", ar: "نشرها على وسائل التواصل" },
      { en: "Forget about it", ar: "تجاهلها" },
    ],
    correctIndex: 1,
    active: false,
  },
];

export type QuizConfig = {
  questionCount: number;
  passThreshold: number;
  maxAttempts: number;
  timeLimitMinutes: number;
};

export type QuizConfigVersion = {
  version: number;
  changedBy: string;
  changedAt: string;
  changes: { field: keyof QuizConfig; from: number | null; to: number }[];
};

export const QUIZ_CONFIG: QuizConfig = { questionCount: 10, passThreshold: 70, maxAttempts: 2, timeLimitMinutes: 15 };

export const QUIZ_CONFIG_FIELDS: (keyof QuizConfig)[] = ["questionCount", "passThreshold", "maxAttempts", "timeLimitMinutes"];

/** Validation bounds (QUIZ-002). questionCount is further capped by the number of active questions. */
export const QUIZ_CONFIG_LIMITS: Record<keyof QuizConfig, { min: number; max: number }> = {
  questionCount: { min: 1, max: 50 },
  passThreshold: { min: 1, max: 100 },
  maxAttempts: { min: 1, max: 5 },
  timeLimitMinutes: { min: 5, max: 120 },
};

export const QUIZ_CONFIG_HISTORY: QuizConfigVersion[] = [
  {
    version: 3,
    changedBy: "Laila Mahmoud",
    changedAt: "2026-09-28T10:42:00.000Z",
    changes: [{ field: "timeLimitMinutes", from: 20, to: 15 }],
  },
  {
    version: 2,
    changedBy: "Laila Mahmoud",
    changedAt: "2026-09-02T08:15:00.000Z",
    changes: [
      { field: "passThreshold", from: 60, to: 70 },
      { field: "maxAttempts", from: 3, to: 2 },
    ],
  },
  {
    version: 1,
    changedBy: "Nour Salem",
    changedAt: "2026-08-20T12:00:00.000Z",
    changes: [
      { field: "questionCount", from: null, to: 10 },
      { field: "passThreshold", from: null, to: 60 },
      { field: "maxAttempts", from: null, to: 3 },
      { field: "timeLimitMinutes", from: null, to: 20 },
    ],
  },
];

// --- Trainee progress and quiz attempts (linked to recruitment sample applicants) ---

export const TOTAL_PUBLISHED_VIDEOS = VIDEOS.filter((v) => v.status === "published").length;

const COMPLETED_BY_APPLICANT: Record<string, number> = {
  a001: 8,
  a002: 8,
  a003: 8,
  a004: 8,
  a005: 8,
  a006: 8,
  a007: 6,
  a008: 3,
  a009: 1,
};

export type TrainingProgress = {
  applicantId: string;
  completedVideos: number;
  totalVideos: number;
  courses: { courseId: string; completed: number; total: number }[];
};

export function progressForApplicant(applicantId: string): TrainingProgress | undefined {
  const completed = COMPLETED_BY_APPLICANT[applicantId];
  if (completed === undefined) return undefined;
  let remaining = completed;
  const courses = COURSES.filter((c) => c.status === "published").map((c) => {
    const total = VIDEOS.filter((v) => v.courseId === c.id && v.status === "published").length;
    const done = Math.min(total, remaining);
    remaining -= done;
    return { courseId: c.id, completed: done, total };
  });
  return { applicantId, completedVideos: completed, totalVideos: TOTAL_PUBLISHED_VIDEOS, courses };
}

export type QuizAttempt = {
  id: string;
  applicantId: string;
  attemptNo: number;
  startedAt: string;
  endedAt: string;
  outcome: "submitted" | "expired";
  correct: number;
  total: number;
  passThreshold: number;
  durationSec: number;
};

type AttemptSeed = { applicantId: string; correct: number; outcome?: "expired"; minutes: number };

const ATTEMPT_SEEDS: AttemptSeed[][] = [
  [{ applicantId: "a001", correct: 9, minutes: 9.5 }],
  [
    { applicantId: "a002", correct: 5, minutes: 13 },
    { applicantId: "a002", correct: 8, minutes: 11 },
  ],
  [{ applicantId: "a003", correct: 7, minutes: 14 }],
  [{ applicantId: "a005", correct: 6, minutes: 12.5 }],
  [{ applicantId: "a006", correct: 4, outcome: "expired", minutes: 15 }],
];

const HOUR = 3_600_000;

export const QUIZ_ATTEMPTS: QuizAttempt[] = ATTEMPT_SEEDS.flatMap((group) =>
  group.map((s, n) => {
    // The last attempt ends exactly when the stage changed (qualified, or back to quiz_eligible on a fail).
    const anchor = stageDate(s.applicantId, "qualified") ?? stageDate(s.applicantId, "quiz_eligible") ?? "2026-10-01T09:00:00.000Z";
    const durationSec = Math.round(s.minutes * 60);
    const end = new Date(anchor).getTime() - (group.length - 1 - n) * 20 * HOUR;
    return {
      id: `att-${s.applicantId}-${n + 1}`,
      applicantId: s.applicantId,
      attemptNo: n + 1,
      startedAt: new Date(end - durationSec * 1000).toISOString(),
      endedAt: new Date(end).toISOString(),
      outcome: s.outcome ?? "submitted",
      correct: s.correct,
      total: 10,
      passThreshold: 70,
      durationSec,
    };
  }),
);

export const isPassed = (a: QuizAttempt) => (a.correct / a.total) * 100 >= a.passThreshold;

export function attemptsForApplicant(applicantId: string): QuizAttempt[] {
  return QUIZ_ATTEMPTS.filter((a) => a.applicantId === applicantId);
}

export type QualificationRecord = {
  applicantId: string;
  qualifiedAt: string;
  attemptsUsed: number;
  bestScore: number;
};

export const QUALIFICATIONS: QualificationRecord[] = APPLICANTS.filter((a) => a.stage === "qualified").map((a) => {
  const attempts = attemptsForApplicant(a.id);
  return {
    applicantId: a.id,
    qualifiedAt: stageDate(a.id, "qualified") ?? a.lastActivityAt,
    attemptsUsed: attempts.length,
    bestScore: Math.max(0, ...attempts.map((x) => x.correct)),
  };
});
