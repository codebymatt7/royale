"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function TrackingSnippet({ token, appUrl }: { token: string; appUrl: string }) {
  const [copied, setCopied] = useState(false);

  const snippet = `// Add this after a successful signup
fetch("${appUrl}/api/track/${token}", { method: "POST" })`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--ink-1)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--ink-3)]">Tracking snippet</p>
        <button onClick={handleCopy} className={buttonClasses({ size: "sm", variant: "ghost", className: "text-white/60 hover:text-white" })}>
          {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto text-sm leading-relaxed text-emerald-400">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
