import Link from "next/link";
import { Users, TrendingUp, Bell, Settings } from "lucide-react";
import { PushSubscribe } from "@/components/app/push-subscribe";
import { SetupBanner } from "@/components/app/setup-banner";
import { UserChart } from "@/components/app/user-chart";
import { StatusBanner } from "@/components/ui/status-banner";
import { buttonClasses } from "@/components/ui/button";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getApp, getDashboardStats, getRecentNotifications, getUserEventsSeries, hasReceivedEvents } from "@/lib/db/queries";
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
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Set up your app</h1>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Name your app to get started. No keys needed.
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
  const events = await getUserEventsSeries(app.id, 30);
  const hasEvents = await hasReceivedEvents(app.id);
  const notifications = await getRecentNotifications(app.id, 5);
  const appUrl = env.appUrl.includes("localhost")
    ? "https://royale-indol.vercel.app"
    : env.appUrl;

  return (
    <div className="space-y-5">
      <StatusBanner
        message={params.message}
        tone={params.status === "error" ? "error" : params.status === "success" ? "success" : "info"}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold">{app.name}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PushSubscribe />
          <Link href="/dashboard/profile" className={buttonClasses({ size: "sm", variant: "ghost" })}>
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Setup banner — hidden once events come in */}
      {!hasEvents && (
        <SetupBanner token={app.track_token} appUrl={appUrl} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-3)]">
            <Users className="h-3.5 w-3.5" />
            Total
          </div>
          <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink-1)]">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-3)]">
            <TrendingUp className="h-3.5 w-3.5" />
            Today
          </div>
          <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink-1)]">
            {stats.newToday.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-3)]">
            <TrendingUp className="h-3.5 w-3.5" />
            Week
          </div>
          <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink-1)]">
            {stats.newThisWeek.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      {events.length > 1 && (
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <p className="mb-3 text-xs font-medium text-[var(--ink-3)]">Users over time</p>
          <UserChart data={events} />
        </div>
      )}

      {/* Recent alerts */}
      {notifications.length > 0 && (
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ink-1)]">
            <Bell className="h-3.5 w-3.5" />
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
                  <p className="text-xs text-[var(--ink-2)]">{n.body}</p>
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
