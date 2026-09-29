import { describe, expect, it } from "vitest";
import { dailyEntryInputSchema } from "./daily-entry";

const valid = { date: "2026-09-29", courseraMinutes: 60, practiceMinutes: 0, projectMinutes: 0, reviewMinutes: 0, modulesCompleted: 1, energyScore: 4, focusScore: 5, completedTasks: "Module 1", blockers: "", reflection: "Clear progress." };

describe("dailyEntryInputSchema", () => {
  it("normalizes numeric form values", () => {
    const result = dailyEntryInputSchema.parse({ ...valid, courseraMinutes: "60" });
    expect(result.courseraMinutes).toBe(60);
  });
  it("rejects an entry without study time", () => {
    const result = dailyEntryInputSchema.safeParse({ ...valid, courseraMinutes: 0 });
    expect(result.success).toBe(false);
  });
  it("rejects scores outside the supported range", () => {
    expect(dailyEntryInputSchema.safeParse({ ...valid, energyScore: 6 }).success).toBe(false);
  });
});
