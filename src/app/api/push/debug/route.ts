import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import webpush from "web-push";

export async function GET() {
  const log: string[] = [];

  try {
    // 1. Check auth
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" });
    }
    log.push(`User: ${user.id}`);

    // 2. Check VAPID
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    log.push(`VAPID public key: ${pub ? pub.slice(0, 10) + "..." : "MISSING"}`);
    log.push(`VAPID private key: ${priv ? "set (" + priv.length + " chars)" : "MISSING"}`);

    if (!pub || !priv) {
      return NextResponse.json({ log, error: "VAPID keys missing" });
    }

    // 3. Check subscriptions in DB
    const admin = createServiceRoleSupabaseClient();
    if (!admin) {
      return NextResponse.json({ log, error: "No service role client" });
    }

    const { data: subs, error: subErr } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, subscription, created_at")
      .eq("owner_id", user.id);

    if (subErr) {
      log.push(`DB error: ${subErr.message}`);
      return NextResponse.json({ log, error: subErr.message });
    }

    log.push(`Subscriptions in DB: ${subs?.length ?? 0}`);

    if (!subs || subs.length === 0) {
      log.push("NO SUBSCRIPTIONS FOUND — this is why push doesn't work");
      return NextResponse.json({ log, fix: "Click 'Enable notifications' button to subscribe" });
    }

    // 4. Try sending a test push to each subscription
    webpush.setVapidDetails("mailto:hello@royale.app", pub, priv);

    for (const row of subs) {
      const sub = row.subscription as unknown as webpush.PushSubscription;
      log.push(`Trying endpoint: ${row.endpoint.slice(0, 60)}...`);
      log.push(`Subscription keys present: ${JSON.stringify(Object.keys(sub))}`);

      try {
        const result = await webpush.sendNotification(
          sub,
          JSON.stringify({
            title: "Push test",
            body: "If you see this, push works!",
            url: "/dashboard",
          })
        );
        log.push(`SUCCESS — status ${result.statusCode}`);
      } catch (pushErr: unknown) {
        const err = pushErr as { statusCode?: number; body?: string; message?: string };
        log.push(`FAILED — status ${err.statusCode}, body: ${err.body}, message: ${err.message}`);
      }
    }

    return NextResponse.json({ log });
  } catch (err) {
    log.push(`Unexpected error: ${err}`);
    return NextResponse.json({ log, error: String(err) });
  }
}
