"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(8).max(128) });
const safeMessage = (value: string) => encodeURIComponent(value);

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/auth/sign-in?error=${safeMessage("Enter a valid email and a password of at least 8 characters.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/auth/sign-in?error=${safeMessage(error.message)}`);
  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.extend({ displayName: z.string().trim().min(1).max(80), timezone: z.string().min(1).max(64) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/auth/sign-up?error=${safeMessage("Complete every field and use a password of at least 8 characters.")}`);
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { display_name: parsed.data.displayName, timezone: parsed.data.timezone } } });
  if (error) redirect(`/auth/sign-up?error=${safeMessage(error.message)}`);
  redirect(`/auth/sign-in?message=${safeMessage("Check your email to verify your account before signing in.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = z.object({ email: z.email() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/auth/forgot-password?error=${safeMessage("Enter a valid email address.")}`);
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${origin}/auth/callback?next=/auth/update-password` });
  if (error) redirect(`/auth/forgot-password?error=${safeMessage(error.message)}`);
  redirect(`/auth/forgot-password?message=${safeMessage("If that account exists, a password-reset link has been sent.")}`);
}

export async function updatePassword(formData: FormData) {
  const parsed = z.object({ password: z.string().min(8).max(128) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/auth/update-password?error=${safeMessage("Use a password of at least 8 characters.")}`);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/auth/sign-in?error=${safeMessage("Your reset session expired. Request a new link.")}`);
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect(`/auth/update-password?error=${safeMessage(error.message)}`);
  redirect(`/?message=${safeMessage("Password updated.")}`);
}
