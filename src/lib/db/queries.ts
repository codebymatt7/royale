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

export async function getDashboardStats(appId: string) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return { totalUsers: 0, newToday: 0, newThisWeek: 0 };
  }

  // Get the latest snapshot
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

  // New today: sum new_users from today's events
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayEvents } = await supabase
    .from("user_events")
    .select("new_users")
    .eq("app_id", appId)
    .gte("captured_at", todayStart.toISOString());

  const newToday = (todayEvents ?? []).reduce((sum, e) => sum + e.new_users, 0);

  // New this week
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
