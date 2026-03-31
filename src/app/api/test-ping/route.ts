import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendPushToOwner } from "@/lib/push";

/**
 * Test endpoint — simulates a new user signup notification.
 * Requires auth (only the app owner can test their own app).
 */
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
    return NextResponse.json({ error: "No app found" }, { status: 404 });
  }

  // Send test push
  await sendPushToOwner(app.owner_id, {
    title: "Test notification!",
    body: `Push notifications are working for ${app.name}`,
    url: "/dashboard",
  });

  return NextResponse.json({ ok: true });
}
