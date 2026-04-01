"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";

export function TestPingButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleTest() {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/test-ping", { method: "POST" });
      if (res.ok) {
        setStatus("sent");
        // Refresh the page to show new notification + updated count
        router.refresh();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Failed");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
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
            : "Test"}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-xs text-[var(--rose)]">{errorMsg}</p>
      )}
    </div>
  );
}
