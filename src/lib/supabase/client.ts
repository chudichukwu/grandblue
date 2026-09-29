import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/database.types";

export function createClient() {
  const env = getSupabaseEnv();
  return createBrowserClient<Database>(env.url, env.publishableKey);
}
