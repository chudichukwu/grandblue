-- Run after deploying process-notifications and setting its CRON_SECRET.
-- Replace both placeholders locally before running. Never commit their values.
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
select vault.create_secret('YOUR_RANDOM_CRON_SECRET', 'timer_cron_secret');
select cron.schedule(
  'grand-blue-notification-worker', '* * * * *',
  $$select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='project_url') || '/functions/v1/process-notifications',
    headers := jsonb_build_object('Content-Type','application/json','x-worker-secret',(select decrypted_secret from vault.decrypted_secrets where name='timer_cron_secret')),
    body := '{}'::jsonb
  );$$
);
