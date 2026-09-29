"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { LearningPlan, LearningTaskInput, PlanWeek, Profile } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

type Context = { plan: LearningPlan | null; profile: Profile | null; loading: boolean; error: string | null; reload: () => Promise<void>; createTask: (input: LearningTaskInput) => Promise<boolean>; updateTask: (id: string, changes: Partial<LearningTaskInput>) => Promise<boolean>; deleteTask: (id: string) => Promise<boolean>; reorderTasks: (weekId: string, ids: string[]) => Promise<boolean>; updateWeek: (week: Omit<PlanWeek, "weekNumber" | "tasks">) => Promise<boolean> };
const LearningContext = createContext<Context | null>(null);
async function request(url: string, options?: RequestInit) { const response = await fetch(url, options); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Request failed."); return payload; }

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [plan, setPlan] = useState<LearningPlan | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => { try { const data = await request("/api/learning-plan", { cache: "no-store" }); setPlan(data.plan); setProfile(data.profile); setError(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Learning plan could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void reload(), 0); return () => clearTimeout(timer); }, [reload]);
  const mutate = useCallback(async (url: string, options: RequestInit, success: string) => { try { await request(url, options); await reload(); showToast(success, "Your changes are synced across devices."); return true; } catch (cause) { const message=cause instanceof Error ? cause.message : "Mutation failed.";setError(message);showToast("Update failed",message,"error");return false; } }, [reload,showToast]);
  const value = useMemo<Context>(() => ({ plan, profile, loading, error, reload,
    createTask: (input) => mutate("/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) }, "Task created"),
    updateTask: (id, changes) => mutate(`/api/tasks/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes) }, changes.completed===true?"Task completed":changes.completed===false?"Task reopened":"Task updated"),
    deleteTask: (id) => mutate(`/api/tasks/${id}`, { method: "DELETE" }, "Task deleted"),
    reorderTasks: (weekId, taskIds) => mutate("/api/tasks/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ weekId, taskIds }) }, "Task order updated"),
    updateWeek: (week) => mutate(`/api/plan-weeks/${week.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(week) }, "Week updated"),
  }), [plan, profile, loading, error, reload, mutate]);
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}
export function useLearning() { const context = useContext(LearningContext); if (!context) throw new Error("useLearning must be used within LearningProvider."); return context; }
