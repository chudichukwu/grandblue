import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseLearningRepository } from "@/lib/repositories/learning-plans";
import { weekUpdateSchema } from "@/lib/validation/learning";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const parsed = weekUpdateSchema.safeParse({ ...(await request.json()), id }); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid week." }, { status: 400 }); const { supabase, user } = await requireUser(); await new SupabaseLearningRepository(supabase, user.id).updateWeek(parsed.data); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Week could not be updated." }, { status: 500 }); }
}
