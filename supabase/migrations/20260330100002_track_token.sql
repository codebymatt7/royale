-- Switch from service role keys to simple track tokens
-- Each app gets a unique token that's used in the tracking snippet

-- Enable pgcrypto for gen_random_bytes
create extension if not exists pgcrypto with schema extensions;

-- Add track_token column
alter table public.apps add column if not exists track_token text unique default encode(extensions.gen_random_bytes(16), 'hex');

-- Remove the service role key columns (no longer needed)
alter table public.apps drop column if exists supabase_url;
alter table public.apps drop column if exists supabase_service_role_key;

-- Index for fast token lookups
create index if not exists idx_apps_track_token on public.apps(track_token);
