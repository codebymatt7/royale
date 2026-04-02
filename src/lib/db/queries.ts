import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { App, Notification } from "@/lib/types";

export async function getApp(ownerId: string): Promise<App | null> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("apps")
    .select("*")
    .eq("owner_id", ownerId)
    .single();

  return data;
}

/** Sum all new_users values (+1 for signups, -1 for deletes) */
async function getNetSignups(supabase: NonNullable<ReturnType<typeof createServiceRoleSupabaseClient>>, appId: string, since?: string) {
  const query = supabase
    .from("user_events")
    .select("new_users")
    .eq("app_id", appId)
    .eq("is_test", false);

  if (since) query.gte("captured_at", since);

  const { data } = await query;
  return (data ?? []).reduce((sum, row) => sum + row.new_users, 0);
}

/**
 * Real user count = starting_users + net signups (signups minus deletes).
 */
export async function getDashboardStats(appId: string, startingUsers: number) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return { totalUsers: startingUsers, newToday: 0, newThisWeek: 0, signupCount: 0 };
  }

  // Net total (all time)
  const netAll = await getNetSignups(supabase, appId);
  const totalUsers = Math.max(0, startingUsers + netAll);

  // New today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const netToday = await getNetSignups(supabase, appId, todayStart.toISOString());

  // New this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const netWeek = await getNetSignups(supabase, appId, weekStart.toISOString());

  return {
    totalUsers,
    newToday: netToday,
    newThisWeek: netWeek,
    signupCount: netAll,
  };
}

export async function getRecentNotifications(appId: string, limit: number): Promise<Notification[]> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("app_id", appId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getUserEventsSeries(appId: string, startingUsers: number, days: number = 30) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all non-test events ordered by time
  const { data } = await supabase
    .from("user_events")
    .select("new_users, captured_at")
    .eq("app_id", appId)
    .eq("is_test", false)
    .gte("captured_at", since.toISOString())
    .order("captured_at", { ascending: true });

  if (!data || data.length === 0) return [];

  // Count net events before this window to get correct starting point
  const priorNet = await getNetSignups(supabase, appId, undefined);
  const windowNet = (data).reduce((sum, row) => sum + row.new_users, 0);
  let runningTotal = Math.max(0, startingUsers + priorNet - windowNet);

  return data.map((event) => {
    runningTotal = Math.max(0, runningTotal + event.new_users);
    return {
      total_users: runningTotal,
      new_users: event.new_users,
      captured_at: event.captured_at,
    };
  });
}

export async function hasReceivedEvents(appId: string): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return false;

  const { count } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .eq("is_test", false)
    .limit(1);

  return (count ?? 0) > 0;
}

export async function getLeaderboard() {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];

  const { data: apps } = await supabase
    .from("apps")
    .select("id, name, logo_url, bio, instagram, tiktok, x_handle, starting_users");

  if (!apps || apps.length === 0) return [];

  const leaderboard = [];

  for (const app of apps) {
    const net = await getNetSignups(supabase, app.id);
    leaderboard.push({
      id: app.id,
      name: app.name,
      logoUrl: app.logo_url,
      bio: app.bio,
      instagram: app.instagram,
      tiktok: app.tiktok,
      xHandle: app.x_handle,
      totalUsers: Math.max(0, app.starting_users + net),
    });
  }

  leaderboard.sort((a, b) => b.totalUsers - a.totalUsers);
  return leaderboard;
}
