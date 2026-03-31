-- Add profile fields to apps table
alter table public.apps add column if not exists logo_url text;
alter table public.apps add column if not exists bio text;
alter table public.apps add column if not exists instagram text;
alter table public.apps add column if not exists tiktok text;
alter table public.apps add column if not exists x_handle text;
