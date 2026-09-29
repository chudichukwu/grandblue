import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected || request.headers.get("x-worker-secret") !== expected) return new Response("Unauthorized", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return Response.json({ error: "Worker environment is incomplete." }, { status: 500 });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: jobs, error: claimError } = await supabase.rpc("claim_due_notifications", { p_limit: 50 });
  if (claimError) return Response.json({ error: claimError.message }, { status: 500 });
  let delivered = 0; let failed = 0;
  for (const job of jobs ?? []) {
    const { error } = await supabase.rpc("process_timer_notification", { p_notification_id: job.id });
    if (!error) { delivered += 1; continue; }
    failed += 1;
    const retry = await supabase.rpc("fail_notification", { p_notification_id: job.id, p_error: error.message, p_max_attempts: 5 });
    if (retry.error) console.error("Could not record notification failure", job.id, retry.error.message);
  }
  return Response.json({ claimed: jobs?.length ?? 0, delivered, failed });
});
