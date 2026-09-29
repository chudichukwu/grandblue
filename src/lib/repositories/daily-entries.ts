import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyEntry, DailyEntryInput } from "@/lib/types";
import type { ValidatedDailyEntryInput } from "@/lib/validation/daily-entry";

type DailyEntryRow = {
  id: string; user_id: string; entry_date: string; coursera_minutes: number; practice_minutes: number;
  project_minutes: number; review_minutes: number; modules_completed: number; energy_score: number;
  focus_score: number; completed_tasks: string; blockers: string; reflection: string;
  created_at: string; updated_at: string; import_source?: string | null; imported_source_id?: string | null;
};

export interface DailyEntryRepository {
  list(): Promise<DailyEntry[]>;
  save(input: DailyEntryInput): Promise<DailyEntry>;
  delete(id: string): Promise<void>;
}

export function toDailyEntry(row: DailyEntryRow): DailyEntry {
  return { id: row.id, date: row.entry_date, courseraMinutes: row.coursera_minutes, practiceMinutes: row.practice_minutes, projectMinutes: row.project_minutes, reviewMinutes: row.review_minutes, modulesCompleted: row.modules_completed, energyScore: row.energy_score as DailyEntry["energyScore"], focusScore: row.focus_score as DailyEntry["focusScore"], completedTasks: row.completed_tasks, blockers: row.blockers, reflection: row.reflection, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function toDailyEntryRow(input: ValidatedDailyEntryInput, userId: string, importedSourceId?: string) {
  if (!userId) throw new Error("An authenticated user is required.");
  return { user_id: userId, entry_date: input.date, coursera_minutes: input.courseraMinutes, practice_minutes: input.practiceMinutes, project_minutes: input.projectMinutes, review_minutes: input.reviewMinutes, modules_completed: input.modulesCompleted, energy_score: input.energyScore, focus_score: input.focusScore, completed_tasks: input.completedTasks, blockers: input.blockers, reflection: input.reflection, ...(importedSourceId ? { import_source: "local_storage_v1", imported_source_id: importedSourceId } : {}) };
}

export class SupabaseDailyEntryRepository {
  constructor(private readonly supabase: SupabaseClient, private readonly userId: string) {
    if (!userId) throw new Error("An authenticated user is required.");
  }

  async list(): Promise<DailyEntry[]> {
    const { data, error } = await this.supabase.from("daily_entries").select("*").eq("user_id", this.userId).order("entry_date", { ascending: false });
    if (error) throw new Error(`Daily entries could not be loaded: ${error.message}`);
    return ((data ?? []) as DailyEntryRow[]).map(toDailyEntry);
  }

  async save(input: ValidatedDailyEntryInput): Promise<DailyEntry> {
    const { data, error } = await this.supabase.from("daily_entries").upsert(toDailyEntryRow(input, this.userId), { onConflict: "user_id,entry_date" }).select("*").single();
    if (error) throw new Error(`Daily entry could not be saved: ${error.message}`);
    return toDailyEntry(data as DailyEntryRow);
  }

  async importOne(input: ValidatedDailyEntryInput, sourceId: string): Promise<DailyEntry> {
    const { data, error } = await this.supabase.from("daily_entries").upsert(toDailyEntryRow(input, this.userId, sourceId), { onConflict: "user_id,entry_date" }).select("*").single();
    if (error) throw new Error(`Entry ${input.date} could not be imported: ${error.message}`);
    return toDailyEntry(data as DailyEntryRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("daily_entries").delete().eq("id", id).eq("user_id", this.userId);
    if (error) throw new Error(`Daily entry could not be deleted: ${error.message}`);
  }
}

export const browserDailyEntryRepository: DailyEntryRepository = {
  async list() {
    const response = await fetch("/api/daily-entries", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Daily entries could not be loaded.");
    return payload.entries;
  },
  async save(input) {
    const response = await fetch("/api/daily-entries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Daily entry could not be saved.");
    return payload.entry;
  },
  async delete(id) {
    const response = await fetch(`/api/daily-entries/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Daily entry could not be deleted.");
  },
};
