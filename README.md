# Grand Blue

Grand Blue is a dark-first accountability app for a six-week data-analysis sprint. Supabase Auth and Postgres provide cross-device check-ins, learning plans, tasks, and history through cookie-based App Router sessions, server-validated mutations, and Row-Level Security.

## Architecture

- `src/app`: Next.js App Router pages, auth actions, callback handler, and authenticated API routes.
- `src/components`: the existing application shell and dashboard components plus the one-time local import prompt.
- `src/lib/repositories`: repository interfaces and Supabase-backed data access. Every server repository is scoped to a verified user ID.
- `src/lib/supabase`: browser, server, and proxy clients using `@supabase/ssr`.
- `src/lib/validation`: Zod schemas shared by server mutations and local-data migration.
- `supabase/migrations`: reproducible Postgres schema, constraints, indexes, triggers, grants, and RLS policies.
- `supabase/tests`: database policy checks for the local Supabase test runner.

Phase 4 adds the production timer state machine, focus analytics, cross-tab synchronization, persistent in-app alerts, and a database-backed notification worker. Timer state uses database timestamps and versioned transitions; the browser countdown is only a view of that server state.

Phase 1 stored `DailyEntry` records in `localStorage` under `grand-blue.progress.v1`. Phase 2 makes Postgres the source of truth. After sign-in, valid Phase 1 data is offered for one-time import and is retained locally unless the entire import succeeds. localStorage is otherwise limited to the visual theme and temporary migration input.

## Local setup

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Install or invoke the Supabase CLI and start the local stack:

   ```bash
   npx supabase start
   npx supabase db reset
   ```

   `db reset` recreates the local database and applies every file in `supabase/migrations`.

3. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

4. Copy the local API URL and publishable/anon key printed by `npx supabase status` into `.env.local`:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
   ```

5. Start the application:

   ```bash
   npm run dev -- --port 3100
   ```

   Port 3100 is already configured in `supabase/config.toml`.

## Hosted Supabase setup

Create a Supabase project, then link and deploy the version-controlled migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

In Supabase Authentication URL Configuration, set the production Site URL and allow these redirect URLs:

- `https://YOUR_DOMAIN/auth/callback`
- `https://YOUR_DOMAIN/auth/update-password`
- local equivalents used during development

Email confirmations are enabled in `supabase/config.toml` for local development. Confirm that email confirmation is enabled for the hosted project and customize the hosted email templates as needed.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the deployment platform. Do not add a service-role key, Telegram bot token, VAPID private key, or cron secret to any `NEXT_PUBLIC_` variable.

## Timer worker setup

1. Run `npx supabase db push`, then `npm run types:db`.
2. Set a long random worker secret with `npx supabase secrets set CRON_SECRET=YOUR_RANDOM_SECRET`.
3. Deploy with `npx supabase functions deploy process-notifications --no-verify-jwt`.
4. Replace the placeholders in `supabase/cron/setup.sql` locally and run it once in the Supabase SQL Editor. It stores values in Vault and invokes the worker every minute.

The worker uses row locks with `SKIP LOCKED`, stable idempotency keys, stale-claim recovery, and at most five delivery attempts with exponential backoff. Supabase supplies its service-role key in the Edge Function environment; it must never be copied into the frontend.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run types:db
npx supabase test db
```

The final database command requires Docker and a running local Supabase stack.
