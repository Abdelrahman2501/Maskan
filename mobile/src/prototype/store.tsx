/**
 * PROTOTYPE ONLY — in-memory stand-in for the backend so every screen can be
 * clicked through. Mirrors the applicant state machine in specs/03-user-journeys.md.
 * Replace with real API calls (TanStack Query) when FEAT-001+ are built.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { LEADS, type Lead, type LeadNote, type LeadStatus } from "@/mock/leads";

export type Stage =
  | "guest"
  | "phone_pending"
  | "identity_pending"
  | "identity_processing"
  | "identity_review"
  | "identity_action_required"
  | "interview_pending"
  | "interview_submitted"
  | "rejected"
  | "training"
  | "quiz_eligible"
  | "quiz_exhausted"
  | "qualified";

export const QUIZ_MAX_ATTEMPTS = 2;
export const QUIZ_PASS_PCT = 70;
export const QUIZ_TIME_LIMIT_MIN = 15;

export type QuizAttempt = { score: number; total: number; passed: boolean; at: string };

type Profile = { firstName: string; lastName: string; email: string; phone: string };

type PrototypeState = {
  stage: Stage;
  profile: Profile;
  /** videoId → watched fraction 0..1 */
  videoProgress: Record<string, number>;
  attempts: QuizAttempt[];
  leads: Lead[];
};

type PrototypeActions = {
  setStage: (stage: Stage) => void;
  setProfile: (profile: Partial<Profile>) => void;
  setVideoProgress: (videoId: string, fraction: number) => void;
  recordAttempt: (score: number, total: number) => QuizAttempt;
  addLeadNote: (leadId: string, body: string) => void;
  setLeadStatus: (leadId: string, status: LeadStatus) => void;
  reset: () => void;
};

const INITIAL: PrototypeState = {
  stage: "guest",
  profile: { firstName: "Omar", lastName: "Hassan", email: "omar.hassan@example.com", phone: "+20 100 123 4567" },
  videoProgress: {},
  attempts: [],
  leads: LEADS,
};

const Ctx = createContext<(PrototypeState & PrototypeActions) | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(INITIAL);

  const setStage = useCallback((stage: Stage) => setState((s) => ({ ...s, stage })), []);
  const setProfile = useCallback(
    (profile: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...profile } })),
    [],
  );
  const setVideoProgress = useCallback(
    (videoId: string, fraction: number) =>
      setState((s) => ({
        ...s,
        // Monotonic, like the server rule TRN-004.
        videoProgress: { ...s.videoProgress, [videoId]: Math.max(s.videoProgress[videoId] ?? 0, fraction) },
      })),
    [],
  );
  const recordAttempt = useCallback((score: number, total: number) => {
    const attempt: QuizAttempt = {
      score,
      total,
      passed: (score / total) * 100 >= QUIZ_PASS_PCT,
      at: new Date().toISOString(),
    };
    setState((s) => {
      const attempts = [...s.attempts, attempt];
      const stage: Stage = attempt.passed
        ? "qualified"
        : attempts.length >= QUIZ_MAX_ATTEMPTS
          ? "quiz_exhausted"
          : "quiz_eligible";
      return { ...s, attempts, stage };
    });
    return attempt;
  }, []);
  const addLeadNote = useCallback(
    (leadId: string, body: string) =>
      setState((s) => ({
        ...s,
        leads: s.leads.map((lead) => {
          if (lead.id !== leadId) return lead;
          const note: LeadNote = {
            id: `n-${Date.now()}`,
            author: `${s.profile.firstName} ${s.profile.lastName}`,
            body,
            at: new Date().toISOString(),
          };
          return { ...lead, notes: [note, ...lead.notes], lastActivityAt: note.at };
        }),
      })),
    [],
  );
  const setLeadStatus = useCallback(
    (leadId: string, status: LeadStatus) =>
      setState((s) => ({
        ...s,
        leads: s.leads.map((lead) =>
          lead.id === leadId ? { ...lead, status, lastActivityAt: new Date().toISOString() } : lead,
        ),
      })),
    [],
  );
  const reset = useCallback(() => setState(INITIAL), []);

  const value = useMemo(
    () => ({ ...state, setStage, setProfile, setVideoProgress, recordAttempt, addLeadNote, setLeadStatus, reset }),
    [state, setStage, setProfile, setVideoProgress, recordAttempt, addLeadNote, setLeadStatus, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrototype() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used inside <PrototypeProvider>");
  return ctx;
}

/** Where each stage lands the user (used by the welcome screen, login, and the prototype menu). */
export const STAGE_HOME: Record<Stage, string> = {
  guest: "/",
  phone_pending: "/(auth)/otp",
  identity_pending: "/(onboarding)/identity",
  identity_processing: "/(onboarding)/identity-status",
  identity_review: "/(onboarding)/identity-status",
  identity_action_required: "/(onboarding)/identity-status",
  interview_pending: "/(onboarding)/interview",
  interview_submitted: "/(onboarding)/interview-submitted",
  rejected: "/(onboarding)/decision",
  training: "/(training)",
  quiz_eligible: "/(training)",
  quiz_exhausted: "/(training)/quiz-result",
  qualified: "/(agent)/home",
};
