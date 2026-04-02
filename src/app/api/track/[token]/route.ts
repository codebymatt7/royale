import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

/**
 * Public tracking endpoint.
 * PRIVACY: We intentionally never read the request body.
 * All we do is increment a counter by 1.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    console.log(`[track] Received ping for token: ${token.slice(0, 8)}...`);

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

    // Insert the event (not a test)
    await supabase.from("user_events").insert({
      app_id: app.id,
      total_users: 0, // legacy column, ignored by new count model
      new_users: 1,
      is_test: false,
    });

    // Compute real total for notification text
    const { count: realCount } = await supabase
      .from("user_events")
      .select("id", { count: "exact", head: true })
      .eq("app_id", app.id)
      .eq("is_test", false);

    const { data: appFull } = await supabase
      .from("apps")
      .select("starting_users")
      .eq("id", app.id)
      .single();

    const newTotal = (appFull?.starting_users ?? 0) + (realCount ?? 0);

    await supabase.from("notifications").insert({
      app_id: app.id,
      owner_id: app.owner_id,
      type: "new_user" as const,
      title: "New user!",
      body: `${app.name} now has ${newTotal.toLocaleString()} users`,
    });

    // Push notification — dynamic import so web-push can't crash the route
    try {
      const { sendPushToOwner } = await import("@/lib/push");
      await sendPushToOwner(app.owner_id, {
        title: "New user!",
        body: `${app.name} now has ${newTotal.toLocaleString()} users`,
        url: "/dashboard",
      });
    } catch {
      // Push failed — that's fine, the count and notification are already saved
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
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
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
