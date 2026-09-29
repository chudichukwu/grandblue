alter table public.learning_plans
  add column is_default boolean not null default false,
  add column notes text not null default '';

create unique index learning_plans_one_default_per_user_idx on public.learning_plans(user_id) where is_default;

alter table public.plan_weeks
  add column description text not null default '',
  add column target_minutes integer not null default 1800 check (target_minutes > 0),
  add column notes text not null default '';

alter table public.tasks
  add column scheduled_date date,
  add column estimated_minutes integer not null default 60 check (estimated_minutes between 0 and 10080),
  add column actual_minutes integer not null default 0 check (actual_minutes between 0 and 10080),
  add column priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  add column category text not null default 'course' check (category in ('course', 'practice', 'project', 'review')),
  add column deadline timestamptz,
  add column notes text not null default '',
  add column client_request_id uuid not null default gen_random_uuid();

create unique index tasks_user_request_id_idx on public.tasks(user_id, client_request_id);
create index tasks_user_scheduled_idx on public.tasks(user_id, scheduled_date, completed_at);
create index tasks_user_deadline_idx on public.tasks(user_id, deadline) where completed_at is null;

create or replace function public.ensure_default_learning_plan()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  plan_id uuid;
  local_today date;
  week_start date;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  select (now() at time zone p.timezone)::date into local_today from public.profiles p where p.user_id = owner_id;
  if local_today is null then raise exception 'Profile required'; end if;
  week_start := local_today - (extract(isodow from local_today)::integer - 1);

  select id into plan_id from public.learning_plans where user_id = owner_id and is_default;
  if plan_id is null then
    insert into public.learning_plans (user_id, title, description, starts_on, ends_on, weekly_target_minutes, status, is_default)
    values (owner_id, 'Six-week data analysis sprint', 'An intensive path from analytics foundations to an independent portfolio project.', week_start, week_start + 41, 1800, 'active', true)
    returning id into plan_id;
  end if;

  insert into public.plan_weeks (user_id, learning_plan_id, week_number, title, description, outcome, starts_on, ends_on, target_minutes)
  values
    (owner_id, plan_id, 1, 'Analytics foundations and spreadsheets', 'Build the core analysis workflow and spreadsheet fluency.', 'Complete a documented spreadsheet analysis.', week_start, week_start + 6, 1800),
    (owner_id, plan_id, 2, 'SQL', 'Learn to query, join and summarize realistic datasets.', 'Answer business questions with saved, explained queries.', week_start + 7, week_start + 13, 1800),
    (owner_id, plan_id, 3, 'Tableau and data storytelling', 'Turn analysis into clear visual communication.', 'Publish a focused one-page data story.', week_start + 14, week_start + 20, 1800),
    (owner_id, plan_id, 4, 'Python, Pandas and basic statistics', 'Create reproducible cleaning and exploration workflows.', 'Complete a documented exploratory notebook.', week_start + 21, week_start + 27, 1800),
    (owner_id, plan_id, 5, 'Google certificate case study', 'Apply the full analysis process to the certificate case study.', 'Produce a review-ready case-study presentation.', week_start + 28, week_start + 34, 1800),
    (owner_id, plan_id, 6, 'Independent project and career preparation', 'Ship original portfolio evidence and prepare to discuss it.', 'Publish the project and complete career materials.', week_start + 35, week_start + 41, 1800)
  on conflict (learning_plan_id, week_number) do nothing;
  return plan_id;
end;
$$;

grant execute on function public.ensure_default_learning_plan() to authenticated;
revoke execute on function public.ensure_default_learning_plan() from anon;
