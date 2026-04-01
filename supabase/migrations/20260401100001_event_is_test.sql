-- Flag test events so they don't affect real count
alter table public.user_events add column if not exists is_test boolean not null default false;

-- Drop the total_users column — we now compute it from starting_users + count
-- Actually keep it as a snapshot for charting, but the source of truth is the count
