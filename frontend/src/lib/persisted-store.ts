"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A localStorage-backed value readable via useSyncExternalStore: server render
 * and first hydration use `fallback`, then the stored value — no setState in
 * effects, no hydration mismatch. Storage failures fall back silently.
 */
export function createPersistedStore<T extends string>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const listeners = new Set<() => void>();
  let memory: T | null = null;

  const read = (): T => {
    if (memory !== null) return memory;
    try {
      const stored = window.localStorage.getItem(key);
      memory = isValid(stored) ? stored : fallback;
    } catch {
      memory = fallback;
    }
    return memory;
  };

  const write = (value: T) => {
    memory = value;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return function usePersisted(): [T, (value: T) => void] {
    const value = useSyncExternalStore(subscribe, read, () => fallback);
    const set = useCallback((next: T) => write(next), []);
    return [value, set];
  };
}
