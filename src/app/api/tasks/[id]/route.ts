import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseLearningRepository } from "@/lib/repositories/learning-plans";
import { taskUpdateSchema } from "@/lib/validation/learning";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const parsed = taskUpdateSchema.safeParse({ ...(await request.json()), id });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid task update." }, { status: 400 });
    const { id: taskId, ...changes } = parsed.data;
    const { supabase, user } = await requireUser();
    const task = await new SupabaseLearningRepository(supabase, user.id).updateTask(taskId, changes);
    return NextResponse.json({ task });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Task could not be updated." }, { status: 500 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const { supabase, user } = await requireUser(); await new SupabaseLearningRepository(supabase, user.id).deleteTask(id); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Task could not be deleted." }, { status: 500 }); }
}
