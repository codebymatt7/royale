import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendPushToOwner } from "@/lib/push";

/**
 * Public tracking endpoint.
 * PRIVACY: We intentionally never read the request body.
 * Supabase webhooks send user data in the body — we discard it entirely.
 * All we do is increment a counter by 1.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  // We NEVER read _request.body — no user data is processed or stored.
  const { token } = await params;

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const { data: app } = await supabase
    .from("apps")
    .select("id, owner_id, name")
    .eq("track_token", token)
    .single();

  if (!app) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const { data: prev } = await supabase
    .from("user_events")
    .select("total_users")
    .eq("app_id", app.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  const previousTotal = prev?.total_users ?? 0;
  const newTotal = previousTotal + 1;

  // Only store: app_id, count, timestamp. No user data ever.
  await supabase.from("user_events").insert({
    app_id: app.id,
    total_users: newTotal,
    new_users: 1,
  });

  await supabase.from("notifications").insert({
    app_id: app.id,
    owner_id: app.owner_id,
    type: "new_user" as const,
    title: "New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
  });

  await sendPushToOwner(app.owner_id, {
    title: "New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
    url: "/dashboard",
  });

  // Return nothing useful — just acknowledgment
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

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
