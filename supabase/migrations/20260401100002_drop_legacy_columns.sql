-- Drop legacy columns that stored user credentials (no longer used)
alter table public.apps drop column if exists supabase_url;
alter table public.apps drop column if exists supabase_service_role_key;
