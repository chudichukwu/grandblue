import { z } from "zod";

export const dailyEntryInputSchema = z.object({
  date: z.iso.date(),
  courseraMinutes: z.coerce.number().int().min(0).max(1440),
  practiceMinutes: z.coerce.number().int().min(0).max(1440),
  projectMinutes: z.coerce.number().int().min(0).max(1440),
  reviewMinutes: z.coerce.number().int().min(0).max(1440),
  modulesCompleted: z.coerce.number().int().min(0).max(1000),
  energyScore: z.coerce.number().int().min(1).max(5),
  focusScore: z.coerce.number().int().min(1).max(5),
  completedTasks: z.string().max(10_000).default(""),
  blockers: z.string().max(10_000).default(""),
  reflection: z.string().max(20_000).default(""),
}).refine((entry) => entry.courseraMinutes + entry.practiceMinutes + entry.projectMinutes + entry.reviewMinutes > 0, { message: "At least one minute of study time is required." });

export const localEntrySchema = dailyEntryInputSchema.extend({
  id: z.string().min(1).max(200),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const localImportSchema = z.object({ entries: z.array(localEntrySchema).max(500) });

export type ValidatedDailyEntryInput = z.infer<typeof dailyEntryInputSchema>;
