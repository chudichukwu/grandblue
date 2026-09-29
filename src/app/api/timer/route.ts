import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { SupabaseTimerRepository } from "@/lib/repositories/timer";
export async function GET(){ try { const {supabase,user}=await requireUser(); return NextResponse.json(await new SupabaseTimerRepository(supabase,user.id).snapshot()); } catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"Timer could not be loaded."},{status:500}); } }
