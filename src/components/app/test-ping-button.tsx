"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";

export function TestPingButton({ trackToken }: { trackToken: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const router = useRouter();

  async function handleTest() {
    setStatus("sending");
    try {
      // Use relative URL — always hits the same origin
      const res = await fetch(`/api/track/${trackToken}`, { method: "POST" });
      if (res.ok || res.status === 204) {
        setStatus("sent");
        setTimeout(() => {
          router.refresh();
          setStatus("idle");
        }, 1500);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleTest}
      disabled={status === "sending"}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Zap className="mr-1.5 h-3.5 w-3.5" />
      {status === "sending"
        ? "..."
        : status === "sent"
          ? "Sent!"
          : status === "error"
            ? "Error"
            : "Test"}
    </button>
  );
}
