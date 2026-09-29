import { describe, expect, it } from "vitest";
import { calculateStreak, dateKeyInTimeZone, getDashboardMetrics } from "./metrics";
import type { DailyEntry, LearningPlan } from "./types";
const entry=(date:string,minutes=60):DailyEntry=>({id:date,date,courseraMinutes:minutes,practiceMinutes:0,projectMinutes:0,reviewMinutes:0,modulesCompleted:1,energyScore:3,focusScore:3,completedTasks:"",blockers:"",reflection:"",createdAt:"",updatedAt:""});
describe("dashboard calculations",()=>{
  it("uses the stored timezone for the current date",()=>expect(dateKeyInTimeZone(new Date("2026-01-01T00:30:00Z"),"America/Los_Angeles")).toBe("2025-12-31"));
  it("continues streaks across a UTC boundary in the profile timezone",()=>expect(calculateStreak([entry("2025-12-31"),entry("2025-12-30")],"America/Los_Angeles",new Date("2026-01-01T00:30:00Z"))).toBe(2));
  it("allows today to be absent while retaining yesterday's streak",()=>expect(calculateStreak([entry("2026-09-28"),entry("2026-09-27")],"Africa/Lagos",new Date("2026-09-29T12:00:00Z"))).toBe(2));
  it("computes Monday-based weekly totals and task completion",()=>{const plan={weeklyTargetMinutes:1800,weeks:[{tasks:[{completedAt:"2026-09-28T00:00:00Z"},{completedAt:null}]}]} as unknown as LearningPlan;const result=getDashboardMetrics([entry("2026-09-28",120),entry("2026-09-27",300)],plan,"Africa/Lagos",new Date("2026-09-29T12:00:00Z"));expect(result.weeklyMinutes).toBe(120);expect(result.sprintProgress).toBe(50)});
});
