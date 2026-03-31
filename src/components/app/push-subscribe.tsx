"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function PushSubscribe() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      // Check if already subscribed
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to our backend
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
    }
    setLoading(false);
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
    setLoading(false);
  }

  if (!supported) return null;

  return subscribed ? (
    <button
      onClick={handleUnsubscribe}
      disabled={loading}
      className={buttonClasses({ size: "sm", variant: "ghost" })}
    >
      <BellOff className="mr-2 h-3.5 w-3.5" />
      {loading ? "..." : "Notifications on"}
    </button>
  ) : (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Bell className="mr-2 h-3.5 w-3.5" />
      {loading ? "Enabling..." : "Enable notifications"}
    </button>
  );
}
