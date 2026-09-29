import { z } from "zod";
import { localEntrySchema } from "./validation/daily-entry";
import type { DailyEntry } from "./types";

export const LEGACY_STORAGE_KEY = "grand-blue.progress.v1";
const legacyEnvelopeSchema = z.object({ version: z.literal(1), entries: z.array(localEntrySchema).max(500) });

export type LocalDataInspection =
  | { status: "none"; entries: [] }
  | { status: "ready"; entries: DailyEntry[] }
  | { status: "invalid"; entries: []; error: string };

export function parseLegacyData(raw: string | null): LocalDataInspection {
  if (!raw) return { status: "none", entries: [] };
  try {
    const parsed = legacyEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { status: "invalid", entries: [], error: "Local progress exists but does not match the supported Phase 1 format." };
    return parsed.data.entries.length ? { status: "ready", entries: parsed.data.entries as DailyEntry[] } : { status: "none", entries: [] };
  } catch (error) {
    return { status: "invalid", entries: [], error: error instanceof Error ? `Local progress could not be read: ${error.message}` : "Local progress could not be read." };
  }
}

export const localDataRepository = {
  inspect(): LocalDataInspection {
    if (typeof window === "undefined") return { status: "none", entries: [] };
    try {
      if (!window.localStorage) return { status: "none", entries: [] };
      return parseLegacyData(window.localStorage.getItem(LEGACY_STORAGE_KEY));
    } catch (error) {
      return { status: "invalid", entries: [], error: error instanceof Error ? `Local progress could not be read: ${error.message}` : "Local progress could not be read." };
    }
  },
  removeAfterSuccessfulImport(): void {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      throw new Error(error instanceof Error ? `Imported data is safe on the server, but the local copy could not be removed: ${error.message}` : "The local copy could not be removed.");
    }
  },
};
