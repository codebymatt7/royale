import { createServiceRoleSupabaseClient, createReadonlySupabaseClient } from "@/lib/supabase/server";
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

/**
 * Real user count = starting_users + number of non-test webhook pings.
 * This is the source of truth — not a running total_users column.
 */
export async function getDashboardStats(appId: string, startingUsers: number) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return { totalUsers: startingUsers, newToday: 0, newThisWeek: 0, signupCount: 0 };
  }

  // Count all real (non-test) events
  const { count: signupCount } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .eq("is_test", false);

  const totalUsers = startingUsers + (signupCount ?? 0);

  // New today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: todayCount } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .eq("is_test", false)
    .gte("captured_at", todayStart.toISOString());

  // New this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { count: weekCount } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .eq("is_test", false)
    .gte("captured_at", weekStart.toISOString());

  return {
    totalUsers,
    newToday: todayCount ?? 0,
    newThisWeek: weekCount ?? 0,
    signupCount: signupCount ?? 0,
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
    .select("captured_at")
    .eq("app_id", appId)
    .eq("is_test", false)
    .gte("captured_at", since.toISOString())
    .order("captured_at", { ascending: true });

  if (!data || data.length === 0) return [];

  // Build running total series
  let runningTotal = startingUsers;

  // Count events before this window to get correct starting point
  const { count: priorCount } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .eq("is_test", false)
    .lt("captured_at", since.toISOString());

  runningTotal += priorCount ?? 0;

  return data.map((event) => {
    runningTotal += 1;
    return {
      total_users: runningTotal,
      new_users: 1,
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
    const { count } = await supabase
      .from("user_events")
      .select("id", { count: "exact", head: true })
      .eq("app_id", app.id)
      .eq("is_test", false);

    leaderboard.push({
      id: app.id,
      name: app.name,
      logoUrl: app.logo_url,
      bio: app.bio,
      instagram: app.instagram,
      tiktok: app.tiktok,
      xHandle: app.x_handle,
      totalUsers: app.starting_users + (count ?? 0),
    });
  }

  leaderboard.sort((a, b) => b.totalUsers - a.totalUsers);
  return leaderboard;
}
