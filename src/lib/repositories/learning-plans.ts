import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningPlan, LearningTask, LearningTaskInput, PlanWeek } from "@/lib/types";

type Row = Record<string, unknown>;
const mapTask = (row: Row): LearningTask => ({ id: String(row.id), weekId: String(row.plan_week_id), title: String(row.title), detail: String(row.detail ?? ""), scheduledDate: row.scheduled_date as string | null, estimatedMinutes: Number(row.estimated_minutes), actualMinutes: Number(row.actual_minutes), priority: row.priority as LearningTask["priority"], category: row.category as LearningTask["category"], deadline: row.deadline as string | null, position: Number(row.position), completedAt: row.completed_at as string | null, notes: String(row.notes ?? ""), createdAt: String(row.created_at), updatedAt: String(row.updated_at) });

export class SupabaseLearningRepository {
  constructor(private readonly supabase: SupabaseClient, private readonly userId: string) { if (!userId) throw new Error("An authenticated user is required."); }

  async ensureDefaultPlan(): Promise<string> {
    const { data, error } = await this.supabase.rpc("ensure_default_learning_plan");
    if (error) throw new Error(`Default plan could not be prepared: ${error.message}`);
    return String(data);
  }

  async getDefaultPlan(): Promise<LearningPlan> {
    await this.ensureDefaultPlan();
    const { data: plan, error } = await this.supabase.from("learning_plans").select("*").eq("user_id", this.userId).eq("is_default", true).single();
    if (error) throw new Error(`Learning plan could not be loaded: ${error.message}`);
    const { data: weeks, error: weekError } = await this.supabase.from("plan_weeks").select("*").eq("user_id", this.userId).eq("learning_plan_id", plan.id).order("week_number");
    if (weekError) throw new Error(`Plan weeks could not be loaded: ${weekError.message}`);
    const weekIds = (weeks ?? []).map((week) => week.id);
    const taskResult = weekIds.length ? await this.supabase.from("tasks").select("*").eq("user_id", this.userId).in("plan_week_id", weekIds).order("position") : { data: [], error: null };
    if (taskResult.error) throw new Error(`Tasks could not be loaded: ${taskResult.error.message}`);
    const tasks = ((taskResult.data ?? []) as Row[]).map(mapTask);
    const mappedWeeks: PlanWeek[] = ((weeks ?? []) as Row[]).map((week) => ({ id: String(week.id), weekNumber: Number(week.week_number), title: String(week.title), description: String(week.description ?? ""), outcome: String(week.outcome ?? ""), startsOn: week.starts_on as string | null, endsOn: week.ends_on as string | null, targetMinutes: Number(week.target_minutes), notes: String(week.notes ?? ""), tasks: tasks.filter((task) => task.weekId === week.id) }));
    return { id: plan.id, title: plan.title, description: plan.description, startsOn: plan.starts_on, endsOn: plan.ends_on, weeklyTargetMinutes: plan.weekly_target_minutes, status: plan.status, notes: plan.notes ?? "", weeks: mappedWeeks };
  }

  async saveTask(input: LearningTaskInput): Promise<LearningTask> {
    const row = { user_id: this.userId, plan_week_id: input.weekId, title: input.title, detail: input.detail, scheduled_date: input.scheduledDate, estimated_minutes: input.estimatedMinutes, actual_minutes: input.actualMinutes, priority: input.priority, category: input.category, deadline: input.deadline, position: input.position, completed_at: input.completed ? new Date().toISOString() : null, notes: input.notes, client_request_id: input.clientRequestId };
    const { data, error } = await this.supabase.from("tasks").upsert(row, { onConflict: "user_id,client_request_id" }).select("*").single();
    if (error) throw new Error(`Task could not be created: ${error.message}`);
    return mapTask(data as Row);
  }

  async updateTask(id: string, changes: Partial<LearningTaskInput>): Promise<LearningTask> {
    const row: Row = {};
    const mapping: Record<string, string> = { weekId: "plan_week_id", scheduledDate: "scheduled_date", estimatedMinutes: "estimated_minutes", actualMinutes: "actual_minutes" };
    for (const [key, value] of Object.entries(changes)) if (key !== "clientRequestId" && key !== "completed") row[mapping[key] ?? key] = value;
    if (typeof changes.completed === "boolean") row.completed_at = changes.completed ? new Date().toISOString() : null;
    const { data, error } = await this.supabase.from("tasks").update(row).eq("id", id).eq("user_id", this.userId).select("*").single();
    if (error) throw new Error(`Task could not be updated: ${error.message}`);
    return mapTask(data as Row);
  }

  async deleteTask(id: string) { const { error } = await this.supabase.from("tasks").delete().eq("id", id).eq("user_id", this.userId); if (error) throw new Error(`Task could not be deleted: ${error.message}`); }

  async reorderTasks(weekId: string, taskIds: string[]) {
    const { data, error } = await this.supabase.from("tasks").select("id").eq("user_id", this.userId).eq("plan_week_id", weekId);
    if (error) throw new Error(`Tasks could not be verified: ${error.message}`);
    const owned = new Set((data ?? []).map((item) => item.id));
    if (taskIds.some((id) => !owned.has(id)) || taskIds.length !== owned.size) throw new Error("The reorder request must contain every task in the selected week.");
    for (let position = 0; position < taskIds.length; position += 1) {
      const result = await this.supabase.from("tasks").update({ position }).eq("id", taskIds[position]).eq("user_id", this.userId).eq("plan_week_id", weekId);
      if (result.error) throw new Error(`Tasks could not be reordered: ${result.error.message}`);
    }
  }

  async updateWeek(input: Omit<PlanWeek, "weekNumber" | "tasks">) {
    const { error } = await this.supabase.from("plan_weeks").update({ title: input.title, description: input.description, outcome: input.outcome, starts_on: input.startsOn, ends_on: input.endsOn, target_minutes: input.targetMinutes, notes: input.notes }).eq("id", input.id).eq("user_id", this.userId);
    if (error) throw new Error(`Plan week could not be updated: ${error.message}`);
  }
}
