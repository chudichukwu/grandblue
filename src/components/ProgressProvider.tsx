"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { entryRepository } from "@/lib/storage";
import type { DailyEntry, DailyEntryInput } from "@/lib/types";

interface ProgressContextValue {
  entries: DailyEntry[];
  error: string | null;
  hydrated: boolean;
  saveEntry: (entry: DailyEntryInput) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setEntries(entryRepository.load().entries);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Progress could not be loaded.");
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<ProgressContextValue>(() => ({
    entries,
    error,
    hydrated,
    saveEntry(input) {
      try {
        setEntries(entryRepository.save(input));
        setError(null);
        return true;
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "The check-in could not be saved.");
        return false;
      }
    },
  }), [entries, error, hydrated]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider.");
  return context;
}
