"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [state, setState] = useState<"loading" | "unsupported" | "blocked" | "ready" | "subscribed">("loading");
  const [busy, setBusy] = useState(false);

  const checkState = useCallback(async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setState("unsupported");
        return;
      }

      // Show a helpful state if user has blocked notifications
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "ready");
    } catch {
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    checkState();
  }, [checkState]);

  async function handleSubscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert(
          permission === "denied"
            ? "Notifications are blocked. Click the lock/bell icon in your URL bar → set Notifications to Allow → then refresh."
            : "Notification permission was dismissed. Tap the button again to retry."
        );
        setBusy(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Subscribe failed");
      }

      setState("subscribed");
    } catch (err) {
      console.error("Push subscribe failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not enable notifications: ${msg}\n\nOn iOS, make sure you opened this from your Home Screen (not Safari).`);
    }
    setBusy(false);
  }

  async function handleUnsubscribe() {
    setBusy(true);
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
      setState("ready");
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
    setBusy(false);
  }

  if (state === "loading" || state === "unsupported") return null;

  if (state === "blocked") {
    return (
      <button
        type="button"
        onClick={() => alert("Notifications are blocked.\n\nClick the lock/bell icon in your URL bar → set Notifications to Allow → then refresh the page.")}
        className={buttonClasses({ size: "sm", variant: "secondary" })}
      >
        <BellOff className="mr-1.5 h-3.5 w-3.5 text-red-500" />
        Blocked
      </button>
    );
  }

  return state === "subscribed" ? (
    <button
      type="button"
      onClick={handleUnsubscribe}
      disabled={busy}
      className={buttonClasses({ size: "sm", variant: "ghost" })}
    >
      <BellOff className="mr-1.5 h-3.5 w-3.5" />
      {busy ? "..." : "On"}
    </button>
  ) : (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={busy}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Bell className="mr-1.5 h-3.5 w-3.5" />
      {busy ? "..." : "Notifications"}
    </button>
  );
}
