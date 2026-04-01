"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
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
  const [state, setState] = useState<"loading" | "unsupported" | "blocked" | "needs_sub" | "subscribed">("loading");
  const [busy, setBusy] = useState(false);

  const checkAndSync = useCallback(async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setState("unsupported");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();

      if (!existingSub) {
        // No subscription at all
        setState("needs_sub");
        return;
      }

      // We have a browser subscription — sync it to DB
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingSub.toJSON()),
      });

      if (res.ok) {
        setState("subscribed");
      } else {
        // DB save failed — old key? Nuke and re-create
        await existingSub.unsubscribe();
        setState("needs_sub");
      }
    } catch {
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    checkAndSync();
  }, [checkAndSync]);

  async function handleSubscribe() {
    setBusy(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert(
          permission === "denied"
            ? "Notifications are blocked.\n\nClick the lock/bell icon in your URL bar → set Notifications to Allow → then refresh."
            : "Notification permission was dismissed. Tap the button again to retry."
        );
        setState(permission === "denied" ? "blocked" : "needs_sub");
        setBusy(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

      // Kill any existing subscription first
      const oldSub = await reg.pushManager.getSubscription();
      if (oldSub) await oldSub.unsubscribe();

      // Create fresh subscription with current VAPID key
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save to DB
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save subscription");
      }

      setState("subscribed");
    } catch (err) {
      console.error("Push subscribe failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not enable notifications: ${msg}\n\nOn iOS, make sure you opened this from your Home Screen (not Safari).`);
    }
    setBusy(false);
  }

  if (state === "loading" || state === "unsupported" || state === "subscribed") return null;

  if (state === "blocked") {
    return (
      <button
        type="button"
        onClick={() => alert("Notifications are blocked.\n\nClick the lock/bell icon in your URL bar → set Notifications to Allow → then refresh the page.")}
        className={buttonClasses({ size: "sm", variant: "secondary" })}
      >
        <Bell className="mr-1.5 h-3.5 w-3.5 text-red-500" />
        Blocked
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={busy}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Bell className="mr-1.5 h-3.5 w-3.5" />
      {busy ? "Enabling..." : "Enable notifications"}
    </button>
  );
}
