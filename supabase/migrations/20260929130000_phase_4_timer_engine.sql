alter type public.focus_session_status rename to focus_session_status_old;
create type public.focus_session_status as enum ('scheduled','active','paused','completed','skipped','cancelled');
drop index public.focus_sessions_active_idx;
alter table public.focus_sessions alter column status drop default;
alter table public.focus_sessions alter column status type public.focus_session_status using status::text::public.focus_session_status;
alter table public.focus_sessions alter column status set default 'active';
drop type public.focus_session_status_old;

alter table public.notification_preferences
  alter column focus_minutes set default 50,
  alter column short_break_minutes set default 10,
  alter column long_break_minutes set default 30,
  add column long_break_after_sessions integer not null default 4 check (long_break_after_sessions between 1 and 12),
  add column auto_start_break boolean not null default false,
  add column auto_start_focus boolean not null default false,
  add column in_app_alerts_enabled boolean not null default true;
update public.notification_preferences set focus_minutes=50,short_break_minutes=10,long_break_minutes=30 where focus_minutes=25 and short_break_minutes=5 and long_break_minutes=15;

alter table public.focus_sessions
  rename column planned_duration_seconds to duration_seconds;
create unique index tasks_id_user_idx on public.tasks(id,user_id);
alter table public.focus_sessions
  add column task_id uuid,
  add column accumulated_pause_seconds integer not null default 0 check (accumulated_pause_seconds >= 0),
  add column remaining_seconds_when_paused integer check (remaining_seconds_when_paused is null or remaining_seconds_when_paused >= 0),
  add column actual_focus_seconds integer not null default 0 check (actual_focus_seconds >= 0),
  add column version integer not null default 1 check (version > 0),
  add column start_request_id uuid not null default gen_random_uuid(),
  add column skipped_at timestamptz,
  add constraint focus_sessions_task_owner_fk foreign key (task_id,user_id) references public.tasks(id,user_id) on delete set null (task_id),
  add constraint focus_sessions_state_timestamps check (
    (status='paused' and paused_at is not null and remaining_seconds_when_paused is not null)
    or (status<>'paused')
  );
create unique index focus_sessions_one_running_idx on public.focus_sessions(user_id) where status in ('active','paused');
create index focus_sessions_active_idx on public.focus_sessions(user_id,status) where status in ('active','paused');
create unique index focus_sessions_start_request_idx on public.focus_sessions(user_id,start_request_id);

create table public.in_app_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  focus_session_id uuid, task_id uuid, kind text not null check(kind in ('timer_completed','break_completed','session_skipped','sync_failed')),
  title text not null check(char_length(title) between 1 and 160), body text not null default '', href text,
  read_at timestamptz, created_at timestamptz not null default now(),
  unique(id,user_id), foreign key(focus_session_id,user_id) references public.focus_sessions(id,user_id) on delete cascade,
  foreign key(task_id,user_id) references public.tasks(id,user_id) on delete set null (task_id)
);
create index in_app_notifications_user_unread_idx on public.in_app_notifications(user_id,created_at desc) where read_at is null;
alter table public.in_app_notifications enable row level security;
alter table public.in_app_notifications force row level security;
revoke all on public.in_app_notifications from anon;
grant select,insert,update,delete on public.in_app_notifications to authenticated;
create policy "Users select own rows" on public.in_app_notifications for select to authenticated using ((select auth.uid())=user_id);
create policy "Users insert own rows" on public.in_app_notifications for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Users update own rows" on public.in_app_notifications for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Users delete own rows" on public.in_app_notifications for delete to authenticated using ((select auth.uid())=user_id);

create or replace function public.timer_start(p_session_type text,p_duration_seconds integer,p_task_id uuid,p_request_id uuid)
returns public.focus_sessions language plpgsql security invoker set search_path='' as $$
declare s public.focus_sessions; owner uuid:=auth.uid(); begin
 if owner is null or p_duration_seconds not between 60 and 21600 or p_session_type not in ('focus','short_break','long_break') then raise exception 'Invalid timer request'; end if;
 select * into s from public.focus_sessions where user_id=owner and start_request_id=p_request_id; if found then return s; end if;
 if exists(select 1 from public.focus_sessions where user_id=owner and status in ('active','paused')) then raise exception 'A timer is already running'; end if;
 insert into public.focus_sessions(user_id,session_type,status,duration_seconds,started_at,ends_at,task_id,start_request_id)
 values(owner,p_session_type,'active',p_duration_seconds,now(),now()+make_interval(secs=>p_duration_seconds),p_task_id,p_request_id) returning * into s;
 insert into public.scheduled_notifications(user_id,focus_session_id,channel,status,scheduled_for,idempotency_key,payload)
 values(owner,s.id,'in_app','pending',s.ends_at,'timer:'||s.id,jsonb_build_object('session_id',s.id)) on conflict(user_id,idempotency_key) do update set status='pending',scheduled_for=excluded.scheduled_for,claimed_at=null,last_error=null;
 return s; end $$;

create or replace function public.timer_pause(p_session_id uuid,p_expected_version integer)
returns public.focus_sessions language plpgsql security invoker set search_path='' as $$ declare s public.focus_sessions; begin
 select * into s from public.focus_sessions where id=p_session_id and user_id=auth.uid() for update;
 if not found then raise exception 'Session not found'; end if; if s.status='paused' then return s; end if; if s.status<>'active' or s.version<>p_expected_version then raise exception 'Stale or invalid transition'; end if;
 update public.focus_sessions set status='paused',paused_at=now(),remaining_seconds_when_paused=greatest(0,ceil(extract(epoch from ends_at-now()))::integer),version=version+1 where id=s.id returning * into s;
 update public.scheduled_notifications set status='cancelled',updated_at=now() where user_id=s.user_id and idempotency_key='timer:'||s.id and status in ('pending','processing'); return s; end $$;

create or replace function public.timer_resume(p_session_id uuid,p_expected_version integer)
returns public.focus_sessions language plpgsql security invoker set search_path='' as $$ declare s public.focus_sessions; begin
 select * into s from public.focus_sessions where id=p_session_id and user_id=auth.uid() for update;
 if not found then raise exception 'Session not found'; end if; if s.status='active' then return s; end if; if s.status<>'paused' or s.version<>p_expected_version then raise exception 'Stale or invalid transition'; end if;
 update public.focus_sessions set status='active',ends_at=now()+make_interval(secs=>remaining_seconds_when_paused),accumulated_pause_seconds=accumulated_pause_seconds+greatest(0,floor(extract(epoch from now()-paused_at))::integer),paused_at=null,remaining_seconds_when_paused=null,version=version+1 where id=s.id returning * into s;
 insert into public.scheduled_notifications(user_id,focus_session_id,channel,status,scheduled_for,idempotency_key,payload) values(s.user_id,s.id,'in_app','pending',s.ends_at,'timer:'||s.id,jsonb_build_object('session_id',s.id)) on conflict(user_id,idempotency_key) do update set status='pending',scheduled_for=excluded.scheduled_for,claimed_at=null,last_error=null,attempt_count=0; return s; end $$;

create or replace function public.timer_finish(p_session_id uuid,p_expected_version integer,p_action text)
returns public.focus_sessions language plpgsql security invoker set search_path='' as $$ declare s public.focus_sessions; secs integer; target public.focus_session_status; begin
 select * into s from public.focus_sessions where id=p_session_id and user_id=auth.uid() for update; if not found then raise exception 'Session not found'; end if;
 target:=case p_action when 'complete' then 'completed'::public.focus_session_status when 'skip' then 'skipped'::public.focus_session_status when 'cancel' then 'cancelled'::public.focus_session_status else null end;
 if target is null then raise exception 'Invalid action'; end if; if s.status=target then return s; end if; if s.status not in ('active','paused') or s.version<>p_expected_version then raise exception 'Stale or invalid transition'; end if;
 secs:=least(s.duration_seconds,greatest(0,case when s.status='paused' then s.duration_seconds-s.remaining_seconds_when_paused else floor(extract(epoch from now()-s.started_at))::integer-s.accumulated_pause_seconds end));
 update public.focus_sessions set status=target,completed_at=case when target='completed' then now() else null end,skipped_at=case when target='skipped' then now() else null end,cancelled_at=case when target='cancelled' then now() else null end,actual_focus_seconds=case when session_type='focus' and target='completed' then secs else 0 end,version=version+1 where id=s.id returning * into s;
 update public.scheduled_notifications set status='cancelled',updated_at=now() where user_id=s.user_id and idempotency_key='timer:'||s.id and status in ('pending','processing');
 if target='completed' and s.session_type='focus' and s.task_id is not null then update public.tasks set actual_minutes=actual_minutes+ceil(s.actual_focus_seconds/60.0)::integer where id=s.task_id and user_id=s.user_id; end if;
 if target='skipped' then insert into public.in_app_notifications(user_id,focus_session_id,task_id,kind,title,body,href) values(s.user_id,s.id,s.task_id,'session_skipped','Session skipped','The current session was skipped.','/timer'); end if; return s; end $$;

create or replace function public.claim_due_notifications(p_limit integer default 25)
returns setof public.scheduled_notifications language plpgsql security definer set search_path='' as $$ begin return query with due as (select id from public.scheduled_notifications where (status='pending' and scheduled_for<=now()) or (status='processing' and claimed_at<now()-interval '5 minutes') order by scheduled_for for update skip locked limit least(p_limit,100)) update public.scheduled_notifications n set status='processing',claimed_at=now(),attempt_count=attempt_count+1 from due where n.id=due.id returning n.*; end $$;

create or replace function public.process_timer_notification(p_notification_id uuid)
returns void language plpgsql security definer set search_path='' as $$ declare n public.scheduled_notifications; s public.focus_sessions; begin
 select * into n from public.scheduled_notifications where id=p_notification_id for update; if not found or n.status='delivered' then return; end if;
 select * into s from public.focus_sessions where id=n.focus_session_id for update;
 if s.status='active' and s.ends_at<=now() then update public.focus_sessions set status='completed',completed_at=s.ends_at,actual_focus_seconds=case when session_type='focus' then duration_seconds else 0 end,version=version+1 where id=s.id returning * into s;
   if s.session_type='focus' and s.task_id is not null then update public.tasks set actual_minutes=actual_minutes+ceil(s.actual_focus_seconds/60.0)::integer where id=s.task_id and user_id=s.user_id; end if;
   if exists(select 1 from public.notification_preferences p where p.user_id=s.user_id and p.in_app_alerts_enabled and (s.session_type='focus' or p.break_alerts_enabled)) then
     insert into public.in_app_notifications(user_id,focus_session_id,task_id,kind,title,body,href) values(s.user_id,s.id,s.task_id,case when s.session_type='focus' then 'timer_completed' else 'break_completed' end,case when s.session_type='focus' then 'Focus session complete' else 'Break complete' end,'Your timer reached zero.','/timer');
   end if;
 end if;
 update public.scheduled_notifications set status='delivered',delivered_at=now(),last_error=null where id=n.id;
 insert into public.notification_deliveries(user_id,scheduled_notification_id,channel,attempt_number,status,provider_result) values(n.user_id,n.id,n.channel,n.attempt_count,'delivered',jsonb_build_object('processed_at',now())) on conflict(scheduled_notification_id,attempt_number) do nothing;
end $$;

create or replace function public.fail_notification(p_notification_id uuid,p_error text,p_max_attempts integer default 5)
returns void language plpgsql security definer set search_path='' as $$ declare n public.scheduled_notifications; final_status public.notification_status; begin
 select * into n from public.scheduled_notifications where id=p_notification_id for update; if not found or n.status='delivered' then return; end if;
 final_status:=case when n.attempt_count>=p_max_attempts then 'failed'::public.notification_status else 'pending'::public.notification_status end;
 update public.scheduled_notifications set status=final_status,claimed_at=null,last_error=left(p_error,1000),scheduled_for=case when final_status='pending' then now()+make_interval(secs=>least(3600,power(2,greatest(1,n.attempt_count))::integer*30)) else scheduled_for end where id=n.id;
 insert into public.notification_deliveries(user_id,scheduled_notification_id,channel,attempt_number,status,error_message,provider_result) values(n.user_id,n.id,n.channel,n.attempt_count,'failed',left(p_error,1000),jsonb_build_object('retry_scheduled',final_status='pending')) on conflict(scheduled_notification_id,attempt_number) do nothing;
end $$;

revoke execute on function public.claim_due_notifications(integer),public.process_timer_notification(uuid),public.fail_notification(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.claim_due_notifications(integer),public.process_timer_notification(uuid),public.fail_notification(uuid,text,integer) to service_role;
grant execute on function public.timer_start(text,integer,uuid,uuid),public.timer_pause(uuid,integer),public.timer_resume(uuid,integer),public.timer_finish(uuid,integer,text) to authenticated;
revoke execute on function public.timer_start(text,integer,uuid,uuid),public.timer_pause(uuid,integer),public.timer_resume(uuid,integer),public.timer_finish(uuid,integer,text) from anon;
