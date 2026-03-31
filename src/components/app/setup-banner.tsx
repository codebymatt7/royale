"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Webhook } from "lucide-react";

export function SetupBanner({ token, appUrl }: { token: string; appUrl: string }) {
  const [open, setOpen] = useState(true);
  const webhookUrl = `${appUrl}/api/track/${token}`;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Webhook className="h-4 w-4" />
          Set up webhook to start tracking
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-amber-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-700" />
        )}
      </button>

      {open && (
        <div className="border-t border-amber-200 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Zero code — just click through your Supabase dashboard:</p>

          <ol className="mt-3 space-y-2 text-amber-800">
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">1.</span>
              <span>
                Go to your <strong>other app&apos;s</strong> Supabase dashboard
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">2.</span>
              <span>
                Navigate to <strong>Database → Webhooks</strong>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">3.</span>
              <span>Click <strong>Create Webhook</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">4.</span>
              <span>
                Table: <strong>auth.users</strong> · Event: <strong>INSERT</strong>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">5.</span>
              <span>Type: <strong>HTTP Request</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">6.</span>
              <span>Method: <strong>POST</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold">7.</span>
              <span>Paste this URL:</span>
            </li>
          </ol>

          <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-100 p-2">
            <code className="min-w-0 flex-1 break-all text-xs font-medium text-amber-900">
              {webhookUrl}
            </code>
            <CopyBtn text={webhookUrl} />
          </div>

          <p className="mt-3 text-xs text-amber-700">
            That&apos;s it! Every time someone signs up in your app, you&apos;ll get a push notification.
          </p>
        </div>
      )}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 rounded-md bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
