import webpush from "web-push";
import type { PushSubscription } from "web-push";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

let vapidConfigured = false;

/** Strip any Base64 padding — web-push requires URL-safe Base64 without '=' */
function stripPadding(key: string) {
  return key.replace(/=+$/, "").trim();
}

function ensureVapid() {
  if (vapidConfigured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails("mailto:hello@royale.app", stripPadding(pub), stripPadding(priv));
  vapidConfigured = true;
  return true;
}

export async function sendPushToOwner(
  ownerId: string,
  payload: { title: string; body: string; url?: string },
) {
  if (!ensureVapid()) {
    console.error("[push] VAPID keys not configured");
    return;
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    console.error("[push] No supabase client");
    return;
  }

  const { data: subs, error: fetchErr } = await supabase
    .from("push_subscriptions")
    .select("subscription, endpoint")
    .eq("owner_id", ownerId);

  if (fetchErr) {
    console.error("[push] Failed to fetch subscriptions:", fetchErr.message);
    return;
  }

  if (!subs || subs.length === 0) {
    console.log("[push] No subscriptions found for owner", ownerId);
    return;
  }

  console.log(`[push] Sending to ${subs.length} subscription(s) for owner ${ownerId}`);
  const message = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subs.map((row) => {
      const sub = row.subscription as unknown as PushSubscription;
      return webpush.sendNotification(sub, message).catch((err) => {
        console.error("[push] sendNotification failed:", err);
        // Remove stale subscription
        supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", row.endpoint);
        throw err;
      });
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`[push] ${failed.length}/${results.length} push(es) failed`);
  } else {
    console.log(`[push] All ${results.length} push(es) sent successfully`);
  }
}
