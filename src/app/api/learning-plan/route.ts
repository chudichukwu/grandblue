import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseLearningRepository } from "@/lib/repositories/learning-plans";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const [plan, profileResult] = await Promise.all([
      new SupabaseLearningRepository(supabase, user.id).getDefaultPlan(),
      supabase.from("profiles").select("timezone,display_name").eq("user_id", user.id).single(),
    ]);
    if (profileResult.error) throw new Error(`Profile could not be loaded: ${profileResult.error.message}`);
    return NextResponse.json({ plan, profile: { timezone: profileResult.data.timezone, displayName: profileResult.data.display_name } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Learning plan could not be loaded.";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}
