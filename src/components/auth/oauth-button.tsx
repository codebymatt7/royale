"use client";

import { useState } from "react";
import { Globe2, LoaderCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getBaseUrl } from "@/lib/env";
import { buttonClasses } from "@/components/ui/button";

export function OAuthButton() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={buttonClasses({ variant: "secondary", className: "w-full" })}
    >
      {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Globe2 className="mr-2 h-4 w-4" />}
      Continue with Google
    </button>
  );
}
