import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260929080000_production_data_foundation.sql"), "utf8");
const tables = ["profiles", "daily_entries", "learning_plans", "plan_weeks", "tasks", "focus_sessions", "notification_preferences", "push_subscriptions", "telegram_connections", "scheduled_notifications", "notification_deliveries"];

describe("production schema security contract", () => {
  it.each(tables)("declares user ownership for %s", (table) => {
    const definition = migration.match(new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`))?.[1];
    expect(definition).toBeDefined();
    expect(definition).toMatch(/user_id uuid/);
  });
  it("enables and forces RLS for the complete table set", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("force row level security");
    for (const table of tables) expect(migration).toContain(`'${table}'`);
  });
  it("creates explicit policies for each operation", () => {
    for (const operation of ["select", "insert", "update", "delete"]) expect(migration).toContain(`for ${operation} to authenticated`);
    expect(migration).toContain("(select auth.uid()) = user_id");
  });
  it("includes delivery idempotency and retry fields", () => {
    for (const field of ["idempotency_key", "scheduled_for", "claimed_at", "delivered_at", "attempt_count", "last_error"]) expect(migration).toContain(field);
    expect(migration).toContain("unique (user_id, idempotency_key)");
  });
  it("protects duplicate daily submissions", () => expect(migration).toContain("unique (user_id, entry_date)"));
});

describe("phase 3 migration contract", () => {
  const phase3 = readFileSync(join(process.cwd(), "supabase/migrations/20260929100000_phase_3_learning_plans_tasks.sql"), "utf8");
  it("creates the default plan idempotently", () => { expect(phase3).toContain("learning_plans_one_default_per_user_idx"); expect(phase3).toContain("pg_advisory_xact_lock"); expect(phase3).toContain("if plan_id is null"); expect(phase3.match(/\(owner_id, plan_id, [1-6],/g)).toHaveLength(6); });
  it("protects repeated task submissions", () => expect(phase3).toContain("tasks_user_request_id_idx"));
  it("adds the complete task management model", () => { for(const field of ["scheduled_date","estimated_minutes","actual_minutes","priority","category","deadline","notes"]) expect(phase3).toContain(field); });
});
