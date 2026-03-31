-- Lean Royale schema: apps, user events, notifications
-- Run against YOUR Royale Supabase project (bdpwbwejeksezasxaylq)

-- Profiles (auto-created on auth signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Apps: each user connects one app
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  supabase_url text,
  supabase_service_role_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.apps enable row level security;
create policy "Owners can manage their app" on public.apps for all using (auth.uid() = owner_id);

-- User events: time-series snapshots of user counts
create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  total_users integer not null default 0,
  new_users integer not null default 0,
  captured_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.user_events enable row level security;
create policy "App owners can read events" on public.user_events for select
  using (app_id in (select id from public.apps where owner_id = auth.uid()));

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'new_user',
  title text not null,
  body text not null default '',
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can read own notifications" on public.notifications for select
  using (auth.uid() = owner_id);
create policy "Users can update own notifications" on public.notifications for update
  using (auth.uid() = owner_id);
