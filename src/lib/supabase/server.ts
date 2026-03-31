import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import type { Database } from "@/lib/types";

export async function createServerSupabaseClient() {
  if (!hasPublicSupabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies; middleware handles refresh persistence.
        }
      },
    },
  });
}

export function createReadonlySupabaseClient() {
  if (!hasPublicSupabaseEnv) {
    return null;
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServiceRoleSupabaseClient() {
  if (!hasServiceRoleEnv) {
    return null;
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
