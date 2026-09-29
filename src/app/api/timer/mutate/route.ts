import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseTimerRepository } from "@/lib/repositories/timer";
import { timerMutationSchema } from "@/lib/validation/timer";
export async function POST(request:Request){ try { const parsed=timerMutationSchema.safeParse(await request.json()); if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid transition."},{status:400}); const {supabase,user}=await requireUser(); return NextResponse.json({session:await new SupabaseTimerRepository(supabase,user.id).mutate(parsed.data)}); }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Timer could not be updated."},{status:409});} }
