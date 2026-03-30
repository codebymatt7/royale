import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendPushToOwner } from "@/lib/push";
import { env } from "@/lib/env";

/**
 * Vercel Cron — runs every 30 minutes.
 * Polls every connected app's Supabase for user count,
 * records the event, and sends push if there are new users.
 */
export async function GET(request: Request) {
  // Vercel cron sends this header automatically
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  // Get all connected apps
  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .not("supabase_url", "is", null)
    .not("supabase_service_role_key", "is", null);

  if (!apps || apps.length === 0) {
    return NextResponse.json({ ok: true, message: "No apps to poll" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const results = [];

  for (const app of apps) {
    try {
      const trackedSupabase = createClient(app.supabase_url!, app.supabase_service_role_key!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const result = await trackedSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (result.error) {
        results.push({ app_id: app.id, error: result.error.message });
        continue;
      }

      const totalUsers: number = (result.data as { total: number }).total ?? 0;

      // Get previous count
      const { data: prev } = await supabase
        .from("user_events")
        .select("total_users")
        .eq("app_id", app.id)
        .order("captured_at", { ascending: false })
        .limit(1)
        .single();

      const previousTotal = prev?.total_users ?? 0;
      const newUsers = Math.max(0, totalUsers - previousTotal);

      // Always record the snapshot
      await supabase.from("user_events").insert({
        app_id: app.id,
        total_users: totalUsers,
        new_users: newUsers,
      });

      // Notify if new users
      if (newUsers > 0) {
        const title = newUsers === 1 ? "New user!" : `${newUsers} new users!`;
        const body = `Total users: ${totalUsers.toLocaleString()}`;

        await supabase.from("notifications").insert({
          app_id: app.id,
          owner_id: app.owner_id,
          type: "new_user" as const,
          title,
          body,
        });

        await sendPushToOwner(app.owner_id, { title, body, url: "/dashboard" });
      }

      results.push({ app_id: app.id, totalUsers, newUsers });
    } catch (err) {
      results.push({ app_id: app.id, error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
