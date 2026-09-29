begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

select has_table('public', 'profiles');
select has_table('public', 'daily_entries');
select has_table('public', 'learning_plans');
select has_table('public', 'plan_weeks');
select has_table('public', 'tasks');
select has_table('public', 'focus_sessions');
select has_table('public', 'notification_preferences');
select has_table('public', 'push_subscriptions');
select has_table('public', 'telegram_connections');
select has_table('public', 'scheduled_notifications');
select has_table('public', 'notification_deliveries');

select ok(relrowsecurity, relname || ' has RLS enabled') from pg_class where relnamespace = 'public'::regnamespace and relname in ('profiles','daily_entries','learning_plans','plan_weeks','tasks','focus_sessions','notification_preferences','push_subscriptions','telegram_connections','scheduled_notifications','notification_deliveries') order by relname;

select is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename in ('profiles','daily_entries','learning_plans','plan_weeks','tasks','focus_sessions','notification_preferences','push_subscriptions','telegram_connections','scheduled_notifications','notification_deliveries')), 44, 'all user-owned tables have four explicit policies');

select * from finish();
rollback;
