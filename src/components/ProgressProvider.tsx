"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { browserDailyEntryRepository } from "@/lib/repositories/daily-entries";
import type { DailyEntry, DailyEntryInput } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

interface ProgressContextValue {
  entries: DailyEntry[];
  error: string | null;
  hydrated: boolean;
  saveEntry: (entry: DailyEntryInput) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    try {
      setEntries(await browserDailyEntryRepository.list());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Progress could not be loaded.");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void reload(); }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const value = useMemo<ProgressContextValue>(() => ({
    entries, error, hydrated, reload,
    async saveEntry(input) {
      try {
        const saved = await browserDailyEntryRepository.save(input);
        setEntries((current) => [saved, ...current.filter((entry) => entry.id !== saved.id && entry.date !== saved.date)].sort((a, b) => b.date.localeCompare(a.date)));
        setError(null);
        showToast("Check-in saved", "Your dashboard and history are up to date.");
        return true;
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "The check-in could not be saved.";
        setError(message); showToast("Save failed", message, "error");
        return false;
      }
    },
    async deleteEntry(id) {
      try {
        await browserDailyEntryRepository.delete(id);
        setEntries((current) => current.filter((entry) => entry.id !== id));
        setError(null);
        showToast("Check-in deleted", "The entry was removed from your history.");
        return true;
      } catch (deleteError) {
        const message = deleteError instanceof Error ? deleteError.message : "The check-in could not be deleted.";
        setError(message); showToast("Delete failed", message, "error");
        return false;
      }
    },
  }), [entries, error, hydrated, reload, showToast]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider.");
  return context;
}
