import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

/**
 * Public tracking endpoint.
 * PRIVACY: We intentionally never read the request body.
 *
 * POST /api/track/{token}             → new signup (+1)
 * POST /api/track/{token}?event=delete → account deleted (-1)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const url = new URL(request.url);
    const event = url.searchParams.get("event"); // "delete" or null
    const isDelete = event === "delete";

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

    // Rate limit: ignore duplicate pings within 5 seconds (prevents spam)
    const { data: recent } = await supabase
      .from("user_events")
      .select("id")
      .eq("app_id", app.id)
      .eq("is_test", false)
      .gte("captured_at", new Date(Date.now() - 5000).toISOString())
      .limit(1);

    if (recent && recent.length > 0) {
      return new NextResponse(null, {
        status: 204,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Insert event: +1 for signup, -1 for delete
    await supabase.from("user_events").insert({
      app_id: app.id,
      total_users: 0,
      new_users: isDelete ? -1 : 1,
      is_test: false,
    });

    // Compute real total: starting_users + sum of all new_users values
    const { data: sumData } = await supabase
      .from("user_events")
      .select("new_users")
      .eq("app_id", app.id)
      .eq("is_test", false);

    const { data: appFull } = await supabase
      .from("apps")
      .select("starting_users")
      .eq("id", app.id)
      .single();

    const netEvents = (sumData ?? []).reduce((sum, row) => sum + row.new_users, 0);
    const newTotal = Math.max(0, (appFull?.starting_users ?? 0) + netEvents);

    // Notification
    const title = isDelete ? "User left" : "New user!";
    const body = isDelete
      ? `${app.name} now has ${newTotal.toLocaleString()} users`
      : `${app.name} now has ${newTotal.toLocaleString()} users`;

    await supabase.from("notifications").insert({
      app_id: app.id,
      owner_id: app.owner_id,
      type: isDelete ? "user_left" : "new_user",
      title,
      body,
    });

    // Push notification
    try {
      const { sendPushToOwner } = await import("@/lib/push");
      await sendPushToOwner(app.owner_id, { title, body, url: "/dashboard" });
    } catch {
      // Push failed — count and notification are already saved
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  } catch (err) {
    console.error("Track endpoint error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  }
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
