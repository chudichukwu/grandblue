import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseTimerRepository } from "@/lib/repositories/timer";
import { timerStartSchema } from "@/lib/validation/timer";
export async function POST(request:Request){ try { const parsed=timerStartSchema.safeParse(await request.json()); if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid timer."},{status:400}); const {supabase,user}=await requireUser(); return NextResponse.json({session:await new SupabaseTimerRepository(supabase,user.id).start(parsed.data)}); }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Timer could not start."},{status:500});} }
