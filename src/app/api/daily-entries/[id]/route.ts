import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { SupabaseDailyEntryRepository } from "@/lib/repositories/daily-entries";

export async function DELETE(_request: Request, context: RouteContext<"/api/daily-entries/[id]">) {
  try {
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid entry ID." }, { status: 400 });
    const { supabase, user } = await requireUser();
    await new SupabaseDailyEntryRepository(supabase, user.id).delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily entry could not be deleted.";
    return NextResponse.json({ error: message === "UNAUTHENTICATED" ? "Sign in to continue." : message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}
