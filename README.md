# Startup Royale

Startup Royale is a production-style MVP for public startup traction tracking. Founders create one startup profile, connect live metrics, store snapshots, get sorted into category-based leagues, and appear on public metric leaderboards.

## What is included

- Public landing page
- Email/password auth with Supabase Auth
- Optional Google OAuth scaffold
- Authenticated onboarding flow
- Startup profile creation and editing
- Connect Metrics page
- Dashboard with snapshot charts and ranking previews
- Public startup profile page
- Public leaderboards filtered by metric + category
- Public leagues page
- In-app notifications
- Vercel-friendly scheduled refresh route

## V1 metric rules

- `Users`: Supabase `auth.users` count from a connected Supabase project
- `Revenue`: trailing 30-day Stripe successful charge volume, stored in USD cents
- `Traffic`: trailing 30-day GA4 sessions
- No manual entry
- A startup only appears on a leaderboard for metrics that are actually connected

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth + Postgres + Storage
- Stripe
- Google Analytics Data API

## Project structure

```text
src/
  app/
    (auth)/login
    (auth)/signup
    (app)/dashboard
    (app)/dashboard/connect
    (app)/notifications
    (app)/onboarding
    (app)/settings
    auth/callback
    api/cron/refresh
    leaderboards
    leagues
    startups/[slug]
  components/
    app/
    auth/
    public/
    ui/
  lib/
    actions/
    db/
    metrics/
    supabase/
supabase/
  migrations/
  seed.sql
```

## Environment variables

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

Optional:

- `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and enable email/password auth.

3. Apply the SQL migration in [supabase/migrations/20250329190000_startup_royale_init.sql](/Users/mattn/Desktop/Startup Royale/supabase/migrations/20250329190000_startup_royale_init.sql).

4. Optionally run [supabase/seed.sql](/Users/mattn/Desktop/Startup Royale/supabase/seed.sql) for public demo startups and leaderboard data.

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Supabase notes

- The migration creates:
  - tables for profiles, startups, integrations, snapshots, leaderboard cache, leagues, and notifications
  - RLS policies
  - a public `startup-logos` storage bucket
  - a trigger that creates `public.profiles` rows on `auth.users` inserts
  - `refresh_leaderboard_cache()` for cached leaderboard rebuilds

- The app expects `SUPABASE_SERVICE_ROLE_KEY` on the server for:
  - scheduled metric refresh
  - writing snapshots
  - rebuilding leaderboard cache
  - league updates

## Scheduled refresh

The route [src/app/api/cron/refresh/route.ts](/Users/mattn/Desktop/Startup Royale/src/app/api/cron/refresh/route.ts) is designed for Vercel Cron or any external scheduler.

Example request:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/refresh
```

Recommended cadence for V1: every `30-60` minutes.

## Stripe and GA integration expectations

- Stripe:
  - V1 currently assumes USD Stripe accounts for leaderboard comparability.
  - Revenue is based on trailing 30-day successful charges.

- Google Analytics:
  - Use a GA4 property ID.
  - Use a service account with `analytics.readonly`.

- Supabase users:
  - Provide the external project URL and service role key.
  - The current implementation counts `auth.users`.

## Demo mode

Set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` to keep public pages visually populated even before a real Supabase setup is complete. Authenticated flows still require real Supabase env vars.

## Useful scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Intentional V1 TODOs

- Encrypt third-party integration credentials instead of storing them in raw `jsonb`
- Add richer secret management and credential rotation
- Support additional user-table sources beyond Supabase `auth.users`
- Improve multi-currency Stripe handling
- Add more granular notification preferences
- Add stronger background job isolation instead of route-triggered refresh orchestration
