import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseLearningRepository } from "@/lib/repositories/learning-plans";
import { taskInputSchema } from "@/lib/validation/learning";

export async function POST(request: Request) {
  try {
    const parsed = taskInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid task." }, { status: 400 });
    const { supabase, user } = await requireUser();
    const task = await new SupabaseLearningRepository(supabase, user.id).saveTask(parsed.data);
    return NextResponse.json({ task });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Task could not be created." }, { status: 500 }); }
}
