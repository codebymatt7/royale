# Royale — Lean Plan

## What it is
A simple alert + dashboard app for consumer app builders. Connect your Supabase project, get notified when users sign up, see your growth numbers.

## V1 (current)
- **Auth**: Email/password signup + login (Supabase Auth)
- **Connect**: Enter your app's Supabase URL + service role key
- **Dashboard**: Total users, new today, new this week, recent alerts
- **Webhook**: `/api/webhooks/new-user` — polls your app's Supabase for user count, creates notifications on new signups
- **Notifications**: In-app alerts stored in DB

## V2 (next)
- Cron job to auto-poll user counts every 15 min
- Slack/Discord webhook integration for alerts
- Email notifications
- User growth chart over time
- Multiple apps per account

## V3 (later)
- Brackets/rankings (compete by size tier)
- Growth experiments tracker
- Traction channel playbooks
- Public rankings page

## Tech Stack
- Next.js 16 + React 19
- Supabase (auth, database, RLS)
- Tailwind CSS 4
- Vercel (deploy)

## Schema (4 tables)
- `profiles` — auto-created on signup
- `apps` — one per user, stores connected Supabase credentials
- `user_events` — time-series of total_users + new_users
- `notifications` — new user alerts, milestone alerts
