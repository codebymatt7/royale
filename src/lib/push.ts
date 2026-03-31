import webpush from "web-push";
import type { PushSubscription } from "web-push";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:hello@royale.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToOwner(
  ownerId: string,
  payload: { title: string; body: string; url?: string },
) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return;

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription, endpoint")
    .eq("owner_id", ownerId);

  if (!subs || subs.length === 0) return;

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map((row) => {
      const sub = row.subscription as unknown as PushSubscription;
      return webpush.sendNotification(sub, message).catch(() => {
        // Subscription expired or invalid — clean up
        supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", row.endpoint);
      });
    }),
  );
}
