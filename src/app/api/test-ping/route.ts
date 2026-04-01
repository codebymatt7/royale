import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendPushToOwner } from "@/lib/push";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const { data: app } = await admin
    .from("apps")
    .select("id, owner_id, name")
    .eq("owner_id", user.id)
    .single();

  if (!app) {
    return NextResponse.json({ error: "No app found. Create one first." }, { status: 404 });
  }

  // Simulate a real signup event
  const { data: prev } = await admin
    .from("user_events")
    .select("total_users")
    .eq("app_id", app.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  const prevTotal = prev?.total_users ?? 0;
  const newTotal = prevTotal + 1;

  await admin.from("user_events").insert({
    app_id: app.id,
    total_users: newTotal,
    new_users: 1,
  });

  await admin.from("notifications").insert({
    app_id: app.id,
    owner_id: app.owner_id,
    type: "new_user" as const,
    title: "Test: New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
  });

  // Try push — won't fail if no subscription exists
  await sendPushToOwner(app.owner_id, {
    title: "Test: New user!",
    body: `${app.name} now has ${newTotal.toLocaleString()} users`,
    url: "/dashboard",
  });

  return NextResponse.json({ ok: true, totalUsers: newTotal });
}
