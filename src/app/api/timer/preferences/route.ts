import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseTimerRepository } from "@/lib/repositories/timer";
import { timerPreferencesSchema } from "@/lib/validation/timer";
export async function PATCH(request:Request){ try {const parsed=timerPreferencesSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid preferences."},{status:400});const {supabase,user}=await requireUser();await new SupabaseTimerRepository(supabase,user.id).savePreferences(parsed.data);return NextResponse.json({ok:true});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Preferences could not be saved."},{status:500});} }
