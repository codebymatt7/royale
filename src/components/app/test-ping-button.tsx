"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function TestPingButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleTest() {
    setStatus("sending");
    try {
      const res = await fetch("/api/test-ping", { method: "POST" });
      if (res.ok) {
        setStatus("sent");
        setTimeout(() => setStatus("idle"), 3000);
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
      onClick={handleTest}
      disabled={status === "sending"}
      className={buttonClasses({ size: "sm", variant: "secondary" })}
    >
      <Zap className="mr-1.5 h-3.5 w-3.5" />
      {status === "sending"
        ? "Sending..."
        : status === "sent"
          ? "Sent!"
          : status === "error"
            ? "Failed"
            : "Test notification"}
    </button>
  );
}
