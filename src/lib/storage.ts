import { seedEntries } from "@/lib/seed";
import type { DailyEntry, DailyEntryInput, Score, StoredData } from "@/lib/types";

const STORAGE_KEY = "grand-blue.progress.v1";

export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StorageError";
  }
}

function isScore(value: unknown): value is Score {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function isEntry(value: unknown): value is DailyEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  const numberKeys = ["courseraMinutes", "practiceMinutes", "projectMinutes", "reviewMinutes", "modulesCompleted"];
  const stringKeys = ["id", "date", "completedTasks", "blockers", "reflection", "createdAt", "updatedAt"];
  return stringKeys.every((key) => typeof entry[key] === "string")
    && numberKeys.every((key) => typeof entry[key] === "number" && Number(entry[key]) >= 0)
    && isScore(entry.energyScore)
    && isScore(entry.focusScore)
    && /^\d{4}-\d{2}-\d{2}$/.test(entry.date as string);
}

function parseStoredData(raw: string): StoredData {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object") throw new Error("Stored value is not an object.");
  const candidate = data as Partial<StoredData>;
  if (candidate.version !== 1 || !Array.isArray(candidate.entries) || !candidate.entries.every(isEntry)) {
    throw new Error("Stored data does not match the current format.");
  }
  return candidate as StoredData;
}

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new StorageError("Browser storage is unavailable.");
  }
  return window.localStorage;
}

export const entryRepository = {
  load(): { entries: DailyEntry[]; seeded: boolean } {
    try {
      const storage = getStorage();
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        const entries = seedEntries.map((entry) => ({ ...entry }));
        storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries } satisfies StoredData));
        return { entries, seeded: true };
      }
      return { entries: parseStoredData(raw).entries, seeded: false };
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("Saved progress could not be read. Your browser data may be malformed or blocked.", { cause: error });
    }
  },

  save(input: DailyEntryInput): DailyEntry[] {
    try {
      const storage = getStorage();
      const existingRaw = storage.getItem(STORAGE_KEY);
      const entries = existingRaw ? parseStoredData(existingRaw).entries : [];
      const match = entries.find((entry) => entry.date === input.date);
      const now = new Date().toISOString();
      const saved: DailyEntry = match
        ? { ...match, ...input, updatedAt: now }
        : { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      const next = [saved, ...entries.filter((entry) => entry.date !== input.date)].sort((a, b) => b.date.localeCompare(a.date));
      storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries: next } satisfies StoredData));
      return next;
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("This check-in could not be saved. Check your browser storage settings and try again.", { cause: error });
    }
  },
};
