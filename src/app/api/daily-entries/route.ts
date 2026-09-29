import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseDailyEntryRepository } from "@/lib/repositories/daily-entries";
import { dailyEntryInputSchema } from "@/lib/validation/daily-entry";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const entries = await new SupabaseDailyEntryRepository(supabase, user.id).list();
    return NextResponse.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily entries could not be loaded.";
    return NextResponse.json({ error: message === "UNAUTHENTICATED" ? "Sign in to continue." : message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = dailyEntryInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid daily entry." }, { status: 400 });
    const { supabase, user } = await requireUser();
    const entry = await new SupabaseDailyEntryRepository(supabase, user.id).save(parsed.data);
    return NextResponse.json({ entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily entry could not be saved.";
    return NextResponse.json({ error: message === "UNAUTHENTICATED" ? "Sign in to continue." : message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}
