"use client";

import { useSyncExternalStore } from "react";

import {
  COURSES,
  QUIZ_CONFIG,
  QUIZ_CONFIG_HISTORY,
  QUIZ_QUESTIONS,
  VIDEOS,
  type Course,
  type CourseVideo,
  type QuizConfig,
  type QuizConfigVersion,
  type QuizQuestion,
} from "@/mock/training";

/**
 * PROTOTYPE ONLY — in-memory state shared by the training admin screens so an
 * edit on one page (e.g. deactivating questions) is reflected on another
 * (e.g. quiz configuration) during the session. Nothing is persisted; the
 * real app reads and writes through the API.
 */
function createMemoryStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = () => state;
  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    listeners.forEach((l) => l());
  };
  return function useMemoryStore(): [T, typeof set] {
    const value = useSyncExternalStore(subscribe, get, () => initial);
    return [value, set];
  };
}

export const useCourses = createMemoryStore<Course[]>(COURSES);
export const useVideos = createMemoryStore<CourseVideo[]>(VIDEOS);
export const useQuestions = createMemoryStore<QuizQuestion[]>(QUIZ_QUESTIONS);
export const useQuizConfig = createMemoryStore<{ config: QuizConfig; history: QuizConfigVersion[] }>({
  config: QUIZ_CONFIG,
  history: QUIZ_CONFIG_HISTORY,
});

/** Next free id with the given prefix, e.g. nextId("v", videos) → "v10". */
export function nextId(prefix: string, rows: { id: string }[]): string {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, "")) || 0), 0);
  return `${prefix}${max + 1}`;
}
