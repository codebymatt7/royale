import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import webpush from "web-push";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await request.json();

  // Use service role to write to push_subscriptions
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Upsert subscription (endpoint is unique per device)
  const { error: upsertError } = await admin.from("push_subscriptions").upsert(
    {
      owner_id: user.id,
      endpoint: subscription.endpoint,
      subscription: subscription,
    },
    { onConflict: "endpoint" },
  );

  if (upsertError) {
    console.error("Push subscription upsert failed:", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Send a welcome push immediately to confirm it works
  try {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (pub && priv) {
      webpush.setVapidDetails(
        "mailto:hello@royale.app",
        pub.replace(/=+$/, "").trim(),
        priv.replace(/=+$/, "").trim(),
      );
      await webpush.sendNotification(
        subscription as webpush.PushSubscription,
        JSON.stringify({
          title: "Notifications enabled!",
          body: "You'll get a ping every time someone signs up.",
          url: "/dashboard",
        }),
      );
    }
  } catch (pushErr) {
    console.error("Welcome push failed:", pushErr);
    // Don't fail the request — subscription is saved even if this push fails
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = await request.json();

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("owner_id", user.id);

  return NextResponse.json({ ok: true });
}
