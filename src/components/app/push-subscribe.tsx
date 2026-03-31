"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSubscribe() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;
    if (!("serviceWorker" in navigator)) return;

    // Wait for SW to actually be ready
    navigator.serviceWorker.ready.then((reg) => {
      setSwReady(true);
      if ("PushManager" in window) {
        setSupported(true);
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      }
    });
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID key not configured");

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error("Subscribe API failed");

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
      alert("Could not enable notifications. On iOS, you need to add this app to your home screen first.");
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

  // Don't show until SW is ready and push is supported
  if (!swReady || !supported) return null;

  return subscribed ? (
    <button
      type="button"
      onClick={handleUnsubscribe}
      disabled={loading}
      className={buttonClasses({ size: "sm", variant: "ghost" })}
    >
      <BellOff className="mr-1.5 h-3.5 w-3.5" />
      {loading ? "..." : "On"}
    </button>
  ) : (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Bell className="mr-1.5 h-3.5 w-3.5" />
      {loading ? "Enabling..." : "Notifications"}
    </button>
  );
}
