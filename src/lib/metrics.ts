import { sprintStartDate, todayKey } from "@/lib/seed";
import type { DailyEntry } from "@/lib/types";

export function totalMinutes(entry: DailyEntry): number {
  return entry.courseraMinutes + entry.practiceMinutes + entry.projectMinutes + entry.reviewMinutes;
}

export function startOfWeek(date = new Date()): string {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  const year = result.getFullYear();
  const month = String(result.getMonth() + 1).padStart(2, "0");
  const dateValue = String(result.getDate()).padStart(2, "0");
  return `${year}-${month}-${dateValue}`;
}

export function calculateStreak(entries: DailyEntry[]): number {
  const active = new Set(entries.filter((entry) => totalMinutes(entry) > 0).map((entry) => entry.date));
  const cursor = new Date(`${todayKey}T12:00:00`);
  if (!active.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getDashboardMetrics(entries: DailyEntry[]) {
  const today = entries.find((entry) => entry.date === todayKey);
  const weekStart = startOfWeek();
  const weeklyEntries = entries.filter((entry) => entry.date >= weekStart && entry.date <= todayKey);
  const daysSinceStart = Math.max(0, Math.floor((Date.now() - new Date(`${sprintStartDate}T00:00:00`).getTime()) / 86_400_000) + 1);
  return {
    todayMinutes: today ? totalMinutes(today) : 0,
    weeklyMinutes: weeklyEntries.reduce((sum, entry) => sum + totalMinutes(entry), 0),
    streak: calculateStreak(entries),
    sprintProgress: Math.min(100, Math.round((daysSinceStart / 42) * 100)),
    courseProgress: Math.min(100, Math.round((entries.reduce((sum, entry) => sum + entry.modulesCompleted, 0) / 36) * 100)),
    weeklyEntries,
  };
}
