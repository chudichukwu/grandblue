import { describe, expect, it } from "vitest";
import { parseLegacyData } from "./storage";

const entry = { id: "legacy-1", date: "2026-09-29", courseraMinutes: 60, practiceMinutes: 30, projectMinutes: 0, reviewMinutes: 15, modulesCompleted: 1, energyScore: 4, focusScore: 5, completedTasks: "Done", blockers: "", reflection: "Good.", createdAt: "2026-09-29T08:00:00.000Z", updatedAt: "2026-09-29T09:00:00.000Z" };

describe("legacy local-data migration", () => {
  it("accepts a valid Phase 1 envelope", () => {
    const result = parseLegacyData(JSON.stringify({ version: 1, entries: [entry] }));
    expect(result.status).toBe("ready");
    expect(result.entries).toHaveLength(1);
  });
  it("reports malformed JSON without deleting it", () => {
    expect(parseLegacyData("{bad").status).toBe("invalid");
  });
  it("rejects invalid records", () => {
    expect(parseLegacyData(JSON.stringify({ version: 1, entries: [{ ...entry, energyScore: 9 }] })).status).toBe("invalid");
  });
});
