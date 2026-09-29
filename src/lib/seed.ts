import { shiftDate, toLocalDateKey } from "@/lib/date";
import type { DailyEntry, PlannedTask, Score } from "@/lib/types";

const sessions = [
  [250, 55, 60, 35, 2, 4, 4],
  [180, 90, 75, 30, 3, 3, 4],
  [210, 65, 90, 40, 2, 4, 5],
  [165, 110, 80, 45, 2, 3, 4],
  [225, 75, 65, 30, 3, 5, 4],
  [190, 85, 100, 35, 2, 4, 4],
] as const;

export const seedEntries: DailyEntry[] = sessions.map((session, index) => {
  const date = shiftDate(index - (sessions.length - 1));
  const timestamp = `${date}T18:00:00.000Z`;
  return {
    id: `seed-${date}`,
    date,
    courseraMinutes: session[0],
    practiceMinutes: session[1],
    projectMinutes: session[2],
    reviewMinutes: session[3],
    modulesCompleted: session[4],
    energyScore: session[5] as Score,
    focusScore: session[6] as Score,
    completedTasks: index % 2 === 0 ? "Course notes, SQL drills" : "Practice lab, project cleanup",
    blockers: index === 3 ? "Needed extra time to debug a join." : "",
    reflection: index === sessions.length - 1 ? "The shorter practice loops are improving recall." : "Kept the session deliberate and documented the key takeaways.",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
});

export const plannedTasks: PlannedTask[] = [
  { id: "course", title: "Finish two course modules", category: "Course", durationMinutes: 120, completed: true },
  { id: "practice", title: "Complete the SQL joins drill", category: "Practice", durationMinutes: 75, completed: false },
  { id: "project", title: "Clean the portfolio dataset", category: "Project", durationMinutes: 75, completed: false },
  { id: "review", title: "Write the daily learning log", category: "Review", durationMinutes: 30, completed: false },
];

export const sprintStartDate = shiftDate(-10);
export const todayKey = toLocalDateKey();
