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

export async function getDashboardStats(appId: string) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return { totalUsers: 0, newToday: 0, newThisWeek: 0 };
  }

  const { data: latest } = await supabase
    .from("user_events")
    .select("total_users, new_users, captured_at")
    .eq("app_id", appId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  if (!latest) {
    return { totalUsers: 0, newToday: 0, newThisWeek: 0 };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayEvents } = await supabase
    .from("user_events")
    .select("new_users")
    .eq("app_id", appId)
    .gte("captured_at", todayStart.toISOString());

  const newToday = (todayEvents ?? []).reduce((sum, e) => sum + e.new_users, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: weekEvents } = await supabase
    .from("user_events")
    .select("new_users")
    .eq("app_id", appId)
    .gte("captured_at", weekStart.toISOString());

  const newThisWeek = (weekEvents ?? []).reduce((sum, e) => sum + e.new_users, 0);

  return {
    totalUsers: latest.total_users,
    newToday,
    newThisWeek,
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

export async function getUserEventsSeries(appId: string, days: number = 30) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("user_events")
    .select("total_users, new_users, captured_at")
    .eq("app_id", appId)
    .gte("captured_at", since.toISOString())
    .order("captured_at", { ascending: true });

  return data ?? [];
}

export async function hasReceivedEvents(appId: string): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return false;

  const { count } = await supabase
    .from("user_events")
    .select("id", { count: "exact", head: true })
    .eq("app_id", appId)
    .limit(1);

  return (count ?? 0) > 0;
}

export async function getLeaderboard() {
  const supabase = createReadonlySupabaseClient();
  if (!supabase) return [];

  // Get latest total_users for each app
  const { data: apps } = await supabase
    .from("apps")
    .select("id, name, logo_url, bio, instagram, tiktok, x_handle");

  if (!apps || apps.length === 0) return [];

  const serviceClient = createServiceRoleSupabaseClient();
  if (!serviceClient) return [];

  const leaderboard = [];

  for (const app of apps) {
    const { data: latest } = await serviceClient
      .from("user_events")
      .select("total_users")
      .eq("app_id", app.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .single();

    leaderboard.push({
      id: app.id,
      name: app.name,
      logoUrl: app.logo_url,
      bio: app.bio,
      instagram: app.instagram,
      tiktok: app.tiktok,
      xHandle: app.x_handle,
      totalUsers: latest?.total_users ?? 0,
    });
  }

  // Sort by user count descending
  leaderboard.sort((a, b) => b.totalUsers - a.totalUsers);

  return leaderboard;
}
