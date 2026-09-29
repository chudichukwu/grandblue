create extension if not exists pgcrypto with schema extensions;

create type public.focus_session_status as enum ('active', 'paused', 'completed', 'cancelled');
create type public.notification_status as enum ('pending', 'processing', 'delivered', 'failed', 'cancelled');
create type public.notification_channel as enum ('browser_push', 'telegram', 'email', 'in_app');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  timezone text not null check (char_length(timezone) between 1 and 64),
  local_data_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  coursera_minutes integer not null default 0 check (coursera_minutes between 0 and 1440),
  practice_minutes integer not null default 0 check (practice_minutes between 0 and 1440),
  project_minutes integer not null default 0 check (project_minutes between 0 and 1440),
  review_minutes integer not null default 0 check (review_minutes between 0 and 1440),
  modules_completed integer not null default 0 check (modules_completed >= 0),
  energy_score smallint not null check (energy_score between 1 and 5),
  focus_score smallint not null check (focus_score between 1 and 5),
  completed_tasks text not null default '',
  blockers text not null default '',
  reflection text not null default '',
  import_source text check (import_source is null or import_source in ('local_storage_v1')),
  imported_source_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  weekly_target_minutes integer not null default 1800 check (weekly_target_minutes > 0),
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.plan_weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_plan_id uuid not null,
  week_number smallint not null check (week_number > 0),
  title text not null check (char_length(title) between 1 and 160),
  outcome text not null default '',
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learning_plan_id, week_number),
  unique (id, user_id),
  foreign key (learning_plan_id, user_id) references public.learning_plans(id, user_id) on delete cascade
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_week_id uuid not null,
  title text not null check (char_length(title) between 1 and 240),
  detail text not null default '',
  position integer not null default 0 check (position >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (plan_week_id, user_id) references public.plan_weeks(id, user_id) on delete cascade
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null check (session_type in ('focus', 'short_break', 'long_break')),
  status public.focus_session_status not null default 'active',
  planned_duration_seconds integer not null check (planned_duration_seconds > 0),
  started_at timestamptz not null,
  ends_at timestamptz not null check (ends_at >= started_at),
  paused_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sound_enabled boolean not null default true,
  browser_push_enabled boolean not null default false,
  telegram_enabled boolean not null default false,
  break_alerts_enabled boolean not null default true,
  focus_minutes integer not null default 25 check (focus_minutes between 1 and 180),
  short_break_minutes integer not null default 5 check (short_break_minutes between 1 and 60),
  long_break_minutes integer not null default 15 check (long_break_minutes between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_secret text not null,
  user_agent text,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table public.telegram_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  telegram_chat_id text not null,
  telegram_username text,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (telegram_chat_id)
);

create table public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  focus_session_id uuid,
  channel public.notification_channel not null,
  status public.notification_status not null default 'pending',
  scheduled_for timestamptz not null,
  claimed_at timestamptz,
  delivered_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  idempotency_key text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  unique (id, user_id),
  foreign key (focus_session_id, user_id) references public.focus_sessions(id, user_id) on delete cascade
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_notification_id uuid not null,
  channel public.notification_channel not null,
  attempt_number integer not null check (attempt_number > 0),
  status public.notification_status not null,
  provider_message_id text,
  provider_result jsonb not null default '{}'::jsonb,
  error_message text,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (scheduled_notification_id, attempt_number),
  foreign key (scheduled_notification_id, user_id) references public.scheduled_notifications(id, user_id) on delete cascade
);

create index daily_entries_user_date_idx on public.daily_entries(user_id, entry_date desc);
create unique index daily_entries_import_source_idx on public.daily_entries(user_id, import_source, imported_source_id) where import_source is not null and imported_source_id is not null;
create index learning_plans_user_status_idx on public.learning_plans(user_id, status);
create index plan_weeks_user_plan_idx on public.plan_weeks(user_id, learning_plan_id, week_number);
create index tasks_user_week_idx on public.tasks(user_id, plan_week_id, position);
create index focus_sessions_user_started_idx on public.focus_sessions(user_id, started_at desc);
create index focus_sessions_active_idx on public.focus_sessions(user_id, status) where status in ('active', 'paused');
create index push_subscriptions_user_active_idx on public.push_subscriptions(user_id) where revoked_at is null;
create index scheduled_notifications_due_idx on public.scheduled_notifications(status, scheduled_for) where status = 'pending';
create index scheduled_notifications_user_idx on public.scheduled_notifications(user_id, scheduled_for desc);
create index notification_deliveries_user_notification_idx on public.notification_deliveries(user_id, scheduled_notification_id, attempt_number);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, display_name, timezone)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''), coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'Africa/Lagos'));
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger daily_entries_updated_at before update on public.daily_entries for each row execute procedure public.set_updated_at();
create trigger learning_plans_updated_at before update on public.learning_plans for each row execute procedure public.set_updated_at();
create trigger plan_weeks_updated_at before update on public.plan_weeks for each row execute procedure public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute procedure public.set_updated_at();
create trigger focus_sessions_updated_at before update on public.focus_sessions for each row execute procedure public.set_updated_at();
create trigger notification_preferences_updated_at before update on public.notification_preferences for each row execute procedure public.set_updated_at();
create trigger push_subscriptions_updated_at before update on public.push_subscriptions for each row execute procedure public.set_updated_at();
create trigger telegram_connections_updated_at before update on public.telegram_connections for each row execute procedure public.set_updated_at();
create trigger scheduled_notifications_updated_at before update on public.scheduled_notifications for each row execute procedure public.set_updated_at();

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','daily_entries','learning_plans','plan_weeks','tasks','focus_sessions','notification_preferences','push_subscriptions','telegram_connections','scheduled_notifications','notification_deliveries'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('create policy "Users select own rows" on public.%I for select to authenticated using ((select auth.uid()) is not null and (select auth.uid()) = user_id)', table_name);
    execute format('create policy "Users insert own rows" on public.%I for insert to authenticated with check ((select auth.uid()) is not null and (select auth.uid()) = user_id)', table_name);
    execute format('create policy "Users update own rows" on public.%I for update to authenticated using ((select auth.uid()) is not null and (select auth.uid()) = user_id) with check ((select auth.uid()) is not null and (select auth.uid()) = user_id)', table_name);
    execute format('create policy "Users delete own rows" on public.%I for delete to authenticated using ((select auth.uid()) is not null and (select auth.uid()) = user_id)', table_name);
  end loop;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
