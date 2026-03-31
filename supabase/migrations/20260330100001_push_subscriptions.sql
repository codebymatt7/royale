-- Push notification subscriptions (Web Push API)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;
create policy "Users can manage own push subs" on public.push_subscriptions
  for all using (auth.uid() = owner_id);
