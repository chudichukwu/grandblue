import { describe, expect, it } from "vitest";
import { toDailyEntryRow } from "./daily-entries";

const input = { date: "2026-09-29", courseraMinutes: 60, practiceMinutes: 30, projectMinutes: 0, reviewMinutes: 15, modulesCompleted: 1, energyScore: 4, focusScore: 5, completedTasks: "Done", blockers: "", reflection: "Good." } as const;

describe("daily entry repository ownership", () => {
  it("always binds a mutation row to the authenticated user", () => {
    const row = toDailyEntryRow(input, "user-a");
    expect(row.user_id).toBe("user-a");
    expect(row).not.toHaveProperty("id");
  });
  it("refuses to construct a mutation without an authenticated user", () => {
    expect(() => toDailyEntryRow(input, "")).toThrow("authenticated user");
  });
  it("marks imported rows with a stable source identifier", () => {
    expect(toDailyEntryRow(input, "user-a", "legacy-1")).toMatchObject({ user_id: "user-a", import_source: "local_storage_v1", imported_source_id: "legacy-1" });
  });
});
