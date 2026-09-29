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

export type TimerMode = "focus" | "short_break" | "long_break";
export type TimerStatus = "scheduled" | "active" | "paused" | "completed" | "skipped" | "cancelled";
export interface FocusSession {
  id: string; mode: TimerMode; status: TimerStatus; durationSeconds: number; startedAt: string;
  endsAt: string; pausedAt: string | null; completedAt: string | null; skippedAt: string | null;
  taskId: string | null; remainingSecondsWhenPaused: number | null; actualFocusSeconds: number; version: number;
}
export interface TimerPreferences {
  focusMinutes: number; shortBreakMinutes: number; longBreakMinutes: number; longBreakAfterSessions: number;
  autoStartBreak: boolean; autoStartFocus: boolean; soundEnabled: boolean; browserNotificationsEnabled: boolean;
  breakAlertsEnabled: boolean; inAppAlertsEnabled: boolean;
}
export interface InAppNotification { id: string; kind: string; title: string; body: string; href: string | null; readAt: string | null; createdAt: string; }
export interface TimerSnapshot { session: FocusSession | null; preferences: TimerPreferences; notifications: InAppNotification[]; completedFocusToday: number; focusSecondsToday: number; }
