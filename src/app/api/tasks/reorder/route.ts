import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseLearningRepository } from "@/lib/repositories/learning-plans";
import { reorderTasksSchema } from "@/lib/validation/learning";

export async function POST(request: Request) {
  try { const parsed = reorderTasksSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid reorder request." }, { status: 400 }); const { supabase, user } = await requireUser(); await new SupabaseLearningRepository(supabase, user.id).reorderTasks(parsed.data.weekId, parsed.data.taskIds); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Tasks could not be reordered." }, { status: 500 }); }
}
