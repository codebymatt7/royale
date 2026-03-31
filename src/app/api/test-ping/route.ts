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

  // Check if user has any push subscriptions
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "Enable notifications first, then try again." },
      { status: 400 },
    );
  }

  await sendPushToOwner(app.owner_id, {
    title: "Test notification!",
    body: `Push notifications are working for ${app.name}`,
    url: "/dashboard",
  });

  return NextResponse.json({ ok: true });
}
