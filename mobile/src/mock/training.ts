/** PROTOTYPE SAMPLE DATA — placeholder training content; real courses come from the client. */
import type { Localized } from "@/lib/localized";

export type CourseVideo = { id: string; title: Localized; durationSec: number };
export type Course = { id: string; title: Localized; description: Localized; videos: CourseVideo[] };

export const COURSES: Course[] = [
  {
    id: "c1",
    title: { en: "Welcome to ElSakka", ar: "مرحبًا بك في السقا" },
    description: {
      en: "How the agency works, our standards, and what we expect from every agent.",
      ar: "كيف تعمل الوكالة، ومعاييرنا، وما نتوقعه من كل وكيل.",
    },
    videos: [
      { id: "v1", title: { en: "Our story and values", ar: "قصتنا وقيمنا" }, durationSec: 312 },
      { id: "v2", title: { en: "How agents earn", ar: "كيف يربح الوكلاء" }, durationSec: 425 },
    ],
  },
  {
    id: "c2",
    title: { en: "The New Cairo market", ar: "سوق القاهرة الجديدة" },
    description: {
      en: "Districts, price ranges, payment plans, and how developers structure launches.",
      ar: "الأحياء، ونطاقات الأسعار، وخطط السداد، وكيف ينظم المطورون الإطلاقات.",
    },
    videos: [
      { id: "v3", title: { en: "Districts and compounds", ar: "الأحياء والكمبوندات" }, durationSec: 540 },
      { id: "v4", title: { en: "Understanding payment plans", ar: "فهم خطط السداد" }, durationSec: 488 },
      { id: "v5", title: { en: "Prices in different currencies", ar: "الأسعار بعملات مختلفة" }, durationSec: 296 },
    ],
  },
  {
    id: "c3",
    title: { en: "Working with clients", ar: "التعامل مع العملاء" },
    description: {
      en: "First contact, qualifying needs, viewings, objections, and closing professionally.",
      ar: "التواصل الأول، وتحديد الاحتياجات، والمعاينات، والاعتراضات، وإتمام البيع باحترافية.",
    },
    videos: [
      { id: "v6", title: { en: "The first call", ar: "المكالمة الأولى" }, durationSec: 366 },
      { id: "v7", title: { en: "Running a great viewing", ar: "إدارة معاينة ناجحة" }, durationSec: 402 },
      { id: "v8", title: { en: "Ethics and data privacy", ar: "الأخلاقيات وخصوصية البيانات" }, durationSec: 318 },
    ],
  },
];

export const ALL_VIDEOS = COURSES.flatMap((c) => c.videos.map((v) => ({ ...v, courseId: c.id })));

export type QuizQuestion = { id: string; text: Localized; options: Localized[]; correctIndex: number };

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
  },
  {
    id: "q4",
    text: { en: "Where should you record what happened on a client call?", ar: "أين يجب تسجيل ما حدث في مكالمة العميل؟" },
    options: [
      { en: "In a personal notebook", ar: "في دفتر شخصي" },
      { en: "As a note on the lead in the ElSakka app", ar: "كملاحظة على العميل في تطبيق السقا" },
      { en: "Nowhere", ar: "لا داعي للتسجيل" },
      { en: "In a WhatsApp group", ar: "في مجموعة واتساب" },
    ],
    correctIndex: 1,
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
  },
  {
    id: "q10",
    text: { en: "Who assigns leads to agents at ElSakka?", ar: "من يعيّن العملاء المحتملين للوكلاء في السقا؟" },
    options: [
      { en: "Agents choose their own", ar: "الوكلاء يختارون بأنفسهم" },
      { en: "An authorized sales manager", ar: "مدير مبيعات مفوّض" },
      { en: "The client", ar: "العميل" },
      { en: "It is random", ar: "بشكل عشوائي" },
    ],
    correctIndex: 1,
  },
];
