/**
 * PROTOTYPE ONLY — stands in for the server-side quiz attempt (QUIZ-003/004).
 * Lives at module level so the deadline and saved answers survive leaving and
 * re-entering the quiz screen, like a server deadline would.
 */
export type AttemptSession = {
  deadline: number;
  answers: (number | null)[];
  index: number;
};

let session: AttemptSession | null = null;

export function getSession(): AttemptSession | null {
  return session;
}

export function startSession(questionCount: number, minutes: number): AttemptSession {
  session = {
    deadline: Date.now() + minutes * 60_000,
    answers: Array.from({ length: questionCount }, () => null),
    index: 0,
  };
  return session;
}

export function saveSession(patch: Partial<Omit<AttemptSession, "deadline">>): void {
  if (session) session = { ...session, ...patch };
}

export function clearSession(): void {
  session = null;
}
