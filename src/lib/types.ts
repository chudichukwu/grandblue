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

export interface PlannedTask {
  id: string;
  title: string;
  category: "Course" | "Practice" | "Project" | "Review";
  durationMinutes: number;
  completed: boolean;
}

export interface StoredData {
  version: 1;
  entries: DailyEntry[];
}
