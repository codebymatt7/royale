import Link from "next/link";
import { Users, TrendingUp, Bell, Code } from "lucide-react";
import { PushSubscribe } from "@/components/app/push-subscribe";
import { TrackingSnippet } from "@/components/app/tracking-snippet";
import { StatusBanner } from "@/components/ui/status-banner";
import { buttonClasses } from "@/components/ui/button";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getApp, getDashboardStats, getRecentNotifications } from "@/lib/db/queries";
import { env } from "@/lib/env";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const app = await getApp(user.id);
  const params = await searchParams;

  if (!app) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Set up your app</h1>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Name your app to get a tracking snippet. No keys needed.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/connect" className={buttonClasses({ size: "md" })}>
            Get started
          </Link>
        </div>
      </div>
    );
  }

  const stats = await getDashboardStats(app.id);
  const notifications = await getRecentNotifications(app.id, 5);
  const appUrl = env.appUrl.includes("localhost")
    ? "https://royale-indol.vercel.app"
    : env.appUrl;

  return (
    <div className="space-y-6">
      <StatusBanner
        message={params.message}
        tone={params.status === "error" ? "error" : params.status === "success" ? "success" : "info"}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-semibold">{app.name}</h1>
          <p className="text-sm text-[var(--ink-2)]">User growth dashboard</p>
        </div>
        <PushSubscribe />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-3)]">
            <Users className="h-4 w-4" />
            Total Users
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink-1)]">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-3)]">
            <TrendingUp className="h-4 w-4" />
            New Today
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink-1)]">
            {stats.newToday.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-3)]">
            <TrendingUp className="h-4 w-4" />
            New This Week
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink-1)]">
            {stats.newThisWeek.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tracking snippet */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
          <Code className="h-4 w-4" />
          Tracking Snippet
        </h2>
        <TrackingSnippet token={app.track_token} appUrl={appUrl} />
        <p className="mt-2 text-xs text-[var(--ink-3)]">
          Add this one line after your signup handler. Every call = one new user tracked.
        </p>
      </div>

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Bell className="h-4 w-4" />
            Recent Alerts
          </h2>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--ink-1)]">{n.title}</p>
                  <p className="text-sm text-[var(--ink-2)]">{n.body}</p>
                </div>
                <time className="shrink-0 text-xs text-[var(--ink-3)]">
                  {new Date(n.created_at).toLocaleDateString()}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
