create or replace function public.process_timer_notification(p_notification_id uuid)
returns void language plpgsql security definer set search_path='' as $$ declare n public.scheduled_notifications; s public.focus_sessions; begin
 select * into n from public.scheduled_notifications where id=p_notification_id; if not found or n.status in ('delivered','cancelled') then return; end if;
 select * into s from public.focus_sessions where id=n.focus_session_id for update;
 if s.status='active' and s.ends_at<=now() then update public.focus_sessions set status='completed',completed_at=s.ends_at,actual_focus_seconds=case when session_type='focus' then duration_seconds else 0 end,version=version+1 where id=s.id returning * into s;
   if s.session_type='focus' and s.task_id is not null then update public.tasks set actual_minutes=actual_minutes+ceil(s.actual_focus_seconds/60.0)::integer where id=s.task_id and user_id=s.user_id; end if;
   if exists(select 1 from public.notification_preferences p where p.user_id=s.user_id and p.in_app_alerts_enabled and (s.session_type='focus' or p.break_alerts_enabled)) then
     insert into public.in_app_notifications(user_id,focus_session_id,task_id,kind,title,body,href) values(s.user_id,s.id,s.task_id,case when s.session_type='focus' then 'timer_completed' else 'break_completed' end,case when s.session_type='focus' then 'Focus session complete' else 'Break complete' end,'Your timer reached zero.','/timer');
   end if;
 end if;
 update public.scheduled_notifications set status='delivered',delivered_at=now(),last_error=null where id=n.id and status='processing';
 if found then insert into public.notification_deliveries(user_id,scheduled_notification_id,channel,attempt_number,status,provider_result) values(n.user_id,n.id,n.channel,n.attempt_count,'delivered',jsonb_build_object('processed_at',now())) on conflict(scheduled_notification_id,attempt_number) do nothing; end if;
end $$;
revoke execute on function public.process_timer_notification(uuid) from public,anon,authenticated;
grant execute on function public.process_timer_notification(uuid) to service_role;
