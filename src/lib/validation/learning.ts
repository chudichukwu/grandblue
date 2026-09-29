import { z } from "zod";

export const taskCategorySchema = z.enum(["course", "practice", "project", "review"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const taskInputSchema = z.object({
  weekId: z.uuid(), title: z.string().trim().min(1).max(240), detail: z.string().max(10_000).default(""),
  scheduledDate: z.iso.date().nullable(), estimatedMinutes: z.number().int().min(0).max(10_080),
  actualMinutes: z.number().int().min(0).max(10_080), priority: taskPrioritySchema, category: taskCategorySchema,
  deadline: z.iso.datetime().nullable(), position: z.number().int().min(0), completed: z.boolean(), notes: z.string().max(10_000).default(""),
  clientRequestId: z.uuid(),
});
export const taskUpdateSchema = taskInputSchema.partial().omit({ clientRequestId: true }).extend({ id: z.uuid() });
export const reorderTasksSchema = z.object({ weekId: z.uuid(), taskIds: z.array(z.uuid()).min(1).max(200) });
export const weekUpdateSchema = z.object({ id: z.uuid(), title: z.string().trim().min(1).max(160), description: z.string().max(10_000), outcome: z.string().max(10_000), startsOn: z.iso.date().nullable(), endsOn: z.iso.date().nullable(), targetMinutes: z.number().int().min(1).max(100_800), notes: z.string().max(10_000) }).refine((value) => !value.startsOn || !value.endsOn || value.endsOn >= value.startsOn, { message: "Week end date must be on or after its start date." });
