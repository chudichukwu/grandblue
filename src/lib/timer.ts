import type { FocusSession, TimerMode, TimerStatus } from "@/lib/types";

export const TIMER_TRANSITIONS: Record<TimerStatus, TimerStatus[]> = {
  scheduled: ["active", "cancelled"], active: ["paused", "completed", "skipped", "cancelled"],
  paused: ["active", "completed", "skipped", "cancelled"], completed: [], skipped: [], cancelled: [],
};
export function canTransition(from: TimerStatus, to: TimerStatus) { return TIMER_TRANSITIONS[from].includes(to); }
export function remainingSeconds(session: FocusSession | null, now = Date.now()) {
  if (!session) return 0;
  if (session.status === "paused") return session.remainingSecondsWhenPaused ?? 0;
  if (session.status !== "active") return 0;
  return Math.max(0, Math.ceil((new Date(session.endsAt).getTime() - now) / 1000));
}
export function nextBreakMode(completedFocusSessions: number, longBreakAfter: number): TimerMode {
  return completedFocusSessions > 0 && completedFocusSessions % longBreakAfter === 0 ? "long_break" : "short_break";
}
export function formatClock(seconds: number) { const safe = Math.max(0, seconds); return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`; }
