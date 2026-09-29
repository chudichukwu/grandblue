import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseTimerRepository } from "@/lib/repositories/timer";
import { notificationUpdateSchema } from "@/lib/validation/timer";
export async function PATCH(request:Request){try{const parsed=notificationUpdateSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid request."},{status:400});const {supabase,user}=await requireUser();await new SupabaseTimerRepository(supabase,user.id).markRead(parsed.data.all?undefined:parsed.data.id);return NextResponse.json({ok:true});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Notification could not be updated."},{status:500});}}
