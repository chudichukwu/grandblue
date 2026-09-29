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
});
