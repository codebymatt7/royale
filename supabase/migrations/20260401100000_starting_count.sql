-- Add starting_users so users can set their existing user count
alter table public.apps add column if not exists starting_users integer not null default 0;

-- Reset test data
delete from public.user_events;
delete from public.notifications;
