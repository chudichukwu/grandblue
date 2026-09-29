export type Score = 1 | 2 | 3 | 4 | 5;

export interface DailyEntry {
  id: string;
  date: string;
  courseraMinutes: number;
  practiceMinutes: number;
  projectMinutes: number;
  reviewMinutes: number;
  modulesCompleted: number;
  energyScore: Score;
  focusScore: Score;
  completedTasks: string;
  blockers: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export type DailyEntryInput = Omit<DailyEntry, "id" | "createdAt" | "updatedAt">;

export interface StoredData {
  version: 1;
  entries: DailyEntry[];
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "course" | "practice" | "project" | "review";

export interface LearningTask {
  id: string; weekId: string; title: string; detail: string; scheduledDate: string | null;
  estimatedMinutes: number; actualMinutes: number; priority: TaskPriority; category: TaskCategory;
  deadline: string | null; position: number; completedAt: string | null; notes: string;
  createdAt: string; updatedAt: string;
}

export interface PlanWeek {
  id: string; weekNumber: number; title: string; description: string; outcome: string;
  startsOn: string | null; endsOn: string | null; targetMinutes: number; notes: string;
  tasks: LearningTask[];
}

export interface LearningPlan {
  id: string; title: string; description: string; startsOn: string; endsOn: string;
  weeklyTargetMinutes: number; status: "draft" | "active" | "completed" | "archived";
  notes: string; weeks: PlanWeek[];
}

export interface Profile { timezone: string; displayName: string | null; }

export type LearningTaskInput = Omit<LearningTask, "id" | "completedAt" | "createdAt" | "updatedAt"> & { completed: boolean; clientRequestId: string };
