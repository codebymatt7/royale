import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendPushToOwner } from "@/lib/push";

/**
 * Public tracking endpoint. No auth required.
 * Users add this one-liner to their signup flow:
 *   fetch("https://royale-indol.vercel.app/api/track/APP_TOKEN", { method: "POST" })
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Look up app by token
  const { data: app } = await supabase
    .from("apps")
    .select("id, owner_id, name")
    .eq("track_token", token)
    .single();

  if (!app) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // Get current total from last event
  const { data: prev } = await supabase
    .from("user_events")
    .select("total_users")
    .eq("app_id", app.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  const previousTotal = prev?.total_users ?? 0;
  const newTotal = previousTotal + 1;

  // Record event
  await supabase.from("user_events").insert({
    app_id: app.id,
    total_users: newTotal,
    new_users: 1,
  });

  // Create notification
  await supabase.from("notifications").insert({
    app_id: app.id,
    owner_id: app.owner_id,
    type: "new_user" as const,
    title: "New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
  });

  // Push notification
  await sendPushToOwner(app.owner_id, {
    title: "New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
    url: "/dashboard",
  });

  // CORS headers so it works from any frontend
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    },
  );
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
