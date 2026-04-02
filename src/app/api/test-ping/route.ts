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

  // Insert test event — marked so it won't affect real count
  await admin.from("user_events").insert({
    app_id: app.id,
    total_users: 0,
    new_users: 1,
    is_test: true,
  });

  // Compute real total (sum-based for +1/-1 events)
  const { data: events } = await admin
    .from("user_events")
    .select("new_users")
    .eq("app_id", app.id)
    .eq("is_test", false);

  const { data: appFull } = await admin
    .from("apps")
    .select("starting_users")
    .eq("id", app.id)
    .single();

  const netEvents = (events ?? []).reduce((sum, row) => sum + row.new_users, 0);
  const realTotal = Math.max(0, (appFull?.starting_users ?? 0) + netEvents);

  await admin.from("notifications").insert({
    app_id: app.id,
    owner_id: app.owner_id,
    type: "new_user" as const,
    title: "Test: New user!",
    body: `${app.name} has ${realTotal.toLocaleString()} real users (test ping)`,
  });

  // Try push — won't fail if no subscription exists
  try {
    await sendPushToOwner(app.owner_id, {
      title: "Test: New user!",
      body: `${app.name} has ${realTotal.toLocaleString()} real users (test ping)`,
      url: "/dashboard",
    });
  } catch {
    // Push failed — that's fine
  }

  return NextResponse.json({ ok: true, totalUsers: realTotal });
}
