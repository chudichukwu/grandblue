import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseDailyEntryRepository } from "@/lib/repositories/daily-entries";
import { localImportSchema } from "@/lib/validation/daily-entry";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase.from("profiles").select("local_data_imported_at").eq("user_id", user.id).single();
    if (error) throw new Error(`Import status could not be checked: ${error.message}`);
    return NextResponse.json({ imported: Boolean(data.local_data_imported_at) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import status could not be checked.";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = localImportSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Local data failed validation.", issues: parsed.error.issues }, { status: 400 });
    const { supabase, user } = await requireUser();
    const { data: profile, error: profileError } = await supabase.from("profiles").select("local_data_imported_at").eq("user_id", user.id).single();
    if (profileError) throw new Error(`Import status could not be checked: ${profileError.message}`);
    if (profile.local_data_imported_at) return NextResponse.json({ error: "Local data has already been imported for this account." }, { status: 409 });

    const repository = new SupabaseDailyEntryRepository(supabase, user.id);
    const failures: { id: string; date: string; error: string }[] = [];
    let importedCount = 0;
    for (const entry of parsed.data.entries) {
      const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = entry;
      void _createdAt; void _updatedAt;
      try { await repository.importOne(input, id); importedCount += 1; }
      catch (importError) { failures.push({ id, date: entry.date, error: importError instanceof Error ? importError.message : "Unknown import error." }); }
    }

    if (failures.length) return NextResponse.json({ importedCount, failedCount: failures.length, failures, complete: false }, { status: 207 });
    const { error: updateError } = await supabase.from("profiles").update({ local_data_imported_at: new Date().toISOString() }).eq("user_id", user.id);
    if (updateError) throw new Error(`Entries were imported, but completion could not be recorded: ${updateError.message}`);
    return NextResponse.json({ importedCount, failedCount: 0, failures: [], complete: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Local data could not be imported.";
    return NextResponse.json({ error: message === "UNAUTHENTICATED" ? "Sign in to continue." : message }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}
