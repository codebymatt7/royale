"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types";

let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserSupabaseClient() {
  if (!hasPublicSupabaseEnv) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
}
