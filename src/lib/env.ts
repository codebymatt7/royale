const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const env = {
  appUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  enableGoogleOAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "true",
};

export const hasPublicSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasServiceRoleEnv = Boolean(
  hasPublicSupabaseEnv && env.supabaseServiceRoleKey,
);

export function getBaseUrl() {
  return env.appUrl;
}
